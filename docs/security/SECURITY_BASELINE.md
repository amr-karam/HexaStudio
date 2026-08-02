# HEXA Studio — SECURITY BASELINE

> **Version:** 1.1 | **Classification:** Confidential | **Last Updated:** 2026-07-27
>
> This document defines the minimum security posture for the HEXA Studio platform.
> All deviations must be documented as exceptions and approved by the security lead.

---

## 1. Threat Model

See `docs/security/THREAT_MODEL.md` (canonical threat model).

---

## 2. Authentication & Authorization

### 2.1 Strategy

The platform uses a **JWT-based authentication system** with the following design:

- **RS256 signing** (asymmetric) — private key signs tokens, public key verifies them.
- **Short-lived access tokens** (15 minutes) — minimizes exposure if leaked.
- **Refresh token rotation** — each refresh invalidates the previous token; family tracking detects replay.
- **HTTP-only cookies** for browser clients (prevents XSS token theft); `Authorization` header for API clients.
- **Passport.js guards** on all protected NestJS routes via `@UseGuards(JwtAuthGuard)`.

### 2.2 Token Lifecycle

```
┌──────────┐     POST /v1/auth/login     ┌────────────┐
│  Client  │ ──────────────────────────►  │  Backend   │
│          │ ◄──────────────────────────  │  (NestJS)  │
└──────────┘     { accessToken, refresh } └────────────┘
     │                                         │
     │  Bearer token in                        │  Verify credentials
     │  Authorization header                   │  against bcrypt hash
     │  or httpOnly cookie                     │  in PostgreSQL
     ▼                                         ▼
  ┌────────────────┐                  ┌──────────────────┐
  │  API Gateway   │                  │  JWT Sign (RS256)│
  │  (Traefik/Nest)│                  │  access: 15min   │
  │  Verify token  │                  │  refresh: 7 days │
  └────────────────┘                  └──────────────────┘
```

### 2.3 Implementation Details

**NestJS JWT Guard (used on all protected routes):**
```typescript
// apps/backend/src/common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Usage on controller
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Req() req: RequestWithUser) {
  return this.usersService.findById(req.user.sub);
}
```

**NestJS RBAC Guard (additional role check):**
```typescript
// apps/backend/src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Usage
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async remove(@Param('id') id: string) { ... }
```

### 2.4 RBAC Role Matrix

| Role | Public Pages | Own Profile | Projects (own) | Projects (all) | Leads | CMS Content | System Config | User Management |
|------|-------------|-------------|----------------|----------------|-------|-------------|--------------|----------------|
| `guest` | ✅ Read | — | — | — | — | — | — | — |
| `user` | ✅ Read | ✅ R/W | ✅ R/W | — | ✅ Create | — | — | — |
| `client` | ✅ Read | ✅ R/W | ✅ R/W (assigned) | — | ✅ Create | — | — | — |
| `editor` | ✅ Read | ✅ R/W | ✅ Read | ✅ Read | ✅ Read | ✅ R/W | — | — |
| `manager` | ✅ Read | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ Read | — | — |
| `admin` | ✅ Read | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W |
| `superadmin` | ✅ Read | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W |

### 2.5 API Key Scopes

For machine-to-machine access, API keys can be scoped:

```json
{
  "name": "CI/CD Deploy Key",
  "scopes": ["projects:read", "deployments:write"],
  "expires_at": "2027-01-01T00:00:00Z"
}
```

Available scopes: `projects:read`, `projects:write`, `users:read`, `users:write`, `leads:read`, `leads:write`, `analytics:read`, `deployments:write`.

---

## 3. Encryption

### 3.1 In Transit

| Path | Protocol | Cipher | Notes |
|------|----------|--------|-------|
| Browser → Cloudflare | HTTPS / TLS 1.3 | TLS_AES_128_GCM_SHA256 | Cloudflare edge terminates |
| Cloudflare → Traefik | HTTPS / TLS 1.3 | TLS_AES_128_GCM_SHA256 | Origin pull using Cloudflare origin cert |
| Traefik → Backend (NestJS) | HTTP (internal) | — | Docker internal network, no external exposure |
| Backend → PostgreSQL | TCP + SSL | TLS 1.3 | `sslmode=require` in connection string |
| Backend → Redis | TCP + AUTH | — | Password authentication; no TLS (internal network) |
| Backend → MinIO | HTTP (internal) | — | Presigned URLs for upload/download |
| Backend → Qdrant | gRPC (internal) | — | API key authentication |
| GitLab → Server | SSH / HTTPS | TLS 1.3 | GitLab self-hosted with Let's Encrypt |
| Server → GitLab Registry | HTTPS | TLS 1.3 | `docker login` via CI/CD variables |

