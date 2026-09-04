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
					<span class="d-inline-flex align-items-center gap-1"><span class="text-primary mr-1">${ICONS.folder}</span> ${escapeHtml(s.project_name)}</span>
					<span class="status-active-pill"><span class="status-dot-green"></span> ${escapeHtml(s.status)}</span>
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
						<strong>${escapeHtml(m.title)}</strong>
						<span class="badge badge-info">${escapeHtml(m.type)}</span>
					</div>
					<small class="text-muted d-inline-flex align-items-center gap-1 mt-1">${ICONS.calendar} <span>${escapeHtml(m.date)} | ${escapeHtml(m.host || "Coordinator")}</span></small>
				</div>
			`);
    });
    if ((data.meetings || []).length === 0) {
      $meetList.append('<div class="text-muted p-2 text-center"><small>No upcoming meetings</small></div>');
    }
    const $memGrid = $("#members-avatars-grid");
    $memGrid.empty();
    (data.members || []).forEach((m) => {
      const memberName = String(m.full_name || m.user || "Member").trim();
      const initials = memberName ? memberName.substring(0, 2).toUpperCase() : "MB";
      $memGrid.append(`
				<div class="member-chip p-1" style="display: inline-flex; align-items: center; gap: 6px; margin: 4px;">
					<span class="avatar-circle" style="width:28px;height:28px;border-radius:50%;background:#4338ca;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;">
						${escapeHtml(initials)}
					</span>
					<small class="font-weight-medium">${escapeHtml(memberName)}</small>
				</div>
			`);
    });
    const $newsCont = $("#news-feed-container");
    $newsCont.empty();
    (data.news || []).forEach((n) => {
      $newsCont.append(`
				<div class="news-bulletin p-2 mb-2" style="background: #f8fafc; border-left: 3px solid #6366f1; border-radius: 4px;">
					<h5 class="m-0 font-weight-bold">${escapeHtml(n.title)}</h5>
					<small class="text-muted">${escapeHtml(n.author)} on ${escapeHtml(n.date)}</small>
					<p class="m-0 mt-1 text-secondary" style="font-size: 12px;">${escapeHtml(n.content)}</p>
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
      const safeTitle = escapeHtml(m.title || "");
      const safeDueDate = escapeHtml(m.due_date || "");
      const safeStatus = escapeHtml(m.status || "");
      const $pt = $(`
				<div class="milestone-marker-point" data-id="${escapeHtml(m.id)}" title="${safeTitle} (${safeDueDate || "TBD"})">
					<span class="milestone-date">${safeDueDate.length >= 5 ? safeDueDate.substring(5) : safeDueDate}</span>
					<div class="milestone-diamond ${completedCls}"></div>
					<span class="milestone-label">${safeTitle}</span>
				</div>
			`);
      $pt.on("click", function() {
        frappe.msgprint({
          title: __("Milestone Delivery Details"),
          message: `<h4>${safeTitle}</h4><p><strong>Target Due Date:</strong> ${safeDueDate || "None"}</p><p><strong>Status:</strong> ${safeStatus}</p>`,
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
      const allowedTypes = ["task", "milestone", "phase", "issue", "clash"];
      items.forEach((it) => {
        const rawType = String(it.type || "task").toLowerCase();
        const safeType = allowedTypes.includes(rawType) ? rawType : "task";
        const pillCls = `wp-pill-${safeType}`;
        const indent = it.parent_task ? "&nbsp;&nbsp;&nbsp;&nbsp;\u21B3 " : "";
        const $tr = $(`
					<tr class="wp-row-item" data-id="${escapeHtml(it.id)}" style="cursor: pointer;">
						<td><small class="text-muted">#${escapeHtml(String(it.id).replace("TASK-", ""))}</small></td>
						<td>${indent}<strong>${escapeHtml(it.subject)}</strong></td>
						<td><span class="wp-pill ${pillCls}">${escapeHtml(it.type)}</span></td>
						<td><span class="status-dot"></span> ${escapeHtml(it.status)}</td>
						<td><small>${escapeHtml(it.assignee_name || "Unassigned")}</small></td>
						<td><small>${escapeHtml(it.priority)}</small></td>
						<td><small class="text-muted">${escapeHtml(it.exp_end_date || "--")}</small></td>
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
      title: `[${escapeHtml(wp.type)}] #${escapeHtml(wp.id)} - ${escapeHtml(wp.subject)}`,
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
      linkHtml = `<div class="alert alert-warning d-flex align-items-center gap-2"><span class="mr-1">${ICONS.cube}</span> <div>Linked to BCF Clash Topic: <strong>${escapeHtml(wp.bcf_topic)}</strong></div></div>`;
    } else if (wp.rfi_link) {
      linkHtml = `<div class="alert alert-info d-flex align-items-center gap-2"><span class="mr-1">${ICONS.info}</span> <div>Linked to Technical RFI: <strong>${escapeHtml(wp.rfi_link)}</strong></div></div>`;
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
        const safeColId = escapeHtml(col.id);
        const safeColTitle = escapeHtml(col.title);
        const $col = $(`
					<div class="kanban-column" data-col-id="${safeColId}">
						<div class="column-header">
							<span>${safeColTitle}</span>
							<span class="badge col-card-count">${col.cards ? col.cards.length : 0}</span>
						</div>
						<div class="column-cards-list" data-col-id="${safeColId}">
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
            const safeTaskId = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(taskId) : String(taskId).replace(/["\\]/g, "\\$&");
            const $draggedCard = $(`[data-task="${safeTaskId}"]`);
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
        (col.cards || []).forEach((card) => {
          const allowedTypes = ["task", "milestone", "phase", "issue", "clash"];
          const rawType = String(card.type || "task").toLowerCase();
          const safeType = allowedTypes.includes(rawType) ? rawType : "task";
          const pillCls = `wp-pill-${safeType}`;
          const allowedPriorities = ["low", "normal", "high", "urgent"];
          const rawPriority = String(card.priority || "normal").toLowerCase();
          const safePriority = allowedPriorities.includes(rawPriority) ? rawPriority : "normal";
          const priorityCls = `priority-${safePriority}`;
          const assigneeName = String(card.assignee_name || "").trim();
          const assigneeInitials = assigneeName ? assigneeName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "";
          const assigneeHtml = assigneeName ? `
						<span class="card-assignee-pill" title="${escapeHtml(assigneeName)}">
							<span class="assignee-avatar">${escapeHtml(assigneeInitials)}</span>
							<span class="assignee-text">${escapeHtml(assigneeName)}</span>
						</span>
					` : "";
          const $card = $(`
						<div class="kanban-card" draggable="true" data-task="${escapeHtml(card.id)}">
							<div class="kanban-card-head">
								<span class="wp-pill ${pillCls}">${escapeHtml(card.type)}</span>
								<span class="card-priority ${priorityCls}">${escapeHtml(card.priority)}</span>
							</div>
							<div class="kanban-card-title">${escapeHtml(card.subject)}</div>
							<div class="kanban-card-foot">
								<span class="card-date-badge">${ICONS.calendar} <span>${escapeHtml(card.exp_end_date || "--")}</span></span>
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
      const allowedTypes = ["task", "milestone", "phase", "issue", "clash"];
      items.forEach((it) => {
        const rawType = String(it.type || "task").toLowerCase();
        const safeType = allowedTypes.includes(rawType) ? rawType : "task";
        const pillCls = `wp-pill-${safeType}`;
        const progress = Math.min(100, Math.max(0, it.progress || (it.status === "Completed" ? 100 : 25)));
        html += `
					<tr class="wp-gantt-row" data-id="${escapeHtml(it.id)}" style="cursor: pointer;">
						<td><span class="wp-pill ${pillCls}">${escapeHtml(it.type)}</span> <strong>${escapeHtml(it.subject)}</strong></td>
						<td><small>${escapeHtml(it.exp_start_date || "--")}</small></td>
						<td><small>${escapeHtml(it.exp_end_date || "--")}</small></td>
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
          const safeName = escapeHtml(m.name);
          const safeDiscipline = escapeHtml(m.discipline || "IFC");
          const safeModelName = escapeHtml(m.model_name || m.name);
          $tree.append(`
						<div class="model-tree-row p-2 flex-between" style="border-bottom: 1px solid #f1f5f9; border-radius: 6px;">
							<label style="font-weight: normal; font-size: 12.5px; cursor: pointer; margin: 0; display: flex; align-items: center; gap: 6px;">
								<input type="checkbox" class="model-tree-cb" ${isChecked ? "checked" : ""} data-model="${safeName}">
								<span class="badge" style="background:#e0e7ff; color:#4338ca; font-size:10px; font-weight:600;">${safeDiscipline}</span>
								<span>${safeModelName}</span>
							</label>
							<a href="javascript:void(0)" class="action-focus-model text-muted ml-1" data-model="${safeName}" title="View this model">${ICONS.eye}</a>
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
        const safeFolderName = escapeHtml(f.folder_name);
        const $box = $(`
					<div class="doc-folder-card">
						<div class="folder-header">
							<div class="folder-icon-pill" style="background: ${cfg.bg}; color: ${cfg.color};">
								${cfg.icon}
							</div>
							<div class="folder-title-box">
								<span class="folder-name">${safeFolderName}</span>
								<span class="folder-count-badge">${f.files ? f.files.length : 0} items</span>
							</div>
						</div>
						<div class="folder-files-list">
							<!-- Files -->
						</div>
					</div>
				`);
        const $fList = $box.find(".folder-files-list");
        if (!f.files || f.files.length === 0) {
          $fList.append('<div class="text-muted p-3 text-center" style="font-size:12px;">No files in folder</div>');
        } else {
          f.files.forEach((file) => {
            const safeRoute = escapeHtml(file.route_target || "");
            const safeUrl = escapeHtml(file.file_url || "");
            const safeModelId = escapeHtml(file.model_id || file.id || "");
            const safeFileName = escapeHtml(file.file_name || "");
            const safeBadge = escapeHtml(file.badge || "File");
            $fList.append(`
							<a href="javascript:void(0)" class="file-item-link" data-route="${safeRoute}" data-url="${safeUrl}" data-model-id="${safeModelId}">
								<div class="file-item-left">
									<span class="text-muted mr-1">${ICONS.file}</span>
									<span class="file-name-text">${safeFileName}</span>
								</div>
								<span class="folder-count-badge">${safeBadge}</span>
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3Byb2plY3Rfc3R1ZGlvX2FwcC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gUHJvamVjdCBTdHVkaW8gRnJvbnRlbmQgQXBwbGljYXRpb24gKE9wZW5Qcm9qZWN0IEJJTSBQYXJpdHkpXHJcbi8vIE1hbmFnZXMgQWxsIFByb2plY3RzIEh1YiwgUHJvamVjdCBIb21lLCBXb3JrIFBhY2thZ2VzLCBCb2FyZHMsIEJDRiwgRG9jdW1lbnRzLCBTZXR0aW5nc1xyXG5cclxuY29uc3QgSUNPTlMgPSB7XHJcblx0Y2FsZW5kYXI6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCI0XCIgcng9XCIyXCIvPjxsaW5lIHgxPVwiMTZcIiB5MT1cIjJcIiB4Mj1cIjE2XCIgeTI9XCI2XCIvPjxsaW5lIHgxPVwiOFwiIHkxPVwiMlwiIHgyPVwiOFwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjEwXCIgeDI9XCIyMVwiIHkyPVwiMTBcIi8+PC9zdmc+YCxcclxuXHR1c2VyOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxM1wiIGhlaWdodD1cIjEzXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyXCIvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiN1wiIHI9XCI0XCIvPjwvc3ZnPmAsXHJcblx0dXNlcnM6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINmE0IDQgMCAwIDAtNCA0djJcIi8+PGNpcmNsZSBjeD1cIjlcIiBjeT1cIjdcIiByPVwiNFwiLz48cGF0aCBkPVwiTTIyIDIxdi0yYTQgNCAwIDAgMC0zLTMuODdcIi8+PHBhdGggZD1cIk0xNiAzLjEzYTQgNCAwIDAgMSAwIDcuNzVcIi8+PC9zdmc+YCxcclxuXHRleWU6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTIgMTJzMy03IDEwLTcgMTAgNyAxMCA3LTMgNy0xMCA3LTEwLTctMTAtN1pcIi8+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIvPjwvc3ZnPmAsXHJcblx0Y2xvY2s6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCIvPjxwb2x5bGluZSBwb2ludHM9XCIxMiA2IDEyIDEyIDE2IDE0XCIvPjwvc3ZnPmAsXHJcblx0ZmlsZTogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNzVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNMTQuNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWNy41TDE0LjUgMnpcIi8+PHBvbHlsaW5lIHBvaW50cz1cIjE0IDIgMTQgOCAyMCA4XCIvPjwvc3ZnPmAsXHJcblx0Zm9sZGVyOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk00IDIwaDE2YTIgMiAwIDAgMCAyLTJWOGEyIDIgMCAwIDAtMi0yaC03LjkzYTIgMiAwIDAgMS0xLjY2LS45bC0uODItMS4yQTIgMiAwIDAgMCA3LjkzIDNINGEyIDIgMCAwIDAtMiAydjEzYzAgMS4xLjkgMiAyIDJaXCIvPjwvc3ZnPmAsXHJcblx0Y2hlY2s6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cG9seWxpbmUgcG9pbnRzPVwiMjAgNiA5IDE3IDQgMTJcIi8+PC9zdmc+YCxcclxuXHRsaXN0OiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGxpbmUgeDE9XCI4XCIgeTE9XCI2XCIgeDI9XCIyMVwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjhcIiB5MT1cIjEyXCIgeDI9XCIyMVwiIHkyPVwiMTJcIi8+PGxpbmUgeDE9XCI4XCIgeTE9XCIxOFwiIHgyPVwiMjFcIiB5Mj1cIjE4XCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiNlwiIHgyPVwiMy4wMVwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjEyXCIgeDI9XCIzLjAxXCIgeTI9XCIxMlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjE4XCIgeDI9XCIzLjAxXCIgeTI9XCIxOFwiLz48L3N2Zz5gLFxyXG5cdGN1YmU6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE1XCIgaGVpZ2h0PVwiMTVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTIxIDE2VjhhMiAyIDAgMCAwLTEtMS43M2wtNy00YTIgMiAwIDAgMC0yIDBsLTcgNEEyIDIgMCAwIDAgMyA4djhhMiAyIDAgMCAwIDEgMS43M2w3IDRhMiAyIDAgMCAwIDIgMGw3LTRBMiAyIDAgMCAwIDIxIDE2elwiLz48cG9seWxpbmUgcG9pbnRzPVwiMy4yOSA3IDEyIDEyIDIwLjcxIDdcIi8+PGxpbmUgeDE9XCIxMlwiIHkxPVwiMjJcIiB4Mj1cIjEyXCIgeTI9XCIxMlwiLz48L3N2Zz5gLFxyXG5cdGluZm86IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCIvPjxsaW5lIHgxPVwiMTJcIiB5MT1cIjE2XCIgeDI9XCIxMlwiIHkyPVwiMTJcIi8+PGxpbmUgeDE9XCIxMlwiIHkxPVwiOFwiIHgyPVwiMTIuMDFcIiB5Mj1cIjhcIi8+PC9zdmc+YCxcclxuXHRhcnJvd1JpZ2h0OiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxM1wiIGhlaWdodD1cIjEzXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGxpbmUgeDE9XCI1XCIgeTE9XCIxMlwiIHgyPVwiMTlcIiB5Mj1cIjEyXCIvPjxwb2x5bGluZSBwb2ludHM9XCIxMiA1IDE5IDEyIDEyIDE5XCIvPjwvc3ZnPmAsXHJcblx0dGFibGU6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE1XCIgaGVpZ2h0PVwiMTVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCIzXCIgcng9XCIyXCIvPjxwYXRoIGQ9XCJNMyA5aDE4XCIvPjxwYXRoIGQ9XCJNMyAxNWgxOFwiLz48cGF0aCBkPVwiTTkgM3YxOFwiLz48cGF0aCBkPVwiTTE1IDN2MThcIi8+PC9zdmc+YCxcclxuXHRjYW1lcmE6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE1XCIgaGVpZ2h0PVwiMTVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTE0LjUgNGgtNUw3IDdINGEyIDIgMCAwIDAtMiAydjlhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yVjlhMiAyIDAgMCAwLTItMmgtM2wtMi41LTN6XCIvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTNcIiByPVwiM1wiLz48L3N2Zz5gLFxyXG5cdHN0YXI6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBmaWxsPVwiI2Y1OWUwYlwiIHN0cm9rZT1cIiNmNTllMGJcIiBzdHJva2Utd2lkdGg9XCIxXCI+PHBvbHlnb24gcG9pbnRzPVwiMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMlwiLz48L3N2Zz5gLFxyXG5cdHN0YXJFbXB0eTogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTNcIiBoZWlnaHQ9XCIxM1wiIHN0cm9rZT1cIiM5Y2EzYWZcIiBzdHJva2Utd2lkdGg9XCIxLjVcIiBmaWxsPVwibm9uZVwiPjxwb2x5Z29uIHBvaW50cz1cIjEyIDIgMTUuMDkgOC4yNiAyMiA5LjI3IDE3IDE0LjE0IDE4LjE4IDIxLjAyIDEyIDE3Ljc3IDUuODIgMjEuMDIgNyAxNC4xNCAyIDkuMjcgOC45MSA4LjI2IDEyIDJcIi8+PC9zdmc+YFxyXG59O1xyXG5cclxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHIpIHtcclxuXHRpZiAoc3RyID09IG51bGwpIHJldHVybiAnJztcclxuXHRpZiAod2luZG93LmZyYXBwZSAmJiBmcmFwcGUudXRpbHMgJiYgZnJhcHBlLnV0aWxzLmVzY2FwZV9odG1sKSB7XHJcblx0XHRyZXR1cm4gZnJhcHBlLnV0aWxzLmVzY2FwZV9odG1sKFN0cmluZyhzdHIpKTtcclxuXHR9XHJcblx0cmV0dXJuIFN0cmluZyhzdHIpXHJcblx0XHQucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG5cdFx0LnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG5cdFx0LnJlcGxhY2UoLz4vZywgJyZndDsnKVxyXG5cdFx0LnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxyXG5cdFx0LnJlcGxhY2UoLycvZywgJyYjMzk7Jyk7XHJcbn1cclxuXHJcbmNsYXNzIFByb2plY3RTdHVkaW9BcHAge1xyXG5cdGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xyXG5cdFx0dGhpcy5vcHRzID0gb3B0cztcclxuXHRcdHRoaXMucGFnZSA9IG9wdHMucGFnZSB8fCAod2luZG93LmN1cl9wYWdlICYmIHdpbmRvdy5jdXJfcGFnZS5wYWdlKSB8fCAoZnJhcHBlLmNvbnRhaW5lciAmJiBmcmFwcGUuY29udGFpbmVyLnBhZ2UgJiYgZnJhcHBlLmNvbnRhaW5lci5wYWdlLnBhZ2UpO1xyXG5cdFx0dGhpcy5jdXJyZW50UHJvamVjdCA9IG51bGw7XHJcblx0XHR0aGlzLmFsbFByb2plY3RzID0gW107XHJcblx0XHR0aGlzLmN1cnJlbnRUYWIgPSAnaG9tZSc7XHJcblx0XHR0aGlzLmFjdGl2ZUZpbHRlcktleSA9ICdhbGxfb3Blbic7XHJcblx0XHR0aGlzLmFjdGl2ZVR5cGVGaWx0ZXIgPSAnYWxsJztcclxuXHRcdHRoaXMuYm9hcmRHcm91cEJ5ID0gJ3N0YXR1cyc7XHJcblx0XHR0aGlzLmlzU2lkZWJhckNvbGxhcHNlZCA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMuaW5pdCgpO1xyXG5cdH1cclxuXHJcblx0aW5pdCgpIHtcclxuXHRcdHRoaXMuc2V0dXBOYXRpdmVQYWdlSGVhZGVyKCk7XHJcblx0XHR0aGlzLmJpbmRFdmVudHMoKTtcclxuXHRcdHRoaXMubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHQvLyBDaGVjayBVUkwgcGFyYW1ldGVycyBmb3IgcHJvamVjdFxyXG5cdFx0XHRjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG5cdFx0XHRjb25zdCBwcm9qUGFyYW0gPSB1cmxQYXJhbXMuZ2V0KCdwcm9qZWN0Jyk7XHJcblx0XHRcdGNvbnN0IHRhYlBhcmFtID0gdXJsUGFyYW1zLmdldCgndGFiJyk7XHJcblxyXG5cdFx0XHRpZiAocHJvalBhcmFtICYmIHByb2pQYXJhbSAhPT0gJ2FsbCcpIHtcclxuXHRcdFx0XHR0aGlzLnNlbGVjdFByb2plY3QocHJvalBhcmFtLCB0YWJQYXJhbSB8fCAnaG9tZScpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuYWxsUHJvamVjdHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdHRoaXMuc2VsZWN0UHJvamVjdCh0aGlzLmFsbFByb2plY3RzWzBdLm5hbWUsIHRhYlBhcmFtIHx8ICdob21lJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHNldHVwTmF0aXZlUGFnZUhlYWRlcigpIHtcclxuXHRcdGlmICghdGhpcy5wYWdlKSByZXR1cm47XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHJcblx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlKF9fKCdEYXNoYm9hcmQnKSk7XHJcblx0XHRpZiAodGhpcy5jdXJyZW50UHJvamVjdCkge1xyXG5cdFx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlX3N1Yih0aGlzLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5wYWdlLmNsZWFyX2FjdGlvbl9iYXIpIHRoaXMucGFnZS5jbGVhcl9hY3Rpb25fYmFyKCk7XHJcblx0XHRpZiAodGhpcy5wYWdlLmNsZWFyX3ByaW1hcnlfYWN0aW9uKSB0aGlzLnBhZ2UuY2xlYXJfcHJpbWFyeV9hY3Rpb24oKTtcclxuXHJcblx0XHQvLyBQcmltYXJ5IEFjdGlvbjogKyBDcmVhdGVcclxuXHRcdHRoaXMucGFnZS5zZXRfcHJpbWFyeV9hY3Rpb24oXHJcblx0XHRcdF9fKCdDcmVhdGUnKSxcclxuXHRcdFx0KCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnVGFzaycpLFxyXG5cdFx0XHQnYWRkJ1xyXG5cdFx0KTtcclxuXHJcblx0XHQvLyBBZGQgc3RhbmRhcmQgd29yayBwYWNrYWdlIHR5cGVzIHVuZGVyIENyZWF0ZSBncm91cFxyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ1N0YW5kYXJkIFRhc2snKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnVGFzaycpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ01pbGVzdG9uZScpLCAoKSA9PiBzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdNaWxlc3RvbmUnKSwgX18oJ0NyZWF0ZScpKTtcclxuXHRcdHRoaXMucGFnZS5hZGRfaW5uZXJfYnV0dG9uKF9fKCdQaGFzZScpLCAoKSA9PiBzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdQaGFzZScpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ0lzc3VlIC8gUHVuY2hsaXN0JyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ0lzc3VlJyksIF9fKCdDcmVhdGUnKSk7XHJcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnUmVtYXJrJyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ1JlbWFyaycpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ1JlcXVlc3QgLyBSRkknKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnUmVxdWVzdCcpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ0NsYXNoIFRvcGljJyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ0NsYXNoJyksIF9fKCdDcmVhdGUnKSk7XHJcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnTmV3IFByb2plY3QnKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgncHJvamVjdCcpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ0ludml0ZSBNZW1iZXInKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgndXNlcicpLCBfXygnQ3JlYXRlJykpO1xyXG5cclxuXHRcdC8vIFRvb2xiYXIgdXRpbGl0eSBidXR0b25zIChNYXRjaGluZyBGcmFwcGUgQ1JNOiBSZWZyZXNoLCBFZGl0LCBEZXNrKVxyXG5cdFx0dGhpcy5wYWdlLmFkZF9idXR0b24oX18oJ1JlZnJlc2gnKSwgKCkgPT4ge1xyXG5cdFx0XHRpZiAoc2VsZi5jdXJyZW50UHJvamVjdCkge1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCB7IGljb246ICdyZWZyZXNoJyB9KTtcclxuXHJcblx0XHR0aGlzLnBhZ2UuYWRkX2J1dHRvbihfXygnRWRpdCcpLCAoKSA9PiB7XHJcblx0XHRcdGlmIChzZWxmLmN1cnJlbnRQcm9qZWN0KSB7XHJcblx0XHRcdFx0ZnJhcHBlLnNldF9yb3V0ZSgnRm9ybScsICdQcm9qZWN0Jywgc2VsZi5jdXJyZW50UHJvamVjdCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3NldHRpbmdzJyk7XHJcblx0XHRcdH1cclxuXHRcdH0sIHsgaWNvbjogJ2VkaXQnIH0pO1xyXG5cclxuXHRcdHRoaXMucGFnZS5hZGRfYnV0dG9uKF9fKCdEZXNrJyksICgpID0+IHtcclxuXHRcdFx0ZnJhcHBlLnNldF9yb3V0ZSgnZGVzaycpO1xyXG5cdFx0fSwgeyBpY29uOiAnZ3JpZCcgfSk7XHJcblx0fVxyXG5cclxuXHRiaW5kRXZlbnRzKCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gU2lkZWJhciBjb2xsYXBzZSB0b2dnbGVcclxuXHRcdCQoJyNidG4tdG9nZ2xlLXNpZGViYXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkID0gIXNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkO1xyXG5cdFx0XHQkKCcjc3R1ZGlvLXNpZGViYXInKS50b2dnbGVDbGFzcygnY29sbGFwc2VkJywgc2VsZi5pc1NpZGViYXJDb2xsYXBzZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gTmF2aWdhdGlvbiBsaW5rc1xyXG5cdFx0JCgnLnN0dWRpby1uYXYtbGlzdCcpLm9uKCdjbGljaycsICcubmF2LWl0ZW0nLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IHRhYiA9ICQodGhpcykuZGF0YSgndGFiJyk7XHJcblx0XHRcdHNlbGYuc3dpdGNoVGFiKHRhYik7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBGaWx0ZXIgcGlsbCBidXR0b25zIChGcmFwcGUgQ1JNIHN0eWxlKVxyXG5cdFx0JCgnI2ZpbHRlci1wcm9qZWN0LWJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdCQoJyNwcm9qZWN0U3dpdGNoZXJCdG4nKS5kcm9wZG93bigndG9nZ2xlJyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjZmlsdGVyLWRhdGUtYnRuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdGaWx0ZXI6IExhc3QgMzAgRGF5cyAoQWN0aXZlKScpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFJlZnJlc2ggYnV0dG9uXHJcblx0XHQkKCcjYnRuLXN0dWRpby1yZWZyZXNoJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAoc2VsZi5jdXJyZW50UHJvamVjdCkge1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBFZGl0IGJ1dHRvblxyXG5cdFx0JCgnI2J0bi1zdHVkaW8tZWRpdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYgKHNlbGYuY3VycmVudFByb2plY3QpIHtcclxuXHRcdFx0XHRmcmFwcGUuc2V0X3JvdXRlKCdGb3JtJywgJ1Byb2plY3QnLCBzZWxmLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYignc2V0dGluZ3MnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gUXVpY2sgY3JlYXRlIGRyb3Bkb3duIGFjdGlvbnNcclxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuYWN0aW9uLXF1aWNrLWFkZCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y29uc3QgdHlwZSA9ICQodGhpcykuZGF0YSgndHlwZScpO1xyXG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKHR5cGUpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQWRkIHByb2plY3QgYnV0dG9uXHJcblx0XHQkKCcjYnRuLWFkZC1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdwcm9qZWN0Jyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBTdWJwcm9qZWN0IGFkZCBidXR0b25cclxuXHRcdCQoJyNidG4tYWRkLXN1YnByb2plY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ3N1YnByb2plY3QnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFNlYXJjaCBpbiBhbGwgcHJvamVjdHMgdGFibGVcclxuXHRcdCQoJyNwcm9qZWN0cy1maWx0ZXItaW5wdXQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IHEgPSAkKHRoaXMpLnZhbCgpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdCQoJyNwcm9qZWN0cy10YWJsZS1ib2R5IHRyJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y29uc3QgdGV4dCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdFx0JCh0aGlzKS50b2dnbGUodGV4dC5pbmRleE9mKHEpID4gLTEpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEdsb2JhbCBzZWFyY2hcclxuXHRcdCQoJyNzdHVkaW8tZ2xvYmFsLXNlYXJjaCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG5cdFx0XHRcdGNvbnN0IHF1ZXJ5ID0gJCh0aGlzKS52YWwoKTtcclxuXHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnd29yay1wYWNrYWdlcycpIHtcclxuXHRcdFx0XHRcdHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKHF1ZXJ5KTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2FsbC1wcm9qZWN0cycpIHtcclxuXHRcdFx0XHRcdCQoJyNwcm9qZWN0cy1maWx0ZXItaW5wdXQnKS52YWwocXVlcnkpLnRyaWdnZXIoJ2tleXVwJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCd3b3JrLXBhY2thZ2VzJyk7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKHF1ZXJ5KSwgMTAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEhlYWx0aCBzdGF0dXMgc2VsZWN0IGNoYW5nZVxyXG5cdFx0JCgnI3NlbGVjdC1wcm9qZWN0LWhlYWx0aCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IHZhbCA9ICQodGhpcykudmFsKCk7XHJcblx0XHRcdHNlbGYudXBkYXRlUHJvamVjdEhlYWx0aFN0YXR1cyh2YWwpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gRWRpdCBzdGF0dXMgbmFycmF0aXZlIGJ1dHRvblxyXG5cdFx0JCgnI2J0bi1lZGl0LXN0YXR1cy1uYXJyYXRpdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYuZWRpdFN0YXR1c05hcnJhdGl2ZVByb21wdCgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQ29sbGFwc2UgLyBleHBhbmQgc2lkZWJhclxyXG5cdFx0JCgnI2J0bi10b2dnbGUtc2lkZWJhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnI3N0dWRpby1zaWRlYmFyJykudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gS2V5Ym9hcmQgc2hvcnRjdXQgXHUyMzE4SyAvIEN0cmwrS1xyXG5cdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRpZiAoKGUubWV0YUtleSB8fCBlLmN0cmxLZXkpICYmIChlLmtleSA9PT0gJ2snIHx8IGUua2V5ID09PSAnSycpKSB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdCQoJyNzdHVkaW8tZ2xvYmFsLXNlYXJjaCcpLmZvY3VzKCkuc2VsZWN0KCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFdvcmsgcGFja2FnZXMgZmlsdGVyIGNsaWNrc1xyXG5cdFx0JCgnLndwLXNpZGViYXItZmlsdGVyJykub24oJ2NsaWNrJywgJ2xpW2RhdGEtZmlsdGVyXScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnLndwLXNpZGViYXItZmlsdGVyIGxpW2RhdGEtZmlsdGVyXScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdHNlbGYuYWN0aXZlRmlsdGVyS2V5ID0gJCh0aGlzKS5kYXRhKCdmaWx0ZXInKTtcclxuXHRcdFx0JCgnI3dwLWFjdGl2ZS1maWx0ZXItdGl0bGUnKS50ZXh0KCQodGhpcykudGV4dCgpKTtcclxuXHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJy53cC1zaWRlYmFyLWZpbHRlcicpLm9uKCdjbGljaycsICdsaVtkYXRhLXR5cGVdJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQkKCcud3Atc2lkZWJhci1maWx0ZXIgbGlbZGF0YS10eXBlXScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdHNlbGYuYWN0aXZlVHlwZUZpbHRlciA9ICQodGhpcykuZGF0YSgndHlwZScpO1xyXG5cdFx0XHRzZWxmLnJlbmRlcldvcmtQYWNrYWdlcygpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gV29yayBwYWNrYWdlcyB0ZXh0IHNlYXJjaCBmaWx0ZXJcclxuXHRcdCQoJyN3cC1maWx0ZXItc2VhcmNoJykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjb25zdCBxID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHQkKCcjd3AtdGFibGUtYm9keSB0cicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGNvbnN0IHRleHQgPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRcdCQodGhpcykudG9nZ2xlKHRleHQuaW5kZXhPZihxKSA+IC0xKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBCb2FyZCBncm91cGluZyBzZWxlY3RvclxyXG5cdFx0JCgnI3NlbGVjdC1ib2FyZC1ncm91cC1ieScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYuYm9hcmRHcm91cEJ5ID0gJCh0aGlzKS52YWwoKTtcclxuXHRcdFx0c2VsZi5yZW5kZXJLYW5iYW5Cb2FyZCgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQkNGIERyYXdlciB0b2dnbGVcclxuXHRcdCQoJyNidG4tYmNmLXRvZ2dsZS1kcmF3ZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJyNiY2YtZmxvYXRpbmctZHJhd2VyJykudG9nZ2xlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNidG4tY2xvc2UtYmNmLWRyYXdlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnI2JjZi1mbG9hdGluZy1kcmF3ZXInKS5oaWRlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBEb2N1bWVudCBmaWxlIGxpbmsgY2xpY2sgZGVsZWdhdGlvbiAoQXV0by1MYXVuY2hlcnMhKVxyXG5cdFx0JCgnI2RvY3VtZW50LWZvbGRlcnMtY29udGFpbmVyJykub24oJ2NsaWNrJywgJy5maWxlLWl0ZW0tbGluaycsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGNvbnN0IHJvdXRlID0gJCh0aGlzKS5kYXRhKCdyb3V0ZScpO1xyXG5cdFx0XHRjb25zdCB1cmwgPSAkKHRoaXMpLmRhdGEoJ3VybCcpO1xyXG5cdFx0XHRjb25zdCBtb2RlbElkID0gJCh0aGlzKS5kYXRhKCdtb2RlbC1pZCcpO1xyXG5cdFx0XHRpZiAocm91dGUgPT09ICdiaW0nKSB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdiY2YnLCB7IG1vZGVsOiBtb2RlbElkLCB1cmw6IHVybCB9KTtcclxuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdPcGVuaW5nIElGQyBtb2RlbCBpbiAzRCBWaWV3ZXIuLi4nKSwgaW5kaWNhdG9yOiAnYmx1ZScgfSk7XHJcblx0XHRcdH0gZWxzZSBpZiAocm91dGUgPT09ICdjYWQnKSB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdjYWQnLCB7IGZpbGU6IHVybCB9KTtcclxuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdPcGVuaW5nIGRyYXdpbmcgaW4gMkQgQ0FEIFN0dWRpby4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcclxuXHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ3BkZicpIHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3BkZicsIHsgZmlsZTogdXJsIH0pO1xyXG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ09wZW5pbmcgcGxhbiBpbiBQREYgVGFrZW9mZi4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gRG9jdW1lbnQgZmlsZSB1cGxvYWQgYnV0dG9uXHJcblx0XHQkKCcjYnRuLXVwbG9hZC1kb2N1bWVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5vcGVuRmlsZVVwbG9hZERpYWxvZygpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQklNIFRhYiBRdWljayBVcGxvYWQgSUZDIGJ1dHRvblxyXG5cdFx0JCgnI2J0bi1iY2YtdXBsb2FkLWlmYycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5vcGVuQmNmVXBsb2FkRGlhbG9nKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBCSU0gVGFiIExvYWQvVW5sb2FkIGFsbCBtb2RlbHMgYnV0dG9uc1xyXG5cdFx0JCgnI2J0bi1sb2FkLWFsbC1tb2RlbHMnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJyNiY2YtbW9kZWxzLXRyZWUgaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG5cdFx0XHRjb25zdCBpZnJhbWVTcmMgPSBgL2FwcC9iaW0tdmlld2VyP3Byb2plY3Q9JHtlbmNvZGVVUklDb21wb25lbnQoc2VsZi5jdXJyZW50UHJvamVjdCl9YDtcclxuXHRcdFx0JCgnI2lmcmFtZS1iY2YtM2Qtdmlld2VyJykuYXR0cignc3JjJywgaWZyYW1lU3JjKTtcclxuXHRcdFx0JCgnI2J0bi1iY2Ytb3Blbi1mdWxsc2NyZWVuJykuYXR0cignaHJlZicsIGlmcmFtZVNyYyk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNidG4tdW5sb2FkLWFsbC1tb2RlbHMnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJyNiY2YtbW9kZWxzLXRyZWUgaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuXHRcdFx0Y29uc3QgaWZyYW1lU3JjID0gYC9hcHAvYmltLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfWA7XHJcblx0XHRcdCQoJyNpZnJhbWUtYmNmLTNkLXZpZXdlcicpLmF0dHIoJ3NyYycsIGlmcmFtZVNyYyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBCQ0YgQ3JlYXRlIElzc3VlIGJ1dHRvblxyXG5cdFx0JCgnI2J0bi1iY2YtY3JlYXRlLXRvcGljJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdJc3N1ZScpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gRGFzaGJvYXJkIHdpZGdldCBidXR0b25zXHJcblx0XHQkKCcjYnRuLWFkZC1tZWV0aW5nJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzZWxmLm9wZW5TY2hlZHVsZU1lZXRpbmdEaWFsb2coKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2J0bi1hZGQtc3VicHJvamVjdC13aWRnZXQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ3N1YnByb2plY3QnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFN0YW5kYWxvbmUgQ0FEICYgUERGIGJ1dHRvbnNcclxuXHRcdCQoJyNidG4tb3Blbi1kd2ctZnVsbHNjcmVlbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0d2luZG93Lm9wZW4oYC9hcHAvZHdnLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfWAsICdfYmxhbmsnKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2J0bi1vcGVuLXBkZi1mdWxsc2NyZWVuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR3aW5kb3cub3BlbihgL2FwcC9wZGYtdGFrZW9mZj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfWAsICdfYmxhbmsnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFNjaGVkdWxlIG1lZXRpbmcgYnV0dG9uXHJcblx0XHQkKCcjYnRuLXNjaGVkdWxlLW1lZXRpbmcnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYub3BlblNjaGVkdWxlTWVldGluZ0RpYWxvZygpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gUHJvamVjdCBzZXR0aW5ncyBzYXZlXHJcblx0XHQkKCcjYnRuLXNhdmUtcHJvamVjdC1zZXR0aW5ncycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5zYXZlUHJvamVjdFNldHRpbmdzKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBBcmNoaXZlIHRvZ2dsZVxyXG5cdFx0JCgnI2J0bi10b2dnbGUtYXJjaGl2ZS1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzZWxmLnRvZ2dsZUFyY2hpdmVQcm9qZWN0KCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBEZWxldGUgcHJvamVjdFxyXG5cdFx0JCgnI2J0bi1kZWxldGUtcHJvamVjdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5jb25maXJtRGVsZXRlUHJvamVjdCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRsb2FkUHJvamVjdHNMaXN0KCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRyZXR1cm4gZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5saXN0X3Byb2plY3RzJyxcclxuXHRcdFx0YXJnczogeyBpbmNsdWRlX2FyY2hpdmVkOiAxIH1cclxuXHRcdH0pLnRoZW4ociA9PiB7XHJcblx0XHRcdHNlbGYuYWxsUHJvamVjdHMgPSByLm1lc3NhZ2UgfHwgW107XHJcblx0XHRcdHNlbGYucmVuZGVyUHJvamVjdFN3aXRjaGVyKCk7XHJcblx0XHRcdHNlbGYucmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRyZW5kZXJQcm9qZWN0U3dpdGNoZXIoKSB7XHJcblx0XHRjb25zdCAkbGlzdCA9ICQoJyNwcm9qZWN0LXN3aXRjaGVyLWxpc3QnKTtcclxuXHRcdCRsaXN0LmVtcHR5KCk7XHJcblx0XHQkbGlzdC5hcHBlbmQoYDxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJhY3Rpb24tc2VsZWN0LXByb2pcIiBkYXRhLXByb2plY3Q9XCJhbGxcIj48c3BhbiBjbGFzcz1cIm1yLTIgdGV4dC1tdXRlZFwiPiR7SUNPTlMubGlzdH08L3NwYW4+IDxzdHJvbmc+QWxsIHByb2plY3RzIChIdWIpPC9zdHJvbmc+PC9hPjwvbGk+YCk7XHJcblx0XHQkbGlzdC5hcHBlbmQoJzxsaSByb2xlPVwic2VwYXJhdG9yXCIgY2xhc3M9XCJkaXZpZGVyXCI+PC9saT4nKTtcclxuXHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdHRoaXMuYWxsUHJvamVjdHMuZm9yRWFjaChwID0+IHtcclxuXHRcdFx0Y29uc3QgZmF2SWNvbiA9IHAuaXNfZmF2b3JpdGUgPyAnXHUyQjUwICcgOiAnJztcclxuXHRcdFx0Y29uc3QgdG1wbEJhZGdlID0gcC5pc190ZW1wbGF0ZSA/ICcgPHNwYW4gY2xhc3M9XCJiYWRnZVwiPlRlbXBsYXRlPC9zcGFuPicgOiAnJztcclxuXHRcdFx0Y29uc3QgJGl0ZW0gPSAkKGA8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwiYWN0aW9uLXNlbGVjdC1wcm9qXCIgZGF0YS1wcm9qZWN0PVwiJHtlc2NhcGVIdG1sKHAubmFtZSl9XCI+JHtmYXZJY29ufSR7ZXNjYXBlSHRtbChwLnByb2plY3RfbmFtZSB8fCBwLm5hbWUpfSR7dG1wbEJhZGdlfTwvYT48L2xpPmApO1xyXG5cdFx0XHQkbGlzdC5hcHBlbmQoJGl0ZW0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JGxpc3Qub2ZmKCdjbGljaycsICcuYWN0aW9uLXNlbGVjdC1wcm9qJykub24oJ2NsaWNrJywgJy5hY3Rpb24tc2VsZWN0LXByb2onLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IHByb2ogPSAkKHRoaXMpLmRhdGEoJ3Byb2plY3QnKTtcclxuXHRcdFx0aWYgKHByb2ogPT09ICdhbGwnKSB7XHJcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHNlbGYuc2VsZWN0UHJvamVjdChwcm9qKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRzZWxlY3RQcm9qZWN0KHByb2plY3ROYW1lLCB0YWIgPSAnaG9tZScpIHtcclxuXHRcdGNvbnN0IHByb2pPYmogPSB0aGlzLmFsbFByb2plY3RzLmZpbmQocCA9PiBwLm5hbWUgPT09IHByb2plY3ROYW1lIHx8IHAucHJvamVjdF9uYW1lID09PSBwcm9qZWN0TmFtZSkgfHwgeyBuYW1lOiBwcm9qZWN0TmFtZSwgcHJvamVjdF9uYW1lOiBwcm9qZWN0TmFtZSB9O1xyXG5cdFx0dGhpcy5jdXJyZW50UHJvamVjdCA9IHByb2pPYmoubmFtZTtcclxuXHRcdCQoJyNjdXJyZW50LXByb2plY3QtdGl0bGUnKS50ZXh0KHByb2pPYmoucHJvamVjdF9uYW1lIHx8IHByb2pPYmoubmFtZSk7XHJcblx0XHQkKCcjZmlsdGVyLXByb2plY3QtbGFiZWwnKS50ZXh0KHByb2pPYmoucHJvamVjdF9uYW1lIHx8IHByb2pPYmoubmFtZSk7XHJcblx0XHQkKCcjc2lkZWJhci1hY3RpdmUtc3RhdHVzJykudGV4dChwcm9qT2JqLnN0YXR1cyB8fCAnQWN0aXZlJyk7XHJcblx0XHRpZiAodGhpcy5wYWdlKSB7XHJcblx0XHRcdHRoaXMucGFnZS5zZXRfdGl0bGVfc3ViKHByb2pPYmoucHJvamVjdF9uYW1lIHx8IHByb2pPYmoubmFtZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRW5hYmxlIHByb2plY3Qtc3BlY2lmaWMgbmF2IHRhYnNcclxuXHRcdCQoJy5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtJykuc2hvdygpO1xyXG5cdFx0dGhpcy5zd2l0Y2hUYWIodGFiKTtcclxuXHRcdHRoaXMubG9hZFByb2plY3REYXRhKHByb2plY3ROYW1lKTtcclxuXHR9XHJcblxyXG5cdHN3aXRjaFRhYih0YWJLZXksIHBhcmFtcyA9IHt9KSB7XHJcblx0XHR0aGlzLmN1cnJlbnRUYWIgPSB0YWJLZXk7XHJcblx0XHQkKCcuc3R1ZGlvLW5hdi1saXN0IC5uYXYtaXRlbScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdCQoYC5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtW2RhdGEtdGFiPVwiJHt0YWJLZXl9XCJdYCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuXHRcdGNvbnN0IHRhYlRpdGxlcyA9IHtcclxuXHRcdFx0J2hvbWUnOiAnRGFzaGJvYXJkJyxcclxuXHRcdFx0J3dvcmstcGFja2FnZXMnOiAnV29yayBQYWNrYWdlcycsXHJcblx0XHRcdCdib2FyZHMnOiAnQm9hcmRzJyxcclxuXHRcdFx0J2dhbnR0JzogJ0dhbnR0IENoYXJ0cycsXHJcblx0XHRcdCdiY2YnOiAnQklNIC8gQkNGIENvb3JkaW5hdGlvbicsXHJcblx0XHRcdCdjYWQnOiAnMkQgQ0FEIChEV0cpJyxcclxuXHRcdFx0J3BkZic6ICdQREYgUGxhbnMgJiBUYWtlb2ZmJyxcclxuXHRcdFx0J2RvY3VtZW50cyc6ICdEb2N1bWVudHMnLFxyXG5cdFx0XHQnbWVldGluZ3MnOiAnTWVldGluZ3MgJiBTYWZldHknLFxyXG5cdFx0XHQnbWVtYmVycyc6ICdNZW1iZXJzJyxcclxuXHRcdFx0J3NldHRpbmdzJzogJ1NldHRpbmdzJyxcclxuXHRcdFx0J2FsbC1wcm9qZWN0cyc6ICdBY3RpdmUgUHJvamVjdHMnXHJcblx0XHR9O1xyXG5cdFx0Y29uc3QgYWN0aXZlVGl0bGUgPSB0YWJUaXRsZXNbdGFiS2V5XSB8fCB0YWJLZXk7XHJcblx0XHQkKCcjc3R1ZGlvLWFjdGl2ZS10aXRsZScpLnRleHQoYWN0aXZlVGl0bGUpO1xyXG5cdFx0aWYgKHRoaXMucGFnZSkge1xyXG5cdFx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlKGFjdGl2ZVRpdGxlKTtcclxuXHRcdFx0aWYgKHRoaXMuY3VycmVudFByb2plY3QpIHtcclxuXHRcdFx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlX3N1Yih0aGlzLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdCQoJy5zdHVkaW8tdGFiLXZpZXcnKS5oaWRlKCk7XHJcblxyXG5cdFx0aWYgKHRhYktleSA9PT0gJ2FsbC1wcm9qZWN0cycpIHtcclxuXHRcdFx0JCgnI2N1cnJlbnQtcHJvamVjdC10aXRsZScpLnRleHQoJ0FsbCBwcm9qZWN0cycpO1xyXG5cdFx0XHQkKCcjdmlldy1hbGwtcHJvamVjdHMnKS5zaG93KCk7XHJcblx0XHRcdHRoaXMucmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0JChgI3ZpZXctJHt0YWJLZXl9YCkuc2hvdygpO1xyXG5cclxuXHRcdC8vIFRyaWdnZXIgdmlldy1zcGVjaWZpYyBsb2Fkc1xyXG5cdFx0aWYgKHRhYktleSA9PT0gJ2hvbWUnKSB7XHJcblx0XHRcdHRoaXMucmVuZGVyUHJvamVjdE92ZXJ2aWV3KCk7XHJcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ3dvcmstcGFja2FnZXMnKSB7XHJcblx0XHRcdHRoaXMucmVuZGVyV29ya1BhY2thZ2VzKCk7XHJcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2JvYXJkcycpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJLYW5iYW5Cb2FyZCgpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdnYW50dCcpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJHYW50dENoYXJ0KCk7XHJcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2JjZicpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJCY2ZWaWV3ZXIocGFyYW1zLm1vZGVsKTtcclxuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAnY2FkJykge1xyXG5cdFx0XHRjb25zdCBjYWRTcmMgPSBwYXJhbXMuZmlsZVxyXG5cdFx0XHRcdD8gYC9hcHAvZHdnLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY3VycmVudFByb2plY3QpfSZmaWxlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5maWxlKX1gXHJcblx0XHRcdFx0OiBgL2FwcC9kd2ctdmlld2VyP3Byb2plY3Q9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jdXJyZW50UHJvamVjdCl9YDtcclxuXHRcdFx0JCgnI2lmcmFtZS1kd2ctdmlld2VyJykuYXR0cignc3JjJywgY2FkU3JjKTtcclxuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAncGRmJykge1xyXG5cdFx0XHRjb25zdCBwZGZTcmMgPSBwYXJhbXMuZmlsZVxyXG5cdFx0XHRcdD8gYC9hcHAvcGRmLXRha2VvZmY/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmN1cnJlbnRQcm9qZWN0KX0mZmlsZT0ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuZmlsZSl9YFxyXG5cdFx0XHRcdDogYC9hcHAvcGRmLXRha2VvZmY/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmN1cnJlbnRQcm9qZWN0KX1gO1xyXG5cdFx0XHQkKCcjaWZyYW1lLXBkZi12aWV3ZXInKS5hdHRyKCdzcmMnLCBwZGZTcmMpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdkb2N1bWVudHMnKSB7XHJcblx0XHRcdHRoaXMucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdtZWV0aW5ncycpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJNZWV0aW5nc1RhYigpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdtZW1iZXJzJykge1xyXG5cdFx0XHR0aGlzLnJlbmRlck1lbWJlcnNUYWJsZSgpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdzZXR0aW5ncycpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJTZXR0aW5nc1RhYigpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0bG9hZFByb2plY3REYXRhKHByb2plY3ROYW1lKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8uZ2V0X3Byb2plY3Rfb3ZlcnZpZXcnLFxyXG5cdFx0XHRhcmdzOiB7IHByb2plY3Q6IHByb2plY3ROYW1lIH1cclxuXHRcdH0pLnRoZW4ociA9PiB7XHJcblx0XHRcdHNlbGYucHJvamVjdE92ZXJ2aWV3RGF0YSA9IHIubWVzc2FnZSB8fCB7fTtcclxuXHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2hvbWUnKSB7XHJcblx0XHRcdFx0c2VsZi5yZW5kZXJQcm9qZWN0T3ZlcnZpZXcoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0Ly8gVEFCIDA6IEFMTCBQUk9KRUNUUyBIVUIgKFNjcmVlbnNob3QgMSlcclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0cmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpIHtcclxuXHRcdGNvbnN0ICR0Ym9keSA9ICQoJyNwcm9qZWN0cy10YWJsZS1ib2R5Jyk7XHJcblx0XHQkdGJvZHkuZW1wdHkoKTtcclxuXHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdHRoaXMuYWxsUHJvamVjdHMuZm9yRWFjaChwID0+IHtcclxuXHRcdFx0Y29uc3QgZmF2U3RhciA9IHAuaXNfZmF2b3JpdGUgPyBJQ09OUy5zdGFyIDogSUNPTlMuc3RhckVtcHR5O1xyXG5cdFx0XHRjb25zdCBzdGF0dXNQaWxsID0gcC5oZWFsdGhfc3RhdHVzID09PSAnT24gVHJhY2snIFxyXG5cdFx0XHRcdD8gJzxzcGFuIGNsYXNzPVwic3RhdHVzLWFjdGl2ZS1waWxsXCI+PHNwYW4gY2xhc3M9XCJzdGF0dXMtZG90LWdyZWVuXCI+PC9zcGFuPiBPbiB0cmFjazwvc3Bhbj4nXHJcblx0XHRcdFx0OiAocC5oZWFsdGhfc3RhdHVzID09PSAnQXQgUmlzaycgXHJcblx0XHRcdFx0XHQ/ICc8c3BhbiBjbGFzcz1cInN0YXR1cy13YXJuaW5nLXBpbGxcIj48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3QtYW1iZXJcIj48L3NwYW4+IEF0IHJpc2s8L3NwYW4+J1xyXG5cdFx0XHRcdFx0OiAnPHNwYW4gY2xhc3M9XCJzdGF0dXMtZGFuZ2VyLXBpbGxcIj48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3QtcmVkXCI+PC9zcGFuPiBPZmYgdHJhY2s8L3NwYW4+Jyk7XHJcblxyXG5cdFx0XHRjb25zdCBpbmRlbnQgPSBwLnBhcmVudF9wcm9qZWN0ID8gJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1x1MjFCMyAnIDogJyc7XHJcblx0XHRcdGNvbnN0ICR0ciA9ICQoYFxyXG5cdFx0XHRcdDx0cj5cclxuXHRcdFx0XHRcdDx0ZCBjbGFzcz1cInRleHQtY2VudGVyXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidG9nZ2xlLWZhdlwiIGRhdGEtcHJvamVjdD1cIiR7ZXNjYXBlSHRtbChwLm5hbWUpfVwiPiR7ZmF2U3Rhcn08L2E+PC90ZD5cclxuXHRcdFx0XHRcdDx0ZD4ke2luZGVudH08YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJwcm9qZWN0LWxpbmtcIiBkYXRhLXByb2plY3Q9XCIke2VzY2FwZUh0bWwocC5uYW1lKX1cIj48c3Ryb25nPiR7ZXNjYXBlSHRtbChwLnByb2plY3RfbmFtZSB8fCBwLm5hbWUpfTwvc3Ryb25nPjwvYT48L3RkPlxyXG5cdFx0XHRcdFx0PHRkPiR7c3RhdHVzUGlsbH08L3RkPlxyXG5cdFx0XHRcdFx0PHRkIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1zdWNjZXNzXCI+JHtJQ09OUy5jaGVja308L3RkPlxyXG5cdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwidGV4dC1tdXRlZFwiPiR7ZXNjYXBlSHRtbChwLmNyZWF0ZWRfb24gfHwgJy0tJyl9PC9zcGFuPjwvdGQ+XHJcblx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtlc2NhcGVIdG1sKHAubGF0ZXN0X2FjdGl2aXR5X2F0IHx8ICctLScpfTwvc3Bhbj48L3RkPlxyXG5cdFx0XHRcdFx0PHRkPjxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke2VzY2FwZUh0bWwocC5kaXNrX3VzYWdlX2Zvcm1hdHRlZCB8fCAnMCBCeXRlcycpfTwvc21hbGw+PC90ZD5cclxuXHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRgKTtcclxuXHJcblx0XHRcdCR0ci5maW5kKCcucHJvamVjdC1saW5rJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNlbGYuc2VsZWN0UHJvamVjdCgkKHRoaXMpLmRhdGEoJ3Byb2plY3QnKSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0JHRyLmZpbmQoJy50b2dnbGUtZmF2Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGNvbnN0IGlzRmF2ID0gcC5pc19mYXZvcml0ZSA/IDAgOiAxO1xyXG5cdFx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQocC5uYW1lLCB7IGlzX2Zhdm9yaXRlOiBpc0ZhdiB9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdCR0Ym9keS5hcHBlbmQoJHRyKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNwcm9qZWN0cy10YWJsZS1zdW1tYXJ5JykudGV4dChgU2hvd2luZyAke3RoaXMuYWxsUHJvamVjdHMubGVuZ3RofSBhY3RpdmUgcHJvamVjdChzKWApO1xyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8vIFRBQiAxOiBQUk9KRUNUIEhPTUUgREFTSEJPQVJEIChTY3JlZW5zaG90IDIpXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlclByb2plY3RPdmVydmlldygpIHtcclxuXHRcdGlmICghdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhKSByZXR1cm47XHJcblx0XHRjb25zdCBkYXRhID0gdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhO1xyXG5cdFx0Y29uc3Qgc3VtbWFyeSA9IGRhdGEuc3VtbWFyeSB8fCB7fTtcclxuXHJcblx0XHQvLyBHcmVldGluZyAmIFRvcCBNZXRyaWMgQ2FyZHMgKEZyYXBwZSBVSSBTdHlsZSlcclxuXHRcdGNvbnN0IHVzZXJHcmVldGluZyA9IGZyYXBwZS5zZXNzaW9uLnVzZXJfZnVsbG5hbWUgfHwgZnJhcHBlLnNlc3Npb24udXNlciB8fCAnQWRtaW5pc3RyYXRvcic7XHJcblx0XHQkKCcjaG9tZS11c2VyLWdyZWV0aW5nJykudGV4dCh1c2VyR3JlZXRpbmcpO1xyXG5cclxuXHRcdGNvbnN0IHdwQ291bnRzID0gZGF0YS53b3JrX3BhY2thZ2VzX2NvdW50cyB8fCB7fTtcclxuXHRcdGNvbnN0IG9wZW5UYXNrcyA9IHdwQ291bnRzLm9wZW4gIT09IHVuZGVmaW5lZCA/IHdwQ291bnRzLm9wZW4gOiAoZGF0YS50YXNrcyA/IGRhdGEudGFza3MubGVuZ3RoIDogMCk7XHJcblx0XHRjb25zdCBjbGFzaGVzID0gKGRhdGEuY29vcmRpbmF0aW9uICYmIGRhdGEuY29vcmRpbmF0aW9uLnRvcGljcyA/IGRhdGEuY29vcmRpbmF0aW9uLnRvcGljcy5sZW5ndGggOiAwKTtcclxuXHRcdGNvbnN0IHByb2dyZXNzID0gTWF0aC5yb3VuZChzdW1tYXJ5LnBlcmNlbnRfY29tcGxldGUgfHwgMCk7XHJcblxyXG5cdFx0JCgnI2hvbWUtc3RhdC1vcGVuLXRhc2tzJykudGV4dChvcGVuVGFza3MpO1xyXG5cdFx0JCgnI2hvbWUtc3RhdC1jbGFzaGVzJykudGV4dChjbGFzaGVzKTtcclxuXHRcdCQoJyNob21lLXN0YXQtcHJvZ3Jlc3MnKS50ZXh0KGAke3Byb2dyZXNzfSVgKTtcclxuXHRcdCQoJyNzcGFya2xpbmUtcHJvZ3Jlc3MtYmFyJykuY3NzKCd3aWR0aCcsIGAke01hdGgubWluKDEwMCwgTWF0aC5tYXgoNSwgcHJvZ3Jlc3MpKX0lYCk7XHJcblxyXG5cdFx0Ly8gRGVzY3JpcHRpb24gJiBEYXRlc1xyXG5cdFx0JCgnI292ZXJ2aWV3LWRlc2NyaXB0aW9uJykudGV4dChzdW1tYXJ5LmRlc2NyaXB0aW9uIHx8IF9fKCdObyBkZXNjcmlwdGlvbiBwcm92aWRlZC4nKSk7XHJcblx0XHQkKCcjb3ZlcnZpZXctZGF0ZXMnKS50ZXh0KGAke3N1bW1hcnkuZXhwZWN0ZWRfc3RhcnRfZGF0ZSB8fCAnLS0nfSB0byAke3N1bW1hcnkuZXhwZWN0ZWRfZW5kX2RhdGUgfHwgJy0tJ31gKTtcclxuXHRcdCQoJyNvdmVydmlldy1wcm9ncmVzcycpLnRleHQoYCR7TWF0aC5yb3VuZChzdW1tYXJ5LnBlcmNlbnRfY29tcGxldGUgfHwgMCl9JWApO1xyXG5cclxuXHRcdC8vIEhlYWx0aCBzdGF0dXNcclxuXHRcdGNvbnN0IGhlYWx0aCA9IHN1bW1hcnkuaGVhbHRoX3N0YXR1cyB8fCAnT24gVHJhY2snO1xyXG5cdFx0JCgnI3NlbGVjdC1wcm9qZWN0LWhlYWx0aCcpLnZhbChoZWFsdGgpO1xyXG5cdFx0aWYgKHRoaXMucGFnZSAmJiB0aGlzLnBhZ2Uuc2V0X2luZGljYXRvcikge1xyXG5cdFx0XHRjb25zdCBjb2xvciA9IGhlYWx0aCA9PT0gJ09uIFRyYWNrJyA/ICdncmVlbicgOiAoaGVhbHRoID09PSAnQXQgUmlzaycgPyAnb3JhbmdlJyA6ICdyZWQnKTtcclxuXHRcdFx0dGhpcy5wYWdlLnNldF9pbmRpY2F0b3IoaGVhbHRoLCBjb2xvcik7XHJcblx0XHR9XHJcblx0XHQkKCcjb3ZlcnZpZXctc3RhdHVzLW5hcnJhdGl2ZScpLnRleHQoc3VtbWFyeS5zdGF0dXNfbmFycmF0aXZlIHx8IF9fKCdBbGwgdGFza3MgYW5kIHN1Yi1wcm9qZWN0cyBhcmUgb24gc2NoZWR1bGUuJykpO1xyXG5cclxuXHRcdC8vIE1pbGVzdG9uZSBEaWFtb25kIFRpbWVsaW5lXHJcblx0XHR0aGlzLnJlbmRlck1pbGVzdG9uZVRpbWVsaW5lKGRhdGEubWlsZXN0b25lcyB8fCBbXSk7XHJcblxyXG5cdFx0Ly8gU3VicHJvamVjdHNcclxuXHRcdGNvbnN0ICRzdWJMaXN0ID0gJCgnI3N1YnByb2plY3RzLWxpc3QnKTtcclxuXHRcdCRzdWJMaXN0LmVtcHR5KCk7XHJcblx0XHQoZGF0YS5zdWJwcm9qZWN0cyB8fCBbXSkuZm9yRWFjaChzID0+IHtcclxuXHRcdFx0JHN1Ykxpc3QuYXBwZW5kKGBcclxuXHRcdFx0XHQ8bGkgY2xhc3M9XCJmbGV4LWJldHdlZW4gcC0xXCI+XHJcblx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImQtaW5saW5lLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0xXCI+PHNwYW4gY2xhc3M9XCJ0ZXh0LXByaW1hcnkgbXItMVwiPiR7SUNPTlMuZm9sZGVyfTwvc3Bhbj4gJHtlc2NhcGVIdG1sKHMucHJvamVjdF9uYW1lKX08L3NwYW4+XHJcblx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cInN0YXR1cy1hY3RpdmUtcGlsbFwiPjxzcGFuIGNsYXNzPVwic3RhdHVzLWRvdC1ncmVlblwiPjwvc3Bhbj4gJHtlc2NhcGVIdG1sKHMuc3RhdHVzKX08L3NwYW4+XHJcblx0XHRcdFx0PC9saT5cclxuXHRcdFx0YCk7XHJcblx0XHR9KTtcclxuXHRcdGlmICgoZGF0YS5zdWJwcm9qZWN0cyB8fCBbXSkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdCRzdWJMaXN0LmFwcGVuZCgnPGxpIGNsYXNzPVwidGV4dC1tdXRlZCBwLTFcIj48c21hbGw+Tm8gc3VicHJvamVjdHMgY29uZmlndXJlZC48L3NtYWxsPjwvbGk+Jyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTWVldGluZ3NcclxuXHRcdGNvbnN0ICRtZWV0TGlzdCA9ICQoJyNtZWV0aW5ncy1saXN0LWNvbnRhaW5lcicpO1xyXG5cdFx0JG1lZXRMaXN0LmVtcHR5KCk7XHJcblx0XHQoZGF0YS5tZWV0aW5ncyB8fCBbXSkuZm9yRWFjaChtID0+IHtcclxuXHRcdFx0JG1lZXRMaXN0LmFwcGVuZChgXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctaXRlbSBwLTIgbWItMVwiIHN0eWxlPVwiYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmMWY1Zjk7XCI+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleC1iZXR3ZWVuXCI+XHJcblx0XHRcdFx0XHRcdDxzdHJvbmc+JHtlc2NhcGVIdG1sKG0udGl0bGUpfTwvc3Ryb25nPlxyXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImJhZGdlIGJhZGdlLWluZm9cIj4ke2VzY2FwZUh0bWwobS50eXBlKX08L3NwYW4+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWQgZC1pbmxpbmUtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXIgZ2FwLTEgbXQtMVwiPiR7SUNPTlMuY2FsZW5kYXJ9IDxzcGFuPiR7ZXNjYXBlSHRtbChtLmRhdGUpfSB8ICR7ZXNjYXBlSHRtbChtLmhvc3QgfHwgJ0Nvb3JkaW5hdG9yJyl9PC9zcGFuPjwvc21hbGw+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cdFx0fSk7XHJcblx0XHRpZiAoKGRhdGEubWVldGluZ3MgfHwgW10pLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHQkbWVldExpc3QuYXBwZW5kKCc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBwLTIgdGV4dC1jZW50ZXJcIj48c21hbGw+Tm8gdXBjb21pbmcgbWVldGluZ3M8L3NtYWxsPjwvZGl2PicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIE1lbWJlcnNcclxuXHRcdGNvbnN0ICRtZW1HcmlkID0gJCgnI21lbWJlcnMtYXZhdGFycy1ncmlkJyk7XHJcblx0XHQkbWVtR3JpZC5lbXB0eSgpO1xyXG5cdFx0KGRhdGEubWVtYmVycyB8fCBbXSkuZm9yRWFjaChtID0+IHtcclxuXHRcdFx0Y29uc3QgbWVtYmVyTmFtZSA9IFN0cmluZyhtLmZ1bGxfbmFtZSB8fCBtLnVzZXIgfHwgJ01lbWJlcicpLnRyaW0oKTtcclxuXHRcdFx0Y29uc3QgaW5pdGlhbHMgPSBtZW1iZXJOYW1lID8gbWVtYmVyTmFtZS5zdWJzdHJpbmcoMCwgMikudG9VcHBlckNhc2UoKSA6ICdNQic7XHJcblx0XHRcdCRtZW1HcmlkLmFwcGVuZChgXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lbWJlci1jaGlwIHAtMVwiIHN0eWxlPVwiZGlzcGxheTogaW5saW5lLWZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNnB4OyBtYXJnaW46IDRweDtcIj5cclxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYXZhdGFyLWNpcmNsZVwiIHN0eWxlPVwid2lkdGg6MjhweDtoZWlnaHQ6MjhweDtib3JkZXItcmFkaXVzOjUwJTtiYWNrZ3JvdW5kOiM0MzM4Y2E7Y29sb3I6I2ZmZjtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6Ym9sZDtcIj5cclxuXHRcdFx0XHRcdFx0JHtlc2NhcGVIdG1sKGluaXRpYWxzKX1cclxuXHRcdFx0XHRcdDwvc3Bhbj5cclxuXHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cImZvbnQtd2VpZ2h0LW1lZGl1bVwiPiR7ZXNjYXBlSHRtbChtZW1iZXJOYW1lKX08L3NtYWxsPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRgKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIE5ld3NcclxuXHRcdGNvbnN0ICRuZXdzQ29udCA9ICQoJyNuZXdzLWZlZWQtY29udGFpbmVyJyk7XHJcblx0XHQkbmV3c0NvbnQuZW1wdHkoKTtcclxuXHRcdChkYXRhLm5ld3MgfHwgW10pLmZvckVhY2gobiA9PiB7XHJcblx0XHRcdCRuZXdzQ29udC5hcHBlbmQoYFxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJuZXdzLWJ1bGxldGluIHAtMiBtYi0yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZjhmYWZjOyBib3JkZXItbGVmdDogM3B4IHNvbGlkICM2MzY2ZjE7IGJvcmRlci1yYWRpdXM6IDRweDtcIj5cclxuXHRcdFx0XHRcdDxoNSBjbGFzcz1cIm0tMCBmb250LXdlaWdodC1ib2xkXCI+JHtlc2NhcGVIdG1sKG4udGl0bGUpfTwvaDU+XHJcblx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtlc2NhcGVIdG1sKG4uYXV0aG9yKX0gb24gJHtlc2NhcGVIdG1sKG4uZGF0ZSl9PC9zbWFsbD5cclxuXHRcdFx0XHRcdDxwIGNsYXNzPVwibS0wIG10LTEgdGV4dC1zZWNvbmRhcnlcIiBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDtcIj4ke2VzY2FwZUh0bWwobi5jb250ZW50KX08L3A+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRyZW5kZXJNaWxlc3RvbmVUaW1lbGluZShtaWxlc3RvbmVzKSB7XHJcblx0XHRjb25zdCAkbWFya2VycyA9ICQoJyN0aW1lbGluZS1tYXJrZXJzLWNvbnRhaW5lcicpO1xyXG5cdFx0JG1hcmtlcnMuZW1wdHkoKTtcclxuXHJcblx0XHRpZiAoIW1pbGVzdG9uZXMgfHwgbWlsZXN0b25lcy5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0JCgnI3RpbWVsaW5lLWF4aXMtYmFyJykuaGlkZSgpO1xyXG5cdFx0XHQkbWFya2Vycy5odG1sKGA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIiBzdHlsZT1cIndpZHRoOiAxMDAlO1wiPjxzcGFuIGNsYXNzPVwidGltZWxpbmUtZW1wdHktbXNnIHRleHQtbXV0ZWRcIj4ke0lDT05TLmluZm99IE5vIGRlbGl2ZXJ5IG1pbGVzdG9uZXMgcmVjb3JkZWQgeWV0Ljwvc3Bhbj48L2Rpdj5gKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQoJyN0aW1lbGluZS1heGlzLWJhcicpLnNob3coKTtcclxuXHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdG1pbGVzdG9uZXMuZm9yRWFjaChtID0+IHtcclxuXHRcdFx0Y29uc3QgY29tcGxldGVkQ2xzID0gbS5jb21wbGV0ZWQgPyAnY29tcGxldGVkJyA6ICcnO1xyXG5cdFx0XHRjb25zdCBzYWZlVGl0bGUgPSBlc2NhcGVIdG1sKG0udGl0bGUgfHwgJycpO1xyXG5cdFx0XHRjb25zdCBzYWZlRHVlRGF0ZSA9IGVzY2FwZUh0bWwobS5kdWVfZGF0ZSB8fCAnJyk7XHJcblx0XHRcdGNvbnN0IHNhZmVTdGF0dXMgPSBlc2NhcGVIdG1sKG0uc3RhdHVzIHx8ICcnKTtcclxuXHRcdFx0Y29uc3QgJHB0ID0gJChgXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1pbGVzdG9uZS1tYXJrZXItcG9pbnRcIiBkYXRhLWlkPVwiJHtlc2NhcGVIdG1sKG0uaWQpfVwiIHRpdGxlPVwiJHtzYWZlVGl0bGV9ICgke3NhZmVEdWVEYXRlIHx8ICdUQkQnfSlcIj5cclxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibWlsZXN0b25lLWRhdGVcIj4ke3NhZmVEdWVEYXRlLmxlbmd0aCA+PSA1ID8gc2FmZUR1ZURhdGUuc3Vic3RyaW5nKDUpIDogc2FmZUR1ZURhdGV9PC9zcGFuPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1pbGVzdG9uZS1kaWFtb25kICR7Y29tcGxldGVkQ2xzfVwiPjwvZGl2PlxyXG5cdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtaWxlc3RvbmUtbGFiZWxcIj4ke3NhZmVUaXRsZX08L3NwYW4+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cdFx0XHQkcHQub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGZyYXBwZS5tc2dwcmludCh7XHJcblx0XHRcdFx0XHR0aXRsZTogX18oJ01pbGVzdG9uZSBEZWxpdmVyeSBEZXRhaWxzJyksXHJcblx0XHRcdFx0XHRtZXNzYWdlOiBgPGg0PiR7c2FmZVRpdGxlfTwvaDQ+PHA+PHN0cm9uZz5UYXJnZXQgRHVlIERhdGU6PC9zdHJvbmc+ICR7c2FmZUR1ZURhdGUgfHwgJ05vbmUnfTwvcD48cD48c3Ryb25nPlN0YXR1czo8L3N0cm9uZz4gJHtzYWZlU3RhdHVzfTwvcD5gLFxyXG5cdFx0XHRcdFx0aW5kaWNhdG9yOiBtLmNvbXBsZXRlZCA/ICdncmVlbicgOiAnb3JhbmdlJ1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0JG1hcmtlcnMuYXBwZW5kKCRwdCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgMjogV09SSyBQQUNLQUdFUyBHUklEIChTY3JlZW5zaG90IDMpXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlcldvcmtQYWNrYWdlcyhzZWFyY2hRdWVyeSA9IG51bGwpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5saXN0X3dvcmtfcGFja2FnZXMnLFxyXG5cdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0cHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCxcclxuXHRcdFx0XHRmaWx0ZXJfa2V5OiBzZWxmLmFjdGl2ZUZpbHRlcktleSxcclxuXHRcdFx0XHR0eXBlX2ZpbHRlcjogc2VsZi5hY3RpdmVUeXBlRmlsdGVyLFxyXG5cdFx0XHRcdHNlYXJjaDogc2VhcmNoUXVlcnlcclxuXHRcdFx0fVxyXG5cdFx0fSkudGhlbihyID0+IHtcclxuXHRcdFx0Y29uc3QgaXRlbXMgPSByLm1lc3NhZ2UgfHwgW107XHJcblx0XHRcdGNvbnN0ICR0Ym9keSA9ICQoJyN3cC10YWJsZS1ib2R5Jyk7XHJcblx0XHRcdCR0Ym9keS5lbXB0eSgpO1xyXG5cclxuXHRcdFx0aWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdCR0Ym9keS5hcHBlbmQoJzx0cj48dGQgY29sc3Bhbj1cIjdcIiBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtbXV0ZWQgcC00XCI+Tm8gd29yayBwYWNrYWdlcyBtYXRjaCB0aGlzIGZpbHRlci48L3RkPjwvdHI+Jyk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zdCBhbGxvd2VkVHlwZXMgPSBbJ3Rhc2snLCAnbWlsZXN0b25lJywgJ3BoYXNlJywgJ2lzc3VlJywgJ2NsYXNoJ107XHJcblx0XHRcdGl0ZW1zLmZvckVhY2goaXQgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IHJhd1R5cGUgPSBTdHJpbmcoaXQudHlwZSB8fCAndGFzaycpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdFx0Y29uc3Qgc2FmZVR5cGUgPSBhbGxvd2VkVHlwZXMuaW5jbHVkZXMocmF3VHlwZSkgPyByYXdUeXBlIDogJ3Rhc2snO1xyXG5cdFx0XHRcdGNvbnN0IHBpbGxDbHMgPSBgd3AtcGlsbC0ke3NhZmVUeXBlfWA7XHJcblx0XHRcdFx0Y29uc3QgaW5kZW50ID0gaXQucGFyZW50X3Rhc2sgPyAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHUyMUIzICcgOiAnJztcclxuXHRcdFx0XHRjb25zdCAkdHIgPSAkKGBcclxuXHRcdFx0XHRcdDx0ciBjbGFzcz1cIndwLXJvdy1pdGVtXCIgZGF0YS1pZD1cIiR7ZXNjYXBlSHRtbChpdC5pZCl9XCIgc3R5bGU9XCJjdXJzb3I6IHBvaW50ZXI7XCI+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+IyR7ZXNjYXBlSHRtbChTdHJpbmcoaXQuaWQpLnJlcGxhY2UoJ1RBU0stJywgJycpKX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD4ke2luZGVudH08c3Ryb25nPiR7ZXNjYXBlSHRtbChpdC5zdWJqZWN0KX08L3N0cm9uZz48L3RkPlxyXG5cdFx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2VzY2FwZUh0bWwoaXQudHlwZSl9PC9zcGFuPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3RcIj48L3NwYW4+ICR7ZXNjYXBlSHRtbChpdC5zdGF0dXMpfTwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGw+JHtlc2NhcGVIdG1sKGl0LmFzc2lnbmVlX25hbWUgfHwgJ1VuYXNzaWduZWQnKX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGw+JHtlc2NhcGVIdG1sKGl0LnByaW9yaXR5KX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtlc2NhcGVIdG1sKGl0LmV4cF9lbmRfZGF0ZSB8fCAnLS0nKX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRcdGApO1xyXG5cclxuXHRcdFx0XHQkdHIub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0c2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3IoaXQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHQkdGJvZHkuYXBwZW5kKCR0cik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvcGVuV29ya1BhY2thZ2VJbnNwZWN0b3Iod3ApIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0Y29uc3QgZCA9IG5ldyBmcmFwcGUudWkuRGlhbG9nKHtcclxuXHRcdFx0dGl0bGU6IGBbJHtlc2NhcGVIdG1sKHdwLnR5cGUpfV0gIyR7ZXNjYXBlSHRtbCh3cC5pZCl9IC0gJHtlc2NhcGVIdG1sKHdwLnN1YmplY3QpfWAsXHJcblx0XHRcdGZpZWxkczogW1xyXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnc3RhdHVzJywgbGFiZWw6IF9fKCdTdGF0dXMnKSwgZmllbGR0eXBlOiAnU2VsZWN0Jywgb3B0aW9uczogJ09wZW5cXG5Xb3JraW5nXFxuUGVuZGluZyBSZXZpZXdcXG5Db21wbGV0ZWRcXG5DYW5jZWxsZWQnLCBkZWZhdWx0OiB3cC5zdGF0dXMgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3ByaW9yaXR5JywgbGFiZWw6IF9fKCdQcmlvcml0eScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnTG93XFxuTm9ybWFsXFxuSGlnaFxcblVyZ2VudCcsIGRlZmF1bHQ6IHdwLnByaW9yaXR5IH0sXHJcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdleHBfZW5kX2RhdGUnLCBsYWJlbDogX18oJ0R1ZSBEYXRlJyksIGZpZWxkdHlwZTogJ0RhdGUnLCBkZWZhdWx0OiB3cC5leHBfZW5kX2RhdGUgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2xpbmtlZF9pbmZvJywgbGFiZWw6IF9fKCdEb21haW4gTGlua2FnZScpLCBmaWVsZHR5cGU6ICdIVE1MJyB9XHJcblx0XHRcdF0sXHJcblx0XHRcdHByaW1hcnlfYWN0aW9uX2xhYmVsOiBfXygnVXBkYXRlIFdvcmsgUGFja2FnZScpLFxyXG5cdFx0XHRwcmltYXJ5X2FjdGlvbih2YWx1ZXMpIHtcclxuXHRcdFx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50LnNldF92YWx1ZScsXHJcblx0XHRcdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0XHRcdGRvY3R5cGU6ICdUYXNrJyxcclxuXHRcdFx0XHRcdFx0bmFtZTogd3AuaWQsXHJcblx0XHRcdFx0XHRcdGZpZWxkbmFtZToge1xyXG5cdFx0XHRcdFx0XHRcdHN0YXR1czogdmFsdWVzLnN0YXR1cyxcclxuXHRcdFx0XHRcdFx0XHRwcmlvcml0eTogdmFsdWVzLnByaW9yaXR5LFxyXG5cdFx0XHRcdFx0XHRcdGV4cF9lbmRfZGF0ZTogdmFsdWVzLmV4cF9lbmRfZGF0ZVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRkLmhpZGUoKTtcclxuXHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1dvcmsgcGFja2FnZSB1cGRhdGVkLicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XHJcblx0XHRcdFx0XHRzZWxmLnJlbmRlcldvcmtQYWNrYWdlcygpO1xyXG5cdFx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2JvYXJkcycpIHNlbGYucmVuZGVyS2FuYmFuQm9hcmQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0bGV0IGxpbmtIdG1sID0gJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+PHNtYWxsPk5hdGl2ZSBUYXNrIGluIEVSUE5leHQuPC9zbWFsbD48L2Rpdj4nO1xyXG5cdFx0aWYgKHdwLmJjZl90b3BpYykge1xyXG5cdFx0XHRsaW5rSHRtbCA9IGA8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtd2FybmluZyBkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0yXCI+PHNwYW4gY2xhc3M9XCJtci0xXCI+JHtJQ09OUy5jdWJlfTwvc3Bhbj4gPGRpdj5MaW5rZWQgdG8gQkNGIENsYXNoIFRvcGljOiA8c3Ryb25nPiR7ZXNjYXBlSHRtbCh3cC5iY2ZfdG9waWMpfTwvc3Ryb25nPjwvZGl2PjwvZGl2PmA7XHJcblx0XHR9IGVsc2UgaWYgKHdwLnJmaV9saW5rKSB7XHJcblx0XHRcdGxpbmtIdG1sID0gYDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1pbmZvIGQtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXIgZ2FwLTJcIj48c3BhbiBjbGFzcz1cIm1yLTFcIj4ke0lDT05TLmluZm99PC9zcGFuPiA8ZGl2PkxpbmtlZCB0byBUZWNobmljYWwgUkZJOiA8c3Ryb25nPiR7ZXNjYXBlSHRtbCh3cC5yZmlfbGluayl9PC9zdHJvbmc+PC9kaXY+PC9kaXY+YDtcclxuXHRcdH1cclxuXHRcdGQuZmllbGRzX2RpY3QubGlua2VkX2luZm8uJHdyYXBwZXIuaHRtbChsaW5rSHRtbCk7XHJcblx0XHRkLnNob3coKTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgMzogS0FOQkFOIEJPQVJEUyAoSFRNTDUgRHJhZyAmIERyb3ApXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlckthbmJhbkJvYXJkKCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmdldF9rYW5iYW5fYm9hcmRfZGF0YScsXHJcblx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxyXG5cdFx0XHRcdGdyb3VwX2J5OiBzZWxmLmJvYXJkR3JvdXBCeVxyXG5cdFx0XHR9XHJcblx0XHR9KS50aGVuKHIgPT4ge1xyXG5cdFx0XHRjb25zdCBkYXRhID0gci5tZXNzYWdlIHx8IHt9O1xyXG5cdFx0XHRjb25zdCBjb2x1bW5zID0gZGF0YS5jb2x1bW5zIHx8IFtdO1xyXG5cdFx0XHRjb25zdCAkd3JhcHBlciA9ICQoJyNrYW5iYW4tY29sdW1ucy13cmFwcGVyJyk7XHJcblx0XHRcdCR3cmFwcGVyLmVtcHR5KCk7XHJcblxyXG5cdFx0XHRjb2x1bW5zLmZvckVhY2goY29sID0+IHtcclxuXHRcdFx0XHRjb25zdCBzYWZlQ29sSWQgPSBlc2NhcGVIdG1sKGNvbC5pZCk7XHJcblx0XHRcdFx0Y29uc3Qgc2FmZUNvbFRpdGxlID0gZXNjYXBlSHRtbChjb2wudGl0bGUpO1xyXG5cdFx0XHRcdGNvbnN0ICRjb2wgPSAkKGBcclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY29sdW1uXCIgZGF0YS1jb2wtaWQ9XCIke3NhZmVDb2xJZH1cIj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNvbHVtbi1oZWFkZXJcIj5cclxuXHRcdFx0XHRcdFx0XHQ8c3Bhbj4ke3NhZmVDb2xUaXRsZX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJiYWRnZSBjb2wtY2FyZC1jb3VudFwiPiR7Y29sLmNhcmRzID8gY29sLmNhcmRzLmxlbmd0aCA6IDB9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNvbHVtbi1jYXJkcy1saXN0XCIgZGF0YS1jb2wtaWQ9XCIke3NhZmVDb2xJZH1cIj5cclxuXHRcdFx0XHRcdFx0XHQ8IS0tIENhcmRzIC0tPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdGApO1xyXG5cclxuXHRcdFx0XHRjb25zdCAkY2FyZHNMaXN0ID0gJGNvbC5maW5kKCcuY29sdW1uLWNhcmRzLWxpc3QnKTtcclxuXHJcblx0XHRcdFx0Ly8gTmF0aXZlIEhUTUw1IERyYWcgYW5kIERyb3AgaGFuZGxlcnMgb24gZHJvcHpvbmVcclxuXHRcdFx0XHQkY2FyZHNMaXN0Lm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnYmFja2dyb3VuZCcsICcjZTJlOGYwJyk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0JGNhcmRzTGlzdC5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdiYWNrZ3JvdW5kJywgJycpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdCRjYXJkc0xpc3Qub24oJ2Ryb3AnLCBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ2JhY2tncm91bmQnLCAnJyk7XHJcblx0XHRcdFx0XHRjb25zdCB0YXNrSWQgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcclxuXHRcdFx0XHRcdGNvbnN0IHRhcmdldENvbHVtbklkID0gY29sLmlkO1xyXG5cclxuXHRcdFx0XHRcdGlmICh0YXNrSWQgJiYgdGFyZ2V0Q29sdW1uSWQpIHtcclxuXHRcdFx0XHRcdFx0Ly8gT3B0aW1pc3RpYyBET00gdXBkYXRlXHJcblx0XHRcdFx0XHRcdGNvbnN0IHNhZmVUYXNrSWQgPSB0eXBlb2YgQ1NTICE9PSAndW5kZWZpbmVkJyAmJiBDU1MuZXNjYXBlID8gQ1NTLmVzY2FwZSh0YXNrSWQpIDogU3RyaW5nKHRhc2tJZCkucmVwbGFjZSgvW1wiXFxcXF0vZywgJ1xcXFwkJicpO1xyXG5cdFx0XHRcdFx0XHRjb25zdCAkZHJhZ2dlZENhcmQgPSAkKGBbZGF0YS10YXNrPVwiJHtzYWZlVGFza0lkfVwiXWApO1xyXG5cdFx0XHRcdFx0XHRpZiAoJGRyYWdnZWRDYXJkLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdFx0XHQkY2FyZHNMaXN0LmFwcGVuZCgkZHJhZ2dlZENhcmQpO1xyXG5cdFx0XHRcdFx0XHRcdHNlbGYudXBkYXRlQm9hcmRDb2x1bW5Db3VudHMoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0Ly8gUGVyc2lzdCB0byBiYWNrZW5kXHJcblx0XHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0XHRcdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby51cGRhdGVfd29ya19wYWNrYWdlX3N0YXR1cycsXHJcblx0XHRcdFx0XHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdFx0XHRcdFx0dGFza19uYW1lOiB0YXNrSWQsXHJcblx0XHRcdFx0XHRcdFx0XHRuZXdfY29sdW1uOiB0YXJnZXRDb2x1bW5JZCxcclxuXHRcdFx0XHRcdFx0XHRcdGdyb3VwX2J5OiBzZWxmLmJvYXJkR3JvdXBCeVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnV29yayBwYWNrYWdlIHN0YXR1cyB1cGRhdGVkIHRvIHswfScsIFt0YXJnZXRDb2x1bW5JZF0pLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHQvLyBQb3B1bGF0ZSBjYXJkc1xyXG5cdFx0XHRcdChjb2wuY2FyZHMgfHwgW10pLmZvckVhY2goY2FyZCA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCBhbGxvd2VkVHlwZXMgPSBbJ3Rhc2snLCAnbWlsZXN0b25lJywgJ3BoYXNlJywgJ2lzc3VlJywgJ2NsYXNoJ107XHJcblx0XHRcdFx0XHRjb25zdCByYXdUeXBlID0gU3RyaW5nKGNhcmQudHlwZSB8fCAndGFzaycpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdFx0XHRjb25zdCBzYWZlVHlwZSA9IGFsbG93ZWRUeXBlcy5pbmNsdWRlcyhyYXdUeXBlKSA/IHJhd1R5cGUgOiAndGFzayc7XHJcblx0XHRcdFx0XHRjb25zdCBwaWxsQ2xzID0gYHdwLXBpbGwtJHtzYWZlVHlwZX1gO1xyXG5cclxuXHRcdFx0XHRcdGNvbnN0IGFsbG93ZWRQcmlvcml0aWVzID0gWydsb3cnLCAnbm9ybWFsJywgJ2hpZ2gnLCAndXJnZW50J107XHJcblx0XHRcdFx0XHRjb25zdCByYXdQcmlvcml0eSA9IFN0cmluZyhjYXJkLnByaW9yaXR5IHx8ICdub3JtYWwnKS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRcdFx0Y29uc3Qgc2FmZVByaW9yaXR5ID0gYWxsb3dlZFByaW9yaXRpZXMuaW5jbHVkZXMocmF3UHJpb3JpdHkpID8gcmF3UHJpb3JpdHkgOiAnbm9ybWFsJztcclxuXHRcdFx0XHRcdGNvbnN0IHByaW9yaXR5Q2xzID0gYHByaW9yaXR5LSR7c2FmZVByaW9yaXR5fWA7XHJcblxyXG5cdFx0XHRcdFx0Y29uc3QgYXNzaWduZWVOYW1lID0gU3RyaW5nKGNhcmQuYXNzaWduZWVfbmFtZSB8fCAnJykudHJpbSgpO1xyXG5cdFx0XHRcdFx0Y29uc3QgYXNzaWduZWVJbml0aWFscyA9IGFzc2lnbmVlTmFtZSA/IGFzc2lnbmVlTmFtZS5zcGxpdCgnICcpLm1hcChuID0+IG5bMF0pLmpvaW4oJycpLnN1YnN0cmluZygwLCAyKS50b1VwcGVyQ2FzZSgpIDogJyc7XHJcblx0XHRcdFx0XHRjb25zdCBhc3NpZ25lZUh0bWwgPSBhc3NpZ25lZU5hbWUgPyBgXHJcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiY2FyZC1hc3NpZ25lZS1waWxsXCIgdGl0bGU9XCIke2VzY2FwZUh0bWwoYXNzaWduZWVOYW1lKX1cIj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImFzc2lnbmVlLWF2YXRhclwiPiR7ZXNjYXBlSHRtbChhc3NpZ25lZUluaXRpYWxzKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJhc3NpZ25lZS10ZXh0XCI+JHtlc2NhcGVIdG1sKGFzc2lnbmVlTmFtZSl9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHQ8L3NwYW4+XHJcblx0XHRcdFx0XHRgIDogJyc7XHJcblxyXG5cdFx0XHRcdFx0Y29uc3QgJGNhcmQgPSAkKGBcclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImthbmJhbi1jYXJkXCIgZHJhZ2dhYmxlPVwidHJ1ZVwiIGRhdGEtdGFzaz1cIiR7ZXNjYXBlSHRtbChjYXJkLmlkKX1cIj5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwia2FuYmFuLWNhcmQtaGVhZFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2VzY2FwZUh0bWwoY2FyZC50eXBlKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImNhcmQtcHJpb3JpdHkgJHtwcmlvcml0eUNsc31cIj4ke2VzY2FwZUh0bWwoY2FyZC5wcmlvcml0eSl9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY2FyZC10aXRsZVwiPiR7ZXNjYXBlSHRtbChjYXJkLnN1YmplY3QpfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY2FyZC1mb290XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImNhcmQtZGF0ZS1iYWRnZVwiPiR7SUNPTlMuY2FsZW5kYXJ9IDxzcGFuPiR7ZXNjYXBlSHRtbChjYXJkLmV4cF9lbmRfZGF0ZSB8fCAnLS0nKX08L3NwYW4+PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHRcdFx0JHthc3NpZ25lZUh0bWx9XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0YCk7XHJcblxyXG5cdFx0XHRcdFx0JGNhcmQub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdFx0XHRcdGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9wbGFpbicsIGNhcmQuaWQpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0JGNhcmQub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRzZWxmLm9wZW5Xb3JrUGFja2FnZUluc3BlY3RvcihjYXJkKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdCRjYXJkc0xpc3QuYXBwZW5kKCRjYXJkKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0JHdyYXBwZXIuYXBwZW5kKCRjb2wpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlQm9hcmRDb2x1bW5Db3VudHMoKSB7XHJcblx0XHQkKCcua2FuYmFuLWNvbHVtbicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjb25zdCBjb3VudCA9ICQodGhpcykuZmluZCgnLmthbmJhbi1jYXJkJykubGVuZ3RoO1xyXG5cdFx0XHQkKHRoaXMpLmZpbmQoJy5jb2wtY2FyZC1jb3VudCcpLnRleHQoY291bnQpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0Ly8gVEFCIDQ6IEdBTlRUIFNDSEVEVUxFIFRJTUVMSU5FXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlckdhbnR0Q2hhcnQoKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8ubGlzdF93b3JrX3BhY2thZ2VzJyxcclxuXHRcdFx0YXJnczogeyBwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LCBmaWx0ZXJfa2V5OiAnYWxsX29wZW4nIH1cclxuXHRcdH0pLnRoZW4ociA9PiB7XHJcblx0XHRcdGNvbnN0IGl0ZW1zID0gci5tZXNzYWdlIHx8IFtdO1xyXG5cdFx0XHRjb25zdCAkdGFyZ2V0ID0gJCgnI2ZyYXBwZS1nYW50dC10YXJnZXQnKTtcclxuXHRcdFx0JHRhcmdldC5lbXB0eSgpO1xyXG5cclxuXHRcdFx0aWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdCR0YXJnZXQuaHRtbChgXHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZW1wdHktc3RhdGUtY2FyZFwiPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZW1wdHktc3RhdGUtaWNvbiBtYi0yIHRleHQtbXV0ZWRcIj4ke0lDT05TLmNhbGVuZGFyfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8aDQgc3R5bGU9XCJmb250LXdlaWdodDo2MDA7IGZvbnQtc2l6ZToxNXB4OyBjb2xvcjojMTExODI3OyBtYXJnaW46MCAwIDZweCAwO1wiPk5vIFNjaGVkdWxlZCBUYXNrczwvaDQ+XHJcblx0XHRcdFx0XHRcdDxwIGNsYXNzPVwidGV4dC1tdXRlZCBtYi0zXCIgc3R5bGU9XCJmb250LXNpemU6MTNweDsgbWF4LXdpZHRoOiAzNjBweDtcIj5Xb3JrIHBhY2thZ2VzIHdpdGggc3RhcnQgYW5kIGR1ZSBkYXRlcyB3aWxsIGFwcGVhciBoZXJlIG9uIGFuIGludGVyYWN0aXZlIHNjaGVkdWxlIHRpbWVsaW5lLjwvcD5cclxuXHRcdFx0XHRcdFx0PGJ1dHRvbiBjbGFzcz1cImJ0bi10b3BiYXItcHJpbWFyeSBhY3Rpb24tcXVpY2stYWRkXCIgZGF0YS10eXBlPVwiVGFza1wiPlxyXG5cdFx0XHRcdFx0XHRcdDxzcGFuPisgQWRkIFRhc2s8L3NwYW4+XHJcblx0XHRcdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0YCk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBGb3JtYXQgdGFza3MgZm9yIEdhbnR0XHJcblx0XHRcdGNvbnN0IG5vd1N0ciA9IChmcmFwcGUuZGF0ZXRpbWUgJiYgZnJhcHBlLmRhdGV0aW1lLmdldF90b2RheSkgPyBmcmFwcGUuZGF0ZXRpbWUuZ2V0X3RvZGF5KCkgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXTtcclxuXHRcdFx0Y29uc3QgZ2FudHRUYXNrcyA9IGl0ZW1zLm1hcChpdCA9PiB7XHJcblx0XHRcdFx0Y29uc3Qgc3RhcnQgPSBpdC5leHBfc3RhcnRfZGF0ZSB8fCBub3dTdHI7XHJcblx0XHRcdFx0Y29uc3QgZW5kID0gaXQuZXhwX2VuZF9kYXRlIHx8ICgoZnJhcHBlLmRhdGV0aW1lICYmIGZyYXBwZS5kYXRldGltZS5hZGRfZGF5cykgPyBmcmFwcGUuZGF0ZXRpbWUuYWRkX2RheXMoc3RhcnQsIDcpIDogc3RhcnQpO1xyXG5cdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRpZDogaXQuaWQsXHJcblx0XHRcdFx0XHRuYW1lOiBgWyR7aXQudHlwZX1dICR7aXQuc3ViamVjdH1gLFxyXG5cdFx0XHRcdFx0c3RhcnQ6IHN0YXJ0LFxyXG5cdFx0XHRcdFx0ZW5kOiBlbmQsXHJcblx0XHRcdFx0XHRwcm9ncmVzczogaXQucHJvZ3Jlc3MgfHwgMCxcclxuXHRcdFx0XHRcdGN1c3RvbV9jbGFzczogYGJhci0ke2l0LnR5cGUudG9Mb3dlckNhc2UoKX1gXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRpZiAod2luZG93LkdhbnR0KSB7XHJcblx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdHNlbGYuZ2FudHRDaGFydCA9IG5ldyB3aW5kb3cuR2FudHQoJyNmcmFwcGUtZ2FudHQtdGFyZ2V0JywgZ2FudHRUYXNrcywge1xyXG5cdFx0XHRcdFx0XHR2aWV3X21vZGVzOiBbJ1F1YXJ0ZXIgRGF5JywgJ0hhbGYgRGF5JywgJ0RheScsICdXZWVrJywgJ01vbnRoJ10sXHJcblx0XHRcdFx0XHRcdHZpZXdfbW9kZTogJ0RheScsXHJcblx0XHRcdFx0XHRcdGRhdGVfZm9ybWF0OiAnWVlZWS1NTS1ERCcsXHJcblx0XHRcdFx0XHRcdG9uX2NsaWNrOiAodGFzaykgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHdwID0gaXRlbXMuZmluZChpID0+IGkuaWQgPT09IHRhc2suaWQpO1xyXG5cdFx0XHRcdFx0XHRcdGlmICh3cCkgc2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3Iod3ApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHQkKCcuZ2FudHQtc2NhbGUtZ3JvdXAgLmJ0bi1nYW50dC1zY2FsZScpLm9mZignY2xpY2snKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdCQoJy5nYW50dC1zY2FsZS1ncm91cCAuYnRuLWdhbnR0LXNjYWxlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0XHRcdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0XHRcdFx0Y29uc3Qgc2NhbGUgPSAkKHRoaXMpLmRhdGEoJ3NjYWxlJyk7XHJcblx0XHRcdFx0XHRcdGlmIChzZWxmLmdhbnR0Q2hhcnQgJiYgc2VsZi5nYW50dENoYXJ0LmNoYW5nZV92aWV3X21vZGUpIHtcclxuXHRcdFx0XHRcdFx0XHRzZWxmLmdhbnR0Q2hhcnQuY2hhbmdlX3ZpZXdfbW9kZShzY2FsZSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdGNvbnNvbGUud2FybignRnJhcHBlIEdhbnR0IGluc3RhbnRpYXRpb24gZmFpbGVkLCByZW5kZXJpbmcgY3VzdG9tIHRpbWVsaW5lIGZhbGxiYWNrJywgZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBDdXN0b20gSW50ZXJhY3RpdmUgVGltZWxpbmUgVmlzdWFsaXphdGlvbiBGYWxsYmFja1xyXG5cdFx0XHRsZXQgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiY3VzdG9tLWdhbnR0LXRhYmxlIHRhYmxlLXJlc3BvbnNpdmVcIj48dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1jb25kZW5zZWRcIj48dGhlYWQ+PHRyPjx0aCB3aWR0aD1cIjMwJVwiPldvcmsgUGFja2FnZTwvdGg+PHRoIHdpZHRoPVwiMTUlXCI+U3RhcnQgRGF0ZTwvdGg+PHRoIHdpZHRoPVwiMTUlXCI+RHVlIERhdGU8L3RoPjx0aCB3aWR0aD1cIjQwJVwiPlRpbWVsaW5lIFByb2dyZXNzPC90aD48L3RyPjwvdGhlYWQ+PHRib2R5Pic7XHJcblx0XHRcdGNvbnN0IGFsbG93ZWRUeXBlcyA9IFsndGFzaycsICdtaWxlc3RvbmUnLCAncGhhc2UnLCAnaXNzdWUnLCAnY2xhc2gnXTtcclxuXHRcdFx0aXRlbXMuZm9yRWFjaChpdCA9PiB7XHJcblx0XHRcdFx0Y29uc3QgcmF3VHlwZSA9IFN0cmluZyhpdC50eXBlIHx8ICd0YXNrJykudG9Mb3dlckNhc2UoKTtcclxuXHRcdFx0XHRjb25zdCBzYWZlVHlwZSA9IGFsbG93ZWRUeXBlcy5pbmNsdWRlcyhyYXdUeXBlKSA/IHJhd1R5cGUgOiAndGFzayc7XHJcblx0XHRcdFx0Y29uc3QgcGlsbENscyA9IGB3cC1waWxsLSR7c2FmZVR5cGV9YDtcclxuXHRcdFx0XHRjb25zdCBwcm9ncmVzcyA9IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgaXQucHJvZ3Jlc3MgfHwgKGl0LnN0YXR1cyA9PT0gJ0NvbXBsZXRlZCcgPyAxMDAgOiAyNSkpKTtcclxuXHRcdFx0XHRodG1sICs9IGBcclxuXHRcdFx0XHRcdDx0ciBjbGFzcz1cIndwLWdhbnR0LXJvd1wiIGRhdGEtaWQ9XCIke2VzY2FwZUh0bWwoaXQuaWQpfVwiIHN0eWxlPVwiY3Vyc29yOiBwb2ludGVyO1wiPlxyXG5cdFx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2VzY2FwZUh0bWwoaXQudHlwZSl9PC9zcGFuPiA8c3Ryb25nPiR7ZXNjYXBlSHRtbChpdC5zdWJqZWN0KX08L3N0cm9uZz48L3RkPlxyXG5cdFx0XHRcdFx0XHQ8dGQ+PHNtYWxsPiR7ZXNjYXBlSHRtbChpdC5leHBfc3RhcnRfZGF0ZSB8fCAnLS0nKX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGw+JHtlc2NhcGVIdG1sKGl0LmV4cF9lbmRfZGF0ZSB8fCAnLS0nKX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIiBzdHlsZT1cIm1hcmdpbjogMDsgaGVpZ2h0OiAxOHB4OyBib3JkZXItcmFkaXVzOiA5cHg7IGJhY2tncm91bmQ6ICNlMmU4ZjA7XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1zdHJpcGVkXCIgcm9sZT1cInByb2dyZXNzYmFyXCIgc3R5bGU9XCJ3aWR0aDogJHtwcm9ncmVzc30lOyBiYWNrZ3JvdW5kOiAjMDI4NGM3O1wiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQke3Byb2dyZXNzfSVcclxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0PC90cj5cclxuXHRcdFx0XHRgO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0aHRtbCArPSAnPC90Ym9keT48L3RhYmxlPjwvZGl2Pic7XHJcblx0XHRcdCR0YXJnZXQuaHRtbChodG1sKTtcclxuXHJcblx0XHRcdCR0YXJnZXQuZmluZCgnLndwLWdhbnR0LXJvdycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRjb25zdCBpZCA9ICQodGhpcykuZGF0YSgnaWQnKTtcclxuXHRcdFx0XHRjb25zdCB3cCA9IGl0ZW1zLmZpbmQoaSA9PiBpLmlkID09PSBpZCk7XHJcblx0XHRcdFx0aWYgKHdwKSBzZWxmLm9wZW5Xb3JrUGFja2FnZUluc3BlY3Rvcih3cCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0Ly8gVEFCIDU6IEJDRiAyLVBBTkUgQ09PUkRJTkFUSU9OIFZJRVdFUiAoU2NyZWVuc2hvdCA0KVxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRyZW5kZXJCY2ZWaWV3ZXIodGFyZ2V0TW9kZWwgPSBudWxsKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHJcblx0XHQvLyAxLiBVcGRhdGUgM0QgQklNIFZpZXdlciBJZnJhbWUgVVJMIHdpdGggcHJvamVjdCBhbmQgdGFyZ2V0IG1vZGVsXHJcblx0XHRjb25zdCAkaWZyYW1lID0gJCgnI2lmcmFtZS1iY2YtM2Qtdmlld2VyJyk7XHJcblx0XHRjb25zdCB0YXJnZXRQYXJhbSA9IHRhcmdldE1vZGVsID8gYCZtb2RlbD0ke2VuY29kZVVSSUNvbXBvbmVudCh0YXJnZXRNb2RlbCl9YCA6ICcnO1xyXG5cdFx0Y29uc3QgZXhwZWN0ZWRTcmMgPSBgL2FwcC9iaW0tdmlld2VyP3Byb2plY3Q9JHtlbmNvZGVVUklDb21wb25lbnQoc2VsZi5jdXJyZW50UHJvamVjdCl9JHt0YXJnZXRQYXJhbX1gO1xyXG5cdFx0aWYgKCRpZnJhbWUubGVuZ3RoICYmICRpZnJhbWUuYXR0cignc3JjJykgIT09IGV4cGVjdGVkU3JjKSB7XHJcblx0XHRcdCRpZnJhbWUuYXR0cignc3JjJywgZXhwZWN0ZWRTcmMpO1xyXG5cdFx0fVxyXG5cdFx0JCgnI2J0bi1iY2Ytb3Blbi1mdWxsc2NyZWVuJykuYXR0cignaHJlZicsIGV4cGVjdGVkU3JjKTtcclxuXHJcblx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmdldF9iY2ZfY29vcmRpbmF0aW9uX2RhdGEnLFxyXG5cdFx0XHRhcmdzOiB7IHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QgfVxyXG5cdFx0fSkudGhlbihyID0+IHtcclxuXHRcdFx0Y29uc3QgZGF0YSA9IHIubWVzc2FnZSB8fCB7IG1vZGVsczogW10sIHRvcGljczogW10gfTtcclxuXHRcdFx0Y29uc3QgbW9kZWxzID0gZGF0YS5tb2RlbHMgfHwgW107XHJcblx0XHRcdGNvbnN0IHRvcGljcyA9IGRhdGEudG9waWNzIHx8IFtdO1xyXG5cclxuXHRcdFx0Ly8gMi4gUG9wdWxhdGUgU3BhdGlhbCBNb2RlbCBUcmVlXHJcblx0XHRcdGNvbnN0ICR0cmVlID0gJCgnI2JjZi1tb2RlbHMtdHJlZScpO1xyXG5cdFx0XHQkdHJlZS5lbXB0eSgpO1xyXG5cclxuXHRcdFx0aWYgKG1vZGVscy5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHQkdHJlZS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkIHAtMyB0ZXh0LWNlbnRlclwiPjxzbWFsbD5ObyBJRkMgbW9kZWxzIHVwbG9hZGVkIHlldC48YnI+Q2xpY2sgPHN0cm9uZz4rIFVwbG9hZCBJRkM8L3N0cm9uZz4gYWJvdmUgdG8gYWRkIG9uZS48L3NtYWxsPjwvZGl2PicpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdG1vZGVscy5mb3JFYWNoKG0gPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgaXNDaGVja2VkID0gdGFyZ2V0TW9kZWwgPyAobS5uYW1lID09PSB0YXJnZXRNb2RlbCB8fCBtLm1vZGVsX25hbWUgPT09IHRhcmdldE1vZGVsKSA6IHRydWU7XHJcblx0XHRcdFx0XHRjb25zdCBzYWZlTmFtZSA9IGVzY2FwZUh0bWwobS5uYW1lKTtcclxuXHRcdFx0XHRcdGNvbnN0IHNhZmVEaXNjaXBsaW5lID0gZXNjYXBlSHRtbChtLmRpc2NpcGxpbmUgfHwgJ0lGQycpO1xyXG5cdFx0XHRcdFx0Y29uc3Qgc2FmZU1vZGVsTmFtZSA9IGVzY2FwZUh0bWwobS5tb2RlbF9uYW1lIHx8IG0ubmFtZSk7XHJcblx0XHRcdFx0XHQkdHJlZS5hcHBlbmQoYFxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibW9kZWwtdHJlZS1yb3cgcC0yIGZsZXgtYmV0d2VlblwiIHN0eWxlPVwiYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmMWY1Zjk7IGJvcmRlci1yYWRpdXM6IDZweDtcIj5cclxuXHRcdFx0XHRcdFx0XHQ8bGFiZWwgc3R5bGU9XCJmb250LXdlaWdodDogbm9ybWFsOyBmb250LXNpemU6IDEyLjVweDsgY3Vyc29yOiBwb2ludGVyOyBtYXJnaW46IDA7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNnB4O1wiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwibW9kZWwtdHJlZS1jYlwiICR7aXNDaGVja2VkID8gJ2NoZWNrZWQnIDogJyd9IGRhdGEtbW9kZWw9XCIke3NhZmVOYW1lfVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJiYWRnZVwiIHN0eWxlPVwiYmFja2dyb3VuZDojZTBlN2ZmOyBjb2xvcjojNDMzOGNhOyBmb250LXNpemU6MTBweDsgZm9udC13ZWlnaHQ6NjAwO1wiPiR7c2FmZURpc2NpcGxpbmV9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4+JHtzYWZlTW9kZWxOYW1lfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImFjdGlvbi1mb2N1cy1tb2RlbCB0ZXh0LW11dGVkIG1sLTFcIiBkYXRhLW1vZGVsPVwiJHtzYWZlTmFtZX1cIiB0aXRsZT1cIlZpZXcgdGhpcyBtb2RlbFwiPiR7SUNPTlMuZXllfTwvYT5cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRgKTtcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0JHRyZWUuZmluZCgnLm1vZGVsLXRyZWUtY2InKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0Y29uc3QgbU5hbWUgPSAkKHRoaXMpLmRhdGEoJ21vZGVsJyk7XHJcblx0XHRcdFx0XHRpZiAoJCh0aGlzKS5pcygnOmNoZWNrZWQnKSkge1xyXG5cdFx0XHRcdFx0XHQkKCcjaWZyYW1lLWJjZi0zZC12aWV3ZXInKS5hdHRyKCdzcmMnLCBgL2FwcC9iaW0tdmlld2VyP3Byb2plY3Q9JHtlbmNvZGVVUklDb21wb25lbnQoc2VsZi5jdXJyZW50UHJvamVjdCl9Jm1vZGVsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG1OYW1lKX1gKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0JHRyZWUuZmluZCgnLmFjdGlvbi1mb2N1cy1tb2RlbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdGNvbnN0IG1OYW1lID0gJCh0aGlzKS5kYXRhKCdtb2RlbCcpO1xyXG5cdFx0XHRcdFx0JHRyZWUuZmluZCgnLm1vZGVsLXRyZWUtY2InKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0XHRcdFx0JHRyZWUuZmluZChgLm1vZGVsLXRyZWUtY2JbZGF0YS1tb2RlbD1cIiR7bU5hbWV9XCJdYCkucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG5cdFx0XHRcdFx0JCgnI2lmcmFtZS1iY2YtM2Qtdmlld2VyJykuYXR0cignc3JjJywgYC9hcHAvYmltLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfSZtb2RlbD0ke2VuY29kZVVSSUNvbXBvbmVudChtTmFtZSl9YCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIDMuIFBvcHVsYXRlIEJDRiBUb3BpY3NcclxuXHRcdFx0JCgnI2JjZi10b3BpYy1jb3VudCcpLnRleHQodG9waWNzLmxlbmd0aCk7XHJcblx0XHRcdGNvbnN0ICRzdHJlYW0gPSAkKCcjYmNmLWNhcmRzLWNvbnRhaW5lcicpO1xyXG5cdFx0XHQkc3RyZWFtLmVtcHR5KCk7XHJcblxyXG5cdFx0XHRpZiAodG9waWNzLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdCRzdHJlYW0uYXBwZW5kKCc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBwLTQgdGV4dC1jZW50ZXJcIj48c21hbGw+Tm8gQkNGIHRvcGljcyBsb2dnZWQgZm9yIHRoaXMgcHJvamVjdC48L3NtYWxsPjwvZGl2PicpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRvcGljcy5mb3JFYWNoKHRvcCA9PiB7XHJcblx0XHRcdFx0XHQkc3RyZWFtLmFwcGVuZChgXHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJiY2YtdG9waWMtY2FyZCBtYi0yXCI+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXgtYmV0d2VlbiBtYi0xXCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cInN0YXR1cy13YXJuaW5nLXBpbGxcIj4ke2VzY2FwZUh0bWwodG9wLnRvcGljX3R5cGUpfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwidGV4dC1tdXRlZFwiIHN0eWxlPVwiZm9udC1zaXplOjExcHg7XCI+JHtlc2NhcGVIdG1sKHRvcC5zdGF0dXMpfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZm9udC13ZWlnaHQtbWVkaXVtXCIgc3R5bGU9XCJmb250LXNpemU6MTNweDsgY29sb3I6IzExMTgyNztcIj4ke2VzY2FwZUh0bWwodG9wLnRpdGxlKX08L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0xIG10LTFcIiBzdHlsZT1cImZvbnQtc2l6ZToxMS41cHg7XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3Bhbj4ke0lDT05TLmNsb2NrfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuPiR7ZXNjYXBlSHRtbCh0b3AuY3JlYXRpb24gPyB0b3AuY3JlYXRpb24uc3BsaXQoJyAnKVswXSA6ICctLScpfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibXgtMVwiPlx1MjAyMjwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuPiR7ZXNjYXBlSHRtbCh0b3AuYXNzaWduZWRfdG8gfHwgJ1VuYXNzaWduZWQnKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0YCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8vIFRBQiA4OiBQUk9KRUNUIERPQ1VNRU5UUyBUUkVFICYgVVBMT0FEXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlckRvY3VtZW50c1RyZWUoKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8uZ2V0X3Byb2plY3RfZG9jdW1lbnRfdHJlZScsXHJcblx0XHRcdGFyZ3M6IHsgcHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCB9XHJcblx0XHR9KS50aGVuKHIgPT4ge1xyXG5cdFx0XHRjb25zdCBmb2xkZXJzID0gci5tZXNzYWdlIHx8IFtdO1xyXG5cdFx0XHRjb25zdCAkY29udCA9ICQoJyNkb2N1bWVudC1mb2xkZXJzLWNvbnRhaW5lcicpO1xyXG5cdFx0XHQkY29udC5lbXB0eSgpO1xyXG5cclxuXHRcdFx0Y29uc3QgZm9sZGVyQ29uZmlnID0ge1xyXG5cdFx0XHRcdCcwMSBDb250cmFjdHMgJiBOVFAnOiB7IGljb246IElDT05TLmZpbGUsIGJnOiAnI2VmZjZmZicsIGNvbG9yOiAnIzI1NjNlYicgfSxcclxuXHRcdFx0XHQnMDIgRHJhd2luZ3MgJiBTcGVjcyc6IHsgaWNvbjogSUNPTlMubGlzdCwgYmc6ICcjZjVmM2ZmJywgY29sb3I6ICcjN2MzYWVkJyB9LFxyXG5cdFx0XHRcdCcwMyBCSU0gTW9kZWxzJzogeyBpY29uOiBJQ09OUy5jdWJlLCBiZzogJyNmZmZiZWInLCBjb2xvcjogJyNkOTc3MDYnIH0sXHJcblx0XHRcdFx0JzA0IEJPUSAmIEVzdGltYXRlcyc6IHsgaWNvbjogSUNPTlMudGFibGUsIGJnOiAnI2VjZmRmNScsIGNvbG9yOiAnIzA1OTY2OScgfSxcclxuXHRcdFx0XHQnMDUgU2l0ZSBNZWRpYSc6IHsgaWNvbjogSUNPTlMuY2FtZXJhLCBiZzogJyNmZmYxZjInLCBjb2xvcjogJyNlMTFkNDgnIH1cclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdGZvbGRlcnMuZm9yRWFjaChmID0+IHtcclxuXHRcdFx0XHRjb25zdCBjZmcgPSBmb2xkZXJDb25maWdbZi5mb2xkZXJfbmFtZV0gfHwgeyBpY29uOiBJQ09OUy5mb2xkZXIsIGJnOiAnI2YxZjVmOScsIGNvbG9yOiAnIzQ3NTQ2NycgfTtcclxuXHRcdFx0XHRjb25zdCBzYWZlRm9sZGVyTmFtZSA9IGVzY2FwZUh0bWwoZi5mb2xkZXJfbmFtZSk7XHJcblx0XHRcdFx0Y29uc3QgJGJveCA9ICQoYFxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImRvYy1mb2xkZXItY2FyZFwiPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZm9sZGVyLWhlYWRlclwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmb2xkZXItaWNvbi1waWxsXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAke2NmZy5iZ307IGNvbG9yOiAke2NmZy5jb2xvcn07XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQke2NmZy5pY29ufVxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmb2xkZXItdGl0bGUtYm94XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImZvbGRlci1uYW1lXCI+JHtzYWZlRm9sZGVyTmFtZX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImZvbGRlci1jb3VudC1iYWRnZVwiPiR7Zi5maWxlcyA/IGYuZmlsZXMubGVuZ3RoIDogMH0gaXRlbXM8L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZm9sZGVyLWZpbGVzLWxpc3RcIj5cclxuXHRcdFx0XHRcdFx0XHQ8IS0tIEZpbGVzIC0tPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdGApO1xyXG5cclxuXHRcdFx0XHRjb25zdCAkZkxpc3QgPSAkYm94LmZpbmQoJy5mb2xkZXItZmlsZXMtbGlzdCcpO1xyXG5cdFx0XHRcdGlmICghZi5maWxlcyB8fCBmLmZpbGVzLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdFx0JGZMaXN0LmFwcGVuZCgnPGRpdiBjbGFzcz1cInRleHQtbXV0ZWQgcC0zIHRleHQtY2VudGVyXCIgc3R5bGU9XCJmb250LXNpemU6MTJweDtcIj5ObyBmaWxlcyBpbiBmb2xkZXI8L2Rpdj4nKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Zi5maWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xyXG5cdFx0XHRcdFx0XHRjb25zdCBzYWZlUm91dGUgPSBlc2NhcGVIdG1sKGZpbGUucm91dGVfdGFyZ2V0IHx8ICcnKTtcclxuXHRcdFx0XHRcdFx0Y29uc3Qgc2FmZVVybCA9IGVzY2FwZUh0bWwoZmlsZS5maWxlX3VybCB8fCAnJyk7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHNhZmVNb2RlbElkID0gZXNjYXBlSHRtbChmaWxlLm1vZGVsX2lkIHx8IGZpbGUuaWQgfHwgJycpO1xyXG5cdFx0XHRcdFx0XHRjb25zdCBzYWZlRmlsZU5hbWUgPSBlc2NhcGVIdG1sKGZpbGUuZmlsZV9uYW1lIHx8ICcnKTtcclxuXHRcdFx0XHRcdFx0Y29uc3Qgc2FmZUJhZGdlID0gZXNjYXBlSHRtbChmaWxlLmJhZGdlIHx8ICdGaWxlJyk7XHJcblx0XHRcdFx0XHRcdCRmTGlzdC5hcHBlbmQoYFxyXG5cdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImZpbGUtaXRlbS1saW5rXCIgZGF0YS1yb3V0ZT1cIiR7c2FmZVJvdXRlfVwiIGRhdGEtdXJsPVwiJHtzYWZlVXJsfVwiIGRhdGEtbW9kZWwtaWQ9XCIke3NhZmVNb2RlbElkfVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZpbGUtaXRlbS1sZWZ0XCI+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwidGV4dC1tdXRlZCBtci0xXCI+JHtJQ09OUy5maWxlfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJmaWxlLW5hbWUtdGV4dFwiPiR7c2FmZUZpbGVOYW1lfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJmb2xkZXItY291bnQtYmFkZ2VcIj4ke3NhZmVCYWRnZX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PC9hPlxyXG5cdFx0XHRcdFx0XHRgKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0JGNvbnQuYXBwZW5kKCRib3gpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdCRjb250LmZpbmQoJy5maWxlLWl0ZW0tbGluaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRjb25zdCByb3V0ZSA9ICQodGhpcykuZGF0YSgncm91dGUnKTtcclxuXHRcdFx0XHRjb25zdCB1cmwgPSAkKHRoaXMpLmRhdGEoJ3VybCcpO1xyXG5cdFx0XHRcdGNvbnN0IG1vZGVsSWQgPSAkKHRoaXMpLmRhdGEoJ21vZGVsLWlkJyk7XHJcblx0XHRcdFx0aWYgKHJvdXRlID09PSAnYmltLXZpZXdlcicgfHwgKHVybCAmJiB1cmwuZW5kc1dpdGgoJy5pZmMnKSkpIHtcclxuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdiY2YnLCB7IG1vZGVsOiBtb2RlbElkIH0pO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAocm91dGUgPT09ICdkd2ctdmlld2VyJyB8fCAodXJsICYmICh1cmwuZW5kc1dpdGgoJy5kd2cnKSB8fCB1cmwuZW5kc1dpdGgoJy5keGYnKSkpKSB7XHJcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYignY2FkJywgeyBmaWxlOiB1cmwgfSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ3BkZi10YWtlb2ZmJyB8fCAodXJsICYmIHVybC5lbmRzV2l0aCgnLnBkZicpKSkge1xyXG5cdFx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3BkZicsIHsgZmlsZTogdXJsIH0pO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAodXJsKSB7XHJcblx0XHRcdFx0XHR3aW5kb3cub3Blbih1cmwsICdfYmxhbmsnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRoYW5kbGVVcGxvYWRlZEZpbGUoZmlsZURvYykge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRjb25zdCBleHQgPSAoZmlsZURvYy5maWxlX25hbWUgfHwgJycpLnNwbGl0KCcuJykucG9wKCkudG9Mb3dlckNhc2UoKTtcclxuXHRcdGlmIChleHQgPT09ICdpZmMnKSB7XHJcblx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ0luZ2VzdGluZyBJRkMgbW9kZWwgaW50byAzRCBCSU0gZGF0YWJhc2UuLi4nKSwgaW5kaWNhdG9yOiAnYmx1ZScgfSk7XHJcblx0XHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmJpbS5hcGkuY3JlYXRlX21vZGVsX2Zyb21faWZjJyxcclxuXHRcdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0XHRmaWxlX3VybDogZmlsZURvYy5maWxlX3VybCxcclxuXHRcdFx0XHRcdGZpbGVfbmFtZTogZmlsZURvYy5maWxlX25hbWUsXHJcblx0XHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxyXG5cdFx0XHRcdFx0bW9kZWxfbmFtZTogZmlsZURvYy5maWxlX25hbWUucmVwbGFjZSgvXFwuW14vLl0rJC8sICcnKSxcclxuXHRcdFx0XHRcdGRpc2NpcGxpbmU6ICdBcmNoaXRlY3R1cmUnXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KS50aGVuKHJlcyA9PiB7XHJcblx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnQklNIE1vZGVsIGluZ2VzdGVkIHN1Y2Nlc3NmdWxseSEnKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xyXG5cdFx0XHRcdHNlbGYucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xyXG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdiY2YnLCB7IG1vZGVsOiByZXMubWVzc2FnZSA/IHJlcy5tZXNzYWdlLm5hbWUgOiBudWxsIH0pO1xyXG5cdFx0XHR9KS5jYXRjaChlcnIgPT4ge1xyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBwYXJzZSBJRkM6JywgZXJyKTtcclxuXHRcdFx0XHRmcmFwcGUubXNncHJpbnQoX18oJ1VwbG9hZGVkIGZpbGUgc2F2ZWQsIGJ1dCBJRkMgcGFyc2luZyBlbmNvdW50ZXJlZCBhbiBpc3N1ZTogJykgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSk7XHJcblx0XHRcdFx0c2VsZi5yZW5kZXJEb2N1bWVudHNUcmVlKCk7XHJcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2JjZicpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ0ZpbGUgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5LicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XHJcblx0XHRcdHNlbGYucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0b3BlbkZpbGVVcGxvYWREaWFsb2coKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdG5ldyBmcmFwcGUudWkuRmlsZVVwbG9hZGVyKHtcclxuXHRcdFx0ZG9jdHlwZTogJ1Byb2plY3QnLFxyXG5cdFx0XHRkb2NuYW1lOiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxyXG5cdFx0XHRmb2xkZXI6ICdIb21lJyxcclxuXHRcdFx0b25fc3VjY2VzcyhmaWxlX2RvYykge1xyXG5cdFx0XHRcdHNlbGYuaGFuZGxlVXBsb2FkZWRGaWxlKGZpbGVfZG9jKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvcGVuQmNmVXBsb2FkRGlhbG9nKCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRuZXcgZnJhcHBlLnVpLkZpbGVVcGxvYWRlcih7XHJcblx0XHRcdGRvY3R5cGU6ICdQcm9qZWN0JyxcclxuXHRcdFx0ZG9jbmFtZTogc2VsZi5jdXJyZW50UHJvamVjdCxcclxuXHRcdFx0Zm9sZGVyOiAnSG9tZScsXHJcblx0XHRcdHJlc3RyaWN0aW9uczoge1xyXG5cdFx0XHRcdGFsbG93ZWRfZmlsZV90eXBlczogWycuaWZjJ11cclxuXHRcdFx0fSxcclxuXHRcdFx0b25fc3VjY2VzcyhmaWxlX2RvYykge1xyXG5cdFx0XHRcdHNlbGYuaGFuZGxlVXBsb2FkZWRGaWxlKGZpbGVfZG9jKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0Ly8gVEFCIDk6IE1FRVRJTkdTICYgVE9PTEJPWCBUQUxLU1xyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRyZW5kZXJNZWV0aW5nc1RhYigpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YSB8fCB7fTtcclxuXHRcdGNvbnN0IG1lZXRpbmdzID0gZGF0YS5tZWV0aW5ncyB8fCBbXTtcclxuXHRcdGNvbnN0ICRjb250ID0gJCgnI21lZXRpbmdzLXRhYi1jb250YWluZXInKTtcclxuXHRcdCRjb250LmVtcHR5KCk7XHJcblxyXG5cdFx0aWYgKG1lZXRpbmdzLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHQkY29udC5odG1sKGBcclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZW1wdHktc3RhdGUtY2FyZFwiPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImVtcHR5LXN0YXRlLWljb24gbWItMiB0ZXh0LW11dGVkXCI+JHtJQ09OUy5jYWxlbmRhcn08L2Rpdj5cclxuXHRcdFx0XHRcdDxoNCBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDsgZm9udC1zaXplOjE1cHg7IGNvbG9yOiMxMTE4Mjc7IG1hcmdpbjowIDAgNnB4IDA7XCI+Tm8gQnJpZWZpbmdzIFNjaGVkdWxlZDwvaDQ+XHJcblx0XHRcdFx0XHQ8cCBjbGFzcz1cInRleHQtbXV0ZWQgbWItM1wiIHN0eWxlPVwiZm9udC1zaXplOjEzcHg7IG1heC13aWR0aDogMzYwcHg7XCI+Tm8gY29vcmRpbmF0aW9uIG1lZXRpbmdzIG9yIHRvb2xib3ggdGFsa3MgcmVjb3JkZWQgeWV0IGZvciB0aGlzIHByb2plY3QuPC9wPlxyXG5cdFx0XHRcdFx0PGJ1dHRvbiBjbGFzcz1cImJ0bi10b3BiYXItcHJpbWFyeVwiIGlkPVwiYnRuLXNjaGVkdWxlLW1lZXRpbmctZW1wdHlcIj5cclxuXHRcdFx0XHRcdFx0PHNwYW4+KyBOZXcgTWVldGluZzwvc3Bhbj5cclxuXHRcdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRgKTtcclxuXHRcdFx0JGNvbnQuZmluZCgnI2J0bi1zY2hlZHVsZS1tZWV0aW5nLWVtcHR5Jykub24oJ2NsaWNrJywgKCkgPT4gc2VsZi5vcGVuU2NoZWR1bGVNZWV0aW5nRGlhbG9nKCkpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bWVldGluZ3MuZm9yRWFjaChtID0+IHtcclxuXHRcdFx0Y29uc3QgZG9jVHlwZSA9IG0uZG9jdHlwZSB8fCAobS50eXBlID09PSAnVG9vbGJveCBUYWxrJyA/ICdUb29sYm94IFRhbGsnIDogJ0V2ZW50Jyk7XHJcblx0XHRcdGNvbnN0IGlzVG9vbGJveCA9IG0udHlwZSA9PT0gJ1Rvb2xib3ggVGFsayc7XHJcblx0XHRcdGNvbnN0IHBpbGxDbHMgPSBpc1Rvb2xib3ggPyAnbWVldGluZy1waWxsLXRvb2xib3gnIDogJ21lZXRpbmctcGlsbC1jb29yZCc7XHJcblxyXG5cdFx0XHQkY29udC5hcHBlbmQoYFxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtZWV0aW5nLWNhcmQtc3VyZmFjZVwiPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctY2FyZC1tYWluXCI+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJtZWV0aW5nLWNhcmQtaGVhZGVyXCI+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZWV0aW5nLWJhZGdlICR7cGlsbENsc31cIj4ke2VzY2FwZUh0bWwobS50eXBlKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PGg0IGNsYXNzPVwibWVldGluZy10aXRsZVwiPiR7ZXNjYXBlSHRtbChtLnRpdGxlKX08L2g0PlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctbWV0YS1yb3dcIj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1ldGEtaXRlbVwiPiR7SUNPTlMuY2FsZW5kYXJ9IDxzcGFuPiR7ZXNjYXBlSHRtbChtLmRhdGUpfTwvc3Bhbj48L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZXRhLWRpdmlkZXJcIj5cdTIwMjI8L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZXRhLWl0ZW1cIj4ke0lDT05TLnVzZXJ9IDxzcGFuPkNvbmR1Y3RvcjogJHtlc2NhcGVIdG1sKG0uaG9zdCB8fCAnU2l0ZSBDb29yZGluYXRvcicpfTwvc3Bhbj48L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZXRhLWRpdmlkZXJcIj5cdTIwMjI8L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZXRhLWl0ZW1cIj4ke0lDT05TLnVzZXJzfSA8c3Bhbj5BdHRlbmRlZXM6ICR7ZXNjYXBlSHRtbChtLnBhcnRpY2lwYW50cyB8fCAwKX08L3NwYW4+PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctY2FyZC1hY3Rpb25cIj5cclxuXHRcdFx0XHRcdFx0PGJ1dHRvbiBjbGFzcz1cImJ0bi10b3BiYXItYWN0aW9uIGJ0bi1zbSBidG4tdmlldy1tZWV0aW5nLWRvY1wiIGRhdGEtZG9jdHlwZT1cIiR7ZXNjYXBlSHRtbChkb2NUeXBlKX1cIiBkYXRhLW5hbWU9XCIke2VzY2FwZUh0bWwobS5uYW1lKX1cIj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1yLTFcIj4ke0lDT05TLmV5ZX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4+VmlldyBEb2M8L3NwYW4+XHJcblx0XHRcdFx0XHRcdDwvYnV0dG9uPlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JGNvbnQuZmluZCgnLmJ0bi12aWV3LW1lZXRpbmctZG9jJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjb25zdCBkdCA9ICQodGhpcykuZGF0YSgnZG9jdHlwZScpIHx8ICdFdmVudCc7XHJcblx0XHRcdGNvbnN0IG5tID0gJCh0aGlzKS5kYXRhKCduYW1lJyk7XHJcblx0XHRcdGZyYXBwZS5zZXRfcm91dGUoJ0Zvcm0nLCBkdCwgbm0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvcGVuU2NoZWR1bGVNZWV0aW5nRGlhbG9nKCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xyXG5cdFx0XHR0aXRsZTogX18oJ1NjaGVkdWxlIENvb3JkaW5hdGlvbiBNZWV0aW5nIG9yIFNhZmV0eSBCcmllZmluZycpLFxyXG5cdFx0XHRmaWVsZHM6IFtcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ21lZXRpbmdfdHlwZScsIGxhYmVsOiBfXygnVHlwZScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnVG9vbGJveCBUYWxrXFxuQ29vcmRpbmF0aW9uIE1lZXRpbmcnLCBkZWZhdWx0OiAnVG9vbGJveCBUYWxrJyB9LFxyXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnc3ViamVjdCcsIGxhYmVsOiBfXygnVG9waWMgLyBTdWJqZWN0JyksIGZpZWxkdHlwZTogJ0RhdGEnLCByZXFkOiAxIH0sXHJcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdkYXRlJywgbGFiZWw6IF9fKCdEYXRlJyksIGZpZWxkdHlwZTogJ0RhdGUnLCBkZWZhdWx0OiAoZnJhcHBlLmRhdGV0aW1lICYmIGZyYXBwZS5kYXRldGltZS5nZXRfdG9kYXkpID8gZnJhcHBlLmRhdGV0aW1lLmdldF90b2RheSgpIDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sIHJlcWQ6IDEgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2NvbmR1Y3RvcicsIGxhYmVsOiBfXygnQ29uZHVjdG9yIChTYWZldHkgT2ZmaWNlciAvIEhvc3QpJyksIGZpZWxkdHlwZTogJ0RhdGEnLCBkZWZhdWx0OiBmcmFwcGUuc2Vzc2lvbi51c2VyX2Z1bGxuYW1lIHx8IGZyYXBwZS5zZXNzaW9uLnVzZXIgfHwgJ0FkbWluaXN0cmF0b3InLCByZXFkOiAxIH1cclxuXHRcdFx0XSxcclxuXHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdDcmVhdGUgTWVldGluZycpLFxyXG5cdFx0XHRwcmltYXJ5X2FjdGlvbih2YWx1ZXMpIHtcclxuXHRcdFx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5zY2hlZHVsZV9wcm9qZWN0X21lZXRpbmcnLFxyXG5cdFx0XHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxyXG5cdFx0XHRcdFx0XHRtZWV0aW5nX3R5cGU6IHZhbHVlcy5tZWV0aW5nX3R5cGUsXHJcblx0XHRcdFx0XHRcdHN1YmplY3Q6IHZhbHVlcy5zdWJqZWN0LFxyXG5cdFx0XHRcdFx0XHRkYXRlOiB2YWx1ZXMuZGF0ZSxcclxuXHRcdFx0XHRcdFx0Y29uZHVjdG9yOiB2YWx1ZXMuY29uZHVjdG9yXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRkLmhpZGUoKTtcclxuXHRcdFx0XHRcdGNvbnN0IGxhYmVsID0gdmFsdWVzLm1lZXRpbmdfdHlwZSA9PT0gJ1Rvb2xib3ggVGFsaycgPyBfXygnVG9vbGJveCB0YWxrIHNjaGVkdWxlZC4nKSA6IF9fKCdDb29yZGluYXRpb24gbWVldGluZyBzY2hlZHVsZWQuJyk7XHJcblx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0RGF0YShzZWxmLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdFx0XHRcdGlmIChzZWxmLmN1cnJlbnRUYWIgPT09ICdtZWV0aW5ncycpIHtcclxuXHRcdFx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiBzZWxmLnJlbmRlck1lZXRpbmdzVGFiKCksIDE1MCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkuY2F0Y2goZXJyID0+IHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNjaGVkdWxpbmcgbWVldGluZzonLCBlcnIpO1xyXG5cdFx0XHRcdFx0ZnJhcHBlLm1zZ3ByaW50KF9fKCdFcnJvcjogJykgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0ZC5zaG93KCk7XHJcblx0fVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0Ly8gVEFCIDEwOiBNRU1CRVJTXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlck1lbWJlcnNUYWJsZSgpIHtcclxuXHRcdGNvbnN0ICR0Ym9keSA9ICQoJyNtZW1iZXJzLXRhYmxlLWJvZHknKTtcclxuXHRcdCR0Ym9keS5lbXB0eSgpO1xyXG5cdFx0Y29uc3QgbWVtYmVycyA9ICh0aGlzLnByb2plY3RPdmVydmlld0RhdGEgJiYgdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhLm1lbWJlcnMpIHx8IFtdO1xyXG5cclxuXHRcdGlmIChtZW1iZXJzLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHQkdGJvZHkuYXBwZW5kKCc8dHI+PHRkIGNvbHNwYW49XCI0XCIgY2xhc3M9XCJ0ZXh0LWNlbnRlciB0ZXh0LW11dGVkIHAtNFwiPjxzbWFsbD5ObyB0ZWFtIG1lbWJlcnMgYXNzaWduZWQgdG8gdGhpcyBwcm9qZWN0Ljwvc21hbGw+PC90ZD48L3RyPicpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bWVtYmVycy5mb3JFYWNoKG0gPT4ge1xyXG5cdFx0XHRjb25zdCBmdWxsTmFtZSA9IG0uZnVsbF9uYW1lIHx8IG0udXNlciB8fCAnTWVtYmVyJztcclxuXHRcdFx0Y29uc3QgaW5pdGlhbHMgPSBmdWxsTmFtZS5zcGxpdCgnICcpLm1hcChuID0+IG5bMF0pLmpvaW4oJycpLnN1YnN0cmluZygwLCAyKS50b1VwcGVyQ2FzZSgpIHx8ICdNQic7XHJcblx0XHRcdCR0Ym9keS5hcHBlbmQoYFxyXG5cdFx0XHRcdDx0ciBjbGFzcz1cIm1lbWJlci10YWJsZS1yb3dcIj5cclxuXHRcdFx0XHRcdDx0ZD5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lbWJlci1jZWxsXCI+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZW1iZXItYXZhdGFyLWNpcmNsZVwiPiR7ZXNjYXBlSHRtbChpbml0aWFscyl9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibWVtYmVyLW5hbWUgZm9udC13ZWlnaHQtbWVkaXVtXCI+JHtlc2NhcGVIdG1sKGZ1bGxOYW1lKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke2VzY2FwZUh0bWwobS51c2VyKX08L3NwYW4+PC90ZD5cclxuXHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cIm1lbWJlci1yb2xlLXBpbGxcIj4ke2VzY2FwZUh0bWwobS5yb2xlIHx8ICdNZW1iZXInKX08L3NwYW4+PC90ZD5cclxuXHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cInN0YXR1cy1hY3RpdmUtcGlsbFwiPjxzcGFuIGNsYXNzPVwic3RhdHVzLWRvdC1ncmVlblwiPjwvc3Bhbj4gQWN0aXZlPC9zcGFuPjwvdGQ+XHJcblx0XHRcdFx0PC90cj5cclxuXHRcdFx0YCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgMTE6IFNFVFRJTkdTXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlclNldHRpbmdzVGFiKCkge1xyXG5cdFx0aWYgKCF0aGlzLnByb2plY3RPdmVydmlld0RhdGEpIHJldHVybjtcclxuXHRcdGNvbnN0IHN1bW1hcnkgPSB0aGlzLnByb2plY3RPdmVydmlld0RhdGEuc3VtbWFyeSB8fCB7fTtcclxuXHRcdCQoJyNzZXR0aW5nLXByb2plY3QtbmFtZScpLnZhbChzdW1tYXJ5LnByb2plY3RfbmFtZSB8fCAnJyk7XHJcblx0XHQkKCcjc2V0dGluZy1zdGF0dXMtbmFycmF0aXZlJykudmFsKHN1bW1hcnkuc3RhdHVzX25hcnJhdGl2ZSB8fCAnJyk7XHJcblx0XHQkKCcjc2V0dGluZy1pcy10ZW1wbGF0ZScpLnByb3AoJ2NoZWNrZWQnLCAhIXN1bW1hcnkuaXNfdGVtcGxhdGUpO1xyXG5cdFx0JCgnI3NldHRpbmctaXMtZmF2b3JpdGUnKS5wcm9wKCdjaGVja2VkJywgISFzdW1tYXJ5LmlzX2Zhdm9yaXRlKTtcclxuXHR9XHJcblxyXG5cdHNhdmVQcm9qZWN0U2V0dGluZ3MoKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGNvbnN0IHNldHRpbmdzID0ge1xyXG5cdFx0XHRwcm9qZWN0X25hbWU6ICQoJyNzZXR0aW5nLXByb2plY3QtbmFtZScpLnZhbCgpLFxyXG5cdFx0XHRzdGF0dXNfbmFycmF0aXZlOiAkKCcjc2V0dGluZy1zdGF0dXMtbmFycmF0aXZlJykudmFsKCksXHJcblx0XHRcdGlzX3RlbXBsYXRlOiAkKCcjc2V0dGluZy1pcy10ZW1wbGF0ZScpLmlzKCc6Y2hlY2tlZCcpID8gMSA6IDAsXHJcblx0XHRcdGlzX2Zhdm9yaXRlOiAkKCcjc2V0dGluZy1pcy1mYXZvcml0ZScpLmlzKCc6Y2hlY2tlZCcpID8gMSA6IDBcclxuXHRcdH07XHJcblxyXG5cdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby51cGRhdGVfcHJvamVjdF9zZXR0aW5ncycsXHJcblx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxyXG5cdFx0XHRcdHNldHRpbmdzX2pzb246IEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKVxyXG5cdFx0XHR9XHJcblx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCBzZXR0aW5ncyBzYXZlZCBzdWNjZXNzZnVsbHkuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcclxuXHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHRvZ2dsZUFyY2hpdmVQcm9qZWN0KCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRjb25zdCBwcm9qID0gdGhpcy5hbGxQcm9qZWN0cy5maW5kKHAgPT4gcC5uYW1lID09PSB0aGlzLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdGNvbnN0IGN1cnJlbnRBY3RpdmUgPSBwcm9qID8gcHJvai5pc19hY3RpdmUgOiAnWWVzJztcclxuXHRcdGNvbnN0IG5leHRBY3RpdmUgPSBjdXJyZW50QWN0aXZlID09PSAnWWVzJyA/ICdObycgOiAnWWVzJztcclxuXHRcdGNvbnN0IGFjdGlvbldvcmQgPSBuZXh0QWN0aXZlID09PSAnTm8nID8gX18oJ0FyY2hpdmUnKSA6IF9fKCdSZXN0b3JlJyk7XHJcblxyXG5cdFx0ZnJhcHBlLmNvbmZpcm0oX18oJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byB7MH0gdGhpcyBwcm9qZWN0PycsIFthY3Rpb25Xb3JkLnRvTG93ZXJDYXNlKCldKSwgKCkgPT4ge1xyXG5cdFx0XHRzZWxmLnVwZGF0ZVByb2plY3RTZXR0aW5nc0ZpZWxkKHNlbGYuY3VycmVudFByb2plY3QsIHsgaXNfYWN0aXZlOiBuZXh0QWN0aXZlIH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1Byb2plY3QgezB9ZCBzdWNjZXNzZnVsbHkuJywgW2FjdGlvbldvcmQudG9Mb3dlckNhc2UoKV0pLCBpbmRpY2F0b3I6ICdvcmFuZ2UnIH0pO1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Y29uZmlybURlbGV0ZVByb2plY3QoKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGZyYXBwZS5jb25maXJtKF9fKCdcdTI2QTBcdUZFMEYgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIFBFUk1BTkVOVExZIERFTEVURSB7MH0/IFRoaXMgY2Fubm90IGJlIHVuZG9uZS4nLCBbc2VsZi5jdXJyZW50UHJvamVjdF0pLCAoKSA9PiB7XHJcblx0XHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50LmRlbGV0ZScsXHJcblx0XHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdFx0ZG9jdHlwZTogJ1Byb2plY3QnLFxyXG5cdFx0XHRcdFx0bmFtZTogc2VsZi5jdXJyZW50UHJvamVjdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCBkZWxldGVkLicpLCBpbmRpY2F0b3I6ICdyZWQnIH0pO1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8vIFFVSUNLIENSRUFURSBNT0RBTCAoU2NyZWVuc2hvdCA1KVxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRvcGVuUXVpY2tDcmVhdGVNb2RhbCh0eXBlKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGlmICh0eXBlID09PSAncHJvamVjdCcgfHwgdHlwZSA9PT0gJ3N1YnByb2plY3QnKSB7XHJcblx0XHRcdGNvbnN0IGlzU3ViID0gdHlwZSA9PT0gJ3N1YnByb2plY3QnO1xyXG5cdFx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xyXG5cdFx0XHRcdHRpdGxlOiBpc1N1YiA/IF9fKCdBZGQgU3VicHJvamVjdCcpIDogX18oJ0FkZCBOZXcgUHJvamVjdCcpLFxyXG5cdFx0XHRcdGZpZWxkczogW1xyXG5cdFx0XHRcdFx0eyBmaWVsZG5hbWU6ICdwcm9qZWN0X25hbWUnLCBsYWJlbDogX18oJ1Byb2plY3QgTmFtZScpLCBmaWVsZHR5cGU6ICdEYXRhJywgcmVxZDogMSB9LFxyXG5cdFx0XHRcdFx0eyBmaWVsZG5hbWU6ICdmcm9tX3RlbXBsYXRlJywgbGFiZWw6IF9fKCdDbG9uZSBmcm9tIFRlbXBsYXRlJyksIGZpZWxkdHlwZTogJ0xpbmsnLCBvcHRpb25zOiAnUHJvamVjdCcgfVxyXG5cdFx0XHRcdF0sXHJcblx0XHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdDcmVhdGUgUHJvamVjdCcpLFxyXG5cdFx0XHRcdHByaW1hcnlfYWN0aW9uKHZhbHVlcykge1xyXG5cdFx0XHRcdFx0aWYgKHZhbHVlcy5mcm9tX3RlbXBsYXRlKSB7XHJcblx0XHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0XHRcdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5jbG9uZV9wcm9qZWN0X2Zyb21fdGVtcGxhdGUnLFxyXG5cdFx0XHRcdFx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRcdFx0XHRcdHRlbXBsYXRlX3Byb2plY3Q6IHZhbHVlcy5mcm9tX3RlbXBsYXRlLFxyXG5cdFx0XHRcdFx0XHRcdFx0bmV3X3Byb2plY3RfbmFtZTogdmFsdWVzLnByb2plY3RfbmFtZVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSkudGhlbihyID0+IHtcclxuXHRcdFx0XHRcdFx0XHRkLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHRpZiAoaXNTdWIpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQoci5tZXNzYWdlLm5ld19wcm9qZWN0LCB7IHBhcmVudF9wcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0IH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0c2VsZi5zZWxlY3RQcm9qZWN0KHIubWVzc2FnZS5uZXdfcHJvamVjdCk7XHJcblx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRcdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuaW5zZXJ0JyxcclxuXHRcdFx0XHRcdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0XHRcdFx0XHRkb2M6IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZG9jdHlwZTogJ1Byb2plY3QnLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRwcm9qZWN0X25hbWU6IHZhbHVlcy5wcm9qZWN0X25hbWUsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHN0YXR1czogJ09wZW4nLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRpc19hY3RpdmU6ICdZZXMnLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRwYXJlbnRfcHJvamVjdDogaXNTdWIgPyBzZWxmLmN1cnJlbnRQcm9qZWN0IDogbnVsbFxyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSkudGhlbihyID0+IHtcclxuXHRcdFx0XHRcdFx0XHRkLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmICghaXNTdWIpIHNlbGYuc2VsZWN0UHJvamVjdChyLm1lc3NhZ2UubmFtZSk7XHJcblx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdGQuc2hvdygpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHR5cGUgPT09ICd1c2VyJykge1xyXG5cdFx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xyXG5cdFx0XHRcdHRpdGxlOiBfXygnSW52aXRlIFByb2plY3QgTWVtYmVyJyksXHJcblx0XHRcdFx0ZmllbGRzOiBbXHJcblx0XHRcdFx0XHR7IGZpZWxkbmFtZTogJ2VtYWlsJywgbGFiZWw6IF9fKCdVc2VyIEVtYWlsJyksIGZpZWxkdHlwZTogJ0RhdGEnLCByZXFkOiAxIH0sXHJcblx0XHRcdFx0XHR7IGZpZWxkbmFtZTogJ3JvbGUnLCBsYWJlbDogX18oJ1Byb2plY3QgUm9sZScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnUHJvamVjdCBNYW5hZ2VyXFxuQXJjaGl0ZWN0XFxuU3RydWN0dXJhbCBFbmdpbmVlclxcbk1FUCBDb29yZGluYXRvclxcblNhZmV0eSBPZmZpY2VyXFxuUUMgSW5zcGVjdG9yJywgZGVmYXVsdDogJ1Byb2plY3QgTWFuYWdlcicgfVxyXG5cdFx0XHRcdF0sXHJcblx0XHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdBZGQgTWVtYmVyJyksXHJcblx0XHRcdFx0cHJpbWFyeV9hY3Rpb24odmFsdWVzKSB7XHJcblx0XHRcdFx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuaW5zZXJ0JyxcclxuXHRcdFx0XHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdFx0XHRcdGRvYzoge1xyXG5cdFx0XHRcdFx0XHRcdFx0ZG9jdHlwZTogJ1Byb2plY3QgVXNlcicsXHJcblx0XHRcdFx0XHRcdFx0XHRwYXJlbnQ6IHNlbGYuY3VycmVudFByb2plY3QsXHJcblx0XHRcdFx0XHRcdFx0XHRwYXJlbnRmaWVsZDogJ3VzZXJzJyxcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudHR5cGU6ICdQcm9qZWN0JyxcclxuXHRcdFx0XHRcdFx0XHRcdHVzZXI6IHZhbHVlcy5lbWFpbFxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRcdGQuaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdVc2VyIGludml0ZWQgdG8gcHJvamVjdC4nKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xyXG5cdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0RGF0YShzZWxmLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdGQuc2hvdygpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gV29yayBwYWNrYWdlIHF1aWNrLWNyZWF0ZVxyXG5cdFx0Y29uc3QgZCA9IG5ldyBmcmFwcGUudWkuRGlhbG9nKHtcclxuXHRcdFx0dGl0bGU6IF9fKCdDcmVhdGUgezB9JywgW3R5cGVdKSxcclxuXHRcdFx0ZmllbGRzOiBbXHJcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdzdWJqZWN0JywgbGFiZWw6IF9fKCdTdWJqZWN0IC8gVGl0bGUnKSwgZmllbGR0eXBlOiAnRGF0YScsIHJlcWQ6IDEgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3ByaW9yaXR5JywgbGFiZWw6IF9fKCdQcmlvcml0eScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnTG93XFxuTm9ybWFsXFxuSGlnaFxcblVyZ2VudCcsIGRlZmF1bHQ6ICdOb3JtYWwnIH0sXHJcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdkdWVfZGF0ZScsIGxhYmVsOiBfXygnRHVlIERhdGUnKSwgZmllbGR0eXBlOiAnRGF0ZScgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2Rlc2NyaXB0aW9uJywgbGFiZWw6IF9fKCdEZXNjcmlwdGlvbicpLCBmaWVsZHR5cGU6ICdTbWFsbCBUZXh0JyB9XHJcblx0XHRcdF0sXHJcblx0XHRcdHByaW1hcnlfYWN0aW9uX2xhYmVsOiBfXygnQ3JlYXRlJyksXHJcblx0XHRcdHByaW1hcnlfYWN0aW9uKHZhbHVlcykge1xyXG5cdFx0XHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLnF1aWNrX2NyZWF0ZV93b3JrX3BhY2thZ2UnLFxyXG5cdFx0XHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxyXG5cdFx0XHRcdFx0XHR3cF90eXBlOiB0eXBlLFxyXG5cdFx0XHRcdFx0XHRzdWJqZWN0OiB2YWx1ZXMuc3ViamVjdCxcclxuXHRcdFx0XHRcdFx0cHJpb3JpdHk6IHZhbHVlcy5wcmlvcml0eSxcclxuXHRcdFx0XHRcdFx0ZHVlX2RhdGU6IHZhbHVlcy5kdWVfZGF0ZSxcclxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHZhbHVlcy5kZXNjcmlwdGlvblxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0ZC5oaWRlKCk7XHJcblx0XHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdXb3JrIHBhY2thZ2UgY3JlYXRlZC4nKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xyXG5cdFx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ3dvcmstcGFja2FnZXMnKSBzZWxmLnJlbmRlcldvcmtQYWNrYWdlcygpO1xyXG5cdFx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2JvYXJkcycpIHNlbGYucmVuZGVyS2FuYmFuQm9hcmQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRkLnNob3coKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVByb2plY3RIZWFsdGhTdGF0dXMobmV3SGVhbHRoKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdHRoaXMudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQodGhpcy5jdXJyZW50UHJvamVjdCwgeyBoZWFsdGhfc3RhdHVzOiBuZXdIZWFsdGggfSkudGhlbigoKSA9PiB7XHJcblx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1Byb2plY3QgaGVhbHRoIHNldCB0byB7MH0nLCBbbmV3SGVhbHRoXSksIGluZGljYXRvcjogJ2JsdWUnIH0pO1xyXG5cdFx0XHRpZiAoc2VsZi5wYWdlICYmIHNlbGYucGFnZS5zZXRfaW5kaWNhdG9yKSB7XHJcblx0XHRcdFx0Y29uc3QgY29sb3IgPSBuZXdIZWFsdGggPT09ICdPbiBUcmFjaycgPyAnZ3JlZW4nIDogKG5ld0hlYWx0aCA9PT0gJ0F0IFJpc2snID8gJ29yYW5nZScgOiAncmVkJyk7XHJcblx0XHRcdFx0c2VsZi5wYWdlLnNldF9pbmRpY2F0b3IobmV3SGVhbHRoLCBjb2xvcik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQocHJvamVjdE5hbWUsIHBhdGNoRGljdCkge1xyXG5cdFx0cmV0dXJuIGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8udXBkYXRlX3Byb2plY3Rfc2V0dGluZ3MnLFxyXG5cdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0cHJvamVjdDogcHJvamVjdE5hbWUsXHJcblx0XHRcdFx0c2V0dGluZ3NfanNvbjogSlNPTi5zdHJpbmdpZnkocGF0Y2hEaWN0KVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGVkaXRTdGF0dXNOYXJyYXRpdmVQcm9tcHQoKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGZyYXBwZS5wcm9tcHQoXHJcblx0XHRcdHtcclxuXHRcdFx0XHRmaWVsZG5hbWU6ICduYXJyYXRpdmUnLFxyXG5cdFx0XHRcdGxhYmVsOiBfXygnU3RhdHVzIERlc2NyaXB0aW9uIC8gQ29tbWVudGFyeScpLFxyXG5cdFx0XHRcdGZpZWxkdHlwZTogJ1NtYWxsIFRleHQnLFxyXG5cdFx0XHRcdGRlZmF1bHQ6ICQoJyNvdmVydmlldy1zdGF0dXMtbmFycmF0aXZlJykudGV4dCgpXHJcblx0XHRcdH0sXHJcblx0XHRcdGZ1bmN0aW9uICh2YWx1ZXMpIHtcclxuXHRcdFx0XHRzZWxmLnVwZGF0ZVByb2plY3RTZXR0aW5nc0ZpZWxkKHNlbGYuY3VycmVudFByb2plY3QsIHsgc3RhdHVzX25hcnJhdGl2ZTogdmFsdWVzLm5hcnJhdGl2ZSB9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdCQoJyNvdmVydmlldy1zdGF0dXMtbmFycmF0aXZlJykudGV4dCh2YWx1ZXMubmFycmF0aXZlKTtcclxuXHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1N0YXR1cyBub3RlIHVwZGF0ZWQuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0X18oJ0VkaXQgSGVhbHRoIFN0YXR1cyBEZXNjcmlwdGlvbicpLFxyXG5cdFx0XHRfXygnU2F2ZScpXHJcblx0XHQpO1xyXG5cdH1cclxufVxyXG5cclxud2luZG93LlByb2plY3RTdHVkaW9BcHAgPSBQcm9qZWN0U3R1ZGlvQXBwO1xyXG5leHBvcnQgZGVmYXVsdCBQcm9qZWN0U3R1ZGlvQXBwOyJdLAogICJtYXBwaW5ncyI6ICI7QUFHQSxJQUFNLFFBQVE7QUFBQSxFQUNiLFVBQVU7QUFBQSxFQUNWLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxFQUNQLEtBQUs7QUFBQSxFQUNMLE9BQU87QUFBQSxFQUNQLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxFQUNSLE9BQU87QUFBQSxFQUNQLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLFlBQVk7QUFBQSxFQUNaLE9BQU87QUFBQSxFQUNQLFFBQVE7QUFBQSxFQUNSLE1BQU07QUFBQSxFQUNOLFdBQVc7QUFDWjtBQUVBLFNBQVMsV0FBVyxLQUFLO0FBQ3hCLE1BQUksT0FBTyxLQUFNLFFBQU87QUFDeEIsTUFBSSxPQUFPLFVBQVUsT0FBTyxTQUFTLE9BQU8sTUFBTSxhQUFhO0FBQzlELFdBQU8sT0FBTyxNQUFNLFlBQVksT0FBTyxHQUFHLENBQUM7QUFBQSxFQUM1QztBQUNBLFNBQU8sT0FBTyxHQUFHLEVBQ2YsUUFBUSxNQUFNLE9BQU8sRUFDckIsUUFBUSxNQUFNLE1BQU0sRUFDcEIsUUFBUSxNQUFNLE1BQU0sRUFDcEIsUUFBUSxNQUFNLFFBQVEsRUFDdEIsUUFBUSxNQUFNLE9BQU87QUFDeEI7QUFFQSxJQUFNLG1CQUFOLE1BQXVCO0FBQUEsRUFDdEIsWUFBWSxPQUFPLENBQUMsR0FBRztBQUN0QixTQUFLLE9BQU87QUFDWixTQUFLLE9BQU8sS0FBSyxRQUFTLE9BQU8sWUFBWSxPQUFPLFNBQVMsUUFBVSxPQUFPLGFBQWEsT0FBTyxVQUFVLFFBQVEsT0FBTyxVQUFVLEtBQUs7QUFDMUksU0FBSyxpQkFBaUI7QUFDdEIsU0FBSyxjQUFjLENBQUM7QUFDcEIsU0FBSyxhQUFhO0FBQ2xCLFNBQUssa0JBQWtC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
