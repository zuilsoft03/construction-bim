import frappe


CUSTOM_FIELDS = {
	"Task": [
		{
			"fieldname": "trade_discipline",
			"label": "Trade / Discipline",
			"fieldtype": "Select",
			"options": "Civil\nStructural\nArchitectural\nMechanical\nElectrical\nPlumbing\nFire Protection\nSafety\nFinishes",
			"insert_after": "type"
		},
		{
			"fieldname": "bim_element_group",
			"label": "BIM Element Group",
			"fieldtype": "Link",
			"options": "BIM Element Group",
			"insert_after": "trade_discipline"
		},
		{
			"fieldname": "construction_contract",
			"label": "Construction Contract",
			"fieldtype": "Link",
			"options": "Construction Contract",
			"insert_after": "bim_element_group"
		},
		{
			"fieldname": "work_package_type",
			"label": "Work Package Type",
			"fieldtype": "Select",
			"options": "Task\nMilestone\nPhase\nIssue\nRemark\nRequest\nClash",
			"default": "Task",
			"insert_after": "construction_contract"
		},
		{
			"fieldname": "bcf_topic",
			"label": "BCF Topic",
			"fieldtype": "Link",
			"options": "BCF Topic",
			"insert_after": "work_package_type"
		},
		{
			"fieldname": "rfi_link",
			"label": "Linked RFI",
			"fieldtype": "Link",
			"options": "RFI",
			"insert_after": "bcf_topic"
		}
	],
	"Project": [
		{
			"fieldname": "construction_contract",
			"label": "Active Construction Contract",
			"fieldtype": "Link",
			"options": "Construction Contract",
			"insert_after": "custom_boq_source"
		},
		{
			"fieldname": "project_phase",
			"label": "Current Project Phase",
			"fieldtype": "Data",
			"read_only": 1,
			"insert_after": "construction_contract"
		},
		{
			"fieldname": "retention_balance",
			"label": "Retention Balance Withheld",
			"fieldtype": "Currency",
			"options": "PHP",
			"read_only": 1,
			"insert_after": "project_phase"
		},
		{
			"fieldname": "health_status",
			"label": "Project Health Status",
			"fieldtype": "Select",
			"options": "On Track\nAt Risk\nOff Track",
			"default": "On Track",
			"insert_after": "retention_balance"
		},
		{
			"fieldname": "status_narrative",
			"label": "Health Status Narrative",
			"fieldtype": "Small Text",
			"insert_after": "health_status"
		},
		{
			"fieldname": "is_template",
			"label": "Set as Project Template",
			"fieldtype": "Check",
			"default": "0",
			"insert_after": "status_narrative"
		},
		{
			"fieldname": "is_favorite",
			"label": "Favorite Project",
			"fieldtype": "Check",
			"default": "0",
			"insert_after": "is_template"
		},
		{
			"fieldname": "parent_project",
			"label": "Parent Project",
			"fieldtype": "Link",
			"options": "Project",
			"insert_after": "is_favorite"
		}
	],
	"Issue": [
		{
			"fieldname": "bim_element",
			"label": "Associated BIM Element",
			"fieldtype": "Link",
			"options": "BIM Element",
			"insert_after": "project"
		},
		{
			"fieldname": "location_zone",
			"label": "Zone / Grid Reference",
			"fieldtype": "Data",
			"insert_after": "bim_element"
		},
		{
			"fieldname": "contractor",
			"label": "Assigned Subcontractor",
			"fieldtype": "Link",
			"options": "Supplier",
			"insert_after": "location_zone"
		},
		{
			"fieldname": "rectification_due_date",
			"label": "Rectification Due Date",
			"fieldtype": "Date",
			"insert_after": "contractor"
		}
	],
	"Asset": [
		{
			"fieldname": "daily_operating_rate",
			"label": "Daily Operating Rate (PHP)",
			"fieldtype": "Currency",
			"options": "PHP",
			"insert_after": "location"
		},
		{
			"fieldname": "current_site",
			"label": "Current Project Site",
			"fieldtype": "Link",
			"options": "Project",
			"insert_after": "daily_operating_rate"
		}
	]
}


