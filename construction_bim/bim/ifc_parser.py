"""IFC STEP-21 text parser — pure Python, no IfcOpenShell.

Extracts building elements, storeys, disciplines, properties, quantities and
placements from a STEP-21 (ISO 10303-21) IFC file so an ERPNext site can
import BIM models with stdlib only.

Pipeline:
1. Strip ``/* ... */`` comments; escape doubled apostrophes (STEP-21 escaped
   quotes) before regex tokenisation.
2. Split on ``;`` (not newlines — exporters write multi-line entities).
3. Parse each ``#N=TYPE(args);`` into {id, type, args_raw, strings}.
4. Resolve the unit assignment (IFCUNITASSIGNMENT) to canonical SI metres.
5. Extract storeys + spatial containment (IFCRELCONTAINEDINSPATIALSTRUCTURE).
6. Extract building elements from the known element-type set, with
   properties (IFCPROPERTYSET) and quantities (IFCELEMENTQUANTITY).
7. Resolve placements (IFCLOCALPLACEMENT + IFCCARTESIANPOINT) so generated
   box geometry lands in real coordinates.

Output: list of element dicts consumable by :func:`glb_writer.build_glb` and
the BIM Element DocType.
"""

from __future__ import annotations

import hashlib
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# Placeholder used for doubled-apostrophes (STEP-21 escaped quotes).
_STEP_DOUBLE_QUOTE_PLACEHOLDER = "\x00DQ\x00"

# IFC entity types treated as building elements (IFC2x3 + IFC4 + IFC4x3).
_ELEMENT_TYPES = {
    "IFCWALL", "IFCWALLSTANDARDCASE", "IFCWALLELEMENTEDCASE",
    "IFCSLAB", "IFCSLABSTANDARDCASE", "IFCSLABELEMENTEDCASE",
    "IFCCOLUMN", "IFCCOLUMNSTANDARDCASE",
    "IFCBEAM", "IFCBEAMSTANDARDCASE",
    "IFCDOOR", "IFCDOORSTANDARDCASE", "IFCWINDOW", "IFCWINDOWSTANDARDCASE",
    "IFCROOF", "IFCSTAIR", "IFCSTAIRFLIGHT", "IFCRAMP", "IFCRAMPFLIGHT",
    "IFCRAILING", "IFCCURTAINWALL", "IFCPLATE", "IFCMEMBER", "IFCFOOTING",
    "IFCPILE", "IFCCHIMNEY", "IFCSHADINGDEVICE", "IFCBUILDINGELEMENT",
    "IFCBUILDINGELEMENTPROXY", "IFCBUILDINGELEMENTPART",
    "IFCELEMENTASSEMBLY", "IFCDISCRETEACCESSORY", "IFCFASTENER",
    "IFCMECHANICALFASTENER", "IFCREINFORCINGBAR", "IFCREINFORCINGMESH",
    "IFCFLOWSEGMENT", "IFCFLOWFITTING", "IFCFLOWTERMINAL",
    "IFCFLOWCONTROLLER", "IFCFLOWMOVINGDEVICE", "IFCFLOWSTORAGEDEVICE",
    "IFCDISTRIBUTIONCHAMBERELEMENT", "IFCDISTRIBUTIONCONTROLELEMENT",
    "IFCDISTRIBUTIONELEMENT", "IFCDUCTSEGMENT", "IFCDUCTFITTING",
    "IFCPIPESEGMENT", "IFCPIPEFITTING", "IFCELECTRICAPPLIANCE",
    "IFCELECTRICDISTRIBUTIONPOINT", "IFCLIGHTFIXTURE", "IFCSWITCHINGDEVICE",
    "IFCAIRTERMINAL", "IFCBOILER", "IFCCHILLER", "IFCPUMP", "IFCTANK",
    "IFCVALVE", "IFCSANITARYTERMINAL", "IFCSPACE", "IFCSPACETYPE",
    "IFCFURNISHINGELEMENT", "IFCTRANSPORTELEMENT", "IFCCOVERING",
    "IFCPROJECTIONELEMENT", "IFCVIRTUALELEMENT", "IFCOPENINGELEMENT",
    "IFCFEATUREELEMENT", "IFCBUILDINGSYSTEM", "IFCDISTRIBUTIONSYSTEM",
    "IFCSPACE", "IFCSPACETYPE",
}

