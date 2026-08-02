import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { Task } from './entities/task.entity';
import { CacheManagerService } from '../../common/cache/cache.service';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly cacheManager: CacheManagerService,
  ) {}

  async findAll() {
    const cacheKey = this.cacheManager.generateKey('workspaces:all');
    return this.cacheManager.watch(cacheKey, () => 
      this.workspaceRepo.find({ relations: ['owner'] })
    );
  }

  async findOne(id: string) {
    const cacheKey = this.cacheManager.generateKey('workspace:id', id);
    return this.cacheManager.watch(cacheKey, () => 
      this.workspaceRepo.findOne({ 
        where: { id }, 
        relations: ['owner', 'tasks'] 
      })
    );
  }

  async findByClient(clientId: string) {
    const cacheKey = this.cacheManager.generateKey('workspaces:client', clientId);
    return this.cacheManager.watch(cacheKey, () => 
      this.workspaceRepo.find({
        where: { client: { id: clientId } },
        relations: ['client'],
      })
    );
  }

  async findByClientIdAndId(clientId: string, workspaceId: string) {
    const cacheKey = this.cacheManager.generateKey('workspace:client:id', clientId, workspaceId);
    return this.cacheManager.watch(cacheKey, () => 
      this.workspaceRepo.findOne({
        where: { id: workspaceId, client: { id: clientId } },
        relations: ['tasks', 'tasks.assignee', 'client'],
      })
    );
  }

  async create(data: Partial<Workspace>) {
    const workspace = this.workspaceRepo.create(data);
    const savedWorkspace = await this.workspaceRepo.save(workspace);
    
    // Clear relevant caches
    await this.cacheManager.del(this.cacheManager.generateKey('workspaces:all'));
    await this.cacheManager.delByPattern('workspaces:client:*'); // Clear all client workspace caches
    // Note: The specific workspace cache will be populated on next fetch
    
    return savedWorkspace;
  }

  async getTasks(workspaceId: string) {
    const cacheKey = this.cacheManager.generateKey('workspace:tasks', workspaceId);
    return this.cacheManager.watch(cacheKey, () => 
      this.taskRepo.find({ where: { workspace: { id: workspaceId } }, relations: ['assignee'] })
    );
  }

  async updateTask(id: string, data: Partial<Task>) {
    await this.taskRepo.update(id, data);
    
    // We would need to know which workspace this task belongs to to clear the specific cache
    // For now, we'll clear all workspace task caches (could be optimized)
    await this.cacheManager.delByPattern('workspace:tasks:*');
    
    return this.taskRepo.findOne({ where: { id } });
  }
}