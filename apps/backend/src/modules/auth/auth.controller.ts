import { Controller, Post, Body, Get, UseGuards, Request, Res, Headers, UnauthorizedException, VERSION_NEUTRAL, UsePipes } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import type { User } from '@hexastudio/types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CsrfGuard, generateCsrfToken, CSRF_COOKIE_NAME } from './guards/csrf.guard';
import { 
  RegisterDtoClass as RegisterDto, 
  LoginDtoClass as LoginDto, 
  RefreshTokenDtoClass as RefreshTokenDto, 
  ForgotPasswordDtoClass as ForgotPasswordDto, 
  ResetPasswordDtoClass as ResetPasswordDto, 
  ChangePasswordDtoClass as ChangePasswordDto,
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema
} from './dto/auth.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SecurityAuditService } from '../security/security-audit.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60 * 1000,
};

// Refresh token lives in an httpOnly cookie (30d, mirrors server-side TTL in
// AuthService). The JSON body still carries it for native/mobile clients that
// cannot use cookies; web clients must prefer the cookie and never store the
// body value in JS-accessible state.
const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

@ApiTags('Auth')
@Controller({ path: 'auth', version: ['1', VERSION_NEUTRAL] })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly securityAuditService: SecurityAuditService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(body.email, body.username, body.password);
    res.cookie('auth_token', result.accessToken, COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    const csrfToken = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, csrfToken, { ...COOKIE_OPTIONS, httpOnly: false });
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.login(body.identifier, body.password);
      res.cookie('auth_token', result.accessToken, COOKIE_OPTIONS);
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
      const csrfToken = generateCsrfToken();
      res.cookie(CSRF_COOKIE_NAME, csrfToken, { ...COOKIE_OPTIONS, httpOnly: false });
      
      this.securityAuditService.logEvent({
        type: 'LOGIN_SUCCESS',
        userId: result.user.id,
        details: { identifier: body.identifier },
      });
      
      return { user: result.user, accessToken: result.accessToken };
    } catch (error) {
      this.securityAuditService.logEvent({
        type: 'LOGIN_FAILURE',
        details: { identifier: body.identifier },
      });
      throw error;
    }
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
  @ApiOperation({ summary: 'Refresh JWT token (cookie-based, legacy)' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async refresh(
    @Request() req: { user: User; accessToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refreshTokens(req.accessToken ?? '');
    res.cookie('auth_token', result.accessToken, COOKIE_OPTIONS);
    return { user: result.user };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh JWT using refresh token (mobile-friendly)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @UsePipes(new ZodValidationPipe(RefreshTokenSchema))
  async refreshToken(
    @Body() body: RefreshTokenDto,
    @Request() req: { cookies?: Record<string, string | undefined> },
    @Res({ passthrough: true }) res: Response,
  ) {
    // Cookie-first (web), body fallback (native/mobile). The Zod schema leaves
    // the body field optional so cookie-only callers pass validation.
    const presented = req.cookies?.[REFRESH_COOKIE_NAME] ?? body.refreshToken;
    if (!presented) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const result = await this.authService.refreshTokens(presented);
    res.cookie('auth_token', result.accessToken, COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user: result.user };
  }

  @Post('logout')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  @ApiResponse({ status: 403, description: 'CSRF token mismatch' })
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') authHeader: string,
    @Request() req: { cookies?: Record<string, string | undefined> },
    @Body() body?: { refreshToken?: string },
  ) {
    const accessToken = authHeader?.replace('Bearer ', '') ?? '';
    const presented = req.cookies?.[REFRESH_COOKIE_NAME] ?? body?.refreshToken;
    await this.authService.logout(accessToken, presented);
    res.clearCookie('auth_token', { path: '/' });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
    res.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
    return { success: true };
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  @ApiResponse({ status: 400, description: 'Failed to send email' })
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @ApiOperation({ summary: 'Reset password with code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Failed to reset password' })
  @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.code, body.password, body.passwordConfirmation);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (authenticated user)' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed, new tokens issued' })
  @ApiResponse({ status: 400, description: 'Failed to change password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ZodValidationPipe(ChangePasswordSchema))
  async changePassword(
    @Request() req: { user: User },
    @Body() body: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
    res.cookie('auth_token', result.accessToken, COOKIE_OPTIONS);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return { user: result.user, accessToken: result.accessToken };
  }
}
