import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Approvals')
@Controller({ path: 'approvals', version: '1' })
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a phase for approval' })
  async submitPhase(
    @Body() body: { projectId: string; phaseName: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.approvalService.submitPhase(body.projectId, body.phaseName, req.user.id);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review a submitted phase' })
  async reviewPhase(
    @Param('id') id: string,
    @Body() body: { action: 'approved' | 'rejected' | 'revision'; comment?: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.approvalService.reviewPhase(id, body.action, req.user.id, body.comment);
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all phase approvals for a project' })
  async getProjectApprovals(@Param('projectId') projectId: string) {
    return this.approvalService.getPhaseApprovals(projectId);
  }
}
