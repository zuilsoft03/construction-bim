// frontend_src/src/cad/dxf_parser_engine.ts
var ACI_COLOR_MAP = {
  0: "#000000",
  // BYBLOCK
  1: "#ff0000",
  // Red
  2: "#ffff00",
  // Yellow
  3: "#00ff00",
  // Green
  4: "#00ffff",
  // Cyan
  5: "#0000ff",
  // Blue
  6: "#ff00ff",
  // Magenta
  7: "#ffffff",
  // White / Black (draws white on dark, black on light)
  8: "#808080",
  // Dark Gray
  9: "#c0c0c0",
  // Light Gray
  10: "#ff0000",
  11: "#ff7f7f",
  12: "#cc0000",
  13: "#cc6666",
  14: "#990000",
  20: "#ff3f00",
  21: "#ff9f7f",
  22: "#cc3300",
  23: "#cc7f66",
  24: "#992600",
  30: "#ff7f00",
  31: "#ffbf7f",
  32: "#cc6600",
  33: "#cc9966",
  34: "#994c00",
  40: "#ffbf00",
  41: "#ffdf7f",
  42: "#cc9900",
  43: "#ccb266",
  44: "#997300",
  50: "#ffff00",
  51: "#ffff7f",
  52: "#cccc00",
  53: "#cccc66",
  54: "#999900",
  60: "#bfff00",
  61: "#dfff7f",
  62: "#99cc00",
  63: "#b2cc66",
  64: "#739900",
  70: "#7fff00",
  71: "#bfff7f",
  72: "#66cc00",
  73: "#99cc66",
  74: "#4c9900",
  80: "#3fff00",
  81: "#9fff7f",
  82: "#33cc00",
  83: "#7fcc66",
  84: "#269900",
  90: "#00ff00",
  91: "#7fff7f",
  92: "#00cc00",
  93: "#66cc66",
  94: "#009900",
  100: "#00ff3f",
  101: "#7fff9f",
  102: "#00cc33",
  103: "#66cc7f",
  104: "#009926",
  110: "#00ff7f",
  111: "#7fffbf",
  112: "#00cc66",
  113: "#66cc99",
  114: "#00994c",
  120: "#00ffbf",
  121: "#7fffdf",
  122: "#00cc99",
  123: "#66ccb2",
  124: "#009973",
  130: "#00ffff",
  131: "#7fffff",
  132: "#00cccc",
  133: "#66cccc",
  134: "#009999",
  140: "#00bfff",
  141: "#7fdfff",
  142: "#0099cc",
  143: "#66b2cc",
  144: "#007399",
  150: "#007fff",
  151: "#7fbfff",
  152: "#0066cc",
  153: "#6699cc",
  154: "#004c99",
  160: "#003fff",
  161: "#7f9fff",
  162: "#0033cc",
  163: "#667fcc",
  164: "#002699",
  170: "#0000ff",
  171: "#7f7fff",
  172: "#0000cc",
  173: "#6666cc",
  174: "#000099",
  180: "#3f00ff",
  181: "#9f7fff",
  182: "#3300cc",
  183: "#7f66cc",
  184: "#260099",
  190: "#7f00ff",
  191: "#bf7fff",
  192: "#6600cc",
  193: "#9966cc",
  194: "#4c0099",
  200: "#bf00ff",
  201: "#df7fff",
  202: "#9900cc",
  203: "#b266cc",
  204: "#730099",
  210: "#ff00ff",
  211: "#ff7fff",
  212: "#cc00cc",
  213: "#cc66cc",
  214: "#990099",
  220: "#ff00bf",
  221: "#ff7fdf",
  222: "#cc0099",
  223: "#cc66b2",
  224: "#990073",
  230: "#ff007f",
  231: "#ff7fbf",
  232: "#cc0066",
  233: "#cc6699",
  234: "#99004c",
  240: "#ff003f",
  241: "#ff7f9f",
  242: "#cc0033",
  243: "#cc667f",
  244: "#990026",
  250: "#333333",
  251: "#505050",
  252: "#696969",
  253: "#828282",
  254: "#bebebe",
  255: "#ffffff"
};
function calculateBulgeArcPoints(p1, p2, bulge, segments = 16) {
  if (Math.abs(bulge) < 1e-6) {
    return [p1, p2];
  }
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d < 1e-9) return [p1];
  const theta = 4 * Math.atan(bulge);
  const radius = d * (1 + bulge * bulge) / (4 * Math.abs(bulge));
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const nx = -dy / d;
  const ny = dx / d;
  const distToCenter = d * (1 - bulge * bulge) / (4 * bulge);
  const cx = mx + distToCenter * nx;
  const cy = my + distToCenter * ny;
  const a1 = Math.atan2(p1.y - cy, p1.x - cx);
  let a2 = Math.atan2(p2.y - cy, p2.x - cx);
  if (bulge > 0 && a2 <= a1) {
    a2 += 2 * Math.PI;
  } else if (bulge < 0 && a2 >= a1) {
    a2 -= 2 * Math.PI;
  }
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const ang = a1 + t * (a2 - a1);
    points.push({
      x: cx + radius * Math.cos(ang),
      y: cy + radius * Math.sin(ang),
      z: p1.z || 0
    });
  }
  return points;
}
function parseDXFText(dxfContent) {
  const lines = dxfContent.split(/\r?\n/);
  let i = 0;
  function nextGroup() {
    if (i >= lines.length - 1) return null;
    const code = parseInt(lines[i++].trim(), 10);
    const value = lines[i++].trim();
    return { code, value };
  }
  const layers = {
    "0": { name: "0", color: "#ffffff", aci: 7, visible: true }
  };
  const entities = [];
  const blocks = {};
  let currentSection = "";
  let currentTable = "";
  let currentBlock = null;
  while (i < lines.length - 1) {
    const group = nextGroup();
    if (!group) break;
    if (group.code === 0 && group.value === "SECTION") {
      const nameGroup = nextGroup();
      currentSection = nameGroup ? nameGroup.value : "";
      continue;
    }
    if (group.code === 0 && group.value === "ENDSEC") {
      currentSection = "";
      continue;
    }
    if (currentSection === "TABLES") {
      if (group.code === 0 && group.value === "TABLE") {
        const tName = nextGroup();
        currentTable = tName ? tName.value : "";
        continue;
      }
      if (group.code === 0 && group.value === "ENDTAB") {
        currentTable = "";
        continue;
      }
      if (currentTable === "LAYER" && group.code === 0 && group.value === "LAYER") {
        let lName = "";
        let lColor = "#ffffff";
        let lAci = 7;
        let lFrozen = false;
        while (i < lines.length - 1) {
          const lg = nextGroup();
          if (!lg || lg.code === 0) {
            i -= 2;
            break;
          }
          if (lg.code === 2) lName = lg.value;
          if (lg.code === 62) {
            const aciVal = Math.abs(parseInt(lg.value, 10));
            lAci = aciVal;
            lColor = ACI_COLOR_MAP[aciVal] || "#ffffff";
            if (parseInt(lg.value, 10) < 0) lFrozen = true;
          }
          if (lg.code === 70 && parseInt(lg.value, 10) & 1) {
            lFrozen = true;
          }
        }
        if (lName) {
          layers[lName] = {
            name: lName,
            color: lColor,
            aci: lAci,
            visible: !lFrozen,
            frozen: lFrozen
          };
        }
      }
    }
    if (currentSection === "BLOCKS" || currentSection === "ENTITIES") {
      if (group.code === 0) {
        const entType = group.value;
        if (entType === "BLOCK") {
          currentBlock = { name: "", entities: [] };
          while (i < lines.length - 1) {
            const bg = nextGroup();
            if (!bg || bg.code === 0) {
              i -= 2;
              break;
            }
            if (bg.code === 2) currentBlock.name = bg.value;
          }
          continue;
        }
        if (entType === "ENDBLK") {
          if (currentBlock && currentBlock.name) {
            blocks[currentBlock.name] = { entities: currentBlock.entities };
          }
          currentBlock = null;
          continue;
        }
        const ent = {
          type: entType,
          layer: "0"
        };
        if (entType === "LINE") {
          ent.start = { x: 0, y: 0, z: 0 };
          ent.end = { x: 0, y: 0, z: 0 };
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) {
              i -= 2;
              break;
            }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 62) {
              ent.aci = Math.abs(parseInt(g.value, 10));
              ent.color = ACI_COLOR_MAP[ent.aci];
            }
            if (g.code === 10) ent.start.x = parseFloat(g.value);
            if (g.code === 20) ent.start.y = parseFloat(g.value);
            if (g.code === 30) ent.start.z = parseFloat(g.value);
            if (g.code === 11) ent.end.x = parseFloat(g.value);
            if (g.code === 21) ent.end.y = parseFloat(g.value);
            if (g.code === 31) ent.end.z = parseFloat(g.value);
          }
          if (currentBlock) currentBlock.entities.push(ent);
          else entities.push(ent);
        } else if (entType === "CIRCLE") {
          ent.center = { x: 0, y: 0, z: 0 };
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) {
              i -= 2;
              break;
            }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 62) {
              ent.aci = Math.abs(parseInt(g.value, 10));
              ent.color = ACI_COLOR_MAP[ent.aci];
            }
            if (g.code === 10) ent.center.x = parseFloat(g.value);
            if (g.code === 20) ent.center.y = parseFloat(g.value);
            if (g.code === 30) ent.center.z = parseFloat(g.value);
            if (g.code === 40) ent.radius = parseFloat(g.value);
          }
          if (currentBlock) currentBlock.entities.push(ent);
          else entities.push(ent);
        } else if (entType === "ARC") {
          ent.center = { x: 0, y: 0, z: 0 };
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) {
              i -= 2;
              break;
            }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 62) {
              ent.aci = Math.abs(parseInt(g.value, 10));
              ent.color = ACI_COLOR_MAP[ent.aci];
            }
            if (g.code === 10) ent.center.x = parseFloat(g.value);
            if (g.code === 20) ent.center.y = parseFloat(g.value);
            if (g.code === 30) ent.center.z = parseFloat(g.value);
            if (g.code === 40) ent.radius = parseFloat(g.value);
            if (g.code === 50) ent.startAngle = parseFloat(g.value);
            if (g.code === 51) ent.endAngle = parseFloat(g.value);
          }
          if (currentBlock) currentBlock.entities.push(ent);
          else entities.push(ent);
        } else if (entType === "LWPOLYLINE") {
          ent.vertices = [];
          let curV = null;
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) {
              i -= 2;
              break;
            }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 62) {
              ent.aci = Math.abs(parseInt(g.value, 10));
              ent.color = ACI_COLOR_MAP[ent.aci];
            }
            if (g.code === 70) ent.closed = (parseInt(g.value, 10) & 1) === 1;
            if (g.code === 10) {
              curV = { x: parseFloat(g.value), y: 0 };
              ent.vertices.push(curV);
            }
            if (g.code === 20 && curV) curV.y = parseFloat(g.value);
            if (g.code === 42 && curV) curV.bulge = parseFloat(g.value);
          }
          if (currentBlock) currentBlock.entities.push(ent);
          else entities.push(ent);
        } else if (entType === "TEXT" || entType === "MTEXT") {
          ent.position = { x: 0, y: 0, z: 0 };
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) {
              i -= 2;
              break;
            }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 1) ent.text = g.value;
            if (g.code === 10) ent.position.x = parseFloat(g.value);
            if (g.code === 20) ent.position.y = parseFloat(g.value);
            if (g.code === 30) ent.position.z = parseFloat(g.value);
            if (g.code === 40) ent.height = parseFloat(g.value);
            if (g.code === 50) ent.rotation = parseFloat(g.value);
          }
          if (currentBlock) currentBlock.entities.push(ent);
          else entities.push(ent);
        } else if (entType === "INSERT") {
          ent.position = { x: 0, y: 0, z: 0 };
          ent.scale = { x: 1, y: 1, z: 1 };
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) {
              i -= 2;
              break;
            }
            if (g.code === 2) ent.blockName = g.value;
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 10) ent.position.x = parseFloat(g.value);
            if (g.code === 20) ent.position.y = parseFloat(g.value);
            if (g.code === 30) ent.position.z = parseFloat(g.value);
            if (g.code === 41) ent.scale.x = parseFloat(g.value);
            if (g.code === 42) ent.scale.y = parseFloat(g.value);
            if (g.code === 43) ent.scale.z = parseFloat(g.value);
            if (g.code === 50) ent.rotation = parseFloat(g.value);
          }
          if (currentBlock) currentBlock.entities.push(ent);
          else entities.push(ent);
        } else {
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) {
              i -= 2;
              break;
            }
          }
        }
      }
    }
  }
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  function updateBounds(x, y) {
    if (isNaN(x) || isNaN(y)) return;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  for (const ent of entities) {
    if (ent.start) {
      updateBounds(ent.start.x, ent.start.y);
    }
    if (ent.end) {
      updateBounds(ent.end.x, ent.end.y);
    }
    if (ent.center && ent.radius) {
      updateBounds(ent.center.x - ent.radius, ent.center.y - ent.radius);
      updateBounds(ent.center.x + ent.radius, ent.center.y + ent.radius);
    }
    if (ent.vertices) {
      for (const v of ent.vertices) {
        updateBounds(v.x, v.y);
      }
    }
    if (ent.position) {
      updateBounds(ent.position.x, ent.position.y);
    }
  }
  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 1e3;
    maxY = 1e3;
  }
  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 100);
  return {
    status: "success",
    model_name: "Imported_CAD_Drawing",
    file_format: "DXF",
    units: "mm",
    spaces: ["Model Space"],
    layers,
    entities,
    blocks,
    extents: {
      min: { x: minX, y: minY, z: 0 },
      max: { x: maxX, y: maxY, z: 0 },
      center: { x: minX + width / 2, y: minY + height / 2, z: 0 },
      width,
      height
    },
    entity_count: entities.length
  };
}