# Entity types that represent a storey (IFC4x3 facility parts included).
_STOREY_TYPES = {
    "IFCBUILDINGSTOREY",
    "IFCBUILDING",  # buildings act as fallback spatial containers
    "IFCSPATIALZONE",
    "IFCFACILITY", "IFCFACILITYPART",
}

# Entity types treated as property sets / quantities containers.
_PROPERTY_SET_REL = "IFCRELDEFINESBYPROPERTIES"
_QUANTITY_SET_REL = "IFCRELDEFINESBYPROPERTIES"

# Simple regex for one STEP statement:  #123 = TYPE ( args ) ;
_LINE_RE = re.compile(r"^#(\d+)\s*=\s*(\w+)\s*\((.*)\)\s*;?\s*$", re.DOTALL)
# STEP-21 string bodies are SINGLE-quoted: 'text' ('' = escaped quote)
_STRING_RE = re.compile(r"'([^']*)'")
# STEP enum values: .MILLI. .METRE. etc.
_ENUM_RE = re.compile(r"\.([A-Z0-9_]+)\.")


# --------------------------------------------------------------------------
# STEP-21 string decoding
# --------------------------------------------------------------------------

def _decode_step_string(s: str) -> str:
    """Decode one STEP string body: restore escaped quotes, unescape \\X2 etc."""
    s = s.replace(_STEP_DOUBLE_QUOTE_PLACEHOLDER, "'")
    # Basic \\X2\\ (UCS-2) and \\X4\\ (UCS-4) unicode escapes — best effort.
    def _x2(m: "re.Match[str]") -> str:
        try:
            return "".join(chr(int(m.group(i), 16)) for i in range(1, m.lastindex + 1) if m.group(i))
        except (ValueError, OverflowError):
            return m.group(0)

    s = re.sub(r"\\\\X2\\\\([0-9A-Fa-f]{4})+\\\\?", lambda m: _x2(m), s)
    return s


# --------------------------------------------------------------------------
# Parsing
# --------------------------------------------------------------------------

def parse_entities(content: str) -> dict[int, dict]:
    """Parse all STEP-21 entities from raw file text."""
    content_clean = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
    content_clean = content_clean.replace("''", _STEP_DOUBLE_QUOTE_PLACEHOLDER)
    entities: dict[int, dict] = {}
    for raw in content_clean.split(";"):
        line = raw.strip()
        if not line.startswith("#"):
            continue
        m = _LINE_RE.match(line + ";")
        if m:
            eid = int(m.group(1))
            etype = m.group(2).upper()
            args_str = m.group(3)
            entities[eid] = {
                "id": eid,
                "type": etype,
                "args_raw": args_str,
                "strings": [_decode_step_string(s) for s in _STRING_RE.findall(args_str)],
            }
    return entities


def _refs(args_raw: str) -> list[int]:
    return [int(r) for r in re.findall(r"#(\d+)", args_raw)]


def _resolve_refs(args_raw: str, entities: dict[int, dict]) -> list[dict]:
    return [entities[r] for r in _refs(args_raw) if r in entities]


def _first_string(ent: dict, idx: int = 0) -> str:
    return ent["strings"][idx] if len(ent["strings"]) > idx else ""


# --------------------------------------------------------------------------
# Units → canonical SI
# --------------------------------------------------------------------------

_LENGTH_UNIT_PREFIX = {
    "MILLI": 0.001, "CENTI": 0.01, "DECI": 0.1, "": 1.0,
    "DECA": 10.0, "HECTO": 100.0, "KILO": 1000.0,
}


def _resolve_length_scale(entities: dict[int, dict]) -> float:
    """Return the scale factor to convert file LENGTHUNIT to metres."""
    scale = 1.0
    for ent in entities.values():
        if ent["type"] != "IFCUNITASSIGNMENT":
            continue
        for ref in _resolve_refs(ent["args_raw"], entities):
            t = ref["type"]
            if t == "IFCSIUNIT":
                # args: (*, .LENGTHUNIT., .MILLI., .METRE.) — enums, not strings.
                # With prefix: [LENGTHUNIT, MILLI, METRE]; without: [LENGTHUNIT, METRE]
                enums = _ENUM_RE.findall(ref["args_raw"])
                if enums and enums[0] == "LENGTHUNIT":
                    if len(enums) >= 3 and enums[2] == "METRE":
                        return _LENGTH_UNIT_PREFIX.get(enums[1], 1.0)
                    if len(enums) >= 2 and enums[1] == "METRE":
                        return 1.0
            elif t == "IFCCONVERSIONBASEDUNIT":
                scale = 1.0
    return scale


