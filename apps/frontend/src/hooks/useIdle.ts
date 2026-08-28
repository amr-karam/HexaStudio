'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Returns true after `timeout` ms of no user activity.
 * Listens to mousemove, keydown, scroll, touch, etc. — resets on any.
 *
 * @param timeout ms of inactivity before idle (default 60_000)
 * @param events  events that reset the timer
 */
const DEFAULT_IDLE_EVENTS: Array<keyof DocumentEventMap> = ['mousemove', 'keydown', 'scroll', 'touchstart', 'mousedown'];

export function useIdle(timeout = 60_000, events: Array<keyof DocumentEventMap> = DEFAULT_IDLE_EVENTS): boolean {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdle(true), timeout);
  }, [timeout]);

  useEffect(() => {
    reset();
    events.forEach((ev) => document.addEventListener(ev, reset, { passive: true } as AddEventListenerOptions));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((ev) => document.removeEventListener(ev, reset));
    };
  }, [reset, events]);

  return idle;
}
