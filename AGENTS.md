# AGENTS.md

You are a principal-level engineer working on **construction_bim** — a native
Frappe/ERPNext app (AGPL-3.0) that brings construction BIM workflows into
ERPNext: IFC model import, in-browser 3D viewer (web-ifc WASM), BIM elements
with properties/quantities, BOQ linking, PDF takeoff, and (in progress) a
Construction workspace, Project integration, Drive scaffolding, DWG takeoff,
material takeoffs, scheduling, and 7D handover.

## 1. Mission

Let construction professionals import, view, and quantity-takeoff IFC/BIM and
PDF models entirely inside ERPNext, with per-element data linked to Items,
BOQs, projects, and documents. The primary user outcome: click a wall in the
3D viewer and see its ERPNext element row, quantities, and BOQ links — then
use those data for cost, schedule, and handover work.

## 2. Operating Rules

1. Read this file before making changes.
2. Read applicable nested instructions and skills (`vibe-engineering`,
   `erpnext-dev`, `erpnext-custom-doctypes`).
3. Inspect the real repository before editing. Never invent repository facts.
4. Preserve existing conventions unless the approved task changes them.
5. Ask only blocking clarification questions.
6. Draft/update an implementation prompt (`.hermes/plans/`) before non-trivial
   code changes; obtain approval unless the user already authorized scope.
7. Implement only approved scope.
8. Verify the result, report evidence, and state remaining risks/limitations.
9. Never fabricate: geometry, DB rows, render results, or test outputs.
10. Never commit secrets (passwords, tokens, API keys) into the repo.

## 3. Product Scope

### In Scope
- IFC STEP-21 import: pure-Python parser (no IfcOpenShell) + real-geometry
  extraction (IFCEXTRUDEDAREASOLID / IFCRECTANGLEPROFILEDEF profiles) + GLB
  writer (kept as fallback output).
- In-browser 3D BIM Viewer desk page (`/desk/bim-viewer`): web-ifc (WASM)
  renders the **original IFC file** fetched client-side; picking maps web-ifc
  `expressID` → BIM Element row via parser `ifc_id`.
- BIM doctypes: BIM Model, BIM Element, BIM Element Group (+Item), BIM BOQ
  Link, BIM Quantity Map, BIM Viewpoint, PDF Measurement.
- PDF Takeoff desk page (`/desk/pdf-takeoff`): scale-calibrated distance /
  area / polyline measurements.
- Construction workspace + Project form integration (custom fields,
  buttons); Drive folder scaffold + file routing (P2+).
- DWG (DXF) drawing/takeoff pipeline, Material Takeoff, CPM scheduling,
  project console, 7D handover (planned phases P3–P7).

### Out of Scope
- Native `.dwg` parsing without an ODA File Converter installation (DXF
  only; document the upgrade path).
- IfcOpenShell / DDC binaries on the backend (web-ifc runs client-side WASM).
- Re-importing the 63 DB-level "Custom" construction kit doctypes as app
  files (they stay DB-level; the app *integrates* them).
- Closed OCEP `cad2data` binary and OCEP-trademarked lineage references —
  the port is described as original code with feature inspiration only.
- AI features are pluggable/local-first (Ollama or OpenAI-compatible);
  fail soft and audit to AI Log. Never store keys in code.

Do not add functionality merely because it appears useful.

## 4. Architecture

### System Boundary
Frappe app `construction_bim` inside the ERPNext bench (installed apps:
frappe, erpnext, drive 0.3.0, insights, helpdesk, builder, lending, gameplan,
crm, telephony, construction_bim). Site: `local.dev` in Docker (compose
project `erpnext-full`), served at `http://localhost:8000` with Host header
`local.dev`.

### Request/Data Flow
1. Desk page JS (page script) loads engine globals:
   `webifc-api-iife.js` (→ `window.WebIFC`) then `webifc.bundle.js`
   (→ `window.IFCEngine` = {THREE, WebIFC, buildIfcScene, OrbitControls}),
   then the thin app bundle (`bim_viewer.bundle.js` / `pdf_takeoff.bundle.js`).
