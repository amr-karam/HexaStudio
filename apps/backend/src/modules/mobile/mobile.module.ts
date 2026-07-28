import { Module } from '@nestjs/common';
import { MobileApiController } from './mobile.controller';
import { MobileApiService } from './mobile.service';
import { AuthModule } from '../auth';
import { RedisModule } from '../storage/redis.module';

@Module({
  imports: [AuthModule, RedisModule],
  controllers: [MobileApiController],
  providers: [MobileApiService],
  exports: [MobileApiService],
})
export class MobileModule {}