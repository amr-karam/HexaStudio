'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMonitorOptions {
  /** Only measure when an active 3D scene is mounted. Defaults to false. */
  enabled?: boolean;
  /** Cooldown in ms between Sentry reports. Defaults to 60 000. */
  reportCooldown?: number;
  /** Max reports per session. Defaults to 3. */
  maxReports?: number;
}

/**
 * Lightweight FPS + LCP monitor that reports anomalies to Sentry.
 *
 * Gates behind an `enabled` flag so it only runs during active 3D scenes.
 * Rate-limits Sentry reports to avoid flooding.
 * Pauses RAF and observer when the tab is hidden.
 */
export function usePerformanceMonitor({
  enabled = false,
  reportCooldown = 60_000,
  maxReports = 3,
}: PerformanceMonitorOptions = {}) {
  const reportCountRef = useRef(0);
  const lastReportTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    const frames: number[] = [];
    let frameId = 0;
    let observer: PerformanceObserver | null = null;
    let isPaused = false;

    const reportToSentry = async (
      message: string,
      extra: Record<string, unknown>,
      type: string,
    ) => {
      // Rate-limit: cooldown + max-per-session
      const now = Date.now();
      if (
        reportCountRef.current >= maxReports ||
        now - lastReportTimeRef.current < reportCooldown
      ) {
        return;
      }
      reportCountRef.current++;
      lastReportTimeRef.current = now;

      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureMessage(message, {
          level: 'warning',
          extra,
          tags: {
            metric: 'performance',
            type,
          },
        });
      } catch {
        // Sentry import may fail; swallow silently
      }
    };

    const calculateFPS = () => {
      if (isPaused) return;
      const now = performance.now();
      frameCount++;

      if (now >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        frames.push(fps);
        if (frames.length > 60) frames.shift();

        const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;

        if (avgFps < 55) {
          void reportToSentry(
            `Performance Drop: ${avgFps.toFixed(1)} FPS`,
            { avgFps, url: window.location.pathname },
            'fps_drop',
          );
        }

        frameCount = 0;
        lastTime = now;
      }

      frameId = requestAnimationFrame(calculateFPS);
    };

    const initLCP = () => {
      if (typeof PerformanceObserver === 'undefined') return;

      try {
        observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (!lastEntry) return;
          const lcp = lastEntry.startTime;

          if (lcp > 1200) {
            void reportToSentry(
              `LCP Threshold Exceeded: ${lcp.toFixed(0)}ms`,
              { lcp, url: window.location.pathname },
              'lcp_slow',
            );
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // Some browsers may throw on observe
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(frameId);
      } else {
        isPaused = false;
        lastTime = performance.now();
        frameCount = 0;
        frameId = requestAnimationFrame(calculateFPS);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    frameId = requestAnimationFrame(calculateFPS);
    initLCP();

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer?.disconnect();
    };
  }, [enabled, reportCooldown, maxReports]);
}
