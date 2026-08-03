# HEXA Studio — 3D Scene System Deep Dive

**Analysis Date:** 2026-07-12  
**Component:** Frontend 3D Scene (`src/features/scene/`)

---

## 1. Architecture Overview

The 3D scene system is built on **React Three Fiber (R3F)** with a custom cinematic camera system. It follows a component hierarchy where each layer has a specific responsibility:

```
SceneCanvas (thin wrapper)
  └── ExperienceCanvas (R3F Canvas + scene setup)
        ├── SceneAccessibility (ARIA labels)
        ├── PerspectiveCamera
        ├── CameraController (behavior routing)
        │     ├── useScrollCamera (home page scroll-linked path)
        │     └── useCinematicCamera (target-based transitions)
        ├── OrbitControls (user interaction)
        ├── Environment (lighting)
        ├── SceneContent (model + hotspots)
        │     ├── ArchitecturalModel (GLTF loader with Draco)
        │     ├── Hotspot (interactive markers)
        │     └── ProceduralArchitecture (fallback geometry)
        ├── Lighting (directional + contact shadows)
        ├── Fog
        └── PostProcessing (lazy-loaded effects stack)
```

---

## 2. Key Components Analysis

### 2.1 SceneCanvas / ExperienceCanvas

**Files:**
- `SceneCanvas.tsx` — 7 lines, pure prop pass-through
- `ExperienceCanvas.tsx` — 102 lines, core R3F setup

**Responsibilities:**
- Configures R3F Canvas with shadows, DPR, tone mapping
- Sets up `PerspectiveCamera` as default
- Configures `OrbitControls` with constraints (no pan, limited polar angle)
- Adds `Environment` preset for reflections
- Lazy-loads `PostProcessing` component
- Wraps scene in `Suspense` with wireframe fallback

**Notable Patterns:**
- `useAdaptiveQuality` hook controls DPR and post-processing quality level
- `useCameraStore` provides `isTransitioning` state to disable OrbitControls during transitions
- `SceneAccessibility` component provides ARIA labels for screen readers

**Technical Details:**
```tsx
<Canvas
  shadows
  dpr={settings.dpr}  // Adaptive: [1, 1.5, 2] based on quality level
  gl={{
    antialias: true,
    powerPreference: 'high-performance',
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
  }}
>
```

### 2.2 CameraController

**File:** `CameraController.tsx` — 30 lines

**Strategy Pattern:**
- Routes camera behavior based on current route
- Home page (`/`): Uses `useScrollCamera` with a predefined 4-node path
- Other pages: Uses `useCinematicCamera` with target-based transitions

**Home Page Scroll Path:**
```tsx
const heroPath: ScrollPathNode[] = [
  { position: [8, 6, 8], lookAt: [0, 1, 0] },   // Wide shot
  { position: [5, 4, 5], lookAt: [0, 1.2, 0] }, // Mid
  { position: [3, 2, 3], lookAt: [0, 1.5, 0] }, // Close
  { position: [0, 1, 5], lookAt: [0, 1, 0] },   // Frontal
];
```

### 2.3 useCinematicCamera

**File:** `useCinematicCamera.ts` — 118 lines

**State Management:**
- Tracks mouse position for parallax effect
- Manages idle angle for auto-rotation
- Maintains `transitioning` ref to block input during animations
- Reads targets from `model-registry.ts` via `getModelConfig()`

**Key Features:**
1. **Idle Animation:** Slow orbit when no target is selected
2. **Parallax:** Mouse movement adds subtle camera offset
3. **Target Transitions:** GSAP-powered camera moves with `power3.out` easing
4. **Reduced Motion Support:** Respects `prefers-reduced-motion` media query

**Transition Flow:**
```
User clicks hotspot → setTarget(id) → goToTarget(id)
  → GSAP animates camera.position + lookAt proxy
  → onComplete: setTransitioning(false)
```

### 2.4 useScrollCamera

**File:** `useScrollCamera.ts` — 76 lines

