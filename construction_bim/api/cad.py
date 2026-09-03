"""CAD (DWG/DXF) and BIMcollab-style BCF Collaboration API endpoints."""

from __future__ import annotations

import base64
import io
import json
import uuid
import zipfile
import xml.etree.ElementTree as ET
from typing import Any

import frappe
from frappe import _
from frappe.utils import now_datetime


def _resolve_bim_model(model_ref: str | None) -> str | None:
    if not model_ref:
        return None
    if frappe.db.exists("BIM Model", model_ref):
        return model_ref
    return frappe.db.get_value("BIM Model", {"model_name": model_ref}, "name")


@frappe.whitelist()
def save_cad_issue(issue_data: str | dict[str, Any]) -> dict[str, Any]:
    """Create or update a BCF BIM Issue for CAD drawings."""
    if not frappe.has_permission("BIM Issue", "create"):
        frappe.throw(_("Not permitted to create BIM Issues."), frappe.PermissionError)

    if isinstance(issue_data, str):
        try:
            issue_dict = json.loads(issue_data)
        except Exception:
            frappe.throw(_("Invalid JSON format for issue_data."))
    else:
        issue_dict = issue_data

    title = issue_dict.get("title", "").strip()
    if not title:
        frappe.throw(_("Title is required for a BIM Issue."))

    # Next pin number calculation if not supplied
    pin_number = issue_dict.get("pin_number")
    ref_model = _resolve_bim_model(issue_dict.get("reference_model"))

    if not pin_number:
        if ref_model:
            max_pin = frappe.db.sql(
                """SELECT COALESCE(MAX(pin_number), 0) FROM `tabBIM Issue` WHERE reference_model=%s""",
                (ref_model,),
            )[0][0]
        else:
            max_pin = frappe.db.sql(
                """SELECT COALESCE(MAX(pin_number), 0) FROM `tabBIM Issue`"""
            )[0][0]
        pin_number = int(max_pin) + 1

    doc = frappe.get_doc({
        "doctype": "BIM Issue",
        "title": title,
        "topic_type": issue_dict.get("topic_type", "Issue"),
        "topic_status": issue_dict.get("topic_status", "Open"),
        "priority": issue_dict.get("priority", "Normal"),
        "assigned_to": issue_dict.get("assigned_to"),
        "due_date": issue_dict.get("due_date"),
        "stage": issue_dict.get("stage", "Coordination"),
        "labels": issue_dict.get("labels", ""),
        "reference_model": ref_model,
        "drawing_space": issue_dict.get("drawing_space", "Model Space"),
        "cad_file": issue_dict.get("cad_file"),
        "pin_number": pin_number,
        "location_x": float(issue_dict.get("location_x", 0.0)),
        "location_y": float(issue_dict.get("location_y", 0.0)),
        "viewpoint_json": issue_dict.get("viewpoint_json") if isinstance(issue_dict.get("viewpoint_json"), str) else json.dumps(issue_dict.get("viewpoint_json") or {}),
        "snapshot": issue_dict.get("snapshot"),
        "description": issue_dict.get("description", ""),
    })
    doc.insert()

    return {
        "status": "success",
        "message": _("BIM Issue created successfully."),
        "issue": doc.as_dict(),
    }


@frappe.whitelist()
def get_cad_issues(
    model_name: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    topic_type: str | None = None,
) -> list[dict[str, Any]]:
    """Retrieve filtered BIM Issues with viewpoint metadata and comment counts."""
    if not frappe.has_permission("BIM Issue", "read"):
        frappe.throw(_("Not permitted to view BIM Issues."), frappe.PermissionError)

    filters: dict[str, Any] = {}
    if model_name:
        resolved_model = _resolve_bim_model(model_name)
        filters["reference_model"] = resolved_model or model_name
    if status and status != "All":
        filters["topic_status"] = status
    if priority and priority != "All":
        filters["priority"] = priority
    if topic_type and topic_type != "All":
        filters["topic_type"] = topic_type

    issues = frappe.get_all(
        "BIM Issue",
        filters=filters,
        fields=[
            "name",
            "title",
            "topic_type",
            "topic_status",
            "priority",
            "assigned_to",
            "due_date",
            "stage",
            "labels",
            "reference_model",
            "drawing_space",
            "cad_file",
            "pin_number",
            "location_x",
            "location_y",
            "viewpoint_json",
            "snapshot",
            "description",
            "created_by_user",
            "creation_date",
            "resolved_by",
            "resolution_date",
        ],
        order_by="pin_number asc, creation desc",
    )

    for issue in issues:
        comment_count = frappe.db.count(
            "Comment",
            {"reference_doctype": "BIM Issue", "reference_name": issue["name"], "comment_type": "Comment"},
        )
        issue["comment_count"] = comment_count
        if issue.get("viewpoint_json"):
            try:
                issue["viewpoint"] = json.loads(issue["viewpoint_json"])
            except Exception:
                issue["viewpoint"] = {}

    return issues


