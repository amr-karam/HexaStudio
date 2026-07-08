# Deployment Strategy

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Deployment Pipeline

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  GitHub   │   │   CI     │   │  Build   │   │  Deploy  │
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
    image: ghcr.io/hexastudio/frontend:${VERSION}
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.hexastudio.net

  backend:
    image: ghcr.io/hexastudio/backend:${VERSION}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}

  cms:
    image: ghcr.io/hexastudio/cms:${VERSION}
    environment:
      - DATABASE_URL=${CMS_DATABASE_URL}

  odoo:
    image: ghcr.io/hexastudio/odoo:${VERSION}

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

## CI/CD Pipeline (GitHub Actions)

### Workflow: CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

### Workflow: Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker images
        run: |
          docker build -t ghcr.io/hexastudio/frontend:${{ github.sha }} -f apps/frontend/Dockerfile .
          docker build -t ghcr.io/hexastudio/backend:${{ github.sha }} -f apps/backend/Dockerfile .
          docker build -t ghcr.io/hexastudio/cms:${{ github.sha }} -f apps/cms/Dockerfile .

      - name: Push to registry
        run: |
          echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/hexastudio/frontend:${{ github.sha }}
          docker push ghcr.io/hexastudio/backend:${{ github.sha }}
          docker push ghcr.io/hexastudio/cms:${{ github.sha }}

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/hexastudio
            docker compose pull
            docker compose up -d --remove-orphans
            docker system prune -f
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
