import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { OdooService } from './odoo.service';
import { OdooWebhookController } from './odoo.webhook.controller';
import { OdooSyncService } from './odoo-sync.service';
import { OdooApiService } from './odoo-api.service';
import { OdooApiController } from './odoo-api.controller';
import { OdooDocumentService } from './odoo-document.service';
import { OdooEventListener } from './odoo-event.listener';
import { WebhookRetryService } from './webhook-retry.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { StorageModule } from '../storage/storage.module';

import { StrapiProjectSyncService } from './strapi-project-sync.service';
import { StrapiWebhookController } from './strapi-webhook.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot(), RealtimeModule, StorageModule, HttpModule],
  controllers: [OdooWebhookController, OdooApiController, StrapiWebhookController],
  providers: [
    OdooService,
    OdooSyncService,
    OdooApiService,
    OdooDocumentService,
    OdooEventListener,
    WebhookRetryService,
    StrapiProjectSyncService,
  ],
  exports: [OdooService, OdooSyncService, OdooApiService, OdooDocumentService, WebhookRetryService, StrapiProjectSyncService],
})
export class OdooModule {}
