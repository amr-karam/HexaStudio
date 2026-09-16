import { Module, Global, forwardRef } from '@nestjs/common';
import { AgentsModule } from '../modules/agents/agents.module';
import { RealtimeModule } from '../modules/realtime/realtime.module';
import { WebhooksModule } from '../modules/webhooks/webhooks.module';
import { AgentsService } from '../modules/agents/agents.service';
import { RealtimeGateway } from '../modules/realtime/realtime.gateway';
import { GitWebhookService } from '../modules/webhooks/git-webhook.service';
import { AGENTS_PORT } from './agents.port';
import { REALTIME_PORT } from './realtime.port';
import { WEBHOOKS_PORT } from './webhooks.port';

@Global()
@Module({
  imports: [
    forwardRef(() => AgentsModule),
    forwardRef(() => RealtimeModule),
    forwardRef(() => WebhooksModule),
  ],
  providers: [
    { provide: AGENTS_PORT, useExisting: AgentsService },
    { provide: REALTIME_PORT, useExisting: RealtimeGateway },
    { provide: WEBHOOKS_PORT, useExisting: GitWebhookService },
  ],
  exports: [AGENTS_PORT, REALTIME_PORT, WEBHOOKS_PORT],
})
export class PortsModule {}
