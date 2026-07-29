// ─── HEXA Hub — usePresence Hook ────────────────────────────────────────────
// Real-time online/offline tracking using Socket.IO presence events.
// Powered by a shared Zustand store so multiple components stay in sync.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect, useMemo, useCallback, useRef } from 'react';
import { create } from 'zustand';
import { useSocket } from '@/providers/SocketProvider';
import type {
  UserOnlineEvent,
  UserOfflineEvent,
  OnlineUsersListEvent,
} from '@hexa-hub/types';

// ─── Zustand Store ──────────────────────────────────────────────────────────

interface PresenceStore {
  /** Record of userId → true for every online user. */
  onlineUserMap: Record<string, boolean>;
  /** Whether the underlying socket is connected. */
  isConnected: boolean;

  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setConnected: (connected: boolean) => void;
}

const usePresenceStore = create<PresenceStore>((set) => ({
  onlineUserMap: {},
  isConnected: false,

  setOnlineUsers: (userIds) =>
    set({
      onlineUserMap: Object.fromEntries(userIds.map((id) => [id, true])),
    }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUserMap: { ...state.onlineUserMap, [userId]: true },
    })),

  removeOnlineUser: (userId) =>
    set((state) => {
      // eslint-disable-next-line no-unused-vars
      const { [userId]: _removed, ...rest } = state.onlineUserMap;
      return { onlineUserMap: rest };
    }),

  setConnected: (connected) => set({ isConnected: connected }),
}));

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface UsePresenceReturn {
  /** Set of user IDs currently online. */
  onlineUsers: Set<string>;
  /** Check if a specific user is online. */
  isUserOnline: (userId: string) => boolean;
  /** Whether the underlying socket is connected. */
  isConnected: boolean;
  /** Total number of currently online users. */
  onlineUserCount: number;
}

/**
 * Tracks real-time online/offline status for all users.
 *
 * Automatically connects to the socket (via the provider) and manages
 * `user:online`, `user:offline`, and `user:online_list` event listeners.
 * Safe to call from multiple components — uses a shared Zustand store.
 */
export function usePresence(): UsePresenceReturn {
  const { socket } = useSocket();

  const onlineUserMap = usePresenceStore((s) => s.onlineUserMap);
  const isConnected = usePresenceStore((s) => s.isConnected);

  // Track whether we've already requested the online list on this socket
  // to avoid spamming the server on every hook mount.
  const requestedRef = useRef(false);

  // ── Presence event listeners ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) {
      usePresenceStore.getState().setConnected(false);
      return;
    }

    const store = usePresenceStore.getState;

    const handleOnline = (data: UserOnlineEvent) => {
      store().addOnlineUser(data.userId);
    };

    const handleOffline = (data: UserOfflineEvent) => {
      store().removeOnlineUser(data.userId);
    };

    const handleOnlineList = (data: OnlineUsersListEvent) => {
      const userIds = data.users.map((u) => u.userId);
      store().setOnlineUsers(userIds);
    };

    socket.on('user:online', handleOnline);
    socket.on('user:offline', handleOffline);
    socket.on('user:online_list', handleOnlineList);

    // Request the current online list once per socket connection
    if (!requestedRef.current) {
      socket.emit('user:get_online');
      requestedRef.current = true;
    }

    return () => {
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline);
      socket.off('user:online_list', handleOnlineList);

      // Reset so the next socket connection re-requests the list
      requestedRef.current = false;
    };
    // We intentionally only depend on `socket` identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // ── Socket connection status ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) {
      usePresenceStore.getState().setConnected(false);
      return;
    }

    const handleConnect = () => {
      usePresenceStore.getState().setConnected(true);
      // Re-request online list on reconnect
      socket.emit('user:get_online');
      requestedRef.current = true;
    };
    const handleDisconnect = () =>
      usePresenceStore.getState().setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Sync initial state
    usePresenceStore.getState().setConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // ── Derived values ─────────────────────────────────────────────────────
  const onlineUsers = useMemo(
    () => new Set(Object.keys(onlineUserMap)),
    [onlineUserMap],
  );

  const isUserOnline = useCallback(
    (userId: string): boolean => userId in onlineUserMap,
    [onlineUserMap],
  );

  const onlineUserCount = useMemo(
    () => Object.keys(onlineUserMap).length,
    [onlineUserMap],
  );

  return { onlineUsers, isUserOnline, isConnected, onlineUserCount };
}