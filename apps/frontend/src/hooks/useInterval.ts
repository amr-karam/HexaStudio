'use client';

import { useEffect, useRef } from 'react';

/**
 * Declarative setInterval with stable callback ref.
 * `delay === null` pauses the interval (like Dan Abramov's recipe).
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => cbRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Declarative setTimeout with auto-cleanup and stable callback.
 * `delay === null` disables.
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => cbRef.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}
