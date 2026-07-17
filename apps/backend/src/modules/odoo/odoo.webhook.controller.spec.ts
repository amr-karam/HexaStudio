process.env.JWT_SECRET ??= 'test-jwt-secret-that-is-at-least-32-chars-long-for-testing';
process.env.CMS_URL ??= 'http://test-cms:1337';
process.env.REDIS_PASSWORD ??= 'test-redis-password';
process.env.MINIO_ROOT_USER ??= 'test-minio-user';
process.env.MINIO_ROOT_PASSWORD ??= 'test-minio-password-at-least-8';
process.env.ODOO_HOST ??= 'http://odoo:8069';
process.env.ODOO_DB ??= 'test_db';
process.env.ODOO_USER ??= 'test_user';
process.env.ODOO_PASSWORD ??= 'test_password';
process.env.ODOO_WEBHOOK_SECRET ??= 'test-webhook-secret-at-least-32-chars-long';

import { createHmac } from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { OdooWebhookController } from './odoo.webhook.controller';
import { OdooSyncService } from './odoo-sync.service';

const WEBHOOK_SECRET = 'test-webhook-secret-at-least-32-chars-long';

describe('OdooWebhookController', () => {
  it('verifies the HMAC against the original request bytes', async () => {
    const syncService = { handleWebhook: vi.fn() } as unknown as OdooSyncService;
    const controller = new OdooWebhookController(syncService);
    const rawBody = Buffer.from('{"model":"project.project","id":1,"action":"update","data":{"name":"Caf\u00e9"}}');
    const signature = createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');

    await controller.handleWebhook(
      signature,
      JSON.parse(rawBody.toString()) as { model: string; id: number; action: 'update'; data: Record<string, unknown> },
      { rawBody } as never,
    );

    expect(syncService.handleWebhook).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('rejects a webhook with an invalid signature', async () => {
    const syncService = { handleWebhook: vi.fn() } as unknown as OdooSyncService;
    const controller = new OdooWebhookController(syncService);

    await expect(controller.handleWebhook(
      'invalid',
      { model: 'project.project', id: 1, action: 'update' },
      { rawBody: Buffer.from('{}') } as never,
    )).rejects.toThrow('Invalid webhook signature');
  });
});
