import Bull from 'bull';
import { Logger } from '@nestjs/common';
import { env } from './config/env';
import { createQueues, shutdownQueues } from './queues/create-queues';
import { processEmailJob } from './processors/email.processor';
import { processNotificationJob } from './processors/notification.processor';
import { processAiJob } from './processors/ai.processor';

const logger = new Logger('Worker');

async function bootstrap(): Promise<void> {
  logger.log('HEXA Hub Worker — starting background job processors');
  logger.log(`Redis: ${env.redisUrl} | Concurrency: ${env.concurrency}`);

  const queues = createQueues();

  queues.email.process(env.concurrency, processEmailJob);
  queues.notifications.process(env.concurrency, processNotificationJob);
  queues.ai.process(Math.max(1, Math.floor(env.concurrency / 2)), processAiJob);

  const attachListeners = <T>(name: string, queue: Bull.Queue<T>) => {
    queue.on('completed', (job) => logger.log(`[${name}] ✓ ${job.id}`));
    queue.on('failed', (job, err) => logger.error(`[${name}] ✗ ${job?.id}: ${err.message}`));
    queue.on('error', (err) => logger.error(`[${name}] queue error: ${err.message}`));
  };

  attachListeners('email', queues.email);
  attachListeners('notifications', queues.notifications);
  attachListeners('ai', queues.ai);

  logger.log('Worker is ready — listening on email, notifications, and ai queues');

  const shutdown = async (signal: string) => {
    logger.log(`\nReceived ${signal}, shutting down gracefully…`);
    await shutdownQueues(queues);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Worker failed to start:', err);
  process.exit(1);
});
