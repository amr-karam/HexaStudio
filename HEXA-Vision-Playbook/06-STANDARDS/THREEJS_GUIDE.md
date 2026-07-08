# Three.js Cinematic Guide: HexaStudio Hero

## 1. Visual Pipeline
To achieve "Awwwards-level" fidelity, the pipeline moves from standard rendering to a cinematic post-processing stack.

### Post-Processing Stack
- **Bloom:** Used to create a "glow" effect on high-intensity lights and metallic highlights.
    - *Settings:* Threshold: 1.0, Strength: 0.5, Radius: 0.4.
- **Depth of Field (DOF):** Mimics a real camera lens to focus attention on architectural details while blurring the foreground/background.
    - *Settings:* Focal length: 35mm, Bokeh: Circular.
- **Chromatic Aberration:** Very subtle fringe at the edges of the screen to simulate lens imperfection.
- **Tone Mapping:** Using `ACESFilmicToneMapping` for high dynamic range (HDR) results.

### Lighting & Environment
- **HDRI:** Using high-resolution `.exr` or `.hdr` maps for physically accurate reflections and ambient lighting.
- **Contact Shadows:** Soft, blurred shadows directly beneath the model to prevent "floating" objects.
- **Area Lights:** Strategically placed to define the architectural form and create contrast.

## 2. Interaction Model
The camera is not static; it responds to the user to create a sense of presence.

- **Mouse Parallax:** The camera subtly shifts position based on mouse coordinates, creating a 3D depth effect.
- **Spring-Based Motion:** Use `maath` or `GSAP` for smooth, damped movements that avoid abrupt stops.
- **Focus Points:** The DOF focal point dynamically shifts based on the current active hotspot.

## 3. Optimization Strategy (The 60 FPS Target)
High fidelity must not compromise performance.

### GPU & Memory
- **Texture Compression:** Use KTX2 or Basis Universal textures to reduce GPU VRAM usage.
- **Geometry Optimization:** Use `InstancedMesh` for repetitive architectural elements.
- **LOD (Level of Detail):** Implement simplified meshes for distant views.

### Adaptive Quality
The system detects GPU capabilities and adjusts:
- **High:** Full Bloom, DOF, High-res textures, 2x DPR.
- **Medium:** Reduced Bloom, No DOF, Med-res textures, 1x DPR.
- **Low:** No post-processing, Low-res textures, 1x DPR, simplified lighting.

## 4. Fallback Mode
For devices that cannot support WebGL2 or have extreme memory constraints:
- Replace the 3D canvas with a high-resolution sequence of pre-rendered images (cinemagraph).
- Disable all post-processing.
- Use a static `PerspectiveCamera` with no interaction.
