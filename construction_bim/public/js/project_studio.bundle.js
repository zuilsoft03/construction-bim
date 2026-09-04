// ../project_studio_app.js
var ProjectStudioApp = class {
  constructor() {
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
    $("#btn-studio-refresh").on("click", function() {
      if (self.currentProject) {
        self.loadProjectData(self.currentProject);
      } else {
        self.loadProjectsList();
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
      const iframeSrc = `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}&model=none`;
      $("#iframe-bcf-3d-viewer").attr("src", iframeSrc);
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
    $list.append('<li><a href="javascript:void(0)" class="action-select-proj" data-project="all"><i class="fa fa-th-list text-muted"></i> <strong>All projects (Hub)</strong></a></li>');
    $list.append('<li role="separator" class="divider"></li>');
    const self = this;
    this.allProjects.forEach((p) => {
      const favIcon = p.is_favorite ? "\u2B50 " : "";
      const tmplBadge = p.is_template ? ' <span class="badge">Template</span>' : "";
      const $item = $(`<li><a href="javascript:void(0)" class="action-select-proj" data-project="${p.name}">${favIcon}${p.project_name}${tmplBadge}</a></li>`);
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
    $("#sidebar-active-status").text(projObj.status || "Active");
    $(".studio-nav-list .nav-item").show();
    this.switchTab(tab);
    this.loadProjectData(projectName);
  }
  switchTab(tabKey, params = {}) {
    this.currentTab = tabKey;
    $(".studio-nav-list .nav-item").removeClass("active");
    $(`.studio-nav-list .nav-item[data-tab="${tabKey}"]`).addClass("active");
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
      const favStar = p.is_favorite ? "\u2B50" : "\u2606";
      const statusPill = p.health_status === "On Track" ? '<span class="label label-success" style="background:#10b981;">ON TRACK</span>' : p.health_status === "At Risk" ? '<span class="label label-warning" style="background:#f59e0b;">AT RISK</span>' : '<span class="label label-danger" style="background:#ef4444;">OFF TRACK</span>';
      const indent = p.parent_project ? "&nbsp;&nbsp;&nbsp;&nbsp;\u21B3 " : "";
      const $tr = $(`
				<tr>
					<td class="text-center"><a href="javascript:void(0)" class="toggle-fav" data-project="${p.name}">${favStar}</a></td>
					<td>${indent}<a href="javascript:void(0)" class="project-link" data-project="${p.name}"><strong>${p.project_name}</strong></a></td>
					<td>${statusPill}</td>
					<td><i class="fa fa-check text-muted"></i></td>
					<td>${p.created_on || "--"}</td>
					<td>${p.latest_activity_at || "--"}</td>
					<td><small class="text-muted">${p.disk_usage_formatted || "0 Bytes"}</small></td>
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
    $("#overview-description").text(summary.description || __("No description provided."));
    $("#overview-dates").text(`${summary.expected_start_date || "--"} to ${summary.expected_end_date || "--"}`);
    $("#overview-progress").text(`${Math.round(summary.percent_complete || 0)}%`);
    $("#select-project-health").val(summary.health_status || "On Track");
    $("#overview-status-narrative").text(summary.status_narrative || __("All tasks and sub-projects are on schedule."));
    this.renderMilestoneTimeline(data.milestones || []);
    const $subList = $("#subprojects-list");
    $subList.empty();
    (data.subprojects || []).forEach((s) => {
      $subList.append(`
				<li class="flex-between p-1">
					<span><i class="fa fa-folder-o text-primary"></i> ${s.project_name}</span>
					<span class="label label-success" style="background:#10b981;">${s.status}</span>
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
					<small class="text-muted"><i class="fa fa-calendar"></i> ${m.date} | ${m.host || "Coordinator"}</small>
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
					<span class="avatar-circle" style="width:28px;height:28px;border-radius:50%;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;">
						${(m.full_name || m.user).substring(0, 2).toUpperCase()}
					</span>
					<small>${m.full_name || m.user}</small>
				</div>
			`);
    });
    const $newsCont = $("#news-feed-container");
    $newsCont.empty();
    (data.news || []).forEach((n) => {
      $newsCont.append(`
				<div class="news-bulletin p-2 mb-2" style="background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 4px;">
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
      $markers.html('<div class="text-center" style="width: 100%;"><span class="timeline-empty-msg text-muted"><i class="fa fa-info-circle"></i> No delivery milestones recorded yet.</span></div>');
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
      linkHtml = `<div class="alert alert-warning"><i class="fa fa-cube"></i> Linked to BCF Clash Topic: <strong>${wp.bcf_topic}</strong></div>`;
    } else if (wp.rfi_link) {
      linkHtml = `<div class="alert alert-info"><i class="fa fa-question-circle"></i> Linked to Technical RFI: <strong>${wp.rfi_link}</strong></div>`;
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
          const $card = $(`
						<div class="kanban-card" draggable="true" data-task="${card.id}">
							<div class="flex-between mb-1">
								<span class="wp-pill ${pillCls}">${card.type}</span>
								<small class="text-muted">${card.priority}</small>
							</div>
							<div style="font-weight: 600; font-size: 13px; color: #1e293b;">${card.subject}</div>
							<div class="flex-between mt-2">
								<small class="text-muted"><i class="fa fa-calendar"></i> ${card.exp_end_date || "--"}</small>
								<small class="text-secondary">${card.assignee_name || ""}</small>
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
        $target.html('<div class="text-muted text-center p-4">No scheduled work packages found for Gantt chart.</div>');
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
          new window.Gantt("#frappe-gantt-target", ganttTasks, {
            view_modes: ["Quarter Day", "Half Day", "Day", "Week", "Month"],
            view_mode: "Day",
            date_format: "YYYY-MM-DD",
            on_click: (task) => {
              const wp = items.find((i) => i.id === task.id);
              if (wp) self.openWorkPackageInspector(wp);
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
						<div class="model-tree-row p-1 flex-between" style="border-bottom: 1px solid #f1f5f9;">
							<label style="font-weight: normal; font-size: 12px; cursor: pointer; margin: 0;">
								<input type="checkbox" class="model-tree-cb" ${isChecked ? "checked" : ""} data-model="${m.name}"> <strong>[${m.discipline || "IFC"}]</strong> ${m.model_name || m.name}
							</label>
							<a href="javascript:void(0)" class="action-focus-model text-primary ml-1" data-model="${m.name}" title="View this model"><i class="fa fa-eye"></i></a>
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
        $stream.append('<div class="text-muted p-3 text-center"><small>No BCF topics logged for this project.</small></div>');
      } else {
        topics.forEach((top) => {
          $stream.append(`
						<div class="bcf-topic-card p-2 mb-2" style="border: 1px solid #e2e8f0; border-radius: 6px; background: #fff;">
							<div class="flex-between">
								<span class="badge badge-warning">${top.topic_type}</span>
								<small class="text-muted">${top.status}</small>
							</div>
							<h5 class="mt-1 mb-1 font-weight-bold">${top.title}</h5>
							<small class="text-muted"><i class="fa fa-clock-o"></i> ${top.creation ? top.creation.split(" ")[0] : "--"} &nbsp;|&nbsp; ${top.assigned_to || "Unassigned"}</small>
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
      folders.forEach((f) => {
        const $box = $(`
					<div class="folder-box">
						<div class="folder-header">
							<i class="${f.icon} text-primary"></i>
							<span>${f.folder_name}</span>
							<span class="badge ml-auto">${f.files.length}</span>
						</div>
						<div class="folder-files-list">
							<!-- Files -->
						</div>
					</div>
				`);
        const $fList = $box.find(".folder-files-list");
        if (f.files.length === 0) {
          $fList.append('<div class="text-muted p-2 text-center"><small>Empty folder</small></div>');
        } else {
          f.files.forEach((file) => {
            $fList.append(`
							<a href="javascript:void(0)" class="file-item-link" data-route="${file.route_target}" data-url="${file.file_url}" data-model-id="${file.model_id || file.id || ""}">
								<span><i class="fa fa-file text-secondary"></i> ${file.file_name}</span>
								<span class="badge">${file.badge}</span>
							</a>
						`);
          });
        }
        $cont.append($box);
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
      $cont.html('<div class="text-muted text-center p-4">No coordination meetings or toolbox talks logged yet. Click <strong>New Meeting</strong> above to create one.</div>');
      return;
    }
    meetings.forEach((m) => {
      const docType = m.doctype || (m.type === "Toolbox Talk" ? "Toolbox Talk" : "Event");
      $cont.append(`
				<div class="meeting-card p-3 mb-3" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
					<div class="flex-between">
						<div>
							<span class="badge ${m.type === "Toolbox Talk" ? "badge-warning" : "badge-primary"}">${m.type}</span>
							<h4 class="mt-1 mb-1 font-weight-bold">${m.title}</h4>
							<small class="text-muted"><i class="fa fa-calendar"></i> ${m.date} &nbsp;|&nbsp; <i class="fa fa-user"></i> Conductor: ${m.host || "Site Coordinator"} &nbsp;|&nbsp; <i class="fa fa-users"></i> Attendees: ${m.participants || 0}</small>
						</div>
						<button class="btn btn-default btn-xs btn-view-meeting-doc" data-doctype="${docType}" data-name="${m.name}"><i class="fa fa-eye"></i> View Doc</button>
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
          frappe.show_alert({ message: label, indicator: "green" });
          self.loadProjectData(self.currentProject);
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
      $tbody.append(`
				<tr>
					<td><strong>${m.full_name || m.user}</strong></td>
					<td>${m.user}</td>
					<td><span class="badge">${m.role || "Member"}</span></td>
					<td><span class="label label-success">Active</span></td>
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
