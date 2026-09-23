# ADR 0014: Modular XR Viewer Architecture

## Status
Accepted

## Context
Previously, the 3D experience was managed via a monolithic `scene-content.tsx` component. While functional, this approach led to several issues:
1. **Hydration Bottlenecks**: The heavy WebGL context was initialized synchronously during the main hydration commit, competing with critical UI elements.
2. **Fragile Error Handling**: A single WebGL crash or context loss would often leave the user with a blank screen or a frozen UI.
3. **Poor Loading Experience**: The transition from the cinematic preloader to the 3D scene often exhibited a visible "flicker" or loading state.
4. **Tight Coupling**: The scene logic was tightly coupled to the home page, making it difficult to reuse the XR experience across different parts of the application (e.g., Project detail pages).

## Decision
We are replacing the monolithic scene content with a modular **XR Viewer Architecture**.

### Key Changes:
1. **`XRViewerClient`**: A high-level wrapper that handles orchestration, including dynamic imports of the canvas and error boundary wrapping.
2. **`XRCanvas`**: A dedicated, lazy-loaded canvas component that implements context-loss recovery and shares a WebGL context across the app to prevent multiple GPU allocations.
3. **`XRView` & `XRSceneContent`**: Separated the viewing logic (environment, lights, shadows) from the content logic (model loading, interaction, collaboration).
4. **`CanvasErrorBoundary`**: Introduced a specific error boundary for the 3D layer to allow the rest of the UI to remain functional even if the WebGL context crashes.
5. **Asset Warm-up**: Implemented a preloading utility (`preloadXRAssets`) to fetch models and bundles in the background, removing the loading flicker.

## Consequences
### Positive:
- **Improved Stability**: WebGL crashes are now isolated and handled gracefully via the `CanvasErrorBoundary`.
- **Better Performance**: Lazy-loading the canvas reduces the initial JS payload and avoids blocking the main thread during hydration.
- **Reusable**: The XR experience can now be instantiated anywhere in the app by simply providing a `modelUrl`.
- **Smoother UX**: Preloading assets eliminates the visible "Loading..." state for most users.

### Negative/Risks:
- **Increased Complexity**: The architecture now involves more components and dynamic imports.
- **State Management**: Requires a robust store (`xr-store`) to coordinate state between the UI and the 3D canvas.
