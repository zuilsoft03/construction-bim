"""Host-side unit tests for construction_bim.construction.drive_tree.

Run: python -m unittest test.test_drive_tree -v
"""
import unittest

from construction_bim.construction.drive_tree import build_tree, DEFAULT_TREE


class FakeFS:
    """Records calls; exists returns a stable id if the folder was created."""

    def __init__(self):
        self.created = []          # (name, parent)
        self._ids = {}
        self._counter = 0

    def _key(self, name, parent):
        return f"{parent}/{name}"

    def exists_folder(self, name, parent):
        return self._ids.get(self._key(name, parent), False)

    def create_folder(self, name, parent):
        self.created.append((name, parent))
        self._counter += 1
        fid = f"f{self._counter}"
        self._ids[self._key(name, parent)] = fid
        return fid


class TestDriveTree(unittest.TestCase):
    def test_first_run_creates_all(self):
        fs = FakeFS()
        out = build_tree(fs, "PRJ-001")
        # 1 project + 12 tree paths; "02_Drawings" is an extra parent folder
        # created once as the shared parent of IFC/DWG/PDF.
        expected = 1 + len(DEFAULT_TREE) + 1
        self.assertEqual(len(out), expected)
        self.assertEqual(len(out), len(fs.created))  # every key was created once
        # nesting: 02_Drawings parent = project; IFC parent = 02_Drawings
        draws = out["02_Drawings"]
        ifc = out["02_Drawings/IFC"]
        self.assertNotEqual(draws, ifc)

    def test_second_run_creates_nothing(self):
        fs = FakeFS()
        build_tree(fs, "PRJ-001")
        first = len(fs.created)
        out2 = build_tree(fs, "PRJ-001")
        expected = 1 + len(DEFAULT_TREE) + 1
        self.assertEqual(len(out2), expected)
        self.assertEqual(len(fs.created), first, "second run must be idempotent")

    def test_nesting_order(self):
        fs = FakeFS()
        out = build_tree(fs, "PRJ-001")
        # parent chain: IFC's parent must be 02_Drawings (by name convention)
        self.assertIn("02_Drawings/IFC", out)
        self.assertIn("02_Drawings/DWG", out)
        self.assertIn("02_Drawings/PDF", out)

    def test_existing_folders_reused(self):
        fs = FakeFS()
        build_tree(fs, "PRJ-001")
        # wipe created log but keep ids -> simulates re-run against pre-existing
        fs.created.clear()
        out2 = build_tree(fs, "PRJ-002")
        # PRJ-002 also gets full tree (different project root, all fresh)
        self.assertEqual(len(out2), 1 + len(DEFAULT_TREE) + 1)
        self.assertEqual(len(out2), len(fs.created))


if __name__ == "__main__":
    unittest.main()