@frappe.whitelist()
def add_issue_comment(issue_name: str, comment: str, new_status: str | None = None) -> dict[str, Any]:
    """Add a threaded comment to a BIM Issue and optionally update its status."""
    if not frappe.has_permission("BIM Issue", "write"):
        frappe.throw(_("Not permitted to update BIM Issues."), frappe.PermissionError)

    doc = frappe.get_doc("BIM Issue", issue_name)
    doc.check_permission("write")
    result = doc.add_discussion_comment(comment, new_status=new_status)
    return {"status": "success", "data": result}


@frappe.whitelist()
def update_issue_status(issue_name: str, status: str) -> dict[str, Any]:
    """Update topic status of a BIM Issue."""
    if not frappe.has_permission("BIM Issue", "write"):
        frappe.throw(_("Not permitted to update BIM Issues."), frappe.PermissionError)

    doc = frappe.get_doc("BIM Issue", issue_name)
    doc.check_permission("write")
    doc.topic_status = status
    doc.save()
    return {"status": "success", "topic_status": doc.topic_status}


@frappe.whitelist()
def export_bcf_zip(model_name: str | None = None, issue_names: str | list[str] | None = None) -> dict[str, Any]:
    """Export BIM Issues as a buildingSMART BCF 2.1 compliant .bcfzip package."""
    if not frappe.has_permission("BIM Issue", "export"):
        frappe.throw(_("Not permitted to export BIM Issues."), frappe.PermissionError)

    filters: dict[str, Any] = {}
    if model_name:
        resolved_model = _resolve_bim_model(model_name)
        filters["reference_model"] = resolved_model or model_name

    if isinstance(issue_names, str):
        try:
            issue_names = json.loads(issue_names)
        except Exception:
            issue_names = [issue_names]

    if issue_names:
        filters["name"] = ["in", issue_names]

    issues = frappe.get_all("BIM Issue", filters=filters, pluck="name")
    if not issues:
        frappe.throw(_("No BIM Issues found to export."))

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Standard bcf.version header
        bcf_version_xml = """<?xml version="1.0" encoding="UTF-8"?>
<Version VersionId="2.1" xmlns="http://www.buildingsmart-tech.org/specifications/bcf/version/2.1"/>
"""
        zf.writestr("bcf.version", bcf_version_xml)

        for issue_name in issues:
            doc = frappe.get_doc("BIM Issue", issue_name)
            topic_guid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"bim_issue_{doc.name}"))
            markup_xml, viewpoint_xml = doc.to_bcf_xml()

            zf.writestr(f"{topic_guid}/markup.bcf", markup_xml)
            zf.writestr(f"{topic_guid}/viewpoint.bcfv", viewpoint_xml)

            # Snapshot image
            if doc.snapshot and doc.snapshot.startswith("data:image/"):
                try:
                    header, encoded = doc.snapshot.split(",", 1)
                    img_data = base64.b64decode(encoded)
                    zf.writestr(f"{topic_guid}/snapshot.png", img_data)
                except Exception:
                    pass

    zip_data = base64.b64encode(zip_buffer.getvalue()).decode("utf-8")
    filename = f"BCF_Export_{model_name or 'CAD'}_{now_datetime().strftime('%Y%m%d_%H%M%S')}.bcfzip"

    return {
        "status": "success",
        "filename": filename,
        "zip_base64": zip_data,
        "issue_count": len(issues),
    }


