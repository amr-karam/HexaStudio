import Bull, { Queue, Job } from 'bull';
import { QUEUE_NAMES, EmailJobPayload, NotificationJobPayload, AiJobPayload } from '@hexa-hub/types';
import { env } from '../config/env';

export type JobQueues = {
  email: Queue<EmailJobPayload>;
  notifications: Queue<NotificationJobPayload>;
  ai: Queue<AiJobPayload>;
};

export function createQueues(): JobQueues {
  const defaultJobOptions: Bull.JobOptions = {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  };

  return {
    email: new Bull<EmailJobPayload>(QUEUE_NAMES.EMAIL, env.redisUrl, { defaultJobOptions }),
    notifications: new Bull<NotificationJobPayload>(QUEUE_NAMES.NOTIFICATIONS, env.redisUrl, {
      defaultJobOptions,
    }),
    ai: new Bull<AiJobPayload>(QUEUE_NAMES.AI, env.redisUrl, { defaultJobOptions }),
  };
}

export async function shutdownQueues(queues: JobQueues): Promise<void> {
  await Promise.all(Object.values(queues).map((queue) => queue.close()));
}

export type { Job };
