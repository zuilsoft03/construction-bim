/**
 * 3D Visual Clash Highlighting & Centroid Marker Management.
 * Highlights Element A in Red (#ef4444) and Element B in Yellow (#eab308),
 * creates glowing centroid sphere markers and intersection bounding box wireframes.
 */

import { ClashResult } from './bvh_clash_engine';

export class ClashHighlighter {
  private THREE: any;
  private scene: any;
  private activeMarkers: any[] = [];
  private activeHelpers: any[] = [];
  private originalMaterials: Map<any, { color: any; emissive: any; opacity: number; transparent: boolean }> = new Map();

  constructor(scene: any, threeInstance?: any) {
    this.scene = scene;
    this.THREE = threeInstance || (window as any).IFCEngine?.THREE || (window as any).THREE;
  }

  /**
   * Highlight a specific clash result with Red and Yellow materials, bounding box helper, and centroid sphere marker.
   */
  public highlightClash(clash: ClashResult, allMeshes: any[] = [], isolate: boolean = true): void {
    this.clearHighlights(allMeshes);
    const THREE = this.THREE;

    // 1. Highlight Element A in Red
    if (clash.meshA && clash.meshA.material) {
      this.saveMaterialState(clash.meshA);
      clash.meshA.material.color.setHex(0xef4444); // Crimson Red
      if (clash.meshA.material.emissive) {
        clash.meshA.material.emissive.setHex(0x7f1d1d);
        clash.meshA.material.emissiveIntensity = 0.5;
      }
      clash.meshA.material.transparent = false;
      clash.meshA.material.opacity = 1.0;
      clash.meshA.material.depthWrite = true;
      clash.meshA.visible = true;
    }

    // 2. Highlight Element B in Yellow
    if (clash.meshB && clash.meshB.material) {
      this.saveMaterialState(clash.meshB);
      clash.meshB.material.color.setHex(0xeab308); // Vivid Yellow
      if (clash.meshB.material.emissive) {
        clash.meshB.material.emissive.setHex(0x713f12);
        clash.meshB.material.emissiveIntensity = 0.5;
      }
      clash.meshB.material.transparent = false;
      clash.meshB.material.opacity = 1.0;
      clash.meshB.material.depthWrite = true;
      clash.meshB.visible = true;
    }

    // 3. Collision Centroid Marker (Pulsing / Glowing Sphere)
    const [cx, cy, cz] = clash.collisionCentroid;
    const markerGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      wireframe: false,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(cx, cy, cz);
    this.scene.add(marker);
    this.activeMarkers.push(marker);

    // Centroid outer pulse ring
    const ringGeo = new THREE.RingGeometry(0.22, 0.35, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(cx, cy, cz);
    ring.lookAt(cx, cy + 1, cz);
    this.scene.add(ring);
    this.activeMarkers.push(ring);

    // 4. Bounding Box Helper around intersection volume
    const min = new THREE.Vector3(...clash.collisionBoundingBox.min);
    const max = new THREE.Vector3(...clash.collisionBoundingBox.max);
    const isectBox = new THREE.Box3(min, max);
    const boxHelper = new THREE.Box3Helper(isectBox, 0xf43f5e); // Magenta bounding box
    this.scene.add(boxHelper);
    this.activeHelpers.push(boxHelper);

    // 5. Context Isolation (Dim other elements to 10% opacity)
    if (isolate && allMeshes && allMeshes.length > 0) {
      for (const m of allMeshes) {
        if (m === clash.meshA || m === clash.meshB) continue;
        if (!m.material) continue;
        this.saveMaterialState(m);
        m.material.transparent = true;
        m.material.opacity = 0.12;
        m.material.depthWrite = false;
      }
    }
  }

  private saveMaterialState(mesh: any): void {
    if (!this.originalMaterials.has(mesh) && mesh.material) {
      this.originalMaterials.set(mesh, {
        color: mesh.material.color ? mesh.material.color.clone() : null,
        emissive: mesh.material.emissive ? mesh.material.emissive.clone() : null,
        opacity: mesh.material.opacity !== undefined ? mesh.material.opacity : 1.0,
        transparent: !!mesh.material.transparent,
      });
    }
  }

  /**
   * Clear all active markers, helpers, and restore mesh materials.
   */
  public clearHighlights(allMeshes: any[] = []): void {
    // Remove markers
    for (const m of this.activeMarkers) {
      this.scene.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
    }
    this.activeMarkers = [];

    // Remove helpers
    for (const h of this.activeHelpers) {
      this.scene.remove(h);
      if (h.geometry) h.geometry.dispose();
      if (h.material) h.material.dispose();
    }
    this.activeHelpers = [];

    // Restore saved material states
    this.originalMaterials.forEach((state, mesh) => {
      if (mesh && mesh.material) {
        if (state.color && mesh.material.color) mesh.material.color.copy(state.color);
        if (state.emissive && mesh.material.emissive) mesh.material.emissive.copy(state.emissive);
        mesh.material.opacity = state.opacity;
        mesh.material.transparent = state.transparent;
        mesh.material.depthWrite = !state.transparent;
      }
    });
    this.originalMaterials.clear();
  }
}
