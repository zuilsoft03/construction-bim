"""Consolidated API endpoints for Construction BIM."""

from __future__ import annotations

import frappe

# Clash detection endpoints
from .clash import (
    save_clashes_batch,
    get_clashes,
    get_clash,
    add_clash_comment,
    update_clash_status,
    delete_clash,
)

# BOM Integration endpoints
from .bom_integration import (
    get_model_quantity_summary,
    preview_bom_generation,
    generate_or_update_bom,
)

__all__ = [
    "save_clashes_batch",
    "get_clashes",
    "get_clash",
    "add_clash_comment",
    "update_clash_status",
    "delete_clash",
    "get_model_quantity_summary",
    "preview_bom_generation",
    "generate_or_update_bom",
]
