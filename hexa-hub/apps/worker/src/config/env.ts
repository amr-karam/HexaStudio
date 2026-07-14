import dotenv from 'dotenv';

dotenv.config();

export const env = {
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  geminiApiKey: process.env.GEMINI_API_KEY,
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@hexastudio.net',
  },
};
