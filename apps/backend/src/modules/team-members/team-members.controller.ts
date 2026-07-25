import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TeamMembersService } from './team-members.service';
import type { TeamMember, TeamMemberResponse } from '@hexastudio/types';

@ApiTags('TeamMembers')
@Controller({ path: 'team-members', version: ['1', VERSION_NEUTRAL] })
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all team members with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of team members' })
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
  @ApiResponse({ status: 200, description: 'Team member found' })
  async findOne(@Param('slug') slug: string): Promise<TeamMember> {
    return this.teamMembersService.getTeamMemberBySlug(slug);
  }
}
