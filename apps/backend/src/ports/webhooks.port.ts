export const WEBHOOKS_PORT = Symbol('WEBHOOKS_PORT');

export interface WebhooksPort {
  // Define methods needed by other modules
  handleGitWebhook(payload: Record<string, unknown>): Promise<unknown>;
}
