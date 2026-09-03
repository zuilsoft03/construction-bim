"""Tier 4 Real-World Application Scenarios for Construction BIM (Scenarios 1-5).

Executes end-to-end integration workflows against real Nordic LCA IFC datasets:
- Scenario 1: Multi-Discipline Federated Inspection (F1, F2, F3, F4)
- Scenario 2: Real STRUC vs HVAC Clash Detection & Highlighting (F5, F6, F7)
- Scenario 3: Clash Issue Management & Threaded Discussion Lifecycle (F8, F9, F10)
- Scenario 4: Automated BIM Quantity Takeoff & BOM Generation (F11, F12, F13)
- Scenario 5: Full End-to-End Coordination Lifecycle (F1 -> F13)
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
    BIMBOMGenerator,
    BIMClashManager,
    ClashPair,
    MockDoc,
    Vector3,
    detect_clashes_between_elements,
    generate_bcf_viewpoint_json,
    get_real_ifc_paths,
    make_synthetic_ifc,
    mock_frappe_db,
    run_clash_detection_between_models,
    setup_frappe_test_environment,
)
import frappe
from construction_bim.bim import ifc_parser as ip
from test.test_federated_viewing import FederatedSceneManager


class TestRealWorldScenarios(unittest.TestCase):

    def setUp(self):
        mock_frappe_db.clear()
        self.paths = get_real_ifc_paths()

    # ==========================================================================
    # Scenario 1: Multi-Discipline Federated Inspection (F1, F2, F3, F4)
    # ==========================================================================
    def test_scenario_1_multi_discipline_federated_inspection(self):
        """Scenario 1: Load ARK, STRUC, and HVAC models into federated scene, ghost ARK shell, inspect elements."""
        scene = FederatedSceneManager(coordinate_to_origin=False)

        # 1. Load Architectural Model
        ark_ifc = make_synthetic_ifc(
            project_name="Nordic Housing ARK",
            discipline="Architectural",
            elements=[
                {"guid": "ARK_WALL_EXT_01", "type": "IFCWALL", "name": "Exterior Cavity Wall", "x": 0.0, "y": 0.0, "z": 0.0, "dx": 15.0, "dy": 0.35, "dz": 3.2, "material": "Brick/Insulation"},
                {"guid": "ARK_WINDOW_01", "type": "IFCWINDOW", "name": "Triple Glazed Window 1200x1500", "x": 4.0, "y": 0.0, "z": 1.0, "dx": 1.2, "dy": 0.2, "dz": 1.5, "material": "Glass/Aluminium"},
            ],
        )
        m_ark = scene.load_model(1, "ARK_Housing", "Architectural", ark_ifc)

        # 2. Load Structural Model (real if available or synthetic)
        struc_path = self.paths.get("STRUC")
        if struc_path and os.path.exists(struc_path):
            with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
                struc_text = f.read(500000)
            m_struc = scene.load_model(2, "STRUC_Concrete", "Structural", struc_text)
        else:
            struc_ifc = make_synthetic_ifc(
                project_name="Nordic Housing STRUC",
                discipline="Structural",
                elements=[
                    {"guid": "STRUC_COL_C1", "type": "IFCCOLUMN", "name": "Concrete Column 400x400", "x": 3.0, "y": 3.0, "z": 0.0, "dx": 0.4, "dy": 0.4, "dz": 3.2, "material": "Concrete C30/37"},
                    {"guid": "STRUC_BEAM_B1", "type": "IFCBEAM", "name": "Concrete Beam 400x600", "x": 0.0, "y": 3.0, "z": 3.0, "dx": 15.0, "dy": 0.4, "dz": 0.6, "material": "Concrete C30/37"},
                ],
            )
            m_struc = scene.load_model(2, "STRUC_Concrete", "Structural", struc_ifc)

        # 3. Load HVAC Mechanical Model
        hvac_path = self.paths.get("HVAC")
        if hvac_path and os.path.exists(hvac_path):
            with open(hvac_path, "r", encoding="utf-8", errors="ignore") as f:
                hvac_text = f.read(500000)
            m_hvac = scene.load_model(3, "HVAC_MagiCAD", "Mechanical", hvac_text)
        else:
            hvac_ifc = make_synthetic_ifc(
                project_name="Nordic Housing HVAC",
                discipline="Mechanical",
                elements=[
                    {"guid": "HVAC_DUCT_MAIN", "type": "IFCDUCTSEGMENT", "name": "Supply Main Duct 500x300", "x": 0.0, "y": 3.0, "z": 2.7, "dx": 15.0, "dy": 0.5, "dz": 0.3},
                    {"guid": "HVAC_PIPE_SUPPLY", "type": "IFCPIPESEGMENT", "name": "Heating Supply DN40", "x": 0.0, "y": 1.0, "z": 0.5, "dx": 15.0, "dy": 0.04, "dz": 0.04},
                ],
            )
            m_hvac = scene.load_model(3, "HVAC_MagiCAD", "Mechanical", hvac_ifc)

        self.assertEqual(len(scene.models), 3)

        # 4. Orchestrate discipline layers: Ghost Architectural shell (15% opacity), 100% STRUC & HVAC
        scene.set_discipline_ghosted("Architectural", True, ghost_opacity=0.15)
        scene.set_discipline_visibility("Structural", True)
        scene.set_discipline_opacity("Structural", 1.0)
        scene.set_discipline_visibility("Mechanical", True)
        scene.set_discipline_opacity("Mechanical", 1.0)

        self.assertAlmostEqual(m_ark.opacity, 0.15, places=2)
        self.assertTrue(m_ark.is_ghosted)
        self.assertAlmostEqual(m_struc.opacity, 1.0, places=2)
        self.assertAlmostEqual(m_hvac.opacity, 1.0, places=2)

        # 5. Inspect elements across disciplines
        inspected_ark = scene.inspect_element(1, "ARK_WALL_EXT_01")
        self.assertIsNotNone(inspected_ark)
        self.assertEqual(inspected_ark["name"], "Exterior Cavity Wall")

        scene_box = scene.get_scene_bounding_box()
        self.assertTrue(scene_box.is_valid())

    # ==========================================================================
    # Scenario 2: Real STRUC vs HVAC Clash Detection & Highlighting (F5, F6, F7)
    # ==========================================================================
    def test_scenario_2_real_struc_vs_hvac_clash_detection_and_highlighting(self):
        """Scenario 2: Run BVH clash check between STRUC beams/columns and HVAC ducts, verify Red/Yellow highlights & BCF."""
        struc_elements = [
            {"stable_id": "STRUC_COL_A", "name": "Column A", "element_type": "Column", "discipline": "structure", "box": [2.0, 2.0, 0.0, 2.5, 2.5, 3.5]},
            {"stable_id": "STRUC_BEAM_B", "name": "Beam B", "element_type": "Beam", "discipline": "structure", "box": [0.0, 2.0, 3.0, 10.0, 2.5, 3.6]},
            {"stable_id": "STRUC_COL_C", "name": "Column C (Clear)", "element_type": "Column", "discipline": "structure", "box": [8.0, 8.0, 0.0, 8.5, 8.5, 3.5]},
        ]

        hvac_elements = [
            {"stable_id": "HVAC_DUCT_1", "name": "Supply Duct 1 (Clashes Col A)", "element_type": "Duct", "discipline": "mep", "box": [1.0, 2.1, 2.0, 4.0, 2.4, 2.4]},  # Clashes with Col A
            {"stable_id": "HVAC_DUCT_2", "name": "Return Duct 2 (Clashes Beam B)", "element_type": "Duct", "discipline": "mep", "box": [5.0, 1.0, 3.2, 5.4, 4.0, 3.5]},  # Clashes with Beam B
            {"stable_id": "HVAC_DUCT_3", "name": "Exhaust Duct 3 (Clear)", "element_type": "Duct", "discipline": "mep", "box": [15.0, 15.0, 2.0, 18.0, 15.4, 2.4]},      # Clear
        ]

        # 1. Execute BVH clash detection
        clashes = run_clash_detection_between_models(struc_elements, hvac_elements, model_a_id=1, model_b_id=2, tolerance=0.001)
        self.assertEqual(len(clashes), 2)

        # 2. Inspect first collision (Col A vs Duct 1)
        clash1 = next(c for c in clashes if c.element_a_guid == "STRUC_COL_A")
        self.assertEqual(clash1.element_b_guid, "HVAC_DUCT_1")
        self.assertEqual(clash1.clash_type, "Hard Collision")
        self.assertGreater(clash1.penetration_depth, 0.0)

        # Centroid should be within intersection bounds [2.0..2.5, 2.1..2.4, 2.0..2.4]
        self.assertTrue(2.0 <= clash1.collision_point.x <= 2.5)
        self.assertTrue(2.1 <= clash1.collision_point.y <= 2.4)
        self.assertTrue(2.0 <= clash1.collision_point.z <= 2.4)

        # 3. Verify BCF Viewpoint JSON with Red/Yellow highlight mapping
        vp1 = clash1.viewpoint_json
        self.assertIsNotNone(vp1)
        cam = vp1["perspective_camera"]
        self.assertEqual(cam["field_of_view"], 60.0)

        coloring = vp1["components"]["coloring"]
        color_map = {entry["components"][0]["ifc_guid"]: entry["color"] for entry in coloring}
        self.assertEqual(color_map["STRUC_COL_A"], "#FF0000")  # Element A = Red
        self.assertEqual(color_map["HVAC_DUCT_1"], "#FFFF00")  # Element B = Yellow

        # Verify element isolation exception
        exceptions = [e["ifc_guid"] for e in vp1["components"]["visibility"]["exceptions"]]
        self.assertIn("STRUC_COL_A", exceptions)
        self.assertIn("HVAC_DUCT_1", exceptions)

    # ==========================================================================
    # Scenario 3: Clash Issue Management & Threaded Discussion (F8, F9, F10)
    # ==========================================================================
    def test_scenario_3_clash_issue_management_and_threaded_discussion(self):
        """Scenario 3: Save clash to BIM Clash DocType, test camera fly-to, threaded comments, and ToDo assignment."""
        # 1. Create clash record
        clash_data = {
            "title": "Severe Clash: Column C1 vs Supply Air Duct",
            "project": "PROJ-NORDIC-LCA-01",
            "model_a": "BIM-MODEL-00001",
            "element_a_guid": "STRUC_COL_001",
            "element_a_name": "Concrete Column C1",
            "element_a_type": "IfcColumn",
            "element_a_discipline": "Structural",
            "model_b": "BIM-MODEL-00002",
            "element_b_guid": "HVAC_DUCT_001",
            "element_b_name": "Main Supply Duct 600x400",
            "element_b_type": "IfcDuctSegment",
            "element_b_discipline": "MEP",
            "severity": "Critical",
            "penetration_depth": 140.0,
            "intersection_volume": 0.038,
            "collision_point": [10.25, 14.15, 2.85],
        }
        clash_doc = BIMClashManager.create_clash(clash_data)
        self.assertIsNotNone(clash_doc.name)
        self.assertEqual(clash_doc.status, "Open")

        # 2. Simulate 1-Click Camera Fly-to Calculation
        target_pos = Vector3.from_list(clash_doc.collision_point)
        vp_cam = clash_doc.viewpoint_json["perspective_camera"]
        cam_view = Vector3(vp_cam["camera_view_point"]["x"], vp_cam["camera_view_point"]["y"], vp_cam["camera_view_point"]["z"])
        cam_dir = Vector3(vp_cam["camera_direction"]["x"], vp_cam["camera_direction"]["y"], vp_cam["camera_direction"]["z"])

        # Direction from camera to collision centroid should match cam_dir
        expected_dir = (target_pos - cam_view).normalize()
        self.assertAlmostEqual(cam_dir.x, expected_dir.x, places=2)
        self.assertAlmostEqual(cam_dir.y, expected_dir.y, places=2)
        self.assertAlmostEqual(cam_dir.z, expected_dir.z, places=2)

        # 3. Post Threaded Discussion Comments
        clash_doc.add_comment("Comment", "Coordination Lead: Critical conflict flagged on level 2.", comment_by="coord_lead@nordic.se")
        clash_doc.add_comment("Comment", "MEP Lead: Proposed routing duct through service bay 3.", comment_by="mep_lead@nordic.se")

        # 4. Assign ToDo to MEP designer
        todo = MockDoc(
            "ToDo",
            reference_type="BIM Clash",
            reference_name=clash_doc.name,
            allocated_to="mep_lead@nordic.se",
            description=f"Reroute duct for clash {clash_doc.title}",
            status="Open",
            priority="Urgent",
        ).insert()
        self.assertEqual(todo.allocated_to, "mep_lead@nordic.se")

        # 5. Resolve and Close Clash
        BIMClashManager.transition_status(clash_doc, "In Review", user="mep_lead@nordic.se", notes="Rerouting design submitted")
        BIMClashManager.transition_status(clash_doc, "Resolved", user="struc_lead@nordic.se", notes="Rerouted clearance approved")
        BIMClashManager.transition_status(clash_doc, "Closed", user="coord_lead@nordic.se", notes="Verified clash free in revised federated model")

        self.assertEqual(clash_doc.status, "Closed")
        self.assertEqual(len(clash_doc.get_comments()), 5)

    # ==========================================================================
    # Scenario 4: Automated BIM Quantity Takeoff & BOM Generation (F11, F12, F13)
    # ==========================================================================
    def test_scenario_4_automated_bim_quantity_takeoff_and_bom_generation(self):
        """Scenario 4: Run quantity takeoff on STRUC & HVAC elements, map to ERPNext Items, generate BOM, cross-highlight in 3D."""
        model_doc = MockDoc("BIM Model", model_name="Nordic LCA Housing Project", project="PROJ-NORDIC-01")

        elements = [
            # Structural concrete columns
            {"stable_id": "COL_101", "name": "Column 101", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 2.50}},
            {"stable_id": "COL_102", "name": "Column 102", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 2.50}},
            # Structural concrete beams
            {"stable_id": "BEAM_101", "name": "Beam 101", "element_type": "Beam", "discipline": "structure", "quantities": {"NetVolume": 4.00}},
            # HVAC galvanized ductwork
            {"stable_id": "DUCT_201", "name": "Duct 201", "element_type": "Duct", "discipline": "mep", "quantities": {"NetSurfaceArea": 15.0}},
            {"stable_id": "DUCT_202", "name": "Duct 202", "element_type": "Duct", "discipline": "mep", "quantities": {"NetSurfaceArea": 25.0}},
            # HVAC plumbing pipes
            {"stable_id": "PIPE_301", "name": "Pipe 301", "element_type": "Pipe", "discipline": "mep", "quantities": {"Length": 30.0}},
            # Structural steel rebar
            {"stable_id": "REBAR_401", "name": "Rebar Mesh 401", "element_type": "Rebar", "discipline": "structure", "quantities": {"NetWeight": 1500.0}},
        ]

        # 1. Generate BOM and BOQ Links
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model_doc, elements)

        self.assertIsNotNone(bom.name)
        self.assertEqual(len(items), 4)  # Concrete, Ductwork, Pipe, Steel
        self.assertEqual(len(links), 7)  # Traceability link for each source element

        # 2. Verify Concrete Rollup: (2.5 + 2.5 + 4.0) = 9.0 m3 @ $125/m3 = $1,125.00
        conc_row = next(i for i in items if i.item_code == "ITEM-CONC-C30")
        self.assertEqual(conc_row.qty, 9.0)
        self.assertEqual(conc_row.rate, 125.0)
        self.assertEqual(conc_row.amount, 1125.0)

        # 3. Verify Ductwork Rollup: (15.0 + 25.0) = 40.0 m2 @ $48.50/m2 = $1,940.00
        duct_row = next(i for i in items if i.item_code == "ITEM-DUCT-GALV")
        self.assertEqual(duct_row.qty, 40.0)
        self.assertEqual(duct_row.amount, 1940.0)

        # 4. Verify Pipe Rollup: 30.0 m @ $32.00/m = $960.00
        pipe_row = next(i for i in items if i.item_code == "ITEM-PIPE-COPPER")
        self.assertEqual(pipe_row.qty, 30.0)
        self.assertEqual(pipe_row.amount, 960.0)

        # 5. Verify Steel Rollup: 1500.0 kg @ $2.85/kg = $4,275.00
        steel_row = next(i for i in items if i.item_code == "ITEM-STEEL-S355")
        self.assertEqual(steel_row.qty, 1500.0)
        self.assertEqual(steel_row.amount, 4275.0)

        # Total BOM cost = 1125 + 1940 + 960 + 4275 = $8,300.00
        self.assertEqual(bom.total_cost, 8300.0)

        # 6. Interactive 3D Highlighting Test: Select Concrete BOM line
        conc_guids = json.loads(conc_row.element_guids)
        self.assertEqual(set(conc_guids), {"COL_101", "COL_102", "BEAM_101"})

    # ==========================================================================
    # Scenario 5: Full End-to-End Coordination Lifecycle (F1 -> F13)
    # ==========================================================================
    def test_scenario_5_full_end_to_end_coordination_lifecycle(self):
        """Scenario 5: Full coordination workflow from multi-IFC load -> clash check -> issue discussion -> resolution -> BOM generation."""
        # 1. Multi-Discipline Federation
        scene = FederatedSceneManager(coordinate_to_origin=False)
        struc_ifc = make_synthetic_ifc(
            project_name="STRUC",
            discipline="Structural",
            elements=[
                {"guid": "COL_1", "type": "IFCCOLUMN", "name": "Col 1", "x": 0.0, "y": 0.0, "z": 0.0, "dx": 0.5, "dy": 0.5, "dz": 3.0, "volume": 0.75},
                {"guid": "BEAM_1", "type": "IFCBEAM", "name": "Beam 1", "x": 0.0, "y": 0.0, "z": 2.8, "dx": 6.0, "dy": 0.4, "dz": 0.4, "volume": 0.96},
            ],
        )
        hvac_ifc = make_synthetic_ifc(
            project_name="HVAC",
            discipline="Mechanical",
            elements=[
                {"guid": "DUCT_1", "type": "IFCDUCTSEGMENT", "name": "Duct 1", "x": 0.5, "y": 0.0, "z": 2.7, "dx": 4.0, "dy": 0.5, "dz": 0.3},
            ],
        )

        m_struc = scene.load_model(1, "STRUC", "Structural", struc_ifc)
        m_hvac = scene.load_model(2, "HVAC", "Mechanical", hvac_ifc)
        self.assertEqual(len(scene.models), 2)

        # 2. In-Viewer Clash Detection
        clashes = run_clash_detection_between_models(m_struc.elements, m_hvac.elements, 1, 2)
        self.assertEqual(len(clashes), 1)
        clash = clashes[0]
        self.assertEqual(clash.element_a_guid, "BEAM_1")
        self.assertEqual(clash.element_b_guid, "DUCT_1")

        # 3. Save to BIM Clash DocType
        clash_doc = BIMClashManager.create_clash(clash.to_dict())
        self.assertEqual(clash_doc.status, "Open")

        # 4. Viewport Camera Navigation and Element Isolation
        vp = clash_doc.viewpoint_json
        self.assertEqual(vp["components"]["coloring"][0]["color"], "#FF0000")
        self.assertEqual(vp["components"]["coloring"][1]["color"], "#FFFF00")

        # 5. Threaded Discussion and Resolution
        clash_doc.add_comment("Comment", "Coordination: Beam B1 penetrates Duct D1 by 100mm.", comment_by="lead@corp.com")
        BIMClashManager.transition_status(clash_doc, "Resolved", user="mep@corp.com", notes="Adjusted duct elevation by -200mm")
        BIMClashManager.transition_status(clash_doc, "Closed", user="pm@corp.com", notes="Verified")
        self.assertEqual(clash_doc.status, "Closed")

        # 6. Automated BOM Takeoff Generation
        all_elements = m_struc.elements + m_hvac.elements
        bom_doc, bom_items, boq_links = BIMBOMGenerator.generate_bom_from_model(
            MockDoc("BIM Model", model_name="Federated Coordination Model"),
            all_elements,
        )

        self.assertGreater(len(bom_items), 0)
        self.assertGreater(bom_doc.total_cost, 0.0)
        self.assertGreater(len(boq_links), 0)

        # 7. 3D Cross-Highlight Verification
        for item in bom_items:
            guids = json.loads(item.element_guids)
            self.assertGreater(len(guids), 0)


if __name__ == "__main__":
    unittest.main()
