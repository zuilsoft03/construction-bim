/**
 * High-Performance Vector CAD Canvas Renderer.
 * Supports AutoCAD ACI colors, polyline arc bulges, blocks, text, hatches,
 * pan, wheel zoom at cursor, zoom extents, visual themes, snapping indicators,
 * measurement overlays, and BIMcollab BCF visual markups.
 */

import {
  CADDrawingData,
  CADEntity,
  CADPoint,
  calculateBulgeArcPoints,
  ACI_COLOR_MAP,
} from "./dxf_parser_engine";
import { SnapTarget } from "./cad_measurement_tools";
import { BCFAssociatedMarkup, BCFTopicItem } from "./bcf_collaboration_manager";

export type CADTheme = "dark" | "black" | "paper" | "blueprint";

export interface ThemeColors {
  background: string;
  gridMajor: string;
  gridMinor: string;
  crosshair: string;
  defaultEntity: string;
}

export const THEME_PALETTES: Record<CADTheme, ThemeColors> = {
  dark: {
    background: "#212830",
    gridMajor: "#2b343f",
    gridMinor: "#252d37",
    crosshair: "#5c6978",
    defaultEntity: "#ffffff",
  },
  black: {
    background: "#0e1116",
    gridMajor: "#1b2028",
    gridMinor: "#14181f",
    crosshair: "#485260",
    defaultEntity: "#ffffff",
  },
  paper: {
    background: "#f8f9fa",
    gridMajor: "#e2e6ea",
    gridMinor: "#edeef1",
    crosshair: "#adb5bd",
    defaultEntity: "#212529",
  },
  blueprint: {
    background: "#0c233f",
    gridMajor: "#153863",
    gridMinor: "#102c4f",
    crosshair: "#3a70b2",
    defaultEntity: "#e6f2ff",
  },
};

