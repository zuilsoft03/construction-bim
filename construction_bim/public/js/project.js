frappe.ui.form.on("Project", {
	refresh(frm) {
		if (frm.doc.custom_drive_folder) {
			frm.add_custom_button(__("Open in Drive"), () => {
				window.open(`/drive?folder=${encodeURIComponent(frm.doc.custom_drive_folder)}`, "_blank");
			});
		}
		frm.add_custom_button(__("🚀 Initiation Pipeline"), () =>
			frappe.set_route("bim-viewer", { project: frm.doc.name, mode: "initiation" }));
		frm.add_custom_button(__("BIM Models"), () =>
			frappe.set_route("List", "BIM Model", { project: frm.doc.name }));
		frm.add_custom_button(__("Open BIM Viewer"), () =>
			frappe.set_route("bim-viewer", { project: frm.doc.name, mode: "coordination" }));
	},
});
