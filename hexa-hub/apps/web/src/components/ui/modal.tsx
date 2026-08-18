'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { Button } from '@/components/ui/button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onClose();
    },
    [onClose, closeOnEscape],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.style.width = 'calc(100% - 1px)'; /* prevents scrollbar jump */
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.style.width = '';
    };
  }, [open, handleEscape]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'var(--hexa-ease-sharp)' }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnOutsideClick ? onClose : undefined}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: 'var(--hexa-ease-entrance)' }}
            className={cn(
              'relative w-full border border-border shadow-card',
              'bg-surface-elevated rounded-2xl',
              sizeClasses[size],
              className,
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between p-6 pb-4 border-b border-border/50">
                <div>
                  {title && (
                    <h2 className="text-lg font-serif font-light text-foreground">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-secondary font-light mt-1">{description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  shape="full"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="h-7 w-7 p-1.5"
                >
                  <X size={16} />
                </Button>
              </div>
            )}

            {/* Close button (when no header) */}
            {!title && !description && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-tertiary hover:text-foreground hover:bg-white/[0.03] transition-all"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            )}

            {/* Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
