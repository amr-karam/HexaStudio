'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/components/ui/cn';

/* ─── Types ────────────────────────────────────────────────────────────────── */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  createdAt: number;
}

interface ToastContextValue {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/* ─── Context ─────────────────────────────────────────────────────────────── */

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
}

/* ─── Provider ─────────────────────────────────────────────────────────────── */

const DEFAULT_DURATION = 5000;
const MAX_TOASTS = 6;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: ToastItem = { id, type, title, description, duration, createdAt: Date.now() };

      setToasts((prev) => {
        const next = [...prev, toast];
        if (next.length > MAX_TOASTS) {
          const removed = next.slice(0, next.length - MAX_TOASTS);
          removed.forEach((t) => {
            const timer = timersRef.current.get(t.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          });
          return next.slice(-MAX_TOASTS);
        }
        return next;
      });

      const ms = duration ?? DEFAULT_DURATION;
      const timer = setTimeout(() => dismiss(id), ms);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      const currentTimers = timersRef.current;
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  const toast = {
    success: useCallback((title: string, description?: string) => addToast('success', title, description), [addToast]),
    error: useCallback((title: string, description?: string) => addToast('error', title, description), [addToast]),
    warning: useCallback((title: string, description?: string) => addToast('warning', title, description), [addToast]),
    info: useCallback((title: string, description?: string) => addToast('info', title, description), [addToast]),
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ─── Toast Container ─────────────────────────────────────────────────────── */

const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
};

const progressColorMap: Record<ToastType, string> = {
  success: 'bg-success/60',
  error: 'bg-error/60',
  warning: 'bg-warning/60',
  info: 'bg-info/60',
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-toast flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Toast Card ─�─────────────────────────────────────────────────────────── */

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const Icon = iconMap[toast.type];
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? DEFAULT_DURATION;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());
  const pausedRef = useRef(false);
  const remainingRef = useRef(duration);

  useEffect(() => {
    startTimeRef.current = Date.now();
    remainingRef.current = duration;

    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / remainingRef.current) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onDismiss(toast.id);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [toast.id, duration, onDismiss]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    pausedRef.current = true;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    pausedRef.current = false;
    startTimeRef.current = Date.now();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: 80,
        scale: 0.9,
        transition: { duration: 0.2, ease: 'var(--hexa-ease-sharp)' },
      }}
      transition={{
        duration: 0.35,
        ease: 'var(--hexa-ease-entrance)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-xl border backdrop-blur-xl p-4 pointer-events-auto',
        'bg-surface-elevated/95 border-border',
      )}
    >
      {/* Background gradient accent */}
      <div
        className={cn(
          'absolute inset-0 opacity-[0.03]',
          toast.type === 'success' && 'bg-gradient-to-br from-success to-transparent',
          toast.type === 'error' && 'bg-gradient-to-br from-error to-transparent',
          toast.type === 'warning' && 'bg-gradient-to-br from-warning to-transparent',
          toast.type === 'info' && 'bg-gradient-to-br from-info to-transparent',
        )}
      />

      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
            'bg-white/[0.03]',
          )}
        >
          <Icon size={16} className={iconColorMap[toast.type]} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[13px] font-medium text-foreground leading-tight">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-[11px] text-secondary font-light mt-1 leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>

        {/* Close button */}
        <motion.button
          onClick={() => onDismiss(toast.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'p-1 rounded-md text-tertiary hover:text-foreground transition-colors shrink-0',
            isHovered ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Dismiss notification"
        >
          <X size={13} />
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/[0.04]">
        <motion.div
          className={cn('h-full', progressColorMap[toast.type])}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.03, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

export default ToastProvider;
