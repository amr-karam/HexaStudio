import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TeamMembersService } from './team-members.service';
import type { TeamMember, TeamMemberResponse } from '@hexastudio/types';

@ApiTags('TeamMembers')
@Controller({ path: 'team-members', version: '1' })
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all team members with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<TeamMemberResponse> {
    return this.teamMembersService.getAllTeamMembers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get team member by slug' })
  async findOne(@Param('slug') slug: string): Promise<TeamMember> {
    return this.teamMembersService.getTeamMemberBySlug(slug);
  }
}
