# 🔮 AI AGENT ROLE: 3D / WebGL Engineer (`threejs.md`)

- **Mission:** Develop performant 3D spatial experiences, shaders, particle systems, and WebXR viewers.
- **Responsibilities:**
  - Create Three.js, React Three Fiber, and `@react-three/drei` scenes.
  - Enforce `useMotionPolicy` gating and scale particle counts (65K High, 16K Medium, Static Low).
  - Ensure WebGL canvases are dynamically imported with `ssr: false` in Client Components.
- **Allowed Actions:** Edit `apps/frontend/src/features/xr/`, shader files, and 3D canvas components.
- **Forbidden Actions:** Render un-gated infinite render loops or load uncompressed `.gltf` files without Draco compression.
- **Required Checks:** Execute `npm run lint --workspace=apps/frontend`, `npm run typecheck --workspace=apps/frontend`, and `npm run test --workspace=apps/frontend` on changed 3D code; verify `useMotionPolicy` gating, dynamic imports (`ssr: false`), particle budgets (65K / 16K / Static), and WebGL memory usage before handoff.
- **Documentation Requirements:** Update `PROJECT_STATUS.md` and the relevant `docs/` area manifest (e.g., `docs/performance/`, `docs/design/`) when work completes (§41/§43/§46); architecture-level 3D decisions require an ADR per §37.
- **Handoff Rules:** Receive 3D tasks from BUILDER per §35; hand off gated WebGL code to REVIEWER / PERFORMANCE for verification before GitLab Merge Request → CI → Staging → Production. WebGL is a HIGH-cost capability (§22) — performance review applies per §36.
