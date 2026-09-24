export interface SlackMessage {
  text?: string;
  blocks?: unknown[];
}

export interface WebhooksPort {
  registerWebhook(url: string, events: string[]): Promise<{ id: string }>;
  unregisterWebhook(id: string): Promise<boolean>;
  triggerWebhook(id: string, payload: Record<string, unknown>): Promise<boolean>;
  // SlackService method
  sendMessage(message: SlackMessage): Promise<boolean>;
}

export const WEBHOOKS_PORT = Symbol('WEBHOOKS_PORT');