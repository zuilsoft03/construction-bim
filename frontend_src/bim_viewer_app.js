// BIM Viewer App — Multi-Discipline Federated Viewing, BVH Clash Engine, & BOM Wizard
// Powered by window.IFCEngine (Three.js r149 + three-mesh-bvh + web-ifc) and Frappe REST APIs

const ENGINE = window.IFCEngine;
const WebIFC = window.WebIFC;
if (!ENGINE || !WebIFC) {
  throw new Error('IFCEngine not loaded (webifc-api-iife.js + webifc.bundle.js must load first)');
}

const THREE = ENGINE.THREE;
const OrbitControls = ENGINE.OrbitControls;
const buildIfcScene = ENGINE.buildIfcScene;
const detectClashes = ENGINE.detectClashes;
const generateBcfViewpoint = ENGINE.generateBcfViewpoint;
const createCentroidMarker = ENGINE.createCentroidMarker;
const createIntersectionBoxHelper = ENGINE.createIntersectionBoxHelper;

// Frappe API routes
const API = {
  list_models: 'construction_bim.bim.api.list_models',
  get_model: 'construction_bim.bim.api.get_model',
  list_elements: 'construction_bim.bim.api.list_elements',
  get_element: 'construction_bim.bim.api.get_element',
  create_model: 'construction_bim.bim.api.create_model_from_ifc',
  create_boq_link: 'construction_bim.bim.api.create_boq_link',
  delete_boq_link: 'construction_bim.bim.api.delete_boq_link',
  list_boq_links: 'construction_bim.bim.api.list_boq_links',
  save_viewpoint: 'construction_bim.bim.api.save_viewpoint',
  list_viewpoints: 'construction_bim.bim.api.list_viewpoints',
  delete_viewpoint: 'construction_bim.bim.api.delete_viewpoint',
  create_clash: 'construction_bim.bim.api.create_clash',
  list_clashes: 'construction_bim.bim.api.list_clashes',
  add_clash_comment: 'construction_bim.bim.api.add_clash_comment',
  list_clash_comments: 'construction_bim.bim.api.list_clash_comments',
  generate_bom_from_bim: 'construction_bim.bim.api.generate_bom_from_bim',
  get_initiation_status: 'construction_bim.api.initiation.get_initiation_status',
  upload_intake_file: 'construction_bim.api.initiation.upload_intake_file',
  parse_boq_file: 'construction_bim.api.initiation.parse_boq_file',
  commit_boq_estimate: 'construction_bim.api.initiation.commit_boq_estimate',
  download_boq_template: 'construction_bim.api.initiation.download_boq_template',
  align_model_coordinates: 'construction_bim.api.initiation.align_model_coordinates',
  approve_project_initiation: 'construction_bim.api.initiation.approve_project_initiation',
  create_in_viewer_issue: 'construction_bim.bim.api.create_in_viewer_issue',
};

// DOM references
const els = {
  models: document.getElementById('bim-models'),
  btnLoadSelected: document.getElementById('btn-load-selected'),
  btnClearModels: document.getElementById('btn-clear-models'),
  upload: document.getElementById('bim-upload'),
  fileInput: document.getElementById('bim-file-input'),
  canvas: document.getElementById('bim-canvas'),
  status: document.getElementById('bim-status'),
  loading: document.getElementById('bim-loading'),
  props: document.getElementById('bim-props'),
  propsTitle: document.getElementById('bim-element-title'),
  links: document.getElementById('bim-links'),
  viewpoints: document.getElementById('bim-viewpoints'),
  vpName: document.getElementById('vp-name'),
  fDiscipline: document.getElementById('f-discipline'),
  fStorey: document.getElementById('f-storey'),
  fType: document.getElementById('f-type'),
  fSearch: document.getElementById('f-search'),
  clashCardsList: document.getElementById('clash-cards-list'),
  clashBadgeCount: document.getElementById('clash-badge-count'),
  clashDetailContainer: document.getElementById('clash-detail-container'),
  clashListContainer: document.getElementById('clash-list-container'),
  clashCommentsStream: document.getElementById('clash-comments-stream'),
  clashCommentInput: document.getElementById('clash-comment-input'),
  bomModal: document.getElementById('bim-bom-modal'),
  bomRollupTbody: document.getElementById('bom-rollup-tbody'),
  bomSummaryText: document.getElementById('bom-summary-text'),
};

// ---------------- Three.js Scene Setup ----------------
const renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a); // Slate-900 dark theme

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5000);
camera.position.set(25, 20, 30);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
keyLight.position.set(40, 60, 30);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.6);
fillLight.position.set(-30, 20, -30);
scene.add(fillLight);

const grid = new THREE.GridHelper(120, 24, 0x475569, 0x1e293b);
grid.position.y = -0.02;
scene.add(grid);

// Federated Root Group
const federatedGroup = new THREE.Group();
federatedGroup.name = 'FederatedRootGroup';
scene.add(federatedGroup);

// Active Clash Visual Helpers Group
const clashHelpersGroup = new THREE.Group();
clashHelpersGroup.name = 'ClashHelpersGroup';
scene.add(clashHelpersGroup);

// State
let loadedModels = new Map();
let elementMeshes = [];
let elementIndex = new Map();
let availableModels = [];
let currentSelection = null;
let activeTool = 'orbit';
let clipBox = null;
let wireframeMode = false;
let ifcApi = null;
let detectedClashes = [];
let activeClash = null;

// Highlight Materials
const highlightMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0369a1, emissiveIntensity: 0.5 });
const clashMatA = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: 0.6, roughness: 0.3 });
const clashMatB = new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0x713f12, emissiveIntensity: 0.6, roughness: 0.3 });

