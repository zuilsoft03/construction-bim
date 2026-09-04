"""Lossless BCF-XML (v2.1 & v3.0) Archive Importer for Frappe / ERPNext.

Module: construction_bim.bim.bcf.bcf_importer
"""

from __future__ import annotations

import io
import json
import logging
import os
import uuid
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import frappe
from frappe import _

logger = logging.getLogger(__name__)


class BCFImporter:
    """Processes buildingSMART BCF-XML archives and persists them to Frappe DocTypes."""

    def __init__(self, zip_bytes: bytes, project_name: Optional[str] = None, erpnext_project: Optional[str] = None):
        self.zip_bytes = zip_bytes
        self.project_name = project_name
        self.erpnext_project = erpnext_project
        self.zf: Optional[zipfile.ZipFile] = None
        self.file_list: List[str] = []
        self.bcf_version: str = "2.1"

    def process(self) -> Dict[str, Any]:
        """Execute extraction and database insertion."""
        with zipfile.ZipFile(io.BytesIO(self.zip_bytes), "r") as zf:
            self.zf = zf
            self.file_list = zf.namelist()
            self._detect_version()
            bcf_proj = self._create_bcf_project()

            topic_dirs = {
                name.split("/")[0]
                for name in self.file_list
                if "/" in name and not name.startswith("__") and not name.startswith(".")
            }
            imported_count = 0

            for t_guid in topic_dirs:
                if self._import_topic(t_guid, bcf_proj.name):
                    imported_count += 1

            bcf_proj.topic_count = imported_count
            bcf_proj.save(ignore_permissions=True)
            frappe.db.commit()

            return {
                "project_name": bcf_proj.name,
                "project_id": bcf_proj.project_id,
                "topics_imported": imported_count,
                "bcf_version": self.bcf_version
            }

    def _detect_version(self):
        if "bcf.version" in self.file_list and self.zf:
            try:
                root = ET.fromstring(self.zf.read("bcf.version"))
                self.bcf_version = root.attrib.get("VersionId", "2.1")
            except Exception as e:
                logger.warning(f"Failed to parse bcf.version: {e}")

    def _create_bcf_project(self):
        proj = frappe.new_doc("BCF Project")
        proj.project_name = self.project_name or f"Imported BCF {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        proj.project_id = str(uuid.uuid4())
        proj.erpnext_project = self.erpnext_project
        proj.bcf_version = "3.0" if self.bcf_version.startswith("3") else "2.1"

        # Check for extensions.json (v3.0) or extensions.xml (v2.1)
        if "extensions.json" in self.file_list and self.zf:
            try:
                ext_data = json.loads(self.zf.read("extensions.json").decode("utf-8"))
                proj.topic_types = json.dumps(ext_data.get("topic_type", []))
                proj.topic_statuses = json.dumps(ext_data.get("topic_status", []))
                proj.priorities = json.dumps(ext_data.get("priority", []))
                proj.topic_labels = json.dumps(ext_data.get("topic_label", []))
                proj.stages = json.dumps(ext_data.get("stage", []))
            except Exception as e:
                logger.warning(f"Failed to parse extensions.json: {e}")
        elif "extensions.xml" in self.file_list and self.zf:
            try:
                root = ET.fromstring(self.zf.read("extensions.xml"))
                proj.topic_types = json.dumps([el.text for el in root.findall(".//{*}TopicType") if el.text])
                proj.topic_statuses = json.dumps([el.text for el in root.findall(".//{*}TopicStatus") if el.text])
                proj.priorities = json.dumps([el.text for el in root.findall(".//{*}Priority") if el.text])
            except Exception as e:
                logger.warning(f"Failed to parse extensions.xml: {e}")

        proj.insert(ignore_permissions=True)
        return proj

    def _import_topic(self, topic_guid: str, bcf_project_name: str) -> bool:
        markup_path = f"{topic_guid}/markup.bcf"
        if markup_path not in self.file_list or not self.zf:
            return False

        try:
            markup_xml = self.zf.read(markup_path)
            root = ET.fromstring(markup_xml)
        except Exception as e:
            logger.error(f"Failed to read {markup_path}: {e}")
            return False

        topic_el = root.find(".//{*}Topic")
        if topic_el is None:
            return False

        guid = topic_el.attrib.get("Guid", topic_guid)
        title = _get_xml_text(topic_el, "Title") or "Untitled Topic"
        topic_type = topic_el.attrib.get("TopicType") or _get_xml_text(topic_el, "TopicType") or "Issue"
        topic_status = topic_el.attrib.get("TopicStatus") or _get_xml_text(topic_el, "TopicStatus") or "Open"
        priority = _get_xml_text(topic_el, "Priority") or "Medium"
        description = _get_xml_text(topic_el, "Description") or ""
        assigned_to = _get_xml_text(topic_el, "AssignedTo")
        creation_date = _get_xml_text(topic_el, "CreationDate")
        creation_author = _get_xml_text(topic_el, "CreationAuthor")
        due_date = _get_xml_text(topic_el, "DueDate")

        labels = [el.text for el in topic_el.findall(".//{*}Labels") if el.text]

        doc_topic = frappe.new_doc("BCF Topic")
        doc_topic.guid = guid
        doc_topic.bcf_project = bcf_project_name
        doc_topic.title = title
        doc_topic.topic_type = topic_type
        doc_topic.topic_status = topic_status
        doc_topic.priority = priority
        doc_topic.description = description
        doc_topic.assigned_to = assigned_to if assigned_to and frappe.db.exists("User", assigned_to) else None
        doc_topic.creation_date = creation_date
        doc_topic.creation_author = creation_author
        doc_topic.due_date = due_date
        if labels:
            doc_topic.labels = json.dumps(labels)

        doc_topic.insert(ignore_permissions=True)

        # Import Comments (filter to comment records to avoid matching inner <Comment> text nodes)
        comments = [el for el in root.findall(".//{*}Comment") if "Guid" in el.attrib] or root.findall("./{*}Comment")
        for c_el in comments:
            c_guid = c_el.attrib.get("Guid", str(uuid.uuid4()))
            c_author = _get_xml_text(c_el, "Author") or "Anonymous"
            c_date = _get_xml_text(c_el, "Date")
            c_text = _get_xml_text(c_el, "Comment") or ""
            c_status = _get_xml_text(c_el, "Status") or "Open"

            doc_comm = frappe.new_doc("BCF Comment")
            doc_comm.guid = c_guid
            doc_comm.topic = doc_topic.name
            doc_comm.author = c_author
            doc_comm.date = c_date
            doc_comm.comment = c_text
            doc_comm.status = c_status
            doc_comm.insert(ignore_permissions=True)

        # Import Viewpoints
        self._import_viewpoints(topic_guid, doc_topic)
        return True

    def _import_viewpoints(self, topic_guid: str, doc_topic):
        vp_files = [
            f for f in self.file_list
            if f.startswith(f"{topic_guid}/") and f.endswith(".bcfv")
        ]

        for vp_path in vp_files:
            try:
                vp_xml = self.zf.read(vp_path)
                root = ET.fromstring(vp_xml)
            except Exception as e:
                logger.error(f"Failed to parse {vp_path}: {e}")
                continue

            vp = frappe.new_doc("BCF Viewpoint")
            vp.guid = root.attrib.get("Guid", str(uuid.uuid4()))
            vp.topic = doc_topic.name

            persp = root.find(".//{*}PerspectiveCamera")
            ortho = root.find(".//{*}OrthogonalCamera")

            if persp is not None:
                vp.viewpoint_type = "Perspective"
                vp.camera_position = json.dumps(_extract_point(persp, "CameraViewPoint"))
                vp.camera_direction = json.dumps(_extract_point(persp, "CameraDirection"))
                vp.camera_up_vector = json.dumps(_extract_point(persp, "CameraUpVector"))
                vp.field_of_view = float(_get_xml_text(persp, "FieldOfView") or 60.0)
                vp.aspect_ratio = float(_get_xml_text(persp, "AspectRatio") or 1.777778)
            elif ortho is not None:
                vp.viewpoint_type = "Orthogonal"
                vp.camera_position = json.dumps(_extract_point(ortho, "CameraViewPoint"))
                vp.camera_direction = json.dumps(_extract_point(ortho, "CameraDirection"))
                vp.camera_up_vector = json.dumps(_extract_point(ortho, "CameraUpVector"))
                vp.view_to_world_scale = float(_get_xml_text(ortho, "ViewToWorldScale") or 10.0)

            # Component Selection
            selection = []
            for sel in root.findall(".//{*}Selection/{*}Component"):
                selection.append({
                    "ifc_guid": sel.attrib.get("IfcGuid"),
                    "originating_system": sel.attrib.get("OriginatingSystem"),
                    "authoring_tool_id": sel.attrib.get("AuthoringToolId")
                })
            vp.selection = json.dumps([s for s in selection if s.get("ifc_guid")])

            # Snapshot Image
            snap_path = vp_path.replace(".bcfv", ".png")
            if snap_path not in self.file_list:
                snap_path = f"{topic_guid}/snapshot.png"

            if snap_path in self.file_list and hasattr(frappe, "utils") and hasattr(frappe.utils, "file_manager"):
                try:
                    import frappe.utils.file_manager as fm
                    snap_bytes = self.zf.read(snap_path)
                    file_doc = fm.save_file(f"snapshot_{vp.guid}.png", snap_bytes, "BCF Viewpoint", vp.name, is_private=0)
                    vp.snapshot = file_doc.file_url
                except Exception as e:
                    logger.warning(f"Could not save snapshot file: {e}")

            vp.insert(ignore_permissions=True)
            if not doc_topic.default_viewpoint:
                doc_topic.default_viewpoint = vp.name
                doc_topic.save(ignore_permissions=True)


def _get_xml_text(element: ET.Element, tag: str) -> Optional[str]:
    if tag == ".":
        return element.text.strip() if element.text else None
    el = element.find(f"./{tag}") or element.find(f"./{{*}}{tag}")
    if el is None:
        el = element.find(f".//{tag}") or element.find(f".//{{*}}{tag}")
    return el.text.strip() if el is not None and el.text else None


def _extract_point(parent: ET.Element, tag: str) -> Dict[str, float]:
    el = parent.find(f".//{tag}") or parent.find(f"{{*}}{tag}")
    if el is None:
        return {"x": 0.0, "y": 0.0, "z": 0.0}
    return {
        "x": float(_get_xml_text(el, "X") or 0.0),
        "y": float(_get_xml_text(el, "Y") or 0.0),
        "z": float(_get_xml_text(el, "Z") or 0.0)
    }
