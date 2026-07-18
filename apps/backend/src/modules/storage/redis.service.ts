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

  async sadd(key: string, value: string): Promise<void> {
    await this.client.sadd(key, value);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async srem(key: string, value: string): Promise<void> {
    await this.client.srem(key, value);
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }

  async hset(key: string, field: string, value: unknown): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const result = await this.client.hgetall(key);
    const parsed: Record<string, T> = {};
    for (const [field, value] of Object.entries(result)) {
      try {
        parsed[field] = JSON.parse(value) as T;
      } catch {
        parsed[field] = value as unknown as T;
      }
    }
    return parsed;
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async hexists(key: string, field: string): Promise<boolean> {
    const exists = await this.client.hexists(key, field);
    return exists === 1;
  }

  async flush(): Promise<void> {
    await this.client.flushall();
  }
}
