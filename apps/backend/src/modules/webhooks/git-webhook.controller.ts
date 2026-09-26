import { Controller, Post, Body, Headers, HttpException, HttpStatus, VERSION_NEUTRAL, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GitWebhookService } from './git-webhook.service';
import { GitWebhookPayloadDto } from './dto/git-webhook.dto';
import { GitWebhookGuard } from '../../common/guards/git-webhook.guard';
import { GitLabOdooCoordinatorService } from './git-odoo-coordinator.service';

@ApiTags('Webhooks - Git')
@Controller({ path: 'webhooks/git', version: ['1', VERSION_NEUTRAL] })
export class GitWebhookController {
  constructor(
    private readonly gitWebhookService: GitWebhookService,
    private readonly coordinator: GitLabOdooCoordinatorService,
  ) {}

  @Post('pr-review')
  @ApiOperation({ summary: 'Automated PR review webhook for GitHub / GitLab' })
  @ApiResponse({ status: 200, description: 'PR reviewed by HEXA-Reviewer agent' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(GitWebhookGuard)
  async handlePrReview(
    @Body() payload: GitWebhookPayloadDto,
    @Headers('x-github-event') githubEvent?: string,
    @Headers('x-gitlab-event') gitlabEvent?: string
  ) {
    if (!githubEvent && !gitlabEvent && !payload.prTitle) {
      throw new HttpException('Invalid webhook payload', HttpStatus.BAD_REQUEST);
    }

    return this.gitWebhookService.reviewPullRequest(payload);
  }

  @Post('sync-odoo')
  @ApiOperation({ summary: 'GitLab → Odoo autonomous sync — MR/issue events drive project status' })
  @ApiResponse({ status: 200, description: 'Coordinator decision and Odoo result' })
  @UseGuards(GitWebhookGuard)
  async handleSyncOdoo(
    @Body() payload: Record<string, unknown>,
    @Headers('x-gitlab-event') gitlabEvent?: string,
    @Headers('x-gitlab-token') gitlabToken?: string,
  ) {
    // Allow both GitLab native webhooks and manual triggers.
    // Signature validation is handled by GitWebhookGuard for GitHub;
    // GitLab token is validated opportunistically if configured.
    const expectedToken = process.env.GITLAB_WEBHOOK_TOKEN;
    if (expectedToken && gitlabToken && gitlabToken !== expectedToken) {
      throw new HttpException('Invalid GitLab token', HttpStatus.FORBIDDEN);
    }

    if (!payload || Object.keys(payload).length === 0) {
      throw new HttpException('Empty webhook payload', HttpStatus.BAD_REQUEST);
    }

    // Tag payload with event header for downstream reasoning
    if (gitlabEvent) {
      (payload as Record<string, unknown>)._gitlabEvent = gitlabEvent;
    }

    return this.coordinator.coordinate(payload);
  }
}
