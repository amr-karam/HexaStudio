import { Injectable, Logger } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { VectorService } from '../vector/vector.service';
import { SummaryService } from '../ai/summary.service';
import { RecommendationService } from '../vector/recommendation.service';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export interface ToolResult {
  tool: string;
  output: string;
}

@Injectable()
export class ToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly vectorService: VectorService,
    private readonly summaryService: SummaryService,
    private readonly recommendationService: RecommendationService,
  ) {}

  getDefinitions(): ToolDefinition[] {
    return [
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
      {
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
      },
      {
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
    ];
  }

  async execute(name: string, params: Record<string, any>): Promise<string> {
    this.logger.log(`Executing tool: ${name}(${JSON.stringify(params)})`);

    switch (name) {
      case 'search_projects': {
        const result = await this.vectorService.search('projects', {
          query: params.query,
          limit: params.limit ?? 5,
        });
        return JSON.stringify(result.results.map(r => ({
          slug: r.payload?.slug,
          title: r.payload?.title,
          score: r.score,
        })));
      }

      case 'get_project': {
        const project = await this.projectsService.getProjectBySlug(params.slug);
        if (!project) return JSON.stringify({ error: 'Project not found' });
        return JSON.stringify({
          title: project.title,
          description: project.description,
          category: project.category?.name,
          services: project.services,
          location: project.location,
          area: project.area,
        });
      }

      case 'get_similar_projects': {
        const results = await this.recommendationService.getSimilarProjects(params.slug, params.limit ?? 3);
        return JSON.stringify(results);
      }

      case 'generate_summary': {
        const project = await this.projectsService.getProjectBySlug(params.slug);
        if (!project) return JSON.stringify({ error: 'Project not found' });
        const summary = await this.summaryService.generateSummary(project);
        return JSON.stringify({ summary });
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  }
}
