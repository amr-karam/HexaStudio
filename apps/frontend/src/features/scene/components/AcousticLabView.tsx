'use client';

/**
 * Code Lens / HEXA Studio — Acoustic Reverberation & Noise Analysis Laboratory
 *
 * Calculates Sabine RT60 reverberation time (seconds) based on room volume (m³)
 * and surface material absorption coefficients (alpha).
 */

import React, { useState } from 'react';

export function AcousticLabView() {
  const [volume, setVolume] = useState(450); // m³
  const [wallMaterial, setWallMaterial] = useState<'concrete' | 'acoustic_panels' | 'glass' | 'wood'>('acoustic_panels');

  const absorptionCoefficients = {
    concrete: 0.02,
    glass: 0.05,
    wood: 0.15,
    acoustic_panels: 0.85,
  };

  const alpha = absorptionCoefficients[wallMaterial];
  const surfaceArea = 320; // m² total surface area
  const totalAbsorption = surfaceArea * alpha;
  const rt60 = (0.161 * volume) / totalAbsorption;

  const getAcousticRating = (val: number) => {
    if (val < 0.4) return { label: 'Dry / Recording Studio', color: 'text-blue-400' };
    if (val <= 0.8) return { label: 'Optimal / Executive Lounge', color: 'text-emerald-400' };
    if (val <= 1.5) return { label: 'Warm / Concert Hall', color: 'text-amber-400' };
    return { label: 'Echoey / Untreated Space', color: 'text-red-400' };
  };

  const rating = getAcousticRating(rt60);

  return (
    <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-neutral-100">Acoustic Reverberation & Noise Analysis Lab</h3>
          <p className="text-xs text-neutral-400">Sabine RT60 Sound Decay & Material Absorption</p>
        </div>
        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 ${rating.color}`}>
          {rating.label}
        </span>
      </div>

      {/* Room Volume Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400 font-medium">Room Spatial Volume</span>
          <span className="font-bold text-amber-400 font-mono">{volume} m³</span>
        </div>
        <input
          type="range"
          min={100}
          max={1500}
          step={25}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
      </div>

      {/* Surface Material Selection */}
      <div className="space-y-2">
        <label className="text-xs text-neutral-400 font-medium block">Wall & Ceiling Surface Treatment</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {(['concrete', 'glass', 'wood', 'acoustic_panels'] as const).map((mat) => (
            <button
              key={mat}
              onClick={() => setWallMaterial(mat)}
              className={`py-2 px-3 rounded-xl border text-center font-medium capitalize transition-all ${
                wallMaterial === mat
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {mat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">RT60 Decay Time</p>
          <p className="text-base font-bold text-neutral-100 font-mono mt-0.5">{rt60.toFixed(2)}s</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">Absorption Coeff (α)</p>
          <p className="text-base font-bold text-neutral-100 font-mono mt-0.5">{alpha.toFixed(2)}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">Total Sabines</p>
          <p className="text-base font-bold text-amber-400 font-mono mt-0.5">{totalAbsorption.toFixed(0)} Sa</p>
        </div>
      </div>
    </div>
  );
}
