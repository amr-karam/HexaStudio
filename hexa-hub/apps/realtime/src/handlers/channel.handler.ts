import type { Redis } from 'ioredis';
import type { Server } from 'socket.io';
import {
  type AuthenticatedSocket,
  type ChannelJoinPayload,
  type ChannelLeavePayload,
  type ChannelMessagePayload,
  type ChannelMessageEvent,
  type ChannelMemberEvent,
  type ThreadReplyPayload,
  type ThreadReplyEvent,
  type RealtimeError,
  REDIS_KEYS,
  EVENTS,
} from '../types';
import { logger } from '../logger';

/**
 * Channel Handler
 *
 * Manages real-time channel rooms: join/leave, message broadcasting,
 * and typing indicators. Channels are Socket.IO rooms prefixed with `chan:`.
 */
export class ChannelHandler {
  constructor(
    private readonly io: Server,
    private readonly redis: Redis,
  ) {}

  register(socket: AuthenticatedSocket): void {
    socket.on(EVENTS.CHANNEL_JOIN, (payload: ChannelJoinPayload) =>
      this.handleJoin(socket, payload),
    );

    socket.on(EVENTS.CHANNEL_LEAVE, (payload: ChannelLeavePayload) =>
      this.handleLeave(socket, payload),
    );

    socket.on(EVENTS.CHANNEL_MESSAGE_SEND, (payload: ChannelMessagePayload) =>
      this.handleMessageSend(socket, payload),
    );

    socket.on(EVENTS.CHANNEL_TYPING, (payload: { channelId: string }) =>
      this.handleTyping(socket, payload),
    );

    socket.on(EVENTS.CHANNEL_STOP_TYPING, (payload: { channelId: string }) =>
      this.handleStopTyping(socket, payload),
    );

    socket.on(EVENTS.THREAD_REPLY_SEND, (payload: ThreadReplyPayload) =>
      this.handleThreadReply(socket, payload),
    );
  }

  /**
   * Join a channel room. Broadcasts member-joined to the room.
   */
  private handleJoin(socket: AuthenticatedSocket, payload: ChannelJoinPayload): void {
    if (!payload?.channelId) {
      socket.emit(EVENTS.ERROR, {
        code: 'INVALID_CHANNEL',
        message: 'channelId is required',
      } as RealtimeError);
      return;
    }

    const user = socket.data.user;
    const roomName = `chan:${payload.channelId}`;

    socket.join(roomName);

    // Track online members in Redis
    const onlineKey = REDIS_KEYS.CHANNEL_ONLINE(payload.channelId);
    this.redis.hset(onlineKey, user.sub, Date.now().toString());

    const event: ChannelMemberEvent = {
      channelId: payload.channelId,
      userId: user.sub,
      email: user.email,
      timestamp: new Date().toISOString(),
    };

    // Notify other members in the channel
    socket.to(roomName).emit(EVENTS.CHANNEL_MEMBER_JOINED, event);

    logger.info(`${user.email} joined channel ${payload.channelId}`);
  }

  /**
   * Leave a channel room. Broadcasts member-left to the room.
   */
  private async handleLeave(
    socket: AuthenticatedSocket,
    payload: ChannelLeavePayload,
  ): Promise<void> {
    if (!payload?.channelId) return;

    const user = socket.data.user;
    const roomName = `chan:${payload.channelId}`;

    // Remove from online tracking
    const onlineKey = REDIS_KEYS.CHANNEL_ONLINE(payload.channelId);
    await this.redis.hdel(onlineKey, user.sub);

    const event: ChannelMemberEvent = {
      channelId: payload.channelId,
      userId: user.sub,
      email: user.email,
      timestamp: new Date().toISOString(),
    };

    // Notify before leaving
    socket.to(roomName).emit(EVENTS.CHANNEL_MEMBER_LEFT, event);
    socket.leave(roomName);

    logger.info(`${user.email} left channel ${payload.channelId}`);
  }

