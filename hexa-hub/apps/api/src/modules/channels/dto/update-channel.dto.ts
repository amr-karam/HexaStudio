import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ChannelType } from '../entities/channel.entity';

export class UpdateChannelDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ChannelType)
  type?: ChannelType;
}