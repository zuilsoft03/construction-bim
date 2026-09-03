"""Project Initiation Pipeline & Ingestion Engine for Construction BIM.

Handles:
1. Category-to-Drive folder routing and automatic DocType instantiation.
2. Discipline auto-detection for uploaded IFC files (Architecture, Structural, MEP).
3. Smart BOQ CSV/Excel parsing with fuzzy column mapping and standard template generation.
4. Multi-model coordinate alignment checking and drift mitigation.
5. Formal stage-gate readiness evaluation, baseline freeze, and kickoff.
"""

from __future__ import annotations

import csv
import io
import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

try:
    import frappe
except ImportError:
    frappe = None

from construction_bim.construction.drive_tree import build_tree, DEFAULT_TREE


# ---------------------------------------------------------------------------
# Core Pure-Python Helpers (Zero Frappe Dependency for Unit Testing)
# ---------------------------------------------------------------------------

CATEGORY_DRIVE_FOLDER_MAP = {
    "contract": "01_Contracts",
    "cad": "02_Drawings/DWG",
    "dwg": "02_Drawings/DWG",
    "pdf": "02_Drawings/PDF",
    "ifc": "03_BIM_Models",
    "model": "03_BIM_Models",
    "boq": "04_Takeoffs",
    "takeoff": "04_Takeoffs",
    "schedule": "05_Schedule",
    "qa_qc": "07_QA_QC_HSE",
    "admin": "00_Admin",
}

DISCIPLINE_PATTERNS = [
    (r"(?i)\b(arch\w*|ark\w*|facade\w*|interior\w*)\b", "Architecture"),
    (r"(?i)\b(struc\w*|rebar\w*|concrete\w*|steel\w*)\b", "Structural"),
    (r"(?i)\b(mep\w*|hvac\w*|mech\w*|plumb\w*|pip\w*|elec\w*|duct\w*)\b", "MEP"),
]

STANDARD_BOQ_COLUMNS = [
    "item_code",
    "description",
    "unit",
    "quantity",
    "unit_rate",
    "total_amount",
]

BOQ_COLUMN_SYNONYMS = {
    "item_code": ["item", "code", "item code", "item_code", "pay item", "item no", "no", "item #", "id"],
    "description": ["description", "item description", "work description", "scope", "title", "particulars", "specification"],
    "unit": ["unit", "uom", "unit of measure", "measure", "unit_of_measure"],
    "quantity": ["quantity", "qty", "takeoff qty", "amount/qty", "volume", "count"],
    "unit_rate": ["unit rate", "rate", "unit price", "price", "cost/unit", "unit_cost", "direct rate"],
    "total_amount": ["total amount", "total", "amount", "line total", "total cost", "total_price", "total php"],
}


def detect_discipline(filename: str, ifc_types: Optional[List[str]] = None) -> str:
    """Heuristic determination of BIM discipline from filename or entity distribution."""
    clean_name = re.sub(r"[_\-.]+", " ", os.path.basename(filename))
    for pattern, disc in DISCIPLINE_PATTERNS:
        if re.search(pattern, clean_name):
            return disc

    if ifc_types:
        struc_entities = {"IfcBeam", "IfcColumn", "IfcFooting", "IfcReinforcingBar", "IfcSlab"}
        mep_entities = {"IfcFlowSegment", "IfcPipeFitting", "IfcDuctSegment", "IfcFlowFitting", "IfcDistributionElement"}
        struc_count = sum(1 for t in ifc_types if t in struc_entities)
        mep_count = sum(1 for t in ifc_types if t in mep_entities)
        if struc_count > mep_count and struc_count > 0:
            return "Structural"
        if mep_count > struc_count and mep_count > 0:
            return "MEP"

    return "Architecture"


def fuzzy_match_columns(headers: List[str]) -> Dict[str, Optional[str]]:
    """Match raw spreadsheet column headers to standard BOQ fieldnames."""
    mapping: Dict[str, Optional[str]] = {col: None for col in STANDARD_BOQ_COLUMNS}
    cleaned_headers = [(idx, h.strip(), re.sub(r"[^a-zA-Z0-9 ]", "", h.lower().strip())) for idx, h in enumerate(headers)]

    for target_col, synonyms in BOQ_COLUMN_SYNONYMS.items():
        for syn in synonyms:
            syn_clean = re.sub(r"[^a-zA-Z0-9 ]", "", syn.lower())
            for idx, orig_header, clean_header in cleaned_headers:
                if clean_header == syn_clean:
                    mapping[target_col] = orig_header
                    break
            if mapping[target_col] is not None:
                break

    # Fallback to substring containment
    for target_col, synonyms in BOQ_COLUMN_SYNONYMS.items():
        if mapping[target_col] is not None:
            continue
        for syn in synonyms:
            syn_clean = re.sub(r"[^a-zA-Z0-9 ]", "", syn.lower())
            for idx, orig_header, clean_header in cleaned_headers:
                if syn_clean in clean_header and orig_header not in mapping.values():
                    mapping[target_col] = orig_header
                    break
            if mapping[target_col] is not None:
                break

    return mapping


