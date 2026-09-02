import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';


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
};

const els = {
  models: document.getElementById('bim-models'),
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
};

// ---------------- three.js scene ----------------
const renderer = new THREE.WebGLRenderer({ canvas: els.canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14181d);
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5000);
camera.position.set(20, 15, 25);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 1.0));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(30, 50, 20);
scene.add(keyLight);

// grid
const grid = new THREE.GridHelper(100, 20, 0x3a4250, 0x2a3038);
grid.position.y = -0.02;
scene.add(grid);

let modelGroup = null;        // the GLB scene root we load
let elementMeshes = [];       // {mesh, element}
let currentModel = null;
let currentSelection = null;  // {mesh, element}
let activeTool = 'orbit';
let clipBox = null;
let wireframeMode = false;

const highlightMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0x663d00, emissiveIntensity: .35 });

function resize() {
  const w = els.canvas.clientWidth || 800, h = els.canvas.clientHeight || 600;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

function setStatus(msg) { els.status.textContent = msg; }
function showLoading(msg, on) {
  els.loading.style.display = on ? 'flex' : 'none';
  if (on) els.loading.textContent = msg;
}

// ---------------- models ----------------
async function loadModels() {
  setStatus('Loading models…');
  try {
    const res = await frappe.call({ method: API.list_models });
    const models = res.message || [];
    setStatus('Models API returned ' + models.length + ' models');
    els.models.innerHTML = '';
    if (!models.length) { els.models.innerHTML = '<div class="empty-hint">No models yet</div>'; return; }
    models.forEach(m => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'bim-model-item' + (currentModel && currentModel.name === m.name ? ' active' : '');
      d.innerHTML = `<span>${m.model_name}</span><span class="cnt">${m.element_count} el</span>`;
      d.onclick = () => selectModel(m.name);
      els.models.appendChild(d);
    });
  } catch (e) {
    setStatus('loadModels failed: ' + (e && (e.message || JSON.stringify(e))));
  }
}

async function selectModel(name) {
  setStatus('selectModel called for ' + name);
  showLoading('Loading model…', true);
  try {
    const res = await frappe.call({ method: API.get_model, args: { model: name } });
    currentModel = res.message;
    clearSelection();
    await loadGeometry(name);
    await loadElements(name);
    populateFacets();
    fitView();
    loadViewpoints();
    setStatus(`${currentModel.model_name} — ${currentModel.element_count} elements`);
    document.querySelectorAll('.bim-model-item').forEach(el => el.classList.toggle('active', el.textContent.includes(currentModel.model_name)));
  } catch (e) {
    setStatus('Failed to load model: ' + (e._server_messages ? JSON.parse(e._server_messages)[0] : e.message));
  } finally {
    showLoading('', false);
  }
}

async function loadGeometry(name) {
  if (modelGroup) { scene.remove(modelGroup); modelGroup = null; elementMeshes = []; }
  const res = await frappe.call({ method: API.get_model, args: { model: name } });
  const url = res.message.geometry_file;
  if (!url) { setStatus('Model has no geometry'); return; }
  const abs = url.startsWith('/') ? url : '/' + url;
  const loader = new GLTFLoader();
  try {
    const gltf = await loader.loadAsync(abs);
    modelGroup = gltf.scene;
    scene.add(modelGroup);
    // register meshes, store node name -> mesh
    modelGroup.traverse(o => {
      if (o.isMesh) {
        o.userData.meshName = o.name || '';
      }
    });
  } catch (e) {
    setStatus('Geometry load failed: ' + (e.message || e));
  }
}

