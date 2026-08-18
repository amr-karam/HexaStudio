import { Controller, Get, Query, UseGuards, BadRequestException, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MinioService } from './minio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// User-facing buckets only. Internal buckets (e.g. 'backups') must never be
// presignable by authenticated users through this controller.
const USER_FACING_BUCKETS = ['uploads', 'models', 'textures', 'videos', 'hdr'] as const;

@ApiTags('Storage')
@Controller({ path: 'storage', version: ['1', VERSION_NEUTRAL] })
export class StorageController {
  constructor(private readonly minioService: MinioService) {}

  private validateUserFacingBucket(bucket: string): void {
    if (!USER_FACING_BUCKETS.includes(bucket as typeof USER_FACING_BUCKETS[number])) {
      throw new BadRequestException(
        `Bucket "${bucket}" is not allowed for this operation. Allowed: ${USER_FACING_BUCKETS.join(', ')}`,
      );
    }
  }

  @Get('download-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a presigned download URL' })
  @ApiQuery({ name: 'bucket', required: true, enum: [...USER_FACING_BUCKETS] })
  @ApiQuery({ name: 'path', required: true })
  @ApiQuery({ name: 'expiry', required: false, description: 'URL expiry in seconds (60-86400, default: 3600)' })
  async getDownloadUrl(
    @Query('bucket') bucket: string,
    @Query('path') path: string,
    @Query('expiry') expiry?: string,
  ): Promise<{ url: string }> {
    this.validateUserFacingBucket(bucket);
    const expiryNum = expiry ? parseInt(expiry, 10) : 3600;
    if (isNaN(expiryNum) || expiryNum < 60 || expiryNum > 86400) {
      throw new BadRequestException('expiry must be between 60 and 86400 seconds');
    }
    const url = await this.minioService.getPresignedDownloadUrl(bucket, path, expiryNum);
    return { url };
  }

  @Get('upload-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a presigned upload URL' })
  @ApiQuery({ name: 'bucket', required: true, enum: [...USER_FACING_BUCKETS] })
  @ApiQuery({ name: 'path', required: true })
  @ApiQuery({ name: 'expiry', required: false, description: 'URL expiry in seconds (60-86400, default: 3600)' })
  async getUploadUrl(
    @Query('bucket') bucket: string,
    @Query('path') path: string,
    @Query('expiry') expiry?: string,
  ): Promise<{ url: string }> {
    this.validateUserFacingBucket(bucket);
    const expiryNum = expiry ? parseInt(expiry, 10) : 3600;
    if (isNaN(expiryNum) || expiryNum < 60 || expiryNum > 86400) {
      throw new BadRequestException('expiry must be between 60 and 86400 seconds');
    }
    const url = await this.minioService.getPresignedUploadUrl(bucket, path, expiryNum);
    return { url };
  }
}
