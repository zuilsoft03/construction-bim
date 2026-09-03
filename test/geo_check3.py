"""For each element with an EAS, check WHY _profile_points returns empty.
Print the first 12 failures' chain shapes."""
import re, sys
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()
ents = {}
for m in re.finditer(r"#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;", text):
    ents[int(m.group(1))] = (m.group(2), m.group(3))

def refs(a):
    return [int(r) for r in re.findall(r"#(\d+)", a)]

tree = ip.parse_ifc_text(text)
els = tree["elements"]

shown = 0
for el in els:
    eid = el["properties"]["ifc_id"]
    sols = ig._element_solid(eid, ents)
    if not sols:
        continue
    g = sols[0]
    a = ents[g][1]
    r = refs(a)
    # find prof_def among EAS refs
    prof_def = None
    for x in r:
        if x in ents and ents[x][0].endswith("PROFILEDEF"):
            prof_def = x
            break
    pts = ig._profile_points(prof_def, ents) if prof_def else []
    if len(pts) < 3:
        shown += 1
        print(f"element {eid}: EAS #{g} args={a[:80]}")
        print(f"  refs: {r}")
        for x in r:
            if x in ents:
                print(f"    #{x} -> {ents[x][0]}")
        if prof_def:
            pa = ents[prof_def][1]
            print(f"  PROFILEDEF #{prof_def} args={pa[:80]}")
            for y in refs(pa):
                if y in ents:
                    print(f"    ref #{y} -> {ents[y][0]}")
        else:
            print("  NO PROFILEDEF ref found!")
        if shown >= 6:
            break