let elementIndex = new Map(); // mesh_ref -> element row
async function loadElements(name) {
  const res = await frappe.call({ method: API.list_elements, args: { model: name, filters: '{}', limit: 20000 } });
  const data = res.message;
  elementIndex = new Map();
  (data.elements || []).forEach(el => elementIndex.set(el.mesh_ref, el));
  // map meshes to elements
  elementMeshes = [];
  if (modelGroup) {
    modelGroup.traverse(o => {
      if (o.isMesh) {
        const el = elementIndex.get(o.name) || elementIndex.get('e' + o.name);
        if (el) { o.userData.element = el; elementMeshes.push({ mesh: o, element: el }); }
      }
    });
  }
}

// ---------------- selection ----------------
function clearSelection() {
  currentSelection = null;
  els.props.innerHTML = '<div class="empty-hint">No selection</div>';
  els.propsTitle.textContent = 'Click an element in the viewer';
  els.propsTitle.className = 'empty-hint';
  els.links.innerHTML = '<div class="empty-hint">No links</div>';
  elementMeshes.forEach(({ mesh }) => {
    if (mesh.userData.origColor) { mesh.material.color.copy(mesh.userData.origColor); }
    mesh.material.emissive && mesh.material.emissive.setHex(0x000000);
  });
}

function selectElement(mesh) {
  clearSelection();
  currentSelection = { mesh, element: mesh.userData.element };
  if (!mesh.userData.origColor) mesh.userData.origColor = mesh.material.color.clone();
  mesh.material.color.copy(highlightMat.color);
  mesh.material.emissive && mesh.material.emissive.copy(highlightMat.emissive);
  renderElementPanel(mesh.userData.element);
}

function renderElementPanel(el) {
  if (!el) return;
  els.propsTitle.textContent = `${el.name || el.element_type} (${el.stable_id})`;
  els.propsTitle.className = '';
  const html = [];
  html.push('<div><span class="bim-badge">' + (el.discipline || '—') + '</span><span class="bim-badge">' + (el.storey || 'no storey') + '</span></div>');
  const q = el.quantities || {};
  const qKeys = Object.keys(q);
  if (qKeys.length) {
    html.push('<div style="margin:8px 0 4px;font-weight:600">Quantities</div><table>');
    qKeys.forEach(k => html.push(`<tr><td>${k}</td><td>${q[k]}</td></tr>`));
    html.push('</table>');
  }
  const p = el.properties || {};
  const pKeys = Object.keys(p).filter(k => !['ifc_id','ifc_type'].includes(k));
  if (pKeys.length) {
    html.push('<div style="margin:8px 0 4px;font-weight:600">Properties</div><table>');
    pKeys.slice(0, 60).forEach(k => html.push(`<tr><td>${k}</td><td>${p[k]}</td></tr>`));
    if (pKeys.length > 60) html.push(`<tr><td colspan="2">… ${pKeys.length - 60} more</td></tr>`);
    html.push('</table>');
  }
  els.props.innerHTML = html.join('');
  loadLinks(el.name);
}

async function loadLinks(bimElement) {
  const res = await frappe.call({ method: API.list_boq_links, args: { bim_element: bimElement } });
  const links = res.message || [];
  if (!links.length) { els.links.innerHTML = '<div class="empty-hint">No links</div>'; return; }
  els.links.innerHTML = links.map(l => `
    <div class="link-row">
      <span>${l.boq_reference_name} <span class="bim-badge">${l.boq_reference_type}</span></span>
      <button class="del" data-name="${l.name}">✕</button>
    </div>`).join('');
  els.links.querySelectorAll('.del').forEach(b => b.onclick = async () => {
    await frappe.call({ method: API.delete_boq_link, args: { link: b.dataset.name } });
    loadLinks(bimElement);
  });
}

// ---------------- tools ----------------
function setTool(tool) {
  activeTool = tool;
  document.querySelectorAll('#bim-hud button').forEach(b => b.classList.toggle('active', b.id === 'tool-' + tool));
  renderer.domElement.style.cursor = tool === 'measure' ? 'crosshair' : 'default';
}

