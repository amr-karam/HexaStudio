import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../storage/redis.service';
import type { Env } from '../../config/env';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Single message to be sent via Expo Push API. */
interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'high' | 'normal';
}

/** A ticket returned by Expo for each push notification in a batch. */
interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

/** Top-level response from POST /api/v2/push/send. */
interface ExpoPushResponse {
  data: ExpoPushTicket[];
  errors?: Array<{ code: string; message: string }>;
}

/** Result of a single push notification attempt. */
export interface PushResult {
  success: boolean;
  error?: string;
}

/** Message payload accepted by sendBulkPush. */
export interface BulkPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/** Result entry returned by sendBulkPush (one per message). */
export interface BulkPushResult {
  status: string;
  message?: string;
}

/** Aggregate result returned by sendPushToUser / sendPushToUsers. */
export interface MultiPushResult {
  sent: number;
  failed: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';
const PUSH_TOKEN_PREFIX = 'mobile:push-token:';
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000;

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class MobilePushService {
  private readonly logger = new Logger(MobilePushService.name);
  private readonly expoAccessToken: string | undefined;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly redis: RedisService,
  ) {
    this.expoAccessToken = this.configService.get<string>('EXPO_ACCESS_TOKEN');
  }

  // -----------------------------------------------------------------------
  //  Public API
  // -----------------------------------------------------------------------

  /**
   * Send a push notification to a single Expo push token.
   *
   * @param token - The Expo push token (e.g. `ExponentPushToken[...]`)
   * @param title - Notification title
   * @param body  - Notification body text
   * @param data  - Optional payload data (e.g. `{ screen: 'projects' }`)
   * @returns `{ success, error? }`
   */
  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<PushResult> {
    const results = await this.sendBulkPush([{ to: token, title, body, data }]);
    const first = results[0];
    if (!first) {
      return { success: false, error: 'No response from push API' };
    }
    if (first.status === 'ok') {
      return { success: true };
    }
    return { success: false, error: first.message };
  }

  /**
   * Send a push notification to **all** registered devices for a single user.
   *
   * @param userId - User ID whose push tokens should receive the notification
   * @param title  - Notification title
   * @param body   - Notification body text
   * @param data   - Optional payload data
   * @returns `{ sent, failed }` aggregated across the user's tokens
   */
  async sendPushToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<MultiPushResult> {
    const tokens = await this.getStoredTokens(userId);
    if (tokens.length === 0) {
      this.logger.debug(`No push tokens found for user ${userId}`);
      return { sent: 0, failed: 0 };
    }

    const messages: BulkPushMessage[] = tokens.map((t) => ({
      to: t.token,
      title,
      body,
      data,
    }));

    const results = await this.sendBulkPush(messages);
    return this.aggregateResults(results);
  }

  /**
   * Send a push notification to **all** registered devices for multiple users.
   *
   * @param userIds - Array of user IDs
   * @param title   - Notification title
   * @param body    - Notification body text
   * @param data    - Optional payload data
   * @returns `{ sent, failed }` aggregated across all users' tokens
   */
  async sendPushToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<MultiPushResult> {
    if (userIds.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const allTokens = await Promise.all(userIds.map((uid) => this.getStoredTokens(uid)));
    const messages: BulkPushMessage[] = [];

    for (const tokens of allTokens) {
      for (const t of tokens) {
        messages.push({ to: t.token, title, body, data });
      }
    }

    if (messages.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const results = await this.sendBulkPush(messages);
    return this.aggregateResults(results);
  }

  /**
   * Send multiple push notifications in a single API call to Expo.
   *
   * Handles response processing including:
   * - `DeviceNotRegistered` — removes the token from Redis
   * - `MessageTooBig` — logs a warning
   * - `InvalidCredentials` — logs an error
   *
   * Transient failures are retried once with a 1-second delay.
   *
   * @param messages - Array of messages with `to`, `title`, `body`, and optional `data`
   * @returns Array of result objects in the same order as input messages
   */
  async sendBulkPush(messages: BulkPushMessage[]): Promise<BulkPushResult[]> {
    if (messages.length === 0) {
      return [];
    }

    const body = this.buildExpoPayload(messages);

    let lastError: Error | undefined;
    let response: ExpoPushResponse | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const raw = await this.rawFetch(body);

        if (raw.ok) {
          response = (await raw.json()) as ExpoPushResponse;
          break;
        }

        // Non-2xx — try to parse error body for logging
        const errorBody = await raw.text();
        lastError = new Error(`Expo API returned ${raw.status}: ${errorBody}`);

        if (attempt < MAX_RETRIES) {
          this.logger.warn(`Expo API transient failure (${raw.status}), retrying in ${RETRY_DELAY_MS}ms…`);
          await this.sleep(RETRY_DELAY_MS);
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < MAX_RETRIES) {
          this.logger.warn(`Expo API network error, retrying in ${RETRY_DELAY_MS}ms…`);
          await this.sleep(RETRY_DELAY_MS);
        }
      }
    }

    // If all attempts failed, return error for every message
    if (!response) {
      const errMsg = lastError?.message ?? 'Expo API unreachable after retries';
      this.logger.error(errMsg);
      return messages.map(() => ({ status: 'error', message: errMsg }));
    }

    // Process response tickets
    return this.processTickets(messages, response);
  }

