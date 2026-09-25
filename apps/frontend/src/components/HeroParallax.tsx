'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroParallaxProps {
  children: React.ReactNode;
  /** Max translateY in px (default 60) */
  maxShift?: number;
  /** Scroll range over which the parallax completes (fraction of viewport) */
  range?: number;
}

/**
 * HeroParallax — lightweight scroll-parallax for the hero content.
 *
 * Applies a subtle translateY to `children` as the user scrolls from the
 * hero top to `range * 100%` of viewport height. Runs on rAF, detached
 * on unmount. No dependencies beyond React.
 */
export function HeroParallax({
  children,
  maxShift = 60,
  range = 1.2,
}: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const start = viewportH * 0.9;
        const end = viewportH * range;
        const raw = (start - rect.top) / (start - end);
        const clamped = Math.max(0, Math.min(1, raw));
        setShift(clamped * maxShift);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [maxShift, range]);

  return (
    <div
      ref={containerRef}
      className="relative z-10"
      style={{ transform: `translateY(${shift}px)`, willChange: 'transform' }}
    >
      {children}
    </div>
  );
}
