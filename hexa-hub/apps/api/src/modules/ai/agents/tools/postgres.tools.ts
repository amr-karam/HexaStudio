import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Not, LessThan } from 'typeorm';
import { Workspace } from '../../../workspaces/entities/workspace.entity';
import { Task, TaskStatus } from '../../../workspaces/entities/task.entity';
import { createTool, formatResults } from './tool-schemas';
import { AgentTool } from '../types/agent.types';

/**
 * PostgreSQL tools — used by the Project Assistant Agent.
 *
 * These tools query the TypeORM repositories for workspaces (projects),
 * tasks, and workload metrics.
 */
@Injectable()
export class PostgresTools {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  /** Query projects by name, status, type, or assignee */
  queryProjectsTool(): AgentTool {
    return createTool(
      'query_projects',
      'Search for projects by name, status, or assignee. Returns project name, status, budget, and task count.',
      {
        search: { type: 'string', description: 'Search term (project name)' },
        status: { type: 'string', description: 'Project status: active, archived, or completed', enum: ['active', 'archived', 'completed'] },
        assigneeId: { type: 'string', description: 'User UUID of assignee' },
        limit: { type: 'string', description: 'Maximum records (default 25)', default: '25' },
      },
      [],
      async (args) => {
        const conditions: FindManyOptions<Workspace>['where'] = {};
        const params: Record<string, unknown> = {};

        if (args.search) {
          params['search'] = `%${args.search}%`;
        }
        if (args.status) {
          conditions.status = args.status as 'active' | 'archived' | 'completed';
        }

        let query = this.workspaceRepo.createQueryBuilder('workspace');

        if (args.search) {
          query = query.where('workspace.name ILIKE :search', params);
        }
        if (args.status) {
          query = query.andWhere('workspace.status = :status', { status: args.status });
        }

        const limit = args.limit ? parseInt(args.limit, 10) : 25;
        const data = await query.limit(limit).getMany();

        const results = await Promise.all(data.map(async (project) => {
          const taskCount = await this.taskRepo.count({ where: { workspace: { id: project.id } } });
          const overdue = await this.taskRepo.count({
            where: {
              workspace: { id: project.id },
              status: Not(TaskStatus.DONE as string) as never,
              dueDate: LessThan(new Date()),
            } as never,
          });
          return {
            id: project.id,
            name: project.name,
            slug: project.slug,
            status: project.status,
            description: project.description,
            taskCount: Number(taskCount),
            overdueCount: Number(overdue),
            createdAt: project.createdAt.toISOString(),
          };
        }));

        return formatResults(results, limit);
      },
    );
  }

  /** Query tasks by project, assignee, status, or search */
  queryTasksTool(): AgentTool {
    return createTool(
      'query_tasks',
      'Search for tasks by project name, assignee, status, keyword, or overdue status',
      {
        projectName: { type: 'string', description: 'Project (workspace) name to filter by' },
        assigneeId: { type: 'string', description: 'User UUID of assignee' },
        status: { type: 'string', description: 'Task status: TODO, IN_PROGRESS, REVIEW, or DONE', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] },
        search: { type: 'string', description: 'Search term (task title)' },
        includeOverdue: { type: 'string', description: 'Include only overdue tasks (true/false)', enum: ['true', 'false'] },
        limit: { type: 'string', description: 'Maximum records (default 25)', default: '25' },
      },
      [],
      async (args) => {
        const limit = args.limit ? parseInt(args.limit, 10) : 25;

        let query = this.taskRepo.createQueryBuilder('task')
          .leftJoinAndSelect('task.workspace', 'workspace');

        if (args.projectName) {
          query = query.andWhere('workspace.name ILIKE :projectName', { projectName: `%${args.projectName}%` });
        }
        if (args.assigneeId) {
          query = query.andWhere('task.assigneeId = :assigneeId', { assigneeId: args.assigneeId });
        }
        if (args.status) {
          query = query.andWhere('task.status = :status', { status: args.status as TaskStatus });
        }
        if (args.search) {
          query = query.andWhere('task.title ILIKE :search', { search: `%${args.search}%` });
        }
        if (args.includeOverdue === 'true') {
          query = query.andWhere('task.dueDate < :now AND task.status != :done', {
            now: new Date(),
            done: TaskStatus.DONE,
          });
        }

        const data = await query.limit(limit).getMany();
        return formatResults(data, limit);
      },
    );
  }

  /** Create a new task */
  createTaskTool(): AgentTool {
    return createTool(
      'create_task',
      'Create a new task under a project (workspace)',
      {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        projectName: { type: 'string', description: 'Project (workspace) name to add the task to' },
        assigneeId: { type: 'string', description: 'User UUID to assign the task to' },
        dueDate: { type: 'string', description: 'Due date (YYYY-MM-DD)' },
        priority: { type: 'string', description: 'Priority level', enum: ['low', 'medium', 'high', 'urgent'] },
      },
      ['title', 'projectName'],
      async (args) => {
        const project = await this.workspaceRepo.findOne({ where: { name: args.projectName } });
        if (!project) {
          return JSON.stringify({ error: `Project "${args.projectName}" not found` });
        }

        const task = this.taskRepo.create({
          title: args.title,
          description: args.description ?? '',
          workspace: project,
          dueDate: args.dueDate ? new Date(args.dueDate) : undefined,
          status: TaskStatus.TODO,
        });

        const saved = await this.taskRepo.save(task);
        return JSON.stringify({ id: saved.id, message: `Task "${args.title}" created with ID ${saved.id}` });
      },
    );
  }

  /** Get team productivity metrics */
  getTeamStatsTool(): AgentTool {
    return createTool(
      'team_stats',
      'Get team productivity metrics: completed tasks, overdue tasks, workload distribution',
      {
        projectId: { type: 'string', description: 'Project (workspace) ID to scope stats' },
        dateRange: { type: 'string', description: 'Date range (e.g. "last_30_days", "this_week")' },
      },
      [],
      async (args) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let qb = this.taskRepo.createQueryBuilder('task');

        if (args.dateRange === 'last_30_days') {
          qb = qb.where('task.createdAt >= :since', { since: thirtyDaysAgo });
        }
        if (args.projectId) {
          qb = qb.andWhere('task.workspaceId = :pid', { pid: args.projectId });
        }

        const stats = await qb
          .select(['task.status', 'COUNT(*) as count'])
          .addGroupBy('task.status')
          .getRawMany();

        const counts: Record<string, number> = {};
        let total = 0;
        for (const row of stats) {
          counts[row.task_status] = Number(row.count);
          total += Number(row.count);
        }

        const completed = counts[TaskStatus.DONE] || counts['completed'] || 0;
        const overdue = counts['overdue'] || 0;

        return JSON.stringify({
          total_tasks: total,
          completed_tasks: completed,
          overdue_tasks: overdue,
          completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
          by_status: counts,
        });
      },
    );
  }

  /** Get all available tools */
  getAllTools(): AgentTool[] {
    return [
      this.queryProjectsTool(),
      this.queryTasksTool(),
      this.createTaskTool(),
      this.getTeamStatsTool(),
    ];
  }
}
