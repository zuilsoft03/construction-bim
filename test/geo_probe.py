"""Walk #20117 (the 'Body' rep) + dump one IFCEXTRUDEDAREASOLID's full args,
its profile curve -> points, and its direction. Exact structure for the
production extractor."""
import re

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()

ents = {}
for m in re.finditer(r"#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;", text):
    ents[int(m.group(1))] = (m.group(2), m.group(3))

def refs(a):
    return [int(r) for r in re.findall(r"#(\d+)", a)]

def show(eid, indent=0, maxdepth=6):
    pad = "  " * indent
    if eid not in ents:
        print(pad + f"#{eid} <missing>")
        return
    t, a = ents[eid]
    r = refs(a)
    print(f"{pad}#{eid} {t}")
    print(f"{pad}  args: {a[:200]}")
    if indent < maxdepth and len(r) <= 14:
        for x in r:
            show(x, indent + 1, maxdepth)

print("=== BODY rep #20117 ===")
show(20117)

# Now grab ONE IFCEXTRUDEDAREASOLID from the Body rep and dump it fully
def find_eas(eid):
    if eid in ents and ents[eid][0] == "IFCEXTRUDEDAREASOLID":
        return eid
    for r in refs(ents.get(eid, (None,""))[1]):
        f = find_eas(r)
        if f:
            return f
    return None

# search from the Body shaperep
body_eas = None
for r in refs(ents[20117][1]):
    body_eas = find_eas(r)
    if body_eas:
        break
print("Body IFCEXTRUDEDAREASOLID id:", body_eas)
if body_eas:
    t, a = ents[body_eas]
    print("EAS args full:")
    print(a[:400])
    r = refs(a)
    print("  refs:", r)
    # profile is usually first ref; direction second; distance is a number in args
    prof = r[0]
    print(f"  profile #{prof}: {ents.get(prof, ('?',''))[0]}")
    pa = ents.get(prof, (None,""))[1] if prof in ents else ""
    print("  profile args:", pa[:200])
