import type { Socket } from 'socket.io';

// ─── JWT Payload ──────────────────────────────────────────────────────────────
export interface JwtUserPayload {
  sub: string;
  email: string;
  name?: string;
  role?: string;
}

// ─── Socket Data ──────────────────────────────────────────────────────────────
export interface SocketData {
  user: JwtUserPayload;
  isAlive: boolean;
}

export type AuthenticatedSocket = Socket & { data: SocketData };

// ─── Messaging ────────────────────────────────────────────────────────────────
export interface SendMessagePayload {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  recipientId: string;
  clientMessageId?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageAcknowledgement {
  serverMessageId: string;
  clientMessageId?: string;
  timestamp: string;
  conversationId: string;
}

export interface ReadMessagesPayload {
  conversationId: string;
  messageIds: string[];
}

export interface TypingPayload {
  conversationId: string;
}

// ─── Presence ─────────────────────────────────────────────────────────────────
export interface PresenceUser {
  userId: string;
  socketCount: number;
  lastSeen: string;
}

export interface PresenceUpdate {
  userId: string;
  status: 'online' | 'offline';
  timestamp: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationReadPayload {
  notificationId: string;
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
export interface JoinRoomPayload {
  conversationId: string;
}

export interface LeaveRoomPayload {
  conversationId: string;
}

export interface CreateRoomPayload {
  conversationId: string;
  participants: string[];
}

// ─── Error Handling ───────────────────────────────────────────────────────────
export interface RealtimeError {
  code: string;
  message: string;
}

// ─── Redis Keys ───────────────────────────────────────────────────────────────
export const REDIS_KEYS = {
  ONLINE_USERS: 'hexa:online_users',
  USER_SOCKETS: (userId: string) => `hexa:user_sockets:${userId}`,
  TYPING_USERS: (conversationId: string) => `hexa:typing:${conversationId}`,
  NOTIFICATION_COUNTS: (userId: string) => `hexa:notification_counts:${userId}`,
  UNREAD_COUNTS: (userId: string, conversationId: string) =>
    `hexa:unread:${userId}:${conversationId}`,
} as const;

// ─── Socket Events ────────────────────────────────────────────────────────────
export const EVENTS = {
  // Client → Server
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  MESSAGE_TYPING: 'message:typing',
  MESSAGE_STOP_TYPING: 'message:stop_typing',

  USER_GET_ONLINE: 'user:get_online',

  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_CREATE: 'room:create',

  PING: 'ping',

  // Server → Client
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_READ_RECEIPT: 'message:read_receipt',
  MESSAGE_TYPING_INDICATOR: 'message:typing_indicator',
  MESSAGE_SENT: 'message:sent',

  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_ONLINE_LIST: 'user:online_list',

  NOTIFICATION_PUSHED: 'notification:pushed',
  NOTIFICATION_READ_ACK: 'notification:read_ack',

  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',
  ROOM_CREATED: 'room:created',

  PONG: 'pong',

  ERROR: 'error',
} as const;
