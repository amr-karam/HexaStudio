'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: 'component' | 'page';
}

/**
 * Masked text reveal — the signature HEXA entrance. The content slides up from
 * behind a clip mask using the standard `entrance` easing. Respects
 * reduced-motion automatically via useHEXAMotion.
 */
export const TextReveal = ({ children, className, delay = 0, duration = 'page' }: TextRevealProps) => {
  const { transition } = useHEXAMotion();

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={transition('entrance', duration, delay)}
      >
        {children}
      </motion.div>
    </div>
  );
};
