import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Env } from '../../config/env';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService<Env>) {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
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

  async lpush(key: string, value: unknown): Promise<void> {
    await this.client.lpush(key, JSON.stringify(value));
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const items = await this.client.lrange(key, start, stop);
    return items.map((item) => JSON.parse(item) as T);
  }

  async llen(key: string): Promise<number> {
    return this.client.llen(key);
  }

  async lrem(key: string, count: number, value: unknown): Promise<void> {
    await this.client.lrem(key, count, JSON.stringify(value));
  }

  async flush(): Promise<void> {
    await this.client.flushall();
  }
}
