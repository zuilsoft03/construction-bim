/**
 * Initializes the DWG/CAD viewer page and its navigation controls.
 * @param {HTMLElement} wrapper - The container in which to create the page.
 */
function initPage(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'DWG / CAD Viewer & BCF Collaboration',
		single_column: true,
	});

	page.add_inner_button('📍 ' + __('BIM Issues (BCF)'), function () {
		frappe.set_route('List', 'BIM Issue');
	});
	page.add_inner_button('🏢 ' + __('BIM 3D Viewer'), function () {
		frappe.set_route('bim-viewer');
	});
	page.add_inner_button('📐 ' + __('PDF Takeoff'), function () {
		frappe.set_route('pdf-takeoff');
	});

	// Ensure CSS stylesheet is present in head
	if (!document.getElementById('bim-viewer-css')) {
		var link = document.createElement('link');
		link.id = 'bim-viewer-css';
		link.rel = 'stylesheet';
		link.href = '/assets/construction_bim/css/bim_viewer.css?v=' + Date.now();
		document.head.appendChild(link);
	}

	// Render page template
	$(frappe.render_template('dwg_viewer')).appendTo(page.body.addClass('no-border'));

	// Load ES module bundle dynamically
	import('/assets/construction_bim/js/dwg_viewer.bundle.js?v=' + Date.now())
		.then(function () {
			console.log('DWG Viewer bundle loaded successfully.');
			if (window.initDWGViewer) {
				window.initDWGViewer();
			}
		})
		.catch(function (err) {
			console.error('Failed to load DWG Viewer bundle:', err);
			frappe.msgprint({
				title: __('DWG Viewer Error'),
				message: __('Failed to load CAD Viewer bundle: {0}', [err.message || err]),
				indicator: 'red',
			});
		});
}

/**
 * Refreshes the DWG viewer after the page becomes visible.
 * @param {HTMLElement} wrapper - The page wrapper.
 */
function onShow(wrapper) {
	setTimeout(function () {
		if (window.dwgApp && window.dwgApp.renderer) {
			window.dwgApp.renderer.resize();
			window.dwgApp.renderer.render();
		} else if (window.initDWGViewer) {
			window.initDWGViewer();
		}
	}, 150);
}

frappe.pages['dwg-viewer'] = frappe.pages['dwg-viewer'] || {};
frappe.pages['dwg-viewer'].on_page_load = initPage;
frappe.pages['dwg-viewer'].on_page_show = onShow;

frappe.pages['dwg_viewer'] = frappe.pages['dwg_viewer'] || {};
frappe.pages['dwg_viewer'].on_page_load = initPage;
frappe.pages['dwg_viewer'].on_page_show = onShow;
