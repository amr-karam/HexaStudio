#!/bin/bash
set -euo pipefail

# uninstall.sh — Remove Paseo worktree lifecycle hooks from the Paseo daemon.

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

info() { echo -e "${CYAN}[paseo-hooks]${NC} $*"; }
ok()   { echo -e "${GREEN}[paseo-hooks]${NC} $*"; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASEO_CONFIG="$HOME/.paseo/config.json"

# ── 1. Remove hooks from Paseo daemon config ──────────────────────────────────
if [ -f "$PASEO_CONFIG" ]; then
  info "Removing hooks from Paseo daemon config..."
  python3 -c "
import json

with open('$PASEO_CONFIG', 'r') as f:
    config = json.load(f)

if 'hooks' in config.get('daemon', {}):
    del config['daemon']['hooks']

with open('$PASEO_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)
" 2>&1 && ok "Paseo daemon hooks config removed." || warn "Could not update config.json."
fi

# ── 2. Remove hook scripts from Paseo's hook directory ─────────────────────────
PASEO_HOOKS_DIR="$HOME/.paseo/hooks"
if [ -d "$PASEO_HOOKS_DIR/worktree" ]; then
  rm -rf "$PASEO_HOOKS_DIR/worktree"
  ok "Removed $PASEO_HOOKS_DIR/worktree/"
fi

if [ -f "$PASEO_HOOKS_DIR/worktree-runner.sh" ]; then
  rm "$PASEO_HOOKS_DIR/worktree-runner.sh"
  ok "Removed worktree-runner.sh"
fi

if [ -f "$PASEO_HOOKS_DIR/orchestration-preferences.json" ]; then
  rm "$PASEO_HOOKS_DIR/orchestration-preferences.json"
fi

# ── 3. Unset core.hooksPath ───────────────────────────────────────────────────
CURRENT_HOOKS=$(git config core.hooksPath 2>/dev/null || echo "")
if [ "$CURRENT_HOOKS" = "$ROOT/scripts/git-hooks" ]; then
  git config --unset core.hooksPath
  ok "Restored default git hooks path."
fi

ok "Paseo worktree lifecycle hooks uninstalled from daemon."
