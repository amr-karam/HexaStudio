import { IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Vector3Dto {
  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;

  @IsNumber()
  z!: number;
}

export class SyncStateDto {
  @IsString()
  projectId!: string;

  @ValidateNested()
  @Type(() => Vector3Dto)
  position!: Vector3Dto;

  @ValidateNested()
  @Type(() => Vector3Dto)
  rotation!: Vector3Dto;

  @IsOptional()
  @IsString()
  activeElementId?: string;
}

export class PresenceDto {
  @IsString()
  projectId!: string;

  @IsString()
  userName!: string;

  @IsOptional()
  @IsString()
  userRole?: string;
}
