// Project Studio Frontend Application (OpenProject BIM Parity)
// Manages All Projects Hub, Project Home, Work Packages, Boards, BCF, Documents, Settings

class ProjectStudioApp {
	constructor() {
		this.currentProject = null;
		this.allProjects = [];
		this.currentTab = 'home';
		this.activeFilterKey = 'all_open';
		this.activeTypeFilter = 'all';
		this.boardGroupBy = 'status';
		this.isSidebarCollapsed = false;

		this.init();
	}

	init() {
		this.bindEvents();
		this.loadProjectsList().then(() => {
			// Check URL parameters for project
			const urlParams = new URLSearchParams(window.location.search);
			const projParam = urlParams.get('project');
			const tabParam = urlParams.get('tab');

			if (projParam && projParam !== 'all') {
				this.selectProject(projParam, tabParam || 'home');
			} else if (this.allProjects.length > 0) {
				this.selectProject(this.allProjects[0].name, tabParam || 'home');
			} else {
				this.switchTab('all-projects');
			}
		});
	}

	bindEvents() {
		const self = this;

		// Sidebar collapse toggle
		$('#btn-toggle-sidebar').on('click', function () {
			self.isSidebarCollapsed = !self.isSidebarCollapsed;
			$('#studio-sidebar').toggleClass('collapsed', self.isSidebarCollapsed);
		});

		// Navigation links
		$('.studio-nav-list').on('click', '.nav-item', function () {
			const tab = $(this).data('tab');
			self.switchTab(tab);
		});

		// Refresh button
		$('#btn-studio-refresh').on('click', function () {
			if (self.currentProject) {
				self.loadProjectData(self.currentProject);
			} else {
				self.loadProjectsList();
			}
		});

		// Quick create dropdown actions
		$(document).on('click', '.action-quick-add', function () {
			const type = $(this).data('type');
			self.openQuickCreateModal(type);
		});

		// Add project button
		$('#btn-add-project').on('click', function () {
			self.openQuickCreateModal('project');
		});

		// Subproject add button
		$('#btn-add-subproject').on('click', function () {
			self.openQuickCreateModal('subproject');
		});

		// Search in all projects table
		$('#projects-filter-input').on('keyup', function () {
			const q = $(this).val().toLowerCase();
			$('#projects-table-body tr').each(function () {
				const text = $(this).text().toLowerCase();
				$(this).toggle(text.indexOf(q) > -1);
			});
		});

		// Global search
		$('#studio-global-search').on('keyup', function (e) {
			if (e.key === 'Enter') {
				const query = $(this).val();
				if (self.currentTab === 'work-packages') {
					self.renderWorkPackages(query);
				} else if (self.currentTab === 'all-projects') {
					$('#projects-filter-input').val(query).trigger('keyup');
				} else {
					self.switchTab('work-packages');
					setTimeout(() => self.renderWorkPackages(query), 100);
				}
			}
		});

		// Health status select change
		$('#select-project-health').on('change', function () {
			const val = $(this).val();
			self.updateProjectHealthStatus(val);
		});

		// Edit status narrative button
		$('#btn-edit-status-narrative').on('click', function () {
			self.editStatusNarrativePrompt();
		});

		// Work packages filter clicks
		$('.wp-sidebar-filter').on('click', 'li[data-filter]', function () {
			$('.wp-sidebar-filter li[data-filter]').removeClass('active');
			$(this).addClass('active');
			self.activeFilterKey = $(this).data('filter');
			$('#wp-active-filter-title').text($(this).text());
			self.renderWorkPackages();
		});

		$('.wp-sidebar-filter').on('click', 'li[data-type]', function () {
			$('.wp-sidebar-filter li[data-type]').removeClass('active');
			$(this).addClass('active');
			self.activeTypeFilter = $(this).data('type');
			self.renderWorkPackages();
		});

		// Work packages text search filter
		$('#wp-filter-search').on('keyup', function () {
			const q = $(this).val().toLowerCase();
			$('#wp-table-body tr').each(function () {
				const text = $(this).text().toLowerCase();
				$(this).toggle(text.indexOf(q) > -1);
			});
		});

		// Board grouping selector
		$('#select-board-group-by').on('change', function () {
			self.boardGroupBy = $(this).val();
			self.renderKanbanBoard();
		});

		// BCF Drawer toggle
		$('#btn-bcf-toggle-drawer').on('click', function () {
			$('#bcf-floating-drawer').toggle();
		});
		$('#btn-close-bcf-drawer').on('click', function () {
			$('#bcf-floating-drawer').hide();
		});

		// Document file link click delegation (Auto-Launchers!)
		$('#document-folders-container').on('click', '.file-item-link', function (e) {
			const route = $(this).data('route');
			const url = $(this).data('url');
			if (route === 'bim') {
				e.preventDefault();
				self.switchTab('bcf');
				frappe.show_alert({ message: __('Opening IFC model in 3D Viewer...'), indicator: 'blue' });
			} else if (route === 'cad') {
				e.preventDefault();
				self.switchTab('cad');
				frappe.show_alert({ message: __('Opening drawing in 2D CAD Studio...'), indicator: 'blue' });
			} else if (route === 'pdf') {
				e.preventDefault();
				self.switchTab('pdf');
				frappe.show_alert({ message: __('Opening plan in PDF Takeoff...'), indicator: 'blue' });
			}
		});

		// Document file upload button
		$('#btn-upload-document').on('click', function () {
			self.openFileUploadDialog();
		});

		// Project settings save
		$('#btn-save-project-settings').on('click', function () {
			self.saveProjectSettings();
		});

		// Archive toggle
		$('#btn-toggle-archive-project').on('click', function () {
			self.toggleArchiveProject();
		});

		// Delete project
		$('#btn-delete-project').on('click', function () {
			self.confirmDeleteProject();
		});
	}

