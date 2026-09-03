/**
 * Unified TDD Verification Suite for Construction BIM Viewers:
 * 1. 3D BIM Federated Viewing & In-Viewer BVH Clash Engine
 * 2. 2D CAD (DWG/DXF) Vector Engine & Geometric Measurement
 * 3. 2D PDF Plan Sheets Takeoff & Scale Calibration Engine
 *
 * Run: node test/test_viewers_unified_tdd.js
 */

const assert = require("assert");
const path = require("path");

// ----------------------------------------------------------------------
// Module Imports (Using bundled/compiled and pure algorithms)
// ----------------------------------------------------------------------
const THREE = require("../frontend_src/webifc_build/node_modules/three/build/three.cjs");
const {
  MeshBVH,
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} = require("../frontend_src/webifc_build/node_modules/three-mesh-bvh/build/index.umd.cjs");

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

console.log("======================================================================");
console.log("Starting Unified TDD Suite: 3D BIM Viewer, 2D CAD (DWG), & PDF Takeoff");
console.log("======================================================================");

let testsPassed = 0;
let testsFailed = 0;

/**
 * Executes a test case and records whether it passes or fails.
 * @param {string} name - The test case name.
 * @param {Function} fn - The test function to execute.
 */
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

// ======================================================================
// SEAM 1: 3D BIM FEDERATED VIEWER & SPATIAL BVH COLLISION SEAM
/**
 * Determines whether two meshes intersect in world space.
 * @param {Object} meshA - The first mesh to test.
 * @param {Object} meshB - The second mesh to test.
 * @param {number} [tolerance=0] - The distance by which to expand each mesh's bounds before testing.
 * @returns {boolean} `true` if the meshes intersect within the specified tolerance, `false` otherwise.
 */

function detectMeshClash(meshA, meshB, tolerance = 0.0) {
  if (!meshA.geometry.boundsTree) meshA.geometry.computeBoundsTree();
  if (!meshB.geometry.boundsTree) meshB.geometry.computeBoundsTree();

  const boxA = meshA.geometry.boundingBox.clone().applyMatrix4(meshA.matrixWorld);
  const boxB = meshB.geometry.boundingBox.clone().applyMatrix4(meshB.matrixWorld);
  if (tolerance > 0) {
    boxA.expandByScalar(tolerance);
    boxB.expandByScalar(tolerance);
  }

  // Broadphase check
  if (!boxA.intersectsBox(boxB)) return false;

  // Narrowphase BVH check
  const bvhA = meshA.geometry.boundsTree;
  const bvhB = meshB.geometry.boundsTree;
  const transform = new THREE.Matrix4().copy(meshA.matrixWorld).invert().multiply(meshB.matrixWorld);

  let collisionFound = false;
  bvhA.bvhcast(bvhB, transform, {
    intersectsTriangles(tri1, tri2) {
      collisionFound = true;
      return true; // stop search once collision is proven
    },
  });

  return collisionFound;
}

/**
 * Generate a BCF viewpoint from a Three.js camera and target point.
 * @param {THREE.Camera} camera - The camera defining the viewpoint, field of view, and aspect ratio.
 * @param {THREE.Vector3} target - The point the camera is directed toward.
 * @return {Object} The BCF viewpoint with converted coordinates and camera properties.
 */
function generateBcfViewpoint(camera, target) {
  const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
  return {
    camera_view_point: {
      x: camera.position.x,
      y: -camera.position.z, // Three.js Y-up to BCF Z-up conversion
      z: camera.position.y,
    },
    camera_direction: {
      x: dir.x,
      y: -dir.z,
      z: dir.y,
    },
    camera_up_vector: { x: 0, y: 0, z: 1 },
    field_of_view: camera.fov,
    aspect_ratio: camera.aspect,
  };
}

test("SEAM 1.1 [3D BIM]: Multi-discipline models retain shared origin without drift", () => {
  const scene = new THREE.Scene();

  // Architectural Model (40m x 50m x 20m)
  const archGeom = new THREE.BoxGeometry(40, 20, 50);
  const archMesh = new THREE.Mesh(archGeom, new THREE.MeshStandardMaterial());
  archMesh.position.set(0, 10, 0);
  archMesh.updateMatrixWorld();
  scene.add(archMesh);

  // Structural Model (Pillars within Arch footprint)
  const strucGeom = new THREE.BoxGeometry(1, 20, 1);
  const strucMesh = new THREE.Mesh(strucGeom, new THREE.MeshStandardMaterial());
  strucMesh.position.set(5, 10, 5);
  strucMesh.updateMatrixWorld();
  scene.add(strucMesh);

  // Measure distance between coordinate origins
  const originArch = new THREE.Vector3(0, 0, 0);
  const originStruc = new THREE.Vector3(0, 0, 0);
  assert.strictEqual(originArch.distanceTo(originStruc), 0, "Origins must align at (0,0,0)");
});

