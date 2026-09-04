// Project Studio Frontend Application (OpenProject BIM Parity)
// Manages All Projects Hub, Project Home, Work Packages, Boards, BCF, Documents, Settings

const ICONS = {
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
	if (str == null) return '';
	if (window.frappe && frappe.utils && frappe.utils.escape_html) {
		return frappe.utils.escape_html(String(str));
	}
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

class ProjectStudioApp {
	constructor(opts = {}) {
		this.opts = opts;
		this.page = opts.page || (window.cur_page && window.cur_page.page) || (frappe.container && frappe.container.page && frappe.container.page.page);
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
		this.setupNativePageHeader();
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

	setupNativePageHeader() {
		if (!this.page) return;
		const self = this;

		this.page.set_title(__('Dashboard'));
		if (this.currentProject) {
			this.page.set_title_sub(this.currentProject);
		}

		if (this.page.clear_action_bar) this.page.clear_action_bar();
		if (this.page.clear_primary_action) this.page.clear_primary_action();

		// Primary Action: + Create
		this.page.set_primary_action(
			__('Create'),
			() => self.openQuickCreateModal('Task'),
			'add'
		);

		// Add standard work package types under Create group
		this.page.add_inner_button(__('Standard Task'), () => self.openQuickCreateModal('Task'), __('Create'));
		this.page.add_inner_button(__('Milestone'), () => self.openQuickCreateModal('Milestone'), __('Create'));
		this.page.add_inner_button(__('Phase'), () => self.openQuickCreateModal('Phase'), __('Create'));
		this.page.add_inner_button(__('Issue / Punchlist'), () => self.openQuickCreateModal('Issue'), __('Create'));
		this.page.add_inner_button(__('Remark'), () => self.openQuickCreateModal('Remark'), __('Create'));
		this.page.add_inner_button(__('Request / RFI'), () => self.openQuickCreateModal('Request'), __('Create'));
		this.page.add_inner_button(__('Clash Topic'), () => self.openQuickCreateModal('Clash'), __('Create'));
		this.page.add_inner_button(__('New Project'), () => self.openQuickCreateModal('project'), __('Create'));
		this.page.add_inner_button(__('Invite Member'), () => self.openQuickCreateModal('user'), __('Create'));

		// Toolbar utility buttons (Matching Frappe CRM: Refresh, Edit, Desk)
		this.page.add_button(__('Refresh'), () => {
			if (self.currentProject) {
				self.loadProjectData(self.currentProject);
			} else {
				self.loadProjectsList();
			}
		}, { icon: 'refresh' });

		this.page.add_button(__('Edit'), () => {
			if (self.currentProject) {
				frappe.set_route('Form', 'Project', self.currentProject);
			} else {
				self.switchTab('settings');
			}
		}, { icon: 'edit' });

		this.page.add_button(__('Desk'), () => {
			frappe.set_route('desk');
		}, { icon: 'grid' });
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

		// Filter pill buttons (Frappe CRM style)
		$('#filter-project-btn').on('click', function (e) {
			e.stopPropagation();
			$('#projectSwitcherBtn').dropdown('toggle');
		});

		$('#filter-date-btn').on('click', function () {
			frappe.show_alert({ message: __('Filter: Last 30 Days (Active)'), indicator: 'blue' });
		});

		// Refresh button
		$('#btn-studio-refresh').on('click', function () {
			if (self.currentProject) {
				self.loadProjectData(self.currentProject);
			} else {
				self.loadProjectsList();
			}
		});

		// Edit button
		$('#btn-studio-edit').on('click', function () {
			if (self.currentProject) {
				frappe.set_route('Form', 'Project', self.currentProject);
			} else {
				self.switchTab('settings');
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

		// Collapse / expand sidebar
		$('#btn-toggle-sidebar').on('click', function () {
			$('#studio-sidebar').toggleClass('collapsed');
		});

		// Keyboard shortcut ⌘K / Ctrl+K
		$(document).on('keydown', function (e) {
			if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
				e.preventDefault();
				$('#studio-global-search').focus().select();
			}
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
			const modelId = $(this).data('model-id');
			if (route === 'bim') {
				e.preventDefault();
				self.switchTab('bcf', { model: modelId, url: url });
				frappe.show_alert({ message: __('Opening IFC model in 3D Viewer...'), indicator: 'blue' });
			} else if (route === 'cad') {
				e.preventDefault();
				self.switchTab('cad', { file: url });
				frappe.show_alert({ message: __('Opening drawing in 2D CAD Studio...'), indicator: 'blue' });
			} else if (route === 'pdf') {
				e.preventDefault();
				self.switchTab('pdf', { file: url });
				frappe.show_alert({ message: __('Opening plan in PDF Takeoff...'), indicator: 'blue' });
			}
		});

		// Document file upload button
		$('#btn-upload-document').on('click', function () {
			self.openFileUploadDialog();
		});

		// BIM Tab Quick Upload IFC button
		$('#btn-bcf-upload-ifc').on('click', function () {
			self.openBcfUploadDialog();
		});

		// BIM Tab Load/Unload all models buttons
		$('#btn-load-all-models').on('click', function () {
			$('#bcf-models-tree input[type="checkbox"]').prop('checked', true);
			const iframeSrc = `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}`;
			$('#iframe-bcf-3d-viewer').attr('src', iframeSrc);
			$('#btn-bcf-open-fullscreen').attr('href', iframeSrc);
		});
		$('#btn-unload-all-models').on('click', function () {
			$('#bcf-models-tree input[type="checkbox"]').prop('checked', false);
			const iframeSrc = `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}`;
			$('#iframe-bcf-3d-viewer').attr('src', iframeSrc);
		});

		// BCF Create Issue button
		$('#btn-bcf-create-topic').on('click', function () {
			self.openQuickCreateModal('Issue');
		});

		// Dashboard widget buttons
		$('#btn-add-meeting').on('click', function () {
			self.openScheduleMeetingDialog();
		});
		$('#btn-add-subproject-widget').on('click', function () {
			self.openQuickCreateModal('subproject');
		});

		// Standalone CAD & PDF buttons
		$('#btn-open-dwg-fullscreen').on('click', function () {
			window.open(`/app/dwg-viewer?project=${encodeURIComponent(self.currentProject)}`, '_blank');
		});
		$('#btn-open-pdf-fullscreen').on('click', function () {
			window.open(`/app/pdf-takeoff?project=${encodeURIComponent(self.currentProject)}`, '_blank');
		});

		// Schedule meeting button
		$('#btn-schedule-meeting').on('click', function () {
			self.openScheduleMeetingDialog();
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
		$list.append(`<li><a href="javascript:void(0)" class="action-select-proj" data-project="all"><span class="mr-2 text-muted">${ICONS.list}</span> <strong>All projects (Hub)</strong></a></li>`);
		$list.append('<li role="separator" class="divider"></li>');

		const self = this;
		this.allProjects.forEach(p => {
			const favIcon = p.is_favorite ? '⭐ ' : '';
			const tmplBadge = p.is_template ? ' <span class="badge">Template</span>' : '';
			const $item = $(`<li><a href="javascript:void(0)" class="action-select-proj" data-project="${escapeHtml(p.name)}">${favIcon}${escapeHtml(p.project_name || p.name)}${tmplBadge}</a></li>`);
			$list.append($item);
		});

		$list.off('click', '.action-select-proj').on('click', '.action-select-proj', function () {
			const proj = $(this).data('project');
			if (proj === 'all') {
				self.switchTab('all-projects');
			} else {
				self.selectProject(proj);
			}
		});
	}

	selectProject(projectName, tab = 'home') {
		const projObj = this.allProjects.find(p => p.name === projectName || p.project_name === projectName) || { name: projectName, project_name: projectName };
		this.currentProject = projObj.name;
		$('#current-project-title').text(projObj.project_name || projObj.name);
		$('#filter-project-label').text(projObj.project_name || projObj.name);
		$('#sidebar-active-status').text(projObj.status || 'Active');
		if (this.page) {
			this.page.set_title_sub(projObj.project_name || projObj.name);
		}

		// Enable project-specific nav tabs
		$('.studio-nav-list .nav-item').show();
		this.switchTab(tab);
		this.loadProjectData(projectName);
	}

	switchTab(tabKey, params = {}) {
		this.currentTab = tabKey;
		$('.studio-nav-list .nav-item').removeClass('active');
		$(`.studio-nav-list .nav-item[data-tab="${tabKey}"]`).addClass('active');

		const tabTitles = {
			'home': 'Dashboard',
			'work-packages': 'Work Packages',
			'boards': 'Boards',
			'gantt': 'Gantt Charts',
			'bcf': 'BIM / BCF Coordination',
			'cad': '2D CAD (DWG)',
			'pdf': 'PDF Plans & Takeoff',
			'documents': 'Documents',
			'meetings': 'Meetings & Safety',
			'members': 'Members',
			'settings': 'Settings',
			'all-projects': 'Active Projects'
		};
		const activeTitle = tabTitles[tabKey] || tabKey;
		$('#studio-active-title').text(activeTitle);
		if (this.page) {
			this.page.set_title(activeTitle);
			if (this.currentProject) {
				this.page.set_title_sub(this.currentProject);
			}
		}

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
		} else if (tabKey === 'gantt') {
			this.renderGanttChart();
		} else if (tabKey === 'bcf') {
			this.renderBcfViewer(params.model);
		} else if (tabKey === 'cad') {
			const cadSrc = params.file
				? `/app/dwg-viewer?project=${encodeURIComponent(this.currentProject)}&file=${encodeURIComponent(params.file)}`
				: `/app/dwg-viewer?project=${encodeURIComponent(this.currentProject)}`;
			$('#iframe-dwg-viewer').attr('src', cadSrc);
		} else if (tabKey === 'pdf') {
			const pdfSrc = params.file
				? `/app/pdf-takeoff?project=${encodeURIComponent(this.currentProject)}&file=${encodeURIComponent(params.file)}`
				: `/app/pdf-takeoff?project=${encodeURIComponent(this.currentProject)}`;
			$('#iframe-pdf-viewer').attr('src', pdfSrc);
		} else if (tabKey === 'documents') {
			this.renderDocumentsTree();
		} else if (tabKey === 'meetings') {
			this.renderMeetingsTab();
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
			const favStar = p.is_favorite ? ICONS.star : ICONS.starEmpty;
			const statusPill = p.health_status === 'On Track' 
				? '<span class="status-active-pill"><span class="status-dot-green"></span> On track</span>'
				: (p.health_status === 'At Risk' 
					? '<span class="status-warning-pill"><span class="status-dot-amber"></span> At risk</span>'
					: '<span class="status-danger-pill"><span class="status-dot-red"></span> Off track</span>');

			const indent = p.parent_project ? '&nbsp;&nbsp;&nbsp;&nbsp;↳ ' : '';
			const $tr = $(`
				<tr>
					<td class="text-center"><a href="javascript:void(0)" class="toggle-fav" data-project="${escapeHtml(p.name)}">${favStar}</a></td>
					<td>${indent}<a href="javascript:void(0)" class="project-link" data-project="${escapeHtml(p.name)}"><strong>${escapeHtml(p.project_name || p.name)}</strong></a></td>
					<td>${statusPill}</td>
					<td class="text-center text-success">${ICONS.check}</td>
					<td><span class="text-muted">${escapeHtml(p.created_on || '--')}</span></td>
					<td><span class="text-muted">${escapeHtml(p.latest_activity_at || '--')}</span></td>
					<td><small class="text-muted">${escapeHtml(p.disk_usage_formatted || '0 Bytes')}</small></td>
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

		// Greeting & Top Metric Cards (Frappe UI Style)
		const userGreeting = frappe.session.user_fullname || frappe.session.user || 'Administrator';
		$('#home-user-greeting').text(userGreeting);

		const wpCounts = data.work_packages_counts || {};
		const openTasks = wpCounts.open !== undefined ? wpCounts.open : (data.tasks ? data.tasks.length : 0);
		const clashes = (data.coordination && data.coordination.topics ? data.coordination.topics.length : 0);
		const progress = Math.round(summary.percent_complete || 0);

		$('#home-stat-open-tasks').text(openTasks);
		$('#home-stat-clashes').text(clashes);
		$('#home-stat-progress').text(`${progress}%`);
		$('#sparkline-progress-bar').css('width', `${Math.min(100, Math.max(5, progress))}%`);

		// Description & Dates
		$('#overview-description').text(summary.description || __('No description provided.'));
		$('#overview-dates').text(`${summary.expected_start_date || '--'} to ${summary.expected_end_date || '--'}`);
		$('#overview-progress').text(`${Math.round(summary.percent_complete || 0)}%`);

		// Health status
		const health = summary.health_status || 'On Track';
		$('#select-project-health').val(health);
		if (this.page && this.page.set_indicator) {
			const color = health === 'On Track' ? 'green' : (health === 'At Risk' ? 'orange' : 'red');
			this.page.set_indicator(health, color);
		}
		$('#overview-status-narrative').text(summary.status_narrative || __('All tasks and sub-projects are on schedule.'));

		// Milestone Diamond Timeline
		this.renderMilestoneTimeline(data.milestones || []);

		// Subprojects
		const $subList = $('#subprojects-list');
		$subList.empty();
		(data.subprojects || []).forEach(s => {
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

		// Meetings
		const $meetList = $('#meetings-list-container');
		$meetList.empty();
		(data.meetings || []).forEach(m => {
			$meetList.append(`
				<div class="meeting-item p-2 mb-1" style="border-bottom: 1px solid #f1f5f9;">
					<div class="flex-between">
						<strong>${escapeHtml(m.title)}</strong>
						<span class="badge badge-info">${escapeHtml(m.type)}</span>
					</div>
					<small class="text-muted d-inline-flex align-items-center gap-1 mt-1">${ICONS.calendar} <span>${escapeHtml(m.date)} | ${escapeHtml(m.host || 'Coordinator')}</span></small>
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
			const memberName = String(m.full_name || m.user || 'Member').trim();
			const initials = memberName ? memberName.substring(0, 2).toUpperCase() : 'MB';
			$memGrid.append(`
				<div class="member-chip p-1" style="display: inline-flex; align-items: center; gap: 6px; margin: 4px;">
					<span class="avatar-circle" style="width:28px;height:28px;border-radius:50%;background:#4338ca;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;">
						${escapeHtml(initials)}
					</span>
					<small class="font-weight-medium">${escapeHtml(memberName)}</small>
				</div>
			`);
		});

		// News
		const $newsCont = $('#news-feed-container');
		$newsCont.empty();
		(data.news || []).forEach(n => {
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
		const $markers = $('#timeline-markers-container');
		$markers.empty();

		if (!milestones || milestones.length === 0) {
			$('#timeline-axis-bar').hide();
			$markers.html(`<div class="text-center" style="width: 100%;"><span class="timeline-empty-msg text-muted">${ICONS.info} No delivery milestones recorded yet.</span></div>`);
			return;
		}

		$('#timeline-axis-bar').show();

		const self = this;
		milestones.forEach(m => {
			const completedCls = m.completed ? 'completed' : '';
			const safeTitle = escapeHtml(m.title || '');
			const safeDueDate = escapeHtml(m.due_date || '');
			const safeStatus = escapeHtml(m.status || '');
			const $pt = $(`
				<div class="milestone-marker-point" data-id="${escapeHtml(m.id)}" title="${safeTitle} (${safeDueDate || 'TBD'})">
					<span class="milestone-date">${safeDueDate.length >= 5 ? safeDueDate.substring(5) : safeDueDate}</span>
					<div class="milestone-diamond ${completedCls}"></div>
					<span class="milestone-label">${safeTitle}</span>
				</div>
			`);
			$pt.on('click', function () {
				frappe.msgprint({
					title: __('Milestone Delivery Details'),
					message: `<h4>${safeTitle}</h4><p><strong>Target Due Date:</strong> ${safeDueDate || 'None'}</p><p><strong>Status:</strong> ${safeStatus}</p>`,
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

			const allowedTypes = ['task', 'milestone', 'phase', 'issue', 'clash'];
			items.forEach(it => {
				const rawType = String(it.type || 'task').toLowerCase();
				const safeType = allowedTypes.includes(rawType) ? rawType : 'task';
				const pillCls = `wp-pill-${safeType}`;
				const indent = it.parent_task ? '&nbsp;&nbsp;&nbsp;&nbsp;↳ ' : '';
				const $tr = $(`
					<tr class="wp-row-item" data-id="${escapeHtml(it.id)}" style="cursor: pointer;">
						<td><small class="text-muted">#${escapeHtml(String(it.id).replace('TASK-', ''))}</small></td>
						<td>${indent}<strong>${escapeHtml(it.subject)}</strong></td>
						<td><span class="wp-pill ${pillCls}">${escapeHtml(it.type)}</span></td>
						<td><span class="status-dot"></span> ${escapeHtml(it.status)}</td>
						<td><small>${escapeHtml(it.assignee_name || 'Unassigned')}</small></td>
						<td><small>${escapeHtml(it.priority)}</small></td>
						<td><small class="text-muted">${escapeHtml(it.exp_end_date || '--')}</small></td>
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
			title: `[${escapeHtml(wp.type)}] #${escapeHtml(wp.id)} - ${escapeHtml(wp.subject)}`,
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
						const safeTaskId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(taskId) : String(taskId).replace(/["\\]/g, '\\$&');
						const $draggedCard = $(`[data-task="${safeTaskId}"]`);
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
				(col.cards || []).forEach(card => {
					const allowedTypes = ['task', 'milestone', 'phase', 'issue', 'clash'];
					const rawType = String(card.type || 'task').toLowerCase();
					const safeType = allowedTypes.includes(rawType) ? rawType : 'task';
					const pillCls = `wp-pill-${safeType}`;

					const allowedPriorities = ['low', 'normal', 'high', 'urgent'];
					const rawPriority = String(card.priority || 'normal').toLowerCase();
					const safePriority = allowedPriorities.includes(rawPriority) ? rawPriority : 'normal';
					const priorityCls = `priority-${safePriority}`;

					const assigneeName = String(card.assignee_name || '').trim();
					const assigneeInitials = assigneeName ? assigneeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';
					const assigneeHtml = assigneeName ? `
						<span class="card-assignee-pill" title="${escapeHtml(assigneeName)}">
							<span class="assignee-avatar">${escapeHtml(assigneeInitials)}</span>
							<span class="assignee-text">${escapeHtml(assigneeName)}</span>
						</span>
					` : '';

					const $card = $(`
						<div class="kanban-card" draggable="true" data-task="${escapeHtml(card.id)}">
							<div class="kanban-card-head">
								<span class="wp-pill ${pillCls}">${escapeHtml(card.type)}</span>
								<span class="card-priority ${priorityCls}">${escapeHtml(card.priority)}</span>
							</div>
							<div class="kanban-card-title">${escapeHtml(card.subject)}</div>
							<div class="kanban-card-foot">
								<span class="card-date-badge">${ICONS.calendar} <span>${escapeHtml(card.exp_end_date || '--')}</span></span>
								${assigneeHtml}
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
	// TAB 4: GANTT SCHEDULE TIMELINE
	// -------------------------------------------------------------------------
	renderGanttChart() {
		const self = this;
		frappe.call({
			method: 'construction_bim.api.project_studio.list_work_packages',
			args: { project: self.currentProject, filter_key: 'all_open' }
		}).then(r => {
			const items = r.message || [];
			const $target = $('#frappe-gantt-target');
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

			// Format tasks for Gantt
			const nowStr = (frappe.datetime && frappe.datetime.get_today) ? frappe.datetime.get_today() : new Date().toISOString().split('T')[0];
			const ganttTasks = items.map(it => {
				const start = it.exp_start_date || nowStr;
				const end = it.exp_end_date || ((frappe.datetime && frappe.datetime.add_days) ? frappe.datetime.add_days(start, 7) : start);
				return {
					id: it.id,
					name: `[${it.type}] ${it.subject}`,
					start: start,
					end: end,
					progress: it.progress || 0,
					custom_class: `bar-${it.type.toLowerCase()}`
				};
			});

			if (window.Gantt) {
				try {
					self.ganttChart = new window.Gantt('#frappe-gantt-target', ganttTasks, {
						view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
						view_mode: 'Day',
						date_format: 'YYYY-MM-DD',
						on_click: (task) => {
							const wp = items.find(i => i.id === task.id);
							if (wp) self.openWorkPackageInspector(wp);
						}
					});

					$('.gantt-scale-group .btn-gantt-scale').off('click').on('click', function () {
						$('.gantt-scale-group .btn-gantt-scale').removeClass('active');
						$(this).addClass('active');
						const scale = $(this).data('scale');
						if (self.ganttChart && self.ganttChart.change_view_mode) {
							self.ganttChart.change_view_mode(scale);
						}
					});
					return;
				} catch (e) {
					console.warn('Frappe Gantt instantiation failed, rendering custom timeline fallback', e);
				}
			}

			// Custom Interactive Timeline Visualization Fallback
			let html = '<div class="custom-gantt-table table-responsive"><table class="table table-bordered table-condensed"><thead><tr><th width="30%">Work Package</th><th width="15%">Start Date</th><th width="15%">Due Date</th><th width="40%">Timeline Progress</th></tr></thead><tbody>';
			const allowedTypes = ['task', 'milestone', 'phase', 'issue', 'clash'];
			items.forEach(it => {
				const rawType = String(it.type || 'task').toLowerCase();
				const safeType = allowedTypes.includes(rawType) ? rawType : 'task';
				const pillCls = `wp-pill-${safeType}`;
				const progress = Math.min(100, Math.max(0, it.progress || (it.status === 'Completed' ? 100 : 25)));
				html += `
					<tr class="wp-gantt-row" data-id="${escapeHtml(it.id)}" style="cursor: pointer;">
						<td><span class="wp-pill ${pillCls}">${escapeHtml(it.type)}</span> <strong>${escapeHtml(it.subject)}</strong></td>
						<td><small>${escapeHtml(it.exp_start_date || '--')}</small></td>
						<td><small>${escapeHtml(it.exp_end_date || '--')}</small></td>
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
			html += '</tbody></table></div>';
			$target.html(html);

			$target.find('.wp-gantt-row').on('click', function () {
				const id = $(this).data('id');
				const wp = items.find(i => i.id === id);
				if (wp) self.openWorkPackageInspector(wp);
			});
		});
	}

	// -------------------------------------------------------------------------
	// TAB 5: BCF 2-PANE COORDINATION VIEWER (Screenshot 4)
	// -------------------------------------------------------------------------
	renderBcfViewer(targetModel = null) {
		const self = this;

		// 1. Update 3D BIM Viewer Iframe URL with project and target model
		const $iframe = $('#iframe-bcf-3d-viewer');
		const targetParam = targetModel ? `&model=${encodeURIComponent(targetModel)}` : '';
		const expectedSrc = `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}${targetParam}`;
		if ($iframe.length && $iframe.attr('src') !== expectedSrc) {
			$iframe.attr('src', expectedSrc);
		}
		$('#btn-bcf-open-fullscreen').attr('href', expectedSrc);

		frappe.call({
			method: 'construction_bim.api.project_studio.get_bcf_coordination_data',
			args: { project: self.currentProject }
		}).then(r => {
			const data = r.message || { models: [], topics: [] };
			const models = data.models || [];
			const topics = data.topics || [];

			// 2. Populate Spatial Model Tree
			const $tree = $('#bcf-models-tree');
			$tree.empty();

			if (models.length === 0) {
				$tree.append('<div class="text-muted p-3 text-center"><small>No IFC models uploaded yet.<br>Click <strong>+ Upload IFC</strong> above to add one.</small></div>');
			} else {
				models.forEach(m => {
					const isChecked = targetModel ? (m.name === targetModel || m.model_name === targetModel) : true;
					const safeName = escapeHtml(m.name);
					const safeDiscipline = escapeHtml(m.discipline || 'IFC');
					const safeModelName = escapeHtml(m.model_name || m.name);
					$tree.append(`
						<div class="model-tree-row p-2 flex-between" style="border-bottom: 1px solid #f1f5f9; border-radius: 6px;">
							<label style="font-weight: normal; font-size: 12.5px; cursor: pointer; margin: 0; display: flex; align-items: center; gap: 6px;">
								<input type="checkbox" class="model-tree-cb" ${isChecked ? 'checked' : ''} data-model="${safeName}">
								<span class="badge" style="background:#e0e7ff; color:#4338ca; font-size:10px; font-weight:600;">${safeDiscipline}</span>
								<span>${safeModelName}</span>
							</label>
							<a href="javascript:void(0)" class="action-focus-model text-muted ml-1" data-model="${safeName}" title="View this model">${ICONS.eye}</a>
						</div>
					`);
				});

				$tree.find('.model-tree-cb').on('change', function () {
					const mName = $(this).data('model');
					if ($(this).is(':checked')) {
						$('#iframe-bcf-3d-viewer').attr('src', `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}&model=${encodeURIComponent(mName)}`);
					}
				});

				$tree.find('.action-focus-model').on('click', function () {
					const mName = $(this).data('model');
					$tree.find('.model-tree-cb').prop('checked', false);
					$tree.find(`.model-tree-cb[data-model="${mName}"]`).prop('checked', true);
					$('#iframe-bcf-3d-viewer').attr('src', `/app/bim-viewer?project=${encodeURIComponent(self.currentProject)}&model=${encodeURIComponent(mName)}`);
				});
			}

			// 3. Populate BCF Topics
			$('#bcf-topic-count').text(topics.length);
			const $stream = $('#bcf-cards-container');
			$stream.empty();

			if (topics.length === 0) {
				$stream.append('<div class="text-muted p-4 text-center"><small>No BCF topics logged for this project.</small></div>');
			} else {
				topics.forEach(top => {
					$stream.append(`
						<div class="bcf-topic-card mb-2">
							<div class="flex-between mb-1">
								<span class="status-warning-pill">${escapeHtml(top.topic_type)}</span>
								<span class="text-muted" style="font-size:11px;">${escapeHtml(top.status)}</span>
							</div>
							<div class="font-weight-medium" style="font-size:13px; color:#111827;">${escapeHtml(top.title)}</div>
							<div class="text-muted d-flex align-items-center gap-1 mt-1" style="font-size:11.5px;">
								<span>${ICONS.clock}</span>
								<span>${escapeHtml(top.creation ? top.creation.split(' ')[0] : '--')}</span>
								<span class="mx-1">•</span>
								<span>${escapeHtml(top.assigned_to || 'Unassigned')}</span>
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
			method: 'construction_bim.api.project_studio.get_project_document_tree',
			args: { project: self.currentProject }
		}).then(r => {
			const folders = r.message || [];
			const $cont = $('#document-folders-container');
			$cont.empty();

			const folderConfig = {
				'01 Contracts & NTP': { icon: ICONS.file, bg: '#eff6ff', color: '#2563eb' },
				'02 Drawings & Specs': { icon: ICONS.list, bg: '#f5f3ff', color: '#7c3aed' },
				'03 BIM Models': { icon: ICONS.cube, bg: '#fffbeb', color: '#d97706' },
				'04 BOQ & Estimates': { icon: ICONS.table, bg: '#ecfdf5', color: '#059669' },
				'05 Site Media': { icon: ICONS.camera, bg: '#fff1f2', color: '#e11d48' }
			};

			folders.forEach(f => {
				const cfg = folderConfig[f.folder_name] || { icon: ICONS.folder, bg: '#f1f5f9', color: '#475467' };
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

				const $fList = $box.find('.folder-files-list');
				if (!f.files || f.files.length === 0) {
					$fList.append('<div class="text-muted p-3 text-center" style="font-size:12px;">No files in folder</div>');
				} else {
					f.files.forEach(file => {
						const safeRoute = escapeHtml(file.route_target || '');
						const safeUrl = escapeHtml(file.file_url || '');
						const safeModelId = escapeHtml(file.model_id || file.id || '');
						const safeFileName = escapeHtml(file.file_name || '');
						const safeBadge = escapeHtml(file.badge || 'File');
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

			$cont.find('.file-item-link').on('click', function () {
				const route = $(this).data('route');
				const url = $(this).data('url');
				const modelId = $(this).data('model-id');
				if (route === 'bim-viewer' || (url && url.endsWith('.ifc'))) {
					self.switchTab('bcf', { model: modelId });
				} else if (route === 'dwg-viewer' || (url && (url.endsWith('.dwg') || url.endsWith('.dxf')))) {
					self.switchTab('cad', { file: url });
				} else if (route === 'pdf-takeoff' || (url && url.endsWith('.pdf'))) {
					self.switchTab('pdf', { file: url });
				} else if (url) {
					window.open(url, '_blank');
				}
			});
		});
	}

	handleUploadedFile(fileDoc) {
		const self = this;
		const ext = (fileDoc.file_name || '').split('.').pop().toLowerCase();
		if (ext === 'ifc') {
			frappe.show_alert({ message: __('Ingesting IFC model into 3D BIM database...'), indicator: 'blue' });
			frappe.call({
				method: 'construction_bim.bim.api.create_model_from_ifc',
				args: {
					file_url: fileDoc.file_url,
					file_name: fileDoc.file_name,
					project: self.currentProject,
					model_name: fileDoc.file_name.replace(/\.[^/.]+$/, ''),
					discipline: 'Architecture'
				}
			}).then(res => {
				frappe.show_alert({ message: __('BIM Model ingested successfully!'), indicator: 'green' });
				self.renderDocumentsTree();
				self.switchTab('bcf', { model: res.message ? res.message.name : null });
			}).catch(err => {
				console.error('Failed to parse IFC:', err);
				frappe.msgprint(__('Uploaded file saved, but IFC parsing encountered an issue: ') + (err.message || err));
				self.renderDocumentsTree();
				self.switchTab('bcf');
			});
		} else {
			frappe.show_alert({ message: __('File uploaded successfully.'), indicator: 'green' });
			self.renderDocumentsTree();
		}
	}

	openFileUploadDialog() {
		const self = this;
		new frappe.ui.FileUploader({
			doctype: 'Project',
			docname: self.currentProject,
			folder: 'Home',
			on_success(file_doc) {
				self.handleUploadedFile(file_doc);
			}
		});
	}

	openBcfUploadDialog() {
		const self = this;
		new frappe.ui.FileUploader({
			doctype: 'Project',
			docname: self.currentProject,
			folder: 'Home',
			restrictions: {
				allowed_file_types: ['.ifc']
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
		const $cont = $('#meetings-tab-container');
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
			$cont.find('#btn-schedule-meeting-empty').on('click', () => self.openScheduleMeetingDialog());
			return;
		}

		meetings.forEach(m => {
			const docType = m.doctype || (m.type === 'Toolbox Talk' ? 'Toolbox Talk' : 'Event');
			const isToolbox = m.type === 'Toolbox Talk';
			const pillCls = isToolbox ? 'meeting-pill-toolbox' : 'meeting-pill-coord';

			$cont.append(`
				<div class="meeting-card-surface">
					<div class="meeting-card-main">
						<div class="meeting-card-header">
							<span class="meeting-badge ${pillCls}">${escapeHtml(m.type)}</span>
							<h4 class="meeting-title">${escapeHtml(m.title)}</h4>
						</div>
						<div class="meeting-meta-row">
							<span class="meta-item">${ICONS.calendar} <span>${escapeHtml(m.date)}</span></span>
							<span class="meta-divider">•</span>
							<span class="meta-item">${ICONS.user} <span>Conductor: ${escapeHtml(m.host || 'Site Coordinator')}</span></span>
							<span class="meta-divider">•</span>
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

		$cont.find('.btn-view-meeting-doc').on('click', function () {
			const dt = $(this).data('doctype') || 'Event';
			const nm = $(this).data('name');
			frappe.set_route('Form', dt, nm);
		});
	}

	openScheduleMeetingDialog() {
		const self = this;
		const d = new frappe.ui.Dialog({
			title: __('Schedule Coordination Meeting or Safety Briefing'),
			fields: [
				{ fieldname: 'meeting_type', label: __('Type'), fieldtype: 'Select', options: 'Toolbox Talk\nCoordination Meeting', default: 'Toolbox Talk' },
				{ fieldname: 'subject', label: __('Topic / Subject'), fieldtype: 'Data', reqd: 1 },
				{ fieldname: 'date', label: __('Date'), fieldtype: 'Date', default: (frappe.datetime && frappe.datetime.get_today) ? frappe.datetime.get_today() : new Date().toISOString().split('T')[0], reqd: 1 },
				{ fieldname: 'conductor', label: __('Conductor (Safety Officer / Host)'), fieldtype: 'Data', default: frappe.session.user_fullname || frappe.session.user || 'Administrator', reqd: 1 }
			],
			primary_action_label: __('Create Meeting'),
			primary_action(values) {
				frappe.call({
					method: 'construction_bim.api.project_studio.schedule_project_meeting',
					args: {
						project: self.currentProject,
						meeting_type: values.meeting_type,
						subject: values.subject,
						date: values.date,
						conductor: values.conductor
					}
				}).then(() => {
					d.hide();
					const label = values.meeting_type === 'Toolbox Talk' ? __('Toolbox talk scheduled.') : __('Coordination meeting scheduled.');
					self.loadProjectData(self.currentProject);
					if (self.currentTab === 'meetings') {
						setTimeout(() => self.renderMeetingsTab(), 150);
					}
				}).catch(err => {
					console.error('Error scheduling meeting:', err);
					frappe.msgprint(__('Error: ') + (err.message || err));
				});
			}
		});
		d.show();
	}

	// -------------------------------------------------------------------------
	// TAB 10: MEMBERS
	// -------------------------------------------------------------------------
	renderMembersTable() {
		const $tbody = $('#members-table-body');
		$tbody.empty();
		const members = (this.projectOverviewData && this.projectOverviewData.members) || [];

		if (members.length === 0) {
			$tbody.append('<tr><td colspan="4" class="text-center text-muted p-4"><small>No team members assigned to this project.</small></td></tr>');
			return;
		}

		members.forEach(m => {
			const fullName = m.full_name || m.user || 'Member';
			const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'MB';
			$tbody.append(`
				<tr class="member-table-row">
					<td>
						<div class="member-cell">
							<span class="member-avatar-circle">${escapeHtml(initials)}</span>
							<span class="member-name font-weight-medium">${escapeHtml(fullName)}</span>
						</div>
					</td>
					<td><span class="text-muted">${escapeHtml(m.user)}</span></td>
					<td><span class="member-role-pill">${escapeHtml(m.role || 'Member')}</span></td>
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

	toggleArchiveProject() {
		const self = this;
		const proj = this.allProjects.find(p => p.name === this.currentProject);
		const currentActive = proj ? proj.is_active : 'Yes';
		const nextActive = currentActive === 'Yes' ? 'No' : 'Yes';
		const actionWord = nextActive === 'No' ? __('Archive') : __('Restore');

		frappe.confirm(__('Are you sure you want to {0} this project?', [actionWord.toLowerCase()]), () => {
			self.updateProjectSettingsField(self.currentProject, { is_active: nextActive }).then(() => {
				frappe.show_alert({ message: __('Project {0}d successfully.', [actionWord.toLowerCase()]), indicator: 'orange' });
				self.loadProjectsList().then(() => {
					self.switchTab('all-projects');
				});
			});
		});
	}

	confirmDeleteProject() {
		const self = this;
		frappe.confirm(__('⚠️ Are you sure you want to PERMANENTLY DELETE {0}? This cannot be undone.', [self.currentProject]), () => {
			frappe.call({
				method: 'frappe.client.delete',
				args: {
					doctype: 'Project',
					name: self.currentProject
				}
			}).then(() => {
				frappe.show_alert({ message: __('Project deleted.'), indicator: 'red' });
				self.loadProjectsList().then(() => {
					self.switchTab('all-projects');
				});
			});
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
			if (self.page && self.page.set_indicator) {
				const color = newHealth === 'On Track' ? 'green' : (newHealth === 'At Risk' ? 'orange' : 'red');
				self.page.set_indicator(newHealth, color);
			}
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