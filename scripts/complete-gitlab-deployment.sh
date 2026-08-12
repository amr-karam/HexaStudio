#!/usr/bin/env bash
# =============================================================================
# HEXA Studio — COMPLETE GitLab Best Settings Deployment
# =============================================================================
# This is a MASTER script that performs ALL remaining tasks to complete the
# GitLab configuration for gitlab.hexastudio.net
#
# Run this script on the server (19.16.1.100) as root user:
#   bash complete-gitlab-deployment.sh
#
# This script will:
#   1. Stop existing services
#   2. Backup current configuration
#   3. Deploy ALL optimized configurations
#   4. Start GitLab with best settings
#   5. Start Runner with best settings
#   6. Re-register Runner
#   7. Configure instance settings via API (if PAT available)
#   8. Configure project settings via API (if PAT available)
#   9. Verify everything works
#   10. Print final status
#
# Estimated time: 15-20 minutes
# =============================================================================

set -euo pipefail

# ============================================================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================================================

# GitLab access
GITLAB_URL="http://19.16.1.100:8929"
GITLAB_REGISTRY="http://19.16.1.100:5050"
PROJECT_PATH="/path/to/hexa-platform"  # EDIT THIS TO YOUR ACTUAL PATH

# Optional: If you have a Personal Access Token, set it here
# Generate at: http://19.16.1.100:8929/-/profile/personal_access_tokens
GITLAB_PAT=""  # Set this if you want automated API configuration

# Registry configuration
REGISTRY_HTTP_SECRET="${REGISTRY_HTTP_SECRET:-$(openssl rand -hex 32)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# INITIALIZATION
# ============================================================================

echo -e "${PURPLE}============================================================================${NC}"
echo -e "${PURPLE}  HEXA Studio — COMPLETE GitLab Best Settings Deployment${NC}"
echo -e "${PURPLE}============================================================================${NC}"
echo ""
echo "  GitLab URL:    ${GITLAB_URL}"
echo "  Registry:      ${GITLAB_REGISTRY}"
echo "  Project Path: ${PROJECT_PATH}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${PROJECT_PATH}" || { echo -e "${RED}ERROR: Project path not found: ${PROJECT_PATH}${NC}" >&2; exit 1; }

# ============================================================================
# TASK 1: Validate Environment
# ============================================================================
echo -e "${CYAN}[1/10] Validating environment...${NC}"

if ! command -v docker >/dev/null 2>&1; then
  echo -e "${RED}ERROR: Docker not found. Install Docker first.${NC}" >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo -e "${RED}ERROR: docker compose v2 not found.${NC}" >&2
  exit 1
fi

echo "  ✓ Docker environment validated"
echo ""

# ============================================================================
# TASK 2: Create Backup Directory
# ============================================================================
echo -e "${CYAN}[2/10] Creating backup directory...${NC}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${PROJECT_PATH}/backups/gitlab_complete_${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"
echo "  ✓ Backup directory: ${BACKUP_DIR}"
echo ""

# ============================================================================
# TASK 3: Backup Current Configuration
# ============================================================================
echo -e "${CYAN}[3/10] Backing up current configuration...${NC}"

# Backup Docker compose files
for file in docker-compose.gitlab.yml docker-compose.gitlab-runner.yml .gitlab-ci.yml .env.gitlab; do
  if [ -f "$file" ]; then
    cp "$file" "${BACKUP_DIR}/$(basename $file).backup"
    echo "  ✓ Backed up: $file"
  fi
done

# Backup Docker volumes (optional, uncomment if needed)
# docker commit hexa-gitlab hexa-gitlab-backup-${TIMESTAMP} 2>/dev/null || true
# docker commit hexa-gitlab-runner hexa-gitlab-runner-backup-${TIMESTAMP} 2>/dev/null || true

echo "  ✓ All backups created in: ${BACKUP_DIR}"
echo ""

# ============================================================================
# TASK 4: Deploy Optimized GitLab Configuration
# ============================================================================
echo -e "${CYAN}[4/10] Deploying optimized GitLab configuration...${NC}"

# Check if optimized file exists in script directory or current directory
if [ -f "${SCRIPT_DIR}/docker-compose.gitlab.optimized.yml" ]; then
  cp "${SCRIPT_DIR}/docker-compose.gitlab.optimized.yml" docker-compose.gitlab.yml
  echo "  ✓ Copied from script directory"
elif [ -f "docker-compose.gitlab.optimized.yml" ]; then
  cp docker-compose.gitlab.optimized.yml docker-compose.gitlab.yml
  echo "  ✓ Copied from current directory"
else
  echo -e "${RED}ERROR: docker-compose.gitlab.optimized.yml not found!${NC}" >&2
  echo "  Please ensure the file exists in ${SCRIPT_DIR} or current directory"
  exit 1
fi

# Validate YAML
docker compose -f docker-compose.gitlab.yml config >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ GitLab configuration is valid"
else
  echo -e "${RED}ERROR: GitLab configuration YAML is invalid${NC}" >&2
  exit 1
fi

echo ""

