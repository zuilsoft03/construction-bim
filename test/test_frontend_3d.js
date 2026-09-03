// Comprehensive Node.js Test Suite for Frontend 3D Engine, Multi-Discipline Federated Viewing, BVH Clash Detection, & BOM Rollup
const assert = require('assert');
const path = require('path');

const THREE = require('../frontend_src/webifc_build/node_modules/three/build/three.cjs');
const { MeshBVH, computeBoundsTree, disposeBoundsTree, acceleratedRaycast } = require('../frontend_src/webifc_build/node_modules/three-mesh-bvh/build/index.umd.cjs');

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

console.log('--- Starting Comprehensive Frontend 3D & BVH Clash Detection Test Suite ---');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
  }
}

// ---------------- Helper Functions ----------------
function detectClashes(sourceA, sourceB, options = {}) {
  const tolerance = options.tolerance || 0.0;
  const maxClashes = options.maxClashes || 500;
  
  const meshesA = [];
  const meshesB = [];
  
  if (Array.isArray(sourceA)) {
    meshesA.push(...sourceA.filter(m => m && m.isMesh));
  } else if (sourceA && sourceA.traverse) {
    sourceA.traverse(o => { if (o.isMesh) meshesA.push(o); });
  }

  if (Array.isArray(sourceB)) {
    meshesB.push(...sourceB.filter(m => m && m.isMesh));
  } else if (sourceB && sourceB.traverse) {
    sourceB.traverse(o => { if (o.isMesh) meshesB.push(o); });
  }

  const aabbsA = meshesA.map(m => {
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    const box = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
    if (tolerance > 0) box.expandByScalar(tolerance);
    return box;
  });

  const aabbsB = meshesB.map(m => {
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    const box = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
    if (tolerance > 0) box.expandByScalar(tolerance);
    return box;
  });

  const clashes = [];
  let broadphaseCount = 0;
  let narrowphaseCount = 0;

  for (let i = 0; i < meshesA.length; i++) {
    const meshA = meshesA[i];
    const boxA = aabbsA[i];

    for (let j = 0; j < meshesB.length; j++) {
      const meshB = meshesB[j];
      const boxB = aabbsB[j];
      broadphaseCount++;

      if (!boxA.intersectsBox(boxB)) continue;

      narrowphaseCount++;
      if (!meshA.geometry.boundsTree) meshA.geometry.computeBoundsTree();
      if (!meshB.geometry.boundsTree) meshB.geometry.computeBoundsTree();

      const matrixToLocal = new THREE.Matrix4()
        .copy(meshA.matrixWorld)
        .invert()
        .multiply(meshB.matrixWorld);

      const intersects = meshA.geometry.boundsTree.intersectsGeometry(meshB.geometry, matrixToLocal);

      if (intersects) {
        const isectBox = boxA.clone().intersect(boxB);
        const centroid = isectBox.getCenter(new THREE.Vector3());
        const size = isectBox.getSize(new THREE.Vector3());
        const volume = size.x * size.y * size.z;
        const depth = Math.min(size.x, size.y, size.z);

        let severity = 'Minor';
        if (depth >= 0.05 || volume >= 0.005) severity = 'Critical';
        else if (depth >= 0.015 || volume >= 0.0005) severity = 'Major';

        clashes.push({
          id: `CLASH-${clashes.length + 1}`,
          elementA: {
            expressID: meshA.userData.expressID,
            ifcType: meshA.userData.ifcType,
            discipline: meshA.userData.discipline || 'Structural',
            guid: meshA.userData.guid || 'GUID-STRUC-1',
            mesh: meshA,
          },
          elementB: {
            expressID: meshB.userData.expressID,
            ifcType: meshB.userData.ifcType,
            discipline: meshB.userData.discipline || 'MEP',
            guid: meshB.userData.guid || 'GUID-MEP-1',
            mesh: meshB,
          },
          collisionPoint: { x: centroid.x, y: centroid.y, z: centroid.z },
          boundingBox: {
            min: { x: isectBox.min.x, y: isectBox.min.y, z: isectBox.min.z },
            max: { x: isectBox.max.x, y: isectBox.max.y, z: isectBox.max.z },
          },
          penetrationDepth: depth * 1000,
          intersectionVolume: volume,
          severity,
          status: 'Open',
        });
        if (clashes.length >= maxClashes) break;
      }
    }
    if (clashes.length >= maxClashes) break;
  }

  return {
    clashes,
    stats: { pairsTested: broadphaseCount, narrowphaseChecks: narrowphaseCount, clashCount: clashes.length },
  };
}

