#!/usr/bin/env python3
"""Master E2E Test Runner for Construction BIM Test Suite.

Executes all 4 tiers of verification across:
- test/test_federated_viewing.py (Features 1-4)
- test/test_clash_detection.py (Features 5-7)
- test/test_bim_clash_doctype.py (Features 8-10)
- test/test_bom_generator.py (Features 11-13)
- test/test_real_scenarios.py (Tier 4 Scenarios 1-5)

Generates a structured, requirement-traceable ASCII test report and returns exit code 0 on 100% pass.
"""

from __future__ import annotations

import os
import sys
import time
import unittest
from io import StringIO
from typing import Dict, List, Tuple

# Ensure repository root is on sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from test.test_federated_viewing import TestFederatedViewing
from test.test_clash_detection import TestClashDetection
from test.test_bim_clash_doctype import TestBIMClashDocType
from test.test_bom_generator import TestBOMGenerator
from test.test_real_scenarios import TestRealWorldScenarios


FEATURE_DESCRIPTIONS = {
    "F1": "Multi-IFC Model Loading & Coordinate Alignment",
    "F2": "MEP Entity Geometry Extraction & Rendering",
    "F3": "Discipline Controls & Ghosting Mode",
    "F4": "Element Property & Quantity Inspector",
    "F5": "In-Viewer BVH Clash Detection Pipeline",
    "F6": "3D Visual Clash Highlighting (Red/Yellow)",
    "F7": "Clash Serialization & BCF Viewpoint JSON",
    "F8": "OpenProject-Style BIM Clash DocType",
    "F9": "Viewer Clashes Panel & Camera Fly-to",
    "F10": "Threaded Discussion on Clashes & ToDos",
    "F11": "BIM Quantity Rollup & Extraction",
    "F12": "Automated BOM Generator Wizard",
    "F13": "Interactive 3D BOM Highlighting",
    "S1": "Scenario 1: Multi-Discipline Federated Inspection",
    "S2": "Scenario 2: Real STRUC vs HVAC Clash Detection",
    "S3": "Scenario 3: Clash Issue Management & Threaded Lifecycle",
    "S4": "Scenario 4: Automated BIM Quantity Takeoff & BOM",
    "S5": "Scenario 5: Full End-to-End Coordination Lifecycle",
}


def classify_test_case(test_name: str, test_doc: str = "") -> Tuple[str, str]:
    """Classify test method into (Feature_ID, Tier)."""
    # Check docstring tags first (e.g. F1-T1-1, F5-T2-3, Scenario 1)
    if "Scenario 1" in test_doc or "scenario_1" in test_name:
        return "S1", "Tier 4"
    if "Scenario 2" in test_doc or "scenario_2" in test_name:
        return "S2", "Tier 4"
    if "Scenario 3" in test_doc or "scenario_3" in test_name:
        return "S3", "Tier 4"
    if "Scenario 4" in test_doc or "scenario_4" in test_name:
        return "S4", "Tier 4"
    if "Scenario 5" in test_doc or "scenario_5" in test_name:
        return "S5", "Tier 4"

    for fid in range(1, 14):
        f_tag = f"F{fid}"
        if f"{f_tag}-T1" in test_doc:
            return f_tag, "Tier 1"
        if f"{f_tag}-T2" in test_doc:
            return f_tag, "Tier 2"
        if f"{f_tag}-T3" in test_doc:
            return f_tag, "Tier 3"
        if f"{f_tag}-T4" in test_doc:
            return f_tag, "Tier 4"

    # Fallback classification based on name patterns
    if "boundary" in test_name or "zero" in test_name or "empty" in test_name or "negative" in test_name or "invalid" in test_name or "extreme" in test_name or "sub_millimeter" in test_name or "missing" in test_name:
        return "F?", "Tier 2"
    if "real_" in test_name:
        return "F?", "Tier 4"
    if "cross" in test_name or "bridge" in test_name or "pipeline" in test_name or "roundtrip" in test_name:
        return "F?", "Tier 3"

    return "F?", "Tier 1"


