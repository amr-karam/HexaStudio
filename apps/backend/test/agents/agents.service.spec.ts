import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AgentsService } from '../../src/modules/agents/agents.service';
import { ToolRegistry } from '../../src/modules/agents/tools';
import { ProjectsService } from '../../src/modules/projects/projects.service';
import { VectorService } from '../../src/modules/vector/vector.service';
import { SummaryService } from '../../src/modules/ai/summary.service';
import { RecommendationService } from '../../src/modules/vector/recommendation.service';

describe('AgentsService', () => {
  let service: AgentsService;
  let toolRegistry: ToolRegistry;

  const mockToolRegistry = {
    getDefinitions: vi.fn().mockReturnValue([
      {
        name: 'search_projects',
        description: 'Search architecture projects by keyword query',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Max results (default 5)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_project',
        description: 'Get detailed information about a specific project by slug',
        parameters: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'Project slug' },
          },
          required: ['slug'],
        },
      },
    ]),
    execute: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        { provide: ToolRegistry, useValue: mockToolRegistry },
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

    service = module.get<AgentsService>(AgentsService);
    toolRegistry = module.get<ToolRegistry>(ToolRegistry);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat', () => {
    it('returns unavailable message when OpenAI is not configured', async () => {
      // The service will have no OpenAI client in test env
      const result = await service.chat('Hello, what projects do you have?');

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('toolCalls');
      expect(typeof result.response).toBe('string');
      expect(typeof result.toolCalls).toBe('number');
    });
  });
});

describe('ToolRegistry', () => {
  let toolRegistry: ToolRegistry;

  const mockProjectsService = {
    getProjectBySlug: vi.fn(),
  };

  const mockVectorService = {
    search: vi.fn(),
  };

  const mockSummaryService = {
    generateSummary: vi.fn(),
  };

  const mockRecommendationService = {
    getSimilarProjects: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolRegistry,
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: VectorService, useValue: mockVectorService },
        { provide: SummaryService, useValue: mockSummaryService },
        { provide: RecommendationService, useValue: mockRecommendationService },
      ],
    }).compile();

    toolRegistry = module.get<ToolRegistry>(ToolRegistry);
  });

  it('should be defined', () => {
    expect(toolRegistry).toBeDefined();
  });

  describe('getDefinitions', () => {
    it('returns array of tool definitions', () => {
      const definitions = toolRegistry.getDefinitions();

      expect(Array.isArray(definitions)).toBe(true);
      expect(definitions.length).toBeGreaterThan(0);
      definitions.forEach((def) => {
        expect(def).toHaveProperty('name');
        expect(def).toHaveProperty('description');
        expect(def).toHaveProperty('parameters');
        expect(def.parameters).toHaveProperty('type', 'object');
        expect(def.parameters).toHaveProperty('properties');
        expect(def.parameters).toHaveProperty('required');
      });
    });

    it('includes expected tools', () => {
      const definitions = toolRegistry.getDefinitions();
      const names = definitions.map((d) => d.name);

      expect(names).toContain('search_projects');
      expect(names).toContain('get_project');
      expect(names).toContain('get_similar_projects');
      expect(names).toContain('generate_summary');
    });
  });

  describe('execute', () => {
    it('search_projects returns formatted results', async () => {
      mockVectorService.search.mockResolvedValue({
        results: [
          { payload: { slug: 'proj-1', title: 'Project One' }, score: 0.95 },
          { payload: { slug: 'proj-2', title: 'Project Two' }, score: 0.85 },
        ],
      });

      const result = await toolRegistry.execute('search_projects', { query: 'museum', limit: 5 });

      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0]).toHaveProperty('slug');
      expect(parsed[0]).toHaveProperty('title');
      expect(parsed[0]).toHaveProperty('score');
    });

    it('get_project returns project details', async () => {
      mockProjectsService.getProjectBySlug.mockResolvedValue({
        slug: 'test-project',
        title: 'Test Project',
        description: 'A test project',
        category: { name: 'Commercial' },
        services: ['Architecture'],
        location: 'NYC',
        area: '10000 sq ft',
      });

      const result = await toolRegistry.execute('get_project', { slug: 'test-project' });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('title', 'Test Project');
      expect(parsed).toHaveProperty('description', 'A test project');
    });

    it('get_project returns error for missing project', async () => {
      mockProjectsService.getProjectBySlug.mockResolvedValue(null);

      const result = await toolRegistry.execute('get_project', { slug: 'missing' });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('error', 'Project not found');
    });

    it('get_similar_projects returns formatted results', async () => {
      mockRecommendationService.getSimilarProjects.mockResolvedValue([
        { slug: 'similar-1', title: 'Similar One', category: 'Residential', score: 0.9 },
        { slug: 'similar-2', title: 'Similar Two', category: 'Commercial', score: 0.8 },
      ]);

      const result = await toolRegistry.execute('get_similar_projects', { slug: 'original', limit: 3 });

      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });

    it('generate_summary returns summary for valid project', async () => {
      mockProjectsService.getProjectBySlug.mockResolvedValue({
        slug: 'test-project',
        title: 'Test Project',
        description: 'Test description',
      });
      mockSummaryService.generateSummary.mockResolvedValue('This is a generated summary.');

      const result = await toolRegistry.execute('generate_summary', { slug: 'test-project' });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('summary', 'This is a generated summary.');
    });

    it('generate_summary returns error for missing project', async () => {
      mockProjectsService.getProjectBySlug.mockResolvedValue(null);

      const result = await toolRegistry.execute('generate_summary', { slug: 'missing' });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('error', 'Project not found');
    });

    it('returns error for unknown tool', async () => {
      const result = await toolRegistry.execute('unknown_tool', {});

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('error', 'Unknown tool: unknown_tool');
    });
  });
});