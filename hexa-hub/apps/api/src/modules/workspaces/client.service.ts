import { Injectable } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';

@Injectable()
export class ClientService {
  constructor(private readonly workspacesService: WorkspacesService) {}

  async getWorkspaces(clientId: string) {
    return this.workspacesService.findByClient(clientId);
  }

  async getWorkspace(clientId: string, workspaceId: string) {
    return this.workspacesService.findByClientIdAndId(clientId, workspaceId);
  }
}
