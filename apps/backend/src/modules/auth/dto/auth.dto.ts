import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// --- Register ---
export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(12).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export class RegisterDtoClass {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'johndoe' })
  username!: string;

  @ApiProperty({ example: 'SecureP@ss1234' })
  password!: string;
}

// --- Login ---
export const LoginSchema = z.object({
  identifier: z.string().max(100),
  password: z.string().max(100),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export class LoginDtoClass {
  @ApiProperty({ example: 'user@example.com' })
  identifier!: string;

  @ApiProperty()
  password!: string;
}

// --- RefreshToken ---
export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export class RefreshTokenDtoClass {
  @ApiProperty()
  refreshToken!: string;
}

// --- ForgotPassword ---
export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export class ForgotPasswordDtoClass {
  @ApiProperty()
  email!: string;
}

// --- ResetPassword ---
export const ResetPasswordSchema = z.object({
  code: z.string(),
  password: z.string().min(12).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'),
  passwordConfirmation: z.string().min(12).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export class ResetPasswordDtoClass {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  password!: string;

  @ApiProperty()
  passwordConfirmation!: string;
}

// --- ChangePassword ---
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(12).max(100),
  newPassword: z.string().min(12).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export class ChangePasswordDtoClass {
  @ApiProperty()
  currentPassword!: string;

  @ApiProperty()
  newPassword!: string;
}
