import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/construction_bim/js/pdfjs/pdf.worker.min.mjs';

const API = {
  save_measurement: 'construction_bim.bim.api.save_measurement',
  list_measurements: 'construction_bim.bim.api.list_measurements',
  delete_measurement: 'construction_bim.bim.api.delete_measurement',
};

const els = {
  canvasWrap: document.getElementById('pdf-canvas-wrap'),
  canvas: document.getElementById('pdf-canvas'),
  ctx: document.getElementById('pdf-canvas').getContext('2d'),
  doclist: document.getElementById('pdf-doclist'),
  fileInput: document.getElementById('pdf-file-input'),
  openBtn: document.getElementById('pdf-open'),
  status: document.getElementById('pdf-status'),
  pgLabel: document.getElementById('pg-label'),
  zLabel: document.getElementById('z-label'),
  scalePreset: document.getElementById('scale-preset'),
  scaleCalibrate: document.getElementById('scale-calibrate'),
  scaleKnown: document.getElementById('scale-known'),
  scaleKnownMm: document.getElementById('scale-known-mm'),
  scaleKnownOk: document.getElementById('scale-known-ok'),
  calibHint: document.getElementById('calib-hint'),
  scaleDisplay: document.getElementById('scale-display'),
  measureList: document.getElementById('measure-list'),
  measCount: document.getElementById('meas-count'),
};

// ---------------- state ----------------
const state = {
  pdf: null,
  page: null,
  pageNo: 1,
  numPages: 1,
  viewport: null,
  zoom: 1.0,
  // scale: pixelsPerMeter at base render resolution (zoom=1)
  pixelsPerMeter: 0,
  unitLabel: 'm',
  docName: null,       // File doc name
  docUrl: null,
  measurements: [],    // {id, type, points(pdf units), ...}
  draft: [],           // in-progress measurement points (pdf units)
  tool: 'dist',
  calibrationDraft: null, // {pdfUnits:[{x,y},{x,y}]}
  redrawPending: false,
};

// PDF user units: 1pt = 1/72 inch. Render at 96 DPI by default (scale 1.333).
const PDF_DPI = 96;
const RENDER_SCALE = PDF_DPI / 72;

// ---------------- document list ----------------
async function loadDocuments() {
  try {
    const res = await frappe.call({
      method: 'frappe.client.get_list',
      args: {
        doctype: 'File',
        filters: [['file_name', 'like', '%.pdf'], ['is_folder', '=', 0]],
        fields: ['name', 'file_name', 'file_url'],
        limit_page_length: 50,
        order_by: 'creation desc',
      },
    });
    const docs = res.message || [];
    els.doclist.innerHTML = '';
    if (!docs.length) { els.doclist.innerHTML = '<div class="empty-hint" style="color:var(--text-muted,#8d99a6);font-size:12px">No PDFs in File library</div>'; return; }
    docs.forEach(d => {
      const el = document.createElement('div');
      el.className = 'pdf-doc-item';
      el.innerHTML = `<span>${d.file_name}</span>`;
      el.onclick = () => openPdf(d.file_url, d.name, d.file_name);
      els.doclist.appendChild(el);
    });
  } catch (e) { /* non-fatal */ }
}

async function openPdf(url, name, fname) {
  els.status.textContent = 'Loading ' + (fname || url) + '…';
  try {
    const abs = url.startsWith('/') ? url : '/' + url;
    const pdf = await pdfjsLib.getDocument(abs).promise;
    state.pdf = pdf;
    state.numPages = pdf.numPages;
    state.pageNo = 1;
    state.docName = name;
    state.docUrl = url;
    state.measurements = [];
    state.draft = [];
    state.pixelsPerMeter = 0;
    state.zoom = 1;
    document.querySelectorAll('.pdf-doc-item').forEach(el => el.classList.toggle('active', el.textContent.includes(fname || '')));
    await renderPage();
    await loadMeasurements();
    els.status.textContent = `${fname} — ${pdf.numPages} pages. Calibrate scale to measure.`;
  } catch (e) {
    els.status.textContent = 'Failed to load PDF: ' + (e.message || e);
  }
}

