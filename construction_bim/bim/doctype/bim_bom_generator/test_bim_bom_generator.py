"""Unit tests for BIM BOM Generator and BOM Integration API."""

from __future__ import annotations

import json
import unittest

import frappe
from frappe.tests.utils import FrappeTestCase

from construction_bim.api import bom_integration


def _get_or_create_project(project_name: str = "_Test BOM Project") -> str:
    existing = frappe.db.get_value("Project", {"project_name": project_name}, "name")
    if existing:
        return existing
    proj = frappe.new_doc("Project")
    proj.project_name = project_name
    proj.insert(ignore_permissions=True)
    return proj.name


class TestBIMBOMGenerator(FrappeTestCase):
    def setUp(self):
        # Create test project
        self.project_name = _get_or_create_project("_Test BOM Project")

        # Create test BIM Model
        if not frappe.db.exists("BIM Model", {"model_name": "_Test Struc Model for BOM"}):
            model = frappe.new_doc("BIM Model")
            model.model_name = "_Test Struc Model for BOM"
            model.discipline = "Structural"
            model.project = self.project_name
            model.insert(ignore_permissions=True)
            self.model_name = model.name
        else:
            self.model_name = frappe.db.get_value("BIM Model", {"model_name": "_Test Struc Model for BOM"}, "name")

        # Create test elements with quantities
        self._create_test_elements()

    def _create_test_elements(self):
        # Delete existing test elements for this model
        frappe.db.sql("DELETE FROM `tabBIM Element` WHERE model=%s", [self.model_name])

        # 1. Concrete Wall
        el1 = frappe.new_doc("BIM Element")
        el1.model = self.model_name
        el1.stable_id = "TEST_WALL_001"
        el1.element_type = "Wall"
        el1.discipline = "structure"
        el1.storey = "Level 1"
        el1.quantities = json.dumps({"NetVolume": 14.5, "GrossVolume": 15.0, "NetArea": 72.5})
        el1.properties = json.dumps({"Material": "Concrete C30/37"})
        el1.insert(ignore_permissions=True)

        # 2. Concrete Slab
        el2 = frappe.new_doc("BIM Element")
        el2.model = self.model_name
        el2.stable_id = "TEST_SLAB_001"
        el2.element_type = "Slab"
        el2.discipline = "structure"
        el2.storey = "Level 1"
        el2.quantities = json.dumps({"NetVolume": 35.0, "GrossVolume": 36.0, "NetArea": 175.0})
        el2.properties = json.dumps({"Material": "Concrete C30/37"})
        el2.insert(ignore_permissions=True)

        # 3. HVAC Duct
        el3 = frappe.new_doc("BIM Element")
        el3.model = self.model_name
        el3.stable_id = "TEST_DUCT_001"
        el3.element_type = "Duct"
        el3.discipline = "mep"
        el3.storey = "Level 1"
        el3.quantities = json.dumps({"GrossArea": 42.0, "Length": 18.5})
        el3.properties = json.dumps({"Width": 500, "Height": 300})
        el3.insert(ignore_permissions=True)

        # 4. Pipe Segment
        el4 = frappe.new_doc("BIM Element")
        el4.model = self.model_name
        el4.stable_id = "TEST_PIPE_001"
        el4.element_type = "Pipe"
        el4.discipline = "mep"
        el4.storey = "Level 1"
        el4.quantities = json.dumps({"Length": 64.0})
        el4.properties = json.dumps({"NominalDiameter": 50})
        el4.insert(ignore_permissions=True)

        # 5. Structural Steel Column
        el5 = frappe.new_doc("BIM Element")
        el5.model = self.model_name
        el5.stable_id = "TEST_STEEL_001"
        el5.element_type = "Member"
        el5.discipline = "structure"
        el5.storey = "Level 1"
        el5.quantities = json.dumps({"NetWeight": 850.0, "Length": 4.5})
        el5.properties = json.dumps({"Profile": "HEB 200", "Material": "Steel S355"})
        el5.insert(ignore_permissions=True)

        frappe.db.commit()

    def tearDown(self):
        # Cleanup test BOM and links
        boms = frappe.get_all("BOM", filters={"item": "_Test Building Item"})
        for b in boms:
            frappe.db.sql("DELETE FROM `tabBOM Item` WHERE parent=%s", [b.name])
            frappe.delete_doc("BOM", b.name, ignore_permissions=True, force=1)

        links = frappe.get_all("BIM BOQ Link", filters={"rule_id": ["like", "BOM%"]})
        for l in links:
            frappe.delete_doc("BIM BOQ Link", l.name, ignore_permissions=True, force=1)
        frappe.db.commit()

    def test_get_model_quantity_summary(self):
        """Test extracting and aggregating quantities from BIM Elements."""
        summary = bom_integration.get_model_quantity_summary(self.model_name)
        self.assertEqual(summary["total_elements"], 5)
        takeoff = summary["material_takeoff"]

        # 14.5 + 35.0 = 49.5 m3 concrete
        self.assertAlmostEqual(takeoff["concrete_volume_m3"], 49.5, places=1)
        # Ductwork area
        self.assertAlmostEqual(takeoff["ductwork_surface_m2"], 42.0, places=1)
        # Piping length
        self.assertAlmostEqual(takeoff["piping_length_m"], 64.0, places=1)
        # Structural steel weight
        self.assertAlmostEqual(takeoff["structural_steel_kg"], 850.0, places=1)

    def test_preview_bom_generation(self):
        """Test previewing BOM lines with waste factors and pricing."""
        preview = bom_integration.preview_bom_generation(
            model=self.model_name,
            target_item="_Test Building Item",
            waste_factor_pct=5.0,
        )

        self.assertGreater(preview["total_items"], 0)
        self.assertGreater(preview["total_cost"], 0)

        # Check concrete line item: 49.5 m3 * 1.05 = 51.975 m3
        concrete_item = next((i for i in preview["items"] if "Concrete" in i["category"]), None)
        self.assertIsNotNone(concrete_item)
        self.assertAlmostEqual(concrete_item["raw_quantity"], 49.5, places=1)
        self.assertAlmostEqual(concrete_item["qty"], 51.975, places=1)

    def test_generate_or_update_bom(self):
        """Test creating a real ERPNext BOM and traceability links."""
        result = bom_integration.generate_or_update_bom(
            model=self.model_name,
            target_item="_Test Building Item",
            waste_factor_pct=5.0,
            bom_type="Manufacture",
        )

        self.assertEqual(result["status"], "success")
        self.assertTrue(result["bom_name"])
        self.assertGreater(result["item_count"], 0)
        self.assertGreater(result["total_cost"], 0)

        # Verify BOM document in database
        bom = frappe.get_doc("BOM", result["bom_name"])
        self.assertEqual(bom.item, "_Test Building Item")
        self.assertEqual(len(bom.items), result["item_count"])
        self.assertEqual(bom.is_active, 1)

        # Verify traceability links in BIM BOQ Link
        boq_links = frappe.get_all(
            "BIM BOQ Link",
            filters={"rule_id": f"BOM:{bom.name}"},
        )
        self.assertGreater(len(boq_links), 0)

    def test_bim_bom_generator_doctype(self):
        """Test BIM BOM Generator DocType workflow."""
        gen = frappe.new_doc("BIM BOM Generator")
        gen.title = "Test Building Generator"
        gen.project = self.project_name
        gen.model = self.model_name
        gen.target_item = "_Test Building Item"
        gen.waste_factor_pct = 5.0
        gen.insert(ignore_permissions=True)

        self.assertTrue(gen.summary_json)

        # Test generation method
        gen_result = gen.generate_bom()
        self.assertEqual(gen_result["status"], "success")
        self.assertEqual(gen.status, "Generated")
        self.assertTrue(gen.generated_bom)
        self.assertGreater(gen.total_cost, 0)
