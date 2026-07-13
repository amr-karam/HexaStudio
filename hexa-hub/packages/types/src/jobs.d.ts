export declare const QUEUE_NAMES: {
    readonly EMAIL: "email";
    readonly NOTIFICATIONS: "notifications";
    readonly AI: "ai";
};
export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export interface EmailJobPayload {
    to: string;
    subject: string;
    template: string;
    context?: Record<string, unknown>;
}
export interface NotificationJobPayload {
    userId: string;
    title: string;
    body: string;
    channel?: 'in_app' | 'email' | 'push';
    metadata?: Record<string, unknown>;
}
export interface AiJobPayload {
    userId: string;
    prompt: string;
    taskType: 'summary' | 'action_items' | 'search' | 'custom';
    context?: Record<string, unknown>;
}
//# sourceMappingURL=jobs.d.ts.map