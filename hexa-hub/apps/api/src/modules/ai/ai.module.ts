import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiController } from './ai.controller';
import { AgentsModule } from './agents/agents.module';

@Module({
  imports: [AgentsModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService, AgentsModule],
})
export class AiModule {}
