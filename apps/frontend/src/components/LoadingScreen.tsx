'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, REDUCED_TRANSITION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface LoadingScreenProps {
  children?: React.ReactNode;
  /** When provided (0–100), shows a determinate bar. Otherwise indeterminate. */
  progress?: number;
}

export const LoadingScreen = ({ children, progress: externalProgress }: LoadingScreenProps) => {
  const reducedMotion = useReducedMotion();
  const isDeterminate = typeof externalProgress === 'number';
  const displayProgress = isDeterminate ? Math.round(externalProgress) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reducedMotion ? REDUCED_TRANSITION : { duration: 0.8, ease: EASE.entrance }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      >
        <div className="relative flex flex-col items-center gap-12">
          <div className="flex items-center gap-4">
            {reducedMotion ? (
              <Image src="/logo.svg" alt="HexaStudio" width={24} height={24} />
            ) : (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image src="/logo.svg" alt="HexaStudio" width={24} height={24} />
              </motion.div>
            )}
            <span className="text-xs uppercase tracking-[0.5em] text-foreground font-medium">HexaStudio</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            {isDeterminate ? (
              <div
                role="progressbar"
                aria-valuenow={displayProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Loading progress"
                className="w-48 h-[1px] bg-border relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-y-0 start-0 bg-accent origin-left"
                  style={{ transformOrigin: 'left' }}
                  animate={{ scaleX: displayProgress / 100 }}
                  transition={reducedMotion ? REDUCED_TRANSITION : { duration: 0.4, ease: EASE.entrance }}
                />
              </div>
            ) : (
              <div
                role="status"
                aria-live="polite"
                className="w-48 h-[1px] bg-border relative overflow-hidden"
              >
                {/* Indeterminate: moving gradient shimmer instead of fake percentage */}
                {reducedMotion ? (
                  <div className="absolute inset-y-0 start-0 w-1/3 bg-accent/60" />
                ) : (
                  <motion.div
                    className="absolute inset-y-0 w-1/3 bg-accent"
                    animate={{ x: ['-30%', '230%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>
            )}
            <span
              className="text-[9px] uppercase tracking-[0.4em] text-neutral-600 font-light"
              aria-live="polite"
            >
              {isDeterminate ? (
                <>
                  Loading{' '}
                  <span className="ml-2 text-accent">{displayProgress}%</span>
                </>
              ) : (
                'Loading'
              )}
            </span>
          </div>
        </div>
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
