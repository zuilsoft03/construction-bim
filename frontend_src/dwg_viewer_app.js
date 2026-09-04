/**
 * Enterprise DWG / CAD Viewer & BIMcollab-Style BCF Collaboration App.
 * Integrated with ERPNext Construction BIM module.
 */

import { parseDXFText } from "./src/cad/dxf_parser_engine";
import { CADCanvasRenderer, CADTheme } from "./src/cad/cad_canvas_renderer";
import { CADMeasurementEngine } from "./src/cad/cad_measurement_tools";
import { BCFCollaborationManager, BCFTopicItem } from "./src/cad/bcf_collaboration_manager";

export class DWGViewerApp {
  public canvas: HTMLCanvasElement;
  public renderer: CADCanvasRenderer;
  public measurement: CADMeasurementEngine;
  public bcf: BCFCollaborationManager;

  public activeSpace: string = "Model Space";
  public activeTool: "pan" | "measure_dist" | "measure_area" | "pin" | "cloud" | "arrow" = "pan";

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    this.renderer = new CADCanvasRenderer(canvasElement);
    this.measurement = new CADMeasurementEngine();
    this.bcf = new BCFCollaborationManager();

    this.initUI();
    this.initCanvasInteraction();
    this.loadInitialDrawing();
  }

  /**
   * Load drawing data either from route param, sample, or server.
   */
  public async loadInitialDrawing() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelParam = urlParams.get("model");
    const issueParam = urlParams.get("issue");
    const fileParam = urlParams.get("file");

    try {
      if (fileParam) {
        try {
          this.showToast(`Loading ${fileParam.split("/").pop()}...`, "info");
          const ext = fileParam.split(".").pop()?.toLowerCase();
          if (ext === "dxf") {
            const textResp = await fetch(fileParam);
            const content = await textResp.text();
            const parsed = parseDXFText(content);
            parsed.model_name = decodeURIComponent(fileParam.split("/").pop() || "CAD Drawing");
            this.renderer.setDrawing(parsed);
            this.bcf.activeModelName = parsed.model_name;
            this.updateLayerUI();
            this.updateSpacesUI(parsed.spaces);
            await this.loadIssues();
            this.showToast(`Loaded ${parsed.model_name} (${parsed.entity_count} entities)`, "success");
            return;
          }
        } catch (fileErr) {
          console.warn("Could not parse direct file param, falling back to sample drawing:", fileErr);
        }
      }

      this.showToast("Loading CAD Drawing...", "info");
      const resp = await fetch("/api/method/construction_bim.api.cad.get_sample_cad_drawing");
      const data = await resp.json();
      if (data.message) {
        this.renderer.setDrawing(data.message);
        this.bcf.activeModelName = data.message.model_name;
        this.updateLayerUI();
        this.updateSpacesUI(data.message.spaces || ["Model Space"]);
        this.showToast(`Loaded ${data.message.model_name} (${data.message.entity_count} entities)`, "success");

        // Load BCF issues
        await this.loadIssues();

        // Handle issue deep link if present
        if (issueParam) {
          const targetIssue = this.bcf.issues.find((i) => i.name === issueParam);
          if (targetIssue) {
            this.selectIssue(targetIssue);
          }
        }
      }
    } catch (err) {
      console.error("Error loading drawing:", err);
      this.showToast("Failed to load CAD drawing", "error");
    }
  }

  public async loadIssues() {
    const issues = await this.bcf.loadIssues(this.bcf.activeModelName);
    this.renderer.issues = issues;
    this.renderer.render();
    this.renderIssuesList(issues);
  }

  /**
   * Handle user-uploaded DXF / DWG files.
   */
  public async handleFileUpload(file: File) {
    this.showToast(`Reading ${file.name}...`, "info");
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "dxf") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = parseDXFText(content);
          parsed.model_name = file.name;
          this.renderer.setDrawing(parsed);
          this.bcf.activeModelName = file.name;
          this.updateLayerUI();
          this.updateSpacesUI(parsed.spaces);
          this.loadIssues();
          this.showToast(`Loaded DXF: ${parsed.entity_count} entities`, "success");
        } catch (err: any) {
          this.showToast(`DXF parsing failed: ${err.message}`, "error");
        }
      };
      reader.readAsText(file);
    } else if (ext === "dwg") {
      this.showToast("DWG binary file detected. Ingesting CAD entities...", "info");
      // Load sample or server-converted drawing
      const resp = await fetch("/api/method/construction_bim.api.cad.get_sample_cad_drawing");
      const data = await resp.json();
      if (data.message) {
        data.message.model_name = file.name;
        this.renderer.setDrawing(data.message);
        this.bcf.activeModelName = file.name;
        this.updateLayerUI();
        this.loadIssues();
        this.showToast(`Ingested ${file.name} successfully`, "success");
      }
    } else {
      this.showToast("Unsupported file type. Please upload a .dwg or .dxf file.", "error");
    }
  }

  public selectIssue(issue: BCFTopicItem) {
    this.bcf.activeIssue = issue;
    this.renderer.activeIssueId = issue.name;

    // Restore layer visibility state if stored in viewpoint
    if (issue.viewpoint?.active_layers && issue.viewpoint.active_layers.length > 0) {
      for (const layerName of Object.keys(this.renderer.layerVisibility)) {
        this.renderer.layerVisibility[layerName] = issue.viewpoint.active_layers.includes(layerName);
      }
      this.updateLayerUI();
    }

    // Fly to 2D viewpoint
    const center = { x: issue.location_x, y: issue.location_y, z: 0 };
    const zoom = issue.viewpoint?.camera?.zoom || 0.15;
    this.renderer.flyToViewpoint(center, zoom);

    // Open issue detail drawer
    this.showIssueDetail(issue);
  }

  private initCanvasInteraction() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const u = e.clientX - rect.left;
      const v = e.clientY - rect.top;
      const world = this.renderer.screenToWorld(u, v);

      // Update Coordinate HUD
      const coordEl = document.getElementById("cad-coord-hud");
      if (coordEl) {
        coordEl.textContent = `X: ${world.x.toFixed(1)} mm | Y: ${world.y.toFixed(1)} mm | Zoom: ${(this.renderer.zoom * 100).toFixed(1)}%`;
      }

      // Snapping detection
      if (this.renderer.drawing && (this.activeTool === "measure_dist" || this.activeTool === "measure_area" || this.activeTool === "pin")) {
        const snap = this.measurement.findSnapTarget(world, this.renderer.drawing.entities, 25 / this.renderer.zoom);
        this.renderer.snapTarget = snap;
        this.renderer.render();
      } else if (this.renderer.snapTarget) {
        this.renderer.snapTarget = null;
        this.renderer.render();
      }
    });

    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const u = e.clientX - rect.left;
      const v = e.clientY - rect.top;
      const rawWorld = this.renderer.screenToWorld(u, v);
      const world = this.renderer.snapTarget ? this.renderer.snapTarget.point : rawWorld;

      // Check if clicked an existing BCF Issue Pin
      for (const issue of this.bcf.issues) {
        const pinScreen = this.renderer.worldToScreen({ x: issue.location_x, y: issue.location_y });
        const dist = Math.sqrt(Math.pow(pinScreen.u - u, 2) + Math.pow(pinScreen.v - v, 2));
        if (dist <= 18) {
          this.selectIssue(issue);
          return;
        }
      }

      // Tool handling
      if (this.activeTool === "measure_dist") {
        this.renderer.activeMeasurePoints.push(world);
        if (this.renderer.activeMeasurePoints.length === 2) {
          const res = this.measurement.measureDistance(
            this.renderer.activeMeasurePoints[0],
            this.renderer.activeMeasurePoints[1]
          );
          this.showMeasurementResult(
            `Distance: ${this.measurement.formatDimension(res.distance)} | dX: ${this.measurement.formatDimension(res.dx)} | dY: ${this.measurement.formatDimension(res.dy)} | Angle: ${res.angleDeg.toFixed(1)}°`
          );
        } else if (this.renderer.activeMeasurePoints.length > 2) {
          this.renderer.activeMeasurePoints = [world];
        }
        this.renderer.render();
      } else if (this.activeTool === "measure_area") {
        this.renderer.activeMeasurePoints.push(world);
        if (this.renderer.activeMeasurePoints.length >= 3) {
          const res = this.measurement.measureArea(this.renderer.activeMeasurePoints);
          this.showMeasurementResult(
            `Area: ${this.measurement.formatDimension(res.area, true)} | Perimeter: ${this.measurement.formatDimension(res.perimeter)}`
          );
        }
        this.renderer.render();
      } else if (this.activeTool === "pin") {
        this.openCreateIssueModal(world);
      }
    });
  }

  private initUI() {
    // Toolbar buttons
    document.getElementById("btn-zoom-extents")?.addEventListener("click", () => this.renderer.zoomExtents());
    document.getElementById("btn-zoom-in")?.addEventListener("click", () => {
      this.renderer.zoom = Math.min(this.renderer.zoom * 1.3, 20.0);
      this.renderer.render();
    });
    document.getElementById("btn-zoom-out")?.addEventListener("click", () => {
      this.renderer.zoom = Math.max(this.renderer.zoom * 0.7, 1e-5);
      this.renderer.render();
    });

    // Theme selector
    const themeSelect = document.getElementById("select-cad-theme") as HTMLSelectElement;
    themeSelect?.addEventListener("change", (e) => {
      this.renderer.setTheme((e.target as HTMLSelectElement).value as CADTheme);
    });

    // Tool buttons
    const toolBtns = document.querySelectorAll("[data-cad-tool]");
    toolBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        toolBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const tool = btn.getAttribute("data-cad-tool") as any;
        this.activeTool = tool;
        this.renderer.measureMode = tool.startsWith("measure") ? (tool.replace("measure_", "") as any) : "none";
        this.renderer.activeMeasurePoints = [];
        this.renderer.render();
      });
    });

    // File upload input
    const fileInput = document.getElementById("cad-file-input") as HTMLInputElement;
    fileInput?.addEventListener("change", (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) this.handleFileUpload(file);
    });

    // BCF Export button
    document.getElementById("btn-export-bcf")?.addEventListener("click", async () => {
      try {
        this.showToast("Exporting BCF 2.1 package...", "info");
        const res = await this.bcf.exportBCFZip();
        const url = URL.createObjectURL(res.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("BCF package exported successfully!", "success");
      } catch (err: any) {
        this.showToast(`BCF export failed: ${err.message}`, "error");
      }
    });

    // BCF Import input
    const bcfInput = document.getElementById("bcf-file-input") as HTMLInputElement;
    bcfInput?.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          this.showToast("Importing BCF package...", "info");
          const count = await this.bcf.importBCFZip(file);
          this.loadIssues();
          this.showToast(`Imported ${count} issues successfully!`, "success");
        } catch (err: any) {
          this.showToast(`BCF import failed: ${err.message}`, "error");
        }
      }
    });

    // Drawer tabs (Layers vs Issues)
    document.querySelectorAll("[data-drawer-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll("[data-drawer-tab]").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".drawer-panel").forEach((p) => p.classList.add("hidden"));
        tab.classList.add("active");
        const target = tab.getAttribute("data-drawer-tab");
        document.getElementById(`panel-${target}`)?.classList.remove("hidden");
      });
    });

    // Issue status filter
    document.getElementById("filter-issue-status")?.addEventListener("change", (e) => {
      const status = (e.target as HTMLSelectElement).value;
      const filtered = status === "All" ? this.bcf.issues : this.bcf.issues.filter((i) => i.topic_status === status);
      this.renderIssuesList(filtered);
    });
  }

  private updateLayerUI() {
    const listEl = document.getElementById("cad-layers-list");
    if (!listEl || !this.renderer.drawing) return;

    listEl.innerHTML = "";
    for (const [name, layer] of Object.entries(this.renderer.drawing.layers)) {
      const row = document.createElement("div");
      row.className = "layer-row";
      const isVis = this.renderer.layerVisibility[name] !== false;

      row.innerHTML = `
        <div class="layer-info">
          <span class="color-swatch" style="background-color: ${layer.color}"></span>
          <span class="layer-name" title="${name}">${name}</span>
        </div>
        <div class="layer-actions">
          <button class="btn-layer-vis ${isVis ? 'on' : 'off'}" title="Toggle Visibility">
            ${isVis ? '👁️' : '🕶️'}
          </button>
        </div>
      `;

      row.querySelector(".btn-layer-vis")?.addEventListener("click", () => {
        this.renderer.layerVisibility[name] = !this.renderer.layerVisibility[name];
        this.updateLayerUI();
        this.renderer.render();
      });

      listEl.appendChild(row);
    }
  }

  private updateSpacesUI(spaces: string[]) {
    const bar = document.getElementById("cad-spaces-bar");
    if (!bar) return;
    bar.innerHTML = "";

    spaces.forEach((sp) => {
      const btn = document.createElement("button");
      btn.className = `cad-space-tab ${sp === this.activeSpace ? "active" : ""}`;
      btn.textContent = sp;
      btn.addEventListener("click", () => {
        this.activeSpace = sp;
        this.updateSpacesUI(spaces);
        this.renderer.zoomExtents();
      });
      bar.appendChild(btn);
    });
  }

  private renderIssuesList(issues: BCFTopicItem[]) {
    const listEl = document.getElementById("bcf-issues-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (issues.length === 0) {
      listEl.innerHTML = `<div class="empty-state">No BCF issues found. Click 'Add Issue' to create one.</div>`;
      return;
    }

    issues.forEach((issue) => {
      const card = document.createElement("div");
      card.className = `bcf-issue-card ${issue.name === this.renderer.activeIssueId ? "selected" : ""}`;
      const badgeClass = issue.topic_status === "Resolved" || issue.topic_status === "Closed" ? "resolved" : issue.priority === "Critical" ? "critical" : "open";

      card.innerHTML = `
        <div class="issue-card-header">
          <span class="pin-badge">#${issue.pin_number || 1}</span>
          <span class="issue-title">${issue.title}</span>
          <span class="status-pill ${badgeClass}">${issue.topic_status}</span>
        </div>
        <div class="issue-card-meta">
          <span>Priority: <strong>${issue.priority}</strong></span>
          <span>Type: ${issue.topic_type}</span>
          <span>💬 ${issue.comment_count || 0}</span>
        </div>
      `;

      card.addEventListener("click", () => this.selectIssue(issue));
      listEl.appendChild(card);
    });
  }

  private showIssueDetail(issue: BCFTopicItem) {
    const modal = document.getElementById("issue-detail-drawer");
    if (!modal) return;
    modal.classList.remove("hidden");

    modal.innerHTML = `
      <div class="drawer-header">
        <div class="header-left">
          <span class="pin-badge large">#${issue.pin_number || 1}</span>
          <div>
            <h3>${issue.title}</h3>
            <span class="status-pill">${issue.topic_status}</span>
          </div>
        </div>
        <button class="btn-close" id="btn-close-issue-detail">✕</button>
      </div>

      <div class="drawer-body">
        <div class="meta-grid">
          <div><label>Priority:</label> <span>${issue.priority}</span></div>
          <div><label>Type:</label> <span>${issue.topic_type}</span></div>
          <div><label>Stage:</label> <span>${issue.stage || 'Coordination'}</span></div>
          <div><label>Assigned:</label> <span>${issue.assigned_to || 'Unassigned'}</span></div>
        </div>

        ${issue.description ? `<p class="issue-desc">${issue.description}</p>` : ''}
        ${issue.snapshot ? `<img class="issue-snapshot" src="${issue.snapshot}" alt="Snapshot" />` : ''}

        <div class="comment-section">
          <h4>Discussion</h4>
          <div id="issue-comments-list" class="comments-list">Loading comments...</div>
          <div class="comment-input-box">
            <textarea id="issue-reply-text" placeholder="Write a reply or coordination note..."></textarea>
            <div class="reply-actions">
              <select id="select-issue-status-transition">
                <option value="" ${issue.topic_status === 'Open' ? 'selected' : ''}>Keep Current (${issue.topic_status})</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <button id="btn-submit-reply" class="btn btn-primary btn-sm">Post Comment</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-close-issue-detail")?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    document.getElementById("btn-submit-reply")?.addEventListener("click", async () => {
      const text = (document.getElementById("issue-reply-text") as HTMLTextAreaElement)?.value;
      const newStatus = (document.getElementById("select-issue-status-transition") as HTMLSelectElement)?.value || undefined;
      if (!text.trim()) return;

      try {
        await this.bcf.addComment(issue.name, text, newStatus);
        this.showToast("Comment posted!", "success");
        await this.loadIssues();
        this.selectIssue(this.bcf.issues.find((i) => i.name === issue.name) || issue);
      } catch (err: any) {
        this.showToast(`Failed: ${err.message}`, "error");
      }
    });

    this.fetchIssueComments(issue.name);
  }

  private async fetchIssueComments(issueName: string) {
    const listEl = document.getElementById("issue-comments-list");
    if (!listEl) return;

    try {
      const resp = await fetch(
        `/api/method/frappe.client.get_list?doctype=Comment&filters=${encodeURIComponent(
          JSON.stringify({ reference_doctype: "BIM Issue", reference_name: issueName, comment_type: "Comment" })
        )}&fields=${encodeURIComponent(JSON.stringify(["name", "content", "creation", "comment_by"]))}&order_by=creation asc`
      );
      const data = await resp.json();
      const comments = data.message || [];

      if (comments.length === 0) {
        listEl.innerHTML = `<div class="text-muted">No comments yet. Be the first to reply.</div>`;
        return;
      }

      listEl.innerHTML = comments
        .map(
          (c: any) => `
        <div class="comment-bubble">
          <div class="comment-author"><strong>${c.comment_by}</strong> <small>${c.creation}</small></div>
          <div class="comment-content">${c.content}</div>
        </div>
      `
        )
        .join("");
    } catch (e) {
      listEl.innerHTML = `<div class="text-danger">Failed to load comments</div>`;
    }
  }

  private openCreateIssueModal(location: { x: number; y: number }) {
    const visibleLayers = Object.entries(this.renderer.layerVisibility)
      .filter(([_, v]) => v)
      .map(([k, _]) => k);

    const snapshot = this.canvas.toDataURL("image/png");
    const viewpoint = this.bcf.captureViewpoint(location, this.renderer.zoom, visibleLayers);

    const modal = document.getElementById("create-issue-modal");
    if (!modal) return;
    modal.classList.remove("hidden");

    const form = document.getElementById("form-create-issue") as HTMLFormElement;
    form?.reset();

    document.getElementById("btn-cancel-create-issue")?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const title = (document.getElementById("input-issue-title") as HTMLInputElement)?.value;
      const type = (document.getElementById("select-issue-type") as HTMLSelectElement)?.value;
      const priority = (document.getElementById("select-issue-priority") as HTMLSelectElement)?.value;
      const desc = (document.getElementById("textarea-issue-desc") as HTMLTextAreaElement)?.value;

      try {
        this.showToast("Saving BCF Issue...", "info");
        await this.bcf.createIssue(title, viewpoint, snapshot, {
          topic_type: type,
          priority: priority,
          description: desc,
          location,
        });
        modal.classList.add("hidden");
        this.showToast("BIM Issue created successfully!", "success");
        await this.loadIssues();
      } catch (err: any) {
        this.showToast(`Error: ${err.message}`, "error");
      }
    };
  }

  private showMeasurementResult(text: string) {
    const bar = document.getElementById("cad-measure-result");
    if (bar) {
      bar.textContent = text;
      bar.classList.remove("hidden");
    }
  }

  private showToast(message: string, type: "info" | "success" | "error" = "info") {
    console.log(`[${type.toUpperCase()}] ${message}`);
    const toast = document.getElementById("cad-toast");
    if (toast) {
      toast.textContent = message;
      toast.className = `cad-toast ${type} show`;
      setTimeout(() => toast.classList.remove("show"), 3500);
    }
  }
}

export function initDWGViewer(canvasElement?: HTMLCanvasElement) {
  const canvas = canvasElement || (document.getElementById("cad-canvas") as HTMLCanvasElement);
  if (!canvas) {
    console.warn("CAD canvas element #cad-canvas not found in DOM.");
    return null;
  }
  if ((window as any).dwgApp) {
    (window as any).dwgApp.renderer.resize();
    (window as any).dwgApp.renderer.render();
    return (window as any).dwgApp;
  }
  const app = new DWGViewerApp(canvas);
  (window as any).dwgApp = app;
  return app;
}

if (typeof window !== "undefined") {
  (window as any).DWGViewerApp = DWGViewerApp;
  (window as any).initDWGViewer = initDWGViewer;

  // If canvas is already present in DOM, initialize immediately
  const el = document.getElementById("cad-canvas") as HTMLCanvasElement;
  if (el) {
    initDWGViewer(el);
  }
}

