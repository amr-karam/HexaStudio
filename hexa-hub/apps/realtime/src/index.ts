import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { createServer } from 'http';
import { verify, sign, type JwtPayload } from 'jsonwebtoken';
import { config } from './config';
import { logger } from './logger';
import { MessageHandler } from './handlers/message.handler';
import { PresenceHandler } from './handlers/presence.handler';
import { NotificationHandler } from './handlers/notification.handler';
import { ChannelHandler } from './handlers/channel.handler';
import { MessageQueue } from './message-queue';
import {
  type AuthenticatedSocket,
  type JoinRoomPayload,
  type LeaveRoomPayload,
  type CreateRoomPayload,
  type TokenRefreshPayload,
  type TokenRefreshResponse,
  type RateLimitViolation,
  EVENTS,
} from './types';
// ─── SENTRY IMPORT ──────────────────────────────────────────────────────────────
import * as Sentry from '@sentry/node';

// ─── Redis Clients ────────────────────────────────────────────────────────────
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

function createRedisClient(label: string): Redis {
  const client = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      if (times > 10) {
        logger.error(`Redis ${label}: max retries reached, giving up`);
        return null;
      }
      const delay = Math.min(times * 200, 5_000);
      return delay;
    },
  });

  client.on('error', (err) => {
    logger.error(`Redis ${label} error: ${err.message}`);
  });

  client.on('connect', () => {
    logger.info(`Redis ${label} connected`);
  });

  return client;
}

// ─── Per-Socket Rate Limiter ──────────────────────────────────────────────────
//
// Uses an in-memory Map keyed by socket ID to track message counts within a
// sliding window. This is intentionally local (not Redis) because each server
// instance only needs to enforce limits for its own connected sockets.
//
const socketRateCounters = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a socket has exceeded its per-second message rate limit.
 * Returns `true` if the limit is exceeded, `false` otherwise.
 */
