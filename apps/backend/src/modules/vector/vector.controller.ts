import { Controller, Post, Get, Body, Param, UseGuards, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { VectorService } from './vector.service';
import { VectorSyncService } from './vector-sync.service';
import { RecommendationService, SimilarProjectResult } from './recommendation.service';
import { AutoTagService } from '../ai/auto-tag.service';
import { LightingService } from '../ai/lighting.service';
import { ProjectsService } from '../projects/projects.service';
import { SemanticSearchRequest, SemanticSearchResponse } from '@hexastudio/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller({ path: 'vector', version: VERSION_NEUTRAL })
export class VectorController {
  constructor(
    private readonly vectorService: VectorService,
    private readonly vectorSyncService: VectorSyncService,
    private readonly recommendationService: RecommendationService,
    private readonly autoTagService: AutoTagService,
    private readonly projectsService: ProjectsService,
    private readonly lightingService: LightingService,
  ) {}

  @Post('search')
  @UseGuards(JwtAuthGuard)
  async search(@Body() request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    return this.vectorService.search('projects', request);
  }

  @Post('search/public')
  async publicSearch(@Body() request: { query: string; limit?: number }): Promise<SemanticSearchResponse> {
    return this.vectorService.search('projects', {
      query: request.query,
      limit: request.limit ?? 5,
    });
  }

  @Post('sync/all')
  @UseGuards(JwtAuthGuard)
  async syncAll(): Promise<{ message: string }> {
    await this.vectorSyncService.syncAllProjects();
    return { message: 'Full re-index started' };
  }

  @Post('sync/:slug')
  @UseGuards(JwtAuthGuard)
  async syncBySlug(@Body('slug') slug: string): Promise<{ message: string }> {
    await this.vectorSyncService.syncProject(slug);
    return { message: `Syncing project ${slug} started` };
  }

  @Post('tags/:slug')
  @UseGuards(JwtAuthGuard)
  async generateTags(@Param('slug') slug: string): Promise<{ tags: string[] }> {
    const project = await this.projectsService.getProjectBySlug(slug);
    const tags = await this.autoTagService.generateTags(project);
    return { tags };
  }

  @Post('lighting/:slug')
  @UseGuards(JwtAuthGuard)
  async getLighting(@Param('slug') slug: string, @Query('limit') limit?: string): Promise<{ id: string; score: number }[]> {
    const project = await this.projectsService.getProjectBySlug(slug);
    const result = await this.lightingService.recommendLighting(project, limit ? parseInt(limit, 10) : 3);
    return result;
  }

  @Get('recommendations/:slug')
  async getRecommendations(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ): Promise<SimilarProjectResult[]> {
    return this.recommendationService.getSimilarProjects(slug, limit ? parseInt(limit, 10) : 5);
  }
}
