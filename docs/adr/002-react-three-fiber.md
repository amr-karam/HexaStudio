# ADR-002: React Three Fiber for 3D Visualization

## Status
Accepted

## Date
2025-01-15

## Context
The core product is immersive 3D architectural visualization. We need a 3D rendering solution that:
- Integrates seamlessly with React's component model
- Supports GLTF/GLB models with Draco compression
- Enables post-processing effects (bloom, DOF, chromatic aberration)
- Provides camera controls and animation utilities
- Maintains 60 FPS performance on mid-range hardware

## Decision
We will use **React Three Fiber (R3F)** with **@react-three/drei** and **@react-three/postprocessing**.

## Alternatives Considered
| Alternative | Pros | Cons |
|-------------|------|------|
| Babylon.js | Full engine, excellent performance | No React integration, steeper learning curve |
| Three.js (raw) | Maximum control, no abstraction overhead | Verbose, manual React reconciliation, no HMR |
| PlayCanvas | Cloud-based, collaborative editing | Vendor lock-in, less flexible customization |
| Unity WebGL | Powerful engine, visual editor | Heavy bundle size (~5MB), licensing complexity |

## Rationale
1. **React Integration**: R3F turns Three.js into declarative JSX — scene graphs become component trees.
2. **Ecosystem**: `drei` provides production-ready helpers (OrbitControls, Environment, useGLTF) without reinventing wheels.
3. **Performance**: R3F uses concurrent features and automatic dispose — prevents memory leaks in long sessions.
4. **Post-Processing**: `@react-three/postprocessing` wraps Three.js EffectComposer in React-friendly APIs.
5. **Community**: Largest React 3D ecosystem; extensive examples for architectural visualization.

## Consequences
- Must follow R3F best practices: dispose geometries/materials on unmount.
- Client components only (`'use client'`) — R3F requires browser APIs.
- Bundle size increases (~150KB gzipped) — offset by code splitting with dynamic imports.

## References
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [Post-Processing](https://github.com/pmndrs/react-postprocessing)
