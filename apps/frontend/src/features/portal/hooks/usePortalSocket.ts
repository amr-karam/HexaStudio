'use client';

/**
 * HEXA Portal — Real-time Socket.io Multiplayer Hook
 *
 * Handles project room connection, live cursor streaming, approval alerts,
 * and deliverable update notifications.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config/constants';

export interface RemoteCursor {
  socketId: string;
  cursor: {
    x: number;
    y: number;
    userName: string;
    userRole?: string;
  };
}

export function usePortalSocket(projectId = 'horizon-villa', userName = 'Client User') {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});
  const [liveNotifications, setLiveNotifications] = useState<Array<{ id: string; message: string; timestamp: string }>>([]);

  useEffect(() => {
    const socket = io(`${API_BASE_URL}/portal-ws`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_project', { projectId, userName });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('cursor_updated', (data: RemoteCursor) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.socketId]: data,
      }));
    });

    socket.on('approval_changed', (data: { approvalId: string; status: string; actor: string; timestamp: string }) => {
      const msg = `Approval ${data.approvalId} was updated to '${data.status}' by ${data.actor}`;
      setLiveNotifications((prev) => [
        { id: Date.now().toString(), message: msg, timestamp: data.timestamp },
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, userName]);

  const sendCursorPosition = useCallback((x: number, y: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('cursor_move', {
        projectId,
        cursor: { x, y, userName },
      });
    }
  }, [projectId, userName, isConnected]);

  const emitApprovalAction = useCallback((approvalId: string, status: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('approval_action', {
        projectId,
        approvalId,
        status,
        actor: userName,
      });
    }
  }, [projectId, userName, isConnected]);

  return {
    isConnected,
    remoteCursors,
    liveNotifications,
    sendCursorPosition,
    emitApprovalAction,
  };
}
