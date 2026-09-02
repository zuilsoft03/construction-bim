"""DEFINITIVE: run production ifc_geometry.extract_all on the ARCH file (the
real building). Check world bbox + per-storey Z stacking."""
import sys
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()

tree = ip.parse_ifc_text(text)
els = tree["elements"]
print("parsed elements:", len(els), "length_scale:", tree["length_scale"])

res = ig.extract_all(text, els, tree["length_scale"])
print("elements with real geometry:", len(res))

xs=[]; ys=[]; zs=[]
for g in res.values():
    for v in g["vertices"]:
        xs.append(v[0]); ys.append(v[1]); zs.append(v[2])
if xs:
    print("WORLD BBOX x", round(min(xs),1), round(max(xs),1))
    print("WORLD BBOX y", round(min(ys),1), round(max(ys),1))
    print("WORLD BBOX z", round(min(zs),1), round(max(zs),1))
    print("extent dx", round(max(xs)-min(xs),1), "dy", round(max(ys)-min(ys),1), "dz", round(max(zs)-min(zs),1))
