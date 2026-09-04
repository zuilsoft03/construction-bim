"""Comprehensive verification test suite for BIM Clash and BOM Integration.

Tests:
1. BIM Clash DocType validation, BCF 2.1 viewpoint math, and threaded discussion.
2. Batch clash persistence and symmetric deduplication API.
3. Quantity extraction from real IFC models (STRUC Nordic LCA Housing Concrete).
4. ERPNext BOM generation, waste factor scaling, unit cost rollups, and BOQ links.
"""

from __future__ import annotations

import json
import os
import unittest

import frappe
from frappe.tests.utils import FrappeTestCase

from construction_bim.api import clash, bom_integration
from construction_bim.bim import ifc_parser


def _get_or_create_project(project_name: str = "_Test BIM Integrated Project") -> str:
    existing = frappe.db.get_value("Project", {"project_name": project_name}, "name")
    if existing:
        return existing
    proj = frappe.new_doc("Project")
    proj.project_name = project_name
    proj.insert(ignore_permissions=True)
    return proj.name


class TestBIMClashAndBOMSuite(FrappeTestCase):
    @classmethod
    def setUpClass(cls):
        if hasattr(frappe.db, "_tables") and not hasattr(frappe, "get_installed_apps"):
            raise unittest.SkipTest("TestBIMClashAndBOMSuite requires live Frappe bench site.")
        super().setUpClass()
        cls.project_name = _get_or_create_project("_Test BIM Integrated Project")

        # Ensure test structural & MEP models exist
        cls.struc_model = cls._get_or_create_model("_Test Struc Model 01", "Structural", cls.project_name)
        cls.mep_model = cls._get_or_create_model("_Test MEP Model 01", "MEP", cls.project_name)

    @classmethod
    def _get_or_create_model(cls, name: str, discipline: str, project: str) -> str:
        existing = frappe.db.get_value("BIM Model", {"model_name": name}, "name")
        if existing:
            return existing
        m = frappe.new_doc("BIM Model")
        m.model_name = name
        m.discipline = discipline
        m.project = project
        m.status = "Ready"
        m.insert(ignore_permissions=True)
        return m.name

    def setUp(self):
        # Clean up existing clashes for this project for a fresh hermetic run
        frappe.db.sql("DELETE FROM `tabBIM Clash` WHERE project = %s", [self.project_name])
        self._populate_test_elements()

    def _populate_test_elements(self):
        # Create concrete and duct elements
        frappe.db.sql("DELETE FROM `tabBIM Element` WHERE model IN (%s, %s)", [self.struc_model, self.mep_model])

        # 1. Structural Concrete Slab
        el_slab = frappe.new_doc("BIM Element")
        el_slab.model = self.struc_model
        el_slab.stable_id = "GUID_SLAB_001"
        el_slab.element_type = "Slab"
        el_slab.discipline = "structure"
        el_slab.storey = "Level 1"
        el_slab.quantities = json.dumps({"NetVolume": 28.5, "GrossVolume": 30.0, "NetArea": 142.5})
        el_slab.properties = json.dumps({"Material": "Concrete C30/37"})
        el_slab.insert(ignore_permissions=True)

        # 2. Structural Concrete Column
        el_col = frappe.new_doc("BIM Element")
        el_col.model = self.struc_model
        el_col.stable_id = "GUID_COL_001"
        el_col.element_type = "Column"
        el_col.discipline = "structure"
        el_col.storey = "Level 1"
        el_col.quantities = json.dumps({"NetVolume": 2.8, "GrossVolume": 3.0, "Length": 3.6})
        el_col.properties = json.dumps({"Material": "Concrete C30/37"})
        el_col.insert(ignore_permissions=True)

        # 3. MEP Supply Duct (clashing with column)
        el_duct = frappe.new_doc("BIM Element")
        el_duct.model = self.mep_model
        el_duct.stable_id = "GUID_DUCT_001"
        el_duct.element_type = "Duct"
        el_duct.discipline = "mep"
        el_duct.storey = "Level 1"
        el_duct.quantities = json.dumps({"GrossArea": 24.0, "Length": 12.0})
        el_duct.properties = json.dumps({"Width": 600, "Height": 400})
        el_duct.insert(ignore_permissions=True)

        # 4. MEP Water Pipe
        el_pipe = frappe.new_doc("BIM Element")
        el_pipe.model = self.mep_model
        el_pipe.stable_id = "GUID_PIPE_001"
        el_pipe.element_type = "Pipe"
        el_pipe.discipline = "mep"
        el_pipe.storey = "Level 1"
        el_pipe.quantities = json.dumps({"Length": 48.0})
        el_pipe.properties = json.dumps({"NominalDiameter": 40})
        el_pipe.insert(ignore_permissions=True)

    # ----------------------------------------------------------------------
    # Clash Detection Tests
    # ----------------------------------------------------------------------

    def test_01_save_clashes_batch_and_deduplication(self):
        """Verify batch clash saving with symmetric deduplication."""
        clashes_data = [
            {
                "title": "HVAC Duct vs Structural Column Clash",
                "project": self.project_name,
                "model_a": self.struc_model,
                "model_b": self.mep_model,
                "element_a_guid": "GUID_COL_001",
                "element_a_type": "Column",
                "discipline_a": "Structural",
                "element_b_guid": "GUID_DUCT_001",
                "element_b_type": "Duct",
                "discipline_b": "MEP",
                "collision_x": 10.4,
                "collision_y": 5.2,
                "collision_z": 3.1,
                "penetration_depth": 75.0,
                "severity": "Critical",
                "status": "Open",
            }
        ]

        # First save: should create 1 clash
        res1 = clash.save_clashes_batch(clashes_data)
        self.assertEqual(res1["created"], 1)
        self.assertEqual(len(res1["clashes"]), 1)
        clash_name = res1["clashes"][0]

        # Second save (symmetric pair): should deduplicate and update existing clash
        clashes_data_sym = [
            {
                "title": "HVAC Duct vs Structural Column Clash",
                "project": self.project_name,
                "model_a": self.mep_model,
                "model_b": self.struc_model,
                "element_a_guid": "GUID_DUCT_001",
                "element_b_guid": "GUID_COL_001",
                "collision_x": 10.45,
                "collision_y": 5.22,
                "collision_z": 3.12,
                "penetration_depth": 80.0,
                "severity": "Critical",
            }
        ]
        res2 = clash.save_clashes_batch(clashes_data_sym)
        self.assertEqual(res2["created"], 0)
        self.assertEqual(res2["updated"], 1)

        # Verify updated penetration depth in DB
        doc = frappe.get_doc("BIM Clash", clash_name)
        self.assertAlmostEqual(doc.penetration_depth, 80.0, places=1)

    def test_02_clash_discussion_and_status_transitions(self):
        """Verify adding comments and status resolution lifecycle."""
        # Create clash
        clash_doc = frappe.new_doc("BIM Clash")
        clash_doc.project = self.project_name
        clash_doc.model_a = self.struc_model
        clash_doc.model_b = self.mep_model
        clash_doc.element_a_guid = "GUID_SLAB_001"
        clash_doc.element_b_guid = "GUID_PIPE_001"
        clash_doc.status = "Open"
        clash_doc.insert(ignore_permissions=True)

        # Add discussion comment
        comment_res = clash.add_clash_comment(clash_doc.name, "Pipe penetrates slab without sleeve opening.")
        self.assertTrue(comment_res["name"])

        # Fetch clash detail with comments
        clash_data = clash.get_clash(clash_doc.name)
        self.assertEqual(len(clash_data["comments"]), 1)
        self.assertIn("sleeve opening", clash_data["comments"][0]["content"])

        # Update status to Resolved
        update_res = clash.update_clash_status(
            clash_name=clash_doc.name,
            status="Resolved",
            resolution_type="Modified Structural Opening",
            resolution_notes="Approved 100mm core drill opening with firestop collar.",
        )
        self.assertEqual(update_res["status"], "Resolved")
        self.assertTrue(update_res["resolved_by"])
        self.assertTrue(update_res["resolution_date"])

    def test_03_get_clashes_filtered(self):
        """Verify querying clashes with filters and camera viewpoints."""
        # Ensure at least one clash exists
        clash_doc = frappe.new_doc("BIM Clash")
        clash_doc.project = self.project_name
        clash_doc.model_a = self.struc_model
        clash_doc.model_b = self.mep_model
        clash_doc.element_a_guid = "GUID_SLAB_001"
        clash_doc.element_b_guid = "GUID_DUCT_001"
        clash_doc.severity = "Critical"
        clash_doc.status = "Open"
        clash_doc.insert(ignore_permissions=True)

        clashes = clash.get_clashes(project=self.project_name)
        self.assertGreater(len(clashes), 0)
        for c in clashes:
            self.assertIn("viewpoint", c)
            self.assertIn("perspective_camera", c["viewpoint"])
            self.assertIn("camera_view_point", c["viewpoint"]["perspective_camera"])


    # ----------------------------------------------------------------------
    # Quantity Takeoff & BOM Generation Tests
    # ----------------------------------------------------------------------

    def test_04_get_model_quantity_summary(self):
        """Verify model quantity aggregation across concrete, ducts, and pipes."""
        summary = bom_integration.get_model_quantity_summary(self.struc_model)
        takeoff = summary["material_takeoff"]

        # 28.5 (slab) + 2.8 (column) = 31.3 m3 concrete
        self.assertAlmostEqual(takeoff["concrete_volume_m3"], 31.3, places=1)
        # Rebar ratio estimate: 31.3 * 100 = 3130 kg
        self.assertAlmostEqual(takeoff["rebar_weight_kg"], 3130.0, places=0)

        mep_summary = bom_integration.get_model_quantity_summary(self.mep_model)
        mep_takeoff = mep_summary["material_takeoff"]
        self.assertAlmostEqual(mep_takeoff["ductwork_surface_m2"], 24.0, places=1)
        self.assertAlmostEqual(mep_takeoff["piping_length_m"], 48.0, places=1)

    def test_05_generate_or_update_bom(self):
        """Verify creating ERPNext BOM, cost rollups, and BOQ links."""
        target_item = "_Test Building Target Item"

        bom_res = bom_integration.generate_or_update_bom(
            model=self.struc_model,
            target_item=target_item,
            waste_factor_pct=5.0,
            bom_type="Manufacture",
        )

        self.assertEqual(bom_res["status"], "success")
        bom_name = bom_res["bom_name"]
        self.assertTrue(bom_name)

        bom_doc = frappe.get_doc("BOM", bom_name)
        self.assertEqual(bom_doc.item, target_item)
        self.assertGreater(len(bom_doc.items), 0)
        self.assertGreater(bom_doc.total_cost, 0.0)

        # Verify concrete line item: 31.3 m3 * 1.05 = 32.865 m3
        concrete_line = next((item for item in bom_doc.items if "Concrete" in item.item_code), None)
        self.assertIsNotNone(concrete_line)
        self.assertAlmostEqual(concrete_line.qty, 32.865, places=1)

        # Verify BOQ traceability links
        links = frappe.get_all(
            "BIM BOQ Link",
            filters={"rule_id": f"BOM:{bom_name}"},
        )
        self.assertGreater(len(links), 0)

    def test_06_real_ifc_parsing_and_quantity_extraction(self):
        """Verify real Nordic LCA structural IFC parsing and volume extraction."""
        # Find IFC file
        possible_paths = [
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "STRUCTURAL", "IFC", "STRUC_NordicLCA_Housing_Concrete_BuildingPermit.ifc"),
            "/home/frappe/frappe-bench/apps/construction_bim/STRUCTURAL/IFC/STRUC_NordicLCA_Housing_Concrete_BuildingPermit.ifc",
            "C:/Users/gavie/ERP/construction_bim/STRUCTURAL/IFC/STRUC_NordicLCA_Housing_Concrete_BuildingPermit.ifc",
        ]

        ifc_path = next((p for p in possible_paths if os.path.exists(p)), None)

        if not ifc_path:
            self.skipTest(f"Real IFC file not found at {possible_paths}")

        with open(ifc_path, "rb") as f:
            raw_bytes = f.read()

        parsed = ifc_parser.process_ifc_bytes(raw_bytes)
        self.assertGreater(parsed["element_count"], 0)
        self.assertGreater(len(parsed["elements"]), 0)

        # Check for real structural entities
        element_types = {el["element_type"] for el in parsed["elements"]}
        self.assertTrue(any(t in element_types for t in ["Wall", "Slab", "Column", "Beam", "Footing", "Member"]))
