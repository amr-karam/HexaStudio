import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { OdooService } from '../src/modules/odoo/odoo.service';
import { RedisService } from '../src/modules/storage/redis.service';
import { InternalServerErrorException } from '@nestjs/common';

const mockClient = { methodCall: vi.fn() };
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  flushall: vi.fn(),
  on: vi.fn(),
};

vi.mock('xmlrpc', () => ({
  createClient: vi.fn(() => mockClient),
}));

describe('OdooService', () => {
  let service: OdooService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OdooService,
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<OdooService>(OdooService);
  });

  it('getCircuitState returns CLOSED initially', () => {
    expect(service.getCircuitState()).toBe('CLOSED');
  });

  it('authenticate returns uid on success', async () => {
    mockClient.methodCall.mockImplementation((_method: string, _args: unknown[], cb: Function) => {
      cb(null, 42);
    });

    const uid = await service.authenticate();
    expect(uid).toBe(42);
  });

  it('authenticate throws when Odoo rejects', async () => {
    mockClient.methodCall.mockImplementation((_method: string, _args: unknown[], cb: Function) => {
      cb(new Error('Connection refused'), null);
    });

    await expect(service.authenticate()).rejects.toThrow(InternalServerErrorException);
  });

  it('searchRead returns cached data when available', async () => {
    const cached = [{ id: 1, name: 'Cached Project' }];
    mockRedis.get.mockResolvedValueOnce(cached);

    const result = await service.searchRead('project.project', [], ['id', 'name']);
    expect(result).toEqual(cached);
    expect(mockClient.methodCall).not.toHaveBeenCalled();
  });

  it('searchRead performs Odoo call on cache miss', async () => {
    mockRedis.get.mockResolvedValueOnce(null);
    mockClient.methodCall
      .mockImplementationOnce((_method: string, _args: unknown[], cb: Function) => {
        cb(null, 1);
      })
      .mockImplementationOnce((_method: string, _args: unknown[], cb: Function) => {
        cb(null, [1, 2]);
      })
      .mockImplementationOnce((_method: string, _args: unknown[], cb: Function) => {
        cb(null, [{ id: 1 }, { id: 2 }]);
      });

    const result = await service.searchRead('project.project', [], ['id']);
    expect(result).toHaveLength(2);
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it('create returns new record id', async () => {
    mockClient.methodCall
      .mockImplementationOnce((_method: string, _args: unknown[], cb: Function) => {
        cb(null, 1);
      })
      .mockImplementationOnce((_method: string, _args: unknown[], cb: Function) => {
        cb(null, 99);
      });

    const result = await service.create('project.project', { name: 'New Project' });
    expect(result).toBe(99);
  });

  it('write returns true on success', async () => {
    mockClient.methodCall
      .mockImplementationOnce((_method: string, _args: unknown[], cb: Function) => {
        cb(null, 1);
      })
      .mockImplementationOnce((_method: string, _args: unknown[], cb: Function) => {
        cb(null, true);
      });

    const result = await service.write('project.project', [1], { name: 'Updated' });
    expect(result).toBe(true);
  });
});
