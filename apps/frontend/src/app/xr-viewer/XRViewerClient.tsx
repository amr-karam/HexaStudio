'use client';

import { Component, ReactNode, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XRCanvas, XRView, XRUI, XRErrorFallback } from '@/features/xr';
import { useCollaboration } from '@/features/xr/hooks/useCollaboration';
import { useXRStore } from '@/features/xr/store/xr-store';
import { CollabPresence } from '@/features/xr/components/CollabPresence';
import { useAnalytics } from '@/lib/analytics';

class ErrorBoundary extends Component<{ children: ReactNode; onError?: (error: Error) => void; fallback: (error: Error) => ReactNode }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
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
  const projectId = searchParams.get('project') || null;
  const { track } = useAnalytics();
  const mode = useXRStore((s) => s.mode);
  const userName = searchParams.get('user') || 'Guest';

  const { sendCursor } = useCollaboration(projectId, userName, mode);

  useEffect(() => {
    if (modelUrl) {
      track('xr_viewer_load', { modelName: modelName || 'unnamed', modelUrl: modelUrl.slice(0, 100) });
    }
  }, [modelUrl, modelName, track]);

  return (
    <div className="fixed inset-0 bg-black">
      <XRCanvas>
        <XRView modelUrl={modelUrl ?? undefined} modelName={modelName} sendCursor={sendCursor} />
      </XRCanvas>
      <XRUI onExit={() => { track('xr_viewer_exit'); router.back(); }} modelName={modelName} />
      {projectId && <CollabPresence />}
    </div>
  );
}

function XRViewerFallback({ error }: { error: Error }) {
  const { track } = useAnalytics();
  useEffect(() => { track('xr_viewer_error', { error: error.message }); }, []);
  return <XRErrorFallback error={error} />;
}

export function XRViewerClient() {
  return (
    <ErrorBoundary fallback={(error: Error) => <XRViewerFallback error={error} />}>
      <XRViewerInner />
    </ErrorBoundary>
  );
}
