import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { User } from '@hexastudio/types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SecurityAuditService } from '../../security/security-audit.service';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<User['role'][]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: User }>();
    const user = request.user;
    
    if (user === undefined || !requiredRoles.includes(user.role)) {
      const securityAuditService = context.switchToHttp().getRequest().res?.req.app.get(SecurityAuditService);
      securityAuditService?.logEvent({
        type: 'RBAC_FAILURE',
        userId: user?.id,
        details: {
          requiredRoles,
          userRole: user?.role,
          url: request.url,
          method: request.method,
        },
      });
      return false;
    }
    return true;
  }
}
