import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class GitWebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-hub-signature-256'] as string;
    
    if (!signature) {
      throw new ForbiddenException('Missing signature');
    }

    const secret = process.env.GIT_WEBHOOK_SECRET;
    if (!secret) {
      throw new ForbiddenException('Webhook secret not configured');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from('sha256=' + hmac.update(JSON.stringify(request.body)).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');

    if (digest.length !== checksum.length || !crypto.timingSafeEqual(digest, checksum)) {
      throw new ForbiddenException('Invalid signature');
    }

    return true;
  }
}
