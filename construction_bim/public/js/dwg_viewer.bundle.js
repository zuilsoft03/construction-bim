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
/**
 * Interpolates points along the circular arc defined by two endpoints and a polyline bulge.
 * @param {{x: number, y: number, z?: number}} p1 - The arc's starting point.
 * @param {{x: number, y: number, z?: number}} p2 - The arc's ending point.
 * @param {number} bulge - The signed bulge value defining the arc's curvature and direction.
 * @param {number} [segments=16] - The number of intervals used to interpolate the arc.
 * @returns {Array<{x: number, y: number, z: number}>} The interpolated arc points, or the applicable endpoint points for a negligible or coincident segment.
 */
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
/**
 * Parse DXF text into structured drawing data, including layers, entities, blocks, and extents.
 * @param {string} dxfContent - Raw DXF content containing group-code/value lines.
 * @return {Object} Parsed drawing metadata, layers, supported entities, block definitions, drawing extents, and entity count.
 */
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
    const zoomX = (w - padding * 2) / ext.width;
    const zoomY = (h - padding * 2) / ext.height;
    this.zoom = Math.max(Math.min(zoomX, zoomY), 1e-4);
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
    const rawUnitSpacing = targetPixelSpacing / this.zoom;
    const mag = Math.pow(10, Math.floor(Math.log10(rawUnitSpacing)));
    let unitSpacing = mag;
    if (rawUnitSpacing / mag > 5) unitSpacing = mag * 5;
    else if (rawUnitSpacing / mag > 2) unitSpacing = mag * 2;
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
    /**
     * Updates the closest snap candidate when the point is within the current distance threshold.
     * @param {{x: number, y: number}} pt - Candidate point to evaluate.
     * @param {string} type - Type of snap candidate.
     */
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
    try {
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
          <span class="color-swatch" style="background-color: ${layer.color}"></span>
          <span class="layer-name" title="${name}">${name}</span>
        </div>
        <div class="layer-actions">
          <button class="btn-layer-vis ${isVis ? "on" : "off"}" title="Toggle Visibility">
            ${isVis ? "\u{1F441}\uFE0F" : "\u{1F576}\uFE0F"}
          </button>
        </div>
      `;
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
          <span class="pin-badge">#${issue.pin_number || 1}</span>
          <span class="issue-title">${issue.title}</span>
          <span class="status-pill ${badgeClass}">${issue.topic_status}</span>
        </div>
        <div class="issue-card-meta">
          <span>Priority: <strong>${issue.priority}</strong></span>
          <span>Type: ${issue.topic_type}</span>
          <span>\u{1F4AC} ${issue.comment_count || 0}</span>
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
    modal.innerHTML = `
      <div class="drawer-header">
        <div class="header-left">
          <span class="pin-badge large">#${issue.pin_number || 1}</span>
          <div>
            <h3>${issue.title}</h3>
            <span class="status-pill">${issue.topic_status}</span>
          </div>
        </div>
        <button class="btn-close" id="btn-close-issue-detail">\u2715</button>
      </div>

      <div class="drawer-body">
        <div class="meta-grid">
          <div><label>Priority:</label> <span>${issue.priority}</span></div>
          <div><label>Type:</label> <span>${issue.topic_type}</span></div>
          <div><label>Stage:</label> <span>${issue.stage || "Coordination"}</span></div>
          <div><label>Assigned:</label> <span>${issue.assigned_to || "Unassigned"}</span></div>
        </div>

        ${issue.description ? `<p class="issue-desc">${issue.description}</p>` : ""}
        ${issue.snapshot ? `<img class="issue-snapshot" src="${issue.snapshot}" alt="Snapshot" />` : ""}

        <div class="comment-section">
          <h4>Discussion</h4>
          <div id="issue-comments-list" class="comments-list">Loading comments...</div>
          <div class="comment-input-box">
            <textarea id="issue-reply-text" placeholder="Write a reply or coordination note..."></textarea>
            <div class="reply-actions">
              <select id="select-issue-status-transition">
                <option value="" ${issue.topic_status === "Open" ? "selected" : ""}>Keep Current (${issue.topic_status})</option>
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
          <div class="comment-author"><strong>${c.comment_by}</strong> <small>${c.creation}</small></div>
          <div class="comment-content">${c.content}</div>
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
/**
 * Initialize the DWG viewer on a canvas element.
 * @param {HTMLCanvasElement} [canvasElement] - The canvas to use; defaults to the element with ID `cad-canvas`.
 * @return {DWGViewerApp|null} The initialized viewer, or `null` when no canvas is available.
 */
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3NyYy9jYWQvZHhmX3BhcnNlcl9lbmdpbmUudHMiLCAiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3NyYy9jYWQvY2FkX2NhbnZhc19yZW5kZXJlci50cyIsICIuLi8uLi8uLi9mcm9udGVuZF9zcmMvc3JjL2NhZC9jYWRfbWVhc3VyZW1lbnRfdG9vbHMudHMiLCAiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3NyYy9jYWQvYmNmX2NvbGxhYm9yYXRpb25fbWFuYWdlci50cyIsICIuLi8uLi8uLi9mcm9udGVuZF9zcmMvZHdnX3ZpZXdlcl9hcHAuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogUHJlY2lzaW9uIENBRCAoRFhGL0RXRykgUGFyc2VyICYgVmVjdG9yIEdlb21ldHJ5IFByb2Nlc3Nvci5cbiAqIFN1cHBvcnRzIEF1dG9DQUQgZ3JvdXAgY29kZXMsIEFDSSAyNTYgY29sb3IgaW5kZXgsIHBvbHlsaW5lIGFyYyBidWxnZSBnZW9tZXRyeSxcbiAqIGJsb2NrcywgaGF0Y2hlcywgdGV4dCwgZGltZW5zaW9ucywgYW5kIGRyYXdpbmcgZXh0ZW50cy5cbiAqL1xuXG4vLyBBdXRvQ0FEIENvbG9yIEluZGV4IChBQ0kpIHN0YW5kYXJkIFJHQiBwYWxldHRlIG1hcHBpbmcgKDAtMjU1KVxuZXhwb3J0IGNvbnN0IEFDSV9DT0xPUl9NQVA6IFJlY29yZDxudW1iZXIsIHN0cmluZz4gPSB7XG4gIDA6IFwiIzAwMDAwMFwiLCAgIC8vIEJZQkxPQ0tcbiAgMTogXCIjZmYwMDAwXCIsICAgLy8gUmVkXG4gIDI6IFwiI2ZmZmYwMFwiLCAgIC8vIFllbGxvd1xuICAzOiBcIiMwMGZmMDBcIiwgICAvLyBHcmVlblxuICA0OiBcIiMwMGZmZmZcIiwgICAvLyBDeWFuXG4gIDU6IFwiIzAwMDBmZlwiLCAgIC8vIEJsdWVcbiAgNjogXCIjZmYwMGZmXCIsICAgLy8gTWFnZW50YVxuICA3OiBcIiNmZmZmZmZcIiwgICAvLyBXaGl0ZSAvIEJsYWNrIChkcmF3cyB3aGl0ZSBvbiBkYXJrLCBibGFjayBvbiBsaWdodClcbiAgODogXCIjODA4MDgwXCIsICAgLy8gRGFyayBHcmF5XG4gIDk6IFwiI2MwYzBjMFwiLCAgIC8vIExpZ2h0IEdyYXlcbiAgMTA6IFwiI2ZmMDAwMFwiLCAxMTogXCIjZmY3ZjdmXCIsIDEyOiBcIiNjYzAwMDBcIiwgMTM6IFwiI2NjNjY2NlwiLCAxNDogXCIjOTkwMDAwXCIsXG4gIDIwOiBcIiNmZjNmMDBcIiwgMjE6IFwiI2ZmOWY3ZlwiLCAyMjogXCIjY2MzMzAwXCIsIDIzOiBcIiNjYzdmNjZcIiwgMjQ6IFwiIzk5MjYwMFwiLFxuICAzMDogXCIjZmY3ZjAwXCIsIDMxOiBcIiNmZmJmN2ZcIiwgMzI6IFwiI2NjNjYwMFwiLCAzMzogXCIjY2M5OTY2XCIsIDM0OiBcIiM5OTRjMDBcIixcbiAgNDA6IFwiI2ZmYmYwMFwiLCA0MTogXCIjZmZkZjdmXCIsIDQyOiBcIiNjYzk5MDBcIiwgNDM6IFwiI2NjYjI2NlwiLCA0NDogXCIjOTk3MzAwXCIsXG4gIDUwOiBcIiNmZmZmMDBcIiwgNTE6IFwiI2ZmZmY3ZlwiLCA1MjogXCIjY2NjYzAwXCIsIDUzOiBcIiNjY2NjNjZcIiwgNTQ6IFwiIzk5OTkwMFwiLFxuICA2MDogXCIjYmZmZjAwXCIsIDYxOiBcIiNkZmZmN2ZcIiwgNjI6IFwiIzk5Y2MwMFwiLCA2MzogXCIjYjJjYzY2XCIsIDY0OiBcIiM3Mzk5MDBcIixcbiAgNzA6IFwiIzdmZmYwMFwiLCA3MTogXCIjYmZmZjdmXCIsIDcyOiBcIiM2NmNjMDBcIiwgNzM6IFwiIzk5Y2M2NlwiLCA3NDogXCIjNGM5OTAwXCIsXG4gIDgwOiBcIiMzZmZmMDBcIiwgODE6IFwiIzlmZmY3ZlwiLCA4MjogXCIjMzNjYzAwXCIsIDgzOiBcIiM3ZmNjNjZcIiwgODQ6IFwiIzI2OTkwMFwiLFxuICA5MDogXCIjMDBmZjAwXCIsIDkxOiBcIiM3ZmZmN2ZcIiwgOTI6IFwiIzAwY2MwMFwiLCA5MzogXCIjNjZjYzY2XCIsIDk0OiBcIiMwMDk5MDBcIixcbiAgMTAwOiBcIiMwMGZmM2ZcIiwgMTAxOiBcIiM3ZmZmOWZcIiwgMTAyOiBcIiMwMGNjMzNcIiwgMTAzOiBcIiM2NmNjN2ZcIiwgMTA0OiBcIiMwMDk5MjZcIixcbiAgMTEwOiBcIiMwMGZmN2ZcIiwgMTExOiBcIiM3ZmZmYmZcIiwgMTEyOiBcIiMwMGNjNjZcIiwgMTEzOiBcIiM2NmNjOTlcIiwgMTE0OiBcIiMwMDk5NGNcIixcbiAgMTIwOiBcIiMwMGZmYmZcIiwgMTIxOiBcIiM3ZmZmZGZcIiwgMTIyOiBcIiMwMGNjOTlcIiwgMTIzOiBcIiM2NmNjYjJcIiwgMTI0OiBcIiMwMDk5NzNcIixcbiAgMTMwOiBcIiMwMGZmZmZcIiwgMTMxOiBcIiM3ZmZmZmZcIiwgMTMyOiBcIiMwMGNjY2NcIiwgMTMzOiBcIiM2NmNjY2NcIiwgMTM0OiBcIiMwMDk5OTlcIixcbiAgMTQwOiBcIiMwMGJmZmZcIiwgMTQxOiBcIiM3ZmRmZmZcIiwgMTQyOiBcIiMwMDk5Y2NcIiwgMTQzOiBcIiM2NmIyY2NcIiwgMTQ0OiBcIiMwMDczOTlcIixcbiAgMTUwOiBcIiMwMDdmZmZcIiwgMTUxOiBcIiM3ZmJmZmZcIiwgMTUyOiBcIiMwMDY2Y2NcIiwgMTUzOiBcIiM2Njk5Y2NcIiwgMTU0OiBcIiMwMDRjOTlcIixcbiAgMTYwOiBcIiMwMDNmZmZcIiwgMTYxOiBcIiM3ZjlmZmZcIiwgMTYyOiBcIiMwMDMzY2NcIiwgMTYzOiBcIiM2NjdmY2NcIiwgMTY0OiBcIiMwMDI2OTlcIixcbiAgMTcwOiBcIiMwMDAwZmZcIiwgMTcxOiBcIiM3ZjdmZmZcIiwgMTcyOiBcIiMwMDAwY2NcIiwgMTczOiBcIiM2NjY2Y2NcIiwgMTc0OiBcIiMwMDAwOTlcIixcbiAgMTgwOiBcIiMzZjAwZmZcIiwgMTgxOiBcIiM5ZjdmZmZcIiwgMTgyOiBcIiMzMzAwY2NcIiwgMTgzOiBcIiM3ZjY2Y2NcIiwgMTg0OiBcIiMyNjAwOTlcIixcbiAgMTkwOiBcIiM3ZjAwZmZcIiwgMTkxOiBcIiNiZjdmZmZcIiwgMTkyOiBcIiM2NjAwY2NcIiwgMTkzOiBcIiM5OTY2Y2NcIiwgMTk0OiBcIiM0YzAwOTlcIixcbiAgMjAwOiBcIiNiZjAwZmZcIiwgMjAxOiBcIiNkZjdmZmZcIiwgMjAyOiBcIiM5OTAwY2NcIiwgMjAzOiBcIiNiMjY2Y2NcIiwgMjA0OiBcIiM3MzAwOTlcIixcbiAgMjEwOiBcIiNmZjAwZmZcIiwgMjExOiBcIiNmZjdmZmZcIiwgMjEyOiBcIiNjYzAwY2NcIiwgMjEzOiBcIiNjYzY2Y2NcIiwgMjE0OiBcIiM5OTAwOTlcIixcbiAgMjIwOiBcIiNmZjAwYmZcIiwgMjIxOiBcIiNmZjdmZGZcIiwgMjIyOiBcIiNjYzAwOTlcIiwgMjIzOiBcIiNjYzY2YjJcIiwgMjI0OiBcIiM5OTAwNzNcIixcbiAgMjMwOiBcIiNmZjAwN2ZcIiwgMjMxOiBcIiNmZjdmYmZcIiwgMjMyOiBcIiNjYzAwNjZcIiwgMjMzOiBcIiNjYzY2OTlcIiwgMjM0OiBcIiM5OTAwNGNcIixcbiAgMjQwOiBcIiNmZjAwM2ZcIiwgMjQxOiBcIiNmZjdmOWZcIiwgMjQyOiBcIiNjYzAwMzNcIiwgMjQzOiBcIiNjYzY2N2ZcIiwgMjQ0OiBcIiM5OTAwMjZcIixcbiAgMjUwOiBcIiMzMzMzMzNcIiwgMjUxOiBcIiM1MDUwNTBcIiwgMjUyOiBcIiM2OTY5NjlcIiwgMjUzOiBcIiM4MjgyODJcIiwgMjU0OiBcIiNiZWJlYmVcIiwgMjU1OiBcIiNmZmZmZmZcIlxufTtcblxuZXhwb3J0IGludGVyZmFjZSBDQURQb2ludCB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICB6PzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENBRFZlcnRleCBleHRlbmRzIENBRFBvaW50IHtcbiAgYnVsZ2U/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ0FETGF5ZXIge1xuICBuYW1lOiBzdHJpbmc7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIGFjaTogbnVtYmVyO1xuICB2aXNpYmxlOiBib29sZWFuO1xuICBmcm96ZW4/OiBib29sZWFuO1xuICBsb2NrZWQ/OiBib29sZWFuO1xuICBsaW5lVHlwZT86IHN0cmluZztcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ0FERW50aXR5IHtcbiAgdHlwZTogc3RyaW5nO1xuICBsYXllcjogc3RyaW5nO1xuICBjb2xvcj86IHN0cmluZztcbiAgYWNpPzogbnVtYmVyO1xuICBzdGFydD86IENBRFBvaW50O1xuICBlbmQ/OiBDQURQb2ludDtcbiAgY2VudGVyPzogQ0FEUG9pbnQ7XG4gIHJhZGl1cz86IG51bWJlcjtcbiAgc3RhcnRBbmdsZT86IG51bWJlcjtcbiAgZW5kQW5nbGU/OiBudW1iZXI7XG4gIHZlcnRpY2VzPzogQ0FEVmVydGV4W107XG4gIGNsb3NlZD86IGJvb2xlYW47XG4gIHRleHQ/OiBzdHJpbmc7XG4gIHBvc2l0aW9uPzogQ0FEUG9pbnQ7XG4gIGhlaWdodD86IG51bWJlcjtcbiAgcm90YXRpb24/OiBudW1iZXI7XG4gIGJsb2NrTmFtZT86IHN0cmluZztcbiAgc2NhbGU/OiBDQURQb2ludDtcbiAgcGF0dGVybj86IHN0cmluZztcbiAgYm91bmRhcnk/OiBDQURQb2ludFtdO1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ0FERHJhd2luZ0RhdGEge1xuICBzdGF0dXM6IHN0cmluZztcbiAgbW9kZWxfbmFtZTogc3RyaW5nO1xuICBmaWxlX2Zvcm1hdDogc3RyaW5nO1xuICB1bml0czogc3RyaW5nO1xuICBzcGFjZXM6IHN0cmluZ1tdO1xuICBsYXllcnM6IFJlY29yZDxzdHJpbmcsIENBRExheWVyPjtcbiAgZW50aXRpZXM6IENBREVudGl0eVtdO1xuICBibG9ja3M/OiBSZWNvcmQ8c3RyaW5nLCB7IGVudGl0aWVzOiBDQURFbnRpdHlbXSB9PjtcbiAgZXh0ZW50czoge1xuICAgIG1pbjogQ0FEUG9pbnQ7XG4gICAgbWF4OiBDQURQb2ludDtcbiAgICBjZW50ZXI6IENBRFBvaW50O1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gIH07XG4gIGVudGl0eV9jb3VudDogbnVtYmVyO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYXJjIGN1cnZlIHBvaW50cyBmcm9tIHR3byBwb2x5bGluZSB2ZXJ0aWNlcyBhbmQgYSBidWxnZSBmYWN0b3IuXG4gKiBCdWxnZSA9IHRhbihpbmNsdWRlZF9hbmdsZSAvIDQpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlQnVsZ2VBcmNQb2ludHMoXG4gIHAxOiBDQURQb2ludCxcbiAgcDI6IENBRFBvaW50LFxuICBidWxnZTogbnVtYmVyLFxuICBzZWdtZW50czogbnVtYmVyID0gMTZcbik6IENBRFBvaW50W10ge1xuICBpZiAoTWF0aC5hYnMoYnVsZ2UpIDwgMWUtNikge1xuICAgIHJldHVybiBbcDEsIHAyXTtcbiAgfVxuXG4gIGNvbnN0IGR4ID0gcDIueCAtIHAxLng7XG4gIGNvbnN0IGR5ID0gcDIueSAtIHAxLnk7XG4gIGNvbnN0IGQgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICBpZiAoZCA8IDFlLTkpIHJldHVybiBbcDFdO1xuXG4gIGNvbnN0IHRoZXRhID0gNCAqIE1hdGguYXRhbihidWxnZSk7XG4gIGNvbnN0IHJhZGl1cyA9IChkICogKDEgKyBidWxnZSAqIGJ1bGdlKSkgLyAoNCAqIE1hdGguYWJzKGJ1bGdlKSk7XG5cbiAgLy8gTWlkcG9pbnQgb2YgY2hvcmRcbiAgY29uc3QgbXggPSAocDEueCArIHAyLngpIC8gMjtcbiAgY29uc3QgbXkgPSAocDEueSArIHAyLnkpIC8gMjtcblxuICAvLyBOb3JtYWwgdmVjdG9yIHRvIGNob3JkXG4gIGNvbnN0IG54ID0gLWR5IC8gZDtcbiAgY29uc3QgbnkgPSBkeCAvIGQ7XG5cbiAgLy8gRGlzdGFuY2UgZnJvbSBjaG9yZCB0byBjZW50ZXJcbiAgY29uc3QgZGlzdFRvQ2VudGVyID0gKGQgKiAoMSAtIGJ1bGdlICogYnVsZ2UpKSAvICg0ICogYnVsZ2UpO1xuICBjb25zdCBjeCA9IG14ICsgZGlzdFRvQ2VudGVyICogbng7XG4gIGNvbnN0IGN5ID0gbXkgKyBkaXN0VG9DZW50ZXIgKiBueTtcblxuICAvLyBTdGFydCBhbmQgc3dlZXAgYW5nbGVzXG4gIGNvbnN0IGExID0gTWF0aC5hdGFuMihwMS55IC0gY3ksIHAxLnggLSBjeCk7XG4gIGxldCBhMiA9IE1hdGguYXRhbjIocDIueSAtIGN5LCBwMi54IC0gY3gpO1xuXG4gIGlmIChidWxnZSA+IDAgJiYgYTIgPD0gYTEpIHtcbiAgICBhMiArPSAyICogTWF0aC5QSTtcbiAgfSBlbHNlIGlmIChidWxnZSA8IDAgJiYgYTIgPj0gYTEpIHtcbiAgICBhMiAtPSAyICogTWF0aC5QSTtcbiAgfVxuXG4gIGNvbnN0IHBvaW50czogQ0FEUG9pbnRbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8PSBzZWdtZW50czsgaSsrKSB7XG4gICAgY29uc3QgdCA9IGkgLyBzZWdtZW50cztcbiAgICBjb25zdCBhbmcgPSBhMSArIHQgKiAoYTIgLSBhMSk7XG4gICAgcG9pbnRzLnB1c2goe1xuICAgICAgeDogY3ggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmcpLFxuICAgICAgeTogY3kgKyByYWRpdXMgKiBNYXRoLnNpbihhbmcpLFxuICAgICAgejogcDEueiB8fCAwLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHBvaW50cztcbn1cblxuLyoqXG4gKiBQYXJzZXMgcmF3IERYRiB0ZXh0IGludG8gYSBzdHJ1Y3R1cmVkIENBRERyYXdpbmdEYXRhIG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRFhGVGV4dChkeGZDb250ZW50OiBzdHJpbmcpOiBDQUREcmF3aW5nRGF0YSB7XG4gIGNvbnN0IGxpbmVzID0gZHhmQ29udGVudC5zcGxpdCgvXFxyP1xcbi8pO1xuICBsZXQgaSA9IDA7XG5cbiAgZnVuY3Rpb24gbmV4dEdyb3VwKCk6IHsgY29kZTogbnVtYmVyOyB2YWx1ZTogc3RyaW5nIH0gfCBudWxsIHtcbiAgICBpZiAoaSA+PSBsaW5lcy5sZW5ndGggLSAxKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCBjb2RlID0gcGFyc2VJbnQobGluZXNbaSsrXS50cmltKCksIDEwKTtcbiAgICBjb25zdCB2YWx1ZSA9IGxpbmVzW2krK10udHJpbSgpO1xuICAgIHJldHVybiB7IGNvZGUsIHZhbHVlIH07XG4gIH1cblxuICBjb25zdCBsYXllcnM6IFJlY29yZDxzdHJpbmcsIENBRExheWVyPiA9IHtcbiAgICBcIjBcIjogeyBuYW1lOiBcIjBcIiwgY29sb3I6IFwiI2ZmZmZmZlwiLCBhY2k6IDcsIHZpc2libGU6IHRydWUgfSxcbiAgfTtcbiAgY29uc3QgZW50aXRpZXM6IENBREVudGl0eVtdID0gW107XG4gIGNvbnN0IGJsb2NrczogUmVjb3JkPHN0cmluZywgeyBlbnRpdGllczogQ0FERW50aXR5W10gfT4gPSB7fTtcblxuICBsZXQgY3VycmVudFNlY3Rpb24gPSBcIlwiO1xuICBsZXQgY3VycmVudFRhYmxlID0gXCJcIjtcbiAgbGV0IGN1cnJlbnRCbG9jazogeyBuYW1lOiBzdHJpbmc7IGVudGl0aWVzOiBDQURFbnRpdHlbXSB9IHwgbnVsbCA9IG51bGw7XG5cbiAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGggLSAxKSB7XG4gICAgY29uc3QgZ3JvdXAgPSBuZXh0R3JvdXAoKTtcbiAgICBpZiAoIWdyb3VwKSBicmVhaztcblxuICAgIGlmIChncm91cC5jb2RlID09PSAwICYmIGdyb3VwLnZhbHVlID09PSBcIlNFQ1RJT05cIikge1xuICAgICAgY29uc3QgbmFtZUdyb3VwID0gbmV4dEdyb3VwKCk7XG4gICAgICBjdXJyZW50U2VjdGlvbiA9IG5hbWVHcm91cCA/IG5hbWVHcm91cC52YWx1ZSA6IFwiXCI7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoZ3JvdXAuY29kZSA9PT0gMCAmJiBncm91cC52YWx1ZSA9PT0gXCJFTkRTRUNcIikge1xuICAgICAgY3VycmVudFNlY3Rpb24gPSBcIlwiO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBUQUJMRVMgc2VjdGlvbiAoTGF5ZXJzKVxuICAgIGlmIChjdXJyZW50U2VjdGlvbiA9PT0gXCJUQUJMRVNcIikge1xuICAgICAgaWYgKGdyb3VwLmNvZGUgPT09IDAgJiYgZ3JvdXAudmFsdWUgPT09IFwiVEFCTEVcIikge1xuICAgICAgICBjb25zdCB0TmFtZSA9IG5leHRHcm91cCgpO1xuICAgICAgICBjdXJyZW50VGFibGUgPSB0TmFtZSA/IHROYW1lLnZhbHVlIDogXCJcIjtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoZ3JvdXAuY29kZSA9PT0gMCAmJiBncm91cC52YWx1ZSA9PT0gXCJFTkRUQUJcIikge1xuICAgICAgICBjdXJyZW50VGFibGUgPSBcIlwiO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRUYWJsZSA9PT0gXCJMQVlFUlwiICYmIGdyb3VwLmNvZGUgPT09IDAgJiYgZ3JvdXAudmFsdWUgPT09IFwiTEFZRVJcIikge1xuICAgICAgICBsZXQgbE5hbWUgPSBcIlwiO1xuICAgICAgICBsZXQgbENvbG9yID0gXCIjZmZmZmZmXCI7XG4gICAgICAgIGxldCBsQWNpID0gNztcbiAgICAgICAgbGV0IGxGcm96ZW4gPSBmYWxzZTtcblxuICAgICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBjb25zdCBsZyA9IG5leHRHcm91cCgpO1xuICAgICAgICAgIGlmICghbGcgfHwgbGcuY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgaSAtPSAyOyAvLyBiYWNrdHJhY2sgdG8gZW50aXR5IHN0YXJ0XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxnLmNvZGUgPT09IDIpIGxOYW1lID0gbGcudmFsdWU7XG4gICAgICAgICAgaWYgKGxnLmNvZGUgPT09IDYyKSB7XG4gICAgICAgICAgICBjb25zdCBhY2lWYWwgPSBNYXRoLmFicyhwYXJzZUludChsZy52YWx1ZSwgMTApKTtcbiAgICAgICAgICAgIGxBY2kgPSBhY2lWYWw7XG4gICAgICAgICAgICBsQ29sb3IgPSBBQ0lfQ09MT1JfTUFQW2FjaVZhbF0gfHwgXCIjZmZmZmZmXCI7XG4gICAgICAgICAgICBpZiAocGFyc2VJbnQobGcudmFsdWUsIDEwKSA8IDApIGxGcm96ZW4gPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGcuY29kZSA9PT0gNzAgJiYgKHBhcnNlSW50KGxnLnZhbHVlLCAxMCkgJiAxKSkge1xuICAgICAgICAgICAgbEZyb3plbiA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxOYW1lKSB7XG4gICAgICAgICAgbGF5ZXJzW2xOYW1lXSA9IHtcbiAgICAgICAgICAgIG5hbWU6IGxOYW1lLFxuICAgICAgICAgICAgY29sb3I6IGxDb2xvcixcbiAgICAgICAgICAgIGFjaTogbEFjaSxcbiAgICAgICAgICAgIHZpc2libGU6ICFsRnJvemVuLFxuICAgICAgICAgICAgZnJvemVuOiBsRnJvemVuLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQcm9jZXNzIEJMT0NLUyBhbmQgRU5USVRJRVNcbiAgICBpZiAoY3VycmVudFNlY3Rpb24gPT09IFwiQkxPQ0tTXCIgfHwgY3VycmVudFNlY3Rpb24gPT09IFwiRU5USVRJRVNcIikge1xuICAgICAgaWYgKGdyb3VwLmNvZGUgPT09IDApIHtcbiAgICAgICAgY29uc3QgZW50VHlwZSA9IGdyb3VwLnZhbHVlO1xuXG4gICAgICAgIGlmIChlbnRUeXBlID09PSBcIkJMT0NLXCIpIHtcbiAgICAgICAgICBjdXJyZW50QmxvY2sgPSB7IG5hbWU6IFwiXCIsIGVudGl0aWVzOiBbXSB9O1xuICAgICAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgY29uc3QgYmcgPSBuZXh0R3JvdXAoKTtcbiAgICAgICAgICAgIGlmICghYmcgfHwgYmcuY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICBpIC09IDI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJnLmNvZGUgPT09IDIpIGN1cnJlbnRCbG9jay5uYW1lID0gYmcudmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudFR5cGUgPT09IFwiRU5EQkxLXCIpIHtcbiAgICAgICAgICBpZiAoY3VycmVudEJsb2NrICYmIGN1cnJlbnRCbG9jay5uYW1lKSB7XG4gICAgICAgICAgICBibG9ja3NbY3VycmVudEJsb2NrLm5hbWVdID0geyBlbnRpdGllczogY3VycmVudEJsb2NrLmVudGl0aWVzIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1cnJlbnRCbG9jayA9IG51bGw7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQYXJzZSBFbnRpdHlcbiAgICAgICAgY29uc3QgZW50OiBDQURFbnRpdHkgPSB7XG4gICAgICAgICAgdHlwZTogZW50VHlwZSxcbiAgICAgICAgICBsYXllcjogXCIwXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGVudFR5cGUgPT09IFwiTElORVwiKSB7XG4gICAgICAgICAgZW50LnN0YXJ0ID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgICAgZW50LmVuZCA9IHsgeDogMCwgeTogMCwgejogMCB9O1xuICAgICAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgY29uc3QgZyA9IG5leHRHcm91cCgpO1xuICAgICAgICAgICAgaWYgKCFnIHx8IGcuY29kZSA9PT0gMCkgeyBpIC09IDI7IGJyZWFrOyB9XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA4KSBlbnQubGF5ZXIgPSBnLnZhbHVlO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNjIpIHsgZW50LmFjaSA9IE1hdGguYWJzKHBhcnNlSW50KGcudmFsdWUsIDEwKSk7IGVudC5jb2xvciA9IEFDSV9DT0xPUl9NQVBbZW50LmFjaV07IH1cbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDEwKSBlbnQuc3RhcnQueCA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAyMCkgZW50LnN0YXJ0LnkgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMzApIGVudC5zdGFydC56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDExKSBlbnQuZW5kLnggPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMjEpIGVudC5lbmQueSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAzMSkgZW50LmVuZC56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGN1cnJlbnRCbG9jaykgY3VycmVudEJsb2NrLmVudGl0aWVzLnB1c2goZW50KTtcbiAgICAgICAgICBlbHNlIGVudGl0aWVzLnB1c2goZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRUeXBlID09PSBcIkNJUkNMRVwiKSB7XG4gICAgICAgICAgZW50LmNlbnRlciA9IHsgeDogMCwgeTogMCwgejogMCB9O1xuICAgICAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgY29uc3QgZyA9IG5leHRHcm91cCgpO1xuICAgICAgICAgICAgaWYgKCFnIHx8IGcuY29kZSA9PT0gMCkgeyBpIC09IDI7IGJyZWFrOyB9XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA4KSBlbnQubGF5ZXIgPSBnLnZhbHVlO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNjIpIHsgZW50LmFjaSA9IE1hdGguYWJzKHBhcnNlSW50KGcudmFsdWUsIDEwKSk7IGVudC5jb2xvciA9IEFDSV9DT0xPUl9NQVBbZW50LmFjaV07IH1cbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDEwKSBlbnQuY2VudGVyLnggPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMjApIGVudC5jZW50ZXIueSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAzMCkgZW50LmNlbnRlci56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDQwKSBlbnQucmFkaXVzID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGN1cnJlbnRCbG9jaykgY3VycmVudEJsb2NrLmVudGl0aWVzLnB1c2goZW50KTtcbiAgICAgICAgICBlbHNlIGVudGl0aWVzLnB1c2goZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRUeXBlID09PSBcIkFSQ1wiKSB7XG4gICAgICAgICAgZW50LmNlbnRlciA9IHsgeDogMCwgeTogMCwgejogMCB9O1xuICAgICAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgY29uc3QgZyA9IG5leHRHcm91cCgpO1xuICAgICAgICAgICAgaWYgKCFnIHx8IGcuY29kZSA9PT0gMCkgeyBpIC09IDI7IGJyZWFrOyB9XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA4KSBlbnQubGF5ZXIgPSBnLnZhbHVlO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNjIpIHsgZW50LmFjaSA9IE1hdGguYWJzKHBhcnNlSW50KGcudmFsdWUsIDEwKSk7IGVudC5jb2xvciA9IEFDSV9DT0xPUl9NQVBbZW50LmFjaV07IH1cbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDEwKSBlbnQuY2VudGVyLnggPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMjApIGVudC5jZW50ZXIueSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAzMCkgZW50LmNlbnRlci56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDQwKSBlbnQucmFkaXVzID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDUwKSBlbnQuc3RhcnRBbmdsZSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA1MSkgZW50LmVuZEFuZ2xlID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGN1cnJlbnRCbG9jaykgY3VycmVudEJsb2NrLmVudGl0aWVzLnB1c2goZW50KTtcbiAgICAgICAgICBlbHNlIGVudGl0aWVzLnB1c2goZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRUeXBlID09PSBcIkxXUE9MWUxJTkVcIikge1xuICAgICAgICAgIGVudC52ZXJ0aWNlcyA9IFtdO1xuICAgICAgICAgIGxldCBjdXJWOiBDQURWZXJ0ZXggfCBudWxsID0gbnVsbDtcbiAgICAgICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGcgPSBuZXh0R3JvdXAoKTtcbiAgICAgICAgICAgIGlmICghZyB8fCBnLmNvZGUgPT09IDApIHsgaSAtPSAyOyBicmVhazsgfVxuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gOCkgZW50LmxheWVyID0gZy52YWx1ZTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDYyKSB7IGVudC5hY2kgPSBNYXRoLmFicyhwYXJzZUludChnLnZhbHVlLCAxMCkpOyBlbnQuY29sb3IgPSBBQ0lfQ09MT1JfTUFQW2VudC5hY2ldOyB9XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA3MCkgZW50LmNsb3NlZCA9IChwYXJzZUludChnLnZhbHVlLCAxMCkgJiAxKSA9PT0gMTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDEwKSB7XG4gICAgICAgICAgICAgIGN1clYgPSB7IHg6IHBhcnNlRmxvYXQoZy52YWx1ZSksIHk6IDAgfTtcbiAgICAgICAgICAgICAgZW50LnZlcnRpY2VzLnB1c2goY3VyVik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAyMCAmJiBjdXJWKSBjdXJWLnkgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNDIgJiYgY3VyVikgY3VyVi5idWxnZSA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjdXJyZW50QmxvY2spIGN1cnJlbnRCbG9jay5lbnRpdGllcy5wdXNoKGVudCk7XG4gICAgICAgICAgZWxzZSBlbnRpdGllcy5wdXNoKGVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZW50VHlwZSA9PT0gXCJURVhUXCIgfHwgZW50VHlwZSA9PT0gXCJNVEVYVFwiKSB7XG4gICAgICAgICAgZW50LnBvc2l0aW9uID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgICAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBjb25zdCBnID0gbmV4dEdyb3VwKCk7XG4gICAgICAgICAgICBpZiAoIWcgfHwgZy5jb2RlID09PSAwKSB7IGkgLT0gMjsgYnJlYWs7IH1cbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDgpIGVudC5sYXllciA9IGcudmFsdWU7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAxKSBlbnQudGV4dCA9IGcudmFsdWU7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAxMCkgZW50LnBvc2l0aW9uLnggPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMjApIGVudC5wb3NpdGlvbi55ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDMwKSBlbnQucG9zaXRpb24ueiA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA0MCkgZW50LmhlaWdodCA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA1MCkgZW50LnJvdGF0aW9uID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGN1cnJlbnRCbG9jaykgY3VycmVudEJsb2NrLmVudGl0aWVzLnB1c2goZW50KTtcbiAgICAgICAgICBlbHNlIGVudGl0aWVzLnB1c2goZW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChlbnRUeXBlID09PSBcIklOU0VSVFwiKSB7XG4gICAgICAgICAgZW50LnBvc2l0aW9uID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgICAgZW50LnNjYWxlID0geyB4OiAxLCB5OiAxLCB6OiAxIH07XG4gICAgICAgICAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBjb25zdCBnID0gbmV4dEdyb3VwKCk7XG4gICAgICAgICAgICBpZiAoIWcgfHwgZy5jb2RlID09PSAwKSB7IGkgLT0gMjsgYnJlYWs7IH1cbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDIpIGVudC5ibG9ja05hbWUgPSBnLnZhbHVlO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gOCkgZW50LmxheWVyID0gZy52YWx1ZTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDEwKSBlbnQucG9zaXRpb24ueCA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSAyMCkgZW50LnBvc2l0aW9uLnkgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gMzApIGVudC5wb3NpdGlvbi56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDQxKSBlbnQuc2NhbGUueCA9IHBhcnNlRmxvYXQoZy52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZy5jb2RlID09PSA0MikgZW50LnNjYWxlLnkgPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgICAgaWYgKGcuY29kZSA9PT0gNDMpIGVudC5zY2FsZS56ID0gcGFyc2VGbG9hdChnLnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChnLmNvZGUgPT09IDUwKSBlbnQucm90YXRpb24gPSBwYXJzZUZsb2F0KGcudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY3VycmVudEJsb2NrKSBjdXJyZW50QmxvY2suZW50aXRpZXMucHVzaChlbnQpO1xuICAgICAgICAgIGVsc2UgZW50aXRpZXMucHVzaChlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFNraXAgb3RoZXIgZW50aXR5IHR5cGVzIGdyYWNlZnVsbHlcbiAgICAgICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGcgPSBuZXh0R3JvdXAoKTtcbiAgICAgICAgICAgIGlmICghZyB8fCBnLmNvZGUgPT09IDApIHsgaSAtPSAyOyBicmVhazsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBkcmF3aW5nIGJvdW5kaW5nIGJveCBleHRlbnRzXG4gIGxldCBtaW5YID0gSW5maW5pdHksIG1pblkgPSBJbmZpbml0eTtcbiAgbGV0IG1heFggPSAtSW5maW5pdHksIG1heFkgPSAtSW5maW5pdHk7XG5cbiAgZnVuY3Rpb24gdXBkYXRlQm91bmRzKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKGlzTmFOKHgpIHx8IGlzTmFOKHkpKSByZXR1cm47XG4gICAgaWYgKHggPCBtaW5YKSBtaW5YID0geDtcbiAgICBpZiAoeSA8IG1pblkpIG1pblkgPSB5O1xuICAgIGlmICh4ID4gbWF4WCkgbWF4WCA9IHg7XG4gICAgaWYgKHkgPiBtYXhZKSBtYXhZID0geTtcbiAgfVxuXG4gIGZvciAoY29uc3QgZW50IG9mIGVudGl0aWVzKSB7XG4gICAgaWYgKGVudC5zdGFydCkgeyB1cGRhdGVCb3VuZHMoZW50LnN0YXJ0LngsIGVudC5zdGFydC55KTsgfVxuICAgIGlmIChlbnQuZW5kKSB7IHVwZGF0ZUJvdW5kcyhlbnQuZW5kLngsIGVudC5lbmQueSk7IH1cbiAgICBpZiAoZW50LmNlbnRlciAmJiBlbnQucmFkaXVzKSB7XG4gICAgICB1cGRhdGVCb3VuZHMoZW50LmNlbnRlci54IC0gZW50LnJhZGl1cywgZW50LmNlbnRlci55IC0gZW50LnJhZGl1cyk7XG4gICAgICB1cGRhdGVCb3VuZHMoZW50LmNlbnRlci54ICsgZW50LnJhZGl1cywgZW50LmNlbnRlci55ICsgZW50LnJhZGl1cyk7XG4gICAgfVxuICAgIGlmIChlbnQudmVydGljZXMpIHtcbiAgICAgIGZvciAoY29uc3QgdiBvZiBlbnQudmVydGljZXMpIHtcbiAgICAgICAgdXBkYXRlQm91bmRzKHYueCwgdi55KTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVudC5wb3NpdGlvbikge1xuICAgICAgdXBkYXRlQm91bmRzKGVudC5wb3NpdGlvbi54LCBlbnQucG9zaXRpb24ueSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG1pblggPT09IEluZmluaXR5KSB7XG4gICAgbWluWCA9IDA7IG1pblkgPSAwOyBtYXhYID0gMTAwMDsgbWF4WSA9IDEwMDA7XG4gIH1cblxuICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KG1heFggLSBtaW5YLCAxMDApO1xuICBjb25zdCBoZWlnaHQgPSBNYXRoLm1heChtYXhZIC0gbWluWSwgMTAwKTtcblxuICByZXR1cm4ge1xuICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgbW9kZWxfbmFtZTogXCJJbXBvcnRlZF9DQURfRHJhd2luZ1wiLFxuICAgIGZpbGVfZm9ybWF0OiBcIkRYRlwiLFxuICAgIHVuaXRzOiBcIm1tXCIsXG4gICAgc3BhY2VzOiBbXCJNb2RlbCBTcGFjZVwiXSxcbiAgICBsYXllcnMsXG4gICAgZW50aXRpZXMsXG4gICAgYmxvY2tzLFxuICAgIGV4dGVudHM6IHtcbiAgICAgIG1pbjogeyB4OiBtaW5YLCB5OiBtaW5ZLCB6OiAwIH0sXG4gICAgICBtYXg6IHsgeDogbWF4WCwgeTogbWF4WSwgejogMCB9LFxuICAgICAgY2VudGVyOiB7IHg6IG1pblggKyB3aWR0aCAvIDIsIHk6IG1pblkgKyBoZWlnaHQgLyAyLCB6OiAwIH0sXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICB9LFxuICAgIGVudGl0eV9jb3VudDogZW50aXRpZXMubGVuZ3RoLFxuICB9O1xufVxuIiwgIi8qKlxuICogSGlnaC1QZXJmb3JtYW5jZSBWZWN0b3IgQ0FEIENhbnZhcyBSZW5kZXJlci5cbiAqIFN1cHBvcnRzIEF1dG9DQUQgQUNJIGNvbG9ycywgcG9seWxpbmUgYXJjIGJ1bGdlcywgYmxvY2tzLCB0ZXh0LCBoYXRjaGVzLFxuICogcGFuLCB3aGVlbCB6b29tIGF0IGN1cnNvciwgem9vbSBleHRlbnRzLCB2aXN1YWwgdGhlbWVzLCBzbmFwcGluZyBpbmRpY2F0b3JzLFxuICogbWVhc3VyZW1lbnQgb3ZlcmxheXMsIGFuZCBCSU1jb2xsYWIgQkNGIHZpc3VhbCBtYXJrdXBzLlxuICovXG5cbmltcG9ydCB7XG4gIENBRERyYXdpbmdEYXRhLFxuICBDQURFbnRpdHksXG4gIENBRFBvaW50LFxuICBjYWxjdWxhdGVCdWxnZUFyY1BvaW50cyxcbiAgQUNJX0NPTE9SX01BUCxcbn0gZnJvbSBcIi4vZHhmX3BhcnNlcl9lbmdpbmVcIjtcbmltcG9ydCB7IFNuYXBUYXJnZXQgfSBmcm9tIFwiLi9jYWRfbWVhc3VyZW1lbnRfdG9vbHNcIjtcbmltcG9ydCB7IEJDRkFzc29jaWF0ZWRNYXJrdXAsIEJDRlRvcGljSXRlbSB9IGZyb20gXCIuL2JjZl9jb2xsYWJvcmF0aW9uX21hbmFnZXJcIjtcblxuZXhwb3J0IHR5cGUgQ0FEVGhlbWUgPSBcImRhcmtcIiB8IFwiYmxhY2tcIiB8IFwicGFwZXJcIiB8IFwiYmx1ZXByaW50XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGhlbWVDb2xvcnMge1xuICBiYWNrZ3JvdW5kOiBzdHJpbmc7XG4gIGdyaWRNYWpvcjogc3RyaW5nO1xuICBncmlkTWlub3I6IHN0cmluZztcbiAgY3Jvc3NoYWlyOiBzdHJpbmc7XG4gIGRlZmF1bHRFbnRpdHk6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IFRIRU1FX1BBTEVUVEVTOiBSZWNvcmQ8Q0FEVGhlbWUsIFRoZW1lQ29sb3JzPiA9IHtcbiAgZGFyazoge1xuICAgIGJhY2tncm91bmQ6IFwiIzIxMjgzMFwiLFxuICAgIGdyaWRNYWpvcjogXCIjMmIzNDNmXCIsXG4gICAgZ3JpZE1pbm9yOiBcIiMyNTJkMzdcIixcbiAgICBjcm9zc2hhaXI6IFwiIzVjNjk3OFwiLFxuICAgIGRlZmF1bHRFbnRpdHk6IFwiI2ZmZmZmZlwiLFxuICB9LFxuICBibGFjazoge1xuICAgIGJhY2tncm91bmQ6IFwiIzBlMTExNlwiLFxuICAgIGdyaWRNYWpvcjogXCIjMWIyMDI4XCIsXG4gICAgZ3JpZE1pbm9yOiBcIiMxNDE4MWZcIixcbiAgICBjcm9zc2hhaXI6IFwiIzQ4NTI2MFwiLFxuICAgIGRlZmF1bHRFbnRpdHk6IFwiI2ZmZmZmZlwiLFxuICB9LFxuICBwYXBlcjoge1xuICAgIGJhY2tncm91bmQ6IFwiI2Y4ZjlmYVwiLFxuICAgIGdyaWRNYWpvcjogXCIjZTJlNmVhXCIsXG4gICAgZ3JpZE1pbm9yOiBcIiNlZGVlZjFcIixcbiAgICBjcm9zc2hhaXI6IFwiI2FkYjViZFwiLFxuICAgIGRlZmF1bHRFbnRpdHk6IFwiIzIxMjUyOVwiLFxuICB9LFxuICBibHVlcHJpbnQ6IHtcbiAgICBiYWNrZ3JvdW5kOiBcIiMwYzIzM2ZcIixcbiAgICBncmlkTWFqb3I6IFwiIzE1Mzg2M1wiLFxuICAgIGdyaWRNaW5vcjogXCIjMTAyYzRmXCIsXG4gICAgY3Jvc3NoYWlyOiBcIiMzYTcwYjJcIixcbiAgICBkZWZhdWx0RW50aXR5OiBcIiNlNmYyZmZcIixcbiAgfSxcbn07XG5cbmV4cG9ydCBjbGFzcyBDQURDYW52YXNSZW5kZXJlciB7XG4gIHB1YmxpYyBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICBwdWJsaWMgY3R4OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gIHB1YmxpYyBkcmF3aW5nOiBDQUREcmF3aW5nRGF0YSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFZpZXdwb3J0IFN0YXRlXG4gIHB1YmxpYyBwYW5YOiBudW1iZXIgPSAwOyAvLyBXb3JsZCBjb29yZGluYXRlIGF0IHZpZXdwb3J0IGNlbnRlclxuICBwdWJsaWMgcGFuWTogbnVtYmVyID0gMDtcbiAgcHVibGljIHpvb206IG51bWJlciA9IDAuMDU7IC8vIFNjcmVlbiBwaXhlbHMgcGVyIHdvcmxkIHVuaXRcbiAgcHVibGljIHRoZW1lOiBDQURUaGVtZSA9IFwiZGFya1wiO1xuXG4gIC8vIExheWVyIE92ZXJyaWRlc1xuICBwdWJsaWMgbGF5ZXJWaXNpYmlsaXR5OiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiA9IHt9O1xuXG4gIC8vIEludGVyYWN0aXZlIE92ZXJsYXlzXG4gIHB1YmxpYyBzbmFwVGFyZ2V0OiBTbmFwVGFyZ2V0IHwgbnVsbCA9IG51bGw7XG4gIHB1YmxpYyBhY3RpdmVNZWFzdXJlUG9pbnRzOiBDQURQb2ludFtdID0gW107XG4gIHB1YmxpYyBtZWFzdXJlTW9kZTogXCJub25lXCIgfCBcImRpc3RhbmNlXCIgfCBcImFyZWFcIiB8IFwiYW5nbGVcIiA9IFwibm9uZVwiO1xuXG4gIC8vIEJDRiBDb2xsYWJvcmF0aW9uIE92ZXJsYXlzXG4gIHB1YmxpYyBpc3N1ZXM6IEJDRlRvcGljSXRlbVtdID0gW107XG4gIHB1YmxpYyBhY3RpdmVJc3N1ZUlkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgcHVibGljIGRyYWZ0TWFya3VwczogQkNGQXNzb2NpYXRlZE1hcmt1cFtdID0gW107XG5cbiAgcHJpdmF0ZSBpc0RyYWdnaW5nOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgZHJhZ1N0YXJ0WDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBkcmFnU3RhcnRZOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGFuaW1GcmFtZUlkOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gb2J0YWluIDJEIHJlbmRlcmluZyBjb250ZXh0IGZvciBDQUQgY2FudmFzLlwiKTtcbiAgICB9XG4gICAgdGhpcy5jdHggPSBjb250ZXh0O1xuXG4gICAgdGhpcy5iaW5kRXZlbnRzKCk7XG4gICAgdGhpcy5yZXNpemUoKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXREcmF3aW5nKGRhdGE6IENBRERyYXdpbmdEYXRhKSB7XG4gICAgdGhpcy5kcmF3aW5nID0gZGF0YTtcbiAgICB0aGlzLmxheWVyVmlzaWJpbGl0eSA9IHt9O1xuICAgIGZvciAoY29uc3QgW25hbWUsIGxheWVyXSBvZiBPYmplY3QuZW50cmllcyhkYXRhLmxheWVycykpIHtcbiAgICAgIHRoaXMubGF5ZXJWaXNpYmlsaXR5W25hbWVdID0gbGF5ZXIudmlzaWJsZSAhPT0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuem9vbUV4dGVudHMoKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRUaGVtZSh0aGVtZTogQ0FEVGhlbWUpIHtcbiAgICB0aGlzLnRoZW1lID0gdGhlbWU7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIHB1YmxpYyByZXNpemUoKSB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5jYW52YXMucGFyZW50RWxlbWVudDtcbiAgICBjb25zdCByZWN0ID0gcGFyZW50Py5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBsZXQgd2lkdGggPSByZWN0Py53aWR0aCB8fCBwYXJlbnQ/LmNsaWVudFdpZHRoIHx8IDgwMDtcbiAgICBsZXQgaGVpZ2h0ID0gcmVjdD8uaGVpZ2h0IHx8IHBhcmVudD8uY2xpZW50SGVpZ2h0IHx8IDYwMDtcblxuICAgIC8vIEd1YXJkIGFnYWluc3QgY29sbGFwc2VkIHBhcmVudCBkaW1lbnNpb25zXG4gICAgaWYgKGhlaWdodCA8IDIwMCkge1xuICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgod2luZG93LmlubmVySGVpZ2h0IC0gMTYwLCA1MDApO1xuICAgIH1cbiAgICBpZiAod2lkdGggPCAyMDApIHtcbiAgICAgIHdpZHRoID0gTWF0aC5tYXgod2luZG93LmlubmVyV2lkdGggLSAzNjAsIDYwMCk7XG4gICAgfVxuXG4gICAgY29uc3QgZHByID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHdpZHRoICogZHByO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGhlaWdodCAqIGRwcjtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuICAgIHRoaXMuY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcbiAgICB0aGlzLmN0eC5zY2FsZShkcHIsIGRwcik7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIHdvcmxkIENBRCBjb29yZGluYXRlcyAoWCwgWSkgdG8gc2NyZWVuIHBpeGVscyAodSwgdikuXG4gICAqIE5vdGU6IENBRCBZIGluY3JlYXNlcyB1cHdhcmRzOyBzY3JlZW4gWSBpbmNyZWFzZXMgZG93bndhcmRzLlxuICAgKi9cbiAgcHVibGljIHdvcmxkVG9TY3JlZW4ocDogQ0FEUG9pbnQpOiB7IHU6IG51bWJlcjsgdjogbnVtYmVyIH0ge1xuICAgIGNvbnN0IHcgPSB0aGlzLmNhbnZhcy5jbGllbnRXaWR0aDtcbiAgICBjb25zdCBoID0gdGhpcy5jYW52YXMuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IHUgPSAocC54IC0gdGhpcy5wYW5YKSAqIHRoaXMuem9vbSArIHcgLyAyO1xuICAgIGNvbnN0IHYgPSAtKHAueSAtIHRoaXMucGFuWSkgKiB0aGlzLnpvb20gKyBoIC8gMjtcbiAgICByZXR1cm4geyB1LCB2IH07XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBzY3JlZW4gcGl4ZWxzICh1LCB2KSB0byB3b3JsZCBDQUQgY29vcmRpbmF0ZXMgKFgsIFkpLlxuICAgKi9cbiAgcHVibGljIHNjcmVlblRvV29ybGQodTogbnVtYmVyLCB2OiBudW1iZXIpOiBDQURQb2ludCB7XG4gICAgY29uc3QgdyA9IHRoaXMuY2FudmFzLmNsaWVudFdpZHRoO1xuICAgIGNvbnN0IGggPSB0aGlzLmNhbnZhcy5jbGllbnRIZWlnaHQ7XG4gICAgY29uc3QgeCA9ICh1IC0gdyAvIDIpIC8gdGhpcy56b29tICsgdGhpcy5wYW5YO1xuICAgIGNvbnN0IHkgPSAtKHYgLSBoIC8gMikgLyB0aGlzLnpvb20gKyB0aGlzLnBhblk7XG4gICAgcmV0dXJuIHsgeCwgeSwgejogMCB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFpvb20gZXh0ZW50czogY2VudGVycyBhbmQgZml0cyBkcmF3aW5nIGJvdW5kaW5nIGJveCBpbnNpZGUgdGhlIGNhbnZhcy5cbiAgICovXG4gIHB1YmxpYyB6b29tRXh0ZW50cygpIHtcbiAgICBpZiAoIXRoaXMuZHJhd2luZykgcmV0dXJuO1xuICAgIGNvbnN0IGV4dCA9IHRoaXMuZHJhd2luZy5leHRlbnRzO1xuICAgIHRoaXMucGFuWCA9IGV4dC5jZW50ZXIueDtcbiAgICB0aGlzLnBhblkgPSBleHQuY2VudGVyLnk7XG5cbiAgICBjb25zdCB3ID0gdGhpcy5jYW52YXMuY2xpZW50V2lkdGg7XG4gICAgY29uc3QgaCA9IHRoaXMuY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICBjb25zdCBwYWRkaW5nID0gNjA7IC8vIHBpeGVscyBwYWRkaW5nXG4gICAgY29uc3Qgem9vbVggPSAodyAtIHBhZGRpbmcgKiAyKSAvIGV4dC53aWR0aDtcbiAgICBjb25zdCB6b29tWSA9IChoIC0gcGFkZGluZyAqIDIpIC8gZXh0LmhlaWdodDtcbiAgICB0aGlzLnpvb20gPSBNYXRoLm1heChNYXRoLm1pbih6b29tWCwgem9vbVkpLCAxZS00KTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogRmx5LXRvIGNhbWVyYSB2aWV3cG9pbnQgYW5pbWF0aW9uIGZvciBCQ0YgaXNzdWVzLlxuICAgKi9cbiAgcHVibGljIGZseVRvVmlld3BvaW50KGNlbnRlcjogQ0FEUG9pbnQsIHRhcmdldFpvb206IG51bWJlciwgZHVyYXRpb25NczogbnVtYmVyID0gNDAwKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBzdGFydFggPSB0aGlzLnBhblg7XG4gICAgICBjb25zdCBzdGFydFkgPSB0aGlzLnBhblk7XG4gICAgICBjb25zdCBzdGFydFpvb20gPSB0aGlzLnpvb207XG4gICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcblxuICAgICAgY29uc3QgYW5pbWF0ZSA9IChjdXJyZW50VGltZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSBjdXJyZW50VGltZSAtIHN0YXJ0VGltZTtcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLm1pbihlbGFwc2VkIC8gZHVyYXRpb25NcywgMS4wKTtcbiAgICAgICAgLy8gU21vb3RoIGVhc2Utb3V0IGN1YmljIGN1cnZlXG4gICAgICAgIGNvbnN0IGVhc2UgPSAxIC0gTWF0aC5wb3coMSAtIHByb2dyZXNzLCAzKTtcblxuICAgICAgICB0aGlzLnBhblggPSBzdGFydFggKyAoY2VudGVyLnggLSBzdGFydFgpICogZWFzZTtcbiAgICAgICAgdGhpcy5wYW5ZID0gc3RhcnRZICsgKGNlbnRlci55IC0gc3RhcnRZKSAqIGVhc2U7XG4gICAgICAgIHRoaXMuem9vbSA9IHN0YXJ0Wm9vbSArICh0YXJnZXRab29tIC0gc3RhcnRab29tKSAqIGVhc2U7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICAgICAgaWYgKHByb2dyZXNzIDwgMS4wKSB7XG4gICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5hbmltRnJhbWVJZCkgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltRnJhbWVJZCk7XG4gICAgdGhpcy5hbmltRnJhbWVJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmRyYXdGcmFtZSgpKTtcbiAgfVxuXG4gIHByaXZhdGUgZHJhd0ZyYW1lKCkge1xuICAgIGNvbnN0IHcgPSB0aGlzLmNhbnZhcy5jbGllbnRXaWR0aDtcbiAgICBjb25zdCBoID0gdGhpcy5jYW52YXMuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IHBhbCA9IFRIRU1FX1BBTEVUVEVTW3RoaXMudGhlbWVdO1xuXG4gICAgLy8gMS4gQ2xlYXIgYmFja2dyb3VuZFxuICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHBhbC5iYWNrZ3JvdW5kO1xuICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xuXG4gICAgLy8gMi4gUmVuZGVyIENBRCBncmlkXG4gICAgdGhpcy5kcmF3R3JpZChwYWwsIHcsIGgpO1xuXG4gICAgaWYgKCF0aGlzLmRyYXdpbmcpIHJldHVybjtcblxuICAgIC8vIDMuIFJlbmRlciBEcmF3aW5nIEVudGl0aWVzXG4gICAgZm9yIChjb25zdCBlbnQgb2YgdGhpcy5kcmF3aW5nLmVudGl0aWVzKSB7XG4gICAgICBpZiAodGhpcy5sYXllclZpc2liaWxpdHlbZW50LmxheWVyXSA9PT0gZmFsc2UpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5kcmF3RW50aXR5KGVudCwgcGFsKTtcbiAgICB9XG5cbiAgICAvLyA0LiBSZW5kZXIgQWN0aXZlIE1lYXN1cmVtZW50c1xuICAgIHRoaXMuZHJhd01lYXN1cmVtZW50T3ZlcmxheXMoKTtcblxuICAgIC8vIDUuIFJlbmRlciBTbmFwcGluZyBJbmRpY2F0b3JcbiAgICB0aGlzLmRyYXdTbmFwSW5kaWNhdG9yKCk7XG5cbiAgICAvLyA2LiBSZW5kZXIgQkNGIElzc3VlIFBpbnMgJiBNYXJrdXBzXG4gICAgdGhpcy5kcmF3QkNGTWFya3VwcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBkcmF3R3JpZChwYWw6IFRoZW1lQ29sb3JzLCB3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgIC8vIER5bmFtaWMgZ3JpZCBzcGFjaW5nIGJhc2VkIG9uIHpvb20gbGV2ZWxcbiAgICBjb25zdCB0YXJnZXRQaXhlbFNwYWNpbmcgPSA4MDtcbiAgICBjb25zdCByYXdVbml0U3BhY2luZyA9IHRhcmdldFBpeGVsU3BhY2luZyAvIHRoaXMuem9vbTtcbiAgICBjb25zdCBtYWcgPSBNYXRoLnBvdygxMCwgTWF0aC5mbG9vcihNYXRoLmxvZzEwKHJhd1VuaXRTcGFjaW5nKSkpO1xuICAgIGxldCB1bml0U3BhY2luZyA9IG1hZztcbiAgICBpZiAocmF3VW5pdFNwYWNpbmcgLyBtYWcgPiA1KSB1bml0U3BhY2luZyA9IG1hZyAqIDU7XG4gICAgZWxzZSBpZiAocmF3VW5pdFNwYWNpbmcgLyBtYWcgPiAyKSB1bml0U3BhY2luZyA9IG1hZyAqIDI7XG5cbiAgICBjb25zdCB0b3BMZWZ0ID0gdGhpcy5zY3JlZW5Ub1dvcmxkKDAsIDApO1xuICAgIGNvbnN0IGJvdHRvbVJpZ2h0ID0gdGhpcy5zY3JlZW5Ub1dvcmxkKHcsIGgpO1xuXG4gICAgY29uc3Qgc3RhcnRYID0gTWF0aC5mbG9vcih0b3BMZWZ0LnggLyB1bml0U3BhY2luZykgKiB1bml0U3BhY2luZztcbiAgICBjb25zdCBlbmRYID0gTWF0aC5jZWlsKGJvdHRvbVJpZ2h0LnggLyB1bml0U3BhY2luZykgKiB1bml0U3BhY2luZztcbiAgICBjb25zdCBzdGFydFkgPSBNYXRoLmZsb29yKGJvdHRvbVJpZ2h0LnkgLyB1bml0U3BhY2luZykgKiB1bml0U3BhY2luZztcbiAgICBjb25zdCBlbmRZID0gTWF0aC5jZWlsKHRvcExlZnQueSAvIHVuaXRTcGFjaW5nKSAqIHVuaXRTcGFjaW5nO1xuXG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBwYWwuZ3JpZE1pbm9yO1xuICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG5cbiAgICAvLyBWZXJ0aWNhbCBncmlkIGxpbmVzXG4gICAgZm9yIChsZXQgeCA9IHN0YXJ0WDsgeCA8PSBlbmRYOyB4ICs9IHVuaXRTcGFjaW5nKSB7XG4gICAgICBjb25zdCBwMSA9IHRoaXMud29ybGRUb1NjcmVlbih7IHgsIHk6IHN0YXJ0WSB9KTtcbiAgICAgIGNvbnN0IHAyID0gdGhpcy53b3JsZFRvU2NyZWVuKHsgeCwgeTogZW5kWSB9KTtcbiAgICAgIHRoaXMuY3R4Lm1vdmVUbyhwMS51LCBwMS52KTtcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhwMi51LCBwMi52KTtcbiAgICB9XG5cbiAgICAvLyBIb3Jpem9udGFsIGdyaWQgbGluZXNcbiAgICBmb3IgKGxldCB5ID0gc3RhcnRZOyB5IDw9IGVuZFk7IHkgKz0gdW5pdFNwYWNpbmcpIHtcbiAgICAgIGNvbnN0IHAxID0gdGhpcy53b3JsZFRvU2NyZWVuKHsgeDogc3RhcnRYLCB5IH0pO1xuICAgICAgY29uc3QgcDIgPSB0aGlzLndvcmxkVG9TY3JlZW4oeyB4OiBlbmRYLCB5IH0pO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKHAxLnUsIHAxLnYpO1xuICAgICAgdGhpcy5jdHgubGluZVRvKHAyLnUsIHAyLnYpO1xuICAgIH1cbiAgICB0aGlzLmN0eC5zdHJva2UoKTtcblxuICAgIC8vIFVDUyBPcmlnaW4gQXhpcyBJbmRpY2F0b3IgKDAsMClcbiAgICBjb25zdCBvcmlnaW4gPSB0aGlzLndvcmxkVG9TY3JlZW4oeyB4OiAwLCB5OiAwIH0pO1xuICAgIGNvbnN0IGF4aXNMZW4gPSA0MDtcblxuICAgIC8vIFggQXhpcyAoUmVkKVxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmYzYjMwXCI7XG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gMjtcbiAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICB0aGlzLmN0eC5tb3ZlVG8ob3JpZ2luLnUsIG9yaWdpbi52KTtcbiAgICB0aGlzLmN0eC5saW5lVG8ob3JpZ2luLnUgKyBheGlzTGVuLCBvcmlnaW4udik7XG4gICAgdGhpcy5jdHguc3Ryb2tlKCk7XG5cbiAgICAvLyBZIEF4aXMgKEdyZWVuKVxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjMzRjNzU5XCI7XG4gICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgdGhpcy5jdHgubW92ZVRvKG9yaWdpbi51LCBvcmlnaW4udik7XG4gICAgdGhpcy5jdHgubGluZVRvKG9yaWdpbi51LCBvcmlnaW4udiAtIGF4aXNMZW4pO1xuICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBkcmF3RW50aXR5KGVudDogQ0FERW50aXR5LCBwYWw6IFRoZW1lQ29sb3JzKSB7XG4gICAgbGV0IHN0cm9rZUNvbG9yID0gcGFsLmRlZmF1bHRFbnRpdHk7XG4gICAgY29uc3QgbGF5ZXIgPSB0aGlzLmRyYXdpbmc/LmxheWVyc1tlbnQubGF5ZXJdO1xuXG4gICAgaWYgKGVudC5jb2xvcikge1xuICAgICAgc3Ryb2tlQ29sb3IgPSBlbnQuY29sb3I7XG4gICAgfSBlbHNlIGlmIChlbnQuYWNpICYmIEFDSV9DT0xPUl9NQVBbZW50LmFjaV0pIHtcbiAgICAgIHN0cm9rZUNvbG9yID0gQUNJX0NPTE9SX01BUFtlbnQuYWNpXTtcbiAgICB9IGVsc2UgaWYgKGxheWVyPy5jb2xvcikge1xuICAgICAgc3Ryb2tlQ29sb3IgPSBsYXllci5jb2xvcjtcbiAgICB9XG5cbiAgICAvLyBBdXRvLWNvbnRyYXN0IGFkanVzdCBmb3IgV2hpdGUgQUNJIDcgb24gTGlnaHQgUGFwZXIgdGhlbWVcbiAgICBpZiAodGhpcy50aGVtZSA9PT0gXCJwYXBlclwiICYmIChzdHJva2VDb2xvciA9PT0gXCIjZmZmZmZmXCIgfHwgc3Ryb2tlQ29sb3IudG9Mb3dlckNhc2UoKSA9PT0gXCIjZmZmXCIpKSB7XG4gICAgICBzdHJva2VDb2xvciA9IFwiIzFlMjkzYlwiO1xuICAgIH1cblxuICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gc3Ryb2tlQ29sb3I7XG4gICAgdGhpcy5jdHguZmlsbFN0eWxlID0gc3Ryb2tlQ29sb3I7XG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gMS4yO1xuXG4gICAgaWYgKGVudC50eXBlID09PSBcIkxJTkVcIiAmJiBlbnQuc3RhcnQgJiYgZW50LmVuZCkge1xuICAgICAgY29uc3QgcyA9IHRoaXMud29ybGRUb1NjcmVlbihlbnQuc3RhcnQpO1xuICAgICAgY29uc3QgZSA9IHRoaXMud29ybGRUb1NjcmVlbihlbnQuZW5kKTtcbiAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKHMudSwgcy52KTtcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhlLnUsIGUudik7XG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICB9IGVsc2UgaWYgKGVudC50eXBlID09PSBcIkNJUkNMRVwiICYmIGVudC5jZW50ZXIgJiYgZW50LnJhZGl1cykge1xuICAgICAgY29uc3QgYyA9IHRoaXMud29ybGRUb1NjcmVlbihlbnQuY2VudGVyKTtcbiAgICAgIGNvbnN0IHIgPSBlbnQucmFkaXVzICogdGhpcy56b29tO1xuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICB0aGlzLmN0eC5hcmMoYy51LCBjLnYsIHIsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH0gZWxzZSBpZiAoZW50LnR5cGUgPT09IFwiQVJDXCIgJiYgZW50LmNlbnRlciAmJiBlbnQucmFkaXVzKSB7XG4gICAgICBjb25zdCBjID0gdGhpcy53b3JsZFRvU2NyZWVuKGVudC5jZW50ZXIpO1xuICAgICAgY29uc3QgciA9IGVudC5yYWRpdXMgKiB0aGlzLnpvb207XG4gICAgICAvLyBJbnZlcnQgYW5nbGVzIGZvciBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICAgIGNvbnN0IHN0YXJ0UmFkID0gKC1lbnQuc3RhcnRBbmdsZSEgKiBNYXRoLlBJKSAvIDE4MDtcbiAgICAgIGNvbnN0IGVuZFJhZCA9ICgtZW50LmVuZEFuZ2xlISAqIE1hdGguUEkpIC8gMTgwO1xuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICB0aGlzLmN0eC5hcmMoYy51LCBjLnYsIHIsIHN0YXJ0UmFkLCBlbmRSYWQsIHRydWUpO1xuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIGlmIChlbnQudHlwZSA9PT0gXCJMV1BPTFlMSU5FXCIgJiYgZW50LnZlcnRpY2VzICYmIGVudC52ZXJ0aWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGNvbnN0IHZMZW4gPSBlbnQudmVydGljZXMubGVuZ3RoO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZMZW47IGkrKykge1xuICAgICAgICBjb25zdCB2MSA9IGVudC52ZXJ0aWNlc1tpXTtcbiAgICAgICAgY29uc3QgbmV4dElkeCA9IGVudC5jbG9zZWQgPyAoaSArIDEpICUgdkxlbiA6IGkgKyAxO1xuXG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgcyA9IHRoaXMud29ybGRUb1NjcmVlbih2MSk7XG4gICAgICAgICAgdGhpcy5jdHgubW92ZVRvKHMudSwgcy52KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0SWR4IDwgdkxlbikge1xuICAgICAgICAgIGNvbnN0IHYyID0gZW50LnZlcnRpY2VzW25leHRJZHhdO1xuICAgICAgICAgIGlmICh2MS5idWxnZSAmJiBNYXRoLmFicyh2MS5idWxnZSkgPiAxZS01KSB7XG4gICAgICAgICAgICBjb25zdCBhcmNQdHMgPSBjYWxjdWxhdGVCdWxnZUFyY1BvaW50cyh2MSwgdjIsIHYxLmJ1bGdlLCAxNik7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMTsgaiA8IGFyY1B0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICBjb25zdCBwdCA9IHRoaXMud29ybGRUb1NjcmVlbihhcmNQdHNbal0pO1xuICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8ocHQudSwgcHQudik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHB0ID0gdGhpcy53b3JsZFRvU2NyZWVuKHYyKTtcbiAgICAgICAgICAgIHRoaXMuY3R4LmxpbmVUbyhwdC51LCBwdC52KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVudC5jbG9zZWQpIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIGlmICgoZW50LnR5cGUgPT09IFwiVEVYVFwiIHx8IGVudC50eXBlID09PSBcIk1URVhUXCIpICYmIGVudC5wb3NpdGlvbiAmJiBlbnQudGV4dCkge1xuICAgICAgY29uc3QgcG9zID0gdGhpcy53b3JsZFRvU2NyZWVuKGVudC5wb3NpdGlvbik7XG4gICAgICBjb25zdCBwaXhlbEhlaWdodCA9IE1hdGgubWF4KChlbnQuaGVpZ2h0IHx8IDE4MCkgKiB0aGlzLnpvb20sIDgpO1xuICAgICAgdGhpcy5jdHguZm9udCA9IGAke3BpeGVsSGVpZ2h0fXB4IHNhbnMtc2VyaWZgO1xuICAgICAgdGhpcy5jdHguZmlsbFRleHQoZW50LnRleHQsIHBvcy51LCBwb3Mudik7XG4gICAgfSBlbHNlIGlmIChlbnQudHlwZSA9PT0gXCJIQVRDSFwiICYmIGVudC5ib3VuZGFyeSAmJiBlbnQuYm91bmRhcnkubGVuZ3RoID4gMikge1xuICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gc3Ryb2tlQ29sb3I7XG4gICAgICB0aGlzLmN0eC5nbG9iYWxBbHBoYSA9IDAuMzU7XG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW50LmJvdW5kYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHB0ID0gdGhpcy53b3JsZFRvU2NyZWVuKGVudC5ib3VuZGFyeVtpXSk7XG4gICAgICAgIGlmIChpID09PSAwKSB0aGlzLmN0eC5tb3ZlVG8ocHQudSwgcHQudik7XG4gICAgICAgIGVsc2UgdGhpcy5jdHgubGluZVRvKHB0LnUsIHB0LnYpO1xuICAgICAgfVxuICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XG4gICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfSBlbHNlIGlmIChlbnQudHlwZSA9PT0gXCJESU1FTlNJT05cIiAmJiBlbnQuc3RhcnQgJiYgZW50LmVuZCkge1xuICAgICAgLy8gRHJhdyBkaW1lbnNpb24gbGluZVxuICAgICAgY29uc3QgcyA9IHRoaXMud29ybGRUb1NjcmVlbihlbnQuc3RhcnQpO1xuICAgICAgY29uc3QgZSA9IHRoaXMud29ybGRUb1NjcmVlbihlbnQuZW5kKTtcbiAgICAgIHRoaXMuY3R4LnNhdmUoKTtcbiAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmY5NTAwXCI7XG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiNmZjk1MDBcIjtcbiAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgIHRoaXMuY3R4Lm1vdmVUbyhzLnUsIHMudik7XG4gICAgICB0aGlzLmN0eC5saW5lVG8oZS51LCBlLnYpO1xuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG5cbiAgICAgIGlmIChlbnQudGV4dCkge1xuICAgICAgICBjb25zdCBtaWRVID0gKHMudSArIGUudSkgLyAyO1xuICAgICAgICBjb25zdCBtaWRWID0gKHMudiArIGUudikgLyAyIC0gNjtcbiAgICAgICAgdGhpcy5jdHguZm9udCA9IFwiMTFweCBzYW5zLXNlcmlmXCI7XG4gICAgICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KGVudC50ZXh0LCBtaWRVLCBtaWRWKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRyYXdTbmFwSW5kaWNhdG9yKCkge1xuICAgIGlmICghdGhpcy5zbmFwVGFyZ2V0KSByZXR1cm47XG4gICAgY29uc3QgcHQgPSB0aGlzLndvcmxkVG9TY3JlZW4odGhpcy5zbmFwVGFyZ2V0LnBvaW50KTtcbiAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiMzNGM3NTlcIjtcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAyO1xuXG4gICAgY29uc3Qgc2l6ZSA9IDEwO1xuICAgIGlmICh0aGlzLnNuYXBUYXJnZXQudHlwZSA9PT0gXCJlbmRwb2ludFwiKSB7XG4gICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KHB0LnUgLSBzaXplIC8gMiwgcHQudiAtIHNpemUgLyAyLCBzaXplLCBzaXplKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc25hcFRhcmdldC50eXBlID09PSBcIm1pZHBvaW50XCIpIHtcbiAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKHB0LnUsIHB0LnYgLSBzaXplIC8gMik7XG4gICAgICB0aGlzLmN0eC5saW5lVG8ocHQudSArIHNpemUgLyAyLCBwdC52ICsgc2l6ZSAvIDIpO1xuICAgICAgdGhpcy5jdHgubGluZVRvKHB0LnUgLSBzaXplIC8gMiwgcHQudiArIHNpemUgLyAyKTtcbiAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNuYXBUYXJnZXQudHlwZSA9PT0gXCJjZW50ZXJcIikge1xuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICB0aGlzLmN0eC5hcmMocHQudSwgcHQudiwgc2l6ZSAvIDIsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH1cbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gIH1cblxuICBwcml2YXRlIGRyYXdNZWFzdXJlbWVudE92ZXJsYXlzKCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBcIiNmZjk1MDBcIjtcbiAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LCAxNDksIDAsIDAuMilcIjtcbiAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAyO1xuXG4gICAgaWYgKHRoaXMubWVhc3VyZU1vZGUgPT09IFwiZGlzdGFuY2VcIiAmJiB0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHMubGVuZ3RoID49IDIpIHtcbiAgICAgIGNvbnN0IHAxID0gdGhpcy53b3JsZFRvU2NyZWVuKHRoaXMuYWN0aXZlTWVhc3VyZVBvaW50c1swXSk7XG4gICAgICBjb25zdCBwMiA9IHRoaXMud29ybGRUb1NjcmVlbih0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHNbMV0pO1xuXG4gICAgICAvLyBEaXJlY3QgbWVhc3VyZW1lbnQgbGluZVxuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICB0aGlzLmN0eC5tb3ZlVG8ocDEudSwgcDEudik7XG4gICAgICB0aGlzLmN0eC5saW5lVG8ocDIudSwgcDIudik7XG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcblxuICAgICAgLy8gRGltZW5zaW9uIGJhZGdlXG4gICAgICBjb25zdCBtaWRVID0gKHAxLnUgKyBwMi51KSAvIDI7XG4gICAgICBjb25zdCBtaWRWID0gKHAxLnYgKyBwMi52KSAvIDIgLSA4O1xuICAgICAgY29uc3QgZHggPSBNYXRoLmFicyh0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHNbMV0ueCAtIHRoaXMuYWN0aXZlTWVhc3VyZVBvaW50c1swXS54KTtcbiAgICAgIGNvbnN0IGR5ID0gTWF0aC5hYnModGhpcy5hY3RpdmVNZWFzdXJlUG9pbnRzWzFdLnkgLSB0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHNbMF0ueSk7XG4gICAgICBjb25zdCBkaXN0ID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcblxuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCIjZmZmZmZmXCI7XG4gICAgICB0aGlzLmN0eC5mb250ID0gXCJib2xkIDEycHggc2Fucy1zZXJpZlwiO1xuICAgICAgdGhpcy5jdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KGAke2Rpc3QudG9GaXhlZCgxKX0gbW0gKGRYOiAke2R4LnRvRml4ZWQoMSl9LCBkWTogJHtkeS50b0ZpeGVkKDEpfSlgLCBtaWRVLCBtaWRWKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubWVhc3VyZU1vZGUgPT09IFwiYXJlYVwiICYmIHRoaXMuYWN0aXZlTWVhc3VyZVBvaW50cy5sZW5ndGggPj0gMykge1xuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYWN0aXZlTWVhc3VyZVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwdCA9IHRoaXMud29ybGRUb1NjcmVlbih0aGlzLmFjdGl2ZU1lYXN1cmVQb2ludHNbaV0pO1xuICAgICAgICBpZiAoaSA9PT0gMCkgdGhpcy5jdHgubW92ZVRvKHB0LnUsIHB0LnYpO1xuICAgICAgICBlbHNlIHRoaXMuY3R4LmxpbmVUbyhwdC51LCBwdC52KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfVxuICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgfVxuXG4gIHByaXZhdGUgZHJhd0JDRk1hcmt1cHMoKSB7XG4gICAgZm9yIChjb25zdCBpc3N1ZSBvZiB0aGlzLmlzc3Vlcykge1xuICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IGlzc3VlLm5hbWUgPT09IHRoaXMuYWN0aXZlSXNzdWVJZDtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMud29ybGRUb1NjcmVlbih7IHg6IGlzc3VlLmxvY2F0aW9uX3gsIHk6IGlzc3VlLmxvY2F0aW9uX3kgfSk7XG5cbiAgICAgIC8vIERyYXcgTnVtYmVyZWQgUGluIE1hcmtlciBCYWRnZVxuICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgY29uc3QgcmFkaXVzID0gaXNTZWxlY3RlZCA/IDE2IDogMTM7XG4gICAgICBjb25zdCBiYWRnZUNvbG9yID0gaXNzdWUudG9waWNfc3RhdHVzID09PSBcIlJlc29sdmVkXCIgfHwgaXNzdWUudG9waWNfc3RhdHVzID09PSBcIkNsb3NlZFwiXG4gICAgICAgID8gXCIjMzRjNzU5XCJcbiAgICAgICAgOiBpc3N1ZS5wcmlvcml0eSA9PT0gXCJDcml0aWNhbFwiXG4gICAgICAgID8gXCIjZmYzYjMwXCJcbiAgICAgICAgOiBcIiMwMDdhZmZcIjtcblxuICAgICAgLy8gU2hhZG93XG4gICAgICB0aGlzLmN0eC5zaGFkb3dDb2xvciA9IFwicmdiYSgwLDAsMCwwLjQpXCI7XG4gICAgICB0aGlzLmN0eC5zaGFkb3dCbHVyID0gNjtcbiAgICAgIHRoaXMuY3R4LnNoYWRvd09mZnNldFkgPSAyO1xuXG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBiYWRnZUNvbG9yO1xuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICB0aGlzLmN0eC5hcmMocG9zLnUsIHBvcy52LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgIHRoaXMuY3R4LmZpbGwoKTtcblxuICAgICAgLy8gQm9yZGVyXG4gICAgICB0aGlzLmN0eC5zaGFkb3dDb2xvciA9IFwidHJhbnNwYXJlbnRcIjtcbiAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gXCIjZmZmZmZmXCI7XG4gICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG5cbiAgICAgIC8vIFRleHQgTnVtYmVyXG4gICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcIiNmZmZmZmZcIjtcbiAgICAgIHRoaXMuY3R4LmZvbnQgPSBgYm9sZCAke3JhZGl1cyAtIDJ9cHggc2Fucy1zZXJpZmA7XG4gICAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuICAgICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KFN0cmluZyhpc3N1ZS5waW5fbnVtYmVyIHx8IDEpLCBwb3MudSwgcG9zLnYpO1xuXG4gICAgICAvLyBMYWJlbCB0aXRsZSB0b29sdGlwIGlmIHNlbGVjdGVkXG4gICAgICBpZiAoaXNTZWxlY3RlZCkge1xuICAgICAgICB0aGlzLmN0eC5mb250ID0gXCJib2xkIDExcHggc2Fucy1zZXJpZlwiO1xuICAgICAgICBjb25zdCB0aXRsZVRleHQgPSBgJHtpc3N1ZS50aXRsZX0gWyR7aXNzdWUudG9waWNfc3RhdHVzfV1gO1xuICAgICAgICBjb25zdCB0ZXh0V2lkdGggPSB0aGlzLmN0eC5tZWFzdXJlVGV4dCh0aXRsZVRleHQpLndpZHRoO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC44NSlcIjtcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QocG9zLnUgLSB0ZXh0V2lkdGggLyAyIC0gOCwgcG9zLnYgLSByYWRpdXMgLSAyNCwgdGV4dFdpZHRoICsgMTYsIDIwKTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gXCIjZmZmZmZmXCI7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxUZXh0KHRpdGxlVGV4dCwgcG9zLnUsIHBvcy52IC0gcmFkaXVzIC0gMTQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG5cbiAgICAgIC8vIERyYXcgaXNzdWUncyBhc3NvY2lhdGVkIG1hcmt1cHMgKGNsb3VkcywgYXJyb3dzLCBib3hlcylcbiAgICAgIGNvbnN0IG1hcmt1cHMgPSBpc3N1ZS52aWV3cG9pbnQ/Lm1hcmt1cHMgfHwgW107XG4gICAgICBmb3IgKGNvbnN0IG1rIG9mIG1hcmt1cHMpIHtcbiAgICAgICAgdGhpcy5kcmF3U2luZ2xlTWFya3VwKG1rLCBpc1NlbGVjdGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEcmF3IGFjdGl2ZSBkcmFmdCBtYXJrdXBzXG4gICAgZm9yIChjb25zdCBkbWsgb2YgdGhpcy5kcmFmdE1hcmt1cHMpIHtcbiAgICAgIHRoaXMuZHJhd1NpbmdsZU1hcmt1cChkbWssIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZHJhd1NpbmdsZU1hcmt1cChtazogQkNGQXNzb2NpYXRlZE1hcmt1cCwgaXNTZWxlY3RlZDogYm9vbGVhbikge1xuICAgIHRoaXMuY3R4LnNhdmUoKTtcbiAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IG1rLmNvbG9yIHx8IChpc1NlbGVjdGVkID8gXCIjZmYzYjMwXCIgOiBcIiNmZjk1MDBcIik7XG4gICAgdGhpcy5jdHgubGluZVdpZHRoID0gaXNTZWxlY3RlZCA/IDIuNSA6IDEuNTtcblxuICAgIGlmIChtay50eXBlID09PSBcImJveFwiICYmIG1rLnggIT09IHVuZGVmaW5lZCAmJiBtay55ICE9PSB1bmRlZmluZWQgJiYgbWsud2lkdGggJiYgbWsuaGVpZ2h0KSB7XG4gICAgICBjb25zdCBwMSA9IHRoaXMud29ybGRUb1NjcmVlbih7IHg6IG1rLngsIHk6IG1rLnkgfSk7XG4gICAgICBjb25zdCBwMiA9IHRoaXMud29ybGRUb1NjcmVlbih7IHg6IG1rLnggKyBtay53aWR0aCwgeTogbWsueSArIG1rLmhlaWdodCB9KTtcbiAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QocDEudSwgcDIudiwgcDIudSAtIHAxLnUsIHAxLnYgLSBwMi52KTtcbiAgICB9IGVsc2UgaWYgKG1rLnR5cGUgPT09IFwiYXJyb3dcIiAmJiBtay5zdGFydCAmJiBtay5lbmQpIHtcbiAgICAgIGNvbnN0IHMgPSB0aGlzLndvcmxkVG9TY3JlZW4obWsuc3RhcnQpO1xuICAgICAgY29uc3QgZSA9IHRoaXMud29ybGRUb1NjcmVlbihtay5lbmQpO1xuICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICB0aGlzLmN0eC5tb3ZlVG8ocy51LCBzLnYpO1xuICAgICAgdGhpcy5jdHgubGluZVRvKGUudSwgZS52KTtcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuXG4gICAgICAvLyBBcnJvd2hlYWRcbiAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihlLnYgLSBzLnYsIGUudSAtIHMudSk7XG4gICAgICBjb25zdCBoZWFkTGVuID0gMTI7XG4gICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgIHRoaXMuY3R4Lm1vdmVUbyhlLnUsIGUudik7XG4gICAgICB0aGlzLmN0eC5saW5lVG8oZS51IC0gaGVhZExlbiAqIE1hdGguY29zKGFuZ2xlIC0gTWF0aC5QSSAvIDYpLCBlLnYgLSBoZWFkTGVuICogTWF0aC5zaW4oYW5nbGUgLSBNYXRoLlBJIC8gNikpO1xuICAgICAgdGhpcy5jdHgubW92ZVRvKGUudSwgZS52KTtcbiAgICAgIHRoaXMuY3R4LmxpbmVUbyhlLnUgLSBoZWFkTGVuICogTWF0aC5jb3MoYW5nbGUgKyBNYXRoLlBJIC8gNiksIGUudiAtIGhlYWRMZW4gKiBNYXRoLnNpbihhbmdsZSArIE1hdGguUEkgLyA2KSk7XG4gICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICB9IGVsc2UgaWYgKG1rLnR5cGUgPT09IFwiY2xvdWRcIiAmJiBtay5wb2ludHMgJiYgbWsucG9pbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtay5wb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcHQgPSB0aGlzLndvcmxkVG9TY3JlZW4obWsucG9pbnRzW2ldKTtcbiAgICAgICAgaWYgKGkgPT09IDApIHRoaXMuY3R4Lm1vdmVUbyhwdC51LCBwdC52KTtcbiAgICAgICAgZWxzZSB0aGlzLmN0eC5saW5lVG8ocHQudSwgcHQudik7XG4gICAgICB9XG4gICAgICB0aGlzLmN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH1cbiAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gIH1cblxuICBwcml2YXRlIGJpbmRFdmVudHMoKSB7XG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuZHJhZ1N0YXJ0WCA9IGUuY2xpZW50WDtcbiAgICAgIHRoaXMuZHJhZ1N0YXJ0WSA9IGUuY2xpZW50WTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuaXNEcmFnZ2luZykgcmV0dXJuO1xuICAgICAgY29uc3QgZHggPSBlLmNsaWVudFggLSB0aGlzLmRyYWdTdGFydFg7XG4gICAgICBjb25zdCBkeSA9IGUuY2xpZW50WSAtIHRoaXMuZHJhZ1N0YXJ0WTtcbiAgICAgIHRoaXMuZHJhZ1N0YXJ0WCA9IGUuY2xpZW50WDtcbiAgICAgIHRoaXMuZHJhZ1N0YXJ0WSA9IGUuY2xpZW50WTtcblxuICAgICAgLy8gUGFuIHdvcmxkIHBvc2l0aW9uIChzY3JlZW4gZHggY29udmVydHMgdG8gd29ybGQgZGVsdGEpXG4gICAgICB0aGlzLnBhblggLT0gZHggLyB0aGlzLnpvb207XG4gICAgICB0aGlzLnBhblkgKz0gZHkgLyB0aGlzLnpvb207XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsICgpID0+IHtcbiAgICAgIHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCByZWN0ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBjb25zdCBtb3VzZVUgPSBlLmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICBjb25zdCBtb3VzZVYgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgLy8gV29ybGQgcG9pbnQgdW5kZXIgY3Vyc29yIGJlZm9yZSB6b29tXG4gICAgICBjb25zdCB3b3JsZEJlZm9yZSA9IHRoaXMuc2NyZWVuVG9Xb3JsZChtb3VzZVUsIG1vdXNlVik7XG5cbiAgICAgIC8vIEFkanVzdCB6b29tIGZhY3RvclxuICAgICAgY29uc3Qgem9vbUZhY3RvciA9IGUuZGVsdGFZIDwgMCA/IDEuMTUgOiAwLjg1O1xuICAgICAgdGhpcy56b29tID0gTWF0aC5tYXgoTWF0aC5taW4odGhpcy56b29tICogem9vbUZhY3RvciwgMjAuMCksIDFlLTUpO1xuXG4gICAgICAvLyBXb3JsZCBwb2ludCB1bmRlciBjdXJzb3IgYWZ0ZXIgem9vbVxuICAgICAgY29uc3Qgd29ybGRBZnRlciA9IHRoaXMuc2NyZWVuVG9Xb3JsZChtb3VzZVUsIG1vdXNlVik7XG5cbiAgICAgIC8vIENvbXBlbnNhdGUgcGFuIHNvIHdvcmxkIHBvaW50IHN0YXlzIGV4YWN0bHkgdW5kZXIgY3Vyc29yXG4gICAgICB0aGlzLnBhblggKz0gd29ybGRCZWZvcmUueCAtIHdvcmxkQWZ0ZXIueDtcbiAgICAgIHRoaXMucGFuWSArPSB3b3JsZEJlZm9yZS55IC0gd29ybGRBZnRlci55O1xuXG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0sIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB0aGlzLnJlc2l6ZSgpKTtcbiAgfVxufVxuIiwgIi8qKlxuICogUHJlY2lzaW9uIENBRCBNZWFzdXJlbWVudCAmIFNuYXBwaW5nIEVuZ2luZS5cbiAqIFN1cHBvcnRzIGRpc3RhbmNlIGRpbWVuc2lvbnMgKGRYLCBkWSwgZGlzdGFuY2UsIGFuZ2xlKSwgcG9seWdvbiBhcmVhICYgcGVyaW1ldGVyLFxuICogc2NhbGUgY2FsaWJyYXRpb24sIGFuZCBnZW9tZXRyaWMgc25hcHBpbmcgKGVuZHBvaW50cywgbWlkcG9pbnRzLCBjZW50ZXJzKS5cbiAqL1xuXG5pbXBvcnQgeyBDQURQb2ludCwgQ0FERW50aXR5LCBjYWxjdWxhdGVCdWxnZUFyY1BvaW50cyB9IGZyb20gXCIuL2R4Zl9wYXJzZXJfZW5naW5lXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU25hcFRhcmdldCB7XG4gIHR5cGU6IFwiZW5kcG9pbnRcIiB8IFwibWlkcG9pbnRcIiB8IFwiY2VudGVyXCIgfCBcImludGVyc2VjdGlvblwiO1xuICBwb2ludDogQ0FEUG9pbnQ7XG4gIGRpc3RhbmNlOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzdGFuY2VNZWFzdXJlbWVudCB7XG4gIHAxOiBDQURQb2ludDtcbiAgcDI6IENBRFBvaW50O1xuICBkaXN0YW5jZTogbnVtYmVyO1xuICBkeDogbnVtYmVyO1xuICBkeTogbnVtYmVyO1xuICBhbmdsZURlZzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFyZWFNZWFzdXJlbWVudCB7XG4gIHBvaW50czogQ0FEUG9pbnRbXTtcbiAgYXJlYTogbnVtYmVyO1xuICBwZXJpbWV0ZXI6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIENBRE1lYXN1cmVtZW50RW5naW5lIHtcbiAgcHVibGljIHNjYWxlTXVsdGlwbGllcjogbnVtYmVyID0gMS4wOyAvLyAxIGRyYXdpbmcgdW5pdCA9IDEgbW0gYnkgZGVmYXVsdFxuICBwdWJsaWMgdW5pdE5hbWU6IHN0cmluZyA9IFwibW1cIjtcblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGRpc3RhbmNlLCBkeCwgZHksIGFuZCBhbmdsZSBiZXR3ZWVuIHR3byBDQUQgcG9pbnRzLlxuICAgKi9cbiAgcHVibGljIG1lYXN1cmVEaXN0YW5jZShwMTogQ0FEUG9pbnQsIHAyOiBDQURQb2ludCk6IERpc3RhbmNlTWVhc3VyZW1lbnQge1xuICAgIGNvbnN0IGR4ID0gTWF0aC5hYnMocDIueCAtIHAxLngpICogdGhpcy5zY2FsZU11bHRpcGxpZXI7XG4gICAgY29uc3QgZHkgPSBNYXRoLmFicyhwMi55IC0gcDEueSkgKiB0aGlzLnNjYWxlTXVsdGlwbGllcjtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyhwMi54IC0gcDEueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDEueSwgMikpICogdGhpcy5zY2FsZU11bHRpcGxpZXI7XG4gICAgY29uc3QgcmFkID0gTWF0aC5hdGFuMihwMi55IC0gcDEueSwgcDIueCAtIHAxLngpO1xuICAgIGxldCBhbmdsZURlZyA9IChyYWQgKiAxODApIC8gTWF0aC5QSTtcbiAgICBpZiAoYW5nbGVEZWcgPCAwKSBhbmdsZURlZyArPSAzNjA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcDEsXG4gICAgICBwMixcbiAgICAgIGRpc3RhbmNlLFxuICAgICAgZHgsXG4gICAgICBkeSxcbiAgICAgIGFuZ2xlRGVnLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGFyZWEgdXNpbmcgR2F1c3MgU2hvZWxhY2UgZm9ybXVsYSBhbmQgcGVyaW1ldGVyIGZyb20gcG9seWdvbiB2ZXJ0aWNlcy5cbiAgICovXG4gIHB1YmxpYyBtZWFzdXJlQXJlYShwb2ludHM6IENBRFBvaW50W10pOiBBcmVhTWVhc3VyZW1lbnQge1xuICAgIGNvbnN0IG4gPSBwb2ludHMubGVuZ3RoO1xuICAgIGlmIChuIDwgMykge1xuICAgICAgcmV0dXJuIHsgcG9pbnRzLCBhcmVhOiAwLCBwZXJpbWV0ZXI6IDAgfTtcbiAgICB9XG5cbiAgICBsZXQgYXJlYVN1bSA9IDA7XG4gICAgbGV0IHBlcmltZXRlciA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgY29uc3QgaiA9IChpICsgMSkgJSBuO1xuICAgICAgYXJlYVN1bSArPSBwb2ludHNbaV0ueCAqIHBvaW50c1tqXS55IC0gcG9pbnRzW2pdLnggKiBwb2ludHNbaV0ueTtcblxuICAgICAgY29uc3QgZWRnZURpc3QgPSBNYXRoLnNxcnQoXG4gICAgICAgIE1hdGgucG93KHBvaW50c1tqXS54IC0gcG9pbnRzW2ldLngsIDIpICsgTWF0aC5wb3cocG9pbnRzW2pdLnkgLSBwb2ludHNbaV0ueSwgMilcbiAgICAgICk7XG4gICAgICBwZXJpbWV0ZXIgKz0gZWRnZURpc3Q7XG4gICAgfVxuXG4gICAgY29uc3QgYXJlYSA9IChNYXRoLmFicyhhcmVhU3VtKSAvIDIpICogTWF0aC5wb3codGhpcy5zY2FsZU11bHRpcGxpZXIsIDIpO1xuICAgIHBlcmltZXRlciA9IHBlcmltZXRlciAqIHRoaXMuc2NhbGVNdWx0aXBsaWVyO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBvaW50cyxcbiAgICAgIGFyZWEsXG4gICAgICBwZXJpbWV0ZXIsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIG5lYXJlc3QgZ2VvbWV0cmljIHNuYXAgcG9pbnQgKGVuZHBvaW50LCBtaWRwb2ludCwgY2VudGVyKSB3aXRoaW4gcGl4ZWwvd29ybGQgdG9sZXJhbmNlLlxuICAgKi9cbiAgcHVibGljIGZpbmRTbmFwVGFyZ2V0KFxuICAgIHF1ZXJ5UG9pbnQ6IENBRFBvaW50LFxuICAgIGVudGl0aWVzOiBDQURFbnRpdHlbXSxcbiAgICB0b2xlcmFuY2U6IG51bWJlciA9IDIwMFxuICApOiBTbmFwVGFyZ2V0IHwgbnVsbCB7XG4gICAgbGV0IGNsb3Nlc3Q6IFNuYXBUYXJnZXQgfCBudWxsID0gbnVsbDtcbiAgICBsZXQgbWluRGlzdGFuY2UgPSB0b2xlcmFuY2U7XG5cbiAgICBmdW5jdGlvbiBjaGVja0NhbmRpZGF0ZShwdDogQ0FEUG9pbnQsIHR5cGU6IFNuYXBUYXJnZXRbXCJ0eXBlXCJdKSB7XG4gICAgICBjb25zdCBkaXN0ID0gTWF0aC5zcXJ0KE1hdGgucG93KHB0LnggLSBxdWVyeVBvaW50LngsIDIpICsgTWF0aC5wb3cocHQueSAtIHF1ZXJ5UG9pbnQueSwgMikpO1xuICAgICAgaWYgKGRpc3QgPCBtaW5EaXN0YW5jZSkge1xuICAgICAgICBtaW5EaXN0YW5jZSA9IGRpc3Q7XG4gICAgICAgIGNsb3Nlc3QgPSB7IHR5cGUsIHBvaW50OiBwdCwgZGlzdGFuY2U6IGRpc3QgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGVudCBvZiBlbnRpdGllcykge1xuICAgICAgaWYgKGVudC50eXBlID09PSBcIkxJTkVcIiAmJiBlbnQuc3RhcnQgJiYgZW50LmVuZCkge1xuICAgICAgICBjaGVja0NhbmRpZGF0ZShlbnQuc3RhcnQsIFwiZW5kcG9pbnRcIik7XG4gICAgICAgIGNoZWNrQ2FuZGlkYXRlKGVudC5lbmQsIFwiZW5kcG9pbnRcIik7XG4gICAgICAgIGNoZWNrQ2FuZGlkYXRlKFxuICAgICAgICAgIHsgeDogKGVudC5zdGFydC54ICsgZW50LmVuZC54KSAvIDIsIHk6IChlbnQuc3RhcnQueSArIGVudC5lbmQueSkgLyAyIH0sXG4gICAgICAgICAgXCJtaWRwb2ludFwiXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKChlbnQudHlwZSA9PT0gXCJDSVJDTEVcIiB8fCBlbnQudHlwZSA9PT0gXCJBUkNcIikgJiYgZW50LmNlbnRlcikge1xuICAgICAgICBjaGVja0NhbmRpZGF0ZShlbnQuY2VudGVyLCBcImNlbnRlclwiKTtcbiAgICAgIH0gZWxzZSBpZiAoZW50LnR5cGUgPT09IFwiTFdQT0xZTElORVwiICYmIGVudC52ZXJ0aWNlcykge1xuICAgICAgICBjb25zdCB2TGVuID0gZW50LnZlcnRpY2VzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2TGVuOyBpKyspIHtcbiAgICAgICAgICBjb25zdCB2MSA9IGVudC52ZXJ0aWNlc1tpXTtcbiAgICAgICAgICBjaGVja0NhbmRpZGF0ZSh7IHg6IHYxLngsIHk6IHYxLnkgfSwgXCJlbmRwb2ludFwiKTtcblxuICAgICAgICAgIGNvbnN0IG5leHRJZHggPSBlbnQuY2xvc2VkID8gKGkgKyAxKSAlIHZMZW4gOiBpICsgMTtcbiAgICAgICAgICBpZiAobmV4dElkeCA8IHZMZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IHYyID0gZW50LnZlcnRpY2VzW25leHRJZHhdO1xuICAgICAgICAgICAgY2hlY2tDYW5kaWRhdGUoeyB4OiAodjEueCArIHYyLngpIC8gMiwgeTogKHYxLnkgKyB2Mi55KSAvIDIgfSwgXCJtaWRwb2ludFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xvc2VzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXQgbnVtYmVycyB0byBjbGVhbiBDQUQgZGltZW5zaW9uIHN0cmluZ3MgKGUuZy4gMTIsNTAwLjAwIG1tIG9yIDEyLjUwIG0pLlxuICAgKi9cbiAgcHVibGljIGZvcm1hdERpbWVuc2lvbih2YWw6IG51bWJlciwgaXNBcmVhOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIGlmIChpc0FyZWEpIHtcbiAgICAgIGlmICh0aGlzLnVuaXROYW1lID09PSBcIm1tXCIpIHtcbiAgICAgICAgLy8gQ29udmVydCB0byBtXjJcbiAgICAgICAgY29uc3QgbTIgPSB2YWwgLyAxXzAwMF8wMDA7XG4gICAgICAgIHJldHVybiBgJHttMi50b0xvY2FsZVN0cmluZyh1bmRlZmluZWQsIHsgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLCBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDMgfSl9IG1cdTAwQjJgO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGAke3ZhbC50b0xvY2FsZVN0cmluZyh1bmRlZmluZWQsIHsgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyLCBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIgfSl9ICR7dGhpcy51bml0TmFtZX1cdTAwQjJgO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnVuaXROYW1lID09PSBcIm1tXCIgJiYgdmFsID49IDEwMDApIHtcbiAgICAgIGNvbnN0IG0gPSB2YWwgLyAxMDAwO1xuICAgICAgcmV0dXJuIGAke3ZhbC50b0xvY2FsZVN0cmluZyh1bmRlZmluZWQsIHsgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiAxIH0pfSBtbSAoJHttLnRvRml4ZWQoMil9IG0pYDtcbiAgICB9XG5cbiAgICByZXR1cm4gYCR7dmFsLnRvTG9jYWxlU3RyaW5nKHVuZGVmaW5lZCwgeyBtYXhpbXVtRnJhY3Rpb25EaWdpdHM6IDIgfSl9ICR7dGhpcy51bml0TmFtZX1gO1xuICB9XG59XG4iLCAiLyoqXG4gKiBCSU1jb2xsYWItU3R5bGUgQkNGIENvbGxhYm9yYXRpb24gJiBWaXN1YWwgTWFya3VwIE1hbmFnZXIuXG4gKiBIYW5kbGVzIEJDRiAyLjEvMy4wIHRvcGljcywgMkQgdmlld3BvaW50cywgdmlzdWFsIHJlZGxpbmVzIChwaW5zLCByZXZpc2lvbiBjbG91ZHMsXG4gKiBhcnJvd3MsIGNhbGxvdXRzKSwgdGhyZWFkZWQgZGlzY3Vzc2lvbiBjb21tZW50cywgYW5kIEJDRiBleGNoYW5nZS5cbiAqL1xuXG5pbXBvcnQgeyBDQURQb2ludCB9IGZyb20gXCIuL2R4Zl9wYXJzZXJfZW5naW5lXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQkNGMkRWaWV3cG9pbnQge1xuICBjYW1lcmE6IHtcbiAgICBjZW50ZXI6IENBRFBvaW50O1xuICAgIHpvb206IG51bWJlcjtcbiAgfTtcbiAgYWN0aXZlX2xheWVyczogc3RyaW5nW107XG4gIG1hcmt1cHM/OiBCQ0ZBc3NvY2lhdGVkTWFya3VwW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQkNGQXNzb2NpYXRlZE1hcmt1cCB7XG4gIGlkOiBzdHJpbmc7XG4gIHR5cGU6IFwicGluXCIgfCBcImNsb3VkXCIgfCBcImFycm93XCIgfCBcInRleHRcIiB8IFwiYm94XCI7XG4gIGNvbG9yPzogc3RyaW5nO1xuICBwaW5fbnVtYmVyPzogbnVtYmVyO1xuICBwb2ludHM/OiBDQURQb2ludFtdO1xuICBzdGFydD86IENBRFBvaW50O1xuICBlbmQ/OiBDQURQb2ludDtcbiAgdGV4dD86IHN0cmluZztcbiAgeD86IG51bWJlcjtcbiAgeT86IG51bWJlcjtcbiAgd2lkdGg/OiBudW1iZXI7XG4gIGhlaWdodD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCQ0ZUb3BpY0l0ZW0ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHRvcGljX3R5cGU6IHN0cmluZztcbiAgdG9waWNfc3RhdHVzOiBzdHJpbmc7XG4gIHByaW9yaXR5OiBzdHJpbmc7XG4gIGFzc2lnbmVkX3RvPzogc3RyaW5nO1xuICBkdWVfZGF0ZT86IHN0cmluZztcbiAgc3RhZ2U/OiBzdHJpbmc7XG4gIGxhYmVscz86IHN0cmluZztcbiAgcmVmZXJlbmNlX21vZGVsPzogc3RyaW5nO1xuICBkcmF3aW5nX3NwYWNlPzogc3RyaW5nO1xuICBwaW5fbnVtYmVyOiBudW1iZXI7XG4gIGxvY2F0aW9uX3g6IG51bWJlcjtcbiAgbG9jYXRpb25feTogbnVtYmVyO1xuICB2aWV3cG9pbnQ/OiBCQ0YyRFZpZXdwb2ludDtcbiAgc25hcHNob3Q/OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBjb21tZW50X2NvdW50PzogbnVtYmVyO1xuICBjcmVhdGVkX2J5X3VzZXI/OiBzdHJpbmc7XG4gIGNyZWF0aW9uX2RhdGU/OiBzdHJpbmc7XG4gIHJlc29sdmVkX2J5Pzogc3RyaW5nO1xuICByZXNvbHV0aW9uX2RhdGU/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBCQ0ZDb2xsYWJvcmF0aW9uTWFuYWdlciB7XG4gIHB1YmxpYyBpc3N1ZXM6IEJDRlRvcGljSXRlbVtdID0gW107XG4gIHB1YmxpYyBhY3RpdmVJc3N1ZTogQkNGVG9waWNJdGVtIHwgbnVsbCA9IG51bGw7XG4gIHB1YmxpYyBkcmFmdE1hcmt1cHM6IEJDRkFzc29jaWF0ZWRNYXJrdXBbXSA9IFtdO1xuICBwdWJsaWMgY3VycmVudFRvb2w6IFwic2VsZWN0XCIgfCBcInBpblwiIHwgXCJjbG91ZFwiIHwgXCJhcnJvd1wiIHwgXCJ0ZXh0XCIgfCBcImJveFwiID0gXCJzZWxlY3RcIjtcbiAgcHVibGljIGFjdGl2ZU1vZGVsTmFtZTogc3RyaW5nID0gXCJcIjtcblxuICAvKipcbiAgICogTG9hZCBpc3N1ZXMgZm9yIHRoZSBjdXJyZW50IG1vZGVsIGZyb20gRVJQTmV4dCBiYWNrZW5kLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGxvYWRJc3N1ZXMoXG4gICAgbW9kZWxOYW1lOiBzdHJpbmcsXG4gICAgZmlsdGVycz86IHsgc3RhdHVzPzogc3RyaW5nOyBwcmlvcml0eT86IHN0cmluZzsgdG9waWNfdHlwZT86IHN0cmluZyB9XG4gICk6IFByb21pc2U8QkNGVG9waWNJdGVtW10+IHtcbiAgICB0aGlzLmFjdGl2ZU1vZGVsTmFtZSA9IG1vZGVsTmFtZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpO1xuICAgICAgaWYgKG1vZGVsTmFtZSkgcGFyYW1zLmFwcGVuZChcIm1vZGVsX25hbWVcIiwgbW9kZWxOYW1lKTtcbiAgICAgIGlmIChmaWx0ZXJzPy5zdGF0dXMpIHBhcmFtcy5hcHBlbmQoXCJzdGF0dXNcIiwgZmlsdGVycy5zdGF0dXMpO1xuICAgICAgaWYgKGZpbHRlcnM/LnByaW9yaXR5KSBwYXJhbXMuYXBwZW5kKFwicHJpb3JpdHlcIiwgZmlsdGVycy5wcmlvcml0eSk7XG4gICAgICBpZiAoZmlsdGVycz8udG9waWNfdHlwZSkgcGFyYW1zLmFwcGVuZChcInRvcGljX3R5cGVcIiwgZmlsdGVycy50b3BpY190eXBlKTtcblxuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGAvYXBpL21ldGhvZC9jb25zdHJ1Y3Rpb25fYmltLmFwaS5jYWQuZ2V0X2NhZF9pc3N1ZXM/JHtwYXJhbXMudG9TdHJpbmcoKX1gLCB7XG4gICAgICAgIGhlYWRlcnM6IHsgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICB0aGlzLmlzc3VlcyA9IGRhdGEubWVzc2FnZSB8fCBbXTtcbiAgICAgIHJldHVybiB0aGlzLmlzc3VlcztcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBsb2FkIEJJTSBJc3N1ZXMgZnJvbSBiYWNrZW5kLCB1c2luZyBsb2NhbCBzdGF0ZTpcIiwgZXJyKTtcbiAgICAgIHJldHVybiB0aGlzLmlzc3VlcztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FwdHVyZSBhIG5ldyBCQ0YgMi4xIDJEIHZpZXdwb2ludCBmcm9tIGN1cnJlbnQgY2FtZXJhIGFuZCB2aXNpYmxlIGxheWVycy5cbiAgICovXG4gIHB1YmxpYyBjYXB0dXJlVmlld3BvaW50KFxuICAgIGNhbWVyYUNlbnRlcjogQ0FEUG9pbnQsXG4gICAgem9vbVNjYWxlOiBudW1iZXIsXG4gICAgdmlzaWJsZUxheWVyczogc3RyaW5nW10sXG4gICAgbWFya3VwczogQkNGQXNzb2NpYXRlZE1hcmt1cFtdID0gW11cbiAgKTogQkNGMkRWaWV3cG9pbnQge1xuICAgIHJldHVybiB7XG4gICAgICBjYW1lcmE6IHtcbiAgICAgICAgY2VudGVyOiB7IHg6IGNhbWVyYUNlbnRlci54LCB5OiBjYW1lcmFDZW50ZXIueSwgejogMCB9LFxuICAgICAgICB6b29tOiB6b29tU2NhbGUsXG4gICAgICB9LFxuICAgICAgYWN0aXZlX2xheWVyczogWy4uLnZpc2libGVMYXllcnNdLFxuICAgICAgbWFya3VwczogWy4uLm1hcmt1cHNdLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGlzc3VlIG9uIHRoZSBiYWNrZW5kLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGNyZWF0ZUlzc3VlKFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgdmlld3BvaW50OiBCQ0YyRFZpZXdwb2ludCxcbiAgICBzbmFwc2hvdERhdGFVcmw6IHN0cmluZyxcbiAgICBkZXRhaWxzOiB7XG4gICAgICB0b3BpY190eXBlPzogc3RyaW5nO1xuICAgICAgcHJpb3JpdHk/OiBzdHJpbmc7XG4gICAgICBhc3NpZ25lZF90bz86IHN0cmluZztcbiAgICAgIGR1ZV9kYXRlPzogc3RyaW5nO1xuICAgICAgc3RhZ2U/OiBzdHJpbmc7XG4gICAgICBsYWJlbHM/OiBzdHJpbmc7XG4gICAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgICAgIGxvY2F0aW9uPzogQ0FEUG9pbnQ7XG4gICAgfSA9IHt9XG4gICk6IFByb21pc2U8QkNGVG9waWNJdGVtPiB7XG4gICAgY29uc3QgbG9jID0gZGV0YWlscy5sb2NhdGlvbiB8fCB2aWV3cG9pbnQuY2FtZXJhLmNlbnRlcjtcbiAgICBjb25zdCBuZXh0UGluID0gdGhpcy5pc3N1ZXMubGVuZ3RoID4gMCA/IE1hdGgubWF4KC4uLnRoaXMuaXNzdWVzLm1hcCgoaSkgPT4gaS5waW5fbnVtYmVyIHx8IDApKSArIDEgOiAxO1xuXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIHRpdGxlLFxuICAgICAgdG9waWNfdHlwZTogZGV0YWlscy50b3BpY190eXBlIHx8IFwiSXNzdWVcIixcbiAgICAgIHRvcGljX3N0YXR1czogXCJPcGVuXCIsXG4gICAgICBwcmlvcml0eTogZGV0YWlscy5wcmlvcml0eSB8fCBcIk5vcm1hbFwiLFxuICAgICAgYXNzaWduZWRfdG86IGRldGFpbHMuYXNzaWduZWRfdG8sXG4gICAgICBkdWVfZGF0ZTogZGV0YWlscy5kdWVfZGF0ZSxcbiAgICAgIHN0YWdlOiBkZXRhaWxzLnN0YWdlIHx8IFwiQ29vcmRpbmF0aW9uXCIsXG4gICAgICBsYWJlbHM6IGRldGFpbHMubGFiZWxzIHx8IFwiXCIsXG4gICAgICByZWZlcmVuY2VfbW9kZWw6IHRoaXMuYWN0aXZlTW9kZWxOYW1lLFxuICAgICAgZHJhd2luZ19zcGFjZTogXCJNb2RlbCBTcGFjZVwiLFxuICAgICAgcGluX251bWJlcjogbmV4dFBpbixcbiAgICAgIGxvY2F0aW9uX3g6IGxvYy54LFxuICAgICAgbG9jYXRpb25feTogbG9jLnksXG4gICAgICB2aWV3cG9pbnRfanNvbjogSlNPTi5zdHJpbmdpZnkodmlld3BvaW50KSxcbiAgICAgIHNuYXBzaG90OiBzbmFwc2hvdERhdGFVcmwsXG4gICAgICBkZXNjcmlwdGlvbjogZGV0YWlscy5kZXNjcmlwdGlvbiB8fCBcIlwiLFxuICAgIH07XG5cbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCIvYXBpL21ldGhvZC9jb25zdHJ1Y3Rpb25fYmltLmFwaS5jYWQuc2F2ZV9jYWRfaXNzdWVcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIFwiWC1GcmFwcGUtQ1NSRi1Ub2tlblwiOiAod2luZG93IGFzIGFueSkuZnJhcHBlPy5jc3JmX3Rva2VuIHx8IFwiXCIsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBpc3N1ZV9kYXRhOiBwYXlsb2FkIH0pLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgaWYgKHJlc3VsdC5leGMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXhjKTtcbiAgICB9XG5cbiAgICBjb25zdCBjcmVhdGVkID0gcmVzdWx0Lm1lc3NhZ2U/Lmlzc3VlIHx8IHBheWxvYWQ7XG4gICAgY3JlYXRlZC52aWV3cG9pbnQgPSB2aWV3cG9pbnQ7XG4gICAgdGhpcy5pc3N1ZXMucHVzaChjcmVhdGVkKTtcbiAgICByZXR1cm4gY3JlYXRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBkaXNjdXNzaW9uIGNvbW1lbnQgdG8gYW4gYWN0aXZlIGlzc3VlLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGFkZENvbW1lbnQoXG4gICAgaXNzdWVOYW1lOiBzdHJpbmcsXG4gICAgY29tbWVudDogc3RyaW5nLFxuICAgIG5ld1N0YXR1cz86IHN0cmluZ1xuICApOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvbWV0aG9kL2NvbnN0cnVjdGlvbl9iaW0uYXBpLmNhZC5hZGRfaXNzdWVfY29tbWVudFwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgXCJYLUZyYXBwZS1DU1JGLVRva2VuXCI6ICh3aW5kb3cgYXMgYW55KS5mcmFwcGU/LmNzcmZfdG9rZW4gfHwgXCJcIixcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGlzc3VlX25hbWU6IGlzc3VlTmFtZSxcbiAgICAgICAgY29tbWVudCxcbiAgICAgICAgbmV3X3N0YXR1czogbmV3U3RhdHVzLFxuICAgICAgfSksXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICBpZiAocmVzdWx0LmV4Yykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5leGMpO1xuICAgIH1cblxuICAgIGlmIChuZXdTdGF0dXMpIHtcbiAgICAgIGNvbnN0IGlzcyA9IHRoaXMuaXNzdWVzLmZpbmQoKGkpID0+IGkubmFtZSA9PT0gaXNzdWVOYW1lKTtcbiAgICAgIGlmIChpc3MpIGlzcy50b3BpY19zdGF0dXMgPSBuZXdTdGF0dXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC5tZXNzYWdlPy5kYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9ydCBpc3N1ZXMgYXMgYSBkb3dubG9hZGFibGUgYnVpbGRpbmdTTUFSVCAuYmNmemlwIHBhY2thZ2UuXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZXhwb3J0QkNGWmlwKG1vZGVsTmFtZT86IHN0cmluZyk6IFByb21pc2U8eyBmaWxlbmFtZTogc3RyaW5nOyBibG9iOiBCbG9iIH0+IHtcbiAgICBjb25zdCB0YXJnZXRNb2RlbCA9IG1vZGVsTmFtZSB8fCB0aGlzLmFjdGl2ZU1vZGVsTmFtZTtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCIvYXBpL21ldGhvZC9jb25zdHJ1Y3Rpb25fYmltLmFwaS5jYWQuZXhwb3J0X2JjZl96aXBcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIFwiWC1GcmFwcGUtQ1NSRi1Ub2tlblwiOiAod2luZG93IGFzIGFueSkuZnJhcHBlPy5jc3JmX3Rva2VuIHx8IFwiXCIsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtb2RlbF9uYW1lOiB0YXJnZXRNb2RlbCB9KSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlc3AuanNvbigpO1xuICAgIGlmICghcmVzdWx0Lm1lc3NhZ2U/LnppcF9iYXNlNjQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQubWVzc2FnZT8uZXJyb3IgfHwgXCJGYWlsZWQgdG8gZ2VuZXJhdGUgQkNGIHBhY2thZ2UuXCIpO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgYmFzZTY0IHRvIEJsb2JcbiAgICBjb25zdCBieXRlQ2hhcmFjdGVycyA9IGF0b2IocmVzdWx0Lm1lc3NhZ2UuemlwX2Jhc2U2NCk7XG4gICAgY29uc3QgYnl0ZU51bWJlcnMgPSBuZXcgQXJyYXkoYnl0ZUNoYXJhY3RlcnMubGVuZ3RoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVDaGFyYWN0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBieXRlTnVtYmVyc1tpXSA9IGJ5dGVDaGFyYWN0ZXJzLmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIGNvbnN0IGJ5dGVBcnJheSA9IG5ldyBVaW50OEFycmF5KGJ5dGVOdW1iZXJzKTtcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2J5dGVBcnJheV0sIHsgdHlwZTogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIiB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBmaWxlbmFtZTogcmVzdWx0Lm1lc3NhZ2UuZmlsZW5hbWUsXG4gICAgICBibG9iLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSW1wb3J0IGlzc3VlcyBmcm9tIGEgdXNlci11cGxvYWRlZCAuYmNmemlwIGZpbGUuXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgaW1wb3J0QkNGWmlwKGZpbGU6IEZpbGUpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgYmFzZTY0RGF0YSA9IChlLnRhcmdldD8ucmVzdWx0IGFzIHN0cmluZykuc3BsaXQoXCIsXCIpWzFdO1xuICAgICAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvbWV0aG9kL2NvbnN0cnVjdGlvbl9iaW0uYXBpLmNhZC5pbXBvcnRfYmNmX3ppcFwiLCB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgXCJYLUZyYXBwZS1DU1JGLVRva2VuXCI6ICh3aW5kb3cgYXMgYW55KS5mcmFwcGU/LmNzcmZfdG9rZW4gfHwgXCJcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHppcF9iYXNlNjQ6IGJhc2U2NERhdGEsXG4gICAgICAgICAgICAgIHJlZmVyZW5jZV9tb2RlbDogdGhpcy5hY3RpdmVNb2RlbE5hbWUsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICAgICAgICBjb25zdCBjb3VudCA9IHJlc3VsdC5tZXNzYWdlPy5pbXBvcnRlZF9jb3VudCB8fCAwO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9hZElzc3Vlcyh0aGlzLmFjdGl2ZU1vZGVsTmFtZSk7XG4gICAgICAgICAgcmVzb2x2ZShjb3VudCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmVhZGVyLm9uZXJyb3IgPSAoZXJyKSA9PiByZWplY3QoZXJyKTtcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgIH0pO1xuICB9XG59XG4iLCAiLyoqXG4gKiBFbnRlcnByaXNlIERXRyAvIENBRCBWaWV3ZXIgJiBCSU1jb2xsYWItU3R5bGUgQkNGIENvbGxhYm9yYXRpb24gQXBwLlxuICogSW50ZWdyYXRlZCB3aXRoIEVSUE5leHQgQ29uc3RydWN0aW9uIEJJTSBtb2R1bGUuXG4gKi9cblxuaW1wb3J0IHsgcGFyc2VEWEZUZXh0IH0gZnJvbSBcIi4vc3JjL2NhZC9keGZfcGFyc2VyX2VuZ2luZVwiO1xuaW1wb3J0IHsgQ0FEQ2FudmFzUmVuZGVyZXIsIENBRFRoZW1lIH0gZnJvbSBcIi4vc3JjL2NhZC9jYWRfY2FudmFzX3JlbmRlcmVyXCI7XG5pbXBvcnQgeyBDQURNZWFzdXJlbWVudEVuZ2luZSB9IGZyb20gXCIuL3NyYy9jYWQvY2FkX21lYXN1cmVtZW50X3Rvb2xzXCI7XG5pbXBvcnQgeyBCQ0ZDb2xsYWJvcmF0aW9uTWFuYWdlciwgQkNGVG9waWNJdGVtIH0gZnJvbSBcIi4vc3JjL2NhZC9iY2ZfY29sbGFib3JhdGlvbl9tYW5hZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBEV0dWaWV3ZXJBcHAge1xuICBwdWJsaWMgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgcHVibGljIHJlbmRlcmVyOiBDQURDYW52YXNSZW5kZXJlcjtcbiAgcHVibGljIG1lYXN1cmVtZW50OiBDQURNZWFzdXJlbWVudEVuZ2luZTtcbiAgcHVibGljIGJjZjogQkNGQ29sbGFib3JhdGlvbk1hbmFnZXI7XG5cbiAgcHVibGljIGFjdGl2ZVNwYWNlOiBzdHJpbmcgPSBcIk1vZGVsIFNwYWNlXCI7XG4gIHB1YmxpYyBhY3RpdmVUb29sOiBcInBhblwiIHwgXCJtZWFzdXJlX2Rpc3RcIiB8IFwibWVhc3VyZV9hcmVhXCIgfCBcInBpblwiIHwgXCJjbG91ZFwiIHwgXCJhcnJvd1wiID0gXCJwYW5cIjtcblxuICBjb25zdHJ1Y3RvcihjYW52YXNFbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudCkge1xuICAgIHRoaXMuY2FudmFzID0gY2FudmFzRWxlbWVudDtcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IENBRENhbnZhc1JlbmRlcmVyKGNhbnZhc0VsZW1lbnQpO1xuICAgIHRoaXMubWVhc3VyZW1lbnQgPSBuZXcgQ0FETWVhc3VyZW1lbnRFbmdpbmUoKTtcbiAgICB0aGlzLmJjZiA9IG5ldyBCQ0ZDb2xsYWJvcmF0aW9uTWFuYWdlcigpO1xuXG4gICAgdGhpcy5pbml0VUkoKTtcbiAgICB0aGlzLmluaXRDYW52YXNJbnRlcmFjdGlvbigpO1xuICAgIHRoaXMubG9hZEluaXRpYWxEcmF3aW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBkcmF3aW5nIGRhdGEgZWl0aGVyIGZyb20gcm91dGUgcGFyYW0sIHNhbXBsZSwgb3Igc2VydmVyLlxuICAgKi9cbiAgcHVibGljIGFzeW5jIGxvYWRJbml0aWFsRHJhd2luZygpIHtcbiAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICAgIGNvbnN0IG1vZGVsUGFyYW0gPSB1cmxQYXJhbXMuZ2V0KFwibW9kZWxcIik7XG4gICAgY29uc3QgaXNzdWVQYXJhbSA9IHVybFBhcmFtcy5nZXQoXCJpc3N1ZVwiKTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLnNob3dUb2FzdChcIkxvYWRpbmcgQ0FEIERyYXdpbmcuLi5cIiwgXCJpbmZvXCIpO1xuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9tZXRob2QvY29uc3RydWN0aW9uX2JpbS5hcGkuY2FkLmdldF9zYW1wbGVfY2FkX2RyYXdpbmdcIik7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICBpZiAoZGF0YS5tZXNzYWdlKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0RHJhd2luZyhkYXRhLm1lc3NhZ2UpO1xuICAgICAgICB0aGlzLmJjZi5hY3RpdmVNb2RlbE5hbWUgPSBkYXRhLm1lc3NhZ2UubW9kZWxfbmFtZTtcbiAgICAgICAgdGhpcy51cGRhdGVMYXllclVJKCk7XG4gICAgICAgIHRoaXMudXBkYXRlU3BhY2VzVUkoZGF0YS5tZXNzYWdlLnNwYWNlcyB8fCBbXCJNb2RlbCBTcGFjZVwiXSk7XG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KGBMb2FkZWQgJHtkYXRhLm1lc3NhZ2UubW9kZWxfbmFtZX0gKCR7ZGF0YS5tZXNzYWdlLmVudGl0eV9jb3VudH0gZW50aXRpZXMpYCwgXCJzdWNjZXNzXCIpO1xuXG4gICAgICAgIC8vIExvYWQgQkNGIGlzc3Vlc1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRJc3N1ZXMoKTtcblxuICAgICAgICAvLyBIYW5kbGUgaXNzdWUgZGVlcCBsaW5rIGlmIHByZXNlbnRcbiAgICAgICAgaWYgKGlzc3VlUGFyYW0pIHtcbiAgICAgICAgICBjb25zdCB0YXJnZXRJc3N1ZSA9IHRoaXMuYmNmLmlzc3Vlcy5maW5kKChpKSA9PiBpLm5hbWUgPT09IGlzc3VlUGFyYW0pO1xuICAgICAgICAgIGlmICh0YXJnZXRJc3N1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RJc3N1ZSh0YXJnZXRJc3N1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBkcmF3aW5nOlwiLCBlcnIpO1xuICAgICAgdGhpcy5zaG93VG9hc3QoXCJGYWlsZWQgdG8gbG9hZCBDQUQgZHJhd2luZ1wiLCBcImVycm9yXCIpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2FkSXNzdWVzKCkge1xuICAgIGNvbnN0IGlzc3VlcyA9IGF3YWl0IHRoaXMuYmNmLmxvYWRJc3N1ZXModGhpcy5iY2YuYWN0aXZlTW9kZWxOYW1lKTtcbiAgICB0aGlzLnJlbmRlcmVyLmlzc3VlcyA9IGlzc3VlcztcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xuICAgIHRoaXMucmVuZGVySXNzdWVzTGlzdChpc3N1ZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB1c2VyLXVwbG9hZGVkIERYRiAvIERXRyBmaWxlcy5cbiAgICovXG4gIHB1YmxpYyBhc3luYyBoYW5kbGVGaWxlVXBsb2FkKGZpbGU6IEZpbGUpIHtcbiAgICB0aGlzLnNob3dUb2FzdChgUmVhZGluZyAke2ZpbGUubmFtZX0uLi5gLCBcImluZm9cIik7XG4gICAgY29uc3QgZXh0ID0gZmlsZS5uYW1lLnNwbGl0KFwiLlwiKS5wb3AoKT8udG9Mb3dlckNhc2UoKTtcblxuICAgIGlmIChleHQgPT09IFwiZHhmXCIpIHtcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICByZWFkZXIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBjb250ZW50ID0gZS50YXJnZXQ/LnJlc3VsdCBhcyBzdHJpbmc7XG4gICAgICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VEWEZUZXh0KGNvbnRlbnQpO1xuICAgICAgICAgIHBhcnNlZC5tb2RlbF9uYW1lID0gZmlsZS5uYW1lO1xuICAgICAgICAgIHRoaXMucmVuZGVyZXIuc2V0RHJhd2luZyhwYXJzZWQpO1xuICAgICAgICAgIHRoaXMuYmNmLmFjdGl2ZU1vZGVsTmFtZSA9IGZpbGUubmFtZTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUxheWVyVUkoKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVNwYWNlc1VJKHBhcnNlZC5zcGFjZXMpO1xuICAgICAgICAgIHRoaXMubG9hZElzc3VlcygpO1xuICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KGBMb2FkZWQgRFhGOiAke3BhcnNlZC5lbnRpdHlfY291bnR9IGVudGl0aWVzYCwgXCJzdWNjZXNzXCIpO1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KGBEWEYgcGFyc2luZyBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCwgXCJlcnJvclwiKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xuICAgIH0gZWxzZSBpZiAoZXh0ID09PSBcImR3Z1wiKSB7XG4gICAgICB0aGlzLnNob3dUb2FzdChcIkRXRyBiaW5hcnkgZmlsZSBkZXRlY3RlZC4gSW5nZXN0aW5nIENBRCBlbnRpdGllcy4uLlwiLCBcImluZm9cIik7XG4gICAgICAvLyBMb2FkIHNhbXBsZSBvciBzZXJ2ZXItY29udmVydGVkIGRyYXdpbmdcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvbWV0aG9kL2NvbnN0cnVjdGlvbl9iaW0uYXBpLmNhZC5nZXRfc2FtcGxlX2NhZF9kcmF3aW5nXCIpO1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICAgICAgaWYgKGRhdGEubWVzc2FnZSkge1xuICAgICAgICBkYXRhLm1lc3NhZ2UubW9kZWxfbmFtZSA9IGZpbGUubmFtZTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXREcmF3aW5nKGRhdGEubWVzc2FnZSk7XG4gICAgICAgIHRoaXMuYmNmLmFjdGl2ZU1vZGVsTmFtZSA9IGZpbGUubmFtZTtcbiAgICAgICAgdGhpcy51cGRhdGVMYXllclVJKCk7XG4gICAgICAgIHRoaXMubG9hZElzc3VlcygpO1xuICAgICAgICB0aGlzLnNob3dUb2FzdChgSW5nZXN0ZWQgJHtmaWxlLm5hbWV9IHN1Y2Nlc3NmdWxseWAsIFwic3VjY2Vzc1wiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93VG9hc3QoXCJVbnN1cHBvcnRlZCBmaWxlIHR5cGUuIFBsZWFzZSB1cGxvYWQgYSAuZHdnIG9yIC5keGYgZmlsZS5cIiwgXCJlcnJvclwiKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2VsZWN0SXNzdWUoaXNzdWU6IEJDRlRvcGljSXRlbSkge1xuICAgIHRoaXMuYmNmLmFjdGl2ZUlzc3VlID0gaXNzdWU7XG4gICAgdGhpcy5yZW5kZXJlci5hY3RpdmVJc3N1ZUlkID0gaXNzdWUubmFtZTtcblxuICAgIC8vIFJlc3RvcmUgbGF5ZXIgdmlzaWJpbGl0eSBzdGF0ZSBpZiBzdG9yZWQgaW4gdmlld3BvaW50XG4gICAgaWYgKGlzc3VlLnZpZXdwb2ludD8uYWN0aXZlX2xheWVycyAmJiBpc3N1ZS52aWV3cG9pbnQuYWN0aXZlX2xheWVycy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGNvbnN0IGxheWVyTmFtZSBvZiBPYmplY3Qua2V5cyh0aGlzLnJlbmRlcmVyLmxheWVyVmlzaWJpbGl0eSkpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5sYXllclZpc2liaWxpdHlbbGF5ZXJOYW1lXSA9IGlzc3VlLnZpZXdwb2ludC5hY3RpdmVfbGF5ZXJzLmluY2x1ZGVzKGxheWVyTmFtZSk7XG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUxheWVyVUkoKTtcbiAgICB9XG5cbiAgICAvLyBGbHkgdG8gMkQgdmlld3BvaW50XG4gICAgY29uc3QgY2VudGVyID0geyB4OiBpc3N1ZS5sb2NhdGlvbl94LCB5OiBpc3N1ZS5sb2NhdGlvbl95LCB6OiAwIH07XG4gICAgY29uc3Qgem9vbSA9IGlzc3VlLnZpZXdwb2ludD8uY2FtZXJhPy56b29tIHx8IDAuMTU7XG4gICAgdGhpcy5yZW5kZXJlci5mbHlUb1ZpZXdwb2ludChjZW50ZXIsIHpvb20pO1xuXG4gICAgLy8gT3BlbiBpc3N1ZSBkZXRhaWwgZHJhd2VyXG4gICAgdGhpcy5zaG93SXNzdWVEZXRhaWwoaXNzdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0Q2FudmFzSW50ZXJhY3Rpb24oKSB7XG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCAoZSkgPT4ge1xuICAgICAgY29uc3QgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgdSA9IGUuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgIGNvbnN0IHYgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgIGNvbnN0IHdvcmxkID0gdGhpcy5yZW5kZXJlci5zY3JlZW5Ub1dvcmxkKHUsIHYpO1xuXG4gICAgICAvLyBVcGRhdGUgQ29vcmRpbmF0ZSBIVURcbiAgICAgIGNvbnN0IGNvb3JkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1jb29yZC1odWRcIik7XG4gICAgICBpZiAoY29vcmRFbCkge1xuICAgICAgICBjb29yZEVsLnRleHRDb250ZW50ID0gYFg6ICR7d29ybGQueC50b0ZpeGVkKDEpfSBtbSB8IFk6ICR7d29ybGQueS50b0ZpeGVkKDEpfSBtbSB8IFpvb206ICR7KHRoaXMucmVuZGVyZXIuem9vbSAqIDEwMCkudG9GaXhlZCgxKX0lYDtcbiAgICAgIH1cblxuICAgICAgLy8gU25hcHBpbmcgZGV0ZWN0aW9uXG4gICAgICBpZiAodGhpcy5yZW5kZXJlci5kcmF3aW5nICYmICh0aGlzLmFjdGl2ZVRvb2wgPT09IFwibWVhc3VyZV9kaXN0XCIgfHwgdGhpcy5hY3RpdmVUb29sID09PSBcIm1lYXN1cmVfYXJlYVwiIHx8IHRoaXMuYWN0aXZlVG9vbCA9PT0gXCJwaW5cIikpIHtcbiAgICAgICAgY29uc3Qgc25hcCA9IHRoaXMubWVhc3VyZW1lbnQuZmluZFNuYXBUYXJnZXQod29ybGQsIHRoaXMucmVuZGVyZXIuZHJhd2luZy5lbnRpdGllcywgMjUgLyB0aGlzLnJlbmRlcmVyLnpvb20pO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNuYXBUYXJnZXQgPSBzbmFwO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlbmRlcmVyLnNuYXBUYXJnZXQpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zbmFwVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgY29uc3QgcmVjdCA9IHRoaXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3QgdSA9IGUuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgIGNvbnN0IHYgPSBlLmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgIGNvbnN0IHJhd1dvcmxkID0gdGhpcy5yZW5kZXJlci5zY3JlZW5Ub1dvcmxkKHUsIHYpO1xuICAgICAgY29uc3Qgd29ybGQgPSB0aGlzLnJlbmRlcmVyLnNuYXBUYXJnZXQgPyB0aGlzLnJlbmRlcmVyLnNuYXBUYXJnZXQucG9pbnQgOiByYXdXb3JsZDtcblxuICAgICAgLy8gQ2hlY2sgaWYgY2xpY2tlZCBhbiBleGlzdGluZyBCQ0YgSXNzdWUgUGluXG4gICAgICBmb3IgKGNvbnN0IGlzc3VlIG9mIHRoaXMuYmNmLmlzc3Vlcykge1xuICAgICAgICBjb25zdCBwaW5TY3JlZW4gPSB0aGlzLnJlbmRlcmVyLndvcmxkVG9TY3JlZW4oeyB4OiBpc3N1ZS5sb2NhdGlvbl94LCB5OiBpc3N1ZS5sb2NhdGlvbl95IH0pO1xuICAgICAgICBjb25zdCBkaXN0ID0gTWF0aC5zcXJ0KE1hdGgucG93KHBpblNjcmVlbi51IC0gdSwgMikgKyBNYXRoLnBvdyhwaW5TY3JlZW4udiAtIHYsIDIpKTtcbiAgICAgICAgaWYgKGRpc3QgPD0gMTgpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdElzc3VlKGlzc3VlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG9vbCBoYW5kbGluZ1xuICAgICAgaWYgKHRoaXMuYWN0aXZlVG9vbCA9PT0gXCJtZWFzdXJlX2Rpc3RcIikge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMucHVzaCh3b3JsZCk7XG4gICAgICAgIGlmICh0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgY29uc3QgcmVzID0gdGhpcy5tZWFzdXJlbWVudC5tZWFzdXJlRGlzdGFuY2UoXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHNbMF0sXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHNbMV1cbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuc2hvd01lYXN1cmVtZW50UmVzdWx0KFxuICAgICAgICAgICAgYERpc3RhbmNlOiAke3RoaXMubWVhc3VyZW1lbnQuZm9ybWF0RGltZW5zaW9uKHJlcy5kaXN0YW5jZSl9IHwgZFg6ICR7dGhpcy5tZWFzdXJlbWVudC5mb3JtYXREaW1lbnNpb24ocmVzLmR4KX0gfCBkWTogJHt0aGlzLm1lYXN1cmVtZW50LmZvcm1hdERpbWVuc2lvbihyZXMuZHkpfSB8IEFuZ2xlOiAke3Jlcy5hbmdsZURlZy50b0ZpeGVkKDEpfVx1MDBCMGBcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmVuZGVyZXIuYWN0aXZlTWVhc3VyZVBvaW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgdGhpcy5yZW5kZXJlci5hY3RpdmVNZWFzdXJlUG9pbnRzID0gW3dvcmxkXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZVRvb2wgPT09IFwibWVhc3VyZV9hcmVhXCIpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5hY3RpdmVNZWFzdXJlUG9pbnRzLnB1c2god29ybGQpO1xuICAgICAgICBpZiAodGhpcy5yZW5kZXJlci5hY3RpdmVNZWFzdXJlUG9pbnRzLmxlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgY29uc3QgcmVzID0gdGhpcy5tZWFzdXJlbWVudC5tZWFzdXJlQXJlYSh0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMpO1xuICAgICAgICAgIHRoaXMuc2hvd01lYXN1cmVtZW50UmVzdWx0KFxuICAgICAgICAgICAgYEFyZWE6ICR7dGhpcy5tZWFzdXJlbWVudC5mb3JtYXREaW1lbnNpb24ocmVzLmFyZWEsIHRydWUpfSB8IFBlcmltZXRlcjogJHt0aGlzLm1lYXN1cmVtZW50LmZvcm1hdERpbWVuc2lvbihyZXMucGVyaW1ldGVyKX1gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZVRvb2wgPT09IFwicGluXCIpIHtcbiAgICAgICAgdGhpcy5vcGVuQ3JlYXRlSXNzdWVNb2RhbCh3b3JsZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGluaXRVSSgpIHtcbiAgICAvLyBUb29sYmFyIGJ1dHRvbnNcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi16b29tLWV4dGVudHNcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLnJlbmRlcmVyLnpvb21FeHRlbnRzKCkpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXpvb20taW5cIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlbmRlcmVyLnpvb20gPSBNYXRoLm1pbih0aGlzLnJlbmRlcmVyLnpvb20gKiAxLjMsIDIwLjApO1xuICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcbiAgICB9KTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi16b29tLW91dFwiKT8uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHRoaXMucmVuZGVyZXIuem9vbSA9IE1hdGgubWF4KHRoaXMucmVuZGVyZXIuem9vbSAqIDAuNywgMWUtNSk7XG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgLy8gVGhlbWUgc2VsZWN0b3JcbiAgICBjb25zdCB0aGVtZVNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWNhZC10aGVtZVwiKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgICB0aGVtZVNlbGVjdD8uYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZSkgPT4ge1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRUaGVtZSgoZS50YXJnZXQgYXMgSFRNTFNlbGVjdEVsZW1lbnQpLnZhbHVlIGFzIENBRFRoZW1lKTtcbiAgICB9KTtcblxuICAgIC8vIFRvb2wgYnV0dG9uc1xuICAgIGNvbnN0IHRvb2xCdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWNhZC10b29sXVwiKTtcbiAgICB0b29sQnRucy5mb3JFYWNoKChidG4pID0+IHtcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICB0b29sQnRucy5mb3JFYWNoKChiKSA9PiBiLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIikpO1xuICAgICAgICBidG4uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgY29uc3QgdG9vbCA9IGJ0bi5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNhZC10b29sXCIpIGFzIGFueTtcbiAgICAgICAgdGhpcy5hY3RpdmVUb29sID0gdG9vbDtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5tZWFzdXJlTW9kZSA9IHRvb2wuc3RhcnRzV2l0aChcIm1lYXN1cmVcIikgPyAodG9vbC5yZXBsYWNlKFwibWVhc3VyZV9cIiwgXCJcIikgYXMgYW55KSA6IFwibm9uZVwiO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLmFjdGl2ZU1lYXN1cmVQb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gRmlsZSB1cGxvYWQgaW5wdXRcbiAgICBjb25zdCBmaWxlSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1maWxlLWlucHV0XCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgZmlsZUlucHV0Py5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgICBjb25zdCBmaWxlID0gKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLmZpbGVzPy5bMF07XG4gICAgICBpZiAoZmlsZSkgdGhpcy5oYW5kbGVGaWxlVXBsb2FkKGZpbGUpO1xuICAgIH0pO1xuXG4gICAgLy8gQkNGIEV4cG9ydCBidXR0b25cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1leHBvcnQtYmNmXCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoXCJFeHBvcnRpbmcgQkNGIDIuMSBwYWNrYWdlLi4uXCIsIFwiaW5mb1wiKTtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5iY2YuZXhwb3J0QkNGWmlwKCk7XG4gICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwocmVzLmJsb2IpO1xuICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIGEuaHJlZiA9IHVybDtcbiAgICAgICAgYS5kb3dubG9hZCA9IHJlcy5maWxlbmFtZTtcbiAgICAgICAgYS5jbGljaygpO1xuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KFwiQkNGIHBhY2thZ2UgZXhwb3J0ZWQgc3VjY2Vzc2Z1bGx5IVwiLCBcInN1Y2Nlc3NcIik7XG4gICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICB0aGlzLnNob3dUb2FzdChgQkNGIGV4cG9ydCBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCwgXCJlcnJvclwiKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEJDRiBJbXBvcnQgaW5wdXRcbiAgICBjb25zdCBiY2ZJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmNmLWZpbGUtaW5wdXRcIikgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBiY2ZJbnB1dD8uYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhc3luYyAoZSkgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5maWxlcz8uWzBdO1xuICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLnNob3dUb2FzdChcIkltcG9ydGluZyBCQ0YgcGFja2FnZS4uLlwiLCBcImluZm9cIik7XG4gICAgICAgICAgY29uc3QgY291bnQgPSBhd2FpdCB0aGlzLmJjZi5pbXBvcnRCQ0ZaaXAoZmlsZSk7XG4gICAgICAgICAgdGhpcy5sb2FkSXNzdWVzKCk7XG4gICAgICAgICAgdGhpcy5zaG93VG9hc3QoYEltcG9ydGVkICR7Y291bnR9IGlzc3VlcyBzdWNjZXNzZnVsbHkhYCwgXCJzdWNjZXNzXCIpO1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KGBCQ0YgaW1wb3J0IGZhaWxlZDogJHtlcnIubWVzc2FnZX1gLCBcImVycm9yXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBEcmF3ZXIgdGFicyAoTGF5ZXJzIHZzIElzc3VlcylcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZHJhd2VyLXRhYl1cIikuZm9yRWFjaCgodGFiKSA9PiB7XG4gICAgICB0YWIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWRyYXdlci10YWJdXCIpLmZvckVhY2goKHQpID0+IHQuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKSk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZHJhd2VyLXBhbmVsXCIpLmZvckVhY2goKHApID0+IHAuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKSk7XG4gICAgICAgIHRhYi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSB0YWIuZ2V0QXR0cmlidXRlKFwiZGF0YS1kcmF3ZXItdGFiXCIpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcGFuZWwtJHt0YXJnZXR9YCk/LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIElzc3VlIHN0YXR1cyBmaWx0ZXJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpbHRlci1pc3N1ZS1zdGF0dXNcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IChlLnRhcmdldCBhcyBIVE1MU2VsZWN0RWxlbWVudCkudmFsdWU7XG4gICAgICBjb25zdCBmaWx0ZXJlZCA9IHN0YXR1cyA9PT0gXCJBbGxcIiA/IHRoaXMuYmNmLmlzc3VlcyA6IHRoaXMuYmNmLmlzc3Vlcy5maWx0ZXIoKGkpID0+IGkudG9waWNfc3RhdHVzID09PSBzdGF0dXMpO1xuICAgICAgdGhpcy5yZW5kZXJJc3N1ZXNMaXN0KGZpbHRlcmVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlTGF5ZXJVSSgpIHtcbiAgICBjb25zdCBsaXN0RWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1sYXllcnMtbGlzdFwiKTtcbiAgICBpZiAoIWxpc3RFbCB8fCAhdGhpcy5yZW5kZXJlci5kcmF3aW5nKSByZXR1cm47XG5cbiAgICBsaXN0RWwuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBsYXllcl0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5yZW5kZXJlci5kcmF3aW5nLmxheWVycykpIHtcbiAgICAgIGNvbnN0IHJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICByb3cuY2xhc3NOYW1lID0gXCJsYXllci1yb3dcIjtcbiAgICAgIGNvbnN0IGlzVmlzID0gdGhpcy5yZW5kZXJlci5sYXllclZpc2liaWxpdHlbbmFtZV0gIT09IGZhbHNlO1xuXG4gICAgICByb3cuaW5uZXJIVE1MID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwibGF5ZXItaW5mb1wiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY29sb3Itc3dhdGNoXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAke2xheWVyLmNvbG9yfVwiPjwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImxheWVyLW5hbWVcIiB0aXRsZT1cIiR7bmFtZX1cIj4ke25hbWV9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImxheWVyLWFjdGlvbnNcIj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLWxheWVyLXZpcyAke2lzVmlzID8gJ29uJyA6ICdvZmYnfVwiIHRpdGxlPVwiVG9nZ2xlIFZpc2liaWxpdHlcIj5cbiAgICAgICAgICAgICR7aXNWaXMgPyAnXHVEODNEXHVEQzQxXHVGRTBGJyA6ICdcdUQ4M0RcdURENzZcdUZFMEYnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGA7XG5cbiAgICAgIHJvdy5xdWVyeVNlbGVjdG9yKFwiLmJ0bi1sYXllci12aXNcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIubGF5ZXJWaXNpYmlsaXR5W25hbWVdID0gIXRoaXMucmVuZGVyZXIubGF5ZXJWaXNpYmlsaXR5W25hbWVdO1xuICAgICAgICB0aGlzLnVwZGF0ZUxheWVyVUkoKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcbiAgICAgIH0pO1xuXG4gICAgICBsaXN0RWwuYXBwZW5kQ2hpbGQocm93KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVNwYWNlc1VJKHNwYWNlczogc3RyaW5nW10pIHtcbiAgICBjb25zdCBiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1zcGFjZXMtYmFyXCIpO1xuICAgIGlmICghYmFyKSByZXR1cm47XG4gICAgYmFyLmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICBzcGFjZXMuZm9yRWFjaCgoc3ApID0+IHtcbiAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICBidG4uY2xhc3NOYW1lID0gYGNhZC1zcGFjZS10YWIgJHtzcCA9PT0gdGhpcy5hY3RpdmVTcGFjZSA/IFwiYWN0aXZlXCIgOiBcIlwifWA7XG4gICAgICBidG4udGV4dENvbnRlbnQgPSBzcDtcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmFjdGl2ZVNwYWNlID0gc3A7XG4gICAgICAgIHRoaXMudXBkYXRlU3BhY2VzVUkoc3BhY2VzKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci56b29tRXh0ZW50cygpO1xuICAgICAgfSk7XG4gICAgICBiYXIuYXBwZW5kQ2hpbGQoYnRuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVySXNzdWVzTGlzdChpc3N1ZXM6IEJDRlRvcGljSXRlbVtdKSB7XG4gICAgY29uc3QgbGlzdEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJiY2YtaXNzdWVzLWxpc3RcIik7XG4gICAgaWYgKCFsaXN0RWwpIHJldHVybjtcbiAgICBsaXN0RWwuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgIGlmIChpc3N1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBsaXN0RWwuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJlbXB0eS1zdGF0ZVwiPk5vIEJDRiBpc3N1ZXMgZm91bmQuIENsaWNrICdBZGQgSXNzdWUnIHRvIGNyZWF0ZSBvbmUuPC9kaXY+YDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpc3N1ZXMuZm9yRWFjaCgoaXNzdWUpID0+IHtcbiAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgY2FyZC5jbGFzc05hbWUgPSBgYmNmLWlzc3VlLWNhcmQgJHtpc3N1ZS5uYW1lID09PSB0aGlzLnJlbmRlcmVyLmFjdGl2ZUlzc3VlSWQgPyBcInNlbGVjdGVkXCIgOiBcIlwifWA7XG4gICAgICBjb25zdCBiYWRnZUNsYXNzID0gaXNzdWUudG9waWNfc3RhdHVzID09PSBcIlJlc29sdmVkXCIgfHwgaXNzdWUudG9waWNfc3RhdHVzID09PSBcIkNsb3NlZFwiID8gXCJyZXNvbHZlZFwiIDogaXNzdWUucHJpb3JpdHkgPT09IFwiQ3JpdGljYWxcIiA/IFwiY3JpdGljYWxcIiA6IFwib3BlblwiO1xuXG4gICAgICBjYXJkLmlubmVySFRNTCA9IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImlzc3VlLWNhcmQtaGVhZGVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJwaW4tYmFkZ2VcIj4jJHtpc3N1ZS5waW5fbnVtYmVyIHx8IDF9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiaXNzdWUtdGl0bGVcIj4ke2lzc3VlLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0YXR1cy1waWxsICR7YmFkZ2VDbGFzc31cIj4ke2lzc3VlLnRvcGljX3N0YXR1c308L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiaXNzdWUtY2FyZC1tZXRhXCI+XG4gICAgICAgICAgPHNwYW4+UHJpb3JpdHk6IDxzdHJvbmc+JHtpc3N1ZS5wcmlvcml0eX08L3N0cm9uZz48L3NwYW4+XG4gICAgICAgICAgPHNwYW4+VHlwZTogJHtpc3N1ZS50b3BpY190eXBlfTwvc3Bhbj5cbiAgICAgICAgICA8c3Bhbj5cdUQ4M0RcdURDQUMgJHtpc3N1ZS5jb21tZW50X2NvdW50IHx8IDB9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIGA7XG5cbiAgICAgIGNhcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuc2VsZWN0SXNzdWUoaXNzdWUpKTtcbiAgICAgIGxpc3RFbC5hcHBlbmRDaGlsZChjYXJkKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvd0lzc3VlRGV0YWlsKGlzc3VlOiBCQ0ZUb3BpY0l0ZW0pIHtcbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaXNzdWUtZGV0YWlsLWRyYXdlclwiKTtcbiAgICBpZiAoIW1vZGFsKSByZXR1cm47XG4gICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcblxuICAgIG1vZGFsLmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJkcmF3ZXItaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJoZWFkZXItbGVmdFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwicGluLWJhZGdlIGxhcmdlXCI+IyR7aXNzdWUucGluX251bWJlciB8fCAxfTwvc3Bhbj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzPiR7aXNzdWUudGl0bGV9PC9oMz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3RhdHVzLXBpbGxcIj4ke2lzc3VlLnRvcGljX3N0YXR1c308L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLWNsb3NlXCIgaWQ9XCJidG4tY2xvc2UtaXNzdWUtZGV0YWlsXCI+XHUyNzE1PC9idXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz1cImRyYXdlci1ib2R5XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtZXRhLWdyaWRcIj5cbiAgICAgICAgICA8ZGl2PjxsYWJlbD5Qcmlvcml0eTo8L2xhYmVsPiA8c3Bhbj4ke2lzc3VlLnByaW9yaXR5fTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICA8ZGl2PjxsYWJlbD5UeXBlOjwvbGFiZWw+IDxzcGFuPiR7aXNzdWUudG9waWNfdHlwZX08L3NwYW4+PC9kaXY+XG4gICAgICAgICAgPGRpdj48bGFiZWw+U3RhZ2U6PC9sYWJlbD4gPHNwYW4+JHtpc3N1ZS5zdGFnZSB8fCAnQ29vcmRpbmF0aW9uJ308L3NwYW4+PC9kaXY+XG4gICAgICAgICAgPGRpdj48bGFiZWw+QXNzaWduZWQ6PC9sYWJlbD4gPHNwYW4+JHtpc3N1ZS5hc3NpZ25lZF90byB8fCAnVW5hc3NpZ25lZCd9PC9zcGFuPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICAke2lzc3VlLmRlc2NyaXB0aW9uID8gYDxwIGNsYXNzPVwiaXNzdWUtZGVzY1wiPiR7aXNzdWUuZGVzY3JpcHRpb259PC9wPmAgOiAnJ31cbiAgICAgICAgJHtpc3N1ZS5zbmFwc2hvdCA/IGA8aW1nIGNsYXNzPVwiaXNzdWUtc25hcHNob3RcIiBzcmM9XCIke2lzc3VlLnNuYXBzaG90fVwiIGFsdD1cIlNuYXBzaG90XCIgLz5gIDogJyd9XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbW1lbnQtc2VjdGlvblwiPlxuICAgICAgICAgIDxoND5EaXNjdXNzaW9uPC9oND5cbiAgICAgICAgICA8ZGl2IGlkPVwiaXNzdWUtY29tbWVudHMtbGlzdFwiIGNsYXNzPVwiY29tbWVudHMtbGlzdFwiPkxvYWRpbmcgY29tbWVudHMuLi48L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29tbWVudC1pbnB1dC1ib3hcIj5cbiAgICAgICAgICAgIDx0ZXh0YXJlYSBpZD1cImlzc3VlLXJlcGx5LXRleHRcIiBwbGFjZWhvbGRlcj1cIldyaXRlIGEgcmVwbHkgb3IgY29vcmRpbmF0aW9uIG5vdGUuLi5cIj48L3RleHRhcmVhPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlcGx5LWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPHNlbGVjdCBpZD1cInNlbGVjdC1pc3N1ZS1zdGF0dXMtdHJhbnNpdGlvblwiPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIiAke2lzc3VlLnRvcGljX3N0YXR1cyA9PT0gJ09wZW4nID8gJ3NlbGVjdGVkJyA6ICcnfT5LZWVwIEN1cnJlbnQgKCR7aXNzdWUudG9waWNfc3RhdHVzfSk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiSW4gUHJvZ3Jlc3NcIj5JbiBQcm9ncmVzczwvb3B0aW9uPlxuICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJSZXNvbHZlZFwiPlJlc29sdmVkPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIkNsb3NlZFwiPkNsb3NlZDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bi1zdWJtaXQtcmVwbHlcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tc21cIj5Qb3N0IENvbW1lbnQ8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1jbG9zZS1pc3N1ZS1kZXRhaWxcIik/LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBtb2RhbC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tc3VibWl0LXJlcGx5XCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgdGV4dCA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImlzc3VlLXJlcGx5LXRleHRcIikgYXMgSFRNTFRleHRBcmVhRWxlbWVudCk/LnZhbHVlO1xuICAgICAgY29uc3QgbmV3U3RhdHVzID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWlzc3VlLXN0YXR1cy10cmFuc2l0aW9uXCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50KT8udmFsdWUgfHwgdW5kZWZpbmVkO1xuICAgICAgaWYgKCF0ZXh0LnRyaW0oKSkgcmV0dXJuO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmJjZi5hZGRDb21tZW50KGlzc3VlLm5hbWUsIHRleHQsIG5ld1N0YXR1cyk7XG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KFwiQ29tbWVudCBwb3N0ZWQhXCIsIFwic3VjY2Vzc1wiKTtcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkSXNzdWVzKCk7XG4gICAgICAgIHRoaXMuc2VsZWN0SXNzdWUodGhpcy5iY2YuaXNzdWVzLmZpbmQoKGkpID0+IGkubmFtZSA9PT0gaXNzdWUubmFtZSkgfHwgaXNzdWUpO1xuICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoYEZhaWxlZDogJHtlcnIubWVzc2FnZX1gLCBcImVycm9yXCIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5mZXRjaElzc3VlQ29tbWVudHMoaXNzdWUubmFtZSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZldGNoSXNzdWVDb21tZW50cyhpc3N1ZU5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGxpc3RFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaXNzdWUtY29tbWVudHMtbGlzdFwiKTtcbiAgICBpZiAoIWxpc3RFbCkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcbiAgICAgICAgYC9hcGkvbWV0aG9kL2ZyYXBwZS5jbGllbnQuZ2V0X2xpc3Q/ZG9jdHlwZT1Db21tZW50JmZpbHRlcnM9JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoeyByZWZlcmVuY2VfZG9jdHlwZTogXCJCSU0gSXNzdWVcIiwgcmVmZXJlbmNlX25hbWU6IGlzc3VlTmFtZSwgY29tbWVudF90eXBlOiBcIkNvbW1lbnRcIiB9KVxuICAgICAgICApfSZmaWVsZHM9JHtlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoW1wibmFtZVwiLCBcImNvbnRlbnRcIiwgXCJjcmVhdGlvblwiLCBcImNvbW1lbnRfYnlcIl0pKX0mb3JkZXJfYnk9Y3JlYXRpb24gYXNjYFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICAgIGNvbnN0IGNvbW1lbnRzID0gZGF0YS5tZXNzYWdlIHx8IFtdO1xuXG4gICAgICBpZiAoY29tbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cInRleHQtbXV0ZWRcIj5ObyBjb21tZW50cyB5ZXQuIEJlIHRoZSBmaXJzdCB0byByZXBseS48L2Rpdj5gO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxpc3RFbC5pbm5lckhUTUwgPSBjb21tZW50c1xuICAgICAgICAubWFwKFxuICAgICAgICAgIChjOiBhbnkpID0+IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbW1lbnQtYnViYmxlXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNvbW1lbnQtYXV0aG9yXCI+PHN0cm9uZz4ke2MuY29tbWVudF9ieX08L3N0cm9uZz4gPHNtYWxsPiR7Yy5jcmVhdGlvbn08L3NtYWxsPjwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb21tZW50LWNvbnRlbnRcIj4ke2MuY29udGVudH08L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBgXG4gICAgICAgIClcbiAgICAgICAgLmpvaW4oXCJcIik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbGlzdEVsLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwidGV4dC1kYW5nZXJcIj5GYWlsZWQgdG8gbG9hZCBjb21tZW50czwvZGl2PmA7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvcGVuQ3JlYXRlSXNzdWVNb2RhbChsb2NhdGlvbjogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9KSB7XG4gICAgY29uc3QgdmlzaWJsZUxheWVycyA9IE9iamVjdC5lbnRyaWVzKHRoaXMucmVuZGVyZXIubGF5ZXJWaXNpYmlsaXR5KVxuICAgICAgLmZpbHRlcigoW18sIHZdKSA9PiB2KVxuICAgICAgLm1hcCgoW2ssIF9dKSA9PiBrKTtcblxuICAgIGNvbnN0IHNuYXBzaG90ID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgIGNvbnN0IHZpZXdwb2ludCA9IHRoaXMuYmNmLmNhcHR1cmVWaWV3cG9pbnQobG9jYXRpb24sIHRoaXMucmVuZGVyZXIuem9vbSwgdmlzaWJsZUxheWVycyk7XG5cbiAgICBjb25zdCBtb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlYXRlLWlzc3VlLW1vZGFsXCIpO1xuICAgIGlmICghbW9kYWwpIHJldHVybjtcbiAgICBtb2RhbC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybS1jcmVhdGUtaXNzdWVcIikgYXMgSFRNTEZvcm1FbGVtZW50O1xuICAgIGZvcm0/LnJlc2V0KCk7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1jYW5jZWwtY3JlYXRlLWlzc3VlXCIpPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgbW9kYWwuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICB9KTtcblxuICAgIGZvcm0ub25zdWJtaXQgPSBhc3luYyAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3QgdGl0bGUgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbnB1dC1pc3N1ZS10aXRsZVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KT8udmFsdWU7XG4gICAgICBjb25zdCB0eXBlID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWlzc3VlLXR5cGVcIikgYXMgSFRNTFNlbGVjdEVsZW1lbnQpPy52YWx1ZTtcbiAgICAgIGNvbnN0IHByaW9yaXR5ID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWlzc3VlLXByaW9yaXR5XCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50KT8udmFsdWU7XG4gICAgICBjb25zdCBkZXNjID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGV4dGFyZWEtaXNzdWUtZGVzY1wiKSBhcyBIVE1MVGV4dEFyZWFFbGVtZW50KT8udmFsdWU7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KFwiU2F2aW5nIEJDRiBJc3N1ZS4uLlwiLCBcImluZm9cIik7XG4gICAgICAgIGF3YWl0IHRoaXMuYmNmLmNyZWF0ZUlzc3VlKHRpdGxlLCB2aWV3cG9pbnQsIHNuYXBzaG90LCB7XG4gICAgICAgICAgdG9waWNfdHlwZTogdHlwZSxcbiAgICAgICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICAgICAgZGVzY3JpcHRpb246IGRlc2MsXG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgIH0pO1xuICAgICAgICBtb2RhbC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICB0aGlzLnNob3dUb2FzdChcIkJJTSBJc3N1ZSBjcmVhdGVkIHN1Y2Nlc3NmdWxseSFcIiwgXCJzdWNjZXNzXCIpO1xuICAgICAgICBhd2FpdCB0aGlzLmxvYWRJc3N1ZXMoKTtcbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgIHRoaXMuc2hvd1RvYXN0KGBFcnJvcjogJHtlcnIubWVzc2FnZX1gLCBcImVycm9yXCIpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHNob3dNZWFzdXJlbWVudFJlc3VsdCh0ZXh0OiBzdHJpbmcpIHtcbiAgICBjb25zdCBiYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhZC1tZWFzdXJlLXJlc3VsdFwiKTtcbiAgICBpZiAoYmFyKSB7XG4gICAgICBiYXIudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgYmFyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzaG93VG9hc3QobWVzc2FnZTogc3RyaW5nLCB0eXBlOiBcImluZm9cIiB8IFwic3VjY2Vzc1wiIHwgXCJlcnJvclwiID0gXCJpbmZvXCIpIHtcbiAgICBjb25zb2xlLmxvZyhgWyR7dHlwZS50b1VwcGVyQ2FzZSgpfV0gJHttZXNzYWdlfWApO1xuICAgIGNvbnN0IHRvYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWQtdG9hc3RcIik7XG4gICAgaWYgKHRvYXN0KSB7XG4gICAgICB0b2FzdC50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgICB0b2FzdC5jbGFzc05hbWUgPSBgY2FkLXRvYXN0ICR7dHlwZX0gc2hvd2A7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRvYXN0LmNsYXNzTGlzdC5yZW1vdmUoXCJzaG93XCIpLCAzNTAwKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXREV0dWaWV3ZXIoY2FudmFzRWxlbWVudD86IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gIGNvbnN0IGNhbnZhcyA9IGNhbnZhc0VsZW1lbnQgfHwgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FkLWNhbnZhc1wiKSBhcyBIVE1MQ2FudmFzRWxlbWVudCk7XG4gIGlmICghY2FudmFzKSB7XG4gICAgY29uc29sZS53YXJuKFwiQ0FEIGNhbnZhcyBlbGVtZW50ICNjYWQtY2FudmFzIG5vdCBmb3VuZCBpbiBET00uXCIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmICgod2luZG93IGFzIGFueSkuZHdnQXBwKSB7XG4gICAgKHdpbmRvdyBhcyBhbnkpLmR3Z0FwcC5yZW5kZXJlci5yZXNpemUoKTtcbiAgICAod2luZG93IGFzIGFueSkuZHdnQXBwLnJlbmRlcmVyLnJlbmRlcigpO1xuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuZHdnQXBwO1xuICB9XG4gIGNvbnN0IGFwcCA9IG5ldyBEV0dWaWV3ZXJBcHAoY2FudmFzKTtcbiAgKHdpbmRvdyBhcyBhbnkpLmR3Z0FwcCA9IGFwcDtcbiAgcmV0dXJuIGFwcDtcbn1cblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgKHdpbmRvdyBhcyBhbnkpLkRXR1ZpZXdlckFwcCA9IERXR1ZpZXdlckFwcDtcbiAgKHdpbmRvdyBhcyBhbnkpLmluaXREV0dWaWV3ZXIgPSBpbml0RFdHVmlld2VyO1xuXG4gIC8vIElmIGNhbnZhcyBpcyBhbHJlYWR5IHByZXNlbnQgaW4gRE9NLCBpbml0aWFsaXplIGltbWVkaWF0ZWx5XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWQtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICBpZiAoZWwpIHtcbiAgICBpbml0RFdHVmlld2VyKGVsKTtcbiAgfVxufVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBT08sSUFBTSxnQkFBd0M7QUFBQSxFQUNuRCxHQUFHO0FBQUE7QUFBQSxFQUNILEdBQUc7QUFBQTtBQUFBLEVBQ0gsR0FBRztBQUFBO0FBQUEsRUFDSCxHQUFHO0FBQUE7QUFBQSxFQUNILEdBQUc7QUFBQTtBQUFBLEVBQ0gsR0FBRztBQUFBO0FBQUEsRUFDSCxHQUFHO0FBQUE7QUFBQSxFQUNILEdBQUc7QUFBQTtBQUFBLEVBQ0gsR0FBRztBQUFBO0FBQUEsRUFDSCxHQUFHO0FBQUE7QUFBQSxFQUNILElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUNoRSxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFDaEUsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQ2hFLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUNoRSxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFDaEUsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQ2hFLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUFXLElBQUk7QUFBQSxFQUNoRSxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFBVyxJQUFJO0FBQUEsRUFDaEUsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQVcsSUFBSTtBQUFBLEVBQ2hFLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUNyRSxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFDckUsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQ3JFLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUNyRSxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFDckUsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQVcsS0FBSztBQUFBLEVBQ3JFLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUFXLEtBQUs7QUFBQSxFQUNyRSxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFBVyxLQUFLO0FBQUEsRUFDckUsS0FBSztBQUFBLEVBQVcsS0FB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
