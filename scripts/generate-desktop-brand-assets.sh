#!/usr/bin/env bash
# Regenerate desktop/build icons from data/uploads/logo.png (requires ImageMagick `magick`).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGO="$ROOT/data/uploads/logo.png"
OUT="$ROOT/desktop/build"
command -v magick >/dev/null || { echo "Install ImageMagick (magick) first." >&2; exit 1; }
mkdir -p "$OUT"
magick "$LOGO" -background white -gravity center -extent 512x512 "$OUT/.icon-source.png"
magick "$OUT/.icon-source.png" -define icon:auto-resize=256,128,64,48,32,16 "$OUT/icon.ico"
magick -size 256x256 xc:'#ffffff' "$LOGO" -resize 220x -gravity center -composite "$OUT/icon.png"
magick -size 164x314 xc:'#ffffff' "$OUT/.icon-source.png" -resize 140x140 -gravity north -geometry +0+48 -composite "$OUT/installerSidebar.bmp"
magick -size 150x57 xc:'#ffffff' "$LOGO" -resize 130x40 -gravity center -composite "$OUT/installerHeader.bmp"
rm -f "$OUT/.icon-source.png"
echo "Wrote desktop/build/icon.ico, installerSidebar.bmp, installerHeader.bmp"
