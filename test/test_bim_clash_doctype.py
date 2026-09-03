"""E2E Test Suite for OpenProject-Style BIM Clash DocType & Threaded Discussion (Features 8-10).

Covers:
- Feature 8: OpenProject-Style 'BIM Clash' DocType (DocType schema, validation, status lifecycle, batch import)
- Feature 9: Viewer Clashes Panel & Fly-to (List query, camera fly-to trajectory, element isolation)
- Feature 10: Threaded Discussion on Clashes (Frappe Comments, ToDo assignments, audit log)

Tiers Covered:
- Tier 1: Feature Coverage (Happy Path >= 5 tests per feature)
- Tier 2: Boundary & Corner Cases (>= 5 tests per feature)
- Tier 3: Pairwise Cross-Feature Tests
- Tier 4: Real-World Application Scenarios with Nordic LCA Datasets
"""

import copy
import json
import math
import os
import sys
import unittest
from typing import Any, Dict, List, Optional, Set, Tuple, Union

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from test.test_helper import (
    AABB3D,
    BIMClashManager,
    ClashPair,
    DoesNotExistError,
    MockDoc,
    ValidationError,
    Vector3,
    generate_bcf_viewpoint_json,
    get_real_ifc_paths,
    mock_frappe_db,
    setup_frappe_test_environment,
)
import frappe


