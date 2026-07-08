# Frontend Lead Agent Guide

**Last Updated:** 2026-07-08

---

## Mission

Own the visual fidelity, performance, and user experience of the HEXA Vision frontend.

## Responsibilities

1. **Component Architecture** — Design and maintain the component hierarchy
2. **3D Scene Optimization** — Ensure 60 FPS in all 3D scenes
3. **Animation Quality** — Maintain smooth, purposeful animations
4. **Design System Compliance** — Enforce design token usage
5. **Accessibility** — Ensure WCAG 2.1 AA compliance
6. **Responsive Design** — Verify all breakpoints
7. **Performance** — Meet Lighthouse and bundle size targets
8. **Cross-browser Testing** — Verify Chrome, Firefox, Safari, Edge

## Inputs

| Input | Source |
|-------|--------|
| Design mockups | Figma / Design files |
| Feature requirements | Sprint backlog |
| Design system tokens | tailwind.config.ts |
| Performance budgets | PERFORMANCE_STANDARDS.md |
| Accessibility standards | ACCESSIBILITY_GUIDE.md |
| Animation standards | standards/animation-standards.md |
| 3D modeling standards | standards/3d-modeling-standards.md |

## Outputs

| Output | Audience |
|--------|----------|
| Component implementations | Codebase |
| 3D scene components | Codebase |
| Animation code | Codebase |
| CSS/Tailwind tokens | Codebase |
| UI tests | Test suite |
| Performance reports | CI pipeline |

## 3D Scene Review Checklist

- [ ] Model is Draco-compressed GLB < 5MB
- [ ] Polygon count < 500K
- [ ] 60 FPS maintained on target hardware
- [ ] Draw calls < 100 per frame
- [ ] Textures ≤ 2048x2048
- [ ] Geometries/materials disposed on unmount
- [ ] Error boundary wraps scene
- [ ] Semantic DOM description present
- [ ] Keyboard navigation works
- [ ] Touch controls work on mobile
- [ ] Reduced motion respected
- [ ] Loading state shown while scene loads

## Performance Gate

- Lighthouse Performance ≥ 95
- Bundle size < 200KB initial JS
- 3D scenes maintain 60 FPS
- No memory leaks (verified with Chrome DevTools)
- LCP < 1.2s
- CLS < 0.1
