# BLOCKING ISSUES — Must Fix Before Production

---

## ✅ RESOLVED

### B1. Hardcoded Database Password
**Status: ✅ RESOLVED** (Commit `1c4dfeb`)
**File:** `apps/cms/config/database.ts:9`
**Fix:** Replaced `"staging_pwd_2026"` with `process.env.DATABASE_PASSWORD`.

---

### B2. DNS Misconfiguration
**Status: ✅ RESOLVED**
**Domain:** hexastudio.net
**Fix:** Nameservers migrated from Hostinger → Cloudflare. All A/CNAME records recreated in Cloudflare zone. `hexastudio.net` resolves through Cloudflare proxy.

---

### B3. Port Forwarding Not Configured
**Status: ✅ BYPASSED** — Cloudflare Tunnel eliminates need for port forwarding.
**Fix:** Cloudflare Tunnel (systemd service) connects `cloudflared` → `http://localhost:80`. No inbound ports needed.

---

### B4. Let's Encrypt TLS Certificate Failure
**Status: ✅ RESOLVED**
**File:** `docker/traefik/traefik.yml:22-29`
**Fix:** DNS-01 challenge via Cloudflare API. All 5 certificates issued (`hexastudio.net`+`www`, `api`, `cms`, `opencode`, `ai`). Valid until Oct 4 2026.

---

### B5. Missing Content-Security-Policy
**Status: ✅ RESOLVED** (Commit `1c4dfeb`)
**File:** `docker/traefik/dynamic.yml:4-12`
**Fix:** CSP header added to `secure-headers` middleware with strict directives.

---

### B7. Branch Not `main`
**Status: ✅ RESOLVED** — Merged `stage` → `main` at `61ee446`.

---

### B10. No sitemap.xml
**Status: ✅ RESOLVED** — `app/sitemap.ts` generates dynamic sitemap for `/`, `/about`, `/services`, `/contact`.

---

### B6. Insufficient Test Coverage
**Status: ⚠ PARTIALLY RESOLVED**
**Improvements:**
- 14 backend tests across 6 spec files (up from 4 in 1 file)
- Playwright E2E scaffold added (`e2e/pages.spec.ts`) — navigation, pages, 404, SEO, a11y
- Playwright E2E integrated into CI pipeline (`.github/workflows/ci.yml`)
**Remaining:** Frontend component tests, visual regression tests

---

### B8. Traefik Dashboard Exposed
**Status: ✅ RESOLVED** (Sprint 6)
**Files:** `docker/traefik/traefik.yml`, `docker/traefik/dynamic.yml`, `docker-compose.prod.yml`
**Fix:** `api.insecure: false` enforced. Public port `:8080` removed from production compose. Dashboard router restricted to `websecure` entrypoint with TLS and `traefik-auth` IP allowlist middleware (private ranges only).

---

### B9. First Load JavaScript Budget Exceeded
**Status: ✅ RESOLVED** (Sprint 6)
**Measured (before):** 578 kB first load JS
**Measured (after):** Home 188 kB, non-home routes 151–170 kB (all ≤ 200 kB budget)
**Fix applied:**
- Removed duplicate static `Scene` import from home page
- Lazy-loaded `ProjectSceneWrapper` / ExperienceCanvas on portfolio detail
- Dynamic `import('gsap')` in HomeHero and TextSplit
- Dynamic `import('@sentry/nextjs')` in performance monitor
- `optimizePackageImports` for three/R3F/GSAP in `next.config.ts`

---

## 🔴 STILL OPEN

*(No P0 blockers remain. See OPEN_TASKS.md for Sprint 6 remaining P1 items.)*
