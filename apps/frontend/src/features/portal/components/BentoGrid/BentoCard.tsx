/**
 * HEXA-NEW BentoCard Component
 *
 * Reusable card component for the Bento Grid system
 * Supports multiple variants and span configurations
 *
 * @version 1.0.0
 */

'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { hoverLift } from '@/lib/motion/bento-tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface BentoCardProps {
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'accent' | 'interactive' | 'skeleton';
  span?: '1x1' | '2x1' | '1x2' | '2x2';
  onClick?: () => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const variantClasses = {
  default: 'bento-card--default',
  elevated: 'bento-card--elevated',
  glass: 'bento-card--glass',
  accent: 'bento-card--accent',
  interactive: 'bento-card--interactive',
  skeleton: 'bento-card--skeleton',
} as const;

const spanClasses = {
  '1x1': 'col-span-1 sm:col-span-1 lg:col-span-1',
  '2x1': 'col-span-1 sm:col-span-2 lg:col-span-2',
  '1x2': 'col-span-1 sm:col-span-1 lg:col-span-1 row-span-2',
  '2x2': 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-2',
} as const;

export function BentoCard({
  children,
  className = '',
  variant = 'default',
  span = '1x1',
  onClick,
  loading = false,
  error = '',
  disabled = false,
  'aria-label': ariaLabel,
}: BentoCardProps) {
  const prefersReduced = useReducedMotion();
  const isInteractive = Boolean(onClick) && !disabled;

  const baseClasses = cn(
    'bento-card rounded-2xl border border-sl-gold-subtle/15 p-5',
    variantClasses[variant],
    spanClasses[span],
    {
      'animate-bento-entrance': !prefersReduced,
      'will-change-transform': isInteractive,
      'pointer-events-none': disabled || loading,
    },
    className
  );

  const variants: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReduced ? 0.01 : 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const interactiveProps = isInteractive
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: disabled ? undefined : onClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && onClick) {
            e.preventDefault();
            onClick();
          }
        },
        'aria-disabled': disabled,
        'aria-busy': loading,
      }
    : { 'aria-busy': loading };

  return (
    <motion.div
      className={baseClasses}
      variants={variants}
      whileHover={isInteractive && !prefersReduced ? hoverLift.whileHover : undefined}
      whileTap={isInteractive && !prefersReduced ? { scale: 0.98 } : undefined}
      aria-label={ariaLabel}
      {...interactiveProps}
    >
      {error && (
        <div className="bento-card__error text-sm text-danger" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="bento-card__loading flex items-center justify-center h-32">
          <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}

export default BentoCard;
