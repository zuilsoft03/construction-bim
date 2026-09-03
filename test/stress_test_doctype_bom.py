"""Empirical Stress Test Suite for BIM Clash DocType, APIs, and Automated BOM Generator.

Adversarially tests:
1. Batch Upload and Deduplication (100+ clashes, direct duplicates, symmetric (A, B) == (B, A) duplicates, closed skips)
2. DocType Status Transitions and Validation Rules (Open -> In Review -> Resolved -> Closed, reopening, audit trail)
3. Threaded Comments, ToDo Assignment and Resolution Trail
4. Quantity Takeoff on Complex/Real Models with Waste Factors [0% to 50%]
5. ERPNext BOM Compilation, Unit Rates, Cost Rollups and BIM BOQ Link Traceability Integrity
"""

import copy
import json
import math
import os
import sys
import types
import unittest
from typing import Any, Dict, List, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from test.test_helper import (
    AABB3D,
    BIMBOMGenerator,
    BIMClashManager,
    BOMMappingRule,
    ClashPair,
    DoesNotExistError,
    MockDoc,
    ValidationError,
    Vector3,
    generate_bcf_viewpoint_json,
    get_real_ifc_paths,
    make_synthetic_ifc,
    mock_frappe_db,
    setup_frappe_test_environment,
)

setup_frappe_test_environment()

_orig_mockdoc_init = MockDoc.__init__
def _patched_init(self, doctype: str = "DocType", **kwargs):
    _orig_mockdoc_init(self, doctype, **kwargs)
MockDoc.__init__ = _patched_init

if "frappe.model" not in sys.modules:
    sys.modules["frappe.model"] = types.ModuleType("frappe.model")
if "frappe.model.document" not in sys.modules:
    mod_doc = types.ModuleType("frappe.model.document")
    setattr(mod_doc, "Document", MockDoc)
    sys.modules["frappe.model.document"] = mod_doc

if hasattr(MockDoc, "submit") is False or MockDoc.submit is None:
    def _mock_submit(self):
        self.docstatus = 1
        self.save()
        return self
    MockDoc.submit = _mock_submit

if hasattr(MockDoc, "cancel") is False or MockDoc.cancel is None:
    def _mock_cancel(self):
        self.docstatus = 2
        self.save()
        return self
    MockDoc.cancel = _mock_cancel

import frappe
from construction_bim.api import bom_integration, clash
from construction_bim.bim import ifc_parser as ip
from construction_bim.bim.doctype.bim_clash.bim_clash import BIMClash
from construction_bim.bim.doctype.bim_bom_generator.bim_bom_generator import BIMBOMGenerator as BIMBOMGeneratorController

