frappe.pages['project-studio'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Project Studio',
		single_column: true,
	});

	// Keep native Frappe page-head visible with clean padding
	page.page_head.show();
	page.body.css({ padding: '0', margin: '0', height: 'calc(100vh - 110px)' });
	$(wrapper).closest('.main-section').css({ padding: '0' });

	// Manage full-width studio mode on body to eliminate duplicate workspace sidebar
	$('body').addClass('in-project-studio');
	$('.body-sidebar, .body-sidebar-container, .layout-side-section, .desk-sidebar').hide();
	$('.layout-main-section').css({ width: '100%', 'max-width': '100%', flex: '1 1 100%', padding: '0' });

	// Listen to route changes to restore Frappe workspace sidebar when navigating away
	if (frappe.router && frappe.router.on) {
		frappe.router.on('change', function () {
			var r = frappe.get_route ? frappe.get_route() : [];
			if (r && r[0] === 'project-studio') {
				$('body').addClass('in-project-studio');
				$('.body-sidebar, .body-sidebar-container, .layout-side-section, .desk-sidebar').hide();
				$('.layout-main-section').css({ width: '100%', 'max-width': '100%', flex: '1 1 100%', padding: '0' });
			} else {
				$('body').removeClass('in-project-studio');
				$('.body-sidebar, .body-sidebar-container, .layout-side-section, .desk-sidebar').show();
				$('.layout-main-section').css({ width: '', 'max-width': '', flex: '', padding: '' });
			}
		});
	}

	// Load Font Awesome icons
	if (!document.getElementById('font-awesome-css')) {
		var fa = document.createElement('link');
		fa.id = 'font-awesome-css';
		fa.rel = 'stylesheet';
		fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
		document.head.appendChild(fa);
	}

	// Load Project Studio CSS
	if (!document.getElementById('project-studio-css')) {
		var link = document.createElement('link');
		link.id = 'project-studio-css';
		link.rel = 'stylesheet';
		link.href = '/assets/construction_bim/css/project_studio.css?v=' + Date.now();
		document.head.appendChild(link);
	}

	// Render page HTML template
	$(frappe.render_template('project_studio')).appendTo(page.body.addClass('no-border'));

	// Load ES module bundle dynamically
	import('/assets/construction_bim/js/project_studio.bundle.js?v=' + Date.now())
		.then(function (module) {
			console.log('Project Studio bundle loaded successfully.');
			if (window.ProjectStudioApp) {
				window.curProjectStudio = new window.ProjectStudioApp({ page: page, wrapper: wrapper });
			}
		})
		.catch(function (err) {
			console.error('Failed to load Project Studio bundle:', err);
		});
};

frappe.pages['project-studio'].on_page_show = function () {
	$('body').addClass('in-project-studio');
	$('.body-sidebar, .body-sidebar-container, .layout-side-section, .desk-sidebar').hide();
	$('.layout-main-section').css({ width: '100%', 'max-width': '100%', flex: '1 1 100%', padding: '0' });
};