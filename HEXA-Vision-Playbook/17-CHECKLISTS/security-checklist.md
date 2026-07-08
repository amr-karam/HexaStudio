# Security Checklist

---

## Authentication & Authorization

- [ ] JWT tokens expire (15 min access, 7 day refresh)
- [ ] Passwords hashed with bcrypt (cost factor ≥ 12)
- [ ] Rate limiting on auth endpoints (5 attempts / 15 min)
- [ ] MFA required for admin roles
- [ ] Session invalidation on logout
- [ ] Password reset tokens are single-use, time-limited

## API Security

- [ ] All inputs validated (class-validator with whitelist)
- [ ] Rate limiting on all endpoints
- [ ] CORS configured for specific origins only
- [ ] No sensitive data in URL query strings
- [ ] API versioning prevents breaking changes
- [ ] Request size limits enforced

## Network Security

- [ ] Databases not exposed publicly (Docker internal network)
- [ ] Strapi/Odoo not exposed publicly (via BFF only)
- [ ] TLS 1.3 on all external connections
- [ ] Database connections use SSL
- [ ] Redis requires password authentication

## HTTP Security Headers

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: [configured per environment]
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- [ ] All security headers present

## Data Protection

- [ ] Passwords never logged or stored in plain text
- [ ] PII masked in logs
- [ ] Data encrypted at rest (AES-256-GCM for sensitive data)
- [ ] Backups encrypted
- [ ] GDPR right-to-erasure endpoint implemented
- [ ] Data retention policies documented

## Dependency Security

- [ ] `npm audit` passes (0 critical, 0 high)
- [ ] No known vulnerable dependencies
- [ ] Renovate bot configured for automated updates
- [ ] Major version updates manually reviewed

## CI/CD Security

- [ ] No secrets in code or Docker images
- [ ] All secrets injected at runtime via environment
- [ ] CI pipeline validates secrets are not exposed
- [ ] Docker images scanned for vulnerabilities

## Audit Logging

- [ ] All authentication events logged
- [ ] Admin actions logged
- [ ] Data export/delete events logged
- [ ] Logs immutable (append-only)
- [ ] Log retention configured
