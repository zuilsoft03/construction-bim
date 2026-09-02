"""Bundle extracted page app code into public/js/*.bundle.js via esbuild.

The extracted apps run their top-level code on import (boot included), so the
desk page JS can simply `import(...)` the bundle after rendering the template.
"""
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "frontend_src"
# Find esbuild: prefer the project-local copy (frontend_src/webifc_build),
# fall back to a global install.
_LOCAL_ESBUILD = ROOT / "frontend_src" / "webifc_build" / "node_modules" / ".bin" / "esbuild"
_GLOBAL_ESBUILD = pathlib.Path(
    r"C:\Users\gavie\AppData\Local\hermes\node\esbuild.cmd"
)
ESBUILD_JS = _LOCAL_ESBUILD if _LOCAL_ESBUILD.exists() else _GLOBAL_ESBUILD
NODE_BIN = r"C:\Users\gavie\AppData\Local\hermes\node\node.exe"

PAGES = ["bim_viewer", "pdf_takeoff"]


def extract(page: str) -> None:
    """Re-extract the module script from the page HTML into frontend_src."""
    html_path = ROOT / "construction_bim" / "bim" / "page" / page / f"{page}.html"
    html = html_path.read_text(encoding="utf-8")
    m = re.search(r'<script type="module">(.*?)</script>', html, re.DOTALL)
    if not m:
        raise SystemExit(f"no module script in {html_path}")
    (SRC / f"{page}_app.js").write_text(m.group(1).strip() + "\n", encoding="utf-8")
    print(f"extracted {page}: {len(m.group(1))} chars")


def bundle(page: str) -> None:
    out = ROOT / "construction_bim" / "public" / "js" / f"{page}.bundle.js"
    cmd = [
        NODE_BIN,
        str(ESBUILD_JS),
        str(SRC / f"{page}_app.js"),
        "--bundle",
        "--format=esm",
        "--sourcemap=inline",
        f"--outfile={out}",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=240)
    if proc.returncode != 0:
        print(f"ESBUILD ERROR ({page}):\n{proc.stderr[-3000:]}", file=sys.stderr)
        sys.exit(proc.returncode)
    print(f"bundled {page}: {out.stat().st_size} bytes")


if __name__ == "__main__":
    for page in PAGES:
        extract(page)
        bundle(page)
