'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/cn';

const buttonVariants = cva(
  cn(
    'relative inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium tracking-tight',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-var(--color-void)',
    'transition-all duration-200 ease-[var(--hexa-ease-interaction)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'font-mono uppercase text-xs',
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'bg-gold text-void-deep',
          'hover:bg-gold-hover hover:shadow-gold',
          'focus-visible:ring-gold',
          'border-2 border-gold',
        ),
        secondary: cn(
          'bg-transparent text-foreground',
          'hover:bg-surface-elevated',
          'focus-visible:ring-gold',
          'border border-border',
        ),
        tertiary: cn(
          'bg-transparent text-secondary',
          'hover:bg-white/[0.03]',
          'focus-visible:ring-gold',
          'border border-transparent',
        ),
        ghost: cn(
          'bg-transparent text-secondary',
          'hover:bg-white/[0.03] hover:text-foreground',
          'focus-visible:ring-gold',
          'border border-transparent',
        ),
        gold: cn(
          'bg-gold text-void-deep',
          'hover:bg-gold-hover hover:shadow-gold',
          'focus-visible:ring-gold',
          'border-2 border-gold',
        ),
        danger: cn(
          'bg-error/10 text-error',
          'hover:bg-error/20',
          'focus-visible:ring-error',
          'border border-error/30',
        ),
      },
      size: {
        xs: 'px-3 py-1.5 text-xs',
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-3.5 text-lg',
      },
      shape: {
        default: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      shape: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, children, ...props }, ref) => {
    const baseClasses = buttonVariants({ variant, size, shape, className });

    if (asChild) {
      return (
        <button ref={ref} className={baseClasses} {...props}>
          {children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'var(--hexa-ease-interaction)' }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
