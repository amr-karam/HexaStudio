import { Controller, Get, Param, NotFoundException, UseGuards, Req, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import type { User } from '@hexastudio/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('Users')
@Controller({ path: 'users', version: ['1', VERSION_NEUTRAL] })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user profile (data: null when unauthenticated)',
    description:
      'Public "who am I" endpoint. Returns the authenticated user when a valid ' +
      'session/token is present, or 200 with `data: null` for anonymous visitors ' +
      '(avoids noisy 401s on public pages).',
  })
  @ApiResponse({ status: 200, description: 'Current user profile, or { data: null } when unauthenticated' })
  async findMe(
    @Req() req: { user?: User },
  ): Promise<User | { data: null }> {
    return req.user ?? { data: null };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
