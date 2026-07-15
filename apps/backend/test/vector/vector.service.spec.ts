import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { VectorService } from '../../src/modules/vector/vector.service';
import { EmbeddingService } from '../../src/modules/ai/embedding.service';

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

  const mockEmbeddingService = {
    generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorService,
        { provide: EmbeddingService, useValue: mockEmbeddingService },
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
