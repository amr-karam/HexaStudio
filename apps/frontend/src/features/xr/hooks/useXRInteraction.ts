'use client';

import { useXRInputSourceStates, useXREvent } from '@react-three/xr';
import { useXRStore } from '../store/xr-store';

export function useXRInteraction() {
  const { status, setControllerConnected, setPlacementPhase } = useXRStore();
  const inputStates = useXRInputSourceStates();

  const isInSession = status === 'active';
  const connectedCount = inputStates.length;

  if (connectedCount > 0) {
    setControllerConnected(true);
  }

  useXREvent('select', () => {
    const phase = useXRStore.getState().placementPhase;
    if (phase === 'placing') {
      setPlacementPhase('placed');
    }
  });

  useXREvent('squeeze', () => {});

  return {
    isInSession,
    connectedCount,
    inputStates,
  };
}
