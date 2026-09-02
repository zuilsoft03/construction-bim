// Direct web-ifc -> three.js builder. Loads after web-ifc-api-iife.js (window.WebIFC).
// Exposes window.IFCEngine = { THREE, WebIFC, buildIfcScene }
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const WebIFC = window.WebIFC;

function buildIfcScene(api, modelID) {
  const group = new THREE.Group();
  const meshCount = { total: 0, verts: 0, tris: 0 };
  const elementTypes = [
    WebIFC.IFCWALL, WebIFC.IFCWALLSTANDARDCASE, WebIFC.IFCSLAB, WebIFC.IFCBUILDINGELEMENTPROXY,
    WebIFC.IFCDOOR, WebIFC.IFCWINDOW, WebIFC.IFCCOLUMN, WebIFC.IFCBEAM, WebIFC.IFCMEMBER,
    WebIFC.IFCPLATE, WebIFC.IFCCOVERING, WebIFC.IFCSTAIR, WebIFC.IFCSTAIRFLIGHT, WebIFC.IFCRAILING,
    WebIFC.IFCROOF, WebIFC.IFCCURTAINWALL,
    WebIFC.IFCFOOTING, WebIFC.IFCFURNISHINGELEMENT, WebIFC.IFCSANITARYTERMINAL,
    WebIFC.IFCELEMENT, WebIFC.IFCGRID,
    WebIFC.IFCFLOWSEGMENT, WebIFC.IFCFLOWFITTING, WebIFC.IFCFLOWTERMINAL, WebIFC.IFCDISTRIBUTIONELEMENT,
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
          opacity: isTransparent ? Math.max(opacity, 0.25) : 1.0,
          depthWrite: !isTransparent,
        });

        const mesh = new THREE.Mesh(geo, material);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(mat4);
        mesh.frustumCulled = false;
        mesh.userData.expressID = expressID;
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

window.IFCEngine = { THREE, WebIFC, buildIfcScene, OrbitControls };
