'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ScrollToTop — refined floating button that appears after scrolling past
 * the hero section. Uses spring physics for a premium tactile feel.
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (typeof window === 'undefined') return;
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', toggleVisibility, { passive: true });
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 end-8 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-sl-gold-subtle/20 bg-sl-void/80 backdrop-blur-md text-sl-alabaster shadow-lg transition-colors hover:border-sl-gold-subtle/40 hover:text-sl-gold-hover"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
