"""Full local test of the production import path (mirrors api.create_model_from_ifc):
parse -> extract_all -> build_glb, on BOTH real files. Check no errors + sizes."""
import sys, struct, json
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig
from construction_bim.bim import glb_writer as gw

for PATH in [
    r"C:\Users\gavie\ERP\construction_bim\test\real\STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc",
    r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc",
]:
    text = open(PATH, encoding="utf-8", errors="ignore").read()
    tree = ip.parse_ifc_text(text)
    els = tree["elements"]
    geo = ig.extract_all(text, els, tree["length_scale"])
    glb = gw.build_glb(els, geo)

    # validate GLB header
    magic, ver, total = struct.unpack_from("<III", glb, 0)
    ok = (magic == 0x46546C67 and ver == 2 and total == len(glb))
    jb = glb[20:20 + struct.unpack_from("<I", glb, 12)[0]].rstrip(b" ")
    g = json.loads(jb)
    print(f"{PATH.split('/')[-1][:18]}: {len(els)} el | geo {len(geo)} | GLB {len(glb)//1024}KB | "
          f"nodes {len(g['nodes'])-1} meshes {len(g['meshes'])} valid={ok}")