### 3.2 At Rest

| Data Store | Data Type | Encryption Method | Status |
|-----------|-----------|-------------------|--------|
| PostgreSQL | All data | None at storage layer | ⚠️ Gap — disk-level encryption recommended (LUKS or cloud provider KMS) |
| PostgreSQL | Passwords | bcrypt hash (cost factor 12) | ✅ |
| PostgreSQL | PII (email, phone, address) | AES-256-GCM column-level encryption | ✅ |
| PostgreSQL | JWT refresh tokens | SHA-256 hash stored in DB | ✅ |
| PostgreSQL | Password reset tokens | SHA-256 hash, 1-hour TTL | ✅ |
| MinIO | All objects | None (server-side) | ⚠️ Gap — client-side encryption recommended for sensitive uploads |
| MinIO | Backups | GPG-encrypted (`--symmetric --cipher-algo AES256`) | ✅ |
| Redis | Session/cache data | In-memory only (no persistence) | ✅ (cleared on restart) |
| Docker volumes | Logs, config | None | ⚠️ Gap — consider volume encryption |
| Host filesystem | `.env` files | None (file permissions restricted) | ⚠️ Gap — `.env` files may leak |

### 3.3 Key Rotation Schedule

| Key Type | Rotation Frequency | Method |
|----------|-------------------|--------|
| JWT signing key pair | Every 90 days | Generate new RS256 keypair, update public key in config |
| JWT refresh secret | Every 90 days | Rotate `JWT_REFRESH_SECRET` env var |
| Database passwords | On staff change + annually | Update PostgreSQL roles, update connection strings |
| Redis password | On staff change + annually | Update `REDIS_PASSWORD` env var |
| API keys (Strapi, Odoo) | Every 180 days | Regenerate in respective admin panels |
| Cloudflare API token | Every 90 days | Rotate in Cloudflare dashboard |
| SSH deploy keys | On staff change | Revoke old, add new to `authorized_keys` |
| Hostinger API key | Every 90 days | Rotate in Hostinger, update `.env` |

---

## 4. Secrets Management

### 4.1 Current Approach

Secrets are injected into containers via **environment variables** at runtime:

```yaml
# docker-compose.prod.yml pattern
services:
  backend:
    environment:
      DATABASE_URL: ${DATABASE_URL:?DATABASE_URL is required}
      JWT_PRIVATE_KEY: ${JWT_PRIVATE_KEY:?JWT_PRIVATE_KEY is required}
      JWT_PUBLIC_KEY: ${JWT_PUBLIC_KEY:?JWT_PUBLIC_KEY is required}
      STRAPI_API_TOKEN: ${STRAPI_API_TOKEN:?STRAPI_API_TOKEN is required}
      REDIS_PASSWORD: ${REDIS_PASSWORD:?REDIS_PASSWORD is required}
      SENTRY_DSN: ${SENTRY_DSN:?SENTRY_DSN is required}
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}
```

Secrets are sourced from:

| Source | Environment | Security |
|--------|------------|----------|
| `.env` file (host) | Production server | File permissions: `600`, root-owned; excluded from git |
| `.env` file (local) | Development | Excluded from git; may exist on dev machines |
| GitLab CI/CD variables | CI/CD pipeline | Masked in job logs; editable in GitLab UI |
| Docker secrets (future) | Docker Swarm/K8s | **Not yet implemented** |

### 4.2 Inventory of Production Secrets

