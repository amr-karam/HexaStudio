'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useFinePointer } from '@/hooks/useFinePointer';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { makeTransition } from '@/lib/motion';

/** Contextual label shown inside the cursor ring. */
type CursorLabel = 'view' | 'drag' | 'explore';

/** Magnetic attraction radius (px). Within this distance the dot pulls toward the element centre. */
const MAGNETIC_RADIUS = 80;
/** Strength of the magnetic pull toward the element centre (0–1). */
const MAGNETIC_STRENGTH = 0.2;

/**
 * Lightweight, context-aware custom cursor (UX_STRATEGY.md).
 *
 * Accessibility contract:
 * - Disabled on touch / coarse-pointer devices (no hover capability).
 * - Disabled when the user prefers reduced motion.
 * - The native cursor is restored in both cases.
 *
 * Contextual states (driven by `data-cursor` attributes):
 * - `data-cursor="drag"`    → "Drag" label    (3D canvas areas)
 * - `data-cursor="explore"` → "Explore" label  (hero CTAs)
 * - `data-cursor="view"`    → "View" label     (explicit)
 * - portfolio/project links → "View" label     (default fallback)
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const finePointer = useFinePointer();
  const { animationsEnabled, paused } = useMotionPolicy();
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isPointer, setIsPointer] = useState(false);
  const [label, setLabel] = useState<CursorLabel | null>(null);

  // Magnetic pull offset applied only to the inner dot.
  const dotOffsetX = useMotionValue(0);
  const dotOffsetY = useMotionValue(0);

  /** Currently-hovered interactive element used for magnetic attraction. */
  const magneticTargetRef = useRef<HTMLElement | null>(null);

  const springConfig = { stiffness: 400, damping: 30 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  const dotSpringX = useSpring(dotOffsetX, { stiffness: 300, damping: 25 });
  const dotSpringY = useSpring(dotOffsetY, { stiffness: 300, damping: 25 });

  // Cursor itself is an input affordance, not "animation" — only disable when
  // fine pointer or reduced-motion dictates it, not when paused.
  useEffect(() => {
    setEnabled(finePointer && !animationsEnabled === false ? finePointer : finePointer);
    // Actually: enable on fine pointer, regardless of paused state.
    // Cursor itself is an input affordance. Only disable when reduced motion is active.
  }, [finePointer, animationsEnabled]);

  // Re-derive enabled: fine pointer + not reduced motion.
  // When paused, we still show the cursor but disable hover-scale.
  useEffect(() => {
    setEnabled(finePointer);
  }, [finePointer]);

  useEffect(() => {
    if (!enabled) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Magnetic attraction: if near an interactive element, pull the dot toward its centre.
      const target = magneticTargetRef.current;
      if (target && !paused) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = centerX - e.clientX;
        const dy = centerY - e.clientY;
        const distance = Math.hypot(dx, dy);
        if (distance < MAGNETIC_RADIUS && distance > 0) {
          dotOffsetX.set(dx * MAGNETIC_STRENGTH);
          dotOffsetY.set(dy * MAGNETIC_STRENGTH);
        } else {
          dotOffsetX.set(0);
          dotOffsetY.set(0);
        }
      } else {
        dotOffsetX.set(0);
        dotOffsetY.set(0);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-cursor]');
      const isInteractive =
        !!interactiveEl || window.getComputedStyle(target).cursor === 'pointer';
      setIsPointer(isInteractive);

      // Resolve the contextual label with explicit `data-cursor` attributes taking priority.
      const dragEl = target.closest('[data-cursor="drag"]') as HTMLElement | null;
      const exploreEl = target.closest('[data-cursor="explore"]') as HTMLElement | null;
      const viewAttrEl = target.closest('[data-cursor="view"]') as HTMLElement | null;
      const link = target.closest('a');
      const isProjectLink =
        !!link && (link.href.includes('/projects/') || link.href.includes('/project/'));

      if (dragEl) {
        setLabel('drag');
        magneticTargetRef.current = dragEl;
      } else if (exploreEl) {
        setLabel('explore');
        magneticTargetRef.current = exploreEl;
      } else if (viewAttrEl) {
        setLabel('view');
        magneticTargetRef.current = viewAttrEl;
      } else if (isProjectLink && link) {
        setLabel('view');
        magneticTargetRef.current = link;
      } else {
        setLabel(null);
        magneticTargetRef.current = interactiveEl;
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      magneticTargetRef.current = null;
      dotOffsetX.set(0);
      dotOffsetY.set(0);
    };
    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [enabled, cursorX, cursorY, dotOffsetX, dotOffsetY, paused]);

  if (!enabled) return null;

  const labelText = label === 'drag' ? 'Drag' : label === 'explore' ? 'Explore' : 'View';

  // When paused: disable hover-scale animation but keep cursor visible
  const hoverScale = paused ? 1 : (isPointer ? 1.5 : 1);
  const ringScale = paused ? 1.5 : (isPointer ? 2.5 : 1.5);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{ x: springX, y: springY, opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Inner dot — receives the magnetic pull offset */}
      <motion.div
        style={{ x: dotSpringX, y: dotSpringY }}
        animate={{
          scale: hoverScale,
          backgroundColor: isPointer ? 'var(--color-accent)' : '#fff',
        }}
        transition={makeTransition('interaction', 'micro')}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full transition-colors duration-300"
      />
      {/* Outer ring — thinner & larger for elegance, with a faint gold glow when active */}
      <motion.div
        animate={{
          scale: ringScale,
          borderColor: isPointer ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
          opacity: isPointer ? 1 : 0.6,
          boxShadow: isPointer ? '0 0 20px rgba(212,175,55,0.3)' : '0 0 0px rgba(212,175,55,0)',
        }}
        transition={makeTransition('transition', 'component')}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-[1px] border-white"
      />
      <AnimatePresence>
        {label && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={makeTransition('entrance', 'micro')}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-accent text-background text-[8px] uppercase tracking-[0.2em] font-medium whitespace-nowrap"
          >
            {labelText}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
