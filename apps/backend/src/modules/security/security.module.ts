import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityAuditService } from './security-audit.service';

/**
 * Global so `SecurityAuditService` can be injected into cross-module guards
 * (e.g. `RolesGuard`, used by controllers across many modules) instead of
 * resolving it through `app.get(...)` request plumbing.
 *
 * Imports `ConfigModule` so `ConfigService` is available in test isolation
 * (without it, `@Global()` modules cannot resolve providers from dynamic
 * global modules imported at a different level in the test graph).
 */
@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [SecurityAuditService],
  exports: [SecurityAuditService],
})
export class SecurityModule {}
