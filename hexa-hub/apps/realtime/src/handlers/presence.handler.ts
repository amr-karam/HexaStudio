import type { Redis } from 'ioredis';
import type { Server } from 'socket.io';
import {
  type AuthenticatedSocket,
  type PresenceUser,
  REDIS_KEYS,
  EVENTS,
} from '../types';
import { logger } from '../logger';

/**
 * Presence Handler
 *
 * Tracks online/offline status using Redis.
 * Supports multi-device: a user is "online" if they have at least one active socket.
 * Broadcasts presence changes to all connected clients.
 */
export class PresenceHandler {
  constructor(
    private readonly io: Server,
    private readonly redis: Redis,
  ) {}

  /**
   * Mark a user as online when a socket connects.
   * Adds the socket ID to the user's socket set.
   * If this is the user's first socket, broadcasts `user:online`.
   */
  async userConnected(socket: AuthenticatedSocket): Promise<void> {
    const user = socket.data.user;
    const userId = user.sub;
    const socketsKey = REDIS_KEYS.USER_SOCKETS(userId);

    // Add this socket to the user's socket set
    await this.redis.sadd(socketsKey, socket.id);
    await this.redis.expire(socketsKey, 86_400); // 24h safety TTL

    // Get current socket count for this user
    const socketCount = await this.redis.scard(socketsKey);

    // Add to global online users set
    await this.redis.sadd(REDIS_KEYS.ONLINE_USERS, userId);

    // If this is the first socket for this user, broadcast online status
    if (socketCount === 1) {
      this.io.emit(EVENTS.USER_ONLINE, {
        userId,
        email: user.email,
        timestamp: new Date().toISOString(),
      } satisfies PresenceUpdateEvent);

      logger.info(`User came online: ${user.email} (${userId})`);
    } else {
      logger.info(
        `User ${user.email} connected additional socket (${socketCount} total)`,
      );
    }
  }

  /**
   * Mark a user as offline when a socket disconnects.
   * Removes the socket ID from the user's socket set.
   * If no sockets remain, broadcasts `user:offline`.
   */
  async userDisconnected(socket: AuthenticatedSocket): Promise<void> {
    const user = socket.data.user;
    const userId = user.sub;
    const socketsKey = REDIS_KEYS.USER_SOCKETS(userId);

    // Remove this socket
    await this.redis.srem(socketsKey, socket.id);

    const socketCount = await this.redis.scard(socketsKey);

    if (socketCount === 0) {
      // No more sockets — user is fully offline
      await this.redis.srem(REDIS_KEYS.ONLINE_USERS, userId);
      await this.redis.del(socketsKey);

      this.io.emit(EVENTS.USER_OFFLINE, {
        userId,
        email: user.email,
        timestamp: new Date().toISOString(),
      } satisfies PresenceUpdateEvent);

      logger.info(`User went offline: ${user.email} (${userId})`);
    } else {
      logger.info(
        `Socket removed for ${user.email} — ${socketCount} remaining`,
      );
    }
  }

  /**
   * Handle `user:get_online` — return the current list of online users.
   */
  async getOnlineUsers(socket: AuthenticatedSocket): Promise<void> {
    const userIds = await this.redis.smembers(REDIS_KEYS.ONLINE_USERS);

    const onlineUsers: PresenceUser[] = await Promise.all(
      userIds.map(async (uid) => {
        const socketsKey = REDIS_KEYS.USER_SOCKETS(uid);
        const socketCount = await this.redis.scard(socketsKey);
        return {
          userId: uid,
          socketCount,
          lastSeen: new Date().toISOString(),
        };
      }),
    );

    socket.emit(EVENTS.USER_ONLINE_LIST, { users: onlineUsers });
  }

  /**
   * Check if a specific user is online.
   */
  async isOnline(userId: string): Promise<boolean> {
    return (await this.redis.sismember(REDIS_KEYS.ONLINE_USERS, userId)) === 1;
  }

  /**
   * Get all online user IDs.
   */
  async getOnlineUserIds(): Promise<string[]> {
    return this.redis.smembers(REDIS_KEYS.ONLINE_USERS);
  }

  /**
   * Force-cleanup a user's presence (for abuse recovery or admin action).
   */
  async forceOffline(userId: string): Promise<void> {
    const socketsKey = REDIS_KEYS.USER_SOCKETS(userId);
    await this.redis.srem(REDIS_KEYS.ONLINE_USERS, userId);
    await this.redis.del(socketsKey);

    this.io.emit(EVENTS.USER_OFFLINE, {
      userId,
      timestamp: new Date().toISOString(),
    });

    logger.warn(`User force-set offline: ${userId}`);
  }
}

// Local type for the presence update event shape
interface PresenceUpdateEvent {
  userId: string;
  email?: string;
  timestamp: string;
}
