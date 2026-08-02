import { Module } from '@nestjs/common';
import { OdooModule } from '../odoo/odoo.module';
import { AiModule } from '../ai/ai.module';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { PortalCopilotService } from './portal-copilot.service';

@Module({
  imports: [OdooModule, AiModule],
  controllers: [PortalController],
  providers: [PortalService, PortalCopilotService],
  exports: [PortalCopilotService],
})
export class PortalModule {}
