import { Module, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ApprovalService } from './approval.service';
import { ApprovalRepository } from './approval.repository';
import { ApprovalController } from './approval.controller';
import { AnnotationsController } from './annotations.controller';
import { EventBus } from './event-bus.service';
import { AIModule } from '../ai/ai.module';
import { AgentsModule } from '../agents/agents.module';
import { REALTIME_PORT } from '../../ports/realtime.port';

@Module({
  imports: [AIModule, forwardRef(() => AgentsModule)],
  controllers: [ApprovalController, AnnotationsController],
  providers: [RealtimeGateway, ApprovalRepository, ApprovalService, EventBus, { provide: REALTIME_PORT, useExisting: EventBus }],
  exports: [RealtimeGateway, ApprovalService, EventBus, REALTIME_PORT],
})
export class RealtimeModule {}