'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Magnetic creates a subtle "pull" effect towards the cursor when hovering.
 * This is a common high-end agency interaction that adds tactile feel to UI elements.
 *
 * Accessibility: disabled when the user prefers reduced motion or on coarse
 * (touch) pointers, rendering a static, non-interactive wrapper.
 */
export const Magnetic = ({ children, strength = 20, className }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion || !ref.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const x = (clientX - centerX) / strength;
    const y = (clientY - centerY) / strength;

    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (reducedMotion) {
    return <div className={cn('inline-block', className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
};