function checkRateLimit(socket: AuthenticatedSocket): RateLimitViolation | null {
  const now = Date.now();
  const { maxMessagesPerSecond, windowMs } = config.rateLimit;

  let entry = socketRateCounters.get(socket.id);

  if (!entry || now >= entry.resetAt) {
    // New window
    entry = { count: 0, resetAt: now + windowMs };
    socketRateCounters.set(socket.id, entry);
  }

  entry.count++;

  if (entry.count > maxMessagesPerSecond) {
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded: max ${maxMessagesPerSecond} messages per second`,
      limit: maxMessagesPerSecond,
      windowMs,
      currentCount: entry.count,
    };
  }

  return null;
}

/**
 * Clean up a socket's rate-limit counter on disconnect.
 */
function clearRateLimit(socketId: string): void {
  socketRateCounters.delete(socketId);
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  // ─── SENTRY INITIALIZATION ────────────────────────────────────────────────
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.nodeEnv,
      tracesSampleRate: config.sentry.tracesSampleRate,
      profilesSampleRate: config.sentry.profilesSampleRate,
      attachStacktrace: true,
    });
    
    logger.log('Sentry error tracking initialized');
  } else {
    logger.log('Sentry DSN not configured - error tracking disabled');
  }

  // Create Redis clients for Socket.IO adapter
  pubClient = createRedisClient('pub');
  subClient = createRedisClient('sub');

  // Wait for connections
  await Promise.all([
    new Promise<void>((resolve) => pubClient!.once('ready', resolve)),
    new Promise<void>((resolve) => subClient!.once('ready', resolve)),
  ]);

  // Dedicated Redis client for handler state (separate from adapter)
  const stateClient = createRedisClient('state');

  // HTTP server + Socket.IO
  const httpServer = createServer((_req, res) => {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'hexa-hub-realtime' }));
  });

  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
    },
    pingInterval: config.heartbeat.interval,
    pingTimeout: config.heartbeat.timeout,
  });

  // ── Redis Adapter (enables horizontal scaling) ──────────────────────────
  io.adapter(createAdapter(pubClient, subClient));

  // ── Message Queue (for offline message buffering) ────────────────────────
  const messageQueue = new MessageQueue(stateClient);

  // ── Instantiate Handlers ────────────────────────────────────────────────
  const presenceHandler = new PresenceHandler(io, stateClient);
  const messageHandler = new MessageHandler(io, stateClient, messageQueue);
  const notificationHandler = new NotificationHandler(io, stateClient, messageQueue);
  const channelHandler = new ChannelHandler(io, stateClient);

  // ── Global Rate-Limiting Middleware ──────────────────────────────────────
  io.use((socket: AuthenticatedSocket, next) => {
    // Only rate-limit after authentication (so auth errors aren't counted)
    // We install this after the auth middleware via a wrapper check
    next();
  });

  // ── Authentication Middleware ────────────────────────────────────────────
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      next(new Error('Authentication error: Token missing'));
      return;
    }

    try {
      const decoded = verify(token, config.jwt.secret) as JwtPayload;
      // JWT payload may be nested under `payload` or flat
      const user = (decoded.payload as Record<string, unknown>) ?? decoded;

      socket.data.user = {
        sub: (user.sub as string) ?? (user.id as string) ?? '',
        email: (user.email as string) ?? '',
        name: user.name as string | undefined,
        role: user.role as string | undefined,
      };
      socket.data.isAlive = true;

      if (!socket.data.user.sub) {
        next(new Error('Authentication error: Invalid token — missing user ID'));
        return;
      }

      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // ── Connection Handler ──────────────────────────────────────────────────
  io.on('connection', async (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const user = socket.data.user;

    logger.info(`Socket connected: ${socket.id} — user: ${user.email} (${user.sub})`);

    // ─── Per-Socket Rate-Limiting Wrapper ───────────────────────────────────
    //
    // Wraps socket.emit to enforce message rate limits on all events.
    // The original socket methods are monkey-patched so ALL handler emits
    // (including those in external handler classes) go through the limiter.
    //
    const originalOnevent = (socket as unknown as Record<string, unknown>).onevent;
    (socket as unknown as Record<string, unknown>).onevent = function (packet: unknown) {
      const rateViolation = checkRateLimit(socket);
      if (rateViolation) {
        logger.warn(
          `Rate limit exceeded for socket ${socket.id} (${user.email}): ${rateViolation.currentCount} messages/sec`,
        );
        socket.emit(EVENTS.ERROR, rateViolation);
        return;
      }
// Call original handler
       if (typeof originalOnevent === 'function') {
         (originalOnevent as Function).call(this, packet);
       }
    };

    // 1. Join personal room for targeted notifications
    socket.join(`user:${user.sub}`);

    // 2. Register presence
    await presenceHandler.userConnected(socket);

    // 3. Register event handlers
    messageHandler.register(socket);
    notificationHandler.register(socket);
    channelHandler.register(socket);

    // ── Deliver queued messages from previous disconnect ──────────────────
    const hasQueued = await messageQueue.hasQueuedMessages(user.sub);
    if (hasQueued) {
      const queuedMessages = await messageQueue.dequeueAll(user.sub);
      if (queuedMessages.length > 0) {
        socket.emit(EVENTS.QUEUED_MESSAGES, {
          messages: queuedMessages,
          count: queuedMessages.length,
        });
        logger.info(
          `Delivered ${queuedMessages.length} queued messages to ${user.email}`,
        );
      }
    }

    // ── Token Refresh ────────────────────────────────────────────────────
    socket.on(EVENTS.TOKEN_EXPIRING, (payload: TokenRefreshPayload) => {
      if (!payload?.currentToken) {
        socket.emit(EVENTS.ERROR, {
          code: 'INVALID_TOKEN_REFRESH',
          message: 'currentToken is required',
        });
        return;
      }

      try {
        // Verify the current (expiring) token — we allow expired tokens within
        // a grace period using ignoreExpiration: true, then check manually.
        const decoded = verify(payload.currentToken, config.jwt.secret, {
          ignoreExpiration: true,
        }) as JwtPayload;

        const tokenUser =
          (decoded.payload as Record<string, unknown>) ?? decoded;

        // Ensure the token belongs to the authenticated user
        const tokenSub =
          (tokenUser.sub as string) ??
          (tokenUser.id as string) ??
          '';
        if (tokenSub !== user.sub) {
          socket.emit(EVENTS.ERROR, {
            code: 'TOKEN_MISMATCH',
            message: 'Token does not belong to the authenticated user',
          });
          return;
        }

        // Issue a fresh token
        const newPayload = {
          sub: user.sub,
          email: user.email,
          role: user.role,
        };
        const newToken = sign(newPayload, config.jwt.secret, {
          expiresIn: config.jwt.expiresIn,
        });

        const response: TokenRefreshResponse = {
          token: newToken,
          expiresIn: 3_600, // 1 hour in seconds
        };

        socket.emit(EVENTS.TOKEN_REFRESHED, response);

        logger.info(`Token refreshed for ${user.email} (${user.sub})`);
      } catch (error) {
        logger.error(
          `Token refresh failed for ${user.email}: ${(error as Error).message}`,
        );
        socket.emit(EVENTS.ERROR, {
          code: 'TOKEN_REFRESH_FAILED',
          message: 'Failed to refresh token — it may be invalid or malformed',
        });
      }
    });

    // ── Presence: get online users ──────────────────────────────────────
    socket.on(EVENTS.USER_GET_ONLINE, () => {
      presenceHandler.getOnlineUsers(socket);
    });

    // ── Room Management ─────────────────────────────────────────────────
    socket.on(EVENTS.ROOM_JOIN, (payload: JoinRoomPayload) => {
      if (!payload?.conversationId) {
        socket.emit(EVENTS.ERROR, {
          code: 'INVALID_PAYLOAD',
          message: 'conversationId is required',
        });
        return;
      }

      socket.join(`conv:${payload.conversationId}`);
      socket.emit(EVENTS.ROOM_JOINED, {
        conversationId: payload.conversationId,
        timestamp: new Date().toISOString(),
      });

      // Notify other participants
      socket.to(`conv:${payload.conversationId}`).emit(EVENTS.ROOM_JOINED, {
        conversationId: payload.conversationId,
        userId: user.sub,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      logger.info(`${user.email} joined room conv:${payload.conversationId}`);
    });

    socket.on(EVENTS.ROOM_LEAVE, (payload: LeaveRoomPayload) => {
      if (!payload?.conversationId) {
        socket.emit(EVENTS.ERROR, {
          code: 'INVALID_PAYLOAD',
          message: 'conversationId is required',
        });
        return;
      }

      // Notify before leaving
      socket.to(`conv:${payload.conversationId}`).emit(EVENTS.ROOM_LEFT, {
        conversationId: payload.conversationId,
        userId: user.sub,
        email: user.email,
        timestamp: new Date().toISOString(),
      });

      socket.leave(`conv:${payload.conversationId}`);
      socket.emit(EVENTS.ROOM_LEFT, {
        conversationId: payload.conversationId,
        timestamp: new Date().toISOString(),
      });

      logger.info(`${user.email} left room conv:${payload.conversationId}`);
    });

    socket.on(EVENTS.ROOM_CREATE, (payload: CreateRoomPayload) => {
      if (!payload?.conversationId || !Array.isArray(payload.participants)) {
        socket.emit(EVENTS.ERROR, {
          code: 'INVALID_PAYLOAD',
          message: 'conversationId and participants array are required',
        });
        return;
      }

      // Auto-join the creator
      socket.join(`conv:${payload.conversationId}`);

      const roomCreatedEvent = {
        conversationId: payload.conversationId,
        participants: payload.participants,
        createdBy: user.sub,
        timestamp: new Date().toISOString(),
      };

      // Emit to the creator
      socket.emit(EVENTS.ROOM_CREATED, roomCreatedEvent);

      // Emit to all participants' personal rooms so they can auto-join
      for (const participantId of payload.participants) {
        if (participantId !== user.sub) {
          io.to(`user:${participantId}`).emit(EVENTS.ROOM_CREATED, roomCreatedEvent);
        }
      }

      logger.info(
        `Room conv:${payload.conversationId} created by ${user.email} with ${payload.participants.length} participants`,
      );
    });

    // ── Heartbeat / Ping ────────────────────────────────────────────────
    socket.on(EVENTS.PING, () => {
      socket.data.isAlive = true;
      socket.emit(EVENTS.PONG, {
        timestamp: new Date().toISOString(),
        serverTime: Date.now(),
      });
    });

    // ── Disconnect ──────────────────────────────────────────────────────
    socket.on('disconnect', async (reason) => {
      logger.info(
        `Socket disconnected: ${socket.id} — user: ${user.email} — reason: ${reason}`,
      );

      // Cleanup rate-limit counter
      clearRateLimit(socket.id);

      // Cleanup presence
      await presenceHandler.userDisconnected(socket);

      // Cleanup typing indicators
      await messageHandler.cleanupTyping(user.sub);

      // Cleanup channel presence
      await channelHandler.cleanupAll(user.sub);

      // Log queue status
      const queueSize = await messageQueue.getQueueSize(user.sub);
      if (queueSize > 0) {
        logger.info(
          `User ${user.email} disconnecting with ${queueSize} queued messages pending delivery`,
        );
      }
    });
  });

  // ── Periodic Heartbeat Check (server-initiated) ─────────────────────────
  const heartbeatTimer = setInterval(() => {
    io.sockets.sockets.forEach((rawSocket) => {
      const s = rawSocket as AuthenticatedSocket;
      if (!s.data.isAlive) {
        logger.warn(`Socket ${s.id} missed heartbeat — terminating`);
        s.disconnect(true);
        return;
      }
      s.data.isAlive = false;
      s.emit(EVENTS.PING, { timestamp: new Date().toISOString() });
    });
  }, config.heartbeat.interval);

  // ── Graceful Shutdown ───────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal} — shutting down gracefully`);

    clearInterval(heartbeatTimer);

    // Stop accepting new connections
    io.close(() => {
      logger.info('Socket.IO server closed');
    });

    // Close Redis connections
    const clients = [pubClient, subClient, stateClient].filter(Boolean) as Redis[];
    await Promise.all(clients.map((c) => c.quit()));

    logger.info('All Redis connections closed');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ── Start Server ────────────────────────────────────────────────────────
  httpServer.listen(config.port, () => {
    logger.info(`HEXA Hub Realtime Server running on port ${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}/`);
  });
}

bootstrap().catch((err) => {
  logger.error('Worker failed to start:', err);
  process.exit(1);
});