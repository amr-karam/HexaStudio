'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface GeminiLiveCritiqueProps {
  projectId: string;
  /**
   * Reserved for when a real backend AI critique endpoint is connected.
   * Currently unused: this component only provides a live microphone level
   * preview. No simulated AI observations are ever emitted.
   */
  onDirectiveGenerated?: (directive: { author: string; text: string }) => void;
}

const WAVEFORM_BARS = 16;
const AUDIO_LEVEL_THROTTLE_MS = 200;

export function GeminiLiveCritique({ projectId }: GeminiLiveCritiqueProps) {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string>(
    'AI spatial critique is not connected yet. Use the microphone to preview audio levels.',
  );
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lastLevelUpdateRef = useRef<number>(0);

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = (time: number) => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const level = Math.min(100, Math.round((avg / 255) * 100));

        // Direct DOM write per frame — no React re-render in the animation loop.
        barRefs.current.forEach((bar, i) => {
          if (!bar) return;
          const height = Math.max(15, Math.min(100, level * (0.5 + Math.sin(i + time * 0.01) * 0.5)));
          bar.style.height = `${height}%`;
        });

        // Throttled state update (a11y meter + container opacity) at ~200ms.
        if (time - lastLevelUpdateRef.current >= AUDIO_LEVEL_THROTTLE_MS) {
          lastLevelUpdateRef.current = time;
          setAudioLevel(level);
        }

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      animationFrameRef.current = requestAnimationFrame(updateLevel);

      setIsActive(true);
      setIsConnecting(false);
      setTranscript(
        `Listening for audio preview on ${projectId.toUpperCase()} — AI spatial critique is not connected yet.`,
      );
    } catch {
      setIsConnecting(false);
      setIsActive(false);
      setTranscript('Microphone access denied or audio hardware unavailable.');
    }
  };

  const stopSession = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    barRefs.current.forEach((bar) => {
      if (bar) bar.style.height = '15%';
    });
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return (
    <div className="rounded-2xl border border-border/30 bg-obsidian-raised/60 p-4 space-y-3 artisan-glass">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-amber-400 animate-pulse' : 'bg-neutral-600'}`} />
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-medium">Live Voice Preview</span>
        </div>

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-mono tracking-wider transition-all duration-300 ${
            isActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-obsidian border border-border/40 text-foreground hover:border-accent/40 hover:text-accent'
          }`}
        >
          {isConnecting ? 'Connecting...' : isActive ? '⏹ Disconnect' : '🎙️ Start Voice Preview'}
        </button>
      </div>

      <p className="text-[10px] font-mono text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5 leading-relaxed">
        Preview — simulated output, no AI connected. Microphone level meter is live; AI spatial critique is coming soon.
      </p>

      {isActive && (
        <div className="space-y-2 pt-1">
          {/* Live Audio Wave Bar — heights are written to the DOM directly per frame */}
          <div
            className="flex items-center space-x-1 h-3"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={audioLevel}
            aria-label="Microphone input level"
            style={{ opacity: audioLevel > 5 ? 0.9 : 0.25 }}
          >
            {[...Array(WAVEFORM_BARS)].map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                className="flex-1 bg-accent/60 rounded-full"
                style={{ height: '15%' }}
              />
            ))}
          </div>

          <p className="text-[11px] font-mono text-text-secondary leading-relaxed bg-obsidian/60 p-2.5 rounded-lg border border-border/20">
            {transcript}
          </p>
        </div>
      )}
    </div>
  );
}