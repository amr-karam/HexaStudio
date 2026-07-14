#!/bin/bash
set -euo pipefail

# install-hooks.sh — Deploy worktree lifecycle hooks
# Sets core.hooksPath so hooks are version-controlled in scripts/git-hooks/.

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

info() { echo -e "${CYAN}[hooks]${NC} $*"; }
ok()   { echo -e "${GREEN}[hooks]${NC} $*"; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_SOURCE="$ROOT/scripts/git-hooks"
HOOKS_TARGET="$ROOT/.git/hooks"

# ── Validate ─────────────────────────────────────────────────────────────────
if [ ! -d "$HOOKS_SOURCE" ]; then
  echo "Error: hooks source directory not found at $HOOKS_SOURCE"
  exit 1
fi

if [ ! -d "$HOOKS_TARGET" ]; then
  echo "Error: not a git repository (no .git/hooks)"
  exit 1
fi

# ── Install via core.hooksPath ───────────────────────────────────────────────
info "Installing worktree lifecycle hooks..."
git config core.hooksPath "$HOOKS_SOURCE"

# Make all hooks executable
chmod +x "$HOOKS_SOURCE"/*
ok "Made hooks executable."

# ── Merge existing pre-commit (GitWand) ──────────────────────────────────────
if [ -f "$HOOKS_TARGET/pre-commit" ]; then
  EXISTING=$(head -1 "$HOOKS_TARGET/pre-commit" 2>/dev/null || echo "")
  if echo "$EXISTING" | grep -q "gitwand"; then
    info "Detected existing GitWand pre-commit hook."
    info "Our pre-commit hook will delegate to GitWand automatically."
  fi
fi

# ── Report ───────────────────────────────────────────────────────────────────
ok "Hooks installed from: $HOOKS_SOURCE"
ok "core.hooksPath set to: $HOOKS_SOURCE"
echo ""
echo "  Active hooks:"
for hook in "$HOOKS_SOURCE"/*; do
  [ -x "$hook" ] && echo "    • $(basename "$hook")"
done
echo ""
info "To revert: git config --unset core.hooksPath"
