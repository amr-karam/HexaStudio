#!/bin/bash
# sd-webui-check.sh — Local AUTOMATIC1111 WebUI + ControlNet setup for HEXA Studio
# Sprint S022.3 — AI Style-Transfer Renderer (self-hosted, no cloud/SaaS)
# Created: 2026-09-11
#
# Prerequisites:
#   - Python 3.10+ (system Python, NOT venv — for direct webui launch)
#   - Git
#   - ~8GB VRAM GPU (CUDA) OR CPU mode (slower)
#   - Git LFS for model downloads
#
# Usage:
#   chmod +x scripts/sd-webui-check.sh
#   ./scripts/sd-webui-check.sh          # Check + setup
#   ./scripts/sd-webui-check.sh --start  # Launch SD WebUI
#
# No API keys required — fully offline.

set -euo pipefail

SD_DIR="$HOME/sd-webui"
CONTROLNET_DIR="$SD_DIR/extensions/sd-webui-controlnet"
VENV="$SD_DIR/venv"

echo "=================================================="
echo "  AI Style-Transfer Renderer — Local SD Setup"
echo "  HEXA Studio — Sprint S022.3"
echo "  Self-hosted • Offline • No cloud/SaaS"
echo "=================================================="

# --- Check 1: Git ---
echo "[CHECK] git..."
if command -v git &>/dev/null; then
  echo "  OK: $(git --version)"
else
  echo "  ERROR: git not found. Install: apt install git (or scoop install git on Windows)"
  exit 1
fi

# --- Check 2: Python ---
echo "[CHECK] python..."
if command -v python3 &>/dev/null; then
  PYVER=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
  echo "  OK: python3 $PYVER"
elif command -v python &>/dev/null; then
  PYVER=$(python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
  echo "  OK: python $PYVER"
else
  echo "  ERROR: python3/not found. Install Python 3.10+: https://www.python.org/downloads/"
  exit 1
fi

# --- Check 3: Clone AUTOMATIC1111 WebUI ---
if [ ! -d "$SD_DIR" ]; then
  echo "[SETUP] Cloning AUTOMATIC1111 WebUI..."
  git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git "$SD_DIR"
fi

# --- Check 4: Install Python deps ---
if [ ! -d "$VENV" ]; then
  echo "[SETUP] Creating venv + installing deps..."
  cd "$SD_DIR"
  python3 -m venv venv
  source venv/bin/activate
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121 2>/dev/null || \
  pip install torch torchvision 2>/dev/null || \
  echo "  WARN: torch install failed — will use CPU mode"
  pip install -r requirements.txt
  deactivate
fi

# --- Check 5: Install ControlNet extension ---
if [ ! -d "$CONTROLNET_DIR" ]; then
  echo "[SETUP] Installing ControlNet extension..."
  cd "$SD_DIR/extensions"
  git clone https://github.com/Mikubill/sd-webui-controlnet.git
fi

# --- Check 6: Download base model ---
BASE_MODEL="$SD_DIR/models/Stable-diffusion/epicrealism_nmxtv3Prime_v10.safetensors"
if [ ! -f "$BASE_MODEL" ]; then
  echo "[WARN] Download a Stable Diffusion v1.5 model into:"
  echo "  $SD_DIR/models/Stable-diffusion/"
  echo "  Recommended: epicrealism, anything-v5, or runwayml stable-diffusion-v1-5"
fi

# --- Check 7: Download ControlNet preprocessors ---
CONTROLNET_MODELS="$CONTROLNET_DIR/models"
if [ ! -d "$CONTROLNET_MODELS" ]; then
  echo "[WARN] ControlNet models directory empty:"
  echo "  Download into: $CONTROLNET_MODELS"
  echo "  Required: control_v11p_sd15_canny, control_v11p_sd15_depth, control_v11p_sd15_seg, etc."
fi

# --- Health check ---
echo ""
echo "=================================================="
echo "  Health Check"
echo "=================================================="

if command -v curl &>/dev/null; then
  echo -n "  SD WebUI API: "
  curl -sf "http://127.0.0.1:7860/sdapi/v1/cmd_flags" -o /dev/null && echo "✅ UP" || echo "⏸️ DOWN (run --start to launch)"
  echo -n "  ControlNet:  "
  curl -sf "http://127.0.0.1:7860/controlnet/version" -o /dev/null && echo "✅ UP" || echo "⏸️ DOWN (install extension first)"
fi

echo ""

# --- Launch ---
if [ "${1:-}" = "--start" ]; then
  echo "[LAUNCH] Starting AUTOMATIC1111 WebUI..."
  cd "$SD_DIR"
  # --listen for LAN access, --api for REST endpoints, --enable-insecure-extension-access for ControlNet
  python3 launch.py --listen --api --enable-insecure-extension-access
else
  echo "Run with: ./scripts/sd-webui-check.sh --start   (to launch SD WebUI)"
fi
