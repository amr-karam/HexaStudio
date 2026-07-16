import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(err: Error | null, user: TUser, info: unknown, context: ExecutionContext): TUser {
    const request = context.switchToHttp().getRequest();
    const token =
      request?.cookies?.auth_token ??
      (request?.headers?.authorization as string | undefined)?.replace('Bearer ', '');
    if (token) {
      request.accessToken = token;
    }
    return super.handleRequest(err, user, info, context);
  }
}
