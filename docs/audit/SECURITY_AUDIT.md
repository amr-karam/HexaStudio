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

1. **Hardcoded default secret — `gitlab-docker-compose.full.yml:211` (HIGH, confirmed):**
   ```yaml
   GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:-admin@2024}
   ```
   The `:-admin@2024` fallback exposes a known Grafana admin password if the env var is unset.
   **Remediation:** remove the fallback (require the masked CI/CD variable); rotate if the image was ever run with the default. (The other passwords — `GITLAB_SMTP_PASSWORD`, `POSTGRES_PASSWORD`, `SENTRY_DB_PASSWORD` — are correctly env-var referenced; the earlier broad claim in the initial scan was overstated and is corrected here.)
2. **Odoo API authorization (medium):** review the JSON-RPC surface exposed by `hexa_studio` for authentication/authorization (remediation checklist item).
3. **Traefik TLS/headers (medium):** verify CSP, HSTS, and TLS minimum version in live Traefik config; document in `docs/devops/TRAEFIK.md`.
4. **PII / data privacy (medium):** Odoo holds project/partner PII — ensure encryption at rest, retention, and compliant handling are documented in `docs/security/SECURITY_STANDARDS.md`.
5. **Dependency vulnerabilities (ongoing):** routine `npm audit` per workspace + CI scanning cadence required; overrides must be monitored (see `docs/engineering/DEPENDENCY_MANAGEMENT.md`).

## Next Actions

- [x] Run secret scanner (S-021 diff — clean)
- [ ] Remediate `GF_SECURITY_ADMIN_PASSWORD` fallback in `gitlab-docker-compose.full.yml`
- [ ] Review Odoo JSON-RPC authorization
- [ ] Verify live Traefik TLS/CSP/HSTS headers
- [ ] Establish scheduled `npm audit` + dependency update cadence
- [ ] Document PostgreSQL/MinIO backup-restore drill completion

## References
- `docs/security/SECURITY_STANDARDS.md`, `docs/security/SECURITY_BASELINE.md`, `docs/security/README.md`, `docs/devops/PASSWORD_ROTATION.md`, `gitlab-docker-compose.full.yml`
