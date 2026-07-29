import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnableTwoFactorDto {
  @ApiProperty({
    description: '6-digit TOTP verification code from authenticator app',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  token: string;
}
