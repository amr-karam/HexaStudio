# RELEASE DECISION

## ❌ REJECTED

---

### Decision: DO NOT RELEASE TO PRODUCTION

The project is **not ready for production deployment** due to **multiple critical issues** that must be resolved first.

### Primary Grounds for Rejection

| # | Issue | Severity |
|---|-------|----------|
| 1 | **Hardcoded database password** in `apps/cms/config/database.ts:9` — plaintext credential committed to repository | **CRITICAL** |
| 2 | **No TLS/SSL**: Let's Encrypt cannot issue certificates (ports blocked, DNS misconfigured). Self-signed certs will cause browser security warnings on every page load | **CRITICAL** |
| 3 | **DNS misconfiguration**: `hexastudio.net` points to `196.219.182.138` (wrong IP). Subdomains (`api`, `cms`, etc.) don't resolve. **The site is unreachable** | **CRITICAL** |
| 4 | **Port 80/443 not forwarded**: NAT not configured. Public IP `156.206.135.186` cannot reach private IP `19.16.1.100` | **CRITICAL** |
| 5 | **No CSP headers configured**: Missing Content-Security-Policy exposes users to XSS attacks | **HIGH** |
| 6 | **Complete testing failure**: Only 4 unit tests for utility functions. **Zero** integration, E2E, or visual regression tests despite AGENTS.md specifying them | **HIGH** |
| 7 | **Branch is `stage`**, not `main`. CI/CD pipelines only deploy `main` and `develop` branches | **HIGH** |

### Secondary Concerns

- 578kB first-load JS exceeds the 200KB performance budget
- Duplicate Traefik configuration files create operational risk
- Traefik dashboard exposed with `insecure: true`
- No ADR documentation in `docs/ADR/`

### Conditions for Re-Evaluation

This release will be reconsidered when:

1. The hardcoded password is removed and replaced with environment variable injection
2. DNS records are updated to point `hexastudio.net`, `api.hexastudio.net`, and `cms.hexastudio.net` to `156.206.135.186`
3. Port 80/443 forwarding is configured from `156.206.135.186` → `19.16.1.100`
4. Let's Encrypt certificates are successfully issued (HTTP or DNS challenge)
5. CSP headers are added to Traefik middleware
6. Minimum test coverage baseline is established (at minimum: API integration tests + 1 E2E flow)
7. Code is merged to `main` branch

---

*"Never approve a release because it 'looks good.' Approve only when every quality gate passes."*
— AGENTS.md, Section 46: Quality Gate Controller