def parse_boq_csv_data(raw_csv_text: str, custom_mapping: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Parse CSV text into normalized BOQ items and summary totals."""
    f = io.StringIO(raw_csv_text.strip())
    reader = csv.reader(f)
    try:
        headers = next(reader)
    except StopIteration:
        return {"items": [], "total_amount": 0.0, "line_count": 0, "headers": [], "mapping": {}}

    mapping = custom_mapping or fuzzy_match_columns(headers)
    items = []
    total_amount = 0.0

    col_idx = {h: idx for idx, h in enumerate(headers)}

    def get_val(row: List[str], standard_col: str, default: Any = "") -> Any:
        header_name = mapping.get(standard_col)
        if header_name and header_name in col_idx:
            idx = col_idx[header_name]
            if idx < len(row):
                return row[idx].strip()
        return default

    for row_idx, row in enumerate(reader):
        if not any(cell.strip() for cell in row):
            continue

        item_code = get_val(row, "item_code", f"ITEM-{row_idx + 1:04d}")
        desc = get_val(row, "description", f"Work Item {row_idx + 1}")
        unit = get_val(row, "unit", "lot")
        
        try:
            qty_str = re.sub(r"[^0-9.-]", "", str(get_val(row, "quantity", "1")))
            quantity = float(qty_str) if qty_str else 1.0
        except ValueError:
            quantity = 1.0

        try:
            rate_str = re.sub(r"[^0-9.-]", "", str(get_val(row, "unit_rate", "0")))
            unit_rate = float(rate_str) if rate_str else 0.0
        except ValueError:
            unit_rate = 0.0

        try:
            amt_str = re.sub(r"[^0-9.-]", "", str(get_val(row, "total_amount", "0")))
            row_total = float(amt_str) if amt_str else (quantity * unit_rate)
        except ValueError:
            row_total = quantity * unit_rate

        if row_total == 0.0 and quantity > 0 and unit_rate > 0:
            row_total = quantity * unit_rate

        total_amount += row_total

        items.append({
            "item_code": item_code,
            "description": desc,
            "unit": unit,
            "quantity": quantity,
            "unit_rate": unit_rate,
            "total_amount": round(row_total, 2),
        })

    return {
        "headers": headers,
        "mapping": mapping,
        "items": items,
        "total_amount": round(total_amount, 2),
        "line_count": len(items),
    }


def generate_standard_boq_csv_template() -> str:
    """Generate RFC4180 CSV standard BOQ template with sample construction pay items."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Item Code", "Item Description", "Unit of Measure", "Quantity", "Unit Rate (PHP)", "Total Amount (PHP)"])
    sample_rows = [
        ["STR-CONC-01", "3000 PSI Ready Mix Concrete (Columns & Beams)", "m3", "125.00", "5500.00", "687500.00"],
        ["STR-STEL-01", "Grade 60 Deformed Rebar #16 & #20", "kg", "8400.00", "48.50", "407400.00"],
        ["STR-FORM-01", "Phenolic Marine Plywood Formwork & Shoring", "m2", "450.00", "850.00", "382500.00"],
        ["ARC-MASN-01", "150mm Concrete Hollow Block (CHB) Laying", "m2", "380.00", "920.00", "349600.00"],
        ["MEP-DUCT-01", "Galvanized Iron Sheet Air Ducting 0.8mm", "m2", "180.00", "2200.00", "396000.00"],
        ["MEP-PIPE-01", "Sch 40 Chilled Water Steel Piping 100mm", "m", "95.00", "3100.00", "294500.00"],
    ]
    for r in sample_rows:
        writer.writerow(r)
    return output.getvalue()


