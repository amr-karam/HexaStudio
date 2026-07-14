'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

interface SceneErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface SceneErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class SceneErrorBoundary extends React.Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Scene Error:', error, errorInfo);
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-surface">
          <div className="text-center max-w-md px-6">
            <div className="w-12 h-12 mx-auto mb-4 border border-neutral-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
                />
              </svg>
            </div>
            <h3 className="text-foreground text-sm uppercase tracking-widest mb-2">
              3D Scene Unavailable
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              The 3D visualization could not be loaded. This may be due to browser
              compatibility or network issues. Please try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}