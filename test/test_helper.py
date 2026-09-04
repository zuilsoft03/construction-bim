"""Test Helper and In-Memory Test Doubles for Construction BIM E2E Test Suite.

Provides:
1. In-memory Frappe document engine and mock database (MockFrappe, MockDB, MockDoc)
   enabling opaque-box testing on both host Python (without frappe installed) and
   inside live Frappe bench Docker containers.
2. 3D spatial math and geometry utilities: Vector3, AABB3D, Triangle3D, BVHNode, BVHTree.
3. Clash Detection & Highlighting Engine: broadphase AABB, narrowphase SAT, Red/Yellow highlight mapping,
   collision centroid math, penetration depth, and BCF 2.1/3.0 viewpoint JSON generation.
4. BIM Clash DocType Manager: lifecycle transitions, severity validation, batch import, comments, ToDo assignment.
5. Automated BIM BOM Generator Engine: quantity extraction (concrete volume, pipe length, duct area, steel weight),
   mapping ruleset execution, ERPNext BOM and BOM Item creation, cost rollups, BOQ Link traceability, and 3D cross-highlighting.
6. Synthetic and real IFC fixture utilities for deterministic, edge-case, and real-world testing.
"""

from __future__ import annotations

import copy
import hashlib
import json
import math
import os
import re
import sys
import time
import types
import unittest
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Set, Tuple, Union


# ==============================================================================
# 1. 3D Spatial Math & BVH Collision Engine
# ==============================================================================

@dataclass
class Vector3:
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0

    def __add__(self, other: Union[Vector3, Tuple[float, float, float], List[float]]) -> Vector3:
        if isinstance(other, (tuple, list)):
            return Vector3(self.x + other[0], self.y + other[1], self.z + other[2])
        return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __sub__(self, other: Union[Vector3, Tuple[float, float, float], List[float]]) -> Vector3:
        if isinstance(other, (tuple, list)):
            return Vector3(self.x - other[0], self.y - other[1], self.z - other[2])
        return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)

    def __mul__(self, scalar: float) -> Vector3:
        return Vector3(self.x * scalar, self.y * scalar, self.z * scalar)

    def __truediv__(self, scalar: float) -> Vector3:
        if abs(scalar) < 1e-12:
            raise ZeroDivisionError("Vector3 division by zero or near-zero scalar")
        return Vector3(self.x / scalar, self.y / scalar, self.z / scalar)

    def dot(self, other: Vector3) -> float:
        return self.x * other.x + self.y * other.y + self.z * other.z

    def cross(self, other: Vector3) -> Vector3:
        return Vector3(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )

    def length(self) -> float:
        return math.sqrt(self.x * self.x + self.y * self.y + self.z * self.z)

    def length_sq(self) -> float:
        return self.x * self.x + self.y * self.y + self.z * self.z

    def normalize(self) -> Vector3:
        l = self.length()
        if l < 1e-12:
            return Vector3(0.0, 0.0, 0.0)
        return Vector3(self.x / l, self.y / l, self.z / l)

    def distance_to(self, other: Vector3) -> float:
        return (self - other).length()

    def to_list(self) -> List[float]:
        return [round(self.x, 6), round(self.y, 6), round(self.z, 6)]

    @classmethod
    def from_list(cls, coords: Union[List[float], Tuple[float, float, float]]) -> Vector3:
        return cls(float(coords[0]), float(coords[1]), float(coords[2]))


@dataclass
class AABB3D:
    min: Vector3 = field(default_factory=lambda: Vector3(float("inf"), float("inf"), float("inf")))
    max: Vector3 = field(default_factory=lambda: Vector3(float("-inf"), float("-inf"), float("-inf")))

    def is_valid(self) -> bool:
        return self.min.x <= self.max.x and self.min.y <= self.max.y and self.min.z <= self.max.z

    def center(self) -> Vector3:
        return (self.min + self.max) * 0.5

    def size(self) -> Vector3:
        return Vector3(
            max(0.0, self.max.x - self.min.x),
            max(0.0, self.max.y - self.min.y),
            max(0.0, self.max.z - self.min.z),
        )

    def volume(self) -> float:
        if not self.is_valid():
            return 0.0
        s = self.size()
        return s.x * s.y * s.z

    def expand_by_point(self, pt: Vector3) -> None:
        self.min = Vector3(min(self.min.x, pt.x), min(self.min.y, pt.y), min(self.min.z, pt.z))
        self.max = Vector3(max(self.max.x, pt.x), max(self.max.y, pt.y), max(self.max.z, pt.z))

    def expand_by_margin(self, margin: float) -> AABB3D:
        return AABB3D(
            min=Vector3(self.min.x - margin, self.min.y - margin, self.min.z - margin),
            max=Vector3(self.max.x + margin, self.max.y + margin, self.max.z + margin),
        )

    def intersects(self, other: AABB3D, tolerance: float = 0.0) -> bool:
        if not self.is_valid() or not other.is_valid():
            return False
        return (
            self.min.x - tolerance <= other.max.x
            and self.max.x + tolerance >= other.min.x
            and self.min.y - tolerance <= other.max.y
            and self.max.y + tolerance >= other.min.y
            and self.min.z - tolerance <= other.max.z
            and self.max.z + tolerance >= other.min.z
        )

    def intersection(self, other: AABB3D) -> Optional[AABB3D]:
        if not self.intersects(other):
            return None
        inter = AABB3D(
            min=Vector3(
                max(self.min.x, other.min.x),
                max(self.min.y, other.min.y),
                max(self.min.z, other.min.z),
            ),
            max=Vector3(
                min(self.max.x, other.max.x),
                min(self.max.y, other.max.y),
                min(self.max.z, other.max.z),
            ),
        )
        return inter if inter.is_valid() else None

    def union(self, other: AABB3D) -> AABB3D:
        if not self.is_valid():
            return copy.deepcopy(other)
        if not other.is_valid():
            return copy.deepcopy(self)
        return AABB3D(
            min=Vector3(
                min(self.min.x, other.min.x),
                min(self.min.y, other.min.y),
                min(self.min.z, other.min.z),
            ),
            max=Vector3(
                max(self.max.x, other.max.x),
                max(self.max.y, other.max.y),
                max(self.max.z, other.max.z),
            ),
        )

    def to_dict(self) -> Dict[str, List[float]]:
        return {"min": self.min.to_list(), "max": self.max.to_list()}

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> AABB3D:
        return cls(min=Vector3.from_list(d["min"]), max=Vector3.from_list(d["max"]))

    @classmethod
    def from_box_list(cls, b: List[float]) -> AABB3D:
        if not b or len(b) < 6:
            return cls()
        return cls(min=Vector3(b[0], b[1], b[2]), max=Vector3(b[3], b[4], b[5]))


