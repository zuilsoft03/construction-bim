# Copyright (c) 2026, ERPNext and contributors
# For license information, please see license.txt

import uuid
from datetime import datetime, timezone
import frappe
from frappe.model.document import Document


class BCFComment(Document):
    def before_insert(self):
        """
        Initialize missing comment metadata before insertion.
        
        Generates a GUID, assigns the current UTC timestamp, and sets the current session user as the author when those fields are not already provided.
        """
        if not self.guid:
            self.guid = str(uuid.uuid4())
        if not self.date:
            self.date = datetime.now(timezone.utc).isoformat()
        if not self.author:
            self.author = frappe.session.user

    def on_update(self):
        self.update_topic_counters()

    def on_trash(self):
        """Update the associated topic's comment count after deleting the comment."""
        self.update_topic_counters(offset=-1)

    def update_topic_counters(self, offset: int = 0):
        """
        Update the associated topic's comment count by the specified offset.
        
        Parameters:
        	offset (int): Adjustment applied to the current comment count.
        """
        if self.topic and frappe.db.exists("BCF Topic", self.topic):
            count = frappe.db.count("BCF Comment", {"topic": self.topic}) + offset
            frappe.db.set_value("BCF Topic", self.topic, "comment_count", max(0, count))