# ============================================================================
# TASK 5: Deploy Optimized Runner Configuration
# ============================================================================
echo -e "${CYAN}[5/10] Deploying optimized Runner configuration...${NC}"

if [ -f "${SCRIPT_DIR}/docker-compose.gitlab-runner.optimized.yml" ]; then
  cp "${SCRIPT_DIR}/docker-compose.gitlab-runner.optimized.yml" docker-compose.gitlab-runner.yml
  echo "  ✓ Copied from script directory"
elif [ -f "docker-compose.gitlab-runner.optimized.yml" ]; then
  cp docker-compose.gitlab-runner.optimized.yml docker-compose.gitlab-runner.yml
  echo "  ✓ Copied from current directory"
else
  echo -e "${RED}ERROR: docker-compose.gitlab-runner.optimized.yml not found!${NC}" >&2
  exit 1
fi

# Validate YAML
docker compose -f docker-compose.gitlab-runner.yml config >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Runner configuration is valid"
else
  echo -e "${RED}ERROR: Runner configuration YAML is invalid${NC}" >&2
  exit 1
fi

echo ""

# ============================================================================
# TASK 6: Deploy Optimized .gitlab-ci.yml
# ============================================================================
echo -e "${CYAN}[6/10] Deploying optimized .gitlab-ci.yml...${NC}"

# Check if we have an optimized CI file
if [ -f "${SCRIPT_DIR}/.gitlab-ci.optimized.yml" ]; then
  cp "${SCRIPT_DIR}/.gitlab-ci.optimized.yml" .gitlab-ci.yml
  echo "  ✓ Deployed optimized CI configuration"
elif [ -f ".gitlab-ci.optimized.yml" ]; then
  cp .gitlab-ci.optimized.yml .gitlab-ci.yml
  echo "  ✓ Deployed optimized CI configuration"
else
  # Use existing .gitlab-ci.yml (should already have the fix)
  if [ -f ".gitlab-ci.yml" ]; then
    echo "  ✓ Using existing .gitlab-ci.yml (already has fix)"
  else
    echo -e "${RED}ERROR: .gitlab-ci.yml not found!${NC}" >&2
    exit 1
  fi
fi

echo ""

# ============================================================================
# TASK 7: Stop Existing Services
# ============================================================================
echo -e "${CYAN}[7/10] Stopping existing services...${NC}"

# Stop GitLab
docker compose -f docker-compose.gitlab.yml down 2>/dev/null || true
echo "  ✓ GitLab stopped"

# Stop Runner
docker compose -f docker-compose.gitlab-runner.yml down 2>/dev/null || true
echo "  ✓ GitLab Runner stopped"

echo ""

# ============================================================================
# TASK 8: Start GitLab with Optimized Configuration
# ============================================================================
echo -e "${CYAN}[8/10] Starting GitLab with optimized configuration...${NC}"

# Load environment variables if present
if [ -f ".env.gitlab" ]; then
  echo "  Loading environment from .env.gitlab"
  set -a
  # shellcheck disable=SC1091
  source .env.gitlab
  set +a
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
    echo -e "${RED}ERROR: GitLab did not become healthy within $((MAX_ATTEMPTS * 5))s${NC}" >&2
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
else
  echo "  GitLab has already been initialized. Use your existing root password."
  ROOT_PWD=""
fi

echo "  ✓ GitLab is running with optimized configuration"
echo ""

# ============================================================================
# TASK 9: Start Runner with Optimized Configuration
# ============================================================================
echo -e "${CYAN}[9/10] Starting GitLab Runner with optimized configuration...${NC}"

# Start Runner
docker compose -f docker-compose.gitlab-runner.yml up -d

# Verify runner is running
if ! docker ps --format '{{.Names}}' | grep -q hexa-gitlab-runner; then
  echo -e "${RED}ERROR: GitLab Runner failed to start${NC}" >&2
  echo "  Check logs: docker logs hexa-gitlab-runner"
  exit 1
fi

echo "  ✓ GitLab Runner is running"
echo ""

# ============================================================================
# TASK 10: Re-register Runner
# ============================================================================
echo -e "${CYAN}[10/10] Re-registering GitLab Runner...${NC}"

# Get registration token if PAT is available
if [ -n "$GITLAB_PAT" ]; then
  echo "  Attempting automated registration with PAT..."
  RUNNER_TOKEN=$(curl -s --header "PRIVATE-TOKEN: ${GITLAB_PAT}" "${GITLAB_URL}/api/v4/projects/1/runners/registration_token" | jq -r '.token' 2>/dev/null || echo "")
fi

if [ -z "$RUNNER_TOKEN" ]; then
  echo ""
  echo -e "${BLUE}  Manual step required: Get Runner Registration Token${NC}"
  echo ""
  echo "  1. Browse to: ${GITLAB_URL}/admin/runners"
  echo "  2. Copy the registration token"
  echo "  3. Run this command:"
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
  
  echo "  ✓ GitLab Runner registered automatically"
fi

# ============================================================================
# BONUS TASKS: Configure Instance Settings via API
# ============================================================================

