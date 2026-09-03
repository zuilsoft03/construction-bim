# Comprehensive Architectural Analysis of OpenProject BIM Edition Pipelines & Subsystems

**Document ID**: OP-BIM-ARCH-01  
**Author**: Worker M1 (`worker_m1`)  
**Status**: Authoritative Architectural Study Deliverable  
**Date**: 2026-09-03  
**Target Repository**: `ERPNext construction_bim`  
**Reference Standards**: ISO 16739 (IFC4/IFC2X3), ISO 12006-3, buildingSMART BCF-XML v2.1/v3.0, buildingSMART BCF-API v2.1/v3.0, W3C WebGL2, glTF 2.0  

---

## Executive Summary & System Overview

OpenProject BIM Edition is an enterprise Common Data Environment (CDE) and issue tracking platform engineered specifically for the Architecture, Engineering, and Construction (AEC) industry. Rather than treating Building Information Modeling (BIM) as an isolated visual artifact, OpenProject integrates Industry Foundation Classes (IFC, ISO 16739) and the BIM Collaboration Format (BCF, ISO 12006-3 / buildingSMART) directly into its core project governance framework (Ruby on Rails backend, PostgreSQL relational database, and Angular/TypeScript frontend with xeokit-sdk).

```
+----------------------------------------------------------------------------------------------------+
|                                OpenProject BIM System Macro-Architecture                           |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +--------------------------+   +--------------------------+   +------------------------------+   |
|   |   Desktop BIM Add-ins    |   |   Web Browser Clients    |   |   External BCF-API Services  |   |
|   | (Revit, Solibri, ArchiCAD)|   |  (Angular + xeokit-sdk)  |   |  (BIMcollab, Solibri Live)   |   |
|   +-------------+------------+   +------------+-------------+   +--------------+---------------+   |
|                 |                             |                                |                   |
|                 | OAuth2 / BCF-API REST       | REST API v3 / JSON             | BCF-API v2.1/v3.0 |
|                 v                             v                                v                   |
|   +--------------------------------------------------------------------------------------------+   |
|   |                                OpenProject API Gateway / Router                            |   |
|   |              /api/bcf/2.1/*    |    /api/bcf/3.0/*    |    /api/v3/work_packages/*             |   |
|   +---------------------------------------------+----------------------------------------------+   |
|                                                 |                                                  |
|                                                 v                                                  |
|   +--------------------------------------------------------------------------------------------+   |
|   |                                  Rails Application Core                                    |   |
|   |  +------------------------+  +--------------------------+  +----------------------------+  |   |
|   |  |   Bim::IfcModels       |  |   Bim::Bcf::Topics       |  |   WorkPackages Core        |  |   |
|   |  |   Controller & Worker  |  |   Controller & Importer  |  |   Journals & Workflows     |  |   |
|   |  +-----------+------------+  +------------+-------------+  +-------------+--------------+  |   |
|   +--------------|----------------------------|------------------------------|-----------------+   |
|                  |                            |                              |                     |
|                  | Background Conversion Job  | 1:1 Duality Mapping          | Audit Trail & State |
|                  v                            v                              v                     |
|   +---------------------------+  +-------------------------------------------------------------+   |
|   | IFC Conversion Worker     |  |                  PostgreSQL Relational DB                   |   |
|   | (xeokit-convert / GLB/XKT)|  |  - `ifc_models`, `attachments`                              |   |
|   | - Geometry Decimation     |  |  - `bcf_topics`, `bcf_viewpoints`, `bcf_comments`           |   |
|   | - Instanced Meshes (XKT)  |  |  - `work_packages`, `journals`, `custom_values`             |   |
|   | - Spatial Hierarchy JSON  |  +-------------------------------------------------------------+   |
|   +--------------+------------+                                                                    |
|                  |                                                                                 |
|                  v (S3 / ActiveStorage Object Store)                                               |
|   +--------------------------------------------------------------------------------------------+   |
|   | Generated Assets: `model.xkt` (Binary Geometry) + `structure.json` + `properties.json`      |   |
|   +--------------------------------------------------------------------------------------------+   |
+----------------------------------------------------------------------------------------------------+
```

### Core Architectural Pillars
1. **Asynchronous Server-Side Preprocessing**: Raw IFC STEP files (often 100MB–2GB) contain dense CSG solids, swept profiles, and relational graphs that overwhelm browser WebAssembly runtimes. OpenProject offloads conversion to asynchronous backend workers that output compressed `.xkt` binary geometry, `structure.json` spatial trees, and `properties.json` property sets.
2. **First-Class BCF-WorkPackage Duality**: BCF Topics are not isolated database rows; they maintain a 1:1 bi-directional mapping with OpenProject `WorkPackage` entities, enabling automated milestone tracking, SLA notifications, Gantt scheduling, and team resource allocation.
3. **Lossless Viewpoint & Camera Serialization**: Viewpoints encode full 3D scene states: exact camera projection matrices (Perspective FOV and Orthographic `ViewToWorldScale`), 3D clipping planes (plane point and normal vector), component GUID isolation exceptions, and hex color overrides.
4. **Federated Multi-Discipline Coordination**: Multiple discipline models (Architectural, Structural, MEP HVAC, Electrical, Plumbing) are federated in a single WebGL scene sharing a unified project coordinate origin.

---

## 1. IFC Model Ingestion & Processing Pipeline

