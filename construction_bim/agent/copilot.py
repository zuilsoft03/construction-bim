"""In-Viewer Conversational AI Copilot & Role Workflow Assistant for Construction BIM.

Module: construction_bim.agent.copilot
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

import frappe
from frappe import _

logger = logging.getLogger(__name__)

ROLE_PROMPTS = {
    "Architect": "You are a Senior Project Architect. Focus on space programming, zoning codes, envelope aesthetics, room finish schedules, and design revision integrity.",
    "Structural Engineer": "You are a Lead Structural Engineer. Focus on load paths, concrete compressive strength, reinforcement tonnages, deflection limits, and structural clearance clashes.",
    "MEP Engineer": "You are a Chief MEP/HVAC Engineer. Focus on duct friction losses, pipe slope tolerances, electrical cable tray routing, service accessibility, and coordination sleeves.",
    "Project Manager": "You are a Construction Project Manager & Quantity Surveyor. Focus on Earned Value Management (EVM), schedule milestones, critical path delays, procurement variance, and subcontractor claims.",
    "Site Supervisor": "You are a Field Construction Superintendent. Focus on practical constructability, daily labor productivity, safety compliance (OSHA/OSH), material delivery staging, and rapid field snag resolution."
}


@frappe.whitelist()
def query_copilot_assistant(
    prompt: str,
    role: str = "Project Manager",
    project_id: Optional[str] = None,
    model_id: Optional[str] = None,
    selected_guid: Optional[str] = None
) -> Dict[str, Any]:
    """
    Process a natural-language BIM and construction coordination query using project and model context.
    
    Parameters:
        prompt (str): The coordination question or request.
        role (str): The assistant persona to use; unknown roles use the Project Manager persona.
        project_id (Optional[str]): Project identifier used to gather task and clash context.
        model_id (Optional[str]): BIM model identifier associated with the query.
        selected_guid (Optional[str]): IFC or BIM element GUID used to retrieve selected-element data.
    
    Returns:
        Dict[str, Any]: A success response containing the selected role, generated response text,
            viewer actions, and gathered context.
    
    Raises:
        frappe.ValidationError: If prompt is empty or contains only whitespace.
    """
    if not prompt or not prompt.strip():
        frappe.throw(_("Prompt cannot be empty"))

    clean_prompt = prompt.strip().lower()
    system_persona = ROLE_PROMPTS.get(role, ROLE_PROMPTS["Project Manager"])

    # 1. Inspect Context
    context_data: Dict[str, Any] = {}

    if selected_guid:
        el_rows = frappe.get_all(
            "BIM Element",
            filters={"ifc_guid": selected_guid},
            fields=["name", "element_name", "element_type", "storey", "volume", "area", "length"]
        )
        if not el_rows:
            el_rows = frappe.get_all(
                "BIM Element",
                filters={"guid": selected_guid},
                fields=["name", "element_name", "element_type", "storey", "volume", "area", "length"]
            )
        if el_rows:
            context_data["selected_element"] = el_rows[0]

    if project_id:
        context_data["task_count"] = frappe.db.count("Task", {"project": project_id})
        context_data["open_clash_count"] = frappe.db.count("BIM Clash", {"project": project_id, "status": "Open"})

    # 2. Rule-Based Synthesis & Fast-Path Responses
    actions: List[Dict[str, Any]] = []
    response_text = ""

    if "clash" in clean_prompt or "conflict" in clean_prompt:
        clashes = frappe.get_all(
            "BIM Clash",
            filters={"project": project_id} if project_id else {},
            fields=["name", "title", "severity", "discipline_a", "discipline_b", "element_a_guid", "element_b_guid"],
            limit_page_length=5
        )
        if clashes:
            response_text = f"Found {len(clashes)} critical spatial coordination issues for review:\n"
            for c in clashes:
                response_text += f"- **{c.name}**: {c.title} ({c.severity})\n"
            actions.append({"type": "highlight_clashes", "clash_ids": [c.name for c in clashes]})
        else:
            response_text = "No open clashes detected in the active model."

    elif "volume" in clean_prompt or "quantity" in clean_prompt or "takeoff" in clean_prompt:
        if selected_guid and "selected_element" in context_data:
            el = context_data["selected_element"]
            response_text = (
                f"Element `{el.get('element_name') or selected_guid}` ({el.get('element_type')}):\n"
                f"- **Volume**: {float(el.get('volume') or 0.0):.3f} m³\n"
                f"- **Area**: {float(el.get('area') or 0.0):.2f} m²\n"
                f"- **Storey**: {el.get('storey') or 'Ground Floor'}"
            )
        else:
            response_text = "Select a 3D building element or specify an IFC model to view automated quantity takeoffs."

    elif "schedule" in clean_prompt or "task" in clean_prompt or "delay" in clean_prompt:
        tasks = frappe.get_all(
            "Task",
            filters={"project": project_id} if project_id else {},
            fields=["name", "subject", "status", "exp_end_date"],
            limit_page_length=5
        )
        response_text = f"Project schedule overview ({len(tasks)} work packages):\n"
        for t in tasks:
            response_text += f"- **{t.subject}**: {t.status} (Due: {t.exp_end_date or 'TBD'})\n"
        actions.append({"type": "activate_4d_schedule_colors"})

    else:
        # General role assistance
        response_text = (
            f"**Assistant ({role})**: I am monitoring spatial geometry and project metadata. "
            f"You can ask me to evaluate clashes, inspect element takeoff quantities, generate RFIs, "
            f"or visualize 4D construction schedule progress."
        )

    return {
        "status": "success",
        "role": role,
        "system_persona": system_persona,
        "response": response_text,
        "actions": actions,
        "context": context_data
    }
