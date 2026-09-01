import { Test, TestingModule } from '@nestjs/testing';
import { AgentsController } from './agents.controller';
import { AgentOrchestrator } from './agents.service';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockAgentResponse = {
  content: 'Q3 revenue was €1.2M, 5% above budget.',
  metadata: {
    agentName: 'erp-analyst',
    toolsUsed: ['odoo_search_read'],
    confidence: 0.95,
    sources: ['odoo'],
    executionTimeMs: 150,
  },
};

const mockPersona = {
  name: 'erp-analyst',
  description: 'ERP Analyst',
  color: 'var(--color-metric-amber)',
  icon: '📊',
  tools: ['odoo_search_read'],
  systemPrompt: 'You are the ERP Analyst',
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AgentsController', () => {
  let controller: AgentsController;
  let orchestrator: jest.Mocked<AgentOrchestrator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [
        {
          provide: AgentOrchestrator,
          useValue: {
            chat: jest.fn().mockResolvedValue({
              response: mockAgentResponse.content,
              metadata: mockAgentResponse.metadata,
            }),
            runAgent: jest.fn().mockResolvedValue({
              response: mockAgentResponse.content,
              metadata: mockAgentResponse.metadata,
            }),
            streamChat: jest.fn().mockImplementation(async function* () {
              yield 'Q3 revenue was';
              yield ' €1.2M, 5% above budget.';
            }),
            getAgentPersonas: jest.fn().mockReturnValue([mockPersona]),
            getAgent: jest.fn().mockReturnValue(undefined),
            getDefaultAgent: jest.fn(),
            classifyIntent: jest.fn(),
            getSessionStats: jest.fn().mockReturnValue({
              messageCount: 4,
              createdAt: new Date(),
              lastAccessed: new Date(),
            }),
            clearSession: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AgentsController>(AgentsController);
    orchestrator = module.get(AgentOrchestrator);
  });

  describe('chat', () => {
    it('should call orchestrator.chat for auto-detect routing', async () => {
      const req = { user: { id: 'user-123' } };
      const result = await controller.chat(req, {
        query: 'Show me Q3 revenue',
        stream: false,
      });

      expect(orchestrator.chat).toHaveBeenCalledWith(
        'Show me Q3 revenue',
        'user-123',
        'session_user-123',
        undefined,
      );
      expect(result.response).toBe(mockAgentResponse.content);
    });

    it('should call orchestrator.runAgent when agentName is specified', async () => {
      const req = { user: { id: 'user-456' } };
      await controller.chat(req, {
        query: 'Create a lead for Nebula',
        agentName: 'sales-agent',
        stream: false,
      });

      expect(orchestrator.runAgent).toHaveBeenCalledWith(
        'sales-agent',
        'Create a lead for Nebula',
        'user-456',
        'session_user-456',
        undefined,
      );
    });

    it('should parse body with Zod schema', async () => {
      const req = { user: { id: 'user-789' } };
      await expect(
        controller.chat(req, { query: '', stream: false }),
      ).rejects.toThrow();
    });
  });

  describe('streamChat', () => {
    it('should yield SSE events from agent streaming', async () => {
      const req = { user: { id: 'user-stream' } };
      const events: Array<{ data: string }> = [];

      for await (const event of controller.streamChat(req, 'Show revenue', undefined)) {
        events.push({ data: event.data.toString() });
      }

      expect(events.length).toBe(2);
      expect(JSON.parse(events[0].data).content).toBe('Q3 revenue was');
      expect(JSON.parse(events[1].data).content).toBe(' €1.2M, 5% above budget.');
    });

    it('should return error event when query is empty', async () => {
      const req = { user: { id: 'user-empty' } };
      const generator = controller.streamChat(req, '', undefined);
      const event = await generator.next();
      expect(event.done).toBe(false);
      const data = JSON.parse(event.value.data);
      expect(data.type).toBe('error');
      expect(data.error).toBe('Query parameter is required');
    });
  });

  describe('getAgentList', () => {
    it('should return all agent personas', () => {
      const result = controller.getAgentList();
      expect(result.agents).toHaveLength(1);
      expect(result.agents[0].name).toBe('erp-analyst');
    });
  });

  describe('getSessionStats', () => {
    it('should return session stats for authenticated user', () => {
      const req = { user: { id: 'user-stats' } };
      const result = controller.getSessionStats(req);
      expect(result).toEqual({
        messageCount: 4,
        createdAt: expect.any(Date),
        lastAccessed: expect.any(Date),
      });
    });
  });

  describe('clearMemory', () => {
    it('should clear session and return success', () => {
      const req = { user: { id: 'user-clear' } };
      const result = controller.clearMemory(req);
      expect(result).toEqual({ success: true });
      expect(orchestrator.clearSession).toHaveBeenCalledWith('session_user-clear');
    });
  });
});
