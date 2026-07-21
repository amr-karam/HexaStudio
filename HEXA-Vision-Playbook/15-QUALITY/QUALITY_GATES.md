# Quality Gates

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Quality Philosophy

Quality is not a phase. Quality is built into every step of development. Gates are not bottlenecks — they are safeguards that ensure production-ready code every time.

---

## Gate Overview

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Gate 1  │   │ Gate 2  │   │ Gate 3  │   │ Gate 4  │   │ Gate 5  │
│  Dev    │──►│ CI/PR   │──►│  Review │──►│  QA     │──►│ Release │
│         │   │         │   │         │   │         │   │         │
│ Local   │   │ Auto    │   │ Peer    │   │ Manual  │   │ Sign-   │
│ checks  │   │ checks  │   │ review  │   │ testing │   │ off     │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

---

## Gate 1: Development Gate

**Owner:** Developer  
**When:** Before every commit and push

### Checklist

- [ ] `npm run lint` — 0 errors, 0 warnings
- [ ] `npm run typecheck` — 0 errors (strict mode)
- [ ] `npm run test` — All tests green
- [ ] `npm run build` — Build succeeds
- [ ] No `console.log` in code
- [ ] No `any` types
- [ ] No TODO without ticket reference
- [ ] No commented-out code
- [ ] No secrets committed
- [ ] Commit message follows Conventional Commits

### Frontend-Specific Checks (apps/frontend)

When modifying frontend code, these additional checks are mandatory:

**Motion Policy Compliance**
- [ ] All animations use `useMotionPolicy` or `useHEXAMotion`
- [ ] No inline easing/duration values (sourced from `src/lib/motion.ts`)
- [ ] No `transition-all` in CSS

**RAF/GSAP Cleanup**
- [ ] All RAF loops cancellable (ID stored, cancelled on cleanup)
- [ ] All GSAP tweens inside `gsap.context()` with revert on unmount
- [ ] No orphaned tweens or timeline references

**Reduced Motion**
- [ ] Verified via Playwright `reduced-motion` project (browser emulation)
- [ ] No continuous motion under reduced motion
- [ ] Loaders are static under reduced motion

**Coarse Pointer**
- [ ] Verified via Playwright `mobile` project
- [ ] No mouse-follow, parallax, or cursor effects on touch
- [ ] All touch targets >= 44x44px

**Focus Management**
- [ ] Modal/menu traps focus (Tab cycles within)
- [ ] Escape closes modal/menu and restores focus to trigger
- [ ] Route changes move focus to main content or heading

**WebGL Fallback**
- [ ] WebGL unavailable: cover image + project metadata + navigation shown
- [ ] Context loss: fallback displayed, recovery attempted
- [ ] Model load failure: fallback with project info shown

**No-JS Content**
- [ ] Server-rendered content visible and usable without JavaScript

**Mobile**
- [ ] Real-device test performed (not just viewport emulation)

**Performance**
- [ ] Frame-time budget met (p95 < 16.7ms on supported hardware)
- [ ] No always-on WebGL on non-3D routes
- [ ] Offscreen scenes pause
- [ ] Tab-hidden scenes pause

### Failure Action

- Do not commit/push until resolved
- Use `git stash` for non-blocking issues

---

## Gate 2: CI Gate

**Owner:** CI Pipeline (GitHub Actions)  
**When:** On every push / PR

### Automated Checks

| Check | Tool | Required |
|-------|------|----------|
| Lint | ESLint | Pass |
| TypeScript | tsc (strict) | Pass |
| Unit Tests | Vitest | 100% pass |
| Build | npm run build | Pass |
| Bundle Size | size-limit | Under budget |
| Lighthouse | Lighthouse CI | Score ≥ 95 |
| Dependency Audit | npm audit | 0 critical |
| Test Coverage | c8 | ≥ 80% |

### Failure Action

- PR cannot be merged
- Status check shows ❌ in GitHub
- Notification sent to developer

---

## Gate 3: Code Review Gate

**Owner:** Reviewer (minimum 1)  
**When:** Before merge

### Review Checklist

**Architecture**
- [ ] Follows existing patterns and conventions
- [ ] Proper separation of concerns
- [ ] No unnecessary abstractions
- [ ] No circular dependencies

**Correctness**
- [ ] Logic is correct (test coverage proves it)
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states present (if async)

**Performance**
- [ ] No unnecessary re-renders
- [ ] No memory leaks (event listeners, subscriptions)
- [ ] 3D geometries/materials disposed properly
- [ ] Lazy loading where appropriate

**Security**
- [ ] Input validation present
- [ ] No hardcoded secrets
- [ ] Proper authorization checks
- [ ] XSS prevention (no dangerouslySetInnerHTML)

**Accessibility**
- [ ] Keyboard navigation works
- [ ] ARIA attributes correct
- [ ] Color contrast sufficient
- [ ] Screen reader friendly

**Types**
- [ ] No `any` types
- [ ] Proper generics where needed
- [ ] Exported types in packages/types

### Failure Action

- Request changes
- Mark conversation as unresolved
- Re-review after changes

---

## Gate 4: QA Gate

**Owner:** QA Lead  
**When:** Before staging deploy