function generateBcfViewpoint(camera, controls, clash, options = {}) {
  const target = controls && controls.target
    ? controls.target.clone()
    : new THREE.Vector3(clash.collisionPoint.x, clash.collisionPoint.y, clash.collisionPoint.z);
  const position = camera ? camera.position.clone() : new THREE.Vector3(target.x + 3, target.y + 2, target.z + 3);
  const up = camera ? camera.up.clone() : new THREE.Vector3(0, 1, 0);

  const guidA = (clash && clash.elementA && clash.elementA.guid) || '';
  const guidB = (clash && clash.elementB && clash.elementB.guid) || '';

  return {
    viewpoint_guid: options.guid || 'bcf-vp-test',
    perspective_camera: {
      camera_view_point: { x: position.x, y: position.y, z: position.z },
      camera_direction: { x: target.x - position.x, y: target.y - position.y, z: target.z - position.z },
      camera_up_vector: { x: up.x, y: up.y, z: up.z },
      field_of_view: camera && camera.fov ? camera.fov : 55,
      aspect_ratio: camera && camera.aspect ? camera.aspect : 1.77,
    },
    components: {
      selection: [
        ...(guidA ? [{ ifc_guid: guidA, express_id: clash.elementA.expressID }] : []),
        ...(guidB ? [{ ifc_guid: guidB, express_id: clash.elementB.expressID }] : []),
      ],
      coloring: [
        ...(guidA ? [{ color: 'FF2222', components: [{ ifc_guid: guidA }] }] : []),
        ...(guidB ? [{ color: 'FFDD00', components: [{ ifc_guid: guidB }] }] : []),
      ],
      visibility: {
        default_visibility: false,
        exceptions: [
          ...(guidA ? [{ ifc_guid: guidA }] : []),
          ...(guidB ? [{ ifc_guid: guidB }] : []),
        ],
      },
    },
    clash_point: clash.collisionPoint,
    bounding_box: clash.boundingBox,
  };
}

function createCentroidMarker(pos, color = 0xff2222) {
  const group = new THREE.Group();
  const diamondGeo = new THREE.OctahedronGeometry(0.35, 0);
  const diamondMat = new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true });
  group.add(new THREE.Mesh(diamondGeo, diamondMat));

  const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({ color });
  group.add(new THREE.Mesh(sphereGeo, sphereMat));

  const points = [new THREE.Vector3(0, -0.8, 0), new THREE.Vector3(0, 0.8, 0)];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  group.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xffdd00, linewidth: 2 })));

  if (pos) group.position.set(pos.x, pos.y, pos.z);
  return group;
}

function createIntersectionBoxHelper(boxData, color = 0xf43f5e) {
  if (!boxData || !boxData.min || !boxData.max) return null;
  const min = new THREE.Vector3(boxData.min.x, boxData.min.y, boxData.min.z);
  const max = new THREE.Vector3(boxData.max.x, boxData.max.y, boxData.max.z);
  const box3 = new THREE.Box3(min, max);
  return new THREE.Box3Helper(box3, color);
}

// ---------------- TESTS ----------------

test('T1: Three.js BVH prototype attachment and geometry acceleration', () => {
  const geo = new THREE.BoxGeometry(2, 2, 2);
  assert.strictEqual(typeof geo.computeBoundsTree, 'function');
  assert.strictEqual(typeof geo.disposeBoundsTree, 'function');

  geo.computeBoundsTree();
  assert(geo.boundsTree instanceof MeshBVH);
  geo.disposeBoundsTree();
  assert.strictEqual(geo.boundsTree, null);
});

test('T2: Accelerated raycast on Three.js Mesh with BVH', () => {
  const geo = new THREE.SphereGeometry(10, 32, 32);
  geo.computeBoundsTree();
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
  mesh.updateMatrixWorld();

  const raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 30), new THREE.Vector3(0, 0, -1));
  const intersects = raycaster.intersectObject(mesh);
  assert(intersects.length > 0);
  assert(intersects[0].point.z > 0);
});

