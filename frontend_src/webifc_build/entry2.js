// Direct web-ifc -> three.js builder. Loads after web-ifc-api-iife.js (window.WebIFC).
// Exposes window.IFCEngine = { THREE, WebIFC, buildIfcScene, OrbitControls, MeshBVH, computeBoundsTree, disposeBoundsTree, acceleratedRaycast, detectClashes, generateBcfViewpoint, createCentroidMarker, createIntersectionBoxHelper }
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshBVH, computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// Attach BVH acceleration to Three.js prototypes
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const WebIFC = window.WebIFC;

function buildIfcScene(api, modelID, options = {}) {
  const group = new THREE.Group();
  const modelName = options.modelName || 'Model';
  const discipline = options.discipline || 'Architecture';
  group.name = `ModelGroup_${discipline}_${modelName}`;
  group.userData.modelID = modelID;
  group.userData.modelName = modelName;
  group.userData.discipline = discipline;

  const meshCount = { total: 0, verts: 0, tris: 0 };
  const elementTypes = [
    // Architectural & Structural
    WebIFC.IFCWALL, WebIFC.IFCWALLSTANDARDCASE, WebIFC.IFCSLAB, WebIFC.IFCBUILDINGELEMENTPROXY,
    WebIFC.IFCDOOR, WebIFC.IFCWINDOW, WebIFC.IFCCOLUMN, WebIFC.IFCBEAM, WebIFC.IFCMEMBER,
    WebIFC.IFCPLATE, WebIFC.IFCCOVERING, WebIFC.IFCSTAIR, WebIFC.IFCSTAIRFLIGHT, WebIFC.IFCRAILING,
    WebIFC.IFCROOF, WebIFC.IFCCURTAINWALL, WebIFC.IFCFOOTING, WebIFC.IFCFURNISHINGELEMENT,
    WebIFC.IFCSANITARYTERMINAL, WebIFC.IFCELEMENT, WebIFC.IFCGRID, WebIFC.IFCSPACE,
    WebIFC.IFCREINFORCINGBAR, WebIFC.IFCREINFORCINGMESH, WebIFC.IFCPILE, WebIFC.IFCTENDON,
    WebIFC.IFCFOUNDATION, WebIFC.IFCRAMP, WebIFC.IFCRAMPFLIGHT, WebIFC.IFCSTRUCTURALCURVEMEMBER,
    WebIFC.IFCSTRUCTURALSURFACEMEMBER, WebIFC.IFCSTRUCTURALSECTION,

    // MEP / HVAC / Piping / Electrical
    WebIFC.IFCDUCTSEGMENT, WebIFC.IFCDUCTFITTING, WebIFC.IFCPIPESEGMENT, WebIFC.IFCPIPEFITTING,
    WebIFC.IFCAIRTERMINAL, WebIFC.IFCVALVE, WebIFC.IFCDAMPER, WebIFC.IFCFLOWSEGMENT, WebIFC.IFCFLOWFITTING,
    WebIFC.IFCFLOWTERMINAL, WebIFC.IFCFLOWCONTROLLER, WebIFC.IFCFLOWMETER, WebIFC.IFCFLOWSTORAGEDEVICE,
    WebIFC.IFCFLOWTREATMENTDEVICE, WebIFC.IFCENERGYCONVERSIONDEVICE, WebIFC.IFCDISTRIBUTIONELEMENT,
    WebIFC.IFCDISTRIBUTIONPORT, WebIFC.IFCDISTRIBUTIONFLOWELEMENT, WebIFC.IFCDISTRIBUTIONCONTROLELEMENT,
    WebIFC.IFCPUMP, WebIFC.IFCTANK, WebIFC.IFCFAN, WebIFC.IFCBOILER, WebIFC.IFCAIRTOAIRHEATRECOVERY,
    WebIFC.IFCUNITARYEQUIPMENT, WebIFC.IFCSENSOR, WebIFC.IFCACTUATOR, WebIFC.IFCALARM, WebIFC.IFCCONTROLLER,
    WebIFC.IFCFIREPROTECTIONTERMINAL, WebIFC.IFCLIGHTFIXTURE, WebIFC.IFCELECTRICAPPLIANCE,
    WebIFC.IFCELECTRICDISTRIBUTIONBOARD, WebIFC.IFCELECTRICFLOWSTORAGEDEVICE, WebIFC.IFCELECTRICGENERATOR,
    WebIFC.IFCELECTRICMOTOR, WebIFC.IFCELECTRICTIMECONTROL, WebIFC.IFCSWITCHINGDEVICE,
    WebIFC.IFCAUDIOVISUALAPPLIANCE, WebIFC.IFCCOMMUNICATIONAPPLIANCE, WebIFC.IFCCABLECARRIERSEGMENT,
    WebIFC.IFCCABLECARRIERFITTING, WebIFC.IFCCABLESEGMENT, WebIFC.IFCCABLEFITTING, WebIFC.IFCJUNCTIONBOX,
    WebIFC.IFCCOMPRESSOR, WebIFC.IFCCONDENSER, WebIFC.IFCCOOLINGTOWER, WebIFC.IFCENGINE,
    WebIFC.IFCEVAPORATIVECOOLER, WebIFC.IFCEVAPORATOR, WebIFC.IFCHEATEXCHANGER, WebIFC.IFCHUMIDIFIER,
    WebIFC.IFCMEDICALDEVICE, WebIFC.IFCMAP, WebIFC.IFCSOLARDEVICE, WebIFC.IFCTUBEBUNDLE,
    WebIFC.IFCUNITARYCONTROLELEMENT, WebIFC.IFCVIBRATIONISOLATOR,
  ].filter(t => t !== undefined);

  const geometryCache = new Map();
  const expressMap = new Map();  // expressID -> []meshes

  function getGeometry(modelID, geometryExpressID) {
    if (geometryCache.has(geometryExpressID)) return geometryCache.get(geometryExpressID);
    const g = api.GetGeometry(modelID, geometryExpressID);
    const rawVerts = api.GetVertexArray(g.GetVertexData(), g.GetVertexDataSize());
    const rawIndices = api.GetIndexArray(g.GetIndexData(), g.GetIndexDataSize());
    // In web-ifc, vertexData is interleaved with 6 floats per vertex: [x, y, z, nx, ny, nz]
    // Copy into plain typed arrays before deleting WASM geometry
    const verts = new Float32Array(rawVerts);
    const indices = new Uint32Array(rawIndices);
    g.delete(); // Free WASM memory
    const cached = { verts, indices };
    geometryCache.set(geometryExpressID, cached);
    return cached;
  }

  function addIfcType(type) {
    let ids;
    try { ids = api.GetLineIDsWithType(modelID, type, false); }
    catch (e) { return; }
    if (!ids || !ids.size) return;
    for (let i = 0; i < ids.size(); i++) {
      const expressID = ids.get(i);
      let flat;
      try { flat = api.GetFlatMesh(modelID, expressID); }
      catch (e) { continue; }
      if (!flat) continue;
      for (let gi = 0; gi < flat.geometries.size(); gi++) {
        const pg = flat.geometries.get(gi);
        const { verts, indices } = getGeometry(modelID, pg.geometryExpressID);
        if (!verts || !indices || !indices.length) continue;

        // web-ifc raw vertex format: 6 floats per vertex:
        // [vx, vy, vz, nx, ny, nz]
        // De-interleave into separate position (3 floats) and normal (3 floats)
        const numVerts = verts.length / 6;
        const posFloats = new Float32Array(numVerts * 3);
        const normFloats = new Float32Array(numVerts * 3);
        const exprFloats = new Float32Array(numVerts);

        for (let v = 0; v < numVerts; v++) {
          const src = v * 6;
          const dst = v * 3;
          posFloats[dst]     = verts[src];
          posFloats[dst + 1] = verts[src + 1];
          posFloats[dst + 2] = verts[src + 2];
          normFloats[dst]     = verts[src + 3];
          normFloats[dst + 1] = verts[src + 4];
          normFloats[dst + 2] = verts[src + 5];
          exprFloats[v]       = expressID;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(posFloats, 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(normFloats, 3));
        geo.setAttribute('expressID', new THREE.BufferAttribute(exprFloats, 1));
        geo.setIndex(new THREE.BufferAttribute(indices, 1));
        geo.computeBoundingBox();
        geo.computeBoundingSphere();

        const mat4 = new THREE.Matrix4();
        if (pg.flatTransformation && pg.flatTransformation.length >= 16) {
          mat4.fromArray(pg.flatTransformation);
        } else {
          mat4.identity();
        }

        const color = pg.color;
        const opacity = (color && color.w !== undefined) ? color.w : 1.0;
        const isTransparent = opacity < 0.95;
        const material = new THREE.MeshLambertMaterial({
          color: (color && color.x !== undefined)
            ? new THREE.Color().setRGB(color.x, color.y, color.z, 'srgb')
            : new THREE.Color(0xd0c0a0),
          side: THREE.DoubleSide,
          transparent: isTransparent,
          opacity: isTransparent ? (opacity > 0.01 ? Math.max(opacity, 0.25) : 0.0) : 1.0,
          depthWrite: !isTransparent,
        });

        const mesh = new THREE.Mesh(geo, material);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(mat4);
        mesh.matrixWorld.copy(mat4);
        mesh.frustumCulled = false;
        mesh.userData.expressID = expressID;
        mesh.userData.ifcType = type;
        mesh.userData.modelID = modelID;
        mesh.userData.modelName = modelName;
        mesh.userData.discipline = discipline;
        group.add(mesh);

        if (!expressMap.has(expressID)) expressMap.set(expressID, []);
        expressMap.get(expressID).push(mesh);
        meshCount.total++;
        meshCount.verts += numVerts;
        meshCount.tris += indices.length / 3;
      }
    }
  }

  for (const t of elementTypes) addIfcType(t);
  return { group, expressMap, meshCount };
}

/**
 * Detect geometric clashes between two groups of Three.js meshes using BVH.
 * @param {THREE.Group|Array<THREE.Mesh>} sourceA - First model / discipline group or meshes
 * @param {THREE.Group|Array<THREE.Mesh>} sourceB - Second model / discipline group or meshes
 * @param {Object} options - { tolerance: 0.0, maxClashes: 500 }
 * @returns {Object} { clashes, stats }
 */
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

  // Pre-calculate world bounding boxes for broadphase
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

      // Broadphase AABB overlap test
      if (!boxA.intersectsBox(boxB)) continue;

      narrowphaseCount++;
      // Ensure BVH tree exists on both geometries
      if (!meshA.geometry.boundsTree) {
        meshA.geometry.computeBoundsTree();
      }
      if (!meshB.geometry.boundsTree) {
        meshB.geometry.computeBoundsTree();
      }

      // Compute relative transformation matrix from B into A's local space
      const matrixToLocal = new THREE.Matrix4()
        .copy(meshA.matrixWorld)
        .invert()
        .multiply(meshB.matrixWorld);

      // Narrowphase triangle collision
      const intersects = meshA.geometry.boundsTree.intersectsGeometry(meshB.geometry, matrixToLocal);

      if (intersects) {
        // Calculate intersection bounding box
        const isectBox = boxA.clone().intersect(boxB);
        const centroid = isectBox.getCenter(new THREE.Vector3());
        const size = isectBox.getSize(new THREE.Vector3());
        const volume = size.x * size.y * size.z;
        const depth = Math.min(size.x, size.y, size.z);

        // Classify severity
        let severity = 'Minor';
        if (depth >= 0.05 || volume >= 0.005) {
          severity = 'Critical';
        } else if (depth >= 0.015 || volume >= 0.0005) {
          severity = 'Major';
        }

        const clashId = `CLASH-${clashes.length + 1}`;
        const clash = {
          id: clashId,
          elementA: {
            expressID: meshA.userData.expressID,
            ifcType: meshA.userData.ifcType,
            modelID: meshA.userData.modelID,
            modelName: meshA.userData.modelName || 'Model A',
            discipline: meshA.userData.discipline || 'Discipline A',
            guid: meshA.userData.guid || '',
            mesh: meshA,
          },
          elementB: {
            expressID: meshB.userData.expressID,
            ifcType: meshB.userData.ifcType,
            modelID: meshB.userData.modelID,
            modelName: meshB.userData.modelName || 'Model B',
            discipline: meshB.userData.discipline || 'Discipline B',
            guid: meshB.userData.guid || '',
            mesh: meshB,
          },
          collisionPoint: { x: centroid.x, y: centroid.y, z: centroid.z },
          boundingBox: {
            min: { x: isectBox.min.x, y: isectBox.min.y, z: isectBox.min.z },
            max: { x: isectBox.max.x, y: isectBox.max.y, z: isectBox.max.z },
          },
          penetrationDepth: depth * 1000, // in mm
          intersectionVolume: volume,     // in m3
          severity,
          status: 'Open',
        };

        clashes.push(clash);
        if (clashes.length >= maxClashes) break;
      }
    }
    if (clashes.length >= maxClashes) break;
  }

  return {
    clashes,
    stats: {
      pairsTested: broadphaseCount,
      narrowphaseChecks: narrowphaseCount,
      clashCount: clashes.length,
    }
  };
}

