import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { RecommendationService, SimilarProjectResult } from '../vector/recommendation.service';
import type { Project, ProjectResponse } from '@hexastudio/types';

@ApiTags('Projects')
@Controller({ path: 'projects', version: ['1', VERSION_NEUTRAL] })
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'locale', required: false, type: String })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ): Promise<ProjectResponse> {
    return this.projectsService.getAllProjects(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      locale,
    );
  }

  @Get(':slug/similar')
  @ApiOperation({ summary: 'Get similar projects' })
  async findSimilar(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ): Promise<SimilarProjectResult[]> {
    return this.recommendationService.getSimilarProjects(slug, limit ? parseInt(limit, 10) : 5);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get project by slug' })
  async findOne(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ): Promise<Project> {
    return this.projectsService.getProjectBySlug(slug, locale);
  }
}
