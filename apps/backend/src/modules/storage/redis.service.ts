import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { getEnv } from '../../config/env';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor() {
    const env = getEnv();
    this.client = new Redis({
      host: env.REDIS_HOST || 'redis',
      port: env.REDIS_PORT || 6379,
      password: env.REDIS_PASSWORD,
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connected successfully');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: unknown, ttl = 3600): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flush(): Promise<void> {
    await this.client.flushall();
  }
}
