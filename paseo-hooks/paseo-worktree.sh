#!/bin/bash
set -euo pipefail

# paseo-worktree.sh — Paseo worktree lifecycle manager
# Wraps Paseo worktree operations with lifecycle hooks.
#
# Usage:
#   paseo-hooks/paseo-worktree.sh create <branch> [<path>] [<base>]
#   paseo-hooks/paseo-worktree.sh create-pr <pr-number>
#   paseo-hooks/paseo-worktree.sh archive <branch-or-path>
#   paseo-hooks/paseo-worktree.sh list

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${CYAN}[paseo-worktree]${NC} $*"; }
ok()    { echo -e "${GREEN}[paseo-worktree]${NC} $*"; }
warn()  { echo -e "${YELLOW}[paseo-worktree]${NC} $*"; }
err()   { echo -e "${RED}[paseo-worktree]${NC} $*" >&2; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$(dirname "$0")"
PASEO_CLI="${PASEO_CLI:-paseo}"

# Resolve Paseo CLI path
if ! command -v "$PASEO_CLI" &>/dev/null; then
  for candidate in \
    "/Applications/Paseo.app/Contents/Resources/bin/paseo" \
    "$HOME/.local/bin/paseo" \
    "C:/Program Files/Paseo/resources/bin/paseo.cmd"; do
    if [ -f "$candidate" ]; then
      PASEO_CLI="$candidate"
      break
    fi
  done
fi

run_hook() {
  local hook="$1"
  shift
  local script="$HOOKS_DIR/$hook.sh"
  if [ -f "$script" ] && [ -x "$script" ]; then
    info "Hook: $hook"
    bash "$script" "$@"
  fi
}

# ───────────────────────────────────────────────────────────────────────────────
# COMMAND: create
# ───────────────────────────────────────────────────────────────────────────────
cmd_create() {
  local BRANCH="${1:?Usage: create <branch> [<path>] [<base>]}"
  local WORKTREE_PATH="${2:-$ROOT/../worktrees/$BRANCH}"
  local BASE_BRANCH="${3:-}"

  info "Creating worktree for branch '$BRANCH'..."

  if [ -n "$BASE_BRANCH" ]; then
    git fetch origin "$BASE_BRANCH" 2>/dev/null || true
    git worktree add -b "$BRANCH" "$WORKTREE_PATH" "$BASE_BRANCH"
  else
    git worktree add -b "$BRANCH" "$WORKTREE_PATH"
  fi

  git push -u origin "$BRANCH" 2>/dev/null || true
  ok "Worktree created at: $WORKTREE_PATH"

  run_hook post-create "$WORKTREE_PATH" "$BRANCH" ""
}

# ───────────────────────────────────────────────────────────────────────────────
# COMMAND: create-pr
# ───────────────────────────────────────────────────────────────────────────────
cmd_create_pr() {
  local PR_NUM="${1:?Usage: create-pr <pr-number>}"
  local BRANCH="pr/$PR_NUM"
  local WORKTREE_PATH="$ROOT/../worktrees/$BRANCH"

  info "Creating worktree for PR #$PR_NUM..."

  git fetch origin "pull/$PR_NUM/head:$BRANCH"
  git worktree add "$WORKTREE_PATH" "$BRANCH"
  ok "Worktree created at: $WORKTREE_PATH"

  run_hook post-create "$WORKTREE_PATH" "$BRANCH" ""
}

# ───────────────────────────────────────────────────────────────────────────────
# COMMAND: archive
# ───────────────────────────────────────────────────────────────────────────────
cmd_archive() {
  local TARGET="${1:?Usage: archive <branch-or-path>}"
  local WORKTREE_PATH=""
  local BRANCH=""

  # Resolve branch/path
  if [ -d "$TARGET" ]; then
    WORKTREE_PATH="$TARGET"
    BRANCH=$(cd "$WORKTREE_PATH" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  else
    BRANCH="$TARGET"
    WORKTREE_PATH=$(git worktree list | awk -v b="$BRANCH" '$3 == b { print $1; exit }' 2>/dev/null || echo "")
    if [ -z "$WORKTREE_PATH" ]; then
      WORKTREE_PATH="$ROOT/../worktrees/$BRANCH"
    fi
  fi

  info "Archiving worktree: $BRANCH ($WORKTREE_PATH)"

  # Pre-archive hook
  run_hook pre-archive "$WORKTREE_PATH" "$BRANCH" ""

  # Remove via git
  if [ -d "$WORKTREE_PATH" ]; then
    git worktree remove "$WORKTREE_PATH" 2>/dev/null || {
      warn "git worktree remove failed, trying --force..."
      git worktree remove --force "$WORKTREE_PATH" 2>/dev/null || true
    }
  fi

  # Prune stale worktree references
  git worktree prune 2>/dev/null || true

  ok "Worktree removed."

  # Post-archive hook
  run_hook post-archive "$WORKTREE_PATH" "$BRANCH" ""
}

# ───────────────────────────────────────────────────────────────────────────────
# COMMAND: list
# ───────────────────────────────────────────────────────────────────────────────
cmd_list() {
  echo ""
  echo "Paseo Worktrees (HEXA Studio)"
  echo "───────────────────────────────────────────────────"
  git worktree list | while read -r line; do
    path=$(echo "$line" | awk '{print $1}')
    branch=$(echo "$line" | awk '{print $3}')
    status=""
    if [ ! -d "$path/node_modules" ]; then
      status=" ⚠  uninitialized"
    fi
    echo "  $branch  $path$status"
  done
  echo ""
}

# ───────────────────────────────────────────────────────────────────────────────
# Main
# ───────────────────────────────────────────────────────────────────────────────
case "${1:-help}" in
  create)
    shift
    cmd_create "$@"
    ;;
  create-pr)
    shift
    cmd_create_pr "$@"
    ;;
  archive)
    shift
    cmd_archive "$@"
    ;;
  list|ls)
    cmd_list
    ;;
  help|--help|-h)
    echo ""
    echo "Paseo Worktree Lifecycle Manager"
    echo ""
    echo "  create <branch> [<path>] [<base>]   Create worktree with lifecycle hooks"
    echo "  create-pr <number>                   Create worktree from PR"
    echo "  archive <branch-or-path>             Archive worktree with lifecycle hooks"
    echo "  list                                 List all worktrees"
    echo ""
    ;;
  *)
    err "Unknown command: $1"
    exit 1
    ;;
esac