class TestBatchClashUploadAndDeduplication(unittest.TestCase):
    def setUp(self):
        mock_frappe_db.clear()

    def test_batch_upload_120_clashes_unique_pairs(self):
        clashes_data = []
        for i in range(120):
            clashes_data.append({
                "project": "PROJ-STRESS-120",
                "model_a": "MODEL-STRUC-01",
                "model_b": "MODEL-HVAC-01",
                "guid_a": f"STRUC_BEAM_{i:04d}",
                "element_a_type": "IfcBeam",
                "discipline_a": "Structural",
                "guid_b": f"HVAC_DUCT_{i:04d}",
                "element_b_type": "IfcDuctSegment",
                "discipline_b": "MEP",
                "collision_x": 10.0 + i * 0.5,
                "collision_y": 20.0 + i * 0.5,
                "collision_z": 3.0 + (i % 10) * 0.3,
                "penetration_depth": 45.0 + (i % 20),
                "intersection_volume": 0.015 + (i * 0.001),
                "severity": "Major" if i % 2 == 0 else "Critical",
            })

        res = clash.save_clashes_batch(clashes_data)
        self.assertEqual(res["created"], 120)
        self.assertEqual(res["updated"], 0)
        self.assertEqual(res["skipped"], 0)
        self.assertEqual(len(res["clashes"]), 120)

        all_clashes = frappe.get_all("BIM Clash", filters={"project": "PROJ-STRESS-120"})
        self.assertEqual(len(all_clashes), 120)

    def test_batch_upload_direct_duplicate_deduplication(self):
        base_clash = {
            "project": "PROJ-DEDUP",
            "model_a": "MODEL-STRUC",
            "model_b": "MODEL-HVAC",
            "guid_a": "GUID_COL_100",
            "guid_b": "GUID_DUCT_200",
            "element_a_type": "IfcColumn",
            "element_b_type": "IfcDuctSegment",
            "collision_x": 12.0,
            "collision_y": 15.0,
            "collision_z": 4.0,
            "penetration_depth": 30.0,
            "intersection_volume": 0.02,
            "severity": "Minor",
        }

        res1 = clash.save_clashes_batch([base_clash])
        self.assertEqual(res1["created"], 1)
        self.assertEqual(res1["updated"], 0)

        updated_clash = copy.deepcopy(base_clash)
        updated_clash["penetration_depth"] = 75.0
        updated_clash["intersection_volume"] = 0.085
        updated_clash["severity"] = "Critical"
        updated_clash["collision_x"] = 12.5

        res2 = clash.save_clashes_batch([updated_clash])
        self.assertEqual(res2["created"], 0)
        self.assertEqual(res2["updated"], 1)

        records = frappe.get_all("BIM Clash", filters={"project": "PROJ-DEDUP"})
        self.assertEqual(len(records), 1)

        doc = frappe.get_doc("BIM Clash", records[0].name)
        self.assertEqual(doc.severity, "Critical")
        self.assertAlmostEqual(doc.penetration_depth, 75.0)
        self.assertAlmostEqual(doc.intersection_volume, 0.085)
        self.assertAlmostEqual(doc.collision_x, 12.5)

    def test_batch_upload_symmetric_pair_deduplication(self):
        pair_a = {
            "project": "PROJ-SYM",
            "model_a": "MODEL-A",
            "model_b": "MODEL-B",
            "guid_a": "STRUC_ELEM_A",
            "guid_b": "MEP_ELEM_B",
            "element_a_type": "IfcBeam",
            "element_b_type": "IfcPipeSegment",
            "collision_x": 5.0,
            "collision_y": 10.0,
            "collision_z": 2.5,
            "penetration_depth": 50.0,
            "severity": "Major",
        }

        res1 = clash.save_clashes_batch([pair_a])
        self.assertEqual(res1["created"], 1)

        pair_b = {
            "project": "PROJ-SYM",
            "model_a": "MODEL-B",
            "model_b": "MODEL-A",
            "guid_a": "MEP_ELEM_B",
            "guid_b": "STRUC_ELEM_A",
            "element_a_type": "IfcPipeSegment",
            "element_b_type": "IfcBeam",
            "collision_x": 5.2,
            "collision_y": 10.1,
            "collision_z": 2.6,
            "penetration_depth": 90.0,
            "severity": "Critical",
        }

        res2 = clash.save_clashes_batch([pair_b])
        self.assertEqual(res2["created"], 0)
        self.assertEqual(res2["updated"], 1)

        records = frappe.get_all("BIM Clash", filters={"project": "PROJ-SYM"})
        self.assertEqual(len(records), 1)

        doc = frappe.get_doc("BIM Clash", records[0].name)
        self.assertEqual(doc.severity, "Critical")
        self.assertAlmostEqual(doc.penetration_depth, 90.0)

    def test_batch_upload_closed_or_ignored_skip_behavior(self):
        pair = {
            "project": "PROJ-CLOSED",
            "model_a": "MODEL-1",
            "model_b": "MODEL-2",
            "guid_a": "ELEM_1",
            "guid_b": "ELEM_2",
            "severity": "Major",
            "penetration_depth": 20.0,
        }

        res1 = clash.save_clashes_batch([pair])
        self.assertEqual(res1["created"], 1)
        clash_name = res1["clashes"][0]

        clash.update_clash_status(clash_name, "Closed", resolution_notes="Resolved in coordination meeting")

        pair_reupload = copy.deepcopy(pair)
        pair_reupload["penetration_depth"] = 80.0

        res2 = clash.save_clashes_batch([pair_reupload])
        self.assertEqual(res2["created"], 0)
        self.assertEqual(res2["updated"], 0)
        self.assertEqual(res2["skipped"], 1)

        doc = frappe.get_doc("BIM Clash", clash_name)
        self.assertEqual(doc.status, "Closed")
        self.assertAlmostEqual(doc.penetration_depth, 20.0)

    def test_batch_upload_mixed_stress_150_items(self):
        items = []
        for i in range(100):
            items.append({
                "project": "PROJ-STRESS-150",
                "model_a": "MOD-STRUC",
                "model_b": "MOD-HVAC",
                "guid_a": f"BEAM_{i}",
                "guid_b": f"DUCT_{i}",
                "collision_x": float(i),
                "collision_y": float(i),
                "collision_z": 3.0,
                "penetration_depth": 20.0 + i,
            })

        for i in range(25):
            items.append({
                "project": "PROJ-STRESS-150",
                "model_a": "MOD-STRUC",
                "model_b": "MOD-HVAC",
                "guid_a": f"BEAM_{i}",
                "guid_b": f"DUCT_{i}",
                "collision_x": float(i) + 0.1,
                "collision_y": float(i) + 0.1,
                "collision_z": 3.1,
                "penetration_depth": 50.0 + i,
            })

        for i in range(25, 50):
            items.append({
                "project": "PROJ-STRESS-150",
                "model_a": "MOD-HVAC",
                "model_b": "MOD-STRUC",
                "guid_a": f"DUCT_{i}",
                "guid_b": f"BEAM_{i}",
                "collision_x": float(i) + 0.2,
                "collision_y": float(i) + 0.2,
                "collision_z": 3.2,
                "penetration_depth": 60.0 + i,
            })

        self.assertEqual(len(items), 150)
        res = clash.save_clashes_batch(items)
        self.assertEqual(res["created"], 100)
        self.assertEqual(res["updated"], 50)
        self.assertEqual(res["skipped"], 0)

        records = frappe.get_all("BIM Clash", filters={"project": "PROJ-STRESS-150"})
        self.assertEqual(len(records), 100)

    def test_batch_upload_edge_cases_and_malformed_inputs(self):
        res_empty = clash.save_clashes_batch([])
        self.assertEqual(res_empty["created"], 0)
        self.assertEqual(res_empty["total"], 0)

        json_payload = json.dumps([{
            "project": "PROJ-JSON",
            "model_a": "M1",
            "model_b": "M2",
            "guid_a": "G1",
            "guid_b": "G2",
        }])
        res_json = clash.save_clashes_batch(json_payload)
        self.assertEqual(res_json["created"], 1)

        with self.assertRaises(Exception):
            clash.save_clashes_batch("{invalid_json: 123")

        items_missing_model = [
            {"project": "PROJ-MISS", "guid_a": "G1", "guid_b": "G2"},
            {"project": "PROJ-MISS", "model_a": "M1", "guid_a": "G3", "guid_b": "G4"},
        ]
        res_miss = clash.save_clashes_batch(items_missing_model)
        self.assertEqual(res_miss["created"], 0)

