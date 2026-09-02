"""Check the STRUCTURAL file's element placements — are they really at origin,
or is the parser's placement chain walk incomplete?"""
import sys
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()
tree = ip.parse_ifc_text(text)
els = tree["elements"]

# distribution of placements
from collections import Counter
c = Counter()
for el in els:
    p = el["placement"]
    key = (round(p[0],1), round(p[1],1), round(p[2],1))
    c[key] += 1
print("distinct placement origins:", len(c))
print("top-10 most common placements:")
for k, v in c.most_common(10):
    print(f"  {k}: {v} elements")

# how many at exact origin?
at_origin = sum(v for k, v in c.items() if abs(k[0])<0.5 and abs(k[1])<0.5 and abs(k[2])<0.5)
print("elements at ~origin:", at_origin, "of", len(els))
