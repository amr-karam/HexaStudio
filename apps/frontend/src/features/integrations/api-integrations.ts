'use client';

import { API_BASE_URL } from '@/config/constants';

interface IntegrationStatus {
  configured: boolean;
  provider: string;
}

interface NotionDatabase {
  id: string;
  title: string;
  url: string;
}

interface NotionPage {
  id: string;
  title: string;
  status: string;
  lastEditedTime: string;
  url: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface JiraIssue {
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

const BASE = `${API_BASE_URL}/api/integrations`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`Integration API error: ${res.status}`);
  return res.json();
}

export const notionApi = {
  status: () => request<IntegrationStatus>('/notion/status'),
  databases: () => request<NotionDatabase[]>('/notion/databases'),
  pages: (dbId: string) => request<NotionPage[]>(`/notion/databases/${dbId}/pages`),
  sync: (dbId: string, data: { projectId: string; name: string; status: string }) =>
    request<{ success: boolean }>(`/notion/databases/${dbId}/sync`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const jiraApi = {
  status: () => request<IntegrationStatus>('/jira/status'),
  projects: () => request<JiraProject[]>('/jira/projects'),
  issues: (projectKey: string) => request<JiraIssue[]>(`/jira/projects/${projectKey}/issues`),
  createIssue: (projectKey: string, data: { summary: string; description?: string }) =>
    request<{ success: boolean; issueKey?: string }>(`/jira/projects/${projectKey}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