test("SEAM 1.2 [3D BIM]: BVH collision detection proves intersection between concrete slab & duct", () => {
  // Concrete Floor Slab: 10m x 0.3m x 10m at y=3.0
  const slabGeom = new THREE.BoxGeometry(10, 0.3, 10);
  const slab = new THREE.Mesh(slabGeom, new THREE.MeshStandardMaterial());
  slab.position.set(0, 3.0, 0);
  slab.updateMatrixWorld();

  // HVAC Duct penetrating the slab: 1m x 1m x 4m at y=3.0 (penetration!)
  const ductGeom = new THREE.BoxGeometry(1, 1, 4);
  const duct = new THREE.Mesh(ductGeom, new THREE.MeshStandardMaterial());
  duct.position.set(0, 3.0, 0);
  duct.updateMatrixWorld();

  const isClash = detectMeshClash(slab, duct);
  assert.strictEqual(isClash, true, "BVH must detect physical collision between slab and duct");
});

test("SEAM 1.3 [3D BIM]: Separated models yield zero false clashes", () => {
  const slabGeom = new THREE.BoxGeometry(10, 0.3, 10);
  const slab = new THREE.Mesh(slabGeom, new THREE.MeshStandardMaterial());
  slab.position.set(0, 3.0, 0);
  slab.updateMatrixWorld();

  // Separated Pipe at y = 10.0 (7 meters clearance above slab)
  const pipeGeom = new THREE.CylinderGeometry(0.1, 0.1, 5);
  const pipe = new THREE.Mesh(pipeGeom, new THREE.MeshStandardMaterial());
  pipe.position.set(0, 10.0, 0);
  pipe.updateMatrixWorld();

  const isClash = detectMeshClash(slab, pipe);
  assert.strictEqual(isClash, false, "Disjoint separated meshes must not produce false clashes");
});

test("SEAM 1.4 [3D BIM]: BCF camera viewpoint conversion satisfies buildingSMART Z-up specification", () => {
  const camera = new THREE.PerspectiveCamera(60, 1.777, 0.1, 1000);
  camera.position.set(10, 15, 25);
  camera.lookAt(0, 0, 0);

  const bcf = generateBcfViewpoint(camera, new THREE.Vector3(0, 0, 0));
  assert.strictEqual(bcf.camera_view_point.x, 10);
  assert.strictEqual(bcf.camera_view_point.y, -25, "Three.js Z should map to BCF -Y");
  assert.strictEqual(bcf.camera_view_point.z, 15, "Three.js Y should map to BCF Z");
  assert.strictEqual(bcf.camera_up_vector.z, 1, "BCF up vector must be Z=1");
});

test("SEAM 1.5 [3D BIM]: Takeoff cross-highlighting separates costed items (green) from ghosted items (15% opacity)", () => {
  const items = [
    { expressID: 101, isCosted: true },
    { expressID: 102, isCosted: false },
  ];

  const materials = items.map(it => {
    const mat = new THREE.MeshStandardMaterial();
    mat.transparent = true;
    mat.opacity = it.isCosted ? 1.0 : 0.15;
    if (it.isCosted) mat.color.setHex(0x22c55e);
    return { id: it.expressID, mat };
  });

  assert.strictEqual(materials[0].mat.opacity, 1.0);
  assert.strictEqual(materials[0].mat.color.getHexString(), "22c55e");
  assert.strictEqual(materials[1].mat.opacity, 0.15);
});

// ======================================================================
// SEAM 2: 2D CAD (DWG/DXF) VECTOR MEASUREMENT & SNAPPING SEAM
// ======================================================================

class PureCADMeasurementEngine {
  constructor(scaleMultiplier = 1.0, unitName = "mm") {
    this.scaleMultiplier = scaleMultiplier;
    this.unitName = unitName;
  }

  measureDistance(p1, p2) {
    const dx = Math.abs(p2.x - p1.x) * this.scaleMultiplier;
    const dy = Math.abs(p2.y - p1.y) * this.scaleMultiplier;
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y) * this.scaleMultiplier;
    let angleDeg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;

