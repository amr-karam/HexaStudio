import { Controller, Get, Param, Query, VERSION_NEUTRAL } from '@nestjs/common';
import { TeamMembersService } from './team-members.service';
import type { TeamMember, TeamMemberResponse } from '@hexastudio/types';

@Controller({ path: 'team-members', version: VERSION_NEUTRAL })
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Get()
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
  async findOne(@Param('slug') slug: string): Promise<TeamMember> {
    return this.teamMembersService.getTeamMemberBySlug(slug);
  }
}
