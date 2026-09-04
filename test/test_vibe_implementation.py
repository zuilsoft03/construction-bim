"""Verification Test Suite for Vibe Engineering Implementation of OpenProject BIM Supersession.

Tests:
1. Automated Clash-to-BCF synchronization (Topic + Viewpoint + Camera).
2. 4D Schedule Progress visual simulation coloring.
3. Automated ERPNext Material Request generation from BIM quantities.
4. Agentic AI RFI Synthesizer.
5. Agentic AI Daily Site Diary Generator.
6. Collaborative Clash Filtering and Trade Clustering Agent.
7. In-Viewer AI Assistant Copilot with Persona Workflow injection.
8. Persona-Driven Role Dashboards (Architect, Structural/MEP, PM/QS, Site Supervisor).
"""

from __future__ import annotations

import json
import os
import pathlib
import sys
import unittest
import uuid
import time

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from test.test_helper import (
    setup_frappe_test_environment,
    mock_frappe_db,
    MockDoc,
)
import frappe


class TestVibeImplementationSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        setup_frappe_test_environment()

    def setUp(self):
        mock_frappe_db.clear()

    # -------------------------------------------------------------------------
    # 1. Automated Clash-to-BCF Bridge Tests
    # -------------------------------------------------------------------------
    def test_sync_clash_to_bcf(self):
        """Verify that a BIM Clash record automatically syncs to a BCF Topic and Viewpoint."""
        from construction_bim.api.clash import sync_clash_to_bcf

        clash = frappe.new_doc("BIM Clash")
        clash.title = "Duct D-101 clashes with Column C-04"
        clash.project = "PROJ-HOSPITAL"
        clash.element_a_guid = "guid_duct_101"
        clash.element_a_type = "IfcDuctSegment"
        clash.discipline_a = "MEP"
        clash.element_b_guid = "guid_col_04"
        clash.element_b_type = "IfcColumn"
        clash.discipline_b = "Structural"
        clash.collision_point_x = 12.5
        clash.collision_point_y = 30.2
        clash.collision_point_z = 4.1
        clash.penetration_depth = 120.0
        clash.status = "Open"
        clash.priority = "Critical"
        clash.insert()

        res = sync_clash_to_bcf(clash)
        self.assertEqual(res["status"], "success")
        self.assertIsNotNone(res["bcf_topic"])
        self.assertIsNotNone(res["bcf_viewpoint"])

        # Check BCF Topic in DB
        topic = frappe.get_doc("BCF Topic", res["bcf_topic"])
        self.assertEqual(topic.title, "Duct D-101 clashes with Column C-04")
        self.assertEqual(topic.topic_type, "Clash")
        self.assertEqual(topic.topic_status, "Open")
        self.assertEqual(topic.priority, "Critical")
        self.assertEqual(topic.bim_clash, clash.name)

        # Check BCF Viewpoint in DB
        vp = frappe.get_doc("BCF Viewpoint", res["bcf_viewpoint"])
        self.assertEqual(vp.viewpoint_type, "Perspective")
        sels = json.loads(vp.selection)
        self.assertEqual(len(sels), 2)
        guids = [s["ifc_guid"] for s in sels]
        self.assertIn("guid_duct_101", guids)
        self.assertIn("guid_col_04", guids)

    # -------------------------------------------------------------------------
    # 2. 4D Schedule Progress Visualizer Tests
    # -------------------------------------------------------------------------
    def test_get_4d_schedule_coloring(self):
        """Verify 4D simulation color codes based on task statuses and dates."""
        from construction_bim.api.api import get_4d_schedule_coloring

        project_id = "PROJ-4D-TEST"

        # Create Task 1: Completed (Green)
        t1 = frappe.new_doc("Task")
        t1.project = project_id
        t1.subject = "Foundation Pouring"
        t1.status = "Completed"
        t1.insert()

        # Link to BCF Topic with element
        top1 = frappe.new_doc("BCF Topic")
        top1.title = "Foundation inspection"
        top1.erpnext_task = t1.name
        top1.insert()

        vp1 = frappe.new_doc("BCF Viewpoint")
        vp1.topic = top1.name
        vp1.selection = json.dumps([{"ifc_guid": "slab_guid_001"}])
        vp1.insert()
        top1.default_viewpoint = vp1.name
        top1.save()

        # Create Task 2: Working (Blue)
        t2 = frappe.new_doc("Task")
        t2.project = project_id
        t2.subject = "Ground Columns"
        t2.status = "Working"
        t2.exp_end_date = "2026-12-31"  # future date
        t2.insert()

        top2 = frappe.new_doc("BCF Topic")
        top2.erpnext_task = t2.name
        top2.insert()

        vp2 = frappe.new_doc("BCF Viewpoint")
        vp2.topic = top2.name
        vp2.selection = json.dumps([{"ifc_guid": "col_guid_002"}])
        vp2.insert()
        top2.default_viewpoint = vp2.name
        top2.save()

        # Fetch 4D Coloring
        res = get_4d_schedule_coloring(project_id)
        self.assertEqual(res["project"], project_id)
        el_map = {e["ifc_guid"]: e for e in res["elements"]}

        self.assertIn("slab_guid_001", el_map)
        self.assertEqual(el_map["slab_guid_001"]["color"], "#00AA00")  # Green
        self.assertEqual(el_map["slab_guid_001"]["status"], "Completed")

        self.assertIn("col_guid_002", el_map)
        self.assertEqual(el_map["col_guid_002"]["color"], "#0088FF")  # Blue
        self.assertEqual(el_map["col_guid_002"]["status"], "Working")

    # -------------------------------------------------------------------------
    # 3. Automated Material Request from BIM Tests
    # -------------------------------------------------------------------------
    def test_generate_material_request_from_bim(self):
        """Verify generating an ERPNext Material Request from BIM Model takeoff quantities."""
        from construction_bim.api.bom_integration import generate_material_request_from_bim

        # Setup model and elements
        model = frappe.new_doc("BIM Model")
        model.model_name = "Office Tower Structural"
        model.project = "PROJ-OFFICE"
        model.insert()

        el1 = frappe.new_doc("BIM Element")
        el1.model = model.name
        el1.element_name = "Shear Wall W1"
        el1.element_type = "IFCWALLSTANDARDCASE"
        el1.volume = 12.5  # m3
        el1.insert()

        el2 = frappe.new_doc("BIM Element")
        el2.model = model.name
        el2.element_name = "HVAC Supply Duct"
        el2.element_type = "IFCDUCTSEGMENT"
        el2.area = 45.0  # m2
        el2.insert()

        res = generate_material_request_from_bim(
            model.name,
            cost_center="Cost Center 1 - Acme",
            warehouse="Stores - Acme"
        )
        self.assertEqual(res["status"], "success")
        self.assertTrue(res["items_count"] >= 1)

        mr_doc = frappe.get_doc("Material Request", res["material_request"])
        self.assertEqual(mr_doc.material_request_type, "Purchase")
        self.assertTrue(len(mr_doc.items) >= 1)

    # -------------------------------------------------------------------------
    # 4. Agentic AI RFI Synthesizer Tests
    # -------------------------------------------------------------------------
    def test_agent_rfi_synthesizer(self):
        """Verify automated RFI generation from engineering clash."""
        from construction_bim.agent.rfi_synthesizer import generate_rfi_from_clash

        clash = frappe.new_doc("BIM Clash")
        clash.title = "Beam B-101 vs Duct D-202"
        clash.discipline_a = "Structural"
        clash.element_a_type = "IfcBeam"
        clash.element_a_guid = "beam_guid_101"
        clash.discipline_b = "MEP"
        clash.element_b_type = "IfcDuctSegment"
        clash.element_b_guid = "duct_guid_202"
        clash.collision_point_x = 5.0
        clash.collision_point_y = 10.0
        clash.collision_point_z = 3.0
        clash.penetration_depth = 150.0
        clash.insert()

        rfi = generate_rfi_from_clash(
            clash.name,
            question_context="Duct conflicts with post-tensioned beam tendons.",
            proposed_solution="Shift duct south by 400mm."
        )
        self.assertEqual(rfi["status"], "success")
        self.assertIn("RFI", rfi["rfi_title"])
        self.assertIn("post-tensioned", rfi["narrative"])

        topic = frappe.get_doc("BCF Topic", rfi["bcf_topic"])
        self.assertEqual(topic.topic_type, "Request")

    # -------------------------------------------------------------------------
    # 5. Agentic AI Daily Site Diary Tests
    # -------------------------------------------------------------------------
    def test_agent_site_diary(self):
        """Verify daily construction log synthesis."""
        from construction_bim.agent.site_diary import synthesize_daily_site_diary

        proj_id = "PROJ-SITE-01"

        t = frappe.new_doc("Task")
        t.project = proj_id
        t.subject = "Assemble Rebar for Column Grid 4"
        t.status = "Completed"
        t.insert()

        diary = synthesize_daily_site_diary(
            proj_id,
            weather_summary="Sunny, 28°C",
            site_notes="Concrete pump arrived on time at 08:00 AM."
        )
        self.assertEqual(diary["status"], "success")
        self.assertEqual(diary["completed_tasks_count"], 1)
        self.assertIn("Daily Construction Site Diary", diary["diary_markdown"])
        self.assertIn("Concrete pump arrived", diary["diary_markdown"])

    # -------------------------------------------------------------------------
    # 6. Collaborative Clash Filtering Agent Tests
    # -------------------------------------------------------------------------
    def test_agent_clash_filter(self):
        """Verify false-positive separation and trade clustering."""
        from construction_bim.agent.clash_filter import filter_and_group_clashes

        # Clash 1: Genuine heavy structural clash
        c1 = frappe.new_doc("BIM Clash")
        c1.title = "Column vs Main Duct"
        c1.discipline_a = "Structural"
        c1.element_a_type = "IFCCOLUMN"
        c1.discipline_b = "MEP"
        c1.element_b_type = "IFCDUCTSEGMENT"
        c1.penetration_depth = 120.0
        c1.storey = "Level 2"
        c1.insert()

        # Clash 2: Intentional wall sleeve penetration (drywall vs pipe < 50mm)
        c2 = frappe.new_doc("BIM Clash")
        c2.title = "Wall sleeve penetration"
        c2.discipline_a = "Architectural"
        c2.element_a_type = "IFCWALL"
        c2.discipline_b = "MEP"
        c2.element_b_type = "IFCPIPESEGMENT"
        c2.penetration_depth = 25.0
        c2.storey = "Level 2"
        c2.insert()

        # Clash 3: Sub-tolerance contact (3mm < 5mm)
        c3 = frappe.new_doc("BIM Clash")
        c3.title = "Touching surfaces"
        c3.element_a_type = "IFCBEAM"
        c3.element_b_type = "IFCSLAB"
        c3.penetration_depth = 3.0
        c3.insert()

        res = filter_and_group_clashes(min_penetration_mm=5.0)
        self.assertEqual(res["total_evaluated"], 3)
        self.assertEqual(res["real_clashes_count"], 1)
        self.assertEqual(res["false_positives_count"], 2)

        real_names = [rc["clash"] for rc in res["real_clashes"]]
        self.assertIn(c1.name, real_names)
        self.assertNotIn(c2.name, real_names)
        self.assertNotIn(c3.name, real_names)

    # -------------------------------------------------------------------------
    # 7. In-Viewer AI Assistant Copilot Tests
    # -------------------------------------------------------------------------
    def test_agent_copilot(self):
        """Verify copilot responses and persona workflow prompt injection."""
        from construction_bim.agent.copilot import query_copilot_assistant

        # Test clash query
        res = query_copilot_assistant(
            prompt="Are there any open clashes?",
            role="Structural Engineer"
        )
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["role"], "Structural Engineer")
        self.assertIn("Lead Structural Engineer", res["system_persona"])

        # Test element takeoff query
        el = frappe.new_doc("BIM Element")
        el.ifc_guid = "sample_slab_guid_1"
        el.element_name = "Roof Slab S-01"
        el.element_type = "IfcSlab"
        el.volume = 85.4
        el.area = 240.0
        el.insert()

        res_el = query_copilot_assistant(
            prompt="What is the concrete volume of this slab?",
            role="Architect",
            selected_guid="sample_slab_guid_1"
        )
        self.assertEqual(res_el["status"], "success")
        self.assertIn("85.400 m³", res_el["response"])

    # -------------------------------------------------------------------------
    # 8. Persona-Driven Role Workspaces Tests
    # -------------------------------------------------------------------------
    def test_persona_workspaces(self):
        """Verify persona definitions and dashboard metrics generation."""
        from construction_bim.workspace.persona_workspaces import (
            get_available_personas,
            get_persona_dashboard_metrics
        )

        personas = get_available_personas()
        self.assertEqual(len(personas), 5)
        p_ids = [p["id"] for p in personas]
        self.assertIn("Architect", p_ids)
        self.assertIn("Structural_MEP", p_ids)
        self.assertIn("Project_Manager_QS", p_ids)
        self.assertIn("Site_Supervisor", p_ids)
        self.assertIn("Safety_Officer", p_ids)

        # Test Architect metrics
        arch_metrics = get_persona_dashboard_metrics("Architect")
        self.assertEqual(arch_metrics["persona"], "Architect")
        self.assertTrue(len(arch_metrics["kpis"]) >= 3)
        self.assertTrue(len(arch_metrics["quick_actions"]) >= 2)

        # Test Structural/MEP metrics
        eng_metrics = get_persona_dashboard_metrics("Structural_MEP")
        self.assertEqual(eng_metrics["persona"], "Structural_MEP")
        self.assertTrue(len(eng_metrics["kpis"]) >= 3)

        # Test PM/QS metrics
        pm_metrics = get_persona_dashboard_metrics("Project_Manager_QS")
        self.assertEqual(pm_metrics["persona"], "Project_Manager_QS")
        self.assertTrue(len(pm_metrics["kpis"]) >= 3)

        # Test Site Supervisor metrics
        site_metrics = get_persona_dashboard_metrics("Site_Supervisor")
        self.assertEqual(site_metrics["persona"], "Site_Supervisor")
        self.assertTrue(len(site_metrics["kpis"]) >= 3)


if __name__ == "__main__":
    unittest.main()
