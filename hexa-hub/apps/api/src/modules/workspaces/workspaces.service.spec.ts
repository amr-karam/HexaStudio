import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WorkspacesService } from './workspaces.service';
import { Workspace } from './entities/workspace.entity';
import { Task } from './entities/task.entity';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let workspaceRepo: jest.Mocked<Repository<Workspace>>;
  let taskRepo: jest.Mocked<Repository<Task>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Task),
          useValue: { find: jest.fn(), findOne: jest.fn(), update: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    workspaceRepo = module.get(getRepositoryToken(Workspace));
    taskRepo = module.get(getRepositoryToken(Task));
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('returns workspace with owner and tasks', async () => {
      const ws = { id: 'w1', name: 'Alpha' } as Workspace;
      workspaceRepo.findOne.mockResolvedValue(ws);

      const result = await service.findOne('w1');

      expect(workspaceRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'w1' },
        relations: ['owner', 'tasks'],
      });
      expect(result).toEqual(ws);
    });

    it('throws NotFoundException when missing', async () => {
      workspaceRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByClientIdAndId (tenant isolation)', () => {
    it('scopes the query to both workspace id and client id', async () => {
      const ws = { id: 'w1' } as Workspace;
      workspaceRepo.findOne.mockResolvedValue(ws);

      await service.findByClientIdAndId('client-9', 'w1');

      expect(workspaceRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'w1', client: { id: 'client-9' } },
        relations: ['tasks', 'tasks.assignee', 'client'],
      });
    });

    it('denies cross-tenant access with a single error message', async () => {
      workspaceRepo.findOne.mockResolvedValue(null);
      await expect(service.findByClientIdAndId('wrong-client', 'w1')).rejects.toThrow(
        'Workspace not found or access denied',
      );
    });
  });

  describe('tasks', () => {
    it('getTasks scopes by workspace', async () => {
      taskRepo.find.mockResolvedValue([]);
      await service.getTasks('w1');
      expect(taskRepo.find).toHaveBeenCalledWith({
        where: { workspace: { id: 'w1' } },
        relations: ['assignee'],
      });
    });

    it('updateTask updates then reloads', async () => {
      const updated = { id: 't1', title: 'Done' } as Task;
      taskRepo.update.mockResolvedValue({ affected: 1 } as never);
      taskRepo.findOne.mockResolvedValue(updated);

      const result = await service.updateTask('t1', { title: 'Done' });

      expect(taskRepo.update).toHaveBeenCalledWith('t1', { title: 'Done' });
      expect(taskRepo.findOne).toHaveBeenCalledWith({ where: { id: 't1' } });
      expect(result).toEqual(updated);
    });
  });
});
