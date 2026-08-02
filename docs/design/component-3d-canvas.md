# Component Guide: 3D Canvas

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Purpose

The `ExperienceCanvas` is the foundation of every 3D interaction. It manages the WebGL context, rendering settings, and global scene state.

## Technical Specification

### Rendering Settings

| Setting | Value | Reason |
|---------|-------|---------|
| `dpr` | [1, 2] | Performance balance on high-res screens |
| `antialias` | True | Smooth edges (disable on low-end mobile) |
| `powerPreference` | 'high-performance' | Force GPU usage |
| `stencil` | False | Reduce memory overhead |

### Component Architecture

```
<ExperienceCanvas>
  <Suspense fallback={<LoadingScreen />}>
    <SceneProvider>
      <Environment />
      <PostProcessing />
      <Model />
      <Controls />
    </SceneProvider>
  </Suspense>
</ExperienceCanvas>
```

## Performance Rules

1. **No State in Canvas** — Avoid updating React state every frame. Use `useFrame` and `ref` for animations.
2. **Suspense** — Always wrap 3D content in `<Suspense>` to prevent UI freeze during asset load.
3. **Culling** — Use frustum culling for complex scenes.
4. **Asset Loading** — Use `useGLTF` with Draco compression.

## Accessibility

The canvas must always be accompanied by a semantic DOM description:

- `aria-hidden="true"` on the canvas.
- `role="region"` on the wrapper with a descriptive `aria-label`.
- Keyboard controls for zoom and rotate.

## Code Example

```typescript
export function ExperienceCanvas({ children }: { children: ReactNode }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={<LoadingScreen />}>
        {children}
      </Suspense>
    </Canvas>
  );
}
```
