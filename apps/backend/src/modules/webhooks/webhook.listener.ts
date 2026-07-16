import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SlackService } from './slack.service';
import { WebhookDispatcher } from './webhook-dispatcher.service';
import { EventBus } from '../realtime/event-bus.service';

@Injectable()
export class WebhookListener implements OnModuleInit {
  private readonly logger = new Logger(WebhookListener.name);
  private slackEnabled = false;

  constructor(
    private readonly slackService: SlackService,
    private readonly dispatcher: WebhookDispatcher,
    private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    const env = process.env.SLACK_WEBHOOK_URL;
    if (env) {
      this.slackEnabled = true;
      this.logger.log('Slack webhook URL configured');
    }

    this.eventBus.on('approval:action', async (payload: unknown) => {
      const approval = payload as { projectId: string; phaseId: string; action: string; comment?: string; userId: string };
      if (this.slackEnabled) {
        const message = this.slackService.formatApprovalMessage(approval);
        const sent = await this.slackService.sendMessage(message);
        if (sent) this.logger.log(`Slack sent for approval ${approval.action} on ${approval.projectId}`);
      }
      await this.dispatcher.dispatch('approval:action', payload);
    });

    this.eventBus.on('annotation:add', async (payload: unknown) => {
      const evt = payload as { projectId: string; annotation: { id: string; type: string; content: string; author: string } };
      if (evt.annotation.type === 'pin') return;
      if (this.slackEnabled) {
        const message = this.slackService.formatAnnotationMessage(evt);
        const sent = await this.slackService.sendMessage(message);
        if (sent) this.logger.log(`Slack sent for annotation on ${evt.projectId}`);
      }
      await this.dispatcher.dispatch('annotation:add', payload);
    });

    this.eventBus.on('project:update', async (payload: unknown) => {
      if (this.slackEnabled) {
        const message = this.slackService.formatProjectUpdateMessage(
          (payload as { projectId: string }).projectId,
          payload,
        );
        await this.slackService.sendMessage(message);
      }
      await this.dispatcher.dispatch('project:update', payload);
    });

    this.logger.log('Webhook listeners registered with EventBus');
  }
}
