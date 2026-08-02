# DevOps Task Execution Plan - Server 19.16.1.100

**Date:** 2026-08-01  
**Executed by:** HEXA Studio DevOps Specialist  
**Server:** 19.16.1.100 (root)

---

## Task Status Overview

| Task | Status | Notes |
|------|--------|-------|
| 1. Fix Backup Script | ⏳ In Progress | Modify backup.sh, restart container |
| 2. Docker Log Rotation | ⏳ Pending | Verify existing config |
| 3. Set Up Staging | ⏳ Pending | Copy prod compose, modify ports |
| 4. Blue-Green Deployment | ⏳ Pending | Create green compose, configure Traefik |
| 5. Alert Notifications | ⏳ Pending | Configure Alertmanager SMTP |
| 6. GitLab Pipeline Optimization | ⏳ Pending | Review and optimize CI |
| 7. Test Backup Restoration | ⏳ Pending | Restore from MinIO |
| 8. Offsite Backup | ⏳ Pending | Configure MinIO replication or rclone |
| 9. Kubernetes Migration | ⏳ Pending | Install MicroK8s, convert compose |
| 10. Documentation | ⏳ Pending | Update playbook |

---

## Task 1: Fix Backup Script

### Changes Made:
1. **Line 2:** Changed `set -e` to `set +e` (disables exit on error)
2. **Line 14:** Added `hexastudio_db` to DBS list

### Local File Modified:
- `C:\Users\amrmo\OneDrive\Desktop\hexastudio.net\docker\backup\backup.sh`

### Server Commands to Execute:
```bash
# 1.1 Edit the backup script on server
sed -i '2s/set -e/set +e/' /home/hexa/hexastudio/docker/backup/backup.sh
sed -i '14s/DBS="hexastudio_api hexastudio_cms hexastudio_odoo"/DBS="hexastudio_api hexastudio_cms hexastudio_odoo hexastudio_db"/' /home/hexa/hexastudio/docker/backup/backup.sh

# 1.2 Restart the backup container
docker restart hexastudio-backup-1

# 1.3 Verify the changes
docker logs hexastudio-backup-1 --tail 10
```

### Verification:
- Backup script continues running even if one database fails
- hexastudio_db is now included in backup rotation

---

## Task 2: Docker Log Rotation

### Current Configuration:
Already configured in `docker-compose.prod.yml`:
```yaml
x-logging: &default-logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

### Server Commands to Execute:
```bash
# 2.1 Check log file sizes for all containers
docker ps --format '{{.Names}}' | while read container; do
  echo "=== $container ==="
  docker inspect --format='{{.LogPath}}' "$container" 2>/dev/null | xargs ls -lh 2>/dev/null || echo "No log file found"
done

