#!/bin/bash
set -euo pipefail

# Paseo Lifecycle Hook: post-archive
# Fires AFTER Paseo archives/removes a worktree.
# Use for: global cleanup, CI notifications, updating indexes.

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
info()  { echo -e "${CYAN}[paseo-hook:post-archive]${NC} $*"; }
ok()    { echo -e "${GREEN}[paseo-hook:post-archive]${NC} $*"; }

WORKTREE_PATH="${1:-}"
BRANCH="${2:-unknown}"
WORKSPACE_ID="${3:-}"

info "Worktree archived: $BRANCH"

# ── 1. Clean up global git refs if branch is a PR branch ───────────────────────
if echo "$BRANCH" | grep -qE '^pr/'; then
  git branch -D "$BRANCH" 2>/dev/null || true
  ok "Cleaned up local PR branch: $BRANCH"
fi

# ── 2. Remove stale worktree path from filesystem if leftover ─────────────────
if [ -n "$WORKTREE_PATH" ] && [ -d "$WORKTREE_PATH" ]; then
  rmdir "$WORKTREE_PATH" 2>/dev/null || true
fi

# ── 3. Notify ─────────────────────────────────────────────────────────────────
if command -v gh &>/dev/null; then
  if echo "$BRANCH" | grep -qE '^pr/'; then
    PR_NUM=$(echo "$BRANCH" | sed 's/^pr\///')
    gh pr comment "$PR_NUM" --body "Worktree archived by Paseo." 2>/dev/null || true
  fi
fi

ok "Post-archive cleanup complete."
