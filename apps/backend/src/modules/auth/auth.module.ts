import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SecurityModule } from '../security/security.module';
import { RedisModule } from '../storage/redis.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { getEnv } from '../../config/env';
import { UsersModule } from '../users/users.module';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });
const jwtModule = JwtModule.registerAsync({
  useFactory: () => {
    const env = getEnv();
    return {
      publicKey: env.JWT_PUBLIC_KEY,
      privateKey: env.JWT_PRIVATE_KEY,
      signOptions: { expiresIn: '7d', algorithm: 'RS256' },
    };
  },
});

@Global()
@Module({
  imports: [HttpModule, UsersModule, SecurityModule, RedisModule, passportModule, jwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, JwtStrategy, passportModule, jwtModule],
})
export class AuthModule {}
