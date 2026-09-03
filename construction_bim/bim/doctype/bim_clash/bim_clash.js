// Form script for BIM Clash DocType
frappe.ui.form.on("BIM Clash", {
	refresh(frm) {
		// Custom status indicators
		frm.page.set_indicator(
			frm.doc.status === "Resolved" || frm.doc.status === "Closed" ? "green" :
			frm.doc.status === "In Review" ? "blue" : "orange",
			frm.doc.status
		);

		// Button: Open in 3D Viewer
		if (frm.doc.model_a) {
			frm.add_custom_button(__("Open in 3D Viewer"), () => {
				const models = [frm.doc.model_a];
				if (frm.doc.model_b && frm.doc.model_b !== frm.doc.model_a) {
					models.push(frm.doc.model_b);
				}
				const params = new URLSearchParams({
					models: models.join(","),
					clash: frm.doc.name,
					element_a: frm.doc.element_a_guid || frm.doc.guid_a || "",
					element_b: frm.doc.element_b_guid || frm.doc.guid_b || "",
				});
				frappe.set_route("bim-viewer", `?${params.toString()}`);
			}, __("Actions"));
		}

		// Quick status buttons
		if (frm.doc.status !== "Resolved" && frm.doc.status !== "Closed") {
			frm.add_custom_button(__("Resolve Clash"), () => {
				frappe.prompt([
					{
						fieldname: "resolution_type",
						fieldtype: "Select",
						label: __("Resolution Type"),
						options: "\nRerouted MEP\nModified Structural Opening\nAdjusted Dimension\nFalse Positive\nApproved Exception",
						reqd: 1,
					},
					{
						fieldname: "resolution_notes",
						fieldtype: "Small Text",
						label: __("Resolution Notes"),
					}
				], (values) => {
					frm.set_value("status", "Resolved");
					frm.set_value("resolution_type", values.resolution_type);
					frm.set_value("resolution_notes", values.resolution_notes);
					frm.save();
				}, __("Resolve Clash"), __("Mark Resolved"));
			}, __("Actions"));
		} else if (frm.doc.status === "Resolved") {
			frm.add_custom_button(__("Reopen Clash"), () => {
				frm.set_value("status", "Open");
				frm.save();
			}, __("Actions"));

			frm.add_custom_button(__("Close Clash"), () => {
				frm.set_value("status", "Closed");
				frm.save();
			}, __("Actions"));
		} else if (frm.doc.status === "Closed") {
			frm.add_custom_button(__("Reopen Clash"), () => {
				frm.set_value("status", "Open");
				frm.save();
			}, __("Actions"));
		}
	},

	model_a(frm) {
		if (frm.doc.model_a && !frm.doc.project) {
			frappe.db.get_value("BIM Model", frm.doc.model_a, "project", (r) => {
				if (r && r.project) {
					frm.set_value("project", r.project);
				}
			});
		}
	}
});
