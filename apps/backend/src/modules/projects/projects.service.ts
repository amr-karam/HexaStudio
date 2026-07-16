import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Project, ProjectResponse, Category } from '@hexastudio/types';
import { getEnv } from '../../config/env';
import { OdooService } from '../odoo/odoo.service';

interface StrapiRelation {
  id?: number;
  name?: string;
  slug?: string;
  url?: string;
}

function mapCategory(relation: StrapiRelation | undefined): Category | undefined {
  if (!relation?.id || !relation.name) return undefined;
  return { id: String(relation.id), name: relation.name, slug: relation.slug ?? '' };
}

function mapMedia(relation: StrapiRelation | undefined): string | undefined {
  if (!relation) return undefined;
  if (typeof relation === 'string') return relation;
  if ('url' in relation && relation.url) return relation.url;
  return undefined;
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly odooService: OdooService,
  ) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllProjects(page = 1, limit = 20): Promise<ProjectResponse> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/portfolios`, {
        params: {
          'populate': '*',
          'filters[isPublished][$eq]': true,
          'sort': 'order:asc',
          'pagination[page]': safePage,
          'pagination[pageSize]': safeLimit,
        },
      }),
    );

    const data = response.data;
    const projects = data.data.map((item: Record<string, unknown>) => this.mapProject(item));

    // Batch Odoo status lookup in a single query instead of N+1
    const slugs = projects.map((p: Project) => p.slug);
    let enrichmentError: string | undefined;
    try {
      const odooData = await this.odooService.searchRead(
        'project.project',
        [['x_slug', 'in', slugs]],
        ['x_slug', 'stage_id']
      );
      const stageMap = new Map<string, string>();
      for (const row of odooData) {
        const slug = row.x_slug as string;
        const stage = row.stage_id;
        const stageName = Array.isArray(stage)
          ? String(stage[1])
          : String((stage as Record<string, unknown>)?.name ?? '');
        if (slug) stageMap.set(slug, stageName);
      }
      for (const project of projects) {
        const status = stageMap.get(project.slug);
        if (status) project.status = status;
      }
    } catch (error) {
      const msg = 'Failed to batch-enrich projects with Odoo data';
      this.logger.warn({ msg, error: (error as Error).message });
      enrichmentError = msg;
    }

    const total = data.meta?.pagination?.total ?? data.data.length;
    return {
      total,
      projects,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
      ...(enrichmentError ? { _enrichmentError: enrichmentError } : {}),
    } as ProjectResponse & { _enrichmentError?: string };
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/portfolios`, {
        params: {
          'populate': '*',
          'filters[slug][$eq]': slug,
        },
      }),
    );

    const items = response.data.data;
    if (!items || items.length === 0) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }

    const project = this.mapProject(items[0]);

    try {
      // Enrich with Odoo data
      const odooData = await this.odooService.searchRead(
        'project.project',
        [['x_slug', '=', slug]],
        ['stage_id']
      );

      if (odooData && odooData.length > 0) {
        // In Odoo, stage_id is often [id, name]
        const stage = odooData[0].stage_id;
        project.status = Array.isArray(stage) ? String(stage[1]) : String((stage as Record<string, unknown>)?.name ?? '');
      }
    } catch (error) {
      const msg = `Failed to enrich project ${slug} with Odoo data`;
      this.logger.warn({ msg, slug, error: (error as Error).message });
      (project as Project & { _enrichmentError?: string })._enrichmentError = msg;
    }

    return project;
  }

  private mapProject(item: Record<string, unknown>): Project {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    return {
      id: String(item.id),
      title: attrs.title as string,
      slug: attrs.slug as string,
      description: attrs.description as string,
      shortDescription: attrs.shortDescription as string | undefined,
      coverImage: mapMedia(attrs.coverImage as StrapiRelation) ?? '',
      category: mapCategory(attrs.category as StrapiRelation),
      modelUrl: attrs.modelUrl as string | undefined,
      hotspots: (attrs.hotspots as Array<Record<string, unknown>>)?.map((h) => ({
        id: h.id as string,
        title: h.title as string,
        description: h.description as string,
        position: h.position as [number, number, number],
        lookAt: h.lookAt as [number, number, number],
      })) ?? [],
      client: attrs.client as string | undefined,
      location: attrs.location as string | undefined,
      year: attrs.year as number | undefined,
      area: attrs.area as string | undefined,
      services: attrs.services as string[] | undefined,
      isPublished: (attrs.isPublished as boolean) ?? true,
      createdAt: (attrs.createdAt as string) ?? new Date().toISOString(),
      updatedAt: (attrs.updatedAt as string) ?? new Date().toISOString(),
    };
  }
}
