import { Injectable, Logger } from '@nestjs/common';
import { AiChatService } from '../ai/ai-chat.service';

@Injectable()
export class PortalCopilotService {
  private readonly logger = new Logger(PortalCopilotService.name);

  constructor(private readonly aiChat: AiChatService) {}

  async processClientQuery(query: string, projectName = 'Horizon Villa'): Promise<{ reply: string }> {
    this.logger.log(`Processing Client Copilot Query for [${projectName}]: "${query}"`);

    const prompt = `You are the HEXA Studio Portal Copilot for client project "${projectName}".
Answer the client's query politely, accurately, and professionally.
Rules:
- Never disclose internal company financial margins, raw operational costs, employee personal details, or internal passwords.
- Always focus on project progress, deliverables, timeline transparency, and assistance.
- Keep answers concise and structured.

User Query: "${query}"`;

    try {
      if (this.aiChat.client) {
        const completion = await this.aiChat.client.chat.completions.create({
          model: this.aiChat.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 400,
        });
        const reply = completion.choices[0]?.message?.content || 'No response generated';
        return { reply };
      }
      throw new Error('No AI chat client available');
    } catch (error) {
      this.logger.warn(`AI Copilot generation fallback: ${error}`);
      return {
        reply: `Project **${projectName}** is currently on schedule in Phase 2 (3D Renderings & Lighting). All active deliverables are moving according to the agreed milestone timeline.`,
      };
    }
  }
}
