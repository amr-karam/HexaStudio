import { Module, forwardRef } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { AutoTagService } from './auto-tag.service';
import { LightingService } from './lighting.service';
import { SummaryService } from './summary.service';
import { AiChatService } from './ai-chat.service';
import { MultimodalService } from './multimodal.service';
import { StructuredOutputService } from './structured-output.service';
import { AiCacheService } from './ai-cache.service';
import { TokenUsageService } from './token-usage.service';
import { VectorModule } from '../vector/vector.module';

/**
 * AIModule
 *
 * ═══════════ CIRCULAR DEPENDENCY ═══════════
 * This module is part of a 3-way circular dependency:
 *   ProjectsModule ──► VectorModule (forwardRef)
 *   VectorModule ────► AIModule (forwardRef), ProjectsModule (forwardRef)
 *   AIModule ────────► VectorModule (forwardRef)
 *
 * Reason: AI services (EmbeddingService, LightingService) consume
 * VectorService from VectorModule. VectorModule is @Global() but
 * AIModule is not, so the explicit import (with forwardRef) is required.
 *
 * forwardRef() is used intentionally to break the cycle at the module level.
 * See ADR-003 for the planned resolution (interface-based IoC).
 * ════════════════════════════════════════════
 */
@Module({
  imports: [forwardRef(() => VectorModule)],
  providers: [
    AiChatService,
    EmbeddingService,
    AutoTagService,
    LightingService,
    SummaryService,
    MultimodalService,
    StructuredOutputService,
    AiCacheService,
    TokenUsageService,
  ],
  exports: [
    AiChatService,
    EmbeddingService,
    AutoTagService,
    LightingService,
    SummaryService,
    MultimodalService,
    StructuredOutputService,
    AiCacheService,
    TokenUsageService,
  ],
})
export class AIModule {}
