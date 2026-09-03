/**
 * BIMcollab-Style BCF Collaboration & Visual Markup Manager.
 * Handles BCF 2.1/3.0 topics, 2D viewpoints, visual redlines (pins, revision clouds,
 * arrows, callouts), threaded discussion comments, and BCF exchange.
 */

import { CADPoint } from "./dxf_parser_engine";

export interface BCF2DViewpoint {
  camera: {
    center: CADPoint;
    zoom: number;
  };
  active_layers: string[];
  markups?: BCFAssociatedMarkup[];
}

export interface BCFAssociatedMarkup {
  id: string;
  type: "pin" | "cloud" | "arrow" | "text" | "box";
  color?: string;
  pin_number?: number;
  points?: CADPoint[];
  start?: CADPoint;
  end?: CADPoint;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface BCFTopicItem {
  name: string;
  title: string;
  topic_type: string;
  topic_status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  stage?: string;
  labels?: string;
  reference_model?: string;
  drawing_space?: string;
  pin_number: number;
  location_x: number;
  location_y: number;
  viewpoint?: BCF2DViewpoint;
  snapshot?: string;
  description?: string;
  comment_count?: number;
  created_by_user?: string;
  creation_date?: string;
  resolved_by?: string;
  resolution_date?: string;
}

export class BCFCollaborationManager {
  public issues: BCFTopicItem[] = [];
  public activeIssue: BCFTopicItem | null = null;
  public draftMarkups: BCFAssociatedMarkup[] = [];
  public currentTool: "select" | "pin" | "cloud" | "arrow" | "text" | "box" = "select";
  public activeModelName: string = "";

  /**
   * Load issues for the current model from ERPNext backend.
   */
  public async loadIssues(
    modelName: string,
    filters?: { status?: string; priority?: string; topic_type?: string }
  ): Promise<BCFTopicItem[]> {
    this.activeModelName = modelName;
    try {
      const params = new URLSearchParams();
      if (modelName) params.append("model_name", modelName);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.topic_type) params.append("topic_type", filters.topic_type);

      const resp = await fetch(`/api/method/construction_bim.api.cad.get_cad_issues?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      const data = await resp.json();
      this.issues = data.message || [];
      return this.issues;
    } catch (err) {
      console.warn("Failed to load BIM Issues from backend, using local state:", err);
      return this.issues;
    }
  }

  /**
   * Capture a new BCF 2.1 2D viewpoint from current camera and visible layers.
   */
  public captureViewpoint(
    cameraCenter: CADPoint,
    zoomScale: number,
    visibleLayers: string[],
    markups: BCFAssociatedMarkup[] = []
  ): BCF2DViewpoint {
    return {
      camera: {
        center: { x: cameraCenter.x, y: cameraCenter.y, z: 0 },
        zoom: zoomScale,
      },
      active_layers: [...visibleLayers],
      markups: [...markups],
    };
  }

  /**
   * Create a new issue on the backend.
   */
  public async createIssue(
    title: string,
    viewpoint: BCF2DViewpoint,
    snapshotDataUrl: string,
    details: {
      topic_type?: string;
      priority?: string;
      assigned_to?: string;
      due_date?: string;
      stage?: string;
      labels?: string;
      description?: string;
      location?: CADPoint;
    } = {}
  ): Promise<BCFTopicItem> {
    const loc = details.location || viewpoint.camera.center;
    const nextPin = this.issues.length > 0 ? Math.max(...this.issues.map((i) => i.pin_number || 0)) + 1 : 1;

    const payload = {
      title,
      topic_type: details.topic_type || "Issue",
      topic_status: "Open",
      priority: details.priority || "Normal",
      assigned_to: details.assigned_to,
      due_date: details.due_date,
      stage: details.stage || "Coordination",
      labels: details.labels || "",
      reference_model: this.activeModelName,
      drawing_space: "Model Space",
      pin_number: nextPin,
      location_x: loc.x,
      location_y: loc.y,
      viewpoint_json: JSON.stringify(viewpoint),
      snapshot: snapshotDataUrl,
      description: details.description || "",
    };

    const resp = await fetch("/api/method/construction_bim.api.cad.save_cad_issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Frappe-CSRF-Token": (window as any).frappe?.csrf_token || "",
      },
      body: JSON.stringify({ issue_data: payload }),
    });

    const result = await resp.json();
    if (result.exc) {
      throw new Error(result.exc);
    }

    const created = result.message?.issue || payload;
    created.viewpoint = viewpoint;
    this.issues.push(created);
    return created;
  }

  /**
   * Add a discussion comment to an active issue.
   */
  public async addComment(
    issueName: string,
    comment: string,
    newStatus?: string
  ): Promise<any> {
    const resp = await fetch("/api/method/construction_bim.api.cad.add_issue_comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Frappe-CSRF-Token": (window as any).frappe?.csrf_token || "",
      },
      body: JSON.stringify({
        issue_name: issueName,
        comment,
        new_status: newStatus,
      }),
    });

    const result = await resp.json();
    if (result.exc) {
      throw new Error(result.exc);
    }

    if (newStatus) {
      const iss = this.issues.find((i) => i.name === issueName);
      if (iss) iss.topic_status = newStatus;
    }

    return result.message?.data;
  }

  /**
   * Export issues as a downloadable buildingSMART .bcfzip package.
   */
  public async exportBCFZip(modelName?: string): Promise<{ filename: string; blob: Blob }> {
    const targetModel = modelName || this.activeModelName;
    const resp = await fetch("/api/method/construction_bim.api.cad.export_bcf_zip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Frappe-CSRF-Token": (window as any).frappe?.csrf_token || "",
      },
      body: JSON.stringify({ model_name: targetModel }),
    });

    const result = await resp.json();
    if (!result.message?.zip_base64) {
      throw new Error(result.message?.error || "Failed to generate BCF package.");
    }

    // Convert base64 to Blob
    const byteCharacters = atob(result.message.zip_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });

    return {
      filename: result.message.filename,
      blob,
    };
  }

  /**
   * Import issues from a user-uploaded .bcfzip file.
   */
  public async importBCFZip(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Data = (e.target?.result as string).split(",")[1];
          const resp = await fetch("/api/method/construction_bim.api.cad.import_bcf_zip", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Frappe-CSRF-Token": (window as any).frappe?.csrf_token || "",
            },
            body: JSON.stringify({
              zip_base64: base64Data,
              reference_model: this.activeModelName,
            }),
          });
          const result = await resp.json();
          const count = result.message?.imported_count || 0;
          await this.loadIssues(this.activeModelName);
          resolve(count);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
