# Motion System

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Motion Philosophy

Motion is not "decoration"; it is **Communication**. Every animation must serve a purpose: guiding the eye, indicating state, or creating a feeling of luxury.

## The "Cinematic" Standard

All animations must feel "handcrafted." We avoid linear motions and default easing.

### 1. Easing (The Secret to Luxury)
We use **Custom Cubic Beziers** to create organic, high-end movement.

| Type | Curve | Feel | Use Case |
|------|-------|------|-----------|
| **Entrance** | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth, decelerating | Page loads, Hero entrance |
| **Interaction** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, playful | Button hover, Tooltips |
| **Transition** | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Balanced | Modal opens, Page slides |
| **Sharp** | `cubic-bezier(0.4, 0, 0.6, 1)` | Fast, precise | Error messages, toggles |

### 2. Timing & Duration

| Element | Duration | Stagger | Note |
|----------|----------|----------|------|
| Micro-interactions | 150ms - 300ms | 0ms | Must feel instant |
| Component transitions | 300ms - 500ms | 50ms | Smooth shift |
| Page transitions | 600ms - 900ms | 100ms | Cinematic feel |
| 3D Camera moves | 1s - 2s | 0ms | Avoid motion sickness |

## Motion Patterns

### The "Cascading Reveal"
Elements should not appear all at once. Use a stagger effect:
- Element 1 (T=0)
- Element 2 (T=100ms)
- Element 3 (T=200ms)

### Parallax & Depth
Use subtle parallax to create a 3D feel on 2D pages:
- Background moves at 0.2x speed.
- Midground moves at 0.5x speed.
- Foreground moves at 1.0x speed.

### The "Surgical" Hover
Avoid jarring changes. Use transitions for:
- `opacity`
- `transform: scale()`
- `box-shadow`
- `border-color`

## 3D Motion Guidelines

1. **Damped Movement:** Use `lerp` or `damping` for camera movements to avoid robotic stops.
2. **Avoid "Jump Cuts":** Always animate the transition between two camera positions.
3. **Scale-in:** New 3D objects should scale from 0 to 1 with a spring effect.
4. **Rotation:** Use slow, constant rotation for showcase objects.

## Performance & Accessibility

- **GPU Acceleration:** Only animate `transform` and `opacity`.
- **Reduced Motion:** If `prefers-reduced-motion: reduce` is true, disable all non-essential animations.
- **FPS Lock:** Ensure animations don't drop the frame rate below 60 FPS.
