import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getEnv } from '../../../config/env';

export interface NotionPage {
  id: string;
  title: string;
  status: string;
  lastEditedTime: string;
  url: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
  url: string;
}

@Injectable()
export class NotionService {
  private readonly logger = new Logger(NotionService.name);

  constructor(private readonly http: HttpService) {}

  private get apiKey(): string | undefined {
    return getEnv().NOTION_API_KEY;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    };
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  async searchDatabases(): Promise<NotionDatabase[]> {
    if (!this.isConfigured) {
      this.logger.warn('Notion API key not configured');
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.http.post('https://api.notion.com/v1/search', {
          filter: { value: 'database', property: 'object' },
          page_size: 10,
        }, { headers: this.headers }),
      );

      return response.data.results.map((db: Record<string, unknown>) => ({
        id: db.id as string,
        title: ((db.title as Array<{ plain_text?: string }>)?.[0]?.plain_text) || 'Untitled',
        url: db.url as string,
      }));
    } catch (error) {
      this.logger.error('Failed to search Notion databases', error);
      return [];
    }
  }

  async queryDatabase(databaseId: string, filter?: Record<string, unknown>): Promise<NotionPage[]> {
    if (!this.isConfigured) return [];

    try {
      const body: Record<string, unknown> = { page_size: 100 };
      if (filter) body.filter = filter;

      const response = await firstValueFrom(
        this.http.post(`https://api.notion.com/v1/databases/${databaseId}/query`, body, { headers: this.headers }),
      );

      return response.data.results.map((page: Record<string, unknown>) => {
        const props = page.properties as Record<string, { title?: Array<{ plain_text?: string }>; status?: { status?: { name?: string } }; select?: { select?: { name?: string } } };
        const titleProp = Object.values(props).find(p => p.title);
        const statusProp = props.Status || props.status;

        return {
          id: page.id as string,
          title: titleProp?.title?.[0]?.plain_text || 'Untitled',
          status: statusProp?.status?.name || statusProp?.select?.select?.name || 'Unknown',
          lastEditedTime: page.last_edited_time as string,
          url: page.url as string,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to query Notion database ${databaseId}`, error);
      return [];
    }
  }

  async createPage(databaseId: string, properties: Record<string, unknown>, children?: unknown[]): Promise<string | null> {
    if (!this.isConfigured) return null;

    try {
      const response = await firstValueFrom(
        this.http.post('https://api.notion.com/v1/pages', {
          parent: { database_id: databaseId },
          properties,
          children: children || [],
        }, { headers: this.headers }),
      );

      this.logger.log(`Created Notion page: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error('Failed to create Notion page', error);
      return null;
    }
  }

  async updatePage(pageId: string, properties: Record<string, unknown>): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      await firstValueFrom(
        this.http.patch(`https://api.notion.com/v1/pages/${pageId}`, {
          properties,
        }, { headers: this.headers }),
      );

      this.logger.log(`Updated Notion page: ${pageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update Notion page ${pageId}`, error);
      return false;
    }
  }

  async syncProject(projectId: string, data: { name: string; status: string; phase?: string }, databaseId: string): Promise<boolean> {
    const properties = {
      'Name': { title: [{ text: { content: data.name } }] },
      'Status': { status: { name: data.status } },
      'Project ID': { rich_text: [{ text: { content: projectId } }] },
    };

    if (data.phase) {
      Object.assign(properties, {
        'Phase': { select: { name: data.phase } },
      });
    }

    const pageId = await this.createPage(databaseId, properties);
    return !!pageId;
  }
}
