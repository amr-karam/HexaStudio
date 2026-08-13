import { Injectable, Logger } from '@nestjs/common';

export interface SecurityEvent {
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'RBAC_FAILURE' | 'ADMIN_ACTION';
  userId?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger('SecurityAudit');

  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    this.logger.log(JSON.stringify(fullEvent));
  }
}
