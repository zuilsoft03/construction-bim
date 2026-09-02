frappe.listview_settings['BIM Model'] = {
	onload: function(listview) {
		listview.page.add_inner_button(__('Open 3D BIM Viewer'), function() {
			frappe.set_route('bim-viewer');
		});
		listview.page.add_inner_button(__('PDF Takeoff'), function() {
			frappe.set_route('pdf-takeoff');
		});
	}
};
