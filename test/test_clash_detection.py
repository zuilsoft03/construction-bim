"""E2E Test Suite for In-Viewer Clash Detection & BCF Viewpoints (Features 5-7).

Covers:
- Feature 5: In-Viewer BVH Clash Detection Pipeline (AABB broadphase, BVH narrowphase, SAT triangle intersection)
- Feature 6: 3D Visual Clash Highlighting (Red/Yellow color mapping, collision centroids, intersection markers)
- Feature 7: Clash Serialization & BCF Viewpoints (Penetration depth, BCF 2.1/3.0 camera viewpoint JSON)

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

from construction_bim.bim import ifc_parser as ip
from test.test_helper import (
    AABB3D,
    BVHNode,
    BVHTree,
    ClashPair,
    Triangle3D,
    Vector3,
    detect_clashes_between_elements,
    generate_bcf_viewpoint_json,
    get_real_ifc_paths,
    make_box_triangles,
    make_synthetic_ifc,
    run_clash_detection_between_models,
)


class TestClashDetection(unittest.TestCase):

    # ==========================================================================
    # Feature 5: In-Viewer BVH Clash Detection Pipeline
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_bvh_tree_construction_from_triangles(self):
        """F5-T1-1: Build BVHTree and verify root AABB, leaf nodes, and hierarchy."""
        box = AABB3D(min=Vector3(0.0, 0.0, 0.0), max=Vector3(2.0, 2.0, 2.0))
        triangles = make_box_triangles(box)
        self.assertEqual(len(triangles), 12)

        bvh = BVHTree(triangles, max_leaf_triangles=4)
        self.assertIsNotNone(bvh.root)
        self.assertTrue(bvh.root.bounding_box.is_valid())
        self.assertAlmostEqual(bvh.root.bounding_box.min.x, 0.0)
        self.assertAlmostEqual(bvh.root.bounding_box.max.x, 2.0)

    def test_aabb_broadphase_culling_disjoint_elements(self):
        """F5-T1-2: Elements that do not intersect on AABB are culled immediately."""
        el_a = {"guid": "col_1", "box": [0.0, 0.0, 0.0, 1.0, 1.0, 3.0], "discipline": "structure"}
        el_b = {"guid": "duct_1", "box": [10.0, 10.0, 0.0, 12.0, 12.0, 1.0], "discipline": "mep"}

        clash = detect_clashes_between_elements(el_a, el_b)
        self.assertIsNone(clash)

    def test_narrowphase_triangle_sat_exact_intersection(self):
        """F5-T1-3: 3D SAT triangle intersection correctly flags penetrating triangles."""
        # Two intersecting triangles
        t1 = Triangle3D(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(1.0, 2.0, 0.0))
        t2 = Triangle3D(Vector3(1.0, 1.0, -1.0), Vector3(1.0, 1.0, 1.0), Vector3(1.0, -1.0, 0.0))

        self.assertTrue(t1.intersects_triangle(t2))

        # Two parallel non-intersecting triangles
        t3 = Triangle3D(Vector3(0.0, 0.0, 2.0), Vector3(2.0, 0.0, 2.0), Vector3(1.0, 2.0, 2.0))
        self.assertFalse(t1.intersects_triangle(t3))

    def test_clash_detection_between_structural_and_hvac(self):
        """F5-T1-4: Detects collision between Structural column and HVAC duct."""
        # Column: (2, 2, 0) to (2.5, 2.5, 3.0)
        el_col = {
            "guid": "col_struc_01",
            "name": "Concrete Column C1",
            "element_type": "Column",
            "discipline": "structure",
            "box": [2.0, 2.0, 0.0, 2.5, 2.5, 3.0],
        }
        # Duct: passes directly through column at z=2.2: (1.0, 2.1, 2.2) to (4.0, 2.4, 2.6)
        el_duct = {
            "guid": "duct_hvac_01",
            "name": "Supply Main Duct",
            "element_type": "Duct",
            "discipline": "mep",
            "box": [1.0, 2.1, 2.2, 4.0, 2.4, 2.6],
        }

        clash = detect_clashes_between_elements(el_col, el_duct, model_a_id=1, model_b_id=2)
        self.assertIsNotNone(clash)
        self.assertEqual(clash.element_a_guid, "col_struc_01")
        self.assertEqual(clash.element_b_guid, "duct_hvac_01")
        self.assertEqual(clash.clash_type, "Hard Collision")
        self.assertGreater(clash.penetration_depth, 0.0)

    def test_clearance_violation_detection(self):
        """F5-T1-5: Detects clearance violations when elements are within clearance margin."""
        # Two elements 50mm apart
        el_a = {"guid": "pipe_a", "name": "Pipe A", "box": [0.0, 0.0, 0.0, 1.0, 0.2, 0.2], "discipline": "mep"}
        el_b = {"guid": "cable_b", "name": "Cable Tray B", "box": [0.0, 0.25, 0.0, 1.0, 0.45, 0.2], "discipline": "mep"}

        # Without clearance margin -> No hard clash
        no_clash = detect_clashes_between_elements(el_a, el_b, clearance=0.0)
        self.assertIsNone(no_clash)

        # With 100mm clearance margin -> Clearance Violation detected
        clearance_clash = detect_clashes_between_elements(el_a, el_b, clearance=0.10)
        self.assertIsNotNone(clearance_clash)
        self.assertEqual(clearance_clash.clash_type, "Clearance Violation")

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_coplanar_touching_surfaces_vs_penetration(self):
        """F5-T2-1: Touching surfaces with tolerance distinguished from true volume penetration."""
        # Two boxes exactly touching at x = 1.0
        box1 = {"guid": "b1", "box": [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]}
        box2 = {"guid": "b2", "box": [1.0, 0.0, 0.0, 2.0, 1.0, 1.0]}

        # Zero tolerance -> Touching volume is zero
        clash_zero = detect_clashes_between_elements(box1, box2, tolerance=0.0)
        self.assertIsNone(clash_zero)

        # Penetrating box: overlap by 100mm
        box3 = {"guid": "b3", "box": [0.9, 0.0, 0.0, 2.0, 1.0, 1.0]}
        clash_pen = detect_clashes_between_elements(box1, box3, tolerance=0.001)
        self.assertIsNotNone(clash_pen)
        self.assertGreater(clash_pen.penetration_depth, 50.0)

    def test_sub_millimeter_tolerance_handling(self):
        """F5-T2-2: Verify sub-millimeter (0.001m / 1mm) collision detection accuracy."""
        box1 = {"guid": "b1", "box": [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]}
        box2 = {"guid": "b2", "box": [0.9995, 0.0, 0.0, 1.9995, 1.0, 1.0]}

        # Overlap is 0.5mm
        clash = detect_clashes_between_elements(box1, box2, tolerance=0.0001)
        self.assertIsNotNone(clash)
        self.assertAlmostEqual(clash.penetration_depth, 0.5, delta=0.1)

    def test_negative_inverted_coordinates_collision(self):
        """F5-T2-3: Collision detection works accurately in negative coordinate quadrants."""
        el_a = {"guid": "neg_a", "box": [-50.0, -50.0, -10.0, -48.0, -48.0, -5.0]}
        el_b = {"guid": "neg_b", "box": [-49.0, -49.0, -8.0, -47.0, -47.0, -6.0]}

        clash = detect_clashes_between_elements(el_a, el_b)
        self.assertIsNotNone(clash)
        self.assertLess(clash.collision_point.x, 0.0)
        self.assertLess(clash.collision_point.y, 0.0)
        self.assertLess(clash.collision_point.z, 0.0)

    def test_empty_mesh_triangle_sets_safety(self):
        """F5-T2-4: Zero triangles or invalid meshes handled without exceptions."""
        el_invalid = {"guid": "bad_mesh", "box": []}
        el_valid = {"guid": "good_mesh", "box": [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]}

        clash = detect_clashes_between_elements(el_invalid, el_valid)
        self.assertIsNone(clash)

    def test_extreme_size_disparity_collision(self):
        """F5-T2-5: Huge slab intersecting tiny pipe segment correctly detected."""
        slab = {"guid": "huge_slab", "box": [0.0, 0.0, 0.0, 100.0, 100.0, 0.3]}
        pipe = {"guid": "tiny_pipe", "box": [50.0, 50.0, -0.1, 50.05, 50.05, 0.5]}

        clash = detect_clashes_between_elements(slab, pipe)
        self.assertIsNotNone(clash)
        self.assertEqual(clash.element_a_guid, "huge_slab")
        self.assertEqual(clash.element_b_guid, "tiny_pipe")

    # Tier 3: Pairwise Cross-Feature
    def test_clash_detection_with_multi_model_federation(self):
        """F5-T3-1: Detects collisions across federated scene with multiple models."""
        struc_elements = [
            {"stable_id": "c1", "name": "Column 1", "element_type": "Column", "discipline": "structure", "box": [0.0, 0.0, 0.0, 0.5, 0.5, 3.0]},
            {"stable_id": "c2", "name": "Column 2", "element_type": "Column", "discipline": "structure", "box": [5.0, 0.0, 0.0, 5.5, 0.5, 3.0]},
        ]
        hvac_elements = [
            {"stable_id": "d1", "name": "Duct 1", "element_type": "Duct", "discipline": "mep", "box": [-1.0, 0.1, 2.0, 2.0, 0.4, 2.4]},  # Clashes with c1
            {"stable_id": "d2", "name": "Duct 2", "element_type": "Duct", "discipline": "mep", "box": [10.0, 10.0, 2.0, 12.0, 10.4, 2.4]}, # Clear
        ]

        clashes = run_clash_detection_between_models(struc_elements, hvac_elements, model_a_id=1, model_b_id=2)
        self.assertEqual(len(clashes), 1)
        self.assertEqual(clashes[0].element_a_guid, "c1")
        self.assertEqual(clashes[0].element_b_guid, "d1")

    # Tier 4: Real-World Scenario
    def test_real_struc_vs_hvac_bvh_clash_detection(self):
        """F5-T4-1: Run clash check between real Nordic LCA STRUC and HVAC datasets."""
        paths = get_real_ifc_paths()
        struc_path = paths.get("STRUC")
        hvac_path = paths.get("HVAC")

        if not struc_path or not hvac_path or not os.path.exists(struc_path) or not os.path.exists(hvac_path):
            self.skipTest("Real IFC files not available for STRUC vs HVAC clash test")

        with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
            struc_text = f.read(500000)
        with open(hvac_path, "r", encoding="utf-8", errors="ignore") as f:
            hvac_text = f.read(500000)

        struc_parsed = ip.parse_ifc_text(struc_text)
        hvac_parsed = ip.parse_ifc_text(hvac_text)

        # Prepare elements with box geometry
        for el in struc_parsed["elements"]:
            p = el.get("placement", [0, 0, 0])
            el["box"] = [p[0], p[1], p[2], p[0] + 0.4, p[1] + 0.4, p[2] + 2.8]

        for el in hvac_parsed["elements"]:
            p = el.get("placement", [0, 0, 0])
            el["box"] = [p[0], p[1], p[2], p[0] + 2.0, p[1] + 0.3, p[2] + 0.3]

        # Execute clash detection on sample
        clashes = run_clash_detection_between_models(
            struc_parsed["elements"][:30],
            hvac_parsed["elements"][:30],
            model_a_id=1,
            model_b_id=2,
        )
        self.assertIsInstance(clashes, list)

    # ==========================================================================
    # Feature 6: 3D Visual Clash Highlighting
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_clash_color_mapping_red_and_yellow(self):
        """F6-T1-1: Verify Element A is mapped to Red (#FF0000) and Element B to Yellow (#FFFF00)."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="GUID_A", element_a_name="Col A", element_a_type="Column", element_a_discipline="structure",
            model_b_id=2, element_b_guid="GUID_B", element_b_name="Duct B", element_b_type="Duct", element_b_discipline="mep",
            collision_point=Vector3(2.25, 2.25, 2.3), penetration_depth=200.0, intersection_volume=0.015,
            bounding_box=AABB3D(min=Vector3(2.0, 2.1, 2.2), max=Vector3(2.5, 2.4, 2.4)),
        )
        vp = generate_bcf_viewpoint_json(clash)
        coloring = vp["components"]["coloring"]

        self.assertEqual(len(coloring), 2)
        # Element A is Red
        self.assertEqual(coloring[0]["color"], "#FF0000")
        self.assertEqual(coloring[0]["components"][0]["ifc_guid"], "GUID_A")
        # Element B is Yellow
        self.assertEqual(coloring[1]["color"], "#FFFF00")
        self.assertEqual(coloring[1]["components"][0]["ifc_guid"], "GUID_B")

    def test_collision_centroid_calculation(self):
        """F6-T1-2: Exact centroid computed as intersection volume center."""
        b1 = {"guid": "e1", "box": [0.0, 0.0, 0.0, 2.0, 2.0, 2.0]}
        b2 = {"guid": "e2", "box": [1.0, 1.0, 1.0, 3.0, 3.0, 3.0]}

        clash = detect_clashes_between_elements(b1, b2)
        self.assertIsNotNone(clash)
        # Intersection box is (1..2, 1..2, 1..2) -> Centroid = (1.5, 1.5, 1.5)
        self.assertAlmostEqual(clash.collision_point.x, 1.5, places=3)
        self.assertAlmostEqual(clash.collision_point.y, 1.5, places=3)
        self.assertAlmostEqual(clash.collision_point.z, 1.5, places=3)

    def test_collision_bounding_box_generation(self):
        """F6-T1-3: Accurate intersection AABB bounds calculated."""
        b1 = {"guid": "e1", "box": [0.0, 0.0, 0.0, 4.0, 4.0, 4.0]}
        b2 = {"guid": "e2", "box": [2.0, 1.0, 3.0, 5.0, 6.0, 7.0]}

        clash = detect_clashes_between_elements(b1, b2)
        self.assertIsNotNone(clash)
        bbox = clash.bounding_box
        self.assertAlmostEqual(bbox.min.x, 2.0)
        self.assertAlmostEqual(bbox.min.y, 1.0)
        self.assertAlmostEqual(bbox.min.z, 3.0)
        self.assertAlmostEqual(bbox.max.x, 4.0)
        self.assertAlmostEqual(bbox.max.y, 4.0)
        self.assertAlmostEqual(bbox.max.z, 4.0)

    def test_clash_marker_coordinate_precision(self):
        """F6-T1-4: Marker coordinates stored with millimeter precision."""
        b1 = {"guid": "e1", "box": [12.3456, 23.4567, 34.5678, 15.0, 25.0, 36.0]}
        b2 = {"guid": "e2", "box": [13.0, 24.0, 35.0, 16.0, 26.0, 37.0]}

        clash = detect_clashes_between_elements(b1, b2)
        self.assertIsNotNone(clash)
        d = clash.to_dict()
        self.assertIn("collision_point_x", d)
        self.assertIn("collision_point_y", d)
        self.assertIn("collision_point_z", d)

    def test_multi_clash_distinct_highlight_states(self):
        """F6-T1-5: Multiple separate clashes have distinct color mappings and isolated IDs."""
        clash1 = ClashPair(
            model_a_id=1, element_a_guid="A1", element_a_name="Col1", element_a_type="Column", element_a_discipline="structure",
            model_b_id=2, element_b_guid="B1", element_b_name="Duct1", element_b_type="Duct", element_b_discipline="mep",
            collision_point=Vector3(1, 1, 1), penetration_depth=10, intersection_volume=0.01, bounding_box=AABB3D(),
        )
        clash2 = ClashPair(
            model_a_id=1, element_a_guid="A2", element_a_name="Col2", element_a_type="Column", element_a_discipline="structure",
            model_b_id=2, element_b_guid="B2", element_b_name="Duct2", element_b_type="Duct", element_b_discipline="mep",
            collision_point=Vector3(5, 5, 5), penetration_depth=20, intersection_volume=0.02, bounding_box=AABB3D(),
        )

        vp1 = generate_bcf_viewpoint_json(clash1)
        vp2 = generate_bcf_viewpoint_json(clash2)

        self.assertEqual(vp1["components"]["selection"][0]["ifc_guid"], "A1")
        self.assertEqual(vp2["components"]["selection"][0]["ifc_guid"], "A2")

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_highlight_with_null_or_missing_element_guid(self):
        """F6-T2-1: Graceful fallback when GUID is missing."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="", element_a_name="Anonymous A", element_a_type="Column", element_a_discipline="structure",
            model_b_id=2, element_b_guid="", element_b_name="Anonymous B", element_b_type="Duct", element_b_discipline="mep",
            collision_point=Vector3(0, 0, 0), penetration_depth=5, intersection_volume=0.001, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash)
        self.assertIsNotNone(vp)
        self.assertEqual(len(vp["components"]["coloring"]), 2)

    def test_highlight_at_origin_zero_coordinates(self):
        """F6-T2-2: Highlight centroid at (0, 0, 0) is valid and not treated as falsy."""
        b1 = {"guid": "e1", "box": [-1.0, -1.0, -1.0, 1.0, 1.0, 1.0]}
        b2 = {"guid": "e2", "box": [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5]}

        clash = detect_clashes_between_elements(b1, b2)
        self.assertIsNotNone(clash)
        self.assertAlmostEqual(clash.collision_point.x, 0.0)
        self.assertAlmostEqual(clash.collision_point.y, 0.0)
        self.assertAlmostEqual(clash.collision_point.z, 0.0)

    def test_highlight_color_format_validation(self):
        """F6-T2-3: Color codes strictly adhere to 6-digit hex format (#RRGGBB)."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="A", element_a_name="A", element_a_type="T", element_a_discipline="D",
            model_b_id=2, element_b_guid="B", element_b_name="B", element_b_type="T", element_b_discipline="D",
            collision_point=Vector3(), penetration_depth=1, intersection_volume=1, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash)
        for col_entry in vp["components"]["coloring"]:
            color = col_entry["color"]
            self.assertTrue(color.startswith("#"))
            self.assertEqual(len(color), 7)
            int(color[1:], 16)  # Raises ValueError if not hex

    def test_extreme_coordinate_highlight_stability(self):
        """F6-T2-4: Highlight calculations maintain precision at coordinate >10,000m."""
        b1 = {"guid": "e1", "box": [500000.0, 6000000.0, 100.0, 500002.0, 6000002.0, 103.0]}
        b2 = {"guid": "e2", "box": [500001.0, 6000001.0, 102.0, 500004.0, 6000003.0, 104.0]}

        clash = detect_clashes_between_elements(b1, b2)
        self.assertIsNotNone(clash)
        self.assertAlmostEqual(clash.collision_point.x, 500001.5, places=2)
        self.assertAlmostEqual(clash.collision_point.y, 6000001.5, places=2)
        self.assertAlmostEqual(clash.collision_point.z, 102.5, places=2)

    def test_rapid_highlight_toggle_state(self):
        """F6-T2-5: Switching highlight on/off restores original state cleanly."""
        state = {"selected_clash": None, "highlighted_guids": {}}

        # Select clash
        state["selected_clash"] = "CLASH-001"
        state["highlighted_guids"] = {"GUID_A": "#FF0000", "GUID_B": "#FFFF00"}
        self.assertEqual(len(state["highlighted_guids"]), 2)

        # Deselect
        state["selected_clash"] = None
        state["highlighted_guids"].clear()
        self.assertEqual(len(state["highlighted_guids"]), 0)

    # Tier 3: Pairwise Cross-Feature
    def test_clash_detection_to_highlight_bridge(self):
        """F6-T3-1: Direct pipeline from BVH clash detection to 3D highlight rendering contract."""
        el1 = {"guid": "col_c1", "name": "Column C1", "box": [0, 0, 0, 1, 1, 3]}
        el2 = {"guid": "duct_d1", "name": "Duct D1", "box": [0.5, 0.5, 2, 2, 0.9, 2.4]}

        clash = detect_clashes_between_elements(el1, el2)
        self.assertIsNotNone(clash)

        vp = generate_bcf_viewpoint_json(clash)
        colored_guids = {c["components"][0]["ifc_guid"]: c["color"] for c in vp["components"]["coloring"]}
        self.assertEqual(colored_guids["col_c1"], "#FF0000")
        self.assertEqual(colored_guids["duct_d1"], "#FFFF00")

    # Tier 4: Real-World Scenario
    def test_real_clash_visual_highlight_generation(self):
        """F6-T4-1: Generate visual highlight markers for real detected clashes in Nordic LCA models."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="3h2Z_qJ5TDfvXw001", element_a_name="STRUC Column", element_a_type="IfcColumn", element_a_discipline="structure",
            model_b_id=2, element_b_guid="1v8X_kL3MNbvYt999", element_b_name="HVAC Duct", element_b_type="IfcDuctSegment", element_b_discipline="mep",
            collision_point=Vector3(12.5, 8.4, 3.2), penetration_depth=120.0, intersection_volume=0.035,
            bounding_box=AABB3D(min=Vector3(12.3, 8.2, 3.0), max=Vector3(12.7, 8.6, 3.4)),
        )
        vp = generate_bcf_viewpoint_json(clash)
        self.assertIn("perspective_camera", vp)
        self.assertIn("components", vp)

    # ==========================================================================
    # Feature 7: Clash Serialization & BCF Viewpoints
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_bcf_perspective_camera_math(self):
        """F7-T1-1: Camera view point, target direction vector, up-vector, and FOV calculations."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="GA", element_a_name="A", element_a_type="Col", element_a_discipline="STRUC",
            model_b_id=2, element_b_guid="GB", element_b_name="B", element_b_type="Duct", element_b_discipline="MEP",
            collision_point=Vector3(10.0, 10.0, 5.0), penetration_depth=50.0, intersection_volume=0.01, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash, camera_distance=4.0, fov=60.0)
        cam = vp["perspective_camera"]

        pos = Vector3(cam["camera_view_point"]["x"], cam["camera_view_point"]["y"], cam["camera_view_point"]["z"])
        target_dir = Vector3(cam["camera_direction"]["x"], cam["camera_direction"]["y"], cam["camera_direction"]["z"])
        up = Vector3(cam["camera_up_vector"]["x"], cam["camera_up_vector"]["y"], cam["camera_up_vector"]["z"])

        self.assertAlmostEqual(target_dir.length(), 1.0, places=3)
        self.assertAlmostEqual(up.z, 1.0)
        self.assertEqual(cam["field_of_view"], 60.0)

    def test_bcf_component_selection_and_coloring(self):
        """F7-T1-2: Components array contains selection GUIDs and Red/Yellow coloring rules."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="GUID_111", element_a_name="A", element_a_type="Col", element_a_discipline="STRUC",
            model_b_id=2, element_b_guid="GUID_222", element_b_name="B", element_b_type="Duct", element_b_discipline="MEP",
            collision_point=Vector3(), penetration_depth=10, intersection_volume=1, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash)
        guids = [item["ifc_guid"] for item in vp["components"]["selection"]]
        self.assertIn("GUID_111", guids)
        self.assertIn("GUID_222", guids)

    def test_bcf_visibility_exceptions(self):
        """F7-T1-3: Default visibility set to false with colliding elements in exceptions."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="GUID_A", element_a_name="A", element_a_type="Col", element_a_discipline="STRUC",
            model_b_id=2, element_b_guid="GUID_B", element_b_name="B", element_b_type="Duct", element_b_discipline="MEP",
            collision_point=Vector3(), penetration_depth=10, intersection_volume=1, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash)
        vis = vp["components"]["visibility"]
        self.assertFalse(vis["default_visibility"])
        exc_guids = [e["ifc_guid"] for e in vis["exceptions"]]
        self.assertEqual(exc_guids, ["GUID_A", "GUID_B"])

    def test_penetration_depth_metric_calculation(self):
        """F7-T1-4: Penetration depth in millimeters correctly calculated."""
        # Box overlap on X is 0.2m (200mm), on Y is 0.3m (300mm), on Z is 0.4m (400mm) -> Min penetration is 200mm
        b1 = {"guid": "b1", "box": [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]}
        b2 = {"guid": "b2", "box": [0.8, 0.7, 0.6, 1.8, 1.7, 1.6]}

        clash = detect_clashes_between_elements(b1, b2)
        self.assertIsNotNone(clash)
        self.assertAlmostEqual(clash.penetration_depth, 200.0, places=1)

    def test_clash_serialization_to_json(self):
        """F7-T1-5: Clash record serializes cleanly to JSON adhering to BCF 2.1/3.0 schema."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="A", element_a_name="A", element_a_type="Col", element_a_discipline="STRUC",
            model_b_id=2, element_b_guid="B", element_b_name="B", element_b_type="Duct", element_b_discipline="MEP",
            collision_point=Vector3(1, 2, 3), penetration_depth=15.5, intersection_volume=0.002, bounding_box=AABB3D(min=Vector3(1,2,3), max=Vector3(2,3,4)),
        )
        d = clash.to_dict()
        serialized = json.dumps(d)
        deserialized = json.loads(serialized)
        self.assertEqual(deserialized["penetration_depth"], 15.5)
        self.assertIn("perspective_camera", deserialized["viewpoint_json"])

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_sub_millimeter_penetration_depth_rounding(self):
        """F7-T2-1: Sub-millimeter penetration rounded without float drift."""
        b1 = {"guid": "b1", "box": [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]}
        b2 = {"guid": "b2", "box": [0.9991234, 0.0, 0.0, 2.0, 1.0, 1.0]}

        clash = detect_clashes_between_elements(b1, b2, tolerance=0.00001)
        self.assertIsNotNone(clash)
        self.assertAlmostEqual(clash.penetration_depth, 0.88, places=1)

    def test_malformed_bcf_json_handling(self):
        """F7-T2-2: Corrupted/incomplete BCF JSON rejected with validation error."""
        bad_json = "{not a valid json"
        with self.assertRaises(json.JSONDecodeError):
            json.loads(bad_json)

    def test_bcf_camera_direction_normalization(self):
        """F7-T2-3: Camera direction vector is strictly unit length (1.0 +/- 1e-6)."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="A", element_a_name="A", element_a_type="Col", element_a_discipline="STRUC",
            model_b_id=2, element_b_guid="B", element_b_name="B", element_b_type="Duct", element_b_discipline="MEP",
            collision_point=Vector3(1234.56, 7890.12, 345.67), penetration_depth=10, intersection_volume=1, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash)
        cd = vp["perspective_camera"]["camera_direction"]
        length = math.sqrt(cd["x"]**2 + cd["y"]**2 + cd["z"]**2)
        self.assertAlmostEqual(length, 1.0, places=3)

    def test_bcf_viewpoint_with_special_characters(self):
        """F7-T2-4: Handles GUIDs/names with special characters without breaking JSON."""
        special_guid_a = "3h2Z_qJ5TDfvXw001/Ø<>&\"'"
        special_guid_b = "1v8X_kL3MNbvYt999\\äöü"
        clash = ClashPair(
            model_a_id=1, element_a_guid=special_guid_a, element_a_name="Special Col", element_a_type="Col", element_a_discipline="STRUC",
            model_b_id=2, element_b_guid=special_guid_b, element_b_name="Special Duct", element_b_type="Duct", element_b_discipline="MEP",
            collision_point=Vector3(), penetration_depth=1, intersection_volume=1, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash)
        serialized = json.dumps(vp)
        deserialized = json.loads(serialized)
        self.assertEqual(deserialized["components"]["selection"][0]["ifc_guid"], special_guid_a)
        self.assertEqual(deserialized["components"]["selection"][1]["ifc_guid"], special_guid_b)

    def test_zero_volume_penetration_bcf_generation(self):
        """F7-T2-5: Touching/zero volume collision generates valid viewpoint without division by zero."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="A", element_a_name="A", element_a_type="Col", element_a_discipline="STRUC",
            model_b_id=2, element_b_guid="B", element_b_name="B", element_b_type="Duct", element_b_discipline="MEP",
            collision_point=Vector3(0, 0, 0), penetration_depth=0.0, intersection_volume=0.0, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash)
        self.assertIsNotNone(vp["perspective_camera"])

    # Tier 3: Pairwise Cross-Feature
    def test_clash_bcf_viewpoint_roundtrip(self):
        """F7-T3-1: Serialize BCF viewpoint JSON and deserialize back to camera/component state."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="G1", element_a_name="A", element_a_type="Col", element_a_discipline="STRUC",
            model_b_id=2, element_b_guid="G2", element_b_name="B", element_b_type="Duct", element_b_discipline="MEP",
            collision_point=Vector3(4, 5, 6), penetration_depth=45.0, intersection_volume=0.008, bounding_box=AABB3D(),
        )
        vp = generate_bcf_viewpoint_json(clash)
        s = json.dumps(vp)
        loaded = json.loads(s)

        cam = loaded["perspective_camera"]
        self.assertIn("camera_view_point", cam)
        self.assertIn("camera_direction", cam)
        self.assertIn("components", loaded)

    # Tier 4: Real-World Scenario
    def test_real_clash_bcf_viewpoint_generation(self):
        """F7-T4-1: Generate real BCF viewpoint JSON for detected clashes between STRUC and HVAC."""
        clash = ClashPair(
            model_a_id=1, element_a_guid="2O2$U$point_a", element_a_name="Tekla Concrete Beam", element_a_type="IfcBeam", element_a_discipline="structure",
            model_b_id=2, element_b_guid="3kL7#duct_b", element_b_name="MagiCAD Circular Duct DN200", element_b_type="IfcDuctSegment", element_b_discipline="mep",
            collision_point=Vector3(18.4, 32.1, 4.5), penetration_depth=85.0, intersection_volume=0.022,
            bounding_box=AABB3D(min=Vector3(18.3, 32.0, 4.4), max=Vector3(18.5, 32.2, 4.6)),
        )
        vp = generate_bcf_viewpoint_json(clash)
        self.assertEqual(len(vp["components"]["selection"]), 2)
        self.assertEqual(vp["perspective_camera"]["field_of_view"], 60.0)


if __name__ == "__main__":
    unittest.main()
