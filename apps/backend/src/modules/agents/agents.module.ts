import { Module, forwardRef } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentMemoryService } from './agent-memory.service';
import { HermesAgentService } from '../ai/hermes.service';
import { ToolRegistryService } from './tool-registry.service';
import { GatekeeperService } from './gatekeeper.service';
import { SwarmOrchestratorService } from './swarm-orchestrator.service';
import { CognitiveAuditService } from './cognitive-audit.service';
import { OperationalTriggerService } from './operational-trigger.service';
import { ResearchToolsService } from './research-tools.service';
import { ResearchToolsController } from './research-tools.controller';
import { ProjectsModule } from '../projects/projects.module';
import { VectorModule } from '../vector/vector.module';
import { AIModule } from '../ai/ai.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { PdfModule } from '../pdf/pdf.module';
import { AGENTS_PORT } from '../../ports/agents.port';
import { AGENT_MEMORY_PORT } from '../../ports/agent-memory.port';

@Module({
  imports: [
    DiscoveryModule,
    ProjectsModule,
    VectorModule,
    AIModule,
    forwardRef(() => RealtimeModule),
    forwardRef(() => WebhooksModule),
    PdfModule,
  ],
  controllers: [AgentsController, ResearchToolsController],
  providers: [
    AgentsService,
    AgentMemoryService,
    HermesAgentService,
    ToolRegistryService,
    GatekeeperService,
    SwarmOrchestratorService,
    CognitiveAuditService,
    OperationalTriggerService,
    ResearchToolsService,
    { provide: AGENTS_PORT, useExisting: AgentsService },
    { provide: AGENT_MEMORY_PORT, useExisting: AgentMemoryService },
  ],
  exports: [
    AgentsService,
    AgentMemoryService,
    HermesAgentService,
    SwarmOrchestratorService,
    ToolRegistryService,
    CognitiveAuditService,
    OperationalTriggerService,
    ResearchToolsService,
    AGENTS_PORT,
    AGENT_MEMORY_PORT,
  ],
})
export class AgentsModule {}
