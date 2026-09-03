// ../bim_viewer_app.js
var ENGINE = window.IFCEngine;
var WebIFC = window.WebIFC;
if (!ENGINE || !WebIFC) {
  throw new Error("IFCEngine not loaded (webifc-api-iife.js + webifc.bundle.js must load first)");
}
var THREE = ENGINE.THREE;
var OrbitControls = ENGINE.OrbitControls;
var buildIfcScene = ENGINE.buildIfcScene;
var detectClashes = ENGINE.detectClashes;
var generateBcfViewpoint = ENGINE.generateBcfViewpoint;
var createCentroidMarker = ENGINE.createCentroidMarker;
var createIntersectionBoxHelper = ENGINE.createIntersectionBoxHelper;
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
  delete_viewpoint: "construction_bim.bim.api.delete_viewpoint",
  create_clash: "construction_bim.bim.api.create_clash",
  list_clashes: "construction_bim.bim.api.list_clashes",
  add_clash_comment: "construction_bim.bim.api.add_clash_comment",
  list_clash_comments: "construction_bim.bim.api.list_clash_comments",
  generate_bom_from_bim: "construction_bim.bim.api.generate_bom_from_bim"
};
var els = {
  models: document.getElementById("bim-models"),
  btnLoadSelected: document.getElementById("btn-load-selected"),
  btnClearModels: document.getElementById("btn-clear-models"),
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
  fSearch: document.getElementById("f-search"),
  clashCardsList: document.getElementById("clash-cards-list"),
  clashBadgeCount: document.getElementById("clash-badge-count"),
  clashDetailContainer: document.getElementById("clash-detail-container"),
  clashListContainer: document.getElementById("clash-list-container"),
  clashCommentsStream: document.getElementById("clash-comments-stream"),
  clashCommentInput: document.getElementById("clash-comment-input"),
  bomModal: document.getElementById("bim-bom-modal"),
  bomRollupTbody: document.getElementById("bom-rollup-tbody"),
  bomSummaryText: document.getElementById("bom-summary-text")
};
var renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
var scene = new THREE.Scene();
scene.background = new THREE.Color(988970);
var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5e3);
camera.position.set(25, 20, 30);
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
scene.add(new THREE.HemisphereLight(16777215, 3359061, 1.2));
var keyLight = new THREE.DirectionalLight(16777215, 1.3);
keyLight.position.set(40, 60, 30);
scene.add(keyLight);
var fillLight = new THREE.DirectionalLight(9741240, 0.6);
fillLight.position.set(-30, 20, -30);
scene.add(fillLight);
var grid = new THREE.GridHelper(120, 24, 4674921, 1976635);
grid.position.y = -0.02;
scene.add(grid);
var federatedGroup = new THREE.Group();
federatedGroup.name = "FederatedRootGroup";
scene.add(federatedGroup);
var clashHelpersGroup = new THREE.Group();
clashHelpersGroup.name = "ClashHelpersGroup";
scene.add(clashHelpersGroup);
var loadedModels = /* @__PURE__ */ new Map();
var elementMeshes = [];
var elementIndex = /* @__PURE__ */ new Map();
var availableModels = [];
var currentSelection = null;
var activeTool = "orbit";
var wireframeMode = false;
var ifcApi = null;
var detectedClashes = [];
var activeClash = null;
var highlightMat = new THREE.MeshStandardMaterial({ color: 3718648, emissive: 223649, emissiveIntensity: 0.5 });
var clashMatA = new THREE.MeshStandardMaterial({ color: 15680580, emissive: 8330525, emissiveIntensity: 0.6, roughness: 0.3 });
var clashMatB = new THREE.MeshStandardMaterial({ color: 15381256, emissive: 7421714, emissiveIntensity: 0.6, roughness: 0.3 });
function resize() {
  const w = els.canvas ? els.canvas.clientWidth || 800 : 800;
  const h = els.canvas ? els.canvas.clientHeight || 600 : 600;
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
  if (els.status) els.status.textContent = msg;
}
function showLoading(msg, on) {
  if (els.loading) {
    els.loading.style.display = on ? "flex" : "none";
    if (on) els.loading.textContent = msg;
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
async function loadModelsList() {
  setStatus("Loading models\u2026");
  try {
    const res = await frappe.call({ method: API.list_models });
    availableModels = res.message || [];
    renderModelsList();
    if (availableModels.length) {
      setStatus(`${availableModels.length} models available`);
    } else {
      setStatus("No models found. Upload an IFC file to begin.");
    }
  } catch (e) {
    setStatus("Failed to load models list: " + (e.message || e));
  }
}
function renderModelsList() {
  if (!els.models) return;
  els.models.innerHTML = "";
  if (!availableModels.length) {
    els.models.innerHTML = '<div class="empty-hint">No models yet</div>';
    return;
  }
  availableModels.forEach((m) => {
    const isLoaded = loadedModels.has(m.name);
    const d = document.createElement("div");
    d.className = "bim-model-item" + (isLoaded ? " active" : "");
    let disc = m.discipline || "Architecture";
    const nameLower = (m.model_name || m.name).toLowerCase();
    if (nameLower.includes("struc") || nameLower.includes("str")) disc = "Structural";
    else if (nameLower.includes("hvac") || nameLower.includes("mep") || nameLower.includes("vvs")) disc = "MEP";
    d.innerHTML = `
      <div class="model-title" title="${m.model_name}">
        <input type="checkbox" class="model-check" ${isLoaded ? "checked" : ""} style="margin-right:4px" />
        <span>${m.model_name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        <span class="bim-badge model-badge">${disc}</span>
        <span class="cnt">${m.element_count || 0} el</span>
      </div>
    `;
    const checkbox = d.querySelector(".model-check");
    checkbox.onclick = (e) => {
      e.stopPropagation();
      toggleModel(m.name);
    };
    d.onclick = () => toggleModel(m.name);
    els.models.appendChild(d);
  });
}
async function toggleModel(modelDocName) {
  if (loadedModels.has(modelDocName)) {
    unloadModel(modelDocName);
  } else {
    await loadModelGeometry(modelDocName);
  }
  renderModelsList();
  updateElementMeshesList();
  populateFacets();
  fitView();
}
async function loadModelGeometry(modelDocName) {
  showLoading(`Loading model ${modelDocName}\u2026`, true);
  try {
    const res = await frappe.call({ method: API.get_model, args: { model: modelDocName } });
    const modelData = res.message;
    const ifcUrl = modelData.original_file;
    if (!ifcUrl) {
      setStatus(`Model ${modelData.model_name} has no attached IFC file`);
      return;
    }
    const absUrl = ifcUrl.startsWith("/") ? ifcUrl : "/" + ifcUrl;
    showLoading(`Downloading IFC (${modelData.model_name})\u2026`, true);
    const resp = await fetch(absUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching IFC`);
    const buf = new Uint8Array(await resp.arrayBuffer());
    showLoading(`Parsing IFC (${(buf.length / 1e6).toFixed(1)} MB)\u2026`, true);
    const api = await getIfcApi();
    const ifcModelID = api.OpenModel(buf, { COORDINATE_TO_ORIGIN: false, USE_FAST_BVH: true });
    let disc = modelData.discipline || "Architecture";
    const nameLower = (modelData.model_name || modelDocName).toLowerCase();
    if (nameLower.includes("struc") || nameLower.includes("str")) disc = "Structural";
    else if (nameLower.includes("hvac") || nameLower.includes("mep") || nameLower.includes("vvs")) disc = "MEP";
    showLoading(`Building 3D scene (${disc})\u2026`, true);
    const sceneResult = buildIfcScene(api, ifcModelID, {
      modelName: modelData.model_name || modelDocName,
      discipline: disc
    });
    federatedGroup.add(sceneResult.group);
    try {
      const elemRes = await frappe.call({
        method: API.list_elements,
        args: { model: modelDocName, filters: "{}", limit: 25e3 }
      });
      const elements = elemRes.message && elemRes.message.elements || [];
      elements.forEach((el) => {
        const cleanRef = (el.mesh_ref || "").replace("e", "");
        if (cleanRef) elementIndex.set(`${modelDocName}:${cleanRef}`, el);
        if (el.stable_id) elementIndex.set(el.stable_id, el);
      });
    } catch (e) {
    }
    loadedModels.set(modelDocName, {
      modelDocName,
      modelName: modelData.model_name || modelDocName,
      discipline: disc,
      ifcModelID,
      group: sceneResult.group,
      expressMap: sceneResult.expressMap,
      meshCount: sceneResult.meshCount,
      elements: [],
      isGhosted: false,
      opacity: 1,
      visible: true
    });
    setStatus(`Loaded ${modelData.model_name} [${disc}]: ${sceneResult.meshCount.total} meshes, ${sceneResult.meshCount.tris} tris`);
  } catch (e) {
    console.error("Failed to load model geometry", e);
    setStatus(`Error loading ${modelDocName}: ${e.message || e}`);
  } finally {
    showLoading("", false);
  }
}
function unloadModel(modelDocName) {
  const modelEntry = loadedModels.get(modelDocName);
  if (!modelEntry) return;
  if (ifcApi && modelEntry.ifcModelID !== void 0) {
    try {
      ifcApi.CloseModel(modelEntry.ifcModelID);
    } catch (e) {
      console.warn("Could not close IFC model:", e);
    }
  }
  for (const [key, val] of elementIndex.entries()) {
    if (val.modelDocName === modelDocName || key.startsWith(`${modelDocName}:`)) {
      elementIndex.delete(key);
    }
  }
  federatedGroup.remove(modelEntry.group);
  disposeGroup(modelEntry.group);
  loadedModels.delete(modelDocName);
  updateElementMeshesList();
  renderModelsList();
  setStatus(`Unloaded ${modelEntry.modelName}`);
}
function unloadAllModels() {
  loadedModels.forEach((entry) => {
    if (ifcApi && entry.ifcModelID !== void 0) {
      try {
        ifcApi.CloseModel(entry.ifcModelID);
      } catch (e) {
      }
    }
    federatedGroup.remove(entry.group);
    disposeGroup(entry.group);
  });
  loadedModels.clear();
  elementIndex.clear();
  elementMeshes = [];
  clashHelpersGroup.clear();
  clearSelection();
  renderModelsList();
  setStatus("All models cleared");
}
function updateElementMeshesList() {
  elementMeshes = [];
  loadedModels.forEach((entry, modelDocName) => {
    entry.expressMap.forEach((meshes, expressID) => {
      meshes.forEach((m) => {
        m.userData.modelDocName = modelDocName;
        m.userData.discipline = entry.discipline;
        elementMeshes.push({ mesh: m, expressID, modelDocName, discipline: entry.discipline });
      });
    });
  });
}
function disposeGroup(group) {
  group.traverse((o) => {
    if (o.isMesh) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    }
  });
}
function initDisciplineControls() {
  const rows = document.querySelectorAll(".discipline-layer-row");
  rows.forEach((row) => {
    const disc = row.dataset.discipline;
    const btnVis = row.querySelector(".btn-vis");
    const btnGhost = row.querySelector(".btn-ghost");
    const btnSolo = row.querySelector(".btn-solo");
    const slider = row.querySelector(".disc-opacity-slider");
    const valText = row.querySelector(".disc-opacity-val");
    if (btnVis) {
      btnVis.onclick = () => {
        const isCurrentlyVis = btnVis.classList.contains("active");
        setDisciplineVisibility(disc, !isCurrentlyVis);
        btnVis.classList.toggle("active", !isCurrentlyVis);
        btnVis.textContent = !isCurrentlyVis ? "\u{1F441}" : "\u{1F6AB}";
      };
    }
    if (btnGhost) {
      btnGhost.onclick = () => {
        const isGhost = btnGhost.classList.contains("ghost-active");
        setDisciplineGhosting(disc, !isGhost);
        btnGhost.classList.toggle("ghost-active", !isGhost);
        if (!isGhost) {
          if (slider) slider.value = 20;
          if (valText) valText.textContent = "20%";
        } else {
          if (slider) slider.value = 100;
          if (valText) valText.textContent = "100%";
        }
      };
    }
    if (btnSolo) {
      btnSolo.onclick = () => {
        rows.forEach((r) => {
          const d = r.dataset.discipline;
          const vBtn = r.querySelector(".btn-vis");
          if (d === disc) {
            setDisciplineVisibility(d, true);
            if (vBtn) {
              vBtn.classList.add("active");
              vBtn.textContent = "\u{1F441}";
            }
          } else {
            setDisciplineVisibility(d, false);
            if (vBtn) {
              vBtn.classList.remove("active");
              vBtn.textContent = "\u{1F6AB}";
            }
          }
        });
        setStatus(`Solo: ${disc}`);
      };
    }
    if (slider) {
      slider.oninput = () => {
        const opVal = parseInt(slider.value, 10) / 100;
        if (valText) valText.textContent = `${slider.value}%`;
        setDisciplineOpacity(disc, opVal);
      };
    }
  });
}
function setDisciplineVisibility(discipline, visible) {
  loadedModels.forEach((entry) => {
    if (disciplineMatches(entry.discipline, discipline)) {
      entry.visible = visible;
      entry.group.visible = visible;
    }
  });
}
function setDisciplineGhosting(discipline, ghosted) {
  loadedModels.forEach((entry) => {
    if (disciplineMatches(entry.discipline, discipline)) {
      entry.isGhosted = ghosted;
      entry.group.traverse((o) => {
        if (o.isMesh && o.material) {
          if (!o.userData.origMaterialProps) {
            o.userData.origMaterialProps = {
              color: o.material.color.clone(),
              opacity: o.material.opacity,
              transparent: o.material.transparent,
              depthWrite: o.material.depthWrite
            };
          }
          if (ghosted) {
            o.material.transparent = true;
            o.material.opacity = 0.2;
            o.material.depthWrite = false;
            o.material.color.setHex(9741240);
          } else {
            const p = o.userData.origMaterialProps;
            o.material.transparent = p.transparent;
            o.material.opacity = p.opacity;
            o.material.depthWrite = p.depthWrite;
            o.material.color.copy(p.color);
          }
        }
      });
    }
  });
}
function setDisciplineOpacity(discipline, opacity) {
  loadedModels.forEach((entry) => {
    if (disciplineMatches(entry.discipline, discipline)) {
      entry.opacity = opacity;
      entry.group.traverse((o) => {
        if (o.isMesh && o.material) {
          if (!o.userData.origMaterialProps) {
            o.userData.origMaterialProps = {
              color: o.material.color.clone(),
              opacity: o.material.opacity,
              transparent: o.material.transparent,
              depthWrite: o.material.depthWrite
            };
          }
          o.material.transparent = opacity < 0.98;
          o.material.opacity = opacity;
          o.material.depthWrite = opacity >= 0.85;
        }
      });
    }
  });
}
function disciplineMatches(modelDisc, targetDisc) {
  if (!modelDisc || !targetDisc) return false;
  const m = modelDisc.toLowerCase();
  const t = targetDisc.toLowerCase();
  if (m === t) return true;
  if (t === "mep" && (m.includes("hvac") || m.includes("plumb") || m.includes("elec") || m.includes("mech"))) return true;
  if (t === "structural" && (m.includes("struc") || m.includes("str"))) return true;
  if (t === "architecture" && (m.includes("ark") || m.includes("arch"))) return true;
  return false;
}
function clearSelection() {
  currentSelection = null;
  if (els.props) els.props.innerHTML = '<div class="empty-hint">No selection</div>';
  if (els.propsTitle) {
    els.propsTitle.textContent = "Click an element in the viewer";
    els.propsTitle.className = "empty-hint";
  }
  if (els.links) els.links.innerHTML = '<div class="empty-hint">No links</div>';
  elementMeshes.forEach(({ mesh }) => {
    if (mesh.userData.origColor) {
      mesh.material.color.copy(mesh.userData.origColor);
    }
    if (mesh.material.emissive) mesh.material.emissive.setHex(0);
    const p = mesh.userData.origMaterialProps;
    if (p) {
      mesh.material.transparent = p.transparent;
      mesh.material.opacity = p.opacity;
      mesh.material.depthWrite = p.depthWrite;
    }
  });
}
async function selectElement(mesh, expressID, modelDocName) {
  clearSelection();
  const lookupKey = `${modelDocName}:${expressID}`;
  let el = elementIndex.get(lookupKey) || elementIndex.get(String(expressID)) || mesh.userData.element;
  currentSelection = { mesh, element: el, expressID, modelDocName };
  if (!mesh.userData.origColor) mesh.userData.origColor = mesh.material.color.clone();
  mesh.material.color.copy(highlightMat.color);
  if (mesh.material.emissive) mesh.material.emissive.copy(highlightMat.emissive);
  const modelEntry = loadedModels.get(modelDocName);
  const discipline = modelEntry && modelEntry.discipline || mesh.userData.discipline || "Discipline";
  const modelName = modelEntry && modelEntry.modelName || modelDocName;
  renderElementInspector(el, expressID, modelName, discipline, mesh);
  if (el && (!el.properties || !Object.keys(el.properties).length)) {
    try {
      const fullDoc = await frappe.call({ method: API.get_element, args: { element: el.name } });
      if (fullDoc.message && currentSelection && currentSelection.expressID === expressID) {
        Object.assign(el, fullDoc.message);
        renderElementInspector(el, expressID, modelName, discipline, mesh);
      }
    } catch (e) {
    }
  } else if (!el && modelEntry && ifcApi) {
    try {
      const lineData = await ifcApi.GetLine(modelEntry.ifcModelID, expressID);
      renderWebIfcInspector(expressID, lineData, modelName, discipline);
    } catch (e) {
    }
  }
}
function renderElementInspector(el, expressID, modelName, discipline, mesh) {
  if (!els.propsTitle || !els.props) return;
  const title = el && (el.title || el.element_type) || `IFC #${expressID}`;
  const guid = el && el.stable_id || "";
  els.propsTitle.textContent = `${title} ${guid ? `(${guid})` : ""}`;
  els.propsTitle.className = "";
  els.props.innerHTML = "";
  const badgesDiv = document.createElement("div");
  badgesDiv.style.marginBottom = "8px";
  badgesDiv.innerHTML = `
    <span class="bim-badge model-badge">${modelName}</span>
    <span class="bim-badge">${discipline}</span>
    ${el && el.storey ? `<span class="bim-badge">${el.storey}</span>` : ""}
    <span class="bim-badge">#${expressID}</span>
  `;
  els.props.appendChild(badgesDiv);
  if (mesh && mesh.geometry) {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const bboxHeader = document.createElement("div");
    bboxHeader.style.cssText = "font-weight:600;font-size:12px;margin:8px 0 4px;color:#1e293b";
    bboxHeader.textContent = "Spatial Dimensions";
    els.props.appendChild(bboxHeader);
    const bboxTable = document.createElement("table");
    bboxTable.className = "property-table";
    bboxTable.innerHTML = `
      <tr><td>Size (X \xD7 Y \xD7 Z)</td><td>${size.x.toFixed(2)}m \xD7 ${size.y.toFixed(2)}m \xD7 ${size.z.toFixed(2)}m</td></tr>
      <tr><td>Center Point</td><td>(${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})</td></tr>
    `;
    els.props.appendChild(bboxTable);
  }
  const q = el && el.quantities || {};
  const qKeys = Object.keys(q);
  if (qKeys.length) {
    const qHeader = document.createElement("div");
    qHeader.style.cssText = "font-weight:600;font-size:12px;margin:10px 0 4px;color:#1e293b";
    qHeader.textContent = "Quantities (Qto_*)";
    els.props.appendChild(qHeader);
    const qTable = document.createElement("table");
    qTable.className = "property-table";
    qKeys.forEach((k) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${k}</td><td>${q[k]}</td>`;
      qTable.appendChild(tr);
    });
    els.props.appendChild(qTable);
  }
  const p = el && el.properties || {};
  const pKeys = Object.keys(p).filter((k) => !["ifc_id", "ifc_type"].includes(k));
  if (pKeys.length) {
    const pHeader = document.createElement("div");
    pHeader.style.cssText = "font-weight:600;font-size:12px;margin:10px 0 4px;color:#1e293b";
    pHeader.textContent = "Property Sets (Pset_*)";
    els.props.appendChild(pHeader);
    const pTable = document.createElement("table");
    pTable.className = "property-table";
    pKeys.slice(0, 50).forEach((k) => {
      const v = typeof p[k] === "object" ? JSON.stringify(p[k]) : String(p[k]);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${k}</td><td>${v.slice(0, 70)}</td>`;
      pTable.appendChild(tr);
    });
    els.props.appendChild(pTable);
  }
  if (el && el.name) loadBoqLinks(el.name);
}
function renderWebIfcInspector(expressID, props, modelName, discipline) {
  if (!els.propsTitle || !els.props) return;
  els.propsTitle.textContent = `IFC #${expressID} ${props.type || ""}`;
  els.propsTitle.className = "";
  els.props.innerHTML = `
    <div style="margin-bottom:8px">
      <span class="bim-badge model-badge">${modelName}</span>
      <span class="bim-badge">${discipline}</span>
    </div>
  `;
  const table = document.createElement("table");
  table.className = "property-table";
  Object.keys(props).slice(0, 30).forEach((k) => {
    const v = props[k];
    const val = v && typeof v === "object" && v.value !== void 0 ? v.value : typeof v === "object" ? JSON.stringify(v).slice(0, 60) : v;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td>${String(val)}</td>`;
    table.appendChild(tr);
  });
  els.props.appendChild(table);
}
async function loadBoqLinks(bimElement) {
  if (!els.links) return;
  try {
    const res = await frappe.call({ method: API.list_boq_links, args: { bim_element: bimElement } });
    const links = res.message || [];
    if (!links.length) {
      els.links.innerHTML = '<div class="empty-hint">No links for current element</div>';
      return;
    }
    els.links.innerHTML = links.map((l) => `
      <div class="link-row" style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #f1f5f9;font-size:12px">
        <span>${l.boq_reference_name} <span class="bim-badge">${l.boq_reference_type}</span></span>
        <button class="del" data-name="${l.name}" style="color:#ef4444;border:none;background:none;cursor:pointer">\u2715</button>
      </div>
    `).join("");
    els.links.querySelectorAll(".del").forEach((b) => {
      b.onclick = async () => {
        await frappe.call({ method: API.delete_boq_link, args: { link: b.dataset.name } });
        loadBoqLinks(bimElement);
      };
    });
  } catch (e) {
    els.links.innerHTML = '<div class="empty-hint">Error loading links</div>';
  }
}
async function executeClashDetection() {
  const discA = (document.getElementById("clash-disc-a") || {}).value || "Structural";
  const discB = (document.getElementById("clash-disc-b") || {}).value || "MEP";
  const tolInput = document.getElementById("clash-tolerance");
  const tolerance = tolInput ? parseFloat(tolInput.value) || 0 : 0;
  setStatus(`Running BVH clash check between ${discA} and ${discB}\u2026`);
  showLoading("Computing mesh BVH intersections\u2026", true);
  const meshesA = [];
  const meshesB = [];
  loadedModels.forEach((entry) => {
    if (disciplineMatches(entry.discipline, discA)) {
      entry.group.traverse((o) => {
        if (o.isMesh) meshesA.push(o);
      });
    }
    if (disciplineMatches(entry.discipline, discB)) {
      entry.group.traverse((o) => {
        if (o.isMesh) meshesB.push(o);
      });
    }
  });
  if (!meshesA.length || !meshesB.length) {
    showLoading("", false);
    setStatus(`Cannot run clash check: Make sure models for both ${discA} and ${discB} are loaded.`);
    if (els.clashCardsList) {
      els.clashCardsList.innerHTML = `<div class="empty-hint">Load models for both ${discA} and ${discB} first</div>`;
    }
    return;
  }
  const startTime = performance.now();
  const result = detectClashes(meshesA, meshesB, { tolerance });
  const duration = (performance.now() - startTime).toFixed(0);
  detectedClashes = result.clashes || [];
  setStatus(`Clash check complete: ${detectedClashes.length} clashes detected in ${duration}ms (${result.stats.narrowphaseChecks} BVH checks)`);
  showLoading("", false);
  renderClashesList();
  const tabBtn = document.getElementById("tab-btn-clashes");
  if (tabBtn) tabBtn.click();
}
function renderClashesList() {
  if (!els.clashCardsList) return;
  els.clashCardsList.innerHTML = "";
  if (els.clashBadgeCount) {
    els.clashBadgeCount.textContent = detectedClashes.length;
    els.clashBadgeCount.style.display = detectedClashes.length ? "inline-block" : "none";
  }
  if (!detectedClashes.length) {
    els.clashCardsList.innerHTML = '<div class="empty-hint">No clashes detected between selected disciplines!</div>';
    return;
  }
  const sevFilter = (document.getElementById("clash-filter-severity") || {}).value || "";
  const filtered = sevFilter ? detectedClashes.filter((c) => c.severity === sevFilter) : detectedClashes;
  filtered.forEach((clash) => {
    const card = document.createElement("div");
    card.className = "clash-card" + (activeClash && activeClash.id === clash.id ? " active" : "");
    const pt = clash.collisionPoint;
    const sevClass = clash.severity ? `severity-${clash.severity.toLowerCase()}` : "severity-minor";
    card.innerHTML = `
      <div class="clash-card-title">${clash.elementA.discipline} #${clash.elementA.expressID} \xD7 ${clash.elementB.discipline} #${clash.elementB.expressID}</div>
      <div class="clash-card-meta">
        <span class="bim-badge ${sevClass}">${clash.severity}</span>
        <span class="bim-badge status-open">${clash.status}</span>
        <span class="bim-badge model-badge">${clash.elementA.ifcType || "Element"} / ${clash.elementB.ifcType || "Element"}</span>
      </div>
      <div class="clash-card-coords">XYZ: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)}) | Depth: ${clash.penetrationDepth ? clash.penetrationDepth.toFixed(1) : "0"}mm</div>
      <div class="clash-card-actions">
        <button class="btn btn-default btn-xs btn-fly">\u{1F3AF} Fly-To</button>
      </div>
    `;
    card.onclick = () => selectClash(clash);
    const flyBtn = card.querySelector(".btn-fly");
    if (flyBtn) {
      flyBtn.onclick = (e) => {
        e.stopPropagation();
        selectClash(clash);
        flyToClash(clash);
      };
    }
    els.clashCardsList.appendChild(card);
  });
}
function selectClash(clash) {
  activeClash = clash;
  renderClashesList();
  highlightClashElements(clash);
  renderClashDetailView(clash);
}
function highlightClashElements(clash) {
  clashHelpersGroup.clear();
  elementMeshes.forEach(({ mesh }) => {
    if (!mesh.userData.origMaterialProps) {
      mesh.userData.origMaterialProps = {
        transparent: mesh.material.transparent,
        opacity: mesh.material.opacity,
        depthWrite: mesh.material.depthWrite
      };
    }
    if (mesh.userData.origColor) mesh.material.color.copy(mesh.userData.origColor);
    if (mesh.material.emissive) mesh.material.emissive.setHex(0);
    mesh.material.transparent = true;
    mesh.material.opacity = 0.15;
  });
  const meshA = clash.elementA.mesh;
  const meshB = clash.elementB.mesh;
  if (meshA) {
    if (!meshA.userData.origColor) meshA.userData.origColor = meshA.material.color.clone();
    meshA.material.color.copy(clashMatA.color);
    if (meshA.material.emissive) meshA.material.emissive.copy(clashMatA.emissive);
    meshA.material.transparent = false;
    meshA.material.opacity = 1;
  }
  if (meshB) {
    if (!meshB.userData.origColor) meshB.userData.origColor = meshB.material.color.clone();
    meshB.material.color.copy(clashMatB.color);
    if (meshB.material.emissive) meshB.material.emissive.copy(clashMatB.emissive);
    meshB.material.transparent = false;
    meshB.material.opacity = 1;
  }
  const marker = createCentroidMarker(clash.collisionPoint);
  clashHelpersGroup.add(marker);
  if (clash.boundingBox) {
    const boxHelper = createIntersectionBoxHelper(clash.boundingBox);
    if (boxHelper) clashHelpersGroup.add(boxHelper);
  }
}
function flyToClash(clash) {
  const targetPos = new THREE.Vector3(clash.collisionPoint.x, clash.collisionPoint.y, clash.collisionPoint.z);
  const distance = 4.5;
  const camPos = targetPos.clone().add(new THREE.Vector3(distance * 0.7, distance * 0.5, distance * 0.7));
  const startCam = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();
  const duration = 750;
  function animateStep(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(startCam, camPos, ease);
    controls.target.lerpVectors(startTarget, targetPos, ease);
    controls.update();
    if (t < 1) requestAnimationFrame(animateStep);
  }
  requestAnimationFrame(animateStep);
  setStatus(`Inspecting ${clash.id} at (${targetPos.x.toFixed(2)}, ${targetPos.y.toFixed(2)}, ${targetPos.z.toFixed(2)})`);
}
function renderClashDetailView(clash) {
  if (!els.clashDetailContainer || !els.clashListContainer) return;
  els.clashListContainer.style.display = "none";
  els.clashDetailContainer.style.display = "block";
  const titleEl = document.getElementById("clash-detail-title");
  const metaEl = document.getElementById("clash-detail-meta");
  const sevBadge = document.getElementById("clash-detail-severity");
  if (titleEl) titleEl.textContent = `${clash.elementA.discipline} #${clash.elementA.expressID} \xD7 ${clash.elementB.discipline} #${clash.elementB.expressID}`;
  if (sevBadge) {
    sevBadge.textContent = clash.severity;
    sevBadge.className = `bim-badge severity-${(clash.severity || "minor").toLowerCase()}`;
  }
  if (metaEl) {
    const pt = clash.collisionPoint;
    metaEl.innerHTML = `
      <div><strong>Collision Coordinates:</strong> (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)})</div>
      <div><strong>Penetration Depth:</strong> ${(clash.penetrationDepth || 0).toFixed(1)} mm | <strong>Volume:</strong> ${(clash.intersectionVolume || 0).toFixed(4)} m\xB3</div>
      <div><strong>Element A:</strong> ${clash.elementA.modelName} (${clash.elementA.ifcType})</div>
      <div><strong>Element B:</strong> ${clash.elementB.modelName} (${clash.elementB.ifcType})</div>
    `;
  }
  loadClashComments(clash.id);
}
async function loadClashComments(clashId) {
  if (!els.clashCommentsStream) return;
  els.clashCommentsStream.innerHTML = '<div class="empty-hint">Loading discussion\u2026</div>';
  try {
    const res = await frappe.call({ method: API.list_clash_comments, args: { clash: clashId } });
    const comments = res.message || [];
    if (!comments.length) {
      els.clashCommentsStream.innerHTML = '<div class="empty-hint">No comments yet. Start the team discussion below.</div>';
      return;
    }
    els.clashCommentsStream.innerHTML = comments.map((c) => `
      <div class="clash-comment-bubble">
        <div class="clash-comment-header">
          <strong>${c.user || "Administrator"}</strong>
          <span>${c.creation ? c.creation.slice(0, 16) : "Just now"}</span>
        </div>
        <div class="clash-comment-body">${c.comment || ""}</div>
        ${c.snapshot ? `<img src="${c.snapshot}" class="clash-comment-snapshot" />` : ""}
      </div>
    `).join("");
  } catch (e) {
    els.clashCommentsStream.innerHTML = '<div class="empty-hint">Discussion thread ready for clash notes.</div>';
  }
}
async function postClashComment() {
  if (!activeClash || !els.clashCommentInput) return;
  const text = els.clashCommentInput.value.trim();
  if (!text) return;
  setStatus("Posting comment\u2026");
  try {
    await frappe.call({
      method: API.add_clash_comment,
      args: { clash: activeClash.id, comment: text, user: window.frappe && frappe.session && frappe.session.user || "Administrator" }
    });
    els.clashCommentInput.value = "";
    loadClashComments(activeClash.id);
    setStatus("Comment posted.");
  } catch (e) {
    const bubble = document.createElement("div");
    bubble.className = "clash-comment-bubble";
    bubble.innerHTML = `
      <div class="clash-comment-header">
        <strong>${window.frappe && frappe.session && frappe.session.user || "User"}</strong>
        <span>Just now</span>
      </div>
      <div class="clash-comment-body">${text}</div>
    `;
    els.clashCommentsStream.appendChild(bubble);
    els.clashCommentInput.value = "";
    setStatus("Note added to local session.");
  }
}
async function saveClashToErpNext() {
  if (!activeClash) return;
  showLoading("Saving clash record to ERPNext\u2026", true);
  try {
    const viewpoint = generateBcfViewpoint(camera, controls, activeClash, {
      snapshot: renderer.domElement.toDataURL("image/png")
    });
    const res = await frappe.call({
      method: API.create_clash,
      args: {
        title: `${activeClash.elementA.discipline} #${activeClash.elementA.expressID} \xD7 ${activeClash.elementB.discipline} #${activeClash.elementB.expressID}`,
        model_a: activeClash.elementA.modelName,
        element_a_id: activeClash.elementA.expressID,
        discipline_a: activeClash.elementA.discipline,
        model_b: activeClash.elementB.modelName,
        element_b_id: activeClash.elementB.expressID,
        discipline_b: activeClash.elementB.discipline,
        collision_point: JSON.stringify(activeClash.collisionPoint),
        bounding_box: JSON.stringify(activeClash.boundingBox),
        penetration_depth: activeClash.penetrationDepth,
        intersection_volume: activeClash.intersectionVolume,
        severity: activeClash.severity,
        viewpoint: JSON.stringify(viewpoint)
      }
    });
    showLoading("", false);
    frappe.msgprint({
      title: __("BIM Clash Saved"),
      message: __("Created BIM Clash record: <b>{0}</b>", [res.message && res.message.name || "BIM-CLASH-NEW"]),
      indicator: "green"
    });
    setStatus(`Saved clash record ${res.message && res.message.name || ""}`);
  } catch (e) {
    showLoading("", false);
    frappe.msgprint({
      title: __("Failed to Save Clash"),
      message: __("Could not save BIM Clash: {0}", [e.message || String(e)]),
      indicator: "red"
    });
    setStatus(`Error saving clash: ${e.message || e}`);
  }
}
function openBomWizardModal() {
  if (!els.bomModal) return;
  els.bomModal.classList.add("active");
  calculateAndRenderBomRollup();
}
function closeBomWizardModal() {
  if (!els.bomModal) return;
  els.bomModal.classList.remove("active");
  clearSelection();
}
function calculateAndRenderBomRollup() {
  if (!els.bomRollupTbody) return;
  els.bomRollupTbody.innerHTML = "";
  const rollups = /* @__PURE__ */ new Map();
  elementMeshes.forEach(({ mesh, expressID, modelDocName, discipline }) => {
    const el = elementIndex.get(`${modelDocName}:${expressID}`) || elementIndex.get(String(expressID)) || mesh.userData.element;
    const ifcType = el && el.element_type || (mesh.userData.ifcType ? `IFC_${mesh.userData.ifcType}` : "IFC_ELEMENT");
    if (!rollups.has(ifcType)) {
      let metricName = "Volume";
      let uom = "m3";
      let unitRate = 180;
      let wastePct = 5;
      let itemCode = "CONC-C30-37";
      const typeUpper = ifcType.toUpperCase();
      if (typeUpper.includes("SLAB")) {
        metricName = "NetVolume";
        uom = "m3";
        unitRate = 195;
        wastePct = 5;
        itemCode = "CONC-SLAB-C30";
      } else if (typeUpper.includes("BEAM") || typeUpper.includes("COLUMN")) {
        metricName = "NetVolume";
        uom = "m3";
        unitRate = 220;
        wastePct = 5;
        itemCode = "CONC-STRUC-C35";
      } else if (typeUpper.includes("WALL")) {
        metricName = "NetVolume";
        uom = "m3";
        unitRate = 175;
        wastePct = 5;
        itemCode = "CONC-WALL-PANEL";
      } else if (typeUpper.includes("DUCT")) {
        metricName = "Length";
        uom = "m";
        unitRate = 85;
        wastePct = 10;
        itemCode = "MEP-DUCT-GALV";
      } else if (typeUpper.includes("PIPE")) {
        metricName = "Length";
        uom = "m";
        unitRate = 45;
        wastePct = 10;
        itemCode = "MEP-PIPE-COPPER";
      } else if (typeUpper.includes("AIRTERMINAL") || typeUpper.includes("VALVE") || typeUpper.includes("PUMP")) {
        metricName = "Count";
        uom = "Nos";
        unitRate = 120;
        wastePct = 0;
        itemCode = "MEP-FIXTURE-UNIT";
      }
      rollups.set(ifcType, {
        type: ifcType,
        discipline,
        count: 0,
        metricName,
        metricValue: 0,
        uom,
        itemCode,
        unitRate,
        wastePct,
        meshes: []
      });
    }
    const r = rollups.get(ifcType);
    r.count++;
    r.meshes.push(mesh);
    if (el && el.quantities) {
      if (r.metricName === "NetVolume" && el.quantities.NetVolume) {
        r.metricValue += parseFloat(el.quantities.NetVolume) || 0;
      } else if (r.metricName === "Length" && (el.quantities.Length || el.quantities.NominalLength)) {
        r.metricValue += parseFloat(el.quantities.Length || el.quantities.NominalLength) || 0;
      } else if (r.metricName === "GrossArea" && el.quantities.GrossArea) {
        r.metricValue += parseFloat(el.quantities.GrossArea) || 0;
      }
    } else if (mesh.geometry) {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
      const sz = worldBox.getSize(new THREE.Vector3());
      if (r.metricName === "NetVolume") r.metricValue += sz.x * sz.y * sz.z;
      else if (r.metricName === "Length") r.metricValue += Math.max(sz.x, sz.y, sz.z);
      else r.metricValue += 1;
    }
  });
  let totalCost = 0;
  let totalLineItems = rollups.size;
  rollups.forEach((row) => {
    const effectiveQty = row.metricValue * (1 + row.wastePct / 100);
    const lineTotal = effectiveQty * row.unitRate;
    totalCost += lineTotal;
    const tr = document.createElement("tr");
    tr.className = "bom-row";
    tr.innerHTML = `
      <td><strong>${row.type}</strong></td>
      <td><span class="bim-badge">${row.discipline}</span></td>
      <td>${row.count}</td>
      <td>${row.metricValue.toFixed(2)} ${row.uom}</td>
      <td><input type="number" class="bom-waste-input" value="${row.wastePct}" min="0" max="50" style="width:60px" />%</td>
      <td class="bom-eff-qty">${effectiveQty.toFixed(2)} ${row.uom}</td>
      <td><input class="bom-item-input" value="${row.itemCode}" /></td>
      <td>${row.uom}</td>
      <td>$<input type="number" class="bom-rate-input" value="${row.unitRate}" style="width:70px" /></td>
      <td class="bom-line-total" style="font-weight:600">$${lineTotal.toFixed(2)}</td>
    `;
    tr.onclick = () => {
      document.querySelectorAll(".bom-rollup-table tr.bom-row").forEach((r) => r.classList.remove("selected"));
      tr.classList.add("selected");
      crossHighlightMeshes(row.meshes);
    };
    const wasteInput = tr.querySelector(".bom-waste-input");
    const rateInput = tr.querySelector(".bom-rate-input");
    const effQtyEl = tr.querySelector(".bom-eff-qty");
    const lineTotalEl = tr.querySelector(".bom-line-total");
    const updateLine = () => {
      const w = parseFloat(wasteInput.value) || 0;
      const rVal = parseFloat(rateInput.value) || 0;
      const eff = row.metricValue * (1 + w / 100);
      const tot = eff * rVal;
      effQtyEl.textContent = `${eff.toFixed(2)} ${row.uom}`;
      lineTotalEl.textContent = `$${tot.toFixed(2)}`;
    };
    if (wasteInput) wasteInput.oninput = updateLine;
    if (rateInput) rateInput.oninput = updateLine;
    els.bomRollupTbody.appendChild(tr);
  });
  if (els.bomSummaryText) {
    els.bomSummaryText.textContent = `Total Line Items: ${totalLineItems} | Estimated Total Cost: $${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
function crossHighlightMeshes(targetMeshes) {
  const targetSet = new Set(targetMeshes);
  const targetBox = new THREE.Box3();
  elementMeshes.forEach(({ mesh }) => {
    if (!mesh.userData.origMaterialProps) {
      mesh.userData.origMaterialProps = {
        transparent: mesh.material.transparent,
        opacity: mesh.material.opacity,
        depthWrite: mesh.material.depthWrite
      };
    }
    if (targetSet.has(mesh)) {
      if (!mesh.userData.origColor) mesh.userData.origColor = mesh.material.color.clone();
      mesh.material.color.setHex(3718648);
      if (mesh.material.emissive) mesh.material.emissive.setHex(223649);
      mesh.material.transparent = false;
      mesh.material.opacity = 1;
      if (mesh.geometry) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        targetBox.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
      }
    } else {
      if (mesh.userData.origColor) mesh.material.color.copy(mesh.userData.origColor);
      if (mesh.material.emissive) mesh.material.emissive.setHex(0);
      mesh.material.transparent = true;
      mesh.material.opacity = 0.12;
    }
  });
  if (!targetBox.isEmpty()) {
    const center = targetBox.getCenter(new THREE.Vector3());
    const size = targetBox.getSize(new THREE.Vector3()).length();
    camera.position.copy(center).add(new THREE.Vector3(size * 0.7, size * 0.5, size * 0.7));
    controls.target.copy(center);
    controls.update();
  }
}
async function generateErpNextBom() {
  const parentItem = (document.getElementById("bom-parent-item") || {}).value || "BLD-NORDIC-CONC-01";
  const bomTitle = (document.getElementById("bom-title") || {}).value || "BIM Generated BOM";
  showLoading("Generating ERPNext BOM document\u2026", true);
  try {
    const items = [];
    document.querySelectorAll("#bom-rollup-tbody tr.bom-row").forEach((tr) => {
      const type = (tr.querySelector("td strong") || {}).textContent || "";
      const itemCode = (tr.querySelector(".bom-item-input") || {}).value || "";
      const effQtyStr = (tr.querySelector(".bom-eff-qty") || {}).textContent || "0";
      const parsedQty = parseFloat(effQtyStr);
      const effQty = Number.isFinite(parsedQty) ? parsedQty : 0;
      if (effQty <= 0) return;
      const rateStr = (tr.querySelector(".bom-rate-input") || {}).value || "0";
      const rate = parseFloat(rateStr) || 0;
      items.push({ item_code: itemCode, qty: effQty, rate, ifc_type: type });
    });
    const res = await frappe.call({
      method: API.generate_bom_from_bim,
      args: {
        item: parentItem,
        bom_title: bomTitle,
        items: JSON.stringify(items)
      }
    });
    showLoading("", false);
    closeBomWizardModal();
    frappe.msgprint({
      title: __("BOM Generated Successfully"),
      message: __("Created ERPNext BOM: <b>{0}</b> with {1} line items.", [res.message && res.message.name || "BOM-" + parentItem, items.length]),
      indicator: "green"
    });
    setStatus(`Generated ERPNext BOM for ${parentItem}`);
  } catch (e) {
    showLoading("", false);
    frappe.msgprint({
      title: __("Failed to Generate BOM"),
      message: __("Error generating ERPNext BOM: {0}", [e.message || String(e)]),
      indicator: "red"
    });
    setStatus(`BOM generation failed: ${e.message || e}`);
  }
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
  federatedGroup.traverse((o) => {
    if (o.isMesh && o.visible) meshes.push(o);
  });
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length) {
    const hit = hits[0];
    const expr = hit.object.userData.expressID || getExpressIdAt(hit.object.geometry, hit.face ? hit.face.a : void 0);
    const modelDoc = hit.object.userData.modelDocName || "";
    await selectElement(hit.object, expr, modelDoc);
  } else {
    clearSelection();
  }
});
function getExpressIdAt(geometry, faceIndex) {
  const attr = geometry && geometry.attributes && geometry.attributes.expressID;
  if (!attr || faceIndex === void 0 || faceIndex === null) return null;
  return attr.getX(Math.min(faceIndex, attr.count - 1));
}
function fitView() {
  const box = new THREE.Box3().setFromObject(federatedGroup);
  if (box.isEmpty()) return;
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const size = box.getSize(new THREE.Vector3()).length();
  camera.position.copy(sphere.center).add(new THREE.Vector3(size * 0.7, size * 0.5, size * 0.7));
  controls.target.copy(sphere.center);
  controls.update();
}
var measurePoints = [];
var measureLine = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({ color: 3718648, linewidth: 2 })
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
  const meshes = [];
  federatedGroup.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length) {
    const pt = hits[0].point;
    measurePoints.push(pt);
    if (measurePoints.length === 2) {
      const dist = measurePoints[0].distanceTo(measurePoints[1]);
      measureLine.geometry.setFromPoints(measurePoints);
      setStatus(`Distance: ${dist.toFixed(3)} m (model units)`);
      measurePoints = [];
    } else {
      setStatus("Measure: click second target vertex/point");
    }
  }
}
function populateFacets() {
  if (!els.fDiscipline || !els.fStorey || !els.fType) return;
  const disciplines = /* @__PURE__ */ new Set();
  const storeys = /* @__PURE__ */ new Set();
  const types = /* @__PURE__ */ new Set();
  loadedModels.forEach((m) => {
    disciplines.add(m.discipline);
    (m.elements || []).forEach((el) => {
      if (el.storey) storeys.add(el.storey);
      if (el.element_type) types.add(el.element_type);
    });
  });
  els.fDiscipline.innerHTML = '<option value="">Discipline: all</option>';
  disciplines.forEach((d) => {
    const o = document.createElement("option");
    o.value = d;
    o.textContent = d;
    els.fDiscipline.appendChild(o);
  });
  els.fStorey.innerHTML = '<option value="">Storey: all</option>';
  storeys.forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    els.fStorey.appendChild(o);
  });
  els.fType.innerHTML = '<option value="">Type: all</option>';
  types.forEach((t) => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = t;
    els.fType.appendChild(o);
  });
}
function applyFilters() {
  const fDisc = els.fDiscipline ? els.fDiscipline.value : "";
  const fStorey = els.fStorey ? els.fStorey.value : "";
  const fType = els.fType ? els.fType.value : "";
  const fSearch = (els.fSearch ? els.fSearch.value : "").toLowerCase().trim();
  let visibleCount = 0;
  elementMeshes.forEach(({ mesh, expressID, modelDocName, discipline }) => {
    const el = elementIndex.get(`${modelDocName}:${expressID}`) || elementIndex.get(String(expressID)) || mesh.userData.element;
    let match = true;
    if (fDisc && !disciplineMatches(discipline, fDisc)) match = false;
    if (fStorey && el && el.storey !== fStorey) match = false;
    if (fType && el && el.element_type !== fType) match = false;
    if (fSearch) {
      const searchTarget = `${el && el.title || ""} ${el && el.element_type || ""} ${expressID} ${el && el.stable_id || ""}`.toLowerCase();
      if (!searchTarget.includes(fSearch)) match = false;
    }
    mesh.visible = match;
    if (match) visibleCount++;
  });
  setStatus(`${visibleCount} elements matching filters`);
}
function saveCurrentViewpoint() {
  const name = els.vpName && els.vpName.value.trim() || "View " + (/* @__PURE__ */ new Date()).toLocaleTimeString();
  const vpData = {
    position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
    target: { x: controls.target.x, y: controls.target.y, z: controls.target.z }
  };
  const d = document.createElement("div");
  d.className = "link-row";
  d.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #f1f5f9;font-size:12px";
  d.innerHTML = `<span style="cursor:pointer">\u{1F4F7} ${name}</span><button class="del" style="color:#ef4444;border:none;background:none;cursor:pointer">\u2715</button>`;
  d.querySelector("span").onclick = () => {
    camera.position.set(vpData.position.x, vpData.position.y, vpData.position.z);
    controls.target.set(vpData.target.x, vpData.target.y, vpData.target.z);
    controls.update();
    setStatus("Restored viewpoint " + name);
  };
  d.querySelector(".del").onclick = () => d.remove();
  if (els.viewpoints.querySelector(".empty-hint")) els.viewpoints.innerHTML = "";
  els.viewpoints.appendChild(d);
  if (els.vpName) els.vpName.value = "";
  setStatus("Saved viewpoint: " + name);
}
function initUiEvents() {
  document.querySelectorAll(".bim-tab-btn").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll(".bim-tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".bim-tab-content").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");
    };
  });
  const toolOrbit = document.getElementById("tool-orbit");
  const toolSelect = document.getElementById("tool-select");
  const toolMeasure = document.getElementById("tool-measure");
  const toolClip = document.getElementById("tool-clip");
  const toolClashes = document.getElementById("tool-clashes");
  if (toolOrbit) toolOrbit.onclick = () => setTool("orbit");
  if (toolSelect) toolSelect.onclick = () => setTool("select");
  if (toolMeasure) toolMeasure.onclick = () => setTool("measure");
  if (toolClip) toolClip.onclick = () => setTool("clip");
  if (toolClashes) {
    toolClashes.onclick = () => {
      const tabBtn = document.getElementById("tab-btn-clashes");
      if (tabBtn) tabBtn.click();
    };
  }
  const tWireframe = document.getElementById("t-wireframe");
  const tIso = document.getElementById("t-iso");
  const tTop = document.getElementById("t-top");
  const tFront = document.getElementById("t-front");
  const btnFit = document.getElementById("btn-fit");
  if (tWireframe) {
    tWireframe.onclick = () => {
      wireframeMode = !wireframeMode;
      federatedGroup.traverse((o) => {
        if (o.isMesh && o.material) o.material.wireframe = wireframeMode;
      });
      setStatus(`Wireframe mode: ${wireframeMode ? "ON" : "OFF"}`);
    };
  }
  if (btnFit) btnFit.onclick = fitView;
  if (tIso) tIso.onclick = fitView;
  if (tTop) {
    tTop.onclick = () => {
      const box = new THREE.Box3().setFromObject(federatedGroup);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();
      camera.position.set(center.x, center.y + size * 1.3, center.z);
      camera.up.set(0, 0, -1);
      controls.target.copy(center);
      controls.update();
    };
  }
  if (tFront) {
    tFront.onclick = () => {
      const box = new THREE.Box3().setFromObject(federatedGroup);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();
      camera.position.set(center.x, center.y, center.z + size * 1.3);
      camera.up.set(0, 1, 0);
      controls.target.copy(center);
      controls.update();
    };
  }
  const btnRunClashes = document.getElementById("btn-run-clashes");
  if (btnRunClashes) btnRunClashes.onclick = executeClashDetection;
  const btnClashBack = document.getElementById("btn-clash-back");
  if (btnClashBack) {
    btnClashBack.onclick = () => {
      if (els.clashDetailContainer && els.clashListContainer) {
        els.clashDetailContainer.style.display = "none";
        els.clashListContainer.style.display = "block";
      }
    };
  }
  const btnClashFly = document.getElementById("btn-clash-fly");
  if (btnClashFly) {
    btnClashFly.onclick = () => {
      if (activeClash) flyToClash(activeClash);
    };
  }
  const btnPostClashComment = document.getElementById("btn-post-clash-comment");
  if (btnPostClashComment) btnPostClashComment.onclick = postClashComment;
  const btnSaveClashErp = document.getElementById("btn-save-clash-erp");
  if (btnSaveClashErp) btnSaveClashErp.onclick = saveClashToErpNext;
  const btnOpenBomWizard = document.getElementById("btn-open-bom-wizard");
  if (btnOpenBomWizard) btnOpenBomWizard.onclick = openBomWizardModal;
  const btnCloseBomModal = document.getElementById("btn-close-bom-modal");
  const btnCancelBomModal = document.getElementById("btn-cancel-bom-modal");
  if (btnCloseBomModal) btnCloseBomModal.onclick = closeBomWizardModal;
  if (btnCancelBomModal) btnCancelBomModal.onclick = closeBomWizardModal;
  const btnGenerateErpBom = document.getElementById("btn-generate-erp-bom");
  if (btnGenerateErpBom) btnGenerateErpBom.onclick = generateErpNextBom;
  if (els.btnLoadSelected) {
    els.btnLoadSelected.onclick = async () => {
      for (const m of availableModels) {
        if (!loadedModels.has(m.name)) await loadModelGeometry(m.name);
      }
      renderModelsList();
      updateElementMeshesList();
      populateFacets();
      fitView();
    };
  }
  if (els.btnClearModels) {
    els.btnClearModels.onclick = unloadAllModels;
  }
  if (els.upload && els.fileInput) {
    els.upload.onclick = () => els.fileInput.click();
    els.fileInput.onchange = async () => {
      const file = els.fileInput.files[0];
      if (!file) return;
      showLoading(`Uploading ${file.name}\u2026`, true);
      try {
        const formData = new FormData();
        formData.append("file", file, file.name);
        formData.append("is_private", "0");
        formData.append("doctype", "BIM Model");
        formData.append("docname", "new");
        const uploadResp = await fetch("/api/method/upload_file", {
          method: "POST",
          body: formData,
          headers: { "X-Frappe-CSRF-Token": window.frappe && frappe.csrf_token || "" }
        });
        if (!uploadResp.ok) throw new Error("Upload failed");
        const uploadData = await uploadResp.json();
        const fileUrl = uploadData.message && uploadData.message.file_url;
        if (!fileUrl) throw new Error("Failed to retrieve file URL");
        let disc = "Architecture";
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes("struc") || nameLower.includes("str")) disc = "Structural";
        else if (nameLower.includes("hvac") || nameLower.includes("mep")) disc = "MEP";
        showLoading("Parsing IFC\u2026", true);
        const createRes = await frappe.call({
          method: API.create_model,
          args: {
            file_url: fileUrl,
            file_name: file.name,
            model_name: file.name.replace(/\.ifc$/i, ""),
            discipline: disc
          }
        });
        await loadModelsList();
        await loadModelGeometry(createRes.message.name);
        renderModelsList();
        updateElementMeshesList();
        fitView();
        setStatus(`Imported ${file.name} successfully`);
      } catch (e) {
        setStatus("Import failed: " + (e.message || e));
      } finally {
        showLoading("", false);
        els.fileInput.value = "";
      }
    };
  }
  const vpSaveBtn = document.getElementById("vp-save");
  if (vpSaveBtn) vpSaveBtn.onclick = saveCurrentViewpoint;
  const btnClashSnapshot = document.getElementById("btn-clash-snapshot");
  if (btnClashSnapshot) {
    btnClashSnapshot.onclick = () => {
      renderer.render(scene, camera);
      if (els.clashCommentInput) {
        els.clashCommentInput.value += (els.clashCommentInput.value ? "\n" : "") + `[BCF Viewpoint snapshot captured at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}]`;
      }
      setStatus("Snapshot captured to clash comment buffer");
    };
  }
  const btnNlAdd = document.getElementById("nl-add");
  if (btnNlAdd) {
    btnNlAdd.onclick = async () => {
      if (!currentSelection || !currentSelection.element) {
        frappe.msgprint(__("Please select a BIM element first"));
        return;
      }
      const typeSelect = document.getElementById("nl-type");
      const nameInput = document.getElementById("nl-name");
      const targetType = typeSelect ? typeSelect.value : "Item";
      const targetName = nameInput ? nameInput.value.trim() : "";
      if (!targetName) return;
      try {
        await frappe.call({
          method: API.create_boq_link,
          args: {
            element: currentSelection.element.name || currentSelection.expressID,
            target_doctype: targetType,
            target_name: targetName
          }
        });
        setStatus(`Created BOQ Link to ${targetName}`);
        if (nameInput) nameInput.value = "";
      } catch (e) {
        setStatus(`Link error: ${e.message || e}`);
      }
    };
  }
  if (els.fDiscipline) els.fDiscipline.onchange = applyFilters;
  if (els.fStorey) els.fStorey.onchange = applyFilters;
  if (els.fType) els.fType.onchange = applyFilters;
  if (els.fSearch) els.fSearch.oninput = applyFilters;
  const fClear = document.getElementById("f-clear");
  if (fClear) {
    fClear.onclick = () => {
      if (els.fDiscipline) els.fDiscipline.value = "";
      if (els.fStorey) els.fStorey.value = "";
      if (els.fType) els.fType.value = "";
      if (els.fSearch) els.fSearch.value = "";
      applyFilters();
    };
  }
}
async function handleRouteParams() {
  const params = new URLSearchParams(window.location.search);
  const routeOpts = window.frappe && frappe.route_options || {};
  const modelParam = routeOpts.model || routeOpts.models || params.get("models") || params.get("model");
  const clashParam = routeOpts.clash || params.get("clash");
  const elemA = routeOpts.element_a || params.get("element_a");
  const elemB = routeOpts.element_b || params.get("element_b");
  if (modelParam) {
    const modelNames = modelParam.split(",").map((s) => s.trim()).filter(Boolean);
    for (const m of modelNames) {
      await loadModelGeometry(m);
    }
    renderModelsList();
    updateElementMeshesList();
    fitView();
  }
  if (clashParam) {
    const tabClashes = document.getElementById("tab-btn-clashes");
    if (tabClashes) tabClashes.click();
    await loadExistingClashes();
    const found = detectedClashes.find((c) => c.name === clashParam || c.id === clashParam);
    if (found) {
      selectClash(found);
      flyToClash(found);
    }
  } else if (elemA || elemB) {
    const match = elementMeshes.find((m) => m.element && (m.element.stable_id === elemA || m.element.stable_id === elemB));
    if (match) {
      selectElement(match.mesh, match.expressID, match.modelDocName);
    }
  }
}
initDisciplineControls();
initUiEvents();
loadModelsList().then(() => {
  handleRouteParams();
});
window.BIMViewerApp = {
  loadedModels,
  elementMeshes,
  loadModelGeometry,
  unloadModel,
  executeClashDetection,
  detectedClashes,
  openBomWizardModal,
  calculateAndRenderBomRollup,
  handleRouteParams
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL2JpbV92aWV3ZXJfYXBwLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBCSU0gVmlld2VyIEFwcCBcdTIwMTQgTXVsdGktRGlzY2lwbGluZSBGZWRlcmF0ZWQgVmlld2luZywgQlZIIENsYXNoIEVuZ2luZSwgJiBCT00gV2l6YXJkXG4vLyBQb3dlcmVkIGJ5IHdpbmRvdy5JRkNFbmdpbmUgKFRocmVlLmpzIHIxNDkgKyB0aHJlZS1tZXNoLWJ2aCArIHdlYi1pZmMpIGFuZCBGcmFwcGUgUkVTVCBBUElzXG5cbmNvbnN0IEVOR0lORSA9IHdpbmRvdy5JRkNFbmdpbmU7XG5jb25zdCBXZWJJRkMgPSB3aW5kb3cuV2ViSUZDO1xuaWYgKCFFTkdJTkUgfHwgIVdlYklGQykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0lGQ0VuZ2luZSBub3QgbG9hZGVkICh3ZWJpZmMtYXBpLWlpZmUuanMgKyB3ZWJpZmMuYnVuZGxlLmpzIG11c3QgbG9hZCBmaXJzdCknKTtcbn1cblxuY29uc3QgVEhSRUUgPSBFTkdJTkUuVEhSRUU7XG5jb25zdCBPcmJpdENvbnRyb2xzID0gRU5HSU5FLk9yYml0Q29udHJvbHM7XG5jb25zdCBidWlsZElmY1NjZW5lID0gRU5HSU5FLmJ1aWxkSWZjU2NlbmU7XG5jb25zdCBkZXRlY3RDbGFzaGVzID0gRU5HSU5FLmRldGVjdENsYXNoZXM7XG5jb25zdCBnZW5lcmF0ZUJjZlZpZXdwb2ludCA9IEVOR0lORS5nZW5lcmF0ZUJjZlZpZXdwb2ludDtcbmNvbnN0IGNyZWF0ZUNlbnRyb2lkTWFya2VyID0gRU5HSU5FLmNyZWF0ZUNlbnRyb2lkTWFya2VyO1xuY29uc3QgY3JlYXRlSW50ZXJzZWN0aW9uQm94SGVscGVyID0gRU5HSU5FLmNyZWF0ZUludGVyc2VjdGlvbkJveEhlbHBlcjtcblxuLy8gRnJhcHBlIEFQSSByb3V0ZXNcbmNvbnN0IEFQSSA9IHtcbiAgbGlzdF9tb2RlbHM6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkubGlzdF9tb2RlbHMnLFxuICBnZXRfbW9kZWw6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuZ2V0X21vZGVsJyxcbiAgbGlzdF9lbGVtZW50czogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X2VsZW1lbnRzJyxcbiAgZ2V0X2VsZW1lbnQ6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuZ2V0X2VsZW1lbnQnLFxuICBjcmVhdGVfbW9kZWw6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuY3JlYXRlX21vZGVsX2Zyb21faWZjJyxcbiAgY3JlYXRlX2JvcV9saW5rOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmNyZWF0ZV9ib3FfbGluaycsXG4gIGRlbGV0ZV9ib3FfbGluazogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5kZWxldGVfYm9xX2xpbmsnLFxuICBsaXN0X2JvcV9saW5rczogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X2JvcV9saW5rcycsXG4gIHNhdmVfdmlld3BvaW50OiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLnNhdmVfdmlld3BvaW50JyxcbiAgbGlzdF92aWV3cG9pbnRzOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmxpc3Rfdmlld3BvaW50cycsXG4gIGRlbGV0ZV92aWV3cG9pbnQ6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuZGVsZXRlX3ZpZXdwb2ludCcsXG4gIGNyZWF0ZV9jbGFzaDogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5jcmVhdGVfY2xhc2gnLFxuICBsaXN0X2NsYXNoZXM6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkubGlzdF9jbGFzaGVzJyxcbiAgYWRkX2NsYXNoX2NvbW1lbnQ6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuYWRkX2NsYXNoX2NvbW1lbnQnLFxuICBsaXN0X2NsYXNoX2NvbW1lbnRzOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmxpc3RfY2xhc2hfY29tbWVudHMnLFxuICBnZW5lcmF0ZV9ib21fZnJvbV9iaW06ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuZ2VuZXJhdGVfYm9tX2Zyb21fYmltJyxcbn07XG5cbi8vIERPTSByZWZlcmVuY2VzXG5jb25zdCBlbHMgPSB7XG4gIG1vZGVsczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1tb2RlbHMnKSxcbiAgYnRuTG9hZFNlbGVjdGVkOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWxvYWQtc2VsZWN0ZWQnKSxcbiAgYnRuQ2xlYXJNb2RlbHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xlYXItbW9kZWxzJyksXG4gIHVwbG9hZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS11cGxvYWQnKSxcbiAgZmlsZUlucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWZpbGUtaW5wdXQnKSxcbiAgY2FudmFzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWNhbnZhcycpLFxuICBzdGF0dXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tc3RhdHVzJyksXG4gIGxvYWRpbmc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tbG9hZGluZycpLFxuICBwcm9wczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1wcm9wcycpLFxuICBwcm9wc1RpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWVsZW1lbnQtdGl0bGUnKSxcbiAgbGlua3M6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tbGlua3MnKSxcbiAgdmlld3BvaW50czogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS12aWV3cG9pbnRzJyksXG4gIHZwTmFtZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZwLW5hbWUnKSxcbiAgZkRpc2NpcGxpbmU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmLWRpc2NpcGxpbmUnKSxcbiAgZlN0b3JleTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Ytc3RvcmV5JyksXG4gIGZUeXBlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZi10eXBlJyksXG4gIGZTZWFyY2g6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmLXNlYXJjaCcpLFxuICBjbGFzaENhcmRzTGlzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWNhcmRzLWxpc3QnKSxcbiAgY2xhc2hCYWRnZUNvdW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtYmFkZ2UtY291bnQnKSxcbiAgY2xhc2hEZXRhaWxDb250YWluZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kZXRhaWwtY29udGFpbmVyJyksXG4gIGNsYXNoTGlzdENvbnRhaW5lcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWxpc3QtY29udGFpbmVyJyksXG4gIGNsYXNoQ29tbWVudHNTdHJlYW06IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1jb21tZW50cy1zdHJlYW0nKSxcbiAgY2xhc2hDb21tZW50SW5wdXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1jb21tZW50LWlucHV0JyksXG4gIGJvbU1vZGFsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWJvbS1tb2RhbCcpLFxuICBib21Sb2xsdXBUYm9keTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JvbS1yb2xsdXAtdGJvZHknKSxcbiAgYm9tU3VtbWFyeVRleHQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib20tc3VtbWFyeS10ZXh0JyksXG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIFRocmVlLmpzIFNjZW5lIFNldHVwIC0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoeyBjYW52YXM6IGVscy5jYW52YXMsIGFudGlhbGlhczogdHJ1ZSwgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlIH0pO1xucmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyhNYXRoLm1pbih3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxLCAyKSk7XG5jb25zdCBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuc2NlbmUuYmFja2dyb3VuZCA9IG5ldyBUSFJFRS5Db2xvcigweDBmMTcyYSk7IC8vIFNsYXRlLTkwMCBkYXJrIHRoZW1lXG5cbmNvbnN0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg1NSwgMSwgMC4xLCA1MDAwKTtcbmNhbWVyYS5wb3NpdGlvbi5zZXQoMjUsIDIwLCAzMCk7XG5jb25zdCBjb250cm9scyA9IG5ldyBPcmJpdENvbnRyb2xzKGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCk7XG5jb250cm9scy5lbmFibGVEYW1waW5nID0gdHJ1ZTtcbmNvbnRyb2xzLmRhbXBpbmdGYWN0b3IgPSAwLjA4O1xuXG5zY2VuZS5hZGQobmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHgzMzQxNTUsIDEuMikpO1xuY29uc3Qga2V5TGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMS4zKTtcbmtleUxpZ2h0LnBvc2l0aW9uLnNldCg0MCwgNjAsIDMwKTtcbnNjZW5lLmFkZChrZXlMaWdodCk7XG5jb25zdCBmaWxsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweDk0YTNiOCwgMC42KTtcbmZpbGxMaWdodC5wb3NpdGlvbi5zZXQoLTMwLCAyMCwgLTMwKTtcbnNjZW5lLmFkZChmaWxsTGlnaHQpO1xuXG5jb25zdCBncmlkID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoMTIwLCAyNCwgMHg0NzU1NjksIDB4MWUyOTNiKTtcbmdyaWQucG9zaXRpb24ueSA9IC0wLjAyO1xuc2NlbmUuYWRkKGdyaWQpO1xuXG4vLyBGZWRlcmF0ZWQgUm9vdCBHcm91cFxuY29uc3QgZmVkZXJhdGVkR3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcbmZlZGVyYXRlZEdyb3VwLm5hbWUgPSAnRmVkZXJhdGVkUm9vdEdyb3VwJztcbnNjZW5lLmFkZChmZWRlcmF0ZWRHcm91cCk7XG5cbi8vIEFjdGl2ZSBDbGFzaCBWaXN1YWwgSGVscGVycyBHcm91cFxuY29uc3QgY2xhc2hIZWxwZXJzR3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcbmNsYXNoSGVscGVyc0dyb3VwLm5hbWUgPSAnQ2xhc2hIZWxwZXJzR3JvdXAnO1xuc2NlbmUuYWRkKGNsYXNoSGVscGVyc0dyb3VwKTtcblxuLy8gU3RhdGVcbmxldCBsb2FkZWRNb2RlbHMgPSBuZXcgTWFwKCk7XG5sZXQgZWxlbWVudE1lc2hlcyA9IFtdO1xubGV0IGVsZW1lbnRJbmRleCA9IG5ldyBNYXAoKTtcbmxldCBhdmFpbGFibGVNb2RlbHMgPSBbXTtcbmxldCBjdXJyZW50U2VsZWN0aW9uID0gbnVsbDtcbmxldCBhY3RpdmVUb29sID0gJ29yYml0JztcbmxldCBjbGlwQm94ID0gbnVsbDtcbmxldCB3aXJlZnJhbWVNb2RlID0gZmFsc2U7XG5sZXQgaWZjQXBpID0gbnVsbDtcbmxldCBkZXRlY3RlZENsYXNoZXMgPSBbXTtcbmxldCBhY3RpdmVDbGFzaCA9IG51bGw7XG5cbi8vIEhpZ2hsaWdodCBNYXRlcmlhbHNcbmNvbnN0IGhpZ2hsaWdodE1hdCA9IG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7IGNvbG9yOiAweDM4YmRmOCwgZW1pc3NpdmU6IDB4MDM2OWExLCBlbWlzc2l2ZUludGVuc2l0eTogMC41IH0pO1xuY29uc3QgY2xhc2hNYXRBID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHsgY29sb3I6IDB4ZWY0NDQ0LCBlbWlzc2l2ZTogMHg3ZjFkMWQsIGVtaXNzaXZlSW50ZW5zaXR5OiAwLjYsIHJvdWdobmVzczogMC4zIH0pO1xuY29uc3QgY2xhc2hNYXRCID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHsgY29sb3I6IDB4ZWFiMzA4LCBlbWlzc2l2ZTogMHg3MTNmMTIsIGVtaXNzaXZlSW50ZW5zaXR5OiAwLjYsIHJvdWdobmVzczogMC4zIH0pO1xuXG5mdW5jdGlvbiByZXNpemUoKSB7XG4gIGNvbnN0IHcgPSBlbHMuY2FudmFzID8gKGVscy5jYW52YXMuY2xpZW50V2lkdGggfHwgODAwKSA6IDgwMDtcbiAgY29uc3QgaCA9IGVscy5jYW52YXMgPyAoZWxzLmNhbnZhcy5jbGllbnRIZWlnaHQgfHwgNjAwKSA6IDYwMDtcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3LCBoLCBmYWxzZSk7XG4gIGNhbWVyYS5hc3BlY3QgPSB3IC8gaDtcbiAgY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbn1cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemUpO1xucmVzaXplKCk7XG5cbmlmICh3aW5kb3cuX2JpbVZpZXdlckFuaW1JZCkge1xuICBjYW5jZWxBbmltYXRpb25GcmFtZSh3aW5kb3cuX2JpbVZpZXdlckFuaW1JZCk7XG4gIHdpbmRvdy5fYmltVmlld2VyQW5pbUlkID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgd2luZG93Ll9iaW1WaWV3ZXJBbmltSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5hbmltYXRlKCk7XG5cbmZ1bmN0aW9uIHNldFN0YXR1cyhtc2cpIHsgaWYgKGVscy5zdGF0dXMpIGVscy5zdGF0dXMudGV4dENvbnRlbnQgPSBtc2c7IH1cbmZ1bmN0aW9uIHNob3dMb2FkaW5nKG1zZywgb24pIHtcbiAgaWYgKGVscy5sb2FkaW5nKSB7XG4gICAgZWxzLmxvYWRpbmcuc3R5bGUuZGlzcGxheSA9IG9uID8gJ2ZsZXgnIDogJ25vbmUnO1xuICAgIGlmIChvbikgZWxzLmxvYWRpbmcudGV4dENvbnRlbnQgPSBtc2c7XG4gIH1cbn1cclxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIFdlYi1JRkMgQVBJIC0tLS0tLS0tLS0tLS0tLS1cbmFzeW5jIGZ1bmN0aW9uIGdldElmY0FwaSgpIHtcbiAgaWYgKGlmY0FwaSkgcmV0dXJuIGlmY0FwaTtcbiAgY29uc3QgYXBpID0gbmV3IFdlYklGQy5JZmNBUEkoKTtcbiAgYXBpLlNldFdhc21QYXRoKCcvYXNzZXRzL2NvbnN0cnVjdGlvbl9iaW0vanMvd2ViaWZjLycsIHRydWUpO1xuICBhd2FpdCBhcGkuSW5pdCgpO1xuICBpZmNBcGkgPSBhcGk7XG4gIHJldHVybiBhcGk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gTW9kZWwgTWFuYWdlbWVudCAmIEZlZGVyYXRlZCBMb2FkaW5nIC0tLS0tLS0tLS0tLS0tLS1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRNb2RlbHNMaXN0KCkge1xuICBzZXRTdGF0dXMoJ0xvYWRpbmcgbW9kZWxzXHUyMDI2Jyk7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoeyBtZXRob2Q6IEFQSS5saXN0X21vZGVscyB9KTtcbiAgICBhdmFpbGFibGVNb2RlbHMgPSByZXMubWVzc2FnZSB8fCBbXTtcbiAgICByZW5kZXJNb2RlbHNMaXN0KCk7XG4gICAgaWYgKGF2YWlsYWJsZU1vZGVscy5sZW5ndGgpIHtcbiAgICAgIHNldFN0YXR1cyhgJHthdmFpbGFibGVNb2RlbHMubGVuZ3RofSBtb2RlbHMgYXZhaWxhYmxlYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0YXR1cygnTm8gbW9kZWxzIGZvdW5kLiBVcGxvYWQgYW4gSUZDIGZpbGUgdG8gYmVnaW4uJyk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgc2V0U3RhdHVzKCdGYWlsZWQgdG8gbG9hZCBtb2RlbHMgbGlzdDogJyArIChlLm1lc3NhZ2UgfHwgZSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1vZGVsc0xpc3QoKSB7XG4gIGlmICghZWxzLm1vZGVscykgcmV0dXJuO1xuICBlbHMubW9kZWxzLmlubmVySFRNTCA9ICcnO1xuICBpZiAoIWF2YWlsYWJsZU1vZGVscy5sZW5ndGgpIHtcbiAgICBlbHMubW9kZWxzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIG1vZGVscyB5ZXQ8L2Rpdj4nO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGF2YWlsYWJsZU1vZGVscy5mb3JFYWNoKG0gPT4ge1xuICAgIGNvbnN0IGlzTG9hZGVkID0gbG9hZGVkTW9kZWxzLmhhcyhtLm5hbWUpO1xuICAgIGNvbnN0IGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkLmNsYXNzTmFtZSA9ICdiaW0tbW9kZWwtaXRlbScgKyAoaXNMb2FkZWQgPyAnIGFjdGl2ZScgOiAnJyk7XG4gICAgXG4gICAgLy8gQXV0by1kZXRlY3QgZGlzY2lwbGluZSB0YWdcbiAgICBsZXQgZGlzYyA9IG0uZGlzY2lwbGluZSB8fCAnQXJjaGl0ZWN0dXJlJztcbiAgICBjb25zdCBuYW1lTG93ZXIgPSAobS5tb2RlbF9uYW1lIHx8IG0ubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnc3RyJykpIGRpc2MgPSAnU3RydWN0dXJhbCc7XG4gICAgZWxzZSBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdodmFjJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCdtZXAnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ3Z2cycpKSBkaXNjID0gJ01FUCc7XG5cbiAgICBkLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RlbC10aXRsZVwiIHRpdGxlPVwiJHttLm1vZGVsX25hbWV9XCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cIm1vZGVsLWNoZWNrXCIgJHtpc0xvYWRlZCA/ICdjaGVja2VkJyA6ICcnfSBzdHlsZT1cIm1hcmdpbi1yaWdodDo0cHhcIiAvPlxuICAgICAgICA8c3Bhbj4ke20ubW9kZWxfbmFtZX08L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo0cHhcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgbW9kZWwtYmFkZ2VcIj4ke2Rpc2N9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImNudFwiPiR7bS5lbGVtZW50X2NvdW50IHx8IDB9IGVsPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICAgIGNvbnN0IGNoZWNrYm94ID0gZC5xdWVyeVNlbGVjdG9yKCcubW9kZWwtY2hlY2snKTtcbiAgICBjaGVja2JveC5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB0b2dnbGVNb2RlbChtLm5hbWUpO1xuICAgIH07XG5cbiAgICBkLm9uY2xpY2sgPSAoKSA9PiB0b2dnbGVNb2RlbChtLm5hbWUpO1xuICAgIGVscy5tb2RlbHMuYXBwZW5kQ2hpbGQoZCk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGVNb2RlbChtb2RlbERvY05hbWUpIHtcbiAgaWYgKGxvYWRlZE1vZGVscy5oYXMobW9kZWxEb2NOYW1lKSkge1xuICAgIHVubG9hZE1vZGVsKG1vZGVsRG9jTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgbG9hZE1vZGVsR2VvbWV0cnkobW9kZWxEb2NOYW1lKTtcbiAgfVxuICByZW5kZXJNb2RlbHNMaXN0KCk7XG4gIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XG4gIHBvcHVsYXRlRmFjZXRzKCk7XG4gIGZpdFZpZXcoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZE1vZGVsR2VvbWV0cnkobW9kZWxEb2NOYW1lKSB7XG4gIHNob3dMb2FkaW5nKGBMb2FkaW5nIG1vZGVsICR7bW9kZWxEb2NOYW1lfVx1MjAyNmAsIHRydWUpO1xuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkuZ2V0X21vZGVsLCBhcmdzOiB7IG1vZGVsOiBtb2RlbERvY05hbWUgfSB9KTtcbiAgICBjb25zdCBtb2RlbERhdGEgPSByZXMubWVzc2FnZTtcbiAgICBjb25zdCBpZmNVcmwgPSBtb2RlbERhdGEub3JpZ2luYWxfZmlsZTtcbiAgICBpZiAoIWlmY1VybCkge1xuICAgICAgc2V0U3RhdHVzKGBNb2RlbCAke21vZGVsRGF0YS5tb2RlbF9uYW1lfSBoYXMgbm8gYXR0YWNoZWQgSUZDIGZpbGVgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhYnNVcmwgPSBpZmNVcmwuc3RhcnRzV2l0aCgnLycpID8gaWZjVXJsIDogJy8nICsgaWZjVXJsO1xuICAgIHNob3dMb2FkaW5nKGBEb3dubG9hZGluZyBJRkMgKCR7bW9kZWxEYXRhLm1vZGVsX25hbWV9KVx1MjAyNmAsIHRydWUpO1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChhYnNVcmwpO1xuICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzcC5zdGF0dXN9IGZldGNoaW5nIElGQ2ApO1xuXG4gICAgY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcC5hcnJheUJ1ZmZlcigpKTtcbiAgICBzaG93TG9hZGluZyhgUGFyc2luZyBJRkMgKCR7KGJ1Zi5sZW5ndGggLyAxZTYpLnRvRml4ZWQoMSl9IE1CKVx1MjAyNmAsIHRydWUpO1xuXG4gICAgY29uc3QgYXBpID0gYXdhaXQgZ2V0SWZjQXBpKCk7XG4gICAgLy8gQ09PUkRJTkFURV9UT19PUklHSU46IGZhbHNlIGVuc3VyZXMgYWxsIGRpc2NpcGxpbmVzIHNoYXJlIHdvcmxkIGNvb3JkaW5hdGVzIHdpdGggMCBkcmlmdCFcbiAgICBjb25zdCBpZmNNb2RlbElEID0gYXBpLk9wZW5Nb2RlbChidWYsIHsgQ09PUkRJTkFURV9UT19PUklHSU46IGZhbHNlLCBVU0VfRkFTVF9CVkg6IHRydWUgfSk7XG5cbiAgICBsZXQgZGlzYyA9IG1vZGVsRGF0YS5kaXNjaXBsaW5lIHx8ICdBcmNoaXRlY3R1cmUnO1xuICAgIGNvbnN0IG5hbWVMb3dlciA9IChtb2RlbERhdGEubW9kZWxfbmFtZSB8fCBtb2RlbERvY05hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnc3RydWMnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ3N0cicpKSBkaXNjID0gJ1N0cnVjdHVyYWwnO1xuICAgIGVsc2UgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnaHZhYycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnbWVwJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCd2dnMnKSkgZGlzYyA9ICdNRVAnO1xuXG4gICAgc2hvd0xvYWRpbmcoYEJ1aWxkaW5nIDNEIHNjZW5lICgke2Rpc2N9KVx1MjAyNmAsIHRydWUpO1xuICAgIGNvbnN0IHNjZW5lUmVzdWx0ID0gYnVpbGRJZmNTY2VuZShhcGksIGlmY01vZGVsSUQsIHtcbiAgICAgIG1vZGVsTmFtZTogbW9kZWxEYXRhLm1vZGVsX25hbWUgfHwgbW9kZWxEb2NOYW1lLFxuICAgICAgZGlzY2lwbGluZTogZGlzYyxcbiAgICB9KTtcblxuICAgIGZlZGVyYXRlZEdyb3VwLmFkZChzY2VuZVJlc3VsdC5ncm91cCk7XG5cbiAgICAvLyBMb2FkIHNlcnZlciBlbGVtZW50cyBmb3IgcHJvcGVydHkgbGlua2luZ1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbGVtUmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xuICAgICAgICBtZXRob2Q6IEFQSS5saXN0X2VsZW1lbnRzLFxuICAgICAgICBhcmdzOiB7IG1vZGVsOiBtb2RlbERvY05hbWUsIGZpbHRlcnM6ICd7fScsIGxpbWl0OiAyNTAwMCB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBlbGVtZW50cyA9IChlbGVtUmVzLm1lc3NhZ2UgJiYgZWxlbVJlcy5tZXNzYWdlLmVsZW1lbnRzKSB8fCBbXTtcbiAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBjb25zdCBjbGVhblJlZiA9IChlbC5tZXNoX3JlZiB8fCAnJykucmVwbGFjZSgnZScsICcnKTtcbiAgICAgICAgaWYgKGNsZWFuUmVmKSBlbGVtZW50SW5kZXguc2V0KGAke21vZGVsRG9jTmFtZX06JHtjbGVhblJlZn1gLCBlbCk7XG4gICAgICAgIGlmIChlbC5zdGFibGVfaWQpIGVsZW1lbnRJbmRleC5zZXQoZWwuc3RhYmxlX2lkLCBlbCk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgbG9hZGVkTW9kZWxzLnNldChtb2RlbERvY05hbWUsIHtcbiAgICAgIG1vZGVsRG9jTmFtZSxcbiAgICAgIG1vZGVsTmFtZTogbW9kZWxEYXRhLm1vZGVsX25hbWUgfHwgbW9kZWxEb2NOYW1lLFxuICAgICAgZGlzY2lwbGluZTogZGlzYyxcbiAgICAgIGlmY01vZGVsSUQsXG4gICAgICBncm91cDogc2NlbmVSZXN1bHQuZ3JvdXAsXG4gICAgICBleHByZXNzTWFwOiBzY2VuZVJlc3VsdC5leHByZXNzTWFwLFxuICAgICAgbWVzaENvdW50OiBzY2VuZVJlc3VsdC5tZXNoQ291bnQsXG4gICAgICBlbGVtZW50czogW10sXG4gICAgICBpc0dob3N0ZWQ6IGZhbHNlLFxuICAgICAgb3BhY2l0eTogMS4wLFxuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHNldFN0YXR1cyhgTG9hZGVkICR7bW9kZWxEYXRhLm1vZGVsX25hbWV9IFske2Rpc2N9XTogJHtzY2VuZVJlc3VsdC5tZXNoQ291bnQudG90YWx9IG1lc2hlcywgJHtzY2VuZVJlc3VsdC5tZXNoQ291bnQudHJpc30gdHJpc2ApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgbW9kZWwgZ2VvbWV0cnknLCBlKTtcbiAgICBzZXRTdGF0dXMoYEVycm9yIGxvYWRpbmcgJHttb2RlbERvY05hbWV9OiAke2UubWVzc2FnZSB8fCBlfWApO1xuICB9IGZpbmFsbHkge1xuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5sb2FkTW9kZWwobW9kZWxEb2NOYW1lKSB7XG4gIGNvbnN0IG1vZGVsRW50cnkgPSBsb2FkZWRNb2RlbHMuZ2V0KG1vZGVsRG9jTmFtZSk7XG4gIGlmICghbW9kZWxFbnRyeSkgcmV0dXJuO1xuXG4gIGlmIChpZmNBcGkgJiYgbW9kZWxFbnRyeS5pZmNNb2RlbElEICE9PSB1bmRlZmluZWQpIHtcbiAgICB0cnkgeyBpZmNBcGkuQ2xvc2VNb2RlbChtb2RlbEVudHJ5LmlmY01vZGVsSUQpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUud2FybignQ291bGQgbm90IGNsb3NlIElGQyBtb2RlbDonLCBlKTsgfVxuICB9XG5cbiAgLy8gUmVtb3ZlIGFsbCBlbGVtZW50SW5kZXggZW50cmllcyBiZWxvbmdpbmcgdG8gdGhpcyBtb2RlbFxuICBmb3IgKGNvbnN0IFtrZXksIHZhbF0gb2YgZWxlbWVudEluZGV4LmVudHJpZXMoKSkge1xuICAgIGlmICh2YWwubW9kZWxEb2NOYW1lID09PSBtb2RlbERvY05hbWUgfHwga2V5LnN0YXJ0c1dpdGgoYCR7bW9kZWxEb2NOYW1lfTpgKSkge1xuICAgICAgZWxlbWVudEluZGV4LmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgfVxuXG4gIGZlZGVyYXRlZEdyb3VwLnJlbW92ZShtb2RlbEVudHJ5Lmdyb3VwKTtcbiAgZGlzcG9zZUdyb3VwKG1vZGVsRW50cnkuZ3JvdXApO1xuICBsb2FkZWRNb2RlbHMuZGVsZXRlKG1vZGVsRG9jTmFtZSk7XG4gIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XG4gIHJlbmRlck1vZGVsc0xpc3QoKTtcbiAgc2V0U3RhdHVzKGBVbmxvYWRlZCAke21vZGVsRW50cnkubW9kZWxOYW1lfWApO1xufVxuXG5mdW5jdGlvbiB1bmxvYWRBbGxNb2RlbHMoKSB7XG4gIGxvYWRlZE1vZGVscy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgIGlmIChpZmNBcGkgJiYgZW50cnkuaWZjTW9kZWxJRCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0cnkgeyBpZmNBcGkuQ2xvc2VNb2RlbChlbnRyeS5pZmNNb2RlbElEKTsgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gICAgZmVkZXJhdGVkR3JvdXAucmVtb3ZlKGVudHJ5Lmdyb3VwKTtcbiAgICBkaXNwb3NlR3JvdXAoZW50cnkuZ3JvdXApO1xuICB9KTtcbiAgbG9hZGVkTW9kZWxzLmNsZWFyKCk7XG4gIGVsZW1lbnRJbmRleC5jbGVhcigpO1xuICBlbGVtZW50TWVzaGVzID0gW107XG4gIGNsYXNoSGVscGVyc0dyb3VwLmNsZWFyKCk7XG4gIGNsZWFyU2VsZWN0aW9uKCk7XG4gIHJlbmRlck1vZGVsc0xpc3QoKTtcbiAgc2V0U3RhdHVzKCdBbGwgbW9kZWxzIGNsZWFyZWQnKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlRWxlbWVudE1lc2hlc0xpc3QoKSB7XG4gIGVsZW1lbnRNZXNoZXMgPSBbXTtcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goKGVudHJ5LCBtb2RlbERvY05hbWUpID0+IHtcbiAgICBlbnRyeS5leHByZXNzTWFwLmZvckVhY2goKG1lc2hlcywgZXhwcmVzc0lEKSA9PiB7XG4gICAgICBtZXNoZXMuZm9yRWFjaChtID0+IHtcbiAgICAgICAgbS51c2VyRGF0YS5tb2RlbERvY05hbWUgPSBtb2RlbERvY05hbWU7XG4gICAgICAgIG0udXNlckRhdGEuZGlzY2lwbGluZSA9IGVudHJ5LmRpc2NpcGxpbmU7XG4gICAgICAgIGVsZW1lbnRNZXNoZXMucHVzaCh7IG1lc2g6IG0sIGV4cHJlc3NJRCwgbW9kZWxEb2NOYW1lLCBkaXNjaXBsaW5lOiBlbnRyeS5kaXNjaXBsaW5lIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkaXNwb3NlR3JvdXAoZ3JvdXApIHtcbiAgZ3JvdXAudHJhdmVyc2UobyA9PiB7XG4gICAgaWYgKG8uaXNNZXNoKSB7XG4gICAgICBpZiAoby5nZW9tZXRyeSkgby5nZW9tZXRyeS5kaXNwb3NlKCk7XG4gICAgICBpZiAoby5tYXRlcmlhbCkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvLm1hdGVyaWFsKSkgby5tYXRlcmlhbC5mb3JFYWNoKG0gPT4gbS5kaXNwb3NlKCkpO1xuICAgICAgICBlbHNlIG8ubWF0ZXJpYWwuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gRGlzY2lwbGluZSBMYXllciBDb250cm9scyAoVmlzaWJpbGl0eSwgR2hvc3RpbmcsIE9wYWNpdHkpIC0tLS0tLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGluaXREaXNjaXBsaW5lQ29udHJvbHMoKSB7XG4gIGNvbnN0IHJvd3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGlzY2lwbGluZS1sYXllci1yb3cnKTtcbiAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgY29uc3QgZGlzYyA9IHJvdy5kYXRhc2V0LmRpc2NpcGxpbmU7XG4gICAgY29uc3QgYnRuVmlzID0gcm93LnF1ZXJ5U2VsZWN0b3IoJy5idG4tdmlzJyk7XG4gICAgY29uc3QgYnRuR2hvc3QgPSByb3cucXVlcnlTZWxlY3RvcignLmJ0bi1naG9zdCcpO1xuICAgIGNvbnN0IGJ0blNvbG8gPSByb3cucXVlcnlTZWxlY3RvcignLmJ0bi1zb2xvJyk7XG4gICAgY29uc3Qgc2xpZGVyID0gcm93LnF1ZXJ5U2VsZWN0b3IoJy5kaXNjLW9wYWNpdHktc2xpZGVyJyk7XG4gICAgY29uc3QgdmFsVGV4dCA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGlzYy1vcGFjaXR5LXZhbCcpO1xuXG4gICAgaWYgKGJ0blZpcykge1xuICAgICAgYnRuVmlzLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzQ3VycmVudGx5VmlzID0gYnRuVmlzLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJyk7XG4gICAgICAgIHNldERpc2NpcGxpbmVWaXNpYmlsaXR5KGRpc2MsICFpc0N1cnJlbnRseVZpcyk7XG4gICAgICAgIGJ0blZpcy5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCAhaXNDdXJyZW50bHlWaXMpO1xuICAgICAgICBidG5WaXMudGV4dENvbnRlbnQgPSAhaXNDdXJyZW50bHlWaXMgPyAnXHVEODNEXHVEQzQxJyA6ICdcdUQ4M0RcdURFQUInO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoYnRuR2hvc3QpIHtcbiAgICAgIGJ0bkdob3N0Lm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzR2hvc3QgPSBidG5HaG9zdC5jbGFzc0xpc3QuY29udGFpbnMoJ2dob3N0LWFjdGl2ZScpO1xuICAgICAgICBzZXREaXNjaXBsaW5lR2hvc3RpbmcoZGlzYywgIWlzR2hvc3QpO1xuICAgICAgICBidG5HaG9zdC5jbGFzc0xpc3QudG9nZ2xlKCdnaG9zdC1hY3RpdmUnLCAhaXNHaG9zdCk7XG4gICAgICAgIGlmICghaXNHaG9zdCkge1xuICAgICAgICAgIGlmIChzbGlkZXIpIHNsaWRlci52YWx1ZSA9IDIwO1xuICAgICAgICAgIGlmICh2YWxUZXh0KSB2YWxUZXh0LnRleHRDb250ZW50ID0gJzIwJSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHNsaWRlcikgc2xpZGVyLnZhbHVlID0gMTAwO1xuICAgICAgICAgIGlmICh2YWxUZXh0KSB2YWxUZXh0LnRleHRDb250ZW50ID0gJzEwMCUnO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChidG5Tb2xvKSB7XG4gICAgICBidG5Tb2xvLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHJvd3MuZm9yRWFjaChyID0+IHtcbiAgICAgICAgICBjb25zdCBkID0gci5kYXRhc2V0LmRpc2NpcGxpbmU7XG4gICAgICAgICAgY29uc3QgdkJ0biA9IHIucXVlcnlTZWxlY3RvcignLmJ0bi12aXMnKTtcbiAgICAgICAgICBpZiAoZCA9PT0gZGlzYykge1xuICAgICAgICAgICAgc2V0RGlzY2lwbGluZVZpc2liaWxpdHkoZCwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAodkJ0bikgeyB2QnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOyB2QnRuLnRleHRDb250ZW50ID0gJ1x1RDgzRFx1REM0MSc7IH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0RGlzY2lwbGluZVZpc2liaWxpdHkoZCwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKHZCdG4pIHsgdkJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTsgdkJ0bi50ZXh0Q29udGVudCA9ICdcdUQ4M0RcdURFQUInOyB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc2V0U3RhdHVzKGBTb2xvOiAke2Rpc2N9YCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChzbGlkZXIpIHtcbiAgICAgIHNsaWRlci5vbmlucHV0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBvcFZhbCA9IHBhcnNlSW50KHNsaWRlci52YWx1ZSwgMTApIC8gMTAwLjA7XG4gICAgICAgIGlmICh2YWxUZXh0KSB2YWxUZXh0LnRleHRDb250ZW50ID0gYCR7c2xpZGVyLnZhbHVlfSVgO1xuICAgICAgICBzZXREaXNjaXBsaW5lT3BhY2l0eShkaXNjLCBvcFZhbCk7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldERpc2NpcGxpbmVWaXNpYmlsaXR5KGRpc2NpcGxpbmUsIHZpc2libGUpIHtcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goZW50cnkgPT4ge1xuICAgIGlmIChkaXNjaXBsaW5lTWF0Y2hlcyhlbnRyeS5kaXNjaXBsaW5lLCBkaXNjaXBsaW5lKSkge1xuICAgICAgZW50cnkudmlzaWJsZSA9IHZpc2libGU7XG4gICAgICBlbnRyeS5ncm91cC52aXNpYmxlID0gdmlzaWJsZTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXREaXNjaXBsaW5lR2hvc3RpbmcoZGlzY2lwbGluZSwgZ2hvc3RlZCkge1xuICBsb2FkZWRNb2RlbHMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NpcGxpbmUpKSB7XG4gICAgICBlbnRyeS5pc0dob3N0ZWQgPSBnaG9zdGVkO1xuICAgICAgZW50cnkuZ3JvdXAudHJhdmVyc2UobyA9PiB7XG4gICAgICAgIGlmIChvLmlzTWVzaCAmJiBvLm1hdGVyaWFsKSB7XG4gICAgICAgICAgaWYgKCFvLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzKSB7XG4gICAgICAgICAgICBvLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzID0ge1xuICAgICAgICAgICAgICBjb2xvcjogby5tYXRlcmlhbC5jb2xvci5jbG9uZSgpLFxuICAgICAgICAgICAgICBvcGFjaXR5OiBvLm1hdGVyaWFsLm9wYWNpdHksXG4gICAgICAgICAgICAgIHRyYW5zcGFyZW50OiBvLm1hdGVyaWFsLnRyYW5zcGFyZW50LFxuICAgICAgICAgICAgICBkZXB0aFdyaXRlOiBvLm1hdGVyaWFsLmRlcHRoV3JpdGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZ2hvc3RlZCkge1xuICAgICAgICAgICAgby5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgICAgICAgICBvLm1hdGVyaWFsLm9wYWNpdHkgPSAwLjIwO1xuICAgICAgICAgICAgby5tYXRlcmlhbC5kZXB0aFdyaXRlID0gZmFsc2U7XG4gICAgICAgICAgICBvLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweDk0YTNiOCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBvLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzO1xuICAgICAgICAgICAgby5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHAudHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBvLm1hdGVyaWFsLm9wYWNpdHkgPSBwLm9wYWNpdHk7XG4gICAgICAgICAgICBvLm1hdGVyaWFsLmRlcHRoV3JpdGUgPSBwLmRlcHRoV3JpdGU7XG4gICAgICAgICAgICBvLm1hdGVyaWFsLmNvbG9yLmNvcHkocC5jb2xvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXREaXNjaXBsaW5lT3BhY2l0eShkaXNjaXBsaW5lLCBvcGFjaXR5KSB7XG4gIGxvYWRlZE1vZGVscy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICBpZiAoZGlzY2lwbGluZU1hdGNoZXMoZW50cnkuZGlzY2lwbGluZSwgZGlzY2lwbGluZSkpIHtcbiAgICAgIGVudHJ5Lm9wYWNpdHkgPSBvcGFjaXR5O1xuICAgICAgZW50cnkuZ3JvdXAudHJhdmVyc2UobyA9PiB7XG4gICAgICAgIGlmIChvLmlzTWVzaCAmJiBvLm1hdGVyaWFsKSB7XG4gICAgICAgICAgaWYgKCFvLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzKSB7XG4gICAgICAgICAgICBvLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzID0ge1xuICAgICAgICAgICAgICBjb2xvcjogby5tYXRlcmlhbC5jb2xvci5jbG9uZSgpLFxuICAgICAgICAgICAgICBvcGFjaXR5OiBvLm1hdGVyaWFsLm9wYWNpdHksXG4gICAgICAgICAgICAgIHRyYW5zcGFyZW50OiBvLm1hdGVyaWFsLnRyYW5zcGFyZW50LFxuICAgICAgICAgICAgICBkZXB0aFdyaXRlOiBvLm1hdGVyaWFsLmRlcHRoV3JpdGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBvLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gb3BhY2l0eSA8IDAuOTg7XG4gICAgICAgICAgby5tYXRlcmlhbC5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICAgICAgICBvLm1hdGVyaWFsLmRlcHRoV3JpdGUgPSBvcGFjaXR5ID49IDAuODU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRpc2NpcGxpbmVNYXRjaGVzKG1vZGVsRGlzYywgdGFyZ2V0RGlzYykge1xuICBpZiAoIW1vZGVsRGlzYyB8fCAhdGFyZ2V0RGlzYykgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBtID0gbW9kZWxEaXNjLnRvTG93ZXJDYXNlKCk7XG4gIGNvbnN0IHQgPSB0YXJnZXREaXNjLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChtID09PSB0KSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHQgPT09ICdtZXAnICYmIChtLmluY2x1ZGVzKCdodmFjJykgfHwgbS5pbmNsdWRlcygncGx1bWInKSB8fCBtLmluY2x1ZGVzKCdlbGVjJykgfHwgbS5pbmNsdWRlcygnbWVjaCcpKSkgcmV0dXJuIHRydWU7XG4gIGlmICh0ID09PSAnc3RydWN0dXJhbCcgJiYgKG0uaW5jbHVkZXMoJ3N0cnVjJykgfHwgbS5pbmNsdWRlcygnc3RyJykpKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHQgPT09ICdhcmNoaXRlY3R1cmUnICYmIChtLmluY2x1ZGVzKCdhcmsnKSB8fCBtLmluY2x1ZGVzKCdhcmNoJykpKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxyXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gRWxlbWVudCBTZWxlY3Rpb24gJiBQcm9wZXJ0eSBJbnNwZWN0b3IgLS0tLS0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gY2xlYXJTZWxlY3Rpb24oKSB7XG4gIGN1cnJlbnRTZWxlY3Rpb24gPSBudWxsO1xuICBpZiAoZWxzLnByb3BzKSBlbHMucHJvcHMuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+Tm8gc2VsZWN0aW9uPC9kaXY+JztcbiAgaWYgKGVscy5wcm9wc1RpdGxlKSB7XG4gICAgZWxzLnByb3BzVGl0bGUudGV4dENvbnRlbnQgPSAnQ2xpY2sgYW4gZWxlbWVudCBpbiB0aGUgdmlld2VyJztcbiAgICBlbHMucHJvcHNUaXRsZS5jbGFzc05hbWUgPSAnZW1wdHktaGludCc7XG4gIH1cbiAgaWYgKGVscy5saW5rcykgZWxzLmxpbmtzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGxpbmtzPC9kaXY+JztcblxuICBlbGVtZW50TWVzaGVzLmZvckVhY2goKHsgbWVzaCB9KSA9PiB7XG4gICAgaWYgKG1lc2gudXNlckRhdGEub3JpZ0NvbG9yKSB7XG4gICAgICBtZXNoLm1hdGVyaWFsLmNvbG9yLmNvcHkobWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpO1xuICAgIH1cbiAgICBpZiAobWVzaC5tYXRlcmlhbC5lbWlzc2l2ZSkgbWVzaC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoMHgwMDAwMDApO1xuICAgIGNvbnN0IHAgPSBtZXNoLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzO1xuICAgIGlmIChwKSB7XG4gICAgICBtZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gcC50cmFuc3BhcmVudDtcbiAgICAgIG1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IHAub3BhY2l0eTtcbiAgICAgIG1lc2gubWF0ZXJpYWwuZGVwdGhXcml0ZSA9IHAuZGVwdGhXcml0ZTtcbiAgICB9XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZWxlY3RFbGVtZW50KG1lc2gsIGV4cHJlc3NJRCwgbW9kZWxEb2NOYW1lKSB7XG4gIGNsZWFyU2VsZWN0aW9uKCk7XG4gIGNvbnN0IGxvb2t1cEtleSA9IGAke21vZGVsRG9jTmFtZX06JHtleHByZXNzSUR9YDtcbiAgbGV0IGVsID0gZWxlbWVudEluZGV4LmdldChsb29rdXBLZXkpIHx8IGVsZW1lbnRJbmRleC5nZXQoU3RyaW5nKGV4cHJlc3NJRCkpIHx8IG1lc2gudXNlckRhdGEuZWxlbWVudDtcblxuICBjdXJyZW50U2VsZWN0aW9uID0geyBtZXNoLCBlbGVtZW50OiBlbCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWUgfTtcblxuICBpZiAoIW1lc2gudXNlckRhdGEub3JpZ0NvbG9yKSBtZXNoLnVzZXJEYXRhLm9yaWdDb2xvciA9IG1lc2gubWF0ZXJpYWwuY29sb3IuY2xvbmUoKTtcbiAgbWVzaC5tYXRlcmlhbC5jb2xvci5jb3B5KGhpZ2hsaWdodE1hdC5jb2xvcik7XG4gIGlmIChtZXNoLm1hdGVyaWFsLmVtaXNzaXZlKSBtZXNoLm1hdGVyaWFsLmVtaXNzaXZlLmNvcHkoaGlnaGxpZ2h0TWF0LmVtaXNzaXZlKTtcblxuICBjb25zdCBtb2RlbEVudHJ5ID0gbG9hZGVkTW9kZWxzLmdldChtb2RlbERvY05hbWUpO1xuICBjb25zdCBkaXNjaXBsaW5lID0gKG1vZGVsRW50cnkgJiYgbW9kZWxFbnRyeS5kaXNjaXBsaW5lKSB8fCBtZXNoLnVzZXJEYXRhLmRpc2NpcGxpbmUgfHwgJ0Rpc2NpcGxpbmUnO1xuICBjb25zdCBtb2RlbE5hbWUgPSAobW9kZWxFbnRyeSAmJiBtb2RlbEVudHJ5Lm1vZGVsTmFtZSkgfHwgbW9kZWxEb2NOYW1lO1xuXG4gIHJlbmRlckVsZW1lbnRJbnNwZWN0b3IoZWwsIGV4cHJlc3NJRCwgbW9kZWxOYW1lLCBkaXNjaXBsaW5lLCBtZXNoKTtcblxuICBpZiAoZWwgJiYgKCFlbC5wcm9wZXJ0aWVzIHx8ICFPYmplY3Qua2V5cyhlbC5wcm9wZXJ0aWVzKS5sZW5ndGgpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGZ1bGxEb2MgPSBhd2FpdCBmcmFwcGUuY2FsbCh7IG1ldGhvZDogQVBJLmdldF9lbGVtZW50LCBhcmdzOiB7IGVsZW1lbnQ6IGVsLm5hbWUgfSB9KTtcbiAgICAgIGlmIChmdWxsRG9jLm1lc3NhZ2UgJiYgY3VycmVudFNlbGVjdGlvbiAmJiBjdXJyZW50U2VsZWN0aW9uLmV4cHJlc3NJRCA9PT0gZXhwcmVzc0lEKSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZWwsIGZ1bGxEb2MubWVzc2FnZSk7XG4gICAgICAgIHJlbmRlckVsZW1lbnRJbnNwZWN0b3IoZWwsIGV4cHJlc3NJRCwgbW9kZWxOYW1lLCBkaXNjaXBsaW5lLCBtZXNoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7fVxuICB9IGVsc2UgaWYgKCFlbCAmJiBtb2RlbEVudHJ5ICYmIGlmY0FwaSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBsaW5lRGF0YSA9IGF3YWl0IGlmY0FwaS5HZXRMaW5lKG1vZGVsRW50cnkuaWZjTW9kZWxJRCwgZXhwcmVzc0lEKTtcbiAgICAgIHJlbmRlcldlYklmY0luc3BlY3RvcihleHByZXNzSUQsIGxpbmVEYXRhLCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyRWxlbWVudEluc3BlY3RvcihlbCwgZXhwcmVzc0lELCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUsIG1lc2gpIHtcbiAgaWYgKCFlbHMucHJvcHNUaXRsZSB8fCAhZWxzLnByb3BzKSByZXR1cm47XG5cbiAgY29uc3QgdGl0bGUgPSAoZWwgJiYgKGVsLnRpdGxlIHx8IGVsLmVsZW1lbnRfdHlwZSkpIHx8IGBJRkMgIyR7ZXhwcmVzc0lEfWA7XG4gIGNvbnN0IGd1aWQgPSAoZWwgJiYgZWwuc3RhYmxlX2lkKSB8fCAnJztcbiAgZWxzLnByb3BzVGl0bGUudGV4dENvbnRlbnQgPSBgJHt0aXRsZX0gJHtndWlkID8gYCgke2d1aWR9KWAgOiAnJ31gO1xuICBlbHMucHJvcHNUaXRsZS5jbGFzc05hbWUgPSAnJztcbiAgZWxzLnByb3BzLmlubmVySFRNTCA9ICcnO1xuXG4gIC8vIEJhZGdlcyBIZWFkZXJcbiAgY29uc3QgYmFkZ2VzRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGJhZGdlc0Rpdi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnOHB4JztcbiAgYmFkZ2VzRGl2LmlubmVySFRNTCA9IGBcbiAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZSBtb2RlbC1iYWRnZVwiPiR7bW9kZWxOYW1lfTwvc3Bhbj5cbiAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZGlzY2lwbGluZX08L3NwYW4+XG4gICAgJHtlbCAmJiBlbC5zdG9yZXkgPyBgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2VcIj4ke2VsLnN0b3JleX08L3NwYW4+YCA6ICcnfVxuICAgIDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlXCI+IyR7ZXhwcmVzc0lEfTwvc3Bhbj5cbiAgYDtcbiAgZWxzLnByb3BzLmFwcGVuZENoaWxkKGJhZGdlc0Rpdik7XG5cbiAgLy8gQm91bmRpbmcgQm94IEluZm9cbiAgaWYgKG1lc2ggJiYgbWVzaC5nZW9tZXRyeSkge1xuICAgIGlmICghbWVzaC5nZW9tZXRyeS5ib3VuZGluZ0JveCkgbWVzaC5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdCb3goKTtcbiAgICBjb25zdCBib3ggPSBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94LmNsb25lKCkuYXBwbHlNYXRyaXg0KG1lc2gubWF0cml4V29ybGQpO1xuICAgIGNvbnN0IHNpemUgPSBib3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKTtcbiAgICBjb25zdCBjZW50ZXIgPSBib3guZ2V0Q2VudGVyKG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xuXG4gICAgY29uc3QgYmJveEhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGJib3hIZWFkZXIuc3R5bGUuY3NzVGV4dCA9ICdmb250LXdlaWdodDo2MDA7Zm9udC1zaXplOjEycHg7bWFyZ2luOjhweCAwIDRweDtjb2xvcjojMWUyOTNiJztcbiAgICBiYm94SGVhZGVyLnRleHRDb250ZW50ID0gJ1NwYXRpYWwgRGltZW5zaW9ucyc7XG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKGJib3hIZWFkZXIpO1xuXG4gICAgY29uc3QgYmJveFRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICBiYm94VGFibGUuY2xhc3NOYW1lID0gJ3Byb3BlcnR5LXRhYmxlJztcbiAgICBiYm94VGFibGUuaW5uZXJIVE1MID0gYFxuICAgICAgPHRyPjx0ZD5TaXplIChYIFx1MDBENyBZIFx1MDBENyBaKTwvdGQ+PHRkPiR7c2l6ZS54LnRvRml4ZWQoMil9bSBcdTAwRDcgJHtzaXplLnkudG9GaXhlZCgyKX1tIFx1MDBENyAke3NpemUuei50b0ZpeGVkKDIpfW08L3RkPjwvdHI+XG4gICAgICA8dHI+PHRkPkNlbnRlciBQb2ludDwvdGQ+PHRkPigke2NlbnRlci54LnRvRml4ZWQoMil9LCAke2NlbnRlci55LnRvRml4ZWQoMil9LCAke2NlbnRlci56LnRvRml4ZWQoMil9KTwvdGQ+PC90cj5cbiAgICBgO1xuICAgIGVscy5wcm9wcy5hcHBlbmRDaGlsZChiYm94VGFibGUpO1xuICB9XG5cbiAgLy8gUXVhbnRpdGllcyBUYWJsZVxuICBjb25zdCBxID0gKGVsICYmIGVsLnF1YW50aXRpZXMpIHx8IHt9O1xuICBjb25zdCBxS2V5cyA9IE9iamVjdC5rZXlzKHEpO1xuICBpZiAocUtleXMubGVuZ3RoKSB7XG4gICAgY29uc3QgcUhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHFIZWFkZXIuc3R5bGUuY3NzVGV4dCA9ICdmb250LXdlaWdodDo2MDA7Zm9udC1zaXplOjEycHg7bWFyZ2luOjEwcHggMCA0cHg7Y29sb3I6IzFlMjkzYic7XG4gICAgcUhlYWRlci50ZXh0Q29udGVudCA9ICdRdWFudGl0aWVzIChRdG9fKiknO1xuICAgIGVscy5wcm9wcy5hcHBlbmRDaGlsZChxSGVhZGVyKTtcblxuICAgIGNvbnN0IHFUYWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XG4gICAgcVRhYmxlLmNsYXNzTmFtZSA9ICdwcm9wZXJ0eS10YWJsZSc7XG4gICAgcUtleXMuZm9yRWFjaChrID0+IHtcbiAgICAgIGNvbnN0IHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICAgIHRyLmlubmVySFRNTCA9IGA8dGQ+JHtrfTwvdGQ+PHRkPiR7cVtrXX08L3RkPmA7XG4gICAgICBxVGFibGUuYXBwZW5kQ2hpbGQodHIpO1xuICAgIH0pO1xuICAgIGVscy5wcm9wcy5hcHBlbmRDaGlsZChxVGFibGUpO1xuICB9XG5cbiAgLy8gUHJvcGVydHkgU2V0cyBUYWJsZVxuICBjb25zdCBwID0gKGVsICYmIGVsLnByb3BlcnRpZXMpIHx8IHt9O1xuICBjb25zdCBwS2V5cyA9IE9iamVjdC5rZXlzKHApLmZpbHRlcihrID0+ICFbJ2lmY19pZCcsICdpZmNfdHlwZSddLmluY2x1ZGVzKGspKTtcbiAgaWYgKHBLZXlzLmxlbmd0aCkge1xuICAgIGNvbnN0IHBIZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwSGVhZGVyLnN0eWxlLmNzc1RleHQgPSAnZm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxMnB4O21hcmdpbjoxMHB4IDAgNHB4O2NvbG9yOiMxZTI5M2InO1xuICAgIHBIZWFkZXIudGV4dENvbnRlbnQgPSAnUHJvcGVydHkgU2V0cyAoUHNldF8qKSc7XG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHBIZWFkZXIpO1xuXG4gICAgY29uc3QgcFRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICBwVGFibGUuY2xhc3NOYW1lID0gJ3Byb3BlcnR5LXRhYmxlJztcbiAgICBwS2V5cy5zbGljZSgwLCA1MCkuZm9yRWFjaChrID0+IHtcbiAgICAgIGNvbnN0IHYgPSB0eXBlb2YgcFtrXSA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeShwW2tdKSA6IFN0cmluZyhwW2tdKTtcbiAgICAgIGNvbnN0IHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICAgIHRyLmlubmVySFRNTCA9IGA8dGQ+JHtrfTwvdGQ+PHRkPiR7di5zbGljZSgwLCA3MCl9PC90ZD5gO1xuICAgICAgcFRhYmxlLmFwcGVuZENoaWxkKHRyKTtcbiAgICB9KTtcbiAgICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQocFRhYmxlKTtcbiAgfVxuXG4gIGlmIChlbCAmJiBlbC5uYW1lKSBsb2FkQm9xTGlua3MoZWwubmFtZSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcldlYklmY0luc3BlY3RvcihleHByZXNzSUQsIHByb3BzLCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUpIHtcbiAgaWYgKCFlbHMucHJvcHNUaXRsZSB8fCAhZWxzLnByb3BzKSByZXR1cm47XG4gIGVscy5wcm9wc1RpdGxlLnRleHRDb250ZW50ID0gYElGQyAjJHtleHByZXNzSUR9ICR7cHJvcHMudHlwZSB8fCAnJ31gO1xuICBlbHMucHJvcHNUaXRsZS5jbGFzc05hbWUgPSAnJztcbiAgZWxzLnByb3BzLmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTo4cHhcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlIG1vZGVsLWJhZGdlXCI+JHttb2RlbE5hbWV9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2VcIj4ke2Rpc2NpcGxpbmV9PC9zcGFuPlxuICAgIDwvZGl2PlxuICBgO1xuXG4gIGNvbnN0IHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgdGFibGUuY2xhc3NOYW1lID0gJ3Byb3BlcnR5LXRhYmxlJztcbiAgT2JqZWN0LmtleXMocHJvcHMpLnNsaWNlKDAsIDMwKS5mb3JFYWNoKGsgPT4ge1xuICAgIGNvbnN0IHYgPSBwcm9wc1trXTtcbiAgICBjb25zdCB2YWwgPSB2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2LnZhbHVlICE9PSB1bmRlZmluZWQgPyB2LnZhbHVlIDogKHR5cGVvZiB2ID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHYpLnNsaWNlKDAsIDYwKSA6IHYpO1xuICAgIGNvbnN0IHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICB0ci5pbm5lckhUTUwgPSBgPHRkPiR7a308L3RkPjx0ZD4ke1N0cmluZyh2YWwpfTwvdGQ+YDtcbiAgICB0YWJsZS5hcHBlbmRDaGlsZCh0cik7XG4gIH0pO1xuICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQodGFibGUpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkQm9xTGlua3MoYmltRWxlbWVudCkge1xuICBpZiAoIWVscy5saW5rcykgcmV0dXJuO1xuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkubGlzdF9ib3FfbGlua3MsIGFyZ3M6IHsgYmltX2VsZW1lbnQ6IGJpbUVsZW1lbnQgfSB9KTtcbiAgICBjb25zdCBsaW5rcyA9IHJlcy5tZXNzYWdlIHx8IFtdO1xuICAgIGlmICghbGlua3MubGVuZ3RoKSB7XG4gICAgICBlbHMubGlua3MuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+Tm8gbGlua3MgZm9yIGN1cnJlbnQgZWxlbWVudDwvZGl2Pic7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVscy5saW5rcy5pbm5lckhUTUwgPSBsaW5rcy5tYXAobCA9PiBgXG4gICAgICA8ZGl2IGNsYXNzPVwibGluay1yb3dcIiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzo0cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZjFmNWY5O2ZvbnQtc2l6ZToxMnB4XCI+XG4gICAgICAgIDxzcGFuPiR7bC5ib3FfcmVmZXJlbmNlX25hbWV9IDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlXCI+JHtsLmJvcV9yZWZlcmVuY2VfdHlwZX08L3NwYW4+PC9zcGFuPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZGVsXCIgZGF0YS1uYW1lPVwiJHtsLm5hbWV9XCIgc3R5bGU9XCJjb2xvcjojZWY0NDQ0O2JvcmRlcjpub25lO2JhY2tncm91bmQ6bm9uZTtjdXJzb3I6cG9pbnRlclwiPlx1MjcxNTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgYCkuam9pbignJyk7XG5cbiAgICBlbHMubGlua3MucXVlcnlTZWxlY3RvckFsbCgnLmRlbCcpLmZvckVhY2goYiA9PiB7XG4gICAgICBiLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkuZGVsZXRlX2JvcV9saW5rLCBhcmdzOiB7IGxpbms6IGIuZGF0YXNldC5uYW1lIH0gfSk7XG4gICAgICAgIGxvYWRCb3FMaW5rcyhiaW1FbGVtZW50KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlbHMubGlua3MuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+RXJyb3IgbG9hZGluZyBsaW5rczwvZGl2Pic7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLSBJbi1WaWV3ZXIgQlZIIENsYXNoIERldGVjdGlvbiBFbmdpbmUgLS0tLS0tLS0tLS0tLS0tLVxuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNsYXNoRGV0ZWN0aW9uKCkge1xuICBjb25zdCBkaXNjQSA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtZGlzYy1hJykgfHwge30pLnZhbHVlIHx8ICdTdHJ1Y3R1cmFsJztcbiAgY29uc3QgZGlzY0IgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRpc2MtYicpIHx8IHt9KS52YWx1ZSB8fCAnTUVQJztcbiAgY29uc3QgdG9sSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtdG9sZXJhbmNlJyk7XG4gIGNvbnN0IHRvbGVyYW5jZSA9IHRvbElucHV0ID8gcGFyc2VGbG9hdCh0b2xJbnB1dC52YWx1ZSkgfHwgMC4wIDogMC4wO1xuXG4gIHNldFN0YXR1cyhgUnVubmluZyBCVkggY2xhc2ggY2hlY2sgYmV0d2VlbiAke2Rpc2NBfSBhbmQgJHtkaXNjQn1cdTIwMjZgKTtcbiAgc2hvd0xvYWRpbmcoJ0NvbXB1dGluZyBtZXNoIEJWSCBpbnRlcnNlY3Rpb25zXHUyMDI2JywgdHJ1ZSk7XG5cbiAgY29uc3QgbWVzaGVzQSA9IFtdO1xuICBjb25zdCBtZXNoZXNCID0gW107XG5cbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goZW50cnkgPT4ge1xuICAgIGlmIChkaXNjaXBsaW5lTWF0Y2hlcyhlbnRyeS5kaXNjaXBsaW5lLCBkaXNjQSkpIHtcbiAgICAgIGVudHJ5Lmdyb3VwLnRyYXZlcnNlKG8gPT4geyBpZiAoby5pc01lc2gpIG1lc2hlc0EucHVzaChvKTsgfSk7XG4gICAgfVxuICAgIGlmIChkaXNjaXBsaW5lTWF0Y2hlcyhlbnRyeS5kaXNjaXBsaW5lLCBkaXNjQikpIHtcbiAgICAgIGVudHJ5Lmdyb3VwLnRyYXZlcnNlKG8gPT4geyBpZiAoby5pc01lc2gpIG1lc2hlc0IucHVzaChvKTsgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoIW1lc2hlc0EubGVuZ3RoIHx8ICFtZXNoZXNCLmxlbmd0aCkge1xuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XG4gICAgc2V0U3RhdHVzKGBDYW5ub3QgcnVuIGNsYXNoIGNoZWNrOiBNYWtlIHN1cmUgbW9kZWxzIGZvciBib3RoICR7ZGlzY0F9IGFuZCAke2Rpc2NCfSBhcmUgbG9hZGVkLmApO1xuICAgIGlmIChlbHMuY2xhc2hDYXJkc0xpc3QpIHtcbiAgICAgIGVscy5jbGFzaENhcmRzTGlzdC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5Mb2FkIG1vZGVscyBmb3IgYm90aCAke2Rpc2NBfSBhbmQgJHtkaXNjQn0gZmlyc3Q8L2Rpdj5gO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBFeGVjdXRlIHR3by10aWVyIEJWSCBjb2xsaXNpb24gZGV0ZWN0aW9uXG4gIGNvbnN0IHN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICBjb25zdCByZXN1bHQgPSBkZXRlY3RDbGFzaGVzKG1lc2hlc0EsIG1lc2hlc0IsIHsgdG9sZXJhbmNlIH0pO1xuICBjb25zdCBkdXJhdGlvbiA9IChwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZSkudG9GaXhlZCgwKTtcblxuICBkZXRlY3RlZENsYXNoZXMgPSByZXN1bHQuY2xhc2hlcyB8fCBbXTtcbiAgc2V0U3RhdHVzKGBDbGFzaCBjaGVjayBjb21wbGV0ZTogJHtkZXRlY3RlZENsYXNoZXMubGVuZ3RofSBjbGFzaGVzIGRldGVjdGVkIGluICR7ZHVyYXRpb259bXMgKCR7cmVzdWx0LnN0YXRzLm5hcnJvd3BoYXNlQ2hlY2tzfSBCVkggY2hlY2tzKWApO1xuICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuXG4gIHJlbmRlckNsYXNoZXNMaXN0KCk7XG5cbiAgLy8gU3dpdGNoIHRvIENsYXNoZXMgdGFiXG4gIGNvbnN0IHRhYkJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWItYnRuLWNsYXNoZXMnKTtcbiAgaWYgKHRhYkJ0bikgdGFiQnRuLmNsaWNrKCk7XG59XHJcblxuZnVuY3Rpb24gcmVuZGVyQ2xhc2hlc0xpc3QoKSB7XG4gIGlmICghZWxzLmNsYXNoQ2FyZHNMaXN0KSByZXR1cm47XG4gIGVscy5jbGFzaENhcmRzTGlzdC5pbm5lckhUTUwgPSAnJztcblxuICBpZiAoZWxzLmNsYXNoQmFkZ2VDb3VudCkge1xuICAgIGVscy5jbGFzaEJhZGdlQ291bnQudGV4dENvbnRlbnQgPSBkZXRlY3RlZENsYXNoZXMubGVuZ3RoO1xuICAgIGVscy5jbGFzaEJhZGdlQ291bnQuc3R5bGUuZGlzcGxheSA9IGRldGVjdGVkQ2xhc2hlcy5sZW5ndGggPyAnaW5saW5lLWJsb2NrJyA6ICdub25lJztcbiAgfVxuXG4gIGlmICghZGV0ZWN0ZWRDbGFzaGVzLmxlbmd0aCkge1xuICAgIGVscy5jbGFzaENhcmRzTGlzdC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5ObyBjbGFzaGVzIGRldGVjdGVkIGJldHdlZW4gc2VsZWN0ZWQgZGlzY2lwbGluZXMhPC9kaXY+JztcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBzZXZGaWx0ZXIgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWZpbHRlci1zZXZlcml0eScpIHx8IHt9KS52YWx1ZSB8fCAnJztcbiAgY29uc3QgZmlsdGVyZWQgPSBzZXZGaWx0ZXIgPyBkZXRlY3RlZENsYXNoZXMuZmlsdGVyKGMgPT4gYy5zZXZlcml0eSA9PT0gc2V2RmlsdGVyKSA6IGRldGVjdGVkQ2xhc2hlcztcblxuICBmaWx0ZXJlZC5mb3JFYWNoKChjbGFzaCkgPT4ge1xuICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjYXJkLmNsYXNzTmFtZSA9ICdjbGFzaC1jYXJkJyArIChhY3RpdmVDbGFzaCAmJiBhY3RpdmVDbGFzaC5pZCA9PT0gY2xhc2guaWQgPyAnIGFjdGl2ZScgOiAnJyk7XG4gICAgY29uc3QgcHQgPSBjbGFzaC5jb2xsaXNpb25Qb2ludDtcbiAgICBjb25zdCBzZXZDbGFzcyA9IGNsYXNoLnNldmVyaXR5ID8gYHNldmVyaXR5LSR7Y2xhc2guc2V2ZXJpdHkudG9Mb3dlckNhc2UoKX1gIDogJ3NldmVyaXR5LW1pbm9yJztcblxuICAgIGNhcmQuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNhcmQtdGl0bGVcIj4ke2NsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmV9ICMke2NsYXNoLmVsZW1lbnRBLmV4cHJlc3NJRH0gXHUwMEQ3ICR7Y2xhc2guZWxlbWVudEIuZGlzY2lwbGluZX0gIyR7Y2xhc2guZWxlbWVudEIuZXhwcmVzc0lEfTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNhcmQtbWV0YVwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZSAke3NldkNsYXNzfVwiPiR7Y2xhc2guc2V2ZXJpdHl9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZSBzdGF0dXMtb3BlblwiPiR7Y2xhc2guc3RhdHVzfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgbW9kZWwtYmFkZ2VcIj4ke2NsYXNoLmVsZW1lbnRBLmlmY1R5cGUgfHwgJ0VsZW1lbnQnfSAvICR7Y2xhc2guZWxlbWVudEIuaWZjVHlwZSB8fCAnRWxlbWVudCd9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY2FyZC1jb29yZHNcIj5YWVo6ICgke3B0LngudG9GaXhlZCgyKX0sICR7cHQueS50b0ZpeGVkKDIpfSwgJHtwdC56LnRvRml4ZWQoMil9KSB8IERlcHRoOiAke2NsYXNoLnBlbmV0cmF0aW9uRGVwdGggPyBjbGFzaC5wZW5ldHJhdGlvbkRlcHRoLnRvRml4ZWQoMSkgOiAnMCd9bW08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jYXJkLWFjdGlvbnNcIj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBidG4teHMgYnRuLWZseVwiPlx1RDgzQ1x1REZBRiBGbHktVG88L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG5cbiAgICBjYXJkLm9uY2xpY2sgPSAoKSA9PiBzZWxlY3RDbGFzaChjbGFzaCk7XG4gICAgY29uc3QgZmx5QnRuID0gY2FyZC5xdWVyeVNlbGVjdG9yKCcuYnRuLWZseScpO1xuICAgIGlmIChmbHlCdG4pIHtcbiAgICAgIGZseUJ0bi5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2VsZWN0Q2xhc2goY2xhc2gpO1xuICAgICAgICBmbHlUb0NsYXNoKGNsYXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZWxzLmNsYXNoQ2FyZHNMaXN0LmFwcGVuZENoaWxkKGNhcmQpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0Q2xhc2goY2xhc2gpIHtcbiAgYWN0aXZlQ2xhc2ggPSBjbGFzaDtcbiAgcmVuZGVyQ2xhc2hlc0xpc3QoKTtcbiAgaGlnaGxpZ2h0Q2xhc2hFbGVtZW50cyhjbGFzaCk7XG4gIHJlbmRlckNsYXNoRGV0YWlsVmlldyhjbGFzaCk7XG59XG5cbmZ1bmN0aW9uIGhpZ2hsaWdodENsYXNoRWxlbWVudHMoY2xhc2gpIHtcbiAgY2xhc2hIZWxwZXJzR3JvdXAuY2xlYXIoKTtcblxuICAvLyBHaG9zdCBiYWNrZ3JvdW5kIG1lc2hlc1xuICBlbGVtZW50TWVzaGVzLmZvckVhY2goKHsgbWVzaCB9KSA9PiB7XG4gICAgaWYgKCFtZXNoLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzKSB7XG4gICAgICBtZXNoLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzID0ge1xuICAgICAgICB0cmFuc3BhcmVudDogbWVzaC5tYXRlcmlhbC50cmFuc3BhcmVudCxcbiAgICAgICAgb3BhY2l0eTogbWVzaC5tYXRlcmlhbC5vcGFjaXR5LFxuICAgICAgICBkZXB0aFdyaXRlOiBtZXNoLm1hdGVyaWFsLmRlcHRoV3JpdGUsXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAobWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gubWF0ZXJpYWwuY29sb3IuY29weShtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcik7XG4gICAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4MDAwMDAwKTtcbiAgICBtZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICBtZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAwLjE1O1xuICB9KTtcblxuICBjb25zdCBtZXNoQSA9IGNsYXNoLmVsZW1lbnRBLm1lc2g7XG4gIGNvbnN0IG1lc2hCID0gY2xhc2guZWxlbWVudEIubWVzaDtcblxuICBpZiAobWVzaEEpIHtcbiAgICBpZiAoIW1lc2hBLnVzZXJEYXRhLm9yaWdDb2xvcikgbWVzaEEudXNlckRhdGEub3JpZ0NvbG9yID0gbWVzaEEubWF0ZXJpYWwuY29sb3IuY2xvbmUoKTtcbiAgICBtZXNoQS5tYXRlcmlhbC5jb2xvci5jb3B5KGNsYXNoTWF0QS5jb2xvcik7XG4gICAgaWYgKG1lc2hBLm1hdGVyaWFsLmVtaXNzaXZlKSBtZXNoQS5tYXRlcmlhbC5lbWlzc2l2ZS5jb3B5KGNsYXNoTWF0QS5lbWlzc2l2ZSk7XG4gICAgbWVzaEEubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBmYWxzZTtcbiAgICBtZXNoQS5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xuICB9XG5cbiAgaWYgKG1lc2hCKSB7XG4gICAgaWYgKCFtZXNoQi51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2hCLnVzZXJEYXRhLm9yaWdDb2xvciA9IG1lc2hCLm1hdGVyaWFsLmNvbG9yLmNsb25lKCk7XG4gICAgbWVzaEIubWF0ZXJpYWwuY29sb3IuY29weShjbGFzaE1hdEIuY29sb3IpO1xuICAgIGlmIChtZXNoQi5tYXRlcmlhbC5lbWlzc2l2ZSkgbWVzaEIubWF0ZXJpYWwuZW1pc3NpdmUuY29weShjbGFzaE1hdEIuZW1pc3NpdmUpO1xuICAgIG1lc2hCLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgbWVzaEIubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcbiAgfVxuXG4gIC8vIEFkZCBDZW50cm9pZCAzRCBQaW4gTWFya2VyXG4gIGNvbnN0IG1hcmtlciA9IGNyZWF0ZUNlbnRyb2lkTWFya2VyKGNsYXNoLmNvbGxpc2lvblBvaW50KTtcbiAgY2xhc2hIZWxwZXJzR3JvdXAuYWRkKG1hcmtlcik7XG5cbiAgLy8gQWRkIFdpcmVmcmFtZSBCb3VuZGluZyBCb3ggSGVscGVyXG4gIGlmIChjbGFzaC5ib3VuZGluZ0JveCkge1xuICAgIGNvbnN0IGJveEhlbHBlciA9IGNyZWF0ZUludGVyc2VjdGlvbkJveEhlbHBlcihjbGFzaC5ib3VuZGluZ0JveCk7XG4gICAgaWYgKGJveEhlbHBlcikgY2xhc2hIZWxwZXJzR3JvdXAuYWRkKGJveEhlbHBlcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmx5VG9DbGFzaChjbGFzaCkge1xuICBjb25zdCB0YXJnZXRQb3MgPSBuZXcgVEhSRUUuVmVjdG9yMyhjbGFzaC5jb2xsaXNpb25Qb2ludC54LCBjbGFzaC5jb2xsaXNpb25Qb2ludC55LCBjbGFzaC5jb2xsaXNpb25Qb2ludC56KTtcbiAgY29uc3QgZGlzdGFuY2UgPSA0LjU7XG4gIGNvbnN0IGNhbVBvcyA9IHRhcmdldFBvcy5jbG9uZSgpLmFkZChuZXcgVEhSRUUuVmVjdG9yMyhkaXN0YW5jZSAqIDAuNywgZGlzdGFuY2UgKiAwLjUsIGRpc3RhbmNlICogMC43KSk7XG5cbiAgY29uc3Qgc3RhcnRDYW0gPSBjYW1lcmEucG9zaXRpb24uY2xvbmUoKTtcbiAgY29uc3Qgc3RhcnRUYXJnZXQgPSBjb250cm9scy50YXJnZXQuY2xvbmUoKTtcbiAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIGNvbnN0IGR1cmF0aW9uID0gNzUwO1xuXG4gIGZ1bmN0aW9uIGFuaW1hdGVTdGVwKG5vdykge1xuICAgIGNvbnN0IHQgPSBNYXRoLm1pbigobm93IC0gc3RhcnRUaW1lKSAvIGR1cmF0aW9uLCAxLjApO1xuICAgIGNvbnN0IGVhc2UgPSB0IDwgMC41ID8gMiAqIHQgKiB0IDogLTEgKyAoNCAtIDIgKiB0KSAqIHQ7XG4gICAgY2FtZXJhLnBvc2l0aW9uLmxlcnBWZWN0b3JzKHN0YXJ0Q2FtLCBjYW1Qb3MsIGVhc2UpO1xuICAgIGNvbnRyb2xzLnRhcmdldC5sZXJwVmVjdG9ycyhzdGFydFRhcmdldCwgdGFyZ2V0UG9zLCBlYXNlKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgICBpZiAodCA8IDEuMCkgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVTdGVwKTtcbiAgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVN0ZXApO1xuICBzZXRTdGF0dXMoYEluc3BlY3RpbmcgJHtjbGFzaC5pZH0gYXQgKCR7dGFyZ2V0UG9zLngudG9GaXhlZCgyKX0sICR7dGFyZ2V0UG9zLnkudG9GaXhlZCgyKX0sICR7dGFyZ2V0UG9zLnoudG9GaXhlZCgyKX0pYCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gQ2xhc2ggRGV0YWlsICYgVGhyZWFkZWQgRGlzY3Vzc2lvbiBVSSAtLS0tLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiByZW5kZXJDbGFzaERldGFpbFZpZXcoY2xhc2gpIHtcbiAgaWYgKCFlbHMuY2xhc2hEZXRhaWxDb250YWluZXIgfHwgIWVscy5jbGFzaExpc3RDb250YWluZXIpIHJldHVybjtcbiAgZWxzLmNsYXNoTGlzdENvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBlbHMuY2xhc2hEZXRhaWxDb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kZXRhaWwtdGl0bGUnKTtcbiAgY29uc3QgbWV0YUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRldGFpbC1tZXRhJyk7XG4gIGNvbnN0IHNldkJhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRldGFpbC1zZXZlcml0eScpO1xuXG4gIGlmICh0aXRsZUVsKSB0aXRsZUVsLnRleHRDb250ZW50ID0gYCR7Y2xhc2guZWxlbWVudEEuZGlzY2lwbGluZX0gIyR7Y2xhc2guZWxlbWVudEEuZXhwcmVzc0lEfSBcdTAwRDcgJHtjbGFzaC5lbGVtZW50Qi5kaXNjaXBsaW5lfSAjJHtjbGFzaC5lbGVtZW50Qi5leHByZXNzSUR9YDtcbiAgaWYgKHNldkJhZGdlKSB7XG4gICAgc2V2QmFkZ2UudGV4dENvbnRlbnQgPSBjbGFzaC5zZXZlcml0eTtcbiAgICBzZXZCYWRnZS5jbGFzc05hbWUgPSBgYmltLWJhZGdlIHNldmVyaXR5LSR7KGNsYXNoLnNldmVyaXR5IHx8ICdtaW5vcicpLnRvTG93ZXJDYXNlKCl9YDtcbiAgfVxuICBpZiAobWV0YUVsKSB7XG4gICAgY29uc3QgcHQgPSBjbGFzaC5jb2xsaXNpb25Qb2ludDtcbiAgICBtZXRhRWwuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdj48c3Ryb25nPkNvbGxpc2lvbiBDb29yZGluYXRlczo8L3N0cm9uZz4gKCR7cHQueC50b0ZpeGVkKDIpfSwgJHtwdC55LnRvRml4ZWQoMil9LCAke3B0LnoudG9GaXhlZCgyKX0pPC9kaXY+XG4gICAgICA8ZGl2PjxzdHJvbmc+UGVuZXRyYXRpb24gRGVwdGg6PC9zdHJvbmc+ICR7KGNsYXNoLnBlbmV0cmF0aW9uRGVwdGggfHwgMCkudG9GaXhlZCgxKX0gbW0gfCA8c3Ryb25nPlZvbHVtZTo8L3N0cm9uZz4gJHsoY2xhc2guaW50ZXJzZWN0aW9uVm9sdW1lIHx8IDApLnRvRml4ZWQoNCl9IG1cdTAwQjM8L2Rpdj5cbiAgICAgIDxkaXY+PHN0cm9uZz5FbGVtZW50IEE6PC9zdHJvbmc+ICR7Y2xhc2guZWxlbWVudEEubW9kZWxOYW1lfSAoJHtjbGFzaC5lbGVtZW50QS5pZmNUeXBlfSk8L2Rpdj5cbiAgICAgIDxkaXY+PHN0cm9uZz5FbGVtZW50IEI6PC9zdHJvbmc+ICR7Y2xhc2guZWxlbWVudEIubW9kZWxOYW1lfSAoJHtjbGFzaC5lbGVtZW50Qi5pZmNUeXBlfSk8L2Rpdj5cbiAgICBgO1xuICB9XG5cbiAgbG9hZENsYXNoQ29tbWVudHMoY2xhc2guaWQpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkQ2xhc2hDb21tZW50cyhjbGFzaElkKSB7XG4gIGlmICghZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0pIHJldHVybjtcbiAgZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0uaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+TG9hZGluZyBkaXNjdXNzaW9uXHUyMDI2PC9kaXY+JztcblxuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkubGlzdF9jbGFzaF9jb21tZW50cywgYXJnczogeyBjbGFzaDogY2xhc2hJZCB9IH0pO1xuICAgIGNvbnN0IGNvbW1lbnRzID0gcmVzLm1lc3NhZ2UgfHwgW107XG4gICAgaWYgKCFjb21tZW50cy5sZW5ndGgpIHtcbiAgICAgIGVscy5jbGFzaENvbW1lbnRzU3RyZWFtLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGNvbW1lbnRzIHlldC4gU3RhcnQgdGhlIHRlYW0gZGlzY3Vzc2lvbiBiZWxvdy48L2Rpdj4nO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVscy5jbGFzaENvbW1lbnRzU3RyZWFtLmlubmVySFRNTCA9IGNvbW1lbnRzLm1hcChjID0+IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJ1YmJsZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY29tbWVudC1oZWFkZXJcIj5cbiAgICAgICAgICA8c3Ryb25nPiR7Yy51c2VyIHx8ICdBZG1pbmlzdHJhdG9yJ308L3N0cm9uZz5cbiAgICAgICAgICA8c3Bhbj4ke2MuY3JlYXRpb24gPyBjLmNyZWF0aW9uLnNsaWNlKDAsIDE2KSA6ICdKdXN0IG5vdyd9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNvbW1lbnQtYm9keVwiPiR7Yy5jb21tZW50IHx8ICcnfTwvZGl2PlxuICAgICAgICAke2Muc25hcHNob3QgPyBgPGltZyBzcmM9XCIke2Muc25hcHNob3R9XCIgY2xhc3M9XCJjbGFzaC1jb21tZW50LXNuYXBzaG90XCIgLz5gIDogJyd9XG4gICAgICA8L2Rpdj5cbiAgICBgKS5qb2luKCcnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVscy5jbGFzaENvbW1lbnRzU3RyZWFtLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPkRpc2N1c3Npb24gdGhyZWFkIHJlYWR5IGZvciBjbGFzaCBub3Rlcy48L2Rpdj4nO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RDbGFzaENvbW1lbnQoKSB7XG4gIGlmICghYWN0aXZlQ2xhc2ggfHwgIWVscy5jbGFzaENvbW1lbnRJbnB1dCkgcmV0dXJuO1xuICBjb25zdCB0ZXh0ID0gZWxzLmNsYXNoQ29tbWVudElucHV0LnZhbHVlLnRyaW0oKTtcbiAgaWYgKCF0ZXh0KSByZXR1cm47XG5cbiAgc2V0U3RhdHVzKCdQb3N0aW5nIGNvbW1lbnRcdTIwMjYnKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBmcmFwcGUuY2FsbCh7XG4gICAgICBtZXRob2Q6IEFQSS5hZGRfY2xhc2hfY29tbWVudCxcbiAgICAgIGFyZ3M6IHsgY2xhc2g6IGFjdGl2ZUNsYXNoLmlkLCBjb21tZW50OiB0ZXh0LCB1c2VyOiAod2luZG93LmZyYXBwZSAmJiBmcmFwcGUuc2Vzc2lvbiAmJiBmcmFwcGUuc2Vzc2lvbi51c2VyKSB8fCAnQWRtaW5pc3RyYXRvcicgfSxcbiAgICB9KTtcbiAgICBlbHMuY2xhc2hDb21tZW50SW5wdXQudmFsdWUgPSAnJztcbiAgICBsb2FkQ2xhc2hDb21tZW50cyhhY3RpdmVDbGFzaC5pZCk7XG4gICAgc2V0U3RhdHVzKCdDb21tZW50IHBvc3RlZC4nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnN0IGJ1YmJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGJ1YmJsZS5jbGFzc05hbWUgPSAnY2xhc2gtY29tbWVudC1idWJibGUnO1xuICAgIGJ1YmJsZS5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY29tbWVudC1oZWFkZXJcIj5cbiAgICAgICAgPHN0cm9uZz4keyh3aW5kb3cuZnJhcHBlICYmIGZyYXBwZS5zZXNzaW9uICYmIGZyYXBwZS5zZXNzaW9uLnVzZXIpIHx8ICdVc2VyJ308L3N0cm9uZz5cbiAgICAgICAgPHNwYW4+SnVzdCBub3c8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJvZHlcIj4ke3RleHR9PC9kaXY+XG4gICAgYDtcbiAgICBlbHMuY2xhc2hDb21tZW50c1N0cmVhbS5hcHBlbmRDaGlsZChidWJibGUpO1xuICAgIGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSA9ICcnO1xuICAgIHNldFN0YXR1cygnTm90ZSBhZGRlZCB0byBsb2NhbCBzZXNzaW9uLicpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDbGFzaFRvRXJwTmV4dCgpIHtcbiAgaWYgKCFhY3RpdmVDbGFzaCkgcmV0dXJuO1xuICBzaG93TG9hZGluZygnU2F2aW5nIGNsYXNoIHJlY29yZCB0byBFUlBOZXh0XHUyMDI2JywgdHJ1ZSk7XG4gIHRyeSB7XG4gICAgY29uc3Qgdmlld3BvaW50ID0gZ2VuZXJhdGVCY2ZWaWV3cG9pbnQoY2FtZXJhLCBjb250cm9scywgYWN0aXZlQ2xhc2gsIHtcbiAgICAgIHNuYXBzaG90OiByZW5kZXJlci5kb21FbGVtZW50LnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyksXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XG4gICAgICBtZXRob2Q6IEFQSS5jcmVhdGVfY2xhc2gsXG4gICAgICBhcmdzOiB7XG4gICAgICAgIHRpdGxlOiBgJHthY3RpdmVDbGFzaC5lbGVtZW50QS5kaXNjaXBsaW5lfSAjJHthY3RpdmVDbGFzaC5lbGVtZW50QS5leHByZXNzSUR9IFx1MDBENyAke2FjdGl2ZUNsYXNoLmVsZW1lbnRCLmRpc2NpcGxpbmV9ICMke2FjdGl2ZUNsYXNoLmVsZW1lbnRCLmV4cHJlc3NJRH1gLFxuICAgICAgICBtb2RlbF9hOiBhY3RpdmVDbGFzaC5lbGVtZW50QS5tb2RlbE5hbWUsXG4gICAgICAgIGVsZW1lbnRfYV9pZDogYWN0aXZlQ2xhc2guZWxlbWVudEEuZXhwcmVzc0lELFxuICAgICAgICBkaXNjaXBsaW5lX2E6IGFjdGl2ZUNsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmUsXG4gICAgICAgIG1vZGVsX2I6IGFjdGl2ZUNsYXNoLmVsZW1lbnRCLm1vZGVsTmFtZSxcbiAgICAgICAgZWxlbWVudF9iX2lkOiBhY3RpdmVDbGFzaC5lbGVtZW50Qi5leHByZXNzSUQsXG4gICAgICAgIGRpc2NpcGxpbmVfYjogYWN0aXZlQ2xhc2guZWxlbWVudEIuZGlzY2lwbGluZSxcbiAgICAgICAgY29sbGlzaW9uX3BvaW50OiBKU09OLnN0cmluZ2lmeShhY3RpdmVDbGFzaC5jb2xsaXNpb25Qb2ludCksXG4gICAgICAgIGJvdW5kaW5nX2JveDogSlNPTi5zdHJpbmdpZnkoYWN0aXZlQ2xhc2guYm91bmRpbmdCb3gpLFxuICAgICAgICBwZW5ldHJhdGlvbl9kZXB0aDogYWN0aXZlQ2xhc2gucGVuZXRyYXRpb25EZXB0aCxcbiAgICAgICAgaW50ZXJzZWN0aW9uX3ZvbHVtZTogYWN0aXZlQ2xhc2guaW50ZXJzZWN0aW9uVm9sdW1lLFxuICAgICAgICBzZXZlcml0eTogYWN0aXZlQ2xhc2guc2V2ZXJpdHksXG4gICAgICAgIHZpZXdwb2ludDogSlNPTi5zdHJpbmdpZnkodmlld3BvaW50KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuICAgIGZyYXBwZS5tc2dwcmludCh7XG4gICAgICB0aXRsZTogX18oJ0JJTSBDbGFzaCBTYXZlZCcpLFxuICAgICAgbWVzc2FnZTogX18oJ0NyZWF0ZWQgQklNIENsYXNoIHJlY29yZDogPGI+ezB9PC9iPicsIFsocmVzLm1lc3NhZ2UgJiYgcmVzLm1lc3NhZ2UubmFtZSkgfHwgJ0JJTS1DTEFTSC1ORVcnXSksXG4gICAgICBpbmRpY2F0b3I6ICdncmVlbicsXG4gICAgfSk7XG4gICAgc2V0U3RhdHVzKGBTYXZlZCBjbGFzaCByZWNvcmQgJHsocmVzLm1lc3NhZ2UgJiYgcmVzLm1lc3NhZ2UubmFtZSkgfHwgJyd9YCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuICAgIGZyYXBwZS5tc2dwcmludCh7XG4gICAgICB0aXRsZTogX18oJ0ZhaWxlZCB0byBTYXZlIENsYXNoJyksXG4gICAgICBtZXNzYWdlOiBfXygnQ291bGQgbm90IHNhdmUgQklNIENsYXNoOiB7MH0nLCBbZS5tZXNzYWdlIHx8IFN0cmluZyhlKV0pLFxuICAgICAgaW5kaWNhdG9yOiAncmVkJyxcbiAgICB9KTtcbiAgICBzZXRTdGF0dXMoYEVycm9yIHNhdmluZyBjbGFzaDogJHtlLm1lc3NhZ2UgfHwgZX1gKTtcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIEludGVyYWN0aXZlIEJJTSBCT00gV2l6YXJkIE1vZGFsIC0tLS0tLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIG9wZW5Cb21XaXphcmRNb2RhbCgpIHtcbiAgaWYgKCFlbHMuYm9tTW9kYWwpIHJldHVybjtcbiAgZWxzLmJvbU1vZGFsLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICBjYWxjdWxhdGVBbmRSZW5kZXJCb21Sb2xsdXAoKTtcbn1cblxuZnVuY3Rpb24gY2xvc2VCb21XaXphcmRNb2RhbCgpIHtcbiAgaWYgKCFlbHMuYm9tTW9kYWwpIHJldHVybjtcbiAgZWxzLmJvbU1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICBjbGVhclNlbGVjdGlvbigpO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVBbmRSZW5kZXJCb21Sb2xsdXAoKSB7XG4gIGlmICghZWxzLmJvbVJvbGx1cFRib2R5KSByZXR1cm47XG4gIGVscy5ib21Sb2xsdXBUYm9keS5pbm5lckhUTUwgPSAnJztcblxuICBjb25zdCByb2xsdXBzID0gbmV3IE1hcCgpO1xuXG4gIGVsZW1lbnRNZXNoZXMuZm9yRWFjaCgoeyBtZXNoLCBleHByZXNzSUQsIG1vZGVsRG9jTmFtZSwgZGlzY2lwbGluZSB9KSA9PiB7XG4gICAgY29uc3QgZWwgPSBlbGVtZW50SW5kZXguZ2V0KGAke21vZGVsRG9jTmFtZX06JHtleHByZXNzSUR9YCkgfHwgZWxlbWVudEluZGV4LmdldChTdHJpbmcoZXhwcmVzc0lEKSkgfHwgbWVzaC51c2VyRGF0YS5lbGVtZW50O1xuICAgIGNvbnN0IGlmY1R5cGUgPSAoZWwgJiYgZWwuZWxlbWVudF90eXBlKSB8fCAobWVzaC51c2VyRGF0YS5pZmNUeXBlID8gYElGQ18ke21lc2gudXNlckRhdGEuaWZjVHlwZX1gIDogJ0lGQ19FTEVNRU5UJyk7XG5cbiAgICBpZiAoIXJvbGx1cHMuaGFzKGlmY1R5cGUpKSB7XG4gICAgICBsZXQgbWV0cmljTmFtZSA9ICdWb2x1bWUnO1xuICAgICAgbGV0IHVvbSA9ICdtMyc7XG4gICAgICBsZXQgdW5pdFJhdGUgPSAxODAuMDtcbiAgICAgIGxldCB3YXN0ZVBjdCA9IDU7XG4gICAgICBsZXQgaXRlbUNvZGUgPSAnQ09OQy1DMzAtMzcnO1xuXG4gICAgICBjb25zdCB0eXBlVXBwZXIgPSBpZmNUeXBlLnRvVXBwZXJDYXNlKCk7XG4gICAgICBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdTTEFCJykpIHtcbiAgICAgICAgbWV0cmljTmFtZSA9ICdOZXRWb2x1bWUnOyB1b20gPSAnbTMnOyB1bml0UmF0ZSA9IDE5NS4wOyB3YXN0ZVBjdCA9IDU7IGl0ZW1Db2RlID0gJ0NPTkMtU0xBQi1DMzAnO1xuICAgICAgfSBlbHNlIGlmICh0eXBlVXBwZXIuaW5jbHVkZXMoJ0JFQU0nKSB8fCB0eXBlVXBwZXIuaW5jbHVkZXMoJ0NPTFVNTicpKSB7XG4gICAgICAgIG1ldHJpY05hbWUgPSAnTmV0Vm9sdW1lJzsgdW9tID0gJ20zJzsgdW5pdFJhdGUgPSAyMjAuMDsgd2FzdGVQY3QgPSA1OyBpdGVtQ29kZSA9ICdDT05DLVNUUlVDLUMzNSc7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVVcHBlci5pbmNsdWRlcygnV0FMTCcpKSB7XG4gICAgICAgIG1ldHJpY05hbWUgPSAnTmV0Vm9sdW1lJzsgdW9tID0gJ20zJzsgdW5pdFJhdGUgPSAxNzUuMDsgd2FzdGVQY3QgPSA1OyBpdGVtQ29kZSA9ICdDT05DLVdBTEwtUEFORUwnO1xuICAgICAgfSBlbHNlIGlmICh0eXBlVXBwZXIuaW5jbHVkZXMoJ0RVQ1QnKSkge1xuICAgICAgICBtZXRyaWNOYW1lID0gJ0xlbmd0aCc7IHVvbSA9ICdtJzsgdW5pdFJhdGUgPSA4NS4wOyB3YXN0ZVBjdCA9IDEwOyBpdGVtQ29kZSA9ICdNRVAtRFVDVC1HQUxWJztcbiAgICAgIH0gZWxzZSBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdQSVBFJykpIHtcbiAgICAgICAgbWV0cmljTmFtZSA9ICdMZW5ndGgnOyB1b20gPSAnbSc7IHVuaXRSYXRlID0gNDUuMDsgd2FzdGVQY3QgPSAxMDsgaXRlbUNvZGUgPSAnTUVQLVBJUEUtQ09QUEVSJztcbiAgICAgIH0gZWxzZSBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdBSVJURVJNSU5BTCcpIHx8IHR5cGVVcHBlci5pbmNsdWRlcygnVkFMVkUnKSB8fCB0eXBlVXBwZXIuaW5jbHVkZXMoJ1BVTVAnKSkge1xuICAgICAgICBtZXRyaWNOYW1lID0gJ0NvdW50JzsgdW9tID0gJ05vcyc7IHVuaXRSYXRlID0gMTIwLjA7IHdhc3RlUGN0ID0gMDsgaXRlbUNvZGUgPSAnTUVQLUZJWFRVUkUtVU5JVCc7XG4gICAgICB9XG5cbiAgICAgIHJvbGx1cHMuc2V0KGlmY1R5cGUsIHtcbiAgICAgICAgdHlwZTogaWZjVHlwZSxcbiAgICAgICAgZGlzY2lwbGluZSxcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIG1ldHJpY05hbWUsXG4gICAgICAgIG1ldHJpY1ZhbHVlOiAwLjAsXG4gICAgICAgIHVvbSxcbiAgICAgICAgaXRlbUNvZGUsXG4gICAgICAgIHVuaXRSYXRlLFxuICAgICAgICB3YXN0ZVBjdCxcbiAgICAgICAgbWVzaGVzOiBbXSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHIgPSByb2xsdXBzLmdldChpZmNUeXBlKTtcbiAgICByLmNvdW50Kys7XG4gICAgci5tZXNoZXMucHVzaChtZXNoKTtcblxuICAgIGlmIChlbCAmJiBlbC5xdWFudGl0aWVzKSB7XG4gICAgICBpZiAoci5tZXRyaWNOYW1lID09PSAnTmV0Vm9sdW1lJyAmJiBlbC5xdWFudGl0aWVzLk5ldFZvbHVtZSkge1xuICAgICAgICByLm1ldHJpY1ZhbHVlICs9IHBhcnNlRmxvYXQoZWwucXVhbnRpdGllcy5OZXRWb2x1bWUpIHx8IDAuMDtcbiAgICAgIH0gZWxzZSBpZiAoci5tZXRyaWNOYW1lID09PSAnTGVuZ3RoJyAmJiAoZWwucXVhbnRpdGllcy5MZW5ndGggfHwgZWwucXVhbnRpdGllcy5Ob21pbmFsTGVuZ3RoKSkge1xuICAgICAgICByLm1ldHJpY1ZhbHVlICs9IHBhcnNlRmxvYXQoZWwucXVhbnRpdGllcy5MZW5ndGggfHwgZWwucXVhbnRpdGllcy5Ob21pbmFsTGVuZ3RoKSB8fCAwLjA7XG4gICAgICB9IGVsc2UgaWYgKHIubWV0cmljTmFtZSA9PT0gJ0dyb3NzQXJlYScgJiYgZWwucXVhbnRpdGllcy5Hcm9zc0FyZWEpIHtcbiAgICAgICAgci5tZXRyaWNWYWx1ZSArPSBwYXJzZUZsb2F0KGVsLnF1YW50aXRpZXMuR3Jvc3NBcmVhKSB8fCAwLjA7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtZXNoLmdlb21ldHJ5KSB7XG4gICAgICBpZiAoIW1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3gpIG1lc2guZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KCk7XG4gICAgICBjb25zdCB3b3JsZEJveCA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3guY2xvbmUoKS5hcHBseU1hdHJpeDQobWVzaC5tYXRyaXhXb3JsZCk7XG4gICAgICBjb25zdCBzeiA9IHdvcmxkQm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSk7XG4gICAgICBpZiAoci5tZXRyaWNOYW1lID09PSAnTmV0Vm9sdW1lJykgci5tZXRyaWNWYWx1ZSArPSAoc3oueCAqIHN6LnkgKiBzei56KTtcbiAgICAgIGVsc2UgaWYgKHIubWV0cmljTmFtZSA9PT0gJ0xlbmd0aCcpIHIubWV0cmljVmFsdWUgKz0gTWF0aC5tYXgoc3oueCwgc3oueSwgc3oueik7XG4gICAgICBlbHNlIHIubWV0cmljVmFsdWUgKz0gMS4wO1xuICAgIH1cbiAgfSk7XG5cbiAgbGV0IHRvdGFsQ29zdCA9IDAuMDtcbiAgbGV0IHRvdGFsTGluZUl0ZW1zID0gcm9sbHVwcy5zaXplO1xuXG4gIHJvbGx1cHMuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgY29uc3QgZWZmZWN0aXZlUXR5ID0gcm93Lm1ldHJpY1ZhbHVlICogKDEuMCArIChyb3cud2FzdGVQY3QgLyAxMDAuMCkpO1xuICAgIGNvbnN0IGxpbmVUb3RhbCA9IGVmZmVjdGl2ZVF0eSAqIHJvdy51bml0UmF0ZTtcbiAgICB0b3RhbENvc3QgKz0gbGluZVRvdGFsO1xuXG4gICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgIHRyLmNsYXNzTmFtZSA9ICdib20tcm93JztcbiAgICB0ci5pbm5lckhUTUwgPSBgXG4gICAgICA8dGQ+PHN0cm9uZz4ke3Jvdy50eXBlfTwvc3Ryb25nPjwvdGQ+XG4gICAgICA8dGQ+PHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2VcIj4ke3Jvdy5kaXNjaXBsaW5lfTwvc3Bhbj48L3RkPlxuICAgICAgPHRkPiR7cm93LmNvdW50fTwvdGQ+XG4gICAgICA8dGQ+JHtyb3cubWV0cmljVmFsdWUudG9GaXhlZCgyKX0gJHtyb3cudW9tfTwvdGQ+XG4gICAgICA8dGQ+PGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cImJvbS13YXN0ZS1pbnB1dFwiIHZhbHVlPVwiJHtyb3cud2FzdGVQY3R9XCIgbWluPVwiMFwiIG1heD1cIjUwXCIgc3R5bGU9XCJ3aWR0aDo2MHB4XCIgLz4lPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cImJvbS1lZmYtcXR5XCI+JHtlZmZlY3RpdmVRdHkudG9GaXhlZCgyKX0gJHtyb3cudW9tfTwvdGQ+XG4gICAgICA8dGQ+PGlucHV0IGNsYXNzPVwiYm9tLWl0ZW0taW5wdXRcIiB2YWx1ZT1cIiR7cm93Lml0ZW1Db2RlfVwiIC8+PC90ZD5cbiAgICAgIDx0ZD4ke3Jvdy51b219PC90ZD5cbiAgICAgIDx0ZD4kPGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cImJvbS1yYXRlLWlucHV0XCIgdmFsdWU9XCIke3Jvdy51bml0UmF0ZX1cIiBzdHlsZT1cIndpZHRoOjcwcHhcIiAvPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJib20tbGluZS10b3RhbFwiIHN0eWxlPVwiZm9udC13ZWlnaHQ6NjAwXCI+JCR7bGluZVRvdGFsLnRvRml4ZWQoMil9PC90ZD5cbiAgICBgO1xuXG4gICAgdHIub25jbGljayA9ICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5ib20tcm9sbHVwLXRhYmxlIHRyLmJvbS1yb3cnKS5mb3JFYWNoKHIgPT4gci5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpKTtcbiAgICAgIHRyLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICBjcm9zc0hpZ2hsaWdodE1lc2hlcyhyb3cubWVzaGVzKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgd2FzdGVJbnB1dCA9IHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20td2FzdGUtaW5wdXQnKTtcbiAgICBjb25zdCByYXRlSW5wdXQgPSB0ci5xdWVyeVNlbGVjdG9yKCcuYm9tLXJhdGUtaW5wdXQnKTtcbiAgICBjb25zdCBlZmZRdHlFbCA9IHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20tZWZmLXF0eScpO1xuICAgIGNvbnN0IGxpbmVUb3RhbEVsID0gdHIucXVlcnlTZWxlY3RvcignLmJvbS1saW5lLXRvdGFsJyk7XG5cbiAgICBjb25zdCB1cGRhdGVMaW5lID0gKCkgPT4ge1xuICAgICAgY29uc3QgdyA9IHBhcnNlRmxvYXQod2FzdGVJbnB1dC52YWx1ZSkgfHwgMDtcbiAgICAgIGNvbnN0IHJWYWwgPSBwYXJzZUZsb2F0KHJhdGVJbnB1dC52YWx1ZSkgfHwgMDtcbiAgICAgIGNvbnN0IGVmZiA9IHJvdy5tZXRyaWNWYWx1ZSAqICgxLjAgKyB3IC8gMTAwLjApO1xuICAgICAgY29uc3QgdG90ID0gZWZmICogclZhbDtcbiAgICAgIGVmZlF0eUVsLnRleHRDb250ZW50ID0gYCR7ZWZmLnRvRml4ZWQoMil9ICR7cm93LnVvbX1gO1xuICAgICAgbGluZVRvdGFsRWwudGV4dENvbnRlbnQgPSBgJCR7dG90LnRvRml4ZWQoMil9YDtcbiAgICB9O1xuXG4gICAgaWYgKHdhc3RlSW5wdXQpIHdhc3RlSW5wdXQub25pbnB1dCA9IHVwZGF0ZUxpbmU7XG4gICAgaWYgKHJhdGVJbnB1dCkgcmF0ZUlucHV0Lm9uaW5wdXQgPSB1cGRhdGVMaW5lO1xuXG4gICAgZWxzLmJvbVJvbGx1cFRib2R5LmFwcGVuZENoaWxkKHRyKTtcbiAgfSk7XG5cbiAgaWYgKGVscy5ib21TdW1tYXJ5VGV4dCkge1xuICAgIGVscy5ib21TdW1tYXJ5VGV4dC50ZXh0Q29udGVudCA9IGBUb3RhbCBMaW5lIEl0ZW1zOiAke3RvdGFsTGluZUl0ZW1zfSB8IEVzdGltYXRlZCBUb3RhbCBDb3N0OiAkJHt0b3RhbENvc3QudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyb3NzSGlnaGxpZ2h0TWVzaGVzKHRhcmdldE1lc2hlcykge1xuICBjb25zdCB0YXJnZXRTZXQgPSBuZXcgU2V0KHRhcmdldE1lc2hlcyk7XG4gIGNvbnN0IHRhcmdldEJveCA9IG5ldyBUSFJFRS5Cb3gzKCk7XG5cbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2ggfSkgPT4ge1xuICAgIGlmICghbWVzaC51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcykge1xuICAgICAgbWVzaC51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcyA9IHtcbiAgICAgICAgdHJhbnNwYXJlbnQ6IG1lc2gubWF0ZXJpYWwudHJhbnNwYXJlbnQsXG4gICAgICAgIG9wYWNpdHk6IG1lc2gubWF0ZXJpYWwub3BhY2l0eSxcbiAgICAgICAgZGVwdGhXcml0ZTogbWVzaC5tYXRlcmlhbC5kZXB0aFdyaXRlLFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHRhcmdldFNldC5oYXMobWVzaCkpIHtcbiAgICAgIGlmICghbWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gudXNlckRhdGEub3JpZ0NvbG9yID0gbWVzaC5tYXRlcmlhbC5jb2xvci5jbG9uZSgpO1xuICAgICAgbWVzaC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHgzOGJkZjgpO1xuICAgICAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4MDM2OWExKTtcbiAgICAgIG1lc2gubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBmYWxzZTtcbiAgICAgIG1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcbiAgICAgIGlmIChtZXNoLmdlb21ldHJ5KSB7XG4gICAgICAgIGlmICghbWVzaC5nZW9tZXRyeS5ib3VuZGluZ0JveCkgbWVzaC5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdCb3goKTtcbiAgICAgICAgdGFyZ2V0Qm94LnVuaW9uKG1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3guY2xvbmUoKS5hcHBseU1hdHJpeDQobWVzaC5tYXRyaXhXb3JsZCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gubWF0ZXJpYWwuY29sb3IuY29weShtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcik7XG4gICAgICBpZiAobWVzaC5tYXRlcmlhbC5lbWlzc2l2ZSkgbWVzaC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoMHgwMDAwMDApO1xuICAgICAgbWVzaC5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgICBtZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAwLjEyO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKCF0YXJnZXRCb3guaXNFbXB0eSgpKSB7XG4gICAgY29uc3QgY2VudGVyID0gdGFyZ2V0Qm94LmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcbiAgICBjb25zdCBzaXplID0gdGFyZ2V0Qm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSkubGVuZ3RoKCk7XG4gICAgY2FtZXJhLnBvc2l0aW9uLmNvcHkoY2VudGVyKS5hZGQobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZSAqIDAuNywgc2l6ZSAqIDAuNSwgc2l6ZSAqIDAuNykpO1xuICAgIGNvbnRyb2xzLnRhcmdldC5jb3B5KGNlbnRlcik7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVFcnBOZXh0Qm9tKCkge1xuICBjb25zdCBwYXJlbnRJdGVtID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib20tcGFyZW50LWl0ZW0nKSB8fCB7fSkudmFsdWUgfHwgJ0JMRC1OT1JESUMtQ09OQy0wMSc7XG4gIGNvbnN0IGJvbVRpdGxlID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib20tdGl0bGUnKSB8fCB7fSkudmFsdWUgfHwgJ0JJTSBHZW5lcmF0ZWQgQk9NJztcblxuICBzaG93TG9hZGluZygnR2VuZXJhdGluZyBFUlBOZXh0IEJPTSBkb2N1bWVudFx1MjAyNicsIHRydWUpO1xuICB0cnkge1xuICAgIGNvbnN0IGl0ZW1zID0gW107XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2JvbS1yb2xsdXAtdGJvZHkgdHIuYm9tLXJvdycpLmZvckVhY2godHIgPT4ge1xuICAgICAgY29uc3QgdHlwZSA9ICh0ci5xdWVyeVNlbGVjdG9yKCd0ZCBzdHJvbmcnKSB8fCB7fSkudGV4dENvbnRlbnQgfHwgJyc7XG4gICAgICBjb25zdCBpdGVtQ29kZSA9ICh0ci5xdWVyeVNlbGVjdG9yKCcuYm9tLWl0ZW0taW5wdXQnKSB8fCB7fSkudmFsdWUgfHwgJyc7XG4gICAgICBjb25zdCBlZmZRdHlTdHIgPSAodHIucXVlcnlTZWxlY3RvcignLmJvbS1lZmYtcXR5JykgfHwge30pLnRleHRDb250ZW50IHx8ICcwJztcbiAgICAgIGNvbnN0IHBhcnNlZFF0eSA9IHBhcnNlRmxvYXQoZWZmUXR5U3RyKTtcbiAgICAgIGNvbnN0IGVmZlF0eSA9IE51bWJlci5pc0Zpbml0ZShwYXJzZWRRdHkpID8gcGFyc2VkUXR5IDogMDtcbiAgICAgIGlmIChlZmZRdHkgPD0gMCkgcmV0dXJuOyAvLyBTa2lwIHplcm8gb3IgaW52YWxpZCBxdWFudGl0eSBpdGVtc1xuICAgICAgY29uc3QgcmF0ZVN0ciA9ICh0ci5xdWVyeVNlbGVjdG9yKCcuYm9tLXJhdGUtaW5wdXQnKSB8fCB7fSkudmFsdWUgfHwgJzAnO1xuICAgICAgY29uc3QgcmF0ZSA9IHBhcnNlRmxvYXQocmF0ZVN0cikgfHwgMDtcblxuICAgICAgaXRlbXMucHVzaCh7IGl0ZW1fY29kZTogaXRlbUNvZGUsIHF0eTogZWZmUXR5LCByYXRlLCBpZmNfdHlwZTogdHlwZSB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHtcbiAgICAgIG1ldGhvZDogQVBJLmdlbmVyYXRlX2JvbV9mcm9tX2JpbSxcbiAgICAgIGFyZ3M6IHtcbiAgICAgICAgaXRlbTogcGFyZW50SXRlbSxcbiAgICAgICAgYm9tX3RpdGxlOiBib21UaXRsZSxcbiAgICAgICAgaXRlbXM6IEpTT04uc3RyaW5naWZ5KGl0ZW1zKSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuICAgIGNsb3NlQm9tV2l6YXJkTW9kYWwoKTtcbiAgICBmcmFwcGUubXNncHJpbnQoe1xuICAgICAgdGl0bGU6IF9fKCdCT00gR2VuZXJhdGVkIFN1Y2Nlc3NmdWxseScpLFxuICAgICAgbWVzc2FnZTogX18oJ0NyZWF0ZWQgRVJQTmV4dCBCT006IDxiPnswfTwvYj4gd2l0aCB7MX0gbGluZSBpdGVtcy4nLCBbKHJlcy5tZXNzYWdlICYmIHJlcy5tZXNzYWdlLm5hbWUpIHx8ICdCT00tJyArIHBhcmVudEl0ZW0sIGl0ZW1zLmxlbmd0aF0pLFxuICAgICAgaW5kaWNhdG9yOiAnZ3JlZW4nLFxuICAgIH0pO1xuICAgIHNldFN0YXR1cyhgR2VuZXJhdGVkIEVSUE5leHQgQk9NIGZvciAke3BhcmVudEl0ZW19YCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuICAgIGZyYXBwZS5tc2dwcmludCh7XG4gICAgICB0aXRsZTogX18oJ0ZhaWxlZCB0byBHZW5lcmF0ZSBCT00nKSxcbiAgICAgIG1lc3NhZ2U6IF9fKCdFcnJvciBnZW5lcmF0aW5nIEVSUE5leHQgQk9NOiB7MH0nLCBbZS5tZXNzYWdlIHx8IFN0cmluZyhlKV0pLFxuICAgICAgaW5kaWNhdG9yOiAncmVkJyxcbiAgICB9KTtcbiAgICBzZXRTdGF0dXMoYEJPTSBnZW5lcmF0aW9uIGZhaWxlZDogJHtlLm1lc3NhZ2UgfHwgZX1gKTtcbiAgfVxufVxyXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gSFVEICYgVG9vbHMgSGFuZGxlcnMgLS0tLS0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gc2V0VG9vbCh0b29sKSB7XG4gIGFjdGl2ZVRvb2wgPSB0b29sO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjYmltLWh1ZCBidXR0b24nKS5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBiLmlkID09PSAndG9vbC0nICsgdG9vbCkpO1xuICByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLmN1cnNvciA9IHRvb2wgPT09ICdtZWFzdXJlJyA/ICdjcm9zc2hhaXInIDogJ2RlZmF1bHQnO1xufVxuXG5sZXQgcG9pbnRlckRvd25Qb3MgPSB7IHg6IDAsIHk6IDAgfTtcbmVscy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBldiA9PiB7XG4gIHBvaW50ZXJEb3duUG9zID0geyB4OiBldi5jbGllbnRYLCB5OiBldi5jbGllbnRZIH07XG59KTtcblxuZWxzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChldikgPT4ge1xuICBpZiAoYWN0aXZlVG9vbCA9PT0gJ21lYXN1cmUnKSB7IG1lYXN1cmVDbGljayhldik7IHJldHVybjsgfVxuICBjb25zdCBkaXN0ID0gTWF0aC5oeXBvdChldi5jbGllbnRYIC0gcG9pbnRlckRvd25Qb3MueCwgZXYuY2xpZW50WSAtIHBvaW50ZXJEb3duUG9zLnkpO1xuICBpZiAoZGlzdCA+IDYpIHJldHVybjtcblxuICBpZiAoYWN0aXZlVG9vbCAhPT0gJ3NlbGVjdCcgJiYgYWN0aXZlVG9vbCAhPT0gJ29yYml0JykgcmV0dXJuO1xuXG4gIGNvbnN0IHJlY3QgPSBlbHMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICBjb25zdCBtb3VzZSA9IG5ldyBUSFJFRS5WZWN0b3IyKFxuICAgICgoZXYuY2xpZW50WCAtIHJlY3QubGVmdCkgLyByZWN0LndpZHRoKSAqIDIgLSAxLFxuICAgIC0oKGV2LmNsaWVudFkgLSByZWN0LnRvcCkgLyByZWN0LmhlaWdodCkgKiAyICsgMVxuICApO1xuICBjb25zdCByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XG4gIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKG1vdXNlLCBjYW1lcmEpO1xuXG4gIGNvbnN0IG1lc2hlcyA9IFtdO1xuICBmZWRlcmF0ZWRHcm91cC50cmF2ZXJzZShvID0+IHsgaWYgKG8uaXNNZXNoICYmIG8udmlzaWJsZSkgbWVzaGVzLnB1c2gobyk7IH0pO1xuICBjb25zdCBoaXRzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMobWVzaGVzLCBmYWxzZSk7XG5cbiAgaWYgKGhpdHMubGVuZ3RoKSB7XG4gICAgY29uc3QgaGl0ID0gaGl0c1swXTtcbiAgICBjb25zdCBleHByID0gaGl0Lm9iamVjdC51c2VyRGF0YS5leHByZXNzSUQgfHwgZ2V0RXhwcmVzc0lkQXQoaGl0Lm9iamVjdC5nZW9tZXRyeSwgaGl0LmZhY2UgPyBoaXQuZmFjZS5hIDogdW5kZWZpbmVkKTtcbiAgICBjb25zdCBtb2RlbERvYyA9IGhpdC5vYmplY3QudXNlckRhdGEubW9kZWxEb2NOYW1lIHx8ICcnO1xuICAgIGF3YWl0IHNlbGVjdEVsZW1lbnQoaGl0Lm9iamVjdCwgZXhwciwgbW9kZWxEb2MpO1xuICB9IGVsc2Uge1xuICAgIGNsZWFyU2VsZWN0aW9uKCk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBnZXRFeHByZXNzSWRBdChnZW9tZXRyeSwgZmFjZUluZGV4KSB7XG4gIGNvbnN0IGF0dHIgPSBnZW9tZXRyeSAmJiBnZW9tZXRyeS5hdHRyaWJ1dGVzICYmIGdlb21ldHJ5LmF0dHJpYnV0ZXMuZXhwcmVzc0lEO1xuICBpZiAoIWF0dHIgfHwgZmFjZUluZGV4ID09PSB1bmRlZmluZWQgfHwgZmFjZUluZGV4ID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIGF0dHIuZ2V0WChNYXRoLm1pbihmYWNlSW5kZXgsIGF0dHIuY291bnQgLSAxKSk7XG59XG5cbmZ1bmN0aW9uIGZpdFZpZXcoKSB7XG4gIGNvbnN0IGJveCA9IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdChmZWRlcmF0ZWRHcm91cCk7XG4gIGlmIChib3guaXNFbXB0eSgpKSByZXR1cm47XG4gIGNvbnN0IHNwaGVyZSA9IGJveC5nZXRCb3VuZGluZ1NwaGVyZShuZXcgVEhSRUUuU3BoZXJlKCkpO1xuICBjb25zdCBzaXplID0gYm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSkubGVuZ3RoKCk7XG4gIGNhbWVyYS5wb3NpdGlvbi5jb3B5KHNwaGVyZS5jZW50ZXIpLmFkZChuZXcgVEhSRUUuVmVjdG9yMyhzaXplICogMC43LCBzaXplICogMC41LCBzaXplICogMC43KSk7XG4gIGNvbnRyb2xzLnRhcmdldC5jb3B5KHNwaGVyZS5jZW50ZXIpO1xuICBjb250cm9scy51cGRhdGUoKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLSBNZWFzdXJlIFRvb2wgLS0tLS0tLS0tLS0tLS0tLVxubGV0IG1lYXN1cmVQb2ludHMgPSBbXTtcbmNvbnN0IG1lYXN1cmVMaW5lID0gbmV3IFRIUkVFLkxpbmUoXG4gIG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpLFxuICBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoeyBjb2xvcjogMHgzOGJkZjgsIGxpbmV3aWR0aDogMiB9KVxuKTtcbnNjZW5lLmFkZChtZWFzdXJlTGluZSk7XG5cbmZ1bmN0aW9uIG1lYXN1cmVDbGljayhldikge1xuICBjb25zdCByZWN0ID0gZWxzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgY29uc3QgbW91c2UgPSBuZXcgVEhSRUUuVmVjdG9yMihcbiAgICAoKGV2LmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aCkgKiAyIC0gMSxcbiAgICAtKChldi5jbGllbnRZIC0gcmVjdC50b3ApIC8gcmVjdC5oZWlnaHQpICogMiArIDFcbiAgKTtcbiAgY29uc3QgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xuICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZSwgY2FtZXJhKTtcblxuICBjb25zdCBtZXNoZXMgPSBbXTtcbiAgZmVkZXJhdGVkR3JvdXAudHJhdmVyc2UobyA9PiB7IGlmIChvLmlzTWVzaCkgbWVzaGVzLnB1c2gobyk7IH0pO1xuICBjb25zdCBoaXRzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMobWVzaGVzLCBmYWxzZSk7XG5cbiAgaWYgKGhpdHMubGVuZ3RoKSB7XG4gICAgY29uc3QgcHQgPSBoaXRzWzBdLnBvaW50O1xuICAgIG1lYXN1cmVQb2ludHMucHVzaChwdCk7XG4gICAgaWYgKG1lYXN1cmVQb2ludHMubGVuZ3RoID09PSAyKSB7XG4gICAgICBjb25zdCBkaXN0ID0gbWVhc3VyZVBvaW50c1swXS5kaXN0YW5jZVRvKG1lYXN1cmVQb2ludHNbMV0pO1xuICAgICAgbWVhc3VyZUxpbmUuZ2VvbWV0cnkuc2V0RnJvbVBvaW50cyhtZWFzdXJlUG9pbnRzKTtcbiAgICAgIHNldFN0YXR1cyhgRGlzdGFuY2U6ICR7ZGlzdC50b0ZpeGVkKDMpfSBtIChtb2RlbCB1bml0cylgKTtcbiAgICAgIG1lYXN1cmVQb2ludHMgPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0U3RhdHVzKCdNZWFzdXJlOiBjbGljayBzZWNvbmQgdGFyZ2V0IHZlcnRleC9wb2ludCcpO1xuICAgIH1cbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIEZpbHRlcnMgJiBGYWNldHMgLS0tLS0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gcG9wdWxhdGVGYWNldHMoKSB7XG4gIGlmICghZWxzLmZEaXNjaXBsaW5lIHx8ICFlbHMuZlN0b3JleSB8fCAhZWxzLmZUeXBlKSByZXR1cm47XG4gIGNvbnN0IGRpc2NpcGxpbmVzID0gbmV3IFNldCgpO1xuICBjb25zdCBzdG9yZXlzID0gbmV3IFNldCgpO1xuICBjb25zdCB0eXBlcyA9IG5ldyBTZXQoKTtcblxuICBsb2FkZWRNb2RlbHMuZm9yRWFjaChtID0+IHtcbiAgICBkaXNjaXBsaW5lcy5hZGQobS5kaXNjaXBsaW5lKTtcbiAgICAobS5lbGVtZW50cyB8fCBbXSkuZm9yRWFjaChlbCA9PiB7XG4gICAgICBpZiAoZWwuc3RvcmV5KSBzdG9yZXlzLmFkZChlbC5zdG9yZXkpO1xuICAgICAgaWYgKGVsLmVsZW1lbnRfdHlwZSkgdHlwZXMuYWRkKGVsLmVsZW1lbnRfdHlwZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGVscy5mRGlzY2lwbGluZS5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPkRpc2NpcGxpbmU6IGFsbDwvb3B0aW9uPic7XG4gIGRpc2NpcGxpbmVzLmZvckVhY2goZCA9PiB7XG4gICAgY29uc3QgbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpOyBvLnZhbHVlID0gZDsgby50ZXh0Q29udGVudCA9IGQ7IGVscy5mRGlzY2lwbGluZS5hcHBlbmRDaGlsZChvKTtcbiAgfSk7XG5cbiAgZWxzLmZTdG9yZXkuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj5TdG9yZXk6IGFsbDwvb3B0aW9uPic7XG4gIHN0b3JleXMuZm9yRWFjaChzID0+IHtcbiAgICBjb25zdCBvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7IG8udmFsdWUgPSBzOyBvLnRleHRDb250ZW50ID0gczsgZWxzLmZTdG9yZXkuYXBwZW5kQ2hpbGQobyk7XG4gIH0pO1xuXG4gIGVscy5mVHlwZS5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPlR5cGU6IGFsbDwvb3B0aW9uPic7XG4gIHR5cGVzLmZvckVhY2godCA9PiB7XG4gICAgY29uc3QgbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpOyBvLnZhbHVlID0gdDsgby50ZXh0Q29udGVudCA9IHQ7IGVscy5mVHlwZS5hcHBlbmRDaGlsZChvKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5RmlsdGVycygpIHtcbiAgY29uc3QgZkRpc2MgPSBlbHMuZkRpc2NpcGxpbmUgPyBlbHMuZkRpc2NpcGxpbmUudmFsdWUgOiAnJztcbiAgY29uc3QgZlN0b3JleSA9IGVscy5mU3RvcmV5ID8gZWxzLmZTdG9yZXkudmFsdWUgOiAnJztcbiAgY29uc3QgZlR5cGUgPSBlbHMuZlR5cGUgPyBlbHMuZlR5cGUudmFsdWUgOiAnJztcbiAgY29uc3QgZlNlYXJjaCA9IChlbHMuZlNlYXJjaCA/IGVscy5mU2VhcmNoLnZhbHVlIDogJycpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuXG4gIGxldCB2aXNpYmxlQ291bnQgPSAwO1xuICBlbGVtZW50TWVzaGVzLmZvckVhY2goKHsgbWVzaCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWUsIGRpc2NpcGxpbmUgfSkgPT4ge1xuICAgIGNvbnN0IGVsID0gZWxlbWVudEluZGV4LmdldChgJHttb2RlbERvY05hbWV9OiR7ZXhwcmVzc0lEfWApIHx8IGVsZW1lbnRJbmRleC5nZXQoU3RyaW5nKGV4cHJlc3NJRCkpIHx8IG1lc2gudXNlckRhdGEuZWxlbWVudDtcbiAgICBsZXQgbWF0Y2ggPSB0cnVlO1xuXG4gICAgaWYgKGZEaXNjICYmICFkaXNjaXBsaW5lTWF0Y2hlcyhkaXNjaXBsaW5lLCBmRGlzYykpIG1hdGNoID0gZmFsc2U7XG4gICAgaWYgKGZTdG9yZXkgJiYgZWwgJiYgZWwuc3RvcmV5ICE9PSBmU3RvcmV5KSBtYXRjaCA9IGZhbHNlO1xuICAgIGlmIChmVHlwZSAmJiBlbCAmJiBlbC5lbGVtZW50X3R5cGUgIT09IGZUeXBlKSBtYXRjaCA9IGZhbHNlO1xuICAgIGlmIChmU2VhcmNoKSB7XG4gICAgICBjb25zdCBzZWFyY2hUYXJnZXQgPSBgJHsoZWwgJiYgZWwudGl0bGUpIHx8ICcnfSAkeyhlbCAmJiBlbC5lbGVtZW50X3R5cGUpIHx8ICcnfSAke2V4cHJlc3NJRH0gJHsoZWwgJiYgZWwuc3RhYmxlX2lkKSB8fCAnJ31gLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIXNlYXJjaFRhcmdldC5pbmNsdWRlcyhmU2VhcmNoKSkgbWF0Y2ggPSBmYWxzZTtcbiAgICB9XG5cbiAgICBtZXNoLnZpc2libGUgPSBtYXRjaDtcbiAgICBpZiAobWF0Y2gpIHZpc2libGVDb3VudCsrO1xuICB9KTtcblxuICBzZXRTdGF0dXMoYCR7dmlzaWJsZUNvdW50fSBlbGVtZW50cyBtYXRjaGluZyBmaWx0ZXJzYCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gVmlld3BvaW50cyAtLS0tLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiBzYXZlQ3VycmVudFZpZXdwb2ludCgpIHtcbiAgY29uc3QgbmFtZSA9IChlbHMudnBOYW1lICYmIGVscy52cE5hbWUudmFsdWUudHJpbSgpKSB8fCAnVmlldyAnICsgbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKTtcbiAgY29uc3QgdnBEYXRhID0ge1xuICAgIHBvc2l0aW9uOiB7IHg6IGNhbWVyYS5wb3NpdGlvbi54LCB5OiBjYW1lcmEucG9zaXRpb24ueSwgejogY2FtZXJhLnBvc2l0aW9uLnogfSxcbiAgICB0YXJnZXQ6IHsgeDogY29udHJvbHMudGFyZ2V0LngsIHk6IGNvbnRyb2xzLnRhcmdldC55LCB6OiBjb250cm9scy50YXJnZXQueiB9LFxuICB9O1xuXG4gIGNvbnN0IGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZC5jbGFzc05hbWUgPSAnbGluay1yb3cnO1xuICBkLnN0eWxlLmNzc1RleHQgPSAnZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjtwYWRkaW5nOjRweCAwO2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNmMWY1Zjk7Zm9udC1zaXplOjEycHgnO1xuICBkLmlubmVySFRNTCA9IGA8c3BhbiBzdHlsZT1cImN1cnNvcjpwb2ludGVyXCI+XHVEODNEXHVEQ0Y3ICR7bmFtZX08L3NwYW4+PGJ1dHRvbiBjbGFzcz1cImRlbFwiIHN0eWxlPVwiY29sb3I6I2VmNDQ0NDtib3JkZXI6bm9uZTtiYWNrZ3JvdW5kOm5vbmU7Y3Vyc29yOnBvaW50ZXJcIj5cdTI3MTU8L2J1dHRvbj5gO1xuICBcbiAgZC5xdWVyeVNlbGVjdG9yKCdzcGFuJykub25jbGljayA9ICgpID0+IHtcbiAgICBjYW1lcmEucG9zaXRpb24uc2V0KHZwRGF0YS5wb3NpdGlvbi54LCB2cERhdGEucG9zaXRpb24ueSwgdnBEYXRhLnBvc2l0aW9uLnopO1xuICAgIGNvbnRyb2xzLnRhcmdldC5zZXQodnBEYXRhLnRhcmdldC54LCB2cERhdGEudGFyZ2V0LnksIHZwRGF0YS50YXJnZXQueik7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAgc2V0U3RhdHVzKCdSZXN0b3JlZCB2aWV3cG9pbnQgJyArIG5hbWUpO1xuICB9O1xuICBkLnF1ZXJ5U2VsZWN0b3IoJy5kZWwnKS5vbmNsaWNrID0gKCkgPT4gZC5yZW1vdmUoKTtcblxuICBpZiAoZWxzLnZpZXdwb2ludHMucXVlcnlTZWxlY3RvcignLmVtcHR5LWhpbnQnKSkgZWxzLnZpZXdwb2ludHMuaW5uZXJIVE1MID0gJyc7XG4gIGVscy52aWV3cG9pbnRzLmFwcGVuZENoaWxkKGQpO1xuICBpZiAoZWxzLnZwTmFtZSkgZWxzLnZwTmFtZS52YWx1ZSA9ICcnO1xuICBzZXRTdGF0dXMoJ1NhdmVkIHZpZXdwb2ludDogJyArIG5hbWUpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIERPTSBFdmVudCBCaW5kaW5nIC0tLS0tLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGluaXRVaUV2ZW50cygpIHtcbiAgLy8gVGFiIHN3aXRjaGVyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iaW0tdGFiLWJ0bicpLmZvckVhY2goYnRuID0+IHtcbiAgICBidG4ub25jbGljayA9ICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iaW0tdGFiLWJ0bicpLmZvckVhY2goYiA9PiBiLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iaW0tdGFiLWNvbnRlbnQnKS5mb3JFYWNoKGMgPT4gYy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XG4gICAgICBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChidG4uZGF0YXNldC50YWIpO1xuICAgICAgaWYgKHRhcmdldCkgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEhVRCBidXR0b25zXG4gIGNvbnN0IHRvb2xPcmJpdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLW9yYml0Jyk7XG4gIGNvbnN0IHRvb2xTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1zZWxlY3QnKTtcbiAgY29uc3QgdG9vbE1lYXN1cmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1tZWFzdXJlJyk7XG4gIGNvbnN0IHRvb2xDbGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2wtY2xpcCcpO1xuICBjb25zdCB0b29sQ2xhc2hlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLWNsYXNoZXMnKTtcblxuICBpZiAodG9vbE9yYml0KSB0b29sT3JiaXQub25jbGljayA9ICgpID0+IHNldFRvb2woJ29yYml0Jyk7XG4gIGlmICh0b29sU2VsZWN0KSB0b29sU2VsZWN0Lm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdzZWxlY3QnKTtcbiAgaWYgKHRvb2xNZWFzdXJlKSB0b29sTWVhc3VyZS5vbmNsaWNrID0gKCkgPT4gc2V0VG9vbCgnbWVhc3VyZScpO1xuICBpZiAodG9vbENsaXApIHRvb2xDbGlwLm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdjbGlwJyk7XG4gIGlmICh0b29sQ2xhc2hlcykge1xuICAgIHRvb2xDbGFzaGVzLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCB0YWJCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLWJ0bi1jbGFzaGVzJyk7XG4gICAgICBpZiAodGFiQnRuKSB0YWJCdG4uY2xpY2soKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUXVpY2sgdmlldyB0b29sc1xuICBjb25zdCB0V2lyZWZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Qtd2lyZWZyYW1lJyk7XG4gIGNvbnN0IHRJc28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndC1pc28nKTtcbiAgY29uc3QgdFRvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0LXRvcCcpO1xuICBjb25zdCB0RnJvbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndC1mcm9udCcpO1xuICBjb25zdCBidG5GaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWZpdCcpO1xuXG4gIGlmICh0V2lyZWZyYW1lKSB7XG4gICAgdFdpcmVmcmFtZS5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgd2lyZWZyYW1lTW9kZSA9ICF3aXJlZnJhbWVNb2RlO1xuICAgICAgZmVkZXJhdGVkR3JvdXAudHJhdmVyc2UobyA9PiB7XG4gICAgICAgIGlmIChvLmlzTWVzaCAmJiBvLm1hdGVyaWFsKSBvLm1hdGVyaWFsLndpcmVmcmFtZSA9IHdpcmVmcmFtZU1vZGU7XG4gICAgICB9KTtcbiAgICAgIHNldFN0YXR1cyhgV2lyZWZyYW1lIG1vZGU6ICR7d2lyZWZyYW1lTW9kZSA/ICdPTicgOiAnT0ZGJ31gKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKGJ0bkZpdCkgYnRuRml0Lm9uY2xpY2sgPSBmaXRWaWV3O1xuICBpZiAodElzbykgdElzby5vbmNsaWNrID0gZml0VmlldztcbiAgaWYgKHRUb3ApIHtcbiAgICB0VG9wLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBib3ggPSBuZXcgVEhSRUUuQm94MygpLnNldEZyb21PYmplY3QoZmVkZXJhdGVkR3JvdXApO1xuICAgICAgY29uc3QgY2VudGVyID0gYm94LmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcbiAgICAgIGNvbnN0IHNpemUgPSBib3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKS5sZW5ndGgoKTtcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi5zZXQoY2VudGVyLngsIGNlbnRlci55ICsgc2l6ZSAqIDEuMywgY2VudGVyLnopO1xuICAgICAgY2FtZXJhLnVwLnNldCgwLCAwLCAtMSk7XG4gICAgICBjb250cm9scy50YXJnZXQuY29weShjZW50ZXIpO1xuICAgICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAgfTtcbiAgfVxuICBpZiAodEZyb250KSB7XG4gICAgdEZyb250Lm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBib3ggPSBuZXcgVEhSRUUuQm94MygpLnNldEZyb21PYmplY3QoZmVkZXJhdGVkR3JvdXApO1xuICAgICAgY29uc3QgY2VudGVyID0gYm94LmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcbiAgICAgIGNvbnN0IHNpemUgPSBib3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKS5sZW5ndGgoKTtcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi5zZXQoY2VudGVyLngsIGNlbnRlci55LCBjZW50ZXIueiArIHNpemUgKiAxLjMpO1xuICAgICAgY2FtZXJhLnVwLnNldCgwLCAxLCAwKTtcbiAgICAgIGNvbnRyb2xzLnRhcmdldC5jb3B5KGNlbnRlcik7XG4gICAgICBjb250cm9scy51cGRhdGUoKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gQ2xhc2ggYnV0dG9uc1xuICBjb25zdCBidG5SdW5DbGFzaGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1ydW4tY2xhc2hlcycpO1xuICBpZiAoYnRuUnVuQ2xhc2hlcykgYnRuUnVuQ2xhc2hlcy5vbmNsaWNrID0gZXhlY3V0ZUNsYXNoRGV0ZWN0aW9uO1xuXG4gIGNvbnN0IGJ0bkNsYXNoQmFjayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xhc2gtYmFjaycpO1xuICBpZiAoYnRuQ2xhc2hCYWNrKSB7XG4gICAgYnRuQ2xhc2hCYWNrLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAoZWxzLmNsYXNoRGV0YWlsQ29udGFpbmVyICYmIGVscy5jbGFzaExpc3RDb250YWluZXIpIHtcbiAgICAgICAgZWxzLmNsYXNoRGV0YWlsQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGVscy5jbGFzaExpc3RDb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGJ0bkNsYXNoRmx5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbGFzaC1mbHknKTtcbiAgaWYgKGJ0bkNsYXNoRmx5KSB7XG4gICAgYnRuQ2xhc2hGbHkub25jbGljayA9ICgpID0+IHtcbiAgICAgIGlmIChhY3RpdmVDbGFzaCkgZmx5VG9DbGFzaChhY3RpdmVDbGFzaCk7XG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGJ0blBvc3RDbGFzaENvbW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXBvc3QtY2xhc2gtY29tbWVudCcpO1xuICBpZiAoYnRuUG9zdENsYXNoQ29tbWVudCkgYnRuUG9zdENsYXNoQ29tbWVudC5vbmNsaWNrID0gcG9zdENsYXNoQ29tbWVudDtcblxuICBjb25zdCBidG5TYXZlQ2xhc2hFcnAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXNhdmUtY2xhc2gtZXJwJyk7XG4gIGlmIChidG5TYXZlQ2xhc2hFcnApIGJ0blNhdmVDbGFzaEVycC5vbmNsaWNrID0gc2F2ZUNsYXNoVG9FcnBOZXh0O1xuXG4gIC8vIEJPTSBXaXphcmQgYnV0dG9uc1xuICBjb25zdCBidG5PcGVuQm9tV2l6YXJkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1vcGVuLWJvbS13aXphcmQnKTtcbiAgaWYgKGJ0bk9wZW5Cb21XaXphcmQpIGJ0bk9wZW5Cb21XaXphcmQub25jbGljayA9IG9wZW5Cb21XaXphcmRNb2RhbDtcblxuICBjb25zdCBidG5DbG9zZUJvbU1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1ib20tbW9kYWwnKTtcbiAgY29uc3QgYnRuQ2FuY2VsQm9tTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1ib20tbW9kYWwnKTtcbiAgaWYgKGJ0bkNsb3NlQm9tTW9kYWwpIGJ0bkNsb3NlQm9tTW9kYWwub25jbGljayA9IGNsb3NlQm9tV2l6YXJkTW9kYWw7XG4gIGlmIChidG5DYW5jZWxCb21Nb2RhbCkgYnRuQ2FuY2VsQm9tTW9kYWwub25jbGljayA9IGNsb3NlQm9tV2l6YXJkTW9kYWw7XG5cbiAgY29uc3QgYnRuR2VuZXJhdGVFcnBCb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWdlbmVyYXRlLWVycC1ib20nKTtcbiAgaWYgKGJ0bkdlbmVyYXRlRXJwQm9tKSBidG5HZW5lcmF0ZUVycEJvbS5vbmNsaWNrID0gZ2VuZXJhdGVFcnBOZXh0Qm9tO1xuXG4gIC8vIE1vZGVsIGFjdGlvbnNcbiAgaWYgKGVscy5idG5Mb2FkU2VsZWN0ZWQpIHtcbiAgICBlbHMuYnRuTG9hZFNlbGVjdGVkLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IG0gb2YgYXZhaWxhYmxlTW9kZWxzKSB7XG4gICAgICAgIGlmICghbG9hZGVkTW9kZWxzLmhhcyhtLm5hbWUpKSBhd2FpdCBsb2FkTW9kZWxHZW9tZXRyeShtLm5hbWUpO1xuICAgICAgfVxuICAgICAgcmVuZGVyTW9kZWxzTGlzdCgpO1xuICAgICAgdXBkYXRlRWxlbWVudE1lc2hlc0xpc3QoKTtcbiAgICAgIHBvcHVsYXRlRmFjZXRzKCk7XG4gICAgICBmaXRWaWV3KCk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChlbHMuYnRuQ2xlYXJNb2RlbHMpIHtcbiAgICBlbHMuYnRuQ2xlYXJNb2RlbHMub25jbGljayA9IHVubG9hZEFsbE1vZGVscztcbiAgfVxuXG4gIC8vIFVwbG9hZFxuICBpZiAoZWxzLnVwbG9hZCAmJiBlbHMuZmlsZUlucHV0KSB7XG4gICAgZWxzLnVwbG9hZC5vbmNsaWNrID0gKCkgPT4gZWxzLmZpbGVJbnB1dC5jbGljaygpO1xuICAgIGVscy5maWxlSW5wdXQub25jaGFuZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gZWxzLmZpbGVJbnB1dC5maWxlc1swXTtcbiAgICAgIGlmICghZmlsZSkgcmV0dXJuO1xuICAgICAgc2hvd0xvYWRpbmcoYFVwbG9hZGluZyAke2ZpbGUubmFtZX1cdTIwMjZgLCB0cnVlKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUsIGZpbGUubmFtZSk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnaXNfcHJpdmF0ZScsICcwJyk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZG9jdHlwZScsICdCSU0gTW9kZWwnKTtcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdkb2NuYW1lJywgJ25ldycpO1xuICAgICAgICBjb25zdCB1cGxvYWRSZXNwID0gYXdhaXQgZmV0Y2goJy9hcGkvbWV0aG9kL3VwbG9hZF9maWxlJywge1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIGJvZHk6IGZvcm1EYXRhLFxuICAgICAgICAgIGhlYWRlcnM6IHsgJ1gtRnJhcHBlLUNTUkYtVG9rZW4nOiAod2luZG93LmZyYXBwZSAmJiBmcmFwcGUuY3NyZl90b2tlbikgfHwgJycgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdXBsb2FkUmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKCdVcGxvYWQgZmFpbGVkJyk7XG4gICAgICAgIGNvbnN0IHVwbG9hZERhdGEgPSBhd2FpdCB1cGxvYWRSZXNwLmpzb24oKTtcbiAgICAgICAgY29uc3QgZmlsZVVybCA9IHVwbG9hZERhdGEubWVzc2FnZSAmJiB1cGxvYWREYXRhLm1lc3NhZ2UuZmlsZV91cmw7XG4gICAgICAgIGlmICghZmlsZVVybCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcmV0cmlldmUgZmlsZSBVUkwnKTtcblxuICAgICAgICBsZXQgZGlzYyA9ICdBcmNoaXRlY3R1cmUnO1xuICAgICAgICBjb25zdCBuYW1lTG93ZXIgPSBmaWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnc3RydWMnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ3N0cicpKSBkaXNjID0gJ1N0cnVjdHVyYWwnO1xuICAgICAgICBlbHNlIGlmIChuYW1lTG93ZXIuaW5jbHVkZXMoJ2h2YWMnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ21lcCcpKSBkaXNjID0gJ01FUCc7XG5cbiAgICAgICAgc2hvd0xvYWRpbmcoJ1BhcnNpbmcgSUZDXHUyMDI2JywgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IGNyZWF0ZVJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHtcbiAgICAgICAgICBtZXRob2Q6IEFQSS5jcmVhdGVfbW9kZWwsXG4gICAgICAgICAgYXJnczoge1xuICAgICAgICAgICAgZmlsZV91cmw6IGZpbGVVcmwsXG4gICAgICAgICAgICBmaWxlX25hbWU6IGZpbGUubmFtZSxcbiAgICAgICAgICAgIG1vZGVsX25hbWU6IGZpbGUubmFtZS5yZXBsYWNlKC9cXC5pZmMkL2ksICcnKSxcbiAgICAgICAgICAgIGRpc2NpcGxpbmU6IGRpc2MsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IGxvYWRNb2RlbHNMaXN0KCk7XG4gICAgICAgIGF3YWl0IGxvYWRNb2RlbEdlb21ldHJ5KGNyZWF0ZVJlcy5tZXNzYWdlLm5hbWUpO1xuICAgICAgICByZW5kZXJNb2RlbHNMaXN0KCk7XG4gICAgICAgIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XG4gICAgICAgIGZpdFZpZXcoKTtcbiAgICAgICAgc2V0U3RhdHVzKGBJbXBvcnRlZCAke2ZpbGUubmFtZX0gc3VjY2Vzc2Z1bGx5YCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNldFN0YXR1cygnSW1wb3J0IGZhaWxlZDogJyArIChlLm1lc3NhZ2UgfHwgZSkpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcbiAgICAgICAgZWxzLmZpbGVJbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBWaWV3cG9pbnRzXG4gIGNvbnN0IHZwU2F2ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2cC1zYXZlJyk7XG4gIGlmICh2cFNhdmVCdG4pIHZwU2F2ZUJ0bi5vbmNsaWNrID0gc2F2ZUN1cnJlbnRWaWV3cG9pbnQ7XG5cbiAgY29uc3QgYnRuQ2xhc2hTbmFwc2hvdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xhc2gtc25hcHNob3QnKTtcbiAgaWYgKGJ0bkNsYXNoU25hcHNob3QpIHtcbiAgICBidG5DbGFzaFNuYXBzaG90Lm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG4gICAgICBpZiAoZWxzLmNsYXNoQ29tbWVudElucHV0KSB7XG4gICAgICAgIGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSArPSAoZWxzLmNsYXNoQ29tbWVudElucHV0LnZhbHVlID8gJ1xcbicgOiAnJykgKyBgW0JDRiBWaWV3cG9pbnQgc25hcHNob3QgY2FwdHVyZWQgYXQgJHtuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpfV1gO1xuICAgICAgfVxuICAgICAgc2V0U3RhdHVzKCdTbmFwc2hvdCBjYXB0dXJlZCB0byBjbGFzaCBjb21tZW50IGJ1ZmZlcicpO1xuICAgIH07XG4gIH1cblxuICBjb25zdCBidG5ObEFkZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdubC1hZGQnKTtcbiAgaWYgKGJ0bk5sQWRkKSB7XG4gICAgYnRuTmxBZGQub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgIGlmICghY3VycmVudFNlbGVjdGlvbiB8fCAhY3VycmVudFNlbGVjdGlvbi5lbGVtZW50KSB7XG4gICAgICAgIGZyYXBwZS5tc2dwcmludChfXygnUGxlYXNlIHNlbGVjdCBhIEJJTSBlbGVtZW50IGZpcnN0JykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCB0eXBlU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25sLXR5cGUnKTtcbiAgICAgIGNvbnN0IG5hbWVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdubC1uYW1lJyk7XG4gICAgICBjb25zdCB0YXJnZXRUeXBlID0gdHlwZVNlbGVjdCA/IHR5cGVTZWxlY3QudmFsdWUgOiAnSXRlbSc7XG4gICAgICBjb25zdCB0YXJnZXROYW1lID0gbmFtZUlucHV0ID8gbmFtZUlucHV0LnZhbHVlLnRyaW0oKSA6ICcnO1xuICAgICAgaWYgKCF0YXJnZXROYW1lKSByZXR1cm47XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBmcmFwcGUuY2FsbCh7XG4gICAgICAgICAgbWV0aG9kOiBBUEkuY3JlYXRlX2JvcV9saW5rLFxuICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGN1cnJlbnRTZWxlY3Rpb24uZWxlbWVudC5uYW1lIHx8IGN1cnJlbnRTZWxlY3Rpb24uZXhwcmVzc0lELFxuICAgICAgICAgICAgdGFyZ2V0X2RvY3R5cGU6IHRhcmdldFR5cGUsXG4gICAgICAgICAgICB0YXJnZXRfbmFtZTogdGFyZ2V0TmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0U3RhdHVzKGBDcmVhdGVkIEJPUSBMaW5rIHRvICR7dGFyZ2V0TmFtZX1gKTtcbiAgICAgICAgaWYgKG5hbWVJbnB1dCkgbmFtZUlucHV0LnZhbHVlID0gJyc7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNldFN0YXR1cyhgTGluayBlcnJvcjogJHtlLm1lc3NhZ2UgfHwgZX1gKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gRmlsdGVyIGNoYW5nZSBsaXN0ZW5lcnNcbiAgaWYgKGVscy5mRGlzY2lwbGluZSkgZWxzLmZEaXNjaXBsaW5lLm9uY2hhbmdlID0gYXBwbHlGaWx0ZXJzO1xuICBpZiAoZWxzLmZTdG9yZXkpIGVscy5mU3RvcmV5Lm9uY2hhbmdlID0gYXBwbHlGaWx0ZXJzO1xuICBpZiAoZWxzLmZUeXBlKSBlbHMuZlR5cGUub25jaGFuZ2UgPSBhcHBseUZpbHRlcnM7XG4gIGlmIChlbHMuZlNlYXJjaCkgZWxzLmZTZWFyY2gub25pbnB1dCA9IGFwcGx5RmlsdGVycztcbiAgY29uc3QgZkNsZWFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2YtY2xlYXInKTtcbiAgaWYgKGZDbGVhcikge1xuICAgIGZDbGVhci5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgaWYgKGVscy5mRGlzY2lwbGluZSkgZWxzLmZEaXNjaXBsaW5lLnZhbHVlID0gJyc7XG4gICAgICBpZiAoZWxzLmZTdG9yZXkpIGVscy5mU3RvcmV5LnZhbHVlID0gJyc7XG4gICAgICBpZiAoZWxzLmZUeXBlKSBlbHMuZlR5cGUudmFsdWUgPSAnJztcbiAgICAgIGlmIChlbHMuZlNlYXJjaCkgZWxzLmZTZWFyY2gudmFsdWUgPSAnJztcbiAgICAgIGFwcGx5RmlsdGVycygpO1xuICAgIH07XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUm91dGVQYXJhbXMoKSB7XG4gIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gIGNvbnN0IHJvdXRlT3B0cyA9ICh3aW5kb3cuZnJhcHBlICYmIGZyYXBwZS5yb3V0ZV9vcHRpb25zKSB8fCB7fTtcbiAgY29uc3QgbW9kZWxQYXJhbSA9IHJvdXRlT3B0cy5tb2RlbCB8fCByb3V0ZU9wdHMubW9kZWxzIHx8IHBhcmFtcy5nZXQoJ21vZGVscycpIHx8IHBhcmFtcy5nZXQoJ21vZGVsJyk7XG4gIGNvbnN0IGNsYXNoUGFyYW0gPSByb3V0ZU9wdHMuY2xhc2ggfHwgcGFyYW1zLmdldCgnY2xhc2gnKTtcbiAgY29uc3QgZWxlbUEgPSByb3V0ZU9wdHMuZWxlbWVudF9hIHx8IHBhcmFtcy5nZXQoJ2VsZW1lbnRfYScpO1xuICBjb25zdCBlbGVtQiA9IHJvdXRlT3B0cy5lbGVtZW50X2IgfHwgcGFyYW1zLmdldCgnZWxlbWVudF9iJyk7XG5cbiAgaWYgKG1vZGVsUGFyYW0pIHtcbiAgICBjb25zdCBtb2RlbE5hbWVzID0gbW9kZWxQYXJhbS5zcGxpdCgnLCcpLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgZm9yIChjb25zdCBtIG9mIG1vZGVsTmFtZXMpIHtcbiAgICAgIGF3YWl0IGxvYWRNb2RlbEdlb21ldHJ5KG0pO1xuICAgIH1cbiAgICByZW5kZXJNb2RlbHNMaXN0KCk7XG4gICAgdXBkYXRlRWxlbWVudE1lc2hlc0xpc3QoKTtcbiAgICBmaXRWaWV3KCk7XG4gIH1cblxuICBpZiAoY2xhc2hQYXJhbSkge1xuICAgIGNvbnN0IHRhYkNsYXNoZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLWJ0bi1jbGFzaGVzJyk7XG4gICAgaWYgKHRhYkNsYXNoZXMpIHRhYkNsYXNoZXMuY2xpY2soKTtcbiAgICBhd2FpdCBsb2FkRXhpc3RpbmdDbGFzaGVzKCk7XG4gICAgY29uc3QgZm91bmQgPSBkZXRlY3RlZENsYXNoZXMuZmluZChjID0+IGMubmFtZSA9PT0gY2xhc2hQYXJhbSB8fCBjLmlkID09PSBjbGFzaFBhcmFtKTtcbiAgICBpZiAoZm91bmQpIHtcbiAgICAgIHNlbGVjdENsYXNoKGZvdW5kKTtcbiAgICAgIGZseVRvQ2xhc2goZm91bmQpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChlbGVtQSB8fCBlbGVtQikge1xuICAgIGNvbnN0IG1hdGNoID0gZWxlbWVudE1lc2hlcy5maW5kKG0gPT4gbS5lbGVtZW50ICYmIChtLmVsZW1lbnQuc3RhYmxlX2lkID09PSBlbGVtQSB8fCBtLmVsZW1lbnQuc3RhYmxlX2lkID09PSBlbGVtQikpO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgc2VsZWN0RWxlbWVudChtYXRjaC5tZXNoLCBtYXRjaC5leHByZXNzSUQsIG1hdGNoLm1vZGVsRG9jTmFtZSk7XG4gICAgfVxuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gQm9vdCAtLS0tLS0tLS0tLS0tLS0tXG5pbml0RGlzY2lwbGluZUNvbnRyb2xzKCk7XG5pbml0VWlFdmVudHMoKTtcbmxvYWRNb2RlbHNMaXN0KCkudGhlbigoKSA9PiB7XG4gIGhhbmRsZVJvdXRlUGFyYW1zKCk7XG59KTtcblxud2luZG93LkJJTVZpZXdlckFwcCA9IHtcbiAgbG9hZGVkTW9kZWxzLFxuICBlbGVtZW50TWVzaGVzLFxuICBsb2FkTW9kZWxHZW9tZXRyeSxcbiAgdW5sb2FkTW9kZWwsXG4gIGV4ZWN1dGVDbGFzaERldGVjdGlvbixcbiAgZGV0ZWN0ZWRDbGFzaGVzLFxuICBvcGVuQm9tV2l6YXJkTW9kYWwsXG4gIGNhbGN1bGF0ZUFuZFJlbmRlckJvbVJvbGx1cCxcbiAgaGFuZGxlUm91dGVQYXJhbXMsXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBR0EsSUFBTSxTQUFTLE9BQU87QUFDdEIsSUFBTSxTQUFTLE9BQU87QUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0FBQ3RCLFFBQU0sSUFBSSxNQUFNLDhFQUE4RTtBQUNoRztBQUVBLElBQU0sUUFBUSxPQUFPO0FBQ3JCLElBQU0sZ0JBQWdCLE9BQU87QUFDN0IsSUFBTSxnQkFBZ0IsT0FBTztBQUM3QixJQUFNLGdCQUFnQixPQUFPO0FBQzdCLElBQU0sdUJBQXVCLE9BQU87QUFDcEMsSUFBTSx1QkFBdUIsT0FBTztBQUNwQyxJQUFNLDhCQUE4QixPQUFPO0FBRzNDLElBQU0sTUFBTTtBQUFBLEVBQ1YsYUFBYTtBQUFBLEVBQ2IsV0FBVztBQUFBLEVBQ1gsZUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2IsY0FBYztBQUFBLEVBQ2QsaUJBQWlCO0FBQUEsRUFDakIsaUJBQWlCO0FBQUEsRUFDakIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsY0FBYztBQUFBLEVBQ2QsY0FBYztBQUFBLEVBQ2QsbUJBQW1CO0FBQUEsRUFDbkIscUJBQXFCO0FBQUEsRUFDckIsdUJBQXVCO0FBQ3pCO0FBR0EsSUFBTSxNQUFNO0FBQUEsRUFDVixRQUFRLFNBQVMsZUFBZSxZQUFZO0FBQUEsRUFDNUMsaUJBQWlCLFNBQVMsZUFBZSxtQkFBbUI7QUFBQSxFQUM1RCxnQkFBZ0IsU0FBUyxlQUFlLGtCQUFrQjtBQUFBLEVBQzFELFFBQVEsU0FBUyxlQUFlLFlBQVk7QUFBQSxFQUM1QyxXQUFXLFNBQVMsZUFBZSxnQkFBZ0I7QUFBQSxFQUNuRCxRQUFRLFNBQVMsZUFBZSxZQUFZO0FBQUEs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
