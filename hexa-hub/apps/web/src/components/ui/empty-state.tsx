'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/cn';
import { Button } from '@/components/ui/button';
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
      transition={{ duration: 0.4, ease: 'var(--hexa-ease-entrance)' }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center mb-5">
          <Icon size={28} className="text-tertiary" />
        </div>
      )}
      <h3 className="text-base text-secondary font-light mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-tertiary font-light max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
