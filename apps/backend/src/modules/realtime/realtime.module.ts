import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { AnnotationsController } from './annotations.controller';

@Module({
  controllers: [ApprovalController, AnnotationsController],
  providers: [RealtimeGateway, ApprovalService],
  exports: [RealtimeGateway, ApprovalService],
})
export class RealtimeModule {}
