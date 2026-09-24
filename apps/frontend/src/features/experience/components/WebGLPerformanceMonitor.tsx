'use client';

import { Suspense, useRef, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Html } from '@react-three/drei';
import { COLOR_TOKENS, GOLD } from '@/lib/color-tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier, type QualityLevel } from '@/providers/quality-provider';
import { useContextLossRecovery } from '@/hooks/useContextLossRecovery';
import * as THREE from 'three';

const WARNING_THRESHOLD_FPS = 30;
const HIGH_WARNING_FPS = 20;

const PERFORMANCE_COLORS = {
  excellent: '#22c55e',
  good: '#84cc16',
  moderate: '#eab308',
  poor: '#f97316',
  critical: '#ef4444',
};

const WARNING_COLOR = '#f97316';
const ERROR_COLOR = '#ef4444';
const BORDER_COLOR = '#4b5563';

interface WebGLPerformanceMonitorProps {
  showStats?: boolean;
  className?: string;
  onStatsChange?: (stats: PerformanceStats) => void;
}

interface PerformanceStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  tier: string;
  warnings: Array<{ level: 'low' | 'medium' | 'high'; message: string }>;
}

const STATS_STYLE = {
  container: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    background: COLOR_TOKENS.OBSIDIAN,
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: `1px solid ${PERFORMANCE_COLORS.excellent}`,
    fontSize: '0.75rem',
    color: '#f5f5f4',
  },
  label: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  meter: { height: '4px', background: BORDER_COLOR, borderRadius: '2px', overflow: 'hidden' as const },
  bar: { height: '100%', transition: 'width 0.1s' },
};

function StatsPanel({ stats }: { stats: PerformanceStats }) {
  const warningColor = stats.warnings.length > 0 ? stats.warnings[0].level === 'high' ? ERROR_COLOR : stats.warnings[0].level === 'medium' ? WARNING_COLOR : GOLD : PERFORMANCE_COLORS.excellent;

  return (
    <div style={STATS_STYLE.container}>
      <div style={STATS_STYLE.label}>
        <span style={{ color: '#a0a0a0', fontSize: '0.75rem' }}>FPS</span>
        <span style={{ fontWeight: 500, color: warningColor }}>{stats.fps.toFixed(1)}</span>
      </div>
      <div style={STATS_STYLE.meter}>
        <div
          style={{
            ...STATS_STYLE.bar,
            width: `${Math.min(100, (stats.fps / 60) * 100)}%`,
            backgroundColor: warningColor,
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#a0a0a0' }}>
          <span>{stats.drawCalls}</span> <span>draw calls</span>
        </div>
        <div style={{ fontSize: '0.65rem', color: '#a0a0a0' }}>
          <span>{stats.triangles.toLocaleString()}</span> <span>triangles</span>
        </div>
      </div>
      {stats.warnings.length > 0 && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: COLOR_TOKENS.OBSIDIAN, borderRadius: '0.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem', color: '#f5f5f4' }}>Warnings</div>
          {stats.warnings.map((w, i) => (
            <div key={i} style={{ fontSize: '0.65rem', color: w.level === 'high' ? ERROR_COLOR : w.level === 'medium' ? WARNING_COLOR : GOLD }}>
              • {w.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STATIC_STATS_STYLE = {
  container: { padding: '1rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  label: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  tier: { fontWeight: 500, color: '#f5f5f4' },
};

function StaticPerformancePanel({ tier }: { tier: QualityLevel }) {
  const tierInfo: Record<QualityLevel, { label: string; maxParticles: number; color: string }> = {
    low: { label: 'Low Quality', maxParticles: 50, color: '#3b82f6' },
    medium: { label: 'Medium Quality', maxParticles: 100, color: '#f97316' },
    high: { label: 'High Quality', maxParticles: 200, color: GOLD },
  };

  const info = tierInfo[tier];

  return (
    <div style={STATIC_STATS_STYLE.container}>
      <div style={STATIC_STATS_STYLE.label}>
        <div style={{ ...STATIC_STATS_STYLE.dot, backgroundColor: info.color }} />
        <span style={STATIC_STATS_STYLE.tier}>{info.label} Tier</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
        <div>Max particles: {info.maxParticles}</div>
        <div>Shadows: {tier === 'low' ? 'Disabled' : tier === 'medium' ? 'Low' : 'High'}</div>
        <div>Antialias: {tier !== 'low' ? 'Enabled' : 'Disabled'}</div>
      </div>
    </div>
  );
}

export function WebGLPerformanceMonitor({
  showStats = true,
  className,
  onStatsChange,
}: WebGLPerformanceMonitorProps) {
  const { animationsEnabled } = useMotionPolicy();
  const { tier } = useQualityTier();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    tier: tier.level,
    warnings: [],
  });

  const { registerContext } = useContextLossRecovery({
    remountOnRestore: true,
    onLost: () => setContextLost(true),
    onRestore: () => setContextLost(false),
  });

  const handleCreated = useCallback((state: RootState) => {
    registerContext(state);
    const gl = state.gl;
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateStats = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        const rendererInfo = gl.info;
        
        const warnings: Array<{ level: 'low' | 'medium' | 'high'; message: string }> = [];
        
        if (fps < WARNING_THRESHOLD_FPS) {
          warnings.push({ 
            level: fps < HIGH_WARNING_FPS ? 'high' : 'medium', 
            message: `FPS below target: ${fps}` 
          });
        }
        
        if (rendererInfo.render.calls > 1000) {
          warnings.push({ level: 'medium', message: 'High draw call count' });
        }
        
        const newStats: PerformanceStats = {
          fps,
          drawCalls: rendererInfo.render.calls,
          triangles: rendererInfo.render.triangles,
          tier: tier.level,
          warnings,
        };
        
        setStats(newStats);
        onStatsChange?.(newStats);
        
        frameCount = 0;
        lastTime = now;
      }
    };
    
    const animationId = gl.setAnimationLoop(() => {
      updateStats();
    });
    
    return () => {
      gl.setAnimationLoop(null);
    };
  }, [registerContext, tier, onStatsChange]);

  if (!animationsEnabled) {
    return (
      <div ref={containerRef} className={`relative ${className ?? 'h-full w-full'}`}>
        <StaticPerformancePanel tier={tier.level} />
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
          antialias: tier.antialias === 'msaa',
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: COLOR_TOKENS.VOID }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
          <ambientLight intensity={0.1} />
          <Environment preset="warehouse" environmentIntensity={0.2} />
        </Suspense>
      </Canvas>
      {showStats && <StatsPanel stats={stats} />}
    </div>
  );
}

WebGLPerformanceMonitor.displayName = 'WebGLPerformanceMonitor';