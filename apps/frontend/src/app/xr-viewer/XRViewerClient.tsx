'use client';

import { Component, ReactNode, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XRCanvas, XRView, XRUI, XRErrorFallback } from '@/features/xr';
import { useCollaboration } from '@/features/xr/hooks/useCollaboration';
import { useWebRTC } from '@/features/xr/hooks/useWebRTC';
import { useSpatialCommands } from '@/features/xr/hooks/useSpatialCommands';
import { useXRStore } from '@/features/xr/store/xr-store';
import { CollabPresence } from '@/features/xr/components/CollabPresence';
import { MediaControls } from '@/features/xr/components/MediaControls';
import { useAnalytics } from '@/lib/analytics';
import { captureException } from '@sentry/nextjs';

class ErrorBoundary extends Component<{ children: ReactNode; onError?: (error: Error) => void; fallback: (error: Error) => ReactNode }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) {
    captureException(error);
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

  const { sendCursor, getSocket } = useCollaboration(projectId, userName, mode);
  const webrtc = useWebRTC(projectId, mode, getSocket);

  // Live Atelier: apply real-time AI material mutations to the scene.
  useSpatialCommands(getSocket, projectId);

  // Surface live AI overrides in the HUD so the client sees the agent "painting".
  const materialOverrideCount = useXRStore((s) => Object.keys(s.materialOverrides).length);

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
      {projectId && <MediaControls webrtc={webrtc} />}
      {materialOverrideCount > 0 && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-[var(--color-gold-subtle)]/30 bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-gold-subtle)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-gold-subtle)]" />
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-gold-subtle)]">
            Live Design · {materialOverrideCount}
          </span>
        </div>
      )}
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
