import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorModule } from '../vector/vector.module';

@Module({
  imports: [VectorModule],
  providers: [EmbeddingService],
  exports: [EmbeddingService],
})
export class AIModule {}
