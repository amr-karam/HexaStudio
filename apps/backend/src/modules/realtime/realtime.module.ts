import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { AnnotationsController } from './annotations.controller';
import { EventBus } from './event-bus.service';

@Module({
  controllers: [ApprovalController, AnnotationsController],
  providers: [RealtimeGateway, ApprovalService, EventBus],
  exports: [RealtimeGateway, ApprovalService, EventBus],
})
export class RealtimeModule {}
