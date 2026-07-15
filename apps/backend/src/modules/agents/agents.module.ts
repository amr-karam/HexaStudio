import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { ToolRegistry } from './tools';
import { ProjectsModule } from '../projects/projects.module';
import { VectorModule } from '../vector/vector.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [ProjectsModule, VectorModule, AIModule],
  controllers: [AgentsController],
  providers: [AgentsService, ToolRegistry],
  exports: [AgentsService],
})
export class AgentsModule {}
