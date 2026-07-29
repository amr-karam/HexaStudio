import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, FindOptionsWhere } from 'typeorm';
import { WebhookLog, WebhookStatus } from './entities/webhook-log.entity';
import { OdooWebhookService } from './odoo-webhook.service';

export interface WebhookLogFilters {
  model?: string;
  status?: WebhookStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WebhookStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  byModel: Array<{ model: string; count: number }>;
}

@Injectable()
export class WebhookAdminService {
  private readonly logger = new Logger(WebhookAdminService.name);

  constructor(
    @InjectRepository(WebhookLog)
    private readonly webhookLogRepository: Repository<WebhookLog>,
    private readonly odooWebhookService: OdooWebhookService,
  ) {}

  async getLogs(filters: WebhookLogFilters): Promise<PaginatedResponse<WebhookLog>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const where: FindOptionsWhere<WebhookLog> = {};

    if (filters.model) {
      where.model = filters.model;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom && filters.dateTo) {
      where.receivedAt = Between(new Date(filters.dateFrom), new Date(filters.dateTo));
    } else if (filters.dateFrom) {
      where.receivedAt = Between(new Date(filters.dateFrom), new Date());
    } else if (filters.dateTo) {
      where.receivedAt = Between(new Date('2000-01-01'), new Date(filters.dateTo));
    }

    const [data, total] = await this.webhookLogRepository.findAndCount({
      where,
      order: { receivedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLogById(id: string): Promise<WebhookLog> {
    const log = await this.webhookLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Webhook log with ID "${id}" not found`);
    }
    return log;
  }

  async retryWebhook(id: string): Promise<WebhookLog> {
    const log = await this.getLogById(id);

    if (log.status === 'success') {
      throw new Error('Cannot retry a webhook that already succeeded');
    }

    try {
      // Re-process the webhook
      await this.odooWebhookService.processWebhook({
        model: log.model,
        id: log.recordId,
        action: log.action,
        data: log.payload as Record<string, unknown>,
        timestamp: log.receivedAt.toISOString(),
      });

      log.status = 'success';
      log.processedAt = new Date();
      log.error = null;
      log.retryCount += 1;
    } catch (error) {
      log.status = 'failed';
      log.error = error instanceof Error ? error.message : String(error);
      log.retryCount += 1;
      log.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000); // retry in 5 min
      this.logger.error(`Retry failed for webhook log ${id}: ${log.error}`);
    }

    return this.webhookLogRepository.save(log);
  }

  async clearOldLogs(days: number): Promise<{ deleted: number }> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await this.webhookLogRepository.delete({
      receivedAt: LessThan(cutoff),
    });
    return { deleted: result.affected || 0 };
  }

  async getStats(): Promise<WebhookStats> {
    const [total, success, failed, pending, byModelRaw] = await Promise.all([
      this.webhookLogRepository.count(),
      this.webhookLogRepository.count({ where: { status: 'success' } }),
      this.webhookLogRepository.count({ where: { status: 'failed' } }),
      this.webhookLogRepository.count({ where: { status: 'pending' } }),
      this.webhookLogRepository
        .createQueryBuilder('log')
        .select('log.model', 'model')
        .addSelect('COUNT(*)', 'count')
        .groupBy('log.model')
        .orderBy('count', 'DESC')
        .getRawMany<{ model: string; count: string }>(),
    ]);

    const byModel = byModelRaw.map((row) => ({
      model: row.model,
      count: parseInt(row.count, 10),
    }));

    return { total, success, failed, pending, byModel };
  }

  getSyncState(): Array<{ model: string; status: string; lastSync: string }> {
    return this.odooWebhookService.getSyncState();
  }
}
