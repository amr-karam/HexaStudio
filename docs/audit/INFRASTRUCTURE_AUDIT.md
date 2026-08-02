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
2. **Backup/recovery (medium):** docs exist (`docs/devops/BACKUP.md`, `docs/devops/BACKUP_RESTORE_DRILL.md`, `docs/devops/DISASTER_RECOVERY.md`) — no automated backup job verified; add scheduled pg_dump + MinIO mirror + restore drill.
3. **Traefik hardening (medium):** verify CSP/HSTS headers and TLS min-version in the live Traefik config; document in `docs/devops/TRAEFIK.md`.
4. **Root artifact pollution (medium):** deploy logs, `*.zip`/`*.rar`, `hexastudio_key`, and scripts clutter the repo root; migrate to `ops/` or `scripts/` + `.gitignore`.
5. **`infrastructure/` directory:** referenced by docs but does not exist in the repo — either create it (with docker-compose overrides + Traefik config) or remove references (ADR needed).

## References
- `docs/devops/DOCKER_COMPOSE.md`, `docs/devops/TRAEFIK.md`, `docs/devops/DEPLOYMENT_STRATEGY.md`, `docs/devops/BACKUP.md`, `docs/devops/DISASTER_RECOVERY.md`, `docs/architecture/DEPLOYMENT_ARCHITECTURE.md`, `docker-compose*.yml`
