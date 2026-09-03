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
      if (route === "bim") {
        e.preventDefault();
        self.switchTab("bcf");
        frappe.show_alert({ message: __("Opening IFC model in 3D Viewer..."), indicator: "blue" });
      } else if (route === "cad") {
        e.preventDefault();
        self.switchTab("cad");
        frappe.show_alert({ message: __("Opening drawing in 2D CAD Studio..."), indicator: "blue" });
      } else if (route === "pdf") {
        e.preventDefault();
        self.switchTab("pdf");
        frappe.show_alert({ message: __("Opening plan in PDF Takeoff..."), indicator: "blue" });
      }
    });
    $("#btn-upload-document").on("click", function() {
      self.openFileUploadDialog();
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
    $list.append('<li><a href="javascript:void(0)" data-project="all"><i class="fa fa-th-list text-muted"></i> <strong>All projects (Hub)</strong></a></li>');
    $list.append('<li role="separator" class="divider"></li>');
    const self = this;
    this.allProjects.forEach((p) => {
      const favIcon = p.is_favorite ? "\u2B50 " : "";
      const tmplBadge = p.is_template ? ' <span class="badge">Template</span>' : "";
      const $item = $(`<li><a href="javascript:void(0)" data-project="${p.name}">${favIcon}${p.project_name}${tmplBadge}</a></li>`);
      $item.find("a").on("click", function() {
        const proj = $(this).data("project");
        if (proj === "all") {
          self.switchTab("all-projects");
        } else {
          self.selectProject(proj);
        }
      });
      $list.append($item);
    });
  }
  selectProject(projectName, tab = "home") {
    this.currentProject = projectName;
    const projObj = this.allProjects.find((p) => p.name === projectName) || { project_name: projectName };
    $("#current-project-title").text(projObj.project_name);
    $("#sidebar-active-status").text(projObj.status || "Active");
    $(".studio-nav-list .nav-item").show();
    this.switchTab(tab);
    this.loadProjectData(projectName);
  }
  switchTab(tabKey) {
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
      this.renderBcfViewer();
    } else if (tabKey === "cad") {
      $("#iframe-dwg-viewer").attr("src", `/app/dwg-viewer?project=${encodeURIComponent(this.currentProject)}`);
    } else if (tabKey === "pdf") {
      $("#iframe-pdf-viewer").attr("src", `/app/pdf-takeoff?project=${encodeURIComponent(this.currentProject)}`);
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
    if (milestones.length === 0) {
      $markers.append('<div class="text-muted p-2 text-center" style="width:100%;"><small>No delivery milestones recorded yet.</small></div>');
      return;
    }
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
  renderBcfViewer() {
    const self = this;
    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "BIM Model",
        filters: { project: self.currentProject },
        fields: ["name", "model_name", "ifc_file"]
      }
    }).then((r) => {
      const models = r.message || [];
      const $tree = $("#bcf-models-tree");
      $tree.empty();
      if (models.length === 0) {
        $tree.append('<div class="text-muted p-2"><small>No IFC models uploaded.</small></div>');
      } else {
        models.forEach((m) => {
          $tree.append(`
						<div class="model-tree-row p-1">
							<label style="font-weight: normal; font-size: 12px; cursor: pointer;">
								<input type="checkbox" checked data-model="${m.name}"> ${m.model_name || m.name}
							</label>
						</div>
					`);
        });
      }
    });
    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "BCF Topic",
        filters: { project: self.currentProject },
        fields: ["name", "title", "topic_type", "priority", "status", "creation"]
      }
    }).then((r) => {
      const topics = r.message || [];
      $("#bcf-topic-count").text(topics.length);
      const $stream = $("#bcf-cards-container");
      $stream.empty();
      topics.forEach((top) => {
        $stream.append(`
					<div class="bcf-topic-card p-2" style="border: 1px solid #e2e8f0; border-radius: 6px; background: #fff;">
						<div class="flex-between">
							<span class="badge badge-warning">${top.topic_type}</span>
							<small class="text-muted">${top.status}</small>
						</div>
						<h5 class="mt-1 mb-1">${top.title}</h5>
						<small class="text-muted"><i class="fa fa-clock-o"></i> ${top.creation.split(" ")[0]}</small>
					</div>
				`);
      });
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
							<a href="javascript:void(0)" class="file-item-link" data-route="${file.route_target}" data-url="${file.file_url}">
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
  openFileUploadDialog() {
    const self = this;
    new frappe.ui.FileUploader({
      doctype: "Project",
      docname: self.currentProject,
      folder: "Home",
      on_success(file_doc) {
        frappe.show_alert({ message: __("File uploaded successfully."), indicator: "green" });
        self.renderDocumentsTree();
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
      $cont.append(`
				<div class="meeting-card p-3 mb-3" style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
					<div class="flex-between">
						<div>
							<span class="badge ${m.type === "Toolbox Talk" ? "badge-warning" : "badge-primary"}">${m.type}</span>
							<h4 class="mt-1 mb-1 font-weight-bold">${m.title}</h4>
							<small class="text-muted"><i class="fa fa-calendar"></i> ${m.date} &nbsp;|&nbsp; <i class="fa fa-user"></i> Conductor: ${m.host || "Site Coordinator"} &nbsp;|&nbsp; <i class="fa fa-users"></i> Attendees: ${m.participants || 0}</small>
						</div>
						<button class="btn btn-default btn-xs btn-view-meeting-doc" data-doctype="${m.type}" data-name="${m.name}"><i class="fa fa-eye"></i> View Doc</button>
					</div>
				</div>
			`);
    });
    $cont.find(".btn-view-meeting-doc").on("click", function() {
      const dt = $(this).data("doctype");
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
        { fieldname: "date", label: __("Date"), fieldtype: "Date", default: frappe.datetime && frappe.datetime.get_today ? frappe.datetime.get_today() : (/* @__PURE__ */ new Date()).toISOString().split("T")[0] },
        { fieldname: "conductor", label: __("Conductor / Host"), fieldtype: "Data" }
      ],
      primary_action_label: __("Create Meeting"),
      primary_action(values) {
        if (values.meeting_type === "Toolbox Talk") {
          frappe.call({
            method: "frappe.client.insert",
            args: {
              doc: {
                doctype: "Toolbox Talk",
                project: self.currentProject,
                topic_category: values.subject,
                date: values.date,
                conductor_name: values.conductor || frappe.session.user
              }
            }
          }).then(() => {
            d.hide();
            frappe.show_alert({ message: __("Toolbox talk scheduled."), indicator: "green" });
            self.loadProjectData(self.currentProject);
          });
        } else {
          frappe.call({
            method: "frappe.client.insert",
            args: {
              doc: {
                doctype: "Event",
                subject: values.subject,
                starts_on: values.date + " 09:00:00",
                event_type: "Private"
              }
            }
          }).then(() => {
            d.hide();
            frappe.show_alert({ message: __("Meeting created."), indicator: "green" });
            self.loadProjectData(self.currentProject);
          });
        }
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
    members.forEach((m) => {
      $tbody.append(`
				<tr>
					<td><strong>${m.full_name || m.user}</strong></td>
					<td>${m.user}</td>
					<td><span class="badge">${m.role}</span></td>
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3Byb2plY3Rfc3R1ZGlvX2FwcC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gUHJvamVjdCBTdHVkaW8gRnJvbnRlbmQgQXBwbGljYXRpb24gKE9wZW5Qcm9qZWN0IEJJTSBQYXJpdHkpXG4vLyBNYW5hZ2VzIEFsbCBQcm9qZWN0cyBIdWIsIFByb2plY3QgSG9tZSwgV29yayBQYWNrYWdlcywgQm9hcmRzLCBCQ0YsIERvY3VtZW50cywgU2V0dGluZ3NcblxuY2xhc3MgUHJvamVjdFN0dWRpb0FwcCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuY3VycmVudFByb2plY3QgPSBudWxsO1xuXHRcdHRoaXMuYWxsUHJvamVjdHMgPSBbXTtcblx0XHR0aGlzLmN1cnJlbnRUYWIgPSAnaG9tZSc7XG5cdFx0dGhpcy5hY3RpdmVGaWx0ZXJLZXkgPSAnYWxsX29wZW4nO1xuXHRcdHRoaXMuYWN0aXZlVHlwZUZpbHRlciA9ICdhbGwnO1xuXHRcdHRoaXMuYm9hcmRHcm91cEJ5ID0gJ3N0YXR1cyc7XG5cdFx0dGhpcy5pc1NpZGViYXJDb2xsYXBzZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblx0XHR0aGlzLmxvYWRQcm9qZWN0c0xpc3QoKS50aGVuKCgpID0+IHtcblx0XHRcdC8vIENoZWNrIFVSTCBwYXJhbWV0ZXJzIGZvciBwcm9qZWN0XG5cdFx0XHRjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXHRcdFx0Y29uc3QgcHJvalBhcmFtID0gdXJsUGFyYW1zLmdldCgncHJvamVjdCcpO1xuXHRcdFx0Y29uc3QgdGFiUGFyYW0gPSB1cmxQYXJhbXMuZ2V0KCd0YWInKTtcblxuXHRcdFx0aWYgKHByb2pQYXJhbSAmJiBwcm9qUGFyYW0gIT09ICdhbGwnKSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0UHJvamVjdChwcm9qUGFyYW0sIHRhYlBhcmFtIHx8ICdob21lJyk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuYWxsUHJvamVjdHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdFByb2plY3QodGhpcy5hbGxQcm9qZWN0c1swXS5uYW1lLCB0YWJQYXJhbSB8fCAnaG9tZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0YmluZEV2ZW50cygpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdC8vIFNpZGViYXIgY29sbGFwc2UgdG9nZ2xlXG5cdFx0JCgnI2J0bi10b2dnbGUtc2lkZWJhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkID0gIXNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkO1xuXHRcdFx0JCgnI3N0dWRpby1zaWRlYmFyJykudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcsIHNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkKTtcblx0XHR9KTtcblxuXHRcdC8vIE5hdmlnYXRpb24gbGlua3Ncblx0XHQkKCcuc3R1ZGlvLW5hdi1saXN0Jykub24oJ2NsaWNrJywgJy5uYXYtaXRlbScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IHRhYiA9ICQodGhpcykuZGF0YSgndGFiJyk7XG5cdFx0XHRzZWxmLnN3aXRjaFRhYih0YWIpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gUmVmcmVzaCBidXR0b25cblx0XHQkKCcjYnRuLXN0dWRpby1yZWZyZXNoJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHNlbGYuY3VycmVudFByb2plY3QpIHtcblx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdERhdGEoc2VsZi5jdXJyZW50UHJvamVjdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIFF1aWNrIGNyZWF0ZSBkcm9wZG93biBhY3Rpb25zXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5hY3Rpb24tcXVpY2stYWRkJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0Y29uc3QgdHlwZSA9ICQodGhpcykuZGF0YSgndHlwZScpO1xuXHRcdFx0c2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCh0eXBlKTtcblx0XHR9KTtcblxuXHRcdC8vIEFkZCBwcm9qZWN0IGJ1dHRvblxuXHRcdCQoJyNidG4tYWRkLXByb2plY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdwcm9qZWN0Jyk7XG5cdFx0fSk7XG5cblx0XHQvLyBTdWJwcm9qZWN0IGFkZCBidXR0b25cblx0XHQkKCcjYnRuLWFkZC1zdWJwcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnc3VicHJvamVjdCcpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gU2VhcmNoIGluIGFsbCBwcm9qZWN0cyB0YWJsZVxuXHRcdCQoJyNwcm9qZWN0cy1maWx0ZXItaW5wdXQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBxID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0JCgnI3Byb2plY3RzLXRhYmxlLWJvZHkgdHInKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3QgdGV4dCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdCQodGhpcykudG9nZ2xlKHRleHQuaW5kZXhPZihxKSA+IC0xKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gR2xvYmFsIHNlYXJjaFxuXHRcdCQoJyNzdHVkaW8tZ2xvYmFsLXNlYXJjaCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcblx0XHRcdFx0Y29uc3QgcXVlcnkgPSAkKHRoaXMpLnZhbCgpO1xuXHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnd29yay1wYWNrYWdlcycpIHtcblx0XHRcdFx0XHRzZWxmLnJlbmRlcldvcmtQYWNrYWdlcyhxdWVyeSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnYWxsLXByb2plY3RzJykge1xuXHRcdFx0XHRcdCQoJyNwcm9qZWN0cy1maWx0ZXItaW5wdXQnKS52YWwocXVlcnkpLnRyaWdnZXIoJ2tleXVwJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3dvcmstcGFja2FnZXMnKTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKHF1ZXJ5KSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gSGVhbHRoIHN0YXR1cyBzZWxlY3QgY2hhbmdlXG5cdFx0JCgnI3NlbGVjdC1wcm9qZWN0LWhlYWx0aCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCB2YWwgPSAkKHRoaXMpLnZhbCgpO1xuXHRcdFx0c2VsZi51cGRhdGVQcm9qZWN0SGVhbHRoU3RhdHVzKHZhbCk7XG5cdFx0fSk7XG5cblx0XHQvLyBFZGl0IHN0YXR1cyBuYXJyYXRpdmUgYnV0dG9uXG5cdFx0JCgnI2J0bi1lZGl0LXN0YXR1cy1uYXJyYXRpdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLmVkaXRTdGF0dXNOYXJyYXRpdmVQcm9tcHQoKTtcblx0XHR9KTtcblxuXHRcdC8vIFdvcmsgcGFja2FnZXMgZmlsdGVyIGNsaWNrc1xuXHRcdCQoJy53cC1zaWRlYmFyLWZpbHRlcicpLm9uKCdjbGljaycsICdsaVtkYXRhLWZpbHRlcl0nLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQkKCcud3Atc2lkZWJhci1maWx0ZXIgbGlbZGF0YS1maWx0ZXJdJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHRzZWxmLmFjdGl2ZUZpbHRlcktleSA9ICQodGhpcykuZGF0YSgnZmlsdGVyJyk7XG5cdFx0XHQkKCcjd3AtYWN0aXZlLWZpbHRlci10aXRsZScpLnRleHQoJCh0aGlzKS50ZXh0KCkpO1xuXHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHR9KTtcblxuXHRcdCQoJy53cC1zaWRlYmFyLWZpbHRlcicpLm9uKCdjbGljaycsICdsaVtkYXRhLXR5cGVdJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCgnLndwLXNpZGViYXItZmlsdGVyIGxpW2RhdGEtdHlwZV0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRcdHNlbGYuYWN0aXZlVHlwZUZpbHRlciA9ICQodGhpcykuZGF0YSgndHlwZScpO1xuXHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHR9KTtcblxuXHRcdC8vIFdvcmsgcGFja2FnZXMgdGV4dCBzZWFyY2ggZmlsdGVyXG5cdFx0JCgnI3dwLWZpbHRlci1zZWFyY2gnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBxID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0JCgnI3dwLXRhYmxlLWJvZHkgdHInKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3QgdGV4dCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdCQodGhpcykudG9nZ2xlKHRleHQuaW5kZXhPZihxKSA+IC0xKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQm9hcmQgZ3JvdXBpbmcgc2VsZWN0b3Jcblx0XHQkKCcjc2VsZWN0LWJvYXJkLWdyb3VwLWJ5Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYuYm9hcmRHcm91cEJ5ID0gJCh0aGlzKS52YWwoKTtcblx0XHRcdHNlbGYucmVuZGVyS2FuYmFuQm9hcmQoKTtcblx0XHR9KTtcblxuXHRcdC8vIEJDRiBEcmF3ZXIgdG9nZ2xlXG5cdFx0JCgnI2J0bi1iY2YtdG9nZ2xlLWRyYXdlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCQoJyNiY2YtZmxvYXRpbmctZHJhd2VyJykudG9nZ2xlKCk7XG5cdFx0fSk7XG5cdFx0JCgnI2J0bi1jbG9zZS1iY2YtZHJhd2VyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCgnI2JjZi1mbG9hdGluZy1kcmF3ZXInKS5oaWRlKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBEb2N1bWVudCBmaWxlIGxpbmsgY2xpY2sgZGVsZWdhdGlvbiAoQXV0by1MYXVuY2hlcnMhKVxuXHRcdCQoJyNkb2N1bWVudC1mb2xkZXJzLWNvbnRhaW5lcicpLm9uKCdjbGljaycsICcuZmlsZS1pdGVtLWxpbmsnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0Y29uc3Qgcm91dGUgPSAkKHRoaXMpLmRhdGEoJ3JvdXRlJyk7XG5cdFx0XHRjb25zdCB1cmwgPSAkKHRoaXMpLmRhdGEoJ3VybCcpO1xuXHRcdFx0aWYgKHJvdXRlID09PSAnYmltJykge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdiY2YnKTtcblx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnT3BlbmluZyBJRkMgbW9kZWwgaW4gM0QgVmlld2VyLi4uJyksIGluZGljYXRvcjogJ2JsdWUnIH0pO1xuXHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ2NhZCcpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYignY2FkJyk7XG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ09wZW5pbmcgZHJhd2luZyBpbiAyRCBDQUQgU3R1ZGlvLi4uJyksIGluZGljYXRvcjogJ2JsdWUnIH0pO1xuXHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ3BkZicpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYigncGRmJyk7XG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ09wZW5pbmcgcGxhbiBpbiBQREYgVGFrZW9mZi4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIERvY3VtZW50IGZpbGUgdXBsb2FkIGJ1dHRvblxuXHRcdCQoJyNidG4tdXBsb2FkLWRvY3VtZW50Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5vcGVuRmlsZVVwbG9hZERpYWxvZygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gU3RhbmRhbG9uZSBDQUQgJiBQREYgYnV0dG9uc1xuXHRcdCQoJyNidG4tb3Blbi1kd2ctZnVsbHNjcmVlbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5vcGVuKGAvYXBwL2R3Zy12aWV3ZXI/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWxmLmN1cnJlbnRQcm9qZWN0KX1gLCAnX2JsYW5rJyk7XG5cdFx0fSk7XG5cdFx0JCgnI2J0bi1vcGVuLXBkZi1mdWxsc2NyZWVuJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93Lm9wZW4oYC9hcHAvcGRmLXRha2VvZmY/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWxmLmN1cnJlbnRQcm9qZWN0KX1gLCAnX2JsYW5rJyk7XG5cdFx0fSk7XG5cblx0XHQvLyBTY2hlZHVsZSBtZWV0aW5nIGJ1dHRvblxuXHRcdCQoJyNidG4tc2NoZWR1bGUtbWVldGluZycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYub3BlblNjaGVkdWxlTWVldGluZ0RpYWxvZygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gUHJvamVjdCBzZXR0aW5ncyBzYXZlXG5cdFx0JCgnI2J0bi1zYXZlLXByb2plY3Qtc2V0dGluZ3MnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLnNhdmVQcm9qZWN0U2V0dGluZ3MoKTtcblx0XHR9KTtcblxuXHRcdC8vIEFyY2hpdmUgdG9nZ2xlXG5cdFx0JCgnI2J0bi10b2dnbGUtYXJjaGl2ZS1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi50b2dnbGVBcmNoaXZlUHJvamVjdCgpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gRGVsZXRlIHByb2plY3Rcblx0XHQkKCcjYnRuLWRlbGV0ZS1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5jb25maXJtRGVsZXRlUHJvamVjdCgpO1xuXHRcdH0pO1xuXHR9XG5cblx0bG9hZFByb2plY3RzTGlzdCgpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRyZXR1cm4gZnJhcHBlLmNhbGwoe1xuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8ubGlzdF9wcm9qZWN0cycsXG5cdFx0XHRhcmdzOiB7IGluY2x1ZGVfYXJjaGl2ZWQ6IDEgfVxuXHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRzZWxmLmFsbFByb2plY3RzID0gci5tZXNzYWdlIHx8IFtdO1xuXHRcdFx0c2VsZi5yZW5kZXJQcm9qZWN0U3dpdGNoZXIoKTtcblx0XHRcdHNlbGYucmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFN3aXRjaGVyKCkge1xuXHRcdGNvbnN0ICRsaXN0ID0gJCgnI3Byb2plY3Qtc3dpdGNoZXItbGlzdCcpO1xuXHRcdCRsaXN0LmVtcHR5KCk7XG5cdFx0JGxpc3QuYXBwZW5kKCc8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGRhdGEtcHJvamVjdD1cImFsbFwiPjxpIGNsYXNzPVwiZmEgZmEtdGgtbGlzdCB0ZXh0LW11dGVkXCI+PC9pPiA8c3Ryb25nPkFsbCBwcm9qZWN0cyAoSHViKTwvc3Ryb25nPjwvYT48L2xpPicpO1xuXHRcdCRsaXN0LmFwcGVuZCgnPGxpIHJvbGU9XCJzZXBhcmF0b3JcIiBjbGFzcz1cImRpdmlkZXJcIj48L2xpPicpO1xuXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy5hbGxQcm9qZWN0cy5mb3JFYWNoKHAgPT4ge1xuXHRcdFx0Y29uc3QgZmF2SWNvbiA9IHAuaXNfZmF2b3JpdGUgPyAnXHUyQjUwICcgOiAnJztcblx0XHRcdGNvbnN0IHRtcGxCYWRnZSA9IHAuaXNfdGVtcGxhdGUgPyAnIDxzcGFuIGNsYXNzPVwiYmFkZ2VcIj5UZW1wbGF0ZTwvc3Bhbj4nIDogJyc7XG5cdFx0XHRjb25zdCAkaXRlbSA9ICQoYDxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgZGF0YS1wcm9qZWN0PVwiJHtwLm5hbWV9XCI+JHtmYXZJY29ufSR7cC5wcm9qZWN0X25hbWV9JHt0bXBsQmFkZ2V9PC9hPjwvbGk+YCk7XG5cdFx0XHQkaXRlbS5maW5kKCdhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBwcm9qID0gJCh0aGlzKS5kYXRhKCdwcm9qZWN0Jyk7XG5cdFx0XHRcdGlmIChwcm9qID09PSAnYWxsJykge1xuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdhbGwtcHJvamVjdHMnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzZWxmLnNlbGVjdFByb2plY3QocHJvaik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0JGxpc3QuYXBwZW5kKCRpdGVtKTtcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QocHJvamVjdE5hbWUsIHRhYiA9ICdob21lJykge1xuXHRcdHRoaXMuY3VycmVudFByb2plY3QgPSBwcm9qZWN0TmFtZTtcblx0XHRjb25zdCBwcm9qT2JqID0gdGhpcy5hbGxQcm9qZWN0cy5maW5kKHAgPT4gcC5uYW1lID09PSBwcm9qZWN0TmFtZSkgfHwgeyBwcm9qZWN0X25hbWU6IHByb2plY3ROYW1lIH07XG5cdFx0JCgnI2N1cnJlbnQtcHJvamVjdC10aXRsZScpLnRleHQocHJvak9iai5wcm9qZWN0X25hbWUpO1xuXHRcdCQoJyNzaWRlYmFyLWFjdGl2ZS1zdGF0dXMnKS50ZXh0KHByb2pPYmouc3RhdHVzIHx8ICdBY3RpdmUnKTtcblxuXHRcdC8vIEVuYWJsZSBwcm9qZWN0LXNwZWNpZmljIG5hdiB0YWJzXG5cdFx0JCgnLnN0dWRpby1uYXYtbGlzdCAubmF2LWl0ZW0nKS5zaG93KCk7XG5cdFx0dGhpcy5zd2l0Y2hUYWIodGFiKTtcblx0XHR0aGlzLmxvYWRQcm9qZWN0RGF0YShwcm9qZWN0TmFtZSk7XG5cdH1cblxuXHRzd2l0Y2hUYWIodGFiS2V5KSB7XG5cdFx0dGhpcy5jdXJyZW50VGFiID0gdGFiS2V5O1xuXHRcdCQoJy5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQoYC5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtW2RhdGEtdGFiPVwiJHt0YWJLZXl9XCJdYCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG5cdFx0JCgnLnN0dWRpby10YWItdmlldycpLmhpZGUoKTtcblxuXHRcdGlmICh0YWJLZXkgPT09ICdhbGwtcHJvamVjdHMnKSB7XG5cdFx0XHQkKCcjY3VycmVudC1wcm9qZWN0LXRpdGxlJykudGV4dCgnQWxsIHByb2plY3RzJyk7XG5cdFx0XHQkKCcjdmlldy1hbGwtcHJvamVjdHMnKS5zaG93KCk7XG5cdFx0XHR0aGlzLnJlbmRlckFsbFByb2plY3RzVGFibGUoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkKGAjdmlldy0ke3RhYktleX1gKS5zaG93KCk7XG5cblx0XHQvLyBUcmlnZ2VyIHZpZXctc3BlY2lmaWMgbG9hZHNcblx0XHRpZiAodGFiS2V5ID09PSAnaG9tZScpIHtcblx0XHRcdHRoaXMucmVuZGVyUHJvamVjdE92ZXJ2aWV3KCk7XG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICd3b3JrLXBhY2thZ2VzJykge1xuXHRcdFx0dGhpcy5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2JvYXJkcycpIHtcblx0XHRcdHRoaXMucmVuZGVyS2FuYmFuQm9hcmQoKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2dhbnR0Jykge1xuXHRcdFx0dGhpcy5yZW5kZXJHYW50dENoYXJ0KCk7XG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdiY2YnKSB7XG5cdFx0XHR0aGlzLnJlbmRlckJjZlZpZXdlcigpO1xuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAnY2FkJykge1xuXHRcdFx0JCgnI2lmcmFtZS1kd2ctdmlld2VyJykuYXR0cignc3JjJywgYC9hcHAvZHdnLXZpZXdlcj9wcm9qZWN0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMuY3VycmVudFByb2plY3QpfWApO1xuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAncGRmJykge1xuXHRcdFx0JCgnI2lmcmFtZS1wZGYtdmlld2VyJykuYXR0cignc3JjJywgYC9hcHAvcGRmLXRha2VvZmY/cHJvamVjdD0ke2VuY29kZVVSSUNvbXBvbmVudCh0aGlzLmN1cnJlbnRQcm9qZWN0KX1gKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2RvY3VtZW50cycpIHtcblx0XHRcdHRoaXMucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAnbWVldGluZ3MnKSB7XG5cdFx0XHR0aGlzLnJlbmRlck1lZXRpbmdzVGFiKCk7XG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdtZW1iZXJzJykge1xuXHRcdFx0dGhpcy5yZW5kZXJNZW1iZXJzVGFibGUoKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ3NldHRpbmdzJykge1xuXHRcdFx0dGhpcy5yZW5kZXJTZXR0aW5nc1RhYigpO1xuXHRcdH1cblx0fVxuXG5cdGxvYWRQcm9qZWN0RGF0YShwcm9qZWN0TmFtZSkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmdldF9wcm9qZWN0X292ZXJ2aWV3Jyxcblx0XHRcdGFyZ3M6IHsgcHJvamVjdDogcHJvamVjdE5hbWUgfVxuXHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRzZWxmLnByb2plY3RPdmVydmlld0RhdGEgPSByLm1lc3NhZ2UgfHwge307XG5cdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnaG9tZScpIHtcblx0XHRcdFx0c2VsZi5yZW5kZXJQcm9qZWN0T3ZlcnZpZXcoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVEFCIDA6IEFMTCBQUk9KRUNUUyBIVUIgKFNjcmVlbnNob3QgMSlcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJBbGxQcm9qZWN0c1RhYmxlKCkge1xuXHRcdGNvbnN0ICR0Ym9keSA9ICQoJyNwcm9qZWN0cy10YWJsZS1ib2R5Jyk7XG5cdFx0JHRib2R5LmVtcHR5KCk7XG5cblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHR0aGlzLmFsbFByb2plY3RzLmZvckVhY2gocCA9PiB7XG5cdFx0XHRjb25zdCBmYXZTdGFyID0gcC5pc19mYXZvcml0ZSA/ICdcdTJCNTAnIDogJ1x1MjYwNic7XG5cdFx0XHRjb25zdCBzdGF0dXNQaWxsID0gcC5oZWFsdGhfc3RhdHVzID09PSAnT24gVHJhY2snIFxuXHRcdFx0XHQ/ICc8c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLXN1Y2Nlc3NcIiBzdHlsZT1cImJhY2tncm91bmQ6IzEwYjk4MTtcIj5PTiBUUkFDSzwvc3Bhbj4nXG5cdFx0XHRcdDogKHAuaGVhbHRoX3N0YXR1cyA9PT0gJ0F0IFJpc2snIFxuXHRcdFx0XHRcdD8gJzxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtd2FybmluZ1wiIHN0eWxlPVwiYmFja2dyb3VuZDojZjU5ZTBiO1wiPkFUIFJJU0s8L3NwYW4+J1xuXHRcdFx0XHRcdDogJzxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtZGFuZ2VyXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiNlZjQ0NDQ7XCI+T0ZGIFRSQUNLPC9zcGFuPicpO1xuXG5cdFx0XHRjb25zdCBpbmRlbnQgPSBwLnBhcmVudF9wcm9qZWN0ID8gJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1x1MjFCMyAnIDogJyc7XG5cdFx0XHRjb25zdCAkdHIgPSAkKGBcblx0XHRcdFx0PHRyPlxuXHRcdFx0XHRcdDx0ZCBjbGFzcz1cInRleHQtY2VudGVyXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidG9nZ2xlLWZhdlwiIGRhdGEtcHJvamVjdD1cIiR7cC5uYW1lfVwiPiR7ZmF2U3Rhcn08L2E+PC90ZD5cblx0XHRcdFx0XHQ8dGQ+JHtpbmRlbnR9PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwicHJvamVjdC1saW5rXCIgZGF0YS1wcm9qZWN0PVwiJHtwLm5hbWV9XCI+PHN0cm9uZz4ke3AucHJvamVjdF9uYW1lfTwvc3Ryb25nPjwvYT48L3RkPlxuXHRcdFx0XHRcdDx0ZD4ke3N0YXR1c1BpbGx9PC90ZD5cblx0XHRcdFx0XHQ8dGQ+PGkgY2xhc3M9XCJmYSBmYS1jaGVjayB0ZXh0LW11dGVkXCI+PC9pPjwvdGQ+XG5cdFx0XHRcdFx0PHRkPiR7cC5jcmVhdGVkX29uIHx8ICctLSd9PC90ZD5cblx0XHRcdFx0XHQ8dGQ+JHtwLmxhdGVzdF9hY3Rpdml0eV9hdCB8fCAnLS0nfTwvdGQ+XG5cdFx0XHRcdFx0PHRkPjxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke3AuZGlza191c2FnZV9mb3JtYXR0ZWQgfHwgJzAgQnl0ZXMnfTwvc21hbGw+PC90ZD5cblx0XHRcdFx0PC90cj5cblx0XHRcdGApO1xuXG5cdFx0XHQkdHIuZmluZCgnLnByb2plY3QtbGluaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c2VsZi5zZWxlY3RQcm9qZWN0KCQodGhpcykuZGF0YSgncHJvamVjdCcpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkdHIuZmluZCgnLnRvZ2dsZS1mYXYnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnN0IGlzRmF2ID0gcC5pc19mYXZvcml0ZSA/IDAgOiAxO1xuXHRcdFx0XHRzZWxmLnVwZGF0ZVByb2plY3RTZXR0aW5nc0ZpZWxkKHAubmFtZSwgeyBpc19mYXZvcml0ZTogaXNGYXYgfSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdCR0Ym9keS5hcHBlbmQoJHRyKTtcblx0XHR9KTtcblxuXHRcdCQoJyNwcm9qZWN0cy10YWJsZS1zdW1tYXJ5JykudGV4dChgU2hvd2luZyAke3RoaXMuYWxsUHJvamVjdHMubGVuZ3RofSBhY3RpdmUgcHJvamVjdChzKWApO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMTogUFJPSkVDVCBIT01FIERBU0hCT0FSRCAoU2NyZWVuc2hvdCAyKVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHJlbmRlclByb2plY3RPdmVydmlldygpIHtcblx0XHRpZiAoIXRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YSkgcmV0dXJuO1xuXHRcdGNvbnN0IGRhdGEgPSB0aGlzLnByb2plY3RPdmVydmlld0RhdGE7XG5cdFx0Y29uc3Qgc3VtbWFyeSA9IGRhdGEuc3VtbWFyeSB8fCB7fTtcblxuXHRcdC8vIERlc2NyaXB0aW9uICYgRGF0ZXNcblx0XHQkKCcjb3ZlcnZpZXctZGVzY3JpcHRpb24nKS50ZXh0KHN1bW1hcnkuZGVzY3JpcHRpb24gfHwgX18oJ05vIGRlc2NyaXB0aW9uIHByb3ZpZGVkLicpKTtcblx0XHQkKCcjb3ZlcnZpZXctZGF0ZXMnKS50ZXh0KGAke3N1bW1hcnkuZXhwZWN0ZWRfc3RhcnRfZGF0ZSB8fCAnLS0nfSB0byAke3N1bW1hcnkuZXhwZWN0ZWRfZW5kX2RhdGUgfHwgJy0tJ31gKTtcblx0XHQkKCcjb3ZlcnZpZXctcHJvZ3Jlc3MnKS50ZXh0KGAke01hdGgucm91bmQoc3VtbWFyeS5wZXJjZW50X2NvbXBsZXRlIHx8IDApfSVgKTtcblxuXHRcdC8vIEhlYWx0aCBzdGF0dXNcblx0XHQkKCcjc2VsZWN0LXByb2plY3QtaGVhbHRoJykudmFsKHN1bW1hcnkuaGVhbHRoX3N0YXR1cyB8fCAnT24gVHJhY2snKTtcblx0XHQkKCcjb3ZlcnZpZXctc3RhdHVzLW5hcnJhdGl2ZScpLnRleHQoc3VtbWFyeS5zdGF0dXNfbmFycmF0aXZlIHx8IF9fKCdBbGwgdGFza3MgYW5kIHN1Yi1wcm9qZWN0cyBhcmUgb24gc2NoZWR1bGUuJykpO1xuXG5cdFx0Ly8gTWlsZXN0b25lIERpYW1vbmQgVGltZWxpbmVcblx0XHR0aGlzLnJlbmRlck1pbGVzdG9uZVRpbWVsaW5lKGRhdGEubWlsZXN0b25lcyB8fCBbXSk7XG5cblx0XHQvLyBTdWJwcm9qZWN0c1xuXHRcdGNvbnN0ICRzdWJMaXN0ID0gJCgnI3N1YnByb2plY3RzLWxpc3QnKTtcblx0XHQkc3ViTGlzdC5lbXB0eSgpO1xuXHRcdChkYXRhLnN1YnByb2plY3RzIHx8IFtdKS5mb3JFYWNoKHMgPT4ge1xuXHRcdFx0JHN1Ykxpc3QuYXBwZW5kKGBcblx0XHRcdFx0PGxpIGNsYXNzPVwiZmxleC1iZXR3ZWVuIHAtMVwiPlxuXHRcdFx0XHRcdDxzcGFuPjxpIGNsYXNzPVwiZmEgZmEtZm9sZGVyLW8gdGV4dC1wcmltYXJ5XCI+PC9pPiAke3MucHJvamVjdF9uYW1lfTwvc3Bhbj5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLXN1Y2Nlc3NcIiBzdHlsZT1cImJhY2tncm91bmQ6IzEwYjk4MTtcIj4ke3Muc3RhdHVzfTwvc3Bhbj5cblx0XHRcdFx0PC9saT5cblx0XHRcdGApO1xuXHRcdH0pO1xuXHRcdGlmICgoZGF0YS5zdWJwcm9qZWN0cyB8fCBbXSkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQkc3ViTGlzdC5hcHBlbmQoJzxsaSBjbGFzcz1cInRleHQtbXV0ZWQgcC0xXCI+PHNtYWxsPk5vIHN1YnByb2plY3RzIGNvbmZpZ3VyZWQuPC9zbWFsbD48L2xpPicpO1xuXHRcdH1cblxuXHRcdC8vIE1lZXRpbmdzXG5cdFx0Y29uc3QgJG1lZXRMaXN0ID0gJCgnI21lZXRpbmdzLWxpc3QtY29udGFpbmVyJyk7XG5cdFx0JG1lZXRMaXN0LmVtcHR5KCk7XG5cdFx0KGRhdGEubWVldGluZ3MgfHwgW10pLmZvckVhY2gobSA9PiB7XG5cdFx0XHQkbWVldExpc3QuYXBwZW5kKGBcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctaXRlbSBwLTIgbWItMVwiIHN0eWxlPVwiYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNmMWY1Zjk7XCI+XG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXgtYmV0d2VlblwiPlxuXHRcdFx0XHRcdFx0PHN0cm9uZz4ke20udGl0bGV9PC9zdHJvbmc+XG5cdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImJhZGdlIGJhZGdlLWluZm9cIj4ke20udHlwZX08L3NwYW4+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PHNtYWxsIGNsYXNzPVwidGV4dC1tdXRlZFwiPjxpIGNsYXNzPVwiZmEgZmEtY2FsZW5kYXJcIj48L2k+ICR7bS5kYXRlfSB8ICR7bS5ob3N0IHx8ICdDb29yZGluYXRvcid9PC9zbWFsbD5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRgKTtcblx0XHR9KTtcblx0XHRpZiAoKGRhdGEubWVldGluZ3MgfHwgW10pLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0JG1lZXRMaXN0LmFwcGVuZCgnPGRpdiBjbGFzcz1cInRleHQtbXV0ZWQgcC0yIHRleHQtY2VudGVyXCI+PHNtYWxsPk5vIHVwY29taW5nIG1lZXRpbmdzPC9zbWFsbD48L2Rpdj4nKTtcblx0XHR9XG5cblx0XHQvLyBNZW1iZXJzXG5cdFx0Y29uc3QgJG1lbUdyaWQgPSAkKCcjbWVtYmVycy1hdmF0YXJzLWdyaWQnKTtcblx0XHQkbWVtR3JpZC5lbXB0eSgpO1xuXHRcdChkYXRhLm1lbWJlcnMgfHwgW10pLmZvckVhY2gobSA9PiB7XG5cdFx0XHQkbWVtR3JpZC5hcHBlbmQoYFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVtYmVyLWNoaXAgcC0xXCIgc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmUtZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA2cHg7IG1hcmdpbjogNHB4O1wiPlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYXZhdGFyLWNpcmNsZVwiIHN0eWxlPVwid2lkdGg6MjhweDtoZWlnaHQ6MjhweDtib3JkZXItcmFkaXVzOjUwJTtiYWNrZ3JvdW5kOiMwMjg0Yzc7Y29sb3I6I2ZmZjtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6Ym9sZDtcIj5cblx0XHRcdFx0XHRcdCR7KG0uZnVsbF9uYW1lIHx8IG0udXNlcikuc3Vic3RyaW5nKDAsIDIpLnRvVXBwZXJDYXNlKCl9XG5cdFx0XHRcdFx0PC9zcGFuPlxuXHRcdFx0XHRcdDxzbWFsbD4ke20uZnVsbF9uYW1lIHx8IG0udXNlcn08L3NtYWxsPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdGApO1xuXHRcdH0pO1xuXG5cdFx0Ly8gTmV3c1xuXHRcdGNvbnN0ICRuZXdzQ29udCA9ICQoJyNuZXdzLWZlZWQtY29udGFpbmVyJyk7XG5cdFx0JG5ld3NDb250LmVtcHR5KCk7XG5cdFx0KGRhdGEubmV3cyB8fCBbXSkuZm9yRWFjaChuID0+IHtcblx0XHRcdCRuZXdzQ29udC5hcHBlbmQoYFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwibmV3cy1idWxsZXRpbiBwLTIgbWItMlwiIHN0eWxlPVwiYmFja2dyb3VuZDogI2Y4ZmFmYzsgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCAjM2I4MmY2OyBib3JkZXItcmFkaXVzOiA0cHg7XCI+XG5cdFx0XHRcdFx0PGg1IGNsYXNzPVwibS0wIGZvbnQtd2VpZ2h0LWJvbGRcIj4ke24udGl0bGV9PC9oNT5cblx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtuLmF1dGhvcn0gb24gJHtuLmRhdGV9PC9zbWFsbD5cblx0XHRcdFx0XHQ8cCBjbGFzcz1cIm0tMCBtdC0xIHRleHQtc2Vjb25kYXJ5XCIgc3R5bGU9XCJmb250LXNpemU6IDEycHg7XCI+JHtuLmNvbnRlbnR9PC9wPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdGApO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyTWlsZXN0b25lVGltZWxpbmUobWlsZXN0b25lcykge1xuXHRcdGNvbnN0ICRtYXJrZXJzID0gJCgnI3RpbWVsaW5lLW1hcmtlcnMtY29udGFpbmVyJyk7XG5cdFx0JG1hcmtlcnMuZW1wdHkoKTtcblxuXHRcdGlmIChtaWxlc3RvbmVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0JG1hcmtlcnMuYXBwZW5kKCc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBwLTIgdGV4dC1jZW50ZXJcIiBzdHlsZT1cIndpZHRoOjEwMCU7XCI+PHNtYWxsPk5vIGRlbGl2ZXJ5IG1pbGVzdG9uZXMgcmVjb3JkZWQgeWV0Ljwvc21hbGw+PC9kaXY+Jyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0bWlsZXN0b25lcy5mb3JFYWNoKG0gPT4ge1xuXHRcdFx0Y29uc3QgY29tcGxldGVkQ2xzID0gbS5jb21wbGV0ZWQgPyAnY29tcGxldGVkJyA6ICcnO1xuXHRcdFx0Y29uc3QgJHB0ID0gJChgXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtaWxlc3RvbmUtbWFya2VyLXBvaW50XCIgZGF0YS1pZD1cIiR7bS5pZH1cIiB0aXRsZT1cIiR7bS50aXRsZX0gKCR7bS5kdWVfZGF0ZSB8fCAnVEJEJ30pXCI+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtaWxlc3RvbmUtZGF0ZVwiPiR7KG0uZHVlX2RhdGUgfHwgJycpLnN1YnN0cmluZyg1KX08L3NwYW4+XG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1pbGVzdG9uZS1kaWFtb25kICR7Y29tcGxldGVkQ2xzfVwiPjwvZGl2PlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibWlsZXN0b25lLWxhYmVsXCI+JHttLnRpdGxlfTwvc3Bhbj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRgKTtcblx0XHRcdCRwdC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGZyYXBwZS5tc2dwcmludCh7XG5cdFx0XHRcdFx0dGl0bGU6IF9fKCdNaWxlc3RvbmUgRGVsaXZlcnkgRGV0YWlscycpLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGA8aDQ+JHttLnRpdGxlfTwvaDQ+PHA+PHN0cm9uZz5UYXJnZXQgRHVlIERhdGU6PC9zdHJvbmc+ICR7bS5kdWVfZGF0ZSB8fCAnTm9uZSd9PC9wPjxwPjxzdHJvbmc+U3RhdHVzOjwvc3Ryb25nPiAke20uc3RhdHVzfTwvcD5gLFxuXHRcdFx0XHRcdGluZGljYXRvcjogbS5jb21wbGV0ZWQgPyAnZ3JlZW4nIDogJ29yYW5nZSdcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHRcdCRtYXJrZXJzLmFwcGVuZCgkcHQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMjogV09SSyBQQUNLQUdFUyBHUklEIChTY3JlZW5zaG90IDMpXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyV29ya1BhY2thZ2VzKHNlYXJjaFF1ZXJ5ID0gbnVsbCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmxpc3Rfd29ya19wYWNrYWdlcycsXG5cdFx0XHRhcmdzOiB7XG5cdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXG5cdFx0XHRcdGZpbHRlcl9rZXk6IHNlbGYuYWN0aXZlRmlsdGVyS2V5LFxuXHRcdFx0XHR0eXBlX2ZpbHRlcjogc2VsZi5hY3RpdmVUeXBlRmlsdGVyLFxuXHRcdFx0XHRzZWFyY2g6IHNlYXJjaFF1ZXJ5XG5cdFx0XHR9XG5cdFx0fSkudGhlbihyID0+IHtcblx0XHRcdGNvbnN0IGl0ZW1zID0gci5tZXNzYWdlIHx8IFtdO1xuXHRcdFx0Y29uc3QgJHRib2R5ID0gJCgnI3dwLXRhYmxlLWJvZHknKTtcblx0XHRcdCR0Ym9keS5lbXB0eSgpO1xuXG5cdFx0XHRpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdCR0Ym9keS5hcHBlbmQoJzx0cj48dGQgY29sc3Bhbj1cIjdcIiBjbGFzcz1cInRleHQtY2VudGVyIHRleHQtbXV0ZWQgcC00XCI+Tm8gd29yayBwYWNrYWdlcyBtYXRjaCB0aGlzIGZpbHRlci48L3RkPjwvdHI+Jyk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aXRlbXMuZm9yRWFjaChpdCA9PiB7XG5cdFx0XHRcdGNvbnN0IHBpbGxDbHMgPSBgd3AtcGlsbC0keyhpdC50eXBlIHx8ICd0YXNrJykudG9Mb3dlckNhc2UoKX1gO1xuXHRcdFx0XHRjb25zdCBpbmRlbnQgPSBpdC5wYXJlbnRfdGFzayA/ICcmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcdTIxQjMgJyA6ICcnO1xuXHRcdFx0XHRjb25zdCAkdHIgPSAkKGBcblx0XHRcdFx0XHQ8dHIgY2xhc3M9XCJ3cC1yb3ctaXRlbVwiIGRhdGEtaWQ9XCIke2l0LmlkfVwiIHN0eWxlPVwiY3Vyc29yOiBwb2ludGVyO1wiPlxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4jJHtpdC5pZC5yZXBsYWNlKCdUQVNLLScsICcnKX08L3NtYWxsPjwvdGQ+XG5cdFx0XHRcdFx0XHQ8dGQ+JHtpbmRlbnR9PHN0cm9uZz4ke2l0LnN1YmplY3R9PC9zdHJvbmc+PC90ZD5cblx0XHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cIndwLXBpbGwgJHtwaWxsQ2xzfVwiPiR7aXQudHlwZX08L3NwYW4+PC90ZD5cblx0XHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cInN0YXR1cy1kb3RcIj48L3NwYW4+ICR7aXQuc3RhdHVzfTwvdGQ+XG5cdFx0XHRcdFx0XHQ8dGQ+PHNtYWxsPiR7aXQuYXNzaWduZWVfbmFtZSB8fCAnVW5hc3NpZ25lZCd9PC9zbWFsbD48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbD4ke2l0LnByaW9yaXR5fTwvc21hbGw+PC90ZD5cblx0XHRcdFx0XHRcdDx0ZD48c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHtpdC5leHBfZW5kX2RhdGUgfHwgJy0tJ308L3NtYWxsPjwvdGQ+XG5cdFx0XHRcdFx0PC90cj5cblx0XHRcdFx0YCk7XG5cblx0XHRcdFx0JHRyLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRzZWxmLm9wZW5Xb3JrUGFja2FnZUluc3BlY3RvcihpdCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCR0Ym9keS5hcHBlbmQoJHRyKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0b3BlbldvcmtQYWNrYWdlSW5zcGVjdG9yKHdwKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgZCA9IG5ldyBmcmFwcGUudWkuRGlhbG9nKHtcblx0XHRcdHRpdGxlOiBgWyR7d3AudHlwZX1dICMke3dwLmlkfSAtICR7d3Auc3ViamVjdH1gLFxuXHRcdFx0ZmllbGRzOiBbXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnc3RhdHVzJywgbGFiZWw6IF9fKCdTdGF0dXMnKSwgZmllbGR0eXBlOiAnU2VsZWN0Jywgb3B0aW9uczogJ09wZW5cXG5Xb3JraW5nXFxuUGVuZGluZyBSZXZpZXdcXG5Db21wbGV0ZWRcXG5DYW5jZWxsZWQnLCBkZWZhdWx0OiB3cC5zdGF0dXMgfSxcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdwcmlvcml0eScsIGxhYmVsOiBfXygnUHJpb3JpdHknKSwgZmllbGR0eXBlOiAnU2VsZWN0Jywgb3B0aW9uczogJ0xvd1xcbk5vcm1hbFxcbkhpZ2hcXG5VcmdlbnQnLCBkZWZhdWx0OiB3cC5wcmlvcml0eSB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2V4cF9lbmRfZGF0ZScsIGxhYmVsOiBfXygnRHVlIERhdGUnKSwgZmllbGR0eXBlOiAnRGF0ZScsIGRlZmF1bHQ6IHdwLmV4cF9lbmRfZGF0ZSB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2xpbmtlZF9pbmZvJywgbGFiZWw6IF9fKCdEb21haW4gTGlua2FnZScpLCBmaWVsZHR5cGU6ICdIVE1MJyB9XG5cdFx0XHRdLFxuXHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdVcGRhdGUgV29yayBQYWNrYWdlJyksXG5cdFx0XHRwcmltYXJ5X2FjdGlvbih2YWx1ZXMpIHtcblx0XHRcdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuc2V0X3ZhbHVlJyxcblx0XHRcdFx0XHRhcmdzOiB7XG5cdFx0XHRcdFx0XHRkb2N0eXBlOiAnVGFzaycsXG5cdFx0XHRcdFx0XHRuYW1lOiB3cC5pZCxcblx0XHRcdFx0XHRcdGZpZWxkbmFtZToge1xuXHRcdFx0XHRcdFx0XHRzdGF0dXM6IHZhbHVlcy5zdGF0dXMsXG5cdFx0XHRcdFx0XHRcdHByaW9yaXR5OiB2YWx1ZXMucHJpb3JpdHksXG5cdFx0XHRcdFx0XHRcdGV4cF9lbmRfZGF0ZTogdmFsdWVzLmV4cF9lbmRfZGF0ZVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0ZC5oaWRlKCk7XG5cdFx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnV29yayBwYWNrYWdlIHVwZGF0ZWQuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdFx0XHRzZWxmLnJlbmRlcldvcmtQYWNrYWdlcygpO1xuXHRcdFx0XHRcdGlmIChzZWxmLmN1cnJlbnRUYWIgPT09ICdib2FyZHMnKSBzZWxmLnJlbmRlckthbmJhbkJvYXJkKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0bGV0IGxpbmtIdG1sID0gJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+PHNtYWxsPk5hdGl2ZSBUYXNrIGluIEVSUE5leHQuPC9zbWFsbD48L2Rpdj4nO1xuXHRcdGlmICh3cC5iY2ZfdG9waWMpIHtcblx0XHRcdGxpbmtIdG1sID0gYDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC13YXJuaW5nXCI+PGkgY2xhc3M9XCJmYSBmYS1jdWJlXCI+PC9pPiBMaW5rZWQgdG8gQkNGIENsYXNoIFRvcGljOiA8c3Ryb25nPiR7d3AuYmNmX3RvcGljfTwvc3Ryb25nPjwvZGl2PmA7XG5cdFx0fSBlbHNlIGlmICh3cC5yZmlfbGluaykge1xuXHRcdFx0bGlua0h0bWwgPSBgPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LWluZm9cIj48aSBjbGFzcz1cImZhIGZhLXF1ZXN0aW9uLWNpcmNsZVwiPjwvaT4gTGlua2VkIHRvIFRlY2huaWNhbCBSRkk6IDxzdHJvbmc+JHt3cC5yZmlfbGlua308L3N0cm9uZz48L2Rpdj5gO1xuXHRcdH1cblx0XHRkLmZpZWxkc19kaWN0LmxpbmtlZF9pbmZvLiR3cmFwcGVyLmh0bWwobGlua0h0bWwpO1xuXHRcdGQuc2hvdygpO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMzogS0FOQkFOIEJPQVJEUyAoSFRNTDUgRHJhZyAmIERyb3ApXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyS2FuYmFuQm9hcmQoKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8uZ2V0X2thbmJhbl9ib2FyZF9kYXRhJyxcblx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0cHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCxcblx0XHRcdFx0Z3JvdXBfYnk6IHNlbGYuYm9hcmRHcm91cEJ5XG5cdFx0XHR9XG5cdFx0fSkudGhlbihyID0+IHtcblx0XHRcdGNvbnN0IGRhdGEgPSByLm1lc3NhZ2UgfHwge307XG5cdFx0XHRjb25zdCBjb2x1bW5zID0gZGF0YS5jb2x1bW5zIHx8IFtdO1xuXHRcdFx0Y29uc3QgJHdyYXBwZXIgPSAkKCcja2FuYmFuLWNvbHVtbnMtd3JhcHBlcicpO1xuXHRcdFx0JHdyYXBwZXIuZW1wdHkoKTtcblxuXHRcdFx0Y29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG5cdFx0XHRcdGNvbnN0ICRjb2wgPSAkKGBcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwia2FuYmFuLWNvbHVtblwiIGRhdGEtY29sLWlkPVwiJHtjb2wuaWR9XCI+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sdW1uLWhlYWRlclwiPlxuXHRcdFx0XHRcdFx0XHQ8c3Bhbj4ke2NvbC50aXRsZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYmFkZ2UgY29sLWNhcmQtY291bnRcIj4ke2NvbC5jYXJkcy5sZW5ndGh9PC9zcGFuPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiY29sdW1uLWNhcmRzLWxpc3RcIiBkYXRhLWNvbC1pZD1cIiR7Y29sLmlkfVwiPlxuXHRcdFx0XHRcdFx0XHQ8IS0tIENhcmRzIC0tPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdGApO1xuXG5cdFx0XHRcdGNvbnN0ICRjYXJkc0xpc3QgPSAkY29sLmZpbmQoJy5jb2x1bW4tY2FyZHMtbGlzdCcpO1xuXG5cdFx0XHRcdC8vIE5hdGl2ZSBIVE1MNSBEcmFnIGFuZCBEcm9wIGhhbmRsZXJzIG9uIGRyb3B6b25lXG5cdFx0XHRcdCRjYXJkc0xpc3Qub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0JCh0aGlzKS5jc3MoJ2JhY2tncm91bmQnLCAnI2UyZThmMCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JGNhcmRzTGlzdC5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnYmFja2dyb3VuZCcsICcnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCRjYXJkc0xpc3Qub24oJ2Ryb3AnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnYmFja2dyb3VuZCcsICcnKTtcblx0XHRcdFx0XHRjb25zdCB0YXNrSWQgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcblx0XHRcdFx0XHRjb25zdCB0YXJnZXRDb2x1bW5JZCA9IGNvbC5pZDtcblxuXHRcdFx0XHRcdGlmICh0YXNrSWQgJiYgdGFyZ2V0Q29sdW1uSWQpIHtcblx0XHRcdFx0XHRcdC8vIE9wdGltaXN0aWMgRE9NIHVwZGF0ZVxuXHRcdFx0XHRcdFx0Y29uc3QgJGRyYWdnZWRDYXJkID0gJChgW2RhdGEtdGFzaz1cIiR7dGFza0lkfVwiXWApO1xuXHRcdFx0XHRcdFx0aWYgKCRkcmFnZ2VkQ2FyZC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdCRjYXJkc0xpc3QuYXBwZW5kKCRkcmFnZ2VkQ2FyZCk7XG5cdFx0XHRcdFx0XHRcdHNlbGYudXBkYXRlQm9hcmRDb2x1bW5Db3VudHMoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gUGVyc2lzdCB0byBiYWNrZW5kXG5cdFx0XHRcdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdFx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLnVwZGF0ZV93b3JrX3BhY2thZ2Vfc3RhdHVzJyxcblx0XHRcdFx0XHRcdFx0YXJnczoge1xuXHRcdFx0XHRcdFx0XHRcdHRhc2tfbmFtZTogdGFza0lkLFxuXHRcdFx0XHRcdFx0XHRcdG5ld19jb2x1bW46IHRhcmdldENvbHVtbklkLFxuXHRcdFx0XHRcdFx0XHRcdGdyb3VwX2J5OiBzZWxmLmJvYXJkR3JvdXBCeVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnV29yayBwYWNrYWdlIHN0YXR1cyB1cGRhdGVkIHRvIHswfScsIFt0YXJnZXRDb2x1bW5JZF0pLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIFBvcHVsYXRlIGNhcmRzXG5cdFx0XHRcdGNvbC5jYXJkcy5mb3JFYWNoKGNhcmQgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHBpbGxDbHMgPSBgd3AtcGlsbC0keyhjYXJkLnR5cGUgfHwgJ3Rhc2snKS50b0xvd2VyQ2FzZSgpfWA7XG5cdFx0XHRcdFx0Y29uc3QgJGNhcmQgPSAkKGBcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY2FyZFwiIGRyYWdnYWJsZT1cInRydWVcIiBkYXRhLXRhc2s9XCIke2NhcmQuaWR9XCI+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4LWJldHdlZW4gbWItMVwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwid3AtcGlsbCAke3BpbGxDbHN9XCI+JHtjYXJkLnR5cGV9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke2NhcmQucHJpb3JpdHl9PC9zbWFsbD5cblx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHRcdDxkaXYgc3R5bGU9XCJmb250LXdlaWdodDogNjAwOyBmb250LXNpemU6IDEzcHg7IGNvbG9yOiAjMWUyOTNiO1wiPiR7Y2FyZC5zdWJqZWN0fTwvZGl2PlxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleC1iZXR3ZWVuIG10LTJcIj5cblx0XHRcdFx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+PGkgY2xhc3M9XCJmYSBmYS1jYWxlbmRhclwiPjwvaT4gJHtjYXJkLmV4cF9lbmRfZGF0ZSB8fCAnLS0nfTwvc21hbGw+XG5cdFx0XHRcdFx0XHRcdFx0PHNtYWxsIGNsYXNzPVwidGV4dC1zZWNvbmRhcnlcIj4ke2NhcmQuYXNzaWduZWVfbmFtZSB8fCAnJ308L3NtYWxsPlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdGApO1xuXG5cdFx0XHRcdFx0JGNhcmQub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0XHRlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvcGxhaW4nLCBjYXJkLmlkKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdCRjYXJkLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHNlbGYub3BlbldvcmtQYWNrYWdlSW5zcGVjdG9yKGNhcmQpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0JGNhcmRzTGlzdC5hcHBlbmQoJGNhcmQpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkd3JhcHBlci5hcHBlbmQoJGNvbCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHVwZGF0ZUJvYXJkQ29sdW1uQ291bnRzKCkge1xuXHRcdCQoJy5rYW5iYW4tY29sdW1uJykuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBjb3VudCA9ICQodGhpcykuZmluZCgnLmthbmJhbi1jYXJkJykubGVuZ3RoO1xuXHRcdFx0JCh0aGlzKS5maW5kKCcuY29sLWNhcmQtY291bnQnKS50ZXh0KGNvdW50KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVEFCIDQ6IEdBTlRUIFNDSEVEVUxFIFRJTUVMSU5FXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyR2FudHRDaGFydCgpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5saXN0X3dvcmtfcGFja2FnZXMnLFxuXHRcdFx0YXJnczogeyBwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LCBmaWx0ZXJfa2V5OiAnYWxsX29wZW4nIH1cblx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0Y29uc3QgaXRlbXMgPSByLm1lc3NhZ2UgfHwgW107XG5cdFx0XHRjb25zdCAkdGFyZ2V0ID0gJCgnI2ZyYXBwZS1nYW50dC10YXJnZXQnKTtcblx0XHRcdCR0YXJnZXQuZW1wdHkoKTtcblxuXHRcdFx0aWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQkdGFyZ2V0Lmh0bWwoJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkIHRleHQtY2VudGVyIHAtNFwiPk5vIHNjaGVkdWxlZCB3b3JrIHBhY2thZ2VzIGZvdW5kIGZvciBHYW50dCBjaGFydC48L2Rpdj4nKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBGb3JtYXQgdGFza3MgZm9yIEdhbnR0XG5cdFx0XHRjb25zdCBub3dTdHIgPSAoZnJhcHBlLmRhdGV0aW1lICYmIGZyYXBwZS5kYXRldGltZS5nZXRfdG9kYXkpID8gZnJhcHBlLmRhdGV0aW1lLmdldF90b2RheSgpIDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG5cdFx0XHRjb25zdCBnYW50dFRhc2tzID0gaXRlbXMubWFwKGl0ID0+IHtcblx0XHRcdFx0Y29uc3Qgc3RhcnQgPSBpdC5leHBfc3RhcnRfZGF0ZSB8fCBub3dTdHI7XG5cdFx0XHRcdGNvbnN0IGVuZCA9IGl0LmV4cF9lbmRfZGF0ZSB8fCAoKGZyYXBwZS5kYXRldGltZSAmJiBmcmFwcGUuZGF0ZXRpbWUuYWRkX2RheXMpID8gZnJhcHBlLmRhdGV0aW1lLmFkZF9kYXlzKHN0YXJ0LCA3KSA6IHN0YXJ0KTtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRpZDogaXQuaWQsXG5cdFx0XHRcdFx0bmFtZTogYFske2l0LnR5cGV9XSAke2l0LnN1YmplY3R9YCxcblx0XHRcdFx0XHRzdGFydDogc3RhcnQsXG5cdFx0XHRcdFx0ZW5kOiBlbmQsXG5cdFx0XHRcdFx0cHJvZ3Jlc3M6IGl0LnByb2dyZXNzIHx8IDAsXG5cdFx0XHRcdFx0Y3VzdG9tX2NsYXNzOiBgYmFyLSR7aXQudHlwZS50b0xvd2VyQ2FzZSgpfWBcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAod2luZG93LkdhbnR0KSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0bmV3IHdpbmRvdy5HYW50dCgnI2ZyYXBwZS1nYW50dC10YXJnZXQnLCBnYW50dFRhc2tzLCB7XG5cdFx0XHRcdFx0XHR2aWV3X21vZGVzOiBbJ1F1YXJ0ZXIgRGF5JywgJ0hhbGYgRGF5JywgJ0RheScsICdXZWVrJywgJ01vbnRoJ10sXG5cdFx0XHRcdFx0XHR2aWV3X21vZGU6ICdEYXknLFxuXHRcdFx0XHRcdFx0ZGF0ZV9mb3JtYXQ6ICdZWVlZLU1NLUREJyxcblx0XHRcdFx0XHRcdG9uX2NsaWNrOiAodGFzaykgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25zdCB3cCA9IGl0ZW1zLmZpbmQoaSA9PiBpLmlkID09PSB0YXNrLmlkKTtcblx0XHRcdFx0XHRcdFx0aWYgKHdwKSBzZWxmLm9wZW5Xb3JrUGFja2FnZUluc3BlY3Rvcih3cCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKCdGcmFwcGUgR2FudHQgaW5zdGFudGlhdGlvbiBmYWlsZWQsIHJlbmRlcmluZyBjdXN0b20gdGltZWxpbmUgZmFsbGJhY2snLCBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBDdXN0b20gSW50ZXJhY3RpdmUgVGltZWxpbmUgVmlzdWFsaXphdGlvbiBGYWxsYmFja1xuXHRcdFx0bGV0IGh0bWwgPSAnPGRpdiBjbGFzcz1cImN1c3RvbS1nYW50dC10YWJsZSB0YWJsZS1yZXNwb25zaXZlXCI+PHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtY29uZGVuc2VkXCI+PHRoZWFkPjx0cj48dGggd2lkdGg9XCIzMCVcIj5Xb3JrIFBhY2thZ2U8L3RoPjx0aCB3aWR0aD1cIjE1JVwiPlN0YXJ0IERhdGU8L3RoPjx0aCB3aWR0aD1cIjE1JVwiPkR1ZSBEYXRlPC90aD48dGggd2lkdGg9XCI0MCVcIj5UaW1lbGluZSBQcm9ncmVzczwvdGg+PC90cj48L3RoZWFkPjx0Ym9keT4nO1xuXHRcdFx0aXRlbXMuZm9yRWFjaChpdCA9PiB7XG5cdFx0XHRcdGNvbnN0IHBpbGxDbHMgPSBgd3AtcGlsbC0keyhpdC50eXBlIHx8ICd0YXNrJykudG9Mb3dlckNhc2UoKX1gO1xuXHRcdFx0XHRjb25zdCBwcm9ncmVzcyA9IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgaXQucHJvZ3Jlc3MgfHwgKGl0LnN0YXR1cyA9PT0gJ0NvbXBsZXRlZCcgPyAxMDAgOiAyNSkpKTtcblx0XHRcdFx0aHRtbCArPSBgXG5cdFx0XHRcdFx0PHRyIGNsYXNzPVwid3AtZ2FudHQtcm93XCIgZGF0YS1pZD1cIiR7aXQuaWR9XCIgc3R5bGU9XCJjdXJzb3I6IHBvaW50ZXI7XCI+XG5cdFx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2l0LnR5cGV9PC9zcGFuPiA8c3Ryb25nPiR7aXQuc3ViamVjdH08L3N0cm9uZz48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbD4ke2l0LmV4cF9zdGFydF9kYXRlIHx8ICctLSd9PC9zbWFsbD48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbD4ke2l0LmV4cF9lbmRfZGF0ZSB8fCAnLS0nfTwvc21hbGw+PC90ZD5cblx0XHRcdFx0XHRcdDx0ZD5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInByb2dyZXNzXCIgc3R5bGU9XCJtYXJnaW46IDA7IGhlaWdodDogMThweDsgYm9yZGVyLXJhZGl1czogOXB4OyBiYWNrZ3JvdW5kOiAjZTJlOGYwO1wiPlxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLXN0cmlwZWRcIiByb2xlPVwicHJvZ3Jlc3NiYXJcIiBzdHlsZT1cIndpZHRoOiAke3Byb2dyZXNzfSU7IGJhY2tncm91bmQ6ICMwMjg0Yzc7XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHQke3Byb2dyZXNzfSVcblx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8L3RkPlxuXHRcdFx0XHRcdDwvdHI+XG5cdFx0XHRcdGA7XG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvdGJvZHk+PC90YWJsZT48L2Rpdj4nO1xuXHRcdFx0JHRhcmdldC5odG1sKGh0bWwpO1xuXG5cdFx0XHQkdGFyZ2V0LmZpbmQoJy53cC1nYW50dC1yb3cnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnN0IGlkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHRcdFx0XHRjb25zdCB3cCA9IGl0ZW1zLmZpbmQoaSA9PiBpLmlkID09PSBpZCk7XG5cdFx0XHRcdGlmICh3cCkgc2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3Iod3ApO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFRBQiA1OiBCQ0YgMi1QQU5FIENPT1JESU5BVElPTiBWSUVXRVIgKFNjcmVlbnNob3QgNClcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJCY2ZWaWV3ZXIoKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Ly8gRmV0Y2ggQklNIG1vZGVscyBmb3IgcHJvamVjdFxuXHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuZ2V0X2xpc3QnLFxuXHRcdFx0YXJnczoge1xuXHRcdFx0XHRkb2N0eXBlOiAnQklNIE1vZGVsJyxcblx0XHRcdFx0ZmlsdGVyczogeyBwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0IH0sXG5cdFx0XHRcdGZpZWxkczogWyduYW1lJywgJ21vZGVsX25hbWUnLCAnaWZjX2ZpbGUnXVxuXHRcdFx0fVxuXHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRjb25zdCBtb2RlbHMgPSByLm1lc3NhZ2UgfHwgW107XG5cdFx0XHRjb25zdCAkdHJlZSA9ICQoJyNiY2YtbW9kZWxzLXRyZWUnKTtcblx0XHRcdCR0cmVlLmVtcHR5KCk7XG5cblx0XHRcdGlmIChtb2RlbHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdCR0cmVlLmFwcGVuZCgnPGRpdiBjbGFzcz1cInRleHQtbXV0ZWQgcC0yXCI+PHNtYWxsPk5vIElGQyBtb2RlbHMgdXBsb2FkZWQuPC9zbWFsbD48L2Rpdj4nKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1vZGVscy5mb3JFYWNoKG0gPT4ge1xuXHRcdFx0XHRcdCR0cmVlLmFwcGVuZChgXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibW9kZWwtdHJlZS1yb3cgcC0xXCI+XG5cdFx0XHRcdFx0XHRcdDxsYWJlbCBzdHlsZT1cImZvbnQtd2VpZ2h0OiBub3JtYWw7IGZvbnQtc2l6ZTogMTJweDsgY3Vyc29yOiBwb2ludGVyO1wiPlxuXHRcdFx0XHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBjaGVja2VkIGRhdGEtbW9kZWw9XCIke20ubmFtZX1cIj4gJHttLm1vZGVsX25hbWUgfHwgbS5uYW1lfVxuXHRcdFx0XHRcdFx0XHQ8L2xhYmVsPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0YCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gRmV0Y2ggQkNGIFRvcGljc1xuXHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuZ2V0X2xpc3QnLFxuXHRcdFx0YXJnczoge1xuXHRcdFx0XHRkb2N0eXBlOiAnQkNGIFRvcGljJyxcblx0XHRcdFx0ZmlsdGVyczogeyBwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0IH0sXG5cdFx0XHRcdGZpZWxkczogWyduYW1lJywgJ3RpdGxlJywgJ3RvcGljX3R5cGUnLCAncHJpb3JpdHknLCAnc3RhdHVzJywgJ2NyZWF0aW9uJ11cblx0XHRcdH1cblx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0Y29uc3QgdG9waWNzID0gci5tZXNzYWdlIHx8IFtdO1xuXHRcdFx0JCgnI2JjZi10b3BpYy1jb3VudCcpLnRleHQodG9waWNzLmxlbmd0aCk7XG5cdFx0XHRjb25zdCAkc3RyZWFtID0gJCgnI2JjZi1jYXJkcy1jb250YWluZXInKTtcblx0XHRcdCRzdHJlYW0uZW1wdHkoKTtcblxuXHRcdFx0dG9waWNzLmZvckVhY2godG9wID0+IHtcblx0XHRcdFx0JHN0cmVhbS5hcHBlbmQoYFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJiY2YtdG9waWMtY2FyZCBwLTJcIiBzdHlsZT1cImJvcmRlcjogMXB4IHNvbGlkICNlMmU4ZjA7IGJvcmRlci1yYWRpdXM6IDZweDsgYmFja2dyb3VuZDogI2ZmZjtcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4LWJldHdlZW5cIj5cblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJiYWRnZSBiYWRnZS13YXJuaW5nXCI+JHt0b3AudG9waWNfdHlwZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke3RvcC5zdGF0dXN9PC9zbWFsbD5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PGg1IGNsYXNzPVwibXQtMSBtYi0xXCI+JHt0b3AudGl0bGV9PC9oNT5cblx0XHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj48aSBjbGFzcz1cImZhIGZhLWNsb2NrLW9cIj48L2k+ICR7dG9wLmNyZWF0aW9uLnNwbGl0KCcgJylbMF19PC9zbWFsbD5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0YCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVEFCIDg6IFBST0pFQ1QgRE9DVU1FTlRTIFRSRUUgJiBVUExPQURcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJEb2N1bWVudHNUcmVlKCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmdldF9wcm9qZWN0X2RvY3VtZW50X3RyZWUnLFxuXHRcdFx0YXJnczogeyBwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0IH1cblx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0Y29uc3QgZm9sZGVycyA9IHIubWVzc2FnZSB8fCBbXTtcblx0XHRcdGNvbnN0ICRjb250ID0gJCgnI2RvY3VtZW50LWZvbGRlcnMtY29udGFpbmVyJyk7XG5cdFx0XHQkY29udC5lbXB0eSgpO1xuXG5cdFx0XHRmb2xkZXJzLmZvckVhY2goZiA9PiB7XG5cdFx0XHRcdGNvbnN0ICRib3ggPSAkKGBcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZm9sZGVyLWJveFwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvbGRlci1oZWFkZXJcIj5cblx0XHRcdFx0XHRcdFx0PGkgY2xhc3M9XCIke2YuaWNvbn0gdGV4dC1wcmltYXJ5XCI+PC9pPlxuXHRcdFx0XHRcdFx0XHQ8c3Bhbj4ke2YuZm9sZGVyX25hbWV9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImJhZGdlIG1sLWF1dG9cIj4ke2YuZmlsZXMubGVuZ3RofTwvc3Bhbj5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvbGRlci1maWxlcy1saXN0XCI+XG5cdFx0XHRcdFx0XHRcdDwhLS0gRmlsZXMgLS0+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0YCk7XG5cblx0XHRcdFx0Y29uc3QgJGZMaXN0ID0gJGJveC5maW5kKCcuZm9sZGVyLWZpbGVzLWxpc3QnKTtcblx0XHRcdFx0aWYgKGYuZmlsZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0JGZMaXN0LmFwcGVuZCgnPGRpdiBjbGFzcz1cInRleHQtbXV0ZWQgcC0yIHRleHQtY2VudGVyXCI+PHNtYWxsPkVtcHR5IGZvbGRlcjwvc21hbGw+PC9kaXY+Jyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zi5maWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuXHRcdFx0XHRcdFx0JGZMaXN0LmFwcGVuZChgXG5cdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImZpbGUtaXRlbS1saW5rXCIgZGF0YS1yb3V0ZT1cIiR7ZmlsZS5yb3V0ZV90YXJnZXR9XCIgZGF0YS11cmw9XCIke2ZpbGUuZmlsZV91cmx9XCI+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4+PGkgY2xhc3M9XCJmYSBmYS1maWxlIHRleHQtc2Vjb25kYXJ5XCI+PC9pPiAke2ZpbGUuZmlsZV9uYW1lfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImJhZGdlXCI+JHtmaWxlLmJhZGdlfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PC9hPlxuXHRcdFx0XHRcdFx0YCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkY29udC5hcHBlbmQoJGJveCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdG9wZW5GaWxlVXBsb2FkRGlhbG9nKCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdG5ldyBmcmFwcGUudWkuRmlsZVVwbG9hZGVyKHtcblx0XHRcdGRvY3R5cGU6ICdQcm9qZWN0Jyxcblx0XHRcdGRvY25hbWU6IHNlbGYuY3VycmVudFByb2plY3QsXG5cdFx0XHRmb2xkZXI6ICdIb21lJyxcblx0XHRcdG9uX3N1Y2Nlc3MoZmlsZV9kb2MpIHtcblx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnRmlsZSB1cGxvYWRlZCBzdWNjZXNzZnVsbHkuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdFx0c2VsZi5yZW5kZXJEb2N1bWVudHNUcmVlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFRBQiA5OiBNRUVUSU5HUyAmIFRPT0xCT1ggVEFMS1Ncblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJNZWV0aW5nc1RhYigpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBkYXRhID0gdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhIHx8IHt9O1xuXHRcdGNvbnN0IG1lZXRpbmdzID0gZGF0YS5tZWV0aW5ncyB8fCBbXTtcblx0XHRjb25zdCAkY29udCA9ICQoJyNtZWV0aW5ncy10YWItY29udGFpbmVyJyk7XG5cdFx0JGNvbnQuZW1wdHkoKTtcblxuXHRcdGlmIChtZWV0aW5ncy5sZW5ndGggPT09IDApIHtcblx0XHRcdCRjb250Lmh0bWwoJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkIHRleHQtY2VudGVyIHAtNFwiPk5vIGNvb3JkaW5hdGlvbiBtZWV0aW5ncyBvciB0b29sYm94IHRhbGtzIGxvZ2dlZCB5ZXQuIENsaWNrIDxzdHJvbmc+TmV3IE1lZXRpbmc8L3N0cm9uZz4gYWJvdmUgdG8gY3JlYXRlIG9uZS48L2Rpdj4nKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRtZWV0aW5ncy5mb3JFYWNoKG0gPT4ge1xuXHRcdFx0JGNvbnQuYXBwZW5kKGBcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1lZXRpbmctY2FyZCBwLTMgbWItM1wiIHN0eWxlPVwiYmFja2dyb3VuZDogI2ZmZjsgYm9yZGVyOiAxcHggc29saWQgI2UyZThmMDsgYm9yZGVyLXJhZGl1czogOHB4OyBib3gtc2hhZG93OiAwIDFweCAzcHggcmdiYSgwLDAsMCwwLjA1KTtcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleC1iZXR3ZWVuXCI+XG5cdFx0XHRcdFx0XHQ8ZGl2PlxuXHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cImJhZGdlICR7bS50eXBlID09PSAnVG9vbGJveCBUYWxrJyA/ICdiYWRnZS13YXJuaW5nJyA6ICdiYWRnZS1wcmltYXJ5J31cIj4ke20udHlwZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdDxoNCBjbGFzcz1cIm10LTEgbWItMSBmb250LXdlaWdodC1ib2xkXCI+JHttLnRpdGxlfTwvaDQ+XG5cdFx0XHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj48aSBjbGFzcz1cImZhIGZhLWNhbGVuZGFyXCI+PC9pPiAke20uZGF0ZX0gJm5ic3A7fCZuYnNwOyA8aSBjbGFzcz1cImZhIGZhLXVzZXJcIj48L2k+IENvbmR1Y3RvcjogJHttLmhvc3QgfHwgJ1NpdGUgQ29vcmRpbmF0b3InfSAmbmJzcDt8Jm5ic3A7IDxpIGNsYXNzPVwiZmEgZmEtdXNlcnNcIj48L2k+IEF0dGVuZGVlczogJHttLnBhcnRpY2lwYW50cyB8fCAwfTwvc21hbGw+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzIGJ0bi12aWV3LW1lZXRpbmctZG9jXCIgZGF0YS1kb2N0eXBlPVwiJHttLnR5cGV9XCIgZGF0YS1uYW1lPVwiJHttLm5hbWV9XCI+PGkgY2xhc3M9XCJmYSBmYS1leWVcIj48L2k+IFZpZXcgRG9jPC9idXR0b24+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0YCk7XG5cdFx0fSk7XG5cblx0XHQkY29udC5maW5kKCcuYnRuLXZpZXctbWVldGluZy1kb2MnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBkdCA9ICQodGhpcykuZGF0YSgnZG9jdHlwZScpO1xuXHRcdFx0Y29uc3Qgbm0gPSAkKHRoaXMpLmRhdGEoJ25hbWUnKTtcblx0XHRcdGZyYXBwZS5zZXRfcm91dGUoJ0Zvcm0nLCBkdCwgbm0pO1xuXHRcdH0pO1xuXHR9XG5cblx0b3BlblNjaGVkdWxlTWVldGluZ0RpYWxvZygpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xuXHRcdFx0dGl0bGU6IF9fKCdTY2hlZHVsZSBDb29yZGluYXRpb24gTWVldGluZyBvciBTYWZldHkgQnJpZWZpbmcnKSxcblx0XHRcdGZpZWxkczogW1xuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ21lZXRpbmdfdHlwZScsIGxhYmVsOiBfXygnVHlwZScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnVG9vbGJveCBUYWxrXFxuQ29vcmRpbmF0aW9uIE1lZXRpbmcnLCBkZWZhdWx0OiAnVG9vbGJveCBUYWxrJyB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3N1YmplY3QnLCBsYWJlbDogX18oJ1RvcGljIC8gU3ViamVjdCcpLCBmaWVsZHR5cGU6ICdEYXRhJywgcmVxZDogMSB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2RhdGUnLCBsYWJlbDogX18oJ0RhdGUnKSwgZmllbGR0eXBlOiAnRGF0ZScsIGRlZmF1bHQ6IChmcmFwcGUuZGF0ZXRpbWUgJiYgZnJhcHBlLmRhdGV0aW1lLmdldF90b2RheSkgPyBmcmFwcGUuZGF0ZXRpbWUuZ2V0X3RvZGF5KCkgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ2NvbmR1Y3RvcicsIGxhYmVsOiBfXygnQ29uZHVjdG9yIC8gSG9zdCcpLCBmaWVsZHR5cGU6ICdEYXRhJyB9XG5cdFx0XHRdLFxuXHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdDcmVhdGUgTWVldGluZycpLFxuXHRcdFx0cHJpbWFyeV9hY3Rpb24odmFsdWVzKSB7XG5cdFx0XHRcdGlmICh2YWx1ZXMubWVldGluZ190eXBlID09PSAnVG9vbGJveCBUYWxrJykge1xuXHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuaW5zZXJ0Jyxcblx0XHRcdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRcdFx0ZG9jOiB7XG5cdFx0XHRcdFx0XHRcdFx0ZG9jdHlwZTogJ1Rvb2xib3ggVGFsaycsXG5cdFx0XHRcdFx0XHRcdFx0cHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCxcblx0XHRcdFx0XHRcdFx0XHR0b3BpY19jYXRlZ29yeTogdmFsdWVzLnN1YmplY3QsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0ZTogdmFsdWVzLmRhdGUsXG5cdFx0XHRcdFx0XHRcdFx0Y29uZHVjdG9yX25hbWU6IHZhbHVlcy5jb25kdWN0b3IgfHwgZnJhcHBlLnNlc3Npb24udXNlclxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRkLmhpZGUoKTtcblx0XHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1Rvb2xib3ggdGFsayBzY2hlZHVsZWQuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuaW5zZXJ0Jyxcblx0XHRcdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRcdFx0ZG9jOiB7XG5cdFx0XHRcdFx0XHRcdFx0ZG9jdHlwZTogJ0V2ZW50Jyxcblx0XHRcdFx0XHRcdFx0XHRzdWJqZWN0OiB2YWx1ZXMuc3ViamVjdCxcblx0XHRcdFx0XHRcdFx0XHRzdGFydHNfb246IHZhbHVlcy5kYXRlICsgJyAwOTowMDowMCcsXG5cdFx0XHRcdFx0XHRcdFx0ZXZlbnRfdHlwZTogJ1ByaXZhdGUnXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdGQuaGlkZSgpO1xuXHRcdFx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnTWVldGluZyBjcmVhdGVkLicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0RGF0YShzZWxmLmN1cnJlbnRQcm9qZWN0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGQuc2hvdygpO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMTA6IE1FTUJFUlNcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJNZW1iZXJzVGFibGUoKSB7XG5cdFx0Y29uc3QgJHRib2R5ID0gJCgnI21lbWJlcnMtdGFibGUtYm9keScpO1xuXHRcdCR0Ym9keS5lbXB0eSgpO1xuXHRcdGNvbnN0IG1lbWJlcnMgPSAodGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhICYmIHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YS5tZW1iZXJzKSB8fCBbXTtcblxuXHRcdG1lbWJlcnMuZm9yRWFjaChtID0+IHtcblx0XHRcdCR0Ym9keS5hcHBlbmQoYFxuXHRcdFx0XHQ8dHI+XG5cdFx0XHRcdFx0PHRkPjxzdHJvbmc+JHttLmZ1bGxfbmFtZSB8fCBtLnVzZXJ9PC9zdHJvbmc+PC90ZD5cblx0XHRcdFx0XHQ8dGQ+JHttLnVzZXJ9PC90ZD5cblx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJiYWRnZVwiPiR7bS5yb2xlfTwvc3Bhbj48L3RkPlxuXHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLXN1Y2Nlc3NcIj5BY3RpdmU8L3NwYW4+PC90ZD5cblx0XHRcdFx0PC90cj5cblx0XHRcdGApO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMTE6IFNFVFRJTkdTXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyU2V0dGluZ3NUYWIoKSB7XG5cdFx0aWYgKCF0aGlzLnByb2plY3RPdmVydmlld0RhdGEpIHJldHVybjtcblx0XHRjb25zdCBzdW1tYXJ5ID0gdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhLnN1bW1hcnkgfHwge307XG5cdFx0JCgnI3NldHRpbmctcHJvamVjdC1uYW1lJykudmFsKHN1bW1hcnkucHJvamVjdF9uYW1lIHx8ICcnKTtcblx0XHQkKCcjc2V0dGluZy1zdGF0dXMtbmFycmF0aXZlJykudmFsKHN1bW1hcnkuc3RhdHVzX25hcnJhdGl2ZSB8fCAnJyk7XG5cdFx0JCgnI3NldHRpbmctaXMtdGVtcGxhdGUnKS5wcm9wKCdjaGVja2VkJywgISFzdW1tYXJ5LmlzX3RlbXBsYXRlKTtcblx0XHQkKCcjc2V0dGluZy1pcy1mYXZvcml0ZScpLnByb3AoJ2NoZWNrZWQnLCAhIXN1bW1hcnkuaXNfZmF2b3JpdGUpO1xuXHR9XG5cblx0c2F2ZVByb2plY3RTZXR0aW5ncygpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBzZXR0aW5ncyA9IHtcblx0XHRcdHByb2plY3RfbmFtZTogJCgnI3NldHRpbmctcHJvamVjdC1uYW1lJykudmFsKCksXG5cdFx0XHRzdGF0dXNfbmFycmF0aXZlOiAkKCcjc2V0dGluZy1zdGF0dXMtbmFycmF0aXZlJykudmFsKCksXG5cdFx0XHRpc190ZW1wbGF0ZTogJCgnI3NldHRpbmctaXMtdGVtcGxhdGUnKS5pcygnOmNoZWNrZWQnKSA/IDEgOiAwLFxuXHRcdFx0aXNfZmF2b3JpdGU6ICQoJyNzZXR0aW5nLWlzLWZhdm9yaXRlJykuaXMoJzpjaGVja2VkJykgPyAxIDogMFxuXHRcdH07XG5cblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby51cGRhdGVfcHJvamVjdF9zZXR0aW5ncycsXG5cdFx0XHRhcmdzOiB7XG5cdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXG5cdFx0XHRcdHNldHRpbmdzX2pzb246IEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKVxuXHRcdFx0fVxuXHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCBzZXR0aW5ncyBzYXZlZCBzdWNjZXNzZnVsbHkuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xuXHRcdH0pO1xuXHR9XG5cblx0dG9nZ2xlQXJjaGl2ZVByb2plY3QoKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgcHJvaiA9IHRoaXMuYWxsUHJvamVjdHMuZmluZChwID0+IHAubmFtZSA9PT0gdGhpcy5jdXJyZW50UHJvamVjdCk7XG5cdFx0Y29uc3QgY3VycmVudEFjdGl2ZSA9IHByb2ogPyBwcm9qLmlzX2FjdGl2ZSA6ICdZZXMnO1xuXHRcdGNvbnN0IG5leHRBY3RpdmUgPSBjdXJyZW50QWN0aXZlID09PSAnWWVzJyA/ICdObycgOiAnWWVzJztcblx0XHRjb25zdCBhY3Rpb25Xb3JkID0gbmV4dEFjdGl2ZSA9PT0gJ05vJyA/IF9fKCdBcmNoaXZlJykgOiBfXygnUmVzdG9yZScpO1xuXG5cdFx0ZnJhcHBlLmNvbmZpcm0oX18oJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byB7MH0gdGhpcyBwcm9qZWN0PycsIFthY3Rpb25Xb3JkLnRvTG93ZXJDYXNlKCldKSwgKCkgPT4ge1xuXHRcdFx0c2VsZi51cGRhdGVQcm9qZWN0U2V0dGluZ3NGaWVsZChzZWxmLmN1cnJlbnRQcm9qZWN0LCB7IGlzX2FjdGl2ZTogbmV4dEFjdGl2ZSB9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCB7MH1kIHN1Y2Nlc3NmdWxseS4nLCBbYWN0aW9uV29yZC50b0xvd2VyQ2FzZSgpXSksIGluZGljYXRvcjogJ29yYW5nZScgfSk7XG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdhbGwtcHJvamVjdHMnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdGNvbmZpcm1EZWxldGVQcm9qZWN0KCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5jb25maXJtKF9fKCdcdTI2QTBcdUZFMEYgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIFBFUk1BTkVOVExZIERFTEVURSB7MH0/IFRoaXMgY2Fubm90IGJlIHVuZG9uZS4nLCBbc2VsZi5jdXJyZW50UHJvamVjdF0pLCAoKSA9PiB7XG5cdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuZGVsZXRlJyxcblx0XHRcdFx0YXJnczoge1xuXHRcdFx0XHRcdGRvY3R5cGU6ICdQcm9qZWN0Jyxcblx0XHRcdFx0XHRuYW1lOiBzZWxmLmN1cnJlbnRQcm9qZWN0XG5cdFx0XHRcdH1cblx0XHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdQcm9qZWN0IGRlbGV0ZWQuJyksIGluZGljYXRvcjogJ3JlZCcgfSk7XG5cdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdhbGwtcHJvamVjdHMnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gUVVJQ0sgQ1JFQVRFIE1PREFMIChTY3JlZW5zaG90IDUpXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0b3BlblF1aWNrQ3JlYXRlTW9kYWwodHlwZSkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGlmICh0eXBlID09PSAncHJvamVjdCcgfHwgdHlwZSA9PT0gJ3N1YnByb2plY3QnKSB7XG5cdFx0XHRjb25zdCBpc1N1YiA9IHR5cGUgPT09ICdzdWJwcm9qZWN0Jztcblx0XHRcdGNvbnN0IGQgPSBuZXcgZnJhcHBlLnVpLkRpYWxvZyh7XG5cdFx0XHRcdHRpdGxlOiBpc1N1YiA/IF9fKCdBZGQgU3VicHJvamVjdCcpIDogX18oJ0FkZCBOZXcgUHJvamVjdCcpLFxuXHRcdFx0XHRmaWVsZHM6IFtcblx0XHRcdFx0XHR7IGZpZWxkbmFtZTogJ3Byb2plY3RfbmFtZScsIGxhYmVsOiBfXygnUHJvamVjdCBOYW1lJyksIGZpZWxkdHlwZTogJ0RhdGEnLCByZXFkOiAxIH0sXG5cdFx0XHRcdFx0eyBmaWVsZG5hbWU6ICdmcm9tX3RlbXBsYXRlJywgbGFiZWw6IF9fKCdDbG9uZSBmcm9tIFRlbXBsYXRlJyksIGZpZWxkdHlwZTogJ0xpbmsnLCBvcHRpb25zOiAnUHJvamVjdCcgfVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRwcmltYXJ5X2FjdGlvbl9sYWJlbDogX18oJ0NyZWF0ZSBQcm9qZWN0JyksXG5cdFx0XHRcdHByaW1hcnlfYWN0aW9uKHZhbHVlcykge1xuXHRcdFx0XHRcdGlmICh2YWx1ZXMuZnJvbV90ZW1wbGF0ZSkge1xuXHRcdFx0XHRcdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0XHRcdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5jbG9uZV9wcm9qZWN0X2Zyb21fdGVtcGxhdGUnLFxuXHRcdFx0XHRcdFx0XHRhcmdzOiB7XG5cdFx0XHRcdFx0XHRcdFx0dGVtcGxhdGVfcHJvamVjdDogdmFsdWVzLmZyb21fdGVtcGxhdGUsXG5cdFx0XHRcdFx0XHRcdFx0bmV3X3Byb2plY3RfbmFtZTogdmFsdWVzLnByb2plY3RfbmFtZVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0XHRcdFx0XHRkLmhpZGUoKTtcblx0XHRcdFx0XHRcdFx0aWYgKGlzU3ViKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2VsZi51cGRhdGVQcm9qZWN0U2V0dGluZ3NGaWVsZChyLm1lc3NhZ2UubmV3X3Byb2plY3QsIHsgcGFyZW50X3Byb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QgfSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGYuc2VsZWN0UHJvamVjdChyLm1lc3NhZ2UubmV3X3Byb2plY3QpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0XHRcdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50Lmluc2VydCcsXG5cdFx0XHRcdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRcdFx0XHRkb2M6IHtcblx0XHRcdFx0XHRcdFx0XHRcdGRvY3R5cGU6ICdQcm9qZWN0Jyxcblx0XHRcdFx0XHRcdFx0XHRcdHByb2plY3RfbmFtZTogdmFsdWVzLnByb2plY3RfbmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdHN0YXR1czogJ09wZW4nLFxuXHRcdFx0XHRcdFx0XHRcdFx0aXNfYWN0aXZlOiAnWWVzJyxcblx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudF9wcm9qZWN0OiBpc1N1YiA/IHNlbGYuY3VycmVudFByb2plY3QgOiBudWxsXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0XHRcdFx0XHRkLmhpZGUoKTtcblx0XHRcdFx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdHNMaXN0KCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFpc1N1Yikgc2VsZi5zZWxlY3RQcm9qZWN0KHIubWVzc2FnZS5uYW1lKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0ZC5zaG93KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGUgPT09ICd1c2VyJykge1xuXHRcdFx0Y29uc3QgZCA9IG5ldyBmcmFwcGUudWkuRGlhbG9nKHtcblx0XHRcdFx0dGl0bGU6IF9fKCdJbnZpdGUgUHJvamVjdCBNZW1iZXInKSxcblx0XHRcdFx0ZmllbGRzOiBbXG5cdFx0XHRcdFx0eyBmaWVsZG5hbWU6ICdlbWFpbCcsIGxhYmVsOiBfXygnVXNlciBFbWFpbCcpLCBmaWVsZHR5cGU6ICdEYXRhJywgcmVxZDogMSB9LFxuXHRcdFx0XHRcdHsgZmllbGRuYW1lOiAncm9sZScsIGxhYmVsOiBfXygnUHJvamVjdCBSb2xlJyksIGZpZWxkdHlwZTogJ1NlbGVjdCcsIG9wdGlvbnM6ICdQcm9qZWN0IE1hbmFnZXJcXG5BcmNoaXRlY3RcXG5TdHJ1Y3R1cmFsIEVuZ2luZWVyXFxuTUVQIENvb3JkaW5hdG9yXFxuU2FmZXR5IE9mZmljZXJcXG5RQyBJbnNwZWN0b3InLCBkZWZhdWx0OiAnUHJvamVjdCBNYW5hZ2VyJyB9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdHByaW1hcnlfYWN0aW9uX2xhYmVsOiBfXygnQWRkIE1lbWJlcicpLFxuXHRcdFx0XHRwcmltYXJ5X2FjdGlvbih2YWx1ZXMpIHtcblx0XHRcdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50Lmluc2VydCcsXG5cdFx0XHRcdFx0XHRhcmdzOiB7XG5cdFx0XHRcdFx0XHRcdGRvYzoge1xuXHRcdFx0XHRcdFx0XHRcdGRvY3R5cGU6ICdQcm9qZWN0IFVzZXInLFxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudDogc2VsZi5jdXJyZW50UHJvamVjdCxcblx0XHRcdFx0XHRcdFx0XHRwYXJlbnRmaWVsZDogJ3VzZXJzJyxcblx0XHRcdFx0XHRcdFx0XHRwYXJlbnR0eXBlOiAnUHJvamVjdCcsXG5cdFx0XHRcdFx0XHRcdFx0dXNlcjogdmFsdWVzLmVtYWlsXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdGQuaGlkZSgpO1xuXHRcdFx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnVXNlciBpbnZpdGVkIHRvIHByb2plY3QuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3REYXRhKHNlbGYuY3VycmVudFByb2plY3QpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGQuc2hvdygpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFdvcmsgcGFja2FnZSBxdWljay1jcmVhdGVcblx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xuXHRcdFx0dGl0bGU6IF9fKCdDcmVhdGUgezB9JywgW3R5cGVdKSxcblx0XHRcdGZpZWxkczogW1xuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3N1YmplY3QnLCBsYWJlbDogX18oJ1N1YmplY3QgLyBUaXRsZScpLCBmaWVsZHR5cGU6ICdEYXRhJywgcmVxZDogMSB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3ByaW9yaXR5JywgbGFiZWw6IF9fKCdQcmlvcml0eScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnTG93XFxuTm9ybWFsXFxuSGlnaFxcblVyZ2VudCcsIGRlZmF1bHQ6ICdOb3JtYWwnIH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnZHVlX2RhdGUnLCBsYWJlbDogX18oJ0R1ZSBEYXRlJyksIGZpZWxkdHlwZTogJ0RhdGUnIH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnZGVzY3JpcHRpb24nLCBsYWJlbDogX18oJ0Rlc2NyaXB0aW9uJyksIGZpZWxkdHlwZTogJ1NtYWxsIFRleHQnIH1cblx0XHRcdF0sXG5cdFx0XHRwcmltYXJ5X2FjdGlvbl9sYWJlbDogX18oJ0NyZWF0ZScpLFxuXHRcdFx0cHJpbWFyeV9hY3Rpb24odmFsdWVzKSB7XG5cdFx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5xdWlja19jcmVhdGVfd29ya19wYWNrYWdlJyxcblx0XHRcdFx0XHRhcmdzOiB7XG5cdFx0XHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0XHRcdFx0d3BfdHlwZTogdHlwZSxcblx0XHRcdFx0XHRcdHN1YmplY3Q6IHZhbHVlcy5zdWJqZWN0LFxuXHRcdFx0XHRcdFx0cHJpb3JpdHk6IHZhbHVlcy5wcmlvcml0eSxcblx0XHRcdFx0XHRcdGR1ZV9kYXRlOiB2YWx1ZXMuZHVlX2RhdGUsXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogdmFsdWVzLmRlc2NyaXB0aW9uXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRkLmhpZGUoKTtcblx0XHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdXb3JrIHBhY2thZ2UgY3JlYXRlZC4nKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xuXHRcdFx0XHRcdGlmIChzZWxmLmN1cnJlbnRUYWIgPT09ICd3b3JrLXBhY2thZ2VzJykgc2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnYm9hcmRzJykgc2VsZi5yZW5kZXJLYW5iYW5Cb2FyZCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRkLnNob3coKTtcblx0fVxuXG5cdHVwZGF0ZVByb2plY3RIZWFsdGhTdGF0dXMobmV3SGVhbHRoKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy51cGRhdGVQcm9qZWN0U2V0dGluZ3NGaWVsZCh0aGlzLmN1cnJlbnRQcm9qZWN0LCB7IGhlYWx0aF9zdGF0dXM6IG5ld0hlYWx0aCB9KS50aGVuKCgpID0+IHtcblx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1Byb2plY3QgaGVhbHRoIHNldCB0byB7MH0nLCBbbmV3SGVhbHRoXSksIGluZGljYXRvcjogJ2JsdWUnIH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0dXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQocHJvamVjdE5hbWUsIHBhdGNoRGljdCkge1xuXHRcdHJldHVybiBmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby51cGRhdGVfcHJvamVjdF9zZXR0aW5ncycsXG5cdFx0XHRhcmdzOiB7XG5cdFx0XHRcdHByb2plY3Q6IHByb2plY3ROYW1lLFxuXHRcdFx0XHRzZXR0aW5nc19qc29uOiBKU09OLnN0cmluZ2lmeShwYXRjaERpY3QpXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRlZGl0U3RhdHVzTmFycmF0aXZlUHJvbXB0KCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGZyYXBwZS5wcm9tcHQoXG5cdFx0XHR7XG5cdFx0XHRcdGZpZWxkbmFtZTogJ25hcnJhdGl2ZScsXG5cdFx0XHRcdGxhYmVsOiBfXygnU3RhdHVzIERlc2NyaXB0aW9uIC8gQ29tbWVudGFyeScpLFxuXHRcdFx0XHRmaWVsZHR5cGU6ICdTbWFsbCBUZXh0Jyxcblx0XHRcdFx0ZGVmYXVsdDogJCgnI292ZXJ2aWV3LXN0YXR1cy1uYXJyYXRpdmUnKS50ZXh0KClcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiAodmFsdWVzKSB7XG5cdFx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQoc2VsZi5jdXJyZW50UHJvamVjdCwgeyBzdGF0dXNfbmFycmF0aXZlOiB2YWx1ZXMubmFycmF0aXZlIH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdCQoJyNvdmVydmlldy1zdGF0dXMtbmFycmF0aXZlJykudGV4dCh2YWx1ZXMubmFycmF0aXZlKTtcblx0XHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdTdGF0dXMgbm90ZSB1cGRhdGVkLicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSxcblx0XHRcdF9fKCdFZGl0IEhlYWx0aCBTdGF0dXMgRGVzY3JpcHRpb24nKSxcblx0XHRcdF9fKCdTYXZlJylcblx0XHQpO1xuXHR9XG59XG5cbndpbmRvdy5Qcm9qZWN0U3R1ZGlvQXBwID0gUHJvamVjdFN0dWRpb0FwcDtcbmV4cG9ydCBkZWZhdWx0IFByb2plY3RTdHVkaW9BcHA7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUdBLElBQU0sbUJBQU4sTUFBdUI7QUFBQSxFQUN0QixjQUFjO0FBQ2IsU0FBSyxpQkFBaUI7QUFDdEIsU0FBSyxjQUFjLENBQUM7QUFDcEIsU0FBSyxhQUFhO0FBQ2xCLFNBQUssa0JBQWtCO0FBQ3ZCLFNBQUssbUJBQW1CO0FBQ3hCLFNBQUssZUFBZTtBQUNwQixTQUFLLHFCQUFxQjtBQUUxQixTQUFLLEtBQUs7QUFBQSxFQUNYO0FBQUEsRUFFQSxPQUFPO0FBQ04sU0FBSyxXQUFXO0FBQ2hCLFNBQUssaUJBQWlCLEVBQUUsS0FBSyxNQUFNO0FBRWxDLFlBQU0sWUFBWSxJQUFJLGdCQUFnQixPQUFPLFNBQVMsTUFBTTtBQUM1RCxZQUFNLFlBQVksVUFBVSxJQUFJLFNBQVM7QUFDekMsWUFBTSxXQUFXLFVBQVUsSUFBSSxLQUFLO0FBRXBDLFVBQUksYUFBYSxjQUFjLE9BQU87QUFDckMsYUFBSyxjQUFjLFdBQVcsWUFBWSxNQUFNO0FBQUEsTUFDakQsV0FBVyxLQUFLLFlBQVksU0FBUyxHQUFHO0FBQ3ZDLGFBQUssY0FBYyxLQUFLLFlBQVksQ0FBQyxFQUFFLE1BQU0sWUFBWSxNQUFNO0FBQUEsTUFDaEUsT0FBTztB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
