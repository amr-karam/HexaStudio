# HEXA Studio — Infrastructure Governance

**Version:** 1.1 | **Last Updated:** 2026-07-27 | **Authority:** DevOps Lead

## Table of Contents

1. [Server Governance](#1-server-governance)
2. [Docker & Docker Compose](#2-docker--docker-compose)
3. [GitLab CE & Runner](#3-gitlab-ce--runner)
4. [Container Registry](#4-container-registry)
5. [Cloudflare](#5-cloudflare)
6. [Traefik](#6-traefik)
7. [PostgreSQL](#7-postgresql)
8. [Redis](#8-redis)
9. [MinIO](#9-minio)
10. [Prometheus & Grafana](#10-prometheus--grafana)
11. [Loki & Promtail](#11-loki--promtail)
12. [Tempo](#12-tempo)
13. [SMTP / Email](#13-smtp--email)
14. [Backup Service](#14-backup-service)
15. [Disaster Recovery](#15-disaster-recovery)
16. [Scaling Strategy](#16-scaling-strategy)
17. [Password Rotation Policy](#17-password-rotation-policy)

---

## 1. Server Governance

### 1.1 Specification

| Component | Production | Staging |
|-----------|-----------|---------|
| CPU | 8 vCPUs (Intel Xeon / AMD EPYC) | 4 vCPUs |
| RAM | 32 GB | 16 GB |
| Storage | 500 GB NVMe SSD (root) + 1 TB SSD (data) | 250 GB SSD |
| Network | 1 Gbps dedicated | 500 Mbps |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| Docker | CE 26+ | CE 26+ |
| Docker Compose | v2 | v2 |

### 1.2 Security Hardening

```bash
# -- Initial lockdown (run on provision) --
# 1. Disable root password login
sudo passwd -l root

# 2. Create deploy user with sudo
sudo adduser hexa
sudo usermod -aG sudo hexa

# 3. SSH key-only, no password auth
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 4. Firewall (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from <management-ip> to any port 22
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from 172.16.0.0/12
sudo ufw --force enable

# 5. Fail2Ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### 1.3 Update Policy

| Update Type | Frequency | Window | Approval |
|------------|-----------|--------|----------|
| Security patches | As released | Within 24h | Automated |
| Kernel updates | Monthly | Maintenance window | DevOps Lead |
| Docker updates | Quarterly | Scheduled downtime | DevOps Lead |
| Ubuntu LTS upgrades | Per LTS cycle | Planned migration | Project Lead |

### 1.4 Monitoring & Alerts

- **Node Exporter**: CPU, memory, disk, network, load
- **cAdvisor**: Per-container resource usage
- **Prometheus**: Scrape every 15s
- **Alerts**: CPU > 85%, memory > 90%, disk < 10%, load > 8 (all via Slack)

---

## 2. Docker & Docker Compose

### 2.1 Network Architecture

Two strict network boundaries:

| Network | Name | Type | Purpose |
|---------|------|------|---------|
| Public | `hexastudio_web` | Bridge | Ingress traffic (Traefik, Frontend, Backend, CMS, Odoo, MinIO) |
| Internal | `hexastudio_internal` | Internal (no egress) | Private data layer (PostgreSQL, Redis, Qdrant, Prometheus, Loki) |

### 2.2 Volume Management

| Volume | Path | Size | Backup | Purpose |
|--------|------|------|--------|---------|
| `postgres_data` | `/data/postgres` | 100 GB | Yes (`pg_dump -Fc` via `backup` service) | Database files |
| `redis_data` | `/data/redis` | 1 GB | No (ephemeral) | Cache data |
| `minio_data` | `/data/minio` | 500 GB | No (not backed up — see [BACKUP.md]$1) | Object storage |
| `loki_data` | `/data/loki` | 50 GB | No (retention policy) | Log storage |
| `prometheus_data` | `/data/prometheus` | 20 GB | No (retention policy) | Metrics |
| `tempo_data` | `/data/tempo` | 10 GB | No | Traces |
| `grafana_data` | `/data/grafana` | 5 GB | Yes (dashboards) | Grafana state |

### 2.3 Secrets Management

- Secrets are injected via environment variables using `${VAR:?error}` strict syntax
- `.env` file is **never committed** to Git
- Production secrets stored in GitLab CI/CD variables (masked)
- Docker secrets (`/run/secrets/`) used for sensitive files

### 2.4 Dockerfile Standards

All application Dockerfiles follow multi-stage builds:

1. **`deps`**: Minimal base with production npm deps
2. **`builder`**: TypeScript compilation, Next.js standalone bundle
3. **`runner`**: Distroless or Alpine, non-root `node` user

### 2.5 Resource Limits

| Service | CPU Limit | RAM Limit | RAM Reservation |
|---------|-----------|-----------|-----------------|
| `frontend` | 1.0 vCPU | 512 MB | 256 MB |
| `backend` | 1.0 vCPU | 1 GB | 512 MB |
| `cms` | 1.5 vCPU | 4 GB | 1 GB |
| `postgres` | 2.0 vCPU | 4 GB | 2 GB |
| `redis` | 0.5 vCPU | 512 MB | 128 MB |
| `qdrant` | 1.0 vCPU | 2 GB | 512 MB |
| `minio` | 1.0 vCPU | 1 GB | 256 MB |
| `odoo` | 2.0 vCPU | 4 GB | 1 GB |

### 2.6 Logging Policy

All containers use the `json-file` log driver with rotation:

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 3. GitLab CE & Runner

### 3.1 Instance Details

| Property | Value |
|----------|-------|
| Host | Self-hosted (19.16.1.100) |
| HTTP Port | 8929 |
| Registry Port | 5050 |
| SSH Port | 2222 |
| Version | GitLab CE latest |
| Storage | Docker volume (`gitlab_data`) |

### 3.2 Runner Configuration

- **Executor**: Docker
- **Concurrency**: 4
- **Image**: `docker:24-dind` for Docker-in-Docker builds
- **Tags**: `docker`, `hexa-prod`
- **Untagged jobs**: No (all jobs must specify tags)

### 3.3 Maintenance Tasks

| Task | Frequency | Command |
|------|-----------|---------|
| Backup GitLab data | Daily | `docker exec gitlab gitlab-rake gitlab:backup:create` |
| Check runner status | Weekly | `docker exec gitlab-runner gitlab-runner status` |
| GitLab version upgrade | Quarterly | `docker compose -f docker-compose.gitlab.yml pull && up -d` |
| Clean old pipelines | Monthly | GitLab UI: Admin > CI/CD > Jobs > Clean |
| Verify registry disk | Monthly | `docker system df` on host |

### 3.4 Security Configuration

- Protected branches: `main`, `develop` (Maintainer+ only)
- MR approvals required: 1
- Pipeline must succeed before merge
- Secrets stored as masked CI/CD variables
- SSH keys stored as file-type CI/CD variables

---

## 4. Container Registry

### 4.1 Registry Access

- **URL**: `$CI_REGISTRY` (auto-provided by GitLab)
- **Authentication**: Auto-login via `$CI_REGISTRY_USER` / `$CI_REGISTRY_PASSWORD`
- **Image naming**: `$CI_REGISTRY_IMAGE/{backend,frontend,cms}`

### 4.2 Image Tags & Retention

| Tag Pattern | Purpose | Retention |
|-------------|---------|-----------|
| `:{SHA}` | Immutable per-commit | 90 days |
| `:{branch-slug}` | Mutable branch pointer | 30 days |
| `:latest` | Current deployable | Active |
| `:buildcache` | Buildx cache | Indefinite |

### 4.3 Cleanup Policy

- Old images cleaned weekly via GitLab UI or API
- `buildcache` images are overwritten each build
- CI/CD pipeline automatically prunes unused images post-deploy

---

## 5. Cloudflare

### 5.1 DNS Records

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `@` | Server IP | Proxied (orange cloud) |
| A | `api` | Server IP | Proxied |
| A | `cms` | Server IP | Proxied |
| A | `odoo` | Server IP | Proxied |
| A | `portal` | Server IP | Proxied |
| A | `monitor` | Server IP | Proxied (Access only) |
| A | `status` | Server IP | Proxied (Access only) |
| CNAME | `www` | `hexastudio.net` | Proxied |

### 5.2 WAF Rules

| Rule | Action | Description |
|------|--------|-------------|
| Rate limiting: API > 100 req/min/IP | Block | Prevent API abuse |
| Rate limiting: Login > 10 req/min/IP | Block | Brute force protection |
| Block known bad IPs (threat score > 50) | Block | Threat intelligence |
| Challenge under attack mode | JS Challenge | DDoS mitigation |
| Allow health check user-agents | Skip | Uptime monitoring |

### 5.3 CDN Configuration

- **Cache level**: Standard (cache everything static)
- **Edge cache TTL**: 30 days for static assets
- **Browser cache TTL**: 1 year for hashed assets
- **Auto-minify**: HTML, CSS, JS enabled
- **Brotli compression**: Enabled
- **HTTP/2 & HTTP/3**: Enabled

### 5.4 Cloudflare Tunnel

- **Service**: `cloudflared` runs as Docker container
- **Ingress rules**: Defined in `config.yml`
- **Zero Trust Access**: Monitoring endpoints protected behind Cloudflare Access

---

## 6. Traefik

### 6.1 Configuration

| Setting | Value |
|---------|-------|
| Version | v3.0 |
| Dashboard | Enabled, restricted to internal IPs |
| ACME | Let's Encrypt (TLS challenge) |
| Log level | INFO (ERROR in production debug) |
| Access logs | Enabled, JSON format |

### 6.2 Routing Rules

| Service | Domain | Backend | TLS |
|---------|--------|---------|-----|
| Frontend | `hexastudio.net` | `frontend:3000` | Let's Encrypt |
| API | `api.hexastudio.net` | `backend:4000` | Let's Encrypt |
| CMS | `cms.hexastudio.net` | `cms:1337` | Let's Encrypt |
| Odoo | `odoo.hexastudio.net` | `odoo:8069` | Let's Encrypt |
| Grafana | `monitor.hexastudio.net` | `grafana:3001` | Let's Encrypt |
| Uptime | `status.hexastudio.net` | `uptime-kuma:3001` | Let's Encrypt |
| GitLab | `gitlab.hexastudio.net` | `gitlab:8929` | Let's Encrypt |

### 6.3 Middleware Configuration

```yaml
# Rate limiting
rate-limit:
  rateLimit:
    average: 100
    burst: 50

# Security headers
secure-headers:
  headers:
    frameDeny: true
    sslRedirect: true
    browserXssFilter: true
    contentTypeNosniff: true
    referrerPolicy: "strict-origin-when-cross-origin"
    permissionsPolicy: "camera=(), microphone=(), geolocation=()"

# Compression
compress:
  compress: {}

# IP whitelist for admin
admin-whitelist:
  ipWhiteList:
    sourceRange:
      - "10.0.0.0/8"
      - "172.16.0.0/12"
```

### 6.4 TLS Management

- Auto-renewal via Let's Encrypt ACME
- Certificates stored in `acme.json` (Docker volume)
- Staging certs for testing, production certs for live
- Certificate expiry alerts at 10 days (warning) and 0 days (critical)

---

## 7. PostgreSQL

### 7.1 Connection Pooling

| Pool | Service | Max Connections | Application |
|------|---------|----------------|-------------|
| Backend pool | Backend (NestJS) | 25 | Primary API |
| CMS pool | Strapi | 10 | Content management |
| Odoo pool | Odoo ERP | 20 | Business engine |

### 7.2 Backup Policy

| Backup Type | Frequency | Retention | Storage | Encryption |
|-------------|-----------|-----------|---------|------------|
| Full pg_dump (custom format, `pg_dump -Fc`) | Every 24h (sleep-loop service) | 30 days | Local `backup_data` volume + MinIO `backups` bucket | None |
| WAL archiving | Not implemented | - | - | - |
| Point-in-time recovery | Not implemented | - | - | - |

### 7.3 Replication

- **Standby**: Not currently configured (single server)
- **Future**: Streaming replication to read replica for reporting
- **Monitoring**: Replication lag via `postgres-exporter`

### 7.4 Performance Notes

| Parameter | Value | Context |
|-----------|-------|---------|
| `shared_buffers` | 1 GB | 25% of RAM |
| `effective_cache_size` | 3 GB | 75% of RAM |
| `work_mem` | 16 MB | Per-operation sort memory |
| `maintenance_work_mem` | 256 MB | VACUUM, CREATE INDEX |
| `max_connections` | 100 | Total across all pools |
| `wal_level` | replica | WAL archiving enabled |
| `archive_mode` | on | Required for PITR |
| `random_page_cost` | 1.1 | SSD-optimized |

---

## 8. Redis

### 8.1 Data Categories

| Category | Key Pattern | Persistence | TTL |
|----------|-------------|-------------|-----|
| Session data | `session:{id}` | RDB (snapshot) | 24h |
| Cache: API responses | `cache:{path}` | None | 5-60m |
| Cache: 3D manifests | `manifest:{id}` | None | 1h |
| Queue: Pending Odoo sync | `odoo:pending-*` | RDB | Until processed |
| Rate limit counters | `ratelimit:{ip}:{endpoint}` | None | Window-based |

### 8.2 Persistence

| Setting | Value | Rationale |
|---------|-------|-----------|
| `save ""` | RDB disabled for cache | Acceptable data loss |
| `appendonly no` | AOF disabled | Performance > durability |
| `maxmemory` | 256 MB | Limit to reserved RAM |
| `maxmemory-policy` | `allkeys-lru` | Evict least recently used |

Note: Session data and queues use a separate Redis instance (or DB index) with RDB persistence enabled.

### 8.3 Monitoring

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Used memory | > 85% of max | Warning |
| Hit rate | < 80% | Warning |
| Connected clients | > 100 | Warning |
| Replication lag | > 5s | Critical |

---

## 9. MinIO

### 9.1 Bucket Structure

```
hexa-studio/
├── projects/
│   └── {project-uuid}/
│       ├── renders/       # Final rendered images
│       ├── models/        # GLB/GLTF 3D models
│       ├── documents/     # PDF, DOCX, spreadsheets
│       └── client-uploads/ # Client-submitted files
├── cms/
│   ├── portfolio/         # Strapi portfolio media
│   ├── blog/              # Blog images
│   └── services/          # Service page assets
├── users/
│   └── {user-uuid}/
│       └── avatars/       # Profile pictures
└── temp/
    └── uploads/           # Staging area (auto-clean 24h)
```

### 9.2 Bucket Policies

| Bucket | Public Access | Presigned URLs | Versioning | Lifecycle |
|--------|--------------|----------------|------------|-----------|
| `hexa-studio` | No | Yes (1h expiry) | Disabled | 30-day cleanup for `temp/` |
| `backups` | DB dump offsite copy (written by `docker/backup/backup.sh`) | No | - | None |

### 9.3 Access Control

- Application access via access key / secret key (environment variables)
- Signed URLs for client downloads (1 hour expiry)
- No anonymous public access to buckets
- TLS enforced for all connections

### 9.4 Backup

| Frequency | Method | Retention | Destination |
|-----------|--------|-----------|-------------|
| - | **Not backed up** — MinIO object store has no mirror job (GAP, see [BACKUP.md]$1) | - | - |
| Per-project completion | Manual archive | Indefinite | Cold storage |

---

## 10. Prometheus & Grafana

### 10.1 Scrape Targets

| Target | Endpoint | Port | Interval |
|--------|----------|------|----------|
| Prometheus self | `/metrics` | 9090 | 15s |
| Traefik | `/metrics` | 8080 | 15s |
| Backend | `/api/metrics` | 4000 | 15s |
| Frontend | `/_metrics` | 3000 | 15s |
| CMS | Strapi metrics | 1337 | 15s |
| Qdrant | `/metrics` | 6333 | 15s |
| Redis exporter | `/metrics` | 9121 | 15s |
| Postgres exporter | `/metrics` | 9187 | 15s |
| MinIO | `/minio/v2/metrics/cluster` | 9000 | 15s |
| Node Exporter | `/metrics` | 9100 | 15s |
| cAdvisor | `/metrics` | 8080 | 15s |

### 10.2 Data Retention

| Component | Retention | Storage |
|-----------|-----------|---------|
| Prometheus metrics | 30 days | 20 GB |
| Grafana dashboards | Indefinite | Docker volume + Git |
| Alertmanager history | 120h | Local |

### 10.3 Dashboard Categories

| Dashboard | Sources | Description |
|-----------|---------|-------------|
| Infrastructure Overview | Prometheus | CPU, memory, disk, network, container health |
| Backend RED | Prometheus | Request rate, error rate, latency (p50/p95/p99) |
| System Overview | Prometheus | Node-level metrics (load, memory, disk I/O) |
| Database | Prometheus | Connections, query time, replication lag |
| Business Metrics | Prometheus | Visitors, leads, projects, revenue |
| Web Vitals | Prometheus | LCP, CLS, INP, FCP, TTFB |
| Trace Explorer | Tempo | Distributed trace waterfall |
| Logs Explorer | Loki | Ad-hoc log querying |

### 10.4 Alerting

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| Host down | `up == 0` for 1m | Critical | Slack + PagerDuty |
| Service down | `up{job=~"backend|frontend|postgres|redis|minio"} == 0` for 1m | Critical | Slack + PagerDuty |
| High CPU | CPU > 85% for 10m | Warning | Slack |
| High memory | Memory > 90% for 5m | Warning | Slack |
| Disk critical | Disk < 10% for 5m | Critical | Slack + PagerDuty |
| Disk warning | Disk < 25% for 10m | Warning | Slack |
| High error rate | 5xx > 5% for 2m | Critical | Slack |
| High latency | p99 > 3s for 5m | Warning | Slack |
| Container restart loop | > 3 restarts in 15m | Critical | Slack |
| Backup failure | `backup_job_failed_total > 0` | Critical | Slack + PagerDuty |
| SSL cert expiring | < 10 days | Warning | Email |

---

## 11. Loki & Promtail

### 11.1 Log Shipping

| Source | Promtail Job | Pipeline Stage | Retention |
|--------|-------------|----------------|-----------|
| Backend (NestJS) | `backend` | JSON parse (level, message, timestamp, context, trace) | 7 days |
| Frontend (Next.js) | `frontend` | JSON parse (level, message, timestamp, route, userId) | 7 days |
| Nginx access | `nginx` | Regex parse (remote_addr, status, bytes) | 7 days |
| Nginx error | `nginx` | Regex parse (level, pid, tid, message) | 7 days |
| Docker containers | `containers` | JSON parse + regex pipeline | 7 days |

### 11.2 Loki Configuration

| Setting | Value |
|---------|-------|
| Storage | Filesystem |
| Retention | 168h (7 days) |
| Ingestion rate limit | 20 MB/s |
| Replication factor | 1 (single server) |
| Chunk size | 1 MB |
| Max query series | 5000 |

### 11.3 Log Alerts

| Alert | Expression | For | Severity |
|-------|-----------|-----|----------|
| High error rate | Error/fatal/exception log rate > 5% of total | 5m | Warning |
| Critical errors | Critical/fatal/panic logs detected | 1m | Critical |
| Exception spike | Backend exception rate > 0.1/s | 2m | Warning |
| Auth failure spike | Auth failure rate > 0.5/s | 5m | Warning |
| DB connection errors | Connection refused/timeout/pool exhausted | 2m | Critical |
| Security events | SQL injection / XSS / CSRF / brute force | 1m | Critical |
| Health check failures | Health/readiness/liveness probe failures | 2m | Warning |

---

## 12. Tempo

### 12.1 Trace Ingestion

| Protocol | Endpoint | Port |
|----------|----------|------|
| OTLP HTTP | `/v1/traces` | 4318 |
| OTLP gRPC | (Future) | 4317 |

### 12.2 Storage & Retention

| Setting | Value |
|---------|-------|
| Storage backend | Local filesystem |
| Block retention | 48h |
| Max block size | 100 MB |
| Compaction | Enabled (level-based) |

### 12.3 Instrumented Services

| Service | Instrumentation | Sampling |
|---------|----------------|----------|
| Backend (NestJS) | `@opentelemetry/instrumentation-nestjs-core` + `http` + `express` | 100% (SimpleSpanProcessor) |
| Frontend (Next.js) | Not yet instrumented (planned) | - |
| CMS (Strapi) | Not yet instrumented (planned) | - |

### 12.4 Service Graph

Grafana Tempo data source configured with:
- **Traces to Logs**: Maps `service.name`, `http.method`, `http.url` tags to Loki
- **Service Map**: Powered by Prometheus scrape targets
- **Node Graph**: Enabled for service dependency visualization
- **Trace Search**: Enabled

---

## 13. SMTP / Email

### 13.1 Mail Configuration

| Service | Provider | Protocol | Port | Use |
|---------|----------|----------|------|-----|
| Odoo transactional | SMTP relay | STARTTLS | 587 | Invoices, lead acknowledgements |
| NestJS notifications | SMTP relay | STARTTLS | 587 | Password resets, alerts |
| Monitoring alerts | Slack webhook | HTTPS | 443 | All alert notifications |

### 13.2 Sender Configuration

- **From address**: `noreply@hexastudio.net`
- **Reply-to**: `hello@hexastudio.net`
- **SMTP relay**: Configurable via environment variables
- **Rate limit**: 100 emails/hour per sender

### 13.3 Security

- TLS required for all SMTP connections
- SPF, DKIM, DMARC configured for `hexastudio.net`
- Email authentication via SMTP credentials (not IP-based)
- Bounce handling: Monitor bounce mailbox

---

## 14. Backup Service

### 14.1 Schedule

| Backup | Frequency | Retention | Method | Verification |
|--------|-----------|-----------|--------|-------------|
| PostgreSQL (all DBs) | Every 24h (sleep-loop service) | 30 days | `pg_dump -Fc` via `docker/backup/backup.sh`; upload to MinIO `backups` bucket via `mc` | Daily scheduled `verify-backup.sh` |
| PostgreSQL WAL | Not implemented | - | - | - |
| MinIO data | Not backed up | - | - | GAP (see [BACKUP.md]$1) |
| MinIO offsite | Not backed up | - | - | GAP (see [BACKUP.md]$1) |
| GitLab data | Daily | 7 days | `gitlab-rake backup:create` | Monthly restore drill |
| SSL certificates | Auto-renewal | Active | Traefik ACME | Daily uptime check |

### 14.2 Backup Script Locations

| Script | Path | Purpose |
|--------|------|---------|
| Database backup | `docker/backup/backup.sh` | Infinite-loop `pg_dump -Fc` of `hexastudio_api`/`hexastudio_cms`/`hexastudio_odoo`/`hexastudio_db`, 30-day prune, optional MinIO `backups` upload |
| Backup verify | `docker/backup/verify-backup.sh` | `pg_restore --list` integrity + 25h age check (exit 0/1) |
| Verification daemon | `docker/backup/verify-loop.sh` | 24h loop wrapper for scheduled self-verification |
| Restore database | `pg_restore -Fc -d <db> <dump>` | Restore a single DB from a dump (see [BACKUP.md](BACKUP.md)) §5) |
| Backup verify (compose) | `docker compose -f docker-compose.prod.yml --profile verify run --rm backup-verify` | One-shot verification service |

### 14.3 Encryption

- Backups are **not** GPG-encrypted (the retired encryption scheme is gone)
- Offsite dumps are uploaded to the internal MinIO `backups` bucket via `mc` (internal network only)
- Verification uses `pg_restore --list` integrity + 25h age check — no decryption involved

### 14.4 Monitoring

| Metric | Check | Alert |
|--------|-------|-------|
| Last backup timestamp | `backup_last_success_timestamp_seconds` | > 24h since success |
| Backup exit code | `backup_job_failed_total` | > 0 in 1h |
| Backup file size | Non-empty check | Zero-size file |
| Backup verification | `verify-backup.sh` exit code (`pg_restore --list` + 25h age) | Daily (scheduled daemon) |

---

## 15. Disaster Recovery

### 15.1 Recovery Objectives

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | < 1 hour |
| RPO (Recovery Point Objective) | 24 hours (daily dump loop) |
| Maximum downtime tolerated | 4 hours |

### 15.2 Recovery Scenarios

#### Scenario 1: Application Crash (RTO < 5min)
```bash
docker compose ps
docker compose logs --tail=100 <service>
docker compose restart <service>
# If persists: rollback
docker compose up -d <service>:<previous-tag>
```

#### Scenario 2: Server Failure (RTO < 30min)
```bash
# 1. Provision new server (snapshot/backup)
# 2. Update DNS to new IP
# 3. SSH in, git pull latest
# 4. Restore latest database backup
docker run --rm -v hexastudio_backup_data:/backups:ro postgres:16-alpine \
  pg_restore -h postgres -U "${POSTGRES_USER:-hexastudio}" -d hexastudio_api \
  --clean --if-exists --no-owner --no-privileges \
  /backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump
# ... repeat for hexastudio_cms, hexastudio_odoo, hexastudio_db (see BACKUP.md §5)
# 5. Start services
docker compose -f docker-compose.prod.yml up -d
# 6. Verify health
curl https://hexastudio.net/api/health
```

#### Scenario 3: Database Corruption (RTO < 1h)
```bash
docker compose stop backend cms odoo
# Identify backup
docker run --rm -v hexastudio_backup_data:/backups postgres:16-alpine ls -lt /backups
# Restore specific database
docker run --rm -v hexastudio_backup_data:/backups:ro postgres:16-alpine \
  pg_restore -h postgres -U "${POSTGRES_USER:-hexastudio}" -d hexastudio_api \
  --clean --if-exists --no-owner --no-privileges \
  /backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump
# Verify
docker compose start backend cms odoo
```

#### Scenario 4: Full Region Outage (RTO < 4h)
- Activate secondary region (future)
- Point DNS to secondary
- Restore cross-region backups
- Verify end-to-end

### 15.3 Post-Recovery Checklist

- [ ] All services healthy
- [ ] Data integrity verified (row counts, checksums)
- [ ] No data loss within RPO
- [ ] DNS propagated correctly
- [ ] SSL certificates valid
- [ ] Monitoring re-enabled
- [ ] Incident report filed
- [ ] Root cause identified
- [ ] Prevention measures implemented

### 15.4 DR Drill Schedule

| Drill | Frequency | Scope |
|-------|-----------|-------|
| Database restore test | Weekly | Restore to test environment, verify queries |
| Full DR simulation | Monthly | Complete recovery from bare metal |
| RTO/RPO validation | Quarterly | Measure actual recovery time |
| Backup verification | Weekly | Run `verify-backup.sh` and validate dumps |

---

## 16. Scaling Strategy

### 16.1 Vertical Scaling (Current)

| Resource | Current | Ceiling |
|----------|---------|---------|
| CPU | 8 vCPUs | 32 vCPUs |
| RAM | 32 GB | 128 GB |
| Storage | 1.5 TB | 4 TB (NVMe) |
| Network | 1 Gbps | 10 Gbps |

### 16.2 Horizontal Scaling (Future)

| Service | Strategy | Trigger |
|---------|----------|---------|
| Frontend | Multiple replicas behind Traefik | CPU > 80% sustained |
| Backend | Multiple replicas + shared Redis cache | p99 latency > 500ms |
| PostgreSQL | Read replica for reporting queries | Connections > 80% |
| MinIO | Distributed mode (multi-node) | Storage > 80% |
| Qdrant | Cluster mode | Vector search latency > 1s |

### 16.3 Load Balancing

| Layer | Mechanism | Notes |
|-------|-----------|-------|
| Edge | Cloudflare CDN | Global traffic distribution |
| Reverse proxy | Traefik | Round-robin across replicas |
| Database | PgBouncer (future) | Connection pooling |

### 16.4 Auto-scaling (Future)

- **Monitoring**: Prometheus metrics for CPU, memory, latency
- **Orchestration**: Docker Swarm or Kubernetes migration
- **Rules**: Scale out when sustained CPU > 70%, scale in when < 30%

---

## 17. Password Rotation Policy

### 17.1 Rotation Schedule

| Credential | Rotation | Method | Responsible |
|------------|----------|--------|-------------|
| PostgreSQL passwords | Every 90 days | Update env vars, redeploy | DevOps |
| Redis passwords | Every 90 days | Update env vars, redeploy | DevOps |
| MinIO access keys | Every 90 days | MinIO console + env vars | DevOps |
| JWT secret | Every 180 days | Generate new, invalidate old | DevOps |
| Odoo admin password | Every 90 days | Odoo admin UI | System Admin |
| GitLab root password | Every 180 days | GitLab admin UI | DevOps |
| SSH keys | Every 365 days | Generate new, deploy to servers | DevOps |
| SMTP credentials | Every 180 days | Update env vars | DevOps |
| Cloudflare API token | Every 180 days | Cloudflare dashboard | DevOps |
| Sentry auth token | Every 180 days | Sentry dashboard | DevOps |

### 17.2 Rotation Procedure

```bash
# 1. Generate new credential
openssl rand -base64 32

# 2. Update in GitLab CI/CD variables (masked)
#    Project > Settings > CI/CD > Variables

# 3. Update .env file on server
#    (if changed, service restart required)

# 4. Update in password manager (1Password/Bitwarden)

# 5. Redeploy affected services
docker compose -f docker-compose.prod.yml up -d <service>

# 6. Verify connectivity
curl https://api.hexastudio.net/api/health

# 7. Document rotation in changelog
```

### 17.3 Emergency Rotation

Triggered when:
- Credential suspected compromised
- Team member with access leaves
- Security incident involving the credential

**Emergency procedure**: Rotate immediately, notify team, investigate breach.

### 17.4 Password Standards

| Requirement | Standard |
|-------------|----------|
| Minimum length | 32 characters (machine-generated) |
| Complexity | Lowercase + Uppercase + Numbers + Special |
| Storage | Password manager (never in plaintext files) |
| CI/CD storage | GitLab masked variables (file type for SSH keys) |
| Sharing | Never via email, chat, or unencrypted channels |

---

## Related Documents

- [Infrastructure Overview](infrastructure.md)) — Base infrastructure topology
- [Backup & Restore](BACKUP.md)) — Detailed backup procedures
- [Disaster Recovery](DISASTER_RECOVERY.md)) — DR plan and runbooks
- [Deployment Strategy](DEPLOYMENT_STRATEGY.md)) — Zero-downtime pipeline
- [Observability](OBSERVABILITY.md)) — Monitoring, logging, tracing
- [Docker Standards](DOCKER.md)) — Dockerfile and containerization
- [Docker Compose](DOCKER_COMPOSE.md)) — Service composition
- [GitLab Operations](GITLAB_OPERATIONS.md)) — CI/CD pipeline maintenance
- [Incident Response](incident-response.md)) — Incident runbook
- [Password Rotation](PASSWORD_ROTATION.md)) — Credential management
