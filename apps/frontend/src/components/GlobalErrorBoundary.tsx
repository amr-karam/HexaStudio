'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-screen w-full flex-col items-center justify-center p-8 text-center bg-background">
            <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">
              Something went wrong.
            </h2>
            <p className="mb-10 text-sm text-neutral-500 max-w-md leading-relaxed">
              The experience encountered an unexpected error. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="border border-accent/30 px-8 py-3 text-[10px] uppercase tracking-widest text-accent transition-all duration-300 hover:bg-accent hover:text-background"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
