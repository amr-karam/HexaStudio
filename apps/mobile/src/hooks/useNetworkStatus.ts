import { useEffect, useState, useCallback } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  connectionType: string | null;
  details: NetInfoState | null;
}

const isStateOnline = (state: NetInfoState | null): boolean => {
  if (!state) return true;
  return state.isConnected === true && state.isInternetReachable !== false;
};

export function useNetworkStatus(): NetworkStatus {
  const [state, setState] = useState<NetInfoState | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const updateState = useCallback((next: NetInfoState) => {
    setState(next);
    setIsOnline(isStateOnline(next));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = NetInfo.addEventListener((next) => {
      if (isMounted) updateState(next);
    });

    NetInfo.fetch()
      .then((next) => {
        if (isMounted) updateState(next);
      })
      .catch(() => {
        if (isMounted) setIsOnline(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [updateState]);

  return {
    isOnline,
    isOffline: !isOnline,
    connectionType: state?.type ?? null,
    details: state,
  };
}

