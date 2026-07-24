import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProjectsService } from './projects.service';
import { RecommendationService, SimilarProjectResult } from '../vector/recommendation.service';
import { StrapiProjectSyncService } from '../odoo/strapi-project-sync.service';
import { OdooApiService } from '../odoo/odoo-api.service';
import type { Project, ProjectResponse } from '@hexastudio/types';

@ApiTags('Projects')
@Controller({ path: 'projects', version: ['1', VERSION_NEUTRAL] })
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly recommendationService: RecommendationService,
    private readonly strapiProjectSync: StrapiProjectSyncService,
    private readonly odooApi: OdooApiService,
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

  // ── Gap 8: POST /projects — programmatic project creation ──

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project (Strapi + Odoo)' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'slug'],
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        client: { type: 'string' },
        services: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async create(@Body() body: {
    title: string;
    slug: string;
    description?: string;
    client?: string;
    services?: string[];
  }): Promise<{ slug: string; strapiId: number; odooId: number | null }> {
    // First check the slug isn't taken
    const existing = await this.projectsService.getProjectBySlug(body.slug).catch(() => null);
    if (existing) {
      // If it exists, sync it to Odoo if needed
      const odooId = await this.strapiProjectSync.syncPortfolioToOdoo(body.slug);
      const mapping = await this.strapiProjectSync.getMapping(body.slug);
      return {
        slug: body.slug,
        strapiId: mapping?.strapiId ?? (Number(existing.id) || 0),
        odooId: odooId ?? mapping?.odooId ?? null,
      };
    }

    // Create in Strapi via CMS API
    const newEntry = await this.strapiProjectSync.createStrapiProject(body);
    const odooId = await this.strapiProjectSync.syncPortfolioToOdoo(body.slug);

    return { slug: body.slug, strapiId: newEntry, odooId: odooId ?? null };
  }

  // ── Gap 10: PATCH /projects/:slug/status — status write-back ──

  @Patch(':slug/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project live status (write-back to Odoo)' })
  @ApiResponse({ status: 200, description: 'Project status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', description: 'New status identifier (e.g. "in_progress", "completed", "on_hold")' },
      },
    },
  })
  async updateStatus(
    @Param('slug') slug: string,
    @Body('status') status: string,
  ): Promise<{ slug: string; status: string }> {
    // Map status to Odoo stage_id
    const stageMap: Record<string, number> = {
      draft: 1,
      in_progress: 2,
      review: 3,
      completed: 4,
      on_hold: 5,
      cancelled: 6,
    };
    const stageId = stageMap[status];
    if (!stageId) {
      throw new Error(`Unknown status "${status}". Valid values: ${Object.keys(stageMap).join(', ')}`);
    }

    // Update Odoo stage
    const mapping = await this.strapiProjectSync.getMapping(slug);
    if (mapping?.odooId) {
      await this.odooApi.updateProject(mapping.odooId, { stage_id: stageId });
      await this.strapiProjectSync.syncOdooProjectToStrapi(mapping.odooId);
    } else {
      // No Odoo mapping yet — sync from Strapi first
      const odooId = await this.strapiProjectSync.syncPortfolioToOdoo(slug);
      if (odooId) {
        await this.odooApi.updateProject(odooId, { stage_id: stageId });
      }
    }

    return { slug, status };
  }
}
