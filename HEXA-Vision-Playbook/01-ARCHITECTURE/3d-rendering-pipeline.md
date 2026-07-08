# 3D Rendering Pipeline

**Last Updated:** 2026-07-08

---

## Pipeline Overview

```
3D Modeling Software (Blender, 3ds Max, SketchUp)
    │
    ▼
Export GLTF 2.0 (Binary .glb format)
    │
    ├── Apply all transforms (location, rotation, scale)
    ├── Triangulate all faces
    ├── Export selected objects only
    ├── Include: Meshes, Materials, Textures
    ├── Exclude: Cameras, Lights, Animations
    └── Up axis: Y, Forward: Z
    │
    ▼
Draco Compression (via gltf-transform CLI)
    │
    ├── Compress geometry (position, normal, uv)
    ├── Quantize positions (11 bits)
    ├── Quantize normals (8 bits)
    ├── Quantize UVs (10 bits)
    └── Target: < 5MB file size
    │
    ▼
Upload to MinIO (S3-compatible storage)
    │
    ▼
CDN Cache (Cloudflare)
    │
    ▼
Client Browser
    │
    ├── useGLTF (drei) loads + decompresses model
    ├── Scene renders via React Three Fiber
    └── InstancedMesh optimization applied
```

## Render Loop

```
requestAnimationFrame
    │
    ▼
useFrame (R3F callback)
    │
    ├── Update controls (orbit, zoom, pan)
    ├── Update LOD (Level of Detail)
    ├── Update animations (if any)
    ├── Frustum culling
    │
    ▼
Three.js Renderer
    │
    ├── Sort transparent objects
    ├── Render opaque objects (front-to-back)
    ├── Render transparent objects (back-to-front)
    ├── Apply post-processing (if enabled)
    │
    ▼
WebGL Context
    │
    ├── Vertex shader → Geometry processing
    ├── Fragment shader → Pixel processing
    └── Output to canvas
```

## Lighting Strategy

### Static Scenes (Default)

```
Lighting: Baked into textures
  ├── High-quality renders pre-computed in Blender
  ├── Baked to lightmap textures
  ├── Environment map for reflections
  └── No dynamic lights needed
```

### Dynamic Elements (When Needed)

```
Lighting: Minimal dynamic lights
  ├── 1 DirectionalLight (sun)
  ├── 1 AmbientLight (fill)
  └── Optional: HemisphereLight (sky/ground)
```

## Post-Processing Pipeline

```typescript
// ✅ Good — Minimal post-processing
const { nodes, materials } = useGLTF('/models/scene.glb');

const EffectComposer = dynamic(
  () => import('@react-three/postprocessing').then(mod => mod.EffectComposer),
  { ssr: false }
);

function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom intensity={0.3} luminanceThreshold={0.8} />
      <SMAA /> {/* Anti-aliasing */}
    </EffectComposer>
  );
}
```

## Performance Budgets

| Metric | Target | Alert |
|--------|--------|-------|
| Draw calls | < 100 | > 150 |
| Triangles | < 500K | > 750K |
| Textures | < 200MB GPU memory | > 300MB |
| Material count | < 50 | > 75 |
| FPS | 60 | < 30 |
| Load time | < 3s | > 5s |

## Mobile Optimization

```typescript
// ✅ Good — Detect device capability
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function Scene({ modelPath }: SceneProps) {
  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower pixel ratio on mobile
      performance={{ min: 0.5 }} // Allow degradation
      gl={{
        antialias: !isMobile,
        powerPreference: isMobile ? 'low-power' : 'high-performance',
      }}
    >
      {/* Scene content */}
    </Canvas>
  );
}
```

## Related Documents

- `standards/3d-modeling-standards.md` — Model preparation standards
- `PERFORMANCE_STANDARDS.md` — Performance budgets and monitoring
- `agents/frontend-lead-agent.md` — Frontend quality gate
