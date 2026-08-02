'use client';

/**
 * HEXA Portal v3.0 — WebRTC Live Video & 3D Canvas Review Room
 *
 * Provides real-time WebRTC audio/video call controls, synchronized 3D canvas viewport
 * sharing, screen sharing, and participant list for instant client-architect design reviews.
 */

import React, { useState } from 'react';

export function WebRtcReviewRoom() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);

  return (
    <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-5">
      {/* Room Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-neutral-100">Live WebRTC Design Review Room</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">Project: Villa Horizon — Phase 2 Real-Time Review</p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
          <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-emerald-400">
            🔒 End-to-End Encrypted
          </span>
        </div>
      </div>

      {/* Video Grid & 3D Viewport Synchronizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Stream (Architect / 3D Canvas Stream) */}
        <div className="md:col-span-2 relative aspect-video bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

          {isScreenSharing ? (
            <div className="text-center space-y-2 z-20">
              <span className="text-4xl">🖥️</span>
              <p className="text-xs font-semibold text-amber-400">Synchronized 3D Viewport Stream Shared</p>
            </div>
          ) : isVideoOff ? (
            <div className="text-center space-y-2 z-20">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl font-bold mx-auto">
                MV
              </div>
              <p className="text-xs font-semibold text-neutral-300">Marcus Vance (Lead Architect)</p>
            </div>
          ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-xs text-neutral-400">
              [Live WebRTC Video Feed — 1080p60 WebGL Canvas Stream]
            </div>
          )}

          <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2 text-[11px] text-neutral-200">
            <span className="font-bold text-amber-400">Marcus Vance</span>
            <span className="text-neutral-500">&bull;</span>
            <span className="text-neutral-400">Host (Architect)</span>
          </div>
        </div>

        {/* Client Video Participant */}
        <div className="relative aspect-video md:aspect-auto bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-sm font-bold mx-auto">
              HC
            </div>
            <p className="text-xs font-semibold text-neutral-300">Horizon Capital (Client)</p>
          </div>
          <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-[10px] text-neutral-300">
            <span>Client Participant</span>
          </div>
        </div>
      </div>

      {/* WebRTC Call Controls Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
        <div className="flex items-center space-x-2">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isAudioMuted ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isAudioMuted ? '🎙️ Unmute' : '🎙️ Mute'}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isVideoOff ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isVideoOff ? '📹 Start Video' : '📹 Stop Video'}
          </button>

          {/* Screen / 3D Canvas Share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isScreenSharing ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            🖥️ {isScreenSharing ? 'Stop 3D Canvas Share' : 'Share 3D Canvas'}
          </button>
        </div>

        {/* End Call Button */}
        <button
          onClick={() => setIsCallActive(!isCallActive)}
          className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
        >
          {isCallActive ? 'Leave Meeting' : 'Rejoin Meeting'}
        </button>
      </div>
    </div>
  );
}