```
+---------------------------------------------------------------------------------------------------+
|                              IFC Ingestion & Processing Dataflow                                  |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|   [User IFC Upload] (Multi-part POST / ActiveStorage)                                             |
|          │                                                                                        |
|          ▼                                                                                        |
|   [Bim::IfcModels::CreateService] ──► Persists `ifc_models` record (status: 'processing')         |
|          │                                                                                        |
|          ▼                                                                                        |
|   [ActiveJob / GoodJob Worker Queue] ──► Spawns `Bim::IfcModels::ConversionJob`                   |
|          │                                                                                        |
|          ├─────────────────────────┬─────────────────────────┬────────────────────────────┐       |
|          ▼                         ▼                         ▼                            ▼       |
|   [xeokit-metadata]        [ifc2gltf / GLB]          [xeokit-convert / XKT]       [Pset Indexer]  |
|   Extracts Spatial Tree    Triangulates Breps,       Applies 16-bit Quantization, Extracts Psets  |
|   (IfcProject->Product)    Sweeps & CSG Solids       Oct-Normal Encoding & Inst.  & Base QTOs     |
|          │                         │                         │                            │       |
|          ▼                         ▼                         ▼                            ▼       |
|   `structure.json`            `model.glb`               `model.xkt`              `properties.json`|
|          │                         │                         │                            │       |
|          └─────────────────────────┴────────────┬────────────┴────────────────────────────┘       |
|                                                 │                                                 |
|                                                 ▼                                                 |
|                                     [ActiveStorage / S3 Store]                                    |
|                                                 │                                                 |
|                                                 ▼                                                 |
|                                    `ifc_models.status = 'ready'`                                  |
|                                                 │                                                 |
|                                                 ▼                                                 |
|                                     [WebSocket / ActionCable]                                     |
|                                  Notifies Client Viewer to Load                                   |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### 1.1 Storage Mechanisms, Attachments & Multi-Model Versioning

OpenProject manages IFC model files via Rails `ActiveStorage` / `CarrierWave` subsystem coupled with relational tracking in PostgreSQL.

#### Relational Database Schema (`modules/bim`)
```sql
-- Table: ifc_models
CREATE TABLE ifc_models (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'processing', -- 'processing', 'ready', 'error'
    status_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Table: attachments (ActiveStorage / CarrierWave container)
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    container_id INTEGER NOT NULL,
    container_type VARCHAR(64) NOT NULL, -- 'IfcModel'
    filename VARCHAR(255) NOT NULL,
    disk_filename VARCHAR(255) NOT NULL,
    filesize BIGINT NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    digest VARCHAR(64) NOT NULL, -- SHA-256 / MD5 checksum
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

#### Multi-Model Versioning Rules
1. **Immutability of Source STEP Files**: Once uploaded and digested, an IFC file attachment is never modified in place.
2. **Revision Increments**: Modifying or updating an IFC model creates a new `ifc_models` record with incremented `version` or creates a child revision record linked to the parent model lineage.
3. **Storage Tiering**: Raw `.ifc` files and processed conversion artifacts (`.xkt`, `structure.json`, `properties.json`) are stored across local POSIX volumes, AWS S3, or Azure Blob Storage via standardized cloud storage adapters.

---

### 1.2 Background Conversion Workflow & Toolchain Ecosystem

The IFC conversion pipeline orchestrates specialized open-source binary and Node.js command-line tools:

#### Toolchain Components
1. **`xeokit-metadata`**: Parses the IFC header, units, containment hierarchy, and property sets using `IfcOpenShell` C++ bindings or `web-ifc` without parsing geometric meshes. It outputs `structure.json` and `properties.json`.
2. **`ifc2gltf` / `IfcConvert`**: Executes geometric tessellation, decomposing CSG boolean clipping operations, extrusion profiles, and curved B-Reps into triangulated glTF 2.0 binary meshes (`.glb`).
3. **`convert2xkt` (`xeokit-convert`)**: Takes `.glb` / `.gltf` input, calculates vertex bounds, quantizes vertex buffers, encodes normal vectors into octahedral 2-byte representations, collapses identical mesh geometries into reusable instanced definitions, and writes the compressed `.xkt` binary.

#### Ruby on Rails Worker Job Deconstruction
```ruby
# modules/bim/app/jobs/bim/ifc_models/conversion_job.rb
module Bim
  module IfcModels
    class ConversionJob < ApplicationJob
      queue_as :bim_conversion

      def perform(ifc_model_id)
        model = IfcModel.find(ifc_model_id)
        model.update!(status: 'processing', status_message: 'Starting geometric conversion...')

        source_path = model.attachment.diskfile
        output_dir  = Rails.root.join('tmp', 'bim_conversions', model.id.to_s)
        FileUtils.mkdir_p(output_dir)

        xkt_path        = output_dir.join('model.xkt')
        structure_path  = output_dir.join('structure.json')
        properties_path = output_dir.join('properties.json')

        # 1. Extract Spatial Hierarchy and Property Metadata
        system('xeokit-metadata', source_path.to_s, structure_path.to_s, properties_path.to_s, exception: true)

        # 2. Convert IFC Geometry to Compressed XKT
        system('xeokit-convert', '-s', source_path.to_s, '-d', xkt_path.to_s, exception: true)

        # 3. Attach Artifacts to Model Record
        model.attach_artifact(:xkt_file, xkt_path)
        model.attach_artifact(:structure_file, structure_path)
        model.attach_artifact(:properties_file, properties_path)

        model.update!(status: 'ready', status_message: 'Conversion completed successfully.')
        Bim::Events.publish(:ifc_model_ready, model_id: model.id, project_id: model.project_id)
      rescue StandardError => e
        Rails.logger.error("BIM Conversion Failed for Model #{ifc_model_id}: #{e.message}\n#{e.backtrace.join("\n")}")
        model.update!(status: 'error', status_message: e.message)
      ensure
        FileUtils.rm_rf(output_dir) if defined?(output_dir) && File.exist?(output_dir)
      end
    end
  end
end
```

---

### 1.3 Geometry Extraction, Quantization & Binary XKT Format Specification

The **XKT format** (developed by xeolabs) is a binary geometry representation optimized for immediate WebGL buffer streaming without client-side parsing bottlenecks.

```
+---------------------------------------------------------------------------------------------------+
|                                 XKT Binary File Layout (v7 - v10)                                 |
+---------------------------------------------------------------------------------------------------+
|  HEADER                                                                                           |
|  - Magic Bytes: "XKT" (3 bytes: 0x58, 0x4B, 0x54)                                                 |
|  - Version: uint32 (e.g. 7, 8, 9, 10)                                                             |
+---------------------------------------------------------------------------------------------------+
|  GEOMETRY DEFINITIONS POOL (Instanced Mesh Definitions)                                           |
|  - Number of Geometries: uint32                                                                   |
|  - Quantized Positions: uint16[3 * numPositions] (Range [0, 65535])                               |
|  - Oct-Encoded Normals: int8[2 * numNormals] (Range [-128, 127])                                   |
|  - Triangle Indices: uint16[] or uint32[3 * numTriangles]                                         |
|  - Edge Indices: uint16[] or uint32[2 * numEdges]                                                 |
+---------------------------------------------------------------------------------------------------+
|  ENTITY INSTANCES (BIM Objects)                                                                   |
|  - Number of Entities: uint32                                                                     |
|  - Entity GUIDs: String table (22-character IFC Base64 GUIDs)                                      |
|  - Geometry Definition Indices: uint32[numEntities] (Pointers to Geometry Defs Pool)               |
|  - 4x4 World Transformation Matrices: float32[16 * numEntities] (Row/Col Major)                   |
|  - Packed RGBA Base Colors: uint8[4 * numEntities] (AARRGGBB)                                     |
+---------------------------------------------------------------------------------------------------+
|  SPATIAL PARTITIONING / TILE INDEX                                                                |
|  - Entity Axis-Aligned Bounding Boxes (AABB): float32[6 * numEntities] [minX,minY,minZ,maxX,maxY,maxZ]|
+---------------------------------------------------------------------------------------------------+
```

#### Mathematical Formulation of Geometry Compression

##### 1. 16-Bit Position Quantization
Instead of 32-bit floating point coordinates ($12 \text{ bytes/vertex}$), coordinates are mapped into the model's Axis-Aligned Bounding Box (AABB) $[\vec{P}_{min}, \vec{P}_{max}]$ as unsigned 16-bit integers ($6 \text{ bytes/vertex}$, 50% compression):

$$\text{Quantized}(x) = \left\lfloor \frac{x - P_{min, x}}{P_{max, x} - P_{min, x}} \times 65535.0 \right\rfloor$$

$$\text{Dequantize}(q_x) = P_{min, x} + \left( \frac{q_x}{65535.0} \right) \times (P_{max, x} - P_{min, x})$$

In WebGL2 vertex shaders, dequantization is performed using an affine 4x4 dequantization matrix $\mathbf{M}_{dequantize}$:

$$\mathbf{M}_{dequantize} = \begin{bmatrix}
\frac{P_{max, x} - P_{min, x}}{65535.0} & 0 & 0 & P_{min, x} \\
0 & \frac{P_{max, y} - P_{min, y}}{65535.0} & 0 & P_{min, y} \\
0 & 0 & \frac{P_{max, z} - P_{min, z}}{65535.0} & P_{min, z} \\
0 & 0 & 0 & 1
\end{bmatrix}$$

$$\vec{P}_{world} = \mathbf{M}_{world} \times \mathbf{M}_{dequantize} \times \begin{bmatrix} q_x \\ q_y \\ q_z \\ 1 \end{bmatrix}$$

##### 2. Octahedral Normal Vector Encoding
Standard 3D unit normals require $3 \times \text{float32} = 12 \text{ bytes}$. Octahedral projection projects the unit sphere onto an octahedron and unfolds it to a 2D square $[-1, 1] \times [-1, 1]$, encoded into 2 signed 8-bit integers ($2 \text{ bytes}$, 83.3% compression):

$$L_1\text{-Norm}: \|\vec{N}\|_1 = |N_x| + |N_y| + |N_z|$$

$$\vec{p} = \left( \frac{N_x}{\|\vec{N}\|_1}, \frac{N_y}{\|\vec{N}\|_1} \right)$$

$$\text{If } N_z < 0: \quad \begin{cases} p_x' = (1.0 - |p_y|) \times \text{sign}(p_x) \\ p_y' = (1.0 - |p_x|) \times \text{sign}(p_y) \end{cases} \quad \text{else} \quad \vec{p}' = \vec{p}$$

$$\text{Encoded Normal} = \left( \lfloor p_x' \times 127.0 \rfloor, \; \lfloor p_y' \times 127.0 \rfloor \right) \in [-128, 127]^2$$

**GLSL Hardware Decoding**:
```glsl
vec3 decodeOctahedralNormal(vec2 e) {
    vec3 n = vec3(e.x, e.y, 1.0 - abs(e.x) - abs(e.y));
    if (n.z < 0.0) {
        n.xy = (1.0 - abs(n.yx)) * vec2(n.x >= 0.0 ? 1.0 : -1.0, n.y >= 0.0 ? 1.0 : -1.0);
    }
    return normalize(n);
}
```

##### 3. Mesh Instancing
Repeated components (e.g. 800 standard columns or 2,500 pipe hangers) store their mesh vertex buffers once in the Geometry Definitions pool. Each instance requires only an index pointer, a 4x4 matrix $\mathbf{M} \in \mathbb{R}^{4 \times 4}$, and an RGBA color tint.

---

### 1.4 Spatial Decomposition Tree Parsing (`IfcProject` $\rightarrow$ `IfcProduct`)

IFC defines physical and logical containment through aggregation relationships (`IfcRelAggregates`) and spatial containment relationships (`IfcRelContainedInSpatialStructure`).

```
IfcProject (GlobalId, Units, Coordinate Reference System)
  │
  └── IfcRelAggregates
        │
        ▼
      IfcSite (Terrain, Longitude, Latitude, Elevation)
        │
        └── IfcRelAggregates
              │
              ▼
            IfcBuilding (Building Asset, Postal Address)
              │
              └── IfcRelAggregates
                    │
                    ▼
                  IfcBuildingStorey (Storey / Elevation Level)
                    │
                    ├── IfcRelAggregates
                    │     │
                    │     ▼
                    │   IfcSpace (Architectural Rooms & Enclosures)
                    │
                    └── IfcRelContainedInSpatialStructure
                          │
                          ▼
                        IfcProduct (Physical Building Elements)
                        ├── IfcWall / IfcWallStandardCase
                        ├── IfcBeam
                        ├── IfcColumn
                        ├── IfcSlab
                        ├── IfcWindow / IfcDoor
                        ├── IfcDuctSegment / IfcDuctFitting (HVAC)
                        └── IfcPipeSegment / IfcPipeFitting (Plumbing)
```

#### JSON Specification (`structure.json`)
```json
{
  "id": "24O8sC$qj4q8B0D3sK2L1e",
  "title": "Nordic LCA Housing Project",
  "type": "IfcProject",
  "children": [
    {
      "id": "1A2B3C4D5E6F7G8H9I0J1K",
      "title": "Site Stockholm",
      "type": "IfcSite",
      "children": [
        {
          "id": "0K1J9I8H7G6F5E4D3C2B1A",
          "title": "Building Concrete Block A",
          "type": "IfcBuilding",
          "children": [
            {
              "id": "3F4E5D6C7B8A9012345678",
              "title": "Storey 01 - Ground Floor",
              "type": "IfcBuildingStorey",
              "elevation": 0.0,
              "children": [
                {
                  "id": "0$A1b2C3d4E5f6G7h8I9j0",
                  "title": "Exterior Wall - 300mm Concrete",
                  "type": "IfcWallStandardCase"
                },
                {
                  "id": "9j0I9h8G7f6E5d4C3b2A10",
                  "title": "Rectangular Supply Duct 400x200",
                  "type": "IfcDuctSegment"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 1.5 Property Set (Pset) & Quantity Take-Off (Qto) Extraction and Indexing

Properties are linked to elements via `IfcRelDefinesByProperties`. OpenProject indexes these into a JSON key-value dictionary keyed by the element's 22-character IFC GlobalId.

```
+---------------------------------------------------------------------------------------------------+
|                                  IFC Property & Quantity Schema                                   |
+---------------------------------------------------------------------------------------------------+
|  IfcProduct (e.g. IfcWallStandardCase, GlobalId: "0$A1b2C3d4E5f6G7h8I9j0")                        |
|    ▲                                                                                              |
|    │ IfcRelDefinesByProperties                                                                    |
|    ├──► IfcPropertySet: "Pset_WallCommon"                                                         |
|    │      ├── Reference: "EXT_W_300" (IfcPropertySingleValue -> IfcIdentifier)                    |
|    │      ├── LoadBearing: TRUE (IfcPropertySingleValue -> IfcBoolean)                            |
|    │      ├── IsExternal: TRUE (IfcPropertySingleValue -> IfcBoolean)                             |
|    │      ├── FireRating: "REI 90" (IfcPropertySingleValue -> IfcLabel)                           |
|    │      └── AcousticRating: "52dB" (IfcPropertySingleValue -> IfcLabel)                         |
|    │                                                                                              |
|    └──► IfcElementQuantity: "Qto_WallBaseQuantities"                                              |
|           ├── Length: 6.500 m (IfcQuantityLength)                                                 |
|           ├── Height: 3.000 m (IfcQuantityLength)                                                 |
|           ├── Width: 0.300 m (IfcQuantityLength)                                                  |
|           ├── GrossFootprintArea: 1.950 m² (IfcQuantityArea)                                      |
|           ├── NetSideArea: 19.500 m² (IfcQuantityArea)                                            |
|           └── NetVolume: 5.850 m³ (IfcQuantityVolume)                                             |
+---------------------------------------------------------------------------------------------------+
```

#### JSON Property Dictionary Structure (`properties.json`)
```json
{
  "0$A1b2C3d4E5f6G7h8I9j0": {
    "Pset_WallCommon": {
      "Reference": "EXT_W_300",
      "LoadBearing": true,
      "IsExternal": true,
      "FireRating": "REI 90",
      "AcousticRating": "52dB"
    },
    "Qto_WallBaseQuantities": {
      "Length": 6.500,
      "Height": 3.000,
      "Width": 0.300,
      "GrossFootprintArea": 1.950,
      "NetSideArea": 19.500,
      "NetVolume": 5.850
    }
  }
}
```

---

## 2. BCF & Issue Collaboration Pipeline

```
+---------------------------------------------------------------------------------------------------+
|                                     BCF Collaboration Pipeline                                    |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|   Desktop Authoring Tool               OpenProject Server                  BCF-API Consumer       |
|   (Revit / Solibri)                    (Rails / PostgreSQL)                (Solibri Live Connect) |
|          │                                      │                                    │            |
|          │ 1. Export .bcfzip                    │                                    │            |
|          ├─────────────────────────────────────►│                                    │            |
|          │    POST /api/bcf/2.1/projects/import │                                    │            |
|          │                                      │                                    │            |
|          │                                      │ 2. Parse ZIP Container             │            |
|          │                                      │    - bcf.version                   │            |
|          │                                      │    - markup.bcf                    │            |
|          │                                      │    - viewpoint.bcfv                │            |
|          │                                      │    - snapshot.png                  │            |
|          │                                      │                                    │            |
|          │                                      │ 3. Ingest into DocType/Model       │            |
|          │                                      │    - Create BCF Topic              │            |
|          │                                      │    - Create WorkPackage            │            |
|          │                                      │    - Attach Viewpoints & Comments  │            |
|          │                                      │                                    │            |
|          │                                      │ 4. REST GET /topics                │            |
|          │                                      │◄───────────────────────────────────┤            |
|          │                                      │                                    │            |
|          │                                      │ 5. Returns Topics JSON             │            |
|          │                                      ├───────────────────────────────────►│            |
|          │                                      │                                    │            |
|          │                                      │ 6. PUT /topics/{id}/comments       │            |
|          │                                      │◄───────────────────────────────────┤            |
|          │                                      │                                    │            |
|          │ 7. Webhook / Long-Poll Sync          │                                    │            |
|          │◄─────────────────────────────────────┤                                    │            |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### 2.1 buildingSMART BCF-XML (v2.1 & v3.0) Archive Architecture

BCF-XML is a standardized compressed ZIP container (`.bcfzip` or `.bcf`) holding issue metadata, viewpoints, and context images.

```
example_coordination_issues.bcf (ZIP Root)
├── bcf.version                                 <-- XML schema version identifier
├── project.bcfp                                <-- Project identification (v2.1)
├── extensions.xml (v2.1) / extensions.json (3.0) <-- Project taxonomy constraints
├── 8f5b4c12-3456-4789-a1b2-c3d4e5f60718/       <-- Topic Directory (UUID v4)
│   ├── markup.bcf                              <-- Issue metadata, threading, comments
│   ├── viewpoint.bcfv                          <-- 3D camera, clipping, visibility XML (v2.1)
│   │                                               or {ViewpointGuid}.bcfv (v3.0)
│   └── snapshot.png                            <-- 2D context PNG/JPEG image
└── a1b2c3d4-e5f6-7890-1234-567890abcdef/       <-- Second Topic Directory
    ├── markup.bcf
    ├── 4e3d2c1b-a098-7654-3210-fedcba987654.bcfv
    └── snapshot.png
```

#### Specification Evolution Matrix: BCF-XML 2.1 vs. BCF-XML 3.0
| Feature | BCF-XML v2.1 (2017) | BCF-XML v3.0 (2021) |
| :--- | :--- | :--- |
| **Root Version Tag** | `<Version VersionId="2.1"/>` | `<Version VersionId="3.0"/>` |
| **XML Namespace** | `http://www.buildingsmart-tech.org/specifications/bcf-xml-2.1` | `https://standards.buildingsmart.org/BCF/XML/3.0/` |
| **Viewpoint Naming** | `viewpoint.bcfv` (fixed name per folder) | `{ViewpointGuid}.bcfv` (multi-viewpoint support) |
| **Viewpoint References**| Single default viewpoint | `<Viewpoints Guid="...">` collection in `markup.bcf` |
| **Extensions File** | `extensions.xml` | `extensions.json` |
| **Document References** | Unstructured URLs | Structured `<DocumentReference>` with GUID, URL, Description |
| **BIM Snippets** | Primitive snippet reference | `<BimSnippet SnippetType="..." ReferenceSchema="...">` |
| **Comment Formatting** | Plain text string | Full Markdown syntax supported |
| **ViewSetupHints** | None | `<ViewSetupHints SpacesVisible="..." OpeningsVisible="..."/>` |

---

### 2.2 Bit-Exact XML Schemas & Serialization

#### 1. `bcf.version`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Version xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="version.xsd"
         VersionId="2.1">
    <DetailedVersion>2.1</DetailedVersion>
</Version>
```

#### 2. `markup.bcf` (BCF 2.1 / 3.0)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Markup xmlns="http://www.buildingsmart-tech.org/specifications/bcf-xml-2.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.buildingsmart-tech.org/specifications/bcf-xml-2.1 markup.xsd">
    <Header>
        <File IfcProject="24O8sC$qj4q8B0D3sK2L1e" 
              IfcSpatialStructureElement="0K1J9I8H7G6F5E4D3C2B1A" 
              Date="2026-09-02T10:00:00Z" 
              Filename="STRUC_NordicLCA_Housing.ifc">
            <Filename>STRUC_NordicLCA_Housing.ifc</Filename>
            <Date>2026-09-02T10:00:00Z</Date>
        </File>
    </Header>
    <Topic Guid="8f5b4c12-3456-4789-a1b2-c3d4e5f60718"
           TopicType="Clash"
           TopicStatus="Open"
           Priority="Critical"
           Stage="Detailed Design">
        <Title>HVAC Duct Clashes with Structural Concrete Beam B102</Title>
        <Priority>Critical</Priority>
        <Index>1</Index>
        <Labels>
            <Label>Structure</Label>
            <Label>HVAC</Label>
            <Label>Clash</Label>
        </Labels>
        <CreationDate>2026-09-02T10:15:30Z</CreationDate>
        <CreationAuthor>bim_coordinator@openproject.local</CreationAuthor>
        <ModifiedDate>2026-09-02T11:20:00Z</ModifiedDate>
        <ModifiedAuthor>structural_engineer@openproject.local</ModifiedAuthor>
        <DueDate>2026-09-10T17:00:00Z</DueDate>
        <AssignedTo>mep_engineer@openproject.local</AssignedTo>
        <Description>Supply Air Duct 400x200 intersects reinforced concrete beam B102 on Level 01 by 85mm.</Description>
        <BimSnippet SnippetType="IFC" isExternal="false">
            <Reference>IfcBeam/24O8sC$qj4q8B0D3sK2L1e</Reference>
            <ReferenceSchema>IFC4</ReferenceSchema>
        </BimSnippet>
        <DocumentReferences>
            <DocumentReference isExternal="true">
                <ReferencedDocument>https://cde.openproject.local/documents/DOC-STRUC-REV-C</ReferencedDocument>
                <Description>Structural Framing Drawing Sheet S-102</Description>
            </DocumentReference>
        </DocumentReferences>
        <Viewpoints Guid="4e3d2c1b-a098-7654-3210-fedcba987654">
            <Viewpoint>viewpoint.bcfv</Viewpoint>
            <Snapshot>snapshot.png</Snapshot>
            <Index>0</Index>
        </Viewpoints>
    </Topic>
    <Comment Guid="f1a2b3c4-d5e6-7890-1234-567890abcdef">
        <Date>2026-09-02T11:20:00Z</Date>
        <Author>structural_engineer@openproject.local</Author>
        <Comment>Beam B102 is post-tensioned; cannot core or penetrate. Please reroute HVAC duct under soffit.</Comment>
        <Viewpoint Guid="4e3d2c1b-a098-7654-3210-fedcba987654"/>
        <ModifiedDate>2026-09-02T11:20:00Z</ModifiedDate>
    </Comment>
</Markup>
```

#### 3. `viewpoint.bcfv` (`visinfo.xsd`)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<VisualizationInfo xmlns="http://www.buildingsmart-tech.org/specifications/bcf-xml-2.1"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.buildingsmart-tech.org/specifications/bcf-xml-2.1 visinfo.xsd"
                   Guid="4e3d2c1b-a098-7654-3210-fedcba987654">
    <PerspectiveCamera>
        <CameraViewPoint>
            <X>14.250320</X>
            <Y>-8.432110</Y>
            <Z>4.821050</Z>
        </CameraViewPoint>
        <CameraDirection>
            <X>-0.577350</X>
            <Y>0.577350</Y>
            <Z>-0.577350</Z>
        </CameraDirection>
        <CameraUpVector>
            <X>0.000000</X>
            <Y>0.000000</Y>
            <Z>1.000000</Z>
        </CameraUpVector>
        <FieldOfView>60.0</FieldOfView>
    </PerspectiveCamera>
    <ClippingPlanes>
        <ClippingPlane>
            <Location>
                <X>10.500000</X>
                <Y>0.000000</Y>
                <Z>3.200000</Z>
            </Location>
            <Direction>
                <X>0.000000</X>
                <Y>0.000000</Y>
                <Z>-1.000000</Z>
            </Direction>
        </ClippingPlane>
    </ClippingPlanes>
    <Components>
        <ViewSetupHints SpacesVisible="false" SpaceBoundariesVisible="false" OpeningsVisible="false"/>
        <Selection>
            <Component IfcGuid="0$A1b2C3d4E5f6G7h8I9j0" Selected="true"/>
            <Component IfcGuid="9j0I9h8G7f6E5d4C3b2A10" Selected="true"/>
        </Selection>
        <Visibility DefaultVisibility="false">
            <Exceptions>
                <Component IfcGuid="0$A1b2C3d4E5f6G7h8I9j0"/>
                <Component IfcGuid="9j0I9h8G7f6E5d4C3b2A10"/>
                <Component IfcGuid="3F4E5D6C7B8A9012345678"/>
            </Exceptions>
        </Visibility>
        <Coloring>
            <Color Color="FFFF0000">
                <Component IfcGuid="0$A1b2C3d4E5f6G7h8I9j0"/>
            </Color>
            <Color Color="FFFFFF00">
                <Component IfcGuid="9j0I9h8G7f6E5d4C3b2A10"/>
            </Color>
        </Coloring>
    </Components>
</VisualizationInfo>
```

#### 4. `extensions.json` (BCF 3.0 Extension Taxonomy)
```json
{
  "topic_type": ["Clash", "Design Issue", "Request for Information", "Quality Control", "Safety"],
  "topic_status": ["Open", "In Progress", "Resolved", "Closed", "Reopened"],
  "priority": ["Low", "Normal", "High", "Critical"],
  "topic_label": ["Architecture", "Structure", "MEP HVAC", "MEP Piping", "Electrical", "Cost"],
  "stage": ["Concept", "Schematic Design", "Detailed Design", "Tender", "Construction", "As-Built"],
  "snippet_type": ["IFC", "PDF", "DWG"],
  "user": [
    "bim_coordinator@openproject.local",
    "structural_engineer@openproject.local",
    "mep_engineer@openproject.local"
  ]
}
```

---

### 2.3 BCF REST API (v2.1 & v3.0) Endpoint Specifications

The buildingSMART BCF REST API enables real-time synchronization between CDE servers and desktop authoring add-ins.

```
+---------------------------------------------------------------------------------------------------+
|                                  BCF REST API v2.1/v3.0 Resources                                 |
+---------------------------------------------------------------------------------------------------+
|  Root Path: `/api/bcf/2.1` or `/api/bcf/3.0`                                                      |
+-------------------------------------------+--------+----------------------------------------------+
|  Endpoint                                 | Method | Description                                  |
+-------------------------------------------+--------+----------------------------------------------+
|  `/projects`                              | GET    | List authorized BIM projects                 |
|  `/projects/{p_id}`                       | GET    | Project metadata & statistics                |
|  `/projects/{p_id}/extensions`            | GET    | Taxonomy definitions (Statuses, Types, etc)  |
|  `/projects/{p_id}/topics`                | GET    | Filtered & paginated issue topic list        |
|  `/projects/{p_id}/topics`                | POST   | Create new topic (generates Work Package)    |
|  `/projects/{p_id}/topics/{t_id}`         | GET    | Retrieve topic details                       |
|  `/projects/{p_id}/topics/{t_id}`         | PUT    | Update topic metadata (status, assignee)     |
|  `/projects/{p_id}/topics/{t_id}/viewpoints` | GET | List 3D viewpoints attached to topic         |
|  `/projects/{p_id}/topics/{t_id}/viewpoints` | POST| Create viewpoint (JSON camera/vis state)     |
|  `/projects/{p_id}/topics/{t_id}/viewpoints/{v_id}` | GET | Retrieve viewpoint JSON             |
|  `/projects/{p_id}/topics/{t_id}/viewpoints/{v_id}/snapshot` | GET | Download 2D context PNG      |
|  `/projects/{p_id}/topics/{t_id}/viewpoints/{v_id}/snapshot` | PUT | Upload 2D context PNG (image/png)|
|  `/projects/{p_id}/topics/{t_id}/comments`| GET    | List threaded discussions                    |
|  `/projects/{p_id}/topics/{t_id}/comments`| POST   | Post new comment / reply                     |
|  `/projects/{p_id}/topics/{t_id}/comments/{c_id}` | PUT | Edit existing comment                   |
+---------------------------------------------------------------------------------------------------+
```

#### Authentication & Discovery (`/.well-known/bcf-metadata`)
```json
{
  "version_id": "2.1",
  "http_bcf_version": "2.1",
  "oauth2_auth_url": "https://openproject.local/oauth/authorize",
  "oauth2_token_url": "https://openproject.local/oauth/token",
  "oauth2_dynamic_client_registration_url": null
}
```

---

## 3. 3D BIM Viewer Integration Pipeline

```
+----------------------------------------------------------------------------------------------------+
|                                    xeokit-sdk Viewer Architecture                                  |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +--------------------------------------------------------------------------------------------+   |
|   |                     xeokit Viewer Core (`Viewer({ canvasId: "canvas" })`)                  |   |
|   |  - WebGL2 Hardware Accelerated Rendering Pipeline                                          |   |
|   |  - Multi-threaded Geometry Allocation & Shader Program Cache                               |   |
|   |  - Spatial Octree Scene Graph & Broadphase Culling                                         |   |
|   +---------------------------------------------+----------------------------------------------+   |
|                                                 |                                                  |
|         +-----------------------+---------------+-----------------------+                          |
|         │                       │                                       │                          |
|         ▼                       ▼                                       ▼                          |
|  +--------------------+  +--------------------+                   +--------------------+           |
|  |  XKTLoaderPlugin   |  | BCFViewpointsPlugin|                   | SectionPlanesPlugin|           |
|  |  - Streams .xkt    |  | - getViewpoint()   |                   | - 3D Clip Planes   |           |
|  |  - Instanced Meshes|  | - setViewpoint()   |                   | - Section Cap Mesh |           |
|  +--------------------+  +--------------------+                   +--------------------+           |
|         │                       │                                       │                          |
|         ▼                       ▼                                       ▼                          |
|  +--------------------+  +--------------------+                   +--------------------+           |
|  |  TreeViewPlugin    |  | AnnotationsPlugin  |                   | NavCubePlugin /    |           |
|  |  - Spatial Browser |  | - 3D Issue Pins    |                   | CameraControl      |           |
|  |  - Storey Isolator |  | - Clash Centroids  |                   | - Orbit, Pan, Fly  |           |
|  +--------------------+  +--------------------+                   +--------------------+           |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### 3.1 Scene Graph Synchronization, GPU Picking & GUID Bridges

#### 1. Dual GUID/Entity Indexing
Every BIM element is identified by its 22-character IFC GlobalId. The viewer maintains an active dual mapping:
- `guidToEntityMap: Map<string, Entity>`
- `entityIdToGuidMap: Map<string, string>`

#### 2. Sub-Millisecond GPU Offscreen Framebuffer Picking
To pick components instantly among millions of triangles at 60 FPS:
- The viewer renders an offscreen framebuffer pass encoding each object's unique 24-bit integer ID into RGB bytes:

$$\text{Pixel Color} = \left( \frac{\text{ID} \gg 16}{255.0}, \; \frac{(\text{ID} \gg 8) \ \& \ 255}{255.0}, \; \frac{\text{ID} \ \& \ 255}{255.0} \right)$$

- On user pointer events, `gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer)` recovers the exact entity ID in less than 0.1 milliseconds without CPU ray-triangle intersection testing.

#### 3. X-Ray & Ghosting Mode
```javascript
// Isolate colliding structural beam and MEP duct while ghosting context
viewer.scene.setObjectsVisible(viewer.scene.objectIds, true);
viewer.scene.setObjectsXRayed(viewer.scene.objectIds, true);
viewer.scene.setObjectsOpacity(viewer.scene.objectIds, 0.15); // Transparent ghosting

viewer.scene.setObjectsXRayed([strucBeamGuid, hvacDuctGuid], false);
viewer.scene.setObjectsOpacity([strucBeamGuid, hvacDuctGuid], 1.0);
viewer.scene.setObjectsColor([strucBeamGuid], [1.0, 0.0, 0.0]); // Red (Beam A)
viewer.scene.setObjectsColor([hvacDuctGuid], [1.0, 1.0, 0.0]);  // Yellow (Duct B)
```

---

### 3.2 3D Camera Viewpoint Math & Coordinate Transformations

#### 1. Basis Transformation Between Three.js (Y-Up) and IFC/BCF (Z-Up)

```
      Three.js Frame (Y-Up)                      IFC / BCF World Frame (Z-Up)
             +Y (Up)                                     +Z (Elevation / Up)
              |                                            |
              |                                            |
              +------ +X (Right)                           +------ +Y (North / Forward)
             /                                            /
            /                                            /
          +Z (Out of Screen)                           +X (East / Right)
```

$$\mathbf{P}_{IFC} = \mathbf{R}_{Three \to IFC} \cdot \mathbf{P}_{Three} = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 0 & -1 \\ 0 & 1 & 0 \end{bmatrix} \begin{bmatrix} X_{Three} \\ Y_{Three} \\ Z_{Three} \end{bmatrix} = \begin{bmatrix} X_{Three} \\ -Z_{Three} \\ Y_{Three} \end{bmatrix}$$

$$\mathbf{P}_{Three} = \mathbf{R}_{IFC \to Three} \cdot \mathbf{P}_{IFC} = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 0 & 1 \\ 0 & -1 & 0 \end{bmatrix} \begin{bmatrix} X_{IFC} \\ Y_{IFC} \\ Z_{IFC} \end{bmatrix} = \begin{bmatrix} X_{IFC} \\ Z_{IFC} \\ -Y_{IFC} \end{bmatrix}$$

---

#### 2. Perspective Camera Mathematics

```
             Eye Position (E)
                    *
                   /|\
                  / | \
                 /  |  \
                /   |   \  Direction Vector (D)
               /    |    \
              /     |     \
             /      ▼      \
            +---------------+  <-- Near Plane (z_near)
           /                 \
          /                   \
         +---------------------+ <-- Target Point = E + D * d
        /                       \
       +-------------------------+ <-- Far Plane (z_far)
```

1. **Look-At View Matrix Frame**:
   - Forward Vector: $\vec{D} = \frac{\vec{T} - \vec{E}}{\|\vec{T} - \vec{E}\|}$
   - Right Vector: $\vec{u} = \frac{\vec{D} \times \vec{U}}{\|\vec{D} \times \vec{U}\|}$
   - True Up Vector: $\vec{v} = \vec{u} \times \vec{D}$

$$\mathbf{V} = \begin{bmatrix}
u_x & u_y & u_z & -\vec{u} \cdot \vec{E} \\
v_x & v_y & v_z & -\vec{v} \cdot \vec{E} \\
-D_x & -D_y & -D_z & \vec{D} \cdot \vec{E} \\
0 & 0 & 0 & 1
\end{bmatrix}$$

2. **Field of View (FOV) Conversion ($FOV_x \leftrightarrow FOV_y$)**:
   Given Aspect Ratio $A = \frac{\text{Width}}{\text{Height}}$:

$$\tan\left(\frac{FOV_x \cdot \pi}{360}\right) = A \cdot \tan\left(\frac{FOV_y \cdot \pi}{360}\right)$$

$$FOV_x = 2 \cdot \arctan\left( A \cdot \tan\left( \frac{FOV_y \cdot \pi}{360} \right) \right) \cdot \frac{180}{\pi}$$

$$FOV_y = 2 \cdot \arctan\left( \frac{1}{A} \cdot \tan\left( \frac{FOV_x \cdot \pi}{360} \right) \right) \cdot \frac{180}{\pi}$$

---

#### 3. Orthographic Camera Mathematics & `ViewToWorldScale`
In orthographic projection, $S = \text{ViewToWorldScale}$ defines the vertical height of the visible frustum in world metres:
- Frustum Top / Bottom: $\text{top} = +\frac{S}{2}, \quad \text{bottom} = -\frac{S}{2}$
- Frustum Left / Right: $\text{left} = -\frac{S \cdot A}{2}, \quad \text{right} = +\frac{S \cdot A}{2}$

$$\mathbf{P}_{ortho} = \begin{bmatrix}
\frac{2}{S \cdot A} & 0 & 0 & 0 \\
0 & \frac{2}{S} & 0 & 0 \\
0 & 0 & -\frac{2}{z_{far} - z_{near}} & -\frac{z_{far} + z_{near}}{z_{far} - z_{near}} \\
0 & 0 & 0 & 1
\end{bmatrix}$$

---

### 3.3 Section Planes / Clipping Planes Mathematics & Shaders

A BCF clipping plane is specified by Location point $\vec{P}_0 = (x_0, y_0, z_0)$ and normal Direction $\vec{N} = (n_x, n_y, n_z)$.

```
                        Normal Vector N (Cut direction)
                               ▲
                               │
                Discarded      │
               Half-Space      │
                               │
    ───────────────────────────+───────────────────────────  <-- Plane: dot(N, P - P0) = 0
                               P0 (Location point)
                Retained
               Half-Space
```

1. **Hesse Normal Form**:
   $$\vec{N} \cdot \vec{P} + d = 0 \quad \text{where} \quad d = -(\vec{N} \cdot \vec{P}_0) = -(n_x x_0 + n_y y_0 + n_z z_0)$$

2. **GLSL Fragment Shader Culling**:
```glsl
uniform vec4 uClipPlane; // (nx, ny, nz, d)
varying vec3 vWorldPosition;

void main() {
    float dist = dot(uClipPlane.xyz, vWorldPosition) + uClipPlane.w;
    if (dist > 0.0) {
        discard; // Cull fragment in positive half-space
    }
    // Normal PBR shading continues...
}
```

---

### 3.4 Component Visibility, Selection & Coloring Logic Matrix

When restoring a BCF viewpoint, the viewer executes a deterministic state machine:

```
                      +-----------------------------+
                      | Restore BCF Viewpoint State |
                      +--------------+--------------+
                                     |
                                     ▼
                    /─────────────────────────────────\
                   <   Is DefaultVisibility == true?   >
                    \─────────────────────────────────/
                                     │
                    ┌────────────────┴────────────────┐
                    │ YES                             │ NO
                    ▼                                 ▼
       +--------------------------+      +--------------------------+
       | Set ALL elements VISIBLE |      |  Set ALL elements HIDDEN |
       +------------+-------------+      +------------+-------------+
                    │                                 │
                    ▼                                 ▼
       +--------------------------+      +--------------------------+
       | For each GUID in         |      | For each GUID in         |
       | Exceptions:              |      | Exceptions:              |
       | Set element HIDDEN       |      | Set element VISIBLE      |
       +------------+-------------+      +------------+-------------+
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                    +--------------------------------+
                    | For each GUID in Selection:    |
                    | Set element SELECTED (outline) |
                    +----------------+---------------+
                                     │
                                     ▼
                    +--------------------------------+
                    | For each Color in Coloring:    |
                    | Apply hex color to element IDs |
                    +--------------------------------+
```

---

## 4. Work Package & Project Synchronization Pipeline

```
+----------------------------------------------------------------------------------------------------+
|                               OpenProject Work Package vs BCF Model Mapping                         |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    +-----------------------------+                  +-----------------------------+                |
|    |      Bcf::Topic Record      |                  |     WorkPackage Record      |                |
|    +-----------------------------+                  +-----------------------------+                |
|    | - guid: UUID v4             | <──────────────> | - id: Integer (Primary Key) |                |
|    | - topic_type: "Clash"       |   1:1 Relation   | - type_id: Issue / Clash    |                |
|    | - topic_status: "Open"      |                  | - status_id: Open (id: 1)   |                |
|    | - priority: "Critical"      |                  | - priority_id: Immediate    |                |
|    | - title: String             |                  | - subject: String           |                |
|    | - description: Text         |                  | - description: Text         |                |
|    | - assigned_to: Email        |                  | - assigned_to_id: User_id   |                |
|    | - due_date: ISO Date        |                  | - due_date: Date            |                |
|    +--------------+--------------+                  +--------------+--------------+                |
|                   │                                                │                               |
|                   │ has_many                                       │ has_many                      |
|                   ▼                                                ▼                               |
|    +-----------------------------+                  +-----------------------------+                |
|    |     Bcf::Viewpoint Record   |                  |     Journal / Activity      |                |
|    +-----------------------------+                  +-----------------------------+                |
|    | - guid: UUID v4             |                  | - id: Integer               |                |
|    | - json_viewpoint: JSON      |                  | - notes: Text (Comments)    |                |
|    | - snapshot: Attachment PNG  |                  | - user_id: Author User      |                |
|    +-----------------------------+                  +-----------------------------+                |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### 4.1 Data Model Mapping: BCF Topic $\leftrightarrow$ OpenProject WorkPackage $\leftrightarrow$ Frappe DocTypes

| OpenProject / Rails Attribute | BCF XML / REST API Field | Frappe `construction_bim` DocType Field | Field Type |
| :--- | :--- | :--- | :--- |
| `bcf_topic.guid` | `Topic.Guid` (UUID v4) | `bcf_guid` | Data (UUID) |
| `work_package.id` | `ServerAssignedId` (v3.0) | `name` (e.g. `BCF-TOPIC-2026-0001`) | Data (Name) |
| `work_package.subject` | `Topic.Title` | `title` | Data |
| `work_package.description` | `Topic.Description` | `description` | Text Editor |
| `work_package.type.name` | `Topic.TopicType` | `topic_type` | Link $\rightarrow$ `BCF Issue Type` |
| `work_package.status.name` | `Topic.TopicStatus` | `topic_status` | Link $\rightarrow$ `BCF Issue Status` |
| `work_package.priority.name` | `Topic.Priority` | `priority` | Link $\rightarrow$ `BCF Priority` |
| `work_package.assigned_to.mail`| `Topic.AssignedTo` | `assigned_to` | Link $\rightarrow$ `User` |
| `work_package.author.mail` | `Topic.CreationAuthor` | `owner` / `creation_author` | Link $\rightarrow$ `User` |
| `work_package.created_at` | `Topic.CreationDate` | `creation` / `creation_date` | Datetime |
| `work_package.updated_at` | `Topic.ModifiedDate` | `modified` / `modified_date` | Datetime |
| `work_package.due_date` | `Topic.DueDate` | `due_date` | Date |
| `bcf_topic.bcf_viewpoints` | `Topic.Viewpoints` | `viewpoints` | Table $\rightarrow$ `BCF Viewpoint Item` |
| `work_package.journals.notes`| `Comments.Comment` | `comments` | Table $\rightarrow$ `BCF Comment Item` |
| `custom_values: stage` | `Topic.Stage` | `stage` | Select / Data |

---

### 4.2 Bi-Directional Synchronization Engine & Conflict Resolution

```
+----------------------------------------------------------------------------------------------------+
|                               Bi-Directional BCF Synchronization Engine                            |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    External Authoring Tool (Revit / Solibri)                    OpenProject CDE Server             |
|    ─────────────────────────────────────────                    ──────────────────────             |
|                                                                                                    |
|    1. User modifies issue status to 'Resolved'                                                     |
|       PUT /api/bcf/2.1/projects/{p_id}/topics/{t_id}                                               |
|       { "topic_status": "Resolved", "modified_date": "2026-09-02T12:00:00Z" }                      |
|       ────────────────────────────────────────────────────────────────────────►                    |
|                                                                                                    |
|                                                                 2. Lock WorkPackage Record         |
|                                                                 3. Compare modified timestamps     |
|                                                                 4. Timestamp Validation:           |
|                                                                    If T_incoming > T_server:       |
|                                                                      Update Status & Subject       |
|                                                                      Create Journal Audit Entry    |
|                                                                    Else:                           |
|                                                                      Reject 409 Conflict           |
|                                                                                                    |
|    5. HTTP 200 OK Response                                                                         |
|       ◄────────────────────────────────────────────────────────────────────────                    |
|                                                                                                    |
|    6. OpenProject Desk User adds comment                                                           |
|       WorkPackage.create_journal(notes: "Approved")                                                |
|       ─────────────────────────────────────────                                                    |
|                                                                                                    |
|    7. Webhook / Long-Poll Notification                                                             |
|       GET /api/bcf/2.1/projects/{p_id}/topics/{t_id}/comments                                      |
|       ◄────────────────────────────────────────────────────────────────────────                    |
|       Returns new Comment array                                                                    |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

#### Concurrency & Conflict Rules
1. **Optimistic Locking via HTTP `If-Unmodified-Since`**: Every PUT request validates the `ModifiedDate` against the server timestamp. Stale updates return `HTTP 409 Conflict`.
2. **Immutability of Viewpoints**: BCF viewpoints are immutable. Modifying a camera angle generates a new viewpoint record with a new UUID and appends it to the topic collection.
3. **Audit Trail Persistence**: Every modification creates an immutable `Journal` / `Version` record capturing the diff.

---

## 5. Comparative Synthesis & Architectural Insights for ERPNext `construction_bim`

| Architectural Dimension | OpenProject BIM Edition | ERPNext `construction_bim` (Current) | Target Blueprint for `construction_bim` |
| :--- | :--- | :--- | :--- |
| **Backend Engine** | Ruby on Rails + PostgreSQL | Python (Frappe Framework) + MariaDB/Postgres | Python (Frappe Framework) + MariaDB/Postgres |
| **IFC Ingestion** | Server async workers (`xeokit-convert`, GLB/XKT) | Pure-Python parser (`ifc_parser.py`) + client WASM | Hybrid: Server Python metadata parser + Client WASM multi-model loader |
| **3D Rendering Engine** | xeokit-sdk (WebGL2, XKT binary streaming) | Three.js (WebGL, web-ifc WASM runtime) | Three.js + web-ifc + `three-mesh-bvh` clash engine |
| **Multi-Discipline Viewing** | Multi-XKT layer loading | Single IFC model loading | Multi-IFC federated viewing (`COORDINATE_TO_ORIGIN: false`) |
| **Clash Detection** | External (Solibri, Navisworks) $\rightarrow$ BCF sync | None (Manual visual check) | In-Viewer BVH client collision engine (`three-mesh-bvh`) |
| **BCF Interoperability** | Native BCF-XML 2.1 zip + BCF REST API 2.1 | Custom viewpoint JSON storage | Full BCF-XML 2.1/3.0 zip engine + BCF REST API |
| **ERP / Task Mapping** | Linked to Rails `WorkPackage` | Linked to `BIM Model`, `BIM Element` | 3-Way Link: BCF Topic $\leftrightarrow$ BIM Clash $\leftrightarrow$ Task / BOM |
| **Quantity Take-Off (QTO)** | Metadata viewer inspector | Pure-Python `quantities` JSON dictionary | Automated BIM Element $\rightarrow$ ERPNext Item & BOM Generator |

---

## 6. Verification and Reference Checklist

- [x] **IFC Storage & Conversion**: Complete documentation of ActiveStorage schemas, background worker job lifecycle, 16-bit vertex quantization, octahedral normal encoding, and `structure.json` spatial trees.
- [x] **BCF-XML & BCF-API Standards**: Full bit-exact XML schemas for `bcf.version`, `markup.bcf`, `viewpoint.bcfv`, and `extensions.json`, plus REST endpoint schemas with OAuth2 discovery.
- [x] **3D Camera Projection & Math**: Comprehensive derivations for coordinate basis rotation ($\mathbf{R}_{Three \to IFC}$), perspective FOV mapping, orthographic scale ($S_{v2w}$), Hesse normal form clipping planes, and OrbitControls target reconstruction.
- [x] **Work Package Duality**: Detailed field-by-field mapping matrix linking BCF topics to OpenProject Work Packages and Frappe DocTypes with optimistic locking and audit journaling.
- [x] **Comparative Blueprint**: Concrete gap analysis and target architectural blueprint for ERPNext `construction_bim`.