def evaluate_coordinate_drift(models_bboxes: List[Dict[str, Any]], max_drift_threshold: float = 100.0) -> Dict[str, Any]:
    """Inspect spatial bounding boxes of federated models to detect origin translation drift.

    models_bboxes format:
    [
        {"name": "ARK", "min": [x, y, z], "max": [x, y, z]},
        {"name": "STRUC", "min": [x, y, z], "max": [x, y, z]}
    ]
    """
    if len(models_bboxes) < 2:
        return {
            "status": "aligned",
            "drift_detected": False,
            "max_distance": 0.0,
            "message": "Single model or no models loaded; alignment verified.",
        }

    centers = []
    for m in models_bboxes:
        min_pt = m.get("min", [0, 0, 0])
        max_pt = m.get("max", [0, 0, 0])
        cx = (min_pt[0] + max_pt[0]) / 2.0
        cy = (min_pt[1] + max_pt[1]) / 2.0
        cz = (min_pt[2] + max_pt[2]) / 2.0
        centers.append((m.get("name", "Unknown"), (cx, cy, cz)))

    ref_name, ref_center = centers[0]
    drift_models = []
    max_dist = 0.0

    for name, center in centers[1:]:
        dx = center[0] - ref_center[0]
        dy = center[1] - ref_center[1]
        dz = center[2] - ref_center[2]
        dist = (dx**2 + dy**2 + dz**2) ** 0.5
        if dist > max_dist:
            max_dist = dist
        if dist > max_drift_threshold:
            drift_models.append({
                "model": name,
                "distance": round(dist, 2),
                "offset_vector": [round(-dx, 3), round(-dy, 3), round(-dz, 3)],
            })

    if drift_models:
        return {
            "status": "warning",
            "drift_detected": True,
            "max_distance": round(max_dist, 2),
            "drift_models": drift_models,
            "message": f"Coordinate drift detected! Maximum distance between origins: {max_dist:.2f}m.",
        }

    return {
        "status": "aligned",
        "drift_detected": False,
        "max_distance": round(max_dist, 2),
        "message": f"All {len(models_bboxes)} models aligned within tolerance ({max_dist:.2f}m).",
    }


def compute_initiation_readiness(
    has_contract: bool,
    has_models: bool,
    has_boq: bool,
    models_aligned: bool,
    contract_amount: float = 0.0,
    estimated_cost: float = 0.0,
) -> Dict[str, Any]:
    """Check whether a project meets all 4 formal stage-gate requirements for kickoff."""
    gates = [
        {
            "id": "gate_contract",
            "name": "Commercial Baseline (Contract)",
            "passed": bool(has_contract and contract_amount > 0),
            "description": f"Contract value set to PHP {contract_amount:,.2f}" if contract_amount > 0 else "Pending contract upload or contract amount entry",
        },
        {
            "id": "gate_model",
            "name": "Technical Federation (BIM Models)",
            "passed": bool(has_models and models_aligned),
            "description": "IFC model(s) loaded and aligned" if (has_models and models_aligned) else ("Coordinate drift warning unresolved" if has_models else "Upload at least 1 Architecture/Structural IFC model"),
        },
        {
            "id": "gate_boq",
            "name": "Cost Baseline (BOQ & Estimates)",
            "passed": bool(has_boq and estimated_cost > 0),
            "description": f"BOQ direct cost: PHP {estimated_cost:,.2f}" if estimated_cost > 0 else "Pending BOQ spreadsheet upload and estimate confirmation",
        },
        {
            "id": "gate_approval",
            "name": "Stage-Gate Verification Sign-Off",
            "passed": bool(has_contract and has_models and has_boq and models_aligned),
            "description": "Ready for Project Manager initiation sign-off" if (has_contract and has_models and has_boq and models_aligned) else "Prerequisites incomplete",
        },
    ]

    all_ready = all(g["passed"] for g in gates[:3])
    variance = (contract_amount - estimated_cost) if (contract_amount and estimated_cost) else 0.0

    return {
        "all_ready": all_ready,
        "gates": gates,
        "contract_amount": contract_amount,
        "estimated_cost": estimated_cost,
        "variance": round(variance, 2),
    }


# ---------------------------------------------------------------------------
# Frappe-Whitelisted RPC Handlers
# ---------------------------------------------------------------------------

