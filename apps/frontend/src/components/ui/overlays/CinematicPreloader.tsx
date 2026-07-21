'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REDUCED_TRANSITION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * CinematicPreloader — First-visit brand entrance animation.
 *
 * - First-visit only (checks sessionStorage).
 * - Non-blocking: content remains visible beneath.
 * - Short (< 500ms total).
 * - Under reduced motion: skip entirely.
 *
 * This component does NOT fake progress or block content.
 */
export function CinematicPreloader() {
  const [show, setShow] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Skip entirely under reduced motion
    if (reducedMotion) return;

    // First-visit check via sessionStorage
    const hasVisited = sessionStorage.getItem('hexa:visited');
    if (hasVisited) return;

    sessionStorage.setItem('hexa:visited', 'true');
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // Under reduced motion, skip entirely
  if (reducedMotion || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: REDUCED_TRANSITION }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden pointer-events-none"
          role="status"
          aria-live="polite"
          aria-label="Loading HexaStudio experience"
        >
          <div className="relative w-full max-w-md px-8">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-mono">Initializing</span>
                <span className="text-xs uppercase tracking-widest text-foreground font-light">HexaStudio Experience</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
