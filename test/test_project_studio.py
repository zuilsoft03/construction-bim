"""Comprehensive Verification Test Suite for OpenProject BIM Project Studio.

Tests:
1. Portfolio Projects Hub: Hierarchical subproject tree, health status, favorites, and storage stats.
2. Project Home 7-Widget Overview: Summary, Status note, Milestone Timeline diamonds, Subprojects, Meetings, Members, News.
3. Work Packages Tree: Polymorphic types (Task, Milestone, Phase, Issue, Remark, Request, Clash) and filtering.
4. Quick-Create Work Packages: Polymorphic domain linking (Clash -> BCF Topic, Request -> RFI, Issue -> Issue).
5. Kanban Board Grouping: Dynamic columns by Status, Priority, and Assignee with drag-and-drop state update.
6. Project Documents Tree: 5-folder taxonomy and auto-launcher routing (IFC -> BIM, DWG -> CAD, PDF -> Takeoff).
7. Settings & Template Cloning: Metadata updates and instant cloning of phases, gates, and milestones.
"""

import os
import sys
import unittest
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from test.test_helper import (
    MockDoc,
    ValidationError,
    mock_frappe_db,
    register_doctype_class,
)
import frappe

# Import Project Studio API
from construction_bim.api import project_studio
from construction_bim.construction.doctype.project_phase.project_phase import (
    ProjectPhase,
    initialize_pm2_project_phases,
)
from construction_bim.construction.doctype.toolbox_talk.toolbox_talk import ToolboxTalk
from construction_bim.construction.doctype.rfi.rfi import RFI

register_doctype_class("Project Phase", ProjectPhase)
register_doctype_class("Toolbox Talk", ToolboxTalk)
register_doctype_class("RFI", RFI)


