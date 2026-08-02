import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { ToolRegistryService } from './tool-registry.service';
import { AgentMemoryService } from './agent-memory.service';
import { Env } from '../../config/env';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
  tool_call_id?: string;
}

export type AgentPersona = 'general' | 'ceo' | 'sales' | 'pm' | 'code-review';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);
  private openai: OpenAI | null = null;
  private readonly maxIterations = 8;

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly memory: AgentMemoryService,
    private configService: ConfigService<Env>,
  ) {
    // Prefer local LM Studio (free & unlimited, tool-call capable).
    // Falls back to OpenAI when AI_CHAT_PROVIDER != 'local' or a key is set.
    const provider = this.configService.get('AI_CHAT_PROVIDER', 'local');
    if (provider === 'local') {
      this.openai = new OpenAI({
        apiKey: 'lm-studio',
        baseURL: this.configService.get('LM_STUDIO_BASE_URL', 'http://host.docker.internal:1234/v1'),
      });
    } else {
      const apiKey = this.configService.get('OPENAI_API_KEY');
      if (apiKey) {
        this.openai = new OpenAI({ apiKey });
      }
    }
  }

  private getSystemPrompt(persona: AgentPersona, toolsDescription: string): string {
    switch (persona) {
      case 'ceo':
        return `You are HEXA-CEO, the executive strategy assistant for HexaStudio. 
Focus on high-level KPIs, financial growth, risk mitigation, resource utilization, and enterprise vision. 
Provide concise, executive-level summaries.
Available tools:
${toolsDescription}`;
      case 'sales':
        return `You are HEXA-Sales, the business development assistant for HexaStudio.
Focus on client lead qualification, tailored proposal generation, pricing negotiation strategies, and CRM sync.
Available tools:
${toolsDescription}`;
      case 'pm':
        return `You are HEXA-PM, the project management assistant for HexaStudio.
Focus on sprint planning, milestone velocity, bottleneck prediction, team resource allocation, and timeline forecasting.
Available tools:
${toolsDescription}`;
      case 'code-review':
        return `You are HEXA-Reviewer, the technical quality and architecture assistant for HexaStudio.
Focus on code cleanlines, TypeScript strictness, security standards, OWASP guidelines, and performance optimization.
Available tools:
${toolsDescription}`;
      default:
        return `You are HEXA, the AI assistant for HexaStudio — a high-end architectural visualization studio.
You help users explore projects, learn about design craft, and understand architectural concepts.
Available tools:
${toolsDescription}`;
    }
  }

  async chat(
    message: string,
    persona: AgentPersona = 'general',
    sessionId?: string,
  ): Promise<{ response: string; toolCalls: number; sessionId: string }> {
    if (!this.openai) {
      return {
        response: 'AI agent is unavailable (no API key configured).',
        toolCalls: 0,
        sessionId: sessionId ?? 'none',
      };
    }

    const tools = this.toolRegistry.getDefinitions();
    const toolsDescription = tools.map(t => `- ${t.name}: ${t.description}`).join('\n');
    const systemPrompt = this.getSystemPrompt(persona, toolsDescription);
    const activeSession = sessionId ?? this.generateSessionId();

    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

    // Hydrate prior conversation context from Redis (most recent N messages).
    const history = await this.memory.getHistory(persona, activeSession);
    for (const entry of history) {
      messages.push({ role: entry.role, content: entry.content });
    }

    messages.push({ role: 'user', content: message });
    await this.memory.append(persona, activeSession, { role: 'user', content: message });

    let toolCalls = 0;

    for (let i = 0; i < this.maxIterations; i++) {
      const openaiTools = tools.map(t => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })) as ChatCompletionTool[];

      const response = await this.openai!.chat.completions.create({
        model:
          this.configService.get('AI_CHAT_PROVIDER', 'local') === 'local'
            ? this.configService.get('LM_STUDIO_MODEL', 'google/gemma-4-e4b')!
            : this.configService.get<string>('OPENAI_MODEL')!,
        messages: messages as unknown as ChatCompletionMessageParam[],
        tools: openaiTools,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 800,
      });

      const choice = response.choices[0];
      const assistantMessage = choice.message;

      messages.push({
        role: 'assistant',
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      });

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        await this.memory.append(persona, activeSession, {
          role: 'assistant',
          content: assistantMessage.content,
        });
        return {
          response: assistantMessage.content || 'No response generated.',
          toolCalls,
          sessionId: activeSession,
        };
      }

      for (const call of assistantMessage.tool_calls) {
        if (call.type !== 'function') continue;
        toolCalls++;

        let params: Record<string, unknown> = {};
        try {
          params = JSON.parse(call.function.arguments);
        } catch {
          params = {};
        }

        // Autonomous tool execution: run each tool in isolation so a single
        // failure (missing auth, HITL gate, provider error) surfaces as a tool
        // result instead of aborting the entire multi-step run.
        let toolResult: string;
        try {
          const result = await this.toolRegistry.execute(call.function.name, params, undefined);
          toolResult = String(result);
        } catch (err) {
          const messageText = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `Tool '${call.function.name}' failed during autonomous run: ${messageText}`,
          );
          toolResult = `Tool execution failed: ${messageText}`;
        }

        messages.push({
          role: 'tool',
          content: toolResult,
          tool_call_id: call.id,
        });
        await this.memory.append(persona, activeSession, {
          role: 'tool',
          content: toolResult,
        });
      }
    }

    await this.memory.append(persona, activeSession, {
      role: 'assistant',
      content:
        'I apologize, but I could not complete your request within the limit. Please try a simpler query.',
    });

    return {
      response:
        'I apologize, but I could not complete your request within the limit. Please try a simpler query.',
      toolCalls,
      sessionId: activeSession,
    };
  }

  private generateSessionId(): string {
    return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /** Clear persisted memory for a persona + session. */
  async clearMemory(persona: AgentPersona, sessionId: string): Promise<void> {
    await this.memory.clear(persona, sessionId);
  }
}
