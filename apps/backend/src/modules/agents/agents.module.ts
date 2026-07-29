import { Module, forwardRef } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { GeminiService } from '../ai/gemini.service';
import { ToolRegistry } from './tools';
import { SwarmOrchestratorService } from './swarm-orchestrator.service';
import { ProjectsModule } from '../projects/projects.module';
import { VectorModule } from '../vector/vector.module';
import { AIModule } from '../ai/ai.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [ProjectsModule, VectorModule, AIModule, RealtimeModule, forwardRef(() => WebhooksModule)],
  controllers: [AgentsController],
  providers: [AgentsService, GeminiService, ToolRegistry, SwarmOrchestratorService],
  exports: [AgentsService, GeminiService, SwarmOrchestratorService],
})
export class AgentsModule {}
