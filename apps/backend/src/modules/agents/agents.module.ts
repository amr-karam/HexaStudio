import { Module, forwardRef } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentMemoryService } from './agent-memory.service';
import { GeminiService } from '../ai/gemini.service';
import { ToolRegistryService } from './tool-registry.service';
import { GatekeeperService } from './gatekeeper.service';
import { SwarmOrchestratorService } from './swarm-orchestrator.service';
import { ProjectsModule } from '../projects/projects.module';
import { VectorModule } from '../vector/vector.module';
import { AIModule } from '../ai/ai.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    DiscoveryModule,
    ProjectsModule,
    VectorModule,
    AIModule,
    RealtimeModule,
    forwardRef(() => WebhooksModule),
  ],
  controllers: [AgentsController],
  providers: [
    AgentsService,
    AgentMemoryService,
    GeminiService,
    ToolRegistryService,
    GatekeeperService,
    SwarmOrchestratorService,
  ],
  exports: [AgentsService, AgentMemoryService, GeminiService, SwarmOrchestratorService, ToolRegistryService],
})
export class AgentsModule {}
