import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBus } from '../realtime/event-bus.service';
import { AgentsService } from './agents.service';
import { SlackService } from '../webhooks/slack.service';

interface ApprovalPayload {
  projectId: string;
  action: string;
  userId: string;
}

@Injectable()
export class SwarmOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(SwarmOrchestratorService.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly agentsService: AgentsService,
    private readonly slackService: SlackService,
  ) {}

  onModuleInit() {
    this.logger.log('🤖 HEXA Autonomous Multi-Agent Swarm Initialized');

    this.eventBus.on('approval:action', async (rawPayload: unknown) => {
      const payload = rawPayload as ApprovalPayload;
      if (!payload || !payload.projectId) return;

      this.logger.log(`Swarm triggered by approval action: ${payload.action} on project ${payload.projectId}`);
      try {
        const pmResult = await this.agentsService.chat(
          `Project ${payload.projectId} had an approval action '${payload.action}'. Analyze timeline velocity impact.`,
          'pm'
        );

        const ceoResult = await this.agentsService.chat(
          `Project ${payload.projectId} milestone updated. Provide a 1-sentence executive summary for leadership.`,
          'ceo'
        );

        await this.slackService.sendMessage({
          text: `🤖 *HEXA Swarm Intelligence Brief*\n*Project:* ${payload.projectId}\n*PM Analysis:* ${pmResult.response}\n*CEO Digest:* ${ceoResult.response}`,
        });
      } catch (err) {
        this.logger.error(`Swarm orchestration failed: ${err}`);
      }
    });
  }
}