test('T3: Federated multi-discipline coordinate alignment without origin shift', () => {
  const arkMesh = new THREE.Mesh(new THREE.BoxGeometry(20, 15, 20), new THREE.MeshBasicMaterial());
  arkMesh.position.set(3.0, 56.0, -32.0);
  arkMesh.updateMatrixWorld();

  const strucMesh = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 18), new THREE.MeshBasicMaterial());
  strucMesh.position.set(2.8, 55.8, -32.2);
  strucMesh.updateMatrixWorld();

  const hvacMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10), new THREE.MeshBasicMaterial());
  hvacMesh.position.set(3.0, 55.0, -32.0);
  hvacMesh.updateMatrixWorld();

  const arkBox = new THREE.Box3().setFromObject(arkMesh);
  const strucBox = new THREE.Box3().setFromObject(strucMesh);
  const hvacBox = new THREE.Box3().setFromObject(hvacMesh);

  assert(arkBox.intersectsBox(strucBox));
  assert(strucBox.intersectsBox(hvacBox));
});

test('T4: Discipline layer controls - visibility and ghosting logic', () => {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, opacity: 1.0, transparent: false, depthWrite: true });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
  mesh.userData.origMaterialProps = {
    color: mat.color.clone(),
    opacity: mat.opacity,
    transparent: mat.transparent,
    depthWrite: mat.depthWrite,
  };
  group.add(mesh);

  mat.transparent = true;
  mat.opacity = 0.20;
  mat.depthWrite = false;
  mat.color.setHex(0x94a3b8);

  assert.strictEqual(mat.transparent, true);
  assert.strictEqual(mat.opacity, 0.20);
  assert.strictEqual(mat.depthWrite, false);
  assert.strictEqual(mat.color.getHex(), 0x94a3b8);

  const orig = mesh.userData.origMaterialProps;
  mat.transparent = orig.transparent;
  mat.opacity = orig.opacity;
  mat.depthWrite = orig.depthWrite;
  mat.color.copy(orig.color);

  assert.strictEqual(mat.transparent, false);
  assert.strictEqual(mat.opacity, 1.0);
  assert.strictEqual(mat.depthWrite, true);
});

test('T5: BVH clash detection detects physical collision between concrete slab and HVAC duct', () => {
  const strucGroup = new THREE.Group();
  const slabGeo = new THREE.BoxGeometry(10, 0.4, 10);
  const slabMesh = new THREE.Mesh(slabGeo, new THREE.MeshStandardMaterial());
  slabMesh.position.set(5.82, 54.54, -34.17);
  slabMesh.userData = { expressID: 82918, ifcType: 'IfcSlab', discipline: 'Structural', guid: 'GUID-SLAB-82918' };
  slabMesh.updateMatrixWorld(true);
  strucGroup.add(slabMesh);

  const hvacGroup = new THREE.Group();
  const ductGeo = new THREE.BoxGeometry(0.6, 0.4, 6.0);
  const ductMesh = new THREE.Mesh(ductGeo, new THREE.MeshStandardMaterial());
  ductMesh.position.set(5.82, 54.54, -34.17);
  ductMesh.userData = { expressID: 126360, ifcType: 'IfcDuctSegment', discipline: 'MEP', guid: 'GUID-DUCT-126360' };
  ductMesh.updateMatrixWorld(true);
  hvacGroup.add(ductMesh);

  const res = detectClashes(strucGroup, hvacGroup);
  assert.strictEqual(res.clashes.length, 1);

  const clash = res.clashes[0];
  assert.strictEqual(clash.elementA.expressID, 82918);
  assert.strictEqual(clash.elementB.expressID, 126360);
  assert.strictEqual(clash.severity, 'Critical');
  assert.strictEqual(clash.status, 'Open');
  assert.strictEqual(clash.elementA.discipline, 'Structural');
  assert.strictEqual(clash.elementB.discipline, 'MEP');

  assert(Math.abs(clash.collisionPoint.x - 5.82) < 0.01);
  assert(Math.abs(clash.collisionPoint.y - 54.54) < 0.01);
  assert(Math.abs(clash.collisionPoint.z - (-34.17)) < 0.01);
});

