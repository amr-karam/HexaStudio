# SOP-TO-01: New Feature Implementation

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** Chief Architect / Lead Engineer  

---

## Goal

To ensure every new feature is implemented with a consistent process that prioritizes quality, performance, and documentation, reducing technical debt and preventing regressions.

## Prerequisites

- Feature approved in `02-ROADMAP\BACKLOG.md`.
- Acceptance criteria clearly defined in the Feature Story.
- Technical design reviewed by the Chief Architect.

## Step-by-Step Process

### 1. Technical Planning
- **Types First:** Define the necessary data structures in `packages/types/`.
- **API Design:** Draft the API endpoint (if needed) in `08-API\endpoints.md`.
- **UI Mockup:** Review Figma designs and identify reusable components from the Design System.

### 2. Implementation
- **Branching:** Create a feature branch `feature/kebab-case-name` from `develop`.
- **Core Logic:** Implement the backend service and frontend logic.
- **Styling:** Apply TailwindCSS utilities following `06-STANDARDS\design-system-standards.md`.
- **3D Work:** If 3D, follow `06-STANDARDS\3d-modeling-standards.md`.

### 3. Verification
- **Unit Tests:** Write tests for all new business logic.
- **Integration:** Verify end-to-end flow (Frontend → BFF → Backend → DB/CMS/Odoo).
- **Performance:** Run Lighthouse and verify 3D FPS.
- **Accessibility:** Verify keyboard navigation and screen reader support.

### 4. Review & Merge
- **Self-Review:** Run `npm run lint` and `npm run typecheck`.
- **PR:** Open Pull Request with screenshots and test evidence.
- **Approval:** Obtain at least one approval from a lead.
- **Merge:** Squash merge into `develop`.

## Verification

- [ ] All acceptance criteria met.
- [ ] Unit and E2E tests pass.
- [ ] No new console errors.
- [ ] Performance budget maintained.
- [ ] Documentation updated.

## Exception Handling

| Issue | Action |
|-------|---------|
| Design change during dev | Update Figma and notify Product Owner |
| Unexpected performance drop | Optimize implementation or request ADR for change |
| Dependency conflict | Resolve via `npm audit` or consult Chief Architect |

## Related Docs

- `DEVELOPMENT_WORKFLOW.md`
- `06-STANDARDS\CODING_STANDARDS.md`
- `15-QUALITY\QUALITY_GATES.md`