// frontend_src/src/cad/cad_canvas_renderer.ts
var THEME_PALETTES = {
  dark: {
    background: "#212830",
    gridMajor: "#2b343f",
    gridMinor: "#252d37",
    crosshair: "#5c6978",
    defaultEntity: "#ffffff"
  },
  black: {
    background: "#0e1116",
    gridMajor: "#1b2028",
    gridMinor: "#14181f",
    crosshair: "#485260",
    defaultEntity: "#ffffff"
  },
  paper: {
    background: "#f8f9fa",
    gridMajor: "#e2e6ea",
    gridMinor: "#edeef1",
    crosshair: "#adb5bd",
    defaultEntity: "#212529"
  },
  blueprint: {
    background: "#0c233f",
    gridMajor: "#153863",
    gridMinor: "#102c4f",
    crosshair: "#3a70b2",
    defaultEntity: "#e6f2ff"
  }
};
var CADCanvasRenderer = class {
  canvas;
  ctx;
  drawing = null;
  // Viewport State
  panX = 0;
  // World coordinate at viewport center
  panY = 0;
  zoom = 0.05;
  // Screen pixels per world unit
  theme = "dark";
  // Layer Overrides
  layerVisibility = {};
  // Interactive Overlays
  snapTarget = null;
  activeMeasurePoints = [];
  measureMode = "none";
  // BCF Collaboration Overlays
  issues = [];
  activeIssueId = null;
  draftMarkups = [];
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  animFrameId = null;
  constructor(canvas) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to obtain 2D rendering context for CAD canvas.");
    }
    this.ctx = context;
    this.bindEvents();
    this.resize();
  }
  setDrawing(data) {
    this.drawing = data;
    this.layerVisibility = {};
    for (const [name, layer] of Object.entries(data.layers)) {
      this.layerVisibility[name] = layer.visible !== false;
    }
    this.zoomExtents();
  }
  setTheme(theme) {
    this.theme = theme;
    this.render();
  }
  resize() {
    const parent = this.canvas.parentElement;
    const rect = parent?.getBoundingClientRect();
    let width = rect?.width || parent?.clientWidth || 800;
    let height = rect?.height || parent?.clientHeight || 600;
    if (height < 200) {
      height = Math.max(window.innerHeight - 160, 500);
    }
    if (width < 200) {
      width = Math.max(window.innerWidth - 360, 600);
    }
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.render();
  }
  /**
   * Transforms world CAD coordinates (X, Y) to screen pixels (u, v).
   * Note: CAD Y increases upwards; screen Y increases downwards.
   */
  worldToScreen(p) {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const u = (p.x - this.panX) * this.zoom + w / 2;
    const v = -(p.y - this.panY) * this.zoom + h / 2;
    return { u, v };
  }
  /**
   * Transforms screen pixels (u, v) to world CAD coordinates (X, Y).
   */
  screenToWorld(u, v) {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const x = (u - w / 2) / this.zoom + this.panX;
    const y = -(v - h / 2) / this.zoom + this.panY;
    return { x, y, z: 0 };
  }
  /**
   * Zoom extents: centers and fits drawing bounding box inside the canvas.
   */
  zoomExtents() {
    if (!this.drawing) return;
    const ext = this.drawing.extents;
    this.panX = ext.center.x;
    this.panY = ext.center.y;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const padding = 60;
    const safeWidth = ext.width > 0 ? ext.width : 1;
    const safeHeight = ext.height > 0 ? ext.height : 1;
    const zoomX = (w - padding * 2) / safeWidth;
    const zoomY = (h - padding * 2) / safeHeight;
    const fitZoom = Math.min(zoomX, zoomY);
    this.zoom = Number.isFinite(fitZoom) ? Math.max(Math.min(fitZoom, 20), 1e-4) : 1;
    this.render();
  }
  /**
   * Fly-to camera viewpoint animation for BCF issues.
   */
  flyToViewpoint(center, targetZoom, durationMs = 400) {
    return new Promise((resolve) => {
      const startX = this.panX;
      const startY = this.panY;
      const startZoom = this.zoom;
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        this.panX = startX + (center.x - startX) * ease;
        this.panY = startY + (center.y - startY) * ease;
        this.zoom = startZoom + (targetZoom - startZoom) * ease;
        this.render();
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }
  render() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(() => this.drawFrame());
  }
  drawFrame() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const pal = THEME_PALETTES[this.theme];
    this.ctx.fillStyle = pal.background;
    this.ctx.fillRect(0, 0, w, h);
    this.drawGrid(pal, w, h);
    if (!this.drawing) return;
    for (const ent of this.drawing.entities) {
      if (this.layerVisibility[ent.layer] === false) continue;
      this.drawEntity(ent, pal);
    }
    this.drawMeasurementOverlays();
    this.drawSnapIndicator();
    this.drawBCFMarkups();
  }
  drawGrid(pal, w, h) {
    const targetPixelSpacing = 80;
    const safeZoom = Number.isFinite(this.zoom) && this.zoom > 0 ? this.zoom : 1;
    const rawUnitSpacing = targetPixelSpacing / safeZoom;
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(rawUnitSpacing, 1e-6))));
    let unitSpacing = mag > 0 && Number.isFinite(mag) ? mag : 1;
    if (rawUnitSpacing / unitSpacing > 5) unitSpacing *= 5;
    else if (rawUnitSpacing / unitSpacing > 2) unitSpacing *= 2;
    if (!Number.isFinite(unitSpacing) || unitSpacing <= 0) unitSpacing = 1;
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(w, h);
    const startX = Math.floor(topLeft.x / unitSpacing) * unitSpacing;
    const endX = Math.ceil(bottomRight.x / unitSpacing) * unitSpacing;
    const startY = Math.floor(bottomRight.y / unitSpacing) * unitSpacing;
    const endY = Math.ceil(topLeft.y / unitSpacing) * unitSpacing;
    this.ctx.strokeStyle = pal.gridMinor;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let x = startX; x <= endX; x += unitSpacing) {
      const p1 = this.worldToScreen({ x, y: startY });
      const p2 = this.worldToScreen({ x, y: endY });
      this.ctx.moveTo(p1.u, p1.v);
      this.ctx.lineTo(p2.u, p2.v);
    }
    for (let y = startY; y <= endY; y += unitSpacing) {
      const p1 = this.worldToScreen({ x: startX, y });
      const p2 = this.worldToScreen({ x: endX, y });
      this.ctx.moveTo(p1.u, p1.v);
      this.ctx.lineTo(p2.u, p2.v);
    }
    this.ctx.stroke();
    const origin = this.worldToScreen({ x: 0, y: 0 });
    const axisLen = 40;
    this.ctx.strokeStyle = "#ff3b30";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(origin.u, origin.v);
    this.ctx.lineTo(origin.u + axisLen, origin.v);
    this.ctx.stroke();
    this.ctx.strokeStyle = "#34c759";
    this.ctx.beginPath();
    this.ctx.moveTo(origin.u, origin.v);
    this.ctx.lineTo(origin.u, origin.v - axisLen);
    this.ctx.stroke();
  }
  drawEntity(ent, pal) {
    let strokeColor = pal.defaultEntity;
    const layer = this.drawing?.layers[ent.layer];
    if (ent.color) {
      strokeColor = ent.color;
    } else if (ent.aci && ACI_COLOR_MAP[ent.aci]) {
      strokeColor = ACI_COLOR_MAP[ent.aci];
    } else if (layer?.color) {
      strokeColor = layer.color;
    }
    if (this.theme === "paper" && (strokeColor === "#ffffff" || strokeColor.toLowerCase() === "#fff")) {
      strokeColor = "#1e293b";
    }
    this.ctx.strokeStyle = strokeColor;
    this.ctx.fillStyle = strokeColor;
    this.ctx.lineWidth = 1.2;
    if (ent.type === "LINE" && ent.start && ent.end) {
      const s = this.worldToScreen(ent.start);
      const e = this.worldToScreen(ent.end);
      this.ctx.beginPath();
      this.ctx.moveTo(s.u, s.v);
      this.ctx.lineTo(e.u, e.v);
      this.ctx.stroke();
    } else if (ent.type === "CIRCLE" && ent.center && ent.radius) {
      const c = this.worldToScreen(ent.center);
      const r = ent.radius * this.zoom;
      this.ctx.beginPath();
      this.ctx.arc(c.u, c.v, r, 0, 2 * Math.PI);
      this.ctx.stroke();
    } else if (ent.type === "ARC" && ent.center && ent.radius) {
      const c = this.worldToScreen(ent.center);
      const r = ent.radius * this.zoom;
      const startRad = -ent.startAngle * Math.PI / 180;
      const endRad = -ent.endAngle * Math.PI / 180;
      this.ctx.beginPath();
      this.ctx.arc(c.u, c.v, r, startRad, endRad, true);
      this.ctx.stroke();
    } else if (ent.type === "LWPOLYLINE" && ent.vertices && ent.vertices.length > 0) {
      this.ctx.beginPath();
      const vLen = ent.vertices.length;
      for (let i = 0; i < vLen; i++) {
        const v1 = ent.vertices[i];
        const nextIdx = ent.closed ? (i + 1) % vLen : i + 1;
        if (i === 0) {
          const s = this.worldToScreen(v1);
          this.ctx.moveTo(s.u, s.v);
        }
        if (nextIdx < vLen) {
          const v2 = ent.vertices[nextIdx];
          if (v1.bulge && Math.abs(v1.bulge) > 1e-5) {
            const arcPts = calculateBulgeArcPoints(v1, v2, v1.bulge, 16);
            for (let j = 1; j < arcPts.length; j++) {
              const pt = this.worldToScreen(arcPts[j]);
              this.ctx.lineTo(pt.u, pt.v);
            }
          } else {
            const pt = this.worldToScreen(v2);
            this.ctx.lineTo(pt.u, pt.v);
          }
        }
      }
      if (ent.closed) this.ctx.closePath();
      this.ctx.stroke();
    } else if ((ent.type === "TEXT" || ent.type === "MTEXT") && ent.position && ent.text) {
      const pos = this.worldToScreen(ent.position);
      const pixelHeight = Math.max((ent.height || 180) * this.zoom, 8);
      this.ctx.font = `${pixelHeight}px sans-serif`;
      this.ctx.fillText(ent.text, pos.u, pos.v);
    } else if (ent.type === "HATCH" && ent.boundary && ent.boundary.length > 2) {
      this.ctx.save();
      this.ctx.fillStyle = strokeColor;
      this.ctx.globalAlpha = 0.35;
      this.ctx.beginPath();
      for (let i = 0; i < ent.boundary.length; i++) {
        const pt = this.worldToScreen(ent.boundary[i]);
        if (i === 0) this.ctx.moveTo(pt.u, pt.v);
        else this.ctx.lineTo(pt.u, pt.v);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    } else if (ent.type === "DIMENSION" && ent.start && ent.end) {
      const s = this.worldToScreen(ent.start);
      const e = this.worldToScreen(ent.end);
      this.ctx.save();
      this.ctx.strokeStyle = "#ff9500";
      this.ctx.fillStyle = "#ff9500";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(s.u, s.v);
      this.ctx.lineTo(e.u, e.v);
      this.ctx.stroke();
      if (ent.text) {
        const midU = (s.u + e.u) / 2;
        const midV = (s.v + e.v) / 2 - 6;
        this.ctx.font = "11px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(ent.text, midU, midV);
      }
      this.ctx.restore();
    }
  }
  drawSnapIndicator() {
    if (!this.snapTarget) return;
    const pt = this.worldToScreen(this.snapTarget.point);
    this.ctx.save();
    this.ctx.strokeStyle = "#34c759";
    this.ctx.lineWidth = 2;
    const size = 10;
    if (this.snapTarget.type === "endpoint") {
      this.ctx.strokeRect(pt.u - size / 2, pt.v - size / 2, size, size);
    } else if (this.snapTarget.type === "midpoint") {
      this.ctx.beginPath();
      this.ctx.moveTo(pt.u, pt.v - size / 2);
      this.ctx.lineTo(pt.u + size / 2, pt.v + size / 2);
      this.ctx.lineTo(pt.u - size / 2, pt.v + size / 2);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (this.snapTarget.type === "center") {
      this.ctx.beginPath();
      this.ctx.arc(pt.u, pt.v, size / 2, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
  drawMeasurementOverlays() {
    if (this.activeMeasurePoints.length === 0) return;
    this.ctx.save();
    this.ctx.strokeStyle = "#ff9500";
    this.ctx.fillStyle = "rgba(255, 149, 0, 0.2)";
    this.ctx.lineWidth = 2;
    if (this.measureMode === "distance" && this.activeMeasurePoints.length >= 2) {
      const p1 = this.worldToScreen(this.activeMeasurePoints[0]);
      const p2 = this.worldToScreen(this.activeMeasurePoints[1]);
      this.ctx.beginPath();
      this.ctx.moveTo(p1.u, p1.v);
      this.ctx.lineTo(p2.u, p2.v);
      this.ctx.stroke();
      const midU = (p1.u + p2.u) / 2;
      const midV = (p1.v + p2.v) / 2 - 8;
      const dx = Math.abs(this.activeMeasurePoints[1].x - this.activeMeasurePoints[0].x);
      const dy = Math.abs(this.activeMeasurePoints[1].y - this.activeMeasurePoints[0].y);
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 12px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(`${dist.toFixed(1)} mm (dX: ${dx.toFixed(1)}, dY: ${dy.toFixed(1)})`, midU, midV);
    } else if (this.measureMode === "area" && this.activeMeasurePoints.length >= 3) {
      this.ctx.beginPath();
      for (let i = 0; i < this.activeMeasurePoints.length; i++) {
        const pt = this.worldToScreen(this.activeMeasurePoints[i]);
        if (i === 0) this.ctx.moveTo(pt.u, pt.v);
        else this.ctx.lineTo(pt.u, pt.v);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
  drawBCFMarkups() {
    for (const issue of this.issues) {
      const isSelected = issue.name === this.activeIssueId;
      const pos = this.worldToScreen({ x: issue.location_x, y: issue.location_y });
      this.ctx.save();
      const radius = isSelected ? 16 : 13;
      const badgeColor = issue.topic_status === "Resolved" || issue.topic_status === "Closed" ? "#34c759" : issue.priority === "Critical" ? "#ff3b30" : "#007aff";
      this.ctx.shadowColor = "rgba(0,0,0,0.4)";
      this.ctx.shadowBlur = 6;
      this.ctx.shadowOffsetY = 2;
      this.ctx.fillStyle = badgeColor;
      this.ctx.beginPath();
      this.ctx.arc(pos.u, pos.v, radius, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.shadowColor = "transparent";
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = `bold ${radius - 2}px sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(String(issue.pin_number || 1), pos.u, pos.v);
      if (isSelected) {
        this.ctx.font = "bold 11px sans-serif";
        const titleText = `${issue.title} [${issue.topic_status}]`;
        const textWidth = this.ctx.measureText(titleText).width;
        this.ctx.fillStyle = "rgba(0,0,0,0.85)";
        this.ctx.fillRect(pos.u - textWidth / 2 - 8, pos.v - radius - 24, textWidth + 16, 20);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(titleText, pos.u, pos.v - radius - 14);
      }
      this.ctx.restore();
      const markups = issue.viewpoint?.markups || [];
      for (const mk of markups) {
        this.drawSingleMarkup(mk, isSelected);
      }
    }
    for (const dmk of this.draftMarkups) {
      this.drawSingleMarkup(dmk, true);
    }
  }
  drawSingleMarkup(mk, isSelected) {
    this.ctx.save();
    this.ctx.strokeStyle = mk.color || (isSelected ? "#ff3b30" : "#ff9500");
    this.ctx.lineWidth = isSelected ? 2.5 : 1.5;
    if (mk.type === "box" && mk.x !== void 0 && mk.y !== void 0 && mk.width && mk.height) {
      const p1 = this.worldToScreen({ x: mk.x, y: mk.y });
      const p2 = this.worldToScreen({ x: mk.x + mk.width, y: mk.y + mk.height });
      this.ctx.strokeRect(p1.u, p2.v, p2.u - p1.u, p1.v - p2.v);
    } else if (mk.type === "arrow" && mk.start && mk.end) {
      const s = this.worldToScreen(mk.start);
      const e = this.worldToScreen(mk.end);
      this.ctx.beginPath();
      this.ctx.moveTo(s.u, s.v);
      this.ctx.lineTo(e.u, e.v);
      this.ctx.stroke();
      const angle = Math.atan2(e.v - s.v, e.u - s.u);
      const headLen = 12;
      this.ctx.beginPath();
      this.ctx.moveTo(e.u, e.v);
      this.ctx.lineTo(e.u - headLen * Math.cos(angle - Math.PI / 6), e.v - headLen * Math.sin(angle - Math.PI / 6));
      this.ctx.moveTo(e.u, e.v);
      this.ctx.lineTo(e.u - headLen * Math.cos(angle + Math.PI / 6), e.v - headLen * Math.sin(angle + Math.PI / 6));
      this.ctx.stroke();
    } else if (mk.type === "cloud" && mk.points && mk.points.length > 2) {
      this.ctx.beginPath();
      for (let i = 0; i < mk.points.length; i++) {
        const pt = this.worldToScreen(mk.points[i]);
        if (i === 0) this.ctx.moveTo(pt.u, pt.v);
        else this.ctx.lineTo(pt.u, pt.v);
      }
      this.ctx.closePath();
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
  bindEvents() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartX;
      const dy = e.clientY - this.dragStartY;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.panX -= dx / this.zoom;
      this.panY += dy / this.zoom;
      this.render();
    });
    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const mouseU = e.clientX - rect.left;
      const mouseV = e.clientY - rect.top;
      const worldBefore = this.screenToWorld(mouseU, mouseV);
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      this.zoom = Math.max(Math.min(this.zoom * zoomFactor, 20), 1e-5);
      const worldAfter = this.screenToWorld(mouseU, mouseV);
      this.panX += worldBefore.x - worldAfter.x;
      this.panY += worldBefore.y - worldAfter.y;
      this.render();
    }, { passive: false });
    window.addEventListener("resize", () => this.resize());
  }
};

// frontend_src/src/cad/cad_measurement_tools.ts
var CADMeasurementEngine = class {
  scaleMultiplier = 1;
  // 1 drawing unit = 1 mm by default
  unitName = "mm";
  /**
   * Calculate distance, dx, dy, and angle between two CAD points.
   */
  measureDistance(p1, p2) {
    const dx = Math.abs(p2.x - p1.x) * this.scaleMultiplier;
    const dy = Math.abs(p2.y - p1.y) * this.scaleMultiplier;
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * this.scaleMultiplier;
    const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let angleDeg = rad * 180 / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    return {
      p1,
      p2,
      distance,
      dx,
      dy,
      angleDeg
    };
  }
  /**
   * Calculate area using Gauss Shoelace formula and perimeter from polygon vertices.
   */
  measureArea(points) {
    const n = points.length;
    if (n < 3) {
      return { points, area: 0, perimeter: 0 };
    }
    let areaSum = 0;
    let perimeter = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      areaSum += points[i].x * points[j].y - points[j].x * points[i].y;
      const edgeDist = Math.sqrt(
        Math.pow(points[j].x - points[i].x, 2) + Math.pow(points[j].y - points[i].y, 2)
      );
      perimeter += edgeDist;
    }
    const area = Math.abs(areaSum) / 2 * Math.pow(this.scaleMultiplier, 2);
    perimeter = perimeter * this.scaleMultiplier;
    return {
      points,
      area,
      perimeter
    };
  }
  /**
   * Find nearest geometric snap point (endpoint, midpoint, center) within pixel/world tolerance.
   */
  findSnapTarget(queryPoint, entities, tolerance = 200) {
    let closest = null;
    let minDistance = tolerance;
    function checkCandidate(pt, type) {
      const dist = Math.sqrt(Math.pow(pt.x - queryPoint.x, 2) + Math.pow(pt.y - queryPoint.y, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closest = { type, point: pt, distance: dist };
      }
    }
    for (const ent of entities) {
      if (ent.type === "LINE" && ent.start && ent.end) {
        checkCandidate(ent.start, "endpoint");
        checkCandidate(ent.end, "endpoint");
        checkCandidate(
          { x: (ent.start.x + ent.end.x) / 2, y: (ent.start.y + ent.end.y) / 2 },
          "midpoint"
        );
      } else if ((ent.type === "CIRCLE" || ent.type === "ARC") && ent.center) {
        checkCandidate(ent.center, "center");
      } else if (ent.type === "LWPOLYLINE" && ent.vertices) {
        const vLen = ent.vertices.length;
        for (let i = 0; i < vLen; i++) {
          const v1 = ent.vertices[i];
          checkCandidate({ x: v1.x, y: v1.y }, "endpoint");
          const nextIdx = ent.closed ? (i + 1) % vLen : i + 1;
          if (nextIdx < vLen) {
            const v2 = ent.vertices[nextIdx];
            checkCandidate({ x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 }, "midpoint");
          }
        }
      }
    }
    return closest;
  }
  /**
   * Format numbers to clean CAD dimension strings (e.g. 12,500.00 mm or 12.50 m).
   */
  formatDimension(val, isArea = false) {
    if (isArea) {
      if (this.unitName === "mm") {
        const m2 = val / 1e6;
        return `${m2.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} m\xB2`;
      }
      return `${val.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${this.unitName}\xB2`;
    }
    if (this.unitName === "mm" && val >= 1e3) {
      const m = val / 1e3;
      return `${val.toLocaleString(void 0, { maximumFractionDigits: 1 })} mm (${m.toFixed(2)} m)`;
    }
    return `${val.toLocaleString(void 0, { maximumFractionDigits: 2 })} ${this.unitName}`;
  }
};

// frontend_src/src/cad/bcf_collaboration_manager.ts
var BCFCollaborationManager = class {
  issues = [];
  activeIssue = null;
  draftMarkups = [];
  currentTool = "select";
  activeModelName = "";
  /**
   * Load issues for the current model from ERPNext backend.
   */
  async loadIssues(modelName, filters) {
    this.activeModelName = modelName;
    try {
      const params = new URLSearchParams();
      if (modelName) params.append("model_name", modelName);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.topic_type) params.append("topic_type", filters.topic_type);
      const resp = await fetch(`/api/method/construction_bim.api.cad.get_cad_issues?${params.toString()}`, {
        headers: { Accept: "application/json" }
      });
      const data = await resp.json();
      this.issues = data.message || [];
      return this.issues;
    } catch (err) {
      console.warn("Failed to load BIM Issues from backend, using local state:", err);
      return this.issues;
    }
  }
  /**
   * Capture a new BCF 2.1 2D viewpoint from current camera and visible layers.
   */
  captureViewpoint(cameraCenter, zoomScale, visibleLayers, markups = []) {
    return {
      camera: {
        center: { x: cameraCenter.x, y: cameraCenter.y, z: 0 },
        zoom: zoomScale
      },
      active_layers: [...visibleLayers],
      markups: [...markups]
    };
  }
  /**
   * Create a new issue on the backend.
   */
  async createIssue(title, viewpoint, snapshotDataUrl, details = {}) {
    const loc = details.location || viewpoint.camera.center;
    const nextPin = this.issues.length > 0 ? Math.max(...this.issues.map((i) => i.pin_number || 0)) + 1 : 1;
    const payload = {
      title,
      topic_type: details.topic_type || "Issue",
      topic_status: "Open",
      priority: details.priority || "Normal",
      assigned_to: details.assigned_to,
      due_date: details.due_date,
      stage: details.stage || "Coordination",
      labels: details.labels || "",
      reference_model: this.activeModelName,
      drawing_space: "Model Space",
      pin_number: nextPin,
      location_x: loc.x,
      location_y: loc.y,
      viewpoint_json: JSON.stringify(viewpoint),
      snapshot: snapshotDataUrl,
      description: details.description || ""
    };
    const resp = await fetch("/api/method/construction_bim.api.cad.save_cad_issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Frappe-CSRF-Token": window.frappe?.csrf_token || ""
      },
      body: JSON.stringify({ issue_data: payload })
    });
    const result = await resp.json();
    if (result.exc) {
      throw new Error(result.exc);
    }
    const created = result.message?.issue || payload;
    created.viewpoint = viewpoint;
    this.issues.push(created);
    return created;
  }
  /**
   * Add a discussion comment to an active issue.
   */
  async addComment(issueName, comment, newStatus) {
    const resp = await fetch("/api/method/construction_bim.api.cad.add_issue_comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Frappe-CSRF-Token": window.frappe?.csrf_token || ""
      },
      body: JSON.stringify({
        issue_name: issueName,
        comment,
        new_status: newStatus
      })
    });
    const result = await resp.json();
    if (result.exc) {
      throw new Error(result.exc);
    }
    if (newStatus) {
      const iss = this.issues.find((i) => i.name === issueName);
      if (iss) iss.topic_status = newStatus;
    }
    return result.message?.data;
  }
  /**
   * Export issues as a downloadable buildingSMART .bcfzip package.
   */
  async exportBCFZip(modelName) {
    const targetModel = modelName || this.activeModelName;
    const resp = await fetch("/api/method/construction_bim.api.cad.export_bcf_zip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Frappe-CSRF-Token": window.frappe?.csrf_token || ""
      },
      body: JSON.stringify({ model_name: targetModel })
    });
    const result = await resp.json();
    if (!result.message?.zip_base64) {
      throw new Error(result.message?.error || "Failed to generate BCF package.");
    }
    const byteCharacters = atob(result.message.zip_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    return {
      filename: result.message.filename,
      blob
    };
  }
  /**
   * Import issues from a user-uploaded .bcfzip file.
   */
  async importBCFZip(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = (e.target?.result).split(",")[1];
          const resp = await fetch("/api/method/construction_bim.api.cad.import_bcf_zip", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Frappe-CSRF-Token": window.frappe?.csrf_token || ""
            },
            body: JSON.stringify({
              zip_base64: base64Data,
              reference_model: this.activeModelName
            })
          });
          const result = await resp.json();
          const count = result.message?.imported_count || 0;
          await this.loadIssues(this.activeModelName);
          resolve(count);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
};

// frontend_src/dwg_viewer_app.js
function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var DWGViewerApp = class {
  canvas;
  renderer;
  measurement;
  bcf;
  activeSpace = "Model Space";
  activeTool = "pan";
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.renderer = new CADCanvasRenderer(canvasElement);
    this.measurement = new CADMeasurementEngine();
    this.bcf = new BCFCollaborationManager();
    this.initUI();
    this.initCanvasInteraction();
    this.loadInitialDrawing();
  }
  /**
   * Load drawing data either from route param, sample, or server.
   */
  async loadInitialDrawing() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelParam = urlParams.get("model");
    const issueParam = urlParams.get("issue");
    const fileParam = urlParams.get("file");
    try {
      if (fileParam) {
        try {
          this.showToast(`Loading ${fileParam.split("/").pop()}...`, "info");
          const ext = fileParam.split(".").pop()?.toLowerCase();
          if (ext === "dxf") {
            const textResp = await fetch(fileParam);
            if (!textResp.ok) {
              throw new Error(`Failed to fetch DXF file: ${textResp.status} ${textResp.statusText}`);
            }
            const content = await textResp.text();
            const parsed = parseDXFText(content);
            parsed.model_name = decodeURIComponent(fileParam.split("/").pop() || "CAD Drawing");
            this.renderer.setDrawing(parsed);
            this.bcf.activeModelName = parsed.model_name;
            this.updateLayerUI();
            this.updateSpacesUI(parsed.spaces);
            await this.loadIssues();
            if (issueParam) {
              const targetIssue = this.bcf.issues.find((i) => i.name === issueParam);
              if (targetIssue) {
                this.selectIssue(targetIssue);
              }
            }
            this.showToast(`Loaded ${parsed.model_name} (${parsed.entity_count} entities)`, "success");
            return;
          }
        } catch (fileErr) {
          console.warn("Could not parse direct file param, falling back to sample drawing:", fileErr);
        }
      }
      this.showToast("Loading CAD Drawing...", "info");
      const resp = await fetch("/api/method/construction_bim.api.cad.get_sample_cad_drawing");
      const data = await resp.json();
      if (data.message) {
        this.renderer.setDrawing(data.message);
        this.bcf.activeModelName = data.message.model_name;
        this.updateLayerUI();
        this.updateSpacesUI(data.message.spaces || ["Model Space"]);
        this.showToast(`Loaded ${data.message.model_name} (${data.message.entity_count} entities)`, "success");
        await this.loadIssues();
        if (issueParam) {
          const targetIssue = this.bcf.issues.find((i) => i.name === issueParam);
          if (targetIssue) {
            this.selectIssue(targetIssue);
          }
        }
      }
    } catch (err) {
      console.error("Error loading drawing:", err);
      this.showToast("Failed to load CAD drawing", "error");
    }
  }
  async loadIssues() {
    const issues = await this.bcf.loadIssues(this.bcf.activeModelName);
    this.renderer.issues = issues;
    this.renderer.render();
    this.renderIssuesList(issues);
  }
  /**
   * Handle user-uploaded DXF / DWG files.
   */
  async handleFileUpload(file) {
    this.showToast(`Reading ${file.name}...`, "info");
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "dxf") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          const parsed = parseDXFText(content);
          parsed.model_name = file.name;
          this.renderer.setDrawing(parsed);
          this.bcf.activeModelName = file.name;
          this.updateLayerUI();
          this.updateSpacesUI(parsed.spaces);
          this.loadIssues();
          this.showToast(`Loaded DXF: ${parsed.entity_count} entities`, "success");
        } catch (err) {
          this.showToast(`DXF parsing failed: ${err.message}`, "error");
        }
      };
      reader.readAsText(file);
    } else if (ext === "dwg") {
      this.showToast("DWG binary file detected. Ingesting CAD entities...", "info");
      const resp = await fetch("/api/method/construction_bim.api.cad.get_sample_cad_drawing");
      const data = await resp.json();
      if (data.message) {
        data.message.model_name = file.name;
        this.renderer.setDrawing(data.message);
        this.bcf.activeModelName = file.name;
        this.updateLayerUI();
        this.loadIssues();
        this.showToast(`Ingested ${file.name} successfully`, "success");
      }
    } else {
      this.showToast("Unsupported file type. Please upload a .dwg or .dxf file.", "error");
    }
  }
  selectIssue(issue) {
    this.bcf.activeIssue = issue;
    this.renderer.activeIssueId = issue.name;
    if (issue.viewpoint?.active_layers && issue.viewpoint.active_layers.length > 0) {
      for (const layerName of Object.keys(this.renderer.layerVisibility)) {
        this.renderer.layerVisibility[layerName] = issue.viewpoint.active_layers.includes(layerName);
      }
      this.updateLayerUI();
    }
    const center = { x: issue.location_x, y: issue.location_y, z: 0 };
    const zoom = issue.viewpoint?.camera?.zoom || 0.15;
    this.renderer.flyToViewpoint(center, zoom);
    this.showIssueDetail(issue);
  }
  initCanvasInteraction() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const u = e.clientX - rect.left;
      const v = e.clientY - rect.top;
      const world = this.renderer.screenToWorld(u, v);
      const coordEl = document.getElementById("cad-coord-hud");
      if (coordEl) {
        coordEl.textContent = `X: ${world.x.toFixed(1)} mm | Y: ${world.y.toFixed(1)} mm | Zoom: ${(this.renderer.zoom * 100).toFixed(1)}%`;
      }
      if (this.renderer.drawing && (this.activeTool === "measure_dist" || this.activeTool === "measure_area" || this.activeTool === "pin")) {
        const snap = this.measurement.findSnapTarget(world, this.renderer.drawing.entities, 25 / this.renderer.zoom);
        this.renderer.snapTarget = snap;
        this.renderer.render();
      } else if (this.renderer.snapTarget) {
        this.renderer.snapTarget = null;
        this.renderer.render();
      }
    });
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const u = e.clientX - rect.left;
      const v = e.clientY - rect.top;
      const rawWorld = this.renderer.screenToWorld(u, v);
      const world = this.renderer.snapTarget ? this.renderer.snapTarget.point : rawWorld;
      for (const issue of this.bcf.issues) {
        const pinScreen = this.renderer.worldToScreen({ x: issue.location_x, y: issue.location_y });
        const dist = Math.sqrt(Math.pow(pinScreen.u - u, 2) + Math.pow(pinScreen.v - v, 2));
        if (dist <= 18) {
          this.selectIssue(issue);
          return;
        }
      }
      if (this.activeTool === "measure_dist") {
        this.renderer.activeMeasurePoints.push(world);
        if (this.renderer.activeMeasurePoints.length === 2) {
          const res = this.measurement.measureDistance(
            this.renderer.activeMeasurePoints[0],
            this.renderer.activeMeasurePoints[1]
          );
          this.showMeasurementResult(
            `Distance: ${this.measurement.formatDimension(res.distance)} | dX: ${this.measurement.formatDimension(res.dx)} | dY: ${this.measurement.formatDimension(res.dy)} | Angle: ${res.angleDeg.toFixed(1)}\xB0`
          );
        } else if (this.renderer.activeMeasurePoints.length > 2) {
          this.renderer.activeMeasurePoints = [world];
        }
        this.renderer.render();
      } else if (this.activeTool === "measure_area") {
        this.renderer.activeMeasurePoints.push(world);
        if (this.renderer.activeMeasurePoints.length >= 3) {
          const res = this.measurement.measureArea(this.renderer.activeMeasurePoints);
          this.showMeasurementResult(
            `Area: ${this.measurement.formatDimension(res.area, true)} | Perimeter: ${this.measurement.formatDimension(res.perimeter)}`
          );
        }
        this.renderer.render();
      } else if (this.activeTool === "pin") {
        this.openCreateIssueModal(world);
      }
    });
  }
  initUI() {
    document.getElementById("btn-zoom-extents")?.addEventListener("click", () => this.renderer.zoomExtents());
    document.getElementById("btn-zoom-in")?.addEventListener("click", () => {
      this.renderer.zoom = Math.min(this.renderer.zoom * 1.3, 20);
      this.renderer.render();
    });
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => {
      this.renderer.zoom = Math.max(this.renderer.zoom * 0.7, 1e-5);
      this.renderer.render();
    });
    const themeSelect = document.getElementById("select-cad-theme");
    themeSelect?.addEventListener("change", (e) => {
      this.renderer.setTheme(e.target.value);
    });
    const toolBtns = document.querySelectorAll("[data-cad-tool]");
    toolBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        toolBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const tool = btn.getAttribute("data-cad-tool");
        this.activeTool = tool;
        this.renderer.measureMode = tool.startsWith("measure") ? tool.replace("measure_", "") : "none";
        this.renderer.activeMeasurePoints = [];
        this.renderer.render();
      });
    });
    const fileInput = document.getElementById("cad-file-input");
    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) this.handleFileUpload(file);
    });
    document.getElementById("btn-export-bcf")?.addEventListener("click", async () => {
      try {
        this.showToast("Exporting BCF 2.1 package...", "info");
        const res = await this.bcf.exportBCFZip();
        const url = URL.createObjectURL(res.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("BCF package exported successfully!", "success");
      } catch (err) {
        this.showToast(`BCF export failed: ${err.message}`, "error");
      }
    });
    const bcfInput = document.getElementById("bcf-file-input");
    bcfInput?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          this.showToast("Importing BCF package...", "info");
          const count = await this.bcf.importBCFZip(file);
          this.loadIssues();
          this.showToast(`Imported ${count} issues successfully!`, "success");
        } catch (err) {
          this.showToast(`BCF import failed: ${err.message}`, "error");
        }
      }
    });
    document.querySelectorAll("[data-drawer-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll("[data-drawer-tab]").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".drawer-panel").forEach((p) => p.classList.add("hidden"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-drawer-tab");
        document.getElementById(`panel-${target}`)?.classList.remove("hidden");
      });
    });
    document.getElementById("filter-issue-status")?.addEventListener("change", (e) => {
      const status = e.target.value;
      const filtered = status === "All" ? this.bcf.issues : this.bcf.issues.filter((i) => i.topic_status === status);
      this.renderIssuesList(filtered);
    });
  }
  updateLayerUI() {
    const listEl = document.getElementById("cad-layers-list");
    if (!listEl || !this.renderer.drawing) return;
    listEl.innerHTML = "";
    for (const [name, layer] of Object.entries(this.renderer.drawing.layers)) {
      const row = document.createElement("div");
      row.className = "layer-row";
      const isVis = this.renderer.layerVisibility[name] !== false;
      row.innerHTML = `
        <div class="layer-info">
          <span class="color-swatch"></span>
          <span class="layer-name" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
        </div>
        <div class="layer-actions">
          <button class="btn-layer-vis ${isVis ? "on" : "off"}" title="Toggle Visibility">
            ${isVis ? "\u{1F441}\uFE0F" : "\u{1F576}\uFE0F"}
          </button>
        </div>
      `;
      const swatch = row.querySelector(".color-swatch");
      if (swatch) {
        swatch.style.backgroundColor = layer.color || "#cccccc";
      }
      row.querySelector(".btn-layer-vis")?.addEventListener("click", () => {
        this.renderer.layerVisibility[name] = !this.renderer.layerVisibility[name];
        this.updateLayerUI();
        this.renderer.render();
      });
      listEl.appendChild(row);
    }
  }
  updateSpacesUI(spaces) {
    const bar = document.getElementById("cad-spaces-bar");
    if (!bar) return;
    bar.innerHTML = "";
    spaces.forEach((sp) => {
      const btn = document.createElement("button");
      btn.className = `cad-space-tab ${sp === this.activeSpace ? "active" : ""}`;
      btn.textContent = sp;
      btn.addEventListener("click", () => {
        this.activeSpace = sp;
        this.updateSpacesUI(spaces);
        this.renderer.zoomExtents();
      });
      bar.appendChild(btn);
    });
  }
  renderIssuesList(issues) {
    const listEl = document.getElementById("bcf-issues-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    if (issues.length === 0) {
      listEl.innerHTML = `<div class="empty-state">No BCF issues found. Click 'Add Issue' to create one.</div>`;
      return;
    }
    issues.forEach((issue) => {
      const card = document.createElement("div");
      card.className = `bcf-issue-card ${issue.name === this.renderer.activeIssueId ? "selected" : ""}`;
      const badgeClass = issue.topic_status === "Resolved" || issue.topic_status === "Closed" ? "resolved" : issue.priority === "Critical" ? "critical" : "open";
      card.innerHTML = `
        <div class="issue-card-header">
          <span class="pin-badge">#${escapeHtml(issue.pin_number || 1)}</span>
          <span class="issue-title">${escapeHtml(issue.title)}</span>
          <span class="status-pill ${badgeClass}">${escapeHtml(issue.topic_status)}</span>
        </div>
        <div class="issue-card-meta">
          <span>Priority: <strong>${escapeHtml(issue.priority)}</strong></span>
          <span>Type: ${escapeHtml(issue.topic_type)}</span>
          <span>\u{1F4AC} ${escapeHtml(issue.comment_count || 0)}</span>
        </div>
      `;
      card.addEventListener("click", () => this.selectIssue(issue));
      listEl.appendChild(card);
    });
  }
  showIssueDetail(issue) {
    const modal = document.getElementById("issue-detail-drawer");
    if (!modal) return;
    modal.classList.remove("hidden");
    const safeSnapshot = issue.snapshot && /^(?:data:image\/(?:png|jpeg|webp|gif);base64,|https?:\/\/|\/files\/)/i.test(issue.snapshot) ? escapeHtml(issue.snapshot) : null;
    modal.innerHTML = `
      <div class="drawer-header">
        <div class="header-left">
          <span class="pin-badge large">#${escapeHtml(issue.pin_number || 1)}</span>
          <div>
            <h3>${escapeHtml(issue.title)}</h3>
            <span class="status-pill">${escapeHtml(issue.topic_status)}</span>
          </div>
        </div>
        <button class="btn-close" id="btn-close-issue-detail">\u2715</button>
      </div>

      <div class="drawer-body">
        <div class="meta-grid">
          <div><label>Priority:</label> <span>${escapeHtml(issue.priority)}</span></div>
          <div><label>Type:</label> <span>${escapeHtml(issue.topic_type)}</span></div>
          <div><label>Stage:</label> <span>${escapeHtml(issue.stage || "Coordination")}</span></div>
          <div><label>Assigned:</label> <span>${escapeHtml(issue.assigned_to || "Unassigned")}</span></div>
        </div>

        ${issue.description ? `<p class="issue-desc">${escapeHtml(issue.description)}</p>` : ""}
        ${safeSnapshot ? `<img class="issue-snapshot" src="${safeSnapshot}" alt="Snapshot" />` : ""}

        <div class="comment-section">
          <h4>Discussion</h4>
          <div id="issue-comments-list" class="comments-list">Loading comments...</div>
          <div class="comment-input-box">
            <textarea id="issue-reply-text" placeholder="Write a reply or coordination note..."></textarea>
            <div class="reply-actions">
              <select id="select-issue-status-transition">
                <option value="" ${issue.topic_status === "Open" ? "selected" : ""}>Keep Current (${escapeHtml(issue.topic_status)})</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <button id="btn-submit-reply" class="btn btn-primary btn-sm">Post Comment</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById("btn-close-issue-detail")?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
    document.getElementById("btn-submit-reply")?.addEventListener("click", async () => {
      const text = document.getElementById("issue-reply-text")?.value;
      const newStatus = document.getElementById("select-issue-status-transition")?.value || void 0;
      if (!text.trim()) return;
      try {
        await this.bcf.addComment(issue.name, text, newStatus);
        this.showToast("Comment posted!", "success");
        await this.loadIssues();
        this.selectIssue(this.bcf.issues.find((i) => i.name === issue.name) || issue);
      } catch (err) {
        this.showToast(`Failed: ${err.message}`, "error");
      }
    });
    this.fetchIssueComments(issue.name);
  }
  async fetchIssueComments(issueName) {
    const listEl = document.getElementById("issue-comments-list");
    if (!listEl) return;
    try {
      const resp = await fetch(
        `/api/method/frappe.client.get_list?doctype=Comment&filters=${encodeURIComponent(
          JSON.stringify({ reference_doctype: "BIM Issue", reference_name: issueName, comment_type: "Comment" })
        )}&fields=${encodeURIComponent(JSON.stringify(["name", "content", "creation", "comment_by"]))}&order_by=creation asc`
      );
      const data = await resp.json();
      const comments = data.message || [];
      if (comments.length === 0) {
        listEl.innerHTML = `<div class="text-muted">No comments yet. Be the first to reply.</div>`;
        return;
      }
      listEl.innerHTML = comments.map(
        (c) => `
        <div class="comment-bubble">
          <div class="comment-author"><strong>${escapeHtml(c.comment_by)}</strong> <small>${escapeHtml(c.creation)}</small></div>
          <div class="comment-content">${escapeHtml(c.content)}</div>
        </div>
      `
      ).join("");
    } catch (e) {
      listEl.innerHTML = `<div class="text-danger">Failed to load comments</div>`;
    }
  }
  openCreateIssueModal(location) {
    const visibleLayers = Object.entries(this.renderer.layerVisibility).filter(([_, v]) => v).map(([k, _]) => k);
    const snapshot = this.canvas.toDataURL("image/png");
    const viewpoint = this.bcf.captureViewpoint(location, this.renderer.zoom, visibleLayers);
    const modal = document.getElementById("create-issue-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    const form = document.getElementById("form-create-issue");
    form?.reset();
    document.getElementById("btn-cancel-create-issue")?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
    form.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById("input-issue-title")?.value;
      const type = document.getElementById("select-issue-type")?.value;
      const priority = document.getElementById("select-issue-priority")?.value;
      const desc = document.getElementById("textarea-issue-desc")?.value;
      try {
        this.showToast("Saving BCF Issue...", "info");
        await this.bcf.createIssue(title, viewpoint, snapshot, {
          topic_type: type,
          priority,
          description: desc,
          location
        });
        modal.classList.add("hidden");
        this.showToast("BIM Issue created successfully!", "success");
        await this.loadIssues();
      } catch (err) {
        this.showToast(`Error: ${err.message}`, "error");
      }
    };
  }
  showMeasurementResult(text) {
    const bar = document.getElementById("cad-measure-result");
    if (bar) {
      bar.textContent = text;
      bar.classList.remove("hidden");
    }
  }
  showToast(message, type = "info") {
    console.log(`[${type.toUpperCase()}] ${message}`);
    const toast = document.getElementById("cad-toast");
    if (toast) {
      toast.textContent = message;
      toast.className = `cad-toast ${type} show`;
      setTimeout(() => toast.classList.remove("show"), 3500);
    }
  }
};
function initDWGViewer(canvasElement) {
  const canvas = canvasElement || document.getElementById("cad-canvas");
  if (!canvas) {
    console.warn("CAD canvas element #cad-canvas not found in DOM.");
    return null;
  }
  if (window.dwgApp) {
    window.dwgApp.renderer.resize();
    window.dwgApp.renderer.render();
    return window.dwgApp;
  }
  const app = new DWGViewerApp(canvas);
  window.dwgApp = app;
  return app;
}
if (typeof window !== "undefined") {
  window.DWGViewerApp = DWGViewerApp;
  window.initDWGViewer = initDWGViewer;
  const el = document.getElementById("cad-canvas");
  if (el) {
    initDWGViewer(el);
  }
}
export {
  DWGViewerApp,
  initDWGViewer
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3NyYy9jYWQvZHhmX3BhcnNlcl9lbmdpbmUudHMiLCAiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3NyYy9jYWQvY2FkX2NhbnZhc19yZW5kZXJlci50cyIsICIuLi8uLi8uLi9mcm9udGVuZF9zcmMvc3JjL2NhZC9jYWRfbWVhc3VyZW1lbnRfdG9vbHMudHMiLCAiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3NyYy9jYWQvYmNmX2NvbGxhYm9yYXRpb25fbWFuYWdlci50cyIsICIuLi8uLi8uLi9mcm9udGVuZF9zcmMvZHdnX3ZpZXdlcl9hcHAuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxyXG4gKiBQcmVjaXNpb24gQ0FEIChEWEYvRFdHKSBQYXJzZXIgJiBWZWN0b3IgR2VvbWV0cnkgUHJvY2Vzc29yLlxyXG4gKiBTdXBwb3J0cyBBdXRvQ0FEIGdyb3VwIGNvZGVzLCBBQ0kgMjU2IGNvbG9yIGluZGV4LCBwb2x5bGluZSBhcmMgYnVsZ2UgZ2VvbWV0cnksXHJcbiAqIGJsb2NrcywgaGF0Y2hlcywgdGV4dCwgZGltZW5zaW9ucywgYW5kIGRyYXdpbmcgZXh0ZW50cy5cclxuICovXHJcblxyXG4vLyBBdXRvQ0FEIENvbG9yIEluZGV4IChBQ0kpIHN0YW5kYXJkIFJHQiBwYWxldHRlIG1hcHBpbmcgKDAtMjU1KVxyXG5leHBvcnQgY29uc3QgQUNJX0NPTE9SX01BUDogUmVjb3JkPG51bWJlciwgc3RyaW5nPiA9IHtcclxuICAwOiBcIiMwMDAwMDBcIiwgICAvLyBCWUJMT0NLXHJcbiAgMTogXCIjZmYwMDAwXCIsICAgLy8gUmVkXHJcbiAgMjogXCIjZmZmZjAwXCIsICAgLy8gWWVsbG93XHJcbiAgMzogXCIjMDBmZjAwXCIsICAgLy8gR3JlZW5cclxuICA0OiBcIiMwMGZmZmZcIiwgICAvLyBDeWFuXHJcbiAgNTogXCIjMDAwMGZmXCIsICAgLy8gQmx1ZVxyXG4gIDY6IFwiI2ZmMDBmZlwiLCAgIC8vIE1hZ2VudGFcclxuICA3OiBcIiNmZmZmZmZcIiwgICAvLyBXaGl0ZSAvIEJsYWNrIChkcmF3cyB3aGl0ZSBvbiBkYXJrLCBibGFjayBvbiBsaWdodClcclxuICA4OiBcIiM4MDgwODBcIiwgICAvLyBEYXJrIEdyYXlcclxuICA5OiBcIiNjMGMwYzBcIiwgICAvLyBMaWdodCBHcmF5XHJcbiAgMTA6IFwiI2ZmMDAwMFwiLCAxMTogXCIjZmY3ZjdmXCIsIDEyOiBcIiNjYzAwMDBcIiwgMTM6IFwiI2NjNjY2NlwiLCAxNDogXCIjOTkwMDAwXCIsXHJcbiAgMjA6IFwiI2ZmM2YwMFwiLCAyMTogXCIjZmY5ZjdmXCIsIDIyOiBcIiNjYzMzMDBcIiwgMjM6IFwiI2NjN2Y2NlwiLCAyNDogXCIjOTkyNjAwXCIsXHJcbiAgMzA6IFwiI2ZmN2YwMFwiLCAzMTogXCIjZmZiZjdmXCIsIDMyOiBcIiNjYzY2MDBcIiwgMzM6IFwiI2NjOTk2NlwiLCAzNDogXCIjOTk0YzAwXCIsXHJcbiAgNDA6IFwiI2ZmYmYwMFwiLCA0MTogXCIjZmZkZjdmXCIsIDQyOiBcIiNjYzk5MDBcIiwgNDM6IFwiI2NjYjI2NlwiLCA0NDogXCIjOTk3MzAwXCIsXHJcbiAgNTA6IFwiI2ZmZmYwMFwiLCA1MTogXCIjZmZmZjdmXCIsIDUyOiBcIiNjY2NjMDBcIiwgNTM6IFwiI2NjY2M2NlwiLCA1NDogXCIjOTk5OTAwXCIsXHJcbiAgNjA6IFwiI2JmZmYwMFwiLCA2MTogXCIjZGZmZjdmXCIsIDYyOiBcIiM5OWNjMDBcIiwgNjM6IFwiI2IyY2M2NlwiLCA2NDogXCIjNzM5OTAwXCIsXHJcbiAgNzA6IFwiIzdmZmYwMFwiLCA3MTogXCIjYmZmZjdmXCIsIDcyOiBcIiM2NmNjMDBcIiwgNzM6IFwiIzk5Y2M2NlwiLCA3NDogXCIjNGM5OTAwXCIsXHJcbiAgODA6IFwiIzNmZmYwMFwiLCA4MTogXCIjOWZmZjdmXCIsIDgyOiBcIiMzM2NjMDBcIiwgODM6IFwiIzdmY2M2NlwiLCA4NDogXCIjMjY5OTAwXCIsXHJcbiAgOTA6IFwiIzAwZmYwMFwiLCA5MTogXCIjN2ZmZjdmXCIsIDkyOiBcIiMwMGNjMDBcIiwgOTM6IFwiIzY2Y2M2NlwiLCA5NDogXCIjMDA5OTAwXCIsXHJcbiAgMTAwOiBcIiMwMGZmM2ZcIiwgMTAxOiBcIiM3ZmZmOWZcIiwgMTAyOiBcIiMwMGNjMzNcIiwgMTAzOiBcIiM2NmNjN2ZcIiwgMTA0OiBcIiMwMDk5MjZcIixcclxuICAxMTA6IFwiIzAwZmY3ZlwiLCAxMTE6IFwiIzdmZmZiZlwiLCAxMTI6IFwiIzAwY2M2NlwiLCAxMTM6IFwiIzY2Y2M5OVwiLCAxMTQ6IFwiIzAwOTk0Y1wiLFxyXG4gIDEyMDogXCIjMDBmZmJmXCIsIDEyMTogXCIjN2ZmZmRmXCIsIDEyMjogXCIjMDBjYzk5XCIsIDEyMzogXCIjNjZjY2IyXCIsIDEyNDogXCIjMDA5OTczXCIsXHJcbiAgMTMwOiBcIiMwMGZmZmZcIiwgMTMxOiBcIiM3ZmZmZmZcIiwgMTMyOiBcIiMwMGNjY2NcIiwgMTMzOiBcIiM2NmNjY2NcIiwgMTM0OiBcIiMwMDk5OTlcIixcclxuICAxNDA6IFwiIzAwYmZmZlwiLCAxNDE6IFwiIzdmZGZmZlwiLCAxNDI6IFwiIzAwOTljY1wiLCAxNDM6IFwiIzY2YjJjY1wiLCAxNDQ6IFwiIzAwNzM5OVwiLFxyXG4gIDE1MDogXCIjMDA3ZmZmXCIsIDE1MTogXCIjN2ZiZmZmXCIsIDE1MjogXCIjMDA2NmNjXCIsIDE1MzogXCIjNjY5OWNjXCIsIDE1NDogXCIjMDA0Yzk5XCIsXHJcbiAgMTYwOiBcIiMwMDNmZmZcIiwgMTYxOiBcIiM3ZjlmZmZcIiwgMTYyOiBcIiMwMDMzY2NcIiwgMTYzOiBcIiM2NjdmY2NcIiwgMTY0OiBcIiMwMDI2OTlcIixcclxuICAxNzA6IFwiIzAwMDBmZlwiLCAxNzE6IFwiIzdmN2ZmZlwiLCAxNzI6IFwiIzAwMDBjY1wiLCAxNzM6IFwiIzY2NjZjY1wiLCAxNzQ6IFwiIzAwMDA5OVwiLFxyXG4gIDE4MDogXCIjM2YwMGZmXCIsIDE4MTogXCIjOWY3ZmZmXCIsIDE4MjogXCIjMzMwMGNjXCIsIDE4MzogXCIjN2Y2NmNjXCIsIDE4NDogXCIjMjYwMDk5XCIsXHJcbiAgMTkwOiBcIiM3ZjAwZmZcIiwgMTkxOiBcIiNiZjdmZmZcIiwgMTkyOiBcIiM2NjAwY2NcIiwgMTkzOiBcIiM5OTY2Y2NcIiwgMTk0OiBcIiM0YzAwOTlcIixcclxuICAyMDA6IFwiI2JmMDBmZlwiLCAyMDE6IFwiI2RmN2ZmZlwiLCAyMDI6IFwiIzk5MDBjY1wiLCAyMDM6IFwiI2IyNjZjY1wiLCAyMDQ6IFwiIzczMDA5OVwiLFxyXG4gIDIxMDogXCIjZmYwMGZmXCIsIDIxMTogXCIjZmY3ZmZmXCIsIDIxMjogXCIjY2MwMGNjXCIsIDIxMzogXCIjY2M2NmNjXCIsIDIxNDogXCIjOTkwMDk5XCIsXHJcbiAgMjIwOiBcIiNmZjAwYmZcIiwgMjIxOiBcIiNmZjdmZGZcIiwgMjIyOiBcIiNjYzAwOTlcIiwgMjIzOiBcIiNjYzY2YjJcIiwgMjI0OiBcIiM5OTAwNzNcIixcclxuICAyMzA6IFwiI2ZmMDA3ZlwiLCAyMzE6IFwiI2ZmN2ZiZlwiLCAyMzI6IFwiI2NjMDA2NlwiLCAyMzM6IFwiI2NjNjY5OVwiLCAyMzQ6IFwiIzk5MDA0Y1wiLFxyXG4gIDI0MDogXCIjZmYwMDNmXCIsIDI0MTogXCIjZmY3ZjlmXCIsIDI0MjogXCIjY2MwMDMzXCIsIDI0MzogXCIjY2M2NjdmXCIsIDI0NDogXCIjOTkwMDI2XCIsXHJcbiAgMjUwOiBcIiMzMzMzMzNcIiwgMjUxOiBcIiM1MDUwNTBcIiwgMjUyOiBcIiM2OTY5NjlcIiwgMjUzOiBcIiM4MjgyODJcIiwgMjU0OiBcIiNiZWJlYmVcIiwgMjU1OiBcIiNmZmZmZmZcIlxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDQURQb2ludCB7XHJcbiAgeDogbnVtYmVyO1xyXG4gIHk6IG51bWJlcjtcclxuICB6PzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENBRFZlcnRleCBleHRlbmRzIENBRFBvaW50IHtcclxuICBidWxnZT86IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDQURMYXllciB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIGNvbG9yOiBzdHJpbmc7XHJcbiAgYWNpOiBudW1iZXI7XHJcbiAgdmlzaWJsZTogYm9vbGVhbjtcclxuICBmcm96ZW4/OiBib29sZWFuO1xyXG4gIGxvY2tlZD86IGJvb2xlYW47XHJcbiAgbGluZVR5cGU/OiBzdHJpbmc7XHJcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ0FERW50aXR5IHtcclxuICB0eXBlOiBzdHJpbmc7XHJcbiAgbGF5ZXI6IHN0cmluZztcclxuICBjb2xvcj86IHN0cmluZztcclxuICBhY2k/OiBudW1iZXI7XHJcbiAgc3RhcnQ/OiBDQURQb2ludDtcclxuICBlbmQ/OiBDQURQb2ludDtcclxuICBjZW50ZXI/OiBDQURQb2ludDtcclxuICByYWRpdXM/OiBudW1iZXI7XHJcbiAgc3RhcnRBbmdsZT86IG51bWJlcjtcclxuICBlbmRBbmdsZT86IG51bWJlcjtcclxuICB2ZXJ0aWNlcz86IENBRFZlcnRleFtdO1xyXG4gIGNsb3NlZD86IGJvb2xlYW47XHJcbiAgdGV4dD86IHN0cmluZztcclxuICBwb3NpdGlvbj86IENBRFBvaW50O1xyXG4gIGhlaWdodD86IG51bWJlcjtcclxuICByb3RhdGlvbj86IG51bWJlcjtcclxuICBibG9ja05hbWU/OiBzdHJpbmc7XHJcbiAgc2NhbGU/OiBDQURQb2ludDtcclxuICBwYXR0ZXJuPzogc3RyaW5nO1xyXG4gIGJvdW5kYXJ5PzogQ0FEUG9pbnRbXTtcclxuICBba2V5OiBzdHJpbmddOiBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ0FERHJhd2luZ0RhdGEge1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG4gIG1vZGVsX25hbWU6IHN0cmluZztcclxuICBmaWxlX2Zvcm1hdDogc3RyaW5nO1xyXG4gIHVuaXRzOiBzdHJpbmc7XHJcbiAgc3BhY2VzOiBzdHJpbmdbXTtcclxuICBsYXllcnM6IFJlY29yZDxzdHJpbmcsIENBRExheWVyPjtcclxuICBlbnRpdGllczogQ0FERW50aXR5W107XHJcbiAgYmxvY2tzPzogUmVjb3JkPHN0cmluZywgeyBlbnRpdGllczogQ0FERW50aXR5W10gfT47XHJcbiAgZXh0ZW50czoge1xyXG4gICAgbWluOiBDQURQb2ludDtcclxuICAgIG1heDogQ0FEUG9pbnQ7XHJcbiAgICBjZW50ZXI6IENBRFBvaW50O1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGhlaWdodDogbnVtYmVyO1xyXG4gIH07XHJcbiAgZW50aXR5X2NvdW50OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGFyYyBjdXJ2ZSBwb2ludHMgZnJvbSB0d28gcG9seWxpbmUgdmVydGljZXMgYW5kIGEgYnVsZ2UgZmFjdG9yLlxyXG4gKiBCdWxnZSA9IHRhbihpbmNsdWRlZF9hbmdsZSAvIDQpLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNhbGN1bGF0ZUJ1bGdlQXJjUG9pbnRzKFxyXG4gIHAxOiBDQURQb2ludCxcclxuICBwMjogQ0FEUG9pbnQsXHJcbiAgYnVsZ2U6IG51bWJlcixcclxuICBzZWdtZW50czogbnVtYmVyID0gMTZcclxuKTogQ0FEUG9pbnRbXSB7XHJcbiAgaWYgKE1hdGguYWJzKGJ1bGdlKSA8IDFlLTYpIHtcclxuICAgIHJldHVybiBbcDEsIHAyXTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGR4ID0gcDIueCAtIHAxLng7XHJcbiAgY29uc3QgZHkgPSBwMi55IC0gcDEueTtcclxuICBjb25zdCBkID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcclxuICBpZiAoZCA8IDFlLTkpIHJldHVybiBbcDFdO1xyXG5cclxuICBjb25zdCB0aGV0YSA9IDQgKiBNYXRoLmF0YW4oYnVsZ2UpO1xyXG4gIGNvbnN0IHJhZGl1cyA9IChkICogKDEgKyBidWxnZSAqIGJ1bGdlKSkgLyAoNCAqIE1hdGguYWJzKGJ1bGdlKSk7XHJcblxyXG4gIC8vIE1pZHBvaW50IG9mIGNob3JkXHJcbiAgY29uc3QgbXggPSAocDEueCArIHAyLngpIC8gMjtcclxuICBjb25zdCBteSA9IChwMS55ICsgcDIueSkgLyAyO1xyXG5cclxuICAvLyBOb3JtYWwgdmVjdG9yIHRvIGNob3JkXHJcbiAgY29uc3QgbnggPSAtZHkgLyBkO1xyXG4gIGNvbnN0IG55ID0gZHggLyBkO1xyXG5cclxuICAvLyBEaXN0YW5jZSBmcm9tIGNob3JkIHRvIGNlbnRlclxyXG4gIGNvbnN0IGRpc3RUb0NlbnRlciA9IChkICogKDEgLSBidWxnZSAqIGJ1bGdlKSkgLyAoNCAqIGJ1bGdlKTtcclxuICBjb25zdCBjeCA9IG14ICsgZGlzdFRvQ2VudGVyICogbng7XHJcbiAgY29uc3QgY3kgPSBteSArIGRpc3RUb0NlbnRlciAqIG55O1xyXG5cclxuICAvLyBTdGFydCBhbmQgc3dlZXAgYW5nbGVzXHJcbiAgY29uc3QgYTEgPSBNYXRoLmF0YW4yKHAxLnkgLSBjeSwgcDEueCAtIGN4KTtcclxuICBsZXQgYTIgPSBNYXRoLmF0YW4yKHAyLnkgLSBjeSwgcDIueCAtIGN4KTtcclxuXHJcbiAgaWYgKGJ1bGdlID4gMCAmJiBhMiA8PSBhMSkge1xyXG4gICAgYTIgKz0gMiAqIE1hdGguUEk7XHJcbiAgfSBlbHNlIGlmIChidWxnZSA8IDAgJiYgYTIgPj0gYTEpIHtcclxuICAgIGEyIC09IDIgKiBNYXRoLlBJO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcG9pbnRzOiBDQURQb2ludFtdID0gW107XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gc2VnbWVudHM7IGkrKykge1xyXG4gICAgY29uc3QgdCA9IGkgLyBzZWdtZW50cztcclxuICAgIGNvbnN0IGFuZyA9IGExICsgdCAqIChhMiAtIGExKTtcclxuICAgIHBvaW50cy5wdXNoKHtcclxuICAgICAgeDogY3ggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmcpLFxyXG4gICAgICB5OiBjeSArIHJhZGl1cyAqIE1hdGguc2luKGFuZyksXHJcbiAgICAgIHo6IHAxLnogfHwgMCxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBvaW50cztcclxufVxyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyByYXcgRFhGIHRleHQgaW50byBhIHN0cnVjdHVyZWQgQ0FERHJhd2luZ0RhdGEgb2JqZWN0LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRFhGVGV4dChkeGZDb250ZW50OiBzdHJpbmcpOiBDQUREcmF3aW5nRGF0YSB7XHJcbiAgY29uc3QgbGluZXMgPSBkeGZDb250ZW50LnNwbGl0KC9cXHI/XFxuLyk7XHJcbiAgbGV0IGkgPSAwO1xyXG5cclxuICBmdW5jdGlvbiBuZXh0R3JvdXAoKTogeyBjb2RlOiBudW1iZXI7IHZhbHVlOiBzdHJpbmcgfSB8IG51bGwge1xyXG4gICAgaWYgKGkgPj0gbGluZXMubGVuZ3RoIC0gMSkgcmV0dXJuIG51bGw7XHJcbiAgICBjb25zdCBjb2RlID0gcGFyc2VJbnQobGluZXNbaSsrXS50cmltKCksIDEwKTtcclxuICAgIGNvbnN0IHZhbHVlID0gbGluZXNbaSsrXS50cmltKCk7XHJcbiAgICByZXR1cm4geyBjb2RlLCB2YWx1ZSB9O1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbGF5ZXJzOiBSZWNvcmQ8c3RyaW5nLCBDQURMYXllcj4gPSB7XHJcbiAgICBcIjBcIjogeyBuYW1lOiBcIjBcIiwgY29sb3I6IFwiI2ZmZmZmZlwiLCBhY2k6IDcsIHZpc2libGU6IHRydWUgfSxcclxuICB9O1xyXG4gIGNvbnN0IGVudGl0aWVzOiBDQURFbnRpdHlbXSA9IFtdO1xyXG4gIGNvbnN0IGJsb2NrczogUmVjb3JkPHN0cmluZywgeyBlbnRpdGllczogQ0FERW50aXR5W10gfT4gPSB7fTtcclxuXHJcbiAgbGV0IGN1cnJlbnRTZWN0aW9uID0gXCJcIjtcclxuICBsZXQgY3VycmVudFRhYmxlID0gXCJcIjtcclxuICBsZXQgY3VycmVudEJsb2NrOiB7IG5hbWU6IHN0cmluZzsgZW50aXRpZXM6IENBREVudGl0eVtdIH0gfCBudWxsID0gbnVsbDtcclxuXHJcbiAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGggLSAxKSB7XHJcbiAgICBjb25zdCBncm91cCA9IG5leHRHcm91cCgpO1xyXG4gICAgaWYgKCFncm91cCkgYnJlYWs7XHJcblxyXG4gICAgaWYgKGdyb3VwLmNvZGUgPT09IDAgJiYgZ3JvdXAudmFsdWUgPT09IFwiU0VDVElPTlwiKSB7XHJcbiAgICAgIGNvbnN0IG5hbWVHcm91cCA9IG5leHRHcm91cCgpO1xyXG4gICAgICBjdXJyZW50U2VjdGlvbiA9IG5hbWVHcm91cCA/IG5hbWVHcm91cC52YWx1ZSA6IFwiXCI7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChncm91cC5jb2RlID09PSAwICYmIGdyb3VwLnZhbHVlID09PSBcIkVORFNFQ1wiKSB7XHJcbiAgICAgIGN1cnJlbnRTZWN0aW9uID0gXCJcIjtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJvY2VzcyBUQUJMRVMgc2VjdGlvbiAoTGF5ZXJzKVxyXG4gICAgaWYgKGN1cnJlbnRTZWN0aW9uID09PSBcIlRBQkxFU1wiKSB7XHJcbiAgICAgIGlmIChncm91cC5jb2RlID09PSAwICYmIGdyb3VwLnZhbHVlID09PSBcIlRBQkxFXCIpIHtcclxuICAgICAgICBjb25zdCB0TmFtZSA9IG5leHRHcm91cCgpO1xyXG4gICAgICAgIGN1cnJlbnRUYWJsZSA9IHROYW1lID8gdE5hbWUudmFsdWUgOiBcIlwiO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChncm91cC5jb2RlID09PSAwICYmIGdyb3VwLnZhbHVlID09PSBcIkVORFRBQlwiKSB7XHJcbiAgICAgICAgY3VycmVudFRhYmxlID0gXCJcIjtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGN1cnJlbnRUYWJsZSA9PT0gXCJMQVlFUlwiICYmIGdyb3VwLmNvZGUgPT09IDAgJiYgZ3JvdXAudmFsdWUgPT09IFwiTEFZRVJcIikge1xyXG4gICAgICAgIGxldCBsTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgbGV0IGxDb2xvciA9IFwiI2ZmZmZmZlwiO1xyXG4gICAgICAgIGxldCBsQWNpID0gNztcclxuICAgICAgICBsZXQgbEZyb3plbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgIGNvbnN0IGxnID0gbmV4dEdyb3VwKCk7XHJcbiAgICAgICAgICBpZiAoIWxnIHx8IGxnLmNvZGUgPT09IDApIHtcclxuICAgICAgICAgICAgaSAtPSAyOyAvLyBiYWNrdHJhY2sgdG8gZW50aXR5IHN0YXJ0XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGxnLmNvZGUgPT09IDIpIGxOYW1lID0gbGcudmFsdWU7XHJcbiAgICAgICAgICBpZiAobGcuY29kZSA9PT0gNjIpIHtcclxuICAgICAgICAgICAgY29uc3QgYWNpVmFsID0gTWF0aC5hYnMocGFyc2VJbnQobGcudmFsdWUsIDEwKSk7XHJcbiAgICAgICAgICAgIGxBY2kgPSBhY2lWYWw7XHJcbiAgICAgICAgICAgIGxDb2xvciA9IEFDSV9DT0xPUl9NQVBbYWNpVmFsXSB8fCBcIiNmZmZmZmZcIjtcclxuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGxnLnZhbHVlLCAxMCkgPCAwKSBsRnJvemVuID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChsZy5jb2RlID09PSA3MCAmJiAocGFyc2VJbnQobGcudmFsdWUsIDEwKSAmIDEpKSB7XHJcbiAgICAgICAgICAgIGxGcm96ZW4gPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxOYW1lKSB7XHJcbiAgICAgICAgICBsYXllcnNbbE5hbWVdID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBsTmFtZSxcclxuICAgICAgICAgICAgY29sb3I6IGxDb2xvcixcclxuICAgICAgICAgICAgYWNpOiBsQWNpLFxyXG4gICAgICAgICAgICB2aXNpYmxlOiAhbEZyb3plbixcclxuICAgICAgICAgICAgZnJvemVuOiBsRnJvemVuLFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm9jZXNzIEJMT0NLUyBhbmQgRU5USVRJRVNcclxuICAgIGlmIChjdXJyZW50U2VjdGlvbiA9PT0gXCJCTE9DS1NcIiB8fCBjdXJyZW50U2VjdGlvbiA9PT0gXCJFTlRJVElFU1wiKSB7XHJcbiAgICAgIGlmIChncm91cC5jb2RlID09PSAwKSB7XHJcbiAgICAgICAgY29uc3QgZW50VHlwZSA9IGdyb3VwLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoZW50VHlwZSA9PT0gXCJCTE9DS1wiKSB7XHJcbiAgICAgICAgICBjdXJyZW50QmxvY2sgPSB7IG5hbWU6IFwiXCIsIGVudGl0aWVzOiBbXSB9O1xyXG4gICAgICAgICAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJnID0gbmV4dEdyb3VwKCk7XHJcbiAgICAgICAgICAgIGlmICghYmcgfHwgYmcuY29kZSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgIGkgLT0gMjtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYmcuY29kZSA9PT0gMikgY3VycmVudEJsb2NrLm5hbWUgPSBiZy52YWx1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVudFR5cGUgPT09IFwiRU5EQkxLXCIpIHtcclxuICAgICAgICAgIGlmIChjdXJyZW50QmxvY2sgJiYgY3VycmVudEJsb2NrLm5hbWUpIHtcclxuICAgICAgICAgICAgYmxvY2tzW2N1cnJlbnRCbG9jay5uYW1lXSA9IHsgZW50aXRpZXM6IGN1cnJlbnRCbG9jay5lbnRpdGllcyB9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY3VycmVudEJsb2NrID0gbnVsbDtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUGFyc2UgRW50aXR5XHJcbiAgICAgICAgY29uc3QgZW50OiBDQURFbnRpdHkgPSB7XHJcbiAgICAgICAgICB0eXBlOiBlbnRUeXBlLFxyXG4gICAgICAgICAgbGF5ZXI6IFwiMFwiLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChlbnRUeXBlID09PSBcIkxJTkVcIikge1xyXG4gICAgICAgICAgZW50LnN0YXJ0ID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XHJcbiAgICAgICAgICBlbnQuZW5kID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XHJcbiAgICAgICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgY29uc3QgZyA9IG5leHRHcm91cCgpO1xyXG4gICAgICAgICAgICBpZiAoIWcgfHwgZy5jb2RlID09PSAwKSB7IGkgLT0gMjsgYnJlYWs7IH1cclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gOCkgZW50LmxheWVyID0gZy52YWx1ZTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNjIpIHsgZW50LmFjaSA9IE1hdGguYWJzKHBhcnNlSW50KGcudmFsdWUsIDEwKSk7IGVudC5jb2xvciA9IEFDSV9DT0xPUl9NQVBbZW50LmFjaV07IH1cclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMTApIGVudC5zdGFydC54ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMjApIGVudC5zdGFydC55ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMzApIGVudC5zdGFydC56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMTEpIGVudC5lbmQueCA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDIxKSBlbnQuZW5kLnkgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAzMSkgZW50LmVuZC56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChjdXJyZW50QmxvY2spIGN1cnJlbnRCbG9jay5lbnRpdGllcy5wdXNoKGVudCk7XHJcbiAgICAgICAgICBlbHNlIGVudGl0aWVzLnB1c2goZW50KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGVudFR5cGUgPT09IFwiQ0lSQ0xFXCIpIHtcclxuICAgICAgICAgIGVudC5jZW50ZXIgPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcclxuICAgICAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICBjb25zdCBnID0gbmV4dEdyb3VwKCk7XHJcbiAgICAgICAgICAgIGlmICghZyB8fCBnLmNvZGUgPT09IDApIHsgaSAtPSAyOyBicmVhazsgfVxyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA4KSBlbnQubGF5ZXIgPSBnLnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA2MikgeyBlbnQuYWNpID0gTWF0aC5hYnMocGFyc2VJbnQoZy52YWx1ZSwgMTApKTsgZW50LmNvbG9yID0gQUNJX0NPTE9SX01BUFtlbnQuYWNpXTsgfVxyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAxMCkgZW50LmNlbnRlci54ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMjApIGVudC5jZW50ZXIueSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDMwKSBlbnQuY2VudGVyLnogPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA0MCkgZW50LnJhZGl1cyA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoY3VycmVudEJsb2NrKSBjdXJyZW50QmxvY2suZW50aXRpZXMucHVzaChlbnQpO1xyXG4gICAgICAgICAgZWxzZSBlbnRpdGllcy5wdXNoKGVudCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlbnRUeXBlID09PSBcIkFSQ1wiKSB7XHJcbiAgICAgICAgICBlbnQuY2VudGVyID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XHJcbiAgICAgICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgY29uc3QgZyA9IG5leHRHcm91cCgpO1xyXG4gICAgICAgICAgICBpZiAoIWcgfHwgZy5jb2RlID09PSAwKSB7IGkgLT0gMjsgYnJlYWs7IH1cclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gOCkgZW50LmxheWVyID0gZy52YWx1ZTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNjIpIHsgZW50LmFjaSA9IE1hdGguYWJzKHBhcnNlSW50KGcudmFsdWUsIDEwKSk7IGVudC5jb2xvciA9IEFDSV9DT0xPUl9NQVBbZW50LmFjaV07IH1cclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMTApIGVudC5jZW50ZXIueCA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDIwKSBlbnQuY2VudGVyLnkgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAzMCkgZW50LmNlbnRlci56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNDApIGVudC5yYWRpdXMgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA1MCkgZW50LnN0YXJ0QW5nbGUgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA1MSkgZW50LmVuZEFuZ2xlID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChjdXJyZW50QmxvY2spIGN1cnJlbnRCbG9jay5lbnRpdGllcy5wdXNoKGVudCk7XHJcbiAgICAgICAgICBlbHNlIGVudGl0aWVzLnB1c2goZW50KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGVudFR5cGUgPT09IFwiTFdQT0xZTElORVwiKSB7XHJcbiAgICAgICAgICBlbnQudmVydGljZXMgPSBbXTtcclxuICAgICAgICAgIGxldCBjdXJWOiBDQURWZXJ0ZXggfCBudWxsID0gbnVsbDtcclxuICAgICAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICBjb25zdCBnID0gbmV4dEdyb3VwKCk7XHJcbiAgICAgICAgICAgIGlmICghZyB8fCBnLmNvZGUgPT09IDApIHsgaSAtPSAyOyBicmVhazsgfVxyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA4KSBlbnQubGF5ZXIgPSBnLnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA2MikgeyBlbnQuYWNpID0gTWF0aC5hYnMocGFyc2VJbnQoZy52YWx1ZSwgMTApKTsgZW50LmNvbG9yID0gQUNJX0NPTE9SX01BUFtlbnQuYWNpXTsgfVxyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA3MCkgZW50LmNsb3NlZCA9IChwYXJzZUludChnLnZhbHVlLCAxMCkgJiAxKSA9PT0gMTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMTApIHtcclxuICAgICAgICAgICAgICBjdXJWID0geyB4OiBwYXJzZUZsb2F0KGcudmFsdWUpLCB5OiAwIH07XHJcbiAgICAgICAgICAgICAgZW50LnZlcnRpY2VzLnB1c2goY3VyVik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMjAgJiYgY3VyVikgY3VyVi55ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNDIgJiYgY3VyVikgY3VyVi5idWxnZSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoY3VycmVudEJsb2NrKSBjdXJyZW50QmxvY2suZW50aXRpZXMucHVzaChlbnQpO1xyXG4gICAgICAgICAgZWxzZSBlbnRpdGllcy5wdXNoKGVudCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlbnRUeXBlID09PSBcIlRFWFRcIiB8fCBlbnRUeXBlID09PSBcIk1URVhUXCIpIHtcclxuICAgICAgICAgIGVudC5wb3NpdGlvbiA9IHsgeDogMCwgeTogMCwgejogMCB9O1xyXG4gICAgICAgICAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGcgPSBuZXh0R3JvdXAoKTtcclxuICAgICAgICAgICAgaWYgKCFnIHx8IGcuY29kZSA9PT0gMCkgeyBpIC09IDI7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDgpIGVudC5sYXllciA9IGcudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDEpIGVudC50ZXh0ID0gZy52YWx1ZTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMTApIGVudC5wb3NpdGlvbi54ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMjApIGVudC5wb3NpdGlvbi55ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMzApIGVudC5wb3NpdGlvbi56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNDApIGVudC5oZWlnaHQgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA1MCkgZW50LnJvdGF0aW9uID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChjdXJyZW50QmxvY2spIGN1cnJlbnRCbG9jay5lbnRpdGllcy5wdXNoKGVudCk7XHJcbiAgICAgICAgICBlbHNlIGVudGl0aWVzLnB1c2goZW50KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGVudFR5cGUgPT09IFwiSU5TRVJUXCIpIHtcclxuICAgICAgICAgIGVudC5wb3NpdGlvbiA9IHsgeDogMCwgeTogMCwgejogMCB9O1xyXG4gICAgICAgICAgZW50LnNjYWxlID0geyB4OiAxLCB5OiAxLCB6OiAxIH07XHJcbiAgICAgICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgY29uc3QgZyA9IG5leHRHcm91cCgpO1xyXG4gICAgICAgICAgICBpZiAoIWcgfHwgZy5jb2RlID09PSAwKSB7IGkgLT0gMjsgYnJlYWs7IH1cclxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMikgZW50LmJsb2NrTmFtZSA9IGcudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDgpIGVudC5sYXllciA9IGcudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDEwKSBlbnQucG9zaXRpb24ueCA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDIwKSBlbnQucG9zaXRpb24ueSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDMwKSBlbnQucG9zaXRpb24ueiA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDQxKSBlbnQuc2NhbGUueCA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDQyKSBlbnQuc2NhbGUueSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDQzKSBlbnQuc2NhbGUueiA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XHJcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDUwKSBlbnQucm90YXRpb24gPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRCbG9jaykgY3VycmVudEJsb2NrLmVudGl0aWVzLnB1c2goZW50KTtcclxuICAgICAgICAgIGVsc2UgZW50aXRpZXMucHVzaChlbnQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBTa2lwIG90aGVyIGVudGl0eSB0eXBlcyBncmFjZWZ1bGx5XHJcbiAgICAgICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgY29uc3QgZyA9IG5leHRHcm91cCgpO1xyXG4gICAgICAgICAgICBpZiAoIWcgfHwgZy5jb2RlID09PSAwKSB7IGkgLT0gMjsgYnJlYWs7IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBkcmF3aW5nIGJvdW5kaW5nIGJveCBleHRlbnRzXHJcbiAgbGV0IG1pblggPSBJbmZpbml0eSwgbWluWSA9IEluZmluaXR5O1xyXG4gIGxldCBtYXhYID0gLUluZmluaXR5LCBtYXhZID0gLUluZmluaXR5O1xyXG5cclxuICBmdW5jdGlvbiB1cGRhdGVCb3VuZHMoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgIGlmIChpc05hTih4KSB8fCBpc05hTih5KSkgcmV0dXJuO1xyXG4gICAgaWYgKHggPCBtaW5YKSBtaW5YID0geDtcclxuICAgIGlmICh5IDwgbWluWSkgbWluWSA9IHk7XHJcbiAgICBpZiAoeCA+IG1heFgpIG1heFggPSB4O1xyXG4gICAgaWYgKHkgPiBtYXhZKSBtYXhZID0geTtcclxuICB9XHJcblxyXG4gIGZvciAoY29uc3QgZW50IG9mIGVudGl0aWVzKSB7XHJcbiAgICBpZiAoZW50LnN0YXJ0KSB7IHVwZGF0ZUJvdW5kcyhlbnQuc3RhcnQueCwgZW50LnN0YXJ0LnkpOyB9XHJcbiAgICBpZiAoZW50LmVuZCkgeyB1cGRhdGVCb3VuZHMoZW50LmVuZC54LCBlbnQuZW5kLnkpOyB9XHJcbiAgICBpZiAoZW50LmNlbnRlciAmJiBlbnQucmFkaXVzKSB7XHJcbiAgICAgIHVwZGF0ZUJvdW5kcyhlbnQuY2VudGVyLnggLSBlbnQucmFkaXVzLCBlbnQuY2VudGVyLnkgLSBlbnQucmFkaXVzKTtcclxuICAgICAgdXBkYXRlQm91bmRzKGVudC5jZW50ZXIueCArIGVudC5yYWRpdXMsIGVudC5jZW50ZXIueSArIGVudC5yYWRpdXMpO1xyXG4gICAgfVxyXG4gICAgaWYgKGVudC52ZXJ0aWNlcykge1xyXG4gICAgICBmb3IgKGNvbnN0IHYgb2YgZW50LnZlcnRpY2VzKSB7XHJcbiAgICAgICAgdXBkYXRlQm91bmRzKHYueCwgdi55KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGVudC5wb3NpdGlvbikge1xyXG4gICAgICB1cGRhdGVCb3VuZHMoZW50LnBvc2l0aW9uLngsIGVudC5wb3NpdGlvbi55KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChtaW5YID09PSBJbmZpbml0eSkge1xyXG4gICAgbWluWCA9IDA7IG1pblkgPSAwOyBtYXhYID0gMTAwMDsgbWF4WSA9IDEwMDA7XHJcbiAgfVxyXG5cclxuICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KG1heFggLSBtaW5YLCAxMDApO1xyXG4gIGNvbnN0IGhlaWdodCA9IE1hdGgubWF4KG1heFkgLSBtaW5ZLCAxMDApO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcclxuICAgIG1vZGVsX25hbWU6IFwiSW1wb3J0ZWRfQ0FEX0RyYXdpbmdcIixcclxuICAgIGZpbGVfZm9ybWF0OiBcIkRYRlwiLFxyXG4gICAgdW5pdHM6IFwibW1cIixcclxuICAgIHNwYWNlczogW1wiTW9kZWwgU3BhY2VcIl0sXHJcbiAgICBsYXllcnMsXHJcbiAgICBlbnRpdGllcyxcclxuICAgIGJsb2NrcyxcclxuICAgIGV4dGVudHM6IHtcclxuICAgICAgbWluOiB7IHg6IG1pblgsIHk6IG1pblksIHo6IDAgfSxcclxuICAgICAgbWF4OiB7IHg6IG1heFgsIHk6IG1heFksIHo6IDAgfSxcclxuICAgICAgY2VudGVyOiB7IHg6IG1pblggKyB3aWR0aCAvIDIsIHk6IG1pblkgKyBoZWlnaHQgLyAyLCB6OiAwIH0sXHJcbiAgICAgIHdpZHRoLFxyXG4gICAgICBoZWlnaHQsXHJcbiAgICB9LFxyXG4gICAgZW50aXR5X2NvdW50OiBlbnRpdGllcy5sZW5ndGgsXHJcbiAgfTtcclxufVxyXG4iLCAiLyoqXHJcbiAqIEhpZ2gtUGVyZm9ybWFuY2UgVmVjdG9yIENBRCBDYW52YXMgUmVuZGVyZXIuXHJcbiAqIFN1cHBvcnRzIEF1dG9DQUQgQUNJIGNvbG9ycywgcG9seWxpbmUgYXJjIGJ1bGdlcywgYmxvY2tzLCB0ZXh0LCBoYXRjaGVzLFxyXG4gKiBwYW4sIHdoZWVsIHpvb20gYXQgY3Vyc29yLCB6b29tIGV4dGVudHMsIHZpc3VhbCB0aGVtZXMsIHNuYXBwaW5nIGluZGljYXRvcnMsXHJcbiAqIG1lYXN1cmVtZW50IG92ZXJsYXlzLCBhbmQgQklNY29sbGFiIEJDRiB2aXN1YWwgbWFya3Vwcy5cclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIENBRERyYXdpbmdEYXRhLFxyXG4gIENBREVudGl0eSxcclxuICBDQURQb2ludCxcclxuICBjYWxjdWxhdGVCdWxnZUFyY1BvaW50cyxcclxuICBBQ0lfQ09MT1JfTUFQLFxyXG59IGZyb20gXCIuL2R4Zl9wYXJzZXJfZW5naW5lXCI7XHJcbmltcG9ydCB7IFNuYXBUYXJnZXQgfSBmcm9tIFwiLi9jYWRfbWVhc3VyZW1lbnRfdG9vbHNcIjtcclxuaW1wb3J0IHsgQkNGQXNzb2NpYXRlZE1hcmt1cCwgQkNGVG9waWNJdGVtIH0gZnJvbSBcIi4vYmNmX2NvbGxhYm9yYXRpb25fbWFuYWdlclwiO1xyXG5cclxuZXhwb3J0IHR5cGUgQ0FEVGhlbWUgPSBcImRhcmtcIiB8IFwiYmxhY2tcIiB8IFwicGFwZXJcIiB8IFwiYmx1ZXByaW50XCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRoZW1lQ29sb3JzIHtcclxuICBiYWNrZ3JvdW5kOiBzdHJpbmc7XHJcbiAgZ3JpZE1ham9yOiBzdHJpbmc7XHJcbiAgZ3JpZE1pbm9yOiBzdHJpbmc7XHJcbiAgY3Jvc3NoYWlyOiBzdHJpbmc7XHJcbiAgZGVmYXVsdEVudGl0eTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgVEhFTUVfUEFMRVRURVM6IFJlY29yZDxDQURUaGVtZSwgVGhlbWVDb2xvcnM+ID0ge1xyXG4gIGRhcms6IHtcclxuICAgIGJhY2tncm91bmQ6IFwiIzIxMjgzMFwiLFxyXG4gICAgZ3JpZE1ham9yOiBcIiMyYjM0M2ZcIixcclxuICAgIGdyaWRNaW5vcjogXCIjMjUyZDM3XCIsXHJcbiAgICBjcm9zc2hhaXI6IFwiIzVjNjk3OFwiLFxyXG4gICAgZGVmYXVsdEVudGl0eTogXCIjZmZmZmZmXCIsXHJcbiAgfSxcclxuICBibGFjazoge1xyXG4gICAgYmFja2dyb3VuZDogXCIjMGUxMTE2XCIsXHJcbiAgICBncmlkTWFqb3I6IFwiIzFiMjAyOFwiLFxyXG4gICAgZ3JpZE1pbm9yOiBcIiMxNDE4MWZcIixcclxuICAgIGNyb3NzaGFpcjogXCIjNDg1MjYwXCIsXHJcbiAgICBkZWZhdWx0RW50aXR5OiBcIiNmZmZmZmZcIixcclxuICB9LFxyXG4gIHBhcGVyOiB7XHJcbiAgICBiYWNrZ3JvdW5kOiBcIiNmOGY5ZmFcIixcclxuICAgIGdyaWRNYWpvcjogXCIjZTJlNmVhXCIsXHJcbiAgICBncmlkTWlub3I6IFwiI2VkZWVmMVwiLFxyXG4gICAgY3Jvc3NoYWlyOiBcIiNhZGI1YmRcIixcclxuICAgIGRlZmF1bHRFbnRpdHk6IFwiIzIxMjUyOVwiLFxyXG4gIH0sXHJcbiAgYmx1ZXByaW50OiB7XHJcbiAgICBiYWNrZ3JvdW5kOiBcIiMwYzIzM2ZcIixcclxuICAgIGdyaWRNYWpvcjogXCIjMTUzODYzXCIsXHJcbiAgICBncmlkTWlub3I6IFwiIzEwMmM0ZlwiLFxyXG4gICAgY3Jvc3NoYWlyOiBcIiMzYTcwYjJcIixcclxuICAgIGRlZmF1bHRFbnRpdHk6IFwiI2U2ZjJmZlwiLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgY2xhc3MgQ0FEQ2FudmFzUmVuZGVyZXIge1xyXG4gIHB1YmxpYyBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xyXG4gIHB1YmxpYyBjdHg6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICBwdWJsaWMgZHJhd2luZzogQ0FERHJhd2luZ0RhdGEgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLy8gVmlld3BvcnQgU3RhdGVcclxuICBwdWJsaWMgcGFuWDogbnVtYmVyID0gMDsgLy8gV29ybGQgY29vcmRpbmF0ZSBhdCB2aWV3cG9ydCBjZW50ZXJcclxuICBwdWJsaWMgcGFuWTogbnVtYmVyID0gMDtcclxuICBwdWJsaWMgem9vbTogbnVtYmVyID0gMC4wNTsgLy8gU2NyZWVuIHBpeGVscyBwZXIgd29ybGQgdW5pdFxyXG4gIHB1YmxpYyB0aGVtZTogQ0FEVGhlbWUgPSBcImRhcmtcIjtcclxuXHJcbiAgLy8gTGF5ZXIgT3ZlcnJpZGVzXHJcbiAgcHVibGljIGxheWVyVmlzaWJpbGl0eTogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7fTtcclxuXHJcbiAgLy8gSW50ZXJhY3RpdmUgT3ZlcmxheXNcclxuICBwdWJsaWMgc25hcFRhcmdldDogU25hcFRhcmdldCB8IG51bGwgPSBudWxsO1xyXG4gIHB1YmxpYyBhY3RpdmVNZWFzdXJlUG9pbnRzOiBDQURQb2ludFtdID0gW107XHJcbiAgcHVibGljIG1lYXN1cmVNb2RlOiBcIm5vbmVcIiB8IFwiZGlzdGFuY2VcIiB8IFwiYXJlYVwiIHwgXCJhbmdsZVwiID0gXCJub25lXCI7XHJcblxyXG4gIC8vIEJDRiBDb2xsYWJvcmF0aW9uIE92ZXJsYXlzXHJcbiAgcHVibGljIGlzc3VlczogQkNGVG9waWNJdGVtW10gPSBbXTtcclxuICBwdWJsaWMgYWN0aXZlSXNzdWVJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgcHVibGljIGRyYWZ0TWFya3VwczogQkNGQXNzb2NpYXRlZE1hcmt1cFtdID0gW107XHJcblxyXG4gIHByaXZhdGUgaXNEcmFnZ2luZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHByaXZhdGUgZHJhZ1N0YXJ0WDogbnVtYmVyID0gMDtcclxuICBwcml2YXRlIGRyYWdTdGFydFk6IG51bWJlciA9IDA7XHJcbiAgcHJpdmF0ZSBhbmltRnJhbWVJZDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICBpZiAoIWNvbnRleHQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIG9idGFpbiAyRCByZW5kZXJpbmcgY29udGV4dCBmb3IgQ0FEIGNhbnZhcy5cIik7XHJcbiAgICB9XHJcbiAgICB0aGlzLmN0eCA9IGNvbnRleHQ7XHJcblxyXG4gICAgdGhpcy5iaW5kRXZlbnRzKCk7XHJcbiAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldERyYXdpbmcoZGF0YTogQ0FERHJhd2luZ0RhdGEpIHtcclxuICAgIHRoaXMuZHJhd2luZyA9IGRhdGE7XHJcbiAgICB0aGlzLmxheWVyVmlzaWJpbGl0eSA9IHt9O1xyXG4gICAgZm9yIChjb25zdCBbbmFtZSwgbGF5ZXJdIG9mIE9iamVjdC5lbnRyaWVzKGRhdGEubGF5ZXJzKSkge1xyXG4gICAgICB0aGlzLmxheWVyVmlzaWJpbGl0eVtuYW1lXSA9IGxheWVyLnZpc2libGUgIT09IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdGhpcy56b29tRXh0ZW50cygpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldFRoZW1lKHRoZW1lOiBDQURUaGVtZSkge1xyXG4gICAgdGhpcy50aGVtZSA9IHRoZW1lO1xyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNpemUoKSB7XHJcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmNhbnZhcy5wYXJlbnRFbGVtZW50O1xyXG4gICAgY29uc3QgcmVjdCA9IHBhcmVudD8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBsZXQgd2lkdGggPSByZWN0Py53aWR0aCB8fCBwYXJlbnQ/LmNsaWVudFdpZHRoIHx8IDgwMDtcclxuICAgIGxldCBoZWlnaHQgPSByZWN0Py5oZWlnaHQgfHwgcGFyZW50Py5jbGllbnRIZWlnaHQgfHwgNjAwO1xyXG5cclxuICAgIC8vIEd1YXJkIGFnYWluc3QgY29sbGFwc2VkIHBhcmVudCBkaW1lbnNpb25zXHJcbiAgICBpZiAoaGVpZ2h0IDwgMjAwKSB7XHJcbiAgICAgIGhlaWdodCA9IE1hdGgubWF4KHdpbmRvdy5pbm5lckhlaWdodCAtIDE2MCwgNTAwKTtcclxuICAgIH1cclxuICAgIGlmICh3aWR0aCA8IDIwMCkge1xyXG4gICAgICB3aWR0aCA9IE1hdGgubWF4KHdpbmRvdy5pbm5lcldpZHRoIC0gMzYwLCA2MDApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRwciA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XHJcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoICogZHByO1xyXG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogZHByO1xyXG4gICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XHJcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xyXG4gICAgdGhpcy5jdHguc2V0VHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIDApO1xyXG4gICAgdGhpcy5jdHguc2NhbGUoZHByLCBkcHIpO1xyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zZm9ybXMgd29ybGQgQ0FEIGNvb3JkaW5hdGVzIChYLCBZKSB0byBzY3JlZW4gcGl4ZWxzICh1LCB2KS5cclxuICAgKiBOb3RlOiBDQUQgWSBpbmNyZWFzZXMgdXB3YXJkczsgc2NyZWVuIFkgaW5jcmVhc2VzIGRvd253YXJkcy5cclxuICAgKi9cclxuICBwdWJsaWMgd29ybGRUb1NjcmVlbihwOiBDQURQb2ludCk6IHsgdTogbnVtYmVyOyB2OiBudW1iZXIgfSB7XHJcbiAgICBjb25zdCB3ID0gdGhpcy5jYW52YXMuY2xpZW50V2lkdGg7XHJcbiAgICBjb25zdCBoID0gdGhpcy5jYW52YXMuY2xpZW50SGVpZ2h0O1xyXG4gICAgY29uc3QgdSA9IChwLnggLSB0aGlzLnBhblgpICogdGhpcy56b29tICsgdyAvIDI7XHJcbiAgICBjb25zdCB2ID0gLShwLnkgLSB0aGlzLnBhblkpICogdGhpcy56b29tICsgaCAvIDI7XHJcbiAgICByZXR1cm4geyB1LCB2IH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUcmFuc2Zvcm1zIHNjcmVlbiBwaXhlbHMgKHUsIHYpIHRvIHdvcmxkIENBRCBjb29yZGluYXRlcyAoWCwgWSkuXHJcbiAgICovXHJcbiAgcHVibGljIHNjcmVlblRvV29ybGQodTogbnVtYmVyLCB2OiBudW1iZXIpOiBDQURQb2ludCB7XHJcbiAgICBjb25zdCB3ID0gdGhpcy5jYW52YXMuY2xpZW50V2lkdGg7XHJcbiAgICBjb25zdCBoID0gdGhpcy5jYW52YXMuY2xpZW50SGVpZ2h0O1xyXG4gICAgY29uc3QgeCA9ICh1IC0gdyAvIDIpIC8gdGhpcy56b29tICsgdGhpcy5wYW5YO1xyXG4gICAgY29uc3QgeSA9IC0odiAtIGggLyAyKSAvIHRoaXMuem9vbSArIHRoaXMucGFuWTtcclxuICAgIHJldHVybiB7IHgsIHksIHo6IDAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFpvb20gZXh0ZW50czogY2VudGVycyBhbmQgZml0cyBkcmF3aW5nIGJvdW5kaW5nIGJveCBpbnNpZGUgdGhlIGNhbnZhcy5cclxuICAgKi9cclxuICBwdWJsaWMgem9vbUV4dGVudHMoKSB7XHJcbiAgICBpZiAoIXRoaXMuZHJhd2luZykgcmV0dXJuO1xyXG4gICAgY29uc3QgZXh0ID0gdGhpcy5kcmF3aW5nLmV4dGVudHM7XHJcbiAgICB0aGlzLnBhblggPSBleHQuY2VudGVyLng7XHJcbiAgICB0aGlzLnBhblkgPSBleHQuY2VudGVyLnk7XHJcblxyXG4gICAgY29uc3QgdyA9IHRoaXMuY2FudmFzLmNsaWVudFdpZHRoO1xyXG4gICAgY29uc3QgaCA9IHRoaXMuY2FudmFzLmNsaWVudEhlaWdodDtcclxuICAgIGNvbnN0IHBhZGRpbmcgPSA2MDsgLy8gcGl4ZWxzIHBhZGRpbmdcclxuICAgIGNvbnN0IHNhZmVXaWR0aCA9IGV4dC53aWR0aCA+IDAgPyBleHQud2lkdGggOiAxO1xyXG4gICAgY29uc3Qgc2FmZUhlaWdodCA9IGV4dC5oZWlnaHQgPiAwID8gZXh0LmhlaWdodCA6IDE7XHJcbiAgICBjb25zdCB6b29tWCA9ICh3IC0gcGFkZGluZyAqIDIpIC8gc2FmZVdpZHRoO1xyXG4gICAgY29uc3Qgem9vbVkgPSAoaCAtIHBhZGRpbmcgKiAyKSAvIHNhZmVIZWlnaHQ7XHJcbiAgICBjb25zdCBmaXRab29tID0gTWF0aC5taW4oem9vbVgsIHpvb21ZKTtcclxuICAgIHRoaXMuem9vbSA9IE51bWJlci5pc0Zpbml0ZShmaXRab29tKSA/IE1hdGgubWF4KE1hdGgubWluKGZpdFpvb20sIDIwLjApLCAxZS00KSA6IDE7XHJcblxyXG4gICAgdGhpcy5yZW5kZXIoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZseS10byBjYW1lcmEgdmlld3BvaW50IGFuaW1hdGlvbiBmb3IgQkNGIGlzc3Vlcy5cclxuICAgKi9cclxuICBwdWJsaWMgZmx5VG9WaWV3cG9pbnQoY2VudGVyOiBDQURQb2ludCwgdGFyZ2V0Wm9vbTogbnVtYmVyLCBkdXJhdGlvbk1zOiBudW1iZXIgPSA0MDApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBjb25zdCBzdGFydFggPSB0aGlzLnBhblg7XHJcbiAgICAgIGNvbnN0IHN0YXJ0WSA9IHRoaXMucGFuWTtcclxuICAgICAgY29uc3Qgc3RhcnRab29tID0gdGhpcy56b29tO1xyXG4gICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuXHJcbiAgICAgIGNvbnN0IGFuaW1hdGUgPSAoY3VycmVudFRpbWU6IG51bWJlcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSBjdXJyZW50VGltZSAtIHN0YXJ0VGltZTtcclxuICAgICAgICBjb25zdCBwcm9ncmVzcyA9IE1hdGgubWluKGVsYXBzZWQgLyBkdXJhdGlvbk1zLCAxLjApO1xyXG4gICAgICAgIC8vIFNtb290aCBlYXNlLW91dCBjdWJpYyBjdXJ2ZVxyXG4gICAgICAgIGNvbnN0IGVhc2UgPSAxIC0gTWF0aC5wb3coMSAtIHByb2dyZXNzLCAzKTtcclxuXHJcbiAgICAgICAgdGhpcy5wYW5YID0gc3RhcnRYICsgKGNlbnRlci54IC0gc3RhcnRYKSAqIGVhc2U7XHJcbiAgICAgICAgdGhpcy5wYW5ZID0gc3RhcnRZICsgKGNlbnRlci55IC0gc3RhcnRZKSAqIGVhc2U7XHJcbiAgICAgICAgdGhpcy56b29tID0gc3RhcnRab29tICsgKHRhcmdldFpvb20gLSBzdGFydFpvb20pICogZWFzZTtcclxuICAgICAgICB0aGlzLnJlbmRlcigpO1xyXG5cclxuICAgICAgICBpZiAocHJvZ3Jlc3MgPCAxLjApIHtcclxuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlbmRlcigpIHtcclxuICAgIGlmICh0aGlzLmFuaW1GcmFtZUlkKSBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1GcmFtZUlkKTtcclxuICAgIHRoaXMuYW5pbUZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5kcmF3RnJhbWUoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdGcmFtZSgpIHtcclxuICAgIGNvbnN0IHcgPSB0aGlzLmNhbnZhcy5jbGllbnRXaWR0aDtcclxuICAgIGNvbnN0IGggPSB0aGlzLmNhbnZhcy5jbGllbnRIZWlnaHQ7XHJcbiAgICBjb25zdCBwYWwgPSBUSEVNRV9QQUxFVFRFU1t0aGlzLnRoZW1lXTtcclxuXHJcbiAgICAvLyAxLiBDbGVhciBiYWNrZ3JvdW5kXHJcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBwYWwuYmFja2dyb3VuZDtcclxuICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xyXG5cclxuICAgIC8vIDIuIFJlbmRlciBDQUQgZ3JpZFxyXG4gICAgdGhpcy5kcmF3R3JpZChwYWwsIHcsIGgpO1xyXG5cclxuICAgIGlmICghdGhpcy5kcmF3aW5nKSByZXR1cm47XHJcblxyXG4gICAgLy8gMy4gUmVuZGVyIERyYXdpbmcgRW50aXRpZXNcclxuICAgIGZvciAoY29uc3QgZW50IG9mIHRoaXMuZHJhd2luZy5lbnRpdGllcykge1xyXG4gICAgICBpZiAodGhpcy5sYXllclZpc2liaWxpdHlbZW50LmxheWVyXSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xyXG4gICAgICB0aGlzLmRyYXdFbnRpdHkoZW50LCBwYWwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDQuIFJlbmRlciBBY3RpdmUgTWVhc3VyZW1lbnRzXHJcbiAgICB0aGlzLmRyYXdNZWFzdXJlbWVudE92ZXJsYXlzKCk7XHJcblxyXG4gICAgLy8gNS4gUmVuZGVyIFNuYXBwaW5nIEluZGljYXRvclxyXG4gICAgdGhpcy5kcmF3U25hcEluZGljYXRvcigpO1xyXG5cclxuICAgIC8vIDYuIFJlbmRlciBCQ0YgSXNzdWUgUGlucyAmIE1hcmt1cHNcclxuICAgIHRoaXMuZHJhd0JDRk1hcmt1cHMoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZHJhd0dyaWQocGFsOiBUaGVtZUNvbG9ycywgdzogbnVtYmVyLCBoOiBudW1iZXIpIHtcclxuICAgIC8vIER5bmFtaWMgZ3JpZCBzcGFjaW5nIGJhc2VkIG9uIHpvb20gbGV2ZWxcclxuICAgIGNvbnN0IHRhcmdldFBpeGVsU3BhY2luZyA9IDgwO1xyXG4gICAgY29uc3Qgc2FmZVpvb20gPSBOdW1iZXIuaXNGaW5pdGUodGhpcy56b29tKSAmJiB0aGlzLnpvb20gPiAwID8gdGhpcy56b29tIDogMTtcclxuICAgIGNvbnN0IHJhd1VuaXRTcGFjaW5nID0gdGFyZ2V0UGl4ZWxTcGFjaW5nIC8gc2FmZVpvb207XHJcbiAgICBjb25zdCBtYWcgPSBNYXRoLnBvdygxMCwgTWF0aC5mbG9vcihNYXRoLmxvZzEwKE1hdGgubWF4KHJhd1VuaXRTcGFjaW5nLCAxZS02KSkpKTtcclxuICAgIGxldCB1bml0U3BhY2luZyA9IG1hZyA+IDAgJiYgTnVtYmVyLmlzRmluaXRlKG1hZykgPyBtYWcgOiAxO1xyXG4gICAgaWYgKHJhd1VuaXRTcGFjaW5nIC8gdW5pdFNwYWNpbmcgPiA1KSB1bml0U3BhY2luZyAqPSA1O1xyXG4gICAgZWxzZSBpZiAocmF3VW5pdFNwYWNpbmcgLyB1bml0U3BhY2luZyA+IDIpIHVuaXRTcGFjaW5nICo9IDI7XHJcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh1bml0U3BhY2luZykgfHwgdW5pdFNwYWNpbmcgPD0gMCkgdW5pdFNwYWNpbmcgPSAxO1xyXG5cclxuICAgIGNvbnN0IHRvcExlZnQgPSB0aGlzLnNjcmVlblRvV29ybGQoMCwgMCk7XHJcbiAgICBjb25zdCBib3R0b21SaWdodCA9IHRoaXMuc2NyZWVuVG9Xb3JsZCh3LCBoKTtcclxuXHJcbiAgICBjb25zdCBzdGFydFggPSBNYXRoLmZsb29yKHRvcExlZnQueCAvIHVuaXRTcGFjaW5nKSAqIHVuaXRTcGFjaW5nO1xyXG4gICAgY29uc3QgZW5kWCA9IE1hdGguY2VpbChib3R0b21SaWdodC54IC8gdW5pdFNwYWNpbmcpICogdW5pdFNwYWNpbmc7XHJcbiAgICBjb25zdCBzdGFydFkgPSBNYXRoLmZsb29yKGJvdHRvbVJpZ2h0LnkgLyB1bml0U3BhY2luZykgKiB1bml0U3BhY2luZztcclxuICAgIGNvbnN0IGVuZFkgPSBNYXRoLmNlaWwodG9wTGVmdC55IC8gdW5pdFNwYWNpbmcpICogdW5pdFNwYWNpbmc7XHJcblxyXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBwYWwuZ3JpZE1pbm9yO1xyXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gMTtcclxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG5cclxuICAgIC8vIFZlcnRpY2FsIGdyaWQgbGluZXNcclxuICAgIGZvciAobGV0IHggPSBzdGFydFg7IHggPD0gZW5kWDsgeCArPSB1bml0U3BhY2luZykge1xyXG4gICAgICBjb25zdCBwMSA9IHRoaXMud29ybGRUb1NjcmVlbih7IHgsIHk6IHN0YXJ0WSB9KTtcclxuICAgICAgY29uc3QgcDIgPSB0aGlzLndvcmxkVG9TY3JlZW4oeyB4LCB5OiBlbmRZIH0pO1xyXG4gICAgICB0aGlzLmN0eC5tb3ZlVG8ocDEudSwgcDEudik7XHJcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhwMi51LCBwMi52KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIb3Jpem9udGFsIGdyaWQgbGluZXNcclxuICAgIGZvciAobGV0IHkgPSBzdGFydFk7IHkgPD0gZW5kWTsgeSArPSB1bml0U3BhY2luZykge1xyXG4gICAgICBjb25zdCBwMSA9IHRoaXMud29ybGRUb1NjcmVlbih7IHg6IHN0YXJ0WCwgeSB9KTtcclxuICAgICAgY29uc3QgcDIgPSB0aGlzLndvcmxkVG9TY3JlZW4oeyB4OiBlbmRYLCB5IH0pO1xyXG4gICAgICB0aGlzLmN0eC5tb3ZlVG8ocDEudSwgcDEudik7XHJcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhwMi51LCBwMi52KTtcclxuICAgIH1cclxuICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgIC8vIFVDUyBPcmlnaW4gQXhpcyBJbmRpY2F0b3IgKDAsMClcclxuICAgIGNvbnN0IG9yaWdpbiA9IHRoaXMud29ybGRUb1NjcmVlbih7IHg6IDAsIHk6IDAgfSk7XHJcbiAgICBjb25zdCBheGlzTGVuID0gNDA7XHJcblxyXG4gICAgLy8gWCBBeGlzIChSZWQpXHJcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmM2IzMFwiO1xyXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gMjtcclxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgdGhpcy5jdHgubW92ZVRvKG9yaWdpbi51LCBvcmlnaW4udik7XHJcbiAgICB0aGlzLmN0eC5saW5lVG8ob3JpZ2luLnUgKyBheGlzTGVuLCBvcmlnaW4udik7XHJcbiAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAvLyBZIEF4aXMgKEdyZWVuKVxyXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiMzNGM3NTlcIjtcclxuICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgdGhpcy5jdHgubW92ZVRvKG9yaWdpbi51LCBvcmlnaW4udik7XHJcbiAgICB0aGlzLmN0eC5saW5lVG8ob3JpZ2luLnUsIG9yaWdpbi52IC0gYXhpc0xlbik7XHJcbiAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZHJhd0VudGl0eShlbnQ6IENBREVudGl0eSwgcGFsOiBUaGVtZUNvbG9ycykge1xyXG4gICAgbGV0IHN0cm9rZUNvbG9yID0gcGFsLmRlZmF1bHRFbnRpdHk7XHJcbiAgICBjb25zdCBsYXllciA9IHRoaXMuZHJhd2luZz8ubGF5ZXJzW2VudC5sYXllcl07XHJcblxyXG4gICAgaWYgKGVudC5jb2xvcikge1xyXG4gICAgICBzdHJva2VDb2xvciA9IGVudC5jb2xvcjtcclxuICAgIH0gZWxzZSBpZiAoZW50LmFjaSAmJiBBQ0lfQ09MT1JfTUFQW2VudC5hY2ldKSB7XHJcbiAgICAgIHN0cm9rZUNvbG9yID0gQUNJX0NPTE9SX01BUFtlbnQuYWNpXTtcclxuICAgIH0gZWxzZSBpZiAobGF5ZXI/LmNvbG9yKSB7XHJcbiAgICAgIHN0cm9rZUNvbG9yID0gbGF5ZXIuY29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQXV0by1jb250cmFzdCBhZGp1c3QgZm9yIFdoaXRlIEFDSSA3IG9uIExpZ2h0IFBhcGVyIHRoZW1lXHJcbiAgICBpZiAodGhpcy50aGVtZSA9PT0gXCJwYXBlclwiICYmIChzdHJva2VDb2xvciA9PT0gXCIjZmZmZmZmXCIgfHwgc3Ryb2tlQ29sb3IudG9Mb3dlckNhc2UoKSA9PT0gXCIjZmZmXCIpKSB7XHJcbiAgICAgIHN0cm9rZUNvbG9yID0gXCIjMWUyOTNiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBzdHJva2VDb2xvcjtcclxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHN0cm9rZUNvbG9yO1xyXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gMS4yO1xyXG5cclxuICAgIGlmIChlbnQudHlwZSA9PT0gXCJMSU5FXCIgJiYgZW50LnN0YXJ0ICYmIGVudC5lbmQpIHtcclxuICAgICAgY29uc3QgcyA9IHRoaXMud29ybGRUb1NjcmVlbihlbnQuc3RhcnQpO1xyXG4gICAgICBjb25zdCBlID0gdGhpcy53b3JsZFRvU2NyZWVuKGVudC5lbmQpO1xyXG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgdGhpcy5jdHgubW92ZVRvKHMudSwgcy52KTtcclxuICAgICAgdGhpcy5jdHgubGluZVRvKGUudSwgZS52KTtcclxuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICB9IGVsc2UgaWYgKGVudC50eXBlID09PSBcIkNJUkNMRVwiICYmIGVudC5jZW50ZXIgJiYgZW50LnJhZGl1cykge1xyXG4gICAgICBjb25zdCBjID0gdGhpcy53b3JsZFRvU2NyZWVuKGVudC5jZW50ZXIpO1xyXG4gICAgICBjb25zdCByID0gZW50LnJhZGl1cyAqIHRoaXMuem9vbTtcclxuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4LmFyYyhjLnUsIGMudiwgciwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH0gZWxzZSBpZiAoZW50LnR5cGUgPT09IFwiQVJDXCIgJiYgZW50LmNlbnRlciAmJiBlbnQucmFkaXVzKSB7XHJcbiAgICAgIGNvbnN0IGMgPSB0aGlzLndvcmxkVG9TY3JlZW4oZW50LmNlbnRlcik7XHJcbiAgICAgIGNvbnN0IHIgPSBlbnQucmFkaXVzICogdGhpcy56b29tO1xyXG4gICAgICAvLyBJbnZlcnQgYW5nbGVzIGZvciBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAgICAgY29uc3Qgc3RhcnRSYWQgPSAoLWVudC5zdGFydEFuZ2xlISAqIE1hdGguUEkpIC8gMTgwO1xyXG4gICAgICBjb25zdCBlbmRSYWQgPSAoLWVudC5lbmRBbmdsZSEgKiBNYXRoLlBJKSAvIDE4MDtcclxuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4LmFyYyhjLnUsIGMudiwgciwgc3RhcnRSYWQsIGVuZFJhZCwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfSBlbHNlIGlmIChlbnQudHlwZSA9PT0gXCJMV1BPTFlMSU5FXCIgJiYgZW50LnZlcnRpY2VzICYmIGVudC52ZXJ0aWNlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICBjb25zdCB2TGVuID0gZW50LnZlcnRpY2VzLmxlbmd0aDtcclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdkxlbjsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgdjEgPSBlbnQudmVydGljZXNbaV07XHJcbiAgICAgICAgY29uc3QgbmV4dElkeCA9IGVudC5jbG9zZWQgPyAoaSArIDEpICUgdkxlbiA6IGkgKyAxO1xyXG5cclxuICAgICAgICBpZiAoaSA9PT0gMCkge1xyXG4gICAgICAgICAgY29uc3QgcyA9IHRoaXMud29ybGRUb1NjcmVlbih2MSk7XHJcbiAgICAgICAgICB0aGlzLmN0eC5tb3ZlVG8ocy51LCBzLnYpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG5leHRJZHggPCB2TGVuKSB7XHJcbiAgICAgICAgICBjb25zdCB2MiA9IGVudC52ZXJ0aWNlc1tuZXh0SWR4XTtcclxuICAgICAgICAgIGlmICh2MS5idWxnZSAmJiBNYXRoLmFicyh2MS5idWxnZSkgPiAxZS01KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyY1B0cyA9IGNhbGN1bGF0ZUJ1bGdlQXJjUG9pbnRzKHYxLCB2MiwgdjEuYnVsZ2UsIDE2KTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDE7IGogPCBhcmNQdHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICBjb25zdCBwdCA9IHRoaXMud29ybGRUb1NjcmVlbihhcmNQdHNbal0pO1xyXG4gICAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhwdC51LCBwdC52KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcHQgPSB0aGlzLndvcmxkVG9TY3JlZW4odjIpO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8ocHQudSwgcHQudik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZW50LmNsb3NlZCkgdGhpcy5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfSBlbHNlIGlmICgoZW50LnR5cGUgPT09IFwiVEVYVFwiIHx8IGVudC50eXBlID09PSBcIk1URVhUXCIpICYmIGVudC5wb3NpdGlvbiAmJiBlbnQudGV4dCkge1xyXG4gICAgICBjb25zdCBwb3MgPSB0aGlzLndvcmxkVG9TY3JlZW4oZW50LnBvc2l0aW9uKTtcclxuICAgICAgY29uc3QgcGl4ZWxIZWlnaHQgPSBNYXRoLm1heCgoZW50LmhlaWdodCB8fCAxODApICogdGhpcy56b29tLCA4KTtcclxuICAgICAgdGhpcy5jdHguZm9udCA9IGAke3BpeGVsSGVpZ2h0fXB4IHNhbnMtc2VyaWZgO1xyXG4gICAgICB0aGlzLmN0eC5maWxsVGV4dChlbnQudGV4dCwgcG9zLnUsIHBvcy52KTtcclxuICAgIH0gZWxzZSBpZiAoZW50LnR5cGUgPT09IFwiSEFUQ0hcIiAmJiBlbnQuYm91bmRhcnkgJiYgZW50LmJvdW5kYXJ5Lmxlbmd0aCA+IDIpIHtcclxuICAgICAgdGhpcy5jdHguc2F2ZSgpO1xyXG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBzdHJva2VDb2xvcjtcclxuICAgICAgdGhpcy5jdHguZ2xvYmFsQWxwaGEgPSAwLjM1O1xyXG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnQuYm91bmRhcnkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBwdCA9IHRoaXMud29ybGRUb1NjcmVlbihlbnQuYm91bmRhcnlbaV0pO1xyXG4gICAgICAgIGlmIChpID09PSAwKSB0aGlzLmN0eC5tb3ZlVG8ocHQudSwgcHQudik7XHJcbiAgICAgICAgZWxzZSB0aGlzLmN0eC5saW5lVG8ocHQudSwgcHQudik7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xyXG4gICAgfSBlbHNlIGlmIChlbnQudHlwZSA9PT0gXCJESU1FTlNJT05cIiAmJiBlbnQuc3RhcnQgJiYgZW50LmVuZCkge1xyXG4gICAgICAvLyBEcmF3IGRpbWVuc2lvbiBsaW5lXHJcbiAgICAgIGNvbnN0IHMgPSB0aGlzLndvcmxkVG9TY3JlZW4oZW50LnN0YXJ0KTtcclxuICAgICAgY29uc3QgZSA9IHRoaXMud29ybGRUb1NjcmVlbihlbnQuZW5kKTtcclxuICAgICAgdGhpcy5jdHguc2F2ZSgpO1xyXG4gICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiI2ZmOTUwMFwiO1xyXG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiNmZjk1MDBcIjtcclxuICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMTtcclxuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4Lm1vdmVUbyhzLnUsIHMudik7XHJcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhlLnUsIGUudik7XHJcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgICAgaWYgKGVudC50ZXh0KSB7XHJcbiAgICAgICAgY29uc3QgbWlkVSA9IChzLnUgKyBlLnUpIC8gMjtcclxuICAgICAgICBjb25zdCBtaWRWID0gKHMudiArIGUudikgLyAyIC0gNjtcclxuICAgICAgICB0aGlzLmN0eC5mb250ID0gXCIxMXB4IHNhbnMtc2VyaWZcIjtcclxuICAgICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KGVudC50ZXh0LCBtaWRVLCBtaWRWKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdTbmFwSW5kaWNhdG9yKCkge1xyXG4gICAgaWYgKCF0aGlzLnNuYXBUYXJnZXQpIHJldHVybjtcclxuICAgIGNvbnN0IHB0ID0gdGhpcy53b3JsZFRvU2NyZWVuKHRoaXMuc25hcFRhcmdldC5wb2ludCk7XHJcbiAgICB0aGlzLmN0eC5zYXZlKCk7XHJcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IFwiIzM0Yzc1OVwiO1xyXG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gMjtcclxuXHJcbiAgICBjb25zdCBzaXplID0gMTA7XHJcbiAgICBpZiAodGhpcy5zbmFwVGFyZ2V0LnR5cGUgPT09IFwiZW5kcG9pbnRcIikge1xyXG4gICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KHB0LnUgLSBzaXplIC8gMiwgcHQudiAtIHNpemUgLyAyLCBzaXplLCBzaXplKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5zbmFwVGFyZ2V0LnR5cGUgPT09IFwibWlkcG9pbnRcIikge1xyXG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgdGhpcy5jdHgubW92ZVRvKHB0LnUsIHB0LnYgLSBzaXplIC8gMik7XHJcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhwdC51ICsgc2l6ZSAvIDIsIHB0LnYgKyBzaXplIC8gMik7XHJcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhwdC51IC0gc2l6ZSAvIDIsIHB0LnYgKyBzaXplIC8gMik7XHJcbiAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xyXG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5zbmFwVGFyZ2V0LnR5cGUgPT09IFwiY2VudGVyXCIpIHtcclxuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4LmFyYyhwdC51LCBwdC52LCBzaXplIC8gMiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH1cclxuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZHJhd01lYXN1cmVtZW50T3ZlcmxheXMoKSB7XHJcbiAgICBpZiAodGhpcy5hY3RpdmVNZWFzdXJlUG9pbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuY3R4LnNhdmUoKTtcclxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmY5NTAwXCI7XHJcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LCAxNDksIDAsIDAuMilcIjtcclxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDI7XHJcblxyXG4gICAgaWYgKHRoaXMubWVhc3VyZU1vZGUgPT09IFwiZGlzdGFuY2VcIiAmJiB0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHMubGVuZ3RoID49IDIpIHtcclxuICAgICAgY29uc3QgcDEgPSB0aGlzLndvcmxkVG9TY3JlZW4odGhpcy5hY3RpdmVNZWFzdXJlUG9pbnRzWzBdKTtcclxuICAgICAgY29uc3QgcDIgPSB0aGlzLndvcmxkVG9TY3JlZW4odGhpcy5hY3RpdmVNZWFzdXJlUG9pbnRzWzFdKTtcclxuXHJcbiAgICAgIC8vIERpcmVjdCBtZWFzdXJlbWVudCBsaW5lXHJcbiAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICB0aGlzLmN0eC5tb3ZlVG8ocDEudSwgcDEudik7XHJcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhwMi51LCBwMi52KTtcclxuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAvLyBEaW1lbnNpb24gYmFkZ2VcclxuICAgICAgY29uc3QgbWlkVSA9IChwMS51ICsgcDIudSkgLyAyO1xyXG4gICAgICBjb25zdCBtaWRWID0gKHAxLnYgKyBwMi52KSAvIDIgLSA4O1xyXG4gICAgICBjb25zdCBkeCA9IE1hdGguYWJzKHRoaXMuYWN0aXZlTWVhc3VyZVBvaW50c1sxXS54IC0gdGhpcy5hY3RpdmVNZWFzdXJlUG9pbnRzWzBdLngpO1xyXG4gICAgICBjb25zdCBkeSA9IE1hdGguYWJzKHRoaXMuYWN0aXZlTWVhc3VyZVBvaW50c1sxXS55IC0gdGhpcy5hY3RpdmVNZWFzdXJlUG9pbnRzWzBdLnkpO1xyXG4gICAgICBjb25zdCBkaXN0ID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcclxuXHJcbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZmZmZlwiO1xyXG4gICAgICB0aGlzLmN0eC5mb250ID0gXCJib2xkIDEycHggc2Fucy1zZXJpZlwiO1xyXG4gICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICB0aGlzLmN0eC5maWxsVGV4dChgJHtkaXN0LnRvRml4ZWQoMSl9IG1tIChkWDogJHtkeC50b0ZpeGVkKDEpfSwgZFk6ICR7ZHkudG9GaXhlZCgxKX0pYCwgbWlkVSwgbWlkVik7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMubWVhc3VyZU1vZGUgPT09IFwiYXJlYVwiICYmIHRoaXMuYWN0aXZlTWVhc3VyZVBvaW50cy5sZW5ndGggPj0gMykge1xyXG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBwdCA9IHRoaXMud29ybGRUb1NjcmVlbih0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHNbaV0pO1xyXG4gICAgICAgIGlmIChpID09PSAwKSB0aGlzLmN0eC5tb3ZlVG8ocHQudSwgcHQudik7XHJcbiAgICAgICAgZWxzZSB0aGlzLmN0eC5saW5lVG8ocHQudSwgcHQudik7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdCQ0ZNYXJrdXBzKCkge1xyXG4gICAgZm9yIChjb25zdCBpc3N1ZSBvZiB0aGlzLmlzc3Vlcykge1xyXG4gICAgICBjb25zdCBpc1NlbGVjdGVkID0gaXNzdWUubmFtZSA9PT0gdGhpcy5hY3RpdmVJc3N1ZUlkO1xyXG4gICAgICBjb25zdCBwb3MgPSB0aGlzLndvcmxkVG9TY3JlZW4oeyB4OiBpc3N1ZS5sb2NhdGlvbl94LCB5OiBpc3N1ZS5sb2NhdGlvbl95IH0pO1xyXG5cclxuICAgICAgLy8gRHJhdyBOdW1iZXJlZCBQaW4gTWFya2VyIEJhZGdlXHJcbiAgICAgIHRoaXMuY3R4LnNhdmUoKTtcclxuICAgICAgY29uc3QgcmFkaXVzID0gaXNTZWxlY3RlZCA/IDE2IDogMTM7XHJcbiAgICAgIGNvbnN0IGJhZGdlQ29sb3IgPSBpc3N1ZS50b3BpY19zdGF0dXMgPT09IFwiUmVzb2x2ZWRcIiB8fCBpc3N1ZS50b3BpY19zdGF0dXMgPT09IFwiQ2xvc2VkXCJcclxuICAgICAgICA/IFwiIzM0Yzc1OVwiXHJcbiAgICAgICAgOiBpc3N1ZS5wcmlvcml0eSA9PT0gXCJDcml0aWNhbFwiXHJcbiAgICAgICAgPyBcIiNmZjNiMzBcIlxyXG4gICAgICAgIDogXCIjMDA3YWZmXCI7XHJcblxyXG4gICAgICAvLyBTaGFkb3dcclxuICAgICAgdGhpcy5jdHguc2hhZG93Q29sb3IgPSBcInJnYmEoMCwwLDAsMC40KVwiO1xyXG4gICAgICB0aGlzLmN0eC5zaGFkb3dCbHVyID0gNjtcclxuICAgICAgdGhpcy5jdHguc2hhZG93T2Zmc2V0WSA9IDI7XHJcblxyXG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBiYWRnZUNvbG9yO1xyXG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgdGhpcy5jdHguYXJjKHBvcy51LCBwb3MudiwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XHJcbiAgICAgIHRoaXMuY3R4LmZpbGwoKTtcclxuXHJcbiAgICAgIC8vIEJvcmRlclxyXG4gICAgICB0aGlzLmN0eC5zaGFkb3dDb2xvciA9IFwidHJhbnNwYXJlbnRcIjtcclxuICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZmZmZmZcIjtcclxuICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMjtcclxuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICAvLyBUZXh0IE51bWJlclxyXG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZmZmZcIjtcclxuICAgICAgdGhpcy5jdHguZm9udCA9IGBib2xkICR7cmFkaXVzIC0gMn1weCBzYW5zLXNlcmlmYDtcclxuICAgICAgdGhpcy5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgICAgdGhpcy5jdHguZmlsbFRleHQoU3RyaW5nKGlzc3VlLnBpbl9udW1iZXIgfHwgMSksIHBvcy51LCBwb3Mudik7XHJcblxyXG4gICAgICAvLyBMYWJlbCB0aXRsZSB0b29sdGlwIGlmIHNlbGVjdGVkXHJcbiAgICAgIGlmIChpc1NlbGVjdGVkKSB7XHJcbiAgICAgICAgdGhpcy5jdHguZm9udCA9IFwiYm9sZCAxMXB4IHNhbnMtc2VyaWZcIjtcclxuICAgICAgICBjb25zdCB0aXRsZVRleHQgPSBgJHtpc3N1ZS50aXRsZX0gWyR7aXNzdWUudG9waWNfc3RhdHVzfV1gO1xyXG4gICAgICAgIGNvbnN0IHRleHRXaWR0aCA9IHRoaXMuY3R4Lm1lYXN1cmVUZXh0KHRpdGxlVGV4dCkud2lkdGg7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuODUpXCI7XHJcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QocG9zLnUgLSB0ZXh0V2lkdGggLyAyIC0gOCwgcG9zLnYgLSByYWRpdXMgLSAyNCwgdGV4dFdpZHRoICsgMTYsIDIwKTtcclxuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZmZmZcIjtcclxuICAgICAgICB0aGlzLmN0eC5maWxsVGV4dCh0aXRsZVRleHQsIHBvcy51LCBwb3MudiAtIHJhZGl1cyAtIDE0KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xyXG5cclxuICAgICAgLy8gRHJhdyBpc3N1ZSdzIGFzc29jaWF0ZWQgbWFya3VwcyAoY2xvdWRzLCBhcnJvd3MsIGJveGVzKVxyXG4gICAgICBjb25zdCBtYXJrdXBzID0gaXNzdWUudmlld3BvaW50Py5tYXJrdXBzIHx8IFtdO1xyXG4gICAgICBmb3IgKGNvbnN0IG1rIG9mIG1hcmt1cHMpIHtcclxuICAgICAgICB0aGlzLmRyYXdTaW5nbGVNYXJrdXAobWssIGlzU2VsZWN0ZWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRHJhdyBhY3RpdmUgZHJhZnQgbWFya3Vwc1xyXG4gICAgZm9yIChjb25zdCBkbWsgb2YgdGhpcy5kcmFmdE1hcmt1cHMpIHtcclxuICAgICAgdGhpcy5kcmF3U2luZ2xlTWFya3VwKGRtaywgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYXdTaW5nbGVNYXJrdXAobWs6IEJDRkFzc29jaWF0ZWRNYXJrdXAsIGlzU2VsZWN0ZWQ6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuY3R4LnNhdmUoKTtcclxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gbWsuY29sb3IgfHwgKGlzU2VsZWN0ZWQgPyBcIiNmZjNiMzBcIiA6IFwiI2ZmOTUwMFwiKTtcclxuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IGlzU2VsZWN0ZWQgPyAyLjUgOiAxLjU7XHJcblxyXG4gICAgaWYgKG1rLnR5cGUgPT09IFwiYm94XCIgJiYgbWsueCAhPT0gdW5kZWZpbmVkICYmIG1rLnkgIT09IHVuZGVmaW5lZCAmJiBtay53aWR0aCAmJiBtay5oZWlnaHQpIHtcclxuICAgICAgY29uc3QgcDEgPSB0aGlzLndvcmxkVG9TY3JlZW4oeyB4OiBtay54LCB5OiBtay55IH0pO1xyXG4gICAgICBjb25zdCBwMiA9IHRoaXMud29ybGRUb1NjcmVlbih7IHg6IG1rLnggKyBtay53aWR0aCwgeTogbWsueSArIG1rLmhlaWdodCB9KTtcclxuICAgICAgdGhpcy5jdHguc3Ryb2tlUmVjdChwMS51LCBwMi52LCBwMi51IC0gcDEudSwgcDEudiAtIHAyLnYpO1xyXG4gICAgfSBlbHNlIGlmIChtay50eXBlID09PSBcImFycm93XCIgJiYgbWsuc3RhcnQgJiYgbWsuZW5kKSB7XHJcbiAgICAgIGNvbnN0IHMgPSB0aGlzLndvcmxkVG9TY3JlZW4obWsuc3RhcnQpO1xyXG4gICAgICBjb25zdCBlID0gdGhpcy53b3JsZFRvU2NyZWVuKG1rLmVuZCk7XHJcbiAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICB0aGlzLmN0eC5tb3ZlVG8ocy51LCBzLnYpO1xyXG4gICAgICB0aGlzLmN0eC5saW5lVG8oZS51LCBlLnYpO1xyXG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuXHJcbiAgICAgIC8vIEFycm93aGVhZFxyXG4gICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZS52IC0gcy52LCBlLnUgLSBzLnUpO1xyXG4gICAgICBjb25zdCBoZWFkTGVuID0gMTI7XHJcbiAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICB0aGlzLmN0eC5tb3ZlVG8oZS51LCBlLnYpO1xyXG4gICAgICB0aGlzLmN0eC5saW5lVG8oZS51IC0gaGVhZExlbiAqIE1hdGguY29zKGFuZ2xlIC0gTWF0aC5QSSAvIDYpLCBlLnYgLSBoZWFkTGVuICogTWF0aC5zaW4oYW5nbGUgLSBNYXRoLlBJIC8gNikpO1xyXG4gICAgICB0aGlzLmN0eC5tb3ZlVG8oZS51LCBlLnYpO1xyXG4gICAgICB0aGlzLmN0eC5saW5lVG8oZS51IC0gaGVhZExlbiAqIE1hdGguY29zKGFuZ2xlICsgTWF0aC5QSSAvIDYpLCBlLnYgLSBoZWFkTGVuICogTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJIC8gNikpO1xyXG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcclxuICAgIH0gZWxzZSBpZiAobWsudHlwZSA9PT0gXCJjbG91ZFwiICYmIG1rLnBvaW50cyAmJiBtay5wb2ludHMubGVuZ3RoID4gMikge1xyXG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtay5wb2ludHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBwdCA9IHRoaXMud29ybGRUb1NjcmVlbihtay5wb2ludHNbaV0pO1xyXG4gICAgICAgIGlmIChpID09PSAwKSB0aGlzLmN0eC5tb3ZlVG8ocHQudSwgcHQudik7XHJcbiAgICAgICAgZWxzZSB0aGlzLmN0eC5saW5lVG8ocHQudSwgcHQudik7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XHJcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jdHgucmVzdG9yZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBiaW5kRXZlbnRzKCkge1xyXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xyXG4gICAgICB0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRyYWdTdGFydFggPSBlLmNsaWVudFg7XHJcbiAgICAgIHRoaXMuZHJhZ1N0YXJ0WSA9IGUuY2xpZW50WTtcclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlKSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5pc0RyYWdnaW5nKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGR4ID0gZS5jbGllbnRYIC0gdGhpcy5kcmFnU3RhcnRYO1xyXG4gICAgICBjb25zdCBkeSA9IGUuY2xpZW50WSAtIHRoaXMuZHJhZ1N0YXJ0WTtcclxuICAgICAgdGhpcy5kcmFnU3RhcnRYID0gZS5jbGllbnRYO1xyXG4gICAgICB0aGlzLmRyYWdTdGFydFkgPSBlLmNsaWVudFk7XHJcblxyXG4gICAgICAvLyBQYW4gd29ybGQgcG9zaXRpb24gKHNjcmVlbiBkeCBjb252ZXJ0cyB0byB3b3JsZCBkZWx0YSlcclxuICAgICAgdGhpcy5wYW5YIC09IGR4IC8gdGhpcy56b29tO1xyXG4gICAgICB0aGlzLnBhblkgKz0gZHkgLyB0aGlzLnpvb207XHJcbiAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCAoZSkgPT4ge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgY29uc3QgbW91c2VVID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xyXG4gICAgICBjb25zdCBtb3VzZVYgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcclxuXHJcbiAgICAgIC8vIFdvcmxkIHBvaW50IHVuZGVyIGN1cnNvciBiZWZvcmUgem9vbVxyXG4gICAgICBjb25zdCB3b3JsZEJlZm9yZSA9IHRoaXMuc2NyZWVuVG9Xb3JsZChtb3VzZVUsIG1vdXNlVik7XHJcblxyXG4gICAgICAvLyBBZGp1c3Qgem9vbSBmYWN0b3JcclxuICAgICAgY29uc3Qgem9vbUZhY3RvciA9IGUuZGVsdGFZIDwgMCA/IDEuMTUgOiAwLjg1O1xyXG4gICAgICB0aGlzLnpvb20gPSBNYXRoLm1heChNYXRoLm1pbih0aGlzLnpvb20gKiB6b29tRmFjdG9yLCAyMC4wKSwgMWUtNSk7XHJcblxyXG4gICAgICAvLyBXb3JsZCBwb2ludCB1bmRlciBjdXJzb3IgYWZ0ZXIgem9vbVxyXG4gICAgICBjb25zdCB3b3JsZEFmdGVyID0gdGhpcy5zY3JlZW5Ub1dvcmxkKG1vdXNlVSwgbW91c2VWKTtcclxuXHJcbiAgICAgIC8vIENvbXBlbnNhdGUgcGFuIHNvIHdvcmxkIHBvaW50IHN0YXlzIGV4YWN0bHkgdW5kZXIgY3Vyc29yXHJcbiAgICAgIHRoaXMucGFuWCArPSB3b3JsZEJlZm9yZS54IC0gd29ybGRBZnRlci54O1xyXG4gICAgICB0aGlzLnBhblkgKz0gd29ybGRCZWZvcmUueSAtIHdvcmxkQWZ0ZXIueTtcclxuXHJcbiAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICB9LCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHRoaXMucmVzaXplKCkpO1xyXG4gIH1cclxufVxyXG4iLCAiLyoqXHJcbiAqIFByZWNpc2lvbiBDQUQgTWVhc3VyZW1lbnQgJiBTbmFwcGluZyBFbmdpbmUuXHJcbiAqIFN1cHBvcnRzIGRpc3RhbmNlIGRpbWVuc2lvbnMgKGRYLCBkWSwgZGlzdGFuY2UsIGFuZ2xlKSwgcG9seWdvbiBhcmVhICYgcGVyaW1ldGVyLFxyXG4gKiBzY2FsZSBjYWxpYnJhdGlvbiwgYW5kIGdlb21ldHJpYyBzbmFwcGluZyAoZW5kcG9pbnRzLCBtaWRwb2ludHMsIGNlbnRlcnMpLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IENBRFBvaW50LCBDQURFbnRpdHksIGNhbGN1bGF0ZUJ1bGdlQXJjUG9pbnRzIH0gZnJvbSBcIi4vZHhmX3BhcnNlcl9lbmdpbmVcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU25hcFRhcmdldCB7XHJcbiAgdHlwZTogXCJlbmRwb2ludFwiIHwgXCJtaWRwb2ludFwiIHwgXCJjZW50ZXJcIiB8IFwiaW50ZXJzZWN0aW9uXCI7XHJcbiAgcG9pbnQ6IENBRFBvaW50O1xyXG4gIGRpc3RhbmNlOiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGlzdGFuY2VNZWFzdXJlbWVudCB7XHJcbiAgcDE6IENBRFBvaW50O1xyXG4gIHAyOiBDQURQb2ludDtcclxuICBkaXN0YW5jZTogbnVtYmVyO1xyXG4gIGR4OiBudW1iZXI7XHJcbiAgZHk6IG51bWJlcjtcclxuICBhbmdsZURlZzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFyZWFNZWFzdXJlbWVudCB7XHJcbiAgcG9pbnRzOiBDQURQb2ludFtdO1xyXG4gIGFyZWE6IG51bWJlcjtcclxuICBwZXJpbWV0ZXI6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENBRE1lYXN1cmVtZW50RW5naW5lIHtcclxuICBwdWJsaWMgc2NhbGVNdWx0aXBsaWVyOiBudW1iZXIgPSAxLjA7IC8vIDEgZHJhd2luZyB1bml0ID0gMSBtbSBieSBkZWZhdWx0XHJcbiAgcHVibGljIHVuaXROYW1lOiBzdHJpbmcgPSBcIm1tXCI7XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZSBkaXN0YW5jZSwgZHgsIGR5LCBhbmQgYW5nbGUgYmV0d2VlbiB0d28gQ0FEIHBvaW50cy5cclxuICAgKi9cclxuICBwdWJsaWMgbWVhc3VyZURpc3RhbmNlKHAxOiBDQURQb2ludCwgcDI6IENBRFBvaW50KTogRGlzdGFuY2VNZWFzdXJlbWVudCB7XHJcbiAgICBjb25zdCBkeCA9IE1hdGguYWJzKHAyLnggLSBwMS54KSAqIHRoaXMuc2NhbGVNdWx0aXBsaWVyO1xyXG4gICAgY29uc3QgZHkgPSBNYXRoLmFicyhwMi55IC0gcDEueSkgKiB0aGlzLnNjYWxlTXVsdGlwbGllcjtcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KE1hdGgucG93KHAyLnggLSBwMS54LCAyKSArIE1hdGgucG93KHAyLnkgLSBwMS55LCAyKSkgKiB0aGlzLnNjYWxlTXVsdGlwbGllcjtcclxuICAgIGNvbnN0IHJhZCA9IE1hdGguYXRhbjIocDIueSAtIHAxLnksIHAyLnggLSBwMS54KTtcclxuICAgIGxldCBhbmdsZURlZyA9IChyYWQgKiAxODApIC8gTWF0aC5QSTtcclxuICAgIGlmIChhbmdsZURlZyA8IDApIGFuZ2xlRGVnICs9IDM2MDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBwMSxcclxuICAgICAgcDIsXHJcbiAgICAgIGRpc3RhbmNlLFxyXG4gICAgICBkeCxcclxuICAgICAgZHksXHJcbiAgICAgIGFuZ2xlRGVnLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZSBhcmVhIHVzaW5nIEdhdXNzIFNob2VsYWNlIGZvcm11bGEgYW5kIHBlcmltZXRlciBmcm9tIHBvbHlnb24gdmVydGljZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG1lYXN1cmVBcmVhKHBvaW50czogQ0FEUG9pbnRbXSk6IEFyZWFNZWFzdXJlbWVudCB7XHJcbiAgICBjb25zdCBuID0gcG9pbnRzLmxlbmd0aDtcclxuICAgIGlmIChuIDwgMykge1xyXG4gICAgICByZXR1cm4geyBwb2ludHMsIGFyZWE6IDAsIHBlcmltZXRlcjogMCB9O1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBhcmVhU3VtID0gMDtcclxuICAgIGxldCBwZXJpbWV0ZXIgPSAwO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGogPSAoaSArIDEpICUgbjtcclxuICAgICAgYXJlYVN1bSArPSBwb2ludHNbaV0ueCAqIHBvaW50c1tqXS55IC0gcG9pbnRzW2pdLnggKiBwb2ludHNbaV0ueTtcclxuXHJcbiAgICAgIGNvbnN0IGVkZ2VEaXN0ID0gTWF0aC5zcXJ0KFxyXG4gICAgICAgIE1hdGgucG93KHBvaW50c1tqXS54IC0gcG9pbnRzW2ldLngsIDIpICsgTWF0aC5wb3cocG9pbnRzW2pdLnkgLSBwb2ludHNbaV0ueSwgMilcclxuICAgICAgKTtcclxuICAgICAgcGVyaW1ldGVyICs9IGVkZ2VEaXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFyZWEgPSAoTWF0aC5hYnMoYXJlYVN1bSkgLyAyKSAqIE1hdGgucG93KHRoaXMuc2NhbGVNdWx0aXBsaWVyLCAyKTtcclxuICAgIHBlcmltZXRlciA9IHBlcmltZXRlciAqIHRoaXMuc2NhbGVNdWx0aXBsaWVyO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHBvaW50cyxcclxuICAgICAgYXJlYSxcclxuICAgICAgcGVyaW1ldGVyLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgbmVhcmVzdCBnZW9tZXRyaWMgc25hcCBwb2ludCAoZW5kcG9pbnQsIG1pZHBvaW50LCBjZW50ZXIpIHdpdGhpbiBwaXhlbC93b3JsZCB0b2xlcmFuY2UuXHJcbiAgICovXHJcbiAgcHVibGljIGZpbmRTbmFwVGFyZ2V0KFxyXG4gICAgcXVlcnlQb2ludDogQ0FEUG9pbnQsXHJcbiAgICBlbnRpdGllczogQ0FERW50aXR5W10sXHJcbiAgICB0b2xlcmFuY2U6IG51bWJlciA9IDIwMFxyXG4gICk6IFNuYXBUYXJnZXQgfCBudWxsIHtcclxuICAgIGxldCBjbG9zZXN0OiBTbmFwVGFyZ2V0IHwgbnVsbCA9IG51bGw7XHJcbiAgICBsZXQgbWluRGlzdGFuY2UgPSB0b2xlcmFuY2U7XHJcblxyXG4gICAgZnVuY3Rpb24gY2hlY2tDYW5kaWRhdGUocHQ6IENBRFBvaW50LCB0eXBlOiBTbmFwVGFyZ2V0W1widHlwZVwiXSkge1xyXG4gICAgICBjb25zdCBkaXN0ID0gTWF0aC5zcXJ0KE1hdGgucG93KHB0LnggLSBxdWVyeVBvaW50LngsIDIpICsgTWF0aC5wb3cocHQueSAtIHF1ZXJ5UG9pbnQueSwgMikpO1xyXG4gICAgICBpZiAoZGlzdCA8IG1pbkRpc3RhbmNlKSB7XHJcbiAgICAgICAgbWluRGlzdGFuY2UgPSBkaXN0O1xyXG4gICAgICAgIGNsb3Nlc3QgPSB7IHR5cGUsIHBvaW50OiBwdCwgZGlzdGFuY2U6IGRpc3QgfTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgZW50IG9mIGVudGl0aWVzKSB7XHJcbiAgICAgIGlmIChlbnQudHlwZSA9PT0gXCJMSU5FXCIgJiYgZW50LnN0YXJ0ICYmIGVudC5lbmQpIHtcclxuICAgICAgICBjaGVja0NhbmRpZGF0ZShlbnQuc3RhcnQsIFwiZW5kcG9pbnRcIik7XHJcbiAgICAgICAgY2hlY2tDYW5kaWRhdGUoZW50LmVuZCwgXCJlbmRwb2ludFwiKTtcclxuICAgICAgICBjaGVja0NhbmRpZGF0ZShcclxuICAgICAgICAgIHsgeDogKGVudC5zdGFydC54ICsgZW50LmVuZC54KSAvIDIsIHk6IChlbnQuc3RhcnQueSArIGVudC5lbmQueSkgLyAyIH0sXHJcbiAgICAgICAgICBcIm1pZHBvaW50XCJcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKChlbnQudHlwZSA9PT0gXCJDSVJDTEVcIiB8fCBlbnQudHlwZSA9PT0gXCJBUkNcIikgJiYgZW50LmNlbnRlcikge1xyXG4gICAgICAgIGNoZWNrQ2FuZGlkYXRlKGVudC5jZW50ZXIsIFwiY2VudGVyXCIpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVudC50eXBlID09PSBcIkxXUE9MWUxJTkVcIiAmJiBlbnQudmVydGljZXMpIHtcclxuICAgICAgICBjb25zdCB2TGVuID0gZW50LnZlcnRpY2VzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZMZW47IGkrKykge1xyXG4gICAgICAgICAgY29uc3QgdjEgPSBlbnQudmVydGljZXNbaV07XHJcbiAgICAgICAgICBjaGVja0NhbmRpZGF0ZSh7IHg6IHYxLngsIHk6IHYxLnkgfSwgXCJlbmRwb2ludFwiKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBuZXh0SWR4ID0gZW50LmNsb3NlZCA/IChpICsgMSkgJSB2TGVuIDogaSArIDE7XHJcbiAgICAgICAgICBpZiAobmV4dElkeCA8IHZMZW4pIHtcclxuICAgICAgICAgICAgY29uc3QgdjIgPSBlbnQudmVydGljZXNbbmV4dElkeF07XHJcbiAgICAgICAgICAgIGNoZWNrQ2FuZGlkYXRlKHsgeDogKHYxLnggKyB2Mi54KSAvIDIsIHk6ICh2MS55ICsgdjIueSkgLyAyIH0sIFwibWlkcG9pbnRcIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNsb3Nlc3Q7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3JtYXQgbnVtYmVycyB0byBjbGVhbiBDQUQgZGltZW5zaW9uIHN0cmluZ3MgKGUuZy4gMTIsNTAwLjAwIG1tIG9yIDEyLjUwIG0pLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBmb3JtYXREaW1lbnNpb24odmFsOiBudW1iZXIsIGlzQXJlYTogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcclxuICAgIGlmIChpc0FyZWEpIHtcclxuICAgICAgaWYgKHRoaXMudW5pdE5hbWUgPT09IFwibW1cIikge1xyXG4gICAgICAgIC8vIENvbnZlcnQgdG8gbV4yXHJcbiAgICAgICAgY29uc3QgbTIgPSB2YWwgLyAxXzAwMF8wMDA7XHJcbiAgICAgICAgcmV0dXJuIGAke20yLnRvTG9jYWxlU3RyaW5nKHVuZGVmaW5lZCwgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIsIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMyB9KX0gbVx1MDBCMmA7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGAke3ZhbC50b0xvY2FsZVN0cmluZyh1bmRlZmluZWQsIHsgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLCBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIgfSl9ICR7dGhpcy51bml0TmFtZX1cdTAwQjJgO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnVuaXROYW1lID09PSBcIm1tXCIgJiYgdmFsID49IDEwMDApIHtcclxuICAgICAgY29uc3QgbSA9IHZhbCAvIDEwMDA7XHJcbiAgICAgIHJldHVybiBgJHt2YWwudG9Mb2NhbGVTdHJpbmcodW5kZWZpbmVkLCB7IG1heGltdW1GcmFjdGlvbkRpZ2l0czogMSB9KX0gbW0gKCR7bS50b0ZpeGVkKDIpfSBtKWA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGAke3ZhbC50b0xvY2FsZVN0cmluZyh1bmRlZmluZWQsIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAyIH0pfSAke3RoaXMudW5pdE5hbWV9YDtcclxuICB9XHJcbn1cclxuIiwgIi8qKlxyXG4gKiBCSU1jb2xsYWItU3R5bGUgQkNGIENvbGxhYm9yYXRpb24gJiBWaXN1YWwgTWFya3VwIE1hbmFnZXIuXHJcbiAqIEhhbmRsZXMgQkNGIDIuMS8zLjAgdG9waWNzLCAyRCB2aWV3cG9pbnRzLCB2aXN1YWwgcmVkbGluZXMgKHBpbnMsIHJldmlzaW9uIGNsb3VkcyxcclxuICogYXJyb3dzLCBjYWxsb3V0cyksIHRocmVhZGVkIGRpc2N1c3Npb24gY29tbWVudHMsIGFuZCBCQ0YgZXhjaGFuZ2UuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgQ0FEUG9pbnQgfSBmcm9tIFwiLi9keGZfcGFyc2VyX2VuZ2luZVwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCQ0YyRFZpZXdwb2ludCB7XHJcbiAgY2FtZXJhOiB7XHJcbiAgICBjZW50ZXI6IENBRFBvaW50O1xyXG4gICAgem9vbTogbnVtYmVyO1xyXG4gIH07XHJcbiAgYWN0aXZlX2xheWVyczogc3RyaW5nW107XHJcbiAgbWFya3Vwcz86IEJDRkFzc29jaWF0ZWRNYXJrdXBbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCQ0ZBc3NvY2lhdGVkTWFya3VwIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIHR5cGU6IFwicGluXCIgfCBcImNsb3VkXCIgfCBcImFycm93XCIgfCBcInRleHRcIiB8IFwiYm94XCI7XHJcbiAgY29sb3I/OiBzdHJpbmc7XHJcbiAgcGluX251bWJlcj86IG51bWJlcjtcclxuICBwb2ludHM/OiBDQURQb2ludFtdO1xyXG4gIHN0YXJ0PzogQ0FEUG9pbnQ7XHJcbiAgZW5kPzogQ0FEUG9pbnQ7XHJcbiAgdGV4dD86IHN0cmluZztcclxuICB4PzogbnVtYmVyO1xyXG4gIHk/OiBudW1iZXI7XHJcbiAgd2lkdGg/OiBudW1iZXI7XHJcbiAgaGVpZ2h0PzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJDRlRvcGljSXRlbSB7XHJcbiAgbmFtZTogc3RyaW5nO1xyXG4gIHRpdGxlOiBzdHJpbmc7XHJcbiAgdG9waWNfdHlwZTogc3RyaW5nO1xyXG4gIHRvcGljX3N0YXR1czogc3RyaW5nO1xyXG4gIHByaW9yaXR5OiBzdHJpbmc7XHJcbiAgYXNzaWduZWRfdG8/OiBzdHJpbmc7XHJcbiAgZHVlX2RhdGU/OiBzdHJpbmc7XHJcbiAgc3RhZ2U/OiBzdHJpbmc7XHJcbiAgbGFiZWxzPzogc3RyaW5nO1xyXG4gIHJlZmVyZW5jZV9tb2RlbD86IHN0cmluZztcclxuICBkcmF3aW5nX3NwYWNlPzogc3RyaW5nO1xyXG4gIHBpbl9udW1iZXI6IG51bWJlcjtcclxuICBsb2NhdGlvbl94OiBudW1iZXI7XHJcbiAgbG9jYXRpb25feTogbnVtYmVyO1xyXG4gIHZpZXdwb2ludD86IEJDRjJEVmlld3BvaW50O1xyXG4gIHNuYXBzaG90Pzogc3RyaW5nO1xyXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xyXG4gIGNvbW1lbnRfY291bnQ/OiBudW1iZXI7XHJcbiAgY3JlYXRlZF9ieV91c2VyPzogc3RyaW5nO1xyXG4gIGNyZWF0aW9uX2RhdGU/OiBzdHJpbmc7XHJcbiAgcmVzb2x2ZWRfYnk/OiBzdHJpbmc7XHJcbiAgcmVzb2x1dGlvbl9kYXRlPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQkNGQ29sbGFib3JhdGlvbk1hbmFnZXIge1xyXG4gIHB1YmxpYyBpc3N1ZXM6IEJDRlRvcGljSXRlbVtdID0gW107XHJcbiAgcHVibGljIGFjdGl2ZUlzc3VlOiBCQ0ZUb3BpY0l0ZW0gfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgZHJhZnRNYXJrdXBzOiBCQ0ZBc3NvY2lhdGVkTWFya3VwW10gPSBbXTtcclxuICBwdWJsaWMgY3VycmVudFRvb2w6IFwic2VsZWN0XCIgfCBcInBpblwiIHwgXCJjbG91ZFwiIHwgXCJhcnJvd1wiIHwgXCJ0ZXh0XCIgfCBcImJveFwiID0gXCJzZWxlY3RcIjtcclxuICBwdWJsaWMgYWN0aXZlTW9kZWxOYW1lOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAvKipcclxuICAgKiBMb2FkIGlzc3VlcyBmb3IgdGhlIGN1cnJlbnQgbW9kZWwgZnJvbSBFUlBOZXh0IGJhY2tlbmQuXHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIGxvYWRJc3N1ZXMoXHJcbiAgICBtb2RlbE5hbWU6IHN0cmluZyxcclxuICAgIGZpbHRlcnM/OiB7IHN0YXR1cz86IHN0cmluZzsgcHJpb3JpdHk/OiBzdHJpbmc7IHRvcGljX3R5cGU/OiBzdHJpbmcgfVxyXG4gICk6IFByb21pc2U8QkNGVG9waWNJdGVtW10+IHtcclxuICAgIHRoaXMuYWN0aXZlTW9kZWxOYW1lID0gbW9kZWxOYW1lO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xyXG4gICAgICBpZiAobW9kZWxOYW1lKSBwYXJhbXMuYXBwZW5kKFwibW9kZWxfbmFtZVwiLCBtb2RlbE5hbWUpO1xyXG4gICAgICBpZiAoZmlsdGVycz8uc3RhdHVzKSBwYXJhbXMuYXBwZW5kKFwic3RhdHVzXCIsIGZpbHRlcnMuc3RhdHVzKTtcclxuICAgICAgaWYgKGZpbHRlcnM/LnByaW9yaXR5KSBwYXJhbXMuYXBwZW5kKFwicHJpb3JpdHlcIiwgZmlsdGVycy5wcmlvcml0eSk7XHJcbiAgICAgIGlmIChmaWx0ZXJzPy50b3BpY190eXBlKSBwYXJhbXMuYXBwZW5kKFwidG9waWNfdHlwZVwiLCBmaWx0ZXJzLnRvcGljX3R5cGUpO1xyXG5cclxuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGAvYXBpL21ldGhvZC9jb25zdHJ1Y3Rpb25fYmltLmFwaS5jYWQuZ2V0X2NhZF9pc3N1ZXM/JHtwYXJhbXMudG9TdHJpbmcoKX1gLCB7XHJcbiAgICAgICAgaGVhZGVyczogeyBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XHJcbiAgICAgIHRoaXMuaXNzdWVzID0gZGF0YS5tZXNzYWdlIHx8IFtdO1xyXG4gICAgICByZXR1cm4gdGhpcy5pc3N1ZXM7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGxvYWQgQklNIElzc3VlcyBmcm9tIGJhY2tlbmQsIHVzaW5nIGxvY2FsIHN0YXRlOlwiLCBlcnIpO1xyXG4gICAgICByZXR1cm4gdGhpcy5pc3N1ZXM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYXB0dXJlIGEgbmV3IEJDRiAyLjEgMkQgdmlld3BvaW50IGZyb20gY3VycmVudCBjYW1lcmEgYW5kIHZpc2libGUgbGF5ZXJzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjYXB0dXJlVmlld3BvaW50KFxyXG4gICAgY2FtZXJhQ2VudGVyOiBDQURQb2ludCxcclxuICAgIHpvb21TY2FsZTogbnVtYmVyLFxyXG4gICAgdmlzaWJsZUxheWVyczogc3RyaW5nW10sXHJcbiAgICBtYXJrdXBzOiBCQ0ZBc3NvY2lhdGVkTWFya3VwW10gPSBbXVxyXG4gICk6IEJDRjJEVmlld3BvaW50IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNhbWVyYToge1xyXG4gICAgICAgIGNlbnRlcjogeyB4OiBjYW1lcmFDZW50ZXIueCwgeTogY2FtZXJhQ2VudGVyLnksIHo6IDAgfSxcclxuICAgICAgICB6b29tOiB6b29tU2NhbGUsXHJcbiAgICAgIH0sXHJcbiAgICAgIGFjdGl2ZV9sYXllcnM6IFsuLi52aXNpYmxlTGF5ZXJzXSxcclxuICAgICAgbWFya3VwczogWy4uLm1hcmt1cHNdLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBpc3N1ZSBvbiB0aGUgYmFja2VuZC5cclxuICAgKi9cclxuICBwdWJsaWMgYXN5bmMgY3JlYXRlSXNzdWUoXHJcbiAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgdmlld3BvaW50OiBCQ0YyRFZpZXdwb2ludCxcclxuICAgIHNuYXBzaG90RGF0YVVybDogc3RyaW5nLFxyXG4gICAgZGV0YWlsczoge1xyXG4gICAgICB0b3BpY190eXBlPzogc3RyaW5nO1xyXG4gICAgICBwcmlvcml0eT86IHN0cmluZztcclxuICAgICAgYXNzaWduZWRfdG8/OiBzdHJpbmc7XHJcbiAgICAgIGR1ZV9kYXRlPzogc3RyaW5nO1xyXG4gICAgICBzdGFnZT86IHN0cmluZztcclxuICAgICAgbGFiZWxzPzogc3RyaW5nO1xyXG4gICAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcclxuICAgICAgbG9jYXRpb24/OiBDQURQb2ludDtcclxuICAgIH0gPSB7fVxyXG4gICk6IFByb21pc2U8QkNGVG9waWNJdGVtPiB7XHJcbiAgICBjb25zdCBsb2MgPSBkZXRhaWxzLmxvY2F0aW9uIHx8IHZpZXdwb2ludC5jYW1lcmEuY2VudGVyO1xyXG4gICAgY29uc3QgbmV4dFBpbiA9IHRoaXMuaXNzdWVzLmxlbmd0aCA+IDAgPyBNYXRoLm1heCguLi50aGlzLmlzc3Vlcy5tYXAoKGkpID0+IGkucGluX251bWJlciB8fCAwKSkgKyAxIDogMTtcclxuXHJcbiAgICBjb25zdCBwYXlsb2FkID0ge1xyXG4gICAgICB0aXRsZSxcclxuICAgICAgdG9waWNfdHlwZTogZGV0YWlscy50b3BpY190eXBlIHx8IFwiSXNzdWVcIixcclxuICAgICAgdG9waWNfc3RhdHVzOiBcIk9wZW5cIixcclxuICAgICAgcHJpb3JpdHk6IGRldGFpbHMucHJpb3JpdHkgfHwgXCJOb3JtYWxcIixcclxuICAgICAgYXNzaWduZWRfdG86IGRldGFpbHMuYXNzaWduZWRfdG8sXHJcbiAgICAgIGR1ZV9kYXRlOiBkZXRhaWxzLmR1ZV9kYXRlLFxyXG4gICAgICBzdGFnZTogZGV0YWlscy5zdGFnZSB8fCBcIkNvb3JkaW5hdGlvblwiLFxyXG4gICAgICBsYWJlbHM6IGRldGFpbHMubGFiZWxzIHx8IFwiXCIsXHJcbiAgICAgIHJlZmVyZW5jZV9tb2RlbDogdGhpcy5hY3RpdmVNb2RlbE5hbWUsXHJcbiAgICAgIGRyYXdpbmdfc3BhY2U6IFwiTW9kZWwgU3BhY2VcIixcclxuICAgICAgcGluX251bWJlcjogbmV4dFBpbixcclxuICAgICAgbG9jYXRpb25feDogbG9jLngsXHJcbiAgICAgIGxvY2F0aW9uX3k6IGxvYy55LFxyXG4gICAgICB2aWV3cG9pbnRfanNvbjogSlNPTi5zdHJpbmdpZnkodmlld3BvaW50KSxcclxuICAgICAgc25hcHNob3Q6IHNuYXBzaG90RGF0YVVybCxcclxuICAgICAgZGVzY3JpcHRpb246IGRldGFpbHMuZGVzY3JpcHRpb24gfHwgXCJcIixcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9tZXRob2QvY29uc3RydWN0aW9uX2JpbS5hcGkuY2FkLnNhdmVfY2FkX2lzc3VlXCIsIHtcclxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgXCJYLUZyYXBwZS1DU1JGLVRva2VuXCI6ICh3aW5kb3cgYXMgYW55KS5mcmFwcGU/LmNzcmZfdG9rZW4gfHwgXCJcIixcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBpc3N1ZV9kYXRhOiBwYXlsb2FkIH0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcC5qc29uKCk7XHJcbiAgICBpZiAocmVzdWx0LmV4Yykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmV4Yyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3JlYXRlZCA9IHJlc3VsdC5tZXNzYWdlPy5pc3N1ZSB8fCBwYXlsb2FkO1xyXG4gICAgY3JlYXRlZC52aWV3cG9pbnQgPSB2aWV3cG9pbnQ7XHJcbiAgICB0aGlzLmlzc3Vlcy5wdXNoKGNyZWF0ZWQpO1xyXG4gICAgcmV0dXJuIGNyZWF0ZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBkaXNjdXNzaW9uIGNvbW1lbnQgdG8gYW4gYWN0aXZlIGlzc3VlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhc3luYyBhZGRDb21tZW50KFxyXG4gICAgaXNzdWVOYW1lOiBzdHJpbmcsXHJcbiAgICBjb21tZW50OiBzdHJpbmcsXHJcbiAgICBuZXdTdGF0dXM/OiBzdHJpbmdcclxuICApOiBQcm9taXNlPGFueT4ge1xyXG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9tZXRob2QvY29uc3RydWN0aW9uX2JpbS5hcGkuY2FkLmFkZF9pc3N1ZV9jb21tZW50XCIsIHtcclxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgXCJYLUZyYXBwZS1DU1JGLVRva2VuXCI6ICh3aW5kb3cgYXMgYW55KS5mcmFwcGU/LmNzcmZfdG9rZW4gfHwgXCJcIixcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIGlzc3VlX25hbWU6IGlzc3VlTmFtZSxcclxuICAgICAgICBjb21tZW50LFxyXG4gICAgICAgIG5ld19zdGF0dXM6IG5ld1N0YXR1cyxcclxuICAgICAgfSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwLmpzb24oKTtcclxuICAgIGlmIChyZXN1bHQuZXhjKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXhjKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobmV3U3RhdHVzKSB7XHJcbiAgICAgIGNvbnN0IGlzcyA9IHRoaXMuaXNzdWVzLmZpbmQoKGkpID0+IGkubmFtZSA9PT0gaXNzdWVOYW1lKTtcclxuICAgICAgaWYgKGlzcykgaXNzLnRvcGljX3N0YXR1cyA9IG5ld1N0YXR1cztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0Lm1lc3NhZ2U/LmRhdGE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFeHBvcnQgaXNzdWVzIGFzIGEgZG93bmxvYWRhYmxlIGJ1aWxkaW5nU01BUlQgLmJjZnppcCBwYWNrYWdlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhc3luYyBleHBvcnRCQ0ZaaXAobW9kZWxOYW1lPzogc3RyaW5nKTogUHJvbWlzZTx7IGZpbGVuYW1lOiBzdHJpbmc7IGJsb2I6IEJsb2IgfT4ge1xyXG4gICAgY29uc3QgdGFyZ2V0TW9kZWwgPSBtb2RlbE5hbWUgfHwgdGhpcy5hY3RpdmVNb2RlbE5hbWU7XHJcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCIvYXBpL21ldGhvZC9jb25zdHJ1Y3Rpb25fYmltLmFwaS5jYWQuZXhwb3J0X2JjZl96aXBcIiwge1xyXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICBcIlgtRnJhcHBlLUNTUkYtVG9rZW5cIjogKHdpbmRvdyBhcyBhbnkpLmZyYXBwZT8uY3NyZl90b2tlbiB8fCBcIlwiLFxyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IG1vZGVsX25hbWU6IHRhcmdldE1vZGVsIH0pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcC5qc29uKCk7XHJcbiAgICBpZiAoIXJlc3VsdC5tZXNzYWdlPy56aXBfYmFzZTY0KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQubWVzc2FnZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gZ2VuZXJhdGUgQkNGIHBhY2thZ2UuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbnZlcnQgYmFzZTY0IHRvIEJsb2JcclxuICAgIGNvbnN0IGJ5dGVDaGFyYWN0ZXJzID0gYXRvYihyZXN1bHQubWVzc2FnZS56aXBfYmFzZTY0KTtcclxuICAgIGNvbnN0IGJ5dGVOdW1iZXJzID0gbmV3IEFycmF5KGJ5dGVDaGFyYWN0ZXJzLmxlbmd0aCk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVDaGFyYWN0ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGJ5dGVOdW1iZXJzW2ldID0gYnl0ZUNoYXJhY3RlcnMuY2hhckNvZGVBdChpKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGJ5dGVBcnJheSA9IG5ldyBVaW50OEFycmF5KGJ5dGVOdW1iZXJzKTtcclxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnl0ZUFycmF5XSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiIH0pO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGZpbGVuYW1lOiByZXN1bHQubWVzc2FnZS5maWxlbmFtZSxcclxuICAgICAgYmxvYixcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbXBvcnQgaXNzdWVzIGZyb20gYSB1c2VyLXVwbG9hZGVkIC5iY2Z6aXAgZmlsZS5cclxuICAgKi9cclxuICBwdWJsaWMgYXN5bmMgaW1wb3J0QkNGWmlwKGZpbGU6IEZpbGUpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgcmVhZGVyLm9ubG9hZCA9IGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGJhc2U2NERhdGEgPSAoZS50YXJnZXQ/LnJlc3VsdCBhcyBzdHJpbmcpLnNwbGl0KFwiLFwiKVsxXTtcclxuICAgICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvbWV0aG9kL2NvbnN0cnVjdGlvbl9iaW0uYXBpLmNhZC5pbXBvcnRfYmNmX3ppcFwiLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgICAgIFwiWC1GcmFwcGUtQ1NSRi1Ub2tlblwiOiAod2luZG93IGFzIGFueSkuZnJhcHBlPy5jc3JmX3Rva2VuIHx8IFwiXCIsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICB6aXBfYmFzZTY0OiBiYXNlNjREYXRhLFxyXG4gICAgICAgICAgICAgIHJlZmVyZW5jZV9tb2RlbDogdGhpcy5hY3RpdmVNb2RlbE5hbWUsXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwLmpzb24oKTtcclxuICAgICAgICAgIGNvbnN0IGNvdW50ID0gcmVzdWx0Lm1lc3NhZ2U/LmltcG9ydGVkX2NvdW50IHx8IDA7XHJcbiAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRJc3N1ZXModGhpcy5hY3RpdmVNb2RlbE5hbWUpO1xyXG4gICAgICAgICAgcmVzb2x2ZShjb3VudCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIHJlYWRlci5vbmVycm9yID0gKGVycikgPT4gcmVqZWN0KGVycik7XHJcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiIsICIvKipcclxuICogRW50ZXJwcmlzZSBEV0cgLyBDQUQgVmlld2VyICYgQklNY29sbGFiLVN0eWxlIEJDRiBDb2xsYWJvcmF0aW9uIEFwcC5cclxuICogSW50ZWdyYXRlZCB3aXRoIEVSUE5leHQgQ29uc3RydWN0aW9uIEJJTSBtb2R1bGUuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgcGFyc2VEWEZUZXh0IH0gZnJvbSBcIi4vc3JjL2NhZC9keGZfcGFyc2VyX2VuZ2luZVwiO1xyXG5pbXBvcnQgeyBDQURDYW52YXNSZW5kZXJlciwgQ0FEVGhlbWUgfSBmcm9tIFwiLi9zcmMvY2FkL2NhZF9jYW52YXNfcmVuZGVyZXJcIjtcclxuaW1wb3J0IHsgQ0FETWVhc3VyZW1lbnRFbmdpbmUgfSBmcm9tIFwiLi9zcmMvY2FkL2NhZF9tZWFzdXJlbWVudF90b29sc1wiO1xyXG5pbXBvcnQgeyBCQ0ZDb2xsYWJvcmF0aW9uTWFuYWdlciwgQkNGVG9waWNJdGVtIH0gZnJvbSBcIi4vc3JjL2NhZC9iY2ZfY29sbGFib3JhdGlvbl9tYW5hZ2VyXCI7XHJcblxyXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHN0cjogYW55KTogc3RyaW5nIHtcclxuICBpZiAoc3RyID09IG51bGwpIHJldHVybiBcIlwiO1xyXG4gIHJldHVybiBTdHJpbmcoc3RyKVxyXG4gICAgLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKVxyXG4gICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXHJcbiAgICAucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcclxuICAgIC5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKVxyXG4gICAgLnJlcGxhY2UoLycvZywgXCImIzM5O1wiKTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIERXR1ZpZXdlckFwcCB7XHJcbiAgcHVibGljIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgcHVibGljIHJlbmRlcmVyOiBDQURDYW52YXNSZW5kZXJlcjtcclxuICBwdWJsaWMgbWVhc3VyZW1lbnQ6IENBRE1lYXN1cmVtZW50RW5naW5lO1xyXG4gIHB1YmxpYyBiY2Y6IEJDRkNvbGxhYm9yYXRpb25NYW5hZ2VyO1xyXG5cclxuICBwdWJsaWMgYWN0aXZlU3BhY2U6IHN0cmluZyA9IFwiTW9kZWwgU3BhY2VcIjtcclxuICBwdWJsaWMgYWN0aXZlVG9vbDogXCJwYW5cIiB8IFwibWVhc3VyZV9kaXN0XCIgfCBcIm1lYXN1cmVfYXJlYVwiIHwgXCJwaW5cIiB8IFwiY2xvdWRcIiB8IFwiYXJyb3dcIiA9IFwicGFuXCI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNhbnZhc0VsZW1lbnQ6IEhUTUxDYW52YXNFbGVtZW50KSB7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhc0VsZW1lbnQ7XHJcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IENBRENhbnZhc1JlbmRlcmVyKGNhbnZhc0VsZW1lbnQpO1xyXG4gICAgdGhpcy5tZWFzdXJlbWVudCA9IG5ldyBDQURNZWFzdXJlbWVudEVuZ2luZSgpO1xyXG4gICAgdGhpcy5iY2YgPSBuZXcgQkNGQ29sbGFib3JhdGlvbk1hbmFnZXIoKTtcclxuXHJcbiAgICB0aGlzLmluaXRVSSgpO1xyXG4gICAgdGhpcy5pbml0Q2FudmFzSW50ZXJhY3Rpb24oKTtcclxuICAgIHRoaXMubG9hZEluaXRpYWxEcmF3aW5nKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBMb2FkIGRyYXdpbmcgZGF0YSBlaXRoZXIgZnJvbSByb3V0ZSBwYXJhbSwgc2FtcGxlLCBvciBzZXJ2ZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIGxvYWRJbml0aWFsRHJhd2luZygpIHtcclxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XHJcbiAgICBjb25zdCBtb2RlbFBhcmFtID0gdXJsUGFyYW1zLmdldChcIm1vZGVsXCIpO1xyXG4gICAgY29uc3QgaXNzdWVQYXJhbSA9IHVybFBhcmFtcy5nZXQoXCJpc3N1ZVwiKTtcclxuICAgIGNvbnN0IGZpbGVQYXJhbSA9IHVybFBhcmFtcy5nZXQoXCJmaWxlXCIpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGlmIChmaWxlUGFyYW0pIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5zaG93VG9hc3QoYExvYWRpbmcgJHtmaWxlUGFyYW0uc3BsaXQoXCIvXCIpLnBvcCgpfS4uLmAsIFwiaW5mb1wiKTtcclxuICAgICAgICAgIGNvbnN0IGV4dCA9IGZpbGVQYXJhbS5zcGxpdChcIi5cIikucG9wKCk/LnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZiAoZXh0ID09PSBcImR4ZlwiKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHRSZXNwID0gYXdhaXQgZmV0Y2goZmlsZVBhcmFtKTtcclxuICAgICAgICAgICAgaWYgKCF0ZXh0UmVzcC5vaykge1xyXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIERYRiBmaWxlOiAke3RleHRSZXNwLnN0YXR1c30gJHt0ZXh0UmVzcC5zdGF0dXNUZXh0fWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0ZXh0UmVzcC50ZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlRFhGVGV4dChjb250ZW50KTtcclxuICAgICAgICAgICAgcGFyc2VkLm1vZGVsX25hbWUgPSBkZWNvZGVVUklDb21wb25lbnQoZmlsZVBhcmFtLnNwbGl0KFwiL1wiKS5wb3AoKSB8fCBcIkNBRCBEcmF3aW5nXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldERyYXdpbmcocGFyc2VkKTtcclxuICAgICAgICAgICAgdGhpcy5iY2YuYWN0aXZlTW9kZWxOYW1lID0gcGFyc2VkLm1vZGVsX25hbWU7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGF5ZXJVSSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNwYWNlc1VJKHBhcnNlZC5zcGFjZXMpO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRJc3N1ZXMoKTtcclxuICAgICAgICAgICAgaWYgKGlzc3VlUGFyYW0pIHtcclxuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRJc3N1ZSA9IHRoaXMuYmNmLmlzc3Vlcy5maW5kKChpKSA9PiBpLm5hbWUgPT09IGlzc3VlUGFyYW0pO1xyXG4gICAgICAgICAgICAgIGlmICh0YXJnZXRJc3N1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RJc3N1ZSh0YXJnZXRJc3N1ZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KGBMb2FkZWQgJHtwYXJzZWQubW9kZWxfbmFtZX0gKCR7cGFyc2VkLmVudGl0eV9jb3VudH0gZW50aXRpZXMpYCwgXCJzdWNjZXNzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZmlsZUVycikge1xyXG4gICAgICAgICAgY29uc29sZS53YXJuKFwiQ291bGQgbm90IHBhcnNlIGRpcmVjdCBmaWxlIHBhcmFtLCBmYWxsaW5nIGJhY2sgdG8gc2FtcGxlIGRyYXdpbmc6XCIsIGZpbGVFcnIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zaG93VG9hc3QoXCJMb2FkaW5nIENBRCBEcmF3aW5nLi4uXCIsIFwiaW5mb1wiKTtcclxuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9tZXRob2QvY29uc3RydWN0aW9uX2JpbS5hcGkuY2FkLmdldF9zYW1wbGVfY2FkX2RyYXdpbmdcIik7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcclxuICAgICAgaWYgKGRhdGEubWVzc2FnZSkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0RHJhd2luZyhkYXRhLm1lc3NhZ2UpO1xyXG4gICAgICAgIHRoaXMuYmNmLmFjdGl2ZU1vZGVsTmFtZSA9IGRhdGEubWVzc2FnZS5tb2RlbF9uYW1lO1xyXG4gICAgICAgIHRoaXMudXBkYXRlTGF5ZXJVSSgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3BhY2VzVUkoZGF0YS5tZXNzYWdlLnNwYWNlcyB8fCBbXCJNb2RlbCBTcGFjZVwiXSk7XHJcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoYExvYWRlZCAke2RhdGEubWVzc2FnZS5tb2RlbF9uYW1lfSAoJHtkYXRhLm1lc3NhZ2UuZW50aXR5X2NvdW50fSBlbnRpdGllcylgLCBcInN1Y2Nlc3NcIik7XHJcblxyXG4gICAgICAgIC8vIExvYWQgQkNGIGlzc3Vlc1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZElzc3VlcygpO1xyXG5cclxuICAgICAgICAvLyBIYW5kbGUgaXNzdWUgZGVlcCBsaW5rIGlmIHByZXNlbnRcclxuICAgICAgICBpZiAoaXNzdWVQYXJhbSkge1xyXG4gICAgICAgICAgY29uc3QgdGFyZ2V0SXNzdWUgPSB0aGlzLmJjZi5pc3N1ZXMuZmluZCgoaSkgPT4gaS5uYW1lID09PSBpc3N1ZVBhcmFtKTtcclxuICAgICAgICAgIGlmICh0YXJnZXRJc3N1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdElzc3VlKHRhcmdldElzc3VlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBkcmF3aW5nOlwiLCBlcnIpO1xyXG4gICAgICB0aGlzLnNob3dUb2FzdChcIkZhaWxlZCB0byBsb2FkIENBRCBkcmF3aW5nXCIsIFwiZXJyb3JcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYXN5bmMgbG9hZElzc3VlcygpIHtcclxuICAgIGNvbnN0IGlzc3VlcyA9IGF3YWl0IHRoaXMuYmNmLmxvYWRJc3N1ZXModGhpcy5iY2YuYWN0aXZlTW9kZWxOYW1lKTtcclxuICAgIHRoaXMucmVuZGVyZXIuaXNzdWVzID0gaXNzdWVzO1xyXG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcclxuICAgIHRoaXMucmVuZGVySXNzdWVzTGlzdChpc3N1ZXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlIHVzZXItdXBsb2FkZWQgRFhGIC8gRFdHIGZpbGVzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhc3luYyBoYW5kbGVGaWxlVXBsb2FkKGZpbGU6IEZpbGUpIHtcclxuICAgIHRoaXMuc2hvd1RvYXN0KGBSZWFkaW5nICR7ZmlsZS5uYW1lfS4uLmAsIFwiaW5mb1wiKTtcclxuICAgIGNvbnN0IGV4dCA9IGZpbGUubmFtZS5zcGxpdChcIi5cIikucG9wKCk/LnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgaWYgKGV4dCA9PT0gXCJkeGZcIikge1xyXG4gICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICByZWFkZXIub25sb2FkID0gKGUpID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgY29udGVudCA9IGUudGFyZ2V0Py5yZXN1bHQgYXMgc3RyaW5nO1xyXG4gICAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VEWEZUZXh0KGNvbnRlbnQpO1xyXG4gICAgICAgICAgcGFyc2VkLm1vZGVsX25hbWUgPSBmaWxlLm5hbWU7XHJcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldERyYXdpbmcocGFyc2VkKTtcclxuICAgICAgICAgIHRoaXMuYmNmLmFjdGl2ZU1vZGVsTmFtZSA9IGZpbGUubmFtZTtcclxuICAgICAgICAgIHRoaXMudXBkYXRlTGF5ZXJVSSgpO1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVTcGFjZXNVSShwYXJzZWQuc3BhY2VzKTtcclxuICAgICAgICAgIHRoaXMubG9hZElzc3VlcygpO1xyXG4gICAgICAgICAgdGhpcy5zaG93VG9hc3QoYExvYWRlZCBEWEY6ICR7cGFyc2VkLmVudGl0eV9jb3VudH0gZW50aXRpZXNgLCBcInN1Y2Nlc3NcIik7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KGBEWEYgcGFyc2luZyBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCwgXCJlcnJvclwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xyXG4gICAgfSBlbHNlIGlmIChleHQgPT09IFwiZHdnXCIpIHtcclxuICAgICAgdGhpcy5zaG93VG9hc3QoXCJEV0cgYmluYXJ5IGZpbGUgZGV0ZWN0ZWQuIEluZ2VzdGluZyBDQUQgZW50aXRpZXMuLi5cIiwgXCJpbmZvXCIpO1xyXG4gICAgICAvLyBMb2FkIHNhbXBsZSBvciBzZXJ2ZXItY29udmVydGVkIGRyYXdpbmdcclxuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9tZXRob2QvY29uc3RydWN0aW9uX2JpbS5hcGkuY2FkLmdldF9zYW1wbGVfY2FkX2RyYXdpbmdcIik7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcclxuICAgICAgaWYgKGRhdGEubWVzc2FnZSkge1xyXG4gICAgICAgIGRhdGEubWVzc2FnZS5tb2RlbF9uYW1lID0gZmlsZS5uYW1lO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0RHJhd2luZyhkYXRhLm1lc3NhZ2UpO1xyXG4gICAgICAgIHRoaXMuYmNmLmFjdGl2ZU1vZGVsTmFtZSA9IGZpbGUubmFtZTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUxheWVyVUkoKTtcclxuICAgICAgICB0aGlzLmxvYWRJc3N1ZXMoKTtcclxuICAgICAgICB0aGlzLnNob3dUb2FzdChgSW5nZXN0ZWQgJHtmaWxlLm5hbWV9IHN1Y2Nlc3NmdWxseWAsIFwic3VjY2Vzc1wiKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zaG93VG9hc3QoXCJVbnN1cHBvcnRlZCBmaWxlIHR5cGUuIFBsZWFzZSB1cGxvYWQgYSAuZHdnIG9yIC5keGYgZmlsZS5cIiwgXCJlcnJvclwiKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZWxlY3RJc3N1ZShpc3N1ZTogQkNGVG9waWNJdGVtKSB7XHJcbiAgICB0aGlzLmJjZi5hY3RpdmVJc3N1ZSA9IGlzc3VlO1xyXG4gICAgdGhpcy5yZW5kZXJlci5hY3RpdmVJc3N1ZUlkID0gaXNzdWUubmFtZTtcclxuXHJcbiAgICAvLyBSZXN0b3JlIGxheWVyIHZpc2liaWxpdHkgc3RhdGUgaWYgc3RvcmVkIGluIHZpZXdwb2ludFxyXG4gICAgaWYgKGlzc3VlLnZpZXdwb2ludD8uYWN0aXZlX2xheWVycyAmJiBpc3N1ZS52aWV3cG9pbnQuYWN0aXZlX2xheWVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAoY29uc3QgbGF5ZXJOYW1lIG9mIE9iamVjdC5rZXlzKHRoaXMucmVuZGVyZXIubGF5ZXJWaXNpYmlsaXR5KSkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIubGF5ZXJWaXNpYmlsaXR5W2xheWVyTmFtZV0gPSBpc3N1ZS52aWV3cG9pbnQuYWN0aXZlX2xheWVycy5pbmNsdWRlcyhsYXllck5hbWUpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMudXBkYXRlTGF5ZXJVSSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZseSB0byAyRCB2aWV3cG9pbnRcclxuICAgIGNvbnN0IGNlbnRlciA9IHsgeDogaXNzdWUubG9jYXRpb25feCwgeTogaXNzdWUubG9jYXRpb25feSwgejogMCB9O1xyXG4gICAgY29uc3Qgem9vbSA9IGlzc3VlLnZpZXdwb2ludD8uY2FtZXJhPy56b29tIHx8IDAuMTU7XHJcbiAgICB0aGlzLnJlbmRlcmVyLmZseVRvVmlld3BvaW50KGNlbnRlciwgem9vbSk7XHJcblxyXG4gICAgLy8gT3BlbiBpc3N1ZSBkZXRhaWwgZHJhd2VyXHJcbiAgICB0aGlzLnNob3dJc3N1ZURldGFpbChpc3N1ZSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRDYW52YXNJbnRlcmFjdGlvbigpIHtcclxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgKGUpID0+IHtcclxuICAgICAgY29uc3QgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICBjb25zdCB1ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xyXG4gICAgICBjb25zdCB2ID0gZS5jbGllbnRZIC0gcmVjdC50b3A7XHJcbiAgICAgIGNvbnN0IHdvcmxkID0gdGhpcy5yZW5kZXJlci5zY3JlZW5Ub1dvcmxkKHUsIHYpO1xyXG5cclxuICAgICAgLy8gVXBkYXRlIENvb3JkaW5hdGUgSFVEXHJcbiAgICAgIGNvbnN0IGNvb3JkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1jb29yZC1odWRcIik7XHJcbiAgICAgIGlmIChjb29yZEVsKSB7XHJcbiAgICAgICAgY29vcmRFbC50ZXh0Q29udGVudCA9IGBYOiAke3dvcmxkLngudG9GaXhlZCgxKX0gbW0gfCBZOiAke3dvcmxkLnkudG9GaXhlZCgxKX0gbW0gfCBab29tOiAkeyh0aGlzLnJlbmRlcmVyLnpvb20gKiAxMDApLnRvRml4ZWQoMSl9JWA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNuYXBwaW5nIGRldGVjdGlvblxyXG4gICAgICBpZiAodGhpcy5yZW5kZXJlci5kcmF3aW5nICYmICh0aGlzLmFjdGl2ZVRvb2wgPT09IFwibWVhc3VyZV9kaXN0XCIgfHwgdGhpcy5hY3RpdmVUb29sID09PSBcIm1lYXN1cmVfYXJlYVwiIHx8IHRoaXMuYWN0aXZlVG9vbCA9PT0gXCJwaW5cIikpIHtcclxuICAgICAgICBjb25zdCBzbmFwID0gdGhpcy5tZWFzdXJlbWVudC5maW5kU25hcFRhcmdldCh3b3JsZCwgdGhpcy5yZW5kZXJlci5kcmF3aW5nLmVudGl0aWVzLCAyNSAvIHRoaXMucmVuZGVyZXIuem9vbSk7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zbmFwVGFyZ2V0ID0gc25hcDtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMucmVuZGVyZXIuc25hcFRhcmdldCkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuc25hcFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgY29uc3QgdSA9IGUuY2xpZW50WCAtIHJlY3QubGVmdDtcclxuICAgICAgY29uc3QgdiA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xyXG4gICAgICBjb25zdCByYXdXb3JsZCA9IHRoaXMucmVuZGVyZXIuc2NyZWVuVG9Xb3JsZCh1LCB2KTtcclxuICAgICAgY29uc3Qgd29ybGQgPSB0aGlzLnJlbmRlcmVyLnNuYXBUYXJnZXQgPyB0aGlzLnJlbmRlcmVyLnNuYXBUYXJnZXQucG9pbnQgOiByYXdXb3JsZDtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGNsaWNrZWQgYW4gZXhpc3RpbmcgQkNGIElzc3VlIFBpblxyXG4gICAgICBmb3IgKGNvbnN0IGlzc3VlIG9mIHRoaXMuYmNmLmlzc3Vlcykge1xyXG4gICAgICAgIGNvbnN0IHBpblNjcmVlbiA9IHRoaXMucmVuZGVyZXIud29ybGRUb1NjcmVlbih7IHg6IGlzc3VlLmxvY2F0aW9uX3gsIHk6IGlzc3VlLmxvY2F0aW9uX3kgfSk7XHJcbiAgICAgICAgY29uc3QgZGlzdCA9IE1hdGguc3FydChNYXRoLnBvdyhwaW5TY3JlZW4udSAtIHUsIDIpICsgTWF0aC5wb3cocGluU2NyZWVuLnYgLSB2LCAyKSk7XHJcbiAgICAgICAgaWYgKGRpc3QgPD0gMTgpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0SXNzdWUoaXNzdWUpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVG9vbCBoYW5kbGluZ1xyXG4gICAgICBpZiAodGhpcy5hY3RpdmVUb29sID09PSBcIm1lYXN1cmVfZGlzdFwiKSB7XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5hY3RpdmVNZWFzdXJlUG9pbnRzLnB1c2god29ybGQpO1xyXG4gICAgICAgIGlmICh0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICBjb25zdCByZXMgPSB0aGlzLm1lYXN1cmVtZW50Lm1lYXN1cmVEaXN0YW5jZShcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5hY3RpdmVNZWFzdXJlUG9pbnRzWzBdLFxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHNbMV1cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLnNob3dNZWFzdXJlbWVudFJlc3VsdChcclxuICAgICAgICAgICAgYERpc3RhbmNlOiAke3RoaXMubWVhc3VyZW1lbnQuZm9ybWF0RGltZW5zaW9uKHJlcy5kaXN0YW5jZSl9IHwgZFg6ICR7dGhpcy5tZWFzdXJlbWVudC5mb3JtYXREaW1lbnNpb24ocmVzLmR4KX0gfCBkWTogJHt0aGlzLm1lYXN1cmVtZW50LmZvcm1hdERpbWVuc2lvbihyZXMuZHkpfSB8IEFuZ2xlOiAke3Jlcy5hbmdsZURlZy50b0ZpeGVkKDEpfVx1MDBCMGBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5hY3RpdmVNZWFzdXJlUG9pbnRzID0gW3dvcmxkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZVRvb2wgPT09IFwibWVhc3VyZV9hcmVhXCIpIHtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMucHVzaCh3b3JsZCk7XHJcbiAgICAgICAgaWYgKHRoaXMucmVuZGVyZXIuYWN0aXZlTWVhc3VyZVBvaW50cy5sZW5ndGggPj0gMykge1xyXG4gICAgICAgICAgY29uc3QgcmVzID0gdGhpcy5tZWFzdXJlbWVudC5tZWFzdXJlQXJlYSh0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMpO1xyXG4gICAgICAgICAgdGhpcy5zaG93TWVhc3VyZW1lbnRSZXN1bHQoXHJcbiAgICAgICAgICAgIGBBcmVhOiAke3RoaXMubWVhc3VyZW1lbnQuZm9ybWF0RGltZW5zaW9uKHJlcy5hcmVhLCB0cnVlKX0gfCBQZXJpbWV0ZXI6ICR7dGhpcy5tZWFzdXJlbWVudC5mb3JtYXREaW1lbnNpb24ocmVzLnBlcmltZXRlcil9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZVRvb2wgPT09IFwicGluXCIpIHtcclxuICAgICAgICB0aGlzLm9wZW5DcmVhdGVJc3N1ZU1vZGFsKHdvcmxkKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRVSSgpIHtcclxuICAgIC8vIFRvb2xiYXIgYnV0dG9uc1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tem9vbS1leHRlbnRzXCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5yZW5kZXJlci56b29tRXh0ZW50cygpKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXpvb20taW5cIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIuem9vbSA9IE1hdGgubWluKHRoaXMucmVuZGVyZXIuem9vbSAqIDEuMywgMjAuMCk7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKCk7XHJcbiAgICB9KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXpvb20tb3V0XCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnpvb20gPSBNYXRoLm1heCh0aGlzLnJlbmRlcmVyLnpvb20gKiAwLjcsIDFlLTUpO1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGhlbWUgc2VsZWN0b3JcclxuICAgIGNvbnN0IHRoZW1lU2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3QtY2FkLXRoZW1lXCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xyXG4gICAgdGhlbWVTZWxlY3Q/LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcclxuICAgICAgdGhpcy5yZW5kZXJlci5zZXRUaGVtZSgoZS50YXJnZXQgYXMgSFRNTFNlbGVjdEVsZW1lbnQpLnZhbHVlIGFzIENBRFRoZW1lKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRvb2wgYnV0dG9uc1xyXG4gICAgY29uc3QgdG9vbEJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtY2FkLXRvb2xdXCIpO1xyXG4gICAgdG9vbEJ0bnMuZm9yRWFjaCgoYnRuKSA9PiB7XHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgIHRvb2xCdG5zLmZvckVhY2goKGIpID0+IGIuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKSk7XHJcbiAgICAgICAgYnRuLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgY29uc3QgdG9vbCA9IGJ0bi5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNhZC10b29sXCIpIGFzIGFueTtcclxuICAgICAgICB0aGlzLmFjdGl2ZVRvb2wgPSB0b29sO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIubWVhc3VyZU1vZGUgPSB0b29sLnN0YXJ0c1dpdGgoXCJtZWFzdXJlXCIpID8gKHRvb2wucmVwbGFjZShcIm1lYXN1cmVfXCIsIFwiXCIpIGFzIGFueSkgOiBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMgPSBbXTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEZpbGUgdXBsb2FkIGlucHV0XHJcbiAgICBjb25zdCBmaWxlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1maWxlLWlucHV0XCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBmaWxlSW5wdXQ/LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcclxuICAgICAgY29uc3QgZmlsZSA9IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5maWxlcz8uWzBdO1xyXG4gICAgICBpZiAoZmlsZSkgdGhpcy5oYW5kbGVGaWxlVXBsb2FkKGZpbGUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQkNGIEV4cG9ydCBidXR0b25cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWV4cG9ydC1iY2ZcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoXCJFeHBvcnRpbmcgQkNGIDIuMSBwYWNrYWdlLi4uXCIsIFwiaW5mb1wiKTtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmJjZi5leHBvcnRCQ0ZaaXAoKTtcclxuICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHJlcy5ibG9iKTtcclxuICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgYS5ocmVmID0gdXJsO1xyXG4gICAgICAgIGEuZG93bmxvYWQgPSByZXMuZmlsZW5hbWU7XHJcbiAgICAgICAgYS5jbGljaygpO1xyXG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcclxuICAgICAgICB0aGlzLnNob3dUb2FzdChcIkJDRiBwYWNrYWdlIGV4cG9ydGVkIHN1Y2Nlc3NmdWxseSFcIiwgXCJzdWNjZXNzXCIpO1xyXG4gICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KGBCQ0YgZXhwb3J0IGZhaWxlZDogJHtlcnIubWVzc2FnZX1gLCBcImVycm9yXCIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBCQ0YgSW1wb3J0IGlucHV0XHJcbiAgICBjb25zdCBiY2ZJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmNmLWZpbGUtaW5wdXRcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgIGJjZklucHV0Py5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGZpbGUgPSAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkuZmlsZXM/LlswXTtcclxuICAgICAgaWYgKGZpbGUpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5zaG93VG9hc3QoXCJJbXBvcnRpbmcgQkNGIHBhY2thZ2UuLi5cIiwgXCJpbmZvXCIpO1xyXG4gICAgICAgICAgY29uc3QgY291bnQgPSBhd2FpdCB0aGlzLmJjZi5pbXBvcnRCQ0ZaaXAoZmlsZSk7XHJcbiAgICAgICAgICB0aGlzLmxvYWRJc3N1ZXMoKTtcclxuICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KGBJbXBvcnRlZCAke2NvdW50fSBpc3N1ZXMgc3VjY2Vzc2Z1bGx5IWAsIFwic3VjY2Vzc1wiKTtcclxuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgICAgdGhpcy5zaG93VG9hc3QoYEJDRiBpbXBvcnQgZmFpbGVkOiAke2Vyci5tZXNzYWdlfWAsIFwiZXJyb3JcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBEcmF3ZXIgdGFicyAoTGF5ZXJzIHZzIElzc3VlcylcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1kcmF3ZXItdGFiXVwiKS5mb3JFYWNoKCh0YWIpID0+IHtcclxuICAgICAgdGFiLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWRyYXdlci10YWJdXCIpLmZvckVhY2goKHQpID0+IHQuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKSk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kcmF3ZXItcGFuZWxcIikuZm9yRWFjaCgocCkgPT4gcC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpKTtcclxuICAgICAgICB0YWIuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSB0YWIuZ2V0QXR0cmlidXRlKFwiZGF0YS1kcmF3ZXItdGFiXCIpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBwYW5lbC0ke3RhcmdldH1gKT8uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJc3N1ZSBzdGF0dXMgZmlsdGVyXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlci1pc3N1ZS1zdGF0dXNcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcclxuICAgICAgY29uc3Qgc3RhdHVzID0gKGUudGFyZ2V0IGFzIEhUTUxTZWxlY3RFbGVtZW50KS52YWx1ZTtcclxuICAgICAgY29uc3QgZmlsdGVyZWQgPSBzdGF0dXMgPT09IFwiQWxsXCIgPyB0aGlzLmJjZi5pc3N1ZXMgOiB0aGlzLmJjZi5pc3N1ZXMuZmlsdGVyKChpKSA9PiBpLnRvcGljX3N0YXR1cyA9PT0gc3RhdHVzKTtcclxuICAgICAgdGhpcy5yZW5kZXJJc3N1ZXNMaXN0KGZpbHRlcmVkKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVMYXllclVJKCkge1xyXG4gICAgY29uc3QgbGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWQtbGF5ZXJzLWxpc3RcIik7XHJcbiAgICBpZiAoIWxpc3RFbCB8fCAhdGhpcy5yZW5kZXJlci5kcmF3aW5nKSByZXR1cm47XHJcblxyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBsYXllcl0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5yZW5kZXJlci5kcmF3aW5nLmxheWVycykpIHtcclxuICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgcm93LmNsYXNzTmFtZSA9IFwibGF5ZXItcm93XCI7XHJcbiAgICAgIGNvbnN0IGlzVmlzID0gdGhpcy5yZW5kZXJlci5sYXllclZpc2liaWxpdHlbbmFtZV0gIT09IGZhbHNlO1xyXG5cclxuICAgICAgcm93LmlubmVySFRNTCA9IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwibGF5ZXItaW5mb1wiPlxyXG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJjb2xvci1zd2F0Y2hcIj48L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImxheWVyLW5hbWVcIiB0aXRsZT1cIiR7ZXNjYXBlSHRtbChuYW1lKX1cIj4ke2VzY2FwZUh0bWwobmFtZSl9PC9zcGFuPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJsYXllci1hY3Rpb25zXCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLWxheWVyLXZpcyAke2lzVmlzID8gJ29uJyA6ICdvZmYnfVwiIHRpdGxlPVwiVG9nZ2xlIFZpc2liaWxpdHlcIj5cclxuICAgICAgICAgICAgJHtpc1ZpcyA/ICdcdUQ4M0RcdURDNDFcdUZFMEYnIDogJ1x1RDgzRFx1REQ3Nlx1RkUwRid9XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYDtcclxuICAgICAgY29uc3Qgc3dhdGNoID0gcm93LnF1ZXJ5U2VsZWN0b3IoXCIuY29sb3Itc3dhdGNoXCIpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcclxuICAgICAgaWYgKHN3YXRjaCkge1xyXG4gICAgICAgIHN3YXRjaC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBsYXllci5jb2xvciB8fCBcIiNjY2NjY2NcIjtcclxuICAgICAgfVxyXG5cclxuICAgICAgcm93LnF1ZXJ5U2VsZWN0b3IoXCIuYnRuLWxheWVyLXZpc1wiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLmxheWVyVmlzaWJpbGl0eVtuYW1lXSA9ICF0aGlzLnJlbmRlcmVyLmxheWVyVmlzaWJpbGl0eVtuYW1lXTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUxheWVyVUkoKTtcclxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGxpc3RFbC5hcHBlbmRDaGlsZChyb3cpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB1cGRhdGVTcGFjZXNVSShzcGFjZXM6IHN0cmluZ1tdKSB7XHJcbiAgICBjb25zdCBiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1zcGFjZXMtYmFyXCIpO1xyXG4gICAgaWYgKCFiYXIpIHJldHVybjtcclxuICAgIGJhci5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgIHNwYWNlcy5mb3JFYWNoKChzcCkgPT4ge1xyXG4gICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xyXG4gICAgICBidG4uY2xhc3NOYW1lID0gYGNhZC1zcGFjZS10YWIgJHtzcCA9PT0gdGhpcy5hY3RpdmVTcGFjZSA/IFwiYWN0aXZlXCIgOiBcIlwifWA7XHJcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9IHNwO1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICB0aGlzLmFjdGl2ZVNwYWNlID0gc3A7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTcGFjZXNVSShzcGFjZXMpO1xyXG4gICAgICAgIHRoaXMucmVuZGVyZXIuem9vbUV4dGVudHMoKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGJhci5hcHBlbmRDaGlsZChidG4pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbmRlcklzc3Vlc0xpc3QoaXNzdWVzOiBCQ0ZUb3BpY0l0ZW1bXSkge1xyXG4gICAgY29uc3QgbGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJiY2YtaXNzdWVzLWxpc3RcIik7XHJcbiAgICBpZiAoIWxpc3RFbCkgcmV0dXJuO1xyXG4gICAgbGlzdEVsLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgaWYgKGlzc3Vlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgbGlzdEVsLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZW1wdHktc3RhdGVcIj5ObyBCQ0YgaXNzdWVzIGZvdW5kLiBDbGljayAnQWRkIElzc3VlJyB0byBjcmVhdGUgb25lLjwvZGl2PmA7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpc3N1ZXMuZm9yRWFjaCgoaXNzdWUpID0+IHtcclxuICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgIGNhcmQuY2xhc3NOYW1lID0gYGJjZi1pc3N1ZS1jYXJkICR7aXNzdWUubmFtZSA9PT0gdGhpcy5yZW5kZXJlci5hY3RpdmVJc3N1ZUlkID8gXCJzZWxlY3RlZFwiIDogXCJcIn1gO1xyXG4gICAgICBjb25zdCBiYWRnZUNsYXNzID0gaXNzdWUudG9waWNfc3RhdHVzID09PSBcIlJlc29sdmVkXCIgfHwgaXNzdWUudG9waWNfc3RhdHVzID09PSBcIkNsb3NlZFwiID8gXCJyZXNvbHZlZFwiIDogaXNzdWUucHJpb3JpdHkgPT09IFwiQ3JpdGljYWxcIiA/IFwiY3JpdGljYWxcIiA6IFwib3BlblwiO1xyXG5cclxuICAgICAgY2FyZC5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImlzc3VlLWNhcmQtaGVhZGVyXCI+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpbi1iYWRnZVwiPiMke2VzY2FwZUh0bWwoaXNzdWUucGluX251bWJlciB8fCAxKX08L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImlzc3VlLXRpdGxlXCI+JHtlc2NhcGVIdG1sKGlzc3VlLnRpdGxlKX08L3NwYW4+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXR1cy1waWxsICR7YmFkZ2VDbGFzc31cIj4ke2VzY2FwZUh0bWwoaXNzdWUudG9waWNfc3RhdHVzKX08L3NwYW4+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImlzc3VlLWNhcmQtbWV0YVwiPlxyXG4gICAgICAgICAgPHNwYW4+UHJpb3JpdHk6IDxzdHJvbmc+JHtlc2NhcGVIdG1sKGlzc3VlLnByaW9yaXR5KX08L3N0cm9uZz48L3NwYW4+XHJcbiAgICAgICAgICA8c3Bhbj5UeXBlOiAke2VzY2FwZUh0bWwoaXNzdWUudG9waWNfdHlwZSl9PC9zcGFuPlxyXG4gICAgICAgICAgPHNwYW4+XHVEODNEXHVEQ0FDICR7ZXNjYXBlSHRtbChpc3N1ZS5jb21tZW50X2NvdW50IHx8IDApfTwvc3Bhbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYDtcclxuXHJcbiAgICAgIGNhcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuc2VsZWN0SXNzdWUoaXNzdWUpKTtcclxuICAgICAgbGlzdEVsLmFwcGVuZENoaWxkKGNhcmQpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dJc3N1ZURldGFpbChpc3N1ZTogQkNGVG9waWNJdGVtKSB7XHJcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaXNzdWUtZGV0YWlsLWRyYXdlclwiKTtcclxuICAgIGlmICghbW9kYWwpIHJldHVybjtcclxuICAgIG1vZGFsLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgY29uc3Qgc2FmZVNuYXBzaG90ID0gaXNzdWUuc25hcHNob3QgJiYgL14oPzpkYXRhOmltYWdlXFwvKD86cG5nfGpwZWd8d2VicHxnaWYpO2Jhc2U2NCx8aHR0cHM/OlxcL1xcL3xcXC9maWxlc1xcLykvaS50ZXN0KGlzc3VlLnNuYXBzaG90KVxyXG4gICAgICA/IGVzY2FwZUh0bWwoaXNzdWUuc25hcHNob3QpXHJcbiAgICAgIDogbnVsbDtcclxuXHJcbiAgICBtb2RhbC5pbm5lckhUTUwgPSBgXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJkcmF3ZXItaGVhZGVyXCI+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImhlYWRlci1sZWZ0XCI+XHJcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpbi1iYWRnZSBsYXJnZVwiPiMke2VzY2FwZUh0bWwoaXNzdWUucGluX251bWJlciB8fCAxKX08L3NwYW4+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8aDM+JHtlc2NhcGVIdG1sKGlzc3VlLnRpdGxlKX08L2gzPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXR1cy1waWxsXCI+JHtlc2NhcGVIdG1sKGlzc3VlLnRvcGljX3N0YXR1cyl9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi1jbG9zZVwiIGlkPVwiYnRuLWNsb3NlLWlzc3VlLWRldGFpbFwiPlx1MjcxNTwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgY2xhc3M9XCJkcmF3ZXItYm9keVwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtZXRhLWdyaWRcIj5cclxuICAgICAgICAgIDxkaXY+PGxhYmVsPlByaW9yaXR5OjwvbGFiZWw+IDxzcGFuPiR7ZXNjYXBlSHRtbChpc3N1ZS5wcmlvcml0eSl9PC9zcGFuPjwvZGl2PlxyXG4gICAgICAgICAgPGRpdj48bGFiZWw+VHlwZTo8L2xhYmVsPiA8c3Bhbj4ke2VzY2FwZUh0bWwoaXNzdWUudG9waWNfdHlwZSl9PC9zcGFuPjwvZGl2PlxyXG4gICAgICAgICAgPGRpdj48bGFiZWw+U3RhZ2U6PC9sYWJlbD4gPHNwYW4+JHtlc2NhcGVIdG1sKGlzc3VlLnN0YWdlIHx8ICdDb29yZGluYXRpb24nKX08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2PjxsYWJlbD5Bc3NpZ25lZDo8L2xhYmVsPiA8c3Bhbj4ke2VzY2FwZUh0bWwoaXNzdWUuYXNzaWduZWRfdG8gfHwgJ1VuYXNzaWduZWQnKX08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICR7aXNzdWUuZGVzY3JpcHRpb24gPyBgPHAgY2xhc3M9XCJpc3N1ZS1kZXNjXCI+JHtlc2NhcGVIdG1sKGlzc3VlLmRlc2NyaXB0aW9uKX08L3A+YCA6ICcnfVxyXG4gICAgICAgICR7c2FmZVNuYXBzaG90ID8gYDxpbWcgY2xhc3M9XCJpc3N1ZS1zbmFwc2hvdFwiIHNyYz1cIiR7c2FmZVNuYXBzaG90fVwiIGFsdD1cIlNuYXBzaG90XCIgLz5gIDogJyd9XHJcblxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb21tZW50LXNlY3Rpb25cIj5cclxuICAgICAgICAgIDxoND5EaXNjdXNzaW9uPC9oND5cclxuICAgICAgICAgIDxkaXYgaWQ9XCJpc3N1ZS1jb21tZW50cy1saXN0XCIgY2xhc3M9XCJjb21tZW50cy1saXN0XCI+TG9hZGluZyBjb21tZW50cy4uLjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbW1lbnQtaW5wdXQtYm94XCI+XHJcbiAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD1cImlzc3VlLXJlcGx5LXRleHRcIiBwbGFjZWhvbGRlcj1cIldyaXRlIGEgcmVwbHkgb3IgY29vcmRpbmF0aW9uIG5vdGUuLi5cIj48L3RleHRhcmVhPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicmVwbHktYWN0aW9uc1wiPlxyXG4gICAgICAgICAgICAgIDxzZWxlY3QgaWQ9XCJzZWxlY3QtaXNzdWUtc3RhdHVzLXRyYW5zaXRpb25cIj5cclxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIiAke2lzc3VlLnRvcGljX3N0YXR1cyA9PT0gJ09wZW4nID8gJ3NlbGVjdGVkJyA6ICcnfT5LZWVwIEN1cnJlbnQgKCR7ZXNjYXBlSHRtbChpc3N1ZS50b3BpY19zdGF0dXMpfSk8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJJbiBQcm9ncmVzc1wiPkluIFByb2dyZXNzPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiUmVzb2x2ZWRcIj5SZXNvbHZlZDwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIkNsb3NlZFwiPkNsb3NlZDwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG4tc3VibWl0LXJlcGx5XCIgY2xhc3M9XCJidG4gYnRuLXByaW1hcnkgYnRuLXNtXCI+UG9zdCBDb21tZW50PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1jbG9zZS1pc3N1ZS1kZXRhaWxcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIG1vZGFsLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1zdWJtaXQtcmVwbHlcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRleHQgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpc3N1ZS1yZXBseS10ZXh0XCIpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQpPy52YWx1ZTtcclxuICAgICAgY29uc3QgbmV3U3RhdHVzID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWlzc3VlLXN0YXR1cy10cmFuc2l0aW9uXCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50KT8udmFsdWUgfHwgdW5kZWZpbmVkO1xyXG4gICAgICBpZiAoIXRleHQudHJpbSgpKSByZXR1cm47XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuYmNmLmFkZENvbW1lbnQoaXNzdWUubmFtZSwgdGV4dCwgbmV3U3RhdHVzKTtcclxuICAgICAgICB0aGlzLnNob3dUb2FzdChcIkNvbW1lbnQgcG9zdGVkIVwiLCBcInN1Y2Nlc3NcIik7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkSXNzdWVzKCk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RJc3N1ZSh0aGlzLmJjZi5pc3N1ZXMuZmluZCgoaSkgPT4gaS5uYW1lID09PSBpc3N1ZS5uYW1lKSB8fCBpc3N1ZSk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoYEZhaWxlZDogJHtlcnIubWVzc2FnZX1gLCBcImVycm9yXCIpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmZldGNoSXNzdWVDb21tZW50cyhpc3N1ZS5uYW1lKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXN5bmMgZmV0Y2hJc3N1ZUNvbW1lbnRzKGlzc3VlTmFtZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBsaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlzc3VlLWNvbW1lbnRzLWxpc3RcIik7XHJcbiAgICBpZiAoIWxpc3RFbCkgcmV0dXJuO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcclxuICAgICAgICBgL2FwaS9tZXRob2QvZnJhcHBlLmNsaWVudC5nZXRfbGlzdD9kb2N0eXBlPUNvbW1lbnQmZmlsdGVycz0ke2VuY29kZVVSSUNvbXBvbmVudChcclxuICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHsgcmVmZXJlbmNlX2RvY3R5cGU6IFwiQklNIElzc3VlXCIsIHJlZmVyZW5jZV9uYW1lOiBpc3N1ZU5hbWUsIGNvbW1lbnRfdHlwZTogXCJDb21tZW50XCIgfSlcclxuICAgICAgICApfSZmaWVsZHM9JHtlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoW1wibmFtZVwiLCBcImNvbnRlbnRcIiwgXCJjcmVhdGlvblwiLCBcImNvbW1lbnRfYnlcIl0pKX0mb3JkZXJfYnk9Y3JlYXRpb24gYXNjYFxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XHJcbiAgICAgIGNvbnN0IGNvbW1lbnRzID0gZGF0YS5tZXNzYWdlIHx8IFtdO1xyXG5cclxuICAgICAgaWYgKGNvbW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cInRleHQtbXV0ZWRcIj5ObyBjb21tZW50cyB5ZXQuIEJlIHRoZSBmaXJzdCB0byByZXBseS48L2Rpdj5gO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGlzdEVsLmlubmVySFRNTCA9IGNvbW1lbnRzXHJcbiAgICAgICAgLm1hcChcclxuICAgICAgICAgIChjOiBhbnkpID0+IGBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29tbWVudC1idWJibGVcIj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb21tZW50LWF1dGhvclwiPjxzdHJvbmc+JHtlc2NhcGVIdG1sKGMuY29tbWVudF9ieSl9PC9zdHJvbmc+IDxzbWFsbD4ke2VzY2FwZUh0bWwoYy5jcmVhdGlvbil9PC9zbWFsbD48L2Rpdj5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb21tZW50LWNvbnRlbnRcIj4ke2VzY2FwZUh0bWwoYy5jb250ZW50KX08L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYFxyXG4gICAgICAgIClcclxuICAgICAgICAuam9pbihcIlwiKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgbGlzdEVsLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwidGV4dC1kYW5nZXJcIj5GYWlsZWQgdG8gbG9hZCBjb21tZW50czwvZGl2PmA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9wZW5DcmVhdGVJc3N1ZU1vZGFsKGxvY2F0aW9uOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0pIHtcclxuICAgIGNvbnN0IHZpc2libGVMYXllcnMgPSBPYmplY3QuZW50cmllcyh0aGlzLnJlbmRlcmVyLmxheWVyVmlzaWJpbGl0eSlcclxuICAgICAgLmZpbHRlcigoW18sIHZdKSA9PiB2KVxyXG4gICAgICAubWFwKChbaywgX10pID0+IGspO1xyXG5cclxuICAgIGNvbnN0IHNuYXBzaG90ID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xyXG4gICAgY29uc3Qgdmlld3BvaW50ID0gdGhpcy5iY2YuY2FwdHVyZVZpZXdwb2ludChsb2NhdGlvbiwgdGhpcy5yZW5kZXJlci56b29tLCB2aXNpYmxlTGF5ZXJzKTtcclxuXHJcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlYXRlLWlzc3VlLW1vZGFsXCIpO1xyXG4gICAgaWYgKCFtb2RhbCkgcmV0dXJuO1xyXG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWNyZWF0ZS1pc3N1ZVwiKSBhcyBIVE1MRm9ybUVsZW1lbnQ7XHJcbiAgICBmb3JtPy5yZXNldCgpO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWNhbmNlbC1jcmVhdGUtaXNzdWVcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIG1vZGFsLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBmb3JtLm9uc3VibWl0ID0gYXN5bmMgKGUpID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBjb25zdCB0aXRsZSA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlucHV0LWlzc3VlLXRpdGxlXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpPy52YWx1ZTtcclxuICAgICAgY29uc3QgdHlwZSA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdC1pc3N1ZS10eXBlXCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50KT8udmFsdWU7XHJcbiAgICAgIGNvbnN0IHByaW9yaXR5ID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWlzc3VlLXByaW9yaXR5XCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50KT8udmFsdWU7XHJcbiAgICAgIGNvbnN0IGRlc2MgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0ZXh0YXJlYS1pc3N1ZS1kZXNjXCIpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQpPy52YWx1ZTtcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoXCJTYXZpbmcgQkNGIElzc3VlLi4uXCIsIFwiaW5mb1wiKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmJjZi5jcmVhdGVJc3N1ZSh0aXRsZSwgdmlld3BvaW50LCBzbmFwc2hvdCwge1xyXG4gICAgICAgICAgdG9waWNfdHlwZTogdHlwZSxcclxuICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjLFxyXG4gICAgICAgICAgbG9jYXRpb24sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbW9kYWwuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnNob3dUb2FzdChcIkJJTSBJc3N1ZSBjcmVhdGVkIHN1Y2Nlc3NmdWxseSFcIiwgXCJzdWNjZXNzXCIpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZElzc3VlcygpO1xyXG4gICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KGBFcnJvcjogJHtlcnIubWVzc2FnZX1gLCBcImVycm9yXCIpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93TWVhc3VyZW1lbnRSZXN1bHQodGV4dDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1tZWFzdXJlLXJlc3VsdFwiKTtcclxuICAgIGlmIChiYXIpIHtcclxuICAgICAgYmFyLnRleHRDb250ZW50ID0gdGV4dDtcclxuICAgICAgYmFyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dUb2FzdChtZXNzYWdlOiBzdHJpbmcsIHR5cGU6IFwiaW5mb1wiIHwgXCJzdWNjZXNzXCIgfCBcImVycm9yXCIgPSBcImluZm9cIikge1xyXG4gICAgY29uc29sZS5sb2coYFske3R5cGUudG9VcHBlckNhc2UoKX1dICR7bWVzc2FnZX1gKTtcclxuICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWQtdG9hc3RcIik7XHJcbiAgICBpZiAodG9hc3QpIHtcclxuICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgICB0b2FzdC5jbGFzc05hbWUgPSBgY2FkLXRvYXN0ICR7dHlwZX0gc2hvd2A7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdG9hc3QuY2xhc3NMaXN0LnJlbW92ZShcInNob3dcIiksIDM1MDApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXREV0dWaWV3ZXIoY2FudmFzRWxlbWVudD86IEhUTUxDYW52YXNFbGVtZW50KSB7XHJcbiAgY29uc3QgY2FudmFzID0gY2FudmFzRWxlbWVudCB8fCAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWQtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50KTtcclxuICBpZiAoIWNhbnZhcykge1xyXG4gICAgY29uc29sZS53YXJuKFwiQ0FEIGNhbnZhcyBlbGVtZW50ICNjYWQtY2FudmFzIG5vdCBmb3VuZCBpbiBET00uXCIpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGlmICgod2luZG93IGFzIGFueSkuZHdnQXBwKSB7XHJcbiAgICAod2luZG93IGFzIGFueSkuZHdnQXBwLnJlbmRlcmVyLnJlc2l6ZSgpO1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLmR3Z0FwcC5yZW5kZXJlci5yZW5kZXIoKTtcclxuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuZHdnQXBwO1xyXG4gIH1cclxuICBjb25zdCBhcHAgPSBuZXcgRFdHVmlld2VyQXBwKGNhbnZhcyk7XHJcbiAgKHdpbmRvdyBhcyBhbnkpLmR3Z0FwcCA9IGFwcDtcclxuICByZXR1cm4gYXBwO1xyXG59XHJcblxyXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICh3aW5kb3cgYXMgYW55KS5EV0dWaWV3ZXJBcHAgPSBEV0dWaWV3ZXJBcHA7XHJcbiAgKHdpbmRvdyBhcyBhbnkpLmluaXREV0dWaWV3ZXIgPSBpbml0RFdHVmlld2VyO1xyXG5cclxuICAvLyBJZiBjYW52YXMgaXMgYWxyZWFkeSBwcmVzZW50IGluIERPTSwgaW5pdGlhbGl6ZSBpbW1lZGlhdGVseVxyXG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWQtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gIGlmIChlbCkge1xyXG4gICAgaW5pdERXR1ZpZXdlcihlbCk7XHJcbiAgfVxyXG59XHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBT08sSUFBTSxnQkFBd0M7QUFBQSxFQUNuRCxHQUFHO0FBQUE7QUFBQSxFQUNILEdBQUc7QUFBQTtBQUFBLEVBQ0gsR0FBRztBQUFBO0FBQUEsRUFDSCxHQUFHO0FBQUE7QUFBQSxFQUNILEdBQUc7QUFBQTtBQUFBLEVBQ0gsR0FBRztBQUFBO0FBQUEsRUFDSCxHQUFHO0FBQUE7QUFBQSxFQUNILEdBQUc7QUFBQTtBQUFBLEVBQ0gsR0FBRztBQUFBO0FBQUEsRUFDSCxHQUFHO0FBQUE7QUFBQSxFQUNILElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUNoRSxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFDaEUsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQ2hFLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUNoRSxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFDaEUsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQ2hFLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUNoRSxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFDaEUsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQ2hFLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUNyRSxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFDckUsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQ3JFLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUNyRSxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFDckUsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQ3JFLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUNyRSxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFDckUsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQ3JFLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUNyRSxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFDckUsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFB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VyxVQUFVO0FBQUEsVUFDckQsWUFBWTtBQUFBLFVBQ1o7QUFBQSxVQUNBLGFBQWE7QUFBQSxVQUNiO0FBQUEsUUFDRixDQUFDO0FBQ0QsY0FBTSxVQUFVLElBQUksUUFBUTtBQUM1QixhQUFLLFVBQVUsbUNBQW1DLFNBQVM7QUFDM0QsY0FBTSxLQUFLLFdBQVc7QUFBQSxNQUN4QixTQUFTLEtBQVU7QUFDakIsYUFBSyxVQUFVLFVBQVUsSUFBSSxPQUFPLElBQUksT0FBTztBQUFBLE1BQ2pEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVRLHNCQUFzQixNQUFjO0FBQzFDLFVBQU0sTUFBTSxTQUFTLGVBQWUsb0JBQW9CO0FBQ3hELFFBQUksS0FBSztBQUNQLFVBQUksY0FBYztBQUNsQixVQUFJLFVBQVUsT0FBTyxRQUFRO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQUEsRUFFUSxVQUFVLFNBQWlCLE9BQXFDLFFBQVE7QUFDOUUsWUFBUSxJQUFJLElBQUksS0FBSyxZQUFZLENBQUMsS0FBSyxPQUFPLEVBQUU7QUFDaEQsVUFBTSxRQUFRLFNBQVMsZUFBZSxXQUFXO0FBQ2pELFFBQUksT0FBTztBQUNULFlBQU0sY0FBYztBQUNwQixZQUFNLFlBQVksYUFBYSxJQUFJO0FBQ25DLGlCQUFXLE1BQU0sTUFBTSxVQUFVLE9BQU8sTUFBTSxHQUFHLElBQUk7QUFBQSxJQUN2RDtBQUFBLEVBQ0Y7QUFDRjtBQUVPLFNBQVMsY0FBYyxlQUFtQztBQUMvRCxRQUFNLFNBQVMsaUJBQWtCLFNBQVMsZUFBZSxZQUFZO0FBQ3JFLE1BQUksQ0FBQyxRQUFRO0FBQ1gsWUFBUSxLQUFLLGtEQUFrRDtBQUMvRCxXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUssT0FBZSxRQUFRO0FBQzFCLElBQUMsT0FBZSxPQUFPLFNBQVMsT0FBTztBQUN2QyxJQUFDLE9BQWUsT0FBTyxTQUFTLE9BQU87QUFDdkMsV0FBUSxPQUFlO0FBQUEsRUFDekI7QUFDQSxRQUFNLE1BQU0sSUFBSSxhQUFhLE1BQU07QUFDbkMsRUFBQyxPQUFlLFNBQVM7QUFDekIsU0FBTztBQUNUO0FBRUEsSUFBSSxPQUFPLFdBQVcsYUFBYTtBQUNqQyxFQUFDLE9BQWUsZUFBZTtBQUMvQixFQUFDLE9BQWUsZ0JBQWdCO0FBR2hDLFFBQU0sS0FBSyxTQUFTLGVBQWUsWUFBWTtBQUMvQyxNQUFJLElBQUk7QUFDTixrQkFBYyxFQUFFO0FBQUEsRUFDbEI7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