| Secret Name | Where Set | How Used | Last Rotated |
|-------------|-----------|----------|-------------|
| `DATABASE_URL` | Server `.env` | Backend, CMS, Odoo connection | — |
| `JWT_PRIVATE_KEY` | Server `.env` | Backend token signing | — |
| `JWT_PUBLIC_KEY` | Server `.env` | Backend token verification | — |
| `JWT_REFRESH_SECRET` | Server `.env` | Refresh token signing | — |
| `STRAPI_API_TOKEN` | Server `.env` | Backend → CMS communication | — |
| `ODOO_DB_PASSWORD` | Server `.env` | Backend → Odoo communication | — |
| `REDIS_PASSWORD` | Server `.env` | Redis authentication | — |
| `MINIO_ROOT_USER` | Server `.env` | MinIO admin access | — |
| `MINIO_ROOT_PASSWORD` | Server `.env` | MinIO admin access | — |
| `QDRANT_API_KEY` | Server `.env` | Qdrant vector store auth | — |
| `SENTRY_DSN` | Server `.env` | Error reporting | — |
| `CLOUDFLARE_API_TOKEN` | Server `.env` | DNS/Tunnel management | — |
| `HOSTINGER_API_KEY` | Server `.env` | DNS record updates | ✅ (hardcoded key removed) |
| `SSH_PRIVATE_KEY` | GitLab CI/CD variable | Deploy to production server | — |
| `PROD_SERVER_USER` | GitLab CI/CD variable | SSH username | — |
| `PROD_SERVER_IP` | GitLab CI/CD variable | SSH host address | — |
| `STAGING_SERVER_USER` | GitLab CI/CD variable | SSH username | — |
| `STAGING_SERVER_IP` | GitLab CI/CD variable | SSH host address | — |
| `SNYK_TOKEN` | GitLab CI/CD variable | Snyk SCA/SAST scanning | — |
| `CI_REGISTRY_PASSWORD` | GitLab CI/CD variable | Docker registry auth | — |
| `CLOUDFLARE_ORIGIN_CERT` | Server (Traefik) | TLS origin pull | — |
| `CLOUDFLARE_ORIGIN_KEY` | Server (Traefik) | TLS origin pull | — |
| ACME Let's Encrypt certs | Traefik (auto-renewed) | Web TLS | Auto-renewed |

### 4.3 Gaps & Remediation Plan

| Gap | Risk | Priority | Remediation |
|-----|------|----------|-------------|
| No dedicated secret manager | Secrets in `.env` files on disk; no audit trail of access | High | Deploy HashiCorp Vault or integrate with cloud KMS (e.g., GCP Secret Manager) |
| No automatic key rotation | Compromised secrets may go undetected for long periods | High | Implement scheduled rotation scripts + CI/CD jobs |
| `.env` files on dev machines | Secrets may leak via screen capture, careless git commits | Medium | Add `.env` scanning to pre-commit hook (e.g., `git-secrets` or `trufflehog`) |
| SSH key stored in GitLab | Any GitLab compromise leaks deploy access | Medium | Short-lived SSH certificates or OIDC-based deploy tokens |
| No secret scanning in CI | Secrets accidentally committed won't be caught | Medium | Add `trufflehog` or `git-secrets` scan to CI pipeline |

---

## 5. Network Security Architecture

### 5.1 Network Topology

```
                         INTERNET
                            │
                     ┌──────▼──────┐
                     │  Cloudflare  │  ← WAF, DDoS protection, CDN
                     │  CDN + WAF  │
                     └──────┬──────┘
                            │ (TLS 1.3 origin pull)
                     ┌──────▼──────┐
                     │   Traefik   │  ← TLS termination, routing, rate limiting
                     │    v3.0     │
                     └──┬──────┬───┘
                        │      │
          ┌─────────────┘      └─────────────┐
          ▼                                    ▼
   ┌──────────────┐                    ┌──────────────┐
   │  hexastudio_web  │                │  hexastudio_internal  │
   │  (external net)  │                │  (isolated, no egress)│
   │                  │                │                        │
   │  ┌──────────┐    │                │  ┌──────────┐         │
   │  │ Next.js  │    │                │  │PostgreSQL│         │
   │  │ :3000    │    │                │  │ :5432    │         │
   │  └──────────┘    │                │  └──────────┘         │
   │  ┌──────────┐    │                │  ┌──────────┐         │
   │  │ NestJS   │    │                │  │  Redis   │         │
   │  │ :4000    │    │                │  │ :6379    │         │
   │  └──────────┘    │                │  └──────────┘         │
   │  ┌──────────┐    │                │  ┌──────────┐         │
   │  │  Strapi  │    │                │  │  Qdrant  │         │
   │  │ :1337    │    │                │  │ :6333    │         │
   │  └──────────┘    │                │  └──────────┘         │
   │  ┌──────────┐    │                │  ┌──────────┐         │
   │  │  MinIO   │    │                │  │Prometheus│         │
   │  │ :9000    │    │                │  │ :9090    │         │
   │  └──────────┘    │                │  └──────────┘         │
   │  ┌──────────┐    │                │  ┌──────────┐         │
   │  │  Odoo    │    │                │  │   Loki   │         │
   │  │ :8069    │    │                │  │ :3100    │         │
   │  └──────────┘    │                │  └──────────┘         │
   │  ┌──────────┐    │                │  ┌──────────┐         │
   │  │Cloudflare│    │                │  │ Promtail │         │
   │  │  Tunnel  │    │                │  └──────────┘         │
   │  └──────────┘    │                │                        │
   └──────────────────┘                └────────────────────────┘
```

