'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/components/ui/cn';

const inputVariants = cva(
  cn(
    'w-full rounded-lg border bg-surface-elevated',
    'text-foreground placeholder:text-tertiary',
    'transition-all duration-200 ease-[var(--hexa-ease-interaction)]',
    'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-void',
    'file:border-0 file:bg-transparent file:font-medium',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'border-border',
          'focus-within:border-gold focus-within:ring-gold',
        ),
        error: cn(
          'border-error',
          'focus-within:border-error focus-within:ring-error',
        ),
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, type = 'text', ...props }, ref) => {
    const inputVariant = error ? 'error' : variant;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-secondary mb-2"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(inputVariants({ variant: inputVariant, size }), className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-error font-light" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input, inputVariants };
