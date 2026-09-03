# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class OSHIncidentReport(Document):
	def validate(self):
		"""
		Set default reporting information and Dole-reportable status for the incident.
		
		If no reporter is specified, assigns the current session user. Incidents classified as Lost Time Injury (LTI) or Fatality are marked as Dole-reportable.
		"""
		if not self.reported_by:
			self.reported_by = frappe.session.user

		if self.incident_classification in ["Lost Time Injury (LTI)", "Fatality"]:
			self.dole_reportable = 1
