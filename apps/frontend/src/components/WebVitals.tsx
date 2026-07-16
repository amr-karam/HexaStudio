'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useCallback } from 'react';

const vitalsEndpoint = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;

export function WebVitals() {
  const handleReport = useCallback((metric: { name: string; value: number; id: string; rating?: string }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric.name, metric.value, metric.rating ?? '');
      return;
    }

    if (vitalsEndpoint) {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating ?? '',
        url: window.location.pathname,
        timestamp: Date.now(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(vitalsEndpoint, body);
      } else {
        fetch(vitalsEndpoint, { method: 'POST', body, keepalive: true }).catch(() => {});
      }
    }
  }, []);

  useReportWebVitals(handleReport);
  return null;
}
