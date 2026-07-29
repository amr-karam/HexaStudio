import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './audit.entity';

export interface AuditEntry {
  userId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  method: string;
  endpoint: string;
  statusCode: number | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Persist an audit log entry. Silently catches errors to avoid
   * breaking the main request flow if the audit table is unavailable.
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      const auditLog = this.auditRepo.create({
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        oldValues: entry.oldValues ?? null,
        newValues: entry.newValues ?? null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        method: entry.method,
        endpoint: entry.endpoint,
        statusCode: entry.statusCode,
      });

      await this.auditRepo.save(auditLog);
    } catch (error) {
      this.logger.error(
        `Failed to write audit log: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
