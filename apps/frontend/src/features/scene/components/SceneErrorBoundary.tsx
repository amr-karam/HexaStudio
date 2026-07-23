'use client';

import React from 'react';
import Link from 'next/link';
import { captureException } from '@sentry/nextjs';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface SceneErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  sentryReported: boolean;
}

interface SceneErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Cover image URL for visual fallback when WebGL fails. */
  fallbackImage?: string;
  /** Project title displayed in the fallback. */
  title?: string;
  /** Short description shown below the title. */
  description?: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export class SceneErrorBoundary extends React.Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, sentryReported: false };
  }

  static getDerivedStateFromError(error: Error): Partial<SceneErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Scene Error:', error, errorInfo);

    // Capture once — don't repeat on re-renders.
    if (!this.state.sentryReported) {
      captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
      this.setState({ sentryReported: true });
    }
  }

  render() {
    if (this.state.hasError) {
      // Allow a completely custom fallback from the parent.
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { fallbackImage, title, description } = this.props;

      return (
        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-[#050505]">
          {/* Background cover image (if provided). */}
          {fallbackImage && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${fallbackImage})` }}
            />
          )}

          <div className="relative z-10 text-center max-w-md px-6">
            {/* Icon / illustration. */}
            <div className="w-14 h-14 mx-auto mb-5 border border-white/10 flex items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm">
              <svg
                className="w-7 h-7 text-[#D4AF37]"
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

            {/* Title. */}
            <h3 className="text-white/80 text-sm uppercase tracking-widest mb-2">
              {title || '3D Scene Unavailable'}
            </h3>

            {/* Description. */}
            <p className="text-neutral-400 text-xs leading-relaxed mb-6">
              {description ||
                'The 3D visualization could not be loaded. This may be due to browser compatibility or network issues.'}
            </p>

            {/* Navigation CTAs. */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-[#D4AF37] px-5 py-2.5 text-xs font-medium text-black transition-colors hover:bg-[#C49A2F]"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/80"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
