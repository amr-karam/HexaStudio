import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { OdooService } from './odoo.service';
import { OdooWebhookController } from './odoo.webhook.controller';
import { OdooSyncService } from './odoo-sync.service';
import { OdooSyncController } from './odoo-sync.controller';
import { OdooApiService } from './odoo-api.service';
import { OdooApiController } from './odoo-api.controller';
import { OdooDocumentService } from './odoo-document.service';
import { OdooEventListener } from './odoo-event.listener';
import { WebhookRetryService } from './webhook-retry.service';
import { ConflictResolutionService } from './conflict-resolution.service';
import { DeltaSyncService } from './delta-sync.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { StorageModule } from '../storage/storage.module';

import { StrapiProjectSyncService } from './strapi-project-sync.service';
import { StrapiWebhookController } from './strapi-webhook.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot(), RealtimeModule, StorageModule, HttpModule],
  controllers: [
    OdooWebhookController,
    OdooApiController,
    OdooSyncController,
    StrapiWebhookController,
  ],
  providers: [
    OdooService,
    OdooSyncService,
    OdooApiService,
    OdooDocumentService,
    OdooEventListener,
    WebhookRetryService,
    ConflictResolutionService,
    DeltaSyncService,
    StrapiProjectSyncService,
  ],
  exports: [
    OdooService,
    OdooSyncService,
    OdooApiService,
    OdooDocumentService,
    WebhookRetryService,
    ConflictResolutionService,
    DeltaSyncService,
    StrapiProjectSyncService,
  ],
})
export class OdooModule {}
