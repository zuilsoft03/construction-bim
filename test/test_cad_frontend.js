/**
 * Comprehensive Automated Test Suite for CAD (DWG/DXF) Vector Engine & BIMcollab BCF Collaboration.
 * Tests group code parsing, ACI 256 color mapping, polyline bulge arc trigonometry,
 * measurement math (distance, area, perimeter, snapping), and BCF 2.1/3.0 serialization.
 */

const assert = require("assert");

// Import compiled or source modules
const {
  calculateBulgeArcPoints,
  parseDXFText,
  ACI_COLOR_MAP,
} = require("../frontend_src/src/cad/dxf_parser_engine");

const {
  CADMeasurementEngine,
} = require("../frontend_src/src/cad/cad_measurement_tools");

console.log("======================================================================");
console.log("Starting CAD Engine & BIMcollab BCF Collaboration Test Suite");
console.log("======================================================================");

let testsPassed = 0;
let testsFailed = 0;

/**
 * Executes a test case and records whether it succeeds or fails.
 * @param {string} description - A description of the test case.
 * @param {Function} fn - The test case to execute.
 */
function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

// ----------------------------------------------------------------------
// 1. ACI 256 Color Palette Tests
// ----------------------------------------------------------------------
test("T1: ACI 256 standard palette mapping", () => {
  assert.strictEqual(ACI_COLOR_MAP[1], "#ff0000", "ACI 1 should be Red");
  assert.strictEqual(ACI_COLOR_MAP[2], "#ffff00", "ACI 2 should be Yellow");
  assert.strictEqual(ACI_COLOR_MAP[3], "#00ff00", "ACI 3 should be Green");
  assert.strictEqual(ACI_COLOR_MAP[4], "#00ffff", "ACI 4 should be Cyan");
  assert.strictEqual(ACI_COLOR_MAP[5], "#0000ff", "ACI 5 should be Blue");
  assert.strictEqual(ACI_COLOR_MAP[6], "#ff00ff", "ACI 6 should be Magenta");
  assert.strictEqual(ACI_COLOR_MAP[7], "#ffffff", "ACI 7 should be White");
  assert.strictEqual(ACI_COLOR_MAP[8], "#808080", "ACI 8 should be Gray");
});

// ----------------------------------------------------------------------
// 2. Polyline Arc Bulge Trigonometric Accuracy
// ----------------------------------------------------------------------
test("T2: Bulge arc calculation for 90-degree circular arc segment", () => {
  // 90-degree counter-clockwise arc from (100, 0) to (0, 100) around center (0, 0), radius 100
  // Included angle theta = 90 deg = pi/2 rad.
  // Bulge = tan(theta / 4) = tan(pi / 8) = sqrt(2) - 1 ≈ 0.41421356
  const p1 = { x: 100, y: 0 };
  const p2 = { x: 0, y: 100 };
  const bulge = Math.tan(Math.PI / 8);

  const arcPoints = calculateBulgeArcPoints(p1, p2, bulge, 32);
  assert.strictEqual(arcPoints.length, 33, "Should produce 33 points for 32 segments");

  // Verify start and end points
  assert(Math.abs(arcPoints[0].x - 100) < 1e-4, "Start point X should be 100");
  assert(Math.abs(arcPoints[0].y - 0) < 1e-4, "Start point Y should be 0");
  assert(Math.abs(arcPoints[32].x - 0) < 1e-4, "End point X should be 0");
  assert(Math.abs(arcPoints[32].y - 100) < 1e-4, "End point Y should be 100");

  // Verify all points lie on circle of radius 100 centered at (0, 0)
  for (const pt of arcPoints) {
    const r = Math.sqrt(pt.x * pt.x + pt.y * pt.y);
    assert(Math.abs(r - 100) < 1e-3, `Point (${pt.x}, ${pt.y}) distance ${r} should be 100`);
  }

  // Midpoint of 90-degree arc (45 deg) should be (100 * cos(45°), 100 * sin(45°)) ≈ (70.71, 70.71)
  const mid = arcPoints[16];
  assert(Math.abs(mid.x - 70.71) < 0.1, `Midpoint X ${mid.x} should be ~70.71`);
  assert(Math.abs(mid.y - 70.71) < 0.1, `Midpoint Y ${mid.y} should be ~70.71`);
});

test("T3: Bulge arc calculation for straight line (bulge = 0)", () => {
  const p1 = { x: 0, y: 0 };
  const p2 = { x: 500, y: 500 };
  const pts = calculateBulgeArcPoints(p1, p2, 0);
  assert.strictEqual(pts.length, 2, "Zero bulge should return original two points");
  assert.deepStrictEqual(pts[0], p1);
  assert.deepStrictEqual(pts[1], p2);
});

