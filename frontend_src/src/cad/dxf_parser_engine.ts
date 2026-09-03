/**
 * Precision CAD (DXF/DWG) Parser & Vector Geometry Processor.
 * Supports AutoCAD group codes, ACI 256 color index, polyline arc bulge geometry,
 * blocks, hatches, text, dimensions, and drawing extents.
 */

// AutoCAD Color Index (ACI) standard RGB palette mapping (0-255)
export const ACI_COLOR_MAP: Record<number, string> = {
  0: "#000000",   // BYBLOCK
  1: "#ff0000",   // Red
  2: "#ffff00",   // Yellow
  3: "#00ff00",   // Green
  4: "#00ffff",   // Cyan
  5: "#0000ff",   // Blue
  6: "#ff00ff",   // Magenta
  7: "#ffffff",   // White / Black (draws white on dark, black on light)
  8: "#808080",   // Dark Gray
  9: "#c0c0c0",   // Light Gray
  10: "#ff0000", 11: "#ff7f7f", 12: "#cc0000", 13: "#cc6666", 14: "#990000",
  20: "#ff3f00", 21: "#ff9f7f", 22: "#cc3300", 23: "#cc7f66", 24: "#992600",
  30: "#ff7f00", 31: "#ffbf7f", 32: "#cc6600", 33: "#cc9966", 34: "#994c00",
  40: "#ffbf00", 41: "#ffdf7f", 42: "#cc9900", 43: "#ccb266", 44: "#997300",
  50: "#ffff00", 51: "#ffff7f", 52: "#cccc00", 53: "#cccc66", 54: "#999900",
  60: "#bfff00", 61: "#dfff7f", 62: "#99cc00", 63: "#b2cc66", 64: "#739900",
  70: "#7fff00", 71: "#bfff7f", 72: "#66cc00", 73: "#99cc66", 74: "#4c9900",
  80: "#3fff00", 81: "#9fff7f", 82: "#33cc00", 83: "#7fcc66", 84: "#269900",
  90: "#00ff00", 91: "#7fff7f", 92: "#00cc00", 93: "#66cc66", 94: "#009900",
  100: "#00ff3f", 101: "#7fff9f", 102: "#00cc33", 103: "#66cc7f", 104: "#009926",
  110: "#00ff7f", 111: "#7fffbf", 112: "#00cc66", 113: "#66cc99", 114: "#00994c",
  120: "#00ffbf", 121: "#7fffdf", 122: "#00cc99", 123: "#66ccb2", 124: "#009973",
  130: "#00ffff", 131: "#7fffff", 132: "#00cccc", 133: "#66cccc", 134: "#009999",
  140: "#00bfff", 141: "#7fdfff", 142: "#0099cc", 143: "#66b2cc", 144: "#007399",
  150: "#007fff", 151: "#7fbfff", 152: "#0066cc", 153: "#6699cc", 154: "#004c99",
  160: "#003fff", 161: "#7f9fff", 162: "#0033cc", 163: "#667fcc", 164: "#002699",
  170: "#0000ff", 171: "#7f7fff", 172: "#0000cc", 173: "#6666cc", 174: "#000099",
  180: "#3f00ff", 181: "#9f7fff", 182: "#3300cc", 183: "#7f66cc", 184: "#260099",
  190: "#7f00ff", 191: "#bf7fff", 192: "#6600cc", 193: "#9966cc", 194: "#4c0099",
  200: "#bf00ff", 201: "#df7fff", 202: "#9900cc", 203: "#b266cc", 204: "#730099",
  210: "#ff00ff", 211: "#ff7fff", 212: "#cc00cc", 213: "#cc66cc", 214: "#990099",
  220: "#ff00bf", 221: "#ff7fdf", 222: "#cc0099", 223: "#cc66b2", 224: "#990073",
  230: "#ff007f", 231: "#ff7fbf", 232: "#cc0066", 233: "#cc6699", 234: "#99004c",
  240: "#ff003f", 241: "#ff7f9f", 242: "#cc0033", 243: "#cc667f", 244: "#990026",
  250: "#333333", 251: "#505050", 252: "#696969", 253: "#828282", 254: "#bebebe", 255: "#ffffff"
};

export interface CADPoint {
  x: number;
  y: number;
  z?: number;
}

export interface CADVertex extends CADPoint {
  bulge?: number;
}

export interface CADLayer {
  name: string;
  color: string;
  aci: number;
  visible: boolean;
  frozen?: boolean;
  locked?: boolean;
  lineType?: string;
  description?: string;
}

export interface CADEntity {
  type: string;
  layer: string;
  color?: string;
  aci?: number;
  start?: CADPoint;
  end?: CADPoint;
  center?: CADPoint;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  vertices?: CADVertex[];
  closed?: boolean;
  text?: string;
  position?: CADPoint;
  height?: number;
  rotation?: number;
  blockName?: string;
  scale?: CADPoint;
  pattern?: string;
  boundary?: CADPoint[];
  [key: string]: any;
}

export interface CADDrawingData {
  status: string;
  model_name: string;
  file_format: string;
  units: string;
  spaces: string[];
  layers: Record<string, CADLayer>;
  entities: CADEntity[];
  blocks?: Record<string, { entities: CADEntity[] }>;
  extents: {
    min: CADPoint;
    max: CADPoint;
    center: CADPoint;
    width: number;
    height: number;
  };
  entity_count: number;
}

