'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

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

type EventHandlers = {
  onAnnotationAdded?: (annotation: AnnotationPayload) => void;
  onAnnotationResolved?: (data: { projectId: string; annotationId: string }) => void;
  onApprovalUpdate?: (data: ApprovalPayload) => void;
  onPresenceJoined?: (data: PresencePayload) => void;
  onPresenceLeft?: (data: { id: string }) => void;
  onProjectUpdated?: (data: unknown) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
};

export function useRealtime(projectId: string | null, handlers: EventHandlers = {}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const socket = io(`${SOCKET_URL}/realtime`, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-project', projectId);
      handlers.onConnected?.();
    });

    socket.on('disconnect', () => {
      handlers.onDisconnected?.();
    });

    socket.on('annotation:added', (data: AnnotationPayload) => {
      handlers.onAnnotationAdded?.(data);
    });

    socket.on('annotation:resolved', (data: { projectId: string; annotationId: string }) => {
      handlers.onAnnotationResolved?.(data);
    });

    socket.on('approval:update', (data: ApprovalPayload) => {
      handlers.onApprovalUpdate?.(data);
    });

    socket.on('presence:joined', (data: PresencePayload) => {
      handlers.onPresenceJoined?.(data);
    });

    socket.on('presence:left', (data: { id: string }) => {
      handlers.onPresenceLeft?.(data);
    });

    socket.on('project:updated', (data: unknown) => {
      handlers.onProjectUpdated?.(data);
    });

    return () => {
      if (socket.connected) {
        socket.emit('leave-project', projectId);
        socket.disconnect();
      }
      socketRef.current = null;
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
    isConnected: socketRef.current?.connected ?? false,
  };
}
