"""Clash detection batch management and discussion API for Construction BIM.

Endpoints:
- save_clashes_batch: Bulk sync detected collisions with deduplication.
- get_clashes: Query clashes filtered by project, model, status, severity.
- get_clash: Retrieve single clash with comments and viewpoint.
- add_clash_comment: Add threaded discussion comment.
- update_clash_status: Update resolution lifecycle status.
- delete_clash: Delete clash record.
"""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any

import frappe
from frappe import _

logger = logging.getLogger(__name__)


@frappe.whitelist()
def save_clashes_batch(
    clashes: str | list[dict[str, Any]],
    project: str | None = None,
    model_a: str | None = None,
    model_b: str | None = None,
) -> dict[str, Any]:
    """
    Save detected clashes in bulk, updating matching active records and creating new records as needed.
    
    Parameters:
    	clashes (str | list[dict[str, Any]]): Clash data as a list of dictionaries or a JSON string.
    	project (str | None): Default project applied when an item does not specify one.
    	model_a (str | None): Default first model applied when an item does not specify one.
    	model_b (str | None): Default second model applied when an item does not specify one.
    
    Returns:
    	dict[str, Any]: A result containing the operation status and counts of created, updated, and skipped clashes, along with the affected record names.
    """
    if hasattr(frappe, "has_permission") and not frappe.has_permission("BIM Clash", "create"):
        frappe.throw(_("Not permitted to create or update BIM Clash records"), frappe.PermissionError)

    if isinstance(clashes, str):
        try:
            clash_list = json.loads(clashes)
        except Exception as e:
            frappe.throw(_("Invalid JSON in clashes parameter: {0}").format(e))
    elif isinstance(clashes, list):
        clash_list = clashes
    else:
        frappe.throw(_("clashes must be a list or JSON string"))

    if not clash_list:
        return {"status": "success", "created": 0, "updated": 0, "skipped": 0, "total": 0, "clashes": []}

    created_count = 0
    updated_count = 0
    skipped_count = 0
    result_names: list[str] = []

    for item in clash_list:
        c_proj = item.get("project") or project
        c_model_a = item.get("model_a") or model_a
        c_model_b = item.get("model_b") or model_b
        guid_a = item.get("element_a_guid") or item.get("guid_a") or str(item.get("element_a_id") or "")
        guid_b = item.get("element_b_guid") or item.get("guid_b") or str(item.get("element_b_id") or "")

        if not c_model_a or not c_model_b:
            continue

        # Check existing matching collision pair
        existing = _find_existing_clash(c_model_a, c_model_b, guid_a, guid_b, c_proj)

        # Extract coordinates
        cx = item.get("collision_x")
        if cx is None:
            cx = item.get("collision_point_x")
        if cx is None and isinstance(item.get("collision_point"), dict):
            cx = item.get("collision_point", {}).get("x")

        cy = item.get("collision_y")
        if cy is None:
            cy = item.get("collision_point_y")
        if cy is None and isinstance(item.get("collision_point"), dict):
            cy = item.get("collision_point", {}).get("y")

        cz = item.get("collision_z")
        if cz is None:
            cz = item.get("collision_point_z")
        if cz is None and isinstance(item.get("collision_point"), dict):
            cz = item.get("collision_point", {}).get("z")

        vp_raw = item.get("viewpoint_json") or item.get("viewpoint")
        vp_str = json.dumps(vp_raw) if isinstance(vp_raw, dict) else vp_raw

        if existing:
            # If clash exists and is not closed/ignored, update physical metrics
            if existing.status not in ("Closed", "Ignored"):
                if cx is not None:
                    existing.collision_x = existing.collision_point_x = float(cx)
                if cy is not None:
                    existing.collision_y = existing.collision_point_y = float(cy)
                if cz is not None:
                    existing.collision_z = existing.collision_point_z = float(cz)
                if item.get("penetration_depth") is not None:
                    existing.penetration_depth = float(item["penetration_depth"])
                if item.get("intersection_volume") is not None:
                    existing.intersection_volume = float(item["intersection_volume"])
                if vp_str:
                    existing.viewpoint_json = vp_str
                    existing.viewpoint = vp_str
                if item.get("severity"):
                    existing.severity = item["severity"]
                existing.save()
                try:
                    sync_clash_to_bcf(existing)
                except Exception as e:
                    logger.warning(f"Could not auto-sync BCF for clash {existing.name}: {e}")
                updated_count += 1
                result_names.append(existing.name)
            else:
                skipped_count += 1
        else:
            # Create new clash record
            doc = frappe.new_doc("BIM Clash")
            doc.title = item.get("title") or f"Clash: {item.get('element_a_type') or 'Element A'} vs {item.get('element_b_type') or 'Element B'}"
            doc.project = c_proj
            doc.model_a = c_model_a
            doc.model_b = c_model_b
            doc.element_a = item.get("element_a")
            doc.element_a_guid = doc.guid_a = guid_a
            doc.element_a_id = item.get("element_a_id")
            doc.element_a_name = item.get("element_a_name") or item.get("name_a")
            doc.element_a_type = doc.element_type_a = item.get("element_a_type") or item.get("element_type_a")
            doc.discipline_a = doc.element_a_discipline = item.get("discipline_a") or item.get("element_a_discipline")

            doc.element_b = item.get("element_b")
            doc.element_b_guid = doc.guid_b = guid_b
            doc.element_b_id = item.get("element_b_id")
            doc.element_b_name = item.get("element_b_name") or item.get("name_b")
            doc.element_b_type = doc.element_type_b = item.get("element_b_type") or item.get("element_type_b")
            doc.discipline_b = doc.element_b_discipline = item.get("discipline_b") or item.get("element_b_discipline")

            doc.severity = item.get("severity") or "Major"
            doc.status = item.get("status") or "Open"
            doc.clash_type = item.get("clash_type") or "Hard"
            doc.priority = item.get("priority") or "Medium"

            if cx is not None:
                doc.collision_x = doc.collision_point_x = float(cx)
            if cy is not None:
                doc.collision_y = doc.collision_point_y = float(cy)
            if cz is not None:
                doc.collision_z = doc.collision_point_z = float(cz)

            if item.get("penetration_depth") is not None:
                doc.penetration_depth = float(item["penetration_depth"])
            if item.get("intersection_volume") is not None:
                doc.intersection_volume = float(item["intersection_volume"])
            doc.storey = item.get("storey")
            doc.grid_location = item.get("grid_location")
            doc.assigned_to = item.get("assigned_to")
            doc.description = item.get("description")

            if not vp_str:
                cx_val = float(cx) if cx is not None else 0.0
                cy_val = float(cy) if cy is not None else 0.0
                cz_val = float(cz) if cz is not None else 0.0
                vp_dict = {
                    "perspective_camera": {
                        "camera_view_point": {"x": round(cx_val + 2.5, 4), "y": round(cy_val - 2.5, 4), "z": round(cz_val + 2.0, 4)},
                        "camera_direction": {"x": -0.6, "y": 0.6, "z": -0.5},
                        "camera_up_vector": {"x": 0.0, "y": 0.0, "z": 1.0},
                        "field_of_view": 60.0,
                    },
                    "components": {
                        "selection": [{"ifc_guid": guid_a}, {"ifc_guid": guid_b}],
                        "coloring": [
                            {"color": "#FF0000", "components": [{"ifc_guid": guid_a}]},
                            {"color": "#FFFF00", "components": [{"ifc_guid": guid_b}]},
                        ],
                        "visibility": {
                            "default_visibility": False,
                            "exceptions": [{"ifc_guid": guid_a}, {"ifc_guid": guid_b}],
                        },
                    },
                }
                vp_str = json.dumps(vp_dict)

            if vp_str:
                doc.viewpoint_json = vp_str
                doc.viewpoint = vp_str

            doc.insert()
            try:
                sync_clash_to_bcf(doc)
            except Exception as e:
                logger.warning(f"Could not auto-sync BCF for clash {doc.name}: {e}")
            created_count += 1
            result_names.append(doc.name)

    frappe.db.commit()

    return {
        "status": "success",
        "created": created_count,
        "updated": updated_count,
        "skipped": skipped_count,
        "total": len(clash_list),
        "clashes": result_names,
    }


