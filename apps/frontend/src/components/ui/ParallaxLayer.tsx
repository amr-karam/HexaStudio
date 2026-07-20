'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ParallaxLayerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Parallax intensity, 0–1.
   * 0 = fully static (no movement).
   * 1 = moves with the full scroll range.
   * Defaults to 0.3.
   */
  speed?: number;
  /**
   * 'up' = layer drifts upward as the user scrolls down (foreground feel).
   * 'down' = layer drifts downward as the user scrolls down (background feel).
   * Defaults to 'up'.
   */
  direction?: 'up' | 'down';
}

/**
 * ParallaxLayer — a scroll-driven depth wrapper that translates its content
 * against the page scroll, producing the layered, cinematic depth that defines
 * high-end architecture visualization sites.
 *
 * Driven by Framer Motion's `useScroll` + `useTransform`, so it is GPU-friendly
 * and never thrashes layout. Accessibility: under reduced-motion the layer
 * renders fully static — no transforms, no listeners.
 */
export const ParallaxLayer = ({
  children,
  className,
  speed = 0.3,
  direction = 'up',
}: ParallaxLayerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const clampedSpeed = Math.min(Math.max(speed, 0), 1);
  // 200px of travel at full intensity — pronounced but never nauseating.
  const distance = 200 * clampedSpeed;
  const sign = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [sign * -distance, sign * distance]);

  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
};