async function renderPage() {
  if (!state.pdf) return;
  const page = await state.pdf.getPage(state.pageNo);
  state.page = page;
  state.viewport = page.getViewport({ scale: RENDER_SCALE });
  const px = Math.floor(state.viewport.width * state.zoom);
  const py = Math.floor(state.viewport.height * state.zoom);
  els.canvas.width = px;
  els.canvas.height = py;
  els.canvas.style.width = px + 'px';
  els.canvas.style.height = py + 'px';
  els.ctx.setTransform(state.zoom, 0, 0, state.zoom, 0, 0);
  els.ctx.fillStyle = '#fff';
  els.ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);
  const renderTask = page.render({
    canvasContext: els.ctx,
    viewport: state.viewport,
    transform: [state.zoom, 0, 0, state.zoom, 0, 0],
  });
  await renderTask.promise;
  els.pgLabel.textContent = `${state.pageNo} / ${state.numPages}`;
  els.zLabel.textContent = Math.round(state.zoom * 100) + '%';
  drawMarks(els.ctx);
}

function redrawMarks() {
  if (!state.page) return;
  // redraw the page + all marks (simple and robust at takeoff scale)
  renderPage();
}

function drawMarks(ctx) {
  if (!state.page) return;
  const vp = state.viewport;
  const toPx = (p) => ({ x: p.x * state.zoom, y: p.y * state.zoom });

  // calibration line (dashed green)
  if (state.calibrationDraft && state.calibrationDraft.pdfUnits.length === 2) {
    const [a, b] = state.calibrationDraft.pdfUnits.map(toPx);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.setLineDash([]);
  }

  // measurements
  state.measurements.forEach(m => {
    const pts = (m.points || []).map(toPx);
    ctx.strokeStyle = m.type === 'highlight' ? 'rgba(255,209,102,.45)' : '#e74c3c';
    ctx.fillStyle = m.type === 'highlight' ? 'rgba(255,209,102,.35)' : 'rgba(231,76,60,.25)';
    ctx.lineWidth = m.type === 'highlight' ? 18 : 1.6;
    if (m.type === 'distance' && pts.length === 2) {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(pts[1].x, pts[1].y); ctx.stroke();
      drawTick(ctx, pts[0]); drawTick(ctx, pts[1]);
      if (m.real_value) drawLabel(ctx, pts[1], m.real_value + ' ' + m.unit);
    } else if (m.type === 'rect' && pts.length === 2) {
      const w = pts[1].x - pts[0].x, h = pts[1].y - pts[0].y;
      ctx.fillRect(pts[0].x, pts[0].y, w, h);
      ctx.strokeRect(pts[0].x, pts[0].y, w, h);
      if (m.real_value) drawLabel(ctx, { x: pts[0].x, y: pts[0].y - 6 }, m.real_value + ' ' + m.unit);
    } else if (pts.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      if (m.type === 'area' || m.type === 'highlight') ctx.closePath();
      ctx.stroke();
      if (m.type === 'area' && m.real_value) drawLabel(ctx, pts[0], m.real_value + ' ' + m.unit);
      if (m.type === 'polyline' && m.real_value) drawLabel(ctx, pts[pts.length - 1], m.real_value + ' ' + m.unit);
    } else if (m.type === 'count' && pts.length) {
      drawLabel(ctx, pts[0], String(m.real_value || pts.length));
    }
  });

  // draft in progress
  const draftPts = state.draft.map(toPx);
  if (draftPts.length) {
    ctx.strokeStyle = '#2490ef';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(draftPts[0].x, draftPts[0].y);
    for (let i = 1; i < draftPts.length; i++) ctx.lineTo(draftPts[i].x, draftPts[i].y);
    ctx.stroke();
    ctx.setLineDash([]);
    draftPts.forEach(p => drawTick(ctx, p));
  }
}

function drawTick(ctx, p) {
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
}

function drawLabel(ctx, p, text) {
  ctx.font = '12px sans-serif';
  const w = ctx.measureText(text).width + 8;
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.fillRect(p.x + 6, p.y - 16, w, 16);
  ctx.fillStyle = '#c0392b';
  ctx.fillText(text, p.x + 10, p.y - 4);
}

// ---------------- pointer -> pdf units ----------------
function pointerToPdfUnits(ev) {
  const rect = els.canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - rect.left) / state.zoom,
    y: (ev.clientY - rect.top) / state.zoom,
  };
}

// ---------------- tools & clicks ----------------
function setTool(tool) {
  state.tool = tool;
  state.draft = [];
  ['dist', 'poly', 'area', 'count', 'rect', 'highlight'].forEach(t =>
    document.getElementById('tool-' + t).classList.toggle('active', t === tool));
}

['dist', 'poly', 'area', 'count', 'rect', 'highlight'].forEach(t =>
  document.getElementById('tool-' + t).onclick = () => setTool(t));

