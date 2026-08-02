# Infrastructure — Canonical Locations

> **Purpose:** canonical map of where HEXA STUDIO infrastructure lives in the monorepo.
> Per ADR-004 (monorepo) and ADR-011 (docs migration — code restructure **out of scope**), infrastructure artifacts are **not moved** into a separate `infrastructure/` tree; this manifest is the authoritative index instead.

## Compose Orchestration (repo root)

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Base compose definition |
| `docker-compose.dev.yml.example` | Development overlay (example) |
| `docker-compose.staging.yml` | Staging overlay |
| `docker-compose.prod.yml` | Production overlay |
| `docker-compose.green.yml` | Blue/green deployment overlay |
| `docker-compose.override.yml` | Local override |
| `docker-compose.gitlab.yml` / `docker-compose.gitlab-runner.yml` | GitLab CE / runner |
| `gitlab-docker-compose.yml` / `gitlab-docker-compose.full.yml` | Self-hosted GitLab compose |

## Service Configuration — `docker/` (50 files)

| Area | Location |
|------|----------|
| Traefik v3 (proxy/ingress) | `docker/traefik/` |
| Grafana + provisioning (dashboards, datasources, alerts) | `docker/grafana/` |
| Loki + Promtail (logs) | `docker/loki/` |
| Alertmanager (alerting) | `docker/alertmanager/` |
| Blackbox exporter (probes) | `docker/blackbox/` |
| MinIO (init buckets) | `docker/minio/` |
| Odoo (entrypoint, config) | `docker/odoo/` |
| Backup scripts | `docker/backup/` |
| Nginx (non-ingress auxiliary) | `docker/nginx/` |

## Ops Tooling — `scripts/`

| Script | Purpose |
|--------|---------|
| `scripts/deploy.sh`, `deploy-zero-downtime.sh`, `deploy-gitlab.sh` | Deployments |
| `scripts/audit-deps.js`, `check-bundle-budgets.mjs` | CI checks |
| `scripts/dns-hostinger.ts` | DNS automation |
| `scripts/setup-gitlab-variables.sh`, `scripts/register-gitlab-runner.sh`, `scripts/migrate-from-github.sh` | GitLab provisioning |
| `scripts/git-hooks/`, `scripts/mcp/` | Hooks & MCP tooling |

## Other

- **Monitoring stack docs:** `docs/devops/MONITORING.md`, `docs/devops/OBSERVABILITY.md`, `docs/architecture/MICROSERVICES.md`
- **Deployment architecture:** `docs/architecture/DEPLOYMENT_ARCHITECTURE.md`, `docs/devops/DEPLOYMENT_STRATEGY.md`
- **Networking:** `docs/architecture/NETWORK_ARCHITECTURE.md`, `docs/devops/TRAEFIK.md`

## Security Notes

- PostgreSQL, Redis, MinIO, Qdrant, Prometheus, Loki run on the **internal Docker network** (`hexastudio_internal`) — no public ports.
- Traefik is the single ingress; Nginx is not used for ingress.
- See `docs/security/SECURITY_BASELINE.md` for the network/secret model.

## References
- `docs/audit/INFRASTRUCTURE_AUDIT.md`, `docs/devops/README.md`, ADR-004, ADR-011
