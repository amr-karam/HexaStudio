'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function CinematicPreloader() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Reduced-motion users get a near-instant hand-off to content.
    if (reducedMotion) {
      const t = setTimeout(() => setIsComplete(true), 200);
      return () => clearTimeout(t);
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsComplete(true), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: EASE.entrance } }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
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
              <span className="text-2xl font-serif font-light text-accent italic">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-[1px] w-full bg-neutral-800 relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/5 blur-[100px] rounded-full" aria-hidden="true" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/5 blur-[100px] rounded-full" aria-hidden="true" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
