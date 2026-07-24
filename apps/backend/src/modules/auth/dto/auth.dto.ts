import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @ApiProperty({ example: 'SecureP@ss1234' })
  @IsString()
  @MinLength(12)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @MaxLength(100)
  identifier!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  password!: string;
}
