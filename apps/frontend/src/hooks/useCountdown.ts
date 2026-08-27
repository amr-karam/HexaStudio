'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCountdownOptions {
  /** auto-start on mount (default true if initialSeconds > 0) */
  autoStart?: boolean;
  /** interval ms (default 1000) */
  interval?: number;
  /** called when countdown hits 0 */
  onComplete?: () => void;
}

export interface UseCountdownReturn {
  secondsLeft: number;
  isRunning: boolean;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  reset: (newSeconds?: number) => void;
}

/**
 * Countdown timer (1s tick by default) — for OTP resend, session expiry, etc.
 * `interval` uses `setInterval` under the hood; uses `useRef` for stable callbacks.
 */
export function useCountdown(
  initialSeconds: number,
  options: UseCountdownOptions = {},
): UseCountdownReturn {
  const { autoStart = initialSeconds > 0, interval = 1000, onComplete } = options;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart && initialSeconds > 0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const initialRef = useRef(initialSeconds);

  useEffect(() => {
    initialRef.current = initialSeconds;
  }, [initialSeconds]);

  const reset = useCallback(
    (newSeconds?: number) => {
      const next = newSeconds ?? initialRef.current;
      setSecondsLeft(next);
      setIsRunning(next > 0 && autoStart);
    },
    [autoStart],
  );

  const pause = useCallback(() => setIsRunning(false), []);
  const start = useCallback(() => {
    if (secondsLeft > 0) setIsRunning(true);
  }, [secondsLeft]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, interval);
    return () => clearInterval(id);
  }, [isRunning, secondsLeft, interval]);

  return {
    secondsLeft,
    isRunning,
    isComplete: secondsLeft === 0,
    start,
    pause,
    reset,
  };
}