# --------------------------------------------------------------------------
# Placements
# --------------------------------------------------------------------------

def _extract_placements(entities: dict[int, dict], length_scale: float = 1.0) -> dict[int, list[float]]:
    """Map element entity id -> world [x, y, z] (metres, Z-up, right-handed).

    Approach: build CartesianPoint -> coords, then
    Axis2Placement3D/2D -> point, then IfcLocalPlacement -> resolved point by
    **walking the whole local-placement chain** (element's own axis point +
    every parent IFCLOCALPLACEMENT's axis point, per the IFC spec). This is what
    keeps e.g. Revit mullions (with multi-level placement chains) at their real
    world position instead of a raw local offset. Coordinates are rescaled to
    canonical metres at read time (issue #53).
    """
    placement_map: dict[int, tuple[float, float, float]] = {}
    _num = r"[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:[Ee][-+]?\d+)?"
    for eid, ent in entities.items():
        if ent["type"] == "IFCCARTESIANPOINT":
            nums = re.findall(_num, ent["args_raw"])
            if len(nums) >= 3:
                try:
                    placement_map[eid] = (
                        float(nums[0]) * length_scale,
                        float(nums[1]) * length_scale,
                        float(nums[2]) * length_scale,
                    )
                except ValueError:
                    pass
            elif len(nums) == 2:
                try:
                    placement_map[eid] = (
                        float(nums[0]) * length_scale,
                        float(nums[1]) * length_scale,
                        0.0,
                    )
                except ValueError:
                    pass

    axis_to_point: dict[int, tuple[float, float, float]] = {}
    for eid, ent in entities.items():
        if ent["type"] in ("IFCAXIS2PLACEMENT3D", "IFCAXIS2PLACEMENT2D"):
            refs = _refs(ent["args_raw"])
            if refs and refs[0] in placement_map:
                axis_to_point[eid] = placement_map[refs[0]]

    # IfcLocalPlacement args: [placement_rel_to (parent LP or $), axis2placement (local offset)]
    # Build: lp_id -> (parent_lp_id | None, local_point)
    lp_data: dict[int, tuple[int | None, tuple[float, float, float] | None]] = {}
    for eid, ent in entities.items():
        if ent["type"] == "IFCLOCALPLACEMENT":
            refs = _refs(ent["args_raw"])
            parent = None
            local = None
            for r in refs:
                if r in entities and entities[r]["type"] == "IFCLOCALPLACEMENT":
                    parent = r
                elif r in axis_to_point:
                    local = axis_to_point[r]
            lp_data[eid] = (parent, local)

    def resolve_lp(lp_id: int, memo: dict) -> tuple[float, float, float]:
        """Sum the local axis points down the chain: world = own + parent..."""
        if lp_id in memo:
            return memo[lp_id]
        parent, local = lp_data.get(lp_id, (None, None))
        if local is None:
            local = (0.0, 0.0, 0.0)
        if parent is not None:
            px, py, pz = resolve_lp(parent, memo)
            point = (local[0] + px, local[1] + py, local[2] + pz)
        else:
            point = local
        memo[lp_id] = point
        return point

    memo: dict[int, tuple[float, float, float]] = {}
    for lp_id in lp_data:
        resolve_lp(lp_id, memo)

    result: dict[int, list[float]] = {}
    for eid, ent in entities.items():
        for ref_id in _refs(ent["args_raw"]):
            if ref_id in memo:
                result[eid] = list(memo[ref_id])
                break
    return result


# --------------------------------------------------------------------------
# Properties & quantities
# --------------------------------------------------------------------------

def _extract_properties_for_element(eid: int, entities: dict[int, dict]) -> dict[str, Any]:
    """Collect IFCPROPERTYSET values related to an element via
    IFCRELDEFINESBYPROPERTIES. Keys become 'Property Name'. Values are
    decoded primitives (str/float/int/bool or None)."""
    props: dict[str, Any] = {}
    for ent in entities.values():
        if ent["type"] != "IFCRELDEFINESBYPROPERTIES":
            continue
        refs = _refs(ent["args_raw"])
        if eid not in refs:
            continue
        # related objects first (index 0..n), then RelatingPropertyDefinition (last)
        if len(refs) < 2:
            continue
        prop_def = entities.get(refs[-1])
        if not prop_def:
            continue
        if prop_def["type"] == "IFCPROPERTYSET":
            for prefs in _resolve_refs(prop_def["args_raw"], entities):
                if prefs["type"] != "IFCPROPERTYSINGLEVALUE":
                    continue
                name = _first_string(prefs, 0)
                val = _decode_property_value(prefs, entities)
                if name and val is not None:
                    props[name] = val
    return props


