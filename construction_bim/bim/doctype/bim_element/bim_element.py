import frappe
from frappe.model.document import Document


class BIMElement(Document):
    def on_trash(self):
        frappe.db.delete("BIM BOQ Link", {"bim_element": self.name})
