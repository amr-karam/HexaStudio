// ─── HEXA Hub — Socket Event Types ──────────────────────────────────────────
// Shared types for Socket.IO real-time events, mirroring the server contracts
// in apps/realtime/src/types.ts.
// ─────────────────────────────────────────────────────────────────────────────

/** Emitted by the server when a user comes online (`user:online`). */
export interface UserOnlineEvent {
  userId: string;
  email?: string;
  timestamp: string;
}

/** Emitted by the server when a user goes offline (`user:offline`). */
export interface UserOfflineEvent {
  userId: string;
  email?: string;
  timestamp: string;
}

/** A single user entry in the online users list. */
export interface OnlineUser {
  userId: string;
  socketCount: number;
  lastSeen: string;
}

/** Emitted by the server in response to `user:get_online`. */
export interface OnlineUsersListEvent {
  users: OnlineUser[];
}

/** Emitted for typing indicators (channels and conversations). */
export interface TypingIndicatorEvent {
  channelId?: string;
  conversationId?: string;
  userId: string;
  email?: string;
  isTyping: boolean;
}