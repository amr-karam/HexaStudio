import { Module, forwardRef } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { AutoTagService } from './auto-tag.service';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [forwardRef(() => VectorModule)],
  providers: [EmbeddingService, AutoTagService],
  exports: [EmbeddingService, AutoTagService],
})
export class AIModule {}
