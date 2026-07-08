# Animation Standards

**Last Updated:** 2026-07-08

---

## Tool Selection

| Animation Type | Tool | Reason |
|---------------|------|--------|
| Complex timeline sequences | **GSAP** | Timeline control, 3D integration, scroll triggers |
| UI transitions | **Framer Motion** | Declarative, layout animations, exit animations |
| 3D scene animations | **GSAP + R3F** | Fine-grained control over Three.js properties |
| Page transitions | **Framer Motion** | Next.js App Router integration |
| Scroll animations | **GSAP ScrollTrigger** | Most powerful scroll animation library |

## Easing

### Default Easing Curves

```typescript
const easings = {
  default: 'cubic-bezier(0.16, 1, 0.3, 1)',          // Power4 out
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',         // Ease in out
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',        // Spring-like
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',              // Fast in/out
};
```

### Anti-Patterns

```typescript
// ❌ Bad — Linear feels robotic
transition: 'all 300ms linear'

// ✅ Good — Natural feel
transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)'

// ❌ Bad — Generic easing
gsap.to(element, { x: 100, ease: 'power1' })

// ✅ Good — Intentional easing
gsap.to(element, { x: 100, ease: 'power3.out' })
```

## Timing

| Element | Duration | Delay | Easing |
|---------|----------|-------|--------|
| Micro-interaction (hover) | 150ms | 0 | sharp |
| UI transition | 300ms | 0 | default |
| Modal/overlay enter | 400ms | 0 | spring |
| Page transition | 700ms | 0 | default |
| Scroll reveal | 600ms | 100ms stagger | smooth |
| 3D camera move | 1000ms | 0 | default |
| Hero entrance | 1000ms | 200ms stagger | default |

## Stagger Pattern

```typescript
// ✅ Good — Stagger children
gsap.fromTo(children, 
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
);
```

## Reduced Motion

```typescript
// ✅ Good — Check preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  gsap.set(element, { opacity: 1, x: 0, y: 0 }); // Skip animation
} else {
  gsap.fromTo(element, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
}
```

## Framer Motion Guidelines

```typescript
// ✅ Good — Layout animations
<motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}>

// ✅ Good — Enter/exit animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: easings.default }}
>

// ✅ Good — While hover
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
>
```

## GSAP Guidelines

```typescript
// ✅ Good — Scroll-triggered animation with markers for debugging
gsap.fromTo(section,
  { opacity: 0, y: 60 },
  {
    opacity: 1,
    y: 0,
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
    },
  }
);

// ✅ Good — Timeline
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power3.out' } });
tl.from(hero, { opacity: 0, scale: 0.95 })
  .from(heading, { opacity: 0, y: 30 }, '-=0.2')
  .from(subtitle, { opacity: 0, y: 20 }, '-=0.2')
  .from(cta, { opacity: 0, y: 20 }, '-=0.3');
```

## 3D Animation Rules

1. Use `useFrame` from R3F for continuous animations
2. Use GSAP for triggered animations (camera moves, object rotations)
3. Avoid animating materials (expensive)
4. Use `lerp` for smooth value transitions
5. Animate with `ref` objects, not JSX props

```typescript
function RotatingModel() {
  const ref = useRef<Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.5;
  });
  return <mesh ref={ref}><boxGeometry /><meshStandardMaterial /></mesh>;
}
```

## Performance Rules

1. Animate `transform` and `opacity` only (GPU-accelerated)
2. Avoid animating `width`, `height`, `top`, `left` (triggers layout)
3. Use `will-change` sparingly
4. Debounce scroll event listeners
5. Use `requestAnimationFrame` for custom animations
