"""Unit tests for BIM Issue DocType and BCF serialization."""

import unittest
import frappe
from frappe.utils import now_datetime


class TestBIMIssue(unittest.TestCase):
    """Test suite for BIM Issue creation, lifecycle, and BCF exchange."""

    @classmethod
    def setUpClass(cls):
        frappe.set_user("Administrator")

    def tearDown(self):
        # Clean up any test issues created during testing
        test_issues = frappe.get_all("BIM Issue", filters={"title": ["like", "%Test CAD Issue%"]}, pluck="name")
        for name in test_issues:
            frappe.delete_doc("BIM Issue", name, force=True, ignore_permissions=True)

    def test_01_issue_creation_and_defaults(self):
        """Test creating a BIM Issue with default status, type, and priority."""
        issue = frappe.get_doc({
            "doctype": "BIM Issue",
            "title": "Test CAD Issue - Duct Collision with Column",
            "topic_type": "Clashing",
            "priority": "High",
            "stage": "Coordination",
            "drawing_space": "Model Space",
            "pin_number": 1,
            "location_x": 1250.5,
            "location_y": 850.2,
            "viewpoint_json": '{"camera": {"center": {"x": 1250.5, "y": 850.2, "z": 0}, "zoom": 1.5}, "active_layers": ["A-WALL", "M-DUCT"]}',
        })
        issue.insert()

        self.assertTrue(issue.name.startswith("BIM-ISSUE-"))
        self.assertEqual(issue.topic_status, "Open")
        self.assertEqual(issue.topic_type, "Clashing")
        self.assertEqual(issue.priority, "High")
        self.assertEqual(issue.created_by_user, "Administrator")
        self.assertIsNotNone(issue.creation_date)
        self.assertIsNone(issue.resolved_by)
        self.assertIsNone(issue.resolution_date)

    def test_02_status_transition_lifecycle(self):
        """Test status transitions, auto-stamping of resolver, and reopening."""
        issue = frappe.get_doc({
            "doctype": "BIM Issue",
            "title": "Test CAD Issue - Wall Thickness Dimension",
            "topic_type": "Remark",
            "topic_status": "Open",
            "priority": "Normal",
        })
        issue.insert()

        # Transition to In Progress
        issue.topic_status = "In Progress"
        issue.save()
        self.assertIsNone(issue.resolved_by)

        # Transition to Resolved
        issue.topic_status = "Resolved"
        issue.save()
        self.assertEqual(issue.resolved_by, "Administrator")
        self.assertIsNotNone(issue.resolution_date)

        # Reopen to Open
        issue.topic_status = "Open"
        issue.save()
        self.assertIsNone(issue.resolved_by)
        self.assertIsNone(issue.resolution_date)

    def test_03_threaded_discussion_comment(self):
        """Test adding threaded comments to an issue with status updates."""
        issue = frappe.get_doc({
            "doctype": "BIM Issue",
            "title": "Test CAD Issue - Revision Required at Grid 4",
            "topic_status": "Open",
        })
        issue.insert()

        result = issue.add_discussion_comment("Architectural grid moved 200mm north.", new_status="In Progress")
        self.assertEqual(result["topic_status"], "In Progress")
        self.assertIn("Architectural grid", result["content"])

        # Reload issue and check status
        issue.reload()
        self.assertEqual(issue.topic_status, "In Progress")

    def test_04_bcf_topic_and_xml_serialization(self):
        """Test buildingSMART BCF 2.1 serialization to dict and XML."""
        issue = frappe.get_doc({
            "doctype": "BIM Issue",
            "title": "Test CAD Issue - BCF Export Verification",
            "topic_type": "Issue",
            "topic_status": "Open",
            "priority": "Critical",
            "stage": "Detailed Design",
            "labels": "structural, hvac, clash",
            "pin_number": 42,
            "location_x": 500.0,
            "location_y": 300.0,
            "description": "Pipe penetrates steel beam web without sleeve.",
            "viewpoint_json": '{"camera": {"center": {"x": 500.0, "y": 300.0, "z": 0}, "zoom": 2.0}, "active_layers": ["S-BEAM", "P-PIPE"]}',
        })
        issue.insert()

        # Test dictionary serialization
        bcf_dict = issue.to_bcf_topic_dict()
        self.assertIn("topic", bcf_dict)
        self.assertIn("viewpoints", bcf_dict)
        top = bcf_dict["topic"]
        self.assertEqual(top["title"], "Test CAD Issue - BCF Export Verification")
        self.assertEqual(top["priority"], "Critical")
        self.assertIn("structural", top["labels"])

        # Test XML serialization
        markup_xml, viewpoint_xml = issue.to_bcf_xml()
        self.assertIn("<Markup", markup_xml)
        self.assertIn("<Topic", markup_xml)
        self.assertIn("Pipe penetrates steel beam web without sleeve.", markup_xml)
        self.assertIn("<VisualizationInfo", viewpoint_xml)
        self.assertIn("<OrthogonalCamera", viewpoint_xml)
        self.assertIn("<X>500.0</X>", viewpoint_xml)
        self.assertIn("<Y>300.0</Y>", viewpoint_xml)


if __name__ == "__main__":
    unittest.main()
