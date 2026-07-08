# Accessibility Report: HEXA Vision

**Report Date:** 2026-06-30  
**Standard Target:** WCAG 2.1 AA

---

## 1. Current State

| Criterion | Status | Notes |
|-----------|--------|-------|
| Semantic HTML | Partial | `<main>`, `<h1>` in HomeHero |
| Keyboard navigation | Untested | Single button/link |
| Focus indicators | Default browser | No custom focus styles |
| ARIA labels | None | — |
| Color contrast | Likely pass | Black on white, neutral-500 text |
| `prefers-reduced-motion` | Not implemented | GSAP/R3F will need this |
| Screen reader 3D layer | Not implemented | — |
| Skip navigation link | Missing | — |
| Form labels | N/A | Input component exists but unused |
| Error boundaries | Present | Console only; no a11y announcement |

**A11y Score Estimate:** 40/100 (minimal page, no audit performed)

---

## 2. Dual-Interface Strategy (3D + Semantic)

```
┌─────────────────────────────────────┐
│  Visual Layer (R3F Canvas)          │  ← Sighted users
│  Interactive 3D scene               │
├─────────────────────────────────────┤
│  Semantic Layer (visually hidden)   │  ← Screen readers
│  <nav aria-label="Scene locations"> │
│  <article> per hotspot/model        │
│  <p> descriptive text per element   │
└─────────────────────────────────────┘
```

### Implementation Rules

1. Every 3D hotspot has a corresponding focusable DOM element
2. Scene navigation available via keyboard (Tab + Arrow keys)
3. `aria-live="polite"` for scene state changes
4. `role="img"` with `aria-label` for static 3D views

---

## 3. UI Component Checklist

| Component | Focusable | ARIA | Status |
|-----------|-----------|------|--------|
| Button | Yes | Missing label on icon-only | Partial |
| Input | Yes | Needs `aria-describedby` for errors | Built, unused |
| Modal | — | Needs `role="dialog"`, focus trap | Built, unused |
| Navbar | — | Needs `aria-current` on active link | Built, unused |
| LoadingScreen | — | Needs `role="status"` | Built, unused |

---

## 4. Motion Accessibility

| Feature | `prefers-reduced-motion: reduce` behavior |
|---------|------------------------------------------|
| GSAP camera transitions | Skip; jump to end state |
| Framer Motion UI | `transition: none` |
| R3F auto-rotate | Disable |
| Loading animations | Static indicator |

**Hook:** `useReducedMotion()` (Sprint 1) to gate all animations.

---

## 5. Color Contrast Audit (preliminary)

| Element | Foreground | Background | Ratio | Pass |
|---------|-----------|------------|-------|------|
| H1 | #000 | #fff | 21:1 | Yes |
| Subtitle | neutral-500 (~#737373) | #fff | ~4.6:1 | Yes (AA) |
| API label | neutral-400 (~#a3a3a3) | #fff | ~2.8:1 | **Fail** (decorative) |

---

## 6. Accessibility Roadmap

| Task | Priority | Effort | Sprint |
|------|----------|--------|--------|
| Skip-to-content link | High | 1 hr | Sprint 2 |
| Focus visible styles on Button | High | 2 hr | Sprint 2 |
| `useReducedMotion` hook | High | 2 hr | Sprint 1 |
| Modal focus trap + ARIA | High | 4 hr | Sprint 3 |
| 3D semantic layer | High | 1 week | Sprint 5 |
| Keyboard scene navigation | High | 1 week | Sprint 5 |
| axe-core in CI | Medium | 4 hr | Sprint 4 |
| Screen reader testing | Medium | Ongoing | Sprint 5+ |

---

## 7. Testing Plan

| Tool | Scope | Frequency |
|------|-------|-----------|
| axe DevTools | Component-level | Per PR |
| Lighthouse Accessibility | Page-level | CI |
| NVDA / VoiceOver | Full flows | Pre-release |
| Keyboard-only navigation | All interactive pages | Per Sprint |

---

## 8. Summary

Accessibility is unaddressed beyond basic HTML semantics. The dual-interface approach is the correct strategy for a 3D platform. Sprint 1 adds `useReducedMotion`; full compliance requires Sprint 5 work alongside 3D implementation.
