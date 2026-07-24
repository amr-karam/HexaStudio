#!/usr/bin/env bash
# Set up GitLab CI/CD variables for the HEXA Studio project via API.
# Mirrors the secrets that were previously set in GitHub Actions.
# Usage: GITLAB_URL=http://19.16.1.100:8929 \
#        GITLAB_TOKEN=glpat-xxx \
#        PROJECT_PATH=hexa/hexa-studio \
#        bash scripts/setup-gitlab-variables.sh
#
# Reads credentials from .env.gitlab if present, or from environment.

set -euo pipefail

GITLAB_URL="${GITLAB_URL:-http://19.16.1.100:8929}"
GITLAB_TOKEN="${GITLAB_TOKEN:-}"
PROJECT_PATH="${PROJECT_PATH:-hexa/hexa-studio}"
VARIABLES_FILE="${VARIABLES_FILE:-.env.gitlab}"

# URL-encode a value (handles slashes, equals, etc.)
urlencode() {
  python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$1"
}

# Load variables from .env.gitlab if it exists
if [ -f "$VARIABLES_FILE" ]; then
  echo "Loading variables from ${VARIABLES_FILE}..."
  # shellcheck disable=SC1090
  set -a
  source "$VARIABLES_FILE"
  set +a
fi

if [ -z "$GITLAB_TOKEN" ]; then
  echo "ERROR: GITLAB_TOKEN not set. Create a Personal Access Token with 'api' scope."
  exit 1
fi

# Look up project ID from path
echo "=== HEXA Studio — CI/CD Variables Setup ==="
echo "GitLab URL: ${GITLAB_URL}"
echo "Project:    ${PROJECT_PATH}"
echo ""

PROJECT_ID=$(curl -sf \
  -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
  "${GITLAB_URL}/api/v4/projects/$(urlencode "${PROJECT_PATH}")" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: Cannot find project '${PROJECT_PATH}' in GitLab."
  exit 1
fi
echo "Project ID: ${PROJECT_ID}"
echo ""

# Variables to set. Format: KEY|VALUE|KIND|ENVIRONMENT_SCOPE|PROTECTED|MASKED
# KIND: env_var | file | variable
# PROTECTED: true | false
# MASKED: true | false (only for env_var)
VARIABLES=(
  # Build-time public env vars (must be visible to Docker buildkit)
  "NEXT_PUBLIC_API_URL|https://api.hexastudio.net|env_var|*|false|false"
  "NEXT_PUBLIC_CMS_URL|https://cms.hexastudio.net|env_var|*|false|false"
  "NEXT_PUBLIC_SITE_URL|https://hexastudio.net|env_var|*|false|false"
  "NEXT_PUBLIC_STRAPI_API_URL|https://cms.hexastudio.net|env_var|*|false|false"
  "SKIP_ENV_VALIDATION|true|env_var|*|false|false"
  # Production deploy secrets
  "PROD_SERVER_IP|19.16.1.100|env_var|production|true|true"
  "PROD_SERVER_USER|root|env_var|production|true|false"
  "SSH_PRIVATE_KEY||file|production|true|false"
  # Staging deploy secrets
  "STAGING_SERVER_IP||env_var|staging|true|true"
  "STAGING_SERVER_USER|root|env_var|staging|true|false"
  "STAGING_SSH_KEY||file|staging|true|false"
  # Security scanning
  "SNYK_TOKEN||env_var|*|true|true"
)

# Track results
CREATED=0
UPDATED=0
SKIPPED=0
FAILED=0

for VAR_DEF in "${VARIABLES[@]}"; do
  IFS='|' read -r KEY VALUE KIND SCOPE PROTECTED MASKED <<< "$VAR_DEF"

  # Check if the variable already exists
  EXISTING=$(curl -sf \
    -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
    "${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/variables/${KEY}" \
    || echo "")

  # Skip if value is empty AND no existing variable
  if [ -z "$VALUE" ] && [ -z "$EXISTING" ]; then
    echo "  [SKIP] ${KEY} (no value provided — set manually in GitLab UI for file/masked vars)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # If value is empty, preserve existing (skip update)
  if [ -z "$VALUE" ]; then
    echo "  [SKIP] ${KEY} (value empty, existing preserved)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # POST creates a new variable; PUT updates existing
  METHOD="POST"
  ENDPOINT="/variables"
  if [ -n "$EXISTING" ]; then
    METHOD="PUT"
    ENDPOINT="/variables/${KEY}"
  fi

  HTTP_CODE=$(curl -s -o /tmp/gitlab-var-resp.json -w "%{http_code}" \
    -X "${METHOD}" \
    -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"${KEY}\",
      \"value\": \"${VALUE}\",
      \"variable_type\": \"${KIND}\",
      \"environment_scope\": \"${SCOPE}\",
      \"protected\": ${PROTECTED},
      \"masked\": ${MASKED}
    }" \
    "${GITLAB_URL}/api/v4/projects/${PROJECT_ID}${ENDPOINT}")

  if [ "$HTTP_CODE" = "201" ]; then
    echo "  [+] Created ${KEY}"
    CREATED=$((CREATED + 1))
  elif [ "$HTTP_CODE" = "200" ]; then
    echo "  [~] Updated ${KEY}"
    UPDATED=$((UPDATED + 1))
  else
    echo "  [!] Failed ${KEY} (HTTP ${HTTP_CODE})"
    cat /tmp/gitlab-var-resp.json
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "=== Summary ==="
echo "Created: ${CREATED}, Updated: ${UPDATED}, Skipped: ${SKIPPED}, Failed: ${FAILED}"
echo ""
echo "Manual setup required in GitLab UI (${GITLAB_URL}/${PROJECT_PATH}/-/settings/ci_cd):"
echo "  - SSH_PRIVATE_KEY (file, production)"
echo "  - STAGING_SERVER_IP (env, staging)"
echo "  - STAGING_SERVER_USER (env, staging)"
echo "  - STAGING_SSH_KEY (file, staging)"
echo "  - SNYK_TOKEN (env, masked)"
echo ""
echo "Enable Dependency Scanning in: CI/CD → Security & Compliance → Dependency Scanning"
