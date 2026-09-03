# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt, nowdate


class ProgressClaim(Document):
	def validate(self):
		"""Validate the progress claim and update its contract details and calculated totals."""
		self.populate_contract_details()
		self.calculate_totals()

	def populate_contract_details(self):
		"""
		Populate missing project and retention details from the linked construction contract.
		"""
		if not self.contract:
			return
		contract = frappe.get_doc("Construction Contract", self.contract)
		if not self.project:
			self.project = contract.project
		if not self.retention_rate:
			self.retention_rate = contract.retainage_rate

	def calculate_totals(self):
		"""
		Calculate claim amounts, retention deductions, and the net certified amount.
		
		Updates each claim item's cumulative quantity, current amount, and cumulative amount. Uses the configured retention rate, defaulting to 10 percent, and applies any advance payment deduction.
		
		Returns:
			None
		"""
		gross = 0.0
		for item in self.get("items", []):
			item.cumulative_qty = flt(item.previous_qty) + flt(item.current_qty)
			item.current_amount = flt(item.current_qty) * flt(item.rate)
			item.cumulative_amount = flt(item.cumulative_qty) * flt(item.rate)
			gross += item.current_amount

		self.gross_claim_amount = gross
		retention_pct = flt(self.retention_rate or 10.0) / 100.0
		self.retention_deduction = gross * retention_pct
		self.net_certified_amount = gross - self.retention_deduction - flt(self.advance_payment_deduction or 0)

	def on_submit(self):
		"""
		Certify the progress claim and update the linked contract's progress.
		
		Records the current user and certification date on the claim before applying its certified amounts to the contract.
		"""
		self.status = "Certified"
		self.certified_by = frappe.session.user
		self.certification_date = nowdate()
		self.update_contract_progress()

	def update_contract_progress(self):
		"""
		Update the linked construction contract with certified amounts, retention, and BOQ claim progress.
		"""
		if not self.contract or not frappe.db.exists("Construction Contract", self.contract):
			return

		contract = frappe.get_doc("Construction Contract", self.contract)
		current_certified = flt(contract.total_certified_amount or 0) + flt(self.net_certified_amount)
		current_retention = flt(contract.total_retention_withheld or 0) + flt(self.retention_deduction)

		contract.db_set("total_certified_amount", current_certified)
		contract.db_set("total_retention_withheld", current_retention)

		# Update BOQ cumulative claimed quantities
		for claim_item in self.get("items", []):
			for boq_item in contract.get("boq_items", []):
				if boq_item.description == claim_item.description or boq_item.name == claim_item.boq_item_id:
					new_claimed = flt(boq_item.cumulative_qty_claimed or 0) + flt(claim_item.current_qty)
					boq_item.db_set("cumulative_qty_claimed", new_claimed)
					boq_item.db_set("balance_qty", flt(boq_item.qty) - new_claimed)

	@frappe.whitelist()
	def create_sales_invoice(self):
		"""
		Create a Sales Invoice for the billable items in the progress claim.
		
		Raises:
			frappe.ValidationError: If the claim has no contract, the contract has no customer, or no billable items are available.
		
		Returns:
			str: The name of the created Sales Invoice.
		"""
		if not self.contract:
			frappe.throw(_("Cannot create invoice without a valid contract."))

		contract = frappe.get_doc("Construction Contract", self.contract)
		if not contract.customer:
			frappe.throw(_("Contract has no Customer linked. Cannot create Sales Invoice."))

		invoice = frappe.new_doc("Sales Invoice")
		invoice.customer = contract.customer
		invoice.project = self.project
		invoice.due_date = nowdate()
		invoice.remarks = _("Progress Billing against Contract {0}, Claim {1}").format(self.contract, self.name)

		# Add line items
		for item in self.get("items", []):
			if flt(item.current_amount) > 0:
				invoice.append("items", {
					"item_name": item.description,
					"description": item.description,
					"qty": item.current_qty,
					"rate": item.rate,
					"amount": item.current_amount,
					"project": self.project
				})

		# If invoice has items, insert
		if invoice.items:
			invoice.insert()
			self.db_set("sales_invoice", invoice.name)
			self.db_set("status", "Invoiced")
			return invoice.name
		else:
			frappe.throw(_("No items with billable amounts found."))
