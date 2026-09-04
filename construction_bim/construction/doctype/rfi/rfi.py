# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate


class RFI(Document):
	def validate(self):
		# If an official response is provided and status is still Open / Under Review, advance to Responded
		if self.response and self.status in ["Draft", "Open", "Submitted", "Under Review"]:
			self.status = "Responded"
			self.responded_by = frappe.session.user
			self.response_date = nowdate()
