'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EASE, DURATION } from '@/lib/motion';

interface ScrollFadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Reusable scroll-triggered reveal. Sources easing/duration from the HEXA
 * motion system. Reduced motion is handled globally by `MotionConfig` in
 * AppProviders (transform collapses to opacity-only).
 */
export function ScrollFadeIn({ children, className, delay = 0 }: ScrollFadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: DURATION.component, delay, ease: EASE.entrance }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