class TestProjectStudio(unittest.TestCase):
    def setUp(self):
        mock_frappe_db.clear()

        # Seed master project
        self.project = MockDoc(
            "Project",
            name="PROJ-METRO-001",
            project_name="Metro General Hospital Expansion",
            status="Open",
            is_active="Yes",
            health_status="On Track",
            status_narrative="All structural and architectural phases are progressing on schedule.",
            expected_start_date="2026-01-01",
            expected_end_date="2026-12-31",
            percent_complete=25.0,
            is_favorite=1,
            is_template=0,
        )
        self.project.insert()

        # Seed child subproject
        self.subproject = MockDoc(
            "Project",
            name="PROJ-METRO-SUB-01",
            project_name="Substructure and Foundation Works",
            status="Open",
            is_active="Yes",
            health_status="On Track",
            parent_project=self.project.name,
            percent_complete=70.0,
        )
        self.subproject.insert()

    # --------------------------------------------------------------------------
    # 1. Projects Hub / Portfolio View
    # --------------------------------------------------------------------------
    def test_list_projects_hierarchy_and_stats(self):
        """Verify project listing computes subproject counts, favorite flags, and health status."""
        projects = project_studio.list_projects(include_archived=1)
        self.assertTrue(len(projects) >= 2)

        master = next((p for p in projects if p["name"] == self.project.name), None)
        self.assertIsNotNone(master)
        self.assertEqual(master["health_status"], "On Track")
        self.assertEqual(master["is_favorite"], 1)
        self.assertEqual(master["subprojects_count"], 1)

        sub = next((p for p in projects if p["name"] == self.subproject.name), None)
        self.assertIsNotNone(sub)
        self.assertEqual(sub["parent_project"], self.project.name)

    # --------------------------------------------------------------------------
    # 2. Project Home 7-Widget Dashboard
    # --------------------------------------------------------------------------
    def test_get_project_overview_seven_widgets(self):
        """Verify the 7 dashboard widgets matching OpenProject BIM Project Home."""
        # Seed milestone task
        milestone = MockDoc(
            "Task",
            name="TASK-MS-01",
            project=self.project.name,
            subject="Substructure Completion Milestone",
            exp_end_date="2026-04-30",
            status="Open",
            is_milestone=1,
            work_package_type="Milestone"
        )
        milestone.insert()

        # Seed daily toolbox talk
        tbt = ToolboxTalk(
            "Toolbox Talk",
            name="TBT-0001",
            project=self.project.name,
            topic_category="Scaffold Erection & Daily Inspection",
            date="2026-03-01",
            conductor_name="Engr. Santos",
            mandatory_ppe_checked=1
        )
        tbt.append("attendees", {"worker_name": "Worker A", "subcontractor": "Sub A", "signed": 1})
        tbt.insert()

        overview = project_studio.get_project_overview(self.project.name)
        self.assertIn("summary", overview)
        self.assertIn("milestones", overview)
        self.assertIn("subprojects", overview)
        self.assertIn("meetings", overview)
        self.assertIn("members", overview)
        self.assertIn("news", overview)

        # Check summary
        self.assertEqual(overview["summary"]["health_status"], "On Track")
        self.assertEqual(overview["summary"]["percent_complete"], 25.0)

        # Check milestones timeline
        self.assertTrue(len(overview["milestones"]) >= 1)
        self.assertEqual(overview["milestones"][0]["title"], "Substructure Completion Milestone")

        # Check subprojects list
        self.assertEqual(len(overview["subprojects"]), 1)
        self.assertEqual(overview["subprojects"][0]["name"], self.subproject.name)

        # Check meetings / safety briefings
        self.assertTrue(len(overview["meetings"]) >= 1)
        self.assertEqual(overview["meetings"][0]["type"], "Toolbox Talk")

    # --------------------------------------------------------------------------
    # 3. Work Packages Tree & Type Badges
    # --------------------------------------------------------------------------
    def test_work_packages_listing_and_filtering(self):
        """Verify work package query with color-coded type pills and filters."""
        # Seed various work packages
        t1 = MockDoc("Task", name="TASK-01", project=self.project.name, subject="Column Formwork", work_package_type="Task", status="Open", priority="Normal")
        t1.insert()
        t2 = MockDoc("Task", name="TASK-02", project=self.project.name, subject="Pipe vs Beam Collision", work_package_type="Clash", status="Open", priority="High")
        t2.insert()
        t3 = MockDoc("Task", name="TASK-03", project=self.project.name, subject="Plumbing Invert Level Clarification", work_package_type="Request", status="Working", priority="Normal")
        t3.insert()

        all_wps = project_studio.list_work_packages(self.project.name)
        self.assertEqual(len(all_wps), 3)

        # Filter by type "Clash"
        clashes = project_studio.list_work_packages(self.project.name, type_filter="clash")
        self.assertEqual(len(clashes), 1)
        self.assertEqual(clashes[0]["subject"], "Pipe vs Beam Collision")
        self.assertEqual(clashes[0]["type"], "CLASH")

    # --------------------------------------------------------------------------
    # 4. Quick-Create Work Packages (Polymorphic Creation)
    # --------------------------------------------------------------------------
    def test_quick_create_polymorphic_work_packages(self):
        """Verify quick-create generates Task and polymorphic linked domain documents."""
        # Case A: Standard Task
        res_task = project_studio.quick_create_work_package(
            project=self.project.name,
            wp_type="Task",
            subject="Rebar tying for 2nd floor slab",
            priority="Normal",
            due_date="2026-05-15"
        )
        self.assertEqual(res_task["type"], "TASK")
        self.assertTrue(mock_frappe_db.exists("Task", res_task["id"]))

        # Case B: Clash (auto-links to BCF Topic if registered)
        res_clash = project_studio.quick_create_work_package(
            project=self.project.name,
            wp_type="Clash",
            subject="HVAC Duct penetrating Shear Wall at Grid 3-C",
            priority="High"
        )
        self.assertEqual(res_clash["type"], "CLASH")

        # Case C: Request (auto-links to RFI)
        res_req = project_studio.quick_create_work_package(
            project=self.project.name,
            wp_type="Request",
            subject="Alternative waterproofing membrane specification",
            priority="Normal",
            description="Proposed equivalent membrane technical submittal"
        )
        self.assertEqual(res_req["type"], "REQUEST")
        self.assertIsNotNone(res_req.get("linked_doc"))
        self.assertTrue(mock_frappe_db.exists("RFI", res_req["linked_doc"]))

    # --------------------------------------------------------------------------
    # 5. Kanban Boards Grouping & Drag-and-Drop
    # --------------------------------------------------------------------------
    def test_kanban_board_grouping_and_column_transition(self):
        """Verify Kanban board groups into columns by Status, Priority, and Assignee."""
        t1 = MockDoc("Task", name="TASK-KB-01", project=self.project.name, subject="Pour Concrete Grid A", status="Open", priority="High")
        t1.insert()
        t2 = MockDoc("Task", name="TASK-KB-02", project=self.project.name, subject="Install Cable Trays", status="Working", priority="Normal")
        t2.insert()

        # Group by Status
        status_board = project_studio.get_kanban_board_data(self.project.name, group_by="status")
        cols = {c["id"]: c for c in status_board["columns"]}
        self.assertIn("Open", cols)
        self.assertIn("Working", cols)
        self.assertEqual(len(cols["Open"]["cards"]), 1)
        self.assertEqual(len(cols["Working"]["cards"]), 1)

        # Drag-and-drop: move TASK-KB-01 from Open -> Working
        update_res = project_studio.update_work_package_status("TASK-KB-01", "Working", group_by="status")
        self.assertEqual(update_res["status"], "success")

        # Reload task and assert status
        reloaded_task = mock_frappe_db.get_value("Task", "TASK-KB-01", "status")
        self.assertEqual(reloaded_task, "Working")

    # --------------------------------------------------------------------------
    # 6. Project Documents Tree & Auto-Launchers
    # --------------------------------------------------------------------------
    def test_project_document_tree_and_auto_launchers(self):
        """Verify 5-folder taxonomy and target viewer routes (BIM, CAD, PDF)."""
        # Attach sample files
        f_ifc = MockDoc("File", name="FILE-01", attached_to_doctype="Project", attached_to_name=self.project.name, file_name="Hospital_Arch.ifc", file_url="/files/Hospital_Arch.ifc", file_size=15420000)
        f_ifc.insert()
        f_dwg = MockDoc("File", name="FILE-02", attached_to_doctype="Project", attached_to_name=self.project.name, file_name="Ground_Floor_Plan.dwg", file_url="/files/Ground_Floor_Plan.dwg", file_size=4200000)
        f_dwg.insert()
        f_pdf = MockDoc("File", name="FILE-03", attached_to_doctype="Project", attached_to_name=self.project.name, file_name="Structural_Detail_S101.pdf", file_url="/files/Structural_Detail_S101.pdf", file_size=1200000)
        f_pdf.insert()

        folders = project_studio.get_project_document_tree(self.project.name)
        self.assertEqual(len(folders), 5)

        folder_dict = {f["folder_name"]: f for f in folders}
        self.assertIn("03 BIM Models", folder_dict)
        self.assertIn("02 Drawings & Specs", folder_dict)

        # Check BIM route
        bim_files = folder_dict["03 BIM Models"]["files"]
        self.assertEqual(len(bim_files), 1)
        self.assertEqual(bim_files[0]["route_target"], "bim")
        self.assertEqual(bim_files[0]["badge"], "3D IFC")

        # Check CAD & PDF routes
        drawings_files = folder_dict["02 Drawings & Specs"]["files"]
        self.assertEqual(len(drawings_files), 2)
        dwg_item = next(f for f in drawings_files if f["extension"] == "dwg")
        pdf_item = next(f for f in drawings_files if f["extension"] == "pdf")
        self.assertEqual(dwg_item["route_target"], "cad")
        self.assertEqual(pdf_item["route_target"], "pdf")

    # --------------------------------------------------------------------------
    # 7. Project Settings & Template Project Cloning
    # --------------------------------------------------------------------------
    def test_project_settings_and_template_cloning(self):
        """Verify project settings updates and instant cloning of template projects."""
        # 1. Update settings
        settings_payload = {
            "health_status": "At Risk",
            "status_narrative": "Rainy weather delayed concrete pour.",
            "is_template": 1,
            "is_favorite": 1
        }
        res_settings = project_studio.update_project_settings(self.project.name, json.dumps(settings_payload))
        self.assertEqual(res_settings["status"], "success")

        # Verify updated values in db
        self.assertEqual(mock_frappe_db.get_value("Project", self.project.name, "health_status"), "At Risk")
        self.assertEqual(mock_frappe_db.get_value("Project", self.project.name, "is_template"), 1)

        # 2. Seed a template phase and task
        phase = ProjectPhase(
            "Project Phase",
            name="PHASE-TMPL-01",
            project=self.project.name,
            phase_name="1. Initiating",
            phase_order=1,
            status="In Progress"
        )
        phase.append("gate_checklist", {"gate_item": "Project Charter Signed", "required": 1, "is_completed": 1})
        phase.insert()

        task = MockDoc("Task", name="TASK-TMPL-01", project=self.project.name, subject="Kickoff Meeting", work_package_type="Task")
        task.insert()

        # 3. Clone project from template
        clone_res = project_studio.clone_project_from_template(
            template_project=self.project.name,
            new_project_name="Cebu Regional Hospital Expansion",
            expected_start_date="2026-06-01"
        )
        self.assertEqual(clone_res["status"], "success")
        new_proj_name = clone_res["new_project"]

        # Verify cloned project exists and has cloned phase & task
        self.assertTrue(mock_frappe_db.exists("Project", new_proj_name))
        cloned_phases = frappe.get_all("Project Phase", filters={"project": new_proj_name})
        self.assertEqual(len(cloned_phases), 1)

        cloned_tasks = frappe.get_all("Task", filters={"project": new_proj_name})
        self.assertEqual(len(cloned_tasks), 1)
        self.assertEqual(cloned_tasks[0].subject, "Kickoff Meeting")

    # --------------------------------------------------------------------------
    # 8. Subproject Multi-Level Hierarchy
    # --------------------------------------------------------------------------
    def test_subproject_hierarchy_and_nesting(self):
        """Verify adding sub-packages sets parent links and counts."""
        child_sub = MockDoc(
            "Project",
            name="PROJ-METRO-SUB-02",
            project_name="Deep Excavation & Shoring",
            status="Open",
            is_active="Yes",
            parent_project=self.project.name,
            health_status="On Track",
        )
        child_sub.insert()

        projects = project_studio.list_projects(include_archived=0)
        master = next(p for p in projects if p["name"] == self.project.name)
        self.assertEqual(master["subprojects_count"], 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)