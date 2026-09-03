import frappe, json
frappe.init("local.dev")
frappe.connect()
m = frappe.get_doc("BIM Model", "BIM-MODEL-2026-00012")
md = m.metadata
if isinstance(md, str):
    md = json.loads(md)
print("model:", m.name, "| elements:", m.element_count, "| storeys:", m.storey_count)
print("metadata.real_geometry_count:", md.get("real_geometry_count"))
print("status:", m.status, "| geometry_file:", m.geometry_file)