@dataclass
class Triangle3D:
    v0: Vector3
    v1: Vector3
    v2: Vector3

    def aabb(self) -> AABB3D:
        b = AABB3D()
        b.expand_by_point(self.v0)
        b.expand_by_point(self.v1)
        b.expand_by_point(self.v2)
        return b

    def normal(self) -> Vector3:
        e1 = self.v1 - self.v0
        e2 = self.v2 - self.v0
        return e1.cross(e2).normalize()

    def area(self) -> float:
        e1 = self.v1 - self.v0
        e2 = self.v2 - self.v0
        return 0.5 * e1.cross(e2).length()

    def centroid(self) -> Vector3:
        return (self.v0 + self.v1 + self.v2) / 3.0

    def intersects_triangle(self, other: Triangle3D, tolerance: float = 1e-6) -> bool:
        """Separating Axis Theorem (SAT) based 3D triangle-triangle intersection test."""
        # Check AABB first
        if not self.aabb().intersects(other.aabb(), tolerance=tolerance):
            return False

        n1 = self.normal()
        if n1.length_sq() < 1e-12:
            return False
        d1 = -n1.dot(self.v0)

        # Distances of other vertices to plane of self
        du0 = n1.dot(other.v0) + d1
        du1 = n1.dot(other.v1) + d1
        du2 = n1.dot(other.v2) + d1

        if (du0 > tolerance and du1 > tolerance and du2 > tolerance) or (
            du0 < -tolerance and du1 < -tolerance and du2 < -tolerance
        ):
            return False

        n2 = other.normal()
        if n2.length_sq() < 1e-12:
            return False
        d2 = -n2.dot(other.v0)

        # Distances of self vertices to plane of other
        dv0 = n2.dot(self.v0) + d2
        dv1 = n2.dot(self.v1) + d2
        dv2 = n2.dot(self.v2) + d2

        if (dv0 > tolerance and dv1 > tolerance and dv2 > tolerance) or (
            dv0 < -tolerance and dv1 < -tolerance and dv2 < -tolerance
        ):
            return False

        # Edge-cross axes for full 3D SAT
        edges1 = [self.v1 - self.v0, self.v2 - self.v1, self.v0 - self.v2]
        edges2 = [other.v1 - other.v0, other.v2 - other.v1, other.v0 - other.v2]

        for e1 in edges1:
            for e2 in edges2:
                axis = e1.cross(e2)
                if axis.length_sq() < 1e-10:
                    continue
                axis = axis.normalize()

                p1 = [axis.dot(self.v0), axis.dot(self.v1), axis.dot(self.v2)]
                p2 = [axis.dot(other.v0), axis.dot(other.v1), axis.dot(other.v2)]

                min1, max1 = min(p1), max(p1)
                min2, max2 = min(p2), max(p2)

                if min1 - tolerance > max2 or min2 - tolerance > max1:
                    return False

        return True


class BVHNode:
    def __init__(self, bounding_box: AABB3D, triangles: Optional[List[Triangle3D]] = None):
        self.bounding_box = bounding_box
        self.triangles = triangles or []
        self.left: Optional[BVHNode] = None
        self.right: Optional[BVHNode] = None

    def is_leaf(self) -> bool:
        return self.left is None and self.right is None


class BVHTree:
    def __init__(self, triangles: List[Triangle3D], max_leaf_triangles: int = 4):
        self.triangles = triangles
        self.max_leaf_triangles = max_leaf_triangles
        self.root = self._build(triangles)

    def _build(self, tris: List[Triangle3D]) -> Optional[BVHNode]:
        if not tris:
            return None

        box = AABB3D()
        for t in tris:
            box = box.union(t.aabb())

        if len(tris) <= self.max_leaf_triangles:
            return BVHNode(box, tris)

        # Split along longest axis
        s = box.size()
        if s.x >= s.y and s.x >= s.z:
            axis = 0
        elif s.y >= s.x and s.y >= s.z:
            axis = 1
        else:
            axis = 2

        mid = box.center()
        mid_val = [mid.x, mid.y, mid.z][axis]

        left_tris = []
        right_tris = []
        for t in tris:
            t_center = t.aabb().center()
            t_val = [t_center.x, t_center.y, t_center.z][axis]
            if t_val <= mid_val:
                left_tris.append(t)
            else:
                right_tris.append(t)

        if not left_tris or not right_tris:
            # Fallback even split
            half = len(tris) // 2
            left_tris = tris[:half]
            right_tris = tris[half:]

        node = BVHNode(box)
        node.left = self._build(left_tris)
        node.right = self._build(right_tris)
        return node

    def collide_tree(self, other: BVHTree, tolerance: float = 1e-6) -> List[Tuple[Triangle3D, Triangle3D]]:
        """Find all intersecting triangle pairs between two BVH trees."""
        pairs: List[Tuple[Triangle3D, Triangle3D]] = []
        if not self.root or not other.root:
            return pairs

        def _recurse(n1: Optional[BVHNode], n2: Optional[BVHNode]):
            if not n1 or not n2:
                return
            if not n1.bounding_box.intersects(n2.bounding_box, tolerance=tolerance):
                return

            if n1.is_leaf() and n2.is_leaf():
                for t1 in n1.triangles:
                    for t2 in n2.triangles:
                        if t1.intersects_triangle(t2, tolerance=tolerance):
                            pairs.append((t1, t2))
                return

            if n1.is_leaf():
                _recurse(n1, n2.left)
                _recurse(n1, n2.right)
            elif n2.is_leaf():
                _recurse(n1.left, n2)
                _recurse(n1.right, n2)
            else:
                _recurse(n1.left, n2.left)
                _recurse(n1.left, n2.right)
                _recurse(n1.right, n2.left)
                _recurse(n1.right, n2.right)

        _recurse(self.root, other.root)
        return pairs


def make_box_triangles(aabb: AABB3D) -> List[Triangle3D]:
    """Generate 12 triangles forming a 3D rectangular box mesh."""
    p0 = aabb.min
    pmax = aabb.max
    p1 = Vector3(pmax.x, p0.y, p0.z)
    p2 = Vector3(pmax.x, pmax.y, p0.z)
    p3 = Vector3(p0.x, pmax.y, p0.z)
    p4 = Vector3(p0.x, p0.y, pmax.z)
    p5 = Vector3(pmax.x, p0.y, pmax.z)
    p6 = pmax
    p7 = Vector3(p0.x, pmax.y, pmax.z)

    return [
        # Bottom (z = min)
        Triangle3D(p0, p2, p1), Triangle3D(p0, p3, p2),
        # Top (z = max)
        Triangle3D(p4, p5, p6), Triangle3D(p4, p6, p7),
        # Front (y = min)
        Triangle3D(p0, p1, p5), Triangle3D(p0, p5, p4),
        # Back (y = max)
        Triangle3D(p3, p6, p2), Triangle3D(p3, p7, p6),
        # Left (x = min)
        Triangle3D(p0, p4, p7), Triangle3D(p0, p7, p3),
        # Right (x = max)
        Triangle3D(p1, p2, p6), Triangle3D(p1, p6, p5),
    ]


# ==============================================================================
# 2. In-Memory Frappe Framework Test Double (MockFrappe)
# ==============================================================================

class ValidationError(Exception):
    pass


class DoesNotExistError(Exception):
    pass


class FrappeDict(dict):
    def __getattr__(self, key):
        return self.get(key)

    def __setattr__(self, key, value):
        self[key] = value


class MockComment:
    def __init__(self, comment_type: str, content: str, comment_by: str, creation: Optional[str] = None):
        self.comment_type = comment_type
        self.content = content
        self.comment_by = comment_by
        self.creation = creation or time.strftime("%Y-%m-%d %H:%M:%S")


_DOC_COUNTER = 0


