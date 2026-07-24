import { Controller, Post, Get, Patch, Param, Body, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Annotations')
@Controller({ path: 'annotations', version: ['1', VERSION_NEUTRAL] })
export class AnnotationsController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an annotation to a project' })
  async addAnnotation(@Body() body: {
    projectId: string;
    type: 'text' | 'drawing' | 'pin';
    position: { x: number; y: number; z?: number };
    content: string;
    author: string;
    resolved?: boolean;
  }) {
    return this.approvalService.addAnnotation({ ...body, resolved: body.resolved ?? false });
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve an annotation' })
  async resolveAnnotation(@Param('id') id: string) {
    return this.approvalService.resolveAnnotation(id);
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all annotations for a project' })
  async getProjectAnnotations(@Param('projectId') projectId: string) {
    return this.approvalService.getAnnotations(projectId);
  }
}