class TestBIMClashDocTypeLifecycleAndValidation(unittest.TestCase):
    def setUp(self):
        mock_frappe_db.clear()

    def test_lifecycle_status_transitions_happy_path(self):
        res_init = clash.save_clashes_batch([{
            "project": "PROJ-LIFE",
            "model_a": "M1",
            "model_b": "M2",
            "guid_a": "GA",
            "guid_b": "GB",
            "title": "Test Lifecycle Clash",
        }])
        clash_name = res_init["clashes"][0]
        doc = frappe.get_doc("BIM Clash", clash_name)
        self.assertEqual(doc.status, "Open")

        res_in_review = clash.update_clash_status(clash_name, "In Review")
        self.assertEqual(res_in_review["status"], "In Review")

        res_resolved = clash.update_clash_status(
            clash_name,
            "Resolved",
            resolution_notes="Pipe rerouted below beam bottom flange by 150mm",
            resolution_type="Rerouted MEP",
        )
        self.assertEqual(res_resolved["status"], "Resolved")
        self.assertIsNotNone(res_resolved["resolved_by"])
        self.assertIsNotNone(res_resolved["resolution_date"])
        self.assertEqual(res_resolved["resolution_notes"], "Pipe rerouted below beam bottom flange by 150mm")

        res_closed = clash.update_clash_status(clash_name, "Closed", resolution_notes="Verified by Lead Coordinator")
        self.assertEqual(res_closed["status"], "Closed")

    def test_reopening_lifecycle_resets_resolution_audit(self):
        doc = BIMClash()
        doc.model_a = "M1"
        doc.model_b = "M2"
        doc.guid_a = "G1"
        doc.guid_b = "G2"
        doc.status = "Resolved"
        doc.resolved_by = "engineer@example.com"
        doc.resolution_date = "2026-09-01 12:00:00"
        doc._handle_status_transition()
        self.assertEqual(doc.status, "Resolved")
        self.assertEqual(doc.resolved_by, "engineer@example.com")

        doc.status = "Open"
        doc._handle_status_transition()
        self.assertEqual(doc.status, "Open")
        self.assertIsNone(doc.resolved_by)
        self.assertIsNone(doc.resolution_date)

    def test_invalid_status_transition_throws_error(self):
        res = clash.save_clashes_batch([{
            "model_a": "M1",
            "model_b": "M2",
            "guid_a": "G1",
            "guid_b": "G2",
        }])
        clash_name = res["clashes"][0]

        with self.assertRaises(Exception):
            clash.update_clash_status(clash_name, "Archived")

        with self.assertRaises(Exception):
            clash.update_clash_status(clash_name, "NonExistentStatus")

    def test_auto_identifiers_and_bidirectional_field_sync(self):
        doc = BIMClash()
        doc.model_a = "STRUC_MODEL"
        doc.model_b = "MEP_MODEL"
        doc.element_a_guid = "GUID-AAA-111"
        doc.element_b_guid = "GUID-BBB-222"
        doc.element_a_type = "IfcColumn"
        doc.element_b_type = "IfcDuctSegment"
        doc.validate()

        self.assertIsNotNone(doc.bcf_guid)
        self.assertTrue(doc.clash_id.startswith("CLASH-"))
        self.assertIn("IfcColumn vs IfcDuctSegment", doc.title)

        self.assertEqual(doc.guid_a, "GUID-AAA-111")
        self.assertEqual(doc.guid_b, "GUID-BBB-222")
        self.assertEqual(doc.element_type_a, "IfcColumn")
        self.assertEqual(doc.element_type_b, "IfcDuctSegment")

    def test_viewpoint_generation_and_bcf_topic_serialization(self):
        doc = BIMClash()
        doc.model_a = "STRUC_MODEL"
        doc.model_b = "MEP_MODEL"
        doc.guid_a = "ELEM_GUID_1"
        doc.guid_b = "ELEM_GUID_2"
        doc.collision_x = 10.0
        doc.collision_y = 20.0
        doc.collision_z = 5.0
        doc.validate()

        vp = doc.get_viewpoint()
        self.assertIn("perspective_camera", vp)
        cam = vp["perspective_camera"]
        self.assertIn("camera_view_point", cam)
        self.assertIn("camera_direction", cam)
        self.assertIn("camera_up_vector", cam)
        self.assertEqual(cam["camera_up_vector"]["z"], 1.0)

        components = vp.get("components", {})
        coloring = components.get("coloring", [])
        self.assertEqual(len(coloring), 2)
        colors = {c["components"][0]["ifc_guid"]: c["color"] for c in coloring}
        self.assertIn("ELEM_GUID_1", colors)
        self.assertIn("ELEM_GUID_2", colors)
        self.assertTrue("FF0000" in colors["ELEM_GUID_1"])
        self.assertTrue("FFFF00" in colors["ELEM_GUID_2"])

        bcf_topic = doc.to_bcf_topic()
        self.assertEqual(bcf_topic["guid"], doc.bcf_guid)
        self.assertEqual(bcf_topic["topic_status"], "Open")
        self.assertEqual(bcf_topic["custom_attributes"]["element_a_guid"], "ELEM_GUID_1")


