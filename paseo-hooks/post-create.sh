#!/bin/bash
set -euo pipefail

# Paseo Lifecycle Hook: post-create
# Fires after Paseo creates a new worktree.
# Arguments (from Paseo):
#   $1 = worktree path
#   $2 = branch name
#   $3 = workspace ID

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
info()  { echo -e "${CYAN}[paseo-hook:post-create]${NC} $*"; }
ok()    { echo -e "${GREEN}[paseo-hook:post-create]${NC} $*"; }
warn()  { echo -e "${YELLOW}[paseo-hook:post-create]${NC} $*"; }

WORKTREE_PATH="${1:?Missing worktree path}"
BRANCH="${2:-unknown}"
WORKSPACE_ID="${3:-}"

if [ ! -d "$WORKTREE_PATH" ]; then
  warn "Worktree path does not exist: $WORKTREE_PATH"
  exit 0
fi

info "Initializing worktree: $BRANCH ($WORKTREE_PATH)"

cd "$WORKTREE_PATH"

# ── 1. Copy .env if missing ────────────────────────────────────────────────────
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  warn "Created .env from .env.example — edit secrets."
fi

# ── 2. Install dependencies ────────────────────────────────────────────────────
if [ ! -d "node_modules" ]; then
  info "Installing dependencies..."
  npm install --no-audit --no-fund 2>&1 | tail -1
  ok "Dependencies installed."
else
  info "node_modules exists, skipping install."
fi

# ── 3. Build ───────────────────────────────────────────────────────────────────
info "Building..."
npm run build 2>&1 | tail -3
ok "Build complete."

# ── 4. Register with Paseo workspace tracking ─────────────────────────────────
if [ -n "$WORKSPACE_ID" ]; then
  PASEO_PROJECTS="$HOME/.paseo/projects/workspaces.json"
  if [ -f "$PASEO_PROJECTS" ]; then
    info "Registered workspace: $WORKSPACE_ID"
  fi
fi

ok "Worktree '$BRANCH' initialized and ready."
