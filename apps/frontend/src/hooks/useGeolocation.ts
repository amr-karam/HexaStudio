'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface GeolocationState {
  coords: GeolocationCoordinates | null;
  error: GeolocationPositionError | Error | null;
  isLoading: boolean;
}

export interface UseGeolocationOptions extends PositionOptions {
  /** watch position continuously (default false — one-shot) */
  watch?: boolean;
  /** skip entirely when false */
  enabled?: boolean;
}

/**
 * Reactive Geolocation — one-shot or watch, with loading/error.
 * Returns coords/error/isLoading + manual refresh.
 */
export function useGeolocation(options: UseGeolocationOptions = {}): GeolocationState & { refresh: () => void } {
  const { watch = false, enabled = true, ...positionOptions } = options;
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    isLoading: enabled && typeof navigator !== 'undefined' && 'geolocation' in navigator,
  });

  const watchIdRef = useRef<number | null>(null);
  const optionsRef = useRef(positionOptions);
  optionsRef.current = positionOptions;

  const onSuccess = useCallback((pos: GeolocationPosition) => {
    setState({ coords: pos.coords, error: null, isLoading: false });
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    setState((s) => ({ ...s, error: err, isLoading: false }));
  }, []);

  const refresh = useCallback(() => {
    if (!enabled || !('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: new Error('Geolocation not available'), isLoading: false }));
      return;
    }
    setState((s) => ({ ...s, isLoading: true, error: null }));
    navigator.geolocation.getCurrentPosition(onSuccess, onError, optionsRef.current);
  }, [enabled, onSuccess, onError]);

  useEffect(() => {
    if (!enabled || !('geolocation' in navigator)) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    if (watch) {
      setState((s) => ({ ...s, isLoading: true }));
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, optionsRef.current);
      return () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      };
    }

    setState((s) => ({ ...s, isLoading: true }));
    navigator.geolocation.getCurrentPosition(onSuccess, onError, optionsRef.current);

    return () => {
      // one-shot has no watcher to clear, but future watch cleanup handled above
    };
  }, [enabled, watch, onSuccess, onError]);

  return { ...state, refresh };
}
