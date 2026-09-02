import frappe
from frappe.model.document import Document


class BIMModel(Document):
    def on_trash(self):
        # Clean up elements when the model is deleted
        frappe.db.delete("BIM Element", {"model": self.name})
        frappe.db.delete("BIM Viewpoint", {"model": self.name})
