import { Module, forwardRef } from '@nestjs/common';
import { ClientPortalGateway } from './client-portal.gateway';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { PortalCopilotService } from './portal-copilot.service';
import { OdooModule } from '../odoo/odoo.module';
import { StorageModule } from '../storage/storage.module';
import { AIModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    OdooModule,
    StorageModule,
    AIModule,
    forwardRef(() => AuthModule),
    forwardRef(() => ProjectsModule),
  ],
  controllers: [PortalController],
  providers: [ClientPortalGateway, PortalService, PortalCopilotService],
  exports: [PortalService, PortalCopilotService, ClientPortalGateway],
})
export class PortalModule {}