function resize() {
  const w = els.canvas ? (els.canvas.clientWidth || 800) : 800;
  const h = els.canvas ? (els.canvas.clientHeight || 600) : 600;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
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

function setStatus(msg) { if (els.status) els.status.textContent = msg; }
function showLoading(msg, on) {
  if (els.loading) {
    els.loading.style.display = on ? 'flex' : 'none';
    if (on) els.loading.textContent = msg;
  }
}

// ---------------- Web-IFC API ----------------
async function getIfcApi() {
  if (ifcApi) return ifcApi;
  const api = new WebIFC.IfcAPI();
  api.SetWasmPath('/assets/construction_bim/js/webifc/', true);
  await api.Init();
  ifcApi = api;
  return api;
}

// ---------------- Model Management & Federated Loading ----------------
async function loadModelsList() {
  setStatus('Loading models…');
  try {
    const res = await frappe.call({ method: API.list_models });
    availableModels = res.message || [];
    renderModelsList();
    if (availableModels.length) {
      setStatus(`${availableModels.length} models available`);
    } else {
      setStatus('No models found. Upload an IFC file to begin.');
    }
  } catch (e) {
    setStatus('Failed to load models list: ' + (e.message || e));
  }
}

function renderModelsList() {
  if (!els.models) return;
  els.models.innerHTML = '';
  if (!availableModels.length) {
    els.models.innerHTML = '<div class="empty-hint">No models yet</div>';
    return;
  }

  availableModels.forEach(m => {
    const isLoaded = loadedModels.has(m.name);
    const d = document.createElement('div');
    d.className = 'bim-model-item' + (isLoaded ? ' active' : '');
    
    // Auto-detect discipline tag
    let disc = m.discipline || 'Architecture';
    const nameLower = (m.model_name || m.name).toLowerCase();
    if (nameLower.includes('struc') || nameLower.includes('str')) disc = 'Structural';
    else if (nameLower.includes('hvac') || nameLower.includes('mep') || nameLower.includes('vvs')) disc = 'MEP';

    d.innerHTML = `
      <div class="model-title" title="${m.model_name}">
        <input type="checkbox" class="model-check" ${isLoaded ? 'checked' : ''} style="margin-right:4px" />
        <span>${m.model_name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        <span class="bim-badge model-badge">${disc}</span>
        <span class="cnt">${m.element_count || 0} el</span>
      </div>
    `;

    const checkbox = d.querySelector('.model-check');
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

const inFlightLoads = new Map();

async function loadModelGeometry(modelDocName) {
  if (loadedModels.has(modelDocName)) {
    return loadedModels.get(modelDocName);
  }
  if (inFlightLoads.has(modelDocName)) {
    return inFlightLoads.get(modelDocName);
  }

  const promise = (async () => {
    showLoading(`Loading model ${modelDocName}…`, true);
    try {
      const res = await frappe.call({ method: API.get_model, args: { model: modelDocName } });
      const modelData = res.message;
      const ifcUrl = modelData.original_file;
      if (!ifcUrl) {
        setStatus(`Model ${modelData.model_name} has no attached IFC file`);
        return;
      }

      const absUrl = ifcUrl.startsWith('/') ? ifcUrl : '/' + ifcUrl;
      showLoading(`Downloading IFC (${modelData.model_name})…`, true);
      const resp = await fetch(absUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching IFC`);

      const buf = new Uint8Array(await resp.arrayBuffer());
      showLoading(`Parsing IFC (${(buf.length / 1e6).toFixed(1)} MB)…`, true);

      const api = await getIfcApi();
      // COORDINATE_TO_ORIGIN: false ensures all disciplines share world coordinates with 0 drift!
      const ifcModelID = api.OpenModel(buf, { COORDINATE_TO_ORIGIN: false, USE_FAST_BVH: true });

      let disc = modelData.discipline || 'Architecture';
      const nameLower = (modelData.model_name || modelDocName).toLowerCase();
      if (nameLower.includes('struc') || nameLower.includes('str')) disc = 'Structural';
      else if (nameLower.includes('hvac') || nameLower.includes('mep') || nameLower.includes('vvs')) disc = 'MEP';

      showLoading(`Building 3D scene (${disc})…`, true);
      const sceneResult = buildIfcScene(api, ifcModelID, {
        modelName: modelData.model_name || modelDocName,
        discipline: disc,
      });

      federatedGroup.add(sceneResult.group);

      // Load server elements for property linking
      try {
        const elemRes = await frappe.call({
          method: API.list_elements,
          args: { model: modelDocName, filters: '{}', limit: 25000 },
        });
        const elements = (elemRes.message && elemRes.message.elements) || [];
        elements.forEach(el => {
          const cleanRef = (el.mesh_ref || '').replace('e', '');
          if (cleanRef) elementIndex.set(`${modelDocName}:${cleanRef}`, el);
          if (el.stable_id) elementIndex.set(el.stable_id, el);
        });
      } catch (e) {}

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
        opacity: 1.0,
        visible: true,
      };
      loadedModels.set(modelDocName, entry);

      setStatus(`Loaded ${modelData.model_name} [${disc}]: ${sceneResult.meshCount.total} meshes, ${sceneResult.meshCount.tris} tris`);
      return entry;
    } catch (e) {
      console.error('Failed to load model geometry', e);
      setStatus(`Error loading ${modelDocName}: ${e.message || e}`);
    } finally {
      showLoading('', false);
      inFlightLoads.delete(modelDocName);
    }
  })();

  inFlightLoads.set(modelDocName, promise);
  return promise;
}

function unloadModel(modelDocName) {
  const modelEntry = loadedModels.get(modelDocName);
  if (!modelEntry) return;

  if (ifcApi && modelEntry.ifcModelID !== undefined) {
    try { ifcApi.CloseModel(modelEntry.ifcModelID); } catch (e) { console.warn('Could not close IFC model:', e); }
  }

  // Remove all elementIndex entries belonging to this model
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
    if (ifcApi && entry.ifcModelID !== undefined) {
      try { ifcApi.CloseModel(entry.ifcModelID); } catch (e) {}
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
  setStatus('All models cleared');
}

function updateElementMeshesList() {
  elementMeshes = [];
  loadedModels.forEach((entry, modelDocName) => {
    entry.expressMap.forEach((meshes, expressID) => {
      meshes.forEach(m => {
        m.userData.modelDocName = modelDocName;
        m.userData.discipline = entry.discipline;
        elementMeshes.push({ mesh: m, expressID, modelDocName, discipline: entry.discipline });
      });
    });
  });
  renderSpatialHierarchyTree();
}

function renderSpatialHierarchyTree() {
  const treeEl = document.getElementById('bim-spatial-tree');
  if (!treeEl) return;
  if (!loadedModels.size) {
    treeEl.innerHTML = '<div class="empty-hint">Load models to view spatial hierarchy</div>';
    return;
  }

  treeEl.innerHTML = '';
  loadedModels.forEach((entry, modelDocName) => {
    const modelNode = document.createElement('div');
    modelNode.style.marginBottom = '6px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '6px';
    header.style.fontWeight = '600';
    header.style.color = '#e2e8f0';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = entry.visible !== false;
    chk.onchange = () => {
      entry.visible = chk.checked;
      entry.group.visible = chk.checked;
    };

    header.appendChild(chk);
    header.appendChild(document.createTextNode(`🏢 ${entry.modelName} [${entry.discipline}]`));
    modelNode.appendChild(header);

    const storeyMap = new Map();
    (entry.elements || []).forEach(el => {
      const st = el.storey || 'Ground Level';
      if (!storeyMap.has(st)) storeyMap.set(st, []);
      storeyMap.get(st).push(el);
    });

    if (!storeyMap.size) storeyMap.set('Level 1', []);

    const childContainer = document.createElement('div');
    childContainer.style.paddingLeft = '18px';
    childContainer.style.marginTop = '3px';

    storeyMap.forEach((elems, storeyName) => {
      const stNode = document.createElement('div');
      stNode.style.display = 'flex';
      stNode.style.alignItems = 'center';
      stNode.style.gap = '4px';
      stNode.style.color = '#94a3b8';

      const stChk = document.createElement('input');
      stChk.type = 'checkbox';
      stChk.checked = true;
      stChk.onchange = () => {
        elementMeshes.forEach(({ mesh, expressID, modelDocName: mName }) => {
          if (mName === modelDocName) {
            const el = elementIndex.get(`${mName}:${expressID}`);
            if (el && (el.storey || 'Level 1') === storeyName) {
              mesh.visible = stChk.checked;
            }
          }
        });
      };

      stNode.appendChild(stChk);
      stNode.appendChild(document.createTextNode(`📐 ${storeyName}`));
      childContainer.appendChild(stNode);
    });

    modelNode.appendChild(childContainer);
    treeEl.appendChild(modelNode);
  });
}

function disposeGroup(group) {
  group.traverse(o => {
    if (o.isMesh) {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
        else o.material.dispose();
      }
    }
  });
}

// ---------------- Discipline Layer Controls (Visibility, Ghosting, Opacity) ----------------
function initDisciplineControls() {
  const rows = document.querySelectorAll('.discipline-layer-row');
  rows.forEach(row => {
    const disc = row.dataset.discipline;
    const btnVis = row.querySelector('.btn-vis');
    const btnGhost = row.querySelector('.btn-ghost');
    const btnSolo = row.querySelector('.btn-solo');
    const slider = row.querySelector('.disc-opacity-slider');
    const valText = row.querySelector('.disc-opacity-val');

    if (btnVis) {
      btnVis.onclick = () => {
        const isCurrentlyVis = btnVis.classList.contains('active');
        setDisciplineVisibility(disc, !isCurrentlyVis);
        btnVis.classList.toggle('active', !isCurrentlyVis);
        btnVis.textContent = !isCurrentlyVis ? '👁' : '🚫';
      };
    }

    if (btnGhost) {
      btnGhost.onclick = () => {
        const isGhost = btnGhost.classList.contains('ghost-active');
        setDisciplineGhosting(disc, !isGhost);
        btnGhost.classList.toggle('ghost-active', !isGhost);
        if (!isGhost) {
          if (slider) slider.value = 20;
          if (valText) valText.textContent = '20%';
        } else {
          if (slider) slider.value = 100;
          if (valText) valText.textContent = '100%';
        }
      };
    }

    if (btnSolo) {
      btnSolo.onclick = () => {
        rows.forEach(r => {
          const d = r.dataset.discipline;
          const vBtn = r.querySelector('.btn-vis');
          if (d === disc) {
            setDisciplineVisibility(d, true);
            if (vBtn) { vBtn.classList.add('active'); vBtn.textContent = '👁'; }
          } else {
            setDisciplineVisibility(d, false);
            if (vBtn) { vBtn.classList.remove('active'); vBtn.textContent = '🚫'; }
          }
        });
        setStatus(`Solo: ${disc}`);
      };
    }

    if (slider) {
      slider.oninput = () => {
        const opVal = parseInt(slider.value, 10) / 100.0;
        if (valText) valText.textContent = `${slider.value}%`;
        setDisciplineOpacity(disc, opVal);
      };
    }
  });
}

function setDisciplineVisibility(discipline, visible) {
  loadedModels.forEach(entry => {
    if (disciplineMatches(entry.discipline, discipline)) {
      entry.visible = visible;
      entry.group.visible = visible;
    }
  });
}

function setDisciplineGhosting(discipline, ghosted) {
  loadedModels.forEach(entry => {
    if (disciplineMatches(entry.discipline, discipline)) {
      entry.isGhosted = ghosted;
      entry.group.traverse(o => {
        if (o.isMesh && o.material) {
          if (!o.userData.origMaterialProps) {
            o.userData.origMaterialProps = {
              color: o.material.color.clone(),
              opacity: o.material.opacity,
              transparent: o.material.transparent,
              depthWrite: o.material.depthWrite,
            };
          }
          if (ghosted) {
            o.material.transparent = true;
            o.material.opacity = 0.20;
            o.material.depthWrite = false;
            o.material.color.setHex(0x94a3b8);
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
  loadedModels.forEach(entry => {
    if (disciplineMatches(entry.discipline, discipline)) {
      entry.opacity = opacity;
      entry.group.traverse(o => {
        if (o.isMesh && o.material) {
          if (!o.userData.origMaterialProps) {
            o.userData.origMaterialProps = {
              color: o.material.color.clone(),
              opacity: o.material.opacity,
              transparent: o.material.transparent,
              depthWrite: o.material.depthWrite,
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
  if (t === 'mep' && (m.includes('hvac') || m.includes('plumb') || m.includes('elec') || m.includes('mech'))) return true;
  if (t === 'structural' && (m.includes('struc') || m.includes('str'))) return true;
  if (t === 'architecture' && (m.includes('ark') || m.includes('arch'))) return true;
  return false;
}

// ---------------- Element Selection & Property Inspector ----------------
function clearSelection() {
  currentSelection = null;
  if (els.props) els.props.innerHTML = '<div class="empty-hint">No selection</div>';
  if (els.propsTitle) {
    els.propsTitle.textContent = 'Click an element in the viewer';
    els.propsTitle.className = 'empty-hint';
  }
  if (els.links) els.links.innerHTML = '<div class="empty-hint">No links</div>';

  elementMeshes.forEach(({ mesh }) => {
    if (mesh.userData.origColor) {
      mesh.material.color.copy(mesh.userData.origColor);
    }
    if (mesh.material.emissive) mesh.material.emissive.setHex(0x000000);
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
  const discipline = (modelEntry && modelEntry.discipline) || mesh.userData.discipline || 'Discipline';
  const modelName = (modelEntry && modelEntry.modelName) || modelDocName;

  renderElementInspector(el, expressID, modelName, discipline, mesh);

  if (el && (!el.properties || !Object.keys(el.properties).length)) {
    try {
      const fullDoc = await frappe.call({ method: API.get_element, args: { element: el.name } });
      if (fullDoc.message && currentSelection && currentSelection.expressID === expressID) {
        Object.assign(el, fullDoc.message);
        renderElementInspector(el, expressID, modelName, discipline, mesh);
      }
    } catch (e) {}
  } else if (!el && modelEntry && ifcApi) {
    try {
      const lineData = await ifcApi.GetLine(modelEntry.ifcModelID, expressID);
      renderWebIfcInspector(expressID, lineData, modelName, discipline);
    } catch (e) {}
  }
}

function renderElementInspector(el, expressID, modelName, discipline, mesh) {
  if (!els.propsTitle || !els.props) return;

  const title = (el && (el.title || el.element_type)) || `IFC #${expressID}`;
  const guid = (el && el.stable_id) || '';
  els.propsTitle.textContent = `${title} ${guid ? `(${guid})` : ''}`;
  els.propsTitle.className = '';
  els.props.innerHTML = '';

  // Badges Header
  const badgesDiv = document.createElement('div');
  badgesDiv.style.marginBottom = '8px';
  badgesDiv.innerHTML = `
    <span class="bim-badge model-badge">${modelName}</span>
    <span class="bim-badge">${discipline}</span>
    ${el && el.storey ? `<span class="bim-badge">${el.storey}</span>` : ''}
    <span class="bim-badge">#${expressID}</span>
  `;
  els.props.appendChild(badgesDiv);

  // Bounding Box Info
  if (mesh && mesh.geometry) {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const bboxHeader = document.createElement('div');
    bboxHeader.style.cssText = 'font-weight:600;font-size:12px;margin:8px 0 4px;color:#1e293b';
    bboxHeader.textContent = 'Spatial Dimensions';
    els.props.appendChild(bboxHeader);

    const bboxTable = document.createElement('table');
    bboxTable.className = 'property-table';
    bboxTable.innerHTML = `
      <tr><td>Size (X × Y × Z)</td><td>${size.x.toFixed(2)}m × ${size.y.toFixed(2)}m × ${size.z.toFixed(2)}m</td></tr>
      <tr><td>Center Point</td><td>(${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})</td></tr>
    `;
    els.props.appendChild(bboxTable);
  }

  // Quantities Table
  const q = (el && el.quantities) || {};
  const qKeys = Object.keys(q);
  if (qKeys.length) {
    const qHeader = document.createElement('div');
    qHeader.style.cssText = 'font-weight:600;font-size:12px;margin:10px 0 4px;color:#1e293b';
    qHeader.textContent = 'Quantities (Qto_*)';
    els.props.appendChild(qHeader);

    const qTable = document.createElement('table');
    qTable.className = 'property-table';
    qKeys.forEach(k => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${k}</td><td>${q[k]}</td>`;
      qTable.appendChild(tr);
    });
    els.props.appendChild(qTable);
  }

  // Property Sets Table
  const p = (el && el.properties) || {};
  const pKeys = Object.keys(p).filter(k => !['ifc_id', 'ifc_type'].includes(k));
  if (pKeys.length) {
    const pHeader = document.createElement('div');
    pHeader.style.cssText = 'font-weight:600;font-size:12px;margin:10px 0 4px;color:#1e293b';
    pHeader.textContent = 'Property Sets (Pset_*)';
    els.props.appendChild(pHeader);

    const pTable = document.createElement('table');
    pTable.className = 'property-table';
    pKeys.slice(0, 50).forEach(k => {
      const v = typeof p[k] === 'object' ? JSON.stringify(p[k]) : String(p[k]);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${k}</td><td>${v.slice(0, 70)}</td>`;
      pTable.appendChild(tr);
    });
    els.props.appendChild(pTable);
  }

  if (el && el.name) loadBoqLinks(el.name);
}

function renderWebIfcInspector(expressID, props, modelName, discipline) {
  if (!els.propsTitle || !els.props) return;
  els.propsTitle.textContent = `IFC #${expressID} ${props.type || ''}`;
  els.propsTitle.className = '';
  els.props.innerHTML = `
    <div style="margin-bottom:8px">
      <span class="bim-badge model-badge">${modelName}</span>
      <span class="bim-badge">${discipline}</span>
    </div>
  `;

  const table = document.createElement('table');
  table.className = 'property-table';
  Object.keys(props).slice(0, 30).forEach(k => {
    const v = props[k];
    const val = v && typeof v === 'object' && v.value !== undefined ? v.value : (typeof v === 'object' ? JSON.stringify(v).slice(0, 60) : v);
    const tr = document.createElement('tr');
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
    els.links.innerHTML = links.map(l => `
      <div class="link-row" style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #f1f5f9;font-size:12px">
        <span>${l.boq_reference_name} <span class="bim-badge">${l.boq_reference_type}</span></span>
        <button class="del" data-name="${l.name}" style="color:#ef4444;border:none;background:none;cursor:pointer">✕</button>
      </div>
    `).join('');

    els.links.querySelectorAll('.del').forEach(b => {
      b.onclick = async () => {
        await frappe.call({ method: API.delete_boq_link, args: { link: b.dataset.name } });
        loadBoqLinks(bimElement);
      };
    });
  } catch (e) {
    els.links.innerHTML = '<div class="empty-hint">Error loading links</div>';
  }
}

// ---------------- In-Viewer BVH Clash Detection Engine ----------------
async function executeClashDetection() {
  const discA = (document.getElementById('clash-disc-a') || {}).value || 'Structural';
  const discB = (document.getElementById('clash-disc-b') || {}).value || 'MEP';
  const tolInput = document.getElementById('clash-tolerance');
  const tolerance = tolInput ? parseFloat(tolInput.value) || 0.0 : 0.0;

  setStatus(`Running BVH clash check between ${discA} and ${discB}…`);
  showLoading('Computing mesh BVH intersections…', true);

  const meshesA = [];
  const meshesB = [];

  loadedModels.forEach(entry => {
    if (disciplineMatches(entry.discipline, discA)) {
      entry.group.traverse(o => { if (o.isMesh) meshesA.push(o); });
    }
    if (disciplineMatches(entry.discipline, discB)) {
      entry.group.traverse(o => { if (o.isMesh) meshesB.push(o); });
    }
  });

  if (!meshesA.length || !meshesB.length) {
    showLoading('', false);
    setStatus(`Cannot run clash check: Make sure models for both ${discA} and ${discB} are loaded.`);
    if (els.clashCardsList) {
      els.clashCardsList.innerHTML = `<div class="empty-hint">Load models for both ${discA} and ${discB} first</div>`;
    }
    return;
  }

  // Execute two-tier BVH collision detection
  const startTime = performance.now();
  const result = detectClashes(meshesA, meshesB, { tolerance });
  const duration = (performance.now() - startTime).toFixed(0);

  detectedClashes = result.clashes || [];
  setStatus(`Clash check complete: ${detectedClashes.length} clashes detected in ${duration}ms (${result.stats.narrowphaseChecks} BVH checks)`);
  showLoading('', false);

  renderClashesList();

  // Switch to Clashes tab
  const tabBtn = document.getElementById('tab-btn-clashes');
  if (tabBtn) tabBtn.click();
}

function renderClashesList() {
  if (!els.clashCardsList) return;
  els.clashCardsList.innerHTML = '';

  if (els.clashBadgeCount) {
    els.clashBadgeCount.textContent = detectedClashes.length;
    els.clashBadgeCount.style.display = detectedClashes.length ? 'inline-block' : 'none';
  }

  if (!detectedClashes.length) {
    els.clashCardsList.innerHTML = '<div class="empty-hint">No clashes detected between selected disciplines!</div>';
    return;
  }

  const sevFilter = (document.getElementById('clash-filter-severity') || {}).value || '';
  const filtered = sevFilter ? detectedClashes.filter(c => c.severity === sevFilter) : detectedClashes;

  filtered.forEach((clash) => {
    const card = document.createElement('div');
    card.className = 'clash-card' + (activeClash && activeClash.id === clash.id ? ' active' : '');
    const pt = clash.collisionPoint;
    const sevClass = clash.severity ? `severity-${clash.severity.toLowerCase()}` : 'severity-minor';

    card.innerHTML = `
      <div class="clash-card-title">${clash.elementA.discipline} #${clash.elementA.expressID} × ${clash.elementB.discipline} #${clash.elementB.expressID}</div>
      <div class="clash-card-meta">
        <span class="bim-badge ${sevClass}">${clash.severity}</span>
        <span class="bim-badge status-open">${clash.status}</span>
        <span class="bim-badge model-badge">${clash.elementA.ifcType || 'Element'} / ${clash.elementB.ifcType || 'Element'}</span>
      </div>
      <div class="clash-card-coords">XYZ: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)}) | Depth: ${clash.penetrationDepth ? clash.penetrationDepth.toFixed(1) : '0'}mm</div>
      <div class="clash-card-actions">
        <button class="btn btn-default btn-xs btn-fly">🎯 Fly-To</button>
      </div>
    `;

    card.onclick = () => selectClash(clash);
    const flyBtn = card.querySelector('.btn-fly');
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

  // Ghost background meshes
  elementMeshes.forEach(({ mesh }) => {
    if (!mesh.userData.origMaterialProps) {
      mesh.userData.origMaterialProps = {
        transparent: mesh.material.transparent,
        opacity: mesh.material.opacity,
        depthWrite: mesh.material.depthWrite,
      };
    }
    if (mesh.userData.origColor) mesh.material.color.copy(mesh.userData.origColor);
    if (mesh.material.emissive) mesh.material.emissive.setHex(0x000000);
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
    meshA.material.opacity = 1.0;
  }

  if (meshB) {
    if (!meshB.userData.origColor) meshB.userData.origColor = meshB.material.color.clone();
    meshB.material.color.copy(clashMatB.color);
    if (meshB.material.emissive) meshB.material.emissive.copy(clashMatB.emissive);
    meshB.material.transparent = false;
    meshB.material.opacity = 1.0;
  }

  // Add Centroid 3D Pin Marker
  const marker = createCentroidMarker(clash.collisionPoint);
  clashHelpersGroup.add(marker);

  // Add Wireframe Bounding Box Helper
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
    const t = Math.min((now - startTime) / duration, 1.0);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    camera.position.lerpVectors(startCam, camPos, ease);
    controls.target.lerpVectors(startTarget, targetPos, ease);
    controls.update();
    if (t < 1.0) requestAnimationFrame(animateStep);
  }
  requestAnimationFrame(animateStep);
  setStatus(`Inspecting ${clash.id} at (${targetPos.x.toFixed(2)}, ${targetPos.y.toFixed(2)}, ${targetPos.z.toFixed(2)})`);
}

// ---------------- Clash Detail & Threaded Discussion UI ----------------
function renderClashDetailView(clash) {
  if (!els.clashDetailContainer || !els.clashListContainer) return;
  els.clashListContainer.style.display = 'none';
  els.clashDetailContainer.style.display = 'block';

  const titleEl = document.getElementById('clash-detail-title');
  const metaEl = document.getElementById('clash-detail-meta');
  const sevBadge = document.getElementById('clash-detail-severity');

  if (titleEl) titleEl.textContent = `${clash.elementA.discipline} #${clash.elementA.expressID} × ${clash.elementB.discipline} #${clash.elementB.expressID}`;
  if (sevBadge) {
    sevBadge.textContent = clash.severity;
    sevBadge.className = `bim-badge severity-${(clash.severity || 'minor').toLowerCase()}`;
  }
  if (metaEl) {
    const pt = clash.collisionPoint;
    metaEl.innerHTML = `
      <div><strong>Collision Coordinates:</strong> (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)})</div>
      <div><strong>Penetration Depth:</strong> ${(clash.penetrationDepth || 0).toFixed(1)} mm | <strong>Volume:</strong> ${(clash.intersectionVolume || 0).toFixed(4)} m³</div>
      <div><strong>Element A:</strong> ${clash.elementA.modelName} (${clash.elementA.ifcType})</div>
      <div><strong>Element B:</strong> ${clash.elementB.modelName} (${clash.elementB.ifcType})</div>
    `;
  }

  loadClashComments(clash.id);
}

async function loadClashComments(clashId) {
  if (!els.clashCommentsStream) return;
  els.clashCommentsStream.innerHTML = '<div class="empty-hint">Loading discussion…</div>';

  try {
    const res = await frappe.call({ method: API.list_clash_comments, args: { clash: clashId } });
    const comments = res.message || [];
    if (!comments.length) {
      els.clashCommentsStream.innerHTML = '<div class="empty-hint">No comments yet. Start the team discussion below.</div>';
      return;
    }

    els.clashCommentsStream.innerHTML = comments.map(c => `
      <div class="clash-comment-bubble">
        <div class="clash-comment-header">
          <strong>${c.user || 'Administrator'}</strong>
          <span>${c.creation ? c.creation.slice(0, 16) : 'Just now'}</span>
        </div>
        <div class="clash-comment-body">${c.comment || ''}</div>
        ${c.snapshot ? `<img src="${c.snapshot}" class="clash-comment-snapshot" />` : ''}
      </div>
    `).join('');
  } catch (e) {
    els.clashCommentsStream.innerHTML = '<div class="empty-hint">Discussion thread ready for clash notes.</div>';
  }
}

async function postClashComment() {
  if (!activeClash || !els.clashCommentInput) return;
  const text = els.clashCommentInput.value.trim();
  if (!text) return;

  setStatus('Posting comment…');
  try {
    await frappe.call({
      method: API.add_clash_comment,
      args: { clash: activeClash.id, comment: text, user: (window.frappe && frappe.session && frappe.session.user) || 'Administrator' },
    });
    els.clashCommentInput.value = '';
    loadClashComments(activeClash.id);
    setStatus('Comment posted.');
  } catch (e) {
    const bubble = document.createElement('div');
    bubble.className = 'clash-comment-bubble';
    bubble.innerHTML = `
      <div class="clash-comment-header">
        <strong>${(window.frappe && frappe.session && frappe.session.user) || 'User'}</strong>
        <span>Just now</span>
      </div>
      <div class="clash-comment-body">${text}</div>
    `;
    els.clashCommentsStream.appendChild(bubble);
    els.clashCommentInput.value = '';
    setStatus('Note added to local session.');
  }
}

async function saveClashToErpNext() {
  if (!activeClash) return;
  showLoading('Saving clash record to ERPNext…', true);
  try {
    const viewpoint = generateBcfViewpoint(camera, controls, activeClash, {
      snapshot: renderer.domElement.toDataURL('image/png'),
    });

    const res = await frappe.call({
      method: API.create_clash,
      args: {
        title: `${activeClash.elementA.discipline} #${activeClash.elementA.expressID} × ${activeClash.elementB.discipline} #${activeClash.elementB.expressID}`,
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
        viewpoint: JSON.stringify(viewpoint),
      },
    });

    showLoading('', false);
    frappe.msgprint({
      title: __('BIM Clash Saved'),
      message: __('Created BIM Clash record: <b>{0}</b>', [(res.message && res.message.name) || 'BIM-CLASH-NEW']),
      indicator: 'green',
    });
    setStatus(`Saved clash record ${(res.message && res.message.name) || ''}`);
  } catch (e) {
    showLoading('', false);
    frappe.msgprint({
      title: __('Failed to Save Clash'),
      message: __('Could not save BIM Clash: {0}', [e.message || String(e)]),
      indicator: 'red',
    });
    setStatus(`Error saving clash: ${e.message || e}`);
  }
}

// ---------------- Interactive BIM BOM Wizard Modal ----------------
function openBomWizardModal() {
  if (!els.bomModal) return;
  els.bomModal.classList.add('active');
  calculateAndRenderBomRollup();
}

function closeBomWizardModal() {
  if (!els.bomModal) return;
  els.bomModal.classList.remove('active');
  clearSelection();
}

function calculateAndRenderBomRollup() {
  if (!els.bomRollupTbody) return;
  els.bomRollupTbody.innerHTML = '';

  const rollups = new Map();

  elementMeshes.forEach(({ mesh, expressID, modelDocName, discipline }) => {
    const el = elementIndex.get(`${modelDocName}:${expressID}`) || elementIndex.get(String(expressID)) || mesh.userData.element;
    const ifcType = (el && el.element_type) || (mesh.userData.ifcType ? `IFC_${mesh.userData.ifcType}` : 'IFC_ELEMENT');

    if (!rollups.has(ifcType)) {
      let metricName = 'Volume';
      let uom = 'm3';
      let unitRate = 180.0;
      let wastePct = 5;
      let itemCode = 'CONC-C30-37';

      const typeUpper = ifcType.toUpperCase();
      if (typeUpper.includes('SLAB')) {
        metricName = 'NetVolume'; uom = 'm3'; unitRate = 195.0; wastePct = 5; itemCode = 'CONC-SLAB-C30';
      } else if (typeUpper.includes('BEAM') || typeUpper.includes('COLUMN')) {
        metricName = 'NetVolume'; uom = 'm3'; unitRate = 220.0; wastePct = 5; itemCode = 'CONC-STRUC-C35';
      } else if (typeUpper.includes('WALL')) {
        metricName = 'NetVolume'; uom = 'm3'; unitRate = 175.0; wastePct = 5; itemCode = 'CONC-WALL-PANEL';
      } else if (typeUpper.includes('DUCT')) {
        metricName = 'Length'; uom = 'm'; unitRate = 85.0; wastePct = 10; itemCode = 'MEP-DUCT-GALV';
      } else if (typeUpper.includes('PIPE')) {
        metricName = 'Length'; uom = 'm'; unitRate = 45.0; wastePct = 10; itemCode = 'MEP-PIPE-COPPER';
      } else if (typeUpper.includes('AIRTERMINAL') || typeUpper.includes('VALVE') || typeUpper.includes('PUMP')) {
        metricName = 'Count'; uom = 'Nos'; unitRate = 120.0; wastePct = 0; itemCode = 'MEP-FIXTURE-UNIT';
      }

      rollups.set(ifcType, {
        type: ifcType,
        discipline,
        count: 0,
        metricName,
        metricValue: 0.0,
        uom,
        itemCode,
        unitRate,
        wastePct,
        meshes: [],
      });
    }

    const r = rollups.get(ifcType);
    r.count++;
    r.meshes.push(mesh);

    if (el && el.quantities) {
      if (r.metricName === 'NetVolume' && el.quantities.NetVolume) {
        r.metricValue += parseFloat(el.quantities.NetVolume) || 0.0;
      } else if (r.metricName === 'Length' && (el.quantities.Length || el.quantities.NominalLength)) {
        r.metricValue += parseFloat(el.quantities.Length || el.quantities.NominalLength) || 0.0;
      } else if (r.metricName === 'GrossArea' && el.quantities.GrossArea) {
        r.metricValue += parseFloat(el.quantities.GrossArea) || 0.0;
      }
    } else if (mesh.geometry) {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
      const sz = worldBox.getSize(new THREE.Vector3());
      if (r.metricName === 'NetVolume') r.metricValue += (sz.x * sz.y * sz.z);
      else if (r.metricName === 'Length') r.metricValue += Math.max(sz.x, sz.y, sz.z);
      else r.metricValue += 1.0;
    }
  });

  let totalCost = 0.0;
  let totalLineItems = rollups.size;

  rollups.forEach((row) => {
    const effectiveQty = row.metricValue * (1.0 + (row.wastePct / 100.0));
    const lineTotal = effectiveQty * row.unitRate;
    totalCost += lineTotal;

    const tr = document.createElement('tr');
    tr.className = 'bom-row';
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
      document.querySelectorAll('.bom-rollup-table tr.bom-row').forEach(r => r.classList.remove('selected'));
      tr.classList.add('selected');
      crossHighlightMeshes(row.meshes);
    };

    const wasteInput = tr.querySelector('.bom-waste-input');
    const rateInput = tr.querySelector('.bom-rate-input');
    const effQtyEl = tr.querySelector('.bom-eff-qty');
    const lineTotalEl = tr.querySelector('.bom-line-total');

    const updateLine = () => {
      const w = parseFloat(wasteInput.value) || 0;
      const rVal = parseFloat(rateInput.value) || 0;
      const eff = row.metricValue * (1.0 + w / 100.0);
      const tot = eff * rVal;
      effQtyEl.textContent = `${eff.toFixed(2)} ${row.uom}`;
      lineTotalEl.textContent = `$${tot.toFixed(2)}`;
    };

    if (wasteInput) wasteInput.oninput = updateLine;
    if (rateInput) rateInput.oninput = updateLine;

    els.bomRollupTbody.appendChild(tr);
  });

  if (els.bomSummaryText) {
    els.bomSummaryText.textContent = `Total Line Items: ${totalLineItems} | Estimated Total Cost: $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        depthWrite: mesh.material.depthWrite,
      };
    }
    if (targetSet.has(mesh)) {
      if (!mesh.userData.origColor) mesh.userData.origColor = mesh.material.color.clone();
      mesh.material.color.setHex(0x38bdf8);
      if (mesh.material.emissive) mesh.material.emissive.setHex(0x0369a1);
      mesh.material.transparent = false;
      mesh.material.opacity = 1.0;
      if (mesh.geometry) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        targetBox.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
      }
    } else {
      if (mesh.userData.origColor) mesh.material.color.copy(mesh.userData.origColor);
      if (mesh.material.emissive) mesh.material.emissive.setHex(0x000000);
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
  const parentItem = (document.getElementById('bom-parent-item') || {}).value || 'BLD-NORDIC-CONC-01';
  const bomTitle = (document.getElementById('bom-title') || {}).value || 'BIM Generated BOM';

  showLoading('Generating ERPNext BOM document…', true);
  try {
    const items = [];
    document.querySelectorAll('#bom-rollup-tbody tr.bom-row').forEach(tr => {
      const type = (tr.querySelector('td strong') || {}).textContent || '';
      const itemCode = (tr.querySelector('.bom-item-input') || {}).value || '';
      const effQtyStr = (tr.querySelector('.bom-eff-qty') || {}).textContent || '0';
      const parsedQty = parseFloat(effQtyStr);
      const effQty = Number.isFinite(parsedQty) ? parsedQty : 0;
      if (effQty <= 0) return; // Skip zero or invalid quantity items
      const rateStr = (tr.querySelector('.bom-rate-input') || {}).value || '0';
      const rate = parseFloat(rateStr) || 0;

      items.push({ item_code: itemCode, qty: effQty, rate, ifc_type: type });
    });

    const res = await frappe.call({
      method: API.generate_bom_from_bim,
      args: {
        item: parentItem,
        bom_title: bomTitle,
        items: JSON.stringify(items),
      },
    });

    showLoading('', false);
    closeBomWizardModal();
    frappe.msgprint({
      title: __('BOM Generated Successfully'),
      message: __('Created ERPNext BOM: <b>{0}</b> with {1} line items.', [(res.message && res.message.name) || 'BOM-' + parentItem, items.length]),
      indicator: 'green',
    });
    setStatus(`Generated ERPNext BOM for ${parentItem}`);
  } catch (e) {
    showLoading('', false);
    frappe.msgprint({
      title: __('Failed to Generate BOM'),
      message: __('Error generating ERPNext BOM: {0}', [e.message || String(e)]),
      indicator: 'red',
    });
    setStatus(`BOM generation failed: ${e.message || e}`);
  }
}

// ---------------- HUD & Tools Handlers ----------------
function setTool(tool) {
  activeTool = tool;
  document.querySelectorAll('#bim-hud button').forEach(b => b.classList.toggle('active', b.id === 'tool-' + tool));
  renderer.domElement.style.cursor = tool === 'measure' ? 'crosshair' : 'default';
}

let pointerDownPos = { x: 0, y: 0 };
els.canvas.addEventListener('pointerdown', ev => {
  pointerDownPos = { x: ev.clientX, y: ev.clientY };
});

els.canvas.addEventListener('click', async (ev) => {
  if (activeTool === 'measure') { measureClick(ev); return; }
  const dist = Math.hypot(ev.clientX - pointerDownPos.x, ev.clientY - pointerDownPos.y);
  if (dist > 6) return;

  if (activeTool !== 'select' && activeTool !== 'orbit') return;

  const rect = els.canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((ev.clientX - rect.left) / rect.width) * 2 - 1,
    -((ev.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const meshes = [];
  federatedGroup.traverse(o => { if (o.isMesh && o.visible) meshes.push(o); });
  const hits = raycaster.intersectObjects(meshes, false);

  if (hits.length) {
    const hit = hits[0];
    const expr = hit.object.userData.expressID || getExpressIdAt(hit.object.geometry, hit.face ? hit.face.a : undefined);
    const modelDoc = hit.object.userData.modelDocName || '';
    await selectElement(hit.object, expr, modelDoc);
  } else {
    clearSelection();
  }
});

function getExpressIdAt(geometry, faceIndex) {
  const attr = geometry && geometry.attributes && geometry.attributes.expressID;
  if (!attr || faceIndex === undefined || faceIndex === null) return null;
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

// ---------------- Measure Tool ----------------
let measurePoints = [];
const measureLine = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
);
scene.add(measureLine);

function measureClick(ev) {
  const rect = els.canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((ev.clientX - rect.left) / rect.width) * 2 - 1,
    -((ev.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const meshes = [];
  federatedGroup.traverse(o => { if (o.isMesh) meshes.push(o); });
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
      setStatus('Measure: click second target vertex/point');
    }
  }
}

// ---------------- Filters & Facets ----------------
function populateFacets() {
  if (!els.fDiscipline || !els.fStorey || !els.fType) return;
  const disciplines = new Set();
  const storeys = new Set();
  const types = new Set();

  loadedModels.forEach(m => {
    disciplines.add(m.discipline);
    (m.elements || []).forEach(el => {
      if (el.storey) storeys.add(el.storey);
      if (el.element_type) types.add(el.element_type);
    });
  });

  els.fDiscipline.innerHTML = '<option value="">Discipline: all</option>';
  disciplines.forEach(d => {
    const o = document.createElement('option'); o.value = d; o.textContent = d; els.fDiscipline.appendChild(o);
  });

  els.fStorey.innerHTML = '<option value="">Storey: all</option>';
  storeys.forEach(s => {
    const o = document.createElement('option'); o.value = s; o.textContent = s; els.fStorey.appendChild(o);
  });

  els.fType.innerHTML = '<option value="">Type: all</option>';
  types.forEach(t => {
    const o = document.createElement('option'); o.value = t; o.textContent = t; els.fType.appendChild(o);
  });
}

function applyFilters() {
  const fDisc = els.fDiscipline ? els.fDiscipline.value : '';
  const fStorey = els.fStorey ? els.fStorey.value : '';
  const fType = els.fType ? els.fType.value : '';
  const fSearch = (els.fSearch ? els.fSearch.value : '').toLowerCase().trim();

  let visibleCount = 0;
  elementMeshes.forEach(({ mesh, expressID, modelDocName, discipline }) => {
    const el = elementIndex.get(`${modelDocName}:${expressID}`) || elementIndex.get(String(expressID)) || mesh.userData.element;
    let match = true;

    if (fDisc && !disciplineMatches(discipline, fDisc)) match = false;
    if (fStorey && el && el.storey !== fStorey) match = false;
    if (fType && el && el.element_type !== fType) match = false;
    if (fSearch) {
      const searchTarget = `${(el && el.title) || ''} ${(el && el.element_type) || ''} ${expressID} ${(el && el.stable_id) || ''}`.toLowerCase();
      if (!searchTarget.includes(fSearch)) match = false;
    }

    mesh.visible = match;
    if (match) visibleCount++;
  });

  setStatus(`${visibleCount} elements matching filters`);
}

// ---------------- Viewpoints ----------------
function saveCurrentViewpoint() {
  const name = (els.vpName && els.vpName.value.trim()) || 'View ' + new Date().toLocaleTimeString();
  const vpData = {
    position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
    target: { x: controls.target.x, y: controls.target.y, z: controls.target.z },
  };

  const d = document.createElement('div');
  d.className = 'link-row';
  d.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #f1f5f9;font-size:12px';
  d.innerHTML = `<span style="cursor:pointer">📷 ${name}</span><button class="del" style="color:#ef4444;border:none;background:none;cursor:pointer">✕</button>`;
  
  d.querySelector('span').onclick = () => {
    camera.position.set(vpData.position.x, vpData.position.y, vpData.position.z);
    controls.target.set(vpData.target.x, vpData.target.y, vpData.target.z);
    controls.update();
    setStatus('Restored viewpoint ' + name);
  };
  d.querySelector('.del').onclick = () => d.remove();

  if (els.viewpoints.querySelector('.empty-hint')) els.viewpoints.innerHTML = '';
  els.viewpoints.appendChild(d);
  if (els.vpName) els.vpName.value = '';
  setStatus('Saved viewpoint: ' + name);
}

// ---------------- DOM Event Binding ----------------
function initUiEvents() {
  // Tab switcher
  document.querySelectorAll('.bim-tab-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.bim-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.bim-tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    };
  });

  // HUD buttons
  const toolOrbit = document.getElementById('tool-orbit');
  const toolSelect = document.getElementById('tool-select');
  const toolMeasure = document.getElementById('tool-measure');
  const toolClip = document.getElementById('tool-clip');
  const toolClashes = document.getElementById('tool-clashes');

  if (toolOrbit) toolOrbit.onclick = () => setTool('orbit');
  if (toolSelect) toolSelect.onclick = () => setTool('select');
  if (toolMeasure) toolMeasure.onclick = () => setTool('measure');
  if (toolClip) toolClip.onclick = () => setTool('clip');
  if (toolClashes) {
    toolClashes.onclick = () => {
      const tabBtn = document.getElementById('tab-btn-clashes');
      if (tabBtn) tabBtn.click();
    };
  }

  // Quick view tools
  const tWireframe = document.getElementById('t-wireframe');
  const tIso = document.getElementById('t-iso');
  const tTop = document.getElementById('t-top');
  const tFront = document.getElementById('t-front');
  const btnFit = document.getElementById('btn-fit');

  if (tWireframe) {
    tWireframe.onclick = () => {
      wireframeMode = !wireframeMode;
      federatedGroup.traverse(o => {
        if (o.isMesh && o.material) o.material.wireframe = wireframeMode;
      });
      setStatus(`Wireframe mode: ${wireframeMode ? 'ON' : 'OFF'}`);
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

  // Clash buttons
  const btnRunClashes = document.getElementById('btn-run-clashes');
  if (btnRunClashes) btnRunClashes.onclick = executeClashDetection;

  const btnClashBack = document.getElementById('btn-clash-back');
  if (btnClashBack) {
    btnClashBack.onclick = () => {
      if (els.clashDetailContainer && els.clashListContainer) {
        els.clashDetailContainer.style.display = 'none';
        els.clashListContainer.style.display = 'block';
      }
    };
  }

  const btnClashFly = document.getElementById('btn-clash-fly');
  if (btnClashFly) {
    btnClashFly.onclick = () => {
      if (activeClash) flyToClash(activeClash);
    };
  }

  const btnPostClashComment = document.getElementById('btn-post-clash-comment');
  if (btnPostClashComment) btnPostClashComment.onclick = postClashComment;

  const btnSaveClashErp = document.getElementById('btn-save-clash-erp');
  if (btnSaveClashErp) btnSaveClashErp.onclick = saveClashToErpNext;

  // BOM Wizard buttons
  const btnOpenBomWizard = document.getElementById('btn-open-bom-wizard');
  if (btnOpenBomWizard) btnOpenBomWizard.onclick = openBomWizardModal;

  const btnCloseBomModal = document.getElementById('btn-close-bom-modal');
  const btnCancelBomModal = document.getElementById('btn-cancel-bom-modal');
  if (btnCloseBomModal) btnCloseBomModal.onclick = closeBomWizardModal;
  if (btnCancelBomModal) btnCancelBomModal.onclick = closeBomWizardModal;

  const btnGenerateErpBom = document.getElementById('btn-generate-erp-bom');
  if (btnGenerateErpBom) btnGenerateErpBom.onclick = generateErpNextBom;

  // Model actions
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

  // Upload
  if (els.upload && els.fileInput) {
    els.upload.onclick = () => els.fileInput.click();
    els.fileInput.onchange = async () => {
      const file = els.fileInput.files[0];
      if (!file) return;
      showLoading(`Uploading ${file.name}…`, true);
      try {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('is_private', '0');
        formData.append('doctype', 'BIM Model');
        formData.append('docname', 'new');
        const uploadResp = await fetch('/api/method/upload_file', {
          method: 'POST',
          body: formData,
          headers: { 'X-Frappe-CSRF-Token': (window.frappe && frappe.csrf_token) || '' },
        });
        if (!uploadResp.ok) throw new Error('Upload failed');
        const uploadData = await uploadResp.json();
        const fileUrl = uploadData.message && uploadData.message.file_url;
        if (!fileUrl) throw new Error('Failed to retrieve file URL');

        let disc = 'Architecture';
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes('struc') || nameLower.includes('str')) disc = 'Structural';
        else if (nameLower.includes('hvac') || nameLower.includes('mep')) disc = 'MEP';

        showLoading('Parsing IFC…', true);
        const createRes = await frappe.call({
          method: API.create_model,
          args: {
            file_url: fileUrl,
            file_name: file.name,
            model_name: file.name.replace(/\.ifc$/i, ''),
            discipline: disc,
          },
        });
        await loadModelsList();
        await loadModelGeometry(createRes.message.name);
        renderModelsList();
        updateElementMeshesList();
        fitView();
        setStatus(`Imported ${file.name} successfully`);
      } catch (e) {
        setStatus('Import failed: ' + (e.message || e));
      } finally {
        showLoading('', false);
        els.fileInput.value = '';
      }
    };
  }

  // Viewpoints
  const vpSaveBtn = document.getElementById('vp-save');
  if (vpSaveBtn) vpSaveBtn.onclick = saveCurrentViewpoint;

  const btnClashSnapshot = document.getElementById('btn-clash-snapshot');
  if (btnClashSnapshot) {
    btnClashSnapshot.onclick = () => {
      renderer.render(scene, camera);
      if (els.clashCommentInput) {
        els.clashCommentInput.value += (els.clashCommentInput.value ? '\n' : '') + `[BCF Viewpoint snapshot captured at ${new Date().toLocaleTimeString()}]`;
      }
      setStatus('Snapshot captured to clash comment buffer');
    };
  }

  const btnNlAdd = document.getElementById('nl-add');
  if (btnNlAdd) {
    btnNlAdd.onclick = async () => {
      if (!currentSelection || !currentSelection.element) {
        frappe.msgprint(__('Please select a BIM element first'));
        return;
      }
      const typeSelect = document.getElementById('nl-type');
      const nameInput = document.getElementById('nl-name');
      const targetType = typeSelect ? typeSelect.value : 'Item';
      const targetName = nameInput ? nameInput.value.trim() : '';
      if (!targetName) return;
      try {
        await frappe.call({
          method: API.create_boq_link,
          args: {
            element: currentSelection.element.name || currentSelection.expressID,
            target_doctype: targetType,
            target_name: targetName,
          },
        });
        setStatus(`Created BOQ Link to ${targetName}`);
        if (nameInput) nameInput.value = '';
      } catch (e) {
        setStatus(`Link error: ${e.message || e}`);
      }
    };
  }

  // Filter change listeners
  if (els.fDiscipline) els.fDiscipline.onchange = applyFilters;
  if (els.fStorey) els.fStorey.onchange = applyFilters;
  if (els.fType) els.fType.onchange = applyFilters;
  if (els.fSearch) els.fSearch.oninput = applyFilters;
  const fClear = document.getElementById('f-clear');
  if (fClear) {
    fClear.onclick = () => {
      if (els.fDiscipline) els.fDiscipline.value = '';
      if (els.fStorey) els.fStorey.value = '';
      if (els.fType) els.fType.value = '';
      if (els.fSearch) els.fSearch.value = '';
      applyFilters();
    };
  }
}

async function handleRouteParams() {
  const params = new URLSearchParams(window.location.search);
  const routeOpts = (window.frappe && frappe.route_options) || {};
  const modelParam = routeOpts.model || routeOpts.models || params.get('models') || params.get('model');
  const clashParam = routeOpts.clash || params.get('clash');
  const elemA = routeOpts.element_a || params.get('element_a');
  const elemB = routeOpts.element_b || params.get('element_b');

  if (modelParam) {
    const modelNames = modelParam.split(',').map(s => s.trim()).filter(Boolean);
    for (const m of modelNames) {
      await loadModelGeometry(m);
    }
    renderModelsList();
    updateElementMeshesList();
    fitView();
  }

  if (clashParam) {
    const tabClashes = document.getElementById('tab-btn-clashes');
    if (tabClashes) tabClashes.click();
    await loadExistingClashes();
    const found = detectedClashes.find(c => c.name === clashParam || c.id === clashParam);
    if (found) {
      selectClash(found);
      flyToClash(found);
    }
  } else if (elemA || elemB) {
    const match = elementMeshes.find(item => {
      const el = elementIndex.get(`${item.modelDocName}:${item.expressID}`) || elementIndex.get(String(item.expressID));
      const sid = (el && el.stable_id) || (item.mesh && item.mesh.userData && (item.mesh.userData.guid || item.mesh.userData.stable_id));
      return sid && (sid === elemA || sid === elemB);
    });
    if (match) {
      selectElement(match.mesh, match.expressID, match.modelDocName);
    }
  }

  const projectParam = routeOpts.project || params.get('project');
  if (projectParam) {
    activeProject = projectParam;
  }
  const modeParam = routeOpts.mode || params.get('mode');
  if (modeParam === 'coordination') {
    setAppMode('coordination');
  } else {
    setAppMode('initiation');
  }
}

// =========================================================================
// Project Initiation Pipeline & OpenProject BIM Workspace Controller
// =========================================================================
let currentAppMode = 'initiation';
let currentViewportTab = '3d';
let activeProject = null;
let initiationData = null;
let stagedBoqFileUrl = null;
let detectedDriftModels = [];

function setAppMode(mode) {
  currentAppMode = mode;
  const leftInit = document.getElementById('bim-left-initiation');
  const leftCoord = document.getElementById('bim-left-coordination');
  const rightInit = document.getElementById('bim-right-initiation');
  const rightCoord = document.getElementById('bim-right-coordination');
  const btnModeInit = document.getElementById('btn-mode-initiation');
  const btnModeCoord = document.getElementById('btn-mode-coordination');

  if (mode === 'initiation') {
    if (leftInit) leftInit.style.display = 'flex';
    if (leftCoord) leftCoord.style.display = 'none';
    if (rightInit) rightInit.style.display = 'flex';
    if (rightCoord) rightCoord.style.display = 'none';
    if (btnModeInit) btnModeInit.classList.add('active');
    if (btnModeCoord) btnModeCoord.classList.remove('active');
    if (activeProject) refreshInitiationStatus();
  } else {
    if (leftInit) leftInit.style.display = 'none';
    if (leftCoord) leftCoord.style.display = 'flex';
    if (rightInit) rightInit.style.display = 'none';
    if (rightCoord) rightCoord.style.display = 'flex';
    if (btnModeInit) btnModeInit.classList.remove('active');
    if (btnModeCoord) btnModeCoord.classList.add('active');
  }
}

function setViewportTab(tab) {
  currentViewportTab = tab;
  const vpTabs = document.querySelectorAll('.bim-vp-tab');
  vpTabs.forEach(t => {
    if (t.dataset.vp === tab) t.classList.add('active');
    else t.classList.remove('active');
  });

  const vp3d = document.getElementById('viewport-container-3d');
  const vpCad = document.getElementById('viewport-container-cad');
  const vpPdf = document.getElementById('viewport-container-pdf');

  if (vp3d) vp3d.style.display = (tab === '3d') ? 'block' : 'none';
  if (vpCad) vpCad.style.display = (tab === 'cad') ? 'block' : 'none';
  if (vpPdf) vpPdf.style.display = (tab === 'pdf') ? 'block' : 'none';

  if (tab === '3d') {
    window.dispatchEvent(new Event('resize'));
  }
}

async function refreshInitiationStatus() {
  if (!activeProject) return;
  try {
    const res = await frappe.call({
      method: API.get_initiation_status,
      args: { project: activeProject },
    });
    if (!res || !res.message) return;
    initiationData = res.message;
    renderInitiationWorkspace(initiationData);
  } catch (e) {
    console.error('Failed to fetch initiation status:', e);
  }
}

function renderInitiationWorkspace(data) {
  const readiness = data.readiness || {};
  const gates = readiness.gates || [];

  // 1. Top bar updates
  const titleEl = document.getElementById('bim-project-title');
  if (titleEl) titleEl.textContent = data.project_name || data.project;
  const statusBadgeEl = document.getElementById('bim-project-status-badge');
  if (statusBadgeEl) {
    statusBadgeEl.textContent = data.project_status || 'Initiating';
    statusBadgeEl.className = 'bim-badge ' + (data.project_status === 'In Progress' ? 'badge-validated' : 'status-draft');
  }

  // 2. Intake Tree Badges
  const badgeContract = document.getElementById('badge-contract');
  if (badgeContract) {
    const hasC = (data.contract_count > 0 || (readiness.contract_amount && readiness.contract_amount > 0));
    badgeContract.textContent = hasC ? 'Validated' : 'Pending';
    badgeContract.className = 'bim-badge ' + (hasC ? 'badge-validated' : 'badge-pending');
  }

  const badgeCad = document.getElementById('badge-cad');
  if (badgeCad) {
    const cadCount = data.cad_count || 0;
    badgeCad.textContent = `${cadCount} Sheets`;
    badgeCad.className = 'bim-badge ' + (cadCount > 0 ? 'badge-validated' : 'badge-pending');
  }

  const badgeModels = document.getElementById('badge-models');
  if (badgeModels) {
    const modelCount = (data.models || []).length;
    badgeModels.textContent = `${modelCount} Models`;
    badgeModels.className = 'bim-badge ' + (modelCount > 0 ? 'badge-validated' : 'badge-pending');
  }

  const badgeBoq = document.getElementById('badge-boq');
  if (badgeBoq) {
    const hasB = (data.estimates && data.estimates.length > 0) || (readiness.estimated_cost && readiness.estimated_cost > 0);
    badgeBoq.textContent = hasB ? 'Baselined' : 'Pending';
    badgeBoq.className = 'bim-badge ' + (hasB ? 'badge-validated' : 'badge-pending');
  }

  const progressLabel = document.getElementById('intake-progress-label');
  if (progressLabel) {
    const passedCount = gates.filter(g => g.passed).length;
    progressLabel.textContent = `${passedCount}/4 Complete`;
  }

  // 3. Render Initiation Loaded Models List
  const initModelsList = document.getElementById('bim-init-models');
  if (initModelsList && data.models) {
    if (!data.models.length) {
      initModelsList.innerHTML = '<div class="empty-hint">Drop IFC models above to load</div>';
    } else {
      initModelsList.innerHTML = data.models.map(m => {
        const isLoaded = loadedModels.has(m.name);
        return `
          <div class="bim-model-item ${isLoaded ? 'active' : ''}" data-model="${m.name}">
            <div class="model-title">
              <input type="checkbox" class="init-model-chk" data-model="${m.name}" ${isLoaded ? 'checked' : ''} style="margin:0 4px 0 0" />
              <span>${m.model_name || m.name}</span>
            </div>
            <span class="discipline-tag tag-${(m.discipline || 'arch').toLowerCase()}">${m.discipline || 'Architecture'}</span>
          </div>
        `;
      }).join('');

      initModelsList.querySelectorAll('.init-model-chk').forEach(chk => {
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

  // 4. Verification Cards
  // Commercial Card
  const metContractAmt = document.getElementById('metric-contract-amount');
  if (metContractAmt) metContractAmt.textContent = `PHP ${(readiness.contract_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const metContractCnt = document.getElementById('metric-contract-count');
  if (metContractCnt) metContractCnt.textContent = `${data.contract_count || 0} Files`;
  const badgeComm = document.getElementById('card-badge-commercial');
  if (badgeComm) {
    const passed = gates[0] && gates[0].passed;
    badgeComm.textContent = passed ? 'Validated' : 'Pending';
    badgeComm.className = 'bim-badge ' + (passed ? 'badge-validated' : 'badge-pending');
  }

  // Quantity Card
  const metBoqCost = document.getElementById('metric-boq-cost');
  if (metBoqCost) metBoqCost.textContent = `PHP ${(readiness.estimated_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const metBoqLines = document.getElementById('metric-boq-lines');
  if (metBoqLines) metBoqLines.textContent = `${(data.estimates && data.estimates[0] && data.estimates[0].line_count) || 'Standard'} Items`;
  const badgeQty = document.getElementById('card-badge-quantity');
  if (badgeQty) {
    const passed = gates[2] && gates[2].passed;
    badgeQty.textContent = passed ? 'Baselined' : 'Pending';
    badgeQty.className = 'bim-badge ' + (passed ? 'badge-validated' : 'badge-pending');
  }

  // Spatial Card
  const metElemCnt = document.getElementById('metric-elements-count');
  if (metElemCnt) metElemCnt.textContent = elementMeshes.length || (data.models || []).reduce((sum, m) => sum + (m.elements_count || 0), 0);
  const metAlign = document.getElementById('metric-align-status');
  const badgeSpatial = document.getElementById('card-badge-spatial');
  const driftAlert = document.getElementById('card-drift-alert');
  const alignment = data.alignment || {};

  if (alignment.drift_detected) {
    detectedDriftModels = alignment.drift_models || [];
    if (metAlign) metAlign.textContent = `Drift: ${alignment.max_distance}m`;
    if (badgeSpatial) {
      badgeSpatial.textContent = 'Warning';
      badgeSpatial.className = 'bim-badge badge-warning';
    }
    if (driftAlert) driftAlert.style.display = 'block';
  } else {
    detectedDriftModels = [];
    if (metAlign) metAlign.textContent = 'Aligned';
    if (badgeSpatial) {
      badgeSpatial.textContent = `${(data.models || []).length} Aligned`;
      badgeSpatial.className = 'bim-badge badge-validated';
    }
    if (driftAlert) driftAlert.style.display = 'none';
  }

  // 2D Drawings Card
  const metCadCnt = document.getElementById('metric-cad-count');
  if (metCadCnt) metCadCnt.textContent = `${data.cad_count || 0}`;
  const metCadStat = document.getElementById('metric-cad-status');
  if (metCadStat) metCadStat.textContent = (data.cad_count > 0) ? 'Available' : 'Pending';
  const badgeDrawings = document.getElementById('card-badge-drawings');
  if (badgeDrawings) {
    badgeDrawings.textContent = `${data.cad_count || 0} Sheets`;
    badgeDrawings.className = 'bim-badge ' + (data.cad_count > 0 ? 'badge-validated' : 'badge-pending');
  }

  // Stage-Gate Checklist Card
  const gateItems = [
    { id: 'gate-item-contract', passed: gates[0] && gates[0].passed },
    { id: 'gate-item-model', passed: gates[1] && gates[1].passed },
    { id: 'gate-item-boq', passed: gates[2] && gates[2].passed },
    { id: 'gate-item-signoff', passed: readiness.all_ready },
  ];

  gateItems.forEach(g => {
    const el = document.getElementById(g.id);
    if (el) {
      if (g.passed) {
        el.classList.add('passed');
        const icon = el.querySelector('.gate-icon');
        if (icon) icon.textContent = '✓';
      } else {
        el.classList.remove('passed');
        const icon = el.querySelector('.gate-icon');
        if (icon) icon.textContent = '○';
      }
    }
  });

  const cardBadgeGate = document.getElementById('card-badge-gate');
  if (cardBadgeGate) {
    if (readiness.all_ready) {
      cardBadgeGate.textContent = 'Ready for Kickoff';
      cardBadgeGate.className = 'bim-badge badge-validated';
    } else {
      const remaining = gates.filter(g => !g.passed).length;
      cardBadgeGate.textContent = `${remaining} Required`;
      cardBadgeGate.className = 'bim-badge badge-pending';
    }
  }

  const btnApprove = document.getElementById('btn-approve-initiation');
  if (btnApprove) {
    btnApprove.disabled = !readiness.all_ready;
  }
}

async function uploadIntakeFile(file, category, discipline) {
  showLoading(`Uploading ${file.name} to 0${category}…`, true);
  try {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('is_private', '0');
    formData.append('doctype', 'Project');
    formData.append('docname', activeProject || 'new');
    const uploadResp = await fetch('/api/method/upload_file', {
      method: 'POST',
      body: formData,
      headers: { 'X-Frappe-CSRF-Token': (window.frappe && frappe.csrf_token) || '' },
    });
    if (!uploadResp.ok) throw new Error('Upload request failed');
    const uploadData = await uploadResp.json();
    const fileUrl = uploadData.message && uploadData.message.file_url;
    if (!fileUrl) throw new Error('Failed to retrieve file URL');

    const routeRes = await frappe.call({
      method: API.upload_intake_file,
      args: {
        project: activeProject,
        category: category,
        file_url: fileUrl,
        filename: file.name,
        discipline: discipline || 'Architecture',
      },
    });

    if (category === 'boq') {
      stagedBoqFileUrl = fileUrl;
      await openBoqColumnMappingModal(fileUrl);
    } else if (category === 'ifc') {
      const createdModel = routeRes.message && routeRes.message.created_records && routeRes.message.created_records['BIM Model'];
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
    frappe.msgprint({ title: __('Intake Error'), message: e.message || e, indicator: 'red' });
  } finally {
    showLoading('', false);
  }
}

async function openBoqColumnMappingModal(fileUrl) {
  showLoading('Analyzing spreadsheet columns…', true);
  try {
    const res = await frappe.call({
      method: API.parse_boq_file,
      args: { file_url: fileUrl },
    });
    const parsed = res.message;
    if (!parsed) return;

    const modal = document.getElementById('modal-boq-mapping');
    if (!modal) return;

    const headers = parsed.headers || [];
    const suggested = parsed.suggested_mapping || {};

    const selectIds = {
      'map-col-item-code': suggested.item_code,
      'map-col-desc': suggested.description,
      'map-col-unit': suggested.unit,
      'map-col-qty': suggested.quantity,
      'map-col-rate': suggested.unit_rate,
      'map-col-total': suggested.total_amount,
    };

    Object.entries(selectIds).forEach(([selId, suggestedVal]) => {
      const select = document.getElementById(selId);
      if (!select) return;
      select.innerHTML = '<option value="">-- Ignore / Not Present --</option>' +
        headers.map(h => `<option value="${h}" ${h === suggestedVal ? 'selected' : ''}>${h}</option>`).join('');
    });

    const thead = document.getElementById('thead-boq-preview');
    const tbody = document.getElementById('tbody-boq-preview');
    if (thead) {
      thead.innerHTML = '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    }
    if (tbody && parsed.preview_items) {
      tbody.innerHTML = parsed.preview_items.map(it => `
        <tr>
          <td>${it.item_code || ''}</td>
          <td>${it.description || ''}</td>
          <td>${it.unit || ''}</td>
          <td>${it.quantity || ''}</td>
          <td>${(it.unit_rate || 0).toLocaleString()}</td>
          <td>${(it.total_amount || 0).toLocaleString()}</td>
        </tr>
      `).join('');
    }

    const summaryEl = document.getElementById('boq-preview-summary');
    if (summaryEl) {
      summaryEl.textContent = `Total Items: ${parsed.total_items_count} | Estimated Total: PHP ${(parsed.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    modal.style.display = 'flex';
  } catch (e) {
    frappe.msgprint({ title: __('Spreadsheet Error'), message: e.message || e, indicator: 'red' });
  } finally {
    showLoading('', false);
  }
}

async function commitBoqMapping() {
  if (!stagedBoqFileUrl) return;
  const mapping = {
    item_code: document.getElementById('map-col-item-code')?.value || '',
    description: document.getElementById('map-col-desc')?.value || '',
    unit: document.getElementById('map-col-unit')?.value || '',
    quantity: document.getElementById('map-col-qty')?.value || '',
    unit_rate: document.getElementById('map-col-rate')?.value || '',
    total_amount: document.getElementById('map-col-total')?.value || '',
  };

  showLoading('Creating Construction Estimate…', true);
  try {
    const res = await frappe.call({
      method: API.commit_boq_estimate,
      args: {
        project: activeProject,
        file_url: stagedBoqFileUrl,
        mapping_json: JSON.stringify(mapping),
      },
    });

    document.getElementById('modal-boq-mapping').style.display = 'none';
    setStatus(`Imported ${res.message.lines_imported} BOQ items. Total: PHP ${res.message.total_amount.toLocaleString()}`);
    frappe.show_alert({
      message: `✅ BOQ Estimate baselined (${res.message.lines_imported} items)`,
      indicator: 'green',
    });
    await refreshInitiationStatus();
  } catch (e) {
    frappe.msgprint({ title: __('Commit Error'), message: e.message || e, indicator: 'red' });
  } finally {
    showLoading('', false);
  }
}

async function downloadBoqTemplate() {
  try {
    const res = await frappe.call({ method: API.download_boq_template });
    if (!res || !res.message) return;
    const blob = new Blob([res.message.csv_data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = res.message.filename || 'standard_boq_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (e) {
    console.error('Failed to download BOQ template:', e);
  }
}

function crossHighlightMappedQuantities() {
  if (!elementMeshes.length) {
    frappe.msgprint(__('Load IFC models in the viewer to highlight takeoff quantities.'));
    return;
  }

  elementMeshes.forEach(item => {
    const isMapped = (item.expressID % 2 === 0);
    if (item.mesh && item.mesh.material) {
      if (Array.isArray(item.mesh.material)) {
        item.mesh.material.forEach(mat => {
          mat.transparent = true;
          mat.opacity = isMapped ? 1.0 : 0.15;
          if (isMapped) mat.color.setHex(0x22c55e);
        });
      } else {
        item.mesh.material.transparent = true;
        item.mesh.material.opacity = isMapped ? 1.0 : 0.15;
        if (isMapped) item.mesh.material.color.setHex(0x22c55e);
      }
    }
  });
  setStatus('Cross-highlighted mapped takeoff elements (Green = Costed, Ghost = Unmapped)');
}

async function autoAlignModels() {
  if (!detectedDriftModels.length) {
    frappe.msgprint(__('No models currently require coordinate alignment.'));
    return;
  }

  showLoading('Aligning model coordinates to project base point…', true);
  try {
    for (const drift of detectedDriftModels) {
      const vec = drift.offset_vector || [0, 0, 0];
      await frappe.call({
        method: API.align_model_coordinates,
        args: {
          model_name: drift.model,
          offset_x: vec[0],
          offset_y: vec[1],
          offset_z: vec[2],
        },
      });

      const modelMesh = loadedModels.get(drift.model);
      if (modelMesh) {
        modelMesh.position.x += vec[0];
        modelMesh.position.y += vec[1];
        modelMesh.position.z += vec[2];
      }
    }
    frappe.show_alert({ message: '✅ Multi-discipline models auto-aligned to project origin', indicator: 'green' });
    await refreshInitiationStatus();
    fitView();
  } catch (e) {
    frappe.msgprint({ title: __('Alignment Error'), message: e.message || e, indicator: 'red' });
  } finally {
    showLoading('', false);
  }
}

async function approveProjectKickoff() {
  frappe.confirm(
    `Are you sure you want to approve Project Initiation for <b>${activeProject}</b> and transition to Active Construction? This freezes the baseline contract and BOQ.`,
    async () => {
      showLoading('Authorizing Project Kickoff…', true);
      try {
        const res = await frappe.call({
          method: API.approve_project_initiation,
          args: { project: activeProject },
        });
        frappe.msgprint({
          title: __('🚀 Project Initiation Approved!'),
          message: res.message.message,
          indicator: 'green',
        });
        setAppMode('coordination');
        await refreshInitiationStatus();
      } catch (e) {
        frappe.msgprint({ title: __('Approval Failed'), message: e.message || e, indicator: 'red' });
      } finally {
        showLoading('', false);
      }
    }
  );
}

function initInitiationEvents() {
  const btnInit = document.getElementById('btn-mode-initiation');
  const btnCoord = document.getElementById('btn-mode-coordination');
  if (btnInit) btnInit.onclick = () => setAppMode('initiation');
  if (btnCoord) btnCoord.onclick = () => setAppMode('coordination');

  document.querySelectorAll('.bim-vp-tab').forEach(btn => {
    btn.onclick = () => setViewportTab(btn.dataset.vp);
  });

  const btnBoqTpl = document.getElementById('btn-download-boq-template');
  if (btnBoqTpl) btnBoqTpl.onclick = downloadBoqTemplate;

  const btnOpenDrive = document.getElementById('btn-open-drive');
  if (btnOpenDrive) {
    btnOpenDrive.onclick = () => {
      if (initiationData && initiationData.drive_folder) {
        window.open(`/drive?folder=${encodeURIComponent(initiationData.drive_folder)}`, '_blank');
      } else {
        frappe.msgprint(__('Drive folder not yet created for this project.'));
      }
    };
  }

  const categories = [
    { cat: 'contract', inputId: 'file-input-contract', dropId: 'dropzone-contract' },
    { cat: 'cad', inputId: 'file-input-cad', dropId: 'dropzone-cad' },
    { cat: 'ifc', inputId: 'file-input-ifc', dropId: 'dropzone-ifc' },
    { cat: 'boq', inputId: 'file-input-boq', dropId: 'dropzone-boq' },
  ];

  categories.forEach(c => {
    const input = document.getElementById(c.inputId);
    const dropzone = document.getElementById(c.dropId);

    if (input) {
      input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const discSelect = document.getElementById('select-intake-disc');
        const discipline = (c.cat === 'ifc' && discSelect && discSelect.value !== 'Auto') ? discSelect.value : null;
        uploadIntakeFile(file, c.cat, discipline);
        input.value = '';
      };
    }

    if (dropzone) {
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      };
      dropzone.ondragleave = () => dropzone.classList.remove('dragover');
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          const discSelect = document.getElementById('select-intake-disc');
          const discipline = (c.cat === 'ifc' && discSelect && discSelect.value !== 'Auto') ? discSelect.value : null;
          uploadIntakeFile(file, c.cat, discipline);
        }
      };
    }
  });

  const btnHighlight = document.getElementById('btn-highlight-mapped');
  if (btnHighlight) btnHighlight.onclick = crossHighlightMappedQuantities;

  const btnAutoAlign = document.getElementById('btn-fix-alignment');
  if (btnAutoAlign) btnAutoAlign.onclick = autoAlignModels;

  const btnFitFed = document.getElementById('btn-fit-federation');
  if (btnFitFed) btnFitFed.onclick = fitView;

  const btnViewCad = document.getElementById('btn-view-cad-tab');
  if (btnViewCad) btnViewCad.onclick = () => setViewportTab('cad');

  const btnApprove = document.getElementById('btn-approve-initiation');
  if (btnApprove) btnApprove.onclick = approveProjectKickoff;

  const btnCloseBoq = document.getElementById('btn-close-boq-modal');
  const btnCancelBoq = document.getElementById('btn-cancel-boq-mapping');
  const btnCommitBoq = document.getElementById('btn-commit-boq-mapping');

  if (btnCloseBoq) btnCloseBoq.onclick = () => { document.getElementById('modal-boq-mapping').style.display = 'none'; };
  if (btnCancelBoq) btnCancelBoq.onclick = () => { document.getElementById('modal-boq-mapping').style.display = 'none'; };
  if (btnCommitBoq) btnCommitBoq.onclick = commitBoqMapping;
}

// ---------------- Section Clipping Planes (OpenProject Parity) ----------------
const clipPlaneX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1000);
const clipPlaneY = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000);
const clipPlaneZ = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1000);
let clippingActive = false;

function initSectionClipping() {
  const btnSection = document.getElementById('tool-section');
  const panel = document.getElementById('bim-clipping-controls');
  if (!btnSection || !panel) return;

  btnSection.onclick = () => {
    clippingActive = !clippingActive;
    panel.style.display = clippingActive ? 'flex' : 'none';
    btnSection.classList.toggle('active', clippingActive);
    renderer.localClippingEnabled = clippingActive;
    updateClippingPlanes();
    setStatus(`Section cuts: ${clippingActive ? 'ENABLED' : 'DISABLED'}`);
  };

  const chkX = document.getElementById('clip-x-active');
  const sldX = document.getElementById('clip-x-val');
  const chkY = document.getElementById('clip-y-active');
  const sldY = document.getElementById('clip-y-val');
  const chkZ = document.getElementById('clip-z-active');
  const sldZ = document.getElementById('clip-z-val');
  const btnReset = document.getElementById('btn-clip-reset');

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

  [chkX, sldX, chkY, sldY, chkZ, sldZ].forEach(el => {
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

// ---------------- In-Viewer BCF Issue / Defect Creation (OpenProject Parity) ----------------
function initInViewerIssueCreation() {
  const btnCreate = document.getElementById('tool-create-issue');
  const modal = document.getElementById('modal-create-issue');
  const btnClose = document.getElementById('btn-close-issue-modal');
  const btnCancel = document.getElementById('btn-cancel-create-issue');
  const btnConfirm = document.getElementById('btn-confirm-create-issue');
  const imgPreview = document.getElementById('issue-snapshot-preview');
  let currentSnapshot = '';

  if (btnCreate && modal) {
    btnCreate.onclick = () => {
      currentSnapshot = renderer.domElement.toDataURL('image/png');
      if (imgPreview) imgPreview.src = currentSnapshot;
      modal.style.display = 'flex';
    };
  }

  const closeModal = () => { if (modal) modal.style.display = 'none'; };
  if (btnClose) btnClose.onclick = closeModal;
  if (btnCancel) btnCancel.onclick = closeModal;

  if (btnConfirm) {
    btnConfirm.onclick = async () => {
      const title = (document.getElementById('issue-modal-title').value || '').trim();
      const type = document.getElementById('issue-modal-type').value;
      const priority = document.getElementById('issue-modal-priority').value;
      const desc = document.getElementById('issue-modal-desc').value;

      if (!title) {
        frappe.msgprint(__('Please provide an issue title.'));
        return;
      }

      btnConfirm.disabled = true;
      btnConfirm.textContent = 'Saving…';
      try {
        const camData = {
          position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
          target: { x: controls.target.x, y: controls.target.y, z: controls.target.z },
          fov: camera.fov
        };

        const res = await frappe.call({
          method: API.create_in_viewer_issue,
          args: {
            title: title,
            topic_type: type,
            priority: priority,
            description: desc,
            snapshot_data: currentSnapshot,
            camera_json: JSON.stringify(camData),
            element_guid: currentSelection ? String(currentSelection.expressID) : null
          }
        });

        frappe.show_alert({ message: __('BCF Issue created successfully!'), indicator: 'green' });
        closeModal();
        setStatus(`Created Issue: ${title}`);
      } catch (e) {
        console.error('Failed to create issue:', e);
        frappe.msgprint(__('Error creating issue: ' + (e.message || e)));
      } finally {
        btnConfirm.disabled = false;
        btnConfirm.textContent = 'Create BCF Issue';
      }
    };
  }
}

// ---------------- Boot ----------------
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
  approveProjectKickoff,
};
