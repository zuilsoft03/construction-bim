"""Per-project Drive folder tree builder — pure core, no frappe imports.

``build_tree`` walks a folder list (relative paths) against an injectable
``fs`` object so it can be unit-tested on the host without Frappe/Drive:

    fs.exists_folder(name, parent) -> folder_id | False
    fs.create_folder(name, parent)  -> folder_id

Idempotent: folders that already exist are reused, never recreated.
"""

DEFAULT_TREE = [
    "00_Admin",
    "01_Contracts",
    "02_Drawings/IFC",
    "02_Drawings/DWG",
    "02_Drawings/PDF",
    "03_BIM_Models",
    "04_Takeoffs",
    "05_Schedule",
    "06_Progress_Reports",
    "07_QA_QC_HSE",
    "08_Correspondence",
    "09_Handover",
]


def build_tree(fs, project_name, tree=None):
    """Create the folder tree under ``project_name``; returns {rel_path: folder_id}.

    ``fs.exists_folder(name, parent)`` must return a truthy folder id when a
    folder already exists, else ``False``. ``fs.create_folder(name, parent)``
    returns the new folder id (used as parent for nested paths).
    """
    tree = tree or DEFAULT_TREE
    out = {}
    project_id = fs.exists_folder(project_name, None) or fs.create_folder(project_name, None)
    out[project_name] = project_id
    for rel in tree:
        parts = rel.split("/")
        parent = project_id
        path_parts = []
        for part in parts:
            path_parts.append(part)
            key = "/".join(path_parts)
            if key not in out:
                existing = fs.exists_folder(part, parent)
                out[key] = existing or fs.create_folder(part, parent)
            parent = out[key]
    return out


def count_creates(fs):
    """Number of create_folder calls recorded by CountingFs (helper for tests)."""
    return len(getattr(fs, "created", []))
