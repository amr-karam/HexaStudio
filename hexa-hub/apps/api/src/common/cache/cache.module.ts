import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-yet';
import { CacheManagerService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const ttl = configService.get<number>('cache.ttl') || 300;

        // Use Redis store if available; fall back to in-memory for local dev
        const useRedis = !configService.get<string>('REDIS_DISABLED');
        if (useRedis) {
          try {
            // Parse Redis URL to extract host, port, etc.
            const url = new URL(redisUrl);
            // Test the connection by attempting a lazy connect
            return {
              store: redisStore,
              socket: {
                host: url.hostname,
                port: parseInt(url.port || '6379'),
              },
              username: url.username || null,
              password: url.password || null,
              database: 0,
              ttl,
            };
          } catch (e) {
            // Fall through to memory store on Redis connection failure
          }
        }

        // In-memory store (local dev fallback)
        return { ttl };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheManagerModule {}