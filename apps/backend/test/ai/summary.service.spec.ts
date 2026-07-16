import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SummaryService } from '../../src/modules/ai/summary.service';
import { Project } from '@hexastudio/types';

describe('SummaryService', () => {
  let service: SummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              const config: Record<string, any> = {
                OPENAI_API_KEY: undefined,
                OPENAI_MODEL: 'gpt-4o-mini',
                OPENAI_EMBEDDING_MODEL: 'text-embedding-3-small',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSummary', () => {
    it('returns fallback summary when OpenAI is not configured', async () => {
      const project: Project = {
        slug: 'test-project',
        title: 'Test Project',
        description: 'A beautiful architectural project in downtown.',
        category: { name: 'Commercial' },
        services: ['Architecture', 'Interior Design'],
        location: 'San Francisco, CA',
        area: '50000 sq ft',
      };

      const result = await service.generateSummary(project);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('A beautiful architectural project');
    });

    it('includes project title and key details in fallback', async () => {
      const project: Project = {
        slug: 'museum-nyc',
        title: 'Metropolitan Museum Expansion',
        description: 'Contemporary addition to the historic museum.',
        category: { name: 'Cultural' },
        services: ['Architecture', 'Preservation'],
        location: 'New York, NY',
        area: '120000 sq ft',
      };

      const result = await service.generateSummary(project);

      expect(result).toContain('Metropolitan Museum Expansion');
      expect(result).toContain('Contemporary addition');
    });

    it('handles project with minimal data', async () => {
      const project: Project = {
        slug: 'minimal',
        title: 'Minimal Project',
        description: '',
        category: undefined,
        services: [],
        location: undefined,
        area: undefined,
      };

      const result = await service.generateSummary(project);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});