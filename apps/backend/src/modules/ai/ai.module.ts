import { Module, forwardRef } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [forwardRef(() => VectorModule)],
  providers: [EmbeddingService],
  exports: [EmbeddingService],
})
export class AIModule {}
