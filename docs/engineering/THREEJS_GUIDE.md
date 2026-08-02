# 🧊 THREE.JS & R3F GUIDE: HIGH-PERFORMANCE 3D

**Version:** 1.0 | **Scope:** Frontend | **Standard:** Cinematic Quality / 60 FPS

## 1. THE GOLDEN RULE OF 3D
**Performance is a Feature.** A beautiful scene that runs at 20 FPS is a failure. We target a consistent 60 FPS on mid-range hardware.

---

## 2. MEMORY MANAGEMENT (THE ANTI-LEAK PROTOCOL)

### I. Manual Disposal
Three.js does not automatically garbage collect GPU assets. Every custom asset must be disposed of when the component unmounts.
- **Dispose:** Geometries, Materials, and Textures.
- **R3F Pattern:** Use `useEffect` cleanup or the `dispose` prop where applicable.

### II. Asset Optimization
- **GLB/GLTF:** Always use `.glb` for production.
- **Draco Compression:** All models MUST be Draco-compressed to reduce binary size.
- **Texture Power of Two:** Use textures with dimensions that are powers of two (e.g., 1024x1024) for GPU optimization.
- **KTX2/Basis:** Use KTX2 textures for complex materials to reduce VRAM usage.

---

## 3. RENDERING STRATEGIES

### I. Draw Call Reduction
- **InstancedMesh:** Use `InstancedMesh` for any repeated geometry (e.g., a forest of trees, a grid of panels).
- **Merging:** Merge static geometries into a single mesh where possible.
- **Atlas Textures:** Use texture atlases to reduce the number of materials and draw calls.

### II. Lighting & Shadows
- **Baked Lighting:** Prefer baked lightmaps over real-time shadows for static environments.
- **Shadow Maps:** Use `PCFSoftShadowMap` for a luxury feel, but limit the number of shadow-casting lights.
- **Ambient Occlusion:** Use SSAO (Screen Space Ambient Occlusion) for grounding objects in the scene.

---

## 4. INTERACTION & MOTION

### I. Raycasting Optimization
- **Layering:** Use `layers` to ensure the raycaster only checks interactable objects.
- **Throttling:** Never raycast every frame. Throttle to 10-20 times per second.

### II. Camera Transitions
- **Lerping:** Use `Vector3.lerp` or `Quaternion.slerp` for smooth camera movement.
- **Damping:** Use `THREE.Quaternion` for rotational stability to avoid gimbal lock.

---

## 5. QUALITY GATE: 3D AUDIT
A 3D feature is "Done" only when:
- [ ] FPS is stable at 60 (verified via `stats.js`).
- [ ] No memory leaks (verified via Chrome Heap Snapshot).
- [ ] All models are Draco-compressed.
- [ ] Visuals are audited against the Design System (Materials/Lighting).

*“The goal is not to simulate reality, but to create a cinematic version of it.”*
