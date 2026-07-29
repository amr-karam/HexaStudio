import type { Redis } from 'ioredis';
import type { Server } from 'socket.io';
import {
  type AuthenticatedSocket,
  type NotificationPayload,
  type NotificationReadPayload,
  REDIS_KEYS,
  EVENTS,
} from '../types';
import { logger } from '../logger';
import type { MessageQueue } from '../message-queue';

/**
 * Notification Handler
 *
 * Manages real-time notification delivery and read-state tracking.
 * Uses Redis to maintain per-user notification counts.
 * When the target user is offline, notifications are queued for delivery
 * on their next connection.
 */
export class NotificationHandler {
  constructor(
    private readonly io: Server,
    private readonly redis: Redis,
    private readonly messageQueue: MessageQueue,
  ) {}

  register(socket: AuthenticatedSocket): void {
    socket.on(EVENTS.NOTIFICATION_NEW, (payload: NotificationPayload) =>
      this.handlePush(socket, payload),
    );

    socket.on(EVENTS.NOTIFICATION_READ, (payload: NotificationReadPayload) =>
      this.handleRead(socket, payload),
    );
  }

  /**
   * Push a notification to a user's personal room.
   * If the user is offline, the notification is queued for delivery on reconnect.
   */
  async pushToUser(payload: NotificationPayload): Promise<void> {
    const { userId, type, title, body, data } = payload;

    // Validate required fields
    if (!userId || !type || !title) {
      logger.error('Notification push failed: missing required fields');
      return;
    }

    const notificationEvent = {
      notificationId: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      type,
      title,
      body: body ?? '',
      data: data ?? {},
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Increment notification count
    const countKey = REDIS_KEYS.NOTIFICATION_COUNTS(userId);
    const newCount = await this.redis.incr(countKey);

    const enrichedEvent = {
      ...notificationEvent,
      unreadCount: newCount,
    };

    // Check if the user is currently online
    const isOnline = await this.redis.sismember(REDIS_KEYS.ONLINE_USERS, userId);

    if (isOnline) {
      // Push to user's personal room in real-time
      this.io.to(`user:${userId}`).emit(EVENTS.NOTIFICATION_PUSHED, enrichedEvent);
      logger.info(`Notification pushed to user:${userId} — type: ${type}, count: ${newCount}`);
    } else {
      // User is offline — queue the notification for delivery on reconnect
      await this.messageQueue.enqueue(userId, {
        event: EVENTS.NOTIFICATION_PUSHED,
        payload: enrichedEvent,
      });

      logger.info(
        `Notification queued for offline user:${userId} — type: ${type}, queue size: ${await this.messageQueue.getQueueSize(userId)}`,
      );
    }
  }

  /**
   * Handle `notification:new` — validate and push a notification to a target user.
   */
  private async handlePush(
    socket: AuthenticatedSocket,
    payload: NotificationPayload,
  ): Promise<void> {
    if (!payload?.userId || !payload?.type || !payload?.title) {
      socket.emit(EVENTS.ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'userId, type, and title are required',
      });
      return;
    }

    // Prevent self-notification
    if (payload.userId === socket.data.user.sub) {
      socket.emit(EVENTS.ERROR, {
        code: 'SELF_NOTIFICATION',
        message: 'Cannot send notifications to yourself',
      });
      return;
    }

    await this.pushToUser(payload);
  }

  /**
   * Handle `notification:read` — acknowledge and update count.
   */
  private async handleRead(
    socket: AuthenticatedSocket,
    payload: NotificationReadPayload,
  ): Promise<void> {
    if (!payload?.notificationId) {
      socket.emit(EVENTS.ERROR, {
        code: 'INVALID_PAYLOAD',
        message: 'notificationId is required',
      });
      return;
    }

    const user = socket.data.user;
    const countKey = REDIS_KEYS.NOTIFICATION_COUNTS(user.sub);

    // Decrement but never go below 0
    const currentCount = await this.redis.get(countKey);
    const parsed = parseInt(currentCount ?? '0', 10);
    const newCount = Math.max(0, parsed - 1);
    await this.redis.set(countKey, newCount.toString());

    // Acknowledge read
    socket.emit(EVENTS.NOTIFICATION_READ_ACK, {
      notificationId: payload.notificationId,
      unreadCount: newCount,
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `Notification ${payload.notificationId} marked read by ${user.email} — remaining: ${newCount}`,
    );
  }

  /**
   * Get the current notification count for a user.
   */
  async getCount(userId: string): Promise<number> {
    const countKey = REDIS_KEYS.NOTIFICATION_COUNTS(userId);
    const count = await this.redis.get(countKey);
    return parseInt(count ?? '0', 10);
  }

  /**
   * Reset notification count for a user (e.g., "mark all read").
   */
  async resetCount(userId: string): Promise<void> {
    const countKey = REDIS_KEYS.NOTIFICATION_COUNTS(userId);
    await this.redis.set(countKey, '0');
  }
}
