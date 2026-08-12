#!/usr/bin/env bash
# =============================================================================
# HEXA Studio — GitLab Best Settings Deployment Script
# =============================================================================
# Run this script on the GitLab server (19.16.1.100) to deploy all optimizations
#
# Usage: bash deploy-gitlab-best-settings.sh
#
# This script:
#   1. Backs up current configurations
#   2. Deploys optimized GitLab configuration
#   3. Deploys optimized Runner configuration
#   4. Restarts services
#   5. Re-registers runner
#   6. Verifies deployment
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  HEXA Studio — GitLab Best Settings Deployment${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""

# ============================================================================
# STEP 1: Validate Environment
# ============================================================================
echo -e "${YELLOW}[1/8] Validating environment...${NC}"

if ! command -v docker >/dev/null 2>&1; then
  echo -e "${RED}ERROR: Docker not found. Install Docker first.${NC}" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo -e "${RED}ERROR: docker compose v2 not found. Install Docker Compose v2.${NC}" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q hexa-gitlab; then
  echo -e "${YELLOW}WARNING: GitLab container not found. Will start fresh.${NC}"
fi

if ! docker ps --format '{{.Names}}' | grep -q hexa-gitlab-runner; then
  echo -e "${YELLOW}WARNING: GitLab Runner container not found. Will start fresh.${NC}"
fi

echo "  ✓ Environment validated"
echo ""

# ============================================================================
# STEP 2: Backup Current Configuration
# ============================================================================
echo -e "${YELLOW}[2/8] Backing up current configuration...${NC}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/gitlab_${TIMESTAMP}"

mkdir -p "${BACKUP_DIR}"

# Backup Docker compose files
if [ -f "docker-compose.gitlab.yml" ]; then
  cp docker-compose.gitlab.yml "${BACKUP_DIR}/docker-compose.gitlab.yml.backup"
  echo "  ✓ Backed up docker-compose.gitlab.yml"
fi

if [ -f "docker-compose.gitlab-runner.yml" ]; then
  cp docker-compose.gitlab-runner.yml "${BACKUP_DIR}/docker-compose.gitlab-runner.yml.backup"
  echo "  ✓ Backed up docker-compose.gitlab-runner.yml"
fi

# Backup .gitlab-ci.yml
if [ -f ".gitlab-ci.yml" ]; then
  cp .gitlab-ci.yml "${BACKUP_DIR}/.gitlab-ci.yml.backup"
  echo "  ✓ Backed up .gitlab-ci.yml"
fi

# Backup environment files
if [ -f ".env.gitlab" ]; then
  cp .env.gitlab "${BACKUP_DIR}/.env.gitlab.backup"
  echo "  ✓ Backed up .env.gitlab"
fi

echo "  ✓ All backups created in: ${BACKUP_DIR}"
echo ""

# ============================================================================
# STEP 3: Deploy Optimized GitLab Configuration
# ============================================================================
echo -e "${YELLOW}[3/8] Deploying optimized GitLab configuration...${NC}"

# Check if optimized file exists locally
if [ -f "docker-compose.gitlab.optimized.yml" ]; then
  cp docker-compose.gitlab.optimized.yml docker-compose.gitlab.yml
  echo "  ✓ Deployed docker-compose.gitlab.optimized.yml"
elif [ -f "${SCRIPT_DIR}/docker-compose.gitlab.optimized.yml" ]; then
  cp "${SCRIPT_DIR}/docker-compose.gitlab.optimized.yml" docker-compose.gitlab.yml
  echo "  ✓ Deployed from script directory"
else
  echo -e "${RED}ERROR: docker-compose.gitlab.optimized.yml not found.${NC}" >&2
  echo "  Please ensure the optimized configuration files are present."
  exit 1
fi

# Validate YAML syntax
docker compose -f docker-compose.gitlab.yml config >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ GitLab configuration YAML is valid"
else
  echo -e "${RED}ERROR: GitLab configuration YAML is invalid.${NC}" >&2
  exit 1
fi

echo ""

# ============================================================================
# STEP 4: Deploy Optimized Runner Configuration
# ============================================================================
echo -e "${YELLOW}[4/8] Deploying optimized Runner configuration...${NC}"

# Check if optimized file exists locally
if [ -f "docker-compose.gitlab-runner.optimized.yml" ]; then
  cp docker-compose.gitlab-runner.optimized.yml docker-compose.gitlab-runner.yml
  echo "  ✓ Deployed docker-compose.gitlab-runner.optimized.yml"
elif [ -f "${SCRIPT_DIR}/docker-compose.gitlab-runner.optimized.yml" ]; then
  cp "${SCRIPT_DIR}/docker-compose.gitlab-runner.optimized.yml" docker-compose.gitlab-runner.yml
  echo "  ✓ Deployed from script directory"
else
  echo -e "${RED}ERROR: docker-compose.gitlab-runner.optimized.yml not found.${NC}" >&2
  echo "  Please ensure the optimized configuration files are present."
  exit 1
fi

# Validate YAML syntax
docker compose -f docker-compose.gitlab-runner.yml config >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Runner configuration YAML is valid"
else
  echo -e "${RED}ERROR: Runner configuration YAML is invalid.${NC}" >&2
  exit 1
fi

echo ""

# ============================================================================
# STEP 5: Stop Existing Services
# ============================================================================
echo -e "${YELLOW}[5/8] Stopping existing services...${NC}"

# Stop GitLab
docker compose -f docker-compose.gitlab.yml down 2>/dev/null || true
echo "  ✓ GitLab stopped"

# Stop Runner
docker compose -f docker-compose.gitlab-runner.yml down 2>/dev/null || true
echo "  ✓ GitLab Runner stopped"

echo ""

# ============================================================================
# STEP 6: Start GitLab with Optimized Configuration
# ============================================================================
echo -e "${YELLOW}[6/8] Starting GitLab with optimized configuration...${NC}"

# Load environment variables if present
if [ -f ".env.gitlab" ]; then
  echo "  Loading environment from .env.gitlab"
  set -a
  # shellcheck disable=SC1091
  source .env.gitlab
  set +a
fi

# Generate registry secret if not set
if [ -z "${REGISTRY_HTTP_SECRET:-}" ]; then
  REGISTRY_HTTP_SECRET=$(openssl rand -hex 32)
  echo "  Generated REGISTRY_HTTP_SECRET"
  echo "  IMPORTANT: Save this to .env.gitlab: REGISTRY_HTTP_SECRET=${REGISTRY_HTTP_SECRET}"
fi

# Start GitLab
docker compose -f docker-compose.gitlab.yml up -d

# Wait for GitLab to be healthy
echo "  Waiting for GitLab to come online (up to 10 minutes)..."
ATTEMPTS=0
MAX_ATTEMPTS=120
until docker exec hexa-gitlab curl -sf http://localhost/-/health >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo -e "${RED}ERROR: GitLab did not become healthy within $((MAX_ATTEMPTS * 5))s.${NC}" >&2
    echo "  Check logs: docker logs hexa-gitlab"
    exit 1
  fi
  printf "."
  sleep 5
done
echo " OK"

# Get root password
if docker exec hexa-gitlab test -f /etc/gitlab/initial_root_password; then
  ROOT_PWD=$(docker exec hexa-gitlab cat /etc/gitlab/initial_root_password | grep -oP 'Password: \K.*')
  echo ""
  echo -e "${GREEN}  Initial root password: ${ROOT_PWD}${NC}"
  echo -e "${GREEN}  Username: root${NC}"
  echo -e "${YELLOW}  IMPORTANT: Change this password on first login.${NC}"
else
  echo "  GitLab has already been initialized. Use your existing root password."
fi

echo "  ✓ GitLab is running with optimized configuration"
echo ""

# ============================================================================
# STEP 7: Start Runner with Optimized Configuration
# ============================================================================
echo -e "${YELLOW}[7/8] Starting GitLab Runner with optimized configuration...${NC}"

# Start Runner
docker compose -f docker-compose.gitlab-runner.yml up -d

# Verify runner is running
if docker ps --format '{{.Names}}' | grep -q hexa-gitlab-runner; then
  echo "  ✓ GitLab Runner is running"
else
  echo -e "${RED}ERROR: GitLab Runner failed to start.${NC}" >&2
  echo "  Check logs: docker logs hexa-gitlab-runner"
  exit 1
fi

echo ""

# ============================================================================
# STEP 8: Re-register Runner
# ============================================================================
echo -e "${YELLOW}[8/8] Re-registering GitLab Runner...${NC}"

# Get registration token
GITLAB_URL="http://19.16.1.100:8929"
RUNNER_TOKEN=""

# Try to get token from admin area (requires authentication)
# For now, print manual instructions
if [ -z "$RUNNER_TOKEN" ]; then
  echo ""
  echo -e "${BLUE}  Manual step required: Get Runner Registration Token${NC}"
  echo ""
  echo "  1. Browse to: ${GITLAB_URL}/admin/runners"
  echo "  2. Copy the registration token"
  echo "  3. Run the following command:"
  echo ""
  echo "     docker exec -it hexa-gitlab-runner gitlab-runner register \\"
  echo "       --non-interactive \\"
  echo "       --url ${GITLAB_URL} \\"
  echo "       --registration-token <PASTE_TOKEN_HERE> \\"
  echo "       --executor docker \\"
  echo "       --docker-image docker:24-dind \\"
  echo "       --docker-privileged=true \\"
  echo "       --docker-volumes /var/run/docker.sock:/var/run/docker.sock \\"
  echo "       --docker-volumes /cache \\"
  echo "       --docker-network-mode hexa-gitlab-net \\"
  echo "       --tag-list docker,linux,hexa \\"
  echo "       --run-untagged=false \\"
  echo "       --locked=false \\"
  echo "       --access-level=not_protected"
  echo ""
  echo "  OR use the automated script:"
  echo "     RUNNER_TOKEN=<token> bash scripts/register-gitlab-runner.sh"
  echo ""
else
  # Automated registration
  docker exec hexa-gitlab-runner gitlab-runner register \
    --non-interactive \
    --url "${GITLAB_URL}" \
    --registration-token "${RUNNER_TOKEN}" \
    --executor docker \
    --docker-image docker:24-dind \
    --docker-privileged=true \
    --docker-volumes /var/run/docker.sock:/var/run/docker.sock \
    --docker-volumes /cache \
    --docker-network-mode hexa-gitlab-net \
    --tag-list docker,linux,hexa \
    --run-untagged=false \
    --locked=false \
    --access-level=not_protected
  
  echo "  ✓ GitLab Runner registered"
fi

# ============================================================================
# COMPLETION SUMMARY
# ============================================================================
echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo "  ✓ Optimized GitLab configuration deployed"
echo "  ✓ Optimized Runner configuration deployed"
echo "  ✓ GitLab service restarted with new settings"
echo "  ✓ GitLab Runner service restarted with new settings"
echo ""
echo "  Next steps:"
echo "  1. Browse to: ${GITLAB_URL}"
echo "  2. Log in as root (password: ${ROOT_PWD:-<existing>})"
echo "  3. Re-register the runner (see instructions above)"
echo "  4. Configure instance settings (Admin Area)"
echo "  5. Configure project settings (CI/CD Variables, Branch Protection)"
echo "  6. Trigger a new pipeline to verify everything works"
echo ""
echo "  Access details:"
echo "    GitLab Web UI:    ${GITLAB_URL}"
echo "    Container Reg:    http://19.16.1.100:5050"
echo "    SSH:              ssh://git@19.16.1.100:2222"
echo "    Runner:          docker exec -it hexa-gitlab-runner gitlab-runner list"
echo ""
echo "  Backups created in: ${BACKUP_DIR}"
echo ""
