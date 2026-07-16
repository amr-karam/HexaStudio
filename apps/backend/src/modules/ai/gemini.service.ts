import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Env } from '../../config/env';
import { ToolRegistry } from '../agents/tools';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private client: GoogleGenAI | null = null;
  private readonly maxIterations = 8;

  constructor(
    private readonly toolRegistry: ToolRegistry,
    private configService: ConfigService<Env>,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  get isAvailable(): boolean {
    return this.client !== null;
  }

  private getTools() {
    const tools = this.toolRegistry.getDefinitions();
    return {
      geminiTools: tools.map(t => ({
        functionDeclarations: [
          {
            name: t.name,
            description: t.description,
            parameters: t.parameters as Record<string, unknown>,
          },
        ],
      })),
      toolsList: tools,
    };
  }

  private getSystemInstruction(tools: { name: string; description: string }[]) {
    return `You are HEXA, the AI assistant for HexaStudio — a high-end architectural visualization studio.

You help users explore the portfolio, learn about projects, and understand architectural concepts.

Available tools:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Use tools when you need information. If a tool call fails, tell the user gracefully.
Answer concisely and professionally. When citing projects, include their titles and key details.`;
  }

  async chat(
    message: string,
    previousInteractionId?: string,
  ): Promise<{ response: string; toolCalls: number; interactionId?: string }> {
    if (!this.client) {
      return { response: 'Gemini AI is unavailable (no API key configured).', toolCalls: 0 };
    }

    const { geminiTools, toolsList } = this.getTools();
    const model = this.configService.get<string>('GEMINI_MODEL')!;
    const systemInstruction = this.getSystemInstruction(toolsList);

    const genConfig: Record<string, unknown> = {
      temperature: 0.3,
      max_output_tokens: 800,
    };

    let interactionId: string | undefined = previousInteractionId;
    let toolCalls = 0;

    const call = async (input: string | unknown[]) => {
      const interaction = await this.client!.interactions.create({
        model,
        system_instruction: systemInstruction,
        tools: geminiTools as never,
        input,
        previous_interaction_id: interactionId,
        generation_config: genConfig,
      } as never);
      interactionId = interaction.id;
      return interaction;
    };

    let interaction = await call(message);

    for (let i = 0; i < this.maxIterations; i++) {
      const functionCallStep = interaction.steps?.find(
        (s: { type?: string }) => s.type === 'function_call',
      ) as { name: string; arguments: Record<string, unknown>; id: string; type: string } | undefined;

      if (!functionCallStep) {
        const output = interaction.output_text || 'No response generated.';
        return { response: output, toolCalls, interactionId };
      }

      toolCalls++;
      const fnName = functionCallStep.name;
      const fnArgs = functionCallStep.arguments;
      const callId = functionCallStep.id;

      const result = await this.toolRegistry.execute(fnName, fnArgs);

      interaction = await call([
        {
          type: 'function_result',
          call_id: callId,
          name: fnName,
          result,
        },
      ]);
    }

    return {
      response:
        'I apologize, but I could not complete your request within the limit. Please try a simpler query.',
      toolCalls,
      interactionId,
    };
  }
}
