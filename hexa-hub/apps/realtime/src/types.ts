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

// ─── Channel ──────────────────────────────────────────────────────────────────
export interface ChannelJoinPayload {
  channelId: string;
}

export interface ChannelLeavePayload {
  channelId: string;
}

export interface ChannelMessagePayload {
  channelId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  clientMessageId?: string;
  replyTo?: string;
}

export interface ChannelMessageEvent {
  serverMessageId: string;
  clientMessageId?: string;
  channelId: string;
  senderId: string;
  senderEmail: string;
  content: string;
  type: string;
  replyTo?: string;
  timestamp: string;
}

export interface ChannelMemberEvent {
  channelId: string;
  userId: string;
  email: string;
  timestamp: string;
}

// ─── Thread ───────────────────────────────────────────────────────────────────
export interface ThreadReplyPayload {
  channelId: string;
  messageId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  clientMessageId?: string;
}

export interface ThreadReplyEvent {
  serverMessageId: string;
  clientMessageId?: string;
  channelId: string;
  messageId: string;
  senderId: string;
  senderEmail: string;
  content: string;
  type: string;
  timestamp: string;
}

// ─── Redis Keys ───────────────────────────────────────────────────────────────
export const REDIS_KEYS = {
  ONLINE_USERS: 'hexa:online_users',
  USER_SOCKETS: (userId: string) => `hexa:user_sockets:${userId}`,
  TYPING_USERS: (conversationId: string) => `hexa:typing:${conversationId}`,
  NOTIFICATION_COUNTS: (userId: string) => `hexa:notification_counts:${userId}`,
  UNREAD_COUNTS: (userId: string, conversationId: string) =>
    `hexa:unread:${userId}:${conversationId}`,
  CHANNEL_TYPING: (channelId: string) => `hexa:channel_typing:${channelId}`,
  CHANNEL_ONLINE: (channelId: string) => `hexa:channel_online:${channelId}`,
} as const;

// ─── Token Refresh ────────────────────────────────────────────────────────────
export interface TokenRefreshPayload {
  currentToken: string;
}

export interface TokenRefreshResponse {
  token: string;
  expiresIn: number;
}

export interface QueuedMessagesDelivery {
  messages: Array<{
    event: string;
    payload: unknown;
    queuedAt: string;
  }>;
  count: number;
}

// ─── Strict Rate Limit ────────────────────────────────────────────────────────
export interface RateLimitViolation {
  code: 'RATE_LIMIT_EXCEEDED';
  message: string;
  limit: number;
  windowMs: number;
  currentCount: number;
}

// ─── Socket Events ────────────────────────────────────────────────────────────
export const EVENTS = {
  // Client → Server
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  MESSAGE_TYPING: 'message:typing',
  MESSAGE_STOP_TYPING: 'message:stop_typing',

  CHANNEL_JOIN: 'channel:join',
  CHANNEL_LEAVE: 'channel:leave',
  CHANNEL_MESSAGE_SEND: 'channel:message:send',
  CHANNEL_TYPING: 'channel:typing',
  CHANNEL_STOP_TYPING: 'channel:stop_typing',
  THREAD_REPLY_SEND: 'thread:reply:send',

  USER_GET_ONLINE: 'user:get_online',

  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_CREATE: 'room:create',

  PING: 'ping',
  TOKEN_EXPIRING: 'token:expiring',

  // Server → Client
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_READ_RECEIPT: 'message:read_receipt',
  MESSAGE_TYPING_INDICATOR: 'message:typing_indicator',
  MESSAGE_SENT: 'message:sent',

  CHANNEL_MESSAGE_RECEIVED: 'channel:message:received',
  CHANNEL_TYPING_INDICATOR: 'channel:typing_indicator',
  CHANNEL_MEMBER_JOINED: 'channel:member:joined',
  CHANNEL_MEMBER_LEFT: 'channel:member:left',
  THREAD_REPLY_RECEIVED: 'thread:reply:received',

  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_ONLINE_LIST: 'user:online_list',

  NOTIFICATION_PUSHED: 'notification:pushed',
  NOTIFICATION_READ_ACK: 'notification:read_ack',

  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',
  ROOM_CREATED: 'room:created',

  PONG: 'pong',
  TOKEN_REFRESHED: 'token:refreshed',
  QUEUED_MESSAGES: 'queued:messages',

  ERROR: 'error',
} as const;
