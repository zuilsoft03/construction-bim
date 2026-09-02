import frappe
frappe.init("local.dev")
frappe.connect()
r = frappe.db.sql("SELECT name, model_name, original_file, geometry_file, status FROM `tabBIM Model` ORDER BY creation DESC LIMIT 3", as_dict=True)
for row in r:
    print(row)
