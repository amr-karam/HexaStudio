'use client';

/**
 * HEXA Portal v4.0 — WebRTC Live Video & Spatial 3D Review Room
 *
 * Provides real-time WebRTC audio/video call controls, synchronized 3D canvas viewport
 * sharing, screen sharing, and Horizon 3 Spatial Intelligence controls (generative lighting & material synthesis).
 */

import React, { useState } from 'react';
import { useDesignerStore } from '@/features/scene/store/designer-store';
import type { LightingPreset, MaterialPreset } from '@/features/scene/store/designer-store';
import { LIGHTING_PRESETS as LIGHTING_CONFIGS } from '@/features/scene/config/lighting-presets';
import { MATERIAL_PRESETS as MATERIAL_CONFIGS } from '@/features/scene/config/material-presets';

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
  { id: 'cyberpunk', name: 'Cyber Minimal', icon: '🌌', desc: 'High-contrast specular with moody shadows' },
  { id: 'gallery', name: 'Gallery Pinpoint', icon: '🏛️', desc: 'Neutral pin-point museum spotlight presentation' },
];

const MATERIAL_PRESETS: Array<{ id: MaterialPreset; name: string; color: string; desc: string }> = [
  { id: 'obsidian_marble', name: 'Obsidian Marble', color: 'bg-neutral-900 border-neutral-700', desc: 'High-gloss dark dielectric specular' },
  { id: 'brushed_titanium', name: 'Brushed Titanium', color: 'bg-neutral-600 border-neutral-400', desc: 'Anisotropic metallic sheen' },
  { id: 'raw_concrete', name: 'Raw Concrete', color: 'bg-neutral-400 border-neutral-300', desc: 'Subsurface scattering calcite white' },
  { id: 'warm_oak', name: 'Warm Oak', color: 'bg-amber-900/80 border-amber-800', desc: 'Deep biophilic organic grain' },
];

