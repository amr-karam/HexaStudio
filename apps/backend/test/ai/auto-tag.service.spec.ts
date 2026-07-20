import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AutoTagService } from '../../src/modules/ai/auto-tag.service';
import { AiChatService } from '../../src/modules/ai/ai-chat.service';

const createMockAiChat = () => ({
  client: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '["modern", "residential", "glass", "sustainable"]' } }],
        }),
      },
    },
  } as any,
  model: 'gpt-4o-mini',
  isAvailable: true,
  provider: 'openai' as const,
});

describe('AutoTagService', () => {
  let service: AutoTagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoTagService,
        { provide: AiChatService, useFactory: createMockAiChat },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              const config: Record<string, any> = {};
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AutoTagService>(AutoTagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate tags for a project', async () => {
    const project = {
      id: '1',
      title: 'Modern Villa',
      description: 'A stunning modern villa with glass facade',
      category: { name: 'Residential' },
      services: ['Architecture', 'Interior'],
    } as any;

    const tags = await service.generateTags(project);
    expect(tags).toEqual(['modern', 'residential', 'glass', 'sustainable']);
  });

  it('should handle empty AI response with keyword fallback', async () => {
    const mockAi = createMockAiChat();
    (mockAi.client!.chat.completions.create as any).mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    });

    const module = await Test.createTestingModule({
      providers: [
        AutoTagService,
        { provide: AiChatService, useValue: mockAi },
        {
          provide: ConfigService,
          useValue: { get: vi.fn(() => undefined) },
        },
      ],
    }).compile();

    const svc = module.get<AutoTagService>(AutoTagService);
    const tags = await svc.generateTags({
      id: '2',
      title: 'Beach House',
      description: 'Coastal retreat with ocean views',
      category: { name: 'Residential' },
      services: ['Architecture'],
    } as any);

    // Fallback should extract keywords from title/description
    expect(tags).toBeDefined();
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
  });
});