def _find_existing_clash(
    model_a: str, model_b: str, guid_a: str, guid_b: str, project: str | None = None
) -> Any | None:
    """Find existing clash matching (A, B) or (B, A)."""
    filters_direct = {
        "model_a": model_a,
        "model_b": model_b,
        "guid_a": guid_a,
        "guid_b": guid_b,
    }
    if project:
        filters_direct["project"] = project

    direct_match = frappe.get_all("BIM Clash", filters=filters_direct, limit_page_length=1)
    if direct_match:
        return frappe.get_doc("BIM Clash", direct_match[0].name)

    # Symmetric match
    filters_sym = {
        "model_a": model_b,
        "model_b": model_a,
        "guid_a": guid_b,
        "guid_b": guid_a,
    }
    if project:
        filters_sym["project"] = project

    sym_match = frappe.get_all("BIM Clash", filters=filters_sym, limit_page_length=1)
    if sym_match:
        return frappe.get_doc("BIM Clash", sym_match[0].name)

    return None


@frappe.whitelist()
def get_clashes(
    project: str | None = None,
    model: str | None = None,
    status: str | None = None,
    severity: str | None = None,
    limit: int = 500,
) -> list[dict[str, Any]]:
    """Retrieve filtered list of BIM Clashes with viewpoints and comment counts."""
    conditions = ["1=1"]
    args: list[Any] = []

    if project:
        conditions.append("c.project = %s")
        args.append(project)

    if model:
        conditions.append("(c.model_a = %s OR c.model_b = %s)")
        args.extend([model, model])

    if status:
        if isinstance(status, str) and "," in status:
            statuses = [s.strip() for s in status.split(",") if s.strip()]
            placeholders = ", ".join(["%s"] * len(statuses))
            conditions.append(f"c.status IN ({placeholders})")
            args.extend(statuses)
        else:
            conditions.append("c.status = %s")
            args.append(status)

    if severity:
        conditions.append("c.severity = %s")
        args.append(severity)

    query = f"""
        SELECT
            c.name, c.title, c.project, c.status, c.severity, c.clash_type, c.priority,
            c.assigned_to, c.due_date, c.clash_id, c.bcf_guid,
            c.model_a, c.element_a, c.element_a_guid, c.guid_a, c.element_a_name, c.element_a_type, c.discipline_a,
            c.model_b, c.element_b, c.element_b_guid, c.guid_b, c.element_b_name, c.element_b_type, c.discipline_b,
            c.collision_x, c.collision_y, c.collision_z,
            c.collision_point_x, c.collision_point_y, c.collision_point_z,
            c.penetration_depth, c.intersection_volume, c.storey, c.grid_location,
            c.viewpoint_json, c.viewpoint, c.resolution_type, c.resolved_by, c.resolution_date,
            c.creation, c.modified,
            (SELECT COUNT(*) FROM `tabComment` WHERE reference_doctype='BIM Clash' AND reference_name=c.name) as comment_count
        FROM `tabBIM Clash` c
        WHERE {' AND '.join(conditions)}
        ORDER BY c.creation DESC
        LIMIT %s
    """
    args.append(int(limit))

    rows = frappe.db.sql(query, args, as_dict=True)

    # Normalize viewpoints into dictionaries
    for row in rows:
        vp = row.get("viewpoint_json") or row.get("viewpoint")
        if isinstance(vp, str):
            try:
                row["viewpoint"] = json.loads(vp)
            except Exception:
                row["viewpoint"] = {}
        elif isinstance(vp, dict):
            row["viewpoint"] = vp
        else:
            row["viewpoint"] = {}

        if not row["viewpoint"] or "perspective_camera" not in row["viewpoint"]:
            guid_a = row.get("element_a_guid") or row.get("guid_a") or "ELEM_A"
            guid_b = row.get("element_b_guid") or row.get("guid_b") or "ELEM_B"
            cx = float(row.get("collision_x") or row.get("collision_point_x") or 0.0)
            cy = float(row.get("collision_y") or row.get("collision_point_y") or 0.0)
            cz = float(row.get("collision_z") or row.get("collision_point_z") or 0.0)
            row["viewpoint"] = {
                "perspective_camera": {
                    "camera_view_point": {"x": round(cx + 2.5, 4), "y": round(cy - 2.5, 4), "z": round(cz + 2.0, 4)},
                    "camera_direction": {"x": -0.6, "y": 0.6, "z": -0.5},
                    "camera_up_vector": {"x": 0.0, "y": 0.0, "z": 1.0},
                    "field_of_view": 60.0,
                },
                "components": {
                    "selection": [{"ifc_guid": guid_a}, {"ifc_guid": guid_b}],
                    "coloring": [
                        {"color": "#FF0000", "components": [{"ifc_guid": guid_a}]},
                        {"color": "#FFFF00", "components": [{"ifc_guid": guid_b}]},
                    ],
                    "visibility": {
                        "default_visibility": False,
                        "exceptions": [{"ifc_guid": guid_a}, {"ifc_guid": guid_b}],
                    },
                },
            }

    return rows


