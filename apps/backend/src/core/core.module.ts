import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { RedisModule } from '../modules/storage/redis.module';
import { StorageModule } from '../modules/storage/storage.module';

@Global()
@Module({
  imports: [
    AuthModule,
    RedisModule,
    StorageModule,
  ],
  exports: [
    AuthModule,
    RedisModule,
    StorageModule,
  ],
})
export class CoreModule {}