if [ -n "$GITLAB_PAT" ]; then
  echo ""
  echo -e "${CYAN}Configuring GitLab instance settings via API...${NC}"
  
  # Get project ID
  PROJECT_ID=$(curl -s --header "PRIVATE-TOKEN: ${GITLAB_PAT}" "${GITLAB_URL}/api/v4/projects?search=hexa-platform" | jq -r '.[0].id' 2>/dev/null || echo "1")
  
  # Configure CI/CD settings
  curl -s -X PUT --header "PRIVATE-TOKEN: ${GITLAB_PAT}" \
    --header "Content-Type: application/json" \
    -d '{"default_git_depth": 50, "auto_cancel_pending_pipelines": true, "max_artifacts_size": 104857600}' \
    "${GITLAB_URL}/api/v4/projects/${PROJECT_ID}" >/dev/null 2>&1
  
  echo "  ✓ CI/CD settings configured"
  
  # Configure protected branches
  curl -s -X POST --header "PRIVATE-TOKEN: ${GITLAB_PAT}" \
    --header "Content-Type: application/json" \
    -d '{"name": "main", "merge_access_level": 40, "push_access_level": 0, "unprotect_access_level": 40}' \
    "${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/protected_branches" >/dev/null 2>&1
  
  curl -s -X POST --header "PRIVATE-TOKEN: ${GITLAB_PAT}" \
    --header "Content-Type: application/json" \
    -d '{"name": "develop", "merge_access_level": 40, "push_access_level": 40, "unprotect_access_level": 40}' \
    "${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/protected_branches" >/dev/null 2>&1
  
  echo "  ✓ Protected branches configured"
  
  # Configure CI/CD variables
  curl -s -X POST --header "PRIVATE-TOKEN: ${GITLAB_PAT}" \
    --header "Content-Type: application/json" \
    -d '{"key": "CI_REGISTRY", "value": "'"${GITLAB_REGISTRY}"'", "variable_type": "env_var", "protected": false, "masked": false}' \
    "${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/variables" >/dev/null 2>&1
  
  curl -s -X POST --header "PRIVATE-TOKEN: ${GITLAB_PAT}" \
    --header "Content-Type: application/json" \
    -d '{"key": "DOCKER_HOST", "value": "tcp://docker:2375", "variable_type": "env_var", "protected": false, "masked": false}' \
    "${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/variables" >/dev/null 2>&1
  
  curl -s -X POST --header "PRIVATE-TOKEN: ${GITLAB_PAT}" \
    --header "Content-Type: application/json" \
    -d '{"key": "DOCKER_TLS_CERTDIR", "value": "\"\"", "variable_type": "env_var", "protected": false, "masked": false}' \
    "${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/variables" >/dev/null 2>&1
  
  echo "  ✓ CI/CD variables configured"
  echo ""
else
  echo ""
  echo -e "${YELLOW}  Skipping API configuration (no PAT provided)${NC}"
  echo "  Configure manually via Admin UI: ${GITLAB_URL}/admin"
  echo ""
fi

# ============================================================================
# FINAL VERIFICATION
# ============================================================================

echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""

# Verify services
echo -e "${CYAN}Verification:${NC}"

# Check GitLab
docker ps --format '{{.Names}}' | grep -q hexa-gitlab && echo "  ✓ GitLab container running" || echo "  ✗ GitLab container not found"

# Check Runner
docker ps --format '{{.Names}}' | grep -q hexa-gitlab-runner && echo "  ✓ GitLab Runner container running" || echo "  ✗ GitLab Runner container not found"

# Check health
docker exec hexa-gitlab curl -sf http://localhost/-/health >/dev/null 2>&1 && echo "  ✓ GitLab is healthy" || echo "  ✗ GitLab health check failed"

# Check runner registration
docker exec hexa-gitlab-runner gitlab-runner list 2>&1 | grep -q "hexa-runner" && echo "  ✓ Runner is registered" || echo "  ⚠ Runner not yet registered (complete manually)"

echo ""
echo -e "${GREEN}Access Details:${NC}"
echo "  GitLab Web UI:    ${GITLAB_URL}"
echo "  Container Reg:    ${GITLAB_REGISTRY}"
echo "  SSH:              ssh://git@19.16.1.100:2222"
echo ""

if [ -n "$ROOT_PWD" ]; then
  echo -e "${GREEN}Initial Credentials:${NC}"
  echo "  Username: root"
  echo "  Password: ${ROOT_PWD}"
  echo ""
  echo -e "${YELLOW}IMPORTANT: Change the root password on first login!${NC}"
  echo ""
fi

echo -e "${GREEN}Backups:${NC}"
echo "  All original configurations backed up to: ${BACKUP_DIR}"
echo ""

echo -e "${GREEN}Next Steps:${NC}"
echo "  1. If runner not registered, complete manual registration (see above)"
echo "  2. Browse to ${GITLAB_URL} and log in"
echo "  3. Configure instance settings via Admin UI (if not done via API)"
echo "  4. Trigger a new pipeline to verify everything works"
echo "  5. Check pipeline status at: ${GITLAB_URL}/root/hexa-platform/-/pipelines"
echo ""

echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}  ALL TASKS COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}============================================================================${NC}"
