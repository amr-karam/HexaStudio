import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai.module';
import { OdooModule } from '../../odoo/odoo.module';
import { WorkspacesModule } from '../../workspaces/workspaces.module';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { Task } from '../../workspaces/entities/task.entity';
import { AgentsController } from './agents.controller';
import { AgentOrchestrator } from './agents.service';
import { ErpAnalystAgent } from './agents/erp-analyst.agent';
import { ProjectAssistantAgent } from './agents/project-assistant.agent';
import { SalesAgent } from './agents/sales.agent';
import { KnowledgeAgent } from './agents/knowledge.agent';
import { OdooTools } from './tools/odoo.tools';
import { PostgresTools } from './tools/postgres.tools';
import { KnowledgeTools } from './tools/knowledge.tools';
import { QdrantService } from './tools/qdrant.service';

@Module({
  imports: [
    AiModule,
    OdooModule,
    WorkspacesModule,
    TypeOrmModule.forFeature([Workspace, Task]),
  ],
  controllers: [AgentsController],
  providers: [
    AgentOrchestrator,
    ErpAnalystAgent,
    ProjectAssistantAgent,
    SalesAgent,
    KnowledgeAgent,
    OdooTools,
    PostgresTools,
    KnowledgeTools,
    QdrantService,
  ],
  exports: [AgentOrchestrator],
})
export class AgentsModule {}