2. App calls whitelisted `construction_bim.bim.api.*` methods
   (`frappe.call`) for model/element/BOQ/viewpoint/measurement data.
3. Geometry: app fetches the model's `original_file` IFC URL, opens it with
   `WebIFC.IfcAPI` (`SetWasmPath('/assets/construction_bim/js/webifc/', true)`),
   calls `IFCEngine.buildIfcScene(api, modelID)` → THREE.Group of meshes with
   `expressID` attributes; picking → element row lookup.
4. Upload flow: `upload_file` (Frappe core) → `create_model_from_ifc`
   (server parses IFC in Python → BIM Model + BIM Elements + GLB file).

### Source of Truth
- **IFC geometry truth**: the original IFC file (`original_file` File row on
  BIM Model), parsed client-side by web-ifc for viewing. The server-side
  Python extractor (`ifc_geometry.py` + GLB writer) is a data/fallback output
  — the viewer no longer depends on the GLB.
- **Element data truth**: BIM Element rows in the DB (populated by the Python
  parser at import; `ifc_id` links to web-ifc expressID).
- **Files truth**: Frappe `File` rows (Drive 0.3.0 stores folders as File
  rows with `is_folder=1`, `team`, `folder` parent).
- **Device build truth**: host folder `C:\Users\gavie\ERP\construction_bim`;
  containers get copies via `scripts/dev_sync.sh` (docker cp). Container
  edits are ephemeral — never edit in-container as the primary change.

### Client/Server Boundary
- Client may: fetch public IFC/GLB/PDF assets (same-origin), call whitelisted
  `bim.api.*`, upload files.
- Client must NOT trust: authorization (server enforces), quantity math that
  affects money (server recomputes), IFC parse correctness for data entry.
- Server-only: `create_model_from_ifc`, patches, hooks, file routing.

## 5. Technology

### Required
- **Frappe/ERPNext v17-dev** (bench 5.31.x, Docker): the runtime platform.
- **web-ifc 0.0.77 (MPL-2.0)** via `webifc-api-iife.js`: wasm IFC engine.
- **three.js 0.149.0 (MIT)**: 3D scene (bundled via `entry2.js`).
- **pdf.js 4.10.38 (Apache-2.0)**: PDF takeoff rendering.
- **esbuild**: bundles (keep `minify: false` for web-ifc-containing bundles —
  minifying breaks Emscripten wasm glue).

### Existing Project Conventions
- Desk pages: `bim_viewer` / `pdf_takeoff` under `bim/page/<name>/`
  (`<name>.json` + `<name>.py` + `<name>.js` is the page controller +
  `<name>.html` template). Page JS loads engine scripts then imports the app
  bundle with a cache-busting `?v=Date.now()`.
- Bundles: `frontend_src/<page>_app.js` → esbuild → `public/js/<page>.bundle.js`.
  Engine bundle from `frontend_src/webifc_build/entry2.js` via `build2.js`;
  app bundle via `build_app.js` (IIFE, thin, reads `window.IFCEngine`).
  The checked-in `build.sh` predates the web-ifc engine split and uses
  `--minify` — **do not use it** for engine/app bundles; use
  `frontend_src/webifc_build/build2.js` + `build_app.js` (or the newer
  `scripts/dev_sync.sh` asset pipeline).
- Frontend builds require node from nvm: `PATH=/home/frappe/.nvm/versions/node/v24.12.0/bin:$PATH`
  inside containers; on host use `frontend_src/webifc_build/node_modules/.bin/esbuild`.
- Python: pure-parse modules keep `frappe` OUT (host-testable) with an
  injectable adapter; DB-coupled logic lives in `api.py` / hooks / patches.
- Patches: `construction_bim/patches/v1_project_construction_fields.py`
  (idempotent; registered in `patches.txt`).
- Workspaces: `<app>/<app>/<module>/workspace/<name>/<name>.json`; run
  `frappe.model.sync.sync_for('construction_bim')` to import them.

