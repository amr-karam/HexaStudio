'use client';

import { useState, useEffect } from 'react';
import { useXRStore } from '../store/xr-store';
import { useXRStoreInit } from '../hooks/useXRStore';
import { checkXRSupport } from '../utils/xr-guard';
import { xrStore } from './XRCanvas';
import { useAnalytics } from '@/lib/analytics';

interface XRUIProps {
  onExit: () => void;
  modelName?: string;
  collabProjectId?: string | null;
}

export function XRUI({ onExit, modelName, collabProjectId: _collabProjectId }: XRUIProps) {
  useXRStoreInit();

  const { status, modelLoaded, placementPhase, setMode, setStatus, setPlacementPhase, setPlacementPosition, setPlacementRotation } = useXRStore();
  const [support, setSupport] = useState<{ ar: boolean; vr: boolean }>({ ar: false, vr: false });
  const [entering, setEntering] = useState<'ar' | 'vr' | null>(null);
  const { track } = useAnalytics();

  useEffect(() => {
    checkXRSupport().then(setSupport);
  }, []);

  const handleEnterAR = async () => {
    setEntering('ar');
    setMode('ar');
    setStatus('requesting');
    track('xr_session_enter', { mode: 'ar', modelName: modelName || 'unnamed' });
    try {
      await xrStore.enterAR();
      setStatus('active');
    } catch {
      setStatus('ended');
      setMode(null);
    } finally {
      setEntering(null);
    }
  };

  const handleEnterVR = async () => {
    setEntering('vr');
    setMode('vr');
    setStatus('requesting');
    track('xr_session_enter', { mode: 'vr', modelName: modelName || 'unnamed' });
    try {
      await xrStore.enterVR();
      setStatus('active');
    } catch {
      setStatus('ended');
      setMode(null);
    } finally {
      setEntering(null);
    }
  };

  const handleEndSession = async () => {
    const session = xrStore.getState().session;
    if (session) {
      await session.end();
    }
    track('xr_session_end', { mode: status, modelName: modelName || 'unnamed' });
    setStatus('ended');
    setMode(null);
    setPlacementPhase('idle');
    setPlacementPosition(null);
    setPlacementRotation(null);
  };

  const handleConfirmPlacement = () => {
    setPlacementPhase('placed');
    track('ar_placement_confirm', { modelName: modelName || 'unnamed' });
  };

  const handleReposition = () => {
    setPlacementPhase('placing');
    setPlacementPosition(null);
    track('ar_placement_reposition', { modelName: modelName || 'unnamed' });
  };

  const handleCancelPlacement = async () => {
    const session = xrStore.getState().session;
    if (session) {
      await session.end();
    }
    setPlacementPhase('idle');
    setPlacementPosition(null);
    setPlacementRotation(null);
    setMode(null);
    setStatus('ended');
    track('ar_placement_cancel', { modelName: modelName || 'unnamed' });
  };

  const isSessionActive = status === 'active';
  const isPlacing = isSessionActive && placementPhase === 'placing';
  const isPlaced = isSessionActive && placementPhase === 'placed';

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <>
        <button
          onClick={onExit}
          className="pointer-events-auto absolute end-4 top-4 rounded-full bg-black/50 px-4 py-2 text-sm text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          Exit
        </button>

        {modelName && !isSessionActive && (
          <div className="pointer-events-auto absolute start-4 top-4 max-w-[60%]">
            <p className="truncate text-sm text-white/60">
              {modelName}
            </p>
          </div>
        )}

        {!isSessionActive && (
          <div className="pointer-events-auto absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4">
            {support.ar && (
              <button
                onClick={handleEnterAR}
                disabled={entering === 'ar' || !modelLoaded}
                className="rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-medium text-black shadow-lg transition-all hover:bg-[#C49A2F] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {entering === 'ar' ? 'Starting AR...' : 'View in AR'}
              </button>
            )}
            {support.vr && (
              <button
                onClick={handleEnterVR}
                disabled={entering === 'vr' || !modelLoaded}
                className="rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {entering === 'vr' ? 'Starting VR...' : 'View in VR'}
              </button>
            )}
            {!support.ar && !support.vr && (
              <p className="rounded-lg bg-black/30 px-4 py-2 text-xs text-white/40 backdrop-blur-sm">
                WebXR not available on this device
              </p>
            )}
          </div>
        )}

        {isPlacing && (
          <>
            <div className="pointer-events-auto absolute left-1/2 top-8 -translate-x-1/2">
              <p className="rounded-full bg-black/50 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
                Tap a surface to place the model
              </p>
            </div>
            <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
              <button
                onClick={handleCancelPlacement}
                className="rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              >
                Cancel AR
              </button>
            </div>
          </>
        )}

        {isPlaced && (
          <div className="pointer-events-auto absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4">
            <button
              onClick={handleReposition}
              className="rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
            >
              Reposition
            </button>
            <button
              onClick={handleConfirmPlacement}
              className="rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-medium text-black shadow-lg transition-all hover:bg-[#C49A2F] active:scale-95"
            >
              Confirm Placement
            </button>
          </div>
        )}

        {isSessionActive && placementPhase === 'idle' && (
          <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={handleEndSession}
              className="rounded-lg bg-red-500/80 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-red-500 active:scale-95"
            >
              End AR Session
            </button>
          </div>
        )}
      </>
    </div>
  );
}
