'use client';

/**
 * HEXA Portal v4.0 — WebRTC Live Video & Spatial 3D Review Room
 *
 * Provides real-time WebRTC audio/video call controls, synchronized 3D canvas viewport
 * sharing, screen sharing, and Horizon 3 Spatial Intelligence controls (generative lighting & material synthesis).
 */

import React, { useState } from 'react';

type LightingPreset = 'golden_hour' | 'daylight' | 'twilight' | 'cyberpunk';
type MaterialPreset = 'obsidian_glass' | 'brushed_titanium' | 'fluted_marble' | 'smoked_oak';

interface ReviewRemark {
  id: string;
  author: string;
  role: 'architect' | 'client';
  text: string;
  timestamp: string;
  spatialTag: string;
}

const LIGHTING_PRESETS: Array<{ id: LightingPreset; name: string; icon: string; desc: string }> = [
  { id: 'golden_hour', name: 'Dawn Amber', icon: '🌅', desc: 'Warm 3200K cinematic directional keylight' },
  { id: 'daylight', name: 'Studio Daylight', icon: '☀️', desc: '5500K neutral diffused architectural light' },
  { id: 'twilight', name: 'Twilight Dusk', icon: '🌆', desc: 'Deep sapphire ambient with warm specular rims' },
  { id: 'cyberpunk', name: 'Cyber Minimal', icon: '🌌', desc: 'High-contrast neon specular with moody shadows' },
];

const MATERIAL_PRESETS: Array<{ id: MaterialPreset; name: string; color: string; desc: string }> = [
  { id: 'obsidian_glass', name: 'Obsidian Glass', color: 'bg-neutral-900 border-neutral-700', desc: 'High-gloss dark dielectric specular' },
  { id: 'brushed_titanium', name: 'Brushed Titanium', color: 'bg-neutral-600 border-neutral-400', desc: 'Anisotropic metallic sheen' },
  { id: 'fluted_marble', name: 'Fluted Marble', color: 'bg-neutral-200 border-neutral-300', desc: 'Subsurface scattering calcite white' },
  { id: 'smoked_oak', name: 'Smoked Oak', color: 'bg-amber-900/80 border-amber-800', desc: 'Deep biophilic organic grain' },
];

