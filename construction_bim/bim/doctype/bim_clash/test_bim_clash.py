"""Unit tests for BIM Clash DocType."""

from __future__ import annotations

import json
import unittest

import frappe
from frappe.tests.utils import FrappeTestCase


def _get_or_create_project(project_name: str = "_Test BIM Clash Project") -> str:
    existing = frappe.db.get_value("Project", {"project_name": project_name}, "name")
    if existing:
        return existing
    proj = frappe.new_doc("Project")
    proj.project_name = project_name
    proj.insert(ignore_permissions=True)
    return proj.name


class TestBIMClash(FrappeTestCase):
    def setUp(self):
        self.project_name = _get_or_create_project("_Test BIM Clash Project")

        # Create test BIM Models
        if not frappe.db.exists("BIM Model", {"model_name": "_Test Struc Model"}):
            model_a = frappe.new_doc("BIM Model")
            model_a.model_name = "_Test Struc Model"
            model_a.discipline = "Structural"
            model_a.project = self.project_name
            model_a.insert(ignore_permissions=True)
            self.model_a = model_a.name
        else:
            self.model_a = frappe.db.get_value("BIM Model", {"model_name": "_Test Struc Model"}, "name")

        if not frappe.db.exists("BIM Model", {"model_name": "_Test HVAC Model"}):
            model_b = frappe.new_doc("BIM Model")
            model_b.model_name = "_Test HVAC Model"
            model_b.discipline = "MEP"
            model_b.project = self.project_name
            model_b.insert(ignore_permissions=True)
            self.model_b = model_b.name
        else:
            self.model_b = frappe.db.get_value("BIM Model", {"model_name": "_Test HVAC Model"}, "name")

    def tearDown(self):
        # Cleanup test clashes
        test_clashes = frappe.get_all("BIM Clash", filters={"project": self.project_name})
        for c in test_clashes:
            frappe.delete_doc("BIM Clash", c.name, ignore_permissions=True, force=1)
        frappe.db.commit()

    def test_clash_creation_and_defaults(self):
        """Test creating a clash record with element data and auto-generated fields."""
        clash = frappe.new_doc("BIM Clash")
        clash.project = self.project_name
        clash.model_a = self.model_a
        clash.model_b = self.model_b
        clash.element_a_guid = "2O2Fr$t4X7Zf8NOew3FL9r"
        clash.element_a_type = "Beam"
        clash.discipline_a = "Structural"
        clash.element_b_guid = "1T5Gs$y2X9Zf3MOew4AB8k"
        clash.element_b_type = "Duct"
        clash.discipline_b = "MEP"
        clash.collision_x = 12.5
        clash.collision_y = 6.2
        clash.collision_z = 3.8
        clash.penetration_depth = 45.0
        clash.severity = "Critical"
        clash.status = "Open"
        clash.insert(ignore_permissions=True)

        self.assertTrue(clash.name)
        self.assertTrue(clash.bcf_guid)
        self.assertTrue(clash.clash_id.startswith("CLASH-"))
        self.assertEqual(clash.guid_a, "2O2Fr$t4X7Zf8NOew3FL9r")
        self.assertEqual(clash.guid_b, "1T5Gs$y2X9Zf3MOew4AB8k")
        self.assertEqual(clash.collision_point_x, 12.5)

        # Check viewpoint generation
        vp = clash.get_viewpoint()
        self.assertIn("perspective_camera", vp)
        self.assertIn("components", vp)
        self.assertEqual(len(vp["components"]["selection"]), 2)

    def test_status_workflow_and_resolution(self):
        """Test status transitions and auto-stamping of resolved_by and date."""
        clash = frappe.new_doc("BIM Clash")
        clash.project = self.project_name
        clash.model_a = self.model_a
        clash.model_b = self.model_b
        clash.element_a_guid = "GUID_A_001"
        clash.element_b_guid = "GUID_B_001"
        clash.status = "Open"
        clash.insert(ignore_permissions=True)

        self.assertIsNone(clash.resolved_by)
        self.assertIsNone(clash.resolution_date)

        # Transition to Resolved
        clash.status = "Resolved"
        clash.resolution_type = "Rerouted MEP"
        clash.resolution_notes = "Rerouted supply duct 150mm lower to avoid beam."
        clash.save(ignore_permissions=True)

        self.assertTrue(clash.resolved_by)
        self.assertTrue(clash.resolution_date)

    def test_threaded_discussion_comment(self):
        """Test adding threaded comments to a BIM Clash."""
        clash = frappe.new_doc("BIM Clash")
        clash.project = self.project_name
        clash.model_a = self.model_a
        clash.model_b = self.model_b
        clash.element_a_guid = "GUID_A_COMMENT"
        clash.element_b_guid = "GUID_B_COMMENT"
        clash.insert(ignore_permissions=True)

        result = clash.add_comment("Please check duct clearance under girder G-12.", user="Administrator")
        self.assertTrue(result["name"])
        self.assertIn("girder G-12", result["content"])

        # Check comment exists in DB
        comments = frappe.get_all(
            "Comment",
            filters={"reference_doctype": "BIM Clash", "reference_name": clash.name},
            fields=["content", "comment_by"],
        )
        self.assertEqual(len(comments), 1)
        self.assertIn("girder G-12", comments[0]["content"])

    def test_to_bcf_topic_serialization(self):
        """Test buildingSMART BCF Topic serialization."""
        clash = frappe.new_doc("BIM Clash")
        clash.project = self.project_name
        clash.model_a = self.model_a
        clash.model_b = self.model_b
        clash.element_a_guid = "GUID_A_BCF"
        clash.element_b_guid = "GUID_B_BCF"
        clash.severity = "Major"
        clash.insert(ignore_permissions=True)

        topic = clash.to_bcf_topic()
        self.assertEqual(topic["guid"], clash.bcf_guid)
        self.assertEqual(topic["topic_status"], "Open")
        self.assertIn("custom_attributes", topic)
        self.assertEqual(topic["custom_attributes"]["model_a"], self.model_a)
