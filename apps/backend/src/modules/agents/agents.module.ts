import { Module, forwardRef } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentMemoryService } from './agent-memory.service';
import { HermesAgentService } from '../ai/hermes.service';
import { ToolRegistryService } from './tool-registry.service';
import { GatekeeperService } from './gatekeeper.service';
import { SwarmOrchestratorService } from './swarm-orchestrator.service';
import { ProjectsModule } from '../projects/projects.module';
import { VectorModule } from '../vector/vector.module';
import { AIModule } from '../ai/ai.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { AGENTS_PORT } from '../../ports/agents.port';
import { AGENT_MEMORY_PORT } from '../../ports/agent-memory.port';

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
    HermesAgentService,
    ToolRegistryService,
    GatekeeperService,
    SwarmOrchestratorService,
  ],
  exports: [AgentsService, AgentMemoryService, HermesAgentService, SwarmOrchestratorService, ToolRegistryService],
})
export class AgentsModule {}
