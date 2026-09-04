"""BIM Issue DocType Controller for BCF / BIMcollab issue collaboration."""

from __future__ import annotations

import json
import uuid
import xml.etree.ElementTree as ET
from typing import Any

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime, getdate, format_datetime


class BIMIssue(Document):
    """BCF-compliant issue record for 2D DWG/CAD and 3D BIM coordination."""

    def validate(self) -> None:
        """Validate fields and manage status transition lifecycle."""
        if not self.title:
            frappe.throw(frappe._("Title is required for a BIM Issue."))

        if not self.topic_type:
            self.topic_type = "Issue"

        if not self.topic_status:
            self.topic_status = "Open"

        if not self.priority:
            self.priority = "Normal"

        if self.is_new():
            if not self.created_by_user:
                self.created_by_user = frappe.session.user or "Administrator"
            if not self.creation_date:
                self.creation_date = now_datetime()

        # Handle resolution timestamp and resolver stamping
        previous_status = self.db_get("topic_status") if not self.is_new() else None
        if self.topic_status in ("Resolved", "Closed"):
            if previous_status not in ("Resolved", "Closed"):
                self.resolved_by = frappe.session.user or "Administrator"
                self.resolution_date = now_datetime()
        elif self.topic_status in ("Open", "In Progress"):
            if previous_status in ("Resolved", "Closed"):
                self.resolved_by = None
                self.resolution_date = None

    def add_discussion_comment(self, comment_text: str, new_status: str | None = None) -> dict[str, Any]:
        """Add a threaded collaboration comment and optionally update issue status."""
        self.check_permission("write")
        clean_comment = frappe.utils.escape_html(comment_text.strip())
        if not clean_comment:
            frappe.throw(frappe._("Comment cannot be empty."))

        comment_doc = frappe.get_doc({
            "doctype": "Comment",
            "comment_type": "Comment",
            "reference_doctype": "BIM Issue",
            "reference_name": self.name,
            "content": clean_comment,
            "comment_email": frappe.session.user,
            "comment_by": frappe.db.get_value("User", frappe.session.user, "full_name") or frappe.session.user,
        })
        comment_doc.insert(ignore_permissions=True)

        if new_status and new_status in ("Open", "In Progress", "Resolved", "Closed"):
            if new_status != self.topic_status:
                self.topic_status = new_status
                self.save()

        return {
            "name": comment_doc.name,
            "content": comment_doc.content,
            "creation": format_datetime(comment_doc.creation),
            "comment_by": comment_doc.comment_by,
            "comment_email": comment_doc.comment_email,
            "topic_status": self.topic_status,
        }

    def get_viewpoint_dict(self) -> dict[str, Any]:
        """Parse viewpoint_json into python dict."""
        if not self.viewpoint_json:
            return {}
        try:
            return json.loads(self.viewpoint_json)
        except Exception:
            return {}

    def to_bcf_topic_dict(self) -> dict[str, Any]:
        """Serialize into buildingSMART BCF 2.1 / 3.0 topic representation."""
        topic_guid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"bim_issue_{self.name}"))
        viewpoint_guid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"vp_{self.name}"))
        vp_dict = self.get_viewpoint_dict()

        comments = frappe.get_all(
            "Comment",
            filters={"reference_doctype": "BIM Issue", "reference_name": self.name, "comment_type": "Comment"},
            fields=["name", "content", "creation", "comment_by", "comment_email"],
            order_by="creation asc",
        )

        bcf_comments = []
        for c in comments:
            bcf_comments.append({
                "guid": str(uuid.uuid5(uuid.NAMESPACE_DNS, f"comment_{c.name}")),
                "date": c.creation.isoformat() if hasattr(c.creation, "isoformat") else str(c.creation),
                "author": c.comment_email or c.comment_by,
                "comment": c.content,
            })

        return {
            "topic": {
                "guid": topic_guid,
                "topic_type": self.topic_type,
                "topic_status": self.topic_status,
                "title": self.title,
                "priority": self.priority,
                "creation_date": self.creation_date.isoformat() if hasattr(self.creation_date, "isoformat") else str(self.creation_date),
                "creation_author": self.created_by_user,
                "modified_date": self.modified.isoformat() if hasattr(self.modified, "isoformat") else str(self.modified),
                "modified_author": self.modified_by,
                "due_date": str(self.due_date) if self.due_date else None,
                "assigned_to": self.assigned_to,
                "stage": self.stage,
                "description": self.description,
                "labels": [lbl.strip() for lbl in (self.labels or "").split(",") if lbl.strip()],
                "drawing_space": self.drawing_space,
                "reference_model": self.reference_model,
                "pin_number": self.pin_number,
                "location": {"x": self.location_x, "y": self.location_y},
            },
            "viewpoints": [
                {
                    "guid": viewpoint_guid,
                    "snapshot": self.snapshot,
                    "viewpoint": vp_dict,
                }
            ],
            "comments": bcf_comments,
        }

    def to_bcf_xml(self) -> tuple[str, str]:
        """Generate buildingSMART BCF 2.1 compliant markup.bcf and viewpoint.bcfv XML."""
        data = self.to_bcf_topic_dict()
        top = data["topic"]

        # 1. markup.bcf
        markup_root = ET.Element("Markup", {
            "xmlns": "http://www.buildingsmart-tech.org/specifications/bcf/markup/2.1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        })

        header = ET.SubElement(markup_root, "Header")
        file_el = ET.SubElement(header, "File", {"IfcProject": self.reference_model or "PROJECT"})
        ET.SubElement(file_el, "Filename").text = self.cad_file or f"{self.name}.dwg"
        ET.SubElement(file_el, "Date").text = top["creation_date"]

        topic_el = ET.SubElement(markup_root, "Topic", {
            "Guid": top["guid"],
            "TopicType": top["topic_type"],
            "TopicStatus": top["topic_status"],
        })
        ET.SubElement(topic_el, "Title").text = top["title"]
        ET.SubElement(topic_el, "Priority").text = top["priority"]
        ET.SubElement(topic_el, "CreationDate").text = top["creation_date"]
        ET.SubElement(topic_el, "CreationAuthor").text = top["creation_author"]
        if top.get("assigned_to"):
            ET.SubElement(topic_el, "AssignedTo").text = top["assigned_to"]
        if top.get("stage"):
            ET.SubElement(topic_el, "Stage").text = top["stage"]
        if top.get("description"):
            ET.SubElement(topic_el, "Description").text = top["description"]
        if top.get("due_date"):
            ET.SubElement(topic_el, "DueDate").text = top["due_date"]
        for lbl in top.get("labels", []):
            ET.SubElement(topic_el, "Labels").text = lbl

        # Viewpoints link in markup
        for vp in data.get("viewpoints", []):
            vp_link = ET.SubElement(topic_el, "Viewpoints", {"Guid": vp["guid"]})
            ET.SubElement(vp_link, "Viewpoint").text = f"{vp['guid']}.bcfv"
            ET.SubElement(vp_link, "Snapshot").text = f"{vp['guid']}.png"

        # Comments
        for c in data.get("comments", []):
            c_el = ET.SubElement(markup_root, "Comment", {"Guid": c["guid"]})
            ET.SubElement(c_el, "Date").text = c["date"]
            ET.SubElement(c_el, "Author").text = c["author"]
            ET.SubElement(c_el, "Comment").text = c["comment"]

        markup_xml = ET.tostring(markup_root, encoding="utf-8", xml_declaration=True).decode("utf-8")

        # 2. viewpoint.bcfv
        vp_root = ET.Element("VisualizationInfo", {
            "xmlns": "http://www.buildingsmart-tech.org/specifications/bcf/visinfo/2.1",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "Guid": data["viewpoints"][0]["guid"],
        })

        vp_details = data["viewpoints"][0].get("viewpoint", {})
        cam_center = vp_details.get("camera", {}).get("center", {"x": self.location_x or 0.0, "y": self.location_y or 0.0, "z": 0.0})
        zoom = vp_details.get("camera", {}).get("zoom", 1.0)

        ortho_cam = ET.SubElement(vp_root, "OrthogonalCamera")
        cam_view_point = ET.SubElement(ortho_cam, "CameraViewPoint")
        ET.SubElement(cam_view_point, "X").text = str(cam_center.get("x", 0.0))
        ET.SubElement(cam_view_point, "Y").text = str(cam_center.get("y", 0.0))
        ET.SubElement(cam_view_point, "Z").text = str(cam_center.get("z", 100.0))

        cam_dir = ET.SubElement(ortho_cam, "CameraDirection")
        ET.SubElement(cam_dir, "X").text = "0.0"
        ET.SubElement(cam_dir, "Y").text = "0.0"
        ET.SubElement(cam_dir, "Z").text = "-1.0"

        cam_up = ET.SubElement(ortho_cam, "CameraUpVector")
        ET.SubElement(cam_up, "X").text = "0.0"
        ET.SubElement(cam_up, "Y").text = "1.0"
        ET.SubElement(cam_up, "Z").text = "0.0"

        ET.SubElement(ortho_cam, "ViewToWorldScale").text = str(zoom)

        viewpoint_xml = ET.tostring(vp_root, encoding="utf-8", xml_declaration=True).decode("utf-8")

        return markup_xml, viewpoint_xml
