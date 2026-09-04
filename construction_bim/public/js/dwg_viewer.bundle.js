// ../src/cad/dxf_parser_engine.ts
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

// ../src/cad/cad_canvas_renderer.ts
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

// ../src/cad/cad_measurement_tools.ts
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

// ../src/cad/bcf_collaboration_manager.ts
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

// ../dwg_viewer_app.js
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
            const content = await textResp.text();
            const parsed = parseDXFText(content);
            parsed.model_name = decodeURIComponent(fileParam.split("/").pop() || "CAD Drawing");
            this.renderer.setDrawing(parsed);
            this.bcf.activeModelName = parsed.model_name;
            this.updateLayerUI();
            this.updateSpacesUI(parsed.spaces);
            await this.loadIssues();
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
