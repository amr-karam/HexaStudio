# Next Sprint: Content Pipeline & Advanced Immersive

**Sprint ID:** S-013 | **Focus:** Strapi Localization, AR Placement, VR Collaboration, Integration Hub | **Status:** PLANNING

## 1. SPRINT OBJECTIVE

Complete Sprint 12 carry-overs: Strapi content localization pipeline, real-space AR model placement, multi-user VR collaboration, and the centralized webhook management dashboard.

## 2. HIGH-PRIORITY DELIVERABLES

### 🌐 Content Pipeline (Strapi)
- [ ] **Strapi i18n Plugin** — Enable and configure content localization
- [ ] **Translation Workflow** — Export/import translation files, reviewer flow
- [ ] **Currency/Localization** — Dynamic pricing per region, tax compliance
- [ ] **RTL Content Audit** — Verify all CMS content renders correctly in RTL

### 🥽 Immersive Experiences (Advanced)
- [ ] **AR Model Placement** — Place architectural models in real space via phone camera (hit-test API)
- [ ] **VR Collaboration** — Multi-user design reviews in VR (basic sync)
- [ ] **Mobile AR SDK** — Expo AR module for native AR placement

### 🔗 Integration Hub
- [ ] **Webhook CRUD API** — Centralized webhook URL management dashboard
- [ ] **Notion Integration** — Sync project milestones, task status
- [ ] **Jira/Linear Integration** — Bidirectional issue sync
- [ ] **Figma Webhook** — Design file change notifications

### 📊 Analytics Advanced
- [ ] **Advanced Analytics** — Custom dashboard builder, CSV export, scheduled reports
- [ ] **Sentry Release Health** — Release tracking, error rate alerts, session replay

### 🧹 Technical Debt
- [ ] **Next.js 16 Upgrade Assessment** — Required for postcss vuln fix (24 remaining vulns)
- [ ] **Backend Lint** — Fix remaining 21 `no-explicit-any` in gemini.service.ts and assistants.controller.ts
- [ ] **Backend Test Recovery** — Resolve `_corrupted_node_modules_stubs/` NTFS issue blocking vitest

## 3. SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| i18n Coverage | 8 languages, 100% UI + CMS strings |
| AR Placement Accuracy | <5cm error in good lighting |
| Backend Lint | 0 errors |
| npm Audit Vulns | 0 (or documented exceptions) |

## 4. DEPENDENCIES

- Strapi i18n plugin + translation workflow configuration
- WebXR browser support (Chrome/Android, Safari/iOS 17+)
- React Native / Expo SDK 51+ for mobile AR
- PostHog or GA4 project credentials

## 5. RELEASE READINESS

**v1.6.0 Target:** 2026-09-15

---

*"From ecosystem to infrastructure."*
