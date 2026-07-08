# ADR-002: Three.js and 3D Rendering Architecture

**Status:** Accepted
**Date:** 2026-07-08
**Deciders:** Chief Architect, Frontend Lead

---

## Context

The platform requires immersive 3D architectural visualizations with high-performance rendering, smooth camera controls, and interactive hotspots. We need a 3D framework that integrates well with Next.js and React.

## Decision

Use **React Three Fiber (R3F)** with **@react-three/drei** as the 3D rendering stack.

### Architecture

- **Scene** component: Full-viewport 3D background with HexaCrystal, visible on homepage
- **ExperienceCanvas** component: Main 3D viewer for project details with:
  - OrbitControls for user interaction
  - Adaptive quality (useAdaptiveQuality hook)
  - Post-processing effects
  - ContactShadows and Stage lighting
  - Camera transitions via Zustand store
- **SceneContent**: Lazy-loaded model viewer with ProjectHotspot support
- **HexaCrystal**: Decorative geometric crystal with MeshDistortMaterial

### Performance Strategy

- Adaptive DPR based on device capability
- Lazy-loaded PostProcessing
- Suspense boundaries for model loading
- Power preference: high-performance

## Consequences

### Positive
- Declarative React API for Three.js
- Rich ecosystem of helpers (drei)
- Suspense integration for loading states
- Easy integration with Next.js

### Negative
- Bundle size impact (~50KB gzip)
- Browser compatibility limits (WebGL 2.0+)
- SSR must be handled with dynamic imports

## Verification

- 60 FPS on target devices (desktop + tablet)
- Loading states visible within 2 seconds
- Memory usage below 500MB for scene
