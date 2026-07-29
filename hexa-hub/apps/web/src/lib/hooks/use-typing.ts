// ─── HEXA Hub — useTypingIndicator & useTypingUsers Hooks ───────────────────
// Real-time typing indicators for channels and DM conversations.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import type { TypingIndicatorEvent } from '@hexa-hub/types';

// ─── Constants ──────────────────────────────────────────────────────────────

/** How often (ms) to re-emit the typing event while the user is typing. */
const TYPING_REFRESH_INTERVAL = 3_000;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TypingUser {
  userId: string;
  email: string;
}

interface TypingConfig {
  /** Client→Server event to signal typing started. */
  emitTyping: string;
  /** Client→Server event to signal typing stopped. */
  emitStopTyping: string;
  /** Server→Client event that carries typing indicator updates. */
  listenIndicator: string;
  /** The key in the payload that identifies the room (channel vs conversation). */
  idKey: 'channelId' | 'conversationId';
}

export interface UseTypingReturn {
  /** Users currently typing in this room (userId + email). */
  typingUsers: TypingUser[];
  /** Call when the local user starts typing (debounced internally). */
  startTyping: () => void;
  /** Call when the local user stops typing. */
  stopTyping: () => void;
}

// ─── Base Hook ──────────────────────────────────────────────────────────────

/**
 * Shared base hook for both channel and conversation typing indicators.
 *
 * Manages:
 * - Listening for incoming typing indicator events from the server.
 * - Emitting typing / stop-typing events with a debounced refresh interval.
 * - Cleaning up on unmount.
 */
function useTypingBase(
  roomId: string | undefined,
  config: TypingConfig,
): UseTypingReturn {
  const { socket } = useSocket();

  // Users currently typing (from server indicator events)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Refs for debounced typing emits
  const isTypingRef = useRef(false);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Listen for incoming typing indicators ──────────────────────────────
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleTypingIndicator = (data: TypingIndicatorEvent) => {
      const matchesRoom =
        config.idKey === 'channelId'
          ? data.channelId === roomId
          : data.conversationId === roomId;

      if (!matchesRoom) return;

      setTypingUsers((prev) => {
        if (data.isTyping) {
          // Add if not already present
          return prev.some((u) => u.userId === data.userId)
            ? prev
            : [...prev, { userId: data.userId, email: data.email ?? '' }];
        }
        // Remove
        return prev.filter((u) => u.userId !== data.userId);
      });
    };

    socket.on(config.listenIndicator, handleTypingIndicator);

    return () => {
      socket.off(config.listenIndicator, handleTypingIndicator);
    };
  }, [socket, roomId, config]);

  // ── Emit typing / stop-typing ──────────────────────────────────────────

  const startTyping = useCallback(() => {
    if (!socket?.connected || !roomId || isTypingRef.current) return;

    // First emit
    socket.emit(config.emitTyping, { [config.idKey]: roomId });
    isTypingRef.current = true;

    // Refresh periodically so the server-side TTL doesn't expire
    typingIntervalRef.current = setInterval(() => {
      if (socket?.connected) {
        socket.emit(config.emitTyping, { [config.idKey]: roomId });
      }
    }, TYPING_REFRESH_INTERVAL);
  }, [socket, roomId, config.emitTyping, config.idKey]);

  const stopTyping = useCallback(() => {
    if (!socket?.connected || !roomId) return;

    // Clear the refresh interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    socket.emit(config.emitStopTyping, { [config.idKey]: roomId });
    isTypingRef.current = false;
  }, [socket, roomId, config.emitStopTyping, config.idKey]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      // If we were still typing, notify the server
      if (isTypingRef.current && socket?.connected && roomId) {
        socket.emit(config.emitStopTyping, { [config.idKey]: roomId });
      }
      isTypingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId]);

  return { typingUsers, startTyping, stopTyping };
}

// ─── Public Hooks ───────────────────────────────────────────────────────────

/**
 * Tracks who is typing in a **channel**.
 *
 * ```tsx
 * const { typingUsers, startTyping, stopTyping } = useTypingIndicator(channelId);
 * ```
 */
export function useTypingIndicator(channelId?: string): UseTypingReturn {
  return useTypingBase(channelId, {
    emitTyping: 'channel:typing',
    emitStopTyping: 'channel:stop_typing',
    listenIndicator: 'channel:typing:indicator',
    idKey: 'channelId',
  });
}

/**
 * Tracks who is typing in a **DM conversation**.
 *
 * ```tsx
 * const { typingUsers, startTyping, stopTyping } = useTypingUsers(conversationId);
 * ```
 */
export function useTypingUsers(conversationId?: string): UseTypingReturn {
  return useTypingBase(conversationId, {
    emitTyping: 'message:typing',
    emitStopTyping: 'message:stop_typing',
    listenIndicator: 'message:typing_indicator',
    idKey: 'conversationId',
  });
}