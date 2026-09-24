'use client';

import { Suspense, useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Html } from '@react-three/drei';
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

const PERFORMANCE_CONFIG = {
  low: { fpsTarget: 30, drawCallTarget: 500 },
  medium: { fpsTarget: 45, drawCallTarget: 1000 },
  high: { fpsTarget: 60, drawCallTarget: 2000 },
} as const;

const FPS_HISTORY_LENGTH = 60;

type CanvasState = {
  gl: THREE.WebGLRenderer;
  camera: THREE.Camera;
  scene: THREE.Scene;
  clock: THREE.Clock;
  stats?: { renderBounds?: { count: number } };
};

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

  const barColor = stats.drawCalls < 500 ? '#22c55e' : stats.drawCalls < 1000 ? '#eab308' : '#ef4444';

  return (
    <Html position={[-4, 3.5, 0]} className="pointer-events-none">
      <div
        style={{
          fontSize: '0.75rem',
          color: '#e4e4e8',
          background: 'rgba(15, 15, 16, 0.8)',
          border: '1px solid rgba(76, 76, 82, 0.5)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>WebGL Performance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0a0a0' }}>FPS:</span>
            <span style={{ color: barColor }}>{avgFps.toFixed(1)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0a0a0' }}>Frame:</span>
            <span style={{ color: '#c0c0c0' }}>{(1000 / stats.fps).toFixed(1)}ms</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0a0a0' }}>Draw Calls:</span>
            <span style={{ color: '#c0c0c0' }}>{stats.drawCalls}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a0a0a0' }}>Triangles:</span>
            <span style={{ color: '#c0c0c0' }}>{(stats.triangles / 1000).toFixed(1)}k</span>
          </div>
          <div style={{ width: '100%', height: '0.375rem', background: '#374151', borderRadius: '0.25rem', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, (stats.drawCalls / PERFORMANCE_CONFIG.high.drawCallTarget) * 100)}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>
      </div>
    </Html>
  );
}

function PerformanceWarning({ level, message }: { level: 'low' | 'medium' | 'high'; message: string }) {
  const colors = {
    low: '#ef4444',
    medium: '#eab308',
    high: '#22c55e',
  };

  return (
    <Html position={[0, 3.5, 0]} center className="pointer-events-none">
      <div
        style={{
          fontSize: '0.75rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          background: 'rgba(15, 15, 16, 0.8)',
          border: `1px solid ${colors[level]}`,
          color: colors[level],
        }}
      >
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
    <div
      style={{
        position: 'absolute' as const,
        bottom: '1rem',
        right: '1rem',
        background: 'rgba(15, 15, 16, 0.8)',
        border: '1px solid rgba(76, 76, 82, 0.5)',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        fontSize: '0.75rem',
        color: '#e4e4e8',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>WebGL Stats</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
        <div>
          <span style={{ color: '#a0a0a0' }}>FPS</span>
          <div style={{ fontFamily: 'monospace' }}>{stats.fps.toFixed(1)}</div>
        </div>
        <div>
          <span style={{ color: '#a0a0a0' }}>Draws</span>
          <div style={{ fontFamily: 'monospace' }}>{stats.drawCalls}</div>
        </div>
        <div>
          <span style={{ color: '#a0a0a0' }}>Tris</span>
          <div style={{ fontFamily: 'monospace' }}>{(stats.triangles / 1000).toFixed(1)}k</div>
        </div>
        <div>
          <span style={{ color: '#a0a0a0' }}>Mem</span>
          <div style={{ fontFamily: 'monospace' }}>{(stats.memory / 1024 / 1024).toFixed(1)}MB</div>
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

  const statsSphereRef = useRef<THREE.Mesh>(null);

  const handleCreated = useCallback((self: CanvasState) => {
    registerContext(self.gl);
  }, [registerContext]);

  useFrame((state) => {
    const fps = 1000 / state.clock.getDelta();
    const history = [...fpsHistory, fps].slice(-FPS_HISTORY_LENGTH);
    setFpsHistory(history);

    const avgFps = history.reduce((a, b) => a + b, 0) / history.length;

    setStats((prev) => {
      const newStats: PerformanceStats = {
        ...prev,
        fps: avgFps,
        frameTime: 1000 / avgFps,
        drawCalls: state.stats?.renderBounds?.count ?? prev.drawCalls,
        triangles: (state.stats?.renderBounds?.count ?? prev.triangles) * 100,
        memory: (state.gl as any).__memory?.UsedWebGLHandle ?? prev.memory,
        textures: (state.gl as any).__textures?.length ?? prev.textures,
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
          style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLOR_TOKENS.OBSIDIAN }}
        >
          <p style={{ color: '#a0a0a0', fontSize: '0.875rem' }}>Performance monitor paused</p>
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
          {statsSphereRef.current && (
            <primitive object={statsSphereRef.current} />
          )}
        </Suspense>
      </Canvas>
      {showStats && <StatsOverlay stats={stats} onStatsChange={setStats} />}
      {warningMessage && <PerformanceWarning level={warningLevel} message={warningMessage} />}
    </div>
  );
}

WebGLPerformanceMonitor.displayName = 'WebGLPerformanceMonitor';