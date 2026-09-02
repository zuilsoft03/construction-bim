"""Show #163 IFCINDEXEDPOLYCURVE and its target(s) raw args."""
import re
PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()
ents = {}
for m in re.finditer(r"#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;", text):
    ents[int(m.group(1))] = (m.group(2), m.group(3))

def refs(a):
    return [int(r) for r in re.findall(r"#(\d+)", a)]

print("#163 IFCINDEXEDPOLYCURVE args:", ents[163][1])
for x in refs(ents[163][1]):
    print("  ref", x, "->", ents[x][0] if x in ents else "?")
    if x in ents:
        print("     raw:", ents[x][1][:250])
