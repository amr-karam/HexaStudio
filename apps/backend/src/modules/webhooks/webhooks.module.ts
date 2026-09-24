import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SlackService } from './slack.service';
import { WebhookListener } from './webhook.listener';
import { WebhookDispatcher } from './webhook-dispatcher.service';
import { WebhookConfigService } from './webhook-config.service';
import { WebhookConfigController } from './webhook-config.controller';
import { GitWebhookController } from './git-webhook.controller';
import { GitWebhookService } from './git-webhook.service';
import { GitLabOdooCoordinatorService } from './git-odoo-coordinator.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { AgentsModule } from '../agents/agents.module';
import { OdooModule } from '../odoo/odoo.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { WEBHOOKS_PORT } from '../../ports/webhooks.port';

@Module({
  // ADR-017: RealtimeModule is circular (via AgentsModule) — a direct import
  // evaluates to `undefined` depending on load order and breaks app boot.
  imports: [HttpModule, forwardRef(() => RealtimeModule), forwardRef(() => AgentsModule), forwardRef(() => OdooModule), forwardRef(() => WorkflowModule)],
  controllers: [WebhookConfigController, GitWebhookController],
  providers: [
    SlackService,
    WebhookListener,
    WebhookDispatcher,
    WebhookConfigService,
    GitWebhookService,
    GitLabOdooCoordinatorService,
    { provide: WEBHOOKS_PORT, useExisting: SlackService },
  ],
  exports: [SlackService, WebhookConfigService, GitWebhookService, GitLabOdooCoordinatorService, WEBHOOKS_PORT],
})
export class WebhooksModule {}