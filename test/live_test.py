import frappe
frappe.init("local.dev")
frappe.connect()

files = frappe.get_all("File", filters={"file_name": ("like", "%.ifc")}, fields=["name","file_name","file_url"])
print("IFC files in site:", len(files))
target = None
for f in files:
    if "ARK_NordicLCA_Housing_Concrete" in f["file_name"] or "Concrete_BuildingPermit" in f["file_name"]:
        target = f
if not target and files:
    target = files[0]
print("target:", target["file_name"], "->", target["file_url"])

import sys
sys.path.insert(0, "/home/frappe/frappe-bench/apps/construction_bim")
from construction_bim.bim import api

res = api.create_model_from_ifc(file_url=target["file_url"], model_name="LIVE-GEOM-TEST")
print("RESULT:", res)
