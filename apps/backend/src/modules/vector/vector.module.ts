import { Module, Global } from '@nestjs/common';
import { VectorService } from './vector.service';
import { VectorSyncService } from './vector-sync.service';
import { VectorController } from './vector.controller';

@Global()
@Module({
  controllers: [VectorController],
  providers: [VectorService, VectorSyncService],
  exports: [VectorService, VectorSyncService],
})
export class VectorModule {}