**Scroll-Linked Animation:**
- Maps scroll progress (0–1) to camera path segments
- Linearly interpolates between path nodes
- Uses GSAP for smooth camera position updates (0.4s duration)
- Directly sets `camera.lookAt` (not GSAP-animated)

**Potential Issue:** Scroll event fires on every frame during scroll. No throttling or RAF-based optimization.

### 2.5 ArchitecturalModel

**File:** `ArchitecturalModel.tsx` — 102 lines

**Loading & Display:**
- Uses `useAssetLoader` hook to load GLTF with Draco compression
- Wraps model in a `group` ref for GSAP animations
- Implements **adaptive quality scaling** on materials based on `useAdaptiveQuality`

**Cinematic Entrance:**
```tsx
// Scale from 0 to target with power4.out
gsap.to(groupRef.current.scale, { x: scale, y: scale, z: scale, duration: 1.5, ease: 'power4.out', delay: 0.2 });
// Rotation from 0.2π to 0
gsap.from(groupRef.current.rotation, { y: Math.PI * 0.2, duration: 2, ease: 'power2.out' });
```

**Material Adaptation:**
- **Low quality:** Disables clearcoat, increases roughness, halves envMapIntensity
- **Medium quality:** Moderate clearcoat/roughness/envMapIntensity
- **High quality:** Full clearcoat=1, roughness=0.1, envMapIntensity=1.5

**Memory Management:**
- `useEffect` cleanup traverses all meshes and disposes geometries/materials
- This is critical for preventing WebGL memory leaks

### 2.6 Hotspot

**File:** `Hotspot.tsx` — 76 lines

**Interaction Design:**
- Ring geometry (outer indicator) + sphere geometry (inner clickable)
- Visual feedback on hover: opacity change, color shift, emissive glow
- Active state: expanded ring around selected hotspot
- HTML tooltip via `@react-three/drei` `Html` component with Framer Motion animation

**Technical Details:**
- Uses `useCameraStore` to set active target
- `pointerover`/`pointerout` for hover state (better than `mouseenter`/`mouseleave` for 3D)
- Click triggers `setTarget` which activates cinematic camera transition

### 2.7 PostProcessing

**File:** `PostProcessing.tsx` — 53 lines

**Quality-Gated Effects Stack:**
- **Low quality:** Returns `null` (no effects)
- **Medium quality:** Bloom + Noise + Vignette
- **High quality:** Bloom + DepthOfField + ChromaticAberration + Noise + Vignette

**Cinematic Style:**
- High luminance threshold bloom (0.9) for selective glow
- Subtle film grain (0.02–0.03 opacity)
- Vignette for focus drawing
- Chromatic aberration for organic feel (high quality only)

**Performance Note:** Lazy-loaded via `React.lazy()` in ExperienceCanvas to reduce initial bundle.

### 2.8 SceneContent

**File:** `SceneContent.tsx` — 151 lines

**Conditional Rendering:**
- If `projectModelUrl` provided: renders `ArchitecturalModel`
- Otherwise: renders `ProceduralArchitecture` (fallback geometry)

**ProceduralArchitecture:**
- Uses `useMemo` for geometry/material creation
- Creates floating gold elements with `Float` from drei
- Includes ground plane and base lighting
- **Potential Issue:** Geometries and materials are created in `useMemo` but never disposed. In a long-running app, this could leak memory if the component unmounts/remounts.

---

## 3. State Management

### 3.1 Zustand Stores

**asset-store.ts** — 17 lines
```ts
interface AssetState {
  loadingProgress: number;
  loaded: number;
  total: number;
  setProgress: (progress: number) => void;
  setCounts: (loaded: number, total: number) => void;
}
```
- Minimal state for loading progress tracking
- Updated by `useAssetLoader` hook

**camera-store.ts** — 19 lines
```ts
interface CameraState {
  currentTarget: string | null;
  isTransitioning: boolean;
  setTarget: (target: string | null) => void;
  setTransitioning: (status: boolean) => void;
}
```
- Tracks active hotspot and transition state
- Shared across CameraController, ArchitecturalModel, Hotspot, ExperienceCanvas

