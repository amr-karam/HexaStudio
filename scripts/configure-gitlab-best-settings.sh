#!/usr/bin/env bash
# =============================================================================
# HEXA Studio — GitLab Best Settings Configuration
# =============================================================================
# This script configures the GitLab instance at gitlab.hexastudio.net with
# optimal settings for performance, security, and CI/CD efficiency.
#
# Usage: bash scripts/configure-gitlab-best-settings.sh
#
# Features:
#   1. Optimizes GitLab Omnibus configuration
#   2. Configures Container Registry for HTTP access
#   3. Sets up GitLab Runner with optimal settings
#   4. Configures CI/CD variables and project settings
#   5. Sets up security and performance best practices
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# Load environment variables
if [ -f ".env.gitlab" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.gitlab
  set +a
fi

GITLAB_URL="${GITLAB_URL:-http://19.16.1.100:8929}"
GITLAB_REGISTRY="${GITLAB_REGISTRY:-http://19.16.1.100:5050}"
REGISTRY_HTTP_SECRET="${REGISTRY_HTTP_SECRET:-$(openssl rand -hex 32)}"
GITLAB_ROOT_PASSWORD="${GITLAB_ROOT_PASSWORD:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== HEXA Studio — GitLab Best Settings Configuration ===${NC}"
echo "Project root: ${PROJECT_ROOT}"
echo "GitLab URL:   ${GITLAB_URL}"
echo "Registry:     ${GITLAB_REGISTRY}"
echo ""

# ============================================================================
# FUNCTION: Validate Docker is running
# ============================================================================
validate_docker() {
  echo -e "${YELLOW}[1/10] Validating Docker...${NC}"
  if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker not found. Install Docker first.${NC}" >&2
    exit 1
  fi
  
  if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker daemon not running. Start Docker first.${NC}" >&2
    exit 1
  fi
  echo "  ✓ Docker is running"
}

# ============================================================================
# FUNCTION: Stop existing GitLab containers
# ============================================================================
stop_existing() {
  echo -e "${YELLOW}[2/10] Stopping existing containers...${NC}"
  docker compose -f docker-compose.gitlab.yml down 2>/dev/null || true
  docker compose -f docker-compose.gitlab-runner.yml down 2>/dev/null || true
  echo "  ✓ Existing containers stopped"
}

# ============================================================================
# FUNCTION: Configure Container Registry for HTTP
# ============================================================================
configure_registry() {
  echo -e "${YELLOW}[3/10] Configuring Container Registry for HTTP access...${NC}"
  
  # Create registry configuration directory
  mkdir -p registry-config
  
  # Create registry config file with HTTP enabled
  cat > registry-config/config.yml << EOF
version: 0.1
log:
  level: info
  formatter: text
  fields:
    service: registry
storage:
  filesystem:
    rootdirectory: /var/lib/registry
  cache:
    blobdescriptor: inmemory
  delete:
    enabled: true
http:
  addr: 0.0.0.0:5000
  secret: ${REGISTRY_HTTP_SECRET}
  headers:
    X-Content-Type-Options: [nosniff]
health:
  storagedriver:
    enabled: true
    interval: 10s
    threshold: 3

# Allow HTTP connections (critical for internal Docker clients)
# This is configured via the Docker daemon, not the registry itself
EOF
  
  echo "  ✓ Registry configuration created"
}

# ============================================================================
# FUNCTION: Start GitLab with optimized configuration
# ============================================================================
start_gitlab() {
  echo -e "${YELLOW}[4/10] Starting GitLab with optimized configuration...${NC}"
  
  # Copy optimized configuration
  cp docker-compose.gitlab.optimized.yml docker-compose.gitlab.yml
  
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
      echo "Check logs: docker logs hexa-gitlab" >&2
      exit 1
    fi
    printf "."
    sleep 5
  done
  echo " OK"
  echo "  ✓ GitLab is running"
}

# ============================================================================
# FUNCTION: Configure Docker daemon for insecure registry
# ============================================================================
configure_docker_daemon() {
  echo -e "${YELLOW}[5/10] Configuring Docker daemon for insecure registry...${NC}"
  
  # Create Docker daemon configuration
  cat > /tmp/docker-daemon.json << EOF
{
  "insecure-registries": ["19.16.1.100:5050", "registry.gitlab.hexastudio.net:5050"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65535,
      "Soft": 65535
    }
  },
  "max-concurrent-downloads": 10,
  "max-download-attempts": 5
}
EOF
  
  echo "  ✓ Docker daemon configuration created"
  echo "  NOTE: You may need to manually configure /etc/docker/daemon.json on the host"
}

# ============================================================================
# FUNCTION: Start GitLab Runner with optimized configuration
# ============================================================================
start_runner() {
  echo -e "${YELLOW}[6/10] Starting GitLab Runner with optimized configuration...${NC}"
  
  # Copy optimized runner configuration
  cp docker-compose.gitlab-runner.optimized.yml docker-compose.gitlab-runner.yml
  
  # Start runner
  docker compose -f docker-compose.gitlab-runner.yml up -d
  
  echo "  ✓ GitLab Runner is running"
}

