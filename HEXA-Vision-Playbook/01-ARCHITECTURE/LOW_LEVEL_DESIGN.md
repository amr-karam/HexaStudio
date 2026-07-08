# ⚙️ LOW LEVEL DESIGN: THE TECHNICAL BLUEPRINT

**Version:** 1.0 | **Domain:** Architecture | **Focus:** Implementation Details

## 1. COMPONENT COMMUNICATION PATTERN
To avoid "Prop Drilling" and maintain a high-performance render loop, we use a **Tiered State Architecture**.

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
`Frontend (TanStack Query)` $\rightarrow$ `Backend (NestJS Controller)` $\rightarrow$ `Service` $\rightarrow$ `Strapi API` $\rightarrow$ `Data Transformation` $\rightarrow$ `Frontend`

### II. Optimization Strategies
- **SWR (Stale-While-Revalidate):** Use TanStack Query to show cached data instantly while updating in the background.
- **Projection:** The Backend must only return the fields needed for the specific view. (e.g., a "Project Card" doesn't need the full project description).
- **Batching:** Group multiple API requests into a single "Manifest Request" to reduce network overhead.

---

## 3. 3D RENDER LOOP OPTIMIZATION
To maintain 60 FPS, we implement the following laws:

1. **The "No-React-in-Loop" Rule:** Never use React state to update 3D objects inside the `useFrame` loop. Use **Refs** and direct mutation of Three.js objects.
2. **LOD Switching:** Dynamically swap high-poly meshes for low-poly versions based on the camera distance.
3. **Frustum Culling:** Only render objects that are actually within the camera's view.
4. **Texture Atlasing:** Combine multiple small textures into one large atlas to reduce draw calls.

---

## 4. ERROR HANDLING & RESILIENCE

### I. Frontend Resilience
- **Error Boundaries:** Every major 3D scene is wrapped in an Error Boundary to prevent a single asset failure from crashing the whole page.
- **Fallback Assets:** If a high-res model fails to load, show a low-res proxy or a placeholder.

### II. Backend Resilience
- **Circuit Breaker:** If Strapi is slow or down, NestJS returns a cached version of the data from Redis.
- **Input Validation:** Every request is validated via `class-validator` to prevent injection attacks.

---

## 5. IMPLEMENTATION CHECKLIST
Before implementing a new feature:
- [ ] Define the shared types in `/packages/types`.
- [ ] Map the data flow from Strapi $\rightarrow$ NestJS $\rightarrow$ Next.js.
- [ ] Determine if the state belongs in Zustand or Local state.
- [ ] Verify that the implementation does not trigger unnecessary re-renders in the 3D scene.

*“Complexity is the enemy of performance. Simplicity is the key to luxury.”*
