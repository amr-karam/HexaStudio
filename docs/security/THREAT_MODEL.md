# HEXA Studio — THREAT MODEL

> **Canonical source:** This document is the canonical threat model for the HEXA Studio platform.
> It is the single source of truth for the digital assets inventory, the attack surface, and the
> OWASP Top 10 coverage. `docs/security/SECURITY_BASELINE.md` §1 (Threat Model) links here.
>
> **Last updated:** 2026-08-02 — content consolidated verbatim from `SECURITY_BASELINE.md` §1.

---

## 1.1 Digital Assets

| Asset | Location | Classification | Owner |
|-------|----------|---------------|-------|
| Source code (monorepo) | GitLab (`HEXA-Studio/hexa-platform`) | Confidential | Engineering |
| PostgreSQL database | Docker internal network (`hexastudio_internal`) | Restricted | Backend |
| Redis session cache | Docker internal network (`hexastudio_internal`) | Internal | Backend |
| MinIO object storage | Docker network (`hexastudio_web`) | Restricted | Backend |
| User credentials (hashed) | PostgreSQL `users` table | Critical | Backend |
| JWT signing keys | Environment variables (server host) | Critical | DevOps |
| SSL/TLS certificates | Traefik ACME storage / Cloudflare | Critical | DevOps |
| API keys (Strapi, Odoo) | Environment variables | Critical | DevOps |
| Hostinger DNS API key | `.env` on production server | Critical | DevOps |
| GitLab CI/CD variables | GitLab UI (masked) | Critical | DevOps |
| SSH private keys | GitLab CI/CD variables | Critical | DevOps |
| Container images | GitLab Container Registry | Confidential | DevOps |
| Sentry DSN | Environment variables | Internal | Backend |
| Prometheus/Grafana config | Docker volumes | Internal | DevOps |
| Business data (leads, projects, invoices) | PostgreSQL + Odoo DB | Restricted | Odoo |
| PII (names, emails, phone numbers) | PostgreSQL + Odoo DB | Critical | Platform |

## 1.2 Attack Surface

| Entry Point | Protocol | Exposure | Authentication | Notes |
|-------------|----------|----------|---------------|-------|
| `hexastudio.net` (Next.js) | HTTPS :443 | Public | Optional (public pages) | WAF-protected, static rendering |
| `api.hexastudio.net` (NestJS BFF) | HTTPS :443 | Public | JWT Bearer + API Keys | Rate-limited, all inputs validated |
| `cms.hexastudio.net` (Strapi 5) | HTTPS :443 | Public (read) / Admin (write) | JWT (Strapi users) | Behind Traefik; admin panel restricted |
| `auth.hexastudio.net` (Auth service) | HTTPS :443 | Public | JWT | Login/register/refresh endpoints |
| `odoo.hexastudio.net` (Odoo ERP) | HTTPS :443 | Internal + VPN-only | Odoo session auth | **Not publicly accessible** — routed via Traefik, IP-restricted |
| `files.hexastudio.net` (MinIO) | HTTPS :443 | Internal only | Presigned URLs | No public bucket access |
| `monitor.hexastudio.net` (Grafana) | HTTPS :443 | Internal + VPN-only | Grafana auth | **Not publicly accessible** |
| `status.hexastudio.net` (Status page) | HTTPS :443 | Public | None (read-only) | Pushed from Uptime Kuma |
| GitLab (self-hosted) | HTTPS | VPN-only | GitLab auth | SSH + HTTPS for git operations |
| SSH (server) | TCP :22 | IP-restricted | SSH key | Only Cloudflare IPs + office IP |
| Docker socket | Unix socket | Local only | Root | Never exposed over network |
| Internal Docker network | TCP/UDP | Isolated bridge | Network isolation | `hexastudio_internal` has no external egress |
| PostgreSQL :5432 | TCP | `hexastudio_internal` only | Password | SSL required for connections |
| Redis :6379 | TCP | `hexastudio_internal` only | Password `requirepass` | No persistence (cache only) |
| Qdrant :6333 | TCP | `hexastudio_internal` only | API Key | Vector store |
| Prometheus :9090 | TCP | `hexastudio_internal` only | None | Metrics only |
| Weblate (translations) | HTTPS | VPN-only | Weblate auth | Self-hosted, restricted |

## 1.3 OWASP Top 10 (2021) Coverage

| # | Risk | Mitigation | Status |
|---|------|-----------|--------|
| A01 | Broken Access Control | RBAC guards (`@Roles()` decorator), row-level ownership checks, scope-based API keys | ✅ |
| A02 | Cryptographic Failures | TLS 1.3 everywhere, bcrypt (cost 12) for passwords, AES-256-GCM for PII at rest | ✅ |
| A03 | Injection | Parameterized queries via Prisma ORM, `class-validator` with whitelist, DOMPurify for HTML | ✅ |
| A04 | Insecure Design | Defense in depth network model, zero-trust internal network, security review in CI | ✅ |
| A05 | Security Misconfiguration | Traefik as centralized TLS terminator, HSTS/CSP/X-Frame-Options headers, no default creds | ✅ |
| A06 | Vulnerable Components | Trivy container scanning (CI gate), npm audit, Renovate bot, CycloneDX SBOM | ✅ |
| A07 | Auth Failures | JWT RS256 (15min TTL), refresh rotation (7 day TTL), rate-limited login, MFA for admins | ✅ |
| A08 | Data Integrity Failures | SBOM generation per build, signed commits, `package-lock.json` enforcement | ✅ |
| A09 | Logging Failures | Sentry error tracking, Loki log aggregation, Prometheus metrics, structured JSON logs | ⚠️ Partial (no SIEM) |
| A10 | SSRF | Internal network isolation (`hexastudio_internal`), no user-supplied URLs fetched server-side | ✅ |

---

> **End of THREAT_MODEL.md**