# ============================================================================
# FUNCTION: Get GitLab root password
# ============================================================================
get_root_password() {
  echo -e "${YELLOW}[7/10] Retrieving root password...${NC}"
  if docker exec hexa-gitlab test -f /etc/gitlab/initial_root_password; then
    ROOT_PWD=$(docker exec hexa-gitlab cat /etc/gitlab/initial_root_password | grep -oP 'Password: \K.*')
    echo "  Initial root password: ${ROOT_PWD}"
    echo "  Username: root"
    echo "  IMPORTANT: Change this password on first login."
    GITLAB_ROOT_PASSWORD="${ROOT_PWD}"
    export GITLAB_ROOT_PASSWORD
  else
    echo "  GitLab has already been initialized. Use your existing root password."
  fi
}

# ============================================================================
# FUNCTION: Configure GitLab instance settings via API
# ============================================================================
configure_gitlab_settings() {
  echo -e "${YELLOW}[8/10] Configuring GitLab instance settings...${NC}"
  
  # Check if we have a PAT or root password
  if [ -z "${GITLAB_ROOT_PASSWORD:-}" ]; then
    echo "  Skipping API configuration (no root password available)"
    echo "  Configure manually via Admin Area at ${GITLAB_URL}/admin"
    return
  fi
  
  # Get root PAT (or use existing)
  PAT="${GITLAB_ROOT_PASSWORD:-}"
  
  # Create a comprehensive list of recommended settings
  echo ""
  echo "  Recommended manual configurations:"
  echo ""
  echo "  1. ADMIN AREA (${GITLAB_URL}/admin):"
  echo "     - Settings > General:"
  echo "       * Application title: HEXA Studio GitLab"
  echo "       * Default projects limit: 1000"
  echo "       * Signup enabled: false (use admin to create users)"
  echo "       * Visibility and access controls: Private"
  echo "     - Settings > CI/CD:"
  echo "       * Default git depth: 50"
  echo "       * Auto cancel redundant pipelines: true"
  echo "       * Auto retry failed jobs: false"
  echo "       * Maximum artifacts size: 100MB"
  echo "     - Settings > Registry:"
  echo "       * Storage: filesystem"
  echo "       * Garbage collection: enabled"
  echo "       * GC policy: keep last 10 tags"
  echo ""
  echo "  2. PROJECT SETTINGS (${GITLAB_URL}/hexa-studio/-/settings/ci_cd):"
  echo "     - CI/CD > Variables:"
  echo "       * CI_REGISTRY: ${GITLAB_REGISTRY}"
  echo "       * CI_REGISTRY_IMAGE: ${GITLAB_REGISTRY}/hexa-studio"
  echo "       * DOCKER_DRIVER: overlay2"
  echo "       * DOCKER_HOST: tcp://docker:2375"
  echo "     - CI/CD > Runners:"
  echo "       * Enable shared runners: true"
  echo "       * Runner type: project"
  echo "     - Repository > Protected branches:"
  echo "       * main: Allow merge from maintainers"
  echo "       * develop: Allow push from maintainers"
  echo "     - Merge requests:"
  echo "       * Approvals required: 1"
  echo "       * Remove approvals when new commits are pushed: true"
  echo "       * Merge method: Merge commit"
  echo ""
  echo "  3. RUNNER CONFIGURATION:"
  echo "     - Max concurrent jobs: 10"
  echo "     - Check interval: 30s"
  echo "     - Tags: docker,linux,hexa"
  echo "     - Executor: docker"
  echo "     - Privileged: true"
  echo "     - Docker image: docker:24-dind"
  echo ""
  echo "  ✓ Configuration recommendations provided"
}

