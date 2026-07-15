import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { RecommendationService, SimilarProjectResult } from '../vector/recommendation.service';
import { Project, ProjectResponse } from '@hexastudio/types';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Get()
  async findAll(): Promise<ProjectResponse> {
    return this.projectsService.getAllProjects();
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
