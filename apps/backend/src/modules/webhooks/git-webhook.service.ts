import { Injectable, Logger } from '@nestjs/common';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class GitWebhookService {
  private readonly logger = new Logger(GitWebhookService.name);

  constructor(private readonly agentsService: AgentsService) {}

  async reviewPullRequest(payload: {
    prTitle: string;
    prDescription: string;
    diffSummary: string;
    repo: string;
    prNumber: number;
  }): Promise<{ reviewComment: string; status: 'approved' | 'changes_requested' }> {
    this.logger.log(`Reviewing PR #${payload.prNumber} in ${payload.repo} using HEXA-Reviewer agent...`);

    const prompt = `Review this Pull Request for architectural standards, TypeScript strictness, and security:
- Repo: ${payload.repo} (PR #${payload.prNumber})
- Title: ${payload.prTitle}
- Description: ${payload.prDescription}
- Diff Summary: ${payload.diffSummary}

Provide a structured markdown review comment with findings and a final recommendation (APPROVED or CHANGES_REQUESTED).`;

    const result = await this.agentsService.chat(prompt, 'code-review');

    const status = result.response.toUpperCase().includes('CHANGES_REQUESTED') ? 'changes_requested' : 'approved';

    return {
      reviewComment: result.response,
      status,
    };
  }
}
