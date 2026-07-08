import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService, User } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(): Promise<User> {
    const user = await this.usersService.findById('1');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}