### 3.2 useAssetLoader Hook

**File:** `useAssetLoader.ts` — 31 lines

```ts
export function useAssetLoader(url: string) {
  const { progress, loaded, total } = useProgress();
  const gltf = useGLTF(url, DRACO_URL);
  // ...
}
```

**Features:**
- Wraps `useGLTF` from `@react-three/drei`
- Hardcoded Draco decoder URL: `https://www.gstatic.com/draco/versioned/decoders/1.5.6/`
- Preloads model on URL change
- Returns model scene, animations, nodes, materials, and progress

**Potential Issue:** Hardcoded external Draco URL. Should be configurable or self-hosted for offline/production reliability.

---

## 4. Configuration

### 4.1 Model Registry

**File:** `model-registry.ts` — 46 lines

```ts
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'default': { path: '/models/hexa-crystal.glb', ... },
  'tower': { path: '/models/tower.glb', ... },
};
```

**ModelConfig Interface:**
- `path`, `scale`, `position`, `rotation`, `exposure`
- `envMapIntensity`
- `cinematicPoints[]` — named camera positions with lookAt targets

**Current Limitation:** Only 2 models registered. As the portfolio grows, this registry will need dynamic loading from the CMS/backend rather than hardcoded entries.

---

## 5. Performance Optimizations

### 5.1 Implemented
- **Dynamic imports** for Three.js/R3F/GSAP on non-home routes
- **Adaptive quality** system with 3 levels (low/medium/high)
- **LOD via material simplification** in `ArchitecturalModel`
- **Instancing** in `ProceduralArchitecture` (shared geometry/material for floating elements)
- **Draco compression** for GLB models
- **Lazy PostProcessing** via `React.lazy()`
- **useMemo** for geometry/material creation
- **Disposal** in `ArchitecturalModel` cleanup

### 5.2 Missing / Opportunities
- **No explicit LOD groups** — complex models don't use `LOD` component from drei
- **No frustum culling** — relies on Three.js default (which is basic)
- **No texture compression** — only mesh compression via Draco
- **Scroll handler not throttled** — `useScrollCamera` fires on every scroll event

---

## 6. Error Handling

### 6.1 SceneErrorBoundary

**File:** `SceneErrorBoundary.tsx` — 70 lines

- Class component (required for error boundaries)
- Catches R3F/Three.js errors
- Renders fallback UI with icon, title, and description
- Logs error to console (should integrate with Sentry)

**Missing:**
- No Sentry integration for 3D errors
- No retry mechanism
- No fallback 2D image option

### 6.2 Loading States

- `SceneFallback` — wireframe cube in Suspense fallback
- `LoadingScreen` — full-page loading component (used in ProjectSceneWrapper)

---

## 7. Accessibility

### 7.1 SceneAccessibility

- Provides ARIA labels for screen readers
- Announces project title and hotspot descriptions
- Located at `src/features/scene/components/SceneAccessibility.tsx`

### 7.2 Reduced Motion

- `useReducedMotion` hook checks `prefers-reduced-motion: reduce`
- Gates all GSAP animations and camera movements
- Tested with 4 Vitest specs

---

## 8. Code Quality Assessment

### Strengths
- Clean separation of concerns (canvas setup, camera, model, hotspots, effects)
- Strong TypeScript typing with shared `@hexastudio/types`
- Memory cleanup in `ArchitecturalModel`
- Adaptive quality system
- Error boundary for graceful degradation
- Reduced motion support

### Concerns
1. **SceneContent memory leak risk** — Geometries/materials created in `useMemo` but not disposed
2. **Hardcoded Draco URL** — External dependency for critical functionality
3. **No LOD groups** — Complex models may struggle at distance
4. **Scroll event not throttled** — Potential jank on scroll-heavy pages
5. **Model registry is static** — Won't scale to many projects
6. **No Sentry in 3D errors** — `SceneErrorBoundary` only logs to console
7. **OrbitControls always mounted** — Even when not needed (e.g., cinematic-only views)

---

*End of Scene System Deep Dive*
