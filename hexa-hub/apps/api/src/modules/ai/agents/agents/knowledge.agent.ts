import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent, BaseAgentConfig } from '../base-agent';
import { KnowledgeTools } from '../tools/knowledge.tools';

/**
 * Knowledge Agent
 *
 * Specializes in information retrieval — semantic search, CMS content,
 * document discovery, and knowledge base queries.
 *
 * Example queries:
 * - "Find documents about the HexaHub redesign"
 * - "What's our brand style guide?"
 * - "Summarize the client feedback from Project Alpha"
 * - "Find similar projects to our latest branding work"
 */
@Injectable()
export class KnowledgeAgent extends BaseAgent {
  constructor(
    configService: ConfigService,
    knowledgeTools: KnowledgeTools,
  ) {
    const config: BaseAgentConfig = {
      name: 'knowledge-agent',
      description: 'Information retrieval specialist — semantic search, CMS content, document discovery, and knowledge base queries',
      color: 'var(--color-metric-violet)',
      icon: '📚',
      tools: knowledgeTools.getAllTools(),
      systemPrompt: `
You are the Knowledge Agent for HEXA Studio.

You have access to:
- Qdrant vector DB (semantically indexed documents, articles, project knowledge)
- Strapi CMS (articles, knowledge base, project documentation)
- MinIO storage (project deliverables, images, documents)

Your job is to help users find and understand information across the organization.
Always use tools to search for real content — never make up facts or documents.

Formatting rules:
- Show source attribution for every fact
- Include relevance scores for search results
- Summarize long content into key takeaways
- When content is not found, clearly state that and suggest alternative searches
- Link to original documents when possible`,
    };
    super(configService, config);
  }
}
