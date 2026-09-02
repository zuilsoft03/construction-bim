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

	function loadScript(src) {
		return new Promise(function (resolve, reject) {
			var s = document.createElement('script');
			s.src = src + '?v=' + Date.now();
			s.onload = resolve;
			s.onerror = function () { reject(new Error('Script failed: ' + src)); };
			document.head.appendChild(s);
		});
	}

	// 1) engine core: web-ifc IIFE (window.WebIFC) + three/web-ifc bundle (window.IFCEngine)
	// 2) app code (reads the globals; no bundling of three/web-ifc inside)
	loadScript('/assets/construction_bim/js/webifc-api-iife.js')
		.then(function () { return loadScript('/assets/construction_bim/js/webifc.bundle.js'); })
		.then(function () { return import('/assets/construction_bim/js/bim_viewer.bundle.js?v=' + Date.now()); })
		.then(function () {
			var st = document.getElementById('bim-status');
			if (st) st.textContent = 'Bundle loaded (' + new Date().toLocaleTimeString() + ')';
		})
		.catch(function (e) {
			console.error('bim_viewer bundle failed to load', e);
			frappe.msgprint({
				title: __('BIM Viewer Error'),
				message: __('Failed to load the 3D viewer bundle: {0}', [e.message || e]),
				indicator: 'red',
			});
		});
};
