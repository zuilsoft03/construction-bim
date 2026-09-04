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
  const projectParam = routeOpts.project || params.get("project");
  const modelParam = routeOpts.model || routeOpts.models || params.get("models") || params.get("model");
  const clashParam = routeOpts.clash || params.get("clash");
  const elemA = routeOpts.element_a || params.get("element_a");
  const elemB = routeOpts.element_b || params.get("element_b");
  if (projectParam) {
    activeProject = projectParam;
  }
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
var isAligningModels = false;
async function autoAlignModels() {
  if (isAligningModels) return;
  if (!detectedDriftModels.length) {
    frappe.msgprint(__("No models currently require coordinate alignment."));
    return;
  }
  isAligningModels = true;
  const btnFix = document.getElementById("btn-fix-alignment");
  if (btnFix) btnFix.disabled = true;
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
      let entry = loadedModels.get(drift.model);
      if (!entry) {
        entry = [...loadedModels.values()].find((e) => e.modelName === drift.model);
      }
      if (entry && entry.group) {
        entry.group.position.x += vec[0];
        entry.group.position.y += vec[1];
        entry.group.position.z += vec[2];
      }
    }
    frappe.show_alert({ message: "\u2705 Multi-discipline models auto-aligned to project origin", indicator: "green" });
    await refreshInitiationStatus();
    fitView();
  } catch (e) {
    frappe.msgprint({ title: __("Alignment Error"), message: e.message || e, indicator: "red" });
  } finally {
    isAligningModels = false;
    if (btnFix) btnFix.disabled = false;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL2JpbV92aWV3ZXJfYXBwLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBCSU0gVmlld2VyIEFwcCBcdTIwMTQgTXVsdGktRGlzY2lwbGluZSBGZWRlcmF0ZWQgVmlld2luZywgQlZIIENsYXNoIEVuZ2luZSwgJiBCT00gV2l6YXJkXHJcbi8vIFBvd2VyZWQgYnkgd2luZG93LklGQ0VuZ2luZSAoVGhyZWUuanMgcjE0OSArIHRocmVlLW1lc2gtYnZoICsgd2ViLWlmYykgYW5kIEZyYXBwZSBSRVNUIEFQSXNcclxuXHJcbmNvbnN0IEVOR0lORSA9IHdpbmRvdy5JRkNFbmdpbmU7XHJcbmNvbnN0IFdlYklGQyA9IHdpbmRvdy5XZWJJRkM7XHJcbmlmICghRU5HSU5FIHx8ICFXZWJJRkMpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0lGQ0VuZ2luZSBub3QgbG9hZGVkICh3ZWJpZmMtYXBpLWlpZmUuanMgKyB3ZWJpZmMuYnVuZGxlLmpzIG11c3QgbG9hZCBmaXJzdCknKTtcclxufVxyXG5cclxuY29uc3QgVEhSRUUgPSBFTkdJTkUuVEhSRUU7XHJcbmNvbnN0IE9yYml0Q29udHJvbHMgPSBFTkdJTkUuT3JiaXRDb250cm9scztcclxuY29uc3QgYnVpbGRJZmNTY2VuZSA9IEVOR0lORS5idWlsZElmY1NjZW5lO1xyXG5jb25zdCBkZXRlY3RDbGFzaGVzID0gRU5HSU5FLmRldGVjdENsYXNoZXM7XHJcbmNvbnN0IGdlbmVyYXRlQmNmVmlld3BvaW50ID0gRU5HSU5FLmdlbmVyYXRlQmNmVmlld3BvaW50O1xyXG5jb25zdCBjcmVhdGVDZW50cm9pZE1hcmtlciA9IEVOR0lORS5jcmVhdGVDZW50cm9pZE1hcmtlcjtcclxuY29uc3QgY3JlYXRlSW50ZXJzZWN0aW9uQm94SGVscGVyID0gRU5HSU5FLmNyZWF0ZUludGVyc2VjdGlvbkJveEhlbHBlcjtcclxuXHJcbi8vIEZyYXBwZSBBUEkgcm91dGVzXHJcbmNvbnN0IEFQSSA9IHtcclxuICBsaXN0X21vZGVsczogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X21vZGVscycsXHJcbiAgZ2V0X21vZGVsOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmdldF9tb2RlbCcsXHJcbiAgbGlzdF9lbGVtZW50czogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X2VsZW1lbnRzJyxcclxuICBnZXRfZWxlbWVudDogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5nZXRfZWxlbWVudCcsXHJcbiAgY3JlYXRlX21vZGVsOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmNyZWF0ZV9tb2RlbF9mcm9tX2lmYycsXHJcbiAgY3JlYXRlX2JvcV9saW5rOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmNyZWF0ZV9ib3FfbGluaycsXHJcbiAgZGVsZXRlX2JvcV9saW5rOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmRlbGV0ZV9ib3FfbGluaycsXHJcbiAgbGlzdF9ib3FfbGlua3M6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkubGlzdF9ib3FfbGlua3MnLFxyXG4gIHNhdmVfdmlld3BvaW50OiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLnNhdmVfdmlld3BvaW50JyxcclxuICBsaXN0X3ZpZXdwb2ludHM6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkubGlzdF92aWV3cG9pbnRzJyxcclxuICBkZWxldGVfdmlld3BvaW50OiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmRlbGV0ZV92aWV3cG9pbnQnLFxyXG4gIGNyZWF0ZV9jbGFzaDogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5jcmVhdGVfY2xhc2gnLFxyXG4gIGxpc3RfY2xhc2hlczogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5saXN0X2NsYXNoZXMnLFxyXG4gIGFkZF9jbGFzaF9jb21tZW50OiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmFkZF9jbGFzaF9jb21tZW50JyxcclxuICBsaXN0X2NsYXNoX2NvbW1lbnRzOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmxpc3RfY2xhc2hfY29tbWVudHMnLFxyXG4gIGdlbmVyYXRlX2JvbV9mcm9tX2JpbTogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5nZW5lcmF0ZV9ib21fZnJvbV9iaW0nLFxyXG4gIGdldF9pbml0aWF0aW9uX3N0YXR1czogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLmluaXRpYXRpb24uZ2V0X2luaXRpYXRpb25fc3RhdHVzJyxcclxuICB1cGxvYWRfaW50YWtlX2ZpbGU6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5pbml0aWF0aW9uLnVwbG9hZF9pbnRha2VfZmlsZScsXHJcbiAgcGFyc2VfYm9xX2ZpbGU6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5pbml0aWF0aW9uLnBhcnNlX2JvcV9maWxlJyxcclxuICBjb21taXRfYm9xX2VzdGltYXRlOiAnY29uc3RydWN0aW9uX2JpbS5hcGkuaW5pdGlhdGlvbi5jb21taXRfYm9xX2VzdGltYXRlJyxcclxuICBkb3dubG9hZF9ib3FfdGVtcGxhdGU6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5pbml0aWF0aW9uLmRvd25sb2FkX2JvcV90ZW1wbGF0ZScsXHJcbiAgYWxpZ25fbW9kZWxfY29vcmRpbmF0ZXM6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5pbml0aWF0aW9uLmFsaWduX21vZGVsX2Nvb3JkaW5hdGVzJyxcclxuICBhcHByb3ZlX3Byb2plY3RfaW5pdGlhdGlvbjogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLmluaXRpYXRpb24uYXBwcm92ZV9wcm9qZWN0X2luaXRpYXRpb24nLFxyXG4gIGNyZWF0ZV9pbl92aWV3ZXJfaXNzdWU6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuY3JlYXRlX2luX3ZpZXdlcl9pc3N1ZScsXHJcbn07XHJcblxyXG4vLyBET00gcmVmZXJlbmNlc1xyXG5jb25zdCBlbHMgPSB7XHJcbiAgbW9kZWxzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLW1vZGVscycpLFxyXG4gIGJ0bkxvYWRTZWxlY3RlZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1sb2FkLXNlbGVjdGVkJyksXHJcbiAgYnRuQ2xlYXJNb2RlbHM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xlYXItbW9kZWxzJyksXHJcbiAgdXBsb2FkOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLXVwbG9hZCcpLFxyXG4gIGZpbGVJbnB1dDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1maWxlLWlucHV0JyksXHJcbiAgY2FudmFzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWNhbnZhcycpLFxyXG4gIHN0YXR1czogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1zdGF0dXMnKSxcclxuICBsb2FkaW5nOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWxvYWRpbmcnKSxcclxuICBwcm9wczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1wcm9wcycpLFxyXG4gIHByb3BzVGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tZWxlbWVudC10aXRsZScpLFxyXG4gIGxpbmtzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWxpbmtzJyksXHJcbiAgdmlld3BvaW50czogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS12aWV3cG9pbnRzJyksXHJcbiAgdnBOYW1lOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndnAtbmFtZScpLFxyXG4gIGZEaXNjaXBsaW5lOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZi1kaXNjaXBsaW5lJyksXHJcbiAgZlN0b3JleTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Ytc3RvcmV5JyksXHJcbiAgZlR5cGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmLXR5cGUnKSxcclxuICBmU2VhcmNoOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZi1zZWFyY2gnKSxcclxuICBjbGFzaENhcmRzTGlzdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWNhcmRzLWxpc3QnKSxcclxuICBjbGFzaEJhZGdlQ291bnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1iYWRnZS1jb3VudCcpLFxyXG4gIGNsYXNoRGV0YWlsQ29udGFpbmVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtZGV0YWlsLWNvbnRhaW5lcicpLFxyXG4gIGNsYXNoTGlzdENvbnRhaW5lcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWxpc3QtY29udGFpbmVyJyksXHJcbiAgY2xhc2hDb21tZW50c1N0cmVhbTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWNvbW1lbnRzLXN0cmVhbScpLFxyXG4gIGNsYXNoQ29tbWVudElucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtY29tbWVudC1pbnB1dCcpLFxyXG4gIGJvbU1vZGFsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWJvbS1tb2RhbCcpLFxyXG4gIGJvbVJvbGx1cFRib2R5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9tLXJvbGx1cC10Ym9keScpLFxyXG4gIGJvbVN1bW1hcnlUZXh0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9tLXN1bW1hcnktdGV4dCcpLFxyXG59O1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBUaHJlZS5qcyBTY2VuZSBTZXR1cCAtLS0tLS0tLS0tLS0tLS0tXHJcbmNvbnN0IHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoeyBjYW52YXM6IGVscy5jYW52YXMsIGFudGlhbGlhczogdHJ1ZSwgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlIH0pO1xyXG5yZW5kZXJlci5zZXRQaXhlbFJhdGlvKE1hdGgubWluKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEsIDIpKTtcclxuY29uc3Qgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcclxuc2NlbmUuYmFja2dyb3VuZCA9IG5ldyBUSFJFRS5Db2xvcigweDBmMTcyYSk7IC8vIFNsYXRlLTkwMCBkYXJrIHRoZW1lXHJcblxyXG5jb25zdCBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNTUsIDEsIDAuMSwgNTAwMCk7XHJcbmNhbWVyYS5wb3NpdGlvbi5zZXQoMjUsIDIwLCAzMCk7XHJcbmNvbnN0IGNvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHMoY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50KTtcclxuY29udHJvbHMuZW5hYmxlRGFtcGluZyA9IHRydWU7XHJcbmNvbnRyb2xzLmRhbXBpbmdGYWN0b3IgPSAwLjA4O1xyXG5cclxuc2NlbmUuYWRkKG5ldyBUSFJFRS5IZW1pc3BoZXJlTGlnaHQoMHhmZmZmZmYsIDB4MzM0MTU1LCAxLjIpKTtcclxuY29uc3Qga2V5TGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMS4zKTtcclxua2V5TGlnaHQucG9zaXRpb24uc2V0KDQwLCA2MCwgMzApO1xyXG5zY2VuZS5hZGQoa2V5TGlnaHQpO1xyXG5jb25zdCBmaWxsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweDk0YTNiOCwgMC42KTtcclxuZmlsbExpZ2h0LnBvc2l0aW9uLnNldCgtMzAsIDIwLCAtMzApO1xyXG5zY2VuZS5hZGQoZmlsbExpZ2h0KTtcclxuXHJcbmNvbnN0IGdyaWQgPSBuZXcgVEhSRUUuR3JpZEhlbHBlcigxMjAsIDI0LCAweDQ3NTU2OSwgMHgxZTI5M2IpO1xyXG5ncmlkLnBvc2l0aW9uLnkgPSAtMC4wMjtcclxuc2NlbmUuYWRkKGdyaWQpO1xyXG5cclxuLy8gRmVkZXJhdGVkIFJvb3QgR3JvdXBcclxuY29uc3QgZmVkZXJhdGVkR3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcclxuZmVkZXJhdGVkR3JvdXAubmFtZSA9ICdGZWRlcmF0ZWRSb290R3JvdXAnO1xyXG5zY2VuZS5hZGQoZmVkZXJhdGVkR3JvdXApO1xyXG5cclxuLy8gQWN0aXZlIENsYXNoIFZpc3VhbCBIZWxwZXJzIEdyb3VwXHJcbmNvbnN0IGNsYXNoSGVscGVyc0dyb3VwID0gbmV3IFRIUkVFLkdyb3VwKCk7XHJcbmNsYXNoSGVscGVyc0dyb3VwLm5hbWUgPSAnQ2xhc2hIZWxwZXJzR3JvdXAnO1xyXG5zY2VuZS5hZGQoY2xhc2hIZWxwZXJzR3JvdXApO1xyXG5cclxuLy8gU3RhdGVcclxubGV0IGxvYWRlZE1vZGVscyA9IG5ldyBNYXAoKTtcclxubGV0IGVsZW1lbnRNZXNoZXMgPSBbXTtcclxubGV0IGVsZW1lbnRJbmRleCA9IG5ldyBNYXAoKTtcclxubGV0IGF2YWlsYWJsZU1vZGVscyA9IFtdO1xyXG5sZXQgY3VycmVudFNlbGVjdGlvbiA9IG51bGw7XHJcbmxldCBhY3RpdmVUb29sID0gJ29yYml0JztcclxubGV0IGNsaXBCb3ggPSBudWxsO1xyXG5sZXQgd2lyZWZyYW1lTW9kZSA9IGZhbHNlO1xyXG5sZXQgaWZjQXBpID0gbnVsbDtcclxubGV0IGRldGVjdGVkQ2xhc2hlcyA9IFtdO1xyXG5sZXQgYWN0aXZlQ2xhc2ggPSBudWxsO1xyXG5cclxuLy8gSGlnaGxpZ2h0IE1hdGVyaWFsc1xyXG5jb25zdCBoaWdobGlnaHRNYXQgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoeyBjb2xvcjogMHgzOGJkZjgsIGVtaXNzaXZlOiAweDAzNjlhMSwgZW1pc3NpdmVJbnRlbnNpdHk6IDAuNSB9KTtcclxuY29uc3QgY2xhc2hNYXRBID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHsgY29sb3I6IDB4ZWY0NDQ0LCBlbWlzc2l2ZTogMHg3ZjFkMWQsIGVtaXNzaXZlSW50ZW5zaXR5OiAwLjYsIHJvdWdobmVzczogMC4zIH0pO1xyXG5jb25zdCBjbGFzaE1hdEIgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoeyBjb2xvcjogMHhlYWIzMDgsIGVtaXNzaXZlOiAweDcxM2YxMiwgZW1pc3NpdmVJbnRlbnNpdHk6IDAuNiwgcm91Z2huZXNzOiAwLjMgfSk7XHJcblxyXG5mdW5jdGlvbiByZXNpemUoKSB7XHJcbiAgY29uc3QgdyA9IGVscy5jYW52YXMgPyAoZWxzLmNhbnZhcy5jbGllbnRXaWR0aCB8fCA4MDApIDogODAwO1xyXG4gIGNvbnN0IGggPSBlbHMuY2FudmFzID8gKGVscy5jYW52YXMuY2xpZW50SGVpZ2h0IHx8IDYwMCkgOiA2MDA7XHJcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3LCBoLCBmYWxzZSk7XHJcbiAgY2FtZXJhLmFzcGVjdCA9IHcgLyBoO1xyXG4gIGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XHJcbn1cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSk7XHJcbnJlc2l6ZSgpO1xyXG5cclxuaWYgKHdpbmRvdy5fYmltVmlld2VyQW5pbUlkKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUod2luZG93Ll9iaW1WaWV3ZXJBbmltSWQpO1xyXG4gIHdpbmRvdy5fYmltVmlld2VyQW5pbUlkID0gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICB3aW5kb3cuX2JpbVZpZXdlckFuaW1JZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcclxuICBjb250cm9scy51cGRhdGUoKTtcclxuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbn1cclxuYW5pbWF0ZSgpO1xyXG5cclxuZnVuY3Rpb24gc2V0U3RhdHVzKG1zZykgeyBpZiAoZWxzLnN0YXR1cykgZWxzLnN0YXR1cy50ZXh0Q29udGVudCA9IG1zZzsgfVxyXG5mdW5jdGlvbiBzaG93TG9hZGluZyhtc2csIG9uKSB7XHJcbiAgaWYgKGVscy5sb2FkaW5nKSB7XHJcbiAgICBlbHMubG9hZGluZy5zdHlsZS5kaXNwbGF5ID0gb24gPyAnZmxleCcgOiAnbm9uZSc7XHJcbiAgICBpZiAob24pIGVscy5sb2FkaW5nLnRleHRDb250ZW50ID0gbXNnO1xyXG4gIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBXZWItSUZDIEFQSSAtLS0tLS0tLS0tLS0tLS0tXHJcbmFzeW5jIGZ1bmN0aW9uIGdldElmY0FwaSgpIHtcclxuICBpZiAoaWZjQXBpKSByZXR1cm4gaWZjQXBpO1xyXG4gIGNvbnN0IGFwaSA9IG5ldyBXZWJJRkMuSWZjQVBJKCk7XHJcbiAgYXBpLlNldFdhc21QYXRoKCcvYXNzZXRzL2NvbnN0cnVjdGlvbl9iaW0vanMvd2ViaWZjLycsIHRydWUpO1xyXG4gIGF3YWl0IGFwaS5Jbml0KCk7XHJcbiAgaWZjQXBpID0gYXBpO1xyXG4gIHJldHVybiBhcGk7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gTW9kZWwgTWFuYWdlbWVudCAmIEZlZGVyYXRlZCBMb2FkaW5nIC0tLS0tLS0tLS0tLS0tLS1cclxuYXN5bmMgZnVuY3Rpb24gbG9hZE1vZGVsc0xpc3QoKSB7XHJcbiAgc2V0U3RhdHVzKCdMb2FkaW5nIG1vZGVsc1x1MjAyNicpO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7IG1ldGhvZDogQVBJLmxpc3RfbW9kZWxzIH0pO1xyXG4gICAgYXZhaWxhYmxlTW9kZWxzID0gcmVzLm1lc3NhZ2UgfHwgW107XHJcbiAgICByZW5kZXJNb2RlbHNMaXN0KCk7XHJcbiAgICBpZiAoYXZhaWxhYmxlTW9kZWxzLmxlbmd0aCkge1xyXG4gICAgICBzZXRTdGF0dXMoYCR7YXZhaWxhYmxlTW9kZWxzLmxlbmd0aH0gbW9kZWxzIGF2YWlsYWJsZWApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0U3RhdHVzKCdObyBtb2RlbHMgZm91bmQuIFVwbG9hZCBhbiBJRkMgZmlsZSB0byBiZWdpbi4nKTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBzZXRTdGF0dXMoJ0ZhaWxlZCB0byBsb2FkIG1vZGVscyBsaXN0OiAnICsgKGUubWVzc2FnZSB8fCBlKSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJNb2RlbHNMaXN0KCkge1xyXG4gIGlmICghZWxzLm1vZGVscykgcmV0dXJuO1xyXG4gIGVscy5tb2RlbHMuaW5uZXJIVE1MID0gJyc7XHJcbiAgaWYgKCFhdmFpbGFibGVNb2RlbHMubGVuZ3RoKSB7XHJcbiAgICBlbHMubW9kZWxzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIG1vZGVscyB5ZXQ8L2Rpdj4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgYXZhaWxhYmxlTW9kZWxzLmZvckVhY2gobSA9PiB7XHJcbiAgICBjb25zdCBpc0xvYWRlZCA9IGxvYWRlZE1vZGVscy5oYXMobS5uYW1lKTtcclxuICAgIGNvbnN0IGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGQuY2xhc3NOYW1lID0gJ2JpbS1tb2RlbC1pdGVtJyArIChpc0xvYWRlZCA/ICcgYWN0aXZlJyA6ICcnKTtcclxuICAgIFxyXG4gICAgLy8gQXV0by1kZXRlY3QgZGlzY2lwbGluZSB0YWdcclxuICAgIGxldCBkaXNjID0gbS5kaXNjaXBsaW5lIHx8ICdBcmNoaXRlY3R1cmUnO1xyXG4gICAgY29uc3QgbmFtZUxvd2VyID0gKG0ubW9kZWxfbmFtZSB8fCBtLm5hbWUpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnc3RyJykpIGRpc2MgPSAnU3RydWN0dXJhbCc7XHJcbiAgICBlbHNlIGlmIChuYW1lTG93ZXIuaW5jbHVkZXMoJ2h2YWMnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ21lcCcpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygndnZzJykpIGRpc2MgPSAnTUVQJztcclxuXHJcbiAgICBkLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cIm1vZGVsLXRpdGxlXCIgdGl0bGU9XCIke20ubW9kZWxfbmFtZX1cIj5cclxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJtb2RlbC1jaGVja1wiICR7aXNMb2FkZWQgPyAnY2hlY2tlZCcgOiAnJ30gc3R5bGU9XCJtYXJnaW4tcmlnaHQ6NHB4XCIgLz5cclxuICAgICAgICA8c3Bhbj4ke20ubW9kZWxfbmFtZX08L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NHB4XCI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgbW9kZWwtYmFkZ2VcIj4ke2Rpc2N9PC9zcGFuPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPVwiY250XCI+JHttLmVsZW1lbnRfY291bnQgfHwgMH0gZWw8L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICBjb25zdCBjaGVja2JveCA9IGQucXVlcnlTZWxlY3RvcignLm1vZGVsLWNoZWNrJyk7XHJcbiAgICBjaGVja2JveC5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgdG9nZ2xlTW9kZWwobS5uYW1lKTtcclxuICAgIH07XHJcblxyXG4gICAgZC5vbmNsaWNrID0gKCkgPT4gdG9nZ2xlTW9kZWwobS5uYW1lKTtcclxuICAgIGVscy5tb2RlbHMuYXBwZW5kQ2hpbGQoZCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZU1vZGVsKG1vZGVsRG9jTmFtZSkge1xyXG4gIGlmIChsb2FkZWRNb2RlbHMuaGFzKG1vZGVsRG9jTmFtZSkpIHtcclxuICAgIHVubG9hZE1vZGVsKG1vZGVsRG9jTmFtZSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGF3YWl0IGxvYWRNb2RlbEdlb21ldHJ5KG1vZGVsRG9jTmFtZSk7XHJcbiAgfVxyXG4gIHJlbmRlck1vZGVsc0xpc3QoKTtcclxuICB1cGRhdGVFbGVtZW50TWVzaGVzTGlzdCgpO1xyXG4gIHBvcHVsYXRlRmFjZXRzKCk7XHJcbiAgZml0VmlldygpO1xyXG59XHJcblxyXG5jb25zdCBpbkZsaWdodExvYWRzID0gbmV3IE1hcCgpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZE1vZGVsR2VvbWV0cnkobW9kZWxEb2NOYW1lKSB7XHJcbiAgaWYgKGxvYWRlZE1vZGVscy5oYXMobW9kZWxEb2NOYW1lKSkge1xyXG4gICAgcmV0dXJuIGxvYWRlZE1vZGVscy5nZXQobW9kZWxEb2NOYW1lKTtcclxuICB9XHJcbiAgaWYgKGluRmxpZ2h0TG9hZHMuaGFzKG1vZGVsRG9jTmFtZSkpIHtcclxuICAgIHJldHVybiBpbkZsaWdodExvYWRzLmdldChtb2RlbERvY05hbWUpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XHJcbiAgICBzaG93TG9hZGluZyhgTG9hZGluZyBtb2RlbCAke21vZGVsRG9jTmFtZX1cdTIwMjZgLCB0cnVlKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHsgbWV0aG9kOiBBUEkuZ2V0X21vZGVsLCBhcmdzOiB7IG1vZGVsOiBtb2RlbERvY05hbWUgfSB9KTtcclxuICAgICAgY29uc3QgbW9kZWxEYXRhID0gcmVzLm1lc3NhZ2U7XHJcbiAgICAgIGNvbnN0IGlmY1VybCA9IG1vZGVsRGF0YS5vcmlnaW5hbF9maWxlO1xyXG4gICAgICBpZiAoIWlmY1VybCkge1xyXG4gICAgICAgIHNldFN0YXR1cyhgTW9kZWwgJHttb2RlbERhdGEubW9kZWxfbmFtZX0gaGFzIG5vIGF0dGFjaGVkIElGQyBmaWxlYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhYnNVcmwgPSBpZmNVcmwuc3RhcnRzV2l0aCgnLycpID8gaWZjVXJsIDogJy8nICsgaWZjVXJsO1xyXG4gICAgICBzaG93TG9hZGluZyhgRG93bmxvYWRpbmcgSUZDICgke21vZGVsRGF0YS5tb2RlbF9uYW1lfSlcdTIwMjZgLCB0cnVlKTtcclxuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGFic1VybCk7XHJcbiAgICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKGBIVFRQICR7cmVzcC5zdGF0dXN9IGZldGNoaW5nIElGQ2ApO1xyXG5cclxuICAgICAgY29uc3QgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcC5hcnJheUJ1ZmZlcigpKTtcclxuICAgICAgc2hvd0xvYWRpbmcoYFBhcnNpbmcgSUZDICgkeyhidWYubGVuZ3RoIC8gMWU2KS50b0ZpeGVkKDEpfSBNQilcdTIwMjZgLCB0cnVlKTtcclxuXHJcbiAgICAgIGNvbnN0IGFwaSA9IGF3YWl0IGdldElmY0FwaSgpO1xyXG4gICAgICAvLyBDT09SRElOQVRFX1RPX09SSUdJTjogZmFsc2UgZW5zdXJlcyBhbGwgZGlzY2lwbGluZXMgc2hhcmUgd29ybGQgY29vcmRpbmF0ZXMgd2l0aCAwIGRyaWZ0IVxyXG4gICAgICBjb25zdCBpZmNNb2RlbElEID0gYXBpLk9wZW5Nb2RlbChidWYsIHsgQ09PUkRJTkFURV9UT19PUklHSU46IGZhbHNlLCBVU0VfRkFTVF9CVkg6IHRydWUgfSk7XHJcblxyXG4gICAgICBsZXQgZGlzYyA9IG1vZGVsRGF0YS5kaXNjaXBsaW5lIHx8ICdBcmNoaXRlY3R1cmUnO1xyXG4gICAgICBjb25zdCBuYW1lTG93ZXIgPSAobW9kZWxEYXRhLm1vZGVsX25hbWUgfHwgbW9kZWxEb2NOYW1lKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnc3RyJykpIGRpc2MgPSAnU3RydWN0dXJhbCc7XHJcbiAgICAgIGVsc2UgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnaHZhYycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnbWVwJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCd2dnMnKSkgZGlzYyA9ICdNRVAnO1xyXG5cclxuICAgICAgc2hvd0xvYWRpbmcoYEJ1aWxkaW5nIDNEIHNjZW5lICgke2Rpc2N9KVx1MjAyNmAsIHRydWUpO1xyXG4gICAgICBjb25zdCBzY2VuZVJlc3VsdCA9IGJ1aWxkSWZjU2NlbmUoYXBpLCBpZmNNb2RlbElELCB7XHJcbiAgICAgICAgbW9kZWxOYW1lOiBtb2RlbERhdGEubW9kZWxfbmFtZSB8fCBtb2RlbERvY05hbWUsXHJcbiAgICAgICAgZGlzY2lwbGluZTogZGlzYyxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmZWRlcmF0ZWRHcm91cC5hZGQoc2NlbmVSZXN1bHQuZ3JvdXApO1xyXG5cclxuICAgICAgLy8gTG9hZCBzZXJ2ZXIgZWxlbWVudHMgZm9yIHByb3BlcnR5IGxpbmtpbmdcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBlbGVtUmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICAgICAgbWV0aG9kOiBBUEkubGlzdF9lbGVtZW50cyxcclxuICAgICAgICAgIGFyZ3M6IHsgbW9kZWw6IG1vZGVsRG9jTmFtZSwgZmlsdGVyczogJ3t9JywgbGltaXQ6IDI1MDAwIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSAoZWxlbVJlcy5tZXNzYWdlICYmIGVsZW1SZXMubWVzc2FnZS5lbGVtZW50cykgfHwgW107XHJcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBjbGVhblJlZiA9IChlbC5tZXNoX3JlZiB8fCAnJykucmVwbGFjZSgnZScsICcnKTtcclxuICAgICAgICAgIGlmIChjbGVhblJlZikgZWxlbWVudEluZGV4LnNldChgJHttb2RlbERvY05hbWV9OiR7Y2xlYW5SZWZ9YCwgZWwpO1xyXG4gICAgICAgICAgaWYgKGVsLnN0YWJsZV9pZCkgZWxlbWVudEluZGV4LnNldChlbC5zdGFibGVfaWQsIGVsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBjYXRjaCAoZSkge31cclxuXHJcbiAgICAgIGNvbnN0IGVudHJ5ID0ge1xyXG4gICAgICAgIG1vZGVsRG9jTmFtZSxcclxuICAgICAgICBtb2RlbE5hbWU6IG1vZGVsRGF0YS5tb2RlbF9uYW1lIHx8IG1vZGVsRG9jTmFtZSxcclxuICAgICAgICBkaXNjaXBsaW5lOiBkaXNjLFxyXG4gICAgICAgIGlmY01vZGVsSUQsXHJcbiAgICAgICAgZ3JvdXA6IHNjZW5lUmVzdWx0Lmdyb3VwLFxyXG4gICAgICAgIGV4cHJlc3NNYXA6IHNjZW5lUmVzdWx0LmV4cHJlc3NNYXAsXHJcbiAgICAgICAgbWVzaENvdW50OiBzY2VuZVJlc3VsdC5tZXNoQ291bnQsXHJcbiAgICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICAgIGlzR2hvc3RlZDogZmFsc2UsXHJcbiAgICAgICAgb3BhY2l0eTogMS4wLFxyXG4gICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgIH07XHJcbiAgICAgIGxvYWRlZE1vZGVscy5zZXQobW9kZWxEb2NOYW1lLCBlbnRyeSk7XHJcblxyXG4gICAgICBzZXRTdGF0dXMoYExvYWRlZCAke21vZGVsRGF0YS5tb2RlbF9uYW1lfSBbJHtkaXNjfV06ICR7c2NlbmVSZXN1bHQubWVzaENvdW50LnRvdGFsfSBtZXNoZXMsICR7c2NlbmVSZXN1bHQubWVzaENvdW50LnRyaXN9IHRyaXNgKTtcclxuICAgICAgcmV0dXJuIGVudHJ5O1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBtb2RlbCBnZW9tZXRyeScsIGUpO1xyXG4gICAgICBzZXRTdGF0dXMoYEVycm9yIGxvYWRpbmcgJHttb2RlbERvY05hbWV9OiAke2UubWVzc2FnZSB8fCBlfWApO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICAgICAgaW5GbGlnaHRMb2Fkcy5kZWxldGUobW9kZWxEb2NOYW1lKTtcclxuICAgIH1cclxuICB9KSgpO1xyXG5cclxuICBpbkZsaWdodExvYWRzLnNldChtb2RlbERvY05hbWUsIHByb21pc2UpO1xyXG4gIHJldHVybiBwcm9taXNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bmxvYWRNb2RlbChtb2RlbERvY05hbWUpIHtcclxuICBjb25zdCBtb2RlbEVudHJ5ID0gbG9hZGVkTW9kZWxzLmdldChtb2RlbERvY05hbWUpO1xyXG4gIGlmICghbW9kZWxFbnRyeSkgcmV0dXJuO1xyXG5cclxuICBpZiAoaWZjQXBpICYmIG1vZGVsRW50cnkuaWZjTW9kZWxJRCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0cnkgeyBpZmNBcGkuQ2xvc2VNb2RlbChtb2RlbEVudHJ5LmlmY01vZGVsSUQpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUud2FybignQ291bGQgbm90IGNsb3NlIElGQyBtb2RlbDonLCBlKTsgfVxyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlIGFsbCBlbGVtZW50SW5kZXggZW50cmllcyBiZWxvbmdpbmcgdG8gdGhpcyBtb2RlbFxyXG4gIGZvciAoY29uc3QgW2tleSwgdmFsXSBvZiBlbGVtZW50SW5kZXguZW50cmllcygpKSB7XHJcbiAgICBpZiAodmFsLm1vZGVsRG9jTmFtZSA9PT0gbW9kZWxEb2NOYW1lIHx8IGtleS5zdGFydHNXaXRoKGAke21vZGVsRG9jTmFtZX06YCkpIHtcclxuICAgICAgZWxlbWVudEluZGV4LmRlbGV0ZShrZXkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZmVkZXJhdGVkR3JvdXAucmVtb3ZlKG1vZGVsRW50cnkuZ3JvdXApO1xyXG4gIGRpc3Bvc2VHcm91cChtb2RlbEVudHJ5Lmdyb3VwKTtcclxuICBsb2FkZWRNb2RlbHMuZGVsZXRlKG1vZGVsRG9jTmFtZSk7XHJcbiAgdXBkYXRlRWxlbWVudE1lc2hlc0xpc3QoKTtcclxuICByZW5kZXJNb2RlbHNMaXN0KCk7XHJcbiAgc2V0U3RhdHVzKGBVbmxvYWRlZCAke21vZGVsRW50cnkubW9kZWxOYW1lfWApO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1bmxvYWRBbGxNb2RlbHMoKSB7XHJcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goKGVudHJ5KSA9PiB7XHJcbiAgICBpZiAoaWZjQXBpICYmIGVudHJ5LmlmY01vZGVsSUQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB0cnkgeyBpZmNBcGkuQ2xvc2VNb2RlbChlbnRyeS5pZmNNb2RlbElEKTsgfSBjYXRjaCAoZSkge31cclxuICAgIH1cclxuICAgIGZlZGVyYXRlZEdyb3VwLnJlbW92ZShlbnRyeS5ncm91cCk7XHJcbiAgICBkaXNwb3NlR3JvdXAoZW50cnkuZ3JvdXApO1xyXG4gIH0pO1xyXG4gIGxvYWRlZE1vZGVscy5jbGVhcigpO1xyXG4gIGVsZW1lbnRJbmRleC5jbGVhcigpO1xyXG4gIGVsZW1lbnRNZXNoZXMgPSBbXTtcclxuICBjbGFzaEhlbHBlcnNHcm91cC5jbGVhcigpO1xyXG4gIGNsZWFyU2VsZWN0aW9uKCk7XHJcbiAgcmVuZGVyTW9kZWxzTGlzdCgpO1xyXG4gIHNldFN0YXR1cygnQWxsIG1vZGVscyBjbGVhcmVkJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCkge1xyXG4gIGVsZW1lbnRNZXNoZXMgPSBbXTtcclxuICBsb2FkZWRNb2RlbHMuZm9yRWFjaCgoZW50cnksIG1vZGVsRG9jTmFtZSkgPT4ge1xyXG4gICAgZW50cnkuZXhwcmVzc01hcC5mb3JFYWNoKChtZXNoZXMsIGV4cHJlc3NJRCkgPT4ge1xyXG4gICAgICBtZXNoZXMuZm9yRWFjaChtID0+IHtcclxuICAgICAgICBtLnVzZXJEYXRhLm1vZGVsRG9jTmFtZSA9IG1vZGVsRG9jTmFtZTtcclxuICAgICAgICBtLnVzZXJEYXRhLmRpc2NpcGxpbmUgPSBlbnRyeS5kaXNjaXBsaW5lO1xyXG4gICAgICAgIGVsZW1lbnRNZXNoZXMucHVzaCh7IG1lc2g6IG0sIGV4cHJlc3NJRCwgbW9kZWxEb2NOYW1lLCBkaXNjaXBsaW5lOiBlbnRyeS5kaXNjaXBsaW5lIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG4gIHJlbmRlclNwYXRpYWxIaWVyYXJjaHlUcmVlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlclNwYXRpYWxIaWVyYXJjaHlUcmVlKCkge1xyXG4gIGNvbnN0IHRyZWVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tc3BhdGlhbC10cmVlJyk7XHJcbiAgaWYgKCF0cmVlRWwpIHJldHVybjtcclxuICBpZiAoIWxvYWRlZE1vZGVscy5zaXplKSB7XHJcbiAgICB0cmVlRWwuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+TG9hZCBtb2RlbHMgdG8gdmlldyBzcGF0aWFsIGhpZXJhcmNoeTwvZGl2Pic7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0cmVlRWwuaW5uZXJIVE1MID0gJyc7XHJcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goKGVudHJ5LCBtb2RlbERvY05hbWUpID0+IHtcclxuICAgIGNvbnN0IG1vZGVsTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgbW9kZWxOb2RlLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICc2cHgnO1xyXG5cclxuICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgaGVhZGVyLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICBoZWFkZXIuc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xyXG4gICAgaGVhZGVyLnN0eWxlLmdhcCA9ICc2cHgnO1xyXG4gICAgaGVhZGVyLnN0eWxlLmZvbnRXZWlnaHQgPSAnNjAwJztcclxuICAgIGhlYWRlci5zdHlsZS5jb2xvciA9ICcjZTJlOGYwJztcclxuXHJcbiAgICBjb25zdCBjaGsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgY2hrLnR5cGUgPSAnY2hlY2tib3gnO1xyXG4gICAgY2hrLmNoZWNrZWQgPSBlbnRyeS52aXNpYmxlICE9PSBmYWxzZTtcclxuICAgIGNoay5vbmNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgZW50cnkudmlzaWJsZSA9IGNoay5jaGVja2VkO1xyXG4gICAgICBlbnRyeS5ncm91cC52aXNpYmxlID0gY2hrLmNoZWNrZWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIGhlYWRlci5hcHBlbmRDaGlsZChjaGspO1xyXG4gICAgaGVhZGVyLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGBcdUQ4M0NcdURGRTIgJHtlbnRyeS5tb2RlbE5hbWV9IFske2VudHJ5LmRpc2NpcGxpbmV9XWApKTtcclxuICAgIG1vZGVsTm9kZS5hcHBlbmRDaGlsZChoZWFkZXIpO1xyXG5cclxuICAgIGNvbnN0IHN0b3JleU1hcCA9IG5ldyBNYXAoKTtcclxuICAgIChlbnRyeS5lbGVtZW50cyB8fCBbXSkuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgIGNvbnN0IHN0ID0gZWwuc3RvcmV5IHx8ICdHcm91bmQgTGV2ZWwnO1xyXG4gICAgICBpZiAoIXN0b3JleU1hcC5oYXMoc3QpKSBzdG9yZXlNYXAuc2V0KHN0LCBbXSk7XHJcbiAgICAgIHN0b3JleU1hcC5nZXQoc3QpLnB1c2goZWwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFzdG9yZXlNYXAuc2l6ZSkgc3RvcmV5TWFwLnNldCgnTGV2ZWwgMScsIFtdKTtcclxuXHJcbiAgICBjb25zdCBjaGlsZENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY2hpbGRDb250YWluZXIuc3R5bGUucGFkZGluZ0xlZnQgPSAnMThweCc7XHJcbiAgICBjaGlsZENvbnRhaW5lci5zdHlsZS5tYXJnaW5Ub3AgPSAnM3B4JztcclxuXHJcbiAgICBzdG9yZXlNYXAuZm9yRWFjaCgoZWxlbXMsIHN0b3JleU5hbWUpID0+IHtcclxuICAgICAgY29uc3Qgc3ROb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIHN0Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xyXG4gICAgICBzdE5vZGUuc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xyXG4gICAgICBzdE5vZGUuc3R5bGUuZ2FwID0gJzRweCc7XHJcbiAgICAgIHN0Tm9kZS5zdHlsZS5jb2xvciA9ICcjOTRhM2I4JztcclxuXHJcbiAgICAgIGNvbnN0IHN0Q2hrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgc3RDaGsudHlwZSA9ICdjaGVja2JveCc7XHJcbiAgICAgIHN0Q2hrLmNoZWNrZWQgPSB0cnVlO1xyXG4gICAgICBzdENoay5vbmNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICBlbGVtZW50TWVzaGVzLmZvckVhY2goKHsgbWVzaCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWU6IG1OYW1lIH0pID0+IHtcclxuICAgICAgICAgIGlmIChtTmFtZSA9PT0gbW9kZWxEb2NOYW1lKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZWxlbWVudEluZGV4LmdldChgJHttTmFtZX06JHtleHByZXNzSUR9YCk7XHJcbiAgICAgICAgICAgIGlmIChlbCAmJiAoZWwuc3RvcmV5IHx8ICdMZXZlbCAxJykgPT09IHN0b3JleU5hbWUpIHtcclxuICAgICAgICAgICAgICBtZXNoLnZpc2libGUgPSBzdENoay5jaGVja2VkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzdE5vZGUuYXBwZW5kQ2hpbGQoc3RDaGspO1xyXG4gICAgICBzdE5vZGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYFx1RDgzRFx1RENEMCAke3N0b3JleU5hbWV9YCkpO1xyXG4gICAgICBjaGlsZENvbnRhaW5lci5hcHBlbmRDaGlsZChzdE5vZGUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgbW9kZWxOb2RlLmFwcGVuZENoaWxkKGNoaWxkQ29udGFpbmVyKTtcclxuICAgIHRyZWVFbC5hcHBlbmRDaGlsZChtb2RlbE5vZGUpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaXNwb3NlR3JvdXAoZ3JvdXApIHtcclxuICBncm91cC50cmF2ZXJzZShvID0+IHtcclxuICAgIGlmIChvLmlzTWVzaCkge1xyXG4gICAgICBpZiAoby5nZW9tZXRyeSkgby5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgIGlmIChvLm1hdGVyaWFsKSB7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoby5tYXRlcmlhbCkpIG8ubWF0ZXJpYWwuZm9yRWFjaChtID0+IG0uZGlzcG9zZSgpKTtcclxuICAgICAgICBlbHNlIG8ubWF0ZXJpYWwuZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gRGlzY2lwbGluZSBMYXllciBDb250cm9scyAoVmlzaWJpbGl0eSwgR2hvc3RpbmcsIE9wYWNpdHkpIC0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gaW5pdERpc2NpcGxpbmVDb250cm9scygpIHtcclxuICBjb25zdCByb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRpc2NpcGxpbmUtbGF5ZXItcm93Jyk7XHJcbiAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XHJcbiAgICBjb25zdCBkaXNjID0gcm93LmRhdGFzZXQuZGlzY2lwbGluZTtcclxuICAgIGNvbnN0IGJ0blZpcyA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuYnRuLXZpcycpO1xyXG4gICAgY29uc3QgYnRuR2hvc3QgPSByb3cucXVlcnlTZWxlY3RvcignLmJ0bi1naG9zdCcpO1xyXG4gICAgY29uc3QgYnRuU29sbyA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuYnRuLXNvbG8nKTtcclxuICAgIGNvbnN0IHNsaWRlciA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGlzYy1vcGFjaXR5LXNsaWRlcicpO1xyXG4gICAgY29uc3QgdmFsVGV4dCA9IHJvdy5xdWVyeVNlbGVjdG9yKCcuZGlzYy1vcGFjaXR5LXZhbCcpO1xyXG5cclxuICAgIGlmIChidG5WaXMpIHtcclxuICAgICAgYnRuVmlzLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNDdXJyZW50bHlWaXMgPSBidG5WaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKTtcclxuICAgICAgICBzZXREaXNjaXBsaW5lVmlzaWJpbGl0eShkaXNjLCAhaXNDdXJyZW50bHlWaXMpO1xyXG4gICAgICAgIGJ0blZpcy5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCAhaXNDdXJyZW50bHlWaXMpO1xyXG4gICAgICAgIGJ0blZpcy50ZXh0Q29udGVudCA9ICFpc0N1cnJlbnRseVZpcyA/ICdcdUQ4M0RcdURDNDEnIDogJ1x1RDgzRFx1REVBQic7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJ0bkdob3N0KSB7XHJcbiAgICAgIGJ0bkdob3N0Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNHaG9zdCA9IGJ0bkdob3N0LmNsYXNzTGlzdC5jb250YWlucygnZ2hvc3QtYWN0aXZlJyk7XHJcbiAgICAgICAgc2V0RGlzY2lwbGluZUdob3N0aW5nKGRpc2MsICFpc0dob3N0KTtcclxuICAgICAgICBidG5HaG9zdC5jbGFzc0xpc3QudG9nZ2xlKCdnaG9zdC1hY3RpdmUnLCAhaXNHaG9zdCk7XHJcbiAgICAgICAgaWYgKCFpc0dob3N0KSB7XHJcbiAgICAgICAgICBpZiAoc2xpZGVyKSBzbGlkZXIudmFsdWUgPSAyMDtcclxuICAgICAgICAgIGlmICh2YWxUZXh0KSB2YWxUZXh0LnRleHRDb250ZW50ID0gJzIwJSc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChzbGlkZXIpIHNsaWRlci52YWx1ZSA9IDEwMDtcclxuICAgICAgICAgIGlmICh2YWxUZXh0KSB2YWxUZXh0LnRleHRDb250ZW50ID0gJzEwMCUnO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYnRuU29sbykge1xyXG4gICAgICBidG5Tb2xvLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgICAgcm93cy5mb3JFYWNoKHIgPT4ge1xyXG4gICAgICAgICAgY29uc3QgZCA9IHIuZGF0YXNldC5kaXNjaXBsaW5lO1xyXG4gICAgICAgICAgY29uc3QgdkJ0biA9IHIucXVlcnlTZWxlY3RvcignLmJ0bi12aXMnKTtcclxuICAgICAgICAgIGlmIChkID09PSBkaXNjKSB7XHJcbiAgICAgICAgICAgIHNldERpc2NpcGxpbmVWaXNpYmlsaXR5KGQsIHRydWUpO1xyXG4gICAgICAgICAgICBpZiAodkJ0bikgeyB2QnRuLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOyB2QnRuLnRleHRDb250ZW50ID0gJ1x1RDgzRFx1REM0MSc7IH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldERpc2NpcGxpbmVWaXNpYmlsaXR5KGQsIGZhbHNlKTtcclxuICAgICAgICAgICAgaWYgKHZCdG4pIHsgdkJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTsgdkJ0bi50ZXh0Q29udGVudCA9ICdcdUQ4M0RcdURFQUInOyB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2V0U3RhdHVzKGBTb2xvOiAke2Rpc2N9YCk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNsaWRlcikge1xyXG4gICAgICBzbGlkZXIub25pbnB1dCA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBvcFZhbCA9IHBhcnNlSW50KHNsaWRlci52YWx1ZSwgMTApIC8gMTAwLjA7XHJcbiAgICAgICAgaWYgKHZhbFRleHQpIHZhbFRleHQudGV4dENvbnRlbnQgPSBgJHtzbGlkZXIudmFsdWV9JWA7XHJcbiAgICAgICAgc2V0RGlzY2lwbGluZU9wYWNpdHkoZGlzYywgb3BWYWwpO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXREaXNjaXBsaW5lVmlzaWJpbGl0eShkaXNjaXBsaW5lLCB2aXNpYmxlKSB7XHJcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NpcGxpbmUpKSB7XHJcbiAgICAgIGVudHJ5LnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgICBlbnRyeS5ncm91cC52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0RGlzY2lwbGluZUdob3N0aW5nKGRpc2NpcGxpbmUsIGdob3N0ZWQpIHtcclxuICBsb2FkZWRNb2RlbHMuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICBpZiAoZGlzY2lwbGluZU1hdGNoZXMoZW50cnkuZGlzY2lwbGluZSwgZGlzY2lwbGluZSkpIHtcclxuICAgICAgZW50cnkuaXNHaG9zdGVkID0gZ2hvc3RlZDtcclxuICAgICAgZW50cnkuZ3JvdXAudHJhdmVyc2UobyA9PiB7XHJcbiAgICAgICAgaWYgKG8uaXNNZXNoICYmIG8ubWF0ZXJpYWwpIHtcclxuICAgICAgICAgIGlmICghby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcykge1xyXG4gICAgICAgICAgICBvLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzID0ge1xyXG4gICAgICAgICAgICAgIGNvbG9yOiBvLm1hdGVyaWFsLmNvbG9yLmNsb25lKCksXHJcbiAgICAgICAgICAgICAgb3BhY2l0eTogby5tYXRlcmlhbC5vcGFjaXR5LFxyXG4gICAgICAgICAgICAgIHRyYW5zcGFyZW50OiBvLm1hdGVyaWFsLnRyYW5zcGFyZW50LFxyXG4gICAgICAgICAgICAgIGRlcHRoV3JpdGU6IG8ubWF0ZXJpYWwuZGVwdGhXcml0ZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChnaG9zdGVkKSB7XHJcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBvLm1hdGVyaWFsLm9wYWNpdHkgPSAwLjIwO1xyXG4gICAgICAgICAgICBvLm1hdGVyaWFsLmRlcHRoV3JpdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgby5tYXRlcmlhbC5jb2xvci5zZXRIZXgoMHg5NGEzYjgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcCA9IG8udXNlckRhdGEub3JpZ01hdGVyaWFsUHJvcHM7XHJcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBwLnRyYW5zcGFyZW50O1xyXG4gICAgICAgICAgICBvLm1hdGVyaWFsLm9wYWNpdHkgPSBwLm9wYWNpdHk7XHJcbiAgICAgICAgICAgIG8ubWF0ZXJpYWwuZGVwdGhXcml0ZSA9IHAuZGVwdGhXcml0ZTtcclxuICAgICAgICAgICAgby5tYXRlcmlhbC5jb2xvci5jb3B5KHAuY29sb3IpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldERpc2NpcGxpbmVPcGFjaXR5KGRpc2NpcGxpbmUsIG9wYWNpdHkpIHtcclxuICBsb2FkZWRNb2RlbHMuZm9yRWFjaChlbnRyeSA9PiB7XHJcbiAgICBpZiAoZGlzY2lwbGluZU1hdGNoZXMoZW50cnkuZGlzY2lwbGluZSwgZGlzY2lwbGluZSkpIHtcclxuICAgICAgZW50cnkub3BhY2l0eSA9IG9wYWNpdHk7XHJcbiAgICAgIGVudHJ5Lmdyb3VwLnRyYXZlcnNlKG8gPT4ge1xyXG4gICAgICAgIGlmIChvLmlzTWVzaCAmJiBvLm1hdGVyaWFsKSB7XHJcbiAgICAgICAgICBpZiAoIW8udXNlckRhdGEub3JpZ01hdGVyaWFsUHJvcHMpIHtcclxuICAgICAgICAgICAgby51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcyA9IHtcclxuICAgICAgICAgICAgICBjb2xvcjogby5tYXRlcmlhbC5jb2xvci5jbG9uZSgpLFxyXG4gICAgICAgICAgICAgIG9wYWNpdHk6IG8ubWF0ZXJpYWwub3BhY2l0eSxcclxuICAgICAgICAgICAgICB0cmFuc3BhcmVudDogby5tYXRlcmlhbC50cmFuc3BhcmVudCxcclxuICAgICAgICAgICAgICBkZXB0aFdyaXRlOiBvLm1hdGVyaWFsLmRlcHRoV3JpdGUsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gb3BhY2l0eSA8IDAuOTg7XHJcbiAgICAgICAgICBvLm1hdGVyaWFsLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICAgICAgby5tYXRlcmlhbC5kZXB0aFdyaXRlID0gb3BhY2l0eSA+PSAwLjg1O1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRpc2NpcGxpbmVNYXRjaGVzKG1vZGVsRGlzYywgdGFyZ2V0RGlzYykge1xyXG4gIGlmICghbW9kZWxEaXNjIHx8ICF0YXJnZXREaXNjKSByZXR1cm4gZmFsc2U7XHJcbiAgY29uc3QgbSA9IG1vZGVsRGlzYy50b0xvd2VyQ2FzZSgpO1xyXG4gIGNvbnN0IHQgPSB0YXJnZXREaXNjLnRvTG93ZXJDYXNlKCk7XHJcbiAgaWYgKG0gPT09IHQpIHJldHVybiB0cnVlO1xyXG4gIGlmICh0ID09PSAnbWVwJyAmJiAobS5pbmNsdWRlcygnaHZhYycpIHx8IG0uaW5jbHVkZXMoJ3BsdW1iJykgfHwgbS5pbmNsdWRlcygnZWxlYycpIHx8IG0uaW5jbHVkZXMoJ21lY2gnKSkpIHJldHVybiB0cnVlO1xyXG4gIGlmICh0ID09PSAnc3RydWN0dXJhbCcgJiYgKG0uaW5jbHVkZXMoJ3N0cnVjJykgfHwgbS5pbmNsdWRlcygnc3RyJykpKSByZXR1cm4gdHJ1ZTtcclxuICBpZiAodCA9PT0gJ2FyY2hpdGVjdHVyZScgJiYgKG0uaW5jbHVkZXMoJ2FyaycpIHx8IG0uaW5jbHVkZXMoJ2FyY2gnKSkpIHJldHVybiB0cnVlO1xyXG4gIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBFbGVtZW50IFNlbGVjdGlvbiAmIFByb3BlcnR5IEluc3BlY3RvciAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xyXG4gIGN1cnJlbnRTZWxlY3Rpb24gPSBudWxsO1xyXG4gIGlmIChlbHMucHJvcHMpIGVscy5wcm9wcy5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5ObyBzZWxlY3Rpb248L2Rpdj4nO1xyXG4gIGlmIChlbHMucHJvcHNUaXRsZSkge1xyXG4gICAgZWxzLnByb3BzVGl0bGUudGV4dENvbnRlbnQgPSAnQ2xpY2sgYW4gZWxlbWVudCBpbiB0aGUgdmlld2VyJztcclxuICAgIGVscy5wcm9wc1RpdGxlLmNsYXNzTmFtZSA9ICdlbXB0eS1oaW50JztcclxuICB9XHJcbiAgaWYgKGVscy5saW5rcykgZWxzLmxpbmtzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGxpbmtzPC9kaXY+JztcclxuXHJcbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2ggfSkgPT4ge1xyXG4gICAgaWYgKG1lc2gudXNlckRhdGEub3JpZ0NvbG9yKSB7XHJcbiAgICAgIG1lc2gubWF0ZXJpYWwuY29sb3IuY29weShtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcik7XHJcbiAgICB9XHJcbiAgICBpZiAobWVzaC5tYXRlcmlhbC5lbWlzc2l2ZSkgbWVzaC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoMHgwMDAwMDApO1xyXG4gICAgY29uc3QgcCA9IG1lc2gudXNlckRhdGEub3JpZ01hdGVyaWFsUHJvcHM7XHJcbiAgICBpZiAocCkge1xyXG4gICAgICBtZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gcC50cmFuc3BhcmVudDtcclxuICAgICAgbWVzaC5tYXRlcmlhbC5vcGFjaXR5ID0gcC5vcGFjaXR5O1xyXG4gICAgICBtZXNoLm1hdGVyaWFsLmRlcHRoV3JpdGUgPSBwLmRlcHRoV3JpdGU7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNlbGVjdEVsZW1lbnQobWVzaCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWUpIHtcclxuICBjbGVhclNlbGVjdGlvbigpO1xyXG4gIGNvbnN0IGxvb2t1cEtleSA9IGAke21vZGVsRG9jTmFtZX06JHtleHByZXNzSUR9YDtcclxuICBsZXQgZWwgPSBlbGVtZW50SW5kZXguZ2V0KGxvb2t1cEtleSkgfHwgZWxlbWVudEluZGV4LmdldChTdHJpbmcoZXhwcmVzc0lEKSkgfHwgbWVzaC51c2VyRGF0YS5lbGVtZW50O1xyXG5cclxuICBjdXJyZW50U2VsZWN0aW9uID0geyBtZXNoLCBlbGVtZW50OiBlbCwgZXhwcmVzc0lELCBtb2RlbERvY05hbWUgfTtcclxuXHJcbiAgaWYgKCFtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcikgbWVzaC51c2VyRGF0YS5vcmlnQ29sb3IgPSBtZXNoLm1hdGVyaWFsLmNvbG9yLmNsb25lKCk7XHJcbiAgbWVzaC5tYXRlcmlhbC5jb2xvci5jb3B5KGhpZ2hsaWdodE1hdC5jb2xvcik7XHJcbiAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuY29weShoaWdobGlnaHRNYXQuZW1pc3NpdmUpO1xyXG5cclxuICBjb25zdCBtb2RlbEVudHJ5ID0gbG9hZGVkTW9kZWxzLmdldChtb2RlbERvY05hbWUpO1xyXG4gIGNvbnN0IGRpc2NpcGxpbmUgPSAobW9kZWxFbnRyeSAmJiBtb2RlbEVudHJ5LmRpc2NpcGxpbmUpIHx8IG1lc2gudXNlckRhdGEuZGlzY2lwbGluZSB8fCAnRGlzY2lwbGluZSc7XHJcbiAgY29uc3QgbW9kZWxOYW1lID0gKG1vZGVsRW50cnkgJiYgbW9kZWxFbnRyeS5tb2RlbE5hbWUpIHx8IG1vZGVsRG9jTmFtZTtcclxuXHJcbiAgcmVuZGVyRWxlbWVudEluc3BlY3RvcihlbCwgZXhwcmVzc0lELCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUsIG1lc2gpO1xyXG5cclxuICBpZiAoZWwgJiYgKCFlbC5wcm9wZXJ0aWVzIHx8ICFPYmplY3Qua2V5cyhlbC5wcm9wZXJ0aWVzKS5sZW5ndGgpKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmdWxsRG9jID0gYXdhaXQgZnJhcHBlLmNhbGwoeyBtZXRob2Q6IEFQSS5nZXRfZWxlbWVudCwgYXJnczogeyBlbGVtZW50OiBlbC5uYW1lIH0gfSk7XHJcbiAgICAgIGlmIChmdWxsRG9jLm1lc3NhZ2UgJiYgY3VycmVudFNlbGVjdGlvbiAmJiBjdXJyZW50U2VsZWN0aW9uLmV4cHJlc3NJRCA9PT0gZXhwcmVzc0lEKSB7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihlbCwgZnVsbERvYy5tZXNzYWdlKTtcclxuICAgICAgICByZW5kZXJFbGVtZW50SW5zcGVjdG9yKGVsLCBleHByZXNzSUQsIG1vZGVsTmFtZSwgZGlzY2lwbGluZSwgbWVzaCk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHt9XHJcbiAgfSBlbHNlIGlmICghZWwgJiYgbW9kZWxFbnRyeSAmJiBpZmNBcGkpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxpbmVEYXRhID0gYXdhaXQgaWZjQXBpLkdldExpbmUobW9kZWxFbnRyeS5pZmNNb2RlbElELCBleHByZXNzSUQpO1xyXG4gICAgICByZW5kZXJXZWJJZmNJbnNwZWN0b3IoZXhwcmVzc0lELCBsaW5lRGF0YSwgbW9kZWxOYW1lLCBkaXNjaXBsaW5lKTtcclxuICAgIH0gY2F0Y2ggKGUpIHt9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJFbGVtZW50SW5zcGVjdG9yKGVsLCBleHByZXNzSUQsIG1vZGVsTmFtZSwgZGlzY2lwbGluZSwgbWVzaCkge1xyXG4gIGlmICghZWxzLnByb3BzVGl0bGUgfHwgIWVscy5wcm9wcykgcmV0dXJuO1xyXG5cclxuICBjb25zdCB0aXRsZSA9IChlbCAmJiAoZWwudGl0bGUgfHwgZWwuZWxlbWVudF90eXBlKSkgfHwgYElGQyAjJHtleHByZXNzSUR9YDtcclxuICBjb25zdCBndWlkID0gKGVsICYmIGVsLnN0YWJsZV9pZCkgfHwgJyc7XHJcbiAgZWxzLnByb3BzVGl0bGUudGV4dENvbnRlbnQgPSBgJHt0aXRsZX0gJHtndWlkID8gYCgke2d1aWR9KWAgOiAnJ31gO1xyXG4gIGVscy5wcm9wc1RpdGxlLmNsYXNzTmFtZSA9ICcnO1xyXG4gIGVscy5wcm9wcy5pbm5lckhUTUwgPSAnJztcclxuXHJcbiAgLy8gQmFkZ2VzIEhlYWRlclxyXG4gIGNvbnN0IGJhZGdlc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIGJhZGdlc0Rpdi5zdHlsZS5tYXJnaW5Cb3R0b20gPSAnOHB4JztcclxuICBiYWRnZXNEaXYuaW5uZXJIVE1MID0gYFxyXG4gICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgbW9kZWwtYmFkZ2VcIj4ke21vZGVsTmFtZX08L3NwYW4+XHJcbiAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZGlzY2lwbGluZX08L3NwYW4+XHJcbiAgICAke2VsICYmIGVsLnN0b3JleSA/IGA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZWwuc3RvcmV5fTwvc3Bhbj5gIDogJyd9XHJcbiAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiMke2V4cHJlc3NJRH08L3NwYW4+XHJcbiAgYDtcclxuICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQoYmFkZ2VzRGl2KTtcclxuXHJcbiAgLy8gQm91bmRpbmcgQm94IEluZm9cclxuICBpZiAobWVzaCAmJiBtZXNoLmdlb21ldHJ5KSB7XHJcbiAgICBpZiAoIW1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3gpIG1lc2guZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nQm94KCk7XHJcbiAgICBjb25zdCBib3ggPSBtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94LmNsb25lKCkuYXBwbHlNYXRyaXg0KG1lc2gubWF0cml4V29ybGQpO1xyXG4gICAgY29uc3Qgc2l6ZSA9IGJveC5nZXRTaXplKG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xyXG4gICAgY29uc3QgY2VudGVyID0gYm94LmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcclxuXHJcbiAgICBjb25zdCBiYm94SGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBiYm94SGVhZGVyLnN0eWxlLmNzc1RleHQgPSAnZm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxMnB4O21hcmdpbjo4cHggMCA0cHg7Y29sb3I6IzFlMjkzYic7XHJcbiAgICBiYm94SGVhZGVyLnRleHRDb250ZW50ID0gJ1NwYXRpYWwgRGltZW5zaW9ucyc7XHJcbiAgICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQoYmJveEhlYWRlcik7XHJcblxyXG4gICAgY29uc3QgYmJveFRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcclxuICAgIGJib3hUYWJsZS5jbGFzc05hbWUgPSAncHJvcGVydHktdGFibGUnO1xyXG4gICAgYmJveFRhYmxlLmlubmVySFRNTCA9IGBcclxuICAgICAgPHRyPjx0ZD5TaXplIChYIFx1MDBENyBZIFx1MDBENyBaKTwvdGQ+PHRkPiR7c2l6ZS54LnRvRml4ZWQoMil9bSBcdTAwRDcgJHtzaXplLnkudG9GaXhlZCgyKX1tIFx1MDBENyAke3NpemUuei50b0ZpeGVkKDIpfW08L3RkPjwvdHI+XHJcbiAgICAgIDx0cj48dGQ+Q2VudGVyIFBvaW50PC90ZD48dGQ+KCR7Y2VudGVyLngudG9GaXhlZCgyKX0sICR7Y2VudGVyLnkudG9GaXhlZCgyKX0sICR7Y2VudGVyLnoudG9GaXhlZCgyKX0pPC90ZD48L3RyPlxyXG4gICAgYDtcclxuICAgIGVscy5wcm9wcy5hcHBlbmRDaGlsZChiYm94VGFibGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gUXVhbnRpdGllcyBUYWJsZVxyXG4gIGNvbnN0IHEgPSAoZWwgJiYgZWwucXVhbnRpdGllcykgfHwge307XHJcbiAgY29uc3QgcUtleXMgPSBPYmplY3Qua2V5cyhxKTtcclxuICBpZiAocUtleXMubGVuZ3RoKSB7XHJcbiAgICBjb25zdCBxSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBxSGVhZGVyLnN0eWxlLmNzc1RleHQgPSAnZm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxMnB4O21hcmdpbjoxMHB4IDAgNHB4O2NvbG9yOiMxZTI5M2InO1xyXG4gICAgcUhlYWRlci50ZXh0Q29udGVudCA9ICdRdWFudGl0aWVzIChRdG9fKiknO1xyXG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHFIZWFkZXIpO1xyXG5cclxuICAgIGNvbnN0IHFUYWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgICBxVGFibGUuY2xhc3NOYW1lID0gJ3Byb3BlcnR5LXRhYmxlJztcclxuICAgIHFLZXlzLmZvckVhY2goayA9PiB7XHJcbiAgICAgIGNvbnN0IHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcclxuICAgICAgdHIuaW5uZXJIVE1MID0gYDx0ZD4ke2t9PC90ZD48dGQ+JHtxW2tdfTwvdGQ+YDtcclxuICAgICAgcVRhYmxlLmFwcGVuZENoaWxkKHRyKTtcclxuICAgIH0pO1xyXG4gICAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHFUYWJsZSk7XHJcbiAgfVxyXG5cclxuICAvLyBQcm9wZXJ0eSBTZXRzIFRhYmxlXHJcbiAgY29uc3QgcCA9IChlbCAmJiBlbC5wcm9wZXJ0aWVzKSB8fCB7fTtcclxuICBjb25zdCBwS2V5cyA9IE9iamVjdC5rZXlzKHApLmZpbHRlcihrID0+ICFbJ2lmY19pZCcsICdpZmNfdHlwZSddLmluY2x1ZGVzKGspKTtcclxuICBpZiAocEtleXMubGVuZ3RoKSB7XHJcbiAgICBjb25zdCBwSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBwSGVhZGVyLnN0eWxlLmNzc1RleHQgPSAnZm9udC13ZWlnaHQ6NjAwO2ZvbnQtc2l6ZToxMnB4O21hcmdpbjoxMHB4IDAgNHB4O2NvbG9yOiMxZTI5M2InO1xyXG4gICAgcEhlYWRlci50ZXh0Q29udGVudCA9ICdQcm9wZXJ0eSBTZXRzIChQc2V0XyopJztcclxuICAgIGVscy5wcm9wcy5hcHBlbmRDaGlsZChwSGVhZGVyKTtcclxuXHJcbiAgICBjb25zdCBwVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xyXG4gICAgcFRhYmxlLmNsYXNzTmFtZSA9ICdwcm9wZXJ0eS10YWJsZSc7XHJcbiAgICBwS2V5cy5zbGljZSgwLCA1MCkuZm9yRWFjaChrID0+IHtcclxuICAgICAgY29uc3QgdiA9IHR5cGVvZiBwW2tdID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHBba10pIDogU3RyaW5nKHBba10pO1xyXG4gICAgICBjb25zdCB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICAgIHRyLmlubmVySFRNTCA9IGA8dGQ+JHtrfTwvdGQ+PHRkPiR7di5zbGljZSgwLCA3MCl9PC90ZD5gO1xyXG4gICAgICBwVGFibGUuYXBwZW5kQ2hpbGQodHIpO1xyXG4gICAgfSk7XHJcbiAgICBlbHMucHJvcHMuYXBwZW5kQ2hpbGQocFRhYmxlKTtcclxuICB9XHJcblxyXG4gIGlmIChlbCAmJiBlbC5uYW1lKSBsb2FkQm9xTGlua3MoZWwubmFtZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlcldlYklmY0luc3BlY3RvcihleHByZXNzSUQsIHByb3BzLCBtb2RlbE5hbWUsIGRpc2NpcGxpbmUpIHtcclxuICBpZiAoIWVscy5wcm9wc1RpdGxlIHx8ICFlbHMucHJvcHMpIHJldHVybjtcclxuICBlbHMucHJvcHNUaXRsZS50ZXh0Q29udGVudCA9IGBJRkMgIyR7ZXhwcmVzc0lEfSAke3Byb3BzLnR5cGUgfHwgJyd9YDtcclxuICBlbHMucHJvcHNUaXRsZS5jbGFzc05hbWUgPSAnJztcclxuICBlbHMucHJvcHMuaW5uZXJIVE1MID0gYFxyXG4gICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206OHB4XCI+XHJcbiAgICAgIDxzcGFuIGNsYXNzPVwiYmltLWJhZGdlIG1vZGVsLWJhZGdlXCI+JHttb2RlbE5hbWV9PC9zcGFuPlxyXG4gICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZVwiPiR7ZGlzY2lwbGluZX08L3NwYW4+XHJcbiAgICA8L2Rpdj5cclxuICBgO1xyXG5cclxuICBjb25zdCB0YWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XHJcbiAgdGFibGUuY2xhc3NOYW1lID0gJ3Byb3BlcnR5LXRhYmxlJztcclxuICBPYmplY3Qua2V5cyhwcm9wcykuc2xpY2UoMCwgMzApLmZvckVhY2goayA9PiB7XHJcbiAgICBjb25zdCB2ID0gcHJvcHNba107XHJcbiAgICBjb25zdCB2YWwgPSB2ICYmIHR5cGVvZiB2ID09PSAnb2JqZWN0JyAmJiB2LnZhbHVlICE9PSB1bmRlZmluZWQgPyB2LnZhbHVlIDogKHR5cGVvZiB2ID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHYpLnNsaWNlKDAsIDYwKSA6IHYpO1xyXG4gICAgY29uc3QgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xyXG4gICAgdHIuaW5uZXJIVE1MID0gYDx0ZD4ke2t9PC90ZD48dGQ+JHtTdHJpbmcodmFsKX08L3RkPmA7XHJcbiAgICB0YWJsZS5hcHBlbmRDaGlsZCh0cik7XHJcbiAgfSk7XHJcbiAgZWxzLnByb3BzLmFwcGVuZENoaWxkKHRhYmxlKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZEJvcUxpbmtzKGJpbUVsZW1lbnQpIHtcclxuICBpZiAoIWVscy5saW5rcykgcmV0dXJuO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7IG1ldGhvZDogQVBJLmxpc3RfYm9xX2xpbmtzLCBhcmdzOiB7IGJpbV9lbGVtZW50OiBiaW1FbGVtZW50IH0gfSk7XHJcbiAgICBjb25zdCBsaW5rcyA9IHJlcy5tZXNzYWdlIHx8IFtdO1xyXG4gICAgaWYgKCFsaW5rcy5sZW5ndGgpIHtcclxuICAgICAgZWxzLmxpbmtzLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGxpbmtzIGZvciBjdXJyZW50IGVsZW1lbnQ8L2Rpdj4nO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBlbHMubGlua3MuaW5uZXJIVE1MID0gbGlua3MubWFwKGwgPT4gYFxyXG4gICAgICA8ZGl2IGNsYXNzPVwibGluay1yb3dcIiBzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzo0cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZjFmNWY5O2ZvbnQtc2l6ZToxMnB4XCI+XHJcbiAgICAgICAgPHNwYW4+JHtsLmJvcV9yZWZlcmVuY2VfbmFtZX0gPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2VcIj4ke2wuYm9xX3JlZmVyZW5jZV90eXBlfTwvc3Bhbj48L3NwYW4+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImRlbFwiIGRhdGEtbmFtZT1cIiR7bC5uYW1lfVwiIHN0eWxlPVwiY29sb3I6I2VmNDQ0NDtib3JkZXI6bm9uZTtiYWNrZ3JvdW5kOm5vbmU7Y3Vyc29yOnBvaW50ZXJcIj5cdTI3MTU8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICBgKS5qb2luKCcnKTtcclxuXHJcbiAgICBlbHMubGlua3MucXVlcnlTZWxlY3RvckFsbCgnLmRlbCcpLmZvckVhY2goYiA9PiB7XHJcbiAgICAgIGIub25jbGljayA9IGFzeW5jICgpID0+IHtcclxuICAgICAgICBhd2FpdCBmcmFwcGUuY2FsbCh7IG1ldGhvZDogQVBJLmRlbGV0ZV9ib3FfbGluaywgYXJnczogeyBsaW5rOiBiLmRhdGFzZXQubmFtZSB9IH0pO1xyXG4gICAgICAgIGxvYWRCb3FMaW5rcyhiaW1FbGVtZW50KTtcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIGVscy5saW5rcy5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5FcnJvciBsb2FkaW5nIGxpbmtzPC9kaXY+JztcclxuICB9XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gSW4tVmlld2VyIEJWSCBDbGFzaCBEZXRlY3Rpb24gRW5naW5lIC0tLS0tLS0tLS0tLS0tLS1cclxuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNsYXNoRGV0ZWN0aW9uKCkge1xyXG4gIGNvbnN0IGRpc2NBID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kaXNjLWEnKSB8fCB7fSkudmFsdWUgfHwgJ1N0cnVjdHVyYWwnO1xyXG4gIGNvbnN0IGRpc2NCID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kaXNjLWInKSB8fCB7fSkudmFsdWUgfHwgJ01FUCc7XHJcbiAgY29uc3QgdG9sSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xhc2gtdG9sZXJhbmNlJyk7XHJcbiAgY29uc3QgdG9sZXJhbmNlID0gdG9sSW5wdXQgPyBwYXJzZUZsb2F0KHRvbElucHV0LnZhbHVlKSB8fCAwLjAgOiAwLjA7XHJcblxyXG4gIHNldFN0YXR1cyhgUnVubmluZyBCVkggY2xhc2ggY2hlY2sgYmV0d2VlbiAke2Rpc2NBfSBhbmQgJHtkaXNjQn1cdTIwMjZgKTtcclxuICBzaG93TG9hZGluZygnQ29tcHV0aW5nIG1lc2ggQlZIIGludGVyc2VjdGlvbnNcdTIwMjYnLCB0cnVlKTtcclxuXHJcbiAgY29uc3QgbWVzaGVzQSA9IFtdO1xyXG4gIGNvbnN0IG1lc2hlc0IgPSBbXTtcclxuXHJcbiAgbG9hZGVkTW9kZWxzLmZvckVhY2goZW50cnkgPT4ge1xyXG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NBKSkge1xyXG4gICAgICBlbnRyeS5ncm91cC50cmF2ZXJzZShvID0+IHsgaWYgKG8uaXNNZXNoKSBtZXNoZXNBLnB1c2gobyk7IH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKGRpc2NpcGxpbmVNYXRjaGVzKGVudHJ5LmRpc2NpcGxpbmUsIGRpc2NCKSkge1xyXG4gICAgICBlbnRyeS5ncm91cC50cmF2ZXJzZShvID0+IHsgaWYgKG8uaXNNZXNoKSBtZXNoZXNCLnB1c2gobyk7IH0pO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBpZiAoIW1lc2hlc0EubGVuZ3RoIHx8ICFtZXNoZXNCLmxlbmd0aCkge1xyXG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICAgIHNldFN0YXR1cyhgQ2Fubm90IHJ1biBjbGFzaCBjaGVjazogTWFrZSBzdXJlIG1vZGVscyBmb3IgYm90aCAke2Rpc2NBfSBhbmQgJHtkaXNjQn0gYXJlIGxvYWRlZC5gKTtcclxuICAgIGlmIChlbHMuY2xhc2hDYXJkc0xpc3QpIHtcclxuICAgICAgZWxzLmNsYXNoQ2FyZHNMaXN0LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPkxvYWQgbW9kZWxzIGZvciBib3RoICR7ZGlzY0F9IGFuZCAke2Rpc2NCfSBmaXJzdDwvZGl2PmA7XHJcbiAgICB9XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBFeGVjdXRlIHR3by10aWVyIEJWSCBjb2xsaXNpb24gZGV0ZWN0aW9uXHJcbiAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgY29uc3QgcmVzdWx0ID0gZGV0ZWN0Q2xhc2hlcyhtZXNoZXNBLCBtZXNoZXNCLCB7IHRvbGVyYW5jZSB9KTtcclxuICBjb25zdCBkdXJhdGlvbiA9IChwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZSkudG9GaXhlZCgwKTtcclxuXHJcbiAgZGV0ZWN0ZWRDbGFzaGVzID0gcmVzdWx0LmNsYXNoZXMgfHwgW107XHJcbiAgc2V0U3RhdHVzKGBDbGFzaCBjaGVjayBjb21wbGV0ZTogJHtkZXRlY3RlZENsYXNoZXMubGVuZ3RofSBjbGFzaGVzIGRldGVjdGVkIGluICR7ZHVyYXRpb259bXMgKCR7cmVzdWx0LnN0YXRzLm5hcnJvd3BoYXNlQ2hlY2tzfSBCVkggY2hlY2tzKWApO1xyXG4gIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcblxyXG4gIHJlbmRlckNsYXNoZXNMaXN0KCk7XHJcblxyXG4gIC8vIFN3aXRjaCB0byBDbGFzaGVzIHRhYlxyXG4gIGNvbnN0IHRhYkJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YWItYnRuLWNsYXNoZXMnKTtcclxuICBpZiAodGFiQnRuKSB0YWJCdG4uY2xpY2soKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyQ2xhc2hlc0xpc3QoKSB7XHJcbiAgaWYgKCFlbHMuY2xhc2hDYXJkc0xpc3QpIHJldHVybjtcclxuICBlbHMuY2xhc2hDYXJkc0xpc3QuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIGlmIChlbHMuY2xhc2hCYWRnZUNvdW50KSB7XHJcbiAgICBlbHMuY2xhc2hCYWRnZUNvdW50LnRleHRDb250ZW50ID0gZGV0ZWN0ZWRDbGFzaGVzLmxlbmd0aDtcclxuICAgIGVscy5jbGFzaEJhZGdlQ291bnQuc3R5bGUuZGlzcGxheSA9IGRldGVjdGVkQ2xhc2hlcy5sZW5ndGggPyAnaW5saW5lLWJsb2NrJyA6ICdub25lJztcclxuICB9XHJcblxyXG4gIGlmICghZGV0ZWN0ZWRDbGFzaGVzLmxlbmd0aCkge1xyXG4gICAgZWxzLmNsYXNoQ2FyZHNMaXN0LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwiZW1wdHktaGludFwiPk5vIGNsYXNoZXMgZGV0ZWN0ZWQgYmV0d2VlbiBzZWxlY3RlZCBkaXNjaXBsaW5lcyE8L2Rpdj4nO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2V2RmlsdGVyID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1maWx0ZXItc2V2ZXJpdHknKSB8fCB7fSkudmFsdWUgfHwgJyc7XHJcbiAgY29uc3QgZmlsdGVyZWQgPSBzZXZGaWx0ZXIgPyBkZXRlY3RlZENsYXNoZXMuZmlsdGVyKGMgPT4gYy5zZXZlcml0eSA9PT0gc2V2RmlsdGVyKSA6IGRldGVjdGVkQ2xhc2hlcztcclxuXHJcbiAgZmlsdGVyZWQuZm9yRWFjaCgoY2xhc2gpID0+IHtcclxuICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGNhcmQuY2xhc3NOYW1lID0gJ2NsYXNoLWNhcmQnICsgKGFjdGl2ZUNsYXNoICYmIGFjdGl2ZUNsYXNoLmlkID09PSBjbGFzaC5pZCA/ICcgYWN0aXZlJyA6ICcnKTtcclxuICAgIGNvbnN0IHB0ID0gY2xhc2guY29sbGlzaW9uUG9pbnQ7XHJcbiAgICBjb25zdCBzZXZDbGFzcyA9IGNsYXNoLnNldmVyaXR5ID8gYHNldmVyaXR5LSR7Y2xhc2guc2V2ZXJpdHkudG9Mb3dlckNhc2UoKX1gIDogJ3NldmVyaXR5LW1pbm9yJztcclxuXHJcbiAgICBjYXJkLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNhcmQtdGl0bGVcIj4ke2NsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmV9ICMke2NsYXNoLmVsZW1lbnRBLmV4cHJlc3NJRH0gXHUwMEQ3ICR7Y2xhc2guZWxlbWVudEIuZGlzY2lwbGluZX0gIyR7Y2xhc2guZWxlbWVudEIuZXhwcmVzc0lEfTwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY2FyZC1tZXRhXCI+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiaW0tYmFkZ2UgJHtzZXZDbGFzc31cIj4ke2NsYXNoLnNldmVyaXR5fTwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZSBzdGF0dXMtb3BlblwiPiR7Y2xhc2guc3RhdHVzfTwvc3Bhbj5cclxuICAgICAgICA8c3BhbiBjbGFzcz1cImJpbS1iYWRnZSBtb2RlbC1iYWRnZVwiPiR7Y2xhc2guZWxlbWVudEEuaWZjVHlwZSB8fCAnRWxlbWVudCd9IC8gJHtjbGFzaC5lbGVtZW50Qi5pZmNUeXBlIHx8ICdFbGVtZW50J308L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY2xhc2gtY2FyZC1jb29yZHNcIj5YWVo6ICgke3B0LngudG9GaXhlZCgyKX0sICR7cHQueS50b0ZpeGVkKDIpfSwgJHtwdC56LnRvRml4ZWQoMil9KSB8IERlcHRoOiAke2NsYXNoLnBlbmV0cmF0aW9uRGVwdGggPyBjbGFzaC5wZW5ldHJhdGlvbkRlcHRoLnRvRml4ZWQoMSkgOiAnMCd9bW08L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNhcmQtYWN0aW9uc1wiPlxyXG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzIGJ0bi1mbHlcIj5cdUQ4M0NcdURGQUYgRmx5LVRvPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICBjYXJkLm9uY2xpY2sgPSAoKSA9PiBzZWxlY3RDbGFzaChjbGFzaCk7XHJcbiAgICBjb25zdCBmbHlCdG4gPSBjYXJkLnF1ZXJ5U2VsZWN0b3IoJy5idG4tZmx5Jyk7XHJcbiAgICBpZiAoZmx5QnRuKSB7XHJcbiAgICAgIGZseUJ0bi5vbmNsaWNrID0gKGUpID0+IHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHNlbGVjdENsYXNoKGNsYXNoKTtcclxuICAgICAgICBmbHlUb0NsYXNoKGNsYXNoKTtcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBlbHMuY2xhc2hDYXJkc0xpc3QuYXBwZW5kQ2hpbGQoY2FyZCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbGVjdENsYXNoKGNsYXNoKSB7XHJcbiAgYWN0aXZlQ2xhc2ggPSBjbGFzaDtcclxuICByZW5kZXJDbGFzaGVzTGlzdCgpO1xyXG4gIGhpZ2hsaWdodENsYXNoRWxlbWVudHMoY2xhc2gpO1xyXG4gIHJlbmRlckNsYXNoRGV0YWlsVmlldyhjbGFzaCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhpZ2hsaWdodENsYXNoRWxlbWVudHMoY2xhc2gpIHtcclxuICBjbGFzaEhlbHBlcnNHcm91cC5jbGVhcigpO1xyXG5cclxuICAvLyBHaG9zdCBiYWNrZ3JvdW5kIG1lc2hlc1xyXG4gIGVsZW1lbnRNZXNoZXMuZm9yRWFjaCgoeyBtZXNoIH0pID0+IHtcclxuICAgIGlmICghbWVzaC51c2VyRGF0YS5vcmlnTWF0ZXJpYWxQcm9wcykge1xyXG4gICAgICBtZXNoLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzID0ge1xyXG4gICAgICAgIHRyYW5zcGFyZW50OiBtZXNoLm1hdGVyaWFsLnRyYW5zcGFyZW50LFxyXG4gICAgICAgIG9wYWNpdHk6IG1lc2gubWF0ZXJpYWwub3BhY2l0eSxcclxuICAgICAgICBkZXB0aFdyaXRlOiBtZXNoLm1hdGVyaWFsLmRlcHRoV3JpdGUsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZiAobWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gubWF0ZXJpYWwuY29sb3IuY29weShtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcik7XHJcbiAgICBpZiAobWVzaC5tYXRlcmlhbC5lbWlzc2l2ZSkgbWVzaC5tYXRlcmlhbC5lbWlzc2l2ZS5zZXRIZXgoMHgwMDAwMDApO1xyXG4gICAgbWVzaC5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XHJcbiAgICBtZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSAwLjE1O1xyXG4gIH0pO1xyXG5cclxuICBjb25zdCBtZXNoQSA9IGNsYXNoLmVsZW1lbnRBLm1lc2g7XHJcbiAgY29uc3QgbWVzaEIgPSBjbGFzaC5lbGVtZW50Qi5tZXNoO1xyXG5cclxuICBpZiAobWVzaEEpIHtcclxuICAgIGlmICghbWVzaEEudXNlckRhdGEub3JpZ0NvbG9yKSBtZXNoQS51c2VyRGF0YS5vcmlnQ29sb3IgPSBtZXNoQS5tYXRlcmlhbC5jb2xvci5jbG9uZSgpO1xyXG4gICAgbWVzaEEubWF0ZXJpYWwuY29sb3IuY29weShjbGFzaE1hdEEuY29sb3IpO1xyXG4gICAgaWYgKG1lc2hBLm1hdGVyaWFsLmVtaXNzaXZlKSBtZXNoQS5tYXRlcmlhbC5lbWlzc2l2ZS5jb3B5KGNsYXNoTWF0QS5lbWlzc2l2ZSk7XHJcbiAgICBtZXNoQS5tYXRlcmlhbC50cmFuc3BhcmVudCA9IGZhbHNlO1xyXG4gICAgbWVzaEEubWF0ZXJpYWwub3BhY2l0eSA9IDEuMDtcclxuICB9XHJcblxyXG4gIGlmIChtZXNoQikge1xyXG4gICAgaWYgKCFtZXNoQi51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2hCLnVzZXJEYXRhLm9yaWdDb2xvciA9IG1lc2hCLm1hdGVyaWFsLmNvbG9yLmNsb25lKCk7XHJcbiAgICBtZXNoQi5tYXRlcmlhbC5jb2xvci5jb3B5KGNsYXNoTWF0Qi5jb2xvcik7XHJcbiAgICBpZiAobWVzaEIubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2hCLm1hdGVyaWFsLmVtaXNzaXZlLmNvcHkoY2xhc2hNYXRCLmVtaXNzaXZlKTtcclxuICAgIG1lc2hCLm1hdGVyaWFsLnRyYW5zcGFyZW50ID0gZmFsc2U7XHJcbiAgICBtZXNoQi5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gIH1cclxuXHJcbiAgLy8gQWRkIENlbnRyb2lkIDNEIFBpbiBNYXJrZXJcclxuICBjb25zdCBtYXJrZXIgPSBjcmVhdGVDZW50cm9pZE1hcmtlcihjbGFzaC5jb2xsaXNpb25Qb2ludCk7XHJcbiAgY2xhc2hIZWxwZXJzR3JvdXAuYWRkKG1hcmtlcik7XHJcblxyXG4gIC8vIEFkZCBXaXJlZnJhbWUgQm91bmRpbmcgQm94IEhlbHBlclxyXG4gIGlmIChjbGFzaC5ib3VuZGluZ0JveCkge1xyXG4gICAgY29uc3QgYm94SGVscGVyID0gY3JlYXRlSW50ZXJzZWN0aW9uQm94SGVscGVyKGNsYXNoLmJvdW5kaW5nQm94KTtcclxuICAgIGlmIChib3hIZWxwZXIpIGNsYXNoSGVscGVyc0dyb3VwLmFkZChib3hIZWxwZXIpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZmx5VG9DbGFzaChjbGFzaCkge1xyXG4gIGNvbnN0IHRhcmdldFBvcyA9IG5ldyBUSFJFRS5WZWN0b3IzKGNsYXNoLmNvbGxpc2lvblBvaW50LngsIGNsYXNoLmNvbGxpc2lvblBvaW50LnksIGNsYXNoLmNvbGxpc2lvblBvaW50LnopO1xyXG4gIGNvbnN0IGRpc3RhbmNlID0gNC41O1xyXG4gIGNvbnN0IGNhbVBvcyA9IHRhcmdldFBvcy5jbG9uZSgpLmFkZChuZXcgVEhSRUUuVmVjdG9yMyhkaXN0YW5jZSAqIDAuNywgZGlzdGFuY2UgKiAwLjUsIGRpc3RhbmNlICogMC43KSk7XHJcblxyXG4gIGNvbnN0IHN0YXJ0Q2FtID0gY2FtZXJhLnBvc2l0aW9uLmNsb25lKCk7XHJcbiAgY29uc3Qgc3RhcnRUYXJnZXQgPSBjb250cm9scy50YXJnZXQuY2xvbmUoKTtcclxuICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICBjb25zdCBkdXJhdGlvbiA9IDc1MDtcclxuXHJcbiAgZnVuY3Rpb24gYW5pbWF0ZVN0ZXAobm93KSB7XHJcbiAgICBjb25zdCB0ID0gTWF0aC5taW4oKG5vdyAtIHN0YXJ0VGltZSkgLyBkdXJhdGlvbiwgMS4wKTtcclxuICAgIGNvbnN0IGVhc2UgPSB0IDwgMC41ID8gMiAqIHQgKiB0IDogLTEgKyAoNCAtIDIgKiB0KSAqIHQ7XHJcbiAgICBjYW1lcmEucG9zaXRpb24ubGVycFZlY3RvcnMoc3RhcnRDYW0sIGNhbVBvcywgZWFzZSk7XHJcbiAgICBjb250cm9scy50YXJnZXQubGVycFZlY3RvcnMoc3RhcnRUYXJnZXQsIHRhcmdldFBvcywgZWFzZSk7XHJcbiAgICBjb250cm9scy51cGRhdGUoKTtcclxuICAgIGlmICh0IDwgMS4wKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVN0ZXApO1xyXG4gIH1cclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZVN0ZXApO1xyXG4gIHNldFN0YXR1cyhgSW5zcGVjdGluZyAke2NsYXNoLmlkfSBhdCAoJHt0YXJnZXRQb3MueC50b0ZpeGVkKDIpfSwgJHt0YXJnZXRQb3MueS50b0ZpeGVkKDIpfSwgJHt0YXJnZXRQb3Muei50b0ZpeGVkKDIpfSlgKTtcclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBDbGFzaCBEZXRhaWwgJiBUaHJlYWRlZCBEaXNjdXNzaW9uIFVJIC0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gcmVuZGVyQ2xhc2hEZXRhaWxWaWV3KGNsYXNoKSB7XHJcbiAgaWYgKCFlbHMuY2xhc2hEZXRhaWxDb250YWluZXIgfHwgIWVscy5jbGFzaExpc3RDb250YWluZXIpIHJldHVybjtcclxuICBlbHMuY2xhc2hMaXN0Q29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgZWxzLmNsYXNoRGV0YWlsQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICBjb25zdCB0aXRsZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRldGFpbC10aXRsZScpO1xyXG4gIGNvbnN0IG1ldGFFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbGFzaC1kZXRhaWwtbWV0YScpO1xyXG4gIGNvbnN0IHNldkJhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsYXNoLWRldGFpbC1zZXZlcml0eScpO1xyXG5cclxuICBpZiAodGl0bGVFbCkgdGl0bGVFbC50ZXh0Q29udGVudCA9IGAke2NsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmV9ICMke2NsYXNoLmVsZW1lbnRBLmV4cHJlc3NJRH0gXHUwMEQ3ICR7Y2xhc2guZWxlbWVudEIuZGlzY2lwbGluZX0gIyR7Y2xhc2guZWxlbWVudEIuZXhwcmVzc0lEfWA7XHJcbiAgaWYgKHNldkJhZGdlKSB7XHJcbiAgICBzZXZCYWRnZS50ZXh0Q29udGVudCA9IGNsYXNoLnNldmVyaXR5O1xyXG4gICAgc2V2QmFkZ2UuY2xhc3NOYW1lID0gYGJpbS1iYWRnZSBzZXZlcml0eS0keyhjbGFzaC5zZXZlcml0eSB8fCAnbWlub3InKS50b0xvd2VyQ2FzZSgpfWA7XHJcbiAgfVxyXG4gIGlmIChtZXRhRWwpIHtcclxuICAgIGNvbnN0IHB0ID0gY2xhc2guY29sbGlzaW9uUG9pbnQ7XHJcbiAgICBtZXRhRWwuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2PjxzdHJvbmc+Q29sbGlzaW9uIENvb3JkaW5hdGVzOjwvc3Ryb25nPiAoJHtwdC54LnRvRml4ZWQoMil9LCAke3B0LnkudG9GaXhlZCgyKX0sICR7cHQuei50b0ZpeGVkKDIpfSk8L2Rpdj5cclxuICAgICAgPGRpdj48c3Ryb25nPlBlbmV0cmF0aW9uIERlcHRoOjwvc3Ryb25nPiAkeyhjbGFzaC5wZW5ldHJhdGlvbkRlcHRoIHx8IDApLnRvRml4ZWQoMSl9IG1tIHwgPHN0cm9uZz5Wb2x1bWU6PC9zdHJvbmc+ICR7KGNsYXNoLmludGVyc2VjdGlvblZvbHVtZSB8fCAwKS50b0ZpeGVkKDQpfSBtXHUwMEIzPC9kaXY+XHJcbiAgICAgIDxkaXY+PHN0cm9uZz5FbGVtZW50IEE6PC9zdHJvbmc+ICR7Y2xhc2guZWxlbWVudEEubW9kZWxOYW1lfSAoJHtjbGFzaC5lbGVtZW50QS5pZmNUeXBlfSk8L2Rpdj5cclxuICAgICAgPGRpdj48c3Ryb25nPkVsZW1lbnQgQjo8L3N0cm9uZz4gJHtjbGFzaC5lbGVtZW50Qi5tb2RlbE5hbWV9ICgke2NsYXNoLmVsZW1lbnRCLmlmY1R5cGV9KTwvZGl2PlxyXG4gICAgYDtcclxuICB9XHJcblxyXG4gIGxvYWRDbGFzaENvbW1lbnRzKGNsYXNoLmlkKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZENsYXNoQ29tbWVudHMoY2xhc2hJZCkge1xyXG4gIGlmICghZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0pIHJldHVybjtcclxuICBlbHMuY2xhc2hDb21tZW50c1N0cmVhbS5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5Mb2FkaW5nIGRpc2N1c3Npb25cdTIwMjY8L2Rpdj4nO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoeyBtZXRob2Q6IEFQSS5saXN0X2NsYXNoX2NvbW1lbnRzLCBhcmdzOiB7IGNsYXNoOiBjbGFzaElkIH0gfSk7XHJcbiAgICBjb25zdCBjb21tZW50cyA9IHJlcy5tZXNzYWdlIHx8IFtdO1xyXG4gICAgaWYgKCFjb21tZW50cy5sZW5ndGgpIHtcclxuICAgICAgZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0uaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+Tm8gY29tbWVudHMgeWV0LiBTdGFydCB0aGUgdGVhbSBkaXNjdXNzaW9uIGJlbG93LjwvZGl2Pic7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBlbHMuY2xhc2hDb21tZW50c1N0cmVhbS5pbm5lckhUTUwgPSBjb21tZW50cy5tYXAoYyA9PiBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJ1YmJsZVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWhlYWRlclwiPlxyXG4gICAgICAgICAgPHN0cm9uZz4ke2MudXNlciB8fCAnQWRtaW5pc3RyYXRvcid9PC9zdHJvbmc+XHJcbiAgICAgICAgICA8c3Bhbj4ke2MuY3JlYXRpb24gPyBjLmNyZWF0aW9uLnNsaWNlKDAsIDE2KSA6ICdKdXN0IG5vdyd9PC9zcGFuPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJvZHlcIj4ke2MuY29tbWVudCB8fCAnJ308L2Rpdj5cclxuICAgICAgICAke2Muc25hcHNob3QgPyBgPGltZyBzcmM9XCIke2Muc25hcHNob3R9XCIgY2xhc3M9XCJjbGFzaC1jb21tZW50LXNuYXBzaG90XCIgLz5gIDogJyd9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYCkuam9pbignJyk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0uaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJlbXB0eS1oaW50XCI+RGlzY3Vzc2lvbiB0aHJlYWQgcmVhZHkgZm9yIGNsYXNoIG5vdGVzLjwvZGl2Pic7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwb3N0Q2xhc2hDb21tZW50KCkge1xyXG4gIGlmICghYWN0aXZlQ2xhc2ggfHwgIWVscy5jbGFzaENvbW1lbnRJbnB1dCkgcmV0dXJuO1xyXG4gIGNvbnN0IHRleHQgPSBlbHMuY2xhc2hDb21tZW50SW5wdXQudmFsdWUudHJpbSgpO1xyXG4gIGlmICghdGV4dCkgcmV0dXJuO1xyXG5cclxuICBzZXRTdGF0dXMoJ1Bvc3RpbmcgY29tbWVudFx1MjAyNicpO1xyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgIG1ldGhvZDogQVBJLmFkZF9jbGFzaF9jb21tZW50LFxyXG4gICAgICBhcmdzOiB7IGNsYXNoOiBhY3RpdmVDbGFzaC5pZCwgY29tbWVudDogdGV4dCwgdXNlcjogKHdpbmRvdy5mcmFwcGUgJiYgZnJhcHBlLnNlc3Npb24gJiYgZnJhcHBlLnNlc3Npb24udXNlcikgfHwgJ0FkbWluaXN0cmF0b3InIH0sXHJcbiAgICB9KTtcclxuICAgIGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSA9ICcnO1xyXG4gICAgbG9hZENsYXNoQ29tbWVudHMoYWN0aXZlQ2xhc2guaWQpO1xyXG4gICAgc2V0U3RhdHVzKCdDb21tZW50IHBvc3RlZC4nKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zdCBidWJibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGJ1YmJsZS5jbGFzc05hbWUgPSAnY2xhc2gtY29tbWVudC1idWJibGUnO1xyXG4gICAgYnViYmxlLmlubmVySFRNTCA9IGBcclxuICAgICAgPGRpdiBjbGFzcz1cImNsYXNoLWNvbW1lbnQtaGVhZGVyXCI+XHJcbiAgICAgICAgPHN0cm9uZz4keyh3aW5kb3cuZnJhcHBlICYmIGZyYXBwZS5zZXNzaW9uICYmIGZyYXBwZS5zZXNzaW9uLnVzZXIpIHx8ICdVc2VyJ308L3N0cm9uZz5cclxuICAgICAgICA8c3Bhbj5KdXN0IG5vdzwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJjbGFzaC1jb21tZW50LWJvZHlcIj4ke3RleHR9PC9kaXY+XHJcbiAgICBgO1xyXG4gICAgZWxzLmNsYXNoQ29tbWVudHNTdHJlYW0uYXBwZW5kQ2hpbGQoYnViYmxlKTtcclxuICAgIGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSA9ICcnO1xyXG4gICAgc2V0U3RhdHVzKCdOb3RlIGFkZGVkIHRvIGxvY2FsIHNlc3Npb24uJyk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzYXZlQ2xhc2hUb0VycE5leHQoKSB7XHJcbiAgaWYgKCFhY3RpdmVDbGFzaCkgcmV0dXJuO1xyXG4gIHNob3dMb2FkaW5nKCdTYXZpbmcgY2xhc2ggcmVjb3JkIHRvIEVSUE5leHRcdTIwMjYnLCB0cnVlKTtcclxuICB0cnkge1xyXG4gICAgY29uc3Qgdmlld3BvaW50ID0gZ2VuZXJhdGVCY2ZWaWV3cG9pbnQoY2FtZXJhLCBjb250cm9scywgYWN0aXZlQ2xhc2gsIHtcclxuICAgICAgc25hcHNob3Q6IHJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCdpbWFnZS9wbmcnKSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHtcclxuICAgICAgbWV0aG9kOiBBUEkuY3JlYXRlX2NsYXNoLFxyXG4gICAgICBhcmdzOiB7XHJcbiAgICAgICAgdGl0bGU6IGAke2FjdGl2ZUNsYXNoLmVsZW1lbnRBLmRpc2NpcGxpbmV9ICMke2FjdGl2ZUNsYXNoLmVsZW1lbnRBLmV4cHJlc3NJRH0gXHUwMEQ3ICR7YWN0aXZlQ2xhc2guZWxlbWVudEIuZGlzY2lwbGluZX0gIyR7YWN0aXZlQ2xhc2guZWxlbWVudEIuZXhwcmVzc0lEfWAsXHJcbiAgICAgICAgbW9kZWxfYTogYWN0aXZlQ2xhc2guZWxlbWVudEEubW9kZWxOYW1lLFxyXG4gICAgICAgIGVsZW1lbnRfYV9pZDogYWN0aXZlQ2xhc2guZWxlbWVudEEuZXhwcmVzc0lELFxyXG4gICAgICAgIGRpc2NpcGxpbmVfYTogYWN0aXZlQ2xhc2guZWxlbWVudEEuZGlzY2lwbGluZSxcclxuICAgICAgICBtb2RlbF9iOiBhY3RpdmVDbGFzaC5lbGVtZW50Qi5tb2RlbE5hbWUsXHJcbiAgICAgICAgZWxlbWVudF9iX2lkOiBhY3RpdmVDbGFzaC5lbGVtZW50Qi5leHByZXNzSUQsXHJcbiAgICAgICAgZGlzY2lwbGluZV9iOiBhY3RpdmVDbGFzaC5lbGVtZW50Qi5kaXNjaXBsaW5lLFxyXG4gICAgICAgIGNvbGxpc2lvbl9wb2ludDogSlNPTi5zdHJpbmdpZnkoYWN0aXZlQ2xhc2guY29sbGlzaW9uUG9pbnQpLFxyXG4gICAgICAgIGJvdW5kaW5nX2JveDogSlNPTi5zdHJpbmdpZnkoYWN0aXZlQ2xhc2guYm91bmRpbmdCb3gpLFxyXG4gICAgICAgIHBlbmV0cmF0aW9uX2RlcHRoOiBhY3RpdmVDbGFzaC5wZW5ldHJhdGlvbkRlcHRoLFxyXG4gICAgICAgIGludGVyc2VjdGlvbl92b2x1bWU6IGFjdGl2ZUNsYXNoLmludGVyc2VjdGlvblZvbHVtZSxcclxuICAgICAgICBzZXZlcml0eTogYWN0aXZlQ2xhc2guc2V2ZXJpdHksXHJcbiAgICAgICAgdmlld3BvaW50OiBKU09OLnN0cmluZ2lmeSh2aWV3cG9pbnQpLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICAgIGZyYXBwZS5tc2dwcmludCh7XHJcbiAgICAgIHRpdGxlOiBfXygnQklNIENsYXNoIFNhdmVkJyksXHJcbiAgICAgIG1lc3NhZ2U6IF9fKCdDcmVhdGVkIEJJTSBDbGFzaCByZWNvcmQ6IDxiPnswfTwvYj4nLCBbKHJlcy5tZXNzYWdlICYmIHJlcy5tZXNzYWdlLm5hbWUpIHx8ICdCSU0tQ0xBU0gtTkVXJ10pLFxyXG4gICAgICBpbmRpY2F0b3I6ICdncmVlbicsXHJcbiAgICB9KTtcclxuICAgIHNldFN0YXR1cyhgU2F2ZWQgY2xhc2ggcmVjb3JkICR7KHJlcy5tZXNzYWdlICYmIHJlcy5tZXNzYWdlLm5hbWUpIHx8ICcnfWApO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoe1xyXG4gICAgICB0aXRsZTogX18oJ0ZhaWxlZCB0byBTYXZlIENsYXNoJyksXHJcbiAgICAgIG1lc3NhZ2U6IF9fKCdDb3VsZCBub3Qgc2F2ZSBCSU0gQ2xhc2g6IHswfScsIFtlLm1lc3NhZ2UgfHwgU3RyaW5nKGUpXSksXHJcbiAgICAgIGluZGljYXRvcjogJ3JlZCcsXHJcbiAgICB9KTtcclxuICAgIHNldFN0YXR1cyhgRXJyb3Igc2F2aW5nIGNsYXNoOiAke2UubWVzc2FnZSB8fCBlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBJbnRlcmFjdGl2ZSBCSU0gQk9NIFdpemFyZCBNb2RhbCAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIG9wZW5Cb21XaXphcmRNb2RhbCgpIHtcclxuICBpZiAoIWVscy5ib21Nb2RhbCkgcmV0dXJuO1xyXG4gIGVscy5ib21Nb2RhbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICBjYWxjdWxhdGVBbmRSZW5kZXJCb21Sb2xsdXAoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VCb21XaXphcmRNb2RhbCgpIHtcclxuICBpZiAoIWVscy5ib21Nb2RhbCkgcmV0dXJuO1xyXG4gIGVscy5ib21Nb2RhbC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICBjbGVhclNlbGVjdGlvbigpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjYWxjdWxhdGVBbmRSZW5kZXJCb21Sb2xsdXAoKSB7XHJcbiAgaWYgKCFlbHMuYm9tUm9sbHVwVGJvZHkpIHJldHVybjtcclxuICBlbHMuYm9tUm9sbHVwVGJvZHkuaW5uZXJIVE1MID0gJyc7XHJcblxyXG4gIGNvbnN0IHJvbGx1cHMgPSBuZXcgTWFwKCk7XHJcblxyXG4gIGVsZW1lbnRNZXNoZXMuZm9yRWFjaCgoeyBtZXNoLCBleHByZXNzSUQsIG1vZGVsRG9jTmFtZSwgZGlzY2lwbGluZSB9KSA9PiB7XHJcbiAgICBjb25zdCBlbCA9IGVsZW1lbnRJbmRleC5nZXQoYCR7bW9kZWxEb2NOYW1lfToke2V4cHJlc3NJRH1gKSB8fCBlbGVtZW50SW5kZXguZ2V0KFN0cmluZyhleHByZXNzSUQpKSB8fCBtZXNoLnVzZXJEYXRhLmVsZW1lbnQ7XHJcbiAgICBjb25zdCBpZmNUeXBlID0gKGVsICYmIGVsLmVsZW1lbnRfdHlwZSkgfHwgKG1lc2gudXNlckRhdGEuaWZjVHlwZSA/IGBJRkNfJHttZXNoLnVzZXJEYXRhLmlmY1R5cGV9YCA6ICdJRkNfRUxFTUVOVCcpO1xyXG5cclxuICAgIGlmICghcm9sbHVwcy5oYXMoaWZjVHlwZSkpIHtcclxuICAgICAgbGV0IG1ldHJpY05hbWUgPSAnVm9sdW1lJztcclxuICAgICAgbGV0IHVvbSA9ICdtMyc7XHJcbiAgICAgIGxldCB1bml0UmF0ZSA9IDE4MC4wO1xyXG4gICAgICBsZXQgd2FzdGVQY3QgPSA1O1xyXG4gICAgICBsZXQgaXRlbUNvZGUgPSAnQ09OQy1DMzAtMzcnO1xyXG5cclxuICAgICAgY29uc3QgdHlwZVVwcGVyID0gaWZjVHlwZS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdTTEFCJykpIHtcclxuICAgICAgICBtZXRyaWNOYW1lID0gJ05ldFZvbHVtZSc7IHVvbSA9ICdtMyc7IHVuaXRSYXRlID0gMTk1LjA7IHdhc3RlUGN0ID0gNTsgaXRlbUNvZGUgPSAnQ09OQy1TTEFCLUMzMCc7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdCRUFNJykgfHwgdHlwZVVwcGVyLmluY2x1ZGVzKCdDT0xVTU4nKSkge1xyXG4gICAgICAgIG1ldHJpY05hbWUgPSAnTmV0Vm9sdW1lJzsgdW9tID0gJ20zJzsgdW5pdFJhdGUgPSAyMjAuMDsgd2FzdGVQY3QgPSA1OyBpdGVtQ29kZSA9ICdDT05DLVNUUlVDLUMzNSc7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZVVwcGVyLmluY2x1ZGVzKCdXQUxMJykpIHtcclxuICAgICAgICBtZXRyaWNOYW1lID0gJ05ldFZvbHVtZSc7IHVvbSA9ICdtMyc7IHVuaXRSYXRlID0gMTc1LjA7IHdhc3RlUGN0ID0gNTsgaXRlbUNvZGUgPSAnQ09OQy1XQUxMLVBBTkVMJztcclxuICAgICAgfSBlbHNlIGlmICh0eXBlVXBwZXIuaW5jbHVkZXMoJ0RVQ1QnKSkge1xyXG4gICAgICAgIG1ldHJpY05hbWUgPSAnTGVuZ3RoJzsgdW9tID0gJ20nOyB1bml0UmF0ZSA9IDg1LjA7IHdhc3RlUGN0ID0gMTA7IGl0ZW1Db2RlID0gJ01FUC1EVUNULUdBTFYnO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVVcHBlci5pbmNsdWRlcygnUElQRScpKSB7XHJcbiAgICAgICAgbWV0cmljTmFtZSA9ICdMZW5ndGgnOyB1b20gPSAnbSc7IHVuaXRSYXRlID0gNDUuMDsgd2FzdGVQY3QgPSAxMDsgaXRlbUNvZGUgPSAnTUVQLVBJUEUtQ09QUEVSJztcclxuICAgICAgfSBlbHNlIGlmICh0eXBlVXBwZXIuaW5jbHVkZXMoJ0FJUlRFUk1JTkFMJykgfHwgdHlwZVVwcGVyLmluY2x1ZGVzKCdWQUxWRScpIHx8IHR5cGVVcHBlci5pbmNsdWRlcygnUFVNUCcpKSB7XHJcbiAgICAgICAgbWV0cmljTmFtZSA9ICdDb3VudCc7IHVvbSA9ICdOb3MnOyB1bml0UmF0ZSA9IDEyMC4wOyB3YXN0ZVBjdCA9IDA7IGl0ZW1Db2RlID0gJ01FUC1GSVhUVVJFLVVOSVQnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByb2xsdXBzLnNldChpZmNUeXBlLCB7XHJcbiAgICAgICAgdHlwZTogaWZjVHlwZSxcclxuICAgICAgICBkaXNjaXBsaW5lLFxyXG4gICAgICAgIGNvdW50OiAwLFxyXG4gICAgICAgIG1ldHJpY05hbWUsXHJcbiAgICAgICAgbWV0cmljVmFsdWU6IDAuMCxcclxuICAgICAgICB1b20sXHJcbiAgICAgICAgaXRlbUNvZGUsXHJcbiAgICAgICAgdW5pdFJhdGUsXHJcbiAgICAgICAgd2FzdGVQY3QsXHJcbiAgICAgICAgbWVzaGVzOiBbXSxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgciA9IHJvbGx1cHMuZ2V0KGlmY1R5cGUpO1xyXG4gICAgci5jb3VudCsrO1xyXG4gICAgci5tZXNoZXMucHVzaChtZXNoKTtcclxuXHJcbiAgICBpZiAoZWwgJiYgZWwucXVhbnRpdGllcykge1xyXG4gICAgICBpZiAoci5tZXRyaWNOYW1lID09PSAnTmV0Vm9sdW1lJyAmJiBlbC5xdWFudGl0aWVzLk5ldFZvbHVtZSkge1xyXG4gICAgICAgIHIubWV0cmljVmFsdWUgKz0gcGFyc2VGbG9hdChlbC5xdWFudGl0aWVzLk5ldFZvbHVtZSkgfHwgMC4wO1xyXG4gICAgICB9IGVsc2UgaWYgKHIubWV0cmljTmFtZSA9PT0gJ0xlbmd0aCcgJiYgKGVsLnF1YW50aXRpZXMuTGVuZ3RoIHx8IGVsLnF1YW50aXRpZXMuTm9taW5hbExlbmd0aCkpIHtcclxuICAgICAgICByLm1ldHJpY1ZhbHVlICs9IHBhcnNlRmxvYXQoZWwucXVhbnRpdGllcy5MZW5ndGggfHwgZWwucXVhbnRpdGllcy5Ob21pbmFsTGVuZ3RoKSB8fCAwLjA7XHJcbiAgICAgIH0gZWxzZSBpZiAoci5tZXRyaWNOYW1lID09PSAnR3Jvc3NBcmVhJyAmJiBlbC5xdWFudGl0aWVzLkdyb3NzQXJlYSkge1xyXG4gICAgICAgIHIubWV0cmljVmFsdWUgKz0gcGFyc2VGbG9hdChlbC5xdWFudGl0aWVzLkdyb3NzQXJlYSkgfHwgMC4wO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKG1lc2guZ2VvbWV0cnkpIHtcclxuICAgICAgaWYgKCFtZXNoLmdlb21ldHJ5LmJvdW5kaW5nQm94KSBtZXNoLmdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ0JveCgpO1xyXG4gICAgICBjb25zdCB3b3JsZEJveCA9IG1lc2guZ2VvbWV0cnkuYm91bmRpbmdCb3guY2xvbmUoKS5hcHBseU1hdHJpeDQobWVzaC5tYXRyaXhXb3JsZCk7XHJcbiAgICAgIGNvbnN0IHN6ID0gd29ybGRCb3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKTtcclxuICAgICAgaWYgKHIubWV0cmljTmFtZSA9PT0gJ05ldFZvbHVtZScpIHIubWV0cmljVmFsdWUgKz0gKHN6LnggKiBzei55ICogc3oueik7XHJcbiAgICAgIGVsc2UgaWYgKHIubWV0cmljTmFtZSA9PT0gJ0xlbmd0aCcpIHIubWV0cmljVmFsdWUgKz0gTWF0aC5tYXgoc3oueCwgc3oueSwgc3oueik7XHJcbiAgICAgIGVsc2Ugci5tZXRyaWNWYWx1ZSArPSAxLjA7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGxldCB0b3RhbENvc3QgPSAwLjA7XHJcbiAgbGV0IHRvdGFsTGluZUl0ZW1zID0gcm9sbHVwcy5zaXplO1xyXG5cclxuICByb2xsdXBzLmZvckVhY2goKHJvdykgPT4ge1xyXG4gICAgY29uc3QgZWZmZWN0aXZlUXR5ID0gcm93Lm1ldHJpY1ZhbHVlICogKDEuMCArIChyb3cud2FzdGVQY3QgLyAxMDAuMCkpO1xyXG4gICAgY29uc3QgbGluZVRvdGFsID0gZWZmZWN0aXZlUXR5ICogcm93LnVuaXRSYXRlO1xyXG4gICAgdG90YWxDb3N0ICs9IGxpbmVUb3RhbDtcclxuXHJcbiAgICBjb25zdCB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XHJcbiAgICB0ci5jbGFzc05hbWUgPSAnYm9tLXJvdyc7XHJcbiAgICB0ci5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDx0ZD48c3Ryb25nPiR7cm93LnR5cGV9PC9zdHJvbmc+PC90ZD5cclxuICAgICAgPHRkPjxzcGFuIGNsYXNzPVwiYmltLWJhZGdlXCI+JHtyb3cuZGlzY2lwbGluZX08L3NwYW4+PC90ZD5cclxuICAgICAgPHRkPiR7cm93LmNvdW50fTwvdGQ+XHJcbiAgICAgIDx0ZD4ke3Jvdy5tZXRyaWNWYWx1ZS50b0ZpeGVkKDIpfSAke3Jvdy51b219PC90ZD5cclxuICAgICAgPHRkPjxpbnB1dCB0eXBlPVwibnVtYmVyXCIgY2xhc3M9XCJib20td2FzdGUtaW5wdXRcIiB2YWx1ZT1cIiR7cm93Lndhc3RlUGN0fVwiIG1pbj1cIjBcIiBtYXg9XCI1MFwiIHN0eWxlPVwid2lkdGg6NjBweFwiIC8+JTwvdGQ+XHJcbiAgICAgIDx0ZCBjbGFzcz1cImJvbS1lZmYtcXR5XCI+JHtlZmZlY3RpdmVRdHkudG9GaXhlZCgyKX0gJHtyb3cudW9tfTwvdGQ+XHJcbiAgICAgIDx0ZD48aW5wdXQgY2xhc3M9XCJib20taXRlbS1pbnB1dFwiIHZhbHVlPVwiJHtyb3cuaXRlbUNvZGV9XCIgLz48L3RkPlxyXG4gICAgICA8dGQ+JHtyb3cudW9tfTwvdGQ+XHJcbiAgICAgIDx0ZD4kPGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cImJvbS1yYXRlLWlucHV0XCIgdmFsdWU9XCIke3Jvdy51bml0UmF0ZX1cIiBzdHlsZT1cIndpZHRoOjcwcHhcIiAvPjwvdGQ+XHJcbiAgICAgIDx0ZCBjbGFzcz1cImJvbS1saW5lLXRvdGFsXCIgc3R5bGU9XCJmb250LXdlaWdodDo2MDBcIj4kJHtsaW5lVG90YWwudG9GaXhlZCgyKX08L3RkPlxyXG4gICAgYDtcclxuXHJcbiAgICB0ci5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYm9tLXJvbGx1cC10YWJsZSB0ci5ib20tcm93JykuZm9yRWFjaChyID0+IHIuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0ZWQnKSk7XHJcbiAgICAgIHRyLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XHJcbiAgICAgIGNyb3NzSGlnaGxpZ2h0TWVzaGVzKHJvdy5tZXNoZXMpO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB3YXN0ZUlucHV0ID0gdHIucXVlcnlTZWxlY3RvcignLmJvbS13YXN0ZS1pbnB1dCcpO1xyXG4gICAgY29uc3QgcmF0ZUlucHV0ID0gdHIucXVlcnlTZWxlY3RvcignLmJvbS1yYXRlLWlucHV0Jyk7XHJcbiAgICBjb25zdCBlZmZRdHlFbCA9IHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20tZWZmLXF0eScpO1xyXG4gICAgY29uc3QgbGluZVRvdGFsRWwgPSB0ci5xdWVyeVNlbGVjdG9yKCcuYm9tLWxpbmUtdG90YWwnKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVMaW5lID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCB3ID0gcGFyc2VGbG9hdCh3YXN0ZUlucHV0LnZhbHVlKSB8fCAwO1xyXG4gICAgICBjb25zdCByVmFsID0gcGFyc2VGbG9hdChyYXRlSW5wdXQudmFsdWUpIHx8IDA7XHJcbiAgICAgIGNvbnN0IGVmZiA9IHJvdy5tZXRyaWNWYWx1ZSAqICgxLjAgKyB3IC8gMTAwLjApO1xyXG4gICAgICBjb25zdCB0b3QgPSBlZmYgKiByVmFsO1xyXG4gICAgICBlZmZRdHlFbC50ZXh0Q29udGVudCA9IGAke2VmZi50b0ZpeGVkKDIpfSAke3Jvdy51b219YDtcclxuICAgICAgbGluZVRvdGFsRWwudGV4dENvbnRlbnQgPSBgJCR7dG90LnRvRml4ZWQoMil9YDtcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHdhc3RlSW5wdXQpIHdhc3RlSW5wdXQub25pbnB1dCA9IHVwZGF0ZUxpbmU7XHJcbiAgICBpZiAocmF0ZUlucHV0KSByYXRlSW5wdXQub25pbnB1dCA9IHVwZGF0ZUxpbmU7XHJcblxyXG4gICAgZWxzLmJvbVJvbGx1cFRib2R5LmFwcGVuZENoaWxkKHRyKTtcclxuICB9KTtcclxuXHJcbiAgaWYgKGVscy5ib21TdW1tYXJ5VGV4dCkge1xyXG4gICAgZWxzLmJvbVN1bW1hcnlUZXh0LnRleHRDb250ZW50ID0gYFRvdGFsIExpbmUgSXRlbXM6ICR7dG90YWxMaW5lSXRlbXN9IHwgRXN0aW1hdGVkIFRvdGFsIENvc3Q6ICQke3RvdGFsQ29zdC50b0xvY2FsZVN0cmluZygnZW4tVVMnLCB7IG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMiwgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfWA7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcm9zc0hpZ2hsaWdodE1lc2hlcyh0YXJnZXRNZXNoZXMpIHtcclxuICBjb25zdCB0YXJnZXRTZXQgPSBuZXcgU2V0KHRhcmdldE1lc2hlcyk7XHJcbiAgY29uc3QgdGFyZ2V0Qm94ID0gbmV3IFRIUkVFLkJveDMoKTtcclxuXHJcbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2ggfSkgPT4ge1xyXG4gICAgaWYgKCFtZXNoLnVzZXJEYXRhLm9yaWdNYXRlcmlhbFByb3BzKSB7XHJcbiAgICAgIG1lc2gudXNlckRhdGEub3JpZ01hdGVyaWFsUHJvcHMgPSB7XHJcbiAgICAgICAgdHJhbnNwYXJlbnQ6IG1lc2gubWF0ZXJpYWwudHJhbnNwYXJlbnQsXHJcbiAgICAgICAgb3BhY2l0eTogbWVzaC5tYXRlcmlhbC5vcGFjaXR5LFxyXG4gICAgICAgIGRlcHRoV3JpdGU6IG1lc2gubWF0ZXJpYWwuZGVwdGhXcml0ZSxcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmICh0YXJnZXRTZXQuaGFzKG1lc2gpKSB7XHJcbiAgICAgIGlmICghbWVzaC51c2VyRGF0YS5vcmlnQ29sb3IpIG1lc2gudXNlckRhdGEub3JpZ0NvbG9yID0gbWVzaC5tYXRlcmlhbC5jb2xvci5jbG9uZSgpO1xyXG4gICAgICBtZXNoLm1hdGVyaWFsLmNvbG9yLnNldEhleCgweDM4YmRmOCk7XHJcbiAgICAgIGlmIChtZXNoLm1hdGVyaWFsLmVtaXNzaXZlKSBtZXNoLm1hdGVyaWFsLmVtaXNzaXZlLnNldEhleCgweDAzNjlhMSk7XHJcbiAgICAgIG1lc2gubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBmYWxzZTtcclxuICAgICAgbWVzaC5tYXRlcmlhbC5vcGFjaXR5ID0gMS4wO1xyXG4gICAgICBpZiAobWVzaC5nZW9tZXRyeSkge1xyXG4gICAgICAgIGlmICghbWVzaC5nZW9tZXRyeS5ib3VuZGluZ0JveCkgbWVzaC5nZW9tZXRyeS5jb21wdXRlQm91bmRpbmdCb3goKTtcclxuICAgICAgICB0YXJnZXRCb3gudW5pb24obWVzaC5nZW9tZXRyeS5ib3VuZGluZ0JveC5jbG9uZSgpLmFwcGx5TWF0cml4NChtZXNoLm1hdHJpeFdvcmxkKSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChtZXNoLnVzZXJEYXRhLm9yaWdDb2xvcikgbWVzaC5tYXRlcmlhbC5jb2xvci5jb3B5KG1lc2gudXNlckRhdGEub3JpZ0NvbG9yKTtcclxuICAgICAgaWYgKG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUpIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmUuc2V0SGV4KDB4MDAwMDAwKTtcclxuICAgICAgbWVzaC5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XHJcbiAgICAgIG1lc2gubWF0ZXJpYWwub3BhY2l0eSA9IDAuMTI7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGlmICghdGFyZ2V0Qm94LmlzRW1wdHkoKSkge1xyXG4gICAgY29uc3QgY2VudGVyID0gdGFyZ2V0Qm94LmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcclxuICAgIGNvbnN0IHNpemUgPSB0YXJnZXRCb3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKS5sZW5ndGgoKTtcclxuICAgIGNhbWVyYS5wb3NpdGlvbi5jb3B5KGNlbnRlcikuYWRkKG5ldyBUSFJFRS5WZWN0b3IzKHNpemUgKiAwLjcsIHNpemUgKiAwLjUsIHNpemUgKiAwLjcpKTtcclxuICAgIGNvbnRyb2xzLnRhcmdldC5jb3B5KGNlbnRlcik7XHJcbiAgICBjb250cm9scy51cGRhdGUoKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRXJwTmV4dEJvbSgpIHtcclxuICBjb25zdCBwYXJlbnRJdGVtID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib20tcGFyZW50LWl0ZW0nKSB8fCB7fSkudmFsdWUgfHwgJ0JMRC1OT1JESUMtQ09OQy0wMSc7XHJcbiAgY29uc3QgYm9tVGl0bGUgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JvbS10aXRsZScpIHx8IHt9KS52YWx1ZSB8fCAnQklNIEdlbmVyYXRlZCBCT00nO1xyXG5cclxuICBzaG93TG9hZGluZygnR2VuZXJhdGluZyBFUlBOZXh0IEJPTSBkb2N1bWVudFx1MjAyNicsIHRydWUpO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBpdGVtcyA9IFtdO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2JvbS1yb2xsdXAtdGJvZHkgdHIuYm9tLXJvdycpLmZvckVhY2godHIgPT4ge1xyXG4gICAgICBjb25zdCB0eXBlID0gKHRyLnF1ZXJ5U2VsZWN0b3IoJ3RkIHN0cm9uZycpIHx8IHt9KS50ZXh0Q29udGVudCB8fCAnJztcclxuICAgICAgY29uc3QgaXRlbUNvZGUgPSAodHIucXVlcnlTZWxlY3RvcignLmJvbS1pdGVtLWlucHV0JykgfHwge30pLnZhbHVlIHx8ICcnO1xyXG4gICAgICBjb25zdCBlZmZRdHlTdHIgPSAodHIucXVlcnlTZWxlY3RvcignLmJvbS1lZmYtcXR5JykgfHwge30pLnRleHRDb250ZW50IHx8ICcwJztcclxuICAgICAgY29uc3QgcGFyc2VkUXR5ID0gcGFyc2VGbG9hdChlZmZRdHlTdHIpO1xyXG4gICAgICBjb25zdCBlZmZRdHkgPSBOdW1iZXIuaXNGaW5pdGUocGFyc2VkUXR5KSA/IHBhcnNlZFF0eSA6IDA7XHJcbiAgICAgIGlmIChlZmZRdHkgPD0gMCkgcmV0dXJuOyAvLyBTa2lwIHplcm8gb3IgaW52YWxpZCBxdWFudGl0eSBpdGVtc1xyXG4gICAgICBjb25zdCByYXRlU3RyID0gKHRyLnF1ZXJ5U2VsZWN0b3IoJy5ib20tcmF0ZS1pbnB1dCcpIHx8IHt9KS52YWx1ZSB8fCAnMCc7XHJcbiAgICAgIGNvbnN0IHJhdGUgPSBwYXJzZUZsb2F0KHJhdGVTdHIpIHx8IDA7XHJcblxyXG4gICAgICBpdGVtcy5wdXNoKHsgaXRlbV9jb2RlOiBpdGVtQ29kZSwgcXR5OiBlZmZRdHksIHJhdGUsIGlmY190eXBlOiB0eXBlIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICBtZXRob2Q6IEFQSS5nZW5lcmF0ZV9ib21fZnJvbV9iaW0sXHJcbiAgICAgIGFyZ3M6IHtcclxuICAgICAgICBpdGVtOiBwYXJlbnRJdGVtLFxyXG4gICAgICAgIGJvbV90aXRsZTogYm9tVGl0bGUsXHJcbiAgICAgICAgaXRlbXM6IEpTT04uc3RyaW5naWZ5KGl0ZW1zKSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICBjbG9zZUJvbVdpemFyZE1vZGFsKCk7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoe1xyXG4gICAgICB0aXRsZTogX18oJ0JPTSBHZW5lcmF0ZWQgU3VjY2Vzc2Z1bGx5JyksXHJcbiAgICAgIG1lc3NhZ2U6IF9fKCdDcmVhdGVkIEVSUE5leHQgQk9NOiA8Yj57MH08L2I+IHdpdGggezF9IGxpbmUgaXRlbXMuJywgWyhyZXMubWVzc2FnZSAmJiByZXMubWVzc2FnZS5uYW1lKSB8fCAnQk9NLScgKyBwYXJlbnRJdGVtLCBpdGVtcy5sZW5ndGhdKSxcclxuICAgICAgaW5kaWNhdG9yOiAnZ3JlZW4nLFxyXG4gICAgfSk7XHJcbiAgICBzZXRTdGF0dXMoYEdlbmVyYXRlZCBFUlBOZXh0IEJPTSBmb3IgJHtwYXJlbnRJdGVtfWApO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICBmcmFwcGUubXNncHJpbnQoe1xyXG4gICAgICB0aXRsZTogX18oJ0ZhaWxlZCB0byBHZW5lcmF0ZSBCT00nKSxcclxuICAgICAgbWVzc2FnZTogX18oJ0Vycm9yIGdlbmVyYXRpbmcgRVJQTmV4dCBCT006IHswfScsIFtlLm1lc3NhZ2UgfHwgU3RyaW5nKGUpXSksXHJcbiAgICAgIGluZGljYXRvcjogJ3JlZCcsXHJcbiAgICB9KTtcclxuICAgIHNldFN0YXR1cyhgQk9NIGdlbmVyYXRpb24gZmFpbGVkOiAke2UubWVzc2FnZSB8fCBlfWApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBIVUQgJiBUb29scyBIYW5kbGVycyAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIHNldFRvb2wodG9vbCkge1xyXG4gIGFjdGl2ZVRvb2wgPSB0b29sO1xyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNiaW0taHVkIGJ1dHRvbicpLmZvckVhY2goYiA9PiBiLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIGIuaWQgPT09ICd0b29sLScgKyB0b29sKSk7XHJcbiAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5jdXJzb3IgPSB0b29sID09PSAnbWVhc3VyZScgPyAnY3Jvc3NoYWlyJyA6ICdkZWZhdWx0JztcclxufVxyXG5cclxubGV0IHBvaW50ZXJEb3duUG9zID0geyB4OiAwLCB5OiAwIH07XHJcbmVscy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBldiA9PiB7XHJcbiAgcG9pbnRlckRvd25Qb3MgPSB7IHg6IGV2LmNsaWVudFgsIHk6IGV2LmNsaWVudFkgfTtcclxufSk7XHJcblxyXG5lbHMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2KSA9PiB7XHJcbiAgaWYgKGFjdGl2ZVRvb2wgPT09ICdtZWFzdXJlJykgeyBtZWFzdXJlQ2xpY2soZXYpOyByZXR1cm47IH1cclxuICBjb25zdCBkaXN0ID0gTWF0aC5oeXBvdChldi5jbGllbnRYIC0gcG9pbnRlckRvd25Qb3MueCwgZXYuY2xpZW50WSAtIHBvaW50ZXJEb3duUG9zLnkpO1xyXG4gIGlmIChkaXN0ID4gNikgcmV0dXJuO1xyXG5cclxuICBpZiAoYWN0aXZlVG9vbCAhPT0gJ3NlbGVjdCcgJiYgYWN0aXZlVG9vbCAhPT0gJ29yYml0JykgcmV0dXJuO1xyXG5cclxuICBjb25zdCByZWN0ID0gZWxzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICBjb25zdCBtb3VzZSA9IG5ldyBUSFJFRS5WZWN0b3IyKFxyXG4gICAgKChldi5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHJlY3Qud2lkdGgpICogMiAtIDEsXHJcbiAgICAtKChldi5jbGllbnRZIC0gcmVjdC50b3ApIC8gcmVjdC5oZWlnaHQpICogMiArIDFcclxuICApO1xyXG4gIGNvbnN0IHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcclxuICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShtb3VzZSwgY2FtZXJhKTtcclxuXHJcbiAgY29uc3QgbWVzaGVzID0gW107XHJcbiAgZmVkZXJhdGVkR3JvdXAudHJhdmVyc2UobyA9PiB7IGlmIChvLmlzTWVzaCAmJiBvLnZpc2libGUpIG1lc2hlcy5wdXNoKG8pOyB9KTtcclxuICBjb25zdCBoaXRzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMobWVzaGVzLCBmYWxzZSk7XHJcblxyXG4gIGlmIChoaXRzLmxlbmd0aCkge1xyXG4gICAgY29uc3QgaGl0ID0gaGl0c1swXTtcclxuICAgIGNvbnN0IGV4cHIgPSBoaXQub2JqZWN0LnVzZXJEYXRhLmV4cHJlc3NJRCB8fCBnZXRFeHByZXNzSWRBdChoaXQub2JqZWN0Lmdlb21ldHJ5LCBoaXQuZmFjZSA/IGhpdC5mYWNlLmEgOiB1bmRlZmluZWQpO1xyXG4gICAgY29uc3QgbW9kZWxEb2MgPSBoaXQub2JqZWN0LnVzZXJEYXRhLm1vZGVsRG9jTmFtZSB8fCAnJztcclxuICAgIGF3YWl0IHNlbGVjdEVsZW1lbnQoaGl0Lm9iamVjdCwgZXhwciwgbW9kZWxEb2MpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjbGVhclNlbGVjdGlvbigpO1xyXG4gIH1cclxufSk7XHJcblxyXG5mdW5jdGlvbiBnZXRFeHByZXNzSWRBdChnZW9tZXRyeSwgZmFjZUluZGV4KSB7XHJcbiAgY29uc3QgYXR0ciA9IGdlb21ldHJ5ICYmIGdlb21ldHJ5LmF0dHJpYnV0ZXMgJiYgZ2VvbWV0cnkuYXR0cmlidXRlcy5leHByZXNzSUQ7XHJcbiAgaWYgKCFhdHRyIHx8IGZhY2VJbmRleCA9PT0gdW5kZWZpbmVkIHx8IGZhY2VJbmRleCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgcmV0dXJuIGF0dHIuZ2V0WChNYXRoLm1pbihmYWNlSW5kZXgsIGF0dHIuY291bnQgLSAxKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpdFZpZXcoKSB7XHJcbiAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKS5zZXRGcm9tT2JqZWN0KGZlZGVyYXRlZEdyb3VwKTtcclxuICBpZiAoYm94LmlzRW1wdHkoKSkgcmV0dXJuO1xyXG4gIGNvbnN0IHNwaGVyZSA9IGJveC5nZXRCb3VuZGluZ1NwaGVyZShuZXcgVEhSRUUuU3BoZXJlKCkpO1xyXG4gIGNvbnN0IHNpemUgPSBib3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKS5sZW5ndGgoKTtcclxuICBjYW1lcmEucG9zaXRpb24uY29weShzcGhlcmUuY2VudGVyKS5hZGQobmV3IFRIUkVFLlZlY3RvcjMoc2l6ZSAqIDAuNywgc2l6ZSAqIDAuNSwgc2l6ZSAqIDAuNykpO1xyXG4gIGNvbnRyb2xzLnRhcmdldC5jb3B5KHNwaGVyZS5jZW50ZXIpO1xyXG4gIGNvbnRyb2xzLnVwZGF0ZSgpO1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tIE1lYXN1cmUgVG9vbCAtLS0tLS0tLS0tLS0tLS0tXHJcbmxldCBtZWFzdXJlUG9pbnRzID0gW107XHJcbmNvbnN0IG1lYXN1cmVMaW5lID0gbmV3IFRIUkVFLkxpbmUoXHJcbiAgbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCksXHJcbiAgbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4MzhiZGY4LCBsaW5ld2lkdGg6IDIgfSlcclxuKTtcclxuc2NlbmUuYWRkKG1lYXN1cmVMaW5lKTtcclxuXHJcbmZ1bmN0aW9uIG1lYXN1cmVDbGljayhldikge1xyXG4gIGNvbnN0IHJlY3QgPSBlbHMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gIGNvbnN0IG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoXHJcbiAgICAoKGV2LmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aCkgKiAyIC0gMSxcclxuICAgIC0oKGV2LmNsaWVudFkgLSByZWN0LnRvcCkgLyByZWN0LmhlaWdodCkgKiAyICsgMVxyXG4gICk7XHJcbiAgY29uc3QgcmF5Y2FzdGVyID0gbmV3IFRIUkVFLlJheWNhc3RlcigpO1xyXG4gIHJheWNhc3Rlci5zZXRGcm9tQ2FtZXJhKG1vdXNlLCBjYW1lcmEpO1xyXG5cclxuICBjb25zdCBtZXNoZXMgPSBbXTtcclxuICBmZWRlcmF0ZWRHcm91cC50cmF2ZXJzZShvID0+IHsgaWYgKG8uaXNNZXNoKSBtZXNoZXMucHVzaChvKTsgfSk7XHJcbiAgY29uc3QgaGl0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3RzKG1lc2hlcywgZmFsc2UpO1xyXG5cclxuICBpZiAoaGl0cy5sZW5ndGgpIHtcclxuICAgIGNvbnN0IHB0ID0gaGl0c1swXS5wb2ludDtcclxuICAgIG1lYXN1cmVQb2ludHMucHVzaChwdCk7XHJcbiAgICBpZiAobWVhc3VyZVBvaW50cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgY29uc3QgZGlzdCA9IG1lYXN1cmVQb2ludHNbMF0uZGlzdGFuY2VUbyhtZWFzdXJlUG9pbnRzWzFdKTtcclxuICAgICAgbWVhc3VyZUxpbmUuZ2VvbWV0cnkuc2V0RnJvbVBvaW50cyhtZWFzdXJlUG9pbnRzKTtcclxuICAgICAgc2V0U3RhdHVzKGBEaXN0YW5jZTogJHtkaXN0LnRvRml4ZWQoMyl9IG0gKG1vZGVsIHVuaXRzKWApO1xyXG4gICAgICBtZWFzdXJlUG9pbnRzID0gW107XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZXRTdGF0dXMoJ01lYXN1cmU6IGNsaWNrIHNlY29uZCB0YXJnZXQgdmVydGV4L3BvaW50Jyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tIEZpbHRlcnMgJiBGYWNldHMgLS0tLS0tLS0tLS0tLS0tLVxyXG5mdW5jdGlvbiBwb3B1bGF0ZUZhY2V0cygpIHtcclxuICBpZiAoIWVscy5mRGlzY2lwbGluZSB8fCAhZWxzLmZTdG9yZXkgfHwgIWVscy5mVHlwZSkgcmV0dXJuO1xyXG4gIGNvbnN0IGRpc2NpcGxpbmVzID0gbmV3IFNldCgpO1xyXG4gIGNvbnN0IHN0b3JleXMgPSBuZXcgU2V0KCk7XHJcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0KCk7XHJcblxyXG4gIGxvYWRlZE1vZGVscy5mb3JFYWNoKG0gPT4ge1xyXG4gICAgZGlzY2lwbGluZXMuYWRkKG0uZGlzY2lwbGluZSk7XHJcbiAgICAobS5lbGVtZW50cyB8fCBbXSkuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgIGlmIChlbC5zdG9yZXkpIHN0b3JleXMuYWRkKGVsLnN0b3JleSk7XHJcbiAgICAgIGlmIChlbC5lbGVtZW50X3R5cGUpIHR5cGVzLmFkZChlbC5lbGVtZW50X3R5cGUpO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIGVscy5mRGlzY2lwbGluZS5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cIlwiPkRpc2NpcGxpbmU6IGFsbDwvb3B0aW9uPic7XHJcbiAgZGlzY2lwbGluZXMuZm9yRWFjaChkID0+IHtcclxuICAgIGNvbnN0IG8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTsgby52YWx1ZSA9IGQ7IG8udGV4dENvbnRlbnQgPSBkOyBlbHMuZkRpc2NpcGxpbmUuYXBwZW5kQ2hpbGQobyk7XHJcbiAgfSk7XHJcblxyXG4gIGVscy5mU3RvcmV5LmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+U3RvcmV5OiBhbGw8L29wdGlvbj4nO1xyXG4gIHN0b3JleXMuZm9yRWFjaChzID0+IHtcclxuICAgIGNvbnN0IG8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTsgby52YWx1ZSA9IHM7IG8udGV4dENvbnRlbnQgPSBzOyBlbHMuZlN0b3JleS5hcHBlbmRDaGlsZChvKTtcclxuICB9KTtcclxuXHJcbiAgZWxzLmZUeXBlLmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiXCI+VHlwZTogYWxsPC9vcHRpb24+JztcclxuICB0eXBlcy5mb3JFYWNoKHQgPT4ge1xyXG4gICAgY29uc3QgbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpOyBvLnZhbHVlID0gdDsgby50ZXh0Q29udGVudCA9IHQ7IGVscy5mVHlwZS5hcHBlbmRDaGlsZChvKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlGaWx0ZXJzKCkge1xyXG4gIGNvbnN0IGZEaXNjID0gZWxzLmZEaXNjaXBsaW5lID8gZWxzLmZEaXNjaXBsaW5lLnZhbHVlIDogJyc7XHJcbiAgY29uc3QgZlN0b3JleSA9IGVscy5mU3RvcmV5ID8gZWxzLmZTdG9yZXkudmFsdWUgOiAnJztcclxuICBjb25zdCBmVHlwZSA9IGVscy5mVHlwZSA/IGVscy5mVHlwZS52YWx1ZSA6ICcnO1xyXG4gIGNvbnN0IGZTZWFyY2ggPSAoZWxzLmZTZWFyY2ggPyBlbHMuZlNlYXJjaC52YWx1ZSA6ICcnKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcclxuXHJcbiAgbGV0IHZpc2libGVDb3VudCA9IDA7XHJcbiAgZWxlbWVudE1lc2hlcy5mb3JFYWNoKCh7IG1lc2gsIGV4cHJlc3NJRCwgbW9kZWxEb2NOYW1lLCBkaXNjaXBsaW5lIH0pID0+IHtcclxuICAgIGNvbnN0IGVsID0gZWxlbWVudEluZGV4LmdldChgJHttb2RlbERvY05hbWV9OiR7ZXhwcmVzc0lEfWApIHx8IGVsZW1lbnRJbmRleC5nZXQoU3RyaW5nKGV4cHJlc3NJRCkpIHx8IG1lc2gudXNlckRhdGEuZWxlbWVudDtcclxuICAgIGxldCBtYXRjaCA9IHRydWU7XHJcblxyXG4gICAgaWYgKGZEaXNjICYmICFkaXNjaXBsaW5lTWF0Y2hlcyhkaXNjaXBsaW5lLCBmRGlzYykpIG1hdGNoID0gZmFsc2U7XHJcbiAgICBpZiAoZlN0b3JleSAmJiBlbCAmJiBlbC5zdG9yZXkgIT09IGZTdG9yZXkpIG1hdGNoID0gZmFsc2U7XHJcbiAgICBpZiAoZlR5cGUgJiYgZWwgJiYgZWwuZWxlbWVudF90eXBlICE9PSBmVHlwZSkgbWF0Y2ggPSBmYWxzZTtcclxuICAgIGlmIChmU2VhcmNoKSB7XHJcbiAgICAgIGNvbnN0IHNlYXJjaFRhcmdldCA9IGAkeyhlbCAmJiBlbC50aXRsZSkgfHwgJyd9ICR7KGVsICYmIGVsLmVsZW1lbnRfdHlwZSkgfHwgJyd9ICR7ZXhwcmVzc0lEfSAkeyhlbCAmJiBlbC5zdGFibGVfaWQpIHx8ICcnfWAudG9Mb3dlckNhc2UoKTtcclxuICAgICAgaWYgKCFzZWFyY2hUYXJnZXQuaW5jbHVkZXMoZlNlYXJjaCkpIG1hdGNoID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbWVzaC52aXNpYmxlID0gbWF0Y2g7XHJcbiAgICBpZiAobWF0Y2gpIHZpc2libGVDb3VudCsrO1xyXG4gIH0pO1xyXG5cclxuICBzZXRTdGF0dXMoYCR7dmlzaWJsZUNvdW50fSBlbGVtZW50cyBtYXRjaGluZyBmaWx0ZXJzYCk7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gVmlld3BvaW50cyAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIHNhdmVDdXJyZW50Vmlld3BvaW50KCkge1xyXG4gIGNvbnN0IG5hbWUgPSAoZWxzLnZwTmFtZSAmJiBlbHMudnBOYW1lLnZhbHVlLnRyaW0oKSkgfHwgJ1ZpZXcgJyArIG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCk7XHJcbiAgY29uc3QgdnBEYXRhID0ge1xyXG4gICAgcG9zaXRpb246IHsgeDogY2FtZXJhLnBvc2l0aW9uLngsIHk6IGNhbWVyYS5wb3NpdGlvbi55LCB6OiBjYW1lcmEucG9zaXRpb24ueiB9LFxyXG4gICAgdGFyZ2V0OiB7IHg6IGNvbnRyb2xzLnRhcmdldC54LCB5OiBjb250cm9scy50YXJnZXQueSwgejogY29udHJvbHMudGFyZ2V0LnogfSxcclxuICB9O1xyXG5cclxuICBjb25zdCBkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgZC5jbGFzc05hbWUgPSAnbGluay1yb3cnO1xyXG4gIGQuc3R5bGUuY3NzVGV4dCA9ICdkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyO3BhZGRpbmc6NHB4IDA7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2YxZjVmOTtmb250LXNpemU6MTJweCc7XHJcbiAgZC5pbm5lckhUTUwgPSBgPHNwYW4gc3R5bGU9XCJjdXJzb3I6cG9pbnRlclwiPlx1RDgzRFx1RENGNyAke25hbWV9PC9zcGFuPjxidXR0b24gY2xhc3M9XCJkZWxcIiBzdHlsZT1cImNvbG9yOiNlZjQ0NDQ7Ym9yZGVyOm5vbmU7YmFja2dyb3VuZDpub25lO2N1cnNvcjpwb2ludGVyXCI+XHUyNzE1PC9idXR0b24+YDtcclxuICBcclxuICBkLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgY2FtZXJhLnBvc2l0aW9uLnNldCh2cERhdGEucG9zaXRpb24ueCwgdnBEYXRhLnBvc2l0aW9uLnksIHZwRGF0YS5wb3NpdGlvbi56KTtcclxuICAgIGNvbnRyb2xzLnRhcmdldC5zZXQodnBEYXRhLnRhcmdldC54LCB2cERhdGEudGFyZ2V0LnksIHZwRGF0YS50YXJnZXQueik7XHJcbiAgICBjb250cm9scy51cGRhdGUoKTtcclxuICAgIHNldFN0YXR1cygnUmVzdG9yZWQgdmlld3BvaW50ICcgKyBuYW1lKTtcclxuICB9O1xyXG4gIGQucXVlcnlTZWxlY3RvcignLmRlbCcpLm9uY2xpY2sgPSAoKSA9PiBkLnJlbW92ZSgpO1xyXG5cclxuICBpZiAoZWxzLnZpZXdwb2ludHMucXVlcnlTZWxlY3RvcignLmVtcHR5LWhpbnQnKSkgZWxzLnZpZXdwb2ludHMuaW5uZXJIVE1MID0gJyc7XHJcbiAgZWxzLnZpZXdwb2ludHMuYXBwZW5kQ2hpbGQoZCk7XHJcbiAgaWYgKGVscy52cE5hbWUpIGVscy52cE5hbWUudmFsdWUgPSAnJztcclxuICBzZXRTdGF0dXMoJ1NhdmVkIHZpZXdwb2ludDogJyArIG5hbWUpO1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tIERPTSBFdmVudCBCaW5kaW5nIC0tLS0tLS0tLS0tLS0tLS1cclxuZnVuY3Rpb24gaW5pdFVpRXZlbnRzKCkge1xyXG4gIC8vIFRhYiBzd2l0Y2hlclxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iaW0tdGFiLWJ0bicpLmZvckVhY2goYnRuID0+IHtcclxuICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmltLXRhYi1idG4nKS5mb3JFYWNoKGIgPT4gYi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iaW0tdGFiLWNvbnRlbnQnKS5mb3JFYWNoKGMgPT4gYy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKSk7XHJcbiAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgICAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYnRuLmRhdGFzZXQudGFiKTtcclxuICAgICAgaWYgKHRhcmdldCkgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xyXG4gICAgfTtcclxuICB9KTtcclxuXHJcbiAgLy8gSFVEIGJ1dHRvbnNcclxuICBjb25zdCB0b29sT3JiaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1vcmJpdCcpO1xyXG4gIGNvbnN0IHRvb2xTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbC1zZWxlY3QnKTtcclxuICBjb25zdCB0b29sTWVhc3VyZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLW1lYXN1cmUnKTtcclxuICBjb25zdCB0b29sQ2xpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLWNsaXAnKTtcclxuICBjb25zdCB0b29sQ2xhc2hlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLWNsYXNoZXMnKTtcclxuXHJcbiAgaWYgKHRvb2xPcmJpdCkgdG9vbE9yYml0Lm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdvcmJpdCcpO1xyXG4gIGlmICh0b29sU2VsZWN0KSB0b29sU2VsZWN0Lm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdzZWxlY3QnKTtcclxuICBpZiAodG9vbE1lYXN1cmUpIHRvb2xNZWFzdXJlLm9uY2xpY2sgPSAoKSA9PiBzZXRUb29sKCdtZWFzdXJlJyk7XHJcbiAgaWYgKHRvb2xDbGlwKSB0b29sQ2xpcC5vbmNsaWNrID0gKCkgPT4gc2V0VG9vbCgnY2xpcCcpO1xyXG4gIGlmICh0b29sQ2xhc2hlcykge1xyXG4gICAgdG9vbENsYXNoZXMub25jbGljayA9ICgpID0+IHtcclxuICAgICAgY29uc3QgdGFiQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYi1idG4tY2xhc2hlcycpO1xyXG4gICAgICBpZiAodGFiQnRuKSB0YWJCdG4uY2xpY2soKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBRdWljayB2aWV3IHRvb2xzXHJcbiAgY29uc3QgdFdpcmVmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0LXdpcmVmcmFtZScpO1xyXG4gIGNvbnN0IHRJc28gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndC1pc28nKTtcclxuICBjb25zdCB0VG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3QtdG9wJyk7XHJcbiAgY29uc3QgdEZyb250ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3QtZnJvbnQnKTtcclxuICBjb25zdCBidG5GaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWZpdCcpO1xyXG5cclxuICBpZiAodFdpcmVmcmFtZSkge1xyXG4gICAgdFdpcmVmcmFtZS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICB3aXJlZnJhbWVNb2RlID0gIXdpcmVmcmFtZU1vZGU7XHJcbiAgICAgIGZlZGVyYXRlZEdyb3VwLnRyYXZlcnNlKG8gPT4ge1xyXG4gICAgICAgIGlmIChvLmlzTWVzaCAmJiBvLm1hdGVyaWFsKSBvLm1hdGVyaWFsLndpcmVmcmFtZSA9IHdpcmVmcmFtZU1vZGU7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzZXRTdGF0dXMoYFdpcmVmcmFtZSBtb2RlOiAke3dpcmVmcmFtZU1vZGUgPyAnT04nIDogJ09GRid9YCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgaWYgKGJ0bkZpdCkgYnRuRml0Lm9uY2xpY2sgPSBmaXRWaWV3O1xyXG4gIGlmICh0SXNvKSB0SXNvLm9uY2xpY2sgPSBmaXRWaWV3O1xyXG4gIGlmICh0VG9wKSB7XHJcbiAgICB0VG9wLm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGJveCA9IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdChmZWRlcmF0ZWRHcm91cCk7XHJcbiAgICAgIGNvbnN0IGNlbnRlciA9IGJveC5nZXRDZW50ZXIobmV3IFRIUkVFLlZlY3RvcjMoKSk7XHJcbiAgICAgIGNvbnN0IHNpemUgPSBib3guZ2V0U2l6ZShuZXcgVEhSRUUuVmVjdG9yMygpKS5sZW5ndGgoKTtcclxuICAgICAgY2FtZXJhLnBvc2l0aW9uLnNldChjZW50ZXIueCwgY2VudGVyLnkgKyBzaXplICogMS4zLCBjZW50ZXIueik7XHJcbiAgICAgIGNhbWVyYS51cC5zZXQoMCwgMCwgLTEpO1xyXG4gICAgICBjb250cm9scy50YXJnZXQuY29weShjZW50ZXIpO1xyXG4gICAgICBjb250cm9scy51cGRhdGUoKTtcclxuICAgIH07XHJcbiAgfVxyXG4gIGlmICh0RnJvbnQpIHtcclxuICAgIHRGcm9udC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBib3ggPSBuZXcgVEhSRUUuQm94MygpLnNldEZyb21PYmplY3QoZmVkZXJhdGVkR3JvdXApO1xyXG4gICAgICBjb25zdCBjZW50ZXIgPSBib3guZ2V0Q2VudGVyKG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xyXG4gICAgICBjb25zdCBzaXplID0gYm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSkubGVuZ3RoKCk7XHJcbiAgICAgIGNhbWVyYS5wb3NpdGlvbi5zZXQoY2VudGVyLngsIGNlbnRlci55LCBjZW50ZXIueiArIHNpemUgKiAxLjMpO1xyXG4gICAgICBjYW1lcmEudXAuc2V0KDAsIDEsIDApO1xyXG4gICAgICBjb250cm9scy50YXJnZXQuY29weShjZW50ZXIpO1xyXG4gICAgICBjb250cm9scy51cGRhdGUoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBDbGFzaCBidXR0b25zXHJcbiAgY29uc3QgYnRuUnVuQ2xhc2hlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcnVuLWNsYXNoZXMnKTtcclxuICBpZiAoYnRuUnVuQ2xhc2hlcykgYnRuUnVuQ2xhc2hlcy5vbmNsaWNrID0gZXhlY3V0ZUNsYXNoRGV0ZWN0aW9uO1xyXG5cclxuICBjb25zdCBidG5DbGFzaEJhY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsYXNoLWJhY2snKTtcclxuICBpZiAoYnRuQ2xhc2hCYWNrKSB7XHJcbiAgICBidG5DbGFzaEJhY2sub25jbGljayA9ICgpID0+IHtcclxuICAgICAgaWYgKGVscy5jbGFzaERldGFpbENvbnRhaW5lciAmJiBlbHMuY2xhc2hMaXN0Q29udGFpbmVyKSB7XHJcbiAgICAgICAgZWxzLmNsYXNoRGV0YWlsQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgZWxzLmNsYXNoTGlzdENvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGJ0bkNsYXNoRmx5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbGFzaC1mbHknKTtcclxuICBpZiAoYnRuQ2xhc2hGbHkpIHtcclxuICAgIGJ0bkNsYXNoRmx5Lm9uY2xpY2sgPSAoKSA9PiB7XHJcbiAgICAgIGlmIChhY3RpdmVDbGFzaCkgZmx5VG9DbGFzaChhY3RpdmVDbGFzaCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYnRuUG9zdENsYXNoQ29tbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tcG9zdC1jbGFzaC1jb21tZW50Jyk7XHJcbiAgaWYgKGJ0blBvc3RDbGFzaENvbW1lbnQpIGJ0blBvc3RDbGFzaENvbW1lbnQub25jbGljayA9IHBvc3RDbGFzaENvbW1lbnQ7XHJcblxyXG4gIGNvbnN0IGJ0blNhdmVDbGFzaEVycCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tc2F2ZS1jbGFzaC1lcnAnKTtcclxuICBpZiAoYnRuU2F2ZUNsYXNoRXJwKSBidG5TYXZlQ2xhc2hFcnAub25jbGljayA9IHNhdmVDbGFzaFRvRXJwTmV4dDtcclxuXHJcbiAgLy8gQk9NIFdpemFyZCBidXR0b25zXHJcbiAgY29uc3QgYnRuT3BlbkJvbVdpemFyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tb3Blbi1ib20td2l6YXJkJyk7XHJcbiAgaWYgKGJ0bk9wZW5Cb21XaXphcmQpIGJ0bk9wZW5Cb21XaXphcmQub25jbGljayA9IG9wZW5Cb21XaXphcmRNb2RhbDtcclxuXHJcbiAgY29uc3QgYnRuQ2xvc2VCb21Nb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xvc2UtYm9tLW1vZGFsJyk7XHJcbiAgY29uc3QgYnRuQ2FuY2VsQm9tTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1ib20tbW9kYWwnKTtcclxuICBpZiAoYnRuQ2xvc2VCb21Nb2RhbCkgYnRuQ2xvc2VCb21Nb2RhbC5vbmNsaWNrID0gY2xvc2VCb21XaXphcmRNb2RhbDtcclxuICBpZiAoYnRuQ2FuY2VsQm9tTW9kYWwpIGJ0bkNhbmNlbEJvbU1vZGFsLm9uY2xpY2sgPSBjbG9zZUJvbVdpemFyZE1vZGFsO1xyXG5cclxuICBjb25zdCBidG5HZW5lcmF0ZUVycEJvbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tZ2VuZXJhdGUtZXJwLWJvbScpO1xyXG4gIGlmIChidG5HZW5lcmF0ZUVycEJvbSkgYnRuR2VuZXJhdGVFcnBCb20ub25jbGljayA9IGdlbmVyYXRlRXJwTmV4dEJvbTtcclxuXHJcbiAgLy8gTW9kZWwgYWN0aW9uc1xyXG4gIGlmIChlbHMuYnRuTG9hZFNlbGVjdGVkKSB7XHJcbiAgICBlbHMuYnRuTG9hZFNlbGVjdGVkLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGZvciAoY29uc3QgbSBvZiBhdmFpbGFibGVNb2RlbHMpIHtcclxuICAgICAgICBpZiAoIWxvYWRlZE1vZGVscy5oYXMobS5uYW1lKSkgYXdhaXQgbG9hZE1vZGVsR2VvbWV0cnkobS5uYW1lKTtcclxuICAgICAgfVxyXG4gICAgICByZW5kZXJNb2RlbHNMaXN0KCk7XHJcbiAgICAgIHVwZGF0ZUVsZW1lbnRNZXNoZXNMaXN0KCk7XHJcbiAgICAgIHBvcHVsYXRlRmFjZXRzKCk7XHJcbiAgICAgIGZpdFZpZXcoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBpZiAoZWxzLmJ0bkNsZWFyTW9kZWxzKSB7XHJcbiAgICBlbHMuYnRuQ2xlYXJNb2RlbHMub25jbGljayA9IHVubG9hZEFsbE1vZGVscztcclxuICB9XHJcblxyXG4gIC8vIFVwbG9hZFxyXG4gIGlmIChlbHMudXBsb2FkICYmIGVscy5maWxlSW5wdXQpIHtcclxuICAgIGVscy51cGxvYWQub25jbGljayA9ICgpID0+IGVscy5maWxlSW5wdXQuY2xpY2soKTtcclxuICAgIGVscy5maWxlSW5wdXQub25jaGFuZ2UgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSBlbHMuZmlsZUlucHV0LmZpbGVzWzBdO1xyXG4gICAgICBpZiAoIWZpbGUpIHJldHVybjtcclxuICAgICAgc2hvd0xvYWRpbmcoYFVwbG9hZGluZyAke2ZpbGUubmFtZX1cdTIwMjZgLCB0cnVlKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUsIGZpbGUubmFtZSk7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdpc19wcml2YXRlJywgJzAnKTtcclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2RvY3R5cGUnLCAnQklNIE1vZGVsJyk7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdkb2NuYW1lJywgJ25ldycpO1xyXG4gICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSBhd2FpdCBmZXRjaCgnL2FwaS9tZXRob2QvdXBsb2FkX2ZpbGUnLCB7XHJcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgIGJvZHk6IGZvcm1EYXRhLFxyXG4gICAgICAgICAgaGVhZGVyczogeyAnWC1GcmFwcGUtQ1NSRi1Ub2tlbic6ICh3aW5kb3cuZnJhcHBlICYmIGZyYXBwZS5jc3JmX3Rva2VuKSB8fCAnJyB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghdXBsb2FkUmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKCdVcGxvYWQgZmFpbGVkJyk7XHJcbiAgICAgICAgY29uc3QgdXBsb2FkRGF0YSA9IGF3YWl0IHVwbG9hZFJlc3AuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IGZpbGVVcmwgPSB1cGxvYWREYXRhLm1lc3NhZ2UgJiYgdXBsb2FkRGF0YS5tZXNzYWdlLmZpbGVfdXJsO1xyXG4gICAgICAgIGlmICghZmlsZVVybCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcmV0cmlldmUgZmlsZSBVUkwnKTtcclxuXHJcbiAgICAgICAgbGV0IGRpc2MgPSAnQXJjaGl0ZWN0dXJlJztcclxuICAgICAgICBjb25zdCBuYW1lTG93ZXIgPSBmaWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdzdHJ1YycpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnc3RyJykpIGRpc2MgPSAnU3RydWN0dXJhbCc7XHJcbiAgICAgICAgZWxzZSBpZiAobmFtZUxvd2VyLmluY2x1ZGVzKCdodmFjJykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCdtZXAnKSkgZGlzYyA9ICdNRVAnO1xyXG5cclxuICAgICAgICBzaG93TG9hZGluZygnUGFyc2luZyBJRkNcdTIwMjYnLCB0cnVlKTtcclxuICAgICAgICBjb25zdCBjcmVhdGVSZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgICAgICBtZXRob2Q6IEFQSS5jcmVhdGVfbW9kZWwsXHJcbiAgICAgICAgICBhcmdzOiB7XHJcbiAgICAgICAgICAgIGZpbGVfdXJsOiBmaWxlVXJsLFxyXG4gICAgICAgICAgICBmaWxlX25hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICAgICAgbW9kZWxfbmFtZTogZmlsZS5uYW1lLnJlcGxhY2UoL1xcLmlmYyQvaSwgJycpLFxyXG4gICAgICAgICAgICBkaXNjaXBsaW5lOiBkaXNjLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBhd2FpdCBsb2FkTW9kZWxzTGlzdCgpO1xyXG4gICAgICAgIGF3YWl0IGxvYWRNb2RlbEdlb21ldHJ5KGNyZWF0ZVJlcy5tZXNzYWdlLm5hbWUpO1xyXG4gICAgICAgIHJlbmRlck1vZGVsc0xpc3QoKTtcclxuICAgICAgICB1cGRhdGVFbGVtZW50TWVzaGVzTGlzdCgpO1xyXG4gICAgICAgIGZpdFZpZXcoKTtcclxuICAgICAgICBzZXRTdGF0dXMoYEltcG9ydGVkICR7ZmlsZS5uYW1lfSBzdWNjZXNzZnVsbHlgKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHNldFN0YXR1cygnSW1wb3J0IGZhaWxlZDogJyArIChlLm1lc3NhZ2UgfHwgZSkpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgICAgICAgZWxzLmZpbGVJbnB1dC52YWx1ZSA9ICcnO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLy8gVmlld3BvaW50c1xyXG4gIGNvbnN0IHZwU2F2ZUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2cC1zYXZlJyk7XHJcbiAgaWYgKHZwU2F2ZUJ0bikgdnBTYXZlQnRuLm9uY2xpY2sgPSBzYXZlQ3VycmVudFZpZXdwb2ludDtcclxuXHJcbiAgY29uc3QgYnRuQ2xhc2hTbmFwc2hvdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xhc2gtc25hcHNob3QnKTtcclxuICBpZiAoYnRuQ2xhc2hTbmFwc2hvdCkge1xyXG4gICAgYnRuQ2xhc2hTbmFwc2hvdC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XHJcbiAgICAgIGlmIChlbHMuY2xhc2hDb21tZW50SW5wdXQpIHtcclxuICAgICAgICBlbHMuY2xhc2hDb21tZW50SW5wdXQudmFsdWUgKz0gKGVscy5jbGFzaENvbW1lbnRJbnB1dC52YWx1ZSA/ICdcXG4nIDogJycpICsgYFtCQ0YgVmlld3BvaW50IHNuYXBzaG90IGNhcHR1cmVkIGF0ICR7bmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKX1dYDtcclxuICAgICAgfVxyXG4gICAgICBzZXRTdGF0dXMoJ1NuYXBzaG90IGNhcHR1cmVkIHRvIGNsYXNoIGNvbW1lbnQgYnVmZmVyJyk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYnRuTmxBZGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmwtYWRkJyk7XHJcbiAgaWYgKGJ0bk5sQWRkKSB7XHJcbiAgICBidG5ObEFkZC5vbmNsaWNrID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBpZiAoIWN1cnJlbnRTZWxlY3Rpb24gfHwgIWN1cnJlbnRTZWxlY3Rpb24uZWxlbWVudCkge1xyXG4gICAgICAgIGZyYXBwZS5tc2dwcmludChfXygnUGxlYXNlIHNlbGVjdCBhIEJJTSBlbGVtZW50IGZpcnN0JykpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCB0eXBlU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25sLXR5cGUnKTtcclxuICAgICAgY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25sLW5hbWUnKTtcclxuICAgICAgY29uc3QgdGFyZ2V0VHlwZSA9IHR5cGVTZWxlY3QgPyB0eXBlU2VsZWN0LnZhbHVlIDogJ0l0ZW0nO1xyXG4gICAgICBjb25zdCB0YXJnZXROYW1lID0gbmFtZUlucHV0ID8gbmFtZUlucHV0LnZhbHVlLnRyaW0oKSA6ICcnO1xyXG4gICAgICBpZiAoIXRhcmdldE5hbWUpIHJldHVybjtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgICAgICBtZXRob2Q6IEFQSS5jcmVhdGVfYm9xX2xpbmssXHJcbiAgICAgICAgICBhcmdzOiB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGN1cnJlbnRTZWxlY3Rpb24uZWxlbWVudC5uYW1lIHx8IGN1cnJlbnRTZWxlY3Rpb24uZXhwcmVzc0lELFxyXG4gICAgICAgICAgICB0YXJnZXRfZG9jdHlwZTogdGFyZ2V0VHlwZSxcclxuICAgICAgICAgICAgdGFyZ2V0X25hbWU6IHRhcmdldE5hbWUsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNldFN0YXR1cyhgQ3JlYXRlZCBCT1EgTGluayB0byAke3RhcmdldE5hbWV9YCk7XHJcbiAgICAgICAgaWYgKG5hbWVJbnB1dCkgbmFtZUlucHV0LnZhbHVlID0gJyc7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBzZXRTdGF0dXMoYExpbmsgZXJyb3I6ICR7ZS5tZXNzYWdlIHx8IGV9YCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBGaWx0ZXIgY2hhbmdlIGxpc3RlbmVyc1xyXG4gIGlmIChlbHMuZkRpc2NpcGxpbmUpIGVscy5mRGlzY2lwbGluZS5vbmNoYW5nZSA9IGFwcGx5RmlsdGVycztcclxuICBpZiAoZWxzLmZTdG9yZXkpIGVscy5mU3RvcmV5Lm9uY2hhbmdlID0gYXBwbHlGaWx0ZXJzO1xyXG4gIGlmIChlbHMuZlR5cGUpIGVscy5mVHlwZS5vbmNoYW5nZSA9IGFwcGx5RmlsdGVycztcclxuICBpZiAoZWxzLmZTZWFyY2gpIGVscy5mU2VhcmNoLm9uaW5wdXQgPSBhcHBseUZpbHRlcnM7XHJcbiAgY29uc3QgZkNsZWFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2YtY2xlYXInKTtcclxuICBpZiAoZkNsZWFyKSB7XHJcbiAgICBmQ2xlYXIub25jbGljayA9ICgpID0+IHtcclxuICAgICAgaWYgKGVscy5mRGlzY2lwbGluZSkgZWxzLmZEaXNjaXBsaW5lLnZhbHVlID0gJyc7XHJcbiAgICAgIGlmIChlbHMuZlN0b3JleSkgZWxzLmZTdG9yZXkudmFsdWUgPSAnJztcclxuICAgICAgaWYgKGVscy5mVHlwZSkgZWxzLmZUeXBlLnZhbHVlID0gJyc7XHJcbiAgICAgIGlmIChlbHMuZlNlYXJjaCkgZWxzLmZTZWFyY2gudmFsdWUgPSAnJztcclxuICAgICAgYXBwbHlGaWx0ZXJzKCk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlUm91dGVQYXJhbXMoKSB7XHJcbiAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcclxuICBjb25zdCByb3V0ZU9wdHMgPSAod2luZG93LmZyYXBwZSAmJiBmcmFwcGUucm91dGVfb3B0aW9ucykgfHwge307XHJcbiAgY29uc3QgcHJvamVjdFBhcmFtID0gcm91dGVPcHRzLnByb2plY3QgfHwgcGFyYW1zLmdldCgncHJvamVjdCcpO1xyXG4gIGNvbnN0IG1vZGVsUGFyYW0gPSByb3V0ZU9wdHMubW9kZWwgfHwgcm91dGVPcHRzLm1vZGVscyB8fCBwYXJhbXMuZ2V0KCdtb2RlbHMnKSB8fCBwYXJhbXMuZ2V0KCdtb2RlbCcpO1xyXG4gIGNvbnN0IGNsYXNoUGFyYW0gPSByb3V0ZU9wdHMuY2xhc2ggfHwgcGFyYW1zLmdldCgnY2xhc2gnKTtcclxuICBjb25zdCBlbGVtQSA9IHJvdXRlT3B0cy5lbGVtZW50X2EgfHwgcGFyYW1zLmdldCgnZWxlbWVudF9hJyk7XHJcbiAgY29uc3QgZWxlbUIgPSByb3V0ZU9wdHMuZWxlbWVudF9iIHx8IHBhcmFtcy5nZXQoJ2VsZW1lbnRfYicpO1xyXG5cclxuICBpZiAocHJvamVjdFBhcmFtKSB7XHJcbiAgICBhY3RpdmVQcm9qZWN0ID0gcHJvamVjdFBhcmFtO1xyXG4gIH1cclxuXHJcbiAgaWYgKG1vZGVsUGFyYW0gJiYgbW9kZWxQYXJhbSAhPT0gJ25vbmUnKSB7XHJcbiAgICBjb25zdCBtb2RlbE5hbWVzID0gbW9kZWxQYXJhbS5zcGxpdCgnLCcpLm1hcChzID0+IHMudHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XHJcbiAgICBmb3IgKGNvbnN0IG0gb2YgbW9kZWxOYW1lcykge1xyXG4gICAgICBpZiAoIWxvYWRlZE1vZGVscy5oYXMobSkpIHtcclxuICAgICAgICBhd2FpdCBsb2FkTW9kZWxHZW9tZXRyeShtKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVuZGVyTW9kZWxzTGlzdCgpO1xyXG4gICAgdXBkYXRlRWxlbWVudE1lc2hlc0xpc3QoKTtcclxuICAgIGlmICh0eXBlb2YgcG9wdWxhdGVGYWNldHMgPT09ICdmdW5jdGlvbicpIHBvcHVsYXRlRmFjZXRzKCk7XHJcbiAgICBmaXRWaWV3KCk7XHJcbiAgfSBlbHNlIGlmIChwcm9qZWN0UGFyYW0gJiYgdHlwZW9mIGF2YWlsYWJsZU1vZGVscyAhPT0gJ3VuZGVmaW5lZCcgJiYgYXZhaWxhYmxlTW9kZWxzLmxlbmd0aCkge1xyXG4gICAgY29uc3QgcHJvak1vZGVscyA9IGF2YWlsYWJsZU1vZGVscy5maWx0ZXIobSA9PiBtLnByb2plY3QgPT09IHByb2plY3RQYXJhbSk7XHJcbiAgICBpZiAocHJvak1vZGVscy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAoY29uc3QgbSBvZiBwcm9qTW9kZWxzKSB7XHJcbiAgICAgICAgaWYgKCFsb2FkZWRNb2RlbHMuaGFzKG0ubmFtZSkpIHtcclxuICAgICAgICAgIGF3YWl0IGxvYWRNb2RlbEdlb21ldHJ5KG0ubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJlbmRlck1vZGVsc0xpc3QoKTtcclxuICAgICAgdXBkYXRlRWxlbWVudE1lc2hlc0xpc3QoKTtcclxuICAgICAgaWYgKHR5cGVvZiBwb3B1bGF0ZUZhY2V0cyA9PT0gJ2Z1bmN0aW9uJykgcG9wdWxhdGVGYWNldHMoKTtcclxuICAgICAgZml0VmlldygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGNsYXNoUGFyYW0pIHtcclxuICAgIGNvbnN0IHRhYkNsYXNoZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFiLWJ0bi1jbGFzaGVzJyk7XHJcbiAgICBpZiAodGFiQ2xhc2hlcykgdGFiQ2xhc2hlcy5jbGljaygpO1xyXG4gICAgYXdhaXQgbG9hZEV4aXN0aW5nQ2xhc2hlcygpO1xyXG4gICAgY29uc3QgZm91bmQgPSBkZXRlY3RlZENsYXNoZXMuZmluZChjID0+IGMubmFtZSA9PT0gY2xhc2hQYXJhbSB8fCBjLmlkID09PSBjbGFzaFBhcmFtKTtcclxuICAgIGlmIChmb3VuZCkge1xyXG4gICAgICBzZWxlY3RDbGFzaChmb3VuZCk7XHJcbiAgICAgIGZseVRvQ2xhc2goZm91bmQpO1xyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoZWxlbUEgfHwgZWxlbUIpIHtcclxuICAgIGNvbnN0IG1hdGNoID0gZWxlbWVudE1lc2hlcy5maW5kKGl0ZW0gPT4ge1xyXG4gICAgICBjb25zdCBlbCA9IGVsZW1lbnRJbmRleC5nZXQoYCR7aXRlbS5tb2RlbERvY05hbWV9OiR7aXRlbS5leHByZXNzSUR9YCkgfHwgZWxlbWVudEluZGV4LmdldChTdHJpbmcoaXRlbS5leHByZXNzSUQpKTtcclxuICAgICAgY29uc3Qgc2lkID0gKGVsICYmIGVsLnN0YWJsZV9pZCkgfHwgKGl0ZW0ubWVzaCAmJiBpdGVtLm1lc2gudXNlckRhdGEgJiYgKGl0ZW0ubWVzaC51c2VyRGF0YS5ndWlkIHx8IGl0ZW0ubWVzaC51c2VyRGF0YS5zdGFibGVfaWQpKTtcclxuICAgICAgcmV0dXJuIHNpZCAmJiAoc2lkID09PSBlbGVtQSB8fCBzaWQgPT09IGVsZW1CKTtcclxuICAgIH0pO1xyXG4gICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgIHNlbGVjdEVsZW1lbnQobWF0Y2gubWVzaCwgbWF0Y2guZXhwcmVzc0lELCBtYXRjaC5tb2RlbERvY05hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgbW9kZVBhcmFtID0gcm91dGVPcHRzLm1vZGUgfHwgcGFyYW1zLmdldCgnbW9kZScpO1xyXG4gIGlmIChtb2RlUGFyYW0gPT09ICdjb29yZGluYXRpb24nKSB7XHJcbiAgICBzZXRBcHBNb2RlKCdjb29yZGluYXRpb24nKTtcclxuICB9IGVsc2Uge1xyXG4gICAgc2V0QXBwTW9kZSgnaW5pdGlhdGlvbicpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBQcm9qZWN0IEluaXRpYXRpb24gUGlwZWxpbmUgJiBPcGVuUHJvamVjdCBCSU0gV29ya3NwYWNlIENvbnRyb2xsZXJcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5sZXQgY3VycmVudEFwcE1vZGUgPSAnaW5pdGlhdGlvbic7XHJcbmxldCBjdXJyZW50Vmlld3BvcnRUYWIgPSAnM2QnO1xyXG5sZXQgYWN0aXZlUHJvamVjdCA9IG51bGw7XHJcbmxldCBpbml0aWF0aW9uRGF0YSA9IG51bGw7XHJcbmxldCBzdGFnZWRCb3FGaWxlVXJsID0gbnVsbDtcclxubGV0IGRldGVjdGVkRHJpZnRNb2RlbHMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIHNldEFwcE1vZGUobW9kZSkge1xyXG4gIGN1cnJlbnRBcHBNb2RlID0gbW9kZTtcclxuICBjb25zdCBsZWZ0SW5pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tbGVmdC1pbml0aWF0aW9uJyk7XHJcbiAgY29uc3QgbGVmdENvb3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbS1sZWZ0LWNvb3JkaW5hdGlvbicpO1xyXG4gIGNvbnN0IHJpZ2h0SW5pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tcmlnaHQtaW5pdGlhdGlvbicpO1xyXG4gIGNvbnN0IHJpZ2h0Q29vcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLXJpZ2h0LWNvb3JkaW5hdGlvbicpO1xyXG4gIGNvbnN0IGJ0bk1vZGVJbml0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1tb2RlLWluaXRpYXRpb24nKTtcclxuICBjb25zdCBidG5Nb2RlQ29vcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW1vZGUtY29vcmRpbmF0aW9uJyk7XHJcblxyXG4gIGlmIChtb2RlID09PSAnaW5pdGlhdGlvbicpIHtcclxuICAgIGlmIChsZWZ0SW5pdCkgbGVmdEluaXQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIGlmIChsZWZ0Q29vcmQpIGxlZnRDb29yZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgaWYgKHJpZ2h0SW5pdCkgcmlnaHRJbml0LnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgICBpZiAocmlnaHRDb29yZCkgcmlnaHRDb29yZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgaWYgKGJ0bk1vZGVJbml0KSBidG5Nb2RlSW5pdC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgIGlmIChidG5Nb2RlQ29vcmQpIGJ0bk1vZGVDb29yZC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICAgIGlmIChhY3RpdmVQcm9qZWN0KSByZWZyZXNoSW5pdGlhdGlvblN0YXR1cygpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAobGVmdEluaXQpIGxlZnRJbml0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICBpZiAobGVmdENvb3JkKSBsZWZ0Q29vcmQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIGlmIChyaWdodEluaXQpIHJpZ2h0SW5pdC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgaWYgKHJpZ2h0Q29vcmQpIHJpZ2h0Q29vcmQuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIGlmIChidG5Nb2RlSW5pdCkgYnRuTW9kZUluaXQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XHJcbiAgICBpZiAoYnRuTW9kZUNvb3JkKSBidG5Nb2RlQ29vcmQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRWaWV3cG9ydFRhYih0YWIpIHtcclxuICBjdXJyZW50Vmlld3BvcnRUYWIgPSB0YWI7XHJcbiAgY29uc3QgdnBUYWJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJpbS12cC10YWInKTtcclxuICB2cFRhYnMuZm9yRWFjaCh0ID0+IHtcclxuICAgIGlmICh0LmRhdGFzZXQudnAgPT09IHRhYikgdC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcclxuICAgIGVsc2UgdC5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcclxuICB9KTtcclxuXHJcbiAgY29uc3QgdnAzZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aWV3cG9ydC1jb250YWluZXItM2QnKTtcclxuICBjb25zdCB2cENhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aWV3cG9ydC1jb250YWluZXItY2FkJyk7XHJcbiAgY29uc3QgdnBQZGYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlld3BvcnQtY29udGFpbmVyLXBkZicpO1xyXG5cclxuICBpZiAodnAzZCkgdnAzZC5zdHlsZS5kaXNwbGF5ID0gKHRhYiA9PT0gJzNkJykgPyAnYmxvY2snIDogJ25vbmUnO1xyXG4gIGlmICh2cENhZCkgdnBDYWQuc3R5bGUuZGlzcGxheSA9ICh0YWIgPT09ICdjYWQnKSA/ICdibG9jaycgOiAnbm9uZSc7XHJcbiAgaWYgKHZwUGRmKSB2cFBkZi5zdHlsZS5kaXNwbGF5ID0gKHRhYiA9PT0gJ3BkZicpID8gJ2Jsb2NrJyA6ICdub25lJztcclxuXHJcbiAgaWYgKHRhYiA9PT0gJzNkJykge1xyXG4gICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdyZXNpemUnKSk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWZyZXNoSW5pdGlhdGlvblN0YXR1cygpIHtcclxuICBpZiAoIWFjdGl2ZVByb2plY3QpIHJldHVybjtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICBtZXRob2Q6IEFQSS5nZXRfaW5pdGlhdGlvbl9zdGF0dXMsXHJcbiAgICAgIGFyZ3M6IHsgcHJvamVjdDogYWN0aXZlUHJvamVjdCB9LFxyXG4gICAgfSk7XHJcbiAgICBpZiAoIXJlcyB8fCAhcmVzLm1lc3NhZ2UpIHJldHVybjtcclxuICAgIGluaXRpYXRpb25EYXRhID0gcmVzLm1lc3NhZ2U7XHJcbiAgICByZW5kZXJJbml0aWF0aW9uV29ya3NwYWNlKGluaXRpYXRpb25EYXRhKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggaW5pdGlhdGlvbiBzdGF0dXM6JywgZSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJJbml0aWF0aW9uV29ya3NwYWNlKGRhdGEpIHtcclxuICBjb25zdCByZWFkaW5lc3MgPSBkYXRhLnJlYWRpbmVzcyB8fCB7fTtcclxuICBjb25zdCBnYXRlcyA9IHJlYWRpbmVzcy5nYXRlcyB8fCBbXTtcclxuXHJcbiAgLy8gMS4gVG9wIGJhciB1cGRhdGVzXHJcbiAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tcHJvamVjdC10aXRsZScpO1xyXG4gIGlmICh0aXRsZUVsKSB0aXRsZUVsLnRleHRDb250ZW50ID0gZGF0YS5wcm9qZWN0X25hbWUgfHwgZGF0YS5wcm9qZWN0O1xyXG4gIGNvbnN0IHN0YXR1c0JhZGdlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLXByb2plY3Qtc3RhdHVzLWJhZGdlJyk7XHJcbiAgaWYgKHN0YXR1c0JhZGdlRWwpIHtcclxuICAgIHN0YXR1c0JhZGdlRWwudGV4dENvbnRlbnQgPSBkYXRhLnByb2plY3Rfc3RhdHVzIHx8ICdJbml0aWF0aW5nJztcclxuICAgIHN0YXR1c0JhZGdlRWwuY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSAnICsgKGRhdGEucHJvamVjdF9zdGF0dXMgPT09ICdJbiBQcm9ncmVzcycgPyAnYmFkZ2UtdmFsaWRhdGVkJyA6ICdzdGF0dXMtZHJhZnQnKTtcclxuICB9XHJcblxyXG4gIC8vIDIuIEludGFrZSBUcmVlIEJhZGdlc1xyXG4gIGNvbnN0IGJhZGdlQ29udHJhY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFkZ2UtY29udHJhY3QnKTtcclxuICBpZiAoYmFkZ2VDb250cmFjdCkge1xyXG4gICAgY29uc3QgaGFzQyA9IChkYXRhLmNvbnRyYWN0X2NvdW50ID4gMCB8fCAocmVhZGluZXNzLmNvbnRyYWN0X2Ftb3VudCAmJiByZWFkaW5lc3MuY29udHJhY3RfYW1vdW50ID4gMCkpO1xyXG4gICAgYmFkZ2VDb250cmFjdC50ZXh0Q29udGVudCA9IGhhc0MgPyAnVmFsaWRhdGVkJyA6ICdQZW5kaW5nJztcclxuICAgIGJhZGdlQ29udHJhY3QuY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSAnICsgKGhhc0MgPyAnYmFkZ2UtdmFsaWRhdGVkJyA6ICdiYWRnZS1wZW5kaW5nJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBiYWRnZUNhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWRnZS1jYWQnKTtcclxuICBpZiAoYmFkZ2VDYWQpIHtcclxuICAgIGNvbnN0IGNhZENvdW50ID0gZGF0YS5jYWRfY291bnQgfHwgMDtcclxuICAgIGJhZGdlQ2FkLnRleHRDb250ZW50ID0gYCR7Y2FkQ291bnR9IFNoZWV0c2A7XHJcbiAgICBiYWRnZUNhZC5jbGFzc05hbWUgPSAnYmltLWJhZGdlICcgKyAoY2FkQ291bnQgPiAwID8gJ2JhZGdlLXZhbGlkYXRlZCcgOiAnYmFkZ2UtcGVuZGluZycpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYmFkZ2VNb2RlbHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFkZ2UtbW9kZWxzJyk7XHJcbiAgaWYgKGJhZGdlTW9kZWxzKSB7XHJcbiAgICBjb25zdCBtb2RlbENvdW50ID0gKGRhdGEubW9kZWxzIHx8IFtdKS5sZW5ndGg7XHJcbiAgICBiYWRnZU1vZGVscy50ZXh0Q29udGVudCA9IGAke21vZGVsQ291bnR9IE1vZGVsc2A7XHJcbiAgICBiYWRnZU1vZGVscy5jbGFzc05hbWUgPSAnYmltLWJhZGdlICcgKyAobW9kZWxDb3VudCA+IDAgPyAnYmFkZ2UtdmFsaWRhdGVkJyA6ICdiYWRnZS1wZW5kaW5nJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBiYWRnZUJvcSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYWRnZS1ib3EnKTtcclxuICBpZiAoYmFkZ2VCb3EpIHtcclxuICAgIGNvbnN0IGhhc0IgPSAoZGF0YS5lc3RpbWF0ZXMgJiYgZGF0YS5lc3RpbWF0ZXMubGVuZ3RoID4gMCkgfHwgKHJlYWRpbmVzcy5lc3RpbWF0ZWRfY29zdCAmJiByZWFkaW5lc3MuZXN0aW1hdGVkX2Nvc3QgPiAwKTtcclxuICAgIGJhZGdlQm9xLnRleHRDb250ZW50ID0gaGFzQiA/ICdCYXNlbGluZWQnIDogJ1BlbmRpbmcnO1xyXG4gICAgYmFkZ2VCb3EuY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSAnICsgKGhhc0IgPyAnYmFkZ2UtdmFsaWRhdGVkJyA6ICdiYWRnZS1wZW5kaW5nJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBwcm9ncmVzc0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ludGFrZS1wcm9ncmVzcy1sYWJlbCcpO1xyXG4gIGlmIChwcm9ncmVzc0xhYmVsKSB7XHJcbiAgICBjb25zdCBwYXNzZWRDb3VudCA9IGdhdGVzLmZpbHRlcihnID0+IGcucGFzc2VkKS5sZW5ndGg7XHJcbiAgICBwcm9ncmVzc0xhYmVsLnRleHRDb250ZW50ID0gYCR7cGFzc2VkQ291bnR9LzQgQ29tcGxldGVgO1xyXG4gIH1cclxuXHJcbiAgLy8gMy4gUmVuZGVyIEluaXRpYXRpb24gTG9hZGVkIE1vZGVscyBMaXN0XHJcbiAgY29uc3QgaW5pdE1vZGVsc0xpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmltLWluaXQtbW9kZWxzJyk7XHJcbiAgaWYgKGluaXRNb2RlbHNMaXN0ICYmIGRhdGEubW9kZWxzKSB7XHJcbiAgICBpZiAoIWRhdGEubW9kZWxzLmxlbmd0aCkge1xyXG4gICAgICBpbml0TW9kZWxzTGlzdC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cImVtcHR5LWhpbnRcIj5Ecm9wIElGQyBtb2RlbHMgYWJvdmUgdG8gbG9hZDwvZGl2Pic7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpbml0TW9kZWxzTGlzdC5pbm5lckhUTUwgPSBkYXRhLm1vZGVscy5tYXAobSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNMb2FkZWQgPSBsb2FkZWRNb2RlbHMuaGFzKG0ubmFtZSk7XHJcbiAgICAgICAgcmV0dXJuIGBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJiaW0tbW9kZWwtaXRlbSAke2lzTG9hZGVkID8gJ2FjdGl2ZScgOiAnJ31cIiBkYXRhLW1vZGVsPVwiJHttLm5hbWV9XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RlbC10aXRsZVwiPlxyXG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cImluaXQtbW9kZWwtY2hrXCIgZGF0YS1tb2RlbD1cIiR7bS5uYW1lfVwiICR7aXNMb2FkZWQgPyAnY2hlY2tlZCcgOiAnJ30gc3R5bGU9XCJtYXJnaW46MCA0cHggMCAwXCIgLz5cclxuICAgICAgICAgICAgICA8c3Bhbj4ke20ubW9kZWxfbmFtZSB8fCBtLm5hbWV9PC9zcGFuPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJkaXNjaXBsaW5lLXRhZyB0YWctJHsobS5kaXNjaXBsaW5lIHx8ICdhcmNoJykudG9Mb3dlckNhc2UoKX1cIj4ke20uZGlzY2lwbGluZSB8fCAnQXJjaGl0ZWN0dXJlJ308L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICBgO1xyXG4gICAgICB9KS5qb2luKCcnKTtcclxuXHJcbiAgICAgIGluaXRNb2RlbHNMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5pbml0LW1vZGVsLWNoaycpLmZvckVhY2goY2hrID0+IHtcclxuICAgICAgICBjaGsub25jaGFuZ2UgPSBhc3luYyAoZSkgPT4ge1xyXG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgIGNvbnN0IG1OYW1lID0gY2hrLmRhdGFzZXQubW9kZWw7XHJcbiAgICAgICAgICBpZiAoY2hrLmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgYXdhaXQgbG9hZE1vZGVsR2VvbWV0cnkobU5hbWUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdW5sb2FkTW9kZWwobU5hbWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmVuZGVyTW9kZWxzTGlzdCgpO1xyXG4gICAgICAgICAgdXBkYXRlRWxlbWVudE1lc2hlc0xpc3QoKTtcclxuICAgICAgICAgIGZpdFZpZXcoKTtcclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIDQuIFZlcmlmaWNhdGlvbiBDYXJkc1xyXG4gIC8vIENvbW1lcmNpYWwgQ2FyZFxyXG4gIGNvbnN0IG1ldENvbnRyYWN0QW10ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYy1jb250cmFjdC1hbW91bnQnKTtcclxuICBpZiAobWV0Q29udHJhY3RBbXQpIG1ldENvbnRyYWN0QW10LnRleHRDb250ZW50ID0gYFBIUCAkeyhyZWFkaW5lc3MuY29udHJhY3RfYW1vdW50IHx8IDApLnRvTG9jYWxlU3RyaW5nKHVuZGVmaW5lZCwgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIgfSl9YDtcclxuICBjb25zdCBtZXRDb250cmFjdENudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXRyaWMtY29udHJhY3QtY291bnQnKTtcclxuICBpZiAobWV0Q29udHJhY3RDbnQpIG1ldENvbnRyYWN0Q250LnRleHRDb250ZW50ID0gYCR7ZGF0YS5jb250cmFjdF9jb3VudCB8fCAwfSBGaWxlc2A7XHJcbiAgY29uc3QgYmFkZ2VDb21tID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhcmQtYmFkZ2UtY29tbWVyY2lhbCcpO1xyXG4gIGlmIChiYWRnZUNvbW0pIHtcclxuICAgIGNvbnN0IHBhc3NlZCA9IGdhdGVzWzBdICYmIGdhdGVzWzBdLnBhc3NlZDtcclxuICAgIGJhZGdlQ29tbS50ZXh0Q29udGVudCA9IHBhc3NlZCA/ICdWYWxpZGF0ZWQnIDogJ1BlbmRpbmcnO1xyXG4gICAgYmFkZ2VDb21tLmNsYXNzTmFtZSA9ICdiaW0tYmFkZ2UgJyArIChwYXNzZWQgPyAnYmFkZ2UtdmFsaWRhdGVkJyA6ICdiYWRnZS1wZW5kaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvLyBRdWFudGl0eSBDYXJkXHJcbiAgY29uc3QgbWV0Qm9xQ29zdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXRyaWMtYm9xLWNvc3QnKTtcclxuICBpZiAobWV0Qm9xQ29zdCkgbWV0Qm9xQ29zdC50ZXh0Q29udGVudCA9IGBQSFAgJHsocmVhZGluZXNzLmVzdGltYXRlZF9jb3N0IHx8IDApLnRvTG9jYWxlU3RyaW5nKHVuZGVmaW5lZCwgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIgfSl9YDtcclxuICBjb25zdCBtZXRCb3FMaW5lcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXRyaWMtYm9xLWxpbmVzJyk7XHJcbiAgaWYgKG1ldEJvcUxpbmVzKSBtZXRCb3FMaW5lcy50ZXh0Q29udGVudCA9IGAkeyhkYXRhLmVzdGltYXRlcyAmJiBkYXRhLmVzdGltYXRlc1swXSAmJiBkYXRhLmVzdGltYXRlc1swXS5saW5lX2NvdW50KSB8fCAnU3RhbmRhcmQnfSBJdGVtc2A7XHJcbiAgY29uc3QgYmFkZ2VRdHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FyZC1iYWRnZS1xdWFudGl0eScpO1xyXG4gIGlmIChiYWRnZVF0eSkge1xyXG4gICAgY29uc3QgcGFzc2VkID0gZ2F0ZXNbMl0gJiYgZ2F0ZXNbMl0ucGFzc2VkO1xyXG4gICAgYmFkZ2VRdHkudGV4dENvbnRlbnQgPSBwYXNzZWQgPyAnQmFzZWxpbmVkJyA6ICdQZW5kaW5nJztcclxuICAgIGJhZGdlUXR5LmNsYXNzTmFtZSA9ICdiaW0tYmFkZ2UgJyArIChwYXNzZWQgPyAnYmFkZ2UtdmFsaWRhdGVkJyA6ICdiYWRnZS1wZW5kaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvLyBTcGF0aWFsIENhcmRcclxuICBjb25zdCBtZXRFbGVtQ250ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYy1lbGVtZW50cy1jb3VudCcpO1xyXG4gIGlmIChtZXRFbGVtQ250KSBtZXRFbGVtQ250LnRleHRDb250ZW50ID0gZWxlbWVudE1lc2hlcy5sZW5ndGggfHwgKGRhdGEubW9kZWxzIHx8IFtdKS5yZWR1Y2UoKHN1bSwgbSkgPT4gc3VtICsgKG0uZWxlbWVudHNfY291bnQgfHwgMCksIDApO1xyXG4gIGNvbnN0IG1ldEFsaWduID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYy1hbGlnbi1zdGF0dXMnKTtcclxuICBjb25zdCBiYWRnZVNwYXRpYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FyZC1iYWRnZS1zcGF0aWFsJyk7XHJcbiAgY29uc3QgZHJpZnRBbGVydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYXJkLWRyaWZ0LWFsZXJ0Jyk7XHJcbiAgY29uc3QgYWxpZ25tZW50ID0gZGF0YS5hbGlnbm1lbnQgfHwge307XHJcblxyXG4gIGlmIChhbGlnbm1lbnQuZHJpZnRfZGV0ZWN0ZWQpIHtcclxuICAgIGRldGVjdGVkRHJpZnRNb2RlbHMgPSBhbGlnbm1lbnQuZHJpZnRfbW9kZWxzIHx8IFtdO1xyXG4gICAgaWYgKG1ldEFsaWduKSBtZXRBbGlnbi50ZXh0Q29udGVudCA9IGBEcmlmdDogJHthbGlnbm1lbnQubWF4X2Rpc3RhbmNlfW1gO1xyXG4gICAgaWYgKGJhZGdlU3BhdGlhbCkge1xyXG4gICAgICBiYWRnZVNwYXRpYWwudGV4dENvbnRlbnQgPSAnV2FybmluZyc7XHJcbiAgICAgIGJhZGdlU3BhdGlhbC5jbGFzc05hbWUgPSAnYmltLWJhZGdlIGJhZGdlLXdhcm5pbmcnO1xyXG4gICAgfVxyXG4gICAgaWYgKGRyaWZ0QWxlcnQpIGRyaWZ0QWxlcnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgfSBlbHNlIHtcclxuICAgIGRldGVjdGVkRHJpZnRNb2RlbHMgPSBbXTtcclxuICAgIGlmIChtZXRBbGlnbikgbWV0QWxpZ24udGV4dENvbnRlbnQgPSAnQWxpZ25lZCc7XHJcbiAgICBpZiAoYmFkZ2VTcGF0aWFsKSB7XHJcbiAgICAgIGJhZGdlU3BhdGlhbC50ZXh0Q29udGVudCA9IGAkeyhkYXRhLm1vZGVscyB8fCBbXSkubGVuZ3RofSBBbGlnbmVkYDtcclxuICAgICAgYmFkZ2VTcGF0aWFsLmNsYXNzTmFtZSA9ICdiaW0tYmFkZ2UgYmFkZ2UtdmFsaWRhdGVkJztcclxuICAgIH1cclxuICAgIGlmIChkcmlmdEFsZXJ0KSBkcmlmdEFsZXJ0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgfVxyXG5cclxuICAvLyAyRCBEcmF3aW5ncyBDYXJkXHJcbiAgY29uc3QgbWV0Q2FkQ250ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21ldHJpYy1jYWQtY291bnQnKTtcclxuICBpZiAobWV0Q2FkQ250KSBtZXRDYWRDbnQudGV4dENvbnRlbnQgPSBgJHtkYXRhLmNhZF9jb3VudCB8fCAwfWA7XHJcbiAgY29uc3QgbWV0Q2FkU3RhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZXRyaWMtY2FkLXN0YXR1cycpO1xyXG4gIGlmIChtZXRDYWRTdGF0KSBtZXRDYWRTdGF0LnRleHRDb250ZW50ID0gKGRhdGEuY2FkX2NvdW50ID4gMCkgPyAnQXZhaWxhYmxlJyA6ICdQZW5kaW5nJztcclxuICBjb25zdCBiYWRnZURyYXdpbmdzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhcmQtYmFkZ2UtZHJhd2luZ3MnKTtcclxuICBpZiAoYmFkZ2VEcmF3aW5ncykge1xyXG4gICAgYmFkZ2VEcmF3aW5ncy50ZXh0Q29udGVudCA9IGAke2RhdGEuY2FkX2NvdW50IHx8IDB9IFNoZWV0c2A7XHJcbiAgICBiYWRnZURyYXdpbmdzLmNsYXNzTmFtZSA9ICdiaW0tYmFkZ2UgJyArIChkYXRhLmNhZF9jb3VudCA+IDAgPyAnYmFkZ2UtdmFsaWRhdGVkJyA6ICdiYWRnZS1wZW5kaW5nJyk7XHJcbiAgfVxyXG5cclxuICAvLyBTdGFnZS1HYXRlIENoZWNrbGlzdCBDYXJkXHJcbiAgY29uc3QgZ2F0ZUl0ZW1zID0gW1xyXG4gICAgeyBpZDogJ2dhdGUtaXRlbS1jb250cmFjdCcsIHBhc3NlZDogZ2F0ZXNbMF0gJiYgZ2F0ZXNbMF0ucGFzc2VkIH0sXHJcbiAgICB7IGlkOiAnZ2F0ZS1pdGVtLW1vZGVsJywgcGFzc2VkOiBnYXRlc1sxXSAmJiBnYXRlc1sxXS5wYXNzZWQgfSxcclxuICAgIHsgaWQ6ICdnYXRlLWl0ZW0tYm9xJywgcGFzc2VkOiBnYXRlc1syXSAmJiBnYXRlc1syXS5wYXNzZWQgfSxcclxuICAgIHsgaWQ6ICdnYXRlLWl0ZW0tc2lnbm9mZicsIHBhc3NlZDogcmVhZGluZXNzLmFsbF9yZWFkeSB9LFxyXG4gIF07XHJcblxyXG4gIGdhdGVJdGVtcy5mb3JFYWNoKGcgPT4ge1xyXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChnLmlkKTtcclxuICAgIGlmIChlbCkge1xyXG4gICAgICBpZiAoZy5wYXNzZWQpIHtcclxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdwYXNzZWQnKTtcclxuICAgICAgICBjb25zdCBpY29uID0gZWwucXVlcnlTZWxlY3RvcignLmdhdGUtaWNvbicpO1xyXG4gICAgICAgIGlmIChpY29uKSBpY29uLnRleHRDb250ZW50ID0gJ1x1MjcxMyc7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgncGFzc2VkJyk7XHJcbiAgICAgICAgY29uc3QgaWNvbiA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5nYXRlLWljb24nKTtcclxuICAgICAgICBpZiAoaWNvbikgaWNvbi50ZXh0Q29udGVudCA9ICdcdTI1Q0InO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IGNhcmRCYWRnZUdhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FyZC1iYWRnZS1nYXRlJyk7XHJcbiAgaWYgKGNhcmRCYWRnZUdhdGUpIHtcclxuICAgIGlmIChyZWFkaW5lc3MuYWxsX3JlYWR5KSB7XHJcbiAgICAgIGNhcmRCYWRnZUdhdGUudGV4dENvbnRlbnQgPSAnUmVhZHkgZm9yIEtpY2tvZmYnO1xyXG4gICAgICBjYXJkQmFkZ2VHYXRlLmNsYXNzTmFtZSA9ICdiaW0tYmFkZ2UgYmFkZ2UtdmFsaWRhdGVkJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHJlbWFpbmluZyA9IGdhdGVzLmZpbHRlcihnID0+ICFnLnBhc3NlZCkubGVuZ3RoO1xyXG4gICAgICBjYXJkQmFkZ2VHYXRlLnRleHRDb250ZW50ID0gYCR7cmVtYWluaW5nfSBSZXF1aXJlZGA7XHJcbiAgICAgIGNhcmRCYWRnZUdhdGUuY2xhc3NOYW1lID0gJ2JpbS1iYWRnZSBiYWRnZS1wZW5kaW5nJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IGJ0bkFwcHJvdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtaW5pdGlhdGlvbicpO1xyXG4gIGlmIChidG5BcHByb3ZlKSB7XHJcbiAgICBidG5BcHByb3ZlLmRpc2FibGVkID0gIXJlYWRpbmVzcy5hbGxfcmVhZHk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB1cGxvYWRJbnRha2VGaWxlKGZpbGUsIGNhdGVnb3J5LCBkaXNjaXBsaW5lKSB7XHJcbiAgc2hvd0xvYWRpbmcoYFVwbG9hZGluZyAke2ZpbGUubmFtZX0gdG8gMCR7Y2F0ZWdvcnl9XHUyMDI2YCwgdHJ1ZSk7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlLCBmaWxlLm5hbWUpO1xyXG4gICAgZm9ybURhdGEuYXBwZW5kKCdpc19wcml2YXRlJywgJzAnKTtcclxuICAgIGZvcm1EYXRhLmFwcGVuZCgnZG9jdHlwZScsICdQcm9qZWN0Jyk7XHJcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2RvY25hbWUnLCBhY3RpdmVQcm9qZWN0IHx8ICduZXcnKTtcclxuICAgIGNvbnN0IHVwbG9hZFJlc3AgPSBhd2FpdCBmZXRjaCgnL2FwaS9tZXRob2QvdXBsb2FkX2ZpbGUnLCB7XHJcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICBib2R5OiBmb3JtRGF0YSxcclxuICAgICAgaGVhZGVyczogeyAnWC1GcmFwcGUtQ1NSRi1Ub2tlbic6ICh3aW5kb3cuZnJhcHBlICYmIGZyYXBwZS5jc3JmX3Rva2VuKSB8fCAnJyB9LFxyXG4gICAgfSk7XHJcbiAgICBpZiAoIXVwbG9hZFJlc3Aub2spIHRocm93IG5ldyBFcnJvcignVXBsb2FkIHJlcXVlc3QgZmFpbGVkJyk7XHJcbiAgICBjb25zdCB1cGxvYWREYXRhID0gYXdhaXQgdXBsb2FkUmVzcC5qc29uKCk7XHJcbiAgICBjb25zdCBmaWxlVXJsID0gdXBsb2FkRGF0YS5tZXNzYWdlICYmIHVwbG9hZERhdGEubWVzc2FnZS5maWxlX3VybDtcclxuICAgIGlmICghZmlsZVVybCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gcmV0cmlldmUgZmlsZSBVUkwnKTtcclxuXHJcbiAgICBjb25zdCByb3V0ZVJlcyA9IGF3YWl0IGZyYXBwZS5jYWxsKHtcclxuICAgICAgbWV0aG9kOiBBUEkudXBsb2FkX2ludGFrZV9maWxlLFxyXG4gICAgICBhcmdzOiB7XHJcbiAgICAgICAgcHJvamVjdDogYWN0aXZlUHJvamVjdCxcclxuICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXHJcbiAgICAgICAgZmlsZV91cmw6IGZpbGVVcmwsXHJcbiAgICAgICAgZmlsZW5hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICBkaXNjaXBsaW5lOiBkaXNjaXBsaW5lIHx8ICdBcmNoaXRlY3R1cmUnLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKGNhdGVnb3J5ID09PSAnYm9xJykge1xyXG4gICAgICBzdGFnZWRCb3FGaWxlVXJsID0gZmlsZVVybDtcclxuICAgICAgYXdhaXQgb3BlbkJvcUNvbHVtbk1hcHBpbmdNb2RhbChmaWxlVXJsKTtcclxuICAgIH0gZWxzZSBpZiAoY2F0ZWdvcnkgPT09ICdpZmMnKSB7XHJcbiAgICAgIGNvbnN0IGNyZWF0ZWRNb2RlbCA9IHJvdXRlUmVzLm1lc3NhZ2UgJiYgcm91dGVSZXMubWVzc2FnZS5jcmVhdGVkX3JlY29yZHMgJiYgcm91dGVSZXMubWVzc2FnZS5jcmVhdGVkX3JlY29yZHNbJ0JJTSBNb2RlbCddO1xyXG4gICAgICBpZiAoY3JlYXRlZE1vZGVsKSB7XHJcbiAgICAgICAgYXdhaXQgbG9hZE1vZGVsc0xpc3QoKTtcclxuICAgICAgICBhd2FpdCBsb2FkTW9kZWxHZW9tZXRyeShjcmVhdGVkTW9kZWwpO1xyXG4gICAgICAgIHJlbmRlck1vZGVsc0xpc3QoKTtcclxuICAgICAgICB1cGRhdGVFbGVtZW50TWVzaGVzTGlzdCgpO1xyXG4gICAgICAgIGZpdFZpZXcoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFN0YXR1cyhgRmlsZWQgJHtmaWxlLm5hbWV9IGludG8gJHtyb3V0ZVJlcy5tZXNzYWdlLnJvdXRlZF9mb2xkZXJ9YCk7XHJcbiAgICBhd2FpdCByZWZyZXNoSW5pdGlhdGlvblN0YXR1cygpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHNldFN0YXR1cyhgSW50YWtlIGVycm9yOiAke2UubWVzc2FnZSB8fCBlfWApO1xyXG4gICAgZnJhcHBlLm1zZ3ByaW50KHsgdGl0bGU6IF9fKCdJbnRha2UgRXJyb3InKSwgbWVzc2FnZTogZS5tZXNzYWdlIHx8IGUsIGluZGljYXRvcjogJ3JlZCcgfSk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBvcGVuQm9xQ29sdW1uTWFwcGluZ01vZGFsKGZpbGVVcmwpIHtcclxuICBzaG93TG9hZGluZygnQW5hbHl6aW5nIHNwcmVhZHNoZWV0IGNvbHVtbnNcdTIwMjYnLCB0cnVlKTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICBtZXRob2Q6IEFQSS5wYXJzZV9ib3FfZmlsZSxcclxuICAgICAgYXJnczogeyBmaWxlX3VybDogZmlsZVVybCB9LFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBwYXJzZWQgPSByZXMubWVzc2FnZTtcclxuICAgIGlmICghcGFyc2VkKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYm9xLW1hcHBpbmcnKTtcclxuICAgIGlmICghbW9kYWwpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBoZWFkZXJzID0gcGFyc2VkLmhlYWRlcnMgfHwgW107XHJcbiAgICBjb25zdCBzdWdnZXN0ZWQgPSBwYXJzZWQuc3VnZ2VzdGVkX21hcHBpbmcgfHwge307XHJcblxyXG4gICAgY29uc3Qgc2VsZWN0SWRzID0ge1xyXG4gICAgICAnbWFwLWNvbC1pdGVtLWNvZGUnOiBzdWdnZXN0ZWQuaXRlbV9jb2RlLFxyXG4gICAgICAnbWFwLWNvbC1kZXNjJzogc3VnZ2VzdGVkLmRlc2NyaXB0aW9uLFxyXG4gICAgICAnbWFwLWNvbC11bml0Jzogc3VnZ2VzdGVkLnVuaXQsXHJcbiAgICAgICdtYXAtY29sLXF0eSc6IHN1Z2dlc3RlZC5xdWFudGl0eSxcclxuICAgICAgJ21hcC1jb2wtcmF0ZSc6IHN1Z2dlc3RlZC51bml0X3JhdGUsXHJcbiAgICAgICdtYXAtY29sLXRvdGFsJzogc3VnZ2VzdGVkLnRvdGFsX2Ftb3VudCxcclxuICAgIH07XHJcblxyXG4gICAgT2JqZWN0LmVudHJpZXMoc2VsZWN0SWRzKS5mb3JFYWNoKChbc2VsSWQsIHN1Z2dlc3RlZFZhbF0pID0+IHtcclxuICAgICAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsSWQpO1xyXG4gICAgICBpZiAoIXNlbGVjdCkgcmV0dXJuO1xyXG4gICAgICBzZWxlY3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJcIj4tLSBJZ25vcmUgLyBOb3QgUHJlc2VudCAtLTwvb3B0aW9uPicgK1xyXG4gICAgICAgIGhlYWRlcnMubWFwKGggPT4gYDxvcHRpb24gdmFsdWU9XCIke2h9XCIgJHtoID09PSBzdWdnZXN0ZWRWYWwgPyAnc2VsZWN0ZWQnIDogJyd9PiR7aH08L29wdGlvbj5gKS5qb2luKCcnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHRoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RoZWFkLWJvcS1wcmV2aWV3Jyk7XHJcbiAgICBjb25zdCB0Ym9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0Ym9keS1ib3EtcHJldmlldycpO1xyXG4gICAgaWYgKHRoZWFkKSB7XHJcbiAgICAgIHRoZWFkLmlubmVySFRNTCA9ICc8dHI+JyArIGhlYWRlcnMubWFwKGggPT4gYDx0aD4ke2h9PC90aD5gKS5qb2luKCcnKSArICc8L3RyPic7XHJcbiAgICB9XHJcbiAgICBpZiAodGJvZHkgJiYgcGFyc2VkLnByZXZpZXdfaXRlbXMpIHtcclxuICAgICAgdGJvZHkuaW5uZXJIVE1MID0gcGFyc2VkLnByZXZpZXdfaXRlbXMubWFwKGl0ID0+IGBcclxuICAgICAgICA8dHI+XHJcbiAgICAgICAgICA8dGQ+JHtpdC5pdGVtX2NvZGUgfHwgJyd9PC90ZD5cclxuICAgICAgICAgIDx0ZD4ke2l0LmRlc2NyaXB0aW9uIHx8ICcnfTwvdGQ+XHJcbiAgICAgICAgICA8dGQ+JHtpdC51bml0IHx8ICcnfTwvdGQ+XHJcbiAgICAgICAgICA8dGQ+JHtpdC5xdWFudGl0eSB8fCAnJ308L3RkPlxyXG4gICAgICAgICAgPHRkPiR7KGl0LnVuaXRfcmF0ZSB8fCAwKS50b0xvY2FsZVN0cmluZygpfTwvdGQ+XHJcbiAgICAgICAgICA8dGQ+JHsoaXQudG90YWxfYW1vdW50IHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9PC90ZD5cclxuICAgICAgICA8L3RyPlxyXG4gICAgICBgKS5qb2luKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdW1tYXJ5RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9xLXByZXZpZXctc3VtbWFyeScpO1xyXG4gICAgaWYgKHN1bW1hcnlFbCkge1xyXG4gICAgICBzdW1tYXJ5RWwudGV4dENvbnRlbnQgPSBgVG90YWwgSXRlbXM6ICR7cGFyc2VkLnRvdGFsX2l0ZW1zX2NvdW50fSB8IEVzdGltYXRlZCBUb3RhbDogUEhQICR7KHBhcnNlZC50b3RhbF9hbW91bnQgfHwgMCkudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7IG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xyXG4gICAgfVxyXG5cclxuICAgIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgZnJhcHBlLm1zZ3ByaW50KHsgdGl0bGU6IF9fKCdTcHJlYWRzaGVldCBFcnJvcicpLCBtZXNzYWdlOiBlLm1lc3NhZ2UgfHwgZSwgaW5kaWNhdG9yOiAncmVkJyB9KTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNvbW1pdEJvcU1hcHBpbmcoKSB7XHJcbiAgaWYgKCFzdGFnZWRCb3FGaWxlVXJsKSByZXR1cm47XHJcbiAgY29uc3QgbWFwcGluZyA9IHtcclxuICAgIGl0ZW1fY29kZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1jb2wtaXRlbS1jb2RlJyk/LnZhbHVlIHx8ICcnLFxyXG4gICAgZGVzY3JpcHRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtY29sLWRlc2MnKT8udmFsdWUgfHwgJycsXHJcbiAgICB1bml0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWNvbC11bml0Jyk/LnZhbHVlIHx8ICcnLFxyXG4gICAgcXVhbnRpdHk6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtY29sLXF0eScpPy52YWx1ZSB8fCAnJyxcclxuICAgIHVuaXRfcmF0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1jb2wtcmF0ZScpPy52YWx1ZSB8fCAnJyxcclxuICAgIHRvdGFsX2Ftb3VudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1jb2wtdG90YWwnKT8udmFsdWUgfHwgJycsXHJcbiAgfTtcclxuXHJcbiAgc2hvd0xvYWRpbmcoJ0NyZWF0aW5nIENvbnN0cnVjdGlvbiBFc3RpbWF0ZVx1MjAyNicsIHRydWUpO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgIG1ldGhvZDogQVBJLmNvbW1pdF9ib3FfZXN0aW1hdGUsXHJcbiAgICAgIGFyZ3M6IHtcclxuICAgICAgICBwcm9qZWN0OiBhY3RpdmVQcm9qZWN0LFxyXG4gICAgICAgIGZpbGVfdXJsOiBzdGFnZWRCb3FGaWxlVXJsLFxyXG4gICAgICAgIG1hcHBpbmdfanNvbjogSlNPTi5zdHJpbmdpZnkobWFwcGluZyksXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtYm9xLW1hcHBpbmcnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgc2V0U3RhdHVzKGBJbXBvcnRlZCAke3Jlcy5tZXNzYWdlLmxpbmVzX2ltcG9ydGVkfSBCT1EgaXRlbXMuIFRvdGFsOiBQSFAgJHtyZXMubWVzc2FnZS50b3RhbF9hbW91bnQudG9Mb2NhbGVTdHJpbmcoKX1gKTtcclxuICAgIGZyYXBwZS5zaG93X2FsZXJ0KHtcclxuICAgICAgbWVzc2FnZTogYFx1MjcwNSBCT1EgRXN0aW1hdGUgYmFzZWxpbmVkICgke3Jlcy5tZXNzYWdlLmxpbmVzX2ltcG9ydGVkfSBpdGVtcylgLFxyXG4gICAgICBpbmRpY2F0b3I6ICdncmVlbicsXHJcbiAgICB9KTtcclxuICAgIGF3YWl0IHJlZnJlc2hJbml0aWF0aW9uU3RhdHVzKCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgZnJhcHBlLm1zZ3ByaW50KHsgdGl0bGU6IF9fKCdDb21taXQgRXJyb3InKSwgbWVzc2FnZTogZS5tZXNzYWdlIHx8IGUsIGluZGljYXRvcjogJ3JlZCcgfSk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHNob3dMb2FkaW5nKCcnLCBmYWxzZSk7XHJcbiAgfVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkb3dubG9hZEJvcVRlbXBsYXRlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7IG1ldGhvZDogQVBJLmRvd25sb2FkX2JvcV90ZW1wbGF0ZSB9KTtcclxuICAgIGlmICghcmVzIHx8ICFyZXMubWVzc2FnZSkgcmV0dXJuO1xyXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtyZXMubWVzc2FnZS5jc3ZfZGF0YV0sIHsgdHlwZTogJ3RleHQvY3N2O2NoYXJzZXQ9dXRmLTg7JyB9KTtcclxuICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICBsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgbGluay5kb3dubG9hZCA9IHJlcy5tZXNzYWdlLmZpbGVuYW1lIHx8ICdzdGFuZGFyZF9ib3FfdGVtcGxhdGUuY3N2JztcclxuICAgIGxpbmsuY2xpY2soKTtcclxuICAgIFVSTC5yZXZva2VPYmplY3RVUkwobGluay5ocmVmKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZG93bmxvYWQgQk9RIHRlbXBsYXRlOicsIGUpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3Jvc3NIaWdobGlnaHRNYXBwZWRRdWFudGl0aWVzKCkge1xyXG4gIGlmICghZWxlbWVudE1lc2hlcy5sZW5ndGgpIHtcclxuICAgIGZyYXBwZS5tc2dwcmludChfXygnTG9hZCBJRkMgbW9kZWxzIGluIHRoZSB2aWV3ZXIgdG8gaGlnaGxpZ2h0IHRha2VvZmYgcXVhbnRpdGllcy4nKSk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBlbGVtZW50TWVzaGVzLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICBjb25zdCBpc01hcHBlZCA9IChpdGVtLmV4cHJlc3NJRCAlIDIgPT09IDApO1xyXG4gICAgaWYgKGl0ZW0ubWVzaCAmJiBpdGVtLm1lc2gubWF0ZXJpYWwpIHtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbS5tZXNoLm1hdGVyaWFsKSkge1xyXG4gICAgICAgIGl0ZW0ubWVzaC5tYXRlcmlhbC5mb3JFYWNoKG1hdCA9PiB7XHJcbiAgICAgICAgICBtYXQudHJhbnNwYXJlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgbWF0Lm9wYWNpdHkgPSBpc01hcHBlZCA/IDEuMCA6IDAuMTU7XHJcbiAgICAgICAgICBpZiAoaXNNYXBwZWQpIG1hdC5jb2xvci5zZXRIZXgoMHgyMmM1NWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGl0ZW0ubWVzaC5tYXRlcmlhbC50cmFuc3BhcmVudCA9IHRydWU7XHJcbiAgICAgICAgaXRlbS5tZXNoLm1hdGVyaWFsLm9wYWNpdHkgPSBpc01hcHBlZCA/IDEuMCA6IDAuMTU7XHJcbiAgICAgICAgaWYgKGlzTWFwcGVkKSBpdGVtLm1lc2gubWF0ZXJpYWwuY29sb3Iuc2V0SGV4KDB4MjJjNTVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHNldFN0YXR1cygnQ3Jvc3MtaGlnaGxpZ2h0ZWQgbWFwcGVkIHRha2VvZmYgZWxlbWVudHMgKEdyZWVuID0gQ29zdGVkLCBHaG9zdCA9IFVubWFwcGVkKScpO1xyXG59XHJcblxyXG5sZXQgaXNBbGlnbmluZ01vZGVscyA9IGZhbHNlO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gYXV0b0FsaWduTW9kZWxzKCkge1xyXG4gIGlmIChpc0FsaWduaW5nTW9kZWxzKSByZXR1cm47XHJcbiAgaWYgKCFkZXRlY3RlZERyaWZ0TW9kZWxzLmxlbmd0aCkge1xyXG4gICAgZnJhcHBlLm1zZ3ByaW50KF9fKCdObyBtb2RlbHMgY3VycmVudGx5IHJlcXVpcmUgY29vcmRpbmF0ZSBhbGlnbm1lbnQuJykpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgaXNBbGlnbmluZ01vZGVscyA9IHRydWU7XHJcbiAgY29uc3QgYnRuRml4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1maXgtYWxpZ25tZW50Jyk7XHJcbiAgaWYgKGJ0bkZpeCkgYnRuRml4LmRpc2FibGVkID0gdHJ1ZTtcclxuXHJcbiAgc2hvd0xvYWRpbmcoJ0FsaWduaW5nIG1vZGVsIGNvb3JkaW5hdGVzIHRvIHByb2plY3QgYmFzZSBwb2ludFx1MjAyNicsIHRydWUpO1xyXG4gIHRyeSB7XHJcbiAgICBmb3IgKGNvbnN0IGRyaWZ0IG9mIGRldGVjdGVkRHJpZnRNb2RlbHMpIHtcclxuICAgICAgY29uc3QgdmVjID0gZHJpZnQub2Zmc2V0X3ZlY3RvciB8fCBbMCwgMCwgMF07XHJcbiAgICAgIGF3YWl0IGZyYXBwZS5jYWxsKHtcclxuICAgICAgICBtZXRob2Q6IEFQSS5hbGlnbl9tb2RlbF9jb29yZGluYXRlcyxcclxuICAgICAgICBhcmdzOiB7XHJcbiAgICAgICAgICBtb2RlbF9uYW1lOiBkcmlmdC5tb2RlbCxcclxuICAgICAgICAgIG9mZnNldF94OiB2ZWNbMF0sXHJcbiAgICAgICAgICBvZmZzZXRfeTogdmVjWzFdLFxyXG4gICAgICAgICAgb2Zmc2V0X3o6IHZlY1syXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxldCBlbnRyeSA9IGxvYWRlZE1vZGVscy5nZXQoZHJpZnQubW9kZWwpO1xyXG4gICAgICBpZiAoIWVudHJ5KSB7XHJcbiAgICAgICAgZW50cnkgPSBbLi4ubG9hZGVkTW9kZWxzLnZhbHVlcygpXS5maW5kKGUgPT4gZS5tb2RlbE5hbWUgPT09IGRyaWZ0Lm1vZGVsKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZW50cnkgJiYgZW50cnkuZ3JvdXApIHtcclxuICAgICAgICBlbnRyeS5ncm91cC5wb3NpdGlvbi54ICs9IHZlY1swXTtcclxuICAgICAgICBlbnRyeS5ncm91cC5wb3NpdGlvbi55ICs9IHZlY1sxXTtcclxuICAgICAgICBlbnRyeS5ncm91cC5wb3NpdGlvbi56ICs9IHZlY1syXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiAnXHUyNzA1IE11bHRpLWRpc2NpcGxpbmUgbW9kZWxzIGF1dG8tYWxpZ25lZCB0byBwcm9qZWN0IG9yaWdpbicsIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcclxuICAgIGF3YWl0IHJlZnJlc2hJbml0aWF0aW9uU3RhdHVzKCk7XHJcbiAgICBmaXRWaWV3KCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgZnJhcHBlLm1zZ3ByaW50KHsgdGl0bGU6IF9fKCdBbGlnbm1lbnQgRXJyb3InKSwgbWVzc2FnZTogZS5tZXNzYWdlIHx8IGUsIGluZGljYXRvcjogJ3JlZCcgfSk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGlzQWxpZ25pbmdNb2RlbHMgPSBmYWxzZTtcclxuICAgIGlmIChidG5GaXgpIGJ0bkZpeC5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFwcHJvdmVQcm9qZWN0S2lja29mZigpIHtcclxuICBmcmFwcGUuY29uZmlybShcclxuICAgIGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gYXBwcm92ZSBQcm9qZWN0IEluaXRpYXRpb24gZm9yIDxiPiR7YWN0aXZlUHJvamVjdH08L2I+IGFuZCB0cmFuc2l0aW9uIHRvIEFjdGl2ZSBDb25zdHJ1Y3Rpb24/IFRoaXMgZnJlZXplcyB0aGUgYmFzZWxpbmUgY29udHJhY3QgYW5kIEJPUS5gLFxyXG4gICAgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBzaG93TG9hZGluZygnQXV0aG9yaXppbmcgUHJvamVjdCBLaWNrb2ZmXHUyMDI2JywgdHJ1ZSk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZnJhcHBlLmNhbGwoe1xyXG4gICAgICAgICAgbWV0aG9kOiBBUEkuYXBwcm92ZV9wcm9qZWN0X2luaXRpYXRpb24sXHJcbiAgICAgICAgICBhcmdzOiB7IHByb2plY3Q6IGFjdGl2ZVByb2plY3QgfSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBmcmFwcGUubXNncHJpbnQoe1xyXG4gICAgICAgICAgdGl0bGU6IF9fKCdcdUQ4M0RcdURFODAgUHJvamVjdCBJbml0aWF0aW9uIEFwcHJvdmVkIScpLFxyXG4gICAgICAgICAgbWVzc2FnZTogcmVzLm1lc3NhZ2UubWVzc2FnZSxcclxuICAgICAgICAgIGluZGljYXRvcjogJ2dyZWVuJyxcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZXRBcHBNb2RlKCdjb29yZGluYXRpb24nKTtcclxuICAgICAgICBhd2FpdCByZWZyZXNoSW5pdGlhdGlvblN0YXR1cygpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgZnJhcHBlLm1zZ3ByaW50KHsgdGl0bGU6IF9fKCdBcHByb3ZhbCBGYWlsZWQnKSwgbWVzc2FnZTogZS5tZXNzYWdlIHx8IGUsIGluZGljYXRvcjogJ3JlZCcgfSk7XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgc2hvd0xvYWRpbmcoJycsIGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRJbml0aWF0aW9uRXZlbnRzKCkge1xyXG4gIGNvbnN0IGJ0bkluaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW1vZGUtaW5pdGlhdGlvbicpO1xyXG4gIGNvbnN0IGJ0bkNvb3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1tb2RlLWNvb3JkaW5hdGlvbicpO1xyXG4gIGlmIChidG5Jbml0KSBidG5Jbml0Lm9uY2xpY2sgPSAoKSA9PiBzZXRBcHBNb2RlKCdpbml0aWF0aW9uJyk7XHJcbiAgaWYgKGJ0bkNvb3JkKSBidG5Db29yZC5vbmNsaWNrID0gKCkgPT4gc2V0QXBwTW9kZSgnY29vcmRpbmF0aW9uJyk7XHJcblxyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5iaW0tdnAtdGFiJykuZm9yRWFjaChidG4gPT4ge1xyXG4gICAgYnRuLm9uY2xpY2sgPSAoKSA9PiBzZXRWaWV3cG9ydFRhYihidG4uZGF0YXNldC52cCk7XHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IGJ0bkJvcVRwbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tZG93bmxvYWQtYm9xLXRlbXBsYXRlJyk7XHJcbiAgaWYgKGJ0bkJvcVRwbCkgYnRuQm9xVHBsLm9uY2xpY2sgPSBkb3dubG9hZEJvcVRlbXBsYXRlO1xyXG5cclxuICBjb25zdCBidG5PcGVuRHJpdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLW9wZW4tZHJpdmUnKTtcclxuICBpZiAoYnRuT3BlbkRyaXZlKSB7XHJcbiAgICBidG5PcGVuRHJpdmUub25jbGljayA9ICgpID0+IHtcclxuICAgICAgaWYgKGluaXRpYXRpb25EYXRhICYmIGluaXRpYXRpb25EYXRhLmRyaXZlX2ZvbGRlcikge1xyXG4gICAgICAgIHdpbmRvdy5vcGVuKGAvZHJpdmU/Zm9sZGVyPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGluaXRpYXRpb25EYXRhLmRyaXZlX2ZvbGRlcil9YCwgJ19ibGFuaycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZyYXBwZS5tc2dwcmludChfXygnRHJpdmUgZm9sZGVyIG5vdCB5ZXQgY3JlYXRlZCBmb3IgdGhpcyBwcm9qZWN0LicpKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNhdGVnb3JpZXMgPSBbXHJcbiAgICB7IGNhdDogJ2NvbnRyYWN0JywgaW5wdXRJZDogJ2ZpbGUtaW5wdXQtY29udHJhY3QnLCBkcm9wSWQ6ICdkcm9wem9uZS1jb250cmFjdCcgfSxcclxuICAgIHsgY2F0OiAnY2FkJywgaW5wdXRJZDogJ2ZpbGUtaW5wdXQtY2FkJywgZHJvcElkOiAnZHJvcHpvbmUtY2FkJyB9LFxyXG4gICAgeyBjYXQ6ICdpZmMnLCBpbnB1dElkOiAnZmlsZS1pbnB1dC1pZmMnLCBkcm9wSWQ6ICdkcm9wem9uZS1pZmMnIH0sXHJcbiAgICB7IGNhdDogJ2JvcScsIGlucHV0SWQ6ICdmaWxlLWlucHV0LWJvcScsIGRyb3BJZDogJ2Ryb3B6b25lLWJvcScgfSxcclxuICBdO1xyXG5cclxuICBjYXRlZ29yaWVzLmZvckVhY2goYyA9PiB7XHJcbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGMuaW5wdXRJZCk7XHJcbiAgICBjb25zdCBkcm9wem9uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGMuZHJvcElkKTtcclxuXHJcbiAgICBpZiAoaW5wdXQpIHtcclxuICAgICAgaW5wdXQub25jaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZmlsZSA9IGlucHV0LmZpbGVzWzBdO1xyXG4gICAgICAgIGlmICghZmlsZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGRpc2NTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0LWludGFrZS1kaXNjJyk7XHJcbiAgICAgICAgY29uc3QgZGlzY2lwbGluZSA9IChjLmNhdCA9PT0gJ2lmYycgJiYgZGlzY1NlbGVjdCAmJiBkaXNjU2VsZWN0LnZhbHVlICE9PSAnQXV0bycpID8gZGlzY1NlbGVjdC52YWx1ZSA6IG51bGw7XHJcbiAgICAgICAgdXBsb2FkSW50YWtlRmlsZShmaWxlLCBjLmNhdCwgZGlzY2lwbGluZSk7XHJcbiAgICAgICAgaW5wdXQudmFsdWUgPSAnJztcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZHJvcHpvbmUpIHtcclxuICAgICAgZHJvcHpvbmUub25kcmFnb3ZlciA9IChlKSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGRyb3B6b25lLmNsYXNzTGlzdC5hZGQoJ2RyYWdvdmVyJyk7XHJcbiAgICAgIH07XHJcbiAgICAgIGRyb3B6b25lLm9uZHJhZ2xlYXZlID0gKCkgPT4gZHJvcHpvbmUuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ292ZXInKTtcclxuICAgICAgZHJvcHpvbmUub25kcm9wID0gKGUpID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZHJvcHpvbmUuY2xhc3NMaXN0LnJlbW92ZSgnZHJhZ292ZXInKTtcclxuICAgICAgICBpZiAoZS5kYXRhVHJhbnNmZXIuZmlsZXMgJiYgZS5kYXRhVHJhbnNmZXIuZmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgY29uc3QgZmlsZSA9IGUuZGF0YVRyYW5zZmVyLmZpbGVzWzBdO1xyXG4gICAgICAgICAgY29uc3QgZGlzY1NlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3QtaW50YWtlLWRpc2MnKTtcclxuICAgICAgICAgIGNvbnN0IGRpc2NpcGxpbmUgPSAoYy5jYXQgPT09ICdpZmMnICYmIGRpc2NTZWxlY3QgJiYgZGlzY1NlbGVjdC52YWx1ZSAhPT0gJ0F1dG8nKSA/IGRpc2NTZWxlY3QudmFsdWUgOiBudWxsO1xyXG4gICAgICAgICAgdXBsb2FkSW50YWtlRmlsZShmaWxlLCBjLmNhdCwgZGlzY2lwbGluZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBjb25zdCBidG5IaWdobGlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWhpZ2hsaWdodC1tYXBwZWQnKTtcclxuICBpZiAoYnRuSGlnaGxpZ2h0KSBidG5IaWdobGlnaHQub25jbGljayA9IGNyb3NzSGlnaGxpZ2h0TWFwcGVkUXVhbnRpdGllcztcclxuXHJcbiAgY29uc3QgYnRuQXV0b0FsaWduID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1maXgtYWxpZ25tZW50Jyk7XHJcbiAgaWYgKGJ0bkF1dG9BbGlnbikgYnRuQXV0b0FsaWduLm9uY2xpY2sgPSBhdXRvQWxpZ25Nb2RlbHM7XHJcblxyXG4gIGNvbnN0IGJ0bkZpdEZlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tZml0LWZlZGVyYXRpb24nKTtcclxuICBpZiAoYnRuRml0RmVkKSBidG5GaXRGZWQub25jbGljayA9IGZpdFZpZXc7XHJcblxyXG4gIGNvbnN0IGJ0blZpZXdDYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLXZpZXctY2FkLXRhYicpO1xyXG4gIGlmIChidG5WaWV3Q2FkKSBidG5WaWV3Q2FkLm9uY2xpY2sgPSAoKSA9PiBzZXRWaWV3cG9ydFRhYignY2FkJyk7XHJcblxyXG4gIGNvbnN0IGJ0bkFwcHJvdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWFwcHJvdmUtaW5pdGlhdGlvbicpO1xyXG4gIGlmIChidG5BcHByb3ZlKSBidG5BcHByb3ZlLm9uY2xpY2sgPSBhcHByb3ZlUHJvamVjdEtpY2tvZmY7XHJcblxyXG4gIGNvbnN0IGJ0bkNsb3NlQm9xID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jbG9zZS1ib3EtbW9kYWwnKTtcclxuICBjb25zdCBidG5DYW5jZWxCb3EgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNhbmNlbC1ib3EtbWFwcGluZycpO1xyXG4gIGNvbnN0IGJ0bkNvbW1pdEJvcSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29tbWl0LWJvcS1tYXBwaW5nJyk7XHJcblxyXG4gIGlmIChidG5DbG9zZUJvcSkgYnRuQ2xvc2VCb3Eub25jbGljayA9ICgpID0+IHsgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWJvcS1tYXBwaW5nJykuc3R5bGUuZGlzcGxheSA9ICdub25lJzsgfTtcclxuICBpZiAoYnRuQ2FuY2VsQm9xKSBidG5DYW5jZWxCb3Eub25jbGljayA9ICgpID0+IHsgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWJvcS1tYXBwaW5nJykuc3R5bGUuZGlzcGxheSA9ICdub25lJzsgfTtcclxuICBpZiAoYnRuQ29tbWl0Qm9xKSBidG5Db21taXRCb3Eub25jbGljayA9IGNvbW1pdEJvcU1hcHBpbmc7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gU2VjdGlvbiBDbGlwcGluZyBQbGFuZXMgKE9wZW5Qcm9qZWN0IFBhcml0eSkgLS0tLS0tLS0tLS0tLS0tLVxyXG5jb25zdCBjbGlwUGxhbmVYID0gbmV3IFRIUkVFLlBsYW5lKG5ldyBUSFJFRS5WZWN0b3IzKC0xLCAwLCAwKSwgMTAwMCk7XHJcbmNvbnN0IGNsaXBQbGFuZVkgPSBuZXcgVEhSRUUuUGxhbmUobmV3IFRIUkVFLlZlY3RvcjMoMCwgLTEsIDApLCAxMDAwKTtcclxuY29uc3QgY2xpcFBsYW5lWiA9IG5ldyBUSFJFRS5QbGFuZShuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAtMSksIDEwMDApO1xyXG5sZXQgY2xpcHBpbmdBY3RpdmUgPSBmYWxzZTtcclxuXHJcbmZ1bmN0aW9uIGluaXRTZWN0aW9uQ2xpcHBpbmcoKSB7XHJcbiAgY29uc3QgYnRuU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sLXNlY3Rpb24nKTtcclxuICBjb25zdCBwYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW0tY2xpcHBpbmctY29udHJvbHMnKTtcclxuICBpZiAoIWJ0blNlY3Rpb24gfHwgIXBhbmVsKSByZXR1cm47XHJcblxyXG4gIGJ0blNlY3Rpb24ub25jbGljayA9ICgpID0+IHtcclxuICAgIGNsaXBwaW5nQWN0aXZlID0gIWNsaXBwaW5nQWN0aXZlO1xyXG4gICAgcGFuZWwuc3R5bGUuZGlzcGxheSA9IGNsaXBwaW5nQWN0aXZlID8gJ2ZsZXgnIDogJ25vbmUnO1xyXG4gICAgYnRuU2VjdGlvbi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnLCBjbGlwcGluZ0FjdGl2ZSk7XHJcbiAgICByZW5kZXJlci5sb2NhbENsaXBwaW5nRW5hYmxlZCA9IGNsaXBwaW5nQWN0aXZlO1xyXG4gICAgdXBkYXRlQ2xpcHBpbmdQbGFuZXMoKTtcclxuICAgIHNldFN0YXR1cyhgU2VjdGlvbiBjdXRzOiAke2NsaXBwaW5nQWN0aXZlID8gJ0VOQUJMRUQnIDogJ0RJU0FCTEVEJ31gKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBjaGtYID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXAteC1hY3RpdmUnKTtcclxuICBjb25zdCBzbGRYID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXAteC12YWwnKTtcclxuICBjb25zdCBjaGtZID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXAteS1hY3RpdmUnKTtcclxuICBjb25zdCBzbGRZID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXAteS12YWwnKTtcclxuICBjb25zdCBjaGtaID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXAtei1hY3RpdmUnKTtcclxuICBjb25zdCBzbGRaID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsaXAtei12YWwnKTtcclxuICBjb25zdCBidG5SZXNldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY2xpcC1yZXNldCcpO1xyXG5cclxuICBmdW5jdGlvbiB1cGRhdGVDbGlwcGluZ1BsYW5lcygpIHtcclxuICAgIGNvbnN0IHBsYW5lcyA9IFtdO1xyXG4gICAgaWYgKGNoa1ggJiYgY2hrWC5jaGVja2VkKSB7XHJcbiAgICAgIGNsaXBQbGFuZVguY29uc3RhbnQgPSBwYXJzZUZsb2F0KHNsZFgudmFsdWUpO1xyXG4gICAgICBwbGFuZXMucHVzaChjbGlwUGxhbmVYKTtcclxuICAgIH1cclxuICAgIGlmIChjaGtZICYmIGNoa1kuY2hlY2tlZCkge1xyXG4gICAgICBjbGlwUGxhbmVZLmNvbnN0YW50ID0gcGFyc2VGbG9hdChzbGRZLnZhbHVlKTtcclxuICAgICAgcGxhbmVzLnB1c2goY2xpcFBsYW5lWSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2hrWiAmJiBjaGtaLmNoZWNrZWQpIHtcclxuICAgICAgY2xpcFBsYW5lWi5jb25zdGFudCA9IHBhcnNlRmxvYXQoc2xkWi52YWx1ZSk7XHJcbiAgICAgIHBsYW5lcy5wdXNoKGNsaXBQbGFuZVopO1xyXG4gICAgfVxyXG4gICAgcmVuZGVyZXIuY2xpcHBpbmdQbGFuZXMgPSBwbGFuZXM7XHJcbiAgfVxyXG5cclxuICBbY2hrWCwgc2xkWCwgY2hrWSwgc2xkWSwgY2hrWiwgc2xkWl0uZm9yRWFjaChlbCA9PiB7XHJcbiAgICBpZiAoZWwpIGVsLm9uaW5wdXQgPSB1cGRhdGVDbGlwcGluZ1BsYW5lcztcclxuICB9KTtcclxuXHJcbiAgaWYgKGJ0blJlc2V0KSB7XHJcbiAgICBidG5SZXNldC5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBpZiAoY2hrWCkgY2hrWC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgIGlmIChjaGtZKSBjaGtZLmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgaWYgKGNoa1opIGNoa1ouY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICBpZiAoc2xkWCkgc2xkWC52YWx1ZSA9IDA7XHJcbiAgICAgIGlmIChzbGRZKSBzbGRZLnZhbHVlID0gMDtcclxuICAgICAgaWYgKHNsZFopIHNsZFoudmFsdWUgPSAwO1xyXG4gICAgICB1cGRhdGVDbGlwcGluZ1BsYW5lcygpO1xyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0gSW4tVmlld2VyIEJDRiBJc3N1ZSAvIERlZmVjdCBDcmVhdGlvbiAoT3BlblByb2plY3QgUGFyaXR5KSAtLS0tLS0tLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIGluaXRJblZpZXdlcklzc3VlQ3JlYXRpb24oKSB7XHJcbiAgY29uc3QgYnRuQ3JlYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2wtY3JlYXRlLWlzc3VlJyk7XHJcbiAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kYWwtY3JlYXRlLWlzc3VlJyk7XHJcbiAgY29uc3QgYnRuQ2xvc2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuLWNsb3NlLWlzc3VlLW1vZGFsJyk7XHJcbiAgY29uc3QgYnRuQ2FuY2VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1jYW5jZWwtY3JlYXRlLWlzc3VlJyk7XHJcbiAgY29uc3QgYnRuQ29uZmlybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG4tY29uZmlybS1jcmVhdGUtaXNzdWUnKTtcclxuICBjb25zdCBpbWdQcmV2aWV3ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lzc3VlLXNuYXBzaG90LXByZXZpZXcnKTtcclxuICBsZXQgY3VycmVudFNuYXBzaG90ID0gJyc7XHJcblxyXG4gIGlmIChidG5DcmVhdGUgJiYgbW9kYWwpIHtcclxuICAgIGJ0bkNyZWF0ZS5vbmNsaWNrID0gKCkgPT4ge1xyXG4gICAgICBjdXJyZW50U25hcHNob3QgPSByZW5kZXJlci5kb21FbGVtZW50LnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XHJcbiAgICAgIGlmIChpbWdQcmV2aWV3KSBpbWdQcmV2aWV3LnNyYyA9IGN1cnJlbnRTbmFwc2hvdDtcclxuICAgICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCBjbG9zZU1vZGFsID0gKCkgPT4geyBpZiAobW9kYWwpIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IH07XHJcbiAgaWYgKGJ0bkNsb3NlKSBidG5DbG9zZS5vbmNsaWNrID0gY2xvc2VNb2RhbDtcclxuICBpZiAoYnRuQ2FuY2VsKSBidG5DYW5jZWwub25jbGljayA9IGNsb3NlTW9kYWw7XHJcblxyXG4gIGlmIChidG5Db25maXJtKSB7XHJcbiAgICBidG5Db25maXJtLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpdGxlID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpc3N1ZS1tb2RhbC10aXRsZScpLnZhbHVlIHx8ICcnKS50cmltKCk7XHJcbiAgICAgIGNvbnN0IHR5cGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaXNzdWUtbW9kYWwtdHlwZScpLnZhbHVlO1xyXG4gICAgICBjb25zdCBwcmlvcml0eSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpc3N1ZS1tb2RhbC1wcmlvcml0eScpLnZhbHVlO1xyXG4gICAgICBjb25zdCBkZXNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lzc3VlLW1vZGFsLWRlc2MnKS52YWx1ZTtcclxuXHJcbiAgICAgIGlmICghdGl0bGUpIHtcclxuICAgICAgICBmcmFwcGUubXNncHJpbnQoX18oJ1BsZWFzZSBwcm92aWRlIGFuIGlzc3VlIHRpdGxlLicpKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGJ0bkNvbmZpcm0uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICBidG5Db25maXJtLnRleHRDb250ZW50ID0gJ1NhdmluZ1x1MjAyNic7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY2FtRGF0YSA9IHtcclxuICAgICAgICAgIHBvc2l0aW9uOiB7IHg6IGNhbWVyYS5wb3NpdGlvbi54LCB5OiBjYW1lcmEucG9zaXRpb24ueSwgejogY2FtZXJhLnBvc2l0aW9uLnogfSxcclxuICAgICAgICAgIHRhcmdldDogeyB4OiBjb250cm9scy50YXJnZXQueCwgeTogY29udHJvbHMudGFyZ2V0LnksIHo6IGNvbnRyb2xzLnRhcmdldC56IH0sXHJcbiAgICAgICAgICBmb3Y6IGNhbWVyYS5mb3ZcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmcmFwcGUuY2FsbCh7XHJcbiAgICAgICAgICBtZXRob2Q6IEFQSS5jcmVhdGVfaW5fdmlld2VyX2lzc3VlLFxyXG4gICAgICAgICAgYXJnczoge1xyXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXHJcbiAgICAgICAgICAgIHRvcGljX3R5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2MsXHJcbiAgICAgICAgICAgIHNuYXBzaG90X2RhdGE6IGN1cnJlbnRTbmFwc2hvdCxcclxuICAgICAgICAgICAgY2FtZXJhX2pzb246IEpTT04uc3RyaW5naWZ5KGNhbURhdGEpLFxyXG4gICAgICAgICAgICBlbGVtZW50X2d1aWQ6IGN1cnJlbnRTZWxlY3Rpb24gPyBTdHJpbmcoY3VycmVudFNlbGVjdGlvbi5leHByZXNzSUQpIDogbnVsbFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdCQ0YgSXNzdWUgY3JlYXRlZCBzdWNjZXNzZnVsbHkhJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcclxuICAgICAgICBjbG9zZU1vZGFsKCk7XHJcbiAgICAgICAgc2V0U3RhdHVzKGBDcmVhdGVkIElzc3VlOiAke3RpdGxlfWApO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBpc3N1ZTonLCBlKTtcclxuICAgICAgICBmcmFwcGUubXNncHJpbnQoX18oJ0Vycm9yIGNyZWF0aW5nIGlzc3VlOiAnICsgKGUubWVzc2FnZSB8fCBlKSkpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIGJ0bkNvbmZpcm0uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBidG5Db25maXJtLnRleHRDb250ZW50ID0gJ0NyZWF0ZSBCQ0YgSXNzdWUnO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLSBCb290IC0tLS0tLS0tLS0tLS0tLS1cclxuaW5pdERpc2NpcGxpbmVDb250cm9scygpO1xyXG5pbml0VWlFdmVudHMoKTtcclxuaW5pdEluaXRpYXRpb25FdmVudHMoKTtcclxuaW5pdFNlY3Rpb25DbGlwcGluZygpO1xyXG5pbml0SW5WaWV3ZXJJc3N1ZUNyZWF0aW9uKCk7XHJcbmxvYWRNb2RlbHNMaXN0KCkudGhlbigoKSA9PiB7XHJcbiAgaGFuZGxlUm91dGVQYXJhbXMoKTtcclxufSk7XHJcblxyXG53aW5kb3cuQklNVmlld2VyQXBwID0ge1xyXG4gIGxvYWRlZE1vZGVscyxcclxuICBlbGVtZW50TWVzaGVzLFxyXG4gIGxvYWRNb2RlbEdlb21ldHJ5LFxyXG4gIHVubG9hZE1vZGVsLFxyXG4gIGV4ZWN1dGVDbGFzaERldGVjdGlvbixcclxuICBkZXRlY3RlZENsYXNoZXMsXHJcbiAgb3BlbkJvbVdpemFyZE1vZGFsLFxyXG4gIGNhbGN1bGF0ZUFuZFJlbmRlckJvbVJvbGx1cCxcclxuICBoYW5kbGVSb3V0ZVBhcmFtcyxcclxuICBzZXRBcHBNb2RlLFxyXG4gIHNldFZpZXdwb3J0VGFiLFxyXG4gIHJlZnJlc2hJbml0aWF0aW9uU3RhdHVzLFxyXG4gIHVwbG9hZEludGFrZUZpbGUsXHJcbiAgYXV0b0FsaWduTW9kZWxzLFxyXG4gIGFwcHJvdmVQcm9qZWN0S2lja29mZixcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUdBLElBQU0sU0FBUyxPQUFPO0FBQ3RCLElBQU0sU0FBUyxPQUFPO0FBQ3RCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUTtBQUN0QixRQUFNLElBQUksTUFBTSw4RUFBOEU7QUFDaEc7QUFFQSxJQUFNLFFBQVEsT0FBTztBQUNyQixJQUFNLGdCQUFnQixPQUFPO0FBQzdCLElBQU0sZ0JBQWdCLE9BQU87QUFDN0IsSUFBTSxnQkFBZ0IsT0FBTztBQUM3QixJQUFNLHVCQUF1QixPQUFPO0FBQ3BDLElBQU0sdUJBQXVCLE9BQU87QUFDcEMsSUFBTSw4QkFBOEIsT0FBTztBQUczQyxJQUFNLE1BQU07QUFBQSxFQUNWLGFBQWE7QUFBQSxFQUNiLFdBQVc7QUFBQSxFQUNYLGVBQWU7QUFBQSxFQUNmLGFBQWE7QUFBQSxFQUNiLGNBQWM7QUFBQSxFQUNkLGlCQUFpQjtBQUFBLEVBQ2pCLGlCQUFpQjtBQUFBLEVBQ2pCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUFBLEVBQ2hCLGlCQUFpQjtBQUFBLEVBQ2pCLGtCQUFrQjtBQUFBLEVBQ2xCLGNBQWM7QUFBQSxFQUNkLGNBQWM7QUFBQSxFQUNkLG1CQUFtQjtBQUFBLEVBQ25CLHFCQUFxQjtBQUFBLEVBQ3JCLHVCQUF1QjtBQUFBLEVBQ3ZCLHVCQUF1QjtBQUFBLEVBQ3ZCLG9CQUFvQjtBQUFBLEVBQ3BCLGdCQUFnQjtBQUFBLEVBQ2hCLHFCQUFxQjtBQUFBLEVBQ3JCLHVCQUF1QjtBQUFBLEVBQ3ZCLHlCQUF5QjtBQUFBLEVBQ3pCLDRCQUE0QjtBQUFBLEVBQzVCLHdCQUF3QjtBQUMxQjtBQUdBLElBQU0sTUFBTTtBQUFBLEVBQ1YsUUFBUSxTQUFTLGVBQWUsWUFBWTtBQUFBLEVBQzVDLGlCQUFpQixTQUFTLGVBQWUsbUJBQW1CO0FBQUEsRUFDNUQsZ0JBQWdCLFNBQVMsZUFBZSxrQkFBa0I7QUFBQSxFQUMxRCxRQUFRLFNBQVMsZUFBZSxZQUFZO0FBQUEsRUFDNUMsV0FBVyxTQUFTLGVBQWUsZ0JBQWdCO0FBQUEsRUFDbkQsUUFBUSxTQUFTLGVBQWUsWUFBWTtBQUFBLEVBQzVDLFFBQVEsU0FBUyxlQUFlLFlBQVk7QUFBQSxFQUM1QyxTQUFTLFNBQVMsZUFBZSxhQUFhO0FBQUEsRUFDOUMsT0FBTyxTQUFTLGVBQWUsV0FBVztBQUFBLEVBQzFDLFlBQVksU0FBUyxlQUFlLG1CQUFtQjtBQUFBLEVBQ3ZELE9BQU8sU0FBUyxlQUFlLFdBQVc7QUFBQSxFQUMxQyxZQUFZLFNBQVMsZUFBZSxnQkFBZ0I7QUFBQSxFQUNwRCxRQUFRLFNBQVMsZUFBZSxTQUFTO0FBQUEsRUFDekMsYUFBYSxTQUFTLGVBQWUsY0FBYztBQUFBLEVBQ25ELFNBQVMsU0FBUyxlQUFlLFVBQVU7QUFBQSxFQUMzQyxPQUFPLFNBQVMsZUFBZSxRQUFRO0FBQUEsRUFDdkMsU0FBUyxTQUFTLGVBQWUsVUFBVTtBQUFBLEVBQzNDLGdCQUFnQixTQUFTLGVBQWUsa0JBQWtCO0FBQUEsRUFDMUQsaUJBQWlCLFNBQVMsZUFBZSxtQkFBbUI7QUFBQSxFQUM1RCxzQkFBc0IsU0FBUyxlQUFlLHdCQUF3QjtBQUFBLEVBQ3RFLG9CQUFvQixTQUFTLGVBQWUsc0JBQXNCO0FBQUEsRUFDbEUscUJBQXFCLFNBQVMsZUFBZSx1QkFBdUI7QUFBQSxFQUNwRSxtQkFBbUIsU0FBUyxlQUFlLHFCQUFxQjtBQUFBLEVBQ2hFLFVBQVUsU0FBUyxlQUFlLGVBQWU7QUFBQSxFQUNqRCxnQkFBZ0IsU0FBUyxlQUFlLGtCQUFrQjtBQUFBLEVBQzFELGdCQUFnQixTQUFTLGVBQWUsa0JBQWtCO0FBQzVEO0FBR0EsSUFBTSxXQUFXLElBQUksTUFBTSxjQUFjLEVBQUUsUUFBUSxJQUFJLFFBQVEsV0FBVyxNQUFNLHVCQUF1QixLQUFLLENBQUM7QUFDN0csU0FBUyxjQUFjLEtBQUssSUFBSSxPQUFPLG9CQUFvQixHQUFHLENBQUMsQ0FBQztBQUNoRSxJQUFNLFFBQVEsSUFBSSxNQUFNLE1BQU07QUFDOUIsTUFBTSxhQUFhLElBQUksTUFBTSxNQUFNLE1BQVE7QUFFM0MsSUFBTSxTQUFTLElBQUksTUFBTSxrQkFBa0IsSUFBSSxHQUFHLEtBQUssR0FBSTtBQUMzRCxPQUFPLFNBQVMsSUFBSSxJQUFJLElBQUksRUFBRTtBQUM5QixJQUFNLFdBQVcsSUFBSSxjQUFjLFFBQVEsU0FBUyxVQUFVO0FBQzlELFNBQVMsZ0JBQWdCO0FBQ3pCLFNBQVMsZ0JBQWdCO0FBRXpCLE1BQU0sSUFBSSxJQUFJLE1BQU0sZ0JBQWdCLFVBQVUsU0FBVSxHQUFHLENBQUM7QUFDNUQsSUFBTSxXQUFXLElBQUksTUFBTSxpQkFBaUIsVUFBVSxHQUFHO0FBQ3pELFNBQVMsU0FBUyxJQUFJLElBQUksSUFBSSxFQUFFO0FBQ2hDLE1BQU0sSUFBSSxRQUFRO0FBQ2xCLElBQU0sWUFBWSxJQUFJLE1BQU0saUJBQWlCLFNBQVUsR0FBRztBQUMxRCxVQUFVLFNBQVMsSUFBSSxLQUFLLElBQUksR0FBRztBQUNuQyxNQUFNLElBQUksU0FBUztBQUVuQixJQUFNLE9BQU8sSUFBSSxNQUFNLFdBQVcsS0FBSyxJQUFJLFNBQVUsT0FBUTtBQUM3RCxLQUFLLFNBQVMsSUFBSTtBQUNsQixNQUFNLElBQUksSUFBSTtBQUdkLElBQU0saUJBQWlCLElBQUksTUFBTSxNQUFNO0FBQ3ZDLGVBQWUsT0FBTztBQUN0QixNQUFNLElBQUksY0FBYztBQUd4QixJQUFNLG9CQUFvQixJQUFJLE1BQU0sTUFBTTtBQUMxQyxrQkFBa0IsT0FBTztBQUN6QixNQUFNLElBQUksaUJBQWlCO0FBRzNCLElBQUksZUFBZSxvQkFBSSxJQUFJO0FBQzNCLElBQUksZ0JBQWdCLENBQUM7QUFDckIsSUFBSSxlQUFlLG9CQUFJLElBQUk7QUFDM0IsSUFBSSxrQkFBa0IsQ0FBQztBQUN2QixJQUFJLG1CQUFtQjtBQUN2QixJQUFJLGFBQWE7QUFFakIsSUFBSSxnQkFBZ0I7QUFDcEIsSUFBSSxTQUFTO0FBQ2IsSUFBSSxrQkFBa0IsQ0FBQztBQUN2QixJQUFJLGNBQWM7QUFHbEIsSUFBTSxlQUFlLElBQUksTUFBTSxxQkFBcUIsRUFBRSxPQUFPLFNBQVUsVUFBVSxRQUFVLG1CQUFtQixJQUFJLENBQUM7QUFDbkgsSUFBTSxZQUFZLElBQUksTUFBTSxxQkFBcUIsRUFBRSxPQUFPLFVBQVUsVUFBVSxTQUFVLG1CQUFtQixLQUFLLFdBQVcsSUFBSSxDQUFDO0FBQ2hJLElBQU0sWUFBWSxJQUFJLE1BQU0scUJBQXFCLEVBQUUsT0FBTyxVQUFVLFVBQVUsU0FBVSxtQkFBbUIsS0FBSyxXQUFXLElBQUksQ0FBQztBQUVoSSxTQUFTLFNBQVM7QUFDaEIsUUFBTSxJQUFJLElBQUksU0FBVSxJQUFJLE9BQU8sZUFBZSxNQUFPO0FBQ3pELFFBQU0sSUFBSSxJQUFJLFNBQVUsSUFBSSxPQUFPLGdCQUFnQixNQUFPO0FBQzFELFdBQVMsUUFBUSxHQUFHLEdBQUcsS0FBSztBQUM1QixTQUFPLFNBQVMsSUFBSTtBQUNwQixTQUFPLHVCQUF1QjtBQUNoQztBQUNBLE9BQU8saUJBQWlCLFVBQVUsTUFBTTtBQUN4QyxPQUFPO0FBRVAsSUFBSSxPQUFPLGtCQUFrQjtBQUMzQix1QkFBcUIsT0FBTyxnQkFBZ0I7QUFDNUMsU0FBTyxtQkFBbUI7QUFDNUI7QUFFQSxTQUFTLFVBQVU7QUFDakIsU0FBTyxtQkFBbUIsc0JBQXNCLE9BQU87QUFDdkQsV0FBUyxPQUFPO0FBQ2hCLFdBQVMsT0FBTyxPQUFPLE1BQU07QUFDL0I7QUFDQSxRQUFRO0FBRVIsU0FBUyxVQUFVLEtBQUs7QUFBRSxNQUFJLElBQUksT0FBUSxLQUFJLE9BQU8sY0FBYztBQUFLO0FBQ3hFLFNBQVMsWUFBWSxLQUFLLElBQUk7QUFDNUIsTUFBSSxJQUFJLFNBQVM7QUFDZixRQUFJLFFBQVEsTUFBTSxVQUFVLEtBQUssU0FBUztBQUMxQyxRQUFJLEdBQUksS0FBSSxRQUFRLGNBQWM7QUFBQSxFQUNwQztBQUNGO0FBR0EsZUFBZSxZQUFZO0FBQ3pCLE1BQUksT0FBUSxRQUFPO0FBQ25CLFFBQU0sTUFBTSxJQUFJLE9BQU8sT0FBTztBQUM5QixNQUFJLFlBQVksdUNBQXVDLElBQUk7QUFDM0QsUUFBTSxJQUFJLEtBQUs7QUFDZixXQUFTO0FBQ1QsU0FBTztBQUNUO0FBR0EsZUFBZSxpQkFBaUI7QUFDOUIsWUFBVSxzQkFBaUI7QUFDM0IsTUFBSTtBQUNGLFVBQU0sTUFBTSxNQUFNLE9BQU8sS0FBSyxFQUFFLFFBQVEsSUFBSSxZQUFZLENBQUM7QUFDekQsc0JBQWtCLElBQUksV0FBVyxDQUFDO0FBQ2xDLHFCQUFpQjtBQUNqQixRQUFJLGdCQUFnQixRQUFRO0FBQzFCLGdCQUFVLEdBQUcsZ0JBQWdCLE1BQU0sbUJBQW1CO0FBQUEsSUFDeEQsT0FBTztBQUNMLGdCQUFVLCtDQUErQztBQUFBLElBQzNEO0FBQUEsRUFDRixTQUFTLEdBQUc7QUFDVixjQUFVLGtDQUFrQyxFQUFFLFdBQVcsRUFBRTtBQUFBLEVBQzdEO0FBQ0Y7QUFFQSxTQUFTLG1CQUFtQjtBQUMxQixNQUFJLENBQUMsSUFBSSxPQUFRO0FBQ2pCLE1BQUksT0FBTyxZQUFZO0FBQ3ZCLE1BQUksQ0FBQyxnQkFBZ0IsUUFBUTtBQUMzQixRQUFJLE9BQU8sWUFBWTtBQUN2QjtBQUFBLEVBQ0Y7QUFFQSxrQkFBZ0IsUUFBUSxPQUFLO0FBQzNCLFVBQU0sV0FBVyxhQUFhLElBQUksRUFBRSxJQUFJO0FBQ3hDLFVBQU0sSUFBSSxTQUFTLGNBQWMsS0FBSztBQUN0QyxNQUFFLFlBQVksb0JBQW9CLFdBQVcsWUFBWTtBQUd6RCxRQUFJLE9BQU8sRUFBRSxjQUFjO0FBQzNCLFVBQU0sYUFBYSxFQUFFLGNBQWMsRUFBRSxNQUFNLFlBQVk7QUFDdkQsUUFBSSxVQUFVLFNBQVMsT0FBTyxLQUFLLFVBQVUsU0FBUyxLQUFLLEVBQUcsUUFBTztBQUFBLGFBQzVELFVBQVUsU0FBUyxNQUFNLEtBQUssVUFBVSxTQUFTLEtBQUssS0FBSyxVQUFVLFNBQVMsS0FBSyxFQUFHLFFBQU87QUFFdEcsTUFBRSxZQUFZO0FBQUEsd0NBQ3NCLEVBQUUsVUFBVTtBQUFBLHFEQUNDLFdBQVcsWUFBWSxFQUFFO0FBQUEsZ0JBQzlELEVBQUUsVUFBVTtBQUFBO0FBQUE7QUFBQSw4Q0FHa0IsSUFBSTtBQUFBLDRCQUN0QixFQUFFLGlCQUFpQixDQUFDO0FBQUE7QUFBQTtBQUk1QyxVQUFNLFdBQVcsRUFBRSxjQUFjLGNBQWM7QUFDL0MsYUFBUyxVQUFVLENBQUMsTUFBTTtBQUN4QixRQUFFLGdCQUFnQjtBQUNsQixrQkFBWSxFQUFFLElBQUk7QUFBQSxJQUNwQjtBQUVBLE1BQUUsVUFBVSxNQUFNLFlBQVksRUFBRSxJQUFJO0FBQ3BDLFFBQUksT0FBTyxZQUFZLENBQUM7QUFBQSxFQUMxQixDQUFDO0FBQ0g7QUFFQSxlQUFlLFlBQVksY0FBYztBQUN2QyxNQUFJLGFBQWEsSUFBSSxZQUFZLEdBQUc7QUFDbEMsZ0JBQVksWUFBWTtBQUFBLEVBQzFCLE9BQU87QUFDTCxVQUFNLGtCQUFrQixZQUFZO0FBQUEsRUFDdEM7QUFDQSxtQkFBaUI7QUFDakIsMEJBQXdCO0FBQ3hCLGlCQUFlO0FBQ2YsVUFBUTtBQUNWO0FBRUEsSUFBTSxnQkFBZ0Isb0JBQUksSUFBSTtBQUU5QixlQUFlLGtCQUFrQixjQUFjO0FBQzdDLE1BQUksYUFBYSxJQUFJLFlBQVksR0FBRztBQUNsQyxXQUFPLGFBQWEsSUFBSSxZQUFZO0FBQUEsRUFDdEM7QUFDQSxNQUFJLGNBQWMsSUFBSSxZQUFZLEdBQUc7QUFDbkMsV0FBTyxjQUFjLElBQUksWUFBWTtBQUFBLEVBQ3ZDO0FBRUEsUUFBTSxXQUFXLFlBQVk7QUFDM0IsZ0JBQVksaUJBQWlCLFlBQVksVUFBSyxJQUFJO0FBQ2xELFFBQUk7QUFDRixZQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUssRUFBRSxRQUFRLElBQUksV0FBVyxNQUFNLEVBQUUsT0FBTyxhQUFhLEVBQUUsQ0FBQztBQUN0RixZQUFNLFlBQVksSUFBSTtBQUN0QixZQUFNLFNBQVMsVUFBVTtBQUN6QixVQUFJLENBQUMsUUFBUTtBQUNYLGtCQUFVLFNBQVMsVUFBVSxVQUFVLDJCQUEyQjtBQUNsRTtBQUFBLE1BQ0Y7QUFFQSxZQUFNLFNBQVMsT0FBTyxXQUFXLEdBQUcsSUFBSSxTQUFTLE1BQU07QUFDdkQsa0JBQVksb0JBQW9CLFVBQVUsVUFBVSxXQUFNLElBQUk7QUFDOUQsWUFBTSxPQUFPLE1BQU0sTUFBTSxNQUFNO0FBQy9CLFVBQUksQ0FBQyxLQUFLLEdBQUksT0FBTSxJQUFJLE1BQU0sUUFBUSxLQUFLLE1BQU0sZUFBZTtBQUVoRSxZQUFNLE1BQU0sSUFBSSxXQUFXLE1BQU0sS0FBSyxZQUFZLENBQUM7QUFDbkQsa0JBQVksaUJBQWlCLElBQUksU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLGNBQVMsSUFBSTtBQUV0RSxZQUFNLE1BQU0sTUFBTSxVQUFVO0FBRTVCLFlBQU0sYUFBYSxJQUFJLFVBQVUsS0FBSyxFQUFFLHNCQUFzQixPQUFPLGNBQWMsS0FBSyxDQUFDO0FBRXpGLFVBQUksT0FBTyxVQUFVLGNBQWM7QUFDbkMsWUFBTSxhQUFhLFVBQVUsY0FBYyxjQUFjLFlBQVk7QUFDckUsVUFBSSxVQUFVLFNBQVMsT0FBTyxLQUFLLFVBQVUsU0FBUyxLQUFLLEVBQUcsUUFBTztBQUFBLGVBQzVELFVBQVUsU0FBUyxNQUFNLEtBQUssVUFBVSxTQUFTLEtBQUssS0FBSyxVQUFVLFNBQVMsS0FBSyxFQUFHLFFBQU87QUFFdEcsa0JBQVksc0JBQXNCLElBQUksV0FBTSxJQUFJO0FBQ2hELFlBQU0sY0FBYyxjQUFjLEtBQUssWUFBWTtBQUFBLFFBQ2pELFdBQVcsVUFBVSxjQUFjO0FBQUEsUUFDbkMsWUFBWTtBQUFBLE1BQ2QsQ0FBQztBQUVELHFCQUFlLElBQUksWUFBWSxLQUFLO0FBR3BDLFVBQUk7QUFDRixjQUFNLFVBQVUsTUFBTSxPQUFPLEtBQUs7QUFBQSxVQUNoQyxRQUFRLElBQUk7QUFBQSxVQUNaLE1BQU0sRUFBRSxPQUFPLGNBQWMsU0FBUyxNQUFNLE9BQU8sS0FBTTtBQUFBLFFBQzNELENBQUM7QUFDRCxjQUFNLFdBQVksUUFBUSxXQUFXLFFBQVEsUUFBUSxZQUFhLENBQUM7QUFDbkUsaUJBQVMsUUFBUSxRQUFNO0FBQ3JCLGdCQUFNLFlBQVksR0FBRyxZQUFZLElBQUksUUFBUSxLQUFLLEVBQUU7QUFDcEQsY0FBSSxTQUFVLGNBQWEsSUFBSSxHQUFHLFlBQVksSUFBSSxRQUFRLElBQUksRUFBRTtBQUNoRSxjQUFJLEdBQUcsVUFBVyxjQUFhLElBQUksR0FBRyxXQUFXLEVBQUU7QUFBQSxRQUNyRCxDQUFDO0FBQUEsTUFDSCxTQUFTLEdBQUc7QUFBQSxNQUFDO0FBRWIsWUFBTSxRQUFRO0FBQUEsUUFDWjtBQUFBLFFBQ0EsV0FBVyxVQUFVLGNBQWM7QUFBQSxRQUNuQyxZQUFZO0FBQUEsUUFDWjtBQUFBLFFBQ0EsT0FBTyxZQUFZO0FBQUEsUUFDbkIsWUFBWSxZQUFZO0FBQUEsUUFDeEIsV0FBVyxZQUFZO0FBQUEsUUFDdkIsVUFBVSxDQUFDO0FBQUEsUUFDWCxXQUFXO0FBQUEsUUFDWCxTQUFTO0FBQUEsUUFDVCxTQUFTO0FBQUEsTUFDWDtBQUNBLG1CQUFhLElBQUksY0FBYyxLQUFLO0FBRXBDLGdCQUFVLFVBQVUsVUFBVSxVQUFVLEtBQUssSUFBSSxNQUFNLFlBQVksVUFBVSxLQUFLLFlBQVksWUFBWSxVQUFVLElBQUksT0FBTztBQUMvSCxhQUFPO0FBQUEsSUFDVCxTQUFTLEdBQUc7QUFDVixjQUFRLE1BQU0saUNBQWlDLENBQUM7QUFDaEQsZ0JBQVUsaUJBQWlCLFlBQVksS0FBSyxFQUFFLFdBQVcsQ0FBQyxFQUFFO0FBQUEsSUFDOUQsVUFBRTtBQUNBLGtCQUFZLElBQUksS0FBSztBQUNyQixvQkFBYyxPQUFPLFlBQVk7QUFBQSxJQUNuQztBQUFBLEVBQ0YsR0FBRztBQUVILGdCQUFjLElBQUksY0FBYyxPQUFPO0FBQ3ZDLFNBQU87QUFDVDtBQUVBLFNBQVMsWUFBWSxjQUFjO0FBQ2pDLFFBQU0sYUFBYSxhQUFhLElBQUksWUFBWTtBQUNoRCxNQUFJLENBQUMsV0FBWTtBQUVqQixNQUFJLFVBQVUsV0FBVyxlQUFlLFFBQVc7QUFDakQsUUFBSTtBQUFFLGFBQU8sV0FBVyxXQUFXLFVBQVU7QUFBQSxJQUFHLFNBQVMsR0FBRztBQUFFLGNBQVEsS0FBSyw4QkFBOEIsQ0FBQztBQUFBLElBQUc7QUFBQSxFQUMvRztBQUdBLGFBQVcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxhQUFhLFFBQVEsR0FBRztBQUMvQyxRQUFJLElBQUksaUJBQWlCLGdCQUFnQixJQUFJLFdBQVcsR0FBRyxZQUFZLEdBQUcsR0FBRztBQUMzRSxtQkFBYSxPQUFPLEdBQUc7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFFQSxpQkFBZSxPQUFPLFdBQVcsS0FBSztBQUN0QyxlQUFhLFdBQVcsS0FBSztBQUM3QixlQUFhLE9BQU8sWUFBWTtBQUNoQywwQkFBd0I7QUFDeEIsbUJBQWlCO0FBQ2pCLFlBQVUsWUFBWSxXQUFXLFNBQVMsRUFBRTtBQUM5QztBQUVBLFNBQVMsa0JBQWtCO0FBQ3pCLGVBQWEsUUFBUSxDQUFDLFVBQVU7QUFDOUIsUUFBSSxVQUFVLE1BQU0sZUFBZSxRQUFXO0FBQzVDLFVBQUk7QUFBRSxlQUFPLFdBQVcsTUFBTSxVQUFVO0FBQUEsTUFBRyxTQUFTLEdBQUc7QUFBQSxNQUFDO0FBQUEsSUFDMUQ7QUFDQSxtQkFBZSxPQUFPLE1BQU0sS0FBSztBQUNqQyxpQkFBYSxNQUFNLEtBQUs7QUFBQSxFQUMxQixDQUFDO0FBQ0QsZUFBYSxNQUFNO0FBQ25CLGVBQWEsTUFBTTtBQUNuQixrQkFBZ0IsQ0FBQztBQUNqQixvQkFBa0IsTUFBTTtBQUN4QixpQkFBZTtBQUNmLG1CQUFpQjtBQUNqQixZQUFVLG9CQUFvQjtBQUNoQztBQUVBLFNBQVMsMEJBQTBCO0FBQ2pDLGtCQUFnQixDQUFDO0FBQ2pCLGVBQWEsUUFBUSxDQUFDLE9BQU8saUJBQWlCO0FBQzVDLFVBQU0sV0FBVyxRQUFRLENBQUMsUUFBUSxjQUFjO0FBQzlDLGFBQU8sUUFBUSxPQUFLO0FBQ2xCLFVBQUUsU0FBUyxlQUFlO0FBQzFCLFVBQUUsU0FBUyxhQUFhLE1BQU07QUFDOUIsc0JBQWMsS0FBSyxFQUFFLE1BQU0sR0FBRyxXQUFXLGNBQWMsWUFBWSxNQUFNLFdBQVcsQ0FBQztBQUFBLE1BQ3ZGLENBQUM7QUFBQSxJQUNILENBQUM7QUFBQSxFQUNILENBQUM7QUFDRCw2QkFBMkI7QUFDN0I7QUFFQSxTQUFTLDZCQUE2QjtBQUNwQyxRQUFNLFNBQVMsU0FBUyxlQUFlLGtCQUFrQjtBQUN6RCxNQUFJLENBQUMsT0FBUTtBQUNiLE1BQUksQ0FBQyxhQUFhLE1BQU07QUFDdEIsV0FBTyxZQUFZO0FBQ25CO0FBQUEsRUFDRjtBQUVBLFNBQU8sWUFBWTtBQUNuQixlQUFhLFFBQVEsQ0FBQyxPQUFPLGlCQUFpQjtBQUM1QyxVQUFNLFlBQVksU0FBUyxjQUFjLEtBQUs7QUFDOUMsY0FBVSxNQUFNLGVBQWU7QUFFL0IsVUFBTSxTQUFTLFNBQVMsY0FBYyxLQUFLO0FBQzNDLFdBQU8sTUFBTSxVQUFVO0FBQ3ZCLFdBQU8sTUFBTSxhQUFhO0FBQzFCLFdBQU8sTUFBTSxNQUFNO0FBQ25CLFdBQU8sTUFBTSxhQUFhO0FBQzFCLFdBQU8sTUFBTSxRQUFRO0FBRXJCLFVBQU0sTUFBTSxTQUFTLGNBQWMsT0FBTztBQUMxQyxRQUFJLE9BQU87QUFDWCxRQUFJLFVBQVUsTUFBTSxZQUFZO0FBQ2hDLFFBQUksV0FBVyxNQUFNO0FBQ25CLFlBQU0sVUFBVSxJQUFJO0FBQ3BCLFlBQU0sTUFBTSxVQUFVLElBQUk7QUFBQSxJQUM1QjtBQUVBLFdBQU8sWUFBWSxHQUFHO0FBQ3RCLFdBQU8sWUFBWSxTQUFTLGVBQWUsYUFBTSxNQUFNLFNBQVMsS0FBSyxNQUFNLFVBQVUsR0FBRyxDQUFDO0FBQ3pGLGNBQVUsWUFBWSxNQUFNO0FBRTVCLFVBQU0sWUFBWSxvQkFBSSxJQUFJO0FBQzFCLEtBQUMsTUFBTSxZQUFZLENBQUMsR0FBRyxRQUFRLFFBQU07QUFDbkMsWUFBTSxLQUFLLEdBQUcsVUFBVTtBQUN4QixVQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRyxXQUFVLElBQUksSUFBSSxDQUFDLENBQUM7QUFDNUMsZ0JBQVUsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFO0FBQUEsSUFDM0IsQ0FBQztBQUVELFFBQUksQ0FBQyxVQUFVLEtBQU0sV0FBVSxJQUFJLFdBQVcsQ0FBQyxDQUFDO0FBRWhELFVBQU0saUJBQWlCLFNBQVMsY0FBYyxLQUFLO0FBQ25ELG1CQUFlLE1BQU0sY0FBYztBQUNuQyxtQkFBZSxNQUFNLFlBQVk7QUFFakMsY0FBVSxRQUFRLENBQUMsT0FBTyxlQUFlO0FBQ3ZDLFlBQU0sU0FBUyxTQUFTLGNBQWMsS0FBSztBQUMzQyxhQUFPLE1BQU0sVUFBVTtBQUN2QixhQUFPLE1BQU0sYUFBYTtBQUMxQixhQUFPLE1BQU0sTUFBTTtBQUNuQixhQUFPLE1BQU0sUUFBUTtBQUVyQixZQUFNLFFBQVEsU0FBUyxjQUFjLE9BQU87QUFDNUMsWUFBTSxPQUFPO0FBQ2IsWUFBTSxVQUFVO0FBQ2hCLFlBQU0sV0FBVyxNQUFNO0FBQ3JCLHNCQUFjLFFBQVEsQ0FBQyxFQUFFLE1BQU0sV0FBVyxjQUFjLE1BQU0sTUFBTTtBQUNsRSxjQUFJLFVBQVUsY0FBYztBQUMxQixrQkFBTSxLQUFLLGFBQWEsSUFBSSxHQUFHLEtBQUssSUFBSSxTQUFTLEVBQUU7QUFDbkQsZ0JBQUksT0FBTyxHQUFHLFVBQVUsZUFBZSxZQUFZO0FBQ2pELG1CQUFLLFVBQVUsTUFBTTtBQUFBLFlBQ3ZCO0FBQUEsVUFDRjtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFFQSxhQUFPLFlBQVksS0FBSztBQUN4QixhQUFPLFlBQVksU0FBUyxlQUFlLGFBQU0sVUFBVSxFQUFFLENBQUM7QUFDOUQscUJBQWUsWUFBWSxNQUFNO0FBQUEsSUFDbkMsQ0FBQztBQUVELGNBQVUsWUFBWSxjQUFjO0FBQ3BDLFdBQU8sWUFBWSxTQUFTO0FBQUEsRUFDOUIsQ0FBQztBQUNIO0FBRUEsU0FBUyxhQUFhLE9BQU87QUFDM0IsUUFBTSxTQUFTLE9BQUs7QUFDbEIsUUFBSSxFQUFFLFFBQVE7QUFDWixVQUFJLEVBQUUsU0FBVSxHQUFFLFNBQVMsUUFBUTtBQUNuQyxVQUFJLEVBQUUsVUFBVTtBQUNkLFlBQUksTUFBTSxRQUFRLEVBQUUsUUFBUSxFQUFHLEdBQUUsU0FBUyxRQUFRLE9BQUssRUFBRSxRQUFRLENBQUM7QUFBQSxZQUM3RCxHQUFFLFNBQVMsUUFBUTtBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBR0EsU0FBUyx5QkFBeUI7QUFDaEMsUUFBTSxPQUFPLFNBQVMsaUJBQWlCLHVCQUF1QjtBQUM5RCxPQUFLLFFBQVEsU0FBTztBQUNsQixVQUFNLE9BQU8sSUFBSSxRQUFRO0FBQ3pCLFVBQU0sU0FBUyxJQUFJLGNBQWMsVUFBVTtBQUMzQyxVQUFNLFdBQVcsSUFBSSxjQUFjLFlBQVk7QUFDL0MsVUFBTSxVQUFVLElBQUksY0FBYyxXQUFXO0FBQzdDLFVBQU0sU0FBUyxJQUFJLGNBQWMsc0JBQXNCO0FBQ3ZELFVBQU0sVUFBVSxJQUFJLGNBQWMsbUJBQW1CO0FBRXJELFFBQUksUUFBUTtBQUNWLGFBQU8sVUFBVSxNQUFNO0FBQ3JCLGNBQU0saUJBQWlCLE9BQU8sVUFBVSxTQUFTLFFBQVE7QUFDekQsZ0NBQXdCLE1BQU0sQ0FBQyxjQUFjO0FBQzdDLGVBQU8sVUFBVSxPQUFPLFVBQVUsQ0FBQyxjQUFjO0FBQ2pELGVBQU8sY0FBYyxDQUFDLGlCQUFpQixjQUFPO0FBQUEsTUFDaEQ7QUFBQSxJQUNGO0FBRUEsUUFBSSxVQUFVO0FBQ1osZUFBUyxVQUFVLE1BQU07QUFDdkIsY0FBTSxVQUFVLFNBQVMsVUFBVSxTQUFTLGNBQWM7QUFDMUQsOEJBQXNCLE1BQU0sQ0FBQyxPQUFPO0FBQ3BDLGlCQUFTLFVBQVUsT0FBTyxnQkFBZ0IsQ0FBQyxPQUFPO0FBQ2xELFlBQUksQ0FBQyxTQUFTO0FBQ1osY0FBSSxPQUFRLFFBQU8sUUFBUTtBQUMzQixjQUFJLFFBQVMsU0FBUSxjQUFjO0FBQUEsUUFDckMsT0FBTztBQUNMLGNBQUksT0FBUSxRQUFPLFFBQVE7QUFDM0IsY0FBSSxRQUFTLFNBQVEsY0FBYztBQUFBLFFBQ3JDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFQSxRQUFJLFNBQVM7QUFDWCxjQUFRLFVBQVUsTUFBTTtBQUN0QixhQUFLLFFBQVEsT0FBSztBQUNoQixnQkFBTSxJQUFJLEVBQUUsUUFBUTtBQUNwQixnQkFBTSxPQUFPLEVBQUUsY0FBYyxVQUFVO0FBQ3ZDLGNBQUksTUFBTSxNQUFNO0FBQ2Qsb0NBQXdCLEdBQUcsSUFBSTtBQUMvQixnQkFBSSxNQUFNO0FBQUUsbUJBQUssVUFBVSxJQUFJLFFBQVE7QUFBRyxtQkFBSyxjQUFjO0FBQUEsWUFBTTtBQUFBLFVBQ3JFLE9BQU87QUFDTCxvQ0FBd0IsR0FBRyxLQUFLO0FBQ2hDLGdCQUFJLE1BQU07QUFBRSxtQkFBSyxVQUFVLE9BQU8sUUFBUTtBQUFHLG1CQUFLLGNBQWM7QUFBQSxZQUFNO0FBQUEsVUFDeEU7QUFBQSxRQUNGLENBQUM7QUFDRCxrQkFBVSxTQUFTLElBQUksRUFBRTtBQUFBLE1BQzNCO0FBQUEsSUFDRjtBQUVBLFFBQUksUUFBUTtBQUNWLGFBQU8sVUFBVSxNQUFNO0FBQ3JCLGNBQU0sUUFBUSxTQUFTLE9BQU8sT0FBTyxFQUFFLElBQUk7QUFDM0MsWUFBSSxRQUFTLFNBQVEsY0FBYyxHQUFHLE9BQU8sS0FBSztBQUNsRCw2QkFBcUIsTUFBTSxLQUFLO0FBQUEsTUFDbEM7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFQSxTQUFTLHdCQUF3QixZQUFZLFNBQVM7QUFDcEQsZUFBYSxRQUFRLFdBQVM7QUFDNUIsUUFBSSxrQkFBa0IsTUFBTSxZQUFZLFVBQVUsR0FBRztBQUNuRCxZQUFNLFVBQVU7QUFDaEIsWUFBTSxNQUFNLFVBQVU7QUFBQSxJQUN4QjtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRUEsU0FBUyxzQkFBc0IsWUFBWSxTQUFTO0FBQ2xELGVBQWEsUUFBUSxXQUFTO0FBQzVCLFFBQUksa0JBQWtCLE1BQU0sWUFBWSxVQUFVLEdBQUc7QUFDbkQsWUFBTSxZQUFZO0FBQ2xCLFlBQU0sTUFBTSxTQUFTLE9BQUs7QUFDeEIsWUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVO0FBQzFCLGNBQUksQ0FBQyxFQUFFLFNBQVMsbUJBQW1CO0FBQ2pDLGNBQUUsU0FBUyxvQkFBb0I7QUFBQSxjQUM3QixPQUFPLEVBQUUsU0FBUyxNQUFNLE1BQU07QUFBQSxjQUM5QixTQUFTLEVBQUUsU0FBUztBQUFBLGNBQ3BCLGFBQWEsRUFBRSxTQUFTO0FBQUEsY0FDeEIsWUFBWSxFQUFFLFNBQVM7QUFBQSxZQUN6QjtBQUFBLFVBQ0Y7QUFDQSxjQUFJLFNBQVM7QUFDWCxjQUFFLFNBQVMsY0FBYztBQUN6QixjQUFFLFNBQVMsVUFBVTtBQUNyQixjQUFFLFNBQVMsYUFBYTtBQUN4QixjQUFFLFNBQVMsTUFBTSxPQUFPLE9BQVE7QUFBQSxVQUNsQyxPQUFPO0FBQ0wsa0JBQU0sSUFBSSxFQUFFLFNBQVM7QUFDckIsY0FBRSxTQUFTLGNBQWMsRUFBRTtBQUMzQixjQUFFLFNBQVMsVUFBVSxFQUFFO0FBQ3ZCLGNBQUUsU0FBUyxhQUFhLEVBQUU7QUFDMUIsY0FBRSxTQUFTLE1BQU0sS0FBSyxFQUFFLEtBQUs7QUFBQSxVQUMvQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFQSxTQUFTLHFCQUFxQixZQUFZLFNBQVM7QUFDakQsZUFBYSxRQUFRLFdBQVM7QUFDNUIsUUFBSSxrQkFBa0IsTUFBTSxZQUFZLFVBQVUsR0FBRztBQUNuRCxZQUFNLFVBQVU7QUFDaEIsWUFBTSxNQUFNLFNBQVMsT0FBSztBQUN4QixZQUFJLEVBQUUsVUFBVSxFQUFFLFVBQVU7QUFDMUIsY0FBSSxDQUFDLEVBQUUsU0FBUyxtQkFBbUI7QUFDakMsY0FBRSxTQUFTLG9CQUFvQjtBQUFBLGNBQzdCLE9BQU8sRUFBRSxTQUFTLE1BQU0sTUFBTTtBQUFBLGNBQzlCLFNBQVMsRUFBRSxTQUFTO0FBQUEsY0FDcEIsYUFBYSxFQUFFLFNBQVM7QUFBQSxjQUN4QixZQUFZLEVBQUUsU0FBUztBQUFBLFlBQ3pCO0FBQUEsVUFDRjtBQUNBLFlBQUUsU0FBUyxjQUFjLFVBQVU7QUFDbkMsWUFBRSxTQUFTLFVBQVU7QUFDckIsWUFBRSxTQUFTLGFBQWEsV0FBVztBQUFBLFFBQ3JDO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0YsQ0FBQztBQUNIO0FBRUEsU0FBUyxrQkFBa0IsV0FBVyxZQUFZO0FBQ2hELE1BQUksQ0FBQyxhQUFhLENBQUMsV0FBWSxRQUFPO0FBQ3RDLFFBQU0sSUFBSSxVQUFVLFlBQVk7QUFDaEMsUUFBTSxJQUFJLFdBQVcsWUFBWTtBQUNqQyxNQUFJLE1BQU0sRUFBRyxRQUFPO0FBQ3BCLE1BQUksTUFBTSxVQUFVLEVBQUUsU0FBUyxNQUFNLEtBQUssRUFBRSxTQUFTLE9BQU8sS0FBSyxFQUFFLFNBQVMsTUFBTSxLQUFLLEVBQUUsU0FBUyxNQUFNLEdBQUksUUFBTztBQUNuSCxNQUFJLE1BQU0saUJBQWlCLEVBQUUsU0FBUyxPQUFPLEtBQUssRUFBRSxTQUFTLEtBQUssR0FBSSxRQUFPO0FBQzdFLE1BQUksTUFBTSxtQkFBbUIsRUFBRSxTQUFTLEtBQUssS0FBSyxFQUFFLFNBQVMsTUFBTSxHQUFJLFFBQU87QUFDOUUsU0FBTztBQUNUO0FBR0EsU0FBUyxpQkFBaUI7QUFDeEIscUJBQW1CO0FBQ25CLE1BQUksSUFBSSxNQUFPLEtBQUksTUFBTSxZQUFZO0FBQ3JDLE1BQUksSUFBSSxZQUFZO0FBQ2xCLFFBQUksV0FBVyxjQUFjO0FBQzdCLFFBQUksV0FBVyxZQUFZO0FBQUEsRUFDN0I7QUFDQSxNQUFJLElBQUksTUFBTyxLQUFJLE1BQU0sWUFBWTtBQUVyQyxnQkFBYyxRQUFRLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDbEMsUUFBSSxLQUFLLFNBQVMsV0FBVztBQUMzQixXQUFLLFNBQVMsTUFBTSxLQUFLLEtBQUssU0FBUyxTQUFTO0FBQUEsSUFDbEQ7QUFDQSxRQUFJLEtBQUssU0FBUyxTQUFVLE1BQUssU0FBUyxTQUFTLE9BQU8sQ0FBUTtBQUNsRSxVQUFNLElBQUksS0FBSyxTQUFTO0FBQ3hCLFFBQUksR0FBRztBQUNMLFdBQUssU0FBUyxjQUFjLEVBQUU7QUFDOUIsV0FBSyxTQUFTLFVBQVUsRUFBRTtBQUMxQixXQUFLLFNBQVMsYUFBYSxFQUFFO0FBQUEsSUFDL0I7QUFBQSxFQUNGLENBQUM7QUFDSDtBQUVBLGVBQWUsY0FBYyxNQUFNLFdBQVcsY0FBYztBQUMxRCxpQkFBZTtBQUNmLFFBQU0sWUFBWSxHQUFHLFlBQVksSUFBSSxTQUFTO0FBQzlDLE1BQUksS0FBSyxhQUFhLElBQUksU0FBUyxLQUFLLGFBQWEsSUFBSSxPQUFPLFNBQVMsQ0FBQyxLQUFLLEtBQUssU0FBUztBQUU3RixxQkFBbUIsRUFBRSxNQUFNLFNBQVMsSUFBSSxXQUFXLGFBQWE7QUFFaEUsTUFBSSxDQUFDLEtBQUssU0FBUyxVQUFXLE1BQUssU0FBUyxZQUFZLEtBQUssU0FBUyxNQUFNLE1BQU07QUFDbEYsT0FBSyxTQUFTLE1BQU0sS0FBSyxhQUFhLEtBQUs7QUFDM0MsTUFBSSxLQUFLLFNBQVMsU0FBVSxNQUFLLFNBQVMsU0FBUyxLQUFLLGFBQWEsUUFBUTtBQUU3RSxRQUFNLGFBQWEsYUFBYSxJQUFJLFlBQVk7QUFDaEQsUUFBTSxhQUFjLGNBQWMsV0FBVyxjQUFlLEtBQUssU0FBUyxjQUFjO0FBQ3hGLFFBQU0sWUFBYSxjQUFjLFdBQVcsYUFBYztBQUUxRCx5QkFBdUIsSUFBSSxXQUFXLFdBQVcsWUFBWSxJQUFJO0FBRWpFLE1BQUksT0FBTyxDQUFDLEdBQUcsY0FBYyxDQUFDLE9BQU8sS0FBSyxHQUFHLFVBQVUsRUFBRSxTQUFTO0FBQ2hFLFFBQUk7QUFDRixZQUFNLFVBQVUsTUFBTSxPQUFPLEtBQUssRUFBRSxRQUFRLElBQUksYUFBYSxNQUFNLEVBQUUsU0FBUyxHQUFHLEtBQUssRUFBRSxDQUFDO0FBQ3pGLFVBQUksUUFBUSxXQUFXLG9CQUFvQixpQkFBaUIsY0FBYyxXQUFXO0FBQ25GLGVBQU8sT0FBTyxJQUFJLFFBQVEsT0FBTztBQUNqQywrQkFBdUIsSUFBSSxXQUFXLFdBQVcsWUFBWSxJQUFJO0FBQUEsTUFDbkU7QUFBQSxJQUNGLFNBQVMsR0FBRztBQUFBLElBQUM7QUFBQSxFQUNmLFdBQVcsQ0FBQyxNQUFNLGNBQWMsUUFBUTtBQUN0QyxRQUFJO0FBQ0YsWUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLFdBQVcsWUFBWSxTQUFTO0FBQ3RFLDRCQUFzQixXQUFXLFVBQVUsV0FBVyxVQUFVO0FBQUEsSUFDbEUsU0FBUyxHQUFHO0FBQUEsSUFBQztBQUFBLEVBQ2Y7QUFDRjtBQUVBLFNBQVMsdUJBQXVCLElBQUksV0FBVyxXQUFXLFlBQVksTUFBTTtBQUMxRSxNQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsSUFBSSxNQUFPO0FBRW5DLFFBQU0sUUFBUyxPQUFPLEdBQUcsU0FBUyxHQUFHLGlCQUFrQixRQUFRLFNBQVM7QUFDeEUsUUFBTSxPQUFRLE1BQU0sR0FBRyxhQUFjO0FBQ3JDLE1BQUksV0FBVyxjQUFjLEdBQUcsS0FBSyxJQUFJLE9BQU8sSUFBSSxJQUFJLE1BQU0sRUFBRTtBQUNoRSxNQUFJLFdBQVcsWUFBWTtBQUMzQixNQUFJLE1BQU0sWUFBWTtBQUd0QixRQUFNLFlBQVksU0FBUyxjQUFjLEtBQUs7QUFDOUMsWUFBVSxNQUFNLGVBQWU7QUFDL0IsWUFBVSxZQUFZO0FBQUEsMENBQ2tCLFNBQVM7QUFBQSw4QkFDckIsVUFBVTtBQUFBLE1BQ2xDLE1BQU0sR0FBRyxTQUFTLDJCQUEyQixHQUFHLE1BQU0sWUFBWSxFQUFFO0FBQUEsK0JBQzNDLFNBQVM7QUFBQTtBQUV0QyxNQUFJLE1BQU0sWUFBWSxTQUFTO0FBRy9CLE1BQUksUUFBUSxLQUFLLFVBQVU7QUFDekIsUUFBSSxDQUFDLEtBQUssU0FBUyxZQUFhLE1BQUssU0FBUyxtQkFBbUI7QUFDakUsVUFBTSxNQUFNLEtBQUssU0FBUyxZQUFZLE1BQU0sRUFBRSxhQUFhLEtBQUssV0FBVztBQUMzRSxVQUFNLE9BQU8sSUFBSSxRQUFRLElBQUksTUFBTSxRQUFRLENBQUM7QUFDNUMsVUFBTSxTQUFTLElBQUksVUFBVSxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRWhELFVBQU0sYUFBYSxTQUFTLGNBQWMsS0FBSztBQUMvQyxlQUFXLE1BQU0sVUFBVTtBQUMzQixlQUFXLGNBQWM7QUFDekIsUUFBSSxNQUFNLFlBQVksVUFBVTtBQUVoQyxVQUFNLFlBQVksU0FBUyxjQUFjLE9BQU87QUFDaEQsY0FBVSxZQUFZO0FBQ3RCLGNBQVUsWUFBWTtBQUFBLCtDQUNlLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxVQUFPLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxVQUFPLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLHNDQUNwRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQTtBQUVyRyxRQUFJLE1BQU0sWUFBWSxTQUFTO0FBQUEsRUFDakM7QUFHQSxRQUFNLElBQUssTUFBTSxHQUFHLGNBQWUsQ0FBQztBQUNwQyxRQUFNLFFBQVEsT0FBTyxLQUFLLENBQUM7QUFDM0IsTUFBSSxNQUFNLFFBQVE7QUFDaEIsVUFBTSxVQUFVLFNBQVMsY0FBYyxLQUFLO0FBQzVDLFlBQVEsTUFBTSxVQUFVO0FBQ3hCLFlBQVEsY0FBYztBQUN0QixRQUFJLE1BQU0sWUFBWSxPQUFPO0FBRTdCLFVBQU0sU0FBUyxTQUFTLGNBQWMsT0FBTztBQUM3QyxXQUFPLFlBQVk7QUFDbkIsVUFBTSxRQUFRLE9BQUs7QUFDakIsWUFBTSxLQUFLLFNBQVMsY0FBYyxJQUFJO0FBQ3RDLFNBQUcsWUFBWSxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUN2QyxhQUFPLFlBQVksRUFBRTtBQUFBLElBQ3ZCLENBQUM7QUFDRCxRQUFJLE1BQU0sWUFBWSxNQUFNO0FBQUEsRUFDOUI7QUFHQSxRQUFNLElBQUssTUFBTSxHQUFHLGNBQWUsQ0FBQztBQUNwQyxRQUFNLFFBQVEsT0FBTyxLQUFLLENBQUMsRUFBRSxPQUFPLE9BQUssQ0FBQyxDQUFDLFVBQVUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzVFLE1BQUksTUFBTSxRQUFRO0FBQ2hCLFVBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxZQUFRLE1BQU0sVUFBVTtBQUN4QixZQUFRLGNBQWM7QUFDdEIsUUFBSSxNQUFNLFlBQVksT0FBTztBQUU3QixVQUFNLFNBQVMsU0FBUyxjQUFjLE9BQU87QUFDN0MsV0FBTyxZQUFZO0FBQ25CLFVBQU0sTUFBTSxHQUFHLEVBQUUsRUFBRSxRQUFRLE9BQUs7QUFDOUIsWUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDLE1BQU0sV0FBVyxLQUFLLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZFLFlBQU0sS0FBSyxTQUFTLGNBQWMsSUFBSTtBQUN0QyxTQUFHLFlBQVksT0FBTyxDQUFDLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pELGFBQU8sWUFBWSxFQUFFO0FBQUEsSUFDdkIsQ0FBQztBQUNELFFBQUksTUFBTSxZQUFZLE1BQU07QUFBQSxFQUM5QjtBQUVBLE1BQUksTUFBTSxHQUFHLEtBQU0sY0FBYSxHQUFHLElBQUk7QUFDekM7QUFFQSxTQUFTLHNCQUFzQixXQUFXLE9BQU8sV0FBVyxZQUFZO0FBQ3RFLE1BQUksQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLE1BQU87QUFDbkMsTUFBSSxXQUFXLGNBQWMsUUFBUSxTQUFTLElBQUksTUFBTSxRQUFRLEVBQUU7QUFDbEUsTUFBSSxXQUFXLFlBQVk7QUFDM0IsTUFBSSxNQUFNLFlBQVk7QUFBQTtBQUFBLDRDQUVvQixTQUFTO0FBQUEsZ0NBQ3JCLFVBQVU7QUFBQTtBQUFBO0FBSXhDLFFBQU0sUUFBUSxTQUFTLGNBQWMsT0FBTztBQUM1QyxRQUFNLFlBQVk7QUFDbEIsU0FBTyxLQUFLLEtBQUssRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLFFBQVEsT0FBSztBQUMzQyxVQUFNLElBQUksTUFBTSxDQUFDO0FBQ2pCLFVBQU0sTUFBTSxLQUFLLE9BQU8sTUFBTSxZQUFZLEVBQUUsVUFBVSxTQUFZLEVBQUUsUUFBUyxPQUFPLE1BQU0sV0FBVyxLQUFLLFVBQVUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLElBQUk7QUFDdEksVUFBTSxLQUFLLFNBQVMsY0FBYyxJQUFJO0FBQ3RDLE9BQUcsWUFBWSxPQUFPLENBQUMsWUFBWSxPQUFPLEdBQUcsQ0FBQztBQUM5QyxVQUFNLFlBQVksRUFBRTtBQUFBLEVBQ3RCLENBQUM7QUFDRCxNQUFJLE1BQU0sWUFBWSxLQUFLO0FBQzdCO0FBRUEsZUFBZSxhQUFhLFlBQVk7QUFDdEMsTUFBSSxDQUFDLElBQUksTUFBTztBQUNoQixNQUFJO0FBQ0YsVUFBTSxNQUFNLE1BQU0sT0FBTyxLQUFLLEVBQUUsUUFBUSxJQUFJLGdCQUFnQixNQUFNLEVBQUUsYUFBYSxXQUFXLEVBQUUsQ0FBQztBQUMvRixVQUFNLFFBQVEsSUFBSSxXQUFXLENBQUM7QUFDOUIsUUFBSSxDQUFDLE1BQU0sUUFBUTtBQUNqQixVQUFJLE1BQU0sWUFBWTtBQUN0QjtBQUFBLElBQ0Y7QUFDQSxRQUFJLE1BQU0sWUFBWSxNQUFNLElBQUksT0FBSztBQUFBO0FBQUEsZ0JBRXpCLEVBQUUsa0JBQWtCLDRCQUE0QixFQUFFLGtCQUFrQjtBQUFBLHlDQUMzQyxFQUFFLElBQUk7QUFBQTtBQUFBLEtBRTFDLEVBQUUsS0FBSyxFQUFFO0FBRVYsUUFBSSxNQUFNLGlCQUFpQixNQUFNLEVBQUUsUUFBUSxPQUFLO0FBQzlDLFFBQUUsVUFBVSxZQUFZO0FBQ3RCLGNBQU0sT0FBTyxLQUFLLEVBQUUsUUFBUSxJQUFJLGlCQUFpQixNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsS0FBSyxFQUFFLENBQUM7QUFDakYscUJBQWEsVUFBVTtBQUFBLE1BQ3pCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxTQUFTLEdBQUc7QUFDVixRQUFJLE1BQU0sWUFBWTtBQUFBLEVBQ3hCO0FBQ0Y7QUFHQSxlQUFlLHdCQUF3QjtBQUNyQyxRQUFNLFNBQVMsU0FBUyxlQUFlLGNBQWMsS0FBSyxDQUFDLEdBQUcsU0FBUztBQUN2RSxRQUFNLFNBQVMsU0FBUyxlQUFlLGNBQWMsS0FBSyxDQUFDLEdBQUcsU0FBUztBQUN2RSxRQUFNLFdBQVcsU0FBUyxlQUFlLGlCQUFpQjtBQUMxRCxRQUFNLFlBQVksV0FBVyxXQUFXLFNBQVMsS0FBSyxLQUFLLElBQU07QUFFakUsWUFBVSxtQ0FBbUMsS0FBSyxRQUFRLEtBQUssUUFBRztBQUNsRSxjQUFZLDBDQUFxQyxJQUFJO0FBRXJELFFBQU0sVUFBVSxDQUFDO0FBQ2pCLFFBQU0sVUFBVSxDQUFDO0FBRWpCLGVBQWEsUUFBUSxXQUFTO0FBQzVCLFFBQUksa0JBQWtCLE1BQU0sWUFBWSxLQUFLLEdBQUc7QUFDOUMsWUFBTSxNQUFNLFNBQVMsT0FBSztBQUFFLFlBQUksRUFBRSxPQUFRLFNBQVEsS0FBSyxDQUFDO0FBQUEsTUFBRyxDQUFDO0FBQUEsSUFDOUQ7QUFDQSxRQUFJLGtCQUFrQixNQUFNLFlBQVksS0FBSyxHQUFHO0FBQzlDLFlBQU0sTUFBTSxTQUFTLE9BQUs7QUFBRSxZQUFJLEVBQUUsT0FBUSxTQUFRLEtBQUssQ0FBQztBQUFBLE1BQUcsQ0FBQztBQUFBLElBQzlEO0FBQUEsRUFDRixDQUFDO0FBRUQsTUFBSSxDQUFDLFFBQVEsVUFBVSxDQUFDLFFBQVEsUUFBUTtBQUN0QyxnQkFBWSxJQUFJLEtBQUs7QUFDckIsY0FBVSxxREFBcUQsS0FBSyxRQUFRLEtBQUssY0FBYztBQUMvRixRQUFJLElBQUksZ0JBQWdCO0FBQ3RCLFVBQUksZUFBZSxZQUFZLGdEQUFnRCxLQUFLLFFBQVEsS0FBSztBQUFBLElBQ25HO0FBQ0E7QUFBQSxFQUNGO0FBR0EsUUFBTSxZQUFZLFlBQVksSUFBSTtBQUNsQyxRQUFNLFNBQVMsY0FBYyxTQUFTLFNBQVMsRUFBRSxVQUFVLENBQUM7QUFDNUQsUUFBTSxZQUFZLFlBQVksSUFBSSxJQUFJLFdBQVcsUUFBUSxDQUFDO0FBRTFELG9CQUFrQixPQUFPLFdBQVcsQ0FBQztBQUNyQyxZQUFVLHlCQUF5QixnQkFBZ0IsTUFBTSx3QkFBd0IsUUFBUSxPQUFPLE9BQU8sTUFBTSxpQkFBaUIsY0FBYztBQUM1SSxjQUFZLElBQUksS0FBSztBQUVyQixvQkFBa0I7QUFHbEIsUUFBTSxTQUFTLFNBQVMsZUFBZSxpQkFBaUI7QUFDeEQsTUFBSSxPQUFRLFFBQU8sTUFBTTtBQUMzQjtBQUVBLFNBQVMsb0JBQW9CO0FBQzNCLE1BQUksQ0FBQyxJQUFJLGVBQWdCO0FBQ3pCLE1BQUksZUFBZSxZQUFZO0FBRS9CLE1BQUksSUFBSSxpQkFBaUI7QUFDdkIsUUFBSSxnQkFBZ0IsY0FBYyxnQkFBZ0I7QUFDbEQsUUFBSSxnQkFBZ0IsTUFBTSxVQUFVLGdCQUFnQixTQUFTLGlCQUFpQjtBQUFBLEVBQ2hGO0FBRUEsTUFBSSxDQUFDLGdCQUFnQixRQUFRO0FBQzNCLFFBQUksZUFBZSxZQUFZO0FBQy9CO0FBQUEsRUFDRjtBQUVBLFFBQU0sYUFBYSxTQUFTLGVBQWUsdUJBQXVCLEtBQUssQ0FBQyxHQUFHLFNBQVM7QUFDcEYsUUFBTSxXQUFXLFlBQVksZ0JBQWdCLE9BQU8sT0FBSyxFQUFFLGFBQWEsU0FBUyxJQUFJO0FBRXJGLFdBQVMsUUFBUSxDQUFDLFVBQVU7QUFDMUIsVUFBTSxPQUFPLFNBQVMsY0FBYyxLQUFLO0FBQ3pDLFNBQUssWUFBWSxnQkFBZ0IsZUFBZSxZQUFZLE9BQU8sTUFBTSxLQUFLLFlBQVk7QUFDMUYsVUFBTSxLQUFLLE1BQU07QUFDakIsVUFBTSxXQUFXLE1BQU0sV0FBVyxZQUFZLE1BQU0sU0FBUyxZQUFZLENBQUMsS0FBSztBQUUvRSxTQUFLLFlBQVk7QUFBQSxzQ0FDaUIsTUFBTSxTQUFTLFVBQVUsS0FBSyxNQUFNLFNBQVMsU0FBUyxTQUFNLE1BQU0sU0FBUyxVQUFVLEtBQUssTUFBTSxTQUFTLFNBQVM7QUFBQTtBQUFBLGlDQUV2SCxRQUFRLEtBQUssTUFBTSxRQUFRO0FBQUEsOENBQ2QsTUFBTSxNQUFNO0FBQUEsOENBQ1osTUFBTSxTQUFTLFdBQVcsU0FBUyxNQUFNLE1BQU0sU0FBUyxXQUFXLFNBQVM7QUFBQTtBQUFBLDZDQUU3RSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsY0FBYyxNQUFNLG1CQUFtQixNQUFNLGlCQUFpQixRQUFRLENBQUMsSUFBSSxHQUFHO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFNOUssU0FBSyxVQUFVLE1BQU0sWUFBWSxLQUFLO0FBQ3RDLFVBQU0sU0FBUyxLQUFLLGNBQWMsVUFBVTtBQUM1QyxRQUFJLFFBQVE7QUFDVixhQUFPLFVBQVUsQ0FBQyxNQUFNO0FBQ3RCLFVBQUUsZ0JBQWdCO0FBQ2xCLG9CQUFZLEtBQUs7QUFDakIsbUJBQVcsS0FBSztBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUVBLFFBQUksZUFBZSxZQUFZLElBQUk7QUFBQSxFQUNyQyxDQUFDO0FBQ0g7QUFFQSxTQUFTLFlBQVksT0FBTztBQUMxQixnQkFBYztBQUNkLG9CQUFrQjtBQUNsQix5QkFBdUIsS0FBSztBQUM1Qix3QkFBc0IsS0FBSztBQUM3QjtBQUVBLFNBQVMsdUJBQXVCLE9BQU87QUFDckMsb0JBQWtCLE1BQU07QUFHeEIsZ0JBQWMsUUFBUSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ2xDLFFBQUksQ0FBQyxLQUFLLFNBQVMsbUJBQW1CO0FBQ3BDLFdBQUssU0FBUyxvQkFBb0I7QUFBQSxRQUNoQyxhQUFhLEtBQUssU0FBUztBQUFBLFFBQzNCLFNBQVMsS0FBSyxTQUFTO0FBQUEsUUFDdkIsWUFBWSxLQUFLLFNBQVM7QUFBQSxNQUM1QjtBQUFBLElBQ0Y7QUFDQSxRQUFJLEtBQUssU0FBUyxVQUFXLE1BQUssU0FBUyxNQUFNLEtBQUssS0FBSyxTQUFTLFNBQVM7QUFDN0UsUUFBSSxLQUFLLFNBQVMsU0FBVSxNQUFLLFNBQVMsU0FBUyxPQUFPLENBQVE7QUFDbEUsU0FBSyxTQUFTLGNBQWM7QUFDNUIsU0FBSyxTQUFTLFVBQVU7QUFBQSxFQUMxQixDQUFDO0FBRUQsUUFBTSxRQUFRLE1BQU0sU0FBUztBQUM3QixRQUFNLFFBQVEsTUFBTSxTQUFTO0FBRTdCLE1BQUksT0FBTztBQUNULFFBQUksQ0FBQyxNQUFNLFNBQVMsVUFBVyxPQUFNLFNBQVMsWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNO0FBQ3JGLFVBQU0sU0FBUyxNQUFNLEtBQUssVUFBVSxLQUFLO0FBQ3pDLFFBQUksTUFBTSxTQUFTLFNBQVUsT0FBTSxTQUFTLFNBQVMsS0FBSyxVQUFVLFFBQVE7QUFDNUUsVUFBTSxTQUFTLGNBQWM7QUFDN0IsVUFBTSxTQUFTLFVBQVU7QUFBQSxFQUMzQjtBQUVBLE1BQUksT0FBTztBQUNULFFBQUksQ0FBQyxNQUFNLFNBQVMsVUFBVyxPQUFNLFNBQVMsWUFBWSxNQUFNLFNBQVMsTUFBTSxNQUFNO0FBQ3JGLFVBQU0sU0FBUyxNQUFNLEtBQUssVUFBVSxLQUFLO0FBQ3pDLFFBQUksTUFBTSxTQUFTLFNBQVUsT0FBTSxTQUFTLFNBQVMsS0FBSyxVQUFVLFFBQVE7QUFDNUUsVUFBTSxTQUFTLGNBQWM7QUFDN0IsVUFBTSxTQUFTLFVBQVU7QUFBQSxFQUMzQjtBQUdBLFFBQU0sU0FBUyxxQkFBcUIsTUFBTSxjQUFjO0FBQ3hELG9CQUFrQixJQUFJLE1BQU07QUFHNUIsTUFBSSxNQUFNLGFBQWE7QUFDckIsVUFBTSxZQUFZLDRCQUE0QixNQUFNLFdBQVc7QUFDL0QsUUFBSSxVQUFXLG1CQUFrQixJQUFJLFNBQVM7QUFBQSxFQUNoRDtBQUNGO0FBRUEsU0FBUyxXQUFXLE9BQU87QUFDekIsUUFBTSxZQUFZLElBQUksTUFBTSxRQUFRLE1BQU0sZUFBZSxHQUFHLE1BQU0sZUFBZSxHQUFHLE1BQU0sZUFBZSxDQUFDO0FBQzFHLFFBQU0sV0FBVztBQUNqQixRQUFNLFNBQVMsVUFBVSxNQUFNLEVBQUUsSUFBSSxJQUFJLE1BQU0sUUFBUSxXQUFXLEtBQUssV0FBVyxLQUFLLFdBQVcsR0FBRyxDQUFDO0FBRXRHLFFBQU0sV0FBVyxPQUFPLFNBQVMsTUFBTTtBQUN2QyxRQUFNLGNBQWMsU0FBUyxPQUFPLE1BQU07QUFDMUMsUUFBTSxZQUFZLFlBQVksSUFBSTtBQUNsQyxRQUFNLFdBQVc7QUFFakIsV0FBUyxZQUFZLEtBQUs7QUFDeEIsVUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLGFBQWEsVUFBVSxDQUFHO0FBQ3BELFVBQU0sT0FBTyxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksS0FBSztBQUN0RCxXQUFPLFNBQVMsWUFBWSxVQUFVLFFBQVEsSUFBSTtBQUNsRCxhQUFTLE9BQU8sWUFBWSxhQUFhLFdBQVcsSUFBSTtBQUN4RCxhQUFTLE9BQU87QUFDaEIsUUFBSSxJQUFJLEVBQUssdUJBQXNCLFdBQVc7QUFBQSxFQUNoRDtBQUNBLHdCQUFzQixXQUFXO0FBQ2pDLFlBQVUsY0FBYyxNQUFNLEVBQUUsUUFBUSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRztBQUN6SDtBQUdBLFNBQVMsc0JBQXNCLE9BQU87QUFDcEMsTUFBSSxDQUFDLElBQUksd0JBQXdCLENBQUMsSUFBSSxtQkFBb0I7QUFDMUQsTUFBSSxtQkFBbUIsTUFBTSxVQUFVO0FBQ3ZDLE1BQUkscUJBQXFCLE1BQU0sVUFBVTtBQUV6QyxRQUFNLFVBQVUsU0FBUyxlQUFlLG9CQUFvQjtBQUM1RCxRQUFNLFNBQVMsU0FBUyxlQUFlLG1CQUFtQjtBQUMxRCxRQUFNLFdBQVcsU0FBUyxlQUFlLHVCQUF1QjtBQUVoRSxNQUFJLFFBQVMsU0FBUSxjQUFjLEdBQUcsTUFBTSxTQUFTLFVBQVUsS0FBSyxNQUFNLFNBQVMsU0FBUyxTQUFNLE1BQU0sU0FBUyxVQUFVLEtBQUssTUFBTSxTQUFTLFNBQVM7QUFDeEosTUFBSSxVQUFVO0FBQ1osYUFBUyxjQUFjLE1BQU07QUFDN0IsYUFBUyxZQUFZLHVCQUF1QixNQUFNLFlBQVksU0FBUyxZQUFZLENBQUM7QUFBQSxFQUN0RjtBQUNBLE1BQUksUUFBUTtBQUNWLFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFdBQU8sWUFBWTtBQUFBLHNEQUMrQixHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFBQSxrREFDM0QsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsQ0FBQyxtQ0FBbUMsTUFBTSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUFBLHlDQUM1SCxNQUFNLFNBQVMsU0FBUyxLQUFLLE1BQU0sU0FBUyxPQUFPO0FBQUEseUNBQ25ELE1BQU0sU0FBUyxTQUFTLEtBQUssTUFBTSxTQUFTLE9BQU87QUFBQTtBQUFBLEVBRTFGO0FBRUEsb0JBQWtCLE1BQU0sRUFBRTtBQUM1QjtBQUVBLGVBQWUsa0JBQWtCLFNBQVM7QUFDeEMsTUFBSSxDQUFDLElBQUksb0JBQXFCO0FBQzlCLE1BQUksb0JBQW9CLFlBQVk7QUFFcEMsTUFBSTtBQUNGLFVBQU0sTUFBTSxNQUFNLE9BQU8sS0FBSyxFQUFFLFFBQVEsSUFBSSxxQkFBcUIsTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLENBQUM7QUFDM0YsVUFBTSxXQUFXLElBQUksV0FBVyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxTQUFTLFFBQVE7QUFDcEIsVUFBSSxvQkFBb0IsWUFBWTtBQUNwQztBQUFBLElBQ0Y7QUFFQSxRQUFJLG9CQUFvQixZQUFZLFNBQVMsSUFBSSxPQUFLO0FBQUE7QUFBQTtBQUFBLG9CQUd0QyxFQUFFLFFBQVEsZUFBZTtBQUFBLGtCQUMzQixFQUFFLFdBQVcsRUFBRSxTQUFTLE1BQU0sR0FBRyxFQUFFLElBQUksVUFBVTtBQUFBO0FBQUEsMENBRXpCLEVBQUUsV0FBVyxFQUFFO0FBQUEsVUFDL0MsRUFBRSxXQUFXLGFBQWEsRUFBRSxRQUFRLHdDQUF3QyxFQUFFO0FBQUE7QUFBQSxLQUVuRixFQUFFLEtBQUssRUFBRTtBQUFBLEVBQ1osU0FBUyxHQUFHO0FBQ1YsUUFBSSxvQkFBb0IsWUFBWTtBQUFBLEVBQ3RDO0FBQ0Y7QUFFQSxlQUFlLG1CQUFtQjtBQUNoQyxNQUFJLENBQUMsZUFBZSxDQUFDLElBQUksa0JBQW1CO0FBQzVDLFFBQU0sT0FBTyxJQUFJLGtCQUFrQixNQUFNLEtBQUs7QUFDOUMsTUFBSSxDQUFDLEtBQU07QUFFWCxZQUFVLHVCQUFrQjtBQUM1QixNQUFJO0FBQ0YsVUFBTSxPQUFPLEtBQUs7QUFBQSxNQUNoQixRQUFRLElBQUk7QUFBQSxNQUNaLE1BQU0sRUFBRSxPQUFPLFlBQVksSUFBSSxTQUFTLE1BQU0sTUFBTyxPQUFPLFVBQVUsT0FBTyxXQUFXLE9BQU8sUUFBUSxRQUFTLGdCQUFnQjtBQUFBLElBQ2xJLENBQUM7QUFDRCxRQUFJLGtCQUFrQixRQUFRO0FBQzlCLHNCQUFrQixZQUFZLEVBQUU7QUFDaEMsY0FBVSxpQkFBaUI7QUFBQSxFQUM3QixTQUFTLEdBQUc7QUFDVixVQUFNLFNBQVMsU0FBUyxjQUFjLEtBQUs7QUFDM0MsV0FBTyxZQUFZO0FBQ25CLFdBQU8sWUFBWTtBQUFBO0FBQUEsa0JBRUosT0FBTyxVQUFVLE9BQU8sV0FBVyxPQUFPLFFBQVEsUUFBUyxNQUFNO0FBQUE7QUFBQTtBQUFBLHdDQUc1QyxJQUFJO0FBQUE7QUFFeEMsUUFBSSxvQkFBb0IsWUFBWSxNQUFNO0FBQzFDLFFBQUksa0JBQWtCLFFBQVE7QUFDOUIsY0FBVSw4QkFBOEI7QUFBQSxFQUMxQztBQUNGO0FBRUEsZUFBZSxxQkFBcUI7QUFDbEMsTUFBSSxDQUFDLFlBQWE7QUFDbEIsY0FBWSx3Q0FBbUMsSUFBSTtBQUNuRCxNQUFJO0FBQ0YsVUFBTSxZQUFZLHFCQUFxQixRQUFRLFVBQVUsYUFBYTtBQUFBLE1BQ3BFLFVBQVUsU0FBUyxXQUFXLFVBQVUsV0FBVztBQUFBLElBQ3JELENBQUM7QUFFRCxVQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUs7QUFBQSxNQUM1QixRQUFRLElBQUk7QUFBQSxNQUNaLE1BQU07QUFBQSxRQUNKLE9BQU8sR0FBRyxZQUFZLFNBQVMsVUFBVSxLQUFLLFlBQVksU0FBUyxTQUFTLFNBQU0sWUFBWSxTQUFTLFVBQVUsS0FBSyxZQUFZLFNBQVMsU0FBUztBQUFBLFFBQ3BKLFNBQVMsWUFBWSxTQUFTO0FBQUEsUUFDOUIsY0FBYyxZQUFZLFNBQVM7QUFBQSxRQUNuQyxjQUFjLFlBQVksU0FBUztBQUFBLFFBQ25DLFNBQVMsWUFBWSxTQUFTO0FBQUEsUUFDOUIsY0FBYyxZQUFZLFNBQVM7QUFBQSxRQUNuQyxjQUFjLFlBQVksU0FBUztBQUFBLFFBQ25DLGlCQUFpQixLQUFLLFVBQVUsWUFBWSxjQUFjO0FBQUEsUUFDMUQsY0FBYyxLQUFLLFVBQVUsWUFBWSxXQUFXO0FBQUEsUUFDcEQsbUJBQW1CLFlBQVk7QUFBQSxRQUMvQixxQkFBcUIsWUFBWTtBQUFBLFFBQ2pDLFVBQVUsWUFBWTtBQUFBLFFBQ3RCLFdBQVcsS0FBSyxVQUFVLFNBQVM7QUFBQSxNQUNyQztBQUFBLElBQ0YsQ0FBQztBQUVELGdCQUFZLElBQUksS0FBSztBQUNyQixXQUFPLFNBQVM7QUFBQSxNQUNkLE9BQU8sR0FBRyxpQkFBaUI7QUFBQSxNQUMzQixTQUFTLEdBQUcsd0NBQXdDLENBQUUsSUFBSSxXQUFXLElBQUksUUFBUSxRQUFTLGVBQWUsQ0FBQztBQUFBLE1BQzFHLFdBQVc7QUFBQSxJQUNiLENBQUM7QUFDRCxjQUFVLHNCQUF1QixJQUFJLFdBQVcsSUFBSSxRQUFRLFFBQVMsRUFBRSxFQUFFO0FBQUEsRUFDM0UsU0FBUyxHQUFHO0FBQ1YsZ0JBQVksSUFBSSxLQUFLO0FBQ3JCLFdBQU8sU0FBUztBQUFBLE1BQ2QsT0FBTyxHQUFHLHNCQUFzQjtBQUFBLE1BQ2hDLFNBQVMsR0FBRyxpQ0FBaUMsQ0FBQyxFQUFFLFdBQVcsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUFBLE1BQ3JFLFdBQVc7QUFBQSxJQUNiLENBQUM7QUFDRCxjQUFVLHVCQUF1QixFQUFFLFdBQVcsQ0FBQyxFQUFFO0FBQUEsRUFDbkQ7QUFDRjtBQUdBLFNBQVMscUJBQXFCO0FBQzVCLE1BQUksQ0FBQyxJQUFJLFNBQVU7QUFDbkIsTUFBSSxTQUFTLFVBQVUsSUFBSSxRQUFRO0FBQ25DLDhCQUE0QjtBQUM5QjtBQUVBLFNBQVMsc0JBQXNCO0FBQzdCLE1BQUksQ0FBQyxJQUFJLFNBQVU7QUFDbkIsTUFBSSxTQUFTLFVBQVUsT0FBTyxRQUFRO0FBQ3RDLGlCQUFlO0FBQ2pCO0FBRUEsU0FBUyw4QkFBOEI7QUFDckMsTUFBSSxDQUFDLElBQUksZUFBZ0I7QUFDekIsTUFBSSxlQUFlLFlBQVk7QUFFL0IsUUFBTSxVQUFVLG9CQUFJLElBQUk7QUFFeEIsZ0JBQWMsUUFBUSxDQUFDLEVBQUUsTUFBTSxXQUFXLGNBQWMsV0FBVyxNQUFNO0FBQ3ZFLFVBQU0sS0FBSyxhQUFhLElBQUksR0FBRyxZQUFZLElBQUksU0FBUyxFQUFFLEtBQUssYUFBYSxJQUFJLE9BQU8sU0FBUyxDQUFDLEtBQUssS0FBSyxTQUFTO0FBQ3BILFVBQU0sVUFBVyxNQUFNLEdBQUcsaUJBQWtCLEtBQUssU0FBUyxVQUFVLE9BQU8sS0FBSyxTQUFTLE9BQU8sS0FBSztBQUVyRyxRQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sR0FBRztBQUN6QixVQUFJLGFBQWE7QUFDakIsVUFBSSxNQUFNO0FBQ1YsVUFBSSxXQUFXO0FBQ2YsVUFBSSxXQUFXO0FBQ2YsVUFBSSxXQUFXO0FBRWYsWUFBTSxZQUFZLFFBQVEsWUFBWTtBQUN0QyxVQUFJLFVBQVUsU0FBUyxNQUFNLEdBQUc7QUFDOUIscUJBQWE7QUFBYSxjQUFNO0FBQU0sbUJBQVc7QUFBTyxtQkFBVztBQUFHLG1CQUFXO0FBQUEsTUFDbkYsV0FBVyxVQUFVLFNBQVMsTUFBTSxLQUFLLFVBQVUsU0FBUyxRQUFRLEdBQUc7QUFDckUscUJBQWE7QUFBYSxjQUFNO0FBQU0sbUJBQVc7QUFBTyxtQkFBVztBQUFHLG1CQUFXO0FBQUEsTUFDbkYsV0FBVyxVQUFVLFNBQVMsTUFBTSxHQUFHO0FBQ3JDLHFCQUFhO0FBQWEsY0FBTTtBQUFNLG1CQUFXO0FBQU8sbUJBQVc7QUFBRyxtQkFBVztBQUFBLE1BQ25GLFdBQVcsVUFBVSxTQUFTLE1BQU0sR0FBRztBQUNyQyxxQkFBYTtBQUFVLGNBQU07QUFBSyxtQkFBVztBQUFNLG1CQUFXO0FBQUksbUJBQVc7QUFBQSxNQUMvRSxXQUFXLFVBQVUsU0FBUyxNQUFNLEdBQUc7QUFDckMscUJBQWE7QUFBVSxjQUFNO0FBQUssbUJBQVc7QUFBTSxtQkFBVztBQUFJLG1CQUFXO0FBQUEsTUFDL0UsV0FBVyxVQUFVLFNBQVMsYUFBYSxLQUFLLFVBQVUsU0FBUyxPQUFPLEtBQUssVUFBVSxTQUFTLE1BQU0sR0FBRztBQUN6RyxxQkFBYTtBQUFTLGNBQU07QUFBTyxtQkFBVztBQUFPLG1CQUFXO0FBQUcsbUJBQVc7QUFBQSxNQUNoRjtBQUVBLGNBQVEsSUFBSSxTQUFTO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFFBQ047QUFBQSxRQUNBLE9BQU87QUFBQSxRQUNQO0FBQUEsUUFDQSxhQUFhO0FBQUEsUUFDYjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0EsUUFBUSxDQUFDO0FBQUEsTUFDWCxDQUFDO0FBQUEsSUFDSDtBQUVBLFVBQU0sSUFBSSxRQUFRLElBQUksT0FBTztBQUM3QixNQUFFO0FBQ0YsTUFBRSxPQUFPLEtBQUssSUFBSTtBQUVsQixRQUFJLE1BQU0sR0FBRyxZQUFZO0FBQ3ZCLFVBQUksRUFBRSxlQUFlLGVBQWUsR0FBRyxXQUFXLFdBQVc7QUFDM0QsVUFBRSxlQUFlLFdBQVcsR0FBRyxXQUFXLFNBQVMsS0FBSztBQUFBLE1BQzFELFdBQVcsRUFBRSxlQUFlLGFBQWEsR0FBRyxXQUFXLFVBQVUsR0FBRyxXQUFXLGdCQUFnQjtBQUM3RixVQUFFLGVBQWUsV0FBVyxHQUFHLFdBQVcsVUFBVSxHQUFHLFdBQVcsYUFBYSxLQUFLO0FBQUEsTUFDdEYsV0FBVyxFQUFFLGVBQWUsZUFBZSxHQUFHLFdBQVcsV0FBVztBQUNsRSxVQUFFLGVBQWUsV0FBVyxHQUFHLFdBQVcsU0FBUyxLQUFLO0FBQUEsTUFDMUQ7QUFBQSxJQUNGLFdBQVcsS0FBSyxVQUFVO0FBQ3hCLFVBQUksQ0FBQyxLQUFLLFNBQVMsWUFBYSxNQUFLLFNBQVMsbUJBQW1CO0FBQ2pFLFlBQU0sV0FBVyxLQUFLLFNBQVMsWUFBWSxNQUFNLEVBQUUsYUFBYSxLQUFLLFdBQVc7QUFDaEYsWUFBTSxLQUFLLFNBQVMsUUFBUSxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBQy9DLFVBQUksRUFBRSxlQUFlLFlBQWEsR0FBRSxlQUFnQixHQUFHLElBQUksR0FBRyxJQUFJLEdBQUc7QUFBQSxlQUM1RCxFQUFFLGVBQWUsU0FBVSxHQUFFLGVBQWUsS0FBSyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQUEsVUFDekUsR0FBRSxlQUFlO0FBQUEsSUFDeEI7QUFBQSxFQUNGLENBQUM7QUFFRCxNQUFJLFlBQVk7QUFDaEIsTUFBSSxpQkFBaUIsUUFBUTtBQUU3QixVQUFRLFFBQVEsQ0FBQyxRQUFRO0FBQ3ZCLFVBQU0sZUFBZSxJQUFJLGVBQWUsSUFBTyxJQUFJLFdBQVc7QUFDOUQsVUFBTSxZQUFZLGVBQWUsSUFBSTtBQUNyQyxpQkFBYTtBQUViLFVBQU0sS0FBSyxTQUFTLGNBQWMsSUFBSTtBQUN0QyxPQUFHLFlBQVk7QUFDZixPQUFHLFlBQVk7QUFBQSxvQkFDQyxJQUFJLElBQUk7QUFBQSxvQ0FDUSxJQUFJLFVBQVU7QUFBQSxZQUN0QyxJQUFJLEtBQUs7QUFBQSxZQUNULElBQUksWUFBWSxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRztBQUFBLGdFQUNlLElBQUksUUFBUTtBQUFBLGdDQUM1QyxhQUFhLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHO0FBQUEsaURBQ2pCLElBQUksUUFBUTtBQUFBLFlBQ2pELElBQUksR0FBRztBQUFBLGdFQUM2QyxJQUFJLFFBQVE7QUFBQSw0REFDaEIsVUFBVSxRQUFRLENBQUMsQ0FBQztBQUFBO0FBRzVFLE9BQUcsVUFBVSxNQUFNO0FBQ2pCLGVBQVMsaUJBQWlCLDhCQUE4QixFQUFFLFFBQVEsT0FBSyxFQUFFLFVBQVUsT0FBTyxVQUFVLENBQUM7QUFDckcsU0FBRyxVQUFVLElBQUksVUFBVTtBQUMzQiwyQkFBcUIsSUFBSSxNQUFNO0FBQUEsSUFDakM7QUFFQSxVQUFNLGFBQWEsR0FBRyxjQUFjLGtCQUFrQjtBQUN0RCxVQUFNLFlBQVksR0FBRyxjQUFjLGlCQUFpQjtBQUNwRCxVQUFNLFdBQVcsR0FBRyxjQUFjLGNBQWM7QUFDaEQsVUFBTSxjQUFjLEdBQUcsY0FBYyxpQkFBaUI7QUFFdEQsVUFBTSxhQUFhLE1BQU07QUFDdkIsWUFBTSxJQUFJLFdBQVcsV0FBVyxLQUFLLEtBQUs7QUFDMUMsWUFBTSxPQUFPLFdBQVcsVUFBVSxLQUFLLEtBQUs7QUFDNUMsWUFBTSxNQUFNLElBQUksZUFBZSxJQUFNLElBQUk7QUFDekMsWUFBTSxNQUFNLE1BQU07QUFDbEIsZUFBUyxjQUFjLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRztBQUNuRCxrQkFBWSxjQUFjLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQztBQUFBLElBQzlDO0FBRUEsUUFBSSxXQUFZLFlBQVcsVUFBVTtBQUNyQyxRQUFJLFVBQVcsV0FBVSxVQUFVO0FBRW5DLFFBQUksZUFBZSxZQUFZLEVBQUU7QUFBQSxFQUNuQyxDQUFDO0FBRUQsTUFBSSxJQUFJLGdCQUFnQjtBQUN0QixRQUFJLGVBQWUsY0FBYyxxQkFBcUIsY0FBYyw2QkFBNkIsVUFBVSxlQUFlLFNBQVMsRUFBRSx1QkFBdUIsR0FBRyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7QUFBQSxFQUM1TDtBQUNGO0FBRUEsU0FBUyxxQkFBcUIsY0FBYztBQUMxQyxRQUFNLFlBQVksSUFBSSxJQUFJLFlBQVk7QUFDdEMsUUFBTSxZQUFZLElBQUksTUFBTSxLQUFLO0FBRWpDLGdCQUFjLFFBQVEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUNsQyxRQUFJLENBQUMsS0FBSyxTQUFTLG1CQUFtQjtBQUNwQyxXQUFLLFNBQVMsb0JBQW9CO0FBQUEsUUFDaEMsYUFBYSxLQUFLLFNBQVM7QUFBQSxRQUMzQixTQUFTLEtBQUssU0FBUztBQUFBLFFBQ3ZCLFlBQVksS0FBSyxTQUFTO0FBQUEsTUFDNUI7QUFBQSxJQUNGO0FBQ0EsUUFBSSxVQUFVLElBQUksSUFBSSxHQUFHO0FBQ3ZCLFVBQUksQ0FBQyxLQUFLLFNBQVMsVUFBVyxNQUFLLFNBQVMsWUFBWSxLQUFLLFNBQVMsTUFBTSxNQUFNO0FBQ2xGLFdBQUssU0FBUyxNQUFNLE9BQU8sT0FBUTtBQUNuQyxVQUFJLEtBQUssU0FBUyxTQUFVLE1BQUssU0FBUyxTQUFTLE9BQU8sTUFBUTtBQUNsRSxXQUFLLFNBQVMsY0FBYztBQUM1QixXQUFLLFNBQVMsVUFBVTtBQUN4QixVQUFJLEtBQUssVUFBVTtBQUNqQixZQUFJLENBQUMsS0FBSyxTQUFTLFlBQWEsTUFBSyxTQUFTLG1CQUFtQjtBQUNqRSxrQkFBVSxNQUFNLEtBQUssU0FBUyxZQUFZLE1BQU0sRUFBRSxhQUFhLEtBQUssV0FBVyxDQUFDO0FBQUEsTUFDbEY7QUFBQSxJQUNGLE9BQU87QUFDTCxVQUFJLEtBQUssU0FBUyxVQUFXLE1BQUssU0FBUyxNQUFNLEtBQUssS0FBSyxTQUFTLFNBQVM7QUFDN0UsVUFBSSxLQUFLLFNBQVMsU0FBVSxNQUFLLFNBQVMsU0FBUyxPQUFPLENBQVE7QUFDbEUsV0FBSyxTQUFTLGNBQWM7QUFDNUIsV0FBSyxTQUFTLFVBQVU7QUFBQSxJQUMxQjtBQUFBLEVBQ0YsQ0FBQztBQUVELE1BQUksQ0FBQyxVQUFVLFFBQVEsR0FBRztBQUN4QixVQUFNLFNBQVMsVUFBVSxVQUFVLElBQUksTUFBTSxRQUFRLENBQUM7QUFDdEQsVUFBTSxPQUFPLFVBQVUsUUFBUSxJQUFJLE1BQU0sUUFBUSxDQUFDLEVBQUUsT0FBTztBQUMzRCxXQUFPLFNBQVMsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLE1BQU0sUUFBUSxPQUFPLEtBQUssT0FBTyxLQUFLLE9BQU8sR0FBRyxDQUFDO0FBQ3RGLGFBQVMsT0FBTyxLQUFLLE1BQU07QUFDM0IsYUFBUyxPQUFPO0FBQUEsRUFDbEI7QUFDRjtBQUVBLGVBQWUscUJBQXFCO0FBQ2xDLFFBQU0sY0FBYyxTQUFTLGVBQWUsaUJBQWlCLEtBQUssQ0FBQyxHQUFHLFNBQVM7QUFDL0UsUUFBTSxZQUFZLFNBQVMsZUFBZSxXQUFXLEtBQUssQ0FBQyxHQUFHLFNBQVM7QUFFdkUsY0FBWSx5Q0FBb0MsSUFBSTtBQUNwRCxNQUFJO0FBQ0YsVUFBTSxRQUFRLENBQUM7QUFDZixhQUFTLGlCQUFpQiw4QkFBOEIsRUFBRSxRQUFRLFFBQU07QUFDdEUsWUFBTSxRQUFRLEdBQUcsY0FBYyxXQUFXLEtBQUssQ0FBQyxHQUFHLGVBQWU7QUFDbEUsWUFBTSxZQUFZLEdBQUcsY0FBYyxpQkFBaUIsS0FBSyxDQUFDLEdBQUcsU0FBUztBQUN0RSxZQUFNLGFBQWEsR0FBRyxjQUFjLGNBQWMsS0FBSyxDQUFDLEdBQUcsZUFBZTtBQUMxRSxZQUFNLFlBQVksV0FBVyxTQUFTO0FBQ3RDLFlBQU0sU0FBUyxPQUFPLFNBQVMsU0FBUyxJQUFJLFlBQVk7QUFDeEQsVUFBSSxVQUFVLEVBQUc7QUFDakIsWUFBTSxXQUFXLEdBQUcsY0FBYyxpQkFBaUIsS0FBSyxDQUFDLEdBQUcsU0FBUztBQUNyRSxZQUFNLE9BQU8sV0FBVyxPQUFPLEtBQUs7QUFFcEMsWUFBTSxLQUFLLEVBQUUsV0FBVyxVQUFVLEtBQUssUUFBUSxNQUFNLFVBQVUsS0FBSyxDQUFDO0FBQUEsSUFDdkUsQ0FBQztBQUVELFVBQU0sTUFBTSxNQUFNLE9BQU8sS0FBSztBQUFBLE1BQzVCLFFBQVEsSUFBSTtBQUFBLE1BQ1osTUFBTTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sV0FBVztBQUFBLFFBQ1gsT0FBTyxLQUFLLFVBQVUsS0FBSztBQUFBLE1BQzdCO0FBQUEsSUFDRixDQUFDO0FBRUQsZ0JBQVksSUFBSSxLQUFLO0FBQ3JCLHdCQUFvQjtBQUNwQixXQUFPLFNBQVM7QUFBQSxNQUNkLE9BQU8sR0FBRyw0QkFBNEI7QUFBQSxNQUN0QyxTQUFTLEdBQUcsd0RBQXdELENBQUUsSUFBSSxXQUFXLElBQUksUUFBUSxRQUFTLFNBQVMsWUFBWSxNQUFNLE1BQU0sQ0FBQztBQUFBLE1BQzVJLFdBQVc7QUFBQSxJQUNiLENBQUM7QUFDRCxjQUFVLDZCQUE2QixVQUFVLEVBQUU7QUFBQSxFQUNyRCxTQUFTLEdBQUc7QUFDVixnQkFBWSxJQUFJLEtBQUs7QUFDckIsV0FBTyxTQUFTO0FBQUEsTUFDZCxPQUFPLEdBQUcsd0JBQXdCO0FBQUEsTUFDbEMsU0FBUyxHQUFHLHFDQUFxQyxDQUFDLEVBQUUsV0FBVyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQUEsTUFDekUsV0FBVztBQUFBLElBQ2IsQ0FBQztBQUNELGNBQVUsMEJBQTBCLEVBQUUsV0FBVyxDQUFDLEVBQUU7QUFBQSxFQUN0RDtBQUNGO0FBR0EsU0FBUyxRQUFRLE1BQU07QUFDckIsZUFBYTtBQUNiLFdBQVMsaUJBQWlCLGlCQUFpQixFQUFFLFFBQVEsT0FBSyxFQUFFLFVBQVUsT0FBTyxVQUFVLEVBQUUsT0FBTyxVQUFVLElBQUksQ0FBQztBQUMvRyxXQUFTLFdBQVcsTUFBTSxTQUFTLFNBQVMsWUFBWSxjQUFjO0FBQ3hFO0FBRUEsSUFBSSxpQkFBaUIsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQ2xDLElBQUksT0FBTyxpQkFBaUIsZUFBZSxRQUFNO0FBQy9DLG1CQUFpQixFQUFFLEdBQUcsR0FBRyxTQUFTLEdBQUcsR0FBRyxRQUFRO0FBQ2xELENBQUM7QUFFRCxJQUFJLE9BQU8saUJBQWlCLFNBQVMsT0FBTyxPQUFPO0FBQ2pELE1BQUksZUFBZSxXQUFXO0FBQUUsaUJBQWEsRUFBRTtBQUFHO0FBQUEsRUFBUTtBQUMxRCxRQUFNLE9BQU8sS0FBSyxNQUFNLEdBQUcsVUFBVSxlQUFlLEdBQUcsR0FBRyxVQUFVLGVBQWUsQ0FBQztBQUNwRixNQUFJLE9BQU8sRUFBRztBQUVkLE1BQUksZUFBZSxZQUFZLGVBQWUsUUFBUztBQUV2RCxRQUFNLE9BQU8sSUFBSSxPQUFPLHNCQUFzQjtBQUM5QyxRQUFNLFFBQVEsSUFBSSxNQUFNO0FBQUEsS0FDcEIsR0FBRyxVQUFVLEtBQUssUUFBUSxLQUFLLFFBQVMsSUFBSTtBQUFBLElBQzlDLEdBQUcsR0FBRyxVQUFVLEtBQUssT0FBTyxLQUFLLFVBQVUsSUFBSTtBQUFBLEVBQ2pEO0FBQ0EsUUFBTSxZQUFZLElBQUksTUFBTSxVQUFVO0FBQ3RDLFlBQVUsY0FBYyxPQUFPLE1BQU07QUFFckMsUUFBTSxTQUFTLENBQUM7QUFDaEIsaUJBQWUsU0FBUyxPQUFLO0FBQUUsUUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFTLFFBQU8sS0FBSyxDQUFDO0FBQUEsRUFBRyxDQUFDO0FBQzNFLFFBQU0sT0FBTyxVQUFVLGlCQUFpQixRQUFRLEtBQUs7QUFFckQsTUFBSSxLQUFLLFFBQVE7QUFDZixVQUFNLE1BQU0sS0FBSyxDQUFDO0FBQ2xCLFVBQU0sT0FBTyxJQUFJLE9BQU8sU0FBUyxhQUFhLGVBQWUsSUFBSSxPQUFPLFVBQVUsSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLE1BQVM7QUFDbkgsVUFBTSxXQUFXLElBQUksT0FBTyxTQUFTLGdCQUFnQjtBQUNyRCxVQUFNLGNBQWMsSUFBSSxRQUFRLE1BQU0sUUFBUTtBQUFBLEVBQ2hELE9BQU87QUFDTCxtQkFBZTtBQUFBLEVBQ2pCO0FBQ0YsQ0FBQztBQUVELFNBQVMsZUFBZSxVQUFVLFdBQVc7QUFDM0MsUUFBTSxPQUFPLFlBQVksU0FBUyxjQUFjLFNBQVMsV0FBVztBQUNwRSxNQUFJLENBQUMsUUFBUSxjQUFjLFVBQWEsY0FBYyxLQUFNLFFBQU87QUFDbkUsU0FBTyxLQUFLLEtBQUssS0FBSyxJQUFJLFdBQVcsS0FBSyxRQUFRLENBQUMsQ0FBQztBQUN0RDtBQUVBLFNBQVMsVUFBVTtBQUNqQixRQUFNLE1BQU0sSUFBSSxNQUFNLEtBQUssRUFBRSxjQUFjLGNBQWM7QUFDekQsTUFBSSxJQUFJLFFBQVEsRUFBRztBQUNuQixRQUFNLFNBQVMsSUFBSSxrQkFBa0IsSUFBSSxNQUFNLE9BQU8sQ0FBQztBQUN2RCxRQUFNLE9BQU8sSUFBSSxRQUFRLElBQUksTUFBTSxRQUFRLENBQUMsRUFBRSxPQUFPO0FBQ3JELFNBQU8sU0FBUyxLQUFLLE9BQU8sTUFBTSxFQUFFLElBQUksSUFBSSxNQUFNLFFBQVEsT0FBTyxLQUFLLE9BQU8sS0FBSyxPQUFPLEdBQUcsQ0FBQztBQUM3RixXQUFTLE9BQU8sS0FBSyxPQUFPLE1BQU07QUFDbEMsV0FBUyxPQUFPO0FBQ2xCO0FBR0EsSUFBSSxnQkFBZ0IsQ0FBQztBQUNyQixJQUFNLGNBQWMsSUFBSSxNQUFNO0FBQUEsRUFDNUIsSUFBSSxNQUFNLGVBQWU7QUFBQSxFQUN6QixJQUFJLE1BQU0sa0JBQWtCLEVBQUUsT0FBTyxTQUFVLFdBQVcsRUFBRSxDQUFDO0FBQy9EO0FBQ0EsTUFBTSxJQUFJLFdBQVc7QUFFckIsU0FBUyxhQUFhLElBQUk7QUFDeEIsUUFBTSxPQUFPLElBQUksT0FBTyxzQkFBc0I7QUFDOUMsUUFBTSxRQUFRLElBQUksTUFBTTtBQUFBLEtBQ3BCLEdBQUcsVUFBVSxLQUFLLFFBQVEsS0FBSyxRQUFTLElBQUk7QUFBQSxJQUM5QyxHQUFHLEdBQUcsVUFBVSxLQUFLLE9BQU8sS0FBSyxVQUFVLElBQUk7QUFBQSxFQUNqRDtBQUNBLFFBQU0sWUFBWSxJQUFJLE1BQU0sVUFBVTtBQUN0QyxZQUFVLGNBQWMsT0FBTyxNQUFNO0FBRXJDLFFBQU0sU0FBUyxDQUFDO0FBQ2hCLGlCQUFlLFNBQVMsT0FBSztBQUFFLFFBQUksRUFBRSxPQUFRLFFBQU8sS0FBSyxDQUFDO0FBQUEsRUFBRyxDQUFDO0FBQzlELFFBQU0sT0FBTyxVQUFVLGlCQUFpQixRQUFRLEtBQUs7QUFFckQsTUFBSSxLQUFLLFFBQVE7QUFDZixVQUFNLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDbkIsa0JBQWMsS0FBSyxFQUFFO0FBQ3JCLFFBQUksY0FBYyxXQUFXLEdBQUc7QUFDOUIsWUFBTSxPQUFPLGNBQWMsQ0FBQyxFQUFFLFdBQVcsY0FBYyxDQUFDLENBQUM7QUFDekQsa0JBQVksU0FBUyxjQUFjLGFBQWE7QUFDaEQsZ0JBQVUsYUFBYSxLQUFLLFFBQVEsQ0FBQyxDQUFDLGtCQUFrQjtBQUN4RCxzQkFBZ0IsQ0FBQztBQUFBLElBQ25CLE9BQU87QUFDTCxnQkFBVSwyQ0FBMkM7QUFBQSxJQUN2RDtBQUFBLEVBQ0Y7QUFDRjtBQUdBLFNBQVMsaUJBQWlCO0FBQ3hCLE1BQUksQ0FBQyxJQUFJLGVBQWUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLE1BQU87QUFDcEQsUUFBTSxjQUFjLG9CQUFJLElBQUk7QUFDNUIsUUFBTSxVQUFVLG9CQUFJLElBQUk7QUFDeEIsUUFBTSxRQUFRLG9CQUFJLElBQUk7QUFFdEIsZUFBYSxRQUFRLE9BQUs7QUFDeEIsZ0JBQVksSUFBSSxFQUFFLFVBQVU7QUFDNUIsS0FBQyxFQUFFLFlBQVksQ0FBQyxHQUFHLFFBQVEsUUFBTTtBQUMvQixVQUFJLEdBQUcsT0FBUSxTQUFRLElBQUksR0FBRyxNQUFNO0FBQ3BDLFVBQUksR0FBRyxhQUFjLE9BQU0sSUFBSSxHQUFHLFlBQVk7QUFBQSxJQUNoRCxDQUFDO0FBQUEsRUFDSCxDQUFDO0FBRUQsTUFBSSxZQUFZLFlBQVk7QUFDNUIsY0FBWSxRQUFRLE9BQUs7QUFDdkIsVUFBTSxJQUFJLFNBQVMsY0FBYyxRQUFRO0FBQUcsTUFBRSxRQUFRO0FBQUcsTUFBRSxjQUFjO0FBQUcsUUFBSSxZQUFZLFlBQVksQ0FBQztBQUFBLEVBQzNHLENBQUM7QUFFRCxNQUFJLFFBQVEsWUFBWTtBQUN4QixVQUFRLFFBQVEsT0FBSztBQUNuQixVQUFNLElBQUksU0FBUyxjQUFjLFFBQVE7QUFBRyxNQUFFLFFBQVE7QUFBRyxNQUFFLGNBQWM7QUFBRyxRQUFJLFFBQVEsWUFBWSxDQUFDO0FBQUEsRUFDdkcsQ0FBQztBQUVELE1BQUksTUFBTSxZQUFZO0FBQ3RCLFFBQU0sUUFBUSxPQUFLO0FBQ2pCLFVBQU0sSUFBSSxTQUFTLGNBQWMsUUFBUTtBQUFHLE1BQUUsUUFBUTtBQUFHLE1BQUUsY0FBYztBQUFHLFFBQUksTUFBTSxZQUFZLENBQUM7QUFBQSxFQUNyRyxDQUFDO0FBQ0g7QUFFQSxTQUFTLGVBQWU7QUFDdEIsUUFBTSxRQUFRLElBQUksY0FBYyxJQUFJLFlBQVksUUFBUTtBQUN4RCxRQUFNLFVBQVUsSUFBSSxVQUFVLElBQUksUUFBUSxRQUFRO0FBQ2xELFFBQU0sUUFBUSxJQUFJLFFBQVEsSUFBSSxNQUFNLFFBQVE7QUFDNUMsUUFBTSxXQUFXLElBQUksVUFBVSxJQUFJLFFBQVEsUUFBUSxJQUFJLFlBQVksRUFBRSxLQUFLO0FBRTFFLE1BQUksZUFBZTtBQUNuQixnQkFBYyxRQUFRLENBQUMsRUFBRSxNQUFNLFdBQVcsY0FBYyxXQUFXLE1BQU07QUFDdkUsVUFBTSxLQUFLLGFBQWEsSUFBSSxHQUFHLFlBQVksSUFBSSxTQUFTLEVBQUUsS0FBSyxhQUFhLElBQUksT0FBTyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVM7QUFDcEgsUUFBSSxRQUFRO0FBRVosUUFBSSxTQUFTLENBQUMsa0JBQWtCLFlBQVksS0FBSyxFQUFHLFNBQVE7QUFDNUQsUUFBSSxXQUFXLE1BQU0sR0FBRyxXQUFXLFFBQVMsU0FBUTtBQUNwRCxRQUFJLFNBQVMsTUFBTSxHQUFHLGlCQUFpQixNQUFPLFNBQVE7QUFDdEQsUUFBSSxTQUFTO0FBQ1gsWUFBTSxlQUFlLEdBQUksTUFBTSxHQUFHLFNBQVUsRUFBRSxJQUFLLE1BQU0sR0FBRyxnQkFBaUIsRUFBRSxJQUFJLFNBQVMsSUFBSyxNQUFNLEdBQUcsYUFBYyxFQUFFLEdBQUcsWUFBWTtBQUN6SSxVQUFJLENBQUMsYUFBYSxTQUFTLE9BQU8sRUFBRyxTQUFRO0FBQUEsSUFDL0M7QUFFQSxTQUFLLFVBQVU7QUFDZixRQUFJLE1BQU87QUFBQSxFQUNiLENBQUM7QUFFRCxZQUFVLEdBQUcsWUFBWSw0QkFBNEI7QUFDdkQ7QUFHQSxTQUFTLHVCQUF1QjtBQUM5QixRQUFNLE9BQVEsSUFBSSxVQUFVLElBQUksT0FBTyxNQUFNLEtBQUssS0FBTSxXQUFVLG9CQUFJLEtBQUssR0FBRSxtQkFBbUI7QUFDaEcsUUFBTSxTQUFTO0FBQUEsSUFDYixVQUFVLEVBQUUsR0FBRyxPQUFPLFNBQVMsR0FBRyxHQUFHLE9BQU8sU0FBUyxHQUFHLEdBQUcsT0FBTyxTQUFTLEVBQUU7QUFBQSxJQUM3RSxRQUFRLEVBQUUsR0FBRyxTQUFTLE9BQU8sR0FBRyxHQUFHLFNBQVMsT0FBTyxHQUFHLEdBQUcsU0FBUyxPQUFPLEVBQUU7QUFBQSxFQUM3RTtBQUVBLFFBQU0sSUFBSSxTQUFTLGNBQWMsS0FBSztBQUN0QyxJQUFFLFlBQVk7QUFDZCxJQUFFLE1BQU0sVUFBVTtBQUNsQixJQUFFLFlBQVksMENBQW1DLElBQUk7QUFFckQsSUFBRSxjQUFjLE1BQU0sRUFBRSxVQUFVLE1BQU07QUFDdEMsV0FBTyxTQUFTLElBQUksT0FBTyxTQUFTLEdBQUcsT0FBTyxTQUFTLEdBQUcsT0FBTyxTQUFTLENBQUM7QUFDM0UsYUFBUyxPQUFPLElBQUksT0FBTyxPQUFPLEdBQUcsT0FBTyxPQUFPLEdBQUcsT0FBTyxPQUFPLENBQUM7QUFDckUsYUFBUyxPQUFPO0FBQ2hCLGNBQVUsd0JBQXdCLElBQUk7QUFBQSxFQUN4QztBQUNBLElBQUUsY0FBYyxNQUFNLEVBQUUsVUFBVSxNQUFNLEVBQUUsT0FBTztBQUVqRCxNQUFJLElBQUksV0FBVyxjQUFjLGFBQWEsRUFBRyxLQUFJLFdBQVcsWUFBWTtBQUM1RSxNQUFJLFdBQVcsWUFBWSxDQUFDO0FBQzVCLE1BQUksSUFBSSxPQUFRLEtBQUksT0FBTyxRQUFRO0FBQ25DLFlBQVUsc0JBQXNCLElBQUk7QUFDdEM7QUFHQSxTQUFTLGVBQWU7QUFFdEIsV0FBUyxpQkFBaUIsY0FBYyxFQUFFLFFBQVEsU0FBTztBQUN2RCxRQUFJLFVBQVUsTUFBTTtBQUNsQixlQUFTLGlCQUFpQixjQUFjLEVBQUUsUUFBUSxPQUFLLEVBQUUsVUFBVSxPQUFPLFFBQVEsQ0FBQztBQUNuRixlQUFTLGlCQUFpQixrQkFBa0IsRUFBRSxRQUFRLE9BQUssRUFBRSxVQUFVLE9BQU8sUUFBUSxDQUFDO0FBQ3ZGLFVBQUksVUFBVSxJQUFJLFFBQVE7QUFDMUIsWUFBTSxTQUFTLFNBQVMsZUFBZSxJQUFJLFFBQVEsR0FBRztBQUN0RCxVQUFJLE9BQVEsUUFBTyxVQUFVLElBQUksUUFBUTtBQUFBLElBQzNDO0FBQUEsRUFDRixDQUFDO0FBR0QsUUFBTSxZQUFZLFNBQVMsZUFBZSxZQUFZO0FBQ3RELFFBQU0sYUFBYSxTQUFTLGVBQWUsYUFBYTtBQUN4RCxRQUFNLGNBQWMsU0FBUyxlQUFlLGNBQWM7QUFDMUQsUUFBTSxXQUFXLFNBQVMsZUFBZSxXQUFXO0FBQ3BELFFBQU0sY0FBYyxTQUFTLGVBQWUsY0FBYztBQUUxRCxNQUFJLFVBQVcsV0FBVSxVQUFVLE1BQU0sUUFBUSxPQUFPO0FBQ3hELE1BQUksV0FBWSxZQUFXLFVBQVUsTUFBTSxRQUFRLFFBQVE7QUFDM0QsTUFBSSxZQUFhLGFBQVksVUFBVSxNQUFNLFFBQVEsU0FBUztBQUM5RCxNQUFJLFNBQVUsVUFBUyxVQUFVLE1BQU0sUUFBUSxNQUFNO0FBQ3JELE1BQUksYUFBYTtBQUNmLGdCQUFZLFVBQVUsTUFBTTtBQUMxQixZQUFNLFNBQVMsU0FBUyxlQUFlLGlCQUFpQjtBQUN4RCxVQUFJLE9BQVEsUUFBTyxNQUFNO0FBQUEsSUFDM0I7QUFBQSxFQUNGO0FBR0EsUUFBTSxhQUFhLFNBQVMsZUFBZSxhQUFhO0FBQ3hELFFBQU0sT0FBTyxTQUFTLGVBQWUsT0FBTztBQUM1QyxRQUFNLE9BQU8sU0FBUyxlQUFlLE9BQU87QUFDNUMsUUFBTSxTQUFTLFNBQVMsZUFBZSxTQUFTO0FBQ2hELFFBQU0sU0FBUyxTQUFTLGVBQWUsU0FBUztBQUVoRCxNQUFJLFlBQVk7QUFDZCxlQUFXLFVBQVUsTUFBTTtBQUN6QixzQkFBZ0IsQ0FBQztBQUNqQixxQkFBZSxTQUFTLE9BQUs7QUFDM0IsWUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFVLEdBQUUsU0FBUyxZQUFZO0FBQUEsTUFDckQsQ0FBQztBQUNELGdCQUFVLG1CQUFtQixnQkFBZ0IsT0FBTyxLQUFLLEVBQUU7QUFBQSxJQUM3RDtBQUFBLEVBQ0Y7QUFFQSxNQUFJLE9BQVEsUUFBTyxVQUFVO0FBQzdCLE1BQUksS0FBTSxNQUFLLFVBQVU7QUFDekIsTUFBSSxNQUFNO0FBQ1IsU0FBSyxVQUFVLE1BQU07QUFDbkIsWUFBTSxNQUFNLElBQUksTUFBTSxLQUFLLEVBQUUsY0FBYyxjQUFjO0FBQ3pELFlBQU0sU0FBUyxJQUFJLFVBQVUsSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUNoRCxZQUFNLE9BQU8sSUFBSSxRQUFRLElBQUksTUFBTSxRQUFRLENBQUMsRUFBRSxPQUFPO0FBQ3JELGFBQU8sU0FBUyxJQUFJLE9BQU8sR0FBRyxPQUFPLElBQUksT0FBTyxLQUFLLE9BQU8sQ0FBQztBQUM3RCxhQUFPLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUN0QixlQUFTLE9BQU8sS0FBSyxNQUFNO0FBQzNCLGVBQVMsT0FBTztBQUFBLElBQ2xCO0FBQUEsRUFDRjtBQUNBLE1BQUksUUFBUTtBQUNWLFdBQU8sVUFBVSxNQUFNO0FBQ3JCLFlBQU0sTUFBTSxJQUFJLE1BQU0sS0FBSyxFQUFFLGNBQWMsY0FBYztBQUN6RCxZQUFNLFNBQVMsSUFBSSxVQUFVLElBQUksTUFBTSxRQUFRLENBQUM7QUFDaEQsWUFBTSxPQUFPLElBQUksUUFBUSxJQUFJLE1BQU0sUUFBUSxDQUFDLEVBQUUsT0FBTztBQUNyRCxhQUFPLFNBQVMsSUFBSSxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQU8sSUFBSSxPQUFPLEdBQUc7QUFDN0QsYUFBTyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7QUFDckIsZUFBUyxPQUFPLEtBQUssTUFBTTtBQUMzQixlQUFTLE9BQU87QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFHQSxRQUFNLGdCQUFnQixTQUFTLGVBQWUsaUJBQWlCO0FBQy9ELE1BQUksY0FBZSxlQUFjLFVBQVU7QUFFM0MsUUFBTSxlQUFlLFNBQVMsZUFBZSxnQkFBZ0I7QUFDN0QsTUFBSSxjQUFjO0FBQ2hCLGlCQUFhLFVBQVUsTUFBTTtBQUMzQixVQUFJLElBQUksd0JBQXdCLElBQUksb0JBQW9CO0FBQ3RELFlBQUkscUJBQXFCLE1BQU0sVUFBVTtBQUN6QyxZQUFJLG1CQUFtQixNQUFNLFVBQVU7QUFBQSxNQUN6QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsUUFBTSxjQUFjLFNBQVMsZUFBZSxlQUFlO0FBQzNELE1BQUksYUFBYTtBQUNmLGdCQUFZLFVBQVUsTUFBTTtBQUMxQixVQUFJLFlBQWEsWUFBVyxXQUFXO0FBQUEsSUFDekM7QUFBQSxFQUNGO0FBRUEsUUFBTSxzQkFBc0IsU0FBUyxlQUFlLHdCQUF3QjtBQUM1RSxNQUFJLG9CQUFxQixxQkFBb0IsVUFBVTtBQUV2RCxRQUFNLGtCQUFrQixTQUFTLGVBQWUsb0JBQW9CO0FBQ3BFLE1BQUksZ0JBQWlCLGlCQUFnQixVQUFVO0FBRy9DLFFBQU0sbUJBQW1CLFNBQVMsZUFBZSxxQkFBcUI7QUFDdEUsTUFBSSxpQkFBa0Isa0JBQWlCLFVBQVU7QUFFakQsUUFBTSxtQkFBbUIsU0FBUyxlQUFlLHFCQUFxQjtBQUN0RSxRQUFNLG9CQUFvQixTQUFTLGVBQWUsc0JBQXNCO0FBQ3hFLE1BQUksaUJBQWtCLGtCQUFpQixVQUFVO0FBQ2pELE1BQUksa0JBQW1CLG1CQUFrQixVQUFVO0FBRW5ELFFBQU0sb0JBQW9CLFNBQVMsZUFBZSxzQkFBc0I7QUFDeEUsTUFBSSxrQkFBbUIsbUJBQWtCLFVBQVU7QUFHbkQsTUFBSSxJQUFJLGlCQUFpQjtBQUN2QixRQUFJLGdCQUFnQixVQUFVLFlBQVk7QUFDeEMsaUJBQVcsS0FBSyxpQkFBaUI7QUFDL0IsWUFBSSxDQUFDLGFBQWEsSUFBSSxFQUFFLElBQUksRUFBRyxPQUFNLGtCQUFrQixFQUFFLElBQUk7QUFBQSxNQUMvRDtBQUNBLHVCQUFpQjtBQUNqQiw4QkFBd0I7QUFDeEIscUJBQWU7QUFDZixjQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLElBQUksZ0JBQWdCO0FBQ3RCLFFBQUksZUFBZSxVQUFVO0FBQUEsRUFDL0I7QUFHQSxNQUFJLElBQUksVUFBVSxJQUFJLFdBQVc7QUFDL0IsUUFBSSxPQUFPLFVBQVUsTUFBTSxJQUFJLFVBQVUsTUFBTTtBQUMvQyxRQUFJLFVBQVUsV0FBVyxZQUFZO0FBQ25DLFlBQU0sT0FBTyxJQUFJLFVBQVUsTUFBTSxDQUFDO0FBQ2xDLFVBQUksQ0FBQyxLQUFNO0FBQ1gsa0JBQVksYUFBYSxLQUFLLElBQUksVUFBSyxJQUFJO0FBQzNDLFVBQUk7QUFDRixjQUFNLFdBQVcsSUFBSSxTQUFTO0FBQzlCLGlCQUFTLE9BQU8sUUFBUSxNQUFNLEtBQUssSUFBSTtBQUN2QyxpQkFBUyxPQUFPLGNBQWMsR0FBRztBQUNqQyxpQkFBUyxPQUFPLFdBQVcsV0FBVztBQUN0QyxpQkFBUyxPQUFPLFdBQVcsS0FBSztBQUNoQyxjQUFNLGFBQWEsTUFBTSxNQUFNLDJCQUEyQjtBQUFBLFVBQ3hELFFBQVE7QUFBQSxVQUNSLE1BQU07QUFBQSxVQUNOLFNBQVMsRUFBRSx1QkFBd0IsT0FBTyxVQUFVLE9BQU8sY0FBZSxHQUFHO0FBQUEsUUFDL0UsQ0FBQztBQUNELFlBQUksQ0FBQyxXQUFXLEdBQUksT0FBTSxJQUFJLE1BQU0sZUFBZTtBQUNuRCxjQUFNLGFBQWEsTUFBTSxXQUFXLEtBQUs7QUFDekMsY0FBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLFFBQVE7QUFDekQsWUFBSSxDQUFDLFFBQVMsT0FBTSxJQUFJLE1BQU0sNkJBQTZCO0FBRTNELFlBQUksT0FBTztBQUNYLGNBQU0sWUFBWSxLQUFLLEtBQUssWUFBWTtBQUN4QyxZQUFJLFVBQVUsU0FBUyxPQUFPLEtBQUssVUFBVSxTQUFTLEtBQUssRUFBRyxRQUFPO0FBQUEsaUJBQzVELFVBQVUsU0FBUyxNQUFNLEtBQUssVUFBVSxTQUFTLEtBQUssRUFBRyxRQUFPO0FBRXpFLG9CQUFZLHFCQUFnQixJQUFJO0FBQ2hDLGNBQU0sWUFBWSxNQUFNLE9BQU8sS0FBSztBQUFBLFVBQ2xDLFFBQVEsSUFBSTtBQUFBLFVBQ1osTUFBTTtBQUFBLFlBQ0osVUFBVTtBQUFBLFlBQ1YsV0FBVyxLQUFLO0FBQUEsWUFDaEIsWUFBWSxLQUFLLEtBQUssUUFBUSxXQUFXLEVBQUU7QUFBQSxZQUMzQyxZQUFZO0FBQUEsVUFDZDtBQUFBLFFBQ0YsQ0FBQztBQUNELGNBQU0sZUFBZTtBQUNyQixjQUFNLGtCQUFrQixVQUFVLFFBQVEsSUFBSTtBQUM5Qyx5QkFBaUI7QUFDakIsZ0NBQXdCO0FBQ3hCLGdCQUFRO0FBQ1Isa0JBQVUsWUFBWSxLQUFLLElBQUksZUFBZTtBQUFBLE1BQ2hELFNBQVMsR0FBRztBQUNWLGtCQUFVLHFCQUFxQixFQUFFLFdBQVcsRUFBRTtBQUFBLE1BQ2hELFVBQUU7QUFDQSxvQkFBWSxJQUFJLEtBQUs7QUFDckIsWUFBSSxVQUFVLFFBQVE7QUFBQSxNQUN4QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBR0EsUUFBTSxZQUFZLFNBQVMsZUFBZSxTQUFTO0FBQ25ELE1BQUksVUFBVyxXQUFVLFVBQVU7QUFFbkMsUUFBTSxtQkFBbUIsU0FBUyxlQUFlLG9CQUFvQjtBQUNyRSxNQUFJLGtCQUFrQjtBQUNwQixxQkFBaUIsVUFBVSxNQUFNO0FBQy9CLGVBQVMsT0FBTyxPQUFPLE1BQU07QUFDN0IsVUFBSSxJQUFJLG1CQUFtQjtBQUN6QixZQUFJLGtCQUFrQixVQUFVLElBQUksa0JBQWtCLFFBQVEsT0FBTyxNQUFNLHdDQUF1QyxvQkFBSSxLQUFLLEdBQUUsbUJBQW1CLENBQUM7QUFBQSxNQUNuSjtBQUNBLGdCQUFVLDJDQUEyQztBQUFBLElBQ3ZEO0FBQUEsRUFDRjtBQUVBLFFBQU0sV0FBVyxTQUFTLGVBQWUsUUFBUTtBQUNqRCxNQUFJLFVBQVU7QUFDWixhQUFTLFVBQVUsWUFBWTtBQUM3QixVQUFJLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLFNBQVM7QUFDbEQsZUFBTyxTQUFTLEdBQUcsbUNBQW1DLENBQUM7QUFDdkQ7QUFBQSxNQUNGO0FBQ0EsWUFBTSxhQUFhLFNBQVMsZUFBZSxTQUFTO0FBQ3BELFlBQU0sWUFBWSxTQUFTLGVBQWUsU0FBUztBQUNuRCxZQUFNLGFBQWEsYUFBYSxXQUFXLFFBQVE7QUFDbkQsWUFBTSxhQUFhLFlBQVksVUFBVSxNQUFNLEtBQUssSUFBSTtBQUN4RCxVQUFJLENBQUMsV0FBWTtBQUNqQixVQUFJO0FBQ0YsY0FBTSxPQUFPLEtBQUs7QUFBQSxVQUNoQixRQUFRLElBQUk7QUFBQSxVQUNaLE1BQU07QUFBQSxZQUNKLFNBQVMsaUJBQWlCLFFBQVEsUUFBUSxpQkFBaUI7QUFBQSxZQUMzRCxnQkFBZ0I7QUFBQSxZQUNoQixhQUFhO0FBQUEsVUFDZjtBQUFBLFFBQ0YsQ0FBQztBQUNELGtCQUFVLHVCQUF1QixVQUFVLEVBQUU7QUFDN0MsWUFBSSxVQUFXLFdBQVUsUUFBUTtBQUFBLE1BQ25DLFNBQVMsR0FBRztBQUNWLGtCQUFVLGVBQWUsRUFBRSxXQUFXLENBQUMsRUFBRTtBQUFBLE1BQzNDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFHQSxNQUFJLElBQUksWUFBYSxLQUFJLFlBQVksV0FBVztBQUNoRCxNQUFJLElBQUksUUFBUyxLQUFJLFFBQVEsV0FBVztBQUN4QyxNQUFJLElBQUksTUFBTyxLQUFJLE1BQU0sV0FBVztBQUNwQyxNQUFJLElBQUksUUFBUyxLQUFJLFFBQVEsVUFBVTtBQUN2QyxRQUFNLFNBQVMsU0FBUyxlQUFlLFNBQVM7QUFDaEQsTUFBSSxRQUFRO0FBQ1YsV0FBTyxVQUFVLE1BQU07QUFDckIsVUFBSSxJQUFJLFlBQWEsS0FBSSxZQUFZLFFBQVE7QUFDN0MsVUFBSSxJQUFJLFFBQVMsS0FBSSxRQUFRLFFBQVE7QUFDckMsVUFBSSxJQUFJLE1BQU8sS0FBSSxNQUFNLFFBQVE7QUFDakMsVUFBSSxJQUFJLFFBQVMsS0FBSSxRQUFRLFFBQVE7QUFDckMsbUJBQWE7QUFBQSxJQUNmO0FBQUEsRUFDRjtBQUNGO0FBRUEsZUFBZSxvQkFBb0I7QUFDakMsUUFBTSxTQUFTLElBQUksZ0JBQWdCLE9BQU8sU0FBUyxNQUFNO0FBQ3pELFFBQU0sWUFBYSxPQUFPLFVBQVUsT0FBTyxpQkFBa0IsQ0FBQztBQUM5RCxRQUFNLGVBQWUsVUFBVSxXQUFXLE9BQU8sSUFBSSxTQUFTO0FBQzlELFFBQU0sYUFBYSxVQUFVLFNBQVMsVUFBVSxVQUFVLE9BQU8sSUFBSSxRQUFRLEtBQUssT0FBTyxJQUFJLE9BQU87QUFDcEcsUUFBTSxhQUFhLFVBQVUsU0FBUyxPQUFPLElBQUksT0FBTztBQUN4RCxRQUFNLFFBQVEsVUFBVSxhQUFhLE9BQU8sSUFBSSxXQUFXO0FBQzNELFFBQU0sUUFBUSxVQUFVLGFBQWEsT0FBTyxJQUFJLFdBQVc7QUFFM0QsTUFBSSxjQUFjO0FBQ2hCLG9CQUFnQjtBQUFBLEVBQ2xCO0FBRUEsTUFBSSxjQUFjLGVBQWUsUUFBUTtBQUN2QyxVQUFNLGFBQWEsV0FBVyxNQUFNLEdBQUcsRUFBRSxJQUFJLE9BQUssRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLE9BQU87QUFDMUUsZUFBVyxLQUFLLFlBQVk7QUFDMUIsVUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLEdBQUc7QUFDeEIsY0FBTSxrQkFBa0IsQ0FBQztBQUFBLE1BQzNCO0FBQUEsSUFDRjtBQUNBLHFCQUFpQjtBQUNqQiw0QkFBd0I7QUFDeEIsUUFBSSxPQUFPLG1CQUFtQixXQUFZLGdCQUFlO0FBQ3pELFlBQVE7QUFBQSxFQUNWLFdBQVcsZ0JBQWdCLE9BQU8sb0JBQW9CLGVBQWUsZ0JBQWdCLFFBQVE7QUFDM0YsVUFBTSxhQUFhLGdCQUFnQixPQUFPLE9BQUssRUFBRSxZQUFZLFlBQVk7QUFDekUsUUFBSSxXQUFXLFNBQVMsR0FBRztBQUN6QixpQkFBVyxLQUFLLFlBQVk7QUFDMUIsWUFBSSxDQUFDLGFBQWEsSUFBSSxFQUFFLElBQUksR0FBRztBQUM3QixnQkFBTSxrQkFBa0IsRUFBRSxJQUFJO0FBQUEsUUFDaEM7QUFBQSxNQUNGO0FBQ0EsdUJBQWlCO0FBQ2pCLDhCQUF3QjtBQUN4QixVQUFJLE9BQU8sbUJBQW1CLFdBQVksZ0JBQWU7QUFDekQsY0FBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBRUEsTUFBSSxZQUFZO0FBQ2QsVUFBTSxhQUFhLFNBQVMsZUFBZSxpQkFBaUI7QUFDNUQsUUFBSSxXQUFZLFlBQVcsTUFBTTtBQUNqQyxVQUFNLG9CQUFvQjtBQUMxQixVQUFNLFFBQVEsZ0JBQWdCLEtBQUssT0FBSyxFQUFFLFNBQVMsY0FBYyxFQUFFLE9BQU8sVUFBVTtBQUNwRixRQUFJLE9BQU87QUFDVCxrQkFBWSxLQUFLO0FBQ2pCLGlCQUFXLEtBQUs7QUFBQSxJQUNsQjtBQUFBLEVBQ0YsV0FBVyxTQUFTLE9BQU87QUFDekIsVUFBTSxRQUFRLGNBQWMsS0FBSyxVQUFRO0FBQ3ZDLFlBQU0sS0FBSyxhQUFhLElBQUksR0FBRyxLQUFLLFlBQVksSUFBSSxLQUFLLFNBQVMsRUFBRSxLQUFLLGFBQWEsSUFBSSxPQUFPLEtBQUssU0FBUyxDQUFDO0FBQ2hILFlBQU0sTUFBTyxNQUFNLEdBQUcsYUFBZSxLQUFLLFFBQVEsS0FBSyxLQUFLLGFBQWEsS0FBSyxLQUFLLFNBQVMsUUFBUSxLQUFLLEtBQUssU0FBUztBQUN2SCxhQUFPLFFBQVEsUUFBUSxTQUFTLFFBQVE7QUFBQSxJQUMxQyxDQUFDO0FBQ0QsUUFBSSxPQUFPO0FBQ1Qsb0JBQWMsTUFBTSxNQUFNLE1BQU0sV0FBVyxNQUFNLFlBQVk7QUFBQSxJQUMvRDtBQUFBLEVBQ0Y7QUFFQSxRQUFNLFlBQVksVUFBVSxRQUFRLE9BQU8sSUFBSSxNQUFNO0FBQ3JELE1BQUksY0FBYyxnQkFBZ0I7QUFDaEMsZUFBVyxjQUFjO0FBQUEsRUFDM0IsT0FBTztBQUNMLGVBQVcsWUFBWTtBQUFBLEVBQ3pCO0FBQ0Y7QUFLQSxJQUFJLGlCQUFpQjtBQUNyQixJQUFJLHFCQUFxQjtBQUN6QixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGlCQUFpQjtBQUNyQixJQUFJLG1CQUFtQjtBQUN2QixJQUFJLHNCQUFzQixDQUFDO0FBRTNCLFNBQVMsV0FBVyxNQUFNO0FBQ3hCLG1CQUFpQjtBQUNqQixRQUFNLFdBQVcsU0FBUyxlQUFlLHFCQUFxQjtBQUM5RCxRQUFNLFlBQVksU0FBUyxlQUFlLHVCQUF1QjtBQUNqRSxRQUFNLFlBQVksU0FBUyxlQUFlLHNCQUFzQjtBQUNoRSxRQUFNLGFBQWEsU0FBUyxlQUFlLHdCQUF3QjtBQUNuRSxRQUFNLGNBQWMsU0FBUyxlQUFlLHFCQUFxQjtBQUNqRSxRQUFNLGVBQWUsU0FBUyxlQUFlLHVCQUF1QjtBQUVwRSxNQUFJLFNBQVMsY0FBYztBQUN6QixRQUFJLFNBQVUsVUFBUyxNQUFNLFVBQVU7QUFDdkMsUUFBSSxVQUFXLFdBQVUsTUFBTSxVQUFVO0FBQ3pDLFFBQUksVUFBVyxXQUFVLE1BQU0sVUFBVTtBQUN6QyxRQUFJLFdBQVksWUFBVyxNQUFNLFVBQVU7QUFDM0MsUUFBSSxZQUFhLGFBQVksVUFBVSxJQUFJLFFBQVE7QUFDbkQsUUFBSSxhQUFjLGNBQWEsVUFBVSxPQUFPLFFBQVE7QUFDeEQsUUFBSSxjQUFlLHlCQUF3QjtBQUFBLEVBQzdDLE9BQU87QUFDTCxRQUFJLFNBQVUsVUFBUyxNQUFNLFVBQVU7QUFDdkMsUUFBSSxVQUFXLFdBQVUsTUFBTSxVQUFVO0FBQ3pDLFFBQUksVUFBVyxXQUFVLE1BQU0sVUFBVTtBQUN6QyxRQUFJLFdBQVksWUFBVyxNQUFNLFVBQVU7QUFDM0MsUUFBSSxZQUFhLGFBQVksVUFBVSxPQUFPLFFBQVE7QUFDdEQsUUFBSSxhQUFjLGNBQWEsVUFBVSxJQUFJLFFBQVE7QUFBQSxFQUN2RDtBQUNGO0FBRUEsU0FBUyxlQUFlLEtBQUs7QUFDM0IsdUJBQXFCO0FBQ3JCLFFBQU0sU0FBUyxTQUFTLGlCQUFpQixhQUFhO0FBQ3RELFNBQU8sUUFBUSxPQUFLO0FBQ2xCLFFBQUksRUFBRSxRQUFRLE9BQU8sSUFBSyxHQUFFLFVBQVUsSUFBSSxRQUFRO0FBQUEsUUFDN0MsR0FBRSxVQUFVLE9BQU8sUUFBUTtBQUFBLEVBQ2xDLENBQUM7QUFFRCxRQUFNLE9BQU8sU0FBUyxlQUFlLHVCQUF1QjtBQUM1RCxRQUFNLFFBQVEsU0FBUyxlQUFlLHdCQUF3QjtBQUM5RCxRQUFNLFFBQVEsU0FBUyxlQUFlLHdCQUF3QjtBQUU5RCxNQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVcsUUFBUSxPQUFRLFVBQVU7QUFDMUQsTUFBSSxNQUFPLE9BQU0sTUFBTSxVQUFXLFFBQVEsUUFBUyxVQUFVO0FBQzdELE1BQUksTUFBTyxPQUFNLE1BQU0sVUFBVyxRQUFRLFFBQVMsVUFBVTtBQUU3RCxNQUFJLFFBQVEsTUFBTTtBQUNoQixXQUFPLGNBQWMsSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUFBLEVBQzFDO0FBQ0Y7QUFFQSxlQUFlLDBCQUEwQjtBQUN2QyxNQUFJLENBQUMsY0FBZTtBQUNwQixNQUFJO0FBQ0YsVUFBTSxNQUFNLE1BQU0sT0FBTyxLQUFLO0FBQUEsTUFDNUIsUUFBUSxJQUFJO0FBQUEsTUFDWixNQUFNLEVBQUUsU0FBUyxjQUFjO0FBQUEsSUFDakMsQ0FBQztBQUNELFFBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFTO0FBQzFCLHFCQUFpQixJQUFJO0FBQ3JCLDhCQUEwQixjQUFjO0FBQUEsRUFDMUMsU0FBUyxHQUFHO0FBQ1YsWUFBUSxNQUFNLHNDQUFzQyxDQUFDO0FBQUEsRUFDdkQ7QUFDRjtBQUVBLFNBQVMsMEJBQTBCLE1BQU07QUFDdkMsUUFBTSxZQUFZLEtBQUssYUFBYSxDQUFDO0FBQ3JDLFFBQU0sUUFBUSxVQUFVLFNBQVMsQ0FBQztBQUdsQyxRQUFNLFVBQVUsU0FBUyxlQUFlLG1CQUFtQjtBQUMzRCxNQUFJLFFBQVMsU0FBUSxjQUFjLEtBQUssZ0JBQWdCLEtBQUs7QUFDN0QsUUFBTSxnQkFBZ0IsU0FBUyxlQUFlLDBCQUEwQjtBQUN4RSxNQUFJLGVBQWU7QUFDakIsa0JBQWMsY0FBYyxLQUFLLGtCQUFrQjtBQUNuRCxrQkFBYyxZQUFZLGdCQUFnQixLQUFLLG1CQUFtQixnQkFBZ0Isb0JBQW9CO0FBQUEsRUFDeEc7QUFHQSxRQUFNLGdCQUFnQixTQUFTLGVBQWUsZ0JBQWdCO0FBQzlELE1BQUksZUFBZTtBQUNqQixVQUFNLE9BQVEsS0FBSyxpQkFBaUIsS0FBTSxVQUFVLG1CQUFtQixVQUFVLGtCQUFrQjtBQUNuRyxrQkFBYyxjQUFjLE9BQU8sY0FBYztBQUNqRCxrQkFBYyxZQUFZLGdCQUFnQixPQUFPLG9CQUFvQjtBQUFBLEVBQ3ZFO0FBRUEsUUFBTSxXQUFXLFNBQVMsZUFBZSxXQUFXO0FBQ3BELE1BQUksVUFBVTtBQUNaLFVBQU0sV0FBVyxLQUFLLGFBQWE7QUFDbkMsYUFBUyxjQUFjLEdBQUcsUUFBUTtBQUNsQyxhQUFTLFlBQVksZ0JBQWdCLFdBQVcsSUFBSSxvQkFBb0I7QUFBQSxFQUMxRTtBQUVBLFFBQU0sY0FBYyxTQUFTLGVBQWUsY0FBYztBQUMxRCxNQUFJLGFBQWE7QUFDZixVQUFNLGNBQWMsS0FBSyxVQUFVLENBQUMsR0FBRztBQUN2QyxnQkFBWSxjQUFjLEdBQUcsVUFBVTtBQUN2QyxnQkFBWSxZQUFZLGdCQUFnQixhQUFhLElBQUksb0JBQW9CO0FBQUEsRUFDL0U7QUFFQSxRQUFNLFdBQVcsU0FBUyxlQUFlLFdBQVc7QUFDcEQsTUFBSSxVQUFVO0FBQ1osVUFBTSxPQUFRLEtBQUssYUFBYSxLQUFLLFVBQVUsU0FBUyxLQUFPLFVBQVUsa0JBQWtCLFVBQVUsaUJBQWlCO0FBQ3RILGFBQVMsY0FBYyxPQUFPLGNBQWM7QUFDNUMsYUFBUyxZQUFZLGdCQUFnQixPQUFPLG9CQUFvQjtBQUFBLEVBQ2xFO0FBRUEsUUFBTSxnQkFBZ0IsU0FBUyxlQUFlLHVCQUF1QjtBQUNyRSxNQUFJLGVBQWU7QUFDakIsVUFBTSxjQUFjLE1BQU0sT0FBTyxPQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ2hELGtCQUFjLGNBQWMsR0FBRyxXQUFXO0FBQUEsRUFDNUM7QUFHQSxRQUFNLGlCQUFpQixTQUFTLGVBQWUsaUJBQWlCO0FBQ2hFLE1BQUksa0JBQWtCLEtBQUssUUFBUTtBQUNqQyxRQUFJLENBQUMsS0FBSyxPQUFPLFFBQVE7QUFDdkIscUJBQWUsWUFBWTtBQUFBLElBQzdCLE9BQU87QUFDTCxxQkFBZSxZQUFZLEtBQUssT0FBTyxJQUFJLE9BQUs7QUFDOUMsY0FBTSxXQUFXLGFBQWEsSUFBSSxFQUFFLElBQUk7QUFDeEMsZUFBTztBQUFBLHVDQUN3QixXQUFXLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxJQUFJO0FBQUE7QUFBQSwwRUFFWixFQUFFLElBQUksS0FBSyxXQUFXLFlBQVksRUFBRTtBQUFBLHNCQUN4RixFQUFFLGNBQWMsRUFBRSxJQUFJO0FBQUE7QUFBQSwrQ0FFRyxFQUFFLGNBQWMsUUFBUSxZQUFZLENBQUMsS0FBSyxFQUFFLGNBQWMsY0FBYztBQUFBO0FBQUE7QUFBQSxNQUdqSCxDQUFDLEVBQUUsS0FBSyxFQUFFO0FBRVYscUJBQWUsaUJBQWlCLGlCQUFpQixFQUFFLFFBQVEsU0FBTztBQUNoRSxZQUFJLFdBQVcsT0FBTyxNQUFNO0FBQzFCLFlBQUUsZ0JBQWdCO0FBQ2xCLGdCQUFNLFFBQVEsSUFBSSxRQUFRO0FBQzFCLGNBQUksSUFBSSxTQUFTO0FBQ2Ysa0JBQU0sa0JBQWtCLEtBQUs7QUFBQSxVQUMvQixPQUFPO0FBQ0wsd0JBQVksS0FBSztBQUFBLFVBQ25CO0FBQ0EsMkJBQWlCO0FBQ2pCLGtDQUF3QjtBQUN4QixrQkFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUlBLFFBQU0saUJBQWlCLFNBQVMsZUFBZSx3QkFBd0I7QUFDdkUsTUFBSSxlQUFnQixnQkFBZSxjQUFjLFFBQVEsVUFBVSxtQkFBbUIsR0FBRyxlQUFlLFFBQVcsRUFBRSx1QkFBdUIsRUFBRSxDQUFDLENBQUM7QUFDaEosUUFBTSxpQkFBaUIsU0FBUyxlQUFlLHVCQUF1QjtBQUN0RSxNQUFJLGVBQWdCLGdCQUFlLGNBQWMsR0FBRyxLQUFLLGtCQUFrQixDQUFDO0FBQzVFLFFBQU0sWUFBWSxTQUFTLGVBQWUsdUJBQXVCO0FBQ2pFLE1BQUksV0FBVztBQUNiLFVBQU0sU0FBUyxNQUFNLENBQUMsS0FBSyxNQUFNLENBQUMsRUFBRTtBQUNwQyxjQUFVLGNBQWMsU0FBUyxjQUFjO0FBQy9DLGNBQVUsWUFBWSxnQkFBZ0IsU0FBUyxvQkFBb0I7QUFBQSxFQUNyRTtBQUdBLFFBQU0sYUFBYSxTQUFTLGVBQWUsaUJBQWlCO0FBQzVELE1BQUksV0FBWSxZQUFXLGNBQWMsUUFBUSxVQUFVLGtCQUFrQixHQUFHLGVBQWUsUUFBVyxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQztBQUN2SSxRQUFNLGNBQWMsU0FBUyxlQUFlLGtCQUFrQjtBQUM5RCxNQUFJLFlBQWEsYUFBWSxjQUFjLEdBQUksS0FBSyxhQUFhLEtBQUssVUFBVSxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUMsRUFBRSxjQUFlLFVBQVU7QUFDakksUUFBTSxXQUFXLFNBQVMsZUFBZSxxQkFBcUI7QUFDOUQsTUFBSSxVQUFVO0FBQ1osVUFBTSxTQUFTLE1BQU0sQ0FBQyxLQUFLLE1BQU0sQ0FBQyxFQUFFO0FBQ3BDLGFBQVMsY0FBYyxTQUFTLGNBQWM7QUFDOUMsYUFBUyxZQUFZLGdCQUFnQixTQUFTLG9CQUFvQjtBQUFBLEVBQ3BFO0FBR0EsUUFBTSxhQUFhLFNBQVMsZUFBZSx1QkFBdUI7QUFDbEUsTUFBSSxXQUFZLFlBQVcsY0FBYyxjQUFjLFdBQVcsS0FBSyxVQUFVLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxNQUFNLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxDQUFDO0FBQ3hJLFFBQU0sV0FBVyxTQUFTLGVBQWUscUJBQXFCO0FBQzlELFFBQU0sZUFBZSxTQUFTLGVBQWUsb0JBQW9CO0FBQ2pFLFFBQU0sYUFBYSxTQUFTLGVBQWUsa0JBQWtCO0FBQzdELFFBQU0sWUFBWSxLQUFLLGFBQWEsQ0FBQztBQUVyQyxNQUFJLFVBQVUsZ0JBQWdCO0FBQzVCLDBCQUFzQixVQUFVLGdCQUFnQixDQUFDO0FBQ2pELFFBQUksU0FBVSxVQUFTLGNBQWMsVUFBVSxVQUFVLFlBQVk7QUFDckUsUUFBSSxjQUFjO0FBQ2hCLG1CQUFhLGNBQWM7QUFDM0IsbUJBQWEsWUFBWTtBQUFBLElBQzNCO0FBQ0EsUUFBSSxXQUFZLFlBQVcsTUFBTSxVQUFVO0FBQUEsRUFDN0MsT0FBTztBQUNMLDBCQUFzQixDQUFDO0FBQ3ZCLFFBQUksU0FBVSxVQUFTLGNBQWM7QUFDckMsUUFBSSxjQUFjO0FBQ2hCLG1CQUFhLGNBQWMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxHQUFHLE1BQU07QUFDeEQsbUJBQWEsWUFBWTtBQUFBLElBQzNCO0FBQ0EsUUFBSSxXQUFZLFlBQVcsTUFBTSxVQUFVO0FBQUEsRUFDN0M7QUFHQSxRQUFNLFlBQVksU0FBUyxlQUFlLGtCQUFrQjtBQUM1RCxNQUFJLFVBQVcsV0FBVSxjQUFjLEdBQUcsS0FBSyxhQUFhLENBQUM7QUFDN0QsUUFBTSxhQUFhLFNBQVMsZUFBZSxtQkFBbUI7QUFDOUQsTUFBSSxXQUFZLFlBQVcsY0FBZSxLQUFLLFlBQVksSUFBSyxjQUFjO0FBQzlFLFFBQU0sZ0JBQWdCLFNBQVMsZUFBZSxxQkFBcUI7QUFDbkUsTUFBSSxlQUFlO0FBQ2pCLGtCQUFjLGNBQWMsR0FBRyxLQUFLLGFBQWEsQ0FBQztBQUNsRCxrQkFBYyxZQUFZLGdCQUFnQixLQUFLLFlBQVksSUFBSSxvQkFBb0I7QUFBQSxFQUNyRjtBQUdBLFFBQU0sWUFBWTtBQUFBLElBQ2hCLEVBQUUsSUFBSSxzQkFBc0IsUUFBUSxNQUFNLENBQUMsS0FBSyxNQUFNLENBQUMsRUFBRSxPQUFPO0FBQUEsSUFDaEUsRUFBRSxJQUFJLG1CQUFtQixRQUFRLE1BQU0sQ0FBQyxLQUFLLE1BQU0sQ0FBQyxFQUFFLE9BQU87QUFBQSxJQUM3RCxFQUFFLElBQUksaUJBQWlCLFFBQVEsTUFBTSxDQUFDLEtBQUssTUFBTSxDQUFDLEVBQUUsT0FBTztBQUFBLElBQzNELEVBQUUsSUFBSSxxQkFBcUIsUUFBUSxVQUFVLFVBQVU7QUFBQSxFQUN6RDtBQUVBLFlBQVUsUUFBUSxPQUFLO0FBQ3JCLFVBQU0sS0FBSyxTQUFTLGVBQWUsRUFBRSxFQUFFO0FBQ3ZDLFFBQUksSUFBSTtBQUNOLFVBQUksRUFBRSxRQUFRO0FBQ1osV0FBRyxVQUFVLElBQUksUUFBUTtBQUN6QixjQUFNLE9BQU8sR0FBRyxjQUFjLFlBQVk7QUFDMUMsWUFBSSxLQUFNLE1BQUssY0FBYztBQUFBLE1BQy9CLE9BQU87QUFDTCxXQUFHLFVBQVUsT0FBTyxRQUFRO0FBQzVCLGNBQU0sT0FBTyxHQUFHLGNBQWMsWUFBWTtBQUMxQyxZQUFJLEtBQU0sTUFBSyxjQUFjO0FBQUEsTUFDL0I7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBRUQsUUFBTSxnQkFBZ0IsU0FBUyxlQUFlLGlCQUFpQjtBQUMvRCxNQUFJLGVBQWU7QUFDakIsUUFBSSxVQUFVLFdBQVc7QUFDdkIsb0JBQWMsY0FBYztBQUM1QixvQkFBYyxZQUFZO0FBQUEsSUFDNUIsT0FBTztBQUNMLFlBQU0sWUFBWSxNQUFNLE9BQU8sT0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFO0FBQy9DLG9CQUFjLGNBQWMsR0FBRyxTQUFTO0FBQ3hDLG9CQUFjLFlBQVk7QUFBQSxJQUM1QjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLGFBQWEsU0FBUyxlQUFlLHdCQUF3QjtBQUNuRSxNQUFJLFlBQVk7QUFDZCxlQUFXLFdBQVcsQ0FBQyxVQUFVO0FBQUEsRUFDbkM7QUFDRjtBQUVBLGVBQWUsaUJBQWlCLE1BQU0sVUFBVSxZQUFZO0FBQzFELGNBQVksYUFBYSxLQUFLLElBQUksUUFBUSxRQUFRLFVBQUssSUFBSTtBQUMzRCxNQUFJO0FBQ0YsVUFBTSxXQUFXLElBQUksU0FBUztBQUM5QixhQUFTLE9BQU8sUUFBUSxNQUFNLEtBQUssSUFBSTtBQUN2QyxhQUFTLE9BQU8sY0FBYyxHQUFHO0FBQ2pDLGFBQVMsT0FBTyxXQUFXLFNBQVM7QUFDcEMsYUFBUyxPQUFPLFdBQVcsaUJBQWlCLEtBQUs7QUFDakQsVUFBTSxhQUFhLE1BQU0sTUFBTSwyQkFBMkI7QUFBQSxNQUN4RCxRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsTUFDTixTQUFTLEVBQUUsdUJBQXdCLE9BQU8sVUFBVSxPQUFPLGNBQWUsR0FBRztBQUFBLElBQy9FLENBQUM7QUFDRCxRQUFJLENBQUMsV0FBVyxHQUFJLE9BQU0sSUFBSSxNQUFNLHVCQUF1QjtBQUMzRCxVQUFNLGFBQWEsTUFBTSxXQUFXLEtBQUs7QUFDekMsVUFBTSxVQUFVLFdBQVcsV0FBVyxXQUFXLFFBQVE7QUFDekQsUUFBSSxDQUFDLFFBQVMsT0FBTSxJQUFJLE1BQU0sNkJBQTZCO0FBRTNELFVBQU0sV0FBVyxNQUFNLE9BQU8sS0FBSztBQUFBLE1BQ2pDLFFBQVEsSUFBSTtBQUFBLE1BQ1osTUFBTTtBQUFBLFFBQ0osU0FBUztBQUFBLFFBQ1Q7QUFBQSxRQUNBLFVBQVU7QUFBQSxRQUNWLFVBQVUsS0FBSztBQUFBLFFBQ2YsWUFBWSxjQUFjO0FBQUEsTUFDNUI7QUFBQSxJQUNGLENBQUM7QUFFRCxRQUFJLGFBQWEsT0FBTztBQUN0Qix5QkFBbUI7QUFDbkIsWUFBTSwwQkFBMEIsT0FBTztBQUFBLElBQ3pDLFdBQVcsYUFBYSxPQUFPO0FBQzdCLFlBQU0sZUFBZSxTQUFTLFdBQVcsU0FBUyxRQUFRLG1CQUFtQixTQUFTLFFBQVEsZ0JBQWdCLFdBQVc7QUFDekgsVUFBSSxjQUFjO0FBQ2hCLGNBQU0sZUFBZTtBQUNyQixjQUFNLGtCQUFrQixZQUFZO0FBQ3BDLHlCQUFpQjtBQUNqQixnQ0FBd0I7QUFDeEIsZ0JBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUVBLGNBQVUsU0FBUyxLQUFLLElBQUksU0FBUyxTQUFTLFFBQVEsYUFBYSxFQUFFO0FBQ3JFLFVBQU0sd0JBQXdCO0FBQUEsRUFDaEMsU0FBUyxHQUFHO0FBQ1YsY0FBVSxpQkFBaUIsRUFBRSxXQUFXLENBQUMsRUFBRTtBQUMzQyxXQUFPLFNBQVMsRUFBRSxPQUFPLEdBQUcsY0FBYyxHQUFHLFNBQVMsRUFBRSxXQUFXLEdBQUcsV0FBVyxNQUFNLENBQUM7QUFBQSxFQUMxRixVQUFFO0FBQ0EsZ0JBQVksSUFBSSxLQUFLO0FBQUEsRUFDdkI7QUFDRjtBQUVBLGVBQWUsMEJBQTBCLFNBQVM7QUFDaEQsY0FBWSx1Q0FBa0MsSUFBSTtBQUNsRCxNQUFJO0FBQ0YsVUFBTSxNQUFNLE1BQU0sT0FBTyxLQUFLO0FBQUEsTUFDNUIsUUFBUSxJQUFJO0FBQUEsTUFDWixNQUFNLEVBQUUsVUFBVSxRQUFRO0FBQUEsSUFDNUIsQ0FBQztBQUNELFVBQU0sU0FBUyxJQUFJO0FBQ25CLFFBQUksQ0FBQyxPQUFRO0FBRWIsVUFBTSxRQUFRLFNBQVMsZUFBZSxtQkFBbUI7QUFDekQsUUFBSSxDQUFDLE1BQU87QUFFWixVQUFNLFVBQVUsT0FBTyxXQUFXLENBQUM7QUFDbkMsVUFBTSxZQUFZLE9BQU8scUJBQXFCLENBQUM7QUFFL0MsVUFBTSxZQUFZO0FBQUEsTUFDaEIscUJBQXFCLFVBQVU7QUFBQSxNQUMvQixnQkFBZ0IsVUFBVTtBQUFBLE1BQzFCLGdCQUFnQixVQUFVO0FBQUEsTUFDMUIsZUFBZSxVQUFVO0FBQUEsTUFDekIsZ0JBQWdCLFVBQVU7QUFBQSxNQUMxQixpQkFBaUIsVUFBVTtBQUFBLElBQzdCO0FBRUEsV0FBTyxRQUFRLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxPQUFPLFlBQVksTUFBTTtBQUMzRCxZQUFNLFNBQVMsU0FBUyxlQUFlLEtBQUs7QUFDNUMsVUFBSSxDQUFDLE9BQVE7QUFDYixhQUFPLFlBQVkseURBQ2pCLFFBQVEsSUFBSSxPQUFLLGtCQUFrQixDQUFDLEtBQUssTUFBTSxlQUFlLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRTtBQUFBLElBQzFHLENBQUM7QUFFRCxVQUFNLFFBQVEsU0FBUyxlQUFlLG1CQUFtQjtBQUN6RCxVQUFNLFFBQVEsU0FBUyxlQUFlLG1CQUFtQjtBQUN6RCxRQUFJLE9BQU87QUFDVCxZQUFNLFlBQVksU0FBUyxRQUFRLElBQUksT0FBSyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJO0FBQUEsSUFDMUU7QUFDQSxRQUFJLFNBQVMsT0FBTyxlQUFlO0FBQ2pDLFlBQU0sWUFBWSxPQUFPLGNBQWMsSUFBSSxRQUFNO0FBQUE7QUFBQSxnQkFFdkMsR0FBRyxhQUFhLEVBQUU7QUFBQSxnQkFDbEIsR0FBRyxlQUFlLEVBQUU7QUFBQSxnQkFDcEIsR0FBRyxRQUFRLEVBQUU7QUFBQSxnQkFDYixHQUFHLFlBQVksRUFBRTtBQUFBLGlCQUNoQixHQUFHLGFBQWEsR0FBRyxlQUFlLENBQUM7QUFBQSxpQkFDbkMsR0FBRyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7QUFBQTtBQUFBLE9BRWhELEVBQUUsS0FBSyxFQUFFO0FBQUEsSUFDWjtBQUVBLFVBQU0sWUFBWSxTQUFTLGVBQWUscUJBQXFCO0FBQy9ELFFBQUksV0FBVztBQUNiLGdCQUFVLGNBQWMsZ0JBQWdCLE9BQU8saUJBQWlCLDRCQUE0QixPQUFPLGdCQUFnQixHQUFHLGVBQWUsUUFBVyxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQztBQUFBLElBQy9LO0FBRUEsVUFBTSxNQUFNLFVBQVU7QUFBQSxFQUN4QixTQUFTLEdBQUc7QUFDVixXQUFPLFNBQVMsRUFBRSxPQUFPLEdBQUcsbUJBQW1CLEdBQUcsU0FBUyxFQUFFLFdBQVcsR0FBRyxXQUFXLE1BQU0sQ0FBQztBQUFBLEVBQy9GLFVBQUU7QUFDQSxnQkFBWSxJQUFJLEtBQUs7QUFBQSxFQUN2QjtBQUNGO0FBRUEsZUFBZSxtQkFBbUI7QUFDaEMsTUFBSSxDQUFDLGlCQUFrQjtBQUN2QixRQUFNLFVBQVU7QUFBQSxJQUNkLFdBQVcsU0FBUyxlQUFlLG1CQUFtQixHQUFHLFNBQVM7QUFBQSxJQUNsRSxhQUFhLFNBQVMsZUFBZSxjQUFjLEdBQUcsU0FBUztBQUFBLElBQy9ELE1BQU0sU0FBUyxlQUFlLGNBQWMsR0FBRyxTQUFTO0FBQUEsSUFDeEQsVUFBVSxTQUFTLGVBQWUsYUFBYSxHQUFHLFNBQVM7QUFBQSxJQUMzRCxXQUFXLFNBQVMsZUFBZSxjQUFjLEdBQUcsU0FBUztBQUFBLElBQzdELGNBQWMsU0FBUyxlQUFlLGVBQWUsR0FBRyxTQUFTO0FBQUEsRUFDbkU7QUFFQSxjQUFZLHdDQUFtQyxJQUFJO0FBQ25ELE1BQUk7QUFDRixVQUFNLE1BQU0sTUFBTSxPQUFPLEtBQUs7QUFBQSxNQUM1QixRQUFRLElBQUk7QUFBQSxNQUNaLE1BQU07QUFBQSxRQUNKLFNBQVM7QUFBQSxRQUNULFVBQVU7QUFBQSxRQUNWLGNBQWMsS0FBSyxVQUFVLE9BQU87QUFBQSxNQUN0QztBQUFBLElBQ0YsQ0FBQztBQUVELGFBQVMsZUFBZSxtQkFBbUIsRUFBRSxNQUFNLFVBQVU7QUFDN0QsY0FBVSxZQUFZLElBQUksUUFBUSxjQUFjLDBCQUEwQixJQUFJLFFBQVEsYUFBYSxlQUFlLENBQUMsRUFBRTtBQUNySCxXQUFPLFdBQVc7QUFBQSxNQUNoQixTQUFTLGtDQUE2QixJQUFJLFFBQVEsY0FBYztBQUFBLE1BQ2hFLFdBQVc7QUFBQSxJQUNiLENBQUM7QUFDRCxVQUFNLHdCQUF3QjtBQUFBLEVBQ2hDLFNBQVMsR0FBRztBQUNWLFdBQU8sU0FBUyxFQUFFLE9BQU8sR0FBRyxjQUFjLEdBQUcsU0FBUyxFQUFFLFdBQVcsR0FBRyxXQUFXLE1BQU0sQ0FBQztBQUFBLEVBQzFGLFVBQUU7QUFDQSxnQkFBWSxJQUFJLEtBQUs7QUFBQSxFQUN2QjtBQUNGO0FBRUEsZUFBZSxzQkFBc0I7QUFDbkMsTUFBSTtBQUNGLFVBQU0sTUFBTSxNQUFNLE9BQU8sS0FBSyxFQUFFLFFBQVEsSUFBSSxzQkFBc0IsQ0FBQztBQUNuRSxRQUFJLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUztBQUMxQixVQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxRQUFRLFFBQVEsR0FBRyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDakYsVUFBTSxPQUFPLFNBQVMsY0FBYyxHQUFHO0FBQ3ZDLFNBQUssT0FBTyxJQUFJLGdCQUFnQixJQUFJO0FBQ3BDLFNBQUssV0FBVyxJQUFJLFFBQVEsWUFBWTtBQUN4QyxTQUFLLE1BQU07QUFDWCxRQUFJLGdCQUFnQixLQUFLLElBQUk7QUFBQSxFQUMvQixTQUFTLEdBQUc7QUFDVixZQUFRLE1BQU0sb0NBQW9DLENBQUM7QUFBQSxFQUNyRDtBQUNGO0FBRUEsU0FBUyxpQ0FBaUM7QUFDeEMsTUFBSSxDQUFDLGNBQWMsUUFBUTtBQUN6QixXQUFPLFNBQVMsR0FBRyxnRUFBZ0UsQ0FBQztBQUNwRjtBQUFBLEVBQ0Y7QUFFQSxnQkFBYyxRQUFRLFVBQVE7QUFDNUIsVUFBTSxXQUFZLEtBQUssWUFBWSxNQUFNO0FBQ3pDLFFBQUksS0FBSyxRQUFRLEtBQUssS0FBSyxVQUFVO0FBQ25DLFVBQUksTUFBTSxRQUFRLEtBQUssS0FBSyxRQUFRLEdBQUc7QUFDckMsYUFBSyxLQUFLLFNBQVMsUUFBUSxTQUFPO0FBQ2hDLGNBQUksY0FBYztBQUNsQixjQUFJLFVBQVUsV0FBVyxJQUFNO0FBQy9CLGNBQUksU0FBVSxLQUFJLE1BQU0sT0FBTyxPQUFRO0FBQUEsUUFDekMsQ0FBQztBQUFBLE1BQ0gsT0FBTztBQUNMLGFBQUssS0FBSyxTQUFTLGNBQWM7QUFDakMsYUFBSyxLQUFLLFNBQVMsVUFBVSxXQUFXLElBQU07QUFDOUMsWUFBSSxTQUFVLE1BQUssS0FBSyxTQUFTLE1BQU0sT0FBTyxPQUFRO0FBQUEsTUFDeEQ7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBQ0QsWUFBVSw4RUFBOEU7QUFDMUY7QUFFQSxJQUFJLG1CQUFtQjtBQUV2QixlQUFlLGtCQUFrQjtBQUMvQixNQUFJLGlCQUFrQjtBQUN0QixNQUFJLENBQUMsb0JBQW9CLFFBQVE7QUFDL0IsV0FBTyxTQUFTLEdBQUcsbURBQW1ELENBQUM7QUFDdkU7QUFBQSxFQUNGO0FBRUEscUJBQW1CO0FBQ25CLFFBQU0sU0FBUyxTQUFTLGVBQWUsbUJBQW1CO0FBQzFELE1BQUksT0FBUSxRQUFPLFdBQVc7QUFFOUIsY0FBWSwwREFBcUQsSUFBSTtBQUNyRSxNQUFJO0FBQ0YsZUFBVyxTQUFTLHFCQUFxQjtBQUN2QyxZQUFNLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUMzQyxZQUFNLE9BQU8sS0FBSztBQUFBLFFBQ2hCLFFBQVEsSUFBSTtBQUFBLFFBQ1osTUFBTTtBQUFBLFVBQ0osWUFBWSxNQUFNO0FBQUEsVUFDbEIsVUFBVSxJQUFJLENBQUM7QUFBQSxVQUNmLFVBQVUsSUFBSSxDQUFDO0FBQUEsVUFDZixVQUFVLElBQUksQ0FBQztBQUFBLFFBQ2pCO0FBQUEsTUFDRixDQUFDO0FBRUQsVUFBSSxRQUFRLGFBQWEsSUFBSSxNQUFNLEtBQUs7QUFDeEMsVUFBSSxDQUFDLE9BQU87QUFDVixnQkFBUSxDQUFDLEdBQUcsYUFBYSxPQUFPLENBQUMsRUFBRSxLQUFLLE9BQUssRUFBRSxjQUFjLE1BQU0sS0FBSztBQUFBLE1BQzFFO0FBQ0EsVUFBSSxTQUFTLE1BQU0sT0FBTztBQUN4QixjQUFNLE1BQU0sU0FBUyxLQUFLLElBQUksQ0FBQztBQUMvQixjQUFNLE1BQU0sU0FBUyxLQUFLLElBQUksQ0FBQztBQUMvQixjQUFNLE1BQU0sU0FBUyxLQUFLLElBQUksQ0FBQztBQUFBLE1BQ2pDO0FBQUEsSUFDRjtBQUNBLFdBQU8sV0FBVyxFQUFFLFNBQVMsaUVBQTRELFdBQVcsUUFBUSxDQUFDO0FBQzdHLFVBQU0sd0JBQXdCO0FBQzlCLFlBQVE7QUFBQSxFQUNWLFNBQVMsR0FBRztBQUNWLFdBQU8sU0FBUyxFQUFFLE9BQU8sR0FBRyxpQkFBaUIsR0FBRyxTQUFTLEVBQUUsV0FBVyxHQUFHLFdBQVcsTUFBTSxDQUFDO0FBQUEsRUFDN0YsVUFBRTtBQUNBLHVCQUFtQjtBQUNuQixRQUFJLE9BQVEsUUFBTyxXQUFXO0FBQzlCLGdCQUFZLElBQUksS0FBSztBQUFBLEVBQ3ZCO0FBQ0Y7QUFFQSxlQUFlLHdCQUF3QjtBQUNyQyxTQUFPO0FBQUEsSUFDTCw4REFBOEQsYUFBYTtBQUFBLElBQzNFLFlBQVk7QUFDVixrQkFBWSxxQ0FBZ0MsSUFBSTtBQUNoRCxVQUFJO0FBQ0YsY0FBTSxNQUFNLE1BQU0sT0FBTyxLQUFLO0FBQUEsVUFDNUIsUUFBUSxJQUFJO0FBQUEsVUFDWixNQUFNLEVBQUUsU0FBUyxjQUFjO0FBQUEsUUFDakMsQ0FBQztBQUNELGVBQU8sU0FBUztBQUFBLFVBQ2QsT0FBTyxHQUFHLHdDQUFpQztBQUFBLFVBQzNDLFNBQVMsSUFBSSxRQUFRO0FBQUEsVUFDckIsV0FBVztBQUFBLFFBQ2IsQ0FBQztBQUNELG1CQUFXLGNBQWM7QUFDekIsY0FBTSx3QkFBd0I7QUFBQSxNQUNoQyxTQUFTLEdBQUc7QUFDVixlQUFPLFNBQVMsRUFBRSxPQUFPLEdBQUcsaUJBQWlCLEdBQUcsU0FBUyxFQUFFLFdBQVcsR0FBRyxXQUFXLE1BQU0sQ0FBQztBQUFBLE1BQzdGLFVBQUU7QUFDQSxvQkFBWSxJQUFJLEtBQUs7QUFBQSxNQUN2QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxTQUFTLHVCQUF1QjtBQUM5QixRQUFNLFVBQVUsU0FBUyxlQUFlLHFCQUFxQjtBQUM3RCxRQUFNLFdBQVcsU0FBUyxlQUFlLHVCQUF1QjtBQUNoRSxNQUFJLFFBQVMsU0FBUSxVQUFVLE1BQU0sV0FBVyxZQUFZO0FBQzVELE1BQUksU0FBVSxVQUFTLFVBQVUsTUFBTSxXQUFXLGNBQWM7QUFFaEUsV0FBUyxpQkFBaUIsYUFBYSxFQUFFLFFBQVEsU0FBTztBQUN0RCxRQUFJLFVBQVUsTUFBTSxlQUFlLElBQUksUUFBUSxFQUFFO0FBQUEsRUFDbkQsQ0FBQztBQUVELFFBQU0sWUFBWSxTQUFTLGVBQWUsMkJBQTJCO0FBQ3JFLE1BQUksVUFBVyxXQUFVLFVBQVU7QUFFbkMsUUFBTSxlQUFlLFNBQVMsZUFBZSxnQkFBZ0I7QUFDN0QsTUFBSSxjQUFjO0FBQ2hCLGlCQUFhLFVBQVUsTUFBTTtBQUMzQixVQUFJLGtCQUFrQixlQUFlLGNBQWM7QUFDakQsZUFBTyxLQUFLLGlCQUFpQixtQkFBbUIsZUFBZSxZQUFZLENBQUMsSUFBSSxRQUFRO0FBQUEsTUFDMUYsT0FBTztBQUNMLGVBQU8sU0FBUyxHQUFHLGdEQUFnRCxDQUFDO0FBQUEsTUFDdEU7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFFBQU0sYUFBYTtBQUFBLElBQ2pCLEVBQUUsS0FBSyxZQUFZLFNBQVMsdUJBQXVCLFFBQVEsb0JBQW9CO0FBQUEsSUFDL0UsRUFBRSxLQUFLLE9BQU8sU0FBUyxrQkFBa0IsUUFBUSxlQUFlO0FBQUEsSUFDaEUsRUFBRSxLQUFLLE9BQU8sU0FBUyxrQkFBa0IsUUFBUSxlQUFlO0FBQUEsSUFDaEUsRUFBRSxLQUFLLE9BQU8sU0FBUyxrQkFBa0IsUUFBUSxlQUFlO0FBQUEsRUFDbEU7QUFFQSxhQUFXLFFBQVEsT0FBSztBQUN0QixVQUFNLFFBQVEsU0FBUyxlQUFlLEVBQUUsT0FBTztBQUMvQyxVQUFNLFdBQVcsU0FBUyxlQUFlLEVBQUUsTUFBTTtBQUVqRCxRQUFJLE9BQU87QUFDVCxZQUFNLFdBQVcsTUFBTTtBQUNyQixjQUFNLE9BQU8sTUFBTSxNQUFNLENBQUM7QUFDMUIsWUFBSSxDQUFDLEtBQU07QUFDWCxjQUFNLGFBQWEsU0FBUyxlQUFlLG9CQUFvQjtBQUMvRCxjQUFNLGFBQWMsRUFBRSxRQUFRLFNBQVMsY0FBYyxXQUFXLFVBQVUsU0FBVSxXQUFXLFFBQVE7QUFDdkcseUJBQWlCLE1BQU0sRUFBRSxLQUFLLFVBQVU7QUFDeEMsY0FBTSxRQUFRO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBRUEsUUFBSSxVQUFVO0FBQ1osZUFBUyxhQUFhLENBQUMsTUFBTTtBQUMzQixVQUFFLGVBQWU7QUFDakIsaUJBQVMsVUFBVSxJQUFJLFVBQVU7QUFBQSxNQUNuQztBQUNBLGVBQVMsY0FBYyxNQUFNLFNBQVMsVUFBVSxPQUFPLFVBQVU7QUFDakUsZUFBUyxTQUFTLENBQUMsTUFBTTtBQUN2QixVQUFFLGVBQWU7QUFDakIsaUJBQVMsVUFBVSxPQUFPLFVBQVU7QUFDcEMsWUFBSSxFQUFFLGFBQWEsU0FBUyxFQUFFLGFBQWEsTUFBTSxTQUFTLEdBQUc7QUFDM0QsZ0JBQU0sT0FBTyxFQUFFLGFBQWEsTUFBTSxDQUFDO0FBQ25DLGdCQUFNLGFBQWEsU0FBUyxlQUFlLG9CQUFvQjtBQUMvRCxnQkFBTSxhQUFjLEVBQUUsUUFBUSxTQUFTLGNBQWMsV0FBVyxVQUFVLFNBQVUsV0FBVyxRQUFRO0FBQ3ZHLDJCQUFpQixNQUFNLEVBQUUsS0FBSyxVQUFVO0FBQUEsUUFDMUM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUVELFFBQU0sZUFBZSxTQUFTLGVBQWUsc0JBQXNCO0FBQ25FLE1BQUksYUFBYyxjQUFhLFVBQVU7QUFFekMsUUFBTSxlQUFlLFNBQVMsZUFBZSxtQkFBbUI7QUFDaEUsTUFBSSxhQUFjLGNBQWEsVUFBVTtBQUV6QyxRQUFNLFlBQVksU0FBUyxlQUFlLG9CQUFvQjtBQUM5RCxNQUFJLFVBQVcsV0FBVSxVQUFVO0FBRW5DLFFBQU0sYUFBYSxTQUFTLGVBQWUsa0JBQWtCO0FBQzdELE1BQUksV0FBWSxZQUFXLFVBQVUsTUFBTSxlQUFlLEtBQUs7QUFFL0QsUUFBTSxhQUFhLFNBQVMsZUFBZSx3QkFBd0I7QUFDbkUsTUFBSSxXQUFZLFlBQVcsVUFBVTtBQUVyQyxRQUFNLGNBQWMsU0FBUyxlQUFlLHFCQUFxQjtBQUNqRSxRQUFNLGVBQWUsU0FBUyxlQUFlLHdCQUF3QjtBQUNyRSxRQUFNLGVBQWUsU0FBUyxlQUFlLHdCQUF3QjtBQUVyRSxNQUFJLFlBQWEsYUFBWSxVQUFVLE1BQU07QUFBRSxhQUFTLGVBQWUsbUJBQW1CLEVBQUUsTUFBTSxVQUFVO0FBQUEsRUFBUTtBQUNwSCxNQUFJLGFBQWMsY0FBYSxVQUFVLE1BQU07QUFBRSxhQUFTLGVBQWUsbUJBQW1CLEVBQUUsTUFBTSxVQUFVO0FBQUEsRUFBUTtBQUN0SCxNQUFJLGFBQWMsY0FBYSxVQUFVO0FBQzNDO0FBR0EsSUFBTSxhQUFhLElBQUksTUFBTSxNQUFNLElBQUksTUFBTSxRQUFRLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBSTtBQUNwRSxJQUFNLGFBQWEsSUFBSSxNQUFNLE1BQU0sSUFBSSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFJO0FBQ3BFLElBQU0sYUFBYSxJQUFJLE1BQU0sTUFBTSxJQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUk7QUFDcEUsSUFBSSxpQkFBaUI7QUFFckIsU0FBUyxzQkFBc0I7QUFDN0IsUUFBTSxhQUFhLFNBQVMsZUFBZSxjQUFjO0FBQ3pELFFBQU0sUUFBUSxTQUFTLGVBQWUsdUJBQXVCO0FBQzdELE1BQUksQ0FBQyxjQUFjLENBQUMsTUFBTztBQUUzQixhQUFXLFVBQVUsTUFBTTtBQUN6QixxQkFBaUIsQ0FBQztBQUNsQixVQUFNLE1BQU0sVUFBVSxpQkFBaUIsU0FBUztBQUNoRCxlQUFXLFVBQVUsT0FBTyxVQUFVLGNBQWM7QUFDcEQsYUFBUyx1QkFBdUI7QUFDaEMseUJBQXFCO0FBQ3JCLGNBQVUsaUJBQWlCLGlCQUFpQixZQUFZLFVBQVUsRUFBRTtBQUFBLEVBQ3RFO0FBRUEsUUFBTSxPQUFPLFNBQVMsZUFBZSxlQUFlO0FBQ3BELFFBQU0sT0FBTyxTQUFTLGVBQWUsWUFBWTtBQUNqRCxRQUFNLE9BQU8sU0FBUyxlQUFlLGVBQWU7QUFDcEQsUUFBTSxPQUFPLFNBQVMsZUFBZSxZQUFZO0FBQ2pELFFBQU0sT0FBTyxTQUFTLGVBQWUsZUFBZTtBQUNwRCxRQUFNLE9BQU8sU0FBUyxlQUFlLFlBQVk7QUFDakQsUUFBTSxXQUFXLFNBQVMsZUFBZSxnQkFBZ0I7QUFFekQsV0FBUyx1QkFBdUI7QUFDOUIsVUFBTSxTQUFTLENBQUM7QUFDaEIsUUFBSSxRQUFRLEtBQUssU0FBUztBQUN4QixpQkFBVyxXQUFXLFdBQVcsS0FBSyxLQUFLO0FBQzNDLGFBQU8sS0FBSyxVQUFVO0FBQUEsSUFDeEI7QUFDQSxRQUFJLFFBQVEsS0FBSyxTQUFTO0FBQ3hCLGlCQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUs7QUFDM0MsYUFBTyxLQUFLLFVBQVU7QUFBQSxJQUN4QjtBQUNBLFFBQUksUUFBUSxLQUFLLFNBQVM7QUFDeEIsaUJBQVcsV0FBVyxXQUFXLEtBQUssS0FBSztBQUMzQyxhQUFPLEtBQUssVUFBVTtBQUFBLElBQ3hCO0FBQ0EsYUFBUyxpQkFBaUI7QUFBQSxFQUM1QjtBQUVBLEdBQUMsTUFBTSxNQUFNLE1BQU0sTUFBTSxNQUFNLElBQUksRUFBRSxRQUFRLFFBQU07QUFDakQsUUFBSSxHQUFJLElBQUcsVUFBVTtBQUFBLEVBQ3ZCLENBQUM7QUFFRCxNQUFJLFVBQVU7QUFDWixhQUFTLFVBQVUsTUFBTTtBQUN2QixVQUFJLEtBQU0sTUFBSyxVQUFVO0FBQ3pCLFVBQUksS0FBTSxNQUFLLFVBQVU7QUFDekIsVUFBSSxLQUFNLE1BQUssVUFBVTtBQUN6QixVQUFJLEtBQU0sTUFBSyxRQUFRO0FBQ3ZCLFVBQUksS0FBTSxNQUFLLFFBQVE7QUFDdkIsVUFBSSxLQUFNLE1BQUssUUFBUTtBQUN2QiwyQkFBcUI7QUFBQSxJQUN2QjtBQUFBLEVBQ0Y7QUFDRjtBQUdBLFNBQVMsNEJBQTRCO0FBQ25DLFFBQU0sWUFBWSxTQUFTLGVBQWUsbUJBQW1CO0FBQzdELFFBQU0sUUFBUSxTQUFTLGVBQWUsb0JBQW9CO0FBQzFELFFBQU0sV0FBVyxTQUFTLGVBQWUsdUJBQXVCO0FBQ2hFLFFBQU0sWUFBWSxTQUFTLGVBQWUseUJBQXlCO0FBQ25FLFFBQU0sYUFBYSxTQUFTLGVBQWUsMEJBQTBCO0FBQ3JFLFFBQU0sYUFBYSxTQUFTLGVBQWUsd0JBQXdCO0FBQ25FLE1BQUksa0JBQWtCO0FBRXRCLE1BQUksYUFBYSxPQUFPO0FBQ3RCLGNBQVUsVUFBVSxNQUFNO0FBQ3hCLHdCQUFrQixTQUFTLFdBQVcsVUFBVSxXQUFXO0FBQzNELFVBQUksV0FBWSxZQUFXLE1BQU07QUFDakMsWUFBTSxNQUFNLFVBQVU7QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLGFBQWEsTUFBTTtBQUFFLFFBQUksTUFBTyxPQUFNLE1BQU0sVUFBVTtBQUFBLEVBQVE7QUFDcEUsTUFBSSxTQUFVLFVBQVMsVUFBVTtBQUNqQyxNQUFJLFVBQVcsV0FBVSxVQUFVO0FBRW5DLE1BQUksWUFBWTtBQUNkLGVBQVcsVUFBVSxZQUFZO0FBQy9CLFlBQU0sU0FBUyxTQUFTLGVBQWUsbUJBQW1CLEVBQUUsU0FBUyxJQUFJLEtBQUs7QUFDOUUsWUFBTSxPQUFPLFNBQVMsZUFBZSxrQkFBa0IsRUFBRTtBQUN6RCxZQUFNLFdBQVcsU0FBUyxlQUFlLHNCQUFzQixFQUFFO0FBQ2pFLFlBQU0sT0FBTyxTQUFTLGVBQWUsa0JBQWtCLEVBQUU7QUFFekQsVUFBSSxDQUFDLE9BQU87QUFDVixlQUFPLFNBQVMsR0FBRyxnQ0FBZ0MsQ0FBQztBQUNwRDtBQUFBLE1BQ0Y7QUFFQSxpQkFBVyxXQUFXO0FBQ3RCLGlCQUFXLGNBQWM7QUFDekIsVUFBSTtBQUNGLGNBQU0sVUFBVTtBQUFBLFVBQ2QsVUFBVSxFQUFFLEdBQUcsT0FBTyxTQUFTLEdBQUcsR0FBRyxPQUFPLFNBQVMsR0FBRyxHQUFHLE9BQU8sU0FBUyxFQUFFO0FBQUEsVUFDN0UsUUFBUSxFQUFFLEdBQUcsU0FBUyxPQUFPLEdBQUcsR0FBRyxTQUFTLE9BQU8sR0FBRyxHQUFHLFNBQVMsT0FBTyxFQUFFO0FBQUEsVUFDM0UsS0FBSyxPQUFPO0FBQUEsUUFDZDtBQUVBLGNBQU0sTUFBTSxNQUFNLE9BQU8sS0FBSztBQUFBLFVBQzVCLFFBQVEsSUFBSTtBQUFBLFVBQ1osTUFBTTtBQUFBLFlBQ0o7QUFBQSxZQUNBLFlBQVk7QUFBQSxZQUNaO0FBQUEsWUFDQSxhQUFhO0FBQUEsWUFDYixlQUFlO0FBQUEsWUFDZixhQUFhLEtBQUssVUFBVSxPQUFPO0FBQUEsWUFDbkMsY0FBYyxtQkFBbUIsT0FBTyxpQkFBaUIsU0FBUyxJQUFJO0FBQUEsVUFDeEU7QUFBQSxRQUNGLENBQUM7QUFFRCxlQUFPLFdBQVcsRUFBRSxTQUFTLEdBQUcsaUNBQWlDLEdBQUcsV0FBVyxRQUFRLENBQUM7QUFDeEYsbUJBQVc7QUFDWCxrQkFBVSxrQkFBa0IsS0FBSyxFQUFFO0FBQUEsTUFDckMsU0FBUyxHQUFHO0FBQ1YsZ0JBQVEsTUFBTSwyQkFBMkIsQ0FBQztBQUMxQyxlQUFPLFNBQVMsR0FBRyw0QkFBNEIsRUFBRSxXQUFXLEVBQUUsQ0FBQztBQUFBLE1BQ2pFLFVBQUU7QUFDQSxtQkFBVyxXQUFXO0FBQ3RCLG1CQUFXLGNBQWM7QUFBQSxNQUMzQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFHQSx1QkFBdUI7QUFDdkIsYUFBYTtBQUNiLHFCQUFxQjtBQUNyQixvQkFBb0I7QUFDcEIsMEJBQTBCO0FBQzFCLGVBQWUsRUFBRSxLQUFLLE1BQU07QUFDMUIsb0JBQWtCO0FBQ3BCLENBQUM7QUFFRCxPQUFPLGVBQWU7QUFBQSxFQUNwQjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
