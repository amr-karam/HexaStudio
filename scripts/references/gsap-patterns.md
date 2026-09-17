# GSAP Animation Patterns

Common GSAP + ScrollTrigger patterns used across the HEXA STUDIO project.

## 1. Basic Entrance Animation

```tsx
'use client'
import { useEffect, useRef } from 'react';
import { getGsap } from '@/lib/gsap';

export function Entrance({ children }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gsap = getGsap();
    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: '--hexa-ease-entrance',
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

## 2. ScrollTrigger Reveal

```tsx
'use client'
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getGsap } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

export function ScrollReveal({ children }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gsap = getGsap();
    gsap.from(el, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: '--hexa-ease-entrance',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play none none reverse',
      },
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

## 3. Staggered List Entrance

```tsx
'use client'
import { useEffect, useRef } from 'react';
import { getGsap } from '@/lib/gsap';

export function StaggerList({ items }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gsap = getGsap();
    const ctx = gsap.context(() => {
      gsap.from('.stagger-item', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: '--hexa-ease-entrance',
      });
    }, el);
    return () => ctx.revert();
  }, [items]);

  return (
    <div ref={ref}>
      {items.map((item, i) => (
        <div key={i} className="stagger-item">{item}</div>
      ))}
    </div>
  );
}
```

## 4. Timeline Sequence

```tsx
'use client'
import { useEffect, useRef } from 'react';
import { getGsap } from '@/lib/gsap';

export function TimelineSequence() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gsap = getGsap();
    const ctx = gsap.context(() => {
      gsap.timeline()
        .from('.step-1', { opacity: 0, x: -50, duration: 0.5, ease: '--hexa-ease-entrance' })
        .from('.step-2', { opacity: 0, y: 30, duration: 0.5, ease: '--hexa-ease-entrance' }, '<0.3')
        .from('.step-3', { opacity: 0, scale: 0.9, duration: 0.5, ease: '--hexa-ease-entrance' }, '<0.3');
    }, el);
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>...</div>;
}
```

## 5. Parallax Effect

```tsx
'use client'
import { useEffect, useRef } from 'react';
import { getGsap } from '@/lib/gsap';

export function ParallaxSection({ children }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gsap = getGsap();
    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=500',
          scrub: 1,
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

## 6. Pin & Scrub (Story Scroll Pattern)

```tsx
'use client'
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getGsap } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

export function PinScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gsap = getGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=800',
          scrub: 1,
          pin: true,
        },
      });
      tl.to(el, { scale: 0.8, duration: 1 })
        .to(el, { borderRadius: '20px', duration: 1 }, '<')
        .to(el, { scale: 1, duration: 1 });
    }, el);
    return () => ctx.revert();
  }, []);

  return <div ref={ref}>...</div>;
}
```

## 7. Morphing Shape

```tsx
'use client'
import { useEffect, useRef } from 'react';
import { getGsap } from '@/lib/gsap';

export function MorphShape() {
  const ref = useRef<SVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gsap = getGsap();
    const ctx = gsap.context(() => {
      gsap.to(el, {
        attr: { d: 'M10 10 C40 10, 40 40, 10 40' },
        duration: 1,
        ease: '--hexa-ease-cinematic',
        scrollTrigger: {
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return <svg ref={ref} viewBox="0 0 50 50">...</svg>;
}
```

## Cleanup Pattern

Always clean up GSAP contexts to prevent memory leaks:

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // ... animations
  }, containerRef);
  return () => ctx.revert(); // Cleans up all ScrollTriggers and tweens
}, []);
```

## Best Practices

1. **Always use `getGsap()`** — never import gsap directly in components
2. **Always use `gsap.context()`** — scopes animations to DOM elements
3. **Always call `ctx.revert()`** — prevents memory leaks on unmount
4. **Register ScrollTrigger once** — at module level, not inside useEffect
5. **Guard `containerRef.current`** — check before creating animations
6. **Use design tokens** — `--hexa-ease-*` and `--hexa-duration-*`
7. **Respect reduced motion** — check `useReducedMotion()` hook
8. **Use `scrub: 1`** — for smooth scroll-linked animations
