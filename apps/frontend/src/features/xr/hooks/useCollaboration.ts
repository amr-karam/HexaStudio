'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useXRStore } from '../store/xr-store';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CollabPeerCursor {
  id: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number; w: number };
}

interface CollabPeerJoined {
  id: string;
  user: string;
  mode: 'ar' | 'vr';
}

export function useCollaboration(projectId: string | null, user: string, mode: 'ar' | 'vr' | null) {
  const socketRef = useRef<Socket | null>(null);
  const upsertCollaborator = useXRStore((s) => s.upsertCollaborator);
  const removeCollaborator = useXRStore((s) => s.removeCollaborator);
  const setCollabConnected = useXRStore((s) => s.setCollabConnected);

  useEffect(() => {
    if (!projectId || !mode) return;

    const socket = io(`${SOCKET_URL}/realtime`, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-project', projectId);
      socket.emit('collab:join', { projectId, user, mode });
      setCollabConnected(true);
    });

    socket.on('disconnect', () => {
      setCollabConnected(false);
    });

    socket.on('collab:peer-joined', (peer: CollabPeerJoined) => {
      upsertCollaborator({
        id: peer.id,
        user: peer.user,
        mode: peer.mode,
        position: { x: 0, y: 0, z: 0 },
        lastSeen: Date.now(),
      });
    });

    socket.on('collab:peer-cursor', (data: CollabPeerCursor) => {
      const existing = useXRStore.getState().collaborators[data.id];
      if (!existing) return;
      upsertCollaborator({
        ...existing,
        position: data.position,
        rotation: data.rotation,
        lastSeen: Date.now(),
      });
    });

    socket.on('collab:peer-left', ({ id }: { id: string }) => {
      removeCollaborator(id);
    });

    return () => {
      if (socket.connected) {
        socket.emit('collab:leave', { projectId });
        socket.emit('leave-project', projectId);
        socket.disconnect();
      }
      socketRef.current = null;
      setCollabConnected(false);
    };
  }, [projectId, user, mode, upsertCollaborator, removeCollaborator, setCollabConnected]);

  const sendCursor = useCallback(
    (position: { x: number; y: number; z: number }, rotation?: { x: number; y: number; z: number; w: number }) => {
      if (!projectId || !socketRef.current?.connected) return;
      socketRef.current.emit('collab:cursor', { projectId, position, rotation });
    },
    [projectId],
  );

  return { sendCursor };
}