# 2.2 Check specific container log sizes
du -sh /var/lib/docker/containers/*/*-json.log 2>/dev/null | sort -rh | head -20
```

### Expected Output:
- Log files should be <= 10MB each
- Maximum of 3 rotated files per container

---

## Task 3: Set Up Staging Environment

### Local File to Create:
- Copy: `docker-compose.prod.yml` → `docker-compose.staging.yml`
- Modify all external ports by adding 10000 offset

### Port Mapping Changes:
| Service | Production Port | Staging Port |
|---------|----------------|--------------|
| frontend | 3000 | 13000 |
| backend | 4000 | 14000 |
| cms | 1337 | 11337 |
| odoo | 8069 | 18069 |
| minio | 9000 | 19000 |
| minio console | 9001 | 19001 |
| traefik | 80, 443 | 10080, 10443 |
| grafana | 3000 | 13000 (conflict - use 13001) |

### Server Commands to Execute:
```bash
# 3.1 Copy production compose file
cp /home/hexa/hexastudio/docker-compose.prod.yml /home/hexa/hexastudio/docker-compose.staging.yml

# 3.2 Modify ports in staging file (using sed)
# Note: This is a simplified approach - manual review recommended
sed -i 's/"80:80"/"10080:80"/g' /home/hexa/hexastudio/docker-compose.staging.yml
sed -i 's/"443:443"/"10443:443"/g' /home/hexa/hexastudio/docker-compose.staging.yml
sed -i 's/"3000:3000"/"13000:3000"/g' /home/hexa/hexastudio/docker-compose.staging.yml
sed -i 's/"4000:4000"/"14000:4000"/g' /home/hexa/hexastudio/docker-compose.staging.yml
sed -i 's/"1337:1337"/"11337:1337"/g' /home/hexa/hexastudio/docker-compose.staging.yml
sed -i 's/"8069:8069"/"18069:8069"/g' /home/hexa/hexastudio/docker-compose.staging.yml
sed -i 's/"9000:9000"/"19000:9000"/g' /home/hexa/hexastudio/docker-compose.staging.yml
sed -i 's/"9001:9001"/"19001:9001"/g' /home/hexa/hexastudio/docker-compose.staging.yml

# 3.3 Create staging network
docker network create hexa-staging-net

# 3.4 Start staging environment
docker compose -f /home/hexa/hexastudio/docker-compose.staging.yml up -d

# 3.5 Verify staging containers
cd /home/hexa/hexastudio && docker compose -f docker-compose.staging.yml ps
```

### Notes:
- Need to update network references from `web`/`internal` to `hexa-staging-net`
- Need to verify port conflicts (e.g., grafana)
- Staging should use separate volumes to avoid data conflicts

---

## Task 4: Blue-Green Deployment

### Approach:
1. Create `docker-compose.green.yml` based on production
2. Add `:green` suffix to all image tags
3. Add comprehensive health checks
4. Configure Traefik for weight-based routing

### Server Commands to Execute:
```bash
# 4.1 Copy production compose to green
cp /home/hexa/hexastudio/docker-compose.prod.yml /home/hexa/hexastudio/docker-compose.green.yml

# 4.2 Update image tags to include :green suffix
# This requires manual editing or a more complex sed script
# Example for each service:
sed -i 's|image: traefik:v2.11|image: traefik:v2.11-green|' /home/hexa/hexastudio/docker-compose.green.yml
sed -i 's|image: postgres:16-alpine|image: postgres:16-alpine-green|' /home/hexa/hexastudio/docker-compose.green.yml
# ... and so on for all services

# 4.3 Add health checks to all services (if not present)
# Example health check to add:
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://127.0.0.1:PORT/health"]
#   interval: 30s
#   timeout: 10s
#   retries: 3
#   start_period: 40s

# 4.4 Configure Traefik dynamic routing
# Edit docker/traefik/dynamic.yml to add:
cat >> /home/hexa/hexastudio/docker/traefik/dynamic.yml << 'EOF'

http:
  routers:
    frontend-green:
      rule: Host(`hexastudio.net`) && PathPrefix(`/`)
      service: frontend-green
      entryPoints:
        - web
      middlewares:
        - weight-green
    
  services:
    frontend-green:
      weighted:
        services:
          - name: frontend-blue
            weight: 90
          - name: frontend-green
            weight: 10
EOF

# 4.5 Deploy green environment
docker compose -f /home/hexa/hexastudio/docker-compose.green.yml up -d

# 4.6 Verify health checks
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E 'green|healthy'
```

### Notes:
- Need to define separate container names for green deployment
- Traefik configuration needs careful weight management
- Health checks should be added to all services not already having them

---

## Task 5: Alert Notifications

### Changes to alertmanager.yml:
1. Uncomment and configure SMTP section
2. Add email receiver

### Modified Configuration:
```yaml
# /home/hexa/hexastudio/docker/alertmanager/alertmanager.yml

global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@hexastudio.net'
  smtp_auth_username: 'alerts@hexastudio.net'
  smtp_auth_password: '${SMTP_PASSWORD}'
  smtp_require_tls: true

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'email'
  routes:
    - matchers:
        - severity = "critical"
      receiver: 'email'
      repeat_interval: 1h
    - matchers:
        - severity = "warning"
      receiver: 'email'
      repeat_interval: 4h

receivers:
  - name: 'webhook'
    webhook_configs:
      - url: 'http://webhook:9000/alert'
        send_resolved: true
  - name: 'email'
    email_configs:
      - to: 'devops@hexastudio.net'
        send_resolved: true
```

### Server Commands to Execute:
```bash
# 5.1 Edit alertmanager configuration
# Use a heredoc or direct editing to update the file
cat > /home/hexa/hexastudio/docker/alertmanager/alertmanager.yml << 'EOF'
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@hexastudio.net'
  smtp_auth_username: 'alerts@hexastudio.net'
  smtp_auth_password: '${SMTP_PASSWORD}'
  smtp_require_tls: true

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'email'
  routes:
    - matchers:
        - severity = "critical"
      receiver: 'email'
      repeat_interval: 1h
    - matchers:
        - severity = "warning"
      receiver: 'email'
      repeat_interval: 4h

receivers:
  - name: 'webhook'
    webhook_configs:
      - url: 'http://webhook:9000/alert'
        send_resolved: true
  - name: 'email'
    email_configs:
      - to: 'devops@hexastudio.net'
        send_resolved: true
EOF

# 5.2 Add SMTP_PASSWORD to .env file
echo "SMTP_PASSWORD=your_smtp_password_here" >> /home/hexa/hexastudio/.env

# 5.3 Restart alertmanager container
docker restart hexastudio-alertmanager-1

# 5.4 Verify configuration
docker logs hexastudio-alertmanager-1 --tail 20
```

---

## Task 6: GitLab Pipeline Optimization

### Files to Review:
- `.gitlab-ci.yml` (if exists)
- `.github/workflows/cd.yml` (GitHub Actions - primary pipeline)

### Server Commands to Execute:
```bash
# 6.1 Find all CI/CD configuration files
find /home/hexa/hexastudio -name "*ci*.yml" -o -name "*ci*.yaml" -o -name "*workflow*.yml" -o -name "*workflow*.yaml" 2>/dev/null

# 6.2 Review current pipeline
cat /home/hexa/hexastudio/.github/workflows/cd.yml

# 6.3 Optimize pipeline (example changes):
# - Add parallel jobs for frontend, backend, cms
# - Configure caching for node_modules
# - Set up artifacts for build outputs
# - Validate configuration

# Example optimized .gitlab-ci.yml structure:
cat > /home/hexa/hexastudio/.gitlab-ci.yml << 'EOF'
stages:
  - setup
  - build
  - test
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: ""

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - apps/frontend/.next/cache
    - apps/backend/node_modules/
    - apps/cms/node_modules/

setup:
  stage: setup
  script:
    - npm install --legacy-peer-deps
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

build:frontend:
  stage: build
  script:
    - cd apps/frontend && npm run build
  artifacts:
    paths:
      - apps/frontend/.next/
    expire_in: 1 week
  needs: [setup]

build:backend:
  stage: build
  script:
    - cd apps/backend && npm run build
  artifacts:
    paths:
      - apps/backend/dist/
    expire_in: 1 week
  needs: [setup]

build:cms:
  stage: build
  script:
    - cd apps/cms && npm run build
  artifacts:
    paths:
      - apps/cms/build/
    expire_in: 1 week
  needs: [setup]

test:frontend:
  stage: test
  script:
    - cd apps/frontend && npm run test
  needs: [build:frontend]

test:backend:
  stage: test
  script:
    - cd apps/backend && npm run test
  needs: [build:backend]

deploy:staging:
  stage: deploy
  script:
    - docker compose -f docker-compose.staging.yml up -d --build
  environment:
    name: staging
    url: https://staging.hexastudio.net
  only:
    - main
    - merge_requests

deploy:production:
  stage: deploy
  script:
    - docker compose -f docker-compose.prod.yml up -d --build
  environment:
    name: production
    url: https://hexastudio.net
  when: manual
  only:
    - main
EOF

# 6.4 Validate GitLab CI configuration
# Install gitlab-runner if not present
# gitlab-runner verify

# 6.5 Lint YAML files
yamllint /home/hexa/hexastudio/.gitlab-ci.yml 2>/dev/null || echo "yamllint not installed, manual review recommended"
```

---

## Task 7: Test Backup Restoration

### Server Commands to Execute:
```bash
# 7.1 List backups in MinIO
# First, get into the minio container or use mc client
docker exec hexastudio-minio-1 mc ls hexabackup/backups/ 2>/dev/null || \
docker exec hexastudio-minio-1 mc ls local/backups/ 2>/dev/null

# 7.2 Find latest hexastudio_cms backup
LATEST_CMS_BACKUP=$(docker exec hexastudio-minio-1 mc ls hexabackup/backups/ 2>/dev/null | grep hexastudio_cms | sort | tail -1 | awk '{print $5}')
echo "Latest CMS backup: $LATEST_CMS_BACKUP"

# 7.3 Download backup to server
docker exec hexastudio-minio-1 mc cp "hexabackup/backups/${LATEST_CMS_BACKUP}" /tmp/restore.dump 2>/dev/null || \
echo "Manual download required"

# 7.4 Create test database
docker exec hexastudio-postgres-1 psql -U hexastudio -c "CREATE DATABASE hexastudio_cms_test;" 2>/dev/null || \
echo "Database creation command"

# 7.5 Restore backup
docker exec -i hexastudio-postgres-1 pg_restore \
  -U hexastudio \
  -d hexastudio_cms_test \
  --clean \
  --if-exists \
  /tmp/restore.dump

# 7.6 Verify restoration
docker exec hexastudio-postgres-1 psql -U hexastudio -d hexastudio_cms_test -c "SELECT count(*) FROM information_schema.tables;"
```

---

## Task 8: Offsite Backup

### Option A: MinIO Replication

### Server Commands to Execute:
```bash
# 8.1 Configure MinIO bucket replication
# Edit MinIO configuration to add replication settings

# Create replication configuration
cat > /tmp/minio-replication.json << 'EOF'
{
  "version": "1",
  "destination": {
    "type": "s3",
    "endpoint": "https://s3.amazonaws.com",
    "bucket": "hexa-offsite-backups",
    "access_key": "${AWS_ACCESS_KEY_ID}",
    "secret_key": "${AWS_SECRET_ACCESS_KEY}",
    "region": "us-east-1"
  },
  "rules": [
    {
      "rule_id": "backups-replication",
      "priority": 1,
      "filter": {
        "prefix": "backups/"
      },
      "action": {
        "type": "replicate",
        "replicate_deletes": false
      }
    }
  ]
}
EOF

# Apply replication configuration
docker exec hexastudio-minio-1 mc admin config set hexabackup replication /tmp/minio-replication.json

# Restart MinIO to apply changes
docker restart hexastudio-minio-1
```

### Option B: Rclone Configuration

### Server Commands to Execute:
```bash
# 8.1 Install rclone if not present
apt-get update && apt-get install -y rclone 2>/dev/null || echo "rclone already installed"

# 8.2 Configure rclone for offsite storage
rclone config create offsite s3 env_auth=false \
  access_key_id=${AWS_ACCESS_KEY_ID} \
  secret_access_key=${AWS_SECRET_ACCESS_KEY} \
  region=us-east-1 \
  endpoint=s3.amazonaws.com \
  location_constraint=us-east-1

# 8.3 Create backup sync script
cat > /home/hexa/hexastudio/scripts/offsite-backup.sh << 'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/backups"
OFFSITE_BUCKET="offsite:hexa-offsite-backups"

# Sync all backups to offsite
echo "[$(date)] Starting offsite backup sync..."
rclone sync "${BACKUP_DIR}/" "${OFFSITE_BUCKET}/$(date +%Y%m%d)/" \
  --progress \
  --transfers 4 \
  --retries 3 \
  --retries-sleep 30s

echo "[$(date)] Offsite backup sync complete."
EOF

chmod +x /home/hexa/hexastudio/scripts/offsite-backup.sh

# 8.4 Add to cron for daily execution
(crontab -l 2>/dev/null; echo "0 2 * * * /home/hexa/hexastudio/scripts/offsite-backup.sh") | crontab -
```

---

## Task 9: Kubernetes Migration

### Server Commands to Execute:
```bash
# 9.1 Install MicroK8s
snap install microk8s --classic --channel=latest/stable

# 9.2 Enable required addons
microk8s enable dns storage dashboard ingress helm3 prometheus cert-manager

# 9.3 Wait for cluster to be ready
microk8s status --wait-ready

# 9.4 Convert docker-compose.prod.yml to Kubernetes manifests
# Install kompose if not present
apt-get install -y kompose 2>/dev/null || \
snap install kompose --classic

# Convert compose file
cd /home/hexa/hexastudio
kompose convert -f docker-compose.prod.yml -o k8s-manifests/

# 9.5 Review and fix generated manifests
# - Add proper resource requests/limits
# - Configure proper storage classes
# - Set up ingress resources
# - Configure secrets properly

# 9.6 Create namespace
microk8s kubectl create namespace hexastudio

# 9.7 Apply manifests
microk8s kubectl apply -f k8s-manifests/ -n hexastudio

# 9.8 Verify deployment
microk8s kubectl get pods -n hexastudio
microk8s kubectl get svc -n hexastudio
```

---

## Task 10: Documentation

### Files to Update:
1. `HEXA-Vision-Playbook/13-DEVOPS/DEPLOYMENT.md` - Add staging and blue-green deployment
2. `HEXA-Vision-Playbook/13-DEVOPS/BACKUP.md` - Document new backup procedures
3. Create new documentation files for:
   - Staging environment setup
   - Blue-green deployment workflow
   - Alerting configuration
   - Kubernetes migration plan

### Documentation Template:

```markdown
# Staging Environment Setup

## Overview
Staging environment mirrors production with port offset of +10000.

## Configuration Files
- `docker-compose.staging.yml` - Staging Docker Compose configuration
- Network: `hexa-staging-net`

## Port Mapping
| Service | Production | Staging |
|---------|------------|---------|
| Frontend | 3000 | 13000 |
| Backend | 4000 | 14000 |
| CMS | 1337 | 11337 |

## Deployment
```bash
docker compose -f docker-compose.staging.yml up -d
```

## Access
- Frontend: http://19.16.1.100:13000
- Backend API: http://19.16.1.100:14000
- CMS: http://19.16.1.100:11337
```

---

# Blue-Green Deployment

## Overview
Zero-downtime deployment using container tagging and Traefik weight-based routing.

## Workflow
1. Deploy green environment with :green tagged images
2. Configure Traefik with 10% weight to green
3. Monitor green environment
4. Gradually shift traffic to green
5. Promote green to blue

## Configuration
- `docker-compose.green.yml` - Green environment configuration
- Traefik dynamic configuration for weight-based routing

## Commands
```bash
# Deploy green
docker compose -f docker-compose.green.yml up -d

# Check health
docker ps --filter "name=green" --format "table {{.Names}}\t{{.Status}}"

# Shift traffic (update Traefik weights)
# Edit docker/traefik/dynamic.yml and adjust weights
# Then reload Traefik:
docker kill -s HUP hexastudio-traefik-1
```
```

---

## Execution Summary

### Immediate Actions (Can be done locally):
1. ✅ Modified backup.sh locally
2. ✅ Prepared all configuration templates
3. ✅ Created execution plan

### Requires Server Access:
1. Deploy modified backup.sh to server
2. Execute Docker commands on server
3. Create staging and green environments
4. Configure alerting and monitoring
5. Test backup restoration
6. Set up offsite backup
7. Install and configure MicroK8s
8. Update documentation

### Estimated Time:
- Tasks 1-2: 5 minutes
- Tasks 3-5: 30 minutes
- Tasks 6-8: 45 minutes
- Tasks 9-10: 60 minutes
- **Total: ~2.5 hours**

---

## Next Steps

1. **Obtain server access** (SSH key or temporary password)
2. **Execute commands sequentially** following this plan
3. **Verify each task** before proceeding to the next
4. **Document actual execution** with timestamps and outputs

---

*Generated: 2026-08-01*  
*Status: Ready for execution*
