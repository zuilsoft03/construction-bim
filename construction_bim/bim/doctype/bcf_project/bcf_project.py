# Copyright (c) 2026, ERPNext and contributors
# For license information, please see license.txt

import json
import uuid
import frappe
from frappe.model.document import Document


class BCFProject(Document):
    def before_insert(self):
        """
        Initialize project and user metadata before inserting the project.
        
        Sets a project identifier and creator when they are absent, and records the current session user as the modifier.
        """
        if not self.project_id:
            self.project_id = str(uuid.uuid4())
        if not self.created_by_user:
            self.created_by_user = frappe.session.user
        self.modified_by_user = frappe.session.user

    def on_update(self):
        """Update the project modifier to the current session user."""
        self.modified_by_user = frappe.session.user

    def update_counters(self):
        """Update total and open topic counters for this BCF project."""
        total = frappe.db.count("BCF Topic", {"bcf_project": self.name})
        open_count = frappe.db.count(
            "BCF Topic",
            {"bcf_project": self.name, "topic_status": ["in", ["Open", "In Progress"]]}
        )
        self.topic_count = total
        self.open_topic_count = open_count
        self.db_set("topic_count", total, update_modified=False)
        self.db_set("open_topic_count", open_count, update_modified=False)

    def on_trash(self):
        """Cascade delete all associated BCF topics."""
        topics = frappe.get_all("BCF Topic", filters={"bcf_project": self.name})
        for t in topics:
            frappe.delete_doc("BCF Topic", t.name, ignore_permissions=True)
