"""Validate the new glb_writer: build GLB from STRUCTURAL file WITH real
geometry, check magic/chunks/per-node vertex counts + world bbox."""
import sys, struct, json, io
sys.path.insert(0, ".")
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim import ifc_geometry as ig
from construction_bim.bim import glb_writer as gw

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc"
text = open(PATH, encoding="utf-8", errors="ignore").read()
tree = ip.parse_ifc_text(text)
els = tree["elements"]
geo = ig.extract_all(text, els, tree["length_scale"])
print("real geometry elements:", len(geo))

glb = gw.build_glb(els, geo)
print("GLB bytes:", len(glb))

# validate header
magic, ver, total = struct.unpack_from("<III", glb, 0)
print("magic ok:", hex(magic), "ver:", ver, "total:", total, "== len:", total == len(glb))
jl = struct.unpack_from("<II", glb, 12)[0]
jtype = struct.unpack_from("<I", glb, 16 + jl)[0]
print("json chunk len/type ok:", jtype == 0x4E4F534A)

# parse the JSON chunk to inspect node/mesh structure
json_bytes = glb[20:20+jl].rstrip(b" ")
gltf = json.loads(json_bytes)
print("nodes:", len(gltf["nodes"]) - 1, "meshes:", len(gltf["meshes"]))
print("bufferViews:", len(gltf["bufferViews"]), "accessors:", len(gltf["accessors"]))

# spot check: node e-ids + per-node vertex count via accessors
first_mesh = gltf["meshes"][0]
acc_count = gltf["accessors"][first_mesh["primitives"][0]["attributes"]["POSITION"]]["count"]
print("first mesh POSITION accessor count (verts):", acc_count)

# world bbox from first real-geometry element's vertices
sample_id = next(iter(geo))
g = geo[sample_id]
xs=[v[0] for v in g["vertices"]]; ys=[v[1] for v in g["vertices"]]; zs=[v[2] for v in g["vertices"]]
print("sample", sample_id, "bbox x", round(min(xs),2), round(max(xs),2), "z", round(min(zs),2), round(max(zs),2))