@frappe.whitelist()
def import_bcf_zip(zip_base64: str, reference_model: str | None = None) -> dict[str, Any]:
    """Import a buildingSMART BCF 2.1/3.0 .bcfzip package into ERPNext BIM Issues."""
    if not frappe.has_permission("BIM Issue", "create"):
        frappe.throw(_("Not permitted to create BIM Issues."), frappe.PermissionError)

    try:
        raw_zip = base64.b64decode(zip_base64)
    except Exception as exc:
        frappe.throw(_("Invalid base64 payload: {0}").format(str(exc)))

    imported_count = 0
    with zipfile.ZipFile(io.BytesIO(raw_zip), "r") as zf:
        topic_folders = set()
        for name in zf.namelist():
            parts = name.split("/")
            if len(parts) >= 2 and parts[1] == "markup.bcf":
                topic_folders.add(parts[0])

        for folder in topic_folders:
            try:
                markup_bytes = zf.read(f"{folder}/markup.bcf")
                root = ET.fromstring(markup_bytes)

                topic_el = root.find(".//{*}Topic") or root.find("Topic")
                if topic_el is None:
                    continue

                title = topic_el.findtext("{*}Title") or topic_el.findtext("Title") or "Imported BCF Topic"
                topic_type = topic_el.get("TopicType") or "Issue"
                topic_status = topic_el.get("TopicStatus") or "Open"
                priority = topic_el.findtext("{*}Priority") or topic_el.findtext("Priority") or "Normal"
                description = topic_el.findtext("{*}Description") or topic_el.findtext("Description") or ""
                due_date = topic_el.findtext("{*}DueDate") or topic_el.findtext("DueDate")
                stage = topic_el.findtext("{*}Stage") or topic_el.findtext("Stage") or "Coordination"

                labels = []
                for lbl in topic_el.findall(".//{*}Labels") + topic_el.findall("Labels"):
                    if lbl.text:
                        labels.append(lbl.text.strip())

                # Viewpoint reading
                viewpoint_dict: dict[str, Any] = {}
                loc_x = 0.0
                loc_y = 0.0
                if f"{folder}/viewpoint.bcfv" in zf.namelist():
                    try:
                        vp_bytes = zf.read(f"{folder}/viewpoint.bcfv")
                        vp_root = ET.fromstring(vp_bytes)
                        cam_x = vp_root.findtext(".//{*}CameraViewPoint/{*}X") or vp_root.findtext(".//CameraViewPoint/X")
                        cam_y = vp_root.findtext(".//{*}CameraViewPoint/{*}Y") or vp_root.findtext(".//CameraViewPoint/Y")
                        if cam_x and cam_y:
                            loc_x = float(cam_x)
                            loc_y = float(cam_y)
                            viewpoint_dict["camera"] = {"center": {"x": loc_x, "y": loc_y, "z": 0.0}, "zoom": 1.0}
                    except Exception:
                        pass

                # Snapshot reading
                snapshot_data = None
                for snap_name in [f"{folder}/snapshot.png", f"{folder}/Snapshot.png"]:
                    if snap_name in zf.namelist():
                        snap_bytes = zf.read(snap_name)
                        snapshot_data = f"data:image/png;base64,{base64.b64encode(snap_bytes).decode('utf-8')}"
                        break

                ref_model = _resolve_bim_model(reference_model)

                new_issue = frappe.get_doc({
                    "doctype": "BIM Issue",
                    "title": title,
                    "topic_type": topic_type,
                    "topic_status": topic_status,
                    "priority": priority,
                    "stage": stage,
                    "labels": ", ".join(labels),
                    "description": description,
                    "due_date": due_date,
                    "reference_model": ref_model,
                    "location_x": loc_x,
                    "location_y": loc_y,
                    "viewpoint_json": json.dumps(viewpoint_dict),
                    "snapshot": snapshot_data,
                })
                new_issue.insert()
                imported_count += 1

                # Import comments if present
                for c_el in root.findall(".//{*}Comment") + root.findall("Comment"):
                    c_text = c_el.findtext("{*}Comment") or c_el.findtext("Comment")
                    if c_text:
                        c_author = c_el.findtext("{*}Author") or c_el.findtext("Author") or "BCF Import"
                        frappe.get_doc({
                            "doctype": "Comment",
                            "comment_type": "Comment",
                            "reference_doctype": "BIM Issue",
                            "reference_name": new_issue.name,
                            "content": f"[{c_author}]: {frappe.utils.escape_html(c_text)}",
                            "comment_by": c_author,
                        }).insert(ignore_permissions=True)

            except Exception as e:
                frappe.log_error(f"Error importing topic folder {folder}: {e}")

    return {
        "status": "success",
        "imported_count": imported_count,
    }