  // -----------------------------------------------------------------------
  //  Convenience / Domain Helpers
  // -----------------------------------------------------------------------

  /**
   * Notify project members about a general project update.
   *
   * @param projectId - Project identifier (included in `data`)
   * @param userIds   - Recipient user IDs
   * @param message   - Notification body text
   */
  async notifyProjectUpdate(
    projectId: string,
    userIds: string[],
    message: string,
  ): Promise<MultiPushResult> {
    return this.sendPushToUsers(userIds, 'Project Update', message, {
      screen: 'project',
      projectId,
    });
  }

  /**
   * Notify users that their approval is required for a project phase.
   *
   * @param projectId - Project identifier
   * @param userIds   - Recipient user IDs (approvers)
   * @param phaseName - Name of the phase requiring approval
   */
  async notifyApprovalRequired(
    projectId: string,
    userIds: string[],
    phaseName: string,
  ): Promise<MultiPushResult> {
    return this.sendPushToUsers(userIds, 'Approval Required', `Phase "${phaseName}" needs your review`, {
      screen: 'approval',
      projectId,
      phase: phaseName,
    });
  }

  /**
   * Notify users that a project milestone has been reached.
   *
   * @param projectId    - Project identifier
   * @param userIds      - Recipient user IDs
   * @param milestoneName - Name of the milestone reached
   */
  async notifyMilestoneReached(
    projectId: string,
    userIds: string[],
    milestoneName: string,
  ): Promise<MultiPushResult> {
    return this.sendPushToUsers(userIds, 'Milestone Reached', `"${milestoneName}" completed`, {
      screen: 'milestones',
      projectId,
      milestone: milestoneName,
    });
  }

  /**
   * Notify users that a document has been uploaded to a project.
   *
   * @param projectId    - Project identifier
   * @param userIds      - Recipient user IDs
   * @param documentName - Name of the uploaded document
   */
  async notifyDocumentUploaded(
    projectId: string,
    userIds: string[],
    documentName: string,
  ): Promise<MultiPushResult> {
    return this.sendPushToUsers(userIds, 'Document Uploaded', `"${documentName}" has been uploaded`, {
      screen: 'documents',
      projectId,
      document: documentName,
    });
  }

  // -----------------------------------------------------------------------
  //  Private helpers
  // -----------------------------------------------------------------------

  /**
   * Read all stored push tokens for a given user from Redis.
   * Tokens are stored as JSON-stringified objects in a Redis set.
   */
  private async getStoredTokens(
    userId: string,
  ): Promise<Array<{ token: string; platform: string; updatedAt: number }>> {
    const raw = await this.redis.smembers(`${PUSH_TOKEN_PREFIX}${userId}`);
    return raw
      .map((item) => {
        try {
          return JSON.parse(item) as { token: string; platform: string; updatedAt: number };
        } catch {
          return null;
        }
      })
      .filter((item): item is { token: string; platform: string; updatedAt: number } => item !== null);
  }

