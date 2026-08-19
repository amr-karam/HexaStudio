import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAgent } from './base-agent';
import { ErpAnalystAgent } from './agents/erp-analyst.agent';
import { ProjectAssistantAgent } from './agents/project-assistant.agent';
import { SalesAgent } from './agents/sales.agent';
import { KnowledgeAgent } from './agents/knowledge.agent';
import { AgentEvent, AgentPersona, ChatMessage, AgentContext } from './types/agent.types';

interface AgentSession {
  messages: ChatMessage[];
  createdAt: Date;
  lastAccessed: Date;
}

/**
 * Orchestrator — Routes user queries to the right agent,
 * manages session memory, and dispatches streaming events.
 *
 * Intent classification uses keyword-based routing for the four
 * agents, with a fallback to Knowledge Agent for general queries.
 */
@Injectable()
export class AgentOrchestrator {
  private readonly logger = new Logger(AgentOrchestrator.name);
  private readonly sessions = new Map<string, AgentSession>();
  private readonly sessionTTL = 30 * 60 * 1000; // 30 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly erpAnalyst: ErpAnalystAgent,
    private readonly projectAssistant: ProjectAssistantAgent,
    private readonly salesAgent: SalesAgent,
    private readonly knowledgeAgent: KnowledgeAgent,
  ) {}

  /** Get all available agent personas */
  getAgentPersonas(): AgentPersona[] {
    return [
      this.erpAnalyst.getPersona(),
      this.projectAssistant.getPersona(),
      this.salesAgent.getPersona(),
      this.knowledgeAgent.getPersona(),
    ];
  }

  /** Get a specific agent by name */
  getAgent(name: string): BaseAgent | undefined {
    const agents = [this.erpAnalyst, this.projectAssistant, this.salesAgent, this.knowledgeAgent];
    return agents.find(a => a.getPersona().name === name);
  }

  /** Get default agent (knowledge agent for general queries) */
  getDefaultAgent(): KnowledgeAgent {
    return this.knowledgeAgent;
  }

  /**
   * Classify the user's intent and return the appropriate agent.
   * Uses keyword-based classification — lightweight, no LLM call needed.
   */
  classifyIntent(query: string): BaseAgent {
    const q = query.toLowerCase();

    // ERP / Finance keywords
    if (this.containsAny(q, [
      'revenue', 'budget', 'invoice', 'billing', 'expense', 'financial',
      'accounting', 'profit', 'margin', 'q3', 'q4', 'quarter', 'earnings',
    ])) {
      return this.erpAnalyst;
    }

    // Project / Task keywords
    if (this.containsAny(q, [
      'project', 'task', 'timeline', 'milestone', 'deadline', 'overdue',
      'schedule', 'workload', 'team', 'status', 'roadmap',
    ])) {
      return this.projectAssistant;
    }

    // Sales / CRM keywords
    if (this.containsAny(q, [
      'lead', 'opportunity', 'pipeline', 'proposal', 'prospect', 'crm',
      'client', 'sales', 'deal', 'conversion', 'quotation',
    ])) {
      return this.salesAgent;
    }

    // Default: Knowledge agent
    return this.knowledgeAgent;
  }

  /**
   * Process a chat message — classify intent, select agent,
   * execute, and return the response.
   */
  async chat(
    query: string,
    userId: string,
    sessionId: string,
    context?: Partial<AgentContext>,
    onEvent?: (event: AgentEvent) => void,
  ): Promise<{ response: string; metadata: Record<string, unknown> }> {
    // Clean up expired sessions
    this.cleanupSessions();

    // Get or create session
    const session = this.getSession(sessionId);
    session.messages.push({ role: 'user', content: query });

    // Classify intent
    const agent = this.classifyIntent(query);
    onEvent?.({ type: 'agent.start', agentName: agent.getPersona().name });

    // Build agent context
    const agentContext: AgentContext = {
      userId,
      sessionId,
      conversationHistory: session.messages.slice(-10), // Last 10 messages
      ...context,
    };

    // Execute agent
    const result = await agent.invoke(query, agentContext, onEvent);

    // Store assistant response in session
    session.messages.push({
      role: 'assistant',
      content: result.content,
    });

    session.lastAccessed = new Date();

    onEvent?.({ type: 'agent.end', agentName: agent.getPersona().name, content: result.content });

    return {
      response: result.content,
      metadata: {
        agentName: result.metadata.agentName,
        toolsUsed: result.metadata.toolsUsed,
        confidence: result.metadata.confidence,
        sources: result.metadata.sources,
        executionTimeMs: result.metadata.executionTimeMs,
      },
    };
  }

  /**
   * Stream a chat response — event-by-event via callback.
   */
  async *streamChat(
    query: string,
    userId: string,
    sessionId: string,
    context?: Partial<AgentContext>,
    onEvent?: (event: AgentEvent) => void,
  ): AsyncGenerator<string, void, unknown> {
    this.cleanupSessions();
    const session = this.getSession(sessionId);
    session.messages.push({ role: 'user', content: query });

    const agent = this.classifyIntent(query);
    onEvent?.({ type: 'agent.start', agentName: agent.getPersona().name });

    const agentContext: AgentContext = {
      userId,
      sessionId,
      conversationHistory: session.messages.slice(-10),
      ...context,
    };

    let fullResponse = '';

    for await (const chunk of agent.stream(query, agentContext, onEvent)) {
      fullResponse += chunk;
      yield chunk;
    }

    session.messages.push({
      role: 'assistant',
      content: fullResponse,
    });
    session.lastAccessed = new Date();

    onEvent?.({ type: 'agent.end', agentName: agent.getPersona().name, content: fullResponse });
  }

  /**
   * Run a specific agent by name (for explicit agent selection).
   */
  async runAgent(
    agentName: string,
    query: string,
    userId: string,
    sessionId: string,
    context?: Partial<AgentContext>,
    onEvent?: (event: AgentEvent) => void,
  ): Promise<{ response: string; metadata: Record<string, unknown> }> {
    const agent = this.getAgent(agentName) ?? this.getDefaultAgent();
    const session = this.getSession(sessionId);
    session.messages.push({ role: 'user', content: query });

    onEvent?.({ type: 'agent.start', agentName: agent.getPersona().name });

    const agentContext: AgentContext = {
      userId,
      sessionId,
      conversationHistory: session.messages.slice(-10),
      ...context,
    };

    const result = await agent.invoke(query, agentContext, onEvent);

    session.messages.push({
      role: 'assistant',
      content: result.content,
    });
    session.lastAccessed = new Date();

    onEvent?.({ type: 'agent.end', agentName: agent.getPersona().name, content: result.content });

    return {
      response: result.content,
      metadata: {
        agentName: result.metadata.agentName,
        toolsUsed: result.metadata.toolsUsed,
        confidence: result.metadata.confidence,
        sources: result.metadata.sources,
        executionTimeMs: result.metadata.executionTimeMs,
      },
    };
  }

  /** Clear session history */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /** Get session stats */
  getSessionStats(sessionId: string): { messageCount: number; createdAt: Date; lastAccessed: Date } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return {
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      lastAccessed: session.lastAccessed,
    };
  }

  // ─── Internal helpers ─────────────────────────────────────────────────

  private getSession(sessionId: string): AgentSession {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      existing.lastAccessed = new Date();
      return existing;
    }
    const session: AgentSession = {
      messages: [],
      createdAt: new Date(),
      lastAccessed: new Date(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  private cleanupSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastAccessed.getTime() > this.sessionTTL) {
        this.sessions.delete(id);
      }
    }
  }

  private containsAny(str: string, keywords: string[]): boolean {
    return keywords.some(kw => str.includes(kw));
  }
}
