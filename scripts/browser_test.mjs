import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
      res.on("error", reject);
    });
  });
}

async function postJson(host, port, path, postData) {
  return new Promise((resolve, reject) => {
    const dataStr = new URLSearchParams(postData).toString();
    const req = http.request(
      {
        host,
        port,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(dataStr),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          const cookieHeader = res.headers["set-cookie"];
          let sid = "";
          if (cookieHeader) {
            cookieHeader.forEach((c) => {
              if (c.includes("sid=")) {
                const match = c.match(/sid=([^;]+)/);
                if (match) sid = match[1];
              }
            });
          }
          resolve({ status: res.statusCode, body, sid });
        });
      }
    );
    req.on("error", reject);
    req.write(dataStr);
    req.end();
  });
}

async function run() {
  console.log("1. Logging into Frappe as Administrator...");
  const loginRes = await postJson("localhost", 8000, "/api/method/login", {
    usr: "Administrator",
    pwd: "admin",
  });
  console.log("Login HTTP Status:", loginRes.status, "SID:", loginRes.sid);

  console.log("2. Spawning dedicated headless Chrome on port 9333...");
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = `C:\\Users\\gavie\\AppData\\Local\\Temp\\chrome_prof_${Date.now()}`;
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9333",
    `--user-data-dir=${tempProfile}`,
    "--disable-gpu",
    "--no-sandbox",
    "about:blank",
  ]);

  process.on("exit", () => {
    try { chromeProc.kill(); } catch (e) {}
  });

  let targets = null;
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      targets = await getJson("http://localhost:9333/json");
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  if (!targets) {
    throw new Error("Failed to connect to Chrome on port 9333 after 7.5s");
  }

  const target = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl) || targets[0];
  if (!target || !target.webSocketDebuggerUrl) {
    throw new Error("No page target found on Chrome DevTools port 9333");
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const consoleLogs = [];
  const uncaughtErrors = [];
  const networkErrors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) cb.reject(msg.error);
      else cb.resolve(msg.result);
      return;
    }

    if (msg.method === "Runtime.consoleAPICalled") {
      const text = msg.params.args.map((a) => a.value || JSON.stringify(a)).join(" ");
      consoleLogs.push({ type: msg.params.type, text });
      if (msg.params.type === "error") {
        console.error("  [BROWSER CONSOLE ERROR]:", text);
      } else {
        console.log(`  [BROWSER CONSOLE ${msg.params.type.toUpperCase()}]:`, text);
      }
    } else if (msg.method === "Runtime.exceptionThrown") {
      const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
      uncaughtErrors.push(desc);
      console.error("  [UNCAUGHT JS EXCEPTION]:", desc);
    } else if (msg.method === "Network.responseReceived") {
      const res = msg.params.response;
      if (res.status >= 400 && !res.url.includes("favicon")) {
        networkErrors.push({ url: res.url, status: res.status });
        console.error(`  [NETWORK FAIL ${res.status}]:`, res.url);
      }
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));
  console.log("WebSocket connected to Chrome.");

  await send("Network.enable");
  await send("Page.enable");
  await send("Runtime.enable");

  // Set auth cookie
  await send("Network.setCookie", {
    name: "sid",
    value: loginRes.sid,
    domain: "localhost",
    path: "/",
  });

  // Set window size
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1600,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log("3. Navigating to http://localhost:8000/app/project-studio...");
  await send("Page.navigate", { url: "http://localhost:8000/app/project-studio" });

  console.log("Waiting 6 seconds for page and bundle initialization...");
  await new Promise((r) => setTimeout(r, 6000));

  // Evaluate DOM
  const evalRes = await send("Runtime.evaluate", {
    expression: `(() => {
      return {
        url: window.location.href,
        hasRoot: !!document.querySelector('#project-studio-root'),
        hasSidebar: !!document.querySelector('.studio-sidebar'),
        hasHeader: !!document.querySelector('.studio-header'),
        activeTab: document.querySelector('.studio-sidebar-nav .active')?.dataset?.tab,
        renderedTabsCount: document.querySelectorAll('.studio-tab-view').length,
        visibleViews: Array.from(document.querySelectorAll('.studio-tab-view')).filter(e => e.style.display !== 'none' && !e.classList.contains('hidden')).map(e => e.id),
        curProjectStudioExists: !!window.curProjectStudio,
        projectsCount: document.querySelectorAll('.project-row').length,
        documentFoldersCount: document.querySelectorAll('.doc-folder-card').length,
      };
    })()`,
    returnByValue: true,
  });

  console.log("======================================================================");
  console.log("DOM INSPECTION RESULT:", JSON.stringify(evalRes.result.value, null, 2));
  console.log("======================================================================");

  // Take screenshot
  const shot = await send("Page.captureScreenshot", { format: "png" });
  const shotBuffer = Buffer.from(shot.data, "base64");
  const shotPath = "C:/Users/gavie/.gemini/antigravity/brain/2dd394fd-82af-44f8-b50d-5723a4284a51/browser_test_initial.png";
  fs.writeFileSync(shotPath, shotBuffer);
  console.log("Screenshot saved to:", shotPath);

  // Test clicking all project tabs
  const tabsToClick = [
    "home",
    "work-packages",
    "boards",
    "gantt",
    "bcf",
    "cad",
    "pdf",
    "documents",
    "meetings",
    "members",
    "settings"
  ];
  for (const tab of tabsToClick) {
    console.log(`Testing click on tab [${tab}]...`);
    const clickRes = await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = document.querySelector(\`.studio-nav-list [data-tab="${tab}"]\`);
        if (btn) {
          btn.click();
          return { clicked: true };
        }
        return { clicked: false, error: 'Button not found' };
      })()`,
      returnByValue: true,
    });
    await new Promise((r) => setTimeout(r, 1500));
    const checkView = await send("Runtime.evaluate", {
      expression: `(() => {
        const activeViews = Array.from(document.querySelectorAll('.studio-tab-view')).filter(e => e.style.display !== 'none' && !e.classList.contains('hidden')).map(e => e.id);
        return { activeTab: '${tab}', activeViews };
      })()`,
      returnByValue: true,
    });
    console.log(`Tab [${tab}] transition:`, JSON.stringify(checkView.result.value));
    const tabShot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`C:/Users/gavie/.gemini/antigravity/brain/2dd394fd-82af-44f8-b50d-5723a4284a51/tab_${tab}.png`, Buffer.from(tabShot.data, "base64"));
  }

  // Test navigating to All Projects (Hub) via project switcher
  console.log("Testing click on [all-projects] in switcher...");
  await send("Runtime.evaluate", {
    expression: `(() => {
      const allLink = document.querySelector('#project-switcher-list [data-project="all"]');
      if (allLink) allLink.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1500));
  const allProjShot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("C:/Users/gavie/.gemini/antigravity/brain/2dd394fd-82af-44f8-b50d-5723a4284a51/tab_all-projects.png", Buffer.from(allProjShot.data, "base64"));

  // Test Quick Create (+) Task modal
  console.log("Testing Quick Create (+) Task modal...");
  await send("Runtime.evaluate", {
    expression: `(() => {
      const btn = document.querySelector('.action-quick-add[data-type="TASK"]');
      if (btn) btn.click();
    })()`,
  });
  await new Promise((r) => setTimeout(r, 1000));
  const quickCreateShot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("C:/Users/gavie/.gemini/antigravity/brain/2dd394fd-82af-44f8-b50d-5723a4284a51/modal_quick_create.png", Buffer.from(quickCreateShot.data, "base64"));

  const finalShot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("C:/Users/gavie/.gemini/antigravity/brain/2dd394fd-82af-44f8-b50d-5723a4284a51/browser_test_final.png", Buffer.from(finalShot.data, "base64"));

  console.log("======================================================================");
  console.log("SUMMARY:");
  console.log(`  Console errors: ${consoleLogs.filter((l) => l.type === "error").length}`);
  console.log(`  Uncaught errors: ${uncaughtErrors.length}`);
  console.log(`  Network errors (HTTP >= 400): ${networkErrors.length}`);
  console.log("======================================================================");

  ws.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("FATAL ERROR in browser test runner:", err);
  process.exit(1);
});