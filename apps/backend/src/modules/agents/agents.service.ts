import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ToolRegistry, ToolDefinition } from './tools';
import { getEnv, Env } from '../../config/env';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
}

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);
  private openai: OpenAI | null = null;
  private env: Env;
  private readonly maxIterations = 8;

  constructor(private readonly toolRegistry: ToolRegistry) {
    this.env = getEnv();
    if (this.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: this.env.OPENAI_API_KEY });
    }
  }

  async chat(message: string): Promise<{ response: string; toolCalls: number }> {
    if (!this.openai) {
      return { response: 'AI agent is unavailable (no API key configured).', toolCalls: 0 };
    }

    const tools = this.toolRegistry.getDefinitions();
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are HEXA, the AI assistant for HexaStudio — a high-end architectural visualization studio.

You help users explore the portfolio, learn about projects, and understand architectural concepts.

Available tools:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Use tools when you need information. If a tool call fails, tell the user gracefully.
Answer concisely and professionally. When citing projects, include their titles and key details.`,
      },
      { role: 'user', content: message },
    ];

    let toolCalls = 0;

    for (let i = 0; i < this.maxIterations; i++) {
      const openaiTools = tools.map(t => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));

      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: messages as any,
        tools: openaiTools,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 800,
      });

      const choice = response.choices[0];
      const assistantMessage = choice.message;

      // Add assistant message to history
      messages.push({
        role: 'assistant',
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      });

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        return { response: assistantMessage.content || 'No response generated.', toolCalls };
      }

      for (const call of assistantMessage.tool_calls) {
        if (call.type !== 'function') continue;
        toolCalls++;

        let params: Record<string, any> = {};
        try {
          params = JSON.parse(call.function.arguments);
        } catch {
          params = {};
        }

        const result = await this.toolRegistry.execute(call.function.name, params);
        messages.push({
          role: 'tool',
          content: result,
          tool_call_id: call.id,
        });
      }
    }

    return { response: 'I apologize, but I could not complete your request within the limit. Please try a simpler query.', toolCalls };
  }
}
