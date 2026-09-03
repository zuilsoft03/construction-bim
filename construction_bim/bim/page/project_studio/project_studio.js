frappe.pages['project-studio'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Project Studio',
		single_column: true,
	});

	// Hide native Frappe page-head for pure full-screen OpenProject Studio look
	page.page_head.hide();
	$(page.wrapper).find('.page-head').hide();
	$(page.wrapper).find('.page-header').hide();
	page.body.css({ padding: '0', margin: '0', height: '100%' });
	$(wrapper).closest('.main-section').css({ padding: '0' });

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
				window.curProjectStudio = new window.ProjectStudioApp();
			}
		})
		.catch(function (err) {
			console.error('Failed to load Project Studio bundle:', err);
		});
};

frappe.pages['project-studio'].on_page_show = function () {
	if (window.curProjectStudio && window.curProjectStudio.init) {
		// Update URL routing if necessary
	}
};