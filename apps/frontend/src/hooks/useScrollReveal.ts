'use client';

import { useCallback, useMemo, useState, useEffect, type RefCallback } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';
import { useHEXAMotion } from './useHEXAMotion';
import type { Transition, Variants } from 'framer-motion';

/**
 * ScrollRevealConfig — configuration for a single scroll-triggered reveal.
 *
 * All timing/easing sourced from HEXA motion tokens.
 */
export interface ScrollRevealConfig {
  /** Root margin for IntersectionObserver (e.g., '-80px' to trigger earlier). */
  rootMargin?: string;
  /** Thresholds at which to fire (0–1). */
  threshold?: number | number[];
  /** Whether to trigger only once. */
  once?: boolean;
  /** Custom transition, or use token-based `makeTransition`. */
  transition?: Transition;
  /** Initial animation state. */
  initial?: Variants['hidden'];
  /** Visible animation state (can be a function receiving `reduced`). */
  visible?: Variants['visible'];
  /** Exit animation state. */
  exit?: Variants['exit'];
}

/**
 * ScrollRevealState — reactive state returned by the reveal hook.
 */
export interface ScrollRevealState {
  /** Ref callback to attach to the target element. */
  ref: RefCallback<HTMLElement>;
  /** Whether the element has ever intersected. */
  hasRevealed: boolean;
  /** Whether currently intersecting. */
  isIntersecting: boolean;
  /** Intersection ratio (0–1). */
  ratio: number;
  /** Variants object ready for Framer Motion `variants` prop. */
  variants: Variants;
  /** Current reduced-motion state. */
  reduced: boolean;
}

/**
 * Default reveal variants — fade + lift.
 */
const defaultRevealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
};

/**
 * useScrollReveal — Deep module for scroll-triggered entrance animations.
 *
 * Interface: 1 hook call → returns ref + Framer Motion variants + state.
 * Implementation: IntersectionObserver + HEXA motion tokens + reduced-motion gating.
 *
 * Replaces per-component `initial`/`whileInView`/`viewport` props with a single
 * declarative configuration. All timing lives in `@/lib/motion`.
 *
 * @example
 * ```tsx
 * const { ref, variants, hasRevealed } = useScrollReveal({
 *   rootMargin: '-100px',
 *   once: true,
 * });
 * return <motion.div ref={ref} variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true }} />;
 * ```
 */
export function useScrollReveal(config: ScrollRevealConfig = {}): ScrollRevealState {
  const {
    rootMargin = '-80px',
    threshold = 0,
    once = true,
    initial = defaultRevealVariants.hidden,
    visible: visibleConfig,
    exit = defaultRevealVariants.exit,
  } = config;

  const { reduced, withReduced } = useHEXAMotion();
  const [hasRevealed, setHasRevealed] = useState(false);

  // Build variants once per reduced-motion change
  const variants = useMemo((): Variants => {
    const baseVariants: Variants = {
      hidden: initial,
      visible: typeof visibleConfig === 'function'
        ? visibleConfig
        : (visibleConfig ?? defaultRevealVariants.visible),
      exit,
    };
    return reduced ? withReduced(baseVariants) : baseVariants;
  }, [reduced, initial, visibleConfig, exit, withReduced]);

  // IntersectionObserver hook
  const { ref, isIntersecting, entry } = useIntersectionObserver({
    rootMargin,
    threshold,
    once,
  });

  // Track hasRevealed state
  useEffect(() => {
    if (isIntersecting && !hasRevealed) {
      setHasRevealed(true);
    }
  }, [isIntersecting, hasRevealed]);

  return {
    ref,
    hasRevealed,
    isIntersecting,
    ratio: entry?.intersectionRatio ?? 0,
    variants,
    reduced,
  };
}

/**
 * useStaggeredReveal — Creates a parent variant that staggers multiple children.
 *
 * Each child gets a `fadeLift` variant with incremental delay.
 *
 * @example
 * ```tsx
 * const { ref, variants, childrenVariants } = useStaggeredReveal(3, { stagger: 0.08 });
 * return (
 *   <motion.div ref={ref} variants={variants}>
 *     {items.map((item, i) => (
 *       <motion.div key={item.id} variants={childrenVariants(i)}>{item.content}</motion.div>
 *     ))}
 *   </motion.div>
 * );
 * ```
 */
