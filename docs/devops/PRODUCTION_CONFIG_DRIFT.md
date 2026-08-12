# Production Config Drift Reconciliation

**Date:** 2026-08-09
**Authority:** Operational review note (GOVERNANCE.md §38 Change Management)
**Scope:** Edge proxy / Docker Compose drift between committed source and running production stack

---

## 1. Executive Summary

The committed source tree is a **strict superset** of the production server configuration.
Reconciling production to the committed source will **improve** security posture (env-based
auth, explicit security-headers middleware, TLS hardening) with **zero** functional regressions.

No rollback risk: the committed config is additive (18 new lines, 0 removed).

---

## 2. Findings

### 2.1 Traefik: stale container (v2 running, v3 specified)

| Artifact | State |
|---|---|
| `docker-compose.prod.yml` (server) | `traefik:v3.0` ✅ |
| `docker-compose.prod.yml` (committed) | `traefik:v3.0` ✅ |
| **Running container** | `traefik:v2.11` ❌ stale |

The compose file specifies v3.0, but the running Traefik container was never recreated
after the v3.0 image pin was committed. A `docker compose up -d traefik` will recreate
the container with the v3.0 image.

**Config v3-compatibility audit (per docs/security/SECURITY_BASELINE.md):**
- Cipher suites: all 6 are retained in v3 ✅ (only SSLv3/TLS1.0/1.1 ciphers removed)
- Static config syntax: no deprecated v2 keys ✅
- Dynamic config routers/middlewares: standard `Host()` rules, v3-compatible ✅

### 2.2 `traefik.yml` static config drift

| Block | Server (48 lines) | Committed (71 lines) | Risk |
|---|---|---|---|
| `api.insecure` | `true` | `false` | LOW (8080 not externally published) |
| `tls.options.default` | **missing** | present (TLS 1.2 + cipher suites) | MEDIUM |
| `traefik` entrypoint | **missing** | present (added this session) | blocks metrics |

**Note:** The committed `traefik.yml` had a latent bug — `metrics.prometheus.entryPoint: traefik`
referenced an entrypoint that was not explicitly defined (v3 does not auto-create it when
`insecure: false`). Fixed this session in commit `3854599` by adding the explicit entrypoint.

### 2.3 `dynamic.yml` drift (174 server vs 204 committed)

| Block | Server | Committed |
|---|---|---|
| `security-headers` middleware | **missing** | present (HSTS, CSP, X-Frame, etc.) |
| `traefik-auth.basicAuth.users` | **hardcoded hash** | `${TRAEFIK_AUTH_USER}:${TRAEFIK_AUTH_HASH}` |

**Security finding:** Server `dynamic.yml` contains a hardcoded basic-auth hash
(`admin:$apr1$...`). The committed source correctly uses env-var substitution.
**Action required:** Rotate the Traefik dashboard admin password after reconciliation
(the hash has been in an unprotected server file).

**Note:** Public security headers (HSTS/CSP/etc.) ARE currently enforced because the
Next.js frontend sets its own CSP via `next.config.ts` and the API sets its own headers
via Helmet. The Traefik `security-headers` middleware applies to non-frontend services
(Odoo, MinIO, Grafana, Prometheus, etc.) which currently lack these headers.

### 2.4 `docker-compose.prod.yml` drift (669 server vs 687 committed)

The only difference is an 18-line `docs-service` block (Storybook static site) present in
committed source but absent on the server. Non-breaking — the service is optional and not
required for core platform operation.

---

## 3. Reconciliation Plan (staged, lowest-risk-first)

### Stage 1 — Source fixes (DONE this session)
- [x] Fix `traefik.yml` missing entrypoint bug (commit `3854599`)
- [x] Backend quality gate: 339/339 tests, 0 lint/typecheck errors

### Stage 2 — Sync configs to server (low risk, no container restart)
- [ ] Copy committed `docker/traefik/traefik.yml` → server (adds TLS hardening, entrypoint, `insecure: false`)
- [ ] Copy committed `docker/traefik/dynamic.yml` → server (adds security-headers middleware, removes hardcoded hash)
- [ ] Add `TRAEFIK_AUTH_USER` / `TRAEFIK_AUTH_HASH` to server `.env` (replaces hardcoded hash)
- [ ] Add `DOCS_IMAGE` to server `.env` (or leave default; docs-service is optional)

### Stage 3 — Traefik v2 → v3 upgrade (recreate container)
- [ ] Validate `docker compose --env-file .env -f docker-compose.prod.yml config` exits 0
- [ ] `docker compose up -d traefik` (recreates with v3.0 image + new configs)
- [ ] Verify: `curl -sI https://hexastudio.net` returns 200 + security headers
- [ ] Verify: `curl -sI https://api.hexastudio.net/api/health` returns 200
- [ ] Verify: Traefik dashboard (`traefik.hexastudio.net`) prompts basic auth
- [ ] Verify: Prometheus scrape target `traefik:8080/metrics` returns 200

### Stage 4 — Post-reconciliation
- [ ] Rotate Traefik dashboard admin password (hash was exposed)
- [ ] Optionally deploy `docs-service` (Storybook)

---

## 4. Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Traefik v3 startup failure | HIGH | Config audited v3-compatible; `config` validation pre-flight |
| TLS handshake breakage | LOW | Cipher suites verified retained in v3 |
| Metrics endpoint loss | LOW | Explicit entrypoint added (commit `3854599`) |
| Basic auth lockout | LOW | Env vars staged before recreate |

**Recommendation:** Proceed with Stage 2 (config sync) immediately. Stage 3 (container
recreate) should be done during a low-traffic window with the verification checklist above.

---

## 5. References
- `docker/traefik/traefik.yml` — static config (committed)
- `docker/traefik/dynamic.yml` — dynamic routing + middlewares (committed)
- `docker-compose.prod.yml` — service definitions (committed)
- `docs/security/SECURITY_BASELINE.md` — TLS / security-header baseline
- GOVERNANCE.md §36 (HIGH-risk changes), §38 (Change Management)
