import { Controller, Post, Body, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Mobile')
@Controller({ path: 'mobile', version: ['1', VERSION_NEUTRAL] })
export class MobileApiController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (mobile)' })
  async register(@Body() body: { email: string, username: string, password: string }) {
    return this.authService.register(body.email, body.username, body.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with credentials (mobile)' })
  async login(@Body() body: { identifier: string, password: string }) {
    return this.authService.login(body.identifier, body.password);
  }

  @Get('health')
  @ApiOperation({ summary: 'Mobile API health check' })
  healthCheck(): string {
    return 'Mobile API active';
  }
}