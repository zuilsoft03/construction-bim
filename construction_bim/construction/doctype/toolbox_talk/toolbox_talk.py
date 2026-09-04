# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

from frappe.model.document import Document


class ToolboxTalk(Document):
	def validate(self):
		self.attendee_count = len(self.get("attendees", []))
