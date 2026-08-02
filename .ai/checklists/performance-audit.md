# ⚡ CHECKLIST: Performance Audit

- [ ] LCP < 2.5s, INP < 200ms, CLS < 0.1?
- [ ] Are heavy WebGL canvases dynamically imported with `ssr: false` in Client Components?
- [ ] Is `useMotionPolicy` gating particle physics and camera movement?
- [ ] Are images formatted in WebP/AVIF with explicit aspect ratios?
