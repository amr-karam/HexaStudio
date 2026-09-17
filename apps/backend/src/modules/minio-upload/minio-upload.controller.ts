import { Controller, Post, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MinioUploadService } from './minio-upload.service';
import { UploadDto } from './dto/upload.dto';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags('MinIO Upload')
@ApiBearerAuth()
@Controller('projects')
export class MinioUploadController {
  constructor(private readonly minioUploadService: MinioUploadService) {}

  @Post(':projectId/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a MinIO presigned PUT URL for project deliverable upload' })
  @ApiParam({ name: 'projectId', description: 'Odoo project ID', type: Number })
  @ApiResponse({ status: 200, description: 'Presigned URL and upload metadata' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async generateUploadUrl(
    @Param('projectId') projectId: number,
    @Body() dto: UploadDto,
  ): Promise<UploadResponseDto> {
    return this.minioUploadService.generateUploadUrl(projectId, dto);
  }
}
