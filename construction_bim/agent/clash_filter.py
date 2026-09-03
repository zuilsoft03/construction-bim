"""Collaborative Clash Filtering and Trade Clustering Agent for Construction BIM.

Module: construction_bim.agent.clash_filter
"""

from __future__ import annotations

import collections
import logging
import math
from typing import Any, Dict, List, Optional

import frappe
from frappe import _

logger = logging.getLogger(__name__)

# Elements where small penetrations are typical intentional design sleeves (e.g. MEP through Drywall)
INTENTIONAL_PENETRATION_TYPES = {
    "IFCWALL": ["IFCPIPESEGMENT", "IFCDUCTSEGMENT", "IFCCABLECARRIERSEGMENT"],
    "IFCWALLSTANDARDCASE": ["IFCPIPESEGMENT", "IFCDUCTSEGMENT"],
    "IFCSLAB": ["IFCPIPESEGMENT", "IFCDUCTSEGMENT"]
}


@frappe.whitelist()
def filter_and_group_clashes(
    project_id: Optional[str] = None,
    clash_names: Optional[List[str]] = None,
    min_penetration_mm: float = 5.0
) -> Dict[str, Any]:
    """
    Filter BIM clashes, classify false positives, assess structural risk, and group genuine clashes by trade pair and storey.
    
    Parameters:
        project_id (Optional[str]): Project identifier used to limit the clashes evaluated.
        clash_names (Optional[List[str]]): Clash names used to limit the clashes evaluated.
        min_penetration_mm (float): Minimum positive penetration depth considered significant.
    
    Returns:
        Dict[str, Any]: A result containing evaluation counts, genuine clashes with risk classifications, false positives with reasons, trade-and-storey clusters, and a success status.
    """
    filters = {}
    if project_id:
        filters["project"] = project_id
    if clash_names:
        filters["name"] = ["in", clash_names]

    clashes = frappe.get_all(
        "BIM Clash",
        filters=filters,
        fields=[
            "name", "title", "severity", "clash_type", "penetration_depth",
            "model_a", "model_b", "element_a_type", "element_b_type",
            "element_a_guid", "element_b_guid", "discipline_a", "discipline_b",
            "storey", "collision_point_x", "collision_point_y", "collision_point_z"
        ]
    )

    real_clashes = []
    false_positives = []
    trade_clusters = collections.defaultdict(list)

    for cl in clashes:
        depth = float(cl.get("penetration_depth") or 0.0)
        type_a = (cl.get("element_a_type") or "").upper()
        type_b = (cl.get("element_b_type") or "").upper()
        disc_a = cl.get("discipline_a") or "Discipline A"
        disc_b = cl.get("discipline_b") or "Discipline B"
        storey = cl.get("storey") or "General"

        # 1. Check Sub-tolerance
        if depth < min_penetration_mm and depth > 0:
            false_positives.append({
                "clash": cl["name"],
                "reason": f"Sub-tolerance surface contact ({depth:.1f} mm < {min_penetration_mm} mm)",
                "depth_mm": depth
            })
            continue

        # 2. Check Intentional Sleeve / Opening penetration
        is_intentional = False
        for host, penetrators in INTENTIONAL_PENETRATION_TYPES.items():
            if (host in type_a and any(p in type_b for p in penetrators)) or \
               (host in type_b and any(p in type_a for p in penetrators)):
                # If penetration depth is less than standard pipe sleeve clearance (e.g. 50mm)
                if depth < 50.0:
                    false_positives.append({
                        "clash": cl["name"],
                        "reason": f"Standard pipe/duct wall sleeve penetration ({type_a} vs {type_b})",
                        "depth_mm": depth
                    })
                    is_intentional = True
                    break

        if is_intentional:
            continue

        # 3. Classify genuine structural risk
        risk_level = "Major"
        if any(heavy in type_a or heavy in type_b for heavy in ["COLUMN", "BEAM", "GIRDER", "FOUNDATION"]):
            risk_level = "Critical"
        elif depth > 100.0:
            risk_level = "Critical"
        elif depth < 20.0:
            risk_level = "Minor"

        real_item = {
            "clash": cl["name"],
            "title": cl.get("title"),
            "risk_level": risk_level,
            "depth_mm": depth,
            "element_a": cl.get("element_a_guid"),
            "element_b": cl.get("element_b_guid"),
            "trades": f"{disc_a} vs {disc_b}",
            "storey": storey
        }
        real_clashes.append(real_item)

        # Cluster by trade pair + storey
        cluster_key = f"{disc_a} <-> {disc_b} [{storey}]"
        trade_clusters[cluster_key].append(cl["name"])

    return {
        "status": "success",
        "total_evaluated": len(clashes),
        "real_clashes_count": len(real_clashes),
        "false_positives_count": len(false_positives),
        "real_clashes": real_clashes,
        "false_positives": false_positives,
        "trade_clusters": dict(trade_clusters)
    }
