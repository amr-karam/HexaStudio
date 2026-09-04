# ⚙️ LOW LEVEL DESIGN: THE TECHNICAL BLUEPRINT

**Version:** 1.2 | **Domain:** Architecture | **Focus:** Implementation Details  
**Last Updated:** 2026-09-04

---

## 1. COMPONENT COMMUNICATION PATTERN

To avoid "Prop Draining" and maintain a high-performance render loop, we use a **Tiered State Architecture**.

### I. Global State (Zustand)
Used for data that is needed across the entire application:
- **User Session:** Auth status, roles, preferences.
- **Global UI State:** Navigation menu state, theme, global notifications.
- **Active Project:** The currently loaded 3D project manifest.

### II. Scene State (R3F/Three.js)
Used for high-frequency updates within the 3D canvas:
- **Camera Position:** Current coordinates and target.
- **Asset Loading State:** Progress of individual GLTFs.
- **Interaction State:** Which object is currently hovered/selected.
- **Lighting State:** Current HDR intensity and sun position.

### III. Local State (React `useState`/`useReducer`)
Used for isolated UI components:
- **Form Inputs:** Temporary state before submission.
- **Toggle States:** Individual button or modal visibility.

---

## 2. THE DATA FETCHING PIPELINE

### I. The Request Sequence
`Frontend (TanStack Query)` → `Backend (NestJS Controller)` → `Service` → `Strapi API` → `Data Transformation` → `Frontend`

### II. Optimization Strategies
- **SWR (Stale-While-Revalidate):** Use TanStack Query to show cached data instantly while updating in the background.
- **Projection:** The Backend must only return the fields needed for the specific view. (e.g., a "Project Card" doesn't need the full project description.)
- **Batching:** Group multiple API requests into a single "Manifest Request" to reduce network overhead.

### III. Dynamic Route Data Fetching with Error Boundaries
Dynamic routes use Next.js App Router's `error.tsx` and `loading.tsx` boundary pattern:

```typescript
// apps/frontend/src/app/blog/[slug]/loading.tsx
export default function BlogLoading() {
  return <BlogSkeleton />;  // Staggered skeleton loader
}

// apps/frontend/src/app/blog/[slug]/error.tsx
'use client';
import { captureException } from '@sentry/nextjs';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="sl-section">
      <h1 className="sl-heading sl-heading-lg">Something went wrong</h1>
      <button className="sl-btn" onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### IV. AbortController Timeout Pattern
For admin/backend data fetches where the service may be unreachable, a 6-second `AbortController` timeout prevents hanging:

```typescript
// apps/frontend/src/app/admin/accounting/page.tsx
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 6000);

try {
  const res = await fetch(`${API_URL}/admin/accounting/summary`, {
    signal: controller.signal,
    headers: { 'Content-Type': 'application/json' },
  });
  clearTimeout(timeoutId);
  // ... process response
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    // Handle timeout — show user-friendly error
  }
}
```

---

## 3. 3D RENDER LOOP OPTIMIZATION

To maintain 60 FPS, we implement the following laws:

1. **The "No-React-in-Loop" Rule:** Never use React state to update 3D objects inside the `useFrame` loop. Use **Refs** and direct mutation of Three.js objects.
2. **LOD Switching:** Dynamically swap high-poly meshes for low-poly versions based on the camera distance.
3. **Frustum Culling:** Only render objects that are actually within the camera's view.
4. **Texture Atlasing:** Combine multiple small textures into one large atlas to reduce draw calls.

### Color Token Integration in 3D
Three.js/WebGL materials use `COLOR_TOKENS` from `src/lib/color-tokens.ts` instead of hardcoded hex values:

```typescript
import { COLOR_TOKENS } from '@/lib/color-tokens';
import { Color } from 'three';

// Instead of: new Color('#0A0A0B')
const bg = new Color(COLOR_TOKENS.VOID);
const gold = new Color(COLOR_TOKENS.GOLD);
```

This ensures 3D scene colors stay in sync with the canonical design system. The `color-tokens.ts` module is excluded from the design token gate (`check-design-tokens.mjs`) since it defines the tokens, not consumes them.

---

## 4. ERROR HANDLING & RESILIENCE

### I. Frontend Resilience
- **Error Boundaries:** Every major 3D scene is wrapped in an Error Boundary to prevent a single asset failure from crashing the whole page.
- **Dynamic Route Boundaries:** All dynamic routes (`/blog/[slug]`, `/projects/[slug]`, `/portal/projects/[id]`, `/portal/review/[id]`) have dedicated `error.tsx` and `loading.tsx` files with Sentry capture and retry navigation.
- **Fallback Assets:** If a high-res model fails to load, show a low-res proxy or a placeholder.

### II. Backend Resilience
- **Circuit Breaker:** If Strapi is slow or down, NestJS returns a cached version of the data from Redis.
- **Input Validation:** Every request is validated via `class-validator` to prevent injection attacks.

### III. WebGL Context Loss Recovery
R3F v9 has zero built-in `webglcontextlost`/`webglcontextrestored` handling. The `useContextLossRecovery` hook manages context loss by:
- Calling `preventDefault()` on context loss events
- Pausing the R3F render loop via `state.internal.active = false`
- Showing a static `role="status"` fallback overlay during recovery
- Restoring via `remountOnRestore` (bumps a `restartKey`) for critical canvases

### IV. SSR/SSG Resilience
- **RSS routes:** Use `force-dynamic` rendering to prevent build prerender timeouts when the API is unreachable during `next build`.
- **Fallback pages:** All dynamic routes have `loading.tsx` skeletons that render immediately without JavaScript.
- **No-JS fallback:** Core content is server-rendered and visible without JavaScript execution.

---

## 5. IMPLEMENTATION CHECKLIST
Before implementing a new feature:
- [ ] Define the shared types in `/packages/types`.
- [ ] Map the data flow from Strapi → NestJS → Next.js.
- [ ] Determine if the state belongs in Zustand or Local state.
- [ ] Verify that the implementation does not trigger unnecessary re-renders in the 3D scene.
- [ ] If adding a dynamic route, create `error.tsx` + `loading.tsx` boundaries.
- [ ] If adding a 3D component, use `COLOR_TOKENS` from `src/lib/color-tokens.ts`.
- [ ] Run `node scripts/check-design-tokens.mjs` (0 violations without `--allow-inline-style-hex`).
- [ ] Run `node scripts/check-font-preloads.mjs` (all 7 preloads match).

*“Complexity is the enemy of performance. Simplicity is the key to luxury.”*
