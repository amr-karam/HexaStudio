# Infrastructure Audit — HEXA STUDIO

> Verified 2026-08-02 against the live docker-compose set and docs. PHASE 0 discovery artifact.

## Deployment Strategy

- **Orchestration:** Docker Compose (root: `docker-compose.yml`, `.dev`, `.staging`, `.green`, `.prod`, `.override`, `gitlab`, `gitlab-runner` variants).
- **Reverse proxy / ingress:** Traefik v3 — routing, TLS termination, service discovery, Cloudflared tunnel. Nginx is NOT used.
- **Data persistence:**
  - PostgreSQL 16 (relational)
  - MinIO (asset storage; presigned URLs for deliverables)
  - Redis 7 (cache / sessions / agent memory)

## DevOps & CI/CD

- **Source of truth:** GitLab CE (local instance).
- **Pipelines:** `.gitlab-ci.yml` + `.gitlab-ci-optimized.yml`; protected branches; container registry.
- **Secret management:** `.env*` + `.env.example`; CI/CD masked variables (verified — SMTP/PG/Sentry passwords are env-var referenced).
- **Monitoring:** Prometheus, Grafana, Loki, Sentry; OTel tracing (see `docs/devops/OBSERVABILITY.md`, `docs/devops/MONITORING.md`).

## Verified Risks & Gaps

1. **Hardcoded default secret (HIGH):** `gitlab-docker-compose.full.yml:211` → `GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:-admin@2024}`. Remove the `:-admin@2024` fallback; require an explicit masked variable. See `docs/audit/SECURITY_AUDIT.md` finding #1.
2. **Backup/recovery (medium — RESOLVED 2026-08-08):** automated pipeline verified in `docker-compose.prod.yml`: `backup` (24h pg_dump loop for hexastudio_api/cms/odoo/db + MinIO offsite mirror, 30-day prune), `backup-verify` (manual profile), `backup-verify-scheduled` (daily self-verification daemon, `--profile scheduled`), `minio-backup` + `minio-backup-verify` (asset mirror). Docs: `docs/devops/BACKUP.md`, `docs/devops/BACKUP_RESTORE_DRILL.md`, `docs/devops/DISASTER_RECOVERY.md`.
3. **Traefik hardening (medium — REMEDIATED 2026-08-08):** CSP/HSTS headers now applied via `security-headers` middleware on all non-frontend routers (`docker/traefik/dynamic.yml`); TLS 1.2 minimum + cipher suites in `traefik.yml`; hardcoded basic-auth hash removed → `${TRAEFIK_AUTH_USER}:${TRAEFIK_AUTH_HASH}`; `api.insecure: false`. Documented in `docs/devops/TRAEFIK.md`.
4. **Root artifact pollution (medium — RESOLVED 2026-08-08):** root holds manifests only; all flagged patterns (`*.log`, `*.zip`, `*.rar`, `hexastudio_key`, `deploy*.py`, `lh-report.json`, `ops/archive/`) git-ignored; operational scripts live in `ops/scripts/` + `scripts/`.
5. **`infrastructure/` directory:** referenced by docs but does not exist in the repo — either create it (with docker-compose overrides + Traefik config) or remove references (ADR needed).

## References
- `docs/devops/DOCKER_COMPOSE.md`, `docs/devops/TRAEFIK.md`, `docs/devops/DEPLOYMENT_STRATEGY.md`, `docs/devops/BACKUP.md`, `docs/devops/DISASTER_RECOVERY.md`, `docs/architecture/DEPLOYMENT_ARCHITECTURE.md`, `docker-compose*.yml`
