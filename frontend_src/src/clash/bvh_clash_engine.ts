/**
 * Client-Side BVH Collision Detection Engine for Federated BIM Models.
 * Uses three-mesh-bvh for accelerated broadphase AABB filtering and narrowphase triangle-triangle intersection testing.
 */

export interface ClashResult {
  clashId: string;
  modelA_id: string | number;
  modelA_name: string;
  elementA_expressId: number;
  elementA_guid: string;
  elementA_name: string;
  elementA_type: string;
  elementA_discipline: string;
  meshA: any; // THREE.Mesh

  modelB_id: string | number;
  modelB_name: string;
  elementB_expressId: number;
  elementB_guid: string;
  elementB_name: string;
  elementB_type: string;
  elementB_discipline: string;
  meshB: any; // THREE.Mesh

  collisionCentroid: [number, number, number];
  collisionBoundingBox: {
    min: [number, number, number];
    max: [number, number, number];
  };
  penetrationDepth: number;
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'In Review' | 'Resolved' | 'Closed';
  bcfViewpoint: BCFViewpoint;
}

export interface BCFViewpoint {
  camera_position: [number, number, number];
  camera_target: [number, number, number];
  camera_up: [number, number, number];
  selected_elements: string[]; // GUIDs
  hidden_elements?: string[];
  clash_marker_position: [number, number, number];
}

export interface DisciplineMeshItem {
  mesh: any; // THREE.Mesh
  expressID: number;
  guid: string;
  name: string;
  type: string;
  discipline: string;
  modelName: string;
  modelDocName: string;
}

export class BVHClashEngine {
  private THREE: any;

  constructor(threeInstance?: any) {
    this.THREE = threeInstance || (window as any).IFCEngine?.THREE || (window as any).THREE;
    if (!this.THREE) {
      throw new Error('Three.js instance is required for BVHClashEngine');
    }
  }

