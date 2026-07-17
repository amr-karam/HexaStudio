process.env.JWT_SECRET ??= 'test-jwt-secret-that-is-at-least-32-chars-long-for-testing';
process.env.CMS_URL ??= 'http://test-cms:1337';
process.env.REDIS_PASSWORD ??= 'test-redis-password';
process.env.MINIO_ROOT_USER ??= 'test-minio-user';
process.env.MINIO_ROOT_PASSWORD ??= 'test-minio-password-at-least-8';
process.env.ODOO_HOST ??= 'http://odoo:8069';
process.env.ODOO_DB ??= 'test_db';
process.env.ODOO_USER ??= 'test_user';
process.env.ODOO_PASSWORD ??= 'test_password';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { OdooService } from '../odoo/odoo.service';
import { RedisService } from '../storage/redis.service';

const mockOdooService = {
  create: vi.fn(),
};

const mockRedisService = {
  lpush: vi.fn(),
};

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: OdooService, useValue: mockOdooService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should create lead in Odoo and return success', async () => {
      mockOdooService.create.mockResolvedValueOnce(42);

      const result = await service.sendMessage({
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME',
        message: 'Hello!',
      });

      expect(result.success).toBe(true);
      expect(mockOdooService.create).toHaveBeenCalledWith('crm.lead', expect.objectContaining({
        contact_name: 'John Doe',
        email_from: 'john@example.com',
        partner_name: 'ACME',
        x_hexa_source: 'website',
      }));
    });

    it('should include HEXA custom fields when service and budget provided', async () => {
      mockOdooService.create.mockResolvedValueOnce(43);

      await service.sendMessage({
        name: 'Jane',
        email: 'jane@test.com',
        message: 'Hi',
        service: 'residential',
        budget: '100k_500k',
      });

      expect(mockOdooService.create).toHaveBeenCalledWith('crm.lead', expect.objectContaining({
        x_hexa_service: 'residential',
        x_hexa_budget: '100k_500k',
      }));
    });

    it('should encode untrusted contact data before adding it to Odoo HTML', async () => {
      mockOdooService.create.mockResolvedValueOnce(44);

      await service.sendMessage({
        name: '<img>',
        email: 'test@example.com',
        message: '<script>alert(1)</script>',
      });

      expect(mockOdooService.create).toHaveBeenCalledWith('crm.lead', expect.objectContaining({
        description: expect.stringContaining('&lt;script&gt;alert(1)&lt;/script&gt;'),
      }));
    });

    it('should queue lead in Redis when Odoo is unavailable', async () => {
      mockOdooService.create.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await service.sendMessage({
        name: 'Test',
        email: 'test@test.com',
        message: 'Hello',
      });

      expect(result.success).toBe(true);
      expect(mockRedisService.lpush).toHaveBeenCalledWith(
        'odoo:pending-leads',
        expect.objectContaining({ contact_name: 'Test' }),
      );
    });

    it('should still return success even if Redis queue also fails', async () => {
      mockOdooService.create.mockRejectedValueOnce(new Error('Connection refused'));
      mockRedisService.lpush.mockRejectedValueOnce(new Error('Redis down'));

      const result = await service.sendMessage({
        name: 'Test',
        email: 'test@test.com',
        message: 'Hello',
      });

      expect(result.success).toBe(true);
    });
  });
});
