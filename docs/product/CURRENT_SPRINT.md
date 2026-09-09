# CURRENT SPRINT: S-023 — PRODUCTION HARDENING

**Sprint ID:** S-023 | **Focus:** Performance Optimization, Lighthouse 95+, Production Resilience | **Status:** IN PROGRESS | **Started:** 2026-09-04 | **Target:** 2026-09-30 | **v2.3.0 Target**

---

## 1. SPRINT OBJECTIVE

Harden the production deployment for scale: achieve Lighthouse 95+ desktop across all Core Web Vitals, eliminate the root layout bundle bottleneck (1.5MB shared runtime), implement comprehensive offsite backup strategy, and validate zero-downtime blue/green deployments under load.

---

## 2. DELIVERABLES & VERIFICATION

### P0 — Performance: Lighthouse 95+ & Root Bundle Optimization
- [ ] **Root Layout Code Split** — Defer `WebGLContextProvider`, `CinematicPreloader`, `ScrollProvider` via `dynamic()` with `ssr: false` to remove 1.5MB shared runtime from initial HTML.
- [ ] **Hero LCP Decoupling** — Ensure headline renders statically (not GSAP-hidden) to collapse FCP→LCP delta below 500ms.
- [ ] **Idle-Time Script Injection** — Move all third-party scripts (Sentry Replay, PostHog, GA4) to `onIdle()` scheduler.
- [ ] **Lighthouse CI Gate Enforcement** — Enforce >95 Performance, Accessibility, Best Practices, SEO in GitLab CI on `main` branch.

### P1 — Production Resilience: Offsite Backup & DR
- [ ] **External S3 Target** — Configure `rclone`/`mc mirror` to a second cloud provider (Backblaze B2 / AWS S3 / Wasabi) for offsite DB + MinIO asset mirror.
- [ ] **Backup Verification Alerting** — Loki alerts on `BackupVerificationFailed`, `MinioBackupCycleFailed`, `MinioBackupFatal` already wired (Aug 3 2026); verify alert routing to email/webhook.
- [ ] **Quarterly DR Drill** — Execute full-stack restore to staging environment; document RTO/RPO.

### P2 — CI/CD & Developer Experience
- [ ] **Visual Regression Tests** — Re-enable Playwright visual regression job in GitLab CI (disabled due to flakiness).
- [ ] **Bundle Budget Alerting** — Add Slack/webhook notification when `bundle-analysis` job exceeds 200KB/route budget.
- [ ] **Dependency Audit Automation** — Weekly `npm audit` + Trivy scan with auto-MR for patchable vulnerabilities.

### P3 — Security Hardening (Continued)
- [ ] **Pre-commit Secret Scanner** — Install `gitleaks` or `trufflehog` in Husky pre-commit hook.
- [ ] **GitLab PAT Rotation** — Rotate the remaining `ci-retry-aug14` token (expires Aug 21, 2026) and any remaining scoped tokens.

---

## 3. QUALITY METRICS

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Frontend typecheck | 0 errors | 0 errors | ✅ |
| Frontend lint | 0 errors | 0 errors | ✅ |
| Backend typecheck | 0 errors | 0 errors | ✅ |
| Backend lint | 0 errors | 0 errors | ✅ |
| Mobile tests | 26/26 | 26/26 | ✅ |
| Backend tests | 404/404 | 404/404 | ✅ |
| Frontend tests | 660/660 | 660/660 | ✅ |
| Lighthouse Performance | >95 desktop | 37 (Aug 17 audit) | 🔴 |
| Lighthouse Accessibility | >95 | 95 | ✅ |
| Lighthouse Best Practices | >95 | 100 | ✅ |
| Lighthouse SEO | >95 | 100 | ✅ |
| TBT | <100ms | ~840ms (post-O2) | 🟡 |
| LCP | <1.5s | 2.35s (post-fix) | 🟡 |
| Production runtime vulns | 0 critical, 0 high | 0 critical, 0 high | ✅ |

---

## 4. BLOCKERS & DEFERRED ITEMS

| ID | Item | Reason | Status |
|----|------|--------|--------|
| B1 | Lighthouse 95+ on production | Root bundle 1.5MB + TBT hydration burst | 🔴 Active |
| B2 | Offsite backup target | No external S3 credentials provisioned | 🟡 Blocked |
| B3 | Visual regression flakiness | Playwright snapshots drift on CI runners | ⏳ Deferred |

---

## 5. PREVIOUS SPRINT: S-022 — SEO & CONTENT EXCELLENCE

**Sprint ID:** S-022 | **Focus:** SEO Metadata, JSON-LD, Sitemap, Robots, Blog/Content Quality | **Status:** ✅ COMPLETE | **Completed:** 2026-09-04

- ✅ JSON-LD structured data for all page types (Article, Project, Product, Organization)
- ✅ Dynamic sitemap.xml + robots.txt generation
- ✅ Open Graph / Twitter Card metadata on all routes
- ✅ Content audit: all public pages scored 9.5/10 luxury copy
- ✅ Canonical URLs + hreflang for 8 locales (EN/AR/DE/ES/FR/JA/KO/ZH)
- ✅ Quality gates: all 3 workspaces green (0 errors, 0 warnings)

---

## 6. KEY FILES

| File | Purpose |
|------|---------|
| `apps/frontend/src/app/layout.tsx` | Root layout — target for code-split refactor |
| `apps/frontend/src/lib/idle.ts` | `onIdle()` scheduler for deferred scripts |
| `scripts/check-bundle-budgets.mjs` | Enforces 200KB/route budget in CI |
| `docker/backup/minio-backup.sh` | MinIO asset mirror (needs offsite target) |
| `docker/loki/rules/fake/loki-alerts.yml` | Backup verification alert rules |
| `.gitlab-ci.yml` | Pipeline with Lighthouse + bundle-analysis jobs |