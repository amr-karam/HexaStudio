import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Project, ProjectResponse, Category } from '@hexastudio/types';
import { getEnv } from '../../config/env';
import { OdooService } from '../odoo/odoo.service';

interface StrapiRelation {
  data?: { id: number; attributes?: Record<string, unknown> };
  id?: number;
  name?: string;
  slug?: string;
}

function mapCategory(relation: StrapiRelation | undefined): Category | undefined {
  if (!relation) return undefined;
  // Strapi v5: flat relation { id, name, slug }
  if (relation.id && relation.name) {
    return { id: String(relation.id), name: relation.name, slug: relation.slug ?? '' };
  }
  // Strapi v4: nested relation { data: { id, attributes: { name, slug } } }
  if (relation.data) {
    return {
      id: String(relation.data.id),
      name: (relation.data.attributes?.name as string) ?? '',
      slug: (relation.data.attributes?.slug as string) ?? '',
    };
  }
  return undefined;
}

function mapMedia(relation: StrapiRelation | undefined): string | undefined {
  if (!relation) return undefined;
  // Strapi v5: flat media { url, name }
  if (typeof relation === 'string') return relation;
  if ('url' in relation) return relation.url as string;
  // Strapi v4: nested media { data: { attributes: { url } } }
  if (relation.data?.attributes?.url) return relation.data.attributes.url as string;
  return undefined;
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly odooService: OdooService,
  ) {}

  private get cmsUrl(): string {
    return getEnv().CMS_URL;
  }

  async getAllProjects(): Promise<ProjectResponse> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.cmsUrl}/api/portfolios`, {
        params: {
          'populate': '*',
          'filters[isPublished][$eq]': true,
          'sort': 'order:asc',
        },
      }),
    );

    const data = response.data;
    const projects = data.data.map((item: Record<string, unknown>) => this.mapProject(item));

    // Enrich each project with Odoo status
    const enrichedProjects = await Promise.all(
      projects.map(async (project: Project) => {
        try {
          const odooData = await this.odooService.searchRead(
            'project.project',
            [['x_slug', '=', project.slug]],
            ['stage_id']
          );
          if (odooData && odooData.length > 0) {
            const stage = odooData[0].stage_id;
            project.status = Array.isArray(stage) ? stage[1] : (stage as any)?.name;
          }
        } catch (error) {
          console.error(`Failed to enrich project ${project.slug} with Odoo data:`, error);
        }
        return project;
      })
    );

    return {
      total: data.meta?.pagination?.total ?? data.data.length,
      projects: enrichedProjects,
    };
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
        project.status = Array.isArray(stage) ? stage[1] : (stage as any)?.name;
      }
    } catch (error) {
      // We don't fail the whole request if Odoo is down (graceful degradation)
      console.error(`Failed to enrich project ${slug} with Odoo data:`, error);
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
