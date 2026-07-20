'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE, DURATION } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type GlassCardVariant = 'default' | 'elevated' | 'subtle';
type GlassCardElement = 'div' | 'article' | 'section';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: GlassCardVariant;
  /** Enable hover lift + glow. Defaults to true. */
  hover?: boolean;
  /** Rendered semantic element. Defaults to 'div'. */
  as?: GlassCardElement;
}

const VARIANT_CLASSES: Record<GlassCardVariant, string> = {
  default: 'glass',
  elevated: 'glass shadow-[0_8px_40px_-12px_rgba(212,175,55,0.0)]',
  subtle: 'bg-white/[0.01] border border-white/[0.03]',
};

/**
 * GlassCard — the signature frosted surface of the HEXA Silent Luxury system.
 *
 * Variants:
 *  - `default`: full glass (blur + saturate) for primary panels.
 *  - `elevated`: glass + a gold-tinted shadow that blooms on hover.
 *  - `subtle`: minimal border, no blur — used for nested or dense layouts.
 *
 * Hover choreography (disabled under reduced-motion): a 4px lift, a 1.01 scale,
 * and a champagne-tinted border glow, all driven by the standard entrance
 * easing to keep the feel handcrafted and cinematic.
 */
export const GlassCard = ({
  children,
  className,
  variant = 'default',
  hover = true,
  as = 'div',
}: GlassCardProps) => {
  const reducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  const baseClass = cn(
    'relative rounded-2xl transition-colors duration-300',
    VARIANT_CLASSES[variant],
    hover && 'glass-hover',
    className,
  );

  const shouldAnimateHover = hover && !reducedMotion && variant !== 'subtle';

  const motionProps = shouldAnimateHover
    ? {
        whileHover: {
          y: -4,
          scale: 1.01,
          boxShadow:
            variant === 'elevated'
              ? '0 20px 60px -20px rgba(212, 175, 55, 0.25)'
              : '0 12px 48px -16px rgba(212, 175, 55, 0.15)',
        },
        transition: {
          duration: DURATION.component,
          ease: EASE.entrance as [number, number, number, number],
        },
      }
    : {};

  return (
    <MotionTag className={baseClass} {...motionProps}>
      {children}
    </MotionTag>
  );
};
