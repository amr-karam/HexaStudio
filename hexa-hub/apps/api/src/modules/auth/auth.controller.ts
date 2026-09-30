import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EnableTwoFactorDto } from './dto/enable-2fa.dto';
import { VerifyTwoFactorDto } from './dto/verify-2fa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';

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
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);

    if ('requiresTwoFactor' in result) {
      return result;
    }

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  // ─── Refresh Token ──────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token required');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: result.access_token };
  }

  // ─── Logout ─────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken');
    return { success: true };
  }

  // ─── Two-Factor Authentication ───────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generateTwoFactor(@Req() req: AuthenticatedRequest) {
    const { secret, otpauth_url, qrCode } =
      await this.authService.generateTwoFactorSecret(req.user.id);

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
  async verifyTwoFactor(
    @Body() body: VerifyTwoFactorDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyTwoFactorAndLogin(
      body.userId,
      body.tempToken,
      body.token,
    );

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: result.access_token,
      user: result.user,
    };
  }
}
