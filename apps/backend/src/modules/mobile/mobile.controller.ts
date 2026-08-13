import { Controller, Post, Body, Get, UseGuards, VERSION_NEUTRAL, Request, UsePipes } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  RegisterDtoClass as RegisterDto, 
  LoginDtoClass as LoginDto, 
  RegisterSchema,
  LoginSchema
} from '../auth/dto/auth.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MobileApiService } from './mobile.service';
import { RegisterPushTokenDto } from './dto/push-token.dto';
import type { User } from '@hexastudio/types';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('Mobile')
@Controller({ path: 'mobile', version: ['1', VERSION_NEUTRAL] })
export class MobileApiController {
  constructor(
    private authService: AuthService,
    private mobileService: MobileApiService,
  ) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user (mobile)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
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
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.identifier, body.password);
  }

  @Post('push/register')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register Expo push token for the authenticated user' })
  @ApiBody({ type: RegisterPushTokenDto })
  @ApiResponse({ status: 200, description: 'Push token registered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async registerPushToken(
    @Request() req: { user: User },
    @Body() body: RegisterPushTokenDto,
  ) {
    return this.mobileService.registerPushToken(req.user, body.token, body.platform);
  }

  @Get('health')
  @ApiOperation({ summary: 'Mobile API health check' })
  healthCheck(): string {
    return 'Mobile API active';
  }
}