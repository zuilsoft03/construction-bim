"""buildingSMART BCF-API v2.1/v3.0 REST Controller for Frappe / ERPNext.

Module: construction_bim.bim.bcf.api
"""

from __future__ import annotations

import base64
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import frappe
from frappe import _

from .bcf_exporter import BCFExporter
from .bcf_importer import BCFImporter

logger = logging.getLogger(__name__)


# -----------------------------------------------------------------------------
# 1. Discovery & Version Endpoints
# -----------------------------------------------------------------------------

@frappe.whitelist(allow_guest=True)
def get_bcf_versions() -> Dict[str, Any]:
    """Return supported buildingSMART BCF-API versions."""
    return {
        "versions": [
            {
                "version_id": "2.1",
                "detailed_version": "https://github.com/BuildingSMART/BCF-API/tree/release_2_1"
            },
            {
                "version_id": "3.0",
                "detailed_version": "https://github.com/buildingSMART/BCF-API/tree/release_3_0"
            }
        ]
    }


@frappe.whitelist(allow_guest=True)
def get_bcf_auth() -> Dict[str, Any]:
    """Return OAuth2 and Bearer authentication metadata for BCF clients."""
    site_url = frappe.utils.get_url() if hasattr(frappe, "utils") else ""
    return {
        "oauth2_auth_url": f"{site_url}/api/method/frappe.integrations.oauth2.authorize",
        "oauth2_token_url": f"{site_url}/api/method/frappe.integrations.oauth2.get_token",
        "http_basic_supported": False,
        "supported_oauth2_flows": ["authorization_code", "client_credentials"]
    }


# -----------------------------------------------------------------------------
# 2. Project Endpoints
# -----------------------------------------------------------------------------

