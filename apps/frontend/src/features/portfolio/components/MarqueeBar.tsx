'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  wrap,
} from 'framer-motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import { velocityToSkew, velocityToSpeedFactor } from '@/lib/motion/scroll-utils';

const brands = [
  'ArchDaily',
  'Dezeen',
  'Architectural Digest',
  'Forbes',
  'Wallpaper*',
  'DesignBoom',
  'Frame',
  'Azure',
  'Interior Design',
  'Surface',
  'Pin-Up',
  'Dwell',
];

/** Idle marquee cadence (px/s). Velocity multiplies this (see scroll-utils). */
const BASE_SPEED_PX_S = 80;

/**
 * MarqueeBar — velocity-reactive infinite brand marquee.
 *
 * animation-addons.com DNA: the track accelerates with |scroll velocity|
 * (up to the token-capped factor) and leans into the scroll direction via
 * `skewX`; a spring settles the skew elastically back to rest when the
 * scroll energy decays (`useScrollVelocity` already decays to 0, so the
 * speed factor relaxes with it).
 *
 * Contract:
 * - `useScrollVelocity` prefers Lenis and falls back to native scroll
 *   deltas, so this works with or without smooth scroll; in static mode the
 *   velocity stays 0 and the static layout renders instead.
 * - Pausing: hover/focus-within FREEZES the track in place (WCAG 2.2.2) —
 *   no layout swap; the policy-level static/paused modes render the plain
 *   centered list instead.
 * - The frame loop is rAF-driven, so it pauses automatically in hidden tabs;
 *   transform-only updates (`x` + `skewX` on the same node, both owned by
 *   framer-motion).
 */
export const MarqueeBar = () => {
  const { staticMode, paused } = useMotionPolicy();
  const velocity = useScrollVelocity();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const isFrozen = isHovered || isFocusWithin;

  const x = useMotionValue(0);
  const copyRef = useRef<HTMLDivElement>(null);
  const [halfWidth, setHalfWidth] = useState(0);

  // Velocity → skew (mapped pure, settled elastically via spring).
  const skewTarget = useTransform(velocity, (v) => velocityToSkew(v));
  const skewX = useSpring(skewTarget, { stiffness: 140, damping: 16, mass: 0.5 });

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleFocus = useCallback(() => setIsFocusWithin(true), []);
  const handleBlur = useCallback(() => setIsFocusWithin(false), []);

  // Wrap width = exactly one copy (each copy carries its own trailing gap).
  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const measure = () => setHalfWidth(el.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (staticMode || paused || isFrozen || halfWidth <= 0) return;
    const speed = BASE_SPEED_PX_S * velocityToSpeedFactor(velocity.get());
    x.set(wrap(-halfWidth, 0, x.get() - (speed * delta) / 1000));
  });

  // Policy static path: plain centered list (reduced motion / user-paused).
  if (staticMode || paused) {
    return (
      <section className="py-16 bg-surface border-y border-border/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-500 mb-8 text-center font-mono">
            Featured In
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {brands.map((name) => (
              <span
                key={name}
                className="text-xs text-neutral-600 tracking-widest uppercase font-light"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 bg-surface border-y border-border/20 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-500 mb-8 text-center font-mono">
        Featured In
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

        <motion.div style={{ x, skewX }} className="flex w-max will-change-transform">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              ref={copy === 0 ? copyRef : undefined}
              aria-hidden={copy === 1}
              className="flex gap-16 pr-16"
            >
              {brands.map((name) => (
                <span
                  key={name}
                  className="text-sm text-neutral-600 hover:text-neutral-300 tracking-[0.3em] uppercase font-light transition-colors duration-500 whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
