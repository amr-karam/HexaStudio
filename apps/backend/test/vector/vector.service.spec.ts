import '../setup';
import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { VectorService } from '../../src/modules/vector/vector.service';
import { VectorSyncService } from '../../src/modules/vector/vector-sync.service';
import { EmbeddingService } from '../../src/modules/ai/embedding.service';
import { ProjectsService } from '../../src/modules/projects/projects.service';
import { HttpService } from '@nestjs/axios';
import { OdooService } from '../../src/modules/odoo/odoo.service';
import { RedisService } from '../../src/modules/storage/redis.service';
import { ConfigService } from '@nestjs/config';

vi.mock('@qdrant/js-client-rest', () => {
  return {
    QdrantClient: class {
      getCollections = vi.fn().mockResolvedValue([]);
      upsert = vi.fn().mockResolvedValue(undefined);
      search = vi.fn().mockResolvedValue([]);
      delete = vi.fn().mockResolvedValue(undefined);
    },
  };
});

describe('VectorService', () => {
  let service: VectorService;
  let mockHttpService: any;
  let mockOdooService: any;
  let mockRedisService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockHttpService = {
      get: vi.fn(),
    };
    mockOdooService = {
      searchRead: vi.fn(),
    };
    mockRedisService = {
      get: vi.fn(),
      set: vi.fn(),
    };
    mockConfigService = {
      get: vi.fn().mockReturnValue({
        CMS_URL: 'http://cms:1337',
        VECTOR_HOST: 'localhost',
        VECTOR_PORT: 6333,
        VECTOR_API_KEY: '',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: OdooService, useValue: mockOdooService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VectorService>(VectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsert', () => {
    it('should call client.upsert', async () => {
      const upsertSpy = vi.spyOn((service as any).client, 'upsert').mockResolvedValue(undefined);
      const points = [{ id: '1', vector: [0.1, 0.2], payload: { name: 'test' } }];
      await service.upsert('test_collection', points);
      expect(upsertSpy).toHaveBeenCalledWith('test_collection', expect.objectContaining({
        points: expect.any(Array),
      }));
    });
  });

  describe('delete', () => {
    it('should call client.delete', async () => {
      const deleteSpy = vi.spyOn((service as any).client, 'delete').mockResolvedValue(undefined);
      await service.delete('test_collection', '1');
      expect(deleteSpy).toHaveBeenCalledWith('test_collection', { points: ['1'] });
    });
  });
});
