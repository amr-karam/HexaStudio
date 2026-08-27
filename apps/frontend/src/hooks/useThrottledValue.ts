'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Returns a throttled copy of `value` — at most one update per `limit` ms.
 * Leading edge fires immediately, trailing edge fires with latest value.
 *
 * Ideal for scroll/resize/mousemove values where debounce would lag too far.
 *
 * @param value  source value
 * @param limit  minimum ms between commits (default 200)
 */
export function useThrottledValue<T>(value: T, limit: number = 200): T {
  const [throttled, setThrottled] = useState<T>(value);
  const lastRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<T>(value);
  latestRef.current = value;

  useEffect(() => {
    const now = Date.now();
    const remaining = limit - (now - lastRef.current);

    if (remaining <= 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      lastRef.current = now;
      setThrottled(value);
    } else if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        lastRef.current = Date.now();
        timerRef.current = null;
        setThrottled(latestRef.current);
      }, remaining);
    }

    return () => {
      // do not clear on value change — trailing must fire; only cleanup on unmount handled below
    };
  }, [value, limit]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return throttled;
}

/**
 * Throttled callback — at most one invocation per `limit` ms (leading + trailing).
 *
 * @param callback function to throttle
 * @param limit ms window (default 200)
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number = 200,
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const lastRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const argsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = limit - (now - lastRef.current);
      argsRef.current = args;

      if (remaining <= 0) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        lastRef.current = now;
        callbackRef.current(...args);
      } else if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          lastRef.current = Date.now();
          timerRef.current = null;
          if (argsRef.current) callbackRef.current(...(argsRef.current as Parameters<T>));
        }, remaining);
      }
    },
    [limit],
  );
}
