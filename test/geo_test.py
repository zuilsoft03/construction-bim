import sys, re, json
sys.path.insert(0, ".")
from construction_bim.bim import ifc_geometry as ig

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"

text = open(PATH, encoding="utf-8", errors="ignore").read()
print("file size:", len(text))

result = ig.extract_all(text)
print("elements with real geometry:", len(result))

# Aggregate world bbox across all prisms
xs=[]; ys=[]; zs=[]
total_verts=0
for ifc_id, g in result.items():
    for p in g["prisms"]:
        for v in p["world"]:
            xs.append(v[0]); ys.append(v[1]); zs.append(v[2])
            total_verts+=1

if xs:
    print("WORLD BBOX x", min(xs), max(xs))
    print("WORLD BBOX y", min(ys), max(ys))
    print("WORLD BBOX z", min(zs), max(zs))
    print("total world verts:", total_verts)

# sample one element detail
sample_id = next(iter(result))
g = result[sample_id]
print("sample ifc_id:", sample_id)
print("  translation:", g["translation"])
for p in g["prisms"][:2]:
    import math
    xs=[v[0] for v in p["local"]]; ys=[v[1] for v in p["local"]]
    print("  prism local bbox: x", min(xs), max(xs), "y", min(ys), max(ys))
