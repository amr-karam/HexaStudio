'use client';

import { Component, ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XRCanvas, XRView, XRUI, XRErrorFallback } from '@/features/xr';

class ErrorBoundary extends Component<{ children: ReactNode; fallback: (error: Error) => ReactNode }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return this.props.fallback(this.state.error);
    return this.props.children;
  }
}

function XRViewerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modelUrl = searchParams.get('model');
  const modelName = searchParams.get('name') || undefined;

  return (
    <div className="fixed inset-0 bg-black">
      <XRCanvas>
        <XRView modelUrl={modelUrl ?? undefined} modelName={modelName} />
      </XRCanvas>
      <XRUI onExit={() => router.back()} modelName={modelName} />
    </div>
  );
}

export function XRViewerClient() {
  return (
    <ErrorBoundary fallback={(error) => <XRErrorFallback error={error} />}>
      <XRViewerInner />
    </ErrorBoundary>
  );
}
