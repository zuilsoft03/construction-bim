"""Binary glTF 2.0 (GLB) writer — pure Python.

Builds a GLB of one mesh node per BIM element so the browser viewer can load
it with three.js GLTFLoader and match a picked mesh back to its BIM Element
row by node name (``e<ifc_id>`` == the parser's ``mesh_ref``).

Two geometry sources, in priority order:
  1. **Real** vertex meshes from :mod:`ifc_geometry` (IFC4 ``IFCEXTRUDEDAREASOLID``
     / ``IFCRECTANGLEPROFILEDEF`` prisms in world coordinates) — the building
     actually looks like a building.
  2. **Box fallback** from placement + quantities (OCEP's own text-fallback
     behaviour) for elements without recoverable geometry, so an import never
     comes back empty.

Every node is authored in IFC Z-up world metres; the root node applies a
-90° X rotation so the model stands Y-up in glTF/three.js space. Each element
gets its **own** bufferViews/accessors/mesh (non-indexed triangles with flat
per-face normals), so picking and per-element selection work correctly.

GLB layout (glTF 2.0 binary):
  - 12-byte header: magic 0x46546C67 ("glTF"), version 2, total length
  - chunk 0: JSON (4-byte length, type 0x4E4F534A "JSON", SPACE-padded)
  - chunk 1: BIN  (4-byte length, type 0x004E4942 "BIN\\0")
"""

from __future__ import annotations

import json
import math
import struct
from typing import Any

GLB_MAGIC = 0x46546C67
GLB_VERSION = 2
CHUNK_JSON = 0x4E4F534A
CHUNK_BIN = 0x004E4942

COMPONENT_FLOAT = 5126
TYPE_VEC3 = "VEC3"

# X rotation of -90 degrees (Z-up IFC -> Y-up glTF)
ROOT_ROTATION = [-0.7071067811865476, 0.0, 0.0, 0.7071067811865476]

# Discipline -> vertex colour (sRGB-ish, same family as OCEP's palette)
DISCIPLINE_COLORS = {
    "architecture": (0.42, 0.72, 0.90),   # light blue
    "structure":    (0.95, 0.60, 0.22),   # orange
    "mep":          (0.45, 0.80, 0.45),   # green
    "civil":        (0.75, 0.60, 0.85),   # purple
    "interior":     (0.95, 0.85, 0.35),   # yellow
    "landscape":    (0.40, 0.70, 0.50),   # teal
    "other":        (0.75, 0.75, 0.78),   # grey
}
DEFAULT_COLOR = (0.75, 0.75, 0.78)


# --------------------------------------------------------------------------
# Geometry builders — both return non-indexed (positions, normals) in world Z-up metres
# --------------------------------------------------------------------------

def _box_geometry(center: list[float], size: list[float]) -> tuple[list[list[float]], list[list[float]]]:
    """Return (positions, normals) for a box as 24 flat triangles (non-indexed)."""
    cx, cy, cz = center
    sx, sy, sz = size
    hx, hy, hz = sx / 2.0, sy / 2.0, sz / 2.0
    x0, x1 = cx - hx, cx + hx
    y0, y1 = cy - hy, cy + hy
    z0, z1 = cz - hz, cz + hz

    # 6 faces, each as two triangles (CCW outward), flat normal per face.
    quads = [
        (((x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)), (1, 0, 0)),
        (((x0, y0, z1), (x0, y1, z1), (x0, y1, z0), (x0, y0, z0)), (-1, 0, 0)),
        (((x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)), (0, 1, 0)),
        (((x0, y0, z1), (x1, y0, z1), (x1, y0, z0), (x0, y0, z0)), (0, -1, 0)),
        (((x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)), (0, 0, 1)),
        (((x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)), (0, 0, -1)),
    ]
    positions: list[list[float]] = []
    normals: list[list[float]] = []
    for quad, n in quads:
        p0, p1, p2, p3 = quad
        for tri in ((p0, p1, p2), (p0, p2, p3)):
            for p in tri:
                positions.append(list(p))
                normals.append(list(n))
    return positions, normals


def _triangulate(vertices: list[list[float]], faces: list[list[int]]) -> tuple[list[list[float]], list[list[float]]]:
    """Expand indexed triangles into non-indexed positions + flat face normals."""
    positions: list[list[float]] = []
    normals: list[list[float]] = []
    for tri in faces:
        if len(tri) < 3:
            continue
        a, b, c = vertices[tri[0]], vertices[tri[1]], vertices[tri[2]]
        ux = b[0] - a[0]; uy = b[1] - a[1]; uz = b[2] - a[2]
        vx = c[0] - a[0]; vy = c[1] - a[1]; vz = c[2] - a[2]
        nx = uy * vz - uz * vy
        ny = uz * vx - ux * vz
        nz = ux * vy - uy * vx
        nlen = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
        nn = [nx / nlen, ny / nlen, nz / nlen]
        for p in (a, b, c):
            positions.append(list(p))
            normals.append(list(nn))
    return positions, normals


