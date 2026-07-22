'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';

interface MagneticProps {
  children: React.ReactNode;
  /**
   * Pull strength as a 0–1 multiplier of the cursor's distance from the
   * element centre. `0.3` is the HEXA luxury default — a confident pull
   * that still lets the spring settle before the click.
   */
  strength?: number;
  className?: string;
}

/**
 * Magnetic — tactile "snap" that pulls an interactive element toward the
 * cursor while hovered, then springs back to rest on leave.
 *
 * Motion-value based: pointer movement never triggers a React re-render —
 * only the spring-driven transform updates (60 FPS, GPU-composited).
 *
 * Accessibility: disabled when the user prefers reduced motion, when
 * animations are paused via the motion policy, or on coarse (touch)
 * pointers — in all cases it renders as a plain inline-block wrapper.
 */
export const Magnetic = ({ children, strength = 0.3, className }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { animationsEnabled, finePointer } = useMotionPolicy();
  const isDisabled = !finePointer || !animationsEnabled;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDisabled || !ref.current) return;

    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isDisabled) {
    return <div className={cn('inline-block', className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
};
