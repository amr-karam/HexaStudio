import { Injectable, Logger } from '@nestjs/common';
import { QdrantService } from './qdrant.service';
import { createTool, formatResults } from './tool-schemas';
import { AgentTool } from '../types/agent.types';

// Fallback if QdrantService doesn't exist yet
interface QdrantSearchResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

/**
 * Knowledge tools — used by the Knowledge Agent.
 *
 * Integrates with Qdrant vector DB for semantic search
 * and Strapi CMS for content retrieval.
 */
@Injectable()
export class KnowledgeTools {
  private readonly logger = new Logger(KnowledgeTools.name);

  constructor(private readonly qdrant?: QdrantService) {}

  /** Semantic search over indexed documents in Qdrant */
  semanticSearchTool(): AgentTool {
    return createTool(
      'semantic_search',
      'Search for semantically similar content in the knowledge base using vector embedding',
      {
        query: { type: 'string', description: 'Natural language search query' },
        collection: { type: 'string', description: 'Qdrant collection name (default: "knowledge")', default: 'knowledge' },
        topK: { type: 'string', description: 'Number of results to return (default 5)', default: '5' },
      },
      ['query'],
      async (args) => {
        if (!this.qdrant) {
          return JSON.stringify({ error: 'Qdrant service not configured' });
        }

        const topK = args.topK ? parseInt(args.topK, 10) : 5;
        try {
          // The QdrantService should have a search method that handles
          // embedding generation internally (or expects pre-embedded vectors)
          const results = await this.qdrant.search(args.collection, args.query, topK);
          const formatted = results.map((r: QdrantSearchResult) => ({
            score: r.score,
            content: r.payload?.content || r.payload?.text || JSON.stringify(r.payload),
            metadata: {
              source: r.payload?.source as string,
              title: r.payload?.title as string,
              url: r.payload?.url as string,
              created: r.payload?.created_at as string,
            },
          }));
          return formatResults(formatted, topK);
        } catch (error) {
          this.logger.error(`Semantic search failed: ${(error as Error).message}`);
          return JSON.stringify({ error: 'Search failed', details: (error as Error).message });
        }
      },
    );
  }

  /** Keyword search over Strapi CMS content */
  cmsSearchTool(): AgentTool {
    return createTool(
      'cms_search',
      'Search Strapi CMS content — articles, project documentation, knowledge base entries',
      {
        query: { type: 'string', description: 'Search term' },
        contentType: { type: 'string', description: 'Content type to search (articles, projects, docs, all)', default: 'all' },
        limit: { type: 'string', description: 'Maximum results (default 10)', default: '10' },
      },
      ['query'],
      async (args) => {
        // The Strapi CMS is accessed via the existing API or direct HTTP
        // Using the existing fetch pattern from AIService
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.STRAPI_URL ?? 'http://localhost:1337';
        const limit = args.limit ? parseInt(args.limit, 10) : 10;

        try {
          const response = await fetch(`${baseUrl}/api/articles?filters[$or][0][title][$containsi]=${encodeURIComponent(args.query)}&pagination[page]=1&pagination[pageSize]=${limit}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.STRAPI_TOKEN ?? ''}`,
            },
          });

          if (!response.ok) {
            return JSON.stringify({ error: `Strapi search returned ${response.status}` });
          }

          const data = await response.json() as { data?: Array<Record<string, unknown>> };
          const results = data.data?.map((item: Record<string, unknown>) => {
            const attrs = item.attributes as Record<string, unknown> | undefined;
            return {
              id: item.id,
              title: attrs?.title as string | undefined,
              content: attrs?.content as string | undefined ?? '',
              slug: attrs?.slug as string | undefined,
              publishedAt: attrs?.publishedAt as string | undefined,
            };
          }) ?? [];
          return formatResults(results, limit);
        } catch (error) {
          this.logger.error(`CMS search failed: ${(error as Error).message}`);
          return JSON.stringify({ error: 'CMS search failed', details: (error as Error).message });
        }
      },
    );
  }

  /** List documents in a specific project or workspace */
  listDocumentsTool(): AgentTool {
    return createTool(
      'list_documents',
      'List available documents (from MinIO storage) for a project or workspace',
      {
        projectId: { type: 'string', description: 'Project ID to filter documents' },
        workspaceId: { type: 'string', description: 'Workspace ID to filter documents' },
        fileType: { type: 'string', description: 'File type filter (pdf, docx, image, all)', default: 'all' },
      },
      [],
      async () => {
        // This would integrate with MinIO service to list objects
        // For now, return a structured response
        return JSON.stringify({
          sources: ['minio'],
          documents: [],
          message: 'Document listing requires MinIO integration. Please provide projectId or workspaceId.',
        });
      },
    );
  }

  /** Get all available tools */
  getAllTools(): AgentTool[] {
    return [
      this.semanticSearchTool(),
      this.cmsSearchTool(),
      this.listDocumentsTool(),
    ];
  }
}
