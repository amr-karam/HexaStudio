import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3001,
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'hexa-hub-super-secret-key',
  },
  heartbeat: {
    interval: Number(process.env.HEARTBEAT_INTERVAL) || 25_000,
    timeout: Number(process.env.HEARTBEAT_TIMEOUT) || 60_000,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
} as const;
