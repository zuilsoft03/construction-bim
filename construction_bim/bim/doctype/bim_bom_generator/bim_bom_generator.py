"""Controller for BIM BOM Generator DocType."""

from __future__ import annotations

import json
import logging
from typing import Any

import frappe
from frappe import _
from frappe.model.document import Document

from construction_bim.api import bom_integration

logger = logging.getLogger(__name__)


class BIMBOMGenerator(Document):
    """Wizard DocType to extract quantities from BIM Models and generate ERPNext BOMs."""

    def validate(self) -> None:
        if self.target_item and not frappe.db.exists("Item", self.target_item):
            bom_integration._ensure_item_exists(self.target_item, item_name=self.target_item, is_stock_item=0, default_uom="Nos")

        if not self.title and self.model and self.target_item:
            self.title = f"BOM Generator: {self.model} -> {self.target_item}"
        elif not self.title:
            self.title = "BOM Generator"

        if self.model and not self.summary_json:
            try:
                summary = bom_integration.get_model_quantity_summary(self.model)
                self.summary_json = json.dumps(summary, indent=2)
            except Exception as e:
                logger.warning(f"Could not auto-extract quantity summary: {e}")

    @frappe.whitelist()
    def preview(self) -> dict[str, Any]:
        """Return preview of calculated BOM lines without persisting to DB."""
        if not self.model:
            frappe.throw(_("Please select a Source BIM Model"))
        if not self.target_item:
            frappe.throw(_("Please select a Target Finished Item"))

        preview_data = bom_integration.preview_bom_generation(
            model=self.model,
            target_item=self.target_item,
            mapping_rules=self.mapping_rules_json,
            waste_factor_pct=float(self.waste_factor_pct or 5.0),
        )
        return preview_data

    @frappe.whitelist()
    def generate_bom(self) -> dict[str, Any]:
        """Execute BOM generation and link created BOM document."""
        if not self.model:
            frappe.throw(_("Please select a Source BIM Model"))
        if not self.target_item:
            frappe.throw(_("Please select a Target Finished Item"))

        result = bom_integration.generate_or_update_bom(
            model=self.model,
            target_item=self.target_item,
            mapping_rules=self.mapping_rules_json,
            bom_type=self.bom_type or "Manufacture",
            with_operations=int(self.with_operations or 0),
            company=self.company,
            currency=self.currency,
            waste_factor_pct=float(self.waste_factor_pct or 5.0),
            submit_bom=int(self.submit_bom_on_generate or 0),
            existing_bom=self.generated_bom,
        )

        self.generated_bom = result["bom_name"]
        self.item_count = result["item_count"]
        self.raw_material_cost = result["raw_material_cost"]
        self.total_cost = result["total_cost"]
        self.status = "Submitted" if result.get("docstatus") == 1 else "Generated"
        self.log = f"Successfully generated BOM {result['bom_name']} with {result['item_count']} items. Total Cost: {result['total_cost']} {result['currency']}."
        self.save(ignore_permissions=True)
        frappe.db.commit()

        return result
