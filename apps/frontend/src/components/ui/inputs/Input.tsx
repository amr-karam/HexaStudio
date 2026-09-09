'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type InputVariant = 'underline' | 'glass';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputIcons {
  /** Icon rendered before the input field (left slot). */
  left?: React.ReactNode;
  /** Icon rendered after the input field (right slot). */
  right?: React.ReactNode;
}

export interface InputBaseProps {
  /** Visible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field (shown when no error). */
  helperText?: string;
  /** Error message — when present the field enters error state. */
  error?: string;
  /** Visual treatment of the field shell. */
  variant?: InputVariant;
  /** Size of the input field. */
  size?: InputSize;
  /** Whether the input takes full container width (default true). */
  fullWidth?: boolean;
  /** Icons for left/right slots. */
  icons?: InputIcons;
}

/* -------------------------------------------------------------------------- */
/*  Shared Types                                                              */
/* -------------------------------------------------------------------------- */

export type InputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;
export type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;
export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>;

/* Polymorphic union type */
export type InputComponentProps =
  | ({ as?: 'input' } & InputBaseProps & InputProps)
  | ({ as: 'textarea' } & InputBaseProps & TextareaProps)
  | ({ as: 'select' } & InputBaseProps & SelectProps);

/* -------------------------------------------------------------------------- */
/*  Size Token Map                                                          */
/* -------------------------------------------------------------------------- */

const SIZE_MAP: Record<NonNullable<InputSize>, {
  height: string;
  paddingX: string;
  fontSize: string;
  iconSize: string;
}> = {
  sm: { height: 'h-9', paddingX: 'px-3', fontSize: 'text-xs', iconSize: 'w-3.5 h-3.5' },
  md: { height: 'h-12', paddingX: 'px-4', fontSize: 'text-sm', iconSize: 'w-4 h-4' },
  lg: { height: 'h-14', paddingX: 'px-5', fontSize: 'text-base', iconSize: 'w-5 h-5' },
};

/* -------------------------------------------------------------------------- */
/*  Input Component                                                         |
/* -------------------------------------------------------------------------- */