### Prohibited / Avoid
- Adding IfcOpenShell or DDC binaries as backend deps.
- Bundling `web-ifc`/`three` inside the app bundle (avoid dual THREE
  instances) — load engine globals once via page script.
- esbuild `minify` on engine/bim bundles (breaks web-ifc glue).
- Re-importing the kit's Custom doctypes into app JSON.
- Committing built bundles is NOT required (`build.sh`/`build2.js`
  regenerate); node_modules is gitignored.

## 6. Data Model and Invariants

### BIM Model (parent)
- `name` (naming series `BIM-MODEL-{YYYY}-{#####}`), `project` (Link),
  `model_name`, `discipline` (Select: Architecture/Structural/MEP/Civil/
  Interior/Landscape/Other), `model_format`, `version`,
  `status` (Select: Processing/Ready/Failed — Ready only after parse
  succeeds), `element_count`, `storey_count`, `bounding_box`, `parent_model`,
  `original_file` (File URL — critical for viewer), `geometry_file`,
  `error_message`, `metadata`.
- Invariant: an import writes `BIM Model` + its `BIM Element` rows + GLB in
  one server call (`create_model_from_ifc`); `status=Ready` only after parse
  succeeds.

### BIM Element (child of model)
- Fields include: `model`, `name`, `mesh_ref` (`e<ifc_id>`), `stable_id`
  (IFC GlobalId), `ifc_id` (IFC entity id — == web-ifc expressID),
  `element_type`, `discipline`, `storey`, `space`, `properties` (JSON),
  `quantities` (JSON), `geometry` info.
- Invariant: `ifc_id` is the single key linking web-ifc picking ↔ ERPNext row.

### BIM BOQ Link
- `bim_element` (Link BIM Element), `boq_reference_type`
  (Item / Construction Contract BOQ Item), `boq_reference_name`.
- Duplicate guard on (element, type, name).

### BIM Quantity Map
- Rule-based bulk linking: maps element properties to Item / quantity keys;
  `apply_quantity_map(quantity_map, model)` creates BOQ links en masse.

### PDF Measurement
- `pdf_file` (File URL), `page_no`, `measurement_type` (Distance/Area/
  Polyline), `value`, `unit`, `scale`, `points` (JSON).

### Construction (new module)
- `drive_tree.py` pure core: DEFAULT_TREE (00_Admin … 09_Handover),
  `build_tree(fs, project_name)` — idempotent, `fs.exists_folder` /
  `fs.create_folder` injectable. Unit tests in `test/test_drive_tree.py`.
- Project custom fields (via patch): `custom_drive_folder` (File Link),
  `custom_overall_progress`, `custom_start_date`, `custom_target_completion`,
  `custom_contract_amount` (PHP), `custom_boq_source`.

## 7. API / Interface Contracts

All whitelisted in `construction_bim/bim/api.py` (called via `frappe.call`):

| Method | Params | Returns |
|---|---|---|
| `create_model_from_ifc` | file_url, file_name, model_name, discipline, project? | model dict |
| `list_models` | project? | [model dict] |
| `get_model` | model | model dict (incl. original_file) |
| `get_geometry` | model | GLB info dict |
| `list_elements` | model, filters (JSON string), limit | {elements, facets, total} |
| `get_element` | element | element dict |
| `create_boq_link` | bim_element, boq_reference_type, boq_reference_name | link dict |
| `delete_boq_link` | link | {ok} |
| `list_boq_links` | model?, bim_element? | [link dict] |
| `apply_quantity_map` | quantity_map, model | {created, ok} |
| `save_viewpoint` | model, viewpoint_name, camera | viewpoint dict |
| `list_viewpoints` | model | [viewpoint dict] |
| `delete_viewpoint` | viewpoint | {ok} |
| `save_measurement` | pdf_file, page_no, measurement_type, value, unit, scale, points? | measurement dict |
| `list_measurements` | pdf_file | [measurement dict] |
| `delete_measurement` | measurement | {ok} |

