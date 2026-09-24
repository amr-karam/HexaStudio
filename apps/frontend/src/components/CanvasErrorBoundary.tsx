'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * CanvasErrorBoundary — wraps heavy 3D/WebGL components and falls back
 * gracefully if they crash. Maintains the silent luxury aesthetic with
 * a refined loading state instead of a raw error screen.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CanvasErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="relative flex min-h-[50vh] w-full items-center justify-center bg-sl-void">
          <div className="text-center">
            <p className="font-serif text-xl text-sl-alabaster/80">
              Vision
            </p>
            <p className="mt-3 text-sm text-sl-mist/60">
              Immersive experience momentarily unavailable.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
