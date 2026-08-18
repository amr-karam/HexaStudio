'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/components/ui/cn';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastContextType {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const existing = toasts.length;
      if (existing >= 5) {
        setToasts((prev) => {
          const toRemove = prev[0];
          if (toRemove) {
            setToasts((p) => p.filter((t) => t.id !== toRemove.id));
          }
          return [...prev.slice(1), { ...toast, id }];
        });
      } else {
        setToasts((prev) => [...prev, { ...toast, id }]);
      }
      const ms = toast.duration ?? 5000;
      setTimeout(() => removeToast(id), ms);
    },
    [toasts, removeToast],
  );

  const toast = {
    success: (title: string, description?: string) => addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) => addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) => addToast({ type: 'info', title, description }),
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, ...toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/* ─── Internal: Container & Item ─────────────────────────────────────────── */

const iconMap: Record<ToastData['type'], React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap: Record<ToastData['type'], string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
};

const progressColorMap: Record<ToastData['type'], string> = {
  success: 'bg-success/60',
  error: 'bg-error/60',
  warning: 'bg-warning/60',
  info: 'bg-info/60',
};

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastData;
  onRemove: (id: string) => void;
}) {
  const Icon = iconMap[toast.type];
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onRemove(toast.id);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [toast.id, duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, x: 12 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2, ease: 'var(--hexa-ease-interaction)' }}
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 pointer-events-auto',
        'bg-surface-elevated border-border',
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          className={cn(
            'mt-0.5 shrink-0',
            iconColorMap[toast.type],
          )}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-secondary font-light mt-0.5">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-tertiary hover:text-foreground transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 bg-border/30">
        <motion.div
          className={cn('h-full', progressColorMap[toast.type])}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.03, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}
