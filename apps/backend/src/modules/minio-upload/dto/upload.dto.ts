import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UploadDto {
  @IsString()
  filename: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  taskId?: number;
}
