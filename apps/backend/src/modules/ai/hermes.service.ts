import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../config/env';
import { ToolRegistryService } from '../agents/tool-registry.service';
import { ToolDefinitionOptions } from '../agents/decorators/tool-definition.decorator';
import OpenAI from 'openai';

/**
 * HermesAgentService
 *
 * Replaces the former GeminiService as the primary "agentic" chat provider.
 * Hermes Agent exposes an OpenAI-compatible chat+tools endpoint, so we reuse
 * the same tool-call loop pattern as the Gemini service but through a standard
 * OpenAI client pointed at the Hermes runtime.
 *
 * Env keys:
 *   HERMES_API_KEY  - bearer token (optional for public/self-hosted runtimes)
 *   HERMES_BASE_URL - OpenAI-compatible endpoint (default: http://19.16.1.100:8000/v1)
 *   HERMES_MODEL    - model name passed to the provider
 */
@Injectable()
export class HermesAgentService {
  private readonly logger = new Logger(HermesAgentService.name);
  private client: OpenAI | null = null;
  private readonly model: string;
  private readonly maxIterations = 8;

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private configService: ConfigService<Env>,
  ) {
    const apiKey = this.configService.get('HERMES_API_KEY');
    const baseURL =
      this.configService.get('HERMES_BASE_URL') ?? 'http://19.16.1.100:8000/v1';

    this.model = this.configService.get('HERMES_MODEL') ?? 'hermes-agent-1.0';

    if (apiKey) {
      this.client = new OpenAI({ apiKey, baseURL });
    } else {
      // Self-hosted/local runtime — no auth needed.
      this.client = new OpenAI({ baseURL });
    }
  }

  get isAvailable(): boolean {
    return this.client !== null;
  }

  private getTools() {
    const tools = this.toolRegistry.getDefinitions();
    return tools.map((t: ToolDefinitionOptions) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters as Record<string, unknown>,
      },
    }));
  }

  private getSystemInstruction(tools: { name: string; description: string }[]) {
    return `You are HEXA, the AI assistant for HexaStudio — a high-end architectural visualization studio.

You help users explore the projects, learn about projects, and understand architectural concepts.

Available tools:
${tools.map((t) => `- ${t.name}: ${t.description}`).join('\n')}

Use tools when you need information. If a tool call fails, tell the user gracefully.
Answer concisely and professionally. When citing projects, include their titles and key details.`;
  }

  async chat(
    message: string,
    previousInteractionId?: string,
  ): Promise<{ response: string; toolCalls: number; interactionId?: string }> {
    if (!this.client) {
      return { response: 'Hermes Agent is unavailable (no API key configured).', toolCalls: 0 };
    }

    const tools = this.getTools();
    const systemInstruction = this.getSystemInstruction(
      tools.map((t) => ({ name: t.function.name, description: t.function.description })),
    );

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: message },
    ];

    // NOTE: Hermes Agent (OpenAI-compatible) is stateless per-request, so we
    // cannot truly chain interactions via previousInteractionId. We emulate
    // session continuity by sending the full message list.
    void previousInteractionId;

    let toolCalls = 0;
    let lastResponse: OpenAI.Chat.Completions.ChatCompletionMessageParam | null = null;

    for (let i = 0; i < this.maxIterations; i++) {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 800,
      });

      const choice = response.choices[0];
      const assistantMessage = choice.message;
      lastResponse = assistantMessage;

      // Push assistant message (with potential tool_calls) to the conversation.
      messages.push({
        role: 'assistant',
        content: assistantMessage.content ?? '',
        tool_calls: assistantMessage.tool_calls ?? undefined,
      } as OpenAI.Chat.Completions.ChatCompletionMessageParam);

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        const output = assistantMessage.content || 'No response generated.';
        const interactionId = `hermes-${Date.now()}`;
        return { response: output, toolCalls, interactionId };
      }

      for (const call of assistantMessage.tool_calls) {
        if (call.type !== 'function') continue;

        toolCalls++;
        const fnName = call.function.name;
        let fnArgs: Record<string, unknown> = {};
        try {
          fnArgs = JSON.parse(call.function.arguments);
        } catch {
          fnArgs = {};
        }

        let toolResult: string;
        try {
          const result = await this.toolRegistry.execute(fnName, fnArgs, undefined);
          toolResult = String(result);
        } catch (err) {
          const messageText = err instanceof Error ? err.message : String(err);
          this.logger.warn(
            `Tool '${call.function.name}' failed during Hermes Agent run: ${messageText}`,
          );
          toolResult = `Tool execution failed: ${messageText}`;
        }

        // Append the tool result and let the model continue.
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: toolResult,
        });
      }
    }

    const finalText =
      lastResponse?.content ||
      'I apologize, but I could not complete your request within the limit. Please try a simpler query.';

    return {
      response: finalText,
      toolCalls,
      interactionId: `hermes-${Date.now()}`,
    };
  }
}