  /**
   * Run full collision detection between two sets of discipline meshes.
   * Performs broadphase AABB culling followed by narrowphase BVH triangle-triangle intersection testing.
   */
  public detectClashes(
    itemsA: DisciplineMeshItem[],
    itemsB: DisciplineMeshItem[],
    options: { tolerance?: number; maxClashes?: number } = {}
  ): ClashResult[] {
    const THREE = this.THREE;
    const clashes: ClashResult[] = [];
    const maxClashes = options.maxClashes || 500;
    let clashCounter = 1;

    // Precompute world bounding boxes for itemsA
    const boxMapA = new Map<any, any>();
    for (const itemA of itemsA) {
      if (!itemA.mesh || !itemA.mesh.geometry) continue;
      if (!itemA.mesh.geometry.boundingBox) itemA.mesh.geometry.computeBoundingBox();
      const worldBox = itemA.mesh.geometry.boundingBox.clone().applyMatrix4(itemA.mesh.matrixWorld);
      boxMapA.set(itemA.mesh, worldBox);
    }

    // Pairwise broadphase + narrowphase
    for (let i = 0; i < itemsA.length; i++) {
      const itemA = itemsA[i];
      const meshA = itemA.mesh;
      const geomA = meshA.geometry;
      const boxA = boxMapA.get(meshA);
      if (!boxA || boxA.isEmpty()) continue;

      for (let j = 0; j < itemsB.length; j++) {
        const itemB = itemsB[j];
        const meshB = itemB.mesh;
        const geomB = meshB.geometry;

        if (!geomB || !geomB.boundingBox) {
          if (geomB) geomB.computeBoundingBox();
        }
        if (!geomB || !geomB.boundingBox) continue;

        // Broadphase: AABB intersection test
        const boxB = geomB.boundingBox.clone().applyMatrix4(meshB.matrixWorld);
        if (!boxA.intersectsBox(boxB)) {
          continue; // Discard non-colliding bounding volumes
        }

        // Narrowphase: BVH triangle-triangle intersection test
        if (!geomA.boundsTree && typeof geomA.computeBoundsTree === 'function') {
          geomA.computeBoundsTree();
        }
        if (!geomB.boundsTree && typeof geomB.computeBoundsTree === 'function') {
          geomB.computeBoundsTree();
        }

        let isColliding = false;
        if (geomA.boundsTree && typeof geomA.boundsTree.intersectsGeometry === 'function') {
          const matrixToLocal = new THREE.Matrix4()
            .copy(meshA.matrixWorld)
            .invert()
            .multiply(meshB.matrixWorld);
          isColliding = geomA.boundsTree.intersectsGeometry(geomB, matrixToLocal);
        } else {
          // Fallback if boundsTree not available: bounding box intersection
          isColliding = true;
        }

        if (isColliding) {
          const isectBox = boxA.clone().intersect(boxB);
          const centroidVec = isectBox.getCenter(new THREE.Vector3());
          const sizeVec = isectBox.getSize(new THREE.Vector3());
          const penetration = Math.min(sizeVec.x, sizeVec.y, sizeVec.z);

          // Calculate severity based on penetration depth and element types
          let severity: 'Critical' | 'Major' | 'Minor' = 'Minor';
          const typeAUpper = (itemA.type || '').toUpperCase();
          const typeBUpper = (itemB.type || '').toUpperCase();
          const isStructural =
            typeAUpper.includes('COLUMN') ||
            typeAUpper.includes('BEAM') ||
            typeAUpper.includes('SLAB') ||
            typeAUpper.includes('WALL');

          if (penetration > 0.05 || (isStructural && penetration > 0.02)) {
            severity = 'Critical';
          } else if (penetration > 0.01) {
            severity = 'Major';
          } else {
            severity = 'Minor';
          }

          // Generate BCF Camera Viewpoint
          const camOffset = new THREE.Vector3(3.5, 2.5, 3.5);
          const cameraPos = centroidVec.clone().add(camOffset);

          const clashId = `CLASH-${Date.now().toString(36).toUpperCase()}-${clashCounter++}`;
          const clash: ClashResult = {
            clashId,
            modelA_id: itemA.modelDocName,
            modelA_name: itemA.modelName,
            elementA_expressId: itemA.expressID,
            elementA_guid: itemA.guid || `GUID-A-${itemA.expressID}`,
            elementA_name: itemA.name || `${itemA.discipline} #${itemA.expressID}`,
            elementA_type: itemA.type || 'IFCELEMENT',
            elementA_discipline: itemA.discipline || 'Discipline A',
            meshA,

            modelB_id: itemB.modelDocName,
            modelB_name: itemB.modelName,
            elementB_expressId: itemB.expressID,
            elementB_guid: itemB.guid || `GUID-B-${itemB.expressID}`,
            elementB_name: itemB.name || `${itemB.discipline} #${itemB.expressID}`,
            elementB_type: itemB.type || 'IFCELEMENT',
            elementB_discipline: itemB.discipline || 'Discipline B',
            meshB,

            collisionCentroid: [centroidVec.x, centroidVec.y, centroidVec.z],
            collisionBoundingBox: {
              min: [isectBox.min.x, isectBox.min.y, isectBox.min.z],
              max: [isectBox.max.x, isectBox.max.y, isectBox.max.z],
            },
            penetrationDepth: Number(penetration.toFixed(4)),
            severity,
            status: 'Open',
            bcfViewpoint: {
              camera_position: [cameraPos.x, cameraPos.y, cameraPos.z],
              camera_target: [centroidVec.x, centroidVec.y, centroidVec.z],
              camera_up: [0, 1, 0],
              selected_elements: [
                itemA.guid || `GUID-A-${itemA.expressID}`,
                itemB.guid || `GUID-B-${itemB.expressID}`,
              ],
              hidden_elements: [],
              clash_marker_position: [centroidVec.x, centroidVec.y, centroidVec.z],
            },
          };

          clashes.push(clash);
          if (clashes.length >= maxClashes) {
            return clashes;
          }
        }
      }
    }

    return clashes;
  }
}