### 5.2 Firewall Rules (Production Server)

| Direction | Protocol | Port | Source | Purpose |
|-----------|----------|------|--------|---------|
| Inbound | TCP | 22 | Office static IP + Cloudflare IP ranges | SSH access |
| Inbound | TCP | 80, 443 | 0.0.0.0/0 | HTTP/HTTPS (Cloudflare proxied) |
| Inbound | UDP | 443 | Cloudflare IP ranges | Cloudflare Tunnel (QUIC) |
| Outbound | TCP | 443 | Any | Docker registry, Sentry, GitLab |
| All others | — | — | — | **Deny** |

### 5.3 Docker Network Rules

- **`hexastudio_web`**: Services can communicate with each other. Traefik is the only entry point from outside.
- **`hexastudio_internal`**: `internal: true` — no external network access. Services cannot reach the internet.
- **No port mapping on internal services**: PostgreSQL, Redis, Qdrant, Prometheus, Loki are **never** exposed to the host.

---

## 6. HTTP Security Headers

Every HTTP response from Traefik and all application services **must** include:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.hexastudio.net https://*.cloudflare.com; connect-src 'self' https://api.hexastudio.net; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

### Traefik Middleware Configuration

```yaml
# docker/traefik/config/security-headers.yml
http:
  middlewares:
    security-headers:
      headers:
        frameDeny: true
        sslRedirect: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        contentTypeNosniff: true
        browserXssFilter: true
        customFrameOptionsValue: "DENY"
        contentSecurityPolicy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.hexastudio.net https://*.cloudflare.com; connect-src 'self' https://api.hexastudio.net; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        referrerPolicy: "strict-origin-when-cross-origin"
        permissionsPolicy: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        customResponseHeaders:
          Cross-Origin-Opener-Policy: "same-origin"
          Cross-Origin-Embedder-Policy: "require-corp"
          Cross-Origin-Resource-Policy: "same-origin"
```

---

## 7. Audit Logging

### 7.1 Events to Log

| Event Category | Specific Events | Data Captured | Retention | Storage |
|---------------|----------------|---------------|-----------|---------|
| **Authentication** | Login success, login failure, logout, token refresh | User ID, IP, user-agent, timestamp | 90 days | Loki + PostgreSQL |
| **Account Management** | Registration, profile update, password change, account deletion | User ID, changed fields, IP, timestamp | 1 year | Loki + PostgreSQL |
| **Authorization** | Role change, permission grant/revoke | Admin ID, target ID, old/new role, timestamp | 1 year (immutable) | PostgreSQL (audit table) |
| **Data Access** | API key creation/deletion, data export, bulk data access | User ID, resource, action, IP, timestamp | 90 days | Loki |
| **Admin Actions** | Content publish/unpublish, user suspend, system config change | Admin ID, action, target, timestamp | 1 year | Loki + PostgreSQL |
| **Security Events** | Rate limit exceeded, suspicious IP, failed 2FA, blocked request | IP, endpoint, reason, timestamp | 90 days | Loki |
| **CI/CD Events** | Pipeline run, deployment, secret access | Pipeline ID, user, action, timestamp | 90 days | GitLab audit events |
| **System Events** | Container restart, OOM, health check failure | Service name, event, timestamp | 30 days | Loki |

### 7.2 Log Format (Structured JSON)

