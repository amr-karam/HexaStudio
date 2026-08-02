# Deployment Strategy

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Deployment Pipeline

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  GitLab  │   │   CI     │   │  Build   │   │  Deploy  │
│   Push    │──►│  Checks  │──►│  Image   │──►│  Server  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                     │
                     ▼
                ┌──────────┐
                │  Notify  │
                │  (Slack) │
                └──────────┘
```

---

## Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Production** | `main` | https://hexastudio.net | Live site |
| **Staging** | `develop` | https://staging.hexastudio.net | Pre-release validation |
| **Development** | `feature/*` | Localhost | Active development |

---

## Infrastructure

### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  traefik:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik/traefik.yml:/traefik.yml
      - ./traefik/acme.json:/acme.json

  frontend:
    image: registry.hexastudio.net/hexa/hexa-studio/frontend:${VERSION}
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.hexastudio.net

  backend:
    image: registry.hexastudio.net/hexa/hexa-studio/backend:${VERSION}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}

  cms:
    image: registry.hexastudio.net/hexa/hexa-studio/cms:${VERSION}
    environment:
      - DATABASE_URL=${CMS_DATABASE_URL}

  odoo:
    image: registry.hexastudio.net/hexa/hexa-studio/odoo:${VERSION}

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  minio:
    image: minio/minio:latest
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

---

## CI/CD Pipeline (GitLab CI)

> **Note:** This section previously documented GitHub Actions. As of 2026-07-24 the project migrated to self-hosted GitLab CE.
> See `.gitlab-ci.yml` at the repo root and `docs/devops/GITLAB_OPERATIONS.md` for the operational runbook.

### Pipeline Stages

```yaml
# .gitlab-ci.yml (excerpt)
stages:
  - quality   # lint, typecheck, test, security scan (Trivy + npm audit)
  - build     # Next.js, NestJS, Strapi
  - image     # Buildx + DinD → GitLab Container Registry
  - validate  # E2E, Lighthouse, visual regression, bundle analysis
  - deploy    # production (main), staging (develop)
```

### Build & Push

```yaml
build-image-backend:
  stage: image
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker buildx create --use
    - |
      docker buildx build
        --cache-from type=registry,ref=$BACKEND_IMAGE:buildcache
        --cache-to type=registry,ref=$BACKEND_IMAGE:buildcache,mode=max
        --tag $BACKEND_IMAGE:$CI_COMMIT_SHORT_SHA
        --tag $BACKEND_IMAGE:$CI_COMMIT_REF_SLUG
        --tag $BACKEND_IMAGE:latest
        --file apps/backend/Dockerfile
        --push
        .
```

### Deploy

```yaml
deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client bash
    - eval "$(ssh-agent -s)"
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - |
      ssh -p 22 ${PROD_SERVER_USER}@${PROD_SERVER_IP} << 'EOF'
        set -e
        cd /home/hexa/hexastudio
        git fetch origin main
        git reset --hard origin/main
        bash scripts/deploy-zero-downtime.sh
        docker image prune -f
      EOF
  environment:
    name: production
    url: https://hexastudio.net
  rules:
    - if: $CI_COMMIT_BRANCH == "main" && $CI_PIPELINE_SOURCE == "push"
```

---

## Health Checks

### Endpoint

```
GET /api/health
```

### Response

```json
{
  "status": "healthy",
  "timestamp": "2026-07-08T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": { "status": "connected", "latency_ms": 2 },
    "redis": { "status": "connected", "latency_ms": 1 },
    "minio": { "status": "connected", "latency_ms": 3 },
    "strapi": { "status": "connected", "latency_ms": 5 },
    "odoo": { "status": "connected", "latency_ms": 10 }
  }
}
```

### Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

---

## Zero-Downtime Deployment

### Strategy: Rolling Update

```yaml
deploy:
  mode: replicated
  replicas: 2
  update_config:
    parallelism: 1
    delay: 10s
    order: start-first
    failure_action: rollback
  rollback_config:
    parallelism: 1
    delay: 5s
    order: stop-first
```

### Pre-deployment Steps

1. Run health checks on current deployment
2. Pull new images
3. Start new containers
4. Run health checks on new containers
5. Switch traffic to new containers
6. Stop old containers
7. Verify deployment

### Rollback

If health checks fail after deployment:

```bash
docker compose rollback
# or
docker compose up -d --no-recreate <previous-tag>
```

---

## Backup Strategy

### Schedule

| Data | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| PostgreSQL (all DBs) | Every 6 hours | 30 days | pg_dump with WAL archiving |
| MinIO (media) | Daily | 7 days | mc mirror |
| Redis (cache) | Not backed up | — | Ephemeral (rebuildable) |
| Application config | Per deploy | 10 releases | Version control |
| SSL certs | Auto-renewal | — | Traefik + Let's Encrypt |

### Backup Script

```bash
#!/bin/bash
# scripts/backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/$TIMESTAMP"

mkdir -p $BACKUP_DIR

# Database backup
docker exec postgres pg_dump -U hexa hexa_frontend > $BACKUP_DIR/frontend.sql
docker exec postgres pg_dump -U hexa hexa_cms > $BACKUP_DIR/cms.sql
docker exec postgres pg_dump -U hexa hexa_odoo > $BACKUP_DIR/odoo.sql

# Encrypt backups
gpg --encrypt --recipient admin@hexastudio.net $BACKUP_DIR/frontend.sql
gpg --encrypt --recipient admin@hexastudio.net $BACKUP_DIR/cms.sql
gpg --encrypt --recipient admin@hexastudio.net $BACKUP_DIR/odoo.sql

# Upload to offsite storage
rclone copy $BACKUP_DIR s3:hexa-backups/

# Clean up old backups (keep 30 days)
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

---

## Monitoring Setup

### Alerts

| Alert | Threshold | Channel |
|-------|-----------|---------|
| Service down | Health check fails 3x | Slack + Email |
| High error rate | > 1% of requests error | Slack |
| High latency | p99 > 1s | Slack |
| Disk usage | > 80% | Slack |
| SSL expiry | < 14 days | Email |
| Backup failure | Backup script fails | Slack |

### Dashboard

Grafana dashboards at `monitor.hexastudio.net`:

- System overview (CPU, memory, disk, network)
- Container health (all services)
- API metrics (request rate, latency, error rate)
- Database metrics (connections, query time, replication lag)
- Business metrics (visitors, leads, projects)
- 3D performance (FPS, draw calls, memory)
