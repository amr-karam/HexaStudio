'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { EASE } from '@/lib/motion';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';

const wipeVariants = {
  initial: { scaleX: 0, transformOrigin: 'left' as const },
  animate: {
    scaleX: 1,
    transition: { duration: 0.5, ease: [0.7, 0, 0.3, 1] },
  },
  exit: {
    scaleX: 0,
    transformOrigin: 'right' as const,
    transition: { duration: 0.5, ease: [0.7, 0, 0.3, 1], delay: 0.05 },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reduced } = useHEXAMotion();
  const [isWiping, setIsWiping] = useState(false);
  const wipeTimer = useRef<NodeJS.Timeout>(null);

  const triggerWipe = useCallback(() => {
    setIsWiping(true);
    // Auto-hide wipe after animation completes
    if (wipeTimer.current) clearTimeout(wipeTimer.current);
    wipeTimer.current = setTimeout(() => setIsWiping(false), 600);
  }, []);

  useEffect(() => {
    triggerWipe();
    return () => { if (wipeTimer.current) clearTimeout(wipeTimer.current); };
  }, [pathname, triggerWipe]);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, [pathname, reduced]);

  // GPU-only animation. Reduced motion collapses to pure opacity crossfade.
  const variants = reduced
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

  return (
    <>
      {/* Curtain wipe overlay */}
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
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: 0.6, ease: EASE.entrance }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