```json
{
  "timestamp": "2026-07-26T14:30:00.123Z",
  "level": "info",
  "event": "auth.login.success",
  "correlationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "user_2xK3pQ9mRn",
  "ip": "203.0.113.42",
  "userAgent": "Mozilla/5.0 ...",
  "metadata": {
    "method": "password",
    "mfaUsed": false
  },
  "service": "backend",
  "environment": "production"
}
```

### 7.3 Log Storage & Retention

| Log Source | Destination | Retention | Format |
|-----------|-------------|-----------|--------|
| Application logs (stdout/stderr) | Loki (via Promtail) | 7 days | Structured JSON |
| Authentication audit trail | PostgreSQL `audit_logs` table | 1 year | Relational rows |
| Error events (exceptions) | Sentry | 90 days | Grouped by fingerprint |
| Infrastructure metrics | Prometheus | 30 days | Time-series |
| GitLab CI/CD audit | GitLab UI | 1 year | GitLab native |
| Docker container logs | Loki (via Promtail) | 7 days | Plain text → parsed by Promtail |

---

## 8. Incident Response

See `docs/security/INCIDENT_RESPONSE.md` (canonical incident response).

---

## 9. Security Scanning Pipeline

### 9.1 CI/CD Security Gates (`.gitlab-ci.yml`)

| Stage | Job | Tool | What It Scans | Gate Policy |
|-------|-----|------|---------------|-------------|
| **quality** | `security-scan` | npm audit + Snyk | JS dependencies (direct + transitive) | `allow_failure: true` (reported in Security tab) |
| **quality** | `dependency_scanning` | npm audit → GitLab report | JS dependencies | `allow_failure: true` |
| **quality** | `container_scanning` | Trivy | Docker images (OS + app vulns) | `allow_failure: true` |
| **quality** | `sbom` | CycloneDX | All dependencies → SBOM | Non-blocking |
| **validate** | `container-scan` | Trivy (full severity) | Docker images (HIGH/CRITICAL) | **Fails on fixable CRITICAL** (exit code 1) |

### 9.2 Scanning Configuration

**Trivy Container Scan (CI gate):**
```yaml
# .gitlab-ci.yml — container-scan job (extract)
container-scan:
  script:
    # Scan all three images
    - trivy image --format json --output trivy-backend.json --severity HIGH,CRITICAL $BACKEND_IMAGE:$IMAGE_TAG_SHA
    - trivy image --format json --output trivy-frontend.json --severity HIGH,CRITICAL $FRONTEND_IMAGE:$IMAGE_TAG_SHA
    - trivy image --format json --output trivy-cms.json --severity HIGH,CRITICAL $CMS_IMAGE:$IMAGE_TAG_SHA
    # Gate: fail pipeline only on fixable CRITICAL vulnerabilities
    - trivy image --exit-code 1 --severity CRITICAL --ignore-unfixed $BACKEND_IMAGE:$IMAGE_TAG_SHA
    - trivy image --exit-code 1 --severity CRITICAL --ignore-unfixed $FRONTEND_IMAGE:$IMAGE_TAG_SHA
    - trivy image --exit-code 1 --severity CRITICAL --ignore-unfixed $CMS_IMAGE:$IMAGE_TAG_SHA
```

**npm Audit (early quality gate):**
```yaml
# .gitlab-ci.yml — security-scan job (extract)
security-scan:
  script:
    - npm audit --audit-level=high || true
    # Optional Snyk scan
    - |
      if [ -n "$SNYK_TOKEN" ]; then
        npx --yes snyk@latest auth "$SNYK_TOKEN"
        npx --yes snyk@latest test --severity-threshold=high || true
        npx --yes snyk@latest code test --severity-threshold=high || true
      fi
```

**SBOM Generation:**
```yaml
# .gitlab-ci.yml — sbom job (extract)
sbom:
  script:
    - npx --yes @cyclonedx/cyclonedx-npm@latest --output-file gl-sbom.json
```

### 9.3 Vulnerability Triage Policy

| Severity | Fix SLA | Action |
|----------|---------|--------|
| CRITICAL (fixable) | 48 hours | Blocking — fails CI pipeline; must be patched or documented exception |
| CRITICAL (unfixable) | 7 days | Investigate exploitability; add to exception list if not reachable |
| HIGH | 1 week | Fix in next regular release |
| MEDIUM | 30 days | Schedule fix in upcoming sprint |
| LOW | Next major release | Track in backlog |

