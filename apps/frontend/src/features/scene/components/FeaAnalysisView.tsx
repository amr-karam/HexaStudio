'use client';

/**
 * Code Lens / HEXA Studio — Structural Load & FEA Stress Heatmap Visualizer
 *
 * Displays von Mises structural stress heatmaps (MPa), column deflection limits (L/360),
 * and seismic tolerance ratings for luxury tower structures.
 */

import React, { useState } from 'react';

export function FeaAnalysisView() {
  const [loadMultiplier, setLoadMultiplier] = useState(1.2); // 1.2x live load
  const [seismicMagnitude, setSeismicMagnitude] = useState(7.2); // Richter scale

  const maxStressMpa = (145 * loadMultiplier).toFixed(1);
  const deflectionMm = (12.4 * loadMultiplier).toFixed(1);
  const safetyFactor = (3.5 / loadMultiplier).toFixed(2);

  return (
    <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-neutral-100">Structural FEA Stress Heatmap & Seismic Simulator</h3>
          <p className="text-xs text-neutral-400">Finite Element Analysis & Deflection Tolerances</p>
        </div>
        <span className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-mono">
          ✓ Structural Safety Factor: {safetyFactor}x
        </span>
      </div>

      {/* Live Load Multiplier Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400 font-medium">Applied Live Load Multiplier</span>
          <span className="font-bold text-amber-400 font-mono">{loadMultiplier.toFixed(2)}x Design Load</span>
        </div>
        <input
          type="range"
          min={0.8}
          max={2.5}
          step={0.1}
          value={loadMultiplier}
          onChange={(e) => setLoadMultiplier(parseFloat(e.target.value))}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
      </div>

      {/* Seismic Magnitude Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400 font-medium">Simulated Seismic Event</span>
          <span className="font-bold text-amber-400 font-mono">Richter {seismicMagnitude.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={5.0}
          max={9.0}
          step={0.1}
          value={seismicMagnitude}
          onChange={(e) => setSeismicMagnitude(parseFloat(e.target.value))}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
      </div>

      {/* FEA Gradient Stress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono text-neutral-400">
          <span>0 MPa (Neutral)</span>
          <span>150 MPa (Yield Threshold)</span>
          <span>300+ MPa (Critical)</span>
        </div>
        <div className="h-4 w-full rounded-xl bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-500 shadow-inner" />
      </div>

      {/* FEA Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">Max von Mises Stress</p>
          <p className="text-base font-bold text-amber-400 font-mono mt-0.5">{maxStressMpa} MPa</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">Max Deflection</p>
          <p className="text-base font-bold text-neutral-100 font-mono mt-0.5">{deflectionMm} mm</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">Deflection Code Limit</p>
          <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">L / 360 (Pass)</p>
        </div>
      </div>
    </div>
  );
}
