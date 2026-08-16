import { Global, Module } from '@nestjs/common';
import { SecurityAuditService } from './security-audit.service';

/**
 * Global so `SecurityAuditService` can be injected into cross-module guards
 * (e.g. `RolesGuard`, used by controllers across many modules) instead of
 * resolving it through `app.get(...)` request plumbing.
 */
@Global()
@Module({
  providers: [SecurityAuditService],
  exports: [SecurityAuditService],
})
export class SecurityModule {}