els.canvas.addEventListener('click', (ev) => {
  if (activeTool === 'measure') { measureClick(ev); return; }
  if (activeTool !== 'select') return;
  const rect = els.canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((ev.clientX - rect.left) / rect.width) * 2 - 1,
    -((ev.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const meshes = elementMeshes.map(m => m.mesh);
  const hits = raycaster.intersectObjects(meshes, true);
  if (hits.length) {
    // walk up to the mesh node
    let obj = hits[0].object;
    while (obj && !obj.userData.element) obj = obj.parent;
    if (obj && obj.userData.element) selectElement(obj);
  }
});

// wireframe
document.getElementById('t-wireframe').onclick = () => {
  wireframeMode = !wireframeMode;
  elementMeshes.forEach(({ mesh }) => {
    if (mesh.material) {
      mesh.material.wireframe = wireframeMode;
    }
  });
};

function fitView() {
  if (!modelGroup) return;
  const box = new THREE.Box3().setFromObject(modelGroup);
  if (box.isEmpty()) return;
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const size = box.getSize(new THREE.Vector3()).length();
  camera.position.copy(sphere.center).add(new THREE.Vector3(size, size * 0.8, size * 0.7));
  controls.target.copy(sphere.center);
  controls.update();
}

document.getElementById('t-iso').onclick = () => {
  if (!modelGroup) return;
  const box = new THREE.Box3().setFromObject(modelGroup);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  camera.position.copy(center).add(new THREE.Vector3(size, size, size));
  controls.target.copy(center);
  controls.update();
};
document.getElementById('t-top').onclick = () => {
  if (!modelGroup) return;
  const box = new THREE.Box3().setFromObject(modelGroup);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  camera.position.set(center.x, center.z + size, center.z);
  camera.up.set(0, 0, 1);
  controls.target.copy(center);
  controls.update();
};
document.getElementById('t-front').onclick = () => {
  if (!modelGroup) return;
  const box = new THREE.Box3().setFromObject(modelGroup);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3()).length();
  camera.position.set(center.x - size, center.y, center.z);
  camera.up.set(0, 1, 0);
  controls.target.copy(center);
  controls.update();
};

// ---------------- measure ----------------
let measurePoints = [];
const measureLine = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({ color: 0xffd166, linewidth: 2 })
);
scene.add(measureLine);
const measureLabels = [];
function measureClick(ev) {
  const rect = els.canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((ev.clientX - rect.left) / rect.width) * 2 - 1,
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
      setStatus('Measure: click second point');
    }
  }
}
document.getElementById('tool-measure').onclick = () => setTool('measure');
document.getElementById('tool-orbit').onclick = () => setTool('orbit');
document.getElementById('tool-select').onclick = () => setTool('select');

