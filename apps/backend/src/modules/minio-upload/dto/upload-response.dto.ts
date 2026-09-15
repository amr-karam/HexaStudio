import { ApiProperty } from '@nestjs/swagger';
import { UploadMetadata } from '../interfaces/upload-metadata.interface';

export class UploadResponseDto {
  @ApiProperty({ description: 'Presigned PUT URL for direct MinIO upload' })
  uploadUrl: string;

  @ApiProperty({ description: 'MinIO object key (path in bucket)' })
  key: string;

  @ApiProperty({ description: 'URL expiry in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'Upload metadata' })
  metadata: UploadMetadata;
}