export class CADCanvasRenderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public drawing: CADDrawingData | null = null;

  // Viewport State
  public panX: number = 0; // World coordinate at viewport center
  public panY: number = 0;
  public zoom: number = 0.05; // Screen pixels per world unit
  public theme: CADTheme = "dark";

  // Layer Overrides
  public layerVisibility: Record<string, boolean> = {};

  // Interactive Overlays
  public snapTarget: SnapTarget | null = null;
  public activeMeasurePoints: CADPoint[] = [];
  public measureMode: "none" | "distance" | "area" | "angle" = "none";

  // BCF Collaboration Overlays
  public issues: BCFTopicItem[] = [];
  public activeIssueId: string | null = null;
  public draftMarkups: BCFAssociatedMarkup[] = [];

  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private animFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to obtain 2D rendering context for CAD canvas.");
    }
    this.ctx = context;

    this.bindEvents();
    this.resize();
  }

  public setDrawing(data: CADDrawingData) {
    this.drawing = data;
    this.layerVisibility = {};
    for (const [name, layer] of Object.entries(data.layers)) {
      this.layerVisibility[name] = layer.visible !== false;
    }
    this.zoomExtents();
  }

  public setTheme(theme: CADTheme) {
    this.theme = theme;
    this.render();
  }

  public resize() {
    const parent = this.canvas.parentElement;
    const rect = parent?.getBoundingClientRect();
    let width = rect?.width || parent?.clientWidth || 800;
    let height = rect?.height || parent?.clientHeight || 600;

    // Guard against collapsed parent dimensions
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
  public worldToScreen(p: CADPoint): { u: number; v: number } {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const u = (p.x - this.panX) * this.zoom + w / 2;
    const v = -(p.y - this.panY) * this.zoom + h / 2;
    return { u, v };
  }

  /**
   * Transforms screen pixels (u, v) to world CAD coordinates (X, Y).
   */
  public screenToWorld(u: number, v: number): CADPoint {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const x = (u - w / 2) / this.zoom + this.panX;
    const y = -(v - h / 2) / this.zoom + this.panY;
    return { x, y, z: 0 };
  }

  /**
   * Zoom extents: centers and fits drawing bounding box inside the canvas.
   */
  public zoomExtents() {
    if (!this.drawing) return;
    const ext = this.drawing.extents;
    this.panX = ext.center.x;
    this.panY = ext.center.y;

    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const padding = 60; // pixels padding
    const zoomX = (w - padding * 2) / ext.width;
    const zoomY = (h - padding * 2) / ext.height;
    this.zoom = Math.max(Math.min(zoomX, zoomY), 1e-4);

    this.render();
  }

  /**
   * Fly-to camera viewpoint animation for BCF issues.
   */
  public flyToViewpoint(center: CADPoint, targetZoom: number, durationMs: number = 400): Promise<void> {
    return new Promise((resolve) => {
      const startX = this.panX;
      const startY = this.panY;
      const startZoom = this.zoom;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1.0);
        // Smooth ease-out cubic curve
        const ease = 1 - Math.pow(1 - progress, 3);

        this.panX = startX + (center.x - startX) * ease;
        this.panY = startY + (center.y - startY) * ease;
        this.zoom = startZoom + (targetZoom - startZoom) * ease;
        this.render();

        if (progress < 1.0) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  public render() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(() => this.drawFrame());
  }

  private drawFrame() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const pal = THEME_PALETTES[this.theme];

    // 1. Clear background
    this.ctx.fillStyle = pal.background;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Render CAD grid
    this.drawGrid(pal, w, h);

    if (!this.drawing) return;

    // 3. Render Drawing Entities
    for (const ent of this.drawing.entities) {
      if (this.layerVisibility[ent.layer] === false) continue;
      this.drawEntity(ent, pal);
    }

    // 4. Render Active Measurements
    this.drawMeasurementOverlays();

    // 5. Render Snapping Indicator
    this.drawSnapIndicator();

    // 6. Render BCF Issue Pins & Markups
    this.drawBCFMarkups();
  }

  private drawGrid(pal: ThemeColors, w: number, h: number) {
    // Dynamic grid spacing based on zoom level
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

    // Vertical grid lines
    for (let x = startX; x <= endX; x += unitSpacing) {
      const p1 = this.worldToScreen({ x, y: startY });
      const p2 = this.worldToScreen({ x, y: endY });
      this.ctx.moveTo(p1.u, p1.v);
      this.ctx.lineTo(p2.u, p2.v);
    }

    // Horizontal grid lines
    for (let y = startY; y <= endY; y += unitSpacing) {
      const p1 = this.worldToScreen({ x: startX, y });
      const p2 = this.worldToScreen({ x: endX, y });
      this.ctx.moveTo(p1.u, p1.v);
      this.ctx.lineTo(p2.u, p2.v);
    }
    this.ctx.stroke();

    // UCS Origin Axis Indicator (0,0)
    const origin = this.worldToScreen({ x: 0, y: 0 });
    const axisLen = 40;

    // X Axis (Red)
    this.ctx.strokeStyle = "#ff3b30";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(origin.u, origin.v);
    this.ctx.lineTo(origin.u + axisLen, origin.v);
    this.ctx.stroke();

    // Y Axis (Green)
    this.ctx.strokeStyle = "#34c759";
    this.ctx.beginPath();
    this.ctx.moveTo(origin.u, origin.v);
    this.ctx.lineTo(origin.u, origin.v - axisLen);
    this.ctx.stroke();
  }

  private drawEntity(ent: CADEntity, pal: ThemeColors) {
    let strokeColor = pal.defaultEntity;
    const layer = this.drawing?.layers[ent.layer];

    if (ent.color) {
      strokeColor = ent.color;
    } else if (ent.aci && ACI_COLOR_MAP[ent.aci]) {
      strokeColor = ACI_COLOR_MAP[ent.aci];
    } else if (layer?.color) {
      strokeColor = layer.color;
    }

    // Auto-contrast adjust for White ACI 7 on Light Paper theme
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
      // Invert angles for screen coordinates
      const startRad = (-ent.startAngle! * Math.PI) / 180;
      const endRad = (-ent.endAngle! * Math.PI) / 180;
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
      // Draw dimension line
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

  private drawSnapIndicator() {
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

  private drawMeasurementOverlays() {
    if (this.activeMeasurePoints.length === 0) return;

    this.ctx.save();
    this.ctx.strokeStyle = "#ff9500";
    this.ctx.fillStyle = "rgba(255, 149, 0, 0.2)";
    this.ctx.lineWidth = 2;

    if (this.measureMode === "distance" && this.activeMeasurePoints.length >= 2) {
      const p1 = this.worldToScreen(this.activeMeasurePoints[0]);
      const p2 = this.worldToScreen(this.activeMeasurePoints[1]);

      // Direct measurement line
      this.ctx.beginPath();
      this.ctx.moveTo(p1.u, p1.v);
      this.ctx.lineTo(p2.u, p2.v);
      this.ctx.stroke();

      // Dimension badge
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

  private drawBCFMarkups() {
    for (const issue of this.issues) {
      const isSelected = issue.name === this.activeIssueId;
      const pos = this.worldToScreen({ x: issue.location_x, y: issue.location_y });

      // Draw Numbered Pin Marker Badge
      this.ctx.save();
      const radius = isSelected ? 16 : 13;
      const badgeColor = issue.topic_status === "Resolved" || issue.topic_status === "Closed"
        ? "#34c759"
        : issue.priority === "Critical"
        ? "#ff3b30"
        : "#007aff";

      // Shadow
      this.ctx.shadowColor = "rgba(0,0,0,0.4)";
      this.ctx.shadowBlur = 6;
      this.ctx.shadowOffsetY = 2;

      this.ctx.fillStyle = badgeColor;
      this.ctx.beginPath();
      this.ctx.arc(pos.u, pos.v, radius, 0, 2 * Math.PI);
      this.ctx.fill();

      // Border
      this.ctx.shadowColor = "transparent";
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Text Number
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = `bold ${radius - 2}px sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(String(issue.pin_number || 1), pos.u, pos.v);

      // Label title tooltip if selected
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

      // Draw issue's associated markups (clouds, arrows, boxes)
      const markups = issue.viewpoint?.markups || [];
      for (const mk of markups) {
        this.drawSingleMarkup(mk, isSelected);
      }
    }

    // Draw active draft markups
    for (const dmk of this.draftMarkups) {
      this.drawSingleMarkup(dmk, true);
    }
  }

  private drawSingleMarkup(mk: BCFAssociatedMarkup, isSelected: boolean) {
    this.ctx.save();
    this.ctx.strokeStyle = mk.color || (isSelected ? "#ff3b30" : "#ff9500");
    this.ctx.lineWidth = isSelected ? 2.5 : 1.5;

    if (mk.type === "box" && mk.x !== undefined && mk.y !== undefined && mk.width && mk.height) {
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

      // Arrowhead
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

  private bindEvents() {
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

      // Pan world position (screen dx converts to world delta)
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

      // World point under cursor before zoom
      const worldBefore = this.screenToWorld(mouseU, mouseV);

      // Adjust zoom factor
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      this.zoom = Math.max(Math.min(this.zoom * zoomFactor, 20.0), 1e-5);

      // World point under cursor after zoom
      const worldAfter = this.screenToWorld(mouseU, mouseV);

      // Compensate pan so world point stays exactly under cursor
      this.panX += worldBefore.x - worldAfter.x;
      this.panY += worldBefore.y - worldAfter.y;

      this.render();
    }, { passive: false });

    window.addEventListener("resize", () => this.resize());
  }
}
