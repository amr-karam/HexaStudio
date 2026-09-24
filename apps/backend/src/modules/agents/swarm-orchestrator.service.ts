import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { ModelFusionService } from '../ai/model-fusion.service';
import { REALTIME_PORT } from '../../ports/realtime.port';
import { WEBHOOKS_PORT } from '../../ports/webhooks.port';
import type { RealtimePort } from '../../ports/realtime.port';
import type { WebhooksPort } from '../../ports/webhooks.port';

interface ApprovalPayload {
  projectId: string;
  action: string;
  userId: string;
}

@Injectable()
export class SwarmOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(SwarmOrchestratorService.name);

  constructor(
    @Inject(REALTIME_PORT)
    private readonly eventBus: RealtimePort,
    private readonly agentsService: AgentsService,
    @Inject(WEBHOOKS_PORT)
    private readonly slackService: WebhooksPort,
    private readonly modelFusion: ModelFusionService,
  ) {}

  onModuleInit() {
    this.logger.log('🤖 HEXA Autonomous Multi-Agent Swarm Initialized');
    this.eventBus.on('approval:action', async (rawPayload: unknown) => {
      const payload = rawPayload as ApprovalPayload;
      if (!payload || !payload.projectId) return;

      this.logger.log(`Swarm triggered by approval action: ${payload.action} on project ${payload.projectId}`);
      try {
        const pmPrompt = `Project ${payload.projectId} had an approval action '${payload.action}'. Analyze timeline velocity impact.`;
        const ceoPrompt = `Project ${payload.projectId} milestone updated. Provide a 1-sentence executive summary for leadership.`;

        const fusion = await this.modelFusion.fuse({
          messages: [
            { role: 'system', content: 'You are a HEXA STUDIO project intelligence agent.' },
            { role: 'user', content: `${pmPrompt}\n\n${ceoPrompt}` },
          ],
          mode: 'merge',
          maxTokens: 1200,
        });

        await this.slackService.sendMessage({
          text: `🤖 *HEXA Swarm Intelligence Brief*\n*Project:* ${payload.projectId}\n*Action:* ${payload.action}\n*Fusion Output:*\n${fusion.fused.content}`,
        });
      } catch (err) {
        this.logger.error(`Swarm orchestration failed: ${err}`);
      }
    });
  }
}
