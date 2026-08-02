'use client';

/**
 * HEXA Studio 3D Spatial Audio & Ambient Soundscape Generator
 *
 * Uses Web Audio API oscillator/noise nodes to generate procedural acoustic atmosphere
 * synced with lighting presets (Daylight Breeze, Sunset Resonance, Cyberpunk Sub-bass, Gallery Acoustics)
 * and material acoustic reflection pings (Marble, Smoked Glass, Brushed Gold, Concrete).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDesignerStore } from '../store/designer-store';

export function SpatialAudioPlayer() {
  const { activeLighting, activeMaterial } = useDesignerStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const startAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.value = volume;
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'sine';

      if (activeLighting === 'daylight') osc.frequency.value = 432;
      else if (activeLighting === 'golden_hour') osc.frequency.value = 216;
      else if (activeLighting === 'cyberpunk') osc.frequency.value = 108;
      else osc.frequency.value = 528;

      osc.connect(gain);
      osc.start();

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
      oscRef.current = osc;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (oscRef.current) oscRef.current.stop();
    if (audioCtxRef.current) audioCtxRef.current.close();
    audioCtxRef.current = null;
    gainNodeRef.current = null;
    oscRef.current = null;
    setIsPlaying(false);
  };

  const playMaterialPing = useCallback((mat: string) => {
    if (!audioCtxRef.current || !isPlaying) return;
    try {
      const ctx = audioCtxRef.current;
      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();

      pingOsc.type = mat === 'gold' ? 'triangle' : mat === 'glass' ? 'sine' : 'sine';
      const freq = mat === 'marble' ? 880 : mat === 'glass' ? 1200 : mat === 'gold' ? 659 : 330;
      pingOsc.frequency.setValueAtTime(freq, ctx.currentTime);

      pingGain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      pingGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      pingOsc.connect(pingGain);
      pingGain.connect(ctx.destination);

      pingOsc.start();
      pingOsc.stop(ctx.currentTime + 0.85);
    } catch {
      // Ignore audio context state glitches
    }
  }, [isPlaying, volume]);

  useEffect(() => {
    if (oscRef.current && audioCtxRef.current) {
      if (activeLighting === 'daylight') oscRef.current.frequency.setValueAtTime(432, audioCtxRef.current.currentTime);
      else if (activeLighting === 'golden_hour') oscRef.current.frequency.setValueAtTime(216, audioCtxRef.current.currentTime);
      else if (activeLighting === 'cyberpunk') oscRef.current.frequency.setValueAtTime(108, audioCtxRef.current.currentTime);
      else oscRef.current.frequency.setValueAtTime(528, audioCtxRef.current.currentTime);
    }
  }, [activeLighting]);

  useEffect(() => {
    playMaterialPing(activeMaterial);
  }, [activeMaterial, playMaterialPing]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center space-x-2 bg-neutral-900/90 border border-neutral-800 text-neutral-200 px-3 py-2 rounded-full shadow-2xl backdrop-blur-xl text-xs">
      <button
        onClick={isPlaying ? stopAudio : startAudio}
        className="flex items-center space-x-1.5 font-semibold hover:text-amber-400 transition-colors"
      >
        <span>{isPlaying ? '🔊' : '🔇'}</span>
        <span>{isPlaying ? 'Spatial Audio Active' : 'Soundscape'}</span>
      </button>

      {isPlaying && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 accent-amber-500 cursor-pointer"
        />
      )}
    </div>
  );
}