@frappe.whitelist()
def get_clash(clash_name: str) -> dict[str, Any]:
    """Retrieve full details for a single clash including comments and BCF viewpoint."""
    if hasattr(frappe, "has_permission") and not frappe.has_permission("BIM Clash", "read"):
        frappe.throw(_("Not permitted to view BIM Clash records"), frappe.PermissionError)

    if not frappe.db.exists("BIM Clash", clash_name):
        frappe.throw(_("BIM Clash {0} does not exist").format(clash_name))

    doc = frappe.get_doc("BIM Clash", clash_name)
    if hasattr(doc, "check_permission"):
        doc.check_permission("read")

    comments = frappe.get_all(
        "Comment",
        filters={"reference_doctype": "BIM Clash", "reference_name": clash_name},
        fields=["name", "content", "comment_by", "creation", "comment_type"],
        order_by="creation ASC",
    )

    data = doc.as_dict()
    data["viewpoint"] = doc.get_viewpoint()
    data["comments"] = comments
    return data


@frappe.whitelist()
def add_clash_comment(clash_name: str, comment_text: str, user: str | None = None) -> dict[str, Any]:
    """Add a threaded discussion comment to a BIM Clash."""
    if hasattr(frappe, "has_permission") and not frappe.has_permission("BIM Clash", "write"):
        frappe.throw(_("Not permitted to comment on BIM Clash records"), frappe.PermissionError)

    if not frappe.db.exists("BIM Clash", clash_name):
        frappe.throw(_("BIM Clash {0} does not exist").format(clash_name))

    doc = frappe.get_doc("BIM Clash", clash_name)
    if hasattr(doc, "check_permission"):
        doc.check_permission("write")
    return doc.add_discussion_comment(comment_text, user=user)


