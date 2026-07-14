import { Module, Global, forwardRef } from '@nestjs/common';
import { AIModule } from '../ai/ai.module';
import { VectorService } from './vector.service';
import { VectorSyncService } from './vector-sync.service';
import { VectorController } from './vector.controller';

@Global()
@Module({
  imports: [forwardRef(() => AIModule)],
  controllers: [VectorController],
  providers: [VectorService, VectorSyncService],
  exports: [VectorService, VectorSyncService],
})
export class VectorModule {}
