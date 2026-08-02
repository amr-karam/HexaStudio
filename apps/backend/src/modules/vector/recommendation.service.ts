import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { VectorService } from '../vector/vector.service';
import { EmbeddingService } from '../ai/embedding.service';
import { ProjectsService } from '../projects/projects.service';
import { ToolDefinition } from '../agents/decorators/tool-definition.decorator';
import { ToolAuthorization } from '../agents/decorators/tool-authorization.decorator';

export interface SimilarProjectResult {
  slug: string;
  title: string;
  category?: string;
  score: number;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly vectorService: VectorService,
    @Inject(forwardRef(() => EmbeddingService))
    private readonly embeddingService: EmbeddingService,
    private readonly projectsService: ProjectsService,
  ) {}

  @ToolDefinition({
    name: 'get_similar_projects',
    description: 'Find projects similar to a given project',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Source project slug' },
        limit: { type: 'number', description: 'Max results (default 3)' },
      },
      required: ['slug'],
    },
  })
  @ToolAuthorization({ requiresAuth: true, requiresHitl: false })
  async getSimilarProjectsTool(params: { slug: string; limit?: number }) {
    return this.getSimilarProjects(params.slug, params.limit ?? 3);
  }

  async getSimilarProjects(slug: string, limit = 5): Promise<SimilarProjectResult[]> {
    try {
      const project = await this.projectsService.getProjectBySlug(slug);
      if (!project) {
        this.logger.warn(`Project ${slug} not found for recommendations`);
        return [];
      }

      const text = `${project.title}\n${project.description}\n${(project.services || []).join(', ')}`;
      const vector = await this.embeddingService.generateEmbedding(text);

      const searchResult = await this.vectorService.searchByVector('projects', vector, limit + 1);

      return searchResult.results
        .filter(r => r.payload.slug !== slug)
        .slice(0, limit)
        .map(r => ({
          slug: r.payload.slug as string,
          title: r.payload.title as string,
          category: r.payload.category as string | undefined,
          score: r.score,
        }));
    } catch (error) {
      this.logger.error(`Failed to get similar projects for ${slug}: ${error}`);
      return [];
    }
  }
}