@frappe.whitelist()
def update_clash_status(
    clash_name: str,
    status: str,
    resolution_notes: str | None = None,
    resolution_type: str | None = None,
) -> dict[str, Any]:
    """Update clash status, resolution notes, and resolution audit trail."""
    if hasattr(frappe, "has_permission") and not frappe.has_permission("BIM Clash", "write"):
        frappe.throw(_("Not permitted to update BIM Clash records"), frappe.PermissionError)

    if not frappe.db.exists("BIM Clash", clash_name):
        frappe.throw(_("BIM Clash {0} does not exist").format(clash_name))

    valid_statuses = ("Open", "In Review", "Resolved", "Closed", "Ignored")
    if status not in valid_statuses:
        frappe.throw(_("Status must be one of {0}").format(", ".join(valid_statuses)))

    doc = frappe.get_doc("BIM Clash", clash_name)
    if hasattr(doc, "check_permission"):
        doc.check_permission("write")

    doc.status = status
    if status == "Resolved":
        if not doc.resolved_by:
            doc.resolved_by = getattr(frappe.session, "user", "Administrator") if hasattr(frappe, "session") else "Administrator"
        if not doc.resolution_date:
            import time
            now_fn = getattr(frappe.utils, "now", lambda: time.strftime("%Y-%m-%d %H:%M:%S")) if hasattr(frappe, "utils") else lambda: time.strftime("%Y-%m-%d %H:%M:%S")
            doc.resolution_date = now_fn()
    if resolution_notes:
        doc.resolution_notes = resolution_notes
    if resolution_type:
        doc.resolution_type = resolution_type

    doc.save()
    frappe.db.commit()

    return {
        "name": doc.name,
        "status": doc.status,
        "resolved_by": doc.resolved_by,
        "resolution_date": str(doc.resolution_date) if doc.resolution_date else None,
        "resolution_notes": doc.resolution_notes,
    }


@frappe.whitelist()
def delete_clash(clash_name: str) -> dict[str, str]:
    """
    Delete a BIM clash record.
    
    Parameters:
    	clash_name (str): Name of the clash record to delete.
    
    Returns:
    	dict[str, str]: A mapping containing the name of the deleted clash.
    """
    if hasattr(frappe, "has_permission") and not frappe.has_permission("BIM Clash", "delete"):
        frappe.throw(_("Not permitted to delete BIM Clash records"), frappe.PermissionError)

    doc = frappe.get_doc("BIM Clash", clash_name)
    if hasattr(doc, "check_permission"):
        doc.check_permission("delete")

    frappe.delete_doc("BIM Clash", clash_name)
    frappe.db.commit()
    return {"deleted": clash_name}


