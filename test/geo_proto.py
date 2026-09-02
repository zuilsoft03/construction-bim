"""Prototype: extract real geometry from the ARCH IFC and check placement.

Chain: element -> IFCSTYLEDITEM -> ProductDefinitionShape -> ShapeRepresentation
-> (ExtrudedAreaSolid | PolygonalFaceSet) -> profile points + direction/distance.
"""
import re, sys, json

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"

text = open(PATH, encoding="utf-8", errors="ignore").read()
# strip comments
text_clean = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
ents = {}
LINE_RE = re.compile(r"^#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;?\s*$")
for raw in text_clean.split(";"):
    line = raw.strip()
    if not line.startswith("#"):
        continue
    m = LINE_RE.match(line + ";")
    if m:
        ents[int(m.group(1))] = (m.group(2).upper(), m.group(3))

def refs(s):
    return [int(r) for r in re.findall(r"#(\d+)", s)]

# 1. ExtrudedAreaSolid count + sample
ext = {eid: a for eid, (t, a) in ents.items() if t == "IFCEXTRUDEDAREASOLID"}
print("ExtrudedAreaSolid:", len(ext))

# 2. elements
elems = {eid: a for eid, (t, a) in ents.items() if t.startswith(("IFCWALL", "IFCSLAB", "IFCCOLUMN", "IFCBEAM"))}
print("wall/slab/column/beam elements:", len(elems))

# 3. styleditem -> shape chain for first element
sample_eid = next(iter(elems))
a = ents[sample_eid][1]
si_refs = refs(a)
styled_items = [r for r in si_refs if r in ents and ents[r][0].startswith("IFCSTYLEDITEM")]
print("element", sample_eid, "styled items:", styled_items[:2])

for si in styled_items:
    sa = ents[si][1]
    shape_refs = [r for r in refs(sa) if r in ents and ents[r][0].startswith(("IFCPRODUCTDEFINITIONSHAPE",))]
    print("  shapes:", [(r, ents[r][0]) for r in shape_refs][:3])
    for sh in shape_refs:
        ss = ents[sh][1]
        rep_refs = [r for r in refs(ss) if r in ents and ents[r][0].startswith("IFCSHAPEREPRESENTATION")]
        for rp in rep_refs:
            ra = ents[rp][1]
            geom_refs = [r for r in refs(ra) if r in ents]
            gtypes = [ents[g][0] for g in geom_refs if ents[g][0].startswith("IFC") and "POINT" not in ents[g][0]]
            print("    rep", rp, "->", gtypes[:4])

# 4. full walk of one extruded solid
for eid, a in list(ext.items())[:1]:
    print("sample extruded:", eid, a)
    r = refs(a)
    prof, dirn, dist = r[0], r[1], None
    nums = re.findall(r"[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?", a)
    print("  profile:", prof, "dir:", dirn, "dist(nums):", nums)
    pa = ents.get(prof, (None, None))[1] if prof in ents else None
    print("  profile entity:", ents.get(prof))