// ---------------- clip (section box) ----------------
document.getElementById('tool-clip').onclick = () => {
  if (activeTool !== 'clip') { setTool('clip'); setStatus('Clip mode: click-drag on model to draw a section box'); }
  else setTool('orbit');
};
let clipDragStart = null;
els.canvas.addEventListener('mousedown', ev => { if (activeTool === 'clip') clipDragStart = ev; });
els.canvas.addEventListener('mouseup', ev => {
  if (activeTool !== 'clip' || !clipDragStart) return;
  const rect = els.canvas.getBoundingClientRect();
  const ndc = (x, y) => new THREE.Vector2(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
  const raycaster = new THREE.Raycaster();
  const a = ndc(clipDragStart.clientX, clipDragStart.clientY);
  const b = ndc(ev.clientX, ev.clientY);
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const va = new THREE.Vector3(), vb = new THREE.Vector3();
  raycaster.setFromCamera(a, camera); raycaster.ray.intersectPlane(plane, va);
  raycaster.setFromCamera(b, camera); raycaster.ray.intersectPlane(plane, vb);
  clipDragStart = null;
  if (!va || !vb) return;
  const min = new THREE.Vector3(Math.min(va.x, vb.x), Math.min(va.y, vb.y), Math.min(va.z, vb.z));
  const max = new THREE.Vector3(Math.max(va.x, vb.x), Math.max(va.y, vb.y), Math.max(va.z, vb.z));
  applyClip(min, max);
});
function applyClip(min, max) {
  if (clipBox) scene.remove(clipBox);
  clipBox = new THREE.Box3Helper(new THREE.Box3(min, max), 0xffd166);
  scene.add(clipBox);
  elementMeshes.forEach(({ mesh }) => {
    mesh.visible = meshVisible(mesh, min, max);
  });
  setStatus('Clip applied — elements outside the box hidden');
}
function meshVisible(mesh, min, max) {
  mesh.geometry.computeBoundingBox();
  const bb = mesh.geometry.boundingBox.clone();
  const world = new THREE.Vector3();
  mesh.getWorldPosition(world);
  bb.min.add(world); bb.max.add(world);
  return bb.min.x <= max.x && bb.max.x >= min.x && bb.min.y <= max.y && bb.max.y >= min.y && bb.min.z <= max.z && bb.max.z >= min.z;
}
document.getElementById('t-reset').onclick = () => {
  if (clipBox) { scene.remove(clipBox); clipBox = null; }
  elementMeshes.forEach(({ mesh }) => mesh.visible = true);
  setStatus('Clip reset');
};

// ---------------- color by property ----------------
let colorMode = 0;
const PROP_COLORS = [0x4a90d9, 0x50c878, 0xff8c42, 0xc77dff, 0xffd166, 0x4dd0e1];
const COLOR_PROPS = ['discipline', 'element_type', 'storey'];
document.getElementById('btn-color-prop').onclick = () => {
  colorMode = (colorMode + 1) % 3;
  const prop = COLOR_PROPS[colorMode];
  const palette = new Map();
  let i = 0;
  elementMeshes.forEach(({ mesh, element }) => {
    const key = element[prop] || 'other';
    if (!palette.has(key)) palette.set(key, PROP_COLORS[i++ % PROP_COLORS.length]);
    if (!mesh.userData.origColor) mesh.userData.origColor = mesh.material.color.clone();
    mesh.material.color.setHex(palette.get(key));
    mesh.material.emissive && mesh.material.emissive.setHex(0x000000);
  });
  if (currentSelection) {
    const m = currentSelection.mesh;
    m.material.color.copy(highlightMat.color);
    m.material.emissive && m.material.emissive.copy(highlightMat.emissive);
  }
  setStatus('Colored by ' + prop);
};

// ---------------- filters ----------------
function populateFacets() {
  frappe.call({ method: API.list_elements, args: { model: currentModel.name, filters: '{}', limit: 1 } }).then(res => {
    const facets = res.message.facets || {};
    ['fDiscipline', 'fStorey', 'fType'].forEach((id, i) => {
      const sel = els[id];
      const key = ['discipline', 'storey', 'element_type'][i];
      sel.innerHTML = `<option value="">${key}: all</option>`;
      (facets[key] || []).forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o); });
    });
  });
}
['fDiscipline', 'fStorey', 'fType'].forEach(id => els[id].addEventListener('change', applyFilters));
els.fSearch.addEventListener('input', debounce(applyFilters, 300));
document.getElementById('f-clear').onclick = () => {
  els.fDiscipline.value = ''; els.fStorey.value = ''; els.fType.value = ''; els.fSearch.value = '';
  applyFilters();
};
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
async function applyFilters() {
  if (!currentModel) return;
  const filters = {
    discipline: els.fDiscipline.value ? [els.fDiscipline.value] : [],
    storey: els.fStorey.value ? [els.fStorey.value] : [],
    element_type: els.fType.value ? [els.fType.value] : [],
    search: els.fSearch.value,
  };
  const res = await frappe.call({ method: API.list_elements, args: { model: currentModel.name, filters: JSON.stringify(filters), limit: 20000 } });
  const visible = new Set((res.message.elements || []).map(el => el.name));
  elementMeshes.forEach(({ mesh, element }) => {
    if (!clipBox) mesh.visible = visible.has(element.name);
    else if (visible.has(element.name)) mesh.visible = meshVisible(mesh, clipBox.box.min, clipBox.box.max);
    else mesh.visible = false;
  });
  setStatus(`${res.message.total} elements match filters`);
}

