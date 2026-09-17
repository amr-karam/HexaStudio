export const AGENTS_PORT = Symbol('AGENTS_PORT');

export interface AgentsPort {
  // Define methods needed by other modules
  chat(prompt: string, persona: string): Promise<{ response: string }>;
  reviewPullRequest(payload: Record<string, unknown>): Promise<unknown>;
}
