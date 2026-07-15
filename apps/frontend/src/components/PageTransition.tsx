'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { EASE } from '@/lib/motion';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reduced } = useHEXAMotion();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, [pathname, reduced]);

  // GPU-only animation (opacity + transform). Blur filters are intentionally
  // avoided per MOTION_SYSTEM.md performance guidance. Reduced motion collapses
  // to a pure opacity crossfade.
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
  );
}
