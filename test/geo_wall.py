"""Verify wall #20065 end-to-end through production extractor:
expected profile ±0.56m, dist 2.93m, dir (0,0,1). Print raw + computed."""
import sys
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()
tree = ip.parse_ifc_text(text)
els = tree["elements"]

wall = next(e for e in els if e["properties"]["ifc_id"] == 20065)
print("wall #20065 placement:", wall["placement"])

ents = ig.parse_step(text)
sols = ig._element_solid(20065, ents)
print("solids:", sols)
g = sols[0]
a = ents[g][1]
import re as _re
_NUM = r"[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:[Ee][-+]?\d+)?"
nums = _re.findall(_NUM, a)
print("EAS raw args:", a[:80])
print("  nums parsed:", nums)

# what does the production function compute?
geo = ig.extract_element_geometry(20065, ents, wall["placement"], {}, tree["length_scale"])
if geo:
    xs=[v[0] for v in geo["vertices"]]; ys=[v[1] for v in geo["vertices"]]; zs=[v[2] for v in geo["vertices"]]
    print("computed world bbox x", round(min(xs),3), round(max(xs),3))
    print("  y", round(min(ys),3), round(max(ys),3))
    print("  z", round(min(zs),3), round(max(zs),3))
