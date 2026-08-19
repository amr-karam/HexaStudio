import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostgresTools } from './postgres.tools';
import { Workspace } from '../../../workspaces/entities/workspace.entity';
import { Task, TaskStatus } from '../../../workspaces/entities/task.entity';

import { User } from '../../../users/entities/user.entity';

describe('PostgresTools', () => {
  let tools: PostgresTools;
  let mockWorkspaceRepo: Partial<Repository<Workspace>>;
  let mockTaskRepo: Partial<Repository<Task>>;

  const mockWorkspace = (overrides = {}): Workspace => ({
    id: 'ws-123',
    name: 'Test Project',
    slug: 'test-project',
    status: 'active',
    description: 'A test project',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    owner: { id: 'user-1' } as unknown as User,
    client: null as unknown as User,
    tasks: [],
    channels: [],
    ...overrides,
  });

  const mockTask = (overrides = {}): Task => ({
    id: 'task-456',
    title: 'Design Homepage',
    description: 'Redesign the homepage',
    status: TaskStatus.TODO,
    workspace: mockWorkspace(),
    assignee: { id: 'user-1' } as unknown as User,
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    ...overrides,
  });

  beforeEach(async () => {
    mockWorkspaceRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        findOne: jest.fn(),
      }),
      findOne: jest.fn(),
    };

    mockTaskRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        select: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      }),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresTools,
        { provide: getRepositoryToken(Workspace), useValue: mockWorkspaceRepo },
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
      ],
    }).compile();

    tools = module.get<PostgresTools>(PostgresTools);
  });

  describe('getAllTools', () => {
    it('should return all 4 tools', () => {
      const allTools = tools.getAllTools();
      expect(allTools).toHaveLength(4);
      expect(allTools.map(t => t.definition.name)).toEqual(
        ['query_projects', 'query_tasks', 'create_task', 'team_stats'],
      );
    });
  });

  describe('queryProjectsTool', () => {
    it('should search projects by name with ILIKE', async () => {
      const qb = mockWorkspaceRepo.createQueryBuilder!('workspace');
      const mockGetMany = qb.getMany as jest.Mock;
      mockGetMany.mockResolvedValue([mockWorkspace()]);

      (mockTaskRepo.count as jest.Mock)
        .mockResolvedValueOnce(3) // taskCount
        .mockResolvedValueOnce(1); // overdue

      const tool = tools.queryProjectsTool();
      const result = await tool.handler({ search: 'Test' });

      expect(qb.where).toHaveBeenCalledWith('workspace.name ILIKE :search', {
        search: '%Test%',
      });
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Test Project');
      expect(parsed[0].taskCount).toBe(3);
      expect(parsed[0].overdueCount).toBe(1);
    });

    it('should filter by status when provided', async () => {
      const qb = mockWorkspaceRepo.createQueryBuilder!('workspace');
      const mockGetMany = qb.getMany as jest.Mock;
      mockGetMany.mockResolvedValue([]);

      const tool = tools.queryProjectsTool();
      await tool.handler({ status: 'completed' });

      expect(qb.andWhere).toHaveBeenCalledWith('workspace.status = :status', {
        status: 'completed',
      });
    });

    it('should use default limit of 25', async () => {
      const qb = mockWorkspaceRepo.createQueryBuilder!('workspace');
      const mockGetMany = qb.getMany as jest.Mock;
      mockGetMany.mockResolvedValue([]);

      const tool = tools.queryProjectsTool();
      await tool.handler({});

      expect(qb.limit).toHaveBeenCalledWith(25);
    });
  });

  describe('queryTasksTool', () => {
    it('should search tasks by project name', async () => {
      const qb = mockTaskRepo.createQueryBuilder!('task');
      const mockGetMany = qb.getMany as jest.Mock;
      mockGetMany.mockResolvedValue([
        mockTask({ title: 'Design Homepage', status: TaskStatus.TODO }),
      ]);

      const tool = tools.queryTasksTool();
      const result = await tool.handler({ projectName: 'Test' });

      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('task.workspace', 'workspace');
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe('Design Homepage');
    });

    it('should filter by status', async () => {
      const qb = mockTaskRepo.createQueryBuilder!('task');

      const tool = tools.queryTasksTool();
      await tool.handler({ status: 'DONE' });

      expect(qb.andWhere).toHaveBeenCalledWith('task.status = :status', {
        status: 'DONE',
      });
    });

    it('should filter overdue tasks when includeOverdue=true', async () => {
      const qb = mockTaskRepo.createQueryBuilder!('task');

      const tool = tools.queryTasksTool();
      await tool.handler({ includeOverdue: 'true' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('task.dueDate < :now'),
        expect.objectContaining({
          now: expect.any(Date),
          done: TaskStatus.DONE,
        }),
      );
    });
  });

  describe('createTaskTool', () => {
    it('should create a task when project exists', async () => {
      const mockProject = mockWorkspace();
      (mockWorkspaceRepo.findOne as jest.Mock).mockResolvedValue(mockProject);

      const mockTaskObj = { ...mockTask(), id: 'new-task-id' };
      (mockTaskRepo.create as jest.Mock).mockReturnValue(mockTaskObj);
      (mockTaskRepo.save as jest.Mock).mockResolvedValue(mockTaskObj);

      const tool = tools.createTaskTool();
      const result = await tool.handler({
        title: 'New Task',
        description: 'Task description',
        projectName: 'Test Project',
        dueDate: '2024-12-31',
      });

      expect(mockWorkspaceRepo.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Project' },
      });
      expect(mockTaskRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          description: 'Task description',
          dueDate: new Date('2024-12-31'),
          status: TaskStatus.TODO,
        }),
      );
      const parsed = JSON.parse(result);
      expect(parsed.id).toBe('new-task-id');
      expect(parsed.message).toContain('New Task');
    });

    it('should return error message when project not found', async () => {
      (mockWorkspaceRepo.findOne as jest.Mock).mockResolvedValue(null);

      const tool = tools.createTaskTool();
      const result = await tool.handler({
        title: 'New Task',
        projectName: 'Nonexistent Project',
      });

      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('not found');
    });
  });

  describe('getTeamStatsTool', () => {
    it('should return team productivity statistics', async () => {
      const qb = mockTaskRepo.createQueryBuilder!('task');
      const mockGetRawMany = qb.getRawMany as jest.Mock;
      mockGetRawMany.mockResolvedValue([
        { task_status: 'DONE', count: '15' },
        { task_status: 'TODO', count: '5' },
        { task_status: 'IN_PROGRESS', count: '3' },
      ]);

      const tool = tools.getTeamStatsTool();
      const result = await tool.handler({ dateRange: 'last_30_days' });

      const parsed = JSON.parse(result);
      expect(parsed.total_tasks).toBe(23);
      expect(parsed.completed_tasks).toBe(15);
      expect(parsed.overdue_tasks).toBe(0);
      expect(parsed.completion_rate).toBe(65);
      expect(parsed.by_status).toEqual({
        DONE: 15,
        TODO: 5,
        IN_PROGRESS: 3,
      });
    });

    it('should handle empty results', async () => {
      const qb = mockTaskRepo.createQueryBuilder!('task');
      const mockGetRawMany = qb.getRawMany as jest.Mock;
      mockGetRawMany.mockResolvedValue([]);

      const tool = tools.getTeamStatsTool();
      const result = await tool.handler({});

      const parsed = JSON.parse(result);
      expect(parsed.total_tasks).toBe(0);
      expect(parsed.completion_rate).toBe(0);
    });
  });
});