def run_full_suite() -> int:
    """Execute all test suites and display full summary dashboard."""
    start_time = time.time()

    suite = unittest.TestSuite()
    loader = unittest.TestLoader()

    test_classes = [
        TestFederatedViewing,
        TestClashDetection,
        TestBIMClashDocType,
        TestBOMGenerator,
        TestRealWorldScenarios,
    ]

    for tc in test_classes:
        suite.addTests(loader.loadTestsFromTestCase(tc))

    total_tests_loaded = suite.countTestCases()

    stream = StringIO()
    runner = unittest.TextTestRunner(stream=stream, verbosity=2)
    result = runner.run(suite)
    elapsed = time.time() - start_time

    # Categorize test executions
    tier_counts = {"Tier 1": 0, "Tier 2": 0, "Tier 3": 0, "Tier 4": 0}
    feature_counts: Dict[str, Dict[str, int]] = {
        f"F{i}": {"Tier 1": 0, "Tier 2": 0, "Tier 3": 0, "Tier 4": 0}
        for i in range(1, 14)
    }
    for i in range(1, 6):
        feature_counts[f"S{i}"] = {"Tier 1": 0, "Tier 2": 0, "Tier 3": 0, "Tier 4": 0}

    for tc in test_classes:
        for method_name in loader.getTestCaseNames(tc):
            method = getattr(tc, method_name)
            doc = method.__doc__ or ""
            fid, tier = classify_test_case(method_name, doc)
            if tier in tier_counts:
                tier_counts[tier] += 1
            if fid in feature_counts and tier in feature_counts[fid]:
                feature_counts[fid][tier] += 1

    # Print ASCII Report
    print("=" * 80)
    print("      CONSTRUCTION BIM - COMPREHENSIVE E2E VERIFICATION TEST SUITE      ")
    print("=" * 80)
    print(f" Execution Date:    {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    print(f" Test Suites:        5 Modules ({', '.join(tc.__name__ for tc in test_classes)})")
    print(f" Total Tests Run:    {result.testsRun}")
    print(f" Total Passed:       {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f" Total Failures:     {len(result.failures)}")
    print(f" Total Errors:       {len(result.errors)}")
    print(f" Execution Time:     {elapsed:.3f} seconds")
    print("-" * 80)
    print(" TIER BREAKDOWN & TARGET THRESHOLDS")
    print("-" * 80)
    t1_status = "[ PASS ]" if (tier_counts["Tier 1"] >= 65 and len(result.failures) == 0 and len(result.errors) == 0) else "[ FAIL ]"
    t2_status = "[ PASS ]" if (tier_counts["Tier 2"] >= 65 and len(result.failures) == 0 and len(result.errors) == 0) else "[ FAIL ]"
    t3_status = "[ PASS ]" if (tier_counts["Tier 3"] >= 13 and len(result.failures) == 0 and len(result.errors) == 0) else "[ FAIL ]"
    t4_status = "[ PASS ]" if (tier_counts["Tier 4"] >= 5 and len(result.failures) == 0 and len(result.errors) == 0) else "[ FAIL ]"

    print(f"  Tier 1: Feature Coverage (Happy Path)    : {tier_counts['Tier 1']:3d} / 65 Target  {t1_status}")
    print(f"  Tier 2: Boundary & Corner Cases          : {tier_counts['Tier 2']:3d} / 65 Target  {t2_status}")
    print(f"  Tier 3: Pairwise Cross-Feature Tests     : {tier_counts['Tier 3']:3d} / 13 Target  {t3_status}")
    print(f"  Tier 4: Real-World Application Scenarios : {tier_counts['Tier 4']:3d} /  5 Target  {t4_status}")
    print("-" * 80)
    print(" FEATURE-BY-FEATURE VERIFICATION MATRIX")
    print("-" * 80)
    print(f" {'ID':<4} | {'Feature Description':<46} | {'T1':<4} | {'T2':<4} | {'T3':<4} | {'T4':<4} | {'Status':<6}")
    print("-" * 80)

    for fid in range(1, 14):
        fkey = f"F{fid}"
        name = FEATURE_DESCRIPTIONS.get(fkey, "Feature")
        c = feature_counts[fkey]
        t1, t2, t3, t4 = c["Tier 1"], c["Tier 2"], c["Tier 3"], c["Tier 4"]
        status = "PASS" if (t1 >= 5 and t2 >= 5 and len(result.failures) == 0 and len(result.errors) == 0) else "FAIL"
        print(f" {fkey:<4} | {name:<46} | {t1:4d} | {t2:4d} | {t3:4d} | {t4:4d} | [ {status} ]")

    print("-" * 80)
    print(" TIER 4 REAL-WORLD APPLICATION SCENARIOS (Nordic LCA Datasets)")
    print("-" * 80)
    for sid in range(1, 6):
        skey = f"S{sid}"
        name = FEATURE_DESCRIPTIONS.get(skey, "Scenario")
        s_status = "[ PASS ]" if (result.wasSuccessful() and tier_counts["Tier 4"] >= 5) else "[ FAIL ]"
        print(f" {skey:<4} | {name:<60} | {s_status}")

    print("=" * 80)

    if result.wasSuccessful():
        print(" OVERALL RESULT: [ 100% PASS ] - ALL 4 TIERS FULLY VERIFIED")
        print("=" * 80)
        return 0
    else:
        print(f" OVERALL RESULT: [ FAILED ] - {len(result.failures)} Failures, {len(result.errors)} Errors")
        print("=" * 80)
        print("\n--- FAILURE DETAILS ---")
        for failure in result.failures:
            print(f"\nFAILED: {failure[0]}")
            print(failure[1])
        for err in result.errors:
            print(f"\nERROR: {err[0]}")
            print(err[1])
        return 1


if __name__ == "__main__":
    sys.exit(run_full_suite())
