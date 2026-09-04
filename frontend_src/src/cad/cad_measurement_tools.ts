/**
 * Precision CAD Measurement & Snapping Engine.
 * Supports distance dimensions (dX, dY, distance, angle), polygon area & perimeter,
 * scale calibration, and geometric snapping (endpoints, midpoints, centers).
 */

import { CADPoint, CADEntity, calculateBulgeArcPoints } from "./dxf_parser_engine";

export interface SnapTarget {
  type: "endpoint" | "midpoint" | "center" | "intersection";
  point: CADPoint;
  distance: number;
}

export interface DistanceMeasurement {
  p1: CADPoint;
  p2: CADPoint;
  distance: number;
  dx: number;
  dy: number;
  angleDeg: number;
}

export interface AreaMeasurement {
  points: CADPoint[];
  area: number;
  perimeter: number;
}

export class CADMeasurementEngine {
  public scaleMultiplier: number = 1.0; // 1 drawing unit = 1 mm by default
  public unitName: string = "mm";

  /**
   * Calculate distance, dx, dy, and angle between two CAD points.
   */
  public measureDistance(p1: CADPoint, p2: CADPoint): DistanceMeasurement {
    const dx = Math.abs(p2.x - p1.x) * this.scaleMultiplier;
    const dy = Math.abs(p2.y - p1.y) * this.scaleMultiplier;
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * this.scaleMultiplier;
    const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let angleDeg = (rad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;

    return {
      p1,
      p2,
      distance,
      dx,
      dy,
      angleDeg,
    };
  }

  /**
   * Calculate area using Gauss Shoelace formula and perimeter from polygon vertices.
   */
  public measureArea(points: CADPoint[]): AreaMeasurement {
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

    const area = (Math.abs(areaSum) / 2) * Math.pow(this.scaleMultiplier, 2);
    perimeter = perimeter * this.scaleMultiplier;

    return {
      points,
      area,
      perimeter,
    };
  }

  /**
   * Find nearest geometric snap point (endpoint, midpoint, center) within pixel/world tolerance.
   */
  public findSnapTarget(
    queryPoint: CADPoint,
    entities: CADEntity[],
    tolerance: number = 200
  ): SnapTarget | null {
    let closest: SnapTarget | null = null;
    let minDistance = tolerance;

    function checkCandidate(pt: CADPoint, type: SnapTarget["type"]) {
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
  public formatDimension(val: number, isArea: boolean = false): string {
    if (isArea) {
      if (this.unitName === "mm") {
        // Convert to m^2
        const m2 = val / 1_000_000;
        return `${m2.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} m²`;
      }
      return `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${this.unitName}²`;
    }

    if (this.unitName === "mm" && val >= 1000) {
      const m = val / 1000;
      return `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })} mm (${m.toFixed(2)} m)`;
    }

    return `${val.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${this.unitName}`;
  }
}