	loadProjectsList() {
		const self = this;
		return frappe.call({
			method: 'construction_bim.api.project_studio.list_projects',
			args: { include_archived: 1 }
		}).then(r => {
			self.allProjects = r.message || [];
			self.renderProjectSwitcher();
			self.renderAllProjectsTable();
		});
	}

	renderProjectSwitcher() {
		const $list = $('#project-switcher-list');
		$list.empty();
		$list.append('<li><a href="javascript:void(0)" data-project="all"><i class="fa fa-th-list text-muted"></i> <strong>All projects (Hub)</strong></a></li>');
		$list.append('<li role="separator" class="divider"></li>');

		const self = this;
		this.allProjects.forEach(p => {
			const favIcon = p.is_favorite ? '⭐ ' : '';
			const tmplBadge = p.is_template ? ' <span class="badge">Template</span>' : '';
			const $item = $(`<li><a href="javascript:void(0)" data-project="${p.name}">${favIcon}${p.project_name}${tmplBadge}</a></li>`);
			$item.find('a').on('click', function () {
				const proj = $(this).data('project');
				if (proj === 'all') {
					self.switchTab('all-projects');
				} else {
					self.selectProject(proj);
				}
			});
			$list.append($item);
		});
	}

	selectProject(projectName, tab = 'home') {
		this.currentProject = projectName;
		const projObj = this.allProjects.find(p => p.name === projectName) || { project_name: projectName };
		$('#current-project-title').text(projObj.project_name);
		$('#sidebar-active-status').text(projObj.status || 'Active');

		// Enable project-specific nav tabs
		$('.studio-nav-list .nav-item').show();
		this.switchTab(tab);
		this.loadProjectData(projectName);
	}

