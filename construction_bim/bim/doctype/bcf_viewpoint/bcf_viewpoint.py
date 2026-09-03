# Copyright (c) 2026, ERPNext and contributors
# For license information, please see license.txt

import uuid
import frappe
from frappe.model.document import Document


class BCFViewpoint(Document):
    def before_insert(self):
        """
        Assigns a UUID to the viewpoint when its GUID is missing.
        """
        if not self.guid:
            self.guid = str(uuid.uuid4())

    def on_update(self):
        """Update the associated topic's viewpoint count."""
        self.update_topic_counters()

    def on_trash(self):
        """Update the associated topic's viewpoint count when the viewpoint is deleted."""
        self.update_topic_counters(offset=-1)

    def update_topic_counters(self, offset: int = 0):
        """
        Update the associated topic's viewpoint count.
        
        Parameters:
        	offset (int): Adjustment applied to the counted viewpoints before storing the result.
        """
        if self.topic and frappe.db.exists("BCF Topic", self.topic):
            count = frappe.db.count("BCF Viewpoint", {"topic": self.topic}) + offset
            frappe.db.set_value("BCF Topic", self.topic, "viewpoint_count", max(0, count))
