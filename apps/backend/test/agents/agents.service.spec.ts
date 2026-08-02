import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { AgentsService } from '../../src/modules/agents/agents.service';
import { AgentMemoryService } from '../../src/modules/agents/agent-memory.service';
import { ToolRegistryService } from '../../src/modules/agents/tool-registry.service';
import { GatekeeperService } from '../../src/modules/agents/gatekeeper.service';
import { TOOL_DEFINITION_METADATA } from '../../src/modules/agents/decorators/constants';
import { ToolDefinitionOptions } from '../../src/modules/agents/decorators/tool-definition.decorator';

describe('AgentsService', () => {
  let service: AgentsService;
  let toolRegistry: ToolRegistryService;

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

  const mockMemory = {
    getHistory: vi.fn().mockResolvedValue([]),
    append: vi.fn().mockResolvedValue(undefined),
    appendMany: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    remember: vi.fn().mockResolvedValue(undefined),
    recall: vi.fn().mockResolvedValue(undefined),
    forget: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        { provide: ToolRegistryService, useValue: mockToolRegistry },
        { provide: AgentMemoryService, useValue: mockMemory },
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
    toolRegistry = module.get<ToolRegistryService>(ToolRegistryService);
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

describe('ToolRegistryService', () => {
  let toolRegistry: ToolRegistryService;

  // Mock host whose prototype methods are discovered by ToolRegistryService
  // during onModuleInit — mirroring how tool methods are attached to real
  // services (ProjectsService, VectorService, SummaryService, ...) via the
  // @ToolDefinition decorator.
  class MockToolHost {
    async searchProjects(): Promise<Array<{ slug: string; title: string; score: number }>> {
      return [
        { slug: 'proj-1', title: 'Project One', score: 0.95 },
        { slug: 'proj-2', title: 'Project Two', score: 0.85 },
      ];
    }

    async getProject(params: { slug: string }): Promise<Record<string, unknown>> {
      if (params.slug === 'missing') return { error: 'Project not found' };
      return { slug: params.slug, title: 'Test Project', description: 'A test project' };
    }

    async getSimilarProjects(): Promise<
      Array<{ slug: string; title: string; category: string; score: number }>
    > {
      return [
        { slug: 'similar-1', title: 'Similar One', category: 'Residential', score: 0.9 },
        { slug: 'similar-2', title: 'Similar Two', category: 'Commercial', score: 0.8 },
      ];
    }

    async generateSummary(params: { slug: string }): Promise<Record<string, unknown>> {
      if (params.slug === 'missing') return { error: 'Project not found' };
      return { summary: 'This is a generated summary.' };
    }
  }

  const toolDefinitions: Record<string, ToolDefinitionOptions> = {
    searchProjects: {
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
    getProject: {
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
    getSimilarProjects: {
      name: 'get_similar_projects',
      description: 'Get similar projects to a given project',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Project slug' },
          limit: { type: 'number', description: 'Max results (default 5)' },
        },
        required: ['slug'],
      },
    },
    generateSummary: {
      name: 'generate_summary',
      description: 'Generate an AI-written summary for a project',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Project slug' },
        },
        required: ['slug'],
      },
    },
  };

  const mockDiscoveryService = {
    getProviders: vi.fn(),
  };

  const mockReflector = {
    get: vi.fn(),
  };

  const mockGatekeeperService = {
    authorize: vi.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDiscoveryService.getProviders.mockReturnValue([
      { instance: new MockToolHost(), metatype: MockToolHost },
    ]);
    mockReflector.get.mockImplementation((metadataKey: string, target: Function) => {
      if (metadataKey === TOOL_DEFINITION_METADATA) {
        return toolDefinitions[(target as { name?: string }).name ?? ''];
      }
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolRegistryService,
        { provide: DiscoveryService, useValue: mockDiscoveryService },
        { provide: Reflector, useValue: mockReflector },
        { provide: GatekeeperService, useValue: mockGatekeeperService },
      ],
    }).compile();

    toolRegistry = module.get<ToolRegistryService>(ToolRegistryService);
    toolRegistry.onModuleInit();
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
      const result = await toolRegistry.execute('search_projects', { query: 'museum', limit: 5 }, undefined);

      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0]).toHaveProperty('slug');
      expect(parsed[0]).toHaveProperty('title');
      expect(parsed[0]).toHaveProperty('score');
    });

    it('get_project returns project details', async () => {
      const result = await toolRegistry.execute('get_project', { slug: 'test-project' }, undefined);

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('title', 'Test Project');
      expect(parsed).toHaveProperty('description', 'A test project');
    });

    it('get_project returns error for missing project', async () => {
      const result = await toolRegistry.execute('get_project', { slug: 'missing' }, undefined);

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('error', 'Project not found');
    });

    it('get_similar_projects returns formatted results', async () => {
      const result = await toolRegistry.execute('get_similar_projects', { slug: 'original', limit: 3 }, undefined);

      const parsed = JSON.parse(result);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
    });

    it('generate_summary returns summary for valid project', async () => {
      const result = await toolRegistry.execute('generate_summary', { slug: 'test-project' }, undefined);

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('summary', 'This is a generated summary.');
    });

    it('generate_summary returns error for missing project', async () => {
      const result = await toolRegistry.execute('generate_summary', { slug: 'missing' }, undefined);

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('error', 'Project not found');
    });

    it('throws for unknown tool', async () => {
      await expect(toolRegistry.execute('unknown_tool', {}, undefined)).rejects.toThrow(
        'Tool unknown_tool not found',
      );
    });
  });
});
