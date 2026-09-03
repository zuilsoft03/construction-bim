# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt, nowdate


class ConstructionContract(Document):
	def validate(self):
		"""
		Validate contract dates, BOQ totals, retainage, and milestone weights.
		"""
		self.validate_dates()
		self.calculate_boq_totals()
		self.validate_retainage()
		self.validate_milestones()

	def validate_dates(self):
		"""
		Validate that the completion date is not earlier than the start date.
		"""
		if self.start_date and self.completion_date:
			if str(self.completion_date) < str(self.start_date):
				frappe.throw(_("Completion Date cannot be earlier than Start Date."))

	def validate_milestones(self):
		"""
		Validate that the total milestone weight does not exceed 100%.
		
		Raises:
			frappe.ValidationError: If the combined milestone weights exceed 100%.
		"""
		if self.get("milestones"):
			total_weight = sum(flt(m.weight_pct or 0) for m in self.milestones)
			if total_weight > 100.0:
				frappe.throw(_("Total milestone weights ({0}%) cannot exceed 100%.").format(total_weight))

	def calculate_boq_totals(self):
		"""
		Calculate BOQ item amounts, remaining quantities, and contract values.
		
		Updates each BOQ item's amount and balance quantity, sets the contract value when BOQ items exist, and initializes the revised contract value when it is unset.
		"""
		total_boq = 0.0
		for item in self.get("boq_items", []):
			item.amount = flt(item.qty) * flt(item.rate)
			item.balance_qty = flt(item.qty) - flt(item.cumulative_qty_claimed or 0)
			total_boq += item.amount

		if self.boq_items:
			self.contract_value = total_boq

		if not self.revised_contract_value:
			self.revised_contract_value = flt(self.contract_value) + flt(self.total_variations_amount or 0)

	def validate_retainage(self):
		"""
		Validate that the retainage rate is within the allowed percentage range.
		"""
		if flt(self.retainage_rate) < 0 or flt(self.retainage_rate) > 100:
			frappe.throw(_("Retainage Rate must be between 0% and 100%."))

	def on_submit(self):
		"""
		Set the contract status to Active upon submission and update the linked project's contract information when applicable.
		"""
		self.status = "Active"
		if self.project:
			self.update_project_contract_info()

	def on_cancel(self):
		"""
		Mark the construction contract as terminated when it is canceled.
		"""
		self.status = "Terminated"

	def update_project_contract_info(self):
		"""
		Update the linked project's contract amount when the project exists and provides a contract amount field.
		"""
		if not frappe.db.exists("Project", self.project):
			return
		project_doc = frappe.get_doc("Project", self.project)
		# Update custom contract amount if present
		if hasattr(project_doc, "custom_contract_amount"):
			project_doc.db_set("custom_contract_amount", flt(self.revised_contract_value or self.contract_value))
