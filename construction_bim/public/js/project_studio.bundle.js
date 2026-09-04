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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3Byb2plY3Rfc3R1ZGlvX2FwcC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gUHJvamVjdCBTdHVkaW8gRnJvbnRlbmQgQXBwbGljYXRpb24gKE9wZW5Qcm9qZWN0IEJJTSBQYXJpdHkpXHJcbi8vIE1hbmFnZXMgQWxsIFByb2plY3RzIEh1YiwgUHJvamVjdCBIb21lLCBXb3JrIFBhY2thZ2VzLCBCb2FyZHMsIEJDRiwgRG9jdW1lbnRzLCBTZXR0aW5nc1xyXG5cclxuY29uc3QgSUNPTlMgPSB7XHJcblx0Y2FsZW5kYXI6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCI0XCIgcng9XCIyXCIvPjxsaW5lIHgxPVwiMTZcIiB5MT1cIjJcIiB4Mj1cIjE2XCIgeTI9XCI2XCIvPjxsaW5lIHgxPVwiOFwiIHkxPVwiMlwiIHgyPVwiOFwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjEwXCIgeDI9XCIyMVwiIHkyPVwiMTBcIi8+PC9zdmc+YCxcclxuXHR1c2VyOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxM1wiIGhlaWdodD1cIjEzXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyXCIvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiN1wiIHI9XCI0XCIvPjwvc3ZnPmAsXHJcblx0dXNlcnM6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTE2IDIxdi0yYTQgNCAwIDAgMC00LTRINmE0IDQgMCAwIDAtNCA0djJcIi8+PGNpcmNsZSBjeD1cIjlcIiBjeT1cIjdcIiByPVwiNFwiLz48cGF0aCBkPVwiTTIyIDIxdi0yYTQgNCAwIDAgMC0zLTMuODdcIi8+PHBhdGggZD1cIk0xNiAzLjEzYTQgNCAwIDAgMSAwIDcuNzVcIi8+PC9zdmc+YCxcclxuXHRleWU6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTIgMTJzMy03IDEwLTcgMTAgNyAxMCA3LTMgNy0xMCA3LTEwLTctMTAtN1pcIi8+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIvPjwvc3ZnPmAsXHJcblx0Y2xvY2s6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCIvPjxwb2x5bGluZSBwb2ludHM9XCIxMiA2IDEyIDEyIDE2IDE0XCIvPjwvc3ZnPmAsXHJcblx0ZmlsZTogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNzVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiPjxwYXRoIGQ9XCJNMTQuNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWNy41TDE0LjUgMnpcIi8+PHBvbHlsaW5lIHBvaW50cz1cIjE0IDIgMTQgOCAyMCA4XCIvPjwvc3ZnPmAsXHJcblx0Zm9sZGVyOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PHBhdGggZD1cIk00IDIwaDE2YTIgMiAwIDAgMCAyLTJWOGEyIDIgMCAwIDAtMi0yaC03LjkzYTIgMiAwIDAgMS0xLjY2LS45bC0uODItMS4yQTIgMiAwIDAgMCA3LjkzIDNINGEyIDIgMCAwIDAtMiAydjEzYzAgMS4xLjkgMiAyIDJaXCIvPjwvc3ZnPmAsXHJcblx0Y2hlY2s6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cG9seWxpbmUgcG9pbnRzPVwiMjAgNiA5IDE3IDQgMTJcIi8+PC9zdmc+YCxcclxuXHRsaXN0OiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGxpbmUgeDE9XCI4XCIgeTE9XCI2XCIgeDI9XCIyMVwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjhcIiB5MT1cIjEyXCIgeDI9XCIyMVwiIHkyPVwiMTJcIi8+PGxpbmUgeDE9XCI4XCIgeTE9XCIxOFwiIHgyPVwiMjFcIiB5Mj1cIjE4XCIvPjxsaW5lIHgxPVwiM1wiIHkxPVwiNlwiIHgyPVwiMy4wMVwiIHkyPVwiNlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjEyXCIgeDI9XCIzLjAxXCIgeTI9XCIxMlwiLz48bGluZSB4MT1cIjNcIiB5MT1cIjE4XCIgeDI9XCIzLjAxXCIgeTI9XCIxOFwiLz48L3N2Zz5gLFxyXG5cdGN1YmU6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE1XCIgaGVpZ2h0PVwiMTVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTIxIDE2VjhhMiAyIDAgMCAwLTEtMS43M2wtNy00YTIgMiAwIDAgMC0yIDBsLTcgNEEyIDIgMCAwIDAgMyA4djhhMiAyIDAgMCAwIDEgMS43M2w3IDRhMiAyIDAgMCAwIDIgMGw3LTRBMiAyIDAgMCAwIDIxIDE2elwiLz48cG9seWxpbmUgcG9pbnRzPVwiMy4yOSA3IDEyIDEyIDIwLjcxIDdcIi8+PGxpbmUgeDE9XCIxMlwiIHkxPVwiMjJcIiB4Mj1cIjEyXCIgeTI9XCIxMlwiLz48L3N2Zz5gLFxyXG5cdGluZm86IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCIvPjxsaW5lIHgxPVwiMTJcIiB5MT1cIjE2XCIgeDI9XCIxMlwiIHkyPVwiMTJcIi8+PGxpbmUgeDE9XCIxMlwiIHkxPVwiOFwiIHgyPVwiMTIuMDFcIiB5Mj1cIjhcIi8+PC9zdmc+YCxcclxuXHRhcnJvd1JpZ2h0OiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgd2lkdGg9XCIxM1wiIGhlaWdodD1cIjEzXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS43NVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+PGxpbmUgeDE9XCI1XCIgeTE9XCIxMlwiIHgyPVwiMTlcIiB5Mj1cIjEyXCIvPjxwb2x5bGluZSBwb2ludHM9XCIxMiA1IDE5IDEyIDEyIDE5XCIvPjwvc3ZnPmAsXHJcblx0dGFibGU6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE1XCIgaGVpZ2h0PVwiMTVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCIzXCIgcng9XCIyXCIvPjxwYXRoIGQ9XCJNMyA5aDE4XCIvPjxwYXRoIGQ9XCJNMyAxNWgxOFwiLz48cGF0aCBkPVwiTTkgM3YxOFwiLz48cGF0aCBkPVwiTTE1IDN2MThcIi8+PC9zdmc+YCxcclxuXHRjYW1lcmE6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjE1XCIgaGVpZ2h0PVwiMTVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjc1XCIgZmlsbD1cIm5vbmVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTE0LjUgNGgtNUw3IDdINGEyIDIgMCAwIDAtMiAydjlhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yVjlhMiAyIDAgMCAwLTItMmgtM2wtMi41LTN6XCIvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTNcIiByPVwiM1wiLz48L3N2Zz5gLFxyXG5cdHN0YXI6IGA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiBmaWxsPVwiI2Y1OWUwYlwiIHN0cm9rZT1cIiNmNTllMGJcIiBzdHJva2Utd2lkdGg9XCIxXCI+PHBvbHlnb24gcG9pbnRzPVwiMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMlwiLz48L3N2Zz5gLFxyXG5cdHN0YXJFbXB0eTogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHdpZHRoPVwiMTNcIiBoZWlnaHQ9XCIxM1wiIHN0cm9rZT1cIiM5Y2EzYWZcIiBzdHJva2Utd2lkdGg9XCIxLjVcIiBmaWxsPVwibm9uZVwiPjxwb2x5Z29uIHBvaW50cz1cIjEyIDIgMTUuMDkgOC4yNiAyMiA5LjI3IDE3IDE0LjE0IDE4LjE4IDIxLjAyIDEyIDE3Ljc3IDUuODIgMjEuMDIgNyAxNC4xNCAyIDkuMjcgOC45MSA4LjI2IDEyIDJcIi8+PC9zdmc+YFxyXG59O1xyXG5cclxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHIpIHtcclxuXHRpZiAoc3RyID09IG51bGwpIHJldHVybiAnJztcclxuXHRpZiAod2luZG93LmZyYXBwZSAmJiBmcmFwcGUudXRpbHMgJiYgZnJhcHBlLnV0aWxzLmVzY2FwZV9odG1sKSB7XHJcblx0XHRyZXR1cm4gZnJhcHBlLnV0aWxzLmVzY2FwZV9odG1sKFN0cmluZyhzdHIpKTtcclxuXHR9XHJcblx0cmV0dXJuIFN0cmluZyhzdHIpXHJcblx0XHQucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxyXG5cdFx0LnJlcGxhY2UoLzwvZywgJyZsdDsnKVxyXG5cdFx0LnJlcGxhY2UoLz4vZywgJyZndDsnKVxyXG5cdFx0LnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxyXG5cdFx0LnJlcGxhY2UoLycvZywgJyYjMzk7Jyk7XHJcbn1cclxuXHJcbmNsYXNzIFByb2plY3RTdHVkaW9BcHAge1xyXG5cdGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xyXG5cdFx0dGhpcy5vcHRzID0gb3B0cztcclxuXHRcdHRoaXMucGFnZSA9IG9wdHMucGFnZSB8fCAod2luZG93LmN1cl9wYWdlICYmIHdpbmRvdy5jdXJfcGFnZS5wYWdlKSB8fCAoZnJhcHBlLmNvbnRhaW5lciAmJiBmcmFwcGUuY29udGFpbmVyLnBhZ2UgJiYgZnJhcHBlLmNvbnRhaW5lci5wYWdlLnBhZ2UpO1xyXG5cdFx0dGhpcy5jdXJyZW50UHJvamVjdCA9IG51bGw7XHJcblx0XHR0aGlzLmFsbFByb2plY3RzID0gW107XHJcblx0XHR0aGlzLmN1cnJlbnRUYWIgPSAnaG9tZSc7XHJcblx0XHR0aGlzLmFjdGl2ZUZpbHRlcktleSA9ICdhbGxfb3Blbic7XHJcblx0XHR0aGlzLmFjdGl2ZVR5cGVGaWx0ZXIgPSAnYWxsJztcclxuXHRcdHRoaXMuYm9hcmRHcm91cEJ5ID0gJ3N0YXR1cyc7XHJcblx0XHR0aGlzLmlzU2lkZWJhckNvbGxhcHNlZCA9IGZhbHNlO1xyXG5cclxuXHRcdHRoaXMuaW5pdCgpO1xyXG5cdH1cclxuXHJcblx0aW5pdCgpIHtcclxuXHRcdHRoaXMuc2V0dXBOYXRpdmVQYWdlSGVhZGVyKCk7XHJcblx0XHR0aGlzLmJpbmRFdmVudHMoKTtcclxuXHRcdHRoaXMubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHQvLyBDaGVjayBVUkwgcGFyYW1ldGVycyBmb3IgcHJvamVjdFxyXG5cdFx0XHRjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xyXG5cdFx0XHRjb25zdCBwcm9qUGFyYW0gPSB1cmxQYXJhbXMuZ2V0KCdwcm9qZWN0Jyk7XHJcblx0XHRcdGNvbnN0IHRhYlBhcmFtID0gdXJsUGFyYW1zLmdldCgndGFiJyk7XHJcblxyXG5cdFx0XHRpZiAocHJvalBhcmFtICYmIHByb2pQYXJhbSAhPT0gJ2FsbCcpIHtcclxuXHRcdFx0XHR0aGlzLnNlbGVjdFByb2plY3QocHJvalBhcmFtLCB0YWJQYXJhbSB8fCAnaG9tZScpO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuYWxsUHJvamVjdHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdHRoaXMuc2VsZWN0UHJvamVjdCh0aGlzLmFsbFByb2plY3RzWzBdLm5hbWUsIHRhYlBhcmFtIHx8ICdob21lJyk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHNldHVwTmF0aXZlUGFnZUhlYWRlcigpIHtcclxuXHRcdGlmICghdGhpcy5wYWdlKSByZXR1cm47XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHJcblx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlKF9fKCdEYXNoYm9hcmQnKSk7XHJcblx0XHRpZiAodGhpcy5jdXJyZW50UHJvamVjdCkge1xyXG5cdFx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlX3N1Yih0aGlzLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5wYWdlLmNsZWFyX2FjdGlvbl9iYXIpIHRoaXMucGFnZS5jbGVhcl9hY3Rpb25fYmFyKCk7XHJcblx0XHRpZiAodGhpcy5wYWdlLmNsZWFyX3ByaW1hcnlfYWN0aW9uKSB0aGlzLnBhZ2UuY2xlYXJfcHJpbWFyeV9hY3Rpb24oKTtcclxuXHJcblx0XHQvLyBQcmltYXJ5IEFjdGlvbjogKyBDcmVhdGVcclxuXHRcdHRoaXMucGFnZS5zZXRfcHJpbWFyeV9hY3Rpb24oXHJcblx0XHRcdF9fKCdDcmVhdGUnKSxcclxuXHRcdFx0KCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnVGFzaycpLFxyXG5cdFx0XHQnYWRkJ1xyXG5cdFx0KTtcclxuXHJcblx0XHQvLyBBZGQgc3RhbmRhcmQgd29yayBwYWNrYWdlIHR5cGVzIHVuZGVyIENyZWF0ZSBncm91cFxyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ1N0YW5kYXJkIFRhc2snKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnVGFzaycpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ01pbGVzdG9uZScpLCAoKSA9PiBzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdNaWxlc3RvbmUnKSwgX18oJ0NyZWF0ZScpKTtcclxuXHRcdHRoaXMucGFnZS5hZGRfaW5uZXJfYnV0dG9uKF9fKCdQaGFzZScpLCAoKSA9PiBzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdQaGFzZScpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ0lzc3VlIC8gUHVuY2hsaXN0JyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ0lzc3VlJyksIF9fKCdDcmVhdGUnKSk7XHJcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnUmVtYXJrJyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ1JlbWFyaycpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ1JlcXVlc3QgLyBSRkknKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnUmVxdWVzdCcpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ0NsYXNoIFRvcGljJyksICgpID0+IHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ0NsYXNoJyksIF9fKCdDcmVhdGUnKSk7XHJcblx0XHR0aGlzLnBhZ2UuYWRkX2lubmVyX2J1dHRvbihfXygnTmV3IFByb2plY3QnKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgncHJvamVjdCcpLCBfXygnQ3JlYXRlJykpO1xyXG5cdFx0dGhpcy5wYWdlLmFkZF9pbm5lcl9idXR0b24oX18oJ0ludml0ZSBNZW1iZXInKSwgKCkgPT4gc2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgndXNlcicpLCBfXygnQ3JlYXRlJykpO1xyXG5cclxuXHRcdC8vIFRvb2xiYXIgdXRpbGl0eSBidXR0b25zIChNYXRjaGluZyBGcmFwcGUgQ1JNOiBSZWZyZXNoLCBFZGl0LCBEZXNrKVxyXG5cdFx0dGhpcy5wYWdlLmFkZF9idXR0b24oX18oJ1JlZnJlc2gnKSwgKCkgPT4ge1xyXG5cdFx0XHRpZiAoc2VsZi5jdXJyZW50UHJvamVjdCkge1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9LCB7IGljb246ICdyZWZyZXNoJyB9KTtcclxuXHJcblx0XHR0aGlzLnBhZ2UuYWRkX2J1dHRvbihfXygnRWRpdCcpLCAoKSA9PiB7XHJcblx0XHRcdGlmIChzZWxmLmN1cnJlbnRQcm9qZWN0KSB7XHJcblx0XHRcdFx0ZnJhcHBlLnNldF9yb3V0ZSgnRm9ybScsICdQcm9qZWN0Jywgc2VsZi5jdXJyZW50UHJvamVjdCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3NldHRpbmdzJyk7XHJcblx0XHRcdH1cclxuXHRcdH0sIHsgaWNvbjogJ2VkaXQnIH0pO1xyXG5cclxuXHRcdHRoaXMucGFnZS5hZGRfYnV0dG9uKF9fKCdEZXNrJyksICgpID0+IHtcclxuXHRcdFx0ZnJhcHBlLnNldF9yb3V0ZSgnZGVzaycpO1xyXG5cdFx0fSwgeyBpY29uOiAnZ3JpZCcgfSk7XHJcblx0fVxyXG5cclxuXHRiaW5kRXZlbnRzKCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gU2lkZWJhciBjb2xsYXBzZSB0b2dnbGVcclxuXHRcdCQoJyNidG4tdG9nZ2xlLXNpZGViYXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkID0gIXNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkO1xyXG5cdFx0XHQkKCcjc3R1ZGlvLXNpZGViYXInKS50b2dnbGVDbGFzcygnY29sbGFwc2VkJywgc2VsZi5pc1NpZGViYXJDb2xsYXBzZWQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gTmF2aWdhdGlvbiBsaW5rc1xyXG5cdFx0JCgnLnN0dWRpby1uYXYtbGlzdCcpLm9uKCdjbGljaycsICcubmF2LWl0ZW0nLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IHRhYiA9ICQodGhpcykuZGF0YSgndGFiJyk7XHJcblx0XHRcdHNlbGYuc3dpdGNoVGFiKHRhYik7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBGaWx0ZXIgcGlsbCBidXR0b25zIChGcmFwcGUgQ1JNIHN0eWxlKVxyXG5cdFx0JCgnI2ZpbHRlci1wcm9qZWN0LWJ0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdCQoJyNwcm9qZWN0U3dpdGNoZXJCdG4nKS5kcm9wZG93bigndG9nZ2xlJyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkKCcjZmlsdGVyLWRhdGUtYnRuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdGaWx0ZXI6IExhc3QgMzAgRGF5cyAoQWN0aXZlKScpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFJlZnJlc2ggYnV0dG9uXHJcblx0XHQkKCcjYnRuLXN0dWRpby1yZWZyZXNoJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAoc2VsZi5jdXJyZW50UHJvamVjdCkge1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBFZGl0IGJ1dHRvblxyXG5cdFx0JCgnI2J0bi1zdHVkaW8tZWRpdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYgKHNlbGYuY3VycmVudFByb2plY3QpIHtcclxuXHRcdFx0XHRmcmFwcGUuc2V0X3JvdXRlKCdGb3JtJywgJ1Byb2plY3QnLCBzZWxmLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYignc2V0dGluZ3MnKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gUXVpY2sgY3JlYXRlIGRyb3Bkb3duIGFjdGlvbnNcclxuXHRcdCQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuYWN0aW9uLXF1aWNrLWFkZCcsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Y29uc3QgdHlwZSA9ICQodGhpcykuZGF0YSgndHlwZScpO1xyXG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKHR5cGUpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQWRkIHByb2plY3QgYnV0dG9uXHJcblx0XHQkKCcjYnRuLWFkZC1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdwcm9qZWN0Jyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBTdWJwcm9qZWN0IGFkZCBidXR0b25cclxuXHRcdCQoJyNidG4tYWRkLXN1YnByb2plY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ3N1YnByb2plY3QnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFNlYXJjaCBpbiBhbGwgcHJvamVjdHMgdGFibGVcclxuXHRcdCQoJyNwcm9qZWN0cy1maWx0ZXItaW5wdXQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IHEgPSAkKHRoaXMpLnZhbCgpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdCQoJyNwcm9qZWN0cy10YWJsZS1ib2R5IHRyJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y29uc3QgdGV4dCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdFx0JCh0aGlzKS50b2dnbGUodGV4dC5pbmRleE9mKHEpID4gLTEpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEdsb2JhbCBzZWFyY2hcclxuXHRcdCQoJyNzdHVkaW8tZ2xvYmFsLXNlYXJjaCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xyXG5cdFx0XHRcdGNvbnN0IHF1ZXJ5ID0gJCh0aGlzKS52YWwoKTtcclxuXHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnd29yay1wYWNrYWdlcycpIHtcclxuXHRcdFx0XHRcdHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKHF1ZXJ5KTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2FsbC1wcm9qZWN0cycpIHtcclxuXHRcdFx0XHRcdCQoJyNwcm9qZWN0cy1maWx0ZXItaW5wdXQnKS52YWwocXVlcnkpLnRyaWdnZXIoJ2tleXVwJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCd3b3JrLXBhY2thZ2VzJyk7XHJcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKHF1ZXJ5KSwgMTAwKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEhlYWx0aCBzdGF0dXMgc2VsZWN0IGNoYW5nZVxyXG5cdFx0JCgnI3NlbGVjdC1wcm9qZWN0LWhlYWx0aCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IHZhbCA9ICQodGhpcykudmFsKCk7XHJcblx0XHRcdHNlbGYudXBkYXRlUHJvamVjdEhlYWx0aFN0YXR1cyh2YWwpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gRWRpdCBzdGF0dXMgbmFycmF0aXZlIGJ1dHRvblxyXG5cdFx0JCgnI2J0bi1lZGl0LXN0YXR1cy1uYXJyYXRpdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYuZWRpdFN0YXR1c05hcnJhdGl2ZVByb21wdCgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQ29sbGFwc2UgLyBleHBhbmQgc2lkZWJhclxyXG5cdFx0JCgnI2J0bi10b2dnbGUtc2lkZWJhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnI3N0dWRpby1zaWRlYmFyJykudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gS2V5Ym9hcmQgc2hvcnRjdXQgXHUyMzE4SyAvIEN0cmwrS1xyXG5cdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRpZiAoKGUubWV0YUtleSB8fCBlLmN0cmxLZXkpICYmIChlLmtleSA9PT0gJ2snIHx8IGUua2V5ID09PSAnSycpKSB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdCQoJyNzdHVkaW8tZ2xvYmFsLXNlYXJjaCcpLmZvY3VzKCkuc2VsZWN0KCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFdvcmsgcGFja2FnZXMgZmlsdGVyIGNsaWNrc1xyXG5cdFx0JCgnLndwLXNpZGViYXItZmlsdGVyJykub24oJ2NsaWNrJywgJ2xpW2RhdGEtZmlsdGVyXScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnLndwLXNpZGViYXItZmlsdGVyIGxpW2RhdGEtZmlsdGVyXScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdHNlbGYuYWN0aXZlRmlsdGVyS2V5ID0gJCh0aGlzKS5kYXRhKCdmaWx0ZXInKTtcclxuXHRcdFx0JCgnI3dwLWFjdGl2ZS1maWx0ZXItdGl0bGUnKS50ZXh0KCQodGhpcykudGV4dCgpKTtcclxuXHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJy53cC1zaWRlYmFyLWZpbHRlcicpLm9uKCdjbGljaycsICdsaVtkYXRhLXR5cGVdJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQkKCcud3Atc2lkZWJhci1maWx0ZXIgbGlbZGF0YS10eXBlXScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdHNlbGYuYWN0aXZlVHlwZUZpbHRlciA9ICQodGhpcykuZGF0YSgndHlwZScpO1xyXG5cdFx0XHRzZWxmLnJlbmRlcldvcmtQYWNrYWdlcygpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gV29yayBwYWNrYWdlcyB0ZXh0IHNlYXJjaCBmaWx0ZXJcclxuXHRcdCQoJyN3cC1maWx0ZXItc2VhcmNoJykub24oJ2tleXVwJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRjb25zdCBxID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHQkKCcjd3AtdGFibGUtYm9keSB0cicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGNvbnN0IHRleHQgPSAkKHRoaXMpLnRleHQoKS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0XHRcdCQodGhpcykudG9nZ2xlKHRleHQuaW5kZXhPZihxKSA+IC0xKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBCb2FyZCBncm91cGluZyBzZWxlY3RvclxyXG5cdFx0JCgnI3NlbGVjdC1ib2FyZC1ncm91cC1ieScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYuYm9hcmRHcm91cEJ5ID0gJCh0aGlzKS52YWwoKTtcclxuXHRcdFx0c2VsZi5yZW5kZXJLYW5iYW5Cb2FyZCgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQkNGIERyYXdlciB0b2dnbGVcclxuXHRcdCQoJyNidG4tYmNmLXRvZ2dsZS1kcmF3ZXInKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJyNiY2YtZmxvYXRpbmctZHJhd2VyJykudG9nZ2xlKCk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNidG4tY2xvc2UtYmNmLWRyYXdlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0JCgnI2JjZi1mbG9hdGluZy1kcmF3ZXInKS5oaWRlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBEb2N1bWVudCBmaWxlIGxpbmsgY2xpY2sgZGVsZWdhdGlvbiAoQXV0by1MYXVuY2hlcnMhKVxyXG5cdFx0JCgnI2RvY3VtZW50LWZvbGRlcnMtY29udGFpbmVyJykub24oJ2NsaWNrJywgJy5maWxlLWl0ZW0tbGluaycsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdGNvbnN0IHJvdXRlID0gJCh0aGlzKS5kYXRhKCdyb3V0ZScpO1xyXG5cdFx0XHRjb25zdCB1cmwgPSAkKHRoaXMpLmRhdGEoJ3VybCcpO1xyXG5cdFx0XHRjb25zdCBtb2RlbElkID0gJCh0aGlzKS5kYXRhKCdtb2RlbC1pZCcpO1xyXG5cdFx0XHRpZiAocm91dGUgPT09ICdiaW0nKSB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdiY2YnLCB7IG1vZGVsOiBtb2RlbElkLCB1cmw6IHVybCB9KTtcclxuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdPcGVuaW5nIElGQyBtb2RlbCBpbiAzRCBWaWV3ZXIuLi4nKSwgaW5kaWNhdG9yOiAnYmx1ZScgfSk7XHJcblx0XHRcdH0gZWxzZSBpZiAocm91dGUgPT09ICdjYWQnKSB7XHJcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdjYWQnLCB7IGZpbGU6IHVybCB9KTtcclxuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdPcGVuaW5nIGRyYXdpbmcgaW4gMkQgQ0FEIFN0dWRpby4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcclxuXHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ3BkZicpIHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3BkZicsIHsgZmlsZTogdXJsIH0pO1xyXG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ09wZW5pbmcgcGxhbiBpbiBQREYgVGFrZW9mZi4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gRG9jdW1lbnQgZmlsZSB1cGxvYWQgYnV0dG9uXHJcblx0XHQkKCcjYnRuLXVwbG9hZC1kb2N1bWVudCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5vcGVuRmlsZVVwbG9hZERpYWxvZygpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQklNIFRhYiBRdWljayBVcGxvYWQgSUZDIGJ1dHRvblxyXG5cdFx0JCgnI2J0bi1iY2YtdXBsb2FkLWlmYycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5vcGVuQmNmVXBsb2FkRGlhbG9nKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBCSU0gVGFiIExvYWQvVW5sb2FkIGFsbCBtb2RlbHMgYnV0dG9uc1xyXG5cdFx0JCgnI2J0bi1sb2FkLWFsbC1tb2RlbHMnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJyNiY2YtbW9kZWxzLXRyZWUgaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xyXG5cdFx0XHRjb25zdCBpZnJhbWVTcmMgPSBgL2FwcC9iaW0tdmlld2VyP3Byb2plY3Q9JHtlbmNvZGVVUklDb21wb25lbnQoc2VsZi5jdXJyZW50UHJvamVjdCl9YDtcclxuXHRcdFx0JCgnI2lmcmFtZS1iY2YtM2Qtdmlld2VyJykuYXR0cignc3JjJywgaWZyYW1lU3JjKTtcclxuXHRcdFx0JCgnI2J0bi1iY2Ytb3Blbi1mdWxsc2NyZWVuJykuYXR0cignaHJlZicsIGlmcmFtZVNyYyk7XHJcblx0XHR9KTtcclxuXHRcdCQoJyNidG4tdW5sb2FkLWFsbC1tb2RlbHMnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdCQoJyNiY2YtbW9kZWxzLXRyZWUgaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuXHRcdFx0Y29uc3QgaWZyYW1lU3JjID0gYC9hcHAvYmltLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfWA7XHJcblx0XHRcdCQoJyNpZnJhbWUtYmNmLTNkLXZpZXdlcicpLmF0dHIoJ3NyYycsIGlmcmFtZVNyYyk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBCQ0YgQ3JlYXRlIElzc3VlIGJ1dHRvblxyXG5cdFx0JCgnI2J0bi1iY2YtY3JlYXRlLXRvcGljJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdJc3N1ZScpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gRGFzaGJvYXJkIHdpZGdldCBidXR0b25zXHJcblx0XHQkKCcjYnRuLWFkZC1tZWV0aW5nJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzZWxmLm9wZW5TY2hlZHVsZU1lZXRpbmdEaWFsb2coKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2J0bi1hZGQtc3VicHJvamVjdC13aWRnZXQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYub3BlblF1aWNrQ3JlYXRlTW9kYWwoJ3N1YnByb2plY3QnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFN0YW5kYWxvbmUgQ0FEICYgUERGIGJ1dHRvbnNcclxuXHRcdCQoJyNidG4tb3Blbi1kd2ctZnVsbHNjcmVlbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0d2luZG93Lm9wZW4oYC9hcHAvZHdnLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfWAsICdfYmxhbmsnKTtcclxuXHRcdH0pO1xyXG5cdFx0JCgnI2J0bi1vcGVuLXBkZi1mdWxsc2NyZWVuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR3aW5kb3cub3BlbihgL2FwcC9wZGYtdGFrZW9mZj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfWAsICdfYmxhbmsnKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIFNjaGVkdWxlIG1lZXRpbmcgYnV0dG9uXHJcblx0XHQkKCcjYnRuLXNjaGVkdWxlLW1lZXRpbmcnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHNlbGYub3BlblNjaGVkdWxlTWVldGluZ0RpYWxvZygpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gUHJvamVjdCBzZXR0aW5ncyBzYXZlXHJcblx0XHQkKCcjYnRuLXNhdmUtcHJvamVjdC1zZXR0aW5ncycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5zYXZlUHJvamVjdFNldHRpbmdzKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBBcmNoaXZlIHRvZ2dsZVxyXG5cdFx0JCgnI2J0bi10b2dnbGUtYXJjaGl2ZS1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRzZWxmLnRvZ2dsZUFyY2hpdmVQcm9qZWN0KCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBEZWxldGUgcHJvamVjdFxyXG5cdFx0JCgnI2J0bi1kZWxldGUtcHJvamVjdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0c2VsZi5jb25maXJtRGVsZXRlUHJvamVjdCgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRsb2FkUHJvamVjdHNMaXN0KCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRyZXR1cm4gZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5saXN0X3Byb2plY3RzJyxcclxuXHRcdFx0YXJnczogeyBpbmNsdWRlX2FyY2hpdmVkOiAxIH1cclxuXHRcdH0pLnRoZW4ociA9PiB7XHJcblx0XHRcdHNlbGYuYWxsUHJvamVjdHMgPSByLm1lc3NhZ2UgfHwgW107XHJcblx0XHRcdHNlbGYucmVuZGVyUHJvamVjdFN3aXRjaGVyKCk7XHJcblx0XHRcdHNlbGYucmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRyZW5kZXJQcm9qZWN0U3dpdGNoZXIoKSB7XHJcblx0XHRjb25zdCAkbGlzdCA9ICQoJyNwcm9qZWN0LXN3aXRjaGVyLWxpc3QnKTtcclxuXHRcdCRsaXN0LmVtcHR5KCk7XHJcblx0XHQkbGlzdC5hcHBlbmQoYDxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJhY3Rpb24tc2VsZWN0LXByb2pcIiBkYXRhLXByb2plY3Q9XCJhbGxcIj48c3BhbiBjbGFzcz1cIm1yLTIgdGV4dC1tdXRlZFwiPiR7SUNPTlMubGlzdH08L3NwYW4+IDxzdHJvbmc+QWxsIHByb2plY3RzIChIdWIpPC9zdHJvbmc+PC9hPjwvbGk+YCk7XHJcblx0XHQkbGlzdC5hcHBlbmQoJzxsaSByb2xlPVwic2VwYXJhdG9yXCIgY2xhc3M9XCJkaXZpZGVyXCI+PC9saT4nKTtcclxuXHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdHRoaXMuYWxsUHJvamVjdHMuZm9yRWFjaChwID0+IHtcclxuXHRcdFx0Y29uc3QgZmF2SWNvbiA9IHAuaXNfZmF2b3JpdGUgPyAnXHUyQjUwICcgOiAnJztcclxuXHRcdFx0Y29uc3QgdG1wbEJhZGdlID0gcC5pc190ZW1wbGF0ZSA/ICcgPHNwYW4gY2xhc3M9XCJiYWRnZVwiPlRlbXBsYXRlPC9zcGFuPicgOiAnJztcclxuXHRcdFx0Y29uc3QgJGl0ZW0gPSAkKGA8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwiYWN0aW9uLXNlbGVjdC1wcm9qXCIgZGF0YS1wcm9qZWN0PVwiJHtlc2NhcGVIdG1sKHAubmFtZSl9XCI+JHtmYXZJY29ufSR7ZXNjYXBlSHRtbChwLnByb2plY3RfbmFtZSB8fCBwLm5hbWUpfSR7dG1wbEJhZGdlfTwvYT48L2xpPmApO1xyXG5cdFx0XHQkbGlzdC5hcHBlbmQoJGl0ZW0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JGxpc3Qub2ZmKCdjbGljaycsICcuYWN0aW9uLXNlbGVjdC1wcm9qJykub24oJ2NsaWNrJywgJy5hY3Rpb24tc2VsZWN0LXByb2onLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IHByb2ogPSAkKHRoaXMpLmRhdGEoJ3Byb2plY3QnKTtcclxuXHRcdFx0aWYgKHByb2ogPT09ICdhbGwnKSB7XHJcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHNlbGYuc2VsZWN0UHJvamVjdChwcm9qKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRzZWxlY3RQcm9qZWN0KHByb2plY3ROYW1lLCB0YWIgPSAnaG9tZScpIHtcclxuXHRcdGNvbnN0IHByb2pPYmogPSB0aGlzLmFsbFByb2plY3RzLmZpbmQocCA9PiBwLm5hbWUgPT09IHByb2plY3ROYW1lIHx8IHAucHJvamVjdF9uYW1lID09PSBwcm9qZWN0TmFtZSkgfHwgeyBuYW1lOiBwcm9qZWN0TmFtZSwgcHJvamVjdF9uYW1lOiBwcm9qZWN0TmFtZSB9O1xyXG5cdFx0dGhpcy5jdXJyZW50UHJvamVjdCA9IHByb2pPYmoubmFtZTtcclxuXHRcdCQoJyNjdXJyZW50LXByb2plY3QtdGl0bGUnKS50ZXh0KHByb2pPYmoucHJvamVjdF9uYW1lIHx8IHByb2pPYmoubmFtZSk7XHJcblx0XHQkKCcjZmlsdGVyLXByb2plY3QtbGFiZWwnKS50ZXh0KHByb2pPYmoucHJvamVjdF9uYW1lIHx8IHByb2pPYmoubmFtZSk7XHJcblx0XHQkKCcjc2lkZWJhci1hY3RpdmUtc3RhdHVzJykudGV4dChwcm9qT2JqLnN0YXR1cyB8fCAnQWN0aXZlJyk7XHJcblx0XHRpZiAodGhpcy5wYWdlKSB7XHJcblx0XHRcdHRoaXMucGFnZS5zZXRfdGl0bGVfc3ViKHByb2pPYmoucHJvamVjdF9uYW1lIHx8IHByb2pPYmoubmFtZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRW5hYmxlIHByb2plY3Qtc3BlY2lmaWMgbmF2IHRhYnNcclxuXHRcdCQoJy5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtJykuc2hvdygpO1xyXG5cdFx0dGhpcy5zd2l0Y2hUYWIodGFiKTtcclxuXHRcdHRoaXMubG9hZFByb2plY3REYXRhKHByb2plY3ROYW1lKTtcclxuXHR9XHJcblxyXG5cdHN3aXRjaFRhYih0YWJLZXksIHBhcmFtcyA9IHt9KSB7XHJcblx0XHR0aGlzLmN1cnJlbnRUYWIgPSB0YWJLZXk7XHJcblx0XHQkKCcuc3R1ZGlvLW5hdi1saXN0IC5uYXYtaXRlbScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHRcdCQoYC5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtW2RhdGEtdGFiPVwiJHt0YWJLZXl9XCJdYCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuXHRcdGNvbnN0IHRhYlRpdGxlcyA9IHtcclxuXHRcdFx0J2hvbWUnOiAnRGFzaGJvYXJkJyxcclxuXHRcdFx0J3dvcmstcGFja2FnZXMnOiAnV29yayBQYWNrYWdlcycsXHJcblx0XHRcdCdib2FyZHMnOiAnQm9hcmRzJyxcclxuXHRcdFx0J2dhbnR0JzogJ0dhbnR0IENoYXJ0cycsXHJcblx0XHRcdCdiY2YnOiAnQklNIC8gQkNGIENvb3JkaW5hdGlvbicsXHJcblx0XHRcdCdjYWQnOiAnMkQgQ0FEIChEV0cpJyxcclxuXHRcdFx0J3BkZic6ICdQREYgUGxhbnMgJiBUYWtlb2ZmJyxcclxuXHRcdFx0J2RvY3VtZW50cyc6ICdEb2N1bWVudHMnLFxyXG5cdFx0XHQnbWVldGluZ3MnOiAnTWVldGluZ3MgJiBTYWZldHknLFxyXG5cdFx0XHQnbWVtYmVycyc6ICdNZW1iZXJzJyxcclxuXHRcdFx0J3NldHRpbmdzJzogJ1NldHRpbmdzJyxcclxuXHRcdFx0J2FsbC1wcm9qZWN0cyc6ICdBY3RpdmUgUHJvamVjdHMnXHJcblx0XHR9O1xyXG5cdFx0Y29uc3QgYWN0aXZlVGl0bGUgPSB0YWJUaXRsZXNbdGFiS2V5XSB8fCB0YWJLZXk7XHJcblx0XHQkKCcjc3R1ZGlvLWFjdGl2ZS10aXRsZScpLnRleHQoYWN0aXZlVGl0bGUpO1xyXG5cdFx0aWYgKHRoaXMucGFnZSkge1xyXG5cdFx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlKGFjdGl2ZVRpdGxlKTtcclxuXHRcdFx0aWYgKHRoaXMuY3VycmVudFByb2plY3QpIHtcclxuXHRcdFx0XHR0aGlzLnBhZ2Uuc2V0X3RpdGxlX3N1Yih0aGlzLmN1cnJlbnRQcm9qZWN0KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdCQoJy5zdHVkaW8tdGFiLXZpZXcnKS5oaWRlKCk7XHJcblxyXG5cdFx0aWYgKHRhYktleSA9PT0gJ2FsbC1wcm9qZWN0cycpIHtcclxuXHRcdFx0JCgnI2N1cnJlbnQtcHJvamVjdC10aXRsZScpLnRleHQoJ0FsbCBwcm9qZWN0cycpO1xyXG5cdFx0XHQkKCcjdmlldy1hbGwtcHJvamVjdHMnKS5zaG93KCk7XHJcblx0XHRcdHRoaXMucmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0JChgI3ZpZXctJHt0YWJLZXl9YCkuc2hvdygpO1xyXG5cclxuXHRcdC8vIFRyaWdnZXIgdmlldy1zcGVjaWZpYyBsb2Fkc1xyXG5cdFx0aWYgKHRhYktleSA9PT0gJ2hvbWUnKSB7XHJcblx0XHRcdHRoaXMucmVuZGVyUHJvamVjdE92ZXJ2aWV3KCk7XHJcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ3dvcmstcGFja2FnZXMnKSB7XHJcblx0XHRcdHRoaXMucmVuZGVyV29ya1BhY2thZ2VzKCk7XHJcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2JvYXJkcycpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJLYW5iYW5Cb2FyZCgpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdnYW50dCcpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJHYW50dENoYXJ0KCk7XHJcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2JjZicpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJCY2ZWaWV3ZXIocGFyYW1zLm1vZGVsKTtcclxuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAnY2FkJykge1xyXG5cdFx0XHRjb25zdCBjYWRTcmMgPSBwYXJhbXMuZmlsZVxyXG5cdFx0XHRcdD8gYC9hcHAvZHdnLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY3VycmVudFByb2plY3QpfSZmaWxlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtcy5maWxlKX1gXHJcblx0XHRcdFx0OiBgL2FwcC9kd2ctdmlld2VyP3Byb2plY3Q9JHtlbmNvZGVVUklDb21wb25lbnQodGhpcy5jdXJyZW50UHJvamVjdCl9YDtcclxuXHRcdFx0JCgnI2lmcmFtZS1kd2ctdmlld2VyJykuYXR0cignc3JjJywgY2FkU3JjKTtcclxuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAncGRmJykge1xyXG5cdFx0XHRjb25zdCBwZGZTcmMgPSBwYXJhbXMuZmlsZVxyXG5cdFx0XHRcdD8gYC9hcHAvcGRmLXRha2VvZmY/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmN1cnJlbnRQcm9qZWN0KX0mZmlsZT0ke2VuY29kZVVSSUNvbXBvbmVudChwYXJhbXMuZmlsZSl9YFxyXG5cdFx0XHRcdDogYC9hcHAvcGRmLXRha2VvZmY/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmN1cnJlbnRQcm9qZWN0KX1gO1xyXG5cdFx0XHQkKCcjaWZyYW1lLXBkZi12aWV3ZXInKS5hdHRyKCdzcmMnLCBwZGZTcmMpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdkb2N1bWVudHMnKSB7XHJcblx0XHRcdHRoaXMucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdtZWV0aW5ncycpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJNZWV0aW5nc1RhYigpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdtZW1iZXJzJykge1xyXG5cdFx0XHR0aGlzLnJlbmRlck1lbWJlcnNUYWJsZSgpO1xyXG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdzZXR0aW5ncycpIHtcclxuXHRcdFx0dGhpcy5yZW5kZXJTZXR0aW5nc1RhYigpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0bG9hZFByb2plY3REYXRhKHByb2plY3ROYW1lKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8uZ2V0X3Byb2plY3Rfb3ZlcnZpZXcnLFxyXG5cdFx0XHRhcmdzOiB7IHByb2plY3Q6IHByb2plY3ROYW1lIH1cclxuXHRcdH0pLnRoZW4ociA9PiB7XHJcblx0XHRcdHNlbGYucHJvamVjdE92ZXJ2aWV3RGF0YSA9IHIubWVzc2FnZSB8fCB7fTtcclxuXHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2hvbWUnKSB7XHJcblx0XHRcdFx0c2VsZi5yZW5kZXJQcm9qZWN0T3ZlcnZpZXcoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0Ly8gVEFCIDA6IEFMTCBQUk9KRUNUUyBIVUIgKFNjcmVlbnNob3QgMSlcclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0cmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpIHtcclxuXHRcdGNvbnN0ICR0Ym9keSA9ICQoJyNwcm9qZWN0cy10YWJsZS1ib2R5Jyk7XHJcblx0XHQkdGJvZHkuZW1wdHkoKTtcclxuXHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdHRoaXMuYWxsUHJvamVjdHMuZm9yRWFjaChwID0+IHtcclxuXHRcdFx0Y29uc3QgZmF2U3RhciA9IHAuaXNfZmF2b3JpdGUgPyBJQ09OUy5zdGFyIDogSUNPTlMuc3RhckVtcHR5O1xyXG5cdFx0XHRjb25zdCBzdGF0dXNQaWxsID0gcC5oZWFsdGhfc3RhdHVzID09PSAnT24gVHJhY2snIFxyXG5cdFx0XHRcdD8gJzxzcGFuIGNsYXNzPVwic3RhdHVzLWFjdGl2ZS1waWxsXCI+PHNwYW4gY2xhc3M9XCJzdGF0dXMtZG90LWdyZWVuXCI+PC9zcGFuPiBPbiB0cmFjazwvc3Bhbj4nXHJcblx0XHRcdFx0OiAocC5oZWFsdGhfc3RhdHVzID09PSAnQXQgUmlzaycgXHJcblx0XHRcdFx0XHQ/ICc8c3BhbiBjbGFzcz1cInN0YXR1cy13YXJuaW5nLXBpbGxcIj48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3QtYW1iZXJcIj48L3NwYW4+IEF0IHJpc2s8L3NwYW4+J1xyXG5cdFx0XHRcdFx0OiAnPHNwYW4gY2xhc3M9XCJzdGF0dXMtZGFuZ2VyLXBpbGxcIj48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3QtcmVkXCI+PC9zcGFuPiBPZmYgdHJhY2s8L3NwYW4+Jyk7XHJcblxyXG5cdFx0XHRjb25zdCBpbmRlbnQgPSBwLnBhcmVudF9wcm9qZWN0ID8gJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1x1MjFCMyAnIDogJyc7XHJcblx0XHRcdGNvbnN0ICR0ciA9ICQoYFxyXG5cdFx0XHRcdDx0cj5cclxuXHRcdFx0XHRcdDx0ZCBjbGFzcz1cInRleHQtY2VudGVyXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidG9nZ2xlLWZhdlwiIGRhdGEtcHJvamVjdD1cIiR7ZXNjYXBlSHRtbChwLm5hbWUpfVwiPiR7ZmF2U3Rhcn08L2E+PC90ZD5cclxuXHRcdFx0XHRcdDx0ZD4ke2luZGVudH08YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJwcm9qZWN0LWxpbmtcIiBkYXRhLXByb2plY3Q9XCIke2VzY2FwZUh0bWwocC5uYW1lKX1cIj48c3Ryb25nPiR7ZXNjYXBlSHRtbChwLnByb2plY3RfbmFtZSB8fCBwLm5hbWUpfTwvc3Ryb25nPjwvYT48L3RkPlxyXG5cdFx0XHRcdFx0PHRkPiR7c3RhdHVzUGlsbH08L3RkPlxyXG5cdFx0XHRcdFx0PHRkIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1zdWNjZXNzXCI+JHtJQ09OUy5jaGVja308L3RkPlxyXG5cdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwidGV4dC1tdXRlZFwiPiR7ZXNjYXBlSHRtbChwLmNyZWF0ZWRfb24gfHwgJy0tJyl9PC9zcGFuPjwvdGQ+XHJcblx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtlc2NhcGVIdG1sKHAubGF0ZXN0X2FjdGl2aXR5X2F0IHx8ICctLScpfTwvc3Bhbj48L3RkPlxyXG5cdFx0XHRcdFx0PHRkPjxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke2VzY2FwZUh0bWwocC5kaXNrX3VzYWdlX2Zvcm1hdHRlZCB8fCAnMCBCeXRlcycpfTwvc21hbGw+PC90ZD5cclxuXHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRgKTtcclxuXHJcblx0XHRcdCR0ci5maW5kKCcucHJvamVjdC1saW5rJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdHNlbGYuc2VsZWN0UHJvamVjdCgkKHRoaXMpLmRhdGEoJ3Byb2plY3QnKSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0JHRyLmZpbmQoJy50b2dnbGUtZmF2Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGNvbnN0IGlzRmF2ID0gcC5pc19mYXZvcml0ZSA/IDAgOiAxO1xyXG5cdFx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQocC5uYW1lLCB7IGlzX2Zhdm9yaXRlOiBpc0ZhdiB9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdCR0Ym9keS5hcHBlbmQoJHRyKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdCQoJyNwcm9qZWN0cy10YWJsZS1zdW1tYXJ5JykudGV4dChgU2hvd2luZyAke3RoaXMuYWxsUHJvamVjdHMubGVuZ3RofSBhY3RpdmUgcHJvamVjdChzKWApO1xyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8vIFRBQiAxOiBQUk9KRUNUIEhPTUUgREFTSEJPQVJEIChTY3JlZW5zaG90IDIpXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlclByb2plY3RPdmVydmlldygpIHtcclxuXHRcdGlmICghdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhKSByZXR1cm47XHJcblx0XHRjb25zdCBkYXRhID0gdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhO1xyXG5cdFx0Y29uc3Qgc3VtbWFyeSA9IGRhdGEuc3VtbWFyeSB8fCB7fTtcclxuXHJcblx0XHQvLyBHcmVldGluZyAmIFRvcCBNZXRyaWMgQ2FyZHMgKEZyYXBwZSBVSSBTdHlsZSlcclxuXHRcdGNvbnN0IHVzZXJHcmVldGluZyA9IGZyYXBwZS5zZXNzaW9uLnVzZXJfZnVsbG5hbWUgfHwgZnJhcHBlLnNlc3Npb24udXNlciB8fCAnQWRtaW5pc3RyYXRvcic7XHJcblx0XHQkKCcjaG9tZS11c2VyLWdyZWV0aW5nJykudGV4dCh1c2VyR3JlZXRpbmcpO1xyXG5cclxuXHRcdGNvbnN0IHdwQ291bnRzID0gZGF0YS53b3JrX3BhY2thZ2VzX2NvdW50cyB8fCB7fTtcclxuXHRcdGNvbnN0IG9wZW5UYXNrcyA9IHdwQ291bnRzLm9wZW4gIT09IHVuZGVmaW5lZCA/IHdwQ291bnRzLm9wZW4gOiAoZGF0YS50YXNrcyA/IGRhdGEudGFza3MubGVuZ3RoIDogMCk7XHJcblx0XHRjb25zdCBjbGFzaGVzID0gKGRhdGEuY29vcmRpbmF0aW9uICYmIGRhdGEuY29vcmRpbmF0aW9uLnRvcGljcyA/IGRhdGEuY29vcmRpbmF0aW9uLnRvcGljcy5sZW5ndGggOiAwKTtcclxuXHRcdGNvbnN0IHByb2dyZXNzID0gTWF0aC5yb3VuZChzdW1tYXJ5LnBlcmNlbnRfY29tcGxldGUgfHwgMCk7XHJcblxyXG5cdFx0JCgnI2hvbWUtc3RhdC1vcGVuLXRhc2tzJykudGV4dChvcGVuVGFza3MpO1xyXG5cdFx0JCgnI2hvbWUtc3RhdC1jbGFzaGVzJykudGV4dChjbGFzaGVzKTtcclxuXHRcdCQoJyNob21lLXN0YXQtcHJvZ3Jlc3MnKS50ZXh0KGAke3Byb2dyZXNzfSVgKTtcclxuXHRcdCQoJyNzcGFya2xpbmUtcHJvZ3Jlc3MtYmFyJykuY3NzKCd3aWR0aCcsIGAke01hdGgubWluKDEwMCwgTWF0aC5tYXgoNSwgcHJvZ3Jlc3MpKX0lYCk7XHJcblxyXG5cdFx0Ly8gRGVzY3JpcHRpb24gJiBEYXRlc1xyXG5cdFx0JCgnI292ZXJ2aWV3LWRlc2NyaXB0aW9uJykudGV4dChzdW1tYXJ5LmRlc2NyaXB0aW9uIHx8IF9fKCdObyBkZXNjcmlwdGlvbiBwcm92aWRlZC4nKSk7XHJcblx0XHQkKCcjb3ZlcnZpZXctZGF0ZXMnKS50ZXh0KGAke3N1bW1hcnkuZXhwZWN0ZWRfc3RhcnRfZGF0ZSB8fCAnLS0nfSB0byAke3N1bW1hcnkuZXhwZWN0ZWRfZW5kX2RhdGUgfHwgJy0tJ31gKTtcclxuXHRcdCQoJyNvdmVydmlldy1wcm9ncmVzcycpLnRleHQoYCR7TWF0aC5yb3VuZChzdW1tYXJ5LnBlcmNlbnRfY29tcGxldGUgfHwgMCl9JWApO1xyXG5cclxuXHRcdC8vIEhlYWx0aCBzdGF0dXNcclxuXHRcdGNvbnN0IGhlYWx0aCA9IHN1bW1hcnkuaGVhbHRoX3N0YXR1cyB8fCAnT24gVHJhY2snO1xyXG5cdFx0JCgnI3NlbGVjdC1wcm9qZWN0LWhlYWx0aCcpLnZhbChoZWFsdGgpO1xyXG5cdFx0aWYgKHRoaXMucGFnZSAmJiB0aGlzLnBhZ2Uuc2V0X2luZGljYXRvcikge1xyXG5cdFx0XHRjb25zdCBjb2xvciA9IGhlYWx0aCA9PT0gJ09uIFRyYWNrJyA/ICdncmVlbicgOiAoaGVhbHRoID09PSAnQXQgUmlzaycgPyAnb3JhbmdlJyA6ICdyZWQnKTtcclxuXHRcdFx0dGhpcy5wYWdlLnNldF9pbmRpY2F0b3IoaGVhbHRoLCBjb2xvcik7XHJcblx0XHR9XHJcblx0XHQkKCcjb3ZlcnZpZXctc3RhdHVzLW5hcnJhdGl2ZScpLnRleHQoc3VtbWFyeS5zdGF0dXNfbmFycmF0aXZlIHx8IF9fKCdBbGwgdGFza3MgYW5kIHN1Yi1wcm9qZWN0cyBhcmUgb24gc2NoZWR1bGUuJykpO1xyXG5cclxuXHRcdC8vIE1pbGVzdG9uZSBEaWFtb25kIFRpbWVsaW5lXHJcblx0XHR0aGlzLnJlbmRlck1pbGVzdG9uZVRpbWVsaW5lKGRhdGEubWlsZXN0b25lcyB8fCBbXSk7XHJcblxyXG5cdFx0Ly8gU3VicHJvamVjdHNcclxuXHRcdGNvbnN0ICRzdWJMaXN0ID0gJCgnI3N1YnByb2plY3RzLWxpc3QnKTtcclxuXHRcdCRzdWJMaXN0LmVtcHR5KCk7XHJcblx0XHQoZGF0YS5zdWJwcm9qZWN0cyB8fCBbXSkuZm9yRWFjaChzID0+IHtcclxuXHRcdFx0JHN1Ykxpc3QuYXBwZW5kKGBcclxuXHRcdFx0XHQ8bGkgY2xhc3M9XCJmbGV4LWJldHdlZW4gcC0xXCI+XHJcblx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImQtaW5saW5lLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0xXCI+PHNwYW4gY2xhc3M9XCJ0ZXh0LXByaW1hcnkgbXItMVwiPiR7SUNPTlMuZm9sZGVyfTwvc3Bhbj4gJHtlc2NhcGVIdG1sKHMucHJvamVjdF9uYW1lKX08L3NwYW4+XHJcblx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cInN0YXR1cy1hY3RpdmUtcGlsbFwiPjxzcGFuIGNsYXNzPVwic3RhdHVzLWRvdC1ncmVlblwiPjwvc3Bhbj4gJHtlc2NhcGVIdG1sKHMuc3RhdHVzKX08L3NwYW4+XHJcblx0XHRcdFx0PC9saT5cclxuXHRcdFx0YCk7XHJcblx0XHR9KTtcclxuXHRcdGlmICgoZGF0YS5zdWJwcm9qZWN0cyB8fCBbXSkubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdCRzdWJMaXN0LmFwcGVuZCgnPGxpIGNsYXNzPVwidGV4dC1tdXRlZCBwLTFcIj48c21hbGw+Tm8gc3VicHJvamVjdHMgY29uZmlndXJlZC48L3NtYWxsPjwvbGk+Jyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gTWVldGluZ3NcclxuXHRcdGNvbnN0ICRtZWV0TGlzdCA9ICQoJyNtZWV0aW5ncy1saXN0LWNvbnRhaW5lcicpO1xyXG5cdFx0JG1lZXRMaXN0LmVtcHR5KCk7XHJcblx0XHQoZGF0YS5tZWV0aW5ncyB8fCBbXSkuZm9yRWFjaChtID0+IHtcclxuXHRcdFx0JG1lZXRMaXN0LmFwcGVuZChgXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctaXRlbSBwLTIgbWItMVwiIHN0eWxlPVwiYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmMWY1Zjk7XCI+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleC1iZXR3ZWVuXCI+XHJcblx0XHRcdFx0XHRcdDxzdHJvbmc+JHtlc2NhcGVIdG1sKG0udGl0bGUpfTwvc3Ryb25nPlxyXG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImJhZGdlIGJhZGdlLWluZm9cIj4ke2VzY2FwZUh0bWwobS50eXBlKX08L3NwYW4+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWQgZC1pbmxpbmUtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXIgZ2FwLTEgbXQtMVwiPiR7SUNPTlMuY2FsZW5kYXJ9IDxzcGFuPiR7ZXNjYXBlSHRtbChtLmRhdGUpfSB8ICR7ZXNjYXBlSHRtbChtLmhvc3QgfHwgJ0Nvb3JkaW5hdG9yJyl9PC9zcGFuPjwvc21hbGw+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cdFx0fSk7XHJcblx0XHRpZiAoKGRhdGEubWVldGluZ3MgfHwgW10pLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHQkbWVldExpc3QuYXBwZW5kKCc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBwLTIgdGV4dC1jZW50ZXJcIj48c21hbGw+Tm8gdXBjb21pbmcgbWVldGluZ3M8L3NtYWxsPjwvZGl2PicpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIE1lbWJlcnNcclxuXHRcdGNvbnN0ICRtZW1HcmlkID0gJCgnI21lbWJlcnMtYXZhdGFycy1ncmlkJyk7XHJcblx0XHQkbWVtR3JpZC5lbXB0eSgpO1xyXG5cdFx0KGRhdGEubWVtYmVycyB8fCBbXSkuZm9yRWFjaChtID0+IHtcclxuXHRcdFx0Y29uc3QgbWVtYmVyTmFtZSA9IFN0cmluZyhtLmZ1bGxfbmFtZSB8fCBtLnVzZXIgfHwgJ01lbWJlcicpLnRyaW0oKTtcclxuXHRcdFx0Y29uc3QgaW5pdGlhbHMgPSBtZW1iZXJOYW1lID8gbWVtYmVyTmFtZS5zdWJzdHJpbmcoMCwgMikudG9VcHBlckNhc2UoKSA6ICdNQic7XHJcblx0XHRcdCRtZW1HcmlkLmFwcGVuZChgXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lbWJlci1jaGlwIHAtMVwiIHN0eWxlPVwiZGlzcGxheTogaW5saW5lLWZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNnB4OyBtYXJnaW46IDRweDtcIj5cclxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYXZhdGFyLWNpcmNsZVwiIHN0eWxlPVwid2lkdGg6MjhweDtoZWlnaHQ6MjhweDtib3JkZXItcmFkaXVzOjUwJTtiYWNrZ3JvdW5kOiM0MzM4Y2E7Y29sb3I6I2ZmZjtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6Ym9sZDtcIj5cclxuXHRcdFx0XHRcdFx0JHtlc2NhcGVIdG1sKGluaXRpYWxzKX1cclxuXHRcdFx0XHRcdDwvc3Bhbj5cclxuXHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cImZvbnQtd2VpZ2h0LW1lZGl1bVwiPiR7ZXNjYXBlSHRtbChtZW1iZXJOYW1lKX08L3NtYWxsPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRgKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIE5ld3NcclxuXHRcdGNvbnN0ICRuZXdzQ29udCA9ICQoJyNuZXdzLWZlZWQtY29udGFpbmVyJyk7XHJcblx0XHQkbmV3c0NvbnQuZW1wdHkoKTtcclxuXHRcdChkYXRhLm5ld3MgfHwgW10pLmZvckVhY2gobiA9PiB7XHJcblx0XHRcdCRuZXdzQ29udC5hcHBlbmQoYFxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJuZXdzLWJ1bGxldGluIHAtMiBtYi0yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZjhmYWZjOyBib3JkZXItbGVmdDogM3B4IHNvbGlkICM2MzY2ZjE7IGJvcmRlci1yYWRpdXM6IDRweDtcIj5cclxuXHRcdFx0XHRcdDxoNSBjbGFzcz1cIm0tMCBmb250LXdlaWdodC1ib2xkXCI+JHtlc2NhcGVIdG1sKG4udGl0bGUpfTwvaDU+XHJcblx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtlc2NhcGVIdG1sKG4uYXV0aG9yKX0gb24gJHtlc2NhcGVIdG1sKG4uZGF0ZSl9PC9zbWFsbD5cclxuXHRcdFx0XHRcdDxwIGNsYXNzPVwibS0wIG10LTEgdGV4dC1zZWNvbmRhcnlcIiBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDtcIj4ke2VzY2FwZUh0bWwobi5jb250ZW50KX08L3A+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRyZW5kZXJNaWxlc3RvbmVUaW1lbGluZShtaWxlc3RvbmVzKSB7XHJcblx0XHRjb25zdCAkbWFya2VycyA9ICQoJyN0aW1lbGluZS1tYXJrZXJzLWNvbnRhaW5lcicpO1xyXG5cdFx0JG1hcmtlcnMuZW1wdHkoKTtcclxuXHJcblx0XHRpZiAoIW1pbGVzdG9uZXMgfHwgbWlsZXN0b25lcy5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0JCgnI3RpbWVsaW5lLWF4aXMtYmFyJykuaGlkZSgpO1xyXG5cdFx0XHQkbWFya2Vycy5odG1sKGA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIiBzdHlsZT1cIndpZHRoOiAxMDAlO1wiPjxzcGFuIGNsYXNzPVwidGltZWxpbmUtZW1wdHktbXNnIHRleHQtbXV0ZWRcIj4ke0lDT05TLmluZm99IE5vIGRlbGl2ZXJ5IG1pbGVzdG9uZXMgcmVjb3JkZWQgeWV0Ljwvc3Bhbj48L2Rpdj5gKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdCQoJyN0aW1lbGluZS1heGlzLWJhcicpLnNob3coKTtcclxuXHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdG1pbGVzdG9uZXMuZm9yRWFjaChtID0+IHtcclxuXHRcdFx0Y29uc3QgY29tcGxldGVkQ2xzID0gbS5jb21wbGV0ZWQgPyAnY29tcGxldGVkJyA6ICcnO1xyXG5cdFx0XHRjb25zdCBzYWZlVGl0bGUgPSBlc2NhcGVIdG1sKG0udGl0bGUgfHwgJycpO1xyXG5cdFx0XHRjb25zdCBzYWZlRHVlRGF0ZSA9IGVzY2FwZUh0bWwobS5kdWVfZGF0ZSB8fCAnJyk7XHJcblx0XHRcdGNvbnN0IHNhZmVTdGF0dXMgPSBlc2NhcGVIdG1sKG0uc3RhdHVzIHx8ICcnKTtcclxuXHRcdFx0Y29uc3QgJHB0ID0gJChgXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1pbGVzdG9uZS1tYXJrZXItcG9pbnRcIiBkYXRhLWlkPVwiJHtlc2NhcGVIdG1sKG0uaWQpfVwiIHRpdGxlPVwiJHtzYWZlVGl0bGV9ICgke3NhZmVEdWVEYXRlIHx8ICdUQkQnfSlcIj5cclxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibWlsZXN0b25lLWRhdGVcIj4ke3NhZmVEdWVEYXRlLmxlbmd0aCA+PSA1ID8gc2FmZUR1ZURhdGUuc3Vic3RyaW5nKDUpIDogc2FmZUR1ZURhdGV9PC9zcGFuPlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1pbGVzdG9uZS1kaWFtb25kICR7Y29tcGxldGVkQ2xzfVwiPjwvZGl2PlxyXG5cdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtaWxlc3RvbmUtbGFiZWxcIj4ke3NhZmVUaXRsZX08L3NwYW4+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cdFx0XHQkcHQub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGZyYXBwZS5tc2dwcmludCh7XHJcblx0XHRcdFx0XHR0aXRsZTogX18oJ01pbGVzdG9uZSBEZWxpdmVyeSBEZXRhaWxzJyksXHJcblx0XHRcdFx0XHRtZXNzYWdlOiBgPGg0PiR7c2FmZVRpdGxlfTwvaDQ+PHA+PHN0cm9uZz5UYXJnZXQgRHVlIERhdGU6PC9zdHJvbmc+ICR7c2FmZUR1ZURhdGUgfHwgJ05vbmUnfTwvcD48cD48c3Ryb25nPlN0YXR1czo8L3N0cm9uZz4gJHtzYWZlU3RhdHVzfTwvcD5gLFxyXG5cdFx0XHRcdFx0aW5kaWNhdG9yOiBtLmNvbXBsZXRlZCA/ICdncmVlbicgOiAnb3JhbmdlJ1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0JG1hcmtlcnMuYXBwZW5kKCRwdCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgMjogV09SSyBQQUNLQUdFUyBHUklEIChTY3JlZW5zaG90IDMpXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlcldvcmtQYWNrYWdlcyhzZWFyY2hRdWVyeSA9IG51bGwpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5saXN0X3dvcmtfcGFja2FnZXMnLFxyXG5cdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0cHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCxcclxuXHRcdFx0XHRmaWx0ZXJfa2V5OiBzZWxmLmFjdGl2ZUZpbHRlcktleSxcclxuXHRcdFx0XHR0eXBlX2ZpbHRlcjogc2VsZi5hY3RpdmVUeXBlRmlsdGVyLFxyXG5cdFx0XHRcdHNlYXJjaDogc2VhcmNoUXVlcnlcclxuXHRcdFx0fVxyXG5cdFx0fSkudGhlbihyID0+IHtcclxuXHRcdFx0Y29uc3QgaXRlbXMgPSByLm1lc3NhZ2UgfHwgW107XHJcblx0XHRcdGNvbnN0ICR0Ym9keSA9ICQoJyN3cC10YWJsZS1ib2R5Jyk7XHJcblx0XHRcdCR0Ym9keS5lbXB0eSgpO1xyXG5cclxuXHRcdFx0aWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdCR0Ym9keS5hcHBlbmQoJzx0cj48dGQgY29sc3Bhbj1cIjdcIiBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtbXV0ZWQgcC00XCI+Tm8gd29yayBwYWNrYWdlcyBtYXRjaCB0aGlzIGZpbHRlci48L3RkPjwvdHI+Jyk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zdCBhbGxvd2VkVHlwZXMgPSBbJ3Rhc2snLCAnbWlsZXN0b25lJywgJ3BoYXNlJywgJ2lzc3VlJywgJ2NsYXNoJ107XHJcblx0XHRcdGl0ZW1zLmZvckVhY2goaXQgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IHJhd1R5cGUgPSBTdHJpbmcoaXQudHlwZSB8fCAndGFzaycpLnRvTG93ZXJDYXNlKCk7XHJcblx0XHRcdFx0Y29uc3Qgc2FmZVR5cGUgPSBhbGxvd2VkVHlwZXMuaW5jbHVkZXMocmF3VHlwZSkgPyByYXdUeXBlIDogJ3Rhc2snO1xyXG5cdFx0XHRcdGNvbnN0IHBpbGxDbHMgPSBgd3AtcGlsbC0ke3NhZmVUeXBlfWA7XHJcblx0XHRcdFx0Y29uc3QgaW5kZW50ID0gaXQucGFyZW50X3Rhc2sgPyAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHUyMUIzICcgOiAnJztcclxuXHRcdFx0XHRjb25zdCAkdHIgPSAkKGBcclxuXHRcdFx0XHRcdDx0ciBjbGFzcz1cIndwLXJvdy1pdGVtXCIgZGF0YS1pZD1cIiR7ZXNjYXBlSHRtbChpdC5pZCl9XCIgc3R5bGU9XCJjdXJzb3I6IHBvaW50ZXI7XCI+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+IyR7ZXNjYXBlSHRtbChTdHJpbmcoaXQuaWQpLnJlcGxhY2UoJ1RBU0stJywgJycpKX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD4ke2luZGVudH08c3Ryb25nPiR7ZXNjYXBlSHRtbChpdC5zdWJqZWN0KX08L3N0cm9uZz48L3RkPlxyXG5cdFx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2VzY2FwZUh0bWwoaXQudHlwZSl9PC9zcGFuPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3RcIj48L3NwYW4+ICR7ZXNjYXBlSHRtbChpdC5zdGF0dXMpfTwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGw+JHtlc2NhcGVIdG1sKGl0LmFzc2lnbmVlX25hbWUgfHwgJ1VuYXNzaWduZWQnKX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGw+JHtlc2NhcGVIdG1sKGl0LnByaW9yaXR5KX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHRcdDx0ZD48c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtlc2NhcGVIdG1sKGl0LmV4cF9lbmRfZGF0ZSB8fCAnLS0nKX08L3NtYWxsPjwvdGQ+XHJcblx0XHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRcdGApO1xyXG5cclxuXHRcdFx0XHQkdHIub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0c2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3IoaXQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHQkdGJvZHkuYXBwZW5kKCR0cik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvcGVuV29ya1BhY2thZ2VJbnNwZWN0b3Iod3ApIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0Y29uc3QgZCA9IG5ldyBmcmFwcGUudWkuRGlhbG9nKHtcclxuXHRcdFx0dGl0bGU6IGBbJHt3cC50eXBlfV0gIyR7d3AuaWR9IC0gJHt3cC5zdWJqZWN0fWAsXHJcblx0XHRcdGZpZWxkczogW1xyXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnc3RhdHVzJywgbGFiZWw6IF9fKCdTdGF0dXMnKSwgZmllbGR0eXBlOiAnU2VsZWN0Jywgb3B0aW9uczogJ09wZW5cXG5Xb3JraW5nXFxuUGVuZGluZyBSZXZpZXdcXG5Db21wbGV0ZWRcXG5DYW5jZWxsZWQnLCBkZWZhdWx0OiB3cC5zdGF0dXMgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3ByaW9yaXR5JywgbGFiZWw6IF9fKCdQcmlvcml0eScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnTG93XFxuTm9ybWFsXFxuSGlnaFxcblVyZ2VudCcsIGRlZmF1bHQ6IHdwLnByaW9yaXR5IH0sXHJcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdleHBfZW5kX2RhdGUnLCBsYWJlbDogX18oJ0R1ZSBEYXRlJyksIGZpZWxkdHlwZTogJ0RhdGUnLCBkZWZhdWx0OiB3cC5leHBfZW5kX2RhdGUgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2xpbmtlZF9pbmZvJywgbGFiZWw6IF9fKCdEb21haW4gTGlua2FnZScpLCBmaWVsZHR5cGU6ICdIVE1MJyB9XHJcblx0XHRcdF0sXHJcblx0XHRcdHByaW1hcnlfYWN0aW9uX2xhYmVsOiBfXygnVXBkYXRlIFdvcmsgUGFja2FnZScpLFxyXG5cdFx0XHRwcmltYXJ5X2FjdGlvbih2YWx1ZXMpIHtcclxuXHRcdFx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50LnNldF92YWx1ZScsXHJcblx0XHRcdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0XHRcdGRvY3R5cGU6ICdUYXNrJyxcclxuXHRcdFx0XHRcdFx0bmFtZTogd3AuaWQsXHJcblx0XHRcdFx0XHRcdGZpZWxkbmFtZToge1xyXG5cdFx0XHRcdFx0XHRcdHN0YXR1czogdmFsdWVzLnN0YXR1cyxcclxuXHRcdFx0XHRcdFx0XHRwcmlvcml0eTogdmFsdWVzLnByaW9yaXR5LFxyXG5cdFx0XHRcdFx0XHRcdGV4cF9lbmRfZGF0ZTogdmFsdWVzLmV4cF9lbmRfZGF0ZVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRkLmhpZGUoKTtcclxuXHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1dvcmsgcGFja2FnZSB1cGRhdGVkLicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XHJcblx0XHRcdFx0XHRzZWxmLnJlbmRlcldvcmtQYWNrYWdlcygpO1xyXG5cdFx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2JvYXJkcycpIHNlbGYucmVuZGVyS2FuYmFuQm9hcmQoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0bGV0IGxpbmtIdG1sID0gJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+PHNtYWxsPk5hdGl2ZSBUYXNrIGluIEVSUE5leHQuPC9zbWFsbD48L2Rpdj4nO1xyXG5cdFx0aWYgKHdwLmJjZl90b3BpYykge1xyXG5cdFx0XHRsaW5rSHRtbCA9IGA8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtd2FybmluZyBkLWZsZXggYWxpZ24taXRlbXMtY2VudGVyIGdhcC0yXCI+PHNwYW4gY2xhc3M9XCJtci0xXCI+JHtJQ09OUy5jdWJlfTwvc3Bhbj4gPGRpdj5MaW5rZWQgdG8gQkNGIENsYXNoIFRvcGljOiA8c3Ryb25nPiR7d3AuYmNmX3RvcGljfTwvc3Ryb25nPjwvZGl2PjwvZGl2PmA7XHJcblx0XHR9IGVsc2UgaWYgKHdwLnJmaV9saW5rKSB7XHJcblx0XHRcdGxpbmtIdG1sID0gYDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1pbmZvIGQtZmxleCBhbGlnbi1pdGVtcy1jZW50ZXIgZ2FwLTJcIj48c3BhbiBjbGFzcz1cIm1yLTFcIj4ke0lDT05TLmluZm99PC9zcGFuPiA8ZGl2PkxpbmtlZCB0byBUZWNobmljYWwgUkZJOiA8c3Ryb25nPiR7d3AucmZpX2xpbmt9PC9zdHJvbmc+PC9kaXY+PC9kaXY+YDtcclxuXHRcdH1cclxuXHRcdGQuZmllbGRzX2RpY3QubGlua2VkX2luZm8uJHdyYXBwZXIuaHRtbChsaW5rSHRtbCk7XHJcblx0XHRkLnNob3coKTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgMzogS0FOQkFOIEJPQVJEUyAoSFRNTDUgRHJhZyAmIERyb3ApXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlckthbmJhbkJvYXJkKCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmdldF9rYW5iYW5fYm9hcmRfZGF0YScsXHJcblx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxyXG5cdFx0XHRcdGdyb3VwX2J5OiBzZWxmLmJvYXJkR3JvdXBCeVxyXG5cdFx0XHR9XHJcblx0XHR9KS50aGVuKHIgPT4ge1xyXG5cdFx0XHRjb25zdCBkYXRhID0gci5tZXNzYWdlIHx8IHt9O1xyXG5cdFx0XHRjb25zdCBjb2x1bW5zID0gZGF0YS5jb2x1bW5zIHx8IFtdO1xyXG5cdFx0XHRjb25zdCAkd3JhcHBlciA9ICQoJyNrYW5iYW4tY29sdW1ucy13cmFwcGVyJyk7XHJcblx0XHRcdCR3cmFwcGVyLmVtcHR5KCk7XHJcblxyXG5cdFx0XHRjb2x1bW5zLmZvckVhY2goY29sID0+IHtcclxuXHRcdFx0XHRjb25zdCAkY29sID0gJChgXHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwia2FuYmFuLWNvbHVtblwiIGRhdGEtY29sLWlkPVwiJHtjb2wuaWR9XCI+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb2x1bW4taGVhZGVyXCI+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4+JHtjb2wudGl0bGV9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYmFkZ2UgY29sLWNhcmQtY291bnRcIj4ke2NvbC5jYXJkcy5sZW5ndGh9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImNvbHVtbi1jYXJkcy1saXN0XCIgZGF0YS1jb2wtaWQ9XCIke2NvbC5pZH1cIj5cclxuXHRcdFx0XHRcdFx0XHQ8IS0tIENhcmRzIC0tPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdGApO1xyXG5cclxuXHRcdFx0XHRjb25zdCAkY2FyZHNMaXN0ID0gJGNvbC5maW5kKCcuY29sdW1uLWNhcmRzLWxpc3QnKTtcclxuXHJcblx0XHRcdFx0Ly8gTmF0aXZlIEhUTUw1IERyYWcgYW5kIERyb3AgaGFuZGxlcnMgb24gZHJvcHpvbmVcclxuXHRcdFx0XHQkY2FyZHNMaXN0Lm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnYmFja2dyb3VuZCcsICcjZTJlOGYwJyk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0JGNhcmRzTGlzdC5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdiYWNrZ3JvdW5kJywgJycpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdCRjYXJkc0xpc3Qub24oJ2Ryb3AnLCBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ2JhY2tncm91bmQnLCAnJyk7XHJcblx0XHRcdFx0XHRjb25zdCB0YXNrSWQgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcclxuXHRcdFx0XHRcdGNvbnN0IHRhcmdldENvbHVtbklkID0gY29sLmlkO1xyXG5cclxuXHRcdFx0XHRcdGlmICh0YXNrSWQgJiYgdGFyZ2V0Q29sdW1uSWQpIHtcclxuXHRcdFx0XHRcdFx0Ly8gT3B0aW1pc3RpYyBET00gdXBkYXRlXHJcblx0XHRcdFx0XHRcdGNvbnN0ICRkcmFnZ2VkQ2FyZCA9ICQoYFtkYXRhLXRhc2s9XCIke3Rhc2tJZH1cIl1gKTtcclxuXHRcdFx0XHRcdFx0aWYgKCRkcmFnZ2VkQ2FyZC5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRcdFx0JGNhcmRzTGlzdC5hcHBlbmQoJGRyYWdnZWRDYXJkKTtcclxuXHRcdFx0XHRcdFx0XHRzZWxmLnVwZGF0ZUJvYXJkQ29sdW1uQ291bnRzKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdC8vIFBlcnNpc3QgdG8gYmFja2VuZFxyXG5cdFx0XHRcdFx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdFx0XHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8udXBkYXRlX3dvcmtfcGFja2FnZV9zdGF0dXMnLFxyXG5cdFx0XHRcdFx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRcdFx0XHRcdHRhc2tfbmFtZTogdGFza0lkLFxyXG5cdFx0XHRcdFx0XHRcdFx0bmV3X2NvbHVtbjogdGFyZ2V0Q29sdW1uSWQsXHJcblx0XHRcdFx0XHRcdFx0XHRncm91cF9ieTogc2VsZi5ib2FyZEdyb3VwQnlcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1dvcmsgcGFja2FnZSBzdGF0dXMgdXBkYXRlZCB0byB7MH0nLCBbdGFyZ2V0Q29sdW1uSWRdKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0Ly8gUG9wdWxhdGUgY2FyZHNcclxuXHRcdFx0XHRjb2wuY2FyZHMuZm9yRWFjaChjYXJkID0+IHtcclxuXHRcdFx0XHRcdGNvbnN0IHBpbGxDbHMgPSBgd3AtcGlsbC0keyhjYXJkLnR5cGUgfHwgJ3Rhc2snKS50b0xvd2VyQ2FzZSgpfWA7XHJcblx0XHRcdFx0XHRjb25zdCBhc3NpZ25lZU5hbWUgPSBjYXJkLmFzc2lnbmVlX25hbWUgfHwgJyc7XHJcblx0XHRcdFx0XHRjb25zdCBhc3NpZ25lZUluaXRpYWxzID0gYXNzaWduZWVOYW1lID8gYXNzaWduZWVOYW1lLnNwbGl0KCcgJykubWFwKG4gPT4gblswXSkuam9pbignJykuc3Vic3RyaW5nKDAsIDIpLnRvVXBwZXJDYXNlKCkgOiAnJztcclxuXHRcdFx0XHRcdGNvbnN0IGFzc2lnbmVlSHRtbCA9IGFzc2lnbmVlTmFtZSA/IGBcclxuXHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJjYXJkLWFzc2lnbmVlLXBpbGxcIiB0aXRsZT1cIiR7YXNzaWduZWVOYW1lfVwiPlxyXG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYXNzaWduZWUtYXZhdGFyXCI+JHthc3NpZ25lZUluaXRpYWxzfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImFzc2lnbmVlLXRleHRcIj4ke2Fzc2lnbmVlTmFtZX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdDwvc3Bhbj5cclxuXHRcdFx0XHRcdGAgOiAnJztcclxuXHJcblx0XHRcdFx0XHRjb25zdCAkY2FyZCA9ICQoYFxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwia2FuYmFuLWNhcmRcIiBkcmFnZ2FibGU9XCJ0cnVlXCIgZGF0YS10YXNrPVwiJHtjYXJkLmlkfVwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY2FyZC1oZWFkXCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIndwLXBpbGwgJHtwaWxsQ2xzfVwiPiR7Y2FyZC50eXBlfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiY2FyZC1wcmlvcml0eSBwcmlvcml0eS0keyhjYXJkLnByaW9yaXR5IHx8ICdub3JtYWwnKS50b0xvd2VyQ2FzZSgpfVwiPiR7Y2FyZC5wcmlvcml0eX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImthbmJhbi1jYXJkLXRpdGxlXCI+JHtjYXJkLnN1YmplY3R9PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImthbmJhbi1jYXJkLWZvb3RcIj5cclxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiY2FyZC1kYXRlLWJhZGdlXCI+JHtJQ09OUy5jYWxlbmRhcn0gPHNwYW4+JHtjYXJkLmV4cF9lbmRfZGF0ZSB8fCAnLS0nfTwvc3Bhbj48L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHQke2Fzc2lnbmVlSHRtbH1cclxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRgKTtcclxuXHJcblx0XHRcdFx0XHQkY2FyZC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0XHRcdFx0ZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKCd0ZXh0L3BsYWluJywgY2FyZC5pZCk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHQkY2FyZC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRcdHNlbGYub3BlbldvcmtQYWNrYWdlSW5zcGVjdG9yKGNhcmQpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0JGNhcmRzTGlzdC5hcHBlbmQoJGNhcmQpO1xyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHQkd3JhcHBlci5hcHBlbmQoJGNvbCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGVCb2FyZENvbHVtbkNvdW50cygpIHtcclxuXHRcdCQoJy5rYW5iYW4tY29sdW1uJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IGNvdW50ID0gJCh0aGlzKS5maW5kKCcua2FuYmFuLWNhcmQnKS5sZW5ndGg7XHJcblx0XHRcdCQodGhpcykuZmluZCgnLmNvbC1jYXJkLWNvdW50JykudGV4dChjb3VudCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgNDogR0FOVFQgU0NIRURVTEUgVElNRUxJTkVcclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0cmVuZGVyR2FudHRDaGFydCgpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5saXN0X3dvcmtfcGFja2FnZXMnLFxyXG5cdFx0XHRhcmdzOiB7IHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsIGZpbHRlcl9rZXk6ICdhbGxfb3BlbicgfVxyXG5cdFx0fSkudGhlbihyID0+IHtcclxuXHRcdFx0Y29uc3QgaXRlbXMgPSByLm1lc3NhZ2UgfHwgW107XHJcblx0XHRcdGNvbnN0ICR0YXJnZXQgPSAkKCcjZnJhcHBlLWdhbnR0LXRhcmdldCcpO1xyXG5cdFx0XHQkdGFyZ2V0LmVtcHR5KCk7XHJcblxyXG5cdFx0XHRpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0JHRhcmdldC5odG1sKGBcclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJlbXB0eS1zdGF0ZS1jYXJkXCI+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJlbXB0eS1zdGF0ZS1pY29uIG1iLTIgdGV4dC1tdXRlZFwiPiR7SUNPTlMuY2FsZW5kYXJ9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxoNCBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDsgZm9udC1zaXplOjE1cHg7IGNvbG9yOiMxMTE4Mjc7IG1hcmdpbjowIDAgNnB4IDA7XCI+Tm8gU2NoZWR1bGVkIFRhc2tzPC9oND5cclxuXHRcdFx0XHRcdFx0PHAgY2xhc3M9XCJ0ZXh0LW11dGVkIG1iLTNcIiBzdHlsZT1cImZvbnQtc2l6ZToxM3B4OyBtYXgtd2lkdGg6IDM2MHB4O1wiPldvcmsgcGFja2FnZXMgd2l0aCBzdGFydCBhbmQgZHVlIGRhdGVzIHdpbGwgYXBwZWFyIGhlcmUgb24gYW4gaW50ZXJhY3RpdmUgc2NoZWR1bGUgdGltZWxpbmUuPC9wPlxyXG5cdFx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzPVwiYnRuLXRvcGJhci1wcmltYXJ5IGFjdGlvbi1xdWljay1hZGRcIiBkYXRhLXR5cGU9XCJUYXNrXCI+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4+KyBBZGQgVGFzazwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRgKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEZvcm1hdCB0YXNrcyBmb3IgR2FudHRcclxuXHRcdFx0Y29uc3Qgbm93U3RyID0gKGZyYXBwZS5kYXRldGltZSAmJiBmcmFwcGUuZGF0ZXRpbWUuZ2V0X3RvZGF5KSA/IGZyYXBwZS5kYXRldGltZS5nZXRfdG9kYXkoKSA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdO1xyXG5cdFx0XHRjb25zdCBnYW50dFRhc2tzID0gaXRlbXMubWFwKGl0ID0+IHtcclxuXHRcdFx0XHRjb25zdCBzdGFydCA9IGl0LmV4cF9zdGFydF9kYXRlIHx8IG5vd1N0cjtcclxuXHRcdFx0XHRjb25zdCBlbmQgPSBpdC5leHBfZW5kX2RhdGUgfHwgKChmcmFwcGUuZGF0ZXRpbWUgJiYgZnJhcHBlLmRhdGV0aW1lLmFkZF9kYXlzKSA/IGZyYXBwZS5kYXRldGltZS5hZGRfZGF5cyhzdGFydCwgNykgOiBzdGFydCk7XHJcblx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdGlkOiBpdC5pZCxcclxuXHRcdFx0XHRcdG5hbWU6IGBbJHtpdC50eXBlfV0gJHtpdC5zdWJqZWN0fWAsXHJcblx0XHRcdFx0XHRzdGFydDogc3RhcnQsXHJcblx0XHRcdFx0XHRlbmQ6IGVuZCxcclxuXHRcdFx0XHRcdHByb2dyZXNzOiBpdC5wcm9ncmVzcyB8fCAwLFxyXG5cdFx0XHRcdFx0Y3VzdG9tX2NsYXNzOiBgYmFyLSR7aXQudHlwZS50b0xvd2VyQ2FzZSgpfWBcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGlmICh3aW5kb3cuR2FudHQpIHtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0c2VsZi5nYW50dENoYXJ0ID0gbmV3IHdpbmRvdy5HYW50dCgnI2ZyYXBwZS1nYW50dC10YXJnZXQnLCBnYW50dFRhc2tzLCB7XHJcblx0XHRcdFx0XHRcdHZpZXdfbW9kZXM6IFsnUXVhcnRlciBEYXknLCAnSGFsZiBEYXknLCAnRGF5JywgJ1dlZWsnLCAnTW9udGgnXSxcclxuXHRcdFx0XHRcdFx0dmlld19tb2RlOiAnRGF5JyxcclxuXHRcdFx0XHRcdFx0ZGF0ZV9mb3JtYXQ6ICdZWVlZLU1NLUREJyxcclxuXHRcdFx0XHRcdFx0b25fY2xpY2s6ICh0YXNrKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3Qgd3AgPSBpdGVtcy5maW5kKGkgPT4gaS5pZCA9PT0gdGFzay5pZCk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKHdwKSBzZWxmLm9wZW5Xb3JrUGFja2FnZUluc3BlY3Rvcih3cCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRcdCQoJy5nYW50dC1zY2FsZS1ncm91cCAuYnRuLWdhbnR0LXNjYWxlJykub2ZmKCdjbGljaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0JCgnLmdhbnR0LXNjYWxlLWdyb3VwIC5idG4tZ2FudHQtc2NhbGUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblx0XHRcdFx0XHRcdCQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cdFx0XHRcdFx0XHRjb25zdCBzY2FsZSA9ICQodGhpcykuZGF0YSgnc2NhbGUnKTtcclxuXHRcdFx0XHRcdFx0aWYgKHNlbGYuZ2FudHRDaGFydCAmJiBzZWxmLmdhbnR0Q2hhcnQuY2hhbmdlX3ZpZXdfbW9kZSkge1xyXG5cdFx0XHRcdFx0XHRcdHNlbGYuZ2FudHRDaGFydC5jaGFuZ2Vfdmlld19tb2RlKHNjYWxlKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdGcmFwcGUgR2FudHQgaW5zdGFudGlhdGlvbiBmYWlsZWQsIHJlbmRlcmluZyBjdXN0b20gdGltZWxpbmUgZmFsbGJhY2snLCBlKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEN1c3RvbSBJbnRlcmFjdGl2ZSBUaW1lbGluZSBWaXN1YWxpemF0aW9uIEZhbGxiYWNrXHJcblx0XHRcdGxldCBodG1sID0gJzxkaXYgY2xhc3M9XCJjdXN0b20tZ2FudHQtdGFibGUgdGFibGUtcmVzcG9uc2l2ZVwiPjx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWNvbmRlbnNlZFwiPjx0aGVhZD48dHI+PHRoIHdpZHRoPVwiMzAlXCI+V29yayBQYWNrYWdlPC90aD48dGggd2lkdGg9XCIxNSVcIj5TdGFydCBEYXRlPC90aD48dGggd2lkdGg9XCIxNSVcIj5EdWUgRGF0ZTwvdGg+PHRoIHdpZHRoPVwiNDAlXCI+VGltZWxpbmUgUHJvZ3Jlc3M8L3RoPjwvdHI+PC90aGVhZD48dGJvZHk+JztcclxuXHRcdFx0aXRlbXMuZm9yRWFjaChpdCA9PiB7XHJcblx0XHRcdFx0Y29uc3QgcGlsbENscyA9IGB3cC1waWxsLSR7KGl0LnR5cGUgfHwgJ3Rhc2snKS50b0xvd2VyQ2FzZSgpfWA7XHJcblx0XHRcdFx0Y29uc3QgcHJvZ3Jlc3MgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDAsIGl0LnByb2dyZXNzIHx8IChpdC5zdGF0dXMgPT09ICdDb21wbGV0ZWQnID8gMTAwIDogMjUpKSk7XHJcblx0XHRcdFx0aHRtbCArPSBgXHJcblx0XHRcdFx0XHQ8dHIgY2xhc3M9XCJ3cC1nYW50dC1yb3dcIiBkYXRhLWlkPVwiJHtpdC5pZH1cIiBzdHlsZT1cImN1cnNvcjogcG9pbnRlcjtcIj5cclxuXHRcdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwid3AtcGlsbCAke3BpbGxDbHN9XCI+JHtpdC50eXBlfTwvc3Bhbj4gPHN0cm9uZz4ke2l0LnN1YmplY3R9PC9zdHJvbmc+PC90ZD5cclxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbD4ke2l0LmV4cF9zdGFydF9kYXRlIHx8ICctLSd9PC9zbWFsbD48L3RkPlxyXG5cdFx0XHRcdFx0XHQ8dGQ+PHNtYWxsPiR7aXQuZXhwX2VuZF9kYXRlIHx8ICctLSd9PC9zbWFsbD48L3RkPlxyXG5cdFx0XHRcdFx0XHQ8dGQ+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInByb2dyZXNzXCIgc3R5bGU9XCJtYXJnaW46IDA7IGhlaWdodDogMThweDsgYm9yZGVyLXJhZGl1czogOXB4OyBiYWNrZ3JvdW5kOiAjZTJlOGYwO1wiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItc3RyaXBlZFwiIHJvbGU9XCJwcm9ncmVzc2JhclwiIHN0eWxlPVwid2lkdGg6ICR7cHJvZ3Jlc3N9JTsgYmFja2dyb3VuZDogIzAyODRjNztcIj5cclxuXHRcdFx0XHRcdFx0XHRcdFx0JHtwcm9ncmVzc30lXHJcblx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdFx0PC90ZD5cclxuXHRcdFx0XHRcdDwvdHI+XHJcblx0XHRcdFx0YDtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGh0bWwgKz0gJzwvdGJvZHk+PC90YWJsZT48L2Rpdj4nO1xyXG5cdFx0XHQkdGFyZ2V0Lmh0bWwoaHRtbCk7XHJcblxyXG5cdFx0XHQkdGFyZ2V0LmZpbmQoJy53cC1nYW50dC1yb3cnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0Y29uc3QgaWQgPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XHJcblx0XHRcdFx0Y29uc3Qgd3AgPSBpdGVtcy5maW5kKGkgPT4gaS5pZCA9PT0gaWQpO1xyXG5cdFx0XHRcdGlmICh3cCkgc2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3Iod3ApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8vIFRBQiA1OiBCQ0YgMi1QQU5FIENPT1JESU5BVElPTiBWSUVXRVIgKFNjcmVlbnNob3QgNClcclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0cmVuZGVyQmNmVmlld2VyKHRhcmdldE1vZGVsID0gbnVsbCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gMS4gVXBkYXRlIDNEIEJJTSBWaWV3ZXIgSWZyYW1lIFVSTCB3aXRoIHByb2plY3QgYW5kIHRhcmdldCBtb2RlbFxyXG5cdFx0Y29uc3QgJGlmcmFtZSA9ICQoJyNpZnJhbWUtYmNmLTNkLXZpZXdlcicpO1xyXG5cdFx0Y29uc3QgdGFyZ2V0UGFyYW0gPSB0YXJnZXRNb2RlbCA/IGAmbW9kZWw9JHtlbmNvZGVVUklDb21wb25lbnQodGFyZ2V0TW9kZWwpfWAgOiAnJztcclxuXHRcdGNvbnN0IGV4cGVjdGVkU3JjID0gYC9hcHAvYmltLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfSR7dGFyZ2V0UGFyYW19YDtcclxuXHRcdGlmICgkaWZyYW1lLmxlbmd0aCAmJiAkaWZyYW1lLmF0dHIoJ3NyYycpICE9PSBleHBlY3RlZFNyYykge1xyXG5cdFx0XHQkaWZyYW1lLmF0dHIoJ3NyYycsIGV4cGVjdGVkU3JjKTtcclxuXHRcdH1cclxuXHRcdCQoJyNidG4tYmNmLW9wZW4tZnVsbHNjcmVlbicpLmF0dHIoJ2hyZWYnLCBleHBlY3RlZFNyYyk7XHJcblxyXG5cdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5nZXRfYmNmX2Nvb3JkaW5hdGlvbl9kYXRhJyxcclxuXHRcdFx0YXJnczogeyBwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0IH1cclxuXHRcdH0pLnRoZW4ociA9PiB7XHJcblx0XHRcdGNvbnN0IGRhdGEgPSByLm1lc3NhZ2UgfHwgeyBtb2RlbHM6IFtdLCB0b3BpY3M6IFtdIH07XHJcblx0XHRcdGNvbnN0IG1vZGVscyA9IGRhdGEubW9kZWxzIHx8IFtdO1xyXG5cdFx0XHRjb25zdCB0b3BpY3MgPSBkYXRhLnRvcGljcyB8fCBbXTtcclxuXHJcblx0XHRcdC8vIDIuIFBvcHVsYXRlIFNwYXRpYWwgTW9kZWwgVHJlZVxyXG5cdFx0XHRjb25zdCAkdHJlZSA9ICQoJyNiY2YtbW9kZWxzLXRyZWUnKTtcclxuXHRcdFx0JHRyZWUuZW1wdHkoKTtcclxuXHJcblx0XHRcdGlmIChtb2RlbHMubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0JHRyZWUuYXBwZW5kKCc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBwLTMgdGV4dC1jZW50ZXJcIj48c21hbGw+Tm8gSUZDIG1vZGVscyB1cGxvYWRlZCB5ZXQuPGJyPkNsaWNrIDxzdHJvbmc+KyBVcGxvYWQgSUZDPC9zdHJvbmc+IGFib3ZlIHRvIGFkZCBvbmUuPC9zbWFsbD48L2Rpdj4nKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRtb2RlbHMuZm9yRWFjaChtID0+IHtcclxuXHRcdFx0XHRcdGNvbnN0IGlzQ2hlY2tlZCA9IHRhcmdldE1vZGVsID8gKG0ubmFtZSA9PT0gdGFyZ2V0TW9kZWwgfHwgbS5tb2RlbF9uYW1lID09PSB0YXJnZXRNb2RlbCkgOiB0cnVlO1xyXG5cdFx0XHRcdFx0JHRyZWUuYXBwZW5kKGBcclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1vZGVsLXRyZWUtcm93IHAtMiBmbGV4LWJldHdlZW5cIiBzdHlsZT1cImJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZjFmNWY5OyBib3JkZXItcmFkaXVzOiA2cHg7XCI+XHJcblx0XHRcdFx0XHRcdFx0PGxhYmVsIHN0eWxlPVwiZm9udC13ZWlnaHQ6IG5vcm1hbDsgZm9udC1zaXplOiAxMi41cHg7IGN1cnNvcjogcG9pbnRlcjsgbWFyZ2luOiAwOyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDZweDtcIj5cclxuXHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjbGFzcz1cIm1vZGVsLXRyZWUtY2JcIiAke2lzQ2hlY2tlZCA/ICdjaGVja2VkJyA6ICcnfSBkYXRhLW1vZGVsPVwiJHttLm5hbWV9XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImJhZGdlXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiNlMGU3ZmY7IGNvbG9yOiM0MzM4Y2E7IGZvbnQtc2l6ZToxMHB4OyBmb250LXdlaWdodDo2MDA7XCI+JHttLmRpc2NpcGxpbmUgfHwgJ0lGQyd9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4+JHttLm1vZGVsX25hbWUgfHwgbS5uYW1lfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxyXG5cdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImFjdGlvbi1mb2N1cy1tb2RlbCB0ZXh0LW11dGVkIG1sLTFcIiBkYXRhLW1vZGVsPVwiJHttLm5hbWV9XCIgdGl0bGU9XCJWaWV3IHRoaXMgbW9kZWxcIj4ke0lDT05TLmV5ZX08L2E+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0YCk7XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdCR0cmVlLmZpbmQoJy5tb2RlbC10cmVlLWNiJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdGNvbnN0IG1OYW1lID0gJCh0aGlzKS5kYXRhKCdtb2RlbCcpO1xyXG5cdFx0XHRcdFx0aWYgKCQodGhpcykuaXMoJzpjaGVja2VkJykpIHtcclxuXHRcdFx0XHRcdFx0JCgnI2lmcmFtZS1iY2YtM2Qtdmlld2VyJykuYXR0cignc3JjJywgYC9hcHAvYmltLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuY3VycmVudFByb2plY3QpfSZtb2RlbD0ke2VuY29kZVVSSUNvbXBvbmVudChtTmFtZSl9YCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdCR0cmVlLmZpbmQoJy5hY3Rpb24tZm9jdXMtbW9kZWwnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0XHRjb25zdCBtTmFtZSA9ICQodGhpcykuZGF0YSgnbW9kZWwnKTtcclxuXHRcdFx0XHRcdCR0cmVlLmZpbmQoJy5tb2RlbC10cmVlLWNiJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcclxuXHRcdFx0XHRcdCR0cmVlLmZpbmQoYC5tb2RlbC10cmVlLWNiW2RhdGEtbW9kZWw9XCIke21OYW1lfVwiXWApLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRcdCQoJyNpZnJhbWUtYmNmLTNkLXZpZXdlcicpLmF0dHIoJ3NyYycsIGAvYXBwL2JpbS12aWV3ZXI/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWxmLmN1cnJlbnRQcm9qZWN0KX0mbW9kZWw9JHtlbmNvZGVVUklDb21wb25lbnQobU5hbWUpfWApO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyAzLiBQb3B1bGF0ZSBCQ0YgVG9waWNzXHJcblx0XHRcdCQoJyNiY2YtdG9waWMtY291bnQnKS50ZXh0KHRvcGljcy5sZW5ndGgpO1xyXG5cdFx0XHRjb25zdCAkc3RyZWFtID0gJCgnI2JjZi1jYXJkcy1jb250YWluZXInKTtcclxuXHRcdFx0JHN0cmVhbS5lbXB0eSgpO1xyXG5cclxuXHRcdFx0aWYgKHRvcGljcy5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHQkc3RyZWFtLmFwcGVuZCgnPGRpdiBjbGFzcz1cInRleHQtbXV0ZWQgcC00IHRleHQtY2VudGVyXCI+PHNtYWxsPk5vIEJDRiB0b3BpY3MgbG9nZ2VkIGZvciB0aGlzIHByb2plY3QuPC9zbWFsbD48L2Rpdj4nKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0b3BpY3MuZm9yRWFjaCh0b3AgPT4ge1xyXG5cdFx0XHRcdFx0JHN0cmVhbS5hcHBlbmQoYFxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiYmNmLXRvcGljLWNhcmQgbWItMlwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4LWJldHdlZW4gbWItMVwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJzdGF0dXMtd2FybmluZy1waWxsXCI+JHtlc2NhcGVIdG1sKHRvcC50b3BpY190eXBlKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cInRleHQtbXV0ZWRcIiBzdHlsZT1cImZvbnQtc2l6ZToxMXB4O1wiPiR7ZXNjYXBlSHRtbCh0b3Auc3RhdHVzKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvbnQtd2VpZ2h0LW1lZGl1bVwiIHN0eWxlPVwiZm9udC1zaXplOjEzcHg7IGNvbG9yOiMxMTE4Mjc7XCI+JHtlc2NhcGVIdG1sKHRvcC50aXRsZSl9PC9kaXY+XHJcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRleHQtbXV0ZWQgZC1mbGV4IGFsaWduLWl0ZW1zLWNlbnRlciBnYXAtMSBtdC0xXCIgc3R5bGU9XCJmb250LXNpemU6MTEuNXB4O1wiPlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4+JHtJQ09OUy5jbG9ja308L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3Bhbj4ke2VzY2FwZUh0bWwodG9wLmNyZWF0aW9uID8gdG9wLmNyZWF0aW9uLnNwbGl0KCcgJylbMF0gOiAnLS0nKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm14LTFcIj5cdTIwMjI8L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3Bhbj4ke2VzY2FwZUh0bWwodG9wLmFzc2lnbmVkX3RvIHx8ICdVbmFzc2lnbmVkJyl9PC9zcGFuPlxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdGApO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgODogUFJPSkVDVCBET0NVTUVOVFMgVFJFRSAmIFVQTE9BRFxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHRyZW5kZXJEb2N1bWVudHNUcmVlKCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmdldF9wcm9qZWN0X2RvY3VtZW50X3RyZWUnLFxyXG5cdFx0XHRhcmdzOiB7IHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QgfVxyXG5cdFx0fSkudGhlbihyID0+IHtcclxuXHRcdFx0Y29uc3QgZm9sZGVycyA9IHIubWVzc2FnZSB8fCBbXTtcclxuXHRcdFx0Y29uc3QgJGNvbnQgPSAkKCcjZG9jdW1lbnQtZm9sZGVycy1jb250YWluZXInKTtcclxuXHRcdFx0JGNvbnQuZW1wdHkoKTtcclxuXHJcblx0XHRcdGNvbnN0IGZvbGRlckNvbmZpZyA9IHtcclxuXHRcdFx0XHQnMDEgQ29udHJhY3RzICYgTlRQJzogeyBpY29uOiBJQ09OUy5maWxlLCBiZzogJyNlZmY2ZmYnLCBjb2xvcjogJyMyNTYzZWInIH0sXHJcblx0XHRcdFx0JzAyIERyYXdpbmdzICYgU3BlY3MnOiB7IGljb246IElDT05TLmxpc3QsIGJnOiAnI2Y1ZjNmZicsIGNvbG9yOiAnIzdjM2FlZCcgfSxcclxuXHRcdFx0XHQnMDMgQklNIE1vZGVscyc6IHsgaWNvbjogSUNPTlMuY3ViZSwgYmc6ICcjZmZmYmViJywgY29sb3I6ICcjZDk3NzA2JyB9LFxyXG5cdFx0XHRcdCcwNCBCT1EgJiBFc3RpbWF0ZXMnOiB7IGljb246IElDT05TLnRhYmxlLCBiZzogJyNlY2ZkZjUnLCBjb2xvcjogJyMwNTk2NjknIH0sXHJcblx0XHRcdFx0JzA1IFNpdGUgTWVkaWEnOiB7IGljb246IElDT05TLmNhbWVyYSwgYmc6ICcjZmZmMWYyJywgY29sb3I6ICcjZTExZDQ4JyB9XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRmb2xkZXJzLmZvckVhY2goZiA9PiB7XHJcblx0XHRcdFx0Y29uc3QgY2ZnID0gZm9sZGVyQ29uZmlnW2YuZm9sZGVyX25hbWVdIHx8IHsgaWNvbjogSUNPTlMuZm9sZGVyLCBiZzogJyNmMWY1ZjknLCBjb2xvcjogJyM0NzU0NjcnIH07XHJcblx0XHRcdFx0Y29uc3QgJGJveCA9ICQoYFxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImRvYy1mb2xkZXItY2FyZFwiPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZm9sZGVyLWhlYWRlclwiPlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmb2xkZXItaWNvbi1waWxsXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAke2NmZy5iZ307IGNvbG9yOiAke2NmZy5jb2xvcn07XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQke2NmZy5pY29ufVxyXG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmb2xkZXItdGl0bGUtYm94XCI+XHJcblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImZvbGRlci1uYW1lXCI+JHtmLmZvbGRlcl9uYW1lfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiZm9sZGVyLWNvdW50LWJhZGdlXCI+JHtmLmZpbGVzLmxlbmd0aH0gaXRlbXM8L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZm9sZGVyLWZpbGVzLWxpc3RcIj5cclxuXHRcdFx0XHRcdFx0XHQ8IS0tIEZpbGVzIC0tPlxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdGApO1xyXG5cclxuXHRcdFx0XHRjb25zdCAkZkxpc3QgPSAkYm94LmZpbmQoJy5mb2xkZXItZmlsZXMtbGlzdCcpO1xyXG5cdFx0XHRcdGlmIChmLmZpbGVzLmxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRcdFx0JGZMaXN0LmFwcGVuZCgnPGRpdiBjbGFzcz1cInRleHQtbXV0ZWQgcC0zIHRleHQtY2VudGVyXCIgc3R5bGU9XCJmb250LXNpemU6MTJweDtcIj5ObyBmaWxlcyBpbiBmb2xkZXI8L2Rpdj4nKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Zi5maWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xyXG5cdFx0XHRcdFx0XHQkZkxpc3QuYXBwZW5kKGBcclxuXHRcdFx0XHRcdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJmaWxlLWl0ZW0tbGlua1wiIGRhdGEtcm91dGU9XCIke2ZpbGUucm91dGVfdGFyZ2V0fVwiIGRhdGEtdXJsPVwiJHtmaWxlLmZpbGVfdXJsfVwiIGRhdGEtbW9kZWwtaWQ9XCIke2ZpbGUubW9kZWxfaWQgfHwgZmlsZS5pZCB8fCAnJ31cIj5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmaWxlLWl0ZW0tbGVmdFwiPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cInRleHQtbXV0ZWQgbXItMVwiPiR7SUNPTlMuZmlsZX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiZmlsZS1uYW1lLXRleHRcIj4ke2ZpbGUuZmlsZV9uYW1lfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJmb2xkZXItY291bnQtYmFkZ2VcIj4ke2ZpbGUuYmFkZ2UgfHwgJ0ZpbGUnfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8L2E+XHJcblx0XHRcdFx0XHRcdGApO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQkY29udC5hcHBlbmQoJGJveCk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0JGNvbnQuZmluZCgnLmZpbGUtaXRlbS1saW5rJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGNvbnN0IHJvdXRlID0gJCh0aGlzKS5kYXRhKCdyb3V0ZScpO1xyXG5cdFx0XHRcdGNvbnN0IHVybCA9ICQodGhpcykuZGF0YSgndXJsJyk7XHJcblx0XHRcdFx0Y29uc3QgbW9kZWxJZCA9ICQodGhpcykuZGF0YSgnbW9kZWwtaWQnKTtcclxuXHRcdFx0XHRpZiAocm91dGUgPT09ICdiaW0tdmlld2VyJyB8fCAodXJsICYmIHVybC5lbmRzV2l0aCgnLmlmYycpKSkge1xyXG5cdFx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2JjZicsIHsgbW9kZWw6IG1vZGVsSWQgfSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ2R3Zy12aWV3ZXInIHx8ICh1cmwgJiYgKHVybC5lbmRzV2l0aCgnLmR3ZycpIHx8IHVybC5lbmRzV2l0aCgnLmR4ZicpKSkpIHtcclxuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdjYWQnLCB7IGZpbGU6IHVybCB9KTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHJvdXRlID09PSAncGRmLXRha2VvZmYnIHx8ICh1cmwgJiYgdXJsLmVuZHNXaXRoKCcucGRmJykpKSB7XHJcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYigncGRmJywgeyBmaWxlOiB1cmwgfSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmICh1cmwpIHtcclxuXHRcdFx0XHRcdHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGhhbmRsZVVwbG9hZGVkRmlsZShmaWxlRG9jKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGNvbnN0IGV4dCA9IChmaWxlRG9jLmZpbGVfbmFtZSB8fCAnJykuc3BsaXQoJy4nKS5wb3AoKS50b0xvd2VyQ2FzZSgpO1xyXG5cdFx0aWYgKGV4dCA9PT0gJ2lmYycpIHtcclxuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnSW5nZXN0aW5nIElGQyBtb2RlbCBpbnRvIDNEIEJJTSBkYXRhYmFzZS4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcclxuXHRcdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYmltLmFwaS5jcmVhdGVfbW9kZWxfZnJvbV9pZmMnLFxyXG5cdFx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRcdGZpbGVfdXJsOiBmaWxlRG9jLmZpbGVfdXJsLFxyXG5cdFx0XHRcdFx0ZmlsZV9uYW1lOiBmaWxlRG9jLmZpbGVfbmFtZSxcclxuXHRcdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXHJcblx0XHRcdFx0XHRtb2RlbF9uYW1lOiBmaWxlRG9jLmZpbGVfbmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgJycpLFxyXG5cdFx0XHRcdFx0ZGlzY2lwbGluZTogJ0FyY2hpdGVjdHVyZSdcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pLnRoZW4ocmVzID0+IHtcclxuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdCSU0gTW9kZWwgaW5nZXN0ZWQgc3VjY2Vzc2Z1bGx5IScpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XHJcblx0XHRcdFx0c2VsZi5yZW5kZXJEb2N1bWVudHNUcmVlKCk7XHJcblx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ2JjZicsIHsgbW9kZWw6IHJlcy5tZXNzYWdlID8gcmVzLm1lc3NhZ2UubmFtZSA6IG51bGwgfSk7XHJcblx0XHRcdH0pLmNhdGNoKGVyciA9PiB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcignRmFpbGVkIHRvIHBhcnNlIElGQzonLCBlcnIpO1xyXG5cdFx0XHRcdGZyYXBwZS5tc2dwcmludChfXygnVXBsb2FkZWQgZmlsZSBzYXZlZCwgYnV0IElGQyBwYXJzaW5nIGVuY291bnRlcmVkIGFuIGlzc3VlOiAnKSArIChlcnIubWVzc2FnZSB8fCBlcnIpKTtcclxuXHRcdFx0XHRzZWxmLnJlbmRlckRvY3VtZW50c1RyZWUoKTtcclxuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYignYmNmJyk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnRmlsZSB1cGxvYWRlZCBzdWNjZXNzZnVsbHkuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcclxuXHRcdFx0c2VsZi5yZW5kZXJEb2N1bWVudHNUcmVlKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRvcGVuRmlsZVVwbG9hZERpYWxvZygpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0bmV3IGZyYXBwZS51aS5GaWxlVXBsb2FkZXIoe1xyXG5cdFx0XHRkb2N0eXBlOiAnUHJvamVjdCcsXHJcblx0XHRcdGRvY25hbWU6IHNlbGYuY3VycmVudFByb2plY3QsXHJcblx0XHRcdGZvbGRlcjogJ0hvbWUnLFxyXG5cdFx0XHRvbl9zdWNjZXNzKGZpbGVfZG9jKSB7XHJcblx0XHRcdFx0c2VsZi5oYW5kbGVVcGxvYWRlZEZpbGUoZmlsZV9kb2MpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdG9wZW5CY2ZVcGxvYWREaWFsb2coKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdG5ldyBmcmFwcGUudWkuRmlsZVVwbG9hZGVyKHtcclxuXHRcdFx0ZG9jdHlwZTogJ1Byb2plY3QnLFxyXG5cdFx0XHRkb2NuYW1lOiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxyXG5cdFx0XHRmb2xkZXI6ICdIb21lJyxcclxuXHRcdFx0cmVzdHJpY3Rpb25zOiB7XHJcblx0XHRcdFx0YWxsb3dlZF9maWxlX3R5cGVzOiBbJy5pZmMnXVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRvbl9zdWNjZXNzKGZpbGVfZG9jKSB7XHJcblx0XHRcdFx0c2VsZi5oYW5kbGVVcGxvYWRlZEZpbGUoZmlsZV9kb2MpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgOTogTUVFVElOR1MgJiBUT09MQk9YIFRBTEtTXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHJlbmRlck1lZXRpbmdzVGFiKCkge1xyXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XHJcblx0XHRjb25zdCBkYXRhID0gdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhIHx8IHt9O1xyXG5cdFx0Y29uc3QgbWVldGluZ3MgPSBkYXRhLm1lZXRpbmdzIHx8IFtdO1xyXG5cdFx0Y29uc3QgJGNvbnQgPSAkKCcjbWVldGluZ3MtdGFiLWNvbnRhaW5lcicpO1xyXG5cdFx0JGNvbnQuZW1wdHkoKTtcclxuXHJcblx0XHRpZiAobWVldGluZ3MubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdCRjb250Lmh0bWwoYFxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJlbXB0eS1zdGF0ZS1jYXJkXCI+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZW1wdHktc3RhdGUtaWNvbiBtYi0yIHRleHQtbXV0ZWRcIj4ke0lDT05TLmNhbGVuZGFyfTwvZGl2PlxyXG5cdFx0XHRcdFx0PGg0IHN0eWxlPVwiZm9udC13ZWlnaHQ6NjAwOyBmb250LXNpemU6MTVweDsgY29sb3I6IzExMTgyNzsgbWFyZ2luOjAgMCA2cHggMDtcIj5ObyBCcmllZmluZ3MgU2NoZWR1bGVkPC9oND5cclxuXHRcdFx0XHRcdDxwIGNsYXNzPVwidGV4dC1tdXRlZCBtYi0zXCIgc3R5bGU9XCJmb250LXNpemU6MTNweDsgbWF4LXdpZHRoOiAzNjBweDtcIj5ObyBjb29yZGluYXRpb24gbWVldGluZ3Mgb3IgdG9vbGJveCB0YWxrcyByZWNvcmRlZCB5ZXQgZm9yIHRoaXMgcHJvamVjdC48L3A+XHJcblx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzPVwiYnRuLXRvcGJhci1wcmltYXJ5XCIgaWQ9XCJidG4tc2NoZWR1bGUtbWVldGluZy1lbXB0eVwiPlxyXG5cdFx0XHRcdFx0XHQ8c3Bhbj4rIE5ldyBNZWV0aW5nPC9zcGFuPlxyXG5cdFx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdGApO1xyXG5cdFx0XHQkY29udC5maW5kKCcjYnRuLXNjaGVkdWxlLW1lZXRpbmctZW1wdHknKS5vbignY2xpY2snLCAoKSA9PiBzZWxmLm9wZW5TY2hlZHVsZU1lZXRpbmdEaWFsb2coKSk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRtZWV0aW5ncy5mb3JFYWNoKG0gPT4ge1xyXG5cdFx0XHRjb25zdCBkb2NUeXBlID0gbS5kb2N0eXBlIHx8IChtLnR5cGUgPT09ICdUb29sYm94IFRhbGsnID8gJ1Rvb2xib3ggVGFsaycgOiAnRXZlbnQnKTtcclxuXHRcdFx0Y29uc3QgaXNUb29sYm94ID0gbS50eXBlID09PSAnVG9vbGJveCBUYWxrJztcclxuXHRcdFx0Y29uc3QgcGlsbENscyA9IGlzVG9vbGJveCA/ICdtZWV0aW5nLXBpbGwtdG9vbGJveCcgOiAnbWVldGluZy1waWxsLWNvb3JkJztcclxuXHJcblx0XHRcdCRjb250LmFwcGVuZChgXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctY2FyZC1zdXJmYWNlXCI+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVldGluZy1jYXJkLW1haW5cIj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctY2FyZC1oZWFkZXJcIj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1lZXRpbmctYmFkZ2UgJHtwaWxsQ2xzfVwiPiR7ZXNjYXBlSHRtbChtLnR5cGUpfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8aDQgY2xhc3M9XCJtZWV0aW5nLXRpdGxlXCI+JHtlc2NhcGVIdG1sKG0udGl0bGUpfTwvaDQ+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVldGluZy1tZXRhLXJvd1wiPlxyXG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibWV0YS1pdGVtXCI+JHtJQ09OUy5jYWxlbmRhcn0gPHNwYW4+JHtlc2NhcGVIdG1sKG0uZGF0ZSl9PC9zcGFuPjwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1ldGEtZGl2aWRlclwiPlx1MjAyMjwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1ldGEtaXRlbVwiPiR7SUNPTlMudXNlcn0gPHNwYW4+Q29uZHVjdG9yOiAke2VzY2FwZUh0bWwobS5ob3N0IHx8ICdTaXRlIENvb3JkaW5hdG9yJyl9PC9zcGFuPjwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1ldGEtZGl2aWRlclwiPlx1MjAyMjwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1ldGEtaXRlbVwiPiR7SUNPTlMudXNlcnN9IDxzcGFuPkF0dGVuZGVlczogJHtlc2NhcGVIdG1sKG0ucGFydGljaXBhbnRzIHx8IDApfTwvc3Bhbj48L3NwYW4+XHJcblx0XHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVldGluZy1jYXJkLWFjdGlvblwiPlxyXG5cdFx0XHRcdFx0XHQ8YnV0dG9uIGNsYXNzPVwiYnRuLXRvcGJhci1hY3Rpb24gYnRuLXNtIGJ0bi12aWV3LW1lZXRpbmctZG9jXCIgZGF0YS1kb2N0eXBlPVwiJHtlc2NhcGVIdG1sKGRvY1R5cGUpfVwiIGRhdGEtbmFtZT1cIiR7ZXNjYXBlSHRtbChtLm5hbWUpfVwiPlxyXG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibXItMVwiPiR7SUNPTlMuZXllfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0XHQ8c3Bhbj5WaWV3IERvYzwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0PC9idXR0b24+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0YCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQkY29udC5maW5kKCcuYnRuLXZpZXctbWVldGluZy1kb2MnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGNvbnN0IGR0ID0gJCh0aGlzKS5kYXRhKCdkb2N0eXBlJykgfHwgJ0V2ZW50JztcclxuXHRcdFx0Y29uc3Qgbm0gPSAkKHRoaXMpLmRhdGEoJ25hbWUnKTtcclxuXHRcdFx0ZnJhcHBlLnNldF9yb3V0ZSgnRm9ybScsIGR0LCBubSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdG9wZW5TY2hlZHVsZU1lZXRpbmdEaWFsb2coKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGNvbnN0IGQgPSBuZXcgZnJhcHBlLnVpLkRpYWxvZyh7XHJcblx0XHRcdHRpdGxlOiBfXygnU2NoZWR1bGUgQ29vcmRpbmF0aW9uIE1lZXRpbmcgb3IgU2FmZXR5IEJyaWVmaW5nJyksXHJcblx0XHRcdGZpZWxkczogW1xyXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnbWVldGluZ190eXBlJywgbGFiZWw6IF9fKCdUeXBlJyksIGZpZWxkdHlwZTogJ1NlbGVjdCcsIG9wdGlvbnM6ICdUb29sYm94IFRhbGtcXG5Db29yZGluYXRpb24gTWVldGluZycsIGRlZmF1bHQ6ICdUb29sYm94IFRhbGsnIH0sXHJcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdzdWJqZWN0JywgbGFiZWw6IF9fKCdUb3BpYyAvIFN1YmplY3QnKSwgZmllbGR0eXBlOiAnRGF0YScsIHJlcWQ6IDEgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2RhdGUnLCBsYWJlbDogX18oJ0RhdGUnKSwgZmllbGR0eXBlOiAnRGF0ZScsIGRlZmF1bHQ6IChmcmFwcGUuZGF0ZXRpbWUgJiYgZnJhcHBlLmRhdGV0aW1lLmdldF90b2RheSkgPyBmcmFwcGUuZGF0ZXRpbWUuZ2V0X3RvZGF5KCkgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSwgcmVxZDogMSB9LFxyXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnY29uZHVjdG9yJywgbGFiZWw6IF9fKCdDb25kdWN0b3IgKFNhZmV0eSBPZmZpY2VyIC8gSG9zdCknKSwgZmllbGR0eXBlOiAnRGF0YScsIGRlZmF1bHQ6IGZyYXBwZS5zZXNzaW9uLnVzZXJfZnVsbG5hbWUgfHwgZnJhcHBlLnNlc3Npb24udXNlciB8fCAnQWRtaW5pc3RyYXRvcicsIHJlcWQ6IDEgfVxyXG5cdFx0XHRdLFxyXG5cdFx0XHRwcmltYXJ5X2FjdGlvbl9sYWJlbDogX18oJ0NyZWF0ZSBNZWV0aW5nJyksXHJcblx0XHRcdHByaW1hcnlfYWN0aW9uKHZhbHVlcykge1xyXG5cdFx0XHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLnNjaGVkdWxlX3Byb2plY3RfbWVldGluZycsXHJcblx0XHRcdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXHJcblx0XHRcdFx0XHRcdG1lZXRpbmdfdHlwZTogdmFsdWVzLm1lZXRpbmdfdHlwZSxcclxuXHRcdFx0XHRcdFx0c3ViamVjdDogdmFsdWVzLnN1YmplY3QsXHJcblx0XHRcdFx0XHRcdGRhdGU6IHZhbHVlcy5kYXRlLFxyXG5cdFx0XHRcdFx0XHRjb25kdWN0b3I6IHZhbHVlcy5jb25kdWN0b3JcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdGQuaGlkZSgpO1xyXG5cdFx0XHRcdFx0Y29uc3QgbGFiZWwgPSB2YWx1ZXMubWVldGluZ190eXBlID09PSAnVG9vbGJveCBUYWxrJyA/IF9fKCdUb29sYm94IHRhbGsgc2NoZWR1bGVkLicpIDogX18oJ0Nvb3JkaW5hdGlvbiBtZWV0aW5nIHNjaGVkdWxlZC4nKTtcclxuXHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xyXG5cdFx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ21lZXRpbmdzJykge1xyXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHNlbGYucmVuZGVyTWVldGluZ3NUYWIoKSwgMTUwKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KS5jYXRjaChlcnIgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3Igc2NoZWR1bGluZyBtZWV0aW5nOicsIGVycik7XHJcblx0XHRcdFx0XHRmcmFwcGUubXNncHJpbnQoX18oJ0Vycm9yOiAnKSArIChlcnIubWVzc2FnZSB8fCBlcnIpKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRkLnNob3coKTtcclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHQvLyBUQUIgMTA6IE1FTUJFUlNcclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0cmVuZGVyTWVtYmVyc1RhYmxlKCkge1xyXG5cdFx0Y29uc3QgJHRib2R5ID0gJCgnI21lbWJlcnMtdGFibGUtYm9keScpO1xyXG5cdFx0JHRib2R5LmVtcHR5KCk7XHJcblx0XHRjb25zdCBtZW1iZXJzID0gKHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YSAmJiB0aGlzLnByb2plY3RPdmVydmlld0RhdGEubWVtYmVycykgfHwgW107XHJcblxyXG5cdFx0aWYgKG1lbWJlcnMubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdCR0Ym9keS5hcHBlbmQoJzx0cj48dGQgY29sc3Bhbj1cIjRcIiBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtbXV0ZWQgcC00XCI+PHNtYWxsPk5vIHRlYW0gbWVtYmVycyBhc3NpZ25lZCB0byB0aGlzIHByb2plY3QuPC9zbWFsbD48L3RkPjwvdHI+Jyk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRtZW1iZXJzLmZvckVhY2gobSA9PiB7XHJcblx0XHRcdGNvbnN0IGZ1bGxOYW1lID0gbS5mdWxsX25hbWUgfHwgbS51c2VyIHx8ICdNZW1iZXInO1xyXG5cdFx0XHRjb25zdCBpbml0aWFscyA9IGZ1bGxOYW1lLnNwbGl0KCcgJykubWFwKG4gPT4gblswXSkuam9pbignJykuc3Vic3RyaW5nKDAsIDIpLnRvVXBwZXJDYXNlKCkgfHwgJ01CJztcclxuXHRcdFx0JHRib2R5LmFwcGVuZChgXHJcblx0XHRcdFx0PHRyIGNsYXNzPVwibWVtYmVyLXRhYmxlLXJvd1wiPlxyXG5cdFx0XHRcdFx0PHRkPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVtYmVyLWNlbGxcIj5cclxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1lbWJlci1hdmF0YXItY2lyY2xlXCI+JHtlc2NhcGVIdG1sKGluaXRpYWxzKX08L3NwYW4+XHJcblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtZW1iZXItbmFtZSBmb250LXdlaWdodC1tZWRpdW1cIj4ke2VzY2FwZUh0bWwoZnVsbE5hbWUpfTwvc3Bhbj5cclxuXHRcdFx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdFx0XHQ8L3RkPlxyXG5cdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwidGV4dC1tdXRlZFwiPiR7ZXNjYXBlSHRtbChtLnVzZXIpfTwvc3Bhbj48L3RkPlxyXG5cdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwibWVtYmVyLXJvbGUtcGlsbFwiPiR7ZXNjYXBlSHRtbChtLnJvbGUgfHwgJ01lbWJlcicpfTwvc3Bhbj48L3RkPlxyXG5cdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwic3RhdHVzLWFjdGl2ZS1waWxsXCI+PHNwYW4gY2xhc3M9XCJzdGF0dXMtZG90LWdyZWVuXCI+PC9zcGFuPiBBY3RpdmU8L3NwYW4+PC90ZD5cclxuXHRcdFx0XHQ8L3RyPlxyXG5cdFx0XHRgKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdC8vIFRBQiAxMTogU0VUVElOR1NcclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0cmVuZGVyU2V0dGluZ3NUYWIoKSB7XHJcblx0XHRpZiAoIXRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YSkgcmV0dXJuO1xyXG5cdFx0Y29uc3Qgc3VtbWFyeSA9IHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YS5zdW1tYXJ5IHx8IHt9O1xyXG5cdFx0JCgnI3NldHRpbmctcHJvamVjdC1uYW1lJykudmFsKHN1bW1hcnkucHJvamVjdF9uYW1lIHx8ICcnKTtcclxuXHRcdCQoJyNzZXR0aW5nLXN0YXR1cy1uYXJyYXRpdmUnKS52YWwoc3VtbWFyeS5zdGF0dXNfbmFycmF0aXZlIHx8ICcnKTtcclxuXHRcdCQoJyNzZXR0aW5nLWlzLXRlbXBsYXRlJykucHJvcCgnY2hlY2tlZCcsICEhc3VtbWFyeS5pc190ZW1wbGF0ZSk7XHJcblx0XHQkKCcjc2V0dGluZy1pcy1mYXZvcml0ZScpLnByb3AoJ2NoZWNrZWQnLCAhIXN1bW1hcnkuaXNfZmF2b3JpdGUpO1xyXG5cdH1cclxuXHJcblx0c2F2ZVByb2plY3RTZXR0aW5ncygpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0Y29uc3Qgc2V0dGluZ3MgPSB7XHJcblx0XHRcdHByb2plY3RfbmFtZTogJCgnI3NldHRpbmctcHJvamVjdC1uYW1lJykudmFsKCksXHJcblx0XHRcdHN0YXR1c19uYXJyYXRpdmU6ICQoJyNzZXR0aW5nLXN0YXR1cy1uYXJyYXRpdmUnKS52YWwoKSxcclxuXHRcdFx0aXNfdGVtcGxhdGU6ICQoJyNzZXR0aW5nLWlzLXRlbXBsYXRlJykuaXMoJzpjaGVja2VkJykgPyAxIDogMCxcclxuXHRcdFx0aXNfZmF2b3JpdGU6ICQoJyNzZXR0aW5nLWlzLWZhdm9yaXRlJykuaXMoJzpjaGVja2VkJykgPyAxIDogMFxyXG5cdFx0fTtcclxuXHJcblx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLnVwZGF0ZV9wcm9qZWN0X3NldHRpbmdzJyxcclxuXHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXHJcblx0XHRcdFx0c2V0dGluZ3NfanNvbjogSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MpXHJcblx0XHRcdH1cclxuXHRcdH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdQcm9qZWN0IHNldHRpbmdzIHNhdmVkIHN1Y2Nlc3NmdWxseS4nKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xyXG5cdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0dG9nZ2xlQXJjaGl2ZVByb2plY3QoKSB7XHJcblx0XHRjb25zdCBzZWxmID0gdGhpcztcclxuXHRcdGNvbnN0IHByb2ogPSB0aGlzLmFsbFByb2plY3RzLmZpbmQocCA9PiBwLm5hbWUgPT09IHRoaXMuY3VycmVudFByb2plY3QpO1xyXG5cdFx0Y29uc3QgY3VycmVudEFjdGl2ZSA9IHByb2ogPyBwcm9qLmlzX2FjdGl2ZSA6ICdZZXMnO1xyXG5cdFx0Y29uc3QgbmV4dEFjdGl2ZSA9IGN1cnJlbnRBY3RpdmUgPT09ICdZZXMnID8gJ05vJyA6ICdZZXMnO1xyXG5cdFx0Y29uc3QgYWN0aW9uV29yZCA9IG5leHRBY3RpdmUgPT09ICdObycgPyBfXygnQXJjaGl2ZScpIDogX18oJ1Jlc3RvcmUnKTtcclxuXHJcblx0XHRmcmFwcGUuY29uZmlybShfXygnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHswfSB0aGlzIHByb2plY3Q/JywgW2FjdGlvbldvcmQudG9Mb3dlckNhc2UoKV0pLCAoKSA9PiB7XHJcblx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQoc2VsZi5jdXJyZW50UHJvamVjdCwgeyBpc19hY3RpdmU6IG5leHRBY3RpdmUgfSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCB7MH1kIHN1Y2Nlc3NmdWxseS4nLCBbYWN0aW9uV29yZC50b0xvd2VyQ2FzZSgpXSksIGluZGljYXRvcjogJ29yYW5nZScgfSk7XHJcblx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYignYWxsLXByb2plY3RzJyk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRjb25maXJtRGVsZXRlUHJvamVjdCgpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0ZnJhcHBlLmNvbmZpcm0oX18oJ1x1MjZBMFx1RkUwRiBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gUEVSTUFORU5UTFkgREVMRVRFIHswfT8gVGhpcyBjYW5ub3QgYmUgdW5kb25lLicsIFtzZWxmLmN1cnJlbnRQcm9qZWN0XSksICgpID0+IHtcclxuXHRcdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuZGVsZXRlJyxcclxuXHRcdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0XHRkb2N0eXBlOiAnUHJvamVjdCcsXHJcblx0XHRcdFx0XHRuYW1lOiBzZWxmLmN1cnJlbnRQcm9qZWN0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdQcm9qZWN0IGRlbGV0ZWQuJyksIGluZGljYXRvcjogJ3JlZCcgfSk7XHJcblx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRzZWxmLnN3aXRjaFRhYignYWxsLXByb2plY3RzJyk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblx0Ly8gUVVJQ0sgQ1JFQVRFIE1PREFMIChTY3JlZW5zaG90IDUpXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdG9wZW5RdWlja0NyZWF0ZU1vZGFsKHR5cGUpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0aWYgKHR5cGUgPT09ICdwcm9qZWN0JyB8fCB0eXBlID09PSAnc3VicHJvamVjdCcpIHtcclxuXHRcdFx0Y29uc3QgaXNTdWIgPSB0eXBlID09PSAnc3VicHJvamVjdCc7XHJcblx0XHRcdGNvbnN0IGQgPSBuZXcgZnJhcHBlLnVpLkRpYWxvZyh7XHJcblx0XHRcdFx0dGl0bGU6IGlzU3ViID8gX18oJ0FkZCBTdWJwcm9qZWN0JykgOiBfXygnQWRkIE5ldyBQcm9qZWN0JyksXHJcblx0XHRcdFx0ZmllbGRzOiBbXHJcblx0XHRcdFx0XHR7IGZpZWxkbmFtZTogJ3Byb2plY3RfbmFtZScsIGxhYmVsOiBfXygnUHJvamVjdCBOYW1lJyksIGZpZWxkdHlwZTogJ0RhdGEnLCByZXFkOiAxIH0sXHJcblx0XHRcdFx0XHR7IGZpZWxkbmFtZTogJ2Zyb21fdGVtcGxhdGUnLCBsYWJlbDogX18oJ0Nsb25lIGZyb20gVGVtcGxhdGUnKSwgZmllbGR0eXBlOiAnTGluaycsIG9wdGlvbnM6ICdQcm9qZWN0JyB9XHJcblx0XHRcdFx0XSxcclxuXHRcdFx0XHRwcmltYXJ5X2FjdGlvbl9sYWJlbDogX18oJ0NyZWF0ZSBQcm9qZWN0JyksXHJcblx0XHRcdFx0cHJpbWFyeV9hY3Rpb24odmFsdWVzKSB7XHJcblx0XHRcdFx0XHRpZiAodmFsdWVzLmZyb21fdGVtcGxhdGUpIHtcclxuXHRcdFx0XHRcdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRcdFx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmNsb25lX3Byb2plY3RfZnJvbV90ZW1wbGF0ZScsXHJcblx0XHRcdFx0XHRcdFx0YXJnczoge1xyXG5cdFx0XHRcdFx0XHRcdFx0dGVtcGxhdGVfcHJvamVjdDogdmFsdWVzLmZyb21fdGVtcGxhdGUsXHJcblx0XHRcdFx0XHRcdFx0XHRuZXdfcHJvamVjdF9uYW1lOiB2YWx1ZXMucHJvamVjdF9uYW1lXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KS50aGVuKHIgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGQuaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChpc1N1Yikge1xyXG5cdFx0XHRcdFx0XHRcdFx0c2VsZi51cGRhdGVQcm9qZWN0U2V0dGluZ3NGaWVsZChyLm1lc3NhZ2UubmV3X3Byb2plY3QsIHsgcGFyZW50X3Byb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QgfSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRzZWxmLnNlbGVjdFByb2plY3Qoci5tZXNzYWdlLm5ld19wcm9qZWN0KTtcclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRmcmFwcGUuY2FsbCh7XHJcblx0XHRcdFx0XHRcdFx0bWV0aG9kOiAnZnJhcHBlLmNsaWVudC5pbnNlcnQnLFxyXG5cdFx0XHRcdFx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRcdFx0XHRcdGRvYzoge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRkb2N0eXBlOiAnUHJvamVjdCcsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHByb2plY3RfbmFtZTogdmFsdWVzLnByb2plY3RfbmFtZSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0c3RhdHVzOiAnT3BlbicsXHJcblx0XHRcdFx0XHRcdFx0XHRcdGlzX2FjdGl2ZTogJ1llcycsXHJcblx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudF9wcm9qZWN0OiBpc1N1YiA/IHNlbGYuY3VycmVudFByb2plY3QgOiBudWxsXHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KS50aGVuKHIgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdGQuaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFpc1N1Yikgc2VsZi5zZWxlY3RQcm9qZWN0KHIubWVzc2FnZS5uYW1lKTtcclxuXHRcdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0ZC5zaG93KCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodHlwZSA9PT0gJ3VzZXInKSB7XHJcblx0XHRcdGNvbnN0IGQgPSBuZXcgZnJhcHBlLnVpLkRpYWxvZyh7XHJcblx0XHRcdFx0dGl0bGU6IF9fKCdJbnZpdGUgUHJvamVjdCBNZW1iZXInKSxcclxuXHRcdFx0XHRmaWVsZHM6IFtcclxuXHRcdFx0XHRcdHsgZmllbGRuYW1lOiAnZW1haWwnLCBsYWJlbDogX18oJ1VzZXIgRW1haWwnKSwgZmllbGR0eXBlOiAnRGF0YScsIHJlcWQ6IDEgfSxcclxuXHRcdFx0XHRcdHsgZmllbGRuYW1lOiAncm9sZScsIGxhYmVsOiBfXygnUHJvamVjdCBSb2xlJyksIGZpZWxkdHlwZTogJ1NlbGVjdCcsIG9wdGlvbnM6ICdQcm9qZWN0IE1hbmFnZXJcXG5BcmNoaXRlY3RcXG5TdHJ1Y3R1cmFsIEVuZ2luZWVyXFxuTUVQIENvb3JkaW5hdG9yXFxuU2FmZXR5IE9mZmljZXJcXG5RQyBJbnNwZWN0b3InLCBkZWZhdWx0OiAnUHJvamVjdCBNYW5hZ2VyJyB9XHJcblx0XHRcdFx0XSxcclxuXHRcdFx0XHRwcmltYXJ5X2FjdGlvbl9sYWJlbDogX18oJ0FkZCBNZW1iZXInKSxcclxuXHRcdFx0XHRwcmltYXJ5X2FjdGlvbih2YWx1ZXMpIHtcclxuXHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcclxuXHRcdFx0XHRcdFx0bWV0aG9kOiAnZnJhcHBlLmNsaWVudC5pbnNlcnQnLFxyXG5cdFx0XHRcdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0XHRcdFx0ZG9jOiB7XHJcblx0XHRcdFx0XHRcdFx0XHRkb2N0eXBlOiAnUHJvamVjdCBVc2VyJyxcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudDogc2VsZi5jdXJyZW50UHJvamVjdCxcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudGZpZWxkOiAndXNlcnMnLFxyXG5cdFx0XHRcdFx0XHRcdFx0cGFyZW50dHlwZTogJ1Byb2plY3QnLFxyXG5cdFx0XHRcdFx0XHRcdFx0dXNlcjogdmFsdWVzLmVtYWlsXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdFx0ZC5oaWRlKCk7XHJcblx0XHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1VzZXIgaW52aXRlZCB0byBwcm9qZWN0LicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XHJcblx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0ZC5zaG93KCk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBXb3JrIHBhY2thZ2UgcXVpY2stY3JlYXRlXHJcblx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xyXG5cdFx0XHR0aXRsZTogX18oJ0NyZWF0ZSB7MH0nLCBbdHlwZV0pLFxyXG5cdFx0XHRmaWVsZHM6IFtcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3N1YmplY3QnLCBsYWJlbDogX18oJ1N1YmplY3QgLyBUaXRsZScpLCBmaWVsZHR5cGU6ICdEYXRhJywgcmVxZDogMSB9LFxyXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAncHJpb3JpdHknLCBsYWJlbDogX18oJ1ByaW9yaXR5JyksIGZpZWxkdHlwZTogJ1NlbGVjdCcsIG9wdGlvbnM6ICdMb3dcXG5Ob3JtYWxcXG5IaWdoXFxuVXJnZW50JywgZGVmYXVsdDogJ05vcm1hbCcgfSxcclxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2R1ZV9kYXRlJywgbGFiZWw6IF9fKCdEdWUgRGF0ZScpLCBmaWVsZHR5cGU6ICdEYXRlJyB9LFxyXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnZGVzY3JpcHRpb24nLCBsYWJlbDogX18oJ0Rlc2NyaXB0aW9uJyksIGZpZWxkdHlwZTogJ1NtYWxsIFRleHQnIH1cclxuXHRcdFx0XSxcclxuXHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdDcmVhdGUnKSxcclxuXHRcdFx0cHJpbWFyeV9hY3Rpb24odmFsdWVzKSB7XHJcblx0XHRcdFx0ZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8ucXVpY2tfY3JlYXRlX3dvcmtfcGFja2FnZScsXHJcblx0XHRcdFx0XHRhcmdzOiB7XHJcblx0XHRcdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXHJcblx0XHRcdFx0XHRcdHdwX3R5cGU6IHR5cGUsXHJcblx0XHRcdFx0XHRcdHN1YmplY3Q6IHZhbHVlcy5zdWJqZWN0LFxyXG5cdFx0XHRcdFx0XHRwcmlvcml0eTogdmFsdWVzLnByaW9yaXR5LFxyXG5cdFx0XHRcdFx0XHRkdWVfZGF0ZTogdmFsdWVzLmR1ZV9kYXRlLFxyXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogdmFsdWVzLmRlc2NyaXB0aW9uXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0XHRkLmhpZGUoKTtcclxuXHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1dvcmsgcGFja2FnZSBjcmVhdGVkLicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XHJcblx0XHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnd29yay1wYWNrYWdlcycpIHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKCk7XHJcblx0XHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnYm9hcmRzJykgc2VsZi5yZW5kZXJLYW5iYW5Cb2FyZCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGQuc2hvdygpO1xyXG5cdH1cclxuXHJcblx0dXBkYXRlUHJvamVjdEhlYWx0aFN0YXR1cyhuZXdIZWFsdGgpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0dGhpcy51cGRhdGVQcm9qZWN0U2V0dGluZ3NGaWVsZCh0aGlzLmN1cnJlbnRQcm9qZWN0LCB7IGhlYWx0aF9zdGF0dXM6IG5ld0hlYWx0aCB9KS50aGVuKCgpID0+IHtcclxuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCBoZWFsdGggc2V0IHRvIHswfScsIFtuZXdIZWFsdGhdKSwgaW5kaWNhdG9yOiAnYmx1ZScgfSk7XHJcblx0XHRcdGlmIChzZWxmLnBhZ2UgJiYgc2VsZi5wYWdlLnNldF9pbmRpY2F0b3IpIHtcclxuXHRcdFx0XHRjb25zdCBjb2xvciA9IG5ld0hlYWx0aCA9PT0gJ09uIFRyYWNrJyA/ICdncmVlbicgOiAobmV3SGVhbHRoID09PSAnQXQgUmlzaycgPyAnb3JhbmdlJyA6ICdyZWQnKTtcclxuXHRcdFx0XHRzZWxmLnBhZ2Uuc2V0X2luZGljYXRvcihuZXdIZWFsdGgsIGNvbG9yKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHR1cGRhdGVQcm9qZWN0U2V0dGluZ3NGaWVsZChwcm9qZWN0TmFtZSwgcGF0Y2hEaWN0KSB7XHJcblx0XHRyZXR1cm4gZnJhcHBlLmNhbGwoe1xyXG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby51cGRhdGVfcHJvamVjdF9zZXR0aW5ncycsXHJcblx0XHRcdGFyZ3M6IHtcclxuXHRcdFx0XHRwcm9qZWN0OiBwcm9qZWN0TmFtZSxcclxuXHRcdFx0XHRzZXR0aW5nc19qc29uOiBKU09OLnN0cmluZ2lmeShwYXRjaERpY3QpXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZWRpdFN0YXR1c05hcnJhdGl2ZVByb21wdCgpIHtcclxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xyXG5cdFx0ZnJhcHBlLnByb21wdChcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGZpZWxkbmFtZTogJ25hcnJhdGl2ZScsXHJcblx0XHRcdFx0bGFiZWw6IF9fKCdTdGF0dXMgRGVzY3JpcHRpb24gLyBDb21tZW50YXJ5JyksXHJcblx0XHRcdFx0ZmllbGR0eXBlOiAnU21hbGwgVGV4dCcsXHJcblx0XHRcdFx0ZGVmYXVsdDogJCgnI292ZXJ2aWV3LXN0YXR1cy1uYXJyYXRpdmUnKS50ZXh0KClcclxuXHRcdFx0fSxcclxuXHRcdFx0ZnVuY3Rpb24gKHZhbHVlcykge1xyXG5cdFx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQoc2VsZi5jdXJyZW50UHJvamVjdCwgeyBzdGF0dXNfbmFycmF0aXZlOiB2YWx1ZXMubmFycmF0aXZlIH0pLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0JCgnI292ZXJ2aWV3LXN0YXR1cy1uYXJyYXRpdmUnKS50ZXh0KHZhbHVlcy5uYXJyYXRpdmUpO1xyXG5cdFx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnU3RhdHVzIG5vdGUgdXBkYXRlZC4nKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRfXygnRWRpdCBIZWFsdGggU3RhdHVzIERlc2NyaXB0aW9uJyksXHJcblx0XHRcdF9fKCdTYXZlJylcclxuXHRcdCk7XHJcblx0fVxyXG59XHJcblxyXG53aW5kb3cuUHJvamVjdFN0dWRpb0FwcCA9IFByb2plY3RTdHVkaW9BcHA7XHJcbmV4cG9ydCBkZWZhdWx0IFByb2plY3RTdHVkaW9BcHA7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUdBLElBQU0sUUFBUTtBQUFBLEVBQ2IsVUFBVTtBQUFBLEVBQ1YsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLEVBQ1AsS0FBSztBQUFBLEVBQ0wsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sWUFBWTtBQUFBLEVBQ1osT0FBTztBQUFBLEVBQ1AsUUFBUTtBQUFBLEVBQ1IsTUFBTTtBQUFBLEVBQ04sV0FBVztBQUNaO0FBRUEsU0FBUyxXQUFXLEtBQUs7QUFDeEIsTUFBSSxPQUFPLEtBQU0sUUFBTztBQUN4QixNQUFJLE9BQU8sVUFBVSxPQUFPLFNBQVMsT0FBTyxNQUFNLGFBQWE7QUFDOUQsV0FBTyxPQUFPLE1BQU0sWUFBWSxPQUFPLEdBQUcsQ0FBQztBQUFBLEVBQzVDO0FBQ0EsU0FBTyxPQUFPLEdBQUcsRUFDZixRQUFRLE1BQU0sT0FBTyxFQUNyQixRQUFRLE1BQU0sTUFBTSxFQUNwQixRQUFRLE1BQU0sTUFBTSxFQUNwQixRQUFRLE1BQU0sUUFBUSxFQUN0QixRQUFRLE1BQU0sT0FBTztBQUN4QjtBQUVBLElBQU0sbUJBQU4sTUFBdUI7QUFBQSxFQUN0QixZQUFZLE9BQU8sQ0FBQyxHQUFHO0FBQ3RCLFNBQUssT0FBTztBQUNaLFNBQUssT0FBTyxLQUFLLFFBQVMsT0FBTyxZQUFZLE9BQU8sU0FBUyxRQUFVLE9BQU8sYUFBYSxPQUFPLFVBQVUsUUFBUSxPQUFPLFVBQVUsS0FBSztBQUMxSSxTQUFLLGlCQUFpQjtBQUN0QixTQUFLLGNBQWMsQ0FBQztBQUNwQixTQUFLLGFBQWE7QUFDbEIs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QUFDOUUsY0FBSSxLQUFLLGVBQWUsZ0JBQWlCLE1BQUssbUJBQW1CO0FBQ2pFLGNBQUksS0FBSyxlQUFlLFNBQVUsTUFBSyxrQkFBa0I7QUFBQSxRQUMxRCxDQUFDO0FBQUEsTUFDRjtBQUFBLElBQ0QsQ0FBQztBQUNELE1BQUUsS0FBSztBQUFBLEVBQ1I7QUFBQSxFQUVBLDBCQUEwQixXQUFXO0FBQ3BDLFVBQU0sT0FBTztBQUNiLFNBQUssMkJBQTJCLEtBQUssZ0JBQWdCLEVBQUUsZUFBZSxVQUFVLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDN0YsYUFBTyxXQUFXLEVBQUUsU0FBUyxHQUFHLDZCQUE2QixDQUFDLFNBQVMsQ0FBQyxHQUFHLFdBQVcsT0FBTyxDQUFDO0FBQzlGLFVBQUksS0FBSyxRQUFRLEtBQUssS0FBSyxlQUFlO0FBQ3pDLGNBQU0sUUFBUSxjQUFjLGFBQWEsVUFBVyxjQUFjLFlBQVksV0FBVztBQUN6RixhQUFLLEtBQUssY0FBYyxXQUFXLEtBQUs7QUFBQSxNQUN6QztBQUFBLElBQ0QsQ0FBQztBQUFBLEVBQ0Y7QUFBQSxFQUVBLDJCQUEyQixhQUFhLFdBQVc7QUFDbEQsV0FBTyxPQUFPLEtBQUs7QUFBQSxNQUNsQixRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsUUFDTCxTQUFTO0FBQUEsUUFDVCxlQUFlLEtBQUssVUFBVSxTQUFTO0FBQUEsTUFDeEM7QUFBQSxJQUNELENBQUM7QUFBQSxFQUNGO0FBQUEsRUFFQSw0QkFBNEI7QUFDM0IsVUFBTSxPQUFPO0FBQ2IsV0FBTztBQUFBLE1BQ047QUFBQSxRQUNDLFdBQVc7QUFBQSxRQUNYLE9BQU8sR0FBRyxpQ0FBaUM7QUFBQSxRQUMzQyxXQUFXO0FBQUEsUUFDWCxTQUFTLEVBQUUsNEJBQTRCLEVBQUUsS0FBSztBQUFBLE1BQy9DO0FBQUEsTUFDQSxTQUFVLFFBQVE7QUFDakIsYUFBSywyQkFBMkIsS0FBSyxnQkFBZ0IsRUFBRSxrQkFBa0IsT0FBTyxVQUFVLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDdkcsWUFBRSw0QkFBNEIsRUFBRSxLQUFLLE9BQU8sU0FBUztBQUNyRCxpQkFBTyxXQUFXLEVBQUUsU0FBUyxHQUFHLHNCQUFzQixHQUFHLFdBQVcsUUFBUSxDQUFDO0FBQUEsUUFDOUUsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxNQUNBLEdBQUcsZ0NBQWdDO0FBQUEsTUFDbkMsR0FBRyxNQUFNO0FBQUEsSUFDVjtBQUFBLEVBQ0Q7QUFDRDtBQUVBLE9BQU8sbUJBQW1CO0FBQzFCLElBQU8sNkJBQVE7IiwKICAibmFtZXMiOiBbImQiXQp9Cg==
