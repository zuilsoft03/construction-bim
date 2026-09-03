import unittest, json, re, io, uuid, zipfile, pathlib
import xml.etree.ElementTree as ET

class TestBCFStandardsAndSchemaCompliance(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        base_dir = pathlib.Path(__file__).resolve().parent.parent
        docs = base_dir / "study" / "openproject_bim"
        if not docs.exists():
            docs = base_dir / "docs" / "study" / "openproject_bim"
        p3 = docs / "03_technical_specifications_and_schemas.md"
        p4 = docs / "04_api_contracts_and_bcf_exchange.md"
        cls.doc3 = p3.read_text(encoding="utf-8")
        cls.doc4 = p4.read_text(encoding="utf-8")
        json_blocks = re.findall(r"`json\s*(.*?)\s*`", cls.doc3, re.DOTALL)
        cls.doctypes = {}
        for b in json_blocks:
            try:
                d = json.loads(b)
                if isinstance(d, dict) and d.get("doctype") == "DocType":
                    cls.doctypes[d.get("name")] = d
            except: pass

    def test_bcf_xml_structures(self):
        self.assertIn("bcf.version", self.doc4)
        self.assertIn("Version VersionId=", self.doc4)
        self.assertIn("markup.bcf", self.doc4)
        self.assertIn("<Markup", self.doc4)
        self.assertIn("<Topic", self.doc4)
        self.assertIn("viewpoint.bcfv", self.doc4)
        self.assertIn("<VisualizationInfo", self.doc4)
        self.assertIn("<PerspectiveCamera>", self.doc4)
        self.assertIn("extensions.xml", self.doc4)
        self.assertIn("extensions.json", self.doc4)

    def test_bcf_api_endpoints(self):
        endpoints = [
            "/bcf/versions", "/bcf/auth", "/bcf/2.1/projects",
            "/bcf/2.1/projects/{project_id}", "/bcf/2.1/projects/{project_id}/extensions",
            "/bcf/2.1/projects/{project_id}/topics",
            "/bcf/2.1/projects/{project_id}/topics/{topic_guid}",
            "/bcf/2.1/projects/{project_id}/topics/{topic_guid}/comments",
            "/bcf/2.1/projects/{project_id}/topics/{topic_guid}/comments/{comment_guid}",
            "/bcf/2.1/projects/{project_id}/topics/{topic_guid}/viewpoints",
            "/bcf/2.1/projects/{project_id}/topics/{topic_guid}/viewpoints/{viewpoint_guid}",
            "/bcf/2.1/projects/{project_id}/topics/{topic_guid}/viewpoints/{viewpoint_guid}/snapshot"
        ]
        for ep in endpoints:
            self.assertIn(ep, self.doc4, f"Missing standard endpoint {ep}")

    def test_http_status_codes(self):
        for code in ["200", "201", "204", "400", "401", "403", "404", "409"]:
            self.assertIn(code, self.doc4, f"Missing HTTP {code} documentation")

    def test_frappe_doctypes_and_field_orders(self):
        expected = ["BCF Project", "BCF Topic", "BCF Viewpoint", "BCF Comment", "BCF Component", "BIM Clash"]
        for name in expected:
            self.assertIn(name, self.doctypes, f"Missing DocType {name}")
            dt = self.doctypes[name]
            f_names = [f.get("fieldname") for f in dt.get("fields", [])]
            f_order = dt.get("field_order", [])
            missing_in_order = [fn for fn in f_names if fn not in f_order]
            missing_in_fields = [fn for fn in f_order if fn not in f_names]
            self.assertEqual(missing_in_order, [], f"{name} fields missing from field_order")
            self.assertEqual(missing_in_fields, [], f"{name} field_order has extra names")

    def test_bcf_xml_roundtrip_synthetic(self):
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("bcf.version", '<?xml version="1.0" encoding="UTF-8"?>\n<Version VersionId="2.1"><DetailedVersion>2.1</DetailedVersion></Version>')
            t_guid = str(uuid.uuid4())
            markup = f'<?xml version="1.0" encoding="UTF-8"?>\n<Markup xmlns="http://www.buildingsmart-tech.org/specifications/bcf/2.1/markup.xsd">\n  <Topic Guid="{t_guid}" TopicType="Clash" TopicStatus="Open">\n    <Title>Test Topic</Title>\n    <Priority>High</Priority>\n  </Topic>\n</Markup>'
            zf.writestr(f"{t_guid}/markup.bcf", markup)
        
        with zipfile.ZipFile(io.BytesIO(zip_buf.getvalue()), "r") as zf:
            root = ET.fromstring(zf.read(f"{t_guid}/markup.bcf"))
            top = root.find(".//{*}Topic")
            self.assertEqual(top.attrib.get("Guid"), t_guid)
            self.assertEqual(top.attrib.get("TopicType"), "Clash")

if __name__ == "__main__":
    unittest.main()