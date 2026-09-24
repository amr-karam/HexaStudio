'use client';

import { Suspense, useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Html } from '@react-three/drei';
import type { QualityTier } from '@/providers/quality-provider';
import { COLOR_TOKENS, GOLD } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import * as THREE from 'three';

interface WebGLPerformanceMonitorProps {
  showFPS?: boolean;
  showDrawCalls?: boolean;
  showMemory?: boolean;
  showStats?: boolean;
  className?: string;
  onStatsChange?: (stats: PerformanceStats) => void;
}

interface PerformanceStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  memory: number;
  textures: number;
}

const SAMPLE_COUNT = 60;

const PERFORMANCE_CONFIG = {
  low: { fpsTarget: 30, drawCallTarget: 500 },
  medium: { fpsTarget: 45, drawCallTarget: 1000 },
  high: { fpsTarget: 60, drawCallTarget: 2000 },
} as const;

const FPS_HISTORY_LENGTH = 60;

function StatsOverlay({ stats, onStatsChange }: { stats: PerformanceStats; onStatsChange: (stats: PerformanceStats) => void }) {
  const fpsHistoryRef = useRef<number[]>([]);
  const [avgFps, setAvgFps] = useState(0);

  useEffect(() => {
    fpsHistoryRef.current.push(stats.fps);
    if (fpsHistoryRef.current.length > FPS_HISTORY_LENGTH) {
      fpsHistoryRef.current.shift();
    }
    const avg = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
    setAvgFps(avg);
  }, [stats.fps]);

  useEffect(() => {
    onStatsChange(stats);
  }, [stats, onStatsChange]);

  return (
    <Html position={[-4, 3.5, 0]} className="pointer-events-none">
      <div className="text-xs text-slate-200 bg-obsidian/80 border border-slate-700 rounded-lg p-3">
        <div className="font-bold text-gold-ink mb-2">WebGL Performance</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">FPS:</span>
            <span className={avgFps >= 55 ? 'text-green-400' : avgFps >= 45 ? 'text-yellow-400' : 'text-red-400'}>
              {avgFps.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Frame:</span>
            <span className="text-slate-300">{(1000 / stats.fps).toFixed(1)}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Draw Calls:</span>
            <span className="text-slate-300">{stats.drawCalls}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Triangles:</span>
            <span className="text-slate-300">{(stats.triangles / 1000).toFixed(1)}k</span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded overflow-hidden">
            <div
              className="h-full transition-all duration-100"
              style={{
                width: `${Math.min(100, (stats.drawCalls / PERFORMANCE_CONFIG.high.drawCallTarget) * 100)}%`,
                backgroundColor: stats.drawCalls < 500 ? '#22c55e' : stats.drawCalls < 1000 ? '#eab308' : '#ef4444',
              }}
            />
          </div>
        </div>
      </div>
    </Html>
  );
}

interface PerformanceWarningProps {
  level: 'low' | 'medium' | 'high';
  message: string;
}

function PerformanceWarning({ level, message }: PerformanceWarningProps) {
  const colors = {
    low: 'text-red-400',
    medium: 'text-yellow-400',
    high: 'text-green-400',
  };

  return (
    <Html position={[0, 3.5, 0]} center className="pointer-events-none">
      <div className={`text-xs px-3 py-1.5 rounded bg-obsidian/80 border ${colors[level]} border-current`}>
        {message}
      </div>
    </Html>
  );
}

function StatsSphere({ radius = 2 }: { radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [time, setTime] = useState(0);

  useFrame((_, delta) => {
    setTime((t) => t + delta);
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.position.y = Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial color={GOLD} wireframe />
    </mesh>
  );
}

function StaticPerformanceWidget({ stats }: { stats: PerformanceStats }) {
  return (
    <div className="absolute bottom-4 right-4 bg-obsidian/80 border border-slate-700 rounded-lg p-3 text-xs text-slate-200">
      <div className="font-bold text-gold-ink mb-2">WebGL Stats</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-slate-400">FPS</span>
          <div className="font-mono">{stats.fps.toFixed(1)}</div>
        </div>
        <div>
          <span className="text-slate-400">Draws</span>
          <div className="font-mono">{stats.drawCalls}</div>
        </div>
        <div>
          <span className="text-slate-400">Tris</span>
          <div className="font-mono">{(stats.triangles / 1000).toFixed(1)}k</div>
        </div>
        <div>
          <span className="text-slate-400">Mem</span>
          <div className="font-mono">{(stats.memory / 1024 / 1024).toFixed(1)}MB</div>
        </div>
      </div>
    </div>
  );
}

export function WebGLPerformanceMonitor({
  showFPS = true,
  showDrawCalls = true,
  showMemory = true,
  showStats = true,
  className,
  onStatsChange,
}: WebGLPerformanceMonitorProps) {
  const { shouldReduceMotion } = useMotionPolicy();
  const { tier } = useQualityTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.67,
    drawCalls: 0,
    triangles: 0,
    memory: 0,
    textures: 0,
  });
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);

  const { registerContext } = useContextLossRecovery({
    remountOnRestore: true,
    onLost: () => setContextLost(true),
    onRestore: () => setContextLost(false),
  });

  const handleCreated = useCallback((state: any) => {
    registerContext(state);
  }, [registerContext]);

  const statsSphereRef = useRef<any>(null);

  useFrame((state) => {
    const fps = 1000 / state.clock.getDelta();
    const history = [...fpsHistory, fps].slice(-FPS_HISTORY_LENGTH);
    setFpsHistory(history);

    const avgFps = history.reduce((a, b) => a + b, 0) / history.length;
    const gl = state.gl;

    setStats((prev) => {
      const newStats = {
        ...prev,
        fps: avgFps,
        frameTime: 1000 / avgFps,
        drawCalls: state.stats.renderBounds?.count ?? prev.drawCalls,
        triangles: state.stats?.renderBounds?.count * 100 ?? prev.triangles,
        memory: (gl as any).__memory?.UsedWebGLHandle ?? prev.memory,
        textures: (gl as any).__textures?.length ?? prev.textures,
      };

      if (onStatsChange) {
        onStatsChange(newStats);
      }

      return newStats;
    });
  });

  const warningLevel = useMemo(() => {
    const config = PERFORMANCE_CONFIG[tier.level];
    if (stats.fps < config.fpsTarget * 0.8) return 'low';
    if (stats.fps < config.fpsTarget * 0.9) return 'medium';
    return 'high';
  }, [stats.fps, tier.level]);

  const warningMessage = useMemo(() => {
    const config = PERFORMANCE_CONFIG[tier.level];
    if (stats.fps < config.fpsTarget * 0.8) return `Low FPS (${stats.fps.toFixed(1)}). Consider reducing quality.`;
    if (stats.drawCalls > config.drawCallTarget * 1.5) return `High draw calls (${stats.drawCalls}). Optimize geometry.`;
    return '';
  }, [stats.fps, stats.drawCalls, tier.level]);

  if (shouldReduceMotion) {
    return (
      <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
        {showStats && <StaticPerformanceWidget stats={stats} />}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
      {contextLost && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex items-center justify-center bg-obsidian"
        >
          <p className="text-slate-400 text-xs">Performance monitor paused</p>
        </div>
      )}
      <Canvas
        dpr={[1, tier.maxDpr]}
        frameloop="always"
        onCreated={handleCreated}
        gl={{
          antialias: tier.antialias !== false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          <ambientLight intensity={0.3} />
          <Environment preset="studio" environmentIntensity={0.2} />
          <StatsSphere ref={statsSphereRef} radius={1.5} />
        </Suspense>
      </Canvas>
      {showStats && <StatsOverlay stats={stats} onStatsChange={setStats} />}
      {warningMessage && (
        <PerformanceWarning level={warningLevel} message={warningMessage} />
      )}
    </div>
  );
}

WebGLPerformanceMonitor.displayName = 'WebGLPerformanceMonitor';

export { WebGLPerformanceMonitor };