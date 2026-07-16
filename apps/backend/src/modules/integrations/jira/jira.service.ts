import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getEnv } from '../../../config/env';

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  assignee?: string;
  priority?: string;
  created: string;
  updated: string;
  url: string;
}

@Injectable()
export class JiraService {
  private readonly logger = new Logger(JiraService.name);

  constructor(private readonly http: HttpService) {}

  private get baseUrl(): string | undefined {
    return getEnv().JIRA_BASE_URL;
  }

  private get email(): string | undefined {
    return getEnv().JIRA_EMAIL;
  }

  private get apiToken(): string | undefined {
    return getEnv().JIRA_API_TOKEN;
  }

  get isConfigured(): boolean {
    return !!(this.baseUrl && this.email && this.apiToken);
  }

  private get authHeaders() {
    const token = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getProjects(): Promise<Array<{ id: string; key: string; name: string }>> {
    if (!this.isConfigured) return [];

    try {
      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/rest/api/3/project`, { headers: this.authHeaders }),
      );

      return response.data.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        key: p.key as string,
        name: p.name as string,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch Jira projects', error);
      return [];
    }
  }

  async getIssues(projectKey: string, maxResults = 50): Promise<JiraIssue[]> {
    if (!this.isConfigured) return [];

    try {
      const jql = `project = "${projectKey}" ORDER BY updated DESC`;
      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/rest/api/3/search`, {
          headers: this.authHeaders,
          params: { jql, maxResults, fields: 'summary,status,assignee,priority,created,updated' },
        }),
      );

      return response.data.issues.map((issue: Record<string, unknown>) => {
        const fields = issue.fields as Record<string, unknown>;
        return {
          id: issue.id as string,
          key: issue.key as string,
          summary: fields.summary as string,
          status: (fields.status as { name?: string })?.name || 'Unknown',
          assignee: (fields.assignee as { displayName?: string })?.displayName,
          priority: (fields.priority as { name?: string })?.name,
          created: fields.created as string,
          updated: fields.updated as string,
          url: `${this.baseUrl}/browse/${issue.key}`,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to fetch Jira issues for ${projectKey}`, error);
      return [];
    }
  }

  async createIssue(projectKey: string, summary: string, description?: string, issueType = 'Task'): Promise<string | null> {
    if (!this.isConfigured) return null;

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/rest/api/3/issue`, {
          fields: {
            project: { key: projectKey },
            summary,
            description: description ? {
              type: 'doc',
              version: 1,
              content: [{ type: 'paragraph', content: [{ type: 'text', text: { content: description } }] }],
            } : undefined,
            issuetype: { name: issueType },
          },
        }, { headers: this.authHeaders }),
      );

      this.logger.log(`Created Jira issue: ${response.data.key}`);
      return response.data.key;
    } catch (error) {
      this.logger.error('Failed to create Jira issue', error);
      return null;
    }
  }

  async transitionIssue(issueKey: string, transitionName: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      const transitionsRes = await firstValueFrom(
        this.http.get(`${this.baseUrl}/rest/api/3/issue/${issueKey}/transitions`, { headers: this.authHeaders }),
      );

      const transition = transitionsRes.data.transitions.find(
        (t: { name: string }) => t.name.toLowerCase() === transitionName.toLowerCase(),
      );

      if (!transition) {
        this.logger.warn(`Transition "${transitionName}" not found for ${issueKey}`);
        return false;
      }

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/rest/api/3/issue/${issueKey}/transitions`, {
          transition: { id: transition.id },
        }, { headers: this.authHeaders }),
      );

      this.logger.log(`Transitioned ${issueKey} to "${transitionName}"`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to transition ${issueKey}`, error);
      return false;
    }
  }
}