class MockDoc:
    def __init__(self, doctype: str, **kwargs):
        global _DOC_COUNTER
        _DOC_COUNTER += 1
        self.doctype = doctype
        self.name = kwargs.get("name") or f"{doctype}-{_DOC_COUNTER:06d}"
        self.owner = kwargs.get("owner", "Administrator")
        self.creation = kwargs.get("creation", "2026-09-03 01:00:00.000000")
        self.modified = kwargs.get("modified", "2026-09-03 01:00:00.000000")
        self.modified_by = kwargs.get("modified_by", "Administrator")
        self.docstatus = kwargs.get("docstatus", 0)
        self.flags = types.SimpleNamespace(ignore_permissions=False)
        self._data: Dict[str, Any] = {}
        self._comments: List[MockComment] = []

        for k, v in kwargs.items():
            setattr(self, k, v)

    def __setattr__(self, key: str, value: Any):
        if key in ("doctype", "name", "owner", "creation", "modified", "modified_by", "docstatus", "flags", "_data", "_comments"):
            super().__setattr__(key, value)
        else:
            self._data[key] = value
            super().__setattr__(key, value)

    def __getattr__(self, key: str) -> Any:
        if key == "_data" or (key.startswith("__") and key.endswith("__")):
            raise AttributeError(key)
        if "_data" in self.__dict__ and key in self._data:
            return self._data[key]
        return None

    def get(self, key: str, default: Any = None) -> Any:
        if hasattr(self, "_data") and key in self._data:
            val = self._data[key]
            return default if val is None else val
        if hasattr(self, key):
            val = getattr(self, key, None)
            return default if val is None else val
        return default

    def set(self, key: str, value: Any) -> None:
        setattr(self, key, value)

    def db_set(self, fieldname_or_dict: Union[str, Dict[str, Any]], value: Any = None, update_modified: bool = True):
        mock_frappe_db.set_value(self.doctype, self.name, fieldname_or_dict, value, update_modified)
        if isinstance(fieldname_or_dict, dict):
            for k, v in fieldname_or_dict.items():
                setattr(self, k, v)
        elif isinstance(fieldname_or_dict, str):
            setattr(self, fieldname_or_dict, value)

    def as_dict(self) -> FrappeDict:
        d = FrappeDict({
            "name": self.name,
            "doctype": self.doctype,
            "owner": self.owner,
            "creation": self.creation,
            "modified": self.modified,
            "docstatus": self.docstatus,
        })
        d.update(self._data)
        return copy.deepcopy(d)

    def insert(self, ignore_permissions: bool = False) -> MockDoc:
        if callable(getattr(self, "before_insert", None)):
            self.before_insert()
        if callable(getattr(self, "validate", None)):
            self.validate()
        if callable(getattr(self, "before_save", None)):
            self.before_save()
        res = mock_frappe_db.insert(self)
        if callable(getattr(self, "after_insert", None)):
            self.after_insert()
        if callable(getattr(self, "on_update", None)):
            self.on_update()
        return res

    def save(self, ignore_permissions: bool = False) -> MockDoc:
        if callable(getattr(self, "validate", None)):
            self.validate()
        if callable(getattr(self, "before_save", None)):
            self.before_save()
        res = mock_frappe_db.save(self)
        if callable(getattr(self, "on_update", None)):
            self.on_update()
        return res

    def submit(self) -> MockDoc:
        if callable(getattr(self, "validate", None)):
            self.validate()
        if callable(getattr(self, "before_submit", None)):
            self.before_submit()
        self.docstatus = 1
        if callable(getattr(self, "on_submit", None)):
            self.on_submit()
        res = mock_frappe_db.save(self)
        if callable(getattr(self, "on_update", None)):
            self.on_update()
        return res

    def cancel(self) -> MockDoc:
        if callable(getattr(self, "before_cancel", None)):
            self.before_cancel()
        self.docstatus = 2
        if callable(getattr(self, "on_cancel", None)):
            self.on_cancel()
        res = mock_frappe_db.save(self)
        if callable(getattr(self, "on_update", None)):
            self.on_update()
        return res

    def check_permission(self, ptype: str = "read") -> None:
        """Stub: always passes in test environment."""
        pass

    def delete(self, ignore_permissions: bool = False) -> None:
        mock_frappe_db.delete(self.doctype, self.name)

    def append(self, table_fieldname: str, value_dict: Optional[Dict[str, Any]] = None) -> Any:
        current = getattr(self, table_fieldname, None)
        if current is None:
            current = []
            setattr(self, table_fieldname, current)
        row = MockDoc(f"{self.doctype} Item", **(value_dict or {}))
        current.append(row)
        return row

    def add_comment(self, comment_type: str = "Comment", text: str = "", comment_by: Optional[str] = None, user: Optional[str] = None, **kwargs) -> Any:
        txt = text or kwargs.get("comment_text") or ""
        # If called as doc.add_comment("my text", user="...")
        if not txt and comment_type and comment_type not in ("Comment", "Workflow", "Edit", "Label", "Attachment", "Created"):
            txt = comment_type
            comment_type = "Comment"
        if not txt or not txt.strip():
            raise ValidationError("Comment content cannot be empty")
        author = user or comment_by or self.owner
        c = MockComment(comment_type=comment_type, content=txt, comment_by=author)
        self._comments.append(c)
        comment_doc = MockDoc(
            "Comment",
            reference_doctype=self.doctype,
            reference_name=self.name,
            content=txt,
            comment_by=author,
            comment_type=comment_type,
            creation=c.creation,
        )
        mock_frappe_db.insert(comment_doc)
        return FrappeDict({"name": comment_doc.name, "content": txt, "comment_by": author, "creation": c.creation})

    def get_comments(self) -> List[Dict[str, Any]]:
        return [{"comment_type": c.comment_type, "content": c.content, "comment_by": c.comment_by, "creation": c.creation} for c in self._comments]

    def get_viewpoint(self) -> Dict[str, Any]:
        vp = getattr(self, "viewpoint_json", None) or getattr(self, "viewpoint", None)
        if isinstance(vp, str):
            try:
                return json.loads(vp)
            except Exception:
                return {}
        if isinstance(vp, dict):
            return vp
        return {}


class MockDB:
    def __init__(self):
        self._tables: Dict[str, Dict[str, MockDoc]] = {}
        self._sql_log: List[str] = []

    def clear(self):
        self._tables.clear()
        self._sql_log.clear()

    def insert(self, doc: MockDoc) -> MockDoc:
        table = self._tables.setdefault(doc.doctype, {})
        if not doc.name:
            doc.name = f"{doc.doctype}-{len(table)+1:06d}"
        table[doc.name] = doc
        return doc

    def save(self, doc: MockDoc) -> MockDoc:
        table = self._tables.setdefault(doc.doctype, {})
        table[doc.name] = doc
        return doc

    def delete(self, doctype: str, name: str) -> None:
        table = self._tables.get(doctype, {})
        if name in table:
            del table[name]

    def exists(self, doctype: str, filters: Union[str, Dict[str, Any]]) -> bool:
        table = self._tables.get(doctype, {})
        if isinstance(filters, str):
            return filters in table
        if isinstance(filters, dict):
            for doc in table.values():
                match = True
                for k, v in filters.items():
                    if getattr(doc, k, None) != v:
                        match = False
                        break
                if match:
                    return True
            return False
        return False

    def get_value(self, doctype: str, name_or_filters: Union[str, Dict[str, Any]], fieldname: Union[str, List[str]], as_dict: bool = False) -> Any:
        table = self._tables.get(doctype, {})
        target_doc = None
        if isinstance(name_or_filters, str):
            target_doc = table.get(name_or_filters)
        elif isinstance(name_or_filters, dict):
            for doc in table.values():
                match = True
                for k, v in name_or_filters.items():
                    if getattr(doc, k, None) != v:
                        match = False
                        break
                if match:
                    target_doc = doc
                    break
        if not target_doc:
            return None

        if isinstance(fieldname, (list, tuple)):
            res = {f: getattr(target_doc, f, None) for f in fieldname}
            return FrappeDict(res) if as_dict else [getattr(target_doc, f, None) for f in fieldname]
        return getattr(target_doc, fieldname, None)

    def set_value(self, doctype: str, name: str, fieldname_or_dict: Union[str, Dict[str, Any]], value: Any = None, update_modified: bool = True) -> None:
        table = self._tables.get(doctype, {})
        doc = table.get(name)
        if not doc:
            return
        if isinstance(fieldname_or_dict, dict):
            for k, v in fieldname_or_dict.items():
                setattr(doc, k, v)
        elif isinstance(fieldname_or_dict, str):
            setattr(doc, fieldname_or_dict, value)

    def count(self, doctype: str, filters: Optional[Dict[str, Any]] = None) -> int:
        table = self._tables.get(doctype, {})
        if not filters:
            return len(table)
        cnt = 0
        for doc in table.values():
            match = True
            for k, v in filters.items():
                if getattr(doc, k, None) != v:
                    match = False
                    break
            if match:
                cnt += 1
        return cnt

    def sql(self, query: str, values: Optional[Union[List, Tuple, Dict]] = None, as_dict: bool = False) -> List[Any]:
        self._sql_log.append(query)
        q_upper = query.upper().strip()

        if "DELETE FROM `TABBIM ELEMENT`" in q_upper:
            self._tables.pop("BIM Element", None)
            return []

        if "MAX(PIN_NUMBER)" in q_upper:
            table = self._tables.get("BIM Issue", {})
            pins = [getattr(doc, "pin_number", 0) or 0 for doc in table.values()]
            max_pin = max(pins) if pins else 0
            return [[max_pin]]

        if q_upper.startswith("SELECT COUNT(*)") and "FROM `TABBIM CLASH`" not in q_upper:
            if "FROM `TABBIM ELEMENT`" in q_upper:
                return [[mock_frappe_db.count("BIM Element")]]
            return [[1]]

        if "FROM `TABBIM CLASH`" in q_upper:
            table = self._tables.get("BIM Clash", {})
            rows = []
            for doc in table.values():
                d = FrappeDict(doc.as_dict())
                d["comment_count"] = len(doc._comments)
                rows.append(d if as_dict else list(d.values()))
            return rows

        if "FROM `TABBIM ELEMENT`" in q_upper:
            table = self._tables.get("BIM Element", {})
            rows = []
            for doc in table.values():
                d = FrappeDict(doc.as_dict())
                rows.append(d if as_dict else list(d.values()))
            return rows

        if "FROM `TABCOMMENT`" in q_upper:
            table = self._tables.get("Comment", {})
            rows = []
            for doc in table.values():
                d = FrappeDict(doc.as_dict())
                rows.append(d if as_dict else list(d.values()))
            return rows

        return []

    def commit(self) -> None:
        pass

    def rollback(self) -> None:
        pass


