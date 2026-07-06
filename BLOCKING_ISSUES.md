# BLOCKING ISSUES — Must Fix Before Production

---

## 🚨 CRITICAL

### B1. Hardcoded Database Password
**File:** `apps/cms/config/database.ts:9`
**Severity:** CRITICAL — Security Vulnerability
**Description:** A plaintext password `"staging_pwd_2026"` is hardcoded in the CMS database configuration file. This password is committed to the repository and visible to anyone with repository access.
**Fix:** Replace with environment variable (`process.env.DATABASE_PASSWORD`) and ensure `.env` is properly configured on production.

---

### B2. DNS Misconfiguration
**Domain:** hexastudio.net
**Severity:** CRITICAL — Site Unreachable
**Description:** The domain `hexastudio.net` currently resolves to `196.219.182.138` (wrong server). The production server IP is `156.206.135.186`. Additionally, subdomain records for `api.hexastudio.net`, `cms.hexastudio.net`, `traefik.hexastudio.net`, etc. do not exist.
**Fix:** Update DNS A records at the domain registrar:
- `hexastudio.net` → `156.206.135.186`
- `www.hexastudio.net` → `156.206.135.186`
- `api.hexastudio.net` → `156.206.135.186`
- `cms.hexastudio.net` → `156.206.135.186`
- `traefik.hexastudio.net` → `156.206.135.186`

---

### B3. Port Forwarding Not Configured
**Public IP:** `156.206.135.186` → **Private IP:** `19.16.1.100`
**Severity:** CRITICAL — Service Unreachable
**Description:** Ports 80 (HTTP) and 443 (HTTPS) are not forwarded from the public IP to the private IP of the Docker host. All web traffic is blocked at the network level.
**Fix:** Configure NAT/port forwarding on the router/gateway:
- Public `156.206.135.186:80` → Private `19.16.1.100:80`
- Public `156.206.135.186:443` → Private `19.16.1.100:443`

---

### B4. Let's Encrypt TLS Certificate Failure
**File:** `docker/traefik/traefik.yml:26-40`
**Severity:** CRITICAL — No HTTPS
**Description:** Let's Encrypt certificate issuance is failing because:
- DNS challenge requires Cloudflare credentials (not confirmed configured)
- HTTP challenge cannot reach the server (port 80 not forwarded)
- TLS challenge cannot verify domain
- Self-signed fallback certificate will trigger browser security warnings
**Fix:** After resolving B2 and B3, verify Let's Encrypt can issue certificates. Consider using Cloudflare DNS challenge as a more reliable alternative (already partially configured in `docker/traefik/traefik.yml`).

---

### B5. Missing Content-Security-Policy
**File:** `docker/traefik/dynamic.yml:4-12`
**Severity:** HIGH — Security
**Description:** The `secure-headers` middleware configures `frameDeny`, `contentTypeNosniff`, `browserXssFilter`, `referrerPolicy`, and HSTS — but **no Content-Security-Policy** header is set. This exposes the application to XSS and data injection attacks.
**Fix:** Add a `contentSecurityPolicy` configuration to the Traefik `secure-headers` middleware with appropriate directives.

---

## 🔴 HIGH

### B6. Insufficient Test Coverage
**Current:** 4 unit tests in 1 file (`apps/backend/test/utils.spec.ts`)
**Severity:** HIGH — Quality Risk
**Description:** AGENTS.md specifies Unit Tests, Integration Tests, E2E Tests (Playwright), and Visual Regression tests. Only 4 utility function tests exist. No API endpoint tests, no frontend component tests, no E2E flows.
**Fix:**
- Add API integration tests for all backend modules (health, auth, projects, articles, services, contact)
- Add at minimum 1 E2E test with Playwright covering the user → project → 3D view flow
- Add component tests for critical UI components (Button, Card, Navbar, Footer)

---

### B7. Branch Not `main`
**Current branch:** `stage`
**Severity:** HIGH — Process
**Description:** According to AGENTS.md Section 9, only `main` (production-ready) and `develop` (integration) branches are valid for deployment. CI/CD pipelines in `.github/workflows/` only trigger on `main` and `develop` branches.
**Fix:** Merge `stage` → `main` after all critical issues are resolved.

---

### B8. Traefik Dashboard Exposed
**File:** `docker/traefik/traefik.yml:2-3`
**Severity:** HIGH — Security
**Description:** `api.dashboard: true` and `api.insecure: true` exposes the Traefik dashboard on port 8080 without authentication. This provides full visibility into routing, services, and configuration.
**Fix:** Disable `insecure` mode and add authentication middleware to the dashboard router, or restrict to internal network only.

---

### B9. First Load JavaScript Budget Exceeded
**Measured:** 578kB first load JS
**Budget:** 200kB (per AGENTS.md Section 17)
**Severity:** HIGH — Performance
**Description:** The frontend JS bundle is 2.89x the performance budget. This will impact LCP and Time to Interactive.
**Fix:** Audit bundle composition, implement dynamic imports for heavy components (especially Three.js/GSAP), and consider lazy-loading below-the-fold sections.

---

### B10. No sitemap.xml
**Severity:** HIGH — SEO
**Description:** No `sitemap.xml` is generated. Search engines cannot efficiently discover all pages, especially dynamic portfolio/blog entries.
**Fix:** Implement `app/sitemap.ts` using Next.js `generateSitemaps` or integrate with Strapi webhooks for ISR-based sitemap generation.
