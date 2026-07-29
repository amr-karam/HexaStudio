import { Injectable } from '@nestjs/common';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ParsedMention {
  raw: string;         // The full matched string, e.g. "@john" or "@all"
  username: string;    // The username without @, e.g. "john" or "all"
  isAll: boolean;      // Is this @all or @here?
  isRole: boolean;     // Is this @role:something?
  role?: string;       // The role name if isRole is true
  startIndex: number;  // Position in the original text
  endIndex: number;
}

export interface MentionNotification {
  mentionedUserId: string;
  mentionedByUserId: string;
  context: string;       // The message content (truncated)
  channelId?: string;
  messageId: string;
  isDM: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MENTION_REGEX = /@([a-zA-Z0-9_.-]+(?::[a-zA-Z0-9_.-]+)?)/g;
const ALL_PATTERNS = ['all', 'here', 'channel', 'everyone'];
const ROLE_PREFIX = 'role:';

// ─── Service ────────────────────────────────────────────────────────────────

/**
 * MentionService
 *
 * Parses @mentions from message content. Supports:
 * - @username — mentions a specific user
 * - @all / @here / @channel / @everyone — mentions everyone in the channel
 * - @role:admin / @role:employee — mentions all users with a specific role
 */
@Injectable()
export class MentionService {
  /**
   * Extract all mentions from a text string.
   */
  parseMentions(text: string): ParsedMention[] {
    const mentions: ParsedMention[] = [];
    const regex = new RegExp(MENTION_REGEX.source, 'g');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const username = match[1];

      mentions.push({
        raw: match[0],
        username,
        isAll: ALL_PATTERNS.includes(username.toLowerCase()),
        isRole: username.toLowerCase().startsWith(ROLE_PREFIX),
        role: username.toLowerCase().startsWith(ROLE_PREFIX)
          ? username.slice(ROLE_PREFIX.length)
          : undefined,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return mentions;
  }

  /**
   * Resolve mentions to concrete user IDs that should be notified.
   * For @all, returns ALL_MEMBERS sentinel value.
   */
  resolveMentionTargets(
    mentions: ParsedMention[],
  ): {
    specificUsers: string[];
    notifyAll: boolean;
    notifyRoles: string[];
  } {
    const specificUsers: string[] = [];
    let notifyAll = false;
    const notifyRoles: string[] = [];

    for (const mention of mentions) {
      if (mention.isAll) {
        notifyAll = true;
      } else if (mention.isRole && mention.role) {
        notifyRoles.push(mention.role);
      } else {
        // Find user by username — this is resolved by caller who has DB access
        // For now, store the username; the caller resolves it to an ID
        // We leave this for the integration layer
      }
    }

    return { specificUsers, notifyAll, notifyRoles };
  }

  /**
   * Format a message with highlighted mentions for display.
   * Wraps mentions in a special marker for frontend rendering.
   */
  highlightMentions(text: string): string {
    return text.replace(MENTION_REGEX, (match, username) => {
      const isAll = ALL_PATTERNS.includes(username.toLowerCase());
      const cssClass = isAll ? 'mention-all' : 'mention-user';
      return `<span class="${cssClass}" data-mention="${username}">${match}</span>`;
    });
  }

  /**
   * Get a list of mentionable user names from a message.
   * Used for notification dispatching.
   */
  getMentionedUsernames(text: string): string[] {
    const mentions = this.parseMentions(text);
    return mentions
      .filter((m) => !m.isAll && !m.isRole)
      .map((m) => m.username);
  }
}