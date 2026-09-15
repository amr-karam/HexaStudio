import { Module } from '@nestjs/common';
import { MinioUploadController } from './minio-upload.controller';
import { MinioUploadService } from './minio-upload.service';
import { StorageModule } from '../storage/storage.module';
import { OdooModule } from '../odoo/odoo.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [StorageModule, OdooModule, RealtimeModule],
  controllers: [MinioUploadController],
  providers: [MinioUploadService],
  exports: [MinioUploadService],
})
export class MinioUploadModule {}
