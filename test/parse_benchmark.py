import sys, time
sys.path.insert(0, '.')
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig

files = [
    r'C:\Users\gavie\ERP\construction_bim\STRUCTURAL\IFC\STRUC_NordicLCA_Housing_Concrete_BuildingPermit.ifc',
    r'C:\Users\gavie\ERP\construction_bim\test\real\STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc',
]

for f in files:
    t0 = time.time()
    text = open(f, encoding='utf-8', errors='ignore').read()
    tree = ip.parse_ifc_text(text)
    els = tree['elements']
    geo = ig.extract_all(text, els, tree.get('length_scale', 0.001))
    dt = time.time() - t0
    fname = f.split('\\')[-1]
    print(fname, ':', len(els), 'elements,', len(geo), 'real geo, scale=', tree.get('length_scale'), 'time=', round(dt, 2), 's')
