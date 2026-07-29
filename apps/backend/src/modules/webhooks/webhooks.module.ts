import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SlackService } from './slack.service';
import { WebhookListener } from './webhook.listener';
import { WebhookDispatcher } from './webhook-dispatcher.service';
import { WebhookConfigService } from './webhook-config.service';
import { WebhookConfigController } from './webhook-config.controller';
import { GitWebhookController } from './git-webhook.controller';
import { GitWebhookService } from './git-webhook.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [HttpModule, RealtimeModule, forwardRef(() => AgentsModule)],
  controllers: [WebhookConfigController, GitWebhookController],
  providers: [SlackService, WebhookListener, WebhookDispatcher, WebhookConfigService, GitWebhookService],
  exports: [SlackService, WebhookConfigService, GitWebhookService],
})
export class WebhooksModule {}