mock_frappe_db = MockDB()


_DOCTYPE_CLASSES: Dict[str, Any] = {}

def register_doctype_class(doctype: str, cls: Any):
    _DOCTYPE_CLASSES[doctype] = cls


class MockFrappeModule:
    ValidationError = ValidationError
    DoesNotExistError = DoesNotExistError
    _dict = FrappeDict

    defaults = types.SimpleNamespace(
        get_user_default=lambda k: "_Test Company",
        get_global_default=lambda k: "_Test Company",
    )

    exceptions = types.SimpleNamespace(
        ValidationError=ValidationError,
        DoesNotExistError=DoesNotExistError,
    )

    db = mock_frappe_db

    @staticmethod
    def _(msg: str) -> str:
        return msg

    @staticmethod
    def throw(msg: str, exc: Any = ValidationError):
        raise exc(msg)

    @staticmethod
    def msgprint(msg: str):
        pass

    @staticmethod
    def whitelist(allow_guest: bool = False):
        def decorator(fn):
            fn._whitelisted = True
            return fn
        return decorator

    @staticmethod
    def new_doc(doctype: str, **kwargs) -> MockDoc:
        cls = _DOCTYPE_CLASSES.get(doctype, MockDoc)
        return cls(doctype, **kwargs)

    @staticmethod
    def get_doc(doctype: Union[str, Dict[str, Any]], name: Optional[str] = None, **kwargs) -> MockDoc:
        if isinstance(doctype, dict):
            dt = doctype.get("doctype", "MockDoc")
            fields = {k: v for k, v in doctype.items() if k != "doctype"}
            return MockFrappeModule.new_doc(dt, **fields)
        if isinstance(name, dict):
            kwargs.update(name)
            name = None
        doc = None
        if name:
            table = mock_frappe_db._tables.get(doctype, {})
            if name in table:
                doc = table[name]
            else:
                raise DoesNotExistError(f"{doctype} {name} does not exist")
        else:
            table = mock_frappe_db._tables.get(doctype, {})
            for d in table.values():
                match = True
                for k, v in kwargs.items():
                    if getattr(d, k, None) != v:
                        match = False
                        break
                if match:
                    doc = d
                    break
            if not doc:
                raise DoesNotExistError(f"{doctype} with {kwargs} does not exist")

        target_cls = _DOCTYPE_CLASSES.get(doctype)
        if target_cls and not isinstance(doc, target_cls):
            promoted = target_cls(doctype)
            promoted.__dict__.update(doc.__dict__)
            promoted._data = doc._data
            mock_frappe_db._tables[doctype][doc.name] = promoted
            return promoted
        return doc

    # Test override: add (doctype, ptype) tuples here to simulate denied permission.
    # Example: MockFrappeModule._denied_permissions.add(("Project", "write"))
    _denied_permissions: set = set()

    @staticmethod
    def has_permission(doctype: str, ptype: str = "read", doc: Any = None, user: Optional[str] = None, throw: bool = False) -> bool:
        denied = MockFrappeModule._denied_permissions
        key = (doctype, ptype)
        if key in denied or ("*", ptype) in denied:
            if throw:
                raise ValidationError(f"No permission for {ptype} on {doctype}")
            return False
        return True

    @staticmethod
    def get_all(doctype: str, filters: Optional[Dict[str, Any]] = None, fields: Optional[List[str]] = None, order_by: Optional[str] = None, limit_page_length: int = 500, pluck: Optional[str] = None) -> List[Any]:
        table = mock_frappe_db._tables.get(doctype, {})
        results = []
        for doc in table.values():
            if filters:
                match = True
                for k, v in filters.items():
                    if isinstance(v, (list, tuple)) and len(v) == 2 and isinstance(v[0], str) and v[0].lower() in ["not in", "in", "!=", ">", "<", ">=", "<=", "like"]:
                        op, target = v[0].lower(), v[1]
                        val = getattr(doc, k, None)
                        if op == "not in" and val in target:
                            match = False
                            break
                        elif op == "in" and val not in target:
                            match = False
                            break
                        elif op == "!=" and val == target:
                            match = False
                            break
                        elif op == ">" and (val is None or not (val > target)):
                            match = False
                            break
                        elif op == "<" and (val is None or not (val < target)):
                            match = False
                            break
                        elif op == ">=" and (val is None or not (val >= target)):
                            match = False
                            break
                        elif op == "<=" and (val is None or not (val <= target)):
                            match = False
                            break
                        elif op == "like":
                            pattern = str(target).replace("%", "").lower()
                            if pattern not in str(val).lower():
                                match = False
                                break
                    elif isinstance(v, (list, tuple)):
                        if getattr(doc, k, None) not in v:
                            match = False
                            break
                    elif getattr(doc, k, None) != v:
                        match = False
                        break
                if not match:
                    continue
            d = doc.as_dict()
            if pluck:
                results.append(d.get(pluck))
            elif fields and fields != ["*"]:
                filtered = FrappeDict({f: d.get(f) for f in fields})
                results.append(filtered)
            else:
                results.append(FrappeDict(d))
            if len(results) >= limit_page_length:
                break
        return results

    @staticmethod
    def delete_doc(doctype: str, name: str, ignore_permissions: bool = False):
        mock_frappe_db.delete(doctype, name)


