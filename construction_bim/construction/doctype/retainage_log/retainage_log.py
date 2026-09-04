# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt


class RetainageLog(Document):
	def validate(self):
		if self.contract and not self.total_retained_amount:
			retained = frappe.db.get_value("Construction Contract", self.contract, "total_retention_withheld")
			self.total_retained_amount = flt(retained)
		if self.contract and not self.project:
			self.project = frappe.db.get_value("Construction Contract", self.contract, "project")
