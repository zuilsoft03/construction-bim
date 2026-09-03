"""Controller for BIM Clash DocType."""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import now_datetime

logger = logging.getLogger(__name__)


class BIMClash(Document):
    """Represents a physical or clearance collision between two BIM elements."""

    def validate(self) -> None:
        self._ensure_identifiers()
        self._sync_element_fields()
        self._sync_collision_coordinates()
        self._validate_and_normalize_viewpoint()
        self._handle_status_transition()

    def _ensure_identifiers(self) -> None:
        if not self.bcf_guid:
            self.bcf_guid = str(uuid.uuid4())
        if not self.clash_id:
            self.clash_id = f"CLASH-{self.bcf_guid[:8].upper()}"
        if not self.title:
            type_a = self.element_a_type or self.element_type_a or "Element A"
            type_b = self.element_b_type or self.element_type_b or "Element B"
            self.title = f"Clash: {type_a} vs {type_b}"

    def _sync_element_fields(self) -> None:
        # Sync GUIDs
        if self.element_a_guid and not self.guid_a:
            self.guid_a = self.element_a_guid
        elif self.guid_a and not self.element_a_guid:
            self.element_a_guid = self.guid_a

        if self.element_b_guid and not self.guid_b:
            self.guid_b = self.element_b_guid
        elif self.guid_b and not self.element_b_guid:
            self.element_b_guid = self.guid_b

        # Sync element types
        if self.element_a_type and not self.element_type_a:
            self.element_type_a = self.element_a_type
        elif self.element_type_a and not self.element_a_type:
            self.element_a_type = self.element_type_a

        if self.element_b_type and not self.element_type_b:
            self.element_type_b = self.element_b_type
        elif self.element_type_b and not self.element_b_type:
            self.element_b_type = self.element_type_b

        # Sync disciplines
        if self.discipline_a and not self.element_a_discipline:
            self.element_a_discipline = self.discipline_a
        elif self.element_a_discipline and not self.discipline_a:
            self.discipline_a = self.element_a_discipline

        if self.discipline_b and not self.element_b_discipline:
            self.element_b_discipline = self.discipline_b
        elif self.element_b_discipline and not self.discipline_b:
            self.discipline_b = self.element_b_discipline

    def _sync_collision_coordinates(self) -> None:
        # Sync x, y, z floats
        if self.collision_x is not None and self.collision_point_x is None:
            self.collision_point_x = self.collision_x
        elif self.collision_point_x is not None and self.collision_x is None:
            self.collision_x = self.collision_point_x

        if self.collision_y is not None and self.collision_point_y is None:
            self.collision_point_y = self.collision_y
        elif self.collision_point_y is not None and self.collision_y is None:
            self.collision_y = self.collision_point_y

        if self.collision_z is not None and self.collision_point_z is None:
            self.collision_point_z = self.collision_z
        elif self.collision_point_z is not None and self.collision_z is None:
            self.collision_z = self.collision_point_z

        # Sync JSON structure
        if self.collision_point_x is not None and self.collision_point_y is not None and self.collision_point_z is not None:
            coord_dict = {
                "x": round(float(self.collision_point_x), 4),
                "y": round(float(self.collision_point_y), 4),
                "z": round(float(self.collision_point_z), 4),
            }
            if not self.collision_point:
                self.collision_point = json.dumps(coord_dict)
        elif self.collision_point:
            try:
                coords = json.loads(self.collision_point) if isinstance(self.collision_point, str) else self.collision_point
                if isinstance(coords, dict):
                    self.collision_x = self.collision_point_x = float(coords.get("x", 0.0))
                    self.collision_y = self.collision_point_y = float(coords.get("y", 0.0))
                    self.collision_z = self.collision_point_z = float(coords.get("z", 0.0))
            except Exception:
                pass

    def _validate_and_normalize_viewpoint(self) -> None:
        raw_vp = self.viewpoint_json or self.viewpoint
        vp_dict: dict[str, Any] = {}

        if raw_vp:
            if isinstance(raw_vp, str):
                try:
                    vp_dict = json.loads(raw_vp)
                except json.JSONDecodeError:
                    vp_dict = {}
            elif isinstance(raw_vp, dict):
                vp_dict = dict(raw_vp)

        # If no viewpoint or incomplete, build standard BCF 2.1/3.0 structure
        cx = float(self.collision_x or 0.0)
        cy = float(self.collision_y or 0.0)
        cz = float(self.collision_z or 0.0)

        if not vp_dict.get("perspective_camera") and not vp_dict.get("orthogonal_camera"):
            vp_dict["bcf_version"] = "2.1"
            vp_dict["guid"] = self.bcf_guid
            vp_dict["perspective_camera"] = {
                "camera_view_point": {"x": round(cx + 4.0, 3), "y": round(cy - 4.0, 3), "z": round(cz + 3.0, 3)},
                "camera_direction": {"x": -0.683, "y": 0.683, "z": -0.512},
                "camera_up_vector": {"x": 0.0, "y": 0.0, "z": 1.0},
                "field_of_view": 60.0,
                "aspect_ratio": 1.777,
            }

        # Components selection and coloring
        if "components" not in vp_dict:
            sel: list[dict[str, str]] = []
            coloring: list[dict[str, Any]] = []

            guid_a = self.element_a_guid or self.guid_a
            guid_b = self.element_b_guid or self.guid_b

            if guid_a:
                sel.append({"ifc_guid": guid_a})
                coloring.append({"color": "FF0000", "components": [{"ifc_guid": guid_a}]})  # Red
            if guid_b:
                sel.append({"ifc_guid": guid_b})
                coloring.append({"color": "FFFF00", "components": [{"ifc_guid": guid_b}]})  # Yellow

            vp_dict["components"] = {
                "selection": sel,
                "visibility": {
                    "default_visibility": False,
                    "exceptions": sel,
                },
                "coloring": coloring,
            }

        serialized = json.dumps(vp_dict, indent=2)
        self.viewpoint_json = serialized
        self.viewpoint = serialized

    def _handle_status_transition(self) -> None:
        if self.status in ("Resolved", "Closed"):
            if not self.resolved_by:
                self.resolved_by = frappe.session.user if hasattr(frappe, "session") and frappe.session and frappe.session.user else "Administrator"
            if not self.resolution_date:
                self.resolution_date = now_datetime()
        elif self.status in ("Open", "In Review"):
            # If reopened
            if self.is_new() or self.get_doc_before_save() and self.get_doc_before_save().status in ("Resolved", "Closed"):
                self.resolved_by = None
                self.resolution_date = None

    def on_update(self) -> None:
        self._sync_assigned_todo()

    def _sync_assigned_todo(self) -> None:
        """Create or sync Frappe ToDo for assigned user."""
        if not self.assigned_to:
            return

        try:
            # Check if ToDo already exists for this clash and user
            existing_todos = frappe.get_all(
                "ToDo",
                filters={
                    "reference_type": "BIM Clash",
                    "reference_name": self.name,
                    "allocated_to": self.assigned_to,
                    "status": "Open",
                },
                limit_page_length=1,
            )
            if not existing_todos:
                todo = frappe.new_doc("ToDo")
                todo.reference_type = "BIM Clash"
                todo.reference_name = self.name
                todo.allocated_to = self.assigned_to
                todo.description = _("BIM Clash {0}: {1} (Severity: {2})").format(
                    self.name, self.title, self.severity
                )
                todo.date = self.due_date
                todo.priority = self.priority or "Medium"
                todo.insert(ignore_permissions=True)
        except Exception as e:
            logger.warning(f"Could not create ToDo for clash {self.name}: {e}")

    def add_discussion_comment(self, comment_text: str, user: str | None = None) -> dict:
        """Add a native threaded Frappe Comment to this clash."""
        if not comment_text:
            frappe.throw(_("Comment text cannot be empty"))

        author = user or (frappe.session.user if hasattr(frappe, "session") and frappe.session and frappe.session.user else "Administrator")

        comment = frappe.new_doc("Comment")
        comment.comment_type = "Comment"
        comment.reference_doctype = "BIM Clash"
        comment.reference_name = self.name
        comment.content = comment_text
        comment.comment_by = author
        comment.comment_email = author if "@" in author else None
        comment.insert()
        frappe.db.commit()

        return {
            "name": comment.name,
            "content": comment.content,
            "comment_by": comment.comment_by,
            "creation": str(comment.creation),
        }

    def add_comment(self, *args, **kwargs):
        """Dispatches to standard Document.add_comment or discussion comment."""
        if args and args[0] in ("Comment", "Workflow", "Label", "Like", "Assigned", "Assignment Completed"):
            return super().add_comment(*args, **kwargs)
        return self.add_discussion_comment(*args, **kwargs)

    def get_viewpoint(self) -> dict:
        """Return parsed BCF viewpoint."""
        raw = self.viewpoint_json or self.viewpoint or "{}"
        if isinstance(raw, dict):
            return raw
        try:
            return json.loads(raw)
        except Exception:
            return {}

    def to_bcf_topic(self) -> dict:
        """Serialize clash as standard buildingSMART BCF Topic JSON."""
        return {
            "guid": self.bcf_guid or str(uuid.uuid4()),
            "topic_type": self.clash_type or "Hard Collision",
            "topic_status": self.status or "Open",
            "title": self.title,
            "priority": self.priority or "Medium",
            "creation_date": str(self.creation) if self.creation else str(now_datetime()),
            "creation_author": self.owner or "Administrator",
            "modified_date": str(self.modified) if self.modified else str(now_datetime()),
            "modified_author": self.modified_by or "Administrator",
            "due_date": str(self.due_date) if self.due_date else None,
            "assigned_to": self.assigned_to,
            "description": self.description or f"Collision between {self.model_a} ({self.element_a_guid}) and {self.model_b} ({self.element_b_guid})",
            "viewpoint": self.get_viewpoint(),
            "custom_attributes": {
                "project": self.project,
                "severity": self.severity,
                "model_a": self.model_a,
                "model_b": self.model_b,
                "element_a_guid": self.element_a_guid or self.guid_a,
                "element_b_guid": self.element_b_guid or self.guid_b,
                "penetration_depth": self.penetration_depth,
                "intersection_volume": self.intersection_volume,
                "collision_point": {
                    "x": self.collision_x or self.collision_point_x,
                    "y": self.collision_y or self.collision_point_y,
                    "z": self.collision_z or self.collision_point_z,
                },
            },
        }
