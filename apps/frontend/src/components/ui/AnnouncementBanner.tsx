'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'hexa-black-friday-banner-dismissed';

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Promotional banner"
      className="relative z-[100] w-full bg-gold text-sl-void flex items-center justify-center gap-3 px-4 py-2.5 text-center"
    >
      <p className="font-mono text-[11px] sm:text-xs font-medium uppercase tracking-[0.14em] sm:tracking-[0.18em] leading-none">
        <span className="font-bold">Black Friday:</span> 40% off all plans. Ends Monday.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Black Friday banner"
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-sm text-sl-void/70 hover:text-sl-void hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-void/30 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
