'use client';

import { useXRInputSourceStates, useXREvent } from '@react-three/xr';
import { useXRStore } from '../store/xr-store';

export function useXRInteraction() {
  const { status, setControllerConnected } = useXRStore();
  const inputStates = useXRInputSourceStates();

  const isInSession = status === 'active';
  const connectedCount = inputStates.length;

  if (connectedCount > 0) {
    setControllerConnected(true);
  }

  useXREvent('select', () => {});

  useXREvent('squeeze', () => {});

  return {
    isInSession,
    connectedCount,
    inputStates,
  };
}