// ---------------- links ----------------
document.getElementById('nl-add').onclick = async () => {
  if (!currentSelection) { setStatus('Select an element first'); return; }
  const name = document.getElementById('nl-name').value.trim();
  if (!name) return;
  await frappe.call({
    method: API.create_boq_link,
    args: { bim_element: currentSelection.element.name, boq_reference_type: document.getElementById('nl-type').value, boq_reference_name: name },
  });
  document.getElementById('nl-name').value = '';
  loadLinks(currentSelection.element.name);
};

// ---------------- viewpoints ----------------
async function loadViewpoints() {
  if (!currentModel) return;
  const res = await frappe.call({ method: API.list_viewpoints, args: { model: currentModel.name } });
  const vps = res.message || [];
  els.viewpoints.innerHTML = '';
  if (!vps.length) { els.viewpoints.innerHTML = '<div class="empty-hint">No viewpoints saved</div>'; return; }
  vps.forEach(vp => {
    const d = document.createElement('div');
    d.className = 'link-row';
    d.innerHTML = `<span style="cursor:pointer">📷 ${vp.viewpoint_name}</span><button class="del" data-name="${vp.name}">✕</button>`;
    d.querySelector('span').onclick = () => restoreViewpoint(vp);
    d.querySelector('.del').onclick = async () => { await frappe.call({ method: API.delete_viewpoint, args: { viewpoint: vp.name } }); loadViewpoints(); };
    els.viewpoints.appendChild(d);
  });
}
function restoreViewpoint(vp) {
  const cam = typeof vp.camera === 'string' ? JSON.parse(vp.camera) : vp.camera;
  if (cam && cam.position) {
    camera.position.set(cam.position.x, cam.position.y, cam.position.z);
    controls.target.set(cam.target.x, cam.target.y, cam.target.z);
    controls.update();
    setStatus('Restored viewpoint ' + vp.viewpoint_name);
  }
}
document.getElementById('vp-save').onclick = async () => {
  if (!currentModel) return;
  const name = els.vpName.value.trim() || 'View ' + new Date().toLocaleTimeString();
  await frappe.call({
    method: API.save_viewpoint,
    args: {
      model: currentModel.name,
      viewpoint_name: name,
      camera: JSON.stringify({ position: camera.position.toJSON(), target: controls.target.toJSON() }),
    },
  });
  els.vpName.value = '';
  loadViewpoints();
};

// ---------------- upload ----------------
els.upload.onclick = () => els.fileInput.click();
els.fileInput.onchange = async () => {
  const file = els.fileInput.files[0];
  if (!file) return;
  showLoading('Uploading…', true);
  try {
    const uploadRes = await frappe.call({
      method: 'upload_file',
      args: { is_private: 0, doctype: 'BIM Model', docname: 'new' },
      files: [file],
    });
    const fileUrl = uploadRes.message.file_url;
    showLoading('Parsing IFC…', true);
    const createRes = await frappe.call({
      method: API.create_model,
      args: { file_url: fileUrl, file_name: file.name, model_name: file.name.replace(/\.ifc$/i, ''), discipline: 'Architecture' },
    });
    await loadModels();
    await selectModel(createRes.message.name);
    setStatus(`Imported ${createRes.message.element_count} elements`);
  } catch (e) {
    setStatus('Import failed: ' + (e._server_messages ? JSON.parse(e._server_messages)[0] : e.message));
  } finally {
    showLoading('', false);
    els.fileInput.value = '';
  }
};

// ---------------- boot ----------------
loadModels();