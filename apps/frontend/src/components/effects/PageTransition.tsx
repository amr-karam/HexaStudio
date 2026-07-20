'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '2%' : '-2%',
    opacity: 0,
    filter: 'blur(4px)',
    scale: 0.995,
  }),
  animate: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-2%' : '2%',
    opacity: 0,
    filter: 'blur(4px)',
    scale: 0.995,
    transition: {
      duration: 0.5,
      ease: [0.7, 0, 1, 1],
    },
  }),
};

const overlayVariants = {
  initial: { scaleX: 0, transformOrigin: 'left' },
  animate: {
    scaleX: 1,
    transition: { duration: 0.6, ease: [0.7, 0, 0.3, 1] },
  },
  exit: {
    scaleX: 0,
    transformOrigin: 'right',
    transition: { duration: 0.6, ease: [0.7, 0, 0.3, 1], delay: 0.1 },
  },
};

interface Props {
  children: React.ReactNode;
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const [direction, setDirection] = useState(0);
  const prevPath = useRef(pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransition = useCallback(() => {
    const currentIndex = pathname.length;
    const prevIndex = prevPath.current.length;
    setDirection(currentIndex > prevIndex ? 1 : -1);
    prevPath.current = pathname;
    setIsTransitioning(true);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      handleTransition();
    }
    const timer = setTimeout(() => setIsTransitioning(false), 800);
    return () => clearTimeout(timer);
  }, [pathname, handleTransition]);

  return (
    <div className="relative">
      {/* Wipe overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="wipe"
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[9997] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #0a0a1a, #050508)' }}
          />
        )}
      </AnimatePresence>

      {/* Page content */}
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={direction}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
