import { Module, forwardRef } from '@nestjs/common';
import { TransformReasoningService } from './transform-reasoning.service';
import { EmbeddingService } from './embedding.service';
import { AutoTagService } from './auto-tag.service';
import { AutoTagVisionService } from './auto-tag-vision.service';
import { LightingService } from './lighting.service';
import { SummaryService } from './summary.service';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { ModelRouterService } from './model-router.service';
import { MultimodalService } from './multimodal.service';
import { MultimodalController } from './multimodal.controller';
import { StructuredOutputService } from './structured-output.service';
import { AiCacheService } from './ai-cache.service';
import { TokenUsageService } from './token-usage.service';
import { VoiceService } from './voice.service';
import { SpatialSynthesisService } from './spatial-synthesis.service';
import { SpatialSynthesisController } from './spatial-synthesis.controller';
import { MinIOVisionService } from './minio-vision.listener';
import { StorageModule } from '../storage/storage.module';
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
  imports: [forwardRef(() => VectorModule), StorageModule],
  controllers: [MultimodalController, AiChatController, SpatialSynthesisController],
  providers: [
    AiChatService,
    ModelRouterService,
    EmbeddingService,
    AutoTagService,
    AutoTagVisionService,
    LightingService,
    SummaryService,
    MultimodalService,
    StructuredOutputService,
    AiCacheService,
    TokenUsageService,
    VoiceService,
    TransformReasoningService,
    SpatialSynthesisService,
    MinIOVisionService,
  ],
  exports: [
    AiChatService,
    ModelRouterService,
    EmbeddingService,
    AutoTagService,
    AutoTagVisionService,
    LightingService,
    SummaryService,
    MultimodalService,
    StructuredOutputService,
    AiCacheService,
    TokenUsageService,
    VoiceService,
    TransformReasoningService,
    SpatialSynthesisService,
    MinIOVisionService,
  ],
})
export class AIModule {}
