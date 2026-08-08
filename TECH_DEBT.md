# HEXA STUDIO — TECHNICAL DEBT REGISTER
**Date:** August 8, 2026  
**Status:** Active Tracking  
**Authority Level:** 13 (Production)  

## 1. Overview
This register tracks identified technical debt, refactoring backlog, and optimization items across HEXA STUDIO workspaces.

## 2. Active Technical Debt Items

### TD-001: Mobile Navigation Component Test Failures (Resolved / Minor)
- **Description:** 2 pre-existing unit test warnings/failures in `Navbar.spec.tsx` related to mobile menu collapse state.
- **Impact:** Low (visual regression only, non-blocking for production gates).
- **Remediation Plan:** Scheduled for post-release UX polish sprint.

### TD-002: Offsite Backup Synchronization (In Progress)
- **Description:** Current backup strategy saves daily PostgreSQL dumps and MinIO assets locally on the production server (`19.16.1.100`) via Docker volumes.
- **Impact:** Medium (relies on same-host offsite volume persistence).
- **Remediation Plan:** Implement S3-compatible remote target replication in upcoming S-022 sprint.

### TD-003: Third-Party Dependencies Override Management
- **Description:** Root `package.json` overrides maintain strict control over transitive dependencies (framer-motion, cookie, uuid, postcss, sharp).
- **Impact:** Low (monitored and stable).
- **Remediation Plan:** Regular dependency audit during monthly maintenance cycles.
