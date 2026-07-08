# Technical Debt Report: HEXA Vision

**Last Updated:** 2026-06-30  
**Debt Register Version:** 2.0 (post-audit refresh)

---

## 1. Critical Debt (Blockers)

| ID | Item | Impact | Effort | Status |
|----|------|--------|--------|--------|
| TD-001 | **3D scene not implemented** | No product value | High (2–3 weeks) | Open |
| TD-002 | **Authentication not implemented** | Blocks protected features | Medium (1 week) | Open |
| TD-003 | **CMS schema incomplete** | No real content | Low (3 days) | Open |
| TD-004 | **Backend domain logic absent** | No API functionality | Medium (1–2 weeks) | Open |
| TD-005 | **Docker monorepo build broken** | CI/production builds fail on `@hexastudio/*` | Low (1 day) | In Progress |
| TD-006 | **Missing frontend deps** (`clsx`, `tailwind-merge`) | Build/lint failure | Trivial (1 hr) | In Progress |

---

## 2. High Priority Debt

| ID | Item | Impact | Effort | Status |
|----|------|--------|--------|--------|
| TD-007 | **GlobalExceptionFilter compile error** | Backend build fails | Trivial | In Progress |
| TD-008 | **HomeHero broken health link** | Misleading UX | Trivial | In Progress |
| TD-009 | **Button.asChild hack** | Invalid React pattern | Low (2 hr) | In Progress |
| TD-010 | **Zero test coverage** | No regression safety | High (ongoing) | Open |
| TD-011 | **No CI quality gates** | Broken code can reach main | Medium (1 day) | Open |
| TD-012 | **Sentry not configured** | No error visibility | Low (4 hr) | Open |
| TD-013 | **MinIO public bucket policy** | Asset exposure risk | Low (4 hr) | Open |

---

## 3. Medium Priority Debt

| ID | Item | Impact | Effort | Status |
|----|------|--------|--------|--------|
| TD-014 | **Shared types unused in frontend** | Runtime type drift | Low (1 day) | In Progress |
| TD-015 | **Empty feature modules** (`auth`, `scene`) | Incomplete architecture | Low (Sprint 1) | In Progress |
| TD-016 | **No root tsconfig** | Inconsistent tooling | Low (2 hr) | In Progress |
| TD-017 | **Backend eslint missing** | Lint script fails | Trivial | In Progress |
| TD-018 | **Asset optimization pipeline** | Large 3D payloads | Medium (1 week) | Open |
| TD-019 | **BFF pattern not implemented** | Frontend may call CMS directly | Medium (1 week) | Open |
| TD-020 | **Stack documentation mismatch** | Vite+RR in brief vs Next.js in code | Low (doc only) | Open |

---

## 4. Low Priority Debt

| ID | Item | Impact | Effort | Status |
|----|------|--------|--------|--------|
| TD-021 | **UI components built but unused** | Dead code | Low | Open |
| TD-022 | **Framer Motion in docs but not installed** | Doc drift | Trivial | Open |
| TD-023 | **Local non-Docker dev setup** | Slower onboarding | Low (1 day) | Open |
| TD-024 | **packages/* lack tsconfig** | Weaker type checking | Low (2 hr) | Open |
| TD-025 | **Node engine mismatch** (v24 local vs CMS <=22) | Dev warnings | Low | Open |

---

## 5. Resolved Debt (Sprint 1)

| ID | Item | Resolved |
|----|------|----------|
| TD-R01 | Flat frontend structure | Feature-based folders added |
| TD-R02 | No shared types package | `@hexastudio/types` created |
| TD-R03 | No global error handling | `GlobalErrorBoundary` + `GlobalExceptionFilter` |
| TD-R04 | No shared utils | `@hexastudio/utils` created |

---

## 6. Debt Summary

| Severity | Open | In Progress | Resolved |
|----------|------|-------------|----------|
| Critical | 4 | 2 | 0 |
| High | 5 | 3 | 0 |
| Medium | 5 | 3 | 0 |
| Low | 5 | 0 | 4 |

**Total estimated remediation:** ~8–12 weeks for full debt clearance at current scope.

---

## 7. Debt Prevention Rules

1. No merge without passing typecheck, lint, and build
2. Shared types required before new API endpoints
3. Feature work must live under `src/features/<domain>/`
4. New dependencies require `DEPENDENCY_REPORT.md` update
5. 3D assets must pass Draco/KTX2 pipeline before MinIO upload
