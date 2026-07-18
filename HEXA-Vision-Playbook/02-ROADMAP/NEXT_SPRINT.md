# Next Sprint: Platform Stability & Mobile

**Sprint ID:** S-013 | **Focus:** Platform Stability, Mobile API Hardening, GeoIP & Localization | **Status:** PLANNING | **Start:** 2026-07-18 | **Target:** 2026-09-15 | **v1.6.0 Target**

## 1. SPRINT OBJECTIVE

Harden the platform for production scale: complete API hardening (refresh token rotation, versioning audit, pagination audit, JWT coverage), ship GeoIP-driven regional pricing and currency selection, deliver Client Portal v3 with notification preferences and document upload, and resolve remaining technical debt blocking full CI green.

---

## 2. HIGH-PRIORITY DELIVERABLES

### Mobile & API Hardening (P0)

- [ ] **Refresh Token Rotation** — Code written, needs verification end-to-end
- [ ] **API Versioning Audit** — Verify all controllers use `@Version('1')` consistently
- [ ] **Pagination Audit** — Verify `?page=&limit=` works on all list endpoints
- [ ] **JWT Auth Coverage** — Audit that ALL `/api/*` endpoints are behind auth guard except explicitly public ones

### GeoIP & Localization (P1)

- [ ] **GeoIP Region Detection** — MaxMind or IP2Location integration for auto-detecting user's region for pricing
- [ ] **Currency Selection UI** — Frontend manual override of detected currency
- [ ] **Exchange Rate Auto-Sync** — Periodic fetch from ECB API or OpenExchangeRates

### Client Portal v3 (P1)

- [ ] **Portal Notification Preferences** — Allow clients to opt in/out of notification types
- [ ] **Portal Document Upload** — Allow clients to upload files to their project
- [ ] **Portal Project Timeline Visualization** — Gantt-like view of milestones

### Technical Debt (P2)

- [ ] **Resolve `_corrupted_node_modules_stubs/` NTFS Issue** — Fix blocking backend vitest (chkdsk /f or re-clone)
- [ ] **Fix 7 Pre-Existing Backend Test Failures** — Redis/auth related
- [ ] **Dist Nesting Refactor** — Flatten `dist/apps/backend/src/main.js` to `dist/main.js`
- [ ] **Hostinger API Key Rotation** — Rotate stale credentials
- [ ] **Dependabot Remediation** — 24 moderate vulns (postcss XSS), deferred to Next.js 16.3+

### Research (P3)

- [ ] **Expo/React Native Mobile App Scaffold** — Planning for Sprint 14
- [ ] **Next.js 16 Upgrade Watch** — Reassess when 16.3 ships
- [ ] **WebGPU Rendering Research** — Evaluate for 3D scenes performance improvement

---

## 3. SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| Backend tests passing | 90+ (recover 7 failing, no regressions) |
| Typecheck | 0 errors |
| Lint | 0 errors |
| npm vulns | <10 or documented exceptions |
| GeoIP accuracy | >98% region detection |
| Portal notification opt-out | Functional |

---

## 4. DEPENDENCIES

- MaxMind GeoIP2 or IP2Location database subscription
- ECB API or OpenExchangeRates API key for exchange rate auto-sync
- Client Portal WebSocket infrastructure (already in place, extend for notifications)
- MinIO signed URL mechanism (already in place, extend for client uploads)

---

## 5. RELEASE READINESS

**v1.6.0 Target:** 2026-09-15

---

*"Stability before scale. Hardening before growth."*
