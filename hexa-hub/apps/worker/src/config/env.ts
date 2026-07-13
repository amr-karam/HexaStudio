import dotenv from 'dotenv';

dotenv.config();

export const env = {
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  geminiApiKey: process.env.GEMINI_API_KEY,
};
