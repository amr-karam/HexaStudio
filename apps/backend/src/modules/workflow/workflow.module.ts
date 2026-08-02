/**
 * HEXA Hub — Workflow Module
 *
 * Provides the workflow automation engine for cross-module business process
 * orchestration. Manages workflow definitions, execution, and event-driven
 * triggers.
 *
 * @module workflow
 */

import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowRepository } from './workflow.repository';
import { WorkflowEventListener } from './workflow-event.listener';
import { WorkflowSeeder } from './workflow.seeder';
import { RealtimeModule } from '../realtime/realtime.module';

/**
 * WorkflowModule
 *
 * Registers the workflow automation engine and its dependencies.
 * The WorkflowEngineService is exported so other modules can register
 * their services with the engine at runtime.
 *
 * NOTE: Domain modules (HelpdeskModule, ProjectsModule, etc.) are NOT
 * imported here to avoid circular dependencies. Instead, the AppModule
 * (or a dedicated wiring module) registers domain service instances
 * with the WorkflowEngineService at bootstrap time via `registerService()`.
 */
@Module({
  imports: [RealtimeModule],
  controllers: [WorkflowController],
  providers: [WorkflowEngineService, WorkflowRepository, WorkflowEventListener, WorkflowSeeder],
  exports: [WorkflowEngineService],
})
export class WorkflowModule {}
