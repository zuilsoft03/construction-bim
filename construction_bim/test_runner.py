"""Test runner executable via bench execute."""

import unittest
import sys
import frappe

def run_all_tests():
    """Execute all construction_bim backend unit tests."""
    print("======================================================================")
    print("Starting Construction BIM Backend Test Runner (Clash & BOM Suite)")
    print("======================================================================")

    # Disable test record generation hooks that touch accounting fiscal years
    frappe.flags.in_test = True
    frappe.set_user("Administrator")

    # Discover and load tests
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Import test cases directly
    from construction_bim.bim.doctype.bim_clash.test_bim_clash import TestBIMClash
    from construction_bim.bim.doctype.bim_bom_generator.test_bim_bom_generator import TestBIMBOMGenerator
    from construction_bim.bim.doctype.bim_issue.test_bim_issue import TestBIMIssue
    from test.test_bim_clash_and_bom import TestBIMClashAndBOMSuite
    from test.test_cad_bcf_suite import TestCADAndBCFCollaboration

    suite.addTests(loader.loadTestsFromTestCase(TestBIMClash))
    suite.addTests(loader.loadTestsFromTestCase(TestBIMBOMGenerator))
    suite.addTests(loader.loadTestsFromTestCase(TestBIMIssue))
    suite.addTests(loader.loadTestsFromTestCase(TestBIMClashAndBOMSuite))
    suite.addTests(loader.loadTestsFromTestCase(TestCADAndBCFCollaboration))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("======================================================================")
    print(f"Tests run: {result.testsRun}, Errors: {len(result.errors)}, Failures: {len(result.failures)}")
    print("======================================================================")

    if not result.wasSuccessful():
        raise Exception(f"Tests failed: {len(result.failures)} failures, {len(result.errors)} errors")

    return {
        "tests_run": result.testsRun,
        "failures": len(result.failures),
        "errors": len(result.errors),
        "successful": result.wasSuccessful(),
    }

if __name__ == "__main__":
    run_all_tests()
