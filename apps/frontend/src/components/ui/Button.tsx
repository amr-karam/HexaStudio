import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
}

const buttonStyles = {
  base: 'inline-flex items-center justify-center rounded-none transition-all duration-500 font-medium active:scale-95 disabled:opacity-50 ease-out-expo',
  variants: {
    primary: 'bg-accent text-background hover:bg-accent-light shadow-sm',
    secondary: 'bg-foreground text-background hover:bg-neutral-200',
    outline: 'border border-border-light text-neutral-400 hover:border-accent hover:text-accent',
    ghost: 'text-neutral-500 hover:text-foreground',
  },
  sizes: {
    sm: 'px-4 py-2 text-[10px] uppercase tracking-[0.2em]',
    md: 'px-6 py-3 text-[10px] uppercase tracking-[0.2em]',
    lg: 'px-10 py-4 text-[10px] uppercase tracking-[0.2em]',
  },
};

function getButtonClassName(
  variant: ButtonProps['variant'],
  size: ButtonProps['size'],
  className?: string,
) {
  return cn(
    buttonStyles.base,
    buttonStyles.variants[variant ?? 'primary'],
    buttonStyles.sizes[size ?? 'md'],
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = getButtonClassName(variant, size, className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
      });
    }

    return (
      <button ref={ref} className={classes} disabled={isLoading} {...props}>
        {isLoading ? (
          <span className="mr-3 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
