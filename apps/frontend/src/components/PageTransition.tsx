'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { EASE, DURATION, REDUCED_TRANSITION, makeTransition } from '@/lib/motion';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';

const wipeVariants = {
  initial: { scaleX: 0, transformOrigin: 'left' as const },
  animate: {
    scaleX: 1,
    transition: makeTransition('transition', 'component'),
  },
  exit: {
    scaleX: 0,
    transformOrigin: 'right' as const,
    transition: { duration: DURATION.component, ease: EASE.sharp, delay: 0.05 },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reduced } = useHEXAMotion();
  const [isWiping, setIsWiping] = useState(false);
  const wipeTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const triggerWipe = useCallback(() => {
    setIsWiping(true);
    if (wipeTimer.current) clearTimeout(wipeTimer.current);
    const wipeDuration = reduced ? 10 : DURATION.component * 1000 + 100;
    wipeTimer.current = setTimeout(() => setIsWiping(false), wipeDuration);
  }, [reduced]);

  useEffect(() => {
    triggerWipe();
    return () => {
      if (wipeTimer.current) clearTimeout(wipeTimer.current);
    };
  }, [pathname, triggerWipe]);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, [pathname, reduced]);

  // Route focus management: focus main content after transition
  useEffect(() => {
    const timeout = setTimeout(() => {
      const mainEl = document.getElementById('main-content');
      if (mainEl) {
        mainEl.focus({ preventScroll: true });
      }
    }, reduced ? 50 : DURATION.page * 1000 + 100);
    return () => clearTimeout(timeout);
  }, [pathname, reduced]);

  // Under reduced motion: instant content swap, no wipe overlay
  const contentVariants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  const contentTransition = reduced ? REDUCED_TRANSITION : makeTransition('entrance', 'page');

  return (
    <>
      {/* Curtain wipe overlay — only when not reduced */}
      <AnimatePresence>
        {!reduced && isWiping && (
          <motion.div
            key="wipe"
            variants={wipeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[9997] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #0a0a1a, #050508)' }}
          />
        )}
      </AnimatePresence>

      {/* Page content transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={contentVariants.initial}
          animate={contentVariants.animate}
          exit={contentVariants.exit}
          transition={contentTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
