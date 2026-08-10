'use client';

/**
 * HEXA Studio Client Portal v3.0 — Live WebRTC 3D Collaborative Review Room
 *
 * Provides real-time video/audio streaming (via useWebRTC) paired with an interactive 3D model canvas,
 * multi-user cursor sync, and instant digital sign-offs.
 */

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useWebRTC } from '@/features/xr/hooks/useWebRTC';
import { useCollaboration } from '@/features/xr/hooks/useCollaboration';
import { ContractSignOffModal } from '@/features/portal/components/ContractSignOffModal';
import { CoNavControls } from '@/features/portal/components/CoNavControls';
import { XRCanvas } from '@/features/xr/components/XRCanvas';
import { SpatialCursors } from '@/features/xr/components/SpatialCursors';

interface ReviewRoomPageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewRoomPage({ params }: ReviewRoomPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const userName = 'Client Reviewer';

  const { getSocket } = useCollaboration(projectId, userName, null);
  const webrtc = useWebRTC(projectId, null, getSocket);

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signatureHash, setSignatureHash] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Rail */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold mb-1">
              <Link href="/portal/projects" className="hover:underline">← Projects</Link>
              <span>/</span>
              <span>Live 3D Review Room</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Project Review: {projectId.toUpperCase()}</h1>
            <p className="text-xs text-white/50">Real-time WebRTC audio/video sync & spatial model inspection</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => webrtc.toggleMic()}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                webrtc.isMicMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {webrtc.isMicMuted ? '🎙️ Unmute Mic' : '🎙️ Mic Active'}
            </button>

            <button
              onClick={() => setIsSignModalOpen(true)}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-black hover:bg-accent-light transition-colors"
            >
              ✍️ Sign Off Deliverable
            </button>
          </div>
        </div>

        {/* 3D Review Stage & Media Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main 3D Canvas Stage */}
          <div className="lg:col-span-3 h-[550px] relative rounded-2xl border border-white/10 bg-black/80 overflow-hidden flex items-center justify-center">
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Multiplayer Session Active</span>
            </div>
            <CoNavControls />

            <XRCanvas>
              <SpatialCursors />
              {/* 3D Model and Scene content would go here */}
              <div className="text-center space-y-3 pointer-events-none">
                <div className="text-5xl">🏛️</div>
                <h3 className="text-lg font-semibold text-white/80">3D Interactive Review Canvas</h3>
                <p className="text-xs text-white/40 max-w-md mx-auto">
                  Drag to orbit, scroll to zoom, click spatial annotations to leave design directives.
                </p>
              </div>
            </XRCanvas>

            {signatureHash && (
              <div className="absolute bottom-4 right-4 z-10 bg-emerald-950/80 border border-emerald-500/30 px-4 py-2 rounded-xl backdrop-blur-md text-xs text-emerald-300">
                ✓ Signed & Stamped: <span className="font-mono">{signatureHash}</span>
              </div>
            )}
          </div>

          {/* WebRTC Video Feeds & Participants */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0F0F10] p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">Active Participants ({webrtc.peerConnections + 1})</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      YOU
                    </div>
                    <span>{userName} (Client)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Host</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                      HS
                    </div>
                    <span>Hexa Lead Architect</span>
                  </div>
                  <span className="text-[10px] text-white/40">Presenter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContractSignOffModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        contractTitle={`Project Review Approval (${projectId.toUpperCase()})`}
        contractId={projectId}
        onSigned={(data) => {
          setSignatureHash(data.hash);
        }}
      />
    </div>
  );
}
