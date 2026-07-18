import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OdooEventListener } from '../src/modules/odoo/odoo-event.listener';
import { EventBus } from '../src/modules/realtime/event-bus.service';
import { RedisService } from '../src/modules/storage/redis.service';
import type { OdooWebhookPayload } from '@hexastudio/types';

const mockEventBus = {
  on: vi.fn().mockReturnValue(vi.fn()),
};

const mockRedisService = {
  del: vi.fn(),
};

describe('OdooEventListener', () => {
  let listener: OdooEventListener;
  let eventBus: EventBus;
  let redisService: RedisService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooEventListener,
        { provide: EventBus, useValue: mockEventBus },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    listener = module.get<OdooEventListener>(OdooEventListener);
    eventBus = module.get<EventBus>(EventBus);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('onModuleInit', () => {
    it('subscribes to the "odoo:project" event on EventBus', () => {
      listener.onModuleInit();

      expect(mockEventBus.on).toHaveBeenCalledTimes(1);
      expect(mockEventBus.on).toHaveBeenCalledWith(
        'odoo:project',
        expect.any(Function),
      );
    });

    it('returns the unsubscribe callback from EventBus.on', () => {
      const unsubscribe = vi.fn();
      mockEventBus.on.mockReturnValueOnce(unsubscribe);

      listener.onModuleInit();

      const result = mockEventBus.on.mock.results[0]?.value;
      expect(result).toBe(unsubscribe);
    });
  });

  describe('when an "odoo:project" event fires', () => {
    let handler: (payload: unknown) => Promise<void>;

    beforeEach(() => {
      listener.onModuleInit();
      handler = mockEventBus.on.mock.calls[0][1];
    });

    it('invalidates the Redis cache key for the given project id', async () => {
      const payload: OdooWebhookPayload = {
        model: 'project.project',
        id: 42,
        action: 'update',
        data: { name: 'Updated Project' },
      };

      await handler(payload);

      expect(mockRedisService.del).toHaveBeenCalledTimes(1);
      expect(mockRedisService.del).toHaveBeenCalledWith('odoo:project:42');
    });

    it('logs a success message when cache invalidation succeeds', async () => {
      const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
      const payload: OdooWebhookPayload = {
        model: 'project.project',
        id: 7,
        action: 'delete',
      };

      await handler(payload);

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith('Invalidated Odoo project cache for #7');
      logSpy.mockRestore();
    });

    it('catches a Redis error and logs a warning without crashing', async () => {
      const testError = new Error('Redis connection timeout');
      mockRedisService.del.mockRejectedValueOnce(testError);

      const warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
      const payload: OdooWebhookPayload = {
        model: 'project.project',
        id: 99,
        action: 'create',
      };

      // Must not throw — the handler catches internally
      await expect(handler(payload)).resolves.toBeUndefined();

      expect(mockRedisService.del).toHaveBeenCalledWith('odoo:project:99');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to invalidate Odoo project cache'),
      );
      warnSpy.mockRestore();
    });

    it('processes a payload with a different project id each time', async () => {
      const payload1: OdooWebhookPayload = {
        model: 'project.project',
        id: 1,
        action: 'update',
      };
      const payload2: OdooWebhookPayload = {
        model: 'project.project',
        id: 2,
        action: 'update',
      };

      await handler(payload1);
      await handler(payload2);

      expect(mockRedisService.del).toHaveBeenCalledTimes(2);
      expect(mockRedisService.del).toHaveBeenNthCalledWith(1, 'odoo:project:1');
      expect(mockRedisService.del).toHaveBeenNthCalledWith(2, 'odoo:project:2');
    });
  });

  describe('error resilience', () => {
    it('handles Redis.del rejecting with a non-Error type', async () => {
      const nonError = 'string error message';
      mockRedisService.del.mockRejectedValueOnce(nonError);

      const warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

      listener.onModuleInit();
      const handler = mockEventBus.on.mock.calls[0][1];

      await expect(
        handler({ model: 'project.project', id: 1, action: 'update' }),
      ).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to invalidate Odoo project cache'),
      );
      warnSpy.mockRestore();
    });
  });
});
