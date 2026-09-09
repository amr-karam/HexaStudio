/**
 * HEXA ONE OS — shared types for the Hermes + OpenCode perfect merge.
 *
 * Hermes is the brain (memory, skills, gateway, desktop shell).
 * OpenCode is the hands (autonomous code execution).
 * ONE-OS is the single router, session and memory contract over both.
 *
 * Security: this module never carries secrets (no API keys, no tokens).
 * Secrets stay in `~/.hermes/.env` / process env and are only probed as booleans.
 */

export type OneOsRoute = 'hermes' | 'opencode' | 'hybrid';

export type OneOsIntentKind =
  | 'memory'
  | 'skill'
  | 'gateway'
  | 'desktop-ui'
  | 'code-build'
  | 'code-review'
  | 'hybrid';

export interface OneOsIntent {
  kind: OneOsIntentKind;
  route: OneOsRoute;
  /** 0..1 deterministic confidence of the router. */
  confidence: number;
  reason: string;
}

export interface OneOsSessionRef {
  /** Canonical ONE-OS id, e.g. `one_1725900000000_k3j8s2`. */
  oneId: string;
  hermesSessionId?: string;
  opencodeSessionId?: string;
  createdAt: number;
  expiresAt: number;
  ttl: number;
}

export interface OneOsConfig {
  hermesHome: string;
  hermesProfile: string;
  opencodeConfigPath: string;
  honchoBaseUrl: string;
  repoPath: string;
  sessionTtl: number;
  /** True when HONCHO_API_KEY is present. The key itself is never returned. */
  hasHonchoKey: boolean;
}

export interface OneOsMemoryInputs {
  hermesWorkspaceId: string;
  hermesPeerId: string;
  hermesRepresentation: string;
  opencodeProjectName: string;
  opencodeStack: string[];
  bridgeSessionCount: number;
  recentSummaries: string[];
}

export interface OneOsResult {
  ok: boolean;
  route: OneOsRoute;
  oneId: string;
  summary: string;
  output?: unknown;
  hermesSessionId?: string;
  opencodeSessionId?: string;
  error?: string;
}

export type HermesExecutor = (
  prompt: string,
  sessionId?: string,
) => Promise<{ output: string; sessionId: string }>;

export type OpencodeExecutor = (
  agent: string,
  prompt: string,
  sessionId?: string,
) => Promise<{ output: unknown; sessionId: string }>;
