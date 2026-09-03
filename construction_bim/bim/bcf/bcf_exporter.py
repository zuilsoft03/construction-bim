"""buildingSMART BCF-XML Archive Serializer & Exporter for Frappe / ERPNext.

Module: construction_bim.bim.bcf.bcf_exporter
"""

from __future__ import annotations

import io
import json
import logging
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import frappe
from frappe import _

logger = logging.getLogger(__name__)


class BCFExporter:
    """Serializes Frappe BCF records into a standard BCF-XML zip archive."""

    def __init__(self, bcf_project_name: str, bcf_version: str = "2.1"):
        self.project = frappe.get_doc("BCF Project", bcf_project_name)
        self.bcf_version = bcf_version or self.project.bcf_version or "2.1"
        self.zip_buffer = io.BytesIO()

    def export_bytes(self) -> bytes:
        """Generate zip archive bytes."""
        with zipfile.ZipFile(self.zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            # 1. bcf.version
            zf.writestr("bcf.version", self._build_version_xml())

            # 2. Extensions
            if self.bcf_version.startswith("3"):
                zf.writestr("extensions.json", self._build_extensions_json())
            else:
                zf.writestr("extensions.xml", self._build_extensions_xml())

            # 3. Topics
            topics = frappe.get_all(
                "BCF Topic",
                filters={"bcf_project": self.project.name},
                fields=["name", "guid"]
            )
            for t in topics:
                doc_t = frappe.get_doc("BCF Topic", t.name)
                self._write_topic_package(zf, doc_t)

        return self.zip_buffer.getvalue()

    def _build_version_xml(self) -> str:
        return (
            f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<Version VersionId="{self.bcf_version}">'
            f'<DetailedVersion>{self.bcf_version}</DetailedVersion>'
            f'</Version>'
        )

    def _build_extensions_xml(self) -> str:
        types = json.loads(self.project.topic_types or "[]")
        statuses = json.loads(self.project.topic_statuses or "[]")
        priorities = json.loads(self.project.priorities or "[]")

        xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        xml += '<Extensions xmlns="http://www.buildingsmart-tech.org/specifications/bcf/2.1/extensions.xsd">\n'
        xml += '  <TopicTypes>' + ''.join(f'<TopicType>{t}</TopicType>' for t in types) + '</TopicTypes>\n'
        xml += '  <TopicStatuses>' + ''.join(f'<TopicStatus>{s}</TopicStatus>' for s in statuses) + '</TopicStatuses>\n'
        xml += '  <Priorities>' + ''.join(f'<Priority>{p}</Priority>' for p in priorities) + '</Priorities>\n'
        xml += '</Extensions>'
        return xml

    def _build_extensions_json(self) -> str:
        return json.dumps({
            "topic_type": json.loads(self.project.topic_types or "[]"),
            "topic_status": json.loads(self.project.topic_statuses or "[]"),
            "priority": json.loads(self.project.priorities or "[]"),
            "topic_label": json.loads(self.project.topic_labels or "[]"),
            "stage": json.loads(self.project.stages or "[]")
        }, indent=2)

    def _write_topic_package(self, zf: zipfile.ZipFile, doc_t):
        t_guid = doc_t.guid

        # 1. markup.bcf
        ns = (
            "http://www.buildingsmart-tech.org/specifications/bcf/2.1/markup.xsd"
            if not self.bcf_version.startswith("3")
            else "https://standards.buildingsmart.org/BCF/XML/3.0/markup.xsd"
        )
        markup = f'<?xml version="1.0" encoding="UTF-8"?>\n<Markup xmlns="{ns}">\n'
        markup += f'  <Topic Guid="{t_guid}" TopicType="{doc_t.topic_type or "Clash"}" TopicStatus="{doc_t.topic_status or "Open"}">\n'
        markup += f'    <Title>{_escape_xml(doc_t.title or "Untitled")}</Title>\n'
        markup += f'    <Priority>{doc_t.priority or "Medium"}</Priority>\n'
        markup += f'    <CreationDate>{doc_t.creation_date or datetime.now(timezone.utc).isoformat()}</CreationDate>\n'
        markup += f'    <CreationAuthor>{doc_t.creation_author or "Administrator"}</CreationAuthor>\n'
        if doc_t.assigned_to:
            markup += f'    <AssignedTo>{_escape_xml(doc_t.assigned_to)}</AssignedTo>\n'
        if doc_t.description:
            markup += f'    <Description>{_escape_xml(doc_t.description)}</Description>\n'
        markup += '  </Topic>\n'

        # Comments
        comments = frappe.get_all(
            "BCF Comment",
            filters={"topic": doc_t.name},
            fields=["guid", "author", "date", "comment", "status"]
        )
        for c in comments:
            markup += f'  <Comment Guid="{c.guid}">\n'
            markup += f'    <Date>{c.date or datetime.now(timezone.utc).isoformat()}</Date>\n'
            markup += f'    <Author>{_escape_xml(c.author or "Anonymous")}</Author>\n'
            markup += f'    <Comment>{_escape_xml(c.comment or "")}</Comment>\n'
            markup += f'    <Status>{c.status or "Open"}</Status>\n'
            markup += '  </Comment>\n'

        markup += '</Markup>'
        zf.writestr(f"{t_guid}/markup.bcf", markup)

        # 2. Viewpoints
        vps = frappe.get_all(
            "BCF Viewpoint",
            filters={"topic": doc_t.name},
            fields=["name", "guid", "snapshot"]
        )
        for vp_row in vps:
            vp_doc = frappe.get_doc("BCF Viewpoint", vp_row.name)
            zf.writestr(f"{t_guid}/viewpoint.bcfv", self._build_viewpoint_xml(vp_doc))

            if vp_doc.snapshot and hasattr(frappe, "get_doc"):
                try:
                    file_doc = frappe.get_doc("File", {"file_url": vp_doc.snapshot})
                    zf.writestr(f"{t_guid}/snapshot.png", file_doc.get_content())
                except Exception as e:
                    logger.warning(f"Could not attach snapshot file for {vp_doc.guid}: {e}")

    def _build_viewpoint_xml(self, vp) -> str:
        ns = (
            "http://www.buildingsmart-tech.org/specifications/bcf/2.1/viewpoint.xsd"
            if not self.bcf_version.startswith("3")
            else "https://standards.buildingsmart.org/BCF/XML/3.0/viewpoint.xsd"
        )
        xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<VisualizationInfo xmlns="{ns}" Guid="{vp.guid}">\n'

        pos = _safe_json_dict(vp.camera_position, {"x": 0.0, "y": 0.0, "z": 0.0})
        dir_v = _safe_json_dict(vp.camera_direction, {"x": 0.0, "y": 0.0, "z": -1.0})
        up_v = _safe_json_dict(vp.camera_up_vector, {"x": 0.0, "y": 1.0, "z": 0.0})

        if vp.viewpoint_type == "Perspective":
            xml += '  <PerspectiveCamera>\n'
            xml += f'    <CameraViewPoint><X>{pos.get("x", 0.0)}</X><Y>{pos.get("y", 0.0)}</Y><Z>{pos.get("z", 0.0)}</Z></CameraViewPoint>\n'
            xml += f'    <CameraDirection><X>{dir_v.get("x", 0.0)}</X><Y>{dir_v.get("y", 0.0)}</Y><Z>{dir_v.get("z", -1.0)}</Z></CameraDirection>\n'
            xml += f'    <CameraUpVector><X>{up_v.get("x", 0.0)}</X><Y>{up_v.get("y", 0.0)}</Y><Z>{up_v.get("z", 1.0)}</Z></CameraUpVector>\n'
            xml += f'    <FieldOfView>{vp.field_of_view or 60.0}</FieldOfView>\n'
            xml += f'    <AspectRatio>{vp.aspect_ratio or 1.777778}</AspectRatio>\n'
            xml += '  </PerspectiveCamera>\n'
        else:
            xml += '  <OrthogonalCamera>\n'
            xml += f'    <CameraViewPoint><X>{pos.get("x", 0.0)}</X><Y>{pos.get("y", 0.0)}</Y><Z>{pos.get("z", 0.0)}</Z></CameraViewPoint>\n'
            xml += f'    <CameraDirection><X>{dir_v.get("x", 0.0)}</X><Y>{dir_v.get("y", 0.0)}</Y><Z>{dir_v.get("z", -1.0)}</Z></CameraDirection>\n'
            xml += f'    <CameraUpVector><X>{up_v.get("x", 0.0)}</X><Y>{up_v.get("y", 0.0)}</Y><Z>{up_v.get("z", 1.0)}</Z></CameraUpVector>\n'
            xml += f'    <ViewToWorldScale>{vp.view_to_world_scale or 10.0}</ViewToWorldScale>\n'
            xml += '  </OrthogonalCamera>\n'

        # Component selection
        sels = _safe_json_list(vp.selection)
        if sels:
            xml += '  <Components>\n    <Selection>\n'
            for s in sels:
                if isinstance(s, dict) and s.get("ifc_guid"):
                    xml += f'      <Component IfcGuid="{s.get("ifc_guid")}" />\n'
            xml += '    </Selection>\n  </Components>\n'

        xml += '</VisualizationInfo>'
        return xml


def _escape_xml(text: str) -> str:
    if not text:
        return ""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _safe_json_dict(val: Any, default: Dict[str, Any]) -> Dict[str, Any]:
    if not val:
        return default
    if isinstance(val, dict):
        return val
    try:
        parsed = json.loads(val)
        return parsed if isinstance(parsed, dict) else default
    except Exception:
        return default


def _safe_json_list(val: Any) -> List[Any]:
    if not val:
        return []
    if isinstance(val, list):
        return val
    try:
        parsed = json.loads(val)
        return parsed if isinstance(parsed, list) else []
    except Exception:
        return []