Errors: `frappe.throw` (ValidationError) for bad input; PermissionError for
unauthorized access. Client never blindly trusts returned quantities.

## 8. Security

- Server-only secrets: none stored in repo. Administrator password and
  GitHub PAT are NEVER committed (test scripts containing them were removed
  and must not be re-added).
- Authorization rules: desk pages gated by page roles (System Manager /
  Projects Manager / Projects User); server methods use `@frappe.whitelist`
  with default role checks; drive/file operations use Frappe permissions.
- Sensitive operations: import/upload (server-side parse, size limits),
  Drive folder creation under the acting user's team.
- Client-exposed config: only asset URLs and public file URLs.
- Never log secrets; never echo passwords into code or notes.

## 9. Code Standards

- Follow existing Frappe conventions (whitelist methods, doc JSON schema,
  patches in `patches.txt`, hooks in `hooks.py`).
- Preserve type safety (`from __future__ import annotations`, explicit
  types on public functions).
- Prefer small, cohesive functions; keep pure logic (parsers, engines,
  tree builder) free of `frappe` imports for host testing.
- Validate external/untrusted input (IFC file content, file URLs, filters
  JSON) at trust boundaries.
- Do not perform unrelated refactors; minimal complete change per task.

## 10. Dependency Policy

- Backend: stdlib only for parsing (no new deps unless approved —
  `ezdxf` is planned for DWG in P3; add via `pyproject.toml`
  optional-dependencies `dwg = ["ezdxf>=1.3"]`).
- Frontend: web-ifc, three, pdfjs, esbuild already vendored/bundled; use
  existing copies. Do not silently add libraries for trivial utilities.

## 11. Database and Migration Safety

- Schema changes: add doctype JSON under the module, then `bench migrate`;
  run `frappe.model.sync.sync_for('construction_bim')` when workspaces or
  new modules don't materialize.
- Custom Field patches must be idempotent (check `frappe.get_meta` fields
  before insert; `ignore_duplicate`).
- Never delete/rewrite production data; keep backwards compatibility.
- `migrate` needs nvm node on PATH for `bench build`; `docker cp` files land
  as root — chown to `frappe:frappe` before building (see dev_sync.sh).

## 12. Testing and Verification

- Host unit tests: `cd C:\Users\gavie\ERP\construction_bim && python -m
  unittest discover -s test -p 'test_*.py' -v` (currently
  `test/test_drive_tree.py` — pure, no frappe).
- In-container: `bench --site local.dev run-tests --app construction_bim`
  (DB-coupled tests when added).
- Live smoke via authenticated HTTP/desk:
  - assets: `curl -H "Host: local.dev" http://localhost:8000/assets/construction_bim/js/webifc.bundle.js`
    → 200; wasm begins `0061 736d` (`\0asm`).
  - desk page `/app/bim-viewer` loads model list; model select → 3D building
    is visible (visual check).
- Page script is cached by the desk in localStorage unless
  `developer_mode=1` — set on `local.dev`; after JS changes hard-refresh
  (Ctrl+F5) or clear site localStorage.
- A command that does not exist must not be invented as a required check;
  use the real ones above.

## 13. Git Safety

- Repo root: `C:\Users\gavie\ERP\construction_bim`, remote
  https://github.com/zuilsoft03/construction-bim (public, AGPL-3.0).
- `verification.md` not tracked; `.hermes/plans/` gitignored.
- Commit per meaningful change with clear message; push only when user asks.
- Do not reset/checkout/clean user work. `test/real/` large IFCs/GLBs are
  gitignored (commit only small fixtures or none).
- Never commit: `~/.git-credentials`, password files, temp scripts that
  contain credentials (`test/*.py` with `pwd=` — delete before commit).

## 14. Fallback and Ambiguity

1. Preserve existing behavior.
2. Prefer the least risky, least surprising implementation.
3. Record non-blocking assumptions in the implementation prompt.
4. Ask the user when the decision materially affects requirements,
   security, data integrity, cost, or architecture.