### Manual Testing Checklist

**Functional**
- [ ] All acceptance criteria met
- [ ] Happy path works
- [ ] Error path works
- [ ] Edge cases tested

**Cross-browser** (Test on latest versions)
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Responsive**
- [ ] 320px (mobile)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1440px (wide)

**3D Testing**
- [ ] Scene loads correctly
- [ ] Controls work (orbit, zoom, pan)
- [ ] Mobile touch controls work
- [ ] No visual artifacts
- [ ] FPS meets target (60)

**Integration**
- [ ] API calls succeed
- [ ] Data displays correctly
- [ ] Form submissions work end-to-end
- [ ] File upload/download works

### Failure Action

- Block release
- Create bug ticket with reproduction steps
- Assign to developer for fix

---

## Gate 5: Release Gate

**Owner:** Chief Architect / Quality Gate Controller  
**When:** Before production release

### Release Sign-off

| Category | Minimum Score | Actual Score |
|----------|---------------|--------------|
| Architecture | 9/10 | |
| Code Quality | 9/10 | |
| Visual Design | 9/10 | |
| Brand Identity | 9/10 | |
| UX | 9/10 | |
| Animation | 9/10 | |
| Performance | 9/10 | |
| Accessibility | 9/10 | |
| SEO | 9/10 | |
| Security | 9/10 | |
| Documentation | 9/10 | |

### Overall Score Requirement: **9.5/10 or higher**

### Decision

| Outcome | Criteria |
|---------|----------|
| ✅ **Approved for Production** | All gates pass. Score ≥ 9.5. No blocking issues. |
| ⚠ **Approved with Warnings** | All gates pass. Score ≥ 9.0. Minor non-blocking issues. |
| ❌ **Rejected** | Any gate fails. Score < 9.0. Blocking issues exist. |

### Required Artifacts

- [ ] `QUALITY_GATE_REPORT.md` — Full gate report
- [ ] `QUALITY_SCORECARD.md` — Category scores
- [ ] `RELEASE_DECISION.md` — Final decision
- [ ] `BLOCKING_ISSUES.md` — Issues preventing release (if rejected)
- [ ] `OPTIONAL_IMPROVEMENTS.md` — Non-blocking suggestions

---

## Definition of Done

Every feature, bugfix, or task must satisfy ALL of the following:

### Code

- [ ] Code follows `CODING_STANDARDS.md`
- [ ] TypeScript strict mode — no `any` types
- [ ] Unit tests written and passing
- [ ] Lint and format checks pass
- [ ] No dead code (unused imports, variables, functions)
- [ ] No debug artifacts (console.log, commented code)

### Frontend-Specific (apps/frontend)

- [ ] Animation values from `src/lib/motion.ts` (no inline easing/duration)
- [ ] All RAF loops cancellable, all GSAP tweens cleaned up
- [ ] Reduced motion verified (Playwright reduced-motion project)
- [ ] Coarse pointer verified (Playwright mobile project)
- [ ] Focus management verified (modal trap, route focus, escape restore)
- [ ] WebGL fallback verified (cover image + metadata + navigation)
- [ ] No-JS content availability verified
- [ ] Real-device mobile test performed
- [ ] Frame-time budget met (p95 < 16.7ms)
- [ ] No `transition-all` in CSS
- [ ] All interactive elements >= 44x44px

### Functionality

- [ ] Acceptance criteria met
- [ ] All states handled (loading, empty, error, success)
- [ ] Edge cases covered
- [ ] Responsive on all breakpoints

### Quality

- [ ] Performance budget maintained (LCP < 1.2s, initial JS < 200KB gzip)
- [ ] Accessibility verified (WCAG 2.2 AA)
- [ ] No console errors
- [ ] Cross-browser tested

### Documentation

- [ ] Types updated in `packages/types/`
- [ ] API docs updated (Swagger)
- [ ] CHANGELOG.md updated
- [ ] ADR documented (if architectural change)
- [ ] `FRONTEND_EXCELLENCE.md` referenced for any frontend changes

### Process

- [ ] PR reviewed and approved
- [ ] CI pipeline passed
- [ ] Branch deleted after merge

---

## Quality Gate Controller Role

### Authority

The Quality Gate Controller is the **final authority** on whether code is production-ready. This role is independent of development pressure.

### Responsibilities

1. Enforce all quality gates
2. Inspect every area: architecture, code, UI, UX, performance, security
3. Score every category from 1-10
4. Make the final release decision
5. Generate quality reports:
   - `QUALITY_GATE_REPORT.md`
   - `QUALITY_SCORECARD.md`
   - `RELEASE_DECISION.md`
   - `BLOCKING_ISSUES.md`
   - `OPTIONAL_IMPROVEMENTS.md`

### Rejection Policy

Reject immediately if:

- Any critical bug exists
- Any page is broken
- Any console error exists
- Build fails
- TypeScript fails
- ESLint has errors
- Performance regresses
- Accessibility has critical issues
- Visual consistency is poor
- Brand quality is inconsistent

### Approval Policy

Approve ONLY if:

- Every critical check passes
- Overall score is at least 9.5/10
- No blocking issues remain
