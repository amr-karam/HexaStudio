import { Module, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { AnnotationsController } from './annotations.controller';
import { EventBus } from './event-bus.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [forwardRef(() => AIModule)],
  controllers: [ApprovalController, AnnotationsController],
  providers: [RealtimeGateway, ApprovalService, EventBus],
  exports: [RealtimeGateway, ApprovalService, EventBus],
})
export class RealtimeModule {}