def execute():
	"""Idempotently adds construction custom fields to native ERPNext doctypes."""
	for dt, fields in CUSTOM_FIELDS.items():
		if not frappe.db.exists("DocType", dt):
			continue
		meta_fields = {f.fieldname for f in frappe.get_meta(dt).fields}
		for f in fields:
			if f["fieldname"] in meta_fields:
				continue
			doc = frappe.get_doc({"doctype": "Custom Field", "dt": dt, **f})
			doc.flags.ignore_permissions = True
			doc.insert()

	setup_quality_inspection_presets()
	frappe.db.commit()


def setup_quality_inspection_presets():
	"""Seeds standard civil/structural Quality Inspection Templates if Quality module exists."""
	if frappe.db.exists("DocType", "DocType") and not frappe.db.exists("DocType", "Quality Inspection Template"):
		return

	templates = [
		{
			"template_name": "ASTM C39 Concrete Cylinder 28-Day Compressive Test",
			"parameters": [
				{"specification": "28-Day Compressive Strength", "min_value": 4000, "max_value": 7000, "numeric": 1},
				{"specification": "Fracture Pattern Type", "acceptance_criteria": "Type 1 / Conical", "numeric": 0}
			]
		},
		{
			"template_name": "Concrete Slump Test (ASTM C143)",
			"parameters": [
				{"specification": "Slump Measurement (mm)", "min_value": 75, "max_value": 125, "numeric": 1},
				{"specification": "Workability & Cohesiveness", "acceptance_criteria": "No Segregation", "numeric": 0}
			]
		},
		{
			"template_name": "Grade 60 Deformed Steel Rebar Tensile Test",
			"parameters": [
				{"specification": "Yield Strength (MPa)", "min_value": 414, "max_value": 620, "numeric": 1},
				{"specification": "Tensile Strength (MPa)", "min_value": 620, "max_value": 900, "numeric": 1},
				{"specification": "Elongation in 200mm (%)", "min_value": 9, "max_value": 25, "numeric": 1}
			]
		}
	]

	for tmpl in templates:
		if frappe.db.exists("Quality Inspection Template", tmpl["template_name"]):
			continue
		doc = frappe.new_doc("Quality Inspection Template")
		doc.name = tmpl["template_name"]
		doc.quality_inspection_template_name = tmpl["template_name"]

		# Determine correct child table fieldname across Frappe versions
		field_name = "parameters"
		if hasattr(doc, "item_quality_inspection_parameter") or hasattr(doc, "_init_child"):
			try:
				doc._init_child({}, "item_quality_inspection_parameter")
				field_name = "item_quality_inspection_parameter"
			except Exception:
				field_name = "parameters"

		for p in tmpl["parameters"]:
			# Ensure Quality Inspection Parameter exists if DocType is present
			if frappe.db.exists("DocType", "Quality Inspection Parameter") and not frappe.db.exists("Quality Inspection Parameter", p["specification"]):
				try:
					qip = frappe.new_doc("Quality Inspection Parameter")
					qip.parameter = p["specification"]
					qip.insert(ignore_permissions=True)
				except Exception:
					pass

			row = {
				"specification": p["specification"],
				"min_value": p.get("min_value"),
				"max_value": p.get("max_value"),
				"numeric": p.get("numeric", 1),
				"value": p.get("acceptance_criteria"),
				"acceptance_criteria_value": p.get("acceptance_criteria"),
				"inspection_type": "Numeric" if p.get("numeric") else "Non-Numeric",
			}
			try:
				doc.append(field_name, row)
			except Exception:
				try:
					doc.append("parameters", row)
				except Exception:
					pass

		try:
			doc.insert(ignore_permissions=True)
		except Exception:
			pass
