'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/cn';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/10 flex items-center justify-center mb-5">
          <Icon size={28} className="text-gold/60" />
        </div>
      )}
      <h3 className="text-base text-tertiary font-light mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-tertiary font-light max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-5 py-2.5 bg-gold text-void-deep rounded-lg text-sm font-medium tracking-wide hover:bg-gold/90 hover:shadow-[0_0_20px_rgba(212, 175, 55,0.15)] transition-all duration-200"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
