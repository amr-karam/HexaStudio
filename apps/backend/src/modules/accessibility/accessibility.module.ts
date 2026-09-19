import { Global, Module } from '@nestjs/common';
import { AccessibilityAuditService } from './accessibility-audit.service';

@Global()
@Module({
  providers: [AccessibilityAuditService],
  exports: [AccessibilityAuditService],
})
export class AccessibilityModule {}
