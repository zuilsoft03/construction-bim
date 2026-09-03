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
    } else if (tabKey === "bcf") {
      this.renderBcfViewer();
    } else if (tabKey === "documents") {
      this.renderDocumentsTree();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vZnJvbnRlbmRfc3JjL3Byb2plY3Rfc3R1ZGlvX2FwcC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiXHVGRUZGLy8gUHJvamVjdCBTdHVkaW8gRnJvbnRlbmQgQXBwbGljYXRpb24gKE9wZW5Qcm9qZWN0IEJJTSBQYXJpdHkpXG4vLyBNYW5hZ2VzIEFsbCBQcm9qZWN0cyBIdWIsIFByb2plY3QgSG9tZSwgV29yayBQYWNrYWdlcywgQm9hcmRzLCBCQ0YsIERvY3VtZW50cywgU2V0dGluZ3NcblxuY2xhc3MgUHJvamVjdFN0dWRpb0FwcCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuY3VycmVudFByb2plY3QgPSBudWxsO1xuXHRcdHRoaXMuYWxsUHJvamVjdHMgPSBbXTtcblx0XHR0aGlzLmN1cnJlbnRUYWIgPSAnaG9tZSc7XG5cdFx0dGhpcy5hY3RpdmVGaWx0ZXJLZXkgPSAnYWxsX29wZW4nO1xuXHRcdHRoaXMuYWN0aXZlVHlwZUZpbHRlciA9ICdhbGwnO1xuXHRcdHRoaXMuYm9hcmRHcm91cEJ5ID0gJ3N0YXR1cyc7XG5cdFx0dGhpcy5pc1NpZGViYXJDb2xsYXBzZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLmJpbmRFdmVudHMoKTtcblx0XHR0aGlzLmxvYWRQcm9qZWN0c0xpc3QoKS50aGVuKCgpID0+IHtcblx0XHRcdC8vIENoZWNrIFVSTCBwYXJhbWV0ZXJzIGZvciBwcm9qZWN0XG5cdFx0XHRjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuXHRcdFx0Y29uc3QgcHJvalBhcmFtID0gdXJsUGFyYW1zLmdldCgncHJvamVjdCcpO1xuXHRcdFx0Y29uc3QgdGFiUGFyYW0gPSB1cmxQYXJhbXMuZ2V0KCd0YWInKTtcblxuXHRcdFx0aWYgKHByb2pQYXJhbSAmJiBwcm9qUGFyYW0gIT09ICdhbGwnKSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0UHJvamVjdChwcm9qUGFyYW0sIHRhYlBhcmFtIHx8ICdob21lJyk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuYWxsUHJvamVjdHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdFByb2plY3QodGhpcy5hbGxQcm9qZWN0c1swXS5uYW1lLCB0YWJQYXJhbSB8fCAnaG9tZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zd2l0Y2hUYWIoJ2FsbC1wcm9qZWN0cycpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0YmluZEV2ZW50cygpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdC8vIFNpZGViYXIgY29sbGFwc2UgdG9nZ2xlXG5cdFx0JCgnI2J0bi10b2dnbGUtc2lkZWJhcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkID0gIXNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkO1xuXHRcdFx0JCgnI3N0dWRpby1zaWRlYmFyJykudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcsIHNlbGYuaXNTaWRlYmFyQ29sbGFwc2VkKTtcblx0XHR9KTtcblxuXHRcdC8vIE5hdmlnYXRpb24gbGlua3Ncblx0XHQkKCcuc3R1ZGlvLW5hdi1saXN0Jykub24oJ2NsaWNrJywgJy5uYXYtaXRlbScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IHRhYiA9ICQodGhpcykuZGF0YSgndGFiJyk7XG5cdFx0XHRzZWxmLnN3aXRjaFRhYih0YWIpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gUmVmcmVzaCBidXR0b25cblx0XHQkKCcjYnRuLXN0dWRpby1yZWZyZXNoJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHNlbGYuY3VycmVudFByb2plY3QpIHtcblx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdERhdGEoc2VsZi5jdXJyZW50UHJvamVjdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIFF1aWNrIGNyZWF0ZSBkcm9wZG93biBhY3Rpb25zXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5hY3Rpb24tcXVpY2stYWRkJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0Y29uc3QgdHlwZSA9ICQodGhpcykuZGF0YSgndHlwZScpO1xuXHRcdFx0c2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCh0eXBlKTtcblx0XHR9KTtcblxuXHRcdC8vIEFkZCBwcm9qZWN0IGJ1dHRvblxuXHRcdCQoJyNidG4tYWRkLXByb2plY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLm9wZW5RdWlja0NyZWF0ZU1vZGFsKCdwcm9qZWN0Jyk7XG5cdFx0fSk7XG5cblx0XHQvLyBTdWJwcm9qZWN0IGFkZCBidXR0b25cblx0XHQkKCcjYnRuLWFkZC1zdWJwcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5vcGVuUXVpY2tDcmVhdGVNb2RhbCgnc3VicHJvamVjdCcpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gU2VhcmNoIGluIGFsbCBwcm9qZWN0cyB0YWJsZVxuXHRcdCQoJyNwcm9qZWN0cy1maWx0ZXItaW5wdXQnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBxID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0JCgnI3Byb2plY3RzLXRhYmxlLWJvZHkgdHInKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3QgdGV4dCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdCQodGhpcykudG9nZ2xlKHRleHQuaW5kZXhPZihxKSA+IC0xKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gR2xvYmFsIHNlYXJjaFxuXHRcdCQoJyNzdHVkaW8tZ2xvYmFsLXNlYXJjaCcpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcblx0XHRcdFx0Y29uc3QgcXVlcnkgPSAkKHRoaXMpLnZhbCgpO1xuXHRcdFx0XHRpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnd29yay1wYWNrYWdlcycpIHtcblx0XHRcdFx0XHRzZWxmLnJlbmRlcldvcmtQYWNrYWdlcyhxdWVyeSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc2VsZi5jdXJyZW50VGFiID09PSAnYWxsLXByb2plY3RzJykge1xuXHRcdFx0XHRcdCQoJyNwcm9qZWN0cy1maWx0ZXItaW5wdXQnKS52YWwocXVlcnkpLnRyaWdnZXIoJ2tleXVwJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VsZi5zd2l0Y2hUYWIoJ3dvcmstcGFja2FnZXMnKTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKHF1ZXJ5KSwgMTAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gSGVhbHRoIHN0YXR1cyBzZWxlY3QgY2hhbmdlXG5cdFx0JCgnI3NlbGVjdC1wcm9qZWN0LWhlYWx0aCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCB2YWwgPSAkKHRoaXMpLnZhbCgpO1xuXHRcdFx0c2VsZi51cGRhdGVQcm9qZWN0SGVhbHRoU3RhdHVzKHZhbCk7XG5cdFx0fSk7XG5cblx0XHQvLyBFZGl0IHN0YXR1cyBuYXJyYXRpdmUgYnV0dG9uXG5cdFx0JCgnI2J0bi1lZGl0LXN0YXR1cy1uYXJyYXRpdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLmVkaXRTdGF0dXNOYXJyYXRpdmVQcm9tcHQoKTtcblx0XHR9KTtcblxuXHRcdC8vIFdvcmsgcGFja2FnZXMgZmlsdGVyIGNsaWNrc1xuXHRcdCQoJy53cC1zaWRlYmFyLWZpbHRlcicpLm9uKCdjbGljaycsICdsaVtkYXRhLWZpbHRlcl0nLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHQkKCcud3Atc2lkZWJhci1maWx0ZXIgbGlbZGF0YS1maWx0ZXJdJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHRzZWxmLmFjdGl2ZUZpbHRlcktleSA9ICQodGhpcykuZGF0YSgnZmlsdGVyJyk7XG5cdFx0XHQkKCcjd3AtYWN0aXZlLWZpbHRlci10aXRsZScpLnRleHQoJCh0aGlzKS50ZXh0KCkpO1xuXHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHR9KTtcblxuXHRcdCQoJy53cC1zaWRlYmFyLWZpbHRlcicpLm9uKCdjbGljaycsICdsaVtkYXRhLXR5cGVdJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCgnLndwLXNpZGViYXItZmlsdGVyIGxpW2RhdGEtdHlwZV0nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHQkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcblx0XHRcdHNlbGYuYWN0aXZlVHlwZUZpbHRlciA9ICQodGhpcykuZGF0YSgndHlwZScpO1xuXHRcdFx0c2VsZi5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHR9KTtcblxuXHRcdC8vIFdvcmsgcGFja2FnZXMgdGV4dCBzZWFyY2ggZmlsdGVyXG5cdFx0JCgnI3dwLWZpbHRlci1zZWFyY2gnKS5vbigna2V5dXAnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRjb25zdCBxID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0JCgnI3dwLXRhYmxlLWJvZHkgdHInKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3QgdGV4dCA9ICQodGhpcykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdCQodGhpcykudG9nZ2xlKHRleHQuaW5kZXhPZihxKSA+IC0xKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQm9hcmQgZ3JvdXBpbmcgc2VsZWN0b3Jcblx0XHQkKCcjc2VsZWN0LWJvYXJkLWdyb3VwLWJ5Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHNlbGYuYm9hcmRHcm91cEJ5ID0gJCh0aGlzKS52YWwoKTtcblx0XHRcdHNlbGYucmVuZGVyS2FuYmFuQm9hcmQoKTtcblx0XHR9KTtcblxuXHRcdC8vIEJDRiBEcmF3ZXIgdG9nZ2xlXG5cdFx0JCgnI2J0bi1iY2YtdG9nZ2xlLWRyYXdlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCQoJyNiY2YtZmxvYXRpbmctZHJhd2VyJykudG9nZ2xlKCk7XG5cdFx0fSk7XG5cdFx0JCgnI2J0bi1jbG9zZS1iY2YtZHJhd2VyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0JCgnI2JjZi1mbG9hdGluZy1kcmF3ZXInKS5oaWRlKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBEb2N1bWVudCBmaWxlIGxpbmsgY2xpY2sgZGVsZWdhdGlvbiAoQXV0by1MYXVuY2hlcnMhKVxuXHRcdCQoJyNkb2N1bWVudC1mb2xkZXJzLWNvbnRhaW5lcicpLm9uKCdjbGljaycsICcuZmlsZS1pdGVtLWxpbmsnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0Y29uc3Qgcm91dGUgPSAkKHRoaXMpLmRhdGEoJ3JvdXRlJyk7XG5cdFx0XHRjb25zdCB1cmwgPSAkKHRoaXMpLmRhdGEoJ3VybCcpO1xuXHRcdFx0aWYgKHJvdXRlID09PSAnYmltJykge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdiY2YnKTtcblx0XHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnT3BlbmluZyBJRkMgbW9kZWwgaW4gM0QgVmlld2VyLi4uJyksIGluZGljYXRvcjogJ2JsdWUnIH0pO1xuXHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ2NhZCcpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYignY2FkJyk7XG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ09wZW5pbmcgZHJhd2luZyBpbiAyRCBDQUQgU3R1ZGlvLi4uJyksIGluZGljYXRvcjogJ2JsdWUnIH0pO1xuXHRcdFx0fSBlbHNlIGlmIChyb3V0ZSA9PT0gJ3BkZicpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRzZWxmLnN3aXRjaFRhYigncGRmJyk7XG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ09wZW5pbmcgcGxhbiBpbiBQREYgVGFrZW9mZi4uLicpLCBpbmRpY2F0b3I6ICdibHVlJyB9KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIERvY3VtZW50IGZpbGUgdXBsb2FkIGJ1dHRvblxuXHRcdCQoJyNidG4tdXBsb2FkLWRvY3VtZW50Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5vcGVuRmlsZVVwbG9hZERpYWxvZygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gUHJvamVjdCBzZXR0aW5ncyBzYXZlXG5cdFx0JCgnI2J0bi1zYXZlLXByb2plY3Qtc2V0dGluZ3MnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzZWxmLnNhdmVQcm9qZWN0U2V0dGluZ3MoKTtcblx0XHR9KTtcblxuXHRcdC8vIEFyY2hpdmUgdG9nZ2xlXG5cdFx0JCgnI2J0bi10b2dnbGUtYXJjaGl2ZS1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi50b2dnbGVBcmNoaXZlUHJvamVjdCgpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gRGVsZXRlIHByb2plY3Rcblx0XHQkKCcjYnRuLWRlbGV0ZS1wcm9qZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0c2VsZi5jb25maXJtRGVsZXRlUHJvamVjdCgpO1xuXHRcdH0pO1xuXHR9XG5cblx0bG9hZFByb2plY3RzTGlzdCgpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRyZXR1cm4gZnJhcHBlLmNhbGwoe1xuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8ubGlzdF9wcm9qZWN0cycsXG5cdFx0XHRhcmdzOiB7IGluY2x1ZGVfYXJjaGl2ZWQ6IDEgfVxuXHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRzZWxmLmFsbFByb2plY3RzID0gci5tZXNzYWdlIHx8IFtdO1xuXHRcdFx0c2VsZi5yZW5kZXJQcm9qZWN0U3dpdGNoZXIoKTtcblx0XHRcdHNlbGYucmVuZGVyQWxsUHJvamVjdHNUYWJsZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVuZGVyUHJvamVjdFN3aXRjaGVyKCkge1xuXHRcdGNvbnN0ICRsaXN0ID0gJCgnI3Byb2plY3Qtc3dpdGNoZXItbGlzdCcpO1xuXHRcdCRsaXN0LmVtcHR5KCk7XG5cdFx0JGxpc3QuYXBwZW5kKCc8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGRhdGEtcHJvamVjdD1cImFsbFwiPjxpIGNsYXNzPVwiZmEgZmEtdGgtbGlzdCB0ZXh0LW11dGVkXCI+PC9pPiA8c3Ryb25nPkFsbCBwcm9qZWN0cyAoSHViKTwvc3Ryb25nPjwvYT48L2xpPicpO1xuXHRcdCRsaXN0LmFwcGVuZCgnPGxpIHJvbGU9XCJzZXBhcmF0b3JcIiBjbGFzcz1cImRpdmlkZXJcIj48L2xpPicpO1xuXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy5hbGxQcm9qZWN0cy5mb3JFYWNoKHAgPT4ge1xuXHRcdFx0Y29uc3QgZmF2SWNvbiA9IHAuaXNfZmF2b3JpdGUgPyAnXHUyQjUwICcgOiAnJztcblx0XHRcdGNvbnN0IHRtcGxCYWRnZSA9IHAuaXNfdGVtcGxhdGUgPyAnIDxzcGFuIGNsYXNzPVwiYmFkZ2VcIj5UZW1wbGF0ZTwvc3Bhbj4nIDogJyc7XG5cdFx0XHRjb25zdCAkaXRlbSA9ICQoYDxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgZGF0YS1wcm9qZWN0PVwiJHtwLm5hbWV9XCI+JHtmYXZJY29ufSR7cC5wcm9qZWN0X25hbWV9JHt0bXBsQmFkZ2V9PC9hPjwvbGk+YCk7XG5cdFx0XHQkaXRlbS5maW5kKCdhJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBwcm9qID0gJCh0aGlzKS5kYXRhKCdwcm9qZWN0Jyk7XG5cdFx0XHRcdGlmIChwcm9qID09PSAnYWxsJykge1xuXHRcdFx0XHRcdHNlbGYuc3dpdGNoVGFiKCdhbGwtcHJvamVjdHMnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzZWxmLnNlbGVjdFByb2plY3QocHJvaik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0JGxpc3QuYXBwZW5kKCRpdGVtKTtcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFByb2plY3QocHJvamVjdE5hbWUsIHRhYiA9ICdob21lJykge1xuXHRcdHRoaXMuY3VycmVudFByb2plY3QgPSBwcm9qZWN0TmFtZTtcblx0XHRjb25zdCBwcm9qT2JqID0gdGhpcy5hbGxQcm9qZWN0cy5maW5kKHAgPT4gcC5uYW1lID09PSBwcm9qZWN0TmFtZSkgfHwgeyBwcm9qZWN0X25hbWU6IHByb2plY3ROYW1lIH07XG5cdFx0JCgnI2N1cnJlbnQtcHJvamVjdC10aXRsZScpLnRleHQocHJvak9iai5wcm9qZWN0X25hbWUpO1xuXHRcdCQoJyNzaWRlYmFyLWFjdGl2ZS1zdGF0dXMnKS50ZXh0KHByb2pPYmouc3RhdHVzIHx8ICdBY3RpdmUnKTtcblxuXHRcdC8vIEVuYWJsZSBwcm9qZWN0LXNwZWNpZmljIG5hdiB0YWJzXG5cdFx0JCgnLnN0dWRpby1uYXYtbGlzdCAubmF2LWl0ZW0nKS5zaG93KCk7XG5cdFx0dGhpcy5zd2l0Y2hUYWIodGFiKTtcblx0XHR0aGlzLmxvYWRQcm9qZWN0RGF0YShwcm9qZWN0TmFtZSk7XG5cdH1cblxuXHRzd2l0Y2hUYWIodGFiS2V5KSB7XG5cdFx0dGhpcy5jdXJyZW50VGFiID0gdGFiS2V5O1xuXHRcdCQoJy5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdCQoYC5zdHVkaW8tbmF2LWxpc3QgLm5hdi1pdGVtW2RhdGEtdGFiPVwiJHt0YWJLZXl9XCJdYCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG5cdFx0JCgnLnN0dWRpby10YWItdmlldycpLmhpZGUoKTtcblxuXHRcdGlmICh0YWJLZXkgPT09ICdhbGwtcHJvamVjdHMnKSB7XG5cdFx0XHQkKCcjY3VycmVudC1wcm9qZWN0LXRpdGxlJykudGV4dCgnQWxsIHByb2plY3RzJyk7XG5cdFx0XHQkKCcjdmlldy1hbGwtcHJvamVjdHMnKS5zaG93KCk7XG5cdFx0XHR0aGlzLnJlbmRlckFsbFByb2plY3RzVGFibGUoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkKGAjdmlldy0ke3RhYktleX1gKS5zaG93KCk7XG5cblx0XHQvLyBUcmlnZ2VyIHZpZXctc3BlY2lmaWMgbG9hZHNcblx0XHRpZiAodGFiS2V5ID09PSAnaG9tZScpIHtcblx0XHRcdHRoaXMucmVuZGVyUHJvamVjdE92ZXJ2aWV3KCk7XG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICd3b3JrLXBhY2thZ2VzJykge1xuXHRcdFx0dGhpcy5yZW5kZXJXb3JrUGFja2FnZXMoKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2JvYXJkcycpIHtcblx0XHRcdHRoaXMucmVuZGVyS2FuYmFuQm9hcmQoKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ2JjZicpIHtcblx0XHRcdHRoaXMucmVuZGVyQmNmVmlld2VyKCk7XG5cdFx0fSBlbHNlIGlmICh0YWJLZXkgPT09ICdkb2N1bWVudHMnKSB7XG5cdFx0XHR0aGlzLnJlbmRlckRvY3VtZW50c1RyZWUoKTtcblx0XHR9IGVsc2UgaWYgKHRhYktleSA9PT0gJ21lbWJlcnMnKSB7XG5cdFx0XHR0aGlzLnJlbmRlck1lbWJlcnNUYWJsZSgpO1xuXHRcdH0gZWxzZSBpZiAodGFiS2V5ID09PSAnc2V0dGluZ3MnKSB7XG5cdFx0XHR0aGlzLnJlbmRlclNldHRpbmdzVGFiKCk7XG5cdFx0fVxuXHR9XG5cblx0bG9hZFByb2plY3REYXRhKHByb2plY3ROYW1lKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8uZ2V0X3Byb2plY3Rfb3ZlcnZpZXcnLFxuXHRcdFx0YXJnczogeyBwcm9qZWN0OiBwcm9qZWN0TmFtZSB9XG5cdFx0fSkudGhlbihyID0+IHtcblx0XHRcdHNlbGYucHJvamVjdE92ZXJ2aWV3RGF0YSA9IHIubWVzc2FnZSB8fCB7fTtcblx0XHRcdGlmIChzZWxmLmN1cnJlbnRUYWIgPT09ICdob21lJykge1xuXHRcdFx0XHRzZWxmLnJlbmRlclByb2plY3RPdmVydmlldygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMDogQUxMIFBST0pFQ1RTIEhVQiAoU2NyZWVuc2hvdCAxKVxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHJlbmRlckFsbFByb2plY3RzVGFibGUoKSB7XG5cdFx0Y29uc3QgJHRib2R5ID0gJCgnI3Byb2plY3RzLXRhYmxlLWJvZHknKTtcblx0XHQkdGJvZHkuZW1wdHkoKTtcblxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMuYWxsUHJvamVjdHMuZm9yRWFjaChwID0+IHtcblx0XHRcdGNvbnN0IGZhdlN0YXIgPSBwLmlzX2Zhdm9yaXRlID8gJ1x1MkI1MCcgOiAnXHUyNjA2Jztcblx0XHRcdGNvbnN0IHN0YXR1c1BpbGwgPSBwLmhlYWx0aF9zdGF0dXMgPT09ICdPbiBUcmFjaycgXG5cdFx0XHRcdD8gJzxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtc3VjY2Vzc1wiIHN0eWxlPVwiYmFja2dyb3VuZDojMTBiOTgxO1wiPk9OIFRSQUNLPC9zcGFuPidcblx0XHRcdFx0OiAocC5oZWFsdGhfc3RhdHVzID09PSAnQXQgUmlzaycgXG5cdFx0XHRcdFx0PyAnPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC13YXJuaW5nXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiNmNTllMGI7XCI+QVQgUklTSzwvc3Bhbj4nXG5cdFx0XHRcdFx0OiAnPHNwYW4gY2xhc3M9XCJsYWJlbCBsYWJlbC1kYW5nZXJcIiBzdHlsZT1cImJhY2tncm91bmQ6I2VmNDQ0NDtcIj5PRkYgVFJBQ0s8L3NwYW4+Jyk7XG5cblx0XHRcdGNvbnN0IGluZGVudCA9IHAucGFyZW50X3Byb2plY3QgPyAnJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHUyMUIzICcgOiAnJztcblx0XHRcdGNvbnN0ICR0ciA9ICQoYFxuXHRcdFx0XHQ8dHI+XG5cdFx0XHRcdFx0PHRkIGNsYXNzPVwidGV4dC1jZW50ZXJcIj48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJ0b2dnbGUtZmF2XCIgZGF0YS1wcm9qZWN0PVwiJHtwLm5hbWV9XCI+JHtmYXZTdGFyfTwvYT48L3RkPlxuXHRcdFx0XHRcdDx0ZD4ke2luZGVudH08YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJwcm9qZWN0LWxpbmtcIiBkYXRhLXByb2plY3Q9XCIke3AubmFtZX1cIj48c3Ryb25nPiR7cC5wcm9qZWN0X25hbWV9PC9zdHJvbmc+PC9hPjwvdGQ+XG5cdFx0XHRcdFx0PHRkPiR7c3RhdHVzUGlsbH08L3RkPlxuXHRcdFx0XHRcdDx0ZD48aSBjbGFzcz1cImZhIGZhLWNoZWNrIHRleHQtbXV0ZWRcIj48L2k+PC90ZD5cblx0XHRcdFx0XHQ8dGQ+JHtwLmNyZWF0ZWRfb24gfHwgJy0tJ308L3RkPlxuXHRcdFx0XHRcdDx0ZD4ke3AubGF0ZXN0X2FjdGl2aXR5X2F0IHx8ICctLSd9PC90ZD5cblx0XHRcdFx0XHQ8dGQ+PHNtYWxsIGNsYXNzPVwidGV4dC1tdXRlZFwiPiR7cC5kaXNrX3VzYWdlX2Zvcm1hdHRlZCB8fCAnMCBCeXRlcyd9PC9zbWFsbD48L3RkPlxuXHRcdFx0XHQ8L3RyPlxuXHRcdFx0YCk7XG5cblx0XHRcdCR0ci5maW5kKCcucHJvamVjdC1saW5rJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzZWxmLnNlbGVjdFByb2plY3QoJCh0aGlzKS5kYXRhKCdwcm9qZWN0JykpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCR0ci5maW5kKCcudG9nZ2xlLWZhdicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3QgaXNGYXYgPSBwLmlzX2Zhdm9yaXRlID8gMCA6IDE7XG5cdFx0XHRcdHNlbGYudXBkYXRlUHJvamVjdFNldHRpbmdzRmllbGQocC5uYW1lLCB7IGlzX2Zhdm9yaXRlOiBpc0ZhdiB9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JHRib2R5LmFwcGVuZCgkdHIpO1xuXHRcdH0pO1xuXG5cdFx0JCgnI3Byb2plY3RzLXRhYmxlLXN1bW1hcnknKS50ZXh0KGBTaG93aW5nICR7dGhpcy5hbGxQcm9qZWN0cy5sZW5ndGh9IGFjdGl2ZSBwcm9qZWN0KHMpYCk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFRBQiAxOiBQUk9KRUNUIEhPTUUgREFTSEJPQVJEIChTY3JlZW5zaG90IDIpXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyUHJvamVjdE92ZXJ2aWV3KCkge1xuXHRcdGlmICghdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhKSByZXR1cm47XG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YTtcblx0XHRjb25zdCBzdW1tYXJ5ID0gZGF0YS5zdW1tYXJ5IHx8IHt9O1xuXG5cdFx0Ly8gRGVzY3JpcHRpb24gJiBEYXRlc1xuXHRcdCQoJyNvdmVydmlldy1kZXNjcmlwdGlvbicpLnRleHQoc3VtbWFyeS5kZXNjcmlwdGlvbiB8fCBfXygnTm8gZGVzY3JpcHRpb24gcHJvdmlkZWQuJykpO1xuXHRcdCQoJyNvdmVydmlldy1kYXRlcycpLnRleHQoYCR7c3VtbWFyeS5leHBlY3RlZF9zdGFydF9kYXRlIHx8ICctLSd9IHRvICR7c3VtbWFyeS5leHBlY3RlZF9lbmRfZGF0ZSB8fCAnLS0nfWApO1xuXHRcdCQoJyNvdmVydmlldy1wcm9ncmVzcycpLnRleHQoYCR7TWF0aC5yb3VuZChzdW1tYXJ5LnBlcmNlbnRfY29tcGxldGUgfHwgMCl9JWApO1xuXG5cdFx0Ly8gSGVhbHRoIHN0YXR1c1xuXHRcdCQoJyNzZWxlY3QtcHJvamVjdC1oZWFsdGgnKS52YWwoc3VtbWFyeS5oZWFsdGhfc3RhdHVzIHx8ICdPbiBUcmFjaycpO1xuXHRcdCQoJyNvdmVydmlldy1zdGF0dXMtbmFycmF0aXZlJykudGV4dChzdW1tYXJ5LnN0YXR1c19uYXJyYXRpdmUgfHwgX18oJ0FsbCB0YXNrcyBhbmQgc3ViLXByb2plY3RzIGFyZSBvbiBzY2hlZHVsZS4nKSk7XG5cblx0XHQvLyBNaWxlc3RvbmUgRGlhbW9uZCBUaW1lbGluZVxuXHRcdHRoaXMucmVuZGVyTWlsZXN0b25lVGltZWxpbmUoZGF0YS5taWxlc3RvbmVzIHx8IFtdKTtcblxuXHRcdC8vIFN1YnByb2plY3RzXG5cdFx0Y29uc3QgJHN1Ykxpc3QgPSAkKCcjc3VicHJvamVjdHMtbGlzdCcpO1xuXHRcdCRzdWJMaXN0LmVtcHR5KCk7XG5cdFx0KGRhdGEuc3VicHJvamVjdHMgfHwgW10pLmZvckVhY2gocyA9PiB7XG5cdFx0XHQkc3ViTGlzdC5hcHBlbmQoYFxuXHRcdFx0XHQ8bGkgY2xhc3M9XCJmbGV4LWJldHdlZW4gcC0xXCI+XG5cdFx0XHRcdFx0PHNwYW4+PGkgY2xhc3M9XCJmYSBmYS1mb2xkZXItbyB0ZXh0LXByaW1hcnlcIj48L2k+ICR7cy5wcm9qZWN0X25hbWV9PC9zcGFuPlxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwibGFiZWwgbGFiZWwtc3VjY2Vzc1wiIHN0eWxlPVwiYmFja2dyb3VuZDojMTBiOTgxO1wiPiR7cy5zdGF0dXN9PC9zcGFuPlxuXHRcdFx0XHQ8L2xpPlxuXHRcdFx0YCk7XG5cdFx0fSk7XG5cdFx0aWYgKChkYXRhLnN1YnByb2plY3RzIHx8IFtdKS5sZW5ndGggPT09IDApIHtcblx0XHRcdCRzdWJMaXN0LmFwcGVuZCgnPGxpIGNsYXNzPVwidGV4dC1tdXRlZCBwLTFcIj48c21hbGw+Tm8gc3VicHJvamVjdHMgY29uZmlndXJlZC48L3NtYWxsPjwvbGk+Jyk7XG5cdFx0fVxuXG5cdFx0Ly8gTWVldGluZ3Ncblx0XHRjb25zdCAkbWVldExpc3QgPSAkKCcjbWVldGluZ3MtbGlzdC1jb250YWluZXInKTtcblx0XHQkbWVldExpc3QuZW1wdHkoKTtcblx0XHQoZGF0YS5tZWV0aW5ncyB8fCBbXSkuZm9yRWFjaChtID0+IHtcblx0XHRcdCRtZWV0TGlzdC5hcHBlbmQoYFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWVldGluZy1pdGVtIHAtMiBtYi0xXCIgc3R5bGU9XCJib3JkZXItYm90dG9tOiAxcHggc29saWQgI2YxZjVmOTtcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleC1iZXR3ZWVuXCI+XG5cdFx0XHRcdFx0XHQ8c3Ryb25nPiR7bS50aXRsZX08L3N0cm9uZz5cblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYmFkZ2UgYmFkZ2UtaW5mb1wiPiR7bS50eXBlfTwvc3Bhbj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+PGkgY2xhc3M9XCJmYSBmYS1jYWxlbmRhclwiPjwvaT4gJHttLmRhdGV9IHwgJHttLmhvc3QgfHwgJ0Nvb3JkaW5hdG9yJ308L3NtYWxsPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdGApO1xuXHRcdH0pO1xuXHRcdGlmICgoZGF0YS5tZWV0aW5ncyB8fCBbXSkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQkbWVldExpc3QuYXBwZW5kKCc8ZGl2IGNsYXNzPVwidGV4dC1tdXRlZCBwLTIgdGV4dC1jZW50ZXJcIj48c21hbGw+Tm8gdXBjb21pbmcgbWVldGluZ3M8L3NtYWxsPjwvZGl2PicpO1xuXHRcdH1cblxuXHRcdC8vIE1lbWJlcnNcblx0XHRjb25zdCAkbWVtR3JpZCA9ICQoJyNtZW1iZXJzLWF2YXRhcnMtZ3JpZCcpO1xuXHRcdCRtZW1HcmlkLmVtcHR5KCk7XG5cdFx0KGRhdGEubWVtYmVycyB8fCBbXSkuZm9yRWFjaChtID0+IHtcblx0XHRcdCRtZW1HcmlkLmFwcGVuZChgXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJtZW1iZXItY2hpcCBwLTFcIiBzdHlsZT1cImRpc3BsYXk6IGlubGluZS1mbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDZweDsgbWFyZ2luOiA0cHg7XCI+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJhdmF0YXItY2lyY2xlXCIgc3R5bGU9XCJ3aWR0aDoyOHB4O2hlaWdodDoyOHB4O2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6IzAyODRjNztjb2xvcjojZmZmO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LXNpemU6MTFweDtmb250LXdlaWdodDpib2xkO1wiPlxuXHRcdFx0XHRcdFx0JHsobS5mdWxsX25hbWUgfHwgbS51c2VyKS5zdWJzdHJpbmcoMCwgMikudG9VcHBlckNhc2UoKX1cblx0XHRcdFx0XHQ8L3NwYW4+XG5cdFx0XHRcdFx0PHNtYWxsPiR7bS5mdWxsX25hbWUgfHwgbS51c2VyfTwvc21hbGw+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0YCk7XG5cdFx0fSk7XG5cblx0XHQvLyBOZXdzXG5cdFx0Y29uc3QgJG5ld3NDb250ID0gJCgnI25ld3MtZmVlZC1jb250YWluZXInKTtcblx0XHQkbmV3c0NvbnQuZW1wdHkoKTtcblx0XHQoZGF0YS5uZXdzIHx8IFtdKS5mb3JFYWNoKG4gPT4ge1xuXHRcdFx0JG5ld3NDb250LmFwcGVuZChgXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJuZXdzLWJ1bGxldGluIHAtMiBtYi0yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiAjZjhmYWZjOyBib3JkZXItbGVmdDogM3B4IHNvbGlkICMzYjgyZjY7IGJvcmRlci1yYWRpdXM6IDRweDtcIj5cblx0XHRcdFx0XHQ8aDUgY2xhc3M9XCJtLTAgZm9udC13ZWlnaHQtYm9sZFwiPiR7bi50aXRsZX08L2g1PlxuXHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke24uYXV0aG9yfSBvbiAke24uZGF0ZX08L3NtYWxsPlxuXHRcdFx0XHRcdDxwIGNsYXNzPVwibS0wIG10LTEgdGV4dC1zZWNvbmRhcnlcIiBzdHlsZT1cImZvbnQtc2l6ZTogMTJweDtcIj4ke24uY29udGVudH08L3A+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0YCk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZW5kZXJNaWxlc3RvbmVUaW1lbGluZShtaWxlc3RvbmVzKSB7XG5cdFx0Y29uc3QgJG1hcmtlcnMgPSAkKCcjdGltZWxpbmUtbWFya2Vycy1jb250YWluZXInKTtcblx0XHQkbWFya2Vycy5lbXB0eSgpO1xuXG5cdFx0aWYgKG1pbGVzdG9uZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQkbWFya2Vycy5hcHBlbmQoJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkIHAtMiB0ZXh0LWNlbnRlclwiIHN0eWxlPVwid2lkdGg6MTAwJTtcIj48c21hbGw+Tm8gZGVsaXZlcnkgbWlsZXN0b25lcyByZWNvcmRlZCB5ZXQuPC9zbWFsbD48L2Rpdj4nKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRtaWxlc3RvbmVzLmZvckVhY2gobSA9PiB7XG5cdFx0XHRjb25zdCBjb21wbGV0ZWRDbHMgPSBtLmNvbXBsZXRlZCA/ICdjb21wbGV0ZWQnIDogJyc7XG5cdFx0XHRjb25zdCAkcHQgPSAkKGBcblx0XHRcdFx0PGRpdiBjbGFzcz1cIm1pbGVzdG9uZS1tYXJrZXItcG9pbnRcIiBkYXRhLWlkPVwiJHttLmlkfVwiIHRpdGxlPVwiJHttLnRpdGxlfSAoJHttLmR1ZV9kYXRlIHx8ICdUQkQnfSlcIj5cblx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cIm1pbGVzdG9uZS1kYXRlXCI+JHsobS5kdWVfZGF0ZSB8fCAnJykuc3Vic3RyaW5nKDUpfTwvc3Bhbj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwibWlsZXN0b25lLWRpYW1vbmQgJHtjb21wbGV0ZWRDbHN9XCI+PC9kaXY+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJtaWxlc3RvbmUtbGFiZWxcIj4ke20udGl0bGV9PC9zcGFuPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdGApO1xuXHRcdFx0JHB0Lm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0ZnJhcHBlLm1zZ3ByaW50KHtcblx0XHRcdFx0XHR0aXRsZTogX18oJ01pbGVzdG9uZSBEZWxpdmVyeSBEZXRhaWxzJyksXG5cdFx0XHRcdFx0bWVzc2FnZTogYDxoND4ke20udGl0bGV9PC9oND48cD48c3Ryb25nPlRhcmdldCBEdWUgRGF0ZTo8L3N0cm9uZz4gJHttLmR1ZV9kYXRlIHx8ICdOb25lJ308L3A+PHA+PHN0cm9uZz5TdGF0dXM6PC9zdHJvbmc+ICR7bS5zdGF0dXN9PC9wPmAsXG5cdFx0XHRcdFx0aW5kaWNhdG9yOiBtLmNvbXBsZXRlZCA/ICdncmVlbicgOiAnb3JhbmdlJ1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdFx0JG1hcmtlcnMuYXBwZW5kKCRwdCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFRBQiAyOiBXT1JLIFBBQ0tBR0VTIEdSSUQgKFNjcmVlbnNob3QgMylcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJXb3JrUGFja2FnZXMoc2VhcmNoUXVlcnkgPSBudWxsKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8ubGlzdF93b3JrX3BhY2thZ2VzJyxcblx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0cHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCxcblx0XHRcdFx0ZmlsdGVyX2tleTogc2VsZi5hY3RpdmVGaWx0ZXJLZXksXG5cdFx0XHRcdHR5cGVfZmlsdGVyOiBzZWxmLmFjdGl2ZVR5cGVGaWx0ZXIsXG5cdFx0XHRcdHNlYXJjaDogc2VhcmNoUXVlcnlcblx0XHRcdH1cblx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0Y29uc3QgaXRlbXMgPSByLm1lc3NhZ2UgfHwgW107XG5cdFx0XHRjb25zdCAkdGJvZHkgPSAkKCcjd3AtdGFibGUtYm9keScpO1xuXHRcdFx0JHRib2R5LmVtcHR5KCk7XG5cblx0XHRcdGlmIChpdGVtcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0JHRib2R5LmFwcGVuZCgnPHRyPjx0ZCBjb2xzcGFuPVwiN1wiIGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1tdXRlZCBwLTRcIj5ObyB3b3JrIHBhY2thZ2VzIG1hdGNoIHRoaXMgZmlsdGVyLjwvdGQ+PC90cj4nKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpdGVtcy5mb3JFYWNoKGl0ID0+IHtcblx0XHRcdFx0Y29uc3QgcGlsbENscyA9IGB3cC1waWxsLSR7KGl0LnR5cGUgfHwgJ3Rhc2snKS50b0xvd2VyQ2FzZSgpfWA7XG5cdFx0XHRcdGNvbnN0IGluZGVudCA9IGl0LnBhcmVudF90YXNrID8gJyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1x1MjFCMyAnIDogJyc7XG5cdFx0XHRcdGNvbnN0ICR0ciA9ICQoYFxuXHRcdFx0XHRcdDx0ciBjbGFzcz1cIndwLXJvdy1pdGVtXCIgZGF0YS1pZD1cIiR7aXQuaWR9XCIgc3R5bGU9XCJjdXJzb3I6IHBvaW50ZXI7XCI+XG5cdFx0XHRcdFx0XHQ8dGQ+PHNtYWxsIGNsYXNzPVwidGV4dC1tdXRlZFwiPiMke2l0LmlkLnJlcGxhY2UoJ1RBU0stJywgJycpfTwvc21hbGw+PC90ZD5cblx0XHRcdFx0XHRcdDx0ZD4ke2luZGVudH08c3Ryb25nPiR7aXQuc3ViamVjdH08L3N0cm9uZz48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwid3AtcGlsbCAke3BpbGxDbHN9XCI+JHtpdC50eXBlfTwvc3Bhbj48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzcGFuIGNsYXNzPVwic3RhdHVzLWRvdFwiPjwvc3Bhbj4gJHtpdC5zdGF0dXN9PC90ZD5cblx0XHRcdFx0XHRcdDx0ZD48c21hbGw+JHtpdC5hc3NpZ25lZV9uYW1lIHx8ICdVbmFzc2lnbmVkJ308L3NtYWxsPjwvdGQ+XG5cdFx0XHRcdFx0XHQ8dGQ+PHNtYWxsPiR7aXQucHJpb3JpdHl9PC9zbWFsbD48L3RkPlxuXHRcdFx0XHRcdFx0PHRkPjxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj4ke2l0LmV4cF9lbmRfZGF0ZSB8fCAnLS0nfTwvc21hbGw+PC90ZD5cblx0XHRcdFx0XHQ8L3RyPlxuXHRcdFx0XHRgKTtcblxuXHRcdFx0XHQkdHIub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHNlbGYub3BlbldvcmtQYWNrYWdlSW5zcGVjdG9yKGl0KTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JHRib2R5LmFwcGVuZCgkdHIpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRvcGVuV29ya1BhY2thZ2VJbnNwZWN0b3Iod3ApIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xuXHRcdFx0dGl0bGU6IGBbJHt3cC50eXBlfV0gIyR7d3AuaWR9IC0gJHt3cC5zdWJqZWN0fWAsXG5cdFx0XHRmaWVsZHM6IFtcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdzdGF0dXMnLCBsYWJlbDogX18oJ1N0YXR1cycpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnT3BlblxcbldvcmtpbmdcXG5QZW5kaW5nIFJldmlld1xcbkNvbXBsZXRlZFxcbkNhbmNlbGxlZCcsIGRlZmF1bHQ6IHdwLnN0YXR1cyB9LFxuXHRcdFx0XHR7IGZpZWxkbmFtZTogJ3ByaW9yaXR5JywgbGFiZWw6IF9fKCdQcmlvcml0eScpLCBmaWVsZHR5cGU6ICdTZWxlY3QnLCBvcHRpb25zOiAnTG93XFxuTm9ybWFsXFxuSGlnaFxcblVyZ2VudCcsIGRlZmF1bHQ6IHdwLnByaW9yaXR5IH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnZXhwX2VuZF9kYXRlJywgbGFiZWw6IF9fKCdEdWUgRGF0ZScpLCBmaWVsZHR5cGU6ICdEYXRlJywgZGVmYXVsdDogd3AuZXhwX2VuZF9kYXRlIH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnbGlua2VkX2luZm8nLCBsYWJlbDogX18oJ0RvbWFpbiBMaW5rYWdlJyksIGZpZWxkdHlwZTogJ0hUTUwnIH1cblx0XHRcdF0sXG5cdFx0XHRwcmltYXJ5X2FjdGlvbl9sYWJlbDogX18oJ1VwZGF0ZSBXb3JrIFBhY2thZ2UnKSxcblx0XHRcdHByaW1hcnlfYWN0aW9uKHZhbHVlcykge1xuXHRcdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnZnJhcHBlLmNsaWVudC5zZXRfdmFsdWUnLFxuXHRcdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRcdGRvY3R5cGU6ICdUYXNrJyxcblx0XHRcdFx0XHRcdG5hbWU6IHdwLmlkLFxuXHRcdFx0XHRcdFx0ZmllbGRuYW1lOiB7XG5cdFx0XHRcdFx0XHRcdHN0YXR1czogdmFsdWVzLnN0YXR1cyxcblx0XHRcdFx0XHRcdFx0cHJpb3JpdHk6IHZhbHVlcy5wcmlvcml0eSxcblx0XHRcdFx0XHRcdFx0ZXhwX2VuZF9kYXRlOiB2YWx1ZXMuZXhwX2VuZF9kYXRlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRkLmhpZGUoKTtcblx0XHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdXb3JrIHBhY2thZ2UgdXBkYXRlZC4nKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xuXHRcdFx0XHRcdHNlbGYucmVuZGVyV29ya1BhY2thZ2VzKCk7XG5cdFx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ2JvYXJkcycpIHNlbGYucmVuZGVyS2FuYmFuQm9hcmQoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRsZXQgbGlua0h0bWwgPSAnPGRpdiBjbGFzcz1cInRleHQtbXV0ZWRcIj48c21hbGw+TmF0aXZlIFRhc2sgaW4gRVJQTmV4dC48L3NtYWxsPjwvZGl2Pic7XG5cdFx0aWYgKHdwLmJjZl90b3BpYykge1xuXHRcdFx0bGlua0h0bWwgPSBgPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LXdhcm5pbmdcIj48aSBjbGFzcz1cImZhIGZhLWN1YmVcIj48L2k+IExpbmtlZCB0byBCQ0YgQ2xhc2ggVG9waWM6IDxzdHJvbmc+JHt3cC5iY2ZfdG9waWN9PC9zdHJvbmc+PC9kaXY+YDtcblx0XHR9IGVsc2UgaWYgKHdwLnJmaV9saW5rKSB7XG5cdFx0XHRsaW5rSHRtbCA9IGA8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtaW5mb1wiPjxpIGNsYXNzPVwiZmEgZmEtcXVlc3Rpb24tY2lyY2xlXCI+PC9pPiBMaW5rZWQgdG8gVGVjaG5pY2FsIFJGSTogPHN0cm9uZz4ke3dwLnJmaV9saW5rfTwvc3Ryb25nPjwvZGl2PmA7XG5cdFx0fVxuXHRcdGQuZmllbGRzX2RpY3QubGlua2VkX2luZm8uJHdyYXBwZXIuaHRtbChsaW5rSHRtbCk7XG5cdFx0ZC5zaG93KCk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFRBQiAzOiBLQU5CQU4gQk9BUkRTIChIVE1MNSBEcmFnICYgRHJvcClcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJLYW5iYW5Cb2FyZCgpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5nZXRfa2FuYmFuX2JvYXJkX2RhdGEnLFxuXHRcdFx0YXJnczoge1xuXHRcdFx0XHRwcm9qZWN0OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0XHRncm91cF9ieTogc2VsZi5ib2FyZEdyb3VwQnlcblx0XHRcdH1cblx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0Y29uc3QgZGF0YSA9IHIubWVzc2FnZSB8fCB7fTtcblx0XHRcdGNvbnN0IGNvbHVtbnMgPSBkYXRhLmNvbHVtbnMgfHwgW107XG5cdFx0XHRjb25zdCAkd3JhcHBlciA9ICQoJyNrYW5iYW4tY29sdW1ucy13cmFwcGVyJyk7XG5cdFx0XHQkd3JhcHBlci5lbXB0eSgpO1xuXG5cdFx0XHRjb2x1bW5zLmZvckVhY2goY29sID0+IHtcblx0XHRcdFx0Y29uc3QgJGNvbCA9ICQoYFxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJrYW5iYW4tY29sdW1uXCIgZGF0YS1jb2wtaWQ9XCIke2NvbC5pZH1cIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb2x1bW4taGVhZGVyXCI+XG5cdFx0XHRcdFx0XHRcdDxzcGFuPiR7Y29sLnRpdGxlfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJiYWRnZSBjb2wtY2FyZC1jb3VudFwiPiR7Y29sLmNhcmRzLmxlbmd0aH08L3NwYW4+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJjb2x1bW4tY2FyZHMtbGlzdFwiIGRhdGEtY29sLWlkPVwiJHtjb2wuaWR9XCI+XG5cdFx0XHRcdFx0XHRcdDwhLS0gQ2FyZHMgLS0+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0YCk7XG5cblx0XHRcdFx0Y29uc3QgJGNhcmRzTGlzdCA9ICRjb2wuZmluZCgnLmNvbHVtbi1jYXJkcy1saXN0Jyk7XG5cblx0XHRcdFx0Ly8gTmF0aXZlIEhUTUw1IERyYWcgYW5kIERyb3AgaGFuZGxlcnMgb24gZHJvcHpvbmVcblx0XHRcdFx0JGNhcmRzTGlzdC5vbignZHJhZ292ZXInLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHQkKHRoaXMpLmNzcygnYmFja2dyb3VuZCcsICcjZTJlOGYwJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQkY2FyZHNMaXN0Lm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdiYWNrZ3JvdW5kJywgJycpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0JGNhcmRzTGlzdC5vbignZHJvcCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdCQodGhpcykuY3NzKCdiYWNrZ3JvdW5kJywgJycpO1xuXHRcdFx0XHRcdGNvbnN0IHRhc2tJZCA9IGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9wbGFpbicpO1xuXHRcdFx0XHRcdGNvbnN0IHRhcmdldENvbHVtbklkID0gY29sLmlkO1xuXG5cdFx0XHRcdFx0aWYgKHRhc2tJZCAmJiB0YXJnZXRDb2x1bW5JZCkge1xuXHRcdFx0XHRcdFx0Ly8gT3B0aW1pc3RpYyBET00gdXBkYXRlXG5cdFx0XHRcdFx0XHRjb25zdCAkZHJhZ2dlZENhcmQgPSAkKGBbZGF0YS10YXNrPVwiJHt0YXNrSWR9XCJdYCk7XG5cdFx0XHRcdFx0XHRpZiAoJGRyYWdnZWRDYXJkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0JGNhcmRzTGlzdC5hcHBlbmQoJGRyYWdnZWRDYXJkKTtcblx0XHRcdFx0XHRcdFx0c2VsZi51cGRhdGVCb2FyZENvbHVtbkNvdW50cygpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBQZXJzaXN0IHRvIGJhY2tlbmRcblx0XHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0XHRcdFx0bWV0aG9kOiAnY29uc3RydWN0aW9uX2JpbS5hcGkucHJvamVjdF9zdHVkaW8udXBkYXRlX3dvcmtfcGFja2FnZV9zdGF0dXMnLFxuXHRcdFx0XHRcdFx0XHRhcmdzOiB7XG5cdFx0XHRcdFx0XHRcdFx0dGFza19uYW1lOiB0YXNrSWQsXG5cdFx0XHRcdFx0XHRcdFx0bmV3X2NvbHVtbjogdGFyZ2V0Q29sdW1uSWQsXG5cdFx0XHRcdFx0XHRcdFx0Z3JvdXBfYnk6IHNlbGYuYm9hcmRHcm91cEJ5XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdXb3JrIHBhY2thZ2Ugc3RhdHVzIHVwZGF0ZWQgdG8gezB9JywgW3RhcmdldENvbHVtbklkXSksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gUG9wdWxhdGUgY2FyZHNcblx0XHRcdFx0Y29sLmNhcmRzLmZvckVhY2goY2FyZCA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgcGlsbENscyA9IGB3cC1waWxsLSR7KGNhcmQudHlwZSB8fCAndGFzaycpLnRvTG93ZXJDYXNlKCl9YDtcblx0XHRcdFx0XHRjb25zdCAkY2FyZCA9ICQoYFxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImthbmJhbi1jYXJkXCIgZHJhZ2dhYmxlPVwidHJ1ZVwiIGRhdGEtdGFzaz1cIiR7Y2FyZC5pZH1cIj5cblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZsZXgtYmV0d2VlbiBtYi0xXCI+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJ3cC1waWxsICR7cGlsbENsc31cIj4ke2NhcmQudHlwZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0PHNtYWxsIGNsYXNzPVwidGV4dC1tdXRlZFwiPiR7Y2FyZC5wcmlvcml0eX08L3NtYWxsPlxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdFx0PGRpdiBzdHlsZT1cImZvbnQtd2VpZ2h0OiA2MDA7IGZvbnQtc2l6ZTogMTNweDsgY29sb3I6ICMxZTI5M2I7XCI+JHtjYXJkLnN1YmplY3R9PC9kaXY+XG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmbGV4LWJldHdlZW4gbXQtMlwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzbWFsbCBjbGFzcz1cInRleHQtbXV0ZWRcIj48aSBjbGFzcz1cImZhIGZhLWNhbGVuZGFyXCI+PC9pPiAke2NhcmQuZXhwX2VuZF9kYXRlIHx8ICctLSd9PC9zbWFsbD5cblx0XHRcdFx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LXNlY29uZGFyeVwiPiR7Y2FyZC5hc3NpZ25lZV9uYW1lIHx8ICcnfTwvc21hbGw+XG5cdFx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0YCk7XG5cblx0XHRcdFx0XHQkY2FyZC5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRcdGUub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9wbGFpbicsIGNhcmQuaWQpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0JGNhcmQub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0c2VsZi5vcGVuV29ya1BhY2thZ2VJbnNwZWN0b3IoY2FyZCk7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQkY2FyZHNMaXN0LmFwcGVuZCgkY2FyZCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCR3cmFwcGVyLmFwcGVuZCgkY29sKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0dXBkYXRlQm9hcmRDb2x1bW5Db3VudHMoKSB7XG5cdFx0JCgnLmthbmJhbi1jb2x1bW4nKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IGNvdW50ID0gJCh0aGlzKS5maW5kKCcua2FuYmFuLWNhcmQnKS5sZW5ndGg7XG5cdFx0XHQkKHRoaXMpLmZpbmQoJy5jb2wtY2FyZC1jb3VudCcpLnRleHQoY291bnQpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgNTogQkNGIDItUEFORSBDT09SRElOQVRJT04gVklFV0VSIChTY3JlZW5zaG90IDQpXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyQmNmVmlld2VyKCkge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdC8vIEZldGNoIEJJTSBtb2RlbHMgZm9yIHByb2plY3Rcblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50LmdldF9saXN0Jyxcblx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0ZG9jdHlwZTogJ0JJTSBNb2RlbCcsXG5cdFx0XHRcdGZpbHRlcnM6IHsgcHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCB9LFxuXHRcdFx0XHRmaWVsZHM6IFsnbmFtZScsICdtb2RlbF9uYW1lJywgJ2lmY19maWxlJ11cblx0XHRcdH1cblx0XHR9KS50aGVuKHIgPT4ge1xuXHRcdFx0Y29uc3QgbW9kZWxzID0gci5tZXNzYWdlIHx8IFtdO1xuXHRcdFx0Y29uc3QgJHRyZWUgPSAkKCcjYmNmLW1vZGVscy10cmVlJyk7XG5cdFx0XHQkdHJlZS5lbXB0eSgpO1xuXG5cdFx0XHRpZiAobW9kZWxzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQkdHJlZS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkIHAtMlwiPjxzbWFsbD5ObyBJRkMgbW9kZWxzIHVwbG9hZGVkLjwvc21hbGw+PC9kaXY+Jyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtb2RlbHMuZm9yRWFjaChtID0+IHtcblx0XHRcdFx0XHQkdHJlZS5hcHBlbmQoYFxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cIm1vZGVsLXRyZWUtcm93IHAtMVwiPlxuXHRcdFx0XHRcdFx0XHQ8bGFiZWwgc3R5bGU9XCJmb250LXdlaWdodDogbm9ybWFsOyBmb250LXNpemU6IDEycHg7IGN1cnNvcjogcG9pbnRlcjtcIj5cblx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZCBkYXRhLW1vZGVsPVwiJHttLm5hbWV9XCI+ICR7bS5tb2RlbF9uYW1lIHx8IG0ubmFtZX1cblx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdGApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIEZldGNoIEJDRiBUb3BpY3Ncblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdmcmFwcGUuY2xpZW50LmdldF9saXN0Jyxcblx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0ZG9jdHlwZTogJ0JDRiBUb3BpYycsXG5cdFx0XHRcdGZpbHRlcnM6IHsgcHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCB9LFxuXHRcdFx0XHRmaWVsZHM6IFsnbmFtZScsICd0aXRsZScsICd0b3BpY190eXBlJywgJ3ByaW9yaXR5JywgJ3N0YXR1cycsICdjcmVhdGlvbiddXG5cdFx0XHR9XG5cdFx0fSkudGhlbihyID0+IHtcblx0XHRcdGNvbnN0IHRvcGljcyA9IHIubWVzc2FnZSB8fCBbXTtcblx0XHRcdCQoJyNiY2YtdG9waWMtY291bnQnKS50ZXh0KHRvcGljcy5sZW5ndGgpO1xuXHRcdFx0Y29uc3QgJHN0cmVhbSA9ICQoJyNiY2YtY2FyZHMtY29udGFpbmVyJyk7XG5cdFx0XHQkc3RyZWFtLmVtcHR5KCk7XG5cblx0XHRcdHRvcGljcy5mb3JFYWNoKHRvcCA9PiB7XG5cdFx0XHRcdCRzdHJlYW0uYXBwZW5kKGBcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiYmNmLXRvcGljLWNhcmQgcC0yXCIgc3R5bGU9XCJib3JkZXI6IDFweCBzb2xpZCAjZTJlOGYwOyBib3JkZXItcmFkaXVzOiA2cHg7IGJhY2tncm91bmQ6ICNmZmY7XCI+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwiZmxleC1iZXR3ZWVuXCI+XG5cdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVwiYmFkZ2UgYmFkZ2Utd2FybmluZ1wiPiR7dG9wLnRvcGljX3R5cGV9PC9zcGFuPlxuXHRcdFx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+JHt0b3Auc3RhdHVzfTwvc21hbGw+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDxoNSBjbGFzcz1cIm10LTEgbWItMVwiPiR7dG9wLnRpdGxlfTwvaDU+XG5cdFx0XHRcdFx0XHQ8c21hbGwgY2xhc3M9XCJ0ZXh0LW11dGVkXCI+PGkgY2xhc3M9XCJmYSBmYS1jbG9jay1vXCI+PC9pPiAke3RvcC5jcmVhdGlvbi5zcGxpdCgnICcpWzBdfTwvc21hbGw+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdGApO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFRBQiA4OiBQUk9KRUNUIERPQ1VNRU5UUyBUUkVFICYgVVBMT0FEXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyRG9jdW1lbnRzVHJlZSgpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby5nZXRfcHJvamVjdF9kb2N1bWVudF90cmVlJyxcblx0XHRcdGFyZ3M6IHsgcHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCB9XG5cdFx0fSkudGhlbihyID0+IHtcblx0XHRcdGNvbnN0IGZvbGRlcnMgPSByLm1lc3NhZ2UgfHwgW107XG5cdFx0XHRjb25zdCAkY29udCA9ICQoJyNkb2N1bWVudC1mb2xkZXJzLWNvbnRhaW5lcicpO1xuXHRcdFx0JGNvbnQuZW1wdHkoKTtcblxuXHRcdFx0Zm9sZGVycy5mb3JFYWNoKGYgPT4ge1xuXHRcdFx0XHRjb25zdCAkYm94ID0gJChgXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cImZvbGRlci1ib3hcIj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmb2xkZXItaGVhZGVyXCI+XG5cdFx0XHRcdFx0XHRcdDxpIGNsYXNzPVwiJHtmLmljb259IHRleHQtcHJpbWFyeVwiPjwvaT5cblx0XHRcdFx0XHRcdFx0PHNwYW4+JHtmLmZvbGRlcl9uYW1lfTwvc3Bhbj5cblx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJiYWRnZSBtbC1hdXRvXCI+JHtmLmZpbGVzLmxlbmd0aH08L3NwYW4+XG5cdFx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJmb2xkZXItZmlsZXMtbGlzdFwiPlxuXHRcdFx0XHRcdFx0XHQ8IS0tIEZpbGVzIC0tPlxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdGApO1xuXG5cdFx0XHRcdGNvbnN0ICRmTGlzdCA9ICRib3guZmluZCgnLmZvbGRlci1maWxlcy1saXN0Jyk7XG5cdFx0XHRcdGlmIChmLmZpbGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdCRmTGlzdC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJ0ZXh0LW11dGVkIHAtMiB0ZXh0LWNlbnRlclwiPjxzbWFsbD5FbXB0eSBmb2xkZXI8L3NtYWxsPjwvZGl2PicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGYuZmlsZXMuZm9yRWFjaChmaWxlID0+IHtcblx0XHRcdFx0XHRcdCRmTGlzdC5hcHBlbmQoYFxuXHRcdFx0XHRcdFx0XHQ8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJmaWxlLWl0ZW0tbGlua1wiIGRhdGEtcm91dGU9XCIke2ZpbGUucm91dGVfdGFyZ2V0fVwiIGRhdGEtdXJsPVwiJHtmaWxlLmZpbGVfdXJsfVwiPlxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuPjxpIGNsYXNzPVwiZmEgZmEtZmlsZSB0ZXh0LXNlY29uZGFyeVwiPjwvaT4gJHtmaWxlLmZpbGVfbmFtZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XCJiYWRnZVwiPiR7ZmlsZS5iYWRnZX08L3NwYW4+XG5cdFx0XHRcdFx0XHRcdDwvYT5cblx0XHRcdFx0XHRcdGApO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0JGNvbnQuYXBwZW5kKCRib3gpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRvcGVuRmlsZVVwbG9hZERpYWxvZygpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRuZXcgZnJhcHBlLnVpLkZpbGVVcGxvYWRlcih7XG5cdFx0XHRkb2N0eXBlOiAnUHJvamVjdCcsXG5cdFx0XHRkb2NuYW1lOiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0Zm9sZGVyOiAnSG9tZScsXG5cdFx0XHRvbl9zdWNjZXNzKGZpbGVfZG9jKSB7XG5cdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ0ZpbGUgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5LicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdHNlbGYucmVuZGVyRG9jdW1lbnRzVHJlZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMTA6IE1FTUJFUlNcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyZW5kZXJNZW1iZXJzVGFibGUoKSB7XG5cdFx0Y29uc3QgJHRib2R5ID0gJCgnI21lbWJlcnMtdGFibGUtYm9keScpO1xuXHRcdCR0Ym9keS5lbXB0eSgpO1xuXHRcdGNvbnN0IG1lbWJlcnMgPSAodGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhICYmIHRoaXMucHJvamVjdE92ZXJ2aWV3RGF0YS5tZW1iZXJzKSB8fCBbXTtcblxuXHRcdG1lbWJlcnMuZm9yRWFjaChtID0+IHtcblx0XHRcdCR0Ym9keS5hcHBlbmQoYFxuXHRcdFx0XHQ8dHI+XG5cdFx0XHRcdFx0PHRkPjxzdHJvbmc+JHttLmZ1bGxfbmFtZSB8fCBtLnVzZXJ9PC9zdHJvbmc+PC90ZD5cblx0XHRcdFx0XHQ8dGQ+JHttLnVzZXJ9PC90ZD5cblx0XHRcdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJiYWRnZVwiPiR7bS5yb2xlfTwvc3Bhbj48L3RkPlxuXHRcdFx0XHRcdDx0ZD48c3BhbiBjbGFzcz1cImxhYmVsIGxhYmVsLXN1Y2Nlc3NcIj5BY3RpdmU8L3NwYW4+PC90ZD5cblx0XHRcdFx0PC90cj5cblx0XHRcdGApO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBUQUIgMTE6IFNFVFRJTkdTXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cmVuZGVyU2V0dGluZ3NUYWIoKSB7XG5cdFx0aWYgKCF0aGlzLnByb2plY3RPdmVydmlld0RhdGEpIHJldHVybjtcblx0XHRjb25zdCBzdW1tYXJ5ID0gdGhpcy5wcm9qZWN0T3ZlcnZpZXdEYXRhLnN1bW1hcnkgfHwge307XG5cdFx0JCgnI3NldHRpbmctcHJvamVjdC1uYW1lJykudmFsKHN1bW1hcnkucHJvamVjdF9uYW1lIHx8ICcnKTtcblx0XHQkKCcjc2V0dGluZy1zdGF0dXMtbmFycmF0aXZlJykudmFsKHN1bW1hcnkuc3RhdHVzX25hcnJhdGl2ZSB8fCAnJyk7XG5cdFx0JCgnI3NldHRpbmctaXMtdGVtcGxhdGUnKS5wcm9wKCdjaGVja2VkJywgISFzdW1tYXJ5LmlzX3RlbXBsYXRlKTtcblx0XHQkKCcjc2V0dGluZy1pcy1mYXZvcml0ZScpLnByb3AoJ2NoZWNrZWQnLCAhIXN1bW1hcnkuaXNfZmF2b3JpdGUpO1xuXHR9XG5cblx0c2F2ZVByb2plY3RTZXR0aW5ncygpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBzZXR0aW5ncyA9IHtcblx0XHRcdHByb2plY3RfbmFtZTogJCgnI3NldHRpbmctcHJvamVjdC1uYW1lJykudmFsKCksXG5cdFx0XHRzdGF0dXNfbmFycmF0aXZlOiAkKCcjc2V0dGluZy1zdGF0dXMtbmFycmF0aXZlJykudmFsKCksXG5cdFx0XHRpc190ZW1wbGF0ZTogJCgnI3NldHRpbmctaXMtdGVtcGxhdGUnKS5pcygnOmNoZWNrZWQnKSA/IDEgOiAwLFxuXHRcdFx0aXNfZmF2b3JpdGU6ICQoJyNzZXR0aW5nLWlzLWZhdm9yaXRlJykuaXMoJzpjaGVja2VkJykgPyAxIDogMFxuXHRcdH07XG5cblx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRtZXRob2Q6ICdjb25zdHJ1Y3Rpb25fYmltLmFwaS5wcm9qZWN0X3N0dWRpby51cGRhdGVfcHJvamVjdF9zZXR0aW5ncycsXG5cdFx0XHRhcmdzOiB7XG5cdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXG5cdFx0XHRcdHNldHRpbmdzX2pzb246IEpTT04uc3RyaW5naWZ5KHNldHRpbmdzKVxuXHRcdFx0fVxuXHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCBzZXR0aW5ncyBzYXZlZCBzdWNjZXNzZnVsbHkuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBRVUlDSyBDUkVBVEUgTU9EQUwgKFNjcmVlbnNob3QgNSlcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRvcGVuUXVpY2tDcmVhdGVNb2RhbCh0eXBlKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0aWYgKHR5cGUgPT09ICdwcm9qZWN0JyB8fCB0eXBlID09PSAnc3VicHJvamVjdCcpIHtcblx0XHRcdGNvbnN0IGlzU3ViID0gdHlwZSA9PT0gJ3N1YnByb2plY3QnO1xuXHRcdFx0Y29uc3QgZCA9IG5ldyBmcmFwcGUudWkuRGlhbG9nKHtcblx0XHRcdFx0dGl0bGU6IGlzU3ViID8gX18oJ0FkZCBTdWJwcm9qZWN0JykgOiBfXygnQWRkIE5ldyBQcm9qZWN0JyksXG5cdFx0XHRcdGZpZWxkczogW1xuXHRcdFx0XHRcdHsgZmllbGRuYW1lOiAncHJvamVjdF9uYW1lJywgbGFiZWw6IF9fKCdQcm9qZWN0IE5hbWUnKSwgZmllbGR0eXBlOiAnRGF0YScsIHJlcWQ6IDEgfSxcblx0XHRcdFx0XHR7IGZpZWxkbmFtZTogJ2Zyb21fdGVtcGxhdGUnLCBsYWJlbDogX18oJ0Nsb25lIGZyb20gVGVtcGxhdGUnKSwgZmllbGR0eXBlOiAnTGluaycsIG9wdGlvbnM6ICdQcm9qZWN0JyB9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdHByaW1hcnlfYWN0aW9uX2xhYmVsOiBfXygnQ3JlYXRlIFByb2plY3QnKSxcblx0XHRcdFx0cHJpbWFyeV9hY3Rpb24odmFsdWVzKSB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlcy5mcm9tX3RlbXBsYXRlKSB7XG5cdFx0XHRcdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdFx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLmNsb25lX3Byb2plY3RfZnJvbV90ZW1wbGF0ZScsXG5cdFx0XHRcdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRcdFx0XHR0ZW1wbGF0ZV9wcm9qZWN0OiB2YWx1ZXMuZnJvbV90ZW1wbGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRuZXdfcHJvamVjdF9uYW1lOiB2YWx1ZXMucHJvamVjdF9uYW1lXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRcdFx0XHRcdGQuaGlkZSgpO1xuXHRcdFx0XHRcdFx0XHRpZiAoaXNTdWIpIHtcblx0XHRcdFx0XHRcdFx0XHRzZWxmLnVwZGF0ZVByb2plY3RTZXR0aW5nc0ZpZWxkKHIubWVzc2FnZS5uZXdfcHJvamVjdCwgeyBwYXJlbnRfcHJvamVjdDogc2VsZi5jdXJyZW50UHJvamVjdCB9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHNlbGYubG9hZFByb2plY3RzTGlzdCgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0c2VsZi5zZWxlY3RQcm9qZWN0KHIubWVzc2FnZS5uZXdfcHJvamVjdCk7XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmcmFwcGUuY2FsbCh7XG5cdFx0XHRcdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuaW5zZXJ0Jyxcblx0XHRcdFx0XHRcdFx0YXJnczoge1xuXHRcdFx0XHRcdFx0XHRcdGRvYzoge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZG9jdHlwZTogJ1Byb2plY3QnLFxuXHRcdFx0XHRcdFx0XHRcdFx0cHJvamVjdF9uYW1lOiB2YWx1ZXMucHJvamVjdF9uYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0c3RhdHVzOiAnT3BlbicsXG5cdFx0XHRcdFx0XHRcdFx0XHRpc19hY3RpdmU6ICdZZXMnLFxuXHRcdFx0XHRcdFx0XHRcdFx0cGFyZW50X3Byb2plY3Q6IGlzU3ViID8gc2VsZi5jdXJyZW50UHJvamVjdCA6IG51bGxcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pLnRoZW4ociA9PiB7XG5cdFx0XHRcdFx0XHRcdGQuaGlkZSgpO1xuXHRcdFx0XHRcdFx0XHRzZWxmLmxvYWRQcm9qZWN0c0xpc3QoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIWlzU3ViKSBzZWxmLnNlbGVjdFByb2plY3Qoci5tZXNzYWdlLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRkLnNob3coKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodHlwZSA9PT0gJ3VzZXInKSB7XG5cdFx0XHRjb25zdCBkID0gbmV3IGZyYXBwZS51aS5EaWFsb2coe1xuXHRcdFx0XHR0aXRsZTogX18oJ0ludml0ZSBQcm9qZWN0IE1lbWJlcicpLFxuXHRcdFx0XHRmaWVsZHM6IFtcblx0XHRcdFx0XHR7IGZpZWxkbmFtZTogJ2VtYWlsJywgbGFiZWw6IF9fKCdVc2VyIEVtYWlsJyksIGZpZWxkdHlwZTogJ0RhdGEnLCByZXFkOiAxIH0sXG5cdFx0XHRcdFx0eyBmaWVsZG5hbWU6ICdyb2xlJywgbGFiZWw6IF9fKCdQcm9qZWN0IFJvbGUnKSwgZmllbGR0eXBlOiAnU2VsZWN0Jywgb3B0aW9uczogJ1Byb2plY3QgTWFuYWdlclxcbkFyY2hpdGVjdFxcblN0cnVjdHVyYWwgRW5naW5lZXJcXG5NRVAgQ29vcmRpbmF0b3JcXG5TYWZldHkgT2ZmaWNlclxcblFDIEluc3BlY3RvcicsIGRlZmF1bHQ6ICdQcm9qZWN0IE1hbmFnZXInIH1cblx0XHRcdFx0XSxcblx0XHRcdFx0cHJpbWFyeV9hY3Rpb25fbGFiZWw6IF9fKCdBZGQgTWVtYmVyJyksXG5cdFx0XHRcdHByaW1hcnlfYWN0aW9uKHZhbHVlcykge1xuXHRcdFx0XHRcdGZyYXBwZS5jYWxsKHtcblx0XHRcdFx0XHRcdG1ldGhvZDogJ2ZyYXBwZS5jbGllbnQuaW5zZXJ0Jyxcblx0XHRcdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRcdFx0ZG9jOiB7XG5cdFx0XHRcdFx0XHRcdFx0ZG9jdHlwZTogJ1Byb2plY3QgVXNlcicsXG5cdFx0XHRcdFx0XHRcdFx0cGFyZW50OiBzZWxmLmN1cnJlbnRQcm9qZWN0LFxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudGZpZWxkOiAndXNlcnMnLFxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudHR5cGU6ICdQcm9qZWN0Jyxcblx0XHRcdFx0XHRcdFx0XHR1c2VyOiB2YWx1ZXMuZW1haWxcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0ZC5oaWRlKCk7XG5cdFx0XHRcdFx0XHRmcmFwcGUuc2hvd19hbGVydCh7IG1lc3NhZ2U6IF9fKCdVc2VyIGludml0ZWQgdG8gcHJvamVjdC4nKSwgaW5kaWNhdG9yOiAnZ3JlZW4nIH0pO1xuXHRcdFx0XHRcdFx0c2VsZi5sb2FkUHJvamVjdERhdGEoc2VsZi5jdXJyZW50UHJvamVjdCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0ZC5zaG93KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV29yayBwYWNrYWdlIHF1aWNrLWNyZWF0ZVxuXHRcdGNvbnN0IGQgPSBuZXcgZnJhcHBlLnVpLkRpYWxvZyh7XG5cdFx0XHR0aXRsZTogX18oJ0NyZWF0ZSB7MH0nLCBbdHlwZV0pLFxuXHRcdFx0ZmllbGRzOiBbXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAnc3ViamVjdCcsIGxhYmVsOiBfXygnU3ViamVjdCAvIFRpdGxlJyksIGZpZWxkdHlwZTogJ0RhdGEnLCByZXFkOiAxIH0sXG5cdFx0XHRcdHsgZmllbGRuYW1lOiAncHJpb3JpdHknLCBsYWJlbDogX18oJ1ByaW9yaXR5JyksIGZpZWxkdHlwZTogJ1NlbGVjdCcsIG9wdGlvbnM6ICdMb3dcXG5Ob3JtYWxcXG5IaWdoXFxuVXJnZW50JywgZGVmYXVsdDogJ05vcm1hbCcgfSxcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdkdWVfZGF0ZScsIGxhYmVsOiBfXygnRHVlIERhdGUnKSwgZmllbGR0eXBlOiAnRGF0ZScgfSxcblx0XHRcdFx0eyBmaWVsZG5hbWU6ICdkZXNjcmlwdGlvbicsIGxhYmVsOiBfXygnRGVzY3JpcHRpb24nKSwgZmllbGR0eXBlOiAnU21hbGwgVGV4dCcgfVxuXHRcdFx0XSxcblx0XHRcdHByaW1hcnlfYWN0aW9uX2xhYmVsOiBfXygnQ3JlYXRlJyksXG5cdFx0XHRwcmltYXJ5X2FjdGlvbih2YWx1ZXMpIHtcblx0XHRcdFx0ZnJhcHBlLmNhbGwoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLnF1aWNrX2NyZWF0ZV93b3JrX3BhY2thZ2UnLFxuXHRcdFx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0XHRcdHByb2plY3Q6IHNlbGYuY3VycmVudFByb2plY3QsXG5cdFx0XHRcdFx0XHR3cF90eXBlOiB0eXBlLFxuXHRcdFx0XHRcdFx0c3ViamVjdDogdmFsdWVzLnN1YmplY3QsXG5cdFx0XHRcdFx0XHRwcmlvcml0eTogdmFsdWVzLnByaW9yaXR5LFxuXHRcdFx0XHRcdFx0ZHVlX2RhdGU6IHZhbHVlcy5kdWVfZGF0ZSxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiB2YWx1ZXMuZGVzY3JpcHRpb25cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGQuaGlkZSgpO1xuXHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1dvcmsgcGFja2FnZSBjcmVhdGVkLicpLCBpbmRpY2F0b3I6ICdncmVlbicgfSk7XG5cdFx0XHRcdFx0aWYgKHNlbGYuY3VycmVudFRhYiA9PT0gJ3dvcmstcGFja2FnZXMnKSBzZWxmLnJlbmRlcldvcmtQYWNrYWdlcygpO1xuXHRcdFx0XHRcdGlmIChzZWxmLmN1cnJlbnRUYWIgPT09ICdib2FyZHMnKSBzZWxmLnJlbmRlckthbmJhbkJvYXJkKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGQuc2hvdygpO1xuXHR9XG5cblx0dXBkYXRlUHJvamVjdEhlYWx0aFN0YXR1cyhuZXdIZWFsdGgpIHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHR0aGlzLnVwZGF0ZVByb2plY3RTZXR0aW5nc0ZpZWxkKHRoaXMuY3VycmVudFByb2plY3QsIHsgaGVhbHRoX3N0YXR1czogbmV3SGVhbHRoIH0pLnRoZW4oKCkgPT4ge1xuXHRcdFx0ZnJhcHBlLnNob3dfYWxlcnQoeyBtZXNzYWdlOiBfXygnUHJvamVjdCBoZWFsdGggc2V0IHRvIHswfScsIFtuZXdIZWFsdGhdKSwgaW5kaWNhdG9yOiAnYmx1ZScgfSk7XG5cdFx0fSk7XG5cdH1cblxuXHR1cGRhdGVQcm9qZWN0U2V0dGluZ3NGaWVsZChwcm9qZWN0TmFtZSwgcGF0Y2hEaWN0KSB7XG5cdFx0cmV0dXJuIGZyYXBwZS5jYWxsKHtcblx0XHRcdG1ldGhvZDogJ2NvbnN0cnVjdGlvbl9iaW0uYXBpLnByb2plY3Rfc3R1ZGlvLnVwZGF0ZV9wcm9qZWN0X3NldHRpbmdzJyxcblx0XHRcdGFyZ3M6IHtcblx0XHRcdFx0cHJvamVjdDogcHJvamVjdE5hbWUsXG5cdFx0XHRcdHNldHRpbmdzX2pzb246IEpTT04uc3RyaW5naWZ5KHBhdGNoRGljdClcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGVkaXRTdGF0dXNOYXJyYXRpdmVQcm9tcHQoKSB7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0ZnJhcHBlLnByb21wdChcblx0XHRcdHtcblx0XHRcdFx0ZmllbGRuYW1lOiAnbmFycmF0aXZlJyxcblx0XHRcdFx0bGFiZWw6IF9fKCdTdGF0dXMgRGVzY3JpcHRpb24gLyBDb21tZW50YXJ5JyksXG5cdFx0XHRcdGZpZWxkdHlwZTogJ1NtYWxsIFRleHQnLFxuXHRcdFx0XHRkZWZhdWx0OiAkKCcjb3ZlcnZpZXctc3RhdHVzLW5hcnJhdGl2ZScpLnRleHQoKVxuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uICh2YWx1ZXMpIHtcblx0XHRcdFx0c2VsZi51cGRhdGVQcm9qZWN0U2V0dGluZ3NGaWVsZChzZWxmLmN1cnJlbnRQcm9qZWN0LCB7IHN0YXR1c19uYXJyYXRpdmU6IHZhbHVlcy5uYXJyYXRpdmUgfSkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0JCgnI292ZXJ2aWV3LXN0YXR1cy1uYXJyYXRpdmUnKS50ZXh0KHZhbHVlcy5uYXJyYXRpdmUpO1xuXHRcdFx0XHRcdGZyYXBwZS5zaG93X2FsZXJ0KHsgbWVzc2FnZTogX18oJ1N0YXR1cyBub3RlIHVwZGF0ZWQuJyksIGluZGljYXRvcjogJ2dyZWVuJyB9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0X18oJ0VkaXQgSGVhbHRoIFN0YXR1cyBEZXNjcmlwdGlvbicpLFxuXHRcdFx0X18oJ1NhdmUnKVxuXHRcdCk7XG5cdH1cbn1cblxud2luZG93LlByb2plY3RTdHVkaW9BcHAgPSBQcm9qZWN0U3R1ZGlvQXBwO1xuZXhwb3J0IGRlZmF1bHQgUHJvamVjdFN0dWRpb0FwcDsiXSwKICAibWFwcGluZ3MiOiAiO0FBR0EsSUFBTSxtQkFBTixNQUF1QjtBQUFBLEVBQ3RCLGNBQWM7QUFDYixTQUFLLGlCQUFpQjtBQUN0QixTQUFLLGNBQWMsQ0FBQztBQUNwQixTQUFLLGFBQWE7QUFDbEIsU0FBSyxrQkFBa0I7QUFDdkIsU0FBSyxtQkFBbUI7QUFDeEIsU0FBSyxlQUFlO0FBQ3BCLFNBQUsscUJBQXFCO0FBRTFCLFNBQUssS0FBSztBQUFBLEVBQ1g7QUFBQSxFQUVBLE9BQU87QUFDTixTQUFLLFdBQVc7QUFDaEIsU0FBSyxpQkFBaUIsRUFBRSxLQUFLLE1BQU07QUFFbEMsWUFBTSxZQUFZLElBQUksZ0JBQWdCLE9BQU8sU0FBUyxNQUFNO0FBQzVELFlBQU0sWUFBWSxVQUFVLElBQUksU0FBUztBQUN6QyxZQUFNLFdBQVcsVUFBVSxJQUFJLEtBQUs7QUFFcEMsVUFBSSxhQUFhLGNBQWMsT0FBTztBQUNyQyxhQUFLLGNBQWMsV0FBVyxZQUFZLE1BQU07QUFBQSxNQUNqRCxXQUFXLEtBQUssWUFBWSxTQUFTLEdBQUc7QUFDdkMsYUFB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
