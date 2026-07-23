'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from './provider';
import { onIdle } from '@/lib/idle';

export function useAnalytics() {
  const track = useCallback(
    (event: string, properties?: Record<string, string | number | boolean | undefined>) => {
      analytics.track(event, properties);
    },
    [],
  );

  const identify = useCallback(
    (userId: string, traits?: Record<string, string | number | boolean | undefined>) => {
      analytics.identify(userId, traits);
    },
    [],
  );

  return { track, identify };
}

export function AnalyticsInit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Defer third-party analytics script injection to idle time so it
    // doesn't compete with hydration / first paint work on the main thread.
    const cancel = onIdle(() => analytics.init(), 2000);
    return () => cancel();
  }, []);

  useEffect(() => {
    const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    analytics.pageView(path);
  }, [pathname, searchParams]);

  return null;
}
