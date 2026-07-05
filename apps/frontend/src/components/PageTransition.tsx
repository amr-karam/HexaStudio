'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.8, 
          ease: 'var(--ease-out-expo)' 
        }}
      >
        {children}
      </motion.div>
      
      {/* Cinematic Page Overlay */}
      <motion.div
        key={`overlay-${pathname}`}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: 'var(--ease-out-expo)' }}
        className="fixed inset-0 bg-background z-[100] origin-bottom pointer-events-none"
      />
    </AnimatePresence>
  );
}
