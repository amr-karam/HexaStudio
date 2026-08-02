import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import type { User } from '@hexastudio/types';
import { ToolAuthorizationOptions } from './decorators/tool-authorization.decorator';

@Injectable()
export class GatekeeperService {
  async authorize(
    user: User | undefined,
    toolName: string,
    toolAuth: ToolAuthorizationOptions,
  ): Promise<boolean> {
    if (toolAuth.requiresAuth && !user) {
      throw new UnauthorizedException('Authentication required for this tool');
    }

    if (toolAuth.roles && toolAuth.roles.length > 0) {
      if (!user || !user.role || !toolAuth.roles.includes(user.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    if (toolAuth.requiresHitl) {
      // Logic for HITL check
      // For now, assume if HITL is required, it must be explicitly approved in the request context
      // This is a placeholder for actual approval logic
      throw new ForbiddenException('Human-in-the-loop approval required');
    }

    return true;
  }
}
