'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: any;
  variant?: 'centered' | 'full-screen' | 'side-panel';
  className?: string;
}


const Modal = ({ isOpen, onClose, title, children, variant = 'centered', className }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/60 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative',
              variant === 'centered' && 'max-w-lg w-full',
              variant === 'full-screen' && 'fixed inset-0 m-0 rounded-none p-12',
              variant === 'side-panel' && 'fixed right-0 top-0 h-full w-full max-w-md rounded-l-3xl rounded-tr-3xl p-8',
              className
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0">
                ✕
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Modal };
