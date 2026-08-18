'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console (future: Sentry integration)
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const errorMessage = this.state.error?.message || 'An unexpected error occurred.';
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div
          className="min-h-[400px] flex items-center justify-center p-8"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-md">
            {/* Error icon with gold accent ring */}
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

            <h2 className="text-xl font-serif font-light text-foreground mb-3">
              Something went wrong
            </h2>

            <p className="text-sm text-secondary font-light mb-2">
              {errorMessage}
            </p>

            {isDevelopment && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-tertiary">
                  Show error details
                </summary>
                <pre className="mt-2 text-[10px] text-tertiary whitespace-pre-wrap break-all">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <p className="text-xs text-tertiary font-light mb-8 mt-4">
              Please try again. If the issue persists, contact support.
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleRetry}
                aria-label="Retry after error"
              >
                <RefreshCw size={14} />
                Try Again
              </Button>
              <Button
                variant="secondary"
                size="sm"
                asChild
              >
                <a href="/dashboard" aria-label="Go to dashboard">
                  <Home size={14} />
                  Go Home
                </a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
