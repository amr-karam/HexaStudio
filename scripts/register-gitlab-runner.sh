#!/usr/bin/env bash
# Register the GitLab Runner against the local GitLab CE instance.
# Usage: GITLAB_URL=http://19.16.1.100:8929 \
#        GITLAB_TOKEN=glpat-xxx \
#        bash scripts/register-gitlab-runner.sh
#
# Prerequisites:
#   - GitLab CE is running (scripts/deploy-gitlab.sh already executed)
#   - You have a GitLab Personal Access Token with 'api' scope
#   - You have a runner registration token (from project/group settings)

set -euo pipefail

GITLAB_URL="${GITLAB_URL:-http://19.16.1.100:8929}"
RUNNER_NAME="${RUNNER_NAME:-hexa-runner}"
RUNNER_DESCRIPTION="${RUNNER_DESCRIPTION:-HEXA Studio Docker runner}"
RUNNER_TOKEN="${RUNNER_TOKEN:-}"
REGISTRATION_TYPE="${REGISTRATION_TYPE:-project}" # project | group | instance
DOCKER_IMAGE="${DOCKER_IMAGE:-alpine:latest}"
TAG_LIST="${TAG_LIST:-docker,linux,hexa}"

if [ -z "$RUNNER_TOKEN" ]; then
  echo "ERROR: RUNNER_TOKEN not set. Get it from:"
  echo "  - Project: ${GITLAB_URL}/<project>/-/settings/ci_cd#js-runners-settings"
  echo "  - Group:   ${GITLAB_URL}/groups/<group>/-/runners"
  echo "  - Instance: ${GITLAB_URL}/admin/runners"
  exit 1
fi

echo "=== HEXA Studio — GitLab Runner Registration ==="
echo "GitLab URL:    ${GITLAB_URL}"
echo "Runner Name:   ${RUNNER_NAME}"
echo "Scope:         ${REGISTRATION_TYPE}"
echo ""

# Verify the runner container is running
if ! docker ps --format '{{.Names}}' | grep -q hexa-gitlab-runner; then
  echo "ERROR: Container 'hexa-gitlab-runner' is not running."
  echo "Start it with: docker compose -f docker-compose.gitlab-runner.yml up -d"
  exit 1
fi

# Register the runner
echo "[1/3] Registering runner..."
docker exec hexa-gitlab-runner \
  gitlab-runner register \
  --non-interactive \
  --name "${RUNNER_NAME}" \
  --description "${RUNNER_DESCRIPTION}" \
  --url "${GITLAB_URL}" \
  --registration-token "${RUNNER_TOKEN}" \
  --executor docker \
  --docker-image "${DOCKER_IMAGE}" \
  --docker-privileged=true \
  --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" \
  --docker-volumes "/cache" \
  --docker-network-mode "hexa-gitlab-net" \
  --tag-list "${TAG_LIST}" \
  --run-untagged=false \
  --locked=false \
  --access-level="not_protected"

# Verify registration
echo "[2/3] Verifying runner..."
sleep 3
if docker exec hexa-gitlab-runner gitlab-runner list 2>&1 | grep -q "${RUNNER_NAME}"; then
  echo "Runner registered successfully."
else
  echo "WARNING: Runner not visible in list. Check logs:"
  echo "  docker logs hexa-gitlab-runner"
  exit 1
fi

# Sanity check — can the runner reach services?
echo "[3/3] Connectivity check..."
docker exec hexa-gitlab-runner sh -c "
  apk add --no-cache curl >/dev/null 2>&1 || true
  curl -sf ${GITLAB_URL}/-/health && echo 'GitLab reachable.' || echo 'WARNING: GitLab not reachable from runner.'
" || true

echo ""
echo "=== Registration complete ==="
echo "The runner '${RUNNER_NAME}' is now available for CI/CD jobs."
echo "View it at: ${GITLAB_URL}/admin/runners"
echo ""
echo "Next steps:"
echo "  1. Add the '${RUNNER_NAME}' tag to jobs in .gitlab-ci.yml that need it"
echo "  2. Trigger a pipeline to verify the runner picks up jobs"
echo "  3. Monitor runner status: docker logs -f hexa-gitlab-runner"