class TestThreadedCommentsAndToDoAssignment(unittest.TestCase):
    def setUp(self):
        mock_frappe_db.clear()

    def test_threaded_comments_creation_and_ordering(self):
        res = clash.save_clashes_batch([{
            "model_a": "M1",
            "model_b": "M2",
            "guid_a": "G1",
            "guid_b": "G2",
        }])
        clash_name = res["clashes"][0]

        c1 = clash.add_clash_comment(clash_name, "MEP engineer needs to reroute duct.", user="coordinator@nordic.com")
        c2 = clash.add_clash_comment(clash_name, "Agreed. Offset duct by -200mm in Z.", user="mep_engineer@nordic.com")
        c3 = clash.add_clash_comment(clash_name, "Structural opening not permitted at this location.", user="structural@nordic.com")

        self.assertIsNotNone(c1["name"])
        self.assertEqual(c1["comment_by"], "coordinator@nordic.com")

        details = clash.get_clash(clash_name)
        comments = details["comments"]
        self.assertEqual(len(comments), 3)
        self.assertEqual(comments[0]["content"], "MEP engineer needs to reroute duct.")
        self.assertEqual(comments[1]["content"], "Agreed. Offset duct by -200mm in Z.")
        self.assertEqual(comments[2]["content"], "Structural opening not permitted at this location.")

    def test_empty_comment_rejection(self):
        res = clash.save_clashes_batch([{
            "model_a": "M1",
            "model_b": "M2",
            "guid_a": "G1",
            "guid_b": "G2",
        }])
        clash_name = res["clashes"][0]

        with self.assertRaises(Exception):
            clash.add_clash_comment(clash_name, "")

    def test_todo_assignment_lifecycle(self):
        doc = BIMClash()
        doc.name = "BIM-CLASH-TEST-TODO"
        doc.title = "Critical Clash #42"
        doc.model_a = "M1"
        doc.model_b = "M2"
        doc.guid_a = "G1"
        doc.guid_b = "G2"
        doc.severity = "Critical"
        doc.assigned_to = "lead_mep@nordic.com"
        doc.due_date = "2026-09-15"
        doc.priority = "High"
        doc._sync_assigned_todo()

        todos = frappe.get_all("ToDo", filters={"reference_type": "BIM Clash", "reference_name": doc.name})
        self.assertEqual(len(todos), 1)
        todo_doc = frappe.get_doc("ToDo", todos[0].name)
        self.assertEqual(todo_doc.allocated_to, "lead_mep@nordic.com")
        self.assertEqual(todo_doc.priority, "High")

        doc._sync_assigned_todo()
        todos_after = frappe.get_all("ToDo", filters={"reference_type": "BIM Clash", "reference_name": doc.name})
        self.assertEqual(len(todos_after), 1)

    def test_clash_deletion_cleanup(self):
        res = clash.save_clashes_batch([{
            "model_a": "M1",
            "model_b": "M2",
            "guid_a": "G1",
            "guid_b": "G2",
        }])
        clash_name = res["clashes"][0]
        self.assertTrue(frappe.db.exists("BIM Clash", clash_name))

        del_res = clash.delete_clash(clash_name)
        self.assertEqual(del_res["deleted"], clash_name)
        self.assertFalse(frappe.db.exists("BIM Clash", clash_name))

