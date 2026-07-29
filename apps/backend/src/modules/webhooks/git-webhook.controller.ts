import { Controller, Post, Body, Headers, HttpException, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GitWebhookService } from './git-webhook.service';

@ApiTags('Webhooks - Git')
@Controller({ path: 'webhooks/git', version: ['1', VERSION_NEUTRAL] })
export class GitWebhookController {
  constructor(private readonly gitWebhookService: GitWebhookService) {}

  @Post('pr-review')
  @ApiOperation({ summary: 'Automated PR review webhook for GitHub / GitLab' })
  @ApiResponse({ status: 200, description: 'PR reviewed by HEXA-Reviewer agent' })
  async handlePrReview(
    @Body() payload: { prTitle: string; prDescription: string; diffSummary: string; repo: string; prNumber: number },
    @Headers('x-github-event') githubEvent?: string,
    @Headers('x-gitlab-event') gitlabEvent?: string
  ) {
    if (!githubEvent && !gitlabEvent && !payload.prTitle) {
      throw new HttpException('Invalid webhook payload', HttpStatus.BAD_REQUEST);
    }

    return this.gitWebhookService.reviewPullRequest(payload);
  }
}
