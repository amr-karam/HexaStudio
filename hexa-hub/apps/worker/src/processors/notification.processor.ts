import { Job } from 'bull';
import { NotificationJobPayload } from '@hexa-hub/types';
import Redis from 'ioredis';
import { env } from '../config/env';

const redis = new Redis(env.redisUrl);

export async function processNotificationJob(job: Job<NotificationJobPayload>): Promise<void> {
  const { userId, title, body, channel = 'in_app', metadata } = job.data;

  console.log(`[notifications] Processing job ${job.id}: "${title}" for user ${userId} via ${channel}`);

  try {
    await job.progress(25);

    // Publish the notification to Redis pub/sub for real-time delivery
    const notificationPayload = JSON.stringify({
      userId,
      title,
      body,
      channel,
      metadata,
      timestamp: new Date().toISOString()
    });

    await redis.publish('notifications', notificationPayload);
    console.log(`[notifications] Published to Redis pub/sub: ${notificationPayload}`);

    await job.progress(75);
    console.log(`[notifications] Body: ${body}`, metadata ?? {});

    await job.progress(100);
    console.log(`[notifications] Job ${job.id} completed`);
  } catch (error: any) {
    console.error(`[notifications] Error processing job ${job.id}:`, error.message);
    throw error;
  }
}
