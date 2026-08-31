
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * GlobalErrorBoundary — Hardened resilience layer for the frontend.
 * 
 * Specifically targets the "NotFoundError: Failed to execute insertBefore/removeChild" 
 * caused by hydration mismatches or browser extension interference.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true, error: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CRITICAL_UI_ERROR:", error, errorInfo);
    
    // If we detect a DOM mismatch error, we force a hard reload 
    // to clear the corrupted React fiber tree.
    if (error.message?.includes("insertBefore") || error.message?.includes("removeChild")) {
      console.warn("Hydration mismatch detected. Forcing clean remount...");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-sl-void text-alabaster p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-serif mb-4">An unexpected error occurred</h2>
            <p className="text-silver/60 mb-8 font-light">
              The visual experience encountered a synchronization error. 
              We are restoring the scene.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-sl-gold-subtle text-black text-xs uppercase tracking-widest font-medium hover:bg-white transition-colors"
            >
              Refresh Experience
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