	switchTab(tabKey) {
		this.currentTab = tabKey;
		$('.studio-nav-list .nav-item').removeClass('active');
		$(`.studio-nav-list .nav-item[data-tab="${tabKey}"]`).addClass('active');

		$('.studio-tab-view').hide();

		if (tabKey === 'all-projects') {
			$('#current-project-title').text('All projects');
			$('#view-all-projects').show();
			this.renderAllProjectsTable();
			return;
		}

		$(`#view-${tabKey}`).show();

		// Trigger view-specific loads
		if (tabKey === 'home') {
			this.renderProjectOverview();
		} else if (tabKey === 'work-packages') {
			this.renderWorkPackages();
		} else if (tabKey === 'boards') {
			this.renderKanbanBoard();
		} else if (tabKey === 'bcf') {
			this.renderBcfViewer();
		} else if (tabKey === 'documents') {
			this.renderDocumentsTree();
		} else if (tabKey === 'members') {
			this.renderMembersTable();
		} else if (tabKey === 'settings') {
			this.renderSettingsTab();
		}
	}

	loadProjectData(projectName) {
		const self = this;
		frappe.call({
			method: 'construction_bim.api.project_studio.get_project_overview',
			args: { project: projectName }
		}).then(r => {
			self.projectOverviewData = r.message || {};
			if (self.currentTab === 'home') {
				self.renderProjectOverview();
			}
		});
	}

	// -------------------------------------------------------------------------
	// TAB 0: ALL PROJECTS HUB (Screenshot 1)
	// -------------------------------------------------------------------------
	renderAllProjectsTable() {
		const $tbody = $('#projects-table-body');
		$tbody.empty();

		const self = this;
		this.allProjects.forEach(p => {
			const favStar = p.is_favorite ? '⭐' : '☆';
			const statusPill = p.health_status === 'On Track' 
				? '<span class="label label-success" style="background:#10b981;">ON TRACK</span>'
				: (p.health_status === 'At Risk' 
					? '<span class="label label-warning" style="background:#f59e0b;">AT RISK</span>'
					: '<span class="label label-danger" style="background:#ef4444;">OFF TRACK</span>');

			const indent = p.parent_project ? '&nbsp;&nbsp;&nbsp;&nbsp;↳ ' : '';
			const $tr = $(`
				<tr>
					<td class="text-center"><a href="javascript:void(0)" class="toggle-fav" data-project="${p.name}">${favStar}</a></td>
					<td>${indent}<a href="javascript:void(0)" class="project-link" data-project="${p.name}"><strong>${p.project_name}</strong></a></td>
					<td>${statusPill}</td>
					<td><i class="fa fa-check text-muted"></i></td>
					<td>${p.created_on || '--'}</td>
					<td>${p.latest_activity_at || '--'}</td>
					<td><small class="text-muted">${p.disk_usage_formatted || '0 Bytes'}</small></td>
				</tr>
			`);

			$tr.find('.project-link').on('click', function () {
				self.selectProject($(this).data('project'));
			});

			$tr.find('.toggle-fav').on('click', function () {
				const isFav = p.is_favorite ? 0 : 1;
				self.updateProjectSettingsField(p.name, { is_favorite: isFav }).then(() => {
					self.loadProjectsList();
				});
			});

			$tbody.append($tr);
		});

		$('#projects-table-summary').text(`Showing ${this.allProjects.length} active project(s)`);
	}

