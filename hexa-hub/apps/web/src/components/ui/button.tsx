'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/components/ui/cn';
import { hexaEasing } from '@/lib/motion/tokens';

const buttonVariants = cva(
  cn(
    'relative inline-flex items-center justify-center gap-2',
    'rounded-lg font-mono text-xs font-medium tracking-wider uppercase',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-void',
    'transition-all duration-200 ease-(--hexa-ease-interaction)',
    'disabled:pointer-events-none disabled:opacity-50',
    'will-change-transform',
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'bg-gold text-void-deep',
          'hover:bg-gold-hover hover:shadow-gold gold-glow-hover',
          'border-2 border-gold',
        ),
        secondary: cn(
          'bg-transparent text-foreground',
          'hover:bg-surface-elevated',
          'border border-border',
        ),
        tertiary: cn(
          'bg-transparent text-secondary',
          'hover:text-foreground',
          'border border-transparent',
        ),
        ghost: cn(
          'bg-transparent text-secondary',
          'hover:bg-white/[0.03] hover:text-foreground',
          'border border-transparent',
        ),
        gold: cn(
          'bg-gold text-void-deep',
          'hover:bg-gold-hover hover:shadow-gold gold-glow-hover',
          'border-2 border-gold',
        ),
        danger: cn(
          'bg-error/10 text-error',
          'hover:bg-error/20',
          'border border-error/30',
        ),
        link: cn('bg-transparent text-gold hover:text-gold-bright underline'),
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
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>>,
    Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, shape, asChild = false, isLoading = false, children, disabled, ...props },
    ref,
  ) => {
    const baseClasses = buttonVariants({ variant, size, shape, className });
    const isDisabled = disabled || isLoading;

    if (asChild) {
      return React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            className: cn(baseClasses, (children.props as { className?: string }).className),
            disabled: isDisabled,
            ...props,
          })
        : <button ref={ref} className={baseClasses} disabled={isDisabled}>{children}</button>;
    }

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={{
          duration: 0.15,
          ease: hexaEasing.interaction,
        }}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </motion.span>
        )}
        <span className={cn('flex items-center gap-2', isLoading && 'invisible')}>
          {children}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
