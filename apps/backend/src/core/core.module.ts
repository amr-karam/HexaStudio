import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { RedisModule } from '../modules/storage/redis.module';
import { StorageModule } from '../modules/storage/storage.module';
import { FramerController } from '../features/framer/framer.controller';

@Global()
@Module({
  imports: [
    AuthModule,
    RedisModule,
    StorageModule,
  ],
  controllers: [FramerController],
  exports: [
    AuthModule,
    RedisModule,
    StorageModule,
  ],
})
export class CoreModule {}
