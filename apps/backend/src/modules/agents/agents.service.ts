import { Injectable, Logger, Inject } from '@nestjs/common';
import type { User } from '@hexastudio/types';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { ToolRegistryService } from './tool-registry.service';
import { AgentMemoryService } from './agent-memory.service';
import { REALTIME_PORT } from '../../ports/realtime.port';
import type { RealtimePort } from '../../ports/realtime.port';
import { Env } from '../../config/env';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
  tool_call_id?: string;
}

export type AgentPersona = 'general' | 'ceo' | 'sales' | 'pm' | 'code-review' | 'researcher' | 'director';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);
  private openai: OpenAI | null = null;
  private readonly maxIterations = 8;

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly memory: AgentMemoryService,
    private configService: ConfigService<Env>,
    @Inject(REALTIME_PORT) private readonly realtime: RealtimePort,
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
    const baseInstructions = `
You are an autonomous AI agent for HexaStudio. You operate in a loop: Thought -> Action -> Observation -> Response.

CRITICAL PROTOCOL:
1. ALWAYS start every response with a <thought> block.
2. Inside <thought>, analyze the user request, recall relevant facts from memory, and plan your next step.
3. If you need more information, call the necessary tools.
4. If you have sufficient information, provide the final answer.
5. Do not reveal the <thought> block to the end-user in the final response, but keep it in the conversation history for your own continuity.

Available tools:
${toolsDescription}`;

    switch (persona) {
      case 'ceo':
        return `You are HEXA-CEO, the executive strategy assistant for HexaStudio. 
Focus on high-level KPIs, financial growth, risk mitigation, resource utilization, and enterprise vision. 
Provide concise, executive-level summaries.
${baseInstructions}`;
      case 'sales':
        return `You are HEXA-Sales, the business development assistant for HexaStudio.
Focus on client lead qualification, tailored proposal generation, pricing negotiation strategies, and CRM sync.
${baseInstructions}`;
      case 'pm':
        return `You are HEXA-PM, the project management assistant for HexaStudio.
Focus on sprint planning, milestone velocity, bottleneck prediction, team resource allocation, and timeline forecasting.
${baseInstructions}`;
      case 'code-review':
        return `You are HEXA-Reviewer, the technical quality and architecture assistant for HexaStudio.
Focus on code cleanlines, TypeScript strictness, security standards, OWASP guidelines, and performance optimization.
${baseInstructions}`;
      case 'researcher':
        return `You are HEXA-Researcher, the architectural intelligence specialist for HexaStudio.
Your goal is to produce high-trust, cited research reports on materials, trends, and competitors.
PROTOCOL:
1. Search broadly for the topic.
2. Scrape 2-3 high-authority sources for depth.
3. Synthesize findings into a structured report.
4. Always cite your sources.
${baseInstructions}`;
      case 'director':
        return `You are HEXA-Director, the creative lead and design arbiter for HexaStudio.
Your focus is the "Absolute Zero" luxury standard. You review research, approve material applications, and ensure the visual narrative is uncompromising.
PROTOCOL:
1. Analyze research findings for "Design Taste."
2. Approve or reject material changes based on the DESIGN_SYSTEM.md.
3. Ensure the final deliverable feels "Silent Luxury."
${baseInstructions}`;
      default:
        return `You are HEXA, the AI assistant for HexaStudio — a high-end architectural visualization studio.
You help users explore projects, learn about design craft, and understand architectural concepts.
${baseInstructions}`;
    }
  }

  async chat(
    message: string,
    persona: AgentPersona = 'general',
    sessionId?: string,
    user?: User,
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

    // Hydrate prior conversation context from Redis.
    const history = await this.memory.getHistory(persona, activeSession);
    const facts = await this.memory.getAllFacts(persona, activeSession);
    
    // --- SEMANTIC MEMORY HYDRATION ---
    // Perform a vector search to recall relevant facts from all previous sessions.
    const semanticMemories = await this.memory.semanticRecall(persona, activeSession, message);
    if (semanticMemories.length > 0) {
      const semanticString = semanticMemories
        .map((m, i) => `[Recalled Memory ${i + 1}]: ${JSON.stringify(m)}`)
        .join('\n');
      messages.push({ 
        role: 'system', 
        content: `LONG-TERM SEMANTIC CONTEXT:\n${semanticString}\n\nUse these recalled memories to maintain continuity across sessions.` 
      });
    }
    // ---------------------------------

    // Inject durable facts as a high-priority system context block.
    if (Object.keys(facts).length > 0) {
      const factString = Object.entries(facts)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      messages.push({ 
        role: 'system', 
        content: `KNOWN CONTEXT FOR THIS SESSION:\n${factString}\n\nUse these facts as the primary source of truth.` 
      });
    }

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
         let toolResult = '';
         let retryCount = 0;
         const maxRetries = 2;

         while (retryCount <= maxRetries) {
           try {
             const result = await this.toolRegistry.execute(call.function.name, params, user);
             toolResult = String(result);
             break;
           } catch (err) {
             const messageText = err instanceof Error ? err.message : String(err);
             retryCount++;
             
             if (retryCount > maxRetries) {
               this.logger.error(`Tool '${call.function.name}' failed after ${maxRetries + 1} attempts: ${messageText}`);
               toolResult = `Tool execution failed after retries: ${messageText}`;
               break;
             }

             this.logger.warn(`Tool '${call.function.name}' failed (attempt ${retryCount}): ${messageText}. Retrying...`);
             // Small jitter delay to avoid hammering rate-limited providers
             await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
           }
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

        // Broadcast material/design changes to collaboration peers
        try {
          if (call.function.name.toLowerCase().includes('material')) {
            this.realtime.broadcastToRoom(`project:${sessionId}`, 'collab:material-override', {
              element: params.element || 'unknown',
              color: params.color,
              roughness: params.roughness,
              metalness: params.metalness,
              name: params.name,
              triggeredBy: params.triggeredBy || 'user',
              agentPersona: persona,
            });
          }
        } catch (e) {
          // Non-fatal: collaboration emission fails silently
          this.logger.debug(`Collaboration emit skipped: ${e}`);
        }
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
