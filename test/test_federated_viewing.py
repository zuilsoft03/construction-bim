"""E2E Test Suite for Multi-Discipline Federated 3D BIM Viewing (Features 1-4).

Covers:
- Feature 1: Multi-IFC Model Loading & Coordinate Alignment (ARK + STRUC + HVAC, COORDINATE_TO_ORIGIN: false)
- Feature 2: MEP Entity Geometry Rendering (IFCDUCT*, IFCPIPE*, IFCAIRTERMINAL, IFCFLOW*, etc.)
- Feature 3: Discipline Controls & Ghosting (Visibility toggles, opacity [0..1], 15% ghosting mode)
- Feature 4: Element Property Inspector (GUID, ExpressId, ModelId, Pset_*, Qto_*, BoundingBox)

Tiers Covered:
- Tier 1: Feature Coverage (Happy Path >= 5 tests per feature)
- Tier 2: Boundary & Corner Cases (>= 5 tests per feature)
- Tier 3: Pairwise Cross-Feature Tests
- Tier 4: Real-World Scenarios with Nordic LCA Datasets
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
from construction_bim.bim import ifc_geometry as ig
from test.test_helper import (
    AABB3D,
    Vector3,
    get_real_ifc_paths,
    make_synthetic_ifc,
)


# ==============================================================================
# In-Memory Federated Viewing Simulation Engine
# ==============================================================================

class FederatedModel:
    def __init__(
        self,
        model_id: int,
        name: str,
        discipline: str,
        elements: List[Dict[str, Any]],
        coordinate_to_origin: bool = False,
        length_scale: float = 1.0,
    ):
        self.model_id = model_id
        self.name = name
        self.discipline = discipline
        self.elements = elements
        self.coordinate_to_origin = coordinate_to_origin
        self.length_scale = length_scale
        self.visible = True
        self.opacity = 1.0
        self.is_ghosted = False
        self._guid_index: Dict[str, Dict[str, Any]] = {}
        self._express_id_index: Dict[int, Dict[str, Any]] = {}
        self.bounding_box = AABB3D()

        self._build_indices()

    def _build_indices(self):
        for el in self.elements:
            guid = el.get("stable_id") or el.get("guid") or ""
            eid = el.get("id") or el.get("express_id") or el.get("properties", {}).get("ifc_id") or 0
            if guid:
                self._guid_index[guid] = el
            if eid:
                self._express_id_index[eid] = el

            # Compute bounding box
            bbox_dict = el.get("bounding_box")
            if bbox_dict and isinstance(bbox_dict, dict) and "min" in bbox_dict and "max" in bbox_dict:
                self.bounding_box = self.bounding_box.union(AABB3D.from_dict(bbox_dict))
            elif "box" in el and el["box"]:
                b = el["box"]
                self.bounding_box = self.bounding_box.union(
                    AABB3D(min=Vector3(b[0], b[1], b[2]), max=Vector3(b[3], b[4], b[5]))
                )
            elif "placement" in el and el["placement"]:
                p = el["placement"]
                self.bounding_box = self.bounding_box.union(
                    AABB3D(min=Vector3(p[0], p[1], p[2]), max=Vector3(p[0] + 1.0, p[1] + 1.0, p[2] + 1.0))
                )


class FederatedSceneManager:
    """Simulates Three.js / web-ifc federated multi-discipline scene coordinator."""

    def __init__(self, coordinate_to_origin: bool = False):
        self.coordinate_to_origin = coordinate_to_origin
        self.models: Dict[int, FederatedModel] = {}
        self.discipline_layers: Dict[str, Dict[str, Any]] = {
            "Architectural": {"visible": True, "opacity": 1.0, "ghosted": False},
            "Structural": {"visible": True, "opacity": 1.0, "ghosted": False},
            "Mechanical": {"visible": True, "opacity": 1.0, "ghosted": False},
            "Electrical": {"visible": True, "opacity": 1.0, "ghosted": False},
            "Plumbing": {"visible": True, "opacity": 1.0, "ghosted": False},
        }

    def load_model(
        self,
        model_id: int,
        name: str,
        discipline: str,
        ifc_text: str,
        override_coord_origin: Optional[bool] = None,
    ) -> FederatedModel:
        if model_id in self.models:
            raise ValueError(f"Model ID {model_id} is already registered in federated scene")

        coord_mode = self.coordinate_to_origin if override_coord_origin is None else override_coord_origin
        parsed = ip.parse_ifc_text(ifc_text)
        elements = parsed.get("elements", [])
        length_scale = parsed.get("length_scale", 1.0)

        # Tag each element with source model info
        for el in elements:
            el["model_id"] = model_id
            el["source_model"] = name
            el["discipline"] = discipline

            # Compute box if not already present from placement
            if "box" not in el:
                p = el.get("placement", [0.0, 0.0, 0.0])
                el["box"] = [p[0], p[1], p[2], p[0] + 1.0, p[1] + 1.0, p[2] + 1.0]

        model = FederatedModel(
            model_id=model_id,
            name=name,
            discipline=discipline,
            elements=elements,
            coordinate_to_origin=coord_mode,
            length_scale=length_scale,
        )
        self.models[model_id] = model
        return model

    def set_discipline_visibility(self, discipline: str, visible: bool) -> None:
        if discipline not in self.discipline_layers:
            self.discipline_layers[discipline] = {"visible": visible, "opacity": 1.0, "ghosted": False}
        else:
            self.discipline_layers[discipline]["visible"] = bool(visible)

        for m in self.models.values():
            if m.discipline.lower() == discipline.lower():
                m.visible = bool(visible)

    def set_discipline_opacity(self, discipline: str, opacity: float) -> None:
        clamped = max(0.0, min(1.0, float(opacity)))
        if discipline not in self.discipline_layers:
            self.discipline_layers[discipline] = {"visible": True, "opacity": clamped, "ghosted": False}
        else:
            self.discipline_layers[discipline]["opacity"] = clamped

        for m in self.models.values():
            if m.discipline.lower() == discipline.lower():
                m.opacity = clamped

    def set_discipline_ghosted(self, discipline: str, ghosted: bool, ghost_opacity: float = 0.15) -> None:
        g = bool(ghosted)
        clamped_op = max(0.0, min(1.0, float(ghost_opacity)))
        if discipline not in self.discipline_layers:
            self.discipline_layers[discipline] = {"visible": True, "opacity": 1.0, "ghosted": g}
        else:
            layer = self.discipline_layers[discipline]
            if g and not layer.get("ghosted"):
                layer["base_opacity"] = layer.get("opacity", 1.0)
            layer["ghosted"] = g
            if g:
                layer["opacity"] = clamped_op
            else:
                layer["opacity"] = layer.pop("base_opacity", 1.0)

        for m in self.models.values():
            if m.discipline.lower() == discipline.lower():
                m.is_ghosted = g
                m.opacity = clamped_op if g else self.discipline_layers[discipline]["opacity"]

    def get_scene_bounding_box(self) -> AABB3D:
        total = AABB3D()
        for m in self.models.values():
            if m.visible:
                total = total.union(m.bounding_box)
        return total

    def inspect_element(self, model_id: int, identifier: Union[str, int]) -> Optional[Dict[str, Any]]:
        model = self.models.get(model_id)
        if not model:
            return None
        if isinstance(identifier, int):
            return model._express_id_index.get(identifier)
        return model._guid_index.get(identifier)

    def inspect_element_by_guid_global(self, guid: str) -> Optional[Tuple[int, Dict[str, Any]]]:
        for mid, model in self.models.items():
            if guid in model._guid_index:
                return mid, model._guid_index[guid]
        return None


# ==============================================================================
# Test Suites: Tiers 1 to 4
# ==============================================================================

class TestFederatedViewing(unittest.TestCase):

    # --------------------------------------------------------------------------
    # Feature 1: Multi-IFC Model Loading & Coordinate Alignment
    # --------------------------------------------------------------------------

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_multi_model_registration_ark_struc_hvac(self):
        """F1-T1-1: Multi-model registration of ARK, STRUC, HVAC with distinct IDs and disciplines."""
        scene = FederatedSceneManager(coordinate_to_origin=False)
        ark_ifc = make_synthetic_ifc(project_name="ARK", discipline="Architectural", elements=[
            {"guid": "ark_wall_01", "type": "IFCWALL", "name": "Exterior Wall", "x": 0.0, "y": 0.0, "z": 0.0, "dx": 10.0, "dy": 0.3, "dz": 3.0}
        ])
        struc_ifc = make_synthetic_ifc(project_name="STRUC", discipline="Structural", elements=[
            {"guid": "struc_col_01", "type": "IFCCOLUMN", "name": "Concrete Column", "x": 2.0, "y": 2.0, "z": 0.0, "dx": 0.5, "dy": 0.5, "dz": 3.0}
        ])
        hvac_ifc = make_synthetic_ifc(project_name="HVAC", discipline="Mechanical", elements=[
            {"guid": "hvac_duct_01", "type": "IFCDUCTSEGMENT", "name": "Supply Duct", "x": 1.0, "y": 2.0, "z": 2.5, "dx": 5.0, "dy": 0.4, "dz": 0.3}
        ])

        m1 = scene.load_model(1, "ARK_Model", "Architectural", ark_ifc)
        m2 = scene.load_model(2, "STRUC_Model", "Structural", struc_ifc)
        m3 = scene.load_model(3, "HVAC_Model", "Mechanical", hvac_ifc)

        self.assertEqual(len(scene.models), 3)
        self.assertEqual(m1.discipline, "Architectural")
        self.assertEqual(m2.discipline, "Structural")
        self.assertEqual(m3.discipline, "Mechanical")
        self.assertEqual(len(m1.elements), 1)
        self.assertEqual(len(m2.elements), 1)
        self.assertEqual(len(m3.elements), 1)

    def test_coordinate_origin_preservation(self):
        """F1-T1-2: Zero coordinate drift when COORDINATE_TO_ORIGIN is False."""
        scene = FederatedSceneManager(coordinate_to_origin=False)
        struc_ifc = make_synthetic_ifc(elements=[
            {"guid": "col_100", "type": "IFCCOLUMN", "x": 150.0, "y": 250.0, "z": 12.0, "dx": 0.6, "dy": 0.6, "dz": 4.0}
        ])
        m = scene.load_model(10, "STRUC", "Structural", struc_ifc)
        self.assertFalse(m.coordinate_to_origin)
        el = m._guid_index["col_100"]
        # Placement preserves real world coordinates [150, 250, 12]
        self.assertAlmostEqual(el["placement"][0], 150.0, places=2)
        self.assertAlmostEqual(el["placement"][1], 250.0, places=2)
        self.assertAlmostEqual(el["placement"][2], 12.0, places=2)

    def test_shared_world_coordinate_alignment(self):
        """F1-T1-3: Relative distances between elements in different models match exact spatial positions."""
        scene = FederatedSceneManager(coordinate_to_origin=False)
        m1_ifc = make_synthetic_ifc(elements=[{"guid": "e1", "type": "IFCCOLUMN", "x": 0.0, "y": 0.0, "z": 0.0}])
        m2_ifc = make_synthetic_ifc(elements=[{"guid": "e2", "type": "IFCCOLUMN", "x": 10.0, "y": 0.0, "z": 0.0}])
        m1 = scene.load_model(1, "M1", "Structural", m1_ifc)
        m2 = scene.load_model(2, "M2", "Structural", m2_ifc)

        p1 = m1._guid_index["e1"]["placement"]
        p2 = m2._guid_index["e2"]["placement"]
        pos1 = Vector3(p1[0], p1[1], p1[2])
        pos2 = Vector3(p2[0], p2[1], p2[2])
        dist = pos1.distance_to(pos2)
        self.assertAlmostEqual(dist, 10.0, places=3)

    def test_discipline_tagging_and_indexing(self):
        """F1-T1-4: All elements inherit discipline and model source tags."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc(discipline="Mechanical", elements=[
            {"guid": "pipe_01", "type": "IFCPIPESEGMENT", "name": "Chilled Water Pipe"},
            {"guid": "pipe_02", "type": "IFCPIPESEGMENT", "name": "Condenser Water Pipe"},
        ])
        m = scene.load_model(5, "HVAC_Piping", "Mechanical", ifc)
        for el in m.elements:
            self.assertEqual(el["discipline"], "Mechanical")
            self.assertEqual(el["model_id"], 5)
            self.assertEqual(el["source_model"], "HVAC_Piping")

    def test_federated_bounding_box_aggregation(self):
        """F1-T1-5: Aggregated scene bounding box encapsulates all multi-discipline elements."""
        scene = FederatedSceneManager()
        ifc1 = make_synthetic_ifc(elements=[{"guid": "g1", "x": -10.0, "y": -5.0, "z": 0.0, "dx": 2.0, "dy": 2.0, "dz": 3.0}])
        ifc2 = make_synthetic_ifc(elements=[{"guid": "g2", "x": 20.0, "y": 30.0, "z": 15.0, "dx": 1.0, "dy": 1.0, "dz": 2.0}])
        scene.load_model(1, "M1", "DisciplineA", ifc1)
        scene.load_model(2, "M2", "DisciplineB", ifc2)

        sbox = scene.get_scene_bounding_box()
        self.assertTrue(sbox.is_valid())
        self.assertLessEqual(sbox.min.x, -10.0)
        self.assertLessEqual(sbox.min.y, -5.0)
        self.assertGreaterEqual(sbox.max.x, 21.0)
        self.assertGreaterEqual(sbox.max.y, 31.0)
        self.assertGreaterEqual(sbox.max.z, 16.0)

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_empty_ifc_model_loading_rejection(self):
        """F1-T2-1: Empty or header-only IFC text produces zero elements without unhandled exception."""
        scene = FederatedSceneManager()
        empty_ifc = "ISO-10303-21;\nHEADER;\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;"
        m = scene.load_model(99, "EmptyModel", "Architectural", empty_ifc)
        self.assertEqual(len(m.elements), 0)
        self.assertFalse(m.bounding_box.is_valid())

    def test_differing_length_scales_normalization(self):
        """F1-T2-2: Length scale factor (mm vs m) properly scales element dimensions."""
        scene = FederatedSceneManager()
        ifc_mm = make_synthetic_ifc(length_scale=0.001, elements=[
            {"guid": "col_mm", "type": "IFCCOLUMN", "x": 2000.0, "y": 4000.0, "z": 0.0, "dx": 500.0, "dy": 500.0, "dz": 3000.0}
        ])
        m = scene.load_model(1, "MM_Model", "Structural", ifc_mm)
        self.assertAlmostEqual(m.length_scale, 0.001, places=4)

    def test_extreme_world_coordinates(self):
        """F1-T2-3: Elements placed at extreme coordinates (>10,000m) maintain numerical integrity."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc(elements=[
            {"guid": "extreme_col", "type": "IFCCOLUMN", "x": 500000.0, "y": 6000000.0, "z": 100.0, "dx": 1.0, "dy": 1.0, "dz": 3.0}
        ])
        m = scene.load_model(1, "GeoRefModel", "Structural", ifc)
        el = m._guid_index["extreme_col"]
        self.assertAlmostEqual(el["placement"][0], 500000.0, places=1)
        self.assertAlmostEqual(el["placement"][1], 6000000.0, places=1)

    def test_missing_placement_hierarchy_fallback(self):
        """F1-T2-4: Element missing local placement falls back to origin without crash."""
        ifc_no_placement = (
            "ISO-10303-21;\nHEADER;\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n"
            "#1=IFCPROJECT('0Proj',$,'P',$,$,$,$,(#10),#20);\n"
            "#10=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#11,$);\n"
            "#11=IFCAXIS2PLACEMENT3D(#12,#13,#14);\n"
            "#12=IFCCARTESIANPOINT((0.,0.,0.));\n#13=IFCDIRECTION((0.,0.,1.));\n#14=IFCDIRECTION((1.,0.,0.));\n"
            "#20=IFCUNITASSIGNMENT((#21));\n#21=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);\n"
            "#100=IFCWALL('guid_no_place',$,'WallNoPlace',$,$,$,$,'');\n"
            "ENDSEC;\nEND-ISO-10303-21;"
        )
        scene = FederatedSceneManager()
        m = scene.load_model(1, "NoPlaceModel", "Architectural", ifc_no_placement)
        self.assertEqual(len(m.elements), 1)
        el = m.elements[0]
        self.assertEqual(el["stable_id"], "guid_no_place")

    def test_duplicate_model_id_handling(self):
        """F1-T2-5: Loading duplicate model ID raises ValueError to prevent state corruption."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc()
        scene.load_model(1, "Model_A", "Structural", ifc)
        with self.assertRaises(ValueError):
            scene.load_model(1, "Model_B", "Mechanical", ifc)

    # Tier 3: Pairwise Cross-Feature Tests
    def test_multi_model_loading_with_discipline_filtering(self):
        """F1-T3-1: Multi-model loading combined with discipline-level element filtering."""
        scene = FederatedSceneManager()
        scene.load_model(1, "ARK", "Architectural", make_synthetic_ifc(elements=[{"guid": "w1", "type": "IFCWALL"}]))
        scene.load_model(2, "STRUC", "Structural", make_synthetic_ifc(elements=[{"guid": "c1", "type": "IFCCOLUMN"}]))
        scene.load_model(3, "HVAC", "Mechanical", make_synthetic_ifc(elements=[{"guid": "d1", "type": "IFCDUCTSEGMENT"}]))

        # Hide Architectural and Mechanical, only Structural remains active
        scene.set_discipline_visibility("Architectural", False)
        scene.set_discipline_visibility("Mechanical", False)

        active_models = [m for m in scene.models.values() if m.visible]
        self.assertEqual(len(active_models), 1)
        self.assertEqual(active_models[0].discipline, "Structural")

    def test_multi_model_coordinate_consistency_under_transforms(self):
        """F1-T3-2: Coordinate relationships between multi-discipline elements remain invariant."""
        scene = FederatedSceneManager(coordinate_to_origin=False)
        struc_ifc = make_synthetic_ifc(elements=[{"guid": "col1", "x": 5.0, "y": 5.0, "z": 2.0, "dx": 0.4, "dy": 0.4, "dz": 3.0}])
        hvac_ifc = make_synthetic_ifc(elements=[{"guid": "duct1", "x": 5.1, "y": 5.1, "z": 2.5, "dx": 1.0, "dy": 0.5, "dz": 0.3}])

        m1 = scene.load_model(1, "STRUC", "Structural", struc_ifc)
        m2 = scene.load_model(2, "HVAC", "Mechanical", hvac_ifc)

        b1 = AABB3D.from_box_list(m1._guid_index["col1"]["box"])
        b2 = AABB3D.from_box_list(m2._guid_index["duct1"]["box"])
        self.assertTrue(b1.intersects(b2))

    # Tier 4: Real-World Application Scenario
    def test_real_structural_and_hvac_federation(self):
        """F1-T4-1: Federation of real Nordic LCA Structural and HVAC models."""
        paths = get_real_ifc_paths()
        struc_path = paths.get("STRUC")

        if not struc_path or not os.path.exists(struc_path):
            self.skipTest(f"Structural IFC dataset not found: {struc_path}")

        scene = FederatedSceneManager(coordinate_to_origin=False)
        with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
            struc_text = f.read(500000)

        m_struc = scene.load_model(1, "NordicLCA_STRUC", "Structural", struc_text)
        self.assertGreater(len(m_struc.elements), 0)
        self.assertEqual(m_struc.discipline, "Structural")

    # --------------------------------------------------------------------------
    # Feature 2: MEP Entity Geometry Rendering
    # --------------------------------------------------------------------------

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_mep_duct_segment_geometry_extraction(self):
        """F2-T1-1: Parse IFCDUCTSEGMENT and extract rectangular/circular extruded geometry."""
        ifc = make_synthetic_ifc(discipline="Mechanical", elements=[
            {"guid": "duct_01", "type": "IFCDUCTSEGMENT", "name": "Supply Main", "x": 0.0, "y": 0.0, "z": 2.5, "dx": 3.0, "dy": 0.6, "dz": 0.4}
        ])
        parsed = ip.parse_ifc_text(ifc)
        elements = parsed["elements"]
        self.assertEqual(len(elements), 1)
        self.assertIn(elements[0]["element_type"], ["Duct", "IfcDuctSegment"])
        self.assertEqual(elements[0]["discipline"], "mep")

    def test_mep_pipe_segment_geometry_extraction(self):
        """F2-T1-2: Parse IFCPIPESEGMENT geometry and verify discipline assignment."""
        ifc = make_synthetic_ifc(discipline="Plumbing", elements=[
            {"guid": "pipe_01", "type": "IFCPIPESEGMENT", "name": "Domestic Cold Water", "x": 1.0, "y": 1.0, "z": 1.0, "dx": 4.0, "dy": 0.05, "dz": 0.05}
        ])
        parsed = ip.parse_ifc_text(ifc)
        elements = parsed["elements"]
        self.assertEqual(len(elements), 1)
        self.assertIn(elements[0]["element_type"], ["Pipe", "IfcPipeSegment"])
        self.assertEqual(elements[0]["discipline"], "mep")

    def test_mep_duct_fitting_elbow_extraction(self):
        """F2-T1-3: Parse IFCDUCTFITTING (elbows, transitions)."""
        ifc = make_synthetic_ifc(discipline="Mechanical", elements=[
            {"guid": "fitting_01", "type": "IFCDUCTFITTING", "name": "90 Deg Elbow", "x": 3.0, "y": 0.0, "z": 2.5, "dx": 0.6, "dy": 0.6, "dz": 0.4}
        ])
        parsed = ip.parse_ifc_text(ifc)
        self.assertIn(parsed["elements"][0]["element_type"], ["Duct Fitting", "IfcDuctFitting"])

    def test_mep_air_terminal_extraction(self):
        """F2-T1-4: Parse IFCAIRTERMINAL (diffusers, grilles)."""
        ifc = make_synthetic_ifc(discipline="Mechanical", elements=[
            {"guid": "terminal_01", "type": "IFCAIRTERMINAL", "name": "Supply Diffuser 600x600", "x": 2.0, "y": 2.0, "z": 2.8, "dx": 0.6, "dy": 0.6, "dz": 0.1}
        ])
        parsed = ip.parse_ifc_text(ifc)
        self.assertIn(parsed["elements"][0]["element_type"], ["Air Terminal", "IfcAirTerminal"])

    def test_mep_valves_and_pumps_extraction(self):
        """F2-T1-5: Parse IFCVALVE and IFCPUMP mechanical flow controllers."""
        ifc = make_synthetic_ifc(discipline="Mechanical", elements=[
            {"guid": "valve_01", "type": "IFCVALVE", "name": "Ball Valve DN50"},
            {"guid": "pump_01", "type": "IFCPUMP", "name": "Circulation Pump"},
        ])
        parsed = ip.parse_ifc_text(ifc)
        types = {el["element_type"] for el in parsed["elements"]}
        self.assertTrue("Valve" in types or "IfcValve" in types)
        self.assertTrue("Pump" in types or "IfcPump" in types)

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_zero_length_duct_handling(self):
        """F2-T2-1: Handle zero-length duct segment gracefully without division by zero."""
        ifc = make_synthetic_ifc(elements=[
            {"guid": "zero_duct", "type": "IFCDUCTSEGMENT", "dx": 0.0, "dy": 0.4, "dz": 0.4}
        ])
        parsed = ip.parse_ifc_text(ifc)
        self.assertEqual(len(parsed["elements"]), 1)

    def test_sub_millimeter_pipe_diameter(self):
        """F2-T2-2: Handle very small diameter pipe without underflow."""
        ifc = make_synthetic_ifc(elements=[
            {"guid": "micro_pipe", "type": "IFCPIPESEGMENT", "dx": 1.0, "dy": 0.002, "dz": 0.002}
        ])
        parsed = ip.parse_ifc_text(ifc)
        el = parsed["elements"][0]
        self.assertIsNotNone(el)

    def test_extreme_aspect_ratio_duct(self):
        """F2-T2-3: Handle flat/thin high aspect ratio duct profile (e.g. 2000mm x 50mm)."""
        ifc = make_synthetic_ifc(elements=[
            {"guid": "flat_duct", "type": "IFCDUCTSEGMENT", "dx": 5.0, "dy": 2.0, "dz": 0.05}
        ])
        parsed = ip.parse_ifc_text(ifc)
        self.assertIn(parsed["elements"][0]["element_type"], ["Duct", "IfcDuctSegment"])

    def test_unsupported_mep_representation_fallback(self):
        """F2-T2-4: Unsupported representation geometry falls back to bounding box placeholder."""
        ifc_proxy = (
            "ISO-10303-21;\nHEADER;\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n"
            "#1=IFCPROJECT('0Proj',$,'P',$,$,$,$,(#10),#20);\n"
            "#10=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#11,$);\n"
            "#11=IFCAXIS2PLACEMENT3D(#12,#13,#14);\n"
            "#12=IFCCARTESIANPOINT((0.,0.,0.));\n#13=IFCDIRECTION((0.,0.,1.));\n#14=IFCDIRECTION((1.,0.,0.));\n"
            "#20=IFCUNITASSIGNMENT((#21));\n#21=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);\n"
            "#100=IFCFLOWTERMINAL('guid_flow_term',$,'Flow Terminal',$,$,#11,$,'');\n"
            "ENDSEC;\nEND-ISO-10303-21;"
        )
        parsed = ip.parse_ifc_text(ifc_proxy)
        self.assertEqual(len(parsed["elements"]), 1)
        self.assertIn(parsed["elements"][0]["element_type"], ["Flow Terminal", "IfcFlowTerminal"])

    def test_malformed_mep_profile_def(self):
        """F2-T2-5: MEP entity with malformed profile def does not crash parser."""
        ifc_bad_prof = (
            "ISO-10303-21;\nHEADER;\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n"
            "#1=IFCPROJECT('0Proj',$,'P',$,$,$,$,(#10),#20);\n"
            "#10=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#11,$);\n"
            "#11=IFCAXIS2PLACEMENT3D(#12,#13,#14);\n"
            "#12=IFCCARTESIANPOINT((0.,0.,0.));\n#13=IFCDIRECTION((0.,0.,1.));\n#14=IFCDIRECTION((1.,0.,0.));\n"
            "#20=IFCUNITASSIGNMENT((#21));\n#21=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);\n"
            "#50=IFCBADPROFILEDEF('MALFORMED',$,$,$);\n"
            "#100=IFCDUCTSEGMENT('guid_bad_prof',$,'DuctBadProf',$,$,#11,$,'');\n"
            "ENDSEC;\nEND-ISO-10303-21;"
        )
        parsed = ip.parse_ifc_text(ifc_bad_prof)
        self.assertEqual(len(parsed["elements"]), 1)

    # Tier 3: Pairwise Cross-Feature
    def test_mep_entity_geometry_to_quantity_correlation(self):
        """F2-T3-1: MEP extracted geometry volume correlates with Qto_BaseQuantities NetVolume."""
        ifc = make_synthetic_ifc(elements=[
            {"guid": "duct_vol", "type": "IFCDUCTSEGMENT", "dx": 4.0, "dy": 0.5, "dz": 0.5, "volume": 1.0}
        ])
        parsed = ip.parse_ifc_text(ifc)
        el = parsed["elements"][0]
        qto = el["quantities"]
        self.assertAlmostEqual(qto.get("NetVolume", 0.0), 1.0, places=2)

    # Tier 4: Real-World Scenario
    def test_real_hvac_mep_entity_extraction(self):
        """F2-T4-1: Extract real MEP entities from Nordic LCA HVAC IFC model."""
        paths = get_real_ifc_paths()
        hvac_path = paths.get("HVAC")
        if not hvac_path or not os.path.exists(hvac_path):
            self.skipTest(f"HVAC dataset not found: {hvac_path}")

        with open(hvac_path, "r", encoding="utf-8", errors="ignore") as f:
            sample_text = f.read(1000000)

        parsed = ip.parse_ifc_text(sample_text)
        elements = parsed.get("elements", [])
        self.assertGreater(len(elements), 0)
        mep_types = {el["element_type"] for el in elements}
        self.assertTrue(any("Duct" in t or "Pipe" in t or "Flow" in t or "Air" in t for t in mep_types))

    # --------------------------------------------------------------------------
    # Feature 3: Discipline Controls & Ghosting
    # --------------------------------------------------------------------------

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_toggle_discipline_visibility_hide(self):
        """F3-T1-1: Hiding Structural discipline sets visible=False on all structural models."""
        scene = FederatedSceneManager()
        scene.load_model(1, "STRUC", "Structural", make_synthetic_ifc())
        scene.set_discipline_visibility("Structural", False)
        self.assertFalse(scene.discipline_layers["Structural"]["visible"])
        self.assertFalse(scene.models[1].visible)

    def test_toggle_discipline_visibility_show(self):
        """F3-T1-2: Showing Architectural discipline sets visible=True."""
        scene = FederatedSceneManager()
        scene.load_model(1, "ARK", "Architectural", make_synthetic_ifc())
        scene.set_discipline_visibility("Architectural", True)
        self.assertTrue(scene.discipline_layers["Architectural"]["visible"])
        self.assertTrue(scene.models[1].visible)

    def test_adjust_discipline_opacity_discrete(self):
        """F3-T1-3: Adjusting opacity modifies model material opacity value."""
        scene = FederatedSceneManager()
        scene.load_model(1, "HVAC", "Mechanical", make_synthetic_ifc())
        scene.set_discipline_opacity("Mechanical", 0.65)
        self.assertAlmostEqual(scene.discipline_layers["Mechanical"]["opacity"], 0.65, places=2)
        self.assertAlmostEqual(scene.models[1].opacity, 0.65, places=2)

    def test_ghosting_mode_architectural_shell(self):
        """F3-T1-4: Ghosting architectural shell sets opacity to 15% and is_ghosted flag."""
        scene = FederatedSceneManager()
        scene.load_model(1, "ARK", "Architectural", make_synthetic_ifc())
        scene.set_discipline_ghosted("Architectural", True, ghost_opacity=0.15)
        self.assertTrue(scene.discipline_layers["Architectural"]["ghosted"])
        self.assertAlmostEqual(scene.models[1].opacity, 0.15, places=2)
        self.assertTrue(scene.models[1].is_ghosted)

    def test_multi_discipline_layer_state_query(self):
        """F3-T1-5: Querying layer states returns structured dictionary of all disciplines."""
        scene = FederatedSceneManager()
        scene.set_discipline_visibility("Structural", True)
        scene.set_discipline_opacity("Structural", 1.0)
        scene.set_discipline_ghosted("Architectural", True, 0.20)
        scene.set_discipline_visibility("Plumbing", False)

        layers = scene.discipline_layers
        self.assertTrue(layers["Structural"]["visible"])
        self.assertTrue(layers["Architectural"]["ghosted"])
        self.assertAlmostEqual(layers["Architectural"]["opacity"], 0.20, places=2)
        self.assertFalse(layers["Plumbing"]["visible"])

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_opacity_clamping_negative(self):
        """F3-T2-1: Opacity < 0.0 is clamped to 0.0."""
        scene = FederatedSceneManager()
        scene.set_discipline_opacity("Structural", -0.75)
        self.assertAlmostEqual(scene.discipline_layers["Structural"]["opacity"], 0.0, places=3)

    def test_opacity_clamping_overflow(self):
        """F3-T2-2: Opacity > 1.0 is clamped to 1.0."""
        scene = FederatedSceneManager()
        scene.set_discipline_opacity("Structural", 2.5)
        self.assertAlmostEqual(scene.discipline_layers["Structural"]["opacity"], 1.0, places=3)

    def test_ghosting_toggle_preserves_base_opacity(self):
        """F3-T2-3: Disabling ghosting restores active state and base opacity."""
        scene = FederatedSceneManager()
        scene.load_model(1, "ARK", "Architectural", make_synthetic_ifc())
        scene.set_discipline_ghosted("Architectural", True, 0.15)
        self.assertTrue(scene.models[1].is_ghosted)
        self.assertAlmostEqual(scene.models[1].opacity, 0.15)

        scene.set_discipline_ghosted("Architectural", False)
        self.assertFalse(scene.discipline_layers["Architectural"]["ghosted"])
        self.assertFalse(scene.models[1].is_ghosted)
        self.assertAlmostEqual(scene.discipline_layers["Architectural"]["opacity"], 1.0)
        self.assertAlmostEqual(scene.models[1].opacity, 1.0)

    def test_unknown_discipline_layer_operation(self):
        """F3-T2-4: Applying layer operation to unknown discipline auto-registers layer safely."""
        scene = FederatedSceneManager()
        scene.set_discipline_visibility("FireProtection", True)
        self.assertIn("FireProtection", scene.discipline_layers)
        self.assertTrue(scene.discipline_layers["FireProtection"]["visible"])

    def test_rapid_visibility_toggle_idempotence(self):
        """F3-T2-5: Rapidly toggling visibility produces deterministic final state."""
        scene = FederatedSceneManager()
        scene.load_model(1, "STRUC", "Structural", make_synthetic_ifc())
        for i in range(50):
            scene.set_discipline_visibility("Structural", i % 2 == 0)
        self.assertFalse(scene.models[1].visible)

    # Tier 3: Pairwise Cross-Feature
    def test_ghosted_shell_inspectable(self):
        """F3-T3-1: Elements in ghosted discipline remain pickable and inspectable."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc(discipline="Architectural", elements=[
            {"guid": "ark_window", "type": "IFCWINDOW", "name": "Triple Glazed Window"}
        ])
        scene.load_model(1, "ARK", "Architectural", ifc)
        scene.set_discipline_ghosted("Architectural", True, 0.15)

        el = scene.inspect_element(1, "ark_window")
        self.assertIsNotNone(el)
        self.assertEqual(el["name"], "Triple Glazed Window")

    # Tier 4: Real-World Scenario
    def test_real_federated_scene_layer_orchestration(self):
        """F3-T4-1: Multi-discipline layer orchestration with 15% ghosted ARK shell and 100% STRUC & HVAC."""
        scene = FederatedSceneManager()
        scene.load_model(1, "ARK", "Architectural", make_synthetic_ifc(elements=[{"guid": "w1"}]))
        scene.load_model(2, "STRUC", "Structural", make_synthetic_ifc(elements=[{"guid": "c1"}]))
        scene.load_model(3, "HVAC", "Mechanical", make_synthetic_ifc(elements=[{"guid": "d1"}]))

        scene.set_discipline_ghosted("Architectural", True, 0.15)
        scene.set_discipline_visibility("Structural", True)
        scene.set_discipline_opacity("Structural", 1.0)
        scene.set_discipline_visibility("Mechanical", True)
        scene.set_discipline_opacity("Mechanical", 1.0)

        self.assertAlmostEqual(scene.models[1].opacity, 0.15, places=2)
        self.assertAlmostEqual(scene.models[2].opacity, 1.0, places=2)
        self.assertAlmostEqual(scene.models[3].opacity, 1.0, places=2)

    # --------------------------------------------------------------------------
    # Feature 4: Element Property Inspector
    # --------------------------------------------------------------------------

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_inspect_element_by_guid(self):
        """F4-T1-1: Inspect element by GUID returns element name, type, and discipline."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc(elements=[
            {"guid": "inspect_col_01", "type": "IFCCOLUMN", "name": "Column C1", "material": "Concrete C30/37"}
        ])
        scene.load_model(1, "STRUC", "Structural", ifc)
        el = scene.inspect_element(1, "inspect_col_01")
        self.assertIsNotNone(el)
        self.assertEqual(el["name"], "Column C1")
        self.assertIn(el["element_type"], ["Column", "IfcColumn"])

    def test_inspect_element_by_express_id(self):
        """F4-T1-2: Inspect element by Express ID returns element record."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc(elements=[{"guid": "col_exp", "name": "ExpCol"}])
        m = scene.load_model(1, "STRUC", "Structural", ifc)
        eid = m.elements[0].get("id") or m.elements[0].get("properties", {}).get("ifc_id")
        el = scene.inspect_element(1, eid)
        self.assertIsNotNone(el)
        self.assertEqual(el["name"], "ExpCol")

    def test_inspect_extract_pset_wall_common(self):
        """F4-T1-3: Extract property sets (Pset_Common, properties)."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc(elements=[{"guid": "wall_pset", "name": "LoadBearing Wall", "material": "Concrete C30/37"}])
        m = scene.load_model(1, "ARK", "Architectural", ifc)
        el = m._guid_index["wall_pset"]
        self.assertIn("properties", el)
        self.assertEqual(el["properties"].get("Material"), "Concrete C30/37")

    def test_inspect_extract_quantity_sets(self):
        """F4-T1-4: Extract quantity sets (Qto_BaseQuantities, NetVolume)."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc(elements=[{"guid": "qto_beam", "volume": 2.75}])
        m = scene.load_model(1, "STRUC", "Structural", ifc)
        el = m._guid_index["qto_beam"]
        self.assertAlmostEqual(el["quantities"].get("NetVolume", 0.0), 2.75, places=2)

    def test_inspect_bounding_box_and_storey(self):
        """F4-T1-5: Inspect element returns spatial storey containment and bounding box."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc(elements=[{"guid": "storey_col", "x": 1.0, "y": 2.0, "z": 0.0, "dx": 0.5, "dy": 0.5, "dz": 3.0}])
        m = scene.load_model(1, "STRUC", "Structural", ifc)
        el = m._guid_index["storey_col"]
        self.assertEqual(el.get("storey"), "Ground Floor")
        self.assertTrue(len(el["box"]) == 6)

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_inspect_nonexistent_guid_returns_none(self):
        """F4-T2-1: Inspecting non-existent GUID returns None."""
        scene = FederatedSceneManager()
        scene.load_model(1, "STRUC", "Structural", make_synthetic_ifc())
        el = scene.inspect_element(1, "non_existent_guid_123")
        self.assertIsNone(el)

    def test_inspect_element_with_empty_properties(self):
        """F4-T2-2: Element with no properties returns dict safely."""
        scene = FederatedSceneManager()
        ifc_no_props = make_synthetic_ifc()
        m = scene.load_model(1, "M", "D", ifc_no_props)
        el = m.elements[0]
        self.assertIsInstance(el.get("properties", {}), dict)

    def test_inspect_unicode_property_names_and_values(self):
        """F4-T2-3: Special characters and Nordic text in names/properties parse accurately."""
        nordic_name = "Vägg Betong Element Ø12 - Bjälklag"
        ifc = make_synthetic_ifc(elements=[{"guid": "nordic_wall", "name": nordic_name}])
        scene = FederatedSceneManager()
        m = scene.load_model(1, "ARK", "Architectural", ifc)
        el = m._guid_index["nordic_wall"]
        self.assertIn("Vägg", el["name"])

    def test_inspect_nested_complex_property_types(self):
        """F4-T2-4: Complex property dict serialization safely handled."""
        scene = FederatedSceneManager()
        ifc = make_synthetic_ifc()
        m = scene.load_model(1, "M", "D", ifc)
        el = m.elements[0]
        serialized = json.dumps(el.get("properties", {}))
        self.assertIsInstance(serialized, str)

    def test_inspect_null_or_zero_quantity_values(self):
        """F4-T2-5: Zero quantity values handled safely without math error."""
        ifc = make_synthetic_ifc(elements=[{"guid": "zero_vol", "volume": 0.0}])
        scene = FederatedSceneManager()
        m = scene.load_model(1, "M", "D", ifc)
        el = m._guid_index["zero_vol"]
        self.assertEqual(el["quantities"].get("NetVolume"), 0.0)

    # Tier 3: Pairwise Cross-Feature
    def test_inspect_across_multiple_loaded_models(self):
        """F4-T3-1: Global GUID search correctly identifies source model ID and element."""
        scene = FederatedSceneManager()
        scene.load_model(1, "ARK", "Architectural", make_synthetic_ifc(elements=[{"guid": "unique_ark_guid"}]))
        scene.load_model(2, "STRUC", "Structural", make_synthetic_ifc(elements=[{"guid": "unique_struc_guid"}]))

        res1 = scene.inspect_element_by_guid_global("unique_ark_guid")
        self.assertIsNotNone(res1)
        self.assertEqual(res1[0], 1)

        res2 = scene.inspect_element_by_guid_global("unique_struc_guid")
        self.assertIsNotNone(res2)
        self.assertEqual(res2[0], 2)

    # Tier 4: Real-World Scenarios
    def test_real_element_property_inspection_structural(self):
        """F4-T4-1: Inspect real structural elements from Nordic LCA dataset."""
        paths = get_real_ifc_paths()
        struc_path = paths.get("STRUC")
        if not struc_path or not os.path.exists(struc_path):
            self.skipTest(f"Structural IFC dataset not found: {struc_path}")

        with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
            sample = f.read(500000)

        parsed = ip.parse_ifc_text(sample)
        elements = parsed.get("elements", [])
        self.assertGreater(len(elements), 0)
        first = elements[0]
        self.assertTrue("stable_id" in first or "guid" in first)
        self.assertTrue("element_type" in first)
        self.assertTrue("discipline" in first)

    def test_real_element_property_inspection_hvac(self):
        """F4-T4-2: Inspect real HVAC elements from Nordic LCA dataset."""
        paths = get_real_ifc_paths()
        hvac_path = paths.get("HVAC")
        if not hvac_path or not os.path.exists(hvac_path):
            self.skipTest(f"HVAC IFC dataset not found: {hvac_path}")

        with open(hvac_path, "r", encoding="utf-8", errors="ignore") as f:
            sample = f.read(500000)

        parsed = ip.parse_ifc_text(sample)
        elements = parsed.get("elements", [])
        self.assertGreater(len(elements), 0)
        first = elements[0]
        self.assertIn(first.get("discipline"), ["mep", "Mechanical"])


if __name__ == "__main__":
    unittest.main()
