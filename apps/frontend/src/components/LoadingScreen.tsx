'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  children?: React.ReactNode;
}

export const LoadingScreen = ({ children }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12;
        return next >= 100 ? 100 : next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'var(--ease-out-expo)' }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      >
        <div className="relative flex flex-col items-center gap-12">
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/logo.webp"
                alt="HexaStudio"
                width={24}
                height={24}
              />
            </motion.div>
            <span className="text-xs uppercase tracking-[0.5em] text-foreground font-medium">
              HexaStudio
            </span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-48 h-[1px] bg-border relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-accent"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'var(--ease-out-expo)' }}
              />
            </div>
            <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-600 font-light" aria-live="polite">
              Initializing Environment <span className="ml-2 text-accent">{Math.round(progress)}%</span>
            </span>
          </div>
        </div>
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
