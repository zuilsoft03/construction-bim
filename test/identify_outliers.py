import frappe
frappe.init("local.dev")
frappe.connect()

# what are the e225388-type elements (z~64m)
rows = frappe.db.sql("SELECT name, element_type, title, storey, discipline, mesh_ref FROM `tabBIM Element` WHERE model='BIM-MODEL-2026-00012' AND mesh_ref IN ('e225388','e225906','e226100')", as_dict=True)
for r in rows:
    print(r)
print("---")
# distribution by element_type for all elements in the model
rows2 = frappe.db.sql("SELECT element_type, COUNT(*) c FROM `tabBIM Element` WHERE model='BIM-MODEL-2026-00012' GROUP BY element_type ORDER BY c DESC LIMIT 15", as_dict=True)
for r in rows2:
    print(r)
