#!/bin/bash
set -euo pipefail

# install.sh — Register Paseo worktree lifecycle hooks with the Paseo daemon.
#
# Writes hooks into Paseo's program config (~/.paseo/config.json) and
# symlinks hook scripts so Paseo's daemon can fire them natively.

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${CYAN}[paseo-hooks]${NC} $*"; }
ok()    { echo -e "${GREEN}[paseo-hooks]${NC} $*"; }
warn()  { echo -e "${YELLOW}[paseo-hooks]${NC} $*"; }
err()   { echo -e "${RED}[paseo-hooks]${NC} $*" >&2; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASEO_CONFIG="$HOME/.paseo/config.json"
PASEO_HOOKS_DIR="$HOME/.paseo/hooks"

# ── 1. Write hook scripts directly into Paseo's hooks directory ───────────────
info "Writing hooks into Paseo daemon program ($PASEO_HOOKS_DIR)..."
mkdir -p "$PASEO_HOOKS_DIR/worktree"
mkdir -p "$PASEO_HOOKS_DIR/agent"

for hook in post-create pre-archive post-archive post-merge; do
  src="$ROOT/paseo-hooks/$hook.sh"
  dst="$PASEO_HOOKS_DIR/worktree/$hook"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
    chmod +x "$dst"
    ok "  worktree/$hook"
  fi
done

# Write runner
cp "$ROOT/paseo-hooks/paseo-worktree.sh" "$PASEO_HOOKS_DIR/worktree-runner.sh"
chmod +x "$PASEO_HOOKS_DIR/worktree-runner.sh"

# Copy orchestration preferences
cp "$ROOT/paseo-hooks/orchestration-preferences.json" "$PASEO_HOOKS_DIR/orchestration-preferences.json" 2>/dev/null || true

# ── 2. Register hooks in Paseo daemon config ──────────────────────────────────
if [ -f "$PASEO_CONFIG" ]; then
  info "Registering hooks in Paseo daemon config ($PASEO_CONFIG)..."

  # Use Python to safely merge the hooks config into Paseo's JSON
  python3 -c "
import json, sys

with open('$PASEO_CONFIG', 'r') as f:
    config = json.load(f)

hooks_config = {
    'enabled': True,
    'worktree': {
        'runner': 'hooks/worktree-runner.sh',
        'events': {
            'post-create': 'hooks/worktree/post-create',
            'pre-archive': 'hooks/worktree/pre-archive',
            'post-archive': 'hooks/worktree/post-archive',
            'post-merge': 'hooks/worktree/post-merge'
        }
    },
    'agent': {
        'dir': 'hooks/agent'
    }
}

config.setdefault('daemon', {})['hooks'] = hooks_config

with open('$PASEO_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)
" 2>&1 && ok "Paseo daemon config updated." || warn "Could not update config.json (python3 not found)."
fi

# ── 3. Install git hooks via core.hooksPath ────────────────────────────────────
if [ -d "$ROOT/scripts/git-hooks" ]; then
  info "Installing git hooks..."
  git config core.hooksPath "$ROOT/scripts/git-hooks"
  chmod +x "$ROOT/scripts/git-hooks"/*
  ok "Git hooks installed (core.hooksPath = $ROOT/scripts/git-hooks)."
fi

# ── 4. Report ──────────────────────────────────────────────────────────────────
echo ""
ok "Paseo worktree lifecycle hooks installed in daemon program."
echo ""
echo "  Config:   $PASEO_CONFIG  (daemon.hooks)"
echo "  Scripts:  $PASEO_HOOKS_DIR/worktree/"
echo ""
echo "  Event              Hook Script (in Paseo daemon)"
echo "  ─────────────────  ──────────────────────────────"
echo "  post-create        $PASEO_HOOKS_DIR/worktree/post-create"
echo "  pre-archive        $PASEO_HOOKS_DIR/worktree/pre-archive"
echo "  post-archive       $PASEO_HOOKS_DIR/worktree/post-archive"
echo "  post-merge         $PASEO_HOOKS_DIR/worktree/post-merge"
echo ""
info "Git hooks (post-checkout, post-merge, pre-commit, commit-msg)"
info "  Source: scripts/git-hooks/"
info "  Deployed via: core.hooksPath"
echo ""
info "To uninstall: paseo-hooks/uninstall.sh"
