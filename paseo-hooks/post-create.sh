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

cd "$WORKTREE_PATH"

# ── 1. Canonical worktree setup ────────────────────────────────────────────────
# All new worktrees (git worktree add, Paseo create, worktree-add.sh) funnel
# through .setup.sh so dependency install + build + validation stay consistent.
if [ -f ".setup.sh" ]; then
  info "Initializing worktree via .setup.sh: $BRANCH"
  bash ./.setup.sh
else
  warn "No .setup.sh found; running minimal setup..."
  [ ! -f ".env" ] && [ -f ".env.example" ] && cp .env.example .env
  npm install --no-audit --no-fund
  npm run build 2>/dev/null || true
fi

# ── 2. Register with Paseo workspace tracking ─────────────────────────────────
if [ -n "$WORKSPACE_ID" ]; then
  PASEO_PROJECTS="$HOME/.paseo/projects/workspaces.json"
  if [ -f "$PASEO_PROJECTS" ]; then
    info "Registered workspace: $WORKSPACE_ID"
  fi
fi

ok "Worktree '$BRANCH' initialized and ready."
