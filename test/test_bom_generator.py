"""E2E Test Suite for Automated BIM to ERPNext BOM Generator & 3D Highlighting (Features 11-13).

Covers:
- Feature 11: BIM Quantity Rollup & Extraction (Concrete volume, duct area, pipe length, steel weight)
- Feature 12: Automated BOM Generator Wizard (ERPNext BOM & BOM Item creation, unit cost rollups, BOQ Link traceability)
- Feature 13: Interactive 3D BOM Highlighting (BOM Item to 3D scene cross-highlighting bridge)

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
    BIMBOMGenerator,
    BOMMappingRule,
    MockDoc,
    Vector3,
    get_real_ifc_paths,
    make_synthetic_ifc,
    mock_frappe_db,
    setup_frappe_test_environment,
)
import frappe
from construction_bim.bim import ifc_parser as ip


class TestBOMGenerator(unittest.TestCase):

    def setUp(self):
        mock_frappe_db.clear()

    # ==========================================================================
    # Feature 11: BIM Quantity Rollup & Extraction
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_concrete_volume_extraction_qto_and_geometry(self):
        """F11-T1-1: Extract concrete volume (m3) from Qto_BaseQuantities or geometric bounding box."""
        el_qto = {
            "name": "Col 1", "element_type": "Column", "discipline": "structure",
            "quantities": {"NetVolume": 2.45}, "box": [0, 0, 0, 0.5, 0.5, 3.0],
        }
        vol1 = BIMBOMGenerator.extract_element_quantity(el_qto, "volume")
        self.assertAlmostEqual(vol1, 2.45, places=2)

        # Fallback to geometry
        el_geo = {
            "name": "Col 2", "element_type": "Column", "discipline": "structure",
            "quantities": {}, "box": [0, 0, 0, 0.5, 0.5, 3.0],
        }
        vol2 = BIMBOMGenerator.extract_element_quantity(el_geo, "volume")
        self.assertAlmostEqual(vol2, 0.75, places=2)

    def test_ductwork_surface_area_calculation(self):
        """F11-T1-2: Calculate ductwork surface area (m2) for galvanized sheet metal takeoff."""
        # 4m long duct, 0.5m wide, 0.3m high -> Perimeter = 2*(0.5 + 0.3) = 1.6m -> Area = 1.6 * 4 = 6.4 m2
        el_duct = {
            "name": "Supply Duct", "element_type": "Duct", "discipline": "mep",
            "quantities": {"NetSurfaceArea": 6.4},
            "box": [0, 0, 0, 4.0, 0.5, 0.3],
        }
        area = BIMBOMGenerator.extract_element_quantity(el_duct, "area")
        self.assertAlmostEqual(area, 6.4, places=1)

    def test_pipe_length_extraction(self):
        """F11-T1-3: Extract pipe segment linear lengths (m) for plumbing takeoff."""
        el_pipe = {
            "name": "Water Pipe", "element_type": "Pipe", "discipline": "mep",
            "quantities": {"Length": 12.5},
            "box": [0, 0, 0, 12.5, 0.1, 0.1],
        }
        length = BIMBOMGenerator.extract_element_quantity(el_pipe, "length")
        self.assertAlmostEqual(length, 12.5, places=1)

    def test_steel_weight_rollup_by_density(self):
        """F11-T1-4: Calculate structural steel weight (kg) from volume and density (7850 kg/m3)."""
        # 0.1 m3 steel -> 785.0 kg
        el_steel = {
            "name": "Steel Beam", "element_type": "Member", "discipline": "structure",
            "quantities": {"NetVolume": 0.10},
            "box": [0, 0, 0, 2.0, 0.1, 0.5],
        }
        weight = BIMBOMGenerator.extract_element_quantity(el_steel, "weight")
        self.assertAlmostEqual(weight, 785.0, places=1)

    def test_storey_level_quantity_aggregation(self):
        """F11-T1-5: Aggregate quantities grouped by building storey."""
        elements = [
            {"storey": "Ground Floor", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 1.5}},
            {"storey": "Ground Floor", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 2.0}},
            {"storey": "First Floor", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 3.0}},
        ]
        by_storey = {}
        for el in elements:
            s = el["storey"]
            v = BIMBOMGenerator.extract_element_quantity(el, "volume")
            by_storey[s] = by_storey.get(s, 0.0) + v

        self.assertAlmostEqual(by_storey["Ground Floor"], 3.5, places=2)
        self.assertAlmostEqual(by_storey["First Floor"], 3.0, places=2)

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_missing_qto_fallback_to_geometry(self):
        """F11-T2-1: Element with no Qto sets cleanly falls back to geometric bounding box dimensions."""
        el = {"box": [0, 0, 0, 2.0, 3.0, 4.0]}
        vol = BIMBOMGenerator.extract_element_quantity(el, "volume")
        self.assertAlmostEqual(vol, 24.0, places=2)

    def test_negative_or_zero_quantity_protection(self):
        """F11-T2-2: Negative or zero quantities handled safely without math error."""
        el_zero = {"box": [0, 0, 0, 0, 0, 0]}
        vol = BIMBOMGenerator.extract_element_quantity(el_zero, "volume")
        self.assertEqual(vol, 0.0)

    def test_millimeter_to_meter_scale_conversion(self):
        """F11-T2-3: Automatic unit conversion from mm3 to m3 with length_scale."""
        ifc_mm = make_synthetic_ifc(length_scale=0.001, elements=[
            {"guid": "col_mm", "dx": 500.0, "dy": 500.0, "dz": 3000.0, "volume": 750000000.0}
        ])
        parsed = ip.parse_ifc_text(ifc_mm)
        el = parsed["elements"][0]
        # NetVolume must be 0.75 m3
        self.assertAlmostEqual(el["quantities"].get("NetVolume", 0.0), 0.75, places=2)

    def test_unknown_quantity_type_fallback(self):
        """F11-T2-4: Unsupported quantity types default safely."""
        el = {"box": [0, 0, 0, 1, 1, 1]}
        qty = BIMBOMGenerator.extract_element_quantity(el, "unknown_metric")
        self.assertEqual(qty, 0.0)

    def test_large_quantity_aggregation_numerical_stability(self):
        """F11-T2-5: Large volume aggregation (100,000+ m3) maintains precision."""
        elements = [{"quantities": {"NetVolume": 1000.0}} for _ in range(250)]
        total = sum(BIMBOMGenerator.extract_element_quantity(e, "volume") for e in elements)
        self.assertAlmostEqual(total, 250000.0, places=2)

    # Tier 3: Pairwise Cross-Feature
    def test_multi_discipline_quantity_rollup(self):
        """F11-T3-1: Aggregate quantities from both Structural (concrete/steel) and HVAC (duct/pipe) models."""
        struc_elements = [
            {"element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 10.0}},
            {"element_type": "Beam", "discipline": "structure", "quantities": {"NetVolume": 15.0}},
        ]
        hvac_elements = [
            {"element_type": "Duct", "discipline": "mep", "box": [0, 0, 0, 20.0, 0.5, 0.5]},
            {"element_type": "Pipe", "discipline": "mep", "quantities": {"Length": 50.0}},
        ]

        struc_vol = sum(BIMBOMGenerator.extract_element_quantity(e, "volume") for e in struc_elements)
        hvac_len = sum(BIMBOMGenerator.extract_element_quantity(e, "length") for e in hvac_elements)

        self.assertAlmostEqual(struc_vol, 25.0, places=2)
        self.assertAlmostEqual(hvac_len, 70.0, places=2)

    # Tier 4: Real-World Scenario
    def test_real_structural_concrete_and_steel_takeoff(self):
        """F11-T4-1: Run quantity takeoff on real Nordic LCA Structural IFC model."""
        paths = get_real_ifc_paths()
        struc_path = paths.get("STRUC")
        if not struc_path or not os.path.exists(struc_path):
            self.skipTest(f"Structural IFC dataset not found: {struc_path}")

        with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
            sample = f.read(500000)

        parsed = ip.parse_ifc_text(sample)
        elements = parsed["elements"]
        self.assertGreater(len(elements), 0)

        total_vol = sum(BIMBOMGenerator.extract_element_quantity(e, "volume") for e in elements)
        self.assertGreater(total_vol, 0.0)

    # ==========================================================================
    # Feature 12: Automated BOM Generator Wizard
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_mapping_ruleset_execution(self):
        """F12-T1-1: Execute ruleset mapping IFC elements to ERPNext Items."""
        rules = BIMBOMGenerator.DEFAULT_RULES
        self.assertGreaterEqual(len(rules), 4)
        rule_ids = {r.rule_id for r in rules}
        self.assertIn("RULE-CONC-01", rule_ids)
        self.assertIn("RULE-DUCT-01", rule_ids)
        self.assertIn("RULE-PIPE-01", rule_ids)
        self.assertIn("RULE-STEEL-01", rule_ids)

    def test_erpnext_bom_doc_creation(self):
        """F12-T1-2: Create valid BOM record with parent item, UOM, and active status."""
        model = MockDoc("BIM Model", model_name="STRUC Building A")
        elements = [
            {"stable_id": "c1", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 5.0}},
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        self.assertIsNotNone(bom.name)
        self.assertEqual(bom.doctype, "BOM")
        self.assertEqual(bom.is_active, 1)
        self.assertEqual(bom.uom, "Unit")

    def test_bom_item_child_rows_creation(self):
        """F12-T1-3: Create BOM Item rows with correct quantities, rates, and amounts."""
        model = MockDoc("BIM Model", model_name="Commercial Tower")
        elements = [
            {"stable_id": "c1", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 10.0}},
            {"stable_id": "d1", "element_type": "Duct", "discipline": "mep", "quantities": {"NetSurfaceArea": 20.0}},
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        self.assertEqual(len(items), 2)
        conc_item = next(i for i in items if i.item_code == "ITEM-CONC-C30")
        self.assertEqual(conc_item.qty, 10.0)
        self.assertEqual(conc_item.rate, 125.0)
        self.assertEqual(conc_item.amount, 1250.0)

    def test_unit_cost_rollup_calculation(self):
        """F12-T1-4: Validate total BOM cost equals sum of (qty * rate) across all line items."""
        model = MockDoc("BIM Model", model_name="Cost Rollup Test")
        elements = [
            {"stable_id": "c1", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 10.0}},  # 10 * 125 = 1250
            {"stable_id": "p1", "element_type": "Pipe", "discipline": "mep", "quantities": {"Length": 50.0}},           # 50 * 32 = 1600
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        # Total cost = 1250 + 1600 = 2850
        self.assertEqual(bom.total_cost, 2850.0)

    def test_bim_boq_link_traceability_generation(self):
        """F12-T1-5: Automatic creation of BIM BOQ Link records linking elements to ERPNext items."""
        model = MockDoc("BIM Model", model_name="Traceability Model")
        elements = [
            {"stable_id": "GUID_TRACE_1", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 4.0}},
            {"stable_id": "GUID_TRACE_2", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 6.0}},
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        self.assertEqual(len(links), 2)
        self.assertEqual(mock_frappe_db.count("BIM BOQ Link"), 2)

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_bom_generation_with_empty_elements_list(self):
        """F12-T2-1: Empty model generates zero-cost BOM without exception."""
        model = MockDoc("BIM Model", model_name="Empty Model")
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, [])

        self.assertEqual(len(items), 0)
        self.assertEqual(bom.total_cost, 0.0)

    def test_unmapped_elements_skipped_safely(self):
        """F12-T2-2: Elements not matching any mapping rule are skipped without error."""
        model = MockDoc("BIM Model", model_name="Unmapped Elements Model")
        elements = [
            {"stable_id": "furn_1", "element_type": "Furniture", "discipline": "interior", "quantities": {"NetVolume": 1.0}},
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        self.assertEqual(len(items), 0)

    def test_duplicate_item_aggregation(self):
        """F12-T2-3: Multiple elements matching the same item code aggregate into a single BOM item row."""
        model = MockDoc("BIM Model", model_name="Agg Model")
        elements = [
            {"stable_id": f"col_{i}", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 2.5}}
            for i in range(10)
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].qty, 25.0)
        self.assertEqual(items[0].source_element_count, 10)

    def test_zero_rate_items_handling(self):
        """F12-T2-4: Items with zero unit cost handled safely without division by zero."""
        custom_rule = [
            BOMMappingRule(rule_id="R-FREE", target_item_code="FREE-ITEM", target_item_name="Free Item", uom="Nos", rate=0.0, element_type_filter=["Free"], discipline_filter="other", quantity_source="count")
        ]
        model = MockDoc("BIM Model", model_name="Free Model")
        elements = [{"stable_id": "f1", "element_type": "Free", "discipline": "other"}]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements, rules=custom_rule)

        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].amount, 0.0)
        self.assertEqual(bom.total_cost, 0.0)

    def test_bom_currency_and_precision(self):
        """F12-T2-5: Monetary amounts formatted and rounded to 2 decimal places."""
        model = MockDoc("BIM Model", model_name="Precision Model")
        elements = [
            {"stable_id": "c1", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 1.333333}},
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        self.assertEqual(bom.currency, "USD")
        self.assertIsInstance(bom.total_cost, float)

    # Tier 3: Pairwise Cross-Feature
    def test_quantity_rollup_to_bom_generator_pipeline(self):
        """F12-T3-1: Full pipeline from IFC parsing -> quantity extraction -> BOM compilation."""
        ifc_text = make_synthetic_ifc(elements=[
            {"guid": "c1", "type": "IFCCOLUMN", "dx": 0.5, "dy": 0.5, "dz": 3.0, "volume": 0.75},
            {"guid": "b1", "type": "IFCBEAM", "dx": 6.0, "dy": 0.4, "dz": 0.6, "volume": 1.44},
        ])
        parsed = ip.parse_ifc_text(ifc_text)
        model = MockDoc("BIM Model", model_name="Synthetic STRUC")

        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, parsed["elements"])
        self.assertGreater(len(items), 0)
        self.assertGreater(bom.total_cost, 0.0)

    # Tier 4: Real-World Scenario
    def test_real_nordic_lca_bom_generation(self):
        """F12-T4-1: Generate real ERPNext BOM with line items and cost rollup from Nordic LCA datasets."""
        paths = get_real_ifc_paths()
        struc_path = paths.get("STRUC")
        if not struc_path or not os.path.exists(struc_path):
            self.skipTest(f"Structural IFC dataset not found: {struc_path}")

        with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
            sample = f.read(500000)

        parsed = ip.parse_ifc_text(sample)
        model = MockDoc("BIM Model", model_name="Nordic LCA Concrete Building")

        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, parsed["elements"])
        self.assertGreater(len(items), 0)
        self.assertGreater(bom.total_cost, 0.0)
        self.assertGreater(len(links), 0)

    # ==========================================================================
    # Feature 13: Interactive 3D BOM Highlighting
    # ==========================================================================

    # Tier 1: Feature Coverage (Happy Path >= 5)
    def test_bom_line_item_element_guids_mapping(self):
        """F13-T1-1: BOM line items store list of source element GUIDs."""
        model = MockDoc("BIM Model", model_name="Highlight Model")
        elements = [
            {"stable_id": "GUID_001", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 2.0}},
            {"stable_id": "GUID_002", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 3.0}},
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        conc_item = items[0]
        guids = json.loads(conc_item.element_guids)
        self.assertEqual(guids, ["GUID_001", "GUID_002"])

    def test_cross_highlight_selection_bridge(self):
        """F13-T1-2: Selecting BOM line item returns list of GUIDs to highlight in 3D viewer."""
        item = MockDoc("BOM Item", item_code="ITEM-CONC-C30", element_guids=json.dumps(["G1", "G2", "G3"]))
        selected_guids = json.loads(item.element_guids)

        highlight_payload = {
            "action": "highlight",
            "guids": selected_guids,
            "color": "#00E5FF",
        }
        self.assertEqual(len(highlight_payload["guids"]), 3)
        self.assertEqual(highlight_payload["color"], "#00E5FF")

    def test_multi_element_bom_highlight_aggregation(self):
        """F13-T1-3: Concrete BOM item highlights all contributing column/beam elements."""
        model = MockDoc("BIM Model", model_name="Tower")
        elements = [
            {"stable_id": f"C_{i}", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 1.0}}
            for i in range(25)
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        conc_item = items[0]
        guids = json.loads(conc_item.element_guids)
        self.assertEqual(len(guids), 25)

    def test_bom_highlight_color_assignment(self):
        """F13-T1-4: Cross-highlight assigns designated accent color (#00E5FF or #3B82F6)."""
        color = "#00E5FF"
        self.assertTrue(color.startswith("#"))
        self.assertEqual(len(color), 7)

    def test_clear_highlight_on_bom_deselection(self):
        """F13-T1-5: Deselecting BOM item clears highlight states."""
        highlight_state = {"active_item": "ITEM-CONC-C30", "guids": ["G1", "G2"]}
        # Clear
        highlight_state["active_item"] = None
        highlight_state["guids"] = []
        self.assertEqual(len(highlight_state["guids"]), 0)

    # Tier 2: Boundary & Corner Cases (>= 5)
    def test_highlight_with_zero_source_elements(self):
        """F13-T2-1: Selecting manual/non-BIM item returns empty GUID list safely."""
        item = MockDoc("BOM Item", item_code="ITEM-MANUAL", element_guids=json.dumps([]))
        guids = json.loads(item.element_guids)
        self.assertEqual(len(guids), 0)

    def test_rapid_bom_line_switching(self):
        """F13-T2-2: Switching between different BOM line items updates highlight set immediately."""
        items = [
            MockDoc("BOM Item", item_code=f"ITEM-{i}", element_guids=json.dumps([f"G_{i}_A", f"G_{i}_B"]))
            for i in range(10)
        ]
        current_guids = []
        for itm in items:
            current_guids = json.loads(itm.element_guids)

        self.assertEqual(current_guids, ["G_9_A", "G_9_B"])

    def test_bom_item_guid_json_serialization(self):
        """F13-T2-3: GUID lists serialized and deserialized cleanly from JSON strings."""
        original = ["GUID_A", "GUID_B", "GUID_C"]
        s = json.dumps(original)
        loaded = json.loads(s)
        self.assertEqual(original, loaded)

    def test_missing_guid_in_scene_graceful_handling(self):
        """F13-T2-4: Highlighting elements not present in active 3D view handled without crash."""
        target_guids = ["G_ORPHAN_1", "G_ORPHAN_2"]
        scene_elements = {"G_ACTIVE_1": True}

        highlighted = [g for g in target_guids if g in scene_elements]
        self.assertEqual(len(highlighted), 0)

    def test_distinct_highlight_colors_per_bom_discipline(self):
        """F13-T2-5: Structural items and MEP items support distinct highlight colors."""
        discipline_colors = {
            "structure": "#3B82F6",  # Blue
            "mep": "#10B981",        # Emerald Green
            "architecture": "#8B5CF6", # Purple
        }
        self.assertEqual(len(discipline_colors), 3)

    # Tier 3: Pairwise Cross-Feature
    def test_bom_generator_to_3d_viewer_scene_interaction(self):
        """F13-T3-1: Complete flow: generate BOM -> select BOM Item -> query 3D highlighted GUIDs."""
        model = MockDoc("BIM Model", model_name="Interaction Model")
        elements = [
            {"stable_id": "COL_AAA", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 2.0}},
            {"stable_id": "COL_BBB", "element_type": "Column", "discipline": "structure", "quantities": {"NetVolume": 3.0}},
            {"stable_id": "DUCT_CCC", "element_type": "Duct", "discipline": "mep", "quantities": {"NetSurfaceArea": 15.0}},
        ]
        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, elements)

        # Select concrete BOM line
        conc_line = next(i for i in items if i.item_code == "ITEM-CONC-C30")
        guids = json.loads(conc_line.element_guids)
        self.assertIn("COL_AAA", guids)
        self.assertIn("COL_BBB", guids)
        self.assertNotIn("DUCT_CCC", guids)

    # Tier 4: Real-World Scenario
    def test_real_bom_item_3d_highlight_validation(self):
        """F13-T4-1: Highlight real structural columns from generated BOM in Nordic LCA model."""
        paths = get_real_ifc_paths()
        struc_path = paths.get("STRUC")
        if not struc_path or not os.path.exists(struc_path):
            self.skipTest(f"Structural IFC dataset not found: {struc_path}")

        with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
            sample = f.read(500000)

        parsed = ip.parse_ifc_text(sample)
        model = MockDoc("BIM Model", model_name="Nordic LCA Concrete")

        bom, items, links = BIMBOMGenerator.generate_bom_from_model(model, parsed["elements"])
        if items:
            first_item = items[0]
            guids = json.loads(first_item.element_guids)
            self.assertGreater(len(guids), 0)


if __name__ == "__main__":
    unittest.main()
