// Form script for BIM BOM Generator DocType
frappe.ui.form.on("BIM BOM Generator", {
	refresh(frm) {
		// Custom status indicators
		frm.page.set_indicator(
			frm.doc.status === "Submitted" ? "green" :
			frm.doc.status === "Generated" ? "blue" : "orange",
			frm.doc.status
		);

		if (frm.doc.model && frm.doc.target_item) {
			// Action: Preview BOM Lines
			frm.add_custom_button(__("Preview BOM Lines"), () => {
				frappe.call({
					method: "preview",
					doc: frm.doc,
					freeze: true,
					freeze_message: __("Calculating BIM quantities and pricing..."),
					callback(r) {
						if (r && r.message) {
							show_bom_preview_dialog(r.message);
						}
					}
				});
			}, __("Actions"));

			// Action: Generate ERPNext BOM
			frm.add_custom_button(__("Generate ERPNext BOM"), () => {
				frappe.confirm(
					__("Generate or update ERPNext BOM for Item <b>{0}</b> from model <b>{1}</b>?", [frm.doc.target_item, frm.doc.model]),
					() => {
						frappe.call({
							method: "generate_bom",
							doc: frm.doc,
							freeze: true,
							freeze_message: __("Generating ERPNext BOM and traceability links..."),
							callback(r) {
								if (r && r.message) {
									frappe.show_alert({
										message: __("BOM {0} generated successfully!", [r.message.bom_name]),
										indicator: "green"
									});
									frm.reload_doc();
								}
							}
						});
					}
				);
			}, __("Actions"));
		}

		// Link to generated BOM
		if (frm.doc.generated_bom) {
			frm.add_custom_button(__("Open BOM Document"), () => {
				frappe.set_route("Form", "BOM", frm.doc.generated_bom);
			});
		}
	},

	model(frm) {
		if (frm.doc.model) {
			frappe.call({
				method: "construction_bim.api.bom_integration.get_model_quantity_summary",
				args: { model: frm.doc.model },
				callback(r) {
					if (r && r.message) {
						frm.set_value("summary_json", JSON.stringify(r.message, null, 2));
					}
				}
			});
		}
	}
});

function show_bom_preview_dialog(data) {
	const items = data.items || [];
	let rowsHtml = "";
	items.forEach(it => {
		rowsHtml += `
			<tr>
				<td><b>${frappe.utils.escape_html(it.category || "")}</b></td>
				<td>${frappe.utils.escape_html(it.item_code || "")}</td>
				<td class="text-right">${it.raw_quantity}</td>
				<td class="text-right">${it.waste_pct}%</td>
				<td class="text-right"><b>${it.qty}</b> ${it.uom}</td>
				<td class="text-right">${format_currency(it.rate)}</td>
				<td class="text-right"><b>${format_currency(it.amount)}</b></td>
			</tr>
		`;
	});

	const html = `
		<div style="max-height: 450px; overflow-y: auto;">
			<table class="table table-bordered table-sm table-striped">
				<thead>
					<tr class="text-muted">
						<th>Category</th>
						<th>Item Code</th>
						<th class="text-right">Net Qty</th>
						<th class="text-right">Waste %</th>
						<th class="text-right">Billed Qty</th>
						<th class="text-right">Rate</th>
						<th class="text-right">Amount</th>
					</tr>
				</thead>
				<tbody>
					${rowsHtml || '<tr><td colspan="7" class="text-center text-muted">No items calculated</td></tr>'}
				</tbody>
				<tfoot>
					<tr style="background: #f8f9fa; font-size: 1.1em;">
						<th colspan="6" class="text-right">Total Estimated Cost:</th>
						<th class="text-right text-primary">${format_currency(data.total_cost || 0)}</th>
					</tr>
				</tfoot>
			</table>
		</div>
	`;

	const d = new frappe.ui.Dialog({
		title: __("BOM Quantity Takeoff Preview — {0}", [data.model]),
		size: "large",
		fields: [
			{
				fieldtype: "HTML",
				fieldname: "preview_html",
				options: html
			}
		],
		primary_action_label: __("Close"),
		primary_action() {
			d.hide();
		}
	});
	d.show();
}
