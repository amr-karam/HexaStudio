import Bull from 'bull';
import { env } from './config/env';
import { createQueues, shutdownQueues } from './queues/create-queues';
import { processEmailJob } from './processors/email.processor';
import { processNotificationJob } from './processors/notification.processor';
import { processAiJob } from './processors/ai.processor';

async function bootstrap(): Promise<void> {
  console.log('HEXA Hub Worker — starting background job processors');
  console.log(`Redis: ${env.redisUrl} | Concurrency: ${env.concurrency}`);

  const queues = createQueues();

  queues.email.process(env.concurrency, processEmailJob);
  queues.notifications.process(env.concurrency, processNotificationJob);
  queues.ai.process(Math.max(1, Math.floor(env.concurrency / 2)), processAiJob);

  const attachListeners = <T>(name: string, queue: Bull.Queue<T>) => {
    queue.on('completed', (job) => console.log(`[${name}] ✓ ${job.id}`));
    queue.on('failed', (job, err) => console.error(`[${name}] ✗ ${job?.id}:`, err.message));
    queue.on('error', (err) => console.error(`[${name}] queue error:`, err.message));
  };

  attachListeners('email', queues.email);
  attachListeners('notifications', queues.notifications);
  attachListeners('ai', queues.ai);

  console.log('Worker is ready — listening on email, notifications, and ai queues');

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down gracefully…`);
    await shutdownQueues(queues);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
