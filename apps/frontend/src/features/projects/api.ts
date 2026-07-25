import { API_BASE_URL } from '@/config/constants';

const BASE = `${API_BASE_URL}/api/projects`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Project API error ${response.status}: ${body || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export interface CreateProjectRequest {
  title: string;
  slug: string;
  description?: string;
  client?: string;
  services?: string[];
}

export interface CreateProjectResponse {
  slug: string;
  strapiId: number;
  odooId: number | null;
}

export interface UpdateStatusResponse {
  slug: string;
  status: string;
}

export const projectsApi = {
  /**
   * Create a new project in both Strapi and Odoo.
   * POST /api/projects
   */
  createProject: (data: CreateProjectRequest) =>
    request<CreateProjectResponse>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Update a project's live status and write it back to Odoo.
   * PATCH /api/projects/:slug/status
   */
  updateStatus: (slug: string, status: string) =>
    request<UpdateStatusResponse>(`/${encodeURIComponent(slug)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
