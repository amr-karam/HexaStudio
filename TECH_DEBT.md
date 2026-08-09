# HEXA STUDIO — TECHNICAL DEBT REGISTER
**Date:** August 9, 2026  
**Status:** Active Tracking  
**Authority Level:** 13 (Production)  

## 1. Overview
This register tracks identified technical debt, refactoring backlog, and optimization items across HEXA STUDIO workspaces.

## 2. Active Technical Debt Items

### TD-001: Mobile Navigation Component Test Failures (RESOLVED)
- **Description:** 2 pre-existing unit test warnings/failures in `Navbar.spec.tsx` related to mobile menu collapse state.
- **Impact:** Low (visual regression only, non-blocking for production gates).
- **Status:** ✅ **RESOLVED (Aug 3, 2026, commit `fb03d6f3`)** — tests now await the lazy-loaded `NavbarMobileMenu`; full frontend suite 207/207 passing. Re-verified Aug 9, 2026.
- **Remediation Plan:** N/A — closed.

### TD-002: Offsite Backup Synchronization (In Progress)
- **Description:** Current backup strategy saves daily PostgreSQL dumps and MinIO assets locally on the production server (`19.16.1.100`) via Docker volumes.
- **Impact:** Medium (relies on same-host offsite volume persistence).
- **Remediation Plan:** Implement S3-compatible remote target replication in upcoming S-022 sprint.

### TD-003: Third-Party Dependencies Override Management (Monitored)
- **Description:** Root `package.json` overrides maintain strict control over transitive dependencies (framer-motion, cookie, uuid, postcss, sharp).
- **Impact:** Low (monitored and stable).
- **Remediation Plan:** Regular dependency audit during monthly maintenance cycles.

### TD-004: Windows `package-lock.json` Platform-Binary Omission (Tracked, Mitigated)
- **Description:** Windows-generated `package-lock.json` omits Linux-native binaries (`@tailwindcss/oxide`, `@unrs/resolver-binding`, `@rolldown/binding`, `lightningcss`, `@napi-rs/lzma`, `rolldown`). CI `npm ci` on Linux silently skipped them, breaking `next build`.
- **Impact:** Low (mitigated Aug 4, 2026 — lockfile regenerated on Linux `node:20.20.2-bookworm-slim`, npm 11.17.0, `--legacy-peer-deps`; committed `afe99e8`).
- **Status:** ✅ **MITIGATED** — tracked under ADR-010 as a recurring maintenance item. Re-verify after any Windows-hosted `npm install` that touches the lockfile.
- **Remediation Plan:** Enforce Linux-based lockfile regeneration in CI pre-check; document in CONTRIBUTING.md.
