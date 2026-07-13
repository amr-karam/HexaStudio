'use client';

import { useEffect } from 'react';

export function usePerformanceMonitor() {
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const frames: number[] = [];
    let frameId = 0;

    const reportToSentry = async (
      message: string,
      extra: Record<string, unknown>,
      type: string,
    ) => {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureMessage(message, {
        level: 'warning',
        extra,
        tags: {
          metric: 'performance',
          type,
        },
      });
    };

    const calculateFPS = () => {
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

    const handleLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
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
    };

    frameId = requestAnimationFrame(calculateFPS);
    handleLCP();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
}
