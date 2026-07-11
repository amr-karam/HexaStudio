import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { User } from '@hexastudio/types';
import { RequestsService, ProjectRequest } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

class CreateRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  projectId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: ProjectRequest['priority'];
}

class UpdateStatusDto {
  @IsIn(['pending', 'reviewed', 'completed'])
  status!: ProjectRequest['status'];
}

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Body() data: CreateRequestDto): Promise<ProjectRequest> {
    return this.requestsService.createRequest(data);
  }

  @Get('client/:clientId')
  async findByClient(
    @Param('clientId') clientId: string,
    @Request() req: { user: User },
  ): Promise<ProjectRequest[]> {
    // Non-admins may only read their own requests
    if (req.user.role !== 'admin' && req.user.id !== clientId) {
      throw new ForbiddenException('You may only access your own requests');
    }
    return this.requestsService.getRequestsByClient(clientId);
  }

  @Get('admin')
  @Roles('admin')
  async findAllAdmin(): Promise<ProjectRequest[]> {
    return this.requestsService.findAll();
  }

  @Patch(':id/status')
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ): Promise<ProjectRequest> {
    return this.requestsService.updateRequestStatus(id, body.status);
  }
}
