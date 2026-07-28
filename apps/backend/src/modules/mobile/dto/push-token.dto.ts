import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Expo push token (ExponentPushToken[...])' })
  @IsString()
  token!: string;

  @ApiProperty({ description: 'Device platform', enum: ['ios', 'android', 'web'] })
  @IsOptional()
  @IsIn(['ios', 'android', 'web'])
  platform?: 'ios' | 'android' | 'web';
}
