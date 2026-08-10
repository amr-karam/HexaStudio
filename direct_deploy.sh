#!/bin/bash
# Direct deployment script for /home/hexa/hexastudio
cd /home/hexa/hexastudio

echo "=== Starting Complete GitLab Deployment ==="
echo "Project: /home/hexa/hexastudio"
echo ""

# Step 1: Backup current configuration
echo "[1/10] Backing up current configuration..."
mkdir -p backups/gitlab_$(date +%Y%m%d_%H%M%S)
cp docker-compose.gitlab.yml backups/gitlab_*/ 2>/dev/null || true
cp docker-compose.gitlab-runner.yml backups/gitlab_*/ 2>/dev/null || true
cp .gitlab-ci.yml backups/gitlab_*/ 2>/dev/null || true
echo "  ✓ Backups created"

# Step 2: Deploy optimized configurations
echo "[2/10] Deploying optimized configurations..."
cp docker-compose.gitlab.optimized.yml docker-compose.gitlab.yml
cp docker-compose.gitlab-runner.optimized.yml docker-compose.gitlab-runner.yml
echo "  ✓ Configurations deployed"

# Step 3: Validate YAML
echo "[3/10] Validating YAML..."
docker compose -f docker-compose.gitlab.yml config >/dev/null 2>&1 && echo "  ✓ GitLab YAML valid"
docker compose -f docker-compose.gitlab-runner.yml config >/dev/null 2>&1 && echo "  ✓ Runner YAML valid"

# Step 4: Stop existing services
echo "[4/10] Stopping existing services..."
docker compose -f docker-compose.gitlab.yml down 2>/dev/null || true
docker compose -f docker-compose.gitlab-runner.yml down 2>/dev/null || true
echo "  ✓ Services stopped"

# Step 5: Start GitLab
echo "[5/10] Starting GitLab..."
docker compose -f docker-compose.gitlab.yml up -d
echo "  ✓ GitLab starting (waiting for health)..."

# Wait for health
ATTEMPTS=0
MAX_ATTEMPTS=120
until docker exec hexa-gitlab curl -sf http://localhost/-/health >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
    echo "  ✗ GitLab not healthy after 10 minutes"
    exit 1
  fi
  sleep 5
  printf "."
done
echo " OK"

# Get root password
if docker exec hexa-gitlab test -f /etc/gitlab/initial_root_password; then
  ROOT_PWD=$(docker exec hexa-gitlab cat /etc/gitlab/initial_root_password | grep -oP 'Password: \K.*')
  echo ""
  echo "  Initial root password: ${ROOT_PWD}"
fi

# Step 6: Start Runner
echo "[6/10] Starting GitLab Runner..."
docker compose -f docker-compose.gitlab-runner.yml up -d
echo "  ✓ Runner starting"

# Step 7: Re-register Runner
echo "[7/10] Re-registering Runner..."
echo ""
echo "  Manual step: Get token from http://19.16.1.100:8929/admin/runners"
echo "  Then run: docker exec -it hexa-gitlab-runner gitlab-runner register ..."
echo ""

# Step 8: Verify
echo "[8/10] Verifying deployment..."
docker ps | grep hexa-gitlab && echo "  ✓ GitLab running"
docker ps | grep hexa-gitlab-runner && echo "  ✓ Runner running"
docker exec hexa-gitlab curl -sf http://localhost/-/health >/dev/null 2>&1 && echo "  ✓ GitLab healthy"

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "Access: http://19.16.1.100:8929"
echo "Runner: docker exec hexa-gitlab-runner gitlab-runner list"
echo "Logs: docker logs hexa-gitlab"
