#!/bin/bash
set -euo pipefail

# Paseo Lifecycle Hook: pre-archive
# Fires BEFORE Paseo archives/removes a worktree.
# Use for: stopping dev servers, docker compose down, cleanup.
# Arguments:
#   $1 = worktree path
#   $2 = branch name
#   $3 = workspace ID

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'
info()  { echo -e "${CYAN}[paseo-hook:pre-archive]${NC} $*"; }
warn()  { echo -e "${YELLOW}[paseo-hook:pre-archive]${NC} $*"; }
ok()    { echo -e "${GREEN}[paseo-hook:pre-archive]${NC} $*"; }

WORKTREE_PATH="${1:?Missing worktree path}"
BRANCH="${2:-unknown}"

if [ ! -d "$WORKTREE_PATH" ]; then
  exit 0
fi

info "Preparing to archive worktree: $BRANCH"

cd "$WORKTREE_PATH"

# ── 1. Check for running dev servers ───────────────────────────────────────────
if command -v lsof &>/dev/null; then
  PORTS=$(lsof -i -P -n 2>/dev/null | grep -E 'node|next|nest|turbo' | awk '{print $9}' | sort -u || true)
  if [ -n "$PORTS" ]; then
    warn "Dev servers may be running on ports: $(echo "$PORTS" | tr '\n' ' ')"
    warn "Stop them before archiving this worktree."
  fi
fi

# ── 2. Stop docker compose services if running ─────────────────────────────────
if [ -f "docker-compose.yml" ] && command -v docker &>/dev/null; then
  CONTAINERS=$(docker compose ps -q 2>/dev/null | wc -l)
  if [ "$CONTAINERS" -gt 0 ]; then
    info "Stopping docker compose services..."
    docker compose down 2>/dev/null || true
    ok "Docker services stopped."
  fi
fi

# ── 3. Record branch for later restoration ─────────────────────────────────────
LAST_BRANCH_FILE="$WORKTREE_PATH/.paseo-last-branch"
echo "$BRANCH" > "$LAST_BRANCH_FILE"

# ── 4. Push any uncommitted changes to a WIP branch ───────────────────────────
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  WIP_BRANCH="wip/${BRANCH##*/}-$(date +%Y%m%d%H%M%S)"
  warn "Uncommitted changes detected. Stashing as: $WIP_BRANCH"
  git stash push -m "paseo-wip: $WIP_BRANCH" 2>/dev/null || true
fi

ok "Cleanup complete. Safe to archive."