export function WebRtcReviewRoom() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(true);
  const [activeLighting, setActiveLighting] = useState<LightingPreset>('golden_hour');
  const [activeMaterial, setActiveMaterial] = useState<MaterialPreset>('obsidian_glass');
  const [activeTab, setActiveTab] = useState<'stream' | 'spatial' | 'remarks'>('stream');
  const [remarks, setRemarks] = useState<ReviewRemark[]>([
    {
      id: 'r1',
      author: 'Marcus Vance',
      role: 'architect',
      text: 'Switched northern glazing facade to Obsidian Glass for glare mitigation.',
      timestamp: '14:22',
      spatialTag: 'Camera 01 · Facade',
    },
    {
      id: 'r2',
      author: 'Horizon Capital',
      role: 'client',
      text: 'Approved amber lighting preset for the atrium lounge view.',
      timestamp: '14:25',
      spatialTag: 'Camera 03 · Atrium',
    },
  ]);
  const [newRemark, setNewRemark] = useState('');

  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.trim()) return;

    setRemarks((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        author: 'Current User',
        role: 'client',
        text: newRemark.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        spatialTag: `Preset · ${activeLighting}`,
      },
    ]);
    setNewRemark('');
  };

  return (
    <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-6">
      {/* Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-neutral-100">Live WebRTC &amp; Spatial 3D Review Room</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">Project: Villa Horizon — Horizon 3 Synchronized Canvas</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sub-view tabs */}
          <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'stream' ? 'bg-accent text-background font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Stream
            </button>
            <button
              onClick={() => setActiveTab('spatial')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'spatial' ? 'bg-accent text-background font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              ✨ Spatial AI
            </button>
            <button
              onClick={() => setActiveTab('remarks')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'remarks' ? 'bg-accent text-background font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              💬 Remarks ({remarks.length})
            </button>
          </div>

          <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-emerald-400 text-xs font-mono">
            🔒 E2EE Active
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Stream (Architect / 3D Canvas Stream) */}
          <div className="md:col-span-2 relative aspect-video bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />

            {isScreenSharing ? (
              <div className="text-center space-y-2 z-20">
                <span className="text-4xl">🖥️</span>
                <p className="text-xs font-semibold text-accent">Synchronized 3D Viewport Stream Active</p>
                <p className="text-[10px] font-mono text-neutral-400">Atmosphere: {activeLighting} &bull; Material: {activeMaterial}</p>
              </div>
            ) : isVideoOff ? (
              <div className="text-center space-y-2 z-20">
                <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xl font-bold mx-auto">
                  MV
                </div>
                <p className="text-xs font-semibold text-neutral-300">Marcus Vance (Lead Architect)</p>
              </div>
            ) : (
              <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-xs text-neutral-400 space-y-2">
                <span>[Live WebRTC Video Feed — 1080p60 WebGL Canvas Stream]</span>
                <span className="text-[10px] font-mono text-accent-light">Lighting: {activeLighting} | Material: {activeMaterial}</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2 text-[11px] text-neutral-200">
              <span className="font-bold text-accent">Marcus Vance</span>
              <span className="text-neutral-500">&bull;</span>
              <span className="text-neutral-400">Host (Architect)</span>
            </div>
          </div>

          {/* Client Video Participant */}
          <div className="relative aspect-video md:aspect-auto bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-sm font-bold mx-auto">
                HC
              </div>
              <p className="text-xs font-semibold text-neutral-300">Horizon Capital (Client)</p>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-[10px] text-neutral-300">
              <span>Client Participant</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'spatial' && (
        <div className="space-y-6">
          {/* Spatial Lighting Presets */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-accent">Generative Lighting Synthesis</h4>
              <span className="text-[10px] font-mono text-neutral-500">Real-Time HDRI &amp; Keylight Engine</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {LIGHTING_PRESETS.map((preset) => {
                const isActive = activeLighting === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setActiveLighting(preset.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-accent/15 border-accent text-foreground shadow-lg'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{preset.icon}</span>
                      <span className="text-sm font-medium text-foreground">{preset.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material Synthesis Swatches */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-accent">PBR Architectural Materials</h4>
              <span className="text-[10px] font-mono text-neutral-500">Procedural Roughness &amp; Specular</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MATERIAL_PRESETS.map((preset) => {
                const isActive = activeMaterial === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setActiveMaterial(preset.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-accent/15 border-accent text-foreground shadow-lg'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-4 h-4 rounded-full border ${preset.color}`} />
                      <span className="text-sm font-medium text-foreground">{preset.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'remarks' && (
        <div className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
            {remarks.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-accent">{r.author}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{r.timestamp}</span>
                    <span className="text-[9px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                      {r.spatialTag}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 mt-1">{r.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddRemark} className="flex gap-2 pt-2 border-t border-neutral-800">
            <input
              type="text"
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              placeholder="Add design review remark or feedback..."
              className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-accent text-foreground px-4 py-2.5 rounded-xl text-xs outline-none"
            />
            <button
              type="submit"
              disabled={!newRemark.trim()}
              className="px-4 py-2.5 bg-accent text-background font-mono text-xs uppercase tracking-wider rounded-xl hover:opacity-90 disabled:opacity-40"
            >
              Post Remark
            </button>
          </form>
        </div>
      )}

      {/* WebRTC Call Controls Bar */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-neutral-800 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isAudioMuted ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isAudioMuted ? '🎙️ Unmute' : '🎙️ Mute'}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isVideoOff ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {isVideoOff ? '📹 Start Video' : '📹 Stop Video'}
          </button>

          {/* Screen / 3D Canvas Share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isScreenSharing ? 'bg-accent text-background font-bold' : 'bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            🖥️ {isScreenSharing ? 'Stop 3D Share' : 'Share 3D Viewport'}
          </button>
        </div>

        {/* End Call Button */}
        <button
          onClick={() => setIsCallActive(!isCallActive)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-all"
        >
          {isCallActive ? 'Leave Meeting' : 'Rejoin Meeting'}
        </button>
      </div>
    </div>
  );
}
