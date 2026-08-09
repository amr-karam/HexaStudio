# HEXA STUDIO — SECURITY ARCHITECTURE

**Version:** 2.1.5
**Date:** 2026-08-09
**Status:** Active
**Authority Level:** 1 (Architecture — subordinates only to `GOVERNANCE.md`)
**Owning Agent:** Documentation Specialist (cross-referenced by Security Auditor)

---

## 1. PURPOSE

This document is the **architecture-level** view of the HEXA STUDIO security posture. It identifies the security layers, the key controls applied at each layer, and the canonical detailed policies that govern each control. Detailed policies, threat models, incident response procedures, and audit findings live in `docs/security/` and `docs/quality/`. This document MUST NOT duplicate that content — it points to it.

> If this document ever disagrees with `docs/security/SECURITY.md` or `SECURITY_BASELINE.md`, the canonical detailed document wins. File an ADR and update this file in the same change set.

---

## 2. SECURITY LAYERS

Security is enforced in depth across four layers. A compromise at any single layer MUST NOT yield full system compromise.

### 2.1 Edge — Cloudflare + Traefik v3

- WAF and DDoS protection at Cloudflare edge (Cloudflared Tunnel, zero public port exposure)
- TLS termination at Traefik v3 with ACME/Let's Encrypt (DNS challenge)
- Security headers: HSTS (`stsSeconds: 63072000`), `frameDeny`, `contentTypeNosniff`, CSP
- Rate limiting: Traefik rate-limit middleware (100 req/min per IP)

### 2.2 Application — NestJS 11

- Authentication: JWT verified server-side by `JwtAuthGuard`
- Authorization: `RolesGuard` enforces RBAC at every protected route
- Throttling: `ThrottlerGuard` (NestJS Throttler) in addition to Traefik limits
- Input validation: `class-validator` decorators + Zod schemas at all DTOs and request bodies

### 2.3 Data — PostgreSQL 16, Redis 7, Qdrant, MinIO

- Network isolation: all data services live on the `hexastudio_internal` Docker network — no public port exposure permitted
- SQL injection prevention: parameterized queries / prepared statements only (TypeORM repositories)
- Object storage: MinIO presigned URLs with 15-minute TTL for client downloads
- Secrets: never committed, injected via environment variables or Docker secrets (Phase 16 cleanup removed hardcoded values from `docker-compose.yml`)

### 2.4 Operational — Logging, Monitoring, Incident

- Structured audit logs to Loki / Grafana for: failed logins, approvals, admin updates, role changes
- Error tracking via Sentry
- Secret rotation cadence per `docs/devops/PASSWORD_ROTATION.md`
- Backup and disaster recovery per `docs/devops/DISASTER_RECOVERY.md`

---

## 3. KEY CONTROLS

| Layer  | Control                          | Implementation                          | Canonical Reference                                 |
|--------|----------------------------------|-----------------------------------------|-----------------------------------------------------|
| Edge   | TLS termination                  | Traefik v3 + Cloudflared Tunnel         | `docs/security/SECURITY.md`                         |
| Edge   | WAF / DDoS                       | Cloudflare                              | `docs/security/SECURITY.md`                         |
| Edge   | Security headers (HSTS, CSP)     | Traefik middleware                      | `docs/security/SECURITY_STANDARDS.md`               |
| Edge   | Rate limit (100 req/min/IP)      | Traefik rate-limit middleware           | `docs/devops/TRAEFIK.md`                            |
| App    | Authentication (JWT)             | `JwtAuthGuard`                          | `docs/security/SECURITY_BASELINE.md`                |
| App    | Authorization (RBAC)             | `RolesGuard`                            | `docs/security/SECURITY_BASELINE.md`                |
| App    | Request throttling               | `ThrottlerGuard`                        | `docs/security/SECURITY_STANDARDS.md`               |
| App    | Input validation                 | `class-validator` + Zod                 | `docs/security/SECURITY_BASELINE.md`                |
| Data   | Network isolation                | `hexastudio_internal` Docker network    | `docs/architecture/NETWORK_ARCHITECTURE.md`        |
| Data   | SQL injection prevention         | Parameterized queries / ORM             | `docs/security/SECURITY_BASELINE.md`                |
| Data   | Presigned URLs (15-min TTL)      | MinIO S3 compatible                     | `docs/security/SECURITY_STANDARDS.md`               |
| Ops    | Secret management                | Env vars / Docker secrets               | `SECURITY.md` (root)                                |
| Ops    | Audit logging                    | Loki / Grafana                          | `docs/devops/OBSERVABILITY.md`                      |
| Ops    | Error tracking                   | Sentry                                  | `docs/devops/SENTRY_ERROR_BUDGETS.md`               |
| Ops    | Incident response                | Runbook + on-call rotation              | `docs/security/INCIDENT_RESPONSE.md`                |

---

## 4. COMPLIANCE

| Standard / Practice        | Status     | Reference                                       |
|----------------------------|------------|-------------------------------------------------|
| OWASP Top 10 (2021)        | Required   | `docs/quality/SECURITY_AUDIT.md`                |
| Threat model (STRIDE)      | Active     | `docs/security/THREAT_MODEL.md`                 |
| Incident response plan     | Active     | `docs/security/INCIDENT_RESPONSE.md`            |
| Secrets never in repo      | Enforced   | `SECURITY.md` (root) + `AGENTS.md` §2           |
| Phase 16 secret cleanup    | Complete   | `docker-compose.yml` (no hardcoded credentials) |

All new features and architectural changes MUST be reviewed against this matrix. Deviations require an ADR and Security Auditor sign-off.

---

## 5. REFERENCES

### 5.1 Canonical Security Documents (detailed)

- `../security/SECURITY.md` — primary security guide
- `../security/SECURITY_BASELINE.md` — baseline controls and minimum standards
- `../security/SECURITY_STANDARDS.md` — implementation standards (headers, validation, throttling)
- `../security/THREAT_MODEL.md` — STRIDE-based threat model
- `../security/INCIDENT_RESPONSE.md` — incident response runbook
- `../security/README.md` — security docs manifest

### 5.2 Quality / Audit Documents

- `../quality/SECURITY_AUDIT.md` — periodic security audit findings
- `../quality/SECURITY_REPORT.md` — current security posture report

### 5.3 Architecture & Operational Documents

- `./NETWORK_ARCHITECTURE.md` — DNS, routing, network isolation
- `./DEPLOYMENT_ARCHITECTURE.md` — environment topology
- `../devops/TRAEFIK.md` — Traefik v3 configuration (rate limits, headers)
- `../devops/OBSERVABILITY.md` — Loki / Grafana logging
- `../devops/SENTRY_ERROR_BUDGETS.md` — Sentry configuration
- `../devops/PASSWORD_ROTATION.md` — secret rotation cadence
- `../devops/DISASTER_RECOVERY.md` — backup and DR

### 5.4 Top-Level Governance

- `/SECURITY.md` — root security policy
- `/GOVERNANCE.md` — supreme governance document
- `/AGENTS.md` — AI agent operating instructions (binding for all agents)
- `/docs/AGENTS.md` — playbook-level agent instructions

---

## 6. CHANGE LOG

| Version | Date       | Author               | Change                                                                 |
|---------|------------|----------------------|------------------------------------------------------------------------|
| 2.1.5   | 2026-08-09 | Documentation Spec.  | Initial creation (remediates GOVERNANCE.md §46 manifest gap).          |