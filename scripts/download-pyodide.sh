#!/usr/bin/env bash
# Download Pyodide v0.29.3 runtime files to docs/public/pyodide/
# Idempotent: skips files that already exist.
# Usage: bash scripts/download-pyodide.sh

set -euo pipefail

PYODIDE_VERSION="0.29.3"
BASE_URL="https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full"
DEST="$(cd "$(dirname "$0")/.." && pwd)/docs/public/pyodide"

FILES=(
  "pyodide.mjs"
  "pyodide.asm.js"
  "pyodide.asm.wasm"
  "python_stdlib.zip"
  "pyodide-lock.json"
)

mkdir -p "$DEST"

for FILE in "${FILES[@]}"; do
  TARGET="$DEST/$FILE"
  if [ -f "$TARGET" ]; then
    echo "✓ $FILE already exists, skipping"
  else
    echo "↓ Downloading $FILE..."
    curl -fsSL --retry 3 --retry-delay 2 "$BASE_URL/$FILE" -o "$TARGET"
    echo "✓ $FILE downloaded"
  fi
done

echo ""
echo "Pyodide v${PYODIDE_VERSION} ready at $DEST"