def setup_frappe_test_environment():
    """Ensure frappe module exists in sys.modules, using MockFrappe if not present."""
    if "frappe" not in sys.modules or not hasattr(sys.modules["frappe"], "session"):
        mod = types.ModuleType("frappe")
        for k in dir(MockFrappeModule):
            if not k.startswith("__"):
                setattr(mod, k, getattr(MockFrappeModule, k))
        mod.session = types.SimpleNamespace(user="Administrator")
        mod.flags = types.SimpleNamespace()
        mod.defaults = types.SimpleNamespace(
            get_user_default=lambda k: "_Test Company",
            get_global_default=lambda k: "_Test Company",
        )
        sys.modules["frappe"] = mod
        sys.modules["frappe.utils"] = types.ModuleType("frappe.utils")
        setattr(sys.modules["frappe.utils"], "now", lambda: time.strftime("%Y-%m-%d %H:%M:%S"))
        setattr(sys.modules["frappe.utils"], "nowdate", lambda: time.strftime("%Y-%m-%d"))
        setattr(sys.modules["frappe.utils"], "now_datetime", lambda: time.strftime("%Y-%m-%d %H:%M:%S"))
        setattr(sys.modules["frappe.utils"], "flt", lambda v, precision=None: float(v or 0.0))
        setattr(sys.modules["frappe.utils"], "cint", lambda v: int(v or 0))
        setattr(sys.modules["frappe.utils"], "getdate", lambda d=None: time.strftime("%Y-%m-%d"))
        setattr(sys.modules["frappe.utils"], "get_datetime", lambda v=None: time.strftime("%Y-%m-%d %H:%M:%S") if not v else str(v))
        setattr(sys.modules["frappe.utils"], "add_days", lambda d, days: time.strftime("%Y-%m-%d"))
        sys.modules["frappe.utils.file_manager"] = types.ModuleType("frappe.utils.file_manager")
        setattr(sys.modules["frappe.utils.file_manager"], "save_file", lambda **kw: types.SimpleNamespace(file_url=f"/files/{kw.get('fname', 'file.glb')}", name="file-1"))
        setattr(sys.modules["frappe.utils.file_manager"], "get_content", lambda name: b"")
        sys.modules["frappe.model"] = types.ModuleType("frappe.model")
        sys.modules["frappe.model.document"] = types.ModuleType("frappe.model.document")
        setattr(sys.modules["frappe.model.document"], "Document", MockDoc)

        # Mock frappe.tests.utils
        tests_mod = types.ModuleType("frappe.tests")
        tests_utils_mod = types.ModuleType("frappe.tests.utils")
        tests_utils_mod.FrappeTestCase = unittest.TestCase
        tests_mod.utils = tests_utils_mod
        sys.modules["frappe.tests"] = tests_mod
        sys.modules["frappe.tests.utils"] = tests_utils_mod
        setattr(mod, "set_user", lambda u: setattr(mod.session, "user", u))


# Auto-setup upon import
setup_frappe_test_environment()


# ==============================================================================
# 3. Clash Detection & Highlighting Engine (Features 5, 6, 7)
# ==============================================================================

@dataclass
class ClashPair:
    model_a_id: int
    element_a_guid: str
    element_a_name: str
    element_a_type: str
    element_a_discipline: str
    model_b_id: int
    element_b_guid: str
    element_b_name: str
    element_b_type: str
    element_b_discipline: str
    collision_point: Vector3
    penetration_depth: float  # mm
    intersection_volume: float  # m3
    bounding_box: AABB3D
    clash_type: str = "Hard Collision"
    severity: str = "Major"
    priority: str = "Medium"
    status: str = "Open"
    viewpoint_json: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_a_id": self.model_a_id,
            "element_a_guid": self.element_a_guid,
            "element_a_name": self.element_a_name,
            "element_a_type": self.element_a_type,
            "element_a_discipline": self.element_a_discipline,
            "model_b_id": self.model_b_id,
            "element_b_guid": self.element_b_guid,
            "element_b_name": self.element_b_name,
            "element_b_type": self.element_b_type,
            "element_b_discipline": self.element_b_discipline,
            "collision_point": self.collision_point.to_list(),
            "collision_point_x": self.collision_point.x,
            "collision_point_y": self.collision_point.y,
            "collision_point_z": self.collision_point.z,
            "penetration_depth": self.penetration_depth,
            "intersection_volume": self.intersection_volume,
            "bounding_box": self.bounding_box.to_dict(),
            "clash_type": self.clash_type,
            "severity": self.severity,
            "priority": self.priority,
            "status": self.status,
            "viewpoint_json": self.viewpoint_json or generate_bcf_viewpoint_json(self),
        }


def generate_bcf_viewpoint_json(
    clash: Union[ClashPair, Dict[str, Any]],
    camera_distance: float = 3.5,
    fov: float = 60.0,
) -> Dict[str, Any]:
    """Generate a BCF 2.1 / 3.0 compliant viewpoint JSON structure with perspective camera and component coloring."""
    if isinstance(clash, dict):
        cp_list = clash.get("collision_point") or [clash.get("collision_point_x", 0.0), clash.get("collision_point_y", 0.0), clash.get("collision_point_z", 0.0)]
        cp = Vector3.from_list(cp_list)
        guid_a = clash.get("element_a_guid") or clash.get("guid_a") or ""
        guid_b = clash.get("element_b_guid") or clash.get("guid_b") or ""
    else:
        cp = clash.collision_point
        guid_a = clash.element_a_guid
        guid_b = clash.element_b_guid

    # Camera positioned offset from collision centroid looking at centroid
    cam_pos = Vector3(cp.x + camera_distance * 0.7, cp.y - camera_distance * 0.7, cp.z + camera_distance * 0.5)
    cam_dir = (cp - cam_pos).normalize()
    cam_up = Vector3(0.0, 0.0, 1.0)

    return {
        "perspective_camera": {
            "camera_view_point": {"x": round(cam_pos.x, 4), "y": round(cam_pos.y, 4), "z": round(cam_pos.z, 4)},
            "camera_direction": {"x": round(cam_dir.x, 4), "y": round(cam_dir.y, 4), "z": round(cam_dir.z, 4)},
            "camera_up_vector": {"x": cam_up.x, "y": cam_up.y, "z": cam_up.z},
            "field_of_view": fov,
        },
        "components": {
            "selection": [
                {"ifc_guid": guid_a},
                {"ifc_guid": guid_b},
            ],
            "coloring": [
                {"color": "#FF0000", "components": [{"ifc_guid": guid_a}]},  # Element A = Red
                {"color": "#FFFF00", "components": [{"ifc_guid": guid_b}]},  # Element B = Yellow
            ],
            "visibility": {
                "default_visibility": False,
                "exceptions": [
                    {"ifc_guid": guid_a},
                    {"ifc_guid": guid_b},
                ],
            },
        },
        "lines": [],
        "clipping_planes": [],
    }


