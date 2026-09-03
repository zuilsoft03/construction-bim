# Construction BIM for ERPNext

A native **Frappe/ERPNext app** that turns ERPNext into a construction-project
platform: import and view IFC/BIM models, clash-check and discuss them in a
BCF workflow, take off quantities from PDF and DWG/DXF drawings, run an
OpenProject-style **Project Studio** (work packages, Kanban, Gantt, meetings),
and manage the field/commercial side (contracts, progress claims, RFIs,
daily site reports, permits, safety) — all inside ERPNext, linked to Projects
and ERPNext Items/BOMs.

Built from scratch as a Frappe app. It borrows workflow concepts from common
construction-ERP/BIM tools (OpenProject BIM, BIMcollab/BCF, OpenConstructionERP)
and implements them natively with pure-Python parsing on the backend and
web-ifc (WASM) + three.js rendering in the browser — **no IfcOpenShell, no
external viewers, no cloud service required**.

## What you get

| Area | What you get |
|---|---|
| **IFC / BIM models** | Upload `.ifc` → pure-Python STEP-21 parser creates a `BIM Model` with storeys, disciplines, elements and quantities. Real geometry extracted from IFC4 solids (`IFCEXTRUDEDAREASOLID`/`IFCRECTANGLEPROFILEDEF`) with a GLB writer kept as a data/fallback output. |
| **3D viewer** | `bim-viewer` desk page renders the **original IFC** client-side via web-ifc (WASM) + three.js. Pick any element → its `BIM Element` row; discipline/storey/type filters, viewpoints, measurements. |
| **Clash detection & BCF** | Multi-model clash detection with `BIM Clash` / `BIM Issue` doctypes, threaded comments, status workflow, and **BCF 2.x import/export** (`.bcfzip`) plus BCF topics/viewpoints per project (`BCF Project`, `BCF Topic`, `BCF Comment`, `BCF Viewpoint`, `BCF Component`). ERPNext `Task` updates sync back to BCF topics. |
| **Project Studio** | `project-studio` page — OpenProject-style project hub: project overview, **Work Packages**, **Kanban** board, **Gantt / schedule timeline**, meetings scheduler, project document tree, project **archiving** and **clone-from-template**. |
| **PDF takeoff** | `pdf-takeoff` desk page — scale-calibrated distance / area / polyline measurements saved per PDF file (`PDF Measurement`). |
| **DWG / DXF & CAD** | `dwg-viewer` desk page — DXF parsing engine (pure TS), CAD canvas renderer, measurement tools, CAD issues with comments, sample drawing, BCF export/import. |
| **BOQ → ERPNext Items/BOM** | Element ↔ Item / BOQ links (`BIM BOQ Link`, `BIM Quantity Map`, `BIM Element Group`), and a **BIM → BOM integration engine**: model quantity summary, BOM preview/generation with mapping rules and UOM/Item auto-creation, BOQ traceability links, and `generate_material_request_from_bim`. |
| **Construction management docs** | Native doctypes in the `Construction` module: `Construction Contract` (+BOQ items/milestones), `Progress Claim` (+items), `Variation Order`, `RFI`, `Retainage Log`, `Project Phase` (+gates), and field/safety forms (`Daily Site Report`, `Daily Site Subcontractor Activity`, `Permit to Work`, `Toolbox Talk`, `OSH Incident Report`). |
| **Project initiation** | Ingestion engine: BOQ CSV import with fuzzy column matching + standard template, discipline detection from filenames/IFC types, coordinate-drift evaluation and initiation-readiness scoring. |
| **Agent tools** | Small AI/automation modules (pluggable, local-first): in-viewer conversational copilot, RFI synthesizer, daily site-diary generator, clash filtering/trade clustering. |
| **Workspace** | A `Construction BIM` workspace (`/app/construction`) with quick actions and cards grouping Commercial & Cost Control, Planning & Schedule, Field Operations & Safety, Quality & Equipment, BIM & Coordination. |

## DocType catalog

**BIM module** — `BIM Model`, `BIM Element`, `BIM Element Group` (+`BIM Element
Group Item`), `BIM BOQ Link`, `BIM Quantity Map`, `BIM Viewpoint`, `PDF
Measurement`, `BIM Clash`, `BIM Issue`, `BIM BOM Generator`, `BCF Project`,
`BCF Topic`, `BCF Comment`, `BCF Viewpoint`, `BCF Component`.

**Construction module** — `Construction Contract` (+`BOQ Item`, `Milestone`),
`Progress Claim` (+`Item`), `Variation Order`, `RFI`, `Retainage Log`,
`Project Phase` (+`Gate`), `Daily Site Report`, `Daily Site Subcontractor
Activity`, `Permit to Work`, `Toolbox Talk` (+`Attendee`), `OSH Incident
Report`.