class TestQuantityTakeoffComplexModelsAndWasteFactors(unittest.TestCase):
    def setUp(self):
        mock_frappe_db.clear()

    def test_qto_concrete_volume_and_formwork_synthetic(self):
        model_name = "BIM-MODEL-STRUC-SYNTH"
        model_doc = frappe.new_doc("BIM Model")
        model_doc.name = model_name
        model_doc.model_name = "Structural Concrete Model"
        model_doc.discipline = "Structural"
        model_doc.insert()

        for i in range(10):
            el = frappe.new_doc("BIM Element")
            el.model = model_name
            el.stable_id = f"WALL_{i:03d}"
            el.element_type = "IfcWallStandardCase"
            el.discipline = "structure"
            el.quantities = json.dumps({"NetVolume": 3.5, "NetArea": 17.5})
            el.properties = json.dumps({"Material": "Concrete C30/37"})
            el.insert()

        summary = bom_integration.get_model_quantity_summary(model_name)
        takeoff = summary["material_takeoff"]

        self.assertAlmostEqual(takeoff["concrete_volume_m3"], 35.0, places=3)
        self.assertAlmostEqual(takeoff["rebar_weight_kg"], 3500.0, places=3)
        self.assertAlmostEqual(takeoff["rebar_weight_tons"], 3.5, places=3)
        self.assertAlmostEqual(takeoff["formwork_area_m2"], 175.0, places=3)

    def test_qto_hvac_ductwork_and_piping_synthetic(self):
        model_name = "BIM-MODEL-MEP-SYNTH"
        model_doc = frappe.new_doc("BIM Model")
        model_doc.name = model_name
        model_doc.model_name = "MEP Services Model"
        model_doc.discipline = "MEP"
        model_doc.insert()

        for i in range(8):
            el = frappe.new_doc("BIM Element")
            el.model = model_name
            el.stable_id = f"DUCT_{i:03d}"
            el.element_type = "IfcDuctSegment"
            el.discipline = "mep"
            el.quantities = json.dumps({"Length": 4.0, "NetArea": 6.4})
            el.properties = json.dumps({"Width": 0.5, "Height": 0.3})
            el.insert()

        for i in range(12):
            el = frappe.new_doc("BIM Element")
            el.model = model_name
            el.stable_id = f"PIPE_{i:03d}"
            el.element_type = "IfcPipeSegment"
            el.discipline = "mep"
            el.quantities = json.dumps({"Length": 3.0})
            el.properties = json.dumps({"NominalDiameter": 50})
            el.insert()

        summary = bom_integration.get_model_quantity_summary(model_name)
        takeoff = summary["material_takeoff"]

        self.assertAlmostEqual(takeoff["ductwork_surface_m2"], 51.2, places=3)
        self.assertAlmostEqual(takeoff["ductwork_length_m"], 32.0, places=3)
        self.assertAlmostEqual(takeoff["piping_length_m"], 36.0, places=3)

    def test_qto_varying_waste_percentages_0_to_50_percent(self):
        model_name = "BIM-MODEL-WASTE-TEST"
        model_doc = frappe.new_doc("BIM Model")
        model_doc.name = model_name
        model_doc.model_name = "Waste Scaling Model"
        model_doc.insert()

        el = frappe.new_doc("BIM Element")
        el.model = model_name
        el.stable_id = "BIG_WALL"
        el.element_type = "IfcWall"
        el.discipline = "structure"
        el.quantities = json.dumps({"NetVolume": 100.0})
        el.insert()

        waste_cases = [0.0, 5.0, 10.0, 15.0, 25.0, 50.0]

        for waste in waste_cases:
            custom_rule = [{
                "category": "Concrete",
                "match_types": ["WALL"],
                "quantity_key": "volume_m3",
                "target_item_code": "ITEM-CONC-TEST",
                "target_item_name": "Ready-Mix Concrete",
                "uom": "Cubic Meter",
                "rate": 120.00,
                "waste_pct": waste,
            }]

            preview = bom_integration.preview_bom_generation(
                model=model_name,
                target_item="ITEM-BLD-01",
                mapping_rules=custom_rule,
                waste_factor_pct=waste,
            )

            conc_item = preview["items"][0]
            expected_billed_qty = round(100.0 * (1.0 + (waste / 100.0)), 4)

            self.assertAlmostEqual(conc_item["raw_quantity"], 100.0, places=3)
            self.assertAlmostEqual(conc_item["waste_pct"], waste, places=2)
            self.assertAlmostEqual(conc_item["qty"], expected_billed_qty, places=4)

            expected_amount = round(expected_billed_qty * 120.00, 2)
            self.assertAlmostEqual(conc_item["amount"], expected_amount, places=2)

    def test_qto_on_real_nordic_lca_ifc_datasets(self):
        paths = get_real_ifc_paths()
        struc_path = paths.get("STRUC")
        hvac_path = paths.get("HVAC")

        if struc_path and os.path.exists(struc_path):
            with open(struc_path, "r", encoding="utf-8", errors="ignore") as f:
                struc_parsed = ip.parse_ifc_text(f.read())
            elements = struc_parsed.get("elements", [])
            self.assertGreater(len(elements), 0)

            m_doc = frappe.new_doc("BIM Model")
            m_doc.name = "BIM-STRUC-REAL"
            m_doc.model_name = "Nordic LCA Structural Concrete"
            m_doc.discipline = "Structural"
            m_doc.insert()

            for el in elements:
                e_doc = frappe.new_doc("BIM Element")
                e_doc.model = "BIM-STRUC-REAL"
                e_doc.stable_id = el.get("guid") or str(el.get("id"))
                e_doc.element_type = el.get("ifc_type") or el.get("type")
                e_doc.discipline = el.get("discipline") or "structure"
                e_doc.quantities = json.dumps(el.get("quantities") or {})
                e_doc.properties = json.dumps(el.get("properties") or {})
                e_doc.insert()

            summary = bom_integration.get_model_quantity_summary("BIM-STRUC-REAL")
            takeoff = summary["material_takeoff"]
            self.assertGreater(takeoff["concrete_volume_m3"], 0.0)
            self.assertGreater(takeoff["rebar_weight_kg"], 0.0)

        if hvac_path and os.path.exists(hvac_path):
            with open(hvac_path, "r", encoding="utf-8", errors="ignore") as f:
                hvac_parsed = ip.parse_ifc_text(f.read())
            elements2 = hvac_parsed.get("elements", [])
            self.assertGreater(len(elements2), 0)

            m_doc2 = frappe.new_doc("BIM Model")
            m_doc2.name = "BIM-HVAC-REAL"
            m_doc2.model_name = "Nordic LCA HVAC Mechanical"
            m_doc2.discipline = "MEP"
            m_doc2.insert()

            for el in elements2:
                e_doc = frappe.new_doc("BIM Element")
                e_doc.model = "BIM-HVAC-REAL"
                e_doc.stable_id = el.get("guid") or str(el.get("id"))
                e_doc.element_type = el.get("ifc_type") or el.get("type")
                e_doc.discipline = el.get("discipline") or "mep"
                e_doc.quantities = json.dumps(el.get("quantities") or {})
                e_doc.properties = json.dumps(el.get("properties") or {})
                e_doc.insert()

            summary2 = bom_integration.get_model_quantity_summary("BIM-HVAC-REAL")
            takeoff2 = summary2["material_takeoff"]
            self.assertGreater(takeoff2["ductwork_surface_m2"] + takeoff2["piping_length_m"], 0.0)