  /**
   * Send a message in a channel. Broadcasts to all members in the room.
   */
  private handleMessageSend(
    socket: AuthenticatedSocket,
    payload: ChannelMessagePayload,
  ): void {
    if (!this.validateMessagePayload(payload, socket)) return;

    const user = socket.data.user;
    const serverMessageId = `chmsg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const timestamp = new Date().toISOString();

    const messageEvent: ChannelMessageEvent = {
      serverMessageId,
      clientMessageId: payload.clientMessageId,
      channelId: payload.channelId,
      senderId: user.sub,
      senderEmail: user.email,
      content: payload.content,
      type: payload.type,
      replyTo: payload.replyTo,
      timestamp,
    };

    // Broadcast to the channel room
    this.io.to(`chan:${payload.channelId}`).emit(
      EVENTS.CHANNEL_MESSAGE_RECEIVED,
      messageEvent,
    );

    logger.info(
      `Channel message ${serverMessageId} in chan:${payload.channelId} by ${user.email}`,
    );
  }

  /**
   * Handle a thread reply — broadcasts to the channel room with thread context.
   */
  private handleThreadReply(
    socket: AuthenticatedSocket,
    payload: ThreadReplyPayload,
  ): void {
    if (!payload?.channelId || !payload?.messageId || !payload?.content) {
      socket.emit(EVENTS.ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'channelId, messageId, and content are required',
      } as RealtimeError);
      return;
    }

    const user = socket.data.user;
    const serverMessageId = `threply_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const timestamp = new Date().toISOString();

    const replyEvent: ThreadReplyEvent = {
      serverMessageId,
      clientMessageId: payload.clientMessageId,
      channelId: payload.channelId,
      messageId: payload.messageId,
      senderId: user.sub,
      senderEmail: user.email,
      content: payload.content,
      type: payload.type,
      timestamp,
    };

    // Broadcast to the channel room
    this.io.to(`chan:${payload.channelId}`).emit(
      EVENTS.THREAD_REPLY_RECEIVED,
      replyEvent,
    );

    logger.info(
      `Thread reply ${serverMessageId} to msg ${payload.messageId} in chan:${payload.channelId} by ${user.email}`,
    );
  }

  private validateMessagePayload(
    payload: ChannelMessagePayload | undefined,
    socket: AuthenticatedSocket,
  ): boolean {
    if (!payload?.channelId) {
      socket.emit(EVENTS.ERROR, {
        code: 'INVALID_CHANNEL',
        message: 'channelId is required',
      } as RealtimeError);
      return false;
    }
    if (!payload?.content) {
      socket.emit(EVENTS.ERROR, {
        code: 'INVALID_CONTENT',
        message: 'content is required',
      } as RealtimeError);
      return false;
    }
    return true;
  }

  /**
   * Handle typing indicator for a channel.
   */
  private handleTyping(
    socket: AuthenticatedSocket,
    payload: { channelId: string },
  ): void {
    if (!payload?.channelId) return;

    const user = socket.data.user;
    const typingKey = REDIS_KEYS.CHANNEL_TYPING(payload.channelId);

    this.redis.hset(typingKey, user.sub, Date.now().toString());
    this.redis.expire(typingKey, 5);

    socket.to(`chan:${payload.channelId}`).emit(EVENTS.CHANNEL_TYPING_INDICATOR, {
      channelId: payload.channelId,
      userId: user.sub,
      email: user.email,
      isTyping: true,
    });
  }

  /**
   * Stop typing indicator for a channel.
   */
  private async handleStopTyping(
    socket: AuthenticatedSocket,
    payload: { channelId: string },
  ): Promise<void> {
    if (!payload?.channelId) return;

    const user = socket.data.user;
    const typingKey = REDIS_KEYS.CHANNEL_TYPING(payload.channelId);
    await this.redis.hdel(typingKey, user.sub);

    socket.to(`chan:${payload.channelId}`).emit(EVENTS.CHANNEL_TYPING_INDICATOR, {
      channelId: payload.channelId,
      userId: user.sub,
      email: user.email,
      isTyping: false,
    });
  }

  /**
   * Cleanup typing indicators and online presence for a disconnecting user.
   */
  async cleanup(channelId: string, userId: string): Promise<void> {
    const typingKey = REDIS_KEYS.CHANNEL_TYPING(channelId);
    await this.redis.hdel(typingKey, userId);

    const onlineKey = REDIS_KEYS.CHANNEL_ONLINE(channelId);
    await this.redis.hdel(onlineKey, userId);
  }

  /**
   * Cleanup all channel data for a disconnecting user.
   */
  async cleanupAll(userId: string): Promise<void> {
    // Scan for all channel typing keys and remove this user
    const pattern = 'hexa:channel_typing:*';
    let cursor = '0';

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      for (const key of keys) {
        await this.redis.hdel(key, userId);
      }
    } while (cursor !== '0');
  }
}