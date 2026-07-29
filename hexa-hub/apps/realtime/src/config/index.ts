import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3001,
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'hexa-hub-super-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  heartbeat: {
    interval: Number(process.env.HEARTBEAT_INTERVAL) || 25_000,
    timeout: Number(process.env.HEARTBEAT_TIMEOUT) || 60_000,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rateLimit: {
    maxMessagesPerSecond: Number(process.env.RATE_LIMIT_MAX_MSGS_PER_SEC) || 50,
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 1_000,
    maxConnectionsPerIp: Number(process.env.RATE_LIMIT_MAX_CONNS_PER_IP) || 10,
  },
} as const;
