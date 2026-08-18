'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/components/ui/cn';

const badgeVariants = cva(
  cn(
    'inline-flex items-center gap-1.5 font-mono uppercase',
    'text-[10px] font-medium tracking-wider',
    'border rounded-full transition-colors duration-200',
  ),
  {
    variants: {
      variant: {
        default: cn('bg-border text-secondary border-border'),
        success: cn('bg-success/10 text-success border-success/20'),
        warning: cn('bg-warning/10 text-warning border-warning/20'),
        danger: cn('bg-error/10 text-error border-error/20'),
        info: cn('bg-info/10 text-info border-info/20'),
        gold: cn('bg-gold/10 text-gold border-gold/20'),
        outline: cn('bg-transparent text-secondary border-border'),
      },
      size: {
        sm: 'px-2 py-0.5',
        md: 'px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const dotColorClasses: Record<string, string> = {
  default: 'bg-text-tertiary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-error',
  info: 'bg-info',
  gold: 'bg-gold',
  outline: 'bg-text-tertiary',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', dotColorClasses[variant ?? 'default'])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  ),
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
