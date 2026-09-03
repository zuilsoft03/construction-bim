"""Persona-Driven Workspaces and Role Dashboard Engine for Construction BIM.

Provides role-specific cockpit views for:
1. Architect (Design reviews, revision tracking, spatial finishes)
2. Structural & MEP Engineer (Clash matrices, BVH collision alerts, clearances)
3. Project Manager & QS (Earned value, contracts, variation orders, progress claims, budgets)
4. Site Supervisor & QC (Daily site reports, field snags, permits, attendance)
5. Safety Officer (DOLE compliance, PTWs, toolbox talks, OSH incidents)
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

import frappe
from frappe import _

logger = logging.getLogger(__name__)


@frappe.whitelist()
def get_available_personas() -> List[Dict[str, Any]]:
    """
    List the supported professional persona cockpits and their dashboard metadata.
    
    Returns:
        List[Dict[str, Any]]: Persona definitions containing identifiers, titles, icons,
        descriptions, and metric labels.
    """
    return [
        {
            "id": "Architect",
            "title": "Architect Cockpit",
            "icon": "octicon octicon-pencil",
            "description": "Spatial zoning, architectural revision tracking, room area takeoffs, and BCF design inquiries.",
            "metrics": ["Design Reviews", "Room Area Schedules", "Revision History", "Open Design Topics"]
        },
        {
            "id": "Structural_MEP",
            "title": "Structural & MEP Engineer Cockpit",
            "icon": "octicon octicon-tools",
            "description": "Multi-discipline clash matrix, BVH collision alerts, service clearance tracking, and load-path elements.",
            "metrics": ["Critical Clashes", "Sleeve Penetrations", "Trade Clearances", "Active BCF Clashes"]
        },
        {
            "id": "Project_Manager_QS",
            "title": "Project Manager & Quantity Surveyor Cockpit",
            "icon": "octicon octicon-graph",
            "description": "Contracts, approved variation orders, progress claims, budgets, and schedule progress.",
            "metrics": ["Contract Value", "Approved Variations", "Certified Claims", "Active Work Packages"]
        },
        {
            "id": "Site_Supervisor",
            "title": "Site Supervisor & QC Cockpit",
            "icon": "octicon octicon-checklist",
            "description": "Daily site reports, active work permits, punchlist snags, and workforce attendance.",
            "metrics": ["Daily Site Reports", "Active Permits to Work", "Punchlist Defects", "Active Tasks"]
        },
        {
            "id": "Safety_Officer",
            "title": "Safety Officer Cockpit (DOLE / OSHP)",
            "icon": "octicon octicon-shield",
            "description": "Statutory safety compliance, Toolbox Talks, high-risk Permits to Work, and incident records.",
            "metrics": ["Active PTWs", "Toolbox Talks", "Reported Incidents", "Days Lost"]
        }
    ]


@frappe.whitelist()
def get_persona_dashboard_metrics(persona: str, project_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Build KPI cards and quick actions for the selected construction BIM persona.
    
    Parameters:
        persona (str): Persona identifier used to select the dashboard configuration.
        project_id (Optional[str]): Project identifier used to restrict project-related metrics.
    
    Returns:
        Dict[str, Any]: Dashboard data containing the resolved persona, title, KPI cards, and quick actions. Unsupported personas use the Site Supervisor configuration.
    """
    proj_filter = {"project": project_id} if project_id else {}

    if persona == "Architect":
        model_count = frappe.db.count("BIM Model", proj_filter) if frappe.db.exists("DocType", "BIM Model") else 0
        design_topics = frappe.db.count("BCF Topic", {"topic_type": ["in", ["Issue", "Inquiry", "Request"]]}) if frappe.db.exists("DocType", "BCF Topic") else 0
        arch_elements = frappe.db.count("BIM Element", {"element_type": ["in", ["IFCWALL", "IFCSLAB", "IFCDOOR", "IFCWINDOW"]]}) if frappe.db.exists("DocType", "BIM Element") else 0

        return {
            "persona": persona,
            "title": "Architect Cockpit",
            "kpis": [
                {"label": "Architectural Models", "value": model_count, "color": "blue"},
                {"label": "Design Inquiries & RFIs", "value": design_topics, "color": "orange"},
                {"label": "Spatial Building Elements", "value": arch_elements, "color": "green"},
                {"label": "Pending Design Approvals", "value": max(0, design_topics - 2), "color": "purple"}
            ],
            "quick_actions": [
                {"label": "Upload Model Revision", "action": "upload_model", "icon": "upload"},
                {"label": "New Design Review Topic", "action": "create_bcf_topic", "icon": "plus"},
                {"label": "Inspect Finish Schedules", "action": "view_takeoffs", "icon": "list"}
            ]
        }

    elif persona in ("Structural_MEP", "Structural", "MEP"):
        critical_clashes = frappe.db.count("BIM Clash", {**proj_filter, "severity": "Critical", "status": "Open"}) if frappe.db.exists("DocType", "BIM Clash") else 0
        major_clashes = frappe.db.count("BIM Clash", {**proj_filter, "severity": "Major", "status": "Open"}) if frappe.db.exists("DocType", "BIM Clash") else 0
        total_open = frappe.db.count("BIM Clash", {**proj_filter, "status": "Open"}) if frappe.db.exists("DocType", "BIM Clash") else 0
        resolved = frappe.db.count("BIM Clash", {**proj_filter, "status": "Resolved"}) if frappe.db.exists("DocType", "BIM Clash") else 0

        return {
            "persona": "Structural_MEP",
            "title": "Structural & MEP Engineer Cockpit",
            "kpis": [
                {"label": "Critical Structural Clashes", "value": critical_clashes, "color": "red"},
                {"label": "Major Trade Interferences", "value": major_clashes, "color": "orange"},
                {"label": "Total Open Collisions", "value": total_open, "color": "blue"},
                {"label": "Resolved & Approved", "value": resolved, "color": "green"}
            ],
            "quick_actions": [
                {"label": "Run BVH Clash Detection", "action": "trigger_bvh_clash", "icon": "zap"},
                {"label": "Export BCF 3.0 Archive", "action": "export_bcf", "icon": "download"},
                {"label": "Filter Trade Clusters", "action": "cluster_clashes", "icon": "filter"}
            ]
        }

    elif persona in ("Project_Manager_QS", "Project Manager", "Quantity Surveyor"):
        tasks = frappe.get_all("Task", filters=proj_filter, fields=["name", "status", "exp_end_date"]) if frappe.db.exists("DocType", "Task") else []
        total_tasks = len(tasks)
        completed = len([t for t in tasks if t.status == "Completed"])
        progress_pct = round((completed / total_tasks * 100) if total_tasks > 0 else 0.0, 1)

        contracts_count = frappe.db.count("Construction Contract", proj_filter) if frappe.db.exists("DocType", "Construction Contract") else 0
        active_vos = frappe.db.count("Variation Order", {**proj_filter, "status": "Approved"}) if frappe.db.exists("DocType", "Variation Order") else 0
        certified_claims = frappe.db.count("Progress Claim", {**proj_filter, "status": "Certified"}) if frappe.db.exists("DocType", "Progress Claim") else 0

        return {
            "persona": "Project_Manager_QS",
            "title": "Project Manager & QS Cockpit",
            "kpis": [
                {"label": "Schedule Progress", "value": f"{progress_pct}%", "color": "green"},
                {"label": "Active Contracts", "value": contracts_count, "color": "blue"},
                {"label": "Approved Variation Orders", "value": active_vos, "color": "purple"},
                {"label": "Certified Progress Claims", "value": certified_claims, "color": "orange"}
            ],
            "quick_actions": [
                {"label": "Gantt Timeline Schedule", "action": "view_gantt", "icon": "calendar"},
                {"label": "New Variation Order", "action": "create_vo", "icon": "plus"},
                {"label": "Review Progress Claims", "action": "view_claims", "icon": "credit-card"}
            ]
        }

    elif persona == "Safety_Officer":
        active_ptws = frappe.db.count("Permit to Work", {**proj_filter, "status": "Approved & Active"}) if frappe.db.exists("DocType", "Permit to Work") else 0
        tbts_count = frappe.db.count("Toolbox Talk", proj_filter) if frappe.db.exists("DocType", "Toolbox Talk") else 0
        incidents_count = frappe.db.count("OSH Incident Report", proj_filter) if frappe.db.exists("DocType", "OSH Incident Report") else 0
        lost_days = frappe.db.sql("""SELECT COALESCE(SUM(days_lost), 0) as days FROM `tabOSH Incident Report`""")[0][0] if frappe.db.exists("DocType", "OSH Incident Report") else 0

        return {
            "persona": "Safety_Officer",
            "title": "Safety Officer Cockpit (DOLE / OSHP)",
            "kpis": [
                {"label": "Active Permits to Work", "value": active_ptws, "color": "green" if active_ptws < 5 else "orange"},
                {"label": "Toolbox Briefings Conducted", "value": tbts_count, "color": "blue"},
                {"label": "Reported OSH Incidents", "value": incidents_count, "color": "red" if incidents_count > 0 else "green"},
                {"label": "Total Days Lost (LTI)", "value": int(lost_days), "color": "purple"}
            ],
            "quick_actions": [
                {"label": "Issue Permit to Work", "action": "issue_ptw", "icon": "shield-check"},
                {"label": "Log Daily Toolbox Talk", "action": "log_tbt", "icon": "users"},
                {"label": "Report Incident / Near Miss", "action": "report_incident", "icon": "alert-triangle"}
            ]
        }

    else:  # Site_Supervisor
        tasks = frappe.db.count("Task", {**proj_filter, "status": "Working"}) if frappe.db.exists("DocType", "Task") else 0
        daily_reports = frappe.db.count("Daily Site Report", proj_filter) if frappe.db.exists("DocType", "Daily Site Report") else 0
        active_permits = frappe.db.count("Permit to Work", {**proj_filter, "status": "Approved & Active"}) if frappe.db.exists("DocType", "Permit to Work") else 0
        open_issues = frappe.db.count("Issue", {**proj_filter, "status": "Open"}) if frappe.db.exists("DocType", "Issue") else 0

        return {
            "persona": "Site_Supervisor",
            "title": "Site Supervisor & QC Cockpit",
            "kpis": [
                {"label": "Active Tasks on Site", "value": tasks, "color": "blue"},
                {"label": "Daily Reports Logged", "value": daily_reports, "color": "green"},
                {"label": "Active Work Permits", "value": active_permits, "color": "purple"},
                {"label": "Open Snags / Defect Issues", "value": open_issues, "color": "red"}
            ],
            "quick_actions": [
                {"label": "Submit Daily Site Report", "action": "create_daily_report", "icon": "book"},
                {"label": "Log Field Defect Snag", "action": "create_issue", "icon": "camera"},
                {"label": "Verify Active Permits", "action": "view_permits", "icon": "shield"}
            ]
        }
