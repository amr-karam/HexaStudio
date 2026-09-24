# 🛡️ HEXA STUDIO — SECURITY GOVERNANCE & ZERO-TRUST POLICY

**Version:** 1.0.0  
**Authority Level:** 6  
**Scope:** Authentication, Authorization, Database Privacy, Rate Limiting, & Secret Management  

---

## 1. CORE SECURITY DIRECTIVES

1. **Never Commit Secrets**: Private keys, database passwords, JWT secrets, or API keys MUST NEVER be committed to Git. All secrets MUST be injected via environment variables (`.env.local` / Docker secrets).
2. **Internal Network Isolation**: PostgreSQL, Redis, and Qdrant MUST remain strictly on internal Docker networks (`hexastudio_internal`) with 0 public port exposure.
3. **Server-Side Authorization**: Authentication and role-based access control (`JwtAuthGuard`, `RolesGuard`) MUST be enforced on the NestJS backend. Never rely solely on client UI checks.
4. **Input Sanitization**: All user inputs on forms and API endpoints MUST be sanitized and validated using Zod / Class-Validator to prevent XSS and SQL/NoSQL injection.

---

## 2. INGRESS & PROXY SECURITY (TRAEFIK V3)

- **SSL/TLS Termination**: Traefik v3 handles HTTPS certificate generation via Let's Encrypt / Cloudflare API.
- **Security Headers**: HSTS (`stsSeconds: 63072000`), `frameDeny: true`, `contentTypeNosniff: true`, and strict CSP policy enforced at edge.
- **Rate Limiting**: NestJS `ThrottlerGuard` and Traefik `rate-limit` middleware limit requests to 100 req/min per IP.

---

## 3. AUDIT & LOGGING

- Security-relevant events (failed logins, approval changes, administrative updates) MUST emit structured audit logs to Loki / Grafana.

---

## 4. ACCEPTED VULNERABILITIES (Risk Register)

### Frontend (apps/frontend) — Dev-Only Dependencies
| CVE/GHSA | Package | Severity | Status | Rationale |
|----------|---------|----------|--------|-----------|
| GHSA-5p2g-fcmc-qvqq | `image-size` (via storybook) | High | **Accepted** | Dev-only; Storybook 10.6.0 upgraded; not in production bundle |
| GHSA-* (metro) | `metro-transform-worker` | High | **Accepted** | React Native transitive dep; mobile workspace only; not in web build |
| GHSA-* (storybook) | `@storybook/nextjs` | High | **Accepted** | Dev-only; upgraded to 10.6.0; no production exposure |

### Backend (apps/backend) — Deferred
| CVE/GHSA | Package | Severity | Status | Rationale |
|----------|---------|----------|--------|-----------|
| GHSA-528h-pc64-c93x | `stream-json` (via minio) | Moderate | **Deferred** | Fixed by NestJS 12 migration (minio@7.1.3); blocked by test infra availability |

> **Review Cadence**: Monthly (first Monday). Update `npm audit` output in this section.
