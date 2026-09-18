'use client';

import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { useXRStore, type MaterialOverride } from '../store/xr-store';

interface SpatialCommandPayload {
  type: 'SET_LIGHTING' | 'SET_MATERIAL' | 'SET_CAMERA';
  payload: Record<string, unknown>;
  metadata: {
    triggeredBy: 'ai-agent' | 'user';
    agentPersona?: string;
  };
}

/**
 * Live Atelier bridge: listens for real-time `spatial:command` events
 * dispatched by AI agents (or users) and applies them to the XR scene.
 */
export function useSpatialCommands(getSocket: () => Socket | null, projectId: string | null) {
  const pushMaterialOverride = useXRStore((s) => s.pushMaterialOverride);

  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();
    if (!socket) return;

    const handleSpatialCommand = (command: SpatialCommandPayload) => {
      if (command.type === 'SET_MATERIAL') {
        const { element, color, roughness, metalness, name } = command.payload as {
          element?: string;
          color?: string;
          roughness?: number;
          metalness?: number;
          name?: string;
        };
        if (!element) return;

        pushMaterialOverride({
          element,
          color,
          roughness,
          metalness,
          name,
          triggeredBy: command.metadata?.triggeredBy ?? 'ai-agent',
          agentPersona: command.metadata?.agentPersona,
        });
      }
    };

    socket.on('spatial:command', handleSpatialCommand);

    return () => {
      socket.off('spatial:command', handleSpatialCommand);
    };
  }, [getSocket, projectId, pushMaterialOverride]);
}

export type { MaterialOverride };
