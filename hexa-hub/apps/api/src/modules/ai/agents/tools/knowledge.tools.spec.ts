import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeTools } from './knowledge.tools';
import { QdrantService } from './qdrant.service';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockQdrantResults = [
  {
    id: 'doc-1',
    score: 0.92,
    payload: {
      title: 'Q3 Revenue Report',
      content: 'Q3 revenue was 1.2M EUR...',
      source: 'odoo',
      url: 'https://docs.example.com/q3-report',
      created_at: '2024-10-15',
    },
  },
  {
    id: 'doc-2',
    score: 0.78,
    payload: {
      title: 'Budget Analysis',
      content: 'Budget variance report...',
      source: 'strapi',
      url: 'https://cms.example.com/budget',
      created_at: '2024-09-20',
    },
  },
];

const mockStrapiResponse = {
  data: [
    {
      id: 1,
      attributes: {
        title: 'HEXA Hub Project Brief',
        content: 'This document describes the HexaHub redesign project...',
        slug: 'hexahub-project-brief',
        publishedAt: '2024-09-01',
      },
    },
    {
      id: 2,
      attributes: {
        title: 'Design System v3',
        content: 'Updated design tokens and components...',
        slug: 'design-system-v3',
        publishedAt: '2024-08-15',
      },
    },
  ],
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('KnowledgeTools', () => {
  let tools: KnowledgeTools;
  let mockQdrant: jest.Mocked<QdrantService>;

  beforeEach(async () => {
    mockQdrant = {
      search: jest.fn(),
      upsert: jest.fn(),
      isAvailable: jest.fn(),
      createCollection: jest.fn(),
    } as unknown as jest.Mocked<QdrantService>;

    // Mock global fetch for CMS search
    global.fetch = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeTools,
        { provide: QdrantService, useValue: mockQdrant },
      ],
    }).compile();

    tools = module.get<KnowledgeTools>(KnowledgeTools);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllTools', () => {
    it('should return all 3 tools', () => {
      const allTools = tools.getAllTools();
      expect(allTools).toHaveLength(3);
      expect(allTools.map(t => t.definition.name)).toEqual(
        ['semantic_search', 'cms_search', 'list_documents'],
      );
    });
  });

  describe('semanticSearchTool', () => {
    it('should search Qdrant and format results', async () => {
      mockQdrant.search.mockResolvedValue(mockQdrantResults);

      const tool = tools.semanticSearchTool();
      const result = await tool.handler({
        query: 'Q3 revenue',
        collection: 'knowledge',
        topK: '5',
      });

      expect(mockQdrant.search).toHaveBeenCalledWith('knowledge', 'Q3 revenue', 5);
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].score).toBe(0.92);
      expect(parsed[0].content).toBe('Q3 revenue was 1.2M EUR...');
    });

    it('should use default collection and topK when not specified', async () => {
      mockQdrant.search.mockResolvedValue([]);

      const tool = tools.semanticSearchTool();
      await tool.handler({ query: 'test query' });

      expect(mockQdrant.search).toHaveBeenCalledTimes(1);
      expect(mockQdrant.search.mock.calls[0]).toEqual(['knowledge', 'test query', 5]);
    });

    it('should return error when Qdrant is not configured', async () => {
      const toolsNoQdrant = new KnowledgeTools(undefined);
      const tool = toolsNoQdrant.semanticSearchTool();
      const result = await tool.handler({ query: 'hello' });

      const parsed = JSON.parse(result);
      expect(parsed.error).toBe('Qdrant service not configured');
    });

    it('should handle search errors gracefully', async () => {
      mockQdrant.search.mockRejectedValue(new Error('Connection refused'));

      const tool = tools.semanticSearchTool();
      const result = await tool.handler({ query: 'test' });

      const parsed = JSON.parse(result);
      expect(parsed.error).toBe('Search failed');
      expect(parsed.details).toContain('Connection refused');
    });

    it('should handle results with missing payload fields', async () => {
      mockQdrant.search.mockResolvedValue([
        {
          id: 1,
          score: 0.5,
          payload: { text: 'Fallback content' },
        },
      ]);

      const tool = tools.semanticSearchTool();
      const result = await tool.handler({ query: 'test' });

      const parsed = JSON.parse(result);
      expect(parsed[0].content).toBe('Fallback content');
    });
  });

  describe('cmsSearchTool', () => {
    it('should search Strapi CMS and return formatted results', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStrapiResponse,
      });

      const tool = tools.cmsSearchTool();
      const result = await tool.handler({
        query: 'HexaHub',
        contentType: 'projects',
        limit: '10',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        }),
      );

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].title).toBe('HEXA Hub Project Brief');
      expect(parsed[0].slug).toBe('hexahub-project-brief');
    });

    it('should return error when Strapi returns non-ok status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const tool = tools.cmsSearchTool();
      const result = await tool.handler({ query: 'test' });

      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('500');
    });

    it('should handle empty search results', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const tool = tools.cmsSearchTool();
      const result = await tool.handler({ query: 'nonexistent' });

      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(0);
    });
  });

  describe('listDocumentsTool', () => {
    it('should return structured response with MinIO message', async () => {
      const tool = tools.listDocumentsTool();
      const result = await tool.handler({});

      const parsed = JSON.parse(result);
      expect(parsed.sources).toEqual(['minio']);
      expect(parsed.documents).toEqual([]);
      expect(parsed.message).toContain('MinIO integration');
    });

    it('should work with projectId parameter', async () => {
      const tool = tools.listDocumentsTool();
      const result = await tool.handler({
        projectId: 'proj-123',
        fileType: 'pdf',
      });

      const parsed = JSON.parse(result);
      expect(parsed.sources).toEqual(['minio']);
      expect(parsed.message).toBeDefined();
    });

    it('should work with workspaceId parameter', async () => {
      const tool = tools.listDocumentsTool();
      const result = await tool.handler({
        workspaceId: 'ws-456',
        fileType: 'docx',
      });

      const parsed = JSON.parse(result);
      expect(parsed.sources).toEqual(['minio']);
    });
  });
});
