#!/usr/bin/env bash
# Rebuild the desk-page bundles from frontend_src/ (esbuild).
# Requires: node + npx esbuild available.
set -e
cd "$(dirname "$0")"

CFG_DEPS="construction_bim/public/js/three"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found - install Node.js first" >&2
  exit 1
fi

echo "== rebuilding bim_viewer.bundle.js =="
npx esbuild frontend_src/bim_viewer_app.js --bundle \
  --outfile=construction_bim/public/js/bim_viewer.bundle.js --format=iife --minify || exit 1

echo "== rebuilding pdf_takeoff.bundle.js =="
npx esbuild frontend_src/pdf_takeoff_app.js --bundle \
  --outfile=construction_bim/public/js/pdf_takeoff.bundle.js --format=iife --minify || exit 1

echo "done."
echo "NOTE: three.js is vendored at $CFG_DEPS (MIT) and required at runtime (importmap)."
