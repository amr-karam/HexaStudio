'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api-client';
import { useSpatialStore, type SpatialCommand, isSpatialCommand } from './spatial-store';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AnnotationPayload {
  id: string;
  type: 'text' | 'drawing' | 'pin';
  position: { x: number; y: number; z?: number };
  content: string;
  author: string;
  createdAt: string;
  resolved: boolean;
}

interface ApprovalPayload {
  projectId: string;
  phaseId: string;
  action: 'submit' | 'approve' | 'reject' | 'revision';
  comment?: string;
  userId: string;
}

interface PresencePayload {
  user: string;
  id: string;
}

interface SpatialCommandPayload {
  type: 'SET_LIGHTING' | 'SET_MATERIAL' | 'SET_CAMERA';
  payload: Record<string, unknown>;
  metadata: {
    triggeredBy: 'ai-agent' | 'user';
    agentPersona?: string;
  };
}

type EventHandlers = {
  onAnnotationAdded?: (annotation: AnnotationPayload) => void;
  onAnnotationResolved?: (data: { projectId: string; annotationId: string }) => void;
  onApprovalUpdate?: (data: ApprovalPayload) => void;
  onPresenceJoined?: (data: PresencePayload) => void;
  onPresenceLeft?: (data: { id: string }) => void;
  onProjectUpdated?: (data: unknown) => void;
  onSpatialCommand?: (command: SpatialCommandPayload) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
};

export function useRealtime(projectId: string | null, handlers: EventHandlers = {}) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<EventHandlers>(handlers);
  const [isConnected, setIsConnected] = useState(false);

  // Keep handlers fresh without tearing down the socket on every render.
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!projectId) return;
    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${SOCKET_URL}/realtime`, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    socketRef.current = socket;

    const handleConnect = (): void => {
      socket.emit('join-project', projectId);
      setIsConnected(true);
      handlersRef.current.onConnected?.();
    };

    const handleDisconnect = (): void => {
      setIsConnected(false);
      handlersRef.current.onDisconnected?.();
    };

    const handleSpatialCommand = (data: unknown): void => {
      // Runtime validation — backend may emit `spatial:command` or legacy `spatialCommand`
      let command: SpatialCommand | null = null;

      if (isSpatialCommand(data)) {
        command = data;
      } else if (
        typeof data === 'object' &&
        data !== null &&
        'command' in data &&
        isSpatialCommand((data as { command: unknown }).command)
      ) {
        // Wrapped shape { projectId, command }
        command = (data as { command: SpatialCommand }).command;
      } else if (
        typeof data === 'object' &&
        data !== null &&
        'type' in data &&
        'payload' in data
      ) {
        // Best-effort fallback: treat as SpatialCommandPayload
        const maybe = data as SpatialCommandPayload;
        if (
          maybe.type === 'SET_LIGHTING' ||
          maybe.type === 'SET_MATERIAL' ||
          maybe.type === 'SET_CAMERA'
        ) {
          command = {
            type: maybe.type,
            payload: maybe.payload,
            metadata: {
              triggeredBy: maybe.metadata.triggeredBy,
              agentPersona: maybe.metadata.agentPersona,
            },
          };
        }
      }

      if (command) {
        // Dispatch to Zustand so ExperienceCanvas / SceneContent can react
        // even without a direct handler prop.
        try {
          useSpatialStore.getState().dispatch(command);
        } catch {
          // store dispatch should never throw; swallow to keep socket alive
        }
        handlersRef.current.onSpatialCommand?.(command);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    socket.on('annotation:added', (data: AnnotationPayload) => {
      handlersRef.current.onAnnotationAdded?.(data);
    });

    socket.on('annotation:resolved', (data: { projectId: string; annotationId: string }) => {
      handlersRef.current.onAnnotationResolved?.(data);
    });

    socket.on('approval:update', (data: ApprovalPayload) => {
      handlersRef.current.onApprovalUpdate?.(data);
    });

    socket.on('presence:joined', (data: PresencePayload) => {
      handlersRef.current.onPresenceJoined?.(data);
    });

    socket.on('presence:left', (data: { id: string }) => {
      handlersRef.current.onPresenceLeft?.(data);
    });

    socket.on('project:updated', (data: unknown) => {
      handlersRef.current.onProjectUpdated?.(data);
    });

    // Canonical event name + legacy alias for backwards compatibility.
    socket.on('spatial:command', handleSpatialCommand);
    socket.on('spatialCommand', handleSpatialCommand);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('spatial:command', handleSpatialCommand);
      socket.off('spatialCommand', handleSpatialCommand);
      socket.off('annotation:added');
      socket.off('annotation:resolved');
      socket.off('approval:update');
      socket.off('presence:joined');
      socket.off('presence:left');
      socket.off('project:updated');
      if (socket.connected) {
        socket.emit('leave-project', projectId);
        socket.disconnect();
      }
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [projectId]);

  const sendAnnotation = useCallback((annotation: AnnotationPayload) => {
    socketRef.current?.emit('annotation:add', { projectId, annotation });
  }, [projectId]);

  const resolveAnnotation = useCallback((annotationId: string) => {
    socketRef.current?.emit('annotation:resolve', { projectId, annotationId });
  }, [projectId]);

  const sendApproval = useCallback((payload: Omit<ApprovalPayload, 'projectId'>) => {
    socketRef.current?.emit('approval:action', { ...payload, projectId });
  }, [projectId]);

  const announcePresence = useCallback((user: string) => {
    socketRef.current?.emit('presence:join', { projectId, user });
  }, [projectId]);

  return {
    sendAnnotation,
    resolveAnnotation,
    sendApproval,
    announcePresence,
    isConnected,
    socket: socketRef.current,
  };
}
