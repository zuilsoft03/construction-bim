"""Whitelisted API for the Construction BIM module.

Exposes the BIM pipeline to the frontend pages and external tools:

- Model lifecycle: create from IFC upload, re-process, list, get geometry.
- Elements: list with filters, get full properties/quantities.
- BOQ linking: create/delete/list element<->BOQ links, apply quantity maps.
- Viewpoints: save/restore camera positions per model.
- PDF takeoff: save/load measurements per PDF File.

All methods are @frappe.whitelist() — callable from desk pages and REST
(/api/method/construction_bim.bim.api.<name>).
"""

from __future__ import annotations

import json
import logging
import os

import frappe
from frappe import _

logger = logging.getLogger(__name__)

from . import ifc_parser, glb_writer, ifc_geometry

# Standard upload size guard (files bigger than this are suspicious for IFC)
_MAX_IFC_BYTES = 200 * 1024 * 1024


# --------------------------------------------------------------------------
# Models
# --------------------------------------------------------------------------

@frappe.whitelist()
def create_model_from_ifc(file_url: str | None = None, file_name: str | None = None,
                          project: str | None = None, model_name: str | None = None,
                          discipline: str = "Architecture") -> dict:
    """Create a BIM Model from an uploaded IFC file.

    The file must already be attached in Frappe (File doctype) — the desk
    frontend uploads via /api/method/upload_file first, then calls this with
    the resulting file_url.
    """
    if not file_url:
        frappe.throw(_("file_url is required"))

    file_doc = _find_file(file_url, file_name)
    content = _read_file_bytes(file_doc)

    if len(content) > _MAX_IFC_BYTES:
        frappe.throw(_("IFC file too large (>{0} MB)").format(_MAX_IFC_BYTES // (1024 * 1024)))

    # Parse
    try:
        result = ifc_parser.process_ifc_bytes(content)
    except ValueError as e:
        frappe.throw(_("IFC parse failed: {0}").format(e))
    except Exception as e:
        logger.exception("IFC parse crashed")
        frappe.throw(_("IFC parse crashed: {0}").format(e))

    elements = result["elements"]
    if not elements:
        frappe.throw(_("No building elements found in the IFC file (spatial-only or unsupported types)."))

    # Extract REAL vertex geometry from IFC4 extruded/rectangle solids (world Z-up metres)
    try:
        text = content.decode("utf-8", errors="ignore")
        geometry = ifc_geometry.extract_all(text, elements, result["length_scale"])
    except Exception as e:
        logger.exception("IFC geometry extraction crashed")
        frappe.throw(_("IFC geometry extraction failed: {0}").format(e))

    # Build GLB (real meshes where available, box fallback otherwise)
    try:
        glb_bytes = glb_writer.build_glb(elements, geometry)
    except Exception as e:
        logger.exception("GLB generation failed")
        frappe.throw(_("GLB generation failed: {0}").format(e))

    model = frappe.new_doc("BIM Model")
    model.project = project or None
    model.model_name = model_name or (file_doc.file_name or "BIM Model").rsplit(".", 1)[0]
    model.discipline = discipline
    model.model_format = "IFC"
    model.status = "Processing"
    model.original_file = file_url
    model.element_count = len(elements)
    model.storey_count = len(result["storeys"])
    model.metadata = {
        "storeys": result["storeys"],
        "disciplines": result["disciplines"],
        "length_scale": result["length_scale"],
        "real_geometry_count": len(geometry),
    }
    model.insert(ignore_permissions=True)

    # Persist elements in bulk
    _bulk_insert_elements(model.name, elements)

    # Attach GLB to the model
    glb_file = _save_glb_file(model.name, model.model_name, glb_bytes)
    frappe.db.set_value("BIM Model", model.name, {
        "geometry_file": glb_file.file_url,
        "status": "Ready",
    }, update_modified=True)

    frappe.db.commit()

    return {
        "name": model.name,
        "model_name": model.model_name,
        "element_count": len(elements),
        "storey_count": len(result["storeys"]),
        "geometry_file": glb_file.file_url,
    }


@frappe.whitelist()
def list_models(project: str | None = None) -> list[dict]:
    filters = {}
    if project:
        filters["project"] = project
    docs = frappe.get_all(
        "BIM Model",
        filters=filters,
        fields=["name", "model_name", "discipline", "model_format", "version",
                "status", "element_count", "storey_count", "project", "geometry_file"],
        order_by="creation desc",
        limit_page_length=500,
    )
    return docs


@frappe.whitelist()
def get_model(model: str) -> dict:
    doc = frappe.get_doc("BIM Model", model)
    return {
        "name": doc.name,
        "model_name": doc.model_name,
        "project": doc.project,
        "discipline": doc.discipline,
        "model_format": doc.model_format,
        "version": doc.version,
        "status": doc.status,
        "element_count": doc.element_count,
        "storey_count": doc.storey_count,
        "geometry_file": doc.geometry_file,
        "original_file": doc.original_file,
        "metadata": doc.metadata,
        "error_message": doc.error_message,
    }


@frappe.whitelist()
def get_geometry(model: str) -> dict:
    """Return the geometry file URL for a model (GLB)."""
    url = frappe.db.get_value("BIM Model", model, "geometry_file")
    if not url:
        frappe.throw(_("Model has no geometry file"))
    return {"geometry_file": url}


# --------------------------------------------------------------------------
# Elements
# --------------------------------------------------------------------------

@frappe.whitelist()
def list_elements(model: str, filters: str | None = None, limit: int = 5000) -> dict:
    """List elements of a model, optionally filtered.

    ``filters`` is a JSON string: {discipline: [...], storey: [...],
    element_type: [...], search: "..."} — list values OR together.
    """
    flt = json.loads(filters) if filters else {}
    model_doc = frappe.get_doc("BIM Model", model)

    where = ["model = %s"]
    args: list = [model]

    def _add_list_filter(key: str, col: str):
        vals = flt.get(key)
        if vals:
            if isinstance(vals, str):
                vals = [vals]
            vals = [v for v in vals if v]
            if vals:
                placeholders = ", ".join(["%s"] * len(vals))
                where.append(f"{col} IN ({placeholders})")
                args.extend(vals)

    _add_list_filter("discipline", "discipline")
    _add_list_filter("storey", "storey")
    _add_list_filter("element_type", "element_type")

    search = (flt.get("search") or "").strip()
    if search:
        where.append("(name LIKE %s OR element_type LIKE %s OR stable_id LIKE %s)")
        like = f"%{search}%"
        args.extend([like, like, like])

    # If model has too many elements, allow a cheap count query
    count = frappe.db.sql(
        f"SELECT COUNT(*) FROM `tabBIM Element` WHERE {' AND '.join(where)}",
        args,
    )[0][0]

    rows = frappe.db.sql(
        f"""SELECT name, stable_id, element_type, title AS element_title,
                   storey, discipline, mesh_ref
            FROM `tabBIM Element`
            WHERE {' AND '.join(where)}
            ORDER BY creation
            LIMIT %s""",
        args + [int(limit)],
        as_dict=True,
    )
    for r in rows:
        r["title"] = r["element_title"]
        del r["element_title"]

    # Distinct facet values for filter dropdowns
    facets = {}
    for col in ("discipline", "storey", "element_type"):
        facets[col] = [r[0] for r in frappe.db.sql(
            f"SELECT DISTINCT {col} FROM `tabBIM Element` WHERE model=%s AND {col} IS NOT NULL AND {col}<>'' ORDER BY {col}",
            [model],
        )]

    return {
        "model": model,
        "model_name": model_doc.model_name,
        "elements": rows,
        "total": count,
        "facets": facets,
    }


@frappe.whitelist()
def get_element(element: str) -> dict:
    doc = frappe.get_doc("BIM Element", element)
    return {
        "name": doc.name,
        "stable_id": doc.stable_id,
        "element_type": doc.element_type,
        "title": doc.title,
        "storey": doc.storey,
        "discipline": doc.discipline,
        "mesh_ref": doc.mesh_ref,
        "properties": _as_dict(doc.properties),
        "quantities": _as_dict(doc.quantities),
        "bounding_box": _as_dict(doc.bounding_box),
        "asset_info": _as_dict(doc.asset_info),
        "is_tracked_asset": doc.is_tracked_asset,
        "model": doc.model,
        "boq_links": _links_for_element(doc.name),
    }


def _as_dict(value) -> dict:
    """JSON fields can come back as dict OR json-encoded str depending on
    cache state in this Frappe version — normalize to a real dict."""
    if value is None:
        return {}
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else {}
        except (ValueError, TypeError):
            return {}
    return {}


# --------------------------------------------------------------------------
# BOQ links & quantity maps
# --------------------------------------------------------------------------

@frappe.whitelist()
def create_boq_link(bim_element: str, boq_reference_type: str,
                    boq_reference_name: str, link_type: str = "Manual",
                    confidence: str | None = None, rule_id: str | None = None) -> dict:
    if frappe.db.exists("BIM BOQ Link", {
        "bim_element": bim_element,
        "boq_reference_type": boq_reference_type,
        "boq_reference_name": boq_reference_name,
    }):
        return {"message": "already exists"}
    doc = frappe.new_doc("BIM BOQ Link")
    doc.bim_element = bim_element
    doc.boq_reference_type = boq_reference_type
    doc.boq_reference_name = boq_reference_name
    doc.link_type = link_type
    doc.confidence = confidence or None
    doc.rule_id = rule_id or None
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return {"name": doc.name}


@frappe.whitelist()
def delete_boq_link(link: str) -> dict:
    frappe.delete_doc("BIM BOQ Link", link, ignore_permissions=True)
    frappe.db.commit()
    return {"deleted": link}


@frappe.whitelist()
def list_boq_links(model: str | None = None, bim_element: str | None = None) -> list[dict]:
    filters = {}
    if model:
        # join through BIM Element
        rows = frappe.db.sql(
            """SELECT l.name, l.bim_element, l.boq_reference_type, l.boq_reference_name,
                      l.link_type, l.confidence, l.rule_id, e.element_type, e.storey
               FROM `tabBIM BOQ Link` l
               JOIN `tabBIM Element` e ON e.name = l.bim_element
               WHERE e.model = %s
               ORDER BY l.creation""",
            [model],
            as_dict=True,
        )
        return rows
    if bim_element:
        return _links_for_element(bim_element)
    return frappe.get_all("BIM BOQ Link",
                          fields=["name", "bim_element", "boq_reference_type",
                                  "boq_reference_name", "link_type", "confidence", "rule_id"],
                          limit_page_length=1000)


@frappe.whitelist()
def apply_quantity_map(quantity_map: str, model: str) -> dict:
    """Apply one BIM Quantity Map to a model: link every matching element to
    the map's BOQ target item."""
    qmap = frappe.get_doc("BIM Quantity Map", quantity_map)
    if not qmap.is_active:
        frappe.throw(_("Quantity map is inactive"))

    target = json.loads(qmap.boq_target or "{}")
    if not target.get("item_code") and not target.get("name"):
        frappe.throw(_("boq_target must specify item_code or name"))

    # resolve target reference
    ref_type = target.get("reference_type") or "Item"
    ref_name = target.get("name") or target.get("item_code")
    if ref_type == "Item":
        if not frappe.db.exists("Item", ref_name):
            frappe.throw(_("Item {0} does not exist").format(ref_name))
    elif ref_type == "Construction Contract BOQ Item":
        if not frappe.db.exists("Construction Contract BOQ Item", ref_name):
            frappe.throw(_("BOQ item {0} does not exist").format(ref_name))

    # element candidates
    type_filters = [t.strip() for t in (qmap.element_type_filter or "").split(",") if t.strip()]
    prop_filter = json.loads(qmap.property_filter or "{}")

    elements = frappe.get_all("BIM Element",
                              filters={"model": model},
                              fields=["name", "element_type", "properties", "quantities"],
                              limit_page_length=20000)

    matched = 0
    created = 0
    for el in elements:
        if type_filters and el.element_type not in type_filters:
            continue
        if prop_filter:
            props = json.loads(el.properties or "{}")
            if not all(props.get(k) == v for k, v in prop_filter.items()):
                continue
        matched += 1
        if not frappe.db.exists("BIM BOQ Link", {
            "bim_element": el.name,
            "boq_reference_type": ref_type,
            "boq_reference_name": ref_name,
        }):
            doc = frappe.new_doc("BIM BOQ Link")
            doc.bim_element = el.name
            doc.boq_reference_type = ref_type
            doc.boq_reference_name = ref_name
            doc.link_type = "Rule"
            doc.rule_id = quantity_map
            doc.insert(ignore_permissions=True)
            created += 1

    frappe.db.commit()
    return {"matched": matched, "created": created}


# --------------------------------------------------------------------------
# Viewpoints
# --------------------------------------------------------------------------

@frappe.whitelist()
def save_viewpoint(model: str, viewpoint_name: str, camera: str,
                   section_box: str | None = None) -> dict:
    if frappe.db.exists("BIM Viewpoint", {"model": model, "viewpoint_name": viewpoint_name}):
        frappe.throw(_("Viewpoint {0} already exists for this model").format(viewpoint_name))
    doc = frappe.new_doc("BIM Viewpoint")
    doc.model = model
    doc.viewpoint_name = viewpoint_name
    doc.camera = camera
    doc.section_box = section_box or None
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return {"name": doc.name}


@frappe.whitelist()
def list_viewpoints(model: str) -> list[dict]:
    return frappe.get_all("BIM Viewpoint",
                          filters={"model": model},
                          fields=["name", "viewpoint_name", "camera", "section_box"],
                          order_by="creation")


@frappe.whitelist()
def delete_viewpoint(viewpoint: str) -> dict:
    frappe.delete_doc("BIM Viewpoint", viewpoint, ignore_permissions=True)
    frappe.db.commit()
    return {"deleted": viewpoint}


# --------------------------------------------------------------------------
# PDF takeoff measurements
# --------------------------------------------------------------------------

@frappe.whitelist()
def save_measurement(pdf_file: str, page_no: int = 1, measurement_type: str = "Distance",
                     points: str = "[]", scale: str = "{}", real_value: float = 0.0,
                     unit: str = "m", notes: str | None = None) -> dict:
    if not frappe.db.exists("File", pdf_file):
        file_doc = _find_file(pdf_file)
        pdf_file = file_doc.name
    doc = frappe.new_doc("PDF Measurement")
    doc.pdf_file = pdf_file
    doc.page_no = int(page_no)
    doc.measurement_type = measurement_type
    doc.points = points
    doc.scale = scale
    doc.real_value = real_value
    doc.unit = unit
    doc.notes = notes or None
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    return {"name": doc.name}


@frappe.whitelist()
def list_measurements(pdf_file: str) -> list[dict]:
    if not frappe.db.exists("File", pdf_file):
        try:
            file_doc = _find_file(pdf_file)
            pdf_file = file_doc.name
        except (frappe.exceptions.ValidationError, frappe.exceptions.DoesNotExistError):
            pass
    return frappe.get_all("PDF Measurement",
                          filters={"pdf_file": pdf_file},
                          fields=["name", "page_no", "measurement_type", "points",
                                  "scale", "real_value", "unit", "notes"],
                          order_by="page_no, creation")


@frappe.whitelist()
def delete_measurement(measurement: str) -> dict:
    frappe.delete_doc("PDF Measurement", measurement, ignore_permissions=True)
    frappe.db.commit()
    return {"deleted": measurement}


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def _find_file(file_url: str, file_name: str | None = None):
    """Locate a File doc by url or name."""
    if frappe.db.exists("File", {"file_url": file_url}):
        return frappe.get_doc("File", {"file_url": file_url})
    if file_name and frappe.db.exists("File", {"file_name": file_name}):
        return frappe.get_doc("File", {"file_name": file_name})
    if frappe.db.exists("File", file_url):
        return frappe.get_doc("File", file_url)
    frappe.throw(_("File not found: {0}").format(file_url))


def _read_file_bytes(file_doc) -> bytes:
    if file_doc.is_private:
        path = file_doc.get_full_path()
        if not os.path.exists(path):
            frappe.throw(_("File content missing on disk: {0}").format(path))
        with open(path, "rb") as f:
            return f.read()
    # public file
    full = file_doc.get_full_path()
    if os.path.exists(full):
        with open(full, "rb") as f:
            return f.read()
    import frappe.utils.file_manager as fm
    return fm.get_content(file_doc.name)


def _bulk_insert_elements(model: str, elements: list[dict]) -> None:
    """Insert all parsed elements efficiently."""
    for el in elements:
        doc = frappe.new_doc("BIM Element")
        doc.model = model
        doc.stable_id = el["stable_id"]
        doc.element_type = el["element_type"]
        doc.title = el["name"]
        doc.storey = el["storey"] or None
        doc.discipline = el["discipline"]
        doc.properties = el["properties"]
        doc.quantities = el["quantities"]
        doc.geometry_hash = el["geometry_hash"]
        doc.mesh_ref = el["mesh_ref"]
        doc.insert(ignore_permissions=True)


def _save_glb_file(model: str, model_name: str, glb_bytes: bytes):
    """Save GLB bytes as a private File attached to the BIM Model."""
    filename = f"{model_name}_{model}.glb"
    import frappe.utils.file_manager as fm
    filedata = fm.save_file(
        fname=filename,
        content=glb_bytes,
        dt="BIM Model",
        dn=model,
        is_private=0,
    )
    return filedata


def _links_for_element(bim_element: str) -> list[dict]:
    return frappe.get_all("BIM BOQ Link",
                          filters={"bim_element": bim_element},
                          fields=["name", "boq_reference_type", "boq_reference_name",
                                  "link_type", "confidence", "rule_id"],
                          limit_page_length=200)


# --------------------------------------------------------------------------
# Clash Detection & Discussion Endpoints (Forwarded)
# --------------------------------------------------------------------------
from construction_bim.api.clash import (
    save_clashes_batch,
    get_clashes,
    get_clash,
    add_clash_comment,
    update_clash_status,
    delete_clash,
)

# --------------------------------------------------------------------------
# BIM to ERPNext BOM Integration Endpoints (Forwarded)
# --------------------------------------------------------------------------
from construction_bim.api.bom_integration import (
    get_model_quantity_summary,
    preview_bom_generation,
    generate_or_update_bom,
)

