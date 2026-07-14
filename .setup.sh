#!/bin/bash
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${CYAN}[setup]${NC} $*"; }
ok()    { echo -e "${GREEN}[setup]${NC} $*"; }
warn()  { echo -e "${YELLOW}[setup]${NC} $*"; }
err()   { echo -e "${RED}[setup]${NC} $*" >&2; }

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

info "HEXA Studio — Worktree Setup"
info "Root: $ROOT"
echo ""

# ── 1. Prerequisites ──────────────────────────────────────────────────────────
info "Checking prerequisites..."

NODE_REQUIRED=20
if ! command -v node &>/dev/null; then
  err "Node.js is not installed. Install Node.js >= $NODE_REQUIRED first."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt "$NODE_REQUIRED" ]; then
  err "Node.js >= $NODE_REQUIRED required (found v$(node -v)). Upgrade first."
  exit 1
fi
ok "Node.js $(node -v)"

if ! command -v npm &>/dev/null; then
  err "npm is not installed."
  exit 1
fi
ok "npm $(npm -v)"

if ! command -v git &>/dev/null; then
  err "git is not installed."
  exit 1
fi
ok "git $(git --version | cut -d' ' -f3)"

echo ""

# ── 2. Environment ───────────────────────────────────────────────────────────
info "Setting up environment..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    warn "Created .env from .env.example — edit it with your secrets."
  else
    warn "No .env.example found; skipping .env creation."
  fi
else
  ok ".env already exists."
fi
echo ""

# ── 3. Install dependencies ─────────────────────────────────────────────────
info "Installing dependencies..."
npm install --no-audit --no-fund 2>&1 | tail -1
ok "Dependencies installed."
echo ""

# ── 4. Build ─────────────────────────────────────────────────────────────────
info "Building all workspaces..."
npm run build 2>&1 | tail -5
ok "Build complete."
echo ""

# ── 5. Validation ────────────────────────────────────────────────────────────
info "Running validation..."
VALIDATION_OK=true

if npm run lint &>/dev/null; then
  ok "Lint passed."
else
  warn "Lint had issues (non-blocking)."
  VALIDATION_OK=false
fi

if npm run typecheck &>/dev/null; then
  ok "Typecheck passed."
else
  warn "Typecheck had issues (non-blocking)."
  VALIDATION_OK=false
fi

echo ""

# ── Done ─────────────────────────────────────────────────────────────────────
if [ "$VALIDATION_OK" = true ]; then
  ok "HEXA Studio worktree is ready! 🚀"
else
  warn "HEXA Studio worktree setup finished with warnings."
fi