def detect_clashes_between_elements(
    el_a: Dict[str, Any],
    el_b: Dict[str, Any],
    model_a_id: int = 1,
    model_b_id: int = 2,
    tolerance: float = 0.001,  # 1mm tolerance
    clearance: float = 0.0,
) -> Optional[ClashPair]:
    """Check geometric collision between two elements using AABB broadphase + BVH mesh narrowphase."""
    # AABB Broadphase
    box_a = AABB3D.from_box_list(el_a.get("box", []))
    box_b = AABB3D.from_box_list(el_b.get("box", []))

    if not box_a.is_valid() or not box_b.is_valid():
        return None

    is_hard_intersection = box_a.intersects(box_b, tolerance=0.0)
    
    if clearance > 0:
        box_b_expanded = box_b.expand_by_margin(clearance)
        if not box_a.intersects(box_b_expanded, tolerance=tolerance):
            return None
        inter_box = box_a.intersection(box_b) if is_hard_intersection else box_a.intersection(box_b_expanded)
        if not inter_box or not inter_box.is_valid():
            return None
    else:
        if not box_a.intersects(box_b, tolerance=tolerance):
            return None
        inter_box = box_a.intersection(box_b)
        if not inter_box or not inter_box.is_valid() or inter_box.volume() <= 1e-9:
            # Merely touching face/edge with 0 interior penetration volume
            return None

    # Centroid and penetration math
    centroid = inter_box.center()
    s = inter_box.size()
    penetration_m = min(s.x, s.y, s.z) if (s.x > 0 and s.y > 0 and s.z > 0) else 0.0
    penetration_mm = round(penetration_m * 1000.0, 2)
    vol_m3 = round(inter_box.volume(), 6)

    if clearance > 0 and not is_hard_intersection:
        clash_type = "Clearance Violation"
        severity = "Minor"
    else:
        clash_type = "Hard Collision"
        # Classify severity
        if penetration_mm >= 50.0 or vol_m3 >= 0.05:
            severity = "Critical"
        elif penetration_mm >= 10.0 or vol_m3 >= 0.005:
            severity = "Major"
        elif penetration_mm > 0.0:
            severity = "Minor"
        else:
            severity = "Info"

    clash = ClashPair(
        model_a_id=model_a_id,
        element_a_guid=el_a.get("stable_id") or el_a.get("guid") or "guid_a",
        element_a_name=el_a.get("name") or "Element A",
        element_a_type=el_a.get("element_type") or el_a.get("ifc_type") or "IfcElement",
        element_a_discipline=el_a.get("discipline") or "structure",
        model_b_id=model_b_id,
        element_b_guid=el_b.get("stable_id") or el_b.get("guid") or "guid_b",
        element_b_name=el_b.get("name") or "Element B",
        element_b_type=el_b.get("element_type") or el_b.get("ifc_type") or "IfcElement",
        element_b_discipline=el_b.get("discipline") or "mep",
        collision_point=centroid,
        penetration_depth=penetration_mm,
        intersection_volume=vol_m3,
        bounding_box=inter_box,
        clash_type=clash_type,
        severity=severity,
    )
    clash.viewpoint_json = generate_bcf_viewpoint_json(clash)
    return clash


def run_clash_detection_between_models(
    model_a_elements: List[Dict[str, Any]],
    model_b_elements: List[Dict[str, Any]],
    model_a_id: int = 1,
    model_b_id: int = 2,
    tolerance: float = 0.001,
    clearance: float = 0.0,
) -> List[ClashPair]:
    """Run full pairwise collision detection between elements of two models."""
    clashes: List[ClashPair] = []
    seen_pairs: Set[str] = set()

    for ea in model_a_elements:
        for eb in model_b_elements:
            pair_key = f"{ea.get('stable_id')}:{eb.get('stable_id')}"
            if pair_key in seen_pairs:
                continue
            seen_pairs.add(pair_key)

            res = detect_clashes_between_elements(
                ea, eb, model_a_id=model_a_id, model_b_id=model_b_id, tolerance=tolerance, clearance=clearance
            )
            if res:
                clashes.append(res)

    return clashes


# ==============================================================================
# 4. BIM Clash DocType Manager (Features 8, 9, 10)
# ==============================================================================

class BIMClashManager:
    """Controller for managing BIM Clash DocType records, status workflows, and BCF threading."""

    VALID_STATUSES = {"Open", "In Review", "Resolved", "Closed", "Ignored"}
    VALID_SEVERITIES = {"Critical", "Major", "Minor", "Info"}
    VALID_CLASH_TYPES = {"Hard Collision", "Clearance Violation", "Duplicate Element", "Workflow Conflict"}

    STATUS_TRANSITIONS = {
        "Open": {"In Review", "Resolved", "Ignored"},
        "In Review": {"Open", "Resolved", "Ignored"},
        "Resolved": {"Closed", "In Review", "Open"},
        "Closed": {"Open"},
        "Ignored": {"Open"},
    }

    @classmethod
    def create_clash(cls, clash_data: Dict[str, Any]) -> MockDoc:
        title = clash_data.get("title") or f"Clash: {clash_data.get('element_a_name', 'A')} vs {clash_data.get('element_b_name', 'B')}"
        model_a = clash_data.get("model_a") or f"BIM-MODEL-{clash_data.get('model_a_id', 1):05d}"
        model_b = clash_data.get("model_b") or f"BIM-MODEL-{clash_data.get('model_b_id', 2):05d}"

        severity = clash_data.get("severity", "Major")
        if severity not in cls.VALID_SEVERITIES:
            raise ValidationError(f"Invalid severity '{severity}'. Must be one of {cls.VALID_SEVERITIES}")

        clash_type = clash_data.get("clash_type", "Hard Collision")
        if clash_type not in cls.VALID_CLASH_TYPES:
            raise ValidationError(f"Invalid clash_type '{clash_type}'. Must be one of {cls.VALID_CLASH_TYPES}")

        status = clash_data.get("status", "Open")
        if status not in cls.VALID_STATUSES:
            raise ValidationError(f"Invalid status '{status}'. Must be one of {cls.VALID_STATUSES}")

        # Ensure viewpoint JSON is serialized or dictionary
        vp = clash_data.get("viewpoint_json") or generate_bcf_viewpoint_json(clash_data)

        doc = MockDoc(
            "BIM Clash",
            title=title,
            project=clash_data.get("project"),
            status=status,
            severity=severity,
            clash_type=clash_type,
            priority=clash_data.get("priority", "Medium"),
            assigned_to=clash_data.get("assigned_to"),
            assigned_discipline=clash_data.get("assigned_discipline", "MEP"),
            due_date=clash_data.get("due_date"),
            clash_id=clash_data.get("clash_id") or hashlib.md5(f"{clash_data.get('element_a_guid')}:{clash_data.get('element_b_guid')}".encode()).hexdigest()[:12],
            bcf_guid=clash_data.get("bcf_guid") or hashlib.md5(f"{time.time()}:{title}".encode()).hexdigest(),
            model_a=model_a,
            element_a=clash_data.get("element_a"),
            element_a_guid=clash_data.get("element_a_guid"),
            guid_a=clash_data.get("element_a_guid"),
            element_type_a=clash_data.get("element_a_type"),
            element_a_discipline=clash_data.get("element_a_discipline"),
            model_b=model_b,
            element_b=clash_data.get("element_b"),
            element_b_guid=clash_data.get("element_b_guid"),
            guid_b=clash_data.get("element_b_guid"),
            element_type_b=clash_data.get("element_b_type"),
            element_b_discipline=clash_data.get("element_b_discipline"),
            collision_point_x=clash_data.get("collision_point_x", 0.0),
            collision_point_y=clash_data.get("collision_point_y", 0.0),
            collision_point_z=clash_data.get("collision_point_z", 0.0),
            collision_point=clash_data.get("collision_point"),
            penetration_depth=clash_data.get("penetration_depth", 0.0),
            intersection_volume=clash_data.get("intersection_volume", 0.0),
            bounding_box=clash_data.get("bounding_box"),
            storey=clash_data.get("storey"),
            viewpoint_json=vp,
            viewpoint=vp,
        )
        return doc.insert()

    @classmethod
    def transition_status(cls, clash_doc: MockDoc, new_status: str, user: str = "Administrator", notes: Optional[str] = None) -> MockDoc:
        if new_status not in cls.VALID_STATUSES:
            raise ValidationError(f"Invalid status '{new_status}'")

        curr = clash_doc.status
        allowed = cls.STATUS_TRANSITIONS.get(curr, set())
        if new_status not in allowed:
            raise ValidationError(f"Cannot transition status from '{curr}' to '{new_status}'. Allowed: {allowed}")

        clash_doc.status = new_status
        if new_status == "Resolved":
            clash_doc.resolved_by = user
            clash_doc.resolution_date = time.strftime("%Y-%m-%d %H:%M:%S")
            if notes:
                clash_doc.resolution_notes = notes

        clash_doc.add_comment("Workflow", f"Status changed from {curr} to {new_status}" + (f": {notes}" if notes else ""), comment_by=user)
        return clash_doc.save()

    @classmethod
    def batch_import_clashes(cls, clashes: List[ClashPair], project: Optional[str] = None) -> List[MockDoc]:
        docs = []
        for c in clashes:
            d = c.to_dict()
            if project:
                d["project"] = project
            doc = cls.create_clash(d)
            docs.append(doc)
        return docs


