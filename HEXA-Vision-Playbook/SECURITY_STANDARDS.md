# Security Standards

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Security Principles

1. **Defense in Depth** — Multiple layers of security. No single point of failure.
2. **Least Privilege** — Every user, service, and process has minimum required access.
3. **Security by Default** — Secure configurations are the default, not an opt-in.
4. **Zero Trust** — Verify everything. Never trust network boundaries.
5. **Fail Secure** — When a system fails, it fails in a secure state.

---

## Network Security

```
┌──────────────────────────────────────────┐
│             PUBLIC NETWORK               │
│  ┌──────────┐  ┌──────────┐              │
│  │ Traefik  │  │ CDN/WAF  │              │
│  │ :443     │  │ Cloudfl. │              │
│  └────┬─────┘  └──────────┘              │
└───────┼──────────────────────────────────┘
        │ (only exposed ports)
┌───────┼──────────────────────────────────┐
│       ▼                                   │
│  ┌──────────┐  ┌──────────┐              │
│  │ Next.js  │  │ NestJS   │              │
│  │ :3000    │  │ :4000    │              │
│  └──────────┘  └──────────┘              │
│                                            │
│  ┌──────────────────────────────────┐     │
│  │         INTERNAL NETWORK          │     │
│  │  ┌──────┐ ┌──────┐ ┌──────────┐  │     │
│  │  │ PG   │ │Redis │ │  MinIO   │  │     │
│  │  │:5432 │ │:6379 │ │  :9000   │  │     │
│  │  └──────┘ └──────┘ └──────────┘  │     │
│  │  ┌──────┐ ┌──────┐              │     │
│  │  │Strapi│ │ Odoo │              │     │
│  │  │:1337 │ │:8069 │              │     │
│  │  └──────┘ └──────┘              │     │
│  └──────────────────────────────────┘     │
└──────────────────────────────────────────┘
```

### Rules

- **No database ports exposed publicly** — Only accessible from internal Docker network
- **No Odoo/Strapi ports exposed publicly** — Accessible only via NestJS BFF
- **Traefik** terminates all SSL/TLS
- **Cloudflare WAF** filters before traffic reaches the server

---

## Authentication

### JWT Strategy

| Parameter | Value |
|-----------|-------|
| Algorithm | RS256 |
| Access Token TTL | 15 minutes |
| Refresh Token TTL | 7 days |
| Secret | 256-bit minimum, injected via env |
| Storage | HTTP-only cookies (preferred) or Authorization header |

### Password Policy

| Requirement | Value |
|-------------|-------|
| Minimum length | 12 characters |
| Complexity | Upper, lower, number, special character |
| Hash algorithm | bcrypt (cost factor 12) |
| Storage | Hashed only, never plain text |
| Reset tokens | Single-use, 1-hour TTL, hashed in DB |

### Multi-Factor Authentication

- Required for admin roles
- TOTP-based (time-based one-time password)
- Backup codes provided on setup

---

## API Security

### Rate Limiting

| Endpoint | Rate | Window |
|----------|------|--------|
| Public API | 100 requests | 1 minute |
| Auth (login) | 5 attempts | 15 minutes |
| Auth (register) | 3 attempts | 1 hour |
| Contact form | 5 submissions | 1 hour |
| Admin API | 500 requests | 1 minute |

### Request Validation

All API inputs must be validated:

```typescript
@Post()
async create(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: CreateUserDto) {
  // dto is guaranteed valid here
}
```

### Headers

Every response must include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: [configured per environment]
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Content Security Policy

### Development

```
default-src 'self';
script-src 'self' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self' http://localhost:* ws://localhost:*;
```

### Production

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://*.hexastudio.net https://*.cloudflare.com;
connect-src 'self' https://api.hexastudio.net;
font-src 'self' https://fonts.gstatic.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

---

## Data Protection

### At Rest

| Data Type | Encryption | Location |
|-----------|------------|----------|
| Passwords | bcrypt (hash) | PostgreSQL |
| PII | AES-256-GCM | PostgreSQL |
| Media | SSE-S3 (MinIO) | MinIO |
| Backups | AES-256 | Backup storage |
| Session data | Redis (in-memory) | Redis |

### In Transit

- All external traffic: TLS 1.3
- All internal traffic: Docker network (isolated) + optional mTLS
- Database connections: SSL required
- Redis connections: Password required

### PII Handling

- Collect minimum necessary PII
- Mask PII in logs
- Delete PII on account deletion (with audit trail)
- GDPR right-to-erasure endpoint
- Data retention: 90 days after account closure

---

## Access Control (RBAC)

### Roles

| Role | Access Level |
|------|-------------|
| `public` | View published projects, blog, services |
| `client` | View assigned projects, upload files, comments |
| `user` | View own profile, manage preferences |
| `editor` | Manage content in Strapi |
| `admin` | Full system access |
| `superadmin` | Infrastructure access, user management |

### Permission Model

```
User → Role → [Permissions]
          ↓
     Resource → [Actions: create, read, update, delete]
```

### API Guard Implementation

```typescript
@UseGuards(RolesGuard)
@Roles('admin')
@Delete(':id')
async remove(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

---

## Secrets Management

### Rules

1. **Never commit secrets** — `.env` files are in `.gitignore`
2. **Use environment variables** — For all configuration
3. **Rotate regularly** — JWT secrets quarterly, database passwords on staff change
4. **Audit access** — Log all secret access in production
5. **CI/CD secrets** — Use GitHub Actions secrets or vault

### Environment Variables

```bash
# .env.example (committed)
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=your-secret-here
STRAPI_API_TOKEN=your-token-here

# .env (NOT committed - production values)
```

---

## Audit Logging

### Events to Log

| Event | Data | Retention |
|-------|------|-----------|
| Login success | User ID, IP, timestamp, user-agent | 90 days |
| Login failure | IP, timestamp, attempt count | 30 days |
| Role change | Admin ID, target ID, old/new role | 1 year |
| Data export | User ID, data type, timestamp | 1 year |
| Account deletion | User ID, timestamp, reason | 1 year (immutable) |
| API access (admin) | User ID, endpoint, method, timestamp | 90 days |

### Log Format

```json
{
  "timestamp": "2026-07-08T12:00:00Z",
  "level": "info",
  "event": "user.login",
  "userId": "uuid",
  "ip": "::1",
  "userAgent": "Mozilla/5.0...",
  "metadata": {}
}
```

---

## Vulnerability Management

### Dependencies

- Monthly `npm audit` scan
- Critical vulnerabilities: fix within 48 hours
- High vulnerabilities: fix within 1 week
- Renovate bot for automated dependency PRs

### Testing

| Test | Frequency |
|------|-----------|
| SAST (Static Analysis) | Every PR |
| Dependency scanning | Weekly |
| Penetration testing | Quarterly (external) |
| Security audit | Bi-annually |

### Incident Response

See `devops/incident-response.md` for the complete IR plan.

| Phase | Time | Action |
|-------|------|--------|
| Detection | < 15 min | Alert from monitoring |
| Triage | < 30 min | Severity assessment |
| Containment | < 1 hr | Isolate affected systems |
| Eradication | < 4 hrs | Remove threat |
| Recovery | < 8 hrs | Restore operations |
| Post-mortem | < 48 hrs | Root cause analysis |
