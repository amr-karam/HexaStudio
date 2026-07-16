import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WebhookConfigService } from './webhook-config.service';
import type { WebhookEvent } from '@hexastudio/types';

@Injectable()
export class WebhookDispatcher {
  private readonly logger = new Logger(WebhookDispatcher.name);

  constructor(
    private readonly http: HttpService,
    private readonly configService: WebhookConfigService,
  ) {}

  async dispatch(event: WebhookEvent, payload: unknown): Promise<void> {
    const configs = await this.configService.findByEvent(event);
    if (configs.length === 0) return;

    const body = { event, payload, timestamp: new Date().toISOString() };

    const results = await Promise.allSettled(
      configs.map((cfg) =>
        firstValueFrom(
          this.http.post(cfg.url, body, {
            headers: {
              'Content-Type': 'application/json',
              ...cfg.headers,
            },
            timeout: 10_000,
          }),
        ).catch((err) => {
          this.logger.error(`Webhook ${cfg.name} (${cfg.id}) failed: ${err}`);
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    if (succeeded > 0) {
      this.logger.log(`Dispatched ${event} to ${succeeded}/${configs.length} webhooks`);
    }
  }
}
