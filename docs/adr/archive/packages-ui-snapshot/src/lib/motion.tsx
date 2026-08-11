'use client';

import { motion, MotionConfig, type Transition, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * HEXA STUDIO Motion System — packages/ui
 * Pure Framer Motion primitives (framer-motion is a declared dependency).
 * Lenis smooth-scroll lives in the frontend app (see smooth-scroll-provider)
 * where `lenis` is already declared — keeping this package dependency-clean.
 */

/** Luxury cinematic slow-out curve — mirrors `--motion-curve-luxury` token. */
export const LUXURY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Standard motion durations mapped to the design-token motion scale. */
export const motionTransitions = {
  fast: { duration: 0.3, ease: LUXURY_EASE },
  medium: { duration: 0.6, ease: LUXURY_EASE },
  slow: { duration: 1, ease: LUXURY_EASE },
} satisfies Record<string, Transition>;

/**
 * MotionFoundation — wraps the app in a global motion configuration.
 * Respects the user's reduced-motion preference at the platform level.
 */
export function MotionFoundation({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={motionTransitions.medium}>
      {children}
    </MotionConfig>
  );
}

/**
 * CinematicReveal — scroll-triggered entrance reveal.
 * `y` defaults to 24px; respects viewport `once` semantics for editorials.
 */
export function CinematicReveal({
  children,
  delay = 0,
  y = 24,
  once = true,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ ...motionTransitions.medium, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: LUXURY_EASE },
  },
};

/** StaggerGroup — orchestrates sequential child reveals (nav, lists, grids). */
export function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** StaggerItem — a single reveal child, used inside <StaggerGroup>. */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/** PageTransition — cinematic route-level transition (paired with AnimatePresence). */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={motionTransitions.medium}
    >
      {children}
    </motion.div>
  );
}
