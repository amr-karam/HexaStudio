import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../src/modules/storage/redis.service';

const mockRedisInstance = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  flushall: vi.fn(),
  on: vi.fn(),
}));

vi.mock('ioredis', () => {
  function Redis(this: any) {
    Object.assign(this, mockRedisInstance);
  }
  return { default: Redis };
});

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              const config: Record<string, any> = { REDIS_HOST: 'localhost', REDIS_PORT: 6379, REDIS_PASSWORD: 'test' };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('returns null for missing key', async () => {
    mockRedisInstance.get.mockResolvedValueOnce(null);
    const result = await service.get('nonexistent');
    expect(result).toBeNull();
  });

  it('returns parsed JSON for existing key', async () => {
    mockRedisInstance.get.mockResolvedValueOnce(JSON.stringify({ foo: 'bar' }));
    const result = await service.get('test-key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('sets a value with TTL', async () => {
    mockRedisInstance.set.mockResolvedValueOnce('OK');
    await service.set('test-key', { data: 42 }, 300);
    expect(mockRedisInstance.set).toHaveBeenCalledWith('test-key', JSON.stringify({ data: 42 }), 'EX', 300);
  });

  it('deletes a key', async () => {
    mockRedisInstance.del.mockResolvedValueOnce(1);
    await service.del('test-key');
    expect(mockRedisInstance.del).toHaveBeenCalledWith('test-key');
  });

  it('flushes all keys', async () => {
    mockRedisInstance.flushall.mockResolvedValueOnce('OK');
    await service.flush();
    expect(mockRedisInstance.flushall).toHaveBeenCalled();
  });
});
