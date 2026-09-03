"""Test suite for CAD (DWG/DXF) & BIMcollab BCF Collaboration API."""

import base64
import json
import unittest
import zipfile
import io

from test.test_helper import setup_frappe_test_environment
setup_frappe_test_environment()

import frappe
from construction_bim.api.cad import (
    save_cad_issue,
    get_cad_issues,
    add_issue_comment,
    update_issue_status,
    export_bcf_zip,
    import_bcf_zip,
    get_sample_cad_drawing,
)


class TestCADAndBCFCollaboration(unittest.TestCase):
    """Test suite covering CAD drawing dataset and BCF 2.1/3.0 collaboration workflows."""

    @classmethod
    def setUpClass(cls):
        """
        Initialize the shared Frappe context and BIM models required by the test suite.
        
        Raises:
            unittest.SkipTest: If a live Frappe bench site is unavailable.
        """
        if hasattr(frappe.db, "_tables") and not hasattr(frappe, "get_installed_apps"):
            raise unittest.SkipTest("TestCADAndBCFCollaboration requires live Frappe bench site.")
        frappe.set_user("Administrator")
        for mname in ["Nordic_Commercial_Floor_Plan_A101", "Roundtrip_Model_A", "Imported_Model_B"]:
            if not frappe.db.exists("BIM Model", mname):
                model = frappe.new_doc("BIM Model")
                model.name = mname
                model.model_name = mname
                model.discipline = "Architecture"
                model.insert(ignore_permissions=True)

    def tearDown(self):
        # Clean up test issues
        test_issues = frappe.get_all("BIM Issue", filters={"title": ["like", "%CAD Test Issue%"]}, pluck="name")
        for name in test_issues:
            frappe.delete_doc("BIM Issue", name, force=True, ignore_permissions=True)

    def test_01_get_sample_cad_drawing(self):
        """Verify sample CAD drawing generation with multi-discipline layers and extents."""
        cad_data = get_sample_cad_drawing()
        self.assertEqual(cad_data["status"], "success")
        self.assertIn("layers", cad_data)
        self.assertIn("entities", cad_data)
        self.assertIn("extents", cad_data)

        # Check critical discipline layers
        layers = cad_data["layers"]
        self.assertIn("S-GRID", layers)
        self.assertIn("S-COLS", layers)
        self.assertIn("A-WALL", layers)
        self.assertIn("M-DUCT", layers)
        self.assertIn("P-PIPE", layers)

        # Check entity counts and geometry
        entities = cad_data["entities"]
        self.assertGreater(len(entities), 30)

        # Check extents
        extents = cad_data["extents"]
        self.assertGreater(extents["width"], 0)
        self.assertGreater(extents["height"], 0)

    def test_02_save_and_filter_cad_issues(self):
        """Test creating BCF issues with 2D camera viewpoints and filtering."""
        res1 = save_cad_issue({
            "title": "CAD Test Issue - Column Penetration",
            "topic_type": "Clashing",
            "priority": "Critical",
            "reference_model": "Nordic_Commercial_Floor_Plan_A101",
            "location_x": 4000.0,
            "location_y": 5500.0,
            "viewpoint_json": {
                "camera": {"center": {"x": 4000.0, "y": 5500.0, "z": 0.0}, "zoom": 2.5},
                "active_layers": ["S-COLS", "M-DUCT"],
                "markups": [
                    {"type": "pin", "number": 1, "x": 4000.0, "y": 5500.0},
                    {"type": "cloud", "points": [[3800, 5300], [4200, 5300], [4200, 5700], [3800, 5700]]},
                ],
            },
        })
        self.assertEqual(res1["status"], "success")
        issue1_name = res1["issue"]["name"]

        res2 = save_cad_issue({
            "title": "CAD Test Issue - Door Swing Clearance",
            "topic_type": "Remark",
            "priority": "Normal",
            "reference_model": "Nordic_Commercial_Floor_Plan_A101",
            "location_x": 8000.0,
            "location_y": 2000.0,
        })
        self.assertEqual(res2["status"], "success")

        # Test filtering by priority
        crit_issues = get_cad_issues(model_name="Nordic_Commercial_Floor_Plan_A101", priority="Critical")
        self.assertEqual(len(crit_issues), 1)
        self.assertEqual(crit_issues[0]["name"], issue1_name)
        self.assertIn("viewpoint", crit_issues[0])
        self.assertEqual(crit_issues[0]["viewpoint"]["camera"]["zoom"], 2.5)

    def test_03_issue_comment_and_status_progression(self):
        """Test threaded discussion and status transition."""
        res = save_cad_issue({
            "title": "CAD Test Issue - Ceiling Lighting Conflict",
            "topic_status": "Open",
        })
        issue_name = res["issue"]["name"]

        comment_res = add_issue_comment(issue_name, "Re-routing conduit around duct.", new_status="In Progress")
        self.assertEqual(comment_res["status"], "success")
        self.assertEqual(comment_res["data"]["topic_status"], "In Progress")

        # Resolve issue
        update_res = update_issue_status(issue_name, "Resolved")
        self.assertEqual(update_res["topic_status"], "Resolved")

        doc = frappe.get_doc("BIM Issue", issue_name)
        self.assertEqual(doc.resolved_by, "Administrator")
        self.assertIsNotNone(doc.resolution_date)

    def test_04_bcf_export_and_import_roundtrip(self):
        """Test exporting BCF zip package and re-importing into ERPNext."""
        save_cad_issue({
            "title": "CAD Test Issue - Roundtrip Export Test",
            "topic_type": "Issue",
            "priority": "High",
            "reference_model": "Roundtrip_Model_A",
            "location_x": 1000.0,
            "location_y": 2000.0,
            "description": "Roundtrip test description for BCF package.",
            "labels": "architecture, roundtrip",
        })

        # Export BCF Zip
        export_res = export_bcf_zip(model_name="Roundtrip_Model_A")
        self.assertEqual(export_res["status"], "success")
        self.assertTrue(export_res["filename"].endswith(".bcfzip"))
        self.assertGreater(len(export_res["zip_base64"]), 100)

        # Inspect zip contents in memory
        zip_bytes = base64.b64decode(export_res["zip_base64"])
        with zipfile.ZipFile(io.BytesIO(zip_bytes), "r") as zf:
            names = zf.namelist()
            self.assertIn("bcf.version", names)
            markup_files = [n for n in names if n.endswith("markup.bcf")]
            self.assertEqual(len(markup_files), 1)

        # Import into another model reference
        import_res = import_bcf_zip(export_res["zip_base64"], reference_model="Imported_Model_B")
        self.assertEqual(import_res["status"], "success")
        self.assertEqual(import_res["imported_count"], 1)

        imported_issues = get_cad_issues(model_name="Imported_Model_B")
        self.assertEqual(len(imported_issues), 1)
        imported_doc = frappe.get_doc("BIM Issue", imported_issues[0]["name"])
        self.assertEqual(imported_doc.priority, "High")
        self.assertIn("architecture", imported_doc.labels)


if __name__ == "__main__":
    unittest.main()
