import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('mobile')
export class MobileApiController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post('register')
  async register(@Body() body: { email: string, username: string, password: string }) {
    return this.authService.register(body.email, body.username, body.password);
  }

  @Post('login')
  async login(@Body() body: { identifier: string, password: string }) {
    return this.authService.login(body.identifier, body.password);
  }

  @Get('health')
  healthCheck(): string {
    return 'Mobile API active';
  }
}