def _decode_property_value(psv: dict, entities: dict[int, dict]) -> Any:
    """Decode an IFCPROPERTYSINGLEVALUE's value — either a #ref to a typed
    entity, or an inline typed literal like IFCLABEL('2HR') / IFCBOOLEAN(.T.)
    / IFCLENGTHMEASURE(5.0)."""
    refs = _refs(psv["args_raw"])
    if refs:
        target = entities.get(refs[-1])
        if target:
            return _decode_typed_value(target)

    # Inline typed literal: scan for IFC...(...) groups in the raw args.
    for m in re.finditer(r"(IFC[A-Z0-9_]+)\((.*?)\)", psv["args_raw"]):
        return _decode_typed_literal(m.group(1), m.group(2))
    return None


_STRING_TYPES = {
    "IFCLABEL", "IFCTEXT", "IFCIDENTIFIER", "IFCBOOLEAN", "IFCLOGICAL",
}
_NUMERIC_TYPES = {
    "IFCLENGTHMEASURE", "IFCAREAMEASURE", "IFCVOLUMEMEASURE",
    "IFCPLANEANGLEMEASURE", "IFCPOSITIVEINTEGER", "IFCINTEGER",
    "IFCREAL", "IFCMASSMEASURE", "IFCCURRENCY", "IFCTIMEMEASURE",
}


def _decode_typed_value(target: dict) -> Any:
    t = target["type"]
    if t in _STRING_TYPES:
        return _first_string(target, 0)
    if t in _NUMERIC_TYPES:
        nums = re.findall(r"[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?", target["args_raw"])
        try:
            return float(nums[0]) if nums else None
        except (ValueError, IndexError):
            return None
    if t == "IFCBOOLEAN":
        return _first_string(target, 0) == "T"
    return None


def _decode_typed_literal(ifc_type: str, body: str) -> Any:
    body = body.strip()
    if ifc_type in ("IFCBOOLEAN", "IFCLOGICAL"):
        return body.upper().strip(".") == "T"
    if ifc_type in _STRING_TYPES or body.startswith("'"):
        m = _STRING_RE.search(body)
        return m.group(1) if m else body.strip("'")
    nums = re.findall(r"[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?", body)
    try:
        return float(nums[0]) if nums else None
    except (ValueError, IndexError):
        return None


def _extract_quantities_for_element(eid: int, entities: dict[int, dict], length_scale: float) -> dict[str, float]:
    """Collect IFCELEMENTQUANTITY values via IFCRELDEFINESBYPROPERTIES.

    Returns {Name: value_in_canonical_SI} where lengths are scaled to metres.
    """
    quants: dict[str, float] = {}
    for ent in entities.values():
        if ent["type"] != "IFCRELDEFINESBYPROPERTIES":
            continue
        refs = _refs(ent["args_raw"])
        if eid not in refs or len(refs) < 2:
            continue
        prop_def = entities.get(refs[-1])
        if not prop_def or prop_def["type"] != "IFCELEMENTQUANTITY":
            continue
        for qref in _resolve_refs(prop_def["args_raw"], entities):
            qt = qref["type"]
            if qt not in (
                "IFCQUANTITYLENGTH", "IFCQUANTITYAREA", "IFCQUANTITYVOLUME",
                "IFCQUANTITYCOUNT", "IFCQUANTITYWEIGHT", "IFCQUANTITYTIME",
            ):
                continue
            name = _first_string(qref, 0)
            nums = re.findall(r"[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?", qref["args_raw"])
            if not nums:
                continue
            try:
                val = float(nums[-1])
            except ValueError:
                continue
            if qt == "IFCQUANTITYLENGTH":
                val *= length_scale
            elif qt == "IFCQUANTITYAREA":
                val *= length_scale ** 2
            elif qt == "IFCQUANTITYVOLUME":
                val *= length_scale ** 3
            quants[name] = round(val, 6)
    return quants


