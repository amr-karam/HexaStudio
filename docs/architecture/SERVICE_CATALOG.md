# HEXA Studio — SERVICE CATALOG

> **Version:** 1.0 | **Last Updated:** 2026-07-26 | **Source:** `docker-compose.prod.yml`

---

## Overview

This document catalogs every Docker service deployed in the HEXA Studio production environment. Each entry captures the service's purpose, image, network topology, dependencies, volumes, environment contracts, scaling characteristics, and recovery procedures.

The production stack is composed of **4 network planes**:
| Network  | Type       | Scope                         |
|----------|------------|-------------------------------|
| `web`    | External   | Public-facing (Traefik-routed)|
| `internal` | Internal | Inter-service communication   |

---

## Services

### 1. traefik

| Attribute | Value |
|-----------|-------|
| **Purpose** | Reverse proxy, API gateway, and automatic SSL termination (Let's Encrypt via Cloudflare DNS challenge) |
| **Image** | `traefik:v2.11` |
| **Ports** | `80:80` (HTTP), `443:443` (HTTPS) |
| **Networks** | `web` |
| **Dependencies** | None (boots first to route traffic) |
| **Health Check** | N/A (Traefik API health at `api@internal`) |
| **Volumes** | `traefik_certs:/letsencrypt` (SSL certificates); `docker.sock` mounted read-only for dynamic config |
| **Config Files** | `./docker/traefik/traefik.yml` (static), `./docker/traefik/dynamic.yml` (dynamic routing) |
| **Environment** | `CLOUDFLARE_EMAIL` (sensitive), `CLOUDFLARE_API_KEY` (sensitive), `TRAEFIK_DASHBOARD_HOST` (optional) |
| **Scaling** | Single instance. Horizontal scaling possible via Docker Swarm with shared config |
| **Backup** | Stateless (config in git). SSL certs backed up via volume backup |
| **Disaster Recovery** | Redeploy from `docker-compose.prod.yml`. Restore `traefik_certs` volume from backup. Let's Encrypt auto-renews |

---

### 2. cloudflared

| Attribute | Value |
|-----------|-------|
| **Purpose** | Cloudflare Tunnel client — exposes services without a public IP, adds DDoS protection and WAF |
| **Image** | `cloudflare/cloudflared:latest` |
| **Ports** | None (outbound-only tunnel) |
| **Networks** | `web`, `internal` |
| **Dependencies** | None |
| **Health Check** | N/A (managed by Cloudflare tunnel health) |
| **Volumes** | None |
| **Environment** | `TUNNEL_TOKEN` (sensitive; created in Cloudflare Zero Trust dashboard) |
| **Scaling** | Single instance. Multiple tunnels can be configured for HA |
| **Backup** | N/A (stateless; tunnel token stored in secrets manager) |
| **Disaster Recovery** | Redeploy with same `TUNNEL_TOKEN`. Cloudflare re-establishes tunnel automatically |

---

### 3. postgres

| Attribute | Value |
|-----------|-------|
| **Purpose** | Primary relational database — stores all application data (backend, CMS, Odoo) |
| **Image** | `postgres:16-alpine` |
| **Ports** | None exposed to `web` (internal only) |
| **Networks** | `internal` |
| **Dependencies** | None |
| **Health Check** | `pg_isready -U hexastudio -d hexastudio` (interval: 10s, timeout: 5s, retries: 5) |
| **Volumes** | `postgres_data:/var/lib/postgresql/data` (persistent); `./docker/postgres/init:/docker-entrypoint-initdb.d:ro` (bootstrap scripts) |
| **Environment** | `POSTGRES_USER` (default: `hexastudio`), `POSTGRES_PASSWORD` (sensitive), `POSTGRES_DB` (default: `hexastudio`) |
| **Scaling** | Single writer instance. Read replicas can be added with connection pooling (PgBouncer) |
| **Backup** | `pg_dump` full backup every 6 hours (30-day retention); continuous WAL archiving (7-day retention). Backups stored locally and synced to MinIO/S3 via `backup` service |
| **Disaster Recovery** | Restore from latest `pg_dump` + WAL archive. See `docs/devops/DISASTER_RECOVERY.md` for step-by-step DR procedure |

---

### 4. redis

| Attribute | Value |
|-----------|-------|
| **Purpose** | In-memory cache and session store — caches 3D asset manifests, API responses, and manages rate-limiting counters |
| **Image** | `redis:7-alpine` |
| **Ports** | None exposed to `web` (internal only) |
| **Networks** | `internal` |
| **Dependencies** | None |
| **Health Check** | `redis-cli -a ${REDIS_PASSWORD} ping` (interval: 10s, timeout: 5s, retries: 5) |
| **Volumes** | `redis_data:/data` (AOF persistence) |
| **Environment** | `REDIS_PASSWORD` (sensitive; used in `--requirepass` flag) |
| **Scaling** | Single instance. Redis Cluster or Sentinel can be added for HA |
| **Backup** | AOF append-only file (continuous). RDB snapshots scheduled via `save` directive. Backups are **not** routinely offloaded (ephemeral by design). Volume backup recommended |
| **Disaster Recovery** | Restore `redis_data` volume from backup. WARNING: Redis data is considered ephemeral — backend will warm cache on restart |

---

### 5. minio

| Attribute | Value |
|-----------|-------|
| **Purpose** | S3-compatible object storage — hosts 3D models (GLB/GLTF), high-res textures, CMS uploads, and backup artifacts |
| **Image** | `minio/minio:latest` |
| **Ports** | None in `docker-compose.prod.yml` (ports implied: `9000` API, `9001` console) |
| **Networks** | `web`, `internal` |
| **Dependencies** | None (buckets initialized by `minio-init` one-shot) |
| **Health Check** | TCP check via `/dev/tcp/localhost/9000` (interval: 30s, timeout: 10s, retries: 3, start_period: 30s) |
| **Volumes** | `minio_data:/data` |
| **Environment** | `MINIO_ROOT_USER` (default: `hexastudio`), `MINIO_ROOT_PASSWORD` (sensitive) |
| **Scaling** | Single instance. MinIO Distributed mode (multi-node, erasure coding) for HA |
| **Backup** | `mc mirror` daily (7-day retention). Backups to S3/offsite via `backup` service |
| **Disaster Recovery** | Restore `minio_data` volume from backup or re-mirror from S3. Bucket policies and lifecycle rules stored in init scripts |

#### 5a. minio-init (one-shot companion)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Initializes MinIO buckets and policies on first deploy |
| **Image** | `minio/mc:latest` |
| **Restart** | `"no"` (runs once, then exits) |
| **Depends On** | `minio` (condition: `service_healthy`) |
| **Volumes** | `./docker/minio/init-buckets.sh:/scripts/init-buckets.sh:ro` |

---

### 6. qdrant

| Attribute | Value |
|-----------|-------|
| **Purpose** | Vector store for AI-powered semantic search — stores embeddings for project descriptions, design assets, and AI agent context |
| **Image** | `qdrant/qdrant:latest` |
| **Ports** | None exposed to `web`. Internal ports: `6333` (gRPC/REST), `6334` (internal cluster) |
| **Networks** | `internal` |
| **Dependencies** | None |
| **Health Check** | N/A (no health check defined in `docker-compose.prod.yml`) |
| **Volumes** | `qdrant_data:/qdrant/storage` |
| **Environment** | None required (runs with defaults; authentication can be added via `QDRANT__SERVICE__API_KEY`) |
| **Scaling** | Single instance. Qdrant cluster mode available for horizontal scaling |
| **Backup** | Volume-level backup of `qdrant_data`. Snapshots via Qdrant REST API (`/collections/{name}/snapshots`) |
| **Disaster Recovery** | Restore `qdrant_data` volume or re-import from latest snapshot. Embeddings can be regenerated from source data |

---

### 7. backend

| Attribute | Value |
|-----------|-------|
| **Purpose** | NestJS Backend-for-Frontend (BFF) — aggregates, filters, and optimizes data for the 3D experience. Serves REST API with Swagger documentation |
| **Image** | Custom build — `apps/backend/Dockerfile` |
| **Ports** | None exposed to `web` directly (routed via Traefik, internal port `4000`) |
| **Networks** | `web`, `internal` |
| **Dependencies** | `postgres` (condition: `service_healthy`), `redis` (condition: `service_healthy`) |
| **Health Check** | `wget --spider -q http://127.0.0.1:4000/api/health` (interval: 30s, timeout: 10s, retries: 3, start_period: 40s) |
| **Volumes** | None (stateless application) |
| **Environment** | `NODE_ENV`, `PORT` (4000), `DATABASE_URL` (sensitive), `REDIS_URL` (sensitive), `JWT_SECRET` (sensitive), `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `RATE_LIMIT_TTL`, `RATE_LIMIT_MAX`, `SENTRY_DSN` (sensitive), `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY` (sensitive), `MINIO_SECRET_KEY` (sensitive), `MINIO_USE_SSL`, `CMS_URL`, `REDIS_PASSWORD` (sensitive), `ODOO_HOST`, `ODOO_PORT`, `ODOO_DB`, `ODOO_USER`, `ODOO_PASSWORD` (sensitive), `ODOO_WEBHOOK_SECRET` (sensitive), `VECTOR_HOST`, `VECTOR_PORT` |
| **Scaling** | Horizontally scalable (stateless). Multiple replicas behind Traefik load balancer. Container identity managed via `SOT` (blue/green) suffix |
| **Backup** | N/A (stateless; all data persisted in postgres/redis/minio) |
| **Disaster Recovery** | Redeploy from CI/CD pipeline. Blue/green deployment (`hexa-backend-blue` / `hexa-backend-green`) enables zero-downtime rollback |

---

### 8. frontend

| Attribute | Value |
|-----------|-------|
| **Purpose** | Next.js 16.2.11 application — renders the 3D architectural visualization experience with SSR/ISR for SEO and client-side 3D canvas |
| **Image** | Custom build — `apps/frontend/Dockerfile` |
| **Ports** | None exposed to `web` directly (routed via Traefik, internal port `3000`) |
| **Networks** | `web` |
| **Dependencies** | `backend` (condition: `started`) |
| **Health Check** | `wget --spider -q http://127.0.0.1:3000` (interval: 30s, timeout: 10s, retries: 3, start_period: 40s) |
| **Volumes** | None (stateless; ISR cache is ephemeral) |
| **Build Args** | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CMS_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SENTRY_DSN` (sensitive) |
| **Environment** | `NODE_ENV`, `REVALIDATE_SECRET` (sensitive; ISR on-demand revalidation), `PREVIEW_SECRET` (sensitive; draft mode) |
| **Scaling** | Horizontally scalable (stateless). Multiple replicas behind Traefik. Container identity managed via `SOT` (blue/green) suffix |
| **Backup** | N/A (stateless; build artifacts are ephemeral) |
| **Disaster Recovery** | Redeploy from CI/CD pipeline. ISR cache warms on first request. Blue/green deployment (`hexa-frontend-blue` / `hexa-frontend-green`) enables zero-downtime rollback |

---

### 9. cms

| Attribute | Value |
|-----------|-------|
| **Purpose** | Strapi 5 headless CMS — manages architectural metadata, project descriptions, asset links, and admin interface |
| **Image** | Custom build — `apps/cms/Dockerfile` |
| **Ports** | None exposed to `web` directly (routed via Traefik, internal port `1337`) |
| **Networks** | `web`, `internal` |
| **Dependencies** | `postgres` (condition: `service_healthy`) |
| **Health Check** | `wget --spider -q http://127.0.0.1:1337/_health` (interval: 30s, timeout: 10s, retries: 3, start_period: 40s) |
| **Volumes** | `cms_uploads:/opt/app/public/uploads` (user-uploaded media) |
| **Environment** | `NODE_ENV`, `HOST` (0.0.0.0), `PORT` (1337), `DATABASE_CLIENT`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` (sensitive), `DATABASE_SSL`, `CMS_URL`, `REDIS_PASSWORD` (sensitive), `REDIS_HOST`, `MINIO_ROOT_USER` (sensitive), `MINIO_ROOT_PASSWORD` (sensitive), `DATABASE_URL` (sensitive), `APP_KEYS` (sensitive), `API_TOKEN_SALT` (sensitive), `ADMIN_JWT_SECRET` (sensitive), `TRANSFER_TOKEN_SALT` (sensitive), `JWT_SECRET` (sensitive), `CLIENT_URL`, `PREVIEW_SECRET` (sensitive) |
| **Scaling** | Single instance. Strapi 5 supports horizontal scaling with shared database and upload provider (MinIO) |
| **Backup** | Database backed up via `pg_dump` (CMS data in `hexastudio_cms` database). Uploads backed up via `cms_uploads` volume |
| **Disaster Recovery** | Restore CMS database from latest pg_dump. Restore `cms_uploads` volume. Rebuild content types from Strapi schema migration files |

---

### 10. odoo

| Attribute | Value |
|-----------|-------|
| **Purpose** | Odoo 17 ERP — CRM, sales pipeline, project management, invoicing, and document management |
| **Image** | `odoo:17.0` (official image) |
| **Ports** | None exposed to `web` directly (routed via Traefik, internal port `8069`). Longpolling port `8072` (implied) |
| **Networks** | `web`, `internal` |
| **Dependencies** | `postgres` (condition: `service_healthy`) |
| **Health Check** | N/A (no health check defined in `docker-compose.prod.yml`) |
| **Volumes** | `odoo_data:/var/lib/odoo` (filestore and sessions); `./docker/odoo/odoo.conf:/etc/odoo/odoo.conf:ro`; `./docker/odoo/addons:/mnt/extra-addons:ro`; `./docker/odoo/entrypoint.sh:/entrypoint.d/hexa-entrypoint.sh:ro` |
| **Environment** | `HOST` (postgres), `PORT` (5432), `USER` (sensitive), `PASSWORD` (sensitive), `DBNAME` (`hexastudio_odoo`), `ODOO_MASTER_PASSWORD` (sensitive) |
| **Scaling** | Single instance. Odoo supports horizontal scaling with shared filestore and database. Worker processes configured via `--workers` in config |
| **Backup** | Database backed up via `pg_dump` (Odoo data in `hexastudio_odoo` database). Filestore backed up via `odoo_data` volume |
| **Disaster Recovery** | Restore Odoo database from latest pg_dump. Restore `odoo_data` volume. Reinstall custom addons from `./docker/odoo/addons` (git-controlled) |

---

### 11. odoo-db

| Attribute | Value |
|-----------|-------|
| **Purpose** | Dedicated PostgreSQL database for Odoo ERP (development/staging). **Note:** In production (`docker-compose.prod.yml`), Odoo shares the main `postgres` service. A dedicated instance is used in local development (`docker-compose.yml`) |
| **Image** | `postgres:16-alpine` |
| **Ports** | None exposed (internal only) |
| **Networks** | `internal` |
| **Dependencies** | None |
| **Health Check** | `pg_isready -U ${ODOO_DB_USER} -d ${ODOO_DB}` |
| **Volumes** | `odoo_db_data:/var/lib/postgresql/data` (separate volume from main postgres) |
| **Environment** | `POSTGRES_USER` (sensitive), `POSTGRES_PASSWORD` (sensitive), `POSTGRES_DB` (`hexastudio_odoo`) |
| **Scaling** | Single instance |
| **Backup** | `pg_dump` via backup service (same schedule as main postgres) |
| **Disaster Recovery** | In production, covered by main postgres DR plan. For dedicated instance, restore `odoo_db_data` volume from backup |

---

### 12. odoo-queue

| Attribute | Value |
|-----------|-------|
| **Purpose** | Odoo async job queue — processes background tasks (email sending, document generation, automated workflows). **Design Note:** Not yet deployed in the current stack; documented here as a planned service for future sprints |
| **Image** | `odoo:17.0` (same as main Odoo, launched with `--workers` or `--max-cron-threads` flags) |
| **Ports** | None exposed (internal only) |
| **Networks** | `internal` |
| **Dependencies** | `postgres` (or `odoo-db`), `redis` (for queued job coordination) |
| **Health Check** | Proposed: Odoo health endpoint or queue worker process check |
| **Volumes** | Shared `odoo_data` for filestore access |
| **Environment** | Same as Odoo service, with additional `ODOO_QUEUE_WORKERS` count |
| **Scaling** | Horizontally scalable — each worker instance processes independent jobs |
| **Backup** | N/A (stateless; backed by database persistence) |
| **Disaster Recovery** | Redeploy worker instance. Jobs are idempotent and retried on failure |

---

### 13. prometheus

| Attribute | Value |
|-----------|-------|
| **Purpose** | Metrics collection and alerting — scrapes metrics from all services, stores time-series data for dashboards and alert rules |
| **Image** | `prom/prometheus:v2.54.1` |
| **Ports** | None exposed to `web` directly (routed via Traefik, internal port `9090`) |
| **Networks** | `web`, `internal` |
| **Dependencies** | None |
| **Health Check** | N/A (Prometheus `/-/healthy` endpoint available) |
| **Volumes** | `prometheus_data:/prometheus` (TSDB); `./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro` |
| **Environment** | None required (scrape targets defined in config file) |
| **Scaling** | Single instance. Prometheus HA with Thanos or Cortex for long-term storage |
| **Backup** | Volume-level backup of `prometheus_data`. Retention policy limits data window (typically 15-30 days) |
| **Disaster Recovery** | Restore `prometheus_data` volume. Scrape targets re-populate metrics automatically. Alert rules and recording rules are git-controlled in config file |

---

### 14. grafana

| Attribute | Value |
|-----------|-------|
| **Purpose** | Metrics visualization dashboard — unified observability UI for system metrics, logs (Loki), and traces (Tempo) |
| **Image** | `grafana/grafana:11.3.0` |
| **Ports** | None exposed to `web` directly (routed via Traefik, internal port `3001`. **Note:** port `3001` to avoid conflict with frontend on `3000`) |
| **Networks** | `web`, `internal` |
| **Dependencies** | `prometheus`, `loki` |
| **Health Check** | N/A (Grafana `/api/health` endpoint available) |
| **Volumes** | `grafana_data:/var/lib/grafana` (dashboards, datasources, user config); `./docker/grafana/provisioning:/etc/grafana/provisioning:ro` (auto-provisioning) |
| **Environment** | `GF_SECURITY_ADMIN_USER` (default: `admin`), `GF_SECURITY_ADMIN_PASSWORD` (sensitive), `GF_USERS_ALLOW_SIGN_UP` (`false`), `GF_SERVER_ROOT_URL`, `CMS_URL`, `REDIS_PASSWORD` (sensitive), `REDIS_HOST`, `MINIO_ROOT_USER` (sensitive), `MINIO_ROOT_PASSWORD` (sensitive) |
| **Scaling** | Single instance. Grafana HA with shared `grafana_data` on NFS or PostgreSQL-backed config |
| **Backup** | Volume backup of `grafana_data` for dashboards + user config. Dashboards should also be exported to git as JSON |
| **Disaster Recovery** | Restore `grafana_data` volume. Re-provision datasources from `./docker/grafana/provisioning/` (git-controlled). Recreate users from backup |

---

### 15. loki

| Attribute | Value |
|-----------|-------|
| **Purpose** | Log aggregation system — collects and indexes logs from all services via Promtail, enabling centralized log querying |
| **Image** | `grafana/loki:3.2.1` |
| **Ports** | None exposed (internal only; API port `3100`) |
| **Networks** | `internal` |
| **Dependencies** | None |
| **Health Check** | N/A (Loki `/ready` and `/metrics` endpoints available) |
| **Volumes** | `loki_data:/loki` (log index and chunks); `./docker/loki/loki-config.yml:/etc/loki/loki-config.yml:ro` |
| **Environment** | None required (config file controls retention and storage) |
| **Scaling** | Single instance (monolith mode). Loki can be scaled into microservices (distributor, ingester, querier) for high volume |
| **Backup** | Not backed up by default (log retention policy governs data lifespan). Volume backup optional for compliance |
| **Disaster Recovery** | Restart Loki; it re-indexes existing log files. Logs from active services are re-shipped by Promtail. Retention window: typically 7-30 days |

---

### 16. promtail

| Attribute | Value |
|-----------|-------|
| **Purpose** | Log shipper — tails Docker container logs and forwards them to Loki |
| **Image** | `grafana/promtail:3.2.1` |
| **Ports** | None exposed (internal only) |
| **Networks** | `internal` |
| **Dependencies** | `loki` (condition: `started`) |
| **Health Check** | N/A (Promtail exposes `/ready` endpoint) |
| **Volumes** | `./docker/loki/promtail-config.yml:/etc/promtail/promtail-config.yml:ro`; `/var/run/docker.sock:/var/run/docker.sock:ro` (reads container logs) |
| **Environment** | None required (config file defines scrape targets) |
| **Scaling** | One instance per Docker host (daemon set model). For multi-node, deploy one Promtail per host |
| **Backup** | N/A (stateless) |
| **Disaster Recovery** | Restart Promtail; it re-reads config and resumes shipping logs |

---

### 17. node-exporter

| Attribute | Value |
|-----------|-------|
| **Purpose** | Host metrics exporter — exposes CPU, memory, disk, and network metrics from the Docker host for Prometheus scraping |
| **Image** | `prom/node-exporter:v1.8.2` |
| **Ports** | None exposed (internal only; metrics port `9100`) |
| **Networks** | `internal` |
| **Dependencies** | None |
| **Health Check** | N/A (Node Exporter exposes `/metrics` endpoint) |
| **Volumes** | `/proc:/host/proc:ro`, `/sys:/host/sys:ro` (reads host metrics) |
| **Environment** | None required |
| **Scaling** | One instance per Docker host. For multi-node, deploy one Node Exporter per host |
| **Backup** | N/A (stateless) |
| **Disaster Recovery** | Restart Node Exporter; metrics resume automatically |

---

### 18. tempo

| Attribute | Value |
|-----------|-------|
| **Purpose** | Distributed tracing backend — collects OpenTelemetry traces from backend services for performance analysis and bottleneck identification |
| **Image** | `grafana/tempo:latest` (recommended; config file present at `docker/tempo/tempo.yml`) |
| **Ports** | None exposed (internal only; ports `3200` HTTP, `4318` OTLP HTTP). Receives OTLP traces on `4318` |
| **Networks** | `internal` |
| **Dependencies** | None |
| **Health Check** | Proposed: Tempo `/ready` endpoint |
| **Volumes** | `tempo_data:/tmp/tempo` (blocks and WAL); `./docker/tempo/tempo.yml:/etc/tempo/tempo.yml:ro` |
| **Environment** | None required (config file controls retention and storage backend) |
| **Scaling** | Single instance (monolith mode). Tempo can be scaled (distributor, ingester, querier, compactor) for HA |
| **Backup** | Not backed up by default (trace data is useful for recent debugging, retention typically 24-48h) |
| **Disaster Recovery** | **Note:** Tempo service is not yet deployed in `docker-compose.prod.yml` but the config file and volume declaration exist. To deploy, add `tempo:` service entry, uncomment `tempo_data:` volume, and configure Traefik routing. After deployment, restart and traces auto-populate from instrumented services |

---

### 19. watchtower

| Attribute | Value |
|-----------|-------|
| **Purpose** | Automatic container image updater — periodically checks Docker Hub for newer images and restarts containers with updated ones |
| **Image** | `containrrr/watchtower:latest` |
| **Ports** | None exposed |
| **Networks** | None required (uses Docker socket) |
| **Dependencies** | None |
| **Health Check** | N/A |
| **Volumes** | `/var/run/docker.sock:/var/run/docker.sock:ro` |
| **Environment** | `WATCHTOWER_CLEANUP` (`true`; removes old images), `WATCHTOWER_SCHEDULE` (`"0 0 6 * * *"`; daily at 06:00), `WATCHTOWER_LABEL_ENABLE` (`true`; only updates containers with `com.centurylinklabs.watchtower.enable=true`), `DOCKER_API_VERSION` (`1.40`) |
| **Scaling** | Single instance (one Watchtower per Docker host) |
| **Backup** | N/A (stateless) |
| **Disaster Recovery** | Restart Watchtower. **Caution:** Watchtower is label-gated — only services with `com.centurylinklabs.watchtower.enable=true` label are auto-updated. Currently enabled on: `minio`, `odoo`. Custom-built images (`frontend`, `backend`, `cms`) are excluded and must be updated via CI/CD |

---

### 20. backup

| Attribute | Value |
|-----------|-------|
| **Purpose** | Automated database backup orchestrator — performs `pg_dump` of all databases and syncs backups to MinIO/S3 |
| **Image** | `postgres:16-alpine` (uses pg_dump and mc client) |
| **Ports** | None exposed |
| **Networks** | `web`, `internal` |
| **Dependencies** | `postgres` (condition: `service_healthy`) |
| **Health Check** | N/A (scheduled execution via cron inside container) |
| **Volumes** | `./docker/backup/backup.sh:/scripts/backup.sh:ro`; `backup_data:/backups` (local backup staging) |
| **Environment** | `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (sensitive), `POSTGRES_DB`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY` (sensitive), `MINIO_SECRET_KEY` (sensitive), `BACKUP_DIR` (`/backups`) |
| **Scaling** | Single instance. For HA, deploy duplicate backup service with overlapping schedule |
| **Backup** | N/A (backup service IS the backup). Stores encrypted `.dump.gpg` files locally and syncs to MinIO |
| **Disaster Recovery** | Run `backup-verify` container (profile `verify`) to validate latest backup integrity. Restore using `pg_restore` from latest valid dump. See `docs/devops/BACKUP.md` for detailed restore procedure |

#### 20a. backup-verify (companion)

| Attribute | Value |
|-----------|-------|
| **Purpose** | On-demand backup integrity verification — decrypts and tests the latest backup without restoring to production |
| **Image** | `postgres:16-alpine` |
| **Profile** | `verify` (run via `docker compose --profile verify run backup-verify`) |
| **Volumes** | `./docker/backup/verify-backup.sh:/scripts/verify-backup.sh:ro`; `backup_data:/backups:ro` |

---

## Network Topology

```
Internet
    │
    ▼
Cloudflare (CDN, WAF, DNS)
    │
    ▼
cloudflared (Tunnel)
    │
    ▼
┌───────── traefik (port 80/443) ─────────┐
│  web network                             │
│                                          │
│  frontend  :3000   ──── backend  :4000    │
│  grafana   :3001   ──── cms      :1337    │
│  minio     :9000   ──── odoo     :8069    │
└───────────────────┬──────────────────────┘
                    │
          ┌─────────┴──────────┐
          │   internal network  │
          │   (internal: true)  │
          │                     │
          │  postgres  :5432    │
          │  redis     :6379    │
          │  minio     :9000    │
          │  qdrant    :6333    │
          │  loki      :3100    │
          │  promtail           │
          │  prometheus :9090   │
          │  node-exporter:9100 │
          │  tempo     :3200    │
          └─────────────────────┘
```

## Backup Matrix

| Service | Data Type | Backup Method | Frequency | Retention |
|---------|-----------|---------------|-----------|-----------|
| postgres | Database | `pg_dump` (custom, encrypted) | Every 6h | 30 days |
| redis | AOF/RDB | Volume snapshot | Not scheduled | Ephemeral |
| minio | Objects | `mc mirror` | Daily | 7 days |
| qdrant | Vectors | Volume snapshot + API snapshots | Daily | 7 days |
| cms | Uploads | Volume (`cms_uploads`) | Daily | 30 days |
| odoo | Filestore | Volume (`odoo_data`) | Daily | 30 days |
| traefik | SSL certs | Volume (`traefik_certs`) | Per renewal | Until expiry |
| grafana | Dashboards | Volume + git export | Per change | Git history |
| prometheus | Metrics | Volume (retention-limited) | Not backed up | 15-30 days |
| loki | Logs | Volume (retention-limited) | Not backed up | 7-30 days |
| tempo | Traces | Volume (retention-limited) | Not backed up | 48h |

## Blue/Green Deployment

Services `backend`, `frontend`, and `cms` use an `SOT` (Source of Truth) environment variable suffix:

- Current live: `hexa-backend-blue`, `hexa-frontend-blue`, `hexa-cms-blue`
- Staging replacement: `hexa-backend-green`, `hexa-frontend-green`, `hexa-cms-green`

Traefik routing labels switch atomically via CI/CD pipeline after health checks pass.

## Cross-References

- System Architecture: `docs/architecture/SYSTEM_ARCHITECTURE.md`
- Deployment Strategy: `docs/devops/DEPLOYMENT_STRATEGY.md`
- Backup Procedures: `docs/devops/BACKUP.md`
- Disaster Recovery: `docs/devops/DISASTER_RECOVERY.md`
- Monitoring Setup: `docs/devops/monitoring-setup.md`
- Infrastructure Spec: `docs/devops/infrastructure.md`
- Docker Compose Reference: `docs/devops/DOCKER_COMPOSE.md`
