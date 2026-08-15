import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ResourceLoaderService } from './resource-loader.service';

@Module({
  imports: [CacheModule.register()],
  providers: [ResourceLoaderService],
  exports: [ResourceLoaderService],
})
export class ResourceLoaderModule {}
