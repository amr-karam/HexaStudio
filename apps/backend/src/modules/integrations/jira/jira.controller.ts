import { Controller, Get, Post, Body, Param, VERSION_NEUTRAL } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller({ path: 'integrations/jira', version: VERSION_NEUTRAL })
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('status')
  getStatus() {
    return {
      configured: this.jiraService.isConfigured,
      provider: 'jira',
    };
  }

  @Get('projects')
  async getProjects() {
    return this.jiraService.getProjects();
  }

  @Get('projects/:key/issues')
  async getIssues(@Param('key') projectKey: string) {
    return this.jiraService.getIssues(projectKey);
  }

  @Post('projects/:key/issues')
  async createIssue(
    @Param('key') projectKey: string,
    @Body() body: { summary: string; description?: string; issueType?: string },
  ) {
    const issueKey = await this.jiraService.createIssue(
      projectKey,
      body.summary,
      body.description,
      body.issueType,
    );
    return { success: !!issueKey, issueKey };
  }

  @Post('issues/:key/transition')
  async transitionIssue(
    @Param('key') issueKey: string,
    @Body() body: { transition: string },
  ) {
    const success = await this.jiraService.transitionIssue(issueKey, body.transition);
    return { success };
  }
}