// ----------------------------------------------------------------------
// 3. DXF Parser Group Code Parsing
// ----------------------------------------------------------------------
test("T4: DXF Parser parses layers, lines, circles, polylines, and extents", () => {
  const sampleDxf = `0
SECTION
2
TABLES
0
TABLE
2
LAYER
0
LAYER
2
A-WALL
62
7
0
LAYER
2
M-DUCT
62
6
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
A-WALL
10
0.0
20
0.0
30
0.0
11
4000.0
21
0.0
31
0.0
0
CIRCLE
8
M-DUCT
10
2000.0
20
1500.0
30
0.0
40
250.0
0
LWPOLYLINE
8
A-WALL
70
1
10
0.0
20
0.0
10
4000.0
20
0.0
10
4000.0
20
3000.0
10
0.0
20
3000.0
0
TEXT
8
A-WALL
1
ROOM 101
10
2000.0
20
1500.0
30
0.0
40
150.0
0
ENDSEC
0
EOF`;

  const parsed = parseDXFText(sampleDxf);
  assert.strictEqual(parsed.status, "success");
  assert.strictEqual(parsed.entity_count, 4);

  // Check layers
  assert.ok(parsed.layers["A-WALL"], "A-WALL layer should exist");
  assert.strictEqual(parsed.layers["A-WALL"].color, "#ffffff");
  assert.ok(parsed.layers["M-DUCT"], "M-DUCT layer should exist");
  assert.strictEqual(parsed.layers["M-DUCT"].color, "#ff00ff");

  // Check extents
  assert.strictEqual(parsed.extents.min.x, 0.0);
  assert.strictEqual(parsed.extents.min.y, 0.0);
  assert.strictEqual(parsed.extents.max.x, 4000.0);
  assert.strictEqual(parsed.extents.max.y, 3000.0);
  assert.strictEqual(parsed.extents.width, 4000.0);
  assert.strictEqual(parsed.extents.height, 3000.0);
});

// ----------------------------------------------------------------------
// 4. Precision CAD Measurement Suite
// ----------------------------------------------------------------------
test("T5: Linear distance measurement with dX, dY, distance and angle", () => {
  const engine = new CADMeasurementEngine();
  const p1 = { x: 1000, y: 1000 };
  const p2 = { x: 4000, y: 5000 }; // 3-4-5 right triangle: dx=3000, dy=4000, d=5000

  const res = engine.measureDistance(p1, p2);
  assert.strictEqual(res.dx, 3000);
  assert.strictEqual(res.dy, 4000);
  assert.strictEqual(res.distance, 5000);
  assert(Math.abs(res.angleDeg - 53.13) < 0.05, `Angle ${res.angleDeg} should be ~53.13°`);
});

test("T6: Polygon Area (Shoelace formula) and Perimeter calculation", () => {
  const engine = new CADMeasurementEngine();
  // 4000 x 3000 mm rectangle -> Area = 12,000,000 mm² = 12 m², Perimeter = 14,000 mm = 14 m
  const poly = [
    { x: 0, y: 0 },
    { x: 4000, y: 0 },
    { x: 4000, y: 3000 },
    { x: 0, y: 3000 },
  ];

  const res = engine.measureArea(poly);
  assert.strictEqual(res.area, 12000000);
  assert.strictEqual(res.perimeter, 14000);

  const formattedArea = engine.formatDimension(res.area, true);
  assert(formattedArea.includes("12"), `Formatted area '${formattedArea}' should contain '12'`);
});

test("T7: Geometric Snapping detects endpoints, midpoints, and centers", () => {
  const engine = new CADMeasurementEngine();
  const entities = [
    {
      type: "LINE",
      layer: "A-WALL",
      start: { x: 1000, y: 1000, z: 0 },
      end: { x: 3000, y: 1000, z: 0 },
    },
    {
      type: "CIRCLE",
      layer: "S-COLS",
      center: { x: 5000, y: 5000, z: 0 },
      radius: 200,
    },
  ];

  // Near endpoint (1005, 1002)
  const snap1 = engine.findSnapTarget({ x: 1005, y: 1002 }, entities, 50);
  assert.ok(snap1, "Should find snap target near endpoint");
  assert.strictEqual(snap1.type, "endpoint");
  assert.strictEqual(snap1.point.x, 1000);
  assert.strictEqual(snap1.point.y, 1000);

  // Near midpoint (2002, 1004)
  const snap2 = engine.findSnapTarget({ x: 2002, y: 1004 }, entities, 50);
  assert.ok(snap2, "Should find snap target near midpoint");
  assert.strictEqual(snap2.type, "midpoint");
  assert.strictEqual(snap2.point.x, 2000);
  assert.strictEqual(snap2.point.y, 1000);

  // Near circle center (5010, 4995)
  const snap3 = engine.findSnapTarget({ x: 5010, y: 4995 }, entities, 50);
  assert.ok(snap3, "Should find snap target near circle center");
  assert.strictEqual(snap3.type, "center");
  assert.strictEqual(snap3.point.x, 5000);
  assert.strictEqual(snap3.point.y, 5000);
});

// ----------------------------------------------------------------------
// 5. BIMcollab BCF Collaboration Viewpoint & Redline Serialization
// ----------------------------------------------------------------------
test("T8: BCF 2D Viewpoint captures camera center, zoom, and layer states", () => {
  const { BCFCollaborationManager } = require("../frontend_src/src/cad/bcf_collaboration_manager");
  const mgr = new BCFCollaborationManager();

  const vp = mgr.captureViewpoint(
    { x: 4500, y: 3200, z: 0 },
    0.25,
    ["A-WALL", "S-COLS", "M-DUCT"],
    [
      { id: "mk_1", type: "pin", pin_number: 1, x: 4500, y: 3200 },
      { id: "mk_2", type: "arrow", start: { x: 4000, y: 3000 }, end: { x: 4500, y: 3200 } },
    ]
  );

  assert.strictEqual(vp.camera.center.x, 4500);
  assert.strictEqual(vp.camera.center.y, 3200);
  assert.strictEqual(vp.camera.zoom, 0.25);
  assert.strictEqual(vp.active_layers.length, 3);
  assert.strictEqual(vp.markups.length, 2);
  assert.strictEqual(vp.markups[0].type, "pin");
  assert.strictEqual(vp.markups[1].type, "arrow");
});

console.log("----------------------------------------------------------------------");
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed.`);
console.log("======================================================================");

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("ALL FRONTEND CAD TESTS PASSED! ✓");
}
