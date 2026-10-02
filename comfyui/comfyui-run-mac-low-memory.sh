#!/usr/bin/env bash
# ComfyUI on Apple Silicon — reduces MPS memory pressure for large checkpoints (e.g. FinePorn INT8 ~12GB).
# Usage: quit heavy apps (Chrome, etc.), then: bash ~/Downloads/comfyui-run-mac-low-memory.sh

set -euo pipefail

COMFY_ROOT="/Users/aman/ComfyUI-Installs/ComfyUI/ComfyUI"
DESKTOP_MODEL_PATHS="/Users/aman/Library/Application Support/Comfy Desktop/instance-model-paths/inst-1790332094115.yaml"
cd "$COMFY_ROOT"

export PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0
export PYTORCH_ENABLE_MPS_FALLBACK=1

source .venv/bin/activate

exec python main.py \
  --listen 127.0.0.1 \
  --port 8188 \
  --extra-model-paths-config "$DESKTOP_MODEL_PATHS" \
  --output-directory /Users/aman/ComfyUI-Shared/output \
  --input-directory /Users/aman/ComfyUI-Shared/input \
  --novram \
  --cpu-vae \
  --cache-none \
  --disable-smart-memory \
  --fast-disk \
  --reserve-vram 2
