# HEXA Studio — Migration Script: GitHub → GitLab CE
# ============================================================
# Run this AFTER GitLab CE is up and you've logged in as root.
# It will:
#   1. Create the project via GitLab API
#   2. Add the GitLab server as a new remote
#   3. Push all branches, tags, and history (mirror)
#   4. Clean up the old GitHub remote
#
# Usage: GITLAB_URL=http://gitlab:8929 GITLAB_TOKEN=glpat-xxx bash scripts/migrate-from-github.sh

set -euo pipefail

GITLAB_URL="${GITLAB_URL:-http://19.16.1.100:8929}"
GITLAB_TOKEN="${GITLAB_TOKEN:-}"
GITLAB_SSH_PORT="${GITLAB_SSH_PORT:-2222}"
PROJECT_PATH="${PROJECT_PATH:-hexa/hexa-studio}"
PROJECT_NAME="${PROJECT_NAME:-hexa-studio}"
PROJECT_NAMESPACE="${PROJECT_NAMESPACE:-hexa}"

if [ -z "$GITLAB_TOKEN" ]; then
  echo "ERROR: GITLAB_TOKEN not set. Create a Personal Access Token with 'api' scope in GitLab."
  exit 1
fi

echo "=== HEXA Studio — GitHub to GitLab CE Migration ==="
echo "GitLab Server: ${GITLAB_URL}"
echo "Target Project: ${PROJECT_PATH}"
echo ""

# 1. Create the project (if it doesn't exist)
echo "[1/4] Creating GitLab project..."
HTTP_CODE=$(curl -s -o /tmp/gitlab-create.json -w "%{http_code}" \
  -X POST "${GITLAB_URL}/api/v4/projects" \
  -H "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${PROJECT_NAME}\",
    \"path\": \"${PROJECT_NAME}\",
    \"namespace_id\": \"${PROJECT_NAMESPACE}\",
    \"visibility\": \"private\",
    \"default_branch\": \"main\",
    \"issues_enabled\": true,
    \"merge_requests_enabled\": true,
    \"wiki_enabled\": false,
    \"snippets_enabled\": false,
    \"container_registry_enabled\": true
  }")

if [ "$HTTP_CODE" = "201" ]; then
  echo "Project created."
elif [ "$HTTP_CODE" = "400" ] && grep -q "has already been taken" /tmp/gitlab-create.json; then
  echo "Project already exists — continuing."
else
  echo "ERROR: project creation failed (HTTP $HTTP_CODE)."
  cat /tmp/gitlab-create.json
  exit 1
fi

# 2. Add GitLab remote
echo "[2/4] Adding GitLab remote..."
GITLAB_REPO_URL="ssh://git@19.16.1.100:${GITLAB_SSH_PORT}/${PROJECT_PATH}.git"
git remote add gitlab "$GITLAB_REPO_URL" 2>/dev/null || git remote set-url gitlab "$GITLAB_REPO_URL"

# 3. Push everything (mirror)
echo "[3/4] Pushing all branches, tags, and history..."
git push --mirror gitlab

# 4. Update default remote
echo "[4/4] Promoting GitLab as default remote..."
git remote remove origin 2>/dev/null || true
git remote rename gitlab origin

echo ""
echo "=== Migration complete ==="
echo "New remote: ${GITLAB_REPO_URL}"
echo "Web UI:     ${GITLAB_URL}/${PROJECT_PATH}"
echo ""
echo "Next steps:"
echo "  1. Set CI/CD variables in GitLab (production/staging SSH keys, SNYK_TOKEN, etc.)"
echo "  2. Register the GitLab Runner with the project token"
echo "  3. Trigger a pipeline to validate the migration"
echo "  4. Update local references: README.md, CONTRIBUTING.md, docs/"
