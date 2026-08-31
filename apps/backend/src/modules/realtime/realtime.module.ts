import { Module, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ApprovalService } from './approval.service';
import { ApprovalRepository } from './approval.repository';
import { ApprovalController } from './approval.controller';
import { AnnotationsController } from './annotations.controller';
import { EventBus } from './event-bus.service';
import { AIModule } from '../ai/ai.module';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    forwardRef(() => AIModule),
    forwardRef(() => AgentsModule),
  ],
  controllers: [ApprovalController, AnnotationsController],
  providers: [RealtimeGateway, ApprovalRepository, ApprovalService, EventBus],
  exports: [RealtimeGateway, ApprovalService, EventBus],
})
export class RealtimeModule {}