@frappe.whitelist()
def get_sample_cad_drawing() -> dict[str, Any]:
    """Generate a high-fidelity multi-discipline architectural and structural CAD drawing dataset."""
    layers = {
        "S-GRID": {"color": "#ff3b30", "aci": 1, "visible": True, "description": "Structural Column Grids"},
        "S-COLS": {"color": "#ff9500", "aci": 2, "visible": True, "description": "Reinforced Concrete Columns"},
        "S-BEAM": {"color": "#ffcc00", "aci": 3, "visible": True, "description": "Structural Framing Beams"},
        "A-WALL": {"color": "#ffffff", "aci": 7, "visible": True, "description": "Exterior & Interior Walls"},
        "A-DOOR": {"color": "#34c759", "aci": 4, "visible": True, "description": "Door Assemblies & Swings"},
        "A-WINDOW": {"color": "#5ac8fa", "aci": 5, "visible": True, "description": "Glazed Openings & Mullions"},
        "M-DUCT": {"color": "#af52de", "aci": 6, "visible": True, "description": "HVAC Supply/Return Ductwork"},
        "P-PIPE": {"color": "#007aff", "aci": 140, "visible": True, "description": "Domestic Cold/Hot Water Piping"},
        "E-LITE": {"color": "#ff2d55", "aci": 210, "visible": True, "description": "Ceiling Lighting Fixtures"},
        "A-ANNO-DIMS": {"color": "#8e8e93", "aci": 8, "visible": True, "description": "Dimension Strings & Text Notes"},
    }

    entities: list[dict[str, Any]] = []

    # 1. Structural Grids (Lines & Bubble Text)
    # X-Grids (Lines 1 to 4 at x = 0, 4000, 8000, 12000)
    for i, x in enumerate([0, 4000, 8000, 12000]):
        entities.append({
            "type": "LINE",
            "layer": "S-GRID",
            "start": {"x": x, "y": -1000, "z": 0},
            "end": {"x": x, "y": 9000, "z": 0},
        })
        entities.append({
            "type": "CIRCLE",
            "layer": "S-GRID",
            "center": {"x": x, "y": -1300, "z": 0},
            "radius": 250,
        })
        entities.append({
            "type": "TEXT",
            "layer": "S-GRID",
            "text": str(i + 1),
            "position": {"x": x - 60, "y": -1380, "z": 0},
            "height": 180,
        })

    # Y-Grids (Lines A to C at y = 0, 4000, 8000)
    for i, y in enumerate([0, 4000, 8000]):
        lbl = chr(65 + i)
        entities.append({
            "type": "LINE",
            "layer": "S-GRID",
            "start": {"x": -1000, "y": y, "z": 0},
            "end": {"x": 13000, "y": y, "z": 0},
        })
        entities.append({
            "type": "CIRCLE",
            "layer": "S-GRID",
            "center": {"x": -1300, "y": y, "z": 0},
            "radius": 250,
        })
        entities.append({
            "type": "TEXT",
            "layer": "S-GRID",
            "text": lbl,
            "position": {"x": -1360, "y": y - 80, "z": 0},
            "height": 180,
        })

    # 2. Structural Columns (400x400 mm RC Columns at grid intersections)
    for gx in [0, 4000, 8000, 12000]:
        for gy in [0, 4000, 8000]:
            entities.append({
                "type": "LWPOLYLINE",
                "layer": "S-COLS",
                "closed": True,
                "vertices": [
                    {"x": gx - 200, "y": gy - 200},
                    {"x": gx + 200, "y": gy - 200},
                    {"x": gx + 200, "y": gy + 200},
                    {"x": gx - 200, "y": gy + 200},
                ],
            })
            # Solid hatch inside column
            entities.append({
                "type": "HATCH",
                "layer": "S-COLS",
                "pattern": "SOLID",
                "boundary": [
                    {"x": gx - 200, "y": gy - 200},
                    {"x": gx + 200, "y": gy - 200},
                    {"x": gx + 200, "y": gy + 200},
                    {"x": gx - 200, "y": gy + 200},
                ],
            })

    # 3. Structural Beams connecting columns
    for gx in [0, 4000, 8000, 12000]:
        entities.append({
            "type": "LINE",
            "layer": "S-BEAM",
            "start": {"x": gx - 150, "y": 0, "z": 0},
            "end": {"x": gx - 150, "y": 8000, "z": 0},
        })
        entities.append({
            "type": "LINE",
            "layer": "S-BEAM",
            "start": {"x": gx + 150, "y": 0, "z": 0},
            "end": {"x": gx + 150, "y": 8000, "z": 0},
        })

    for gy in [0, 4000, 8000]:
        entities.append({
            "type": "LINE",
            "layer": "S-BEAM",
            "start": {"x": 0, "y": gy - 150, "z": 0},
            "end": {"x": 12000, "y": gy - 150, "z": 0},
        })
        entities.append({
            "type": "LINE",
            "layer": "S-BEAM",
            "start": {"x": 0, "y": gy + 150, "z": 0},
            "end": {"x": 12000, "y": gy + 150, "z": 0},
        })

    # 4. Exterior & Interior Architectural Walls (200mm thick)
    # Exterior perimeter
    entities.append({
        "type": "LWPOLYLINE",
        "layer": "A-WALL",
        "closed": True,
        "vertices": [
            {"x": -100, "y": -100},
            {"x": 12100, "y": -100},
            {"x": 12100, "y": 8100},
            {"x": -100, "y": 8100},
        ],
    })
    entities.append({
        "type": "LWPOLYLINE",
        "layer": "A-WALL",
        "closed": True,
        "vertices": [
            {"x": 100, "y": 100},
            {"x": 11900, "y": 100},
            {"x": 11900, "y": 7900},
            {"x": 100, "y": 7900},
        ],
    })

    # Interior dividing wall at x = 4000
    entities.append({
        "type": "LINE",
        "layer": "A-WALL",
        "start": {"x": 3900, "y": 100, "z": 0},
        "end": {"x": 3900, "y": 7900, "z": 0},
    })
    entities.append({
        "type": "LINE",
        "layer": "A-WALL",
        "start": {"x": 4100, "y": 100, "z": 0},
        "end": {"x": 4100, "y": 7900, "z": 0},
    })

    # Interior dividing wall at x = 8000
    entities.append({
        "type": "LINE",
        "layer": "A-WALL",
        "start": {"x": 7900, "y": 100, "z": 0},
        "end": {"x": 7900, "y": 7900, "z": 0},
    })
    entities.append({
        "type": "LINE",
        "layer": "A-WALL",
        "start": {"x": 8100, "y": 100, "z": 0},
        "end": {"x": 8100, "y": 7900, "z": 0},
    })

    # 5. Doors with 90-degree swing arcs (Bulge = tan(90°/4) = 0.41421356)
    for dx, dy in [(4000, 2000), (8000, 2000), (4000, 6000)]:
        # Door leaf line
        entities.append({
            "type": "LINE",
            "layer": "A-DOOR",
            "start": {"x": dx + 100, "y": dy, "z": 0},
            "end": {"x": dx + 100, "y": dy + 900, "z": 0},
        })
        # Door swing arc using true ARC entity
        entities.append({
            "type": "ARC",
            "layer": "A-DOOR",
            "center": {"x": dx + 100, "y": dy, "z": 0},
            "radius": 900,
            "startAngle": 0,
            "endAngle": 90,
        })

    # 6. Windows
    for wx in [2000, 6000, 10000]:
        entities.append({
            "type": "LWPOLYLINE",
            "layer": "A-WINDOW",
            "closed": True,
            "vertices": [
                {"x": wx - 600, "y": -120},
                {"x": wx + 600, "y": -120},
                {"x": wx + 600, "y": 120},
                {"x": wx - 600, "y": 120},
            ],
        })
        # Center mullion line
        entities.append({
            "type": "LINE",
            "layer": "A-WINDOW",
            "start": {"x": wx, "y": -120, "z": 0},
            "end": {"x": wx, "y": 120, "z": 0},
        })

    # 7. HVAC Ductwork (500x300 Supply Duct passing along y = 5500)
    entities.append({
        "type": "LINE",
        "layer": "M-DUCT",
        "start": {"x": 500, "y": 5250, "z": 0},
        "end": {"x": 11500, "y": 5250, "z": 0},
    })
    entities.append({
        "type": "LINE",
        "layer": "M-DUCT",
        "start": {"x": 500, "y": 5750, "z": 0},
        "end": {"x": 11500, "y": 5750, "z": 0},
    })
    # Branch ducts
    for bx in [2000, 6000, 10000]:
        entities.append({
            "type": "LINE",
            "layer": "M-DUCT",
            "start": {"x": bx - 150, "y": 5250, "z": 0},
            "end": {"x": bx - 150, "y": 3000, "z": 0},
        })
        entities.append({
            "type": "LINE",
            "layer": "M-DUCT",
            "start": {"x": bx + 150, "y": 5250, "z": 0},
            "end": {"x": bx + 150, "y": 3000, "z": 0},
        })
        # Diffuser terminal
        entities.append({
            "type": "LWPOLYLINE",
            "layer": "M-DUCT",
            "closed": True,
            "vertices": [
                {"x": bx - 250, "y": 2750},
                {"x": bx + 250, "y": 2750},
                {"x": bx + 250, "y": 3000},
                {"x": bx - 250, "y": 3000},
            ],
        })

    # 8. Plumbing Domestic Cold Water Pipe (Runs along y = 1500)
    entities.append({
        "type": "LINE",
        "layer": "P-PIPE",
        "start": {"x": 800, "y": 1500, "z": 0},
        "end": {"x": 11200, "y": 1500, "z": 0},
    })

    # 9. Ceiling Lighting Fixtures
    for lx in [2000, 6000, 10000]:
        for ly in [2000, 6000]:
            entities.append({
                "type": "CIRCLE",
                "layer": "E-LITE",
                "center": {"x": lx, "y": ly, "z": 0},
                "radius": 150,
            })
            entities.append({
                "type": "LINE",
                "layer": "E-LITE",
                "start": {"x": lx - 200, "y": ly, "z": 0},
                "end": {"x": lx + 200, "y": ly, "z": 0},
            })
            entities.append({
                "type": "LINE",
                "layer": "E-LITE",
                "start": {"x": lx, "y": ly - 200, "z": 0},
                "end": {"x": lx, "y": ly + 200, "z": 0},
            })

    # 10. Dimension Strings
    entities.append({
        "type": "DIMENSION",
        "layer": "A-ANNO-DIMS",
        "start": {"x": 0, "y": -500, "z": 0},
        "end": {"x": 12000, "y": -500, "z": 0},
        "text": "12,000 mm OVERALL WIDTH",
    })
    entities.append({
        "type": "DIMENSION",
        "layer": "A-ANNO-DIMS",
        "start": {"x": -500, "y": 0, "z": 0},
        "end": {"x": -500, "y": 8000, "z": 0},
        "text": "8,000 mm OVERALL DEPTH",
    })

    extents = {
        "min": {"x": -2000.0, "y": -2000.0, "z": 0.0},
        "max": {"x": 14000.0, "y": 10000.0, "z": 0.0},
        "center": {"x": 6000.0, "y": 4000.0, "z": 0.0},
        "width": 16000.0,
        "height": 12000.0,
    }

    return {
        "status": "success",
        "model_name": "Nordic_Commercial_Floor_Plan_A101",
        "file_format": "DWG",
        "units": "mm",
        "spaces": ["Model Space", "A1-Plan Layout"],
        "layers": layers,
        "entities": entities,
        "extents": extents,
        "entity_count": len(entities),
    }
