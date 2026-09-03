"""Run inside the backend container: find uploaded IFC files + create a model
from the STRUCTURAL one via the live API path."""
import frappe
frappe.init_site()
frappe.set_site("local.dev")
frappe.connect()

files = frappe.get_all("File", filters={"file_name": ("like", "%.ifc")}, fields=["name","file_name","file_url"])
print("IFC files in site:", len(files))
for f in files:
    print(f"  {f['file_name']} -> {f['file_url']}")
