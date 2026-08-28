/**
 * HEXA-NEW BentoGrid Component
 * 
 * Modern Bento Grid layout system for the redesigned portal dashboard
 * Supports staggered animations and responsive layouts
 * 
 * @version 1.0.0
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import * as React from 'react';
import { bentoGridStagger } from '@/lib/motion/bento-tokens';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface BentoGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  enableStagger?: boolean;
  'aria-label'?: string;
}

export function BentoGrid({
  children,
  className,
  staggerDelay = 0.08,
  enableStagger = true,
  'aria-label': ariaLabel = 'Dashboard grid',
}: BentoGridProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className={cn(
        'bento-grid',
        enableStagger && 'bento-stagger',
        className
      )}
      role="region"
      aria-label={ariaLabel}
    >
      <AnimatePresence>
        {children &&
          React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return null;

            const childIndex = index;
            const delay = prefersReduced ? 0 : childIndex * staggerDelay;

            return (
              <motion.div
                key={child.key || childIndex}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={bentoGridStagger(0)}
                className={cn(
                  'animate-bento-entrance',
                  (child.props as { className?: string })?.className
                )}
                style={{
                  animationDelay: prefersReduced ? '0ms' : `${delay * 1000}ms`,
                }}
              >
                {child}
              </motion.div>
            );
          })}
      </AnimatePresence>
    </section>
  );
}

export default BentoGrid;