els.canvas.addEventListener('click', async (ev) => {
  if (!state.page) return;
  const p = pointerToPdfUnits(ev);

  // calibration mode first
  if (state.calibrationDraft) {
    state.calibrationDraft.pdfUnits.push(p);
    if (state.calibrationDraft.pdfUnits.length === 2) {
      state.lastCalibrationLine = [...state.calibrationDraft.pdfUnits];
      state.calibrationDraft = null;
      els.scaleKnown.style.display = 'flex';
      els.calibHint.textContent = 'Enter the real length of the drawn line in mm, then press OK.';
      redrawMarks();
    } else {
      redrawMarks();
    }
    return;
  }

  if (state.tool === 'count') {
    const m = { id: null, type: 'count', points: [p], real_value: 1, unit: 'pcs' };
    state.measurements.push(m);
    state.draft = [];
    redrawMarks();
    saveMeasurement(m);
    return;
  }

  if (state.tool === 'dist' || state.tool === 'rect') {
    state.draft.push(p);
    if (state.draft.length === 2) {
      const m = { id: null, type: state.tool, points: [...state.draft], real_value: 0, unit: 'm' };
      state.draft = [];
      finalizeMeasurement(m);
      state.measurements.push(m);
      redrawMarks();
      saveMeasurement(m);
    } else {
      redrawMarks();
    }
    return;
  }

  if (state.tool === 'poly' || state.tool === 'area' || state.tool === 'highlight') {
    state.draft.push(p);
    // double-click to finish
    if (ev.detail >= 2) {
      const m = { id: null, type: state.tool, points: [...state.draft], real_value: 0, unit: state.tool === 'area' || state.tool === 'highlight' ? 'm²' : 'm' };
      state.draft = [];
      finalizeMeasurement(m);
      state.measurements.push(m);
      redrawMarks();
      saveMeasurement(m);
    } else {
      redrawMarks();
    }
  }
});

function finalizeMeasurement(m) {
  const ppm = state.pixelsPerMeter;
  if (!ppm) { m.real_value = 0; return; }
  const pts = m.points;
  const distPx = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const pxToM = (px) => px / ppm;
  if (m.type === 'distance') {
    m.real_value = pxToM(distPx(pts[0], pts[1]));
  } else if (m.type === 'rect') {
    const w = Math.abs(pts[1].x - pts[0].x), h = Math.abs(pts[1].y - pts[0].y);
    m.real_value = pxToM(w) * pxToM(h);
    m.unit = 'm²';
  } else if (m.type === 'polyline') {
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += distPx(pts[i - 1], pts[i]);
    m.real_value = pxToM(total);
  } else if (m.type === 'area' || m.type === 'highlight') {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    m.real_value = (Math.abs(area) / 2) / (ppm * ppm);
    m.unit = 'm²';
  }
  m.real_value = Math.round(m.real_value * 1000) / 1000;
}

// ---------------- scale ----------------
els.scalePreset.onchange = () => {
  const ratio = parseFloat(els.scalePreset.value);
  if (!ratio || !state.viewport) return;
  // pixels per meter at base render scale:
  // RENDER_SCALE * 72 pt/inch * (1 m / ratio m)  → px per metre on canvas (zoom=1)
  state.pixelsPerMeter = RENDER_SCALE * 72 * (1 / ratio) * 1000 / 1000;
  // cleaner: PDF units (pt) per metre = 72 * (1000 mm / (ratio*1000 mm))?? no:
  // 1 m at scale 1:ratio drawn in mm: real 1 m -> 1000/ratio mm on paper -> /25.4 in -> *72 pt
  state.pixelsPerMeter = 72 * (1000 / ratio) / 25.4 * RENDER_SCALE;
  state.unitLabel = 'm';
  els.scaleDisplay.textContent = `Scale 1:${ratio} — ${state.pixelsPerMeter.toFixed(1)} px/m (at 100%)`;
  els.calibHint.textContent = 'Scale set from preset. Draw measurements.';
  els.scaleKnown.style.display = 'none';
  // recompute existing measurements
  state.measurements.forEach(m => finalizeMeasurement(m));
  redrawMarks();
  renderMeasurementList();
};

els.scaleCalibrate.onclick = () => {
  state.calibrationDraft = { pdfUnits: [] };
  els.calibHint.textContent = 'Click two points on the drawing that are a KNOWN distance apart.';
  els.scaleKnown.style.display = 'none';
};

