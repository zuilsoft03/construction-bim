# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import get_datetime


class PermitToWork(Document):
	def validate(self):
		if not self.status:
			self.status = "Draft"

		if self.valid_from and self.valid_to:
			if get_datetime(self.valid_to) <= get_datetime(self.valid_from):
				frappe.throw(_("Valid To datetime must be strictly after Valid From datetime."))

		if "Confined Space" in (self.permit_type or ""):
			self.gas_test_required = 1
			o2 = float(self.gas_oxygen_pct or 0.0)
			if o2 < 19.5 or o2 > 23.5:
				frappe.throw(_("Confined Space entry strictly requires safe atmospheric oxygen testing between 19.5% and 23.5%."))

	def on_submit(self):
		self.status = "Approved & Active"

	def on_cancel(self):
		self.status = "Suspended"
