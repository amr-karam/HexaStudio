'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
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

    // Call optional onError callback
    this.props.onError?.(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {/* Error icon with gold accent ring */}
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#D4A843]/10 border border-[#D4A843]/20 flex items-center justify-center">
                <AlertTriangle size={32} className="text-[#D4A843]" />
              </div>
            </div>

            <h2 className="text-xl font-serif font-light text-white mb-3">
              Something went wrong
            </h2>

            <p className="text-sm text-[#888] font-light mb-2">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>

            <p className="text-xs text-[#555] font-light mb-8">
              Please try again. If the issue persists, contact support.
            </p>

            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A843] text-[#0A0A0A] rounded-xl text-sm font-medium hover:bg-[#D4A843]/90 hover:shadow-[0_0_24px_rgba(212,168,67,0.2)] transition-all duration-200"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