els.scaleKnownOk.onclick = () => {
  const mm = parseFloat(els.scaleKnownMm.value);
  if (!mm || !state.calibrationDraft) return;
  // calibration line was drawn before we nulled the draft — recompute from stored pdfUnits
  const pts = state.lastCalibrationLine;
  if (!pts || pts.length < 2) return;
  const px = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  state.pixelsPerMeter = px / (mm / 1000);
  state.unitLabel = 'm';
  els.scaleDisplay.textContent = `Calibrated: ${state.pixelsPerMeter.toFixed(1)} px/m — 1px = ${(mm / px * 1000).toFixed(2)} mm`;
  els.calibHint.textContent = 'Calibration set. Draw measurements.';
  els.scaleKnown.style.display = 'none';
  state.calibrationDraft = null;
  state.measurements.forEach(m => finalizeMeasurement(m));
  redrawMarks();
  renderMeasurementList();
};

// keep the drawn calibration line accessible
let lastCalibrationLine = null;
state.lastCalibrationLine = lastCalibrationLine;

// ---------------- zoom / pages ----------------
document.getElementById('z-in').onclick = () => { state.zoom = Math.min(4, state.zoom * 1.2); renderPage(); };
document.getElementById('z-out').onclick = () => { state.zoom = Math.max(.2, state.zoom / 1.2); renderPage(); };
document.getElementById('pg-prev').onclick = async () => { if (state.pageNo > 1) { state.pageNo--; await renderPage(); } };
document.getElementById('pg-next').onclick = async () => { if (state.pageNo < state.numPages) { state.pageNo++; await renderPage(); } };

// ---------------- persistence ----------------
async function saveMeasurement(m) {
  if (!state.docName) return;
  try {
    const res = await frappe.call({
      method: API.save_measurement,
      args: {
        pdf_file: state.docName,
        page_no: state.pageNo,
        measurement_type: m.type,
        points: JSON.stringify(m.points),
        scale: JSON.stringify({ pixelsPerMeter: state.pixelsPerMeter, unitLabel: state.unitLabel }),
        real_value: m.real_value,
        unit: m.unit,
      },
    });
    m.id = res.message.name;
    renderMeasurementList();
  } catch (e) {
    els.status.textContent = 'Save failed: ' + (e._server_messages ? JSON.parse(e._server_messages)[0] : e.message);
  }
}

async function loadMeasurements() {
  if (!state.docName) return;
  const res = await frappe.call({ method: API.list_measurements, args: { pdf_file: state.docName } });
  state.measurements = (res.message || []).filter(m => m.page_no === state.pageNo).map(m => ({
    id: m.name, type: m.measurement_type, points: JSON.parse(m.points || '[]'),
    real_value: m.real_value, unit: m.unit,
  }));
  renderMeasurementList();
  redrawMarks();
}

function renderMeasurementList() {
  els.measCount.textContent = state.measurements.length ? `(${state.measurements.length})` : '';
  if (!state.measurements.length) {
    els.measureList.innerHTML = '<div class="empty-hint" style="color:var(--text-muted,#8d99a6);font-size:12px">No measurements yet</div>';
    return;
  }
  els.measureList.innerHTML = state.measurements.map(m => `
    <div class="meas-item">
      <span>${m.type} — ${m.real_value ? m.real_value + ' ' + m.unit : 'uncalibrated'}</span>
      <button class="del" data-id="${m.id || ''}">✕</button>
    </div>`).join('');
  els.measureList.querySelectorAll('.del').forEach(b => b.onclick = async () => {
    const id = b.dataset.id;
    if (id) await frappe.call({ method: API.delete_measurement, args: { measurement: id } });
    state.measurements = state.measurements.filter(m => (m.id || '') !== id);
    renderMeasurementList();
    redrawMarks();
  });
}

document.getElementById('meas-undo').onclick = () => {
  if (state.draft.length) { state.draft.pop(); redrawMarks(); }
};
document.getElementById('meas-clear').onclick = () => {
  state.measurements = [];
  state.draft = [];
  renderMeasurementList();
  redrawMarks();
};

// upload flow
els.openBtn.onclick = () => els.fileInput.click();
els.fileInput.onchange = async () => {
  const file = els.fileInput.files[0];
  if (!file) return;
  try {
    const res = await frappe.call({
      method: 'upload_file',
      args: { is_private: 0, doctype: 'File', docname: 'new' },
      files: [file],
    });
    const f = res.message;
    loadDocuments();
    await openPdf(f.file_url, f.name, f.file_name);
  } catch (e) {
    els.status.textContent = 'Upload failed: ' + (e._server_messages ? JSON.parse(e._server_messages)[0] : e.message);
  } finally {
    els.fileInput.value = '';
  }
};

// ---------------- boot ----------------
loadDocuments();
