import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OdooService } from './odoo.service';
import { OdooWebhookController } from './odoo.webhook.controller';
import { OdooSyncService } from './odoo-sync.service';
import { OdooApiService } from './odoo-api.service';
import { OdooApiController } from './odoo-api.controller';
import { OdooDocumentService } from './odoo-document.service';
import { OdooEventListener } from './odoo-event.listener';
import { RealtimeModule } from '../realtime/realtime.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [ConfigModule, RealtimeModule, StorageModule],
  controllers: [OdooWebhookController, OdooApiController],
  providers: [OdooService, OdooSyncService, OdooApiService, OdooDocumentService, OdooEventListener],
  exports: [OdooService, OdooSyncService, OdooApiService, OdooDocumentService],
})
export class OdooModule {}
