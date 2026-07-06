'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isPointer, setIsPointer] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);

  const springConfig = { stiffness: 400, damping: 30 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.closest('a') ||
        target.closest('button');

      setIsPointer(!!isInteractive);
      setIsHoveringLink(!!target.closest('a'));
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        animate={{
          scale: isPointer ? 1.5 : 1,
          backgroundColor: isPointer ? 'var(--color-accent)' : '#fff',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full transition-colors duration-300"
      />

      <motion.div
        animate={{
          scale: isPointer ? 2.5 : 1.5,
          borderColor: isPointer ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
          opacity: isPointer ? 1 : 0.6,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-white transition-all duration-500 ease-out-expo"
      />

      <AnimatePresence>
        {isHoveringLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-accent text-background text-[8px] uppercase tracking-[0.2em] font-medium whitespace-nowrap"
          >
            View
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
