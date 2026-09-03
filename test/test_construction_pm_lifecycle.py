"""Comprehensive Verification Test Suite for Full-Blown Construction PM and BIM Pipeline.

Tests:
1. Construction Contract: BOQ item valuation rollups, milestone weight validations, retainage calculations.
2. Variation Orders: Cost recalibrations, time extensions, and revised contract value tracking.
3. Progress Claims: Cumulative valuation, retention deductions, advance recovery, and Sales Invoice generation.
4. PM2 Governance: 6-phase project lifecycle initialization and strict mandatory stage-gate enforcement.
5. Statutory Safety (DOLE / OSHP): Confined space gas test validation, Toolbox Talk attendance, Incident reporting.
6. Field Operations and RFI: Daily site diary manpower tracking and RFI resolution lifecycle.
7. Native Integration Patch: Idempotent field injection and Quality Inspection template seeding.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from test.test_helper import (
    MockDoc,
    ValidationError,
    mock_frappe_db,
    register_doctype_class,
)
import frappe

# Import our DocType controllers
from construction_bim.construction.doctype.construction_contract.construction_contract import ConstructionContract
from construction_bim.construction.doctype.variation_order.variation_order import VariationOrder
from construction_bim.construction.doctype.progress_claim.progress_claim import ProgressClaim
from construction_bim.construction.doctype.retainage_log.retainage_log import RetainageLog
from construction_bim.construction.doctype.project_phase.project_phase import (
    ProjectPhase,
    initialize_pm2_project_phases,
)
from construction_bim.construction.doctype.permit_to_work.permit_to_work import PermitToWork
from construction_bim.construction.doctype.toolbox_talk.toolbox_talk import ToolboxTalk
from construction_bim.construction.doctype.osh_incident_report.osh_incident_report import OSHIncidentReport
from construction_bim.construction.doctype.daily_site_report.daily_site_report import (
    DailySiteReport,
    fetch_daily_site_activity,
)
from construction_bim.construction.doctype.rfi.rfi import RFI
from construction_bim.patches import v2_construction_pm_native_fields

# Register classes with mock factory
register_doctype_class("Project Phase", ProjectPhase)
register_doctype_class("Construction Contract", ConstructionContract)
register_doctype_class("Variation Order", VariationOrder)
register_doctype_class("Progress Claim", ProgressClaim)
register_doctype_class("Permit to Work", PermitToWork)
register_doctype_class("Toolbox Talk", ToolboxTalk)
register_doctype_class("OSH Incident Report", OSHIncidentReport)
register_doctype_class("Daily Site Report", DailySiteReport)
register_doctype_class("RFI", RFI)


class TestConstructionPMLifecycle(unittest.TestCase):
    def setUp(self):
        mock_frappe_db.clear()

        # Seed test project
        self.project = MockDoc("Project", name="PROJ-HOSPITAL-001", project_name="Metro General Hospital Expansion")
        self.project.insert()

    # --------------------------------------------------------------------------
    # 1. Commercial Foundations (Contracts, BOQ, Milestones)
    # --------------------------------------------------------------------------
    def test_contract_boq_rollups_and_milestones(self):
        """Verify BOQ item amounts roll up into contract_value and revised_contract_value."""
        contract = ConstructionContract(
            "Construction Contract",
            name="CON-2026-00001",
            contract_title="Hospital Main Structural and Architectural Works",
            project=self.project.name,
            contractor="Megawide Construction Corp",
            contract_value=0.0,
            start_date="2026-01-01",
            completion_date="2026-12-31",
            retainage_rate=10.0,
        )

        # Add BOQ items
        contract.append("boq_items", {
            "item_code": "CONC-C30",
            "item_name": "Ready Mix Concrete 30 MPa",
            "qty": 500.0,
            "rate": 6000.0,
        })
        contract.append("boq_items", {
            "item_code": "REBAR-G60",
            "item_name": "Deformed Steel Reinforcement Bars 16mm",
            "qty": 40000.0,
            "rate": 50.0,
        })

        # Add Milestones totaling 100%
        contract.append("milestones", {
            "milestone_name": "Substructure and Foundations",
            "weight_pct": 40.0,
            "due_date": "2026-04-30",
        })
        contract.append("milestones", {
            "milestone_name": "Superstructure Frame",
            "weight_pct": 60.0,
            "due_date": "2026-12-31",
        })

        contract.insert()

        # Assertions
        self.assertEqual(contract.contract_value, 5000000.0)
        self.assertEqual(contract.revised_contract_value, 5000000.0)

    def test_contract_milestone_weight_validation(self):
        """Verify that milestone weights exceeding 100% raise ValidationError."""
        contract = ConstructionContract(
            "Construction Contract",
            name="CON-2026-BAD",
            contract_title="Hospital Main Structural",
            project=self.project.name,
            start_date="2026-01-01",
            completion_date="2026-12-31",
        )
        contract.append("milestones", {"milestone_name": "Phase 1", "weight_pct": 70.0})
        contract.append("milestones", {"milestone_name": "Phase 2", "weight_pct": 50.0})

        with self.assertRaises(ValidationError):
            contract.insert()

    # --------------------------------------------------------------------------
    # 2. Change Management (Variation Orders)
    # --------------------------------------------------------------------------
    def test_variation_order_contract_recalibration(self):
        """Verify that submitting a Variation Order updates the contract revised value and completion date."""
        contract = ConstructionContract(
            "Construction Contract",
            name="CON-2026-00002",
            contract_title="Civil Works Package",
            project=self.project.name,
            contract_value=10000000.0,
            revised_contract_value=10000000.0,
            start_date="2026-01-01",
            completion_date="2026-12-31",
        )
        contract.insert()

        # Create approved variation order
        vo = VariationOrder(
            "Variation Order",
            name="VO-2026-00001",
            title="Foundation Depth Extension due to Soil Bearing Capacity",
            contract=contract.name,
            project=self.project.name,
            cost_impact=750000.0,
            time_extension_days=15,
            status="Draft",
        )
        vo.insert()

        # Submit Variation Order
        vo.submit()

        self.assertEqual(vo.status, "Approved")

        # Reload contract and assert values
        reloaded_value = mock_frappe_db.get_value("Construction Contract", contract.name, "revised_contract_value")
        self.assertEqual(reloaded_value, 10750000.0)

    # --------------------------------------------------------------------------
    # 3. Progress Claims and Billing Certification
    # --------------------------------------------------------------------------
    def test_progress_claim_valuation_and_invoicing(self):
        """Verify gross claim, retention deduction, advance recovery, and Sales Invoice generation."""
        contract = ConstructionContract(
            "Construction Contract",
            name="CON-2026-00003",
            contract_title="MEP Works Package",
            project=self.project.name,
            customer="Metro Hospital Corp",
            contract_value=10000000.0,
            revised_contract_value=10000000.0,
            contractor="First Electro-Mechanical Corp",
            retainage_rate=10.0,
            start_date="2026-01-01",
            completion_date="2026-12-31",
        )
        contract.insert()

        claim = ProgressClaim(
            "Progress Claim",
            name="PC-2026-00001",
            contract=contract.name,
            project=self.project.name,
            claim_number=1,
            claim_date="2026-02-28",
            period_start="2026-02-01",
            period_end="2026-02-28",
            retention_rate=10.0,
            advance_payment_deduction=90000.0,
        )
        claim.append("items", {
            "item_code": "MEP-PIPE-01",
            "contract_qty": 1000.0,
            "rate": 2000.0,
            "previous_qty": 0.0,
            "current_qty": 300.0,
        })
        claim.insert()

        # Gross amount: 300 * 2000 = 600,000
        # Retention (10%): 60,000
        # Advance recovery: 90,000
        # Net payable: 600,000 - 60,000 - 90,000 = 450,000
        self.assertEqual(claim.gross_claim_amount, 600000.0)
        self.assertEqual(claim.retention_deduction, 60000.0)
        self.assertEqual(claim.net_certified_amount, 450000.0)

        # Submit progress claim
        claim.submit()
        self.assertEqual(claim.status, "Certified")

        # Test Sales Invoice generation
        inv_result = claim.create_sales_invoice()
        self.assertTrue(bool(inv_result))
        self.assertTrue("Sales Invoice" in str(inv_result) or "ACC-SINV" in str(inv_result))

    # --------------------------------------------------------------------------
    # 4. PM2 Project Lifecycle Governance and Stage-Gates
    # --------------------------------------------------------------------------
    def test_pm2_lifecycle_scaffolding_and_stage_gates(self):
        """Verify 6 PM2 phases are scaffolded and mandatory stage-gates block phase completion."""
        phases = initialize_pm2_project_phases(self.project.name)
        self.assertEqual(len(phases), 6)

        # Retrieve Phase 1: Initiating
        phase1_name = phases[0]
        phase1 = frappe.get_doc("Project Phase", phase1_name)
        self.assertEqual(phase1.phase_name, "1. Initiating")

        # Attempt to mark Phase 1 as "Completed" while mandatory gates are incomplete
        phase1.status = "Completed"
        with self.assertRaises(ValidationError):
            phase1.save()

        # Check all mandatory gates
        for gate in phase1.gate_checklist:
            if gate.required:
                gate.is_completed = 1
                gate.verified_date = "2026-01-15"

        # Now save should succeed
        phase1.save()
        self.assertEqual(phase1.status, "Completed")

    # --------------------------------------------------------------------------
    # 5. Statutory Safety and Compliance (DOLE / OSHP)
    # --------------------------------------------------------------------------
    def test_permit_to_work_confined_space_gas_testing(self):
        """Verify Confined Space permits strictly require atmospheric gas test values."""
        # Case A: Missing O2 reading throws ValidationError
        ptw_invalid = PermitToWork(
            "Permit to Work",
            name="PTW-2026-FAIL",
            project=self.project.name,
            permit_type="Confined Space",
            contractor="Underground Utilities Inc",
            valid_from="2026-03-01 08:00:00",
            valid_to="2026-03-01 17:00:00",
            gas_oxygen_pct=0.0,
        )
        with self.assertRaises(ValidationError):
            ptw_invalid.insert()

        # Case B: Valid O2 (20.9%) succeeds
        ptw_valid = PermitToWork(
            "Permit to Work",
            name="PTW-2026-PASS",
            project=self.project.name,
            permit_type="Confined Space",
            contractor="Underground Utilities Inc",
            valid_from="2026-03-01 08:00:00",
            valid_to="2026-03-01 17:00:00",
            gas_oxygen_pct=20.9,
            gas_tested_by="Safety Officer Engr. Santos",
        )
        ptw_valid.insert()
        self.assertEqual(ptw_valid.status, "Draft")

    def test_toolbox_talk_attendance_rollup(self):
        """Verify Toolbox Talk attendee counting and validation."""
        tbt = ToolboxTalk(
            "Toolbox Talk",
            name="TBT-2026-00001",
            project=self.project.name,
            topic_category="Working at Heights & Scaffold Safety",
            date="2026-03-01",
            conductor_name="Safety Officer Engr. Santos",
            mandatory_ppe_checked=1,
        )
        tbt.append("attendees", {"worker_name": "Juan Dela Cruz", "subcontractor": "Megawide", "signed": 1})
        tbt.append("attendees", {"worker_name": "Pedro Reyes", "subcontractor": "Megawide", "signed": 1})
        tbt.append("attendees", {"worker_name": "Maria Santos", "subcontractor": "Electro-Mech", "signed": 1})

        tbt.insert()
        self.assertEqual(tbt.attendee_count, 3)

    def test_osh_incident_report_tracking(self):
        """Verify DOLE OSH Incident Report records lost workdays and CAPA status."""
        incident = OSHIncidentReport(
            "OSH Incident Report",
            name="OSH-2026-00001",
            project=self.project.name,
            incident_type="Lost Time Injury (LTI)",
            incident_date="2026-03-02 10:30:00",
            location_on_site="Grid 4-D 3rd Floor Slab Edge",
            injured_person_name="Juan Dela Cruz",
            injury_description="Ankle sprain due to tripping over unsecured rebar bundling",
            days_lost=5,
            root_cause="Improper housekeeping and lack of designated material staging area",
            capa_action="Rebar bundles moved to designated storage racks; site housekeeping inspection instituted twice daily",
            status="Reported",
        )
        incident.insert()
        self.assertEqual(incident.days_lost, 5)

    # --------------------------------------------------------------------------
    # 6. Field Operations and RFI
    # --------------------------------------------------------------------------
    def test_daily_site_report_and_rfi_lifecycle(self):
        """Verify daily site diary headcount aggregation and RFI transition."""
        dsr = DailySiteReport(
            "Daily Site Report",
            name="DSR-2026-00001",
            project=self.project.name,
            report_date="2026-03-03",
            weather_morning="Sunny",
            weather_afternoon="Cloudy",
        )
        dsr.append("subcontractors", {
            "subcontractor": "Megawide Rebar Gang",
            "trade": "Rebar Fixing",
            "workers_count": 18,
            "work_description": "Rebar layout for 4th floor columns",
        })
        dsr.append("subcontractors", {
            "subcontractor": "Formwork Specialists",
            "trade": "Formwork",
            "workers_count": 12,
            "work_description": "Column formwork erection",
        })
        dsr.insert()

        self.assertEqual(dsr.total_manpower, 30)

        # Test RFI
        rfi = RFI(
            "RFI",
            name="RFI-2026-00001",
            project=self.project.name,
            rfi_title="Clarification on Beam B-24 Stirrups Spacing",
            discipline="Structural",
            question="Structural drawing S-12 shows stirrups at 100mm, but detail schedule specifies 150mm. Please clarify.",
            status="Open",
        )
        rfi.insert()
        self.assertEqual(rfi.status, "Open")

        # Provide consultant response
        rfi.response = "Confirmed: stirrup spacing is 100mm near supports (first 1.5m), then 150mm at center."
        rfi.responded_by = "Structural Engineer Engr. Gomez"
        rfi.response_date = "2026-03-04"
        rfi.save()

        self.assertEqual(rfi.status, "Responded")

    # --------------------------------------------------------------------------
    # 7. Native Integration and Custom Fields Patch
    # --------------------------------------------------------------------------
    def test_native_integration_patch(self):
        """Verify v2_construction_pm_native_fields executes cleanly and seeds QA templates."""
        v2_construction_pm_native_fields.execute()
        # Verify inspection template was seeded in mock db
        template_exists = mock_frappe_db.exists("Quality Inspection Template", "ASTM C39 Concrete Cylinder 28-Day Compressive Test")
        self.assertTrue(template_exists)


if __name__ == "__main__":
    unittest.main(verbosity=2)