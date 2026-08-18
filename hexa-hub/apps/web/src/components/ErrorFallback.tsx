'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { Button } from '@/components/ui/button';
import { hexaEasing, hexaDuration } from '@/lib/motion/tokens';

export interface ErrorFallbackProps {
  /** Error object from React's error boundary. */
  error?: Error | null;
  /** Reset handler from React's error boundary. */
  resetErrorBoundary?: () => void;
  /** Optional override message. */
  message?: string;
  /** Whether to show the "Go Home" button. */
  showHomeButton?: boolean;
  /** Additional class names. */
  className?: string;
}

/**
 * Fallback component rendered when the ErrorBoundary catches an error.
 * Uses design-system tokens and provides a polished error state with
 * retry and home navigation options.
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  message,
  showHomeButton = true,
  className,
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const displayMessage = message || error?.message || 'An unexpected error occurred.';

  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: hexaDuration.component, ease: hexaEasing.entrance }}
      className={cn('min-h-[400px] flex items-center justify-center p-8', className)}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md">
        <div className="relative mx-auto mb-6">
          <div
            className={cn(
              'w-20 h-20 rounded-2xl flex items-center justify-center',
              'bg-gold/10 border border-gold/20',
            )}
          >
            <AlertTriangle size={32} className="text-gold" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-2xl font-serif font-light text-foreground mb-3">
          Something went wrong
        </h1>

        <p className="text-secondary font-light mb-8">
          {displayMessage}
          {isDevelopment && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-tertiary">Show error details</summary>
              <pre className="mt-2 text-[10px] text-tertiary whitespace-pre-wrap break-all">
                {error.message}
              </pre>
            </details>
          )}
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            variant="primary"
            size="md"
            onClick={handleRetry}
            aria-label="Retry after error"
          >
            <RefreshCw size={14} />
            Try Again
          </Button>
          {showHomeButton && (
            <Button variant="secondary" size="md" asChild>
              <a href="/dashboard" aria-label="Go to dashboard">
                <Home size={14} />
                Go Home
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ErrorFallback;
