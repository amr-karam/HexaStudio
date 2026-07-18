import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { WebhookConfig, CreateWebhookDto, UpdateWebhookDto, WebhookEvent } from '@hexastudio/types';

@Injectable()
export class WebhookConfigService {
  private readonly logger = new Logger(WebhookConfigService.name);
  private webhooks: Map<string, WebhookConfig> = new Map();

  constructor() {
    this.loadDefaults();
  }

  private loadDefaults() {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      const defaultWebhook: WebhookConfig = {
        id: randomUUID(),
        name: 'Slack Notifications',
        url: slackUrl,
        events: ['approval:action', 'annotation:add', 'project:update'],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.webhooks.set(defaultWebhook.id, defaultWebhook);
      this.logger.log(`Loaded default Slack webhook: ${defaultWebhook.id}`);
    }
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ data: WebhookConfig[]; total: number; page: number; limit: number }> {
    const all = Array.from(this.webhooks.values());
    const skip = (page - 1) * limit;
    const data = all.slice(skip, skip + limit);
    return { data, total: all.length, page, limit };
  }

  async findById(id: string): Promise<WebhookConfig> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new NotFoundException(`Webhook "${id}" not found`);
    }
    return webhook;
  }

  async findByEvent(event: WebhookEvent): Promise<WebhookConfig[]> {
    return Array.from(this.webhooks.values()).filter(
      (w) => w.active && w.events.includes(event),
    );
  }

  async create(dto: CreateWebhookDto): Promise<WebhookConfig> {
    const webhook: WebhookConfig = {
      id: randomUUID(),
      name: dto.name,
      url: dto.url,
      events: dto.events,
      secret: dto.secret,
      active: true,
      headers: dto.headers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.webhooks.set(webhook.id, webhook);
    this.logger.log(`Created webhook: ${webhook.name} (${webhook.id})`);
    return webhook;
  }

  async update(id: string, dto: UpdateWebhookDto): Promise<WebhookConfig> {
    const existing = this.webhooks.get(id);
    if (!existing) {
      throw new NotFoundException(`Webhook "${id}" not found`);
    }

    const updated: WebhookConfig = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    this.webhooks.set(id, updated);
    this.logger.log(`Updated webhook: ${updated.name} (${id})`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new NotFoundException(`Webhook "${id}" not found`);
    }
    this.webhooks.delete(id);
    this.logger.log(`Deleted webhook: ${webhook.name} (${id})`);
  }

  async toggleActive(id: string): Promise<WebhookConfig> {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new NotFoundException(`Webhook "${id}" not found`);
    }
    webhook.active = !webhook.active;
    webhook.updatedAt = new Date().toISOString();
    this.logger.log(`Toggled webhook ${webhook.name}: active=${webhook.active}`);
    return webhook;
  }
}
