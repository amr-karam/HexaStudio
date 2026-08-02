import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AgentMemoryService } from './agent-memory.service';
import { RedisService } from '../storage/redis.service';

const mockRedis = {
  lpush: vi.fn(),
  lrange: vi.fn(),
  expire: vi.fn(),
  del: vi.fn(),
  hset: vi.fn(),
  hget: vi.fn(),
  hdel: vi.fn(),
};

describe('AgentMemoryService', () => {
  let service: AgentMemoryService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentMemoryService,
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AgentMemoryService>(AgentMemoryService);
  });

  describe('append', () => {
    it('stores the message via lpush and refreshes TTL', async () => {
      mockRedis.lpush.mockResolvedValue(undefined);
      mockRedis.expire.mockResolvedValue(undefined);

      await service.append('ceo', 'session-1', { role: 'user', content: 'hello' });

      expect(mockRedis.lpush).toHaveBeenCalledWith('agent:memory:ceo:session-1', {
        role: 'user',
        content: 'hello',
      });
      expect(mockRedis.expire).toHaveBeenCalledWith('agent:memory:ceo:session-1', 86400);
    });
  });

  describe('getHistory', () => {
    it('returns messages in chronological order (reversing lpush order)', async () => {
      mockRedis.lrange.mockResolvedValue([
        { role: 'assistant', content: 'second' },
        { role: 'user', content: 'first' },
      ]);

      const history = await service.getHistory('pm', 'session-2', 10);

      expect(history).toEqual([
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'second' },
      ]);
    });

    it('returns an empty array when redis fails', async () => {
      mockRedis.lrange.mockRejectedValue(new Error('redis down'));

      const history = await service.getHistory('sales', 'session-3', 10);

      expect(history).toEqual([]);
    });
  });

  describe('clear', () => {
    it('deletes both the transcript and facts keys', async () => {
      await service.clear('general', 'session-4');

      expect(mockRedis.del).toHaveBeenCalledWith('agent:memory:general:session-4');
      expect(mockRedis.del).toHaveBeenCalledWith('agent:facts:general:session-4');
    });
  });

  describe('remember / recall / forget', () => {
    it('stores a fact via hset and expires the facts hash', async () => {
      await service.remember('ceo', 'session-5', 'projectId', 'p-123');

      expect(mockRedis.hset).toHaveBeenCalledWith(
        'agent:facts:ceo:session-5',
        'projectId',
        'p-123',
      );
      expect(mockRedis.expire).toHaveBeenCalledWith('agent:facts:ceo:session-5', 604800);
    });

    it('recalls a stored fact via hget', async () => {
      mockRedis.hget.mockResolvedValue('p-123');

      const value = await service.recall('ceo', 'session-5', 'projectId');

      expect(mockRedis.hget).toHaveBeenCalledWith(
        'agent:facts:ceo:session-5',
        'projectId',
      );
      expect(value).toBe('p-123');
    });

    it('forgets a fact via hdel', async () => {
      await service.forget('ceo', 'session-5', 'projectId');

      expect(mockRedis.hdel).toHaveBeenCalledWith(
        'agent:facts:ceo:session-5',
        'projectId',
      );
    });
  });
});
