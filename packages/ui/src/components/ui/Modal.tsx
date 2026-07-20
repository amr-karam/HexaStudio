'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  variant?: 'centered' | 'full-screen' | 'side-panel';
  className?: string;
}

const Modal = ({ isOpen, onClose, title, children, variant = 'centered', className }: ModalProps) => {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close on Escape + lock body scroll while the modal is open.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  // Focus management: focus the panel on open and trap Tab within it.
  React.useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Move focus into the dialog so screen-reader + keyboard users land inside.
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      panel.focus();
    }

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener('keydown', onKeydown);
    return () => panel.removeEventListener('keydown', onKeydown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 5 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative outline-none',
              variant === 'centered' && 'max-w-lg w-full',
              variant === 'full-screen' && 'fixed inset-0 m-0 rounded-none p-12',
              variant === 'side-panel' &&
                'fixed right-0 top-0 h-full w-full max-w-md rounded-l-3xl rounded-tr-3xl p-8',
              className
            )}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="group absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-white/40 hover:text-accent transition-colors duration-300"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M1 1L13 13M13 1L1 13" />
              </svg>
            </button>
            <div className="flex justify-between items-center mb-6 pr-10">
              <h2 className="text-2xl font-serif">{title}</h2>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Modal };
