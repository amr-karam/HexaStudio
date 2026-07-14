import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '@hexastudio/types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CsrfGuard, generateCsrfToken, CSRF_COOKIE_NAME } from './guards/csrf.guard';

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}

class LoginDto {
  @IsString()
  @MaxLength(100)
  identifier!: string;

  @IsString()
  @MaxLength(100)
  password!: string;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes (matches access token TTL)
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: User }> {
    const result = await this.authService.register(body.email, body.username, body.password);
    res.cookie('auth_token', result.jwt, COOKIE_OPTIONS);
    const csrfToken = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, { ...COOKIE_OPTIONS, httpOnly: false });
    return { user: result.user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: User }> {
    const result = await this.authService.login(body.identifier, body.password);
    res.cookie('auth_token', result.jwt, COOKIE_OPTIONS);
    const csrfToken = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, { ...COOKIE_OPTIONS, httpOnly: false });
    return { user: result.user };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: { user: User }): Promise<User> {
    return req.user;
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async refresh(
    @Request() req: { user: User },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: User }> {
    const result = await this.authService.refreshToken(req.user.id);
    res.cookie('auth_token', result.jwt, COOKIE_OPTIONS);
    return { user: result.user };
  }

  @Post('logout')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Logout (clear cookie)' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  @ApiResponse({ status: 403, description: 'CSRF token mismatch' })
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ success: boolean }> {
    res.clearCookie('auth_token', { path: '/' });
    res.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
    return { success: true };
  }
}
