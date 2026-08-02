import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowWiringService } from './workflow-wiring.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowSeeder } from './workflow.seeder';
import { WorkflowRepository } from './workflow.repository';
import { OdooApiService } from '../odoo/odoo-api.service';
import { EventBus } from '../realtime/event-bus.service';

const mockEngine = {
  registerService: vi.fn(),
  listWorkflows: vi.fn(),
  createWorkflow: vi.fn(),
};

const mockOdooApi = {
  getCrmPipeline: vi.fn(),
  createLead: vi.fn(),
  createProject: vi.fn(),
};

const mockRepository = {
  createWorkflow: vi.fn(),
  listWorkflows: vi.fn(),
  getWorkflow: vi.fn(),
  updateWorkflow: vi.fn(),
  deleteWorkflow: vi.fn(),
  saveExecution: vi.fn(),
  updateExecution: vi.fn(),
  getExecution: vi.fn(),
  listExecutions: vi.fn(),
  pruneExecutions: vi.fn(),
};

const mockEventBus = {
  on: vi.fn(),
  emit: vi.fn(),
};

describe('WorkflowWiringService', () => {
  let service: WorkflowWiringService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowWiringService,
        { provide: WorkflowEngineService, useValue: mockEngine },
        { provide: OdooApiService, useValue: mockOdooApi },
      ],
    }).compile();

    service = module.get<WorkflowWiringService>(WorkflowWiringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should register OdooApiService under every domain module alias', () => {
      service.onModuleInit();

      const expectedAliases = [
        'crm',
        'projects',
        'helpdesk',
        'accounting',
        'employees',
        'timesheets',
        'contacts',
        'calendar',
        'knowledge',
      ];

      expect(mockEngine.registerService).toHaveBeenCalledTimes(expectedAliases.length);
      for (const alias of expectedAliases) {
        expect(mockEngine.registerService).toHaveBeenCalledWith(alias, mockOdooApi);
      }
    });
  });
});

describe('WorkflowSeeder', () => {
  let seeder: WorkflowSeeder;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEngine.listWorkflows.mockResolvedValue([]);
    mockEngine.createWorkflow.mockImplementation(async (dto: { name: string }) => ({
      id: 'wf-1',
      name: dto.name,
      description: '',
      trigger: { type: 'event', event: 'manual' },
      steps: [],
      strategy: 'sequential',
      enabled: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowSeeder,
        { provide: WorkflowEngineService, useValue: mockEngine },
      ],
    }).compile();

    seeder = module.get<WorkflowSeeder>(WorkflowSeeder);
  });

  describe('onModuleInit', () => {
    it('should seed default workflows when none exist', async () => {
      await seeder.onModuleInit();

      // 3 seed workflows in workflow.seeder.ts
      expect(mockEngine.createWorkflow).toHaveBeenCalledTimes(3);
      expect(mockEngine.createWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Lead → Create Project' }),
      );
    });

    it('should not duplicate workflows that already exist', async () => {
      mockEngine.listWorkflows.mockResolvedValue([
        { id: 'wf-existing', name: 'New Lead → Create Project' },
      ]);

      await seeder.onModuleInit();

      // Only 2 of the 3 should be created (the existing one skipped)
      expect(mockEngine.createWorkflow).toHaveBeenCalledTimes(2);
    });

    it('should continue seeding when one workflow fails', async () => {
      mockEngine.createWorkflow.mockImplementationOnce(async () => {
        throw new Error('boom');
      });

      await seeder.onModuleInit();

      // First create fails, remaining 2 succeed
      expect(mockEngine.createWorkflow).toHaveBeenCalledTimes(3);
    });
  });
});

describe('WorkflowEngineService (integration)', () => {
  let engine: WorkflowEngineService;
  let repository: WorkflowRepository;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockRepository.listWorkflows.mockResolvedValue([]);
    mockRepository.createWorkflow.mockImplementation(
      async (dto: Record<string, unknown>) => ({
        id: 'wf-test',
        name: dto.name as string,
        description: (dto.description as string) ?? '',
        trigger: dto.trigger,
        steps: dto.steps,
        strategy: (dto.strategy as string) ?? 'sequential',
        enabled: (dto.enabled as boolean) ?? true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    );
    mockRepository.getWorkflow.mockImplementation(
      async (id: string) => {
        if (id !== 'wf-test') return null;
        return {
          id: 'wf-test',
          name: 'Test Workflow',
          description: '',
          trigger: { type: 'event', event: 'lead.created' },
          steps: [
            {
              id: 'transform',
              name: 'Transform',
              type: 'transform',
              params: {
                mapping: { name: 'trigger.lead.name' },
                targetContextKey: 'leadData',
              },
              nextStepId: 'action',
            },
            {
              id: 'action',
              name: 'Create project',
              type: 'action',
              params: {
                module: 'projects',
                method: 'createProject',
                args: { data: '$.leadData' },
              },
            },
          ],
          strategy: 'sequential',
          enabled: true,
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
    );
    mockRepository.saveExecution.mockResolvedValue(undefined);
    mockRepository.updateExecution.mockResolvedValue(undefined);
    mockRepository.pruneExecutions.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowEngineService,
        { provide: WorkflowRepository, useValue: mockRepository },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    engine = module.get<WorkflowEngineService>(WorkflowEngineService);
    repository = module.get<WorkflowRepository>(WorkflowRepository);

    // Register a fake "projects" service to simulate the wiring
    const fakeProjectsService = {
      createProject: vi.fn().mockResolvedValue(101),
    };
    engine.registerService('projects', fakeProjectsService);
  });

  it('should be defined', () => {
    expect(engine).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('executeWorkflow', () => {
    it('should execute transform → action steps sequentially and complete', async () => {
      const execution = await engine.executeWorkflow('wf-test', {
        lead: { name: 'Acme Corp' },
      });

      expect(execution.status).toBe('completed');
      expect(execution.steps).toHaveLength(2);
      expect(execution.steps[0].status).toBe('completed');
      expect(execution.steps[1].status).toBe('completed');
      expect(execution.steps[1].result).toEqual({ result: 101 });
    });

    it('should mark execution as failed when action step fails', async () => {
      const fakeProjectsService = {
        createProject: vi.fn().mockRejectedValue(new Error('odoo unreachable')),
      };
      engine.registerService('projects', fakeProjectsService);

      const execution = await engine.executeWorkflow('wf-test', {
        lead: { name: 'Acme Corp' },
      });

      expect(execution.status).toBe('failed');
      expect(execution.error).toContain('Create project');
    });
  });
});