# --------------------------------------------------------------------------
# Classification
# --------------------------------------------------------------------------

_DISCIPLINE_MAP = [
    ("WALL", "architecture"), ("SLAB", "architecture"), ("COLUMN", "structure"),
    ("BEAM", "structure"), ("ROOF", "architecture"), ("STAIR", "architecture"),
    ("RAMP", "architecture"), ("RAILING", "architecture"), ("DOOR", "architecture"),
    ("WINDOW", "architecture"), ("CURTAINWALL", "architecture"), ("PLATE", "structure"),
    ("MEMBER", "structure"), ("FOOTING", "structure"), ("PILE", "structure"),
    ("REINFORCING", "structure"), ("FLOW", "mep"), ("DUCT", "mep"), ("PIPE", "mep"),
    ("ELECTRIC", "mep"), ("LIGHT", "mep"), ("SWITCH", "mep"), ("AIRTERMINAL", "mep"),
    ("BOILER", "mep"), ("CHILLER", "mep"), ("PUMP", "mep"), ("TANK", "mep"),
    ("VALVE", "mep"), ("SANITARY", "mep"), ("DISTRIBUTION", "mep"),
    ("FURNISHING", "interior"), ("COVERING", "architecture"), ("OPENING", "architecture"),
    ("SPACE", "architecture"), ("PROJECT", "project"), ("BUILDING", "project"),
    ("STOREY", "project"),
]

_TYPE_SIMPLIFY = {
    "IFCWALL": "Wall", "IFCWALLSTANDARDCASE": "Wall", "IFCWALLELEMENTEDCASE": "Wall",
    "IFCSLAB": "Slab", "IFCSLABSTANDARDCASE": "Slab", "IFCSLABELEMENTEDCASE": "Slab",
    "IFCCOLUMN": "Column", "IFCCOLUMNSTANDARDCASE": "Column",
    "IFCBEAM": "Beam", "IFCBEAMSTANDARDCASE": "Beam",
    "IFCDOOR": "Door", "IFCWINDOW": "Window", "IFCROOF": "Roof",
    "IFCSTAIR": "Stair", "IFCSTAIRFLIGHT": "Stair Flight",
    "IFCRAMP": "Ramp", "IFCRAMPFLIGHT": "Ramp Flight", "IFCRAILING": "Railing",
    "IFCCURTAINWALL": "Curtain Wall", "IFCPLATE": "Plate", "IFCMEMBER": "Member",
    "IFCFOOTING": "Footing", "IFCPILE": "Pile", "IFCCHIMNEY": "Chimney",
    "IFCSHADINGDEVICE": "Shading Device", "IFCBUILDINGELEMENTPROXY": "Element Proxy",
    "IFCBUILDINGELEMENTPART": "Element Part", "IFCELEMENTASSEMBLY": "Assembly",
    "IFCDISCRETEACCESSORY": "Accessory", "IFCFASTENER": "Fastener",
    "IFCMECHANICALFASTENER": "Mechanical Fastener", "IFCREINFORCINGBAR": "Rebar",
    "IFCREINFORCINGMESH": "Rebar Mesh",
    "IFCFLOWSEGMENT": "Flow Segment", "IFCFLOWFITTING": "Flow Fitting",
    "IFCFLOWTERMINAL": "Flow Terminal", "IFCFLOWCONTROLLER": "Flow Controller",
    "IFCFLOWMOVINGDEVICE": "Flow Moving Device", "IFCFLOWSTORAGEDEVICE": "Flow Storage",
    "IFCDISTRIBUTIONCHAMBERELEMENT": "Distribution Chamber",
    "IFCDISTRIBUTIONCONTROLELEMENT": "Distribution Control",
    "IFCDUCTSEGMENT": "Duct", "IFCDUCTFITTING": "Duct Fitting",
    "IFCPIPESEGMENT": "Pipe", "IFCPIPEFITTING": "Pipe Fitting",
    "IFCELECTRICAPPLIANCE": "Electric Appliance", "IFCLIGHTFIXTURE": "Light Fixture",
    "IFCSWITCHINGDEVICE": "Switch", "IFCAIRTERMINAL": "Air Terminal",
    "IFCBOILER": "Boiler", "IFCCHILLER": "Chiller", "IFCPUMP": "Pump",
    "IFCTANK": "Tank", "IFCVALVE": "Valve", "IFCSANITARYTERMINAL": "Sanitary Terminal",
    "IFCSPACE": "Space", "IFCFURNISHINGELEMENT": "Furniture",
    "IFCTRANSPORTELEMENT": "Transport Element", "IFCCOVERING": "Covering",
    "IFCOPENINGELEMENT": "Opening", "IFCBUILDINGELEMENT": "Building Element",
    "IFCPROJECT": "Project", "IFCBUILDING": "Building", "IFCBUILDINGSTOREY": "Storey",
}


