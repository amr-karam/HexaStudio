'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /**
   * Visual treatment of the field shell.
   * - `underline` (default): architectural hairline underline that brightens on focus.
   * - `glass`: liquid-glass shell using the `artisan-glass` token, with gold border on focus.
   */
  variant?: 'underline' | 'glass';
}

/**
 * Input — architectural form field.
 *
 * `underline` is the editorial default (precise hairline that brightens on focus).
 * `glass` opts into the liquid-glass system (`artisan-glass` + gold border on focus)
 * to harmonize with `LiquidGlassCard` and the `glass` Button variant.
 *
 * Accessibility: when a `label` is provided it is programmatically associated with
 * the input via `htmlFor`/`id` (WCAG 2.2 AA). Error text is wired via
 * `aria-describedby` and `aria-invalid` is set when an error is present.
 * Callers may override the generated id via the `id` prop.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, variant = 'underline', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const describedBy = error ? errorId : props['aria-describedby'];

    if (variant === 'glass') {
      return (
        <div className="group relative w-full">
          {label && (
            <label
              htmlFor={inputId}
              className="mb-2 block text-[11px] font-mono font-medium uppercase tracking-[0.25em] text-neutral-400 transition-colors duration-300 group-focus-within:text-accent"
            >
              {label}
            </label>
          )}
          <div className="artisan-glass relative rounded-lg px-4 transition-all duration-300 group-focus-within:artisan-glass-gold group-focus-within:border-accent/40">
            <input
              id={inputId}
              type={type}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              className={cn(
                'flex h-12 w-full rounded-none bg-transparent px-0 py-2 text-sm text-foreground transition-all duration-300',
                'placeholder:text-neutral-500 font-light',
                'focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
              )}
              ref={ref}
              {...props}
            />
          </div>
          {error && (
            <span
              id={errorId}
              role="alert"
              className="absolute -bottom-5 left-0 text-[10px] uppercase tracking-tighter text-red-500"
            >
              {error}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="group relative w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-[11px] font-mono font-medium uppercase tracking-[0.25em] text-neutral-400 transition-colors duration-300 group-focus-within:text-accent"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-lg bg-white/[0.02] border border-white/[0.06] px-4 transition-all duration-300 group-focus-within:border-accent group-focus-within:bg-white/[0.04] group-focus-within:shadow-[var(--artisan-glass-shadow),0_0_20px_rgba(212,175,55,0.15)]">
          <input
            id={inputId}
            type={type}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'flex h-12 w-full rounded-none bg-transparent px-0 py-2 text-sm text-foreground transition-all duration-300',
              'placeholder:text-neutral-500 font-light',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <span
            id={errorId}
            role="alert"
            className="absolute -bottom-5 left-0 text-[10px] uppercase tracking-tighter text-red-500"
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };