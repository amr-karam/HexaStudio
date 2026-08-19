import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AgentTool, AgentContext, AgentResponse, AgentEvent, ChatMessage, ToolResult, AgentPersona } from './types/agent.types';

export interface BaseAgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  tools: AgentTool[];
  color?: string;
  icon?: string;
}

/**
 * BaseAgent — Core agent class with OpenAI-compatible tool calling.
 *
 * Designed to work with LM Studio (local), Ollama, or OpenAI endpoints.
 * Supports both sync (single response) and streaming via SSE events.
 *
 * "Hermes agents" use the Hermes-3 LLM model (available via LM Studio)
 * for open-source, locally-run agent reasoning.
 */
export abstract class BaseAgent {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly openai: OpenAI;
  protected readonly model: string;
  private readonly persona: AgentPersona;
  protected readonly tools: Map<string, AgentTool>;

  constructor(
    protected readonly configService: ConfigService,
    config: BaseAgentConfig,
  ) {
    this.persona = {
      name: config.name,
      description: config.description,
      systemPrompt: config.systemPrompt,
      color: config.color ?? 'var(--color-info)',
      icon: config.icon ?? 'Bot',
      tools: config.tools.map(t => t.definition.name),
    };

    // Build tool registry for fast lookup
    this.tools = new Map(config.tools.map(t => [t.definition.name, t]));

    const baseUrl = configService.get<string>('LM_STUDIO_BASE_URL') ?? 'http://127.0.0.1:1234/v1';
    this.model = configService.get<string>('LM_STUDIO_MODEL') ?? 'NousResearch/hermes-3-llama-3.1-8b';

    this.openai = new OpenAI({
      baseURL: baseUrl,
      apiKey: configService.get<string>('OPENAI_API_KEY') ?? 'lm-studio',
    });
  }

  getPersona(): AgentPersona {
    return this.persona;
  }

  /**
   * Invoke the agent synchronously — returns a single response after
   * all tool calls are resolved.
   */
  async invoke(
    query: string,
    context: AgentContext,
    onEvent?: (event: AgentEvent) => void,
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    const toolsUsed: string[] = [];
    const sources: string[] = [];

    onEvent?.({ type: 'agent.start', agentName: this.persona.name });

    // Build the full message list: system prompt + history + new query
    const messages: ChatMessage[] = [
      { role: 'system', content: this.persona.systemPrompt },
      ...context.conversationHistory,
      { role: 'user', content: query },
    ];

    let finalResponse = '';
    let iteration = 0;
    const maxIterations = 5;

    while (iteration < maxIterations) {
      iteration++;
      const toolFunctions = Array.from(this.tools.values()).map(tool => this.toOpenAITool(tool));

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages as unknown as OpenAI.Chat.ChatCompletionMessageParam[],
        tools: toolFunctions,
        tool_choice: 'auto',
        temperature: 0.4,
        max_tokens: 2048,
      });

      const choice = response.choices[0];
      const message = choice.message;

      if (message.content) {
        finalResponse = message.content;
      }

      if (message.tool_calls && message.tool_calls.length > 0) {
        messages.push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: message.content ?? '',
          tool_calls: message.tool_calls,
        } as ChatMessage);

        for (const toolCall of message.tool_calls) {
          const toolName = 'function' in toolCall ? toolCall.function?.name ?? '' : '';
          const tool = this.getToolByName(toolName);
          if (!tool) continue;

          onEvent?.({ type: 'tool.start', agentName: this.persona.name, toolName });
          toolsUsed.push(toolName);

          try {
            const argsStr = 'function' in toolCall ? toolCall.function?.arguments ?? '{}' : '{}';
            const args = JSON.parse(argsStr) as Record<string, string>;
            const result = await tool.handler(args);
            sources.push(...this.extractSources(result));

            const toolResult: ToolResult = {
              tool_call_id: toolCall.id,
              role: 'tool',
              content: result,
            };
            messages.push(toolResult as unknown as ChatMessage);

            onEvent?.({
              type: 'tool.result',
              agentName: this.persona.name,
              toolName,
              content: result,
            });
          } catch (error) {
            const errMsg = `Tool error: ${(error as Error).message}`;
            onEvent?.({ type: 'error', agentName: this.persona.name, error: errMsg });

            messages.push({
              tool_call_id: toolCall.id,
              role: 'tool',
              content: errMsg,
            } as ChatMessage);
          }
        }
        continue;
      }

      break;
    }

    onEvent?.({ type: 'agent.end', agentName: this.persona.name, content: finalResponse });

    return {
      content: finalResponse,
      metadata: {
        agentName: this.persona.name,
        toolsUsed,
        confidence: 0.9,
        sources,
        executionTimeMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Stream the agent response via SSE-style event callback.
   */
  async *stream(
    query: string,
    context: AgentContext,
    onEvent?: (event: AgentEvent) => void,
  ): AsyncGenerator<string, void, unknown> {
    onEvent?.({ type: 'agent.start', agentName: this.persona.name });

    const toolFunctions = Array.from(this.tools.values()).map(tool => this.toOpenAITool(tool));

    const messages: ChatMessage[] = [
      { role: 'system', content: this.persona.systemPrompt },
      ...context.conversationHistory,
      { role: 'user', content: query },
    ];

    let iteration = 0;
    const maxIterations = 5;

    while (iteration < maxIterations) {
      iteration++;

      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages as unknown as OpenAI.Chat.ChatCompletionMessageParam[],
        tools: toolFunctions,
        tool_choice: 'auto',
        temperature: 0.4,
        max_tokens: 2048,
        stream: true,
      });

      let hasToolCalls = false;
      let assembledContent = '';
      // Use index from OpenAI streaming to track multi-chunk tool calls
      const collectedToolCalls: Map<number, { id: string; name: string; args: string }> = new Map();

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (!choice) continue;
        const delta = choice.delta;

        if (delta.tool_calls && delta.tool_calls.length > 0) {
          hasToolCalls = true;
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            const fn = 'function' in tc ? tc.function : undefined;
            const fnName = fn?.name ?? '';
            const fnArgs = fn?.arguments ?? '';

            const existing = collectedToolCalls.get(idx);
            if (fnName) {
              collectedToolCalls.set(idx, {
                id: tc.id ?? `call_${idx}_${Date.now()}`,
                name: fnName,
                args: fnArgs,
              });
              onEvent?.({ type: 'tool.start', agentName: this.persona.name, toolName: fnName });
            } else if (fnArgs && existing) {
              existing.args += fnArgs;
            }
          }
        }

        if (delta.content) {
          assembledContent += delta.content;
          yield delta.content;
        }
      }

      if (hasToolCalls && collectedToolCalls.size > 0) {
        messages.push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: assembledContent,
          tool_calls: Array.from(collectedToolCalls.values()).map(({ id, name, args }) => ({
            id,
            type: 'function' as const,
            function: { name, arguments: args },
          })),
        } as ChatMessage);

        for (const { id, name, args } of collectedToolCalls.values()) {
          const tool = this.getToolByName(name);
          if (!tool) continue;

          onEvent?.({ type: 'tool.start', agentName: this.persona.name, toolName: name });

          try {
            const parsedArgs = JSON.parse(args) as Record<string, string>;
            const result = await tool.handler(parsedArgs);

            onEvent?.({
              type: 'tool.result',
              agentName: this.persona.name,
              toolName: name,
              content: result,
            });

            const toolResult: ToolResult = {
              tool_call_id: id,
              role: 'tool',
              content: result,
            };
            messages.push(toolResult as unknown as ChatMessage);
          } catch (error) {
            const errMsg = `Tool error: ${(error as Error).message}`;
            onEvent?.({ type: 'error', agentName: this.persona.name, error: errMsg });
            messages.push({
              tool_call_id: id,
              role: 'tool',
              content: errMsg,
            } as ChatMessage);
          }
        }
        continue;
      }

      break;
    }

    onEvent?.({ type: 'agent.end', agentName: this.persona.name });
  }

  // ─── Internal helpers ─────────────────────────────────────────────────

  private getToolByName(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  private toOpenAITool(tool: AgentTool): OpenAI.Chat.ChatCompletionTool {
    return {
      type: 'function' as const,
      function: {
        name: tool.definition.name,
        description: tool.definition.description,
        parameters: tool.definition.parameters,
      },
    };
  }

  private extractSources(result: string): string[] {
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed.sources)) return parsed.sources;
      if (parsed.source) return [parsed.source];
      if (parsed.table) return [parsed.table];
    } catch {
      // Not JSON — return empty sources
    }
    return [];
  }
}
