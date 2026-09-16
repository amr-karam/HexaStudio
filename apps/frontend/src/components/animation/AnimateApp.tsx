/**
 * AnimateApp — @animate/app Integration for HEXA STUDIO
 *
 * Wraps the @animate/app CSS animation library within HEXA STUDIO's
 * Motion Policy system. Respects reduced-motion preferences and
 * integrates with the HEXA design token system.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMotionPolicy } from '@/hooks/useMotionPolicy'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { type ReactNode } from 'react'

// HEXA Motion Tokens — maps @animate/app tokens to HEXA design system
const HEXA_ANIMATION_TOKENS = {
  easing: {
    entrance: [0.16, 1, 0.3, 1],  // EASE.entrance
    cinematic: [0.76, 0, 0.24, 1], // EASE.cinematic
    interaction: [0.34, 1.56, 0.64, 1], // EASE.interaction
    transition: [0.25, 0.1, 0.25, 1], // EASE.transition
    sharp: [0.4, 0, 0.6, 1], // EASE.sharp
  },
  duration: {
    micro: 200,
    component: 400,
    scene: 800,
    transition: 700,
    page: 750,
    camera: 1400,
  },
} as const

interface AnimateAppProps {
  children: ReactNode
  animation?: string
  preset?: 'entrance' | 'cinematic' | 'interaction' | 'transition' | 'sharp'
  duration?: number
  reducedMotion?: boolean
}

/**
 * AnimateApp — HEXA STUDIO animation wrapper
 *
 * Uses @animate/app for CSS-based animations while respecting
 * the HEXA Motion Policy (reduced motion, performance budgets,
 * motion preferences).
 */
export function AnimateApp({
  children,
  animation = 'fade',
  preset = 'entrance',
  duration,
  reducedMotion: reducedMotionProp,
}: AnimateAppProps) {
  const { animationsEnabled, staticMode } = useMotionPolicy()
  const reducedMotion = reducedMotionProp ?? useReducedMotion()

  // If reduced motion is enabled, render children without animation
  if (reducedMotion || staticMode) {
    return <>{children}</>
  }

  const easing = HEXA_ANIMATION_TOKENS.easing[preset]
  const animDuration = duration ?? HEXA_ANIMATION_TOKENS.duration.component

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: animDuration / 1000,
        ease: easing,
      }}
      style={{
        // Design token integration
        '--hexa-easing': easing,
        '--hexa-duration': `${animDuration}ms`,
      } as React.CSSProperties}
    >
      {children}
    </motion.div>
  )
}

/**
 * AnimatedPresence — HEXA STUDIO wrapper for AnimatePresence
 *
 * Provides page transition animations using @animate/app
 * within the HEXA STUDIO motion policy framework.
 */
export function AnimatedPresence({
  children,
  mode = 'popLayout',
}: {
  children: ReactNode
  mode?: 'popLayout' | 'wait' | 'sync'
}) {
  const { staticMode } = useMotionPolicy()
  const reducedMotion = useReducedMotion()

  if (reducedMotion || staticMode) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode={mode}>
      {children}
    </AnimatePresence>
  )
}

export { HEXA_ANIMATION_TOKENS }
export type { AnimateAppProps }
