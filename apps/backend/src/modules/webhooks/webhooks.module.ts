import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SlackService } from './slack.service';
import { WebhookListener } from './webhook.listener';
import { WebhookDispatcher } from './webhook-dispatcher.service';
import { WebhookConfigService } from './webhook-config.service';
import { WebhookConfigController } from './webhook-config.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [HttpModule, RealtimeModule],
  controllers: [WebhookConfigController],
  providers: [SlackService, WebhookListener, WebhookDispatcher, WebhookConfigService],
  exports: [SlackService, WebhookConfigService],
})
export class WebhooksModule {}
