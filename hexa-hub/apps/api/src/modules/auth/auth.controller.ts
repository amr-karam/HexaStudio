import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EnableTwoFactorDto } from './dto/enable-2fa.dto';
import { VerifyTwoFactorDto } from './dto/verify-2fa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  // ─── Two-Factor Authentication ───────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generateTwoFactor(@Req() req: AuthenticatedRequest) {
    const { secret, otpauth_url, qrCode } =
      await this.authService.generateTwoFactorSecret(req.user.id);

    // Save the secret to the user (not enabled yet)
    await this.authService.setTwoFactorSecret(req.user.id, secret);

    return {
      secret,
      otpauth_url,
      qrCode,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  async enableTwoFactor(
    @Req() req: AuthenticatedRequest,
    @Body() body: EnableTwoFactorDto,
  ) {
    return this.authService.enableTwoFactor(req.user.id, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(@Req() req: AuthenticatedRequest) {
    return this.authService.disableTwoFactor(req.user.id);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyTwoFactor(@Body() body: VerifyTwoFactorDto) {
    return this.authService.verifyTwoFactorAndLogin(
      body.userId,
      body.tempToken,
      body.token,
    );
  }
}