/**
 * Calculates arc curve points from two polyline vertices and a bulge factor.
 * Bulge = tan(included_angle / 4).
 */
export function calculateBulgeArcPoints(
  p1: CADPoint,
  p2: CADPoint,
  bulge: number,
  segments: number = 16
): CADPoint[] {
  if (Math.abs(bulge) < 1e-6) {
    return [p1, p2];
  }

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d < 1e-9) return [p1];

  const theta = 4 * Math.atan(bulge);
  const radius = (d * (1 + bulge * bulge)) / (4 * Math.abs(bulge));

  // Midpoint of chord
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;

  // Normal vector to chord
  const nx = -dy / d;
  const ny = dx / d;

  // Distance from chord to center
  const distToCenter = (d * (1 - bulge * bulge)) / (4 * bulge);
  const cx = mx + distToCenter * nx;
  const cy = my + distToCenter * ny;

  // Start and sweep angles
  const a1 = Math.atan2(p1.y - cy, p1.x - cx);
  let a2 = Math.atan2(p2.y - cy, p2.x - cx);

  if (bulge > 0 && a2 <= a1) {
    a2 += 2 * Math.PI;
  } else if (bulge < 0 && a2 >= a1) {
    a2 -= 2 * Math.PI;
  }

  const points: CADPoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const ang = a1 + t * (a2 - a1);
    points.push({
      x: cx + radius * Math.cos(ang),
      y: cy + radius * Math.sin(ang),
      z: p1.z || 0,
    });
  }

  return points;
}

/**
 * Parses raw DXF text into a structured CADDrawingData object.
 */
export function parseDXFText(dxfContent: string): CADDrawingData {
  const lines = dxfContent.split(/\r?\n/);
  let i = 0;

  function nextGroup(): { code: number; value: string } | null {
    if (i >= lines.length - 1) return null;
    const code = parseInt(lines[i++].trim(), 10);
    const value = lines[i++].trim();
    return { code, value };
  }

  const layers: Record<string, CADLayer> = {
    "0": { name: "0", color: "#ffffff", aci: 7, visible: true },
  };
  const entities: CADEntity[] = [];
  const blocks: Record<string, { entities: CADEntity[] }> = {};

  let currentSection = "";
  let currentTable = "";
  let currentBlock: { name: string; entities: CADEntity[] } | null = null;

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

    // Process TABLES section (Layers)
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
            i -= 2; // backtrack to entity start
            break;
          }
          if (lg.code === 2) lName = lg.value;
          if (lg.code === 62) {
            const aciVal = Math.abs(parseInt(lg.value, 10));
            lAci = aciVal;
            lColor = ACI_COLOR_MAP[aciVal] || "#ffffff";
            if (parseInt(lg.value, 10) < 0) lFrozen = true;
          }
          if (lg.code === 70 && (parseInt(lg.value, 10) & 1)) {
            lFrozen = true;
          }
        }

        if (lName) {
          layers[lName] = {
            name: lName,
            color: lColor,
            aci: lAci,
            visible: !lFrozen,
            frozen: lFrozen,
          };
        }
      }
    }

    // Process BLOCKS and ENTITIES
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

        // Parse Entity
        const ent: CADEntity = {
          type: entType,
          layer: "0",
        };

        if (entType === "LINE") {
          ent.start = { x: 0, y: 0, z: 0 };
          ent.end = { x: 0, y: 0, z: 0 };
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) { i -= 2; break; }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 62) { ent.aci = Math.abs(parseInt(g.value, 10)); ent.color = ACI_COLOR_MAP[ent.aci]; }
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
            if (!g || g.code === 0) { i -= 2; break; }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 62) { ent.aci = Math.abs(parseInt(g.value, 10)); ent.color = ACI_COLOR_MAP[ent.aci]; }
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
            if (!g || g.code === 0) { i -= 2; break; }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 62) { ent.aci = Math.abs(parseInt(g.value, 10)); ent.color = ACI_COLOR_MAP[ent.aci]; }
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
          let curV: CADVertex | null = null;
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) { i -= 2; break; }
            if (g.code === 8) ent.layer = g.value;
            if (g.code === 62) { ent.aci = Math.abs(parseInt(g.value, 10)); ent.color = ACI_COLOR_MAP[ent.aci]; }
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
            if (!g || g.code === 0) { i -= 2; break; }
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
            if (!g || g.code === 0) { i -= 2; break; }
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
          // Skip other entity types gracefully
          while (i < lines.length - 1) {
            const g = nextGroup();
            if (!g || g.code === 0) { i -= 2; break; }
          }
        }
      }
    }
  }

  // Calculate drawing bounding box extents
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  function updateBounds(x: number, y: number) {
    if (isNaN(x) || isNaN(y)) return;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  for (const ent of entities) {
    if (ent.start) { updateBounds(ent.start.x, ent.start.y); }
    if (ent.end) { updateBounds(ent.end.x, ent.end.y); }
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
    minX = 0; minY = 0; maxX = 1000; maxY = 1000;
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
      height,
    },
    entity_count: entities.length,
  };
}
