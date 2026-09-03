"""Validate chain-sum placements: z histogram of element placements + world bbox
of extracted geometry BEFORE/NOW on the ARCH file."""
import sys, collections
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()
tree = ip.parse_ifc_text(text)
els = tree["elements"]
print("elements:", len(els), "length_scale:", tree["length_scale"])

zs = collections.Counter()
for el in els:
    p = el["placement"]
    zs[int(p[2] // 3)] += 1
print("placement z histogram (3m bins, key=meters//3):")
for k in sorted(zs):
    print(f"  {k*3}..{k*3+3}m: {zs[k]}")

res = ig.extract_all(text, els, tree["length_scale"])
xs=[]; ys=[]; zs2=[]
for g in res.values():
    for v in g["vertices"]:
        xs.append(v[0]); ys.append(v[1]); zs2.append(v[2])
print("REAL GEOM elements:", len(res))
print("bbox x", round(min(xs),1), round(max(xs),1), "| y", round(min(ys),1), round(max(ys),1), "| z", round(min(zs2),1), round(max(zs2),1))
