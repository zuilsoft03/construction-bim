"""Analyze the LIVE GLB (BIM-MODEL-2026-00012): per-node z distribution; find
outlier nodes beyond +/-30m and identify real-geometry vs box nodes."""
import struct, json, sys, collections

PATH = r"C:\Users\gavie\ERP\construction_bim\test\real\LIVE-GEOM-TEST_BIM-MODEL-2026-00012.glb"
import os
if not os.path.exists(PATH):
    # fetch from site
    import urllib.request
    urllib.request.urlretrieve("http://localhost:8000/files/LIVE-GEOM-TEST_BIM-MODEL-2026-00012.glb", PATH)
print("file size:", os.path.getsize(PATH))
buf = open(PATH, "rb").read()
dv = struct.unpack_from("<III", buf, 0)
jlen = struct.unpack_from("<I", buf, 12)[0]
gltf = json.loads(buf[20:20+jlen].rstrip(b" ").decode("utf-8"))
bin_start = 20 + jlen + 8

acc, views, meshes, nodes = gltf["accessors"], gltf["bufferViews"], gltf["meshes"], gltf["nodes"]

node_z = []   # (name, verts, zmin, zmax, count)
for n in nodes:
    if n.get("mesh") is None or n.get("name") == "model":
        continue
    prim = meshes[n["mesh"]]["primitives"][0]
    a = acc[prim["attributes"]["POSITION"]]
    bv = views[a["bufferView"]]
    off = bin_start + (bv.get("byteOffset", 0))
    fa = struct.unpack_from(f"<{a['count']*3}f", buf, off)
    zmin = min(fa[2::3]); zmax = max(fa[2::3])
    node_z.append((n["name"], a["count"], zmin, zmax))

zs = [z for _,_,_,z in [(x[0],x[1],x[2],x[3]) for x in node_z]]
zmin_all = min(x[2] for x in node_z); zmax_all = max(x[3] for x in node_z)
print("nodes:", len(node_z), "| all z:", round(zmin_all,2), round(zmax_all,2))

# z histogram in 5m bins (only nodes whose extent is below 30m span => 'normal' elements)
bins = collections.Counter()
for name, cnt, zmin, zmax in node_z:
    if zmax - zmin > 30:  # bizarre extent
        continue
    bins[int(zmin // 5)] += 1
print("z bins (5m, node counts):", dict(sorted(bins.items())))

# outliers: z beyond [-10, 40]
out = [x for x in node_z if x[3] > 40 or x[2] < -10]
print("outlier nodes:", len(out))
for name, cnt, zmin, zmax in sorted(out, key=lambda x: -x[3])[:15]:
    print(f"  {name}: verts={cnt} z {round(zmin,1)}..{round(zmax,1)}")

# how many nodes are real-geometry (verts > 36 => more than a 36-vert box)
real = [x for x in node_z if x[1] > 36]
print("real-geometry nodes (>36 verts):", len(real))
