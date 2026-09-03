"""Verify production ifc_geometry.extract_all on the small STRUCTURAL file."""
import sys
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()

tree = ip.parse_ifc_text(text)
els = tree["elements"]
print("parsed elements:", len(els), "length_scale:", tree["length_scale"])

res = ig.extract_all(text, els, tree["length_scale"])
print("elements with real geometry:", len(res))

xs=[]; ys=[]; zs=[]
for eid, g in res.items():
    for v in g["vertices"]:
        xs.append(v[0]); ys.append(v[1]); zs.append(v[2])
if xs:
    print("WORLD BBOX x", min(xs), max(xs))
    print("WORLD BBOX y", min(ys), max(ys))
    print("WORLD BBOX z", min(zs), max(zs))

# sample one element detail
eid0 = next(iter(res))
g = res[eid0]
print("sample ifc_id:", eid0, "nverts:", len(g["vertices"]))
xs=[v[0] for v in g["vertices"]]; ys=[v[1] for v in g["vertices"]]; zs=[v[2] for v in g["vertices"]]
print("  local bbox x", min(xs), max(xs), "y", min(ys), max(ys), "z", min(zs), max(zs))
