'use client';

import React from 'react';
import { cn } from './cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium ml-1 block"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-[#141414] border border-[#1F1F1F] rounded-lg text-sm text-white placeholder:text-[#555] font-light',
            'focus:outline-none focus:border-[#D4A843]/40 focus:ring-1 focus:ring-[#D4A843]/20',
            'transition-all duration-300',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon ? 'pr-10' : 'pr-4',
            'py-2.5',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555]">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-400 ml-1 font-light">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-[#555] ml-1 font-light">{helperText}</p>
      )}
    </div>
  );
}
