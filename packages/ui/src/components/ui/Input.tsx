import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        {label && (
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 transition-colors group-focus-within:text-gold">
            {label}
          </label>
        )}
        <input
          className={cn(
            'w-full bg-transparent border-b border-white/20 py-2 outline-none transition-all duration-300',
            'text-white placeholder:text-white/30 placeholder:italic',
            'focus:border-gold focus:bg-white/10',
            error && 'border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 animate-in fade-in slide-in-from-top-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
