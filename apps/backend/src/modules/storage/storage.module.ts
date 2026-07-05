import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { MinioService } from './minio.service';

@Module({
  controllers: [StorageController],
  providers: [MinioService],
  exports: [MinioService],
})
export class StorageModule {}