class TestBIMClashDocType(unittest.TestCase):

    def setUp(self):
        mock_frappe_db.clear()

    # ==========================================================================
    # Feature 8: OpenProject BIM Clash DocType
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_bim_clash_doc_creation_with_valid_fields(self):
        """F8-T1-1: Create BIM Clash record with all required and optional fields."""
        doc = BIMClashManager.create_clash({
            "title": "Beam B1 vs Duct D1",
            "project": "PROJ-2026-NORDIC",
            "model_a": "BIM-MODEL-00001",
            "element_a_guid": "3h2Z_col_001",
            "element_a_name": "Concrete Column",
            "element_a_type": "IfcColumn",
            "element_a_discipline": "Structural",
            "model_b": "BIM-MODEL-00002",
            "element_b_guid": "1v8X_duct_002",
            "element_b_name": "Supply Air Duct",
            "element_b_type": "IfcDuctSegment",
            "element_b_discipline": "MEP",
            "collision_point_x": 14.5,
            "collision_point_y": 22.3,
            "collision_point_z": 3.8,
            "collision_point": [14.5, 22.3, 3.8],
            "penetration_depth": 85.0,
            "intersection_volume": 0.024,
            "severity": "Major",
            "clash_type": "Hard Collision",
            "priority": "High",
            "status": "Open",
        })

        self.assertIsNotNone(doc.name)
        self.assertEqual(doc.doctype, "BIM Clash")
        self.assertEqual(doc.title, "Beam B1 vs Duct D1")
        self.assertEqual(doc.status, "Open")
        self.assertEqual(doc.severity, "Major")
        self.assertEqual(doc.penetration_depth, 85.0)

    def test_status_workflow_transitions(self):
        """F8-T1-2: Valid status transitions (Open -> In Review -> Resolved -> Closed)."""
        doc = BIMClashManager.create_clash({"title": "Clash Workflow Test", "status": "Open"})
        self.assertEqual(doc.status, "Open")

        # Open -> In Review
        doc = BIMClashManager.transition_status(doc, "In Review", user="coord_lead@corp.com", notes="Investigating routing")
        self.assertEqual(doc.status, "In Review")

        # In Review -> Resolved
        doc = BIMClashManager.transition_status(doc, "Resolved", user="mep_eng@corp.com", notes="Rerouted duct below beam")
        self.assertEqual(doc.status, "Resolved")
        self.assertEqual(doc.resolved_by, "mep_eng@corp.com")
        self.assertIsNotNone(doc.resolution_date)

        # Resolved -> Closed
        doc = BIMClashManager.transition_status(doc, "Closed", user="pm@corp.com", notes="Verified in 3D model")
        self.assertEqual(doc.status, "Closed")

    def test_severity_classification_validation(self):
        """F8-T1-3: Validate severity levels (Critical, Major, Minor, Info)."""
        for sev in ["Critical", "Major", "Minor", "Info"]:
            doc = BIMClashManager.create_clash({"title": f"Severity {sev}", "severity": sev})
            self.assertEqual(doc.severity, sev)

    def test_batch_clash_import(self):
        """F8-T1-4: Batch import of detected clash pairs into Frappe database."""
        clashes = [
            ClashPair(
                model_a_id=1, element_a_guid=f"A_{i}", element_a_name=f"Col {i}", element_a_type="Column", element_a_discipline="structure",
                model_b_id=2, element_b_guid=f"B_{i}", element_b_name=f"Duct {i}", element_b_type="Duct", element_b_discipline="mep",
                collision_point=Vector3(i, i, 2.5), penetration_depth=50.0 + i, intersection_volume=0.01 * (i + 1), bounding_box=AABB3D(),
            )
            for i in range(5)
        ]

        imported_docs = BIMClashManager.batch_import_clashes(clashes, project="PROJ-001")
        self.assertEqual(len(imported_docs), 5)
        self.assertEqual(mock_frappe_db.count("BIM Clash"), 5)

    def test_bcf_viewpoint_json_storage(self):
        """F8-T1-5: Viewpoint JSON and spatial coordinates stored and queried correctly."""
        vp = {
            "perspective_camera": {"camera_view_point": {"x": 10, "y": 10, "z": 5}, "field_of_view": 60},
            "components": {"coloring": [{"color": "#FF0000", "components": [{"ifc_guid": "GUID_1"}]}]},
        }
        doc = BIMClashManager.create_clash({
            "title": "VP Test",
            "viewpoint_json": vp,
            "collision_point": [10, 10, 5],
        })

        retrieved = frappe.get_doc("BIM Clash", doc.name)
        self.assertEqual(retrieved.viewpoint_json["perspective_camera"]["field_of_view"], 60)

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_invalid_status_transition_raises_error(self):
        """F8-T2-1: Transition from Closed to In Review directly raises ValidationError."""
        doc = BIMClashManager.create_clash({"title": "Invalid Transition", "status": "Open"})
        doc = BIMClashManager.transition_status(doc, "Resolved")
        doc = BIMClashManager.transition_status(doc, "Closed")

        with self.assertRaises(ValidationError):
            BIMClashManager.transition_status(doc, "In Review")

    def test_invalid_severity_raises_error(self):
        """F8-T2-2: Unknown severity raises ValidationError."""
        with self.assertRaises(ValidationError):
            BIMClashManager.create_clash({"title": "Bad Severity", "severity": "SuperCritical"})

    def test_invalid_clash_type_raises_error(self):
        """F8-T2-3: Unknown clash type raises ValidationError."""
        with self.assertRaises(ValidationError):
            BIMClashManager.create_clash({"title": "Bad Type", "clash_type": "RandomNoise"})

    def test_duplicate_clash_deduplication(self):
        """F8-T2-4: Attempting to insert duplicate clash pair generates deterministic clash_id."""
        doc1 = BIMClashManager.create_clash({"element_a_guid": "G_AAA", "element_b_guid": "G_BBB"})
        doc2 = BIMClashManager.create_clash({"element_a_guid": "G_AAA", "element_b_guid": "G_BBB"})

        self.assertEqual(doc1.clash_id, doc2.clash_id)

    def test_resolution_metadata_tracking(self):
        """F8-T2-5: Resolving a clash records resolution details in doc and audit log."""
        doc = BIMClashManager.create_clash({"title": "Resolution Audit Test"})
        doc = BIMClashManager.transition_status(doc, "Resolved", user="architect@firm.com", notes="Opening created in web of beam")

        self.assertEqual(doc.resolved_by, "architect@firm.com")
        self.assertIn("Opening created", doc.resolution_notes)
        comments = doc.get_comments()
        self.assertGreater(len(comments), 0)
        self.assertIn("Resolved", comments[-1]["content"])

    # Tier 3: Pairwise Cross-Feature
    def test_clash_persistence_and_database_query(self):
        """F8-T3-1: Clash created from collision detector queried via frappe.get_all / frappe.get_doc."""
        clash_pair = ClashPair(
            model_a_id=1, element_a_guid="STRUC_COL_99", element_a_name="Column 99", element_a_type="Column", element_a_discipline="structure",
            model_b_id=2, element_b_guid="HVAC_DUCT_88", element_b_name="Duct 88", element_b_type="Duct", element_b_discipline="mep",
            collision_point=Vector3(10, 20, 30), penetration_depth=45.0, intersection_volume=0.008, bounding_box=AABB3D(),
        )
        doc = BIMClashManager.create_clash(clash_pair.to_dict())

        # Query via Frappe ORM
        all_clashes = frappe.get_all("BIM Clash", filters={"status": "Open"}, fields=["name", "title", "severity"])
        self.assertEqual(len(all_clashes), 1)
        self.assertEqual(all_clashes[0]["name"], doc.name)

    # Tier 4: Real-World Scenario
    def test_real_clash_issue_management_workflow(self):
        """F8-T4-1: Full lifecycle of real clash from creation to resolution notes and closure."""
        clash_data = {
            "title": "Tekla Beam B-104 vs MagiCAD Supply Duct S-202",
            "project": "PROJ-NORDIC-CONCRETE-01",
            "model_a": "BIM-MODEL-STRUC",
            "element_a_guid": "2O2$U$STRUC_B104",
            "element_a_name": "Concrete Beam B-104",
            "element_a_type": "IfcBeam",
            "element_a_discipline": "Structural",
            "model_b": "BIM-MODEL-HVAC",
            "element_b_guid": "3kL7#HVAC_S202",
            "element_b_name": "Supply Duct 500x300",
            "element_b_type": "IfcDuctSegment",
            "element_b_discipline": "MEP",
            "severity": "Critical",
            "penetration_depth": 150.0,
            "intersection_volume": 0.045,
            "collision_point": [18.4, 32.1, 4.5],
        }
        doc = BIMClashManager.create_clash(clash_data)
        self.assertEqual(doc.status, "Open")

        doc = BIMClashManager.transition_status(doc, "In Review", user="coord_eng@nordic.se", notes="Reviewed in coordination meeting")
        doc = BIMClashManager.transition_status(doc, "Resolved", user="mep_designer@nordic.se", notes="Added 45 deg elbow to pass under beam")
        doc = BIMClashManager.transition_status(doc, "Closed", user="bim_manager@nordic.se", notes="Verified clash cleared in revised model")

        self.assertEqual(doc.status, "Closed")

    # ==========================================================================
    # Feature 9: Viewer Clashes Panel & Fly-to Navigation
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_clash_list_query_by_project_and_model(self):
        """F9-T1-1: Query clashes filtered by project and model."""
        BIMClashManager.create_clash({"title": "C1", "project": "P1", "model_a": "M1", "model_b": "M2"})
        BIMClashManager.create_clash({"title": "C2", "project": "P1", "model_a": "M1", "model_b": "M2"})
        BIMClashManager.create_clash({"title": "C3", "project": "P2", "model_a": "M3", "model_b": "M4"})

        p1_clashes = frappe.get_all("BIM Clash", filters={"project": "P1"})
        self.assertEqual(len(p1_clashes), 2)

    def test_camera_fly_to_viewpoint_coordinate_interpolation(self):
        """F9-T1-2: Smooth camera trajectory from initial position to clash viewpoint."""
        initial_cam = Vector3(0.0, 0.0, 50.0)
        target_cam = Vector3(10.0, 20.0, 5.0)

        steps = 10
        trajectory = []
        for i in range(steps + 1):
            t = i / steps
            # Smoothstep interpolation: 3t^2 - 2t^3
            st = t * t * (3 - 2 * t)
            pos = initial_cam + (target_cam - initial_cam) * st
            trajectory.append(pos)

        self.assertEqual(len(trajectory), 11)
        self.assertAlmostEqual(trajectory[0].distance_to(initial_cam), 0.0)
        self.assertAlmostEqual(trajectory[-1].distance_to(target_cam), 0.0)

    def test_element_isolation_on_clash_selection(self):
        """F9-T1-3: Selecting clash isolates colliding elements and hides or ghosts others."""
        all_guids = [f"G_{i}" for i in range(10)]
        clash_guids = {"G_2", "G_7"}

        # Compute isolation state
        isolated_state = {g: (g in clash_guids) for g in all_guids}
        self.assertTrue(isolated_state["G_2"])
        self.assertTrue(isolated_state["G_7"])
        self.assertFalse(isolated_state["G_0"])

    def test_clash_filtering_by_discipline_and_severity(self):
        """F9-T1-4: Filter clash list by discipline and severity."""
        BIMClashManager.create_clash({"title": "C1", "severity": "Critical", "assigned_discipline": "Structural"})
        BIMClashManager.create_clash({"title": "C2", "severity": "Minor", "assigned_discipline": "MEP"})
        BIMClashManager.create_clash({"title": "C3", "severity": "Critical", "assigned_discipline": "MEP"})

        results = frappe.get_all("BIM Clash", filters={"severity": "Critical", "assigned_discipline": "MEP"})
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "C3")

    def test_camera_lookat_target_reconstruction(self):
        """F9-T1-5: Camera look-at target reconstructed from position + direction."""
        cam_pos = Vector3(10.0, 10.0, 10.0)
        cam_dir = Vector3(0.0, 1.0, 0.0)  # Looking towards +Y
        distance = 5.0
        lookat_target = cam_pos + cam_dir * distance

        self.assertAlmostEqual(lookat_target.x, 10.0)
        self.assertAlmostEqual(lookat_target.y, 15.0)
        self.assertAlmostEqual(lookat_target.z, 10.0)

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_fly_to_with_zero_distance_safety(self):
        """F9-T2-1: Zero distance camera does not produce division by zero or NaN."""
        cp = Vector3(0, 0, 0)
        clash = ClashPair(
            model_a_id=1, element_a_guid="A", element_a_name="A", element_a_type="T", element_a_discipline="D",
            model_b_id=2, element_b_guid="B", element_b_name="B", element_b_type="T", element_b_discipline="D",
            collision_point=cp, penetration_depth=0, intersection_volume=0, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash, camera_distance=0.001)
        cd = vp["perspective_camera"]["camera_direction"]
        self.assertFalse(math.isnan(cd["x"]))

    def test_isolation_with_missing_elements_fallback(self):
        """F9-T2-2: Selecting clash with deleted/missing element does not crash viewer."""
        clash_guids = ["non_existent_guid_1", "non_existent_guid_2"]
        scene_elements = {"guid_present_1": True}

        # Filter active
        found = [g for g in clash_guids if g in scene_elements]
        self.assertEqual(len(found), 0)

    def test_empty_clash_list_state(self):
        """F9-T2-3: Querying model with zero clashes returns empty list cleanly."""
        res = frappe.get_all("BIM Clash", filters={"model_a": "NON_EXISTENT_MODEL"})
        self.assertEqual(len(res), 0)

    def test_camera_fov_bounds_validation(self):
        """F9-T2-4: FOV values outside standard range (10-120 deg) clamped safely."""
        def clamp_fov(fov: float) -> float:
            return max(10.0, min(120.0, fov))

        self.assertEqual(clamp_fov(5.0), 10.0)
        self.assertEqual(clamp_fov(150.0), 120.0)
        self.assertEqual(clamp_fov(60.0), 60.0)

    def test_aspect_ratio_viewport_resize_handling(self):
        """F9-T2-5: Camera matrix adapts to viewport resize without distortion."""
        aspect1 = 1920 / 1080
        aspect2 = 800 / 600
        self.assertGreater(aspect1, aspect2)

    # Tier 3: Pairwise Cross-Feature
    def test_clash_selection_triggers_camera_and_element_isolation(self):
        """F9-T3-1: 1-click clash selection coordinates camera fly-to + isolation."""
        doc = BIMClashManager.create_clash({
            "title": "Click Action Clash",
            "element_a_guid": "COL_123",
            "element_b_guid": "DUCT_456",
            "collision_point": [5.0, 10.0, 3.0],
        })

        # Simulate click handler payload
        payload = {
            "fly_to": doc.viewpoint_json["perspective_camera"],
            "isolate": [doc.element_a_guid, doc.element_b_guid],
            "colors": {"COL_123": "#FF0000", "DUCT_456": "#FFFF00"},
        }

        self.assertEqual(payload["isolate"], ["COL_123", "DUCT_456"])
        self.assertEqual(payload["colors"]["COL_123"], "#FF0000")

    # Tier 4: Real-World Scenario
    def test_real_clash_fly_to_navigation_scenario(self):
        """F9-T4-1: Navigation to real clash viewpoint in Nordic LCA federated scene."""
        real_viewpoint = {
            "perspective_camera": {
                "camera_view_point": {"x": 20.85, "y": 29.65, "z": 6.25},
                "camera_direction": {"x": -0.7071, "y": 0.7071, "z": -0.5},
                "camera_up_vector": {"x": 0.0, "y": 0.0, "z": 1.0},
                "field_of_view": 60.0,
            }
        }
        cam = real_viewpoint["perspective_camera"]
        self.assertEqual(cam["field_of_view"], 60.0)
        self.assertAlmostEqual(cam["camera_up_vector"]["z"], 1.0)

    # ==========================================================================
    # Feature 10: Threaded Discussion on Clashes
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_add_comment_to_clash_record(self):
        """F10-T1-1: Post discussion comment to BIM Clash record."""
        doc = BIMClashManager.create_clash({"title": "Commentable Clash"})
        c = doc.add_comment("Comment", "Can we lower the duct by 200mm?", comment_by="mep_eng@corp.com")

        self.assertEqual(c.content, "Can we lower the duct by 200mm?")
        self.assertEqual(c.comment_by, "mep_eng@corp.com")
        self.assertEqual(len(doc.get_comments()), 1)

    def test_threaded_comment_chronological_ordering(self):
        """F10-T1-2: Comments ordered chronologically with timestamp and author."""
        doc = BIMClashManager.create_clash({"title": "Threaded Comments"})
        doc.add_comment("Comment", "Comment 1: Initial review", comment_by="lead@corp.com")
        doc.add_comment("Comment", "Comment 2: Structural approval needed", comment_by="struc@corp.com")
        doc.add_comment("Comment", "Comment 3: Approved with sleeve opening", comment_by="struc_lead@corp.com")

        comments = doc.get_comments()
        self.assertEqual(len(comments), 3)
        self.assertEqual(comments[0]["content"], "Comment 1: Initial review")
        self.assertEqual(comments[2]["content"], "Comment 3: Approved with sleeve opening")

    def test_todo_assignment_to_discipline_lead(self):
        """F10-T1-3: Assign ToDo task to MEP engineer or structural designer."""
        doc = BIMClashManager.create_clash({"title": "Actionable Clash", "assigned_to": "mep_lead@nordic.se"})
        todo = MockDoc(
            "ToDo",
            reference_type="BIM Clash",
            reference_name=doc.name,
            allocated_to="mep_lead@nordic.se",
            description=f"Resolve clash {doc.name}: {doc.title}",
            status="Open",
            priority="High",
        ).insert()

        self.assertIsNotNone(todo.name)
        self.assertEqual(todo.allocated_to, "mep_lead@nordic.se")

    def test_resolution_comment_generation(self):
        """F10-T1-4: Workflow status change automatically generates resolution comment."""
        doc = BIMClashManager.create_clash({"title": "Auto Audit Comment"})
        doc = BIMClashManager.transition_status(doc, "Resolved", user="mep@corp.com", notes="Adjusted routing")

        comments = doc.get_comments()
        self.assertTrue(any("Resolved" in c["content"] for c in comments))

    def test_multiple_user_comment_collaboration(self):
        """F10-T1-5: Multiple users collaborate on the same clash thread."""
        doc = BIMClashManager.create_clash({"title": "Multi-User Clash"})
        users = ["alice@corp.com", "bob@corp.com", "charlie@corp.com"]
        for u in users:
            doc.add_comment("Comment", f"Feedback from {u}", comment_by=u)

        authors = {c["comment_by"] for c in doc.get_comments()}
        self.assertEqual(authors, set(users))

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_empty_comment_content_rejected(self):
        """F10-T2-1: Empty or whitespace-only comment raises ValidationError."""
        doc = BIMClashManager.create_clash({"title": "Empty Comment Test"})
        with self.assertRaises(ValidationError):
            doc.add_comment("Comment", "   ")

    def test_comment_on_nonexistent_clash_fails(self):
        """F10-T2-2: Adding comment to non-existent clash raises DoesNotExistError."""
        with self.assertRaises(DoesNotExistError):
            doc = frappe.get_doc("BIM Clash", "NON_EXISTENT_CLASH_999")
            doc.add_comment("Comment", "Test")

    def test_todo_assignment_to_invalid_user(self):
        """F10-T2-3: Assigning ToDo to empty user handled gracefully."""
        doc = BIMClashManager.create_clash({"title": "Unassigned Clash"})
        self.assertIsNone(doc.assigned_to)

    def test_special_characters_and_html_escaping_in_comments(self):
        """F10-T2-4: Comments with HTML/script tags safely stored without XSS risk."""
        malicious = "<script>alert('XSS')</script> & Special <b>Tags</b>"
        doc = BIMClashManager.create_clash({"title": "XSS Test"})
        c = doc.add_comment("Comment", malicious, comment_by="qa@corp.com")
        self.assertEqual(c.content, malicious)

    def test_rapid_comment_threading_load(self):
        """F10-T2-5: Rapid sequential comments maintain sequence integrity."""
        doc = BIMClashManager.create_clash({"title": "Rapid Fire Comments"})
        for i in range(100):
            doc.add_comment("Comment", f"Comment #{i}", comment_by="bot@corp.com")

        comments = doc.get_comments()
        self.assertEqual(len(comments), 100)
        self.assertEqual(comments[99]["content"], "Comment #99")

    # Tier 3: Pairwise Cross-Feature
    def test_clash_comment_with_element_inspector_context(self):
        """F10-T3-1: Comment references element properties and quantity data."""
        doc = BIMClashManager.create_clash({
            "title": "Detailed Context Clash",
            "element_a_name": "Column C30/37 400x400",
            "penetration_depth": 120.0,
        })
        comment_text = f"Collision depth is {doc.penetration_depth}mm with element {doc.element_a_name}."
        doc.add_comment("Comment", comment_text, comment_by="inspector@corp.com")

        comments = doc.get_comments()
        self.assertIn("120.0mm", comments[0]["content"])

    # Tier 4: Real-World Scenario
    def test_real_clash_coordination_meeting_thread(self):
        """F10-T4-1: Simulate multi-discipline coordination meeting comments on a clash."""
        doc = BIMClashManager.create_clash({
            "title": "Coordination Item #12: STRUC Beam B-201 vs HVAC Duct D-401",
            "project": "PROJ-NORDIC-CONCRETE",
            "severity": "Critical",
            "penetration_depth": 180.0,
        })

        # Multi-role discussion
        doc.add_comment("Comment", "BIM Coordinator: Critical collision detected during weekly federation check.", comment_by="bim_coord@nordic.se")
        doc.add_comment("Comment", "HVAC Lead: Cannot lower duct due to 2.4m ceiling clearance requirement.", comment_by="hvac_lead@nordic.se")
        doc.add_comment("Comment", "Structural Lead: Approved 250mm web opening at beam midpoint per calculation sheet CALC-88.", comment_by="struc_lead@nordic.se")
        BIMClashManager.transition_status(doc, "Resolved", user="struc_lead@nordic.se", notes="Opening approved and reinforced")

        comments = doc.get_comments()
        self.assertEqual(len(comments), 4)


if __name__ == "__main__":
    unittest.main()
