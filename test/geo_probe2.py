"""Settle the world-frame question for IFCEXTRUDEDAREASOLID solids.
Resolve element #20065 placement through its full chain, then compute
building-wide extents under:
  H-A: world = element_placement + eas_axis_point + profile   (spec-correct)
  H-B: world = eas_axis_point + profile                       (eas already world)
and pick whichever yields a coherent building bbox."""
import re

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()

ents = {}
for m in re.finditer(r"#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;", text):
    ents[int(m.group(1))] = (m.group(2), m.group(3))

def refs(a):
    return [int(r) for r in re.findall(r"#(\d+)", a)]

def point_of(axis_id):
    """Return (x,y,z) of the IFCCARTESIANPOINT referenced by an IFCAXIS2PLACEMENT3D."""
    if axis_id not in ents:
        return None
    for r in refs(ents[axis_id][1]):
        if r in ents and ents[r][0] == "IFCCARTESIANPOINT":
            nums = re.findall(r"[-+]?[\d.]+", ents[r][1])
            if len(nums) >= 3:
                return (float(nums[0]), float(nums[1]), float(nums[2]))
    return None

def resolve_lp(eid, depth=0):
    """Walk IFCLOCALPLACEMENT chain to the world point (sum of axis points)."""
    total = [0.0, 0.0, 0.0]
    seen = set()
    cur = eid
    while cur in ents and ents[cur][0] == "IFCLOCALPLACEMENT":
        if cur in seen:
            break
        seen.add(cur)
        a = refs(ents[cur][1])
        # find the IFCAXIS2PLACEMENT3D ref (the local offset at this level)
        axis_pt = None
        for r in a:
            if r in ents and ents[r][0] == "IFCAXIS2PLACEMENT3D":
                p = point_of(r)
                if p:
                    axis_pt = p
                    break
        # find the parent IFCLOCALPLACEMENT ref (chain up)
        parent = None
        for r in a:
            if r in ents and ents[r][0] == "IFCLOCALPLACEMENT":
                parent = r
                break
        if axis_pt:
            total[0] += axis_pt[0]; total[1] += axis_pt[1]; total[2] += axis_pt[2]
        cur = parent
    return tuple(total)

# --- element #20065 placement ---
e = ents[20065]
lp_id = next(r for r in refs(e[1]) if r in ents and ents[r][0] == "IFCLOCALPLACEMENT")
el_place = resolve_lp(lp_id)
print("element #20065 IFCLOCALPLACEMENT id:", lp_id)
print("  resolved world placement (H-A base):", el_place)

# --- all EAS in the file: axis point + inline profile points ---
def inline_pts(listid):
    qa = ents[listid][1]
    return [(float(x), float(y)) for x, y in
            re.findall(r"\(\s*([-+]?[\d.]+)\s*,\s*([-+]?[\d.]+)\s*\)", qa)]

def eas_profile_pts(eas):
    a = ents[eas][1]
    rr = refs(a)
    # profile def is first ref (IFCARBITRARYCLOSEDPROFILEDEF or similar)
    profdef = next((r for r in rr if r in ents and ents[r][0].endswith("PROFILEDEF")), None)
    if not profdef:
        return None, None
    # profile def -> IFCINDEXEDPOLYCURVE -> IFCCARTESIANPOINTLIST2D (inline pts)
    idx = next((r for r in refs(ents[profdef][1]) if r in ents), None)
    plist = next((r for r in refs(ents[idx][1]) if r in ents and ents[r][0].startswith("IFCCARTESIANPOINTLIST")), None) if idx else None
    # axis: IFCAXIS2PLACEMENT3D ref (first non-profile ref usually)
    axis = next((r for r in rr if r in ents and ents[r][0] == "IFCAXIS2PLACEMENT3D"), None)
    ap = point_of(axis) if axis else None
    pts = inline_pts(plist) if plist else []
    return ap, pts

all_eas = {eid for eid, (t, a) in ents.items() if t == "IFCEXTRUDEDAREASOLID"}
print("total IFCEXTRUDEDAREASOLID:", len(all_eas))

xsA=[]; ysA=[]; zminA=9e9; zmaxA=-9e9
xsB=[]; ysB=[]; zminB=9e9; zmaxB=-9e9
n=0
for eid in all_eas:
    ap, pts = eas_profile_pts(eid)
    if not pts or not ap:
        continue
    # H-A: element placement + eas axis + profile  (need element placement per element; use this wall's as proxy for extent test)
    ax, ay, az = ap
    for p in pts:
        xsA.append(el_place[0]+ax+p[0]); ysA.append(el_place[1]+ay+p[1])
        zminA=min(zminA, el_place[2]+az); zmaxA=max(zmaxA, el_place[2]+az)
        # H-B: eas axis already world
        xsB.append(ax+p[0]); ysB.append(ay+p[1])
        zminB=min(zminB, az); zmaxB=max(zmaxB, az)
    n+=1

print("EAS with data:", n)
if xsA:
    print("H-A (element_place + eas_axis + profile):")
    print("  x", min(xsA), max(xsA))
    print("  y", min(ysA), max(ysA))
    print("  z", zminA, zmaxA)
print("H-B (eas_axis as world + profile):")
print("  x", min(xsB), max(xsB))
print("  y", min(ysB), max(ysB))
print("  z", zminB, zmaxB)
