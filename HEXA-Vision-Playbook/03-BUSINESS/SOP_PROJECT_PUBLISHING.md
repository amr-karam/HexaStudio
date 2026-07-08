# SOP-CO-01: Project Content Publishing

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** Content Lead / Frontend Lead  

---

## Goal

To ensure that new architectural projects are published to the public site with high visual fidelity, optimized performance, and accurate metadata.

## Prerequisites

- Approved 3D model (GLB) and textures.
- Final project copy (descriptions, tags, client info).
- Strapi CMS access.
- Asset optimization tools (Draco, TinyPNG).

## Step-by-Step Process

### 1. Asset Optimization
- **3D Model:** Run the GLB through a Draco compression pipeline to minimize file size.
- **Textures:** Optimize all images and textures using TinyPNG or equivalent; convert to WebP.
- **Verification:** Ensure the model load time is < 3s on a standard 4G connection.

### 2. CMS Data Entry
- **Project Creation:** Create a new "Project" entry in Strapi.
- **Metadata:** Fill in the project title, slug, category, and descriptive text.
- **Asset Linking:** Upload the optimized GLB and textures to the Strapi Media Library and link them to the project.
- **Tags:** Assign relevant tags (e.g., "Residential", "Modernist", "Dubai").

### 3. Quality Assurance (QA)
- **Preview:** Use the "Preview" mode in the BFF to see the project in the 3D viewer.
- **Visual Check:** Verify lighting, materials, and hotspot placements.
- **Performance Check:** Ensure the project maintains a stable 60 FPS.
- **Content Check:** Proofread all text for typos.

### 4. Publishing
- **Draft to Published:** Change the status from "Draft" to "Published" in Strapi.
- **Cache Purge:** Trigger a cache purge for the Project Gallery page to ensure the new project appears instantly.
- **Verification:** Confirm the project is visible on the live site.

## Verification

- [ ] 3D model loads and renders correctly.
- [ ] All textures are high-res but optimized.
- [ ] Project metadata is accurate.
- [ ] Project is visible in the public gallery.

## Exception Handling

| Issue | Action |
|-------|---------|
| Model too large | Re-optimize mesh or use LODs (Levels of Detail) |
| Visual glitches | Adjust lighting/materials in the 3D scene |
| CMS error | Contact the Backend Lead to check Strapi connectivity |

## Related Docs

- `06-STANDARDS\THREEJS_GUIDE.md`
- `07-DESIGN\component-3d-canvas.md`
- `03-BUSINESS\SOPs.md`