The `modules.txt` also declares `Scheduling` and `Facility` as future module
slots (skeletons — not yet populated).

## Quick start

```bash
bench get-app construction_bim https://github.com/zuilsoft03/construction-bim
bench --site your-site install-app construction_bim
bench --site your-site build --app construction_bim
bench --site your-site migrate
```

Then open **`http://your-site/app/construction`** (the Construction BIM
workspace) or go straight to a page:

- `/app/project-studio` — Project Studio
- `/app/bim-viewer` — 3D BIM viewer (upload an `.ifc`, up to 200 MB; raise
  System Settings → `max_file_size` if needed)
- `/app/dwg-viewer` — DWG / DXF viewer
- `/app/pdf-takeoff` — PDF takeoff

Pages are available to `System Manager`, `Projects Manager` and `Projects
User` by default.

## Layout

```
construction_bim/
├── construction_bim/            # Frappe app package
│   ├── bim/                     # BIM module
│   │   ├── ifc_parser.py        #   pure-Python STEP-21 parser
│   │   ├── ifc_geometry.py      #   real mesh extraction (IFC4 solids)
│   │   ├── glb_writer.py        #   binary glTF (GLB) writer (fallback)
│   │   ├── api.py               #   whitelisted model/element/takeoff API
│   │   ├── bcf/                 #   BCF + Task→topic sync
│   │   ├── doctype/             #   BIM Model/Element/…, BCF *, Clash, Issue
│   │   └── page/                #   bim-viewer · pdf-takeoff · dwg-viewer · project-studio
│   ├── construction/            # Construction module (contracts, claims, RFI, field/safety docs)
│   ├── construction/workspace/construction/  # "Construction BIM" workspace JSON
│   ├── api/                     # consolidated endpoints: clash, cad, initiation,
│   │                            #   bom_integration, project_studio, 4D coloring
│   ├── agent/                   # copilot · rfi_synthesizer · site_diary · clash_filter
│   ├── public/js/               # vendored three.js, web-ifc (WASM), pdf.js + page bundles
│   └── hooks.py                 # doc_events (Task→BCF), doctype_js (Project), app home
├── frontend_src/                # page app sources + TS CAD/BCF sources
│   └── src/cad/                 #   dxf_parser_engine · cad_canvas_renderer ·
│                                #   cad_measurement_tools · bcf_collaboration_manager
├── scripts/dev_sync.sh          # docker-cp sync + migrate/build for the dev bench
├── test/                        # unit + TDD suites (Python + JS)
├── build.sh                     # esbuild bundle rebuild (viewer/takeoff pages)
├── pyproject.toml
├── LICENSE                      # AGPL-3.0
└── NOTICE                       # third-party licenses (web-ifc MPL-2.0, three.js MIT, pdf.js Apache-2.0)
```

## Architecture notes

- **Viewing truth is the IFC file itself.** The viewer fetches the model's
  `original_file` IFC, opens it in the browser with `WebIFC.IfcAPI` and builds
  the three.js scene client-side (no per-model GLB dependency for viewing).
- **Element data truth is the DB.** The Python parser populates `BIM Element`
  rows (with `ifc_id` ↔ web-ifc `expressID`) at import; picking in the viewer
  maps straight to those rows.
- **Backend stays pure-Python** for parsing/geometry so logic is unit-testable
  on the host without a Frappe runtime; only DB-coupled code imports Frappe.
- **Frontend bundles** are built from `frontend_src/` with esbuild. Do not
  minify the web-ifc bundles (Emscripten wasm glue breaks). `scripts/dev_sync.sh`
  copies the app into Docker containers, runs migrate/build and restarts.
- **BCF round-trip**: clash/issues can be exported to `.bcfzip` and imported
  back; ERPNext `Task` updates are synced to BCF topics via a `doc_events`
  hook.

## Development

- Host unit tests (pure logic, no Frappe): `python -m unittest discover -s test -p 'test_*.py' -v`
- DB-coupled / integration suites run in the bench container via
  `bench --site <site> run-tests --app construction_bim`.
- Frontend behavior suites live in `test/` (`.js` TDD suites driven in a
  browser context).

## License

**AGPL-3.0** — see `LICENSE`. Original application code © Gaviel.

Bundled third-party code (see `NOTICE`): three.js (MIT), web-ifc (MPL-2.0),
pdf.js (Apache-2.0), esbuild (MIT). The BIM4LCA test assets from Nordic
Sustainable Construction are CC BY-SA 4.0 (design: Huvila Oy).
