# Copyright (c) 2026, zuilsoft03 and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import nowdate


class DailySiteReport(Document):
	def validate(self):
		if not self.prepared_by:
			self.prepared_by = frappe.session.user
		if not self.date:
			self.date = nowdate()

		# Sum total manpower across trades
		total_workers = sum(int(item.workers_count or 0) for item in self.get("subcontractors", []))
		self.total_manpower = total_workers


@frappe.whitelist()
def fetch_daily_site_activity(project, date=None):
	"""Aggregates labor hours, logged site issues, and equipment active for the day."""
	if not date:
		date = nowdate()

	# Aggregate hours from native Timesheet Detail
	timesheets = frappe.db.sql("""
		SELECT activity_type, SUM(hours) as total_hours, COUNT(DISTINCT parent) as workers
		FROM `tabTimesheet Detail`
		WHERE project = %s AND DATE(from_time) = %s
		GROUP BY activity_type
	""", (project, date), as_dict=True)

	# Aggregate open issues / snags raised today
	open_issues = frappe.db.count("Issue", filters={"project": project, "opening_date": date})

	# Active permits
	active_ptws = frappe.db.count("Permit to Work", filters={"project": project, "status": "Approved & Active"})

	return {
		"project": project,
		"date": date,
		"timesheets": timesheets,
		"new_issues_count": open_issues,
		"active_permits_count": active_ptws
	}
