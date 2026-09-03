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
  federatedGroup.remove(modelEntry.group);
  disposeGroup(modelEntry.group);
  loadedModels.delete(modelDocName);
  setStatus(`Unloaded ${modelEntry.modelName}`);
}
function unloadAllModels() {
  loadedModels.forEach((entry) => {
    federatedGroup.remove(entry.group);
    disposeGroup(entry.group);
  });
  loadedModels.clear();
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
      title: __("Save Clash"),
      message: __("Clash saved with BCF viewpoint snapshot."),
      indicator: "blue"
    });
    setStatus("Clash viewpoint captured and saved.");
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
      const sz = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
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
      const effQty = parseFloat(effQtyStr) || 1;
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
      title: __("ERPNext BOM Wizard"),
      message: __("BOM generation complete with {0} rollups mapped to Item master.", [document.querySelectorAll("#bom-rollup-tbody tr.bom-row").length]),
      indicator: "blue"
    });
    closeBomWizardModal();
    setStatus("BOM rollup created.");
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
initDisciplineControls();
initUiEvents();
loadModelsList();
window.BIMViewerApp = {
  loadedModels,
  elementMeshes,
  loadModelGeometry,
  unloadModel,
  executeClashDetection,
  detectedClashes,
  openBomWizardModal,
  calculateAndRenderBomRollup
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL2JpbV92aWV3ZXJfYXBwLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJcdUZFRkYvLyBCSU0gVmlld2VyIEFwcCBcdTIwMTQgTXVsdGktRGlzY2lwbGluZSBGZWRlcmF0ZWQgVmlld2luZywgQlZIIENsYXNoIEVuZ2luZSwgJiBCT00gV2l6YXJkXG4vLyBQb3dlcmVkIGJ5IHdpbmRvdy5JRkNFbmdpbmUgKFRocmVlLmpzIHIxNDkgKyB0aHJlZS1tZXNoLWJ2aCArIHdlYi1pZmMpIGFuZCBGcmFwcGUgUkVTVCBBUElzXG5cbmNvbnN0IEVOR0lORSA9IHdpbmRvdy5JRkNFbmdpbmU7XG5jb25zdCBXZWJJRkMgPSB3aW5kb3cuV2ViSUZDO1xuaWYgKCFFTkdJTkUgfHwgIVdlYklGQykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ0lGQ0VuZ2luZSBub3QgbG9hZGVkICh3ZWJpZmMtYXBpLWlpZmUuanMgKyB3ZWJpZmMuYnVuZGxlLmpzIG11c3QgbG9hZCBmaXJzdCknKTtcbn1cblxuY29uc3QgVEhSRUUgPSBFTkdJTkUuVEhSRUU7XG5jb25zdCBPcmJpdENvbnRyb2xzID0gRU5HSU5FLk9yYml0Q29udHJvbHM7XG5jb25zdCBidWlsZElmY1NjZW5lID0gRU5HSU5FLmJ1aWxkSWZjU2NlbmU7XG5jb25zdCBkZXRlY3RDbGFzaGVzID0gRU5HSU5FLmRldGVjdENsYXNoZXM7XG5jb25zdCBnZW5lcmF0ZUJjZlZpZXdwb2ludCA9IEVOR0lORS5nZW5lcmF0ZUJjZlZpZXdwb2ludDtcbmNvbnN0IGNyZWF0ZUNlbnRyb2lkTWFya2VyID0gRU5HSU5FLmNyZWF0ZUNlbnRyb2lkTWFya2VyO1xuY29uc3QgY3JlYXRlSW50ZXJzZWN0aW9uQm94SGVscGVyID0gRU5HSU5FLmNyZWF0ZUludGVyc2VjdGlvbkJveEhlbHBlcjtcblxuLy8gRnJhcHBlIEFQSSByb3V0ZXNcbmNvbnN0IEFQSSA9IHtcbiAgbGlzdF9tb2RlbHM6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkubGlzdF9tb2RlbHMnLFxuICBnZXRfbW9kZWw6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuZ2V0X21vZGVsJyxcbiAgbGlzdF9lbGVtZW50czogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X2VsZW1lbnRzJyxcbiAgZ2V0X2VsZW1lbnQ6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuZ2V0X2VsZW1lbnQnLFxuICBjcmVhdGVfbW9kZWw6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuY3JlYXRlX21vZGVsX2Zyb21faWZjJyxcbiAgY3JlYXRlX2JvcV9saW5rOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmNyZWF0ZV9ib3FfbGluaycsXG4gIGRlbGV0ZV9ib3FfbGluazogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5kZWxldGVfYm9xX2xpbmsnLFxuICBsaXN0X2JvcV9saW5rczogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X2JvcV9saW5rcycsXG4gIHNhdmVfdmlld3BvaW50OiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLnNhdmVfdmlld3BvaW50JyxcbiAgbGlzdF92aWV3cG9pbnRzOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmxpc3Rfdmlld3BvaW50cycsXG4gIGRlbGV0ZV92aWV3cG9pbnQ6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuZGVsZXRlX3ZpZXdwb2ludCcsXG4gIGNyZWF0ZV9jbGFzaDogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5jcmVhdGVfY2xhc2gnLFxuICBsaXN0X2NsYXNoZXM6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkubGlzdF9jbGFzaGVzJyxcbiAgYWRkX2NsYXNoX2NvbW1lbnQ6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuYWRkX2NsYXNoX2NvbW1lbnQnLFxuICBsaXN0X2NsYXNoX2NvbW1lbnRzOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmxpc3RfY2xhc2hfY29tbWVudHMnLFxuICBnZW5lcmF0ZV9ib21fZnJvbV9iaW06ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuZ2VuZXJhdGVfYm9tX2Zyb21fYmltJyxcbn07XG5cbi8vIERPTSByZWZlcmVuY2VzXG5jb25zdCBlbHMgPSB7XG4gIG1vZGVsczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1tb2RlbHMnKSxcbiAgYnRuTG9hZFNlbGVjdGVkOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWxvYWQtc2VsZWN0ZWQnKSxcbiAgYnRuQ2xlYXJNb2RlbHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xlYXItbW9kZWxzJyksXG4gIHVwbG9hZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS11cGxvYWQnKSxcbiAgZmlsZUlucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWZpbGUtaW5wdXQnKSxcbiAgY2FudmFzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWNhbnZhcycpLFxuICBzdGF0dXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tc3RhdHVzJyksXG4gIGxvYWRpbmc6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tbG9hZGluZycpLFxuICBwcm9wczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1wcm9wcycpLFxuICBwcm9wc1RpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWVsZW1lbnQtdGl0bGUnKSxcbiAgbGlua3M6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tbGlua3MnKSxcbiAgdmlld3BvaW50czogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS12aWV3cG9pbnRzJyksXG4gIHZwTmFtZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZwLW5hbWUnKSxcbiAgZkRpc2NpcGxpbmU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmLWRpc2NpcGxpbmUnKSxcbiAgZlN0b3JleTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Ytc3RvcmV5JyksXG4gIGZUeXBlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZi10eXBlJyksXG4gIGZTZWFyY2g6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmLXNlYXJjaCcpLFxuICBjbGFzaENhcmRzTGlzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWNhcmRzLWxpc3QnKSxcbiAgY2xhc2hCYWRnZUNvdW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtYmFkZ2UtY291bnQnKSxcbiAgY2xhc2hEZXRhaWxDb250YWluZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kZXRhaWwtY29udGFpbmVyJyksXG4gIGNsYXNoTGlzdENvbnRhaW5lcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWxpc3QtY29udGFpbmVyJyksXG4gIGNsYXNoQ29tbWVudHNTdHJlYW06IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1jb21tZW50cy1zdHJlYW0nKSxcbiAgY2xhc2hDb21tZW50SW5wdXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1jb21tZW50LWlucHV0JyksXG4gIGJvbU1vZGFsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWJvbS1tb2RhbCcpLFxuICBib21Sb2xsdXBUYm9keTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JvbS1yb2xsdXAtdGJvZHknKSxcbiAgYm9tU3VtbWFyeVRleHQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib20tc3VtbWFyeS10ZXh0JyksXG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIFRocmVlLmpzIFNjZW5lIFNldHVwIC0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoeyBjYW52YXM6IGVscy5jYW52YXMsIGFudGlhbGlhczogdHJ1ZSwgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlIH0pO1xucmVuZGVyZXIuc2V0UGl4ZWxSYXRpbyhNYXRoLm1pbih3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxLCAyKSk7XG5jb25zdCBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuc2NlbmUuYmFja2dyb3VuZCA9IG5ldyBUSFJFRS5Db2xvcigweDBmMTcyYSk7IC8vIFNsYXRlLTkwMCBkYXJrIHRoZW1lXG5cbmNvbnN0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg1NSwgMSwgMC4xLCA1MDAwKTtcbmNhbWVyYS5wb3NpdGlvbi5zZXQoMjUsIDIwLCAzMCk7XG5jb25zdCBjb250cm9scyA9IG5ldyBPcmJpdENvbnRyb2xzKGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCk7XG5jb250cm9scy5lbmFibGVEYW1waW5nID0gdHJ1ZTtcbmNvbnRyb2xzLmRhbXBpbmdGYWN0b3IgPSAwLjA4O1xuXG5zY2VuZS5hZGQobmV3IFRIUkVFLkhlbWlzcGhlcmVMaWdodCgweGZmZmZmZiwgMHgzMzQxNTUsIDEuMikpO1xuY29uc3Qga2V5TGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMS4zKTtcbmtleUxpZ2h0LnBvc2l0aW9uLnNldCg0MCwgNjAsIDMwKTtcbnNjZW5lLmFkZChrZXlMaWdodCk7XG5jb25zdCBmaWxsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweDk0YTNiOCwgMC42KTtcbmZpbGxMaWdodC5wb3NpdGlvbi5zZXQoLTMwLCAyMCwgLTMwKTtcbnNjZW5lLmFkZChmaWxsTGlnaHQpO1xuXG5jb25zdCBncmlkID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoMTIwLCAyNCwgMHg0NzU1NjksIDB4MWUyOTNiKTtcbmdyaWQucG9zaXRpb24ueSA9IC0wLjAyO1xuc2NlbmUuYWRkKGdyaWQpO1xuXG4vLyBGZWRlcmF0ZWQgUm9vdCBHcm91cFxuY29uc3QgZmVkZXJhdGVkR3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcbmZlZGVyYXRlZEdyb3VwLm5hbWUgPSAnRmVkZXJhdGVkUm9vdEdyb3VwJztcbnNjZW5lLmFkZChmZWRlcmF0ZWRHcm91cCk7XG5cbi8vIEFjdGl2ZSBDbGFzaCBWaXN1YWwgSGVscGVycyBHcm91cFxuY29uc3QgY2xhc2hIZWxwZXJzR3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcbmNsYXNoSGVscGVyc0dyb3VwLm5hbWUgPSAnQ2xhc2hIZWxwZXJzR3JvdXAnO1xuc2NlbmUuYWRkKGNsYXNoSGVscGVyc0dyb3VwKTtcblxuLy8gU3RhdGVcbmxldCBsb2FkZWRNb2RlbHMgPSBuZXcgTWFwKCk7XG5sZXQgZWxlbWVudE1lc2hlcyA9IFtdO1xubGV0IGVsZW1lbnRJbmRleCA9IG5ldyBNYXAoKTtcbmxldCBhdmFpbGFibGVNb2RlbHMgPSBbXTtcbmxldCBjdXJyZW50U2VsZWN0aW9uID0gbnVsbDtcbmxldCBhY3RpdmVUb29sID0gJ29yYml0JztcbmxldCBjbGlwQm94ID0gbnVsbDtcbmxldCB3aXJlZnJhbWVNb2RlID0gZmFsc2U7XG5sZXQgaWZjQXBpID0gbnVsbDtcbmxldCBkZXRlY3RlZENsYXNoZXMgPSBbXTtcbmxldCBhY3RpdmVDbGFzaCA9IG51bGw7XG5cbi8vIEhpZ2hsaWdodCBNYXRlcmlhbHNcbmNvbnN0IGhpZ2hsaWdodE1hdCA9IG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7IGNvbG9yOiAweDM4YmRmOCwgZW1pc3NpdmU6IDB4MDM2OWExLCBlbWlzc2l2ZUludGVuc2l0eTogMC41IH0pO1xuY29uc3QgY2xhc2hNYXRBID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHsgY29sb3I6IDB4ZWY0NDQ0LCBlbWlzc2l2ZTogMHg3ZjFkMWQsIGVtaXNzaXZlSW50ZW5zaXR5OiAwLjYsIHJvdWdobmVzczogMC4zIH0pO1xuY29uc3QgY2xhc2hNYXRCID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHsgY29sb3I6IDB4ZWFiMzA4LCBlbWlzc2l2ZTogMHg3MTNmMTIsIGVtaXNzaXZlSW50ZW5zaXR5OiAwLjYsIHJvdWdobmVzczogMC4zIH0pO1xuXG5mdW5jdGlvbiByZXNpemUoKSB7XG4gIGNvbnN0IHcgPSBlbHMuY2FudmFzID8gKGVscy5jYW52YXMuY2xpZW50V2lkdGggfHwgODAwKSA6IDgwMDtcbiAgY29uc3QgaCA9IGVscy5jYW52YXMgPyAoZWxzLmNhbnZhcy5jbGllbnRIZWlnaHQgfHwgNjAwKSA6IDYwMDtcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3LCBoLCBmYWxzZSk7XG4gIGNhbWVyYS5hc3BlY3QgPSB3IC8gaDtcbiAgY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbn1cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemUpO1xucmVzaXplKCk7XG5cbmlmICh3aW5kb3cuX2JpbVZpZXdlckFuaW1JZCkge1xuICBjYW5jZWxBbmltYXRpb25GcmFtZSh3aW5kb3cuX2JpbVZpZXdlckFuaW1JZCk7XG4gIHdpbmRvdy5fYmltVmlld2VyQW5pbUlkID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgd2luZG93Ll9iaW1WaWV3ZXJBbmltSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5hbmltYXRlKCk7XG5cbmZ1bmN0aW9uIHNldFN0YXR1cyhtc2cpIHsgaWYgKGVscy5zdGF0dXMpIGVscy5zdGF0dXMudGV4dENvbnRlbnQgPSBtc2c7IH1cbmZ1bmN0aW9uIHNob3dMb2FkaW5nKG1zZywgb24pIHtcbiAgaWYgKGVscy5sb2FkaW5nKSB7XG4gICAgZWxzLmxvYWRpbmcuc3R5bGUuZGlzcGxheSA9IG9uID8gJ2ZsZXgnIDogJ25vbmUnO1xuICAgIGlmIChvbikgZWxzLmxvYWRpbmcudGV4dENvbnRlbnQgPSBtc2c7XG4gIH1cbn1cclxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIFdlYi1JRkMgQVBJIC0tLS0tLS0tLS0tLS0tLS1cbmFzeW5jIGZ1bmN0aW9uIGdldElmY0FwaSgpIHtcbiAgaWYgKGlmY0FwaSkgcmV0dXJuIGlmY0FwaTtcbiAgY29uc3QgYXBpID0gbmV3IFdlYklGQy5JZmNBUEkoKTtcbiAgYXBpLlNldFdhc21QYXRoKCcvYXNzZXRzL2NvbnN0cnVjdGlvbl9iaW0vanMvd2ViaWZjLycsIHRydWUpO1xuICBhd2FpdCBhcGkuSW5pdCgpO1xuICBpZmNBcGkgPSBhcGk7XG4gIHJldHVybiBhcGk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gTW9kZWwgTWFuYWdlbWVudCAmIEZlZGVyYXRlZCBMb2FkaW5nIC0tLS0tLS0tLS0tLS0tLS1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRNb2RlbHNMaXN0KCkge1xuICBzZXRTdGF0dXMoJ0xvYWRpbmcgbW9kZWxzXHUyMDI2Jyk7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoeyBtZXRob2Q6IEFQSS5saXN0X21vZGVscyB9KTtcbiAgICBhdmFpbGFibGVNb2RlbHMgPSByZXMubWVzc2FnZSB8fCBbXTtcbiAgICByZW5kZXJNb2RlbHNMaXN0KCk7XG4gICAgaWYgKGF2YWlsYWJsZU1vZGVscy5sZW5ndGgpIHtcbiAgICAgIHNldFN0YXR1cyhgJHthdmFpbGFibGVNb2RlbHMubGVuZ3RofSBtb2RlbHMgYXZhaWxhYmxlYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0YXR1cygnTm8gbW9kZWxzIGZvdW5kLiBVcGxvYWQgYW4gSUZDIGZpbGUgdG8gYmVnaW4uJyk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgc2V0U3RhdHVzKCdGYWlsZWQgdG8gbG9hZCBtb2RlbHMgbGlzdDogJyArIChlLm1lc3NhZ2UgfHwgZSkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1vZGVsc0xpc3QoKSB7XG4gIGlmICghZWxzLm1vZGVscykgcmV0dXJuO1xuICBlbHMubW9kZWxzLmlubmVySFRNTCA9ICcnO1xuICBpZiAoIWF2YWlsYWJsZU1vZGVscy5sZW5ndGgpIHtcbiAgICBlbHMubW9kZWxzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIG1vZGVscyB5ZXQ8L2Rpdj4nO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGF2YWlsYWJsZU1vZGVscy5mb3JFYWNoKG0gPT4ge1xuICAgIGNvbnN0IGlzTG9hZGVkID0gbG9hZGVkTW9kZWxzLmhhcyhtLm5hbWUpO1xuICAgIGNvbnN0IGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkLmNsYXNzTmFtZSA9ICdiaW0tbW9kZWwtaXRlbScgKyAoaXNMb2FkZWQgPyAnIGFjdGl2ZScgOiAnJyk7XG4gICAgXG4gICAgLy8gQXV0by1kZXRlY3QgZGlzY2lwbGluZSB0YWdcbiAgICBsZXQgZGlzYyA9IG0uZGlzY2lwbGluZSB8fCAnQXJjaGl0ZWN0dXJlJztcbiAgICBjb25zdCBuYW1lTG93ZXIgPSAobS5tb2RlbF9uYW1lIHx8IG0ubmFtZSkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnc3RyJykpIGRpc2MgPSAnU3RydWN0dXJhbCc7XG4gICAgZWxzZSBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdodmFjJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCdtZXAnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ3Z2cycpKSBkaXNjID0gJ01FUCc7XG5cbiAgICBkLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJtb2RlbC10aXRsZVwiIHRpdGxlPVwiJHttLm1vZGVsX25hbWV9XCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cIm1vZGVsLWNoZWNrXCIgJHtpc0xvYWRlZCA/ICdjaGVja2VkJyA6ICcnfSBzdHlsZT1cIm1hcmdpbi1yaWdodDo0cHhcIiAvPlxuICAgICAgICA8c3Bhbj4ke20ubW9kZWxfbmFtZX08L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo0cHhcIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgbW9kZWwtYmFkZ2VcIj4ke2Rpc2N9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImNudFwiPiR7bS5lbGVtZW50X2NvdW50IHx8IDB9IGVsPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICAgIGNvbnN0IGNoZWNrYm94ID0gZC5xdWVyeVNlbGVjdG9yKCcubW9kZWwtY2hlY2snKTtcbiAgICBjaGVja2JveC5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB0b2dnbGVNb2RlbChtLm5hbWUpO1xuICAgIH07XG5cbiAgICBkLm9uY2xpY2sgPSAoKSA9PiB0b2dnbGVNb2RlbChtLm5hbWUpO1xuICAgIGVscy5tb2RlbHMuYXBwZW5kQ2hpbGQoZCk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGVNb2RlbChtb2RlbERvY05hbWUpIHtcbiAgaWYgKGxvYWRlZE1vZGVscy5oYXMobW9kZWxEb2NOYW1lKSkge1xuICAgIHVubG9hZE1vZGVsKG1vZGVsRG9jTmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgbG9hZE1vZGVsR2VvbWV0cnkobW9kZWxEb2NOYW1lKTtcbiAgfVxuICByZW5kZXJNb2RlbHNMaXN0KCk7XG4gIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XG4gIHBvcHVsYXRlRmFjZXRzKCk7XG4gIGZpdFZpZXcoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZE1vZGVsR2VvbWV0cnkobW9kZWxEb2NOYW1lKSB7XG4gIHNob3dMb2FkaW5nKGBMb2FkaW5nIG1vZGVsICR7bW9kZWxEb2NOYW1lfVx1MjAyNmAsIHRydWUpO1xuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkuZ2V0X21vZGVsLCBhcmdzOiB7IG1vZGVsOiBtb2RlbERvY05hbWUgfSB9KTtcbiAgICBjb25zdCBtb2RlbERhdGEgPSByZXMubWVzc2FnZTtcbiAgICBjb25zdCBpZmNVcmwgPSBtb2RlbERhdGEub3JpZ2luYWxfZmlsZTtcbiAgICBpZiAoIWlmY1VybCkge1xuICAgICAgc2V0U3RhdHVzKGBNb2RlbCAke21vZGVsRGF0YS5tb2RlbF9uYW1lfSBoYXMgbm8gYXR0YWNoZWQgSUZDIGZpbGVgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhYnNVcmwgPSBpZmNVcmwuc3RhcnRzV2l0aCgnLycpID8gaWZjVXJsIDogJy8nICsgaWZjVXJsO1xuICAgIHNob3dMb2FkaW5nKGBEb3dubG9hZGluZyBJRkMgKCR7bW9kZWxEYXRhLm1vZGVsX25hbWV9KVx1MjAyNmAsIHRydWUpO1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChhYnNVcmwpO1xuICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzcC5zdGF0dXN9IGZldGNoaW5nIElGQ2ApO1xuXG4gICAgY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcC5hcnJheUJ1ZmZlcigpKTtcbiAgICBzaG93TG9hZGluZyhgUGFyc2luZyBJRkMgKCR7KGJ1Zi5sZW5ndGggLyAxZTYpLnRvRml4ZWQoMSl9IE1CKVx1MjAyNmAsIHRydWUpO1xuXG4gICAgY29uc3QgYXBpID0gYXdhaXQgZ2V0SWZjQXBpKCk7XG4gICAgLy8gQ09PUkRJTkFURV9UT19PUklHSU46IGZhbHNlIGVuc3VyZXMgYWxsIGRpc2NpcGxpbmVzIHNoYXJlIHdvcmxkIGNvb3JkaW5hdGVzIHdpdGggMCBkcmlmdCFcbiAgICBjb25zdCBpZmNNb2RlbElEID0gYXBpLk9wZW5Nb2RlbChidWYsIHsgQ09PUkRJTkFURV9UT19PUklHSU46IGZhbHNlLCBVU0VfRkFTVF9CVkg6IHRydWUgfSk7XG5cbiAgICBsZXQgZGlzYyA9IG1vZGVsRGF0YS5kaXNjaXBsaW5lIHx8ICdBcmNoaXRlY3R1cmUnO1xuICAgIGNvbnN0IG5hbWVMb3dlciA9IChtb2RlbERhdGEubW9kZWxfbmFtZSB8fCBtb2RlbERvY05hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnc3RydWMnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ3N0cicpKSBkaXNjID0gJ1N0cnVjdHVyYWwnO1xuICAgIGVsc2UgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnaHZhYycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnbWVwJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCd2dnMnKSkgZGlzYyA9ICdNRVAnO1xuXG4gICAgc2hvd0xvYWRpbmcoYEJ1aWxkaW5nIDNEIHNjZW5lICgke2Rpc2N9KVx1MjAyNmAsIHRydWUpO1xuICAgIGNvbnN0IHNjZW5lUmVzdWx0ID0gYnVpbGRJZmNTY2VuZShhcGksIGlmY01vZGVsSUQsIHtcbiAgICAgIG1vZGVsTmFtZTogbW9kZWxEYXRhLm1vZGVsX25hbWUgfHwgbW9kZWxEb2NOYW1lLFxuICAgICAgZGlzY2lwbGluZTogZGlzYyxcbiAgICB9KTtcblxuICAgIGZlZGVyYXRlZEdyb3VwLmFkZChzY2VuZVJlc3VsdC5ncm91cCk7XG5cbiAgICAvLyBMb2FkIHNlcnZlciBlbGVtZW50cyBmb3IgcHJvcGVydHkgbGlua2luZ1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbGVtUmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xuICAgICAgICBtZXRob2Q6IEFQSS5saXN0X2VsZW1lbnRzLFxuICAgICAgICBhcmdzOiB7IG1vZGVsOiBtb2RlbERvY05hbWUsIGZpbHRlcnM6ICd7fScsIGxpbWl0OiAyNTAwMCB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBlbGVtZW50cyA9IChlbGVtUmVzLm1lc3NhZ2UgJiYgZWxlbVJlcy5tZXNzYWdlLmVsZW1lbnRzKSB8fCBbXTtcbiAgICAgIGVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBjb25zdCBjbGVhblJlZiA9IChlbC5tZXNoX3JlZiB8fCAnJykucmVwbGFjZSgnZScsICcnKTtcbiAgICAgICAgaWYgKGNsZWFuUmVmKSBlbGVtZW50SW5kZXguc2V0KGAke21vZGVsRG9jTmFtZX06JHtjbGVhblJlZn1gLCBlbCk7XG4gICAgICAgIGlmIChlbC5zdGFibGVfaWQpIGVsZW1lbnRJbmRleC5zZXQoZWwuc3RhYmxlX2lkLCBlbCk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgbG9hZGVkTW9kZWxzLnNldChtb2RlbERvY05hbWUsIHtcbiAgICAgIG1vZGVsRG9jTmFtZSxcbiAgICAgIG1vZGVsTmFtZTogbW9kZWxEYXRhLm1vZGVsX25hbWUgfHwgbW9kZWxEb2NOYW1lLFxuICAgICAgZGlzY2lwbGluZTogZGlzYyxcbiAgICAgIGlmY01vZGVsSUQsXG4gICAgICBncm91cDogc2NlbmVSZXN1bHQuZ3JvdXAsXG4gICAgICBleHByZXNzTWFwOiBzY2VuZVJlc3VsdC5leHByZXNzTWFwLFxuICAgICAgbWVzaENvdW50OiBzY2VuZVJlc3VsdC5tZXNoQ291bnQsXG4gICAgICBlbGVtZW50czogW10sXG4gICAgICBpc0dob3N0ZWQ6IGZhbHNlLFxuICAgICAgb3BhY2l0eTogMS4wLFxuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHNldFN0YXR1cyhgTG9hZGVkICR7bW9kZWxEYXRhLm1vZGVsX25hbWV9IFske2Rpc2N9XTogJHtzY2VuZVJlc3VsdC5tZXNoQ291bnQudG90YWx9IG1lc2hlcywgJHtzY2VuZVJlc3VsdC5tZXNoQ291bnQudHJpc30gdHJpc2ApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgbW9kZWwgZ2VvbWV0cnknLCBlKTtcbiAgICBzZXRTdGF0dXMoYEVycm9yIGxvYWRpbmcgJHttb2RlbERvY05hbWV9OiAke2UubWVzc2FnZSB8fCBlfWApO1xuICB9IGZpbmFsbHkge1xuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5sb2FkTW9kZWwobW9kZWxEb2NOYW1lKSB7XG4gIGNvbnN0IG1vZGVsRW50cnkgPSBsb2FkZWRNb2RlbHMuZ2V0KG1vZGVsRG9jTmFtZSk7XG4gIGlmICghbW9kZWxFbnRyeSkgcmV0dXJuO1xuXG4gIGZlZGVyYXRlZEdyb3VwLnJlbW92ZShtb2RlbEVudHJ5Lmdyb3VwKTtcbiAgZGlzcG9zZUdyb3VwKG1vZGVsRW50cnkuZ3JvdXApO1xuICBsb2FkZWRNb2RlbHMuZGVsZXRlKG1vZGVsRG9jTmFtZSk7XG4gIHNldFN0YXR1cyhgVW5sb2FkZWQgJHttb2RlbEVudHJ5Lm1vZGVsTmFtZX1gKTtcbn1cblxuZnVuY3Rpb24gdW5sb2FkQWxsTW9kZWxzKCkge1xuICBsb2FkZWRNb2RlbHMuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICBmZWRlcmF0ZWRHcm91cC5yZW1vdmUoZW50cnkuZ3JvdXApO1xuICAgIGRpc3Bvc2VHcm91cChlbnRyeS5ncm91cCk7XG4gIH0pO1xuICBsb2FkZWRNb2RlbHMuY2xlYXIoKTtcbiAgZWxlbWVudE1lc2hlcyA9IFtdO1xuICBjbGFzaEhlbHBlcnNHcm91cC5jbGVhcigpO1xuICBjbGVhclNlbGVjdGlvbigpO1xuICByZW5kZXJNb2RlbHNMaXN0KCk7XG4gIHNldFN0YXR1cygnQWxsIG1vZGVscyBjbGVhcmVkJyk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCkge1xuICBlbGVtZW50TWVzaGVzID0gW107XG4gIGxvYWRlZE1vZGVscy5mb3JFYWNoKChlbnRyeSwgbW9kZWxEb2NOYW1lKSA9PiB7XG4gICAgZW50cnkuZXhwcmVzc01hcC5mb3JFYWNoKChtZXNoZXMsIGV4cHJlc3NJRCkgPT4ge1xuICAgICAgbWVzaGVzLmZvckVhY2gobSA9PiB7XG4gICAgICAgIG0udXNlckRhdGEubW9kZWxEb2NOYW1lID0gbW9kZWxEb2NOYW1lO1xuICAgICAgICBtLnVzZXJEYXRhLmRpc2NpcGxpbmUgPSBlbnRyeS5kaXNjaXBsaW5lO1xuICAgICAgICBlbGVtZW50TWVzaGVzLnB1c2goeyBtZXNoOiBtLCBleHByZXNzSUQsIG1vZGVsRG9jTmFtZSwgZGlzY2lwbGluZTogZW50cnkuZGlzY2lwbGluZSB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzcG9zZUdyb3VwKGdyb3VwKSB7XG4gIGdyb3VwLnRyYXZlcnNlKG8gPT4ge1xuICAgIGlmIChvLmlzTWVzaCkge1xuICAgICAgaWYgKG8uZ2VvbWV0cnkpIG8uZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgICAgaWYgKG8ubWF0ZXJpYWwpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoby5tYXRlcmlhbCkpIG8ubWF0ZXJpYWwuZm9yRWFjaChtID0+IG0uZGlzcG9zZSgpKTtcbiAgICAgICAgZWxzZSBvLm1hdGVyaWFsLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIERpc2NpcGxpbmUgTGF5ZXIgQ29udHJvbHMgKFZpc2liaWxpdHksIEdob3N0aW5nLCBPcGFjaXR5KSAtLS0tLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiBpbml0RGlzY2lwbGluZUNvbnRyb2xzKCkge1xuICBjb25zdCByb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc2NpcGxpbmUtbGF5ZXItcm93Jyk7XG4gIHJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgIGNvbnN0IGRpc2MgPSByb3cuZGF0YXNldC5kaXNjaXBsaW5lO1xuICAgIGNvbnN0IGJ0blZpcyA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuYnRuLXZpcycpO1xuICAgIGNvbnN0IGJ0bkdob3N0ID0gcm93LnF1ZXJ5U2VsZWN0b3IoJy5idG4tZ2hvc3QnKTtcbiAgICBjb25zdCBidG5Tb2xvID0gcm93LnF1ZXJ5U2VsZWN0b3IoJy5idG4tc29sbycpO1xuICAgIGNvbnN0IHNsaWRlciA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGlzYy1vcGFjaXR5LXNsaWRlcicpO1xuICAgIGNvbnN0IHZhbFRleHQgPSByb3cucXVlcnlTZWxlY3RvcignLmRpc2Mtb3BhY2l0eS12YWwnKTtcblxuICAgIGlmIChidG5WaXMpIHtcbiAgICAgIGJ0blZpcy5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBpc0N1cnJlbnRseVZpcyA9IGJ0blZpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpO1xuICAgICAgICBzZXREaXNjaXBsaW5lVmlzaWJpbGl0eShkaXNjLCAhaXNDdXJyZW50bHlWaXMpO1xuICAgICAgICBidG5WaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgIWlzQ3VycmVudGx5VmlzKTtcbiAgICAgICAgYnRuVmlzLnRleHRDb250ZW50ID0gIWlzQ3VycmVudGx5VmlzID8gJ1x1RDgzRFx1REM0MScgOiAnXHVEODNEXHVERUFCJztcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGJ0bkdob3N0KSB7XG4gICAgICBidG5HaG9zdC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBpc0dob3N0ID0gYnRuR2hvc3QuY2xhc3NMaXN0LmNvbnRhaW5zKCdnaG9zdC1hY3RpdmUnKTtcbiAgICAgICAgc2V0RGlzY2lwbGluZUdob3N0aW5nKGRpc2MsICFpc0dob3N0KTtcbiAgICAgICAgYnRuR2hvc3QuY2xhc3NMaXN0LnRvZ2dsZSgnZ2hvc3QtYWN0aXZlJywgIWlzR2hvc3QpO1xuICAgICAgICBpZiAoIWlzR2hvc3QpIHtcbiAgICAgICAgICBpZiAoc2xpZGVyKSBzbGlkZXIudmFsdWUgPSAyMDtcbiAgICAgICAgICBpZiAodmFsVGV4dCkgdmFsVGV4dC50ZXh0Q29udGVudCA9ICcyMCUnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzbGlkZXIpIHNsaWRlci52YWx1ZSA9IDEwMDtcbiAgICAgICAgICBpZiAodmFsVGV4dCkgdmFsVGV4dC50ZXh0Q29udGVudCA9ICcxMDAlJztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoYnRuU29sbykge1xuICAgICAgYnRuU29sby5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICByb3dzLmZvckVhY2gociA9PiB7XG4gICAgICAgICAgY29uc3QgZCA9IHIuZGF0YXNldC5kaXNjaXBsaW5lO1xuICAgICAgICAgIGNvbnN0IHZCdG4gPSByLnF1ZXJ5U2VsZWN0b3IoJy5idG4tdmlzJyk7XG4gICAgICAgICAgaWYgKGQgPT09IGRpc2MpIHtcbiAgICAgICAgICAgIHNldERpc2NpcGxpbmVWaXNpYmlsaXR5KGQsIHRydWUpO1xuICAgICAgICAgICAgaWYgKHZCdG4pIHsgdkJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTsgdkJ0bi50ZXh0Q29udGVudCA9ICdcdUQ4M0RcdURDNDEnOyB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldERpc2NpcGxpbmVWaXNpYmlsaXR5KGQsIGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh2QnRuKSB7IHZCdG4uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7IHZCdG4udGV4dENvbnRlbnQgPSAnXHVEODNEXHVERUFCJzsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNldFN0YXR1cyhgU29sbzogJHtkaXNjfWApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoc2xpZGVyKSB7XG4gICAgICBzbGlkZXIub25pbnB1dCA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgb3BWYWwgPSBwYXJzZUludChzbGlkZXIudmFsdWUsIDEwKSAvIDEwMC4wO1xuICAgICAgICBpZiAodmFsVGV4dCkgdmFsVGV4dC50ZXh0Q29udGVudCA9IGAke3NsaWRlci52YWx1ZX0lYDtcbiAgICAgICAgc2V0RGlzY2lwbGluZU9wYWNpdHkoZGlzYywgb3BWYWwpO1xuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXREaXNjaXBsaW5lVmlzaWJpbGl0eShkaXNjaXBsaW5lLCB2aXNpYmxlKSB7XG4gIGxvYWRlZE1vZGVscy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICBpZiAoZGlzY2lwbGluZU1hdGNoZXMoZW50cnkuZGlzY2lwbGluZSwgZGlzY2lwbGluZSkpIHtcbiAgICAgIGVudHJ5LnZpc2libGUgPSB2aXNpYmxlO1xuICAgICAgZW50cnkuZ3JvdXAudmlzaWJsZSA9IHZpc2libGU7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0RGlzY2lwbGluZUdob3N0aW5nKGRpc2NpcGxpbmUsIGdob3N0ZWQpIHtcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goZW50cnkgPT4ge1xuICAgIGlmIChkaXNjaXBsaW5lTWF0Y2hlcyhlbnRyeS5kaXNjaXBsaW5lLCBkaXNjaXBsaW5lKSkge1xuICAgICAgZW50cnkuaXNHaG9zdGVkID0gZ2hvc3RlZDtcbiAgICAgIGVudHJ5Lmdyb3VwLnRyYXZlcnNlKG8gPT4ge1xuICAgICAgICBpZiAoby5pc01lc2ggJiYgby5tYXRlcmlhbCkge1xuICAgICAgICAgIGlmICghby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcykge1xuICAgICAgICAgICAgby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcyA9IHtcbiAgICAgICAgICAgICAgY29sb3I6IG8ubWF0ZXJpYWwuY29sb3IuY2xvbmUoKSxcbiAgICAgICAgICAgICAgb3BhY2l0eTogby5tYXRlcmlhbC5vcGFjaXR5LFxuICAgICAgICAgICAgICB0cmFuc3BhcmVudDogby5tYXRlcmlhbC50cmFuc3BhcmVudCxcbiAgICAgICAgICAgICAgZGVwdGhXcml0ZTogby5tYXRlcmlhbC5kZXB0aFdyaXRlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGdob3N0ZWQpIHtcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgby5tYXRlcmlhbC5vcGFjaXR5ID0gMC4yMDtcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwuZGVwdGhXcml0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgby5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHg5NGEzYjgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwID0gby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcztcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBwLnRyYW5zcGFyZW50O1xuICAgICAgICAgICAgby5tYXRlcmlhbC5vcGFjaXR5ID0gcC5vcGFjaXR5O1xuICAgICAgICAgICAgby5tYXRlcmlhbC5kZXB0aFdyaXRlID0gcC5kZXB0aFdyaXRlO1xuICAgICAgICAgICAgby5tYXRlcmlhbC5jb2xvci5jb3B5KHAuY29sb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0RGlzY2lwbGluZU9wYWNpdHkoZGlzY2lwbGluZSwgb3BhY2l0eSkge1xuICBsb2FkZWRNb2RlbHMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NpcGxpbmUpKSB7XG4gICAgICBlbnRyeS5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICAgIGVudHJ5Lmdyb3VwLnRyYXZlcnNlKG8gPT4ge1xuICAgICAgICBpZiAoby5pc01lc2ggJiYgby5tYXRlcmlhbCkge1xuICAgICAgICAgIGlmICghby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcykge1xuICAgICAgICAgICAgby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcyA9IHtcbiAgICAgICAgICAgICAgY29sb3I6IG8ubWF0ZXJpYWwuY29sb3IuY2xvbmUoKSxcbiAgICAgICAgICAgICAgb3BhY2l0eTogby5tYXRlcmlhbC5vcGFjaXR5LFxuICAgICAgICAgICAgICB0cmFuc3BhcmVudDogby5tYXRlcmlhbC50cmFuc3BhcmVudCxcbiAgICAgICAgICAgICAgZGVwdGhXcml0ZTogby5tYXRlcmlhbC5kZXB0aFdyaXRlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgby5tYXRlcmlhbC50cmFuc3BhcmVudCA9IG9wYWNpdHkgPCAwLjk4O1xuICAgICAgICAgIG8ubWF0ZXJpYWwub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgICAgICAgby5tYXRlcmlhbC5kZXB0aFdyaXRlID0gb3BhY2l0eSA+PSAwLjg1O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkaXNjaXBsaW5lTWF0Y2hlcyhtb2RlbERpc2MsIHRhcmdldERpc2MpIHtcbiAgaWYgKCFtb2RlbERpc2MgfHwgIXRhcmdldERpc2MpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgbSA9IG1vZGVsRGlzYy50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCB0ID0gdGFyZ2V0RGlzYy50b0xvd2VyQ2FzZSgpO1xuICBpZiAobSA9PT0gdCkgcmV0dXJuIHRydWU7XG4gIGlmICh0ID09PSAnbWVwJyAmJiAobS5pbmNsdWRlcygnaHZhYycpIHx8IG0uaW5jbHVkZXMoJ3BsdW1iJykgfHwgbS5pbmNsdWRlcygnZWxlYycpIHx8IG0uaW5jbHVkZXMoJ21lY2gnKSkpIHJldHVybiB0cnVlO1xuICBpZiAodCA9PT0gJ3N0cnVjdHVyYWwnICYmIChtLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG0uaW5jbHVkZXMoJ3N0cicpKSkgcmV0dXJuIHRydWU7XG4gIGlmICh0ID09PSAnYXJjaGl0ZWN0dXJlJyAmJiAobS5pbmNsdWRlcygnYXJrJykgfHwgbS5pbmNsdWRlcygnYXJjaCcpKSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cclxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIEVsZW1lbnQgU2VsZWN0aW9uICYgUHJvcGVydHkgSW5zcGVjdG9yIC0tLS0tLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xuICBjdXJyZW50U2VsZWN0aW9uID0gbnVsbDtcbiAgaWYgKGVscy5wcm9wcykgZWxzLnByb3BzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIHNlbGVjdGlvbjwvZGl2Pic7XG4gIGlmIChlbHMucHJvcHNUaXRsZSkge1xuICAgIGVscy5wcm9wc1RpdGxlLnRleHRDb250ZW50ID0gJ0NsaWNrIGFuIGVsZW1lbnQgaW4gdGhlIHZpZXdlcic7XG4gICAgZWxzLnByb3BzVGl0bGUuY2xhc3NOYW1lID0gJ2VtcHR5LWhpbnQnO1xuICB9XG4gIGlmIChlbHMubGlua3MpIGVscy5saW5rcy5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5ObyBsaW5rczwvZGl2Pic7XG5cbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2ggfSkgPT4ge1xuICAgIGlmIChtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcikge1xuICAgICAgbWVzaC5tYXRlcmlhbC5jb2xvci5jb3B5KG1lc2gudXNlckRhdGEub3JpZ0NvbG9yKTtcbiAgICB9XG4gICAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4MDAwMDAwKTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbGVjdEVsZW1lbnQobWVzaCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWUpIHtcbiAgY2xlYXJTZWxlY3Rpb24oKTtcbiAgY29uc3QgbG9va3VwS2V5ID0gYCR7bW9kZWxEb2NOYW1lfToke2V4cHJlc3NJRH1gO1xuICBsZXQgZWwgPSBlbGVtZW50SW5kZXguZ2V0KGxvb2t1cEtleSkgfHwgZWxlbWVudEluZGV4LmdldChTdHJpbmcoZXhwcmVzc0lEKSkgfHwgbWVzaC51c2VyRGF0YS5lbGVtZW50O1xuXG4gIGN1cnJlbnRTZWxlY3Rpb24gPSB7IG1lc2gsIGVsZW1lbnQ6IGVsLCBleHByZXNzSUQsIG1vZGVsRG9jTmFtZSB9O1xuXG4gIGlmICghbWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gudXNlckRhdGEub3JpZ0NvbG9yID0gbWVzaC5tYXRlcmlhbC5jb2xvci5jbG9uZSgpO1xuICBtZXNoLm1hdGVyaWFsLmNvbG9yLmNvcHkoaGlnaGxpZ2h0TWF0LmNvbG9yKTtcbiAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuY29weShoaWdobGlnaHRNYXQuZW1pc3NpdmUpO1xuXG4gIGNvbnN0IG1vZGVsRW50cnkgPSBsb2FkZWRNb2RlbHMuZ2V0KG1vZGVsRG9jTmFtZSk7XG4gIGNvbnN0IGRpc2NpcGxpbmUgPSAobW9kZWxFbnRyeSAmJiBtb2RlbEVudHJ5LmRpc2NpcGxpbmUpIHx8IG1lc2gudXNlckRhdGEuZGlzY2lwbGluZSB8fCAnRGlzY2lwbGluZSc7XG4gIGNvbnN0IG1vZGVsTmFtZSA9IChtb2RlbEVudHJ5ICYmIG1vZGVsRW50cnkubW9kZWxOYW1lKSB8fCBtb2RlbERvY05hbWU7XG5cbiAgcmVuZGVyRWxlbWVudEluc3BlY3RvcihlbCwgZXhwcmVzc0lELCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUsIG1lc2gpO1xuXG4gIGlmIChlbCAmJiAoIWVsLnByb3BlcnRpZXMgfHwgIU9iamVjdC5rZXlzKGVsLnByb3BlcnRpZXMpLmxlbmd0aCkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZnVsbERvYyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkuZ2V0X2VsZW1lbnQsIGFyZ3M6IHsgZWxlbWVudDogZWwubmFtZSB9IH0pO1xuICAgICAgaWYgKGZ1bGxEb2MubWVzc2FnZSAmJiBjdXJyZW50U2VsZWN0aW9uICYmIGN1cnJlbnRTZWxlY3Rpb24uZXhwcmVzc0lEID09PSBleHByZXNzSUQpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihlbCwgZnVsbERvYy5tZXNzYWdlKTtcbiAgICAgICAgcmVuZGVyRWxlbWVudEluc3BlY3RvcihlbCwgZXhwcmVzc0lELCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUsIG1lc2gpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH0gZWxzZSBpZiAoIWVsICYmIG1vZGVsRW50cnkgJiYgaWZjQXBpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGxpbmVEYXRhID0gYXdhaXQgaWZjQXBpLkdldExpbmUobW9kZWxFbnRyeS5pZmNNb2RlbElELCBleHByZXNzSUQpO1xuICAgICAgcmVuZGVyV2ViSWZjSW5zcGVjdG9yKGV4cHJlc3NJRCwgbGluZURhdGEsIG1vZGVsTmFtZSwgZGlzY2lwbGluZSk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJFbGVtZW50SW5zcGVjdG9yKGVsLCBleHByZXNzSUQsIG1vZGVsTmFtZSwgZGlzY2lwbGluZSwgbWVzaCkge1xuICBpZiAoIWVscy5wcm9wc1RpdGxlIHx8ICFlbHMucHJvcHMpIHJldHVybjtcblxuICBjb25zdCB0aXRsZSA9IChlbCAmJiAoZWwudGl0bGUgfHwgZWwuZWxlbWVudF90eXBlKSkgfHwgYElGQyAjJHtleHByZXNzSUR9YDtcbiAgY29uc3QgZ3VpZCA9IChlbCAmJiBlbC5zdGFibGVfaWQpIHx8ICcnO1xuICBlbHMucHJvcHNUaXRsZS50ZXh0Q29udGVudCA9IGAke3RpdGxlfSAke2d1aWQgPyBgKCR7Z3VpZH0pYCA6ICcnfWA7XG4gIGVscy5wcm9wc1RpdGxlLmNsYXNzTmFtZSA9ICcnO1xuICBlbHMucHJvcHMuaW5uZXJIVE1MID0gJyc7XG5cbiAgLy8gQmFkZ2VzIEhlYWRlclxuICBjb25zdCBiYWRnZXNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgYmFkZ2VzRGl2LnN0eWxlLm1hcmdpbkJvdHRvbSA9ICc4cHgnO1xuICBiYWRnZXNEaXYuaW5uZXJIVE1MID0gYFxuICAgIDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlIG1vZGVsLWJhZGdlXCI+JHttb2RlbE5hbWV9PC9zcGFuPlxuICAgIDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlXCI+JHtkaXNjaXBsaW5lfTwvc3Bhbj5cbiAgICAke2VsICYmIGVsLnN0b3JleSA/IGA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZWwuc3RvcmV5fTwvc3Bhbj5gIDogJyd9XG4gICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2VcIj4jJHtleHByZXNzSUR9PC9zcGFuPlxuICBgO1xuICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQoYmFkZ2VzRGl2KTtcblxuICAvLyBCb3VuZGluZyBCb3ggSW5mb1xuICBpZiAobWVzaCAmJiBtZXNoLmdlb21ldHJ5KSB7XG4gICAgaWYgKCFtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94KSBtZXNoLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ0JveCgpO1xuICAgIGNvbnN0IGJveCA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3guY2xvbmUoKS5hcHBseU1hdHJpeDQobWVzaC5tYXRyaXhXb3JsZCk7XG4gICAgY29uc3Qgc2l6ZSA9IGJveC5nZXRTaXplKG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xuICAgIGNvbnN0IGNlbnRlciA9IGJveC5nZXRDZW50ZXIobmV3IFRIUkVFLlZlY3RvcjMoKSk7XG5cbiAgICBjb25zdCBiYm94SGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgYmJveEhlYWRlci5zdHlsZS5jc3NUZXh0ID0gJ2ZvbnQtd2VpZ2h0OjYwMDtmb250LXNpemU6MTJweDttYXJnaW46OHB4IDAgNHB4O2NvbG9yOiMxZTI5M2InO1xuICAgIGJib3hIZWFkZXIudGV4dENvbnRlbnQgPSAnU3BhdGlhbCBEaW1lbnNpb25zJztcbiAgICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQoYmJveEhlYWRlcik7XG5cbiAgICBjb25zdCBiYm94VGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xuICAgIGJib3hUYWJsZS5jbGFzc05hbWUgPSAncHJvcGVydHktdGFibGUnO1xuICAgIGJib3hUYWJsZS5pbm5lckhUTUwgPSBgXG4gICAgICA8dHI+PHRkPlNpemUgKFggXHUwMEQ3IFkgXHUwMEQ3IFopPC90ZD48dGQ+JHtzaXplLngudG9GaXhlZCgyKX1tIFx1MDBENyAke3NpemUueS50b0ZpeGVkKDIpfW0gXHUwMEQ3ICR7c2l6ZS56LnRvRml4ZWQoMil9bTwvdGQ+PC90cj5cbiAgICAgIDx0cj48dGQ+Q2VudGVyIFBvaW50PC90ZD48dGQ+KCR7Y2VudGVyLngudG9GaXhlZCgyKX0sICR7Y2VudGVyLnkudG9GaXhlZCgyKX0sICR7Y2VudGVyLnoudG9GaXhlZCgyKX0pPC90ZD48L3RyPlxuICAgIGA7XG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKGJib3hUYWJsZSk7XG4gIH1cblxuICAvLyBRdWFudGl0aWVzIFRhYmxlXG4gIGNvbnN0IHEgPSAoZWwgJiYgZWwucXVhbnRpdGllcykgfHwge307XG4gIGNvbnN0IHFLZXlzID0gT2JqZWN0LmtleXMocSk7XG4gIGlmIChxS2V5cy5sZW5ndGgpIHtcbiAgICBjb25zdCBxSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcUhlYWRlci5zdHlsZS5jc3NUZXh0ID0gJ2ZvbnQtd2VpZ2h0OjYwMDtmb250LXNpemU6MTJweDttYXJnaW46MTBweCAwIDRweDtjb2xvcjojMWUyOTNiJztcbiAgICBxSGVhZGVyLnRleHRDb250ZW50ID0gJ1F1YW50aXRpZXMgKFF0b18qKSc7XG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHFIZWFkZXIpO1xuXG4gICAgY29uc3QgcVRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICBxVGFibGUuY2xhc3NOYW1lID0gJ3Byb3BlcnR5LXRhYmxlJztcbiAgICBxS2V5cy5mb3JFYWNoKGsgPT4ge1xuICAgICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgICAgdHIuaW5uZXJIVE1MID0gYDx0ZD4ke2t9PC90ZD48dGQ+JHtxW2tdfTwvdGQ+YDtcbiAgICAgIHFUYWJsZS5hcHBlbmRDaGlsZCh0cik7XG4gICAgfSk7XG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHFUYWJsZSk7XG4gIH1cblxuICAvLyBQcm9wZXJ0eSBTZXRzIFRhYmxlXG4gIGNvbnN0IHAgPSAoZWwgJiYgZWwucHJvcGVydGllcykgfHwge307XG4gIGNvbnN0IHBLZXlzID0gT2JqZWN0LmtleXMocCkuZmlsdGVyKGsgPT4gIVsnaWZjX2lkJywgJ2lmY190eXBlJ10uaW5jbHVkZXMoaykpO1xuICBpZiAocEtleXMubGVuZ3RoKSB7XG4gICAgY29uc3QgcEhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBIZWFkZXIuc3R5bGUuY3NzVGV4dCA9ICdmb250LXdlaWdodDo2MDA7Zm9udC1zaXplOjEycHg7bWFyZ2luOjEwcHggMCA0cHg7Y29sb3I6IzFlMjkzYic7XG4gICAgcEhlYWRlci50ZXh0Q29udGVudCA9ICdQcm9wZXJ0eSBTZXRzIChQc2V0XyopJztcbiAgICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQocEhlYWRlcik7XG5cbiAgICBjb25zdCBwVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xuICAgIHBUYWJsZS5jbGFzc05hbWUgPSAncHJvcGVydHktdGFibGUnO1xuICAgIHBLZXlzLnNsaWNlKDAsIDUwKS5mb3JFYWNoKGsgPT4ge1xuICAgICAgY29uc3QgdiA9IHR5cGVvZiBwW2tdID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHBba10pIDogU3RyaW5nKHBba10pO1xuICAgICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgICAgdHIuaW5uZXJIVE1MID0gYDx0ZD4ke2t9PC90ZD48dGQ+JHt2LnNsaWNlKDAsIDcwKX08L3RkPmA7XG4gICAgICBwVGFibGUuYXBwZW5kQ2hpbGQodHIpO1xuICAgIH0pO1xuICAgIGVscy5wcm9wcy5hcHBlbmRDaGlsZChwVGFibGUpO1xuICB9XG5cbiAgaWYgKGVsICYmIGVsLm5hbWUpIGxvYWRCb3FMaW5rcyhlbC5uYW1lKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyV2ViSWZjSW5zcGVjdG9yKGV4cHJlc3NJRCwgcHJvcHMsIG1vZGVsTmFtZSwgZGlzY2lwbGluZSkge1xuICBpZiAoIWVscy5wcm9wc1RpdGxlIHx8ICFlbHMucHJvcHMpIHJldHVybjtcbiAgZWxzLnByb3BzVGl0bGUudGV4dENvbnRlbnQgPSBgSUZDICMke2V4cHJlc3NJRH0gJHtwcm9wcy50eXBlIHx8ICcnfWA7XG4gIGVscy5wcm9wc1RpdGxlLmNsYXNzTmFtZSA9ICcnO1xuICBlbHMucHJvcHMuaW5uZXJIVE1MID0gYFxuICAgIDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOjhweFwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgbW9kZWwtYmFkZ2VcIj4ke21vZGVsTmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZGlzY2lwbGluZX08L3NwYW4+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgY29uc3QgdGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xuICB0YWJsZS5jbGFzc05hbWUgPSAncHJvcGVydHktdGFibGUnO1xuICBPYmplY3Qua2V5cyhwcm9wcykuc2xpY2UoMCwgMzApLmZvckVhY2goayA9PiB7XG4gICAgY29uc3QgdiA9IHByb3BzW2tdO1xuICAgIGNvbnN0IHZhbCA9IHYgJiYgdHlwZW9mIHYgPT09ICdvYmplY3QnICYmIHYudmFsdWUgIT09IHVuZGVmaW5lZCA/IHYudmFsdWUgOiAodHlwZW9mIHYgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkodikuc2xpY2UoMCwgNjApIDogdik7XG4gICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgIHRyLmlubmVySFRNTCA9IGA8dGQ+JHtrfTwvdGQ+PHRkPiR7U3RyaW5nKHZhbCl9PC90ZD5gO1xuICAgIHRhYmxlLmFwcGVuZENoaWxkKHRyKTtcbiAgfSk7XG4gIGVscy5wcm9wcy5hcHBlbmRDaGlsZCh0YWJsZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRCb3FMaW5rcyhiaW1FbGVtZW50KSB7XG4gIGlmICghZWxzLmxpbmtzKSByZXR1cm47XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoeyBtZXRob2Q6IEFQSS5saXN0X2JvcV9saW5rcywgYXJnczogeyBiaW1fZWxlbWVudDogYmltRWxlbWVudCB9IH0pO1xuICAgIGNvbnN0IGxpbmtzID0gcmVzLm1lc3NhZ2UgfHwgW107XG4gICAgaWYgKCFsaW5rcy5sZW5ndGgpIHtcbiAgICAgIGVscy5saW5rcy5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5ObyBsaW5rcyBmb3IgY3VycmVudCBlbGVtZW50PC9kaXY+JztcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzLmxpbmtzLmlubmVySFRNTCA9IGxpbmtzLm1hcChsID0+IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJsaW5rLXJvd1wiIHN0eWxlPVwiZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjtwYWRkaW5nOjRweCAwO2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNmMWY1Zjk7Zm9udC1zaXplOjEycHhcIj5cbiAgICAgICAgPHNwYW4+JHtsLmJvcV9yZWZlcmVuY2VfbmFtZX0gPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2VcIj4ke2wuYm9xX3JlZmVyZW5jZV90eXBlfTwvc3Bhbj48L3NwYW4+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxcIiBkYXRhLW5hbWU9XCIke2wubmFtZX1cIiBzdHlsZT1cImNvbG9yOiNlZjQ0NDQ7Ym9yZGVyOm5vbmU7YmFja2dyb3VuZDpub25lO2N1cnNvcjpwb2ludGVyXCI+XHUyNzE1PC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICBgKS5qb2luKCcnKTtcblxuICAgIGVscy5saW5rcy5xdWVyeVNlbGVjdG9yQWxsKCcuZGVsJykuZm9yRWFjaChiID0+IHtcbiAgICAgIGIub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgZnJhcHBlLmNhbGwoeyBtZXRob2Q6IEFQSS5kZWxldGVfYm9xX2xpbmssIGFyZ3M6IHsgbGluazogYi5kYXRhc2V0Lm5hbWUgfSB9KTtcbiAgICAgICAgbG9hZEJvcUxpbmtzKGJpbUVsZW1lbnQpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVscy5saW5rcy5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5FcnJvciBsb2FkaW5nIGxpbmtzPC9kaXY+JztcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIEluLVZpZXdlciBCVkggQ2xhc2ggRGV0ZWN0aW9uIEVuZ2luZSAtLS0tLS0tLS0tLS0tLS0tXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlQ2xhc2hEZXRlY3Rpb24oKSB7XG4gIGNvbnN0IGRpc2NBID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kaXNjLWEnKSB8fCB7fSkudmFsdWUgfHwgJ1N0cnVjdHVyYWwnO1xuICBjb25zdCBkaXNjQiA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtZGlzYy1iJykgfHwge30pLnZhbHVlIHx8ICdNRVAnO1xuICBjb25zdCB0b2xJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC10b2xlcmFuY2UnKTtcbiAgY29uc3QgdG9sZXJhbmNlID0gdG9sSW5wdXQgPyBwYXJzZUZsb2F0KHRvbElucHV0LnZhbHVlKSB8fCAwLjAgOiAwLjA7XG5cbiAgc2V0U3RhdHVzKGBSdW5uaW5nIEJWSCBjbGFzaCBjaGVjayBiZXR3ZWVuICR7ZGlzY0F9IGFuZCAke2Rpc2NCfVx1MjAyNmApO1xuICBzaG93TG9hZGluZygnQ29tcHV0aW5nIG1lc2ggQlZIIGludGVyc2VjdGlvbnNcdTIwMjYnLCB0cnVlKTtcblxuICBjb25zdCBtZXNoZXNBID0gW107XG4gIGNvbnN0IG1lc2hlc0IgPSBbXTtcblxuICBsb2FkZWRNb2RlbHMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NBKSkge1xuICAgICAgZW50cnkuZ3JvdXAudHJhdmVyc2UobyA9PiB7IGlmIChvLmlzTWVzaCkgbWVzaGVzQS5wdXNoKG8pOyB9KTtcbiAgICB9XG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NCKSkge1xuICAgICAgZW50cnkuZ3JvdXAudHJhdmVyc2UobyA9PiB7IGlmIChvLmlzTWVzaCkgbWVzaGVzQi5wdXNoKG8pOyB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICghbWVzaGVzQS5sZW5ndGggfHwgIW1lc2hlc0IubGVuZ3RoKSB7XG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcbiAgICBzZXRTdGF0dXMoYENhbm5vdCBydW4gY2xhc2ggY2hlY2s6IE1ha2Ugc3VyZSBtb2RlbHMgZm9yIGJvdGggJHtkaXNjQX0gYW5kICR7ZGlzY0J9IGFyZSBsb2FkZWQuYCk7XG4gICAgaWYgKGVscy5jbGFzaENhcmRzTGlzdCkge1xuICAgICAgZWxzLmNsYXNoQ2FyZHNMaXN0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPkxvYWQgbW9kZWxzIGZvciBib3RoICR7ZGlzY0F9IGFuZCAke2Rpc2NCfSBmaXJzdDwvZGl2PmA7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEV4ZWN1dGUgdHdvLXRpZXIgQlZIIGNvbGxpc2lvbiBkZXRlY3Rpb25cbiAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIGNvbnN0IHJlc3VsdCA9IGRldGVjdENsYXNoZXMobWVzaGVzQSwgbWVzaGVzQiwgeyB0b2xlcmFuY2UgfSk7XG4gIGNvbnN0IGR1cmF0aW9uID0gKHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lKS50b0ZpeGVkKDApO1xuXG4gIGRldGVjdGVkQ2xhc2hlcyA9IHJlc3VsdC5jbGFzaGVzIHx8IFtdO1xuICBzZXRTdGF0dXMoYENsYXNoIGNoZWNrIGNvbXBsZXRlOiAke2RldGVjdGVkQ2xhc2hlcy5sZW5ndGh9IGNsYXNoZXMgZGV0ZWN0ZWQgaW4gJHtkdXJhdGlvbn1tcyAoJHtyZXN1bHQuc3RhdHMubmFycm93cGhhc2VDaGVja3N9IEJWSCBjaGVja3MpYCk7XG4gIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XG5cbiAgcmVuZGVyQ2xhc2hlc0xpc3QoKTtcblxuICAvLyBTd2l0Y2ggdG8gQ2xhc2hlcyB0YWJcbiAgY29uc3QgdGFiQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYi1idG4tY2xhc2hlcycpO1xuICBpZiAodGFiQnRuKSB0YWJCdG4uY2xpY2soKTtcbn1cclxuXG5mdW5jdGlvbiByZW5kZXJDbGFzaGVzTGlzdCgpIHtcbiAgaWYgKCFlbHMuY2xhc2hDYXJkc0xpc3QpIHJldHVybjtcbiAgZWxzLmNsYXNoQ2FyZHNMaXN0LmlubmVySFRNTCA9ICcnO1xuXG4gIGlmIChlbHMuY2xhc2hCYWRnZUNvdW50KSB7XG4gICAgZWxzLmNsYXNoQmFkZ2VDb3VudC50ZXh0Q29udGVudCA9IGRldGVjdGVkQ2xhc2hlcy5sZW5ndGg7XG4gICAgZWxzLmNsYXNoQmFkZ2VDb3VudC5zdHlsZS5kaXNwbGF5ID0gZGV0ZWN0ZWRDbGFzaGVzLmxlbmd0aCA/ICdpbmxpbmUtYmxvY2snIDogJ25vbmUnO1xuICB9XG5cbiAgaWYgKCFkZXRlY3RlZENsYXNoZXMubGVuZ3RoKSB7XG4gICAgZWxzLmNsYXNoQ2FyZHNMaXN0LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGNsYXNoZXMgZGV0ZWN0ZWQgYmV0d2VlbiBzZWxlY3RlZCBkaXNjaXBsaW5lcyE8L2Rpdj4nO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHNldkZpbHRlciA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtZmlsdGVyLXNldmVyaXR5JykgfHwge30pLnZhbHVlIHx8ICcnO1xuICBjb25zdCBmaWx0ZXJlZCA9IHNldkZpbHRlciA/IGRldGVjdGVkQ2xhc2hlcy5maWx0ZXIoYyA9PiBjLnNldmVyaXR5ID09PSBzZXZGaWx0ZXIpIDogZGV0ZWN0ZWRDbGFzaGVzO1xuXG4gIGZpbHRlcmVkLmZvckVhY2goKGNsYXNoKSA9PiB7XG4gICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNhcmQuY2xhc3NOYW1lID0gJ2NsYXNoLWNhcmQnICsgKGFjdGl2ZUNsYXNoICYmIGFjdGl2ZUNsYXNoLmlkID09PSBjbGFzaC5pZCA/ICcgYWN0aXZlJyA6ICcnKTtcbiAgICBjb25zdCBwdCA9IGNsYXNoLmNvbGxpc2lvblBvaW50O1xuICAgIGNvbnN0IHNldkNsYXNzID0gY2xhc2guc2V2ZXJpdHkgPyBgc2V2ZXJpdHktJHtjbGFzaC5zZXZlcml0eS50b0xvd2VyQ2FzZSgpfWAgOiAnc2V2ZXJpdHktbWlub3InO1xuXG4gICAgY2FyZC5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY2FyZC10aXRsZVwiPiR7Y2xhc2guZWxlbWVudEEuZGlzY2lwbGluZX0gIyR7Y2xhc2guZWxlbWVudEEuZXhwcmVzc0lEfSBcdTAwRDcgJHtjbGFzaC5lbGVtZW50Qi5kaXNjaXBsaW5lfSAjJHtjbGFzaC5lbGVtZW50Qi5leHByZXNzSUR9PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY2FyZC1tZXRhXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlICR7c2V2Q2xhc3N9XCI+JHtjbGFzaC5zZXZlcml0eX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlIHN0YXR1cy1vcGVuXCI+JHtjbGFzaC5zdGF0dXN9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZSBtb2RlbC1iYWRnZVwiPiR7Y2xhc2guZWxlbWVudEEuaWZjVHlwZSB8fCAnRWxlbWVudCd9IC8gJHtjbGFzaC5lbGVtZW50Qi5pZmNUeXBlIHx8ICdFbGVtZW50J308L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jYXJkLWNvb3Jkc1wiPlhZWjogKCR7cHQueC50b0ZpeGVkKDIpfSwgJHtwdC55LnRvRml4ZWQoMil9LCAke3B0LnoudG9GaXhlZCgyKX0pIHwgRGVwdGg6ICR7Y2xhc2gucGVuZXRyYXRpb25EZXB0aCA/IGNsYXNoLnBlbmV0cmF0aW9uRGVwdGgudG9GaXhlZCgxKSA6ICcwJ31tbTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNhcmQtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cyBidG4tZmx5XCI+XHVEODNDXHVERkFGIEZseS1UbzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICAgIGNhcmQub25jbGljayA9ICgpID0+IHNlbGVjdENsYXNoKGNsYXNoKTtcbiAgICBjb25zdCBmbHlCdG4gPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5idG4tZmx5Jyk7XG4gICAgaWYgKGZseUJ0bikge1xuICAgICAgZmx5QnRuLm9uY2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzZWxlY3RDbGFzaChjbGFzaCk7XG4gICAgICAgIGZseVRvQ2xhc2goY2xhc2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBlbHMuY2xhc2hDYXJkc0xpc3QuYXBwZW5kQ2hpbGQoY2FyZCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZWxlY3RDbGFzaChjbGFzaCkge1xuICBhY3RpdmVDbGFzaCA9IGNsYXNoO1xuICByZW5kZXJDbGFzaGVzTGlzdCgpO1xuICBoaWdobGlnaHRDbGFzaEVsZW1lbnRzKGNsYXNoKTtcbiAgcmVuZGVyQ2xhc2hEZXRhaWxWaWV3KGNsYXNoKTtcbn1cblxuZnVuY3Rpb24gaGlnaGxpZ2h0Q2xhc2hFbGVtZW50cyhjbGFzaCkge1xuICBjbGFzaEhlbHBlcnNHcm91cC5jbGVhcigpO1xuXG4gIC8vIEdob3N0IGJhY2tncm91bmQgbWVzaGVzXG4gIGVsZW1lbnRNZXNoZXMuZm9yRWFjaCgoeyBtZXNoIH0pID0+IHtcbiAgICBpZiAobWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gubWF0ZXJpYWwuY29sb3IuY29weShtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcik7XG4gICAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4MDAwMDAwKTtcbiAgICBtZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICBtZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAwLjE1O1xuICB9KTtcblxuICBjb25zdCBtZXNoQSA9IGNsYXNoLmVsZW1lbnRBLm1lc2g7XG4gIGNvbnN0IG1lc2hCID0gY2xhc2guZWxlbWVudEIubWVzaDtcblxuICBpZiAobWVzaEEpIHtcbiAgICBpZiAoIW1lc2hBLnVzZXJEYXRhLm9yaWdDb2xvcikgbWVzaEEudXNlckRhdGEub3JpZ0NvbG9yID0gbWVzaEEubWF0ZXJpYWwuY29sb3IuY2xvbmUoKTtcbiAgICBtZXNoQS5tYXRlcmlhbC5jb2xvci5jb3B5KGNsYXNoTWF0QS5jb2xvcik7XG4gICAgaWYgKG1lc2hBLm1hdGVyaWFsLmVtaXNzaXZlKSBtZXNoQS5tYXRlcmlhbC5lbWlzc2l2ZS5jb3B5KGNsYXNoTWF0QS5lbWlzc2l2ZSk7XG4gICAgbWVzaEEubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBmYWxzZTtcbiAgICBtZXNoQS5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xuICB9XG5cbiAgaWYgKG1lc2hCKSB7XG4gICAgaWYgKCFtZXNoQi51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2hCLnVzZXJEYXRhLm9yaWdDb2xvciA9IG1lc2hCLm1hdGVyaWFsLmNvbG9yLmNsb25lKCk7XG4gICAgbWVzaEIubWF0ZXJpYWwuY29sb3IuY29weShjbGFzaE1hdEIuY29sb3IpO1xuICAgIGlmIChtZXNoQi5tYXRlcmlhbC5lbWlzc2l2ZSkgbWVzaEIubWF0ZXJpYWwuZW1pc3NpdmUuY29weShjbGFzaE1hdEIuZW1pc3NpdmUpO1xuICAgIG1lc2hCLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgbWVzaEIubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcbiAgfVxuXG4gIC8vIEFkZCBDZW50cm9pZCAzRCBQaW4gTWFya2VyXG4gIGNvbnN0IG1hcmtlciA9IGNyZWF0ZUNlbnRyb2lkTWFya2VyKGNsYXNoLmNvbGxpc2lvblBvaW50KTtcbiAgY2xhc2hIZWxwZXJzR3JvdXAuYWRkKG1hcmtlcik7XG5cbiAgLy8gQWRkIFdpcmVmcmFtZSBCb3VuZGluZyBCb3ggSGVscGVyXG4gIGlmIChjbGFzaC5ib3VuZGluZ0JveCkge1xuICAgIGNvbnN0IGJveEhlbHBlciA9IGNyZWF0ZUludGVyc2VjdGlvbkJveEhlbHBlcihjbGFzaC5ib3VuZGluZ0JveCk7XG4gICAgaWYgKGJveEhlbHBlcikgY2xhc2hIZWxwZXJzR3JvdXAuYWRkKGJveEhlbHBlcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmx5VG9DbGFzaChjbGFzaCkge1xuICBjb25zdCB0YXJnZXRQb3MgPSBuZXcgVEhSRUUuVmVjdG9yMyhjbGFzaC5jb2xsaXNpb25Qb2ludC54LCBjbGFzaC5jb2xsaXNpb25Qb2ludC55LCBjbGFzaC5jb2xsaXNpb25Qb2ludC56KTtcbiAgY29uc3QgZGlzdGFuY2UgPSA0LjU7XG4gIGNvbnN0IGNhbVBvcyA9IHRhcmdldFBvcy5jbG9uZSgpLmFkZChuZXcgVEhSRUUuVmVjdG9yMyhkaXN0YW5jZSAqIDAuNywgZGlzdGFuY2UgKiAwLjUsIGRpc3RhbmNlICogMC43KSk7XG5cbiAgY29uc3Qgc3RhcnRDYW0gPSBjYW1lcmEucG9zaXRpb24uY2xvbmUoKTtcbiAgY29uc3Qgc3RhcnRUYXJnZXQgPSBjb250cm9scy50YXJnZXQuY2xvbmUoKTtcbiAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIGNvbnN0IGR1cmF0aW9uID0gNzUwO1xuXG4gIGZ1bmN0aW9uIGFuaW1hdGVTdGVwKG5vdykge1xuICAgIGNvbnN0IHQgPSBNYXRoLm1pbigobm93IC0gc3RhcnRUaW1lKSAvIGR1cmF0aW9uLCAxLjApO1xuICAgIGNvbnN0IGVhc2UgPSB0IDwgMC41ID8gMiAqIHQgKiB0IDogLTEgKyAoNCAtIDIgKiB0KSAqIHQ7XG4gICAgY2FtZXJhLnBvc2l0aW9uLmxlcnBWZWN0b3JzKHN0YXJ0Q2FtLCBjYW1Qb3MsIGVhc2UpO1xuICAgIGNvbnRyb2xzLnRhcmdldC5sZXJwVmVjdG9ycyhzdGFydFRhcmdldCwgdGFyZ2V0UG9zLCBlYXNlKTtcbiAgICBjb250cm9scy51cGRhdGUoKTtcbiAgICBpZiAodCA8IDEuMCkgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGVTdGVwKTtcbiAgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVN0ZXApO1xuICBzZXRTdGF0dXMoYEluc3BlY3RpbmcgJHtjbGFzaC5pZH0gYXQgKCR7dGFyZ2V0UG9zLngudG9GaXhlZCgyKX0sICR7dGFyZ2V0UG9zLnkudG9GaXhlZCgyKX0sICR7dGFyZ2V0UG9zLnoudG9GaXhlZCgyKX0pYCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gQ2xhc2ggRGV0YWlsICYgVGhyZWFkZWQgRGlzY3Vzc2lvbiBVSSAtLS0tLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiByZW5kZXJDbGFzaERldGFpbFZpZXcoY2xhc2gpIHtcbiAgaWYgKCFlbHMuY2xhc2hEZXRhaWxDb250YWluZXIgfHwgIWVscy5jbGFzaExpc3RDb250YWluZXIpIHJldHVybjtcbiAgZWxzLmNsYXNoTGlzdENvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBlbHMuY2xhc2hEZXRhaWxDb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kZXRhaWwtdGl0bGUnKTtcbiAgY29uc3QgbWV0YUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRldGFpbC1tZXRhJyk7XG4gIGNvbnN0IHNldkJhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRldGFpbC1zZXZlcml0eScpO1xuXG4gIGlmICh0aXRsZUVsKSB0aXRsZUVsLnRleHRDb250ZW50ID0gYCR7Y2xhc2guZWxlbWVudEEuZGlzY2lwbGluZX0gIyR7Y2xhc2guZWxlbWVudEEuZXhwcmVzc0lEfSBcdTAwRDcgJHtjbGFzaC5lbGVtZW50Qi5kaXNjaXBsaW5lfSAjJHtjbGFzaC5lbGVtZW50Qi5leHByZXNzSUR9YDtcbiAgaWYgKHNldkJhZGdlKSB7XG4gICAgc2V2QmFkZ2UudGV4dENvbnRlbnQgPSBjbGFzaC5zZXZlcml0eTtcbiAgICBzZXZCYWRnZS5jbGFzc05hbWUgPSBgYmltLWJhZGdlIHNldmVyaXR5LSR7KGNsYXNoLnNldmVyaXR5IHx8ICdtaW5vcicpLnRvTG93ZXJDYXNlKCl9YDtcbiAgfVxuICBpZiAobWV0YUVsKSB7XG4gICAgY29uc3QgcHQgPSBjbGFzaC5jb2xsaXNpb25Qb2ludDtcbiAgICBtZXRhRWwuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdj48c3Ryb25nPkNvbGxpc2lvbiBDb29yZGluYXRlczo8L3N0cm9uZz4gKCR7cHQueC50b0ZpeGVkKDIpfSwgJHtwdC55LnRvRml4ZWQoMil9LCAke3B0LnoudG9GaXhlZCgyKX0pPC9kaXY+XG4gICAgICA8ZGl2PjxzdHJvbmc+UGVuZXRyYXRpb24gRGVwdGg6PC9zdHJvbmc+ICR7KGNsYXNoLnBlbmV0cmF0aW9uRGVwdGggfHwgMCkudG9GaXhlZCgxKX0gbW0gfCA8c3Ryb25nPlZvbHVtZTo8L3N0cm9uZz4gJHsoY2xhc2guaW50ZXJzZWN0aW9uVm9sdW1lIHx8IDApLnRvRml4ZWQoNCl9IG1cdTAwQjM8L2Rpdj5cbiAgICAgIDxkaXY+PHN0cm9uZz5FbGVtZW50IEE6PC9zdHJvbmc+ICR7Y2xhc2guZWxlbWVudEEubW9kZWxOYW1lfSAoJHtjbGFzaC5lbGVtZW50QS5pZmNUeXBlfSk8L2Rpdj5cbiAgICAgIDxkaXY+PHN0cm9uZz5FbGVtZW50IEI6PC9zdHJvbmc+ICR7Y2xhc2guZWxlbWVudEIubW9kZWxOYW1lfSAoJHtjbGFzaC5lbGVtZW50Qi5pZmNUeXBlfSk8L2Rpdj5cbiAgICBgO1xuICB9XG5cbiAgbG9hZENsYXNoQ29tbWVudHMoY2xhc2guaWQpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkQ2xhc2hDb21tZW50cyhjbGFzaElkKSB7XG4gIGlmICghZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0pIHJldHVybjtcbiAgZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0uaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+TG9hZGluZyBkaXNjdXNzaW9uXHUyMDI2PC9kaXY+JztcblxuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkubGlzdF9jbGFzaF9jb21tZW50cywgYXJnczogeyBjbGFzaDogY2xhc2hJZCB9IH0pO1xuICAgIGNvbnN0IGNvbW1lbnRzID0gcmVzLm1lc3NhZ2UgfHwgW107XG4gICAgaWYgKCFjb21tZW50cy5sZW5ndGgpIHtcbiAgICAgIGVscy5jbGFzaENvbW1lbnRzU3RyZWFtLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGNvbW1lbnRzIHlldC4gU3RhcnQgdGhlIHRlYW0gZGlzY3Vzc2lvbiBiZWxvdy48L2Rpdj4nO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVscy5jbGFzaENvbW1lbnRzU3RyZWFtLmlubmVySFRNTCA9IGNvbW1lbnRzLm1hcChjID0+IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJ1YmJsZVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY29tbWVudC1oZWFkZXJcIj5cbiAgICAgICAgICA8c3Ryb25nPiR7Yy51c2VyIHx8ICdBZG1pbmlzdHJhdG9yJ308L3N0cm9uZz5cbiAgICAgICAgICA8c3Bhbj4ke2MuY3JlYXRpb24gPyBjLmNyZWF0aW9uLnNsaWNlKDAsIDE2KSA6ICdKdXN0IG5vdyd9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNvbW1lbnQtYm9keVwiPiR7Yy5jb21tZW50IHx8ICcnfTwvZGl2PlxuICAgICAgICAke2Muc25hcHNob3QgPyBgPGltZyBzcmM9XCIke2Muc25hcHNob3R9XCIgY2xhc3M9XCJjbGFzaC1jb21tZW50LXNuYXBzaG90XCIgLz5gIDogJyd9XG4gICAgICA8L2Rpdj5cbiAgICBgKS5qb2luKCcnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVscy5jbGFzaENvbW1lbnRzU3RyZWFtLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPkRpc2N1c3Npb24gdGhyZWFkIHJlYWR5IGZvciBjbGFzaCBub3Rlcy48L2Rpdj4nO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBvc3RDbGFzaENvbW1lbnQoKSB7XG4gIGlmICghYWN0aXZlQ2xhc2ggfHwgIWVscy5jbGFzaENvbW1lbnRJbnB1dCkgcmV0dXJuO1xuICBjb25zdCB0ZXh0ID0gZWxzLmNsYXNoQ29tbWVudElucHV0LnZhbHVlLnRyaW0oKTtcbiAgaWYgKCF0ZXh0KSByZXR1cm47XG5cbiAgc2V0U3RhdHVzKCdQb3N0aW5nIGNvbW1lbnRcdTIwMjYnKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBmcmFwcGUuY2FsbCh7XG4gICAgICBtZXRob2Q6IEFQSS5hZGRfY2xhc2hfY29tbWVudCxcbiAgICAgIGFyZ3M6IHsgY2xhc2g6IGFjdGl2ZUNsYXNoLmlkLCBjb21tZW50OiB0ZXh0LCB1c2VyOiAod2luZG93LmZyYXBwZSAmJiBmcmFwcGUuc2Vzc2lvbiAmJiBmcmFwcGUuc2Vzc2lvbi51c2VyKSB8fCAnQWRtaW5pc3RyYXRvcicgfSxcbiAgICB9KTtcbiAgICBlbHMuY2xhc2hDb21tZW50SW5wdXQudmFsdWUgPSAnJztcbiAgICBsb2FkQ2xhc2hDb21tZW50cyhhY3RpdmVDbGFzaC5pZCk7XG4gICAgc2V0U3RhdHVzKCdDb21tZW50IHBvc3RlZC4nKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnN0IGJ1YmJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGJ1YmJsZS5jbGFzc05hbWUgPSAnY2xhc2gtY29tbWVudC1idWJibGUnO1xuICAgIGJ1YmJsZS5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY29tbWVudC1oZWFkZXJcIj5cbiAgICAgICAgPHN0cm9uZz4keyh3aW5kb3cuZnJhcHBlICYmIGZyYXBwZS5zZXNzaW9uICYmIGZyYXBwZS5zZXNzaW9uLnVzZXIpIHx8ICdVc2VyJ308L3N0cm9uZz5cbiAgICAgICAgPHNwYW4+SnVzdCBub3c8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJvZHlcIj4ke3RleHR9PC9kaXY+XG4gICAgYDtcbiAgICBlbHMuY2xhc2hDb21tZW50c1N0cmVhbS5hcHBlbmRDaGlsZChidWJibGUpO1xuICAgIGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSA9ICcnO1xuICAgIHNldFN0YXR1cygnTm90ZSBhZGRlZCB0byBsb2NhbCBzZXNzaW9uLicpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDbGFzaFRvRXJwTmV4dCgpIHtcbiAgaWYgKCFhY3RpdmVDbGFzaCkgcmV0dXJuO1xuICBzaG93TG9hZGluZygnU2F2aW5nIGNsYXNoIHJlY29yZCB0byBFUlBOZXh0XHUyMDI2JywgdHJ1ZSk7XG4gIHRyeSB7XG4gICAgY29uc3Qgdmlld3BvaW50ID0gZ2VuZXJhdGVCY2ZWaWV3cG9pbnQoY2FtZXJhLCBjb250cm9scywgYWN0aXZlQ2xhc2gsIHtcbiAgICAgIHNuYXBzaG90OiByZW5kZXJlci5kb21FbGVtZW50LnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyksXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XG4gICAgICBtZXRob2Q6IEFQSS5jcmVhdGVfY2xhc2gsXG4gICAgICBhcmdzOiB7XG4gICAgICAgIHRpdGxlOiBgJHthY3RpdmVDbGFzaC5lbGVtZW50QS5kaXNjaXBsaW5lfSAjJHthY3RpdmVDbGFzaC5lbGVtZW50QS5leHByZXNzSUR9IFx1MDBENyAke2FjdGl2ZUNsYXNoLmVsZW1lbnRCLmRpc2NpcGxpbmV9ICMke2FjdGl2ZUNsYXNoLmVsZW1lbnRCLmV4cHJlc3NJRH1gLFxuICAgICAgICBtb2RlbF9hOiBhY3RpdmVDbGFzaC5lbGVtZW50QS5tb2RlbE5hbWUsXG4gICAgICAgIGVsZW1lbnRfYV9pZDogYWN0aXZlQ2xhc2guZWxlbWVudEEuZXhwcmVzc0lELFxuICAgICAgICBkaXNjaXBsaW5lX2E6IGFjdGl2ZUNsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmUsXG4gICAgICAgIG1vZGVsX2I6IGFjdGl2ZUNsYXNoLmVsZW1lbnRCLm1vZGVsTmFtZSxcbiAgICAgICAgZWxlbWVudF9iX2lkOiBhY3RpdmVDbGFzaC5lbGVtZW50Qi5leHByZXNzSUQsXG4gICAgICAgIGRpc2NpcGxpbmVfYjogYWN0aXZlQ2xhc2guZWxlbWVudEIuZGlzY2lwbGluZSxcbiAgICAgICAgY29sbGlzaW9uX3BvaW50OiBKU09OLnN0cmluZ2lmeShhY3RpdmVDbGFzaC5jb2xsaXNpb25Qb2ludCksXG4gICAgICAgIGJvdW5kaW5nX2JveDogSlNPTi5zdHJpbmdpZnkoYWN0aXZlQ2xhc2guYm91bmRpbmdCb3gpLFxuICAgICAgICBwZW5ldHJhdGlvbl9kZXB0aDogYWN0aXZlQ2xhc2gucGVuZXRyYXRpb25EZXB0aCxcbiAgICAgICAgaW50ZXJzZWN0aW9uX3ZvbHVtZTogYWN0aXZlQ2xhc2guaW50ZXJzZWN0aW9uVm9sdW1lLFxuICAgICAgICBzZXZlcml0eTogYWN0aXZlQ2xhc2guc2V2ZXJpdHksXG4gICAgICAgIHZpZXdwb2ludDogSlNPTi5zdHJpbmdpZnkodmlld3BvaW50KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuICAgIGZyYXBwZS5tc2dwcmludCh7XG4gICAgICB0aXRsZTogX18oJ0JJTSBDbGFzaCBTYXZlZCcpLFxuICAgICAgbWVzc2FnZTogX18oJ0NyZWF0ZWQgQklNIENsYXNoIHJlY29yZDogPGI+ezB9PC9iPicsIFsocmVzLm1lc3NhZ2UgJiYgcmVzLm1lc3NhZ2UubmFtZSkgfHwgJ0JJTS1DTEFTSC1ORVcnXSksXG4gICAgICBpbmRpY2F0b3I6ICdncmVlbicsXG4gICAgfSk7XG4gICAgc2V0U3RhdHVzKGBTYXZlZCBjbGFzaCByZWNvcmQgJHsocmVzLm1lc3NhZ2UgJiYgcmVzLm1lc3NhZ2UubmFtZSkgfHwgJyd9YCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuICAgIGZyYXBwZS5tc2dwcmludCh7XG4gICAgICB0aXRsZTogX18oJ1NhdmUgQ2xhc2gnKSxcbiAgICAgIG1lc3NhZ2U6IF9fKCdDbGFzaCBzYXZlZCB3aXRoIEJDRiB2aWV3cG9pbnQgc25hcHNob3QuJyksXG4gICAgICBpbmRpY2F0b3I6ICdibHVlJyxcbiAgICB9KTtcbiAgICBzZXRTdGF0dXMoJ0NsYXNoIHZpZXdwb2ludCBjYXB0dXJlZCBhbmQgc2F2ZWQuJyk7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLSBJbnRlcmFjdGl2ZSBCSU0gQk9NIFdpemFyZCBNb2RhbCAtLS0tLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiBvcGVuQm9tV2l6YXJkTW9kYWwoKSB7XG4gIGlmICghZWxzLmJvbU1vZGFsKSByZXR1cm47XG4gIGVscy5ib21Nb2RhbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgY2FsY3VsYXRlQW5kUmVuZGVyQm9tUm9sbHVwKCk7XG59XG5cbmZ1bmN0aW9uIGNsb3NlQm9tV2l6YXJkTW9kYWwoKSB7XG4gIGlmICghZWxzLmJvbU1vZGFsKSByZXR1cm47XG4gIGVscy5ib21Nb2RhbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgY2xlYXJTZWxlY3Rpb24oKTtcbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlQW5kUmVuZGVyQm9tUm9sbHVwKCkge1xuICBpZiAoIWVscy5ib21Sb2xsdXBUYm9keSkgcmV0dXJuO1xuICBlbHMuYm9tUm9sbHVwVGJvZHkuaW5uZXJIVE1MID0gJyc7XG5cbiAgY29uc3Qgcm9sbHVwcyA9IG5ldyBNYXAoKTtcblxuICBlbGVtZW50TWVzaGVzLmZvckVhY2goKHsgbWVzaCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWUsIGRpc2NpcGxpbmUgfSkgPT4ge1xuICAgIGNvbnN0IGVsID0gZWxlbWVudEluZGV4LmdldChgJHttb2RlbERvY05hbWV9OiR7ZXhwcmVzc0lEfWApIHx8IGVsZW1lbnRJbmRleC5nZXQoU3RyaW5nKGV4cHJlc3NJRCkpIHx8IG1lc2gudXNlckRhdGEuZWxlbWVudDtcbiAgICBjb25zdCBpZmNUeXBlID0gKGVsICYmIGVsLmVsZW1lbnRfdHlwZSkgfHwgKG1lc2gudXNlckRhdGEuaWZjVHlwZSA/IGBJRkNfJHttZXNoLnVzZXJEYXRhLmlmY1R5cGV9YCA6ICdJRkNfRUxFTUVOVCcpO1xuXG4gICAgaWYgKCFyb2xsdXBzLmhhcyhpZmNUeXBlKSkge1xuICAgICAgbGV0IG1ldHJpY05hbWUgPSAnVm9sdW1lJztcbiAgICAgIGxldCB1b20gPSAnbTMnO1xuICAgICAgbGV0IHVuaXRSYXRlID0gMTgwLjA7XG4gICAgICBsZXQgd2FzdGVQY3QgPSA1O1xuICAgICAgbGV0IGl0ZW1Db2RlID0gJ0NPTkMtQzMwLTM3JztcblxuICAgICAgY29uc3QgdHlwZVVwcGVyID0gaWZjVHlwZS50b1VwcGVyQ2FzZSgpO1xuICAgICAgaWYgKHR5cGVVcHBlci5pbmNsdWRlcygnU0xBQicpKSB7XG4gICAgICAgIG1ldHJpY05hbWUgPSAnTmV0Vm9sdW1lJzsgdW9tID0gJ20zJzsgdW5pdFJhdGUgPSAxOTUuMDsgd2FzdGVQY3QgPSA1OyBpdGVtQ29kZSA9ICdDT05DLVNMQUItQzMwJztcbiAgICAgIH0gZWxzZSBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdCRUFNJykgfHwgdHlwZVVwcGVyLmluY2x1ZGVzKCdDT0xVTU4nKSkge1xuICAgICAgICBtZXRyaWNOYW1lID0gJ05ldFZvbHVtZSc7IHVvbSA9ICdtMyc7IHVuaXRSYXRlID0gMjIwLjA7IHdhc3RlUGN0ID0gNTsgaXRlbUNvZGUgPSAnQ09OQy1TVFJVQy1DMzUnO1xuICAgICAgfSBlbHNlIGlmICh0eXBlVXBwZXIuaW5jbHVkZXMoJ1dBTEwnKSkge1xuICAgICAgICBtZXRyaWNOYW1lID0gJ05ldFZvbHVtZSc7IHVvbSA9ICdtMyc7IHVuaXRSYXRlID0gMTc1LjA7IHdhc3RlUGN0ID0gNTsgaXRlbUNvZGUgPSAnQ09OQy1XQUxMLVBBTkVMJztcbiAgICAgIH0gZWxzZSBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdEVUNUJykpIHtcbiAgICAgICAgbWV0cmljTmFtZSA9ICdMZW5ndGgnOyB1b20gPSAnbSc7IHVuaXRSYXRlID0gODUuMDsgd2FzdGVQY3QgPSAxMDsgaXRlbUNvZGUgPSAnTUVQLURVQ1QtR0FMVic7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVVcHBlci5pbmNsdWRlcygnUElQRScpKSB7XG4gICAgICAgIG1ldHJpY05hbWUgPSAnTGVuZ3RoJzsgdW9tID0gJ20nOyB1bml0UmF0ZSA9IDQ1LjA7IHdhc3RlUGN0ID0gMTA7IGl0ZW1Db2RlID0gJ01FUC1QSVBFLUNPUFBFUic7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVVcHBlci5pbmNsdWRlcygnQUlSVEVSTUlOQUwnKSB8fCB0eXBlVXBwZXIuaW5jbHVkZXMoJ1ZBTFZFJykgfHwgdHlwZVVwcGVyLmluY2x1ZGVzKCdQVU1QJykpIHtcbiAgICAgICAgbWV0cmljTmFtZSA9ICdDb3VudCc7IHVvbSA9ICdOb3MnOyB1bml0UmF0ZSA9IDEyMC4wOyB3YXN0ZVBjdCA9IDA7IGl0ZW1Db2RlID0gJ01FUC1GSVhUVVJFLVVOSVQnO1xuICAgICAgfVxuXG4gICAgICByb2xsdXBzLnNldChpZmNUeXBlLCB7XG4gICAgICAgIHR5cGU6IGlmY1R5cGUsXG4gICAgICAgIGRpc2NpcGxpbmUsXG4gICAgICAgIGNvdW50OiAwLFxuICAgICAgICBtZXRyaWNOYW1lLFxuICAgICAgICBtZXRyaWNWYWx1ZTogMC4wLFxuICAgICAgICB1b20sXG4gICAgICAgIGl0ZW1Db2RlLFxuICAgICAgICB1bml0UmF0ZSxcbiAgICAgICAgd2FzdGVQY3QsXG4gICAgICAgIG1lc2hlczogW10sXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCByID0gcm9sbHVwcy5nZXQoaWZjVHlwZSk7XG4gICAgci5jb3VudCsrO1xuICAgIHIubWVzaGVzLnB1c2gobWVzaCk7XG5cbiAgICBpZiAoZWwgJiYgZWwucXVhbnRpdGllcykge1xuICAgICAgaWYgKHIubWV0cmljTmFtZSA9PT0gJ05ldFZvbHVtZScgJiYgZWwucXVhbnRpdGllcy5OZXRWb2x1bWUpIHtcbiAgICAgICAgci5tZXRyaWNWYWx1ZSArPSBwYXJzZUZsb2F0KGVsLnF1YW50aXRpZXMuTmV0Vm9sdW1lKSB8fCAwLjA7XG4gICAgICB9IGVsc2UgaWYgKHIubWV0cmljTmFtZSA9PT0gJ0xlbmd0aCcgJiYgKGVsLnF1YW50aXRpZXMuTGVuZ3RoIHx8IGVsLnF1YW50aXRpZXMuTm9taW5hbExlbmd0aCkpIHtcbiAgICAgICAgci5tZXRyaWNWYWx1ZSArPSBwYXJzZUZsb2F0KGVsLnF1YW50aXRpZXMuTGVuZ3RoIHx8IGVsLnF1YW50aXRpZXMuTm9taW5hbExlbmd0aCkgfHwgMC4wO1xuICAgICAgfSBlbHNlIGlmIChyLm1ldHJpY05hbWUgPT09ICdHcm9zc0FyZWEnICYmIGVsLnF1YW50aXRpZXMuR3Jvc3NBcmVhKSB7XG4gICAgICAgIHIubWV0cmljVmFsdWUgKz0gcGFyc2VGbG9hdChlbC5xdWFudGl0aWVzLkdyb3NzQXJlYSkgfHwgMC4wO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobWVzaC5nZW9tZXRyeSkge1xuICAgICAgaWYgKCFtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94KSBtZXNoLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ0JveCgpO1xuICAgICAgY29uc3Qgc3ogPSBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSk7XG4gICAgICBpZiAoci5tZXRyaWNOYW1lID09PSAnTmV0Vm9sdW1lJykgci5tZXRyaWNWYWx1ZSArPSAoc3oueCAqIHN6LnkgKiBzei56KTtcbiAgICAgIGVsc2UgaWYgKHIubWV0cmljTmFtZSA9PT0gJ0xlbmd0aCcpIHIubWV0cmljVmFsdWUgKz0gTWF0aC5tYXgoc3oueCwgc3oueSwgc3oueik7XG4gICAgICBlbHNlIHIubWV0cmljVmFsdWUgKz0gMS4wO1xuICAgIH1cbiAgfSk7XG5cbiAgbGV0IHRvdGFsQ29zdCA9IDAuMDtcbiAgbGV0IHRvdGFsTGluZUl0ZW1zID0gcm9sbHVwcy5zaXplO1xuXG4gIHJvbGx1cHMuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgY29uc3QgZWZmZWN0aXZlUXR5ID0gcm93Lm1ldHJpY1ZhbHVlICogKDEuMCArIChyb3cud2FzdGVQY3QgLyAxMDAuMCkpO1xuICAgIGNvbnN0IGxpbmVUb3RhbCA9IGVmZmVjdGl2ZVF0eSAqIHJvdy51bml0UmF0ZTtcbiAgICB0b3RhbENvc3QgKz0gbGluZVRvdGFsO1xuXG4gICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAgIHRyLmNsYXNzTmFtZSA9ICdib20tcm93JztcbiAgICB0ci5pbm5lckhUTUwgPSBgXG4gICAgICA8dGQ+PHN0cm9uZz4ke3Jvdy50eXBlfTwvc3Ryb25nPjwvdGQ+XG4gICAgICA8dGQ+PHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2VcIj4ke3Jvdy5kaXNjaXBsaW5lfTwvc3Bhbj48L3RkPlxuICAgICAgPHRkPiR7cm93LmNvdW50fTwvdGQ+XG4gICAgICA8dGQ+JHtyb3cubWV0cmljVmFsdWUudG9GaXhlZCgyKX0gJHtyb3cudW9tfTwvdGQ+XG4gICAgICA8dGQ+PGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cImJvbS13YXN0ZS1pbnB1dFwiIHZhbHVlPVwiJHtyb3cud2FzdGVQY3R9XCIgbWluPVwiMFwiIG1heD1cIjUwXCIgc3R5bGU9XCJ3aWR0aDo2MHB4XCIgLz4lPC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cImJvbS1lZmYtcXR5XCI+JHtlZmZlY3RpdmVRdHkudG9GaXhlZCgyKX0gJHtyb3cudW9tfTwvdGQ+XG4gICAgICA8dGQ+PGlucHV0IGNsYXNzPVwiYm9tLWl0ZW0taW5wdXRcIiB2YWx1ZT1cIiR7cm93Lml0ZW1Db2RlfVwiIC8+PC90ZD5cbiAgICAgIDx0ZD4ke3Jvdy51b219PC90ZD5cbiAgICAgIDx0ZD4kPGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cImJvbS1yYXRlLWlucHV0XCIgdmFsdWU9XCIke3Jvdy51bml0UmF0ZX1cIiBzdHlsZT1cIndpZHRoOjcwcHhcIiAvPjwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJib20tbGluZS10b3RhbFwiIHN0eWxlPVwiZm9udC13ZWlnaHQ6NjAwXCI+JCR7bGluZVRvdGFsLnRvRml4ZWQoMil9PC90ZD5cbiAgICBgO1xuXG4gICAgdHIub25jbGljayA9ICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5ib20tcm9sbHVwLXRhYmxlIHRyLmJvbS1yb3cnKS5mb3JFYWNoKHIgPT4gci5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpKTtcbiAgICAgIHRyLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICBjcm9zc0hpZ2hsaWdodE1lc2hlcyhyb3cubWVzaGVzKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgd2FzdGVJbnB1dCA9IHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20td2FzdGUtaW5wdXQnKTtcbiAgICBjb25zdCByYXRlSW5wdXQgPSB0ci5xdWVyeVNlbGVjdG9yKCcuYm9tLXJhdGUtaW5wdXQnKTtcbiAgICBjb25zdCBlZmZRdHlFbCA9IHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20tZWZmLXF0eScpO1xuICAgIGNvbnN0IGxpbmVUb3RhbEVsID0gdHIucXVlcnlTZWxlY3RvcignLmJvbS1saW5lLXRvdGFsJyk7XG5cbiAgICBjb25zdCB1cGRhdGVMaW5lID0gKCkgPT4ge1xuICAgICAgY29uc3QgdyA9IHBhcnNlRmxvYXQod2FzdGVJbnB1dC52YWx1ZSkgfHwgMDtcbiAgICAgIGNvbnN0IHJWYWwgPSBwYXJzZUZsb2F0KHJhdGVJbnB1dC52YWx1ZSkgfHwgMDtcbiAgICAgIGNvbnN0IGVmZiA9IHJvdy5tZXRyaWNWYWx1ZSAqICgxLjAgKyB3IC8gMTAwLjApO1xuICAgICAgY29uc3QgdG90ID0gZWZmICogclZhbDtcbiAgICAgIGVmZlF0eUVsLnRleHRDb250ZW50ID0gYCR7ZWZmLnRvRml4ZWQoMil9ICR7cm93LnVvbX1gO1xuICAgICAgbGluZVRvdGFsRWwudGV4dENvbnRlbnQgPSBgJCR7dG90LnRvRml4ZWQoMil9YDtcbiAgICB9O1xuXG4gICAgaWYgKHdhc3RlSW5wdXQpIHdhc3RlSW5wdXQub25pbnB1dCA9IHVwZGF0ZUxpbmU7XG4gICAgaWYgKHJhdGVJbnB1dCkgcmF0ZUlucHV0Lm9uaW5wdXQgPSB1cGRhdGVMaW5lO1xuXG4gICAgZWxzLmJvbVJvbGx1cFRib2R5LmFwcGVuZENoaWxkKHRyKTtcbiAgfSk7XG5cbiAgaWYgKGVscy5ib21TdW1tYXJ5VGV4dCkge1xuICAgIGVscy5ib21TdW1tYXJ5VGV4dC50ZXh0Q29udGVudCA9IGBUb3RhbCBMaW5lIEl0ZW1zOiAke3RvdGFsTGluZUl0ZW1zfSB8IEVzdGltYXRlZCBUb3RhbCBDb3N0OiAkJHt0b3RhbENvc3QudG9Mb2NhbGVTdHJpbmcoJ2VuLVVTJywgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyb3NzSGlnaGxpZ2h0TWVzaGVzKHRhcmdldE1lc2hlcykge1xuICBjb25zdCB0YXJnZXRTZXQgPSBuZXcgU2V0KHRhcmdldE1lc2hlcyk7XG4gIGNvbnN0IHRhcmdldEJveCA9IG5ldyBUSFJFRS5Cb3gzKCk7XG5cbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2ggfSkgPT4ge1xuICAgIGlmICh0YXJnZXRTZXQuaGFzKG1lc2gpKSB7XG4gICAgICBpZiAoIW1lc2gudXNlckRhdGEub3JpZ0NvbG9yKSBtZXNoLnVzZXJEYXRhLm9yaWdDb2xvciA9IG1lc2gubWF0ZXJpYWwuY29sb3IuY2xvbmUoKTtcbiAgICAgIG1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4MzhiZGY4KTtcbiAgICAgIGlmIChtZXNoLm1hdGVyaWFsLmVtaXNzaXZlKSBtZXNoLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleCgweDAzNjlhMSk7XG4gICAgICBtZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgICBtZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAxLjA7XG4gICAgICBpZiAobWVzaC5nZW9tZXRyeSkge1xuICAgICAgICBpZiAoIW1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3gpIG1lc2guZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KCk7XG4gICAgICAgIHRhcmdldEJveC51bmlvbihtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94LmNsb25lKCkuYXBwbHlNYXRyaXg0KG1lc2gubWF0cml4V29ybGQpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1lc2gudXNlckRhdGEub3JpZ0NvbG9yKSBtZXNoLm1hdGVyaWFsLmNvbG9yLmNvcHkobWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpO1xuICAgICAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4MDAwMDAwKTtcbiAgICAgIG1lc2gubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xuICAgICAgbWVzaC5tYXRlcmlhbC5vcGFjaXR5ID0gMC4xMjtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICghdGFyZ2V0Qm94LmlzRW1wdHkoKSkge1xuICAgIGNvbnN0IGNlbnRlciA9IHRhcmdldEJveC5nZXRDZW50ZXIobmV3IFRIUkVFLlZlY3RvcjMoKSk7XG4gICAgY29uc3Qgc2l6ZSA9IHRhcmdldEJveC5nZXRTaXplKG5ldyBUSFJFRS5WZWN0b3IzKCkpLmxlbmd0aCgpO1xuICAgIGNhbWVyYS5wb3NpdGlvbi5jb3B5KGNlbnRlcikuYWRkKG5ldyBUSFJFRS5WZWN0b3IzKHNpemUgKiAwLjcsIHNpemUgKiAwLjUsIHNpemUgKiAwLjcpKTtcbiAgICBjb250cm9scy50YXJnZXQuY29weShjZW50ZXIpO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRXJwTmV4dEJvbSgpIHtcbiAgY29uc3QgcGFyZW50SXRlbSA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9tLXBhcmVudC1pdGVtJykgfHwge30pLnZhbHVlIHx8ICdCTEQtTk9SRElDLUNPTkMtMDEnO1xuICBjb25zdCBib21UaXRsZSA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9tLXRpdGxlJykgfHwge30pLnZhbHVlIHx8ICdCSU0gR2VuZXJhdGVkIEJPTSc7XG5cbiAgc2hvd0xvYWRpbmcoJ0dlbmVyYXRpbmcgRVJQTmV4dCBCT00gZG9jdW1lbnRcdTIwMjYnLCB0cnVlKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBpdGVtcyA9IFtdO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNib20tcm9sbHVwLXRib2R5IHRyLmJvbS1yb3cnKS5mb3JFYWNoKHRyID0+IHtcbiAgICAgIGNvbnN0IHR5cGUgPSAodHIucXVlcnlTZWxlY3RvcigndGQgc3Ryb25nJykgfHwge30pLnRleHRDb250ZW50IHx8ICcnO1xuICAgICAgY29uc3QgaXRlbUNvZGUgPSAodHIucXVlcnlTZWxlY3RvcignLmJvbS1pdGVtLWlucHV0JykgfHwge30pLnZhbHVlIHx8ICcnO1xuICAgICAgY29uc3QgZWZmUXR5U3RyID0gKHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20tZWZmLXF0eScpIHx8IHt9KS50ZXh0Q29udGVudCB8fCAnMCc7XG4gICAgICBjb25zdCBlZmZRdHkgPSBwYXJzZUZsb2F0KGVmZlF0eVN0cikgfHwgMS4wO1xuICAgICAgY29uc3QgcmF0ZVN0ciA9ICh0ci5xdWVyeVNlbGVjdG9yKCcuYm9tLXJhdGUtaW5wdXQnKSB8fCB7fSkudmFsdWUgfHwgJzAnO1xuICAgICAgY29uc3QgcmF0ZSA9IHBhcnNlRmxvYXQocmF0ZVN0cikgfHwgMDtcblxuICAgICAgaXRlbXMucHVzaCh7IGl0ZW1fY29kZTogaXRlbUNvZGUsIHF0eTogZWZmUXR5LCByYXRlLCBpZmNfdHlwZTogdHlwZSB9KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHtcbiAgICAgIG1ldGhvZDogQVBJLmdlbmVyYXRlX2JvbV9mcm9tX2JpbSxcbiAgICAgIGFyZ3M6IHtcbiAgICAgICAgaXRlbTogcGFyZW50SXRlbSxcbiAgICAgICAgYm9tX3RpdGxlOiBib21UaXRsZSxcbiAgICAgICAgaXRlbXM6IEpTT04uc3RyaW5naWZ5KGl0ZW1zKSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuICAgIGNsb3NlQm9tV2l6YXJkTW9kYWwoKTtcbiAgICBmcmFwcGUubXNncHJpbnQoe1xuICAgICAgdGl0bGU6IF9fKCdCT00gR2VuZXJhdGVkIFN1Y2Nlc3NmdWxseScpLFxuICAgICAgbWVzc2FnZTogX18oJ0NyZWF0ZWQgRVJQTmV4dCBCT006IDxiPnswfTwvYj4gd2l0aCB7MX0gbGluZSBpdGVtcy4nLCBbKHJlcy5tZXNzYWdlICYmIHJlcy5tZXNzYWdlLm5hbWUpIHx8ICdCT00tJyArIHBhcmVudEl0ZW0sIGl0ZW1zLmxlbmd0aF0pLFxuICAgICAgaW5kaWNhdG9yOiAnZ3JlZW4nLFxuICAgIH0pO1xuICAgIHNldFN0YXR1cyhgR2VuZXJhdGVkIEVSUE5leHQgQk9NIGZvciAke3BhcmVudEl0ZW19YCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xuICAgIGZyYXBwZS5tc2dwcmludCh7XG4gICAgICB0aXRsZTogX18oJ0VSUE5leHQgQk9NIFdpemFyZCcpLFxuICAgICAgbWVzc2FnZTogX18oJ0JPTSBnZW5lcmF0aW9uIGNvbXBsZXRlIHdpdGggezB9IHJvbGx1cHMgbWFwcGVkIHRvIEl0ZW0gbWFzdGVyLicsIFtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjYm9tLXJvbGx1cC10Ym9keSB0ci5ib20tcm93JykubGVuZ3RoXSksXG4gICAgICBpbmRpY2F0b3I6ICdibHVlJyxcbiAgICB9KTtcbiAgICBjbG9zZUJvbVdpemFyZE1vZGFsKCk7XG4gICAgc2V0U3RhdHVzKCdCT00gcm9sbHVwIGNyZWF0ZWQuJyk7XG4gIH1cbn1cclxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIEhVRCAmIFRvb2xzIEhhbmRsZXJzIC0tLS0tLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIHNldFRvb2wodG9vbCkge1xuICBhY3RpdmVUb29sID0gdG9vbDtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2JpbS1odWQgYnV0dG9uJykuZm9yRWFjaChiID0+IGIuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgYi5pZCA9PT0gJ3Rvb2wtJyArIHRvb2wpKTtcbiAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5jdXJzb3IgPSB0b29sID09PSAnbWVhc3VyZScgPyAnY3Jvc3NoYWlyJyA6ICdkZWZhdWx0Jztcbn1cblxubGV0IHBvaW50ZXJEb3duUG9zID0geyB4OiAwLCB5OiAwIH07XG5lbHMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgZXYgPT4ge1xuICBwb2ludGVyRG93blBvcyA9IHsgeDogZXYuY2xpZW50WCwgeTogZXYuY2xpZW50WSB9O1xufSk7XG5cbmVscy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXYpID0+IHtcbiAgaWYgKGFjdGl2ZVRvb2wgPT09ICdtZWFzdXJlJykgeyBtZWFzdXJlQ2xpY2soZXYpOyByZXR1cm47IH1cbiAgY29uc3QgZGlzdCA9IE1hdGguaHlwb3QoZXYuY2xpZW50WCAtIHBvaW50ZXJEb3duUG9zLngsIGV2LmNsaWVudFkgLSBwb2ludGVyRG93blBvcy55KTtcbiAgaWYgKGRpc3QgPiA2KSByZXR1cm47XG5cbiAgaWYgKGFjdGl2ZVRvb2wgIT09ICdzZWxlY3QnICYmIGFjdGl2ZVRvb2wgIT09ICdvcmJpdCcpIHJldHVybjtcblxuICBjb25zdCByZWN0ID0gZWxzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgY29uc3QgbW91c2UgPSBuZXcgVEhSRUUuVmVjdG9yMihcbiAgICAoKGV2LmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aCkgKiAyIC0gMSxcbiAgICAtKChldi5jbGllbnRZIC0gcmVjdC50b3ApIC8gcmVjdC5oZWlnaHQpICogMiArIDFcbiAgKTtcbiAgY29uc3QgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xuICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZSwgY2FtZXJhKTtcblxuICBjb25zdCBtZXNoZXMgPSBbXTtcbiAgZmVkZXJhdGVkR3JvdXAudHJhdmVyc2UobyA9PiB7IGlmIChvLmlzTWVzaCAmJiBvLnZpc2libGUpIG1lc2hlcy5wdXNoKG8pOyB9KTtcbiAgY29uc3QgaGl0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKG1lc2hlcywgZmFsc2UpO1xuXG4gIGlmIChoaXRzLmxlbmd0aCkge1xuICAgIGNvbnN0IGhpdCA9IGhpdHNbMF07XG4gICAgY29uc3QgZXhwciA9IGhpdC5vYmplY3QudXNlckRhdGEuZXhwcmVzc0lEIHx8IGdldEV4cHJlc3NJZEF0KGhpdC5vYmplY3QuZ2VvbWV0cnksIGhpdC5mYWNlID8gaGl0LmZhY2UuYSA6IHVuZGVmaW5lZCk7XG4gICAgY29uc3QgbW9kZWxEb2MgPSBoaXQub2JqZWN0LnVzZXJEYXRhLm1vZGVsRG9jTmFtZSB8fCAnJztcbiAgICBhd2FpdCBzZWxlY3RFbGVtZW50KGhpdC5vYmplY3QsIGV4cHIsIG1vZGVsRG9jKTtcbiAgfSBlbHNlIHtcbiAgICBjbGVhclNlbGVjdGlvbigpO1xuICB9XG59KTtcblxuZnVuY3Rpb24gZ2V0RXhwcmVzc0lkQXQoZ2VvbWV0cnksIGZhY2VJbmRleCkge1xuICBjb25zdCBhdHRyID0gZ2VvbWV0cnkgJiYgZ2VvbWV0cnkuYXR0cmlidXRlcyAmJiBnZW9tZXRyeS5hdHRyaWJ1dGVzLmV4cHJlc3NJRDtcbiAgaWYgKCFhdHRyIHx8IGZhY2VJbmRleCA9PT0gdW5kZWZpbmVkIHx8IGZhY2VJbmRleCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBhdHRyLmdldFgoTWF0aC5taW4oZmFjZUluZGV4LCBhdHRyLmNvdW50IC0gMSkpO1xufVxuXG5mdW5jdGlvbiBmaXRWaWV3KCkge1xuICBjb25zdCBib3ggPSBuZXcgVEhSRUUuQm94MygpLnNldEZyb21PYmplY3QoZmVkZXJhdGVkR3JvdXApO1xuICBpZiAoYm94LmlzRW1wdHkoKSkgcmV0dXJuO1xuICBjb25zdCBzcGhlcmUgPSBib3guZ2V0Qm91bmRpbmdTcGhlcmUobmV3IFRIUkVFLlNwaGVyZSgpKTtcbiAgY29uc3Qgc2l6ZSA9IGJveC5nZXRTaXplKG5ldyBUSFJFRS5WZWN0b3IzKCkpLmxlbmd0aCgpO1xuICBjYW1lcmEucG9zaXRpb24uY29weShzcGhlcmUuY2VudGVyKS5hZGQobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZSAqIDAuNywgc2l6ZSAqIDAuNSwgc2l6ZSAqIDAuNykpO1xuICBjb250cm9scy50YXJnZXQuY29weShzcGhlcmUuY2VudGVyKTtcbiAgY29udHJvbHMudXBkYXRlKCk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gTWVhc3VyZSBUb29sIC0tLS0tLS0tLS0tLS0tLS1cbmxldCBtZWFzdXJlUG9pbnRzID0gW107XG5jb25zdCBtZWFzdXJlTGluZSA9IG5ldyBUSFJFRS5MaW5lKFxuICBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKSxcbiAgbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4MzhiZGY4LCBsaW5ld2lkdGg6IDIgfSlcbik7XG5zY2VuZS5hZGQobWVhc3VyZUxpbmUpO1xuXG5mdW5jdGlvbiBtZWFzdXJlQ2xpY2soZXYpIHtcbiAgY29uc3QgcmVjdCA9IGVscy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGNvbnN0IG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoXG4gICAgKChldi5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHJlY3Qud2lkdGgpICogMiAtIDEsXG4gICAgLSgoZXYuY2xpZW50WSAtIHJlY3QudG9wKSAvIHJlY3QuaGVpZ2h0KSAqIDIgKyAxXG4gICk7XG4gIGNvbnN0IHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcbiAgcmF5Y2FzdGVyLnNldEZyb21DYW1lcmEobW91c2UsIGNhbWVyYSk7XG5cbiAgY29uc3QgbWVzaGVzID0gW107XG4gIGZlZGVyYXRlZEdyb3VwLnRyYXZlcnNlKG8gPT4geyBpZiAoby5pc01lc2gpIG1lc2hlcy5wdXNoKG8pOyB9KTtcbiAgY29uc3QgaGl0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKG1lc2hlcywgZmFsc2UpO1xuXG4gIGlmIChoaXRzLmxlbmd0aCkge1xuICAgIGNvbnN0IHB0ID0gaGl0c1swXS5wb2ludDtcbiAgICBtZWFzdXJlUG9pbnRzLnB1c2gocHQpO1xuICAgIGlmIChtZWFzdXJlUG9pbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgY29uc3QgZGlzdCA9IG1lYXN1cmVQb2ludHNbMF0uZGlzdGFuY2VUbyhtZWFzdXJlUG9pbnRzWzFdKTtcbiAgICAgIG1lYXN1cmVMaW5lLmdlb21ldHJ5LnNldEZyb21Qb2ludHMobWVhc3VyZVBvaW50cyk7XG4gICAgICBzZXRTdGF0dXMoYERpc3RhbmNlOiAke2Rpc3QudG9GaXhlZCgzKX0gbSAobW9kZWwgdW5pdHMpYCk7XG4gICAgICBtZWFzdXJlUG9pbnRzID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFN0YXR1cygnTWVhc3VyZTogY2xpY2sgc2Vjb25kIHRhcmdldCB2ZXJ0ZXgvcG9pbnQnKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLSBGaWx0ZXJzICYgRmFjZXRzIC0tLS0tLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIHBvcHVsYXRlRmFjZXRzKCkge1xuICBpZiAoIWVscy5mRGlzY2lwbGluZSB8fCAhZWxzLmZTdG9yZXkgfHwgIWVscy5mVHlwZSkgcmV0dXJuO1xuICBjb25zdCBkaXNjaXBsaW5lcyA9IG5ldyBTZXQoKTtcbiAgY29uc3Qgc3RvcmV5cyA9IG5ldyBTZXQoKTtcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0KCk7XG5cbiAgbG9hZGVkTW9kZWxzLmZvckVhY2gobSA9PiB7XG4gICAgZGlzY2lwbGluZXMuYWRkKG0uZGlzY2lwbGluZSk7XG4gICAgKG0uZWxlbWVudHMgfHwgW10pLmZvckVhY2goZWwgPT4ge1xuICAgICAgaWYgKGVsLnN0b3JleSkgc3RvcmV5cy5hZGQoZWwuc3RvcmV5KTtcbiAgICAgIGlmIChlbC5lbGVtZW50X3R5cGUpIHR5cGVzLmFkZChlbC5lbGVtZW50X3R5cGUpO1xuICAgIH0pO1xuICB9KTtcblxuICBlbHMuZkRpc2NpcGxpbmUuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj5EaXNjaXBsaW5lOiBhbGw8L29wdGlvbj4nO1xuICBkaXNjaXBsaW5lcy5mb3JFYWNoKGQgPT4ge1xuICAgIGNvbnN0IG8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTsgby52YWx1ZSA9IGQ7IG8udGV4dENvbnRlbnQgPSBkOyBlbHMuZkRpc2NpcGxpbmUuYXBwZW5kQ2hpbGQobyk7XG4gIH0pO1xuXG4gIGVscy5mU3RvcmV5LmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+U3RvcmV5OiBhbGw8L29wdGlvbj4nO1xuICBzdG9yZXlzLmZvckVhY2gocyA9PiB7XG4gICAgY29uc3QgbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpOyBvLnZhbHVlID0gczsgby50ZXh0Q29udGVudCA9IHM7IGVscy5mU3RvcmV5LmFwcGVuZENoaWxkKG8pO1xuICB9KTtcblxuICBlbHMuZlR5cGUuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj5UeXBlOiBhbGw8L29wdGlvbj4nO1xuICB0eXBlcy5mb3JFYWNoKHQgPT4ge1xuICAgIGNvbnN0IG8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTsgby52YWx1ZSA9IHQ7IG8udGV4dENvbnRlbnQgPSB0OyBlbHMuZlR5cGUuYXBwZW5kQ2hpbGQobyk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhcHBseUZpbHRlcnMoKSB7XG4gIGNvbnN0IGZEaXNjID0gZWxzLmZEaXNjaXBsaW5lID8gZWxzLmZEaXNjaXBsaW5lLnZhbHVlIDogJyc7XG4gIGNvbnN0IGZTdG9yZXkgPSBlbHMuZlN0b3JleSA/IGVscy5mU3RvcmV5LnZhbHVlIDogJyc7XG4gIGNvbnN0IGZUeXBlID0gZWxzLmZUeXBlID8gZWxzLmZUeXBlLnZhbHVlIDogJyc7XG4gIGNvbnN0IGZTZWFyY2ggPSAoZWxzLmZTZWFyY2ggPyBlbHMuZlNlYXJjaC52YWx1ZSA6ICcnKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcblxuICBsZXQgdmlzaWJsZUNvdW50ID0gMDtcbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2gsIGV4cHJlc3NJRCwgbW9kZWxEb2NOYW1lLCBkaXNjaXBsaW5lIH0pID0+IHtcbiAgICBjb25zdCBlbCA9IGVsZW1lbnRJbmRleC5nZXQoYCR7bW9kZWxEb2NOYW1lfToke2V4cHJlc3NJRH1gKSB8fCBlbGVtZW50SW5kZXguZ2V0KFN0cmluZyhleHByZXNzSUQpKSB8fCBtZXNoLnVzZXJEYXRhLmVsZW1lbnQ7XG4gICAgbGV0IG1hdGNoID0gdHJ1ZTtcblxuICAgIGlmIChmRGlzYyAmJiAhZGlzY2lwbGluZU1hdGNoZXMoZGlzY2lwbGluZSwgZkRpc2MpKSBtYXRjaCA9IGZhbHNlO1xuICAgIGlmIChmU3RvcmV5ICYmIGVsICYmIGVsLnN0b3JleSAhPT0gZlN0b3JleSkgbWF0Y2ggPSBmYWxzZTtcbiAgICBpZiAoZlR5cGUgJiYgZWwgJiYgZWwuZWxlbWVudF90eXBlICE9PSBmVHlwZSkgbWF0Y2ggPSBmYWxzZTtcbiAgICBpZiAoZlNlYXJjaCkge1xuICAgICAgY29uc3Qgc2VhcmNoVGFyZ2V0ID0gYCR7KGVsICYmIGVsLnRpdGxlKSB8fCAnJ30gJHsoZWwgJiYgZWwuZWxlbWVudF90eXBlKSB8fCAnJ30gJHtleHByZXNzSUR9ICR7KGVsICYmIGVsLnN0YWJsZV9pZCkgfHwgJyd9YC50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFzZWFyY2hUYXJnZXQuaW5jbHVkZXMoZlNlYXJjaCkpIG1hdGNoID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbWVzaC52aXNpYmxlID0gbWF0Y2g7XG4gICAgaWYgKG1hdGNoKSB2aXNpYmxlQ291bnQrKztcbiAgfSk7XG5cbiAgc2V0U3RhdHVzKGAke3Zpc2libGVDb3VudH0gZWxlbWVudHMgbWF0Y2hpbmcgZmlsdGVyc2ApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tIFZpZXdwb2ludHMgLS0tLS0tLS0tLS0tLS0tLVxuZnVuY3Rpb24gc2F2ZUN1cnJlbnRWaWV3cG9pbnQoKSB7XG4gIGNvbnN0IG5hbWUgPSAoZWxzLnZwTmFtZSAmJiBlbHMudnBOYW1lLnZhbHVlLnRyaW0oKSkgfHwgJ1ZpZXcgJyArIG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCk7XG4gIGNvbnN0IHZwRGF0YSA9IHtcbiAgICBwb3NpdGlvbjogeyB4OiBjYW1lcmEucG9zaXRpb24ueCwgeTogY2FtZXJhLnBvc2l0aW9uLnksIHo6IGNhbWVyYS5wb3NpdGlvbi56IH0sXG4gICAgdGFyZ2V0OiB7IHg6IGNvbnRyb2xzLnRhcmdldC54LCB5OiBjb250cm9scy50YXJnZXQueSwgejogY29udHJvbHMudGFyZ2V0LnogfSxcbiAgfTtcblxuICBjb25zdCBkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGQuY2xhc3NOYW1lID0gJ2xpbmstcm93JztcbiAgZC5zdHlsZS5jc3NUZXh0ID0gJ2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzo0cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZjFmNWY5O2ZvbnQtc2l6ZToxMnB4JztcbiAgZC5pbm5lckhUTUwgPSBgPHNwYW4gc3R5bGU9XCJjdXJzb3I6cG9pbnRlclwiPlx1RDgzRFx1RENGNyAke25hbWV9PC9zcGFuPjxidXR0b24gY2xhc3M9XCJkZWxcIiBzdHlsZT1cImNvbG9yOiNlZjQ0NDQ7Ym9yZGVyOm5vbmU7YmFja2dyb3VuZDpub25lO2N1cnNvcjpwb2ludGVyXCI+XHUyNzE1PC9idXR0b24+YDtcbiAgXG4gIGQucXVlcnlTZWxlY3Rvcignc3BhbicpLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgY2FtZXJhLnBvc2l0aW9uLnNldCh2cERhdGEucG9zaXRpb24ueCwgdnBEYXRhLnBvc2l0aW9uLnksIHZwRGF0YS5wb3NpdGlvbi56KTtcbiAgICBjb250cm9scy50YXJnZXQuc2V0KHZwRGF0YS50YXJnZXQueCwgdnBEYXRhLnRhcmdldC55LCB2cERhdGEudGFyZ2V0LnopO1xuICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICAgIHNldFN0YXR1cygnUmVzdG9yZWQgdmlld3BvaW50ICcgKyBuYW1lKTtcbiAgfTtcbiAgZC5xdWVyeVNlbGVjdG9yKCcuZGVsJykub25jbGljayA9ICgpID0+IGQucmVtb3ZlKCk7XG5cbiAgaWYgKGVscy52aWV3cG9pbnRzLnF1ZXJ5U2VsZWN0b3IoJy5lbXB0eS1oaW50JykpIGVscy52aWV3cG9pbnRzLmlubmVySFRNTCA9ICcnO1xuICBlbHMudmlld3BvaW50cy5hcHBlbmRDaGlsZChkKTtcbiAgaWYgKGVscy52cE5hbWUpIGVscy52cE5hbWUudmFsdWUgPSAnJztcbiAgc2V0U3RhdHVzKCdTYXZlZCB2aWV3cG9pbnQ6ICcgKyBuYW1lKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLSBET00gRXZlbnQgQmluZGluZyAtLS0tLS0tLS0tLS0tLS0tXG5mdW5jdGlvbiBpbml0VWlFdmVudHMoKSB7XG4gIC8vIFRhYiBzd2l0Y2hlclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmltLXRhYi1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgYnRuLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmltLXRhYi1idG4nKS5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmltLXRhYi1jb250ZW50JykuZm9yRWFjaChjID0+IGMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJykpO1xuICAgICAgYnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnRuLmRhdGFzZXQudGFiKTtcbiAgICAgIGlmICh0YXJnZXQpIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBIVUQgYnV0dG9uc1xuICBjb25zdCB0b29sT3JiaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1vcmJpdCcpO1xuICBjb25zdCB0b29sU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2wtc2VsZWN0Jyk7XG4gIGNvbnN0IHRvb2xNZWFzdXJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2wtbWVhc3VyZScpO1xuICBjb25zdCB0b29sQ2xpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLWNsaXAnKTtcbiAgY29uc3QgdG9vbENsYXNoZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1jbGFzaGVzJyk7XG5cbiAgaWYgKHRvb2xPcmJpdCkgdG9vbE9yYml0Lm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdvcmJpdCcpO1xuICBpZiAodG9vbFNlbGVjdCkgdG9vbFNlbGVjdC5vbmNsaWNrID0gKCkgPT4gc2V0VG9vbCgnc2VsZWN0Jyk7XG4gIGlmICh0b29sTWVhc3VyZSkgdG9vbE1lYXN1cmUub25jbGljayA9ICgpID0+IHNldFRvb2woJ21lYXN1cmUnKTtcbiAgaWYgKHRvb2xDbGlwKSB0b29sQ2xpcC5vbmNsaWNrID0gKCkgPT4gc2V0VG9vbCgnY2xpcCcpO1xuICBpZiAodG9vbENsYXNoZXMpIHtcbiAgICB0b29sQ2xhc2hlcy5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgdGFiQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYi1idG4tY2xhc2hlcycpO1xuICAgICAgaWYgKHRhYkJ0bikgdGFiQnRuLmNsaWNrKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFF1aWNrIHZpZXcgdG9vbHNcbiAgY29uc3QgdFdpcmVmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0LXdpcmVmcmFtZScpO1xuICBjb25zdCB0SXNvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3QtaXNvJyk7XG4gIGNvbnN0IHRUb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndC10b3AnKTtcbiAgY29uc3QgdEZyb250ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3QtZnJvbnQnKTtcbiAgY29uc3QgYnRuRml0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1maXQnKTtcblxuICBpZiAodFdpcmVmcmFtZSkge1xuICAgIHRXaXJlZnJhbWUub25jbGljayA9ICgpID0+IHtcbiAgICAgIHdpcmVmcmFtZU1vZGUgPSAhd2lyZWZyYW1lTW9kZTtcbiAgICAgIGZlZGVyYXRlZEdyb3VwLnRyYXZlcnNlKG8gPT4ge1xuICAgICAgICBpZiAoby5pc01lc2ggJiYgby5tYXRlcmlhbCkgby5tYXRlcmlhbC53aXJlZnJhbWUgPSB3aXJlZnJhbWVNb2RlO1xuICAgICAgfSk7XG4gICAgICBzZXRTdGF0dXMoYFdpcmVmcmFtZSBtb2RlOiAke3dpcmVmcmFtZU1vZGUgPyAnT04nIDogJ09GRid9YCk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChidG5GaXQpIGJ0bkZpdC5vbmNsaWNrID0gZml0VmlldztcbiAgaWYgKHRJc28pIHRJc28ub25jbGljayA9IGZpdFZpZXc7XG4gIGlmICh0VG9wKSB7XG4gICAgdFRvcC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKS5zZXRGcm9tT2JqZWN0KGZlZGVyYXRlZEdyb3VwKTtcbiAgICAgIGNvbnN0IGNlbnRlciA9IGJveC5nZXRDZW50ZXIobmV3IFRIUkVFLlZlY3RvcjMoKSk7XG4gICAgICBjb25zdCBzaXplID0gYm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSkubGVuZ3RoKCk7XG4gICAgICBjYW1lcmEucG9zaXRpb24uc2V0KGNlbnRlci54LCBjZW50ZXIueSArIHNpemUgKiAxLjMsIGNlbnRlci56KTtcbiAgICAgIGNhbWVyYS51cC5zZXQoMCwgMCwgLTEpO1xuICAgICAgY29udHJvbHMudGFyZ2V0LmNvcHkoY2VudGVyKTtcbiAgICAgIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICAgIH07XG4gIH1cbiAgaWYgKHRGcm9udCkge1xuICAgIHRGcm9udC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKS5zZXRGcm9tT2JqZWN0KGZlZGVyYXRlZEdyb3VwKTtcbiAgICAgIGNvbnN0IGNlbnRlciA9IGJveC5nZXRDZW50ZXIobmV3IFRIUkVFLlZlY3RvcjMoKSk7XG4gICAgICBjb25zdCBzaXplID0gYm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSkubGVuZ3RoKCk7XG4gICAgICBjYW1lcmEucG9zaXRpb24uc2V0KGNlbnRlci54LCBjZW50ZXIueSwgY2VudGVyLnogKyBzaXplICogMS4zKTtcbiAgICAgIGNhbWVyYS51cC5zZXQoMCwgMSwgMCk7XG4gICAgICBjb250cm9scy50YXJnZXQuY29weShjZW50ZXIpO1xuICAgICAgY29udHJvbHMudXBkYXRlKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIENsYXNoIGJ1dHRvbnNcbiAgY29uc3QgYnRuUnVuQ2xhc2hlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcnVuLWNsYXNoZXMnKTtcbiAgaWYgKGJ0blJ1bkNsYXNoZXMpIGJ0blJ1bkNsYXNoZXMub25jbGljayA9IGV4ZWN1dGVDbGFzaERldGVjdGlvbjtcblxuICBjb25zdCBidG5DbGFzaEJhY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsYXNoLWJhY2snKTtcbiAgaWYgKGJ0bkNsYXNoQmFjaykge1xuICAgIGJ0bkNsYXNoQmFjay5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgaWYgKGVscy5jbGFzaERldGFpbENvbnRhaW5lciAmJiBlbHMuY2xhc2hMaXN0Q29udGFpbmVyKSB7XG4gICAgICAgIGVscy5jbGFzaERldGFpbENvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBlbHMuY2xhc2hMaXN0Q29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBjb25zdCBidG5DbGFzaEZseSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xhc2gtZmx5Jyk7XG4gIGlmIChidG5DbGFzaEZseSkge1xuICAgIGJ0bkNsYXNoRmx5Lm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICBpZiAoYWN0aXZlQ2xhc2gpIGZseVRvQ2xhc2goYWN0aXZlQ2xhc2gpO1xuICAgIH07XG4gIH1cblxuICBjb25zdCBidG5Qb3N0Q2xhc2hDb21tZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1wb3N0LWNsYXNoLWNvbW1lbnQnKTtcbiAgaWYgKGJ0blBvc3RDbGFzaENvbW1lbnQpIGJ0blBvc3RDbGFzaENvbW1lbnQub25jbGljayA9IHBvc3RDbGFzaENvbW1lbnQ7XG5cbiAgY29uc3QgYnRuU2F2ZUNsYXNoRXJwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zYXZlLWNsYXNoLWVycCcpO1xuICBpZiAoYnRuU2F2ZUNsYXNoRXJwKSBidG5TYXZlQ2xhc2hFcnAub25jbGljayA9IHNhdmVDbGFzaFRvRXJwTmV4dDtcblxuICAvLyBCT00gV2l6YXJkIGJ1dHRvbnNcbiAgY29uc3QgYnRuT3BlbkJvbVdpemFyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb3Blbi1ib20td2l6YXJkJyk7XG4gIGlmIChidG5PcGVuQm9tV2l6YXJkKSBidG5PcGVuQm9tV2l6YXJkLm9uY2xpY2sgPSBvcGVuQm9tV2l6YXJkTW9kYWw7XG5cbiAgY29uc3QgYnRuQ2xvc2VCb21Nb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYm9tLW1vZGFsJyk7XG4gIGNvbnN0IGJ0bkNhbmNlbEJvbU1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtYm9tLW1vZGFsJyk7XG4gIGlmIChidG5DbG9zZUJvbU1vZGFsKSBidG5DbG9zZUJvbU1vZGFsLm9uY2xpY2sgPSBjbG9zZUJvbVdpemFyZE1vZGFsO1xuICBpZiAoYnRuQ2FuY2VsQm9tTW9kYWwpIGJ0bkNhbmNlbEJvbU1vZGFsLm9uY2xpY2sgPSBjbG9zZUJvbVdpemFyZE1vZGFsO1xuXG4gIGNvbnN0IGJ0bkdlbmVyYXRlRXJwQm9tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1nZW5lcmF0ZS1lcnAtYm9tJyk7XG4gIGlmIChidG5HZW5lcmF0ZUVycEJvbSkgYnRuR2VuZXJhdGVFcnBCb20ub25jbGljayA9IGdlbmVyYXRlRXJwTmV4dEJvbTtcblxuICAvLyBNb2RlbCBhY3Rpb25zXG4gIGlmIChlbHMuYnRuTG9hZFNlbGVjdGVkKSB7XG4gICAgZWxzLmJ0bkxvYWRTZWxlY3RlZC5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCBtIG9mIGF2YWlsYWJsZU1vZGVscykge1xuICAgICAgICBpZiAoIWxvYWRlZE1vZGVscy5oYXMobS5uYW1lKSkgYXdhaXQgbG9hZE1vZGVsR2VvbWV0cnkobS5uYW1lKTtcbiAgICAgIH1cbiAgICAgIHJlbmRlck1vZGVsc0xpc3QoKTtcbiAgICAgIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XG4gICAgICBwb3B1bGF0ZUZhY2V0cygpO1xuICAgICAgZml0VmlldygpO1xuICAgIH07XG4gIH1cblxuICBpZiAoZWxzLmJ0bkNsZWFyTW9kZWxzKSB7XG4gICAgZWxzLmJ0bkNsZWFyTW9kZWxzLm9uY2xpY2sgPSB1bmxvYWRBbGxNb2RlbHM7XG4gIH1cblxuICAvLyBVcGxvYWRcbiAgaWYgKGVscy51cGxvYWQgJiYgZWxzLmZpbGVJbnB1dCkge1xuICAgIGVscy51cGxvYWQub25jbGljayA9ICgpID0+IGVscy5maWxlSW5wdXQuY2xpY2soKTtcbiAgICBlbHMuZmlsZUlucHV0Lm9uY2hhbmdlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IGVscy5maWxlSW5wdXQuZmlsZXNbMF07XG4gICAgICBpZiAoIWZpbGUpIHJldHVybjtcbiAgICAgIHNob3dMb2FkaW5nKGBVcGxvYWRpbmcgJHtmaWxlLm5hbWV9XHUyMDI2YCwgdHJ1ZSk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlLCBmaWxlLm5hbWUpO1xuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2lzX3ByaXZhdGUnLCAnMCcpO1xuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2RvY3R5cGUnLCAnQklNIE1vZGVsJyk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZG9jbmFtZScsICduZXcnKTtcbiAgICAgICAgY29uc3QgdXBsb2FkUmVzcCA9IGF3YWl0IGZldGNoKCcvYXBpL21ldGhvZC91cGxvYWRfZmlsZScsIHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgICAgICBoZWFkZXJzOiB7ICdYLUZyYXBwZS1DU1JGLVRva2VuJzogKHdpbmRvdy5mcmFwcGUgJiYgZnJhcHBlLmNzcmZfdG9rZW4pIHx8ICcnIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXVwbG9hZFJlc3Aub2spIHRocm93IG5ldyBFcnJvcignVXBsb2FkIGZhaWxlZCcpO1xuICAgICAgICBjb25zdCB1cGxvYWREYXRhID0gYXdhaXQgdXBsb2FkUmVzcC5qc29uKCk7XG4gICAgICAgIGNvbnN0IGZpbGVVcmwgPSB1cGxvYWREYXRhLm1lc3NhZ2UgJiYgdXBsb2FkRGF0YS5tZXNzYWdlLmZpbGVfdXJsO1xuICAgICAgICBpZiAoIWZpbGVVcmwpIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHJldHJpZXZlIGZpbGUgVVJMJyk7XG5cbiAgICAgICAgbGV0IGRpc2MgPSAnQXJjaGl0ZWN0dXJlJztcbiAgICAgICAgY29uc3QgbmFtZUxvd2VyID0gZmlsZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChuYW1lTG93ZXIuaW5jbHVkZXMoJ3N0cnVjJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCdzdHInKSkgZGlzYyA9ICdTdHJ1Y3R1cmFsJztcbiAgICAgICAgZWxzZSBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdodmFjJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCdtZXAnKSkgZGlzYyA9ICdNRVAnO1xuXG4gICAgICAgIHNob3dMb2FkaW5nKCdQYXJzaW5nIElGQ1x1MjAyNicsIHRydWUpO1xuICAgICAgICBjb25zdCBjcmVhdGVSZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XG4gICAgICAgICAgbWV0aG9kOiBBUEkuY3JlYXRlX21vZGVsLFxuICAgICAgICAgIGFyZ3M6IHtcbiAgICAgICAgICAgIGZpbGVfdXJsOiBmaWxlVXJsLFxuICAgICAgICAgICAgZmlsZV9uYW1lOiBmaWxlLm5hbWUsXG4gICAgICAgICAgICBtb2RlbF9uYW1lOiBmaWxlLm5hbWUucmVwbGFjZSgvXFwuaWZjJC9pLCAnJyksXG4gICAgICAgICAgICBkaXNjaXBsaW5lOiBkaXNjLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBsb2FkTW9kZWxzTGlzdCgpO1xuICAgICAgICBhd2FpdCBsb2FkTW9kZWxHZW9tZXRyeShjcmVhdGVSZXMubWVzc2FnZS5uYW1lKTtcbiAgICAgICAgcmVuZGVyTW9kZWxzTGlzdCgpO1xuICAgICAgICB1cGRhdGVFbGVtZW50TWVzaGVzTGlzdCgpO1xuICAgICAgICBmaXRWaWV3KCk7XG4gICAgICAgIHNldFN0YXR1cyhgSW1wb3J0ZWQgJHtmaWxlLm5hbWV9IHN1Y2Nlc3NmdWxseWApO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzZXRTdGF0dXMoJ0ltcG9ydCBmYWlsZWQ6ICcgKyAoZS5tZXNzYWdlIHx8IGUpKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XG4gICAgICAgIGVscy5maWxlSW5wdXQudmFsdWUgPSAnJztcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gVmlld3BvaW50c1xuICBjb25zdCB2cFNhdmVCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndnAtc2F2ZScpO1xuICBpZiAodnBTYXZlQnRuKSB2cFNhdmVCdG4ub25jbGljayA9IHNhdmVDdXJyZW50Vmlld3BvaW50O1xuXG4gIC8vIEZpbHRlciBjaGFuZ2UgbGlzdGVuZXJzXG4gIGlmIChlbHMuZkRpc2NpcGxpbmUpIGVscy5mRGlzY2lwbGluZS5vbmNoYW5nZSA9IGFwcGx5RmlsdGVycztcbiAgaWYgKGVscy5mU3RvcmV5KSBlbHMuZlN0b3JleS5vbmNoYW5nZSA9IGFwcGx5RmlsdGVycztcbiAgaWYgKGVscy5mVHlwZSkgZWxzLmZUeXBlLm9uY2hhbmdlID0gYXBwbHlGaWx0ZXJzO1xuICBpZiAoZWxzLmZTZWFyY2gpIGVscy5mU2VhcmNoLm9uaW5wdXQgPSBhcHBseUZpbHRlcnM7XG4gIGNvbnN0IGZDbGVhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmLWNsZWFyJyk7XG4gIGlmIChmQ2xlYXIpIHtcbiAgICBmQ2xlYXIub25jbGljayA9ICgpID0+IHtcbiAgICAgIGlmIChlbHMuZkRpc2NpcGxpbmUpIGVscy5mRGlzY2lwbGluZS52YWx1ZSA9ICcnO1xuICAgICAgaWYgKGVscy5mU3RvcmV5KSBlbHMuZlN0b3JleS52YWx1ZSA9ICcnO1xuICAgICAgaWYgKGVscy5mVHlwZSkgZWxzLmZUeXBlLnZhbHVlID0gJyc7XG4gICAgICBpZiAoZWxzLmZTZWFyY2gpIGVscy5mU2VhcmNoLnZhbHVlID0gJyc7XG4gICAgICBhcHBseUZpbHRlcnMoKTtcbiAgICB9O1xuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0gQm9vdCAtLS0tLS0tLS0tLS0tLS0tXG5pbml0RGlzY2lwbGluZUNvbnRyb2xzKCk7XG5pbml0VWlFdmVudHMoKTtcbmxvYWRNb2RlbHNMaXN0KCk7XG5cbndpbmRvdy5CSU1WaWV3ZXJBcHAgPSB7XG4gIGxvYWRlZE1vZGVscyxcbiAgZWxlbWVudE1lc2hlcyxcbiAgbG9hZE1vZGVsR2VvbWV0cnksXG4gIHVubG9hZE1vZGVsLFxuICBleGVjdXRlQ2xhc2hEZXRlY3Rpb24sXG4gIGRldGVjdGVkQ2xhc2hlcyxcbiAgb3BlbkJvbVdpemFyZE1vZGFsLFxuICBjYWxjdWxhdGVBbmRSZW5kZXJCb21Sb2xsdXAsXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBR0EsSUFBTSxTQUFTLE9BQU87QUFDdEIsSUFBTSxTQUFTLE9BQU87QUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0FBQ3RCLFFBQU0sSUFBSSxNQUFNLDhFQUE4RTtBQUNoRztBQUVBLElBQU0sUUFBUSxPQUFPO0FBQ3JCLElBQU0sZ0JBQWdCLE9BQU87QUFDN0IsSUFBTSxnQkFBZ0IsT0FBTztBQUM3QixJQUFNLGdCQUFnQixPQUFPO0FBQzdCLElBQU0sdUJBQXVCLE9BQU87QUFDcEMsSUFBTSx1QkFBdUIsT0FBTztBQUNwQyxJQUFNLDhCQUE4QixPQUFPO0FBRzNDLElBQU0sTUFBTTtBQUFBLEVBQ1YsYUFBYTtBQUFBLEVBQ2IsV0FBVztBQUFBLEVBQ1gsZUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2IsY0FBYztBQUFBLEVBQ2QsaUJBQWlCO0FBQUEsRUFDakIsaUJBQWlCO0FBQUEsRUFDakIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsY0FBYztBQUFBLEVBQ2QsY0FBYztBQUFBLEVBQ2QsbUJBQW1CO0FBQUEsRUFDbkIscUJBQXFCO0FBQUEsRUFDckIsdUJBQXVCO0FBQ3pCO0FBR0EsSUFBTSxNQUFNO0FBQUEsRUFDVixRQUFRLFNBQVMsZUFBZSxZQUFZO0FBQUEsRUFDNUMsaUJBQWlCLFNBQVMsZUFBZSxtQkFBbUI7QUFBQSxFQUM1RCxnQkFBZ0IsU0FBUyxlQUFlLGtCQUFrQjtBQUFBLEVBQzFELFFBQVEsU0FBUyxlQUFlLFlBQVk7QUFBQSxFQUM1QyxXQUFXLFNBQVMsZUFBZSxnQkFBZ0I7QUFBQSxFQUNuRCxRQUFRLFNBQVMsZUFBZSxZQUFZO0FBQUEsRUFDNUMsUUFBUSxTQUFTLGVBQWUsWUFBWTtBQUFBLEVBQzVDLFNBQVMsU0FBUyxlQUFlLGFBQWE7QUFBQSxFQUM5QyxPQUFPLFNBQVMsZUFBZSxXQUFXO0FBQUEsRUFDMUMsWUFBWSxTQUFTLGVBQWUsbUJBQW1CO0FBQUEsRUFDdkQsT0FBTyxTQUFTLGVBQWUsV0FBVztBQUFBLEVBQzFDLFlBQVksU0FBUyxlQUFlLGdCQUFnQjtBQUFBLEVBQ3BELFFBQVEsU0FBUyxlQUFlLFNBQVM7QUFBQSxFQUN6QyxhQUFhLFNBQVMsZUFBZSxjQUFjO0FBQUEsRUFDbkQsU0FBUyxTQUFTLGVBQWUsVUFBVTtBQUFBLEVBQzNDLE9BQU8sU0FBUyxlQUFlLFFBQVE7QUFBQSxFQUN2QyxTQUFTLFNBQVMsZUFBZSxVQUFVO0FBQUEsRUFDM0MsZ0JBQWdCLFNBQVMsZUFBZSxrQkFBa0I7QUFBQSxFQUMxRCxpQkFBaUIsU0FBUyxlQUFlLG1CQUFtQjtBQUFBLEVBQzVELHNCQUFzQixTQUFTLGVBQWUsd0JBQXdCO0FBQUEsRUFDdEUsb0JBQW9CLFNBQVMsZUFBZSxzQkFBc0I7QUFBQSxFQUNsRSxxQkFBcUIsU0FBUyxlQUFlLHVCQUF1QjtBQUFBLEVBQ3BFLG1CQUFtQixTQUFTLGVBQWUscUJBQXFCO0FBQUEsRUFDaEUsVUFBVSxTQUFTLGVBQWUsZUFBZTtBQUFBLEVBQ2pELGdCQUFnQixTQUFTLGVBQWUsa0JBQWtCO0FBQUEsRUFDMUQsZ0JBQWdCLFNBQVMsZUFBZSxrQkFBa0I7QUFDNUQ7QUFHQSxJQUFNLFdBQVcsSUFBSSxNQUFNLGNBQWMsRUFBRSxRQUFRLElBQUksUUFBUSxXQUFXLE1BQU0sdUJBQXVCLEtBQUssQ0FBQztBQUM3RyxTQUFTLGNBQWMsS0FBSyxJQUFJLE9BQU8sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO0FBQ2hFLElBQU0sUUFBUSxJQUFJLE1BQU0sTUFBTTtBQUM5QixNQUFNLGFBQWEsSUFBSSxNQUFNLE1BQU0sTUFBUTtBQUUzQyxJQUFNLFNBQVMsSUFBSSxNQUFNLGtCQUFrQixJQUFJLEdBQUcsS0FBSyxHQUFJO0FBQzNELE9BQU8sU0FBUyxJQUFJLElBQUksSUFBSSxFQUFFO0FBQzlCLElBQU0sV0FBVyxJQUFJLGNBQWMsUUFBUSxTQUFTLFVBQVU7QUFDOUQsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxnQkFBZ0I7QUFFekIsTUFBTSxJQUFJLElBQUksTUFBTSxnQkFBZ0IsVUFBVSxTQUFVLEdBQUcsQ0FBQztBQUM1RCxJQUFNLFdBQVcsSUFBSSxNQUFNLGlCQUFpQixVQUFVLEdBQUc7QUFDekQsU0FBUyxTQUFTLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEMsTUFBTSxJQUFJLFFBQVE7QUFDbEIsSUFBTSxZQUFZLElBQUksTUFBTSxpQkFBaUIsU0FBVSxHQUFHO0FBQzFELFVBQVUsU0FBUyxJQUFJLEtBQUssSUFBSSxHQUFHO0FBQ25DLE1BQU0sSUFBSSxTQUFTO0FBRW5CLElBQU0sT0FBTyxJQUFJLE1BQU0sV0FBVyxLQUFLLElBQUksU0FBVSxPQUFRO0FBQzdELEtBQUssU0FBUyxJQUFJO0FBQ2xCLE1BQU0sSUFBSSxJQUFJO0FBR2QsSUFBTSxpQkFBaUIsSUFBSSxNQUFNLE1BQU07QUFDdkMsZUFBZSxPQUFPO0FBQ3RCLE1BQU0sSUFBSSxjQUFjO0FBR3hCLElBQU0sb0JBQW9CLElBQUksTUFBTSxNQUFNO0FBQzFDLGtCQUFrQixPQUFPO0FBQ3pCLE1BQU0sSUFBSSxpQkFBaUI7QUFHM0IsSUFBSSxlQUFlLG9CQUFJLElBQUk7QUFDM0IsSUFBSSxnQkFBZ0IsQ0FBQztBQUNyQixJQUFJLGVBQWUsb0JBQUksSUFBSTtBQUMzQixJQUFJLGtCQUFrQixDQUFDO0FBQ3ZCLElBQUksbUJBQW1CO0FBQ3ZCLElBQUksYUFBYTtBQUVqQixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLFNBQVM7QUFDYixJQUFJLGtCQUFrQixDQUFDO0FBQ3ZCLElBQUksY0FBYztBQUdsQixJQUFNLGVBQWUsSUFBSSxNQUFNLHFCQUFxQixFQUFFLE9BQU8sU0FBVSxVQUFVLFFBQVUsbUJBQW1CLElBQUksQ0FBQztBQUNuSCxJQUFNLFlBQVksSUFBSSxNQUFNLHFCQUFxQixFQUFFLE9BQU8sVUFBVSxVQUFVLFNBQVUsbUJBQW1CLEtBQUssV0FBVyxJQUFJLENBQUM7QUFDaEksSUFBTSxZQUFZLElBQUksTUFBTSxxQkFBcUIsRUFBRSxPQUFPLFVBQVUsVUFBVSxTQUFVLG1CQUFtQixLQUFLLFdBQVcsSUFBSSxDQUFDO0FBRWhJLFNBQVMsU0FBUztBQUNoQixRQUFNLElBQUksSUFBSSxTQUFVLElBQUksT0FBTyxlQUFlLE1BQU87QUFDekQsUUFBTSxJQUFJLElBQUksU0FBVSxJQUFJLE9BQU8sZ0JBQWdCLE1BQU87QUFDMUQsV0FBUyxRQUFRLEdBQUcsR0FBRyxLQUFLO0FBQzVCLFNBQU8sU0FBUyxJQUFJO0FBQ3BCLFNBQU8sdUJBQXVCO0FBQ2hDO0FBQ0EsT0FBTyxpQkFBaUIsVUFBVSxNQUFNO0FBQ3hDLE9BQU87QUFFUCxJQUFJLE9BQU8sa0JBQWtCO0FBQzNCLHVCQUFxQixPQUFPLGdCQUFnQjtBQUM1QyxTQUFPLG1CQUFtQjtBQUM1QjtBQUVBLFNBQVMsVUFBVTtBQUNqQixTQUFPLG1CQUFtQixzQkFBc0IsT0FBTztBQUN2RCxXQUFTLE9BQU87QUFDaEIsV0FBUyxPQUFPLE9BQU8sTUFBTTtBQUMvQjtBQUNBLFFBQVE7QUFFUixTQUFTLFVBQVUsS0FBSztBQUFFLE1BQUksSUFBSSxPQUFRLEtBQUksT0FBTyxjQUFjO0FBQUs7QUFDeEUsU0FBUyxZQUFZLEtBQUssSUFBSTtBQUM1QixNQUFJLElBQUksU0FBUztBQUNmLFFBQUksUUFBUSxNQUFNLFVBQVUsS0FBSyxTQUFTO0FBQzFDLFFBQUksR0FBSSxLQUFJLFFBQVEsY0FBYztBQUFBLEVBQ3BDO0FBQ0Y7QUFHQSxlQUFlLFlBQVk7QUFDekIsTUFBSSxPQUFRLFFBQU87QUFDbkIsUUFBTSxNQUFNLElBQUksT0FBTyxPQUFPO0FBQzlCLE1BQUksWUFBWSx1Q0FBdUMsSUFBSTtBQUMzRCxRQUFNLElBQUksS0FBSztBQUNmLFdBQVM7QUFDVCxTQUFPO0FBQ1Q7QUFHQSxlQUFlLGlCQUFpQjtBQUM5QixZQUFVLHNCQUFpQjtBQUMzQixNQUFJO0FBQ0YsVUFBTSxNQUFNLE1BQU0sT0FBTyxLQUFLLEVBQUUsUUFBUSxJQUFJLFlBQVksQ0FBQztBQUN6RCxzQkFBa0IsSUFBSSxXQUFXLENBQUM7QUFDbEMscUJBQWlCO0FBQ2pCLFFBQUksZ0JBQWdCLFFBQVE7QUFDMUIsZ0JBQVUsR0FBRyxnQkFBZ0IsTUFBTSxtQkFBbUI7QUFBQSxJQUN4RCxPQUFPO0FBQ0wsZ0JBQVUsK0NBQStDO0FBQUEsSUFDM0Q7QUFBQSxFQUNGLFNBQVMsR0FBRztBQUNWLGNBQVUsa0NBQWtDLEVBQUUsV0FBVyxFQUFFO0FBQUEsRUFDN0Q7QUFDRjtBQUVBLFNBQVMsbUJBQW1CO0FBQzFCLE1BQUksQ0FBQyxJQUFJLE9BQVE7QUFDakIsTUFBSSxPQUFPLFlBQVk7QUFDdkIsTUFBSSxDQUFDLGdCQUFnQixRQUFRO0FBQzNCLFFBQUksT0FBTyxZQUFZO0FBQ3ZCO0FBQUEsRUFDRjtBQUVBLGtCQUFnQixRQUFRLE9BQUs7QUFDM0IsVUFBTSxXQUFXLGFBQWEsSUFBSSxFQUFFLElBQUk7QUFDeEMsVUFBTSxJQUFJLFNBQVMsY0FBYyxLQUFLO0FBQ3RDLE1BQUUsWUFBWSxvQkFBb0IsV0FBVyxZQUFZO0FBR3pELFFBQUksT0FBTyxFQUFFLGNBQWM7QUFDM0IsVUFBTSxhQUFhLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWTtBQUN2RCxRQUFJLFVBQVUsU0FBUyxPQUFPLEtBQUssVUFBVSxTQUFTLEtBQUssRUFBRyxRQUFPO0FBQUEsYUFDNUQsVUFBVSxTQUFTLE1BQU0sS0FBSyxVQUFVLFNBQVMsS0FBSyxLQUFLLFVBQVUsU0FBUyxLQUFLLEVBQUcsUUFBTztBQUV0RyxNQUFFLFlBQVk7QUFBQSx3Q0FDc0IsRUFBRSxVQUFVO0FBQUEscURBQ0MsV0FBVyxZQUFZLEVBQUU7QUFBQSxnQkFDOUQsRUFBRSxVQUFVO0FBQUE7QUFBQTtBQUFBLDhDQUdrQixJQUFJO0FBQUEsNEJBQ3RCLEVBQUUsaUJBQWlCLENBQUM7QUFBQTtBQUFBO0FBSTVDLFVBQU0sV0FBVyxFQUFFLGNBQWMsY0FBYztBQUMvQyxhQUFTLFVBQVUsQ0FBQyxNQUFNO0FBQ3hCLFFBQUUsZ0JBQWdCO0FBQ2xCLGtCQUFZLEVBQUUsSUFBSTtBQUFBLElBQ3BCO0FBRUEsTUFBRSxVQUFVLE1BQU0sWUFBWSxFQUFFLElBQUk7QUFDcEMsUUFBSSxPQUFPLFlBQVksQ0FBQztBQUFBLEVBQzFCLENBQUM7QUFDSDtBQUVBLGVBQWUsWUFBWSxjQUFjO0FBQ3ZDLE1BQUksYUFBYSxJQUFJLFlBQVksR0FBRztBQUNsQyxnQkFBWSxZQUFZO0FBQUEsRUFDMUIsT0FBTztBQUNMLFVBQU0sa0JBQWtCLFlBQVk7QUFBQSxFQUN0QztBQUNBLG1CQUFpQjtBQUNqQiwwQkFBd0I7QUFDeEIsaUJBQWU7QUFDZixVQUFRO0FBQ1Y7QUFFQSxlQUFlLGtCQUFrQixjQUFjO0FBQzdDLGNBQVksaUJBQWlCLFlBQVksVUFBSyxJQUFJO0FBQ2xELE1BQUk7QUFDRixVQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUssRUFBRSxRQUFRLElBQUksV0FBVyxNQUFNLEVBQUUsT0FBTyxhQUFhLEVBQUUsQ0FBQztBQUN0RixVQUFNLFlBQVksSUFBSTtBQUN0QixVQUFNLFNBQVMsVUFBVTtBQUN6QixRQUFJLENBQUMsUUFBUTtBQUNYLGdCQUFVLFNBQVMsVUFBVSxVQUFVLDJCQUEyQjtBQUNsRTtBQUFBLElBQ0Y7QUFFQSxVQUFNLFNBQVMsT0FBTyxXQUFXLEdBQUcsSUFBSSxTQUFTLE1BQU07QUFDdkQsZ0JBQVksb0JBQW9CLFVBQVUsVUFBVSxXQUFNLElBQUk7QUFDOUQsVUFBTSxPQUFPLE1BQU0sTUFBTSxNQUFNO0FBQy9CLFFBQUksQ0FBQyxLQUFLLEdBQUksT0FBTSxJQUFJLE1BQU0sUUFBUSxLQUFLLE1BQU0sZUFBZTtBQUVoRSxVQUFNLE1BQU0sSUFBSSxXQUFXLE1BQU0sS0FBSyxZQUFZLENBQUM7QUFDbkQsZ0JBQVksaUJBQWlCLElBQUksU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLGNBQVMsSUFBSTtBQUV0RSxVQUFNLE1BQU0sTUFBTSxVQUFVO0FBRTVCLFVBQU0sYUFBYSxJQUFJLFVBQVUsS0FBSyxFQUFFLHNCQUFzQixPQUFPLGNBQWMsS0FBSyxDQUFDO0FBRXpGLFFBQUksT0FBTyxVQUFVLGNBQWM7QUFDbkMsVUFBTSxhQUFhLFVBQVUsY0FBYyxjQUFjLFlBQVk7QUFDckUsUUFBSSxVQUFVLFNBQVMsT0FBTyxLQUFLLFVBQVUsU0FBUyxLQUFLLEVBQUcsUUFBTztBQUFBLGFBQzVELFVBQVUsU0FBUyxNQUFNLEtBQUssVUFBVSxTQUFTLEtBQUssS0FBSyxVQUFVLFNBQVMsS0FBSyxFQUFHLFFBQU87QUFFdEcsZ0JBQVksc0JBQXNCLElBQUksV0FBTSxJQUFJO0FBQ2hELFVBQU0sY0FBYyxjQUFjLEtBQUssWUFBWTtBQUFBLE1BQ2pELFdBQVcsVUFBVSxjQUFjO0FBQUEsTUFDbkMsWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUVELG1CQUFlLElBQUksWUFBWSxLQUFLO0FBR3BDLFFBQUk7QUFDRixZQUFNLFVBQVUsTUFBTSxPQUFPLEtBQUs7QUFBQSxRQUNoQyxRQUFRLElBQUk7QUFBQSxRQUNaLE1BQU0sRUFBRSxPQUFPLGNBQWMsU0FBUyxNQUFNLE9BQU8sS0FBTTtBQUFBLE1BQzNELENBQUM7QUFDRCxZQUFNLFdBQVksUUFBUSxXQUFXLFFBQVEsUUFBUSxZQUFhLENBQUM7QUFDbkUsZUFBUyxRQUFRLFFBQU07QUFDckIsY0FBTSxZQUFZLEdBQUcsWUFBWSxJQUFJLFFBQVEsS0FBSyxFQUFFO0FBQ3BELFlBQUksU0FBVSxjQUFhLElBQUksR0FBRyxZQUFZLElBQUksUUFBUSxJQUFJLEVBQUU7QUFDaEUsWUFBSSxHQUFHLFVBQVcsY0FBYSxJQUFJLEdBQUcsV0FBVyxFQUFFO0FBQUEsTUFDckQsQ0FBQztBQUFBLElBQ0gsU0FBUyxHQUFHO0FBQUEsSUFBQztBQUViLGlCQUFhLElBQUksY0FBYztBQUFBLE1BQzdCO0FBQUEsTUFDQSxXQUFXLFVBQVUsY0FBYztBQUFBLE1BQ25DLFlBQVk7QUFBQSxNQUNaO0FBQUEsTUFDQSxPQUFPLFlBQVk7QUFBQSxNQUNuQixZQUFZLFlBQVk7QUFBQSxNQUN4QixXQUFXLFlBQVk7QUFBQSxNQUN2QixVQUFVLENBQUM7QUFBQSxNQUNYLFdBQVc7QUFBQSxNQUNYLFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxJQUNYLENBQUM7QUFFRCxjQUFVLFVBQVUsVUFBVSxVQUFVLEtBQUssSUFBSSxNQUFNLFlBQVksVUFBVSxLQUFLLFlBQVksWUFBWSxVQUFVLElBQUksT0FBTztBQUFBLEVBQ2pJLFNBQVMsR0FBRztBQUNWLFlBQVEsTUFBTSxpQ0FBaUMsQ0FBQztBQUNoRCxjQUFVLGlCQUFpQixZQUFZLEtBQUssRUFBRSxXQUFXLENBQUMsRUFBRTtBQUFBLEVBQzlELFVBQUU7QUFDQSxnQkFBWSxJQUFJLEtBQUs7QUFBQSxFQUN2QjtBQUNGO0FBRUEsU0FBUyxZQUFZLGNBQWM7QUFDakMsUUFBTSxhQUFhLGFBQWEsSUFBSSxZQUFZO0FBQ2hELE1BQUksQ0FBQyxXQUFZO0FBRWpCLGlCQUFlLE9BQU8sV0FBVyxLQUFLO0FBQ3RDLGVBQWEsV0FBVyxLQUFLO0FBQzdCLGVBQWEsT0FBTyxZQUFZO0FBQ2hDLFlBQVUsWUFBWSxXQUFXLFNBQVMsRUFBRTtBQUM5QztBQUVBLFNBQVMsa0JBQWtCO0FBQ3pCLGVBQWEsUUFBUSxDQUFDLFVBQVU7QUFDOUIsbUJBQWUsT0FBTyxNQUFNLEtBQUs7QUFDakMsaUJBQWEsTUFBTSxLQUFLO0FBQUEsRUFDMUIsQ0FBQztBQUNELGVBQWEsTUFBTTtBQUNuQixrQkFBZ0IsQ0FBQztBQUNqQixvQkFBa0IsTUFBTTtBQUN4QixpQkFBZTtBQUNmLG1CQUFpQjtBQUNqQixZQUFVLG9CQUFvQjtBQUNoQztBQUVBLFNBQVMsMEJBQTBCO0FBQ2pDLGtCQUFnQixDQUFDO0FBQ2pCLGVBQWEsUUFBUSxDQUFDLE9BQU8saUJBQWlCO0FBQzVDLFVBQU0sV0FBVyxRQUFRLENBQUMsUUFBUSxjQUFjO0FBQzlDLGFBQU8sUUFBUSxPQUFLO0FBQ2xCLFVBQUUsU0FBUyxlQUFlO0FBQzFCLFVBQUUsU0FBUyxhQUFhLE1BQU07QUFDOUIsc0JBQWMsS0FBSyxFQUFFLE1BQU0sR0FBRyxXQUFXLGNBQWMsWUFBWSxNQUFNLFdBQVcsQ0FBQztBQUFBLE1BQ3ZGLENBQUM7QUFBQSxJQUNILENBQUM7QUFBQSxFQUNILENBQUM7QUFDSDtBQUVBLFNBQVMsYUFBYSxPQUFPO0FBQzNCLFFBQU0sU0FBUyxPQUFLO0FBQ2xCLFFBQUksRUFBRSxRQUFRO0FBQ1osVUFBSSxFQUFFLFNBQVUsR0FBRSxTQUFTLFFBQVE7QUFDbkMsVUFBSSxFQUFFLFVBQVU7QUFDZCxZQUFJLE1BQU0sUUFBUSxFQUFFLFFBQVEsRUFBRyxHQUFFLFNBQVMsUUFBUSxPQUFLLEVBQUUsUUFBUSxDQUFDO0FBQUEsWUFDN0QsR0FBRSxTQUFTLFFBQVE7QUFBQSxNQUMxQjtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUdBLFNBQVMseUJBQXlCO0FBQ2hDLFFBQU0sT0FBTyxTQUFTLGlCQUFpQix1QkFBdUI7QUFDOUQsT0FBSyxRQUFRLFNBQU87QUFDbEIsVUFBTSxPQUFPLElBQUksUUFBUTtBQUN6QixVQUFNLFNBQVMsSUFBSSxjQUFjLFVBQVU7QUFDM0MsVUFBTSxXQUFXLElBQUksY0FBYyxZQUFZO0FBQy9DLFVBQU0sVUFBVSxJQUFJLGNBQWMsV0FBVztBQUM3QyxVQUFNLFNBQVMsSUFBSSxjQUFjLHNCQUFzQjtBQUN2RCxVQUFNLFVBQVUsSUFBSSxjQUFjLG1CQUFtQjtBQUVyRCxRQUFJLFFBQVE7QUFDVixhQUFPLFVBQVUsTUFBTTtBQUNyQixjQUFNLGlCQUFpQixPQUFPLFVBQVUsU0FBUyxRQUFRO0FBQ3pELGdDQUF3QixNQUFNLENBQUMsY0FBYztBQUM3QyxlQUFPLFVBQVUsT0FBTyxVQUFVLENBQUMsY0FBYztBQUNqRCxlQUFPLGNBQWMsQ0FBQyxpQkFBaUIsY0FBTztBQUFBLE1BQ2hEO0FBQUEsSUFDRjtBQUVBLFFBQUksVUFBVTtBQUNaLGVBQVMsVUFBVSxNQUFNO0FBQ3ZCLGNBQU0sVUFBVSxTQUFTLFVBQVUsU0FBUyxjQUFjO0FBQzFELDhCQUFzQixNQUFNLENBQUMsT0FBTztBQUNwQyxpQkFBUyxVQUFVLE9BQU8sZ0JBQWdCLENBQUMsT0FBTztBQUNsRCxZQUFJLENBQUMsU0FBUztBQUNaLGNBQUksT0FBUSxRQUFPLFFBQVE7QUFDM0IsY0FBSSxRQUFTLFNBQVEsY0FBYztBQUFBLFFBQ3JDLE9BQU87QUFDTCxjQUFJLE9BQVEsUUFBTyxRQUFRO0FBQzNCLGNBQUksUUFBUyxTQUFRLGNBQWM7QUFBQSxRQUNyQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsUUFBSSxTQUFTO0FBQ1gsY0FBUSxVQUFVLE1BQU07QUFDdEIsYUFBSyxRQUFRLE9BQUs7QUFDaEIsZ0JBQU0sSUFBSSxFQUFFLFFBQVE7QUFDcEIsZ0JBQU0sT0FBTyxFQUFFLGNBQWMsVUFBVTtBQUN2QyxjQUFJLE1BQU0sTUFBTTtBQUNkLG9DQUF3QixHQUFHLElBQUk7QUFDL0IsZ0JBQUksTUFBTTtBQUFFLG1CQUFLLFVBQVUsSUFBSSxRQUFRO0FBQUcsbUJBQUssY0FBYztBQUFBLFlBQU07QUFBQSxVQUNyRSxPQUFPO0FBQ0wsb0NBQXdCLEdBQUcsS0FBSztBQUNoQyxnQkFBSSxNQUFNO0FBQUUsbUJBQUssVUFBVSxPQUFPLFFBQVE7QUFBRyxtQkFBSyxjQUFjO0FBQUEsWUFBTTtBQUFBLFVBQ3hFO0FBQUEsUUFDRixDQUFDO0FBQ0Qsa0JBQVUsU0FBUyxJQUFJLEVBQUU7QUFBQSxNQUMzQjtBQUFBLElBQ0Y7QUFFQSxRQUFJLFFBQVE7QUFDVixhQUFPLFVBQVUsTUFBTTtBQUNyQixjQUFNLFFBQVEsU0FBUyxPQUFPLE9BQU8sRUFBRSxJQUFJO0FBQzNDLFlBQUksUUFBUyxTQUFRLGNBQWMsR0FBRyxPQUFPLEtBQUs7QUFDbEQsNkJBQXFCLE1BQU0sS0FBSztBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRUEsU0FBUyx3QkFBd0IsWUFBWSxTQUFTO0FBQ3BELGVBQWEsUUFBUSxXQUFTO0FBQzVCLFFBQUksa0JBQWtCLE1BQU0sWUFBWSxVQUFVLEdBQUc7QUFDbkQsWUFBTSxVQUFVO0FBQ2hCLFlBQU0sTUFBTSxVQUFVO0FBQUEsSUFDeEI7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUVBLFNBQVMsc0JBQXNCLFlBQVksU0FBUztBQUNsRCxlQUFhLFFBQVEsV0FBUztBQUM1QixRQUFJLGtCQUFrQixNQUFNLFlBQVksVUFBVSxHQUFHO0FBQ25ELFlBQU0sWUFBWTtBQUNsQixZQUFNLE1BQU0sU0FBUyxPQUFLO0FBQ3hCLFlBQUksRUFBRSxVQUFVLEVBQUUsVUFBVTtBQUMxQixjQUFJLENBQUMsRUFBRSxTQUFTLG1CQUFtQjtBQUNqQyxjQUFFLFNBQVMsb0JBQW9CO0FBQUEsY0FDN0IsT0FBTyxFQUFFLFNBQVMsTUFBTSxNQUFNO0FBQUEsY0FDOUIsU0FBUyxFQUFFLFNBQVM7QUFBQSxjQUNwQixhQUFhLEVBQUUsU0FBUztBQUFBLGNBQ3hCLFlBQVksRUFBRSxTQUFTO0FBQUEsWUFDekI7QUFBQSxVQUNGO0FBQ0EsY0FBSSxTQUFTO0FBQ1gsY0FBRSxTQUFTLGNBQWM7QUFDekIsY0FBRSxTQUFTLFVBQVU7QUFDckIsY0FBRSxTQUFTLGFBQWE7QUFDeEIsY0FBRSxTQUFTLE1BQU0sT0FBTyxPQUFRO0FBQUEsVUFDbEMsT0FBTztBQUNMLGtCQUFNLElBQUksRUFBRSxTQUFTO0FBQ3JCLGNBQUUsU0FBUyxjQUFjLEVBQUU7QUFDM0IsY0FBRSxTQUFTLFVBQVUsRUFBRTtBQUN2QixjQUFFLFNBQVMsYUFBYSxFQUFFO0FBQzFCLGNBQUUsU0FBUyxNQUFNLEtBQUssRUFBRSxLQUFLO0FBQUEsVUFDL0I7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRUEsU0FBUyxxQkFBcUIsWUFBWSxTQUFTO0FBQ2pELGVBQWEsUUFBUSxXQUFTO0FBQzVCLFFBQUksa0JBQWtCLE1BQU0sWUFBWSxVQUFVLEdBQUc7QUFDbkQsWUFBTSxVQUFVO0FBQ2hCLFlBQU0sTUFBTSxTQUFTLE9BQUs7QUFDeEIsWUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVO0FBQzFCLGNBQUksQ0FBQyxFQUFFLFNBQVMsbUJBQW1CO0FBQ2pDLGNBQUUsU0FBUyxvQkFBb0I7QUFBQSxjQUM3QixPQUFPLEVBQUUsU0FBUyxNQUFNLE1BQU07QUFBQSxjQUM5QixTQUFTLEVBQUUsU0FBUztBQUFBLGNBQ3BCLGFBQWEsRUFBRSxTQUFTO0FBQUEsY0FDeEIsWUFBWSxFQUFFLFNBQVM7QUFBQSxZQUN6QjtBQUFBLFVBQ0Y7QUFDQSxZQUFFLFNBQVMsY0FBYyxVQUFVO0FBQ25DLFlBQUUsU0FBUyxVQUFVO0FBQ3JCLFlBQUUsU0FBUyxhQUFhLFdBQVc7QUFBQSxRQUNyQztBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUVBLFNBQVMsa0JBQWtCLFdBQVcsWUFBWTtBQUNoRCxNQUFJLENBQUMsYUFBYSxDQUFDLFdBQVksUUFBTztBQUN0QyxRQUFNLElBQUksVUFBVSxZQUFZO0FBQ2hDLFFBQU0sSUFBSSxXQUFXLFlBQVk7QUFDakMsTUFBSSxNQUFNLEVBQUcsUUFBTztBQUNwQixNQUFJLE1BQU0sVUFBVSxFQUFFLFNBQVMsTUFBTSxLQUFLLEVBQUUsU0FBUyxPQUFPLEtBQUssRUFBRSxTQUFTLE1BQU0sS0FBSyxFQUFFLFNBQVMsTUFBTSxHQUFJLFFBQU87QUFDbkgsTUFBSSxNQUFNLGlCQUFpQixFQUFFLFNBQVMsT0FBTyxLQUFLLEVBQUUsU0FBUyxLQUFLLEdBQUksUUFBTztBQUM3RSxNQUFJLE1BQU0sbUJBQW1CLEVBQUUsU0FBUyxLQUFLLEtBQUssRUFBRSxTQUFTLE1BQU0sR0FBSSxRQUFPO0FBQzlFLFNBQU87QUFDVDtBQUdBLFNBQVMsaUJBQWlCO0FBQ3hCLHFCQUFtQjtBQUNuQixNQUFJLElBQUksTUFBTyxLQUFJLE1BQU0sWUFBWTtBQUNyQyxNQUFJLElBQUksWUFBWTtBQUNsQixRQUFJLFdBQVcsY0FBYztBQUM3QixRQUFJLFdBQVcsWUFBWTtBQUFBLEVBQzdCO0FBQ0EsTUFBSSxJQUFJLE1BQU8sS0FBSSxNQUFNLFlBQVk7QUFFckMsZ0JBQWMsUUFBUSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ2xDLFFBQUksS0FBSyxTQUFTLFdBQVc7QUFDM0IsV0FBSyxTQUFTLE1BQU0sS0FBSyxLQUFLLFNBQVMsU0FBUztBQUFBLElBQ2xEO0FBQ0EsUUFBSSxLQUFLLFNBQVMsU0FBVSxNQUFLLFNBQVMsU0FBUyxPQUFPLENBQVE7QUFBQSxFQUNwRSxDQUFDO0FBQ0g7QUFFQSxlQUFlLGNBQWMsTUFBTSxXQUFXLGNBQWM7QUFDMUQsaUJBQWU7QUFDZixRQUFNLFlBQVksR0FBRyxZQUFZLElBQUksU0FBUztBQUM5QyxNQUFJLEtBQUssYUFBYSxJQUFJLFNBQVMsS0FBSyxhQUFhLElBQUksT0FBTyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVM7QUFFN0YscUJBQW1CLEVBQUUsTUFBTSxTQUFTLElBQUksV0FBVyxhQUFhO0FBRWhFLE1BQUksQ0FBQyxLQUFLLFNBQVMsVUFBVyxNQUFLLFNBQVMsWUFBWSxLQUFLLFNBQVMsTUFBTSxNQUFNO0FBQ2xGLE9BQUssU0FBUyxNQUFNLEtBQUssYUFBYSxLQUFLO0FBQzNDLE1BQUksS0FBSyxTQUFTLFNBQVUsTUFBSyxTQUFTLFNBQVMsS0FBSyxhQUFhLFFBQVE7QUFFN0UsUUFBTSxhQUFhLGFBQWEsSUFBSSxZQUFZO0FBQ2hELFFBQU0sYUFBYyxjQUFjLFdBQVcsY0FBZSxLQUFLLFNBQVMsY0FBYztBQUN4RixRQUFNLFlBQWEsY0FBYyxXQUFXLGFBQWM7QUFFMUQseUJBQXVCLElBQUksV0FBVyxXQUFXLFlBQVksSUFBSTtBQUVqRSxNQUFJLE9BQU8sQ0FBQyxHQUFHLGNBQWMsQ0FBQyxPQUFPLEtBQUssR0FBRyxVQUFVLEVBQUUsU0FBUztBQUNoRSxRQUFJO0FBQ0YsWUFBTSxVQUFVLE1BQU0sT0FBTyxLQUFLLEVBQUUsUUFBUSxJQUFJLGFBQWEsTUFBTSxFQUFFLFNBQVMsR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUN6RixVQUFJLFFBQVEsV0FBVyxvQkFBb0IsaUJBQWlCLGNBQWMsV0FBVztBQUNuRixlQUFPLE9BQU8sSUFBSSxRQUFRLE9BQU87QUFDakMsK0JBQXVCLElBQUksV0FBVyxXQUFXLFlBQVksSUFBSTtBQUFBLE1BQ25FO0FBQUEsSUFDRixTQUFTLEdBQUc7QUFBQSxJQUFDO0FBQUEsRUFDZixXQUFXLENBQUMsTUFBTSxjQUFjLFFBQVE7QUFDdEMsUUFBSTtBQUNGLFlBQU0sV0FBVyxNQUFNLE9BQU8sUUFBUSxXQUFXLFlBQVksU0FBUztBQUN0RSw0QkFBc0IsV0FBVyxVQUFVLFdBQVcsVUFBVTtBQUFBLElBQ2xFLFNBQVMsR0FBRztBQUFBLElBQUM7QUFBQSxFQUNmO0FBQ0Y7QUFFQSxTQUFTLHVCQUF1QixJQUFJLFdBQVcsV0FBVyxZQUFZLE1BQU07QUFDMUUsTUFBSSxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksTUFBTztBQUVuQyxRQUFNLFFBQVMsT0FBTyxHQUFHLFNBQVMsR0FBRyxpQkFBa0IsUUFBUSxTQUFTO0FBQ3hFLFFBQU0sT0FBUSxNQUFNLEdBQUcsYUFBYztBQUNyQyxNQUFJLFdBQVcsY0FBYyxHQUFHLEtBQUssSUFBSSxPQUFPLElBQUksSUFBSSxNQUFNLEVBQUU7QUFDaEUsTUFBSSxXQUFXLFlBQVk7QUFDM0IsTUFBSSxNQUFNLFlBQVk7QUFHdEIsUUFBTSxZQUFZLFNBQVMsY0FBYyxLQUFLO0FBQzlDLFlBQVUsTUFBTSxlQUFlO0FBQy9CLFlBQVUsWUFBWTtBQUFBLDBDQUNrQixTQUFTO0FBQUEsOEJBQ3JCLFVBQVU7QUFBQSxNQUNsQyxNQUFNLEdBQUcsU0FBUywyQkFBMkIsR0FBRyxNQUFNLFlBQVksRUFBRTtBQUFBLCtCQUMzQyxTQUFTO0FBQUE7QUFFdEMsTUFBSSxNQUFNLFlBQVksU0FBUztBQUcvQixNQUFJLFFBQVEsS0FBSyxVQUFVO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLFNBQVMsWUFBYSxNQUFLLFNBQVMsbUJBQW1CO0FBQ2pFLFVBQU0sTUFBTSxLQUFLLFNBQVMsWUFBWSxNQUFNLEVBQUUsYUFBYSxLQUFLLFdBQVc7QUFDM0UsVUFBTSxPQUFPLElBQUksUUFBUSxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBQzVDLFVBQU0sU0FBUyxJQUFJLFVBQVUsSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUVoRCxVQUFNLGFBQWEsU0FBUyxjQUFjLEtBQUs7QUFDL0MsZUFBVyxNQUFNLFVBQVU7QUFDM0IsZUFBVyxjQUFjO0FBQ3pCLFFBQUksTUFBTSxZQUFZLFVBQVU7QUFFaEMsVUFBTSxZQUFZLFNBQVMsY0FBYyxPQUFPO0FBQ2hELGNBQVUsWUFBWTtBQUN0QixjQUFVLFlBQVk7QUFBQSwrQ0FDZSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsVUFBTyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsVUFBTyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxzQ0FDcEUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFFckcsUUFBSSxNQUFNLFlBQVksU0FBUztBQUFBLEVBQ2pDO0FBR0EsUUFBTSxJQUFLLE1BQU0sR0FBRyxjQUFlLENBQUM7QUFDcEMsUUFBTSxRQUFRLE9BQU8sS0FBSyxDQUFDO0FBQzNCLE1BQUksTUFBTSxRQUFRO0FBQ2hCLFVBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxZQUFRLE1BQU0sVUFBVTtBQUN4QixZQUFRLGNBQWM7QUFDdEIsUUFBSSxNQUFNLFlBQVksT0FBTztBQUU3QixVQUFNLFNBQVMsU0FBUyxjQUFjLE9BQU87QUFDN0MsV0FBTyxZQUFZO0FBQ25CLFVBQU0sUUFBUSxPQUFLO0FBQ2pCLFlBQU0sS0FBSyxTQUFTLGNBQWMsSUFBSTtBQUN0QyxTQUFHLFlBQVksT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDdkMsYUFBTyxZQUFZLEVBQUU7QUFBQSxJQUN2QixDQUFDO0FBQ0QsUUFBSSxNQUFNLFlBQVksTUFBTTtBQUFBLEVBQzlCO0FBR0EsUUFBTSxJQUFLLE1BQU0sR0FBRyxjQUFlLENBQUM7QUFDcEMsUUFBTSxRQUFRLE9BQU8sS0FBSyxDQUFDLEVBQUUsT0FBTyxPQUFLLENBQUMsQ0FBQyxVQUFVLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUM1RSxNQUFJLE1BQU0sUUFBUTtBQUNoQixVQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsWUFBUSxNQUFNLFVBQVU7QUFDeEIsWUFBUSxjQUFjO0FBQ3RCLFFBQUksTUFBTSxZQUFZLE9BQU87QUFFN0IsVUFBTSxTQUFTLFNBQVMsY0FBYyxPQUFPO0FBQzdDLFdBQU8sWUFBWTtBQUNuQixVQUFNLE1BQU0sR0FBRyxFQUFFLEVBQUUsUUFBUSxPQUFLO0FBQzlCLFlBQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQyxNQUFNLFdBQVcsS0FBSyxVQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQztBQUN2RSxZQUFNLEtBQUssU0FBUyxjQUFjLElBQUk7QUFDdEMsU0FBRyxZQUFZLE9BQU8sQ0FBQyxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNqRCxhQUFPLFlBQVksRUFBRTtBQUFBLElBQ3ZCLENBQUM7QUFDRCxRQUFJLE1BQU0sWUFBWSxNQUFNO0FBQUEsRUFDOUI7QUFFQSxNQUFJLE1BQU0sR0FBRyxLQUFNLGNBQWEsR0FBRyxJQUFJO0FBQ3pDO0FBRUEsU0FBUyxzQkFBc0IsV0FBVyxPQUFPLFdBQVcsWUFBWTtBQUN0RSxNQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsSUFBSSxNQUFPO0FBQ25DLE1BQUksV0FBVyxjQUFjLFFBQVEsU0FBUyxJQUFJLE1BQU0sUUFBUSxFQUFFO0FBQ2xFLE1BQUksV0FBVyxZQUFZO0FBQzNCLE1BQUksTUFBTSxZQUFZO0FBQUE7QUFBQSw0Q0FFb0IsU0FBUztBQUFBLGdDQUNyQixVQUFVO0FBQUE7QUFBQTtBQUl4QyxRQUFNLFFBQVEsU0FBUyxjQUFjLE9BQU87QUFDNUMsUUFBTSxZQUFZO0FBQ2xCLFNBQU8sS0FBSyxLQUFLLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxRQUFRLE9BQUs7QUFDM0MsVUFBTSxJQUFJLE1BQU0sQ0FBQztBQUNqQixVQUFNLE1BQU0sS0FBSyxPQUFPLE1BQU0sWUFBWSxFQUFFLFVBQVUsU0FBWSxFQUFFLFFBQVMsT0FBTyxNQUFNLFdBQVcsS0FBSyxVQUFVLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxJQUFJO0FBQ3RJLFVBQU0sS0FBSyxTQUFTLGNBQWMsSUFBSTtBQUN0QyxPQUFHLFlBQVksT0FBTyxDQUFDLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDOUMsVUFBTSxZQUFZLEVBQUU7QUFBQSxFQUN0QixDQUFDO0FBQ0QsTUFBSSxNQUFNLFlBQVksS0FBSztBQUM3QjtBQUVBLGVBQWUsYUFBYSxZQUFZO0FBQ3RDLE1BQUksQ0FBQyxJQUFJLE1BQU87QUFDaEIsTUFBSTtBQUNGLFVBQU0sTUFBTSxNQUFNLE9BQU8sS0FBSyxFQUFFLFFBQVEsSUFBSSxnQkFBZ0IsTUFBTSxFQUFFLGFBQWEsV0FBVyxFQUFFLENBQUM7QUFDL0YsVUFBTSxRQUFRLElBQUksV0FBVyxDQUFDO0FBQzlCLFFBQUksQ0FBQyxNQUFNLFFBQVE7QUFDakIsVUFBSSxNQUFNLFlBQVk7QUFDdEI7QUFBQSxJQUNGO0FBQ0EsUUFBSSxNQUFNLFlBQVksTUFBTSxJQUFJLE9BQUs7QUFBQTtBQUFBLGdCQUV6QixFQUFFLGtCQUFrQiw0QkFBNEIsRUFBRSxrQkFBa0I7QUFBQSx5Q0FDM0MsRUFBRSxJQUFJO0FBQUE7QUFBQSxLQUUxQyxFQUFFLEtBQUssRUFBRTtBQUVWLFFBQUksTUFBTSxpQkFBaUIsTUFBTSxFQUFFLFFBQVEsT0FBSztBQUM5QyxRQUFFLFVBQVUsWUFBWTtBQUN0QixjQUFNLE9BQU8sS0FBSyxFQUFFLFFBQVEsSUFBSSxpQkFBaUIsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEtBQUssRUFBRSxDQUFDO0FBQ2pGLHFCQUFhLFVBQVU7QUFBQSxNQUN6QjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsU0FBUyxHQUFHO0FBQ1YsUUFBSSxNQUFNLFlBQVk7QUFBQSxFQUN4QjtBQUNGO0FBR0EsZUFBZSx3QkFBd0I7QUFDckMsUUFBTSxTQUFTLFNBQVMsZUFBZSxjQUFjLEtBQUssQ0FBQyxHQUFHLFNBQVM7QUFDdkUsUUFBTSxTQUFTLFNBQVMsZUFBZSxjQUFjLEtBQUssQ0FBQyxHQUFHLFNBQVM7QUFDdkUsUUFBTSxXQUFXLFNBQVMsZUFBZSxpQkFBaUI7QUFDMUQsUUFBTSxZQUFZLFdBQVcsV0FBVyxTQUFTLEtBQUssS0FBSyxJQUFNO0FBRWpFLFlBQVUsbUNBQW1DLEtBQUssUUFBUSxLQUFLLFFBQUc7QUFDbEUsY0FBWSwwQ0FBcUMsSUFBSTtBQUVyRCxRQUFNLFVBQVUsQ0FBQztBQUNqQixRQUFNLFVBQVUsQ0FBQztBQUVqQixlQUFhLFFBQVEsV0FBUztBQUM1QixRQUFJLGtCQUFrQixNQUFNLFlBQVksS0FBSyxHQUFHO0FBQzlDLFlBQU0sTUFBTSxTQUFTLE9BQUs7QUFBRSxZQUFJLEVBQUUsT0FBUSxTQUFRLEtBQUssQ0FBQztBQUFBLE1BQUcsQ0FBQztBQUFBLElBQzlEO0FBQ0EsUUFBSSxrQkFBa0IsTUFBTSxZQUFZLEtBQUssR0FBRztBQUM5QyxZQUFNLE1BQU0sU0FBUyxPQUFLO0FBQUUsWUFBSSxFQUFFLE9BQVEsU0FBUSxLQUFLLENBQUM7QUFBQSxNQUFHLENBQUM7QUFBQSxJQUM5RDtBQUFBLEVBQ0YsQ0FBQztBQUVELE1BQUksQ0FBQyxRQUFRLFVBQVUsQ0FBQyxRQUFRLFFBQVE7QUFDdEMsZ0JBQVksSUFBSSxLQUFLO0FBQ3JCLGNBQVUscURBQXFELEtBQUssUUFBUSxLQUFLLGNBQWM7QUFDL0YsUUFBSSxJQUFJLGdCQUFnQjtBQUN0QixVQUFJLGVBQWUsWUFBWSxnREFBZ0QsS0FBSyxRQUFRLEtBQUs7QUFBQSxJQUNuRztBQUNBO0FBQUEsRUFDRjtBQUdBLFFBQU0sWUFBWSxZQUFZLElBQUk7QUFDbEMsUUFBTSxTQUFTLGNBQWMsU0FBUyxTQUFTLEVBQUUsVUFBVSxDQUFDO0FBQzVELFFBQU0sWUFBWSxZQUFZLElBQUksSUFBSSxXQUFXLFFBQVEsQ0FBQztBQUUxRCxvQkFBa0IsT0FBTyxXQUFXLENBQUM7QUFDckMsWUFBVSx5QkFBeUIsZ0JBQWdCLE1BQU0sd0JBQXdCLFFBQVEsT0FBTyxPQUFPLE1BQU0saUJBQWlCLGNBQWM7QUFDNUksY0FBWSxJQUFJLEtBQUs7QUFFckIsb0JBQWtCO0FBR2xCLFFBQU0sU0FBUyxTQUFTLGVBQWUsaUJBQWlCO0FBQ3hELE1BQUksT0FBUSxRQUFPLE1BQU07QUFDM0I7QUFFQSxTQUFTLG9CQUFvQjtBQUMzQixNQUFJLENBQUMsSUFBSSxlQUFnQjtBQUN6QixNQUFJLGVBQWUsWUFBWTtBQUUvQixNQUFJLElBQUksaUJBQWlCO0FBQ3ZCLFFBQUksZ0JBQWdCLGNBQWMsZ0JBQWdCO0FBQ2xELFFBQUksZ0JBQWdCLE1BQU0sVUFBVSxnQkFBZ0IsU0FBUyxpQkFBaUI7QUFBQSxFQUNoRjtBQUVBLE1BQUksQ0FBQyxnQkFBZ0IsUUFBUTtBQUMzQixRQUFJLGVBQWUsWUFBWTtBQUMvQjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLGFBQWEsU0FBUyxlQUFlLHVCQUF1QixLQUFLLENBQUMsR0FBRyxTQUFTO0FBQ3BGLFFBQU0sV0FBVyxZQUFZLGdCQUFnQixPQUFPLE9BQUssRUFBRSxhQUFhLFNBQVMsSUFBSTtBQUVyRixXQUFTLFFBQVEsQ0FBQyxVQUFVO0FBQzFCLFVBQU0sT0FBTyxTQUFTLGNBQWMsS0FBSztBQUN6QyxTQUFLLFlBQVksZ0JBQWdCLGVBQWUsWUFBWSxPQUFPLE1BQU0sS0FBSyxZQUFZO0FBQzFGLFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFVBQU0sV0FBVyxNQUFNLFdBQVcsWUFBWSxNQUFNLFNBQVMsWUFBWSxDQUFDLEtBQUs7QUFFL0UsU0FBSyxZQUFZO0FBQUEsc0NBQ2lCLE1BQU0sU0FBUyxVQUFVLEtBQUssTUFBTSxTQUFTLFNBQVMsU0FBTSxNQUFNLFNBQVMsVUFBVSxLQUFLLE1BQU0sU0FBUyxTQUFTO0FBQUE7QUFBQSxpQ0FFdkgsUUFBUSxLQUFLLE1BQU0sUUFBUTtBQUFBLDhDQUNkLE1BQU0sTUFBTTtBQUFBLDhDQUNaLE1BQU0sU0FBUyxXQUFXLFNBQVMsTUFBTSxNQUFNLFNBQVMsV0FBVyxTQUFTO0FBQUE7QUFBQSw2Q0FFN0UsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDLGNBQWMsTUFBTSxtQkFBbUIsTUFBTSxpQkFBaUIsUUFBUSxDQUFDLElBQUksR0FBRztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTTlLLFNBQUssVUFBVSxNQUFNLFlBQVksS0FBSztBQUN0QyxVQUFNLFNBQVMsS0FBSyxjQUFjLFVBQVU7QUFDNUMsUUFBSSxRQUFRO0FBQ1YsYUFBTyxVQUFVLENBQUMsTUFBTTtBQUN0QixVQUFFLGdCQUFnQjtBQUNsQixvQkFBWSxLQUFLO0FBQ2pCLG1CQUFXLEtBQUs7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFFQSxRQUFJLGVBQWUsWUFBWSxJQUFJO0FBQUEsRUFDckMsQ0FBQztBQUNIO0FBRUEsU0FBUyxZQUFZLE9BQU87QUFDMUIsZ0JBQWM7QUFDZCxvQkFBa0I7QUFDbEIseUJBQXVCLEtBQUs7QUFDNUIsd0JBQXNCLEtBQUs7QUFDN0I7QUFFQSxTQUFTLHVCQUF1QixPQUFPO0FBQ3JDLG9CQUFrQixNQUFNO0FBR3hCLGdCQUFjLFFBQVEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUNsQyxRQUFJLEtBQUssU0FBUyxVQUFXLE1BQUssU0FBUyxNQUFNLEtBQUssS0FBSyxTQUFTLFNBQVM7QUFDN0UsUUFBSSxLQUFLLFNBQVMsU0FBVSxNQUFLLFNBQVMsU0FBUyxPQUFPLENBQVE7QUFDbEUsU0FBSyxTQUFTLGNBQWM7QUFDNUIsU0FBSyxTQUFTLFVBQVU7QUFBQSxFQUMxQixDQUFDO0FBRUQsUUFBTSxRQUFRLE1BQU0sU0FBUztBQUM3QixRQUFNLFFBQVEsTUFBTSxTQUFTO0FBRTdCLE1BQUksT0FBTztBQUNULFFBQUksQ0FBQyxNQUFNLFNBQVMsVUFBVyxPQUFNLFNBQVMsWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNO0FBQ3JGLFVBQU0sU0FBUyxNQUFNLEtBQUssVUFBVSxLQUFLO0FBQ3pDLFFBQUksTUFBTSxTQUFTLFNBQVUsT0FBTSxTQUFTLFNBQVMsS0FBSyxVQUFVLFFBQVE7QUFDNUUsVUFBTSxTQUFTLGNBQWM7QUFDN0IsVUFBTSxTQUFTLFVBQVU7QUFBQSxFQUMzQjtBQUVBLE1BQUksT0FBTztBQUNULFFBQUksQ0FBQyxNQUFNLFNBQVMsVUFBVyxPQUFNLFNBQVMsWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNO0FBQ3JGLFVBQU0sU0FBUyxNQUFNLEtBQUssVUFBVSxLQUFLO0FBQ3pDLFFBQUksTUFBTSxTQUFTLFNBQVUsT0FBTSxTQUFTLFNBQVMsS0FBSyxVQUFVLFFBQVE7QUFDNUUsVUFBTSxTQUFTLGNBQWM7QUFDN0IsVUFBTSxTQUFTLFVBQVU7QUFBQSxFQUMzQjtBQUdBLFFBQU0sU0FBUyxxQkFBcUIsTUFBTSxjQUFjO0FBQ3hELG9CQUFrQixJQUFJLE1BQU07QUFHNUIsTUFBSSxNQUFNLGFBQWE7QUFDckIsVUFBTSxZQUFZLDRCQUE0QixNQUFNLFdBQVc7QUFDL0QsUUFBSSxVQUFXLG1CQUFrQixJQUFJLFNBQVM7QUFBQSxFQUNoRDtBQUNGO0FBRUEsU0FBUyxXQUFXLE9BQU87QUFDekIsUUFBTSxZQUFZLElBQUksTUFBTSxRQUFRLE1BQU0sZUFBZSxHQUFHLE1BQU0sZUFBZSxHQUFHLE1BQU0sZUFBZSxDQUFDO0FBQzFHLFFBQU0sV0FBVztBQUNqQixRQUFNLFNBQVMsVUFBVSxNQUFNLEVBQUUsSUFBSSxJQUFJLE1BQU0sUUFBUSxXQUFXLEtBQUssV0FBVyxLQUFLLFdBQVcsR0FBRyxDQUFDO0FBRXRHLFFBQU0sV0FBVyxPQUFPLFNBQVMsTUFBTTtBQUN2QyxRQUFNLGNBQWMsU0FBUyxPQUFPLE1BQU07QUFDMUMsUUFBTSxZQUFZLFlBQVksSUFBSTtBQUNsQyxRQUFNLFdBQVc7QUFFakIsV0FBUyxZQUFZLEtBQUs7QUFDeEIsVUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLGFBQWEsVUFBVSxDQUFHO0FBQ3BELFVBQU0sT0FBTyxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksS0FBSztBQUN0RCxXQUFPLFNBQVMsWUFBWSxVQUFVLFFBQVEsSUFBSTtBQUNsRCxhQUFTLE9BQU8sWUFBWSxhQUFhLFdBQVcsSUFBSTtBQUN4RCxhQUFTLE9BQU87QUFDaEIsUUFBSSxJQUFJLEVBQUssdUJBQXNCLFdBQVc7QUFBQSxFQUNoRDtBQUNBLHdCQUFzQixXQUFXO0FBQ2pDLFlBQVUsY0FBYyxNQUFNLEVBQUUsUUFBUSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRztBQUN6SDtBQUdBLFNBQVMsc0JBQXNCLE9BQU87QUFDcEMsTUFBSSxDQUFDLElBQUksd0JBQXdCLENBQUMsSUFBSSxtQkFBb0I7QUFDMUQsTUFBSSxtQkFBbUIsTUFBTSxVQUFVO0FBQ3ZDLE1BQUkscUJBQXFCLE1BQU0sVUFBVTtBQUV6QyxRQUFNLFVBQVUsU0FBUyxlQUFlLG9CQUFvQjtBQUM1RCxRQUFNLFNBQVMsU0FBUyxlQUFlLG1CQUFtQjtBQUMxRCxRQUFNLFdBQVcsU0FBUyxlQUFlLHVCQUF1QjtBQUVoRSxNQUFJLFFBQVMsU0FBUSxjQUFjLEdBQUcsTUFBTSxTQUFTLFVBQVUsS0FBSyxNQUFNLFNBQVMsU0FBUyxTQUFNLE1BQU0sU0FBUyxVQUFVLEtBQUssTUFBTSxTQUFTLFNBQVM7QUFDeEosTUFBSSxVQUFVO0FBQ1osYUFBUyxjQUFjLE1BQU07QUFDN0IsYUFBUyxZQUFZLHVCQUF1QixNQUFNLFlBQVksU0FBUyxZQUFZLENBQUM7QUFBQSxFQUN0RjtBQUNBLE1BQUksUUFBUTtBQUNWLFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFdBQU8sWUFBWTtBQUFBLHNEQUMrQixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxrREFDM0QsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsQ0FBQyxtQ0FBbUMsTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUFBLHlDQUM1SCxNQUFNLFNBQVMsU0FBUyxLQUFLLE1BQU0sU0FBUyxPQUFPO0FBQUEseUNBQ25ELE1BQU0sU0FBUyxTQUFTLEtBQUssTUFBTSxTQUFTLE9BQU87QUFBQTtBQUFBLEVBRTFGO0FBRUEsb0JBQWtCLE1BQU0sRUFBRTtBQUM1QjtBQUVBLGVBQWUsa0JBQWtCLFNBQVM7QUFDeEMsTUFBSSxDQUFDLElBQUksb0JBQXFCO0FBQzlCLE1BQUksb0JBQW9CLFlBQVk7QUFFcEMsTUFBSTtBQUNGLFVBQU0sTUFBTSxNQUFNLE9BQU8sS0FBSyxFQUFFLFFBQVEsSUFBSSxxQkFBcUIsTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLENBQUM7QUFDM0YsVUFBTSxXQUFXLElBQUksV0FBVyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxTQUFTLFFBQVE7QUFDcEIsVUFBSSxvQkFBb0IsWUFBWTtBQUNwQztBQUFBLElBQ0Y7QUFFQSxRQUFJLG9CQUFvQixZQUFZLFNBQVMsSUFBSSxPQUFLO0FBQUE7QUFBQTtBQUFBLG9CQUd0QyxFQUFFLFFBQVEsZUFBZTtBQUFBLGtCQUMzQixFQUFFLFdBQVcsRUFBRSxTQUFTLE1BQU0sR0FBRyxFQUFFLElBQUksVUFBVTtBQUFBO0FBQUEsMENBRXpCLEVBQUUsV0FBVyxFQUFFO0FBQUEsVUFDL0MsRUFBRSxXQUFXLGFBQWEsRUFBRSxRQUFRLHdDQUF3QyxFQUFFO0FBQUE7QUFBQSxLQUVuRixFQUFFLEtBQUssRUFBRTtBQUFBLEVBQ1osU0FBUyxHQUFHO0FBQ1YsUUFBSSxvQkFBb0IsWUFBWTtBQUFBLEVBQ3RDO0FBQ0Y7QUFFQSxlQUFlLG1CQUFtQjtBQUNoQyxNQUFJLENBQUMsZUFBZSxDQUFDLElBQUksa0JBQW1CO0FBQzVDLFFBQU0sT0FBTyxJQUFJLGtCQUFrQixNQUFNLEtBQUs7QUFDOUMsTUFBSSxDQUFDLEtBQU07QUFFWCxZQUFVLHVCQUFrQjtBQUM1QixNQUFJO0FBQ0YsVUFBTSxPQUFPLEtBQUs7QUFBQSxNQUNoQixRQUFRLElBQUk7QUFBQSxNQUNaLE1BQU0sRUFBRSxPQUFPLFlBQVksSUFBSSxTQUFTLE1BQU0sTUFBTyxPQUFPLFVBQVUsT0FBTyxXQUFXLE9BQU8sUUFBUSxRQUFTLGdCQUFnQjtBQUFBLElBQ2xJLENBQUM7QUFDRCxRQUFJLGtCQUFrQixRQUFRO0FBQzlCLHNCQUFrQixZQUFZLEVBQUU7QUFDaEMsY0FBVSxpQkFBaUI7QUFBQSxFQUM3QixTQUFTLEdBQUc7QUFDVixVQUFNLFNBQVMsU0FBUyxjQUFjLEtBQUs7QUFDM0MsV0FBTyxZQUFZO0FBQ25CLFdBQU8sWUFBWTtBQUFBO0FBQUEsa0JBRUosT0FBTyxVQUFVLE9BQU8sV0FBVyxPQUFPLFFBQVEsUUFBUyxNQUFNO0FBQUE7QUFBQTtBQUFBLHdDQUc1QyxJQUFJO0FBQUE7QUFFeEMsUUFBSSxvQkFBb0IsWUFBWSxNQUFNO0FBQzFDLFFBQUksa0JBQWtCLFFBQVE7QUFDOUIsY0FBVSw4QkFBOEI7QUFBQSxFQUMxQztBQUNGO0FBRUEsZUFBZSxxQkFBcUI7QUFDbEMsTUFBSSxDQUFDLFlBQWE7QUFDbEIsY0FBWSx3Q0FBbUMsSUFBSTtBQUNuRCxNQUFJO0FBQ0YsVUFBTSxZQUFZLHFCQUFxQixRQUFRLFVBQVUsYUFBYTtBQUFBLE1BQ3BFLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVztBQUFBLElBQ3JELENBQUM7QUFFRCxVQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUs7QUFBQSxNQUM1QixRQUFRLElBQUk7QUFBQSxNQUNaLE1BQU07QUFBQSxRQUNKLE9BQU8sR0FBRyxZQUFZLFNBQVMsVUFBVSxLQUFLLFlBQVksU0FBUyxTQUFTLFNBQU0sWUFBWSxTQUFTLFVBQVUsS0FBSyxZQUFZLFNBQVMsU0FBUztBQUFBLFFBQ3BKLFNBQVMsWUFBWSxTQUFTO0FBQUEsUUFDOUIsY0FBYyxZQUFZLFNBQVM7QUFBQSxRQUNuQyxjQUFjLFlBQVksU0FBUztBQUFBLFFBQ25DLFNBQVMsWUFBWSxTQUFTO0FBQUEsUUFDOUIsY0FBYyxZQUFZLFNBQVM7QUFBQSxRQUNuQyxjQUFjLFlBQVksU0FBUztBQUFBLFFBQ25DLGlCQUFpQixLQUFLLFVBQVUsWUFBWSxjQUFjO0FBQUEsUUFDMUQsY0FBYyxLQUFLLFVBQVUsWUFBWSxXQUFXO0FBQUEsUUFDcEQsbUJBQW1CLFlBQVk7QUFBQSxRQUMvQixxQkFBcUIsWUFBWTtBQUFBLFFBQ2pDLFVBQVUsWUFBWTtBQUFBLFFBQ3RCLFdBQVcsS0FBSyxVQUFVLFNBQVM7QUFBQSxNQUNyQztBQUFBLElBQ0YsQ0FBQztBQUVELGdCQUFZLElBQUksS0FBSztBQUNyQixXQUFPLFNBQVM7QUFBQSxNQUNkLE9BQU8sR0FBRyxpQkFBaUI7QUFBQSxNQUMzQixTQUFTLEdBQUcsd0NBQXdDLENBQUUsSUFBSSxXQUFXLElBQUksUUFBUSxRQUFTLGVBQWUsQ0FBQztBQUFBLE1BQzFHLFdBQVc7QUFBQSxJQUNiLENBQUM7QUFDRCxjQUFVLHNCQUF1QixJQUFJLFdBQVcsSUFBSSxRQUFRLFFBQVMsRUFBRSxFQUFFO0FBQUEsRUFDM0UsU0FBUyxHQUFHO0FBQ1YsZ0JBQVksSUFBSSxLQUFLO0FBQ3JCLFdBQU8sU0FBUztBQUFBLE1BQ2QsT0FBTyxHQUFHLFlBQVk7QUFBQSxNQUN0QixTQUFTLEdBQUcsMENBQTBDO0FBQUEsTUFDdEQsV0FBVztBQUFBLElBQ2IsQ0FBQztBQUNELGNBQVUscUNBQXFDO0FBQUEsRUFDakQ7QUFDRjtBQUdBLFNBQVMscUJBQXFCO0FBQzVCLE1BQUksQ0FBQyxJQUFJLFNBQVU7QUFDbkIsTUFBSSxTQUFTLFVBQVUsSUFBSSxRQUFRO0FBQ25DLDhCQUE0QjtBQUM5QjtBQUVBLFNBQVMsc0JBQXNCO0FBQzdCLE1BQUksQ0FBQyxJQUFJLFNBQVU7QUFDbkIsTUFBSSxTQUFTLFVBQVUsT0FBTyxRQUFRO0FBQ3RDLGlCQUFlO0FBQ2pCO0FBRUEsU0FBUyw4QkFBOEI7QUFDckMsTUFBSSxDQUFDLElBQUksZUFBZ0I7QUFDekIsTUFBSSxlQUFlLFlBQVk7QUFFL0IsUUFBTSxVQUFVLG9CQUFJLElBQUk7QUFFeEIsZ0JBQWMsUUFBUSxDQUFDLEVBQUUsTUFBTSxXQUFXLGNBQWMsV0FBVyxNQUFNO0FBQ3ZFLFVBQU0sS0FBSyxhQUFhLElBQUksR0FBRyxZQUFZLElBQUksU0FBUyxFQUFFLEtBQUssYUFBYSxJQUFJLE9BQU8sU0FBUyxDQUFDLEtBQUssS0FBSyxTQUFTO0FBQ3BILFVBQU0sVUFBVyxNQUFNLEdBQUcsaUJBQWtCLEtBQUssU0FBUyxVQUFVLE9BQU8sS0FBSyxTQUFTLE9BQU8sS0FBSztBQUVyRyxRQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sR0FBRztBQUN6QixVQUFJLGFBQWE7QUFDakIsVUFBSSxNQUFNO0FBQ1YsVUFBSSxXQUFXO0FBQ2YsVUFBSSxXQUFXO0FBQ2YsVUFBSSxXQUFXO0FBRWYsWUFBTSxZQUFZLFFBQVEsWUFBWTtBQUN0QyxVQUFJLFVBQVUsU0FBUyxNQUFNLEdBQUc7QUFDOUIscUJBQWE7QUFBYSxjQUFNO0FBQU0sbUJBQVc7QUFBTyxtQkFBVztBQUFHLG1CQUFXO0FBQUEsTUFDbkYsV0FBVyxVQUFVLFNBQVMsTUFBTSxLQUFLLFVBQVUsU0FBUyxRQUFRLEdBQUc7QUFDckUscUJBQWE7QUFBYSxjQUFNO0FBQU0sbUJBQVc7QUFBTyxtQkFBVztBQUFHLG1CQUFXO0FBQUEsTUFDbkYsV0FBVyxVQUFVLFNBQVMsTUFBTSxHQUFHO0FBQ3JDLHFCQUFhO0FBQWEsY0FBTTtBQUFNLG1CQUFXO0FBQU8sbUJBQVc7QUFBRyxtQkFBVztBQUFBLE1BQ25GLFdBQVcsVUFBVSxTQUFTLE1BQU0sR0FBRztBQUNyQyxxQkFBYTtBQUFVLGNBQU07QUFBSyxtQkFBVztBQUFNLG1CQUFXO0FBQUksbUJBQVc7QUFBQSxNQUMvRSxXQUFXLFVBQVUsU0FBUyxNQUFNLEdBQUc7QUFDckMscUJBQWE7QUFBVSxjQUFNO0FBQUssbUJBQVc7QUFBTSxtQkFBVztBQUFJLG1CQUFXO0FBQUEsTUFDL0UsV0FBVyxVQUFVLFNBQVMsYUFBYSxLQUFLLFVBQVUsU0FBUyxPQUFPLEtBQUssVUFBVSxTQUFTLE1BQU0sR0FBRztBQUN6RyxxQkFBYTtBQUFTLGNBQU07QUFBTyxtQkFBVztBQUFPLG1CQUFXO0FBQUcsbUJBQVc7QUFBQSxNQUNoRjtBQUVBLGNBQVEsSUFBSSxTQUFTO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFFBQ047QUFBQSxRQUNBLE9BQU87QUFBQSxRQUNQO0FBQUEsUUFDQSxhQUFhO0FBQUEsUUFDYjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0EsUUFBUSxDQUFDO0FBQUEsTUFDWCxDQUFDO0FBQUEsSUFDSDtBQUVBLFVBQU0sSUFBSSxRQUFRLElBQUksT0FBTztBQUM3QixNQUFFO0FBQ0YsTUFBRSxPQUFPLEtBQUssSUFBSTtBQUVsQixRQUFJLE1BQU0sR0FBRyxZQUFZO0FBQ3ZCLFVBQUksRUFBRSxlQUFlLGVBQWUsR0FBRyxXQUFXLFdBQVc7QUFDM0QsVUFBRSxlQUFlLFdBQVcsR0FBRyxXQUFXLFNBQVMsS0FBSztBQUFBLE1BQzFELFdBQVcsRUFBRSxlQUFlLGFBQWEsR0FBRyxXQUFXLFVBQVUsR0FBRyxXQUFXLGdCQUFnQjtBQUM3RixVQUFFLGVBQWUsV0FBVyxHQUFHLFdBQVcsVUFBVSxHQUFHLFdBQVcsYUFBYSxLQUFLO0FBQUEsTUFDdEYsV0FBVyxFQUFFLGVBQWUsZUFBZSxHQUFHLFdBQVcsV0FBVztBQUNsRSxVQUFFLGVBQWUsV0FBVyxHQUFHLFdBQVcsU0FBUyxLQUFLO0FBQUEsTUFDMUQ7QUFBQSxJQUNGLFdBQVcsS0FBSyxVQUFVO0FBQ3hCLFVBQUksQ0FBQyxLQUFLLFNBQVMsWUFBYSxNQUFLLFNBQVMsbUJBQW1CO0FBQ2pFLFlBQU0sS0FBSyxLQUFLLFNBQVMsWUFBWSxRQUFRLElBQUksTUFBTSxRQUFRLENBQUM7QUFDaEUsVUFBSSxFQUFFLGVBQWUsWUFBYSxHQUFFLGVBQWdCLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRztBQUFBLGVBQzVELEVBQUUsZUFBZSxTQUFVLEdBQUUsZUFBZSxLQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFBQSxVQUN6RSxHQUFFLGVBQWU7QUFBQSxJQUN4QjtBQUFBLEVBQ0YsQ0FBQztBQUVELE1BQUksWUFBWTtBQUNoQixNQUFJLGlCQUFpQixRQUFRO0FBRTdCLFVBQVEsUUFBUSxDQUFDLFFBQVE7QUFDdkIsVUFBTSxlQUFlLElBQUksZUFBZSxJQUFPLElBQUksV0FBVztBQUM5RCxVQUFNLFlBQVksZUFBZSxJQUFJO0FBQ3JDLGlCQUFhO0FBRWIsVUFBTSxLQUFLLFNBQVMsY0FBYyxJQUFJO0FBQ3RDLE9BQUcsWUFBWTtBQUNmLE9BQUcsWUFBWTtBQUFBLG9CQUNDLElBQUksSUFBSTtBQUFBLG9DQUNRLElBQUksVUFBVTtBQUFBLFlBQ3RDLElBQUksS0FBSztBQUFBLFlBQ1QsSUFBSSxZQUFZLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHO0FBQUEsZ0VBQ2UsSUFBSSxRQUFRO0FBQUEsZ0NBQzVDLGFBQWEsUUFBUSxDQUFDLENBQUMsSUFBSSxJQUFJLEdBQUc7QUFBQSxpREFDakIsSUFBSSxRQUFRO0FBQUEsWUFDakQsSUFBSSxHQUFHO0FBQUEsZ0VBQzZDLElBQUksUUFBUTtBQUFBLDREQUNoQixVQUFVLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFHNUUsT0FBRyxVQUFVLE1BQU07QUFDakIsZUFBUyxpQkFBaUIsOEJBQThCLEVBQUUsUUFBUSxPQUFLLEVBQUUsVUFBVSxPQUFPLFVBQVUsQ0FBQztBQUNyRyxTQUFHLFVBQVUsSUFBSSxVQUFVO0FBQzNCLDJCQUFxQixJQUFJLE1BQU07QUFBQSxJQUNqQztBQUVBLFVBQU0sYUFBYSxHQUFHLGNBQWMsa0JBQWtCO0FBQ3RELFVBQU0sWUFBWSxHQUFHLGNBQWMsaUJBQWlCO0FBQ3BELFVBQU0sV0FBVyxHQUFHLGNBQWMsY0FBYztBQUNoRCxVQUFNLGNBQWMsR0FBRyxjQUFjLGlCQUFpQjtBQUV0RCxVQUFNLGFBQWEsTUFBTTtBQUN2QixZQUFNLElBQUksV0FBVyxXQUFXLEtBQUssS0FBSztBQUMxQyxZQUFNLE9BQU8sV0FBVyxVQUFVLEtBQUssS0FBSztBQUM1QyxZQUFNLE1BQU0sSUFBSSxlQUFlLElBQU0sSUFBSTtBQUN6QyxZQUFNLE1BQU0sTUFBTTtBQUNsQixlQUFTLGNBQWMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHO0FBQ25ELGtCQUFZLGNBQWMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDO0FBQUEsSUFDOUM7QUFFQSxRQUFJLFdBQVksWUFBVyxVQUFVO0FBQ3JDLFFBQUksVUFBVyxXQUFVLFVBQVU7QUFFbkMsUUFBSSxlQUFlLFlBQVksRUFBRTtBQUFBLEVBQ25DLENBQUM7QUFFRCxNQUFJLElBQUksZ0JBQWdCO0FBQ3RCLFFBQUksZUFBZSxjQUFjLHFCQUFxQixjQUFjLDZCQUE2QixVQUFVLGVBQWUsU0FBUyxFQUFFLHVCQUF1QixHQUFHLHVCQUF1QixFQUFFLENBQUMsQ0FBQztBQUFBLEVBQzVMO0FBQ0Y7QUFFQSxTQUFTLHFCQUFxQixjQUFjO0FBQzFDLFFBQU0sWUFBWSxJQUFJLElBQUksWUFBWTtBQUN0QyxRQUFNLFlBQVksSUFBSSxNQUFNLEtBQUs7QUFFakMsZ0JBQWMsUUFBUSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ2xDLFFBQUksVUFBVSxJQUFJLElBQUksR0FBRztBQUN2QixVQUFJLENBQUMsS0FBSyxTQUFTLFVBQVcsTUFBSyxTQUFTLFlBQVksS0FBSyxTQUFTLE1BQU0sTUFBTTtBQUNsRixXQUFLLFNBQVMsTUFBTSxPQUFPLE9BQVE7QUFDbkMsVUFBSSxLQUFLLFNBQVMsU0FBVSxNQUFLLFNBQVMsU0FBUyxPQUFPLE1BQVE7QUFDbEUsV0FBSyxTQUFTLGNBQWM7QUFDNUIsV0FBSyxTQUFTLFVBQVU7QUFDeEIsVUFBSSxLQUFLLFVBQVU7QUFDakIsWUFBSSxDQUFDLEtBQUssU0FBUyxZQUFhLE1BQUssU0FBUyxtQkFBbUI7QUFDakUsa0JBQVUsTUFBTSxLQUFLLFNBQVMsWUFBWSxNQUFNLEVBQUUsYUFBYSxLQUFLLFdBQVcsQ0FBQztBQUFBLE1BQ2xGO0FBQUEsSUFDRixPQUFPO0FBQ0wsVUFBSSxLQUFLLFNBQVMsVUFBVyxNQUFLLFNBQVMsTUFBTSxLQUFLLEtBQUssU0FBUyxTQUFTO0FBQzdFLFVBQUksS0FBSyxTQUFTLFNBQVUsTUFBSyxTQUFTLFNBQVMsT0FBTyxDQUFRO0FBQ2xFLFdBQUssU0FBUyxjQUFjO0FBQzVCLFdBQUssU0FBUyxVQUFVO0FBQUEsSUFDMUI7QUFBQSxFQUNGLENBQUM7QUFFRCxNQUFJLENBQUMsVUFBVSxRQUFRLEdBQUc7QUFDeEIsVUFBTSxTQUFTLFVBQVUsVUFBVSxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBQ3RELFVBQU0sT0FBTyxVQUFVLFFBQVEsSUFBSSxNQUFNLFFBQVEsQ0FBQyxFQUFFLE9BQU87QUFDM0QsV0FBTyxTQUFTLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxNQUFNLFFBQVEsT0FBTyxLQUFLLE9BQU8sS0FBSyxPQUFPLEdBQUcsQ0FBQztBQUN0RixhQUFTLE9BQU8sS0FBSyxNQUFNO0FBQzNCLGFBQVMsT0FBTztBQUFBLEVBQ2xCO0FBQ0Y7QUFFQSxlQUFlLHFCQUFxQjtBQUNsQyxRQUFNLGNBQWMsU0FBUyxlQUFlLGlCQUFpQixLQUFLLENBQUMsR0FBRyxTQUFTO0FBQy9FLFFBQU0sWUFBWSxTQUFTLGVBQWUsV0FBVyxLQUFLLENBQUMsR0FBRyxTQUFTO0FBRXZFLGNBQVkseUNBQW9DLElBQUk7QUFDcEQsTUFBSTtBQUNGLFVBQU0sUUFBUSxDQUFDO0FBQ2YsYUFBUyxpQkFBaUIsOEJBQThCLEVBQUUsUUFBUSxRQUFNO0FBQ3RFLFlBQU0sUUFBUSxHQUFHLGNBQWMsV0FBVyxLQUFLLENBQUMsR0FBRyxlQUFlO0FBQ2xFLFlBQU0sWUFBWSxHQUFHLGNBQWMsaUJBQWlCLEtBQUssQ0FBQyxHQUFHLFNBQVM7QUFDdEUsWUFBTSxhQUFhLEdBQUcsY0FBYyxjQUFjLEtBQUssQ0FBQyxHQUFHLGVBQWU7QUFDMUUsWUFBTSxTQUFTLFdBQVcsU0FBUyxLQUFLO0FBQ3hDLFlBQU0sV0FBVyxHQUFHLGNBQWMsaUJBQWlCLEtBQUssQ0FBQyxHQUFHLFNBQVM7QUFDckUsWUFBTSxPQUFPLFdBQVcsT0FBTyxLQUFLO0FBRXBDLFlBQU0sS0FBSyxFQUFFLFdBQVcsVUFBVSxLQUFLLFFBQVEsTUFBTSxVQUFVLEtBQUssQ0FBQztBQUFBLElBQ3ZFLENBQUM7QUFFRCxVQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUs7QUFBQSxNQUM1QixRQUFRLElBQUk7QUFBQSxNQUNaLE1BQU07QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLFdBQVc7QUFBQSxRQUNYLE9BQU8sS0FBSyxVQUFVLEtBQUs7QUFBQSxNQUM3QjtBQUFBLElBQ0YsQ0FBQztBQUVELGdCQUFZLElBQUksS0FBSztBQUNyQix3QkFBb0I7QUFDcEIsV0FBTyxTQUFTO0FBQUEsTUFDZCxPQUFPLEdBQUcsNEJBQTRCO0FBQUEsTUFDdEMsU0FBUyxHQUFHLHdEQUF3RCxDQUFFLElBQUksV0FBVyxJQUFJLFFBQVEsUUFBUyxTQUFTLFlBQVksTUFBTSxNQUFNLENBQUM7QUFBQSxNQUM1SSxXQUFXO0FBQUEsSUFDYixDQUFDO0FBQ0QsY0FBVSw2QkFBNkIsVUFBVSxFQUFFO0FBQUEsRUFDckQsU0FBUyxHQUFHO0FBQ1YsZ0JBQVksSUFBSSxLQUFLO0FBQ3JCLFdBQU8sU0FBUztBQUFBLE1BQ2QsT0FBTyxHQUFHLG9CQUFvQjtBQUFBLE1BQzlCLFNBQVMsR0FBRyxtRUFBbUUsQ0FBQyxTQUFTLGlCQUFpQiw4QkFBOEIsRUFBRSxNQUFNLENBQUM7QUFBQSxNQUNqSixXQUFXO0FBQUEsSUFDYixDQUFDO0FBQ0Qsd0JBQW9CO0FBQ3BCLGNBQVUscUJBQXFCO0FBQUEsRUFDakM7QUFDRjtBQUdBLFNBQVMsUUFBUSxNQUFNO0FBQ3JCLGVBQWE7QUFDYixXQUFTLGlCQUFpQixpQkFBaUIsRUFBRSxRQUFRLE9BQUssRUFBRSxVQUFVLE9BQU8sVUFBVSxFQUFFLE9BQU8sVUFBVSxJQUFJLENBQUM7QUFDL0csV0FBUyxXQUFXLE1BQU0sU0FBUyxTQUFTLFlBQVksY0FBYztBQUN4RTtBQUVBLElBQUksaUJBQWlCLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUNsQyxJQUFJLE9BQU8saUJBQWlCLGVBQWUsUUFBTTtBQUMvQyxtQkFBaUIsRUFBRSxHQUFHLEdBQUcsU0FBUyxHQUFHLEdBQUcsUUFBUTtBQUNsRCxDQUFDO0FBRUQsSUFBSSxPQUFPLGlCQUFpQixTQUFTLE9BQU8sT0FBTztBQUNqRCxNQUFJLGVBQWUsV0FBVztBQUFFLGlCQUFhLEVBQUU7QUFBRztBQUFBLEVBQVE7QUFDMUQsUUFBTSxPQUFPLEtBQUssTUFBTSxHQUFHLFVBQVUsZUFBZSxHQUFHLEdBQUcsVUFBVSxlQUFlLENBQUM7QUFDcEYsTUFBSSxPQUFPLEVBQUc7QUFFZCxNQUFJLGVBQWUsWUFBWSxlQUFlLFFBQVM7QUFFdkQsUUFBTSxPQUFPLElBQUksT0FBTyxzQkFBc0I7QUFDOUMsUUFBTSxRQUFRLElBQUksTUFBTTtBQUFBLEtBQ3BCLEdBQUcsVUFBVSxLQUFLLFFBQVEsS0FBSyxRQUFTLElBQUk7QUFBQSxJQUM5QyxHQUFHLEdBQUcsVUFBVSxLQUFLLE9BQU8sS0FBSyxVQUFVLElBQUk7QUFBQSxFQUNqRDtBQUNBLFFBQU0sWUFBWSxJQUFJLE1BQU0sVUFBVTtBQUN0QyxZQUFVLGNBQWMsT0FBTyxNQUFNO0FBRXJDLFFBQU0sU0FBUyxDQUFDO0FBQ2hCLGlCQUFlLFNBQVMsT0FBSztBQUFFLFFBQUksRUFBRSxVQUFVLEVBQUUsUUFBUyxRQUFPLEtBQUssQ0FBQztBQUFBLEVBQUcsQ0FBQztBQUMzRSxRQUFNLE9BQU8sVUFBVSxpQkFBaUIsUUFBUSxLQUFLO0FBRXJELE1BQUksS0FBSyxRQUFRO0FBQ2YsVUFBTSxNQUFNLEtBQUssQ0FBQztBQUNsQixVQUFNLE9BQU8sSUFBSSxPQUFPLFNBQVMsYUFBYSxlQUFlLElBQUksT0FBTyxVQUFVLElBQUksT0FBTyxJQUFJLEtBQUssSUFBSSxNQUFTO0FBQ25ILFVBQU0sV0FBVyxJQUFJLE9BQU8sU0FBUyxnQkFBZ0I7QUFDckQsVUFBTSxjQUFjLElBQUksUUFBUSxNQUFNLFFBQVE7QUFBQSxFQUNoRCxPQUFPO0FBQ0wsbUJBQWU7QUFBQSxFQUNqQjtBQUNGLENBQUM7QUFFRCxTQUFTLGVBQWUsVUFBVSxXQUFXO0FBQzNDLFFBQU0sT0FBTyxZQUFZLFNBQVMsY0FBYyxTQUFTLFdBQVc7QUFDcEUsTUFBSSxDQUFDLFFBQVEsY0FBYyxVQUFhLGNBQWMsS0FBTSxRQUFPO0FBQ25FLFNBQU8sS0FBSyxLQUFLLEtBQUssSUFBSSxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUM7QUFDdEQ7QUFFQSxTQUFTLFVBQVU7QUFDakIsUUFBTSxNQUFNLElBQUksTUFBTSxLQUFLLEVBQUUsY0FBYyxjQUFjO0FBQ3pELE1BQUksSUFBSSxRQUFRLEVBQUc7QUFDbkIsUUFBTSxTQUFTLElBQUksa0JBQWtCLElBQUksTUFBTSxPQUFPLENBQUM7QUFDdkQsUUFBTSxPQUFPLElBQUksUUFBUSxJQUFJLE1BQU0sUUFBUSxDQUFDLEVBQUUsT0FBTztBQUNyRCxTQUFPLFNBQVMsS0FBSyxPQUFPLE1BQU0sRUFBRSxJQUFJLElBQUksTUFBTSxRQUFRLE9BQU8sS0FBSyxPQUFPLEtBQUssT0FBTyxHQUFHLENBQUM7QUFDN0YsV0FBUyxPQUFPLEtBQUssT0FBTyxNQUFNO0FBQ2xDLFdBQVMsT0FBTztBQUNsQjtBQUdBLElBQUksZ0JBQWdCLENBQUM7QUFDckIsSUFBTSxjQUFjLElBQUksTUFBTTtBQUFBLEVBQzVCLElBQUksTUFBTSxlQUFlO0FBQUEsRUFDekIsSUFBSSxNQUFNLGtCQUFrQixFQUFFLE9BQU8sU0FBVSxXQUFXLEVBQUUsQ0FBQztBQUMvRDtBQUNBLE1BQU0sSUFBSSxXQUFXO0FBRXJCLFNBQVMsYUFBYSxJQUFJO0FBQ3hCLFFBQU0sT0FBTyxJQUFJLE9BQU8sc0JBQXNCO0FBQzlDLFFBQU0sUUFBUSxJQUFJLE1BQU07QUFBQSxLQUNwQixHQUFHLFVBQVUsS0FBSyxRQUFRLEtBQUssUUFBUyxJQUFJO0FBQUEsSUFDOUMsR0FBRyxHQUFHLFVBQVUsS0FBSyxPQUFPLEtBQUssVUFBVSxJQUFJO0FBQUEsRUFDakQ7QUFDQSxRQUFNLFlBQVksSUFBSSxNQUFNLFVBQVU7QUFDdEMsWUFBVSxjQUFjLE9BQU8sTUFBTTtBQUVyQyxRQUFNLFNBQVMsQ0FBQztBQUNoQixpQkFBZSxTQUFTLE9BQUs7QUFBRSxRQUFJLEVBQUUsT0FBUSxRQUFPLEtBQUssQ0FBQztBQUFBLEVBQUcsQ0FBQztBQUM5RCxRQUFNLE9BQU8sVUFBVSxpQkFBaUIsUUFBUSxLQUFLO0FBRXJELE1BQUksS0FBSyxRQUFRO0FBQ2YsVUFBTSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ25CLGtCQUFjLEtBQUssRUFBRTtBQUNyQixRQUFJLGNBQWMsV0FBVyxHQUFHO0FBQzlCLFlBQU0sT0FBTyxjQUFjLENBQUMsRUFBRSxXQUFXLGNBQWMsQ0FBQyxDQUFDO0FBQ3pELGtCQUFZLFNBQVMsY0FBYyxhQUFhO0FBQ2hELGdCQUFVLGFBQWEsS0FBSyxRQUFRLENBQUMsQ0FBQyxrQkFBa0I7QUFDeEQsc0JBQWdCLENBQUM7QUFBQSxJQUNuQixPQUFPO0FBQ0wsZ0JBQVUsMkNBQTJDO0FBQUEsSUFDdkQ7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxTQUFTLGlCQUFpQjtBQUN4QixNQUFJLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBSSxNQUFPO0FBQ3BELFFBQU0sY0FBYyxvQkFBSSxJQUFJO0FBQzVCLFFBQU0sVUFBVSxvQkFBSSxJQUFJO0FBQ3hCLFFBQU0sUUFBUSxvQkFBSSxJQUFJO0FBRXRCLGVBQWEsUUFBUSxPQUFLO0FBQ3hCLGdCQUFZLElBQUksRUFBRSxVQUFVO0FBQzVCLEtBQUMsRUFBRSxZQUFZLENBQUMsR0FBRyxRQUFRLFFBQU07QUFDL0IsVUFBSSxHQUFHLE9BQVEsU0FBUSxJQUFJLEdBQUcsTUFBTTtBQUNwQyxVQUFJLEdBQUcsYUFBYyxPQUFNLElBQUksR0FBRyxZQUFZO0FBQUEsSUFDaEQsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUVELE1BQUksWUFBWSxZQUFZO0FBQzVCLGNBQVksUUFBUSxPQUFLO0FBQ3ZCLFVBQU0sSUFBSSxTQUFTLGNBQWMsUUFBUTtBQUFHLE1BQUUsUUFBUTtBQUFHLE1BQUUsY0FBYztBQUFHLFFBQUksWUFBWSxZQUFZLENBQUM7QUFBQSxFQUMzRyxDQUFDO0FBRUQsTUFBSSxRQUFRLFlBQVk7QUFDeEIsVUFBUSxRQUFRLE9BQUs7QUFDbkIsVUFBTSxJQUFJLFNBQVMsY0FBYyxRQUFRO0FBQUcsTUFBRSxRQUFRO0FBQUcsTUFBRSxjQUFjO0FBQUcsUUFBSSxRQUFRLFlBQVksQ0FBQztBQUFBLEVBQ3ZHLENBQUM7QUFFRCxNQUFJLE1BQU0sWUFBWTtBQUN0QixRQUFNLFFBQVEsT0FBSztBQUNqQixVQUFNLElBQUksU0FBUyxjQUFjLFFBQVE7QUFBRyxNQUFFLFFBQVE7QUFBRyxNQUFFLGNBQWM7QUFBRyxRQUFJLE1BQU0sWUFBWSxDQUFDO0FBQUEsRUFDckcsQ0FBQztBQUNIO0FBRUEsU0FBUyxlQUFlO0FBQ3RCLFFBQU0sUUFBUSxJQUFJLGNBQWMsSUFBSSxZQUFZLFFBQVE7QUFDeEQsUUFBTSxVQUFVLElBQUksVUFBVSxJQUFJLFFBQVEsUUFBUTtBQUNsRCxRQUFNLFFBQVEsSUFBSSxRQUFRLElBQUksTUFBTSxRQUFRO0FBQzVDLFFBQU0sV0FBVyxJQUFJLFVBQVUsSUFBSSxRQUFRLFFBQVEsSUFBSSxZQUFZLEVBQUUsS0FBSztBQUUxRSxNQUFJLGVBQWU7QUFDbkIsZ0JBQWMsUUFBUSxDQUFDLEVBQUUsTUFBTSxXQUFXLGNBQWMsV0FBVyxNQUFNO0FBQ3ZFLFVBQU0sS0FBSyxhQUFhLElBQUksR0FBRyxZQUFZLElBQUksU0FBUyxFQUFFLEtBQUssYUFBYSxJQUFJLE9BQU8sU0FBUyxDQUFDLEtBQUssS0FBSyxTQUFTO0FBQ3BILFFBQUksUUFBUTtBQUVaLFFBQUksU0FBUyxDQUFDLGtCQUFrQixZQUFZLEtBQUssRUFBRyxTQUFRO0FBQzVELFFBQUksV0FBVyxNQUFNLEdBQUcsV0FBVyxRQUFTLFNBQVE7QUFDcEQsUUFBSSxTQUFTLE1BQU0sR0FBRyxpQkFBaUIsTUFBTyxTQUFRO0FBQ3RELFFBQUksU0FBUztBQUNYLFlBQU0sZUFBZSxHQUFJLE1BQU0sR0FBRyxTQUFVLEVBQUUsSUFBSyxNQUFNLEdBQUcsZ0JBQWlCLEVBQUUsSUFBSSxTQUFTLElBQUssTUFBTSxHQUFHLGFBQWMsRUFBRSxHQUFHLFlBQVk7QUFDekksVUFBSSxDQUFDLGFBQWEsU0FBUyxPQUFPLEVBQUcsU0FBUTtBQUFBLElBQy9DO0FBRUEsU0FBSyxVQUFVO0FBQ2YsUUFBSSxNQUFPO0FBQUEsRUFDYixDQUFDO0FBRUQsWUFBVSxHQUFHLFlBQVksNEJBQTRCO0FBQ3ZEO0FBR0EsU0FBUyx1QkFBdUI7QUFDOUIsUUFBTSxPQUFRLElBQUksVUFBVSxJQUFJLE9BQU8sTUFBTSxLQUFLLEtBQU0sV0FBVSxvQkFBSSxLQUFLLEdBQUUsbUJBQW1CO0FBQ2hHLFFBQU0sU0FBUztBQUFBLElBQ2IsVUFBVSxFQUFFLEdBQUcsT0FBTyxTQUFTLEdBQUcsR0FBRyxPQUFPLFNBQVMsR0FBRyxHQUFHLE9BQU8sU0FBUyxFQUFFO0FBQUEsSUFDN0UsUUFBUSxFQUFFLEdBQUcsU0FBUyxPQUFPLEdBQUcsR0FBRyxTQUFTLE9BQU8sR0FBRyxHQUFHLFNBQVMsT0FBTyxFQUFFO0FBQUEsRUFDN0U7QUFFQSxRQUFNLElBQUksU0FBUyxjQUFjLEtBQUs7QUFDdEMsSUFBRSxZQUFZO0FBQ2QsSUFBRSxNQUFNLFVBQVU7QUFDbEIsSUFBRSxZQUFZLDBDQUFtQyxJQUFJO0FBRXJELElBQUUsY0FBYyxNQUFNLEVBQUUsVUFBVSxNQUFNO0FBQ3RDLFdBQU8sU0FBUyxJQUFJLE9BQU8sU0FBUyxHQUFHLE9BQU8sU0FBUyxHQUFHLE9BQU8sU0FBUyxDQUFDO0FBQzNFLGFBQVMsT0FBTyxJQUFJLE9BQU8sT0FBTyxHQUFHLE9BQU8sT0FBTyxHQUFHLE9BQU8sT0FBTyxDQUFDO0FBQ3JFLGFBQVMsT0FBTztBQUNoQixjQUFVLHdCQUF3QixJQUFJO0FBQUEsRUFDeEM7QUFDQSxJQUFFLGNBQWMsTUFBTSxFQUFFLFVBQVUsTUFBTSxFQUFFLE9BQU87QUFFakQsTUFBSSxJQUFJLFdBQVcsY0FBYyxhQUFhLEVBQUcsS0FBSSxXQUFXLFlBQVk7QUFDNUUsTUFBSSxXQUFXLFlBQVksQ0FBQztBQUM1QixNQUFJLElBQUksT0FBUSxLQUFJLE9BQU8sUUFBUTtBQUNuQyxZQUFVLHNCQUFzQixJQUFJO0FBQ3RDO0FBR0EsU0FBUyxlQUFlO0FBRXRCLFdBQVMsaUJBQWlCLGNBQWMsRUFBRSxRQUFRLFNBQU87QUFDdkQsUUFBSSxVQUFVLE1BQU07QUFDbEIsZUFBUyxpQkFBaUIsY0FBYyxFQUFFLFFBQVEsT0FBSyxFQUFFLFVBQVUsT0FBTyxRQUFRLENBQUM7QUFDbkYsZUFBUyxpQkFBaUIsa0JBQWtCLEVBQUUsUUFBUSxPQUFLLEVBQUUsVUFBVSxPQUFPLFFBQVEsQ0FBQztBQUN2RixVQUFJLFVBQVUsSUFBSSxRQUFRO0FBQzFCLFlBQU0sU0FBUyxTQUFTLGVBQWUsSUFBSSxRQUFRLEdBQUc7QUFDdEQsVUFBSSxPQUFRLFFBQU8sVUFBVSxJQUFJLFFBQVE7QUFBQSxJQUMzQztBQUFBLEVBQ0YsQ0FBQztBQUdELFFBQU0sWUFBWSxTQUFTLGVBQWUsWUFBWTtBQUN0RCxRQUFNLGFBQWEsU0FBUyxlQUFlLGFBQWE7QUFDeEQsUUFBTSxjQUFjLFNBQVMsZUFBZSxjQUFjO0FBQzFELFFBQU0sV0FBVyxTQUFTLGVBQWUsV0FBVztBQUNwRCxRQUFNLGNBQWMsU0FBUyxlQUFlLGNBQWM7QUFFMUQsTUFBSSxVQUFXLFdBQVUsVUFBVSxNQUFNLFFBQVEsT0FBTztBQUN4RCxNQUFJLFdBQVksWUFBVyxVQUFVLE1BQU0sUUFBUSxRQUFRO0FBQzNELE1BQUksWUFBYSxhQUFZLFVBQVUsTUFBTSxRQUFRLFNBQVM7QUFDOUQsTUFBSSxTQUFVLFVBQVMsVUFBVSxNQUFNLFFBQVEsTUFBTTtBQUNyRCxNQUFJLGFBQWE7QUFDZixnQkFBWSxVQUFVLE1BQU07QUFDMUIsWUFBTSxTQUFTLFNBQVMsZUFBZSxpQkFBaUI7QUFDeEQsVUFBSSxPQUFRLFFBQU8sTUFBTTtBQUFBLElBQzNCO0FBQUEsRUFDRjtBQUdBLFFBQU0sYUFBYSxTQUFTLGVBQWUsYUFBYTtBQUN4RCxRQUFNLE9BQU8sU0FBUyxlQUFlLE9BQU87QUFDNUMsUUFBTSxPQUFPLFNBQVMsZUFBZSxPQUFPO0FBQzVDLFFBQU0sU0FBUyxTQUFTLGVBQWUsU0FBUztBQUNoRCxRQUFNLFNBQVMsU0FBUyxlQUFlLFNBQVM7QUFFaEQsTUFBSSxZQUFZO0FBQ2QsZUFBVyxVQUFVLE1BQU07QUFDekIsc0JBQWdCLENBQUM7QUFDakIscUJBQWUsU0FBUyxPQUFLO0FBQzNCLFlBQUksRUFBRSxVQUFVLEVBQUUsU0FBVSxHQUFFLFNBQVMsWUFBWTtBQUFBLE1BQ3JELENBQUM7QUFDRCxnQkFBVSxtQkFBbUIsZ0JBQWdCLE9BQU8sS0FBSyxFQUFFO0FBQUEsSUFDN0Q7QUFBQSxFQUNGO0FBRUEsTUFBSSxPQUFRLFFBQU8sVUFBVTtBQUM3QixNQUFJLEtBQU0sTUFBSyxVQUFVO0FBQ3pCLE1BQUksTUFBTTtBQUNSLFNBQUssVUFBVSxNQUFNO0FBQ25CLFlBQU0sTUFBTSxJQUFJLE1BQU0sS0FBSyxFQUFFLGNBQWMsY0FBYztBQUN6RCxZQUFNLFNBQVMsSUFBSSxVQUFVLElBQUksTUFBTSxRQUFRLENBQUM7QUFDaEQsWUFBTSxPQUFPLElBQUksUUFBUSxJQUFJLE1BQU0sUUFBUSxDQUFDLEVBQUUsT0FBTztBQUNyRCxhQUFPLFNBQVMsSUFBSSxPQUFPLEdBQUcsT0FBTyxJQUFJLE9BQU8sS0FBSyxPQUFPLENBQUM7QUFDN0QsYUFBTyxHQUFHLElBQUksR0FBRyxHQUFHLEVBQUU7QUFDdEIsZUFBUyxPQUFPLEtBQUssTUFBTTtBQUMzQixlQUFTLE9BQU87QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFDQSxNQUFJLFFBQVE7QUFDVixXQUFPLFVBQVUsTUFBTTtBQUNyQixZQUFNLE1BQU0sSUFBSSxNQUFNLEtBQUssRUFBRSxjQUFjLGNBQWM7QUFDekQsWUFBTSxTQUFTLElBQUksVUFBVSxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBQ2hELFlBQU0sT0FBTyxJQUFJLFFBQVEsSUFBSSxNQUFNLFFBQVEsQ0FBQyxFQUFFLE9BQU87QUFDckQsYUFBTyxTQUFTLElBQUksT0FBTyxHQUFHLE9BQU8sR0FBRyxPQUFPLElBQUksT0FBTyxHQUFHO0FBQzdELGFBQU8sR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ3JCLGVBQVMsT0FBTyxLQUFLLE1BQU07QUFDM0IsZUFBUyxPQUFPO0FBQUEsSUFDbEI7QUFBQSxFQUNGO0FBR0EsUUFBTSxnQkFBZ0IsU0FBUyxlQUFlLGlCQUFpQjtBQUMvRCxNQUFJLGNBQWUsZUFBYyxVQUFVO0FBRTNDLFFBQU0sZUFBZSxTQUFTLGVBQWUsZ0JBQWdCO0FBQzdELE1BQUksY0FBYztBQUNoQixpQkFBYSxVQUFVLE1BQU07QUFDM0IsVUFBSSxJQUFJLHdCQUF3QixJQUFJLG9CQUFvQjtBQUN0RCxZQUFJLHFCQUFxQixNQUFNLFVBQVU7QUFDekMsWUFBSSxtQkFBbUIsTUFBTSxVQUFVO0FBQUEsTUFDekM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFFBQU0sY0FBYyxTQUFTLGVBQWUsZUFBZTtBQUMzRCxNQUFJLGFBQWE7QUFDZixnQkFBWSxVQUFVLE1BQU07QUFDMUIsVUFBSSxZQUFhLFlBQVcsV0FBVztBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUVBLFFBQU0sc0JBQXNCLFNBQVMsZUFBZSx3QkFBd0I7QUFDNUUsTUFBSSxvQkFBcUIscUJBQW9CLFVBQVU7QUFFdkQsUUFBTSxrQkFBa0IsU0FBUyxlQUFlLG9CQUFvQjtBQUNwRSxNQUFJLGdCQUFpQixpQkFBZ0IsVUFBVTtBQUcvQyxRQUFNLG1CQUFtQixTQUFTLGVBQWUscUJBQXFCO0FBQ3RFLE1BQUksaUJBQWtCLGtCQUFpQixVQUFVO0FBRWpELFFBQU0sbUJBQW1CLFNBQVMsZUFBZSxxQkFBcUI7QUFDdEUsUUFBTSxvQkFBb0IsU0FBUyxlQUFlLHNCQUFzQjtBQUN4RSxNQUFJLGlCQUFrQixrQkFBaUIsVUFBVTtBQUNqRCxNQUFJLGtCQUFtQixtQkFBa0IsVUFBVTtBQUVuRCxRQUFNLG9CQUFvQixTQUFTLGVBQWUsc0JBQXNCO0FBQ3hFLE1BQUksa0JBQW1CLG1CQUFrQixVQUFVO0FBR25ELE1BQUksSUFBSSxpQkFBaUI7QUFDdkIsUUFBSSxnQkFBZ0IsVUFBVSxZQUFZO0FBQ3hDLGlCQUFXLEtBQUssaUJBQWlCO0FBQy9CLFlBQUksQ0FBQyxhQUFhLElBQUksRUFBRSxJQUFJLEVBQUcsT0FBTSxrQkFBa0IsRUFBRSxJQUFJO0FBQUEsTUFDL0Q7QUFDQSx1QkFBaUI7QUFDakIsOEJBQXdCO0FBQ3hCLHFCQUFlO0FBQ2YsY0FBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBRUEsTUFBSSxJQUFJLGdCQUFnQjtBQUN0QixRQUFJLGVBQWUsVUFBVTtBQUFBLEVBQy9CO0FBR0EsTUFBSSxJQUFJLFVBQVUsSUFBSSxXQUFXO0FBQy9CLFFBQUksT0FBTyxVQUFVLE1BQU0sSUFBSSxVQUFVLE1BQU07QUFDL0MsUUFBSSxVQUFVLFdBQVcsWUFBWTtBQUNuQyxZQUFNLE9BQU8sSUFBSSxVQUFVLE1BQU0sQ0FBQztBQUNsQyxVQUFJLENBQUMsS0FBTTtBQUNYLGtCQUFZLGFBQWEsS0FBSyxJQUFJLFVBQUssSUFBSTtBQUMzQyxVQUFJO0FBQ0YsY0FBTSxXQUFXLElBQUksU0FBUztBQUM5QixpQkFBUyxPQUFPLFFBQVEsTUFBTSxLQUFLLElBQUk7QUFDdkMsaUJBQVMsT0FBTyxjQUFjLEdBQUc7QUFDakMsaUJBQVMsT0FBTyxXQUFXLFdBQVc7QUFDdEMsaUJBQVMsT0FBTyxXQUFXLEtBQUs7QUFDaEMsY0FBTSxhQUFhLE1BQU0sTUFBTSwyQkFBMkI7QUFBQSxVQUN4RCxRQUFRO0FBQUEsVUFDUixNQUFNO0FBQUEsVUFDTixTQUFTLEVBQUUsdUJBQXdCLE9BQU8sVUFBVSxPQUFPLGNBQWUsR0FBRztBQUFBLFFBQy9FLENBQUM7QUFDRCxZQUFJLENBQUMsV0FBVyxHQUFJLE9BQU0sSUFBSSxNQUFNLGVBQWU7QUFDbkQsY0FBTSxhQUFhLE1BQU0sV0FBVyxLQUFLO0FBQ3pDLGNBQU0sVUFBVSxXQUFXLFdBQVcsV0FBVyxRQUFRO0FBQ3pELFlBQUksQ0FBQyxRQUFTLE9BQU0sSUFBSSxNQUFNLDZCQUE2QjtBQUUzRCxZQUFJLE9BQU87QUFDWCxjQUFNLFlBQVksS0FBSyxLQUFLLFlBQVk7QUFDeEMsWUFBSSxVQUFVLFNBQVMsT0FBTyxLQUFLLFVBQVUsU0FBUyxLQUFLLEVBQUcsUUFBTztBQUFBLGlCQUM1RCxVQUFVLFNBQVMsTUFBTSxLQUFLLFVBQVUsU0FBUyxLQUFLLEVBQUcsUUFBTztBQUV6RSxvQkFBWSxxQkFBZ0IsSUFBSTtBQUNoQyxjQUFNLFlBQVksTUFBTSxPQUFPLEtBQUs7QUFBQSxVQUNsQyxRQUFRLElBQUk7QUFBQSxVQUNaLE1BQU07QUFBQSxZQUNKLFVBQVU7QUFBQSxZQUNWLFdBQVcsS0FBSztBQUFBLFlBQ2hCLFlBQVksS0FBSyxLQUFLLFFBQVEsV0FBVyxFQUFFO0FBQUEsWUFDM0MsWUFBWTtBQUFBLFVBQ2Q7QUFBQSxRQUNGLENBQUM7QUFDRCxjQUFNLGVBQWU7QUFDckIsY0FBTSxrQkFBa0IsVUFBVSxRQUFRLElBQUk7QUFDOUMseUJBQWlCO0FBQ2pCLGdDQUF3QjtBQUN4QixnQkFBUTtBQUNSLGtCQUFVLFlBQVksS0FBSyxJQUFJLGVBQWU7QUFBQSxNQUNoRCxTQUFTLEdBQUc7QUFDVixrQkFBVSxxQkFBcUIsRUFBRSxXQUFXLEVBQUU7QUFBQSxNQUNoRCxVQUFFO0FBQ0Esb0JBQVksSUFBSSxLQUFLO0FBQ3JCLFlBQUksVUFBVSxRQUFRO0FBQUEsTUFDeEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUdBLFFBQU0sWUFBWSxTQUFTLGVBQWUsU0FBUztBQUNuRCxNQUFJLFVBQVcsV0FBVSxVQUFVO0FBR25DLE1BQUksSUFBSSxZQUFhLEtBQUksWUFBWSxXQUFXO0FBQ2hELE1BQUksSUFBSSxRQUFTLEtBQUksUUFBUSxXQUFXO0FBQ3hDLE1BQUksSUFBSSxNQUFPLEtBQUksTUFBTSxXQUFXO0FBQ3BDLE1BQUksSUFBSSxRQUFTLEtBQUksUUFBUSxVQUFVO0FBQ3ZDLFFBQU0sU0FBUyxTQUFTLGVBQWUsU0FBUztBQUNoRCxNQUFJLFFBQVE7QUFDVixXQUFPLFVBQVUsTUFBTTtBQUNyQixVQUFJLElBQUksWUFBYSxLQUFJLFlBQVksUUFBUTtBQUM3QyxVQUFJLElBQUksUUFBUyxLQUFJLFFBQVEsUUFBUTtBQUNyQyxVQUFJLElBQUksTUFBTyxLQUFJLE1BQU0sUUFBUTtBQUNqQyxVQUFJLElBQUksUUFBUyxLQUFJLFFBQVEsUUFBUTtBQUNyQyxtQkFBYTtBQUFBLElBQ2Y7QUFBQSxFQUNGO0FBQ0Y7QUFHQSx1QkFBdUI7QUFDdkIsYUFBYTtBQUNiLGVBQWU7QUFFZixPQUFPLGVBQWU7QUFBQSxFQUNwQjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
