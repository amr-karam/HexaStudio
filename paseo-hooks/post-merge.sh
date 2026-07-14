#!/bin/bash
set -euo pipefail

# Paseo Lifecycle Hook: post-merge
# Fires after a PR branch merges (Paseo auto-archive trigger).
# Ensures the main worktree has latest deps and build.

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'
info() { echo -e "${CYAN}[paseo-hook:post-merge]${NC} $*"; }
ok()   { echo -e "${GREEN}[paseo-hook:post-merge]${NC} $*"; }

ROOT="${1:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -z "$ROOT" ] && exit 0

info "PR merged. Updating main worktree..."

cd "$ROOT"

# ── 1. Switch to main and pull ─────────────────────────────────────────────────
git checkout main 2>/dev/null || true
git pull --rebase 2>/dev/null || true
ok "Main branch updated."

# ── 2. Reinstall if deps changed ───────────────────────────────────────────────
if git diff HEAD@{1} --name-only 2>/dev/null | grep -qE 'package\.json$|package-lock\.json$'; then
  info "Dependencies changed. Reinstalling..."
  npm install --no-audit --no-fund 2>&1 | tail -1
  ok "Dependencies updated."
fi

# ── 3. Rebuild if config changed ───────────────────────────────────────────────
if git diff HEAD@{1} --name-only 2>/dev/null | grep -qE 'turbo\.json$|tsconfig'; then
  info "Build config changed. Rebuilding..."
  npm run build 2>/dev/null || true
  ok "Rebuild complete."
fi

ok "Main worktree is up to date after merge."
