import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIModule } from '../ai/ai.module';
import { VectorMemoryService } from './vector/vector-memory.service';

/**
 * MemoryModule — provides vector memory services (Qdrant-backed).
 *
 * Uses forwardRef for AIModule due to the global circular dependency
 * chain (AIModule → VectorModule → ... → MemoryModule → AIModule).
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    forwardRef(() => AIModule),
  ],
  providers: [VectorMemoryService],
  exports: [VectorMemoryService],
})
export class MemoryModule {}