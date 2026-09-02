(() => {
  // ../bim_viewer_app.js
  var ENGINE = window.IFCEngine;
  var WebIFC = window.WebIFC;
  if (!ENGINE || !WebIFC) throw new Error("IFCEngine not loaded (webifc-api-iife.js + webifc.bundle.js must load first)");
  var THREE = ENGINE.THREE;
  var OrbitControls = ENGINE.OrbitControls;
  var buildIfcScene = ENGINE.buildIfcScene;
  var API = {
    list_models: "construction_bim.bim.api.list_models",
    get_model: "construction_bim.bim.api.get_model",
    list_elements: "construction_bim.bim.api.list_elements",
    get_element: "construction_bim.bim.api.get_element",
    create_model: "construction_bim.bim.api.create_model_from_ifc",
    create_boq_link: "construction_bim.bim.api.create_boq_link",
    delete_boq_link: "construction_bim.bim.api.delete_boq_link",
    list_boq_links: "construction_bim.bim.api.list_boq_links",
    save_viewpoint: "construction_bim.bim.api.save_viewpoint",
    list_viewpoints: "construction_bim.bim.api.list_viewpoints",
    delete_viewpoint: "construction_bim.bim.api.delete_viewpoint"
  };
  var els = {
    models: document.getElementById("bim-models"),
    upload: document.getElementById("bim-upload"),
    fileInput: document.getElementById("bim-file-input"),
    canvas: document.getElementById("bim-canvas"),
    status: document.getElementById("bim-status"),
    loading: document.getElementById("bim-loading"),
    props: document.getElementById("bim-props"),
    propsTitle: document.getElementById("bim-element-title"),
    links: document.getElementById("bim-links"),
    viewpoints: document.getElementById("bim-viewpoints"),
    vpName: document.getElementById("vp-name"),
    fDiscipline: document.getElementById("f-discipline"),
    fStorey: document.getElementById("f-storey"),
    fType: document.getElementById("f-type"),
    fSearch: document.getElementById("f-search")
  };
  var renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(1316893);
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5e3);
  camera.position.set(20, 15, 25);
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  scene.add(new THREE.HemisphereLight(16777215, 4473941, 1));
  var keyLight = new THREE.DirectionalLight(16777215, 1.2);
  keyLight.position.set(30, 50, 20);
  scene.add(keyLight);
  var grid = new THREE.GridHelper(100, 20, 3818064, 2764856);
  grid.position.y = -0.02;
  scene.add(grid);
  var modelGroup = null;
  var elementMeshes = [];
  var elementIndex = /* @__PURE__ */ new Map();
  var currentModel = null;
  var currentSelection = null;
  var activeTool = "orbit";
  var clipBox = null;
  var wireframeMode = false;
  var ifcApi = null;
  var currentModelId = null;
  var highlightMat = new THREE.MeshStandardMaterial({ color: 16765286, emissive: 6700288, emissiveIntensity: 0.35 });
  function resize() {
    const w = els.canvas.clientWidth || 800, h = els.canvas.clientHeight || 600;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  if (window._bimViewerAnimId) {
    cancelAnimationFrame(window._bimViewerAnimId);
    window._bimViewerAnimId = null;
  }
  function animate() {
    window._bimViewerAnimId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
  function setStatus(msg) {
    els.status.textContent = msg;
  }
  function showLoading(msg, on) {
    els.loading.style.display = on ? "flex" : "none";
    if (on) els.loading.textContent = msg;
  }
  async function loadModels() {
    setStatus("Loading models\u2026");
    try {
      const res = await frappe.call({ method: API.list_models });
      const models = res.message || [];
      setStatus("Models API returned " + models.length + " models");
      els.models.innerHTML = "";
      if (!models.length) {
        els.models.innerHTML = '<div class="empty-hint">No models yet</div>';
        return;
      }
      models.forEach((m) => {
        const d = document.createElement("button");
        d.type = "button";
        d.className = "bim-model-item" + (currentModel && currentModel.name === m.name ? " active" : "");
        d.innerHTML = `<span>${m.model_name}</span><span class="cnt">${m.element_count} el</span>`;
        d.onclick = () => selectModel(m.name);
        els.models.appendChild(d);
      });
    } catch (e) {
      setStatus("loadModels failed: " + (e && (e.message || JSON.stringify(e))));
    }
  }
  async function selectModel(name) {
    setStatus("selectModel called for " + name);
    showLoading("Loading model\u2026", true);
    try {
      const res = await frappe.call({ method: API.get_model, args: { model: name } });
      currentModel = res.message;
      clearSelection();
      await loadGeometry(name);
      await loadElements(name);
      populateFacets();
      fitView();
      loadViewpoints();
      setStatus(`${currentModel.model_name} \u2014 ${currentModel.element_count} elements`);
      document.querySelectorAll(".bim-model-item").forEach((el) => el.classList.toggle("active", el.textContent.includes(currentModel.model_name)));
    } catch (e) {
      setStatus("Failed to load model: " + (e._server_messages ? JSON.parse(e._server_messages)[0] : e.message));
    } finally {
      showLoading("", false);
    }
  }
  async function getIfcApi() {
    if (ifcApi) return ifcApi;
    const api = new WebIFC.IfcAPI();
    api.SetWasmPath("/assets/construction_bim/js/webifc/", true);
    await api.Init();
    ifcApi = api;
    return api;
  }
  async function loadGeometry(name) {
    if (modelGroup) {
      scene.remove(modelGroup);
      disposeGroup(modelGroup);
      modelGroup = null;
      elementMeshes = [];
    }
    const res = await frappe.call({ method: API.get_model, args: { model: name } });
    const ifcUrl = res.message.original_file;
    if (!ifcUrl) {
      setStatus("Model has no original IFC file");
      return;
    }
    const abs = ifcUrl.startsWith("/") ? ifcUrl : "/" + ifcUrl;
    try {
      showLoading("Downloading IFC\u2026", true);
      const resp = await fetch(abs);
      if (!resp.ok) {
        setStatus("IFC fetch failed: " + resp.status);
        return;
      }
      const buf = new Uint8Array(await resp.arrayBuffer());
      showLoading("Parsing IFC\u2026 (" + (buf.length / 1e6).toFixed(1) + " MB)", true);
      const api = await getIfcApi();
      currentModelId = api.OpenModel(buf, { COORDINATE_TO_ORIGIN: true, USE_FAST_BVH: true });
      showLoading("Building scene\u2026", true);
      const result = buildIfcScene(api, currentModelId);
      modelGroup = result.group;
      scene.add(modelGroup);
      elementMeshes = [];
      result.expressMap.forEach((meshes, expressID) => {
        meshes.forEach((m) => elementMeshes.push({ mesh: m, expressID }));
      });
      setStatus(`web-ifc parsed: ${result.meshCount.total} meshes, ${result.meshCount.tris} tris`);
    } catch (e) {
      setStatus("web-ifc geometry load failed: " + (e.message || e));
    }
  }
  function disposeGroup(group) {
    group.traverse((o) => {
      if (o.isMesh) {
        if (o.geometry) o.geometry.dispose();
        if (o.material && o.material !== highlightMat) o.material.dispose();
      }
    });
  }
  async function loadElements(name) {
    const res = await frappe.call({ method: API.list_elements, args: { model: name, filters: "{}", limit: 2e4 } });
    const data = res.message;
    elementIndex = /* @__PURE__ */ new Map();
    (data.elements || []).forEach((el) => {
      const ifc_id = el.stable_id;
      elementIndex.set(el.mesh_ref.replace("e", ""), el);
      elementIndex.set(el.name, el);
    });
  }
  function getExpressIdAt(geometry, faceIndex) {
    const attr = geometry.attributes.expressID;
    if (!attr || faceIndex === void 0 || faceIndex === null) return null;
    const id = attr.getX(faceIndex);
    if (id !== void 0 && id !== 0) return id;
    return attr.getX(Math.min(faceIndex, attr.count - 1));
  }
  function clearSelection() {
    currentSelection = null;
    els.props.innerHTML = '<div class="empty-hint">No selection</div>';
    els.propsTitle.textContent = "Click an element in the viewer";
    els.propsTitle.className = "empty-hint";
    els.links.innerHTML = '<div class="empty-hint">No links</div>';
    elementMeshes.forEach(({ mesh }) => {
      if (mesh.userData.origColor) {
        mesh.material.color.copy(mesh.userData.origColor);
      }
      mesh.material.emissive && mesh.material.emissive.setHex(0);
    });
  }
  async function selectElement(mesh, expressID) {
    clearSelection();
    let el = expressID && (elementIndex.get(String(expressID)) || elementIndex.get(expressID));
    if (!el) el = mesh.userData.element || null;
    currentSelection = { mesh, element: el, expressID };
    if (!mesh.userData.origColor) mesh.userData.origColor = mesh.material.color.clone();
    mesh.material.color.copy(highlightMat.color);
    mesh.material.emissive && mesh.material.emissive.copy(highlightMat.emissive);
    if (el) {
      renderElementPanel(el);
      if (!el.properties || !Object.keys(el.properties).length) {
        frappe.call({ method: API.get_element, args: { element: el.name } }).then((res) => {
          if (res.message && currentSelection && currentSelection.element && currentSelection.element.name === el.name) {
            Object.assign(el, res.message);
            renderElementPanel(el);
          }
        }).catch(() => {
        });
      }
    } else if (currentModelId && expressID && ifcApi) {
      try {
        const props = await ifcApi.GetLine(currentModelId, expressID);
        renderWebIfcPanel(expressID, props);
      } catch (e) {
        els.props.innerHTML = '<div class="empty-hint">No ERPNext row for expressID ' + expressID + "</div>";
      }
    } else {
      els.props.innerHTML = '<div class="empty-hint">No element data</div>';
    }
  }
  function renderWebIfcPanel(expressID, props) {
    els.propsTitle.textContent = "IFC #" + expressID + " " + (props && props.type ? props.type : "");
    els.propsTitle.className = "";
    const html = [];
    if (props) {
      Object.keys(props).slice(0, 40).forEach((k) => {
        const v = props[k];
        const val = v && typeof v === "object" && v.value !== void 0 ? v.value : typeof v === "object" ? JSON.stringify(v).slice(0, 80) : v;
        html.push(`<tr><td>${k}</td><td>${String(val).slice(0, 80)}</td></tr>`);
      });
    }
    els.props.innerHTML = "<table>" + html.join("") + "</table>";
  }
  function renderElementPanel(el) {
    if (!el) return;
    const title = el.title || el.name || el.element_type;
    els.propsTitle.textContent = `${title} (${el.stable_id || el.name})`;
    els.propsTitle.className = "";
    const html = [];
    html.push('<div><span class="bim-badge">' + (el.discipline || "\u2014") + '</span><span class="bim-badge">' + (el.storey || "no storey") + "</span></div>");
    const q = el.quantities || {};
    const qKeys = Object.keys(q);
    if (qKeys.length) {
      html.push('<div style="margin:8px 0 4px;font-weight:600">Quantities</div><table>');
      qKeys.forEach((k) => html.push(`<tr><td>${k}</td><td>${q[k]}</td></tr>`));
      html.push("</table>");
    }
    const p = el.properties || {};
    const pKeys = Object.keys(p).filter((k) => !["ifc_id", "ifc_type"].includes(k));
    if (pKeys.length) {
      html.push('<div style="margin:8px 0 4px;font-weight:600">Properties</div><table>');
      pKeys.slice(0, 60).forEach((k) => html.push(`<tr><td>${k}</td><td>${p[k]}</td></tr>`));
      if (pKeys.length > 60) html.push(`<tr><td colspan="2">\u2026 ${pKeys.length - 60} more</td></tr>`);
      html.push("</table>");
    }
    if (!qKeys.length && !pKeys.length) {
      html.push('<div class="empty-hint" style="margin-top:8px">Loading properties\u2026</div>');
    }
    els.props.innerHTML = html.join("");
    loadLinks(el.name);
  }
  async function loadLinks(bimElement) {
    const res = await frappe.call({ method: API.list_boq_links, args: { bim_element: bimElement } });
    const links = res.message || [];
    if (!links.length) {
      els.links.innerHTML = '<div class="empty-hint">No links</div>';
      return;
    }
    els.links.innerHTML = links.map((l) => `
    <div class="link-row">
      <span>${l.boq_reference_name} <span class="bim-badge">${l.boq_reference_type}</span></span>
      <button class="del" data-name="${l.name}">\u2715</button>
    </div>`).join("");
    els.links.querySelectorAll(".del").forEach((b) => b.onclick = async () => {
      await frappe.call({ method: API.delete_boq_link, args: { link: b.dataset.name } });
      loadLinks(bimElement);
    });
  }
  function setTool(tool) {
    activeTool = tool;
    document.querySelectorAll("#bim-hud button").forEach((b) => b.classList.toggle("active", b.id === "tool-" + tool));
    renderer.domElement.style.cursor = tool === "measure" ? "crosshair" : "default";
  }
  var pointerDownPos = { x: 0, y: 0 };
  els.canvas.addEventListener("pointerdown", (ev) => {
    pointerDownPos = { x: ev.clientX, y: ev.clientY };
  });
  els.canvas.addEventListener("click", async (ev) => {
    if (activeTool === "measure") {
      measureClick(ev);
      return;
    }
    const dist = Math.hypot(ev.clientX - pointerDownPos.x, ev.clientY - pointerDownPos.y);
    if (dist > 6) return;
    if (activeTool !== "select" && activeTool !== "orbit") return;
    const rect = els.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      (ev.clientX - rect.left) / rect.width * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const meshes = [];
    if (modelGroup) modelGroup.traverse((o) => {
      if (o.isMesh) meshes.push(o);
    });
    const hits = raycaster.intersectObjects(meshes, false);
    if (hits.length) {
      const hit = hits[0];
      const expr = getExpressIdAt(hit.object.geometry, hit.face ? hit.face.a : void 0) || hit.object.userData.expressID;
      await selectElement(hit.object, expr);
    } else {
      clearSelection();
    }
  });
  document.getElementById("t-wireframe").onclick = () => {
    wireframeMode = !wireframeMode;
    if (modelGroup) modelGroup.traverse((o) => {
      if (o.isMesh && o.material) o.material.wireframe = wireframeMode;
    });
  };
  function fitView() {
    if (!modelGroup) return;
    const box = new THREE.Box3().setFromObject(modelGroup);
    if (box.isEmpty()) return;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const size = box.getSize(new THREE.Vector3()).length();
    camera.position.copy(sphere.center).add(new THREE.Vector3(size * 0.7, size * 0.6, size * 0.7));
    controls.target.copy(sphere.center);
    controls.update();
  }
  var btnFit = document.getElementById("btn-fit");
  if (btnFit) btnFit.onclick = fitView;
  document.getElementById("t-iso").onclick = () => {
    if (!modelGroup) return;
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    camera.position.copy(center).add(new THREE.Vector3(size * 0.7, size * 0.6, size * 0.7));
    camera.up.set(0, 1, 0);
    controls.target.copy(center);
    controls.update();
  };
  document.getElementById("t-top").onclick = () => {
    if (!modelGroup) return;
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    camera.position.set(center.x, center.y + size * 1.4, center.z);
    camera.up.set(0, 0, -1);
    controls.target.copy(center);
    controls.update();
  };
  document.getElementById("t-front").onclick = () => {
    if (!modelGroup) return;
    const box = new THREE.Box3().setFromObject(modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    camera.position.set(center.x, center.y, center.z + size * 1.4);
    camera.up.set(0, 1, 0);
    controls.target.copy(center);
    controls.update();
  };
  var measurePoints = [];
  var measureLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 16765286, linewidth: 2 })
  );
  scene.add(measureLine);
  function measureClick(ev) {
    const rect = els.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      (ev.clientX - rect.left) / rect.width * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, hit);
    if (hit) {
      measurePoints.push(hit.clone());
      if (measurePoints.length === 2) {
        const dist = measurePoints[0].distanceTo(measurePoints[1]);
        measureLine.geometry.setFromPoints(measurePoints);
        setStatus(`Measure: ${dist.toFixed(2)} m (model units)`);
        measurePoints = [];
      } else {
        setStatus("Measure: click second point");
      }
    }
  }
  document.getElementById("tool-measure").onclick = () => setTool("measure");
  document.getElementById("tool-orbit").onclick = () => setTool("orbit");
  document.getElementById("tool-select").onclick = () => setTool("select");
  document.getElementById("tool-clip").onclick = () => {
    if (activeTool !== "clip") {
      setTool("clip");
      setStatus("Clip mode: click-drag on model to draw a section box");
    } else setTool("orbit");
  };
  var clipDragStart = null;
  els.canvas.addEventListener("mousedown", (ev) => {
    if (activeTool === "clip") clipDragStart = ev;
  });
  els.canvas.addEventListener("mouseup", (ev) => {
    if (activeTool !== "clip" || !clipDragStart) return;
    const rect = els.canvas.getBoundingClientRect();
    const ndc = (x, y) => new THREE.Vector2((x - rect.left) / rect.width * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    const a = ndc(clipDragStart.clientX, clipDragStart.clientY);
    const b = ndc(ev.clientX, ev.clientY);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const va = new THREE.Vector3(), vb = new THREE.Vector3();
    raycaster.setFromCamera(a, camera);
    raycaster.ray.intersectPlane(plane, va);
    raycaster.setFromCamera(b, camera);
    raycaster.ray.intersectPlane(plane, vb);
    clipDragStart = null;
    if (!va || !vb) return;
    const min = new THREE.Vector3(Math.min(va.x, vb.x), Math.min(va.y, vb.y), Math.min(va.z, vb.z));
    const max = new THREE.Vector3(Math.max(va.x, vb.x), Math.max(va.y, vb.y), Math.max(va.z, vb.z));
    applyClip(min, max);
  });
  function applyClip(min, max) {
    if (clipBox) scene.remove(clipBox);
    clipBox = new THREE.Box3Helper(new THREE.Box3(min, max), 16765286);
    scene.add(clipBox);
    if (modelGroup) modelGroup.traverse((o) => {
      if (o.isMesh) o.visible = meshVisible(o, min, max);
    });
    setStatus("Clip applied \u2014 elements outside the box hidden");
  }
  function meshVisible(mesh, min, max) {
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox.clone();
    const world = new THREE.Vector3();
    mesh.getWorldPosition(world);
    bb.min.add(world);
    bb.max.add(world);
    return bb.min.x <= max.x && bb.max.x >= min.x && bb.min.y <= max.y && bb.max.y >= min.y && bb.min.z <= max.z && bb.max.z >= min.z;
  }
  document.getElementById("t-reset").onclick = () => {
    if (clipBox) {
      scene.remove(clipBox);
      clipBox = null;
    }
    if (modelGroup) modelGroup.traverse((o) => {
      if (o.isMesh) o.visible = true;
    });
    setStatus("Clip reset");
  };
  var colorMode = 0;
  var PROP_COLORS = [4886745, 5294200, 16747586, 13073919, 16765286, 5099745];
  var COLOR_PROPS = ["discipline", "element_type", "storey"];
  document.getElementById("btn-color-prop").onclick = () => {
    colorMode = (colorMode + 1) % 3;
    const prop = COLOR_PROPS[colorMode];
    const palette = /* @__PURE__ */ new Map();
    let i = 0;
    const seen = /* @__PURE__ */ new Map();
    elementMeshes.forEach(({ mesh, expressID }) => {
      const el = expressID ? elementIndex.get(String(expressID)) || elementIndex.get(expressID) : null;
      if (el) {
        const key = el[prop] || "other";
        if (!palette.has(key)) palette.set(key, PROP_COLORS[i++ % PROP_COLORS.length]);
      }
    });
    if (modelGroup) modelGroup.traverse((o) => {
      if (!o.isMesh) return;
      const ids = o.userData.expressID ? [o.userData.expressID] : [];
      let color = null;
      for (let k = 0; k < ids.length; k++) {
        const el = elementIndex.get(String(ids[k]));
        if (el) {
          const key = el[prop] || "other";
          color = palette.get(key);
          break;
        }
      }
      if (color !== null) {
        if (!o.userData.origColor) o.userData.origColor = o.material.color.clone();
        o.material.color.setHex(color);
      }
    });
    if (currentSelection && currentSelection.mesh) {
      currentSelection.mesh.material.color.copy(highlightMat.color);
      currentSelection.mesh.material.emissive && currentSelection.mesh.material.emissive.copy(highlightMat.emissive);
    }
    setStatus("Colored by " + prop);
  };
  function populateFacets() {
    frappe.call({ method: API.list_elements, args: { model: currentModel.name, filters: "{}", limit: 1 } }).then((res) => {
      const facets = res.message.facets || {};
      ["fDiscipline", "fStorey", "fType"].forEach((id, i) => {
        const sel = els[id];
        const key = ["discipline", "storey", "element_type"][i];
        sel.innerHTML = `<option value="">${key}: all</option>`;
        (facets[key] || []).forEach((v) => {
          const o = document.createElement("option");
          o.value = v;
          o.textContent = v;
          sel.appendChild(o);
        });
      });
    });
  }
  ["fDiscipline", "fStorey", "fType"].forEach((id) => els[id].addEventListener("change", applyFilters));
  els.fSearch.addEventListener("input", debounce(applyFilters, 300));
  document.getElementById("f-clear").onclick = () => {
    els.fDiscipline.value = "";
    els.fStorey.value = "";
    els.fType.value = "";
    els.fSearch.value = "";
    applyFilters();
  };
  function debounce(fn, ms) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  }
  async function applyFilters() {
    if (!currentModel) return;
    const filters = {
      discipline: els.fDiscipline.value ? [els.fDiscipline.value] : [],
      storey: els.fStorey.value ? [els.fStorey.value] : [],
      element_type: els.fType.value ? [els.fType.value] : [],
      search: els.fSearch.value
    };
    const res = await frappe.call({ method: API.list_elements, args: { model: currentModel.name, filters: JSON.stringify(filters), limit: 2e4 } });
    const visibleNames = new Set((res.message.elements || []).map((el) => el.name));
    if (modelGroup) modelGroup.traverse((o) => {
      if (!o.isMesh) return;
      const expr = o.userData.expressID;
      let vis = false;
      const el = expr ? elementIndex.get(String(expr)) || elementIndex.get(expr) : null;
      if (el && visibleNames.has(el.name)) vis = true;
      if (!expr) vis = true;
      if (clipBox) o.visible = vis && meshVisible(o, clipBox.box.min, clipBox.box.max);
      else o.visible = vis;
    });
    setStatus(`${res.message.total} elements match filters`);
  }
  document.getElementById("nl-add").onclick = async () => {
    if (!currentSelection || !currentSelection.element) {
      setStatus("Select an element with an ERPNext row first");
      return;
    }
    const name = document.getElementById("nl-name").value.trim();
    if (!name) return;
    await frappe.call({
      method: API.create_boq_link,
      args: { bim_element: currentSelection.element.name, boq_reference_type: document.getElementById("nl-type").value, boq_reference_name: name }
    });
    document.getElementById("nl-name").value = "";
    loadLinks(currentSelection.element.name);
  };
  async function loadViewpoints() {
    if (!currentModel) return;
    const res = await frappe.call({ method: API.list_viewpoints, args: { model: currentModel.name } });
    const vps = res.message || [];
    els.viewpoints.innerHTML = "";
    if (!vps.length) {
      els.viewpoints.innerHTML = '<div class="empty-hint">No viewpoints saved</div>';
      return;
    }
    vps.forEach((vp) => {
      const d = document.createElement("div");
      d.className = "link-row";
      d.innerHTML = `<span style="cursor:pointer">\u{1F4F7} ${vp.viewpoint_name}</span><button class="del" data-name="${vp.name}">\u2715</button>`;
      d.querySelector("span").onclick = () => restoreViewpoint(vp);
      d.querySelector(".del").onclick = async () => {
        await frappe.call({ method: API.delete_viewpoint, args: { viewpoint: vp.name } });
        loadViewpoints();
      };
      els.viewpoints.appendChild(d);
    });
  }
  function restoreViewpoint(vp) {
    const cam = typeof vp.camera === "string" ? JSON.parse(vp.camera) : vp.camera;
    if (cam && cam.position) {
      camera.position.set(cam.position.x, cam.position.y, cam.position.z);
      controls.target.set(cam.target.x, cam.target.y, cam.target.z);
      controls.update();
      setStatus("Restored viewpoint " + vp.viewpoint_name);
    }
  }
  document.getElementById("vp-save").onclick = async () => {
    if (!currentModel) return;
    const name = els.vpName.value.trim() || "View " + (/* @__PURE__ */ new Date()).toLocaleTimeString();
    await frappe.call({
      method: API.save_viewpoint,
      args: {
        model: currentModel.name,
        viewpoint_name: name,
        camera: JSON.stringify({
          position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          target: { x: controls.target.x, y: controls.target.y, z: controls.target.z }
        })
      }
    });
    els.vpName.value = "";
    loadViewpoints();
  };
  els.upload.onclick = () => els.fileInput.click();
  els.fileInput.onchange = async () => {
    const file = els.fileInput.files[0];
    if (!file) return;
    showLoading("Uploading\u2026", true);
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("is_private", "0");
      formData.append("doctype", "BIM Model");
      formData.append("docname", "new");
      const uploadResp = await fetch("/api/method/upload_file", {
        method: "POST",
        body: formData,
        headers: {
          "X-Frappe-CSRF-Token": window.frappe && frappe.csrf_token || ""
        }
      });
      if (!uploadResp.ok) throw new Error("Upload HTTP status " + uploadResp.status);
      const uploadData = await uploadResp.json();
      const fileUrl = uploadData.message && uploadData.message.file_url;
      if (!fileUrl) throw new Error("Failed to retrieve uploaded file URL");
      showLoading("Parsing IFC\u2026", true);
      const createRes = await frappe.call({
        method: API.create_model,
        args: { file_url: fileUrl, file_name: file.name, model_name: file.name.replace(/\.ifc$/i, ""), discipline: "Architecture" }
      });
      await loadModels();
      await selectModel(createRes.message.name);
      setStatus(`Imported ${createRes.message.element_count} elements`);
    } catch (e) {
      setStatus("Import failed: " + (e._server_messages ? JSON.parse(e._server_messages)[0] : e.message));
    } finally {
      showLoading("", false);
      els.fileInput.value = "";
    }
  };
  loadModels();
})();
