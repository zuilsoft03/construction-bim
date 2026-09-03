/**
 * BCF Viewpoint Manager & Smooth Camera Fly-To Animation.
 * Implements buildingSMART BCF 2.1 / 3.0 camera viewpoint generation and smooth transition interpolation.
 */

import { BCFViewpoint } from './bvh_clash_engine';

export class BCFViewpointManager {
  private camera: any;
  private controls: any;
  private THREE: any;
  private currentAnimationId: number | null = null;

  constructor(camera: any, controls: any, threeInstance?: any) {
    this.camera = camera;
    this.controls = controls;
    this.THREE = threeInstance || (window as any).IFCEngine?.THREE || (window as any).THREE;
  }

  /**
   * Capture current camera state as a BCF 2.1 / 3.0 compliant Viewpoint object.
   */
  public captureViewpoint(selectedGuids: string[] = [], markerPos?: [number, number, number]): BCFViewpoint {
    const cam = this.camera;
    const ctrl = this.controls;
    const target = ctrl ? ctrl.target : new this.THREE.Vector3(0, 0, 0);
    const dir = new this.THREE.Vector3().subVectors(target, cam.position).normalize();

    return {
      camera_position: [cam.position.x, cam.position.y, cam.position.z],
      camera_direction: [dir.x, dir.y, dir.z],
      camera_target: [target.x, target.y, target.z],
      camera_up: [cam.up.x, cam.up.y, cam.up.z],
      selected_elements: selectedGuids,
      hidden_elements: [],
      clash_marker_position: markerPos || [target.x, target.y, target.z],
    };
  }

  /**
   * Smoothly fly the camera to a target centroid or BCF viewpoint.
   */
  public flyTo(
    viewpointOrCentroid: BCFViewpoint | [number, number, number] | { x: number; y: number; z: number },
    durationMs: number = 750,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentAnimationId !== null) {
        cancelAnimationFrame(this.currentAnimationId);
        this.currentAnimationId = null;
      }

      const THREE = this.THREE;
      let targetPos: any;
      let camPos: any;

      if (Array.isArray(viewpointOrCentroid)) {
        targetPos = new THREE.Vector3(...viewpointOrCentroid);
        camPos = targetPos.clone().add(new THREE.Vector3(3.2, 2.4, 3.2));
      } else if ('camera_position' in viewpointOrCentroid) {
        const vp = viewpointOrCentroid as BCFViewpoint;
        targetPos = new THREE.Vector3(...vp.camera_target);
        camPos = new THREE.Vector3(...vp.camera_position);
      } else {
        const p = viewpointOrCentroid as { x: number; y: number; z: number };
        targetPos = new THREE.Vector3(p.x, p.y, p.z);
        camPos = targetPos.clone().add(new THREE.Vector3(3.2, 2.4, 3.2));
      }

      const startCam = this.camera.position.clone();
      const startTarget = this.controls ? this.controls.target.clone() : new THREE.Vector3();
      const startTime = performance.now();

      const animateStep = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1.0);

        // Ease in-out quadratic
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        this.camera.position.lerpVectors(startCam, camPos, ease);
        if (this.controls) {
          this.controls.target.lerpVectors(startTarget, targetPos, ease);
          this.controls.update();
        }

        if (progress < 1.0) {
          this.currentAnimationId = requestAnimationFrame(animateStep);
        } else {
          this.currentAnimationId = null;
          if (onComplete) onComplete();
          resolve();
        }
      };

      this.currentAnimationId = requestAnimationFrame(animateStep);
    });
  }
}
