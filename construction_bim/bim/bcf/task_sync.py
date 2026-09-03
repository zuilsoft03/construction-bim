"""Bi-directional synchronization engine between BCF Topics and ERPNext Tasks/Issues.

Module: construction_bim.bim.bcf.task_sync
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

import frappe
from frappe import _

logger = logging.getLogger(__name__)

BCF_TO_TASK_STATUS = {
    "Open": "Open",
    "In Progress": "Working",
    "Resolved": "Pending Review",
    "Closed": "Completed",
    "Approved": "Completed",
    "Rejected": "Cancelled"
}

TASK_TO_BCF_STATUS = {
    "Open": "Open",
    "Working": "In Progress",
    "Pending Review": "Resolved",
    "Completed": "Closed",
    "Cancelled": "Rejected"
}

BCF_TO_TASK_PRIORITY = {
    "Critical": "Urgent",
    "High": "High",
    "Medium": "Medium",
    "Low": "Low"
}


@frappe.whitelist()
def create_task_from_bcf_topic(topic_name_or_guid: str, project: Optional[str] = None) -> Dict[str, Any]:
    """
    Create an ERPNext Task from a BCF Topic and link the Task to the topic.
    
    Parameters:
        topic_name_or_guid (str): BCF Topic name or GUID used to identify the topic.
        project (str, optional): ERPNext project to assign to the Task. If omitted, the project linked to the BCF Project is used.
    
    Returns:
        Dict[str, Any]: Result containing the operation status, topic name, and task details.
    """
    topic = None
    if frappe.db.exists("BCF Topic", topic_name_or_guid):
        topic = frappe.get_doc("BCF Topic", topic_name_or_guid)
    else:
        topic = frappe.get_doc("BCF Topic", {"guid": topic_name_or_guid})

    if topic.erpnext_task and frappe.db.exists("Task", topic.erpnext_task):
        return {
            "status": "already_linked",
            "task_id": topic.erpnext_task,
            "topic": topic.name
        }

    erp_project = project
    if not erp_project and topic.bcf_project:
        erp_project = frappe.db.get_value("BCF Project", topic.bcf_project, "erpnext_project")

    task = frappe.new_doc("Task")
    task.subject = f"[BIM] {topic.title}"
    task.project = erp_project
    task.status = BCF_TO_TASK_STATUS.get(topic.topic_status, "Open")
    task.priority = BCF_TO_TASK_PRIORITY.get(topic.priority, "Medium")
    task.description = topic.description or ""
    if topic.due_date:
        task.exp_end_date = str(topic.due_date).split("T")[0].split(" ")[0]

    task.insert(ignore_permissions=True)

    # Link back
    topic.erpnext_task = task.name
    topic.save(ignore_permissions=True)
    frappe.db.commit()

    return {
        "status": "success",
        "task_id": task.name,
        "task_subject": task.subject,
        "topic": topic.name
    }


@frappe.whitelist()
def sync_bcf_topic_to_task(topic_doc) -> None:
    """
    Synchronize the linked ERPNext Task with the BCF Topic's status and priority.
    
    Parameters:
        topic_doc: A BCF Topic document or its name.
    """
    if isinstance(topic_doc, str):
        topic_doc = frappe.get_doc("BCF Topic", topic_doc)

    if not topic_doc.erpnext_task or not frappe.db.exists("Task", topic_doc.erpnext_task):
        return

    task = frappe.get_doc("Task", topic_doc.erpnext_task)
    updated = False

    target_status = BCF_TO_TASK_STATUS.get(topic_doc.topic_status)
    if target_status and task.status != target_status:
        task.status = target_status
        updated = True

    target_prio = BCF_TO_TASK_PRIORITY.get(topic_doc.priority)
    if target_prio and task.priority != target_prio:
        task.priority = target_prio
        updated = True

    if updated:
        task.flags.ignore_permissions = True
        task.save()


@frappe.whitelist()
def sync_task_to_bcf_topic(task_doc) -> None:
    """
    Synchronize the linked BCF Topic's status with an ERPNext Task.
    
    Parameters:
    	task_doc: An ERPNext Task document or its name.
    """
    if isinstance(task_doc, str):
        task_doc = frappe.get_doc("Task", task_doc)

    topic_name = frappe.db.get_value("BCF Topic", {"erpnext_task": task_doc.name}, "name")
    if not topic_name:
        return

    topic = frappe.get_doc("BCF Topic", topic_name)
    target_bcf_status = TASK_TO_BCF_STATUS.get(task_doc.status)
    if target_bcf_status and topic.topic_status != target_bcf_status:
        topic.topic_status = target_bcf_status
        topic.flags.ignore_permissions = True
        topic.save()
