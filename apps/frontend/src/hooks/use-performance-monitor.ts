'use client';

import { useEffect, useRef, useCallback } from 'react';
import { PERFORMANCE_BUDGETS } from '@/lib/performance-budgets';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  lastFrameTime: number;
  averageFrameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  budgetBreaches: Array<{
    metric: string;
    value: number;
    budget: number;
    timestamp: number;
  }>;
}

export interface UsePerformanceMonitorOptions {
  /** Enable/disable monitoring */
  enabled?: boolean;
  /** Frame time budget in ms (default 16.6 = 60fps) */
  frameTimeBudget?: number;
  /** Draw call budget (default 500) */
  drawCallBudget?: number;
  /** Triangle budget (default 1M) */
  triangleBudget?: number;
  /** Callback when budget is breached */
  onBudgetBreach?: (metric: string, value: number, budget: number) => void;
}

/**
 * usePerformanceMonitor — Real-time 3D performance monitoring hook.
 *
 * Tracks frame times, FPS, and budget breaches. Integrates with
 * the CinematicScene via onFrame callback.
 *
 * Usage:
 * ```tsx
 * const monitor = usePerformanceMonitor({
 *   enabled: true,
 *   frameTimeBudget: 16.6,
 *   onBudgetBreach: (metric, value, budget) => {
 *     console.warn(`Budget breached: ${metric} ${value} > ${budget}`);
 *   },
 * });
 * ```
 */
export function usePerformanceMonitor({
  enabled = true,
  frameTimeBudget = PERFORMANCE_BUDGETS.frameTime,
  drawCallBudget = PERFORMANCE_BUDGETS.drawCalls,
  triangleBudget = PERFORMANCE_BUDGETS.triangles,
  onBudgetBreach,
}: UsePerformanceMonitorOptions = {}) {
  const frameTimes = useRef<number[]>([]);
  const lastFrameStart = useRef<number>(performance.now());
  const frameId = useRef<number | null>(null);
  const metrics = useRef<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    lastFrameTime: 0,
    averageFrameTime: 0,
    minFrameTime: Infinity,
    maxFrameTime: 0,
    budgetBreaches: [],
  });

  const checkBudget = useCallback(
    (metric: string, value: number, budget: number) => {
      if (value > budget) {
        metrics.current.budgetBreaches.push({
          metric,
          value,
          budget,
          timestamp: Date.now(),
        });
        onBudgetBreach?.(metric, value, budget);
      }
    },
    [onBudgetBreach]
  );

  useEffect(() => {
    if (!enabled) return;

    const measureFrame = () => {
      const now = performance.now();
      const frameTime = now - lastFrameStart.current;
      lastFrameStart.current = now;

      // Keep last 60 frames
      frameTimes.current.push(frameTime);
      if (frameTimes.current.length > 60) {
        frameTimes.current.shift();
      }

      const avg =
        frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
      const min = Math.min(...frameTimes.current);
      const max = Math.max(...frameTimes.current);
      const fps = 1000 / avg;

      metrics.current = {
        fps,
        frameTime,
        drawCalls: metrics.current.drawCalls,
        triangles: metrics.current.triangles,
        lastFrameTime: frameTime,
        averageFrameTime: avg,
        minFrameTime: min,
        maxFrameTime: max,
        budgetBreaches: metrics.current.budgetBreaches,
      };

      checkBudget('frameTime', frameTime, frameTimeBudget);
      checkBudget('drawCalls', metrics.current.drawCalls, drawCallBudget);
      checkBudget('triangles', metrics.current.triangles, triangleBudget);

      frameId.current = requestAnimationFrame(measureFrame);
    };

    frameId.current = requestAnimationFrame(measureFrame);

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [enabled, frameTimeBudget, drawCallBudget, triangleBudget, checkBudget]);

  return metrics;
}
