/**
 * Full-graph DI boot test.
 *
 * Verifies the real AppModule dependency graph resolves without provider
 * errors. This is the only automated proof that the backend actually boots:
 * several modules (Agents/Realtime/AI/Vector/…) form circular import chains
 * that resolve only in specific load orders, and a missing `HttpModule`-style
 * import (cf. StyleTransferModule) surfaces here instead of in production.
 *
 * Uses NestFactory.create() instead of Test.createTestingModule() because
 * the latter does not support deep circular module dependencies, while the
 * production NestJS container resolves them via forwardRef() at runtime.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

describe('AppModule (full-graph DI boot)', () => {
  it('compiles the entire dependency graph without unresolvable providers', async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    await app.close();
  }, 180000);
});
