import { API_BASE_URL } from '@/config/constants';

export interface PortalProjectStatus {
  phase: string;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  date?: string;
}

export interface PortalDocument {
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface PortalInvoice {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface ProjectRequest {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'completed';
  createdAt: string;
}

export interface PortalData {
  project: {
    title: string;
    category: string;
    status: string;
  };
  timeline: PortalProjectStatus[];
  documents: PortalDocument[];
  invoices: PortalInvoice[];
  lead: {
    name: string;
    role: string;
    email: string;
    avatar: string;
  };
}

export const portalService = {
  async getDemoData(): Promise<PortalData> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/portal/demo`, {
        credentials: 'include',
      });
    } catch {
      throw new Error('Failed to fetch portal data');
    }
    if (!response.ok) throw new Error('Failed to fetch portal data');
    return response.json();
  },

  async sendRequest(requestData: Partial<ProjectRequest>): Promise<ProjectRequest> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });
    } catch {
      throw new Error('Failed to send request');
    }
    if (!response.ok) throw new Error('Failed to send request');
    return response.json();
  },

  async getClientRequests(clientId: string): Promise<{ data: ProjectRequest[]; meta: unknown }> {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/requests/client/${clientId}`, {
        credentials: 'include',
      });
    } catch {
      throw new Error('Failed to fetch requests');
    }
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },
};
