import { Module } from '@nestjs/common';
import { MobileApiController } from './mobile.controller';
import { MobileApiService } from './mobile.service';
import { MobilePushService } from './mobile-push.service';
import { AuthModule } from '../auth';
import { RedisModule } from '../storage/redis.module';

@Module({
  imports: [AuthModule, RedisModule],
  controllers: [MobileApiController],
  providers: [MobileApiService, MobilePushService],
  exports: [MobileApiService, MobilePushService],
})
export class MobileModule {}