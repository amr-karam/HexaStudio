import { Controller, Post, Get, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('framer')
export class FramerController {
  private readonly key: string;
  constructor(private cfg: ConfigService) {
    this.key = this.cfg.get<string>('FRAMER_API_KEY') ?? '';
  }

  // --- Framer CMS Blog Collection Migration ---
  // Maps Odoo knowledge.article (title, body, date, featured_image)
  // to Framer CMS Blog collection fields (title, slug, body, date, featuredImage)
  @Post('blog/migrate-from-odoo')
  async migrateBlogFromOdoo(@Body() payload: { siteId: string; articles: Array<{ id: number; name: string; body?: string; create_date?: string; is_published?: boolean; featuredImage?: string }> }) {
    if (!this.key) throw new Error('FRAMER_API_KEY not configured');
    
    // Map Odoo article format to Framer CMS Blog collection fields
    const blogCollection = payload.articles.map((art) => ({
      title: art.name,
      slug: art.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      body: art.body ?? '',
      date: art.create_date ? new Date(art.create_date).toISOString() : new Date().toISOString(),
      featuredImage: art.featuredImage ?? '',
      status: (art.is_published ?? true) ? 'published' : 'draft',
      author: 'HEXA Studio Editorial',
      tags: ['Architecture', 'Visualization'],
    }));
    
    // Call Framer CMS API to create/update Blog collection items
    const res = await axios.post(
      'https://api.framer.com/v1/sites/' + payload.siteId + '/collections/blog/items',
      { items: blogCollection },
      {
        headers: { Authorization: 'Bearer ' + this.key, 'Content-Type': 'application/json' },
        timeout: 15000,
      },
    );
    
    return {
      migrated: blogCollection.length,
      siteId: payload.siteId,
      source: 'odoo-knowledge-article',
      fieldsMapped: ['title', 'slug', 'body', 'date', 'featuredImage', 'status', 'author'],
      framerResponse: res.data,
    };
  }

  @Get('blog/collection-status')
  async getBlogCollectionStatus() {
    return { 
      collection: 'blog',
      source: 'odoo-knowledge-article',
      available: !!this.key,
      schema: { title: 'text', slug: 'text', body: 'rich_text', date: 'datetime', featuredImage: 'image', status: 'select', author: 'text', tags: 'multi_select' },
    };
  }

  @Post('publish')
  async publish(@Body() payload: { siteId: string; documentName?: string }) {
    const res = await axios.post(
      'https://api.framer.com/v1/sites/' + payload.siteId + '/publish',
      payload,
      {
        headers: { Authorization: 'Bearer ' + this.key, 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );
    return res.data;
  }

  @Get('status')
  async status() {
    return { keyPresent: !!this.key, source: 'backend-only' };
  }

  // --- Framer CMS Team Collection ---
  // Fields: Name, Role, Department, Photo, Bio, LinkedIn URL, Sort Order
  @Get('team/collection-schema')
  async getTeamSchema() {
    return {
      collection: 'team',
      source: 'cms-api',
      available: !!this.key,
      schema: {
        name: 'text',
        role: 'text',
        department: 'text',
        photo: 'image',
        bio: 'rich_text',
        linkedin_url: 'text',
        sort_order: 'number',
      },
    };
  }

  @Post('team/sync')
  async syncTeam(
    @Body()
      payload: {
        siteId: string;
        members: Array<{
          name: string;
          role: string;
          department: string;
          photo?: string;
          bio?: string;
          linkedin?: string;
          sort_order?: number;
        }>;
      },
  ) {
    const res = await axios.post(
      'https://api.framer.com/v1/sites/' + payload.siteId + '/collections/team/members',
      { items: payload.members },
      {
        headers: {
          Authorization: 'Bearer ' + this.key,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );
    return { synced: payload.members.length, framerResponse: res.data };
  }

  // --- Framer CMS Jobs Collection ---
  // Fields: Title, Department, Location (dropdown), Type (FT/Contract), Description (rich text), Application URL
  @Get('jobs/collection-schema')
  async getJobsSchema() {
    return {
      collection: 'jobs',
      source: 'cms-api',
      available: !!this.key,
      schema: {
        title: 'text',
        department: 'text',
        location: { type: 'select', options: ['Dubai', 'Remote', 'Hybrid', 'New York', 'London'] },
        type: { type: 'select', options: ['Full-time', 'Contract'] },
        description: 'rich_text',
        application_url: 'url',
      },
    };
  }

  // --- Framer CMS Portfolio Collection ---
  // "Published" toggle — set to true for all existing items.
  @Get('portfolio/collection-schema')
  async getPortfolioSchema() {
    return {
      collection: 'portfolio',
      source: 'cms-api',
      available: !!this.key,
      schema: {
        title: 'text',
        slug: 'text',
        published: 'boolean',
        featured_image: 'image',
        description: 'rich_text',
        tags: 'multi_select',
      },
    };
  }

  @Post('portfolio/sync')
  async syncPortfolio(
    @Body()
      payload: {
        siteId: string;
        items: Array<{ id: string; published: boolean }>;
      },
  ) {
    const res = await axios.post(
      'https://api.framer.com/v1/sites/' + payload.siteId + '/collections/portfolio/items',
      { items: payload.items },
      {
        headers: {
          Authorization: 'Bearer ' + this.key,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );
    return { synced: payload.items.length, framerResponse: res.data };
  }
}