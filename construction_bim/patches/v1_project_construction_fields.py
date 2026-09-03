import frappe
from frappe.custom.doctype.custom_field.custom_field import CustomField

FIELDS = [
    {
        "fieldname": "sb_construction",
        "label": "Construction Management",
        "fieldtype": "Section Break",
        "insert_after": "project_type",
    },
    {
        "fieldname": "cb_construction_1",
        "fieldtype": "Column Break",
        "insert_after": "sb_construction",
    },
    {
        "fieldname": "custom_drive_folder",
        "label": "Drive Folder",
        "fieldtype": "Link",
        "options": "File",
        "read_only": 1,
        "description": "Auto-created per-project folder in Frappe Drive",
        "insert_after": "cb_construction_1",
    },
    {
        "fieldname": "custom_overall_progress",
        "label": "Overall Progress %",
        "fieldtype": "Percent",
        "read_only": 1,
        "insert_after": "custom_drive_folder",
    },
    {
        "fieldname": "custom_start_date",
        "label": "Construction Start",
        "fieldtype": "Date",
        "insert_after": "custom_overall_progress",
    },
    {
        "fieldname": "cb_construction_2",
        "fieldtype": "Column Break",
        "insert_after": "custom_start_date",
    },
    {
        "fieldname": "custom_target_completion",
        "label": "Target Completion",
        "fieldtype": "Date",
        "insert_after": "cb_construction_2",
    },
    {
        "fieldname": "custom_contract_amount",
        "label": "Contract Amount (PHP)",
        "fieldtype": "Currency",
        "options": "PHP",
        "insert_after": "custom_target_completion",
    },
    {
        "fieldname": "custom_boq_source",
        "label": "BOQ Source DocType",
        "fieldtype": "Select",
        "options": "Construction Estimate\nConstruction Contract",
        "insert_after": "custom_contract_amount",
    },
]


def execute():
    """Idempotent custom-field creation on ERPNext Project."""
    meta_fields = {f.fieldname for f in frappe.get_meta("Project").fields}
    for f in FIELDS:
        if f["fieldname"] in meta_fields:
            continue
        doc = frappe.get_doc({"doctype": "Custom Field", "dt": "Project", **f})
        doc.flags.ignore_permissions = True
        doc.insert()
    frappe.db.commit()
