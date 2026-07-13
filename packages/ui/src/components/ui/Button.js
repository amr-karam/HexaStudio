'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';
const variants = {
    primary: 'bg-accent text-background hover:bg-accent/90 shadow-lg shadow-accent/20',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
    ghost: 'bg-transparent text-white hover:bg-white/5',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-border text-foreground hover:bg-surface',
};
const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-11 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
};
const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, asChild = false, children, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';
    return (_jsxs(Component, { className: cn('inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background', 'disabled:opacity-50 disabled:pointer-events-none active:scale-95', variants[variant], sizes[size], className), ref: ref, disabled: isLoading || props.disabled, ...props, children: [isLoading ? (_jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" })) : null, children] }));
});
Button.displayName = 'Button';
export { Button };
