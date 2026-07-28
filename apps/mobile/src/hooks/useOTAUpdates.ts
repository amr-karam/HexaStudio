import { useEffect, useState, useCallback } from 'react';
import * as Updates from 'expo-updates';

export type OTAStatus = 'checking' | 'available' | 'downloading' | 'ready' | 'up-to-date' | 'error';

export interface OTAUpdateState {
  status: OTAStatus;
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  error: Error | null;
  check: () => Promise<void>;
  download: () => Promise<void>;
  restart: () => Promise<void>;
}

export function useOTAUpdates(): OTAUpdateState {
  const [status, setStatus] = useState<OTAStatus>('up-to-date');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdatePending, setIsUpdatePending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const check = useCallback(async () => {
    setError(null);
    setStatus('checking');
    try {
      const result = await Updates.checkForUpdateAsync();
      setIsUpdateAvailable(result.isAvailable);
      setStatus(result.isAvailable ? 'available' : 'up-to-date');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update check failed'));
      setStatus('error');
    }
  }, []);

  const download = useCallback(async () => {
    if (!isUpdateAvailable) return;
    setStatus('downloading');
    try {
      const result = await Updates.fetchUpdateAsync();
      setIsUpdatePending(result.isNew);
      setStatus(result.isNew ? 'ready' : 'up-to-date');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update download failed'));
      setStatus('error');
    }
  }, [isUpdateAvailable]);

  const restart = useCallback(async () => {
    if (isUpdatePending) {
      await Updates.reloadAsync();
    }
  }, [isUpdatePending]);

  useEffect(() => {
    // Skip OTA checks in development or when Updates is not configured
    if (__DEV__ || !Updates?.checkForUpdateAsync) {
      return;
    }

    let isMounted = true;
    check().catch(() => {
      if (isMounted) setStatus('error');
    });

    return () => {
      isMounted = false;
    };
  }, [check]);

  return {
    status,
    isUpdateAvailable,
    isUpdatePending,
    error,
    check,
    download,
    restart,
  };
}