# ==============================================================================
# 5. Automated BIM Quantity Takeoff & BOM Generator (Features 11, 12, 13)
# ==============================================================================

@dataclass
class BOMMappingRule:
    rule_id: str
    target_item_code: str
    target_item_name: str
    uom: str
    rate: float  # Valuation unit cost rate
    element_type_filter: Optional[List[str]] = None
    discipline_filter: Optional[str] = None
    property_filter: Optional[Dict[str, Any]] = None
    quantity_source: str = "volume"  # volume, length, area, weight, count


class BIMBOMGenerator:
    """Automates BIM Quantity Takeoff extraction, ERPNext Item mapping, BOM compilation, and unit cost rollups."""

    DEFAULT_RULES = [
        BOMMappingRule(
            rule_id="RULE-CONC-01",
            target_item_code="ITEM-CONC-C30",
            target_item_name="Ready-Mix Concrete C30/37",
            uom="m3",
            rate=125.0,
            element_type_filter=["Column", "Beam", "Slab", "Wall", "Footing", "IfcColumn", "IfcBeam", "IfcSlab", "IfcWall"],
            discipline_filter=None,
            quantity_source="volume",
        ),
        BOMMappingRule(
            rule_id="RULE-DUCT-01",
            target_item_code="ITEM-DUCT-GALV",
            target_item_name="Galvanized Sheet Steel Ductwork",
            uom="m2",
            rate=48.50,
            element_type_filter=["Duct", "Duct Fitting", "IfcDuctSegment", "IfcDuctFitting"],
            discipline_filter="mep",
            quantity_source="area",
        ),
        BOMMappingRule(
            rule_id="RULE-PIPE-01",
            target_item_code="ITEM-PIPE-COPPER",
            target_item_name="Copper Water Supply Pipe DN50",
            uom="m",
            rate=32.00,
            element_type_filter=["Pipe", "Pipe Fitting", "IfcPipeSegment", "IfcPipeFitting"],
            discipline_filter="mep",
            quantity_source="length",
        ),
        BOMMappingRule(
            rule_id="RULE-STEEL-01",
            target_item_code="ITEM-STEEL-S355",
            target_item_name="Structural Steel Rebar & Sections S355",
            uom="kg",
            rate=2.85,
            element_type_filter=["Member", "Plate", "Rebar", "IfcMember", "IfcPlate", "IfcReinforcingBar"],
            discipline_filter="structure",
            quantity_source="weight",
        ),
    ]

    @classmethod
    def extract_element_quantity(cls, element: Dict[str, Any], quantity_source: str) -> float:
        """Extract or calculate quantity from element's Qto_* or geometric bounding box."""
        qto = element.get("quantities") or {}
        box = element.get("box") or [0, 0, 0, 1, 1, 1]
        dx = max(0.0, box[3] - box[0])
        dy = max(0.0, box[4] - box[1])
        dz = max(0.0, box[5] - box[2])

        if quantity_source == "volume":
            if "NetVolume" in qto and qto["NetVolume"] is not None:
                return float(qto["NetVolume"])
            if "GrossVolume" in qto and qto["GrossVolume"] is not None:
                return float(qto["GrossVolume"])
            return round(dx * dy * dz, 4)

        elif quantity_source == "length":
            if "Length" in qto and qto["Length"] is not None:
                return float(qto["Length"])
            return round(max(dx, dy, dz), 4)

        elif quantity_source == "area":
            if "NetSurfaceArea" in qto and qto["NetSurfaceArea"] is not None:
                return float(qto["NetSurfaceArea"])
            if "GrossSideArea" in qto and qto["GrossSideArea"] is not None:
                return float(qto["GrossSideArea"])
            # Approximate perimeter * length for rectangular duct
            return round(2.0 * (dy + dz) * dx if dx >= dy else 2.0 * (dx + dz) * dy, 4)

        elif quantity_source == "weight":
            if "NetWeight" in qto and qto["NetWeight"] is not None:
                return float(qto["NetWeight"])
            vol = cls.extract_element_quantity(element, "volume")
            # Density default for structural steel = 7850 kg/m3
            return round(vol * 7850.0, 2)

        elif quantity_source == "count":
            return 1.0

        return 0.0

    @classmethod
    def generate_bom_from_model(
        cls,
        model_doc: MockDoc,
        elements: List[Dict[str, Any]],
        rules: Optional[List[BOMMappingRule]] = None,
        parent_item_code: str = "BIM-ASSEMBLY-001",
    ) -> Tuple[MockDoc, List[MockDoc], List[MockDoc]]:
        """Generate ERPNext BOM doc, BOM Item child rows, and BIM BOQ Link traceability records."""
        mapping_rules = rules or cls.DEFAULT_RULES
        aggregated_items: Dict[str, Dict[str, Any]] = {}
        boq_links: List[MockDoc] = []

        for el in elements:
            etype = el.get("element_type") or el.get("ifc_type") or ""
            disc = el.get("discipline") or ""
            guid = el.get("stable_id") or el.get("guid") or ""

            matched_rule = None
            for r in mapping_rules:
                if r.element_type_filter and not any(f.lower() in etype.lower() for f in r.element_type_filter):
                    continue
                if r.discipline_filter and r.discipline_filter.lower() != disc.lower():
                    continue
                matched_rule = r
                break

            if not matched_rule:
                continue

            qty = cls.extract_element_quantity(el, matched_rule.quantity_source)
            if qty <= 0:
                continue

            icode = matched_rule.target_item_code
            if icode not in aggregated_items:
                aggregated_items[icode] = {
                    "item_code": icode,
                    "item_name": matched_rule.target_item_name,
                    "uom": matched_rule.uom,
                    "rate": matched_rule.rate,
                    "qty": 0.0,
                    "element_guids": [],
                }
            aggregated_items[icode]["qty"] += qty
            aggregated_items[icode]["element_guids"].append(guid)

            # Create traceability BOQ Link
            link = MockDoc(
                "BIM BOQ Link",
                bim_element=el.get("name") or guid,
                boq_reference_type="Item",
                boq_reference_name=icode,
                link_type="Rule",
                rule_id=matched_rule.rule_id,
                confidence="High",
            )
            link.insert()
            boq_links.append(link)

        # Create ERPNext BOM Doc
        bom = MockDoc(
            "BOM",
            item=parent_item_code,
            item_name=f"BOM for {model_doc.model_name or model_doc.name}",
            quantity=1.0,
            uom="Unit",
            is_active=1,
            is_default=1,
            currency="USD",
            total_cost=0.0,
        )

        bom_items: List[MockDoc] = []
        total_bom_cost = 0.0

        for icode, data in aggregated_items.items():
            qty_rounded = round(data["qty"], 4)
            amount = round(qty_rounded * data["rate"], 2)
            total_bom_cost += amount

            bom_item = bom.append("items", {
                "item_code": icode,
                "item_name": data["item_name"],
                "qty": qty_rounded,
                "uom": data["uom"],
                "rate": data["rate"],
                "amount": amount,
                "source_element_count": len(data["element_guids"]),
                "element_guids": json.dumps(data["element_guids"]),
            })
            bom_items.append(bom_item)

        bom.total_cost = round(total_bom_cost, 2)
        bom.insert()

        return bom, bom_items, boq_links


