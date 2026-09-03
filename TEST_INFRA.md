# E2E Test Infra: construction_bim Enhancements

## Test Philosophy
- Opaque-box, requirement-driven testing based on `ORIGINAL_REQUEST.md`.
- Systematic 4-tier design:
  - **Tier 1: Feature Coverage (>=5 per feature)** — Representative happy-path verification of isolated features.
  - **Tier 2: Boundary & Corner Cases (>=5 per feature)** — Edge cases, zero/negative quantities, missing properties, malformed IFCs, sub-millimeter tolerances.
  - **Tier 3: Cross-Feature Combinations (pairwise)** — Multi-discipline loading combined with clash detection, clash persistence with camera fly-to, clash comments with BOM generation.
  - **Tier 4: Real-World Application Scenarios** — Full end-to-end workflow on Nordic LCA Housing Concrete & HVAC datasets.
  - **Tier 5: Adversarial Coverage Hardening** — White-box coverage analysis, mutation tests, and stress testing.

## Feature Inventory & Test Coverage
| # | Feature | Requirement | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|-------------|:------:|:------:|:------:|:------:|
| 1 | Multi-IFC Model Loading | R1: ARK + STRUC + HVAC loaded into Three.js with 0 coordinate drift | 5 | 5 | ✓ | ✓ |
| 2 | MEP Entity Geometry Rendering | R1: IFCDUCT*, IFCPIPE*, IFCAIRTERMINAL geometry parsed | 5 | 5 | ✓ | ✓ |
| 3 | Discipline Controls & Ghosting | R1: Independent visibility and opacity/ghosting per discipline | 5 | 5 | ✓ | ✓ |
| 4 | Element Property Inspector | R1: Click raycasting returns source model, GUID, properties, Qto_* | 5 | 5 | ✓ | ✓ |
| 5 | In-Viewer BVH Clash Detection | R2: Fast client-side collision detection on STRUC vs HVAC | 5 | 5 | ✓ | ✓ |
| 6 | 3D Visual Clash Highlighting | R2: Red/Yellow element colors, centroid markers, bounding boxes | 5 | 5 | ✓ | ✓ |
| 7 | Clash Serialization & BCF Viewpoints | R2: Collision centroid coordinates, penetration depth, BCF JSON | 5 | 5 | ✓ | ✓ |
| 8 | OpenProject BIM Clash DocType | R3: Native ERPNext DocType with collision pairs, severity, status | 5 | 5 | ✓ | ✓ |
| 9 | Viewer Clashes Panel & Fly-to | R3: List clashes, 1-click smooth camera fly-to, isolate elements | 5 | 5 | ✓ | ✓ |
| 10 | Threaded Discussion on Clashes | R3: Frappe Comment & ToDo child records direct from viewer | 5 | 5 | ✓ | ✓ |
| 11 | BIM Quantity Rollup | R4: Extract concrete volumes, pipe lengths, steel weights | 5 | 5 | ✓ | ✓ |
| 12 | Automated BOM Generator Wizard | R4: Map IFC elements to ERPNext Items & generate/update BOM | 5 | 5 | ✓ | ✓ |
| 13 | Interactive 3D BOM Highlighting | R4: Cross-highlight BOM wizard line items in 3D scene | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runners**:
  1. Python Unittest Runner: `python -m unittest discover test`
  2. Integration Runner: `python test/e2e_full_suite.py`
  3. In-Container Bench Runner: `bench --site site1.local run-tests --app construction_bim`
- **Pass/Fail Semantics**: Exit code 0, 100% assertions passing.
- **Test Datasets**:
  - `STRUCTURAL/IFC/NordicLCA_Housing_Concrete_STRUC.ifc` (8.5 MB Tekla)
  - `HVAC/IFC/NordicLCA_Housing_Concrete_HVAC.ifc` (91.5 MB MagiCAD)
  - `NordicLCA_Housing_Concrete_ARK.ifc` (76.5 MB Revit)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Multi-Discipline Federated Inspection | F1, F2, F3, F4 (Load ARK, STRUC, HVAC; ghost ARK shell; inspect structural columns and HVAC ducts) | High |
| 2 | STRUC vs HVAC In-Viewer Clash Detection & Highlighting | F5, F6, F7 (Run BVH clash check; verify physical collisions detected; verify Red/Yellow highlight & centroid markers) | High |
| 3 | Clash Issue Management & Threaded Discussion Workflow | F8, F9, F10 (Save clash to ERPNext BIM Clash DocType; test camera fly-to; post threaded discussion comment; assign ToDo) | High |
| 4 | Automated BIM Quantity Takeoff & BOM Generation | F11, F12, F13 (Run quantity rollup on STRUC & HVAC; map concrete and ductwork to ERPNext Items; generate BOM; verify rolled-up unit costs) | High |
| 5 | Full End-to-End Coordination Lifecycle | F1 -> F13 (Full lifecycle from multi-IFC load -> clash detection -> issue discussion -> resolution -> BOM generation) | Very High |

## Coverage Thresholds
- Tier 1: 13 features * 5 = 65 test cases
- Tier 2: 13 features * 5 = 65 test cases
- Tier 3: 13 pairwise cross-feature tests
- Tier 4: 5 realistic application scenarios
- **Total Minimum Target**: 148 test cases across unit, integration, and E2E suites.
