import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { verify } from 'jsonwebtoken';

dotenv.config();

const PORT = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const JWT_SECRET = process.env.JWT_SECRET || 'hexa-hub-super-secret-key';

async function bootstrap() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const pubClient = new Redis(REDIS_URL);
  const subClient = new Redis(REDIS_URL);

  io.adapter(createAdapter(pubClient, subClient));

  // Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = verify(token, JWT_SECRET) as { payload: Record<string, unknown> };
      socket.data.user = decoded.payload;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.email} (${user.id})`);

    // Join personal room for targeted notifications
    socket.join(`user:${user.sub}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.email}`);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`HEXA Hub Realtime Server running on port ${PORT}`);
  });
}

bootstrap().catch(console.error);
