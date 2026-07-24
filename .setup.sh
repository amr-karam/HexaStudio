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
# --legacy-peer-deps matches the documented contract (AGENTS.md) and CI (ci.yml)
# so local installs resolve the same way and avoid peer-dependency conflicts.
npm install --legacy-peer-deps --no-audit --no-fund 2>&1 | tail -1
ok "Dependencies installed."
echo ""

# ── 4. Build ─────────────────────────────────────────────────────────────────
info "Building all workspaces..."
# The Next.js frontend build/typecheck fail without these (see AGENTS.md / ci.yml).
# Respect any values already set; otherwise fall back to the CI defaults.
export SKIP_ENV_VALIDATION="${SKIP_ENV_VALIDATION:-true}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://api.hexastudio.net}"
export NEXT_PUBLIC_CMS_URL="${NEXT_PUBLIC_CMS_URL:-https://cms.hexastudio.net}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://hexastudio.net}"
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
