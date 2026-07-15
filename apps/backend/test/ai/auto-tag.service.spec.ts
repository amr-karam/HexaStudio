import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { AutoTagService } from '../../src/modules/ai/auto-tag.service';

vi.mock('openai', () => {
  return {
    default: class {
      embeddings = {
        create: vi.fn(),
      };
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '["modern", "residential", "glass", "sustainable"]' } }],
          }),
        },
      };
    },
  };
});

describe('AutoTagService', () => {
  let service: AutoTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoTagService],
    }).compile();

    service = module.get<AutoTagService>(AutoTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTags', () => {
    it('should return an array of tags', async () => {
      const project = {
        id: '1',
        slug: 'modern-villa',
        title: 'Modern Villa',
        description: 'A sustainable modern residential building with glass facades',
        services: ['architecture', 'interior-design'],
        category: { id: '1', name: 'Residential', slug: 'residential' },
      };

      const tags = await service.generateTags(project as any);
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.length).toBeLessThanOrEqual(10);
    });

    it('should handle empty project gracefully', async () => {
      const project = {
        id: '2',
        slug: 'empty',
        title: '',
        description: '',
        services: [],
      };

      const tags = await service.generateTags(project as any);
      expect(Array.isArray(tags)).toBe(true);
    });
  });
});