@frappe.whitelist()
def sync_clash_to_bcf(clash: str | Any) -> dict[str, Any]:
    """Ensure a BIM Clash record is synchronized with its BCF project, topic, and viewpoint.
    
    Parameters:
    	clash (str | Any): A BIM Clash document name or document object to synchronize.
    
    Returns:
    	dict[str, Any]: Synchronization status and the identifiers of the clash, BCF topic, BCF GUID, and viewpoint.
    """
    if isinstance(clash, str):
        clash_doc = frappe.get_doc("BIM Clash", clash)
    else:
        clash_doc = clash

    # 1. Resolve or create BCF Project
    bcf_project_name = None
    if clash_doc.project and frappe.db.exists("BCF Project", {"erpnext_project": clash_doc.project}):
        bcf_project_name = frappe.db.get_value("BCF Project", {"erpnext_project": clash_doc.project}, "name")

    if not bcf_project_name:
        default_proj = frappe.get_all("BCF Project", limit_page_length=1)
        if default_proj:
            bcf_project_name = default_proj[0].name
        else:
            new_p = frappe.new_doc("BCF Project")
            new_p.project_name = clash_doc.project or "General BIM Coordination"
            new_p.erpnext_project = clash_doc.project
            new_p.insert(ignore_permissions=True)
            bcf_project_name = new_p.name

    # 2. Check or create BCF Topic
    topic_doc = None
    if clash_doc.bcf_topic and frappe.db.exists("BCF Topic", clash_doc.bcf_topic):
        topic_doc = frappe.get_doc("BCF Topic", clash_doc.bcf_topic)
    else:
        topic_doc = frappe.new_doc("BCF Topic")
        topic_doc.guid = clash_doc.bcf_guid or str(uuid.uuid4())
        topic_doc.bcf_project = bcf_project_name
        topic_doc.bim_clash = clash_doc.name
        topic_doc.insert(ignore_permissions=True)
        clash_doc.bcf_topic = topic_doc.name
        clash_doc.bcf_guid = topic_doc.guid

    # Sync topic properties
    topic_doc.title = clash_doc.title or f"Clash: {clash_doc.element_a_type or 'A'} vs {clash_doc.element_b_type or 'B'}"
    topic_doc.topic_type = "Clash"
    topic_doc.priority = clash_doc.priority or "High"
    status_map = {
        "Open": "Open",
        "In Review": "In Progress",
        "Resolved": "Resolved",
        "Closed": "Closed",
        "Ignored": "Closed"
    }
    topic_doc.topic_status = status_map.get(clash_doc.status, "Open")
    topic_doc.due_date = clash_doc.due_date
    topic_doc.assigned_to = clash_doc.assigned_to
    topic_doc.save(ignore_permissions=True)

    # 3. Create or update BCF Viewpoint
    vp_doc = None
    if clash_doc.viewpoint and frappe.db.exists("BCF Viewpoint", clash_doc.viewpoint):
        vp_doc = frappe.get_doc("BCF Viewpoint", clash_doc.viewpoint)
    else:
        vp_doc = frappe.new_doc("BCF Viewpoint")
        vp_doc.guid = str(uuid.uuid4())
        vp_doc.topic = topic_doc.name
        vp_doc.viewpoint_type = "Perspective"

        cx = float(getattr(clash_doc, "collision_point_x", None) or getattr(clash_doc, "collision_x", None) or 0.0)
        cy = float(getattr(clash_doc, "collision_point_y", None) or getattr(clash_doc, "collision_y", None) or 0.0)
        cz = float(getattr(clash_doc, "collision_point_z", None) or getattr(clash_doc, "collision_z", None) or 0.0)

        vp_doc.camera_position = json.dumps({"x": round(cx + 2.5, 4), "y": round(cy - 2.5, 4), "z": round(cz + 2.0, 4)})
        vp_doc.camera_direction = json.dumps({"x": -0.6, "y": 0.6, "z": -0.5})
        vp_doc.camera_up_vector = json.dumps({"x": 0.0, "y": 0.0, "z": 1.0})
        vp_doc.field_of_view = 60.0

        guid_a = getattr(clash_doc, "element_a_guid", None) or getattr(clash_doc, "guid_a", None)
        guid_b = getattr(clash_doc, "element_b_guid", None) or getattr(clash_doc, "guid_b", None)
        sels = []
        if guid_a:
            sels.append({"ifc_guid": guid_a})
        if guid_b:
            sels.append({"ifc_guid": guid_b})
        vp_doc.selection = json.dumps(sels)
        vp_doc.insert(ignore_permissions=True)

        clash_doc.viewpoint = vp_doc.name
        topic_doc.default_viewpoint = vp_doc.name
        topic_doc.save(ignore_permissions=True)

    if hasattr(clash_doc, "save"):
        clash_doc.save(ignore_permissions=True)

    return {
        "status": "success",
        "clash": clash_doc.name,
        "bcf_topic": topic_doc.name,
        "bcf_guid": topic_doc.guid,
        "bcf_viewpoint": vp_doc.name if vp_doc else None
    }

