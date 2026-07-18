import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { WebhookConfigService } from './webhook-config.service';
import type { WebhookConfig, CreateWebhookDto, UpdateWebhookDto } from '@hexastudio/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller({ path: 'webhooks', version: '1' })
export class WebhookConfigController {
  constructor(private readonly webhookConfigService: WebhookConfigService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const { data, total } = await this.webhookConfigService.findAll(page, limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
