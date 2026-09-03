"""Consolidated API endpoints for Construction BIM."""

from __future__ import annotations

import frappe

# Clash detection endpoints
from .clash import (
    save_clashes_batch,
    get_clashes,
    get_clash,
    add_clash_comment,
    update_clash_status,
    delete_clash,
)

# BOM Integration endpoints
from .bom_integration import (
    get_model_quantity_summary,
    preview_bom_generation,
    generate_or_update_bom,
)

# CAD & BCF endpoints
from .cad import (
    save_cad_issue,
    get_cad_issues,
    add_issue_comment,
    update_issue_status,
    export_bcf_zip,
    import_bcf_zip,
    get_sample_cad_drawing,
)

# Initiation endpoints
from .initiation import (
    get_initiation_status,
    upload_intake_file,
    parse_boq_file,
    commit_boq_estimate,
    download_boq_template,
    align_model_coordinates,
    approve_project_initiation,
)

__all__ = [
    "save_clashes_batch",
    "get_clashes",
    "get_clash",
    "add_clash_comment",
    "update_clash_status",
    "delete_clash",
    "get_model_quantity_summary",
    "preview_bom_generation",
    "generate_or_update_bom",
    "purge_test_bim_data",
    "get_4d_schedule_coloring",
    "save_cad_issue",
    "get_cad_issues",
    "add_issue_comment",
    "update_issue_status",
    "export_bcf_zip",
    "import_bcf_zip",
    "get_sample_cad_drawing",
    "get_initiation_status",
    "upload_intake_file",
    "parse_boq_file",
    "commit_boq_estimate",
    "download_boq_template",
    "align_model_coordinates",
    "approve_project_initiation",
]


@frappe.whitelist()
def purge_test_bim_data() -> dict:
    """Purge orphaned BIM BOQ Links, test BOMs, and test Items."""
    deleted_boq_links = 0
    deleted_boms = 0
    deleted_items = 0

    # 1. Purge all BIM BOQ Links
    boq_links = frappe.get_all("BIM BOQ Link", pluck="name")
    for link_name in boq_links:
        frappe.delete_doc("BIM BOQ Link", link_name, ignore_permissions=True, force=True)
        deleted_boq_links += 1

    # 2. Purge test BOMs
    test_boms = frappe.get_all("BOM", filters={"item": ["like", "%Test%"]}, pluck="name")
    for bom_name in test_boms:
        frappe.db.set_value("BOM", bom_name, "is_default", 0)
        frappe.delete_doc("BOM", bom_name, ignore_permissions=True, force=True)
        deleted_boms += 1

    other_boms = frappe.get_all("BOM", filters={"item": "_Test Building Target Item"}, pluck="name")
    for bom_name in other_boms:
        frappe.db.set_value("BOM", bom_name, "is_default", 0)
        frappe.delete_doc("BOM", bom_name, ignore_permissions=True, force=True)
        deleted_boms += 1

    # 3. Purge test Items
    test_item_names = ["_Test Building Target Item", "_Test Building Item", "CONC-01"]
    for item_code in test_item_names:
        if frappe.db.exists("Item", item_code):
            frappe.db.set_value("Item", item_code, "default_bom", None)
            frappe.delete_doc("Item", item_code, ignore_permissions=True, force=True)
            deleted_items += 1

    frappe.db.commit()

    return {
        "status": "success",
        "deleted_boq_links": deleted_boq_links,
        "deleted_boms": deleted_boms,
        "deleted_items": deleted_items,
    }


@frappe.whitelist()
def get_4d_schedule_coloring(project_id: str) -> dict:
    """Retrieve 4D visual schedule simulation color mapping for 3D elements in a project.

    Status Color Palette:
    - Completed:  #00AA00 (Green)
    - Working:    #0088FF (Blue - Active Installation)
    - Overdue:    #FF0000 (Red - Critical Schedule Delay)
    - Scheduled:  #FFAA00 (Yellow - Upcoming Work Package)
    - Unlinked:   #CCCCCC (Grey - 15% Ghosting)
    """
    import json
    import time

    today = time.strftime("%Y-%m-%d")

    # 1. Fetch tasks for project
    tasks = frappe.get_all(
        "Task",
        filters={"project": project_id},
        fields=["name", "subject", "status", "exp_start_date", "exp_end_date", "priority"]
    )

    task_map = {t.name: t for t in tasks}

    # 2. Map elements through BCF Topics and BIM BOQ Links
    element_colors = []
    seen_guids = set()

    # BCF Topic links
    all_topics = frappe.get_all(
        "BCF Topic",
        fields=["name", "erpnext_task", "default_viewpoint"]
    ) if task_map else []
    topics = [t for t in all_topics if t.get("erpnext_task") in task_map]

    for top in topics:
        task = task_map.get(top.erpnext_task)
        if not task:
            continue

        color, status_label = _calculate_4d_color(task, today)

        # Get elements from viewpoint selection
        if top.default_viewpoint and frappe.db.exists("BCF Viewpoint", top.default_viewpoint):
            vp = frappe.get_doc("BCF Viewpoint", top.default_viewpoint)
            try:
                sels = json.loads(vp.selection or "[]")
                for s in sels:
                    gid = s.get("ifc_guid")
                    if gid and gid not in seen_guids:
                        seen_guids.add(gid)
                        element_colors.append({
                            "ifc_guid": gid,
                            "color": color,
                            "status": status_label,
                            "task_id": task.name,
                            "task_subject": task.subject,
                            "end_date": str(task.exp_end_date or "")
                        })
            except Exception:
                pass

    # BIM BOQ Link mapping
    model_docs = frappe.get_all("BIM Model", filters={"project": project_id}, fields=["name"])
    models = [m.name for m in model_docs]
    for m_name in models:
        elements = frappe.get_all(
            "BIM Element",
            filters={"model": m_name},
            fields=["guid", "ifc_guid", "element_type", "storey"]
        )
        for el in elements:
            gid = el.ifc_guid or el.guid
            if gid and gid not in seen_guids:
                # Default unassigned / planned state
                seen_guids.add(gid)
                element_colors.append({
                    "ifc_guid": gid,
                    "color": "#CCCCCC",
                    "status": "Unlinked",
                    "task_id": None,
                    "task_subject": None,
                    "end_date": None
                })

    return {
        "project": project_id,
        "total_elements": len(element_colors),
        "elements": element_colors,
        "legend": {
            "Completed": "#00AA00",
            "Working": "#0088FF",
            "Overdue": "#FF0000",
            "Scheduled": "#FFAA00",
            "Unlinked": "#CCCCCC"
        }
    }


def _calculate_4d_color(task: Any, today: str) -> tuple[str, str]:
    t_status = getattr(task, "status", "Open")
    exp_end = str(getattr(task, "exp_end_date", "") or "")

    if t_status == "Completed":
        return "#00AA00", "Completed"
    elif t_status == "Working":
        if exp_end and exp_end < today:
            return "#FF0000", "Overdue"
        return "#0088FF", "Working"
    elif exp_end and exp_end < today:
        return "#FF0000", "Overdue"
    else:
        return "#FFAA00", "Scheduled"

