import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { WebhookAdminService } from './webhook-admin.service';
import { WebhookStatus } from './entities/webhook-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user-role.enum';

@Controller('odoo/webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebhookAdminController {
  constructor(private readonly webhookAdminService: WebhookAdminService) {}

  @Get('logs')
  async getLogs(
    @Query('model') model?: string,
    @Query('status') status?: WebhookStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.webhookAdminService.getLogs({
      model,
      status,
      dateFrom,
      dateTo,
      page: page || 1,
      limit: limit || 20,
    });
  }

  @Get('logs/:id')
  async getLogById(@Param('id') id: string) {
    return this.webhookAdminService.getLogById(id);
  }

  @Post('logs/:id/retry')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async retryWebhook(@Param('id') id: string) {
    return this.webhookAdminService.retryWebhook(id);
  }

  @Delete('logs')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async clearOldLogs(@Query('olderThanDays', ParseIntPipe) olderThanDays: number) {
    return this.webhookAdminService.clearOldLogs(olderThanDays);
  }

  @Get('stats')
  async getStats() {
    return this.webhookAdminService.getStats();
  }
}
