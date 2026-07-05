# Improvement Roadmap: HEXA Vision

**Last Updated:** 2026-06-30  
**Planning Horizon:** 12 weeks

---

## Priority Legend

| Level | Definition |
|-------|------------|
| **Critical** | Blocks product delivery or production deployment |
| **High** | Required for MVP quality |
| **Medium** | Important for polish and scale |
| **Low** | Nice-to-have; defer if capacity constrained |

---

## Sprint 1 — Architecture Refactor ✅ COMPLETED

**Goal:** Clean architecture foundation without UI/functionality changes.

| ID | Task | Priority | Effort | Status |
|----|------|----------|--------|--------|
| S1-01 | Feature-based folder structure | Critical | 2 days | Done |
| S1-02 | Shared types + utils packages | Critical | 1 day | Done |
| S1-03 | Global error handling (FE + BE) | High | 1 day | Done |
| S1-04 | Fix build blockers (deps, filter import) | Critical | 4 hr | Done |
| S1-05 | Barrel exports + hooks scaffolding | High | 1 day | Done |
| S1-06 | Lazy loading infrastructure | High | 4 hr | Done |
| S1-07 | Monorepo Docker build fix | Critical | 1 day | Done |
| S1-08 | Root tsconfig + backend eslint | Medium | 4 hr | Done |
| S1-09 | Refresh all audit documents | High | 1 day | Done |
| S1-10 | Typecheck + lint + build validation | Critical | 4 hr | Done |

**Sprint 1 Exit Criteria:** All builds pass; folder structure matches `FOLDER_STRUCTURE.md`; no UI regressions.

---

## Sprint 2 — Foundation Services ✅ COMPLETED

**Goal:** Functional auth, CMS schema, security hardening.

| ID | Task | Priority | Effort | Status |
|----|------|----------|--------|--------|
| S2-01 | Strapi Portfolio + Blog content types | Critical | 3 days | Done |
| S2-02 | NestJS BFF project endpoints | Critical | 1 week | Done |
| S2-03 | JWT auth flow (register/login/refresh) | Critical | 1 week | Done |
| S2-04 | SSL/TLS via Traefik ACME | Critical | 1 day | Done |
| S2-05 | MinIO private buckets + presigned URLs | High | 4 hr | Done |
| S2-06 | CI quality gates (lint, typecheck, build) | High | 1 day | Done |
| S2-07 | Sentry frontend configuration | High | 4 hr | Done |
| S2-08 | Skip-to-content + focus styles | High | 4 hr | Done |

---

## Sprint 3 — 3D Core ✅ COMPLETED

**Goal:** First interactive 3D scene.

| ID | Task | Priority | Effort | Status |
|----|------|----------|--------|--------|
| S3-01 | R3F scene shell (lighting, camera, controls) | Critical | 1 week | Done |
| S3-02 | GLB loader with Draco decoder | Critical | 3 days | Done |
| S3-03 | MinIO asset delivery integration | High | 2 days | Done |
| S3-04 | Scene state architecture (Zustand + R3F) | High | 3 days | Done |
| S3-05 | GSAP camera transitions | High | 3 days | Done |
| S3-06 | Error boundary for 3D scene | High | 4 hr | Done |
| S3-07 | `prefers-reduced-motion` integration | High | 4 hr | Done |

---

## Sprint 4 — Content & SEO (Current)

**Goal:** CMS-driven pages with SEO.

| ID | Task | Priority | Effort |
|----|------|----------|--------|
| S4-01 | Portfolio gallery page (ISR) | High | 1 week |
| S4-02 | Project detail page with 3D embed | Critical | 1 week |
| S4-03 | Dynamic `generateMetadata` | High | 2 days |
| S4-04 | robots.txt + sitemap.xml | High | 1 day |
| S4-05 | JSON-LD structured data | Medium | 2 days |
| S4-06 | Lighthouse CI in GitHub Actions | Medium | 1 day |

---

## Sprint 5 — Polish & A11y

**Goal:** Awwwards quality with accessibility.

| ID | Task | Priority | Effort |
|----|------|----------|--------|
| S5-01 | 3D semantic layer for screen readers | High | 1 week |
| S5-02 | Keyboard scene navigation | High | 1 week |
| S5-03 | Interactive hotspots + annotations | High | 1 week |
| S5-04 | KTX2 texture pipeline | Medium | 3 days |
| S5-05 | InstancedMesh for repetitive geometry | Medium | 3 days |
| S5-06 | axe-core accessibility CI | Medium | 4 hr |

---

## Sprint 6 — Enterprise Hardening

**Goal:** Production readiness.

| ID | Task | Priority | Effort |
|----|------|----------|--------|
| S6-01 | Playwright E2E test suite | High | 1 week |
| S6-02 | Unit tests for utils + services | High | 1 week |
| S6-03 | Cloudflare WAF configuration | Medium | 1 day |
| S6-04 | CMS admin IP allowlist | Medium | 4 hr |
| S6-05 | Database backup verification | Medium | 4 hr |
| S6-06 | Performance profiling + budget enforcement | Medium | 3 days |

---

## Phase Summary

| Phase | Sprints | Focus | Priority | Total Effort |
|-------|---------|-------|----------|--------------|
| Phase 1 | 1–2 | Architecture + Foundation | Critical | 3–4 weeks |
| Phase 2 | 3–4 | 3D + Content + SEO | Critical | 4–5 weeks |
| Phase 3 | 5–6 | Polish + Enterprise | High | 4–5 weeks |

---

## Dependency Graph

```
Sprint 1 (Architecture)
    └── Sprint 2 (Auth + CMS + Security)
            └── Sprint 3 (3D Core)
                    ├── Sprint 4 (Content + SEO)
                    └── Sprint 5 (Polish + A11y)
                            └── Sprint 6 (Enterprise)
```

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Stack debate (Vite vs Next.js) | Sprint delay | Document decision; retain Next.js |
| R3F + React 19 compatibility | 3D blocked | Early spike in Sprint 3 |
| Docker build failures | No deploy | Sprint 1 fix |
| Scope creep on Awwwards polish | Timeline slip | Strict Sprint boundaries |
