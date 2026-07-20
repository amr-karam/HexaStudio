import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { createChatClient, ChatClient } from './llm.factory';
import type { Env } from '../../config/env';

/**
 * Provider-agnostic chat LLM client.
 *
 * Switches between 'openai' (paid) and 'freetheai' (free gateway)
 * based on the AI_CHAT_PROVIDER env var.
 *
 * All assistant and AI services that call /chat/completions should
 * inject this service instead of creating their own OpenAI client.
 */
@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private chat: ChatClient | null = null;

  /** OpenAI-compatible chat client. Null when no key is configured. */
  readonly client: OpenAI | null;
  /** Effective model name for the active provider. */
  readonly model: string;
  /** Resolved provider identifier. */
  readonly provider: 'openai' | 'freetheai';

  constructor(configService: ConfigService<Env>) {
    const env = {
      AI_CHAT_PROVIDER: configService.get('AI_CHAT_PROVIDER')!,
      OPENAI_API_KEY: configService.get('OPENAI_API_KEY'),
      OPENAI_MODEL: configService.get('OPENAI_MODEL')!,
      FREETHEAI_API_KEY: configService.get('FREETHEAI_API_KEY'),
      FREETHEAI_BASE_URL: configService.get('FREETHEAI_BASE_URL')!,
      FREETHEAI_MODEL: configService.get('FREETHEAI_MODEL')!,
    } as Env;

    const resolved = createChatClient(env);

    if (resolved) {
      this.client = resolved.client;
      this.model = resolved.model;
      this.provider = resolved.provider;
      this.chat = resolved;
      this.logger.log(`Chat LLM → ${resolved.provider} (model: ${resolved.model})`);
    } else {
      this.client = null;
      this.model = 'gpt-4o-mini';
      this.provider = 'openai';
      this.logger.warn('No chat LLM configured — set OPENAI_API_KEY or FREETHEAI_API_KEY');
    }
  }

  /** True when a chat client is available. */
  get isAvailable(): boolean {
    return this.client !== null;
  }
}
