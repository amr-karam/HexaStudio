import { Controller, Post, Get, Body, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { getEnv } from '../../config/env';

@Controller('framer')
export class FramerController {
  private readonly logger = new Logger(FramerController.name);
  private readonly framerApiKey: string;
  private readonly framerBaseUrl = 'https://api.framer.com/v1';
  private http: AxiosInstance | null = null;

  constructor(private readonly configService: ConfigService) {
    const env = getEnv();
    this.framerApiKey = env.FRAMER_API_KEY || '';
    if (this.framerApiKey) {
      this.http = axios.create({ baseURL: this.framerBaseUrl, timeout: 15000 });
    }
  }

  private getClient(): AxiosInstance {
    if (!this.http) throw new Error('FRAMER_API_KEY not configured');
    return this.http;
  }

  @Get('status')
  async getStatus() {
    const env = getEnv();
    return {
      framerConfigured: !!env.FRAMER_API_KEY,
      framerSource: 'env',
      odooHost: env.ODOO_HOST || 'not set',
    };
  }

  @Post('blog/migrate-from-odoo')
  async migrateBlogFromOdoo(@Body() payload: { siteId: string; limit?: number }) {
    const client = this.getClient();
    const siteId = payload.siteId;
    const limit = payload.limit ?? 100;

    // Fetch posts from Odoo
    const posts = await this.fetchOdooBlogPosts(limit);
    this.logger.log(`Fetched ${posts.length} blog posts from Odoo`);

    const results: Array<{ slug: string; success: boolean; error?: string }> = [];

    for (const post of posts) {
      try {
        const mapped = this.mapOdooToFramer(post);
        // Check if post already exists (by slug)
        let existed = false;
        try {
          await client.get(`/sites/${siteId}/collections/blog/posts/${mapped.slug}`, {
            headers: { Authorization: `Bearer ${this.framerApiKey}` },
          });
          existed = true;
        } catch (e) {
          if ((e as { response?: { status?: number } })?.response?.status !== 404) throw e;
        }

        const method = existed ? 'put' : 'post';
        await client.request({
          method,
          url: existed ? `/sites/${siteId}/collections/blog/posts/${mapped.slug}` : `/sites/${siteId}/collections/blog/posts`,
          data: mapped,
          headers: { Authorization: `Bearer ${this.framerApiKey}`, 'Content-Type': 'application/json' },
        });

        results.push({ slug: mapped.slug, success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to migrate post slug=${post.slug}: ${message}`);
        results.push({ slug: post.slug, success: false, error: message });
      }
    }

    return {
      migrated: results.length,
      successes: results.filter(r => r.success).length,
      failures: results.filter(r => !r.success).length,
      results,
    };
  }

  @Get('blog/collection-schema')
  async getBlogSchema() {
    return {
      collection: 'blog',
      fields: {
        title: { type: 'text', required: true },
        slug: { type: 'text', required: true, unique: true },
        author: { type: 'text', default: 'HEXA Studio Editorial' },
        category: { type: 'select', options: ['Design', 'Technology', 'Studio', 'Architecture', 'Visualization'] },
        publish_date: { type: 'datetime' },
        featured_image: { type: 'image' },
        body: { type: 'rich_text' },
        is_featured: { type: 'boolean', default: false },
        read_time: { type: 'number', unit: 'minutes' },
      },
    };
  }

  @Get('blog/collection-status')
  async getBlogCollectionStatus() {
    const client = this.getClient();
    const siteId = 'hexa-studios-odoo';
    try {
      const res = await client.get(`/sites/${siteId}/collections/blog`, {
        headers: { Authorization: `Bearer ${this.framerApiKey}` },
      });
      return { exists: true, name: res.data.name, postCount: res.data.posts?.length || 0 };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) return { exists: false, error: 'Collection not found' };
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { exists: 'unknown', error: message };
    }
  }

  private async fetchOdooBlogPosts(limit: number): Promise<Array<{ title: string; slug: string; body: string; publishDate: string; author: string; featuredImage: string | null; categories: string[] }>> {
    // Use existing Odoo ERP client via RPC or XML-RPC
    const env = getEnv();
    const odooHost = env.ODOO_HOST;
    const odooPort = env.ODOO_PORT || 8069;
    const odooDb = env.ODOO_DB || 'hexastudio';
    const odooUser = env.ODOO_USER || 'admin';
    const odooPassword = env.ODOO_PASSWORD || '';

    // Connect to Odoo and fetch blog posts via JSON-RPC
    const url = `http://${odooHost}:${odooPort}/jsonrpc`;
    const commonPayload = { jsonrpc: '2.0', method: 'call', id: Date.now() };

    // 1) Authenticate
    const authRes = await axios.post(url, {
      ...commonPayload,
      params: {
        service: 'login',
        args: { db: odooDb, login: odooUser, password: odooPassword },
      },
    });
    const uid = authRes.data.result;
    if (!uid) throw new Error('Odoo authentication failed');

    // 2) Fetch blog posts
    const searchRes = await axios.post(url, {
      ...commonPayload,
      params: {
        service: 'object',
        args: {
          model: 'blog.post',
          method: 'search_read',
          args: [
            [],
            { fields: ['name', 'slug', 'body', 'create_date', 'author_id', 'blog_id', 'website_published', 'create_uid'], offset: 0, limit },
          ],
        },
      },
    });

    const rawPosts = searchRes.data.result || [];
    return rawPosts.map((p: Record<string, unknown>) => {
      const name = typeof p.name === 'string' ? p.name : '';
      const slugRaw = typeof p.slug === 'string' ? p.slug : name;
      const slug = slugRaw || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const body = typeof p.body === 'string' ? p.body : '';
      const publishDate = typeof p.create_date === 'string' ? p.create_date : new Date().toISOString();
      const authorRaw = p.author_id;
      const author = Array.isArray(authorRaw) && typeof authorRaw[1] === 'string' ? authorRaw[1] : 'HEXA Studio Editorial';
      const blogRaw = p.blog_id;
      const categoryRaw = Array.isArray(blogRaw) && typeof blogRaw[1] === 'string' ? blogRaw[1] : 'Studio';
      const mergedCategory = /Design|UI|UX/i.test(categoryRaw) ? 'Design' : categoryRaw;
      const featuredImage = typeof p.featured_image === 'string' ? p.featured_image : null;

      return {
        title: name,
        slug,
        body,
        publishDate,
        author,
        featuredImage,
        categories: [mergedCategory],
      };
    });
  }

  private mapOdooToFramer(post: { title: string; slug: string; body: string; publishDate: string; author: string; featuredImage: string | null; categories: string[] }) {
    const wordCount = (post.body.match(/\S+/g) || []).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    const category = post.categories?.[0] || 'Studio';
    const mergedCategory = category.includes('Design') || category.includes('UI') || category.includes('UX') ? 'Design' : category;
    return {
      title: post.title,
      slug: post.slug,
      author: post.author,
      category: [mergedCategory],
      publish_date: post.publishDate,
      featured_image: post.featuredImage,
      body: post.body,
      is_featured: false,
      read_time: readTime,
    };
  }
}
