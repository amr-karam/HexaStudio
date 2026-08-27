'use client';

import { useEffect, useRef } from 'react';

export interface UseClickOutsideOptions {
  /** Enable/disable the listener (default true when mounted). */
  enabled?: boolean;
  /** Event to listen to — default 'mousedown'. Use 'click' if you need click semantics. */
  event?: 'mousedown' | 'click' | 'pointerdown';
  /** Delay ms before attaching (avoids immediate close from opening click). Default 0. */
  delay?: number;
}

/**
 * Calls `handler` when a pointer event occurs outside `refs`.
 * Supports multiple refs (e.g. trigger + panel) and optional delay.
 *
 * @param refs  refs whose inside clicks should be ignored
 * @param handler called on outside interaction
 * @param options enabled/event/delay
 */
export function useClickOutside(
  refs: Array<React.RefObject<Element | null>>,
  handler: (event: MouseEvent) => void,
  options: UseClickOutsideOptions = {},
): void {
  const { enabled = true, event = 'mousedown', delay = 0 } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const listener = (e: Event) => {
      const target = e.target as Node | null;
      if (!target) return;
      const inside = refs.some((r) => r.current?.contains(target));
      if (!inside) handlerRef.current(e as MouseEvent);
    };

    let timer: ReturnType<typeof setTimeout> | null = null;
    if (delay > 0) {
      timer = setTimeout(() => document.addEventListener(event, listener), delay);
    } else {
      // micro-delay to avoid the opening click synchronously closing
      timer = setTimeout(() => document.addEventListener(event, listener), 0);
    }

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener(event, listener);
    };
  }, [enabled, event, delay, refs]);
}