function generateBcfViewpoint(camera, controls, clash, options = {}) {
  const target = controls && controls.target
    ? controls.target.clone()
    : (clash && clash.collisionPoint
        ? new THREE.Vector3(clash.collisionPoint.x, clash.collisionPoint.y, clash.collisionPoint.z)
        : new THREE.Vector3(0, 0, 0));
  const position = camera ? camera.position.clone() : new THREE.Vector3(target.x + 3, target.y + 2, target.z + 3);
  const up = camera ? camera.up.clone() : new THREE.Vector3(0, 1, 0);

  const guidA = (clash && clash.elementA && clash.elementA.guid) || '';
  const guidB = (clash && clash.elementB && clash.elementB.guid) || '';

  return {
    viewpoint_guid: options.guid || ('bcf-vp-' + Math.random().toString(36).substr(2, 9)),
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
    clash_point: clash ? clash.collisionPoint : { x: 0, y: 0, z: 0 },
    bounding_box: clash ? clash.boundingBox : null,
    snapshot: options.snapshot || null,
  };
}

function createCentroidMarker(pos, color = 0xff2222) {
  const group = new THREE.Group();
  group.name = 'ClashCentroidMarker';
  
  // Outer diamond wireframe
  const diamondGeo = new THREE.OctahedronGeometry(0.35, 0);
  const diamondMat = new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true });
  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  group.add(diamond);

  // Inner glowing core sphere
  const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(sphere);

  // Vertical indicator pin line
  const points = [new THREE.Vector3(0, -0.8, 0), new THREE.Vector3(0, 0.8, 0)];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffdd00, linewidth: 2 });
  const line = new THREE.Line(lineGeo, lineMat);
  group.add(line);

  if (pos) group.position.set(pos.x, pos.y, pos.z);
  return group;
}

function createIntersectionBoxHelper(boxData, color = 0xf43f5e) {
  if (!boxData || !boxData.min || !boxData.max) return null;
  const min = new THREE.Vector3(boxData.min.x, boxData.min.y, boxData.min.z);
  const max = new THREE.Vector3(boxData.max.x, boxData.max.y, boxData.max.z);
  const box3 = new THREE.Box3(min, max);
  const helper = new THREE.Box3Helper(box3, color);
  helper.name = 'ClashBoxHelper';
  return helper;
}

window.IFCEngine = {
  THREE,
  WebIFC,
  buildIfcScene,
  OrbitControls,
  MeshBVH,
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
  detectClashes,
  generateBcfViewpoint,
  createCentroidMarker,
  createIntersectionBoxHelper,
};
