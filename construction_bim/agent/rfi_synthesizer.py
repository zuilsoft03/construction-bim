"""Automated Request for Information (RFI) Synthesizer Agent for Construction BIM.

Module: construction_bim.agent.rfi_synthesizer
"""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Dict, Optional

import frappe
from frappe import _

logger = logging.getLogger(__name__)


@frappe.whitelist()
def generate_rfi_from_clash(
    clash_name: str,
    question_context: Optional[str] = None,
    proposed_solution: Optional[str] = None,
    assigned_to: Optional[str] = None
) -> Dict[str, Any]:
    """Synthesize a formal Request for Information (RFI) from an engineering clash.

    Connects spatial collision coordinates, element classifications, and proposed remedies
    into a standardized BCF Topic (TopicType='Request') and ERPNext Issue/Task.
    """
    if not frappe.db.exists("BIM Clash", clash_name):
        frappe.throw(_("BIM Clash {0} does not exist").format(clash_name))

    clash = frappe.get_doc("BIM Clash", clash_name)
    clash.check_permission("write")
    frappe.has_permission("BCF Topic", "create", throw=True)
    frappe.has_permission("BCF Viewpoint", "create", throw=True)

    disc_a = getattr(clash, "discipline_a", None) or getattr(clash, "element_a_discipline", "Discipline A")
    disc_b = getattr(clash, "discipline_b", None) or getattr(clash, "element_b_discipline", "Discipline B")
    type_a = getattr(clash, "element_a_type", None) or getattr(clash, "element_type_a", "Element A")
    type_b = getattr(clash, "element_b_type", None) or getattr(clash, "element_type_b", "Element B")
    guid_a = getattr(clash, "element_a_guid", None) or getattr(clash, "guid_a", "")
    guid_b = getattr(clash, "element_b_guid", None) or getattr(clash, "guid_b", "")

    cx = getattr(clash, "collision_point_x", None) or getattr(clash, "collision_x", 0.0)
    cy = getattr(clash, "collision_point_y", None) or getattr(clash, "collision_y", 0.0)
    cz = getattr(clash, "collision_point_z", None) or getattr(clash, "collision_z", 0.0)
    depth = getattr(clash, "penetration_depth", 0.0)

    # 1. Title & Narrative Synthesis
    title = f"RFI: {disc_a} {type_a} conflict with {disc_b} {type_b}"
    if getattr(clash, "storey", None):
        title += f" on {clash.storey}"

    narrative = [
        f"### Request for Information: Spatial Coordination Conflict",
        f"**Originating Conflict**: [{clash.name}](desk#Form/BIM%20Clash/{clash.name})",
        f"- **Trade A**: {disc_a} ({type_a} `{guid_a}`)",
        f"- **Trade B**: {disc_b} ({type_b} `{guid_b}`)",
        f"- **World Coordinates (Z-Up)**: X={cx:.3f}m, Y={cy:.3f}m, Z={cz:.3f}m",
        f"- **Physical Overlap Depth**: {depth:.1f} mm",
        "",
        "#### Engineering Clarification Requested:",
        question_context or f"Physical intersection detected between {disc_a} and {disc_b} components. Please confirm acceptable rerouting or penetrations per structural/MEP design criteria.",
        "",
        "#### Proposed Engineering Resolution:",
        proposed_solution or f"Evaluate lowering/shifting {disc_a} {type_a} to maintain minimum clearance or provide approved wall/slab sleeve."
    ]
    full_narrative = "\n".join(narrative)

    # 2. Resolve BCF Project
    bcf_proj = None
    if clash.project and frappe.db.exists("BCF Project", {"erpnext_project": clash.project}):
        bcf_proj = frappe.db.get_value("BCF Project", {"erpnext_project": clash.project}, "name")
    if not bcf_proj:
        projs = frappe.get_all("BCF Project", limit_page_length=1)
        bcf_proj = projs[0].name if projs else None

    # 3. Create BCF Topic (Request)
    topic = frappe.new_doc("BCF Topic")
    topic.guid = str(uuid.uuid4())
    topic.bcf_project = bcf_proj
    topic.title = title
    topic.topic_type = "Request"
    topic.topic_status = "Open"
    topic.priority = "High" if depth and depth > 50 else "Medium"
    topic.description = full_narrative
    topic.bim_clash = clash.name
    topic.assigned_to = assigned_to or clash.assigned_to
    topic.labels = json.dumps(["RFI", disc_a, disc_b])
    topic.insert()

    # 4. Attach Viewpoint
    vp = frappe.new_doc("BCF Viewpoint")
    vp.guid = str(uuid.uuid4())
    vp.topic = topic.name
    vp.viewpoint_type = "Perspective"
    vp.camera_position = json.dumps({"x": round(float(cx) + 2.5, 4), "y": round(float(cy) - 2.5, 4), "z": round(float(cz) + 2.0, 4)})
    vp.camera_direction = json.dumps({"x": -0.6, "y": 0.6, "z": -0.5})
    vp.camera_up_vector = json.dumps({"x": 0.0, "y": 0.0, "z": 1.0})
    vp.field_of_view = 60.0
    vp.selection = json.dumps([{"ifc_guid": guid_a}, {"ifc_guid": guid_b}])
    vp.insert()

    topic.default_viewpoint = vp.name
    topic.save()

    # Link back to clash
    clash.bcf_topic = topic.name
    clash.bcf_guid = topic.guid
    clash.viewpoint = vp.name
    clash.save()
    frappe.db.commit()

    return {
        "status": "success",
        "rfi_title": title,
        "narrative": full_narrative,
        "bcf_topic": topic.name,
        "bcf_guid": topic.guid,
        "bcf_viewpoint": vp.name,
        "clash": clash.name
    }
