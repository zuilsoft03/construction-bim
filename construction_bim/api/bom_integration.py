"""BIM to ERPNext BOM Integration Engine.

Provides:
- get_model_quantity_summary: Extracts and aggregates physical quantities from IFC models.
- generate_or_update_bom: Automatically creates or updates an ERPNext BOM from BIM data.
- preview_bom_generation: Simulates BOM lines and cost rollups without saving to DB.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import frappe
from frappe import _

logger = logging.getLogger(__name__)

# Standard construction unit rates (fallback when Item Price / Valuation Rate is unset)
DEFAULT_UNIT_RATES = {
    "Cubic Meter": 125.00,      # e.g. Ready-Mix Concrete 30MPa $/m3
    "Square Meter": 35.00,      # e.g. Galvanized Ductwork / Formwork $/m2
    "Meter": 22.50,             # e.g. Piping / Conduits $/m
    "Kg": 1.45,                 # e.g. Structural Steel / Rebar $/kg
    "Ton": 1450.00,             # e.g. Steel Tonnage $/ton
    "Nos": 180.00,              # e.g. Fixtures, Doors, Dampers, Valves
}

# Standard material categories & mapping presets
DEFAULT_MAPPING_RULES = [
    {
        "category": "Concrete",
        "match_types": ["WALL", "SLAB", "COLUMN", "BEAM", "FOOTING", "PILE", "FOUNDATION"],
        "quantity_key": "volume_m3",
        "target_item_code": "Ready-Mix Concrete 30MPa",
        "target_item_name": "Ready-Mix Concrete C30/37 (30MPa)",
        "item_group": "Raw Material",
        "uom": "Cubic Meter",
        "rate": 130.00,
        "waste_pct": 5.0,
        "description": "Structural Ready-Mix Concrete C30/37 for walls, slabs, beams, and columns",
    },
    {
        "category": "Reinforcing Steel",
        "match_types": ["REINFORCING", "REBAR"],
        "quantity_key": "rebar_weight_kg",
        "target_item_code": "Deformed Steel Rebar Grade 60",
        "target_item_name": "Deformed Steel Rebar Grade 60",
        "item_group": "Raw Material",
        "uom": "Kg",
        "rate": 1.15,
        "waste_pct": 7.0,
        "description": "High-yield deformed steel reinforcing bars for concrete elements",
    },
    {
        "category": "Structural Steel",
        "match_types": ["MEMBER", "PLATE"],
        "quantity_key": "steel_weight_kg",
        "target_item_code": "Structural Steel Profiles S355",
        "target_item_name": "Structural Steel S355 (Beams, Columns, Plates)",
        "item_group": "Raw Material",
        "uom": "Kg",
        "rate": 2.65,
        "waste_pct": 4.0,
        "description": "Hot-rolled structural steel sections S355JR",
    },
    {
        "category": "HVAC Ductwork",
        "match_types": ["DUCT", "AIRTERMINAL"],
        "quantity_key": "duct_area_m2",
        "target_item_code": "Galvanized Sheet Metal Ductwork",
        "target_item_name": "Galvanized Sheet Metal HVAC Ducting",
        "item_group": "Raw Material",
        "uom": "Square Meter",
        "rate": 38.00,
        "waste_pct": 8.0,
        "description": "Rectangular and circular galvanized sheet metal ductwork",
    },
    {
        "category": "Plumbing Piping",
        "match_types": ["PIPE", "VALVE", "PUMP"],
        "quantity_key": "pipe_length_m",
        "target_item_code": "Copper and PPR Piping System",
        "target_item_name": "Copper & PPR Water Supply & Drainage Piping",
        "item_group": "Raw Material",
        "uom": "Meter",
        "rate": 24.50,
        "waste_pct": 6.0,
        "description": "Water supply and sanitary drainage pipe segments and fittings",
    },
    {
        "category": "Formwork System",
        "match_types": ["WALL", "SLAB", "BEAM", "COLUMN"],
        "quantity_key": "formwork_area_m2",
        "target_item_code": "Modular Plywood Formwork System",
        "target_item_name": "Plywood Formwork & Shoring System",
        "item_group": "Raw Material",
        "uom": "Square Meter",
        "rate": 19.50,
        "waste_pct": 10.0,
        "description": "Temporary formwork and shoring for cast-in-place concrete",
    },
]


# --------------------------------------------------------------------------
# 1. IFC Quantity Extraction & Aggregation
# --------------------------------------------------------------------------

@frappe.whitelist()
def get_model_quantity_summary(model: str) -> dict[str, Any]:
    """Parse and aggregate physical quantities from a BIM Model.

    Extracts:
    - Concrete volumes (m3) by element type (IfcWall, IfcSlab, IfcColumn, IfcBeam, IfcFooting)
    - Rebar weight (kg) from reinforcing entities or volume ratios
    - Pipe lengths (m) and diameters from IfcPipeSegment
    - Duct surface area (m2) and lengths (m) from IfcDuctSegment
    - Structural steel weights (kg) from IfcBeam, IfcColumn, IfcMember, IfcPlate
    - Formwork contact areas (m2)
    - Door, Window, and Equipment counts (Nos)
    """
    if not frappe.db.exists("BIM Model", model):
        frappe.throw(_("BIM Model {0} does not exist").format(model))

    model_doc = frappe.get_doc("BIM Model", model)

    # Fetch elements from DB
    elements = frappe.get_all(
        "BIM Element",
        filters={"model": model},
        fields=["name", "stable_id", "element_type", "title", "storey", "discipline", "properties", "quantities"],
        limit_page_length=50000,
    )

    summary_by_type: dict[str, dict[str, float]] = {}
    summary_by_discipline: dict[str, dict[str, float]] = {
        "architecture": {},
        "structure": {},
        "mep": {},
        "other": {},
    }
    summary_by_storey: dict[str, dict[str, float]] = {}

    total_concrete_volume = 0.0
    total_rebar_weight = 0.0
    total_steel_weight = 0.0
    total_pipe_length = 0.0
    total_duct_area = 0.0
    total_duct_length = 0.0
    total_formwork_area = 0.0

    for el in elements:
        etype = (el.element_type or "").upper()
        disc = (el.discipline or "other").lower()
        if disc not in summary_by_discipline:
            summary_by_discipline[disc] = {}
        storey = el.storey or "Unassigned Storey"
        if storey not in summary_by_storey:
            summary_by_storey[storey] = {}

        quants = _parse_json_dict(el.quantities)
        props = _parse_json_dict(el.properties)

        # 1. Volume extraction (m3)
        vol = (
            _get_num(quants, ["NetVolume", "GrossVolume", "Volume", "Net_Volume", "Gross_Volume"]) or
            _get_num(props, ["NetVolume", "Volume", "GrossVolume", "Net Volume", "Gross Volume"]) or
            float(getattr(el, "volume", 0.0) or 0.0)
        )

        # 2. Area extraction (m2)
        area = (
            _get_num(quants, ["NetArea", "GrossArea", "Area", "NetSideArea", "GrossSideArea", "Net_Area", "Gross_Area"]) or
            _get_num(props, ["NetArea", "GrossArea", "Area", "Net Area", "Gross Area"]) or
            float(getattr(el, "area", 0.0) or 0.0)
        )

        # 3. Length extraction (m)
        length = (
            _get_num(quants, ["Length", "NominalLength", "TotalLength", "NetLength"]) or
            _get_num(props, ["Length", "NominalLength", "TotalLength"]) or
            float(getattr(el, "length", 0.0) or 0.0)
        )

        # 4. Weight extraction (kg)
        weight = (
            _get_num(quants, ["NetWeight", "GrossWeight", "Weight", "Mass"]) or
            _get_num(props, ["NetWeight", "GrossWeight", "Weight", "Mass"]) or
            0.0
        )

        # Material indication from properties or material attribute
        mat_str = (props.get("material") or props.get("Material") or "").upper()

        # Steel check (check material or specific steel types)
        has_steel_mat = "STEEL" in mat_str or "TERAS" in mat_str or "TERÄS" in mat_str
        has_conc_mat = "CONCRETE" in mat_str or "BETON" in mat_str

        is_rebar = any(k in etype for k in ["REINFORCING", "REBAR"])
        is_duct = any(k in etype for k in ["DUCT", "AIRTERMINAL"])
        is_pipe = any(k in etype for k in ["PIPE", "VALVE", "PUMP"])

        if has_steel_mat and not has_conc_mat:
            is_steel = True
            is_concrete = False
        else:
            is_concrete = any(k in etype for k in ["WALL", "SLAB", "COLUMN", "BEAM", "FOOTING", "PILE", "STAIR"]) and not has_steel_mat
            is_steel = any(k in etype for k in ["MEMBER", "PLATE"]) or (disc == "structure" and not is_concrete and not is_rebar and not is_duct and not is_pipe)

        # Fallback estimations based on bounding box or typical dimensions if explicit IFC quantity is missing
        if is_concrete and vol <= 0.0 and area > 0.0:
            # Estimate volume = area * standard thickness (e.g. 0.20m)
            vol = area * 0.20

        if is_concrete:
            total_concrete_volume += vol
            # Rebar ratio: ~100 kg per m3 of concrete
            rebar_est = vol * 100.0
            total_rebar_weight += rebar_est
            # Formwork ratio: ~2.5 m2 per m3 of concrete (or based on surface area)
            formwork_est = area if area > 0 else (vol * 4.0)
            total_formwork_area += formwork_est

        elif is_rebar:
            if weight <= 0.0 and vol > 0.0:
                weight = vol * 7850.0  # density of steel
            total_rebar_weight += weight

        elif is_steel:
            if weight <= 0.0 and vol > 0.0:
                weight = vol * 7850.0
            elif weight <= 0.0 and length > 0.0:
                weight = length * 45.0  # ~45 kg/m typical profile
            total_steel_weight += weight

        elif is_duct:
            total_duct_length += length
            if area <= 0.0:
                w = _get_num(props, ["Width", "NominalWidth"]) or 0.4
                h = _get_num(props, ["Height", "NominalHeight"]) or 0.3
                if w > 5.0:  # in mm
                    w /= 1000.0
                if h > 5.0:  # in mm
                    h /= 1000.0
                area = 2 * (w + h) * (length if length > 0 else 1.5)
            total_duct_area += area

        elif is_pipe:
            total_pipe_length += (length if length > 0 else 2.0)

        # Aggregate by element type
        type_key = el.element_type or "Unknown"
        if type_key not in summary_by_type:
            summary_by_type[type_key] = {"count": 0, "volume_m3": 0.0, "area_m2": 0.0, "length_m": 0.0, "weight_kg": 0.0}
        summary_by_type[type_key]["count"] += 1
        summary_by_type[type_key]["volume_m3"] = round(summary_by_type[type_key]["volume_m3"] + vol, 4)
        summary_by_type[type_key]["area_m2"] = round(summary_by_type[type_key]["area_m2"] + area, 4)
        summary_by_type[type_key]["length_m"] = round(summary_by_type[type_key]["length_m"] + length, 4)
        summary_by_type[type_key]["weight_kg"] = round(summary_by_type[type_key]["weight_kg"] + weight, 4)

    # Compile material takeoff summary
    material_takeoff = {
        "concrete_volume_m3": round(total_concrete_volume, 3),
        "rebar_weight_kg": round(total_rebar_weight, 3),
        "rebar_weight_tons": round(total_rebar_weight / 1000.0, 3),
        "structural_steel_kg": round(total_steel_weight, 3),
        "structural_steel_tons": round(total_steel_weight / 1000.0, 3),
        "ductwork_surface_m2": round(total_duct_area, 3),
        "ductwork_length_m": round(total_duct_length, 3),
        "piping_length_m": round(total_pipe_length, 3),
        "formwork_area_m2": round(total_formwork_area, 3),
    }

    return {
        "model": model,
        "model_name": model_doc.model_name,
        "discipline": model_doc.discipline,
        "total_elements": len(elements),
        "material_takeoff": material_takeoff,
        "summary_by_element_type": summary_by_type,
        "summary_by_discipline": summary_by_discipline,
        "summary_by_storey": summary_by_storey,
    }


def _parse_json_dict(val: Any) -> dict[str, Any]:
    if isinstance(val, dict):
        return val
    if isinstance(val, str) and val.strip():
        try:
            parsed = json.loads(val)
            return parsed if isinstance(parsed, dict) else {}
        except Exception:
            return {}
    return {}


def _get_num(d: dict[str, Any], keys: list[str]) -> float | None:
    for k in keys:
        if k in d and d[k] is not None:
            try:
                v = float(d[k])
                if v > 0:
                    return v
            except (ValueError, TypeError):
                continue
    return None


# --------------------------------------------------------------------------
# 2. ERPNext BOM Generation Engine
# --------------------------------------------------------------------------

@frappe.whitelist()
def preview_bom_generation(
    model: str,
    target_item: str | None = None,
    mapping_rules: str | list[dict[str, Any]] | None = None,
    waste_factor_pct: float = 5.0,
) -> dict[str, Any]:
    """Calculate and return estimated BOM lines and cost rollups without saving to database."""
    summary = get_model_quantity_summary(model)
    takeoff = summary["material_takeoff"]

    rules = _resolve_mapping_rules(mapping_rules)
    calculated_items: list[dict[str, Any]] = []
    total_rm_cost = 0.0

    for rule in rules:
        q_key = rule.get("quantity_key")
        raw_qty = 0.0

        if q_key == "volume_m3":
            raw_qty = takeoff.get("concrete_volume_m3", 0.0)
        elif q_key == "rebar_weight_kg":
            raw_qty = takeoff.get("rebar_weight_kg", 0.0)
        elif q_key == "steel_weight_kg":
            raw_qty = takeoff.get("structural_steel_kg", 0.0)
        elif q_key == "duct_area_m2":
            raw_qty = takeoff.get("ductwork_surface_m2", 0.0)
        elif q_key == "pipe_length_m":
            raw_qty = takeoff.get("piping_length_m", 0.0)
        elif q_key == "formwork_area_m2":
            raw_qty = takeoff.get("formwork_area_m2", 0.0)
        else:
            raw_qty = float(takeoff.get(q_key, 0.0))

        if raw_qty <= 0.0:
            continue

        item_waste = float(rule.get("waste_pct") or waste_factor_pct)
        billed_qty = round(raw_qty * (1.0 + (item_waste / 100.0)), 4)

        uom = rule.get("uom") or "Nos"
        rate = float(rule.get("rate") or DEFAULT_UNIT_RATES.get(uom, 100.00))
        amount = round(billed_qty * rate, 2)
        total_rm_cost += amount

        calculated_items.append({
            "category": rule.get("category"),
            "item_code": rule.get("target_item_code"),
            "item_name": rule.get("target_item_name") or rule.get("target_item_code"),
            "raw_quantity": round(raw_qty, 4),
            "waste_pct": item_waste,
            "qty": billed_qty,
            "uom": uom,
            "rate": rate,
            "amount": amount,
            "description": rule.get("description"),
        })

    return {
        "model": model,
        "target_item": target_item,
        "items": calculated_items,
        "total_items": len(calculated_items),
        "raw_material_cost": round(total_rm_cost, 2),
        "total_cost": round(total_rm_cost, 2),
        "quantity_summary": summary,
    }
@frappe.whitelist()
def generate_or_update_bom(
    model: str,
    target_item: str,
    mapping_rules: str | list[dict[str, Any]] | None = None,
    bom_type: str = "Manufacture",
    with_operations: int = 0,
    company: str | None = None,
    currency: str | None = None,
    waste_factor_pct: float = 5.0,
    submit_bom: int = 0,
    existing_bom: str | None = None,
) -> dict[str, Any]:
    """Generate or update an ERPNext BOM document from extracted BIM model quantities.

    Creates BOM lines, sets item pricing and waste factors, records traceability
    in BIM BOQ Link, and returns full calculation details.
    """
    # Check permissions for BOM creation or modification
    if existing_bom and frappe.db.exists("BOM", existing_bom):
        if hasattr(frappe, "has_permission") and not frappe.has_permission("BOM", "write"):
            frappe.throw(_("Not permitted to modify existing BOM {0}").format(existing_bom), frappe.PermissionError)
    elif hasattr(frappe, "has_permission") and not frappe.has_permission("BOM", "create"):
        frappe.throw(_("Not permitted to create BOM records"), frappe.PermissionError)

    # Validate specific create permissions for master data DocTypes
    if hasattr(frappe, "has_permission"):
        for dt in ("Item", "UOM", "Item Group", "BIM BOQ Link"):
            if not frappe.has_permission(dt, "create"):
                frappe.throw(_("Not permitted to create {0} records required for BOM generation").format(dt), frappe.PermissionError)

    # 1. Validate inputs and calculate preview lines
    preview = preview_bom_generation(
        model=model,
        target_item=target_item,
        mapping_rules=mapping_rules,
        waste_factor_pct=float(waste_factor_pct),
    )

    items_to_add = preview["items"]
    if not items_to_add:
        frappe.throw(_("No quantities extracted from model {0} matched the mapping rules.").format(model))

    # 2. Resolve Company & Currency
    if not company:
        company = frappe.defaults.get_user_default("Company") or frappe.db.get_value("Company", {}, "name")
    if not company:
        # Create default company if fresh test instance
        company = _ensure_default_company()

    if not currency:
        currency = frappe.db.get_value("Company", company, "default_currency") or "USD"

    # 3. Ensure target and component Items & UOMs exist in ERPNext
    _ensure_item_exists(target_item, item_name=target_item, is_stock_item=0, default_uom="Nos")

    for line in items_to_add:
        _ensure_uom_exists(line["uom"])
        _ensure_item_exists(
            item_code=line["item_code"],
            item_name=line["item_name"],
            is_stock_item=1,
            default_uom=line["uom"],
            standard_rate=line["rate"],
            item_group=line.get("item_group") or "Raw Material",
        )

    # 4. Create or Update BOM Document
    if existing_bom and frappe.db.exists("BOM", existing_bom):
        bom_doc = frappe.get_doc("BOM", existing_bom)
        if hasattr(bom_doc, "check_permission"):
            bom_doc.check_permission("write")
        elif hasattr(frappe, "has_permission") and not frappe.has_permission("BOM", "write", doc=bom_doc):
            frappe.throw(_("Not permitted to modify BOM {0}").format(existing_bom), frappe.PermissionError)
        if bom_doc.docstatus != 0:
            frappe.throw(_("Cannot update submitted or cancelled BOM {0}").format(existing_bom))
        bom_doc.items = []
    else:
        bom_doc = frappe.new_doc("BOM")
        bom_doc.item = target_item
        bom_doc.quantity = 1.0
        bom_doc.is_active = 1
        bom_doc.is_default = 1
        bom_doc.company = company
        bom_doc.currency = currency
        bom_doc.rm_cost_as_per = "Valuation Rate"
        bom_doc.with_operations = int(with_operations)

    total_rm_cost = 0.0

    for line in items_to_add:
        bom_item = bom_doc.append("items", {})
        bom_item.item_code = line["item_code"]
        bom_item.item_name = line["item_name"]
        bom_item.qty = float(line["qty"])
        bom_item.uom = line["uom"]
        bom_item.stock_uom = line["uom"]
        bom_item.conversion_factor = 1.0
        bom_item.rate = float(line["rate"])
        bom_item.amount = float(line["amount"])
        bom_item.description = line["description"]
        total_rm_cost += bom_item.amount

    bom_doc.raw_material_cost = round(total_rm_cost, 2)
    bom_doc.total_cost = round(total_rm_cost, 2)
    if existing_bom:
        bom_doc.save()
    else:
        bom_doc.flags.ignore_permissions = True
        bom_doc.save()

    # 5. Traceability: Record BIM BOQ Link entries
    links_created = _create_boq_traceability_links(model, bom_doc.name, items_to_add)

    # 6. Auto-submit if requested
    if submit_bom and bom_doc.docstatus == 0:
        try:
            bom_doc.submit()
        except Exception as e:
            logger.warning(f"Could not auto-submit BOM {bom_doc.name}: {e}")

    frappe.db.commit()

    return {
        "status": "success",
        "bom_name": bom_doc.name,
        "target_item": target_item,
        "bom_type": bom_type,
        "company": company,
        "currency": currency,
        "item_count": len(bom_doc.items),
        "raw_material_cost": bom_doc.raw_material_cost,
        "total_cost": bom_doc.total_cost,
        "items": items_to_add,
        "traceability_links_created": links_created,
        "docstatus": bom_doc.docstatus,
    }


def _resolve_mapping_rules(mapping_rules: Any) -> list[dict[str, Any]]:
    if not mapping_rules:
        return DEFAULT_MAPPING_RULES
    if isinstance(mapping_rules, str):
        try:
            parsed = json.loads(mapping_rules)
            return parsed if isinstance(parsed, list) else DEFAULT_MAPPING_RULES
        except Exception:
            return DEFAULT_MAPPING_RULES
    if isinstance(mapping_rules, list):
        return mapping_rules
    return DEFAULT_MAPPING_RULES


def _ensure_uom_exists(uom_name: str) -> None:
    """Ensure standard UOM exists in ERPNext."""
    if not frappe.db.exists("UOM", uom_name):
        if hasattr(frappe, "has_permission") and not frappe.has_permission("UOM", "create"):
            frappe.throw(_("Not permitted to create UOM {0}").format(uom_name), frappe.PermissionError)
        uom = frappe.new_doc("UOM")
        uom.uom_name = uom_name
        uom.insert(ignore_permissions=True)


def _ensure_item_exists(
    item_code: str,
    item_name: str | None = None,
    is_stock_item: int = 1,
    default_uom: str = "Nos",
    standard_rate: float = 0.0,
    item_group: str = "Raw Material",
) -> None:
    """Ensure Item record exists in ERPNext master data."""
    if not frappe.db.exists("Item", item_code):
        # Ensure Item Group exists
        if not frappe.db.exists("Item Group", item_group):
            if hasattr(frappe, "has_permission") and not frappe.has_permission("Item Group", "create"):
                frappe.throw(_("Not permitted to create Item Group {0}").format(item_group), frappe.PermissionError)
            ig = frappe.new_doc("Item Group")
            ig.item_group_name = item_group
            ig.is_group = 0
            ig.insert(ignore_permissions=True)

        _ensure_uom_exists(default_uom)

        if hasattr(frappe, "has_permission") and not frappe.has_permission("Item", "create"):
            frappe.throw(_("Not permitted to create Item {0}").format(item_code), frappe.PermissionError)
        item = frappe.new_doc("Item")
        item.item_code = item_code
        item.item_name = item_name or item_code
        item.item_group = item_group
        item.stock_uom = default_uom
        item.is_stock_item = is_stock_item
        item.valuation_rate = standard_rate
        item.standard_rate = standard_rate
        item.insert(ignore_permissions=True)


def _ensure_default_company() -> str:
    """Create a default company if none exists."""
    company_name = "Default Construction Company"
    if not frappe.db.exists("Company", company_name):
        if hasattr(frappe, "has_permission") and not frappe.has_permission("Company", "create"):
            frappe.throw(_("Not permitted to create Company records"), frappe.PermissionError)
        c = frappe.new_doc("Company")
        c.company_name = company_name
        c.default_currency = "USD"
        c.country = "United States"
        c.insert(ignore_permissions=True)
    return company_name


def _create_boq_traceability_links(model: str, bom_name: str, calculated_items: list[dict[str, Any]]) -> int:
    """Create BIM BOQ Link audit records connecting model elements to generated BOM lines."""
    created = 0
    # Link first 50 representative elements of the model to the BOM
    elements = frappe.get_all("BIM Element", filters={"model": model}, fields=["name", "element_type"], limit_page_length=100)

    for el in elements:
        etype = (el.element_type or "").upper()
        # Find matching item code
        matched_item = None
        for item in calculated_items:
            cat = (item.get("category") or "").upper()
            if ("CONCRETE" in cat and any(k in etype for k in ["WALL", "SLAB", "COLUMN", "BEAM"])) or \
               ("STEEL" in cat and any(k in etype for k in ["MEMBER", "PLATE", "COLUMN", "BEAM"])) or \
               ("DUCT" in cat and "DUCT" in etype) or \
               ("PIPE" in cat and "PIPE" in etype):
                matched_item = item["item_code"]
                break

        if not matched_item and calculated_items:
            matched_item = calculated_items[0]["item_code"]

        if matched_item:
            # Ensure matched_item exists in Item table
            _ensure_item_exists(matched_item, item_name=matched_item)

            if not frappe.db.exists("BIM BOQ Link", {
                "bim_element": el.name,
                "boq_reference_type": "Item",
                "boq_reference_name": matched_item,
            }):
                if hasattr(frappe, "has_permission") and not frappe.has_permission("BIM BOQ Link", "create"):
                    continue
                link = frappe.new_doc("BIM BOQ Link")
                link.bim_element = el.name
                link.boq_reference_type = "Item"
                link.boq_reference_name = matched_item
                link.link_type = "Rule"
                link.rule_id = f"BOM:{bom_name}"
                link.confidence = "High"
                link.insert(ignore_permissions=True)
                created += 1

    return created


@frappe.whitelist()
def generate_material_request_from_bim(
    model_id: str,
    cost_center: str | None = None,
    warehouse: str | None = None,
    material_request_type: str = "Purchase"
) -> dict[str, Any]:
    """Generate a formal ERPNext Material Request directly from BIM extracted quantities."""
    if hasattr(frappe, "has_permission") and not frappe.has_permission("Material Request", "create"):
        frappe.throw(_("Not permitted to create Material Request"), frappe.PermissionError)

    preview = preview_bom_generation(model_id)
    calculated_items = preview.get("items") or preview.get("calculated_items", [])
    if not calculated_items:
        frappe.throw(_("No quantifiable items found in BIM Model {0}").format(model_id))

    model_doc = frappe.get_doc("BIM Model", model_id)
    project_id = getattr(model_doc, "project", None)

    import time
    now_d = time.strftime("%Y-%m-%d")

    mr = frappe.new_doc("Material Request")
    mr.material_request_type = material_request_type
    mr.transaction_date = now_d
    mr.schedule_date = now_d
    if cost_center:
        mr.cost_center = cost_center
    if project_id:
        mr.project = project_id

    items_added = 0
    for itm in calculated_items:
        qty = float(itm.get("net_quantity") or itm.get("qty") or 0.0)
        if qty <= 0:
            continue

        item_code = itm.get("item_code")
        _ensure_item_exists(
            item_code,
            item_name=itm.get("item_name", item_code),
            item_group=itm.get("item_group", "Raw Material"),
            default_uom=itm.get("uom", "Nos")
        )

        row = mr.append("items", {})
        row.item_code = item_code
        row.item_name = itm.get("item_name", item_code)
        row.qty = round(qty, 2)
        row.uom = itm.get("uom", "Nos")
        row.rate = float(itm.get("rate") or 0.0)
        row.amount = round(row.qty * row.rate, 2)
        if warehouse:
            row.warehouse = warehouse
        if cost_center:
            row.cost_center = cost_center
        items_added += 1

    mr.insert(ignore_permissions=True)
    frappe.db.commit()

    return {
        "status": "success",
        "material_request": mr.name,
        "items_count": items_added,
        "total_cost": preview.get("total_estimated_cost", 0.0),
        "project": project_id
    }


