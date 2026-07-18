'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
}

export function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  name,
}: ToggleSwitchProps) {
  const id = useId();

  return (
    <div className="flex items-start justify-between gap-6 py-5 px-6 rounded-sm bg-background border border-border/30 hover:border-accent/20 transition-all duration-500 group">
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground cursor-pointer select-none"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        name={name}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full
          transition-colors duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
          ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
          ${checked ? 'bg-accent' : 'bg-neutral-800'}
        `}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            inline-block h-5 w-5 rounded-full shadow-lg
            ${checked ? 'translate-x-[1.375rem] bg-background' : 'translate-x-[0.25rem] bg-neutral-400'}
          `}
        />
      </button>
    </div>
  );
}
