// frontend_src/bim_viewer_app.js
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
  generate_bom_from_bim: "construction_bim.bim.api.generate_bom_from_bim",
  get_initiation_status: "construction_bim.api.initiation.get_initiation_status",
  upload_intake_file: "construction_bim.api.initiation.upload_intake_file",
  parse_boq_file: "construction_bim.api.initiation.parse_boq_file",
  commit_boq_estimate: "construction_bim.api.initiation.commit_boq_estimate",
  download_boq_template: "construction_bim.api.initiation.download_boq_template",
  align_model_coordinates: "construction_bim.api.initiation.align_model_coordinates",
  approve_project_initiation: "construction_bim.api.initiation.approve_project_initiation",
  create_in_viewer_issue: "construction_bim.bim.api.create_in_viewer_issue"
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
var inFlightLoads = /* @__PURE__ */ new Map();
async function loadModelGeometry(modelDocName) {
  if (loadedModels.has(modelDocName)) {
    return loadedModels.get(modelDocName);
  }
  if (inFlightLoads.has(modelDocName)) {
    return inFlightLoads.get(modelDocName);
  }
  const promise = (async () => {
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
      const entry = {
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
      };
      loadedModels.set(modelDocName, entry);
      setStatus(`Loaded ${modelData.model_name} [${disc}]: ${sceneResult.meshCount.total} meshes, ${sceneResult.meshCount.tris} tris`);
      return entry;
    } catch (e) {
      console.error("Failed to load model geometry", e);
      setStatus(`Error loading ${modelDocName}: ${e.message || e}`);
    } finally {
      showLoading("", false);
      inFlightLoads.delete(modelDocName);
    }
  })();
  inFlightLoads.set(modelDocName, promise);
  return promise;
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
  renderSpatialHierarchyTree();
}
function renderSpatialHierarchyTree() {
  const treeEl = document.getElementById("bim-spatial-tree");
  if (!treeEl) return;
  if (!loadedModels.size) {
    treeEl.innerHTML = '<div class="empty-hint">Load models to view spatial hierarchy</div>';
    return;
  }
  treeEl.innerHTML = "";
  loadedModels.forEach((entry, modelDocName) => {
    const modelNode = document.createElement("div");
    modelNode.style.marginBottom = "6px";
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "6px";
    header.style.fontWeight = "600";
    header.style.color = "#e2e8f0";
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = entry.visible !== false;
    chk.onchange = () => {
      entry.visible = chk.checked;
      entry.group.visible = chk.checked;
    };
    header.appendChild(chk);
    header.appendChild(document.createTextNode(`\u{1F3E2} ${entry.modelName} [${entry.discipline}]`));
    modelNode.appendChild(header);
    const storeyMap = /* @__PURE__ */ new Map();
    (entry.elements || []).forEach((el) => {
      const st = el.storey || "Ground Level";
      if (!storeyMap.has(st)) storeyMap.set(st, []);
      storeyMap.get(st).push(el);
    });
    if (!storeyMap.size) storeyMap.set("Level 1", []);
    const childContainer = document.createElement("div");
    childContainer.style.paddingLeft = "18px";
    childContainer.style.marginTop = "3px";
    storeyMap.forEach((elems, storeyName) => {
      const stNode = document.createElement("div");
      stNode.style.display = "flex";
      stNode.style.alignItems = "center";
      stNode.style.gap = "4px";
      stNode.style.color = "#94a3b8";
      const stChk = document.createElement("input");
      stChk.type = "checkbox";
      stChk.checked = true;
      stChk.onchange = () => {
        elementMeshes.forEach(({ mesh, expressID, modelDocName: mName }) => {
          if (mName === modelDocName) {
            const el = elementIndex.get(`${mName}:${expressID}`);
            if (el && (el.storey || "Level 1") === storeyName) {
              mesh.visible = stChk.checked;
            }
          }
        });
      };
      stNode.appendChild(stChk);
      stNode.appendChild(document.createTextNode(`\u{1F4D0} ${storeyName}`));
      childContainer.appendChild(stNode);
    });
    modelNode.appendChild(childContainer);
    treeEl.appendChild(modelNode);
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
  if (modelParam && modelParam !== "none") {
    const modelNames = modelParam.split(",").map((s) => s.trim()).filter(Boolean);
    for (const m of modelNames) {
      if (!loadedModels.has(m)) {
        await loadModelGeometry(m);
      }
    }
    renderModelsList();
    updateElementMeshesList();
    if (typeof populateFacets === "function") populateFacets();
    fitView();
  } else if (projectParam && typeof availableModels !== "undefined" && availableModels.length) {
    const projModels = availableModels.filter((m) => m.project === projectParam);
    if (projModels.length > 0) {
      for (const m of projModels) {
        if (!loadedModels.has(m.name)) {
          await loadModelGeometry(m.name);
        }
      }
      renderModelsList();
      updateElementMeshesList();
      if (typeof populateFacets === "function") populateFacets();
      fitView();
    }
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
    const match = elementMeshes.find((item) => {
      const el = elementIndex.get(`${item.modelDocName}:${item.expressID}`) || elementIndex.get(String(item.expressID));
      const sid = el && el.stable_id || item.mesh && item.mesh.userData && (item.mesh.userData.guid || item.mesh.userData.stable_id);
      return sid && (sid === elemA || sid === elemB);
    });
    if (match) {
      selectElement(match.mesh, match.expressID, match.modelDocName);
    }
  }
  const projectParam = routeOpts.project || params.get("project");
  if (projectParam) {
    activeProject = projectParam;
  }
  const modeParam = routeOpts.mode || params.get("mode");
  if (modeParam === "coordination") {
    setAppMode("coordination");
  } else {
    setAppMode("initiation");
  }
}
var currentAppMode = "initiation";
var currentViewportTab = "3d";
var activeProject = null;
var initiationData = null;
var stagedBoqFileUrl = null;
var detectedDriftModels = [];
function setAppMode(mode) {
  currentAppMode = mode;
  const leftInit = document.getElementById("bim-left-initiation");
  const leftCoord = document.getElementById("bim-left-coordination");
  const rightInit = document.getElementById("bim-right-initiation");
  const rightCoord = document.getElementById("bim-right-coordination");
  const btnModeInit = document.getElementById("btn-mode-initiation");
  const btnModeCoord = document.getElementById("btn-mode-coordination");
  if (mode === "initiation") {
    if (leftInit) leftInit.style.display = "flex";
    if (leftCoord) leftCoord.style.display = "none";
    if (rightInit) rightInit.style.display = "flex";
    if (rightCoord) rightCoord.style.display = "none";
    if (btnModeInit) btnModeInit.classList.add("active");
    if (btnModeCoord) btnModeCoord.classList.remove("active");
    if (activeProject) refreshInitiationStatus();
  } else {
    if (leftInit) leftInit.style.display = "none";
    if (leftCoord) leftCoord.style.display = "flex";
    if (rightInit) rightInit.style.display = "none";
    if (rightCoord) rightCoord.style.display = "flex";
    if (btnModeInit) btnModeInit.classList.remove("active");
    if (btnModeCoord) btnModeCoord.classList.add("active");
  }
}
function setViewportTab(tab) {
  currentViewportTab = tab;
  const vpTabs = document.querySelectorAll(".bim-vp-tab");
  vpTabs.forEach((t) => {
    if (t.dataset.vp === tab) t.classList.add("active");
    else t.classList.remove("active");
  });
  const vp3d = document.getElementById("viewport-container-3d");
  const vpCad = document.getElementById("viewport-container-cad");
  const vpPdf = document.getElementById("viewport-container-pdf");
  if (vp3d) vp3d.style.display = tab === "3d" ? "block" : "none";
  if (vpCad) vpCad.style.display = tab === "cad" ? "block" : "none";
  if (vpPdf) vpPdf.style.display = tab === "pdf" ? "block" : "none";
  if (tab === "3d") {
    window.dispatchEvent(new Event("resize"));
  }
}
async function refreshInitiationStatus() {
  if (!activeProject) return;
  try {
    const res = await frappe.call({
      method: API.get_initiation_status,
      args: { project: activeProject }
    });
    if (!res || !res.message) return;
    initiationData = res.message;
    renderInitiationWorkspace(initiationData);
  } catch (e) {
    console.error("Failed to fetch initiation status:", e);
  }
}
function renderInitiationWorkspace(data) {
  const readiness = data.readiness || {};
  const gates = readiness.gates || [];
  const titleEl = document.getElementById("bim-project-title");
  if (titleEl) titleEl.textContent = data.project_name || data.project;
  const statusBadgeEl = document.getElementById("bim-project-status-badge");
  if (statusBadgeEl) {
    statusBadgeEl.textContent = data.project_status || "Initiating";
    statusBadgeEl.className = "bim-badge " + (data.project_status === "In Progress" ? "badge-validated" : "status-draft");
  }
  const badgeContract = document.getElementById("badge-contract");
  if (badgeContract) {
    const hasC = data.contract_count > 0 || readiness.contract_amount && readiness.contract_amount > 0;
    badgeContract.textContent = hasC ? "Validated" : "Pending";
    badgeContract.className = "bim-badge " + (hasC ? "badge-validated" : "badge-pending");
  }
  const badgeCad = document.getElementById("badge-cad");
  if (badgeCad) {
    const cadCount = data.cad_count || 0;
    badgeCad.textContent = `${cadCount} Sheets`;
    badgeCad.className = "bim-badge " + (cadCount > 0 ? "badge-validated" : "badge-pending");
  }
  const badgeModels = document.getElementById("badge-models");
  if (badgeModels) {
    const modelCount = (data.models || []).length;
    badgeModels.textContent = `${modelCount} Models`;
    badgeModels.className = "bim-badge " + (modelCount > 0 ? "badge-validated" : "badge-pending");
  }
  const badgeBoq = document.getElementById("badge-boq");
  if (badgeBoq) {
    const hasB = data.estimates && data.estimates.length > 0 || readiness.estimated_cost && readiness.estimated_cost > 0;
    badgeBoq.textContent = hasB ? "Baselined" : "Pending";
    badgeBoq.className = "bim-badge " + (hasB ? "badge-validated" : "badge-pending");
  }
  const progressLabel = document.getElementById("intake-progress-label");
  if (progressLabel) {
    const passedCount = gates.filter((g) => g.passed).length;
    progressLabel.textContent = `${passedCount}/4 Complete`;
  }
  const initModelsList = document.getElementById("bim-init-models");
  if (initModelsList && data.models) {
    if (!data.models.length) {
      initModelsList.innerHTML = '<div class="empty-hint">Drop IFC models above to load</div>';
    } else {
      initModelsList.innerHTML = data.models.map((m) => {
        const isLoaded = loadedModels.has(m.name);
        return `
          <div class="bim-model-item ${isLoaded ? "active" : ""}" data-model="${m.name}">
            <div class="model-title">
              <input type="checkbox" class="init-model-chk" data-model="${m.name}" ${isLoaded ? "checked" : ""} style="margin:0 4px 0 0" />
              <span>${m.model_name || m.name}</span>
            </div>
            <span class="discipline-tag tag-${(m.discipline || "arch").toLowerCase()}">${m.discipline || "Architecture"}</span>
          </div>
        `;
      }).join("");
      initModelsList.querySelectorAll(".init-model-chk").forEach((chk) => {
        chk.onchange = async (e) => {
          e.stopPropagation();
          const mName = chk.dataset.model;
          if (chk.checked) {
            await loadModelGeometry(mName);
          } else {
            unloadModel(mName);
          }
          renderModelsList();
          updateElementMeshesList();
          fitView();
        };
      });
    }
  }
  const metContractAmt = document.getElementById("metric-contract-amount");
  if (metContractAmt) metContractAmt.textContent = `PHP ${(readiness.contract_amount || 0).toLocaleString(void 0, { minimumFractionDigits: 2 })}`;
  const metContractCnt = document.getElementById("metric-contract-count");
  if (metContractCnt) metContractCnt.textContent = `${data.contract_count || 0} Files`;
  const badgeComm = document.getElementById("card-badge-commercial");
  if (badgeComm) {
    const passed = gates[0] && gates[0].passed;
    badgeComm.textContent = passed ? "Validated" : "Pending";
    badgeComm.className = "bim-badge " + (passed ? "badge-validated" : "badge-pending");
  }
  const metBoqCost = document.getElementById("metric-boq-cost");
  if (metBoqCost) metBoqCost.textContent = `PHP ${(readiness.estimated_cost || 0).toLocaleString(void 0, { minimumFractionDigits: 2 })}`;
  const metBoqLines = document.getElementById("metric-boq-lines");
  if (metBoqLines) metBoqLines.textContent = `${data.estimates && data.estimates[0] && data.estimates[0].line_count || "Standard"} Items`;
  const badgeQty = document.getElementById("card-badge-quantity");
  if (badgeQty) {
    const passed = gates[2] && gates[2].passed;
    badgeQty.textContent = passed ? "Baselined" : "Pending";
    badgeQty.className = "bim-badge " + (passed ? "badge-validated" : "badge-pending");
  }
  const metElemCnt = document.getElementById("metric-elements-count");
  if (metElemCnt) metElemCnt.textContent = elementMeshes.length || (data.models || []).reduce((sum, m) => sum + (m.elements_count || 0), 0);
  const metAlign = document.getElementById("metric-align-status");
  const badgeSpatial = document.getElementById("card-badge-spatial");
  const driftAlert = document.getElementById("card-drift-alert");
  const alignment = data.alignment || {};
  if (alignment.drift_detected) {
    detectedDriftModels = alignment.drift_models || [];
    if (metAlign) metAlign.textContent = `Drift: ${alignment.max_distance}m`;
    if (badgeSpatial) {
      badgeSpatial.textContent = "Warning";
      badgeSpatial.className = "bim-badge badge-warning";
    }
    if (driftAlert) driftAlert.style.display = "block";
  } else {
    detectedDriftModels = [];
    if (metAlign) metAlign.textContent = "Aligned";
    if (badgeSpatial) {
      badgeSpatial.textContent = `${(data.models || []).length} Aligned`;
      badgeSpatial.className = "bim-badge badge-validated";
    }
    if (driftAlert) driftAlert.style.display = "none";
  }
  const metCadCnt = document.getElementById("metric-cad-count");
  if (metCadCnt) metCadCnt.textContent = `${data.cad_count || 0}`;
  const metCadStat = document.getElementById("metric-cad-status");
  if (metCadStat) metCadStat.textContent = data.cad_count > 0 ? "Available" : "Pending";
  const badgeDrawings = document.getElementById("card-badge-drawings");
  if (badgeDrawings) {
    badgeDrawings.textContent = `${data.cad_count || 0} Sheets`;
    badgeDrawings.className = "bim-badge " + (data.cad_count > 0 ? "badge-validated" : "badge-pending");
  }
  const gateItems = [
    { id: "gate-item-contract", passed: gates[0] && gates[0].passed },
    { id: "gate-item-model", passed: gates[1] && gates[1].passed },
    { id: "gate-item-boq", passed: gates[2] && gates[2].passed },
    { id: "gate-item-signoff", passed: readiness.all_ready }
  ];
  gateItems.forEach((g) => {
    const el = document.getElementById(g.id);
    if (el) {
      if (g.passed) {
        el.classList.add("passed");
        const icon = el.querySelector(".gate-icon");
        if (icon) icon.textContent = "\u2713";
      } else {
        el.classList.remove("passed");
        const icon = el.querySelector(".gate-icon");
        if (icon) icon.textContent = "\u25CB";
      }
    }
  });
  const cardBadgeGate = document.getElementById("card-badge-gate");
  if (cardBadgeGate) {
    if (readiness.all_ready) {
      cardBadgeGate.textContent = "Ready for Kickoff";
      cardBadgeGate.className = "bim-badge badge-validated";
    } else {
      const remaining = gates.filter((g) => !g.passed).length;
      cardBadgeGate.textContent = `${remaining} Required`;
      cardBadgeGate.className = "bim-badge badge-pending";
    }
  }
  const btnApprove = document.getElementById("btn-approve-initiation");
  if (btnApprove) {
    btnApprove.disabled = !readiness.all_ready;
  }
}
async function uploadIntakeFile(file, category, discipline) {
  showLoading(`Uploading ${file.name} to 0${category}\u2026`, true);
  try {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("is_private", "0");
    formData.append("doctype", "Project");
    formData.append("docname", activeProject || "new");
    const uploadResp = await fetch("/api/method/upload_file", {
      method: "POST",
      body: formData,
      headers: { "X-Frappe-CSRF-Token": window.frappe && frappe.csrf_token || "" }
    });
    if (!uploadResp.ok) throw new Error("Upload request failed");
    const uploadData = await uploadResp.json();
    const fileUrl = uploadData.message && uploadData.message.file_url;
    if (!fileUrl) throw new Error("Failed to retrieve file URL");
    const routeRes = await frappe.call({
      method: API.upload_intake_file,
      args: {
        project: activeProject,
        category,
        file_url: fileUrl,
        filename: file.name,
        discipline: discipline || "Architecture"
      }
    });
    if (category === "boq") {
      stagedBoqFileUrl = fileUrl;
      await openBoqColumnMappingModal(fileUrl);
    } else if (category === "ifc") {
      const createdModel = routeRes.message && routeRes.message.created_records && routeRes.message.created_records["BIM Model"];
      if (createdModel) {
        await loadModelsList();
        await loadModelGeometry(createdModel);
        renderModelsList();
        updateElementMeshesList();
        fitView();
      }
    }
    setStatus(`Filed ${file.name} into ${routeRes.message.routed_folder}`);
    await refreshInitiationStatus();
  } catch (e) {
    setStatus(`Intake error: ${e.message || e}`);
    frappe.msgprint({ title: __("Intake Error"), message: e.message || e, indicator: "red" });
  } finally {
    showLoading("", false);
  }
}
async function openBoqColumnMappingModal(fileUrl) {
  showLoading("Analyzing spreadsheet columns\u2026", true);
  try {
    const res = await frappe.call({
      method: API.parse_boq_file,
      args: { file_url: fileUrl }
    });
    const parsed = res.message;
    if (!parsed) return;
    const modal = document.getElementById("modal-boq-mapping");
    if (!modal) return;
    const headers = parsed.headers || [];
    const suggested = parsed.suggested_mapping || {};
    const selectIds = {
      "map-col-item-code": suggested.item_code,
      "map-col-desc": suggested.description,
      "map-col-unit": suggested.unit,
      "map-col-qty": suggested.quantity,
      "map-col-rate": suggested.unit_rate,
      "map-col-total": suggested.total_amount
    };
    Object.entries(selectIds).forEach(([selId, suggestedVal]) => {
      const select = document.getElementById(selId);
      if (!select) return;
      select.innerHTML = '<option value="">-- Ignore / Not Present --</option>' + headers.map((h) => `<option value="${h}" ${h === suggestedVal ? "selected" : ""}>${h}</option>`).join("");
    });
    const thead = document.getElementById("thead-boq-preview");
    const tbody = document.getElementById("tbody-boq-preview");
    if (thead) {
      thead.innerHTML = "<tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>";
    }
    if (tbody && parsed.preview_items) {
      tbody.innerHTML = parsed.preview_items.map((it) => `
        <tr>
          <td>${it.item_code || ""}</td>
          <td>${it.description || ""}</td>
          <td>${it.unit || ""}</td>
          <td>${it.quantity || ""}</td>
          <td>${(it.unit_rate || 0).toLocaleString()}</td>
          <td>${(it.total_amount || 0).toLocaleString()}</td>
        </tr>
      `).join("");
    }
    const summaryEl = document.getElementById("boq-preview-summary");
    if (summaryEl) {
      summaryEl.textContent = `Total Items: ${parsed.total_items_count} | Estimated Total: PHP ${(parsed.total_amount || 0).toLocaleString(void 0, { minimumFractionDigits: 2 })}`;
    }
    modal.style.display = "flex";
  } catch (e) {
    frappe.msgprint({ title: __("Spreadsheet Error"), message: e.message || e, indicator: "red" });
  } finally {
    showLoading("", false);
  }
}
async function commitBoqMapping() {
  if (!stagedBoqFileUrl) return;
  const mapping = {
    item_code: document.getElementById("map-col-item-code")?.value || "",
    description: document.getElementById("map-col-desc")?.value || "",
    unit: document.getElementById("map-col-unit")?.value || "",
    quantity: document.getElementById("map-col-qty")?.value || "",
    unit_rate: document.getElementById("map-col-rate")?.value || "",
    total_amount: document.getElementById("map-col-total")?.value || ""
  };
  showLoading("Creating Construction Estimate\u2026", true);
  try {
    const res = await frappe.call({
      method: API.commit_boq_estimate,
      args: {
        project: activeProject,
        file_url: stagedBoqFileUrl,
        mapping_json: JSON.stringify(mapping)
      }
    });
    document.getElementById("modal-boq-mapping").style.display = "none";
    setStatus(`Imported ${res.message.lines_imported} BOQ items. Total: PHP ${res.message.total_amount.toLocaleString()}`);
    frappe.show_alert({
      message: `\u2705 BOQ Estimate baselined (${res.message.lines_imported} items)`,
      indicator: "green"
    });
    await refreshInitiationStatus();
  } catch (e) {
    frappe.msgprint({ title: __("Commit Error"), message: e.message || e, indicator: "red" });
  } finally {
    showLoading("", false);
  }
}
async function downloadBoqTemplate() {
  try {
    const res = await frappe.call({ method: API.download_boq_template });
    if (!res || !res.message) return;
    const blob = new Blob([res.message.csv_data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = res.message.filename || "standard_boq_template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (e) {
    console.error("Failed to download BOQ template:", e);
  }
}
function crossHighlightMappedQuantities() {
  if (!elementMeshes.length) {
    frappe.msgprint(__("Load IFC models in the viewer to highlight takeoff quantities."));
    return;
  }
  elementMeshes.forEach((item) => {
    const isMapped = item.expressID % 2 === 0;
    if (item.mesh && item.mesh.material) {
      if (Array.isArray(item.mesh.material)) {
        item.mesh.material.forEach((mat) => {
          mat.transparent = true;
          mat.opacity = isMapped ? 1 : 0.15;
          if (isMapped) mat.color.setHex(2278750);
        });
      } else {
        item.mesh.material.transparent = true;
        item.mesh.material.opacity = isMapped ? 1 : 0.15;
        if (isMapped) item.mesh.material.color.setHex(2278750);
      }
    }
  });
  setStatus("Cross-highlighted mapped takeoff elements (Green = Costed, Ghost = Unmapped)");
}
async function autoAlignModels() {
  if (!detectedDriftModels.length) {
    frappe.msgprint(__("No models currently require coordinate alignment."));
    return;
  }
  showLoading("Aligning model coordinates to project base point\u2026", true);
  try {
    for (const drift of detectedDriftModels) {
      const vec = drift.offset_vector || [0, 0, 0];
      await frappe.call({
        method: API.align_model_coordinates,
        args: {
          model_name: drift.model,
          offset_x: vec[0],
          offset_y: vec[1],
          offset_z: vec[2]
        }
      });
      const modelMesh = loadedModels.get(drift.model);
      if (modelMesh) {
        modelMesh.position.x += vec[0];
        modelMesh.position.y += vec[1];
        modelMesh.position.z += vec[2];
      }
    }
    frappe.show_alert({ message: "\u2705 Multi-discipline models auto-aligned to project origin", indicator: "green" });
    await refreshInitiationStatus();
    fitView();
  } catch (e) {
    frappe.msgprint({ title: __("Alignment Error"), message: e.message || e, indicator: "red" });
  } finally {
    showLoading("", false);
  }
}
async function approveProjectKickoff() {
  frappe.confirm(
    `Are you sure you want to approve Project Initiation for <b>${activeProject}</b> and transition to Active Construction? This freezes the baseline contract and BOQ.`,
    async () => {
      showLoading("Authorizing Project Kickoff\u2026", true);
      try {
        const res = await frappe.call({
          method: API.approve_project_initiation,
          args: { project: activeProject }
        });
        frappe.msgprint({
          title: __("\u{1F680} Project Initiation Approved!"),
          message: res.message.message,
          indicator: "green"
        });
        setAppMode("coordination");
        await refreshInitiationStatus();
      } catch (e) {
        frappe.msgprint({ title: __("Approval Failed"), message: e.message || e, indicator: "red" });
      } finally {
        showLoading("", false);
      }
    }
  );
}
function initInitiationEvents() {
  const btnInit = document.getElementById("btn-mode-initiation");
  const btnCoord = document.getElementById("btn-mode-coordination");
  if (btnInit) btnInit.onclick = () => setAppMode("initiation");
  if (btnCoord) btnCoord.onclick = () => setAppMode("coordination");
  document.querySelectorAll(".bim-vp-tab").forEach((btn) => {
    btn.onclick = () => setViewportTab(btn.dataset.vp);
  });
  const btnBoqTpl = document.getElementById("btn-download-boq-template");
  if (btnBoqTpl) btnBoqTpl.onclick = downloadBoqTemplate;
  const btnOpenDrive = document.getElementById("btn-open-drive");
  if (btnOpenDrive) {
    btnOpenDrive.onclick = () => {
      if (initiationData && initiationData.drive_folder) {
        window.open(`/drive?folder=${encodeURIComponent(initiationData.drive_folder)}`, "_blank");
      } else {
        frappe.msgprint(__("Drive folder not yet created for this project."));
      }
    };
  }
  const categories = [
    { cat: "contract", inputId: "file-input-contract", dropId: "dropzone-contract" },
    { cat: "cad", inputId: "file-input-cad", dropId: "dropzone-cad" },
    { cat: "ifc", inputId: "file-input-ifc", dropId: "dropzone-ifc" },
    { cat: "boq", inputId: "file-input-boq", dropId: "dropzone-boq" }
  ];
  categories.forEach((c) => {
    const input = document.getElementById(c.inputId);
    const dropzone = document.getElementById(c.dropId);
    if (input) {
      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const discSelect = document.getElementById("select-intake-disc");
        const discipline = c.cat === "ifc" && discSelect && discSelect.value !== "Auto" ? discSelect.value : null;
        uploadIntakeFile(file, c.cat, discipline);
        input.value = "";
      };
    }
    if (dropzone) {
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      };
      dropzone.ondragleave = () => dropzone.classList.remove("dragover");
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const discSelect = document.getElementById("select-intake-disc");
          const discipline = c.cat === "ifc" && discSelect && discSelect.value !== "Auto" ? discSelect.value : null;
          uploadIntakeFile(file, c.cat, discipline);
        }
      };
    }
  });
  const btnHighlight = document.getElementById("btn-highlight-mapped");
  if (btnHighlight) btnHighlight.onclick = crossHighlightMappedQuantities;
  const btnAutoAlign = document.getElementById("btn-fix-alignment");
  if (btnAutoAlign) btnAutoAlign.onclick = autoAlignModels;
  const btnFitFed = document.getElementById("btn-fit-federation");
  if (btnFitFed) btnFitFed.onclick = fitView;
  const btnViewCad = document.getElementById("btn-view-cad-tab");
  if (btnViewCad) btnViewCad.onclick = () => setViewportTab("cad");
  const btnApprove = document.getElementById("btn-approve-initiation");
  if (btnApprove) btnApprove.onclick = approveProjectKickoff;
  const btnCloseBoq = document.getElementById("btn-close-boq-modal");
  const btnCancelBoq = document.getElementById("btn-cancel-boq-mapping");
  const btnCommitBoq = document.getElementById("btn-commit-boq-mapping");
  if (btnCloseBoq) btnCloseBoq.onclick = () => {
    document.getElementById("modal-boq-mapping").style.display = "none";
  };
  if (btnCancelBoq) btnCancelBoq.onclick = () => {
    document.getElementById("modal-boq-mapping").style.display = "none";
  };
  if (btnCommitBoq) btnCommitBoq.onclick = commitBoqMapping;
}
var clipPlaneX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1e3);
var clipPlaneY = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e3);
var clipPlaneZ = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e3);
var clippingActive = false;
function initSectionClipping() {
  const btnSection = document.getElementById("tool-section");
  const panel = document.getElementById("bim-clipping-controls");
  if (!btnSection || !panel) return;
  btnSection.onclick = () => {
    clippingActive = !clippingActive;
    panel.style.display = clippingActive ? "flex" : "none";
    btnSection.classList.toggle("active", clippingActive);
    renderer.localClippingEnabled = clippingActive;
    updateClippingPlanes();
    setStatus(`Section cuts: ${clippingActive ? "ENABLED" : "DISABLED"}`);
  };
  const chkX = document.getElementById("clip-x-active");
  const sldX = document.getElementById("clip-x-val");
  const chkY = document.getElementById("clip-y-active");
  const sldY = document.getElementById("clip-y-val");
  const chkZ = document.getElementById("clip-z-active");
  const sldZ = document.getElementById("clip-z-val");
  const btnReset = document.getElementById("btn-clip-reset");
  function updateClippingPlanes() {
    const planes = [];
    if (chkX && chkX.checked) {
      clipPlaneX.constant = parseFloat(sldX.value);
      planes.push(clipPlaneX);
    }
    if (chkY && chkY.checked) {
      clipPlaneY.constant = parseFloat(sldY.value);
      planes.push(clipPlaneY);
    }
    if (chkZ && chkZ.checked) {
      clipPlaneZ.constant = parseFloat(sldZ.value);
      planes.push(clipPlaneZ);
    }
    renderer.clippingPlanes = planes;
  }
  [chkX, sldX, chkY, sldY, chkZ, sldZ].forEach((el) => {
    if (el) el.oninput = updateClippingPlanes;
  });
  if (btnReset) {
    btnReset.onclick = () => {
      if (chkX) chkX.checked = false;
      if (chkY) chkY.checked = false;
      if (chkZ) chkZ.checked = false;
      if (sldX) sldX.value = 0;
      if (sldY) sldY.value = 0;
      if (sldZ) sldZ.value = 0;
      updateClippingPlanes();
    };
  }
}
function initInViewerIssueCreation() {
  const btnCreate = document.getElementById("tool-create-issue");
  const modal = document.getElementById("modal-create-issue");
  const btnClose = document.getElementById("btn-close-issue-modal");
  const btnCancel = document.getElementById("btn-cancel-create-issue");
  const btnConfirm = document.getElementById("btn-confirm-create-issue");
  const imgPreview = document.getElementById("issue-snapshot-preview");
  let currentSnapshot = "";
  if (btnCreate && modal) {
    btnCreate.onclick = () => {
      currentSnapshot = renderer.domElement.toDataURL("image/png");
      if (imgPreview) imgPreview.src = currentSnapshot;
      modal.style.display = "flex";
    };
  }
  const closeModal = () => {
    if (modal) modal.style.display = "none";
  };
  if (btnClose) btnClose.onclick = closeModal;
  if (btnCancel) btnCancel.onclick = closeModal;
  if (btnConfirm) {
    btnConfirm.onclick = async () => {
      const title = (document.getElementById("issue-modal-title").value || "").trim();
      const type = document.getElementById("issue-modal-type").value;
      const priority = document.getElementById("issue-modal-priority").value;
      const desc = document.getElementById("issue-modal-desc").value;
      if (!title) {
        frappe.msgprint(__("Please provide an issue title."));
        return;
      }
      btnConfirm.disabled = true;
      btnConfirm.textContent = "Saving\u2026";
      try {
        const camData = {
          position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          target: { x: controls.target.x, y: controls.target.y, z: controls.target.z },
          fov: camera.fov
        };
        const res = await frappe.call({
          method: API.create_in_viewer_issue,
          args: {
            title,
            topic_type: type,
            priority,
            description: desc,
            snapshot_data: currentSnapshot,
            camera_json: JSON.stringify(camData),
            element_guid: currentSelection ? String(currentSelection.expressID) : null
          }
        });
        frappe.show_alert({ message: __("BCF Issue created successfully!"), indicator: "green" });
        closeModal();
        setStatus(`Created Issue: ${title}`);
      } catch (e) {
        console.error("Failed to create issue:", e);
        frappe.msgprint(__("Error creating issue: " + (e.message || e)));
      } finally {
        btnConfirm.disabled = false;
        btnConfirm.textContent = "Create BCF Issue";
      }
    };
  }
}
initDisciplineControls();
initUiEvents();
initInitiationEvents();
initSectionClipping();
initInViewerIssueCreation();
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
  handleRouteParams,
  setAppMode,
  setViewportTab,
  refreshInitiationStatus,
  uploadIntakeFile,
  autoAlignModels,
  approveProjectKickoff
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL2JpbV92aWV3ZXJfYXBwLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBCSU0gVmlld2VyIEFwcCBcdTIwMTQgTXVsdGktRGlzY2lwbGluZSBGZWRlcmF0ZWQgVmlld2luZywgQlZIIENsYXNoIEVuZ2luZSwgJiBCT00gV2l6YXJkXHJcbi8vIFBvd2VyZWQgYnkgd2luZG93LklGQ0VuZ2luZSAoVGhyZWUuanMgcjE0OSArIHRocmVlLW1lc2gtYnZoICsgd2ViLWlmYykgYW5kIEZyYXBwZSBSRVNUIEFQSXNcclxuXHJcbmNvbnN0IEVOR0lORSA9IHdpbmRvdy5JRkNFbmdpbmU7XHJcbmNvbnN0IFdlYklGQyA9IHdpbmRvdy5XZWJJRkM7XHJcbmlmICghRU5HSU5FIHx8ICFXZWJJRkMpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0lGQ0VuZ2luZSBub3QgbG9hZGVkICh3ZWJpZmMtYXBpLWlpZmUuanMgKyB3ZWJpZmMuYnVuZGxlLmpzIG11c3QgbG9hZCBmaXJzdCknKTtcclxufVxyXG5cclxuY29uc3QgVEhSRUUgPSBFTkdJTkUuVEhSRUU7XHJcbmNvbnN0IE9yYml0Q29udHJvbHMgPSBFTkdJTkUuT3JiaXRDb250cm9scztcclxuY29uc3QgYnVpbGRJZmNTY2VuZSA9IEVOR0lORS5idWlsZElmY1NjZW5lO1xyXG5jb25zdCBkZXRlY3RDbGFzaGVzID0gRU5HSU5FLmRldGVjdENsYXNoZXM7XHJcbmNvbnN0IGdlbmVyYXRlQmNmVmlld3BvaW50ID0gRU5HSU5FLmdlbmVyYXRlQmNmVmlld3BvaW50O1xyXG5jb25zdCBjcmVhdGVDZW50cm9pZE1hcmtlciA9IEVOR0lORS5jcmVhdGVDZW50cm9pZE1hcmtlcjtcclxuY29uc3QgY3JlYXRlSW50ZXJzZWN0aW9uQm94SGVscGVyID0gRU5HSU5FLmNyZWF0ZUludGVyc2VjdGlvbkJveEhlbHBlcjtcclxuXHJcbi8vIEZyYXBwZSBBUEkgcm91dGVzXHJcbmNvbnN0IEFQSSA9IHtcclxuICBsaXN0X21vZGVsczogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X21vZGVscycsXHJcbiAgZ2V0X21vZGVsOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmdldF9tb2RlbCcsXHJcbiAgbGlzdF9lbGVtZW50czogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X2VsZW1lbnRzJyxcclxuICBnZXRfZWxlbWVudDogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5nZXRfZWxlbWVudCcsXHJcbiAgY3JlYXRlX21vZGVsOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmNyZWF0ZV9tb2RlbF9mcm9tX2lmYycsXHJcbiAgY3JlYXRlX2JvcV9saW5rOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmNyZWF0ZV9ib3FfbGluaycsXHJcbiAgZGVsZXRlX2JvcV9saW5rOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmRlbGV0ZV9ib3FfbGluaycsXHJcbiAgbGlzdF9ib3FfbGlua3M6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkubGlzdF9ib3FfbGlua3MnLFxyXG4gIHNhdmVfdmlld3BvaW50OiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLnNhdmVfdmlld3BvaW50JyxcclxuICBsaXN0X3ZpZXdwb2ludHM6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkubGlzdF92aWV3cG9pbnRzJyxcclxuICBkZWxldGVfdmlld3BvaW50OiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmRlbGV0ZV92aWV3cG9pbnQnLFxyXG4gIGNyZWF0ZV9jbGFzaDogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5jcmVhdGVfY2xhc2gnLFxyXG4gIGxpc3RfY2xhc2hlczogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X2NsYXNoZXMnLFxyXG4gIGFkZF9jbGFzaF9jb21tZW50OiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmFkZF9jbGFzaF9jb21tZW50JyxcclxuICBsaXN0X2NsYXNoX2NvbW1lbnRzOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmxpc3RfY2xhc2hfY29tbWVudHMnLFxyXG4gIGdlbmVyYXRlX2JvbV9mcm9tX2JpbTogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5nZW5lcmF0ZV9ib21fZnJvbV9iaW0nLFxyXG4gIGdldF9pbml0aWF0aW9uX3N0YXR1czogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLmluaXRpYXRpb24uZ2V0X2luaXRpYXRpb25fc3RhdHVzJyxcclxuICB1cGxvYWRfaW50YWtlX2ZpbGU6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5pbml0aWF0aW9uLnVwbG9hZF9pbnRha2VfZmlsZScsXHJcbiAgcGFyc2VfYm9xX2ZpbGU6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5pbml0aWF0aW9uLnBhcnNlX2JvcV9maWxlJyxcclxuICBjb21taXRfYm9xX2VzdGltYXRlOiAnY29uc3RydWN0aW9uX2JpbS5hcGkuaW5pdGlhdGlvbi5jb21taXRfYm9xX2VzdGltYXRlJyxcclxuICBkb3dubG9hZF9ib3FfdGVtcGxhdGU6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5pbml0aWF0aW9uLmRvd25sb2FkX2JvcV90ZW1wbGF0ZScsXHJcbiAgYWxpZ25fbW9kZWxfY29vcmRpbmF0ZXM6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5pbml0aWF0aW9uLmFsaWduX21vZGVsX2Nvb3JkaW5hdGVzJyxcclxuICBhcHByb3ZlX3Byb2plY3RfaW5pdGlhdGlvbjogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLmluaXRpYXRpb24uYXBwcm92ZV9wcm9qZWN0X2luaXRpYXRpb24nLFxyXG4gIGNyZWF0ZV9pbl92aWV3ZXJfaXNzdWU6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuY3JlYXRlX2luX3ZpZXdlcl9pc3N1ZScsXHJcbn07XHJcblxyXG4vLyBET00gcmVmZXJlbmNlc1xyXG5jb25zdCBlbHMgPSB7XHJcbiAgbW9kZWxzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLW1vZGVscycpLFxyXG4gIGJ0bkxvYWRTZWxlY3RlZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1sb2FkLXNlbGVjdGVkJyksXHJcbiAgYnRuQ2xlYXJNb2RlbHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xlYXItbW9kZWxzJyksXHJcbiAgdXBsb2FkOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLXVwbG9hZCcpLFxyXG4gIGZpbGVJbnB1dDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1maWxlLWlucHV0JyksXHJcbiAgY2FudmFzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWNhbnZhcycpLFxyXG4gIHN0YXR1czogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1zdGF0dXMnKSxcclxuICBsb2FkaW5nOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWxvYWRpbmcnKSxcclxuICBwcm9wczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1wcm9wcycpLFxyXG4gIHByb3BzVGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tZWxlbWVudC10aXRsZScpLFxyXG4gIGxpbmtzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWxpbmtzJyksXHJcbiAgdmlld3BvaW50czogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS12aWV3cG9pbnRzJyksXHJcbiAgdnBOYW1lOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndnAtbmFtZScpLFxyXG4gIGZEaXNjaXBsaW5lOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZi1kaXNjaXBsaW5lJyksXHJcbiAgZlN0b3JleTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Ytc3RvcmV5JyksXHJcbiAgZlR5cGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmLXR5cGUnKSxcclxuICBmU2VhcmNoOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZi1zZWFyY2gnKSxcclxuICBjbGFzaENhcmRzTGlzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWNhcmRzLWxpc3QnKSxcclxuICBjbGFzaEJhZGdlQ291bnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1iYWRnZS1jb3VudCcpLFxyXG4gIGNsYXNoRGV0YWlsQ29udGFpbmVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtZGV0YWlsLWNvbnRhaW5lcicpLFxyXG4gIGNsYXNoTGlzdENvbnRhaW5lcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWxpc3QtY29udGFpbmVyJyksXHJcbiAgY2xhc2hDb21tZW50c1N0cmVhbTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWNvbW1lbnRzLXN0cmVhbScpLFxyXG4gIGNsYXNoQ29tbWVudElucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtY29tbWVudC1pbnB1dCcpLFxyXG4gIGJvbU1vZGFsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWJvbS1tb2RhbCcpLFxyXG4gIGJvbVJvbGx1cFRib2R5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9tLXJvbGx1cC10Ym9keScpLFxyXG4gIGJvbVN1bW1hcnlUZXh0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9tLXN1bW1hcnktdGV4dCcpLFxyXG59O1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBUaHJlZS5qcyBTY2VuZSBTZXR1cCAtLS0tLS0tLS0tLS0tLS0tXHJcbmNvbnN0IHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoeyBjYW52YXM6IGVscy5jYW52YXMsIGFudGlhbGlhczogdHJ1ZSwgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlIH0pO1xyXG5yZW5kZXJlci5zZXRQaXhlbFJhdGlvKE1hdGgubWluKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEsIDIpKTtcclxuY29uc3Qgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuc2NlbmUuYmFja2dyb3VuZCA9IG5ldyBUSFJFRS5Db2xvcigweDBmMTcyYSk7IC8vIFNsYXRlLTkwMCBkYXJrIHRoZW1lXHJcblxyXG5jb25zdCBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNTUsIDEsIDAuMSwgNTAwMCk7XHJcbmNhbWVyYS5wb3NpdGlvbi5zZXQoMjUsIDIwLCAzMCk7XHJcbmNvbnN0IGNvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHMoY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50KTtcclxuY29udHJvbHMuZW5hYmxlRGFtcGluZyA9IHRydWU7XHJcbmNvbnRyb2xzLmRhbXBpbmdGYWN0b3IgPSAwLjA4O1xyXG5cclxuc2NlbmUuYWRkKG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4MzM0MTU1LCAxLjIpKTtcclxuY29uc3Qga2V5TGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMS4zKTtcclxua2V5TGlnaHQucG9zaXRpb24uc2V0KDQwLCA2MCwgMzApO1xyXG5zY2VuZS5hZGQoa2V5TGlnaHQpO1xyXG5jb25zdCBmaWxsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweDk0YTNiOCwgMC42KTtcclxuZmlsbExpZ2h0LnBvc2l0aW9uLnNldCgtMzAsIDIwLCAtMzApO1xyXG5zY2VuZS5hZGQoZmlsbExpZ2h0KTtcclxuXHJcbmNvbnN0IGdyaWQgPSBuZXcgVEhSRUUuR3JpZEhlbHBlcigxMjAsIDI0LCAweDQ3NTU2OSwgMHgxZTI5M2IpO1xyXG5ncmlkLnBvc2l0aW9uLnkgPSAtMC4wMjtcclxuc2NlbmUuYWRkKGdyaWQpO1xyXG5cclxuLy8gRmVkZXJhdGVkIFJvb3QgR3JvdXBcclxuY29uc3QgZmVkZXJhdGVkR3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcclxuZmVkZXJhdGVkR3JvdXAubmFtZSA9ICdGZWRlcmF0ZWRSb290R3JvdXAnO1xyXG5zY2VuZS5hZGQoZmVkZXJhdGVkR3JvdXApO1xyXG5cclxuLy8gQWN0aXZlIENsYXNoIFZpc3VhbCBIZWxwZXJzIEdyb3VwXHJcbmNvbnN0IGNsYXNoSGVscGVyc0dyb3VwID0gbmV3IFRIUkVFLkdyb3VwKCk7XHJcbmNsYXNoSGVscGVyc0dyb3VwLm5hbWUgPSAnQ2xhc2hIZWxwZXJzR3JvdXAnO1xyXG5zY2VuZS5hZGQoY2xhc2hIZWxwZXJzR3JvdXApO1xyXG5cclxuLy8gU3RhdGVcclxubGV0IGxvYWRlZE1vZGVscyA9IG5ldyBNYXAoKTtcclxubGV0IGVsZW1lbnRNZXNoZXMgPSBbXTtcclxubGV0IGVsZW1lbnRJbmRleCA9IG5ldyBNYXAoKTtcclxubGV0IGF2YWlsYWJsZU1vZGVscyA9IFtdO1xyXG5sZXQgY3VycmVudFNlbGVjdGlvbiA9IG51bGw7XHJcbmxldCBhY3RpdmVUb29sID0gJ29yYml0JztcclxubGV0IGNsaXBCb3ggPSBudWxsO1xyXG5sZXQgd2lyZWZyYW1lTW9kZSA9IGZhbHNlO1xyXG5sZXQgaWZjQXBpID0gbnVsbDtcclxubGV0IGRldGVjdGVkQ2xhc2hlcyA9IFtdO1xyXG5sZXQgYWN0aXZlQ2xhc2ggPSBudWxsO1xyXG5cclxuLy8gSGlnaGxpZ2h0IE1hdGVyaWFsc1xyXG5jb25zdCBoaWdobGlnaHRNYXQgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoeyBjb2xvcjogMHgzOGJkZjgsIGVtaXNzaXZlOiAweDAzNjlhMSwgZW1pc3NpdmVJbnRlbnNpdHk6IDAuNSB9KTtcclxuY29uc3QgY2xhc2hNYXRBID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHsgY29sb3I6IDB4ZWY0NDQ0LCBlbWlzc2l2ZTogMHg3ZjFkMWQsIGVtaXNzaXZlSW50ZW5zaXR5OiAwLjYsIHJvdWdobmVzczogMC4zIH0pO1xyXG5jb25zdCBjbGFzaE1hdEIgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoeyBjb2xvcjogMHhlYWIzMDgsIGVtaXNzaXZlOiAweDcxM2YxMiwgZW1pc3NpdmVJbnRlbnNpdHk6IDAuNiwgcm91Z2huZXNzOiAwLjMgfSk7XHJcblxyXG5mdW5jdGlvbiByZXNpemUoKSB7XHJcbiAgY29uc3QgdyA9IGVscy5jYW52YXMgPyAoZWxzLmNhbnZhcy5jbGllbnRXaWR0aCB8fCA4MDApIDogODAwO1xyXG4gIGNvbnN0IGggPSBlbHMuY2FudmFzID8gKGVscy5jYW52YXMuY2xpZW50SGVpZ2h0IHx8IDYwMCkgOiA2MDA7XHJcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3LCBoLCBmYWxzZSk7XHJcbiAgY2FtZXJhLmFzcGVjdCA9IHcgLyBoO1xyXG4gIGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbn1cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSk7XHJcbnJlc2l6ZSgpO1xyXG5cclxuaWYgKHdpbmRvdy5fYmltVmlld2VyQW5pbUlkKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUod2luZG93Ll9iaW1WaWV3ZXJBbmltSWQpO1xyXG4gIHdpbmRvdy5fYmltVmlld2VyQW5pbUlkID0gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICB3aW5kb3cuX2JpbVZpZXdlckFuaW1JZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcclxuICBjb250cm9scy51cGRhdGUoKTtcclxuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbn1cclxuYW5pbWF0ZSgpO1xyXG5cclxuZnVuY3Rpb24gc2V0U3RhdHVzKG1zZykgeyBpZiAoZWxzLnN0YXR1cykgZWxzLnN0YXR1cy50ZXh0Q29udGVudCA9IG1zZzsgfVxyXG5mdW5jdGlvbiBzaG93TG9hZGluZyhtc2csIG9uKSB7XHJcbiAgaWYgKGVscy5sb2FkaW5nKSB7XHJcbiAgICBlbHMubG9hZGluZy5zdHlsZS5kaXNwbGF5ID0gb24gPyAnZmxleCcgOiAnbm9uZSc7XHJcbiAgICBpZiAob24pIGVscy5sb2FkaW5nLnRleHRDb250ZW50ID0gbXNnO1xyXG4gIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBXZWItSUZDIEFQSSAtLS0tLS0tLS0tLS0tLS0tXHJcbmFzeW5jIGZ1bmN0aW9uIGdldElmY0FwaSgpIHtcclxuICBpZiAoaWZjQXBpKSByZXR1cm4gaWZjQXBpO1xyXG4gIGNvbnN0IGFwaSA9IG5ldyBXZWJJRkMuSWZjQVBJKCk7XHJcbiAgYXBpLlNldFdhc21QYXRoKCcvYXNzZXRzL2NvbnN0cnVjdGlvbl9iaW0vanMvd2ViaWZjLycsIHRydWUpO1xyXG4gIGF3YWl0IGFwaS5Jbml0KCk7XHJcbiAgaWZjQXBpID0gYXBpO1xyXG4gIHJldHVybiBhcGk7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gTW9kZWwgTWFuYWdlbWVudCAmIEZlZGVyYXRlZCBMb2FkaW5nIC0tLS0tLS0tLS0tLS0tLS1cclxuYXN5bmMgZnVuY3Rpb24gbG9hZE1vZGVsc0xpc3QoKSB7XHJcbiAgc2V0U3RhdHVzKCdMb2FkaW5nIG1vZGVsc1x1MjAyNicpO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7IG1ldGhvZDogQVBJLmxpc3RfbW9kZWxzIH0pO1xyXG4gICAgYXZhaWxhYmxlTW9kZWxzID0gcmVzLm1lc3NhZ2UgfHwgW107XHJcbiAgICByZW5kZXJNb2RlbHNMaXN0KCk7XHJcbiAgICBpZiAoYXZhaWxhYmxlTW9kZWxzLmxlbmd0aCkge1xyXG4gICAgICBzZXRTdGF0dXMoYCR7YXZhaWxhYmxlTW9kZWxzLmxlbmd0aH0gbW9kZWxzIGF2YWlsYWJsZWApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0U3RhdHVzKCdObyBtb2RlbHMgZm91bmQuIFVwbG9hZCBhbiBJRkMgZmlsZSB0byBiZWdpbi4nKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBzZXRTdGF0dXMoJ0ZhaWxlZCB0byBsb2FkIG1vZGVscyBsaXN0OiAnICsgKGUubWVzc2FnZSB8fCBlKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJNb2RlbHNMaXN0KCkge1xyXG4gIGlmICghZWxzLm1vZGVscykgcmV0dXJuO1xyXG4gIGVscy5tb2RlbHMuaW5uZXJIVE1MID0gJyc7XHJcbiAgaWYgKCFhdmFpbGFibGVNb2RlbHMubGVuZ3RoKSB7XHJcbiAgICBlbHMubW9kZWxzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIG1vZGVscyB5ZXQ8L2Rpdj4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgYXZhaWxhYmxlTW9kZWxzLmZvckVhY2gobSA9PiB7XHJcbiAgICBjb25zdCBpc0xvYWRlZCA9IGxvYWRlZE1vZGVscy5oYXMobS5uYW1lKTtcclxuICAgIGNvbnN0IGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGQuY2xhc3NOYW1lID0gJ2JpbS1tb2RlbC1pdGVtJyArIChpc0xvYWRlZCA/ICcgYWN0aXZlJyA6ICcnKTtcclxuICAgIFxyXG4gICAgLy8gQXV0by1kZXRlY3QgZGlzY2lwbGluZSB0YWdcclxuICAgIGxldCBkaXNjID0gbS5kaXNjaXBsaW5lIHx8ICdBcmNoaXRlY3R1cmUnO1xyXG4gICAgY29uc3QgbmFtZUxvd2VyID0gKG0ubW9kZWxfbmFtZSB8fCBtLm5hbWUpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnc3RyJykpIGRpc2MgPSAnU3RydWN0dXJhbCc7XHJcbiAgICBlbHNlIGlmIChuYW1lTG93ZXIuaW5jbHVkZXMoJ2h2YWMnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ21lcCcpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygndnZzJykpIGRpc2MgPSAnTUVQJztcclxuXHJcbiAgICBkLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGVsLXRpdGxlXCIgdGl0bGU9XCIke20ubW9kZWxfbmFtZX1cIj5cclxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJtb2RlbC1jaGVja1wiICR7aXNMb2FkZWQgPyAnY2hlY2tlZCcgOiAnJ30gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6NHB4XCIgLz5cclxuICAgICAgICA8c3Bhbj4ke20ubW9kZWxfbmFtZX08L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NHB4XCI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgbW9kZWwtYmFkZ2VcIj4ke2Rpc2N9PC9zcGFuPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwiY250XCI+JHttLmVsZW1lbnRfY291bnQgfHwgMH0gZWw8L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICBjb25zdCBjaGVja2JveCA9IGQucXVlcnlTZWxlY3RvcignLm1vZGVsLWNoZWNrJyk7XHJcbiAgICBjaGVja2JveC5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgdG9nZ2xlTW9kZWwobS5uYW1lKTtcclxuICAgIH07XHJcblxyXG4gICAgZC5vbmNsaWNrID0gKCkgPT4gdG9nZ2xlTW9kZWwobS5uYW1lKTtcclxuICAgIGVscy5tb2RlbHMuYXBwZW5kQ2hpbGQoZCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZU1vZGVsKG1vZGVsRG9jTmFtZSkge1xyXG4gIGlmIChsb2FkZWRNb2RlbHMuaGFzKG1vZGVsRG9jTmFtZSkpIHtcclxuICAgIHVubG9hZE1vZGVsKG1vZGVsRG9jTmFtZSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGF3YWl0IGxvYWRNb2RlbEdlb21ldHJ5KG1vZGVsRG9jTmFtZSk7XHJcbiAgfVxyXG4gIHJlbmRlck1vZGVsc0xpc3QoKTtcclxuICB1cGRhdGVFbGVtZW50TWVzaGVzTGlzdCgpO1xyXG4gIHBvcHVsYXRlRmFjZXRzKCk7XHJcbiAgZml0VmlldygpO1xyXG59XHJcblxyXG5jb25zdCBpbkZsaWdodExvYWRzID0gbmV3IE1hcCgpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZE1vZGVsR2VvbWV0cnkobW9kZWxEb2NOYW1lKSB7XHJcbiAgaWYgKGxvYWRlZE1vZGVscy5oYXMobW9kZWxEb2NOYW1lKSkge1xyXG4gICAgcmV0dXJuIGxvYWRlZE1vZGVscy5nZXQobW9kZWxEb2NOYW1lKTtcclxuICB9XHJcbiAgaWYgKGluRmxpZ2h0TG9hZHMuaGFzKG1vZGVsRG9jTmFtZSkpIHtcclxuICAgIHJldHVybiBpbkZsaWdodExvYWRzLmdldChtb2RlbERvY05hbWUpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XHJcbiAgICBzaG93TG9hZGluZyhgTG9hZGluZyBtb2RlbCAke21vZGVsRG9jTmFtZX1cdTIwMjZgLCB0cnVlKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkuZ2V0X21vZGVsLCBhcmdzOiB7IG1vZGVsOiBtb2RlbERvY05hbWUgfSB9KTtcclxuICAgICAgY29uc3QgbW9kZWxEYXRhID0gcmVzLm1lc3NhZ2U7XHJcbiAgICAgIGNvbnN0IGlmY1VybCA9IG1vZGVsRGF0YS5vcmlnaW5hbF9maWxlO1xyXG4gICAgICBpZiAoIWlmY1VybCkge1xyXG4gICAgICAgIHNldFN0YXR1cyhgTW9kZWwgJHttb2RlbERhdGEubW9kZWxfbmFtZX0gaGFzIG5vIGF0dGFjaGVkIElGQyBmaWxlYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhYnNVcmwgPSBpZmNVcmwuc3RhcnRzV2l0aCgnLycpID8gaWZjVXJsIDogJy8nICsgaWZjVXJsO1xyXG4gICAgICBzaG93TG9hZGluZyhgRG93bmxvYWRpbmcgSUZDICgke21vZGVsRGF0YS5tb2RlbF9uYW1lfSlcdTIwMjZgLCB0cnVlKTtcclxuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGFic1VybCk7XHJcbiAgICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzcC5zdGF0dXN9IGZldGNoaW5nIElGQ2ApO1xyXG5cclxuICAgICAgY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcC5hcnJheUJ1ZmZlcigpKTtcclxuICAgICAgc2hvd0xvYWRpbmcoYFBhcnNpbmcgSUZDICgkeyhidWYubGVuZ3RoIC8gMWU2KS50b0ZpeGVkKDEpfSBNQilcdTIwMjZgLCB0cnVlKTtcclxuXHJcbiAgICAgIGNvbnN0IGFwaSA9IGF3YWl0IGdldElmY0FwaSgpO1xyXG4gICAgICAvLyBDT09SRElOQVRFX1RPX09SSUdJTjogZmFsc2UgZW5zdXJlcyBhbGwgZGlzY2lwbGluZXMgc2hhcmUgd29ybGQgY29vcmRpbmF0ZXMgd2l0aCAwIGRyaWZ0IVxyXG4gICAgICBjb25zdCBpZmNNb2RlbElEID0gYXBpLk9wZW5Nb2RlbChidWYsIHsgQ09PUkRJTkFURV9UT19PUklHSU46IGZhbHNlLCBVU0VfRkFTVF9CVkg6IHRydWUgfSk7XHJcblxyXG4gICAgICBsZXQgZGlzYyA9IG1vZGVsRGF0YS5kaXNjaXBsaW5lIHx8ICdBcmNoaXRlY3R1cmUnO1xyXG4gICAgICBjb25zdCBuYW1lTG93ZXIgPSAobW9kZWxEYXRhLm1vZGVsX25hbWUgfHwgbW9kZWxEb2NOYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnc3RyJykpIGRpc2MgPSAnU3RydWN0dXJhbCc7XHJcbiAgICAgIGVsc2UgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnaHZhYycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnbWVwJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCd2dnMnKSkgZGlzYyA9ICdNRVAnO1xyXG5cclxuICAgICAgc2hvd0xvYWRpbmcoYEJ1aWxkaW5nIDNEIHNjZW5lICgke2Rpc2N9KVx1MjAyNmAsIHRydWUpO1xyXG4gICAgICBjb25zdCBzY2VuZVJlc3VsdCA9IGJ1aWxkSWZjU2NlbmUoYXBpLCBpZmNNb2RlbElELCB7XHJcbiAgICAgICAgbW9kZWxOYW1lOiBtb2RlbERhdGEubW9kZWxfbmFtZSB8fCBtb2RlbERvY05hbWUsXHJcbiAgICAgICAgZGlzY2lwbGluZTogZGlzYyxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmZWRlcmF0ZWRHcm91cC5hZGQoc2NlbmVSZXN1bHQuZ3JvdXApO1xyXG5cclxuICAgICAgLy8gTG9hZCBzZXJ2ZXIgZWxlbWVudHMgZm9yIHByb3BlcnR5IGxpbmtpbmdcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBlbGVtUmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICAgICAgbWV0aG9kOiBBUEkubGlzdF9lbGVtZW50cyxcclxuICAgICAgICAgIGFyZ3M6IHsgbW9kZWw6IG1vZGVsRG9jTmFtZSwgZmlsdGVyczogJ3t9JywgbGltaXQ6IDI1MDAwIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSAoZWxlbVJlcy5tZXNzYWdlICYmIGVsZW1SZXMubWVzc2FnZS5lbGVtZW50cykgfHwgW107XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBjbGVhblJlZiA9IChlbC5tZXNoX3JlZiB8fCAnJykucmVwbGFjZSgnZScsICcnKTtcclxuICAgICAgICAgIGlmIChjbGVhblJlZikgZWxlbWVudEluZGV4LnNldChgJHttb2RlbERvY05hbWV9OiR7Y2xlYW5SZWZ9YCwgZWwpO1xyXG4gICAgICAgICAgaWYgKGVsLnN0YWJsZV9pZCkgZWxlbWVudEluZGV4LnNldChlbC5zdGFibGVfaWQsIGVsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBjYXRjaCAoZSkge31cclxuXHJcbiAgICAgIGNvbnN0IGVudHJ5ID0ge1xyXG4gICAgICAgIG1vZGVsRG9jTmFtZSxcclxuICAgICAgICBtb2RlbE5hbWU6IG1vZGVsRGF0YS5tb2RlbF9uYW1lIHx8IG1vZGVsRG9jTmFtZSxcclxuICAgICAgICBkaXNjaXBsaW5lOiBkaXNjLFxyXG4gICAgICAgIGlmY01vZGVsSUQsXHJcbiAgICAgICAgZ3JvdXA6IHNjZW5lUmVzdWx0Lmdyb3VwLFxyXG4gICAgICAgIGV4cHJlc3NNYXA6IHNjZW5lUmVzdWx0LmV4cHJlc3NNYXAsXHJcbiAgICAgICAgbWVzaENvdW50OiBzY2VuZVJlc3VsdC5tZXNoQ291bnQsXHJcbiAgICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICAgIGlzR2hvc3RlZDogZmFsc2UsXHJcbiAgICAgICAgb3BhY2l0eTogMS4wLFxyXG4gICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgIH07XHJcbiAgICAgIGxvYWRlZE1vZGVscy5zZXQobW9kZWxEb2NOYW1lLCBlbnRyeSk7XHJcblxyXG4gICAgICBzZXRTdGF0dXMoYExvYWRlZCAke21vZGVsRGF0YS5tb2RlbF9uYW1lfSBbJHtkaXNjfV06ICR7c2NlbmVSZXN1bHQubWVzaENvdW50LnRvdGFsfSBtZXNoZXMsICR7c2NlbmVSZXN1bHQubWVzaENvdW50LnRyaXN9IHRyaXNgKTtcclxuICAgICAgcmV0dXJuIGVudHJ5O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBtb2RlbCBnZW9tZXRyeScsIGUpO1xyXG4gICAgICBzZXRTdGF0dXMoYEVycm9yIGxvYWRpbmcgJHttb2RlbERvY05hbWV9OiAke2UubWVzc2FnZSB8fCBlfWApO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICAgICAgaW5GbGlnaHRMb2Fkcy5kZWxldGUobW9kZWxEb2NOYW1lKTtcclxuICAgIH1cclxuICB9KSgpO1xyXG5cclxuICBpbkZsaWdodExvYWRzLnNldChtb2RlbERvY05hbWUsIHByb21pc2UpO1xyXG4gIHJldHVybiBwcm9taXNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bmxvYWRNb2RlbChtb2RlbERvY05hbWUpIHtcclxuICBjb25zdCBtb2RlbEVudHJ5ID0gbG9hZGVkTW9kZWxzLmdldChtb2RlbERvY05hbWUpO1xyXG4gIGlmICghbW9kZWxFbnRyeSkgcmV0dXJuO1xyXG5cclxuICBpZiAoaWZjQXBpICYmIG1vZGVsRW50cnkuaWZjTW9kZWxJRCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0cnkgeyBpZmNBcGkuQ2xvc2VNb2RlbChtb2RlbEVudHJ5LmlmY01vZGVsSUQpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUud2FybignQ291bGQgbm90IGNsb3NlIElGQyBtb2RlbDonLCBlKTsgfVxyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlIGFsbCBlbGVtZW50SW5kZXggZW50cmllcyBiZWxvbmdpbmcgdG8gdGhpcyBtb2RlbFxyXG4gIGZvciAoY29uc3QgW2tleSwgdmFsXSBvZiBlbGVtZW50SW5kZXguZW50cmllcygpKSB7XHJcbiAgICBpZiAodmFsLm1vZGVsRG9jTmFtZSA9PT0gbW9kZWxEb2NOYW1lIHx8IGtleS5zdGFydHNXaXRoKGAke21vZGVsRG9jTmFtZX06YCkpIHtcclxuICAgICAgZWxlbWVudEluZGV4LmRlbGV0ZShrZXkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZmVkZXJhdGVkR3JvdXAucmVtb3ZlKG1vZGVsRW50cnkuZ3JvdXApO1xyXG4gIGRpc3Bvc2VHcm91cChtb2RlbEVudHJ5Lmdyb3VwKTtcclxuICBsb2FkZWRNb2RlbHMuZGVsZXRlKG1vZGVsRG9jTmFtZSk7XHJcbiAgdXBkYXRlRWxlbWVudE1lc2hlc0xpc3QoKTtcclxuICByZW5kZXJNb2RlbHNMaXN0KCk7XHJcbiAgc2V0U3RhdHVzKGBVbmxvYWRlZCAke21vZGVsRW50cnkubW9kZWxOYW1lfWApO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bmxvYWRBbGxNb2RlbHMoKSB7XHJcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICBpZiAoaWZjQXBpICYmIGVudHJ5LmlmY01vZGVsSUQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB0cnkgeyBpZmNBcGkuQ2xvc2VNb2RlbChlbnRyeS5pZmNNb2RlbElEKTsgfSBjYXRjaCAoZSkge31cclxuICAgIH1cclxuICAgIGZlZGVyYXRlZEdyb3VwLnJlbW92ZShlbnRyeS5ncm91cCk7XHJcbiAgICBkaXNwb3NlR3JvdXAoZW50cnkuZ3JvdXApO1xyXG4gIH0pO1xyXG4gIGxvYWRlZE1vZGVscy5jbGVhcigpO1xyXG4gIGVsZW1lbnRJbmRleC5jbGVhcigpO1xyXG4gIGVsZW1lbnRNZXNoZXMgPSBbXTtcclxuICBjbGFzaEhlbHBlcnNHcm91cC5jbGVhcigpO1xyXG4gIGNsZWFyU2VsZWN0aW9uKCk7XHJcbiAgcmVuZGVyTW9kZWxzTGlzdCgpO1xyXG4gIHNldFN0YXR1cygnQWxsIG1vZGVscyBjbGVhcmVkJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCkge1xyXG4gIGVsZW1lbnRNZXNoZXMgPSBbXTtcclxuICBsb2FkZWRNb2RlbHMuZm9yRWFjaCgoZW50cnksIG1vZGVsRG9jTmFtZSkgPT4ge1xyXG4gICAgZW50cnkuZXhwcmVzc01hcC5mb3JFYWNoKChtZXNoZXMsIGV4cHJlc3NJRCkgPT4ge1xyXG4gICAgICBtZXNoZXMuZm9yRWFjaChtID0+IHtcclxuICAgICAgICBtLnVzZXJEYXRhLm1vZGVsRG9jTmFtZSA9IG1vZGVsRG9jTmFtZTtcclxuICAgICAgICBtLnVzZXJEYXRhLmRpc2NpcGxpbmUgPSBlbnRyeS5kaXNjaXBsaW5lO1xyXG4gICAgICAgIGVsZW1lbnRNZXNoZXMucHVzaCh7IG1lc2g6IG0sIGV4cHJlc3NJRCwgbW9kZWxEb2NOYW1lLCBkaXNjaXBsaW5lOiBlbnRyeS5kaXNjaXBsaW5lIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG4gIHJlbmRlclNwYXRpYWxIaWVyYXJjaHlUcmVlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlclNwYXRpYWxIaWVyYXJjaHlUcmVlKCkge1xyXG4gIGNvbnN0IHRyZWVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tc3BhdGlhbC10cmVlJyk7XHJcbiAgaWYgKCF0cmVlRWwpIHJldHVybjtcclxuICBpZiAoIWxvYWRlZE1vZGVscy5zaXplKSB7XHJcbiAgICB0cmVlRWwuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+TG9hZCBtb2RlbHMgdG8gdmlldyBzcGF0aWFsIGhpZXJhcmNoeTwvZGl2Pic7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cmVlRWwuaW5uZXJIVE1MID0gJyc7XHJcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goKGVudHJ5LCBtb2RlbERvY05hbWUpID0+IHtcclxuICAgIGNvbnN0IG1vZGVsTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgbW9kZWxOb2RlLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICc2cHgnO1xyXG5cclxuICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICBoZWFkZXIuc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xyXG4gICAgaGVhZGVyLnN0eWxlLmdhcCA9ICc2cHgnO1xyXG4gICAgaGVhZGVyLnN0eWxlLmZvbnRXZWlnaHQgPSAnNjAwJztcclxuICAgIGhlYWRlci5zdHlsZS5jb2xvciA9ICcjZTJlOGYwJztcclxuXHJcbiAgICBjb25zdCBjaGsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgY2hrLnR5cGUgPSAnY2hlY2tib3gnO1xyXG4gICAgY2hrLmNoZWNrZWQgPSBlbnRyeS52aXNpYmxlICE9PSBmYWxzZTtcclxuICAgIGNoay5vbmNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgZW50cnkudmlzaWJsZSA9IGNoay5jaGVja2VkO1xyXG4gICAgICBlbnRyeS5ncm91cC52aXNpYmxlID0gY2hrLmNoZWNrZWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIGhlYWRlci5hcHBlbmRDaGlsZChjaGspO1xyXG4gICAgaGVhZGVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGBcdUQ4M0NcdURGRTIgJHtlbnRyeS5tb2RlbE5hbWV9IFske2VudHJ5LmRpc2NpcGxpbmV9XWApKTtcclxuICAgIG1vZGVsTm9kZS5hcHBlbmRDaGlsZChoZWFkZXIpO1xyXG5cclxuICAgIGNvbnN0IHN0b3JleU1hcCA9IG5ldyBNYXAoKTtcclxuICAgIChlbnRyeS5lbGVtZW50cyB8fCBbXSkuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgIGNvbnN0IHN0ID0gZWwuc3RvcmV5IHx8ICdHcm91bmQgTGV2ZWwnO1xyXG4gICAgICBpZiAoIXN0b3JleU1hcC5oYXMoc3QpKSBzdG9yZXlNYXAuc2V0KHN0LCBbXSk7XHJcbiAgICAgIHN0b3JleU1hcC5nZXQoc3QpLnB1c2goZWwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFzdG9yZXlNYXAuc2l6ZSkgc3RvcmV5TWFwLnNldCgnTGV2ZWwgMScsIFtdKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY2hpbGRDb250YWluZXIuc3R5bGUucGFkZGluZ0xlZnQgPSAnMThweCc7XHJcbiAgICBjaGlsZENvbnRhaW5lci5zdHlsZS5tYXJnaW5Ub3AgPSAnM3B4JztcclxuXHJcbiAgICBzdG9yZXlNYXAuZm9yRWFjaCgoZWxlbXMsIHN0b3JleU5hbWUpID0+IHtcclxuICAgICAgY29uc3Qgc3ROb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHN0Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgICBzdE5vZGUuc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xyXG4gICAgICBzdE5vZGUuc3R5bGUuZ2FwID0gJzRweCc7XHJcbiAgICAgIHN0Tm9kZS5zdHlsZS5jb2xvciA9ICcjOTRhM2I4JztcclxuXHJcbiAgICAgIGNvbnN0IHN0Q2hrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgc3RDaGsudHlwZSA9ICdjaGVja2JveCc7XHJcbiAgICAgIHN0Q2hrLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICBzdENoay5vbmNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICBlbGVtZW50TWVzaGVzLmZvckVhY2goKHsgbWVzaCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWU6IG1OYW1lIH0pID0+IHtcclxuICAgICAgICAgIGlmIChtTmFtZSA9PT0gbW9kZWxEb2NOYW1lKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZWxlbWVudEluZGV4LmdldChgJHttTmFtZX06JHtleHByZXNzSUR9YCk7XHJcbiAgICAgICAgICAgIGlmIChlbCAmJiAoZWwuc3RvcmV5IHx8ICdMZXZlbCAxJykgPT09IHN0b3JleU5hbWUpIHtcclxuICAgICAgICAgICAgICBtZXNoLnZpc2libGUgPSBzdENoay5jaGVja2VkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzdE5vZGUuYXBwZW5kQ2hpbGQoc3RDaGspO1xyXG4gICAgICBzdE5vZGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYFx1RDgzRFx1RENEMCAke3N0b3JleU5hbWV9YCkpO1xyXG4gICAgICBjaGlsZENvbnRhaW5lci5hcHBlbmRDaGlsZChzdE5vZGUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbW9kZWxOb2RlLmFwcGVuZENoaWxkKGNoaWxkQ29udGFpbmVyKTtcclxuICAgIHRyZWVFbC5hcHBlbmRDaGlsZChtb2RlbE5vZGUpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaXNwb3NlR3JvdXAoZ3JvdXApIHtcclxuICBncm91cC50cmF2ZXJzZShvID0+IHtcclxuICAgIGlmIChvLmlzTWVzaCkge1xyXG4gICAgICBpZiAoby5nZW9tZXRyeSkgby5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGlmIChvLm1hdGVyaWFsKSB7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoby5tYXRlcmlhbCkpIG8ubWF0ZXJpYWwuZm9yRWFjaChtID0+IG0uZGlzcG9zZSgpKTtcclxuICAgICAgICBlbHNlIG8ubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gRGlzY2lwbGluZSBMYXllciBDb250cm9scyAoVmlzaWJpbGl0eSwgR2hvc3RpbmcsIE9wYWNpdHkpIC0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gaW5pdERpc2NpcGxpbmVDb250cm9scygpIHtcclxuICBjb25zdCByb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc2NpcGxpbmUtbGF5ZXItcm93Jyk7XHJcbiAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XHJcbiAgICBjb25zdCBkaXNjID0gcm93LmRhdGFzZXQuZGlzY2lwbGluZTtcclxuICAgIGNvbnN0IGJ0blZpcyA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuYnRuLXZpcycpO1xyXG4gICAgY29uc3QgYnRuR2hvc3QgPSByb3cucXVlcnlTZWxlY3RvcignLmJ0bi1naG9zdCcpO1xyXG4gICAgY29uc3QgYnRuU29sbyA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuYnRuLXNvbG8nKTtcclxuICAgIGNvbnN0IHNsaWRlciA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGlzYy1vcGFjaXR5LXNsaWRlcicpO1xyXG4gICAgY29uc3QgdmFsVGV4dCA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGlzYy1vcGFjaXR5LXZhbCcpO1xyXG5cclxuICAgIGlmIChidG5WaXMpIHtcclxuICAgICAgYnRuVmlzLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNDdXJyZW50bHlWaXMgPSBidG5WaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKTtcclxuICAgICAgICBzZXREaXNjaXBsaW5lVmlzaWJpbGl0eShkaXNjLCAhaXNDdXJyZW50bHlWaXMpO1xyXG4gICAgICAgIGJ0blZpcy5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCAhaXNDdXJyZW50bHlWaXMpO1xyXG4gICAgICAgIGJ0blZpcy50ZXh0Q29udGVudCA9ICFpc0N1cnJlbnRseVZpcyA/ICdcdUQ4M0RcdURDNDEnIDogJ1x1RDgzRFx1REVBQic7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJ0bkdob3N0KSB7XHJcbiAgICAgIGJ0bkdob3N0Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNHaG9zdCA9IGJ0bkdob3N0LmNsYXNzTGlzdC5jb250YWlucygnZ2hvc3QtYWN0aXZlJyk7XHJcbiAgICAgICAgc2V0RGlzY2lwbGluZUdob3N0aW5nKGRpc2MsICFpc0dob3N0KTtcclxuICAgICAgICBidG5HaG9zdC5jbGFzc0xpc3QudG9nZ2xlKCdnaG9zdC1hY3RpdmUnLCAhaXNHaG9zdCk7XHJcbiAgICAgICAgaWYgKCFpc0dob3N0KSB7XHJcbiAgICAgICAgICBpZiAoc2xpZGVyKSBzbGlkZXIudmFsdWUgPSAyMDtcclxuICAgICAgICAgIGlmICh2YWxUZXh0KSB2YWxUZXh0LnRleHRDb250ZW50ID0gJzIwJSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChzbGlkZXIpIHNsaWRlci52YWx1ZSA9IDEwMDtcclxuICAgICAgICAgIGlmICh2YWxUZXh0KSB2YWxUZXh0LnRleHRDb250ZW50ID0gJzEwMCUnO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYnRuU29sbykge1xyXG4gICAgICBidG5Tb2xvLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgcm93cy5mb3JFYWNoKHIgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZCA9IHIuZGF0YXNldC5kaXNjaXBsaW5lO1xyXG4gICAgICAgICAgY29uc3QgdkJ0biA9IHIucXVlcnlTZWxlY3RvcignLmJ0bi12aXMnKTtcclxuICAgICAgICAgIGlmIChkID09PSBkaXNjKSB7XHJcbiAgICAgICAgICAgIHNldERpc2NpcGxpbmVWaXNpYmlsaXR5KGQsIHRydWUpO1xyXG4gICAgICAgICAgICBpZiAodkJ0bikgeyB2QnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOyB2QnRuLnRleHRDb250ZW50ID0gJ1x1RDgzRFx1REM0MSc7IH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldERpc2NpcGxpbmVWaXNpYmlsaXR5KGQsIGZhbHNlKTtcclxuICAgICAgICAgICAgaWYgKHZCdG4pIHsgdkJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTsgdkJ0bi50ZXh0Q29udGVudCA9ICdcdUQ4M0RcdURFQUInOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2V0U3RhdHVzKGBTb2xvOiAke2Rpc2N9YCk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNsaWRlcikge1xyXG4gICAgICBzbGlkZXIub25pbnB1dCA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBvcFZhbCA9IHBhcnNlSW50KHNsaWRlci52YWx1ZSwgMTApIC8gMTAwLjA7XHJcbiAgICAgICAgaWYgKHZhbFRleHQpIHZhbFRleHQudGV4dENvbnRlbnQgPSBgJHtzbGlkZXIudmFsdWV9JWA7XHJcbiAgICAgICAgc2V0RGlzY2lwbGluZU9wYWNpdHkoZGlzYywgb3BWYWwpO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXREaXNjaXBsaW5lVmlzaWJpbGl0eShkaXNjaXBsaW5lLCB2aXNpYmxlKSB7XHJcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NpcGxpbmUpKSB7XHJcbiAgICAgIGVudHJ5LnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgICBlbnRyeS5ncm91cC52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0RGlzY2lwbGluZUdob3N0aW5nKGRpc2NpcGxpbmUsIGdob3N0ZWQpIHtcclxuICBsb2FkZWRNb2RlbHMuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICBpZiAoZGlzY2lwbGluZU1hdGNoZXMoZW50cnkuZGlzY2lwbGluZSwgZGlzY2lwbGluZSkpIHtcclxuICAgICAgZW50cnkuaXNHaG9zdGVkID0gZ2hvc3RlZDtcclxuICAgICAgZW50cnkuZ3JvdXAudHJhdmVyc2UobyA9PiB7XHJcbiAgICAgICAgaWYgKG8uaXNNZXNoICYmIG8ubWF0ZXJpYWwpIHtcclxuICAgICAgICAgIGlmICghby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcykge1xyXG4gICAgICAgICAgICBvLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzID0ge1xyXG4gICAgICAgICAgICAgIGNvbG9yOiBvLm1hdGVyaWFsLmNvbG9yLmNsb25lKCksXHJcbiAgICAgICAgICAgICAgb3BhY2l0eTogby5tYXRlcmlhbC5vcGFjaXR5LFxyXG4gICAgICAgICAgICAgIHRyYW5zcGFyZW50OiBvLm1hdGVyaWFsLnRyYW5zcGFyZW50LFxyXG4gICAgICAgICAgICAgIGRlcHRoV3JpdGU6IG8ubWF0ZXJpYWwuZGVwdGhXcml0ZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChnaG9zdGVkKSB7XHJcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBvLm1hdGVyaWFsLm9wYWNpdHkgPSAwLjIwO1xyXG4gICAgICAgICAgICBvLm1hdGVyaWFsLmRlcHRoV3JpdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgby5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHg5NGEzYjgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcCA9IG8udXNlckRhdGEub3JpZ01hdGVyaWFsUHJvcHM7XHJcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBwLnRyYW5zcGFyZW50O1xyXG4gICAgICAgICAgICBvLm1hdGVyaWFsLm9wYWNpdHkgPSBwLm9wYWNpdHk7XHJcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwuZGVwdGhXcml0ZSA9IHAuZGVwdGhXcml0ZTtcclxuICAgICAgICAgICAgby5tYXRlcmlhbC5jb2xvci5jb3B5KHAuY29sb3IpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldERpc2NpcGxpbmVPcGFjaXR5KGRpc2NpcGxpbmUsIG9wYWNpdHkpIHtcclxuICBsb2FkZWRNb2RlbHMuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICBpZiAoZGlzY2lwbGluZU1hdGNoZXMoZW50cnkuZGlzY2lwbGluZSwgZGlzY2lwbGluZSkpIHtcclxuICAgICAgZW50cnkub3BhY2l0eSA9IG9wYWNpdHk7XHJcbiAgICAgIGVudHJ5Lmdyb3VwLnRyYXZlcnNlKG8gPT4ge1xyXG4gICAgICAgIGlmIChvLmlzTWVzaCAmJiBvLm1hdGVyaWFsKSB7XHJcbiAgICAgICAgICBpZiAoIW8udXNlckRhdGEub3JpZ01hdGVyaWFsUHJvcHMpIHtcclxuICAgICAgICAgICAgby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcyA9IHtcclxuICAgICAgICAgICAgICBjb2xvcjogby5tYXRlcmlhbC5jb2xvci5jbG9uZSgpLFxyXG4gICAgICAgICAgICAgIG9wYWNpdHk6IG8ubWF0ZXJpYWwub3BhY2l0eSxcclxuICAgICAgICAgICAgICB0cmFuc3BhcmVudDogby5tYXRlcmlhbC50cmFuc3BhcmVudCxcclxuICAgICAgICAgICAgICBkZXB0aFdyaXRlOiBvLm1hdGVyaWFsLmRlcHRoV3JpdGUsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gb3BhY2l0eSA8IDAuOTg7XHJcbiAgICAgICAgICBvLm1hdGVyaWFsLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICAgICAgby5tYXRlcmlhbC5kZXB0aFdyaXRlID0gb3BhY2l0eSA+PSAwLjg1O1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc2NpcGxpbmVNYXRjaGVzKG1vZGVsRGlzYywgdGFyZ2V0RGlzYykge1xyXG4gIGlmICghbW9kZWxEaXNjIHx8ICF0YXJnZXREaXNjKSByZXR1cm4gZmFsc2U7XHJcbiAgY29uc3QgbSA9IG1vZGVsRGlzYy50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHQgPSB0YXJnZXREaXNjLnRvTG93ZXJDYXNlKCk7XHJcbiAgaWYgKG0gPT09IHQpIHJldHVybiB0cnVlO1xyXG4gIGlmICh0ID09PSAnbWVwJyAmJiAobS5pbmNsdWRlcygnaHZhYycpIHx8IG0uaW5jbHVkZXMoJ3BsdW1iJykgfHwgbS5pbmNsdWRlcygnZWxlYycpIHx8IG0uaW5jbHVkZXMoJ21lY2gnKSkpIHJldHVybiB0cnVlO1xyXG4gIGlmICh0ID09PSAnc3RydWN0dXJhbCcgJiYgKG0uaW5jbHVkZXMoJ3N0cnVjJykgfHwgbS5pbmNsdWRlcygnc3RyJykpKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAodCA9PT0gJ2FyY2hpdGVjdHVyZScgJiYgKG0uaW5jbHVkZXMoJ2FyaycpIHx8IG0uaW5jbHVkZXMoJ2FyY2gnKSkpIHJldHVybiB0cnVlO1xyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBFbGVtZW50IFNlbGVjdGlvbiAmIFByb3BlcnR5IEluc3BlY3RvciAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xyXG4gIGN1cnJlbnRTZWxlY3Rpb24gPSBudWxsO1xyXG4gIGlmIChlbHMucHJvcHMpIGVscy5wcm9wcy5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5ObyBzZWxlY3Rpb248L2Rpdj4nO1xyXG4gIGlmIChlbHMucHJvcHNUaXRsZSkge1xyXG4gICAgZWxzLnByb3BzVGl0bGUudGV4dENvbnRlbnQgPSAnQ2xpY2sgYW4gZWxlbWVudCBpbiB0aGUgdmlld2VyJztcclxuICAgIGVscy5wcm9wc1RpdGxlLmNsYXNzTmFtZSA9ICdlbXB0eS1oaW50JztcclxuICB9XHJcbiAgaWYgKGVscy5saW5rcykgZWxzLmxpbmtzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGxpbmtzPC9kaXY+JztcclxuXHJcbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2ggfSkgPT4ge1xyXG4gICAgaWYgKG1lc2gudXNlckRhdGEub3JpZ0NvbG9yKSB7XHJcbiAgICAgIG1lc2gubWF0ZXJpYWwuY29sb3IuY29weShtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcik7XHJcbiAgICB9XHJcbiAgICBpZiAobWVzaC5tYXRlcmlhbC5lbWlzc2l2ZSkgbWVzaC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoMHgwMDAwMDApO1xyXG4gICAgY29uc3QgcCA9IG1lc2gudXNlckRhdGEub3JpZ01hdGVyaWFsUHJvcHM7XHJcbiAgICBpZiAocCkge1xyXG4gICAgICBtZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gcC50cmFuc3BhcmVudDtcclxuICAgICAgbWVzaC5tYXRlcmlhbC5vcGFjaXR5ID0gcC5vcGFjaXR5O1xyXG4gICAgICBtZXNoLm1hdGVyaWFsLmRlcHRoV3JpdGUgPSBwLmRlcHRoV3JpdGU7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNlbGVjdEVsZW1lbnQobWVzaCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWUpIHtcclxuICBjbGVhclNlbGVjdGlvbigpO1xyXG4gIGNvbnN0IGxvb2t1cEtleSA9IGAke21vZGVsRG9jTmFtZX06JHtleHByZXNzSUR9YDtcclxuICBsZXQgZWwgPSBlbGVtZW50SW5kZXguZ2V0KGxvb2t1cEtleSkgfHwgZWxlbWVudEluZGV4LmdldChTdHJpbmcoZXhwcmVzc0lEKSkgfHwgbWVzaC51c2VyRGF0YS5lbGVtZW50O1xyXG5cclxuICBjdXJyZW50U2VsZWN0aW9uID0geyBtZXNoLCBlbGVtZW50OiBlbCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWUgfTtcclxuXHJcbiAgaWYgKCFtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcikgbWVzaC51c2VyRGF0YS5vcmlnQ29sb3IgPSBtZXNoLm1hdGVyaWFsLmNvbG9yLmNsb25lKCk7XHJcbiAgbWVzaC5tYXRlcmlhbC5jb2xvci5jb3B5KGhpZ2hsaWdodE1hdC5jb2xvcik7XHJcbiAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuY29weShoaWdobGlnaHRNYXQuZW1pc3NpdmUpO1xyXG5cclxuICBjb25zdCBtb2RlbEVudHJ5ID0gbG9hZGVkTW9kZWxzLmdldChtb2RlbERvY05hbWUpO1xyXG4gIGNvbnN0IGRpc2NpcGxpbmUgPSAobW9kZWxFbnRyeSAmJiBtb2RlbEVudHJ5LmRpc2NpcGxpbmUpIHx8IG1lc2gudXNlckRhdGEuZGlzY2lwbGluZSB8fCAnRGlzY2lwbGluZSc7XHJcbiAgY29uc3QgbW9kZWxOYW1lID0gKG1vZGVsRW50cnkgJiYgbW9kZWxFbnRyeS5tb2RlbE5hbWUpIHx8IG1vZGVsRG9jTmFtZTtcclxuXHJcbiAgcmVuZGVyRWxlbWVudEluc3BlY3RvcihlbCwgZXhwcmVzc0lELCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUsIG1lc2gpO1xyXG5cclxuICBpZiAoZWwgJiYgKCFlbC5wcm9wZXJ0aWVzIHx8ICFPYmplY3Qua2V5cyhlbC5wcm9wZXJ0aWVzKS5sZW5ndGgpKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmdWxsRG9jID0gYXdhaXQgZnJhcHBlLmNhbGwoeyBtZXRob2Q6IEFQSS5nZXRfZWxlbWVudCwgYXJnczogeyBlbGVtZW50OiBlbC5uYW1lIH0gfSk7XHJcbiAgICAgIGlmIChmdWxsRG9jLm1lc3NhZ2UgJiYgY3VycmVudFNlbGVjdGlvbiAmJiBjdXJyZW50U2VsZWN0aW9uLmV4cHJlc3NJRCA9PT0gZXhwcmVzc0lEKSB7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihlbCwgZnVsbERvYy5tZXNzYWdlKTtcclxuICAgICAgICByZW5kZXJFbGVtZW50SW5zcGVjdG9yKGVsLCBleHByZXNzSUQsIG1vZGVsTmFtZSwgZGlzY2lwbGluZSwgbWVzaCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHt9XHJcbiAgfSBlbHNlIGlmICghZWwgJiYgbW9kZWxFbnRyeSAmJiBpZmNBcGkpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxpbmVEYXRhID0gYXdhaXQgaWZjQXBpLkdldExpbmUobW9kZWxFbnRyeS5pZmNNb2RlbElELCBleHByZXNzSUQpO1xyXG4gICAgICByZW5kZXJXZWJJZmNJbnNwZWN0b3IoZXhwcmVzc0lELCBsaW5lRGF0YSwgbW9kZWxOYW1lLCBkaXNjaXBsaW5lKTtcclxuICAgIH0gY2F0Y2ggKGUpIHt9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJFbGVtZW50SW5zcGVjdG9yKGVsLCBleHByZXNzSUQsIG1vZGVsTmFtZSwgZGlzY2lwbGluZSwgbWVzaCkge1xyXG4gIGlmICghZWxzLnByb3BzVGl0bGUgfHwgIWVscy5wcm9wcykgcmV0dXJuO1xyXG5cclxuICBjb25zdCB0aXRsZSA9IChlbCAmJiAoZWwudGl0bGUgfHwgZWwuZWxlbWVudF90eXBlKSkgfHwgYElGQyAjJHtleHByZXNzSUR9YDtcclxuICBjb25zdCBndWlkID0gKGVsICYmIGVsLnN0YWJsZV9pZCkgfHwgJyc7XHJcbiAgZWxzLnByb3BzVGl0bGUudGV4dENvbnRlbnQgPSBgJHt0aXRsZX0gJHtndWlkID8gYCgke2d1aWR9KWAgOiAnJ31gO1xyXG4gIGVscy5wcm9wc1RpdGxlLmNsYXNzTmFtZSA9ICcnO1xyXG4gIGVscy5wcm9wcy5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgLy8gQmFkZ2VzIEhlYWRlclxyXG4gIGNvbnN0IGJhZGdlc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIGJhZGdlc0Rpdi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnOHB4JztcclxuICBiYWRnZXNEaXYuaW5uZXJIVE1MID0gYFxyXG4gICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgbW9kZWwtYmFkZ2VcIj4ke21vZGVsTmFtZX08L3NwYW4+XHJcbiAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZGlzY2lwbGluZX08L3NwYW4+XHJcbiAgICAke2VsICYmIGVsLnN0b3JleSA/IGA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZWwuc3RvcmV5fTwvc3Bhbj5gIDogJyd9XHJcbiAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiMke2V4cHJlc3NJRH08L3NwYW4+XHJcbiAgYDtcclxuICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQoYmFkZ2VzRGl2KTtcclxuXHJcbiAgLy8gQm91bmRpbmcgQm94IEluZm9cclxuICBpZiAobWVzaCAmJiBtZXNoLmdlb21ldHJ5KSB7XHJcbiAgICBpZiAoIW1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3gpIG1lc2guZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KCk7XHJcbiAgICBjb25zdCBib3ggPSBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94LmNsb25lKCkuYXBwbHlNYXRyaXg0KG1lc2gubWF0cml4V29ybGQpO1xyXG4gICAgY29uc3Qgc2l6ZSA9IGJveC5nZXRTaXplKG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xyXG4gICAgY29uc3QgY2VudGVyID0gYm94LmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcclxuXHJcbiAgICBjb25zdCBiYm94SGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBiYm94SGVhZGVyLnN0eWxlLmNzc1RleHQgPSAnZm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxMnB4O21hcmdpbjo4cHggMCA0cHg7Y29sb3I6IzFlMjkzYic7XHJcbiAgICBiYm94SGVhZGVyLnRleHRDb250ZW50ID0gJ1NwYXRpYWwgRGltZW5zaW9ucyc7XHJcbiAgICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQoYmJveEhlYWRlcik7XHJcblxyXG4gICAgY29uc3QgYmJveFRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgIGJib3hUYWJsZS5jbGFzc05hbWUgPSAncHJvcGVydHktdGFibGUnO1xyXG4gICAgYmJveFRhYmxlLmlubmVySFRNTCA9IGBcclxuICAgICAgPHRyPjx0ZD5TaXplIChYIFx1MDBENyBZIFx1MDBENyBaKTwvdGQ+PHRkPiR7c2l6ZS54LnRvRml4ZWQoMil9bSBcdTAwRDcgJHtzaXplLnkudG9GaXhlZCgyKX1tIFx1MDBENyAke3NpemUuei50b0ZpeGVkKDIpfW08L3RkPjwvdHI+XHJcbiAgICAgIDx0cj48dGQ+Q2VudGVyIFBvaW50PC90ZD48dGQ+KCR7Y2VudGVyLngudG9GaXhlZCgyKX0sICR7Y2VudGVyLnkudG9GaXhlZCgyKX0sICR7Y2VudGVyLnoudG9GaXhlZCgyKX0pPC90ZD48L3RyPlxyXG4gICAgYDtcclxuICAgIGVscy5wcm9wcy5hcHBlbmRDaGlsZChiYm94VGFibGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gUXVhbnRpdGllcyBUYWJsZVxyXG4gIGNvbnN0IHEgPSAoZWwgJiYgZWwucXVhbnRpdGllcykgfHwge307XHJcbiAgY29uc3QgcUtleXMgPSBPYmplY3Qua2V5cyhxKTtcclxuICBpZiAocUtleXMubGVuZ3RoKSB7XHJcbiAgICBjb25zdCBxSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBxSGVhZGVyLnN0eWxlLmNzc1RleHQgPSAnZm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxMnB4O21hcmdpbjoxMHB4IDAgNHB4O2NvbG9yOiMxZTI5M2InO1xyXG4gICAgcUhlYWRlci50ZXh0Q29udGVudCA9ICdRdWFudGl0aWVzIChRdG9fKiknO1xyXG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHFIZWFkZXIpO1xyXG5cclxuICAgIGNvbnN0IHFUYWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICBxVGFibGUuY2xhc3NOYW1lID0gJ3Byb3BlcnR5LXRhYmxlJztcclxuICAgIHFLZXlzLmZvckVhY2goayA9PiB7XHJcbiAgICAgIGNvbnN0IHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgdHIuaW5uZXJIVE1MID0gYDx0ZD4ke2t9PC90ZD48dGQ+JHtxW2tdfTwvdGQ+YDtcclxuICAgICAgcVRhYmxlLmFwcGVuZENoaWxkKHRyKTtcclxuICAgIH0pO1xyXG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHFUYWJsZSk7XHJcbiAgfVxyXG5cclxuICAvLyBQcm9wZXJ0eSBTZXRzIFRhYmxlXHJcbiAgY29uc3QgcCA9IChlbCAmJiBlbC5wcm9wZXJ0aWVzKSB8fCB7fTtcclxuICBjb25zdCBwS2V5cyA9IE9iamVjdC5rZXlzKHApLmZpbHRlcihrID0+ICFbJ2lmY19pZCcsICdpZmNfdHlwZSddLmluY2x1ZGVzKGspKTtcclxuICBpZiAocEtleXMubGVuZ3RoKSB7XHJcbiAgICBjb25zdCBwSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBwSGVhZGVyLnN0eWxlLmNzc1RleHQgPSAnZm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxMnB4O21hcmdpbjoxMHB4IDAgNHB4O2NvbG9yOiMxZTI5M2InO1xyXG4gICAgcEhlYWRlci50ZXh0Q29udGVudCA9ICdQcm9wZXJ0eSBTZXRzIChQc2V0XyopJztcclxuICAgIGVscy5wcm9wcy5hcHBlbmRDaGlsZChwSGVhZGVyKTtcclxuXHJcbiAgICBjb25zdCBwVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG4gICAgcFRhYmxlLmNsYXNzTmFtZSA9ICdwcm9wZXJ0eS10YWJsZSc7XHJcbiAgICBwS2V5cy5zbGljZSgwLCA1MCkuZm9yRWFjaChrID0+IHtcclxuICAgICAgY29uc3QgdiA9IHR5cGVvZiBwW2tdID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHBba10pIDogU3RyaW5nKHBba10pO1xyXG4gICAgICBjb25zdCB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgIHRyLmlubmVySFRNTCA9IGA8dGQ+JHtrfTwvdGQ+PHRkPiR7di5zbGljZSgwLCA3MCl9PC90ZD5gO1xyXG4gICAgICBwVGFibGUuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfSk7XHJcbiAgICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQocFRhYmxlKTtcclxuICB9XHJcblxyXG4gIGlmIChlbCAmJiBlbC5uYW1lKSBsb2FkQm9xTGlua3MoZWwubmFtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlcldlYklmY0luc3BlY3RvcihleHByZXNzSUQsIHByb3BzLCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUpIHtcclxuICBpZiAoIWVscy5wcm9wc1RpdGxlIHx8ICFlbHMucHJvcHMpIHJldHVybjtcclxuICBlbHMucHJvcHNUaXRsZS50ZXh0Q29udGVudCA9IGBJRkMgIyR7ZXhwcmVzc0lEfSAke3Byb3BzLnR5cGUgfHwgJyd9YDtcclxuICBlbHMucHJvcHNUaXRsZS5jbGFzc05hbWUgPSAnJztcclxuICBlbHMucHJvcHMuaW5uZXJIVE1MID0gYFxyXG4gICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206OHB4XCI+XHJcbiAgICAgIDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlIG1vZGVsLWJhZGdlXCI+JHttb2RlbE5hbWV9PC9zcGFuPlxyXG4gICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZGlzY2lwbGluZX08L3NwYW4+XHJcbiAgICA8L2Rpdj5cclxuICBgO1xyXG5cclxuICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgdGFibGUuY2xhc3NOYW1lID0gJ3Byb3BlcnR5LXRhYmxlJztcclxuICBPYmplY3Qua2V5cyhwcm9wcykuc2xpY2UoMCwgMzApLmZvckVhY2goayA9PiB7XHJcbiAgICBjb25zdCB2ID0gcHJvcHNba107XHJcbiAgICBjb25zdCB2YWwgPSB2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2LnZhbHVlICE9PSB1bmRlZmluZWQgPyB2LnZhbHVlIDogKHR5cGVvZiB2ID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHYpLnNsaWNlKDAsIDYwKSA6IHYpO1xyXG4gICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgdHIuaW5uZXJIVE1MID0gYDx0ZD4ke2t9PC90ZD48dGQ+JHtTdHJpbmcodmFsKX08L3RkPmA7XHJcbiAgICB0YWJsZS5hcHBlbmRDaGlsZCh0cik7XHJcbiAgfSk7XHJcbiAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHRhYmxlKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZEJvcUxpbmtzKGJpbUVsZW1lbnQpIHtcclxuICBpZiAoIWVscy5saW5rcykgcmV0dXJuO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7IG1ldGhvZDogQVBJLmxpc3RfYm9xX2xpbmtzLCBhcmdzOiB7IGJpbV9lbGVtZW50OiBiaW1FbGVtZW50IH0gfSk7XHJcbiAgICBjb25zdCBsaW5rcyA9IHJlcy5tZXNzYWdlIHx8IFtdO1xyXG4gICAgaWYgKCFsaW5rcy5sZW5ndGgpIHtcclxuICAgICAgZWxzLmxpbmtzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGxpbmtzIGZvciBjdXJyZW50IGVsZW1lbnQ8L2Rpdj4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBlbHMubGlua3MuaW5uZXJIVE1MID0gbGlua3MubWFwKGwgPT4gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwibGluay1yb3dcIiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzo0cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZjFmNWY5O2ZvbnQtc2l6ZToxMnB4XCI+XHJcbiAgICAgICAgPHNwYW4+JHtsLmJvcV9yZWZlcmVuY2VfbmFtZX0gPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2VcIj4ke2wuYm9xX3JlZmVyZW5jZV90eXBlfTwvc3Bhbj48L3NwYW4+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImRlbFwiIGRhdGEtbmFtZT1cIiR7bC5uYW1lfVwiIHN0eWxlPVwiY29sb3I6I2VmNDQ0NDtib3JkZXI6bm9uZTtiYWNrZ3JvdW5kOm5vbmU7Y3Vyc29yOnBvaW50ZXJcIj5cdTI3MTU8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgKS5qb2luKCcnKTtcclxuXHJcbiAgICBlbHMubGlua3MucXVlcnlTZWxlY3RvckFsbCgnLmRlbCcpLmZvckVhY2goYiA9PiB7XHJcbiAgICAgIGIub25jbGljayA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICBhd2FpdCBmcmFwcGUuY2FsbCh7IG1ldGhvZDogQVBJLmRlbGV0ZV9ib3FfbGluaywgYXJnczogeyBsaW5rOiBiLmRhdGFzZXQubmFtZSB9IH0pO1xyXG4gICAgICAgIGxvYWRCb3FMaW5rcyhiaW1FbGVtZW50KTtcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGVscy5saW5rcy5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5FcnJvciBsb2FkaW5nIGxpbmtzPC9kaXY+JztcclxuICB9XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gSW4tVmlld2VyIEJWSCBDbGFzaCBEZXRlY3Rpb24gRW5naW5lIC0tLS0tLS0tLS0tLS0tLS1cclxuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNsYXNoRGV0ZWN0aW9uKCkge1xyXG4gIGNvbnN0IGRpc2NBID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kaXNjLWEnKSB8fCB7fSkudmFsdWUgfHwgJ1N0cnVjdHVyYWwnO1xyXG4gIGNvbnN0IGRpc2NCID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kaXNjLWInKSB8fCB7fSkudmFsdWUgfHwgJ01FUCc7XHJcbiAgY29uc3QgdG9sSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtdG9sZXJhbmNlJyk7XHJcbiAgY29uc3QgdG9sZXJhbmNlID0gdG9sSW5wdXQgPyBwYXJzZUZsb2F0KHRvbElucHV0LnZhbHVlKSB8fCAwLjAgOiAwLjA7XHJcblxyXG4gIHNldFN0YXR1cyhgUnVubmluZyBCVkggY2xhc2ggY2hlY2sgYmV0d2VlbiAke2Rpc2NBfSBhbmQgJHtkaXNjQn1cdTIwMjZgKTtcclxuICBzaG93TG9hZGluZygnQ29tcHV0aW5nIG1lc2ggQlZIIGludGVyc2VjdGlvbnNcdTIwMjYnLCB0cnVlKTtcclxuXHJcbiAgY29uc3QgbWVzaGVzQSA9IFtdO1xyXG4gIGNvbnN0IG1lc2hlc0IgPSBbXTtcclxuXHJcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NBKSkge1xyXG4gICAgICBlbnRyeS5ncm91cC50cmF2ZXJzZShvID0+IHsgaWYgKG8uaXNNZXNoKSBtZXNoZXNBLnB1c2gobyk7IH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NCKSkge1xyXG4gICAgICBlbnRyeS5ncm91cC50cmF2ZXJzZShvID0+IHsgaWYgKG8uaXNNZXNoKSBtZXNoZXNCLnB1c2gobyk7IH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBpZiAoIW1lc2hlc0EubGVuZ3RoIHx8ICFtZXNoZXNCLmxlbmd0aCkge1xyXG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICAgIHNldFN0YXR1cyhgQ2Fubm90IHJ1biBjbGFzaCBjaGVjazogTWFrZSBzdXJlIG1vZGVscyBmb3IgYm90aCAke2Rpc2NBfSBhbmQgJHtkaXNjQn0gYXJlIGxvYWRlZC5gKTtcclxuICAgIGlmIChlbHMuY2xhc2hDYXJkc0xpc3QpIHtcclxuICAgICAgZWxzLmNsYXNoQ2FyZHNMaXN0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPkxvYWQgbW9kZWxzIGZvciBib3RoICR7ZGlzY0F9IGFuZCAke2Rpc2NCfSBmaXJzdDwvZGl2PmA7XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBFeGVjdXRlIHR3by10aWVyIEJWSCBjb2xsaXNpb24gZGV0ZWN0aW9uXHJcbiAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgY29uc3QgcmVzdWx0ID0gZGV0ZWN0Q2xhc2hlcyhtZXNoZXNBLCBtZXNoZXNCLCB7IHRvbGVyYW5jZSB9KTtcclxuICBjb25zdCBkdXJhdGlvbiA9IChwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZSkudG9GaXhlZCgwKTtcclxuXHJcbiAgZGV0ZWN0ZWRDbGFzaGVzID0gcmVzdWx0LmNsYXNoZXMgfHwgW107XHJcbiAgc2V0U3RhdHVzKGBDbGFzaCBjaGVjayBjb21wbGV0ZTogJHtkZXRlY3RlZENsYXNoZXMubGVuZ3RofSBjbGFzaGVzIGRldGVjdGVkIGluICR7ZHVyYXRpb259bXMgKCR7cmVzdWx0LnN0YXRzLm5hcnJvd3BoYXNlQ2hlY2tzfSBCVkggY2hlY2tzKWApO1xyXG4gIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcblxyXG4gIHJlbmRlckNsYXNoZXNMaXN0KCk7XHJcblxyXG4gIC8vIFN3aXRjaCB0byBDbGFzaGVzIHRhYlxyXG4gIGNvbnN0IHRhYkJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWItYnRuLWNsYXNoZXMnKTtcclxuICBpZiAodGFiQnRuKSB0YWJCdG4uY2xpY2soKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyQ2xhc2hlc0xpc3QoKSB7XHJcbiAgaWYgKCFlbHMuY2xhc2hDYXJkc0xpc3QpIHJldHVybjtcclxuICBlbHMuY2xhc2hDYXJkc0xpc3QuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIGlmIChlbHMuY2xhc2hCYWRnZUNvdW50KSB7XHJcbiAgICBlbHMuY2xhc2hCYWRnZUNvdW50LnRleHRDb250ZW50ID0gZGV0ZWN0ZWRDbGFzaGVzLmxlbmd0aDtcclxuICAgIGVscy5jbGFzaEJhZGdlQ291bnQuc3R5bGUuZGlzcGxheSA9IGRldGVjdGVkQ2xhc2hlcy5sZW5ndGggPyAnaW5saW5lLWJsb2NrJyA6ICdub25lJztcclxuICB9XHJcblxyXG4gIGlmICghZGV0ZWN0ZWRDbGFzaGVzLmxlbmd0aCkge1xyXG4gICAgZWxzLmNsYXNoQ2FyZHNMaXN0LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGNsYXNoZXMgZGV0ZWN0ZWQgYmV0d2VlbiBzZWxlY3RlZCBkaXNjaXBsaW5lcyE8L2Rpdj4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2V2RmlsdGVyID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1maWx0ZXItc2V2ZXJpdHknKSB8fCB7fSkudmFsdWUgfHwgJyc7XHJcbiAgY29uc3QgZmlsdGVyZWQgPSBzZXZGaWx0ZXIgPyBkZXRlY3RlZENsYXNoZXMuZmlsdGVyKGMgPT4gYy5zZXZlcml0eSA9PT0gc2V2RmlsdGVyKSA6IGRldGVjdGVkQ2xhc2hlcztcclxuXHJcbiAgZmlsdGVyZWQuZm9yRWFjaCgoY2xhc2gpID0+IHtcclxuICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGNhcmQuY2xhc3NOYW1lID0gJ2NsYXNoLWNhcmQnICsgKGFjdGl2ZUNsYXNoICYmIGFjdGl2ZUNsYXNoLmlkID09PSBjbGFzaC5pZCA/ICcgYWN0aXZlJyA6ICcnKTtcclxuICAgIGNvbnN0IHB0ID0gY2xhc2guY29sbGlzaW9uUG9pbnQ7XHJcbiAgICBjb25zdCBzZXZDbGFzcyA9IGNsYXNoLnNldmVyaXR5ID8gYHNldmVyaXR5LSR7Y2xhc2guc2V2ZXJpdHkudG9Mb3dlckNhc2UoKX1gIDogJ3NldmVyaXR5LW1pbm9yJztcclxuXHJcbiAgICBjYXJkLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNhcmQtdGl0bGVcIj4ke2NsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmV9ICMke2NsYXNoLmVsZW1lbnRBLmV4cHJlc3NJRH0gXHUwMEQ3ICR7Y2xhc2guZWxlbWVudEIuZGlzY2lwbGluZX0gIyR7Y2xhc2guZWxlbWVudEIuZXhwcmVzc0lEfTwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY2FyZC1tZXRhXCI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgJHtzZXZDbGFzc31cIj4ke2NsYXNoLnNldmVyaXR5fTwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZSBzdGF0dXMtb3BlblwiPiR7Y2xhc2guc3RhdHVzfTwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZSBtb2RlbC1iYWRnZVwiPiR7Y2xhc2guZWxlbWVudEEuaWZjVHlwZSB8fCAnRWxlbWVudCd9IC8gJHtjbGFzaC5lbGVtZW50Qi5pZmNUeXBlIHx8ICdFbGVtZW50J308L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY2FyZC1jb29yZHNcIj5YWVo6ICgke3B0LngudG9GaXhlZCgyKX0sICR7cHQueS50b0ZpeGVkKDIpfSwgJHtwdC56LnRvRml4ZWQoMil9KSB8IERlcHRoOiAke2NsYXNoLnBlbmV0cmF0aW9uRGVwdGggPyBjbGFzaC5wZW5ldHJhdGlvbkRlcHRoLnRvRml4ZWQoMSkgOiAnMCd9bW08L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNhcmQtYWN0aW9uc1wiPlxyXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzIGJ0bi1mbHlcIj5cdUQ4M0NcdURGQUYgRmx5LVRvPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICBjYXJkLm9uY2xpY2sgPSAoKSA9PiBzZWxlY3RDbGFzaChjbGFzaCk7XHJcbiAgICBjb25zdCBmbHlCdG4gPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5idG4tZmx5Jyk7XHJcbiAgICBpZiAoZmx5QnRuKSB7XHJcbiAgICAgIGZseUJ0bi5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHNlbGVjdENsYXNoKGNsYXNoKTtcclxuICAgICAgICBmbHlUb0NsYXNoKGNsYXNoKTtcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBlbHMuY2xhc2hDYXJkc0xpc3QuYXBwZW5kQ2hpbGQoY2FyZCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbGVjdENsYXNoKGNsYXNoKSB7XHJcbiAgYWN0aXZlQ2xhc2ggPSBjbGFzaDtcclxuICByZW5kZXJDbGFzaGVzTGlzdCgpO1xyXG4gIGhpZ2hsaWdodENsYXNoRWxlbWVudHMoY2xhc2gpO1xyXG4gIHJlbmRlckNsYXNoRGV0YWlsVmlldyhjbGFzaCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhpZ2hsaWdodENsYXNoRWxlbWVudHMoY2xhc2gpIHtcclxuICBjbGFzaEhlbHBlcnNHcm91cC5jbGVhcigpO1xyXG5cclxuICAvLyBHaG9zdCBiYWNrZ3JvdW5kIG1lc2hlc1xyXG4gIGVsZW1lbnRNZXNoZXMuZm9yRWFjaCgoeyBtZXNoIH0pID0+IHtcclxuICAgIGlmICghbWVzaC51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcykge1xyXG4gICAgICBtZXNoLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzID0ge1xyXG4gICAgICAgIHRyYW5zcGFyZW50OiBtZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50LFxyXG4gICAgICAgIG9wYWNpdHk6IG1lc2gubWF0ZXJpYWwub3BhY2l0eSxcclxuICAgICAgICBkZXB0aFdyaXRlOiBtZXNoLm1hdGVyaWFsLmRlcHRoV3JpdGUsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZiAobWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gubWF0ZXJpYWwuY29sb3IuY29weShtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcik7XHJcbiAgICBpZiAobWVzaC5tYXRlcmlhbC5lbWlzc2l2ZSkgbWVzaC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoMHgwMDAwMDApO1xyXG4gICAgbWVzaC5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XHJcbiAgICBtZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAwLjE1O1xyXG4gIH0pO1xyXG5cclxuICBjb25zdCBtZXNoQSA9IGNsYXNoLmVsZW1lbnRBLm1lc2g7XHJcbiAgY29uc3QgbWVzaEIgPSBjbGFzaC5lbGVtZW50Qi5tZXNoO1xyXG5cclxuICBpZiAobWVzaEEpIHtcclxuICAgIGlmICghbWVzaEEudXNlckRhdGEub3JpZ0NvbG9yKSBtZXNoQS51c2VyRGF0YS5vcmlnQ29sb3IgPSBtZXNoQS5tYXRlcmlhbC5jb2xvci5jbG9uZSgpO1xyXG4gICAgbWVzaEEubWF0ZXJpYWwuY29sb3IuY29weShjbGFzaE1hdEEuY29sb3IpO1xyXG4gICAgaWYgKG1lc2hBLm1hdGVyaWFsLmVtaXNzaXZlKSBtZXNoQS5tYXRlcmlhbC5lbWlzc2l2ZS5jb3B5KGNsYXNoTWF0QS5lbWlzc2l2ZSk7XHJcbiAgICBtZXNoQS5tYXRlcmlhbC50cmFuc3BhcmVudCA9IGZhbHNlO1xyXG4gICAgbWVzaEEubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICB9XHJcblxyXG4gIGlmIChtZXNoQikge1xyXG4gICAgaWYgKCFtZXNoQi51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2hCLnVzZXJEYXRhLm9yaWdDb2xvciA9IG1lc2hCLm1hdGVyaWFsLmNvbG9yLmNsb25lKCk7XHJcbiAgICBtZXNoQi5tYXRlcmlhbC5jb2xvci5jb3B5KGNsYXNoTWF0Qi5jb2xvcik7XHJcbiAgICBpZiAobWVzaEIubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2hCLm1hdGVyaWFsLmVtaXNzaXZlLmNvcHkoY2xhc2hNYXRCLmVtaXNzaXZlKTtcclxuICAgIG1lc2hCLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gZmFsc2U7XHJcbiAgICBtZXNoQi5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gIH1cclxuXHJcbiAgLy8gQWRkIENlbnRyb2lkIDNEIFBpbiBNYXJrZXJcclxuICBjb25zdCBtYXJrZXIgPSBjcmVhdGVDZW50cm9pZE1hcmtlcihjbGFzaC5jb2xsaXNpb25Qb2ludCk7XHJcbiAgY2xhc2hIZWxwZXJzR3JvdXAuYWRkKG1hcmtlcik7XHJcblxyXG4gIC8vIEFkZCBXaXJlZnJhbWUgQm91bmRpbmcgQm94IEhlbHBlclxyXG4gIGlmIChjbGFzaC5ib3VuZGluZ0JveCkge1xyXG4gICAgY29uc3QgYm94SGVscGVyID0gY3JlYXRlSW50ZXJzZWN0aW9uQm94SGVscGVyKGNsYXNoLmJvdW5kaW5nQm94KTtcclxuICAgIGlmIChib3hIZWxwZXIpIGNsYXNoSGVscGVyc0dyb3VwLmFkZChib3hIZWxwZXIpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZmx5VG9DbGFzaChjbGFzaCkge1xyXG4gIGNvbnN0IHRhcmdldFBvcyA9IG5ldyBUSFJFRS5WZWN0b3IzKGNsYXNoLmNvbGxpc2lvblBvaW50LngsIGNsYXNoLmNvbGxpc2lvblBvaW50LnksIGNsYXNoLmNvbGxpc2lvblBvaW50LnopO1xyXG4gIGNvbnN0IGRpc3RhbmNlID0gNC41O1xyXG4gIGNvbnN0IGNhbVBvcyA9IHRhcmdldFBvcy5jbG9uZSgpLmFkZChuZXcgVEhSRUUuVmVjdG9yMyhkaXN0YW5jZSAqIDAuNywgZGlzdGFuY2UgKiAwLjUsIGRpc3RhbmNlICogMC43KSk7XHJcblxyXG4gIGNvbnN0IHN0YXJ0Q2FtID0gY2FtZXJhLnBvc2l0aW9uLmNsb25lKCk7XHJcbiAgY29uc3Qgc3RhcnRUYXJnZXQgPSBjb250cm9scy50YXJnZXQuY2xvbmUoKTtcclxuICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICBjb25zdCBkdXJhdGlvbiA9IDc1MDtcclxuXHJcbiAgZnVuY3Rpb24gYW5pbWF0ZVN0ZXAobm93KSB7XHJcbiAgICBjb25zdCB0ID0gTWF0aC5taW4oKG5vdyAtIHN0YXJ0VGltZSkgLyBkdXJhdGlvbiwgMS4wKTtcclxuICAgIGNvbnN0IGVhc2UgPSB0IDwgMC41ID8gMiAqIHQgKiB0IDogLTEgKyAoNCAtIDIgKiB0KSAqIHQ7XHJcbiAgICBjYW1lcmEucG9zaXRpb24ubGVycFZlY3RvcnMoc3RhcnRDYW0sIGNhbVBvcywgZWFzZSk7XHJcbiAgICBjb250cm9scy50YXJnZXQubGVycFZlY3RvcnMoc3RhcnRUYXJnZXQsIHRhcmdldFBvcywgZWFzZSk7XHJcbiAgICBjb250cm9scy51cGRhdGUoKTtcclxuICAgIGlmICh0IDwgMS4wKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVN0ZXApO1xyXG4gIH1cclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVN0ZXApO1xyXG4gIHNldFN0YXR1cyhgSW5zcGVjdGluZyAke2NsYXNoLmlkfSBhdCAoJHt0YXJnZXRQb3MueC50b0ZpeGVkKDIpfSwgJHt0YXJnZXRQb3MueS50b0ZpeGVkKDIpfSwgJHt0YXJnZXRQb3Muei50b0ZpeGVkKDIpfSlgKTtcclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBDbGFzaCBEZXRhaWwgJiBUaHJlYWRlZCBEaXNjdXNzaW9uIFVJIC0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gcmVuZGVyQ2xhc2hEZXRhaWxWaWV3KGNsYXNoKSB7XHJcbiAgaWYgKCFlbHMuY2xhc2hEZXRhaWxDb250YWluZXIgfHwgIWVscy5jbGFzaExpc3RDb250YWluZXIpIHJldHVybjtcclxuICBlbHMuY2xhc2hMaXN0Q29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgZWxzLmNsYXNoRGV0YWlsQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRldGFpbC10aXRsZScpO1xyXG4gIGNvbnN0IG1ldGFFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kZXRhaWwtbWV0YScpO1xyXG4gIGNvbnN0IHNldkJhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRldGFpbC1zZXZlcml0eScpO1xyXG5cclxuICBpZiAodGl0bGVFbCkgdGl0bGVFbC50ZXh0Q29udGVudCA9IGAke2NsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmV9ICMke2NsYXNoLmVsZW1lbnRBLmV4cHJlc3NJRH0gXHUwMEQ3ICR7Y2xhc2guZWxlbWVudEIuZGlzY2lwbGluZX0gIyR7Y2xhc2guZWxlbWVudEIuZXhwcmVzc0lEfWA7XHJcbiAgaWYgKHNldkJhZGdlKSB7XHJcbiAgICBzZXZCYWRnZS50ZXh0Q29udGVudCA9IGNsYXNoLnNldmVyaXR5O1xyXG4gICAgc2V2QmFkZ2UuY2xhc3NOYW1lID0gYGJpbS1iYWRnZSBzZXZlcml0eS0keyhjbGFzaC5zZXZlcml0eSB8fCAnbWlub3InKS50b0xvd2VyQ2FzZSgpfWA7XHJcbiAgfVxyXG4gIGlmIChtZXRhRWwpIHtcclxuICAgIGNvbnN0IHB0ID0gY2xhc2guY29sbGlzaW9uUG9pbnQ7XHJcbiAgICBtZXRhRWwuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2PjxzdHJvbmc+Q29sbGlzaW9uIENvb3JkaW5hdGVzOjwvc3Ryb25nPiAoJHtwdC54LnRvRml4ZWQoMil9LCAke3B0LnkudG9GaXhlZCgyKX0sICR7cHQuei50b0ZpeGVkKDIpfSk8L2Rpdj5cclxuICAgICAgPGRpdj48c3Ryb25nPlBlbmV0cmF0aW9uIERlcHRoOjwvc3Ryb25nPiAkeyhjbGFzaC5wZW5ldHJhdGlvbkRlcHRoIHx8IDApLnRvRml4ZWQoMSl9IG1tIHwgPHN0cm9uZz5Wb2x1bWU6PC9zdHJvbmc+ICR7KGNsYXNoLmludGVyc2VjdGlvblZvbHVtZSB8fCAwKS50b0ZpeGVkKDQpfSBtXHUwMEIzPC9kaXY+XHJcbiAgICAgIDxkaXY+PHN0cm9uZz5FbGVtZW50IEE6PC9zdHJvbmc+ICR7Y2xhc2guZWxlbWVudEEubW9kZWxOYW1lfSAoJHtjbGFzaC5lbGVtZW50QS5pZmNUeXBlfSk8L2Rpdj5cclxuICAgICAgPGRpdj48c3Ryb25nPkVsZW1lbnQgQjo8L3N0cm9uZz4gJHtjbGFzaC5lbGVtZW50Qi5tb2RlbE5hbWV9ICgke2NsYXNoLmVsZW1lbnRCLmlmY1R5cGV9KTwvZGl2PlxyXG4gICAgYDtcclxuICB9XHJcblxyXG4gIGxvYWRDbGFzaENvbW1lbnRzKGNsYXNoLmlkKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZENsYXNoQ29tbWVudHMoY2xhc2hJZCkge1xyXG4gIGlmICghZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0pIHJldHVybjtcclxuICBlbHMuY2xhc2hDb21tZW50c1N0cmVhbS5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5Mb2FkaW5nIGRpc2N1c3Npb25cdTIwMjY8L2Rpdj4nO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoeyBtZXRob2Q6IEFQSS5saXN0X2NsYXNoX2NvbW1lbnRzLCBhcmdzOiB7IGNsYXNoOiBjbGFzaElkIH0gfSk7XHJcbiAgICBjb25zdCBjb21tZW50cyA9IHJlcy5tZXNzYWdlIHx8IFtdO1xyXG4gICAgaWYgKCFjb21tZW50cy5sZW5ndGgpIHtcclxuICAgICAgZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0uaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+Tm8gY29tbWVudHMgeWV0LiBTdGFydCB0aGUgdGVhbSBkaXNjdXNzaW9uIGJlbG93LjwvZGl2Pic7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBlbHMuY2xhc2hDb21tZW50c1N0cmVhbS5pbm5lckhUTUwgPSBjb21tZW50cy5tYXAoYyA9PiBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJ1YmJsZVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWhlYWRlclwiPlxyXG4gICAgICAgICAgPHN0cm9uZz4ke2MudXNlciB8fCAnQWRtaW5pc3RyYXRvcid9PC9zdHJvbmc+XHJcbiAgICAgICAgICA8c3Bhbj4ke2MuY3JlYXRpb24gPyBjLmNyZWF0aW9uLnNsaWNlKDAsIDE2KSA6ICdKdXN0IG5vdyd9PC9zcGFuPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJvZHlcIj4ke2MuY29tbWVudCB8fCAnJ308L2Rpdj5cclxuICAgICAgICAke2Muc25hcHNob3QgPyBgPGltZyBzcmM9XCIke2Muc25hcHNob3R9XCIgY2xhc3M9XCJjbGFzaC1jb21tZW50LXNuYXBzaG90XCIgLz5gIDogJyd9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYCkuam9pbignJyk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0uaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+RGlzY3Vzc2lvbiB0aHJlYWQgcmVhZHkgZm9yIGNsYXNoIG5vdGVzLjwvZGl2Pic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwb3N0Q2xhc2hDb21tZW50KCkge1xyXG4gIGlmICghYWN0aXZlQ2xhc2ggfHwgIWVscy5jbGFzaENvbW1lbnRJbnB1dCkgcmV0dXJuO1xyXG4gIGNvbnN0IHRleHQgPSBlbHMuY2xhc2hDb21tZW50SW5wdXQudmFsdWUudHJpbSgpO1xyXG4gIGlmICghdGV4dCkgcmV0dXJuO1xyXG5cclxuICBzZXRTdGF0dXMoJ1Bvc3RpbmcgY29tbWVudFx1MjAyNicpO1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgIG1ldGhvZDogQVBJLmFkZF9jbGFzaF9jb21tZW50LFxyXG4gICAgICBhcmdzOiB7IGNsYXNoOiBhY3RpdmVDbGFzaC5pZCwgY29tbWVudDogdGV4dCwgdXNlcjogKHdpbmRvdy5mcmFwcGUgJiYgZnJhcHBlLnNlc3Npb24gJiYgZnJhcHBlLnNlc3Npb24udXNlcikgfHwgJ0FkbWluaXN0cmF0b3InIH0sXHJcbiAgICB9KTtcclxuICAgIGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSA9ICcnO1xyXG4gICAgbG9hZENsYXNoQ29tbWVudHMoYWN0aXZlQ2xhc2guaWQpO1xyXG4gICAgc2V0U3RhdHVzKCdDb21tZW50IHBvc3RlZC4nKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zdCBidWJibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGJ1YmJsZS5jbGFzc05hbWUgPSAnY2xhc2gtY29tbWVudC1idWJibGUnO1xyXG4gICAgYnViYmxlLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNvbW1lbnQtaGVhZGVyXCI+XHJcbiAgICAgICAgPHN0cm9uZz4keyh3aW5kb3cuZnJhcHBlICYmIGZyYXBwZS5zZXNzaW9uICYmIGZyYXBwZS5zZXNzaW9uLnVzZXIpIHx8ICdVc2VyJ308L3N0cm9uZz5cclxuICAgICAgICA8c3Bhbj5KdXN0IG5vdzwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJvZHlcIj4ke3RleHR9PC9kaXY+XHJcbiAgICBgO1xyXG4gICAgZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0uYXBwZW5kQ2hpbGQoYnViYmxlKTtcclxuICAgIGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSA9ICcnO1xyXG4gICAgc2V0U3RhdHVzKCdOb3RlIGFkZGVkIHRvIGxvY2FsIHNlc3Npb24uJyk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlQ2xhc2hUb0VycE5leHQoKSB7XHJcbiAgaWYgKCFhY3RpdmVDbGFzaCkgcmV0dXJuO1xyXG4gIHNob3dMb2FkaW5nKCdTYXZpbmcgY2xhc2ggcmVjb3JkIHRvIEVSUE5leHRcdTIwMjYnLCB0cnVlKTtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgdmlld3BvaW50ID0gZ2VuZXJhdGVCY2ZWaWV3cG9pbnQoY2FtZXJhLCBjb250cm9scywgYWN0aXZlQ2xhc2gsIHtcclxuICAgICAgc25hcHNob3Q6IHJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCdpbWFnZS9wbmcnKSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHtcclxuICAgICAgbWV0aG9kOiBBUEkuY3JlYXRlX2NsYXNoLFxyXG4gICAgICBhcmdzOiB7XHJcbiAgICAgICAgdGl0bGU6IGAke2FjdGl2ZUNsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmV9ICMke2FjdGl2ZUNsYXNoLmVsZW1lbnRBLmV4cHJlc3NJRH0gXHUwMEQ3ICR7YWN0aXZlQ2xhc2guZWxlbWVudEIuZGlzY2lwbGluZX0gIyR7YWN0aXZlQ2xhc2guZWxlbWVudEIuZXhwcmVzc0lEfWAsXHJcbiAgICAgICAgbW9kZWxfYTogYWN0aXZlQ2xhc2guZWxlbWVudEEubW9kZWxOYW1lLFxyXG4gICAgICAgIGVsZW1lbnRfYV9pZDogYWN0aXZlQ2xhc2guZWxlbWVudEEuZXhwcmVzc0lELFxyXG4gICAgICAgIGRpc2NpcGxpbmVfYTogYWN0aXZlQ2xhc2guZWxlbWVudEEuZGlzY2lwbGluZSxcclxuICAgICAgICBtb2RlbF9iOiBhY3RpdmVDbGFzaC5lbGVtZW50Qi5tb2RlbE5hbWUsXHJcbiAgICAgICAgZWxlbWVudF9iX2lkOiBhY3RpdmVDbGFzaC5lbGVtZW50Qi5leHByZXNzSUQsXHJcbiAgICAgICAgZGlzY2lwbGluZV9iOiBhY3RpdmVDbGFzaC5lbGVtZW50Qi5kaXNjaXBsaW5lLFxyXG4gICAgICAgIGNvbGxpc2lvbl9wb2ludDogSlNPTi5zdHJpbmdpZnkoYWN0aXZlQ2xhc2guY29sbGlzaW9uUG9pbnQpLFxyXG4gICAgICAgIGJvdW5kaW5nX2JveDogSlNPTi5zdHJpbmdpZnkoYWN0aXZlQ2xhc2guYm91bmRpbmdCb3gpLFxyXG4gICAgICAgIHBlbmV0cmF0aW9uX2RlcHRoOiBhY3RpdmVDbGFzaC5wZW5ldHJhdGlvbkRlcHRoLFxyXG4gICAgICAgIGludGVyc2VjdGlvbl92b2x1bWU6IGFjdGl2ZUNsYXNoLmludGVyc2VjdGlvblZvbHVtZSxcclxuICAgICAgICBzZXZlcml0eTogYWN0aXZlQ2xhc2guc2V2ZXJpdHksXHJcbiAgICAgICAgdmlld3BvaW50OiBKU09OLnN0cmluZ2lmeSh2aWV3cG9pbnQpLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICAgIGZyYXBwZS5tc2dwcmludCh7XHJcbiAgICAgIHRpdGxlOiBfXygnQklNIENsYXNoIFNhdmVkJyksXHJcbiAgICAgIG1lc3NhZ2U6IF9fKCdDcmVhdGVkIEJJTSBDbGFzaCByZWNvcmQ6IDxiPnswfTwvYj4nLCBbKHJlcy5tZXNzYWdlICYmIHJlcy5tZXNzYWdlLm5hbWUpIHx8ICdCSU0tQ0xBU0gtTkVXJ10pLFxyXG4gICAgICBpbmRpY2F0b3I6ICdncmVlbicsXHJcbiAgICB9KTtcclxuICAgIHNldFN0YXR1cyhgU2F2ZWQgY2xhc2ggcmVjb3JkICR7KHJlcy5tZXNzYWdlICYmIHJlcy5tZXNzYWdlLm5hbWUpIHx8ICcnfWApO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoe1xyXG4gICAgICB0aXRsZTogX18oJ0ZhaWxlZCB0byBTYXZlIENsYXNoJyksXHJcbiAgICAgIG1lc3NhZ2U6IF9fKCdDb3VsZCBub3Qgc2F2ZSBCSU0gQ2xhc2g6IHswfScsIFtlLm1lc3NhZ2UgfHwgU3RyaW5nKGUpXSksXHJcbiAgICAgIGluZGljYXRvcjogJ3JlZCcsXHJcbiAgICB9KTtcclxuICAgIHNldFN0YXR1cyhgRXJyb3Igc2F2aW5nIGNsYXNoOiAke2UubWVzc2FnZSB8fCBlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBJbnRlcmFjdGl2ZSBCSU0gQk9NIFdpemFyZCBNb2RhbCAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIG9wZW5Cb21XaXphcmRNb2RhbCgpIHtcclxuICBpZiAoIWVscy5ib21Nb2RhbCkgcmV0dXJuO1xyXG4gIGVscy5ib21Nb2RhbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICBjYWxjdWxhdGVBbmRSZW5kZXJCb21Sb2xsdXAoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VCb21XaXphcmRNb2RhbCgpIHtcclxuICBpZiAoIWVscy5ib21Nb2RhbCkgcmV0dXJuO1xyXG4gIGVscy5ib21Nb2RhbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICBjbGVhclNlbGVjdGlvbigpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYWxjdWxhdGVBbmRSZW5kZXJCb21Sb2xsdXAoKSB7XHJcbiAgaWYgKCFlbHMuYm9tUm9sbHVwVGJvZHkpIHJldHVybjtcclxuICBlbHMuYm9tUm9sbHVwVGJvZHkuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIGNvbnN0IHJvbGx1cHMgPSBuZXcgTWFwKCk7XHJcblxyXG4gIGVsZW1lbnRNZXNoZXMuZm9yRWFjaCgoeyBtZXNoLCBleHByZXNzSUQsIG1vZGVsRG9jTmFtZSwgZGlzY2lwbGluZSB9KSA9PiB7XHJcbiAgICBjb25zdCBlbCA9IGVsZW1lbnRJbmRleC5nZXQoYCR7bW9kZWxEb2NOYW1lfToke2V4cHJlc3NJRH1gKSB8fCBlbGVtZW50SW5kZXguZ2V0KFN0cmluZyhleHByZXNzSUQpKSB8fCBtZXNoLnVzZXJEYXRhLmVsZW1lbnQ7XHJcbiAgICBjb25zdCBpZmNUeXBlID0gKGVsICYmIGVsLmVsZW1lbnRfdHlwZSkgfHwgKG1lc2gudXNlckRhdGEuaWZjVHlwZSA/IGBJRkNfJHttZXNoLnVzZXJEYXRhLmlmY1R5cGV9YCA6ICdJRkNfRUxFTUVOVCcpO1xyXG5cclxuICAgIGlmICghcm9sbHVwcy5oYXMoaWZjVHlwZSkpIHtcclxuICAgICAgbGV0IG1ldHJpY05hbWUgPSAnVm9sdW1lJztcclxuICAgICAgbGV0IHVvbSA9ICdtMyc7XHJcbiAgICAgIGxldCB1bml0UmF0ZSA9IDE4MC4wO1xyXG4gICAgICBsZXQgd2FzdGVQY3QgPSA1O1xyXG4gICAgICBsZXQgaXRlbUNvZGUgPSAnQ09OQy1DMzAtMzcnO1xyXG5cclxuICAgICAgY29uc3QgdHlwZVVwcGVyID0gaWZjVHlwZS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdTTEFCJykpIHtcclxuICAgICAgICBtZXRyaWNOYW1lID0gJ05ldFZvbHVtZSc7IHVvbSA9ICdtMyc7IHVuaXRSYXRlID0gMTk1LjA7IHdhc3RlUGN0ID0gNTsgaXRlbUNvZGUgPSAnQ09OQy1TTEFCLUMzMCc7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdCRUFNJykgfHwgdHlwZVVwcGVyLmluY2x1ZGVzKCdDT0xVTU4nKSkge1xyXG4gICAgICAgIG1ldHJpY05hbWUgPSAnTmV0Vm9sdW1lJzsgdW9tID0gJ20zJzsgdW5pdFJhdGUgPSAyMjAuMDsgd2FzdGVQY3QgPSA1OyBpdGVtQ29kZSA9ICdDT05DLVNUUlVDLUMzNSc7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdXQUxMJykpIHtcclxuICAgICAgICBtZXRyaWNOYW1lID0gJ05ldFZvbHVtZSc7IHVvbSA9ICdtMyc7IHVuaXRSYXRlID0gMTc1LjA7IHdhc3RlUGN0ID0gNTsgaXRlbUNvZGUgPSAnQ09OQy1XQUxMLVBBTkVMJztcclxuICAgICAgfSBlbHNlIGlmICh0eXBlVXBwZXIuaW5jbHVkZXMoJ0RVQ1QnKSkge1xyXG4gICAgICAgIG1ldHJpY05hbWUgPSAnTGVuZ3RoJzsgdW9tID0gJ20nOyB1bml0UmF0ZSA9IDg1LjA7IHdhc3RlUGN0ID0gMTA7IGl0ZW1Db2RlID0gJ01FUC1EVUNULUdBTFYnO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVVcHBlci5pbmNsdWRlcygnUElQRScpKSB7XHJcbiAgICAgICAgbWV0cmljTmFtZSA9ICdMZW5ndGgnOyB1b20gPSAnbSc7IHVuaXRSYXRlID0gNDUuMDsgd2FzdGVQY3QgPSAxMDsgaXRlbUNvZGUgPSAnTUVQLVBJUEUtQ09QUEVSJztcclxuICAgICAgfSBlbHNlIGlmICh0eXBlVXBwZXIuaW5jbHVkZXMoJ0FJUlRFUk1JTkFMJykgfHwgdHlwZVVwcGVyLmluY2x1ZGVzKCdWQUxWRScpIHx8IHR5cGVVcHBlci5pbmNsdWRlcygnUFVNUCcpKSB7XHJcbiAgICAgICAgbWV0cmljTmFtZSA9ICdDb3VudCc7IHVvbSA9ICdOb3MnOyB1bml0UmF0ZSA9IDEyMC4wOyB3YXN0ZVBjdCA9IDA7IGl0ZW1Db2RlID0gJ01FUC1GSVhUVVJFLVVOSVQnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByb2xsdXBzLnNldChpZmNUeXBlLCB7XHJcbiAgICAgICAgdHlwZTogaWZjVHlwZSxcclxuICAgICAgICBkaXNjaXBsaW5lLFxyXG4gICAgICAgIGNvdW50OiAwLFxyXG4gICAgICAgIG1ldHJpY05hbWUsXHJcbiAgICAgICAgbWV0cmljVmFsdWU6IDAuMCxcclxuICAgICAgICB1b20sXHJcbiAgICAgICAgaXRlbUNvZGUsXHJcbiAgICAgICAgdW5pdFJhdGUsXHJcbiAgICAgICAgd2FzdGVQY3QsXHJcbiAgICAgICAgbWVzaGVzOiBbXSxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgciA9IHJvbGx1cHMuZ2V0KGlmY1R5cGUpO1xyXG4gICAgci5jb3VudCsrO1xyXG4gICAgci5tZXNoZXMucHVzaChtZXNoKTtcclxuXHJcbiAgICBpZiAoZWwgJiYgZWwucXVhbnRpdGllcykge1xyXG4gICAgICBpZiAoci5tZXRyaWNOYW1lID09PSAnTmV0Vm9sdW1lJyAmJiBlbC5xdWFudGl0aWVzLk5ldFZvbHVtZSkge1xyXG4gICAgICAgIHIubWV0cmljVmFsdWUgKz0gcGFyc2VGbG9hdChlbC5xdWFudGl0aWVzLk5ldFZvbHVtZSkgfHwgMC4wO1xyXG4gICAgICB9IGVsc2UgaWYgKHIubWV0cmljTmFtZSA9PT0gJ0xlbmd0aCcgJiYgKGVsLnF1YW50aXRpZXMuTGVuZ3RoIHx8IGVsLnF1YW50aXRpZXMuTm9taW5hbExlbmd0aCkpIHtcclxuICAgICAgICByLm1ldHJpY1ZhbHVlICs9IHBhcnNlRmxvYXQoZWwucXVhbnRpdGllcy5MZW5ndGggfHwgZWwucXVhbnRpdGllcy5Ob21pbmFsTGVuZ3RoKSB8fCAwLjA7XHJcbiAgICAgIH0gZWxzZSBpZiAoci5tZXRyaWNOYW1lID09PSAnR3Jvc3NBcmVhJyAmJiBlbC5xdWFudGl0aWVzLkdyb3NzQXJlYSkge1xyXG4gICAgICAgIHIubWV0cmljVmFsdWUgKz0gcGFyc2VGbG9hdChlbC5xdWFudGl0aWVzLkdyb3NzQXJlYSkgfHwgMC4wO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKG1lc2guZ2VvbWV0cnkpIHtcclxuICAgICAgaWYgKCFtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94KSBtZXNoLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ0JveCgpO1xyXG4gICAgICBjb25zdCB3b3JsZEJveCA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3guY2xvbmUoKS5hcHBseU1hdHJpeDQobWVzaC5tYXRyaXhXb3JsZCk7XHJcbiAgICAgIGNvbnN0IHN6ID0gd29ybGRCb3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKTtcclxuICAgICAgaWYgKHIubWV0cmljTmFtZSA9PT0gJ05ldFZvbHVtZScpIHIubWV0cmljVmFsdWUgKz0gKHN6LnggKiBzei55ICogc3oueik7XHJcbiAgICAgIGVsc2UgaWYgKHIubWV0cmljTmFtZSA9PT0gJ0xlbmd0aCcpIHIubWV0cmljVmFsdWUgKz0gTWF0aC5tYXgoc3oueCwgc3oueSwgc3oueik7XHJcbiAgICAgIGVsc2Ugci5tZXRyaWNWYWx1ZSArPSAxLjA7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGxldCB0b3RhbENvc3QgPSAwLjA7XHJcbiAgbGV0IHRvdGFsTGluZUl0ZW1zID0gcm9sbHVwcy5zaXplO1xyXG5cclxuICByb2xsdXBzLmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgY29uc3QgZWZmZWN0aXZlUXR5ID0gcm93Lm1ldHJpY1ZhbHVlICogKDEuMCArIChyb3cud2FzdGVQY3QgLyAxMDAuMCkpO1xyXG4gICAgY29uc3QgbGluZVRvdGFsID0gZWZmZWN0aXZlUXR5ICogcm93LnVuaXRSYXRlO1xyXG4gICAgdG90YWxDb3N0ICs9IGxpbmVUb3RhbDtcclxuXHJcbiAgICBjb25zdCB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICB0ci5jbGFzc05hbWUgPSAnYm9tLXJvdyc7XHJcbiAgICB0ci5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDx0ZD48c3Ryb25nPiR7cm93LnR5cGV9PC9zdHJvbmc+PC90ZD5cclxuICAgICAgPHRkPjxzcGFuIGNsYXNzPVwiYmltLWJhZGdlXCI+JHtyb3cuZGlzY2lwbGluZX08L3NwYW4+PC90ZD5cclxuICAgICAgPHRkPiR7cm93LmNvdW50fTwvdGQ+XHJcbiAgICAgIDx0ZD4ke3Jvdy5tZXRyaWNWYWx1ZS50b0ZpeGVkKDIpfSAke3Jvdy51b219PC90ZD5cclxuICAgICAgPHRkPjxpbnB1dCB0eXBlPVwibnVtYmVyXCIgY2xhc3M9XCJib20td2FzdGUtaW5wdXRcIiB2YWx1ZT1cIiR7cm93Lndhc3RlUGN0fVwiIG1pbj1cIjBcIiBtYXg9XCI1MFwiIHN0eWxlPVwid2lkdGg6NjBweFwiIC8+JTwvdGQ+XHJcbiAgICAgIDx0ZCBjbGFzcz1cImJvbS1lZmYtcXR5XCI+JHtlZmZlY3RpdmVRdHkudG9GaXhlZCgyKX0gJHtyb3cudW9tfTwvdGQ+XHJcbiAgICAgIDx0ZD48aW5wdXQgY2xhc3M9XCJib20taXRlbS1pbnB1dFwiIHZhbHVlPVwiJHtyb3cuaXRlbUNvZGV9XCIgLz48L3RkPlxyXG4gICAgICA8dGQ+JHtyb3cudW9tfTwvdGQ+XHJcbiAgICAgIDx0ZD4kPGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cImJvbS1yYXRlLWlucHV0XCIgdmFsdWU9XCIke3Jvdy51bml0UmF0ZX1cIiBzdHlsZT1cIndpZHRoOjcwcHhcIiAvPjwvdGQ+XHJcbiAgICAgIDx0ZCBjbGFzcz1cImJvbS1saW5lLXRvdGFsXCIgc3R5bGU9XCJmb250LXdlaWdodDo2MDBcIj4kJHtsaW5lVG90YWwudG9GaXhlZCgyKX08L3RkPlxyXG4gICAgYDtcclxuXHJcbiAgICB0ci5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYm9tLXJvbGx1cC10YWJsZSB0ci5ib20tcm93JykuZm9yRWFjaChyID0+IHIuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKSk7XHJcbiAgICAgIHRyLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgIGNyb3NzSGlnaGxpZ2h0TWVzaGVzKHJvdy5tZXNoZXMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB3YXN0ZUlucHV0ID0gdHIucXVlcnlTZWxlY3RvcignLmJvbS13YXN0ZS1pbnB1dCcpO1xyXG4gICAgY29uc3QgcmF0ZUlucHV0ID0gdHIucXVlcnlTZWxlY3RvcignLmJvbS1yYXRlLWlucHV0Jyk7XHJcbiAgICBjb25zdCBlZmZRdHlFbCA9IHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20tZWZmLXF0eScpO1xyXG4gICAgY29uc3QgbGluZVRvdGFsRWwgPSB0ci5xdWVyeVNlbGVjdG9yKCcuYm9tLWxpbmUtdG90YWwnKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVMaW5lID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCB3ID0gcGFyc2VGbG9hdCh3YXN0ZUlucHV0LnZhbHVlKSB8fCAwO1xyXG4gICAgICBjb25zdCByVmFsID0gcGFyc2VGbG9hdChyYXRlSW5wdXQudmFsdWUpIHx8IDA7XHJcbiAgICAgIGNvbnN0IGVmZiA9IHJvdy5tZXRyaWNWYWx1ZSAqICgxLjAgKyB3IC8gMTAwLjApO1xyXG4gICAgICBjb25zdCB0b3QgPSBlZmYgKiByVmFsO1xyXG4gICAgICBlZmZRdHlFbC50ZXh0Q29udGVudCA9IGAke2VmZi50b0ZpeGVkKDIpfSAke3Jvdy51b219YDtcclxuICAgICAgbGluZVRvdGFsRWwudGV4dENvbnRlbnQgPSBgJCR7dG90LnRvRml4ZWQoMil9YDtcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHdhc3RlSW5wdXQpIHdhc3RlSW5wdXQub25pbnB1dCA9IHVwZGF0ZUxpbmU7XHJcbiAgICBpZiAocmF0ZUlucHV0KSByYXRlSW5wdXQub25pbnB1dCA9IHVwZGF0ZUxpbmU7XHJcblxyXG4gICAgZWxzLmJvbVJvbGx1cFRib2R5LmFwcGVuZENoaWxkKHRyKTtcclxuICB9KTtcclxuXHJcbiAgaWYgKGVscy5ib21TdW1tYXJ5VGV4dCkge1xyXG4gICAgZWxzLmJvbVN1bW1hcnlUZXh0LnRleHRDb250ZW50ID0gYFRvdGFsIExpbmUgSXRlbXM6ICR7dG90YWxMaW5lSXRlbXN9IHwgRXN0aW1hdGVkIFRvdGFsIENvc3Q6ICQke3RvdGFsQ29zdC50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7IG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMiwgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfWA7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcm9zc0hpZ2hsaWdodE1lc2hlcyh0YXJnZXRNZXNoZXMpIHtcclxuICBjb25zdCB0YXJnZXRTZXQgPSBuZXcgU2V0KHRhcmdldE1lc2hlcyk7XHJcbiAgY29uc3QgdGFyZ2V0Qm94ID0gbmV3IFRIUkVFLkJveDMoKTtcclxuXHJcbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2ggfSkgPT4ge1xyXG4gICAgaWYgKCFtZXNoLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzKSB7XHJcbiAgICAgIG1lc2gudXNlckRhdGEub3JpZ01hdGVyaWFsUHJvcHMgPSB7XHJcbiAgICAgICAgdHJhbnNwYXJlbnQ6IG1lc2gubWF0ZXJpYWwudHJhbnNwYXJlbnQsXHJcbiAgICAgICAgb3BhY2l0eTogbWVzaC5tYXRlcmlhbC5vcGFjaXR5LFxyXG4gICAgICAgIGRlcHRoV3JpdGU6IG1lc2gubWF0ZXJpYWwuZGVwdGhXcml0ZSxcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmICh0YXJnZXRTZXQuaGFzKG1lc2gpKSB7XHJcbiAgICAgIGlmICghbWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gudXNlckRhdGEub3JpZ0NvbG9yID0gbWVzaC5tYXRlcmlhbC5jb2xvci5jbG9uZSgpO1xyXG4gICAgICBtZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweDM4YmRmOCk7XHJcbiAgICAgIGlmIChtZXNoLm1hdGVyaWFsLmVtaXNzaXZlKSBtZXNoLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleCgweDAzNjlhMSk7XHJcbiAgICAgIG1lc2gubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBmYWxzZTtcclxuICAgICAgbWVzaC5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgICBpZiAobWVzaC5nZW9tZXRyeSkge1xyXG4gICAgICAgIGlmICghbWVzaC5nZW9tZXRyeS5ib3VuZGluZ0JveCkgbWVzaC5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdCb3goKTtcclxuICAgICAgICB0YXJnZXRCb3gudW5pb24obWVzaC5nZW9tZXRyeS5ib3VuZGluZ0JveC5jbG9uZSgpLmFwcGx5TWF0cml4NChtZXNoLm1hdHJpeFdvcmxkKSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcikgbWVzaC5tYXRlcmlhbC5jb2xvci5jb3B5KG1lc2gudXNlckRhdGEub3JpZ0NvbG9yKTtcclxuICAgICAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4MDAwMDAwKTtcclxuICAgICAgbWVzaC5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XHJcbiAgICAgIG1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IDAuMTI7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGlmICghdGFyZ2V0Qm94LmlzRW1wdHkoKSkge1xyXG4gICAgY29uc3QgY2VudGVyID0gdGFyZ2V0Qm94LmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcclxuICAgIGNvbnN0IHNpemUgPSB0YXJnZXRCb3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKS5sZW5ndGgoKTtcclxuICAgIGNhbWVyYS5wb3NpdGlvbi5jb3B5KGNlbnRlcikuYWRkKG5ldyBUSFJFRS5WZWN0b3IzKHNpemUgKiAwLjcsIHNpemUgKiAwLjUsIHNpemUgKiAwLjcpKTtcclxuICAgIGNvbnRyb2xzLnRhcmdldC5jb3B5KGNlbnRlcik7XHJcbiAgICBjb250cm9scy51cGRhdGUoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRXJwTmV4dEJvbSgpIHtcclxuICBjb25zdCBwYXJlbnRJdGVtID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib20tcGFyZW50LWl0ZW0nKSB8fCB7fSkudmFsdWUgfHwgJ0JMRC1OT1JESUMtQ09OQy0wMSc7XHJcbiAgY29uc3QgYm9tVGl0bGUgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JvbS10aXRsZScpIHx8IHt9KS52YWx1ZSB8fCAnQklNIEdlbmVyYXRlZCBCT00nO1xyXG5cclxuICBzaG93TG9hZGluZygnR2VuZXJhdGluZyBFUlBOZXh0IEJPTSBkb2N1bWVudFx1MjAyNicsIHRydWUpO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBpdGVtcyA9IFtdO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2JvbS1yb2xsdXAtdGJvZHkgdHIuYm9tLXJvdycpLmZvckVhY2godHIgPT4ge1xyXG4gICAgICBjb25zdCB0eXBlID0gKHRyLnF1ZXJ5U2VsZWN0b3IoJ3RkIHN0cm9uZycpIHx8IHt9KS50ZXh0Q29udGVudCB8fCAnJztcclxuICAgICAgY29uc3QgaXRlbUNvZGUgPSAodHIucXVlcnlTZWxlY3RvcignLmJvbS1pdGVtLWlucHV0JykgfHwge30pLnZhbHVlIHx8ICcnO1xyXG4gICAgICBjb25zdCBlZmZRdHlTdHIgPSAodHIucXVlcnlTZWxlY3RvcignLmJvbS1lZmYtcXR5JykgfHwge30pLnRleHRDb250ZW50IHx8ICcwJztcclxuICAgICAgY29uc3QgcGFyc2VkUXR5ID0gcGFyc2VGbG9hdChlZmZRdHlTdHIpO1xyXG4gICAgICBjb25zdCBlZmZRdHkgPSBOdW1iZXIuaXNGaW5pdGUocGFyc2VkUXR5KSA/IHBhcnNlZFF0eSA6IDA7XHJcbiAgICAgIGlmIChlZmZRdHkgPD0gMCkgcmV0dXJuOyAvLyBTa2lwIHplcm8gb3IgaW52YWxpZCBxdWFudGl0eSBpdGVtc1xyXG4gICAgICBjb25zdCByYXRlU3RyID0gKHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20tcmF0ZS1pbnB1dCcpIHx8IHt9KS52YWx1ZSB8fCAnMCc7XHJcbiAgICAgIGNvbnN0IHJhdGUgPSBwYXJzZUZsb2F0KHJhdGVTdHIpIHx8IDA7XHJcblxyXG4gICAgICBpdGVtcy5wdXNoKHsgaXRlbV9jb2RlOiBpdGVtQ29kZSwgcXR5OiBlZmZRdHksIHJhdGUsIGlmY190eXBlOiB0eXBlIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICBtZXRob2Q6IEFQSS5nZW5lcmF0ZV9ib21fZnJvbV9iaW0sXHJcbiAgICAgIGFyZ3M6IHtcclxuICAgICAgICBpdGVtOiBwYXJlbnRJdGVtLFxyXG4gICAgICAgIGJvbV90aXRsZTogYm9tVGl0bGUsXHJcbiAgICAgICAgaXRlbXM6IEpTT04uc3RyaW5naWZ5KGl0ZW1zKSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICBjbG9zZUJvbVdpemFyZE1vZGFsKCk7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoe1xyXG4gICAgICB0aXRsZTogX18oJ0JPTSBHZW5lcmF0ZWQgU3VjY2Vzc2Z1bGx5JyksXHJcbiAgICAgIG1lc3NhZ2U6IF9fKCdDcmVhdGVkIEVSUE5leHQgQk9NOiA8Yj57MH08L2I+IHdpdGggezF9IGxpbmUgaXRlbXMuJywgWyhyZXMubWVzc2FnZSAmJiByZXMubWVzc2FnZS5uYW1lKSB8fCAnQk9NLScgKyBwYXJlbnRJdGVtLCBpdGVtcy5sZW5ndGhdKSxcclxuICAgICAgaW5kaWNhdG9yOiAnZ3JlZW4nLFxyXG4gICAgfSk7XHJcbiAgICBzZXRTdGF0dXMoYEdlbmVyYXRlZCBFUlBOZXh0IEJPTSBmb3IgJHtwYXJlbnRJdGVtfWApO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoe1xyXG4gICAgICB0aXRsZTogX18oJ0ZhaWxlZCB0byBHZW5lcmF0ZSBCT00nKSxcclxuICAgICAgbWVzc2FnZTogX18oJ0Vycm9yIGdlbmVyYXRpbmcgRVJQTmV4dCBCT006IHswfScsIFtlLm1lc3NhZ2UgfHwgU3RyaW5nKGUpXSksXHJcbiAgICAgIGluZGljYXRvcjogJ3JlZCcsXHJcbiAgICB9KTtcclxuICAgIHNldFN0YXR1cyhgQk9NIGdlbmVyYXRpb24gZmFpbGVkOiAke2UubWVzc2FnZSB8fCBlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBIVUQgJiBUb29scyBIYW5kbGVycyAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIHNldFRvb2wodG9vbCkge1xyXG4gIGFjdGl2ZVRvb2wgPSB0b29sO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNiaW0taHVkIGJ1dHRvbicpLmZvckVhY2goYiA9PiBiLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGIuaWQgPT09ICd0b29sLScgKyB0b29sKSk7XHJcbiAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5jdXJzb3IgPSB0b29sID09PSAnbWVhc3VyZScgPyAnY3Jvc3NoYWlyJyA6ICdkZWZhdWx0JztcclxufVxyXG5cclxubGV0IHBvaW50ZXJEb3duUG9zID0geyB4OiAwLCB5OiAwIH07XHJcbmVscy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBldiA9PiB7XHJcbiAgcG9pbnRlckRvd25Qb3MgPSB7IHg6IGV2LmNsaWVudFgsIHk6IGV2LmNsaWVudFkgfTtcclxufSk7XHJcblxyXG5lbHMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2KSA9PiB7XHJcbiAgaWYgKGFjdGl2ZVRvb2wgPT09ICdtZWFzdXJlJykgeyBtZWFzdXJlQ2xpY2soZXYpOyByZXR1cm47IH1cclxuICBjb25zdCBkaXN0ID0gTWF0aC5oeXBvdChldi5jbGllbnRYIC0gcG9pbnRlckRvd25Qb3MueCwgZXYuY2xpZW50WSAtIHBvaW50ZXJEb3duUG9zLnkpO1xyXG4gIGlmIChkaXN0ID4gNikgcmV0dXJuO1xyXG5cclxuICBpZiAoYWN0aXZlVG9vbCAhPT0gJ3NlbGVjdCcgJiYgYWN0aXZlVG9vbCAhPT0gJ29yYml0JykgcmV0dXJuO1xyXG5cclxuICBjb25zdCByZWN0ID0gZWxzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICBjb25zdCBtb3VzZSA9IG5ldyBUSFJFRS5WZWN0b3IyKFxyXG4gICAgKChldi5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHJlY3Qud2lkdGgpICogMiAtIDEsXHJcbiAgICAtKChldi5jbGllbnRZIC0gcmVjdC50b3ApIC8gcmVjdC5oZWlnaHQpICogMiArIDFcclxuICApO1xyXG4gIGNvbnN0IHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxuICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZSwgY2FtZXJhKTtcclxuXHJcbiAgY29uc3QgbWVzaGVzID0gW107XHJcbiAgZmVkZXJhdGVkR3JvdXAudHJhdmVyc2UobyA9PiB7IGlmIChvLmlzTWVzaCAmJiBvLnZpc2libGUpIG1lc2hlcy5wdXNoKG8pOyB9KTtcclxuICBjb25zdCBoaXRzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMobWVzaGVzLCBmYWxzZSk7XHJcblxyXG4gIGlmIChoaXRzLmxlbmd0aCkge1xyXG4gICAgY29uc3QgaGl0ID0gaGl0c1swXTtcclxuICAgIGNvbnN0IGV4cHIgPSBoaXQub2JqZWN0LnVzZXJEYXRhLmV4cHJlc3NJRCB8fCBnZXRFeHByZXNzSWRBdChoaXQub2JqZWN0Lmdlb21ldHJ5LCBoaXQuZmFjZSA/IGhpdC5mYWNlLmEgOiB1bmRlZmluZWQpO1xyXG4gICAgY29uc3QgbW9kZWxEb2MgPSBoaXQub2JqZWN0LnVzZXJEYXRhLm1vZGVsRG9jTmFtZSB8fCAnJztcclxuICAgIGF3YWl0IHNlbGVjdEVsZW1lbnQoaGl0Lm9iamVjdCwgZXhwciwgbW9kZWxEb2MpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjbGVhclNlbGVjdGlvbigpO1xyXG4gIH1cclxufSk7XHJcblxyXG5mdW5jdGlvbiBnZXRFeHByZXNzSWRBdChnZW9tZXRyeSwgZmFjZUluZGV4KSB7XHJcbiAgY29uc3QgYXR0ciA9IGdlb21ldHJ5ICYmIGdlb21ldHJ5LmF0dHJpYnV0ZXMgJiYgZ2VvbWV0cnkuYXR0cmlidXRlcy5leHByZXNzSUQ7XHJcbiAgaWYgKCFhdHRyIHx8IGZhY2VJbmRleCA9PT0gdW5kZWZpbmVkIHx8IGZhY2VJbmRleCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgcmV0dXJuIGF0dHIuZ2V0WChNYXRoLm1pbihmYWNlSW5kZXgsIGF0dHIuY291bnQgLSAxKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpdFZpZXcoKSB7XHJcbiAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKS5zZXRGcm9tT2JqZWN0KGZlZGVyYXRlZEdyb3VwKTtcclxuICBpZiAoYm94LmlzRW1wdHkoKSkgcmV0dXJuO1xyXG4gIGNvbnN0IHNwaGVyZSA9IGJveC5nZXRCb3VuZGluZ1NwaGVyZShuZXcgVEhSRUUuU3BoZXJlKCkpO1xyXG4gIGNvbnN0IHNpemUgPSBib3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKS5sZW5ndGgoKTtcclxuICBjYW1lcmEucG9zaXRpb24uY29weShzcGhlcmUuY2VudGVyKS5hZGQobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZSAqIDAuNywgc2l6ZSAqIDAuNSwgc2l6ZSAqIDAuNykpO1xyXG4gIGNvbnRyb2xzLnRhcmdldC5jb3B5KHNwaGVyZS5jZW50ZXIpO1xyXG4gIGNvbnRyb2xzLnVwZGF0ZSgpO1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tIE1lYXN1cmUgVG9vbCAtLS0tLS0tLS0tLS0tLS0tXHJcbmxldCBtZWFzdXJlUG9pbnRzID0gW107XHJcbmNvbnN0IG1lYXN1cmVMaW5lID0gbmV3IFRIUkVFLkxpbmUoXHJcbiAgbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCksXHJcbiAgbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4MzhiZGY4LCBsaW5ld2lkdGg6IDIgfSlcclxuKTtcclxuc2NlbmUuYWRkKG1lYXN1cmVMaW5lKTtcclxuXHJcbmZ1bmN0aW9uIG1lYXN1cmVDbGljayhldikge1xyXG4gIGNvbnN0IHJlY3QgPSBlbHMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gIGNvbnN0IG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoXHJcbiAgICAoKGV2LmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aCkgKiAyIC0gMSxcclxuICAgIC0oKGV2LmNsaWVudFkgLSByZWN0LnRvcCkgLyByZWN0LmhlaWdodCkgKiAyICsgMVxyXG4gICk7XHJcbiAgY29uc3QgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKG1vdXNlLCBjYW1lcmEpO1xyXG5cclxuICBjb25zdCBtZXNoZXMgPSBbXTtcclxuICBmZWRlcmF0ZWRHcm91cC50cmF2ZXJzZShvID0+IHsgaWYgKG8uaXNNZXNoKSBtZXNoZXMucHVzaChvKTsgfSk7XHJcbiAgY29uc3QgaGl0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKG1lc2hlcywgZmFsc2UpO1xyXG5cclxuICBpZiAoaGl0cy5sZW5ndGgpIHtcclxuICAgIGNvbnN0IHB0ID0gaGl0c1swXS5wb2ludDtcclxuICAgIG1lYXN1cmVQb2ludHMucHVzaChwdCk7XHJcbiAgICBpZiAobWVhc3VyZVBvaW50cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgY29uc3QgZGlzdCA9IG1lYXN1cmVQb2ludHNbMF0uZGlzdGFuY2VUbyhtZWFzdXJlUG9pbnRzWzFdKTtcclxuICAgICAgbWVhc3VyZUxpbmUuZ2VvbWV0cnkuc2V0RnJvbVBvaW50cyhtZWFzdXJlUG9pbnRzKTtcclxuICAgICAgc2V0U3RhdHVzKGBEaXN0YW5jZTogJHtkaXN0LnRvRml4ZWQoMyl9IG0gKG1vZGVsIHVuaXRzKWApO1xyXG4gICAgICBtZWFzdXJlUG9pbnRzID0gW107XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZXRTdGF0dXMoJ01lYXN1cmU6IGNsaWNrIHNlY29uZCB0YXJnZXQgdmVydGV4L3BvaW50Jyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tIEZpbHRlcnMgJiBGYWNldHMgLS0tLS0tLS0tLS0tLS0tLVxyXG5mdW5jdGlvbiBwb3B1bGF0ZUZhY2V0cygpIHtcclxuICBpZiAoIWVscy5mRGlzY2lwbGluZSB8fCAhZWxzLmZTdG9yZXkgfHwgIWVscy5mVHlwZSkgcmV0dXJuO1xyXG4gIGNvbnN0IGRpc2NpcGxpbmVzID0gbmV3IFNldCgpO1xyXG4gIGNvbnN0IHN0b3JleXMgPSBuZXcgU2V0KCk7XHJcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0KCk7XHJcblxyXG4gIGxvYWRlZE1vZGVscy5mb3JFYWNoKG0gPT4ge1xyXG4gICAgZGlzY2lwbGluZXMuYWRkKG0uZGlzY2lwbGluZSk7XHJcbiAgICAobS5lbGVtZW50cyB8fCBbXSkuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgIGlmIChlbC5zdG9yZXkpIHN0b3JleXMuYWRkKGVsLnN0b3JleSk7XHJcbiAgICAgIGlmIChlbC5lbGVtZW50X3R5cGUpIHR5cGVzLmFkZChlbC5lbGVtZW50X3R5cGUpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGVscy5mRGlzY2lwbGluZS5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPkRpc2NpcGxpbmU6IGFsbDwvb3B0aW9uPic7XHJcbiAgZGlzY2lwbGluZXMuZm9yRWFjaChkID0+IHtcclxuICAgIGNvbnN0IG8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTsgby52YWx1ZSA9IGQ7IG8udGV4dENvbnRlbnQgPSBkOyBlbHMuZkRpc2NpcGxpbmUuYXBwZW5kQ2hpbGQobyk7XHJcbiAgfSk7XHJcblxyXG4gIGVscy5mU3RvcmV5LmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+U3RvcmV5OiBhbGw8L29wdGlvbj4nO1xyXG4gIHN0b3JleXMuZm9yRWFjaChzID0+IHtcclxuICAgIGNvbnN0IG8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTsgby52YWx1ZSA9IHM7IG8udGV4dENvbnRlbnQgPSBzOyBlbHMuZlN0b3JleS5hcHBlbmRDaGlsZChvKTtcclxuICB9KTtcclxuXHJcbiAgZWxzLmZUeXBlLmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+VHlwZTogYWxsPC9vcHRpb24+JztcclxuICB0eXBlcy5mb3JFYWNoKHQgPT4ge1xyXG4gICAgY29uc3QgbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpOyBvLnZhbHVlID0gdDsgby50ZXh0Q29udGVudCA9IHQ7IGVscy5mVHlwZS5hcHBlbmRDaGlsZChvKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlGaWx0ZXJzKCkge1xyXG4gIGNvbnN0IGZEaXNjID0gZWxzLmZEaXNjaXBsaW5lID8gZWxzLmZEaXNjaXBsaW5lLnZhbHVlIDogJyc7XHJcbiAgY29uc3QgZlN0b3JleSA9IGVscy5mU3RvcmV5ID8gZWxzLmZTdG9yZXkudmFsdWUgOiAnJztcclxuICBjb25zdCBmVHlwZSA9IGVscy5mVHlwZSA/IGVscy5mVHlwZS52YWx1ZSA6ICcnO1xyXG4gIGNvbnN0IGZTZWFyY2ggPSAoZWxzLmZTZWFyY2ggPyBlbHMuZlNlYXJjaC52YWx1ZSA6ICcnKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcclxuXHJcbiAgbGV0IHZpc2libGVDb3VudCA9IDA7XHJcbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2gsIGV4cHJlc3NJRCwgbW9kZWxEb2NOYW1lLCBkaXNjaXBsaW5lIH0pID0+IHtcclxuICAgIGNvbnN0IGVsID0gZWxlbWVudEluZGV4LmdldChgJHttb2RlbERvY05hbWV9OiR7ZXhwcmVzc0lEfWApIHx8IGVsZW1lbnRJbmRleC5nZXQoU3RyaW5nKGV4cHJlc3NJRCkpIHx8IG1lc2gudXNlckRhdGEuZWxlbWVudDtcclxuICAgIGxldCBtYXRjaCA9IHRydWU7XHJcblxyXG4gICAgaWYgKGZEaXNjICYmICFkaXNjaXBsaW5lTWF0Y2hlcyhkaXNjaXBsaW5lLCBmRGlzYykpIG1hdGNoID0gZmFsc2U7XHJcbiAgICBpZiAoZlN0b3JleSAmJiBlbCAmJiBlbC5zdG9yZXkgIT09IGZTdG9yZXkpIG1hdGNoID0gZmFsc2U7XHJcbiAgICBpZiAoZlR5cGUgJiYgZWwgJiYgZWwuZWxlbWVudF90eXBlICE9PSBmVHlwZSkgbWF0Y2ggPSBmYWxzZTtcclxuICAgIGlmIChmU2VhcmNoKSB7XHJcbiAgICAgIGNvbnN0IHNlYXJjaFRhcmdldCA9IGAkeyhlbCAmJiBlbC50aXRsZSkgfHwgJyd9ICR7KGVsICYmIGVsLmVsZW1lbnRfdHlwZSkgfHwgJyd9ICR7ZXhwcmVzc0lEfSAkeyhlbCAmJiBlbC5zdGFibGVfaWQpIHx8ICcnfWAudG9Mb3dlckNhc2UoKTtcclxuICAgICAgaWYgKCFzZWFyY2hUYXJnZXQuaW5jbHVkZXMoZlNlYXJjaCkpIG1hdGNoID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbWVzaC52aXNpYmxlID0gbWF0Y2g7XHJcbiAgICBpZiAobWF0Y2gpIHZpc2libGVDb3VudCsrO1xyXG4gIH0pO1xyXG5cclxuICBzZXRTdGF0dXMoYCR7dmlzaWJsZUNvdW50fSBlbGVtZW50cyBtYXRjaGluZyBmaWx0ZXJzYCk7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gVmlld3BvaW50cyAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIHNhdmVDdXJyZW50Vmlld3BvaW50KCkge1xyXG4gIGNvbnN0IG5hbWUgPSAoZWxzLnZwTmFtZSAmJiBlbHMudnBOYW1lLnZhbHVlLnRyaW0oKSkgfHwgJ1ZpZXcgJyArIG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCk7XHJcbiAgY29uc3QgdnBEYXRhID0ge1xyXG4gICAgcG9zaXRpb246IHsgeDogY2FtZXJhLnBvc2l0aW9uLngsIHk6IGNhbWVyYS5wb3NpdGlvbi55LCB6OiBjYW1lcmEucG9zaXRpb24ueiB9LFxyXG4gICAgdGFyZ2V0OiB7IHg6IGNvbnRyb2xzLnRhcmdldC54LCB5OiBjb250cm9scy50YXJnZXQueSwgejogY29udHJvbHMudGFyZ2V0LnogfSxcclxuICB9O1xyXG5cclxuICBjb25zdCBkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgZC5jbGFzc05hbWUgPSAnbGluay1yb3cnO1xyXG4gIGQuc3R5bGUuY3NzVGV4dCA9ICdkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO3BhZGRpbmc6NHB4IDA7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2YxZjVmOTtmb250LXNpemU6MTJweCc7XHJcbiAgZC5pbm5lckhUTUwgPSBgPHNwYW4gc3R5bGU9XCJjdXJzb3I6cG9pbnRlclwiPlx1RDgzRFx1RENGNyAke25hbWV9PC9zcGFuPjxidXR0b24gY2xhc3M9XCJkZWxcIiBzdHlsZT1cImNvbG9yOiNlZjQ0NDQ7Ym9yZGVyOm5vbmU7YmFja2dyb3VuZDpub25lO2N1cnNvcjpwb2ludGVyXCI+XHUyNzE1PC9idXR0b24+YDtcclxuICBcclxuICBkLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgY2FtZXJhLnBvc2l0aW9uLnNldCh2cERhdGEucG9zaXRpb24ueCwgdnBEYXRhLnBvc2l0aW9uLnksIHZwRGF0YS5wb3NpdGlvbi56KTtcclxuICAgIGNvbnRyb2xzLnRhcmdldC5zZXQodnBEYXRhLnRhcmdldC54LCB2cERhdGEudGFyZ2V0LnksIHZwRGF0YS50YXJnZXQueik7XHJcbiAgICBjb250cm9scy51cGRhdGUoKTtcclxuICAgIHNldFN0YXR1cygnUmVzdG9yZWQgdmlld3BvaW50ICcgKyBuYW1lKTtcclxuICB9O1xyXG4gIGQucXVlcnlTZWxlY3RvcignLmRlbCcpLm9uY2xpY2sgPSAoKSA9PiBkLnJlbW92ZSgpO1xyXG5cclxuICBpZiAoZWxzLnZpZXdwb2ludHMucXVlcnlTZWxlY3RvcignLmVtcHR5LWhpbnQnKSkgZWxzLnZpZXdwb2ludHMuaW5uZXJIVE1MID0gJyc7XHJcbiAgZWxzLnZpZXdwb2ludHMuYXBwZW5kQ2hpbGQoZCk7XHJcbiAgaWYgKGVscy52cE5hbWUpIGVscy52cE5hbWUudmFsdWUgPSAnJztcclxuICBzZXRTdGF0dXMoJ1NhdmVkIHZpZXdwb2ludDogJyArIG5hbWUpO1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tIERPTSBFdmVudCBCaW5kaW5nIC0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gaW5pdFVpRXZlbnRzKCkge1xyXG4gIC8vIFRhYiBzd2l0Y2hlclxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iaW0tdGFiLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmltLXRhYi1idG4nKS5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iaW0tdGFiLWNvbnRlbnQnKS5mb3JFYWNoKGMgPT4gYy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XHJcbiAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnRuLmRhdGFzZXQudGFiKTtcclxuICAgICAgaWYgKHRhcmdldCkgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgfTtcclxuICB9KTtcclxuXHJcbiAgLy8gSFVEIGJ1dHRvbnNcclxuICBjb25zdCB0b29sT3JiaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1vcmJpdCcpO1xyXG4gIGNvbnN0IHRvb2xTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1zZWxlY3QnKTtcclxuICBjb25zdCB0b29sTWVhc3VyZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLW1lYXN1cmUnKTtcclxuICBjb25zdCB0b29sQ2xpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLWNsaXAnKTtcclxuICBjb25zdCB0b29sQ2xhc2hlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLWNsYXNoZXMnKTtcclxuXHJcbiAgaWYgKHRvb2xPcmJpdCkgdG9vbE9yYml0Lm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdvcmJpdCcpO1xyXG4gIGlmICh0b29sU2VsZWN0KSB0b29sU2VsZWN0Lm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdzZWxlY3QnKTtcclxuICBpZiAodG9vbE1lYXN1cmUpIHRvb2xNZWFzdXJlLm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdtZWFzdXJlJyk7XHJcbiAgaWYgKHRvb2xDbGlwKSB0b29sQ2xpcC5vbmNsaWNrID0gKCkgPT4gc2V0VG9vbCgnY2xpcCcpO1xyXG4gIGlmICh0b29sQ2xhc2hlcykge1xyXG4gICAgdG9vbENsYXNoZXMub25jbGljayA9ICgpID0+IHtcclxuICAgICAgY29uc3QgdGFiQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYi1idG4tY2xhc2hlcycpO1xyXG4gICAgICBpZiAodGFiQnRuKSB0YWJCdG4uY2xpY2soKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBRdWljayB2aWV3IHRvb2xzXHJcbiAgY29uc3QgdFdpcmVmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0LXdpcmVmcmFtZScpO1xyXG4gIGNvbnN0IHRJc28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndC1pc28nKTtcclxuICBjb25zdCB0VG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3QtdG9wJyk7XHJcbiAgY29uc3QgdEZyb250ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3QtZnJvbnQnKTtcclxuICBjb25zdCBidG5GaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWZpdCcpO1xyXG5cclxuICBpZiAodFdpcmVmcmFtZSkge1xyXG4gICAgdFdpcmVmcmFtZS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICB3aXJlZnJhbWVNb2RlID0gIXdpcmVmcmFtZU1vZGU7XHJcbiAgICAgIGZlZGVyYXRlZEdyb3VwLnRyYXZlcnNlKG8gPT4ge1xyXG4gICAgICAgIGlmIChvLmlzTWVzaCAmJiBvLm1hdGVyaWFsKSBvLm1hdGVyaWFsLndpcmVmcmFtZSA9IHdpcmVmcmFtZU1vZGU7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzZXRTdGF0dXMoYFdpcmVmcmFtZSBtb2RlOiAke3dpcmVmcmFtZU1vZGUgPyAnT04nIDogJ09GRid9YCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYgKGJ0bkZpdCkgYnRuRml0Lm9uY2xpY2sgPSBmaXRWaWV3O1xyXG4gIGlmICh0SXNvKSB0SXNvLm9uY2xpY2sgPSBmaXRWaWV3O1xyXG4gIGlmICh0VG9wKSB7XHJcbiAgICB0VG9wLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGJveCA9IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdChmZWRlcmF0ZWRHcm91cCk7XHJcbiAgICAgIGNvbnN0IGNlbnRlciA9IGJveC5nZXRDZW50ZXIobmV3IFRIUkVFLlZlY3RvcjMoKSk7XHJcbiAgICAgIGNvbnN0IHNpemUgPSBib3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKS5sZW5ndGgoKTtcclxuICAgICAgY2FtZXJhLnBvc2l0aW9uLnNldChjZW50ZXIueCwgY2VudGVyLnkgKyBzaXplICogMS4zLCBjZW50ZXIueik7XHJcbiAgICAgIGNhbWVyYS51cC5zZXQoMCwgMCwgLTEpO1xyXG4gICAgICBjb250cm9scy50YXJnZXQuY29weShjZW50ZXIpO1xyXG4gICAgICBjb250cm9scy51cGRhdGUoKTtcclxuICAgIH07XHJcbiAgfVxyXG4gIGlmICh0RnJvbnQpIHtcclxuICAgIHRGcm9udC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBib3ggPSBuZXcgVEhSRUUuQm94MygpLnNldEZyb21PYmplY3QoZmVkZXJhdGVkR3JvdXApO1xyXG4gICAgICBjb25zdCBjZW50ZXIgPSBib3guZ2V0Q2VudGVyKG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xyXG4gICAgICBjb25zdCBzaXplID0gYm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSkubGVuZ3RoKCk7XHJcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi5zZXQoY2VudGVyLngsIGNlbnRlci55LCBjZW50ZXIueiArIHNpemUgKiAxLjMpO1xyXG4gICAgICBjYW1lcmEudXAuc2V0KDAsIDEsIDApO1xyXG4gICAgICBjb250cm9scy50YXJnZXQuY29weShjZW50ZXIpO1xyXG4gICAgICBjb250cm9scy51cGRhdGUoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBDbGFzaCBidXR0b25zXHJcbiAgY29uc3QgYnRuUnVuQ2xhc2hlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcnVuLWNsYXNoZXMnKTtcclxuICBpZiAoYnRuUnVuQ2xhc2hlcykgYnRuUnVuQ2xhc2hlcy5vbmNsaWNrID0gZXhlY3V0ZUNsYXNoRGV0ZWN0aW9uO1xyXG5cclxuICBjb25zdCBidG5DbGFzaEJhY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsYXNoLWJhY2snKTtcclxuICBpZiAoYnRuQ2xhc2hCYWNrKSB7XHJcbiAgICBidG5DbGFzaEJhY2sub25jbGljayA9ICgpID0+IHtcclxuICAgICAgaWYgKGVscy5jbGFzaERldGFpbENvbnRhaW5lciAmJiBlbHMuY2xhc2hMaXN0Q29udGFpbmVyKSB7XHJcbiAgICAgICAgZWxzLmNsYXNoRGV0YWlsQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgZWxzLmNsYXNoTGlzdENvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGJ0bkNsYXNoRmx5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbGFzaC1mbHknKTtcclxuICBpZiAoYnRuQ2xhc2hGbHkpIHtcclxuICAgIGJ0bkNsYXNoRmx5Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgIGlmIChhY3RpdmVDbGFzaCkgZmx5VG9DbGFzaChhY3RpdmVDbGFzaCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYnRuUG9zdENsYXNoQ29tbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcG9zdC1jbGFzaC1jb21tZW50Jyk7XHJcbiAgaWYgKGJ0blBvc3RDbGFzaENvbW1lbnQpIGJ0blBvc3RDbGFzaENvbW1lbnQub25jbGljayA9IHBvc3RDbGFzaENvbW1lbnQ7XHJcblxyXG4gIGNvbnN0IGJ0blNhdmVDbGFzaEVycCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2F2ZS1jbGFzaC1lcnAnKTtcclxuICBpZiAoYnRuU2F2ZUNsYXNoRXJwKSBidG5TYXZlQ2xhc2hFcnAub25jbGljayA9IHNhdmVDbGFzaFRvRXJwTmV4dDtcclxuXHJcbiAgLy8gQk9NIFdpemFyZCBidXR0b25zXHJcbiAgY29uc3QgYnRuT3BlbkJvbVdpemFyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb3Blbi1ib20td2l6YXJkJyk7XHJcbiAgaWYgKGJ0bk9wZW5Cb21XaXphcmQpIGJ0bk9wZW5Cb21XaXphcmQub25jbGljayA9IG9wZW5Cb21XaXphcmRNb2RhbDtcclxuXHJcbiAgY29uc3QgYnRuQ2xvc2VCb21Nb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYm9tLW1vZGFsJyk7XHJcbiAgY29uc3QgYnRuQ2FuY2VsQm9tTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1ib20tbW9kYWwnKTtcclxuICBpZiAoYnRuQ2xvc2VCb21Nb2RhbCkgYnRuQ2xvc2VCb21Nb2RhbC5vbmNsaWNrID0gY2xvc2VCb21XaXphcmRNb2RhbDtcclxuICBpZiAoYnRuQ2FuY2VsQm9tTW9kYWwpIGJ0bkNhbmNlbEJvbU1vZGFsLm9uY2xpY2sgPSBjbG9zZUJvbVdpemFyZE1vZGFsO1xyXG5cclxuICBjb25zdCBidG5HZW5lcmF0ZUVycEJvbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tZ2VuZXJhdGUtZXJwLWJvbScpO1xyXG4gIGlmIChidG5HZW5lcmF0ZUVycEJvbSkgYnRuR2VuZXJhdGVFcnBCb20ub25jbGljayA9IGdlbmVyYXRlRXJwTmV4dEJvbTtcclxuXHJcbiAgLy8gTW9kZWwgYWN0aW9uc1xyXG4gIGlmIChlbHMuYnRuTG9hZFNlbGVjdGVkKSB7XHJcbiAgICBlbHMuYnRuTG9hZFNlbGVjdGVkLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGZvciAoY29uc3QgbSBvZiBhdmFpbGFibGVNb2RlbHMpIHtcclxuICAgICAgICBpZiAoIWxvYWRlZE1vZGVscy5oYXMobS5uYW1lKSkgYXdhaXQgbG9hZE1vZGVsR2VvbWV0cnkobS5uYW1lKTtcclxuICAgICAgfVxyXG4gICAgICByZW5kZXJNb2RlbHNMaXN0KCk7XHJcbiAgICAgIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XHJcbiAgICAgIHBvcHVsYXRlRmFjZXRzKCk7XHJcbiAgICAgIGZpdFZpZXcoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZiAoZWxzLmJ0bkNsZWFyTW9kZWxzKSB7XHJcbiAgICBlbHMuYnRuQ2xlYXJNb2RlbHMub25jbGljayA9IHVubG9hZEFsbE1vZGVscztcclxuICB9XHJcblxyXG4gIC8vIFVwbG9hZFxyXG4gIGlmIChlbHMudXBsb2FkICYmIGVscy5maWxlSW5wdXQpIHtcclxuICAgIGVscy51cGxvYWQub25jbGljayA9ICgpID0+IGVscy5maWxlSW5wdXQuY2xpY2soKTtcclxuICAgIGVscy5maWxlSW5wdXQub25jaGFuZ2UgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBlbHMuZmlsZUlucHV0LmZpbGVzWzBdO1xyXG4gICAgICBpZiAoIWZpbGUpIHJldHVybjtcclxuICAgICAgc2hvd0xvYWRpbmcoYFVwbG9hZGluZyAke2ZpbGUubmFtZX1cdTIwMjZgLCB0cnVlKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUsIGZpbGUubmFtZSk7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdpc19wcml2YXRlJywgJzAnKTtcclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2RvY3R5cGUnLCAnQklNIE1vZGVsJyk7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdkb2NuYW1lJywgJ25ldycpO1xyXG4gICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSBhd2FpdCBmZXRjaCgnL2FwaS9tZXRob2QvdXBsb2FkX2ZpbGUnLCB7XHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGJvZHk6IGZvcm1EYXRhLFxyXG4gICAgICAgICAgaGVhZGVyczogeyAnWC1GcmFwcGUtQ1NSRi1Ub2tlbic6ICh3aW5kb3cuZnJhcHBlICYmIGZyYXBwZS5jc3JmX3Rva2VuKSB8fCAnJyB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghdXBsb2FkUmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKCdVcGxvYWQgZmFpbGVkJyk7XHJcbiAgICAgICAgY29uc3QgdXBsb2FkRGF0YSA9IGF3YWl0IHVwbG9hZFJlc3AuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IGZpbGVVcmwgPSB1cGxvYWREYXRhLm1lc3NhZ2UgJiYgdXBsb2FkRGF0YS5tZXNzYWdlLmZpbGVfdXJsO1xyXG4gICAgICAgIGlmICghZmlsZVVybCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcmV0cmlldmUgZmlsZSBVUkwnKTtcclxuXHJcbiAgICAgICAgbGV0IGRpc2MgPSAnQXJjaGl0ZWN0dXJlJztcclxuICAgICAgICBjb25zdCBuYW1lTG93ZXIgPSBmaWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnc3RyJykpIGRpc2MgPSAnU3RydWN0dXJhbCc7XHJcbiAgICAgICAgZWxzZSBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdodmFjJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCdtZXAnKSkgZGlzYyA9ICdNRVAnO1xyXG5cclxuICAgICAgICBzaG93TG9hZGluZygnUGFyc2luZyBJRkNcdTIwMjYnLCB0cnVlKTtcclxuICAgICAgICBjb25zdCBjcmVhdGVSZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgICAgICBtZXRob2Q6IEFQSS5jcmVhdGVfbW9kZWwsXHJcbiAgICAgICAgICBhcmdzOiB7XHJcbiAgICAgICAgICAgIGZpbGVfdXJsOiBmaWxlVXJsLFxyXG4gICAgICAgICAgICBmaWxlX25hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICAgICAgbW9kZWxfbmFtZTogZmlsZS5uYW1lLnJlcGxhY2UoL1xcLmlmYyQvaSwgJycpLFxyXG4gICAgICAgICAgICBkaXNjaXBsaW5lOiBkaXNjLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBhd2FpdCBsb2FkTW9kZWxzTGlzdCgpO1xyXG4gICAgICAgIGF3YWl0IGxvYWRNb2RlbEdlb21ldHJ5KGNyZWF0ZVJlcy5tZXNzYWdlLm5hbWUpO1xyXG4gICAgICAgIHJlbmRlck1vZGVsc0xpc3QoKTtcclxuICAgICAgICB1cGRhdGVFbGVtZW50TWVzaGVzTGlzdCgpO1xyXG4gICAgICAgIGZpdFZpZXcoKTtcclxuICAgICAgICBzZXRTdGF0dXMoYEltcG9ydGVkICR7ZmlsZS5uYW1lfSBzdWNjZXNzZnVsbHlgKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHNldFN0YXR1cygnSW1wb3J0IGZhaWxlZDogJyArIChlLm1lc3NhZ2UgfHwgZSkpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICAgICAgZWxzLmZpbGVJbnB1dC52YWx1ZSA9ICcnO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmlld3BvaW50c1xyXG4gIGNvbnN0IHZwU2F2ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2cC1zYXZlJyk7XHJcbiAgaWYgKHZwU2F2ZUJ0bikgdnBTYXZlQnRuLm9uY2xpY2sgPSBzYXZlQ3VycmVudFZpZXdwb2ludDtcclxuXHJcbiAgY29uc3QgYnRuQ2xhc2hTbmFwc2hvdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xhc2gtc25hcHNob3QnKTtcclxuICBpZiAoYnRuQ2xhc2hTbmFwc2hvdCkge1xyXG4gICAgYnRuQ2xhc2hTbmFwc2hvdC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbiAgICAgIGlmIChlbHMuY2xhc2hDb21tZW50SW5wdXQpIHtcclxuICAgICAgICBlbHMuY2xhc2hDb21tZW50SW5wdXQudmFsdWUgKz0gKGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSA/ICdcXG4nIDogJycpICsgYFtCQ0YgVmlld3BvaW50IHNuYXBzaG90IGNhcHR1cmVkIGF0ICR7bmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKX1dYDtcclxuICAgICAgfVxyXG4gICAgICBzZXRTdGF0dXMoJ1NuYXBzaG90IGNhcHR1cmVkIHRvIGNsYXNoIGNvbW1lbnQgYnVmZmVyJyk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYnRuTmxBZGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmwtYWRkJyk7XHJcbiAgaWYgKGJ0bk5sQWRkKSB7XHJcbiAgICBidG5ObEFkZC5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBpZiAoIWN1cnJlbnRTZWxlY3Rpb24gfHwgIWN1cnJlbnRTZWxlY3Rpb24uZWxlbWVudCkge1xyXG4gICAgICAgIGZyYXBwZS5tc2dwcmludChfXygnUGxlYXNlIHNlbGVjdCBhIEJJTSBlbGVtZW50IGZpcnN0JykpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCB0eXBlU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25sLXR5cGUnKTtcclxuICAgICAgY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25sLW5hbWUnKTtcclxuICAgICAgY29uc3QgdGFyZ2V0VHlwZSA9IHR5cGVTZWxlY3QgPyB0eXBlU2VsZWN0LnZhbHVlIDogJ0l0ZW0nO1xyXG4gICAgICBjb25zdCB0YXJnZXROYW1lID0gbmFtZUlucHV0ID8gbmFtZUlucHV0LnZhbHVlLnRyaW0oKSA6ICcnO1xyXG4gICAgICBpZiAoIXRhcmdldE5hbWUpIHJldHVybjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgICAgICBtZXRob2Q6IEFQSS5jcmVhdGVfYm9xX2xpbmssXHJcbiAgICAgICAgICBhcmdzOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGN1cnJlbnRTZWxlY3Rpb24uZWxlbWVudC5uYW1lIHx8IGN1cnJlbnRTZWxlY3Rpb24uZXhwcmVzc0lELFxyXG4gICAgICAgICAgICB0YXJnZXRfZG9jdHlwZTogdGFyZ2V0VHlwZSxcclxuICAgICAgICAgICAgdGFyZ2V0X25hbWU6IHRhcmdldE5hbWUsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNldFN0YXR1cyhgQ3JlYXRlZCBCT1EgTGluayB0byAke3RhcmdldE5hbWV9YCk7XHJcbiAgICAgICAgaWYgKG5hbWVJbnB1dCkgbmFtZUlucHV0LnZhbHVlID0gJyc7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBzZXRTdGF0dXMoYExpbmsgZXJyb3I6ICR7ZS5tZXNzYWdlIHx8IGV9YCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBGaWx0ZXIgY2hhbmdlIGxpc3RlbmVyc1xyXG4gIGlmIChlbHMuZkRpc2NpcGxpbmUpIGVscy5mRGlzY2lwbGluZS5vbmNoYW5nZSA9IGFwcGx5RmlsdGVycztcclxuICBpZiAoZWxzLmZTdG9yZXkpIGVscy5mU3RvcmV5Lm9uY2hhbmdlID0gYXBwbHlGaWx0ZXJzO1xyXG4gIGlmIChlbHMuZlR5cGUpIGVscy5mVHlwZS5vbmNoYW5nZSA9IGFwcGx5RmlsdGVycztcclxuICBpZiAoZWxzLmZTZWFyY2gpIGVscy5mU2VhcmNoLm9uaW5wdXQgPSBhcHBseUZpbHRlcnM7XHJcbiAgY29uc3QgZkNsZWFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2YtY2xlYXInKTtcclxuICBpZiAoZkNsZWFyKSB7XHJcbiAgICBmQ2xlYXIub25jbGljayA9ICgpID0+IHtcclxuICAgICAgaWYgKGVscy5mRGlzY2lwbGluZSkgZWxzLmZEaXNjaXBsaW5lLnZhbHVlID0gJyc7XHJcbiAgICAgIGlmIChlbHMuZlN0b3JleSkgZWxzLmZTdG9yZXkudmFsdWUgPSAnJztcclxuICAgICAgaWYgKGVscy5mVHlwZSkgZWxzLmZUeXBlLnZhbHVlID0gJyc7XHJcbiAgICAgIGlmIChlbHMuZlNlYXJjaCkgZWxzLmZTZWFyY2gudmFsdWUgPSAnJztcclxuICAgICAgYXBwbHlGaWx0ZXJzKCk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUm91dGVQYXJhbXMoKSB7XHJcbiAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuICBjb25zdCByb3V0ZU9wdHMgPSAod2luZG93LmZyYXBwZSAmJiBmcmFwcGUucm91dGVfb3B0aW9ucykgfHwge307XHJcbiAgY29uc3QgbW9kZWxQYXJhbSA9IHJvdXRlT3B0cy5tb2RlbCB8fCByb3V0ZU9wdHMubW9kZWxzIHx8IHBhcmFtcy5nZXQoJ21vZGVscycpIHx8IHBhcmFtcy5nZXQoJ21vZGVsJyk7XHJcbiAgY29uc3QgY2xhc2hQYXJhbSA9IHJvdXRlT3B0cy5jbGFzaCB8fCBwYXJhbXMuZ2V0KCdjbGFzaCcpO1xyXG4gIGNvbnN0IGVsZW1BID0gcm91dGVPcHRzLmVsZW1lbnRfYSB8fCBwYXJhbXMuZ2V0KCdlbGVtZW50X2EnKTtcclxuICBjb25zdCBlbGVtQiA9IHJvdXRlT3B0cy5lbGVtZW50X2IgfHwgcGFyYW1zLmdldCgnZWxlbWVudF9iJyk7XHJcblxyXG4gIGlmIChtb2RlbFBhcmFtICYmIG1vZGVsUGFyYW0gIT09ICdub25lJykge1xyXG4gICAgY29uc3QgbW9kZWxOYW1lcyA9IG1vZGVsUGFyYW0uc3BsaXQoJywnKS5tYXAocyA9PiBzLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgZm9yIChjb25zdCBtIG9mIG1vZGVsTmFtZXMpIHtcclxuICAgICAgaWYgKCFsb2FkZWRNb2RlbHMuaGFzKG0pKSB7XHJcbiAgICAgICAgYXdhaXQgbG9hZE1vZGVsR2VvbWV0cnkobSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbmRlck1vZGVsc0xpc3QoKTtcclxuICAgIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XHJcbiAgICBpZiAodHlwZW9mIHBvcHVsYXRlRmFjZXRzID09PSAnZnVuY3Rpb24nKSBwb3B1bGF0ZUZhY2V0cygpO1xyXG4gICAgZml0VmlldygpO1xyXG4gIH0gZWxzZSBpZiAocHJvamVjdFBhcmFtICYmIHR5cGVvZiBhdmFpbGFibGVNb2RlbHMgIT09ICd1bmRlZmluZWQnICYmIGF2YWlsYWJsZU1vZGVscy5sZW5ndGgpIHtcclxuICAgIGNvbnN0IHByb2pNb2RlbHMgPSBhdmFpbGFibGVNb2RlbHMuZmlsdGVyKG0gPT4gbS5wcm9qZWN0ID09PSBwcm9qZWN0UGFyYW0pO1xyXG4gICAgaWYgKHByb2pNb2RlbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKGNvbnN0IG0gb2YgcHJvak1vZGVscykge1xyXG4gICAgICAgIGlmICghbG9hZGVkTW9kZWxzLmhhcyhtLm5hbWUpKSB7XHJcbiAgICAgICAgICBhd2FpdCBsb2FkTW9kZWxHZW9tZXRyeShtLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZW5kZXJNb2RlbHNMaXN0KCk7XHJcbiAgICAgIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XHJcbiAgICAgIGlmICh0eXBlb2YgcG9wdWxhdGVGYWNldHMgPT09ICdmdW5jdGlvbicpIHBvcHVsYXRlRmFjZXRzKCk7XHJcbiAgICAgIGZpdFZpZXcoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChjbGFzaFBhcmFtKSB7XHJcbiAgICBjb25zdCB0YWJDbGFzaGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYi1idG4tY2xhc2hlcycpO1xyXG4gICAgaWYgKHRhYkNsYXNoZXMpIHRhYkNsYXNoZXMuY2xpY2soKTtcclxuICAgIGF3YWl0IGxvYWRFeGlzdGluZ0NsYXNoZXMoKTtcclxuICAgIGNvbnN0IGZvdW5kID0gZGV0ZWN0ZWRDbGFzaGVzLmZpbmQoYyA9PiBjLm5hbWUgPT09IGNsYXNoUGFyYW0gfHwgYy5pZCA9PT0gY2xhc2hQYXJhbSk7XHJcbiAgICBpZiAoZm91bmQpIHtcclxuICAgICAgc2VsZWN0Q2xhc2goZm91bmQpO1xyXG4gICAgICBmbHlUb0NsYXNoKGZvdW5kKTtcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKGVsZW1BIHx8IGVsZW1CKSB7XHJcbiAgICBjb25zdCBtYXRjaCA9IGVsZW1lbnRNZXNoZXMuZmluZChpdGVtID0+IHtcclxuICAgICAgY29uc3QgZWwgPSBlbGVtZW50SW5kZXguZ2V0KGAke2l0ZW0ubW9kZWxEb2NOYW1lfToke2l0ZW0uZXhwcmVzc0lEfWApIHx8IGVsZW1lbnRJbmRleC5nZXQoU3RyaW5nKGl0ZW0uZXhwcmVzc0lEKSk7XHJcbiAgICAgIGNvbnN0IHNpZCA9IChlbCAmJiBlbC5zdGFibGVfaWQpIHx8IChpdGVtLm1lc2ggJiYgaXRlbS5tZXNoLnVzZXJEYXRhICYmIChpdGVtLm1lc2gudXNlckRhdGEuZ3VpZCB8fCBpdGVtLm1lc2gudXNlckRhdGEuc3RhYmxlX2lkKSk7XHJcbiAgICAgIHJldHVybiBzaWQgJiYgKHNpZCA9PT0gZWxlbUEgfHwgc2lkID09PSBlbGVtQik7XHJcbiAgICB9KTtcclxuICAgIGlmIChtYXRjaCkge1xyXG4gICAgICBzZWxlY3RFbGVtZW50KG1hdGNoLm1lc2gsIG1hdGNoLmV4cHJlc3NJRCwgbWF0Y2gubW9kZWxEb2NOYW1lKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHByb2plY3RQYXJhbSA9IHJvdXRlT3B0cy5wcm9qZWN0IHx8IHBhcmFtcy5nZXQoJ3Byb2plY3QnKTtcclxuICBpZiAocHJvamVjdFBhcmFtKSB7XHJcbiAgICBhY3RpdmVQcm9qZWN0ID0gcHJvamVjdFBhcmFtO1xyXG4gIH1cclxuICBjb25zdCBtb2RlUGFyYW0gPSByb3V0ZU9wdHMubW9kZSB8fCBwYXJhbXMuZ2V0KCdtb2RlJyk7XHJcbiAgaWYgKG1vZGVQYXJhbSA9PT0gJ2Nvb3JkaW5hdGlvbicpIHtcclxuICAgIHNldEFwcE1vZGUoJ2Nvb3JkaW5hdGlvbicpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBzZXRBcHBNb2RlKCdpbml0aWF0aW9uJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFByb2plY3QgSW5pdGlhdGlvbiBQaXBlbGluZSAmIE9wZW5Qcm9qZWN0IEJJTSBXb3Jrc3BhY2UgQ29udHJvbGxlclxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbmxldCBjdXJyZW50QXBwTW9kZSA9ICdpbml0aWF0aW9uJztcclxubGV0IGN1cnJlbnRWaWV3cG9ydFRhYiA9ICczZCc7XHJcbmxldCBhY3RpdmVQcm9qZWN0ID0gbnVsbDtcclxubGV0IGluaXRpYXRpb25EYXRhID0gbnVsbDtcclxubGV0IHN0YWdlZEJvcUZpbGVVcmwgPSBudWxsO1xyXG5sZXQgZGV0ZWN0ZWREcmlmdE1vZGVscyA9IFtdO1xyXG5cclxuZnVuY3Rpb24gc2V0QXBwTW9kZShtb2RlKSB7XHJcbiAgY3VycmVudEFwcE1vZGUgPSBtb2RlO1xyXG4gIGNvbnN0IGxlZnRJbml0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1sZWZ0LWluaXRpYXRpb24nKTtcclxuICBjb25zdCBsZWZ0Q29vcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWxlZnQtY29vcmRpbmF0aW9uJyk7XHJcbiAgY29uc3QgcmlnaHRJbml0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1yaWdodC1pbml0aWF0aW9uJyk7XHJcbiAgY29uc3QgcmlnaHRDb29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tcmlnaHQtY29vcmRpbmF0aW9uJyk7XHJcbiAgY29uc3QgYnRuTW9kZUluaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW1vZGUtaW5pdGlhdGlvbicpO1xyXG4gIGNvbnN0IGJ0bk1vZGVDb29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tbW9kZS1jb29yZGluYXRpb24nKTtcclxuXHJcbiAgaWYgKG1vZGUgPT09ICdpbml0aWF0aW9uJykge1xyXG4gICAgaWYgKGxlZnRJbml0KSBsZWZ0SW5pdC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgaWYgKGxlZnRDb29yZCkgbGVmdENvb3JkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICBpZiAocmlnaHRJbml0KSByaWdodEluaXQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIGlmIChyaWdodENvb3JkKSByaWdodENvb3JkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICBpZiAoYnRuTW9kZUluaXQpIGJ0bk1vZGVJbml0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgaWYgKGJ0bk1vZGVDb29yZCkgYnRuTW9kZUNvb3JkLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xyXG4gICAgaWYgKGFjdGl2ZVByb2plY3QpIHJlZnJlc2hJbml0aWF0aW9uU3RhdHVzKCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChsZWZ0SW5pdCkgbGVmdEluaXQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIGlmIChsZWZ0Q29vcmQpIGxlZnRDb29yZC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgaWYgKHJpZ2h0SW5pdCkgcmlnaHRJbml0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICBpZiAocmlnaHRDb29yZCkgcmlnaHRDb29yZC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgaWYgKGJ0bk1vZGVJbml0KSBidG5Nb2RlSW5pdC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgIGlmIChidG5Nb2RlQ29vcmQpIGJ0bk1vZGVDb29yZC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFZpZXdwb3J0VGFiKHRhYikge1xyXG4gIGN1cnJlbnRWaWV3cG9ydFRhYiA9IHRhYjtcclxuICBjb25zdCB2cFRhYnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmltLXZwLXRhYicpO1xyXG4gIHZwVGFicy5mb3JFYWNoKHQgPT4ge1xyXG4gICAgaWYgKHQuZGF0YXNldC52cCA9PT0gdGFiKSB0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgZWxzZSB0LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xyXG4gIH0pO1xyXG5cclxuICBjb25zdCB2cDNkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZXdwb3J0LWNvbnRhaW5lci0zZCcpO1xyXG4gIGNvbnN0IHZwQ2FkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZXdwb3J0LWNvbnRhaW5lci1jYWQnKTtcclxuICBjb25zdCB2cFBkZiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aWV3cG9ydC1jb250YWluZXItcGRmJyk7XHJcblxyXG4gIGlmICh2cDNkKSB2cDNkLnN0eWxlLmRpc3BsYXkgPSAodGFiID09PSAnM2QnKSA/ICdibG9jaycgOiAnbm9uZSc7XHJcbiAgaWYgKHZwQ2FkKSB2cENhZC5zdHlsZS5kaXNwbGF5ID0gKHRhYiA9PT0gJ2NhZCcpID8gJ2Jsb2NrJyA6ICdub25lJztcclxuICBpZiAodnBQZGYpIHZwUGRmLnN0eWxlLmRpc3BsYXkgPSAodGFiID09PSAncGRmJykgPyAnYmxvY2snIDogJ25vbmUnO1xyXG5cclxuICBpZiAodGFiID09PSAnM2QnKSB7XHJcbiAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3Jlc2l6ZScpKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hJbml0aWF0aW9uU3RhdHVzKCkge1xyXG4gIGlmICghYWN0aXZlUHJvamVjdCkgcmV0dXJuO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgIG1ldGhvZDogQVBJLmdldF9pbml0aWF0aW9uX3N0YXR1cyxcclxuICAgICAgYXJnczogeyBwcm9qZWN0OiBhY3RpdmVQcm9qZWN0IH0sXHJcbiAgICB9KTtcclxuICAgIGlmICghcmVzIHx8ICFyZXMubWVzc2FnZSkgcmV0dXJuO1xyXG4gICAgaW5pdGlhdGlvbkRhdGEgPSByZXMubWVzc2FnZTtcclxuICAgIHJlbmRlckluaXRpYXRpb25Xb3Jrc3BhY2UoaW5pdGlhdGlvbkRhdGEpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBpbml0aWF0aW9uIHN0YXR1czonLCBlKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckluaXRpYXRpb25Xb3Jrc3BhY2UoZGF0YSkge1xyXG4gIGNvbnN0IHJlYWRpbmVzcyA9IGRhdGEucmVhZGluZXNzIHx8IHt9O1xyXG4gIGNvbnN0IGdhdGVzID0gcmVhZGluZXNzLmdhdGVzIHx8IFtdO1xyXG5cclxuICAvLyAxLiBUb3AgYmFyIHVwZGF0ZXNcclxuICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1wcm9qZWN0LXRpdGxlJyk7XHJcbiAgaWYgKHRpdGxlRWwpIHRpdGxlRWwudGV4dENvbnRlbnQgPSBkYXRhLnByb2plY3RfbmFtZSB8fCBkYXRhLnByb2plY3Q7XHJcbiAgY29uc3Qgc3RhdHVzQmFkZ2VFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tcHJvamVjdC1zdGF0dXMtYmFkZ2UnKTtcclxuICBpZiAoc3RhdHVzQmFkZ2VFbCkge1xyXG4gICAgc3RhdHVzQmFkZ2VFbC50ZXh0Q29udGVudCA9IGRhdGEucHJvamVjdF9zdGF0dXMgfHwgJ0luaXRpYXRpbmcnO1xyXG4gICAgc3RhdHVzQmFkZ2VFbC5jbGFzc05hbWUgPSAnYmltLWJhZGdlICcgKyAoZGF0YS5wcm9qZWN0X3N0YXR1cyA9PT0gJ0luIFByb2dyZXNzJyA/ICdiYWRnZS12YWxpZGF0ZWQnIDogJ3N0YXR1cy1kcmFmdCcpO1xyXG4gIH1cclxuXHJcbiAgLy8gMi4gSW50YWtlIFRyZWUgQmFkZ2VzXHJcbiAgY29uc3QgYmFkZ2VDb250cmFjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWRnZS1jb250cmFjdCcpO1xyXG4gIGlmIChiYWRnZUNvbnRyYWN0KSB7XHJcbiAgICBjb25zdCBoYXNDID0gKGRhdGEuY29udHJhY3RfY291bnQgPiAwIHx8IChyZWFkaW5lc3MuY29udHJhY3RfYW1vdW50ICYmIHJlYWRpbmVzcy5jb250cmFjdF9hbW91bnQgPiAwKSk7XHJcbiAgICBiYWRnZUNvbnRyYWN0LnRleHRDb250ZW50ID0gaGFzQyA/ICdWYWxpZGF0ZWQnIDogJ1BlbmRpbmcnO1xyXG4gICAgYmFkZ2VDb250cmFjdC5jbGFzc05hbWUgPSAnYmltLWJhZGdlICcgKyAoaGFzQyA/ICdiYWRnZS12YWxpZGF0ZWQnIDogJ2JhZGdlLXBlbmRpbmcnKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGJhZGdlQ2FkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhZGdlLWNhZCcpO1xyXG4gIGlmIChiYWRnZUNhZCkge1xyXG4gICAgY29uc3QgY2FkQ291bnQgPSBkYXRhLmNhZF9jb3VudCB8fCAwO1xyXG4gICAgYmFkZ2VDYWQudGV4dENvbnRlbnQgPSBgJHtjYWRDb3VudH0gU2hlZXRzYDtcclxuICAgIGJhZGdlQ2FkLmNsYXNzTmFtZSA9ICdiaW0tYmFkZ2UgJyArIChjYWRDb3VudCA+IDAgPyAnYmFkZ2UtdmFsaWRhdGVkJyA6ICdiYWRnZS1wZW5kaW5nJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBiYWRnZU1vZGVscyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWRnZS1tb2RlbHMnKTtcclxuICBpZiAoYmFkZ2VNb2RlbHMpIHtcclxuICAgIGNvbnN0IG1vZGVsQ291bnQgPSAoZGF0YS5tb2RlbHMgfHwgW10pLmxlbmd0aDtcclxuICAgIGJhZGdlTW9kZWxzLnRleHRDb250ZW50ID0gYCR7bW9kZWxDb3VudH0gTW9kZWxzYDtcclxuICAgIGJhZGdlTW9kZWxzLmNsYXNzTmFtZSA9ICdiaW0tYmFkZ2UgJyArIChtb2RlbENvdW50ID4gMCA/ICdiYWRnZS12YWxpZGF0ZWQnIDogJ2JhZGdlLXBlbmRpbmcnKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGJhZGdlQm9xID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhZGdlLWJvcScpO1xyXG4gIGlmIChiYWRnZUJvcSkge1xyXG4gICAgY29uc3QgaGFzQiA9IChkYXRhLmVzdGltYXRlcyAmJiBkYXRhLmVzdGltYXRlcy5sZW5ndGggPiAwKSB8fCAocmVhZGluZXNzLmVzdGltYXRlZF9jb3N0ICYmIHJlYWRpbmVzcy5lc3RpbWF0ZWRfY29zdCA+IDApO1xyXG4gICAgYmFkZ2VCb3EudGV4dENvbnRlbnQgPSBoYXNCID8gJ0Jhc2VsaW5lZCcgOiAnUGVuZGluZyc7XHJcbiAgICBiYWRnZUJvcS5jbGFzc05hbWUgPSAnYmltLWJhZGdlICcgKyAoaGFzQiA/ICdiYWRnZS12YWxpZGF0ZWQnIDogJ2JhZGdlLXBlbmRpbmcnKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHByb2dyZXNzTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW50YWtlLXByb2dyZXNzLWxhYmVsJyk7XHJcbiAgaWYgKHByb2dyZXNzTGFiZWwpIHtcclxuICAgIGNvbnN0IHBhc3NlZENvdW50ID0gZ2F0ZXMuZmlsdGVyKGcgPT4gZy5wYXNzZWQpLmxlbmd0aDtcclxuICAgIHByb2dyZXNzTGFiZWwudGV4dENvbnRlbnQgPSBgJHtwYXNzZWRDb3VudH0vNCBDb21wbGV0ZWA7XHJcbiAgfVxyXG5cclxuICAvLyAzLiBSZW5kZXIgSW5pdGlhdGlvbiBMb2FkZWQgTW9kZWxzIExpc3RcclxuICBjb25zdCBpbml0TW9kZWxzTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0taW5pdC1tb2RlbHMnKTtcclxuICBpZiAoaW5pdE1vZGVsc0xpc3QgJiYgZGF0YS5tb2RlbHMpIHtcclxuICAgIGlmICghZGF0YS5tb2RlbHMubGVuZ3RoKSB7XHJcbiAgICAgIGluaXRNb2RlbHNMaXN0LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPkRyb3AgSUZDIG1vZGVscyBhYm92ZSB0byBsb2FkPC9kaXY+JztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGluaXRNb2RlbHNMaXN0LmlubmVySFRNTCA9IGRhdGEubW9kZWxzLm1hcChtID0+IHtcclxuICAgICAgICBjb25zdCBpc0xvYWRlZCA9IGxvYWRlZE1vZGVscy5oYXMobS5uYW1lKTtcclxuICAgICAgICByZXR1cm4gYFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImJpbS1tb2RlbC1pdGVtICR7aXNMb2FkZWQgPyAnYWN0aXZlJyA6ICcnfVwiIGRhdGEtbW9kZWw9XCIke20ubmFtZX1cIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGVsLXRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwiaW5pdC1tb2RlbC1jaGtcIiBkYXRhLW1vZGVsPVwiJHttLm5hbWV9XCIgJHtpc0xvYWRlZCA/ICdjaGVja2VkJyA6ICcnfSBzdHlsZT1cIm1hcmdpbjowIDRweCAwIDBcIiAvPlxyXG4gICAgICAgICAgICAgIDxzcGFuPiR7bS5tb2RlbF9uYW1lIHx8IG0ubmFtZX08L3NwYW4+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImRpc2NpcGxpbmUtdGFnIHRhZy0keyhtLmRpc2NpcGxpbmUgfHwgJ2FyY2gnKS50b0xvd2VyQ2FzZSgpfVwiPiR7bS5kaXNjaXBsaW5lIHx8ICdBcmNoaXRlY3R1cmUnfTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIGA7XHJcbiAgICAgIH0pLmpvaW4oJycpO1xyXG5cclxuICAgICAgaW5pdE1vZGVsc0xpc3QucXVlcnlTZWxlY3RvckFsbCgnLmluaXQtbW9kZWwtY2hrJykuZm9yRWFjaChjaGsgPT4ge1xyXG4gICAgICAgIGNoay5vbmNoYW5nZSA9IGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgY29uc3QgbU5hbWUgPSBjaGsuZGF0YXNldC5tb2RlbDtcclxuICAgICAgICAgIGlmIChjaGsuY2hlY2tlZCkge1xyXG4gICAgICAgICAgICBhd2FpdCBsb2FkTW9kZWxHZW9tZXRyeShtTmFtZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1bmxvYWRNb2RlbChtTmFtZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZW5kZXJNb2RlbHNMaXN0KCk7XHJcbiAgICAgICAgICB1cGRhdGVFbGVtZW50TWVzaGVzTGlzdCgpO1xyXG4gICAgICAgICAgZml0VmlldygpO1xyXG4gICAgICAgIH07XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gNC4gVmVyaWZpY2F0aW9uIENhcmRzXHJcbiAgLy8gQ29tbWVyY2lhbCBDYXJkXHJcbiAgY29uc3QgbWV0Q29udHJhY3RBbXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWV0cmljLWNvbnRyYWN0LWFtb3VudCcpO1xyXG4gIGlmIChtZXRDb250cmFjdEFtdCkgbWV0Q29udHJhY3RBbXQudGV4dENvbnRlbnQgPSBgUEhQICR7KHJlYWRpbmVzcy5jb250cmFjdF9hbW91bnQgfHwgMCkudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7IG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xyXG4gIGNvbnN0IG1ldENvbnRyYWN0Q250ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYy1jb250cmFjdC1jb3VudCcpO1xyXG4gIGlmIChtZXRDb250cmFjdENudCkgbWV0Q29udHJhY3RDbnQudGV4dENvbnRlbnQgPSBgJHtkYXRhLmNvbnRyYWN0X2NvdW50IHx8IDB9IEZpbGVzYDtcclxuICBjb25zdCBiYWRnZUNvbW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FyZC1iYWRnZS1jb21tZXJjaWFsJyk7XHJcbiAgaWYgKGJhZGdlQ29tbSkge1xyXG4gICAgY29uc3QgcGFzc2VkID0gZ2F0ZXNbMF0gJiYgZ2F0ZXNbMF0ucGFzc2VkO1xyXG4gICAgYmFkZ2VDb21tLnRleHRDb250ZW50ID0gcGFzc2VkID8gJ1ZhbGlkYXRlZCcgOiAnUGVuZGluZyc7XHJcbiAgICBiYWRnZUNvbW0uY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSAnICsgKHBhc3NlZCA/ICdiYWRnZS12YWxpZGF0ZWQnIDogJ2JhZGdlLXBlbmRpbmcnKTtcclxuICB9XHJcblxyXG4gIC8vIFF1YW50aXR5IENhcmRcclxuICBjb25zdCBtZXRCb3FDb3N0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYy1ib3EtY29zdCcpO1xyXG4gIGlmIChtZXRCb3FDb3N0KSBtZXRCb3FDb3N0LnRleHRDb250ZW50ID0gYFBIUCAkeyhyZWFkaW5lc3MuZXN0aW1hdGVkX2Nvc3QgfHwgMCkudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7IG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xyXG4gIGNvbnN0IG1ldEJvcUxpbmVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYy1ib3EtbGluZXMnKTtcclxuICBpZiAobWV0Qm9xTGluZXMpIG1ldEJvcUxpbmVzLnRleHRDb250ZW50ID0gYCR7KGRhdGEuZXN0aW1hdGVzICYmIGRhdGEuZXN0aW1hdGVzWzBdICYmIGRhdGEuZXN0aW1hdGVzWzBdLmxpbmVfY291bnQpIHx8ICdTdGFuZGFyZCd9IEl0ZW1zYDtcclxuICBjb25zdCBiYWRnZVF0eSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXJkLWJhZGdlLXF1YW50aXR5Jyk7XHJcbiAgaWYgKGJhZGdlUXR5KSB7XHJcbiAgICBjb25zdCBwYXNzZWQgPSBnYXRlc1syXSAmJiBnYXRlc1syXS5wYXNzZWQ7XHJcbiAgICBiYWRnZVF0eS50ZXh0Q29udGVudCA9IHBhc3NlZCA/ICdCYXNlbGluZWQnIDogJ1BlbmRpbmcnO1xyXG4gICAgYmFkZ2VRdHkuY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSAnICsgKHBhc3NlZCA/ICdiYWRnZS12YWxpZGF0ZWQnIDogJ2JhZGdlLXBlbmRpbmcnKTtcclxuICB9XHJcblxyXG4gIC8vIFNwYXRpYWwgQ2FyZFxyXG4gIGNvbnN0IG1ldEVsZW1DbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWV0cmljLWVsZW1lbnRzLWNvdW50Jyk7XHJcbiAgaWYgKG1ldEVsZW1DbnQpIG1ldEVsZW1DbnQudGV4dENvbnRlbnQgPSBlbGVtZW50TWVzaGVzLmxlbmd0aCB8fCAoZGF0YS5tb2RlbHMgfHwgW10pLnJlZHVjZSgoc3VtLCBtKSA9PiBzdW0gKyAobS5lbGVtZW50c19jb3VudCB8fCAwKSwgMCk7XHJcbiAgY29uc3QgbWV0QWxpZ24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWV0cmljLWFsaWduLXN0YXR1cycpO1xyXG4gIGNvbnN0IGJhZGdlU3BhdGlhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXJkLWJhZGdlLXNwYXRpYWwnKTtcclxuICBjb25zdCBkcmlmdEFsZXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhcmQtZHJpZnQtYWxlcnQnKTtcclxuICBjb25zdCBhbGlnbm1lbnQgPSBkYXRhLmFsaWdubWVudCB8fCB7fTtcclxuXHJcbiAgaWYgKGFsaWdubWVudC5kcmlmdF9kZXRlY3RlZCkge1xyXG4gICAgZGV0ZWN0ZWREcmlmdE1vZGVscyA9IGFsaWdubWVudC5kcmlmdF9tb2RlbHMgfHwgW107XHJcbiAgICBpZiAobWV0QWxpZ24pIG1ldEFsaWduLnRleHRDb250ZW50ID0gYERyaWZ0OiAke2FsaWdubWVudC5tYXhfZGlzdGFuY2V9bWA7XHJcbiAgICBpZiAoYmFkZ2VTcGF0aWFsKSB7XHJcbiAgICAgIGJhZGdlU3BhdGlhbC50ZXh0Q29udGVudCA9ICdXYXJuaW5nJztcclxuICAgICAgYmFkZ2VTcGF0aWFsLmNsYXNzTmFtZSA9ICdiaW0tYmFkZ2UgYmFkZ2Utd2FybmluZyc7XHJcbiAgICB9XHJcbiAgICBpZiAoZHJpZnRBbGVydCkgZHJpZnRBbGVydC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICB9IGVsc2Uge1xyXG4gICAgZGV0ZWN0ZWREcmlmdE1vZGVscyA9IFtdO1xyXG4gICAgaWYgKG1ldEFsaWduKSBtZXRBbGlnbi50ZXh0Q29udGVudCA9ICdBbGlnbmVkJztcclxuICAgIGlmIChiYWRnZVNwYXRpYWwpIHtcclxuICAgICAgYmFkZ2VTcGF0aWFsLnRleHRDb250ZW50ID0gYCR7KGRhdGEubW9kZWxzIHx8IFtdKS5sZW5ndGh9IEFsaWduZWRgO1xyXG4gICAgICBiYWRnZVNwYXRpYWwuY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSBiYWRnZS12YWxpZGF0ZWQnO1xyXG4gICAgfVxyXG4gICAgaWYgKGRyaWZ0QWxlcnQpIGRyaWZ0QWxlcnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICB9XHJcblxyXG4gIC8vIDJEIERyYXdpbmdzIENhcmRcclxuICBjb25zdCBtZXRDYWRDbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWV0cmljLWNhZC1jb3VudCcpO1xyXG4gIGlmIChtZXRDYWRDbnQpIG1ldENhZENudC50ZXh0Q29udGVudCA9IGAke2RhdGEuY2FkX2NvdW50IHx8IDB9YDtcclxuICBjb25zdCBtZXRDYWRTdGF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYy1jYWQtc3RhdHVzJyk7XHJcbiAgaWYgKG1ldENhZFN0YXQpIG1ldENhZFN0YXQudGV4dENvbnRlbnQgPSAoZGF0YS5jYWRfY291bnQgPiAwKSA/ICdBdmFpbGFibGUnIDogJ1BlbmRpbmcnO1xyXG4gIGNvbnN0IGJhZGdlRHJhd2luZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FyZC1iYWRnZS1kcmF3aW5ncycpO1xyXG4gIGlmIChiYWRnZURyYXdpbmdzKSB7XHJcbiAgICBiYWRnZURyYXdpbmdzLnRleHRDb250ZW50ID0gYCR7ZGF0YS5jYWRfY291bnQgfHwgMH0gU2hlZXRzYDtcclxuICAgIGJhZGdlRHJhd2luZ3MuY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSAnICsgKGRhdGEuY2FkX2NvdW50ID4gMCA/ICdiYWRnZS12YWxpZGF0ZWQnIDogJ2JhZGdlLXBlbmRpbmcnKTtcclxuICB9XHJcblxyXG4gIC8vIFN0YWdlLUdhdGUgQ2hlY2tsaXN0IENhcmRcclxuICBjb25zdCBnYXRlSXRlbXMgPSBbXHJcbiAgICB7IGlkOiAnZ2F0ZS1pdGVtLWNvbnRyYWN0JywgcGFzc2VkOiBnYXRlc1swXSAmJiBnYXRlc1swXS5wYXNzZWQgfSxcclxuICAgIHsgaWQ6ICdnYXRlLWl0ZW0tbW9kZWwnLCBwYXNzZWQ6IGdhdGVzWzFdICYmIGdhdGVzWzFdLnBhc3NlZCB9LFxyXG4gICAgeyBpZDogJ2dhdGUtaXRlbS1ib3EnLCBwYXNzZWQ6IGdhdGVzWzJdICYmIGdhdGVzWzJdLnBhc3NlZCB9LFxyXG4gICAgeyBpZDogJ2dhdGUtaXRlbS1zaWdub2ZmJywgcGFzc2VkOiByZWFkaW5lc3MuYWxsX3JlYWR5IH0sXHJcbiAgXTtcclxuXHJcbiAgZ2F0ZUl0ZW1zLmZvckVhY2goZyA9PiB7XHJcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGcuaWQpO1xyXG4gICAgaWYgKGVsKSB7XHJcbiAgICAgIGlmIChnLnBhc3NlZCkge1xyXG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3Bhc3NlZCcpO1xyXG4gICAgICAgIGNvbnN0IGljb24gPSBlbC5xdWVyeVNlbGVjdG9yKCcuZ2F0ZS1pY29uJyk7XHJcbiAgICAgICAgaWYgKGljb24pIGljb24udGV4dENvbnRlbnQgPSAnXHUyNzEzJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdwYXNzZWQnKTtcclxuICAgICAgICBjb25zdCBpY29uID0gZWwucXVlcnlTZWxlY3RvcignLmdhdGUtaWNvbicpO1xyXG4gICAgICAgIGlmIChpY29uKSBpY29uLnRleHRDb250ZW50ID0gJ1x1MjVDQic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgY29uc3QgY2FyZEJhZGdlR2F0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXJkLWJhZGdlLWdhdGUnKTtcclxuICBpZiAoY2FyZEJhZGdlR2F0ZSkge1xyXG4gICAgaWYgKHJlYWRpbmVzcy5hbGxfcmVhZHkpIHtcclxuICAgICAgY2FyZEJhZGdlR2F0ZS50ZXh0Q29udGVudCA9ICdSZWFkeSBmb3IgS2lja29mZic7XHJcbiAgICAgIGNhcmRCYWRnZUdhdGUuY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSBiYWRnZS12YWxpZGF0ZWQnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgcmVtYWluaW5nID0gZ2F0ZXMuZmlsdGVyKGcgPT4gIWcucGFzc2VkKS5sZW5ndGg7XHJcbiAgICAgIGNhcmRCYWRnZUdhdGUudGV4dENvbnRlbnQgPSBgJHtyZW1haW5pbmd9IFJlcXVpcmVkYDtcclxuICAgICAgY2FyZEJhZGdlR2F0ZS5jbGFzc05hbWUgPSAnYmltLWJhZGdlIGJhZGdlLXBlbmRpbmcnO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgYnRuQXBwcm92ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tYXBwcm92ZS1pbml0aWF0aW9uJyk7XHJcbiAgaWYgKGJ0bkFwcHJvdmUpIHtcclxuICAgIGJ0bkFwcHJvdmUuZGlzYWJsZWQgPSAhcmVhZGluZXNzLmFsbF9yZWFkeTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHVwbG9hZEludGFrZUZpbGUoZmlsZSwgY2F0ZWdvcnksIGRpc2NpcGxpbmUpIHtcclxuICBzaG93TG9hZGluZyhgVXBsb2FkaW5nICR7ZmlsZS5uYW1lfSB0byAwJHtjYXRlZ29yeX1cdTIwMjZgLCB0cnVlKTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUsIGZpbGUubmFtZSk7XHJcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2lzX3ByaXZhdGUnLCAnMCcpO1xyXG4gICAgZm9ybURhdGEuYXBwZW5kKCdkb2N0eXBlJywgJ1Byb2plY3QnKTtcclxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZG9jbmFtZScsIGFjdGl2ZVByb2plY3QgfHwgJ25ldycpO1xyXG4gICAgY29uc3QgdXBsb2FkUmVzcCA9IGF3YWl0IGZldGNoKCcvYXBpL21ldGhvZC91cGxvYWRfZmlsZScsIHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIGJvZHk6IGZvcm1EYXRhLFxyXG4gICAgICBoZWFkZXJzOiB7ICdYLUZyYXBwZS1DU1JGLVRva2VuJzogKHdpbmRvdy5mcmFwcGUgJiYgZnJhcHBlLmNzcmZfdG9rZW4pIHx8ICcnIH0sXHJcbiAgICB9KTtcclxuICAgIGlmICghdXBsb2FkUmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKCdVcGxvYWQgcmVxdWVzdCBmYWlsZWQnKTtcclxuICAgIGNvbnN0IHVwbG9hZERhdGEgPSBhd2FpdCB1cGxvYWRSZXNwLmpzb24oKTtcclxuICAgIGNvbnN0IGZpbGVVcmwgPSB1cGxvYWREYXRhLm1lc3NhZ2UgJiYgdXBsb2FkRGF0YS5tZXNzYWdlLmZpbGVfdXJsO1xyXG4gICAgaWYgKCFmaWxlVXJsKSB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXRyaWV2ZSBmaWxlIFVSTCcpO1xyXG5cclxuICAgIGNvbnN0IHJvdXRlUmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICBtZXRob2Q6IEFQSS51cGxvYWRfaW50YWtlX2ZpbGUsXHJcbiAgICAgIGFyZ3M6IHtcclxuICAgICAgICBwcm9qZWN0OiBhY3RpdmVQcm9qZWN0LFxyXG4gICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcclxuICAgICAgICBmaWxlX3VybDogZmlsZVVybCxcclxuICAgICAgICBmaWxlbmFtZTogZmlsZS5uYW1lLFxyXG4gICAgICAgIGRpc2NpcGxpbmU6IGRpc2NpcGxpbmUgfHwgJ0FyY2hpdGVjdHVyZScsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoY2F0ZWdvcnkgPT09ICdib3EnKSB7XHJcbiAgICAgIHN0YWdlZEJvcUZpbGVVcmwgPSBmaWxlVXJsO1xyXG4gICAgICBhd2FpdCBvcGVuQm9xQ29sdW1uTWFwcGluZ01vZGFsKGZpbGVVcmwpO1xyXG4gICAgfSBlbHNlIGlmIChjYXRlZ29yeSA9PT0gJ2lmYycpIHtcclxuICAgICAgY29uc3QgY3JlYXRlZE1vZGVsID0gcm91dGVSZXMubWVzc2FnZSAmJiByb3V0ZVJlcy5tZXNzYWdlLmNyZWF0ZWRfcmVjb3JkcyAmJiByb3V0ZVJlcy5tZXNzYWdlLmNyZWF0ZWRfcmVjb3Jkc1snQklNIE1vZGVsJ107XHJcbiAgICAgIGlmIChjcmVhdGVkTW9kZWwpIHtcclxuICAgICAgICBhd2FpdCBsb2FkTW9kZWxzTGlzdCgpO1xyXG4gICAgICAgIGF3YWl0IGxvYWRNb2RlbEdlb21ldHJ5KGNyZWF0ZWRNb2RlbCk7XHJcbiAgICAgICAgcmVuZGVyTW9kZWxzTGlzdCgpO1xyXG4gICAgICAgIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XHJcbiAgICAgICAgZml0VmlldygpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U3RhdHVzKGBGaWxlZCAke2ZpbGUubmFtZX0gaW50byAke3JvdXRlUmVzLm1lc3NhZ2Uucm91dGVkX2ZvbGRlcn1gKTtcclxuICAgIGF3YWl0IHJlZnJlc2hJbml0aWF0aW9uU3RhdHVzKCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgc2V0U3RhdHVzKGBJbnRha2UgZXJyb3I6ICR7ZS5tZXNzYWdlIHx8IGV9YCk7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoeyB0aXRsZTogX18oJ0ludGFrZSBFcnJvcicpLCBtZXNzYWdlOiBlLm1lc3NhZ2UgfHwgZSwgaW5kaWNhdG9yOiAncmVkJyB9KTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG9wZW5Cb3FDb2x1bW5NYXBwaW5nTW9kYWwoZmlsZVVybCkge1xyXG4gIHNob3dMb2FkaW5nKCdBbmFseXppbmcgc3ByZWFkc2hlZXQgY29sdW1uc1x1MjAyNicsIHRydWUpO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgIG1ldGhvZDogQVBJLnBhcnNlX2JvcV9maWxlLFxyXG4gICAgICBhcmdzOiB7IGZpbGVfdXJsOiBmaWxlVXJsIH0sXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHBhcnNlZCA9IHJlcy5tZXNzYWdlO1xyXG4gICAgaWYgKCFwYXJzZWQpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1ib3EtbWFwcGluZycpO1xyXG4gICAgaWYgKCFtb2RhbCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGhlYWRlcnMgPSBwYXJzZWQuaGVhZGVycyB8fCBbXTtcclxuICAgIGNvbnN0IHN1Z2dlc3RlZCA9IHBhcnNlZC5zdWdnZXN0ZWRfbWFwcGluZyB8fCB7fTtcclxuXHJcbiAgICBjb25zdCBzZWxlY3RJZHMgPSB7XHJcbiAgICAgICdtYXAtY29sLWl0ZW0tY29kZSc6IHN1Z2dlc3RlZC5pdGVtX2NvZGUsXHJcbiAgICAgICdtYXAtY29sLWRlc2MnOiBzdWdnZXN0ZWQuZGVzY3JpcHRpb24sXHJcbiAgICAgICdtYXAtY29sLXVuaXQnOiBzdWdnZXN0ZWQudW5pdCxcclxuICAgICAgJ21hcC1jb2wtcXR5Jzogc3VnZ2VzdGVkLnF1YW50aXR5LFxyXG4gICAgICAnbWFwLWNvbC1yYXRlJzogc3VnZ2VzdGVkLnVuaXRfcmF0ZSxcclxuICAgICAgJ21hcC1jb2wtdG90YWwnOiBzdWdnZXN0ZWQudG90YWxfYW1vdW50LFxyXG4gICAgfTtcclxuXHJcbiAgICBPYmplY3QuZW50cmllcyhzZWxlY3RJZHMpLmZvckVhY2goKFtzZWxJZCwgc3VnZ2VzdGVkVmFsXSkgPT4ge1xyXG4gICAgICBjb25zdCBzZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxJZCk7XHJcbiAgICAgIGlmICghc2VsZWN0KSByZXR1cm47XHJcbiAgICAgIHNlbGVjdC5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPi0tIElnbm9yZSAvIE5vdCBQcmVzZW50IC0tPC9vcHRpb24+JyArXHJcbiAgICAgICAgaGVhZGVycy5tYXAoaCA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7aH1cIiAke2ggPT09IHN1Z2dlc3RlZFZhbCA/ICdzZWxlY3RlZCcgOiAnJ30+JHtofTwvb3B0aW9uPmApLmpvaW4oJycpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgdGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGhlYWQtYm9xLXByZXZpZXcnKTtcclxuICAgIGNvbnN0IHRib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rib2R5LWJvcS1wcmV2aWV3Jyk7XHJcbiAgICBpZiAodGhlYWQpIHtcclxuICAgICAgdGhlYWQuaW5uZXJIVE1MID0gJzx0cj4nICsgaGVhZGVycy5tYXAoaCA9PiBgPHRoPiR7aH08L3RoPmApLmpvaW4oJycpICsgJzwvdHI+JztcclxuICAgIH1cclxuICAgIGlmICh0Ym9keSAmJiBwYXJzZWQucHJldmlld19pdGVtcykge1xyXG4gICAgICB0Ym9keS5pbm5lckhUTUwgPSBwYXJzZWQucHJldmlld19pdGVtcy5tYXAoaXQgPT4gYFxyXG4gICAgICAgIDx0cj5cclxuICAgICAgICAgIDx0ZD4ke2l0Lml0ZW1fY29kZSB8fCAnJ308L3RkPlxyXG4gICAgICAgICAgPHRkPiR7aXQuZGVzY3JpcHRpb24gfHwgJyd9PC90ZD5cclxuICAgICAgICAgIDx0ZD4ke2l0LnVuaXQgfHwgJyd9PC90ZD5cclxuICAgICAgICAgIDx0ZD4ke2l0LnF1YW50aXR5IHx8ICcnfTwvdGQ+XHJcbiAgICAgICAgICA8dGQ+JHsoaXQudW5pdF9yYXRlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9PC90ZD5cclxuICAgICAgICAgIDx0ZD4keyhpdC50b3RhbF9hbW91bnQgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX08L3RkPlxyXG4gICAgICAgIDwvdHI+XHJcbiAgICAgIGApLmpvaW4oJycpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1bW1hcnlFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3EtcHJldmlldy1zdW1tYXJ5Jyk7XHJcbiAgICBpZiAoc3VtbWFyeUVsKSB7XHJcbiAgICAgIHN1bW1hcnlFbC50ZXh0Q29udGVudCA9IGBUb3RhbCBJdGVtczogJHtwYXJzZWQudG90YWxfaXRlbXNfY291bnR9IHwgRXN0aW1hdGVkIFRvdGFsOiBQSFAgJHsocGFyc2VkLnRvdGFsX2Ftb3VudCB8fCAwKS50b0xvY2FsZVN0cmluZyh1bmRlZmluZWQsIHsgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfWA7XHJcbiAgICB9XHJcblxyXG4gICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoeyB0aXRsZTogX18oJ1NwcmVhZHNoZWV0IEVycm9yJyksIG1lc3NhZ2U6IGUubWVzc2FnZSB8fCBlLCBpbmRpY2F0b3I6ICdyZWQnIH0pO1xyXG4gIH0gZmluYWxseSB7XHJcbiAgICBzaG93TG9hZGluZygnJywgZmFsc2UpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY29tbWl0Qm9xTWFwcGluZygpIHtcclxuICBpZiAoIXN0YWdlZEJvcUZpbGVVcmwpIHJldHVybjtcclxuICBjb25zdCBtYXBwaW5nID0ge1xyXG4gICAgaXRlbV9jb2RlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWNvbC1pdGVtLWNvZGUnKT8udmFsdWUgfHwgJycsXHJcbiAgICBkZXNjcmlwdGlvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1jb2wtZGVzYycpPy52YWx1ZSB8fCAnJyxcclxuICAgIHVuaXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtY29sLXVuaXQnKT8udmFsdWUgfHwgJycsXHJcbiAgICBxdWFudGl0eTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1jb2wtcXR5Jyk/LnZhbHVlIHx8ICcnLFxyXG4gICAgdW5pdF9yYXRlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWNvbC1yYXRlJyk/LnZhbHVlIHx8ICcnLFxyXG4gICAgdG90YWxfYW1vdW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWNvbC10b3RhbCcpPy52YWx1ZSB8fCAnJyxcclxuICB9O1xyXG5cclxuICBzaG93TG9hZGluZygnQ3JlYXRpbmcgQ29uc3RydWN0aW9uIEVzdGltYXRlXHUyMDI2JywgdHJ1ZSk7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHtcclxuICAgICAgbWV0aG9kOiBBUEkuY29tbWl0X2JvcV9lc3RpbWF0ZSxcclxuICAgICAgYXJnczoge1xyXG4gICAgICAgIHByb2plY3Q6IGFjdGl2ZVByb2plY3QsXHJcbiAgICAgICAgZmlsZV91cmw6IHN0YWdlZEJvcUZpbGVVcmwsXHJcbiAgICAgICAgbWFwcGluZ19qc29uOiBKU09OLnN0cmluZ2lmeShtYXBwaW5nKSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1ib3EtbWFwcGluZycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICBzZXRTdGF0dXMoYEltcG9ydGVkICR7cmVzLm1lc3NhZ2UubGluZXNfaW1wb3J0ZWR9IEJPUSBpdGVtcy4gVG90YWw6IFBIUCAke3Jlcy5tZXNzYWdlLnRvdGFsX2Ftb3VudC50b0xvY2FsZVN0cmluZygpfWApO1xyXG4gICAgZnJhcHBlLnNob3dfYWxlcnQoe1xyXG4gICAgICBtZXNzYWdlOiBgXHUyNzA1IEJPUSBFc3RpbWF0ZSBiYXNlbGluZWQgKCR7cmVzLm1lc3NhZ2UubGluZXNfaW1wb3J0ZWR9IGl0ZW1zKWAsXHJcbiAgICAgIGluZGljYXRvcjogJ2dyZWVuJyxcclxuICAgIH0pO1xyXG4gICAgYXdhaXQgcmVmcmVzaEluaXRpYXRpb25TdGF0dXMoKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoeyB0aXRsZTogX18oJ0NvbW1pdCBFcnJvcicpLCBtZXNzYWdlOiBlLm1lc3NhZ2UgfHwgZSwgaW5kaWNhdG9yOiAncmVkJyB9KTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkQm9xVGVtcGxhdGUoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkuZG93bmxvYWRfYm9xX3RlbXBsYXRlIH0pO1xyXG4gICAgaWYgKCFyZXMgfHwgIXJlcy5tZXNzYWdlKSByZXR1cm47XHJcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3Jlcy5tZXNzYWdlLmNzdl9kYXRhXSwgeyB0eXBlOiAndGV4dC9jc3Y7Y2hhcnNldD11dGYtODsnIH0pO1xyXG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcclxuICAgIGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICBsaW5rLmRvd25sb2FkID0gcmVzLm1lc3NhZ2UuZmlsZW5hbWUgfHwgJ3N0YW5kYXJkX2JvcV90ZW1wbGF0ZS5jc3YnO1xyXG4gICAgbGluay5jbGljaygpO1xyXG4gICAgVVJMLnJldm9rZU9iamVjdFVSTChsaW5rLmhyZWYpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBkb3dubG9hZCBCT1EgdGVtcGxhdGU6JywgZSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcm9zc0hpZ2hsaWdodE1hcHBlZFF1YW50aXRpZXMoKSB7XHJcbiAgaWYgKCFlbGVtZW50TWVzaGVzLmxlbmd0aCkge1xyXG4gICAgZnJhcHBlLm1zZ3ByaW50KF9fKCdMb2FkIElGQyBtb2RlbHMgaW4gdGhlIHZpZXdlciB0byBoaWdobGlnaHQgdGFrZW9mZiBxdWFudGl0aWVzLicpKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGVsZW1lbnRNZXNoZXMuZm9yRWFjaChpdGVtID0+IHtcclxuICAgIGNvbnN0IGlzTWFwcGVkID0gKGl0ZW0uZXhwcmVzc0lEICUgMiA9PT0gMCk7XHJcbiAgICBpZiAoaXRlbS5tZXNoICYmIGl0ZW0ubWVzaC5tYXRlcmlhbCkge1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtLm1lc2gubWF0ZXJpYWwpKSB7XHJcbiAgICAgICAgaXRlbS5tZXNoLm1hdGVyaWFsLmZvckVhY2gobWF0ID0+IHtcclxuICAgICAgICAgIG1hdC50cmFuc3BhcmVudCA9IHRydWU7XHJcbiAgICAgICAgICBtYXQub3BhY2l0eSA9IGlzTWFwcGVkID8gMS4wIDogMC4xNTtcclxuICAgICAgICAgIGlmIChpc01hcHBlZCkgbWF0LmNvbG9yLnNldEhleCgweDIyYzU1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaXRlbS5tZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcclxuICAgICAgICBpdGVtLm1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IGlzTWFwcGVkID8gMS4wIDogMC4xNTtcclxuICAgICAgICBpZiAoaXNNYXBwZWQpIGl0ZW0ubWVzaC5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHgyMmM1NWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgc2V0U3RhdHVzKCdDcm9zcy1oaWdobGlnaHRlZCBtYXBwZWQgdGFrZW9mZiBlbGVtZW50cyAoR3JlZW4gPSBDb3N0ZWQsIEdob3N0ID0gVW5tYXBwZWQpJyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGF1dG9BbGlnbk1vZGVscygpIHtcclxuICBpZiAoIWRldGVjdGVkRHJpZnRNb2RlbHMubGVuZ3RoKSB7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoX18oJ05vIG1vZGVscyBjdXJyZW50bHkgcmVxdWlyZSBjb29yZGluYXRlIGFsaWdubWVudC4nKSk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBzaG93TG9hZGluZygnQWxpZ25pbmcgbW9kZWwgY29vcmRpbmF0ZXMgdG8gcHJvamVjdCBiYXNlIHBvaW50XHUyMDI2JywgdHJ1ZSk7XHJcbiAgdHJ5IHtcclxuICAgIGZvciAoY29uc3QgZHJpZnQgb2YgZGV0ZWN0ZWREcmlmdE1vZGVscykge1xyXG4gICAgICBjb25zdCB2ZWMgPSBkcmlmdC5vZmZzZXRfdmVjdG9yIHx8IFswLCAwLCAwXTtcclxuICAgICAgYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICAgIG1ldGhvZDogQVBJLmFsaWduX21vZGVsX2Nvb3JkaW5hdGVzLFxyXG4gICAgICAgIGFyZ3M6IHtcclxuICAgICAgICAgIG1vZGVsX25hbWU6IGRyaWZ0Lm1vZGVsLFxyXG4gICAgICAgICAgb2Zmc2V0X3g6IHZlY1swXSxcclxuICAgICAgICAgIG9mZnNldF95OiB2ZWNbMV0sXHJcbiAgICAgICAgICBvZmZzZXRfejogdmVjWzJdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgbW9kZWxNZXNoID0gbG9hZGVkTW9kZWxzLmdldChkcmlmdC5tb2RlbCk7XHJcbiAgICAgIGlmIChtb2RlbE1lc2gpIHtcclxuICAgICAgICBtb2RlbE1lc2gucG9zaXRpb24ueCArPSB2ZWNbMF07XHJcbiAgICAgICAgbW9kZWxNZXNoLnBvc2l0aW9uLnkgKz0gdmVjWzFdO1xyXG4gICAgICAgIG1vZGVsTWVzaC5wb3NpdGlvbi56ICs9IHZlY1syXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiAnXHUyNzA1IE11bHRpLWRpc2NpcGxpbmUgbW9kZWxzIGF1dG8tYWxpZ25lZCB0byBwcm9qZWN0IG9yaWdpbicsIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcclxuICAgIGF3YWl0IHJlZnJlc2hJbml0aWF0aW9uU3RhdHVzKCk7XHJcbiAgICBmaXRWaWV3KCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgZnJhcHBlLm1zZ3ByaW50KHsgdGl0bGU6IF9fKCdBbGlnbm1lbnQgRXJyb3InKSwgbWVzc2FnZTogZS5tZXNzYWdlIHx8IGUsIGluZGljYXRvcjogJ3JlZCcgfSk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBhcHByb3ZlUHJvamVjdEtpY2tvZmYoKSB7XHJcbiAgZnJhcHBlLmNvbmZpcm0oXHJcbiAgICBgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGFwcHJvdmUgUHJvamVjdCBJbml0aWF0aW9uIGZvciA8Yj4ke2FjdGl2ZVByb2plY3R9PC9iPiBhbmQgdHJhbnNpdGlvbiB0byBBY3RpdmUgQ29uc3RydWN0aW9uPyBUaGlzIGZyZWV6ZXMgdGhlIGJhc2VsaW5lIGNvbnRyYWN0IGFuZCBCT1EuYCxcclxuICAgIGFzeW5jICgpID0+IHtcclxuICAgICAgc2hvd0xvYWRpbmcoJ0F1dGhvcml6aW5nIFByb2plY3QgS2lja29mZlx1MjAyNicsIHRydWUpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHtcclxuICAgICAgICAgIG1ldGhvZDogQVBJLmFwcHJvdmVfcHJvamVjdF9pbml0aWF0aW9uLFxyXG4gICAgICAgICAgYXJnczogeyBwcm9qZWN0OiBhY3RpdmVQcm9qZWN0IH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZnJhcHBlLm1zZ3ByaW50KHtcclxuICAgICAgICAgIHRpdGxlOiBfXygnXHVEODNEXHVERTgwIFByb2plY3QgSW5pdGlhdGlvbiBBcHByb3ZlZCEnKSxcclxuICAgICAgICAgIG1lc3NhZ2U6IHJlcy5tZXNzYWdlLm1lc3NhZ2UsXHJcbiAgICAgICAgICBpbmRpY2F0b3I6ICdncmVlbicsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2V0QXBwTW9kZSgnY29vcmRpbmF0aW9uJyk7XHJcbiAgICAgICAgYXdhaXQgcmVmcmVzaEluaXRpYXRpb25TdGF0dXMoKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGZyYXBwZS5tc2dwcmludCh7IHRpdGxlOiBfXygnQXBwcm92YWwgRmFpbGVkJyksIG1lc3NhZ2U6IGUubWVzc2FnZSB8fCBlLCBpbmRpY2F0b3I6ICdyZWQnIH0pO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0SW5pdGlhdGlvbkV2ZW50cygpIHtcclxuICBjb25zdCBidG5Jbml0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1tb2RlLWluaXRpYXRpb24nKTtcclxuICBjb25zdCBidG5Db29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tbW9kZS1jb29yZGluYXRpb24nKTtcclxuICBpZiAoYnRuSW5pdCkgYnRuSW5pdC5vbmNsaWNrID0gKCkgPT4gc2V0QXBwTW9kZSgnaW5pdGlhdGlvbicpO1xyXG4gIGlmIChidG5Db29yZCkgYnRuQ29vcmQub25jbGljayA9ICgpID0+IHNldEFwcE1vZGUoJ2Nvb3JkaW5hdGlvbicpO1xyXG5cclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmltLXZwLXRhYicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4gc2V0Vmlld3BvcnRUYWIoYnRuLmRhdGFzZXQudnApO1xyXG4gIH0pO1xyXG5cclxuICBjb25zdCBidG5Cb3FUcGwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWRvd25sb2FkLWJvcS10ZW1wbGF0ZScpO1xyXG4gIGlmIChidG5Cb3FUcGwpIGJ0bkJvcVRwbC5vbmNsaWNrID0gZG93bmxvYWRCb3FUZW1wbGF0ZTtcclxuXHJcbiAgY29uc3QgYnRuT3BlbkRyaXZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1vcGVuLWRyaXZlJyk7XHJcbiAgaWYgKGJ0bk9wZW5Ecml2ZSkge1xyXG4gICAgYnRuT3BlbkRyaXZlLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgIGlmIChpbml0aWF0aW9uRGF0YSAmJiBpbml0aWF0aW9uRGF0YS5kcml2ZV9mb2xkZXIpIHtcclxuICAgICAgICB3aW5kb3cub3BlbihgL2RyaXZlP2ZvbGRlcj0ke2VuY29kZVVSSUNvbXBvbmVudChpbml0aWF0aW9uRGF0YS5kcml2ZV9mb2xkZXIpfWAsICdfYmxhbmsnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmcmFwcGUubXNncHJpbnQoX18oJ0RyaXZlIGZvbGRlciBub3QgeWV0IGNyZWF0ZWQgZm9yIHRoaXMgcHJvamVjdC4nKSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBjYXRlZ29yaWVzID0gW1xyXG4gICAgeyBjYXQ6ICdjb250cmFjdCcsIGlucHV0SWQ6ICdmaWxlLWlucHV0LWNvbnRyYWN0JywgZHJvcElkOiAnZHJvcHpvbmUtY29udHJhY3QnIH0sXHJcbiAgICB7IGNhdDogJ2NhZCcsIGlucHV0SWQ6ICdmaWxlLWlucHV0LWNhZCcsIGRyb3BJZDogJ2Ryb3B6b25lLWNhZCcgfSxcclxuICAgIHsgY2F0OiAnaWZjJywgaW5wdXRJZDogJ2ZpbGUtaW5wdXQtaWZjJywgZHJvcElkOiAnZHJvcHpvbmUtaWZjJyB9LFxyXG4gICAgeyBjYXQ6ICdib3EnLCBpbnB1dElkOiAnZmlsZS1pbnB1dC1ib3EnLCBkcm9wSWQ6ICdkcm9wem9uZS1ib3EnIH0sXHJcbiAgXTtcclxuXHJcbiAgY2F0ZWdvcmllcy5mb3JFYWNoKGMgPT4ge1xyXG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjLmlucHV0SWQpO1xyXG4gICAgY29uc3QgZHJvcHpvbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjLmRyb3BJZCk7XHJcblxyXG4gICAgaWYgKGlucHV0KSB7XHJcbiAgICAgIGlucHV0Lm9uY2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGZpbGUgPSBpbnB1dC5maWxlc1swXTtcclxuICAgICAgICBpZiAoIWZpbGUpIHJldHVybjtcclxuICAgICAgICBjb25zdCBkaXNjU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdC1pbnRha2UtZGlzYycpO1xyXG4gICAgICAgIGNvbnN0IGRpc2NpcGxpbmUgPSAoYy5jYXQgPT09ICdpZmMnICYmIGRpc2NTZWxlY3QgJiYgZGlzY1NlbGVjdC52YWx1ZSAhPT0gJ0F1dG8nKSA/IGRpc2NTZWxlY3QudmFsdWUgOiBudWxsO1xyXG4gICAgICAgIHVwbG9hZEludGFrZUZpbGUoZmlsZSwgYy5jYXQsIGRpc2NpcGxpbmUpO1xyXG4gICAgICAgIGlucHV0LnZhbHVlID0gJyc7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRyb3B6b25lKSB7XHJcbiAgICAgIGRyb3B6b25lLm9uZHJhZ292ZXIgPSAoZSkgPT4ge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBkcm9wem9uZS5jbGFzc0xpc3QuYWRkKCdkcmFnb3ZlcicpO1xyXG4gICAgICB9O1xyXG4gICAgICBkcm9wem9uZS5vbmRyYWdsZWF2ZSA9ICgpID0+IGRyb3B6b25lLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdvdmVyJyk7XHJcbiAgICAgIGRyb3B6b25lLm9uZHJvcCA9IChlKSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGRyb3B6b25lLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdvdmVyJyk7XHJcbiAgICAgICAgaWYgKGUuZGF0YVRyYW5zZmVyLmZpbGVzICYmIGUuZGF0YVRyYW5zZmVyLmZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGNvbnN0IGZpbGUgPSBlLmRhdGFUcmFuc2Zlci5maWxlc1swXTtcclxuICAgICAgICAgIGNvbnN0IGRpc2NTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0LWludGFrZS1kaXNjJyk7XHJcbiAgICAgICAgICBjb25zdCBkaXNjaXBsaW5lID0gKGMuY2F0ID09PSAnaWZjJyAmJiBkaXNjU2VsZWN0ICYmIGRpc2NTZWxlY3QudmFsdWUgIT09ICdBdXRvJykgPyBkaXNjU2VsZWN0LnZhbHVlIDogbnVsbDtcclxuICAgICAgICAgIHVwbG9hZEludGFrZUZpbGUoZmlsZSwgYy5jYXQsIGRpc2NpcGxpbmUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgY29uc3QgYnRuSGlnaGxpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1oaWdobGlnaHQtbWFwcGVkJyk7XHJcbiAgaWYgKGJ0bkhpZ2hsaWdodCkgYnRuSGlnaGxpZ2h0Lm9uY2xpY2sgPSBjcm9zc0hpZ2hsaWdodE1hcHBlZFF1YW50aXRpZXM7XHJcblxyXG4gIGNvbnN0IGJ0bkF1dG9BbGlnbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tZml4LWFsaWdubWVudCcpO1xyXG4gIGlmIChidG5BdXRvQWxpZ24pIGJ0bkF1dG9BbGlnbi5vbmNsaWNrID0gYXV0b0FsaWduTW9kZWxzO1xyXG5cclxuICBjb25zdCBidG5GaXRGZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWZpdC1mZWRlcmF0aW9uJyk7XHJcbiAgaWYgKGJ0bkZpdEZlZCkgYnRuRml0RmVkLm9uY2xpY2sgPSBmaXRWaWV3O1xyXG5cclxuICBjb25zdCBidG5WaWV3Q2FkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi12aWV3LWNhZC10YWInKTtcclxuICBpZiAoYnRuVmlld0NhZCkgYnRuVmlld0NhZC5vbmNsaWNrID0gKCkgPT4gc2V0Vmlld3BvcnRUYWIoJ2NhZCcpO1xyXG5cclxuICBjb25zdCBidG5BcHByb3ZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1hcHByb3ZlLWluaXRpYXRpb24nKTtcclxuICBpZiAoYnRuQXBwcm92ZSkgYnRuQXBwcm92ZS5vbmNsaWNrID0gYXBwcm92ZVByb2plY3RLaWNrb2ZmO1xyXG5cclxuICBjb25zdCBidG5DbG9zZUJvcSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYm9xLW1vZGFsJyk7XHJcbiAgY29uc3QgYnRuQ2FuY2VsQm9xID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtYm9xLW1hcHBpbmcnKTtcclxuICBjb25zdCBidG5Db21taXRCb3EgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbW1pdC1ib3EtbWFwcGluZycpO1xyXG5cclxuICBpZiAoYnRuQ2xvc2VCb3EpIGJ0bkNsb3NlQm9xLm9uY2xpY2sgPSAoKSA9PiB7IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1ib3EtbWFwcGluZycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IH07XHJcbiAgaWYgKGJ0bkNhbmNlbEJvcSkgYnRuQ2FuY2VsQm9xLm9uY2xpY2sgPSAoKSA9PiB7IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1ib3EtbWFwcGluZycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IH07XHJcbiAgaWYgKGJ0bkNvbW1pdEJvcSkgYnRuQ29tbWl0Qm9xLm9uY2xpY2sgPSBjb21taXRCb3FNYXBwaW5nO1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tIFNlY3Rpb24gQ2xpcHBpbmcgUGxhbmVzIChPcGVuUHJvamVjdCBQYXJpdHkpIC0tLS0tLS0tLS0tLS0tLS1cclxuY29uc3QgY2xpcFBsYW5lWCA9IG5ldyBUSFJFRS5QbGFuZShuZXcgVEhSRUUuVmVjdG9yMygtMSwgMCwgMCksIDEwMDApO1xyXG5jb25zdCBjbGlwUGxhbmVZID0gbmV3IFRIUkVFLlBsYW5lKG5ldyBUSFJFRS5WZWN0b3IzKDAsIC0xLCAwKSwgMTAwMCk7XHJcbmNvbnN0IGNsaXBQbGFuZVogPSBuZXcgVEhSRUUuUGxhbmUobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgLTEpLCAxMDAwKTtcclxubGV0IGNsaXBwaW5nQWN0aXZlID0gZmFsc2U7XHJcblxyXG5mdW5jdGlvbiBpbml0U2VjdGlvbkNsaXBwaW5nKCkge1xyXG4gIGNvbnN0IGJ0blNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1zZWN0aW9uJyk7XHJcbiAgY29uc3QgcGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWNsaXBwaW5nLWNvbnRyb2xzJyk7XHJcbiAgaWYgKCFidG5TZWN0aW9uIHx8ICFwYW5lbCkgcmV0dXJuO1xyXG5cclxuICBidG5TZWN0aW9uLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICBjbGlwcGluZ0FjdGl2ZSA9ICFjbGlwcGluZ0FjdGl2ZTtcclxuICAgIHBhbmVsLnN0eWxlLmRpc3BsYXkgPSBjbGlwcGluZ0FjdGl2ZSA/ICdmbGV4JyA6ICdub25lJztcclxuICAgIGJ0blNlY3Rpb24uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJywgY2xpcHBpbmdBY3RpdmUpO1xyXG4gICAgcmVuZGVyZXIubG9jYWxDbGlwcGluZ0VuYWJsZWQgPSBjbGlwcGluZ0FjdGl2ZTtcclxuICAgIHVwZGF0ZUNsaXBwaW5nUGxhbmVzKCk7XHJcbiAgICBzZXRTdGF0dXMoYFNlY3Rpb24gY3V0czogJHtjbGlwcGluZ0FjdGl2ZSA/ICdFTkFCTEVEJyA6ICdESVNBQkxFRCd9YCk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2hrWCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwLXgtYWN0aXZlJyk7XHJcbiAgY29uc3Qgc2xkWCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwLXgtdmFsJyk7XHJcbiAgY29uc3QgY2hrWSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwLXktYWN0aXZlJyk7XHJcbiAgY29uc3Qgc2xkWSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwLXktdmFsJyk7XHJcbiAgY29uc3QgY2hrWiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwLXotYWN0aXZlJyk7XHJcbiAgY29uc3Qgc2xkWiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGlwLXotdmFsJyk7XHJcbiAgY29uc3QgYnRuUmVzZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsaXAtcmVzZXQnKTtcclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlQ2xpcHBpbmdQbGFuZXMoKSB7XHJcbiAgICBjb25zdCBwbGFuZXMgPSBbXTtcclxuICAgIGlmIChjaGtYICYmIGNoa1guY2hlY2tlZCkge1xyXG4gICAgICBjbGlwUGxhbmVYLmNvbnN0YW50ID0gcGFyc2VGbG9hdChzbGRYLnZhbHVlKTtcclxuICAgICAgcGxhbmVzLnB1c2goY2xpcFBsYW5lWCk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2hrWSAmJiBjaGtZLmNoZWNrZWQpIHtcclxuICAgICAgY2xpcFBsYW5lWS5jb25zdGFudCA9IHBhcnNlRmxvYXQoc2xkWS52YWx1ZSk7XHJcbiAgICAgIHBsYW5lcy5wdXNoKGNsaXBQbGFuZVkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNoa1ogJiYgY2hrWi5jaGVja2VkKSB7XHJcbiAgICAgIGNsaXBQbGFuZVouY29uc3RhbnQgPSBwYXJzZUZsb2F0KHNsZFoudmFsdWUpO1xyXG4gICAgICBwbGFuZXMucHVzaChjbGlwUGxhbmVaKTtcclxuICAgIH1cclxuICAgIHJlbmRlcmVyLmNsaXBwaW5nUGxhbmVzID0gcGxhbmVzO1xyXG4gIH1cclxuXHJcbiAgW2Noa1gsIHNsZFgsIGNoa1ksIHNsZFksIGNoa1osIHNsZFpdLmZvckVhY2goZWwgPT4ge1xyXG4gICAgaWYgKGVsKSBlbC5vbmlucHV0ID0gdXBkYXRlQ2xpcHBpbmdQbGFuZXM7XHJcbiAgfSk7XHJcblxyXG4gIGlmIChidG5SZXNldCkge1xyXG4gICAgYnRuUmVzZXQub25jbGljayA9ICgpID0+IHtcclxuICAgICAgaWYgKGNoa1gpIGNoa1guY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICBpZiAoY2hrWSkgY2hrWS5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgIGlmIChjaGtaKSBjaGtaLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKHNsZFgpIHNsZFgudmFsdWUgPSAwO1xyXG4gICAgICBpZiAoc2xkWSkgc2xkWS52YWx1ZSA9IDA7XHJcbiAgICAgIGlmIChzbGRaKSBzbGRaLnZhbHVlID0gMDtcclxuICAgICAgdXBkYXRlQ2xpcHBpbmdQbGFuZXMoKTtcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tIEluLVZpZXdlciBCQ0YgSXNzdWUgLyBEZWZlY3QgQ3JlYXRpb24gKE9wZW5Qcm9qZWN0IFBhcml0eSkgLS0tLS0tLS0tLS0tLS0tLVxyXG5mdW5jdGlvbiBpbml0SW5WaWV3ZXJJc3N1ZUNyZWF0aW9uKCkge1xyXG4gIGNvbnN0IGJ0bkNyZWF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLWNyZWF0ZS1pc3N1ZScpO1xyXG4gIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWNyZWF0ZS1pc3N1ZScpO1xyXG4gIGNvbnN0IGJ0bkNsb3NlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1pc3N1ZS1tb2RhbCcpO1xyXG4gIGNvbnN0IGJ0bkNhbmNlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2FuY2VsLWNyZWF0ZS1pc3N1ZScpO1xyXG4gIGNvbnN0IGJ0bkNvbmZpcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNvbmZpcm0tY3JlYXRlLWlzc3VlJyk7XHJcbiAgY29uc3QgaW1nUHJldmlldyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpc3N1ZS1zbmFwc2hvdC1wcmV2aWV3Jyk7XHJcbiAgbGV0IGN1cnJlbnRTbmFwc2hvdCA9ICcnO1xyXG5cclxuICBpZiAoYnRuQ3JlYXRlICYmIG1vZGFsKSB7XHJcbiAgICBidG5DcmVhdGUub25jbGljayA9ICgpID0+IHtcclxuICAgICAgY3VycmVudFNuYXBzaG90ID0gcmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xyXG4gICAgICBpZiAoaW1nUHJldmlldykgaW1nUHJldmlldy5zcmMgPSBjdXJyZW50U25hcHNob3Q7XHJcbiAgICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY2xvc2VNb2RhbCA9ICgpID0+IHsgaWYgKG1vZGFsKSBtb2RhbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyB9O1xyXG4gIGlmIChidG5DbG9zZSkgYnRuQ2xvc2Uub25jbGljayA9IGNsb3NlTW9kYWw7XHJcbiAgaWYgKGJ0bkNhbmNlbCkgYnRuQ2FuY2VsLm9uY2xpY2sgPSBjbG9zZU1vZGFsO1xyXG5cclxuICBpZiAoYnRuQ29uZmlybSkge1xyXG4gICAgYnRuQ29uZmlybS5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCB0aXRsZSA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaXNzdWUtbW9kYWwtdGl0bGUnKS52YWx1ZSB8fCAnJykudHJpbSgpO1xyXG4gICAgICBjb25zdCB0eXBlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lzc3VlLW1vZGFsLXR5cGUnKS52YWx1ZTtcclxuICAgICAgY29uc3QgcHJpb3JpdHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaXNzdWUtbW9kYWwtcHJpb3JpdHknKS52YWx1ZTtcclxuICAgICAgY29uc3QgZGVzYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpc3N1ZS1tb2RhbC1kZXNjJykudmFsdWU7XHJcblxyXG4gICAgICBpZiAoIXRpdGxlKSB7XHJcbiAgICAgICAgZnJhcHBlLm1zZ3ByaW50KF9fKCdQbGVhc2UgcHJvdmlkZSBhbiBpc3N1ZSB0aXRsZS4nKSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBidG5Db25maXJtLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgYnRuQ29uZmlybS50ZXh0Q29udGVudCA9ICdTYXZpbmdcdTIwMjYnO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGNhbURhdGEgPSB7XHJcbiAgICAgICAgICBwb3NpdGlvbjogeyB4OiBjYW1lcmEucG9zaXRpb24ueCwgeTogY2FtZXJhLnBvc2l0aW9uLnksIHo6IGNhbWVyYS5wb3NpdGlvbi56IH0sXHJcbiAgICAgICAgICB0YXJnZXQ6IHsgeDogY29udHJvbHMudGFyZ2V0LngsIHk6IGNvbnRyb2xzLnRhcmdldC55LCB6OiBjb250cm9scy50YXJnZXQueiB9LFxyXG4gICAgICAgICAgZm92OiBjYW1lcmEuZm92XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICAgICAgbWV0aG9kOiBBUEkuY3JlYXRlX2luX3ZpZXdlcl9pc3N1ZSxcclxuICAgICAgICAgIGFyZ3M6IHtcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICB0b3BpY190eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICBwcmlvcml0eTogcHJpb3JpdHksXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjLFxyXG4gICAgICAgICAgICBzbmFwc2hvdF9kYXRhOiBjdXJyZW50U25hcHNob3QsXHJcbiAgICAgICAgICAgIGNhbWVyYV9qc29uOiBKU09OLnN0cmluZ2lmeShjYW1EYXRhKSxcclxuICAgICAgICAgICAgZWxlbWVudF9ndWlkOiBjdXJyZW50U2VsZWN0aW9uID8gU3RyaW5nKGN1cnJlbnRTZWxlY3Rpb24uZXhwcmVzc0lEKSA6IG51bGxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnQkNGIElzc3VlIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5IScpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XHJcbiAgICAgICAgY2xvc2VNb2RhbCgpO1xyXG4gICAgICAgIHNldFN0YXR1cyhgQ3JlYXRlZCBJc3N1ZTogJHt0aXRsZX1gKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgaXNzdWU6JywgZSk7XHJcbiAgICAgICAgZnJhcHBlLm1zZ3ByaW50KF9fKCdFcnJvciBjcmVhdGluZyBpc3N1ZTogJyArIChlLm1lc3NhZ2UgfHwgZSkpKTtcclxuICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICBidG5Db25maXJtLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgYnRuQ29uZmlybS50ZXh0Q29udGVudCA9ICdDcmVhdGUgQkNGIElzc3VlJztcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gQm9vdCAtLS0tLS0tLS0tLS0tLS0tXHJcbmluaXREaXNjaXBsaW5lQ29udHJvbHMoKTtcclxuaW5pdFVpRXZlbnRzKCk7XHJcbmluaXRJbml0aWF0aW9uRXZlbnRzKCk7XHJcbmluaXRTZWN0aW9uQ2xpcHBpbmcoKTtcclxuaW5pdEluVmlld2VySXNzdWVDcmVhdGlvbigpO1xyXG5sb2FkTW9kZWxzTGlzdCgpLnRoZW4oKCkgPT4ge1xyXG4gIGhhbmRsZVJvdXRlUGFyYW1zKCk7XHJcbn0pO1xyXG5cclxud2luZG93LkJJTVZpZXdlckFwcCA9IHtcclxuICBsb2FkZWRNb2RlbHMsXHJcbiAgZWxlbWVudE1lc2hlcyxcclxuICBsb2FkTW9kZWxHZW9tZXRyeSxcclxuICB1bmxvYWRNb2RlbCxcclxuICBleGVjdXRlQ2xhc2hEZXRlY3Rpb24sXHJcbiAgZGV0ZWN0ZWRDbGFzaGVzLFxyXG4gIG9wZW5Cb21XaXphcmRNb2RhbCxcclxuICBjYWxjdWxhdGVBbmRSZW5kZXJCb21Sb2xsdXAsXHJcbiAgaGFuZGxlUm91dGVQYXJhbXMsXHJcbiAgc2V0QXBwTW9kZSxcclxuICBzZXRWaWV3cG9ydFRhYixcclxuICByZWZyZXNoSW5pdGlhdGlvblN0YXR1cyxcclxuICB1cGxvYWRJbnRha2VGaWxlLFxyXG4gIGF1dG9BbGlnbk1vZGVscyxcclxuICBhcHByb3ZlUHJvamVjdEtpY2tvZmYsXHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFHQSxJQUFNLFNBQVMsT0FBTztBQUN0QixJQUFNLFNBQVMsT0FBTztBQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVE7QUFDdEIsUUFBTSxJQUFJLE1BQU0sOEVBQThFO0FBQ2hHO0FBRUEsSUFBTSxRQUFRLE9BQU87QUFDckIsSUFBTSxn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
