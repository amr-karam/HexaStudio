import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { createServer } from 'http';
import { verify, type JwtPayload } from 'jsonwebtoken';
import { config } from './config';
import { logger } from './logger';
import { MessageHandler } from './handlers/message.handler';
import { PresenceHandler } from './handlers/presence.handler';
import { NotificationHandler } from './handlers/notification.handler';
import {
  type AuthenticatedSocket,
  type JoinRoomPayload,
  type LeaveRoomPayload,
  type CreateRoomPayload,
  EVENTS,
} from './types';

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

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
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

  // ── Instantiate Handlers ────────────────────────────────────────────────
  const presenceHandler = new PresenceHandler(io, stateClient);
  const messageHandler = new MessageHandler(io, stateClient);
  const notificationHandler = new NotificationHandler(io, stateClient);

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

    // 1. Join personal room for targeted notifications
    socket.join(`user:${user.sub}`);

    // 2. Register presence
    await presenceHandler.userConnected(socket);

    // 3. Register event handlers
    messageHandler.register(socket);
    notificationHandler.register(socket);

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

      // Cleanup presence
      await presenceHandler.userDisconnected(socket);

      // Cleanup typing indicators
      await messageHandler.cleanupTyping(user.sub);
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