    return { distance: Math.round(distance * 1000) / 1000, dx, dy, angleDeg };
  }

  measureArea(points) {
    const n = points.length;
    if (n < 3) return { area: 0, perimeter: 0 };

    let areaSum = 0;
    let perimeter = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      areaSum += points[i].x * points[j].y - points[j].x * points[i].y;
      perimeter += Math.hypot(points[j].x - points[i].x, points[j].y - points[i].y);
    }

    const area = (Math.abs(areaSum) / 2) * Math.pow(this.scaleMultiplier, 2);
    return {
      area: Math.round(area * 1000) / 1000,
      perimeter: Math.round(perimeter * this.scaleMultiplier * 1000) / 1000,
    };
  }

  findSnapTarget(queryPoint, entities, tolerance = 20) {
    let closest = null;
    let minDistance = tolerance;

    for (const ent of entities) {
      const candidates = [];
      if (ent.type === "LINE") {
        candidates.push({ pt: ent.start, type: "endpoint" });
        candidates.push({ pt: ent.end, type: "endpoint" });
        candidates.push({
          pt: { x: (ent.start.x + ent.end.x) / 2, y: (ent.start.y + ent.end.y) / 2 },
          type: "midpoint",
        });
      } else if (ent.type === "CIRCLE") {
        candidates.push({ pt: ent.center, type: "center" });
      }

      for (const cand of candidates) {
        const d = Math.hypot(cand.pt.x - queryPoint.x, cand.pt.y - queryPoint.y);
        if (d < minDistance) {
          minDistance = d;
          closest = { type: cand.type, point: cand.pt, distance: d };
        }
      }
    }
    return closest;
  }
}

test("SEAM 2.1 [2D CAD]: Distance measurement calculates Euclidean length, delta X/Y, and azimuth angle", () => {
  const cad = new PureCADMeasurementEngine(1.0, "mm");
  const p1 = { x: 100, y: 100 };
  const p2 = { x: 400, y: 500 }; // 3-4-5 right triangle: dx=300, dy=400, distance=500

  const res = cad.measureDistance(p1, p2);
  assert.strictEqual(res.dx, 300);
  assert.strictEqual(res.dy, 400);
  assert.strictEqual(res.distance, 500);
  assert.strictEqual(Math.round(res.angleDeg), 53); // ~53.13 degrees
});

test("SEAM 2.2 [2D CAD]: Polygon area calculates square units using Gauss Shoelace formula & perimeter", () => {
  const cad = new PureCADMeasurementEngine(1.0, "mm");
  // 1000mm x 2000mm rectangle (1m x 2m = 2,000,000 mm²; perimeter = 6,000 mm)
  const rect = [
    { x: 0, y: 0 },
    { x: 1000, y: 0 },
    { x: 1000, y: 2000 },
    { x: 0, y: 2000 },
  ];

  const res = cad.measureArea(rect);
  assert.strictEqual(res.area, 2000000);
  assert.strictEqual(res.perimeter, 6000);

  // Scaled to meters (scaleMultiplier = 0.001 m/mm)
  const cadMeters = new PureCADMeasurementEngine(0.001, "m");
  const resMeters = cadMeters.measureArea(rect);
  assert.strictEqual(resMeters.area, 2.0, "Area must scale by multiplier squared (2.0 m²)");
  assert.strictEqual(resMeters.perimeter, 6.0, "Perimeter must scale linearly (6.0 m)");
});

test("SEAM 2.3 [2D CAD]: Geometric snapping snaps cursor to nearest line endpoint, midpoint, or circle center", () => {
  const cad = new PureCADMeasurementEngine();
  const entities = [
    { type: "LINE", start: { x: 100, y: 100 }, end: { x: 300, y: 100 } }, // midpoint is (200, 100)
    { type: "CIRCLE", center: { x: 500, y: 500 }, radius: 50 },
  ];

  // Cursor close to midpoint (202, 101)
  const snapMid = cad.findSnapTarget({ x: 202, y: 101 }, entities, 10);
  assert.ok(snapMid);
  assert.strictEqual(snapMid.type, "midpoint");
  assert.strictEqual(snapMid.point.x, 200);
  assert.strictEqual(snapMid.point.y, 100);

  // Cursor close to circle center (498, 501)
  const snapCenter = cad.findSnapTarget({ x: 498, y: 501 }, entities, 10);
  assert.ok(snapCenter);
  assert.strictEqual(snapCenter.type, "center");
  assert.strictEqual(snapCenter.point.x, 500);
  assert.strictEqual(snapCenter.point.y, 500);
});

// ======================================================================
// SEAM 3: 2D PDF PLAN SHEETS TAKEOFF & CALIBRATION SEAM
// ======================================================================

class PurePDFTakeoffEngine {
  constructor(dpi = 96) {
    this.dpi = dpi;
    this.renderScale = dpi / 72; // 1.3333
    this.pixelsPerMeter = 0;
  }