if frappe:

    @frappe.whitelist()
    def get_initiation_status(project: str) -> Dict[str, Any]:
        """Fetch real-time initiation status, checklist gates, and drive tree links."""
        if not frappe.db.exists("Project", project):
            frappe.throw(f"Project '{project}' not found.", frappe.DoesNotExistError)

        doc = frappe.get_doc("Project", project)

        # 1. Drive folder verification
        drive_folder = doc.get("custom_drive_folder")
        drive_tree_ready = bool(drive_folder and frappe.db.exists("File", drive_folder))

        # 2. Contracts verification
        contract_count = frappe.db.count("Construction Contract", filters={"project": project})
        contract_amount = float(doc.get("custom_contract_amount") or 0.0)
        has_contract = (contract_count > 0 or contract_amount > 0)

        # 3. BIM Models verification
        models = frappe.get_all(
            "BIM Model",
            filters={"project": project},
            fields=["name", "model_name", "discipline", "file", "glb_file", "elements_count", "coordinate_offset"],
        )
        has_models = len(models) > 0

        # 4. BOQ & Estimates verification
        estimates = frappe.get_all(
            "Construction Estimate",
            filters={"project": project},
            fields=["name", "estimate_name", "total_cost", "status"],
        )
        boq_links_count = frappe.db.count("BIM BOQ Link", filters={"project": project})
        has_boq = (len(estimates) > 0 or boq_links_count > 0)
        estimated_cost = sum(float(e.total_cost or 0.0) for e in estimates)

        # 5. CAD Drawings verification
        cad_count = frappe.db.count("DWG Measurement", filters={"project": project}) if frappe.db.exists("DocType", "DWG Measurement") else 0

        # 6. Evaluate coordinate alignment
        models_bboxes = []
        for m in models:
            offset = json.loads(m.coordinate_offset or "{}") if m.coordinate_offset else {}
            models_bboxes.append({
                "name": m.model_name or m.name,
                "min": [offset.get("x", 0.0), offset.get("y", 0.0), offset.get("z", 0.0)],
                "max": [offset.get("x", 0.0) + 50.0, offset.get("y", 0.0) + 50.0, offset.get("z", 0.0) + 20.0],
            })
        alignment_report = evaluate_coordinate_drift(models_bboxes)
        models_aligned = not alignment_report.get("drift_detected", False)

        # 7. Compute readiness
        readiness = compute_initiation_readiness(
            has_contract=has_contract,
            has_models=has_models,
            has_boq=has_boq,
            models_aligned=models_aligned,
            contract_amount=contract_amount,
            estimated_cost=estimated_cost,
        )

        return {
            "status": "success",
            "project": project,
            "project_name": doc.project_name,
            "project_status": doc.status,
            "drive_tree_ready": drive_tree_ready,
            "drive_folder": drive_folder,
            "contract_count": contract_count,
            "models": models,
            "estimates": estimates,
            "cad_count": cad_count,
            "alignment": alignment_report,
            "readiness": readiness,
        }

    @frappe.whitelist()
    def upload_intake_file(
        project: str,
        category: str,
        file_url: str,
        filename: str,
        discipline: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Route uploaded intake file into Drive and instantiate linked DocType."""
        if not frappe.db.exists("Project", project):
            frappe.throw(f"Project '{project}' not found.")

        cat_folder = CATEGORY_DRIVE_FOLDER_MAP.get(category.lower(), "00_Admin")
        proj_doc = frappe.get_doc("Project", project)

        created_records = {}

        if category in ("ifc", "model"):
            disc = discipline or detect_discipline(filename)
            bim_model = frappe.get_doc({
                "doctype": "BIM Model",
                "model_name": filename,
                "project": project,
                "discipline": disc,
                "file": file_url,
            })
            bim_model.insert(ignore_permissions=True)
            created_records["BIM Model"] = bim_model.name

        elif category == "contract":
            if frappe.db.exists("DocType", "Construction Contract"):
                contract = frappe.get_doc({
                    "doctype": "Construction Contract",
                    "contract_name": f"Contract - {filename}",
                    "project": project,
                    "contract_document": file_url,
                    "status": "Draft",
                })
                contract.insert(ignore_permissions=True)
                created_records["Construction Contract"] = contract.name

        elif category in ("boq", "takeoff"):
            created_records["boq_staged"] = file_url

        elif category in ("cad", "dwg"):
            if frappe.db.exists("DocType", "DWG Measurement"):
                created_records["DWG File"] = file_url

        frappe.db.commit()

        return {
            "status": "success",
            "project": project,
            "category": category,
            "routed_folder": cat_folder,
            "created_records": created_records,
        }

    @frappe.whitelist()
    def parse_boq_file(file_url: str) -> Dict[str, Any]:
        """Inspect and parse an uploaded BOQ spreadsheet (CSV)."""
        file_doc = frappe.get_doc("File", {"file_url": file_url})
        content = file_doc.get_content()
        if isinstance(content, bytes):
            content = content.decode("utf-8", errors="replace")

        result = parse_boq_csv_data(content)
        return {
            "status": "success",
            "headers": result["headers"],
            "suggested_mapping": result["mapping"],
            "preview_items": result["items"][:10],
            "total_items_count": result["line_count"],
            "total_amount": result["total_amount"],
        }

    @frappe.whitelist()
    def commit_boq_estimate(
        project: str,
        file_url: str,
        mapping_json: str,
    ) -> Dict[str, Any]:
        """Commit parsed BOQ items into Construction Estimate and create BIM BOQ Links."""
        if not frappe.db.exists("Project", project):
            frappe.throw(f"Project '{project}' not found.")

        file_doc = frappe.get_doc("File", {"file_url": file_url})
        content = file_doc.get_content()
        if isinstance(content, bytes):
            content = content.decode("utf-8", errors="replace")

        mapping = json.loads(mapping_json) if isinstance(mapping_json, str) else mapping_json
        parsed = parse_boq_csv_data(content, custom_mapping=mapping)

        estimate_name = None
        if frappe.db.exists("DocType", "Construction Estimate"):
            est = frappe.get_doc({
                "doctype": "Construction Estimate",
                "estimate_name": f"BOQ Baseline - {project}",
                "project": project,
                "total_cost": parsed["total_amount"],
                "status": "Baselined",
            })
            est.insert(ignore_permissions=True)
            estimate_name = est.name

        proj_doc = frappe.get_doc("Project", project)
        if not proj_doc.get("custom_contract_amount") or float(proj_doc.get("custom_contract_amount")) == 0:
            proj_doc.custom_contract_amount = parsed["total_amount"]
            proj_doc.custom_boq_source = "Construction Estimate"
            proj_doc.save(ignore_permissions=True)

        frappe.db.commit()

        return {
            "status": "success",
            "project": project,
            "estimate": estimate_name,
            "lines_imported": parsed["line_count"],
            "total_amount": parsed["total_amount"],
        }

    @frappe.whitelist()
    def download_boq_template() -> Dict[str, Any]:
        """Return standard CSV template content for download."""
        csv_text = generate_standard_boq_csv_template()
        return {
            "status": "success",
            "filename": "standard_construction_boq_template.csv",
            "csv_data": csv_text,
        }

    @frappe.whitelist()
    def align_model_coordinates(
        model_name: str,
        offset_x: float,
        offset_y: float,
        offset_z: float,
    ) -> Dict[str, Any]:
        """Store coordinate translation offset vector for an IFC BIM Model."""
        if not frappe.db.exists("BIM Model", model_name):
            frappe.throw(f"BIM Model '{model_name}' not found.")

        offset = {"x": float(offset_x), "y": float(offset_y), "z": float(offset_z)}
        frappe.db.set_value("BIM Model", model_name, "coordinate_offset", json.dumps(offset))
        frappe.db.commit()

        return {
            "status": "success",
            "model": model_name,
            "offset": offset,
        }

    @frappe.whitelist()
    def approve_project_initiation(project: str) -> Dict[str, Any]:
        """Execute formal Stage-Gate Sign-Off, freeze baseline, and flip status to Open/In Progress."""
        status = get_initiation_status(project)
        readiness = status.get("readiness", {})

        if not readiness.get("all_ready"):
            unmet = [g["name"] for g in readiness.get("gates", []) if not g["passed"]]
            frappe.throw(
                f"Cannot approve initiation: Unmet stage-gate requirements: {', '.join(unmet)}",
                frappe.ValidationError,
            )

        proj = frappe.get_doc("Project", project)
        proj.status = "In Progress" if "In Progress" in [opt.value for opt in proj.meta.get_field("status").options.split("\n") if opt] else "Open"
        proj.custom_overall_progress = 0
        proj.save(ignore_permissions=True)

        frappe.get_doc({
            "doctype": "Comment",
            "comment_type": "Info",
            "reference_doctype": "Project",
            "reference_name": project,
            "content": (
                f"🚀 **Project Initiation Approved & Baselined**<br>"
                f"• Contract Value: PHP {readiness.get('contract_amount', 0):,.2f}<br>"
                f"• BOQ Direct Cost: PHP {readiness.get('estimated_cost', 0):,.2f}<br>"
                f"• Approved by: {frappe.session.user}"
            ),
        }).insert(ignore_permissions=True)

        frappe.db.commit()

        return {
            "status": "success",
            "project": project,
            "new_project_status": proj.status,
            "next_mode": "coordination",
            "message": "Project initiation successfully approved! Transitioned to Coordination Mode.",
        }
