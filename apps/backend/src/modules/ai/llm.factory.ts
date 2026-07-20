import OpenAI from 'openai';
import type { Env } from '../../config/env';

export interface ChatClient {
  client: OpenAI;
  model: string;
  provider: 'openai' | 'freetheai';
}

/**
 * Resolves the chat LLM client from AI_CHAT_PROVIDER.
 *
 * - 'freetheai' → OpenAI-compatible gateway (zero-cost tier). Chat only —
 *   embeddings stay on OpenAI regardless (gateway has no /embeddings route).
 * - 'openai'    → paid tier, also the fallback when the selected provider
 *   has no key configured.
 *
 * Returns null when no provider has a usable key; callers keep their
 * existing deterministic fallbacks for that case.
 */
export function createChatClient(env: Env): ChatClient | null {
  if (env.AI_CHAT_PROVIDER === 'freetheai' && env.FREETHEAI_API_KEY) {
    return {
      client: new OpenAI({
        apiKey: env.FREETHEAI_API_KEY,
        baseURL: env.FREETHEAI_BASE_URL,
      }),
      model: env.FREETHEAI_MODEL,
      provider: 'freetheai',
    };
  }

  if (env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({ apiKey: env.OPENAI_API_KEY }),
      model: env.OPENAI_MODEL,
      provider: 'openai',
    };
  }

  return null;
}
