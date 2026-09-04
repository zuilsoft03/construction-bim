// frontend_src/project_studio_app.js
var ICONS = {
  calendar: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  user: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  users: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  file: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  list: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  cube: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>`,
  info: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  table: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  star: `<svg viewBox="0 0 24 24" width="13" height="13" fill="#f59e0b" stroke="#f59e0b" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starEmpty: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="#9ca3af" stroke-width="1.5" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
};
function escapeHtml(str) {
  if (str == null) return "";
  if (window.frappe && frappe.utils && frappe.utils.escape_html) {
    return frappe.utils.escape_html(String(str));
  }
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var ProjectStudioApp = class {
  constructor(opts = {}) {
    this.opts = opts;
    this.page = opts.page || window.cur_page && window.cur_page.page || frappe.container && frappe.container.page && frappe.container.page.page;
    this.currentProject = null;
    this.allProjects = [];
    this.currentTab = "home";
    this.activeFilterKey = "all_open";
    this.activeTypeFilter = "all";
    this.boardGroupBy = "status";
    this.isSidebarCollapsed = false;
    this.init();
  }
  init() {
    this.setupNativePageHeader();
    this.bindEvents();
    this.loadProjectsList().then(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const projParam = urlParams.get("project");
      const tabParam = urlParams.get("tab");
      if (projParam && projParam !== "all") {
        this.selectProject(projParam, tabParam || "home");
      } else if (this.allProjects.length > 0) {
        this.selectProject(this.allProjects[0].name, tabParam || "home");
      } else {
        this.switchTab("all-projects");
      }
    });
  }
  setupNativePageHeader() {
    if (!this.page) return;
    const self = this;
    this.page.set_title(__("Dashboard"));
    if (this.currentProject) {
      this.page.set_title_sub(this.currentProject);
    }
    if (this.page.clear_action_bar) this.page.clear_action_bar();
    if (this.page.clear_primary_action) this.page.clear_primary_action();
    this.page.set_primary_action(
      __("Create"),
      () => self.openQuickCreateModal("Task"),
      "add"
    );
    this.page.add_inner_button(__("Standard Task"), () => self.openQuickCreateModal("Task"), __("Create"));
    this.page.add_inner_button(__("Milestone"), () => self.openQuickCreateModal("Milestone"), __("Create"));
    this.page.add_inner_button(__("Phase"), () => self.openQuickCreateModal("Phase"), __("Create"));
    this.page.add_inner_button(__("Issue / Punchlist"), () => self.openQuickCreateModal("Issue"), __("Create"));
    this.page.add_inner_button(__("Remark"), () => self.openQuickCreateModal("Remark"), __("Create"));
    this.page.add_inner_button(__("Request / RFI"), () => self.openQuickCreateModal("Request"), __("Create"));
    this.page.add_inner_button(__("Clash Topic"), () => self.openQuickCreateModal("Clash"), __("Create"));
    this.page.add_inner_button(__("New Project"), () => self.openQuickCreateModal("project"), __("Create"));
    this.page.add_inner_button(__("Invite Member"), () => self.openQuickCreateModal("user"), __("Create"));
    this.page.add_button(__("Refresh"), () => {
      if (self.currentProject) {
        self.loadProjectData(self.currentProject);
      } else {
        self.loadProjectsList();
      }
    }, { icon: "refresh" });
    this.page.add_button(__("Edit"), () => {
      if (self.currentProject) {
        frappe.set_route("Form", "Project", self.currentProject);
      } else {
        self.switchTab("settings");
      }
    }, { icon: "edit" });
    this.page.add_button(__("Desk"), () => {
      frappe.set_route("desk");
    }, { icon: "grid" });
  }
  bindEvents() {
    const self = this;
    $("#btn-toggle-sidebar").on("click", function() {
      self.isSidebarCollapsed = !self.isSidebarCollapsed;
      $("#studio-sidebar").toggleClass("collapsed", self.isSidebarCollapsed);
    });
    $(".studio-nav-list").on("click", ".nav-item", function() {
      const tab = $(this).data("tab");
      self.switchTab(tab);
    });
    $("#filter-project-btn").on("click", function(e) {
      e.stopPropagation();
      $("#projectSwitcherBtn").dropdown("toggle");
    });
    $("#filter-date-btn").on("click", function() {
      frappe.show_alert({ message: __("Filter: Last 30 Days (Active)"), indicator: "blue" });
    });
    $("#btn-studio-refresh").on("click", function() {
      if (self.currentProject) {
        self.loadProjectData(self.currentProject);
      } else {
        self.loadProjectsList();
      }
    });
    $("#btn-studio-edit").on("click", function() {
      if (self.currentProject) {
        frappe.set_route("Form", "Project", self.currentProject);
      } else {
        self.switchTab("settings");
      }
    });
    $(document).on("click", ".action-quick-add", function() {
      const type = $(this).data("type");
      self.openQuickCreateModal(type);
    });
    $("#btn-add-project").on("click", function() {
      self.openQuickCreateModal("project");
    });
    $("#btn-add-subproject").on("click", function() {
      self.openQuickCreateModal("subproject");
    });
    $("#projects-filter-input").on("keyup", function() {
      const q = $(this).val().toLowerCase();
      $("#projects-table-body tr").each(function() {
        const text = $(this).text().toLowerCase();
        $(this).toggle(text.indexOf(q) > -1);
      });
    });
    $("#studio-global-search").on("keyup", function(e) {
      if (e.key === "Enter") {
        const query = $(this).val();
        if (self.currentTab === "work-packages") {
          self.renderWorkPackages(query);
        } else if (self.currentTab === "all-projects") {
          $("#projects-filter-input").val(query).trigger("keyup");
        } else {
          self.switchTab("work-packages");
          setTimeout(() => self.renderWorkPackages(query), 100);
        }
      }
    });
    $("#select-project-health").on("change", function() {
      const val = $(this).val();
      self.updateProjectHealthStatus(val);
    });
    $("#btn-edit-status-narrative").on("click", function() {
      self.editStatusNarrativePrompt();
    });
    $("#btn-toggle-sidebar").on("click", function() {
      $("#studio-sidebar").toggleClass("collapsed");
    });
    $(document).on("keydown", function(e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        $("#studio-global-search").focus().select();
      }
    });
    $(".wp-sidebar-filter").on("click", "li[data-filter]", function() {
      $(".wp-sidebar-filter li[data-filter]").removeClass("active");
      $(this).addClass("active");
      self.activeFilterKey = $(this).data("filter");
      $("#wp-active-filter-title").text($(this).text());
      self.renderWorkPackages();
    });
    $(".wp-sidebar-filter").on("click", "li[data-type]", function() {
      $(".wp-sidebar-filter li[data-type]").removeClass("active");
      $(this).addClass("active");
      self.activeTypeFilter = $(this).data("type");
      self.renderWorkPackages();
    });
    $("#wp-filter-search").on("keyup", function() {
      const q = $(this).val().toLowerCase();
      $("#wp-table-body tr").each(function() {
        const text = $(this).text().toLowerCase();
        $(this).toggle(text.indexOf(q) > -1);
      });
    });
    $("#select-board-group-by").on("change", function() {
      self.boardGroupBy = $(this).val();
      self.renderKanbanBoard();
    });
    $("#btn-bcf-toggle-drawer").on("click", function() {
      $("#bcf-floating-drawer").toggle();
    });
    $("#btn-close-bcf-drawer").on("click", function() {
      $("#bcf-floating-drawer").hide();
    });
    $("#document-folders-container").on("click", ".file-item-link", function(e) {
      const route = $(this).data("route");
      const url = $(this).data("url");
      const modelId = $(this).data("model-id");
      if (route === "bim") {
        e.preventDefault();
        self.switchTab("bcf", { model: modelId, url });
        frappe.show_alert({ message: __("Opening IFC model in 3D Viewer..."), indicator: "blue" });
      } else if (route === "cad") {
        e.preventDefault();
        self.switchTab("cad", { file: url });
        frappe.show_alert({ message: __("Opening drawing in 2D CAD Studio..."), indicator: "blue" });
      } else if (route === "pdf") {
        e.preventDefault();
        self.switchTab("pdf", { file: url });
        frappe.show_alert({ message: __("Opening plan in PDF Takeoff..."), indicator: "blue" });
      }
    });
    $("#btn-upload-document").on("click", function() {
      self.openFileUploadDialog();
    });
    $("#btn-bcf-upload-ifc").on("click", function() {
      self.openBcfUploadDialog();
    });
    $("#btn-load-all-models").on("click", function() {
      $('#bcf-models-tree input[type="checkbox"]').prop("checked", true);
      const iframeSrc = `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}`;
      $("#iframe-bcf-3d-viewer").attr("src", iframeSrc);
      $("#btn-bcf-open-fullscreen").attr("href", iframeSrc);
    });
    $("#btn-unload-all-models").on("click", function() {
      $('#bcf-models-tree input[type="checkbox"]').prop("checked", false);
      const iframeSrc = `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}`;
      $("#iframe-bcf-3d-viewer").attr("src", iframeSrc);
    });
    $("#btn-bcf-create-topic").on("click", function() {
      self.openQuickCreateModal("Issue");
    });
    $("#btn-add-meeting").on("click", function() {
      self.openScheduleMeetingDialog();
    });
    $("#btn-add-subproject-widget").on("click", function() {
      self.openQuickCreateModal("subproject");
    });
    $("#btn-open-dwg-fullscreen").on("click", function() {
      window.open(`/app/dwg-viewer?project=${encodeURIComponent(self.currentProject)}`, "_blank");
    });
    $("#btn-open-pdf-fullscreen").on("click", function() {
      window.open(`/app/pdf-takeoff?project=${encodeURIComponent(self.currentProject)}`, "_blank");
    });
    $("#btn-schedule-meeting").on("click", function() {
      self.openScheduleMeetingDialog();
    });
    $("#btn-save-project-settings").on("click", function() {
      self.saveProjectSettings();
    });
    $("#btn-toggle-archive-project").on("click", function() {
      self.toggleArchiveProject();
    });
    $("#btn-delete-project").on("click", function() {
      self.confirmDeleteProject();
    });
  }
  loadProjectsList() {
    const self = this;
    return frappe.call({
      method: "construction_bim.api.project_studio.list_projects",
      args: { include_archived: 1 }
    }).then((r) => {
      self.allProjects = r.message || [];
      self.renderProjectSwitcher();
      self.renderAllProjectsTable();
    });
  }
  renderProjectSwitcher() {
    const $list = $("#project-switcher-list");
    $list.empty();
    $list.append(`<li><a href="javascript:void(0)" class="action-select-proj" data-project="all"><span class="mr-2 text-muted">${ICONS.list}</span> <strong>All projects (Hub)</strong></a></li>`);
    $list.append('<li role="separator" class="divider"></li>');
    const self = this;
    this.allProjects.forEach((p) => {
      const favIcon = p.is_favorite ? "\u2B50 " : "";
      const tmplBadge = p.is_template ? ' <span class="badge">Template</span>' : "";
      const $item = $(`<li><a href="javascript:void(0)" class="action-select-proj" data-project="${escapeHtml(p.name)}">${favIcon}${escapeHtml(p.project_name || p.name)}${tmplBadge}</a></li>`);
      $list.append($item);
    });
    $list.off("click", ".action-select-proj").on("click", ".action-select-proj", function() {
      const proj = $(this).data("project");
      if (proj === "all") {
        self.switchTab("all-projects");
      } else {
        self.selectProject(proj);
      }
    });
  }
  selectProject(projectName, tab = "home") {
    const projObj = this.allProjects.find((p) => p.name === projectName || p.project_name === projectName) || { name: projectName, project_name: projectName };
    this.currentProject = projObj.name;
    $("#current-project-title").text(projObj.project_name || projObj.name);
    $("#filter-project-label").text(projObj.project_name || projObj.name);
    $("#sidebar-active-status").text(projObj.status || "Active");
    if (this.page) {
      this.page.set_title_sub(projObj.project_name || projObj.name);
    }
    $(".studio-nav-list .nav-item").show();
    this.switchTab(tab);
    this.loadProjectData(projectName);
  }
  switchTab(tabKey, params = {}) {
    this.currentTab = tabKey;
    $(".studio-nav-list .nav-item").removeClass("active");
    $(`.studio-nav-list .nav-item[data-tab="${tabKey}"]`).addClass("active");
    const tabTitles = {
      "home": "Dashboard",
      "work-packages": "Work Packages",
      "boards": "Boards",
      "gantt": "Gantt Charts",
      "bcf": "BIM / BCF Coordination",
      "cad": "2D CAD (DWG)",
      "pdf": "PDF Plans & Takeoff",
      "documents": "Documents",
      "meetings": "Meetings & Safety",
      "members": "Members",
      "settings": "Settings",
      "all-projects": "Active Projects"
    };
    const activeTitle = tabTitles[tabKey] || tabKey;
    $("#studio-active-title").text(activeTitle);
    if (this.page) {
      this.page.set_title(activeTitle);
      if (this.currentProject) {
        this.page.set_title_sub(this.currentProject);
      }
    }
    $(".studio-tab-view").hide();
    if (tabKey === "all-projects") {
      $("#current-project-title").text("All projects");
      $("#view-all-projects").show();
      this.renderAllProjectsTable();
      return;
    }
    $(`#view-${tabKey}`).show();
    if (tabKey === "home") {
      this.renderProjectOverview();
    } else if (tabKey === "work-packages") {
      this.renderWorkPackages();
    } else if (tabKey === "boards") {
      this.renderKanbanBoard();
    } else if (tabKey === "gantt") {
      this.renderGanttChart();
    } else if (tabKey === "bcf") {
      this.renderBcfViewer(params.model);
    } else if (tabKey === "cad") {
      const cadSrc = params.file ? `/app/dwg-viewer?project=${encodeURIComponent(this.currentProject)}&file=${encodeURIComponent(params.file)}` : `/app/dwg-viewer?project=${encodeURIComponent(this.currentProject)}`;
      $("#iframe-dwg-viewer").attr("src", cadSrc);
    } else if (tabKey === "pdf") {
      const pdfSrc = params.file ? `/app/pdf-takeoff?project=${encodeURIComponent(this.currentProject)}&file=${encodeURIComponent(params.file)}` : `/app/pdf-takeoff?project=${encodeURIComponent(this.currentProject)}`;
      $("#iframe-pdf-viewer").attr("src", pdfSrc);
    } else if (tabKey === "documents") {
      this.renderDocumentsTree();
    } else if (tabKey === "meetings") {
      this.renderMeetingsTab();
    } else if (tabKey === "members") {
      this.renderMembersTable();
    } else if (tabKey === "settings") {
      this.renderSettingsTab();
    }
  }
  loadProjectData(projectName) {
    const self = this;
    frappe.call({
      method: "construction_bim.api.project_studio.get_project_overview",
      args: { project: projectName }
    }).then((r) => {
      self.projectOverviewData = r.message || {};
      if (self.currentTab === "home") {
        self.renderProjectOverview();
      }
    });
  }
  // -------------------------------------------------------------------------
  // TAB 0: ALL PROJECTS HUB (Screenshot 1)
  // -------------------------------------------------------------------------
  renderAllProjectsTable() {
    const $tbody = $("#projects-table-body");
    $tbody.empty();
    const self = this;
    this.allProjects.forEach((p) => {
      const favStar = p.is_favorite ? ICONS.star : ICONS.starEmpty;
      const statusPill = p.health_status === "On Track" ? '<span class="status-active-pill"><span class="status-dot-green"></span> On track</span>' : p.health_status === "At Risk" ? '<span class="status-warning-pill"><span class="status-dot-amber"></span> At risk</span>' : '<span class="status-danger-pill"><span class="status-dot-red"></span> Off track</span>';
      const indent = p.parent_project ? "&nbsp;&nbsp;&nbsp;&nbsp;\u21B3 " : "";
      const $tr = $(`
				<tr>
					<td class="text-center"><a href="javascript:void(0)" class="toggle-fav" data-project="${escapeHtml(p.name)}">${favStar}</a></td>
					<td>${indent}<a href="javascript:void(0)" class="project-link" data-project="${escapeHtml(p.name)}"><strong>${escapeHtml(p.project_name || p.name)}</strong></a></td>
					<td>${statusPill}</td>
					<td class="text-center text-success">${ICONS.check}</td>
					<td><span class="text-muted">${escapeHtml(p.created_on || "--")}</span></td>
					<td><span class="text-muted">${escapeHtml(p.latest_activity_at || "--")}</span></td>
					<td><small class="text-muted">${escapeHtml(p.disk_usage_formatted || "0 Bytes")}</small></td>
				</tr>
			`);
      $tr.find(".project-link").on("click", function() {
        self.selectProject($(this).data("project"));
      });
      $tr.find(".toggle-fav").on("click", function() {
        const isFav = p.is_favorite ? 0 : 1;
        self.updateProjectSettingsField(p.name, { is_favorite: isFav }).then(() => {
          self.loadProjectsList();
        });
      });
      $tbody.append($tr);
    });
    $("#projects-table-summary").text(`Showing ${this.allProjects.length} active project(s)`);
  }
  // -------------------------------------------------------------------------
  // TAB 1: PROJECT HOME DASHBOARD (Screenshot 2)
  // -------------------------------------------------------------------------
  renderProjectOverview() {
    if (!this.projectOverviewData) return;
    const data = this.projectOverviewData;
    const summary = data.summary || {};
    const userGreeting = frappe.session.user_fullname || frappe.session.user || "Administrator";
    $("#home-user-greeting").text(userGreeting);
    const wpCounts = data.work_packages_counts || {};
    const openTasks = wpCounts.open !== void 0 ? wpCounts.open : data.tasks ? data.tasks.length : 0;
    const clashes = data.coordination && data.coordination.topics ? data.coordination.topics.length : 0;
    const progress = Math.round(summary.percent_complete || 0);
    $("#home-stat-open-tasks").text(openTasks);
    $("#home-stat-clashes").text(clashes);
    $("#home-stat-progress").text(`${progress}%`);
    $("#sparkline-progress-bar").css("width", `${Math.min(100, Math.max(5, progress))}%`);
    $("#overview-description").text(summary.description || __("No description provided."));
    $("#overview-dates").text(`${summary.expected_start_date || "--"} to ${summary.expected_end_date || "--"}`);
    $("#overview-progress").text(`${Math.round(summary.percent_complete || 0)}%`);
    const health = summary.health_status || "On Track";
    $("#select-project-health").val(health);
    if (this.page && this.page.set_indicator) {
      const color = health === "On Track" ? "green" : health === "At Risk" ? "orange" : "red";
      this.page.set_indicator(health, color);
    }
    $("#overview-status-narrative").text(summary.status_narrative || __("All tasks and sub-projects are on schedule."));
    this.renderMilestoneTimeline(data.milestones || []);
    const $subList = $("#subprojects-list");
    $subList.empty();
    (data.subprojects || []).forEach((s) => {
      $subList.append(`
				<li class="flex-between p-1">
					<span class="d-inline-flex align-items-center gap-1"><span class="text-primary mr-1">${ICONS.folder}</span> ${s.project_name}</span>
					<span class="status-active-pill"><span class="status-dot-green"></span> ${s.status}</span>
				</li>
			`);
    });
    if ((data.subprojects || []).length === 0) {
      $subList.append('<li class="text-muted p-1"><small>No subprojects configured.</small></li>');
    }
    const $meetList = $("#meetings-list-container");
    $meetList.empty();
    (data.meetings || []).forEach((m) => {
      $meetList.append(`
				<div class="meeting-item p-2 mb-1" style="border-bottom: 1px solid #f1f5f9;">
					<div class="flex-between">
						<strong>${m.title}</strong>
						<span class="badge badge-info">${m.type}</span>
					</div>
					<small class="text-muted d-inline-flex align-items-center gap-1 mt-1">${ICONS.calendar} <span>${m.date} | ${m.host || "Coordinator"}</span></small>
				</div>
			`);
    });
    if ((data.meetings || []).length === 0) {
      $meetList.append('<div class="text-muted p-2 text-center"><small>No upcoming meetings</small></div>');
    }
    const $memGrid = $("#members-avatars-grid");
    $memGrid.empty();
    (data.members || []).forEach((m) => {
      $memGrid.append(`
				<div class="member-chip p-1" style="display: inline-flex; align-items: center; gap: 6px; margin: 4px;">
					<span class="avatar-circle" style="width:28px;height:28px;border-radius:50%;background:#4338ca;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;">
						${(m.full_name || m.user).substring(0, 2).toUpperCase()}
					</span>
					<small class="font-weight-medium">${m.full_name || m.user}</small>
				</div>
			`);
    });
    const $newsCont = $("#news-feed-container");
    $newsCont.empty();
    (data.news || []).forEach((n) => {
      $newsCont.append(`
				<div class="news-bulletin p-2 mb-2" style="background: #f8fafc; border-left: 3px solid #6366f1; border-radius: 4px;">
					<h5 class="m-0 font-weight-bold">${n.title}</h5>
					<small class="text-muted">${n.author} on ${n.date}</small>
					<p class="m-0 mt-1 text-secondary" style="font-size: 12px;">${n.content}</p>
				</div>
			`);
    });
  }
  renderMilestoneTimeline(milestones) {
    const $markers = $("#timeline-markers-container");
    $markers.empty();
    if (!milestones || milestones.length === 0) {
      $("#timeline-axis-bar").hide();
      $markers.html(`<div class="text-center" style="width: 100%;"><span class="timeline-empty-msg text-muted">${ICONS.info} No delivery milestones recorded yet.</span></div>`);
      return;
    }
    $("#timeline-axis-bar").show();
    const self = this;
    milestones.forEach((m) => {
      const completedCls = m.completed ? "completed" : "";
      const $pt = $(`
				<div class="milestone-marker-point" data-id="${m.id}" title="${m.title} (${m.due_date || "TBD"})">
					<span class="milestone-date">${(m.due_date || "").substring(5)}</span>
					<div class="milestone-diamond ${completedCls}"></div>
					<span class="milestone-label">${m.title}</span>
				</div>
			`);
      $pt.on("click", function() {
        frappe.msgprint({
          title: __("Milestone Delivery Details"),
          message: `<h4>${m.title}</h4><p><strong>Target Due Date:</strong> ${m.due_date || "None"}</p><p><strong>Status:</strong> ${m.status}</p>`,
          indicator: m.completed ? "green" : "orange"
        });
      });
      $markers.append($pt);
    });
  }
  // -------------------------------------------------------------------------
  // TAB 2: WORK PACKAGES GRID (Screenshot 3)
  // -------------------------------------------------------------------------
  renderWorkPackages(searchQuery = null) {
    const self = this;
    frappe.call({
      method: "construction_bim.api.project_studio.list_work_packages",
      args: {
        project: self.currentProject,
        filter_key: self.activeFilterKey,
        type_filter: self.activeTypeFilter,
        search: searchQuery
      }
    }).then((r) => {
      const items = r.message || [];
      const $tbody = $("#wp-table-body");
      $tbody.empty();
      if (items.length === 0) {
        $tbody.append('<tr><td colspan="7" class="text-center text-muted p-4">No work packages match this filter.</td></tr>');
        return;
      }
      items.forEach((it) => {
        const pillCls = `wp-pill-${(it.type || "task").toLowerCase()}`;
        const indent = it.parent_task ? "&nbsp;&nbsp;&nbsp;&nbsp;\u21B3 " : "";
        const $tr = $(`
					<tr class="wp-row-item" data-id="${it.id}" style="cursor: pointer;">
						<td><small class="text-muted">#${it.id.replace("TASK-", "")}</small></td>
						<td>${indent}<strong>${it.subject}</strong></td>
						<td><span class="wp-pill ${pillCls}">${it.type}</span></td>
						<td><span class="status-dot"></span> ${it.status}</td>
						<td><small>${it.assignee_name || "Unassigned"}</small></td>
						<td><small>${it.priority}</small></td>
						<td><small class="text-muted">${it.exp_end_date || "--"}</small></td>
					</tr>
				`);
        $tr.on("click", function() {
          self.openWorkPackageInspector(it);
        });
        $tbody.append($tr);
      });
    });
  }
  openWorkPackageInspector(wp) {
    const self = this;
    const d = new frappe.ui.Dialog({
      title: `[${wp.type}] #${wp.id} - ${wp.subject}`,
      fields: [
        { fieldname: "status", label: __("Status"), fieldtype: "Select", options: "Open\nWorking\nPending Review\nCompleted\nCancelled", default: wp.status },
        { fieldname: "priority", label: __("Priority"), fieldtype: "Select", options: "Low\nNormal\nHigh\nUrgent", default: wp.priority },
        { fieldname: "exp_end_date", label: __("Due Date"), fieldtype: "Date", default: wp.exp_end_date },
        { fieldname: "linked_info", label: __("Domain Linkage"), fieldtype: "HTML" }
      ],
      primary_action_label: __("Update Work Package"),
      primary_action(values) {
        frappe.call({
          method: "frappe.client.set_value",
          args: {
            doctype: "Task",
            name: wp.id,
            fieldname: {
              status: values.status,
              priority: values.priority,
              exp_end_date: values.exp_end_date
            }
          }
        }).then(() => {
          d.hide();
          frappe.show_alert({ message: __("Work package updated."), indicator: "green" });
          self.renderWorkPackages();
          if (self.currentTab === "boards") self.renderKanbanBoard();
        });
      }
    });
    let linkHtml = '<div class="text-muted"><small>Native Task in ERPNext.</small></div>';
    if (wp.bcf_topic) {
      linkHtml = `<div class="alert alert-warning d-flex align-items-center gap-2"><span class="mr-1">${ICONS.cube}</span> <div>Linked to BCF Clash Topic: <strong>${wp.bcf_topic}</strong></div></div>`;
    } else if (wp.rfi_link) {
      linkHtml = `<div class="alert alert-info d-flex align-items-center gap-2"><span class="mr-1">${ICONS.info}</span> <div>Linked to Technical RFI: <strong>${wp.rfi_link}</strong></div></div>`;
    }
    d.fields_dict.linked_info.$wrapper.html(linkHtml);
    d.show();
  }
  // -------------------------------------------------------------------------
  // TAB 3: KANBAN BOARDS (HTML5 Drag & Drop)
  // -------------------------------------------------------------------------
  renderKanbanBoard() {
    const self = this;
    frappe.call({
      method: "construction_bim.api.project_studio.get_kanban_board_data",
      args: {
        project: self.currentProject,
        group_by: self.boardGroupBy
      }
    }).then((r) => {
      const data = r.message || {};
      const columns = data.columns || [];
      const $wrapper = $("#kanban-columns-wrapper");
      $wrapper.empty();
      columns.forEach((col) => {
        const $col = $(`
					<div class="kanban-column" data-col-id="${col.id}">
						<div class="column-header">
							<span>${col.title}</span>
							<span class="badge col-card-count">${col.cards.length}</span>
						</div>
						<div class="column-cards-list" data-col-id="${col.id}">
							<!-- Cards -->
						</div>
					</div>
				`);
        const $cardsList = $col.find(".column-cards-list");
        $cardsList.on("dragover", function(e) {
          e.preventDefault();
          $(this).css("background", "#e2e8f0");
        });
        $cardsList.on("dragleave", function(e) {
          $(this).css("background", "");
        });
        $cardsList.on("drop", function(e) {
          e.preventDefault();
          $(this).css("background", "");
          const taskId = e.originalEvent.dataTransfer.getData("text/plain");
          const targetColumnId = col.id;
          if (taskId && targetColumnId) {
            const $draggedCard = $(`[data-task="${taskId}"]`);
            if ($draggedCard.length > 0) {
              $cardsList.append($draggedCard);
              self.updateBoardColumnCounts();
            }
            frappe.call({
              method: "construction_bim.api.project_studio.update_work_package_status",
              args: {
                task_name: taskId,
                new_column: targetColumnId,
                group_by: self.boardGroupBy
              }
            }).then(() => {
              frappe.show_alert({ message: __("Work package status updated to {0}", [targetColumnId]), indicator: "green" });
            });
          }
        });
        col.cards.forEach((card) => {
          const pillCls = `wp-pill-${(card.type || "task").toLowerCase()}`;
          const assigneeName = card.assignee_name || "";
          const assigneeInitials = assigneeName ? assigneeName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "";
          const assigneeHtml = assigneeName ? `
						<span class="card-assignee-pill" title="${assigneeName}">
							<span class="assignee-avatar">${assigneeInitials}</span>
							<span class="assignee-text">${assigneeName}</span>
						</span>
					` : "";
          const $card = $(`
						<div class="kanban-card" draggable="true" data-task="${card.id}">
							<div class="kanban-card-head">
								<span class="wp-pill ${pillCls}">${card.type}</span>
								<span class="card-priority priority-${(card.priority || "normal").toLowerCase()}">${card.priority}</span>
							</div>
							<div class="kanban-card-title">${card.subject}</div>
							<div class="kanban-card-foot">
								<span class="card-date-badge">${ICONS.calendar} <span>${card.exp_end_date || "--"}</span></span>
								${assigneeHtml}
							</div>
						</div>
					`);
          $card.on("dragstart", function(e) {
            e.originalEvent.dataTransfer.setData("text/plain", card.id);
          });
          $card.on("click", function() {
            self.openWorkPackageInspector(card);
          });
          $cardsList.append($card);
        });
        $wrapper.append($col);
      });
    });
  }
  updateBoardColumnCounts() {
    $(".kanban-column").each(function() {
      const count = $(this).find(".kanban-card").length;
      $(this).find(".col-card-count").text(count);
    });
  }
  // -------------------------------------------------------------------------
  // TAB 4: GANTT SCHEDULE TIMELINE
  // -------------------------------------------------------------------------
  renderGanttChart() {
    const self = this;
    frappe.call({
      method: "construction_bim.api.project_studio.list_work_packages",
      args: { project: self.currentProject, filter_key: "all_open" }
    }).then((r) => {
      const items = r.message || [];
      const $target = $("#frappe-gantt-target");
      $target.empty();
      if (items.length === 0) {
        $target.html(`
					<div class="empty-state-card">
						<div class="empty-state-icon mb-2 text-muted">${ICONS.calendar}</div>
						<h4 style="font-weight:600; font-size:15px; color:#111827; margin:0 0 6px 0;">No Scheduled Tasks</h4>
						<p class="text-muted mb-3" style="font-size:13px; max-width: 360px;">Work packages with start and due dates will appear here on an interactive schedule timeline.</p>
						<button class="btn-topbar-primary action-quick-add" data-type="Task">
							<span>+ Add Task</span>
						</button>
					</div>
				`);
        return;
      }
      const nowStr = frappe.datetime && frappe.datetime.get_today ? frappe.datetime.get_today() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const ganttTasks = items.map((it) => {
        const start = it.exp_start_date || nowStr;
        const end = it.exp_end_date || (frappe.datetime && frappe.datetime.add_days ? frappe.datetime.add_days(start, 7) : start);
        return {
          id: it.id,
          name: `[${it.type}] ${it.subject}`,
          start,
          end,
          progress: it.progress || 0,
          custom_class: `bar-${it.type.toLowerCase()}`
        };
      });
      if (window.Gantt) {
        try {
          self.ganttChart = new window.Gantt("#frappe-gantt-target", ganttTasks, {
            view_modes: ["Quarter Day", "Half Day", "Day", "Week", "Month"],
            view_mode: "Day",
            date_format: "YYYY-MM-DD",
            on_click: (task) => {
              const wp = items.find((i) => i.id === task.id);
              if (wp) self.openWorkPackageInspector(wp);
            }
          });
          $(".gantt-scale-group .btn-gantt-scale").off("click").on("click", function() {
            $(".gantt-scale-group .btn-gantt-scale").removeClass("active");
            $(this).addClass("active");
            const scale = $(this).data("scale");
            if (self.ganttChart && self.ganttChart.change_view_mode) {
              self.ganttChart.change_view_mode(scale);
            }
          });
          return;
        } catch (e) {
          console.warn("Frappe Gantt instantiation failed, rendering custom timeline fallback", e);
        }
      }
      let html = '<div class="custom-gantt-table table-responsive"><table class="table table-bordered table-condensed"><thead><tr><th width="30%">Work Package</th><th width="15%">Start Date</th><th width="15%">Due Date</th><th width="40%">Timeline Progress</th></tr></thead><tbody>';
      items.forEach((it) => {
        const pillCls = `wp-pill-${(it.type || "task").toLowerCase()}`;
        const progress = Math.min(100, Math.max(0, it.progress || (it.status === "Completed" ? 100 : 25)));
        html += `
					<tr class="wp-gantt-row" data-id="${it.id}" style="cursor: pointer;">
						<td><span class="wp-pill ${pillCls}">${it.type}</span> <strong>${it.subject}</strong></td>
						<td><small>${it.exp_start_date || "--"}</small></td>
						<td><small>${it.exp_end_date || "--"}</small></td>
						<td>
							<div class="progress" style="margin: 0; height: 18px; border-radius: 9px; background: #e2e8f0;">
								<div class="progress-bar progress-bar-striped" role="progressbar" style="width: ${progress}%; background: #0284c7;">
									${progress}%
								</div>
							</div>
						</td>
					</tr>
				`;
      });
      html += "</tbody></table></div>";
      $target.html(html);
      $target.find(".wp-gantt-row").on("click", function() {
        const id = $(this).data("id");
        const wp = items.find((i) => i.id === id);
        if (wp) self.openWorkPackageInspector(wp);
      });
    });
  }
  // -------------------------------------------------------------------------
  // TAB 5: BCF 2-PANE COORDINATION VIEWER (Screenshot 4)
  // -------------------------------------------------------------------------
  renderBcfViewer(targetModel = null) {
    const self = this;
    const $iframe = $("#iframe-bcf-3d-viewer");
    const targetParam = targetModel ? `&model=${encodeURIComponent(targetModel)}` : "";
    const expectedSrc = `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}${targetParam}`;
    if ($iframe.length && $iframe.attr("src") !== expectedSrc) {
      $iframe.attr("src", expectedSrc);
    }
    $("#btn-bcf-open-fullscreen").attr("href", expectedSrc);
    frappe.call({
      method: "construction_bim.api.project_studio.get_bcf_coordination_data",
      args: { project: self.currentProject }
    }).then((r) => {
      const data = r.message || { models: [], topics: [] };
      const models = data.models || [];
      const topics = data.topics || [];
      const $tree = $("#bcf-models-tree");
      $tree.empty();
      if (models.length === 0) {
        $tree.append('<div class="text-muted p-3 text-center"><small>No IFC models uploaded yet.<br>Click <strong>+ Upload IFC</strong> above to add one.</small></div>');
      } else {
        models.forEach((m) => {
          const isChecked = targetModel ? m.name === targetModel || m.model_name === targetModel : true;
          $tree.append(`
						<div class="model-tree-row p-2 flex-between" style="border-bottom: 1px solid #f1f5f9; border-radius: 6px;">
							<label style="font-weight: normal; font-size: 12.5px; cursor: pointer; margin: 0; display: flex; align-items: center; gap: 6px;">
								<input type="checkbox" class="model-tree-cb" ${isChecked ? "checked" : ""} data-model="${m.name}">
								<span class="badge" style="background:#e0e7ff; color:#4338ca; font-size:10px; font-weight:600;">${m.discipline || "IFC"}</span>
								<span>${m.model_name || m.name}</span>
							</label>
							<a href="javascript:void(0)" class="action-focus-model text-muted ml-1" data-model="${m.name}" title="View this model">${ICONS.eye}</a>
						</div>
					`);
        });
        $tree.find(".model-tree-cb").on("change", function() {
          const mName = $(this).data("model");
          if ($(this).is(":checked")) {
            $("#iframe-bcf-3d-viewer").attr("src", `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}&model=${encodeURIComponent(mName)}`);
          }
        });
        $tree.find(".action-focus-model").on("click", function() {
          const mName = $(this).data("model");
          $tree.find(".model-tree-cb").prop("checked", false);
          $tree.find(`.model-tree-cb[data-model="${mName}"]`).prop("checked", true);
          $("#iframe-bcf-3d-viewer").attr("src", `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}&model=${encodeURIComponent(mName)}`);
        });
      }
      $("#bcf-topic-count").text(topics.length);
      const $stream = $("#bcf-cards-container");
      $stream.empty();
      if (topics.length === 0) {
        $stream.append('<div class="text-muted p-4 text-center"><small>No BCF topics logged for this project.</small></div>');
      } else {
        topics.forEach((top) => {
          $stream.append(`
						<div class="bcf-topic-card mb-2">
							<div class="flex-between mb-1">
								<span class="status-warning-pill">${escapeHtml(top.topic_type)}</span>
								<span class="text-muted" style="font-size:11px;">${escapeHtml(top.status)}</span>
							</div>
							<div class="font-weight-medium" style="font-size:13px; color:#111827;">${escapeHtml(top.title)}</div>
							<div class="text-muted d-flex align-items-center gap-1 mt-1" style="font-size:11.5px;">
								<span>${ICONS.clock}</span>
								<span>${escapeHtml(top.creation ? top.creation.split(" ")[0] : "--")}</span>
								<span class="mx-1">\u2022</span>
								<span>${escapeHtml(top.assigned_to || "Unassigned")}</span>
							</div>
						</div>
					`);
        });
      }
    });
  }
  // -------------------------------------------------------------------------
  // TAB 8: PROJECT DOCUMENTS TREE & UPLOAD
  // -------------------------------------------------------------------------
  renderDocumentsTree() {
    const self = this;
    frappe.call({
      method: "construction_bim.api.project_studio.get_project_document_tree",
      args: { project: self.currentProject }
    }).then((r) => {
      const folders = r.message || [];
      const $cont = $("#document-folders-container");
      $cont.empty();
      const folderConfig = {
        "01 Contracts & NTP": { icon: ICONS.file, bg: "#eff6ff", color: "#2563eb" },
        "02 Drawings & Specs": { icon: ICONS.list, bg: "#f5f3ff", color: "#7c3aed" },
        "03 BIM Models": { icon: ICONS.cube, bg: "#fffbeb", color: "#d97706" },
        "04 BOQ & Estimates": { icon: ICONS.table, bg: "#ecfdf5", color: "#059669" },
        "05 Site Media": { icon: ICONS.camera, bg: "#fff1f2", color: "#e11d48" }
      };
      folders.forEach((f) => {
        const cfg = folderConfig[f.folder_name] || { icon: ICONS.folder, bg: "#f1f5f9", color: "#475467" };
        const $box = $(`
					<div class="doc-folder-card">
						<div class="folder-header">
							<div class="folder-icon-pill" style="background: ${cfg.bg}; color: ${cfg.color};">
								${cfg.icon}
							</div>
							<div class="folder-title-box">
								<span class="folder-name">${f.folder_name}</span>
								<span class="folder-count-badge">${f.files.length} items</span>
							</div>
						</div>
						<div class="folder-files-list">
							<!-- Files -->
						</div>
					</div>
				`);
        const $fList = $box.find(".folder-files-list");
        if (f.files.length === 0) {
          $fList.append('<div class="text-muted p-3 text-center" style="font-size:12px;">No files in folder</div>');
        } else {
          f.files.forEach((file) => {
            $fList.append(`
							<a href="javascript:void(0)" class="file-item-link" data-route="${file.route_target}" data-url="${file.file_url}" data-model-id="${file.model_id || file.id || ""}">
								<div class="file-item-left">
									<span class="text-muted mr-1">${ICONS.file}</span>
									<span class="file-name-text">${file.file_name}</span>
								</div>
								<span class="folder-count-badge">${file.badge || "File"}</span>
							</a>
						`);
          });
        }
        $cont.append($box);
      });
      $cont.find(".file-item-link").on("click", function() {
        const route = $(this).data("route");
        const url = $(this).data("url");
        const modelId = $(this).data("model-id");
        if (route === "bim-viewer" || url && url.endsWith(".ifc")) {
          self.switchTab("bcf", { model: modelId });
        } else if (route === "dwg-viewer" || url && (url.endsWith(".dwg") || url.endsWith(".dxf"))) {
          self.switchTab("cad", { file: url });
        } else if (route === "pdf-takeoff" || url && url.endsWith(".pdf")) {
          self.switchTab("pdf", { file: url });
        } else if (url) {
          window.open(url, "_blank");
        }
      });
    });
  }
  handleUploadedFile(fileDoc) {
    const self = this;
    const ext = (fileDoc.file_name || "").split(".").pop().toLowerCase();
    if (ext === "ifc") {
      frappe.show_alert({ message: __("Ingesting IFC model into 3D BIM database..."), indicator: "blue" });
      frappe.call({
        method: "construction_bim.bim.api.create_model_from_ifc",
        args: {
          file_url: fileDoc.file_url,
          file_name: fileDoc.file_name,
          project: self.currentProject,
          model_name: fileDoc.file_name.replace(/\.[^/.]+$/, ""),
          discipline: "Architecture"
        }
      }).then((res) => {
        frappe.show_alert({ message: __("BIM Model ingested successfully!"), indicator: "green" });
        self.renderDocumentsTree();
        self.switchTab("bcf", { model: res.message ? res.message.name : null });
      }).catch((err) => {
        console.error("Failed to parse IFC:", err);
        frappe.msgprint(__("Uploaded file saved, but IFC parsing encountered an issue: ") + (err.message || err));
        self.renderDocumentsTree();
        self.switchTab("bcf");
      });
    } else {
      frappe.show_alert({ message: __("File uploaded successfully."), indicator: "green" });
      self.renderDocumentsTree();
    }
  }
  openFileUploadDialog() {
    const self = this;
    new frappe.ui.FileUploader({
      doctype: "Project",
      docname: self.currentProject,
      folder: "Home",
      on_success(file_doc) {
        self.handleUploadedFile(file_doc);
      }
    });
  }
  openBcfUploadDialog() {
    const self = this;
    new frappe.ui.FileUploader({
      doctype: "Project",
      docname: self.currentProject,
      folder: "Home",
      restrictions: {
        allowed_file_types: [".ifc"]
      },
      on_success(file_doc) {
        self.handleUploadedFile(file_doc);
      }
    });
  }
  // -------------------------------------------------------------------------
  // TAB 9: MEETINGS & TOOLBOX TALKS
  // -------------------------------------------------------------------------
  renderMeetingsTab() {
    const self = this;
    const data = this.projectOverviewData || {};
    const meetings = data.meetings || [];
    const $cont = $("#meetings-tab-container");
    $cont.empty();
    if (meetings.length === 0) {
      $cont.html(`
				<div class="empty-state-card">
					<div class="empty-state-icon mb-2 text-muted">${ICONS.calendar}</div>
					<h4 style="font-weight:600; font-size:15px; color:#111827; margin:0 0 6px 0;">No Briefings Scheduled</h4>
					<p class="text-muted mb-3" style="font-size:13px; max-width: 360px;">No coordination meetings or toolbox talks recorded yet for this project.</p>
					<button class="btn-topbar-primary" id="btn-schedule-meeting-empty">
						<span>+ New Meeting</span>
					</button>
				</div>
			`);
      $cont.find("#btn-schedule-meeting-empty").on("click", () => self.openScheduleMeetingDialog());
      return;
    }
    meetings.forEach((m) => {
      const docType = m.doctype || (m.type === "Toolbox Talk" ? "Toolbox Talk" : "Event");
      const isToolbox = m.type === "Toolbox Talk";
      const pillCls = isToolbox ? "meeting-pill-toolbox" : "meeting-pill-coord";
      $cont.append(`
				<div class="meeting-card-surface">
					<div class="meeting-card-main">
						<div class="meeting-card-header">
							<span class="meeting-badge ${pillCls}">${escapeHtml(m.type)}</span>
							<h4 class="meeting-title">${escapeHtml(m.title)}</h4>
						</div>
						<div class="meeting-meta-row">
							<span class="meta-item">${ICONS.calendar} <span>${escapeHtml(m.date)}</span></span>
							<span class="meta-divider">\u2022</span>
							<span class="meta-item">${ICONS.user} <span>Conductor: ${escapeHtml(m.host || "Site Coordinator")}</span></span>
							<span class="meta-divider">\u2022</span>
							<span class="meta-item">${ICONS.users} <span>Attendees: ${escapeHtml(m.participants || 0)}</span></span>
						</div>
					</div>
					<div class="meeting-card-action">
						<button class="btn-topbar-action btn-sm btn-view-meeting-doc" data-doctype="${escapeHtml(docType)}" data-name="${escapeHtml(m.name)}">
							<span class="mr-1">${ICONS.eye}</span>
							<span>View Doc</span>
						</button>
					</div>
				</div>
			`);
    });
    $cont.find(".btn-view-meeting-doc").on("click", function() {
      const dt = $(this).data("doctype") || "Event";
      const nm = $(this).data("name");
      frappe.set_route("Form", dt, nm);
    });
  }
  openScheduleMeetingDialog() {
    const self = this;
    const d = new frappe.ui.Dialog({
      title: __("Schedule Coordination Meeting or Safety Briefing"),
      fields: [
        { fieldname: "meeting_type", label: __("Type"), fieldtype: "Select", options: "Toolbox Talk\nCoordination Meeting", default: "Toolbox Talk" },
        { fieldname: "subject", label: __("Topic / Subject"), fieldtype: "Data", reqd: 1 },
        { fieldname: "date", label: __("Date"), fieldtype: "Date", default: frappe.datetime && frappe.datetime.get_today ? frappe.datetime.get_today() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0], reqd: 1 },
        { fieldname: "conductor", label: __("Conductor (Safety Officer / Host)"), fieldtype: "Data", default: frappe.session.user_fullname || frappe.session.user || "Administrator", reqd: 1 }
      ],
      primary_action_label: __("Create Meeting"),
      primary_action(values) {
        frappe.call({
          method: "construction_bim.api.project_studio.schedule_project_meeting",
          args: {
            project: self.currentProject,
            meeting_type: values.meeting_type,
            subject: values.subject,
            date: values.date,
            conductor: values.conductor
          }
        }).then(() => {
          d.hide();
          const label = values.meeting_type === "Toolbox Talk" ? __("Toolbox talk scheduled.") : __("Coordination meeting scheduled.");
          self.loadProjectData(self.currentProject);
          if (self.currentTab === "meetings") {
            setTimeout(() => self.renderMeetingsTab(), 150);
          }
        }).catch((err) => {
          console.error("Error scheduling meeting:", err);
          frappe.msgprint(__("Error: ") + (err.message || err));
        });
      }
    });
    d.show();
  }
  // -------------------------------------------------------------------------
  // TAB 10: MEMBERS
  // -------------------------------------------------------------------------
  renderMembersTable() {
    const $tbody = $("#members-table-body");
    $tbody.empty();
    const members = this.projectOverviewData && this.projectOverviewData.members || [];
    if (members.length === 0) {
      $tbody.append('<tr><td colspan="4" class="text-center text-muted p-4"><small>No team members assigned to this project.</small></td></tr>');
      return;
    }
    members.forEach((m) => {
      const fullName = m.full_name || m.user || "Member";
      const initials = fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "MB";
      $tbody.append(`
				<tr class="member-table-row">
					<td>
						<div class="member-cell">
							<span class="member-avatar-circle">${escapeHtml(initials)}</span>
							<span class="member-name font-weight-medium">${escapeHtml(fullName)}</span>
						</div>
					</td>
					<td><span class="text-muted">${escapeHtml(m.user)}</span></td>
					<td><span class="member-role-pill">${escapeHtml(m.role || "Member")}</span></td>
					<td><span class="status-active-pill"><span class="status-dot-green"></span> Active</span></td>
				</tr>
			`);
    });
  }
  // -------------------------------------------------------------------------
  // TAB 11: SETTINGS
  // -------------------------------------------------------------------------
  renderSettingsTab() {
    if (!this.projectOverviewData) return;
    const summary = this.projectOverviewData.summary || {};
    $("#setting-project-name").val(summary.project_name || "");
    $("#setting-status-narrative").val(summary.status_narrative || "");
    $("#setting-is-template").prop("checked", !!summary.is_template);
    $("#setting-is-favorite").prop("checked", !!summary.is_favorite);
  }
  saveProjectSettings() {
    const self = this;
    const settings = {
      project_name: $("#setting-project-name").val(),
      status_narrative: $("#setting-status-narrative").val(),
      is_template: $("#setting-is-template").is(":checked") ? 1 : 0,
      is_favorite: $("#setting-is-favorite").is(":checked") ? 1 : 0
    };
    frappe.call({
      method: "construction_bim.api.project_studio.update_project_settings",
      args: {
        project: self.currentProject,
        settings_json: JSON.stringify(settings)
      }
    }).then(() => {
      frappe.show_alert({ message: __("Project settings saved successfully."), indicator: "green" });
      self.loadProjectsList();
    });
  }
  toggleArchiveProject() {
    const self = this;
    const proj = this.allProjects.find((p) => p.name === this.currentProject);
    const currentActive = proj ? proj.is_active : "Yes";
    const nextActive = currentActive === "Yes" ? "No" : "Yes";
    const actionWord = nextActive === "No" ? __("Archive") : __("Restore");
    frappe.confirm(__("Are you sure you want to {0} this project?", [actionWord.toLowerCase()]), () => {
      self.updateProjectSettingsField(self.currentProject, { is_active: nextActive }).then(() => {
        frappe.show_alert({ message: __("Project {0}d successfully.", [actionWord.toLowerCase()]), indicator: "orange" });
        self.loadProjectsList().then(() => {
          self.switchTab("all-projects");
        });
      });
    });
  }
  confirmDeleteProject() {
    const self = this;
    frappe.confirm(__("\u26A0\uFE0F Are you sure you want to PERMANENTLY DELETE {0}? This cannot be undone.", [self.currentProject]), () => {
      frappe.call({
        method: "frappe.client.delete",
        args: {
          doctype: "Project",
          name: self.currentProject
        }
      }).then(() => {
        frappe.show_alert({ message: __("Project deleted."), indicator: "red" });
        self.loadProjectsList().then(() => {
          self.switchTab("all-projects");
        });
      });
    });
  }
  // -------------------------------------------------------------------------
  // QUICK CREATE MODAL (Screenshot 5)
  // -------------------------------------------------------------------------
  openQuickCreateModal(type) {
    const self = this;
    if (type === "project" || type === "subproject") {
      const isSub = type === "subproject";
      const d2 = new frappe.ui.Dialog({
        title: isSub ? __("Add Subproject") : __("Add New Project"),
        fields: [
          { fieldname: "project_name", label: __("Project Name"), fieldtype: "Data", reqd: 1 },
          { fieldname: "from_template", label: __("Clone from Template"), fieldtype: "Link", options: "Project" }
        ],
        primary_action_label: __("Create Project"),
        primary_action(values) {
          if (values.from_template) {
            frappe.call({
              method: "construction_bim.api.project_studio.clone_project_from_template",
              args: {
                template_project: values.from_template,
                new_project_name: values.project_name
              }
            }).then((r) => {
              d2.hide();
              if (isSub) {
                self.updateProjectSettingsField(r.message.new_project, { parent_project: self.currentProject }).then(() => {
                  self.loadProjectsList();
                });
              } else {
                self.loadProjectsList().then(() => {
                  self.selectProject(r.message.new_project);
                });
              }
            });
          } else {
            frappe.call({
              method: "frappe.client.insert",
              args: {
                doc: {
                  doctype: "Project",
                  project_name: values.project_name,
                  status: "Open",
                  is_active: "Yes",
                  parent_project: isSub ? self.currentProject : null
                }
              }
            }).then((r) => {
              d2.hide();
              self.loadProjectsList().then(() => {
                if (!isSub) self.selectProject(r.message.name);
              });
            });
          }
        }
      });
      d2.show();
      return;
    }
    if (type === "user") {
      const d2 = new frappe.ui.Dialog({
        title: __("Invite Project Member"),
        fields: [
          { fieldname: "email", label: __("User Email"), fieldtype: "Data", reqd: 1 },
          { fieldname: "role", label: __("Project Role"), fieldtype: "Select", options: "Project Manager\nArchitect\nStructural Engineer\nMEP Coordinator\nSafety Officer\nQC Inspector", default: "Project Manager" }
        ],
        primary_action_label: __("Add Member"),
        primary_action(values) {
          frappe.call({
            method: "frappe.client.insert",
            args: {
              doc: {
                doctype: "Project User",
                parent: self.currentProject,
                parentfield: "users",
                parenttype: "Project",
                user: values.email
              }
            }
          }).then(() => {
            d2.hide();
            frappe.show_alert({ message: __("User invited to project."), indicator: "green" });
            self.loadProjectData(self.currentProject);
          });
        }
      });
      d2.show();
      return;
    }
    const d = new frappe.ui.Dialog({
      title: __("Create {0}", [type]),
      fields: [
        { fieldname: "subject", label: __("Subject / Title"), fieldtype: "Data", reqd: 1 },
        { fieldname: "priority", label: __("Priority"), fieldtype: "Select", options: "Low\nNormal\nHigh\nUrgent", default: "Normal" },
        { fieldname: "due_date", label: __("Due Date"), fieldtype: "Date" },
        { fieldname: "description", label: __("Description"), fieldtype: "Small Text" }
      ],
      primary_action_label: __("Create"),
      primary_action(values) {
        frappe.call({
          method: "construction_bim.api.project_studio.quick_create_work_package",
          args: {
            project: self.currentProject,
            wp_type: type,
            subject: values.subject,
            priority: values.priority,
            due_date: values.due_date,
            description: values.description
          }
        }).then(() => {
          d.hide();
          frappe.show_alert({ message: __("Work package created."), indicator: "green" });
          if (self.currentTab === "work-packages") self.renderWorkPackages();
          if (self.currentTab === "boards") self.renderKanbanBoard();
        });
      }
    });
    d.show();
  }
  updateProjectHealthStatus(newHealth) {
    const self = this;
    this.updateProjectSettingsField(this.currentProject, { health_status: newHealth }).then(() => {
      frappe.show_alert({ message: __("Project health set to {0}", [newHealth]), indicator: "blue" });
      if (self.page && self.page.set_indicator) {
        const color = newHealth === "On Track" ? "green" : newHealth === "At Risk" ? "orange" : "red";
        self.page.set_indicator(newHealth, color);
      }
    });
  }
  updateProjectSettingsField(projectName, patchDict) {
    return frappe.call({
      method: "construction_bim.api.project_studio.update_project_settings",
      args: {
        project: projectName,
        settings_json: JSON.stringify(patchDict)
      }
    });
  }
  editStatusNarrativePrompt() {
    const self = this;
    frappe.prompt(
      {
        fieldname: "narrative",
        label: __("Status Description / Commentary"),
        fieldtype: "Small Text",
        default: $("#overview-status-narrative").text()
      },
      function(values) {
        self.updateProjectSettingsField(self.currentProject, { status_narrative: values.narrative }).then(() => {
          $("#overview-status-narrative").text(values.narrative);
          frappe.show_alert({ message: __("Status note updated."), indicator: "green" });
        });
      },
      __("Edit Health Status Description"),
      __("Save")
    );
  }
};
window.ProjectStudioApp = ProjectStudioApp;
var project_studio_app_default = ProjectStudioApp;
export {
  project_studio_app_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3Byb2plY3Rfc3R1ZGlvX2FwcC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gUHJvamVjdCBTdHVkaW8gRnJvbnRlbmQgQXBwbGljYXRpb24gKE9wZW5Qcm9qZWN0IEJJTSBQYXJpdHkpXG4vLyBNYW5hZ2VzIEFsbCBQcm9qZWN0cyBIdWIsIFByb2plY3QgSG9tZSwgV29yayBQYWNrYWdlcywgQm9hcmRzLCBCQ0YsIERvY3VtZW50cywgU2V0dGluZ3NcblxuY29uc3QgSUNPTlMgPSB7XG5cdGNhbGVuZGFyOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxM1wiIGhlaWdodD1cIjEzXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiNFwiIHJ4PVwiMlwiLz48bGluZSB4MT1cIjE2XCIgeTE9XCIyXCIgeDI9XCIxNlwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjhcIiB5MT1cIjJcIiB4Mj1cIjhcIiB5Mj1cIjZcIi8+PGxpbmUgeDE9XCIzXCIgeTE9XCIxMFwiIHgyPVwiMjFcIiB5Mj1cIjEwXCIvPjwvc3ZnPmAsXG5cdHVzZXI6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djJcIi8+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCI3XCIgcj1cIjRcIi8+PC9zdmc+YCxcblx0dXNlcnM6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINmE0IDQgMCAwIDAtNCA0djJcIi8+PGNpcmNsZSBjeD1cIjlcIiBjeT1cIjdcIiByPVwiNFwiLz48cGF0aCBkPVwiTTIyIDIxdi0yYTQgNCAwIDAgMC0zLTMuODdcIi8+PHBhdGggZD1cIk0xNiAzLjEzYTQgNCAwIDAgMSAwIDcuNzVcIi8+PC9zdmc+YCxcblx0ZXllOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxM1wiIGhlaWdodD1cIjEzXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk0yIDEyczMtNyAxMC03IDEwIDcgMTAgNy0zIDctMTAgNy0xMC03LTEwLTdaXCIvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiLz48L3N2Zz5gLFxuXHRjbG9jazogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTNcIiBoZWlnaHQ9XCIxM1wiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNzVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIi8+PHBvbHlsaW5lIHBvaW50cz1cIjEyIDYgMTIgMTIgMTYgMTRcIi8+PC9zdmc+YCxcblx0ZmlsZTogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNzVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNMTQuNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWNy41TDE0LjUgMnpcIi8+PHBvbHlsaW5lIHBvaW50cz1cIjE0IDIgMTQgOCAyMCA4XCIvPjwvc3ZnPmAsXG5cdGZvbGRlcjogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNzVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNNCAyMGgxNmEyIDIgMCAwIDAgMi0yVjhhMiAyIDAgMCAwLTItMmgtNy45M2EyIDIgMCAwIDEtMS42Ni0uOWwtLjgyLTEuMkEyIDIgMCAwIDAgNy45MyAzSDRhMiAyIDAgMCAwLTIgMnYxM2MwIDEuMS45IDIgMiAyWlwiLz48L3N2Zz5gLFxuXHRjaGVjazogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjJcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwb2x5bGluZSBwb2ludHM9XCIyMCA2IDkgMTcgNCAxMlwiLz48L3N2Zz5gLFxuXHRsaXN0OiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGxpbmUgeDE9XCI4XCIgeTE9XCI2XCIgeDI9XCIyMVwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjhcIiB5MT1cIjEyXCIgeDI9XCIyMVwiIHkyPVwiMTJcIi8+PGxpbmUgeDE9XCI4XCIgeTE9XCIxOFwiIHgyPVwiMjFcIiB5Mj1cIjE4XCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiNlwiIHgyPVwiMy4wMVwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjEyXCIgeDI9XCIzLjAxXCIgeTI9XCIxMlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjE4XCIgeDI9XCIzLjAxXCIgeTI9XCIxOFwiLz48L3N2Zz5gLFxuXHRjdWJlOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxNVwiIGhlaWdodD1cIjE1XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnpcIi8+PHBvbHlsaW5lIHBvaW50cz1cIjMuMjkgNyAxMiAxMiAyMC43MSA3XCIvPjxsaW5lIHgxPVwiMTJcIiB5MT1cIjIyXCIgeDI9XCIxMlwiIHkyPVwiMTJcIi8+PC9zdmc+YCxcblx0aW5mbzogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNzVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIi8+PGxpbmUgeDE9XCIxMlwiIHkxPVwiMTZcIiB4Mj1cIjEyXCIgeTI9XCIxMlwiLz48bGluZSB4MT1cIjEyXCIgeTE9XCI4XCIgeDI9XCIxMi4wMVwiIHkyPVwiOFwiLz48L3N2Zz5gLFxuXHRhcnJvd1JpZ2h0OiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxM1wiIGhlaWdodD1cIjEzXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGxpbmUgeDE9XCI1XCIgeTE9XCIxMlwiIHgyPVwiMTlcIiB5Mj1cIjEyXCIvPjxwb2x5bGluZSBwb2ludHM9XCIxMiA1IDE5IDEyIDEyIDE5XCIvPjwvc3ZnPmAsXG5cdHRhYmxlOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxNVwiIGhlaWdodD1cIjE1XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiLz48cGF0aCBkPVwiTTMgOWgxOFwiLz48cGF0aCBkPVwiTTMgMTVoMThcIi8+PHBhdGggZD1cIk05IDN2MThcIi8+PHBhdGggZD1cIk0xNSAzdjE4XCIvPjwvc3ZnPmAsXG5cdGNhbWVyYTogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTVcIiBoZWlnaHQ9XCIxNVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNzVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNMTQuNSA0aC01TDcgN0g0YTIgMiAwIDAgMC0yIDJ2OWEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJWOWEyIDIgMCAwIDAtMi0yaC0zbC0yLjUtM3pcIi8+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxM1wiIHI9XCIzXCIvPjwvc3ZnPmAsXG5cdHN0YXI6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBmaWxsPVwiI2Y1OWUwYlwiIHN0cm9rZT1cIiNmNTllMGJcIiBzdHJva2Utd2lkdGg9XCIxXCI+PHBvbHlnb24gcG9pbnRzPVwiMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMlwiLz48L3N2Zz5gLFxuXHRzdGFyRW1wdHk6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCIjOWNhM2FmXCIgc3Ryb2tlLXdpZHRoPVwiMS41XCIgZmlsbD1cIm5vbmVcIj48cG9seWdvbiBwb2ludHM9XCIxMiAyIDE1LjA5IDguMjYgMjIgOS4yNyAxNyAxNC4xNCAxOC4xOCAyMS4wMiAxMiAxNy43NyA1LjgyIDIxLjAyIDcgMTQuMTQgMiA5LjI3IDguOTEgOC4yNiAxMiAyXCIvPjwvc3ZnPmBcbn07XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyKSB7XG5cdGlmIChzdHIgPT0gbnVsbCkgcmV0dXJuICcnO1xuXHRpZiAod2luZG93LmZyYXBwZSAmJiBmcmFwcGUudXRpbHMgJiYgZnJhcHBlLnV0aWxzLmVzY2FwZV9odG1sKSB7XG5cdFx0cmV0dXJuIGZyYXBwZS51dGlscy5lc2NhcGVfaHRtbChTdHJpbmcoc3RyKSk7XG5cdH1cblx0cmV0dXJuIFN0cmluZyhzdHIpXG5cdFx0LnJlcGxhY2UoLyYvZywgJyZhbXA7Jylcblx0XHQucmVwbGFjZSgvPC9nLCAnJmx0OycpXG5cdFx0LnJlcGxhY2UoLz4vZywgJyZndDsnKVxuXHRcdC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jylcblx0XHQucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbn1cblxuY2xhc3MgUHJvamVjdFN0dWRpb0FwcCB7XG5cdGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xuXHRcdHRoaXMub3B0cyA9IG9wdHM7XG5cdFx0dGhpcy5wYWdlID0gb3B0cy5wYWdlIHx8ICh3aW5kb3cuY3VyX3BhZ2UgJiYgd2luZG93LmN1cl9wYWdlLnBhZ2UpIHx8IChmcmFwcGUuY29udGFpbmVyICYmIGZyYXBwZS5jb250YWluZXIucGFnZSAmJiBmcmFwcGUuY29udGFpbmVyLnBhZ2UucGFnZSk7XG5cdFx0dGhpcy5jdXJyZW50UHJvamVjdCA9IG51bGw7XG5cdFx0dGhpcy5hbGxQcm9qZWN0cyA9IFtdO1xuXHRcdHRoaXMuY3VycmVudFRhYiA9ICdob21lJztcblx0XHR0aGlzLmFjdGl2ZUZpbHRlcktleSA9ICdhbGxfb3Blbic7XG5cdFx0dGhpcy5hY3RpdmVUeXBlRmlsdGVyID0gJ2FsbCc7XG5cdFx0dGhpcy5ib2FyZEdyb3VwQnkgPSAnc3RhdHVzJztcblx0XHR0aGlzLmlzU2lkZWJhckNvbGxhcHNlZCA9IGZhbHNlO1xuXG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblxuXHRpbml0KCkge1xuXHRcdHRoaXMuc2V0dXBOYXRpdmVQYWdlSGVhZGVyKCk7XG5cdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdFx0dGhpcy5sb2FkUHJvamVjdHNMaXN0KCkudGhlbigoKSA9PiB7XG5cdFx0XHQvLyBDaGVjayBVUkwgcGFyYW1ldGVycyBmb3IgcHJvamVjdFxuXHRcdFx0Y29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblx0XHRcdGNvbnN0IHByb2pQYXJhbSA9IHVybFBhcmFtcy5nZXQoJ3Byb2plY3QnKTtcblx0XHRcdGNvbnN0IHRhYlBhcmFtID0gdXJsUGFyYW1zLmdldCgndGFiJyk7XG5cblx0XHRcdGlmIChwcm9qUGFyYW0gJiYgcHJvalBhcmFtICE9PSAnYWxsJykge1xuXHRcdFx0XHR0aGlzLnNlbGVjdFByb2plY3QocHJvalBhcmFtLCB0YWJQYXJhbSB8fCAnaG9tZScpO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLmFsbFByb2plY3RzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5zZWxlY3RQcm9qZWN0KHRoaXMuYWxsUHJvamVjdHNbMF0ubmFtZSwgdGFiUGFyYW0gfHwgJ2hvbWUnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc3dpdGNoVGFiKCdhbGwtcHJvamVjdHMnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHNldHVwTmF0aXZlUGFnZUhlYWRlcigpIHtcblx0XHRpZiAoIXRoaXMucGFnZSkgcmV0dXJuO1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dGhpcy5wYWdlLnNldF90aXRsZShfXygnRGFzaGJvYXJkJykpO1xuXHRcdGlmICh0aGlzLmN1cnJlbnRQcm9qZWN0KSB7XG5cdFx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlX3N1Yih0aGlzLmN1cnJlbnRQcm9qZWN0KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wYWdlLmNsZWFyX2FjdGlvbl9iYXIpIHRoaXMucGFnZS5jbGVhcl9hY3Rpb25fYmFyKCk7XG5cdFx0aWYgKHRoaXMucGFnZS5jbGVhcl9wcmltYXJ5X2FjdGlvbikgdGhpcy5wYWdlLmNsZWFyX3ByaW1hcnlfYWN0aW9uKCk7XG5cblx0XHQvLyBQcmltYXJ5IEFjdGlvbjogKyBDcmVhdGVcblx0XHR0aGlzLnBhZ2Uuc2V0X3ByaW1hcnlfYWN0aW9uKFxuXHRcdFx0X18oJ0NyZWF0ZScpLFxuXHRcdFx0KCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnVGFzaycpLFxuXHRcdFx0J2FkZCdcblx0XHQpO1xuXG5cdFx0Ly8gQWRkIHN0YW5kYXJkIHdvcmsgcGFja2FnZSB0eXBlcyB1bmRlciBDcmVhdGUgZ3JvdXBcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnU3RhbmRhcmQgVGFzaycpLCAoKSA9PiBzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdUYXNrJyksIF9fKCdDcmVhdGUnKSk7XG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ01pbGVzdG9uZScpLCAoKSA9PiBzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdNaWxlc3RvbmUnKSwgX18oJ0NyZWF0ZScpKTtcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnUGhhc2UnKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnUGhhc2UnKSwgX18oJ0NyZWF0ZScpKTtcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnSXNzdWUgLyBQdW5jaGxpc3QnKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnSXNzdWUnKSwgX18oJ0NyZWF0ZScpKTtcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnUmVtYXJrJyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ1JlbWFyaycpLCBfXygnQ3JlYXRlJykpO1xuXHRcdHRoaXMucGFnZS5hZGRfaW5uZXJfYnV0dG9uKF9fKCdSZXF1ZXN0IC8gUkZJJyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ1JlcXVlc3QnKSwgX18oJ0NyZWF0ZScpKTtcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnQ2xhc2ggVG9waWMnKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnQ2xhc2gnKSwgX18oJ0NyZWF0ZScpKTtcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnTmV3IFByb2plY3QnKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgncHJvamVjdCcpLCBfXygnQ3JlYXRlJykpO1xuXHRcdHRoaXMucGFnZS5hZGRfaW5uZXJfYnV0dG9uKF9fKCdJbnZpdGUgTWVtYmVyJyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ3VzZXInKSwgX18oJ0NyZWF0ZScpKTtcblxuXHRcdC8vIFRvb2xiYXIgdXRpbGl0eSBidXR0b25zIChNYXRjaGluZyBGcmFwcGUgQ1JNOiBSZWZyZXNoLCBFZGl0LCBEZXNrKVxuXHRcdHRoaXMucGFnZS5hZGRfYnV0dG9uKF9fKCdSZWZyZXNoJyksICgpID0+IHtcblx0XHRcdGlmIChzZWxmLmN1cnJlbnRQcm9qZWN0KSB7XG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCk7XG5cdFx0XHR9XG5cdFx0fSwgeyBpY29uOiAncmVmcmVzaCcgfSk7XG5cblx0XHR0aGlzLnBhZ2UuYWRkX2J1dHRvbihfXygnRWRpdCcpLCAoKSA9PiB7XG5cdFx0XHRpZiAoc2VsZi5jdXJyZW50UHJvamVjdCkge1xuXHRcdFx0XHRmcmFwcGUuc2V0X3JvdXRlKCdGb3JtJywgJ1Byb2plY3QnLCBzZWxmLmN1cnJlbnRQcm9qZWN0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdzZXR0aW5ncycpO1xuXHRcdFx0fVxuXHRcdH0sIHsgaWNvbjogJ2VkaXQnIH0pO1xuXG5cdFx0dGhpcy5wYWdlLmFkZF9idXR0b24oX18oJ0Rlc2snKSwgKCkgPT4ge1xuXHRcdFx0ZnJhcHBlLnNldF9yb3V0ZSgnZGVzaycpO1xuXHRcdH0sIHsgaWNvbjogJ2dyaWQnIH0pO1xuXHR9XG5cblx0YmluZEV2ZW50cygpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdC8vIFNpZGViYXIgY29sbGFwc2UgdG9nZ2xlXG5cdFx0JCgnI2J0bi10b2dnbGUtc2lkZWJhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkID0gIXNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkO1xuXHRcdFx0JCgnI3N0dWRpby1zaWRlYmFyJykudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcsIHNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkKTtcblx0XHR9KTtcblxuXHRcdC8vIE5hdmlnYXRpb24gbGlua3Ncblx0XHQkKCcuc3R1ZGlvLW5hdi1saXN0Jykub24oJ2NsaWNrJywgJy5uYXYtaXRlbScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IHRhYiA9ICQodGhpcykuZGF0YSgndGFiJyk7XG5cdFx0XHRzZWxmLnN3aXRjaFRhYih0YWIpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gRmlsdGVyIHBpbGwgYnV0dG9ucyAoRnJhcHBlIENSTSBzdHlsZSlcblx0XHQkKCcjZmlsdGVyLXByb2plY3QtYnRuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHQkKCcjcHJvamVjdFN3aXRjaGVyQnRuJykuZHJvcGRvd24oJ3RvZ2dsZScpO1xuXHRcdH0pO1xuXG5cdFx0JCgnI2ZpbHRlci1kYXRlLWJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ0ZpbHRlcjogTGFzdCAzMCBEYXlzIChBY3RpdmUpJyksIGluZGljYXRvcjogJ2JsdWUnIH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gUmVmcmVzaCBidXR0b25cblx0XHQkKCcjYnRuLXN0dWRpby1yZWZyZXNoJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHNlbGYuY3VycmVudFByb2plY3QpIHtcblx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdERhdGEoc2VsZi5jdXJyZW50UHJvamVjdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIEVkaXQgYnV0dG9uXG5cdFx0JCgnI2J0bi1zdHVkaW8tZWRpdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChzZWxmLmN1cnJlbnRQcm9qZWN0KSB7XG5cdFx0XHRcdGZyYXBwZS5zZXRfcm91dGUoJ0Zvcm0nLCAnUHJvamVjdCcsIHNlbGYuY3VycmVudFByb2plY3QpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3NldHRpbmdzJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBRdWljayBjcmVhdGUgZHJvcGRvd24gYWN0aW9uc1xuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuYWN0aW9uLXF1aWNrLWFkZCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IHR5cGUgPSAkKHRoaXMpLmRhdGEoJ3R5cGUnKTtcblx0XHRcdHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwodHlwZSk7XG5cdFx0fSk7XG5cblx0XHQvLyBBZGQgcHJvamVjdCBidXR0b25cblx0XHQkKCcjYnRuLWFkZC1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgncHJvamVjdCcpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gU3VicHJvamVjdCBhZGQgYnV0dG9uXG5cdFx0JCgnI2J0bi1hZGQtc3VicHJvamVjdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ3N1YnByb2plY3QnKTtcblx0XHR9KTtcblxuXHRcdC8vIFNlYXJjaCBpbiBhbGwgcHJvamVjdHMgdGFibGVcblx0XHQkKCcjcHJvamVjdHMtZmlsdGVyLWlucHV0Jykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0Y29uc3QgcSA9ICQodGhpcykudmFsKCkudG9Mb3dlckNhc2UoKTtcblx0XHRcdCQoJyNwcm9qZWN0cy10YWJsZS1ib2R5IHRyJykuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnN0IHRleHQgPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHQkKHRoaXMpLnRvZ2dsZSh0ZXh0LmluZGV4T2YocSkgPiAtMSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEdsb2JhbCBzZWFyY2hcblx0XHQkKCcjc3R1ZGlvLWdsb2JhbC1zZWFyY2gnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0aWYgKGUua2V5ID09PSAnRW50ZXInKSB7XG5cdFx0XHRcdGNvbnN0IHF1ZXJ5ID0gJCh0aGlzKS52YWwoKTtcblx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ3dvcmstcGFja2FnZXMnKSB7XG5cdFx0XHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMocXVlcnkpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2FsbC1wcm9qZWN0cycpIHtcblx0XHRcdFx0XHQkKCcjcHJvamVjdHMtZmlsdGVyLWlucHV0JykudmFsKHF1ZXJ5KS50cmlnZ2VyKCdrZXl1cCcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCd3b3JrLXBhY2thZ2VzJyk7XG5cdFx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiBzZWxmLnJlbmRlcldvcmtQYWNrYWdlcyhxdWVyeSksIDEwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIEhlYWx0aCBzdGF0dXMgc2VsZWN0IGNoYW5nZVxuXHRcdCQoJyNzZWxlY3QtcHJvamVjdC1oZWFsdGgnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0Y29uc3QgdmFsID0gJCh0aGlzKS52YWwoKTtcblx0XHRcdHNlbGYudXBkYXRlUHJvamVjdEhlYWx0aFN0YXR1cyh2YWwpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gRWRpdCBzdGF0dXMgbmFycmF0aXZlIGJ1dHRvblxuXHRcdCQoJyNidG4tZWRpdC1zdGF0dXMtbmFycmF0aXZlJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5lZGl0U3RhdHVzTmFycmF0aXZlUHJvbXB0KCk7XG5cdFx0fSk7XG5cblx0XHQvLyBDb2xsYXBzZSAvIGV4cGFuZCBzaWRlYmFyXG5cdFx0JCgnI2J0bi10b2dnbGUtc2lkZWJhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCQoJyNzdHVkaW8tc2lkZWJhcicpLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQnKTtcblx0XHR9KTtcblxuXHRcdC8vIEtleWJvYXJkIHNob3J0Y3V0IFx1MjMxOEsgLyBDdHJsK0tcblx0XHQkKGRvY3VtZW50KS5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRpZiAoKGUubWV0YUtleSB8fCBlLmN0cmxLZXkpICYmIChlLmtleSA9PT0gJ2snIHx8IGUua2V5ID09PSAnSycpKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0JCgnI3N0dWRpby1nbG9iYWwtc2VhcmNoJykuZm9jdXMoKS5zZWxlY3QoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIFdvcmsgcGFja2FnZXMgZmlsdGVyIGNsaWNrc1xuXHRcdCQoJy53cC1zaWRlYmFyLWZpbHRlcicpLm9uKCdjbGljaycsICdsaVtkYXRhLWZpbHRlcl0nLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQkKCcud3Atc2lkZWJhci1maWx0ZXIgbGlbZGF0YS1maWx0ZXJdJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHRzZWxmLmFjdGl2ZUZpbHRlcktleSA9ICQodGhpcykuZGF0YSgnZmlsdGVyJyk7XG5cdFx0XHQkKCcjd3AtYWN0aXZlLWZpbHRlci10aXRsZScpLnRleHQoJCh0aGlzKS50ZXh0KCkpO1xuXHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHR9KTtcblxuXHRcdCQoJy53cC1zaWRlYmFyLWZpbHRlcicpLm9uKCdjbGljaycsICdsaVtkYXRhLXR5cGVdJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCgnLndwLXNpZGViYXItZmlsdGVyIGxpW2RhdGEtdHlwZV0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRcdHNlbGYuYWN0aXZlVHlwZUZpbHRlciA9ICQodGhpcykuZGF0YSgndHlwZScpO1xuXHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHR9KTtcblxuXHRcdC8vIFdvcmsgcGFja2FnZXMgdGV4dCBzZWFyY2ggZmlsdGVyXG5cdFx0JCgnI3dwLWZpbHRlci1zZWFyY2gnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBxID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0JCgnI3dwLXRhYmxlLWJvZHkgdHInKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3QgdGV4dCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdCQodGhpcykudG9nZ2xlKHRleHQuaW5kZXhPZihxKSA+IC0xKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQm9hcmQgZ3JvdXBpbmcgc2VsZWN0b3Jcblx0XHQkKCcjc2VsZWN0LWJvYXJkLWdyb3VwLWJ5Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYuYm9hcmRHcm91cEJ5ID0gJCh0aGlzKS52YWwoKTtcblx0XHRcdHNlbGYucmVuZGVyS2FuYmFuQm9hcmQoKTtcblx0XHR9KTtcblxuXHRcdC8vIEJDRiBEcmF3ZXIgdG9nZ2xlXG5cdFx0JCgnI2J0bi1iY2YtdG9nZ2xlLWRyYXdlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCQoJyNiY2YtZmxvYXRpbmctZHJhd2VyJykudG9nZ2xlKCk7XG5cdFx0fSk7XG5cdFx0JCgnI2J0bi1jbG9zZS1iY2YtZHJhd2VyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCgnI2JjZi1mbG9hdGluZy1kcmF3ZXInKS5oaWRlKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBEb2N1bWVudCBmaWxlIGxpbmsgY2xpY2sgZGVsZWdhdGlvbiAoQXV0by1MYXVuY2hlcnMhKVxuXHRcdCQoJyNkb2N1bWVudC1mb2xkZXJzLWNvbnRhaW5lcicpLm9uKCdjbGljaycsICcuZmlsZS1pdGVtLWxpbmsnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0Y29uc3Qgcm91dGUgPSAkKHRoaXMpLmRhdGEoJ3JvdXRlJyk7XG5cdFx0XHRjb25zdCB1cmwgPSAkKHRoaXMpLmRhdGEoJ3VybCcpO1xuXHRcdFx0Y29uc3QgbW9kZWxJZCA9ICQodGhpcykuZGF0YSgnbW9kZWwtaWQnKTtcblx0XHRcdGlmIChyb3V0ZSA9PT0gJ2JpbScpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYignYmNmJywgeyBtb2RlbDogbW9kZWxJZCwgdXJsOiB1cmwgfSk7XG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ09wZW5pbmcgSUZDIG1vZGVsIGluIDNEIFZpZXdlci4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcblx0XHRcdH0gZWxzZSBpZiAocm91dGUgPT09ICdjYWQnKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2NhZCcsIHsgZmlsZTogdXJsIH0pO1xuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdPcGVuaW5nIGRyYXdpbmcgaW4gMkQgQ0FEIFN0dWRpby4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcblx0XHRcdH0gZWxzZSBpZiAocm91dGUgPT09ICdwZGYnKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3BkZicsIHsgZmlsZTogdXJsIH0pO1xuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdPcGVuaW5nIHBsYW4gaW4gUERGIFRha2VvZmYuLi4nKSwgaW5kaWNhdG9yOiAnYmx1ZScgfSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBEb2N1bWVudCBmaWxlIHVwbG9hZCBidXR0b25cblx0XHQkKCcjYnRuLXVwbG9hZC1kb2N1bWVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYub3BlbkZpbGVVcGxvYWREaWFsb2coKTtcblx0XHR9KTtcblxuXHRcdC8vIEJJTSBUYWIgUXVpY2sgVXBsb2FkIElGQyBidXR0b25cblx0XHQkKCcjYnRuLWJjZi11cGxvYWQtaWZjJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5vcGVuQmNmVXBsb2FkRGlhbG9nKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBCSU0gVGFiIExvYWQvVW5sb2FkIGFsbCBtb2RlbHMgYnV0dG9uc1xuXHRcdCQoJyNidG4tbG9hZC1hbGwtbW9kZWxzJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCgnI2JjZi1tb2RlbHMtdHJlZSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XG5cdFx0XHRjb25zdCBpZnJhbWVTcmMgPSBgL2FwcC9iaW0tdmlld2VyP3Byb2plY3Q9JHtlbmNvZGVVUklDb21wb25lbnQoc2VsZi5jdXJyZW50UHJvamVjdCl9YDtcblx0XHRcdCQoJyNpZnJhbWUtYmNmLTNkLXZpZXdlcicpLmF0dHIoJ3NyYycsIGlmcmFtZVNyYyk7XG5cdFx0XHQkKCcjYnRuLWJjZi1vcGVuLWZ1bGxzY3JlZW4nKS5hdHRyKCdocmVmJywgaWZyYW1lU3JjKTtcblx0XHR9KTtcblx0XHQkKCcjYnRuLXVubG9hZC1hbGwtbW9kZWxzJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCgnI2JjZi1tb2RlbHMtdHJlZSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuXHRcdFx0Y29uc3QgaWZyYW1lU3JjID0gYC9hcHAvYmltLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfWA7XG5cdFx0XHQkKCcjaWZyYW1lLWJjZi0zZC12aWV3ZXInKS5hdHRyKCdzcmMnLCBpZnJhbWVTcmMpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQkNGIENyZWF0ZSBJc3N1ZSBidXR0b25cblx0XHQkKCcjYnRuLWJjZi1jcmVhdGUtdG9waWMnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdJc3N1ZScpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gRGFzaGJvYXJkIHdpZGdldCBidXR0b25zXG5cdFx0JCgnI2J0bi1hZGQtbWVldGluZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYub3BlblNjaGVkdWxlTWVldGluZ0RpYWxvZygpO1xuXHRcdH0pO1xuXHRcdCQoJyNidG4tYWRkLXN1YnByb2plY3Qtd2lkZ2V0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnc3VicHJvamVjdCcpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gU3RhbmRhbG9uZSBDQUQgJiBQREYgYnV0dG9uc1xuXHRcdCQoJyNidG4tb3Blbi1kd2ctZnVsbHNjcmVlbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5vcGVuKGAvYXBwL2R3Zy12aWV3ZXI/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWxmLmN1cnJlbnRQcm9qZWN0KX1gLCAnX2JsYW5rJyk7XG5cdFx0fSk7XG5cdFx0JCgnI2J0bi1vcGVuLXBkZi1mdWxsc2NyZWVuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93Lm9wZW4oYC9hcHAvcGRmLXRha2VvZmY/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWxmLmN1cnJlbnRQcm9qZWN0KX1gLCAnX2JsYW5rJyk7XG5cdFx0fSk7XG5cblx0XHQvLyBTY2hlZHVsZSBtZWV0aW5nIGJ1dHRvblxuXHRcdCQoJyNidG4tc2NoZWR1bGUtbWVldGluZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYub3BlblNjaGVkdWxlTWVldGluZ0RpYWxvZygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gUHJvamVjdCBzZXR0aW5ncyBzYXZlXG5cdFx0JCgnI2J0bi1zYXZlLXByb2plY3Qtc2V0dGluZ3MnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLnNhdmVQcm9qZWN0U2V0dGluZ3MoKTtcblx0XHR9KTtcblxuXHRcdC8vIEFyY2hpdmUgdG9nZ2xlXG5cdFx0JCgnI2J0bi10b2dnbGUtYXJjaGl2ZS1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi50b2dnbGVBcmNoaXZlUHJvamVjdCgpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gRGVsZXRlIHByb2plY3Rcblx0XHQkKCcjYnRuLWRlbGV0ZS1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5jb25maXJtRGVsZXRlUHJvamVjdCgpO1xuXHRcdH0pO1xuXHR9XG5cblx0bG9hZFByb2plY3RzTGlzdCgpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRyZXR1cm4gZnJhcHBlLmNhbGwoe1xuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8ubGlzdF9wcm9qZWN0cycsXG5cdFx0XHRhcmdzOiB7IGluY2x1ZGVfYXJjaGl2ZWQ6IDEgfVxuXHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRzZWxmLmFsbFByb2plY3RzID0gci5tZXNzYWdlIHx8IFtdO1xuXHRcdFx0c2VsZi5yZW5kZXJQcm9qZWN0U3dpdGNoZXIoKTtcblx0XHRcdHNlbGYucmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFN3aXRjaGVyKCkge1xuXHRcdGNvbnN0ICRsaXN0ID0gJCgnI3Byb2plY3Qtc3dpdGNoZXItbGlzdCcpO1xuXHRcdCRsaXN0LmVtcHR5KCk7XG5cdFx0JGxpc3QuYXBwZW5kKGA8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwiYWN0aW9uLXNlbGVjdC1wcm9qXCIgZGF0YS1wcm9qZWN0PVwiYWxsXCI+PHNwYW4gY2xhc3M9XCJtci0yIHRleHQtbXV0ZWRcIj4ke0lDT05TLmxpc3R9PC9zcGFuPiA8c3Ryb25nPkFsbCBwcm9qZWN0cyAoSHViKTwvc3Ryb25nPjwvYT48L2xpPmApO1xuXHRcdCRsaXN0LmFwcGVuZCgnPGxpIHJvbGU9XCJzZXBhcmF0b3JcIiBjbGFzcz1cImRpdmlkZXJcIj48L2xpPicpO1xuXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy5hbGxQcm9qZWN0cy5mb3JFYWNoKHAgPT4ge1xuXHRcdFx0Y29uc3QgZmF2SWNvbiA9IHAuaXNfZmF2b3JpdGUgPyAnXHUyQjUwICcgOiAnJztcblx0XHRcdGNvbnN0IHRtcGxCYWRnZSA9IHAuaXNfdGVtcGxhdGUgPyAnIDxzcGFuIGNsYXNzPVwiYmFkZ2VcIj5UZW1wbGF0ZTwvc3Bhbj4nIDogJyc7XG5cdFx0XHRjb25zdCAkaXRlbSA9ICQoYDxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJhY3Rpb24tc2VsZWN0LXByb2pcIiBkYXRhLXByb2plY3Q9XCIke2VzY2FwZUh0bWwocC5uYW1lKX1cIj4ke2Zhdkljb259JHtlc2NhcGVIdG1sKHAucHJvamVjdF9uYW1lIHx8IHAubmFtZSl9JHt0bXBsQmFkZ2V9PC9hPjwvbGk+YCk7XG5cdFx0XHQkbGlzdC5hcHBlbmQoJGl0ZW0pO1xuXHRcdH0pO1xuXG5cdFx0JGxpc3Qub2ZmKCdjbGljaycsICcuYWN0aW9uLXNlbGVjdC1wcm9qJykub24oJ2NsaWNrJywgJy5hY3Rpb24tc2VsZWN0LXByb2onLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBwcm9qID0gJCh0aGlzKS5kYXRhKCdwcm9qZWN0Jyk7XG5cdFx0XHRpZiAocHJvaiA9PT0gJ2FsbCcpIHtcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2VsZi5zZWxlY3RQcm9qZWN0KHByb2opO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0c2VsZWN0UHJvamVjdChwcm9qZWN0TmFtZSwgdGFiID0gJ2hvbWUnKSB7XG5cdFx0Y29uc3QgcHJvak9iaiA9IHRoaXMuYWxsUHJvamVjdHMuZmluZChwID0+IHAubmFtZSA9PT0gcHJvamVjdE5hbWUgfHwgcC5wcm9qZWN0X25hbWUgPT09IHByb2plY3ROYW1lKSB8fCB7IG5hbWU6IHByb2plY3ROYW1lLCBwcm9qZWN0X25hbWU6IHByb2plY3ROYW1lIH07XG5cdFx0dGhpcy5jdXJyZW50UHJvamVjdCA9IHByb2pPYmoubmFtZTtcblx0XHQkKCcjY3VycmVudC1wcm9qZWN0LXRpdGxlJykudGV4dChwcm9qT2JqLnByb2plY3RfbmFtZSB8fCBwcm9qT2JqLm5hbWUpO1xuXHRcdCQoJyNmaWx0ZXItcHJvamVjdC1sYWJlbCcpLnRleHQocHJvak9iai5wcm9qZWN0X25hbWUgfHwgcHJvak9iai5uYW1lKTtcblx0XHQkKCcjc2lkZWJhci1hY3RpdmUtc3RhdHVzJykudGV4dChwcm9qT2JqLnN0YXR1cyB8fCAnQWN0aXZlJyk7XG5cdFx0aWYgKHRoaXMucGFnZSkge1xuXHRcdFx0dGhpcy5wYWdlLnNldF90aXRsZV9zdWIocHJvak9iai5wcm9qZWN0X25hbWUgfHwgcHJvak9iai5uYW1lKTtcblx0XHR9XG5cblx0XHQvLyBFbmFibGUgcHJvamVjdC1zcGVjaWZpYyBuYXYgdGFic1xuXHRcdCQoJy5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtJykuc2hvdygpO1xuXHRcdHRoaXMuc3dpdGNoVGFiKHRhYik7XG5cdFx0dGhpcy5sb2FkUHJvamVjdERhdGEocHJvamVjdE5hbWUpO1xuXHR9XG5cblx0c3dpdGNoVGFiKHRhYktleSwgcGFyYW1zID0ge30pIHtcblx0XHR0aGlzLmN1cnJlbnRUYWIgPSB0YWJLZXk7XG5cdFx0JCgnLnN0dWRpby1uYXYtbGlzdCAubmF2LWl0ZW0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0JChgLnN0dWRpby1uYXYtbGlzdCAubmF2LWl0ZW1bZGF0YS10YWI9XCIke3RhYktleX1cIl1gKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHRjb25zdCB0YWJUaXRsZXMgPSB7XG5cdFx0XHQnaG9tZSc6ICdEYXNoYm9hcmQnLFxuXHRcdFx0J3dvcmstcGFja2FnZXMnOiAnV29yayBQYWNrYWdlcycsXG5cdFx0XHQnYm9hcmRzJzogJ0JvYXJkcycsXG5cdFx0XHQnZ2FudHQnOiAnR2FudHQgQ2hhcnRzJyxcblx0XHRcdCdiY2YnOiAnQklNIC8gQkNGIENvb3JkaW5hdGlvbicsXG5cdFx0XHQnY2FkJzogJzJEIENBRCAoRFdHKScsXG5cdFx0XHQncGRmJzogJ1BERiBQbGFucyAmIFRha2VvZmYnLFxuXHRcdFx0J2RvY3VtZW50cyc6ICdEb2N1bWVudHMnLFxuXHRcdFx0J21lZXRpbmdzJzogJ01lZXRpbmdzICYgU2FmZXR5Jyxcblx0XHRcdCdtZW1iZXJzJzogJ01lbWJlcnMnLFxuXHRcdFx0J3NldHRpbmdzJzogJ1NldHRpbmdzJyxcblx0XHRcdCdhbGwtcHJvamVjdHMnOiAnQWN0aXZlIFByb2plY3RzJ1xuXHRcdH07XG5cdFx0Y29uc3QgYWN0aXZlVGl0bGUgPSB0YWJUaXRsZXNbdGFiS2V5XSB8fCB0YWJLZXk7XG5cdFx0JCgnI3N0dWRpby1hY3RpdmUtdGl0bGUnKS50ZXh0KGFjdGl2ZVRpdGxlKTtcblx0XHRpZiAodGhpcy5wYWdlKSB7XG5cdFx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlKGFjdGl2ZVRpdGxlKTtcblx0XHRcdGlmICh0aGlzLmN1cnJlbnRQcm9qZWN0KSB7XG5cdFx0XHRcdHRoaXMucGFnZS5zZXRfdGl0bGVfc3ViKHRoaXMuY3VycmVudFByb2plY3QpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdCQoJy5zdHVkaW8tdGFiLXZpZXcnKS5oaWRlKCk7XG5cblx0XHRpZiAodGFiS2V5ID09PSAnYWxsLXByb2plY3RzJykge1xuXHRcdFx0JCgnI2N1cnJlbnQtcHJvamVjdC10aXRsZScpLnRleHQoJ0FsbCBwcm9qZWN0cycpO1xuXHRcdFx0JCgnI3ZpZXctYWxsLXByb2plY3RzJykuc2hvdygpO1xuXHRcdFx0dGhpcy5yZW5kZXJBbGxQcm9qZWN0c1RhYmxlKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JChgI3ZpZXctJHt0YWJLZXl9YCkuc2hvdygpO1xuXG5cdFx0Ly8gVHJpZ2dlciB2aWV3LXNwZWNpZmljIGxvYWRzXG5cdFx0aWYgKHRhYktleSA9PT0gJ2hvbWUnKSB7XG5cdFx0XHR0aGlzLnJlbmRlclByb2plY3RPdmVydmlldygpO1xuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAnd29yay1wYWNrYWdlcycpIHtcblx0XHRcdHRoaXMucmVuZGVyV29ya1BhY2thZ2VzKCk7XG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdib2FyZHMnKSB7XG5cdFx0XHR0aGlzLnJlbmRlckthbmJhbkJvYXJkKCk7XG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdnYW50dCcpIHtcblx0XHRcdHRoaXMucmVuZGVyR2FudHRDaGFydCgpO1xuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAnYmNmJykge1xuXHRcdFx0dGhpcy5yZW5kZXJCY2ZWaWV3ZXIocGFyYW1zLm1vZGVsKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2NhZCcpIHtcblx0XHRcdGNvbnN0IGNhZFNyYyA9IHBhcmFtcy5maWxlXG5cdFx0XHRcdD8gYC9hcHAvZHdnLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY3VycmVudFByb2plY3QpfSZmaWxlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5maWxlKX1gXG5cdFx0XHRcdDogYC9hcHAvZHdnLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY3VycmVudFByb2plY3QpfWA7XG5cdFx0XHQkKCcjaWZyYW1lLWR3Zy12aWV3ZXInKS5hdHRyKCdzcmMnLCBjYWRTcmMpO1xuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAncGRmJykge1xuXHRcdFx0Y29uc3QgcGRmU3JjID0gcGFyYW1zLmZpbGVcblx0XHRcdFx0PyBgL2FwcC9wZGYtdGFrZW9mZj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY3VycmVudFByb2plY3QpfSZmaWxlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5maWxlKX1gXG5cdFx0XHRcdDogYC9hcHAvcGRmLXRha2VvZmY/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmN1cnJlbnRQcm9qZWN0KX1gO1xuXHRcdFx0JCgnI2lmcmFtZS1wZGYtdmlld2VyJykuYXR0cignc3JjJywgcGRmU3JjKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2RvY3VtZW50cycpIHtcblx0XHRcdHRoaXMucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAnbWVldGluZ3MnKSB7XG5cdFx0XHR0aGlzLnJlbmRlck1lZXRpbmdzVGFiKCk7XG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdtZW1iZXJzJykge1xuXHRcdFx0dGhpcy5yZW5kZXJNZW1iZXJzVGFibGUoKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ3NldHRpbmdzJykge1xuXHRcdFx0dGhpcy5yZW5kZXJTZXR0aW5nc1RhYigpO1xuXHRcdH1cblx0fVxuXG5cdGxvYWRQcm9qZWN0RGF0YShwcm9qZWN0TmFtZSkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmdldF9wcm9qZWN0X292ZXJ2aWV3Jyxcblx0XHRcdGFyZ3M6IHsgcHJvamVjdDogcHJvamVjdE5hbWUgfVxuXHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRzZWxmLnByb2plY3RPdmVydmlld0RhdGEgPSByLm1lc3NhZ2UgfHwge307XG5cdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnaG9tZScpIHtcblx0XHRcdFx0c2VsZi5yZW5kZXJQcm9qZWN0T3ZlcnZpZXcoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVEFCIDA6IEFMTCBQUk9KRUNUUyBIVUIgKFNjcmVlbnNob3QgMSlcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJBbGxQcm9qZWN0c1RhYmxlKCkge1xuXHRcdGNvbnN0ICR0Ym9keSA9ICQoJyNwcm9qZWN0cy10YWJsZS1ib2R5Jyk7XG5cdFx0JHRib2R5LmVtcHR5KCk7XG5cblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHR0aGlzLmFsbFByb2plY3RzLmZvckVhY2gocCA9PiB7XG5cdFx0XHRjb25zdCBmYXZTdGFyID0gcC5pc19mYXZvcml0ZSA/IElDT05TLnN0YXIgOiBJQ09OUy5zdGFyRW1wdHk7XG5cdFx0XHRjb25zdCBzdGF0dXNQaWxsID0gcC5oZWFsdGhfc3RhdHVzID09PSAnT24gVHJhY2snIFxuXHRcdFx0XHQ/ICc8c3BhbiBjbGFzcz1cInN0YXR1cy1hY3RpdmUtcGlsbFwiPjxzcGFuIGNsYXNzPVwic3RhdHVzLWRvdC1ncmVlblwiPjwvc3Bhbj4gT24gdHJhY2s8L3NwYW4+J1xuXHRcdFx0XHQ6IChwLmhlYWx0aF9zdGF0dXMgPT09ICdBdCBSaXNrJyBcblx0XHRcdFx0XHQ/ICc8c3BhbiBjbGFzcz1cInN0YXR1cy13YXJuaW5nLXBpbGxcIj48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3QtYW1iZXJcIj48L3NwYW4+IEF0IHJpc2s8L3NwYW4+J1xuXHRcdFx0XHRcdDogJzxzcGFuIGNsYXNzPVwic3RhdHVzLWRhbmdlci1waWxsXCI+PHNwYW4gY2xhc3M9XCJzdGF0dXMtZG90LXJlZFwiPjwvc3Bhbj4gT2ZmIHRyYWNrPC9zcGFuPicpO1xuXG5cdFx0XHRjb25zdCBpbmRlbnQgPSBwLnBhcmVudF9wcm9qZWN0ID8gJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1x1MjFCMyAnIDogJyc7XG5cdFx0XHRjb25zdCAkdHIgPSAkKGBcblx0XHRcdFx0PHRyPlxuXHRcdFx0XHRcdDx0ZCBjbGFzcz1cInRleHQtY2VudGVyXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidG9nZ2xlLWZhdlwiIGRhdGEtcHJvamVjdD1cIiR7ZXNjYXBlSHRtbChwLm5hbWUpfVwiPiR7ZmF2U3Rhcn08L2E+PC90ZD5cblx0XHRcdFx0XHQ8dGQ+JHtpbmRlbnR9PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwicHJvamVjdC1saW5rXCIgZGF0YS1wcm9qZWN0PVwiJHtlc2NhcGVIdG1sKHAubmFtZSl9XCI+PHN0cm9uZz4ke2VzY2FwZUh0bWwocC5wcm9qZWN0X25hbWUgfHwgcC5uYW1lKX08L3N0cm9uZz48L2E+PC90ZD5cblx0XHRcdFx0XHQ8dGQ+JHtzdGF0dXNQaWxsfTwvdGQ+XG5cdFx0XHRcdFx0PHRkIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1zdWNjZXNzXCI+JHtJQ09OUy5jaGVja308L3RkPlxuXHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke2VzY2FwZUh0bWwocC5jcmVhdGVkX29uIHx8ICctLScpfTwvc3Bhbj48L3RkPlxuXHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke2VzY2FwZUh0bWwocC5sYXRlc3RfYWN0aXZpdHlfYXQgfHwgJy0tJyl9PC9zcGFuPjwvdGQ+XG5cdFx0XHRcdFx0PHRkPjxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke2VzY2FwZUh0bWwocC5kaXNrX3VzYWdlX2Zvcm1hdHRlZCB8fCAnMCBCeXRlcycpfTwvc21hbGw+PC90ZD5cblx0XHRcdFx0PC90cj5cblx0XHRcdGApO1xuXG5cdFx0XHQkdHIuZmluZCgnLnByb2plY3QtbGluaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c2VsZi5zZWxlY3RQcm9qZWN0KCQodGhpcykuZGF0YSgncHJvamVjdCcpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkdHIuZmluZCgnLnRvZ2dsZS1mYXYnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnN0IGlzRmF2ID0gcC5pc19mYXZvcml0ZSA/IDAgOiAxO1xuXHRcdFx0XHRzZWxmLnVwZGF0ZVByb2plY3RTZXR0aW5nc0ZpZWxkKHAubmFtZSwgeyBpc19mYXZvcml0ZTogaXNGYXYgfSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCR0Ym9keS5hcHBlbmQoJHRyKTtcblx0XHR9KTtcblxuXHRcdCQoJyNwcm9qZWN0cy10YWJsZS1zdW1tYXJ5JykudGV4dChgU2hvd2luZyAke3RoaXMuYWxsUHJvamVjdHMubGVuZ3RofSBhY3RpdmUgcHJvamVjdChzKWApO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMTogUFJPSkVDVCBIT01FIERBU0hCT0FSRCAoU2NyZWVuc2hvdCAyKVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHJlbmRlclByb2plY3RPdmVydmlldygpIHtcblx0XHRpZiAoIXRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YSkgcmV0dXJuO1xuXHRcdGNvbnN0IGRhdGEgPSB0aGlzLnByb2plY3RPdmVydmlld0RhdGE7XG5cdFx0Y29uc3Qgc3VtbWFyeSA9IGRhdGEuc3VtbWFyeSB8fCB7fTtcblxuXHRcdC8vIEdyZWV0aW5nICYgVG9wIE1ldHJpYyBDYXJkcyAoRnJhcHBlIFVJIFN0eWxlKVxuXHRcdGNvbnN0IHVzZXJHcmVldGluZyA9IGZyYXBwZS5zZXNzaW9uLnVzZXJfZnVsbG5hbWUgfHwgZnJhcHBlLnNlc3Npb24udXNlciB8fCAnQWRtaW5pc3RyYXRvcic7XG5cdFx0JCgnI2hvbWUtdXNlci1ncmVldGluZycpLnRleHQodXNlckdyZWV0aW5nKTtcblxuXHRcdGNvbnN0IHdwQ291bnRzID0gZGF0YS53b3JrX3BhY2thZ2VzX2NvdW50cyB8fCB7fTtcblx0XHRjb25zdCBvcGVuVGFza3MgPSB3cENvdW50cy5vcGVuICE9PSB1bmRlZmluZWQgPyB3cENvdW50cy5vcGVuIDogKGRhdGEudGFza3MgPyBkYXRhLnRhc2tzLmxlbmd0aCA6IDApO1xuXHRcdGNvbnN0IGNsYXNoZXMgPSAoZGF0YS5jb29yZGluYXRpb24gJiYgZGF0YS5jb29yZGluYXRpb24udG9waWNzID8gZGF0YS5jb29yZGluYXRpb24udG9waWNzLmxlbmd0aCA6IDApO1xuXHRcdGNvbnN0IHByb2dyZXNzID0gTWF0aC5yb3VuZChzdW1tYXJ5LnBlcmNlbnRfY29tcGxldGUgfHwgMCk7XG5cblx0XHQkKCcjaG9tZS1zdGF0LW9wZW4tdGFza3MnKS50ZXh0KG9wZW5UYXNrcyk7XG5cdFx0JCgnI2hvbWUtc3RhdC1jbGFzaGVzJykudGV4dChjbGFzaGVzKTtcblx0XHQkKCcjaG9tZS1zdGF0LXByb2dyZXNzJykudGV4dChgJHtwcm9ncmVzc30lYCk7XG5cdFx0JCgnI3NwYXJrbGluZS1wcm9ncmVzcy1iYXInKS5jc3MoJ3dpZHRoJywgYCR7TWF0aC5taW4oMTAwLCBNYXRoLm1heCg1LCBwcm9ncmVzcykpfSVgKTtcblxuXHRcdC8vIERlc2NyaXB0aW9uICYgRGF0ZXNcblx0XHQkKCcjb3ZlcnZpZXctZGVzY3JpcHRpb24nKS50ZXh0KHN1bW1hcnkuZGVzY3JpcHRpb24gfHwgX18oJ05vIGRlc2NyaXB0aW9uIHByb3ZpZGVkLicpKTtcblx0XHQkKCcjb3ZlcnZpZXctZGF0ZXMnKS50ZXh0KGAke3N1bW1hcnkuZXhwZWN0ZWRfc3RhcnRfZGF0ZSB8fCAnLS0nfSB0byAke3N1bW1hcnkuZXhwZWN0ZWRfZW5kX2RhdGUgfHwgJy0tJ31gKTtcblx0XHQkKCcjb3ZlcnZpZXctcHJvZ3Jlc3MnKS50ZXh0KGAke01hdGgucm91bmQoc3VtbWFyeS5wZXJjZW50X2NvbXBsZXRlIHx8IDApfSVgKTtcblxuXHRcdC8vIEhlYWx0aCBzdGF0dXNcblx0XHRjb25zdCBoZWFsdGggPSBzdW1tYXJ5LmhlYWx0aF9zdGF0dXMgfHwgJ09uIFRyYWNrJztcblx0XHQkKCcjc2VsZWN0LXByb2plY3QtaGVhbHRoJykudmFsKGhlYWx0aCk7XG5cdFx0aWYgKHRoaXMucGFnZSAmJiB0aGlzLnBhZ2Uuc2V0X2luZGljYXRvcikge1xuXHRcdFx0Y29uc3QgY29sb3IgPSBoZWFsdGggPT09ICdPbiBUcmFjaycgPyAnZ3JlZW4nIDogKGhlYWx0aCA9PT0gJ0F0IFJpc2snID8gJ29yYW5nZScgOiAncmVkJyk7XG5cdFx0XHR0aGlzLnBhZ2Uuc2V0X2luZGljYXRvcihoZWFsdGgsIGNvbG9yKTtcblx0XHR9XG5cdFx0JCgnI292ZXJ2aWV3LXN0YXR1cy1uYXJyYXRpdmUnKS50ZXh0KHN1bW1hcnkuc3RhdHVzX25hcnJhdGl2ZSB8fCBfXygnQWxsIHRhc2tzIGFuZCBzdWItcHJvamVjdHMgYXJlIG9uIHNjaGVkdWxlLicpKTtcblxuXHRcdC8vIE1pbGVzdG9uZSBEaWFtb25kIFRpbWVsaW5lXG5cdFx0dGhpcy5yZW5kZXJNaWxlc3RvbmVUaW1lbGluZShkYXRhLm1pbGVzdG9uZXMgfHwgW10pO1xuXG5cdFx0Ly8gU3VicHJvamVjdHNcblx0XHRjb25zdCAkc3ViTGlzdCA9ICQoJyNzdWJwcm9qZWN0cy1saXN0Jyk7XG5cdFx0JHN1Ykxpc3QuZW1wdHkoKTtcblx0XHQoZGF0YS5zdWJwcm9qZWN0cyB8fCBbXSkuZm9yRWFjaChzID0+IHtcblx0XHRcdCRzdWJMaXN0LmFwcGVuZChgXG5cdFx0XHRcdDxsaSBjbGFzcz1cImZsZXgtYmV0d2VlbiBwLTFcIj5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImQtaW5saW5lLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0xXCI+PHNwYW4gY2xhc3M9XCJ0ZXh0LXByaW1hcnkgbXItMVwiPiR7SUNPTlMuZm9sZGVyfTwvc3Bhbj4gJHtzLnByb2plY3RfbmFtZX08L3NwYW4+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJzdGF0dXMtYWN0aXZlLXBpbGxcIj48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3QtZ3JlZW5cIj48L3NwYW4+ICR7cy5zdGF0dXN9PC9zcGFuPlxuXHRcdFx0XHQ8L2xpPlxuXHRcdFx0YCk7XG5cdFx0fSk7XG5cdFx0aWYgKChkYXRhLnN1YnByb2plY3RzIHx8IFtdKS5sZW5ndGggPT09IDApIHtcblx0XHRcdCRzdWJMaXN0LmFwcGVuZCgnPGxpIGNsYXNzPVwidGV4dC1tdXRlZCBwLTFcIj48c21hbGw+Tm8gc3VicHJvamVjdHMgY29uZmlndXJlZC48L3NtYWxsPjwvbGk+Jyk7XG5cdFx0fVxuXG5cdFx0Ly8gTWVldGluZ3Ncblx0XHRjb25zdCAkbWVldExpc3QgPSAkKCcjbWVldGluZ3MtbGlzdC1jb250YWluZXInKTtcblx0XHQkbWVldExpc3QuZW1wdHkoKTtcblx0XHQoZGF0YS5tZWV0aW5ncyB8fCBbXSkuZm9yRWFjaChtID0+IHtcblx0XHRcdCRtZWV0TGlzdC5hcHBlbmQoYFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVldGluZy1pdGVtIHAtMiBtYi0xXCIgc3R5bGU9XCJib3JkZXItYm90dG9tOiAxcHggc29saWQgI2YxZjVmOTtcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleC1iZXR3ZWVuXCI+XG5cdFx0XHRcdFx0XHQ8c3Ryb25nPiR7bS50aXRsZX08L3N0cm9uZz5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYmFkZ2UgYmFkZ2UtaW5mb1wiPiR7bS50eXBlfTwvc3Bhbj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkIGQtaW5saW5lLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0xIG10LTFcIj4ke0lDT05TLmNhbGVuZGFyfSA8c3Bhbj4ke20uZGF0ZX0gfCAke20uaG9zdCB8fCAnQ29vcmRpbmF0b3InfTwvc3Bhbj48L3NtYWxsPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdGApO1xuXHRcdH0pO1xuXHRcdGlmICgoZGF0YS5tZWV0aW5ncyB8fCBbXSkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQkbWVldExpc3QuYXBwZW5kKCc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBwLTIgdGV4dC1jZW50ZXJcIj48c21hbGw+Tm8gdXBjb21pbmcgbWVldGluZ3M8L3NtYWxsPjwvZGl2PicpO1xuXHRcdH1cblxuXHRcdC8vIE1lbWJlcnNcblx0XHRjb25zdCAkbWVtR3JpZCA9ICQoJyNtZW1iZXJzLWF2YXRhcnMtZ3JpZCcpO1xuXHRcdCRtZW1HcmlkLmVtcHR5KCk7XG5cdFx0KGRhdGEubWVtYmVycyB8fCBbXSkuZm9yRWFjaChtID0+IHtcblx0XHRcdCRtZW1HcmlkLmFwcGVuZChgXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtZW1iZXItY2hpcCBwLTFcIiBzdHlsZT1cImRpc3BsYXk6IGlubGluZS1mbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDZweDsgbWFyZ2luOiA0cHg7XCI+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJhdmF0YXItY2lyY2xlXCIgc3R5bGU9XCJ3aWR0aDoyOHB4O2hlaWdodDoyOHB4O2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6IzQzMzhjYTtjb2xvcjojZmZmO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LXNpemU6MTFweDtmb250LXdlaWdodDpib2xkO1wiPlxuXHRcdFx0XHRcdFx0JHsobS5mdWxsX25hbWUgfHwgbS51c2VyKS5zdWJzdHJpbmcoMCwgMikudG9VcHBlckNhc2UoKX1cblx0XHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHRcdFx0PHNtYWxsIGNsYXNzPVwiZm9udC13ZWlnaHQtbWVkaXVtXCI+JHttLmZ1bGxfbmFtZSB8fCBtLnVzZXJ9PC9zbWFsbD5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRgKTtcblx0XHR9KTtcblxuXHRcdC8vIE5ld3Ncblx0XHRjb25zdCAkbmV3c0NvbnQgPSAkKCcjbmV3cy1mZWVkLWNvbnRhaW5lcicpO1xuXHRcdCRuZXdzQ29udC5lbXB0eSgpO1xuXHRcdChkYXRhLm5ld3MgfHwgW10pLmZvckVhY2gobiA9PiB7XG5cdFx0XHQkbmV3c0NvbnQuYXBwZW5kKGBcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm5ld3MtYnVsbGV0aW4gcC0yIG1iLTJcIiBzdHlsZT1cImJhY2tncm91bmQ6ICNmOGZhZmM7IGJvcmRlci1sZWZ0OiAzcHggc29saWQgIzYzNjZmMTsgYm9yZGVyLXJhZGl1czogNHB4O1wiPlxuXHRcdFx0XHRcdDxoNSBjbGFzcz1cIm0tMCBmb250LXdlaWdodC1ib2xkXCI+JHtuLnRpdGxlfTwvaDU+XG5cdFx0XHRcdFx0PHNtYWxsIGNsYXNzPVwidGV4dC1tdXRlZFwiPiR7bi5hdXRob3J9IG9uICR7bi5kYXRlfTwvc21hbGw+XG5cdFx0XHRcdFx0PHAgY2xhc3M9XCJtLTAgbXQtMSB0ZXh0LXNlY29uZGFyeVwiIHN0eWxlPVwiZm9udC1zaXplOiAxMnB4O1wiPiR7bi5jb250ZW50fTwvcD5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRgKTtcblx0XHR9KTtcblx0fVxuXG5cdHJlbmRlck1pbGVzdG9uZVRpbWVsaW5lKG1pbGVzdG9uZXMpIHtcblx0XHRjb25zdCAkbWFya2VycyA9ICQoJyN0aW1lbGluZS1tYXJrZXJzLWNvbnRhaW5lcicpO1xuXHRcdCRtYXJrZXJzLmVtcHR5KCk7XG5cblx0XHRpZiAoIW1pbGVzdG9uZXMgfHwgbWlsZXN0b25lcy5sZW5ndGggPT09IDApIHtcblx0XHRcdCQoJyN0aW1lbGluZS1heGlzLWJhcicpLmhpZGUoKTtcblx0XHRcdCRtYXJrZXJzLmh0bWwoYDxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiIHN0eWxlPVwid2lkdGg6IDEwMCU7XCI+PHNwYW4gY2xhc3M9XCJ0aW1lbGluZS1lbXB0eS1tc2cgdGV4dC1tdXRlZFwiPiR7SUNPTlMuaW5mb30gTm8gZGVsaXZlcnkgbWlsZXN0b25lcyByZWNvcmRlZCB5ZXQuPC9zcGFuPjwvZGl2PmApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQoJyN0aW1lbGluZS1heGlzLWJhcicpLnNob3coKTtcblxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdG1pbGVzdG9uZXMuZm9yRWFjaChtID0+IHtcblx0XHRcdGNvbnN0IGNvbXBsZXRlZENscyA9IG0uY29tcGxldGVkID8gJ2NvbXBsZXRlZCcgOiAnJztcblx0XHRcdGNvbnN0ICRwdCA9ICQoYFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWlsZXN0b25lLW1hcmtlci1wb2ludFwiIGRhdGEtaWQ9XCIke20uaWR9XCIgdGl0bGU9XCIke20udGl0bGV9ICgke20uZHVlX2RhdGUgfHwgJ1RCRCd9KVwiPlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibWlsZXN0b25lLWRhdGVcIj4keyhtLmR1ZV9kYXRlIHx8ICcnKS5zdWJzdHJpbmcoNSl9PC9zcGFuPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJtaWxlc3RvbmUtZGlhbW9uZCAke2NvbXBsZXRlZENsc31cIj48L2Rpdj5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1pbGVzdG9uZS1sYWJlbFwiPiR7bS50aXRsZX08L3NwYW4+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0YCk7XG5cdFx0XHQkcHQub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRmcmFwcGUubXNncHJpbnQoe1xuXHRcdFx0XHRcdHRpdGxlOiBfXygnTWlsZXN0b25lIERlbGl2ZXJ5IERldGFpbHMnKSxcblx0XHRcdFx0XHRtZXNzYWdlOiBgPGg0PiR7bS50aXRsZX08L2g0PjxwPjxzdHJvbmc+VGFyZ2V0IER1ZSBEYXRlOjwvc3Ryb25nPiAke20uZHVlX2RhdGUgfHwgJ05vbmUnfTwvcD48cD48c3Ryb25nPlN0YXR1czo8L3N0cm9uZz4gJHttLnN0YXR1c308L3A+YCxcblx0XHRcdFx0XHRpbmRpY2F0b3I6IG0uY29tcGxldGVkID8gJ2dyZWVuJyA6ICdvcmFuZ2UnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0XHQkbWFya2Vycy5hcHBlbmQoJHB0KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVEFCIDI6IFdPUksgUEFDS0FHRVMgR1JJRCAoU2NyZWVuc2hvdCAzKVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHJlbmRlcldvcmtQYWNrYWdlcyhzZWFyY2hRdWVyeSA9IG51bGwpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5saXN0X3dvcmtfcGFja2FnZXMnLFxuXHRcdFx0YXJnczoge1xuXHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0XHRmaWx0ZXJfa2V5OiBzZWxmLmFjdGl2ZUZpbHRlcktleSxcblx0XHRcdFx0dHlwZV9maWx0ZXI6IHNlbGYuYWN0aXZlVHlwZUZpbHRlcixcblx0XHRcdFx0c2VhcmNoOiBzZWFyY2hRdWVyeVxuXHRcdFx0fVxuXHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRjb25zdCBpdGVtcyA9IHIubWVzc2FnZSB8fCBbXTtcblx0XHRcdGNvbnN0ICR0Ym9keSA9ICQoJyN3cC10YWJsZS1ib2R5Jyk7XG5cdFx0XHQkdGJvZHkuZW1wdHkoKTtcblxuXHRcdFx0aWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQkdGJvZHkuYXBwZW5kKCc8dHI+PHRkIGNvbHNwYW49XCI3XCIgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LW11dGVkIHAtNFwiPk5vIHdvcmsgcGFja2FnZXMgbWF0Y2ggdGhpcyBmaWx0ZXIuPC90ZD48L3RyPicpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGl0ZW1zLmZvckVhY2goaXQgPT4ge1xuXHRcdFx0XHRjb25zdCBwaWxsQ2xzID0gYHdwLXBpbGwtJHsoaXQudHlwZSB8fCAndGFzaycpLnRvTG93ZXJDYXNlKCl9YDtcblx0XHRcdFx0Y29uc3QgaW5kZW50ID0gaXQucGFyZW50X3Rhc2sgPyAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHUyMUIzICcgOiAnJztcblx0XHRcdFx0Y29uc3QgJHRyID0gJChgXG5cdFx0XHRcdFx0PHRyIGNsYXNzPVwid3Atcm93LWl0ZW1cIiBkYXRhLWlkPVwiJHtpdC5pZH1cIiBzdHlsZT1cImN1cnNvcjogcG9pbnRlcjtcIj5cblx0XHRcdFx0XHRcdDx0ZD48c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+IyR7aXQuaWQucmVwbGFjZSgnVEFTSy0nLCAnJyl9PC9zbWFsbD48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPiR7aW5kZW50fTxzdHJvbmc+JHtpdC5zdWJqZWN0fTwvc3Ryb25nPjwvdGQ+XG5cdFx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2l0LnR5cGV9PC9zcGFuPjwvdGQ+XG5cdFx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJzdGF0dXMtZG90XCI+PC9zcGFuPiAke2l0LnN0YXR1c308L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbD4ke2l0LmFzc2lnbmVlX25hbWUgfHwgJ1VuYXNzaWduZWQnfTwvc21hbGw+PC90ZD5cblx0XHRcdFx0XHRcdDx0ZD48c21hbGw+JHtpdC5wcmlvcml0eX08L3NtYWxsPjwvdGQ+XG5cdFx0XHRcdFx0XHQ8dGQ+PHNtYWxsIGNsYXNzPVwidGV4dC1tdXRlZFwiPiR7aXQuZXhwX2VuZF9kYXRlIHx8ICctLSd9PC9zbWFsbD48L3RkPlxuXHRcdFx0XHRcdDwvdHI+XG5cdFx0XHRcdGApO1xuXG5cdFx0XHRcdCR0ci5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0c2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3IoaXQpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkdGJvZHkuYXBwZW5kKCR0cik7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdG9wZW5Xb3JrUGFja2FnZUluc3BlY3Rvcih3cCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGNvbnN0IGQgPSBuZXcgZnJhcHBlLnVpLkRpYWxvZyh7XG5cdFx0XHR0aXRsZTogYFske3dwLnR5cGV9XSAjJHt3cC5pZH0gLSAke3dwLnN1YmplY3R9YCxcblx0XHRcdGZpZWxkczogW1xuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3N0YXR1cycsIGxhYmVsOiBfXygnU3RhdHVzJyksIGZpZWxkdHlwZTogJ1NlbGVjdCcsIG9wdGlvbnM6ICdPcGVuXFxuV29ya2luZ1xcblBlbmRpbmcgUmV2aWV3XFxuQ29tcGxldGVkXFxuQ2FuY2VsbGVkJywgZGVmYXVsdDogd3Auc3RhdHVzIH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAncHJpb3JpdHknLCBsYWJlbDogX18oJ1ByaW9yaXR5JyksIGZpZWxkdHlwZTogJ1NlbGVjdCcsIG9wdGlvbnM6ICdMb3dcXG5Ob3JtYWxcXG5IaWdoXFxuVXJnZW50JywgZGVmYXVsdDogd3AucHJpb3JpdHkgfSxcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdleHBfZW5kX2RhdGUnLCBsYWJlbDogX18oJ0R1ZSBEYXRlJyksIGZpZWxkdHlwZTogJ0RhdGUnLCBkZWZhdWx0OiB3cC5leHBfZW5kX2RhdGUgfSxcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdsaW5rZWRfaW5mbycsIGxhYmVsOiBfXygnRG9tYWluIExpbmthZ2UnKSwgZmllbGR0eXBlOiAnSFRNTCcgfVxuXHRcdFx0XSxcblx0XHRcdHByaW1hcnlfYWN0aW9uX2xhYmVsOiBfXygnVXBkYXRlIFdvcmsgUGFja2FnZScpLFxuXHRcdFx0cHJpbWFyeV9hY3Rpb24odmFsdWVzKSB7XG5cdFx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50LnNldF92YWx1ZScsXG5cdFx0XHRcdFx0YXJnczoge1xuXHRcdFx0XHRcdFx0ZG9jdHlwZTogJ1Rhc2snLFxuXHRcdFx0XHRcdFx0bmFtZTogd3AuaWQsXG5cdFx0XHRcdFx0XHRmaWVsZG5hbWU6IHtcblx0XHRcdFx0XHRcdFx0c3RhdHVzOiB2YWx1ZXMuc3RhdHVzLFxuXHRcdFx0XHRcdFx0XHRwcmlvcml0eTogdmFsdWVzLnByaW9yaXR5LFxuXHRcdFx0XHRcdFx0XHRleHBfZW5kX2RhdGU6IHZhbHVlcy5leHBfZW5kX2RhdGVcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGQuaGlkZSgpO1xuXHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1dvcmsgcGFja2FnZSB1cGRhdGVkLicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnYm9hcmRzJykgc2VsZi5yZW5kZXJLYW5iYW5Cb2FyZCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGxldCBsaW5rSHRtbCA9ICc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZFwiPjxzbWFsbD5OYXRpdmUgVGFzayBpbiBFUlBOZXh0Ljwvc21hbGw+PC9kaXY+Jztcblx0XHRpZiAod3AuYmNmX3RvcGljKSB7XG5cdFx0XHRsaW5rSHRtbCA9IGA8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtd2FybmluZyBkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0yXCI+PHNwYW4gY2xhc3M9XCJtci0xXCI+JHtJQ09OUy5jdWJlfTwvc3Bhbj4gPGRpdj5MaW5rZWQgdG8gQkNGIENsYXNoIFRvcGljOiA8c3Ryb25nPiR7d3AuYmNmX3RvcGljfTwvc3Ryb25nPjwvZGl2PjwvZGl2PmA7XG5cdFx0fSBlbHNlIGlmICh3cC5yZmlfbGluaykge1xuXHRcdFx0bGlua0h0bWwgPSBgPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWluZm8gZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBnYXAtMlwiPjxzcGFuIGNsYXNzPVwibXItMVwiPiR7SUNPTlMuaW5mb308L3NwYW4+IDxkaXY+TGlua2VkIHRvIFRlY2huaWNhbCBSRkk6IDxzdHJvbmc+JHt3cC5yZmlfbGlua308L3N0cm9uZz48L2Rpdj48L2Rpdj5gO1xuXHRcdH1cblx0XHRkLmZpZWxkc19kaWN0LmxpbmtlZF9pbmZvLiR3cmFwcGVyLmh0bWwobGlua0h0bWwpO1xuXHRcdGQuc2hvdygpO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMzogS0FOQkFOIEJPQVJEUyAoSFRNTDUgRHJhZyAmIERyb3ApXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyS2FuYmFuQm9hcmQoKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8uZ2V0X2thbmJhbl9ib2FyZF9kYXRhJyxcblx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0cHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCxcblx0XHRcdFx0Z3JvdXBfYnk6IHNlbGYuYm9hcmRHcm91cEJ5XG5cdFx0XHR9XG5cdFx0fSkudGhlbihyID0+IHtcblx0XHRcdGNvbnN0IGRhdGEgPSByLm1lc3NhZ2UgfHwge307XG5cdFx0XHRjb25zdCBjb2x1bW5zID0gZGF0YS5jb2x1bW5zIHx8IFtdO1xuXHRcdFx0Y29uc3QgJHdyYXBwZXIgPSAkKCcja2FuYmFuLWNvbHVtbnMtd3JhcHBlcicpO1xuXHRcdFx0JHdyYXBwZXIuZW1wdHkoKTtcblxuXHRcdFx0Y29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG5cdFx0XHRcdGNvbnN0ICRjb2wgPSAkKGBcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwia2FuYmFuLWNvbHVtblwiIGRhdGEtY29sLWlkPVwiJHtjb2wuaWR9XCI+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sdW1uLWhlYWRlclwiPlxuXHRcdFx0XHRcdFx0XHQ8c3Bhbj4ke2NvbC50aXRsZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYmFkZ2UgY29sLWNhcmQtY291bnRcIj4ke2NvbC5jYXJkcy5sZW5ndGh9PC9zcGFuPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sdW1uLWNhcmRzLWxpc3RcIiBkYXRhLWNvbC1pZD1cIiR7Y29sLmlkfVwiPlxuXHRcdFx0XHRcdFx0XHQ8IS0tIENhcmRzIC0tPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdGApO1xuXG5cdFx0XHRcdGNvbnN0ICRjYXJkc0xpc3QgPSAkY29sLmZpbmQoJy5jb2x1bW4tY2FyZHMtbGlzdCcpO1xuXG5cdFx0XHRcdC8vIE5hdGl2ZSBIVE1MNSBEcmFnIGFuZCBEcm9wIGhhbmRsZXJzIG9uIGRyb3B6b25lXG5cdFx0XHRcdCRjYXJkc0xpc3Qub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ2JhY2tncm91bmQnLCAnI2UyZThmMCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JGNhcmRzTGlzdC5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnYmFja2dyb3VuZCcsICcnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCRjYXJkc0xpc3Qub24oJ2Ryb3AnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnYmFja2dyb3VuZCcsICcnKTtcblx0XHRcdFx0XHRjb25zdCB0YXNrSWQgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcblx0XHRcdFx0XHRjb25zdCB0YXJnZXRDb2x1bW5JZCA9IGNvbC5pZDtcblxuXHRcdFx0XHRcdGlmICh0YXNrSWQgJiYgdGFyZ2V0Q29sdW1uSWQpIHtcblx0XHRcdFx0XHRcdC8vIE9wdGltaXN0aWMgRE9NIHVwZGF0ZVxuXHRcdFx0XHRcdFx0Y29uc3QgJGRyYWdnZWRDYXJkID0gJChgW2RhdGEtdGFzaz1cIiR7dGFza0lkfVwiXWApO1xuXHRcdFx0XHRcdFx0aWYgKCRkcmFnZ2VkQ2FyZC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdCRjYXJkc0xpc3QuYXBwZW5kKCRkcmFnZ2VkQ2FyZCk7XG5cdFx0XHRcdFx0XHRcdHNlbGYudXBkYXRlQm9hcmRDb2x1bW5Db3VudHMoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gUGVyc2lzdCB0byBiYWNrZW5kXG5cdFx0XHRcdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdFx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLnVwZGF0ZV93b3JrX3BhY2thZ2Vfc3RhdHVzJyxcblx0XHRcdFx0XHRcdFx0YXJnczoge1xuXHRcdFx0XHRcdFx0XHRcdHRhc2tfbmFtZTogdGFza0lkLFxuXHRcdFx0XHRcdFx0XHRcdG5ld19jb2x1bW46IHRhcmdldENvbHVtbklkLFxuXHRcdFx0XHRcdFx0XHRcdGdyb3VwX2J5OiBzZWxmLmJvYXJkR3JvdXBCeVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnV29yayBwYWNrYWdlIHN0YXR1cyB1cGRhdGVkIHRvIHswfScsIFt0YXJnZXRDb2x1bW5JZF0pLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIFBvcHVsYXRlIGNhcmRzXG5cdFx0XHRcdGNvbC5jYXJkcy5mb3JFYWNoKGNhcmQgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHBpbGxDbHMgPSBgd3AtcGlsbC0keyhjYXJkLnR5cGUgfHwgJ3Rhc2snKS50b0xvd2VyQ2FzZSgpfWA7XG5cdFx0XHRcdFx0Y29uc3QgYXNzaWduZWVOYW1lID0gY2FyZC5hc3NpZ25lZV9uYW1lIHx8ICcnO1xuXHRcdFx0XHRcdGNvbnN0IGFzc2lnbmVlSW5pdGlhbHMgPSBhc3NpZ25lZU5hbWUgPyBhc3NpZ25lZU5hbWUuc3BsaXQoJyAnKS5tYXAobiA9PiBuWzBdKS5qb2luKCcnKS5zdWJzdHJpbmcoMCwgMikudG9VcHBlckNhc2UoKSA6ICcnO1xuXHRcdFx0XHRcdGNvbnN0IGFzc2lnbmVlSHRtbCA9IGFzc2lnbmVlTmFtZSA/IGBcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiY2FyZC1hc3NpZ25lZS1waWxsXCIgdGl0bGU9XCIke2Fzc2lnbmVlTmFtZX1cIj5cblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJhc3NpZ25lZS1hdmF0YXJcIj4ke2Fzc2lnbmVlSW5pdGlhbHN9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImFzc2lnbmVlLXRleHRcIj4ke2Fzc2lnbmVlTmFtZX08L3NwYW4+XG5cdFx0XHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHRcdFx0YCA6ICcnO1xuXG5cdFx0XHRcdFx0Y29uc3QgJGNhcmQgPSAkKGBcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY2FyZFwiIGRyYWdnYWJsZT1cInRydWVcIiBkYXRhLXRhc2s9XCIke2NhcmQuaWR9XCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY2FyZC1oZWFkXCI+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2NhcmQudHlwZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJjYXJkLXByaW9yaXR5IHByaW9yaXR5LSR7KGNhcmQucHJpb3JpdHkgfHwgJ25vcm1hbCcpLnRvTG93ZXJDYXNlKCl9XCI+JHtjYXJkLnByaW9yaXR5fTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY2FyZC10aXRsZVwiPiR7Y2FyZC5zdWJqZWN0fTwvZGl2PlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwia2FuYmFuLWNhcmQtZm9vdFwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiY2FyZC1kYXRlLWJhZGdlXCI+JHtJQ09OUy5jYWxlbmRhcn0gPHNwYW4+JHtjYXJkLmV4cF9lbmRfZGF0ZSB8fCAnLS0nfTwvc3Bhbj48L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0JHthc3NpZ25lZUh0bWx9XG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0YCk7XG5cblx0XHRcdFx0XHQkY2FyZC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRcdGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9wbGFpbicsIGNhcmQuaWQpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0JGNhcmQub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0c2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3IoY2FyZCk7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQkY2FyZHNMaXN0LmFwcGVuZCgkY2FyZCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCR3cmFwcGVyLmFwcGVuZCgkY29sKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0dXBkYXRlQm9hcmRDb2x1bW5Db3VudHMoKSB7XG5cdFx0JCgnLmthbmJhbi1jb2x1bW4nKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IGNvdW50ID0gJCh0aGlzKS5maW5kKCcua2FuYmFuLWNhcmQnKS5sZW5ndGg7XG5cdFx0XHQkKHRoaXMpLmZpbmQoJy5jb2wtY2FyZC1jb3VudCcpLnRleHQoY291bnQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgNDogR0FOVFQgU0NIRURVTEUgVElNRUxJTkVcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJHYW50dENoYXJ0KCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmxpc3Rfd29ya19wYWNrYWdlcycsXG5cdFx0XHRhcmdzOiB7IHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsIGZpbHRlcl9rZXk6ICdhbGxfb3BlbicgfVxuXHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRjb25zdCBpdGVtcyA9IHIubWVzc2FnZSB8fCBbXTtcblx0XHRcdGNvbnN0ICR0YXJnZXQgPSAkKCcjZnJhcHBlLWdhbnR0LXRhcmdldCcpO1xuXHRcdFx0JHRhcmdldC5lbXB0eSgpO1xuXG5cdFx0XHRpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdCR0YXJnZXQuaHRtbChgXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImVtcHR5LXN0YXRlLWNhcmRcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJlbXB0eS1zdGF0ZS1pY29uIG1iLTIgdGV4dC1tdXRlZFwiPiR7SUNPTlMuY2FsZW5kYXJ9PC9kaXY+XG5cdFx0XHRcdFx0XHQ8aDQgc3R5bGU9XCJmb250LXdlaWdodDo2MDA7IGZvbnQtc2l6ZToxNXB4OyBjb2xvcjojMTExODI3OyBtYXJnaW46MCAwIDZweCAwO1wiPk5vIFNjaGVkdWxlZCBUYXNrczwvaDQ+XG5cdFx0XHRcdFx0XHQ8cCBjbGFzcz1cInRleHQtbXV0ZWQgbWItM1wiIHN0eWxlPVwiZm9udC1zaXplOjEzcHg7IG1heC13aWR0aDogMzYwcHg7XCI+V29yayBwYWNrYWdlcyB3aXRoIHN0YXJ0IGFuZCBkdWUgZGF0ZXMgd2lsbCBhcHBlYXIgaGVyZSBvbiBhbiBpbnRlcmFjdGl2ZSBzY2hlZHVsZSB0aW1lbGluZS48L3A+XG5cdFx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzPVwiYnRuLXRvcGJhci1wcmltYXJ5IGFjdGlvbi1xdWljay1hZGRcIiBkYXRhLXR5cGU9XCJUYXNrXCI+XG5cdFx0XHRcdFx0XHRcdDxzcGFuPisgQWRkIFRhc2s8L3NwYW4+XG5cdFx0XHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0YCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRm9ybWF0IHRhc2tzIGZvciBHYW50dFxuXHRcdFx0Y29uc3Qgbm93U3RyID0gKGZyYXBwZS5kYXRldGltZSAmJiBmcmFwcGUuZGF0ZXRpbWUuZ2V0X3RvZGF5KSA/IGZyYXBwZS5kYXRldGltZS5nZXRfdG9kYXkoKSA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdO1xuXHRcdFx0Y29uc3QgZ2FudHRUYXNrcyA9IGl0ZW1zLm1hcChpdCA9PiB7XG5cdFx0XHRcdGNvbnN0IHN0YXJ0ID0gaXQuZXhwX3N0YXJ0X2RhdGUgfHwgbm93U3RyO1xuXHRcdFx0XHRjb25zdCBlbmQgPSBpdC5leHBfZW5kX2RhdGUgfHwgKChmcmFwcGUuZGF0ZXRpbWUgJiYgZnJhcHBlLmRhdGV0aW1lLmFkZF9kYXlzKSA/IGZyYXBwZS5kYXRldGltZS5hZGRfZGF5cyhzdGFydCwgNykgOiBzdGFydCk7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0aWQ6IGl0LmlkLFxuXHRcdFx0XHRcdG5hbWU6IGBbJHtpdC50eXBlfV0gJHtpdC5zdWJqZWN0fWAsXG5cdFx0XHRcdFx0c3RhcnQ6IHN0YXJ0LFxuXHRcdFx0XHRcdGVuZDogZW5kLFxuXHRcdFx0XHRcdHByb2dyZXNzOiBpdC5wcm9ncmVzcyB8fCAwLFxuXHRcdFx0XHRcdGN1c3RvbV9jbGFzczogYGJhci0ke2l0LnR5cGUudG9Mb3dlckNhc2UoKX1gXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHdpbmRvdy5HYW50dCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHNlbGYuZ2FudHRDaGFydCA9IG5ldyB3aW5kb3cuR2FudHQoJyNmcmFwcGUtZ2FudHQtdGFyZ2V0JywgZ2FudHRUYXNrcywge1xuXHRcdFx0XHRcdFx0dmlld19tb2RlczogWydRdWFydGVyIERheScsICdIYWxmIERheScsICdEYXknLCAnV2VlaycsICdNb250aCddLFxuXHRcdFx0XHRcdFx0dmlld19tb2RlOiAnRGF5Jyxcblx0XHRcdFx0XHRcdGRhdGVfZm9ybWF0OiAnWVlZWS1NTS1ERCcsXG5cdFx0XHRcdFx0XHRvbl9jbGljazogKHRhc2spID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgd3AgPSBpdGVtcy5maW5kKGkgPT4gaS5pZCA9PT0gdGFzay5pZCk7XG5cdFx0XHRcdFx0XHRcdGlmICh3cCkgc2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3Iod3ApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0JCgnLmdhbnR0LXNjYWxlLWdyb3VwIC5idG4tZ2FudHQtc2NhbGUnKS5vZmYoJ2NsaWNrJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0JCgnLmdhbnR0LXNjYWxlLWdyb3VwIC5idG4tZ2FudHQtc2NhbGUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRcdFx0XHRcdGNvbnN0IHNjYWxlID0gJCh0aGlzKS5kYXRhKCdzY2FsZScpO1xuXHRcdFx0XHRcdFx0aWYgKHNlbGYuZ2FudHRDaGFydCAmJiBzZWxmLmdhbnR0Q2hhcnQuY2hhbmdlX3ZpZXdfbW9kZSkge1xuXHRcdFx0XHRcdFx0XHRzZWxmLmdhbnR0Q2hhcnQuY2hhbmdlX3ZpZXdfbW9kZShzY2FsZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdGcmFwcGUgR2FudHQgaW5zdGFudGlhdGlvbiBmYWlsZWQsIHJlbmRlcmluZyBjdXN0b20gdGltZWxpbmUgZmFsbGJhY2snLCBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBDdXN0b20gSW50ZXJhY3RpdmUgVGltZWxpbmUgVmlzdWFsaXphdGlvbiBGYWxsYmFja1xuXHRcdFx0bGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImN1c3RvbS1nYW50dC10YWJsZSB0YWJsZS1yZXNwb25zaXZlXCI+PHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtY29uZGVuc2VkXCI+PHRoZWFkPjx0cj48dGggd2lkdGg9XCIzMCVcIj5Xb3JrIFBhY2thZ2U8L3RoPjx0aCB3aWR0aD1cIjE1JVwiPlN0YXJ0IERhdGU8L3RoPjx0aCB3aWR0aD1cIjE1JVwiPkR1ZSBEYXRlPC90aD48dGggd2lkdGg9XCI0MCVcIj5UaW1lbGluZSBQcm9ncmVzczwvdGg+PC90cj48L3RoZWFkPjx0Ym9keT4nO1xuXHRcdFx0aXRlbXMuZm9yRWFjaChpdCA9PiB7XG5cdFx0XHRcdGNvbnN0IHBpbGxDbHMgPSBgd3AtcGlsbC0keyhpdC50eXBlIHx8ICd0YXNrJykudG9Mb3dlckNhc2UoKX1gO1xuXHRcdFx0XHRjb25zdCBwcm9ncmVzcyA9IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgaXQucHJvZ3Jlc3MgfHwgKGl0LnN0YXR1cyA9PT0gJ0NvbXBsZXRlZCcgPyAxMDAgOiAyNSkpKTtcblx0XHRcdFx0aHRtbCArPSBgXG5cdFx0XHRcdFx0PHRyIGNsYXNzPVwid3AtZ2FudHQtcm93XCIgZGF0YS1pZD1cIiR7aXQuaWR9XCIgc3R5bGU9XCJjdXJzb3I6IHBvaW50ZXI7XCI+XG5cdFx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2l0LnR5cGV9PC9zcGFuPiA8c3Ryb25nPiR7aXQuc3ViamVjdH08L3N0cm9uZz48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbD4ke2l0LmV4cF9zdGFydF9kYXRlIHx8ICctLSd9PC9zbWFsbD48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbD4ke2l0LmV4cF9lbmRfZGF0ZSB8fCAnLS0nfTwvc21hbGw+PC90ZD5cblx0XHRcdFx0XHRcdDx0ZD5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInByb2dyZXNzXCIgc3R5bGU9XCJtYXJnaW46IDA7IGhlaWdodDogMThweDsgYm9yZGVyLXJhZGl1czogOXB4OyBiYWNrZ3JvdW5kOiAjZTJlOGYwO1wiPlxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLXN0cmlwZWRcIiByb2xlPVwicHJvZ3Jlc3NiYXJcIiBzdHlsZT1cIndpZHRoOiAke3Byb2dyZXNzfSU7IGJhY2tncm91bmQ6ICMwMjg0Yzc7XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHQke3Byb2dyZXNzfSVcblx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8L3RkPlxuXHRcdFx0XHRcdDwvdHI+XG5cdFx0XHRcdGA7XG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvdGJvZHk+PC90YWJsZT48L2Rpdj4nO1xuXHRcdFx0JHRhcmdldC5odG1sKGh0bWwpO1xuXG5cdFx0XHQkdGFyZ2V0LmZpbmQoJy53cC1nYW50dC1yb3cnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnN0IGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHRcdFx0XHRjb25zdCB3cCA9IGl0ZW1zLmZpbmQoaSA9PiBpLmlkID09PSBpZCk7XG5cdFx0XHRcdGlmICh3cCkgc2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3Iod3ApO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFRBQiA1OiBCQ0YgMi1QQU5FIENPT1JESU5BVElPTiBWSUVXRVIgKFNjcmVlbnNob3QgNClcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJCY2ZWaWV3ZXIodGFyZ2V0TW9kZWwgPSBudWxsKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHQvLyAxLiBVcGRhdGUgM0QgQklNIFZpZXdlciBJZnJhbWUgVVJMIHdpdGggcHJvamVjdCBhbmQgdGFyZ2V0IG1vZGVsXG5cdFx0Y29uc3QgJGlmcmFtZSA9ICQoJyNpZnJhbWUtYmNmLTNkLXZpZXdlcicpO1xuXHRcdGNvbnN0IHRhcmdldFBhcmFtID0gdGFyZ2V0TW9kZWwgPyBgJm1vZGVsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRhcmdldE1vZGVsKX1gIDogJyc7XG5cdFx0Y29uc3QgZXhwZWN0ZWRTcmMgPSBgL2FwcC9iaW0tdmlld2VyP3Byb2plY3Q9JHtlbmNvZGVVUklDb21wb25lbnQoc2VsZi5jdXJyZW50UHJvamVjdCl9JHt0YXJnZXRQYXJhbX1gO1xuXHRcdGlmICgkaWZyYW1lLmxlbmd0aCAmJiAkaWZyYW1lLmF0dHIoJ3NyYycpICE9PSBleHBlY3RlZFNyYykge1xuXHRcdFx0JGlmcmFtZS5hdHRyKCdzcmMnLCBleHBlY3RlZFNyYyk7XG5cdFx0fVxuXHRcdCQoJyNidG4tYmNmLW9wZW4tZnVsbHNjcmVlbicpLmF0dHIoJ2hyZWYnLCBleHBlY3RlZFNyYyk7XG5cblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5nZXRfYmNmX2Nvb3JkaW5hdGlvbl9kYXRhJyxcblx0XHRcdGFyZ3M6IHsgcHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCB9XG5cdFx0fSkudGhlbihyID0+IHtcblx0XHRcdGNvbnN0IGRhdGEgPSByLm1lc3NhZ2UgfHwgeyBtb2RlbHM6IFtdLCB0b3BpY3M6IFtdIH07XG5cdFx0XHRjb25zdCBtb2RlbHMgPSBkYXRhLm1vZGVscyB8fCBbXTtcblx0XHRcdGNvbnN0IHRvcGljcyA9IGRhdGEudG9waWNzIHx8IFtdO1xuXG5cdFx0XHQvLyAyLiBQb3B1bGF0ZSBTcGF0aWFsIE1vZGVsIFRyZWVcblx0XHRcdGNvbnN0ICR0cmVlID0gJCgnI2JjZi1tb2RlbHMtdHJlZScpO1xuXHRcdFx0JHRyZWUuZW1wdHkoKTtcblxuXHRcdFx0aWYgKG1vZGVscy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0JHRyZWUuYXBwZW5kKCc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBwLTMgdGV4dC1jZW50ZXJcIj48c21hbGw+Tm8gSUZDIG1vZGVscyB1cGxvYWRlZCB5ZXQuPGJyPkNsaWNrIDxzdHJvbmc+KyBVcGxvYWQgSUZDPC9zdHJvbmc+IGFib3ZlIHRvIGFkZCBvbmUuPC9zbWFsbD48L2Rpdj4nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1vZGVscy5mb3JFYWNoKG0gPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGlzQ2hlY2tlZCA9IHRhcmdldE1vZGVsID8gKG0ubmFtZSA9PT0gdGFyZ2V0TW9kZWwgfHwgbS5tb2RlbF9uYW1lID09PSB0YXJnZXRNb2RlbCkgOiB0cnVlO1xuXHRcdFx0XHRcdCR0cmVlLmFwcGVuZChgXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibW9kZWwtdHJlZS1yb3cgcC0yIGZsZXgtYmV0d2VlblwiIHN0eWxlPVwiYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmMWY1Zjk7IGJvcmRlci1yYWRpdXM6IDZweDtcIj5cblx0XHRcdFx0XHRcdFx0PGxhYmVsIHN0eWxlPVwiZm9udC13ZWlnaHQ6IG5vcm1hbDsgZm9udC1zaXplOiAxMi41cHg7IGN1cnNvcjogcG9pbnRlcjsgbWFyZ2luOiAwOyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDZweDtcIj5cblx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJtb2RlbC10cmVlLWNiXCIgJHtpc0NoZWNrZWQgPyAnY2hlY2tlZCcgOiAnJ30gZGF0YS1tb2RlbD1cIiR7bS5uYW1lfVwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYmFkZ2VcIiBzdHlsZT1cImJhY2tncm91bmQ6I2UwZTdmZjsgY29sb3I6IzQzMzhjYTsgZm9udC1zaXplOjEwcHg7IGZvbnQtd2VpZ2h0OjYwMDtcIj4ke20uZGlzY2lwbGluZSB8fCAnSUZDJ308L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4+JHttLm1vZGVsX25hbWUgfHwgbS5uYW1lfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0XHRcdFx0PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwiYWN0aW9uLWZvY3VzLW1vZGVsIHRleHQtbXV0ZWQgbWwtMVwiIGRhdGEtbW9kZWw9XCIke20ubmFtZX1cIiB0aXRsZT1cIlZpZXcgdGhpcyBtb2RlbFwiPiR7SUNPTlMuZXllfTwvYT5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdGApO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkdHJlZS5maW5kKCcubW9kZWwtdHJlZS1jYicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y29uc3QgbU5hbWUgPSAkKHRoaXMpLmRhdGEoJ21vZGVsJyk7XG5cdFx0XHRcdFx0aWYgKCQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcblx0XHRcdFx0XHRcdCQoJyNpZnJhbWUtYmNmLTNkLXZpZXdlcicpLmF0dHIoJ3NyYycsIGAvYXBwL2JpbS12aWV3ZXI/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWxmLmN1cnJlbnRQcm9qZWN0KX0mbW9kZWw9JHtlbmNvZGVVUklDb21wb25lbnQobU5hbWUpfWApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JHRyZWUuZmluZCgnLmFjdGlvbi1mb2N1cy1tb2RlbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjb25zdCBtTmFtZSA9ICQodGhpcykuZGF0YSgnbW9kZWwnKTtcblx0XHRcdFx0XHQkdHJlZS5maW5kKCcubW9kZWwtdHJlZS1jYicpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG5cdFx0XHRcdFx0JHRyZWUuZmluZChgLm1vZGVsLXRyZWUtY2JbZGF0YS1tb2RlbD1cIiR7bU5hbWV9XCJdYCkucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuXHRcdFx0XHRcdCQoJyNpZnJhbWUtYmNmLTNkLXZpZXdlcicpLmF0dHIoJ3NyYycsIGAvYXBwL2JpbS12aWV3ZXI/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWxmLmN1cnJlbnRQcm9qZWN0KX0mbW9kZWw9JHtlbmNvZGVVUklDb21wb25lbnQobU5hbWUpfWApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gMy4gUG9wdWxhdGUgQkNGIFRvcGljc1xuXHRcdFx0JCgnI2JjZi10b3BpYy1jb3VudCcpLnRleHQodG9waWNzLmxlbmd0aCk7XG5cdFx0XHRjb25zdCAkc3RyZWFtID0gJCgnI2JjZi1jYXJkcy1jb250YWluZXInKTtcblx0XHRcdCRzdHJlYW0uZW1wdHkoKTtcblxuXHRcdFx0aWYgKHRvcGljcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0JHN0cmVhbS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkIHAtNCB0ZXh0LWNlbnRlclwiPjxzbWFsbD5ObyBCQ0YgdG9waWNzIGxvZ2dlZCBmb3IgdGhpcyBwcm9qZWN0Ljwvc21hbGw+PC9kaXY+Jyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0b3BpY3MuZm9yRWFjaCh0b3AgPT4ge1xuXHRcdFx0XHRcdCRzdHJlYW0uYXBwZW5kKGBcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJiY2YtdG9waWMtY2FyZCBtYi0yXCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4LWJldHdlZW4gbWItMVwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwic3RhdHVzLXdhcm5pbmctcGlsbFwiPiR7ZXNjYXBlSHRtbCh0b3AudG9waWNfdHlwZSl9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwidGV4dC1tdXRlZFwiIHN0eWxlPVwiZm9udC1zaXplOjExcHg7XCI+JHtlc2NhcGVIdG1sKHRvcC5zdGF0dXMpfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmb250LXdlaWdodC1tZWRpdW1cIiBzdHlsZT1cImZvbnQtc2l6ZToxM3B4OyBjb2xvcjojMTExODI3O1wiPiR7ZXNjYXBlSHRtbCh0b3AudGl0bGUpfTwvZGl2PlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0xIG10LTFcIiBzdHlsZT1cImZvbnQtc2l6ZToxMS41cHg7XCI+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4+JHtJQ09OUy5jbG9ja308L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4+JHtlc2NhcGVIdG1sKHRvcC5jcmVhdGlvbiA/IHRvcC5jcmVhdGlvbi5zcGxpdCgnICcpWzBdIDogJy0tJyl9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibXgtMVwiPlx1MjAyMjwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0XHQ8c3Bhbj4ke2VzY2FwZUh0bWwodG9wLmFzc2lnbmVkX3RvIHx8ICdVbmFzc2lnbmVkJyl9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdGApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVEFCIDg6IFBST0pFQ1QgRE9DVU1FTlRTIFRSRUUgJiBVUExPQURcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJEb2N1bWVudHNUcmVlKCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmdldF9wcm9qZWN0X2RvY3VtZW50X3RyZWUnLFxuXHRcdFx0YXJnczogeyBwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0IH1cblx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0Y29uc3QgZm9sZGVycyA9IHIubWVzc2FnZSB8fCBbXTtcblx0XHRcdGNvbnN0ICRjb250ID0gJCgnI2RvY3VtZW50LWZvbGRlcnMtY29udGFpbmVyJyk7XG5cdFx0XHQkY29udC5lbXB0eSgpO1xuXG5cdFx0XHRjb25zdCBmb2xkZXJDb25maWcgPSB7XG5cdFx0XHRcdCcwMSBDb250cmFjdHMgJiBOVFAnOiB7IGljb246IElDT05TLmZpbGUsIGJnOiAnI2VmZjZmZicsIGNvbG9yOiAnIzI1NjNlYicgfSxcblx0XHRcdFx0JzAyIERyYXdpbmdzICYgU3BlY3MnOiB7IGljb246IElDT05TLmxpc3QsIGJnOiAnI2Y1ZjNmZicsIGNvbG9yOiAnIzdjM2FlZCcgfSxcblx0XHRcdFx0JzAzIEJJTSBNb2RlbHMnOiB7IGljb246IElDT05TLmN1YmUsIGJnOiAnI2ZmZmJlYicsIGNvbG9yOiAnI2Q5NzcwNicgfSxcblx0XHRcdFx0JzA0IEJPUSAmIEVzdGltYXRlcyc6IHsgaWNvbjogSUNPTlMudGFibGUsIGJnOiAnI2VjZmRmNScsIGNvbG9yOiAnIzA1OTY2OScgfSxcblx0XHRcdFx0JzA1IFNpdGUgTWVkaWEnOiB7IGljb246IElDT05TLmNhbWVyYSwgYmc6ICcjZmZmMWYyJywgY29sb3I6ICcjZTExZDQ4JyB9XG5cdFx0XHR9O1xuXG5cdFx0XHRmb2xkZXJzLmZvckVhY2goZiA9PiB7XG5cdFx0XHRcdGNvbnN0IGNmZyA9IGZvbGRlckNvbmZpZ1tmLmZvbGRlcl9uYW1lXSB8fCB7IGljb246IElDT05TLmZvbGRlciwgYmc6ICcjZjFmNWY5JywgY29sb3I6ICcjNDc1NDY3JyB9O1xuXHRcdFx0XHRjb25zdCAkYm94ID0gJChgXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImRvYy1mb2xkZXItY2FyZFwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvbGRlci1oZWFkZXJcIj5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvbGRlci1pY29uLXBpbGxcIiBzdHlsZT1cImJhY2tncm91bmQ6ICR7Y2ZnLmJnfTsgY29sb3I6ICR7Y2ZnLmNvbG9yfTtcIj5cblx0XHRcdFx0XHRcdFx0XHQke2NmZy5pY29ufVxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvbGRlci10aXRsZS1ib3hcIj5cblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImZvbGRlci1uYW1lXCI+JHtmLmZvbGRlcl9uYW1lfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImZvbGRlci1jb3VudC1iYWRnZVwiPiR7Zi5maWxlcy5sZW5ndGh9IGl0ZW1zPC9zcGFuPlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvbGRlci1maWxlcy1saXN0XCI+XG5cdFx0XHRcdFx0XHRcdDwhLS0gRmlsZXMgLS0+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0YCk7XG5cblx0XHRcdFx0Y29uc3QgJGZMaXN0ID0gJGJveC5maW5kKCcuZm9sZGVyLWZpbGVzLWxpc3QnKTtcblx0XHRcdFx0aWYgKGYuZmlsZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0JGZMaXN0LmFwcGVuZCgnPGRpdiBjbGFzcz1cInRleHQtbXV0ZWQgcC0zIHRleHQtY2VudGVyXCIgc3R5bGU9XCJmb250LXNpemU6MTJweDtcIj5ObyBmaWxlcyBpbiBmb2xkZXI8L2Rpdj4nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmLmZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG5cdFx0XHRcdFx0XHQkZkxpc3QuYXBwZW5kKGBcblx0XHRcdFx0XHRcdFx0PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwiZmlsZS1pdGVtLWxpbmtcIiBkYXRhLXJvdXRlPVwiJHtmaWxlLnJvdXRlX3RhcmdldH1cIiBkYXRhLXVybD1cIiR7ZmlsZS5maWxlX3VybH1cIiBkYXRhLW1vZGVsLWlkPVwiJHtmaWxlLm1vZGVsX2lkIHx8IGZpbGUuaWQgfHwgJyd9XCI+XG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZpbGUtaXRlbS1sZWZ0XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cInRleHQtbXV0ZWQgbXItMVwiPiR7SUNPTlMuZmlsZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImZpbGUtbmFtZS10ZXh0XCI+JHtmaWxlLmZpbGVfbmFtZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJmb2xkZXItY291bnQtYmFkZ2VcIj4ke2ZpbGUuYmFkZ2UgfHwgJ0ZpbGUnfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdFx0YCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkY29udC5hcHBlbmQoJGJveCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JGNvbnQuZmluZCgnLmZpbGUtaXRlbS1saW5rJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCByb3V0ZSA9ICQodGhpcykuZGF0YSgncm91dGUnKTtcblx0XHRcdFx0Y29uc3QgdXJsID0gJCh0aGlzKS5kYXRhKCd1cmwnKTtcblx0XHRcdFx0Y29uc3QgbW9kZWxJZCA9ICQodGhpcykuZGF0YSgnbW9kZWwtaWQnKTtcblx0XHRcdFx0aWYgKHJvdXRlID09PSAnYmltLXZpZXdlcicgfHwgKHVybCAmJiB1cmwuZW5kc1dpdGgoJy5pZmMnKSkpIHtcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYignYmNmJywgeyBtb2RlbDogbW9kZWxJZCB9KTtcblx0XHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ2R3Zy12aWV3ZXInIHx8ICh1cmwgJiYgKHVybC5lbmRzV2l0aCgnLmR3ZycpIHx8IHVybC5lbmRzV2l0aCgnLmR4ZicpKSkpIHtcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYignY2FkJywgeyBmaWxlOiB1cmwgfSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAocm91dGUgPT09ICdwZGYtdGFrZW9mZicgfHwgKHVybCAmJiB1cmwuZW5kc1dpdGgoJy5wZGYnKSkpIHtcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYigncGRmJywgeyBmaWxlOiB1cmwgfSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAodXJsKSB7XG5cdFx0XHRcdFx0d2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0aGFuZGxlVXBsb2FkZWRGaWxlKGZpbGVEb2MpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBleHQgPSAoZmlsZURvYy5maWxlX25hbWUgfHwgJycpLnNwbGl0KCcuJykucG9wKCkudG9Mb3dlckNhc2UoKTtcblx0XHRpZiAoZXh0ID09PSAnaWZjJykge1xuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnSW5nZXN0aW5nIElGQyBtb2RlbCBpbnRvIDNEIEJJTSBkYXRhYmFzZS4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcblx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5iaW0uYXBpLmNyZWF0ZV9tb2RlbF9mcm9tX2lmYycsXG5cdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRmaWxlX3VybDogZmlsZURvYy5maWxlX3VybCxcblx0XHRcdFx0XHRmaWxlX25hbWU6IGZpbGVEb2MuZmlsZV9uYW1lLFxuXHRcdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXG5cdFx0XHRcdFx0bW9kZWxfbmFtZTogZmlsZURvYy5maWxlX25hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSxcblx0XHRcdFx0XHRkaXNjaXBsaW5lOiAnQXJjaGl0ZWN0dXJlJ1xuXHRcdFx0XHR9XG5cdFx0XHR9KS50aGVuKHJlcyA9PiB7XG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ0JJTSBNb2RlbCBpbmdlc3RlZCBzdWNjZXNzZnVsbHkhJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdFx0c2VsZi5yZW5kZXJEb2N1bWVudHNUcmVlKCk7XG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdiY2YnLCB7IG1vZGVsOiByZXMubWVzc2FnZSA/IHJlcy5tZXNzYWdlLm5hbWUgOiBudWxsIH0pO1xuXHRcdFx0fSkuY2F0Y2goZXJyID0+IHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcignRmFpbGVkIHRvIHBhcnNlIElGQzonLCBlcnIpO1xuXHRcdFx0XHRmcmFwcGUubXNncHJpbnQoX18oJ1VwbG9hZGVkIGZpbGUgc2F2ZWQsIGJ1dCBJRkMgcGFyc2luZyBlbmNvdW50ZXJlZCBhbiBpc3N1ZTogJykgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSk7XG5cdFx0XHRcdHNlbGYucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYignYmNmJyk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnRmlsZSB1cGxvYWRlZCBzdWNjZXNzZnVsbHkuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdHNlbGYucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xuXHRcdH1cblx0fVxuXG5cdG9wZW5GaWxlVXBsb2FkRGlhbG9nKCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdG5ldyBmcmFwcGUudWkuRmlsZVVwbG9hZGVyKHtcblx0XHRcdGRvY3R5cGU6ICdQcm9qZWN0Jyxcblx0XHRcdGRvY25hbWU6IHNlbGYuY3VycmVudFByb2plY3QsXG5cdFx0XHRmb2xkZXI6ICdIb21lJyxcblx0XHRcdG9uX3N1Y2Nlc3MoZmlsZV9kb2MpIHtcblx0XHRcdFx0c2VsZi5oYW5kbGVVcGxvYWRlZEZpbGUoZmlsZV9kb2MpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0b3BlbkJjZlVwbG9hZERpYWxvZygpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRuZXcgZnJhcHBlLnVpLkZpbGVVcGxvYWRlcih7XG5cdFx0XHRkb2N0eXBlOiAnUHJvamVjdCcsXG5cdFx0XHRkb2NuYW1lOiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0Zm9sZGVyOiAnSG9tZScsXG5cdFx0XHRyZXN0cmljdGlvbnM6IHtcblx0XHRcdFx0YWxsb3dlZF9maWxlX3R5cGVzOiBbJy5pZmMnXVxuXHRcdFx0fSxcblx0XHRcdG9uX3N1Y2Nlc3MoZmlsZV9kb2MpIHtcblx0XHRcdFx0c2VsZi5oYW5kbGVVcGxvYWRlZEZpbGUoZmlsZV9kb2MpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgOTogTUVFVElOR1MgJiBUT09MQk9YIFRBTEtTXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyTWVldGluZ3NUYWIoKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YSB8fCB7fTtcblx0XHRjb25zdCBtZWV0aW5ncyA9IGRhdGEubWVldGluZ3MgfHwgW107XG5cdFx0Y29uc3QgJGNvbnQgPSAkKCcjbWVldGluZ3MtdGFiLWNvbnRhaW5lcicpO1xuXHRcdCRjb250LmVtcHR5KCk7XG5cblx0XHRpZiAobWVldGluZ3MubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQkY29udC5odG1sKGBcblx0XHRcdFx0PGRpdiBjbGFzcz1cImVtcHR5LXN0YXRlLWNhcmRcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZW1wdHktc3RhdGUtaWNvbiBtYi0yIHRleHQtbXV0ZWRcIj4ke0lDT05TLmNhbGVuZGFyfTwvZGl2PlxuXHRcdFx0XHRcdDxoNCBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDsgZm9udC1zaXplOjE1cHg7IGNvbG9yOiMxMTE4Mjc7IG1hcmdpbjowIDAgNnB4IDA7XCI+Tm8gQnJpZWZpbmdzIFNjaGVkdWxlZDwvaDQ+XG5cdFx0XHRcdFx0PHAgY2xhc3M9XCJ0ZXh0LW11dGVkIG1iLTNcIiBzdHlsZT1cImZvbnQtc2l6ZToxM3B4OyBtYXgtd2lkdGg6IDM2MHB4O1wiPk5vIGNvb3JkaW5hdGlvbiBtZWV0aW5ncyBvciB0b29sYm94IHRhbGtzIHJlY29yZGVkIHlldCBmb3IgdGhpcyBwcm9qZWN0LjwvcD5cblx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzPVwiYnRuLXRvcGJhci1wcmltYXJ5XCIgaWQ9XCJidG4tc2NoZWR1bGUtbWVldGluZy1lbXB0eVwiPlxuXHRcdFx0XHRcdFx0PHNwYW4+KyBOZXcgTWVldGluZzwvc3Bhbj5cblx0XHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRgKTtcblx0XHRcdCRjb250LmZpbmQoJyNidG4tc2NoZWR1bGUtbWVldGluZy1lbXB0eScpLm9uKCdjbGljaycsICgpID0+IHNlbGYub3BlblNjaGVkdWxlTWVldGluZ0RpYWxvZygpKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRtZWV0aW5ncy5mb3JFYWNoKG0gPT4ge1xuXHRcdFx0Y29uc3QgZG9jVHlwZSA9IG0uZG9jdHlwZSB8fCAobS50eXBlID09PSAnVG9vbGJveCBUYWxrJyA/ICdUb29sYm94IFRhbGsnIDogJ0V2ZW50Jyk7XG5cdFx0XHRjb25zdCBpc1Rvb2xib3ggPSBtLnR5cGUgPT09ICdUb29sYm94IFRhbGsnO1xuXHRcdFx0Y29uc3QgcGlsbENscyA9IGlzVG9vbGJveCA/ICdtZWV0aW5nLXBpbGwtdG9vbGJveCcgOiAnbWVldGluZy1waWxsLWNvb3JkJztcblxuXHRcdFx0JGNvbnQuYXBwZW5kKGBcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctY2FyZC1zdXJmYWNlXCI+XG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctY2FyZC1tYWluXCI+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVldGluZy1jYXJkLWhlYWRlclwiPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1lZXRpbmctYmFkZ2UgJHtwaWxsQ2xzfVwiPiR7ZXNjYXBlSHRtbChtLnR5cGUpfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PGg0IGNsYXNzPVwibWVldGluZy10aXRsZVwiPiR7ZXNjYXBlSHRtbChtLnRpdGxlKX08L2g0PlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVldGluZy1tZXRhLXJvd1wiPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1ldGEtaXRlbVwiPiR7SUNPTlMuY2FsZW5kYXJ9IDxzcGFuPiR7ZXNjYXBlSHRtbChtLmRhdGUpfTwvc3Bhbj48L3NwYW4+XG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibWV0YS1kaXZpZGVyXCI+XHUyMDIyPC9zcGFuPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1ldGEtaXRlbVwiPiR7SUNPTlMudXNlcn0gPHNwYW4+Q29uZHVjdG9yOiAke2VzY2FwZUh0bWwobS5ob3N0IHx8ICdTaXRlIENvb3JkaW5hdG9yJyl9PC9zcGFuPjwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZXRhLWRpdmlkZXJcIj5cdTIwMjI8L3NwYW4+XG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibWV0YS1pdGVtXCI+JHtJQ09OUy51c2Vyc30gPHNwYW4+QXR0ZW5kZWVzOiAke2VzY2FwZUh0bWwobS5wYXJ0aWNpcGFudHMgfHwgMCl9PC9zcGFuPjwvc3Bhbj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJtZWV0aW5nLWNhcmQtYWN0aW9uXCI+XG5cdFx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzPVwiYnRuLXRvcGJhci1hY3Rpb24gYnRuLXNtIGJ0bi12aWV3LW1lZXRpbmctZG9jXCIgZGF0YS1kb2N0eXBlPVwiJHtlc2NhcGVIdG1sKGRvY1R5cGUpfVwiIGRhdGEtbmFtZT1cIiR7ZXNjYXBlSHRtbChtLm5hbWUpfVwiPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1yLTFcIj4ke0lDT05TLmV5ZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdDxzcGFuPlZpZXcgRG9jPC9zcGFuPlxuXHRcdFx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0YCk7XG5cdFx0fSk7XG5cblx0XHQkY29udC5maW5kKCcuYnRuLXZpZXctbWVldGluZy1kb2MnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBkdCA9ICQodGhpcykuZGF0YSgnZG9jdHlwZScpIHx8ICdFdmVudCc7XG5cdFx0XHRjb25zdCBubSA9ICQodGhpcykuZGF0YSgnbmFtZScpO1xuXHRcdFx0ZnJhcHBlLnNldF9yb3V0ZSgnRm9ybScsIGR0LCBubSk7XG5cdFx0fSk7XG5cdH1cblxuXHRvcGVuU2NoZWR1bGVNZWV0aW5nRGlhbG9nKCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGNvbnN0IGQgPSBuZXcgZnJhcHBlLnVpLkRpYWxvZyh7XG5cdFx0XHR0aXRsZTogX18oJ1NjaGVkdWxlIENvb3JkaW5hdGlvbiBNZWV0aW5nIG9yIFNhZmV0eSBCcmllZmluZycpLFxuXHRcdFx0ZmllbGRzOiBbXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnbWVldGluZ190eXBlJywgbGFiZWw6IF9fKCdUeXBlJyksIGZpZWxkdHlwZTogJ1NlbGVjdCcsIG9wdGlvbnM6ICdUb29sYm94IFRhbGtcXG5Db29yZGluYXRpb24gTWVldGluZycsIGRlZmF1bHQ6ICdUb29sYm94IFRhbGsnIH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnc3ViamVjdCcsIGxhYmVsOiBfXygnVG9waWMgLyBTdWJqZWN0JyksIGZpZWxkdHlwZTogJ0RhdGEnLCByZXFkOiAxIH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnZGF0ZScsIGxhYmVsOiBfXygnRGF0ZScpLCBmaWVsZHR5cGU6ICdEYXRlJywgZGVmYXVsdDogKGZyYXBwZS5kYXRldGltZSAmJiBmcmFwcGUuZGF0ZXRpbWUuZ2V0X3RvZGF5KSA/IGZyYXBwZS5kYXRldGltZS5nZXRfdG9kYXkoKSA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLCByZXFkOiAxIH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnY29uZHVjdG9yJywgbGFiZWw6IF9fKCdDb25kdWN0b3IgKFNhZmV0eSBPZmZpY2VyIC8gSG9zdCknKSwgZmllbGR0eXBlOiAnRGF0YScsIGRlZmF1bHQ6IGZyYXBwZS5zZXNzaW9uLnVzZXJfZnVsbG5hbWUgfHwgZnJhcHBlLnNlc3Npb24udXNlciB8fCAnQWRtaW5pc3RyYXRvcicsIHJlcWQ6IDEgfVxuXHRcdFx0XSxcblx0XHRcdHByaW1hcnlfYWN0aW9uX2xhYmVsOiBfXygnQ3JlYXRlIE1lZXRpbmcnKSxcblx0XHRcdHByaW1hcnlfYWN0aW9uKHZhbHVlcykge1xuXHRcdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8uc2NoZWR1bGVfcHJvamVjdF9tZWV0aW5nJyxcblx0XHRcdFx0XHRhcmdzOiB7XG5cdFx0XHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0XHRcdFx0bWVldGluZ190eXBlOiB2YWx1ZXMubWVldGluZ190eXBlLFxuXHRcdFx0XHRcdFx0c3ViamVjdDogdmFsdWVzLnN1YmplY3QsXG5cdFx0XHRcdFx0XHRkYXRlOiB2YWx1ZXMuZGF0ZSxcblx0XHRcdFx0XHRcdGNvbmR1Y3RvcjogdmFsdWVzLmNvbmR1Y3RvclxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0ZC5oaWRlKCk7XG5cdFx0XHRcdFx0Y29uc3QgbGFiZWwgPSB2YWx1ZXMubWVldGluZ190eXBlID09PSAnVG9vbGJveCBUYWxrJyA/IF9fKCdUb29sYm94IHRhbGsgc2NoZWR1bGVkLicpIDogX18oJ0Nvb3JkaW5hdGlvbiBtZWV0aW5nIHNjaGVkdWxlZC4nKTtcblx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0RGF0YShzZWxmLmN1cnJlbnRQcm9qZWN0KTtcblx0XHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnbWVldGluZ3MnKSB7XG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHNlbGYucmVuZGVyTWVldGluZ3NUYWIoKSwgMTUwKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pLmNhdGNoKGVyciA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3Igc2NoZWR1bGluZyBtZWV0aW5nOicsIGVycik7XG5cdFx0XHRcdFx0ZnJhcHBlLm1zZ3ByaW50KF9fKCdFcnJvcjogJykgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGQuc2hvdygpO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMTA6IE1FTUJFUlNcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJNZW1iZXJzVGFibGUoKSB7XG5cdFx0Y29uc3QgJHRib2R5ID0gJCgnI21lbWJlcnMtdGFibGUtYm9keScpO1xuXHRcdCR0Ym9keS5lbXB0eSgpO1xuXHRcdGNvbnN0IG1lbWJlcnMgPSAodGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhICYmIHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YS5tZW1iZXJzKSB8fCBbXTtcblxuXHRcdGlmIChtZW1iZXJzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0JHRib2R5LmFwcGVuZCgnPHRyPjx0ZCBjb2xzcGFuPVwiNFwiIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1tdXRlZCBwLTRcIj48c21hbGw+Tm8gdGVhbSBtZW1iZXJzIGFzc2lnbmVkIHRvIHRoaXMgcHJvamVjdC48L3NtYWxsPjwvdGQ+PC90cj4nKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRtZW1iZXJzLmZvckVhY2gobSA9PiB7XG5cdFx0XHRjb25zdCBmdWxsTmFtZSA9IG0uZnVsbF9uYW1lIHx8IG0udXNlciB8fCAnTWVtYmVyJztcblx0XHRcdGNvbnN0IGluaXRpYWxzID0gZnVsbE5hbWUuc3BsaXQoJyAnKS5tYXAobiA9PiBuWzBdKS5qb2luKCcnKS5zdWJzdHJpbmcoMCwgMikudG9VcHBlckNhc2UoKSB8fCAnTUInO1xuXHRcdFx0JHRib2R5LmFwcGVuZChgXG5cdFx0XHRcdDx0ciBjbGFzcz1cIm1lbWJlci10YWJsZS1yb3dcIj5cblx0XHRcdFx0XHQ8dGQ+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVtYmVyLWNlbGxcIj5cblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZW1iZXItYXZhdGFyLWNpcmNsZVwiPiR7ZXNjYXBlSHRtbChpbml0aWFscyl9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1lbWJlci1uYW1lIGZvbnQtd2VpZ2h0LW1lZGl1bVwiPiR7ZXNjYXBlSHRtbChmdWxsTmFtZSl9PC9zcGFuPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC90ZD5cblx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtlc2NhcGVIdG1sKG0udXNlcil9PC9zcGFuPjwvdGQ+XG5cdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwibWVtYmVyLXJvbGUtcGlsbFwiPiR7ZXNjYXBlSHRtbChtLnJvbGUgfHwgJ01lbWJlcicpfTwvc3Bhbj48L3RkPlxuXHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cInN0YXR1cy1hY3RpdmUtcGlsbFwiPjxzcGFuIGNsYXNzPVwic3RhdHVzLWRvdC1ncmVlblwiPjwvc3Bhbj4gQWN0aXZlPC9zcGFuPjwvdGQ+XG5cdFx0XHRcdDwvdHI+XG5cdFx0XHRgKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVEFCIDExOiBTRVRUSU5HU1xuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHJlbmRlclNldHRpbmdzVGFiKCkge1xuXHRcdGlmICghdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhKSByZXR1cm47XG5cdFx0Y29uc3Qgc3VtbWFyeSA9IHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YS5zdW1tYXJ5IHx8IHt9O1xuXHRcdCQoJyNzZXR0aW5nLXByb2plY3QtbmFtZScpLnZhbChzdW1tYXJ5LnByb2plY3RfbmFtZSB8fCAnJyk7XG5cdFx0JCgnI3NldHRpbmctc3RhdHVzLW5hcnJhdGl2ZScpLnZhbChzdW1tYXJ5LnN0YXR1c19uYXJyYXRpdmUgfHwgJycpO1xuXHRcdCQoJyNzZXR0aW5nLWlzLXRlbXBsYXRlJykucHJvcCgnY2hlY2tlZCcsICEhc3VtbWFyeS5pc190ZW1wbGF0ZSk7XG5cdFx0JCgnI3NldHRpbmctaXMtZmF2b3JpdGUnKS5wcm9wKCdjaGVja2VkJywgISFzdW1tYXJ5LmlzX2Zhdm9yaXRlKTtcblx0fVxuXG5cdHNhdmVQcm9qZWN0U2V0dGluZ3MoKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3Qgc2V0dGluZ3MgPSB7XG5cdFx0XHRwcm9qZWN0X25hbWU6ICQoJyNzZXR0aW5nLXByb2plY3QtbmFtZScpLnZhbCgpLFxuXHRcdFx0c3RhdHVzX25hcnJhdGl2ZTogJCgnI3NldHRpbmctc3RhdHVzLW5hcnJhdGl2ZScpLnZhbCgpLFxuXHRcdFx0aXNfdGVtcGxhdGU6ICQoJyNzZXR0aW5nLWlzLXRlbXBsYXRlJykuaXMoJzpjaGVja2VkJykgPyAxIDogMCxcblx0XHRcdGlzX2Zhdm9yaXRlOiAkKCcjc2V0dGluZy1pcy1mYXZvcml0ZScpLmlzKCc6Y2hlY2tlZCcpID8gMSA6IDBcblx0XHR9O1xuXG5cdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8udXBkYXRlX3Byb2plY3Rfc2V0dGluZ3MnLFxuXHRcdFx0YXJnczoge1xuXHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0XHRzZXR0aW5nc19qc29uOiBKU09OLnN0cmluZ2lmeShzZXR0aW5ncylcblx0XHRcdH1cblx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1Byb2plY3Qgc2V0dGluZ3Mgc2F2ZWQgc3VjY2Vzc2Z1bGx5LicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKTtcblx0XHR9KTtcblx0fVxuXG5cdHRvZ2dsZUFyY2hpdmVQcm9qZWN0KCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGNvbnN0IHByb2ogPSB0aGlzLmFsbFByb2plY3RzLmZpbmQocCA9PiBwLm5hbWUgPT09IHRoaXMuY3VycmVudFByb2plY3QpO1xuXHRcdGNvbnN0IGN1cnJlbnRBY3RpdmUgPSBwcm9qID8gcHJvai5pc19hY3RpdmUgOiAnWWVzJztcblx0XHRjb25zdCBuZXh0QWN0aXZlID0gY3VycmVudEFjdGl2ZSA9PT0gJ1llcycgPyAnTm8nIDogJ1llcyc7XG5cdFx0Y29uc3QgYWN0aW9uV29yZCA9IG5leHRBY3RpdmUgPT09ICdObycgPyBfXygnQXJjaGl2ZScpIDogX18oJ1Jlc3RvcmUnKTtcblxuXHRcdGZyYXBwZS5jb25maXJtKF9fKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gezB9IHRoaXMgcHJvamVjdD8nLCBbYWN0aW9uV29yZC50b0xvd2VyQ2FzZSgpXSksICgpID0+IHtcblx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQoc2VsZi5jdXJyZW50UHJvamVjdCwgeyBpc19hY3RpdmU6IG5leHRBY3RpdmUgfSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1Byb2plY3QgezB9ZCBzdWNjZXNzZnVsbHkuJywgW2FjdGlvbldvcmQudG9Mb3dlckNhc2UoKV0pLCBpbmRpY2F0b3I6ICdvcmFuZ2UnIH0pO1xuXHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYignYWxsLXByb2plY3RzJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRjb25maXJtRGVsZXRlUHJvamVjdCgpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRmcmFwcGUuY29uZmlybShfXygnXHUyNkEwXHVGRTBGIEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBQRVJNQU5FTlRMWSBERUxFVEUgezB9PyBUaGlzIGNhbm5vdCBiZSB1bmRvbmUuJywgW3NlbGYuY3VycmVudFByb2plY3RdKSwgKCkgPT4ge1xuXHRcdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50LmRlbGV0ZScsXG5cdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRkb2N0eXBlOiAnUHJvamVjdCcsXG5cdFx0XHRcdFx0bmFtZTogc2VsZi5jdXJyZW50UHJvamVjdFxuXHRcdFx0XHR9XG5cdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCBkZWxldGVkLicpLCBpbmRpY2F0b3I6ICdyZWQnIH0pO1xuXHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYignYWxsLXByb2plY3RzJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFFVSUNLIENSRUFURSBNT0RBTCAoU2NyZWVuc2hvdCA1KVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdG9wZW5RdWlja0NyZWF0ZU1vZGFsKHR5cGUpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRpZiAodHlwZSA9PT0gJ3Byb2plY3QnIHx8IHR5cGUgPT09ICdzdWJwcm9qZWN0Jykge1xuXHRcdFx0Y29uc3QgaXNTdWIgPSB0eXBlID09PSAnc3VicHJvamVjdCc7XG5cdFx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xuXHRcdFx0XHR0aXRsZTogaXNTdWIgPyBfXygnQWRkIFN1YnByb2plY3QnKSA6IF9fKCdBZGQgTmV3IFByb2plY3QnKSxcblx0XHRcdFx0ZmllbGRzOiBbXG5cdFx0XHRcdFx0eyBmaWVsZG5hbWU6ICdwcm9qZWN0X25hbWUnLCBsYWJlbDogX18oJ1Byb2plY3QgTmFtZScpLCBmaWVsZHR5cGU6ICdEYXRhJywgcmVxZDogMSB9LFxuXHRcdFx0XHRcdHsgZmllbGRuYW1lOiAnZnJvbV90ZW1wbGF0ZScsIGxhYmVsOiBfXygnQ2xvbmUgZnJvbSBUZW1wbGF0ZScpLCBmaWVsZHR5cGU6ICdMaW5rJywgb3B0aW9uczogJ1Byb2plY3QnIH1cblx0XHRcdFx0XSxcblx0XHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdDcmVhdGUgUHJvamVjdCcpLFxuXHRcdFx0XHRwcmltYXJ5X2FjdGlvbih2YWx1ZXMpIHtcblx0XHRcdFx0XHRpZiAodmFsdWVzLmZyb21fdGVtcGxhdGUpIHtcblx0XHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0XHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8uY2xvbmVfcHJvamVjdF9mcm9tX3RlbXBsYXRlJyxcblx0XHRcdFx0XHRcdFx0YXJnczoge1xuXHRcdFx0XHRcdFx0XHRcdHRlbXBsYXRlX3Byb2plY3Q6IHZhbHVlcy5mcm9tX3RlbXBsYXRlLFxuXHRcdFx0XHRcdFx0XHRcdG5ld19wcm9qZWN0X25hbWU6IHZhbHVlcy5wcm9qZWN0X25hbWVcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSkudGhlbihyID0+IHtcblx0XHRcdFx0XHRcdFx0ZC5oaWRlKCk7XG5cdFx0XHRcdFx0XHRcdGlmIChpc1N1Yikge1xuXHRcdFx0XHRcdFx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQoci5tZXNzYWdlLm5ld19wcm9qZWN0LCB7IHBhcmVudF9wcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0IH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCk7XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzZWxmLnNlbGVjdFByb2plY3Qoci5tZXNzYWdlLm5ld19wcm9qZWN0KTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0XHRcdFx0bWV0aG9kOiAnZnJhcHBlLmNsaWVudC5pbnNlcnQnLFxuXHRcdFx0XHRcdFx0XHRhcmdzOiB7XG5cdFx0XHRcdFx0XHRcdFx0ZG9jOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRkb2N0eXBlOiAnUHJvamVjdCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0X25hbWU6IHZhbHVlcy5wcm9qZWN0X25hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRzdGF0dXM6ICdPcGVuJyxcblx0XHRcdFx0XHRcdFx0XHRcdGlzX2FjdGl2ZTogJ1llcycsXG5cdFx0XHRcdFx0XHRcdFx0XHRwYXJlbnRfcHJvamVjdDogaXNTdWIgPyBzZWxmLmN1cnJlbnRQcm9qZWN0IDogbnVsbFxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSkudGhlbihyID0+IHtcblx0XHRcdFx0XHRcdFx0ZC5oaWRlKCk7XG5cdFx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmICghaXNTdWIpIHNlbGYuc2VsZWN0UHJvamVjdChyLm1lc3NhZ2UubmFtZSk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGQuc2hvdygpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlID09PSAndXNlcicpIHtcblx0XHRcdGNvbnN0IGQgPSBuZXcgZnJhcHBlLnVpLkRpYWxvZyh7XG5cdFx0XHRcdHRpdGxlOiBfXygnSW52aXRlIFByb2plY3QgTWVtYmVyJyksXG5cdFx0XHRcdGZpZWxkczogW1xuXHRcdFx0XHRcdHsgZmllbGRuYW1lOiAnZW1haWwnLCBsYWJlbDogX18oJ1VzZXIgRW1haWwnKSwgZmllbGR0eXBlOiAnRGF0YScsIHJlcWQ6IDEgfSxcblx0XHRcdFx0XHR7IGZpZWxkbmFtZTogJ3JvbGUnLCBsYWJlbDogX18oJ1Byb2plY3QgUm9sZScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnUHJvamVjdCBNYW5hZ2VyXFxuQXJjaGl0ZWN0XFxuU3RydWN0dXJhbCBFbmdpbmVlclxcbk1FUCBDb29yZGluYXRvclxcblNhZmV0eSBPZmZpY2VyXFxuUUMgSW5zcGVjdG9yJywgZGVmYXVsdDogJ1Byb2plY3QgTWFuYWdlcicgfVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRwcmltYXJ5X2FjdGlvbl9sYWJlbDogX18oJ0FkZCBNZW1iZXInKSxcblx0XHRcdFx0cHJpbWFyeV9hY3Rpb24odmFsdWVzKSB7XG5cdFx0XHRcdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0XHRcdFx0bWV0aG9kOiAnZnJhcHBlLmNsaWVudC5pbnNlcnQnLFxuXHRcdFx0XHRcdFx0YXJnczoge1xuXHRcdFx0XHRcdFx0XHRkb2M6IHtcblx0XHRcdFx0XHRcdFx0XHRkb2N0eXBlOiAnUHJvamVjdCBVc2VyJyxcblx0XHRcdFx0XHRcdFx0XHRwYXJlbnQ6IHNlbGYuY3VycmVudFByb2plY3QsXG5cdFx0XHRcdFx0XHRcdFx0cGFyZW50ZmllbGQ6ICd1c2VycycsXG5cdFx0XHRcdFx0XHRcdFx0cGFyZW50dHlwZTogJ1Byb2plY3QnLFxuXHRcdFx0XHRcdFx0XHRcdHVzZXI6IHZhbHVlcy5lbWFpbFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRkLmhpZGUoKTtcblx0XHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1VzZXIgaW52aXRlZCB0byBwcm9qZWN0LicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0RGF0YShzZWxmLmN1cnJlbnRQcm9qZWN0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRkLnNob3coKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXb3JrIHBhY2thZ2UgcXVpY2stY3JlYXRlXG5cdFx0Y29uc3QgZCA9IG5ldyBmcmFwcGUudWkuRGlhbG9nKHtcblx0XHRcdHRpdGxlOiBfXygnQ3JlYXRlIHswfScsIFt0eXBlXSksXG5cdFx0XHRmaWVsZHM6IFtcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdzdWJqZWN0JywgbGFiZWw6IF9fKCdTdWJqZWN0IC8gVGl0bGUnKSwgZmllbGR0eXBlOiAnRGF0YScsIHJlcWQ6IDEgfSxcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdwcmlvcml0eScsIGxhYmVsOiBfXygnUHJpb3JpdHknKSwgZmllbGR0eXBlOiAnU2VsZWN0Jywgb3B0aW9uczogJ0xvd1xcbk5vcm1hbFxcbkhpZ2hcXG5VcmdlbnQnLCBkZWZhdWx0OiAnTm9ybWFsJyB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2R1ZV9kYXRlJywgbGFiZWw6IF9fKCdEdWUgRGF0ZScpLCBmaWVsZHR5cGU6ICdEYXRlJyB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2Rlc2NyaXB0aW9uJywgbGFiZWw6IF9fKCdEZXNjcmlwdGlvbicpLCBmaWVsZHR5cGU6ICdTbWFsbCBUZXh0JyB9XG5cdFx0XHRdLFxuXHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdDcmVhdGUnKSxcblx0XHRcdHByaW1hcnlfYWN0aW9uKHZhbHVlcykge1xuXHRcdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8ucXVpY2tfY3JlYXRlX3dvcmtfcGFja2FnZScsXG5cdFx0XHRcdFx0YXJnczoge1xuXHRcdFx0XHRcdFx0cHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCxcblx0XHRcdFx0XHRcdHdwX3R5cGU6IHR5cGUsXG5cdFx0XHRcdFx0XHRzdWJqZWN0OiB2YWx1ZXMuc3ViamVjdCxcblx0XHRcdFx0XHRcdHByaW9yaXR5OiB2YWx1ZXMucHJpb3JpdHksXG5cdFx0XHRcdFx0XHRkdWVfZGF0ZTogdmFsdWVzLmR1ZV9kYXRlLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHZhbHVlcy5kZXNjcmlwdGlvblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0ZC5oaWRlKCk7XG5cdFx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnV29yayBwYWNrYWdlIGNyZWF0ZWQuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnd29yay1wYWNrYWdlcycpIHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKCk7XG5cdFx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2JvYXJkcycpIHNlbGYucmVuZGVyS2FuYmFuQm9hcmQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0ZC5zaG93KCk7XG5cdH1cblxuXHR1cGRhdGVQcm9qZWN0SGVhbHRoU3RhdHVzKG5ld0hlYWx0aCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQodGhpcy5jdXJyZW50UHJvamVjdCwgeyBoZWFsdGhfc3RhdHVzOiBuZXdIZWFsdGggfSkudGhlbigoKSA9PiB7XG5cdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdQcm9qZWN0IGhlYWx0aCBzZXQgdG8gezB9JywgW25ld0hlYWx0aF0pLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcblx0XHRcdGlmIChzZWxmLnBhZ2UgJiYgc2VsZi5wYWdlLnNldF9pbmRpY2F0b3IpIHtcblx0XHRcdFx0Y29uc3QgY29sb3IgPSBuZXdIZWFsdGggPT09ICdPbiBUcmFjaycgPyAnZ3JlZW4nIDogKG5ld0hlYWx0aCA9PT0gJ0F0IFJpc2snID8gJ29yYW5nZScgOiAncmVkJyk7XG5cdFx0XHRcdHNlbGYucGFnZS5zZXRfaW5kaWNhdG9yKG5ld0hlYWx0aCwgY29sb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0dXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQocHJvamVjdE5hbWUsIHBhdGNoRGljdCkge1xuXHRcdHJldHVybiBmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby51cGRhdGVfcHJvamVjdF9zZXR0aW5ncycsXG5cdFx0XHRhcmdzOiB7XG5cdFx0XHRcdHByb2plY3Q6IHByb2plY3ROYW1lLFxuXHRcdFx0XHRzZXR0aW5nc19qc29uOiBKU09OLnN0cmluZ2lmeShwYXRjaERpY3QpXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRlZGl0U3RhdHVzTmFycmF0aXZlUHJvbXB0KCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5wcm9tcHQoXG5cdFx0XHR7XG5cdFx0XHRcdGZpZWxkbmFtZTogJ25hcnJhdGl2ZScsXG5cdFx0XHRcdGxhYmVsOiBfXygnU3RhdHVzIERlc2NyaXB0aW9uIC8gQ29tbWVudGFyeScpLFxuXHRcdFx0XHRmaWVsZHR5cGU6ICdTbWFsbCBUZXh0Jyxcblx0XHRcdFx0ZGVmYXVsdDogJCgnI292ZXJ2aWV3LXN0YXR1cy1uYXJyYXRpdmUnKS50ZXh0KClcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiAodmFsdWVzKSB7XG5cdFx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQoc2VsZi5jdXJyZW50UHJvamVjdCwgeyBzdGF0dXNfbmFycmF0aXZlOiB2YWx1ZXMubmFycmF0aXZlIH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdCQoJyNvdmVydmlldy1zdGF0dXMtbmFycmF0aXZlJykudGV4dCh2YWx1ZXMubmFycmF0aXZlKTtcblx0XHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdTdGF0dXMgbm90ZSB1cGRhdGVkLicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdF9fKCdFZGl0IEhlYWx0aCBTdGF0dXMgRGVzY3JpcHRpb24nKSxcblx0XHRcdF9fKCdTYXZlJylcblx0XHQpO1xuXHR9XG59XG5cbndpbmRvdy5Qcm9qZWN0U3R1ZGlvQXBwID0gUHJvamVjdFN0dWRpb0FwcDtcbmV4cG9ydCBkZWZhdWx0IFByb2plY3RTdHVkaW9BcHA7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUdBLElBQU0sUUFBUTtBQUFBLEVBQ2IsVUFBVTtBQUFBLEVBQ1YsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFB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
