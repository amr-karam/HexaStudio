import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { Task } from './entities/task.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async findAll() {
    return this.workspaceRepo.find({ relations: ['owner'] });
  }

  async findOne(id: string) {
    const workspace = await this.workspaceRepo.findOne({ 
      where: { id }, 
      relations: ['owner', 'tasks'] 
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async findByClient(clientId: string) {
    return this.workspaceRepo.find({
      where: { client: { id: clientId } },
      relations: ['client'],
    });
  }

  async findByClientIdAndId(clientId: string, workspaceId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId, client: { id: clientId } },
      relations: ['tasks', 'tasks.assignee', 'client'],
    });
    if (!workspace) throw new NotFoundException('Workspace not found or access denied');
    return workspace;
  }

  async create(data: Partial<Workspace>) {
    const workspace = this.workspaceRepo.create(data);
    return this.workspaceRepo.save(workspace);
  }

  async getTasks(workspaceId: string) {
    return this.taskRepo.find({ where: { workspace: { id: workspaceId } }, relations: ['assignee'] });
  }

  async updateTask(id: string, data: Partial<Task>) {
    await this.taskRepo.update(id, data);
    return this.taskRepo.findOne({ where: { id } });
  }
}