export function useStaggeredReveal(
  childCount: number,
  options: { stagger?: number; delayChildren?: number; rootMargin?: string } = {}
): {
  ref: RefCallback<HTMLElement>;
  variants: Variants;
  childVariants: (index: number) => Variants;
  hasRevealed: boolean;
} {
  const { stagger = 0.05, delayChildren = 0, rootMargin = '-80px' } = options;
  const { reduced, withReduced } = useHEXAMotion();
  const [hasRevealed, setHasRevealed] = useState(false);

  const { ref, isIntersecting } = useIntersectionObserver({ rootMargin, once: true });

  useEffect(() => {
    if (isIntersecting && !hasRevealed) setHasRevealed(true);
  }, [isIntersecting, hasRevealed]);

  const parentVariants = useMemo((): Variants => {
    const base = {
      hidden: {},
      visible: { transition: { staggerChildren: stagger, delayChildren } },
    };
    return reduced ? withReduced(base) : base;
  }, [reduced, stagger, delayChildren, withReduced]);

  const childVariants = useCallback((index: number): Variants => {
    const base = {
      hidden: { opacity: 0, y: 24 },
      visible: (_custom?: unknown) =>
        reduced
          ? { opacity: 1, y: 0, transition: { duration: 0.01 } }
          : { opacity: 1, y: 0, transition: { duration: 0.4, delay: index * stagger } },
      exit: { opacity: 0, y: 24, transition: { duration: 0.25 } },
    };
    return base;
  }, [reduced, stagger]);

  return { ref, variants: parentVariants, childVariants, hasRevealed };
}

/**
 * useScrollRevealSync — Synchronizes multiple reveals to a shared scroll position.
 *
 * Useful when you want several elements to animate in lockstep as the page scrolls,
 * e.g., a chapter label + headline + body text that should enter together.
 *
 * @example
 * ```tsx
 * const { ref, progress, createVariant } = useScrollRevealSync({
 *   rootMargin: '-100px',
 *   threshold: [0, 0.25, 0.5, 0.75, 1],
 * });
 * return (
 *   <>
 *     <motion.div ref={ref} style={{ opacity: progress }} />
 *     <motion.div variants={createVariant({ y: [50, 0] })} />
 *   </>
 * );
 * ```
 */
export function useScrollRevealSync(config: {
  rootMargin?: string;
  threshold?: number[];
} = {}) {
  const { reduced } = useHEXAMotion();
  const [entry, setEntry] = useState<ReturnType<typeof useIntersectionObserver>['entry']>(null);

  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: config.rootMargin ?? '-80px',
    threshold: config.threshold ?? [0, 0.25, 0.5, 0.75, 1],
  });

  useEffect(() => {
    setEntry(entry);
  }, [entry]);

  const progress = entry?.intersectionRatio ?? (isIntersecting ? 1 : 0);

  const createVariant = useCallback(
    (customVariants: Record<string, Variants[keyof Variants]>): Variants => {
      const baseVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: reduced ? { duration: 0.01 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
        ...customVariants,
      };
      if (!reduced) return baseVariants;

      // Only handle known variant keys to satisfy TypeScript
      const reducedVariants: Variants = {};
      const variantKeys = ['hidden', 'visible', 'exit'] as const;
      for (const key of variantKeys) {
        const value = baseVariants[key];
        if (value !== undefined) {
          if (typeof value === 'function') {
            // Framer Motion variant functions accept a `custom` parameter
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reducedVariants[key] = (value as any)(true);
          } else if (value !== undefined) {
            reducedVariants[key] = { ...(value as Record<string, unknown>), transition: { duration: 0.01 } };
          }
        }
      }
      return reducedVariants;
    },
    [reduced]
  );

  return { ref, progress, isIntersecting, createVariant };
}