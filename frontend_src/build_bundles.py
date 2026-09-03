"""Bundle extracted page app code and webifc core into public/js/*.bundle.js via esbuild."""
import pathlib
import re
import subprocess
import sys
import shutil

import os

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "frontend_src"

NODE_BIN = os.environ.get("NODE_BIN") or shutil.which("node")
if not NODE_BIN:
    raise SystemExit("node not found on PATH; install Node.js or set NODE_BIN")
PAGES = ["bim_viewer", "pdf_takeoff"]


def extract(page: str) -> None:
    """Extract script from page HTML if present; fallback to existing app js."""
    html_path = ROOT / "construction_bim" / "bim" / "page" / page / f"{page}.html"
    if html_path.exists():
        html = html_path.read_text(encoding="utf-8")
        m = re.search(r'<script type="module">(.*?)</script>', html, re.DOTALL)
        if m:
            (SRC / f"{page}_app.js").write_text(m.group(1).strip() + "\n", encoding="utf-8")
            print(f"extracted {page}: {len(m.group(1))} chars")
            return
    if (SRC / f"{page}_app.js").exists():
        print(f"using existing {page}_app.js")
    else:
        raise SystemExit(f"no module script in {html_path} and no {page}_app.js")


def bundle_app(page: str) -> None:
    runner_path = ROOT / "frontend_src" / "webifc_build" / "bundle_runner.js"
    cmd = [NODE_BIN, str(runner_path), page]
    proc = subprocess.run(cmd, cwd=str(runner_path.parent), capture_output=True, text=True, timeout=240)
    if proc.returncode != 0:
        print(f"ESBUILD ERROR ({page}):\n{proc.stderr}", file=sys.stderr)
        sys.exit(proc.returncode)
    out = ROOT / "construction_bim" / "public" / "js" / f"{page}.bundle.js"
    print(f"bundled {page}: {out.stat().st_size} bytes")


def bundle_webifc() -> None:
    build2_path = ROOT / "frontend_src" / "webifc_build" / "build2.js"
    cmd = [NODE_BIN, str(build2_path)]
    proc = subprocess.run(cmd, cwd=str(build2_path.parent), capture_output=True, text=True, timeout=240)
    if proc.returncode != 0:
        print(f"WEBIFC BUILD ERROR:\n{proc.stderr}", file=sys.stderr)
        sys.exit(proc.returncode)
    webifc_out = ROOT / "construction_bim" / "public" / "js" / "webifc.bundle.js"
    print(f"bundled webifc: {webifc_out.stat().st_size} bytes")


if __name__ == "__main__":
    bundle_webifc()
    for page in PAGES:
        extract(page)
        bundle_app(page)
