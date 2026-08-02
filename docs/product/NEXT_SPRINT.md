# Next Sprint: Mobile & Web Performance

**Sprint ID:** S-019 | **Focus:** Mobile App v1.0, Web Performance Tuning, Production Polish | **Status:** PLANNING | **Target:** 2026-08-15 | **v1.8.0 Target**

## 1. SPRINT OBJECTIVE

Ship the first version of the HEXA mobile app (Expo/React Native) with auth, project dashboard, and push notifications. Continue performance optimization (TBT reduction, bundle budgets, Lighthouse 95+). Polish production experience with E2E smoke tests and documentation sync.

---

## 2. HIGH-PRIORITY DELIVERABLES

### Mobile App v1.0 (P0)

- [ ] **Complete mobile navigation** — Tab-based (Dashboard / Projects / Notifications / Profile)
- [ ] **Offline support** — Local caching of project data with offline-first strategy
- [ ] **Push notifications** — Expo push for approvals, project updates, document uploads
- [ ] **App store assets** — Icons, splash screen, app store screenshots
- [ ] **OTA updates** — Expo Updates / EAS for over-the-air JS bundle updates

### Web Performance (P1)

- [ ] **TBT < 100ms** — Code-split Three.js/R3F from main bundle; dynamic import on route entry
- [ ] **LCP < 1.5s** — Optimize hero image loading with priority hints
- [ ] **Bundle budgets** — Enforce 200KB JS per-route budget in CI
- [ ] **Lighthouse 95+** — Desktop and mobile audits

### Production Polish (P2)

- [ ] **E2E smoke tests** — Playwright for portal login, project view, approval flow
- [ ] **Error tracking review** — Verify Sentry captures all critical error boundaries
- [ ] **Documentation sync** — Update all playbook docs to v1.8.0
- [ ] **Performance budget CI gate** — Fail CI on bundle size regressions

---

## 3. SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| Mobile app | v1.0 on TestFlight/Expo Go |
| Lighthouse performance | >95 desktop, >85 mobile |
| TBT | <100ms |
| LCP | <1.5s |
| Bundle size | <200KB per route JS |
| E2E tests | 5+ critical paths passing |
| Backend tests | 285/285 |
| Production vulns | 0 critical, 0 high |

---

## 4. DEPENDENCIES

- Expo EAS Build account for iOS/Android builds
- Apple Developer Program account (for TestFlight)
- Google Play Console account
- Push notification infrastructure (Expo Push API)

---

## 5. RELEASE READINESS

**v1.8.0 Target:** 2026-09-01

---

*"Mobile first, performance always."*
