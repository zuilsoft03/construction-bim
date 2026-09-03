# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import nowdate


class ProjectPhase(Document):
	def validate(self):
		self.validate_gate_completion()

	def validate_gate_completion(self):
		if self.status == "Completed":
			uncompleted_mandatory = []
			for gate in self.get("gate_checklist", []):
				if gate.required and not gate.is_completed:
					uncompleted_mandatory.append(gate.gate_item)

			if uncompleted_mandatory:
				frappe.throw(
					_("Cannot complete Phase '{0}'. The following mandatory stage-gate requirements are not completed: {1}").format(
						self.phase_name, ", ".join(uncompleted_mandatory)
					)
				)

			if not self.actual_end:
				self.actual_end = nowdate()
			self.gate_approval_status = "Approved"
			self.approved_by = frappe.session.user
			self.approval_date = nowdate()


@frappe.whitelist()
def initialize_pm2_project_phases(project):
	"""Initializes the standard 6 PM² project lifecycle phases with stage gates."""
	if not frappe.db.exists("Project", project):
		frappe.throw(_("Project {0} not found.").format(project))

	existing = frappe.get_all("Project Phase", filters={"project": project})
	if existing:
		return [d.name for d in existing]

	phase_configs = [
		{
			"sequence": 1,
			"phase_name": "1. Initiating",
			"gates": [
				"Project Charter Approved & Signed",
				"Project Drive Folder Scaffold Initialized",
				"Environmental Compliance Certificate / Barangay Clearance Obtained"
			]
		},
		{
			"sequence": 2,
			"phase_name": "2. Planning",
			"gates": [
				"Architectural & Structural IFC Models Coordinated",
				"Baseline Bill of Quantities (BOQ) Committed",
				"Baseline WBS Schedule Approved",
				"DOLE Construction Safety & Health Program (CSHP) Approved"
			]
		},
		{
			"sequence": 3,
			"phase_name": "3. Executing",
			"gates": [
				"LGU Building Permit Issued",
				"Subcontracts Executed & Mobilization Complete",
				"Site Utility Connections (Power/Water) Operational"
			]
		},
		{
			"sequence": 4,
			"phase_name": "4. Monitoring & Controlling",
			"gates": [
				"Progress Claims & Certified Billings Reconciled Monthly",
				"Quality Inspection Pass Rate >= 95%",
				"Zero Unreported Lost-Time OSH Incidents"
			]
		},
		{
			"sequence": 5,
			"phase_name": "5. Closing",
			"gates": [
				"Final Punchlist & Defect Items Cleared",
				"As-Built BIM Models & Drawings Submitted",
				"Certificate of Occupancy Obtained",
				"Substantial Completion Certificate Signed by Client"
			]
		},
		{
			"sequence": 6,
			"phase_name": "6. Defects Liability",
			"gates": [
				"Defect Liability Period (DLP) Expiry Inspection Conducted",
				"All DLP Snags Rectified & Verified",
				"Final Retention Release Approved & Account Closed"
			]
		}
	]

	created_phases = []
	for p in phase_configs:
		doc = frappe.new_doc("Project Phase")
		doc.project = project
		doc.sequence = p["sequence"]
		doc.phase_name = p["phase_name"]
		doc.status = "In Progress" if p["sequence"] == 1 else "Not Started"

		for g in p["gates"]:
			doc.append("gate_checklist", {
				"gate_item": g,
				"required": 1,
				"is_completed": 0
			})

		doc.insert(ignore_permissions=True)
		created_phases.append(doc.name)

	return created_phases
