#!/bin/bash
set -euo pipefail

# worktree-add.sh — Worktree creation with lifecycle automation
# Wraps `git worktree add` and auto-runs .setup.sh in the new worktree.
#
# Usage:
#   bash scripts/worktree-add.sh <branch> [<path>] [<base-branch>]
#   bash scripts/worktree-add.sh --pr <pr-number>
#
# Examples:
#   bash scripts/worktree-add.sh feature/ai-search
#   bash scripts/worktree-add.sh fix/odo-502 ./worktrees/fix-odo main
#   bash scripts/worktree-add.sh --pr 42

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${CYAN}[worktree]${NC} $*"; }
ok()    { echo -e "${GREEN}[worktree]${NC} $*"; }
warn()  { echo -e "${YELLOW}[worktree]${NC} $*"; }
err()   { echo -e "${RED}[worktree]${NC} $*" >&2; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── Parse args ───────────────────────────────────────────────────────────────
if [ "${1:-}" = "--pr" ] || [ "${1:-}" = "-p" ]; then
  PR_NUM="${2:?Usage: $0 --pr <number>}"
  BRANCH="pr/$PR_NUM"
  WORKTREE_PATH="$ROOT/../worktrees/$BRANCH"
  BASE_BRANCH="main"

  info "Creating worktree for PR #$PR_NUM..."

  # Fetch PR branch
  git fetch origin "pull/$PR_NUM/head:$BRANCH"
  git worktree add "$WORKTREE_PATH" "$BRANCH"
else
  BRANCH="${1:?Usage: $0 <branch> [<path>] [<base-branch>]}"
  WORKTREE_PATH="${2:-$ROOT/../worktrees/$BRANCH}"
  BASE_BRANCH="${3:-}"

  info "Creating worktree for branch '$BRANCH'..."

  # Ensure base branch is up to date
  if [ -n "$BASE_BRANCH" ]; then
    git fetch origin "$BASE_BRANCH" 2>/dev/null || true
    git worktree add -b "$BRANCH" "$WORKTREE_PATH" "$BASE_BRANCH"
  else
    git worktree add -b "$BRANCH" "$WORKTREE_PATH"
  fi
fi

ok "Worktree created at: $WORKTREE_PATH"

# ── Push branch upstream ─────────────────────────────────────────────────────
git push -u origin "$BRANCH" 2>/dev/null && ok "Branch pushed to origin." || true

echo ""

# ── Run setup in new worktree ────────────────────────────────────────────────
if [ -f "$WORKTREE_PATH/.setup.sh" ]; then
  info "Running worktree setup..."
  (cd "$WORKTREE_PATH" && bash .setup.sh)
else
  info "No .setup.sh found; running minimal setup..."
  (cd "$WORKTREE_PATH" && npm install --no-audit --no-fund && npm run build 2>/dev/null || true)
fi

ok "Worktree '$BRANCH' is ready!"
info "  Path: $WORKTREE_PATH"
info "  Switch: cd $WORKTREE_PATH"
