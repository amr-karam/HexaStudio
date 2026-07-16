import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { RecommendationService, SimilarProjectResult } from '../vector/recommendation.service';
import { Project, ProjectResponse } from '@hexastudio/types';

@Controller({ path: 'projects', version: VERSION_NEUTRAL })
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ProjectResponse> {
    return this.projectsService.getAllProjects(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':slug/similar')
  async findSimilar(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ): Promise<SimilarProjectResult[]> {
    return this.recommendationService.getSimilarProjects(slug, limit ? parseInt(limit, 10) : 5);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<Project> {
    return this.projectsService.getProjectBySlug(slug);
  }
}
