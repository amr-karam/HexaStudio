# 🎞️ MOTION SYSTEM: THE CINEMATIC STANDARD

**Version:** 2026 | **Standard:** Elite Luxury | **Goal:** Invisible, Purposeful Motion

## 1. THE MOTION PHILOSOPHY
At HEXA Studio, motion is not decoration; it is **communication**. We do not animate to "look cool"; we animate to guide, explain, and evoke emotion.

**The Core Mandative:** Every movement must feel handcrafted and intentional. If an animation does not serve a purpose, it is noise.

---

## 2. MOTION DESIGN PRINCIPLES
Every animation must adhere to these five pillars:
1. **Motion Explains:** Transitions should clarify the relationship between two states.
2. **Motion Guides:** Use motion to lead the user's eye to the most important content.
3. **Motion Reinforces Hierarchy:** More significant changes in state deserve more prominent motion.
4. **Motion Provides Feedback:** Every interaction must have a tactile, visual response.
5. **Motion Creates Emotion:** Use timing and easing to evoke luxury, stability, and prestige.

---

## 3. ANIMATION QUALITY & EXECUTION

### I. The "Natural" Feel
- **Easing:** Strictly forbid linear timing. Use professional cubic-beziers (`power3.out`, `expo.out`) to simulate real-world physics.
- **Timing:**
  - Micro-interactions: 200ms - 400ms.
  - UI Transitions: 500ms - 800ms.
  - Cinematic Camera Moves: 1200ms - 2000ms.
- **Responsive Timing:** Animations must adapt to the user's device performance.

### II. Technical Implementation (The "Performance" Law)
- **GPU Acceleration:** Use `transform` and `opacity` exclusively. Avoid animating `width`, `height`, `top`, `left` to prevent layout thrashing.
- **60 FPS Guarantee:** Any animation that drops the frame rate below 60 FPS must be optimized or removed.
- **Will-Change:** Use `will-change` strategically to hint the browser about upcoming animations.
- **Lazy Loading:** Animations should only trigger when they enter the viewport.

---

## 4. THE "ELITE" MOTION CHECKLIST
Before committing any motion work, audit the result:
- [ ] **Purpose:** Does this animation explain, guide, or provide feedback?
- [ ] **Fluidity:** Is the easing natural or does it feel robotic?
- [ ] **Rhythm:** Is there a balance between movement and stillness?
- [ ] **Performance:** Does it maintain 60 FPS on mid-range devices?
- [ ] **Accessibility:** Does it respect `prefers-reduced-motion`?

*“Stop when the movement feels invisible. Stop when the experience feels exceptional.”*
