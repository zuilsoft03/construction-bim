frappe.ui.form.on('BIM Model', {
	refresh: function(frm) {
		if (!frm.is_new()) {
			frm.add_custom_button(__('Open in 3D Viewer'), function() {
				frappe.set_route('bim-viewer');
			}).addClass('btn-primary');
		}
	}
});
