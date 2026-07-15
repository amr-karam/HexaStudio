import { Module, forwardRef } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { AutoTagService } from './auto-tag.service';
import { LightingService } from './lighting.service';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [forwardRef(() => VectorModule)],
  providers: [EmbeddingService, AutoTagService, LightingService],
  exports: [EmbeddingService, AutoTagService, LightingService],
})
export class AIModule {}
