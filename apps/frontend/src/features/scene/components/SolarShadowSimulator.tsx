'use client';

/**
 * Code Lens / HEXA Studio — Solar Path & Architectural Shadow Simulator
 *
 * Simulates real-time sun elevation, azimuth, shadow vectors, and solar radiation
 * gain (kW/m²) across a 24-hour architectural timeline slider (6:00 AM - 10:00 PM).
 */

import React, { useState } from 'react';

export function SolarShadowSimulator() {
  const [timeHour, setTimeHour] = useState(14); // Default 2:00 PM
  const [season, setSeason] = useState<'solstice_summer' | 'equinox' | 'solstice_winter'>('equinox');

  // Compute solar position metrics
  const sunElevation = Math.max(0, Math.sin(((timeHour - 6) / 12) * Math.PI) * (season === 'solstice_summer' ? 75 : season === 'solstice_winter' ? 35 : 55));
  const sunAzimuth = (timeHour - 6) * 15;
  const solarRadiation = (sunElevation / 90 * 0.95).toFixed(2); // kW/m²

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m < 10 ? '0' : ''}${m} ${ampm}`;
  };

  return (
    <div className="bg-neutral-950/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-bold text-neutral-100">Solar Path & Architectural Shadow Simulator</h3>
          <p className="text-xs text-neutral-400">Sustainable Lighting & Thermal Gain Analysis</p>
        </div>
        <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-mono">
          <span>☀️ {solarRadiation} kW/m²</span>
        </div>
      </div>

      {/* Sun Timeline Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Time of Day</span>
          <span className="font-bold text-amber-400 font-mono text-sm">{formatTime(timeHour)}</span>
        </div>
        <input
          type="range"
          min={6}
          max={22}
          step={0.25}
          value={timeHour}
          onChange={(e) => setTimeHour(parseFloat(e.target.value))}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>6:00 AM (Sunrise)</span>
          <span>12:00 PM (Zenith)</span>
          <span>6:00 PM (Sunset)</span>
          <span>10:00 PM (Night)</span>
        </div>
      </div>

      {/* Season Selector */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <button
          onClick={() => setSeason('solstice_summer')}
          className={`py-2 rounded-xl font-medium transition-all ${
            season === 'solstice_summer' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Summer Solstice
        </button>
        <button
          onClick={() => setSeason('equinox')}
          className={`py-2 rounded-xl font-medium transition-all ${
            season === 'equinox' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Equinox
        </button>
        <button
          onClick={() => setSeason('solstice_winter')}
          className={`py-2 rounded-xl font-medium transition-all ${
            season === 'solstice_winter' ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Winter Solstice
        </button>
      </div>

      {/* Real-Time Solar Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">Elevation Angle</p>
          <p className="text-base font-bold text-neutral-100 font-mono mt-0.5">{sunElevation.toFixed(1)}°</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">Azimuth Bearing</p>
          <p className="text-base font-bold text-neutral-100 font-mono mt-0.5">{sunAzimuth.toFixed(0)}°</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase font-mono">Shadow Length Multiplier</p>
          <p className="text-base font-bold text-amber-400 font-mono mt-0.5">
            {sunElevation > 5 ? (1 / Math.tan((sunElevation * Math.PI) / 180)).toFixed(2) : '∞'}x
          </p>
        </div>
      </div>
    </div>
  );
}
