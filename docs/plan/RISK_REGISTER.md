# HEXA STUDIO — RISK REGISTER

**Version:** 2.1.5  
**Date:** 2026-08-09  
**Status:** Active  
**Authority Level:** 2 (Planning — subordinate to EXECUTION_PLAN.md)

---

## 1. PURPOSE

This document catalogs technical and operational risks associated with the HEXA STUDIO platform, evaluating impact and probability while outlining mandatory mitigation strategies.

---

## 2. RISK ASSESSMENT MATRIX

| ID | Risk Description | Category | Impact (1-5) | Probability (1-5) | Score | Mitigation Strategy | Status |
|----|------------------|----------|--------------|-------------------|-------|---------------------|--------|
| R1 | Odoo ERP sync latency or authentication drop | Technical | 4 | 2 | 8 | Implement retry logic, fallback caching in Redis, and structured audit logs. | Mitigated |
| R2 | Three.js WebGL performance drop on low-tier mobile/desktop devices | Technical | 3 | 3 | 9 | Enforce `useMotionPolicy`, dynamic LOD reduction, and static CSS fallback cards. | Mitigated |
| R3 | Windows vs. Linux lockfile binary divergence (`npm ci` failure) | Operational | 4 | 3 | 12 | Standardize Linux-native lockfile regeneration (ADR-010) and enforce CI checks. | Mitigated |
| R4 | GitLab runner OOM termination during Next.js build | Infrastructure | 5 | 2 | 10 | Increase Docker runner memory limit to 8G/4 CPUs in `docker-compose.gitlab-runner.yml`. | Mitigated |
| R5 | Unauthenticated access to private S3 deliverables | Security | 5 | 1 | 5 | Enforce presigned MinIO URLs with strict 15-minute expiration and server-side JWT auth. | Mitigated |

---

## 3. FINAL READINESS VERDICT

**Verdict:** PASS  
All identified high-severity risks have been actively mitigated and verified in production operations.

---

## 4. REFERENCES

- [EXECUTION_PLAN.md](EXECUTION_PLAN.md))
- [MILESTONES.md](MILESTONES.md))
- [../../SECURITY.md](../../SECURITY.md)
- [../../PERFORMANCE.md](../../PERFORMANCE.md)
