# UI Standards

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Design Philosophy

The HEXA Studio UI is designed to be **Invisible yet Impactful**. The interface should never compete with the architectural visualization; it should frame it. We use a "Luxury-Minimalist" aesthetic characterized by high contrast, ample white space, and precise alignment.

## Visual Language

### 1. Color Palette
We use a restricted palette to ensure focus on the 3D content.
- **Primary:** Deep Obsidian (#0A0A0A) — Foundation and depth.
- **Secondary:** Pure White (#FFFFFF) — Clarity and contrast.
- **Accent:** Gold/Champagne (#C5A059) — Luxury, highlights, and CTAs.
- **Neutrals:** Scale of grays from #1A1A1A to #F5F5F5.

### 2. Typography
Typography is used as a structural element.
- **Display:** Serif for headings (e.g., Playfair Display) — evokes tradition and elegance.
- **Body:** Sans-serif for content (e.g., Inter) — ensures readability and modernity.
- **Scale:** Dramatic contrast between H1 (massive) and body text (clean).

### 3. Spacing & Layout
- **The Rule of Air:** Every element must have sufficient breathing room.
- **Grid:** 12-column grid for desktop, 4-column for mobile.
- **Margins:** Large, consistent outer margins (e.g., 80px on desktop) to create a "gallery" feel.
- **Alignment:** Strict adherence to the grid; avoid center-aligning long blocks of text.

## Component Visuals

### Glassmorphism (The "HEXA Look")
Used for overlays, modals, and navigation bars.
- **Background:** `rgba(255, 255, 255, 0.03)` in dark mode.
- **Blur:** `backdrop-filter: blur(12px)`.
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`.

### Depth & Elevation
We avoid heavy drop shadows. Instead, we use:
- **Borders:** Thin, subtle borders to define edges.
- **Layering:** Z-axis transitions (shifting elements upward on hover).
- **Luminance:** Subtle gradients to create a sense of light source.

## UI Quality Gate

Every UI element must be scored on the **Luxury Scale (1-10)**:
- **1-5:** Average/Generic. (Rejected)
- **6-8:** Professional/Clean. (Acceptable for internal tools)
- **9-10:** World-class/Handcrafted. (Required for public-facing la-logs)

Criteria for 10/10:
- [ ] Perfect typography alignment.
- [ ] No "default" browser styles.
- [ ] Subtle, purposeful animations.
- [ ] High contrast and accessibility.
- [ ] Cohesive use of brand colors.
