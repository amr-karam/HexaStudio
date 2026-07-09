import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { ProjectsModule } from '../projects/projects.module';
import { OdooModule } from '../odoo/odoo.module';

@Module({
  imports: [ProjectsModule, OdooModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
