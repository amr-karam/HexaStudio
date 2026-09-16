import { Controller, Post, Body, Headers, HttpException, HttpStatus, VERSION_NEUTRAL, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GitWebhookService } from './git-webhook.service';
import { GitWebhookPayloadDto } from './dto/git-webhook.dto';
import { GitWebhookGuard } from '../../common/guards/git-webhook.guard';

@ApiTags('Webhooks - Git')
@Controller({ path: 'webhooks/git', version: ['1', VERSION_NEUTRAL] })
export class GitWebhookController {
  constructor(private readonly gitWebhookService: GitWebhookService) {}

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
}
