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
  VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WebhookConfigService } from './webhook-config.service';
import type { WebhookConfig, CreateWebhookDto, UpdateWebhookDto } from '@hexastudio/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller({ path: 'webhooks', version: ['1', VERSION_NEUTRAL] })
export class WebhookConfigController {
  constructor(private readonly webhookConfigService: WebhookConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all webhook configurations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
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
  @ApiOperation({ summary: 'Get webhook configuration by ID' })
  async findOne(@Param('id') id: string): Promise<WebhookConfig> {
    return this.webhookConfigService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new webhook configuration' })
  async create(@Body() dto: CreateWebhookDto): Promise<WebhookConfig> {
    return this.webhookConfigService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webhook configuration' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ): Promise<WebhookConfig> {
    return this.webhookConfigService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook configuration' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.webhookConfigService.delete(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle webhook active status' })
  async toggleActive(@Param('id') id: string): Promise<WebhookConfig> {
    return this.webhookConfigService.toggleActive(id);
  }
}
