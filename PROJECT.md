# Project: OpenProject BIM Architectural Study & ERPNext construction_bim Blueprint

## Architecture
Comprehensive architectural study and technical blueprint comparing OpenProject BIM edition pipelines with ERPNext `construction_bim`, establishing technical specifications, Frappe DocTypes, BCF-XML / BCF-API REST contracts, 3D camera coordinate math, and client-side viewer event protocols.

```
+---------------------------------------------------------------------------------------------------+
|                                      BIM ARCHITECTURE BLUEPRINT                                   |
+---------------------------------------------------------------------------------------------------+
|  OpenProject BIM Architecture (xeokit, BCF REST/XML, Rails Work Packages, .xkt conversion)       |
|                                                vs                                                 |
|  ERPNext construction_bim (Frappe DocTypes, Three.js / web-ifc WASM, Pure Python IFC, BOQ/BOM)   |
+---------------------------------------------------------------------------------------------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                             |                             |
                   v                             v                             v
     [Pipeline Deep Analysis]         [Comparative Gap Matrix]       [Technical Blueprints]
     - IFC Ingestion & Conversion     - Format & Geometry Support    - Frappe DocType Schemas
     - BCF-XML 2.1/3.0 & REST API     - Viewer & Performance         - Python BCF-API Contracts
     - 3D Viewer & Camera Math        - Collaboration & PM Sync      - BCF-XML Import/Export
     - Work Package Sync              - 4-Phase Roadmap              - Viewer Event Protocol
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Deep Analysis: IFC Ingestion Pipeline | Storage, xeokit-convert/.xkt, web-ifc, spatial decomposition tree, property sets, revisions | M1 | Survey |
| 2 | Deep Analysis: BCF Collaboration Pipeline | BCF-XML 2.1/3.0 zip archives, schemas, BCF REST API v2.1/v3.0 endpoints, authentication, threading | M1 | Survey |
| 3 | Deep Analysis: 3D Viewer Integration | xeokit-sdk vs Three.js, GPU picking, camera projection math (FOV/ortho scale), clipping planes, ghosting | M1 | Survey |
| 4 | Deep Analysis: Work Package Sync | 1:1 BCF Topic to Work Package mapping, bidirectional sync, status/priority mapping, audit trails | M1 | Survey |
| 5 | Gap Analysis: Format & Geometry | Pure Python STEP-21 vs xeokit/web-ifc, extruded prisms vs CSG booleans/Breps, GLB vs .xkt | M2 | Survey |
| 6 | Gap Analysis: Viewer & Performance | Single-model vs Multi-model federation, GPU memory lifecycle, client WASM vs server preprocessing | M2 | Survey |
| 7 | Gap Analysis: Collaboration & PM | Current Viewpoints vs full BCF standard, BOQ linking vs automated BOM generation, Clash detection | M2 | Survey |
| 8 | Strategic Roadmap & Phasing | Prioritized 4-phase implementation plan for ERPNext `construction_bim` | M2 | Survey |
| 9 | DocType Blueprints: BCF Core | Complete JSON schemas for BCF Project, BCF Topic, BCF Viewpoint, BCF Comment, BCF Component | M3 | Survey |
| 10 | DocType Blueprints: BIM Clash | Complete JSON schema for BIM Clash linking colliding elements, spatial metrics, topic, viewpoint | M3 | Survey |
| 11 | API Contracts: BCF REST API | Whitelisted Frappe endpoints matching buildingSMART BCF-API Foundation specification | M3 | Survey |
| 12 | API Contracts: BCF-XML ZIP Handler | Python controller for lossless BCF-XML v2.1/v3.0 import and export with snapshot management | M3 | Survey |
| 13 | 3D Camera Math & Coordinate Conversion | Exact basis transformations (Three.js Y-up $\leftrightarrow$ BCF Z-up), FOV trigonometry, OrbitControls target reconstruction | M3 | Survey |
| 14 | Client-Side Viewer Event Protocol | Standardized JSON event message contracts between WebGL viewer and Frappe Desk UI | M3 | Survey |
| 15 | Master Documentation Index & Synthesis | Complete, publication-quality documentation suite in `docs/study/openproject_bim/` | M4 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Deep Architectural Analysis (R1) | Author `01_openproject_bim_architecture.md` covering all 4 OpenProject pipelines with detailed diagrams and code deconstructions | None | DONE |
| M2 | Comparative Gap Analysis & Roadmap (R2) | Author `02_construction_bim_gap_analysis.md` with comprehensive evaluation matrix and 4-phase adaptation roadmap | M1 | DONE |
| M3 | Technical Specifications & Implementation Blueprints (R3) | Author `03_technical_specifications_and_schemas.md`, `04_api_contracts_and_bcf_exchange.md`, and `05_viewer_integration_and_camera_math.md` | M1, M2 | DONE |
| M4 | Deliverables Synthesis, Master Index & Final Verification (R4) | Author `README.md`, verify cross-references, diagrams, and execute rigorous Reviewer + Challenger + Auditor verification | M1, M2, M3 | DONE |

## Interface Contracts
### BCF-XML ↔ Frappe DocType Ingestion
- Input: BCF Zip Archive containing `bcf.version`, topic GUID folders with `markup.bcf`, `viewpoint.bcfv`, `snapshot.png`.
- Output: `BCF Project` (parent), `BCF Topic`, `BCF Viewpoint` (with camera matrices & component lists), `BCF Comment`, `File` (snapshots).

### BCF REST API ↔ Frappe Whitelisted Endpoints
- Format: JSON REST payloads adhering to buildingSMART BCF API specification v2.1/v3.0.
- Endpoints: `construction_bim.bcf.api.*` mapped to `/api/method/construction_bim.bcf.api.*`.

### Three.js / Web-IFC ↔ Frappe Desk UI Event Protocol
- Bus: `window.postMessage` or Frappe Event Bus (`frappe.ui.bim.trigger(event, data)`).
- Events: `bim:element_selected`, `bim:viewpoint_captured`, `bim:fly_to_viewpoint`, `bim:clash_isolated`, `bim:pin_created`.

## Code Layout
```
c:\Users\gavie\ERP\construction_bim\
├── docs\
│   └── study\
│       └── openproject_bim\
│           ├── README.md                                # Master Index & Executive Summary
│           ├── 01_openproject_bim_architecture.md        # R1: Deep Pipeline Architectural Analysis
│           ├── 02_construction_bim_gap_analysis.md      # R2: Comparative Gap Analysis & Strategic Roadmap
│           ├── 03_technical_specifications_and_schemas.md# R3.1: DocType Schemas (BCF Core & BIM Clash)
│           ├── 04_api_contracts_and_bcf_exchange.md     # R3.2: Python BCF-API REST & BCF-XML ZIP Handlers
│           └── 05_viewer_integration_and_camera_math.md # R3.3: 3D Camera Math & Viewer Event Protocols
```
