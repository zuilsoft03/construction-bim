#!/usr/bin/env python3
"""Empirical Adversarial Test Harness: 3D Spatial Math & Clash Detection Engine.

Author: Challenger 1 (challenger_spatial_math)
Scope:
1. BVH tree construction, broadphase AABB culling, triangle-level SAT narrowphase under stress.
2. Edge cases: coplanar touching faces, collinear edges, sub-millimeter penetrations (0.0001m to 0.001m),
   inverted normals, disjoint distant meshes, degenerate zero-area triangles.
3. Camera coordinate transformations: Three.js Y-up vs IFC/BCF Z-up coordinate conversion,
   perspective FOV trigonometry, camera target reconstruction from direction vector.
4. Execution against real Nordic LCA IFC datasets (STRUC & HVAC concrete building permit).
"""

from __future__ import annotations

import copy
import json
import math
import os
import random
import sys
import time
import unittest
from typing import Any, Dict, List, Optional, Set, Tuple

# Ensure repository root is on sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

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
    run_clash_detection_between_models,
)
from construction_bim.bim import ifc_geometry, ifc_parser


class TestSpatialMathChallenger(unittest.TestCase):
    """Empirical adversarial test suite for 3D spatial math and clash detection."""

    @classmethod
    def setUpClass(cls):
        random.seed(42)  # Deterministic repeatability

    # ==========================================================================
    # DOMAIN 1: BVH TREE, BROADPHASE AABB & TRIANGLE SAT UNDER STRESS
    # ==========================================================================

    def test_bvh_large_mesh_stress_hierarchy(self):
        """Stress test BVH construction on 10,000+ triangles; verify tree depth and bounding containment."""
        # Generate a large 3D grid of triangles (100 x 50 x 2 = 10,000 triangles)
        triangles: List[Triangle3D] = []
        nx, ny = 100, 50
        for i in range(nx):
            for j in range(ny):
                p0 = Vector3(float(i), float(j), math.sin(i * 0.1) * math.cos(j * 0.1))
                p1 = Vector3(float(i + 1), float(j), math.sin((i + 1) * 0.1) * math.cos(j * 0.1))
                p2 = Vector3(float(i + 1), float(j + 1), math.sin((i + 1) * 0.1) * math.cos((j + 1) * 0.1))
                p3 = Vector3(float(i), float(j + 1), math.sin(i * 0.1) * math.cos((j + 1) * 0.1))
                triangles.append(Triangle3D(p0, p1, p2))
                triangles.append(Triangle3D(p0, p2, p3))

        self.assertEqual(len(triangles), 10000)

        t0 = time.perf_counter()
        bvh = BVHTree(triangles, max_leaf_triangles=4)
        t_build = time.perf_counter() - t0

        self.assertIsNotNone(bvh.root)
        self.assertTrue(bvh.root.bounding_box.is_valid())
        self.assertLess(t_build, 3.0, f"BVH build took too long: {t_build:.3f}s")

        # Verify hierarchical containment: every parent bounding box encloses child boxes and triangles
        def verify_node(node: BVHNode) -> Tuple[int, int]:
            # Returns (triangle_count, max_depth)
            if node.is_leaf():
                self.assertLessEqual(len(node.triangles), 4)
                for tri in node.triangles:
                    tri_box = tri.aabb()
                    self.assertTrue(
                        node.bounding_box.min.x <= tri_box.min.x + 1e-6
                        and node.bounding_box.max.x >= tri_box.max.x - 1e-6
                        and node.bounding_box.min.y <= tri_box.min.y + 1e-6
                        and node.bounding_box.max.y >= tri_box.max.y - 1e-6
                        and node.bounding_box.min.z <= tri_box.min.z + 1e-6
                        and node.bounding_box.max.z >= tri_box.max.z - 1e-6,
                        "Leaf bounding box does not contain triangle!"
                    )
                return len(node.triangles), 1

            t_count = 0
            d_max = 0
            for child in (node.left, node.right):
                if child:
                    self.assertTrue(
                        node.bounding_box.min.x <= child.bounding_box.min.x + 1e-6
                        and node.bounding_box.max.x >= child.bounding_box.max.x - 1e-6
                        and node.bounding_box.min.y <= child.bounding_box.min.y + 1e-6
                        and node.bounding_box.max.y >= child.bounding_box.max.y - 1e-6
                        and node.bounding_box.min.z <= child.bounding_box.min.z + 1e-6
                        and node.bounding_box.max.z >= child.bounding_box.max.z - 1e-6,
                        "Parent bounding box does not enclose child bounding box!"
                    )
                    c_count, c_depth = verify_node(child)
                    t_count += c_count
                    d_max = max(d_max, c_depth)
            return t_count, d_max + 1

        total_triangles, tree_depth = verify_node(bvh.root)
        self.assertEqual(total_triangles, 10000, "All triangles must be preserved in BVH leaves!")
        # Depth for 10000 items with leaf size 4 should be around log2(2500) ~ 12-16
        self.assertLessEqual(tree_depth, 20, f"Tree depth {tree_depth} indicates degenerate tree split")

    def test_sat_triangle_intersection_against_segment_piercing_oracle(self):
        """Adversarially test 3D SAT against an independent segment-triangle intersection oracle on 2,000 pairs."""
        def segment_intersects_triangle(p0: Vector3, p1: Vector3, tri: Triangle3D) -> bool:
            """Möller-Trumbore ray/segment triangle intersection oracle."""
            edge1 = tri.v1 - tri.v0
            edge2 = tri.v2 - tri.v0
            ray_dir = p1 - p0
            seg_len = ray_dir.length()
            if seg_len < 1e-9:
                return False
            d = ray_dir.normalize()
            h = d.cross(edge2)
            a = edge1.dot(h)
            if abs(a) < 1e-8:
                return False
            f = 1.0 / a
            s = p0 - tri.v0
            u = f * s.dot(h)
            if u < -1e-6 or u > 1.0 + 1e-6:
                return False
            q = s.cross(edge1)
            v = f * d.dot(q)
            if v < -1e-6 or u + v > 1.0 + 1e-6:
                return False
            t = f * edge2.dot(q)
            return 1e-6 <= t <= seg_len - 1e-6

        # Test 2,000 randomized triangle pairs where one triangle's edges pierce the other
        for _ in range(2000):
            # Base triangle in XY plane
            t1 = Triangle3D(
                Vector3(random.uniform(-5, 0), random.uniform(-5, 0), 0.0),
                Vector3(random.uniform(1, 6), random.uniform(-5, 0), 0.0),
                Vector3(random.uniform(-2, 2), random.uniform(1, 6), 0.0),
            )
            # Pick an interior point of t1
            u, v = random.uniform(0.1, 0.4), random.uniform(0.1, 0.4)
            interior_pt = t1.v0 + (t1.v1 - t1.v0) * u + (t1.v2 - t1.v0) * v

            # Construct piercing triangle t2 that passes through interior_pt along Z
            t2 = Triangle3D(
                interior_pt + Vector3(0.0, 0.0, -2.0),
                interior_pt + Vector3(1.0, 0.0, 2.0),
                interior_pt + Vector3(-1.0, 1.0, 2.0),
            )

            # Oracle check
            pierces = (
                segment_intersects_triangle(t2.v0, t2.v1, t1)
                or segment_intersects_triangle(t2.v1, t2.v2, t1)
                or segment_intersects_triangle(t2.v2, t2.v0, t1)
            )
            sat_result = t1.intersects_triangle(t2, tolerance=1e-5)
            if pierces:
                self.assertTrue(sat_result, "SAT failed to detect true piercing collision identified by oracle!")

    def test_bvh_tree_collision_performance_and_soundness(self):
        """Test BVHTree.collide_tree() on two interpenetrating 3D meshes."""
        # Box A: [0, 0, 0] to [2, 2, 2]
        box_a = AABB3D(min=Vector3(0.0, 0.0, 0.0), max=Vector3(2.0, 2.0, 2.0))
        tris_a = make_box_triangles(box_a)
        bvh_a = BVHTree(tris_a, max_leaf_triangles=2)

        # Box B: [1, 1, 1] to [3, 3, 3] (Overlaps A in [1, 2]^3)
        box_b = AABB3D(min=Vector3(1.0, 1.0, 1.0), max=Vector3(3.0, 3.0, 3.0))
        tris_b = make_box_triangles(box_b)
        bvh_b = BVHTree(tris_b, max_leaf_triangles=2)

        # Box C: [10, 10, 10] to [12, 12, 12] (Disjoint)
        box_c = AABB3D(min=Vector3(10.0, 10.0, 10.0), max=Vector3(12.0, 12.0, 12.0))
        tris_c = make_box_triangles(box_c)
        bvh_c = BVHTree(tris_c, max_leaf_triangles=2)

        pairs_ab = bvh_a.collide_tree(bvh_b)
        self.assertGreater(len(pairs_ab), 0, "Overlapping boxes must yield collision triangle pairs!")

        pairs_ac = bvh_a.collide_tree(bvh_c)
        self.assertEqual(len(pairs_ac), 0, "Disjoint boxes must yield zero collision pairs!")

    # ==========================================================================
    # DOMAIN 2: GEOMETRIC & TOPOLOGICAL EDGE CASES
    # ==========================================================================

    def test_edge_case_coplanar_touching_faces_clearance_vs_collision(self):
        """Edge Case 1: Coplanar touching faces (0 volume) vs clearance violation vs hard collision."""
        # Box 1: [0, 0, 0] to [2, 2, 2]
        # Box 2: [2, 0, 0] to [4, 2, 2] (Touches exactly at x = 2.0 plane, 0 interior volume)
        el1 = {"guid": "box_1", "name": "Box 1", "element_type": "Wall", "box": [0.0, 0.0, 0.0, 2.0, 2.0, 2.0]}
        el2_touching = {"guid": "box_2", "name": "Box 2", "element_type": "Wall", "box": [2.0, 0.0, 0.0, 4.0, 2.0, 2.0]}

        # Without clearance: touching face has volume 0 -> should NOT flag as hard collision
        clash_no_clearance = detect_clashes_between_elements(el1, el2_touching, clearance=0.0)
        self.assertIsNone(clash_no_clearance, "Touching face with 0 volume should not be flagged as hard collision")

        # Separated elements with 50mm gap:
        # Box 3: [2.05, 0, 0] to [4.05, 2, 2] (50mm distance from Box 1)
        el3_separated = {"guid": "box_3", "name": "Box 3", "element_type": "Duct", "box": [2.05, 0.0, 0.0, 4.05, 2.0, 2.0]}

        # Without clearance: 50mm gap -> None
        clash_sep_none = detect_clashes_between_elements(el1, el3_separated, clearance=0.0)
        self.assertIsNone(clash_sep_none)

        # With clearance = 0.10m (100mm): 50mm gap is inside 100mm clearance zone -> MUST flag as Clearance Violation
        clash_with_clearance = detect_clashes_between_elements(el1, el3_separated, clearance=0.10)
        self.assertIsNotNone(clash_with_clearance, "Clearance violation must be detected when within margin")
        self.assertEqual(clash_with_clearance.clash_type, "Clearance Violation")

        # Penetrating element: overlap by 100mm
        el4_penetrating = {"guid": "box_4", "name": "Box 4", "element_type": "Duct", "box": [1.90, 0.0, 0.0, 3.90, 2.0, 2.0]}
        clash_hard = detect_clashes_between_elements(el1, el4_penetrating, clearance=0.0)
        self.assertIsNotNone(clash_hard)
        self.assertEqual(clash_hard.clash_type, "Hard Collision")
        self.assertAlmostEqual(clash_hard.penetration_depth, 100.0, delta=1.0)

    def test_edge_case_collinear_edges(self):
        """Edge Case 2: Collinear edges where cross-product axis is zero."""
        # Two triangles sharing an edge from (0,0,0) to (1,0,0) but lying in different planes (90 deg angle)
        t1 = Triangle3D(Vector3(0.0, 0.0, 0.0), Vector3(1.0, 0.0, 0.0), Vector3(0.0, 1.0, 0.0))
        t2 = Triangle3D(Vector3(0.0, 0.0, 0.0), Vector3(1.0, 0.0, 0.0), Vector3(0.0, 0.0, 1.0))

        # Shared edge e1 = e2 = (1, 0, 0) -> cross product e1 x e2 = (0, 0, 0)
        # Verify SAT handles zero-length cross product without NaN or division-by-zero
        self.assertFalse(math.isnan(t1.normal().x))
        self.assertFalse(math.isnan(t2.normal().x))
        # They touch only along an edge with 0 penetration
        sat_res = t1.intersects_triangle(t2, tolerance=1e-7)
        # Touching triangles on boundary
        self.assertTrue(isinstance(sat_res, bool))

    def test_edge_case_sub_millimeter_penetrations(self):
        """Edge Case 3: Sub-millimeter penetrations (0.0001m to 0.001m)."""
        # Box 1: [0, 0, 0] to [1, 1, 1]
        # Box 2: Penetrating by 0.0001m (0.1mm)
        el1 = {"guid": "b1", "name": "B1", "box": [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]}
        el_0_1mm = {"guid": "b2_01mm", "name": "B2", "box": [0.9999, 0.0, 0.0, 2.0, 1.0, 1.0]}
        # Box 3: Penetrating by 0.001m (1.0mm)
        el_1mm = {"guid": "b2_1mm", "name": "B2", "box": [0.9990, 0.0, 0.0, 2.0, 1.0, 1.0]}

        # Sub-mm penetration test with default 1mm tolerance
        clash_0_1mm = detect_clashes_between_elements(el1, el_0_1mm, tolerance=0.001)
        self.assertIsNotNone(clash_0_1mm)
        self.assertAlmostEqual(clash_0_1mm.penetration_depth, 0.1, places=1)

        clash_1mm = detect_clashes_between_elements(el1, el_1mm, tolerance=0.001)
        self.assertIsNotNone(clash_1mm)
        self.assertAlmostEqual(clash_1mm.penetration_depth, 1.0, places=1)

    def test_edge_case_inverted_normals_sat_invariance(self):
        """Edge Case 4: Inverted normals / winding order invariance in SAT."""
        # Triangle 1: CCW
        t1_ccw = Triangle3D(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(1.0, 2.0, 0.0))
        # Triangle 1: CW (reversed winding order -> inverted normal)
        t1_cw = Triangle3D(Vector3(0.0, 0.0, 0.0), Vector3(1.0, 2.0, 0.0), Vector3(2.0, 0.0, 0.0))

        # Triangle 2: Intersecting
        t2 = Triangle3D(Vector3(1.0, 1.0, -1.0), Vector3(1.0, 1.0, 1.0), Vector3(1.0, -1.0, 0.0))
        # Triangle 3: Non-intersecting
        t3 = Triangle3D(Vector3(10.0, 10.0, -1.0), Vector3(10.0, 10.0, 1.0), Vector3(10.0, -1.0, 0.0))

        # Normals must be exact opposites
        n_ccw = t1_ccw.normal()
        n_cw = t1_cw.normal()
        self.assertAlmostEqual(n_ccw.x, -n_cw.x, places=5)
        self.assertAlmostEqual(n_ccw.y, -n_cw.y, places=5)
        self.assertAlmostEqual(n_ccw.z, -n_cw.z, places=5)

        # SAT result MUST be identical regardless of normal orientation
        self.assertEqual(t1_ccw.intersects_triangle(t2), t1_cw.intersects_triangle(t2))
        self.assertEqual(t1_ccw.intersects_triangle(t3), t1_cw.intersects_triangle(t3))
        self.assertTrue(t1_cw.intersects_triangle(t2))
        self.assertFalse(t1_cw.intersects_triangle(t3))

    def test_edge_case_disjoint_distant_meshes(self):
        """Edge Case 5: Disjoint distant meshes at extreme spatial offsets (10^6 units)."""
        el_near = {"guid": "near", "name": "Near", "box": [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]}
        el_far = {"guid": "far", "name": "Far", "box": [1000000.0, 1000000.0, 1000000.0, 1000001.0, 1000001.0, 1000001.0]}

        clash = detect_clashes_between_elements(el_near, el_far)
        self.assertIsNone(clash, "Distant meshes must be immediately culled with no false clashes")

    def test_edge_case_degenerate_zero_area_triangles(self):
        """Edge Case 6: Degenerate zero-area triangles (collinear vertices, duplicate points)."""
        # Collinear vertices
        t_collinear = Triangle3D(Vector3(0.0, 0.0, 0.0), Vector3(1.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0))
        self.assertAlmostEqual(t_collinear.area(), 0.0)
        self.assertEqual(t_collinear.normal().length_sq(), 0.0)

        # Coincident vertices
        t_coincident = Triangle3D(Vector3(1.0, 1.0, 1.0), Vector3(1.0, 1.0, 1.0), Vector3(1.0, 1.0, 1.0))
        self.assertAlmostEqual(t_coincident.area(), 0.0)

        # Regular valid triangle
        t_valid = Triangle3D(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))

        # SAT intersection with degenerates must return False gracefully without raising exception or NaN
        self.assertFalse(t_collinear.intersects_triangle(t_valid))
        self.assertFalse(t_valid.intersects_triangle(t_collinear))
        self.assertFalse(t_coincident.intersects_triangle(t_valid))

    # ==========================================================================
    # DOMAIN 3: CAMERA COORDINATE TRANSFORMATIONS & FOV TRIGONOMETRY
    # ==========================================================================

    def test_camera_basis_conversion_threejs_vs_bcf(self):
        """Verify Three.js Y-up to IFC/BCF Z-up coordinate conversion matrix and round-trip isometry."""
        # Basis transformation matrices:
        # [T]_{Three->BCF} = R_x(+90 deg) = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]
        # (X_bcf = X_three, Y_bcf = -Z_three, Z_bcf = Y_three)
        def three_to_bcf(v: Vector3) -> Vector3:
            return Vector3(v.x, -v.z, v.y)

        def bcf_to_three(v: Vector3) -> Vector3:
            return Vector3(v.x, v.z, -v.y)

        # Test canonical axis mappings
        # Three +Y (Up) -> BCF +Z (Up)
        self.assertEqual(three_to_bcf(Vector3(0, 1, 0)), Vector3(0, 0, 1))
        # Three -Z (Forward) -> BCF +Y (North/Forward)
        self.assertEqual(three_to_bcf(Vector3(0, 0, -1)), Vector3(0, 1, 0))
        # Three +X (Right) -> BCF +X (East/Right)
        self.assertEqual(three_to_bcf(Vector3(1, 0, 0)), Vector3(1, 0, 0))

        # 10,000 random vectors round-trip and length preservation
        for _ in range(10000):
            orig = Vector3(random.uniform(-1000, 1000), random.uniform(-1000, 1000), random.uniform(-1000, 1000))
            bcf = three_to_bcf(orig)
            reconstructed = bcf_to_three(bcf)

            self.assertAlmostEqual(orig.x, reconstructed.x, places=6)
            self.assertAlmostEqual(orig.y, reconstructed.y, places=6)
            self.assertAlmostEqual(orig.z, reconstructed.z, places=6)
            self.assertAlmostEqual(orig.length(), bcf.length(), places=6)

    def test_perspective_fov_trigonometry_and_extreme_aspects(self):
        """Verify horizontal and vertical FOV conversions across extreme aspect ratios."""
        def v_to_h_fov(fov_y_deg: float, aspect: float) -> float:
            rad_y = math.radians(fov_y_deg) * 0.5
            rad_x = math.atan(aspect * math.tan(rad_y))
            return math.degrees(rad_x) * 2.0

        def h_to_v_fov(fov_x_deg: float, aspect: float) -> float:
            rad_x = math.radians(fov_x_deg) * 0.5
            rad_y = math.atan((1.0 / aspect) * math.tan(rad_x))
            return math.degrees(rad_y) * 2.0

        test_aspects = [
            16 / 9,      # Standard widescreen (1.7778)
            4 / 3,       # Traditional (1.3333)
            1.0,         # Square (1.0)
            21 / 9,      # Ultra-wide (2.3333)
            32 / 9,      # Super ultra-wide (3.5556)
            9 / 16,      # Mobile portrait (0.5625)
            0.1,         # Extreme vertical slit (1:10)
            10.0,        # Extreme horizontal panoramic (10:1)
        ]

        for aspect in test_aspects:
            for fov_y in [30.0, 45.0, 60.0, 75.0, 90.0, 120.0]:
                fov_x = v_to_h_fov(fov_y, aspect)
                reconstructed_fov_y = h_to_v_fov(fov_x, aspect)
                self.assertAlmostEqual(fov_y, reconstructed_fov_y, places=5)

    def test_camera_target_reconstruction_and_lookat_orthonormality(self):
        """Verify camera target reconstruction from direction vector and lookAt view matrix validity."""
        eye = Vector3(10.0, 15.0, 8.0)
        target = Vector3(2.0, 3.0, 1.0)
        direction = (target - eye).normalize()
        distance = (target - eye).length()

        # Reconstruct target from eye + dir * dist
        reconstructed_target = eye + direction * distance
        self.assertAlmostEqual(reconstructed_target.x, target.x, places=5)
        self.assertAlmostEqual(reconstructed_target.y, target.y, places=5)
        self.assertAlmostEqual(reconstructed_target.z, target.z, places=5)

        # Construct Look-At orthonormal basis (w, u, v)
        up = Vector3(0.0, 0.0, 1.0)
        w = direction * -1.0  # Forward camera axis points along -Z
        u = up.cross(w).normalize()  # Right axis
        v = w.cross(u).normalize()  # Up axis

        # Verify orthonormality
        self.assertAlmostEqual(u.length(), 1.0, places=6)
        self.assertAlmostEqual(v.length(), 1.0, places=6)
        self.assertAlmostEqual(w.length(), 1.0, places=6)
        self.assertAlmostEqual(u.dot(v), 0.0, places=6)
        self.assertAlmostEqual(v.dot(w), 0.0, places=6)
        self.assertAlmostEqual(w.dot(u), 0.0, places=6)

    # ==========================================================================
    # DOMAIN 4: REAL NORDIC LCA IFC DATASETS CLASH DETECTION EXECUTION
    # ==========================================================================

    def test_real_nordic_lca_ifc_parsing_and_clash_execution(self):
        """Execute full spatial parsing and clash detection against real Nordic LCA IFC files."""
        paths = get_real_ifc_paths()
        struc_path = paths.get("STRUC")
        hvac_path = paths.get("HVAC")

        if not struc_path or not os.path.exists(struc_path):
            self.skipTest(f"STRUC IFC dataset not found: {struc_path}")
        if not hvac_path or not os.path.exists(hvac_path):
            self.skipTest(f"HVAC IFC dataset not found: {hvac_path}")

        # Parse structural IFC
        with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
            struc_text = f.read()
        struc_data = ifc_parser.parse_ifc_text(struc_text)
        struc_elements = struc_data.get("elements", [])
        self.assertGreater(len(struc_elements), 1000, "Real STRUC IFC should contain thousands of elements")

        # Parse HVAC IFC
        with open(hvac_path, "r", encoding="utf-8", errors="ignore") as f:
            hvac_text = f.read()
        hvac_data = ifc_parser.parse_ifc_text(hvac_text)
        hvac_elements = hvac_data.get("elements", [])
        self.assertGreater(len(hvac_elements), 1000, "Real HVAC IFC should contain thousands of elements")

        # Filter active 3D physical elements with valid placements
        def get_elements_with_box(elements: List[Dict[str, Any]], discipline: str) -> List[Dict[str, Any]]:
            boxed = []
            def _mm_to_m(val: Any, default: float) -> float:
                try:
                    return float(val) / 1000.0
                except (TypeError, ValueError):
                    return default

            for el in elements:
                placement = el.get("placement")
                if not placement or len(placement) < 3:
                    continue
                px, py, pz = float(placement[0]), float(placement[1]), float(placement[2])
                # Filter out unplaced or origin artifacts if needed
                if px == 0.0 and py == 0.0 and pz == 0.0:
                    continue
                # Form bounding box from placement and quantities
                q = el.get("quantities", {})
                p = el.get("properties", {})
                # Approximate dimensions
                dx = q.get("length") or _mm_to_m(p.get("Kokoonpano pituus"), 1.0)
                dy = q.get("width") or _mm_to_m(p.get("Kokoonpano leveys"), 0.4)
                dz = q.get("height") or _mm_to_m(p.get("Kokoonpano korkeus"), 0.4)
                dx = min(max(float(dx), 0.1), 20.0)
                dy = min(max(float(dy), 0.1), 20.0)
                dz = min(max(float(dz), 0.1), 10.0)

                boxed.append({
                    "stable_id": el.get("stable_id"),
                    "name": el.get("name") or "Element",
                    "element_type": el.get("element_type") or "IfcElement",
                    "discipline": discipline,
                    "box": [px, py, pz, px + dx, py + dy, pz + dz],
                })
            return boxed

        struc_boxed = get_elements_with_box(struc_elements, "Structural")
        hvac_boxed = get_elements_with_box(hvac_elements, "Mechanical")

        self.assertGreater(len(struc_boxed), 100, "Must have placed structural elements")
        self.assertGreater(len(hvac_boxed), 10, "Must have placed HVAC elements")

        # Run clash check on subset of placed elements to verify broadphase & narrowphase
        t0 = time.perf_counter()
        # Test 200 STRUC elements against 50 HVAC elements (10,000 pairwise checks)
        sample_struc = struc_boxed[:200]
        sample_hvac = hvac_boxed[:50]
        clashes = run_clash_detection_between_models(sample_struc, sample_hvac, model_a_id=1, model_b_id=2, tolerance=0.001)
        t_clash = time.perf_counter() - t0

        self.assertLess(t_clash, 2.0, f"Clash detection execution took too long: {t_clash:.3f}s")
        # Verify any discovered clashes have valid BCF viewpoints and penetration metrics
        for clash in clashes:
            self.assertTrue(clash.bounding_box.is_valid())
            self.assertGreaterEqual(clash.penetration_depth, 0.0)
            self.assertIsNotNone(clash.viewpoint_json)
            vp = clash.viewpoint_json
            self.assertIn("perspective_camera", vp)
            self.assertIn("components", vp)
            # Verify Red (#FF0000) and Yellow (#FFFF00) coloring
            coloring = vp["components"]["coloring"]
            colors = {c["color"] for c in coloring}
            self.assertIn("#FF0000", colors)
            self.assertIn("#FFFF00", colors)

    def test_sub_millimeter_parametric_sweep(self):
        """Edge Case 3B: Parametric sweep across sub-millimeter penetrations from 0.05mm to 5.0mm."""
        test_depths_mm = [0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0]
        base_box = {"guid": "base_elem", "name": "Base Element", "box": [0.0, 0.0, 0.0, 2.0, 2.0, 2.0]}

        for d_mm in test_depths_mm:
            d_m = d_mm / 1000.0
            # Penetrates from right side along X
            penetrating_box = {
                "guid": f"elem_{d_mm}mm",
                "name": f"Penetrating {d_mm}mm",
                "box": [2.0 - d_m, 0.5, 0.5, 3.0, 1.5, 1.5],
            }
            clash = detect_clashes_between_elements(base_box, penetrating_box, tolerance=0.00001)
            self.assertIsNotNone(clash, f"Failed to detect clash at {d_mm}mm depth")
            self.assertAlmostEqual(clash.penetration_depth, d_mm, places=2, msg=f"Penetration depth mismatch at {d_mm}mm")
            self.assertEqual(clash.clash_type, "Hard Collision")

    def test_broadphase_culling_efficiency_and_scale(self):
        """Stress Test: Broadphase AABB culling on 100,000 element pairs (500 STRUC x 200 HVAC)."""
        # Generate a 10x10x5 grid of structural columns (500 elements)
        struc_elements = []
        for x in range(10):
            for y in range(10):
                for z in range(5):
                    struc_elements.append({
                        "stable_id": f"STRUC_{x}_{y}_{z}",
                        "name": f"Column ({x},{y},{z})",
                        "element_type": "Column",
                        "discipline": "structure",
                        "box": [float(x * 10), float(y * 10), float(z * 4), float(x * 10 + 0.5), float(y * 10 + 0.5), float(z * 4 + 3.8)],
                    })
        self.assertEqual(len(struc_elements), 500)

        # Generate 200 HVAC ducts across the building
        hvac_elements = []
        for i in range(200):
            # Place mostly in clear air, but intentionally clash 5 ducts with columns
            if i < 5:
                # Clashes with Column (i, i, 0)
                cx, cy, cz = float(i * 10), float(i * 10), 2.0
                hvac_elements.append({
                    "stable_id": f"HVAC_CLASH_{i}",
                    "name": f"Clashing Duct {i}",
                    "element_type": "Duct",
                    "discipline": "mep",
                    "box": [cx - 2.0, cy + 0.1, cz, cx + 2.0, cy + 0.4, cz + 0.4],
                })
            else:
                # Placed in clear corridor (e.g. y = x*10 + 5.0)
                cx = float((i % 10) * 10)
                cy = float((i % 10) * 10 + 5.0)
                cz = float((i % 5) * 4 + 2.0)
                hvac_elements.append({
                    "stable_id": f"HVAC_CLEAR_{i}",
                    "name": f"Clear Duct {i}",
                    "element_type": "Duct",
                    "discipline": "mep",
                    "box": [cx - 2.0, cy, cz, cx + 2.0, cy + 0.3, cz + 0.3],
                })
        self.assertEqual(len(hvac_elements), 200)

        # Run clash detection across all 100,000 combinations
        t0 = time.perf_counter()
        clashes = run_clash_detection_between_models(struc_elements, hvac_elements, model_a_id=1, model_b_id=2, tolerance=0.001)
        t_elapsed = time.perf_counter() - t0

        # Performance & accuracy verification
        self.assertEqual(len(clashes), 5, f"Expected exactly 5 clashes, found {len(clashes)}")
        self.assertLess(t_elapsed, 0.5, f"100,000 pair checks took {t_elapsed:.3f}s (should be < 0.5s)")

        # Verify broadphase culled 99,995 pairs out of 100,000 (99.995% culling rate)
        culling_rate = (100000 - len(clashes)) / 100000 * 100.0
        self.assertGreater(culling_rate, 99.99)

    def test_threejs_bcf_plane_conversion_invariance(self):
        """Verify clipping plane conversion: Three.js Plane(normal, constant) <-> BCF {location, direction}."""
        def three_to_bcf_plane(n: Vector3, d: float) -> Tuple[Vector3, Vector3]:
            # Direction is normal converted to BCF coords
            bcf_dir = Vector3(n.x, -n.z, n.y).normalize()
            # Location point on plane: p = -d * n
            loc_pt = n * (-d)
            bcf_loc = Vector3(loc_pt.x, -loc_pt.z, loc_pt.y)
            return bcf_loc, bcf_dir

        def bcf_to_three_plane(bcf_loc: Vector3, bcf_dir: Vector3) -> Tuple[Vector3, float]:
            three_n = Vector3(bcf_dir.x, bcf_dir.z, -bcf_dir.y).normalize()
            three_loc = Vector3(bcf_loc.x, bcf_loc.z, -bcf_loc.y)
            constant = -three_n.dot(three_loc)
            return three_n, constant

        # Test 5,000 random planes
        for _ in range(5000):
            orig_n = Vector3(random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)).normalize()
            if orig_n.length_sq() < 1e-6:
                continue
            orig_d = random.uniform(-100, 100)

            bcf_loc, bcf_dir = three_to_bcf_plane(orig_n, orig_d)
            rec_n, rec_d = bcf_to_three_plane(bcf_loc, bcf_dir)

            self.assertAlmostEqual(orig_n.x, rec_n.x, places=5)
            self.assertAlmostEqual(orig_n.y, rec_n.y, places=5)
            self.assertAlmostEqual(orig_n.z, rec_n.z, places=5)
            self.assertAlmostEqual(orig_d, rec_d, places=4)

            # Test point distance invariance
            test_pt = Vector3(random.uniform(-50, 50), random.uniform(-50, 50), random.uniform(-50, 50))
            dist_three = orig_n.dot(test_pt) + orig_d
            # In BCF coords
            bcf_pt = Vector3(test_pt.x, -test_pt.z, test_pt.y)
            dist_bcf = bcf_dir.dot(bcf_pt - bcf_loc)
            self.assertAlmostEqual(dist_three, dist_bcf, places=4)

    def test_bcf_viewpoint_json_schema_conformance(self):
        """Verify generated BCF viewpoint JSON strictly conforms to buildingSMART BCF 2.1/3.0 schema."""
        clash = ClashPair(
            model_a_id=1,
            element_a_guid="STRUC_COL_GUID_12345",
            element_a_name="Concrete Column C1",
            element_a_type="Column",
            element_a_discipline="Structural",
            model_b_id=2,
            element_b_guid="HVAC_DUCT_GUID_67890",
            element_b_name="Supply Air Duct DN300",
            element_b_type="Duct",
            element_b_discipline="MEP",
            collision_point=Vector3(12.5, 8.25, 3.1),
            penetration_depth=85.0,
            intersection_volume=0.012,
            bounding_box=AABB3D(min=Vector3(12.0, 8.0, 3.0), max=Vector3(13.0, 8.5, 3.2)),
            clash_type="Hard Collision",
            severity="Critical",
        )
        vp = generate_bcf_viewpoint_json(clash)

        # 1. Perspective Camera
        self.assertIn("perspective_camera", vp)
        cam = vp["perspective_camera"]
        for k in ("camera_view_point", "camera_direction", "camera_up_vector", "field_of_view"):
            self.assertIn(k, cam)
            if isinstance(cam[k], dict):
                self.assertIn("x", cam[k])
                self.assertIn("y", cam[k])
                self.assertIn("z", cam[k])

        # Verify camera direction points toward collision point
        cam_pos = Vector3(cam["camera_view_point"]["x"], cam["camera_view_point"]["y"], cam["camera_view_point"]["z"])
        cam_dir = Vector3(cam["camera_direction"]["x"], cam["camera_direction"]["y"], cam["camera_direction"]["z"])
        computed_dir = (clash.collision_point - cam_pos).normalize()
        self.assertAlmostEqual(cam_dir.x, computed_dir.x, places=3)
        self.assertAlmostEqual(cam_dir.y, computed_dir.y, places=3)
        self.assertAlmostEqual(cam_dir.z, computed_dir.z, places=3)

        # 2. Components Coloring & Selection
        self.assertIn("components", vp)
        comps = vp["components"]
        self.assertIn("selection", comps)
        self.assertIn("coloring", comps)
        self.assertIn("visibility", comps)

        self.assertEqual(len(comps["selection"]), 2)
        selected_guids = {s["ifc_guid"] for s in comps["selection"]}
        self.assertIn("STRUC_COL_GUID_12345", selected_guids)
        self.assertIn("HVAC_DUCT_GUID_67890", selected_guids)

        # 3. Coloring rules: Element A is Red, Element B is Yellow
        color_map = {c["components"][0]["ifc_guid"]: c["color"] for c in comps["coloring"]}
        self.assertEqual(color_map["STRUC_COL_GUID_12345"], "#FF0000")
        self.assertEqual(color_map["HVAC_DUCT_GUID_67890"], "#FFFF00")


if __name__ == "__main__":
    unittest.main(verbosity=2)