  /**
   * Build the request body for the Expo Push API with default fields.
   */
  private buildExpoPayload(messages: BulkPushMessage[]): ExpoPushMessage[] {
    return messages.map((msg) => ({
      to: msg.to,
      title: msg.title,
      body: msg.body,
      data: msg.data,
      sound: 'default',
      priority: 'high',
    }));
  }

  /**
   * Execute the raw HTTP POST to Expo Push API.
   */
  private async rawFetch(body: ExpoPushMessage[]): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.expoAccessToken) {
      headers['Authorization'] = `Bearer ${this.expoAccessToken}`;
    }

    return fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  /**
   * Process Expo ticket response — clean up invalid tokens and map results.
   */
  private async processTickets(
    messages: BulkPushMessage[],
    response: ExpoPushResponse,
  ): Promise<BulkPushResult[]> {
    const results: BulkPushResult[] = [];

    for (let i = 0; i < messages.length; i++) {
      const ticket = response.data[i];
      const msg = messages[i];

      if (!ticket) {
        results.push({ status: 'error', message: 'No ticket returned for message' });
        continue;
      }

      if (ticket.status === 'ok') {
        results.push({ status: 'ok', message: ticket.id });
        continue;
      }

      // --- Error handling based on Expo error codes ---
      const errorCode = ticket.details?.error ?? '';
      const errorMessage = ticket.message ?? 'Unknown push error';

      switch (errorCode) {
        case 'DeviceNotRegistered': {
          this.logger.warn(`Device not registered, removing token: ${maskToken(msg.to)}`);
          await this.removeTokenByValue(msg.to);
          results.push({ status: 'error', message: 'DeviceNotRegistered — token removed' });
          break;
        }
        case 'MessageTooBig': {
          this.logger.warn(`Push message too big for token ${maskToken(msg.to)}: ${errorMessage}`);
          results.push({ status: 'error', message: `MessageTooBig: ${errorMessage}` });
          break;
        }
        case 'InvalidCredentials': {
          this.logger.error(`Invalid Expo credentials — check EXPO_ACCESS_TOKEN`);
          results.push({ status: 'error', message: `InvalidCredentials: ${errorMessage}` });
          break;
        }
        default: {
          // Check if the error message itself contains DeviceNotRegistered (fallback)
          if (errorMessage.includes('DeviceNotRegistered') || errorMessage.includes('not a registered')) {
            this.logger.warn(`Device not registered (message parse), removing token: ${maskToken(msg.to)}`);
            await this.removeTokenByValue(msg.to);
            results.push({ status: 'error', message: 'DeviceNotRegistered — token removed' });
          } else {
            results.push({ status: 'error', message: `${errorCode}: ${errorMessage}` });
          }
        }
      }
    }

    return results;
  }

  /**
   * Remove a push token from **all** Redis sets that contain it.
   *
   * Iterates over Redis keys matching `mobile:push-token:*` using the
   * non-blocking SCAN command. For each key the set members are checked
   * and the JSON member whose `token` field matches is removed.
   */
  private async removeTokenByValue(token: string): Promise<void> {
    let cursor = '0';
    const pattern = `${PUSH_TOKEN_PREFIX}*`;

    try {
      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, pattern, 100);
        cursor = nextCursor;

        for (const key of keys) {
          const members = await this.redis.smembers(key);
          for (const member of members) {
            try {
              const parsed = JSON.parse(member) as { token: string };
              if (parsed.token === token) {
                await this.redis.srem(key, member);
                this.logger.debug(`Removed token from Redis key: ${key}`);
              }
            } catch {
              // Skipping unparseable member
            }
          }
        }
      } while (cursor !== '0');
    } catch (err: unknown) {
      this.logger.error(
        `Failed to remove token ${maskToken(token)}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /**
   * Aggregate result entries into a `{ sent, failed }` summary.
   */
  private aggregateResults(results: BulkPushResult[]): MultiPushResult {
    let sent = 0;
    let failed = 0;
    for (const r of results) {
      if (r.status === 'ok') {
        sent++;
      } else {
        failed++;
      }
    }
    return { sent, failed };
  }

  /**
   * Promise-based delay.
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Mask an Expo push token for safe logging — shows only first 20 chars.
 */
function maskToken(token: string): string {
  if (token.length <= 24) {
    return token.substring(0, 12) + '…';
  }
  return token.substring(0, 20) + '…';
}