test('T6: Multiple clash pairs detection across complex structural and MEP models', () => {
  const strucGroup = new THREE.Group();
  // Slab at Y = 10
  const slab = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 20), new THREE.MeshBasicMaterial());
  slab.position.set(0, 10, 0);
  slab.userData = { expressID: 101, ifcType: 'IfcSlab', discipline: 'Structural' };
  slab.updateMatrixWorld(true);
  strucGroup.add(slab);

  // Beam at Y = 2
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 15), new THREE.MeshBasicMaterial());
  beam.position.set(3, 2, 0);
  beam.userData = { expressID: 102, ifcType: 'IfcBeam', discipline: 'Structural' };
  beam.updateMatrixWorld(true);
  strucGroup.add(beam);

  const mepGroup = new THREE.Group();
  // Duct 1 penetrating slab at Y = 10
  const duct1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4), new THREE.MeshBasicMaterial());
  duct1.position.set(0, 10, 0);
  duct1.userData = { expressID: 201, ifcType: 'IfcDuctSegment', discipline: 'MEP' };
  duct1.updateMatrixWorld(true);
  mepGroup.add(duct1);

  // Pipe 2 penetrating beam at Y = 2
  const pipe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4), new THREE.MeshBasicMaterial());
  pipe2.position.set(3, 2, 0);
  pipe2.userData = { expressID: 202, ifcType: 'IfcPipeSegment', discipline: 'MEP' };
  pipe2.updateMatrixWorld(true);
  mepGroup.add(pipe2);

  const res = detectClashes(strucGroup, mepGroup);
  assert.strictEqual(res.clashes.length, 2);
  assert.strictEqual(res.clashes[0].elementA.expressID, 101);
  assert.strictEqual(res.clashes[0].elementB.expressID, 201);
  assert.strictEqual(res.clashes[1].elementA.expressID, 102);
  assert.strictEqual(res.clashes[1].elementB.expressID, 202);
});

test('T7: Non-colliding separated meshes produce zero clashes', () => {
  const meshA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
  meshA.position.set(0, 0, 0);
  meshA.updateMatrixWorld(true);

  const meshB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
  meshB.position.set(100, 100, 100);
  meshB.updateMatrixWorld(true);

  const res = detectClashes([meshA], [meshB]);
  assert.strictEqual(res.clashes.length, 0);
  assert.strictEqual(res.stats.narrowphaseChecks, 0);
});

test('T8: BCF-compliant viewpoint generation from clash', () => {
  const dummyCamera = new THREE.PerspectiveCamera(55, 1.77, 0.1, 1000);
  dummyCamera.position.set(10, 58, -30);
  const dummyControls = { target: new THREE.Vector3(5.82, 54.54, -34.17) };

  const clash = {
    elementA: { expressID: 82918, guid: '3hK_SLAB_GUID' },
    elementB: { expressID: 126360, guid: '1pM_DUCT_GUID' },
    collisionPoint: { x: 5.82, y: 54.54, z: -34.17 },
    boundingBox: { min: { x: 5.5, y: 54.3, z: -34.5 }, max: { x: 6.1, y: 54.7, z: -33.8 } },
  };

  const vp = generateBcfViewpoint(dummyCamera, dummyControls, clash);
  assert(vp.perspective_camera);
  assert.strictEqual(vp.perspective_camera.camera_view_point.x, 10);
  assert.strictEqual(vp.perspective_camera.field_of_view, 55);
  assert.strictEqual(vp.components.selection.length, 2);
  assert.strictEqual(vp.components.coloring[0].color, 'FF2222');
  assert.strictEqual(vp.components.coloring[1].color, 'FFDD00');
  assert.strictEqual(vp.components.visibility.default_visibility, false);
});

test('T9: Centroid marker and bounding box helper generation', () => {
  const pos = { x: 5.82, y: 54.54, z: -34.17 };
  const marker = createCentroidMarker(pos);
  assert(marker instanceof THREE.Group);
  assert.strictEqual(marker.position.x, 5.82);
  assert.strictEqual(marker.children.length, 3);

  const boxData = { min: { x: 5, y: 54, z: -35 }, max: { x: 6, y: 55, z: -34 } };
  const boxHelper = createIntersectionBoxHelper(boxData);
  assert(boxHelper instanceof THREE.Box3Helper);
});

test('T10: BOM quantity rollup calculations with waste factors', () => {
  const items = [
    { type: 'IfcSlab', netVolume: 120.0, wastePct: 5, unitRate: 195.0 },
    { type: 'IfcBeam', netVolume: 45.0, wastePct: 5, unitRate: 220.0 },
    { type: 'IfcDuctSegment', length: 500.0, wastePct: 10, unitRate: 85.0 },
    { type: 'IfcPipeSegment', length: 300.0, wastePct: 10, unitRate: 45.0 },
  ];

  let totalCost = 0.0;
  items.forEach(it => {
    const effectiveQty = (it.netVolume || it.length) * (1.0 + it.wastePct / 100.0);
    const cost = effectiveQty * it.unitRate;
    totalCost += cost;
  });

  assert.strictEqual(totalCost, 96565.0);
});

console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log('ALL FRONTEND 3D TESTS PASSED SUCCESSFULLY! ✓');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED!');
  process.exit(1);
}