def _element_geometry(el: dict[str, Any], geometry: dict | None) -> tuple[list[list[float]], list[list[float]]]:
    """Return (positions, normals) for one element in world Z-up metres.

    Uses the real mesh from ``geometry`` when present; otherwise falls back to a
    box shaped by placement + quantities (OCEP's text-fallback behaviour).
    """
    ifc_id = el.get("properties", {}).get("ifc_id")
    if geometry and ifc_id in geometry:
        g = geometry[ifc_id]
        if g.get("vertices"):
            return _triangulate(g["vertices"], g["faces"])

    # ---- box fallback ----
    placement = el.get("placement") or [0.0, 0.0, 0.0]
    q = el.get("quantities") or {}
    length = float(q.get("NominalLength") or q.get("Length") or 1.0)
    area = float(q.get("GrossArea") or q.get("NetArea") or 0.0)
    volume = float(q.get("NetVolume") or q.get("GrossVolume") or 0.0)
    width = float(q.get("NominalWidth") or 0.3)
    height = float(q.get("NominalHeight") or 0.3)
    depth = float(q.get("NominalDepth") or 0.3)
    if area and not (width > 1 and height > 1):
        side = area ** 0.5
        width, height, depth = side, side, 0.3
    if volume and length and not (width > 1 and height > 1):
        cross = volume / max(length, 1e-6)
        width = height = cross ** 0.5
    size = [max(width, 0.1), max(height, 0.1), max(depth, 0.1)]
    if length and length != 1.0:
        size[1] = max(length, 0.1)
    center = [float(placement[0]), float(placement[1]), float(placement[2])]
    return _box_geometry(center, size)


# --------------------------------------------------------------------------
# GLB assembly
# --------------------------------------------------------------------------

def build_glb(elements: list[dict[str, Any]], geometry: dict | None = None) -> bytes:
    """Build a GLB from parsed IFC elements (see ``ifc_parser.parse_ifc_text``).

    ``geometry`` is an optional ``{ifc_id: {vertices, faces}}`` map (world Z-up
    metres) from :func:`ifc_geometry.extract_all`; when provided, those real
    meshes are used and boxes only fill the gaps.
    """
    # 1) Build per-element vertex lists + node records.
    nodes: list[dict[str, Any]] = []
    spans: list[tuple[int, int]] = []          # (start_vertex, count) per node
    all_pos: list[float] = []
    all_nor: list[float] = []
    all_col: list[float] = []

    seen: set[str] = set()
    for el in elements:
        mesh_ref = el.get("mesh_ref") or f"e{len(nodes)}"
        if mesh_ref in seen:
            continue
        seen.add(mesh_ref)

        positions, normals = _element_geometry(el, geometry)
        color = DISCIPLINE_COLORS.get(str(el.get("discipline") or "other").lower(), DEFAULT_COLOR)

        start = len(all_pos) // 3
        for i in range(len(positions)):
            all_pos.extend(positions[i])
            all_nor.extend(normals[i])
            all_col.extend(color)
        count = len(positions)

        nodes.append({
            "name": str(mesh_ref),
            "mesh": len(nodes),
            "translation": [0.0, 0.0, 0.0],
        })
        spans.append((start, count))

    # 2) Pack the three vertex arrays into one binary buffer (4-byte aligned).
    def _pack(vals: list[float]) -> bytes:
        if not vals:
            return b""
        raw = struct.pack(f"<{len(vals)}f", *vals)
        return raw + b"\x00" * ((4 - (len(raw) % 4)) % 4)

    pos_bytes = _pack(all_pos)
    nor_bytes = _pack(all_nor)
    col_bytes = _pack(all_col)
    bin_blob = pos_bytes + nor_bytes + col_bytes

    # Byte offsets of each attribute array within the buffer.
    base_off = [0, len(pos_bytes), len(pos_bytes) + len(nor_bytes)]

    # 3) Per-element bufferViews + accessors (non-indexed VEC3). Each element is
    #    independently addressable -> correct picking / per-element selection.
    buffer_views: list[dict[str, Any]] = []
    accessors: list[dict[str, Any]] = []
    meshes: list[dict[str, Any]] = []

    for nd, (start, count) in zip(nodes, spans):
        if count == 0:
            continue
        p_off, p_len = start * 12, count * 12
        buffer_views.append({"buffer": 0, "byteOffset": base_off[0] + p_off, "byteLength": p_len, "target": 34962})
        buffer_views.append({"buffer": 0, "byteOffset": base_off[1] + p_off, "byteLength": p_len, "target": 34962})
        buffer_views.append({"buffer": 0, "byteOffset": base_off[2] + p_off, "byteLength": p_len, "target": 34962})
        vi = len(accessors)
        accessors.append({"bufferView": len(buffer_views) - 3, "componentType": COMPONENT_FLOAT, "count": count, "type": TYPE_VEC3})
        accessors.append({"bufferView": len(buffer_views) - 2, "componentType": COMPONENT_FLOAT, "count": count, "type": TYPE_VEC3})
        accessors.append({"bufferView": len(buffer_views) - 1, "componentType": COMPONENT_FLOAT, "count": count, "type": TYPE_VEC3})
        meshes.append({"primitives": [{"attributes": {"POSITION": vi, "NORMAL": vi + 1, "COLOR_0": vi + 2}}]})

    if not nodes:
        root_children: list[int] = []
    else:
        root_children = list(range(1, len(nodes) + 1))

    gltf: dict[str, Any] = {
        "asset": {"version": "2.0", "generator": "construction_bim"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{
            "name": "model",
            "rotation": ROOT_ROTATION,
            "children": root_children,
        }] + nodes,
        "meshes": meshes,
        "materials": [{
            "name": "BIM default",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.9,
            },
            "doubleSided": True,
        }],
        "buffers": [{"byteLength": len(bin_blob)}],
        "bufferViews": buffer_views,
        "accessors": accessors,
    }

    json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    # glTF spec: JSON chunk MUST be padded with trailing SPACE chars (0x20)
    json_bytes = json_bytes + b" " * ((4 - (len(json_bytes) % 4)) % 4)

    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_blob)
    out = bytearray()
    out += struct.pack("<III", GLB_MAGIC, GLB_VERSION, total_len)
    out += struct.pack("<II", len(json_bytes), CHUNK_JSON)
    out += json_bytes
    out += struct.pack("<II", len(bin_blob), CHUNK_BIN)
    out += bin_blob
    return bytes(out)
