'use client';

import { useEffect, useState } from 'react';

/**
 * Reports whether the document/tab is visible.
 * Uses the Page Visibility API (`document.visibilityState`).
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onChange = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onchange, { passive: true });
    return () => document.removeEventListener('visibilitychange', onchange, { passive: true });
  }, []);

  return visible;
}
