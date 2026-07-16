import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from '../../src/modules/ai/embedding.service';
import { VectorService } from '../../src/modules/vector/vector.service';

vi.mock('openai', () => {
  return {
    default: class {
      embeddings = {
        create: vi.fn().mockResolvedValue({
          data: [{ embedding: new Array(1536).fill(0.05) }],
        }),
      };
      chat = {
        completions: {
          create: vi.fn(),
        },
      };
    },
  };
});

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  const mockVectorService = {
    upsert: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingService,
        { provide: VectorService, useValue: mockVectorService },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              const config: Record<string, any> = {
                OPENAI_API_KEY: 'sk-test',
                OPENAI_MODEL: 'gpt-4o-mini',
                OPENAI_EMBEDDING_MODEL: 'text-embedding-3-small',
                VECTOR_HOST: 'localhost',
                VECTOR_PORT: 6333,
                VECTOR_API_KEY: undefined,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmbedding', () => {
    it('should return a vector of correct dimensions', async () => {
      const vector = await service.generateEmbedding('test text');
      expect(vector).toHaveLength(1536);
    });

    it('should return different vectors for different inputs', async () => {
      const v1 = await service.generateEmbedding('hello world');
      const v2 = await service.generateEmbedding('completely different text that is longer');
      // With placeholder fallback, vectors should differ
      expect(v1).not.toEqual(v2);
    });
  });

  describe('embedProject', () => {
    it('should call vectorService.upsert with project data', async () => {
      const project = {
        id: '1',
        slug: 'test-project',
        title: 'Test Project',
        description: 'A test project description',
        services: ['architecture', 'design'],
        category: { id: '1', name: 'Residential', slug: 'residential' },
      };

      await service.embedProject(project as any);

      expect(mockVectorService.upsert).toHaveBeenCalledWith('projects', [
        expect.objectContaining({
          id: '1',
          payload: expect.objectContaining({
            slug: 'test-project',
            title: 'Test Project',
          }),
        }),
      ]);
    });
  });
});