def _classify_discipline(ifc_type: str) -> str:
    for token, disc in _DISCIPLINE_MAP:
        if token in ifc_type:
            return disc
    return "other"


def _simplify_type(ifc_type: str) -> str:
    return _TYPE_SIMPLIFY.get(ifc_type, ifc_type.replace("IFC", "").replace("_", " ").title())


# --------------------------------------------------------------------------
# Main entry
# --------------------------------------------------------------------------

def parse_ifc_text(content: str) -> dict[str, Any]:
    """Parse IFC text and return:
    {
      elements: [{stable_id, element_type, name, storey, discipline,
                  properties, quantities, placement, geometry_hash, mesh_ref,
                  is_spatial}],
      storeys: [str], disciplines: [str], length_scale: float,
      element_count: int
    }
    """
    if not content.strip().startswith("ISO-10303-21"):
        raise ValueError("File does not appear to be a STEP-21 IFC file")

    entities = parse_entities(content)
    length_scale = _resolve_length_scale(entities)

    # Storeys
    storeys: dict[int, str] = {}
    for eid, ent in entities.items():
        if ent["type"] in _STOREY_TYPES:
            storeys[eid] = _first_string(ent, 1) or f"{ent['type']}-{eid}"

    # Spatial containment
    element_to_storey: dict[int, str] = {}
    for ent in entities.values():
        if ent["type"] == "IFCRELCONTAINEDINSPATIALSTRUCTURE":
            refs = _refs(ent["args_raw"])
            if refs:
                spatial_id = refs[-1]
                storey_name = storeys.get(spatial_id, "")
                for ref_str in refs[:-1]:
                    if ref_str in entities and storey_name:
                        element_to_storey[ref_str] = storey_name

    # Placements
    placements = _extract_placements(entities, length_scale)

    elements: list[dict[str, Any]] = []
    storeys_set: set[str] = set()
    disciplines_set: set[str] = set()

    for eid, ent in entities.items():
        if ent["type"] not in _ELEMENT_TYPES:
            continue
        strings = ent["strings"]
        global_id = strings[0] if strings else f"{ent['type']}-{eid}"
        name = strings[1] if len(strings) > 1 else ""
        ifc_type = ent["type"]
        discipline = _classify_discipline(ifc_type)
        storey = element_to_storey.get(eid, "")
        simplified_type = _simplify_type(ifc_type)

        if storey:
            storeys_set.add(storey)
        disciplines_set.add(discipline)

        properties = _extract_properties_for_element(eid, entities)
        properties.setdefault("ifc_type", ifc_type)
        properties.setdefault("ifc_id", eid)
        quantities = _extract_quantities_for_element(eid, entities, length_scale)

        geo_hash = hashlib.md5(f"{global_id}:{ifc_type}:{name}".encode()).hexdigest()[:16]

        elements.append({
            "stable_id": global_id,
            "element_type": simplified_type,
            "ifc_type": ifc_type,
            "name": name or simplified_type,
            "storey": storey or None,
            "discipline": discipline,
            "properties": properties,
            "quantities": quantities,
            "placement": placements.get(eid, [0.0, 0.0, 0.0]),
            "geometry_hash": geo_hash,
            "mesh_ref": f"e{eid}",
            "is_spatial": ent["type"] in _STOREY_TYPES,
        })

    return {
        "elements": elements,
        "storeys": sorted(storeys_set),
        "disciplines": sorted(disciplines_set),
        "length_scale": length_scale,
        "element_count": len(elements),
    }


def process_ifc_bytes(data: bytes) -> dict[str, Any]:
    """Process raw IFC bytes (utf-8 with fallback latin-1)."""
    try:
        content = data.decode("utf-8")
    except UnicodeDecodeError:
        content = data.decode("latin-1", errors="replace")
    return parse_ifc_text(content)
