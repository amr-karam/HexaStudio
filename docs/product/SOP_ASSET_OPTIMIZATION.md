# SOP-CO-03: Media Asset Optimization

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** 3D Artist / Frontend Lead  

---

## Goal

To ensure all media assets (3D models, textures, images, videos) are optimized for the web to guarantee a luxurious, lag-free experience without sacrificing visual fidelity.

## Prerequisites

- Source assets (High-poly GLB, 4K textures, RAW images).
- Optimization tools:
  - Draco Compression (for meshes).
  - TinyPNG / Squoosh (for images).
  - FFmpeg (for videos).
  - WebP/AVIF conversion tools.

## Step-by-Step Process

### 1. 3D Mesh Optimization
- **Polygon Reduction:** Use decimation tools to reduce poly count while preserving silhouette.
- **Draco Compression:** Apply Draco compression to the GLB file to reduce transfer size.
- **LOD Creation:** Create "Levels of Detail" (Low, Medium, High) for complex models.
- **Verification:** Ensure the final model is < 10MB for standard projects.

### 2. Texture Optimization
- **Resolution Scaling:** Downscale textures (e.g., 4K $\rightarrow$ 2K) where visual impact is minimal.
- **Format Conversion:** Convert all textures to WebP or KTX2 for faster GPU upload.
- **Channel Packing:** Combine multiple masks (Roughness, Metalness, AO) into a single RGB texture (R=AO, G=Rough, B=Metal).
- **Verification:** Ensure total texture budget per scene is < 50MB.

### 3. Image & Video Optimization
- **WebP/AVIF:** Convert all UI images and renders to WebP or AVIF.
- **Compression:** Apply lossy compression (80-90% quality) to remove invisible artifacts.
- **Video Encoding:** Use H.265 (HEVC) or VP9 for high-efficiency, high-quality video.
- **Verification:** Ensure images are < 500KB and videos are streamed via a CDN.

### 4. Quality Audit
- **Visual Check:** Compare the optimized asset with the source to ensure no "compression artifacts" are visible.
- **Performance Check:** Load the asset in the `ExperienceCanvas` and monitor the frame rate.

## Verification

- [ ] Model loads in < 3 seconds.
- [ ] Frame rate remains at 60 FPS during interaction.
- [ ] No visible blurring or pixelation in textures.
- [ ] Total page weight is within the Performance Budget.

## Exception Handling

| Issue | Action |
|-------|---------|
| Mesh too heavy | Implement aggressive decimation or split into smaller chunks |
| Texture blurring | Use higher resolution for critical areas (Tiling textures) |
| Video stuttering | Lower bitrate or use a more efficient codec |

## Related Docs

- `06-STANDARDS\THREEJS_GUIDE.md`
- `06-STANDARDS\PERFORMANCE.md`
- `03-BUSINESS\SOPs.md`
