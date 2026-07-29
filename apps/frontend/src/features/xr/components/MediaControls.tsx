'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useXRStore } from '../store/xr-store';
import type { UseWebRTCResult } from '../hooks/useWebRTC';

/* -------------------------------------------------------------------------- */
/*  Quality icon helper                                                        */
/* -------------------------------------------------------------------------- */

function QualityIcon({ quality }: { quality: UseWebRTCResult['connectionQuality'] }) {
  const colorMap: Record<string, string> = {
    good: 'bg-emerald-500 shadow-emerald-500/50',
    fair: 'bg-amber-500 shadow-amber-500/50',
    poor: 'bg-red-500 shadow-red-500/50',
  };
  const dotCount = quality === 'good' ? 3 : quality === 'fair' ? 2 : 1;

  return (
    <div className="flex items-center gap-[2px]" title={`Connection: ${quality}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
            i < dotCount ? colorMap[quality] : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Speaking avatar stack                                                      */
/* -------------------------------------------------------------------------- */

function SpeakingIndicator({ peers }: { peers: string[] }) {
  if (peers.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
        Speaking
      </span>
      <div className="flex -space-x-1">
        <AnimatePresence mode="popLayout">
          {peers.slice(0, 3).map((id) => (
            <motion.div
              key={id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/30 ring-1 ring-emerald-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {peers.length > 3 && (
        <span className="text-[10px] text-white/30">+{peers.length - 3}</span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MediaControls component                                                    */
/* -------------------------------------------------------------------------- */

export function MediaControls({
  webrtc,
}: {
  webrtc: UseWebRTCResult;
}) {
  const mode = useXRStore((s) => s.mode);
  const collabConnected = useXRStore((s) => s.collabConnected);

  // Only show in VR mode when collaboration is active.
  if (mode !== 'vr' || !collabConnected) return null;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="pointer-events-auto fixed bottom-28 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
        {/* ── Mic toggle ────────────────────────────────────────────── */}
        <button
          onClick={webrtc.toggleMic}
          disabled={!webrtc.isAudioEnabled}
          className={`group relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
            webrtc.isMicMuted
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          } disabled:cursor-not-allowed disabled:opacity-40`}
          title={webrtc.isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-label={webrtc.isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {/* Mic icon — simplified SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
            {/* Mute slash */}
            {webrtc.isMicMuted && (
              <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
            )}
          </svg>

          {/* Mute ring indicator */}
          {webrtc.isMicMuted && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-400 ring-1 ring-black/50" />
          )}
        </button>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div className="h-6 w-px bg-white/10" />

        {/* ── Speaking peers ────────────────────────────────────────── */}
        <SpeakingIndicator peers={webrtc.speakingPeers} />

        {/* ── Spacer ────────────────────────────────────────────────── */}
        <div className="h-6 w-px bg-white/10" />

        {/* ── Connection quality + peer count ───────────────────────── */}
        <div className="flex items-center gap-2">
          <QualityIcon quality={webrtc.connectionQuality} />
          <span className="text-[11px] font-medium text-white/50">
            {webrtc.peerConnections > 0
              ? `${webrtc.peerConnections} peer${webrtc.peerConnections !== 1 ? 's' : ''}`
              : 'No peers'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
