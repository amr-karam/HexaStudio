import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AgentOrchestrator } from './agents.service';
import { ErpAnalystAgent } from './agents/erp-analyst.agent';
import { ProjectAssistantAgent } from './agents/project-assistant.agent';
import { SalesAgent } from './agents/sales.agent';
import { KnowledgeAgent } from './agents/knowledge.agent';
import { BaseAgent } from './base-agent';
import { AgentEvent } from './types/agent.types';

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;
  let mockAgents: { [key: string]: jest.Mocked<BaseAgent> };

  beforeEach(async () => {
    mockAgents = {
      erpAnalyst: {
        getPersona: jest.fn().mockReturnValue({
          name: 'erp-analyst',
          description: 'ERP Analyst',
          color: 'var(--color-metric-amber)',
          icon: '📊',
          tools: ['odoo_search_read', 'odoo_financial_query'],
          systemPrompt: 'You are the ERP Analyst',
        }),
        invoke: jest.fn().mockResolvedValue({
          content: 'Q3 revenue was €1.2M',
          metadata: {
            agentName: 'erp-analyst',
            toolsUsed: ['odoo_search_read'],
            confidence: 0.95,
            sources: ['odoo'],
            executionTimeMs: 150,
          },
        }),
        stream: jest.fn().mockImplementation(async function* () {
          yield 'Q3 revenue was €1.2M';
        }),
      } as unknown as jest.Mocked<BaseAgent>,
      projectAssistant: {
        getPersona: jest.fn().mockReturnValue({
          name: 'project-assistant',
          description: 'Project Assistant',
          color: 'var(--color-info)',
          icon: '📋',
          tools: ['query_projects', 'query_tasks'],
          systemPrompt: 'You are the Project Assistant',
        }),
        invoke: jest.fn().mockResolvedValue({
          content: 'Project Alpha is 75% complete',
          metadata: {
            agentName: 'project-assistant',
            toolsUsed: ['query_projects'],
            confidence: 0.92,
            sources: ['postgres'],
            executionTimeMs: 100,
          },
        }),
        stream: jest.fn().mockImplementation(async function* () {
          yield 'Project Alpha is 75% complete';
        }),
      } as unknown as jest.Mocked<BaseAgent>,
      salesAgent: {
        getPersona: jest.fn().mockReturnValue({
          name: 'sales-agent',
          description: 'Sales Agent',
          color: 'var(--color-metric-emerald)',
          icon: '💼',
          tools: ['odoo_search_read', 'odoo_create_lead'],
          systemPrompt: 'You are the Sales Agent',
        }),
        invoke: jest.fn().mockResolvedValue({
          content: 'Created lead for Acme Corp',
          metadata: {
            agentName: 'sales-agent',
            toolsUsed: ['odoo_create_lead'],
            confidence: 0.98,
            sources: ['odoo'],
            executionTimeMs: 200,
          },
        }),
        stream: jest.fn().mockImplementation(async function* () {
          yield 'Created lead for Acme Corp';
        }),
      } as unknown as jest.Mocked<BaseAgent>,
      knowledgeAgent: {
        getPersona: jest.fn().mockReturnValue({
          name: 'knowledge-agent',
          description: 'Knowledge Agent',
          color: 'var(--color-metric-violet)',
          icon: '📚',
          tools: ['semantic_search', 'cms_search'],
          systemPrompt: 'You are the Knowledge Agent',
        }),
        invoke: jest.fn().mockResolvedValue({
          content: 'Found 3 related documents.',
          metadata: {
            agentName: 'knowledge-agent',
            toolsUsed: ['semantic_search'],
            confidence: 0.88,
            sources: ['qdrant'],
            executionTimeMs: 80,
          },
        }),
        stream: jest.fn().mockImplementation(async function* () {
          yield 'Found 3 related documents.';
        }),
      } as unknown as jest.Mocked<BaseAgent>,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentOrchestrator,
        { provide: ErpAnalystAgent, useValue: mockAgents.erpAnalyst },
        { provide: ProjectAssistantAgent, useValue: mockAgents.projectAssistant },
        { provide: SalesAgent, useValue: mockAgents.salesAgent },
        { provide: KnowledgeAgent, useValue: mockAgents.knowledgeAgent },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    orchestrator = module.get<AgentOrchestrator>(AgentOrchestrator);
  });

  describe('getAgentPersonas', () => {
    it('should return all 4 agent personas', () => {
      const personas = orchestrator.getAgentPersonas();
      expect(personas).toHaveLength(4);
      expect(personas.map(p => p.name)).toEqual([
        'erp-analyst',
        'project-assistant',
        'sales-agent',
        'knowledge-agent',
      ]);
    });
  });

  describe('getAgent', () => {
    it('should return the agent with matching name', () => {
      const agent = orchestrator.getAgent('erp-analyst');
      expect(agent).toBeDefined();
      expect(agent?.getPersona().name).toBe('erp-analyst');
    });

    it('should return undefined for unknown agent', () => {
      const agent = orchestrator.getAgent('nonexistent');
      expect(agent).toBeUndefined();
    });
  });

  describe('getDefaultAgent', () => {
    it('should return the knowledge agent', () => {
      const agent = orchestrator.getDefaultAgent();
      expect(agent.getPersona().name).toBe('knowledge-agent');
    });
  });

  describe('classifyIntent', () => {
    it('should route revenue queries to ERP Analyst', () => {
      const agent = orchestrator.classifyIntent('Show me Q3 revenue');
      expect(agent.getPersona().name).toBe('erp-analyst');
    });

    it('should route project queries to Project Assistant', () => {
      const agent = orchestrator.classifyIntent('What is the status of the HexaHub redesign?');
      expect(agent.getPersona().name).toBe('project-assistant');
    });

    it('should route sales queries to Sales Agent', () => {
      const agent = orchestrator.classifyIntent('Create a new lead for Acme Corp');
      expect(agent.getPersona().name).toBe('sales-agent');
    });

    it('should route unknown queries to Knowledge Agent', () => {
      const agent = orchestrator.classifyIntent('Tell me a joke');
      expect(agent.getPersona().name).toBe('knowledge-agent');
    });

    it('should route expense queries to ERP Analyst', () => {
      const agent = orchestrator.classifyIntent('What are our top expenses?');
      expect(agent.getPersona().name).toBe('erp-analyst');
    });

    it('should route task queries to Project Assistant', () => {
      const agent = orchestrator.classifyIntent('What tasks are overdue?');
      expect(agent.getPersona().name).toBe('project-assistant');
    });

    it('should route lead queries to Sales Agent', () => {
      const agent = orchestrator.classifyIntent('What opportunities are in the pipeline?');
      expect(agent.getPersona().name).toBe('sales-agent');
    });
  });

  describe('chat', () => {
    it('should route query to correct agent and return response', async () => {
      const events: AgentEvent[] = [];
      const result = await orchestrator.chat(
        'Show me Q3 revenue',
        'user-123',
        'session-123',
        undefined,
        (e) => events.push(e),
      );

      expect(result.response).toBe('Q3 revenue was €1.2M');
      expect(result.metadata.agentName).toBe('erp-analyst');
      expect(result.metadata.toolsUsed).toContain('odoo_search_read');
      expect(result.metadata.confidence).toBe(0.95);

      // Should have emitted agent.start and agent.end events
      expect(events.some(e => e.type === 'agent.start')).toBe(true);
      expect(events.some(e => e.type === 'agent.end')).toBe(true);
    });

    it('should store conversation history in session', async () => {
      await orchestrator.chat('Hello', 'user-123', 'session-456');
      await orchestrator.chat('What tasks are overdue?', 'user-123', 'session-456');

      const stats = orchestrator.getSessionStats('session-456');
      expect(stats).not.toBeNull();
      expect(stats!.messageCount).toBe(4); // 2 user + 2 assistant
    });
  });

  describe('runAgent', () => {
    it('should run a specific named agent', async () => {
      const result = await orchestrator.runAgent(
        'sales-agent',
        'Create a lead for Acme',
        'user-123',
        'session-789',
      );

      expect(mockAgents.salesAgent.invoke).toHaveBeenCalled();
      expect(result.response).toBe('Created lead for Acme Corp');
      expect(result.metadata.agentName).toBe('sales-agent');
    });

    it('should fall back to default agent for unknown agent name', async () => {
      const result = await orchestrator.runAgent(
        'unknown-agent',
        'Hello',
        'user-123',
        'session-999',
      );

      expect(mockAgents.knowledgeAgent.invoke).toHaveBeenCalled();
      expect(result.metadata.agentName).toBe('knowledge-agent');
    });
  });

  describe('session management', () => {
    it('should clear session on clearSession', async () => {
      await orchestrator.chat('Hello', 'user-123', 'session-to-clear');
      expect(orchestrator.getSessionStats('session-to-clear')).not.toBeNull();

      orchestrator.clearSession('session-to-clear');
      expect(orchestrator.getSessionStats('session-to-clear')).toBeNull();
    });

    it('should return null for non-existent session stats', () => {
      expect(orchestrator.getSessionStats('non-existent')).toBeNull();
    });
  });
});
