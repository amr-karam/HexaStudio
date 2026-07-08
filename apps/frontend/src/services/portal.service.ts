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
    const response = await fetch(`${API_BASE_URL}/portal/demo`);
    if (!response.ok) throw new Error('Failed to fetch portal data');
    return response.json();
  },

  async sendRequest(requestData: Partial<ProjectRequest>): Promise<ProjectRequest> {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
    if (!response.ok) throw new Error('Failed to send request');
    return response.json();
  },

  async getClientRequests(clientId: string): Promise<ProjectRequest[]> {
    const response = await fetch(`${API_BASE_URL}/requests/client/${clientId}`);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },
};
