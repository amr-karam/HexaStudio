'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface GeminiLiveCritiqueProps {
  projectId: string;
  onDirectiveGenerated?: (directive: { author: string; text: string }) => void;
}

export function GeminiLiveCritique({ projectId, onDirectiveGenerated }: GeminiLiveCritiqueProps) {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      setIsActive(true);
      setIsConnecting(false);
      setTranscript('Gemini 3.1 Live spatial critic listening for architectural directives...');

      // Simulated initial synthetic spatial observation
      setTimeout(() => {
        const observation = `Spatial Analysis for ${projectId.toUpperCase()}: Circulation clearance along the primary axis meets luxury threshold. Consider refining cantilever lighting intensity.`;
        setTranscript(observation);
        onDirectiveGenerated?.({
          author: 'Gemini 3.1 Live AI',
          text: observation,
        });
      }, 2000);
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
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-medium">Gemini 3.1 Live Critic</span>
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
          {isConnecting ? 'Connecting...' : isActive ? '⏹ Disconnect Live AI' : '🎙️ Start Live Voice AI'}
        </button>
      </div>

      {isActive && (
        <div className="space-y-2 pt-1">
          {/* Live Audio Wave Bar */}
          <div className="flex items-center space-x-1 h-3">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-accent/60 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(15, Math.min(100, audioLevel * (0.5 + Math.sin(i + Date.now() * 0.01) * 0.5)))}%`,
                  opacity: audioLevel > 5 ? 0.9 : 0.25,
                }}
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
