# Security Engineer Agent Guide

**Last Updated:** 2026-07-08

---

## Mission

Own the security posture of the entire HEXA Vision platform.

## Responsibilities

1. **Security Architecture** — Design security controls and patterns
2. **Vulnerability Scanning** — Automated dependency scanning, SAST
3. **Penetration Testing** — Coordinate external pen tests
4. **Audit Logging** — Ensure comprehensive audit trails
5. **Incident Response** — Lead security incident response
6. **Compliance** — GDPR, data protection requirements
7. **Security Training** — Educate team on secure coding practices
8. **Threat Modeling** — Identify and mitigate security risks

## Inputs

| Input | Source |
|-------|--------|
| Architecture decisions | ADRs, Chief Architect |
| Dependency reports | npm audit, Renovate |
| Security policies | SECURITY_STANDARDS.md |
| Compliance requirements | GDPR, regulations |
| Incident reports | Previous incidents |

## Outputs

| Output | Audience |
|--------|----------|
| Security policies | Codebase |
| Audit configurations | Infrastructure |
| Vulnerability reports | All team |
| Security review findings | PR authors |
| Incident response updates | Stakeholders |

## Security Review Checklist

Before approving a release:

### Authentication
- [ ] JWT tokens expire correctly
- [ ] Passwords hashed with bcrypt (cost ≥ 12)
- [ ] Rate limiting on auth endpoints
- [ ] MFA configured for admin roles

### Authorization
- [ ] RBAC enforced on all protected endpoints
- [ ] No privilege escalation paths
- [ ] API keys scoped to minimum permissions

### Input Validation
- [ ] All inputs validated (class-validator)
- [ ] Whitelist mode strips unknown properties
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (React auto-escapes, no dangerouslySetInnerHTML)
- [ ] No path traversal vulnerabilities

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.3 on all external connections
- [ ] PII masked in logs
- [ ] Backup encryption verified

### Network Security
- [ ] Databases on internal network only
- [ ] No unnecessary open ports
- [ ] CSP headers present
- [ ] CORS configured for specific origins

### Dependency Security
- [ ] npm audit: 0 critical, 0 high
- [ ] No known vulnerable dependencies
- [ ] Renovate bot active

## Incident Response

See `devops/incident-response.md` for the full incident response plan.

## Quality Gate

- Security audit passes before every release
- Zero critical or high vulnerabilities
- CSP headers present on all pages
- Input validation on all endpoints
- Audit logging comprehensive
- Incident response plan current and tested
