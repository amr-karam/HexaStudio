import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-yet';
import { CacheManagerService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        
        // Parse Redis URL to extract host, port, etc.
        const url = new URL(redisUrl);
        
        return {
          store: redisStore,
          socket: {
            host: url.hostname,
            port: parseInt(url.port),
          },
          username: url.username || null,
          password: url.password || null,
          database: 0, // Default database
          ttl: configService.get<number>('cache.ttl') || 300, // 5 minutes default
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheManagerModule {}