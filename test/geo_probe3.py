"""DEFINITIVE frame test. For each element's first EAS, compute world-Z under
three hypotheses; print top floor clusters (3m bins). The hypothesis that
stacks floors at ~3m and matches the parser placement is correct."""
import re, sys, collections

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()

ents = {}
for m in re.finditer(r"#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;", text):
    ents[int(m.group(1))] = (m.group(2), m.group(3))

def refs(a):
    return [int(r) for r in re.findall(r"#(\d+)", a)]

sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
tree = ip.parse_ifc_text(text)
placements = {e["properties"]["ifc_id"]: e["placement"] for e in tree["elements"]}
print("parsed elements:", len(tree["elements"]), "length_scale:", tree["length_scale"])

# element -> first EAS (via PDS -> ShapeRep)
element_eas = {}
for eid, (t, a) in ents.items():
    if t not in ip._ELEMENT_TYPES:
        continue
    for r in refs(a):
        if r in ents and ents[r][0] == "IFCPRODUCTDEFINITIONSHAPE":
            ra = ents[r][1]
            for rp in refs(ra):
                if rp in ents and ents[rp][0] == "IFCSHAPEREPRESENTATION":
                    for g in refs(ents[rp][1]):
                        if g in ents and ents[g][0] == "IFCEXTRUDEDAREASOLID":
                            element_eas.setdefault(eid, []).append(g)
                    break

print("elements with EAS:", len(element_eas))

def eas_axis_pt(eas):
    for r in refs(ents[eas][1]):
        if r in ents and ents[r][0] == "IFCAXIS2PLACEMENT3D":
            for x in refs(ents[r][1]):
                if x in ents and ents[x][0] == "IFCCARTESIANPOINT":
                    nums = re.findall(r"[-+]?[\d.]+", ents[x][1])
                    if len(nums) >= 3:
                        return (float(nums[0]), float(nums[1]), float(nums[2]))
    return None

def eas_pts(eas):
    for r in refs(ents[eas][1]):
        if r in ents and ents[r][0].endswith("PROFILEDEF"):
            for x in refs(ents[r][1]):
                if x not in ents:
                    continue
                tx = ents[x][0]
                if tx.startswith("IFCCARTESIANPOINTLIST"):
                    return [(float(p[0]), float(p[1])) for p in
                            re.findall(r"\(\s*([-+]?[\d.]+)\s*,\s*([-+]?[\d.]+)\s*\)", ents[x][1])]
                if tx == "IFCINDEXEDPOLYCURVE":
                    for y in refs(ents[x][1]):
                        if y in ents and ents[y][0].startswith("IFCCARTESIANPOINTLIST"):
                            return [(float(p[0]), float(p[1])) for p in
                                    re.findall(r"\(\s*([-+]?[\d.]+)\s*,\s*([-+]?[\d.]+)\s*\)", ents[y][1])]
    return []

zA, zB, zC = [], [], []
for eid, lst in element_eas.items():
    pl = placements.get(eid)
    if not pl:
        continue
    for eas in lst[:1]:
        ap = eas_axis_pt(eas)
        pts = eas_pts(eas)
        if not pts or not ap:
            continue
        zA.append(pl[2] + ap[2])   # H-A elem + axis
        zB.append(ap[2])           # H-B axis only
        zC.append(pl[2])          # H-C elem only

def topclusters(vals, step=3000.0):
    c = collections.Counter()
    for v in vals:
        c[int(v // step)] += 1
    items = sorted(c.items(), key=lambda kv: -kv[1])[:6]
    return ", ".join(f"{int(k*step)}..{int((k+1)*step)}:{v}" for k, v in sorted(items))

for name, vals in (("H-A elem+axis", zA), ("H-B axis-only", zB), ("H-C elem-only", zC)):
    print(f"{name}: n={len(vals)} | top: {topclusters(vals)}")
