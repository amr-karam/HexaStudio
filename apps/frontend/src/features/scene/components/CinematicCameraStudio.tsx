'use client';

/**
 * Code Lens / HEXA Studio — Multi-Camera Cinematic Flythrough Studio
 *
 * Allows architects and clients to add keyframe waypoints, configure 3D camera transitions,
 * adjust easing curves, and export 60fps architectural flythrough video recordings.
 */

import React, { useState } from 'react';

interface Keyframe {
  id: string;
  name: string;
  fov: number;
  duration: number; // in seconds
  easing: 'cubic' | 'ease-in-out' | 'linear';
}

export function CinematicCameraStudio() {
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    { id: 'kf-1', name: '01. Exterior Grand Entrance', fov: 45, duration: 4, easing: 'ease-in-out' },
    { id: 'kf-2', name: '02. Atrium Double-Height Void', fov: 50, duration: 6, easing: 'cubic' },
    { id: 'kf-3', name: '03. Penthouse Terrace Panorama', fov: 35, duration: 5, easing: 'ease-in-out' },
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeKeyframeId, setActiveKeyframeId] = useState<string>('kf-1');

  const addKeyframe = () => {
    const newKf: Keyframe = {
      id: `kf-${Date.now()}`,
      name: `0${keyframes.length + 1}. Custom Viewpoint`,
      fov: 45,
      duration: 5,
      easing: 'ease-in-out',
    };
    setKeyframes([...keyframes, newKf]);
  };

  const totalDuration = keyframes.reduce((sum, kf) => sum + kf.duration, 0);

  return (
    <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-neutral-100">Multi-Camera Cinematic Flythrough Studio</h3>
          <p className="text-xs text-neutral-400">3D Keyframe Animation & 60fps Render Timeline</p>
        </div>
        <span className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-mono">
          ⏱️ {totalDuration}s Total Sequence
        </span>
      </div>

      {/* Keyframe Timeline List */}
      <div className="space-y-2">
        {keyframes.map((kf, index) => (
          <div
            key={kf.id}
            onClick={() => setActiveKeyframeId(kf.id)}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
              activeKeyframeId === kf.id
                ? 'bg-neutral-900 border-amber-500/50 text-neutral-100 shadow-lg'
                : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center space-x-3 text-xs">
              <span className="font-mono text-amber-400 font-bold">{index + 1}</span>
              <span className="font-medium">{kf.name}</span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono text-neutral-400">
              <span>FOV: {kf.fov}°</span>
              <span>•</span>
              <span>{kf.duration}s</span>
              <span>•</span>
              <span className="bg-neutral-800 px-2 py-0.5 rounded-md text-neutral-300 capitalize">{kf.easing}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={addKeyframe}
          className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-200 transition-colors"
        >
          ➕ Add Camera Keyframe
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isPlaying ? 'bg-amber-500 text-neutral-950' : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
            }`}
          >
            {isPlaying ? '⏸️ Pause Flythrough' : '▶️ Preview Flythrough'}
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-neutral-200 transition-colors">
            🎬 Export 4K 60fps MP4
          </button>
        </div>
      </div>
    </div>
  );
}
