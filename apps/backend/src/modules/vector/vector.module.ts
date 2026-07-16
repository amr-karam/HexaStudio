import { Module, Global, forwardRef } from '@nestjs/common';
import { AIModule } from '../ai/ai.module';
import { ProjectsModule } from '../projects/projects.module';
import { VectorService } from './vector.service';
import { VectorSyncService } from './vector-sync.service';
import { RecommendationService } from './recommendation.service';
import { VectorController } from './vector.controller';

/**
 * VectorModule
 *
 * ═══════════ CIRCULAR DEPENDENCY ═══════════
 * This module is the hub of a 3-way circular dependency:
 *   ProjectsModule ──► VectorModule (forwardRef)
 *   VectorModule ────► AIModule (forwardRef), ProjectsModule (forwardRef)
 *   AIModule ────────► VectorModule (forwardRef)
 *
 * Reason: Vector services (VectorService, VectorSyncService,
 * RecommendationService) consume EmbeddingService from AIModule and
 * ProjectsService from ProjectsModule. Conversely, AIModule services
 * and ProjectsController consume Vector services.
 *
 * forwardRef() is used intentionally to break the cycle at the module level.
 * See ADR-003 for the planned resolution (interface-based IoC).
 * ════════════════════════════════════════════
 */
@Global()
@Module({
  imports: [forwardRef(() => AIModule), forwardRef(() => ProjectsModule)],
  controllers: [VectorController],
  providers: [VectorService, VectorSyncService, RecommendationService],
  exports: [VectorService, VectorSyncService, RecommendationService],
})
export class VectorModule {}
