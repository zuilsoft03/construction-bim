frappe.pages['pdf-takeoff'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'PDF Takeoff',
		single_column: true,
	});

	// render the page markup (pdf_takeoff.html -> frappe.templates['pdf_takeoff'])
	$(frappe.render_template('pdf_takeoff')).appendTo(page.body.addClass('no-border'));

	// load the bundled app (pdf.js) — plain module, boots on import
	import('/assets/construction_bim/js/pdf_takeoff.bundle.js').catch(function (e) {
		console.error('pdf_takeoff bundle failed to load', e);
		frappe.msgprint({
			title: __('PDF Takeoff Error'),
			message: __('Failed to load the takeoff bundle: {0}', [e.message || e]),
			indicator: 'red',
		});
	});
};
