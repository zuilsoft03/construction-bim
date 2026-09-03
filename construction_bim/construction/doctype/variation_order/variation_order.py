# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import add_days, flt, nowdate


class VariationOrder(Document):
	def validate(self):
		if not self.project and self.contract:
			self.project = frappe.db.get_value("Construction Contract", self.contract, "project")

	def on_submit(self):
		self.status = "Approved"
		self.approved_by = frappe.session.user
		self.approval_date = nowdate()
		self.update_contract_financials(revert=False)

	def on_cancel(self):
		self.status = "Rejected"
		self.update_contract_financials(revert=True)

	def update_contract_financials(self, revert=False):
		if not self.contract or not frappe.db.exists("Construction Contract", self.contract):
			return

		contract = frappe.get_doc("Construction Contract", self.contract)
		impact = flt(self.cost_impact)
		if revert:
			impact = -impact

		current_vo_total = flt(contract.total_variations_amount or 0) + impact
		revised_value = flt(contract.contract_value or 0) + current_vo_total

		contract.db_set("total_variations_amount", current_vo_total)
		contract.db_set("revised_contract_value", revised_value)

		# Extend completion date if time extension granted
		if self.time_extension_days and contract.completion_date and not revert:
			new_completion = add_days(contract.completion_date, int(self.time_extension_days))
			contract.db_set("completion_date", new_completion)