class TestERPNextBOMCompilationAndTraceability(unittest.TestCase):
    def setUp(self):
        mock_frappe_db.clear()

        self.model_name = "BIM-MODEL-BOM-TEST"
        m = frappe.new_doc("BIM Model")
        m.name = self.model_name
        m.model_name = "Full Building Model"
        m.discipline = "Architecture"
        m.insert()

        for i in range(5):
            el = frappe.new_doc("BIM Element")
            el.model = self.model_name
            el.stable_id = f"SLAB_{i}"
            el.element_type = "IfcSlab"
            el.discipline = "structure"
            el.quantities = json.dumps({"NetVolume": 20.0, "NetArea": 100.0})
            el.insert()

        for i in range(10):
            el = frappe.new_doc("BIM Element")
            el.model = self.model_name
            el.stable_id = f"DUCT_{i}"
            el.element_type = "IfcDuctSegment"
            el.discipline = "mep"
            el.quantities = json.dumps({"NetArea": 5.0, "Length": 3.0})
            el.insert()

    def test_bom_generation_and_cost_rollup_accuracy(self):
        result = bom_integration.generate_or_update_bom(
            model=self.model_name,
            target_item="ITEM-BUILDING-FINISHED",
            waste_factor_pct=5.0,
        )

        self.assertEqual(result["status"], "success")
        bom_name = result["bom_name"]
        self.assertIsNotNone(bom_name)

        bom_doc = frappe.get_doc("BOM", bom_name)
        self.assertEqual(bom_doc.item, "ITEM-BUILDING-FINISHED")
        self.assertEqual(len(bom_doc.items), len(result["items"]))

        calculated_total = sum(item.amount for item in bom_doc.items)
        self.assertAlmostEqual(bom_doc.raw_material_cost, calculated_total, places=2)
        self.assertAlmostEqual(bom_doc.total_cost, calculated_total, places=2)
        self.assertGreater(bom_doc.total_cost, 0.0)

    def test_bom_generator_wizard_doctype_integration(self):
        gen = BIMBOMGeneratorController()
        gen.model = self.model_name
        gen.target_item = "ITEM-BUILDING-FINISHED"
        gen.waste_factor_pct = 7.5
        gen.validate()

        preview = gen.preview()
        self.assertIn("items", preview)
        self.assertGreater(preview["total_cost"], 0.0)

        res = gen.generate_bom()
        self.assertEqual(res["status"], "success")
        self.assertEqual(gen.status, "Generated")
        self.assertIsNotNone(gen.generated_bom)
        self.assertAlmostEqual(gen.total_cost, res["total_cost"], places=2)

    def test_bim_boq_link_traceability_integrity(self):
        result = bom_integration.generate_or_update_bom(
            model=self.model_name,
            target_item="ITEM-BUILDING-FINISHED",
        )
        self.assertGreater(result["traceability_links_created"], 0)

        links = frappe.get_all("BIM BOQ Link", fields=["name", "bim_element", "boq_reference_name", "rule_id"])
        self.assertGreater(len(links), 0)

        for link in links:
            self.assertTrue(link.rule_id.startswith(f"BOM:{result['bom_name']}"))
            self.assertIsNotNone(link.bim_element)
            self.assertIsNotNone(link.boq_reference_name)

        initial_link_count = len(links)
        result2 = bom_integration.generate_or_update_bom(
            model=self.model_name,
            target_item="ITEM-BUILDING-FINISHED",
            existing_bom=result["bom_name"],
        )
        links_after = frappe.get_all("BIM BOQ Link")
        self.assertEqual(len(links_after), initial_link_count)

    def test_submitted_bom_immutability(self):
        result = bom_integration.generate_or_update_bom(
            model=self.model_name,
            target_item="ITEM-BUILDING-FINISHED",
            submit_bom=1,
        )
        bom_name = result["bom_name"]
        bom_doc = frappe.get_doc("BOM", bom_name)
        self.assertEqual(bom_doc.docstatus, 1)

        with self.assertRaises(Exception):
            bom_integration.generate_or_update_bom(
                model=self.model_name,
                target_item="ITEM-BUILDING-FINISHED",
                existing_bom=bom_name,
            )


def run_stress_tests():
    suite = unittest.TestSuite()
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestBatchClashUploadAndDeduplication))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestBIMClashDocTypeLifecycleAndValidation))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestThreadedCommentsAndToDoAssignment))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestQuantityTakeoffComplexModelsAndWasteFactors))
    suite.addTest(unittest.TestLoader().loadTestsFromTestCase(TestERPNextBOMCompilationAndTraceability))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result


if __name__ == "__main__":
    res = run_stress_tests()
    sys.exit(0 if res.wasSuccessful() else 1)