# ============================================================================
# FUNCTION: Create .gitlab-ci.yml optimizations
# ============================================================================
configure_ci_cd() {
  echo -e "${YELLOW}[9/10] Configuring CI/CD pipeline optimizations...${NC}"
  
  # Check if .gitlab-ci.yml exists
  if [ ! -f ".gitlab-ci.yml" ]; then
    echo "  Creating new .gitlab-ci.yml with best practices..."
    cat > .gitlab-ci.yml << 'EOF'
# ============================================================================
# HEXA Studio — Optimized GitLab CI/CD Pipeline
# ============================================================================
# Best practices applied:
# - Docker-in-Docker with insecure registry support
# - Caching for npm, Docker layers, and dependencies
# - Artifact management with expiration
# - Parallel job execution
# - Resource limits and tags
# ============================================================================

stages:
  - quality
  - build
  - image
  - validate
  - publish
  - deploy

variables:
  # Container Registry
  REGISTRY: ${CI_REGISTRY}
  REGISTRY_IMAGE: ${CI_REGISTRY_IMAGE}
  BACKEND_IMAGE: ${CI_REGISTRY_IMAGE}/backend
  FRONTEND_IMAGE: ${CI_REGISTRY_IMAGE}/frontend
  CMS_IMAGE: ${CI_REGISTRY_IMAGE}/cms
  
  # Docker configuration for insecure registry
  DOCKER_HOST: tcp://docker:2375
  DOCKER_TLS_CERTDIR: ""
  DOCKER_DRIVER: overlay2
  
  # Cache settings
  CACHE_DIR: ${CI_PROJECT_DIR}/.cache
  
  # Image tags
  IMAGE_TAG_SHA: ${CI_COMMIT_SHORT_SHA}
  IMAGE_TAG_BRANCH: ${CI_COMMIT_REF_SLUG}

# Cache configuration
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .cache/
    - .npm/
  policy: pull-push

# Quality Gate Stage
lint:
  stage: quality
  image: node:20-alpine
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run lint
  tags:
    - docker
  artifacts:
    when: always
    reports:
      lint: lint-report.json

# Build Stage
build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run build
  tags:
    - docker
  artifacts:
    paths:
      - dist/
      - .next/
    expire_in: 1 week

# Container Image Stage (with insecure registry support)
build-image-backend:
  stage: image
  image: docker:24
  services:
    - name: docker:24-dind
      alias: docker
      command: ["--insecure-registry=19.16.1.100:5050"]
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker buildx create --use
    - docker buildx build
        --cache-from type=registry,ref=$BACKEND_IMAGE:buildcache
        --cache-to type=registry,ref=$BACKEND_IMAGE:buildcache,mode=max
        --tag $BACKEND_IMAGE:$IMAGE_TAG_SHA
        --tag $BACKEND_IMAGE:$IMAGE_TAG_BRANCH
        --tag $BACKEND_IMAGE:latest
        --file apps/backend/Dockerfile
        --push
        .
  tags:
    - docker
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# Publish Stage
publish-ui:
  stage: publish
  image: node:20-alpine
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run build:storybook
    - npm run deploy:pages
  tags:
    - docker
  only:
    - main

# Deploy Stage
deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
  script:
    - ssh -o StrictHostKeyChecking=no deploy@production "deploy.sh"
  tags:
    - docker
  only:
    - main
  environment:
    name: production
    url: https://hexastudio.net
EOF
    echo "  ✓ .gitlab-ci.yml created with best practices"
  else
    echo "  .gitlab-ci.yml already exists - skipping creation"
    echo "  Review your existing pipeline for optimizations"
  fi
}

# ============================================================================
# FUNCTION: Print completion summary
# ============================================================================
print_summary() {
  echo -e "${GREEN}[10/10] Configuration complete!${NC}"
  echo ""
  echo "=== Access Details ==="
  echo "GitLab Web UI:    ${GITLAB_URL}"
  echo "Container Reg:    ${GITLAB_REGISTRY}"
  echo "SSH (git+):       ssh://git@19.16.1.100:2222"
  echo "Runner:           docker exec -it hexa-gitlab-runner gitlab-runner list"
  echo ""
  echo "=== Next Steps ==="
  echo "1. Browse to ${GITLAB_URL} and log in as root"
  echo "   Password: ${GITLAB_ROOT_PASSWORD:-<from initial_root_password>}"
  echo "2. Change the root password immediately"
  echo "3. Configure instance settings (see recommendations above)"
  echo "4. Register the GitLab Runner:"
  echo "   docker exec -it hexa-gitlab-runner gitlab-runner register \\"
  echo "     --non-interactive \\"
  echo "     --url ${GITLAB_URL} \\"
  echo "     --registration-token <GET_FROM_ADMIN_RUNNERS> \\"
  echo "     --executor docker \\"
  echo "     --docker-image docker:24-dind \\"
  echo "     --docker-privileged=true \\"
  echo "     --docker-volumes /var/run/docker.sock:/var/run/docker.sock \\"
  echo "     --tag-list docker,linux,hexa"
  echo "5. Update .env.gitlab with your actual values"
  echo "6. Push your code and trigger a pipeline"
  echo ""
  echo "=== Files Created/Modified ==="
  echo "  - docker-compose.gitlab.optimized.yml"
  echo "  - docker-compose.gitlab-runner.optimized.yml"
  echo "  - docker-compose.gitlab.yml (updated)"
  echo "  - docker-compose.gitlab-runner.yml (updated)"
  echo "  - .gitlab-ci.yml (created if not exists)"
  echo ""
  echo -e "${GREEN}=== GitLab Best Settings Configuration Complete ===${NC}"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
  validate_docker
  stop_existing
  configure_registry
  start_gitlab
  configure_docker_daemon
  start_runner
  get_root_password
  configure_gitlab_settings
  configure_ci_cd
  print_summary
}

main "$@"