export function WebRtcReviewRoom() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(true);
  const [isCallActive, setIsCallActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'stream' | 'spatial' | 'remarks'>('stream');

  // Connect to Zustand Designer Store for live 3D synchronization
  const activeLighting = useDesignerStore((state) => state.activeLighting);
  const activeMaterial = useDesignerStore((state) => state.activeMaterial);
  const setLighting = useDesignerStore((state) => state.setLighting);
  const setMaterial = useDesignerStore((state) => state.setMaterial);

  const lightingConfig = LIGHTING_CONFIGS[activeLighting] ?? LIGHTING_CONFIGS.daylight;
  const materialConfig = MATERIAL_CONFIGS[activeMaterial] ?? MATERIAL_CONFIGS.obsidian_marble;

  const [remarks, setRemarks] = useState<ReviewRemark[]>([
    {
      id: 'r1',
      author: 'Marcus Vance',
      role: 'architect',
      text: 'Switched northern glazing facade to Obsidian Marble for glare mitigation.',
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
    <div className="bg-obsidian/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.06)] backdrop-blur-2xl text-foreground space-y-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/5 blur-[160px] rounded-full pointer-events-none" aria-hidden="true" />

      {/* Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/20 relative z-10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              Live WebRTC &amp; Spatial 3D Review Room
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-1 font-light">
            Project: <span className="text-foreground font-normal">Villa Horizon</span> &bull; Synchronized WebGL Review Session
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sub-view switcher tabs */}
          <div className="flex bg-obsidian-raised border border-white/10 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'stream'
                  ? 'bg-accent text-background font-medium shadow-md'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              3D Stream
            </button>
            <button
              onClick={() => setActiveTab('spatial')}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'spatial'
                  ? 'bg-accent text-background font-medium shadow-md'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Spatial AI
            </button>
            <button
              onClick={() => setActiveTab('remarks')}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'remarks'
                  ? 'bg-accent text-background font-medium shadow-md'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Remarks ({remarks.length})
            </button>
          </div>

          <span className="bg-obsidian-raised border border-emerald-500/30 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            E2EE
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {/* Main Stream (Architect / 3D Canvas Stream) */}
          <div className="md:col-span-2 relative aspect-video bg-void border border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center group shadow-2xl">

              {/* Dynamic Preset Atmosphere Background */}
              <div
                className="absolute inset-0 transition-all duration-700 pointer-events-none opacity-40"
                style={{
                  background: `radial-gradient(ellipse at center, ${lightingConfig.directionalColor}22 0%, ${lightingConfig.ambientColor}11 60%, #000000 100%)`,
                }}
              />

              {/* Viewport Top HUD Overlay */}
              <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-void/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-foreground">
                    CAM_01 &bull; NORTH FACADE
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-void/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-mono text-[10px] text-text-secondary">
                  <span>60 FPS</span>
                  <span className="text-neutral-600">&bull;</span>
                  <span>4K WebGL</span>
                </div>
              </div>

              {isScreenSharing ? (
                <div className="text-center space-y-4 z-20 p-6">
                  {/* Interactive Swatch Center Indicator */}
                  <div className="flex justify-center items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl border border-white/20 shadow-2xl transition-transform duration-500 transform group-hover:scale-105 flex items-center justify-center relative"
                      style={{
                        backgroundColor: materialConfig.color,
                        boxShadow: `0 0 35px ${lightingConfig.directionalColor}44`,
                      }}
                    >
                      <div className="w-2 h-2 rotate-45 bg-accent shadow-[0_0_8px_rgba(212,175,55,0.9)]" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-accent tracking-wide">
                      Synchronized 3D Viewport Live Stream
                    </p>
                    <p className="text-[11px] font-mono text-text-secondary mt-1">
                      Lighting: <span className="text-foreground">{activeLighting}</span> &bull; Material:{' '}
                      <span className="text-foreground">{activeMaterial}</span>
                    </p>
                  </div>
                </div>
              ) : isVideoOff ? (
                <div className="text-center space-y-3 z-20">
                  <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xl font-bold mx-auto shadow-lg">
                    MV
                  </div>
                  <p className="text-xs font-medium text-text-secondary">Marcus Vance (Lead Architect)</p>
                </div>
              ) : (
                <div className="w-full h-full bg-void flex flex-col items-center justify-center text-xs text-text-secondary space-y-2">
                  <span>[Live WebRTC Video Feed — 1080p60 WebGL Canvas Stream]</span>
                  <span className="text-[10px] font-mono text-accent">
                    Lighting: {activeLighting} | Material: {activeMaterial}
                  </span>
                </div>
              )}

              {/* Bottom Host Badge */}
              <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2 text-[11px] bg-void/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="font-semibold text-accent">Marcus Vance</span>
                <span className="text-neutral-500">&bull;</span>
                <span className="text-text-secondary font-light">Host (Lead Architect)</span>
              </div>
            </div>

            {/* Client Video Participant Card */}
            <div className="relative aspect-video md:aspect-auto bg-obsidian-raised border border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-lg">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold mx-auto shadow-md">
                  HC
                </div>
                <p className="text-xs font-medium text-foreground">Horizon Capital</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-text-secondary">
                  Active Participant
                </span>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-[10px] text-text-secondary bg-void/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
                <span>Client Audio / Video</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spatial' && (
          <div className="space-y-6 relative z-10">
            {/* Spatial Lighting Presets */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-accent">
                  Generative Lighting Synthesis
                </h4>
                <span className="text-[10px] font-mono text-text-muted">Real-Time HDRI &amp; Keylight Rig</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {LIGHTING_PRESETS.map((preset) => {
                  const isActive = activeLighting === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setLighting(preset.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-accent/10 border-accent text-foreground shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                          : 'bg-obsidian-raised border-white/5 text-text-secondary hover:border-white/20 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-sm font-medium text-foreground">{preset.name}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1 leading-snug font-light">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Material Synthesis Swatches */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-accent">
                  PBR Architectural Materials
                </h4>
                <span className="text-[10px] font-mono text-text-muted">Procedural Roughness &amp; Specular</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {MATERIAL_PRESETS.map((preset) => {
                  const isActive = activeMaterial === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setMaterial(preset.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'bg-accent/10 border-accent text-foreground shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                          : 'bg-obsidian-raised border-white/5 text-text-secondary hover:border-white/20 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className={`w-4 h-4 rounded-full border ${preset.color}`} />
                        <span className="text-sm font-medium text-foreground">{preset.name}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1 leading-snug font-light">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'remarks' && (
          <div className="space-y-4 relative z-10">
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
              {remarks.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl bg-obsidian-raised border border-white/5 flex justify-between items-start hover:border-white/15 transition-colors duration-200"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-accent">{r.author}</span>
                      <span className="text-[10px] font-mono text-text-muted">{r.timestamp}</span>
                      <span className="text-[9px] font-mono text-text-secondary bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        {r.spatialTag}
                      </span>
                    </div>
                    <p className="text-xs text-foreground mt-1.5 font-light leading-relaxed">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddRemark} className="flex gap-2.5 pt-3 border-t border-border/20">
              <input
                type="text"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Add spatial design review remark or feedback..."
                className="flex-1 bg-obsidian-raised border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent text-foreground px-4 py-3 rounded-xl text-xs outline-none transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!newRemark.trim()}
                className="px-5 py-3 bg-accent text-background font-mono text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-accent-light disabled:opacity-40 transition-all duration-200 cursor-pointer shadow-md"
              >
                Post
              </button>
            </form>
          </div>
        )}


      {/* WebRTC Call Controls Action Bar */}
      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border/20 gap-3 relative z-10">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              isAudioMuted
                ? 'bg-red-500/15 border border-red-500/40 text-red-400'
                : 'bg-obsidian-raised border border-white/10 text-foreground hover:border-white/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAudioMuted ? 'bg-red-400' : 'bg-emerald-400'}`} />
            {isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              isVideoOff
                ? 'bg-red-500/15 border border-red-500/40 text-red-400'
                : 'bg-obsidian-raised border border-white/10 text-foreground hover:border-white/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isVideoOff ? 'bg-red-400' : 'bg-emerald-400'}`} />
            {isVideoOff ? 'Start Camera' : 'Stop Camera'}
          </button>

          {/* Screen / 3D Canvas Share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              isScreenSharing
                ? 'bg-accent/15 border border-accent text-accent font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                : 'bg-obsidian-raised border border-white/10 text-text-secondary hover:text-foreground'
            }`}
          >
            <span>{isScreenSharing ? 'Stop 3D Broadcast' : 'Share 3D Viewport'}</span>
          </button>
        </div>

        {/* End Call Button */}
        <button
          onClick={() => setIsCallActive(!isCallActive)}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            isCallActive
              ? 'bg-red-600/90 hover:bg-red-600 text-white shadow-lg'
              : 'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-lg'
          }`}
        >
          {isCallActive ? 'Leave Session' : 'Rejoin Session'}
        </button>
      </div>
    </div>
  );
}

