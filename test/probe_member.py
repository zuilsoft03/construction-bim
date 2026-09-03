"""Probe a member element's placement chain vs a wall's, to decide the fix:
members (mullions) land at z +/-64m; walls at z 0. Compare chains."""
import re

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()
ents = {}
for m in re.finditer(r"#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;", text):
    ents[int(m.group(1))] = (m.group(2), m.group(3))

def refs(a):
    return [int(r) for r in re.findall(r"#(\d+)", a)]

EID = 225388
if EID not in ents:
    print("entity not found:", EID)
else:
    t, a = ents[EID]
    print(f"#{EID} {t}")
    print("  args:", a[:150])
    for r in refs(a):
        if r in ents:
            print(f"  ref #{r} -> {ents[r][0]}: {ents[r][1][:100]}")

    # walk LP chain
    lp = [r for r in refs(a) if r in ents and ents[r][0] == "IFCLOCALPLACEMENT"]
    if lp:
        cur = lp[0]
        depth = 0
        while cur and depth < 6:
            lt, la = ents[cur]
            print(f"LP #{cur}: {la[:120]}")
            kids = refs(la)
            # axis point
            for k in kids:
                if k in ents and ents[k][0] == "IFCAXIS2PLACEMENT3D":
                    for p in refs(ents[k][1]):
                        if p in ents and ents[p][0] == "IFCCARTESIANPOINT":
                            print(f"    axis pt #{p}: {ents[p][1][:80]}")
            nxt = [k for k in kids if k in ents and ents[k][0] == "IFCLOCALPLACEMENT"]
            cur = nxt[0] if nxt else None
            depth += 1
