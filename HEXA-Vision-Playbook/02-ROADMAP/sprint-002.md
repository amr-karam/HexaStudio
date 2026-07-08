# Sprint 002: Website Excellence (Foundation)

**Dates:** 2026-07-22 to 2026-08-05  
**Theme:** *"First impressions that convert."*  
**Goal:** Implement the core landing page and the 3D project viewer base.

---

## Backlog

| Priority | Item | Owner | Points | Status |
|----------|------|-------|--------|--------|
| P0 | Implement Design System Primitives (Button, Input, Card) | Frontend Lead | M | ⬜ To Do |
| P0 | Landing Page Hero Section (HTML/CSS) | Frontend Lead | L | ⬜ To Do |
| P0 | Basic R3F Scene Setup (Canvas, Lights, Camera) | Frontend Lead | L | ⬜ To Do |
| P1 | Strapi Content Types for Projects & Blog | Backend Lead | M | ⬜ To Do |
| P1 | NestJS BFF Endpoints for Projects & Blog | Backend Lead | L | ⬜ To Do |
| P1 | Project Gallery Page (Next.js ISR) | Frontend Lead | L | ⬜ To Do |
| P2 | 3D Model Loader with Draco Support | Frontend Lead | M | ⬜ To Do |
| P2 | Basic OrbitControls Implementation | Frontend Lead | S | ⬜ To Do |
| P2 | Global Layout (Header, Footer) | Frontend Lead | S | ⬜ To, Do |

## Acceptance Criteria (Core)

### Landing Page Hero
- [ ] LCP < 1.2s
- [ ] Responsive on 320px to 1440px
- [ ] Accessibility (WCAG AA)
- [ ] GSAP entrance animations smooth (60 FPS)

### 3D Viewer Base
- [ ] GLB models load without errors
- [ ] OrbitControls allow navigation
- [ ] Loading state (Suspense) is visible
- [ ] Frame rate stable at 60 FPS

## Risks

| Risk | Mitigation |
|------|------------|
| R3F performance on mobile | Implement dpr scaling and lod |
| Strapi 5 breaking changes | Closely follow la-logs and official docs |
| Asset size (3D models) | Enforce Draco compression and poly limits |

## Definition of Done

- [ ] All items in "P0" completed
- [ ] Code reviewed and merged to `develop`
- [ ] Lighthouse scores ≥ 95 for the landing page
- [ ] No console errors
- [ ] Documentation updated in `07-DESIGN`
