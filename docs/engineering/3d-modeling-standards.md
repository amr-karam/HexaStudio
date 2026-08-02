# 3D Modeling Standards

**Last Updated:** 2026-07-08

---

## Model Preparation

### Format

| Requirement | Standard |
|-------------|----------|
| **File format** | GLTF 2.0 Binary (`.glb`) |
| **Compression** | Draco (required for all models) |
| **Max file size** | 5MB (compressed) |
| **Max poly count** | 500K triangles per scene |
| **Texture size** | 2048x2048 max (1024x1024 preferred) |
| **Texture format** | PNG (lossless) or JPEG (lossy for large files) |

### Export Settings

```
- Apply all transforms (location, rotation, scale)
- Export with selected objects only
- Include: Meshes, Materials, Textures
- Exclude: Cameras, Lights, Animations (separate file)
- Up axis: Y-up
- Forward axis: Z-forward
- Units: Meters
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Mesh | `prefix_name` | `wall_exterior_main` |
| Material | `MAT_Name` | `MAT_Concrete_Light` |
| Texture | `TEX_Name_Type` | `TEX_Concrete_Diffuse` |
| Group | `GRP_Name` | `GRP_Furniture_Living` |
| LOD | `meshName_LOD0` | `chair_LOD0` |

### LOD (Level of Detail)

| LOD Level | Poly Count | Distance |
|-----------|------------|----------|
| LOD0 | 100% | 0-10m |
| LOD1 | 50% | 10-30m |
| LOD2 | 25% | 30-50m |
| LOD3 | 10% | 50m+ |

## Texture Guidelines

| Texture Type | Resolution | Format | Notes |
|-------------|------------|--------|-------|
| Diffuse/Albedo | 2048x2048 | PNG/JPEG | sRGB color space |
| Normal | 2048x2048 | PNG | Linear, DirectX |
| Roughness | 1024x1024 | PNG | Linear, single channel |
| Metalness | 1024x1024 | PNG | Linear, single channel |
| Ambient Occlusion | 1024x1024 | PNG | Linear, single channel |

## Performance Rules

1. **InstancedMesh** for repeated objects (chairs, trees, columns)
2. **Merge meshes** where possible (static objects sharing same material)
3. **Baked lighting** for static scenes
4. **Texture atlasing** for small object textures
5. **Occlusion culling** — hide objects not in view
6. **Prefer fewer, larger textures** over many small ones

## Scene Organization

```
Scene (root)
├── Environment (skybox, terrain, lighting)
├── Architecture
│   ├── Exterior
│   │   ├── Walls
│   │   ├── Roof
│   │   ├── Windows
│   │   └── Doors
│   └── Interior
│       ├── Flooring
│       ├── Ceiling
│       └── Partitions
├── Furniture
│   ├── Living
│   ├── Kitchen
│   ├── Bedroom
│   └── Bathroom
├── Vegetation (trees, plants)
└── Lighting (baked lightmaps)
```

## Loading Strategy

```typescript
// ✅ Good — Preloading with progress
const { scene } = useGLTF('/models/project.glb', true);

// ✅ Good — Progressive loading
<Suspense fallback={<LoadingFallback />}>
  <Model path="/models/project.glb" />
</Suspense>

// ✅ Good — Memory cleanup
useEffect(() => {
  return () => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  };
}, []);
```

## Quality Checklist

- [ ] Model exported as Draco-compressed GLB
- [ ] File size under 5MB
- [ ] Polygon count under 500K
- [ ] All transforms applied
- [ ] Textures optimized (2048x2048 max)
- [ ] UV maps non-overlapping
- [ ] No missing textures or materials
- [ ] LOD variants created (if distant objects)
- [ ] InstancedMesh used for repeated objects
- [ ] Baked lighting for static elements