@frappe.whitelist()
def list_projects(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """List all active BCF projects accessible to current user."""
    projects = frappe.get_all(
        "BCF Project",
        fields=["name", "project_name", "project_id", "erpnext_project", "bcf_version", "status", "topic_count", "open_topic_count"],
        limit_start=int(offset),
        limit_page_length=int(limit),
        order_by="creation desc"
    )
    result = []
    for p in projects:
        result.append({
            "project_id": p.project_id,
            "name": p.project_name,
            "erpnext_project": p.erpnext_project,
            "bcf_version": p.bcf_version,
            "status": p.status,
            "topic_count": p.topic_count,
            "open_topic_count": p.open_topic_count
        })
    return result


@frappe.whitelist()
def get_project(project_id: str) -> Dict[str, Any]:
    """Get single BCF Project metadata by project_id GUID."""
    p = frappe.get_doc("BCF Project", {"project_id": project_id})
    return {
        "project_id": p.project_id,
        "name": p.project_name,
        "erpnext_project": p.erpnext_project,
        "bcf_version": p.bcf_version,
        "status": p.status,
        "topic_count": p.topic_count,
        "open_topic_count": p.open_topic_count
    }


@frappe.whitelist()
def get_extensions(project_id: str) -> Dict[str, Any]:
    """Get allowed topic types, statuses, priorities, labels for a project."""
    p = frappe.get_doc("BCF Project", {"project_id": project_id})
    return {
        "topic_type": json.loads(p.topic_types or "[]"),
        "topic_status": json.loads(p.topic_statuses or "[]"),
        "priority": json.loads(p.priorities or "[]"),
        "topic_label": json.loads(p.topic_labels or "[]"),
        "stage": json.loads(p.stages or "[]"),
        "snippet_type": json.loads(p.snippet_types or "[]")
    }


# -----------------------------------------------------------------------------
# 3. Topic Endpoints
# -----------------------------------------------------------------------------

@frappe.whitelist()
def topics_collection(project_id: str, topic_type: Optional[str] = None,
                      topic_status: Optional[str] = None, assigned_to: Optional[str] = None,
                      limit: int = 100, offset: int = 0) -> Any:
    """Handle GET (list) and POST (create) on topics collection."""
    proj = frappe.get_doc("BCF Project", {"project_id": project_id})

    method = frappe.local.request.method if hasattr(frappe, "local") and hasattr(frappe.local, "request") else "GET"

    if method == "POST":
        frappe.has_permission("BCF Topic", "create", throw=True)
        data = frappe.local.form_dict
        if isinstance(data.get("data"), str):
            data = json.loads(data.get("data"))

        t_guid = data.get("guid") or str(uuid.uuid4())
        doc_topic = frappe.new_doc("BCF Topic")
        doc_topic.guid = t_guid
        doc_topic.bcf_project = proj.name
        doc_topic.title = data.get("title", "Untitled Topic")
        doc_topic.topic_type = data.get("topic_type", "Clash")
        doc_topic.topic_status = data.get("topic_status", "Open")
        doc_topic.priority = data.get("priority", "Medium")
        doc_topic.description = data.get("description", "")
        doc_topic.assigned_to = data.get("assigned_to")
        doc_topic.due_date = data.get("due_date")
        if data.get("labels"):
            doc_topic.labels = json.dumps(data.get("labels"))

        doc_topic.insert()
        frappe.db.commit()

        return _serialize_topic(doc_topic)

    filters = {"bcf_project": proj.name}
    if topic_type:
        filters["topic_type"] = topic_type
    if topic_status:
        filters["topic_status"] = topic_status
    if assigned_to:
        filters["assigned_to"] = assigned_to

    topics = frappe.get_all(
        "BCF Topic",
        filters=filters,
        fields=["name", "guid", "title", "topic_type", "topic_status", "priority", "assigned_to", "due_date", "creation_date"],
        limit_start=int(offset),
        limit_page_length=int(limit),
        order_by="creation desc"
    )
    return topics


@frappe.whitelist()
def topic_resource(project_id: str, topic_guid: str) -> Any:
    """Handle GET, PUT, DELETE for a specific BCF topic."""
    doc_topic = frappe.get_doc("BCF Topic", {"guid": topic_guid})
    method = frappe.local.request.method if hasattr(frappe, "local") and hasattr(frappe.local, "request") else "GET"

    if method == "DELETE":
        doc_topic.check_permission("delete")
        frappe.delete_doc("BCF Topic", doc_topic.name)
        frappe.db.commit()
        return {"status": "deleted", "guid": topic_guid}

    if method in ("PUT", "POST"):
        doc_topic.check_permission("write")
        data = frappe.local.form_dict
        if isinstance(data.get("data"), str):
            data = json.loads(data.get("data"))

        for f in ["title", "topic_type", "topic_status", "priority", "description", "assigned_to", "due_date"]:
            if f in data:
                setattr(doc_topic, f, data[f])
        doc_topic.save()
        frappe.db.commit()

    doc_topic.check_permission("read")
    return _serialize_topic(doc_topic)


# -----------------------------------------------------------------------------
# 4. Comments & Viewpoints
# -----------------------------------------------------------------------------

@frappe.whitelist()
def comments_collection(project_id: str, topic_guid: str) -> Any:
    """List or create comments for a topic."""
    doc_topic = frappe.get_doc("BCF Topic", {"guid": topic_guid})
    doc_topic.check_permission("read")
    method = frappe.local.request.method if hasattr(frappe, "local") and hasattr(frappe.local, "request") else "GET"

    if method == "POST":
        frappe.has_permission("BCF Comment", "create", throw=True)
        data = frappe.local.form_dict
        if isinstance(data.get("data"), str):
            data = json.loads(data.get("data"))

        comm = frappe.new_doc("BCF Comment")
        comm.guid = data.get("guid") or str(uuid.uuid4())
        comm.topic = doc_topic.name
        comm.comment = data.get("comment", "")
        comm.status = data.get("status", "Open")
        comm.author = data.get("author") or frappe.session.user
        comm.insert()
        frappe.db.commit()
        return {
            "guid": comm.guid,
            "comment": comm.comment,
            "author": comm.author,
            "date": comm.date,
            "status": comm.status
        }

    comments = frappe.get_all(
        "BCF Comment",
        filters={"topic": doc_topic.name},
        fields=["guid", "author", "date", "comment", "status"],
        order_by="date asc"
    )
    return comments


@frappe.whitelist()
def viewpoints_collection(project_id: str, topic_guid: str) -> Any:
    """List or create viewpoints for a topic."""
    doc_topic = frappe.get_doc("BCF Topic", {"guid": topic_guid})
    doc_topic.check_permission("read")
    method = frappe.local.request.method if hasattr(frappe, "local") and hasattr(frappe.local, "request") else "GET"

    if method == "POST":
        frappe.has_permission("BCF Viewpoint", "create", throw=True)
        data = frappe.local.form_dict
        if isinstance(data.get("data"), str):
            data = json.loads(data.get("data"))

        vp = frappe.new_doc("BCF Viewpoint")
        vp.guid = data.get("guid") or str(uuid.uuid4())
        vp.topic = doc_topic.name
        vp.viewpoint_type = data.get("viewpoint_type", "Perspective")
        vp.camera_position = json.dumps(data.get("camera_position", {"x": 0, "y": 0, "z": 0}))
        vp.camera_direction = json.dumps(data.get("camera_direction", {"x": 0, "y": 0, "z": -1}))
        vp.camera_up_vector = json.dumps(data.get("camera_up_vector", {"x": 0, "y": 1, "z": 0}))
        vp.field_of_view = float(data.get("field_of_view", 60.0))
        if data.get("selection"):
            vp.selection = json.dumps(data.get("selection"))
        if data.get("snapshot"):
            vp.snapshot = data.get("snapshot")

        vp.insert()
        frappe.db.commit()
        return _serialize_viewpoint(vp)

    vps = frappe.get_all(
        "BCF Viewpoint",
        filters={"topic": doc_topic.name},
        fields=["guid", "viewpoint_type", "snapshot", "field_of_view", "aspect_ratio"]
    )
    return vps


@frappe.whitelist()
def viewpoint_resource(project_id: str, topic_guid: str, viewpoint_guid: str) -> Dict[str, Any]:
    """Get single viewpoint full spatial definition."""
    vp = frappe.get_doc("BCF Viewpoint", {"guid": viewpoint_guid})
    vp.check_permission("read")
    return _serialize_viewpoint(vp)


# -----------------------------------------------------------------------------
# 5. File Import & Export REST Helpers
# -----------------------------------------------------------------------------

@frappe.whitelist()
def import_bcf_archive(project_name: Optional[str] = None, erpnext_project: Optional[str] = None) -> Dict[str, Any]:
    """Import an uploaded BCF-XML ZIP file."""
    files = frappe.request.files if hasattr(frappe, "request") and hasattr(frappe.request, "files") else {}
    file_content = None

    if "file" in files:
        file_content = files["file"].stream.read()
    elif frappe.form_dict.get("file_url"):
        file_doc = frappe.get_doc("File", {"file_url": frappe.form_dict.get("file_url")})
        file_content = file_doc.get_content()

    if not file_content:
        frappe.throw(_("No valid BCF file or file_url provided."))

    importer = BCFImporter(file_content, project_name=project_name, erpnext_project=erpnext_project)
    return importer.process()


@frappe.whitelist()
def export_bcf_archive(bcf_project_name: str, bcf_version: str = "2.1") -> Dict[str, Any]:
    """Export a BCF Project to a downloadable BCF-XML zip archive."""
    exporter = BCFExporter(bcf_project_name, bcf_version=bcf_version)
    zip_bytes = exporter.export_bytes()
    b64_content = base64.b64encode(zip_bytes).decode("utf-8")
    return {
        "bcf_project": bcf_project_name,
        "bcf_version": bcf_version,
        "file_name": f"{bcf_project_name}_{bcf_version}.bcfzip",
        "file_base64": b64_content
    }


def _serialize_topic(doc_topic) -> Dict[str, Any]:
    return {
        "guid": doc_topic.guid,
        "topic_type": doc_topic.topic_type,
        "topic_status": doc_topic.topic_status,
        "title": doc_topic.title,
        "priority": doc_topic.priority,
        "assigned_to": doc_topic.assigned_to,
        "stage": doc_topic.stage,
        "due_date": doc_topic.due_date,
        "description": doc_topic.description,
        "creation_date": doc_topic.creation_date,
        "creation_author": doc_topic.creation_author,
        "default_viewpoint": doc_topic.default_viewpoint
    }


def _serialize_viewpoint(vp) -> Dict[str, Any]:
    return {
        "guid": vp.guid,
        "viewpoint_type": vp.viewpoint_type,
        "field_of_view": vp.field_of_view,
        "aspect_ratio": vp.aspect_ratio,
        "camera_position": json.loads(vp.camera_position or '{"x":0,"y":0,"z":0}'),
        "camera_direction": json.loads(vp.camera_direction or '{"x":0,"y":0,"z":-1}'),
        "camera_up_vector": json.loads(vp.camera_up_vector or '{"x":0,"y":1,"z":0}'),
        "selection": json.loads(vp.selection or '[]'),
        "snapshot": vp.snapshot
    }
