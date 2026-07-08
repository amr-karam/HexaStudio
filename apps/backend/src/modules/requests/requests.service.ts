import { Injectable, NotFoundException } from '@nestjs/common';

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

@Injectable()
export class RequestsService {
  private requests: ProjectRequest[] = [];

  async createRequest(data: Partial<ProjectRequest>): Promise<ProjectRequest> {
    const newRequest: ProjectRequest = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      projectId: data.projectId || 'default',
      clientId: data.clientId || 'default',
      title: data.title || 'Untitled Request',
      description: data.description || '',
      priority: data.priority || 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.requests.push(newRequest);
    return newRequest;
  }

  async getRequestsByClient(clientId: string): Promise<ProjectRequest[]> {
    return this.requests.filter(r => r.clientId === clientId);
  }

  async updateRequestStatus(id: string, status: ProjectRequest['status']): Promise<ProjectRequest> {
    const request = this.requests.find(r => r.id === id);
    if (!request) throw new NotFoundException(`Request ${id} not found`);
    
    request.status = status;
    return request;
  }

  async findAll(): Promise<ProjectRequest[]> {
    return this.requests;
  }
}
