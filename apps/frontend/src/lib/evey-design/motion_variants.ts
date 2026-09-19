/**
 * motion_variants — HEXA STUDIO Motion Variant Generation
 *
 * Generates Framer Motion variant configs sourced from the verified
 * HEXA motion system in `src/lib/motion.ts`.
 *
 * @module evey-design/motion_variants
 */

import { EASE, DURATION, STAGGER, REDUCED_TRANSITION, staggerContainer } from '../motion'
import type { Variants, Transition } from 'framer-motion'

/* -------------------------------------------------------------------------- */
/*  Types                                                                    */
/* -------------------------------------------------------------------------- */

export interface MotionVariantOptions {
  /** Easing preset name from EASE */
  ease?: keyof typeof EASE
  /** Duration preset name from DURATION */
  duration?: keyof typeof DURATION
  /** Stagger delay in seconds */
  staggerDelay?: number
  /** Whether to respect reduced motion */
  reducedMotion?: boolean
  /** Additional delay before animation starts */
  delay?: number
  /** Repeat count (0 = no repeat) */
  repeat?: number | 'infinity'
  /** Repeat type */
  repeatType?: 'loop' | 'reverse' | 'mirror'
  /** Animation direction */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
}

export interface MotionVariantResult {
  /** Framer Motion variants object */
  variants: Variants
  /** Transition configuration */
  transition: Transition
  /** Reduced motion transition */
  reducedTransition: Transition
  /** Animation key for identification */
  key: string
  /** Metadata about the generated variant */
  meta: {
    ease: string
    duration: number
    stagger: number
  }
}

/* -------------------------------------------------------------------------- */
/*  Variant Generators                                                         |
/* -------------------------------------------------------------------------- */

/**
 * Generate a fade + lift entrance variant (hero text, section headers).
 */
export function motion_variants_fadeLift(options: MotionVariantOptions = {}): MotionVariantResult {
  const { ease = 'entrance', duration = 'component', staggerDelay = 0, reducedMotion = false, delay = 0 } = options

  const transition = makeTransition(ease, duration, delay)

  const variants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (isReduced: boolean) =>
      isReduced || reducedMotion
        ? { opacity: 1, y: 0, transition: REDUCED_TRANSITION }
        : { opacity: 1, y: 0, transition },
    exit: { opacity: 0, y: 24, transition: { duration: 0.25 } },
  }

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'fadeLift',
    meta: { ease, duration: DURATION[duration], stagger: staggerDelay },
  }
}

/**
 * Generate a scale-spring variant (3D showcase objects).
 */
export function motion_variants_scaleSpring(options: MotionVariantOptions = {}): MotionVariantResult {
  const { ease = 'interaction', duration = 'component', reducedMotion = false } = options

  const transition = makeTransition(ease, duration, 0)

  const variants: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: (isReduced: boolean) =>
      isReduced || reducedMotion
        ? { opacity: 1, scale: 1, transition: REDUCED_TRANSITION }
        : { opacity: 1, scale: 1, transition },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  }

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'scaleSpring',
    meta: { ease, duration: DURATION[duration], stagger: 0 },
  }
}

/**
 * Generate a masked text reveal variant.
 */
export function motion_variants_textReveal(options: MotionVariantOptions = {}): MotionVariantResult {
  const { ease = 'entrance', duration = 'page', reducedMotion = false } = options

  const transition = makeTransition(ease, duration, 0)

  const variants: Variants = {
    hidden: { y: '110%' },
    visible: (isReduced: boolean) =>
      isReduced || reducedMotion
        ? { y: '0%', transition: REDUCED_TRANSITION }
        : { y: '0%', transition },
    exit: { y: '110%', transition: { duration: 0.3 } },
  }

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'textReveal',
    meta: { ease, duration: DURATION[duration], stagger: 0 },
  }
}

/**
 * Generate an overlay/modal entrance variant.
 */
export function motion_variants_overlay(options: MotionVariantOptions = {}): MotionVariantResult {
  const { ease = 'transition', duration = 'transition', reducedMotion = false } = options

  const transition: Transition = { duration: 0.4, ease: EASE[ease] }

  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: (isReduced: boolean) =>
      isReduced || reducedMotion
        ? { opacity: 1, transition: REDUCED_TRANSITION }
        : { opacity: 1, transition },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'overlay',
    meta: { ease, duration: DURATION[duration], stagger: 0 },
  }
}

/**
 * Generate a modal panel variant.
 */
export function motion_variants_modalPanel(options: MotionVariantOptions = {}): MotionVariantResult {
  const { ease = 'transition', duration = 'page', reducedMotion = false } = options

  const transition = makeTransition(ease, duration, 0)

  const variants: Variants = {
    hidden: { opacity: 0, scale: 0.94, y: 16 },
    visible: (isReduced: boolean) =>
      isReduced || reducedMotion
        ? { opacity: 1, scale: 1, y: 0, transition: REDUCED_TRANSITION }
        : { opacity: 1, scale: 1, y: 0, transition },
    exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.25, ease: EASE.sharp } },
  }

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'modalPanel',
    meta: { ease, duration: DURATION[duration], stagger: 0 },
  }
}

