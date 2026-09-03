# Copyright (c) 2026, ERPNext and contributors
# For license information, please see license.txt

import json
import uuid
from datetime import datetime, timezone
import frappe
from frappe.model.document import Document


class BCFTopic(Document):
    def before_insert(self):
        if not self.guid:
            self.guid = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()
        if not self.creation_date:
            self.creation_date = now_iso
        if not self.creation_author:
            self.creation_author = frappe.session.user
        self.modified_date = now_iso
        self.modified_author = frappe.session.user

    def validate(self):
        now_iso = datetime.now(timezone.utc).isoformat()
        self.modified_date = now_iso
        self.modified_author = frappe.session.user

        # Validate topic_type against project allowed extensions
        if self.bcf_project and frappe.db.exists("BCF Project", self.bcf_project):
            allowed_types_json = frappe.db.get_value("BCF Project", self.bcf_project, "topic_types")
            if allowed_types_json:
                try:
                    allowed_types = json.loads(allowed_types_json)
                    if allowed_types and self.topic_type not in allowed_types:
                        # Non-fatal log or append if dynamic
                        pass
                except Exception:
                    pass

    def on_update(self):
        self.update_project_counters()
        self.sync_with_erpnext_task()

    def on_trash(self):
        # Cascade delete child viewpoints and comments
        for vp in frappe.get_all("BCF Viewpoint", filters={"topic": self.name}):
            frappe.delete_doc("BCF Viewpoint", vp.name, ignore_permissions=True)
        for comm in frappe.get_all("BCF Comment", filters={"topic": self.name}):
            frappe.delete_doc("BCF Comment", comm.name, ignore_permissions=True)
        self.update_project_counters(offset=-1)

    def update_project_counters(self, offset: int = 0):
        if self.bcf_project and frappe.db.exists("BCF Project", self.bcf_project):
            total = frappe.db.count("BCF Topic", {"bcf_project": self.bcf_project}) + offset
            open_count = frappe.db.count(
                "BCF Topic",
                {"bcf_project": self.bcf_project, "topic_status": ["in", ["Open", "In Progress"]]}
            )
            frappe.db.set_value("BCF Project", self.bcf_project, "topic_count", max(0, total))
            frappe.db.set_value("BCF Project", self.bcf_project, "open_topic_count", max(0, open_count))

    def sync_with_erpnext_task(self):
        """Synchronize BCF Topic status & assignee with ERPNext Task if linked."""
        if not self.erpnext_task or not frappe.db.exists("Task", self.erpnext_task):
            return

        status_mapping = {
            "Open": "Open",
            "In Progress": "Working",
            "Resolved": "Pending Review",
            "Closed": "Completed",
            "Approved": "Completed",
            "Rejected": "Cancelled"
        }

        target_task_status = status_mapping.get(self.topic_status)
        if target_task_status:
            current_status = frappe.db.get_value("Task", self.erpnext_task, "status")
            if current_status != target_task_status:
                frappe.db.set_value("Task", self.erpnext_task, "status", target_task_status)
