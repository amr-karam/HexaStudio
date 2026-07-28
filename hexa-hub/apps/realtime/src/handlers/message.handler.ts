import type { Redis } from 'ioredis';
import type { Server } from 'socket.io';
import {
  type AuthenticatedSocket,
  type SendMessagePayload,
  type ReadMessagesPayload,
  type TypingPayload,
  type MessageAcknowledgement,
  type RealtimeError,
  REDIS_KEYS,
  EVENTS,
} from '../types';
import { logger } from '../logger';

/**
 * Message Handler
 *
 * Handles all messaging events: send, read receipts, and typing indicators.
 * Emits events to conversation rooms and tracks unread counts in Redis.
 */
export class MessageHandler {
  constructor(
    private readonly io: Server,
    private readonly redis: Redis,
  ) {}

  register(socket: AuthenticatedSocket): void {
    socket.on(EVENTS.MESSAGE_SEND, (payload: SendMessagePayload) =>
      this.handleSend(socket, payload),
    );

    socket.on(EVENTS.MESSAGE_READ, (payload: ReadMessagesPayload) =>
      this.handleRead(socket, payload),
    );

    socket.on(EVENTS.MESSAGE_TYPING, (payload: TypingPayload) =>
      this.handleTyping(socket, payload),
    );

    socket.on(EVENTS.MESSAGE_STOP_TYPING, (payload: TypingPayload) =>
      this.handleStopTyping(socket, payload),
    );
  }

  /**
   * Validates a send-message payload before processing.
   */
  private validateSendPayload(
    payload: SendMessagePayload | undefined,
  ): RealtimeError | null {
    if (!payload) {
      return { code: 'MISSING_PAYLOAD', message: 'Message payload is required' };
    }
    if (!payload.conversationId || typeof payload.conversationId !== 'string') {
      return { code: 'INVALID_CONVERSATION', message: 'Valid conversationId is required' };
    }
    if (!payload.content || typeof payload.content !== 'string') {
      return { code: 'INVALID_CONTENT', message: 'Message content is required' };
    }
    if (!payload.recipientId || typeof payload.recipientId !== 'string') {
      return { code: 'INVALID_RECIPIENT', message: 'Valid recipientId is required' };
    }
    const validTypes = ['text', 'image', 'file', 'system'];
    if (!validTypes.includes(payload.type)) {
      return { code: 'INVALID_TYPE', message: `Message type must be one of: ${validTypes.join(', ')}` };
    }
    return null;
  }

  /**
   * Handles `message:send` — validates, emits to conversation room, acks to sender.
   */
  private async handleSend(
    socket: AuthenticatedSocket,
    payload: SendMessagePayload,
  ): Promise<void> {
    const validationError = this.validateSendPayload(payload);
    if (validationError) {
      socket.emit(EVENTS.ERROR, validationError);
      return;
    }

    const user = socket.data.user;
    const serverMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const timestamp = new Date().toISOString();

    const messageEvent = {
      serverMessageId,
      clientMessageId: payload.clientMessageId,
      conversationId: payload.conversationId,
      senderId: user.sub,
      senderEmail: user.email,
      content: payload.content,
      type: payload.type,
      metadata: payload.metadata,
      timestamp,
    };

    // Emit to the conversation room (all participants in the Socket.IO room)
    this.io.to(`conv:${payload.conversationId}`).emit(
      EVENTS.MESSAGE_RECEIVED,
      messageEvent,
    );

    // Increment unread count for the recipient
    const unreadKey = REDIS_KEYS.UNREAD_COUNTS(payload.recipientId, payload.conversationId);
    await this.redis.incr(unreadKey);

    // Acknowledge to the sender
    const ack: MessageAcknowledgement = {
      serverMessageId,
      clientMessageId: payload.clientMessageId,
      timestamp,
      conversationId: payload.conversationId,
    };
    socket.emit(EVENTS.MESSAGE_SENT, ack);

    logger.info(
      `Message sent: ${serverMessageId} in conv:${payload.conversationId} by ${user.email}`,
    );
  }

  /**
   * Handles `message:read` — marks messages as read and notifies sender.
   */
  private async handleRead(
    socket: AuthenticatedSocket,
    payload: ReadMessagesPayload,
  ): Promise<void> {
    if (!payload?.conversationId || !Array.isArray(payload.messageIds)) {
      socket.emit(EVENTS.ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'conversationId and messageIds array are required',
      });
      return;
    }

    const user = socket.data.user;
    const timestamp = new Date().toISOString();

    // Reset unread count for this conversation
    const unreadKey = REDIS_KEYS.UNREAD_COUNTS(user.sub, payload.conversationId);
    await this.redis.set(unreadKey, '0');

    // Notify the conversation room about read receipts
    this.io.to(`conv:${payload.conversationId}`).emit(EVENTS.MESSAGE_READ_RECEIPT, {
      readerId: user.sub,
      conversationId: payload.conversationId,
      messageIds: payload.messageIds,
      timestamp,
    });

    logger.info(
      `${user.email} read ${payload.messageIds.length} messages in conv:${payload.conversationId}`,
    );
  }

  /**
   * Handles `message:typing` — broadcasts typing indicator to conversation room.
   */
  private handleTyping(
    socket: AuthenticatedSocket,
    payload: TypingPayload,
  ): void {
    if (!payload?.conversationId) return;

    const user = socket.data.user;

    // Track typing status in Redis with 5s TTL
    const typingKey = REDIS_KEYS.TYPING_USERS(payload.conversationId);
    this.redis.hset(typingKey, user.sub, Date.now().toString());
    this.redis.expire(typingKey, 5);

    // Broadcast to conversation room (exclude sender)
    socket.to(`conv:${payload.conversationId}`).emit(EVENTS.MESSAGE_TYPING_INDICATOR, {
      conversationId: payload.conversationId,
      userId: user.sub,
      email: user.email,
      isTyping: true,
    });
  }

  /**
   * Handles `message:stop_typing` — clears typing indicator.
   */
  private async handleStopTyping(
    socket: AuthenticatedSocket,
    payload: TypingPayload,
  ): Promise<void> {
    if (!payload?.conversationId) return;

    const user = socket.data.user;
    const typingKey = REDIS_KEYS.TYPING_USERS(payload.conversationId);
    await this.redis.hdel(typingKey, user.sub);

    socket.to(`conv:${payload.conversationId}`).emit(EVENTS.MESSAGE_TYPING_INDICATOR, {
      conversationId: payload.conversationId,
      userId: user.sub,
      email: user.email,
      isTyping: false,
    });
  }

  /**
   * Cleanup typing indicators for a disconnecting user across all conversations.
   */
  async cleanupTyping(userId: string): Promise<void> {
    // Scan for all typing keys and remove this user
    const cursor = '0';
    const pattern = 'hexa:typing:*';
    let resultCursor = cursor;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        resultCursor === '0' ? '0' : resultCursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      resultCursor = nextCursor;

      for (const key of keys) {
        await this.redis.hdel(key, userId);
      }
    } while (resultCursor !== '0');
  }
}
