import { Module, forwardRef } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { AutoTagService } from './auto-tag.service';
import { LightingService } from './lighting.service';
import { SummaryService } from './summary.service';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [forwardRef(() => VectorModule)],
  providers: [EmbeddingService, AutoTagService, LightingService, SummaryService],
  exports: [EmbeddingService, AutoTagService, LightingService, SummaryService],
})
export class AIModule {}
