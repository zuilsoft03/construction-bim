// Direct web-ifc -> three.js builder. Loads after web-ifc-api-iife.js (window.WebIFC).
// Exposes window.IFCEngine = { THREE, WebIFC, buildIfcScene }
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const WebIFC = window.WebIFC;

function buildIfcScene(api, modelID) {
  const group = new THREE.Group();
  const meshCount = { total: 0, verts: 0, tris: 0 };
  const wallTypes = [
    WebIFC.IFCWALL, WebIFC.IFCWALLSTANDARDCASE, WebIFC.IFCSLAB, WebIFC.IFCBUILDINGELEMENTPROXY,
    WebIFC.IFCDOOR, WebIFC.IFCWINDOW, WebIFC.IFCCOLUMN, WebIFC.IFCBEAM, WebIFC.IFCMEMBER,
    WebIFC.IFCPLATE, WebIFC.IFCCOVERING, WebIFC.IFCSTAIR, WebIFC.IFCRAILING,
    WebIFC.IFCROOF, WebIFC.IFCCURTAINWALL,
    WebIFC.IFCFOOTING, WebIFC.IFCFURNISHINGELEMENT, WebIFC.IFCSANITARYTERMINAL,
    WebIFC.IFCELEMENT, WebIFC.IFCGRID,
    WebIFC.IFCFLOWSEGMENT, WebIFC.IFCFLOWFITTING, WebIFC.IFCDISTRIBUTIONELEMENT,
  ].filter(t => t !== undefined);

  const geometryCache = new Map();
  const expressMap = new Map();  // expressID -> []meshes

  function getGeometry(modelID, geometryExpressID) {
    if (geometryCache.has(geometryExpressID)) return geometryCache.get(geometryExpressID);
    const g = api.GetGeometry(modelID, geometryExpressID);
    const verts = api.GetVertexArray(g.GetVertexData(), g.GetVertexDataSize());
    const indices = api.GetIndexArray(g.GetIndexData(), g.GetIndexDataSize());
    geometryCache.set(geometryExpressID, { verts, indices });
    return geometryCache.get(geometryExpressID);
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

        const pos = new Float32Array(verts);
        const idx = new Uint32Array(indices);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setIndex(new THREE.BufferAttribute(idx, 1));
        geo.computeVertexNormals();
        const expr = new Float32Array(pos.length / 3);
        for (let k = 0; k < expr.length; k++) expr[k] = expressID;
        geo.setAttribute('expressID', new THREE.BufferAttribute(expr, 1));

        const mat4 = new THREE.Matrix4();
        if (pg.flatTransformation && pg.flatTransformation.length >= 16) {
          mat4.fromArray(pg.flatTransformation);
        } else {
          mat4.identity();
        }

        const opacity = (pg.color && pg.color.w !== undefined) ? pg.color.w : 1.0;
        const isTransparent = opacity < 0.95;
        const material = new THREE.MeshLambertMaterial({
          color: (pg.color && pg.color.x !== undefined)
            ? new THREE.Color(pg.color.x, pg.color.y, pg.color.z)
            : 0x4a90d9,
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
        meshCount.verts += pos.length / 3;
        meshCount.tris += idx.length / 3;
      }
    }
  }

  for (const t of wallTypes) addIfcType(t);
  return { group, expressMap, meshCount };
}

window.IFCEngine = { THREE, WebIFC, buildIfcScene, OrbitControls };
