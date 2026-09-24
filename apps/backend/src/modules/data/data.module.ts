import { Global, Module } from '@nestjs/common';
import { DataCacheService } from './data-cache.service';

@Global()
@Module({
  providers: [DataCacheService],
  exports: [DataCacheService],
})
export class DataModule {}
