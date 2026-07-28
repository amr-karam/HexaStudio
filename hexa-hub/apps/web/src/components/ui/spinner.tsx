'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <motion.div
      role="status"
      aria-label="Loading"
      className={cn(
        'rounded-full border-[#1F1F1F] border-t-[#D4A843]',
        sizeMap[size],
        className,
      )}
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration: 0.8,
        ease: 'linear',
      }}
    />
  );
}