	// -------------------------------------------------------------------------
	// TAB 1: PROJECT HOME DASHBOARD (Screenshot 2)
	// -------------------------------------------------------------------------
	renderProjectOverview() {
		if (!this.projectOverviewData) return;
		const data = this.projectOverviewData;
		const summary = data.summary || {};

		// Description & Dates
		$('#overview-description').text(summary.description || __('No description provided.'));
		$('#overview-dates').text(`${summary.expected_start_date || '--'} to ${summary.expected_end_date || '--'}`);
		$('#overview-progress').text(`${Math.round(summary.percent_complete || 0)}%`);

		// Health status
		$('#select-project-health').val(summary.health_status || 'On Track');
		$('#overview-status-narrative').text(summary.status_narrative || __('All tasks and sub-projects are on schedule.'));

		// Milestone Diamond Timeline
		this.renderMilestoneTimeline(data.milestones || []);

		// Subprojects
		const $subList = $('#subprojects-list');
		$subList.empty();
		(data.subprojects || []).forEach(s => {
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

		// Meetings
		const $meetList = $('#meetings-list-container');
		$meetList.empty();
		(data.meetings || []).forEach(m => {
			$meetList.append(`
				<div class="meeting-item p-2 mb-1" style="border-bottom: 1px solid #f1f5f9;">
					<div class="flex-between">
						<strong>${m.title}</strong>
						<span class="badge badge-info">${m.type}</span>
					</div>
					<small class="text-muted"><i class="fa fa-calendar"></i> ${m.date} | ${m.host || 'Coordinator'}</small>
				</div>
			`);
		});
		if ((data.meetings || []).length === 0) {
			$meetList.append('<div class="text-muted p-2 text-center"><small>No upcoming meetings</small></div>');
		}

		// Members
		const $memGrid = $('#members-avatars-grid');
		$memGrid.empty();
		(data.members || []).forEach(m => {
			$memGrid.append(`
				<div class="member-chip p-1" style="display: inline-flex; align-items: center; gap: 6px; margin: 4px;">
					<span class="avatar-circle" style="width:28px;height:28px;border-radius:50%;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;">
						${(m.full_name || m.user).substring(0, 2).toUpperCase()}
					</span>
					<small>${m.full_name || m.user}</small>
				</div>
			`);
		});

		// News
		const $newsCont = $('#news-feed-container');
		$newsCont.empty();
		(data.news || []).forEach(n => {
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
		const $markers = $('#timeline-markers-container');
		$markers.empty();

		if (milestones.length === 0) {
			$markers.append('<div class="text-muted p-2 text-center" style="width:100%;"><small>No delivery milestones recorded yet.</small></div>');
			return;
		}

		const self = this;
		milestones.forEach(m => {
			const completedCls = m.completed ? 'completed' : '';
			const $pt = $(`
				<div class="milestone-marker-point" data-id="${m.id}" title="${m.title} (${m.due_date || 'TBD'})">
					<span class="milestone-date">${(m.due_date || '').substring(5)}</span>
					<div class="milestone-diamond ${completedCls}"></div>
					<span class="milestone-label">${m.title}</span>
				</div>
			`);
			$pt.on('click', function () {
				frappe.msgprint({
					title: __('Milestone Delivery Details'),
					message: `<h4>${m.title}</h4><p><strong>Target Due Date:</strong> ${m.due_date || 'None'}</p><p><strong>Status:</strong> ${m.status}</p>`,
					indicator: m.completed ? 'green' : 'orange'
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
			method: 'construction_bim.api.project_studio.list_work_packages',
			args: {
				project: self.currentProject,
				filter_key: self.activeFilterKey,
				type_filter: self.activeTypeFilter,
				search: searchQuery
			}
		}).then(r => {
			const items = r.message || [];
			const $tbody = $('#wp-table-body');
			$tbody.empty();

			if (items.length === 0) {
				$tbody.append('<tr><td colspan="7" class="text-center text-muted p-4">No work packages match this filter.</td></tr>');
				return;
			}

			items.forEach(it => {
				const pillCls = `wp-pill-${(it.type || 'task').toLowerCase()}`;
				const indent = it.parent_task ? '&nbsp;&nbsp;&nbsp;&nbsp;↳ ' : '';
				const $tr = $(`
					<tr class="wp-row-item" data-id="${it.id}" style="cursor: pointer;">
						<td><small class="text-muted">#${it.id.replace('TASK-', '')}</small></td>
						<td>${indent}<strong>${it.subject}</strong></td>
						<td><span class="wp-pill ${pillCls}">${it.type}</span></td>
						<td><span class="status-dot"></span> ${it.status}</td>
						<td><small>${it.assignee_name || 'Unassigned'}</small></td>
						<td><small>${it.priority}</small></td>
						<td><small class="text-muted">${it.exp_end_date || '--'}</small></td>
					</tr>
				`);

				$tr.on('click', function () {
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
				{ fieldname: 'status', label: __('Status'), fieldtype: 'Select', options: 'Open\nWorking\nPending Review\nCompleted\nCancelled', default: wp.status },
				{ fieldname: 'priority', label: __('Priority'), fieldtype: 'Select', options: 'Low\nNormal\nHigh\nUrgent', default: wp.priority },
				{ fieldname: 'exp_end_date', label: __('Due Date'), fieldtype: 'Date', default: wp.exp_end_date },
				{ fieldname: 'linked_info', label: __('Domain Linkage'), fieldtype: 'HTML' }
			],
			primary_action_label: __('Update Work Package'),
			primary_action(values) {
				frappe.call({
					method: 'frappe.client.set_value',
					args: {
						doctype: 'Task',
						name: wp.id,
						fieldname: {
							status: values.status,
							priority: values.priority,
							exp_end_date: values.exp_end_date
						}
					}
				}).then(() => {
					d.hide();
					frappe.show_alert({ message: __('Work package updated.'), indicator: 'green' });
					self.renderWorkPackages();
					if (self.currentTab === 'boards') self.renderKanbanBoard();
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
			method: 'construction_bim.api.project_studio.get_kanban_board_data',
			args: {
				project: self.currentProject,
				group_by: self.boardGroupBy
			}
		}).then(r => {
			const data = r.message || {};
			const columns = data.columns || [];
			const $wrapper = $('#kanban-columns-wrapper');
			$wrapper.empty();

			columns.forEach(col => {
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

				const $cardsList = $col.find('.column-cards-list');

				// Native HTML5 Drag and Drop handlers on dropzone
				$cardsList.on('dragover', function (e) {
					e.preventDefault();
					$(this).css('background', '#e2e8f0');
				});
				$cardsList.on('dragleave', function (e) {
					$(this).css('background', '');
				});
				$cardsList.on('drop', function (e) {
					e.preventDefault();
					$(this).css('background', '');
					const taskId = e.originalEvent.dataTransfer.getData('text/plain');
					const targetColumnId = col.id;

					if (taskId && targetColumnId) {
						// Optimistic DOM update
						const $draggedCard = $(`[data-task="${taskId}"]`);
						if ($draggedCard.length > 0) {
							$cardsList.append($draggedCard);
							self.updateBoardColumnCounts();
						}

						// Persist to backend
						frappe.call({
							method: 'construction_bim.api.project_studio.update_work_package_status',
							args: {
								task_name: taskId,
								new_column: targetColumnId,
								group_by: self.boardGroupBy
							}
						}).then(() => {
							frappe.show_alert({ message: __('Work package status updated to {0}', [targetColumnId]), indicator: 'green' });
						});
					}
				});

				// Populate cards
				col.cards.forEach(card => {
					const pillCls = `wp-pill-${(card.type || 'task').toLowerCase()}`;
					const $card = $(`
						<div class="kanban-card" draggable="true" data-task="${card.id}">
							<div class="flex-between mb-1">
								<span class="wp-pill ${pillCls}">${card.type}</span>
								<small class="text-muted">${card.priority}</small>
							</div>
							<div style="font-weight: 600; font-size: 13px; color: #1e293b;">${card.subject}</div>
							<div class="flex-between mt-2">
								<small class="text-muted"><i class="fa fa-calendar"></i> ${card.exp_end_date || '--'}</small>
								<small class="text-secondary">${card.assignee_name || ''}</small>
							</div>
						</div>
					`);

					$card.on('dragstart', function (e) {
						e.originalEvent.dataTransfer.setData('text/plain', card.id);
					});

					$card.on('click', function () {
						self.openWorkPackageInspector(card);
					});

					$cardsList.append($card);
				});

				$wrapper.append($col);
			});
		});
	}

	updateBoardColumnCounts() {
		$('.kanban-column').each(function () {
			const count = $(this).find('.kanban-card').length;
			$(this).find('.col-card-count').text(count);
		});
	}

	// -------------------------------------------------------------------------
	// TAB 5: BCF 2-PANE COORDINATION VIEWER (Screenshot 4)
	// -------------------------------------------------------------------------
	renderBcfViewer() {
		const self = this;
		// Fetch BIM models for project
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'BIM Model',
				filters: { project: self.currentProject },
				fields: ['name', 'model_name', 'ifc_file']
			}
		}).then(r => {
			const models = r.message || [];
			const $tree = $('#bcf-models-tree');
			$tree.empty();

			if (models.length === 0) {
				$tree.append('<div class="text-muted p-2"><small>No IFC models uploaded.</small></div>');
			} else {
				models.forEach(m => {
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

		// Fetch BCF Topics
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'BCF Topic',
				filters: { project: self.currentProject },
				fields: ['name', 'title', 'topic_type', 'priority', 'status', 'creation']
			}
		}).then(r => {
			const topics = r.message || [];
			$('#bcf-topic-count').text(topics.length);
			const $stream = $('#bcf-cards-container');
			$stream.empty();

			topics.forEach(top => {
				$stream.append(`
					<div class="bcf-topic-card p-2" style="border: 1px solid #e2e8f0; border-radius: 6px; background: #fff;">
						<div class="flex-between">
							<span class="badge badge-warning">${top.topic_type}</span>
							<small class="text-muted">${top.status}</small>
						</div>
						<h5 class="mt-1 mb-1">${top.title}</h5>
						<small class="text-muted"><i class="fa fa-clock-o"></i> ${top.creation.split(' ')[0]}</small>
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
			method: 'construction_bim.api.project_studio.get_project_document_tree',
			args: { project: self.currentProject }
		}).then(r => {
			const folders = r.message || [];
			const $cont = $('#document-folders-container');
			$cont.empty();

			folders.forEach(f => {
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

				const $fList = $box.find('.folder-files-list');
				if (f.files.length === 0) {
					$fList.append('<div class="text-muted p-2 text-center"><small>Empty folder</small></div>');
				} else {
					f.files.forEach(file => {
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
			doctype: 'Project',
			docname: self.currentProject,
			folder: 'Home',
			on_success(file_doc) {
				frappe.show_alert({ message: __('File uploaded successfully.'), indicator: 'green' });
				self.renderDocumentsTree();
			}
		});
	}

	// -------------------------------------------------------------------------
	// TAB 10: MEMBERS
	// -------------------------------------------------------------------------
	renderMembersTable() {
		const $tbody = $('#members-table-body');
		$tbody.empty();
		const members = (this.projectOverviewData && this.projectOverviewData.members) || [];

		members.forEach(m => {
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
		$('#setting-project-name').val(summary.project_name || '');
		$('#setting-status-narrative').val(summary.status_narrative || '');
		$('#setting-is-template').prop('checked', !!summary.is_template);
		$('#setting-is-favorite').prop('checked', !!summary.is_favorite);
	}

	saveProjectSettings() {
		const self = this;
		const settings = {
			project_name: $('#setting-project-name').val(),
			status_narrative: $('#setting-status-narrative').val(),
			is_template: $('#setting-is-template').is(':checked') ? 1 : 0,
			is_favorite: $('#setting-is-favorite').is(':checked') ? 1 : 0
		};

		frappe.call({
			method: 'construction_bim.api.project_studio.update_project_settings',
			args: {
				project: self.currentProject,
				settings_json: JSON.stringify(settings)
			}
		}).then(() => {
			frappe.show_alert({ message: __('Project settings saved successfully.'), indicator: 'green' });
			self.loadProjectsList();
		});
	}

	// -------------------------------------------------------------------------
	// QUICK CREATE MODAL (Screenshot 5)
	// -------------------------------------------------------------------------
	openQuickCreateModal(type) {
		const self = this;
		if (type === 'project' || type === 'subproject') {
			const isSub = type === 'subproject';
			const d = new frappe.ui.Dialog({
				title: isSub ? __('Add Subproject') : __('Add New Project'),
				fields: [
					{ fieldname: 'project_name', label: __('Project Name'), fieldtype: 'Data', reqd: 1 },
					{ fieldname: 'from_template', label: __('Clone from Template'), fieldtype: 'Link', options: 'Project' }
				],
				primary_action_label: __('Create Project'),
				primary_action(values) {
					if (values.from_template) {
						frappe.call({
							method: 'construction_bim.api.project_studio.clone_project_from_template',
							args: {
								template_project: values.from_template,
								new_project_name: values.project_name
							}
						}).then(r => {
							d.hide();
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
							method: 'frappe.client.insert',
							args: {
								doc: {
									doctype: 'Project',
									project_name: values.project_name,
									status: 'Open',
									is_active: 'Yes',
									parent_project: isSub ? self.currentProject : null
								}
							}
						}).then(r => {
							d.hide();
							self.loadProjectsList().then(() => {
								if (!isSub) self.selectProject(r.message.name);
							});
						});
					}
				}
			});
			d.show();
			return;
		}

		if (type === 'user') {
			const d = new frappe.ui.Dialog({
				title: __('Invite Project Member'),
				fields: [
					{ fieldname: 'email', label: __('User Email'), fieldtype: 'Data', reqd: 1 },
					{ fieldname: 'role', label: __('Project Role'), fieldtype: 'Select', options: 'Project Manager\nArchitect\nStructural Engineer\nMEP Coordinator\nSafety Officer\nQC Inspector', default: 'Project Manager' }
				],
				primary_action_label: __('Add Member'),
				primary_action(values) {
					frappe.call({
						method: 'frappe.client.insert',
						args: {
							doc: {
								doctype: 'Project User',
								parent: self.currentProject,
								parentfield: 'users',
								parenttype: 'Project',
								user: values.email
							}
						}
					}).then(() => {
						d.hide();
						frappe.show_alert({ message: __('User invited to project.'), indicator: 'green' });
						self.loadProjectData(self.currentProject);
					});
				}
			});
			d.show();
			return;
		}

		// Work package quick-create
		const d = new frappe.ui.Dialog({
			title: __('Create {0}', [type]),
			fields: [
				{ fieldname: 'subject', label: __('Subject / Title'), fieldtype: 'Data', reqd: 1 },
				{ fieldname: 'priority', label: __('Priority'), fieldtype: 'Select', options: 'Low\nNormal\nHigh\nUrgent', default: 'Normal' },
				{ fieldname: 'due_date', label: __('Due Date'), fieldtype: 'Date' },
				{ fieldname: 'description', label: __('Description'), fieldtype: 'Small Text' }
			],
			primary_action_label: __('Create'),
			primary_action(values) {
				frappe.call({
					method: 'construction_bim.api.project_studio.quick_create_work_package',
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
					frappe.show_alert({ message: __('Work package created.'), indicator: 'green' });
					if (self.currentTab === 'work-packages') self.renderWorkPackages();
					if (self.currentTab === 'boards') self.renderKanbanBoard();
				});
			}
		});
		d.show();
	}

	updateProjectHealthStatus(newHealth) {
		const self = this;
		this.updateProjectSettingsField(this.currentProject, { health_status: newHealth }).then(() => {
			frappe.show_alert({ message: __('Project health set to {0}', [newHealth]), indicator: 'blue' });
		});
	}

	updateProjectSettingsField(projectName, patchDict) {
		return frappe.call({
			method: 'construction_bim.api.project_studio.update_project_settings',
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
				fieldname: 'narrative',
				label: __('Status Description / Commentary'),
				fieldtype: 'Small Text',
				default: $('#overview-status-narrative').text()
			},
			function (values) {
				self.updateProjectSettingsField(self.currentProject, { status_narrative: values.narrative }).then(() => {
					$('#overview-status-narrative').text(values.narrative);
					frappe.show_alert({ message: __('Status note updated.'), indicator: 'green' });
				});
			},
			__('Edit Health Status Description'),
			__('Save')
		);
	}
}

window.ProjectStudioApp = ProjectStudioApp;
export default ProjectStudioApp;