'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Reports whether the document/tab is visible.
 * Uses the Page Visibility API (document.visibilityState).
 *
 * @returns true when page is visible (i.e. NOT hidden), false when hidden.
 */
export function usePageVisibility(): boolean {
  const [visible, setVisible] = useState(
    () =>
      typeof document !== 'undefined'
        ? document.visibilityState === 'visible'
        : true,
  );

  const updateVisibility = useCallback(() => {
    if (typeof document === 'undefined') return;
    setVisible(document.visibilityState === 'visible');
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, [updateVisibility]);

  return visible;
}
