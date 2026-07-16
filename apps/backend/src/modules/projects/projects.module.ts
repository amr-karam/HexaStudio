import { Module, Global, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { OdooModule } from '../odoo/odoo.module';
import { VectorModule } from '../vector/vector.module';

/**
 * ProjectsModule
 *
 * ═══════════ CIRCULAR DEPENDENCY ═══════════
 * This module, VectorModule, and AIModule form a 3-way circular dependency:
 *   ProjectsModule ──► VectorModule (forwardRef)
 *   VectorModule ────► AIModule (forwardRef), ProjectsModule (forwardRef)
 *   AIModule ────────► VectorModule (forwardRef)
 *
 * Reason: ProjectsController uses RecommendationService (from VectorModule),
 * while Vector services consume ProjectsService and AI services.
 *
 * forwardRef() is used intentionally to break the cycle at the module level.
 * See ADR-003 for the planned resolution (interface-based IoC).
 * ════════════════════════════════════════════
 */
@Global()
@Module({
  imports: [HttpModule, OdooModule, forwardRef(() => VectorModule)],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
