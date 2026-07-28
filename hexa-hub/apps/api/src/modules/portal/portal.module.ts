import { Module } from '@nestjs/common';
import { OdooModule } from '../odoo/odoo.module';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

@Module({
  imports: [OdooModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
