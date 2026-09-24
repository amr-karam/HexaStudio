'use client';

import { Component, ReactNode, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { XRView, XRErrorFallback } from '@/features/xr';
import { useCollaboration } from '@/features/xr/hooks/useCollaboration';
import { useWebRTC } from '@/features/xr/hooks/useWebRTC';
import { useSpatialCommands } from '@/features/xr/hooks/useSpatialCommands';
import { useXRStore } from '@/features/xr/store/xr-store';
import { useAnalytics } from '@/lib/analytics';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { preloadXRModel, preloadXRBundle } from '@/features/xr/utils/xr-assets';

const DynamicXRCanvas = dynamic(
  () => import('@/features/xr/components/XRCanvas').then((m) => m.XRCanvas),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-white font-mono text-sm">Loading 3D Experience…</div> },
);
const DynamicXRUI = dynamic(
  () => import('@/features/xr/components/XRUI').then((m) => m.XRUI),
  { ssr: false, loading: () => null },
);
const DynamicCollabPresence = dynamic(
  () => import('@/features/xr/components/CollabPresence').then((m) => m.CollabPresence),
  { ssr: false, loading: () => null },
);
const DynamicMediaControls = dynamic(
  () => import('@/features/xr/components/MediaControls').then((m) => m.MediaControls),
  { ssr: false, loading: () => null },
);

class ErrorBoundary extends Component<{ children: ReactNode; onError?: (error: Error) => void; fallback: (error: Error) => ReactNode }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) {
    import('@sentry/nextjs').then(({ captureException }) => {
      captureException(error);
    });
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
  const { isLowEnd, prefersReducedMotion } = useDeviceCapabilities();

  const { sendCursor, getSocket } = useCollaboration(projectId, userName, mode);
  const webrtc = useWebRTC(projectId, mode, getSocket);

  if (!isLowEnd) {
    useSpatialCommands(getSocket, projectId);
  }

  const materialOverrideCount = useXRStore((s) => Object.keys(s.materialOverrides).length);

  useEffect(() => {
    if (modelUrl) {
      track('xr_viewer_load', { modelName: modelName || 'unnamed', modelUrl: modelUrl.slice(0, 100) });
    }
    // Warm up the bundle and the specific model as soon as the client mounts
    // to accelerate the final render if not already preloaded via hover.
    preloadXRBundle();
    if (modelUrl) preloadXRModel(modelUrl);
  }, [modelUrl, modelName, track]);

  const showCollab = projectId && !isLowEnd;

  return (
    <div className="fixed inset-0 bg-black">
      <DynamicXRCanvas>
        <XRView modelUrl={modelUrl ?? undefined} sendCursor={isLowEnd ? undefined : sendCursor} />
      </DynamicXRCanvas>
      <DynamicXRUI onExit={() => { track('xr_viewer_exit'); router.back(); }} modelName={modelName} />
      {showCollab && <DynamicCollabPresence />}
      {showCollab && <DynamicMediaControls webrtc={webrtc} />}
      {materialOverrideCount > 0 && !prefersReducedMotion && (
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
