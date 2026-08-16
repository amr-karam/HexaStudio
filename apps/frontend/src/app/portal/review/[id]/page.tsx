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
import { GeminiLiveCritique } from '@/features/ai/components/GeminiLiveCritique';
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

  const [annotations, setAnnotations] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    { id: '1', author: 'Hexa Lead Architect', text: 'Facade louvers adjusted to 45-degree angle for solar shading.', time: '2m ago' },
    { id: '2', author: 'Client Reviewer', text: 'Confirmed travertine finish for primary portico columns.', time: 'Just now' },
  ]);
  const [newAnnotation, setNewAnnotation] = useState('');

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim()) return;
    setAnnotations((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        author: userName,
        text: newAnnotation.trim(),
        time: 'Just now',
      },
    ]);
    setNewAnnotation('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Rail */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs text-accent font-mono mb-1">
              <Link href="/portal/projects" className="hover:underline">← Projects</Link>
              <span>/</span>
              <span>Live 3D Review Room</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-light text-foreground">Project Review: <span className="italic text-accent">{projectId.toUpperCase()}</span></h1>
            <p className="text-xs text-text-muted font-light">Real-time WebRTC audio/video synchronization &amp; spatial model inspection</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => webrtc.toggleMic()}
              className={`rounded-xl px-4 py-2.5 text-xs font-mono tracking-wider transition-colors duration-300 ${
                webrtc.isMicMuted
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'bg-obsidian-raised border border-border/40 text-foreground hover:border-accent/40'
              }`}
            >
              {webrtc.isMicMuted ? '🎙️ Mic Muted' : '🎙️ Mic Active'}
            </button>

            <button
              onClick={() => setIsSignModalOpen(true)}
              className="rounded-xl bg-accent px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-background font-medium hover:opacity-90 transition-all duration-300 shadow-xl"
            >
              ✍️ Sign Off Deliverable
            </button>
          </div>
        </div>

        {/* 3D Review Stage & Media Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 3D Canvas Stage */}
          <div className="lg:col-span-8 h-[600px] relative rounded-2xl border border-border/30 bg-obsidian/90 overflow-hidden flex items-center justify-center artisan-glass">
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-obsidian-raised/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border/30 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-text-secondary">Multiplayer Session Active</span>
            </div>
            <CoNavControls />

            <XRCanvas>
              <SpatialCursors />
              <div className="text-center space-y-3 pointer-events-none">
                <div className="text-5xl">🏛️</div>
                <h3 className="text-lg font-serif font-light text-foreground">3D Interactive Review Canvas</h3>
                <p className="text-xs text-text-muted max-w-md mx-auto font-light leading-relaxed">
                  Drag to orbit, scroll to zoom, click spatial annotations to leave design directives in real time.
                </p>
              </div>
            </XRCanvas>

            {signatureHash && (
              <div className="absolute bottom-4 right-4 z-10 bg-emerald-950/90 border border-emerald-500/40 px-4 py-2.5 rounded-xl backdrop-blur-md text-xs text-emerald-300 font-mono shadow-2xl">
                ✓ Signed &amp; Stamped: <span className="font-mono text-white">{signatureHash.slice(0, 16)}...</span>
              </div>
            )}
          </div>

          {/* WebRTC Video Feeds, Participants & Live Directives */}
          <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
            {/* Gemini Live Spatial Critique Assistant */}
            <GeminiLiveCritique
              projectId={projectId}
              onDirectiveGenerated={(dir) => {
                setAnnotations((prev) => [
                  ...prev,
                  {
                    id: String(Date.now()),
                    author: dir.author,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: dir.text,
                  },
                ]);
              }}
            />

            <div className="rounded-2xl border border-border/30 bg-obsidian/70 p-5 space-y-4 artisan-glass">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-accent">Active Participants ({webrtc.peerConnections + 1})</h3>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-raised border border-border/20 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="h-7 w-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-mono font-bold text-[10px]">
                      YOU
                    </div>
                    <span className="font-medium text-foreground">{userName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Host</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-raised/60 border border-border/20 text-xs text-text-secondary">
                  <div className="flex items-center space-x-3">
                    <div className="h-7 w-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-[10px]">
                      HS
                    </div>
                    <span>Hexa Lead Architect</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">Presenter</span>
                </div>
              </div>
            </div>

            {/* Spatial Directives Stream */}
            <div className="rounded-2xl border border-border/30 bg-obsidian/70 p-5 space-y-4 artisan-glass flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-accent mb-3">Live Spatial Directives</h3>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {annotations.map((ann) => (
                    <div key={ann.id} className="p-3 rounded-xl bg-obsidian-raised/70 border border-border/20 text-xs">
                      <div className="flex justify-between text-[10px] font-mono text-text-muted mb-1">
                        <span className="text-accent">{ann.author}</span>
                        <span>{ann.time}</span>
                      </div>
                      <p className="text-text-secondary font-light leading-relaxed">{ann.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddAnnotation} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  placeholder="Add design directive..."
                  className="flex-1 bg-obsidian-raised border border-border/30 focus:border-accent text-foreground text-xs px-3 py-2 rounded-xl outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-accent text-background rounded-xl text-xs font-mono font-semibold hover:opacity-90 transition-opacity"
                >
                  Send
                </button>
              </form>
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
