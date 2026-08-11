'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Input — architectural "underline" form field.
 * The active state is driven entirely by CSS `group-focus-within`,
 * matching the precision of an architectural drawing.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="group relative w-full">
        {label && (
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-neutral-500 transition-colors duration-300 group-focus-within:text-accent">
            {label}
          </label>
        )}
        <div className="relative border-b-2 border-neutral-200 transition-colors duration-300 group-focus-within:border-accent">
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-none bg-transparent px-0 py-2 text-sm text-foreground transition-colors duration-300',
              'placeholder:text-neutral-400',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <span className="absolute -bottom-5 left-0 text-[10px] uppercase tracking-tighter text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };