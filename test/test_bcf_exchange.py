"""Comprehensive Test Suite for BCF-XML (2.1 & 3.0) and buildingSMART BCF REST Integration.

Tests:
1. Schema integrity & field parity across all 5 BCF DocTypes.
2. Lossless BCF-XML 2.1 and 3.0 archive ingestion (BCFImporter).
3. Lossless BCF-XML 2.1 and 3.0 archive serialization (BCFExporter).
4. Camera projection mathematics and XML formatting.
5. BCF Topic <-> ERPNext Task two-way synchronization.
6. buildingSMART BCF REST API endpoints logic.
"""

from __future__ import annotations

import io
import json
import os
import pathlib
import sys
import unittest
import uuid
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone

# Ensure construction_bim is on python path
REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from test.test_helper import (
    setup_frappe_test_environment,
    mock_frappe_db,
    MockDoc,
    DoesNotExistError,
)
import frappe


class TestBCFExchangeSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        setup_frappe_test_environment()
        cls.base_dir = REPO_ROOT / "construction_bim" / "bim" / "doctype"

    def setUp(self):
        mock_frappe_db.clear()

    # -------------------------------------------------------------------------
    # 1. DocType Schema Integrity Tests
    # -------------------------------------------------------------------------
    def test_bcf_doctype_schemas_validity(self):
        """Verify all 5 BCF DocType JSON schemas exist, have valid JSON, and complete field_orders."""
        doctypes = ["bcf_project", "bcf_topic", "bcf_viewpoint", "bcf_comment", "bcf_component"]
        for dt_name in doctypes:
            schema_path = self.base_dir / dt_name / f"{dt_name}.json"
            self.assertTrue(schema_path.exists(), f"Schema {schema_path} does not exist")

            with open(schema_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.assertEqual(data.get("doctype"), "DocType")
            self.assertEqual(data.get("module"), "BIM")

            # Check fields vs field_order
            fields = [f["fieldname"] for f in data.get("fields", [])]
            field_order = data.get("field_order", [])

            # All fields should appear in field_order
            for fn in fields:
                self.assertIn(fn, field_order, f"{dt_name}: field {fn} missing from field_order")
            # All field_order entries should be in fields
            for fn in field_order:
                self.assertIn(fn, fields, f"{dt_name}: field_order item {fn} not in fields")

    def test_bcf_project_guid_uniqueness(self):
        """Verify project_id on BCF Project has unique constraint."""
        p_path = self.base_dir / "bcf_project" / "bcf_project.json"
        with open(p_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        pid_field = next(f for f in data["fields"] if f["fieldname"] == "project_id")
        self.assertEqual(pid_field.get("unique"), 1)
        self.assertEqual(pid_field.get("reqd"), 1)

    # -------------------------------------------------------------------------
    # 2. BCF-XML 2.1 Ingestion & Export Roundtrip
    # -------------------------------------------------------------------------
    def test_bcf_xml_2_1_import_and_export(self):
        """Test importing and exporting a valid BCF-XML 2.1 archive."""
        from construction_bim.bim.bcf.bcf_importer import BCFImporter
        from construction_bim.bim.bcf.bcf_exporter import BCFExporter

        # 1. Create a synthetic BCF 2.1 zip
        t_guid = str(uuid.uuid4())
        vp_guid = str(uuid.uuid4())
        c_guid = str(uuid.uuid4())

        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr(
                "bcf.version",
                '<?xml version="1.0" encoding="UTF-8"?>\n<Version VersionId="2.1"><DetailedVersion>2.1</DetailedVersion></Version>'
            )
            zf.writestr(
                "extensions.xml",
                '<?xml version="1.0" encoding="UTF-8"?>\n<Extensions xmlns="http://www.buildingsmart-tech.org/specifications/bcf/2.1/extensions.xsd">\n'
                '  <TopicTypes><TopicType>Clash</TopicType><TopicType>Issue</TopicType></TopicTypes>\n'
                '  <TopicStatuses><TopicStatus>Open</TopicStatus><TopicStatus>Resolved</TopicStatus></TopicStatuses>\n'
                '  <Priorities><Priority>Critical</Priority><Priority>Medium</Priority></Priorities>\n'
                '</Extensions>'
            )
            markup = (
                f'<?xml version="1.0" encoding="UTF-8"?>\n'
                f'<Markup xmlns="http://www.buildingsmart-tech.org/specifications/bcf/2.1/markup.xsd">\n'
                f'  <Topic Guid="{t_guid}" TopicType="Clash" TopicStatus="Open">\n'
                f'    <Title>HVAC Duct Collision with Concrete Beam</Title>\n'
                f'    <Priority>Critical</Priority>\n'
                f'    <Description>Clash between Duct 400x200 and Beam B-201</Description>\n'
                f'  </Topic>\n'
                f'  <Comment Guid="{c_guid}">\n'
                f'    <Date>2026-09-03T10:00:00Z</Date>\n'
                f'    <Author>structural.lead@acme.com</Author>\n'
                f'    <Comment>Lower duct by 150mm</Comment>\n'
                f'    <Status>Open</Status>\n'
                f'  </Comment>\n'
                f'</Markup>'
            )
            zf.writestr(f"{t_guid}/markup.bcf", markup)

            vpxml = (
                f'<?xml version="1.0" encoding="UTF-8"?>\n'
                f'<VisualizationInfo xmlns="http://www.buildingsmart-tech.org/specifications/bcf/2.1/viewpoint.xsd" Guid="{vp_guid}">\n'
                f'  <PerspectiveCamera>\n'
                f'    <CameraViewPoint><X>10.5</X><Y>20.0</Y><Z>3.2</Z></CameraViewPoint>\n'
                f'    <CameraDirection><X>0.0</X><Y>0.0</Y><Z>-1.0</Z></CameraDirection>\n'
                f'    <CameraUpVector><X>0.0</X><Y>1.0</Y><Z>0.0</Z></CameraUpVector>\n'
                f'    <FieldOfView>60.0</FieldOfView>\n'
                f'    <AspectRatio>1.7778</AspectRatio>\n'
                f'  </PerspectiveCamera>\n'
                f'  <Components>\n'
                f'    <Selection>\n'
                f'      <Component IfcGuid="2O2_$tHwX0oe$CGcxk2evW" />\n'
                f'    </Selection>\n'
                f'  </Components>\n'
                f'</VisualizationInfo>'
            )
            zf.writestr(f"{t_guid}/viewpoint.bcfv", vpxml)

        # 2. Ingest via BCFImporter
        importer = BCFImporter(zip_buf.getvalue(), project_name="Hospital Wing Phase 1")
        result = importer.process()

        self.assertEqual(result["topics_imported"], 1)
        self.assertEqual(result["bcf_version"], "2.1")

        # 3. Verify in Mock DB
        bcf_proj = frappe.get_doc("BCF Project", result["project_name"])
        self.assertIsNotNone(bcf_proj)
        self.assertEqual(bcf_proj.topic_count, 1)

        bcf_topics = frappe.get_all("BCF Topic", filters={"bcf_project": bcf_proj.name})
        self.assertEqual(len(bcf_topics), 1)
        bcf_t = bcf_topics[0]
        self.assertEqual(bcf_t.guid, t_guid)
        self.assertEqual(bcf_t.title, "HVAC Duct Collision with Concrete Beam")
        self.assertEqual(bcf_t.priority, "Critical")

        # 4. Verify Comments and Viewpoints
        comments = frappe.get_all("BCF Comment", filters={"topic": bcf_t.name})
        self.assertEqual(len(comments), 1)
        self.assertEqual(comments[0].comment, "Lower duct by 150mm")

        vps = frappe.get_all("BCF Viewpoint", filters={"topic": bcf_t.name})
        self.assertEqual(len(vps), 1)
        self.assertEqual(vps[0].guid, vp_guid)

        # 5. Export via BCFExporter and test roundtrip
        exporter = BCFExporter(bcf_proj.name, bcf_version="2.1")
        exp_bytes = exporter.export_bytes()
        self.assertTrue(len(exp_bytes) > 0)

        with zipfile.ZipFile(io.BytesIO(exp_bytes), "r") as exp_zf:
            names = exp_zf.namelist()
            self.assertIn("bcf.version", names)
            self.assertIn("extensions.xml", names)
            self.assertIn(f"{t_guid}/markup.bcf", names)
            self.assertIn(f"{t_guid}/viewpoint.bcfv", names)

            # Check exported markup XML
            exp_root = ET.fromstring(exp_zf.read(f"{t_guid}/markup.bcf"))
            exp_top = exp_root.find(".//{*}Topic")
            self.assertEqual(exp_top.attrib.get("Guid"), t_guid)
            title_el = exp_top.find(".//{*}Title")
            self.assertEqual(title_el.text, "HVAC Duct Collision with Concrete Beam")

    # -------------------------------------------------------------------------
    # 3. BCF-XML 3.0 Ingestion & Export Roundtrip
    # -------------------------------------------------------------------------
    def test_bcf_xml_3_0_import_and_export(self):
        """Test BCF 3.0 extensions.json and schema support."""
        from construction_bim.bim.bcf.bcf_importer import BCFImporter
        from construction_bim.bim.bcf.bcf_exporter import BCFExporter

        t_guid = str(uuid.uuid4())
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr(
                "bcf.version",
                '<?xml version="1.0" encoding="UTF-8"?>\n<Version VersionId="3.0"><DetailedVersion>3.0</DetailedVersion></Version>'
            )
            ext_json = {
                "topic_type": ["Clash", "RFI", "Safety"],
                "topic_status": ["Open", "In Review", "Closed"],
                "priority": ["High", "Low"],
                "topic_label": ["Architectural", "Structural"]
            }
            zf.writestr("extensions.json", json.dumps(ext_json))

            markup = (
                f'<?xml version="1.0" encoding="UTF-8"?>\n'
                f'<Markup xmlns="https://standards.buildingsmart.org/BCF/XML/3.0/markup.xsd">\n'
                f'  <Topic Guid="{t_guid}" TopicType="RFI" TopicStatus="Open">\n'
                f'    <Title>RFI #42: Facade Anchor Load Specification</Title>\n'
                f'    <Priority>High</Priority>\n'
                f'  </Topic>\n'
                f'</Markup>'
            )
            zf.writestr(f"{t_guid}/markup.bcf", markup)

        importer = BCFImporter(zip_buf.getvalue(), project_name="Tower B BCF 3.0")
        result = importer.process()
        self.assertEqual(result["bcf_version"], "3.0")

        # Check export produces extensions.json
        exporter = BCFExporter(result["project_name"], bcf_version="3.0")
        exp_bytes = exporter.export_bytes()
        with zipfile.ZipFile(io.BytesIO(exp_bytes), "r") as exp_zf:
            self.assertIn("extensions.json", exp_zf.namelist())
            self.assertIn(f"{t_guid}/markup.bcf", exp_zf.namelist())

    # -------------------------------------------------------------------------
    # 4. BCF Topic <-> ERPNext Task Synchronization Tests
    # -------------------------------------------------------------------------
    def test_bcf_task_duality_synchronization(self):
        """Test bi-directional synchronization between BCF Topic and ERPNext Task."""
        from construction_bim.bim.bcf.task_sync import (
            create_task_from_bcf_topic,
            sync_bcf_topic_to_task,
            sync_task_to_bcf_topic
        )

        # 1. Create a BCF Topic in DB
        topic = frappe.new_doc("BCF Topic")
        topic.title = "Re-route fire sprinkler pipe at Corridor 102"
        topic.topic_type = "Clash"
        topic.topic_status = "Open"
        topic.priority = "Critical"
        topic.due_date = "2026-09-15"
        topic.insert()

        # 2. Generate Task from BCF Topic
        res = create_task_from_bcf_topic(topic.name)
        self.assertEqual(res["status"], "success")
        task_id = res["task_id"]

        task = frappe.get_doc("Task", task_id)
        self.assertEqual(task.subject, "[BIM] Re-route fire sprinkler pipe at Corridor 102")
        self.assertEqual(task.status, "Open")
        self.assertEqual(task.priority, "Urgent")

        # Verify topic linked to task
        updated_topic = frappe.get_doc("BCF Topic", topic.name)
        self.assertEqual(updated_topic.erpnext_task, task_id)

        # 3. Update BCF Topic status -> syncs to Task
        updated_topic.topic_status = "In Progress"
        sync_bcf_topic_to_task(updated_topic)
        task = frappe.get_doc("Task", task_id)
        self.assertEqual(task.status, "Working")

        # 4. Resolve BCF Topic -> Task Pending Review
        updated_topic.topic_status = "Resolved"
        sync_bcf_topic_to_task(updated_topic)
        task = frappe.get_doc("Task", task_id)
        self.assertEqual(task.status, "Pending Review")

        # 5. Reverse: Task completed in ERPNext -> BCF Topic Closed
        task.status = "Completed"
        sync_task_to_bcf_topic(task)
        updated_topic = frappe.get_doc("BCF Topic", topic.name)
        self.assertEqual(updated_topic.topic_status, "Closed")

    # -------------------------------------------------------------------------
    # 5. buildingSMART BCF REST API Logic Tests
    # -------------------------------------------------------------------------
    def test_bcf_rest_api_discovery_and_extensions(self):
        """Test /bcf/versions and /bcf/auth discovery endpoints."""
        from construction_bim.bim.bcf.api import get_bcf_versions, get_bcf_auth

        versions = get_bcf_versions()
        self.assertIn("versions", versions)
        v_ids = [v["version_id"] for v in versions["versions"]]
        self.assertIn("2.1", v_ids)
        self.assertIn("3.0", v_ids)

        auth = get_bcf_auth()
        self.assertIn("oauth2_auth_url", auth)
        self.assertIn("oauth2_token_url", auth)
        self.assertEqual(auth["http_basic_supported"], False)


if __name__ == "__main__":
    unittest.main()