/**
 * Generate a stagger container variant.
 */
export function motion_variants_staggerContainer(
  stagger: number = STAGGER.component,
  delayChildren: number = 0,
): MotionVariantResult {
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  }

  const transition = { staggerChildren: stagger, delayChildren } as Transition

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'staggerContainer',
    meta: { ease: 'entrance', duration: 0, stagger },
  }
}

/**
 * Generate a custom motion variant from options.
 */
export function motion_variants_custom(
  hidden: Variants['hidden'],
  visible: Variants['visible'],
  exit: Variants['exit'],
  options: MotionVariantOptions = {},
): MotionVariantResult {
  const { ease = 'entrance', duration = 'component' } = options

  const transition = makeTransition(ease, duration, options.delay || 0)

  const variants: Variants = {
    hidden,
    visible,
    exit,
  }

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'custom',
    meta: { ease, duration: DURATION[duration], stagger: 0 },
  }
}

/**
 * Generate a hover variant for interactive elements.
 */
export function motion_variants_hover(
  hoverY: number = -4,
  hoverScale: number = 1.02,
): MotionVariantResult {
  const variants: Variants = {
    initial: { y: 0, scale: 1 },
    hover: {
      y: hoverY,
      scale: hoverScale,
      transition: { duration: DURATION.micro, ease: EASE.interaction },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.15 },
    },
  }

  const transition = { duration: DURATION.micro, ease: EASE.interaction }

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'hover',
    meta: { ease: 'interaction', duration: DURATION.micro, stagger: 0 },
  }
}

/**
 * Generate a magnetic hover effect variant.
 */
export function motion_variants_magnetic(stiffness: number = 400, damping: number = 25): MotionVariantResult {
  const variants: Variants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { type: 'spring', stiffness, damping },
    },
  }

  const transition = { type: 'spring', stiffness, damping } as Transition

  return {
    variants,
    transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'magnetic',
    meta: { ease: 'interaction', duration: DURATION.micro, stagger: 0 },
  }
}

/* -------------------------------------------------------------------------- */
/*  Utility Functions                                                          |
/* -------------------------------------------------------------------------- */

/**
 * Build a Framer Motion Transition from EASE + DURATION tokens.
 */
function makeTransition(ease: keyof typeof EASE, duration: keyof typeof DURATION, delay: number): Transition {
  return {
    ease: EASE[ease] as [number, number, number, number],
    duration: DURATION[duration],
    delay,
  }
}

/**
 * Create a stagger container with configurable children timing.
 */
export function motion_variants_stagger(
  staggerDuration: number = STAGGER.component,
  options: MotionVariantOptions = {},
): MotionVariantResult {
  const variants = staggerContainer(staggerDuration, options.delay || 0)
  return {
    variants,
    transition: { staggerChildren: staggerDuration, delayChildren: options.delay || 0 } as Transition,
    reducedTransition: REDUCED_TRANSITION,
    key: 'stagger',
    meta: { ease: 'entrance', duration: 0, stagger: staggerDuration },
  }
}

/**
 * Build a complete animation config object for reuse.
 */
export function buildMotionConfig(
  initial: Variants['hidden'],
  animate: Variants['visible'],
  exit: Variants['exit'],
  options: MotionVariantOptions = {},
): MotionVariantResult {
  return motion_variants_custom(initial, animate, exit, options)
}

/**
 * Chain multiple variants together for complex sequences.
 */
export function chainVariants(
  ...variantResults: MotionVariantResult[]
): MotionVariantResult[] {
  return variantResults
}

/**
 * Generate a motion variant by name.
 *
 * @param preset - The motion preset to generate
 * @param options - Motion variant options
 * @returns MotionVariantResult with variants and transition
 *
 * @example
 * ```ts
 * const result = motion_variants('fadeLift', { ease: 'entrance', duration: 'component' })
 * ```
 */
export function motion_variants(
  preset: 'fadeLift' | 'scaleSpring' | 'textReveal' | 'overlay' | 'modalPanel' | 'hover' | 'magnetic',
  options?: MotionVariantOptions,
): MotionVariantResult {
  switch (preset) {
    case 'fadeLift': return motion_variants_fadeLift(options)
    case 'scaleSpring': return motion_variants_scaleSpring(options)
    case 'textReveal': return motion_variants_textReveal(options)
    case 'overlay': return motion_variants_overlay(options)
    case 'modalPanel': return motion_variants_modalPanel(options)
    case 'hover': return motion_variants_hover()
    case 'magnetic': return motion_variants_magnetic()
  }
}
