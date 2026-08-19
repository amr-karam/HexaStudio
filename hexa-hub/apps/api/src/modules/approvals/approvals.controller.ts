import { Controller, Get, Post, Put, Body, Param, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { ApprovalsService } from './approvals.service';
import { Approval } from './entities/approval.entity';
import { User } from '../users/entities/user.entity';

interface AuthRequest extends Request {
  user: { id: string; email: string; role: string };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  findAll() { return this.approvalsService.findAll(); }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.approvalsService.findOne(id); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  create(@Body() data: Partial<Approval>, @Request() req: AuthRequest) {
    return this.approvalsService.create({ ...data, requestedBy: { id: req.user.id } as User });
  }

  @Put(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  approve(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthRequest, @Body() body: { note?: string }) {
    return this.approvalsService.approve(id, req.user.id, body.note);
  }

  @Put(':id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
  reject(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthRequest, @Body() body: { note?: string }) {
    return this.approvalsService.reject(id, req.user.id, body.note);
  }
}
