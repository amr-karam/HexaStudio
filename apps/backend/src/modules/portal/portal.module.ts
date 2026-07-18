import { Module } from '@nestjs/common';
import { ClientPortalGateway } from './client-portal.gateway';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { OdooModule } from '../odoo/odoo.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [OdooModule, StorageModule],
  controllers: [PortalController],
  providers: [ClientPortalGateway, PortalService],
  exports: [PortalService],
})
export class PortalModule {}