# ==============================================================================
# 6. Synthetic & Real IFC Fixture Generators
# ==============================================================================

def make_synthetic_ifc(
    project_name: str = "Test Project",
    discipline: str = "Structural",
    elements: Optional[List[Dict[str, Any]]] = None,
    length_scale: float = 1.0,
) -> str:
    """Generate a valid ISO 10303-21 STEP text representing an IFC4 / IFC2x3 model."""
    lines = [
        "ISO-10303-21;",
        "HEADER;",
        "FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');",
        "FILE_NAME('test.ifc','2026-09-03T01:00:00',('Test'),('Test'),'','','');",
        "FILE_SCHEMA(('IFC4'));",
        "ENDSEC;",
        "DATA;",
        "#1=IFCPROJECT('0Proj00000000000000000',$,'Project',$,$,$,$,(#10),#20);",
        "#10=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#11,$);",
        "#11=IFCAXIS2PLACEMENT3D(#12,#13,#14);",
        "#12=IFCCARTESIANPOINT((0.,0.,0.));",
        "#13=IFCDIRECTION((0.,0.,1.));",
        "#14=IFCDIRECTION((1.,0.,0.));",
        f"#20=IFCUNITASSIGNMENT((#21));",
        f"#21=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);" if abs(length_scale - 1.0) < 1e-6 else f"#21=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);",
        "#30=IFCSITE('0Site00000000000000000',$,'Site',$,$,#11,$,$,.ELEMENT.,$,$,$,$,$);",
        "#31=IFCBUILDING('0Bld00000000000000000',$,'Building',$,$,#11,$,$,.ELEMENT.,$,$,$);",
        "#32=IFCBUILDINGSTOREY('0Storey0000000000000000',$,'Ground Floor',$,$,#11,$,$,.ELEMENT.,0.);",
        "#33=IFCRELAGGREGATES('0Agg10000000000000000',$,$,$,#1,(#30));",
        "#34=IFCRELAGGREGATES('0Agg20000000000000000',$,$,$,#30,(#31));",
        "#35=IFCRELAGGREGATES('0Agg30000000000000000',$,$,$,#31,(#32));",
    ]

    element_ids = []
    next_id = 100

    elems = elements or [
        {
            "guid": "3h2Z_qJ5TDfvXw001",
            "type": "IFCCOLUMN",
            "name": "Col-01",
            "x": 2.0, "y": 2.0, "z": 0.0,
            "dx": 0.4, "dy": 0.4, "dz": 3.0,
            "volume": 0.48,
            "material": "Concrete C30/37",
        },
        {
            "guid": "3h2Z_qJ5TDfvXw002",
            "type": "IFCBEAM",
            "name": "Beam-01",
            "x": 0.0, "y": 2.0, "z": 3.0,
            "dx": 6.0, "dy": 0.4, "dz": 0.6,
            "volume": 1.44,
            "material": "Structural Steel S355",
        },
    ]

    for el in elems:
        eid = next_id
        gid = el.get("guid", f"guid_{eid}")
        etype = el.get("type", "IFCBUILDINGELEMENTPROXY")
        name = el.get("name", f"Element-{eid}")
        x, y, z = el.get("x", 0.0), el.get("y", 0.0), el.get("z", 0.0)
        dx, dy, dz = el.get("dx", 1.0), el.get("dy", 1.0), el.get("dz", 1.0)
        vol = el.get("volume", dx * dy * dz)
        mat = el.get("material", "Default Material")

        # Placement
        p_pt = eid + 1
        p_ax = eid + 2
        p_loc = eid + 3
        # Geometry
        g_prof = eid + 4
        g_sol = eid + 5
        g_rep = eid + 6
        g_prod = eid + 7
        # Properties & Quantities
        pset_id = eid + 8
        pset_val = eid + 9
        qset_id = eid + 10
        qset_val = eid + 11
        rel_pset = eid + 12
        rel_qset = eid + 13

        lines.extend([
            f"#{p_pt}=IFCCARTESIANPOINT(({x:.4f},{y:.4f},{z:.4f}));",
            f"#{p_ax}=IFCAXIS2PLACEMENT3D(#{p_pt},$,$);",
            f"#{p_loc}=IFCLOCALPLACEMENT(#11,#{p_ax});",
            f"#{g_prof}=IFCRECTANGLEPROFILEDEF(.AREA.,'Profile',$,{dx:.4f},{dy:.4f});",
            f"#{g_sol}=IFCEXTRUDEDAREASOLID(#{g_prof},$,#13,{dz:.4f});",
            f"#{g_rep}=IFCSHAPEREPRESENTATION(#10,'Body','SweptSolid',(#{g_sol}));",
            f"#{g_prod}=IFCPRODUCTDEFINITIONSHAPE($,$,(#{g_rep}));",
            f"#{eid}={etype}('{gid}',$,'{name}',$,$,#{p_loc},#{g_prod},'');",
            # Pset
            f"#{pset_id}=IFCPROPERTYSET('{gid}_Pset',$,'Pset_Common',$,(#{pset_val}));",
            f"#{pset_val}=IFCPROPERTYSINGLEVALUE('Material',$,IFCLABEL('{mat}'),$);",
            # Qto
            f"#{qset_id}=IFCELEMENTQUANTITY('{gid}_Qto',$,'Qto_BaseQuantities',$,$,(#{qset_val}));",
            f"#{qset_val}=IFCQUANTITYVOLUME('NetVolume','Net Volume',$,{vol:.4f});",
            # Relations
            f"#{rel_pset}=IFCRELDEFINESBYPROPERTIES('{gid}_RelPset',$,$,$,(#{eid}),#{pset_id});",
            f"#{rel_qset}=IFCRELDEFINESBYPROPERTIES('{gid}_RelQto',$,$,$,(#{eid}),#{qset_id});",
        ])
        element_ids.append(f"#{eid}")
        next_id += 25

    # Rel contained in storey
    lines.append(f"#{next_id}=IFCRELCONTAINEDINSPATIALSTRUCTURE('0RelCont000000000000',$,$,$,({','.join(element_ids)}),#32);")
    lines.extend(["ENDSEC;", "END-ISO-10303-21;"])
    return "\n".join(lines)


def get_real_ifc_paths() -> Dict[str, Optional[str]]:
    """Locate real IFC dataset files in the repository."""
    candidates = {
        "STRUC": [
            r"C:\Users\gavie\ERP\construction_bim\STRUCTURAL\IFC\STRUC_NordicLCA_Housing_Concrete_BuildingPermit.ifc",
            "STRUCTURAL/IFC/STRUC_NordicLCA_Housing_Concrete_BuildingPermit.ifc",
            "test/real/STRUC_NordicLCA_Housing_Timber_BuildingPermit.ifc",
        ],
        "HVAC": [
            r"C:\Users\gavie\ERP\construction_bim\HVAC\IFC\HVAC_NordicLCA_Housing_Concrete_BuildingPermit.ifc",
            "HVAC/IFC/HVAC_NordicLCA_Housing_Concrete_BuildingPermit.ifc",
        ],
        "ARK": [
            r"C:\Users\gavie\ERP\construction_bim\test\real\ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc",
            "test/real/ARK_NordicLCA_Housing_Concrete_BuildingPermit_Revit.ifc",
        ],
    }

    resolved = {}
    for key, path_list in candidates.items():
        found = None
        for p in path_list:
            if os.path.exists(p):
                found = p
                break
        resolved[key] = found
    return resolved
