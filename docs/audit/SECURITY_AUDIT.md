# Security Audit — HEXA STUDIO

> Verified 2026-08-02. PHASE 0 discovery artifact. Findings were re-verified against the live repo before inclusion; remediation tracked in PROJECT_STATUS.md / OPEN_TASKS.

## Verified Controls (in place)

- **Secrets:** `.env*` files git-ignored; `.env.example` committed with placeholders only.
- **Authentication:** NestJS JWT via Passport; RBAC authorization.
- **API hardening:** `helmet` (security headers), `class-validator` (DTO validation), rate limiting (backend).
- **Network isolation:** PostgreSQL / Redis / MinIO on the internal Docker network only (no public ports).
- **Dependency scanning:** target in GitLab CI (`.gitlab-ci*.yml`).
- **Secret scanner:** run against the S-021 commit diff — clean (no hardcoded credentials in code diff).

## Findings (verified)

1. **Hardcoded default secrets — gitlab compose + docker-compose.yml (HIGH — REMEDIATED 2026-08-02):**
   ```yaml
   # before                        # after
   GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:-admin@2024}   → ${GRAFANA_ADMIN_PASSWORD:?...required}
   POSTGRES_PASSWORD: ${SENTRY_DB_PASSWORD:-sentry_password}          → ${SENTRY_DB_PASSWORD:?...required}
   redis-server --requirepass ${SENTRY_REDIS_PASSWORD:-sentry_redis_password} → ${SENTRY_REDIS_PASSWORD:?...required}
   MEILI_MASTER_KEY: ${MEILISEARCH_MASTER_KEY:-masterKey}             → ${MEILISEARCH_MASTER_KEY:?...required}
   GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}             → ${GRAFANA_PASSWORD:?...required}
   ```
   All 5 hardcoded fallbacks removed; compose now fails fast when the env var is unset instead of silently using a known default. Required vars documented in `.env.example`. YAML validity re-verified for `gitlab-docker-compose.full.yml`, `gitlab-docker-compose.yml`, `docker-compose.yml`.
   **Remaining (benign):** `${VAR:-}` empty-string fallbacks (`REVALIDATE_SECRET`, `PREVIEW_SECRET`, `TELEGRAM_BOT_TOKEN`, `SENTRY_SECRET_KEY:-`) default to empty, not to a known credential — acceptable.
   **If images ever ran with defaults:** rotate Grafana admin, Sentry DB, Sentry Redis, Meilisearch master key on the production server.
2. **Odoo API authorization (medium):** review the JSON-RPC surface exposed by `hexa_studio` for authentication/authorization (remediation checklist item).
3. **Traefik TLS/headers (medium — REMEDIATED 2026-08-08 in config):**
   - `docker/traefik/dynamic.yml` previously carried **no CSP/HSTS/nosniff middleware** for non-frontend services and a **hardcoded basic-auth hash** (`$apr1$iX4YLoGa$KRmTxSK1/9JvWQ9h5FKw90`) for the dashboard/Alertmanager.
   - Fixed: `security-headers` middleware (HSTS preload, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP) wired to all 15 non-frontend routers (backend, CMS, Odoo, MinIO, Grafana, Prometheus, Alertmanager, Uptime, AI, Auth, Analytics, Hub, Docs, Status); frontend exempt (its own CSP in `next.config.ts`).
   - Hardcoded hash → `${TRAEFIK_AUTH_USER}:${TRAEFIK_AUTH_HASH}` env-var (no default fallback); `.env.example` updated; both `dynamic.yml` and `dynamic_check.yml` fixed.
   - `traefik.yml`: `api.insecure: true` → `false` (dashboard only via basic-auth router); TLS options block added (`minVersion: VersionTLS12`, AES-GCM/ChaCha20 suites only).
   - YAML validity re-verified for all Traefik files + `docker-compose.prod.yml`.
   - **If prod Traefik previously ran with the hardcoded hash:** regenerate the dashboard/Alertmanager password and rotate `TRAEFIK_AUTH_HASH`.
4. **PII / data privacy (medium):** Odoo holds project/partner PII — ensure encryption at rest, retention, and compliant handling are documented in `docs/security/SECURITY_STANDARDS.md`.
5. **Dependency vulnerabilities (ongoing):** routine `npm audit` per workspace + CI scanning cadence required; overrides must be monitored (see `docs/engineering/DEPENDENCY_MANAGEMENT.md`).

## Next Actions

- [x] Run secret scanner (S-021 diff — clean)
- [x] Remediate hardcoded default secrets in `gitlab-docker-compose.full.yml` + `docker-compose.yml` (5 fallbacks → required vars; `.env.example` updated)
- [ ] Rotate Grafana/Sentry/Meilisearch credentials if images ever ran with defaults
- [ ] Rotate Traefik dashboard/Alertmanager credential if prod ever ran with the hardcoded `$apr1$` hash
- [ ] Review Odoo JSON-RPC authorization
- [x] Verify Traefik TLS/CSP/HSTS headers (config-side remediation complete 2026-08-08 — see finding #3)
- [ ] Confirm live header delivery after next prod Traefik reload
- [ ] Establish scheduled `npm audit` + dependency update cadence
- [ ] Document PostgreSQL/MinIO backup-restore drill completion

## References
- `docs/security/SECURITY_STANDARDS.md`, `docs/security/SECURITY_BASELINE.md`, `docs/security/README.md`, `docs/devops/PASSWORD_ROTATION.md`, `gitlab-docker-compose.full.yml`
