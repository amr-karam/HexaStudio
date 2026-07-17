import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { WebhookConfigService } from './webhook-config.service';
import type { WebhookConfig, CreateWebhookDto, UpdateWebhookDto } from '@hexastudio/types';

@Controller({ path: 'webhooks', version: VERSION_NEUTRAL })
export class WebhookConfigController {
  constructor(private readonly webhookConfigService: WebhookConfigService) {}

  @Get()
  async findAll(): Promise<WebhookConfig[]> {
    return this.webhookConfigService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WebhookConfig> {
    return this.webhookConfigService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateWebhookDto): Promise<WebhookConfig> {
    return this.webhookConfigService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ): Promise<WebhookConfig> {
    return this.webhookConfigService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.webhookConfigService.delete(id);
  }

  @Patch(':id/toggle')
  async toggleActive(@Param('id') id: string): Promise<WebhookConfig> {
    return this.webhookConfigService.toggleActive(id);
  }
}
