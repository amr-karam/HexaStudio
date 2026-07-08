# ⚡ GSAP & MOTION SYSTEM: CINEMATIC INTERACTION

**Version:** 1.0 | **Scope:** Frontend | **Standard:** Fluidity / Intentionality

## 1. THE MOTION PHILOSOPHY
Motion at HEXA Studio is not "animation"; it is **choreography**. Every movement must have a purpose, a start, and a satisfying end. We avoid "bouncy" or "generic" animations in favor of **luxury easing**.

---

## 2. EASING & TIMING (THE LUXURY SCALE)

### I. Forbidden Easings
- **Linear:** Too robotic. Never use for UI elements.
- **Bounce:** Too "cartoony." Only for very specific, playful elements.

### II. The HEXA Signature Easings
- **The "Elegant" Fade:** `power2.out` or `power3.out`. Used for entrances.
- **The "Precise" Slide:** `expo.out`. Used for high-velocity transitions that snap into place.
- **The "Fluid" Flow:** `sine.inOut`. Used for ambient, looping motions.

### III. Duration Standards
- **Micro-interactions (Buttons/Hover):** 0.2s - 0.3s.
- **Page Transitions:** 0.5s - 0.8s.
- **Complex Scene Choreography:** 1.0s - 2.5s.

---

## 3. IMPLEMENTATION PATTERNS

### I. The Timeline Pattern
Never use `gsap.to` in isolation for complex sequences. Always use `gsap.timeline()` to ensure precise control over overlapping animations.
- **Overlapping:** Use the position parameter (e.g., `"-=0.2"`) to create fluid, overlapping movements.

### II. Scroll-Triggered Motion
- **Scrubbing:** Use `scrub: true` or `scrub: 1` for a a "linked to scroll" feel.
- **Pinning:** Pin elements to create immersive, storytelling sections.
- **Avoid Over-Triggering:** Do not animate every single element on scroll; focus on key "anchor" movements.

### III. 3D Integration (GSAP $\rightarrow$ R3F)
- **Ref-Based Animation:** Use `useRef` and animate the Three.js object properties directly via GSAP.
- **Ticking:** Ensure GSAP animations are synchronized with the R3F `useFrame` loop if they affect physics or complex lighting.

---

## 4. PERFORMANCE OPTIMIZATION

### I. GPU Acceleration
- **Will-Change:** Use `will-change: transform` on elements being animated to force GPU acceleration.
- **Transform vs. Top/Left:** Never animate `top`, `left`, `width`, or `height`. Only animate `x`, `y`, `rotation`, and `scale` (CSS Transforms).

### II. Cleanup
Always kill timelines and tweens in the `useEffect` cleanup to prevent memory leaks and "phantom" animations.

---

## 5. QUALITY GATE: MOTION AUDIT
A motion sequence is "Done" only when:
- [ ] The easing feels "expensive" and smooth (no robotic linear movements).
- [ ] There is zero "jank" (stuttering) during the animation.
- [ ] The timing aligns with the user's cognitive load (not too fast to miss, not too slow to bore).
- [ ] The animation is accessible (respects `prefers-reduced-motion`).

*“Motion is the difference between a website and an experience.”*
