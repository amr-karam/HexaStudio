import OpenAI from 'openai';
import type { Env } from '../../config/env';

export interface ChatClient {
  client: OpenAI;
  model: string;
  provider: 'openai' | 'freetheai' | 'local';
  /** Small/fast model for simple queries — only set for 'local' (LM Studio routing). */
  fastModel?: string;
}

/**
 * Sanitizes user-supplied prompt text before it reaches an LLM provider.
 *
 * - Trims surrounding whitespace.
 * - Strips ASCII control characters (excluding \n, \t, \r) — neutralizes null
 *   bytes, terminal escape sequences, and other invisible injection payloads
 *   without touching normal content.
 *
 * Length limits are enforced upstream by DTO validation.
 */
export function sanitizePrompt(input: string): string {
  const trimmed = input.trim();
  let result = '';
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    const isLineBreak = code === 0x0a || code === 0x0d || code === 0x09; // \n, \r, \t
    const isPrintable = code >= 0x20 && code !== 0x7f; // printable ASCII, excluding DEL
    if (isLineBreak || isPrintable) {
      result += trimmed[i];
    }
  }
  return result;
}

/**
 * Resolves the chat LLM client from AI_CHAT_PROVIDER.
 *
 * - 'local'     → LM Studio self-hosted server (OpenAI-compatible,
 *                 free & unlimited, no API key required).
 * - 'freetheai' → OpenAI-compatible gateway (zero-cost tier). Chat only —
 *                 embeddings stay on OpenAI regardless (gateway has no /embeddings route).
 * - 'openai'    → paid tier, also the fallback when the selected provider
 *                 has no key configured.
 *
 * Returns null when no provider is usable; callers keep their
 * existing deterministic fallbacks for that case.
 */
export function createChatClient(env: Env): ChatClient | null {
  if (env.AI_CHAT_PROVIDER === 'local') {
    return {
      client: new OpenAI({
        apiKey: 'lm-studio',
        baseURL: env.LM_STUDIO_BASE_URL,
      }),
      model: env.LM_STUDIO_MODEL,
      fastModel: env.LM_STUDIO_FAST_MODEL,
      provider: 'local',
    };
  }

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