### 9.4 Exception Process

If a vulnerability cannot be fixed (e.g., no patch available, false positive):

1. Document in `SECURITY_EXCEPTIONS.md` (to be created in this directory).
2. Include: CVE ID, package, version, reason for exception, mitigation in place, review date.
3. Exceptions expire after 90 days and must be re-reviewed.

---

## 10. Compliance

### 10.1 GDPR (EU Users)

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Consent management | Cookie consent banner on `hexastudio.net`; consent record stored in DB | ⚠️ Partial (needs explicit opt-in for analytics) |
| Right to access | `GET /v1/users/:id/data` — exports all user data as JSON | ✅ |
| Right to erasure | `DELETE /v1/users/:id` — anonymizes or deletes all PII, with audit trail | ✅ |
| Data portability | `GET /v1/users/:id/export` — downloads all user data in machine-readable format | ✅ |
| Data retention | PII retained for 90 days after account closure; logs retained per schedule | ✅ |
| Breach notification | 72-hour notification to supervisory authority + affected users | ⚠️ Partial (process defined, not tested) |
| DPA (Data Processing Agreement) | Required for sub-processors (Cloudflare, Sentry, GitLab) | ⚠️ Not yet documented |
| Privacy policy | Published at `https://hexastudio.net/privacy` | ✅ |

### 10.2 SOC 2 (Partial)

| Trust Service Criteria | Implementation | Status |
|-----------------------|---------------|--------|
| **Security** — Protect against unauthorized access | RBAC, WAF, TLS 1.3, audit logging, CI/CD security gates | ✅ |
| **Availability** — System available for operation | Docker healthchecks, Prometheus alerts, automated restart, backup recovery | ✅ |
| **Processing Integrity** — Processing is complete and accurate | Input validation, integration tests, E2E tests | ✅ |
| **Confidentiality** — Information designated as confidential is protected | Encryption at rest (partial), access controls, network isolation | ⚠️ Partial (encryption gaps noted in §3.2) |
| **Privacy** — PII is collected, used, retained, and disclosed per commitments | GDPR compliance framework, PII classification | ⚠️ Partial (CCPA not yet addressed) |

### 10.3 CCPA (California Users)

- **Right to know**: What PII is collected, how it's used, with whom it's shared.
- **Right to delete**: Request deletion of PII (same as GDPR erasure endpoint).
- **Right to opt out**: Sell of data? HEXA does not sell user data.
- **Status**: ⚠️ Not yet fully implemented — privacy policy must be updated for CCPA.

---

## 11. Security Exceptions

Any deviation from this baseline must be documented here.

| # | Date | Rule Deviated | Reason | Mitigation | Expiry | Approved By |
|---|------|-------------|--------|-----------|--------|-------------|
| — | — | — | — | — | — | — |

*No exceptions currently documented.*

---

## 12. Related Documents

| Document | Location |
|----------|----------|
| Threat model | `docs/security/THREAT_MODEL.md` |
| Incident response | `docs/security/INCIDENT_RESPONSE.md` |
| Security Standards (detailed) | `docs/security/SECURITY.md` |
| Security Standards (reference) | `docs/security/SECURITY_STANDARDS.md` |
| Security Checklist | `docs/checklists/SECURITY_CHECKLIST.md` |
| Authentication API | `docs/api/AUTHENTICATION.md` |
| Authorization (RBAC) | `docs/api/AUTHORIZATION.md` |
| Network Architecture | `docs/architecture/NETWORK_ARCHITECTURE.md` |
| Docker Compose Configuration | `docs/devops/DOCKER_COMPOSE.md` |
| Deployment Pipeline | `docs/devops/DEPLOYMENT.md` |
| Monitoring & Observability | `docs/devops/MONITORING.md` |
| Disaster Recovery | `docs/devops/DISASTER_RECOVERY.md` |
| CI/CD Pipeline | `.gitlab-ci.yml` |
| Security CI Jobs | `.gitlab/security.yml` |
| Incident Response (external) | `docs/devops/incident-response.md` |

---

> **End of SECURITY_BASELINE.md**
>
> This baseline is a living document. Review and update at least quarterly,
> or whenever significant infrastructure or application changes occur.