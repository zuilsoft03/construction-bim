frappe.pages['bim-viewer'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'BIM Viewer',
		single_column: true,
	});

	page.add_inner_button(__('BIM Models'), function () {
		frappe.set_route('List', 'BIM Model');
	});

	// render the page markup (bim_viewer.html -> frappe.templates['bim_viewer'])
	$(frappe.render_template('bim_viewer')).appendTo(page.body.addClass('no-border'));

	// surface unbootstrapped errors to the status bar
	window.addEventListener('error', function (e) {
		var st = document.getElementById('bim-status');
		if (st) st.textContent = 'Error: ' + (e.message || e.error || 'unknown');
	});
	window.addEventListener('unhandledrejection', function (e) {
		var st = document.getElementById('bim-status');
		if (st) st.textContent = 'Rejection: ' + (e.reason && (e.reason.message || e.reason) || 'unknown');
	});

	// load the bundled app (three.js etc.) — plain module, boots on import
	// (cache bust with mtime so bundle updates always take effect)
	import('/assets/construction_bim/js/bim_viewer.bundle.js?v=' + Date.now()).then(function () {
		var st = document.getElementById('bim-status');
		if (st) st.textContent = 'Bundle loaded (' + new Date().toLocaleTimeString() + ')';
	}).catch(function (e) {
		console.error('bim_viewer bundle failed to load', e);
		frappe.msgprint({
			title: __('BIM Viewer Error'),
			message: __('Failed to load the 3D viewer bundle: {0}', [e.message || e]),
			indicator: 'red',
		});
	});
};
