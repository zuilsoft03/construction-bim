# Construction BIM for ERPNext

A native **Frappe/ERPNext app** that brings IFC/BIM models into ERPNext:

- **IFC import** — pure-Python STEP-21 parser (no IfcOpenShell / no external tools).
- **Real geometry** — reconstructs actual element meshes from IFC4
  `IFCEXTRUDEDAREASOLID` / `IFCRECTANGLEPROFILEDEF` profiles and writes a
  binary glTF (GLB) the browser can load with three.js.
- **3D BIM Viewer** desk page (`/desk/bim-viewer`, module **BIM**) — model list,
  discipline/storey/type filters, element picking, viewpoints, BOQ linking.
- **PDF Takeoff** desk page (`/desk/pdf-takeoff`) — scale-calibrated distance /
  area / polyline measurements saved per PDF file.

The design follows common construction-ERP BIM concepts — BIM model hub,
per-element properties and quantities, 3D viewer, PDF takeoff — implemented
natively as a Frappe/ERPNext app. Where basic text fallbacks emit box
placeholders for geometry, this app extracts the real vertices from the IFC
file itself, so an imported model looks like the actual building.

## Quick start

```bash
bench get-app construction_bim https://github.com/zuilsoft03/construction-bim
bench --site your-site install-app construction_bim
bench build --app construction_bim
```

Then open `http://your-site/desk/bim-viewer` and upload an `.ifc` file
(up to 200 MB; also set System Settings → `max_file_size`).

## Features

| Area | What you get |
|---|---|
| Model | IFC → BIM Model doc (storeys, disciplines, element count), one GLB per model |
| Elements | Per-element properties / quantities / placements (BIM Element child docs) |
| Viewer | three.js scene, orbit/select/measure/clip, discipline colors, viewpoints |
| BOQ | Element ↔ Item / BOQ-item links, quantity maps (bulk link by rule) |
| Takeoff | PDF measurements (distance/area/polyline) with per-page scale calibration |

## Layout

```
construction_bim/
├── bim/
│   ├── ifc_parser.py     # STEP-21 text parser → elements/quantities/placements
│   ├── ifc_geometry.py   # real mesh extraction (extruded + rectangle solids)
│   ├── glb_writer.py     # binary glTF (GLB) writer, per-node meshes
│   └── api.py            # @frappe.whitelist API (model/element/BOQ/takeoff)
├── bim/page/
│   ├── bim_viewer/       # desk page: 3D BIM viewer
│   └── pdf_takeoff/      # desk page: PDF takeoff
└── public/js/three/      # vendored three.js + GLTFLoader (r16x)
```

## License

**AGPL-3.0.** Bundled third-party code: three.js (MIT), web-ifc (MPL-2.0),
pdf.js (Apache-2.0) — see `NOTICE`. The NordicLCA test assets are CC BY-SA 4.0
(Nordic Sustainable Construction).
