#!/usr/bin/env bash
# Deploy GitLab CE + Runner on the production server
# Usage: bash scripts/deploy-gitlab.sh
#
# This script:
#   1. Validates Docker Compose availability
#   2. Starts GitLab CE
#   3. Waits for GitLab to be healthy
#   4. Retrieves initial root password
#   5. Registers GitLab Runner
#   6. Prints access details

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# Load env if present
if [ -f ".env.gitlab" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.gitlab
  set +a
fi

GITLAB_URL="${GITLAB_URL:-http://19.16.1.100:8929}"
GITLAB_REGISTRY="${GITLAB_REGISTRY:-http://19.16.1.100:5050}"
ROOT_PASSWORD_FILE="${ROOT_PASSWORD_FILE:-/etc/gitlab/initial_root_password}"

echo "=== HEXA Studio — GitLab CE Deployment ==="
echo "Project root: ${PROJECT_ROOT}"
echo "GitLab URL:   ${GITLAB_URL}"
echo ""

# 1. Verify prerequisites
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker not found. Install Docker first." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose v2 not found. Install Docker Compose v2." >&2
  exit 1
fi

# 2. Generate registry secret if not set
if [ -z "${REGISTRY_HTTP_SECRET:-}" ]; then
  REGISTRY_HTTP_SECRET=$(openssl rand -hex 32)
  echo "Generated REGISTRY_HTTP_SECRET. Persist to .env.gitlab to keep it stable."
fi

# 3. Start GitLab CE
echo "[1/5] Starting GitLab CE..."
docker compose -f docker-compose.gitlab.yml up -d

# 4. Wait for GitLab to be healthy
echo "[2/5] Waiting for GitLab to come online (up to 10 minutes)..."
ATTEMPTS=0
MAX_ATTEMPTS=120
until docker exec hexa-gitlab curl -sf http://localhost:8929/-/health >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "ERROR: GitLab did not become healthy within $((MAX_ATTEMPTS * 5))s." >&2
    echo "Check logs: docker logs hexa-gitlab" >&2
    exit 1
  fi
  printf "."
  sleep 5
done
echo " OK"

# 5. Print initial root password
echo "[3/5] Retrieving initial root password..."
if docker exec hexa-gitlab test -f /etc/gitlab/initial_root_password; then
  ROOT_PWD=$(docker exec hexa-gitlab cat /etc/gitlab/initial_root_password | grep -oP 'Password: \K.*')
  echo "Initial root password: ${ROOT_PWD}"
  echo "Username: root"
  echo "IMPORTANT: Change this password on first login."
else
  echo "GitLab has already been initialized. Use your existing root password."
fi

# 6. Start GitLab Runner
echo "[4/5] Starting GitLab Runner..."
docker compose -f docker-compose.gitlab-runner.yml up -d

# 7. Print access details
echo ""
echo "[5/5] Deployment complete."
echo ""
echo "=== Access Details ==="
echo "GitLab Web UI:    ${GITLAB_URL}"
echo "Container Reg:    ${GITLAB_REGISTRY}"
echo "SSH (git+):       ssh://git@19.16.1.100:2222"
echo ""
echo "=== Next Steps ==="
echo "1. Browse to ${GITLAB_URL} and log in as root"
echo "2. Change the root password"
echo "3. Create the project 'hexa-studio' (or run scripts/migrate-from-github.sh)"
echo "4. Register the GitLab Runner with the project token:"
echo "   docker exec -it hexa-gitlab-runner gitlab-runner register \\"
echo "     --non-interactive \\"
echo "     --url ${GITLAB_URL} \\"
echo "     --registration-token <PROJECT_TOKEN> \\"
echo "     --executor docker \\"
echo "     --docker-image alpine:latest \\"
echo "     --docker-privileged=true \\"
echo "     --docker-volumes '/var/run/docker.sock:/var/run/docker.sock'"
echo "5. Add CI/CD variables (see .env.gitlab.example for mapping from GitHub secrets)"
echo "6. Push the existing repo: git remote set-url origin ssh://git@19.16.1.100:2222/hexa/hexa-studio.git && git push --mirror origin"
