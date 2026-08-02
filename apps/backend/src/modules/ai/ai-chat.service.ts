import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { createChatClient, ChatClient } from './llm.factory';
import { ModelRouterService } from './model-router.service';
import type { Env } from '../../config/env';

export interface StreamChatParams {
  messages: Array<{ role: string; content: string }>;
  /** Explicit model override — otherwise routed (local provider) or default. */
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' } | { type: 'text' };
}

export type StreamChatEvent =
  | { type: 'meta'; model: string; provider: string; maxTokens: number }
  | { type: 'reasoning'; text: string }
  | { type: 'delta'; text: string }
  | { type: 'usage'; promptTokens?: number; completionTokens?: number }
  | { type: 'error'; message: string };

export interface ChatCompletionResult {
  content: string;
  model: string;
  provider: string;
  usage?: { promptTokens?: number; completionTokens?: number };
}

/**
 * Provider-agnostic chat LLM client.
 *
 * Switches between 'openai' (paid), 'freetheai' (free gateway) and
 * 'local' (LM Studio, self-hosted) based on the AI_CHAT_PROVIDER env var.
 *
 * All assistant and AI services that call /chat/completions should
 * inject this service instead of creating their own OpenAI client.
 *
 * Streaming: `streamChat()` yields reasoning/delta events as they arrive
 * (LM Studio reasoning models stream `reasoning_content` first).
 * Routing: for the 'local' provider, simple queries go to the fast model
 * (LM_STUDIO_FAST_MODEL, e.g. gemma-4-e4b) and complex ones to the main
 * model (LM_STUDIO_MODEL, e.g. gemma-4-12b-it-qat).
 */
@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private chat: ChatClient | null = null;

  /** OpenAI-compatible chat client. Null when no key is configured. */
  readonly client: OpenAI | null;
  /** Effective model name for the active provider. */
  readonly model: string;
  /** Small/fast model used by the router for simple queries (local provider only). */
  readonly fastModel: string | undefined;
  /** Resolved provider identifier. */
  readonly provider: 'openai' | 'freetheai' | 'local';

  constructor(
    configService: ConfigService<Env>,
    private readonly modelRouter: ModelRouterService,
  ) {
    const env = {
      AI_CHAT_PROVIDER: configService.get('AI_CHAT_PROVIDER')!,
      OPENAI_API_KEY: configService.get('OPENAI_API_KEY'),
      OPENAI_MODEL: configService.get('OPENAI_MODEL')!,
      FREETHEAI_API_KEY: configService.get('FREETHEAI_API_KEY'),
      FREETHEAI_BASE_URL: configService.get('FREETHEAI_BASE_URL')!,
      FREETHEAI_MODEL: configService.get('FREETHEAI_MODEL')!,
      LM_STUDIO_BASE_URL: configService.get('LM_STUDIO_BASE_URL')!,
      LM_STUDIO_MODEL: configService.get('LM_STUDIO_MODEL')!,
      LM_STUDIO_FAST_MODEL: configService.get('LM_STUDIO_FAST_MODEL'),
    } as Env;

    const resolved = createChatClient(env);

    if (resolved) {
      this.client = resolved.client;
      this.model = resolved.model;
      this.fastModel = resolved.fastModel;
      this.provider = resolved.provider;
      this.chat = resolved;
      this.logger.log(`Chat LLM → ${resolved.provider} (model: ${resolved.model})`);
    } else {
      this.client = null;
      this.model = 'gpt-4o-mini';
      this.provider = 'openai';
      this.logger.warn('No chat LLM configured — set AI_CHAT_PROVIDER (local/freetheai/openai)');
    }
  }

  /** True when a chat client is available. */
  get isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Pick the best model for a query.
   * Local provider: routes simple queries to the fast model and complex
   * ones to the main model. Other providers: always the configured model.
   */
  selectModelFor(
    query: string,
    options: {
      hasImages?: boolean;
      requiresStructuredOutput?: boolean;
      requiresFunctionCalling?: boolean;
    } = {},
  ): { model: string; reasoning: string } {
    if (!this.client || this.provider !== 'local') {
      return { model: this.model, reasoning: `provider ${this.provider}` };
    }

    try {
      const rec = this.modelRouter.recommendModel(query, {
        ...options,
        preferredProvider: 'local',
      });
      return { model: rec.model, reasoning: rec.reasoning };
    } catch (error) {
      this.logger.warn(`Model routing failed (${error}), using default ${this.model}`);
      return { model: this.model, reasoning: 'routing fallback' };
    }
  }

  /**
   * Non-streaming completion — convenience wrapper for the /ai/chat endpoint.
   */
  async complete(params: StreamChatParams): Promise<ChatCompletionResult> {
    if (!this.client) {
      throw new Error('No chat LLM configured');
    }

    const model = params.model ?? this.model;
    const completion = await this.client.chat.completions.create({
      model,
      messages: params.messages as ChatCompletionMessageParam[],
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 1200,
      ...(params.responseFormat ? { response_format: params.responseFormat } : {}),
    });

    return {
      content: completion.choices[0]?.message?.content ?? '',
      model,
      provider: this.provider,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
      },
    };
  }

  /**
   * Streaming completion (SSE-friendly async generator).
   *
   * Yields:
   * - `meta` first (model/provider/maxTokens)
   * - `reasoning` deltas from reasoning models (e.g. gemma-4 thinking)
   * - `delta` content chunks as they stream in
   * - `usage` when available
   * - `error` if the upstream call fails
   */
  async *streamChat(params: StreamChatParams): AsyncGenerator<StreamChatEvent> {
    if (!this.client) {
      yield { type: 'error', message: 'No chat LLM configured' };
      return;
    }

    const model = params.model ?? this.model;
    const maxTokens = params.maxTokens ?? 1200;

    yield { type: 'meta', model, provider: this.provider, maxTokens };

    let stream;
    try {
      stream = await this.client.chat.completions.create({
        model,
        messages: params.messages as ChatCompletionMessageParam[],
        temperature: params.temperature ?? 0.7,
        max_tokens: maxTokens,
        ...(params.responseFormat ? { response_format: params.responseFormat } : {}),
        stream: true,
      });
    } catch (error) {
      this.logger.error(`Stream start failed: ${(error as Error).message}`);
      yield {
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
      return;
    }

    try {
      for await (const chunk of stream) {
        const choice = chunk.choices?.[0];
        const delta = choice?.delta as
          | (OpenAI.Chat.Completions.ChatCompletionChunk['choices'][number]['delta'] & {
              reasoning_content?: string;
            })
          | undefined;

        // LM Studio reasoning models stream thinking in `reasoning_content`.
        if (delta?.reasoning_content) {
          yield { type: 'reasoning', text: delta.reasoning_content };
        }
        if (delta?.content) {
          yield { type: 'delta', text: delta.content };
        }
        if (chunk.usage) {
          yield {
            type: 'usage',
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
          };
        }
      }
    } catch (error) {
      this.logger.error(`Stream interrupted: ${(error as Error).message}`);
      yield {
        type: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
