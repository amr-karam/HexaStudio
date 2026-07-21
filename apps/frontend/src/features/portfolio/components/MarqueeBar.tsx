'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { REDUCED_TRANSITION } from '@/lib/motion';

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

/**
 * MarqueeBar — An infinite horizontal scroll of notable brand names.
 * Serves as social proof: "Trusted by the industry's leading publications."
 *
 * - Disabled for reduced-motion users (static centered layout instead).
 * - Also paused when user has toggled animations off via motion policy.
 * - Pauses on hover and focus-visible (WCAG 2.2.2 Pause, Stop, Hide).
 *
 * NOTE: The linear easing for seamless loop is an explicit ambient-loop exception.
 */
export const MarqueeBar = () => {
  const { staticMode, paused } = useMotionPolicy();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const isStatic = staticMode || paused || isHovered || isFocusWithin;

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleFocus = useCallback(() => setIsFocusWithin(true), []);
  const handleBlur = useCallback(() => setIsFocusWithin(false), []);

  if (isStatic) {
    return (
      <section
        className="py-16 bg-surface border-y border-border/20 overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
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

        <motion.div
          className="flex gap-16 w-max"
          animate={isStatic ? { x: '0%' } : { x: ['0%', '-50%'] }}
          transition={
            isStatic
              ? REDUCED_TRANSITION
              : {
                  x: {
                    duration: 40,
                    ease: 'linear', // Explicit ambient-loop exception
                    repeat: Infinity,
                  },
                }
          }
        >
          {/* Two copies for seamless loop */}
          {[...brands, ...brands].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-sm text-neutral-600 hover:text-neutral-300 tracking-[0.3em] uppercase font-light transition-colors duration-500 whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
