"""Host-side unit tests for construction_bim.api.initiation pure core.

Run: python -m unittest test.test_project_initiation -v
"""

import unittest

from construction_bim.api.initiation import (
    detect_discipline,
    fuzzy_match_columns,
    parse_boq_csv_data,
    generate_standard_boq_csv_template,
    evaluate_coordinate_drift,
    compute_initiation_readiness,
    CATEGORY_DRIVE_FOLDER_MAP,
)


class TestProjectInitiation(unittest.TestCase):
    def test_detect_discipline_from_filename(self):
        self.assertEqual(detect_discipline("Hospital_ARCH_Level1.ifc"), "Architecture")
        self.assertEqual(detect_discipline("Hospital_Structural_v3.ifc"), "Structural")
        self.assertEqual(detect_discipline("Commercial_HVAC_Ductwork.ifc"), "MEP")
        self.assertEqual(detect_discipline("Plumbing_Piping_Riser.ifc"), "MEP")
        self.assertEqual(detect_discipline("Rebar_Foundations.ifc"), "Structural")
        self.assertEqual(detect_discipline("Facade_Glass_Envelope.ifc"), "Architecture")

    def test_detect_discipline_from_entities(self):
        struc_types = ["IfcBeam", "IfcBeam", "IfcColumn", "IfcFooting", "IfcWall"]
        self.assertEqual(detect_discipline("Building_Model.ifc", struc_types), "Structural")

        mep_types = ["IfcFlowSegment", "IfcPipeFitting", "IfcDuctSegment", "IfcFlowFitting"]
        self.assertEqual(detect_discipline("Building_Model.ifc", mep_types), "MEP")

    def test_fuzzy_match_columns(self):
        raw_headers = ["Pay Item #", "Scope of Work Description", "UOM", "Estimated Quantity", "Unit Price", "Total PHP"]
        mapping = fuzzy_match_columns(raw_headers)
        self.assertEqual(mapping["item_code"], "Pay Item #")
        self.assertEqual(mapping["description"], "Scope of Work Description")
        self.assertEqual(mapping["unit"], "UOM")
        self.assertEqual(mapping["quantity"], "Estimated Quantity")
        self.assertEqual(mapping["unit_rate"], "Unit Price")
        self.assertEqual(mapping["total_amount"], "Total PHP")

    def test_parse_boq_csv_data(self):
        csv_text = """Pay Item,Work Description,UOM,Qty,Unit Rate,Line Total
ITEM-101,Ready Mix Concrete 3000 PSI,m3,50,5000,250000
ITEM-102,Deformed Steel Bars #16,kg,2000,45,90000
"""
        result = parse_boq_csv_data(csv_text)
        self.assertEqual(result["line_count"], 2)
        self.assertEqual(result["total_amount"], 340000.0)
        self.assertEqual(result["items"][0]["item_code"], "ITEM-101")
        self.assertEqual(result["items"][0]["quantity"], 50.0)
        self.assertEqual(result["items"][0]["unit_rate"], 5000.0)
        self.assertEqual(result["items"][0]["total_amount"], 250000.0)

    def test_generate_standard_boq_csv_template(self):
        template_csv = generate_standard_boq_csv_template()
        self.assertIn("Item Code", template_csv)
        self.assertIn("Total Amount (PHP)", template_csv)
        parsed = parse_boq_csv_data(template_csv)
        self.assertGreater(parsed["line_count"], 3)
        self.assertGreater(parsed["total_amount"], 1000000.0)

    def test_evaluate_coordinate_drift(self):
        # Aligned models
        bboxes_aligned = [
            {"name": "ARK", "min": [0, 0, 0], "max": [40, 50, 20]},
            {"name": "STRUC", "min": [0.5, -0.2, 0], "max": [40.5, 49.8, 20]},
        ]
        res_aligned = evaluate_coordinate_drift(bboxes_aligned, max_drift_threshold=50.0)
        self.assertEqual(res_aligned["status"], "aligned")
        self.assertFalse(res_aligned["drift_detected"])

        # Drifting model (e.g. 1500m coordinate mismatch)
        bboxes_drift = [
            {"name": "ARK", "min": [0, 0, 0], "max": [40, 50, 20]},
            {"name": "MEP", "min": [1500, 2000, 0], "max": [1540, 2050, 20]},
        ]
        res_drift = evaluate_coordinate_drift(bboxes_drift, max_drift_threshold=50.0)
        self.assertEqual(res_drift["status"], "warning")
        self.assertTrue(res_drift["drift_detected"])
        self.assertEqual(len(res_drift["drift_models"]), 1)
        self.assertEqual(res_drift["drift_models"][0]["model"], "MEP")

    def test_compute_initiation_readiness(self):
        # Incomplete stage-gate
        incomplete = compute_initiation_readiness(
            has_contract=False,
            has_models=True,
            has_boq=False,
            models_aligned=True,
            contract_amount=0.0,
            estimated_cost=0.0,
        )
        self.assertFalse(incomplete["all_ready"])
        self.assertFalse(incomplete["gates"][0]["passed"])  # Contract failed

        # Complete stage-gate
        complete = compute_initiation_readiness(
            has_contract=True,
            has_models=True,
            has_boq=True,
            models_aligned=True,
            contract_amount=5000000.0,
            estimated_cost=4200000.0,
        )
        self.assertTrue(complete["all_ready"])
        self.assertEqual(complete["variance"], 800000.0)

    def test_category_folder_mapping(self):
        self.assertEqual(CATEGORY_DRIVE_FOLDER_MAP["contract"], "01_Contracts")
        self.assertEqual(CATEGORY_DRIVE_FOLDER_MAP["cad"], "02_Drawings/DWG")
        self.assertEqual(CATEGORY_DRIVE_FOLDER_MAP["ifc"], "03_BIM_Models")
        self.assertEqual(CATEGORY_DRIVE_FOLDER_MAP["boq"], "04_Takeoffs")

    def test_boq_parsing_with_currency_symbols_and_commas(self):
        """User Story 8 & 10: Parse BOQ spreadsheet containing formatted numbers, commas, and currency signs."""
        raw_csv = """Pay Item #,Scope of Work,UOM,Quantity,Unit Price,Total
C-101,3000 PSI Ready Mix Concrete,m3,"1,250.00","PHP 5,500.00","PHP 6,875,000.00"
S-201,Grade 60 Rebar 16mm,kg,"15,000.00","₱ 48.50","₱ 727,500.00"
M-301,Chilled Water Pipe 100mm,m,120.50,"$ 75.00","9037.50"
"""
        parsed = parse_boq_csv_data(raw_csv)
        self.assertEqual(parsed["line_count"], 3)
        self.assertEqual(parsed["items"][0]["item_code"], "C-101")
        self.assertEqual(parsed["items"][0]["quantity"], 1250.0)
        self.assertEqual(parsed["items"][0]["unit_rate"], 5500.0)
        self.assertEqual(parsed["items"][0]["total_amount"], 6875000.0)

        self.assertEqual(parsed["items"][1]["item_code"], "S-201")
        self.assertEqual(parsed["items"][1]["quantity"], 15000.0)
        self.assertEqual(parsed["items"][1]["unit_rate"], 48.5)
        self.assertEqual(parsed["items"][1]["total_amount"], 727500.0)

        self.assertEqual(parsed["items"][2]["item_code"], "M-301")
        self.assertEqual(parsed["items"][2]["quantity"], 120.5)
        self.assertEqual(parsed["items"][2]["unit_rate"], 75.0)

        expected_sum = 6875000.0 + 727500.0 + 9037.5
        self.assertAlmostEqual(parsed["total_amount"], expected_sum, places=2)

    def test_auto_align_coordinate_recovery_lifecycle(self):
        """User Story 5 & 6: Detect coordinate drift, extract correction vector, apply offset, and verify recovery."""
        # 1. Initial drift scenario: Architecture at origin, MEP at (1200, 850, 10)
        bboxes = [
            {"name": "Hospital_ARCH", "min": [0, 0, 0], "max": [50, 60, 25]},
            {"name": "Hospital_MEP", "min": [1200, 850, 10], "max": [1250, 910, 35]},
        ]
        drift_report = evaluate_coordinate_drift(bboxes, max_drift_threshold=50.0)
        self.assertTrue(drift_report["drift_detected"])
        self.assertEqual(drift_report["status"], "warning")
        self.assertEqual(len(drift_report["drift_models"]), 1)

        mep_drift = drift_report["drift_models"][0]
        self.assertEqual(mep_drift["model"], "Hospital_MEP")
        offset = mep_drift["offset_vector"]  # Expected translation [-1200, -850, -10]

        # 2. Simulate 1-click Auto-Alignment: apply offset vector to Hospital_MEP bbox
        aligned_mep_min = [bboxes[1]["min"][i] + offset[i] for i in range(3)]
        aligned_mep_max = [bboxes[1]["max"][i] + offset[i] for i in range(3)]
        recovered_bboxes = [
            bboxes[0],
            {"name": "Hospital_MEP", "min": aligned_mep_min, "max": aligned_mep_max},
        ]

        # 3. Re-evaluate coordinate drift
        recovered_report = evaluate_coordinate_drift(recovered_bboxes, max_drift_threshold=50.0)
        self.assertFalse(recovered_report["drift_detected"], "Models must be aligned after applying offset vector")
        self.assertEqual(recovered_report["status"], "aligned")
        self.assertLess(recovered_report["max_distance"], 1.0)

    def test_full_stage_gate_kickoff_progression_lifecycle(self):
        """User Stories 15, 16, 17: Step-by-step gate progression from blank project to approved kickoff."""
        # Phase 1: Fresh project with zero uploads
        s1 = compute_initiation_readiness(
            has_contract=False, has_models=False, has_boq=False, models_aligned=False
        )
        self.assertFalse(s1["all_ready"])
        self.assertEqual(sum(1 for g in s1["gates"] if g["passed"]), 0)

        # Phase 2: Contract uploaded & amount entered (PHP 12,500,000)
        s2 = compute_initiation_readiness(
            has_contract=True, has_models=False, has_boq=False, models_aligned=False, contract_amount=12500000.0
        )
        self.assertFalse(s2["all_ready"])
        self.assertTrue(s2["gates"][0]["passed"])  # Commercial passed
        self.assertFalse(s2["gates"][1]["passed"]) # Model pending

        # Phase 3: Models uploaded but drift detected
        s3 = compute_initiation_readiness(
            has_contract=True, has_models=True, has_boq=False, models_aligned=False, contract_amount=12500000.0
        )
        self.assertFalse(s3["all_ready"])
        self.assertFalse(s3["gates"][1]["passed"], "Models gate must fail if coordinate drift is unresolved")

        # Phase 4: Auto-align executed (models_aligned = True)
        s4 = compute_initiation_readiness(
            has_contract=True, has_models=True, has_boq=False, models_aligned=True, contract_amount=12500000.0
        )
        self.assertFalse(s4["all_ready"])
        self.assertTrue(s4["gates"][1]["passed"], "Models gate passes after alignment")
        self.assertFalse(s4["gates"][2]["passed"], "BOQ gate pending")

        # Phase 5: BOQ uploaded & approved (PHP 10,800,000)
        s5 = compute_initiation_readiness(
            has_contract=True,
            has_models=True,
            has_boq=True,
            models_aligned=True,
            contract_amount=12500000.0,
            estimated_cost=10800000.0,
        )
        self.assertTrue(s5["all_ready"], "All 3 gates passed; project is ready for sign-off")
        self.assertTrue(s5["gates"][3]["passed"], "Sign-off authorization gate is unlocked")
        self.assertEqual(s5["variance"], 1700000.0, "Commercial variance (12.5M - 10.8M) must be PHP 1,700,000")


if __name__ == "__main__":
    unittest.main()
