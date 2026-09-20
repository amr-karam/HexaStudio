#!/usr/bin/env bash
set -euo pipefail

# Sentry DSN Setup Script
#
# Guides the user through setting up Sentry error tracking.
#   - Without arguments: prints instructions for manual setup
#   - With SENTRY_AUTH_TOKEN: creates a Sentry project and configures DSNs
#
# Usage:
#   bash scripts/setup-sentry.sh                    # Just print instructions
#   bash scripts/setup-sentry.sh --token YOUR_TOKEN  # Auto-configure via Sentry API
#
# Environment variables:
#   SENTRY_AUTH_TOKEN - Sentry auth token (required for auto-setup)
#   SENTRY_ORG        - Sentry organization slug (default: hexastudio)
#   SENTRY_PROJECT    - Sentry project slug (default: hexa-studio)

SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN:-}"
SENTRY_ORG="${SENTRY_ORG:-hexastudio}"
SENTRY_PROJECT="${SENTRY_PROJECT:-hexa-studio}"

# Parse --token flag
for arg in "$@"; do
  case "$arg" in
    --token=*) SENTRY_AUTH_TOKEN="${arg#*=}" ;;
    --token) shift; SENTRY_AUTH_TOKEN="${1:-}" ;;
  esac
done

print_instructions() {
  echo "=============================================="
  echo "  Sentry DSN Setup Instructions"
  echo "=============================================="
  echo ""
  echo "1. Go to https://sentry.io and log in or sign up."
  echo ""
  echo "2. Create a new project for your platform:"
  echo "   Platform: Next.js"
  echo "   Project name: hexa-studio"
  echo ""
  echo "3. Copy your DSN (starts with https://...@...ingest.sentry.io/...)"
  echo ""
  echo "4. Add it to your .env file:"
  echo ""
  echo "   NEXT_PUBLIC_SENTRY_DSN=<your-dsn>"
  echo "   SENTRY_DSN=<your-dsn>"
  echo ""
  echo "5. Optionally create a Sentry auth token for source maps:"
  echo "   Settings > Developer Settings > Auth Tokens"
  echo "   Add to CI secrets as SENTRY_AUTH_TOKEN"
  echo ""
  echo "6. Verify with:"
  echo "   npm run build --workspace=apps/frontend"
  echo "   npm run typecheck --workspace=apps/frontend"
  echo ""
  echo "=============================================="
}

auto_setup() {
  if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo "❌ SENTRY_AUTH_TOKEN is required for auto-setup."
    echo "   Get one from https://sentry.io/settings/account/api/auth-tokens/"
    echo "   Requires: project:write, project:releases"
    exit 1
  fi

  echo "🔧 Auto-configuring Sentry..."

  # Check if project exists, create if not
  PROJECT_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/" \
    -H "Authorization: Bearer $SENTRY_AUTH_TOKEN")

  if [ "$PROJECT_CHECK" = "404" ]; then
    echo "📦 Creating Sentry project '$SENTRY_PROJECT'..."
    curl -s -X POST "https://sentry.io/api/0/teams/$SENTRY_ORG/teams/" \
      -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"$SENTRY_PROJECT\",\"platform\":\"javascript-nextjs\"}" > /dev/null
  fi

  # Fetch DSN
  echo "📡 Fetching DSN for project '$SENTRY_PROJECT'..."
  DSN_RESPONSE=$(curl -s "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/" \
    -H "Authorization: Bearer $SENTRY_AUTH_TOKEN")

  DSN=$(echo "$DSN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('dsn',''))" 2>/dev/null || echo "")

  if [ -z "$DSN" ]; then
    echo "❌ Failed to fetch DSN. Response:"
    echo "$DSN_RESPONSE" | head -5
    exit 1
  fi

  echo ""
  echo "✅ DSN obtained: $DSN"
  echo ""
  echo "Add to your .env file:"
  echo ""
  echo "NEXT_PUBLIC_SENTRY_DSN=$DSN"
  echo "SENTRY_DSN=$DSN"
  echo ""
  echo "Or run:"
  echo "  echo 'NEXT_PUBLIC_SENTRY_DSN=$DSN' >> .env"
  echo "  echo 'SENTRY_DSN=$DSN' >> .env"
}

if [ -n "$SENTRY_AUTH_TOKEN" ]; then
  auto_setup
else
  print_instructions
fi