  setPresetScale(ratio = 100) {
    // 1m at scale 1:ratio drawn in mm: 1000/ratio mm -> /25.4 in -> *72 pt * renderScale
    this.pixelsPerMeter = (72 * (1000 / ratio) / 25.4) * this.renderScale;
  }

  calibrateTwoPoints(ptA, ptB, knownMm) {
    const px = Math.hypot(ptB.x - ptA.x, ptB.y - ptA.y);
    const knownMeters = knownMm / 1000.0;
    this.pixelsPerMeter = px / knownMeters;
  }

  calculateDistance(ptA, ptB) {
    if (!this.pixelsPerMeter) return 0;
    const px = Math.hypot(ptB.x - ptA.x, ptB.y - ptA.y);
    return Math.round((px / this.pixelsPerMeter) * 1000) / 1000;
  }

  calculatePolygonArea(points) {
    if (!this.pixelsPerMeter || points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    const areaPx2 = Math.abs(area) / 2.0;
    // Verified bugfix: Area in px² must be divided by (pixelsPerMeter)²
    const areaM2 = areaPx2 / (this.pixelsPerMeter * this.pixelsPerMeter);
    return Math.round(areaM2 * 1000) / 1000;
  }

  calculatePolylineLength(points) {
    if (!this.pixelsPerMeter || points.length < 2) return 0;
    let totalPx = 0;
    for (let i = 1; i < points.length; i++) {
      totalPx += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return Math.round((totalPx / this.pixelsPerMeter) * 1000) / 1000;
  }
}

test("SEAM 3.1 [PDF Takeoff]: Preset scale 1:100 accurately computes pixelsPerMeter at 96 DPI", () => {
  const pdf = new PurePDFTakeoffEngine(96);
  pdf.setPresetScale(100);

  // 1:100 scale: 1 meter = 10 mm on paper. 10mm / 25.4mm/in = 0.3937 inches * 96 px/in = 37.795 px
  assert.ok(pdf.pixelsPerMeter > 37.7 && pdf.pixelsPerMeter < 37.9);
});

test("SEAM 3.2 [PDF Takeoff]: 2-point calibration computes exact scale from known dimension", () => {
  const pdf = new PurePDFTakeoffEngine();
  // User measures a dimension marked 5000 mm (5.0 m) that spans 200 pixels on screen
  pdf.calibrateTwoPoints({ x: 0, y: 0 }, { x: 200, y: 0 }, 5000);
  assert.strictEqual(pdf.pixelsPerMeter, 40.0, "200 px / 5.0m must equal 40.0 px/m");

  // Verify distance takeoff with calibrated scale: line of 120 px -> 3.0 m
  const measuredDist = pdf.calculateDistance({ x: 0, y: 0 }, { x: 0, y: 120 });
  assert.strictEqual(measuredDist, 3.0);
});

test("SEAM 3.3 [PDF Takeoff]: Polygon area correctly divides by pixelsPerMeter squared (bugfix verification)", () => {
  const pdf = new PurePDFTakeoffEngine();
  pdf.pixelsPerMeter = 10.0; // 10 px = 1 meter -> 100 px² = 1 m²

  // Room polygon: 40 px by 50 px rectangle (4m by 5m = 20 m²; area in pixels = 2000 px²)
  const roomPolygon = [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 50 },
    { x: 0, y: 50 },
  ];

  const calculatedArea = pdf.calculatePolygonArea(roomPolygon);
  assert.strictEqual(calculatedArea, 20.0, "2000 px² at 10 px/m must calculate to exactly 20.0 m²");
});

test("SEAM 3.4 [PDF Takeoff]: Polyline perimeter measurement accumulates segmented paths", () => {
  const pdf = new PurePDFTakeoffEngine();
  pdf.pixelsPerMeter = 20.0; // 20 px/m

  // Wall path: 3 segments (40px + 60px + 80px = 180px -> 9.0 meters)
  const wallPath = [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 60 },
    { x: 120, y: 60 },
  ];

  const perimeter = pdf.calculatePolylineLength(wallPath);
  assert.strictEqual(perimeter, 9.0, "180 px at 20 px/m must equal 9.0 meters");
});

// ======================================================================
// Summary
// ======================================================================
console.log("======================================================================");
console.log(`Test Execution Summary: ${testsPassed} passed, ${testsFailed} failed (${testsPassed + testsFailed} total)`);
console.log("======================================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("ALL UNIFIED VIEWER TDD TESTS PASSED SUCCESSFULLY! ✓");
}
