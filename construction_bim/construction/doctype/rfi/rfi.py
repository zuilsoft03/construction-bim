# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import nowdate


class RFI(Document):
	def validate(self):
		# If an official response is provided and status is still Open / Under Review, advance to Responded
		"""
		Update the RFI status and response metadata when an official response is provided.
		
		The status is set to `Responded` for RFIs currently in `Draft`, `Open`,
		`Submitted`, or `Under Review`, and the responding user and response date
		are recorded.
		"""
		if self.response and self.status in ["Draft", "Open", "Submitted", "Under Review"]:
			self.status = "Responded"
			self.responded_by = frappe.session.user
			self.response_date = nowdate()
