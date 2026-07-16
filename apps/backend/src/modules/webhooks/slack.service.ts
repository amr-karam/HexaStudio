import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { getEnv } from '../../config/env';
import { firstValueFrom } from 'rxjs';

interface SlackMessage {
  text?: string;
  blocks?: unknown[];
}

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(private readonly http: HttpService) {}

  async sendMessage(message: SlackMessage): Promise<boolean> {
    const webhookUrl = getEnv().SLACK_WEBHOOK_URL;
    if (!webhookUrl) return false;

    try {
      const body: SlackMessage = {};
      if (message.blocks) {
        body.blocks = message.blocks;
      } else if (message.text) {
        body.text = message.text;
      }

      await firstValueFrom(this.http.post(webhookUrl, body));
      return true;
    } catch (error) {
      this.logger.error('Failed to send Slack message', error);
      return false;
    }
  }

  formatApprovalMessage(payload: {
    projectId: string;
    phaseId: string;
    action: string;
    comment?: string;
    userId: string;
  }) {
    const emoji: Record<string, string> = {
      submit: '📋',
      approve: '✅',
      reject: '❌',
      revision: '🔄',
    };

    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji[payload.action] || '📢'} Phase Approval ${payload.action.charAt(0).toUpperCase() + payload.action.slice(1)}`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Project:*\n<${getEnv().CMS_URL}/projects/${payload.projectId}|${payload.projectId}>` },
            { type: 'mrkdwn', text: `*Phase:*\n${payload.phaseId}` },
            { type: 'mrkdwn', text: `*Action:*\n${payload.action}` },
            { type: 'mrkdwn', text: `*By:*\n${payload.userId}` },
          ],
        },
        ...(payload.comment
          ? [
              {
                type: 'section',
                text: { type: 'mrkdwn', text: `*Comment:*\n${payload.comment}` },
              },
            ]
          : []),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `HEXA Studio • ${new Date().toLocaleString()}`,
            },
          ],
        },
      ],
    };
  }

  formatAnnotationMessage(payload: {
    projectId: string;
    annotation: { id: string; content: string; author: string; type: string };
  }) {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📍 New ${payload.annotation.type} Annotation`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Project:*\n${payload.projectId}` },
            { type: 'mrkdwn', text: `*Author:*\n${payload.annotation.author}` },
          ],
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Note:*\n${payload.annotation.content}` },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `HEXA Studio • ${new Date().toLocaleString()}` }],
        },
      ],
    };
  }

  formatProjectUpdateMessage(projectId: string, data: unknown) {
    return {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '📌 Project Updated' },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Project:* <${getEnv().CMS_URL}/projects/${projectId}|${projectId}>` },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: '```' + JSON.stringify(data, null, 2) + '```' },
        },
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `HEXA Studio • ${new Date().toLocaleString()}` }],
        },
      ],
    };
  }
}
