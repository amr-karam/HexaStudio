import type { Redis } from 'ioredis';
import { logger } from './logger';

/**
 * Message Queue Manager
 *
 * Buffers messages for disconnected clients in Redis.
 * Messages are stored per-user with a 5-minute TTL.
 * On reconnect, buffered messages are delivered and cleared.
 */
export class MessageQueue {
  private readonly QUEUE_PREFIX = 'hexa:queued_msgs';
  private readonly TTL_SECONDS = 300; // 5 minutes

  constructor(private readonly redis: Redis) {}

  /**
   * Generate the Redis key for a user's message queue.
   */
  private key(userId: string): string {
    return `${this.QUEUE_PREFIX}:${userId}`;
  }

  /**
   * Enqueue a message for a user who is currently offline.
   * Each message is stored as a JSON string in a Redis list.
   */
  async enqueue(userId: string, message: QueuedMessage): Promise<void> {
    const key = this.key(userId);

    const serialized = JSON.stringify({
      ...message,
      queuedAt: new Date().toISOString(),
    });

    try {
      await this.redis.rpush(key, serialized);
      await this.redis.expire(key, this.TTL_SECONDS);
      logger.debug(`Message queued for offline user ${userId}`);
    } catch (error) {
      logger.error(
        `Failed to enqueue message for user ${userId}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Retrieve and clear all queued messages for a user.
   * Called when the user reconnects.
   */
  async dequeueAll(userId: string): Promise<QueuedMessage[]> {
    const key = this.key(userId);

    try {
      const messages: string[] = await this.redis.lrange(key, 0, -1);

      if (messages.length === 0) return [];

      // Delete the queue after reading
      await this.redis.del(key);

      return messages
        .map((msg) => {
          try {
            return JSON.parse(msg) as QueuedMessage;
          } catch {
            logger.warn(`Corrupted queued message for user ${userId}, skipping`);
            return null;
          }
        })
        .filter((msg): msg is QueuedMessage => msg !== null);
    } catch (error) {
      logger.error(
        `Failed to dequeue messages for user ${userId}: ${(error as Error).message}`,
      );
      return [];
    }
  }

  /**
   * Check if there are any queued messages for a user.
   */
  async hasQueuedMessages(userId: string): Promise<boolean> {
    const key = this.key(userId);
    try {
      const count = await this.redis.llen(key);
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get the count of queued messages for a user.
   */
  async getQueueSize(userId: string): Promise<number> {
    const key = this.key(userId);
    try {
      return await this.redis.llen(key);
    } catch {
      return 0;
    }
  }
}

/**
 * Represents a queued message stored in Redis.
 */
export interface QueuedMessage {
  event: string;
  payload: unknown;
  queuedAt?: string;
}