const Input = React.forwardRef<InputElement, InputComponentProps>(
  (
    {
      className,
      as = 'input',
      label,
      helperText,
      error,
      variant = 'underline',
      size = 'md',
      fullWidth = true,
      icons,
      id,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || props['aria-describedby'];

    const sizeConfig = SIZE_MAP[size];
    const hasError = Boolean(error);
    const isTextarea = as === 'textarea';
    const isSelect = as === 'select';

    /* ------------------------------------------------------------------ */
    /*  Shell wrapper                                                     |
    /* ------------------------------------------------------------------ */
    const shellClasses = cn(
      'relative flex flex-col gap-1.5',
      // Responsive: full-width on mobile, fixed on desktop via layout system
      fullWidth ? 'w-full' : 'w-auto',
    );

    /* ------------------------------------------------------------------ */
    /*  Label                                                             |
    /* ------------------------------------------------------------------ */
    const labelClasses = cn(
      'block text-xs font-mono font-medium uppercase tracking-[0.25em] transition-colors duration-300',
      hasError ? 'text-red-400' : 'text-sl-mist/60 group-focus-within:text-sl-gold-hover',
    );

    /* ------------------------------------------------------------------ */
    /*  Field wrapper (visual shell)                                      |
    /* ------------------------------------------------------------------ */
    const fieldWrapperClasses = cn(
      'relative flex items-center rounded-lg transition-all duration-300',
      sizeConfig.height,
      sizeConfig.paddingX,
      // Focus ring
      'group-focus-within:ring-1 group-focus-within:ring-sl-gold-subtle/60',
      // Variant styles
      {
        'bg-white/[0.02] border border-white/[0.06]': variant === 'underline',
        'artisan-glass border border-transparent': variant === 'glass',
        // Error state
        'border-red-500/50 group-focus-within:border-red-500/70': hasError && variant === 'underline',
        'border-red-500/40 group-focus-within:artisan-glass-gold group-focus-within:border-red-500/50':
          hasError && variant === 'glass',
        // Disabled
        'disabled:opacity-50 disabled:cursor-not-allowed': disabled,
      },
    );

    /* ------------------------------------------------------------------ */
    /*  Input element classes                                             |
    /* ------------------------------------------------------------------ */
    const inputClasses = cn(
      'flex w-full rounded-none bg-transparent text-sl-alabaster transition-all duration-300',
      sizeConfig.fontSize,
      'placeholder:text-sl-mist/60 font-light',
      'focus:outline-none',
      // Icon padding compensation
      icons?.left && 'pl-4',
      icons?.right && 'pr-4',
      className,
    );

    /* ------------------------------------------------------------------ */
    /*  Render helper / error text                                        |
    /* ------------------------------------------------------------------ */
    const renderFeedback = () => {
      if (hasError && error) {
        return (
          <span id={errorId} role="alert" className="text-xs uppercase tracking-tighter text-red-500 transition-opacity duration-200">
            {error}
          </span>
        );
      }
      if (helperText) {
        return (
          <span id={helperId} className="text-xs text-sl-mist/50 transition-opacity duration-200">
            {helperText}
          </span>
        );
      }
      return null;
    };

    /* ------------------------------------------------------------------ */
    /*  Build the field element                                           |
    /* ------------------------------------------------------------------ */
    const renderField = () => {
      const commonFieldProps: Record<string, unknown> = {
        id: inputId,
        'aria-invalid': hasError || undefined,
        'aria-describedby': describedBy || undefined,
        disabled,
        ref,
        className: inputClasses,
        ...props,
      };

      if (isTextarea) {
        const textareaProps = commonFieldProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>;
        return (
          <textarea
            {...textareaProps}
            rows={textareaProps.rows ?? 4}
            className={cn(
              'flex w-full rounded-none bg-transparent text-sl-alabaster transition-all duration-300',
              size === 'sm' && 'text-xs',
              size === 'lg' && 'text-base',
              'placeholder:text-sl-mist/60 font-light',
              'focus:outline-none resize-none',
              icons?.left && 'pl-4',
              icons?.right && 'pr-4',
              className,
            )}
          />
        );
      }

      if (isSelect) {
        const selectProps = commonFieldProps as React.SelectHTMLAttributes<HTMLSelectElement>;
        return (
          <select
            {...selectProps}
            className={cn(
              'flex w-full rounded-none bg-transparent text-sl-alabaster transition-all duration-300',
              sizeConfig.fontSize,
              'placeholder:text-sl-mist/60 font-light',
              'focus:outline-none appearance-none cursor-pointer',
              // Custom dropdown arrow via CSS
              'bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJlYW09IiMxQzFDNUMiIHN0cm9rZT0iI0Q0RkYzNyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIG9wZXJhdG9yPSJtaXN0IiBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ii8+PC9zdmc+)] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat',
              icons?.right && 'pr-10',
              'disabled:cursor-not-allowed',
              className,
            )}
          >
            {children}
          </select>
        );
      }

      // Default: <input>
      const inputProps = commonFieldProps as React.InputHTMLAttributes<HTMLInputElement>;
      return <input {...inputProps} type={inputProps.type ?? 'text'} />;
    };

    /* ------------------------------------------------------------------ */
    /*  Render icons                                                      |
    /* ------------------------------------------------------------------ */
    const renderIcon = (icon: React.ReactNode, side: 'left' | 'right') => {
      if (!icon) return null;
      const iconClasses = cn(
        'flex-shrink-0 text-sl-mist/50 group-focus-within:text-sl-gold/70 transition-colors duration-300',
        sizeConfig.iconSize,
      );
      return (
        <span className={cn('flex items-center justify-center', side === 'left' ? 'mr-2' : 'ml-2')}>
          <span className={iconClasses}>{icon}</span>
        </span>
      );
    };

    /* ------------------------------------------------------------------ */
    /*  Assemble                                                          |
    /* ------------------------------------------------------------------ */
    return (
      <div className={shellClasses}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <div className={fieldWrapperClasses}>
          {icons?.left && renderIcon(icons.left, 'left')}
          {renderField()}
          {icons?.right && renderIcon(icons.right, 'right')}
        </div>
        {renderFeedback()}
      </div>
    );
  },
);

Input.displayName = 'Input';

/* -------------------------------------------------------------------------- */
/*  Compound exports                                                          |
/* -------------------------------------------------------------------------- */

export { Input };
/* -------------------------------------------------------------------------- */
/*  Compound exports                                                          */
/* -------------------------------------------------------------------------- */
