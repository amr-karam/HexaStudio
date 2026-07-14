import { Job } from 'bull';
import { NotificationJobPayload } from '@hexa-hub/types';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { env } from '../config/env';

const logger = new Logger('NotificationProcessor');
const redis = new Redis(env.redisUrl);

export async function processNotificationJob(job: Job<NotificationJobPayload>): Promise<void> {
  const { userId, title, body, channel = 'in_app', metadata } = job.data;

  logger.log(`[notifications] Processing job ${job.id}: "${title}" for user ${userId} via ${channel}`);

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
    logger.log(`[notifications] Published to Redis pub/sub: ${notificationPayload}`);

    await job.progress(75);
    logger.log(`[notifications] Body: ${body}`, metadata ?? {});

    await job.progress(100);
    logger.log(`[notifications] Job ${job.id} completed`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[notifications] Error processing job ${job.id}: ${message}`);
    throw error;
  }
}
