import frappe, json
frappe.init("local.dev")
frappe.connect()
import sys
sys.path.insert(0, "/home/frappe/frappe-bench/apps/construction_bim")
from construction_bim.bim import api

res = api.create_model_from_ifc(
    file_url="/files/ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc",
    model_name="LIVE-GEOM-TEST-v2")
print("RESULT:", res)
