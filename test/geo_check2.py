"""Check why only 8/2137 get geometry. Sample several elements, print whether
_element_solid finds an EAS and whether _profile_points returns pts."""
import re, sys
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()
ents = {}
for m in re.finditer(r"#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;", text):
    ents[int(m.group(1))] = (m.group(2), m.group(3))

tree = ip.parse_ifc_text(text)
els = tree["elements"]
print("total elements:", len(els))

# Count how many have an EAS via _element_solid
with_solid = 0
no_solid = 0
for el in els:
    eid = el["properties"]["ifc_id"]
    sols = ig._element_solid(eid, ents)
    if sols:
        with_solid += 1
    else:
        no_solid += 1
print("elements with EAS via _element_solid:", with_solid)
print("elements without EAS:", no_solid)

# Now check: of the ones WITH an EAS, how many return geometry from extract_all?
res = ig.extract_all(text, els, tree["length_scale"])
print("extract_all result count:", len(res))
