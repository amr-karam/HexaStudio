import { Controller, Post, Body, Get, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RegisterDto, LoginDto } from '../auth/dto/auth.dto';
import { AuthService } from '../auth/auth.service';

@ApiTags('Mobile')
@Controller({ path: 'mobile', version: ['1', VERSION_NEUTRAL] })
export class MobileApiController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user (mobile)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.username, body.password);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with credentials (mobile)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.identifier, body.password);
  }

  @Get('health')
  @ApiOperation({ summary: 'Mobile API health check' })
  healthCheck(): string {
    return 'Mobile API active';
  }
}