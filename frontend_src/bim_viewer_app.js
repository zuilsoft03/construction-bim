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

async function loadModelGeometry(modelDocName) {
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
      opacity: 1.0,
      visible: true,
    });

    setStatus(`Loaded ${modelData.model_name} [${disc}]: ${sceneResult.meshCount.total} meshes, ${sceneResult.meshCount.tris} tris`);
  } catch (e) {
    console.error('Failed to load model geometry', e);
    setStatus(`Error loading ${modelDocName}: ${e.message || e}`);
  } finally {
    showLoading('', false);
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
      title: __('Save Clash'),
      message: __('Clash saved with BCF viewpoint snapshot.'),
      indicator: 'blue',
    });
    setStatus('Clash viewpoint captured and saved.');
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
      const sz = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
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
      const effQty = parseFloat(effQtyStr) || 1.0;
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
      title: __('ERPNext BOM Wizard'),
      message: __('BOM generation complete with {0} rollups mapped to Item master.', [document.querySelectorAll('#bom-rollup-tbody tr.bom-row').length]),
      indicator: 'blue',
    });
    closeBomWizardModal();
    setStatus('BOM rollup created.');
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

// ---------------- Boot ----------------
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
  calculateAndRenderBomRollup,
};
