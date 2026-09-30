import { Module } from '@nestjs/common';
import { AuditController } from './controllers/audit.controller';
import { DesignAuditService } from './services/design-audit.service';
import { LuxuryForgeService } from './services/luxury-forge.service';
import { AIModule } from '../ai/ai.module';
import { MemoryModule } from '../memory/memory.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [AIModule, MemoryModule, MetricsModule],
  controllers: [AuditController],
  providers: [DesignAuditService, LuxuryForgeService],
})
export class AuditModule {}
