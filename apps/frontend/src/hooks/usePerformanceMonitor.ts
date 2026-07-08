'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export function usePerformanceMonitor() {
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const frames = [];

    const calculateFPS = () => {
      const now = performance.now();
      frameCount++;

      if (now >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        frames.push(fps);
        if (frames.length > 60) frames.shift();

        const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;

        if (avgFps < 55) {
          Sentry.captureMessage(`Performance Drop: ${avgFps.toFixed(1)} FPS`, {
            level: 'warning',
            extra: {
              avgFps,
              url: window.location.pathname,
            },
            tags: {
              metric: 'performance',
              type: 'fps_drop',
            },
          });
        }

        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(calculateFPS);
    };

    const handleLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;

        if (lcp > 1200) {
          Sentry.captureMessage(`LCP Threshold Exceeded: ${lcp.toFixed(0)}ms`, {
            level: 'warning',
            extra: { lcp, url: window.location.pathname },
            tags: {
              metric: 'performance',
              type: 'lcp_slow',
            },
          });
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    };

    const frameId = requestAnimationFrame(calculateFPS);
    handleLCP();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
}
